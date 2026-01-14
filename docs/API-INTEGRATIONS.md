# API Integrations

## Trello (Pipeline / Project Management)

**Auth Flow**
- API Key + Token (query params): `key` and `token`.
- Config values are loaded from env or passed to the service.

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
