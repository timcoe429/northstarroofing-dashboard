# Current Plan

## Last Updated
February 8, 2026

## Completed This Session
- **Phase 1: Trello API service layer + Settings page update** (dual board support)
- **Phase 2: Navigation updated** with Sales Board and Build Board external links
- **Phase 3: Pipeline page built** with live Trello Sales/Estimates board data
  - KPI cards (Pipeline Value, Potential Profit, Estimates Out, Conversion Rate)
  - Sales Pipeline bar matching Dashboard style
  - Needs Attention alerts section with aging thresholds
  - Pipeline by Material Type breakdown with colored bars
  - Pipeline Leads table (sortable, filterable, labels, all financial columns)
  - Clickable KPI modals with detailed breakdowns
- **Shared design system created** (styles/constants.ts, shared components: Modal, StatCard, DataTable, PipelineBar, AlertCard)
- **Dashboard refactored** to use shared design system
- **Dashboard wired to Build/Jobs Trello board** (currently empty, shows graceful empty states)
- **Navigation cleanup**: removed Projects page, removed Estimates page, added Estimator external link, added Invoices external link
- **Custom fields parsing bug fixed** (Trello text fields with "$ 45,000.00" format)
- **.env.local set up** for Trello credentials persistence
- **Supabase auth implementation** (replacing hardcoded test/test123 login) — COMPLETED

## In Progress
- Remove hardcoded test alert from Pipeline page (TODO comment marks it)

## What's Next
- Verify Supabase auth works (test both logins, sign out, route protection)
- Remove test alert from Pipeline page
- Push to production and verify on live site
- Future: Invoice page (code exists but currently linked externally to northstarroof.com/invoice)
- Future: Supabase migration for invoice storage when native invoice page is activated
- Future: Customers page if/when need becomes clear
- Future: Wire Finances and Reports pages to real data
- Future: Historical data tracking for monthly revenue charts

## What's Complete
- Dashboard: wired to Build/Jobs Trello board, uses shared design system, graceful empty states
- Pipeline: fully functional, pulls from Sales/Estimates board, KPIs, alerts, material breakdown, sortable table
- Settings: Trello API connection with dual board support
- Login: Supabase auth implementation complete (tim@northstarroof.com, omiah@northstarroof.com)
- Navigation: Dashboard, Pipeline, Sales Board (ext), Build Board (ext), Estimator (ext), Invoices (ext), Customers, Finances, Reports, Settings
- Shared design system: styles/constants.ts + shared components (Modal, StatCard, DataTable, PipelineBar, AlertCard)
- API service layer: Trello integration with custom fields parsing
- TypeScript type definitions - see `src/types/index.ts`
- Project structure and documentation - see `docs/` folder

## Blockers
- None currently
