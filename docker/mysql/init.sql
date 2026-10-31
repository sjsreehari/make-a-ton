-- Initialize MySQL 8 for BillPilot
CREATE DATABASE IF NOT EXISTS billpilot;
CREATE DATABASE IF NOT EXISTS billpilot_shadow;

CREATE USER IF NOT EXISTS 'billpilot'@'%' IDENTIFIED BY 'billpilot';
GRANT ALL PRIVILEGES ON billpilot.* TO 'billpilot'@'%' WITH GRANT OPTION;
GRANT ALL PRIVILEGES ON billpilot_shadow.* TO 'billpilot'@'%';

CREATE USER IF NOT EXISTS 'billpilot_ro'@'%' IDENTIFIED BY 'billpilot_ro';
GRANT SELECT ON billpilot.v_invoices TO 'billpilot_ro'@'%';
GRANT SELECT ON billpilot.v_subscriptions TO 'billpilot_ro'@'%';
GRANT SELECT ON billpilot.v_payments TO 'billpilot_ro'@'%';
GRANT SELECT ON billpilot.v_customers TO 'billpilot_ro'@'%';

FLUSH PRIVILEGES;
