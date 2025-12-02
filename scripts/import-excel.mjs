/**
 * Import script to load real data from Excel files into Google Sheets
 * Run with: node scripts/import-excel.mjs
 * Make sure API server is running first: npm run server
 *
 * This script will CLEAR existing data and replace with Excel data.
 */

import XLSX from 'xlsx';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const API_BASE = 'http://localhost:3001/api';

// Delay helper to avoid rate limiting (Google Sheets: 60 writes/min)
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Category mapping from Excel to app enum
const CATEGORY_MAP = {
  'Transport / Travel': 'transport_travel',
  'Food & Dining': 'food_dining',
  'Groceries': 'groceries',
  'Utilities & Rent': 'utilities_rent',
  'Subscriptions': 'subscriptions',
  'Fitness and Health': 'fitness_health',
  'Fitness And Health': 'fitness_health',
  'Family & House Supplies': 'family_house_supplies',
  'House Supplies': 'family_house_supplies',
  'Personal': 'personal',
  'Gifts': 'gifts',
  'Leisure': 'leisure',
  'Other': 'other',
};

// Payment method mapping
const PAYMENT_METHOD_MAP = {
  'Credit Card': 'credit_card',
  'Debit Card': 'debit_card',
  'UPI': 'upi',
  'Transfer': 'transfer',
  'Cash': 'cash',
  'Wallet': 'digital_wallet',
  'Adjusted': 'transfer', // Treat adjustments as transfers
};

// Person ID mapping
const PERSON_MAP = {
  'Manan': 'manan',
  'Anushka': 'anushka',
};

// Convert Excel serial date to ISO string
function excelDateToISO(serial) {
  if (!serial) return new Date().toISOString().split('T')[0];
  // Excel date serial: days since Dec 30, 1899
  const utc_days = Math.floor(serial - 25569);
  const date = new Date(utc_days * 86400 * 1000);
  return date.toISOString().split('T')[0];
}

async function fetchApi(endpoint) {
  const response = await fetch(`${API_BASE}${endpoint}`);
  if (!response.ok) {
    throw new Error(`Failed to GET ${endpoint}`);
  }
  return response.json();
}

async function deleteRow(endpoint, id) {
  await delay(1100); // Stay under 60/min limit
  const response = await fetch(`${API_BASE}${endpoint}/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    const error = await response.text();
    console.warn(`  Warning: Failed to DELETE ${endpoint}/${id}: ${error}`);
  }
}

async function post(endpoint, data) {
  await delay(1100); // Stay under 60/min limit
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

async function clearSheet(sheetName) {
  console.log(`Clearing ${sheetName}...`);
  const existing = await fetchApi(`/${sheetName}`);
  console.log(`  Found ${existing.length} rows to delete`);

  for (let i = existing.length - 1; i >= 0; i--) {
    const row = existing[i];
    await deleteRow(`/${sheetName}`, row.id);
    if ((existing.length - i) % 10 === 0) {
      console.log(`  Deleted ${existing.length - i}/${existing.length}`);
    }
  }
  console.log(`  Cleared ${sheetName}`);
}

async function importExpenses() {
  console.log('\n=== IMPORTING EXPENSES ===\n');

  const filePath = join(__dirname, '..', 'Finances - Expenses.xlsx');
  const workbook = XLSX.readFile(filePath);
  const sheet = workbook.Sheets[workbook.SheetNames[0]]; // Expenditures sheet
  const data = XLSX.utils.sheet_to_json(sheet);

  console.log(`Found ${data.length} expenses in Excel file`);

  // Clear existing expenses
  await clearSheet('Expenses');

  console.log('\nImporting expenses (this will take ~25 minutes at safe rate)...');

  let imported = 0;
  let errors = 0;

  for (const row of data) {
    try {
      const expense = {
        date: excelDateToISO(row.Date),
        description: row.Expenditure || 'Unknown',
        category: CATEGORY_MAP[row.Category] || 'other',
        currency_amount: Number(row['Currency Expense']) || 0,
        inr_amount: Number(row['INR Expense']) || 0,
        payment_method: PAYMENT_METHOD_MAP[row['Payment Method']] || 'cash',
        payment_specifics: row['Payment Specifics'] || '',
        transaction_details: row['Transaction Details'] || '',
        remarks: row.Remarks || '',
        person_id: PERSON_MAP[row.Spender] || 'manan',
        reimbursement_status: 'none',
      };

      await post('/Expenses', expense);
      imported++;

      if (imported % 50 === 0) {
        const eta = Math.round(((data.length - imported) * 1.1) / 60);
        console.log(`  Imported ${imported}/${data.length} (ETA: ${eta} minutes)`);
      }
    } catch (err) {
      errors++;
      console.error(`  Error importing row: ${err.message}`);
    }
  }

  console.log(`\nExpenses import complete: ${imported} imported, ${errors} errors`);
}

async function importNetWorth() {
  console.log('\n=== IMPORTING NET WORTH ===\n');

  const filePath = join(__dirname, '..', 'Net Worth.xlsx');
  const workbook = XLSX.readFile(filePath);

  // Read Manan's net worth sheet
  const mananSheet = workbook.Sheets['Net Worth - Manan'];
  const mananData = XLSX.utils.sheet_to_json(mananSheet);

  // Read Anushka's net worth sheet
  const anushkaSheet = workbook.Sheets['Net Worth - Anushka'];
  const anushkaData = XLSX.utils.sheet_to_json(anushkaSheet);

  console.log(`Found ${mananData.length} Manan entries and ${anushkaData.length} Anushka entries`);

  // Clear existing net worth entries
  await clearSheet('NetWorthEntries');

  console.log('\nImporting net worth entries...');

  let imported = 0;

  // Category mapping for net worth
  const netWorthCategories = [
    { excel: 'Mutual Funds', app: 'mutual_funds' },
    { excel: 'Stocks', app: 'stocks_india' },
    { excel: 'Fixed Return Assets (FD, P2P)', app: 'fixed_deposits' },
    { excel: 'Real Estate', app: 'real_estate' },
    { excel: 'Gold', app: 'gold' },
    { excel: 'PPF and EPF', app: 'epf' },
    { excel: 'Digital Assets', app: 'digital_assets' },
    { excel: 'Liquid (Cash / Bank)', app: 'liquid_cash' },
    { excel: 'Owed', app: 'owed' },
    { excel: 'Debt', app: 'debt' },
  ];

  // Import Manan's data
  for (const row of mananData) {
    const reportDate = excelDateToISO(row['Date of Reporting']);

    for (const cat of netWorthCategories) {
      const amount = Number(row[cat.excel]) || 0;
      if (amount === 0) continue;

      await post('/NetWorthEntries', {
        report_date: reportDate,
        person_id: 'manan',
        category: cat.app,
        amount_inr: Math.round(amount),
        description: `${cat.excel} - Manan`,
      });
      imported++;
    }
    console.log(`  Imported Manan's data for ${reportDate}`);
  }

  // Import Anushka's data
  for (const row of anushkaData) {
    const reportDate = excelDateToISO(row['Date of Reporting']);

    for (const cat of netWorthCategories) {
      const amount = Number(row[cat.excel]) || 0;
      if (amount === 0) continue;

      await post('/NetWorthEntries', {
        report_date: reportDate,
        person_id: 'anushka',
        category: cat.app,
        amount_inr: Math.round(amount),
        description: `${cat.excel} - Anushka`,
      });
      imported++;
    }
    console.log(`  Imported Anushka's data for ${reportDate}`);
  }

  console.log(`\nNet worth import complete: ${imported} entries imported`);
}

async function main() {
  console.log('╔════════════════════════════════════════════════════╗');
  console.log('║       MapFin Excel Import Script                   ║');
  console.log('║  This will REPLACE all existing data!              ║');
  console.log('╚════════════════════════════════════════════════════╝\n');

  try {
    // Check if API is available
    const healthCheck = await fetch(`${API_BASE}/People`);
    if (!healthCheck.ok) {
      throw new Error('API server not responding');
    }
    console.log('✓ API server is running\n');

    // Import expenses (the big one)
    await importExpenses();

    // Import net worth
    await importNetWorth();

    console.log('\n╔════════════════════════════════════════════════════╗');
    console.log('║  Import complete!                                  ║');
    console.log('║  View your data at http://localhost:5173           ║');
    console.log('╚════════════════════════════════════════════════════╝');
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.log('\nMake sure:');
    console.log('1. API server is running: npm run server');
    console.log('2. Excel files are in the project root');
    process.exit(1);
  }
}

main();
