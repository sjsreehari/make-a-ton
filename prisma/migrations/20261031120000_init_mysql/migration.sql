-- CreateTable
CREATE TABLE `User` (
    `id` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `passwordHash` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NULL,
    `role` ENUM('ADMIN', 'STAFF', 'CUSTOMER') NOT NULL DEFAULT 'CUSTOMER',
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `emailVerified` BOOLEAN NOT NULL DEFAULT false,
    `whatsappOptIn` BOOLEAN NOT NULL DEFAULT false,
    `customerId` VARCHAR(191) NULL,
    `createdById` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `User_email_key`(`email`),
    UNIQUE INDEX `User_customerId_key`(`customerId`),
    INDEX `User_role_idx`(`role`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Customer` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NULL,
    `company` VARCHAR(191) NULL,
    `gstin` VARCHAR(191) NULL,
    `billingAddress` JSON NULL,
    `currency` VARCHAR(191) NOT NULL DEFAULT 'INR',
    `creditBalance` DECIMAL(14, 2) NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `Customer_email_idx`(`email`),
    INDEX `Customer_name_idx`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PasswordResetToken` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `tokenHash` VARCHAR(191) NOT NULL,
    `expiresAt` DATETIME(3) NOT NULL,
    `usedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `PasswordResetToken_tokenHash_key`(`tokenHash`),
    INDEX `PasswordResetToken_userId_idx`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `RefreshToken` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `tokenHash` VARCHAR(191) NOT NULL,
    `expiresAt` DATETIME(3) NOT NULL,
    `revokedAt` DATETIME(3) NULL,

    UNIQUE INDEX `RefreshToken_tokenHash_key`(`tokenHash`),
    INDEX `RefreshToken_userId_idx`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Product` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `type` ENUM('SOFTWARE', 'SERVICE', 'ADDON', 'SUPPORT') NOT NULL,
    `salesPrice` DECIMAL(14, 2) NOT NULL,
    `costPrice` DECIMAL(14, 2) NOT NULL,
    `notes` TEXT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `taxRuleId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `Product_name_idx`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Variant` (
    `id` VARCHAR(191) NOT NULL,
    `productId` VARCHAR(191) NOT NULL,
    `attribute` VARCHAR(100) NOT NULL,
    `value` VARCHAR(100) NOT NULL,
    `extraPrice` DECIMAL(14, 2) NOT NULL,

    UNIQUE INDEX `Variant_productId_attribute_value_key`(`productId`, `attribute`, `value`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Plan` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `price` DECIMAL(14, 2) NOT NULL,
    `billingPeriod` ENUM('DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY') NOT NULL,
    `minQuantity` INTEGER NOT NULL DEFAULT 1,
    `availableFrom` DATETIME(3) NULL,
    `availableTo` DATETIME(3) NULL,
    `autoClose` BOOLEAN NOT NULL DEFAULT false,
    `closable` BOOLEAN NOT NULL DEFAULT true,
    `pausable` BOOLEAN NOT NULL DEFAULT true,
    `renewable` BOOLEAN NOT NULL DEFAULT true,
    `isActive` BOOLEAN NOT NULL DEFAULT true,

    INDEX `Plan_isActive_billingPeriod_idx`(`isActive`, `billingPeriod`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PlanProduct` (
    `planId` VARCHAR(191) NOT NULL,
    `productId` VARCHAR(191) NOT NULL,
    `quantity` INTEGER NOT NULL DEFAULT 1,

    PRIMARY KEY (`planId`, `productId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TaxRule` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `ratePercent` DECIMAL(5, 2) NOT NULL,
    `region` VARCHAR(191) NULL,
    `isInclusive` BOOLEAN NOT NULL DEFAULT false,
    `isActive` BOOLEAN NOT NULL DEFAULT true,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `QuotationTemplate` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `planId` VARCHAR(191) NOT NULL,
    `validityDays` INTEGER NOT NULL,
    `lines` JSON NOT NULL,
    `paymentTerm` ENUM('IMMEDIATE', 'NET_7', 'NET_15', 'NET_30', 'NET_60') NOT NULL DEFAULT 'NET_15',
    `isActive` BOOLEAN NOT NULL DEFAULT true,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Subscription` (
    `id` VARCHAR(191) NOT NULL,
    `number` VARCHAR(191) NOT NULL,
    `customerId` VARCHAR(191) NOT NULL,
    `planId` VARCHAR(191) NOT NULL,
    `status` ENUM('DRAFT', 'QUOTATION', 'CONFIRMED', 'ACTIVE', 'CLOSED') NOT NULL DEFAULT 'DRAFT',
    `startDate` DATETIME(3) NOT NULL,
    `expiryDate` DATETIME(3) NULL,
    `nextBillingDate` DATETIME(3) NULL,
    `remainingCycles` INTEGER NULL,
    `paymentTerm` ENUM('IMMEDIATE', 'NET_7', 'NET_15', 'NET_30', 'NET_60') NOT NULL DEFAULT 'NET_15',
    `isPaused` BOOLEAN NOT NULL DEFAULT false,
    `pausedAt` DATETIME(3) NULL,
    `closedAt` DATETIME(3) NULL,
    `closeReason` TEXT NULL,
    `notes` TEXT NULL,
    `quotationValidUntil` DATETIME(3) NULL,
    `templateId` VARCHAR(191) NULL,
    `createdById` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Subscription_number_key`(`number`),
    INDEX `Subscription_status_nextBillingDate_idx`(`status`, `nextBillingDate`),
    INDEX `Subscription_status_expiryDate_idx`(`status`, `expiryDate`),
    INDEX `Subscription_customerId_idx`(`customerId`),
    INDEX `Subscription_planId_idx`(`planId`),
    INDEX `Subscription_expiryDate_idx`(`expiryDate`),
    INDEX `Subscription_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SubscriptionLine` (
    `id` VARCHAR(191) NOT NULL,
    `subscriptionId` VARCHAR(191) NOT NULL,
    `productId` VARCHAR(191) NOT NULL,
    `variantId` VARCHAR(191) NULL,
    `description` TEXT NOT NULL,
    `quantity` INTEGER NOT NULL,
    `unitPrice` DECIMAL(14, 2) NOT NULL,
    `taxRuleId` VARCHAR(191) NULL,
    `amount` DECIMAL(14, 2) NOT NULL,

    INDEX `SubscriptionLine_subscriptionId_idx`(`subscriptionId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AuditLog` (
    `id` VARCHAR(191) NOT NULL,
    `at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `actorId` VARCHAR(191) NULL,
    `actorRole` ENUM('ADMIN', 'STAFF', 'CUSTOMER') NULL,
    `entity` VARCHAR(100) NOT NULL,
    `entityId` VARCHAR(100) NOT NULL,
    `action` VARCHAR(100) NOT NULL,
    `before` JSON NULL,
    `after` JSON NULL,
    `requestId` VARCHAR(191) NULL,

    INDEX `AuditLog_entity_entityId_idx`(`entity`, `entityId`),
    INDEX `AuditLog_at_idx`(`at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SequenceCounter` (
    `key` VARCHAR(100) NOT NULL,
    `value` INTEGER NOT NULL DEFAULT 0,

    PRIMARY KEY (`key`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Invoice` (
    `id` VARCHAR(191) NOT NULL,
    `number` VARCHAR(191) NOT NULL,
    `subscriptionId` VARCHAR(191) NOT NULL,
    `customerId` VARCHAR(191) NOT NULL,
    `status` ENUM('DRAFT', 'CONFIRMED', 'PAID', 'CANCELLED') NOT NULL DEFAULT 'DRAFT',
    `periodStart` DATETIME(3) NOT NULL,
    `periodEnd` DATETIME(3) NOT NULL,
    `issueDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `dueDate` DATETIME(3) NOT NULL,
    `currency` VARCHAR(191) NOT NULL DEFAULT 'INR',
    `subtotal` DECIMAL(14, 2) NOT NULL,
    `discountTotal` DECIMAL(14, 2) NOT NULL DEFAULT 0,
    `taxTotal` DECIMAL(14, 2) NOT NULL,
    `total` DECIMAL(14, 2) NOT NULL,
    `amountPaid` DECIMAL(14, 2) NOT NULL DEFAULT 0,
    `amountDue` DECIMAL(14, 2) NOT NULL,
    `confirmedAt` DATETIME(3) NULL,
    `paidAt` DATETIME(3) NULL,
    `cancelledAt` DATETIME(3) NULL,
    `sentAt` DATETIME(3) NULL,
    `explainer` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `Invoice_number_key`(`number`),
    INDEX `Invoice_customerId_status_idx`(`customerId`, `status`),
    INDEX `Invoice_status_dueDate_idx`(`status`, `dueDate`),
    INDEX `Invoice_subscriptionId_idx`(`subscriptionId`),
    INDEX `Invoice_issueDate_idx`(`issueDate`),
    INDEX `Invoice_periodStart_idx`(`periodStart`),
    UNIQUE INDEX `Invoice_subscriptionId_periodStart_periodEnd_key`(`subscriptionId`, `periodStart`, `periodEnd`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `InvoiceLine` (
    `id` VARCHAR(191) NOT NULL,
    `invoiceId` VARCHAR(191) NOT NULL,
    `productId` VARCHAR(191) NULL,
    `description` TEXT NOT NULL,
    `quantity` INTEGER NOT NULL,
    `unitPrice` DECIMAL(14, 2) NOT NULL,
    `lineSubtotal` DECIMAL(14, 2) NOT NULL,
    `discountAmount` DECIMAL(14, 2) NOT NULL DEFAULT 0,
    `taxRatePercent` DECIMAL(5, 2) NOT NULL,
    `taxAmount` DECIMAL(14, 2) NOT NULL,
    `lineTotal` DECIMAL(14, 2) NOT NULL,
    `kind` VARCHAR(191) NOT NULL DEFAULT 'RECURRING',

    INDEX `InvoiceLine_invoiceId_idx`(`invoiceId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Discount` (
    `id` VARCHAR(191) NOT NULL,
    `code` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `type` ENUM('FIXED', 'PERCENTAGE') NOT NULL,
    `value` DECIMAL(14, 2) NOT NULL,
    `scope` ENUM('PRODUCT', 'SUBSCRIPTION') NOT NULL,
    `productIds` JSON NULL,
    `minPurchaseAmount` DECIMAL(14, 2) NULL,
    `minQuantity` INTEGER NULL,
    `startsAt` DATETIME(3) NOT NULL,
    `endsAt` DATETIME(3) NOT NULL,
    `usageLimit` INTEGER NULL,
    `usedCount` INTEGER NOT NULL DEFAULT 0,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `minMarginPercent` DECIMAL(5, 2) NULL,

    UNIQUE INDEX `Discount_code_key`(`code`),
    INDEX `Discount_isActive_startsAt_endsAt_idx`(`isActive`, `startsAt`, `endsAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `DiscountUsage` (
    `id` VARCHAR(191) NOT NULL,
    `discountId` VARCHAR(191) NOT NULL,
    `invoiceId` VARCHAR(191) NOT NULL,
    `amount` DECIMAL(14, 2) NOT NULL,
    `at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `DiscountUsage_discountId_invoiceId_key`(`discountId`, `invoiceId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ProrationAdjustment` (
    `id` VARCHAR(191) NOT NULL,
    `subscriptionId` VARCHAR(191) NOT NULL,
    `planChangeId` VARCHAR(191) NULL,
    `fromDate` DATETIME(3) NOT NULL,
    `toDate` DATETIME(3) NOT NULL,
    `creditAmount` DECIMAL(14, 2) NOT NULL,
    `chargeAmount` DECIMAL(14, 2) NOT NULL,
    `explanation` JSON NOT NULL,
    `appliedInvoiceId` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CreditMemo` (
    `id` VARCHAR(191) NOT NULL,
    `number` VARCHAR(191) NOT NULL,
    `invoiceId` VARCHAR(191) NOT NULL,
    `amount` DECIMAL(14, 2) NOT NULL,
    `reason` TEXT NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `CreditMemo_number_key`(`number`),
    INDEX `CreditMemo_invoiceId_idx`(`invoiceId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PlanChangeRequest` (
    `id` VARCHAR(191) NOT NULL,
    `subscriptionId` VARCHAR(191) NOT NULL,
    `requestedById` VARCHAR(191) NOT NULL,
    `kind` ENUM('UPGRADE', 'DOWNGRADE', 'SEAT_CHANGE', 'PAUSE', 'RESUME', 'CANCEL') NOT NULL,
    `toPlanId` VARCHAR(191) NULL,
    `newQuantity` INTEGER NULL,
    `status` ENUM('REQUESTED', 'APPROVED', 'APPLIED', 'REJECTED') NOT NULL DEFAULT 'REQUESTED',
    `requestedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `effectiveAt` DATETIME(3) NULL,
    `previewSnapshot` JSON NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Dispute` (
    `id` VARCHAR(191) NOT NULL,
    `invoiceId` VARCHAR(191) NOT NULL,
    `raisedById` VARCHAR(191) NOT NULL,
    `reason` TEXT NOT NULL,
    `status` ENUM('OPEN', 'UNDER_REVIEW', 'RESOLVED', 'REJECTED') NOT NULL DEFAULT 'OPEN',
    `packet` JSON NULL,
    `resolution` TEXT NULL,
    `resolutionNote` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `Dispute_invoiceId_idx`(`invoiceId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Payment` (
    `id` VARCHAR(191) NOT NULL,
    `invoiceId` VARCHAR(191) NOT NULL,
    `customerId` VARCHAR(191) NOT NULL,
    `method` ENUM('CASH', 'BANK_TRANSFER', 'UPI', 'CARD', 'CHEQUE', 'RAZORPAY', 'OTHER') NOT NULL,
    `amount` DECIMAL(14, 2) NOT NULL,
    `paidAt` DATETIME(3) NOT NULL,
    `note` TEXT NULL,
    `status` ENUM('RECORDED', 'FAILED', 'REFUNDED') NOT NULL DEFAULT 'RECORDED',
    `externalRef` VARCHAR(191) NULL,
    `recordedById` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `Payment_externalRef_key`(`externalRef`),
    INDEX `Payment_invoiceId_idx`(`invoiceId`),
    INDEX `Payment_customerId_paidAt_idx`(`customerId`, `paidAt`),
    INDEX `Payment_paidAt_idx`(`paidAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PaymentAttempt` (
    `id` VARCHAR(191) NOT NULL,
    `invoiceId` VARCHAR(191) NOT NULL,
    `mandateId` VARCHAR(191) NULL,
    `attemptNo` INTEGER NOT NULL,
    `status` VARCHAR(50) NOT NULL,
    `failureKind` ENUM('EXPIRED_CARD', 'INSUFFICIENT_FUNDS', 'MANDATE_LIMIT', 'BANK_ERROR', 'GENERIC') NULL,
    `failureMessage` TEXT NULL,
    `nextRetryAt` DATETIME(3) NULL,
    `recoveredAmount` DECIMAL(14, 2) NULL,
    `at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `PaymentAttempt_invoiceId_idx`(`invoiceId`),
    INDEX `PaymentAttempt_nextRetryAt_idx`(`nextRetryAt`),
    INDEX `PaymentAttempt_status_nextRetryAt_idx`(`status`, `nextRetryAt`),
    INDEX `PaymentAttempt_invoiceId_attemptNo_idx`(`invoiceId`, `attemptNo`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `FailureReason` (
    `id` VARCHAR(191) NOT NULL,
    `kind` ENUM('EXPIRED_CARD', 'INSUFFICIENT_FUNDS', 'MANDATE_LIMIT', 'BANK_ERROR', 'GENERIC') NOT NULL,
    `code` VARCHAR(100) NOT NULL,
    `recoveryPath` TEXT NOT NULL,
    `description` TEXT NULL,
    `retryAfterHours` INTEGER NOT NULL,

    UNIQUE INDEX `FailureReason_kind_code_key`(`kind`, `code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `BankTransaction` (
    `id` VARCHAR(191) NOT NULL,
    `batchId` VARCHAR(100) NOT NULL,
    `txnDate` DATETIME(3) NOT NULL,
    `amount` DECIMAL(14, 2) NOT NULL,
    `reference` VARCHAR(191) NOT NULL,
    `narration` TEXT NULL,
    `description` TEXT NULL,
    `counterparty` VARCHAR(191) NULL,
    `status` ENUM('AUTO_MATCHED', 'NEEDS_REVIEW', 'CONFIRMED', 'REJECTED', 'UNMATCHED') NOT NULL DEFAULT 'UNMATCHED',

    INDEX `BankTransaction_batchId_idx`(`batchId`),
    INDEX `BankTransaction_status_idx`(`status`),
    INDEX `BankTransaction_amount_txnDate_idx`(`amount`, `txnDate`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ReconciliationMatch` (
    `id` VARCHAR(191) NOT NULL,
    `bankTransactionId` VARCHAR(191) NOT NULL,
    `invoiceId` VARCHAR(191) NULL,
    `paymentId` VARCHAR(191) NULL,
    `confidence` DECIMAL(4, 3) NOT NULL,
    `status` ENUM('AUTO_MATCHED', 'NEEDS_REVIEW', 'CONFIRMED', 'REJECTED', 'UNMATCHED') NOT NULL,
    `feeDetected` DECIMAL(14, 2) NULL,
    `signals` JSON NOT NULL,
    `reviewedById` VARCHAR(191) NULL,

    INDEX `ReconciliationMatch_bankTransactionId_idx`(`bankTransactionId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Mandate` (
    `id` VARCHAR(191) NOT NULL,
    `customerId` VARCHAR(191) NOT NULL,
    `method` ENUM('CASH', 'BANK_TRANSFER', 'UPI', 'CARD', 'CHEQUE', 'RAZORPAY', 'OTHER') NOT NULL,
    `maxAmount` DECIMAL(14, 2) NOT NULL,
    `frequency` VARCHAR(191) NOT NULL,
    `status` ENUM('ACTIVE', 'PAUSED', 'REVOKED', 'EXPIRED') NOT NULL DEFAULT 'ACTIVE',
    `validFrom` DATETIME(3) NOT NULL,
    `validTo` DATETIME(3) NULL,
    `externalRef` VARCHAR(191) NULL,

    INDEX `Mandate_customerId_idx`(`customerId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `NoticeLog` (
    `id` VARCHAR(191) NOT NULL,
    `mandateId` VARCHAR(191) NOT NULL,
    `invoiceId` VARCHAR(191) NULL,
    `kind` VARCHAR(191) NOT NULL,
    `sentAt` DATETIME(3) NOT NULL,
    `channel` VARCHAR(191) NOT NULL,
    `dueNoticeBy` DATETIME(3) NOT NULL,
    `compliant` BOOLEAN NOT NULL DEFAULT true,

    INDEX `NoticeLog_mandateId_idx`(`mandateId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PaymentLink` (
    `id` VARCHAR(191) NOT NULL,
    `invoiceId` VARCHAR(191) NOT NULL,
    `razorpayLinkId` VARCHAR(191) NOT NULL,
    `shortUrl` TEXT NOT NULL,
    `url` TEXT NULL,
    `amount` DECIMAL(14, 2) NOT NULL,
    `status` ENUM('CREATED', 'SENT', 'PAID', 'EXPIRED', 'CANCELLED') NOT NULL DEFAULT 'CREATED',
    `expiresAt` DATETIME(3) NULL,
    `paidAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `PaymentLink_razorpayLinkId_key`(`razorpayLinkId`),
    INDEX `PaymentLink_invoiceId_idx`(`invoiceId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `WebhookEvent` (
    `id` VARCHAR(191) NOT NULL,
    `provider` VARCHAR(100) NOT NULL,
    `eventId` VARCHAR(191) NULL,
    `payload` JSON NOT NULL,
    `processedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `WebhookEvent_provider_eventId_idx`(`provider`, `eventId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `NotificationLog` (
    `id` VARCHAR(191) NOT NULL,
    `channel` ENUM('WHATSAPP', 'EMAIL') NOT NULL,
    `template` VARCHAR(100) NOT NULL,
    `toAddress` VARCHAR(191) NOT NULL,
    `customerId` VARCHAR(191) NULL,
    `entity` VARCHAR(100) NULL,
    `entityId` VARCHAR(100) NULL,
    `payload` JSON NOT NULL,
    `status` ENUM('QUEUED', 'SENT', 'DELIVERED', 'FAILED', 'SKIPPED') NOT NULL DEFAULT 'QUEUED',
    `providerMessageId` VARCHAR(191) NULL,
    `error` TEXT NULL,
    `attempts` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `sentAt` DATETIME(3) NULL,

    INDEX `NotificationLog_customerId_createdAt_idx`(`customerId`, `createdAt`),
    INDEX `NotificationLog_status_idx`(`status`),
    INDEX `NotificationLog_entity_entityId_idx`(`entity`, `entityId`),
    UNIQUE INDEX `NotificationLog_template_entity_entityId_channel_key`(`template`, `entity`, `entityId`, `channel`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `MessageTemplate` (
    `id` VARCHAR(191) NOT NULL,
    `key` VARCHAR(100) NOT NULL,
    `channel` ENUM('WHATSAPP', 'EMAIL') NOT NULL,
    `subject` VARCHAR(191) NULL,
    `body` TEXT NOT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `MessageTemplate_key_key`(`key`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `WhatsAppSession` (
    `id` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(50) NOT NULL,
    `customerId` VARCHAR(191) NULL,
    `verifiedAt` DATETIME(3) NULL,
    `lastIntent` VARCHAR(191) NULL,
    `context` JSON NULL,
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `WhatsAppSession_phone_key`(`phone`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `LeakageFinding` (
    `id` VARCHAR(191) NOT NULL,
    `kind` ENUM('NEVER_INVOICED', 'EXPIRED_DISCOUNT_APPLIED', 'WRONG_TAX', 'EXPIRED_BUT_ACTIVE', 'STUCK_DRAFT', 'UNSENT_INVOICE') NOT NULL,
    `entity` VARCHAR(100) NOT NULL,
    `entityId` VARCHAR(100) NOT NULL,
    `amountAtRisk` DECIMAL(14, 2) NOT NULL,
    `detail` JSON NOT NULL,
    `resolvedAt` DATETIME(3) NULL,
    `detectedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `LeakageFinding_kind_entity_entityId_key`(`kind`, `entity`, `entityId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `RiskScore` (
    `id` VARCHAR(191) NOT NULL,
    `customerId` VARCHAR(191) NOT NULL,
    `score` INTEGER NOT NULL,
    `band` ENUM('LOW', 'MEDIUM', 'HIGH') NOT NULL,
    `drivers` JSON NOT NULL,
    `computedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `RiskScore_customerId_key`(`customerId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ForecastSnapshot` (
    `id` VARCHAR(191) NOT NULL,
    `month` DATETIME(3) NOT NULL,
    `expectedRevenue` DECIMAL(14, 2) NOT NULL,
    `expectedCollections` DECIMAL(14, 2) NOT NULL,
    `assumptions` JSON NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `ForecastSnapshot_month_createdAt_key`(`month`, `createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `MrrSnapshot` (
    `id` VARCHAR(191) NOT NULL,
    `month` DATETIME(3) NOT NULL,
    `mrr` DECIMAL(14, 2) NOT NULL,
    `newMrr` DECIMAL(14, 2) NOT NULL,
    `expansionMrr` DECIMAL(14, 2) NOT NULL,
    `contractionMrr` DECIMAL(14, 2) NOT NULL,
    `churnedMrr` DECIMAL(14, 2) NOT NULL,
    `activeCount` INTEGER NOT NULL,

    UNIQUE INDEX `MrrSnapshot_month_key`(`month`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AiQueryLog` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NULL,
    `question` TEXT NOT NULL,
    `generatedSql` TEXT NULL,
    `success` BOOLEAN NOT NULL DEFAULT true,
    `error` TEXT NULL,
    `durationMs` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `AiQueryLog_createdAt_idx`(`createdAt`),
    INDEX `AiQueryLog_userId_idx`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Job` (
    `id` VARCHAR(191) NOT NULL,
    `queue` VARCHAR(100) NOT NULL,
    `type` VARCHAR(100) NOT NULL,
    `payload` JSON NOT NULL,
    `status` ENUM('PENDING', 'RUNNING', 'DONE', 'FAILED', 'DEAD') NOT NULL DEFAULT 'PENDING',
    `attempts` INTEGER NOT NULL DEFAULT 0,
    `maxAttempts` INTEGER NOT NULL DEFAULT 5,
    `runAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `lockedAt` DATETIME(3) NULL,
    `lockedBy` VARCHAR(100) NULL,
    `lastError` TEXT NULL,
    `dedupeKey` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `finishedAt` DATETIME(3) NULL,

    UNIQUE INDEX `Job_dedupeKey_key`(`dedupeKey`),
    INDEX `Job_status_runAt_idx`(`status`, `runAt`),
    INDEX `Job_queue_status_runAt_idx`(`queue`, `status`, `runAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `User` ADD CONSTRAINT `User_customerId_fkey` FOREIGN KEY (`customerId`) REFERENCES `Customer`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PasswordResetToken` ADD CONSTRAINT `PasswordResetToken_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RefreshToken` ADD CONSTRAINT `RefreshToken_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Product` ADD CONSTRAINT `Product_taxRuleId_fkey` FOREIGN KEY (`taxRuleId`) REFERENCES `TaxRule`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Variant` ADD CONSTRAINT `Variant_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PlanProduct` ADD CONSTRAINT `PlanProduct_planId_fkey` FOREIGN KEY (`planId`) REFERENCES `Plan`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PlanProduct` ADD CONSTRAINT `PlanProduct_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `QuotationTemplate` ADD CONSTRAINT `QuotationTemplate_planId_fkey` FOREIGN KEY (`planId`) REFERENCES `Plan`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Subscription` ADD CONSTRAINT `Subscription_customerId_fkey` FOREIGN KEY (`customerId`) REFERENCES `Customer`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Subscription` ADD CONSTRAINT `Subscription_planId_fkey` FOREIGN KEY (`planId`) REFERENCES `Plan`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SubscriptionLine` ADD CONSTRAINT `SubscriptionLine_subscriptionId_fkey` FOREIGN KEY (`subscriptionId`) REFERENCES `Subscription`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SubscriptionLine` ADD CONSTRAINT `SubscriptionLine_taxRuleId_fkey` FOREIGN KEY (`taxRuleId`) REFERENCES `TaxRule`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Invoice` ADD CONSTRAINT `Invoice_subscriptionId_fkey` FOREIGN KEY (`subscriptionId`) REFERENCES `Subscription`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `InvoiceLine` ADD CONSTRAINT `InvoiceLine_invoiceId_fkey` FOREIGN KEY (`invoiceId`) REFERENCES `Invoice`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DiscountUsage` ADD CONSTRAINT `DiscountUsage_discountId_fkey` FOREIGN KEY (`discountId`) REFERENCES `Discount`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DiscountUsage` ADD CONSTRAINT `DiscountUsage_invoiceId_fkey` FOREIGN KEY (`invoiceId`) REFERENCES `Invoice`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CreditMemo` ADD CONSTRAINT `CreditMemo_invoiceId_fkey` FOREIGN KEY (`invoiceId`) REFERENCES `Invoice`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Dispute` ADD CONSTRAINT `Dispute_invoiceId_fkey` FOREIGN KEY (`invoiceId`) REFERENCES `Invoice`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Payment` ADD CONSTRAINT `Payment_invoiceId_fkey` FOREIGN KEY (`invoiceId`) REFERENCES `Invoice`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ReconciliationMatch` ADD CONSTRAINT `ReconciliationMatch_bankTransactionId_fkey` FOREIGN KEY (`bankTransactionId`) REFERENCES `BankTransaction`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `NoticeLog` ADD CONSTRAINT `NoticeLog_mandateId_fkey` FOREIGN KEY (`mandateId`) REFERENCES `Mandate`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
