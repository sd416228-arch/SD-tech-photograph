# SD Tech Photograph Backend

Express and PostgreSQL API for the SD Tech Photograph website and future owner dashboard.

## Local setup

1. Copy `.env.example` to `.env`.
2. Set `DATABASE_URL` to the local PostgreSQL database.
3. Set a long local `JWT_SECRET`.
4. Set `ADMIN_EMAIL` and `ADMIN_PASSWORD` for the development owner account.
5. Add email values only when SMTP is available.

## Commands

```cmd
npm install
npm run seed
npm run dev
```

The API runs at `http://localhost:8000` by default.

## API groups

- `GET /api/health`
- `GET /api/db-test`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `POST /api/auth/logout`
- `/api/inquiries`
- `/api/services`
- `/api/packages`
- `/api/reviews`
- `/api/gallery`
- `/api/settings`

Public read routes are available for services, packages, approved reviews, gallery, and settings. Content mutations and inquiry management require a JWT bearer token or the login cookie.

## Database

- `database/schema.sql` creates the tables and indexes.
- `database/seed.sql` adds non-sensitive development content.
- `scripts/seed.js` applies both files and creates the owner account from environment variables.

Image files are not stored in PostgreSQL. Gallery and service records store image URLs only.

## Email

New inquiries are saved even when SMTP is not configured or temporarily unavailable. Configure `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_USER`, `EMAIL_PASSWORD`, and `OWNER_EMAIL` to enable owner notifications.
