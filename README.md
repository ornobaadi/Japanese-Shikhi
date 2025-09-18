This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses web fonts loaded in `app/layout.tsx` and CSS variables in `app/globals.css`.

- **Latin / UI font:** `DM Sans` (for English UI text)
- **Bengali / Bangla font:** `Li Ador Noirrit` (logo/branding) with fallbacks to `Noto Sans Bengali` for body/headings.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Admin Dashboard (Static Auth)

A simple admin login is provided for development.

- Visit `/admin-login` and use credentials from `.env.local`.
- On success, you're redirected to `/admin`.
- Logout via the button in the admin UI.

Setup:

1) Copy the example env and set credentials:

```powershell
copy .env.local.example .env.local
```

2) Edit `.env.local`:

```dotenv
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=admin12345
```

3) Run dev server:

```powershell
npm run dev
```

Notes:
- Admin routes are protected by `middleware.ts` using an `admin_session` cookie.
- This is for local/dev usage; replace with real auth before production.
