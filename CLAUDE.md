# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `npm run dev` - Start development server with Turbopack (opens on localhost:3000)
- `npm run build` - Build the application for production with Turbopack
- `npm start` - Start the production server

## Architecture Overview

This is a **Next.js 15** application for a Japanese learning platform called "Japanese Shikhi" using:

 **Fonts**: `DM Sans` for Latin UI and `Li Ador Noirrit` (with `Noto Sans Bengali` fallback) for Bengali text

### Project Structure

```
app/
├── blocks/         # Reusable layout components (Navbar, etc.)
├── pages/          # Page-specific components (LandingPage, etc.)
├── layout.tsx      # Root layout with fonts and metadata
├── page.tsx        # Main page combining Navbar + LandingPage
└── globals.css     # Global Tailwind styles

components/
├── ui/             # shadcn/ui components (button, input, etc.)
└── navbar-5.tsx    # Specific navbar implementation

lib/
└── utils.ts        # Utility functions (cn for className merging)
```

### Component Patterns

- **Component Organization**: Page components in `app/pages/`, reusable blocks in `app/blocks/`, UI primitives in `components/ui/`
- **Styling**: Uses `cn()` utility from `lib/utils.ts` to merge Tailwind classes with clsx and tailwind-merge
- **Import Aliases**: `@/*` maps to root directory (configured in tsconfig.json and components.json)

### shadcn/ui Configuration

- **Style**: "new-york" variant
- **Base Color**: neutral
- **CSS Variables**: enabled
- **Icon Library**: lucide
- **Aliases**: components (`@/components`), ui (`@/components/ui`), lib (`@/lib`), utils (`@/lib/utils`), hooks (`@/hooks`)

### TypeScript Setup

- **Target**: ES2017
- **Strict Mode**: enabled
- **Path Mapping**: `@/*` points to project root
- **JSX**: preserve (handled by Next.js)