// Person
export interface Person {
  id: string;
  name: string;
  relationship: 'self' | 'spouse' | 'other';
}

// Asset Categories
export type AssetCategory =
  | 'mutual_funds'
  | 'stocks_india'
  | 'stocks_other'
  | 'epf'
  | 'ppf'
  | 'fixed_deposits'
  | 'digital_assets'
  | 'gold'
  | 'real_estate'
  | 'liquid_cash'
  | 'forex'
  | 'esops_rsus'
  | 'p2p_lending'
  | 'owed'
  | 'debt';

// Net Worth Entry (Snapshot-based)
export interface NetWorthEntry {
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

// Liability Categories
export type LiabilityCategory =
  | 'home_loan'
  | 'car_loan'
  | 'personal_loan'
  | 'credit_card'
  | 'informal_loan';

// Liability
export interface Liability {
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

// Expense Categories
export type ExpenseCategory =
  | 'food_dining'
  | 'groceries'
  | 'transport_travel'
  | 'utilities_rent'
  | 'subscriptions'
  | 'fitness_health'
  | 'family_house_supplies'
  | 'personal'
  | 'gifts'
  | 'leisure'
  | 'other';

// Payment Methods
export type PaymentMethod =
  | 'credit_card'
  | 'debit_card'
  | 'upi'
  | 'transfer'
  | 'cash'
  | 'digital_wallet';

// Reimbursement Status
export type ReimbursementStatus = 'none' | 'pending' | 'reimbursed';

// Expense
export interface Expense {
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

// Income Sources
export type IncomeSource = 'salary' | 'bonus' | 'dividend' | 'interest' | 'other';

// Income
export interface Income {
  id: string;
  date: string;
  amount: number;
  source: IncomeSource;
  person_id: string;
  notes?: string;
}

// Budget
export interface Budget {
  id: string;
  category: ExpenseCategory;
  monthly_limit: number;
}

// Goal Types
export type GoalType = 'net_worth' | 'savings' | 'purchase';

// Goal
export interface Goal {
  id: string;
  name: string;
  type: GoalType;
  target_amount: number;
  current_amount?: number;
  target_date?: string;
  notes?: string;
}

// Card (for payment specifics dropdown)
export interface Card {
  id: string;
  person_id: string;
  bank_name: string;
  card_name: string;
  card_type: 'credit' | 'debit';
  network?: string; // VISA, MC, Amex, RuPay
  status: 'active' | 'inactive';
  notes?: string;
}

// Aggregated data types
export interface NetWorthSummary {
  total: number;
  change: number;
  changePercent: number;
  byCategory: Record<AssetCategory, number>;
}

export interface ExpenseSummary {
  total: number;
  byCategory: Record<ExpenseCategory, number>;
  transactions: Expense[];
}
