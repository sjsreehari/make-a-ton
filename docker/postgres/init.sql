-- Create read-only role for AI assistant
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'billpilot_ro') THEN
    CREATE ROLE billpilot_ro WITH LOGIN PASSWORD 'billpilot_ro' NOSUPERUSER NOCREATEDB NOCREATEROLE;
  END IF;
END
$$;

-- Grant connect
GRANT CONNECT ON DATABASE billpilot TO billpilot_ro;
GRANT USAGE ON SCHEMA public TO billpilot_ro;

