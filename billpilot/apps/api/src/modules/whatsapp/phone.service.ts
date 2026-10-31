import { Injectable, BadRequestException, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CacheService } from '../../common/redis/cache.service';
import { WhatsAppGatewayService } from './whatsapp-gateway.service';

@Injectable()
export class PhoneService {
  private readonly logger = new Logger(PhoneService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly cache: CacheService,
    private readonly waGateway: WhatsAppGatewayService,
  ) {}

  /**
   * Normalizes a phone number to standard E.164 format.
   * Defaults to +91 (India) if 10 digits provided.
   */
  normalize(rawPhone: string): string {
    if (!rawPhone) return '';
    // Strip non-digits except leading +
    let cleaned = rawPhone.trim().replace(/[^\d+]/g, '');

    if (cleaned.startsWith('+')) {
      return cleaned;
    }

    if (cleaned.startsWith('0')) {
      cleaned = cleaned.substring(1);
    }

    // Standard 10-digit Indian phone number
    if (cleaned.length === 10) {
      return `+91${cleaned}`;
    }

    // 12-digit Indian number without +
    if (cleaned.length === 12 && cleaned.startsWith('91')) {
      return `+${cleaned}`;
    }

    return `+${cleaned}`;
  }

  /**
   * Generates a 6-digit OTP and sends it to the user's phone via WhatsApp
   */
  async requestVerification(userId: string, rawPhone: string) {
    const phone = this.normalize(rawPhone);
    if (!phone || phone.length < 10) {
      throw new BadRequestException('Please provide a valid phone number');
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const cacheKey = `wa_otp_${userId}`;

    // Store in Redis with 10 minute expiry
    await this.cache.set(cacheKey, { otp, phone }, 600);

    // Send OTP via WhatsApp
    const message = `🔐 *BillPilot Verification Code*\n\nYour 6-digit verification code is: *${otp}*\n\nThis code is valid for 10 minutes. Do not share it with anyone.`;
    await this.waGateway.sendText(phone, message);

    this.logger.log(`OTP generated for user ${userId} to phone ${phone}`);
    return {
      success: true,
      phone,
      message: 'Verification code sent via WhatsApp',
      // In non-prod dev mode, include OTP for automated tests
      devOtp: process.env.NODE_ENV !== 'production' ? otp : undefined,
    };
  }

  /**
   * Confirms OTP and links verified phone to User and WhatsAppSession
   */
  async confirmVerification(userId: string, otpInput: string) {
    const cacheKey = `wa_otp_${userId}`;
    const cached = await this.cache.get<{ otp: string; phone: string }>(cacheKey);

    if (!cached || cached.otp !== otpInput.trim()) {
      throw new BadRequestException('Invalid or expired verification code');
    }

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const normalizedPhone = cached.phone;

    // Update User
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        phone: normalizedPhone,
        whatsappOptIn: true,
      },
    });

    // Update Customer phone if attached
    if (user.customerId) {
      await this.prisma.customer.update({
        where: { id: user.customerId },
        data: { phone: normalizedPhone },
      });
    }

    // Upsert WhatsApp session
    await this.prisma.whatsAppSession.upsert({
      where: { phone: normalizedPhone },
      update: {
        customerId: user.customerId,
        verifiedAt: new Date(),
        updatedAt: new Date(),
      },
      create: {
        phone: normalizedPhone,
        customerId: user.customerId,
        verifiedAt: new Date(),
      },
    });

    await this.cache.del(cacheKey);

    // Send confirmation message
    await this.waGateway.sendText(
      normalizedPhone,
      `🎉 *Phone Verified!*\n\nHi ${user.name}, your phone is now linked to your BillPilot account. You will receive invoices and payment receipts here.\n\nType *HELP* anytime to view account commands.`,
    );

    return {
      success: true,
      message: 'Phone verified and WhatsApp notifications enabled',
      phone: normalizedPhone,
    };
  }

  /**
   * Opt-in or opt-out of WhatsApp notifications
   */
  async setOptIn(userId: string, optIn: boolean) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    await this.prisma.user.update({
      where: { id: userId },
      data: { whatsappOptIn: optIn },
    });

    return {
      success: true,
      whatsappOptIn: optIn,
      message: optIn
        ? 'WhatsApp notifications enabled.'
        : 'WhatsApp notifications paused.',
    };
  }
}
