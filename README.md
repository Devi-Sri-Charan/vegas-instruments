# Vega Instruments (MERN) — Full Project (JavaScript only)

This repository contains a full MERN stack application for Vega Instruments with:
- Public product catalog (categories, instruments, specs, YouTube demo)
- Admin panel (JWT auth) to manage categories and instruments
- S3 image uploads (using AWS S3) replacing local storage
- Seed data script with sample categories & instruments
- Polished UI with animations, modals and toasts (Bootstrap)

## Quick start

1. Clone or unzip the repo.
2. Set environment variables for server: copy `server/.env.example` → `server/.env` and fill values (MONGO_URI, JWT_SECRET, AWS_*).
3. Install server deps:
   ```
   cd server
   npm install
   ```
4. Seed sample data (optional):
   ```
   npm run seed
   ```
5. Start server:
   ```
   npm run dev
   ```
6. Install client:
   ```
   cd ../client
   npm install
   npm run dev
   ```

## Notes
- S3: configure `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`, `AWS_S3_BUCKET`.
- Admin: Set `ADMIN_EMAIL` and `ADMIN_PASSWORD` in server env or call `/api/admin/init` to create default admin.
- For production, set `VITE_API_BASE` in client environment to point to deployed server.

