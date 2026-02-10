# Quick Start

## Local Development
1. Install dependencies:
   - `npm install`
2. Create an `.env.local` file with the variables listed below.
3. Run the dev server:
   - `npm run dev`

## Environment Variables
Required for Supabase:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Integrations (optional until APIs are connected):
- Trello (server-only; board data is fetched via `/api/trello/sales-board` and `/api/trello/build-board`):
  - `TRELLO_API_KEY`
  - `TRELLO_TOKEN`
  - `TRELLO_SALES_BOARD_ID`
  - `TRELLO_BUILD_BOARD_ID`
- QuickBooks Online:
  - `QUICKBOOKS_CLIENT_ID`
  - `QUICKBOOKS_CLIENT_SECRET`
  - `QUICKBOOKS_REALM_ID`
  - `QUICKBOOKS_REFRESH_TOKEN`
  - `QUICKBOOKS_ENVIRONMENT` (`sandbox` or `production`)
- Estimator App:
  - `ESTIMATOR_API_URL`
  - `ESTIMATOR_API_KEY`

## Supabase Setup
1. Create a Supabase project.
2. Copy the API URL and anon key into `.env.local`.
3. Run the SQL from `docs/DATABASE.md` in the Supabase SQL editor.
4. (Optional) Configure Vault or secrets storage for API credentials.

## Vercel Deployment
1. Create a new Vercel project from this repo.
2. Add the same environment variables in Vercel project settings.
3. Deploy and verify the build.
