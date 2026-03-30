# SeniorStay

SeniorStay is a full-stack MVP inspired by Booking.com, but focused on senior care homes and assisted living facilities. It includes:

- Guest browsing with search, filters, sorting, and responsive listing pages
- Email/password authentication with user and admin roles
- Favorites, reviews, booking flow, and user profile history
- Admin dashboard for managing listings and booking statuses
- Seeded PostgreSQL database with 5 example care homes and demo accounts

## Stack

- Next.js 15 with the App Router
- React 18
- Prisma ORM
- PostgreSQL for the deployable database layer
- Custom JWT cookie authentication

## Local setup

1. Install Node.js 20 or newer.
2. Copy `.env.example` to `.env`.
3. Create a PostgreSQL database locally or in the cloud.
4. Set `DATABASE_URL` and `AUTH_SECRET`.
4. Install dependencies:

```bash
npm install
```

5. Create the schema:

```bash
npm run db:push
```

6. Seed demo data:

```bash
npm run db:seed
```

7. Start the app:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Demo credentials

- Admin: `admin@seniorstay.com` / `password123`
- User: `olivia@example.com` / `password123`

## Deployment

This project is ready to deploy as a responsive website MVP on any Node-compatible host with PostgreSQL.

### Recommended options

- Vercel + Neon Postgres
- Railway
- Render
- VPS / Docker host

### Deployment steps

1. Provision a PostgreSQL database.
2. Add environment variables:
   - `DATABASE_URL`
   - `AUTH_SECRET`
3. Run:

```bash
npm install
npm run db:push
npm run db:seed
npm run build
```

4. Start with:

```bash
npm run start
```

### Vercel deploy checklist

1. Push this repo to GitHub.
2. Import the repo into Vercel.
3. Add `DATABASE_URL` and `AUTH_SECRET` in the Vercel project settings.
4. Run `npm run db:push` and `npm run db:seed` once against the production database.
5. Redeploy.

### Railway / Render / Docker

The project includes a production Dockerfile, so it can also run on container-based hosts. Use:

```bash
docker build -t seniorstay .
docker run -p 3000:3000 --env-file .env seniorstay
```

## Notes

- Availability is tracked monthly for MVP simplicity.
- Booking confirmation creates an in-app notification visible in the user profile.
- Listings store photo URLs and service tags in JSON-encoded strings to keep the schema simple while remaining easy to evolve later.
- The temporary demo-mode fallback is still present for browse pages; for a strict production-only deployment, we can remove that next.
