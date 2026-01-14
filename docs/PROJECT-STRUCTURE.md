# Northstar Roofing Dashboard - Project Structure

## Tech Stack
- Next.js 14 (App Router)
- TypeScript
- Supabase
- Vercel

## Brand
- Navy: `#00293f`
- Red: `#B1000F`

## Directory Structure
```
/
├── docs/                     # Project documentation
├── public/                   # Static assets (favicon, images)
├── src/
│   ├── app/                  # Next.js App Router pages/layouts
│   │   ├── layout.tsx         # Root layout + metadata
│   │   ├── page.tsx           # Main dashboard entry
│   │   └── settings/          # Settings route
│   ├── components/            # UI components and dashboard modules
│   │   ├── modals/            # Modal content components
│   │   └── *.tsx              # Cards, charts, layout components
│   ├── lib/
│   │   ├── api/               # Trello, QuickBooks, Estimator services
│   │   ├── supabase/          # Supabase browser/server clients
│   │   └── utils.ts           # Mock data + helpers
│   └── types/                 # Shared TypeScript types
├── next.config.js             # Next.js configuration
├── package.json               # Scripts and dependencies
└── tsconfig.json              # TypeScript configuration
```

## Key Files
- `src/app/layout.tsx`: Root layout and metadata.
- `src/app/page.tsx`: Dashboard route entry.
- `src/components/Dashboard.tsx`: Main dashboard composition and layout.
- `src/lib/utils.ts`: Mock data and helpers used by the UI.
- `src/lib/api/trello.ts`: Trello API client and mapping to projects.
- `src/lib/api/quickbooks.ts`: QuickBooks Online client and financial aggregation.
- `src/lib/api/estimator.ts`: Estimator API client and mapping to projects.
- `src/lib/supabase/client.ts`: Browser Supabase client.
- `src/lib/supabase/server.ts`: Server Supabase client for RSC/SSR.
- `src/types/index.ts`: Shared domain types (projects, financials, integrations).
- `next.config.js`: Next.js runtime configuration.
- `package.json`: Scripts (`dev`, `build`) and dependencies.
