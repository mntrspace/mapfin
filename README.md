# MapFin

Personal finance dashboard for tracking wealth and expenses. Built with React, TypeScript, and Google Sheets as the backend.

## Features

- **Wealth Watch**: Track net worth across multiple asset classes (mutual funds, stocks, real estate, etc.)
- **Expense Tracker**: Monitor spending with categories and budgets
  - Category-colored transactions (colored borders + badges)
  - Advanced filters: categories, payment methods, tags, amount ranges, payment specifics
  - Pagination for large transaction lists
  - YTD and month-over-month comparisons
- **Goals**: Set and track financial targets
- **Multi-person Support**: Track finances for self and spouse with aggregate views
- **Charts & Visualizations**: Recharts-powered bar and pie charts
- **Tags System**: Tag expenses for custom categorization

## Tech Stack

- **Frontend**: React + Vite + TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **Charts**: Recharts
- **Backend**: Express.js API server + Google Sheets API
- **Icons**: Lucide React

## Prerequisites

- Node.js 22+
- Google Cloud project with Sheets API enabled
- Service account credentials (JSON key file)
- Google Sheet shared with the service account

## Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/mapfin.git
   cd mapfin
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Google Sheets credentials**

   Update `server/index.mjs` with your:
   - Service account credentials file path
   - Google Sheet ID

4. **Share your Google Sheet**

   Share your Google Sheet with the service account email (found in your JSON credentials file).

## Running the App

```bash
# Start API server (connects to Google Sheets)
npm run server

# In another terminal, start the frontend
npm run dev

# Or run both together
npm run dev:all
```

Visit `http://localhost:5173` to view the app.

## Google Sheet Structure

The app expects a Google Sheet with these tabs:

| Sheet | Purpose |
|-------|---------|
| People | User profiles (id, name, relationship) |
| NetWorthEntries | Snapshot asset values per date |
| Liabilities | Loans and debts |
| Expenses | All expense transactions |
| Income | Income entries |
| Budgets | Monthly category budgets |
| Goals | Financial targets |
| Categories | Expense categories |
| Cards | Payment cards for dropdowns |

## Project Structure

```
src/
├── components/
│   ├── ui/           # shadcn components
│   ├── layout/       # Sidebar, Header, MobileNav
│   ├── charts/       # Chart components
│   └── shared/       # Shared components
├── pages/
│   ├── Home.tsx      # Dashboard overview
│   ├── Wealth.tsx    # Net worth tracking
│   ├── Expenses.tsx  # Expense tracking
│   └── Goals.tsx     # Financial goals
├── hooks/
│   └── useSheetData.ts  # Data fetching hooks
├── lib/
│   ├── api.ts        # API client
│   ├── utils.ts      # Utility functions
│   └── formatters.ts # Currency/date formatting
├── types/
│   └── index.ts      # TypeScript types
└── constants/
    └── index.ts      # Categories, payment methods, etc.

server/
└── index.mjs         # Express API server
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start frontend dev server |
| `npm run server` | Start API server |
| `npm run dev:all` | Start both servers |
| `npm run build` | Build for production |
| `npm run lint` | Run ESLint |

## Documentation

- [CONTEXT.md](./CONTEXT.md) - Project context and decisions
- [SPEC.md](./SPEC.md) - Product specification
- [PLAN.md](./PLAN.md) - Implementation plan with progress

## Currency Display

- Always displays in INR (₹)
- Uses Western notation: ₹1.5M, ₹500K, ₹100B
- Multi-currency support stores both original and INR amounts

## License

Private project - Not for distribution.
