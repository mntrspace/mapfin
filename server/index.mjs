import express from 'express';
import cors from 'cors';
import { google } from 'googleapis';

const app = express();
const PORT = 3001;

// Configuration
const SHEET_ID = '1IYAcIudma-wunVgYyk7R0wFHLf7BXDn4UX4JhE14eZQ';
const CREDENTIALS_PATH = '/Users/mntr-space/Downloads/mapfin-480006-c047ed403fc4.json';

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Google Sheets client
let sheets;
async function initSheets() {
  const auth = new google.auth.GoogleAuth({
    keyFile: CREDENTIALS_PATH,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  sheets = google.sheets({ version: 'v4', auth });
}

// Helper: Convert sheet rows to objects
function rowsToObjects(rows) {
  if (!rows || rows.length < 2) return [];
  const headers = rows[0];
  return rows.slice(1).map(row => {
    const obj = {};
    headers.forEach((header, i) => {
      obj[header] = row[i] || '';
    });
    return obj;
  });
}

// Helper: Convert object to row array
function objectToRow(obj, headers) {
  return headers.map(header => obj[header] || '');
}

// GET /api/:sheetName - Get all data from a sheet
app.get('/api/:sheetName', async (req, res) => {
  try {
    const { sheetName } = req.params;
    const result = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: `${sheetName}!A:Z`,
    });
    const data = rowsToObjects(result.data.values || []);
    res.json(data);
  } catch (error) {
    console.error(`Error fetching ${req.params.sheetName}:`, error.message);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/:sheetName - Add a new row
app.post('/api/:sheetName', async (req, res) => {
  try {
    const { sheetName } = req.params;
    const data = req.body;

    // Get headers first
    const headerResult = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: `${sheetName}!1:1`,
    });
    const headers = headerResult.data.values?.[0] || [];

    // Generate ID if not provided
    if (!data.id) {
      data.id = `${sheetName.toLowerCase()}_${Date.now()}`;
    }

    // Append row
    const row = objectToRow(data, headers);
    await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: `${sheetName}!A:Z`,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [row],
      },
    });

    res.json({ success: true, id: data.id, data });
  } catch (error) {
    console.error(`Error adding to ${req.params.sheetName}:`, error.message);
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/:sheetName/:id - Update a row by ID
app.put('/api/:sheetName/:id', async (req, res) => {
  try {
    const { sheetName, id } = req.params;
    const data = req.body;

    // Get all data
    const result = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: `${sheetName}!A:Z`,
    });
    const rows = result.data.values || [];
    const headers = rows[0] || [];
    const idIndex = headers.indexOf('id');

    // Find row index
    let rowIndex = -1;
    for (let i = 1; i < rows.length; i++) {
      if (rows[i][idIndex] === id) {
        rowIndex = i + 1; // Sheet rows are 1-indexed
        break;
      }
    }

    if (rowIndex === -1) {
      return res.status(404).json({ error: 'Record not found' });
    }

    // Update row
    data.id = id; // Preserve ID
    const row = objectToRow(data, headers);
    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range: `${sheetName}!A${rowIndex}`,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [row],
      },
    });

    res.json({ success: true, data });
  } catch (error) {
    console.error(`Error updating ${req.params.sheetName}:`, error.message);
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/:sheetName/:id - Delete a row by ID
app.delete('/api/:sheetName/:id', async (req, res) => {
  try {
    const { sheetName, id } = req.params;

    // Get spreadsheet metadata to find sheet ID
    const metadata = await sheets.spreadsheets.get({
      spreadsheetId: SHEET_ID,
    });
    const sheet = metadata.data.sheets.find(s => s.properties.title === sheetName);
    if (!sheet) {
      return res.status(404).json({ error: 'Sheet not found' });
    }
    const sheetId = sheet.properties.sheetId;

    // Get all data to find row
    const result = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: `${sheetName}!A:Z`,
    });
    const rows = result.data.values || [];
    const headers = rows[0] || [];
    const idIndex = headers.indexOf('id');

    // Find row index
    let rowIndex = -1;
    for (let i = 1; i < rows.length; i++) {
      if (rows[i][idIndex] === id) {
        rowIndex = i;
        break;
      }
    }

    if (rowIndex === -1) {
      return res.status(404).json({ error: 'Record not found' });
    }

    // Delete row
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: SHEET_ID,
      requestBody: {
        requests: [{
          deleteDimension: {
            range: {
              sheetId: sheetId,
              dimension: 'ROWS',
              startIndex: rowIndex,
              endIndex: rowIndex + 1,
            },
          },
        }],
      },
    });

    res.json({ success: true });
  } catch (error) {
    console.error(`Error deleting from ${req.params.sheetName}:`, error.message);
    res.status(500).json({ error: error.message });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server
initSheets().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 MapFin API server running at http://localhost:${PORT}`);
    console.log(`   Connected to Google Sheet: ${SHEET_ID}`);
    console.log('\nAvailable endpoints:');
    console.log('   GET    /api/:sheetName      - Get all records');
    console.log('   POST   /api/:sheetName      - Add new record');
    console.log('   PUT    /api/:sheetName/:id  - Update record');
    console.log('   DELETE /api/:sheetName/:id  - Delete record');
    console.log('\nSheets: People, NetWorthEntries, Liabilities, Expenses, Income, Budgets, Goals, Categories, Cards');
  });
}).catch(err => {
  console.error('Failed to initialize:', err.message);
});
