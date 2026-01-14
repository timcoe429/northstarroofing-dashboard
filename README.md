# Northstar Roofing Dashboard

A modern business management dashboard for Northstar Roofing, built with Next.js, Supabase, and integrations for Trello, QuickBooks Online, and your custom Estimator app.

![Northstar Roofing](https://img.shields.io/badge/Northstar-Roofing-00293f?style=for-the-badge)
![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)
![Supabase](https://img.shields.io/badge/Supabase-Ready-3FCF8E?style=for-the-badge&logo=supabase)

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Git
- A Supabase account
- A Vercel account (for deployment)

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/northstar-dashboard.git
   cd northstar-dashboard
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   Then edit `.env.local` with your actual credentials.

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open [http://localhost:3000](http://localhost:3000)**

## 📁 Project Structure

```
northstar-dashboard/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── page.tsx           # Main dashboard
│   │   ├── layout.tsx         # Root layout
│   │   ├── globals.css        # Global styles
│   │   └── settings/          # Settings page
│   ├── components/            # React components
│   │   ├── Dashboard.tsx      # Main dashboard component
│   │   ├── Sidebar.tsx        # Navigation sidebar
│   │   ├── Header.tsx         # Page header
│   │   ├── Modal.tsx          # Modal component
│   │   └── modals/            # Modal content components
│   ├── lib/                   # Utilities and services
│   │   ├── api/              # API service classes
│   │   │   ├── trello.ts     # Trello integration
│   │   │   ├── quickbooks.ts # QuickBooks integration
│   │   │   └── estimator.ts  # Estimator app integration
│   │   ├── supabase/         # Supabase client setup
│   │   └── utils.ts          # Utility functions
│   └── types/                # TypeScript definitions
├── public/                   # Static assets
├── .env.example             # Environment variable template
├── package.json
├── tsconfig.json
└── next.config.js
```

## 🔗 API Integrations

### Trello
Syncs your project pipeline from Trello boards. The dashboard maps Trello lists to pipeline stages (Leads → Estimates → Scheduled → In Progress → Completed).

**Setup:**
1. Get your API key from [trello.com/power-ups/admin](https://trello.com/power-ups/admin)
2. Generate a token by visiting:
   ```
   https://trello.com/1/authorize?expiration=never&scope=read,write&response_type=token&name=NorthstarDashboard&key=YOUR_API_KEY
   ```
3. Find your board ID from the board URL or via the API

### QuickBooks Online
Syncs financial data including invoices, payments, and revenue tracking.

**Setup:**
1. Create an app at [developer.intuit.com](https://developer.intuit.com)
2. Use OAuth 2.0 to get your access tokens
3. Note your Company Realm ID from the dashboard

### Estimator App
Connects to your custom estimator application for proposal and estimate data.

**Setup:**
1. Configure your estimator app's API endpoint
2. Generate an API key from your estimator app's settings

## 🗄️ Supabase Setup

1. **Create a new Supabase project** at [supabase.com](https://supabase.com)

2. **Run the schema migrations** (create these tables):

```sql
-- API Connections table
CREATE TABLE api_connections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  service TEXT NOT NULL,
  credentials JSONB,
  connected BOOLEAN DEFAULT false,
  last_sync TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Cached data table (for sync)
CREATE TABLE sync_cache (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  service TEXT NOT NULL,
  data_type TEXT NOT NULL,
  data JSONB,
  synced_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE api_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE sync_cache ENABLE ROW LEVEL SECURITY;
```

3. **Get your credentials** from Project Settings → API:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - anon/public key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - service_role key → `SUPABASE_SERVICE_ROLE_KEY`

## 🚢 Deploying to Vercel

### Option 1: Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# For production
vercel --prod
```

### Option 2: GitHub Integration

1. Push your code to GitHub
2. Go to [vercel.com/new](https://vercel.com/new)
3. Import your GitHub repository
4. Add environment variables in Vercel dashboard
5. Deploy!

### Environment Variables in Vercel

Add these in your Vercel project settings → Environment Variables:

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key |
| `TRELLO_API_KEY` | Your Trello API key |
| `TRELLO_TOKEN` | Your Trello access token |
| `TRELLO_BOARD_ID` | Main Trello board ID |
| `QUICKBOOKS_CLIENT_ID` | QBO OAuth client ID |
| `QUICKBOOKS_CLIENT_SECRET` | QBO OAuth client secret |
| `QUICKBOOKS_REALM_ID` | QBO company realm ID |
| `QUICKBOOKS_REFRESH_TOKEN` | QBO OAuth refresh token |
| `QUICKBOOKS_ENVIRONMENT` | `sandbox` or `production` |
| `ESTIMATOR_API_URL` | Your estimator app API URL |
| `ESTIMATOR_API_KEY` | Your estimator app API key |

## 🎨 Brand Colors

- **Navy**: `#00293f`
- **Red**: `#B1000F`

## 📝 Development Notes

### Current Status
The dashboard currently uses mock data. To enable live data:

1. Configure your API connections in Settings
2. Implement the data fetching in API route handlers
3. Replace mock data calls with actual API service calls

### Next Steps
- [ ] Implement Supabase auth
- [ ] Create API routes for each integration
- [ ] Add real-time sync with Supabase subscriptions
- [ ] Build out individual page views (Projects, Estimates, etc.)
- [ ] Add notification system
- [ ] Implement data export features

## 📄 License

Private - Northstar Roofing, Roaring Fork Valley

---

Built with ❤️ for the Roaring Fork Valley
