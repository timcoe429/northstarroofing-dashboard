# Decisions Log

## Architecture
- **Next.js 14 App Router**: Using App Router for file-based routing and React Server Components support. See `docs/PROJECT-STRUCTURE.md` for structure details.
- **Supabase for backend**: Chosen for authentication, database, and real-time capabilities. See `docs/DATABASE.md` for schema.
- **TypeScript only**: Enforced for type safety and better developer experience. See `.cursorrules` for standards.
- **Shared design system**: Created universal styles/constants.ts and shared components (Modal, StatCard, DataTable, PipelineBar, AlertCard). ALL pages must use these — no page-specific styling for common elements.

## Integrations
- **Trello over custom Kanban**: Abandoned custom Kanban board development. Using Trello directly ($60/year Standard plan) for daily project management. Dashboard pulls data via Trello API for reporting/analytics.
- **Two Trello boards**: Sales/Estimates board (pipeline/leads) and Build/Jobs board (active construction). Cards auto-move from Won column to Build board via Butler automation.
- **QuickBooks Online for financials**: OAuth 2.0 refresh token flow for invoice and payment data. See `docs/API-INTEGRATIONS.md` for endpoint usage and data mapping.
- **Estimator App**: Custom API with bearer token authentication for estimate management. See `docs/API-INTEGRATIONS.md` for endpoint details and mapping.

## Data & Storage
- **Dashboard = Build/Jobs data, Pipeline = Sales/Estimates data**: Kept these separate to avoid clutter. Dashboard shows real money (active jobs), Pipeline shows potential money (leads/estimates).
- **Trello credentials in .env.local**: API key and token stored in environment variables, not localStorage, so they persist across rebuilds.
- **localStorage for now, Supabase later**: Invoice storage and other persistent data will use localStorage initially, with Supabase migration planned as a separate pass.

## Authentication & Users
- **Supabase Auth over hardcoded login**: Two users: tim@northstarroof.com and omiah@northstarroof.com. No registration — invite only.

## Navigation & Pages
- **Removed Projects page**: Redundant with Dashboard. Dashboard shows all active job data from Build/Jobs board.
- **External links for Estimator and Invoices**: Estimator links to estimator.northstarroof.com, Invoices links to northstarroof.com/invoice. Invoice page code exists in codebase for future activation.
- **No CRM needed**: Roofing customers rarely return. Contact/job history can be derived from Trello card data if needed later.

## Behavior / UX
- **Small composable components**: Prefer small, reusable components over monoliths. See `.cursorrules` for component patterns.
- **Client components marked with 'use client'**: Required for Next.js App Router client-side interactivity.
