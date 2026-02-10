# API Integrations

## Trello (Pipeline / Project Management)

Trello is configured via **server-only** environment variables. The client never sees credentials. Board data is fetched by the server via these API routes:

- `GET /api/trello/sales-board` — Sales/Estimates board (lists, cards, labels, custom fields)
- `GET /api/trello/build-board` — Build/Jobs board
- `GET /api/trello/test` — Test both board connections (used by Settings)
- `GET /api/trello/status` — Whether Trello is configured (`{ configured: boolean }`)

**Auth Flow**
- API Key + Token (query params): `key` and `token`.
- Config is read from server env: `TRELLO_API_KEY`, `TRELLO_TOKEN`, `TRELLO_SALES_BOARD_ID`, `TRELLO_BUILD_BOARD_ID` (or `SALES_BOARD_ID` / `BUILD_BOARD_ID`).

**Endpoints Used**
- `GET /1/boards/{boardId}` (connection test)
- `GET /1/boards/{boardId}/lists`
- `GET /1/boards/{boardId}/cards?customFieldItems=true`
- `GET /1/lists/{listId}/cards?customFieldItems=true`

**Data Mapping**
- Trello card → `Project`
  - `card.id` → `Project.id`
  - `card.name` → `Project.name`
  - label match (Replacement/Repair/Inspection/Gutters) → `Project.type`
  - custom field numeric value → `Project.value`
  - list mapping → `Project.status`
  - `card.due` → `Project.date`

**Source**
- `src/lib/api/trello.ts`

---

## QuickBooks Online (Financials)

**Auth Flow**
- OAuth 2.0 refresh token flow.
- Token endpoint: `https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer`
- Uses Basic Auth with `clientId:clientSecret`.

**Endpoints Used**
- `POST /oauth2/v1/tokens/bearer` (token refresh)
- `GET /v3/company/{realmId}/companyinfo/{realmId}` (connection test)
- `GET /v3/company/{realmId}/query?query=SELECT * FROM Invoice ...`
- `GET /v3/company/{realmId}/query?query=SELECT * FROM Payment ...`
- `GET /v3/company/{realmId}/query?query=SELECT * FROM Customer ...`

**Data Mapping**
- Invoices → `FinancialSummary.totalRevenue`, `collected`, `uncollected`, `avgJobSize`
- Derived profit uses a default 22% margin (adjustable).
- Payments are available for future AR metrics and reconciliation.

**Source**
- `src/lib/api/quickbooks.ts`

---

## Estimator App (Custom Estimates)

**Auth Flow**
- Bearer token via `Authorization: Bearer {apiKey}` header.

**Endpoints Used**
- `GET /health` (connection test)
- `GET /estimates` (list, supports filters)
- `GET /estimates/{id}` (detail)
- `POST /estimates` (create)
- `PUT /estimates/{id}` (update)

**Data Mapping**
- Estimate → `Project` (when accepted)
  - `estimate.projectName` → `Project.name`
  - `estimate.jobType` → `Project.type`
  - `estimate.totalAmount` → `Project.value`
  - `estimate.address` → `Project.location`
  - `estimate.createdAt` → `Project.date`
- Aggregations for job type distribution and acceptance rate.

**Source**
- `src/lib/api/estimator.ts`
