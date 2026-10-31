-- Grant read-only access strictly to analytics views for AI Assistant
CREATE USER IF NOT EXISTS 'billpilot_ro'@'%' IDENTIFIED BY 'billpilot_ro';

REVOKE ALL PRIVILEGES, GRANT OPTION FROM 'billpilot_ro'@'%';

GRANT SELECT ON `billpilot`.`v_invoices` TO 'billpilot_ro'@'%';
GRANT SELECT ON `billpilot`.`v_subscriptions` TO 'billpilot_ro'@'%';
GRANT SELECT ON `billpilot`.`v_payments` TO 'billpilot_ro'@'%';
GRANT SELECT ON `billpilot`.`v_customers` TO 'billpilot_ro'@'%';

FLUSH PRIVILEGES;
