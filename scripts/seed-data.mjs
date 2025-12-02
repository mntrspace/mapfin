/**
 * Seed script to populate Google Sheets with sample data
 * Run with: node scripts/seed-data.mjs
 * Make sure API server is running first: npm run server
 */

const API_BASE = 'http://localhost:3001/api';

// Delay helper to avoid rate limiting
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function post(endpoint, data) {
  // Add delay to avoid rate limiting (1.5 seconds)
  await delay(1500);

  const response = await fetch(`${API_BASE}${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to POST ${endpoint}: ${error}`);
  }
  return response.json();
}

async function seedPeople() {
  console.log('Seeding People...');
  const people = [
    { id: 'manan', name: 'Manan', relationship: 'self' },
    { id: 'anushka', name: 'Anushka', relationship: 'spouse' },
  ];
  for (const person of people) {
    await post('/People', person);
    console.log(`  Added: ${person.name}`);
  }
}

async function seedCards() {
  console.log('Seeding Cards...');
  const cards = [
    { person_id: 'manan', bank_name: 'Axis', card_name: 'Ace Credit Card', card_type: 'credit', network: 'VISA', status: 'active' },
    { person_id: 'manan', bank_name: 'ICICI', card_name: 'Amazon Pay Credit', card_type: 'credit', network: 'VISA', status: 'active' },
    { person_id: 'manan', bank_name: 'HDFC', card_name: 'Millennia', card_type: 'credit', network: 'MC', status: 'active' },
    { person_id: 'manan', bank_name: 'HDFC', card_name: 'Savings Account', card_type: 'debit', network: 'VISA', status: 'active' },
    { person_id: 'manan', bank_name: 'Niyo', card_name: 'Global Card', card_type: 'debit', network: 'VISA', status: 'active' },
    { person_id: 'anushka', bank_name: 'ICICI', card_name: 'Coral Credit', card_type: 'credit', network: 'MC', status: 'active' },
    { person_id: 'anushka', bank_name: 'HDFC', card_name: 'Savings Account', card_type: 'debit', network: 'VISA', status: 'active' },
    { person_id: 'manan', bank_name: '', card_name: 'GPay (HDFC)', card_type: 'debit', network: 'UPI', status: 'active' },
    { person_id: 'manan', bank_name: '', card_name: 'PhonePe', card_type: 'debit', network: 'UPI', status: 'active' },
    { person_id: 'anushka', bank_name: '', card_name: 'GPay (ICICI)', card_type: 'debit', network: 'UPI', status: 'active' },
  ];
  for (const card of cards) {
    await post('/Cards', card);
    console.log(`  Added: ${card.card_name}`);
  }
}

async function seedBudgets() {
  console.log('Seeding Budgets...');
  const budgets = [
    { category: 'food_dining', monthly_limit: 25000 },
    { category: 'groceries', monthly_limit: 15000 },
    { category: 'transport_travel', monthly_limit: 20000 },
    { category: 'utilities_rent', monthly_limit: 50000 },
    { category: 'subscriptions', monthly_limit: 5000 },
    { category: 'fitness_health', monthly_limit: 10000 },
    { category: 'family_house_supplies', monthly_limit: 15000 },
    { category: 'personal', monthly_limit: 10000 },
    { category: 'gifts', monthly_limit: 5000 },
    { category: 'leisure', monthly_limit: 15000 },
    { category: 'other', monthly_limit: 10000 },
  ];
  for (const budget of budgets) {
    await post('/Budgets', budget);
    console.log(`  Added: ${budget.category} - ${budget.monthly_limit}`);
  }
}

async function seedNetWorthEntries() {
  console.log('Seeding NetWorthEntries...');

  // 3 months of data: Oct, Nov, Dec 2024
  const months = [
    { date: '2024-10-01', suffix: 'Oct' },
    { date: '2024-11-01', suffix: 'Nov' },
    { date: '2024-12-01', suffix: 'Dec' },
  ];

  // Asset values for each month (in INR)
  const assetValues = {
    mutual_funds: [2500000, 2650000, 2700000],
    stocks_india: [1500000, 1450000, 1600000],
    epf: [800000, 820000, 840000],
    ppf: [500000, 510000, 520000],
    fixed_deposits: [1000000, 1000000, 1000000],
    liquid_cash: [300000, 250000, 400000],
    real_estate: [7500000, 7500000, 7500000],
  };

  for (let i = 0; i < months.length; i++) {
    const { date } = months[i];

    // Manan's assets (70%)
    for (const [category, values] of Object.entries(assetValues)) {
      const mananValue = Math.round(values[i] * 0.7);
      await post('/NetWorthEntries', {
        report_date: date,
        person_id: 'manan',
        category,
        amount_inr: mananValue,
        description: `${category.replace('_', ' ')} - Manan`,
      });
    }

    // Anushka's assets (30%)
    for (const [category, values] of Object.entries(assetValues)) {
      const anushkaValue = Math.round(values[i] * 0.3);
      await post('/NetWorthEntries', {
        report_date: date,
        person_id: 'anushka',
        category,
        amount_inr: anushkaValue,
        description: `${category.replace('_', ' ')} - Anushka`,
      });
    }

    console.log(`  Added entries for ${date}`);
  }
}

async function seedLiabilities() {
  console.log('Seeding Liabilities...');
  const liabilities = [
    {
      person_id: 'manan',
      category: 'home_loan',
      name: 'HDFC Home Loan',
      principal: 5000000,
      outstanding: 4200000,
      interest_rate: 8.5,
      emi: 45000,
      currency: 'INR',
      last_updated: '2024-12-01',
    },
    {
      person_id: 'manan',
      category: 'car_loan',
      name: 'Maruti Car Loan',
      principal: 800000,
      outstanding: 350000,
      interest_rate: 9.0,
      emi: 18000,
      currency: 'INR',
      last_updated: '2024-12-01',
    },
  ];
  for (const liability of liabilities) {
    await post('/Liabilities', liability);
    console.log(`  Added: ${liability.name}`);
  }
}

async function seedGoals() {
  console.log('Seeding Goals...');
  const goals = [
    {
      name: 'Net Worth 2 Crore',
      type: 'net_worth',
      target_amount: 20000000,
      current_amount: 14100000,
      target_date: '2026-12-31',
      notes: 'Target net worth of 2 crore by end of 2026',
    },
    {
      name: 'Emergency Fund',
      type: 'savings',
      target_amount: 1000000,
      current_amount: 400000,
      target_date: '2025-06-30',
      notes: '6 months of expenses as emergency fund',
    },
    {
      name: 'Europe Trip',
      type: 'purchase',
      target_amount: 500000,
      current_amount: 150000,
      target_date: '2025-09-01',
      notes: '2-week Europe trip for anniversary',
    },
  ];
  for (const goal of goals) {
    await post('/Goals', goal);
    console.log(`  Added: ${goal.name}`);
  }
}

async function seedExpenses() {
  console.log('Seeding Expenses...');
  const expenses = [
    // November 2024 expenses
    { date: '2024-11-02', description: 'Swiggy - Dinner', category: 'food_dining', inr_amount: 850, payment_method: 'credit_card', payment_specifics: 'Axis Ace', person_id: 'manan', reimbursement_status: 'none' },
    { date: '2024-11-03', description: 'BigBasket Weekly Groceries', category: 'groceries', inr_amount: 3200, payment_method: 'upi', payment_specifics: 'GPay (HDFC)', person_id: 'manan', reimbursement_status: 'none' },
    { date: '2024-11-05', description: 'Uber to Office', category: 'transport_travel', inr_amount: 450, payment_method: 'upi', payment_specifics: 'PhonePe', person_id: 'manan', reimbursement_status: 'pending' },
    { date: '2024-11-07', description: 'Netflix Subscription', category: 'subscriptions', inr_amount: 649, payment_method: 'credit_card', payment_specifics: 'HDFC Millennia', person_id: 'manan', reimbursement_status: 'none' },
    { date: '2024-11-08', description: 'Cult.fit Gym Membership', category: 'fitness_health', inr_amount: 3000, payment_method: 'debit_card', payment_specifics: 'HDFC Savings', person_id: 'anushka', reimbursement_status: 'none' },
    { date: '2024-11-10', description: 'Amazon - Clothes', category: 'personal', inr_amount: 2500, payment_method: 'credit_card', payment_specifics: 'ICICI Amazon Pay', person_id: 'manan', reimbursement_status: 'none' },
    { date: '2024-11-12', description: 'Electricity Bill', category: 'utilities_rent', inr_amount: 2800, payment_method: 'upi', payment_specifics: 'GPay (HDFC)', person_id: 'manan', reimbursement_status: 'none' },
    { date: '2024-11-15', description: 'Birthday Gift for Friend', category: 'gifts', inr_amount: 1500, payment_method: 'upi', payment_specifics: 'GPay (ICICI)', person_id: 'anushka', reimbursement_status: 'none' },
    { date: '2024-11-18', description: 'Zomato Gold Dinner', category: 'food_dining', inr_amount: 1200, payment_method: 'credit_card', payment_specifics: 'Axis Ace', person_id: 'manan', reimbursement_status: 'none' },
    { date: '2024-11-20', description: 'Home Cleaning Supplies', category: 'family_house_supplies', inr_amount: 800, payment_method: 'cash', payment_specifics: '', person_id: 'anushka', reimbursement_status: 'none' },

    // December 2024 expenses
    { date: '2024-12-01', description: 'Rent - December', category: 'utilities_rent', inr_amount: 35000, payment_method: 'transfer', payment_specifics: 'Bank Transfer', person_id: 'manan', reimbursement_status: 'none' },
    { date: '2024-12-01', description: 'Spotify Family Plan', category: 'subscriptions', inr_amount: 179, payment_method: 'credit_card', payment_specifics: 'HDFC Millennia', person_id: 'manan', reimbursement_status: 'none' },
    { date: '2024-12-02', description: 'Petrol Fill', category: 'transport_travel', inr_amount: 3500, payment_method: 'credit_card', payment_specifics: 'ICICI Amazon Pay', person_id: 'manan', reimbursement_status: 'none' },
    { date: '2024-12-03', description: 'Starbucks Coffee', category: 'food_dining', inr_amount: 650, payment_method: 'digital_wallet', payment_specifics: 'Paytm', person_id: 'manan', reimbursement_status: 'none' },
    { date: '2024-12-04', description: 'Zepto Groceries', category: 'groceries', inr_amount: 1800, payment_method: 'upi', payment_specifics: 'GPay (HDFC)', person_id: 'anushka', reimbursement_status: 'none' },
    { date: '2024-12-05', description: 'Movie Tickets - PVR', category: 'leisure', inr_amount: 1200, payment_method: 'credit_card', payment_specifics: 'Axis Ace', person_id: 'manan', reimbursement_status: 'none' },
    { date: '2024-12-06', description: 'Doctor Consultation', category: 'fitness_health', inr_amount: 800, payment_method: 'cash', payment_specifics: '', person_id: 'anushka', reimbursement_status: 'pending' },
    { date: '2024-12-07', description: 'Internet Bill', category: 'utilities_rent', inr_amount: 1200, payment_method: 'upi', payment_specifics: 'PhonePe', person_id: 'manan', reimbursement_status: 'none' },
    { date: '2024-12-08', description: 'Myntra - Winter Jacket', category: 'personal', inr_amount: 3500, payment_method: 'credit_card', payment_specifics: 'ICICI Coral', person_id: 'anushka', reimbursement_status: 'none' },
    { date: '2024-12-10', description: 'Office Team Lunch (Reimbursable)', category: 'food_dining', inr_amount: 2500, payment_method: 'credit_card', payment_specifics: 'Axis Ace', person_id: 'manan', reimbursement_status: 'reimbursed' },
  ];

  for (const expense of expenses) {
    await post('/Expenses', {
      ...expense,
      currency_amount: expense.inr_amount,
    });
    console.log(`  Added: ${expense.description}`);
  }
}

async function main() {
  console.log('Starting seed data population...\n');
  console.log('Make sure the API server is running (npm run server)\n');

  try {
    // Check if API is available by fetching People
    const healthCheck = await fetch(`${API_BASE}/People`);
    if (!healthCheck.ok) {
      throw new Error('API server not responding');
    }
    const existingPeople = await healthCheck.json();
    console.log(`API server is running. Found ${existingPeople.length} people.\n`);

    // Only seed people if none exist
    if (existingPeople.length === 0) {
      await seedPeople();
    } else {
      console.log('Skipping People (already exists)');
    }

    // Check and seed Cards
    const existingCards = await fetch(`${API_BASE}/Cards`).then(r => r.json());
    if (existingCards.length === 0) {
      await seedCards();
    } else {
      console.log(`Skipping Cards (${existingCards.length} already exist)`);
    }

    // Check and seed Budgets
    const existingBudgets = await fetch(`${API_BASE}/Budgets`).then(r => r.json());
    if (existingBudgets.length === 0) {
      await seedBudgets();
    } else {
      console.log(`Skipping Budgets (${existingBudgets.length} already exist)`);
    }

    // Check and seed NetWorthEntries
    const existingNetWorth = await fetch(`${API_BASE}/NetWorthEntries`).then(r => r.json());
    if (existingNetWorth.length === 0) {
      await seedNetWorthEntries();
    } else {
      console.log(`Skipping NetWorthEntries (${existingNetWorth.length} already exist)`);
    }

    // Check and seed Liabilities
    const existingLiabilities = await fetch(`${API_BASE}/Liabilities`).then(r => r.json());
    if (existingLiabilities.length === 0) {
      await seedLiabilities();
    } else {
      console.log(`Skipping Liabilities (${existingLiabilities.length} already exist)`);
    }

    // Check and seed Goals
    const existingGoals = await fetch(`${API_BASE}/Goals`).then(r => r.json());
    if (existingGoals.length === 0) {
      await seedGoals();
    } else {
      console.log(`Skipping Goals (${existingGoals.length} already exist)`);
    }

    // Check and seed Expenses
    const existingExpenses = await fetch(`${API_BASE}/Expenses`).then(r => r.json());
    if (existingExpenses.length === 0) {
      await seedExpenses();
    } else {
      console.log(`Skipping Expenses (${existingExpenses.length} already exist)`);
    }

    console.log('\nSeed data population complete!');
    console.log('You can now view the data in the MapFin app at http://localhost:5173');
  } catch (error) {
    console.error('\nError:', error.message);
    console.log('\nMake sure:');
    console.log('1. API server is running: npm run server');
    console.log('2. Google Sheet is properly configured');
    process.exit(1);
  }
}

main();
