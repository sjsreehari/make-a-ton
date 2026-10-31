-- BillPilot AI Safe Analytics Views for MySQL 8.0

CREATE OR REPLACE VIEW `v_invoices` AS
SELECT
  i.`id`,
  i.`number`,
  i.`customerId`,
  c.`name` AS `customerName`,
  c.`email` AS `customerEmail`,
  i.`subscriptionId`,
  p.`name` AS `planName`,
  i.`subtotal`,
  i.`taxTotal`,
  i.`discountTotal`,
  i.`total`,
  i.`amountPaid`,
  i.`amountDue`,
  i.`currency`,
  i.`status`,
  CASE
    WHEN i.`status` = 'CONFIRMED' AND i.`dueDate` < CURDATE() THEN 'OVERDUE'
    ELSE i.`status`
  END AS `effectiveStatus`,
  i.`issueDate`,
  i.`dueDate`,
  i.`paidAt`,
  CASE
    WHEN i.`status` = 'CONFIRMED' AND i.`dueDate` < CURDATE() THEN DATEDIFF(CURDATE(), i.`dueDate`)
    ELSE 0
  END AS `daysOverdue`,
  i.`createdAt`
FROM `Invoice` i
JOIN `Customer` c ON c.`id` = i.`customerId`
LEFT JOIN `Subscription` s ON s.`id` = i.`subscriptionId`
LEFT JOIN `Plan` p ON p.`id` = s.`planId`;

CREATE OR REPLACE VIEW `v_subscriptions` AS
SELECT
  s.`id`,
  s.`number`,
  s.`customerId`,
  c.`name` AS `customerName`,
  c.`email` AS `customerEmail`,
  s.`planId`,
  p.`name` AS `planName`,
  p.`billingPeriod`,
  s.`status`,
  COALESCE((SELECT SUM(sl.`quantity`) FROM `SubscriptionLine` sl WHERE sl.`subscriptionId` = s.`id`), 1) AS `quantity`,
  CASE
    WHEN s.`status` NOT IN ('ACTIVE', 'PAUSED') THEN 0.00
    WHEN p.`billingPeriod` = 'MONTHLY' THEN CAST(p.`price` * COALESCE((SELECT SUM(sl.`quantity`) FROM `SubscriptionLine` sl WHERE sl.`subscriptionId` = s.`id`), 1) AS DECIMAL(14, 2))
    WHEN p.`billingPeriod` = 'YEARLY' THEN CAST((p.`price` * COALESCE((SELECT SUM(sl.`quantity`) FROM `SubscriptionLine` sl WHERE sl.`subscriptionId` = s.`id`), 1)) / 12.0 AS DECIMAL(14, 2))
    WHEN p.`billingPeriod` = 'WEEKLY' THEN CAST((p.`price` * COALESCE((SELECT SUM(sl.`quantity`) FROM `SubscriptionLine` sl WHERE sl.`subscriptionId` = s.`id`), 1)) * 4.3333333333 AS DECIMAL(14, 2))
    WHEN p.`billingPeriod` = 'DAILY' THEN CAST((p.`price` * COALESCE((SELECT SUM(sl.`quantity`) FROM `SubscriptionLine` sl WHERE sl.`subscriptionId` = s.`id`), 1)) * 30.0 AS DECIMAL(14, 2))
    ELSE 0.00
  END AS `mrrContribution`,
  s.`startDate`,
  s.`expiryDate` AS `endDate`,
  s.`nextBillingDate`,
  s.`closedAt`,
  s.`closeReason`,
  DATEDIFF(COALESCE(s.`closedAt`, CURDATE()), s.`startDate`) AS `tenureDays`,
  s.`createdAt`
FROM `Subscription` s
JOIN `Customer` c ON c.`id` = s.`customerId`
JOIN `Plan` p ON p.`id` = s.`planId`;

CREATE OR REPLACE VIEW `v_payments` AS
SELECT
  p.`id`,
  p.`invoiceId`,
  i.`number` AS `invoiceNumber`,
  p.`customerId`,
  c.`name` AS `customerName`,
  p.`method`,
  p.`status`,
  p.`amount`,
  i.`currency`,
  p.`paidAt`,
  p.`externalRef`,
  p.`createdAt`
FROM `Payment` p
JOIN `Invoice` i ON i.`id` = p.`invoiceId`
JOIN `Customer` c ON c.`id` = p.`customerId`;

CREATE OR REPLACE VIEW `v_customers` AS
SELECT
  c.`id`,
  c.`name`,
  c.`email`,
  c.`company`,
  c.`gstin`,
  c.`currency`,
  c.`creditBalance`,
  c.`createdAt`,
  COALESCE((
    SELECT SUM(i.`total`)
    FROM `Invoice` i
    WHERE i.`customerId` = c.`id` AND i.`status` != 'CANCELLED'
  ), 0.00) AS `totalInvoiced`,
  COALESCE((
    SELECT SUM(p.`amount`)
    FROM `Payment` p
    WHERE p.`customerId` = c.`id` AND p.`status` = 'RECORDED'
  ), 0.00) AS `totalPaid`,
  COALESCE((
    SELECT SUM(i.`amountDue`)
    FROM `Invoice` i
    WHERE i.`customerId` = c.`id` AND i.`status` IN ('CONFIRMED', 'PENDING')
  ), 0.00) AS `totalOutstanding`,
  COALESCE((
    SELECT COUNT(*)
    FROM `Subscription` s
    WHERE s.`customerId` = c.`id` AND s.`status` = 'ACTIVE'
  ), 0) AS `activeSubCount`,
  CASE
    WHEN (
      SELECT COUNT(*)
      FROM `Invoice` i
      WHERE i.`customerId` = c.`id`
        AND i.`status` = 'CONFIRMED'
        AND i.`dueDate` < DATE_SUB(CURDATE(), INTERVAL 30 DAY)
    ) > 0 THEN 'HIGH'
    WHEN (
      SELECT COUNT(*)
      FROM `Invoice` i
      WHERE i.`customerId` = c.`id`
        AND i.`status` = 'CONFIRMED'
        AND i.`dueDate` < CURDATE()
    ) > 0 THEN 'MEDIUM'
    ELSE 'LOW'
  END AS `riskTier`
FROM `Customer` c;
