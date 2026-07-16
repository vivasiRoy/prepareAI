# PrepareAI — AI-Powered Event Preparation Intelligence System

PrepareAI is a full-stack SaaS platform that turns any high-stakes event — a job interview, certification exam, court case, or sales pitch — into a structured, AI-guided preparation journey. It generates adaptive curricula, tracks your success probability in real time, conducts mock simulations, and coaches you through every step until you're ready.

---

## Features

- **Adaptive Curricula** — AI generates a personalized day-by-day study plan tailored to your event type, timeline, and skill gaps
- **AI Chat Assistant** — Conversational coach powered by Claude that answers questions, explains concepts, and runs mock Q&A sessions
- **Success Probability Tracker** — Dynamic score (0–100) that updates as you complete lessons and quizzes, showing readiness over time
- **Mock Simulations** — Full simulated interviews, exams, or presentations with real-time AI feedback
- **Quiz Mode** — Multiple-choice and open-ended quizzes auto-generated from your curriculum content
- **Flashcards** — Spaced-repetition flashcard decks generated for each lesson topic
- **Stripe Billing** — Free, Pro, and Enterprise tiers with usage limits enforced per plan
- **Admin Dashboard** — User management, analytics, system health monitoring, and platform-wide controls

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Database | Prisma ORM + PostgreSQL |
| Cache / Queue | Redis (Upstash) |
| Auth | NextAuth.js (Google, GitHub, credentials) |
| AI | Anthropic Claude (Haiku 4.5 / Sonnet 4.6 / Opus 4.8 by plan) |
| Payments | Stripe |
| UI | Tailwind CSS + ShadCN/ui |
| Animation | Framer Motion |
| Hosting | Firebase App Hosting |

---

## Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/royvivasi/prepareAI.git && cd prepareAI
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Copy the environment template**
   ```bash
   cp .env.example .env.local
   ```

4. **Fill in `.env.local`** — see [Environment Variables](#environment-variables) below for the required values (DATABASE_URL, REDIS_URL, NEXTAUTH_SECRET, ANTHROPIC_API_KEY, Stripe keys, Google/GitHub OAuth credentials)

5. **Set up the database**
   ```bash
   npx prisma generate && npx prisma migrate dev --name init
   ```

6. **Seed demo data**
   ```bash
   npx prisma db seed
   ```

7. **Start the development server**
   ```bash
   npm run dev
   ```

8. **Open the app**
   Navigate to [http://localhost:3000](http://localhost:3000)

---

## Environment Variables

Add these to your `.env.local`:

```env
# Database
DATABASE_URL="postgresql://user:password@host:5432/prepareai"

# Redis (Upstash recommended)
REDIS_URL="redis://..."
REDIS_TOKEN="..."

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-here"

# Google OAuth
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."

# GitHub OAuth
GITHUB_CLIENT_ID="..."
GITHUB_CLIENT_SECRET="..."

# Anthropic
ANTHROPIC_API_KEY="sk-ant-..."

# Stripe
STRIPE_SECRET_KEY="sk_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_..."

# Admin
ADMIN_EMAIL="royvivasi@gmail.com"

# AI Config (optional overrides)
DEFAULT_LLM_PROVIDER="anthropic"
DEFAULT_MODEL="claude-sonnet-4-6"
```

---

## Database Setup

PostgreSQL 15+ is required. For cloud hosting, [Neon](https://neon.tech) and [Supabase](https://supabase.com) both offer generous free tiers and work seamlessly with Prisma.

After setting `DATABASE_URL`, run migrations and generate the Prisma client:

```bash
npx prisma migrate dev --name init
npx prisma generate
npx prisma db seed
```

To add the seed script to `package.json`, include:

```json
"prisma": {
  "seed": "ts-node --compiler-options {\"module\":\"CommonJS\"} prisma/seed.ts"
}
```

---

## Deployment to Firebase

1. **Log in to Firebase**
   ```bash
   firebase login
   ```

2. **Select the project**
   ```bash
   firebase use prepareai-777
   ```

3. **Set secrets** (run for each required secret)
   ```bash
   firebase apphosting:secrets:set DATABASE_URL
   firebase apphosting:secrets:set NEXTAUTH_SECRET
   firebase apphosting:secrets:set ANTHROPIC_API_KEY
   firebase apphosting:secrets:set STRIPE_SECRET_KEY
   # ... repeat for all secrets
   ```

4. **Deploy**
   ```bash
   firebase deploy
   ```

---

## Admin Access

Visit `/admin` to access the admin dashboard. Any user whose email matches the `ADMIN_EMAIL` environment variable is automatically promoted to `ADMIN` role on first sign-in.

Seeding creates the admin user with the password from the `SEED_ADMIN_PASSWORD` environment variable (or a random one printed to the console if unset). Never commit or share this password.

The admin dashboard includes:
- `/admin` — User management and plan controls
- `/admin/analytics` — Usage charts and platform metrics
- `/admin/system` — Service health and environment info

---

## Project Structure

```
src/
├── app/
│   ├── (auth)/          # signin, signup pages
│   ├── (dashboard)/     # events, curriculum, lessons, quiz, chat
│   ├── (admin)/         # admin panel, analytics, system
│   ├── (marketing)/     # landing page, pricing
│   └── api/             # REST API routes
├── components/
│   ├── ui/              # ShadCN base components
│   ├── admin/           # Admin-specific components
│   └── dashboard/       # Dashboard widgets and cards
├── lib/
│   ├── auth.ts          # NextAuth config and helpers
│   ├── prisma.ts        # Prisma client singleton
│   ├── ai/              # Claude integration and prompt builders
│   └── stripe/          # Stripe client and webhook handlers
└── types/               # Shared TypeScript types
prisma/
├── schema.prisma        # Database schema
└── seed.ts              # Demo data seed script
```

---

Built with Claude AI by Roy Vivasi
