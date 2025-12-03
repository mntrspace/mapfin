# MapFin - Product Specification v1.0

**Status:** Phase 5 Implemented
**Last Updated:** December 2025

---

## Overview

MapFin is a personal finance dashboard for tracking wealth and expenses. It provides visibility into "where we are" and "where we're going" financially.

### Core Value Proposition
- **Wealth Watch**: Track net worth across multiple asset classes (snapshot-based)
- **Expense Tracker**: Monitor spending with budgets
- **Goals**: Set and track financial targets
- Multi-person support (Self + Spouse) with aggregate view

---

## Display & Formatting

| Setting | Value |
|---------|-------|
| Currency Symbol | Always show ₹ |
| Number Format | Western (K/M/B) - e.g., ₹1.5M, ₹500K |
| Calendar | Calendar year (Jan-Dec) |
| Theme | Light (default) |

---

## App Structure

### Navigation
- **Desktop**: Sidebar navigation
- **Mobile**: Bottom tabs (collapsed sidebar)
- **Nav Items**: Home, Wealth, Expenses, Goals
- **Add Expense**: Button always visible (top-right)

### Pages
1. **Home** - Summary dashboard with key metrics from all sections
2. **Wealth Watch** - Full net worth breakdown
3. **Expenses** - Spending tracker with budgets
4. **Goals** - Financial goals and progress

---

## v1.0 Scope

### Net Worth Tracking (Snapshot-Based)

For v1.0, net worth is tracked via periodic snapshots rather than transaction history.
Each entry represents a point-in-time value of an asset.

**Future (v2.0+)**: API integrations for live portfolio tracking.

### Asset Categories

| Category | Data Entry | Notes |
|----------|------------|-------|
| Mutual Funds | Snapshot value | Future: live NAV |
| Stocks - India | Snapshot value | Future: live prices |
| Stocks - Other | Snapshot value + currency | Future: live prices + forex |
| EPF | Snapshot value | |
| PPF | Snapshot value | |
| Fixed Deposits | Snapshot value | |
| Digital Assets | Snapshot value | Future: live crypto prices |
| Gold | Snapshot value or weight | Can store weight for manual calc |
| Real Estate | Snapshot value | Purchase price + estimated |
| Liquid Cash / Bank | Snapshot value | |
| Forex | Snapshot value + currency | Foreign currency holdings |
| ESOPs / RSUs | Snapshot value | |
| P2P Lending | Snapshot value | |
| Owed | Snapshot value | Money lent out |
| Debt | Snapshot value (negative) | Money owed (liability) |

### Liability Categories

| Category | Fields |
|----------|--------|
| Home Loan | Principal, Outstanding, Rate, EMI |
| Car Loan | Principal, Outstanding, Rate, EMI |
| Personal Loan | Principal, Outstanding, Rate, EMI |
| Credit Card | Current balance |
| Informal Loans | Amount owed |

### Expense Categories

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

*Users can add new categories*

### Payment Methods

| Method | Example Specifics |
|--------|-------------------|
| Credit Card | "Axis Ace", "ICICI Sapphiro" |
| Debit Card | "HDFC Bank", "Niyo Global" |
| UPI | "GPay - HDFC", "PhonePe" |
| Transfer | "Bank Transfer - HDFC" |
| Cash | - |
| Digital Wallet | "Paytm", "Amazon Pay" |

---

## Data Model

### Person
```
id, name, relationship (self/spouse/other)
```

### Net Worth Entry (Snapshot)
```
id, report_date, person_id, category, amount_inr,
currency_original, amount_original, description, notes
```

Each row = one asset's value at a point in time.
Multiple entries per report_date (one per asset).

### Liability
```
id, person_id, category, name, principal, outstanding,
interest_rate, emi, currency, last_updated, notes
```

### Expense
```
id, date, description, category, currency_amount, inr_amount,
payment_method, payment_specifics, transaction_details,
remarks, person_id, reimbursement_status, tags (JSON)
```

### Tag
```
id, name, color (hex)
```
Tags are stored as JSON array in Expense.tags: `[{"id":"...", "name":"...", "color":"#3b82f6"}]`

**Reimbursement Status Values:**
| Value | Meaning | Include in Totals? |
|-------|---------|-------------------|
| `none` | Normal expense, not reimbursable | Yes |
| `pending` | Awaiting reimbursement | Yes |
| `reimbursed` | Already reimbursed | No |

### Income
```
id, date, amount, source, person_id, notes
```

### Budget
```
id, category, monthly_limit
```

### Goal
```
id, name, type, target_amount, target_date, notes
```

### Card (Payment Methods)
```
id, person_id, bank_name, card_name, card_type (credit/debit),
network (VISA/MC/Amex/RuPay), status (active/inactive), notes
```

Used to populate payment_specifics dropdown.

---

## Google Sheets Structure

| Sheet | Purpose | Key Columns |
|-------|---------|-------------|
| **People** | User profiles | id, name, relationship |
| **NetWorthEntries** | Snapshot asset values | report_date, person_id, category, amount_inr, description |
| **Liabilities** | Loans and debts | person_id, category, name, outstanding, emi |
| **Expenses** | All transactions | date, description, category, inr_amount, payment_method, payment_specifics, reimbursement_status, person_id, tags |
| **Income** | Income entries | date, amount, source, person_id |
| **Budgets** | Monthly limits | category, monthly_limit |
| **Goals** | Financial targets | name, type, target_amount, target_date |
| **Categories** | Expense categories | name (editable list) |
| **Cards** | Payment cards | person_id, bank_name, card_name, card_type, status |
| **Tags** | Tag definitions | id, name, color |

---

## Technical Stack

| Component | Technology |
|-----------|------------|
| Frontend | React + Vite |
| Styling | Tailwind CSS |
| Components | shadcn/ui |
| Charts | Recharts |
| Routing | React Router |
| Backend (v1) | Google Sheets API |
| Backend (v2) | Supabase |
| Hosting | Vercel |

---

## Features

### Wealth Watch Dashboard
- Net worth display with trend indicator (↑/↓ %)
- Person toggle: Self / Spouse / Aggregate
- Time range selector: 3M, 6M, 1Y, 2Y, 5Y, All
- Asset allocation pie/donut chart
- Category-wise breakdown (expandable)
- Liabilities section
- Historical net worth line chart

### Expense Tracker Dashboard
- Monthly summary by category
- Budget vs actual comparison
- Category progress bars (green/yellow/red)
- Transaction list with category colors (colored left border + badge)
- "Add Expense" modal (quick-add)
- Month-over-month trends
- YTD vs last year comparison
- Pagination for large transaction lists
- Reimbursement status filter

### Transaction Filters (Collapsible Panel)
- **Category** - Multi-select dropdown
- **Amount Range** - Min/max INR inputs
- **Payment Method** - Multi-select dropdown
- **Payment Specifics** - Multi-select (from Cards)
- **Tags** - Multi-select filter
- **Reimbursement Status** - Multi-select (none/pending/reimbursed)
- Person tabs (Self/Spouse/Aggregate)
- Time range selector (1M to ALL)
- Fuzzy search on description
- Active filter count badge
- Clear all filters button

### Goals
- Goal cards with progress bars
- Types: Net worth target, Savings goal, Purchase goal
- Projected completion date
- Monthly contribution needed

### Income Tracking
- Track entries: salary, bonus, dividend, interest, other
- Savings rate calculation
- Income vs expense visualization

### Budgeting
- Monthly limits per expense category
- Visual overspend alerts
- Link budgets to goals

---

## Visualizations

### Wealth Watch
- Net worth box with trend arrow
- Asset allocation pie/donut chart
- Net worth trend line chart (from snapshots)
- Category breakdown bar chart

### Expense Tracker
- Spending pie chart by category
- Monthly trend bar chart
- Budget vs actual progress bars
- Time range: Week, Month, Quarter, Year

---

## Multi-Currency

- **Storage**: Both original currency amount AND INR amount
- **Display**: Show INR (converted)
- **Expense columns**: `currency_amount` + `inr_amount`
- **Net Worth**: `amount_original` + `currency_original` + `amount_inr`
- **Currencies**: INR (primary), USD, AED, others as needed

---

## Future Roadmap

### v1.1
- Additional asset categories fully supported
- Recurring expense templates
- Budget/goal notifications

### v1.2 - Subscription Tracker
- Dedicated subscriptions sheet and UI
- Monthly/annual cost breakdown
- Renewal reminders

### v1.3 - Credit Card Benefits
- Full card tracking (LTF, fees, benefits)
- Track reward points
- Milestone spend tracking
- Optimal card suggestions

### v2.0 - Live Portfolio Tracking
- API integrations for stocks/MF/crypto
- Real-time net worth
- Bank/CC statement import
- Email/SMS expense parsing
- Multi-user access
- Dark mode

### v2.1 - AI Analysis
- Portfolio analysis
- Asset allocation suggestions
- Spending insights
- What-if scenarios

---

## Backup & Security

- Primary backup via Google Sheets version history
- Historical edits allowed
- Transaction details field for receipts/links
- Future: CSV/Excel export

---

*Spec Version: 1.0.1 (Post Data Analysis)*
