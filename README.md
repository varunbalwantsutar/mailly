# Mailly - Email Marketing Orchestration Platform

Mailly is a dynamic, high-performance SaaS platform for email marketing, segment building, and campaign delivery tracking. It includes a Next.js frontend, an Express API backend, a Redis-backed BullMQ delivery engine, and real-time open-tracking webhook support.

---

## Technical Stack & Architecture

```mermaid
graph TD
    User(Browser) -->|HTTPS| Frontend(Vercel: Next.js Frontend)
    Frontend -->|API Requests| Backend(Render: Express API)
    Backend -->|Database| DB[(Neon: PostgreSQL)]
    Backend -->|Task Queue| Redis[(Upstash: Redis)]
    Backend -->|Outbound SMTP & Webhooks| MailerSend(MailerSend Server)
```

* **Frontend:** Next.js, Material UI (MUI), React Hook Form, Axios.
* **Backend:** Node.js, Express, TypeScript, Prisma ORM, PostgreSQL.
* **Queue Engine:** Redis, BullMQ (handles instant and scheduled delivery workers).
* **Delivery & Tracking:** MailerSend SMTP and transactional webhooks.

---

## Getting Started Locally

### Prerequisites
* **Node.js** (v18 or higher)
* **PostgreSQL** database
* **Redis** server instance

### 1. Backend Setup
1. Navigate to the `backend/` directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure your local `.env` variables (see details below).
4. Run the database migration to create tables:
   ```bash
   npx prisma db push
   ```
5. Start the development backend:
   ```bash
   npm run dev
   ```
   *The backend will run on port `5001` (by default or as defined in `.env`).*

### 2. Frontend Setup
1. Navigate to the `frontend/` directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure your frontend `.env.local` to point to the backend (see below).
4. Start the Next.js development portal:
   ```bash
   npm run dev
   ```
   *Open [http://localhost:3000](http://localhost:3000) in your browser.*

---

## Environment Variables

### Backend (`backend/.env`)
```env
PORT=5001
BACKEND_URL=http://localhost:5001
DATABASE_URL="postgresql://username:password@localhost:5432/email_marketing"
REDIS_URL="redis://localhost:6379"
JWT_SECRET="YOUR_SECURE_JWT_SECRET"

# SMTP Mail Delivery Settings (MailerSend / Mailgun / Brevo)
SMTP_HOST=smtp.mailersend.net
SMTP_PORT=587
SMTP_USER=your_smtp_username
SMTP_PASS=your_smtp_password
```

### Frontend (`frontend/.env.local`)
```env
NEXT_PUBLIC_API_URL=http://localhost:5001/api
```

---

## Key Decisions & Architectural Trade-offs

### 1. Performance Memoization & useMemo Optimization
To support seamless scaling as lists grow:
* Wrapped all heavy filters, alphabetizing, pagination sorting, and live segmentation estimations inside `useMemo` hooks.
* Prevents redundant layout computations and array iterations on every input keystroke or component state modification.

### 2. Clean Component Decoupling
* Deconstructed the monolithic 1,700-line `contacts/page.tsx` file into reusable modular subcomponents under `components/contacts/` (`ContactDetails`, `ContactFormDialog`, `ImportDialog`).
* Enhances maintainability, simplifies unit testing, and narrows render scopes.

### 3. Stateless Token-Based Authentication
* Refactored cross-origin cookie authentication to pure **Bearer Tokens** stored in `localStorage`.
* This ensures that cross-site cookies are never blocked in production when the frontend (Vercel) communicating with the backend (Render) runs across different domains.

### 4. Zero-Config Multi-Provider Webhook Support
* Configured outbound mail headers so that standard campaign identifiers are appended to Brevo, Mailgun, and MailerSend envelopes (`X-MailerSend-Tags`, `X-Mailgun-Variables`, `X-Mailin-tag`).
* Your backend is fully prepared to receive webhook events from whichever provider you set up in your `.env`.
