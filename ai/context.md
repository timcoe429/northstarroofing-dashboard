# Project Context

## What This Is
A modern business management dashboard for Northstar Roofing (Roaring Fork Valley) built with Next.js 14 and Supabase. The dashboard integrates with Trello for project pipeline management, QuickBooks Online for financial tracking, and a custom Estimator app for proposal management. See `README.md` and `.cursorrules` for detailed project information.

## Tech Stack
- **Frontend**: Next.js 14 (App Router), React 18, TypeScript
- **Backend/Database**: Supabase
- **Hosting**: Vercel
- **Integrations**: Trello (project pipeline), QuickBooks Online (financials), Estimator App (custom estimates)

For detailed tech stack information, see `docs/PROJECT-STRUCTURE.md` and `package.json`.

## Non-Negotiables
- TypeScript only (no JavaScript files)
- Must run `npm run dev` and `npm run build` locally before pushing to GitHub
- Types must be in `src/types/`
- Use inline styles (current UI pattern) unless refactoring styles as a task
- Brand colors: Navy `#00293f`, Red `#B1000F`
- Add `'use client'` at the top of client components
- Prefer small, composable components over monoliths

See `.cursorrules` for complete coding standards.

## What We Don't Want
- JavaScript files (TypeScript only)
- External CSS frameworks (use inline styles per current pattern)
- Large monolithic components (prefer small, composable components)
- Skipping local testing before pushing

## Target Users
Northstar Roofing team members managing projects, estimates, finances, and customer relationships in the Roaring Fork Valley. The dashboard provides a unified view of business operations across multiple integrated services.
