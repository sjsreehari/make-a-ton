# Domain Events Catalog (EVENTS.md)

BillPilot uses a dual dispatch system:
1. Synchronous in-process events via `@nestjs/event-emitter`
2. Durable asynchronous background queue via BullMQ (`domain-events` queue)

## Event Registry

| Event Name | Producer | Consumers | Payload Description |
|------------|----------|-----------|---------------------|
| `subscription.activated` | `SubscriptionService` | `NotificationService`, `AuditService` | `subscriptionId`, `customerId`, `number`, `expiryDate` |
| `subscription.expiring` | `SubscriptionCron` | `NotificationService` (WhatsApp alert) | `subscriptionId`, `customerId`, `number`, `expiryDate` |
| `subscription.closed` | `SubscriptionService` | `AuditService`, `MrrService` | `subscriptionId`, `customerId`, `reason` |
| `invoice.generated` | `InvoiceService` | `AuditService` | `invoiceId`, `subscriptionId`, `customerId`, `number`, `total`, `dueDate` |
| `invoice.confirmed` | `InvoiceService` | `NotificationService` (WhatsApp PDF + Pay link) | `invoiceId`, `subscriptionId`, `customerId`, `number`, `total`, `dueDate` |
| `invoice.paid` | `InvoiceService` / `PaymentsService` | `NotificationService` (Receipt), `ReportsService` | `invoiceId`, `subscriptionId`, `customerId`, `number`, `total` |
| `invoice.overdue` | `OverdueCron` | `DunningService`, `PaymentRescueService` | `invoiceId`, `customerId`, `number`, `daysOverdue` |
| `payment.recorded` | `PaymentsService` | `InvoiceService`, `AuditService`, `CacheService` | `paymentId`, `invoiceId`, `customerId`, `amount`, `method` |
| `payment.failed` | `PaymentRescueService` | `NotificationService`, `BullMQ RescueQueue` | `invoiceId`, `customerId`, `attemptNo`, `failureKind`, `message` |
| `plan.change.requested`| `ProrationService` | `AuditService`, `CustomerNotification` | `planChangeId`, `subscriptionId`, `kind` |
