# MapFin - Implementation Plan v1.0

**Status:** IN PROGRESS - Phase 6 Complete (Expense Filters & Pagination)
**Last Updated:** December 4, 2025

> **Resume Instructions:** If returning to this project after a break, read this file and CONTEXT.md first. Check the "Current Status" section below to see where implementation left off. Each phase has checkboxes - find the first unchecked item and continue from there.

---

## Quick Reference

| Item | Value |
|------|-------|
| Project Path | `/Users/mntr-space/Documents/Projects/CtrlFin/MapFin` |
| Tech Stack | React + Vite + Tailwind + shadcn/ui + Recharts |
| Backend | Google Sheets API (v1.0) |
| Hosting | Vercel |

---

## Implementation Phases

### Phase 1: Project Setup
**Estimated Tasks: 5** - COMPLETED

- [x] 1.1 Initialize React + Vite project with TypeScript
- [x] 1.2 Configure Tailwind CSS
- [x] 1.3 Install and configure shadcn/ui
- [x] 1.4 Set up project folder structure
- [x] 1.5 Configure React Router with routes

**Folder Structure:**
```
src/
├── components/
│   ├── ui/           # shadcn components
│   ├── layout/       # Sidebar, Header, MobileNav
│   ├── charts/       # Chart components
│   ├── forms/        # Form components
│   └── shared/       # Shared components
├── pages/
│   ├── Home.tsx
│   ├── Wealth.tsx
│   ├── Expenses.tsx
│   └── Goals.tsx
├── hooks/
│   └── useGoogleSheets.ts
├── lib/
│   ├── sheets.ts     # Google Sheets API
│   ├── utils.ts      # Utility functions
│   └── formatters.ts # Currency/number formatting
├── types/
│   └── index.ts      # TypeScript types
├── constants/
│   └── index.ts      # Categories, payment methods, etc.
└── App.tsx
```

---

### Phase 2: Google Sheets Integration
**Estimated Tasks: 6** - COMPLETED

- [x] 2.1 Create Google Cloud project and enable Sheets API
- [x] 2.2 Set up API credentials (service account with JSON key)
- [x] 2.3 Create the MapFin Google Sheet with all tabs
- [x] 2.4 Build sheets API wrapper (read functions)
- [x] 2.5 Build sheets API wrapper (write functions)
- [x] 2.6 Create React hooks for data fetching

**Implementation Details:**
- Service Account: `mapfin-service@mapfin-480006.iam.gserviceaccount.com`
- Express API server at `server/index.mjs` (port 3001)
- Full CRUD operations for all 9 sheets
- React hooks in `src/hooks/useSheetData.ts`
- API client in `src/lib/api.ts`

**Google Sheet Tabs to Create:**
1. **People** - id, name, relationship
2. **NetWorthEntries** - report_date, person_id, category, amount_inr, currency_original, amount_original, description, notes
3. **Liabilities** - id, person_id, category, name, principal, outstanding, interest_rate, emi, currency, last_updated, notes
4. **Expenses** - id, date, description, category, currency_amount, inr_amount, payment_method, payment_specifics, transaction_details, remarks, person_id, reimbursement_status
5. **Income** - id, date, amount, source, person_id, notes
6. **Budgets** - id, category, monthly_limit
7. **Goals** - id, name, type, target_amount, target_date, notes
8. **Categories** - id, name (editable expense categories)
9. **Cards** - id, person_id, bank_name, card_name, card_type, network, status, notes

---

### Phase 3: Core UI Components
**Estimated Tasks: 8**

- [ ] 3.1 Create Layout component with sidebar
- [ ] 3.2 Create Sidebar navigation component
- [ ] 3.3 Create mobile bottom tabs navigation
- [ ] 3.4 Create Header component with "Add Expense" button
- [ ] 3.5 Create AddExpenseModal component
- [ ] 3.6 Create currency formatter utility (₹1.5M format)
- [ ] 3.7 Create shared Card/Stat components
- [ ] 3.8 Set up responsive breakpoints

**Navigation Items:**
- Home (dashboard icon)
- Wealth (wallet icon)
- Expenses (receipt icon)
- Goals (target icon)

---

### Phase 4: Home Dashboard
**Estimated Tasks: 5**

- [ ] 4.1 Create Home page layout
- [ ] 4.2 Create NetWorthSummary card (big number + trend)
- [ ] 4.3 Create MonthlySpendingSummary card
- [ ] 4.4 Create GoalsSummary card
- [ ] 4.5 Create quick action buttons (links to other pages)

---

### Phase 5: Wealth Watch Dashboard
**Estimated Tasks: 9**

- [ ] 5.1 Create Wealth page layout
- [ ] 5.2 Create PersonToggle component (Self/Spouse/Aggregate)
- [ ] 5.3 Create TimeRangeSelector component (3M, 6M, 1Y, 2Y, 5Y, All)
- [ ] 5.4 Create NetWorthDisplay component (big number + change %)
- [ ] 5.5 Create AssetAllocationChart (pie/donut)
- [ ] 5.6 Create CategoryBreakdown component (expandable list)
- [ ] 5.7 Create LiabilitiesSection component
- [ ] 5.8 Create NetWorthTrendChart (line chart over time)
- [ ] 5.9 Implement data aggregation logic (by person, by category)

---

### Phase 6: Expense Tracker Dashboard
**Estimated Tasks: 11** - COMPLETED

- [x] 6.1 Create Expenses page layout
- [x] 6.2 Create MonthlySummary component (total + by category)
- [x] 6.3 Create SpendingPieChart component (AllocationPieChart)
- [x] 6.4 Create MonthlyTrendChart (TimeSeriesBarChart)
- [x] 6.5 Create BudgetProgressBars component (budget remaining display)
- [x] 6.6 Create TransactionList component with category colors
- [x] 6.7 Create TransactionFilters component (ExpenseFilters - collapsible multi-select)
- [x] 6.8 Create Pagination component (page numbers + size selector)
- [x] 6.9 Add category color constants (EXPENSE_CATEGORY_COLORS)
- [x] 6.10 Implement reimbursement status filter
- [x] 6.11 Implement fuzzy search on description

**Implementation Details:**
- ExpenseFilters: Collapsible panel with multi-select for categories, payment methods, payment specifics, tags, amount range, reimbursement status
- Pagination: Page navigation with ellipsis, page size selector (25/50/100)
- Category colors: Each category has a distinct color shown as left border and badge
- Filters: Active filter count badge, clear all button

---

### Phase 7: Goals Dashboard
**Estimated Tasks: 5**

- [ ] 7.1 Create Goals page layout
- [ ] 7.2 Create GoalCard component (progress bar + projection)
- [ ] 7.3 Create AddGoalModal component
- [ ] 7.4 Create EditGoalModal component
- [ ] 7.5 Implement goal projection calculation

---

### Phase 8: Polish & Refinements
**Estimated Tasks: 6**

- [ ] 8.1 Add loading states and skeletons
- [ ] 8.2 Add error handling and error boundaries
- [ ] 8.3 Mobile responsiveness testing and fixes
- [ ] 8.4 Performance optimization (memoization, lazy loading)
- [ ] 8.5 Add empty states for no data
- [ ] 8.6 Final UI polish and consistency check

---

## Data Models (TypeScript)

```typescript
// Person
interface Person {
  id: string;
  name: string;
  relationship: 'self' | 'spouse' | 'other';
}

// Net Worth Entry (Snapshot-based)
interface NetWorthEntry {
  id: string;
  report_date: string; // ISO date
  person_id: string;
  category: AssetCategory;
  amount_inr: number;
  currency_original?: string;
  amount_original?: number;
  description: string;
  notes?: string;
}

// Asset Categories
type AssetCategory =
  | 'mutual_funds' | 'stocks_india' | 'stocks_other'
  | 'epf' | 'ppf' | 'fixed_deposits' | 'digital_assets'
  | 'gold' | 'real_estate' | 'liquid_cash' | 'forex'
  | 'esops_rsus' | 'p2p_lending' | 'owed' | 'debt';

// Liability
interface Liability {
  id: string;
  person_id: string;
  category: LiabilityCategory;
  name: string;
  principal: number;
  outstanding: number;
  interest_rate?: number;
  emi?: number;
  currency: string;
  last_updated: string;
  notes?: string;
}

type LiabilityCategory =
  | 'home_loan' | 'car_loan' | 'personal_loan'
  | 'credit_card' | 'informal_loan';

// Expense
interface Expense {
  id: string;
  date: string;
  description: string;
  category: ExpenseCategory;
  currency_amount: number | string; // Can be "$50" or 50
  inr_amount: number;
  payment_method: PaymentMethod;
  payment_specifics: string;
  transaction_details?: string; // Google Drive link, etc.
  remarks?: string;
  person_id: string;
  reimbursement_status: ReimbursementStatus;
}

type ExpenseCategory =
  | 'food_dining' | 'groceries' | 'transport_travel'
  | 'utilities_rent' | 'subscriptions' | 'fitness_health'
  | 'family_house_supplies' | 'personal' | 'gifts'
  | 'leisure' | 'other';

type PaymentMethod =
  | 'credit_card' | 'debit_card' | 'upi'
  | 'transfer' | 'cash' | 'digital_wallet';

type ReimbursementStatus = 'none' | 'pending' | 'reimbursed';

// Income
interface Income {
  id: string;
  date: string;
  amount: number;
  source: IncomeSource;
  person_id: string;
  notes?: string;
}

type IncomeSource = 'salary' | 'bonus' | 'dividend' | 'interest' | 'other';

// Budget
interface Budget {
  id: string;
  category: ExpenseCategory;
  monthly_limit: number;
}

// Goal
interface Goal {
  id: string;
  name: string;
  type: GoalType;
  target_amount: number;
  target_date?: string;
  notes?: string;
}

type GoalType = 'net_worth' | 'savings' | 'purchase';

// Card (for payment specifics dropdown)
interface Card {
  id: string;
  person_id: string;
  bank_name: string;
  card_name: string;
  card_type: 'credit' | 'debit';
  network?: string; // VISA, MC, Amex, RuPay
  status: 'active' | 'inactive';
  notes?: string;
}
```

---

## Display & Formatting

| Setting | Implementation |
|---------|----------------|
| Currency | Always prefix with ₹ |
| Large Numbers | Use K/M/B format (₹1.5M, ₹500K) |
| Percentages | Show with 1 decimal (12.5%) |
| Dates | DD MMM YYYY (25 Dec 2024) |
| Theme | Light mode default |

**Formatter Function:**
```typescript
function formatCurrency(amount: number): string {
  if (amount >= 1000000000) return `₹${(amount / 1000000000).toFixed(1)}B`;
  if (amount >= 1000000) return `₹${(amount / 1000000).toFixed(1)}M`;
  if (amount >= 1000) return `₹${(amount / 1000).toFixed(1)}K`;
  return `₹${amount.toFixed(0)}`;
}
```

---

## Google Sheets API Setup

1. Go to Google Cloud Console
2. Create new project "MapFin"
3. Enable Google Sheets API
4. Create API Key (for read-only public sheets) OR Service Account (for read/write)
5. For v1.0: Use API Key with a sheet that's "Anyone with link can view"
6. Store API key in `.env.local` as `VITE_GOOGLE_SHEETS_API_KEY`
7. Store Sheet ID in `.env.local` as `VITE_GOOGLE_SHEET_ID`

---

## Key Files to Create

| File | Purpose |
|------|---------|
| `src/lib/sheets.ts` | Google Sheets API wrapper |
| `src/lib/formatters.ts` | Currency/date formatting |
| `src/hooks/useSheetData.ts` | Data fetching hooks |
| `src/types/index.ts` | All TypeScript interfaces |
| `src/constants/categories.ts` | Category lists |
| `src/components/layout/Layout.tsx` | Main layout wrapper |
| `src/components/layout/Sidebar.tsx` | Desktop navigation |
| `src/components/layout/MobileNav.tsx` | Mobile bottom tabs |
| `src/components/modals/AddExpenseModal.tsx` | Quick add expense |

---

## Dependencies to Install

```bash
# Core
npm create vite@latest . -- --template react-ts
npm install react-router-dom

# Styling
npm install -D tailwindcss postcss autoprefixer
npm install class-variance-authority clsx tailwind-merge

# shadcn/ui (run after tailwind setup)
npx shadcn@latest init
npx shadcn@latest add button card dialog input select

# Charts
npm install recharts

# Utilities
npm install date-fns
npm install lucide-react  # Icons

# Google Sheets (if using gapi)
# Or just use fetch with API key
```

---

## Environment Variables

```env
VITE_GOOGLE_SHEETS_API_KEY=your_api_key_here
VITE_GOOGLE_SHEET_ID=your_sheet_id_here
```

---

## Resume Points

If implementation is interrupted, check which phase/task was last completed and continue from there. Each task is designed to be independently completable.

**Current Status:** Phase 6 Complete - Ready for Phase 7 (Goals Dashboard)

---

## Notes from Data Analysis

1. **Net Worth is snapshot-based** - Each row = one asset's value at a point in time
2. **Expenses match user's existing columns** - currency_amount, inr_amount, payment_specifics, transaction_details, remarks, reimbursement_status
3. **Reimbursement status**: `none` | `pending` | `reimbursed` (only `reimbursed` excluded from totals)
4. **Cards sheet** - Simple version for v1.0 to populate payment_specifics dropdown
5. **Multi-currency** - Store both original currency amount AND INR amount
6. **User has 2000+ expense rows** - Need efficient rendering (virtualization if needed)

---

## Future Phases (Not v1.0)

- v1.1: Additional asset classes, recurring expenses, notifications
- v1.2: Subscription tracker
- v1.3: Credit card benefits tracker (full card details, points, milestones)
- v2.0: Live portfolio tracking via APIs, statement imports, multi-user
- v2.1: AI-powered analysis

---

## Project Files

| File | Location | Purpose |
|------|----------|---------|
| **CONTEXT.md** | Project root | High-level project context and decisions |
| **SPEC.md** | Project root | Detailed product specification |
| **PLAN.md** | Project root | This implementation plan |

---

*This plan document should be read alongside CONTEXT.md when resuming work on this project.*

---

## Security Vulnerabilities (Dependabot)

**Status:** 16 vulnerabilities detected - December 3, 2025
**Dependabot URL:** https://github.com/mntrspace/mapfin/security/dependabot

### HIGH Priority (3)

- [ ] **path-to-regexp** - ReDoS via backtracking regular expressions
  - Impact: Server-side request handling could be slowed
  - Fix: Update to latest version

- [ ] **xlsx** - Regular Expression Denial of Service (ReDoS)
  - Impact: Excel import script could hang on malformed files
  - Fix: Update xlsx package or replace with alternative (e.g., exceljs)

- [ ] **xlsx** - Prototype Pollution in SheetJS
  - Impact: Potential code execution via crafted spreadsheet
  - Fix: Same as above - update or replace xlsx

### MEDIUM Priority (9)

- [ ] **esbuild** - Dev server request bypass (any website can read responses)
  - Impact: Dev-only, but could leak source code
  - Fix: Update esbuild (via vite update)

- [ ] **undici** - Use of insufficiently random values
  - Impact: Potential security weaknesses in HTTP client
  - Fix: Update undici

- [ ] **js-yaml** - Prototype pollution in merge (`<<`)
  - Impact: Potential code execution via crafted YAML
  - Fix: Update js-yaml

- [ ] **vite** - Multiple server.fs.deny bypasses (6 issues)
  - server.fs.deny bypass via backslash on Windows
  - server.fs.deny bypassed with `/` for files under project root
  - server.fs.deny bypass with invalid request-target
  - server.fs.deny bypass with .svg or relative paths
  - server.fs.deny bypassed for inline/raw with ?import
  - server.fs.deny bypass using ?raw??
  - Impact: Dev server could serve restricted files
  - Fix: Update vite to latest version

### LOW Priority (4)

- [ ] **undici** - Denial of Service via bad certificate data
  - Impact: HTTP client could crash on malformed certs
  - Fix: Update undici

- [ ] **vite** - HTML files not respecting server.fs settings
  - Impact: Dev-only, minor file access issue
  - Fix: Included in vite update

- [ ] **vite** - Public directory name collision
  - Impact: Dev-only, minor file serving issue
  - Fix: Included in vite update

- [ ] **@eslint/plugin-kit** - ReDoS through ConfigCommentParser
  - Impact: Linting could hang on crafted comments
  - Fix: Update eslint dependencies

### Recommended Actions

1. **Update vite** to latest version (fixes 8 issues):
   ```bash
   npm update vite
   ```

2. **Update undici** (fixes 2 issues):
   ```bash
   npm update undici
   ```

3. **Replace or update xlsx** (fixes 2 HIGH issues):
   - Option A: `npm update xlsx`
   - Option B: Replace with `exceljs` for Excel parsing

4. **Run npm audit fix** for remaining issues:
   ```bash
   npm audit fix
   ```
