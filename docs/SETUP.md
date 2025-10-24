# Kana Companion Setup Guide

## Prerequisites

- Node.js 20 or newer
- npm 10+
- SQLite (bundled with Prisma; no external database required)

## Getting Started

```bash
npm install
npm run prisma migrate deploy
npm run dev
```

Open http://localhost:3000 to explore the app. A default PWA manifest and service worker are generated during `next build`.

### Environment Variables

Create `.env` with the following values:

```bash
DATABASE_URL="file:./prisma/dev.db"
NEXTAUTH_SECRET="generate_a_long_random_value"
NEXTAUTH_URL="http://localhost:3000"
```

`NEXTAUTH_SECRET` should be a strong random string. In production, point `DATABASE_URL` to a persistent SQLite or PostgreSQL instance.

### Database

Run migrations and generate the Prisma client:

```bash
npm run prisma migrate deploy
npm run prisma generate
```

To reset the schema during development:

```bash
npx prisma migrate reset
```

### Scripts

- `npm run dev` – start the Next.js development server
- `npm run build` – create an optimized production build
- `npm run start` – serve the production build
- `npm run lint` – run ESLint with the Next.js configuration
- `npm run format` – format files with Prettier
- `npm run typecheck` – type-check the project without emitting files
- `npm run test` – run Vitest once
- `npm run test:watch` – run Vitest in watch mode

### Testing

Vitest and React Testing Library are preconfigured. Place test files under `tests/` or next to the modules they cover with `.test.ts(x)` suffixes.

### Deployment Notes

- Configure production URLs in `NEXTAUTH_URL` and update allowed origins in your OAuth providers if you add them.
- `next-pwa` emits a service worker during `npm run build`. Ensure your hosting platform serves files from `public/` without modifications.
- Review `content/learning-tips.md` to tailor pedagogy messaging for your organization.
