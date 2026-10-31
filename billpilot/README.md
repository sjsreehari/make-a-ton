# BillPilot — Subscription Management System

**Built by Brightloop Software** | Hackathon project

> "We removed every manual step in the billing month."

## Quick Start

```bash
# 1. Clone and setup
git clone <repo> billpilot && cd billpilot
cp .env.example .env
# Edit .env with your secrets

# 2. Start infrastructure
docker compose up -d

# 3. Install dependencies
pnpm install

# 4. Database setup
pnpm db:migrate
pnpm db:seed
# For 5000+ subscriptions:
# pnpm db:seed -- --scale=5000

# 5. Start dev servers (API on :4000, Web on :3000)
pnpm dev
```

## Services

| Service   | URL                     |
|-----------|-------------------------|
| Web App   | http://localhost:3000   |
| API       | http://localhost:4000   |
| API Docs  | http://localhost:4000/api/docs |
| Mailhog   | http://localhost:8025   |

## Seed Accounts

| Email                    | Password      | Role     |
|--------------------------|---------------|----------|
| admin@brightloop.test    | Admin@12345!  | ADMIN    |
| staff@brightloop.test    | Staff@12345!  | STAFF    |
| cust1@brightloop.test    | Cust@12345!   | CUSTOMER |

## WhatsApp Sandbox Setup

1. Join sandbox: Send "join <sandbox-code>" to +1 415 523 8886 on WhatsApp
2. Set `TWILIO_WEBHOOK_BASE_URL` to your ngrok URL
3. Configure Twilio sandbox webhook to `$TWILIO_WEBHOOK_BASE_URL/api/v1/webhooks/twilio/whatsapp`

## Architecture

```
Web (Next.js) -> API (NestJS) -> PostgreSQL + Redis
                              -> BullMQ (async jobs)
                              -> Mailhog (email)
Webhooks: Razorpay, Twilio -> API
API -> Twilio (WhatsApp), Razorpay, Anthropic (AI)
```
