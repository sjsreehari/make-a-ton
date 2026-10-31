import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { PhoneService } from './phone.service';
import { WhatsAppGatewayService } from './whatsapp-gateway.service';
import { CommonAuditService } from '../../common/audit/audit.service';

export interface InboundMessage {
  from: string;
  body: string;
  messageId?: string;
  rawPayload?: Record<string, unknown>;
}

@Injectable()
export class WhatsAppBotService {
  private readonly logger = new Logger(WhatsAppBotService.name);

  // Intent classifier hook registered by D (AI module)
  private aiIntentHook: ((text: string, context?: unknown) => Promise<string | null>) | null = null;

  constructor(
    private readonly prisma: PrismaService,
    private readonly phoneService: PhoneService,
    private readonly waGateway: WhatsAppGatewayService,
    private readonly audit: CommonAuditService,
  ) {}

  /**
   * Register AI intent classifier hook from AI module
   */
  registerIntentHook(hook: (text: string, context?: unknown) => Promise<string | null>) {
    this.aiIntentHook = hook;
    this.logger.log('AI Intent Classifier hook registered for WhatsApp bot');
  }

  /**
   * Process inbound WhatsApp webhook message
   */
  async handleInbound(message: InboundMessage): Promise<{ replySent: boolean; action?: string }> {
    const rawFrom = message.from.replace('whatsapp:', '');
    const normalizedPhone = this.phoneService.normalize(rawFrom);
    const body = (message.body || '').trim();

    this.logger.log(`Inbound WhatsApp message from ${normalizedPhone}: "${body}"`);

    // 1. Look up User / Customer by phone number
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [
          { phone: normalizedPhone },
          { customer: { phone: normalizedPhone } },
        ],
      },
      include: { customer: true },
    });

    // 2. Unknown or unverified phone owner: send generic response, never reveal customer data
    if (!user || !user.customer) {
      const genericReply =
        `Hello! 👋 Thank you for messaging BillPilot.\n\n` +
        `This phone number is not linked to an active customer account. ` +
        `Please log in to your account at http://localhost:3000 to verify your phone number, ` +
        `or contact our support team at support@brightloop.test.`;

      await this.waGateway.sendText(normalizedPhone, genericReply);
      return { replySent: true, action: 'UNVERIFIED_GENERIC_REPLY' };
    }

    const customer = user.customer;

    // 3. Find or create session
    let session = await this.prisma.whatsAppSession.findUnique({
      where: { phone: normalizedPhone },
    });

    if (!session) {
      session = await this.prisma.whatsAppSession.create({
        data: {
          phone: normalizedPhone,
          customerId: customer.id,
          verifiedAt: new Date(),
        },
      });
    }

    const upperText = body.toUpperCase();
    const sessionContext = (session.context as Record<string, any>) || {};

    // 4. Handle Pending Confirmations (YES / NO)
    if (sessionContext.pendingAction) {
      if (upperText === 'YES' || upperText === 'CONFIRM') {
        const result = await this.executeConfirmedAction(sessionContext, customer.id, user.id);
        await this.prisma.whatsAppSession.update({
          where: { id: session.id },
          data: { context: {} },
        });
        await this.waGateway.sendText(normalizedPhone, result);
        return { replySent: true, action: `CONFIRMED_${sessionContext.pendingAction}` };
      } else if (upperText === 'NO' || upperText === 'CANCEL') {
        await this.prisma.whatsAppSession.update({
          where: { id: session.id },
          data: { context: {} },
        });
        await this.waGateway.sendText(
          normalizedPhone,
          'Operation cancelled. Let us know if you need anything else! Reply *HELP* for options.',
        );
        return { replySent: true, action: 'CANCELLED_PENDING_ACTION' };
      }
    }

    // 5. Keyword Router
    let reply = '';
    let detectedAction = 'UNKNOWN';

    if (upperText === 'BALANCE' || upperText === 'BAL') {
      detectedAction = 'BALANCE';
      reply = await this.handleBalanceQuery(customer.id);
    } else if (upperText === 'INVOICE' || upperText === 'BILL') {
      detectedAction = 'INVOICE';
      reply = await this.handleInvoiceQuery(customer.id);
    } else if (upperText === 'PAUSE') {
      detectedAction = 'PROMPT_PAUSE';
      const promptResult = await this.promptPauseSubscription(customer.id, session.id);
      reply = promptResult.message;
    } else if (upperText === 'RENEW') {
      detectedAction = 'RENEW';
      reply = await this.handleRenewSubscription(customer.id);
    } else if (upperText === 'CANCEL') {
      detectedAction = 'PROMPT_CANCEL';
      const promptResult = await this.promptCancelSubscription(customer.id, session.id);
      reply = promptResult.message;
    } else if (upperText === 'HELP' || upperText === 'HI' || upperText === 'HELLO') {
      detectedAction = 'HELP';
      reply = this.getHelpMenu(customer.name);
    } else {
      // 6. Try AI Intent Hook if keywords don't match
      let aiHandled = false;
      if (this.aiIntentHook) {
        try {
          const aiReply = await this.aiIntentHook(body, { customerId: customer.id, phone: normalizedPhone });
          if (aiReply) {
            reply = aiReply;
            detectedAction = 'AI_INTENT';
            aiHandled = true;
          }
        } catch (err: unknown) {
          this.logger.warn(`AI intent hook error: ${(err as Error).message}`);
        }
      }

      if (!aiHandled) {
        detectedAction = 'FALLBACK';
        reply =
          `I didn't quite catch that. Here is what I can help you with:\n\n` +
          this.getHelpMenu(customer.name);
      }
    }

    // Update last intent
    await this.prisma.whatsAppSession.update({
      where: { id: session.id },
      data: {
        lastIntent: detectedAction,
        updatedAt: new Date(),
      },
    });

    await this.waGateway.sendText(normalizedPhone, reply);
    return { replySent: true, action: detectedAction };
  }

  private async handleBalanceQuery(customerId: string): Promise<string> {
    const overdueInvoices = await this.prisma.invoice.findMany({
      where: {
        customerId,
        status: { in: ['CONFIRMED', 'DRAFT'] },
      },
      select: {
        number: true,
        amountDue: true,
        dueDate: true,
      },
    });

    const customer = await this.prisma.customer.findUnique({
      where: { id: customerId },
      select: { creditBalance: true },
    });

    const totalDue = overdueInvoices.reduce(
      (sum, inv) => sum + Number(inv.amountDue),
      0,
    );

    if (totalDue === 0) {
      return (
        `✨ *All Clear!*\n\nYou have no pending payments. Your account balance is up to date.\n` +
        `Available Credit: ₹${customer?.creditBalance || '0.00'}`
      );
    }

    let msg = `💰 *Account Balance Summary*\n\nTotal Outstanding Due: *₹${totalDue.toFixed(2)}*\n\nPending Invoices:`;
    for (const inv of overdueInvoices.slice(0, 3)) {
      msg += `\n• *${inv.number}*: ₹${Number(inv.amountDue).toFixed(2)} (Due: ${new Date(inv.dueDate).toLocaleDateString('en-IN')})`;
    }

    msg += `\n\nReply *INVOICE* to get your payment link.`;
    return msg;
  }

  private async handleInvoiceQuery(customerId: string): Promise<string> {
    const latestInvoice = await this.prisma.invoice.findFirst({
      where: { customerId },
      orderBy: { createdAt: 'desc' },
      include: { subscription: { include: { plan: true } } },
    });

    if (!latestInvoice) {
      return `You have no invoices generated on your account yet.`;
    }

    const paylink = await this.prisma.paymentLink.findFirst({
      where: { invoiceId: latestInvoice.id },
    });

    const paymentUrl = paylink?.shortUrl || `http://localhost:3000/my/invoices`;

    return (
      `📄 *Latest Invoice Details*\n\n` +
      `Invoice: *${latestInvoice.number}*\n` +
      `Plan: ${latestInvoice.subscription?.plan?.name || 'Subscription'}\n` +
      `Amount: *₹${Number(latestInvoice.total).toFixed(2)}*\n` +
      `Status: *${latestInvoice.status}*\n` +
      `Due Date: ${new Date(latestInvoice.dueDate).toLocaleDateString('en-IN')}\n\n` +
      `🔗 *Payment Link:* ${paymentUrl}`
    );
  }

  private async promptPauseSubscription(customerId: string, sessionId: string) {
    const activeSub = await this.prisma.subscription.findFirst({
      where: { customerId, status: 'ACTIVE', isPaused: false },
      include: { plan: true },
    });

    if (!activeSub) {
      return {
        message: 'No active subscription found on your account that can be paused.',
      };
    }

    if (!activeSub.plan.pausable) {
      return {
        message: `Your current plan (*${activeSub.plan.name}*) does not support temporary pause. Please contact customer support.`,
      };
    }

    // Save pending pause state
    await this.prisma.whatsAppSession.update({
      where: { id: sessionId },
      data: {
        context: {
          pendingAction: 'PAUSE',
          subscriptionId: activeSub.id,
          subscriptionNumber: activeSub.number,
        },
      },
    });

    return {
      message:
        `⚠️ *Confirm Subscription Pause*\n\n` +
        `Are you sure you want to pause subscription *${activeSub.number}* (${activeSub.plan.name})? Billing will be temporarily held.\n\n` +
        `Reply *YES* to confirm or *NO* to cancel.`,
    };
  }

  private async promptCancelSubscription(customerId: string, sessionId: string) {
    const activeSub = await this.prisma.subscription.findFirst({
      where: { customerId, status: 'ACTIVE' },
      include: { plan: true },
    });

    if (!activeSub) {
      return { message: 'No active subscription found to cancel.' };
    }

    await this.prisma.whatsAppSession.update({
      where: { id: sessionId },
      data: {
        context: {
          pendingAction: 'CANCEL',
          subscriptionId: activeSub.id,
          subscriptionNumber: activeSub.number,
        },
      },
    });

    return {
      message:
        `⚠️ *Confirm Cancellation*\n\n` +
        `Are you sure you want to cancel subscription *${activeSub.number}*? Your service will stop at the end of the billing period.\n\n` +
        `Reply *YES* to confirm or *NO* to cancel.`,
    };
  }

  private async handleRenewSubscription(customerId: string): Promise<string> {
    const sub = await this.prisma.subscription.findFirst({
      where: { customerId, status: { in: ['ACTIVE', 'CONFIRMED'] } },
      include: { plan: true },
    });

    if (!sub) {
      return 'No active subscription found on your account.';
    }

    if (!sub.plan.renewable) {
      return `Your plan (*${sub.plan.name}*) cannot be renewed automatically. Please contact our staff.`;
    }

    // Extend expiry date by 1 billing period
    const currentExpiry = sub.expiryDate || new Date();
    const newExpiry = new Date(currentExpiry);
    newExpiry.setMonth(newExpiry.getMonth() + 1);

    await this.prisma.subscription.update({
      where: { id: sub.id },
      data: { expiryDate: newExpiry },
    });

    await this.audit.log({
      actor: { id: customerId, role: 'CUSTOMER' },
      entity: 'Subscription',
      entityId: sub.id,
      action: 'SUBSCRIPTION_RENEWED_VIA_WHATSAPP',
      after: { newExpiry },
    });

    return `🎉 *Subscription Renewed!*\n\nYour subscription *${sub.number}* has been renewed until *${newExpiry.toLocaleDateString('en-IN')}*.`;
  }

  private async executeConfirmedAction(
    context: Record<string, any>,
    customerId: string,
    userId: string,
  ): Promise<string> {
    const { pendingAction, subscriptionId, subscriptionNumber } = context;

    if (pendingAction === 'PAUSE') {
      await this.prisma.subscription.update({
        where: { id: subscriptionId },
        data: {
          isPaused: true,
          pausedAt: new Date(),
        },
      });

      await this.audit.log({
        actor: { id: userId, role: 'CUSTOMER', customerId },
        entity: 'Subscription',
        entityId: subscriptionId,
        action: 'SUBSCRIPTION_PAUSED_VIA_WHATSAPP',
      });

      return `⏸️ *Subscription Paused*\n\nSubscription *${subscriptionNumber}* is now paused. Billing is suspended. Type *HELP* anytime to resume.`;
    }

    if (pendingAction === 'CANCEL') {
      await this.prisma.subscription.update({
        where: { id: subscriptionId },
        data: {
          status: 'CLOSED',
          closedAt: new Date(),
          closeReason: 'Cancelled by customer via WhatsApp bot',
        },
      });

      await this.audit.log({
        actor: { id: userId, role: 'CUSTOMER', customerId },
        entity: 'Subscription',
        entityId: subscriptionId,
        action: 'SUBSCRIPTION_CANCELLED_VIA_WHATSAPP',
      });

      return `🛑 *Subscription Cancelled*\n\nSubscription *${subscriptionNumber}* has been closed. Thank you for your past business with Brightloop!`;
    }

    return 'Action could not be executed.';
  }

  private getHelpMenu(name: string): string {
    return (
      `Hi ${name}! Here are the commands you can send me:\n\n` +
      `• *BALANCE* — Check outstanding amount due\n` +
      `• *INVOICE* — View latest invoice & pay link\n` +
      `• *PAUSE* — Temporarily pause subscription\n` +
      `• *RENEW* — Extend subscription renewal\n` +
      `• *CANCEL* — Cancel subscription\n` +
      `• *HELP* — Show this menu`
    );
  }
}
