# Copilot Coding Agent Instructions for Japanese-Shikhi

## Project Overview
- **Framework:** Next.js 15 (App Router, TypeScript, Tailwind)
- **Purpose:** Japanese learning platform with multilingual (English/Bengali) UI
- **Key Directories:**
  - `app/` — Route handlers, page components, layouts, and global styles
  - `components/` — Reusable React components (UI primitives in `ui/`)
  - `lib/` — Utilities, data access, and integrations
  - `hooks/` — Custom React hooks
  - `contexts/` — React context providers

## Architecture & Patterns
- **Component Structure:**
  - Page-specific components: `app/pages/`
  - Reusable layout blocks: `app/blocks/`
  - UI primitives: `components/ui/`
- **Styling:**
  - Tailwind CSS with `cn()` utility (`lib/utils.ts`) for class merging
  - Fonts: `DM Sans` (Latin), `Li Ador Noirrit`/`Noto Sans Bengali` (Bengali)
- **Import Aliases:**
  - `@/components`, `@/lib`, `@/hooks`, etc. (see `tsconfig.json`)
- **shadcn/ui:**
  - Style: "new-york", base color: neutral, icons: lucide

## Developer Workflows
- **Start Dev Server:** `npm run dev` (or `pnpm dev`)
- **Build:** `npm run build`
- **Production:** `npm start`
- **Entry Point:** `app/page.tsx`
- **Global Styles:** `app/globals.css`

## Conventions & Practices
- **TypeScript:** Strict mode, ES2017 target, JSX preserved
- **API Routes:** Under `app/api/` (RESTful endpoints)
- **Data Utilities:** In `lib/` (e.g., `lib/mongodb.ts`, `lib/supabase.ts`)
- **Admin Features:** Under `app/admin-dashboard/` and `app/admin-setup/`
- **Testing/Debug Scripts:** Top-level `.js` files (e.g., `test-api.js`)

## Integration Points
- **Database:** MongoDB (`lib/mongodb.ts`), Supabase (`lib/supabase.ts`)
- **Fonts:** Configured in `app/layout.tsx`
- **External UI:** shadcn/ui, lucide icons

## Examples
- **Reusable Navbar:** `app/blocks/Navbar.tsx`, `components/navbar-5.tsx`
- **Course Logic:** `app/courses/`, `lib/models/`
- **Admin:** `app/admin-dashboard/`, `app/admin-setup/`

## Special Notes
- **Aliases:** Use `@/` imports for all root-level modules
- **Do not edit:** Files in `public/fonts/` and `public/uploads/` directly
- **Follow:** shadcn/ui and Tailwind conventions for new UI

---
For more, see `README.md` and `CLAUDE.md` in the project root.
