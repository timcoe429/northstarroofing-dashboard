# Decisions Log

## Architecture
- **Next.js 14 App Router**: Using App Router for file-based routing and React Server Components support. See `docs/PROJECT-STRUCTURE.md` for structure details.
- **Supabase for backend**: Chosen for authentication, database, and real-time capabilities. See `docs/DATABASE.md` for schema.
- **TypeScript only**: Enforced for type safety and better developer experience. See `.cursorrules` for standards.
- **Inline styles**: Current UI pattern to avoid external CSS dependencies. See `.cursorrules` for styling approach.

## Integrations
- **Trello for project pipeline**: Maps Trello lists to pipeline stages (Leads → Estimates → Scheduled → In Progress → Completed). See `docs/API-INTEGRATIONS.md` for auth flow and data mapping details.
- **QuickBooks Online for financials**: OAuth 2.0 refresh token flow for invoice and payment data. See `docs/API-INTEGRATIONS.md` for endpoint usage and data mapping.
- **Estimator App**: Custom API with bearer token authentication for estimate management. See `docs/API-INTEGRATIONS.md` for endpoint details and mapping.

## Behavior / UX
- **Small composable components**: Prefer small, reusable components over monoliths. See `.cursorrules` for component patterns.
- **Client components marked with 'use client'**: Required for Next.js App Router client-side interactivity.
- **Mock data pattern**: Using mock data during development until APIs are connected. Mock data lives in `src/lib/utils.ts`.
