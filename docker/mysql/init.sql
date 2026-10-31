-- Initialize MySQL 8 for BillPilot
CREATE DATABASE IF NOT EXISTS billpilot;
CREATE DATABASE IF NOT EXISTS billpilot_shadow;

CREATE USER IF NOT EXISTS 'billpilot'@'%' IDENTIFIED BY 'billpilot';
GRANT ALL PRIVILEGES ON billpilot.* TO 'billpilot'@'%';
GRANT ALL PRIVILEGES ON billpilot_shadow.* TO 'billpilot'@'%';

CREATE USER IF NOT EXISTS 'billpilot_ro'@'%' IDENTIFIED BY 'billpilot_ro';

FLUSH PRIVILEGES;
