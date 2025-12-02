# MapFin - Project Context

**Project Name:** MapFin (Map + Finance = Mapping your finances)
**Location:** `/Users/mntr-space/Documents/Projects/CtrlFin/MapFin`
**Last Updated:** December 2025
**Implementation Status:** Phase 5 Complete - Dashboard Redesign with Charts & Tags

---

## Quick Start

```bash
# Use Node 22 (required)
nvm use 22

# Install dependencies (if not done)
npm install

# Start API server (connects to Google Sheets)
npm run server

# In another terminal, start frontend
npm run dev

# Or run both together
npm run dev:all

# Build for production
npm run build
```

---

## What is MapFin?

MapFin is a personal finance dashboard for tracking wealth and expenses. It provides visibility into "where we are" and "where we're going" financially.

### Core Value Proposition
- **Wealth Watch**: Track net worth across multiple asset classes
- **Expense Tracker**: Monitor spending with budgets and categories
- **Goals**: Set and track financial targets
- Multi-person support (Self + Spouse) with aggregate view

---

## Key Decisions Made

### Data Architecture

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Net Worth Tracking | Snapshot-based | Simpler for manual entry; matches existing workflow |
| Expense Tracking | Transaction-based | Every expense logged individually |
| Backend (v1.0) | Google Sheets | Familiar, easy manual edits, existing data |
| Backend (future) | Supabase | Better querying, auth, real-time |

### Display & Formatting

| Setting | Value |
|---------|-------|
| Currency | Always show ₹ symbol |
| Number Format | Western (K/M/B) - e.g., ₹1.5M, ₹500K |
| Calendar | Calendar year (Jan-Dec) |
| Theme | Light mode (default) |

### Tech Stack

| Component | Technology |
|-----------|------------|
| Frontend | React + Vite + TypeScript |
| Styling | Tailwind CSS |
| Components | shadcn/ui |
| Charts | Recharts |
| Routing | React Router |
| Icons | Lucide React |
| Hosting | Vercel |

---

## Users

| Person | Relationship | Notes |
|--------|--------------|-------|
| Manan | Self | Primary user |
| Anushka | Spouse | Secondary tracking |

Assets and expenses are tagged to individuals. Aggregate view shows combined totals.

---

## Asset Categories

| Category | Data Entry | Valuation |
|----------|------------|-----------|
| Mutual Funds | Snapshot value | Future: live NAV |
| Stocks - India | Snapshot value | Future: live prices |
| Stocks - Other | Snapshot + currency | Future: live + forex |
| EPF | Snapshot value | Manual |
| PPF | Snapshot value | Manual |
| Fixed Deposits | Snapshot value | Manual |
| Digital Assets | Snapshot value | Future: live crypto |
| Gold | Snapshot value | Weight-based possible |
| Real Estate | Snapshot value | Purchase + estimated |
| Liquid Cash / Bank | Snapshot value | Manual |
| Forex | Snapshot + currency | Foreign holdings |
| ESOPs / RSUs | Snapshot value | Manual |
| P2P Lending | Snapshot value | Manual |
| Owed | Snapshot value | Money lent out |
| Debt | Snapshot (negative) | Money owed |

---

## Expense Categories

| Category | Examples |
|----------|----------|
| Food & Dining | Restaurants, takeout, coffee |
| Groceries | Supermarket, vegetables |
| Transport / Travel | Fuel, Uber, flights |
| Utilities & Rent | Electricity, internet, rent |
| Subscriptions | Netflix, Spotify, software |
| Fitness and Health | Medical, gym, sports |
| Family & House Supplies | Household items, repairs |
| Personal | Clothing, grooming |
| Gifts | Presents, donations |
| Leisure | Movies, games, entertainment |
| Other | Miscellaneous |

Users can add new categories.

---

## Payment Methods

| Method | Example Specifics |
|--------|-------------------|
| Credit Card | "Axis Ace", "ICICI Sapphiro" |
| Debit Card | "HDFC Bank", "Niyo Global" |
| UPI | "GPay - HDFC", "PhonePe" |
| Transfer | "Bank Transfer - HDFC" |
| Cash | - |
| Digital Wallet | "Paytm", "Amazon Pay" |

User has 20+ cards tracked for payment specifics dropdown.

---

## Reimbursement Status

| Value | Meaning | Include in Expense Totals? |
|-------|---------|---------------------------|
| `none` | Normal expense | Yes |
| `pending` | Awaiting reimbursement | Yes (for now) |
| `reimbursed` | Already reimbursed | No |

---

## Google Sheets Structure

| Sheet | Purpose |
|-------|---------|
| People | User profiles (id, name, relationship) |
| NetWorthEntries | Snapshot asset values per date |
| Liabilities | Loans and debts |
| Expenses | All expense transactions (with tags JSON column) |
| Income | Income entries |
| Budgets | Monthly category budgets |
| Goals | Financial targets |
| Categories | Expense categories (editable) |
| Cards | Payment cards for dropdowns |
| Tags | Tag definitions (id, name, color) |

---

## App Navigation

- **Desktop**: Sidebar navigation
- **Mobile**: Bottom tabs
- **Pages**: Home, Wealth, Expenses, Goals
- **Add Expense**: Button always visible (top-right)

---

## Version Roadmap

| Version | Features |
|---------|----------|
| **v1.0** | Core dashboards, Google Sheets backend, manual entry |
| v1.1 | Additional asset classes, recurring expenses, notifications |
| v1.2 | Subscription tracker |
| v1.3 | Credit card benefits tracker |
| v2.0 | Live portfolio APIs, statement imports, multi-user, dark mode |
| v2.1 | AI-powered analysis |

---

## Reference Files

| File | Purpose |
|------|---------|
| **CONTEXT.md** | This file - high-level project context |
| **SPEC.md** | Detailed product specification |
| **PLAN.md** | Implementation plan with task checklist |

---

## Data Source Files (Reference Only)

User's existing data exported to project folder:
- `Net Worth.xlsx` - Current net worth tracking sheets
- `Finances - Expenses.xlsx` - Expense tracking with 2000+ rows

These are reference files. The app will use a new Google Sheet with the defined schema.

---

## Environment & Credentials

**Google Cloud Project:** mapfin-480006
**Service Account:** `mapfin-service@mapfin-480006.iam.gserviceaccount.com`
**Credentials File:** `/Users/mntr-space/Downloads/mapfin-480006-c047ed403fc4.json`
**Google Sheet ID:** `1IYAcIudma-wunVgYyk7R0wFHLf7BXDn4UX4JhE14eZQ`

> **Note:** The service account credentials file path is hardcoded in `server/index.mjs`. Update the path if moving the credentials file.

---

## Current Implementation State

### Phase 1 Complete (Project Setup)
- React + Vite + TypeScript initialized
- Tailwind CSS v3 configured with shadcn theme
- shadcn/ui components installed
- Project folder structure created
- React Router configured with nested routes
- All 4 pages created (Home, Wealth, Expenses, Goals)
- Layout components built (Sidebar, MobileNav, Header)
- Type definitions and constants ready

### Phase 2 Complete (Google Sheets Integration)
- Google Cloud project created with Sheets API enabled
- Service account authentication configured
- Express API server (`server/index.mjs`) running on port 3001
- Full CRUD operations for all 10 sheets
- React hooks created (`src/hooks/useSheetData.ts`)
- API client with typed helpers (`src/lib/api.ts`)
- All pages connected to live Google Sheets data

### Phase 3 Complete (Core UI & Data Import)
- AddExpenseModal component with full form
- Excel data import script (`scripts/import-excel.mjs`)
- Vercel deployment configured
- Currency formatter with INR/USD toggle

### Phase 4 Complete (Settings Page)
- Settings page with currency/format toggles
- SettingsContext for app-wide preferences
- Exchange rate API integration (auto-refreshing)
- Number format options (Indian lakhs/crores vs Western K/M/B)

### Phase 5 Complete (Dashboard Redesign with Charts & Tags)
- **Recharts visualizations**:
  - TimeSeriesBarChart for trends
  - AllocationPieChart for breakdowns
  - ChartContainer and ChartTooltip components
- **Global filters**:
  - PersonTabs (Aggregate/Manan/Anushka)
  - TimeRangeSelector (1M to ALL with auto-granularity)
- **Tags system**:
  - Tags sheet in Google Sheets (id, name, color)
  - Tags column in Expenses sheet (JSON serialized)
  - TagMultiSelect component for selection/creation
  - TagBadge component for display
  - useTags hook with CRUD operations
- **Comparison cards**:
  - YTD expenses with YoY comparison
  - Last month expenses with MoM comparison
- **New data utilities**:
  - `src/lib/dateUtils.ts` - Time range calculations
  - `src/lib/chartUtils.ts` - Data aggregation for charts
- **Page rewrites**:
  - Home: Net worth card, expense cards with comparisons
  - Wealth: Bar/pie charts, person filtering, time range
  - Expenses: Charts, tags filter, transaction list with badges

### Next: Phase 6 (Future)
- Live portfolio API integrations
- Statement imports
- Dark mode
- AI-powered analysis

---

## Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   React App     │────▶│  Express API    │────▶│  Google Sheets  │
│   (Vite)        │     │  (port 3001)    │     │  (via API)      │
│   localhost:5173│     │  localhost:3001 │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

---

*This context document should be read first when resuming work on this project.*
