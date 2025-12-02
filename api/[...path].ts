/**
 * Vercel Serverless Function - Catch-all API route
 *
 * Handles: GET/POST/PUT/DELETE /api/:sheetName/:id?
 *
 * Environment variables required:
 * - GOOGLE_SHEET_ID: The Google Sheet ID
 * - GOOGLE_SERVICE_ACCOUNT_EMAIL: Service account email
 * - GOOGLE_PRIVATE_KEY: Service account private key (PEM format)
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { google } from 'googleapis';

// Configuration from environment
const SHEET_ID = process.env.GOOGLE_SHEET_ID || '';
const SERVICE_ACCOUNT_EMAIL = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || '';
// Handle private key - may have literal \n that need to be newlines
const rawKey = process.env.GOOGLE_PRIVATE_KEY || '';
const PRIVATE_KEY = rawKey.includes('\\n') ? rawKey.replace(/\\n/g, '\n') : rawKey;

// Initialize Google Sheets client
function getSheets() {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: SERVICE_ACCOUNT_EMAIL,
      private_key: PRIVATE_KEY,
    },
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  return google.sheets({ version: 'v4', auth });
}

// Helper: Convert sheet rows to objects
function rowsToObjects(rows: string[][]): Record<string, string>[] {
  if (!rows || rows.length < 2) return [];
  const headers = rows[0];
  return rows.slice(1).map((row) => {
    const obj: Record<string, string> = {};
    headers.forEach((header, i) => {
      obj[header] = row[i] || '';
    });
    return obj;
  });
}

// Helper: Convert object to row array
function objectToRow(obj: Record<string, unknown>, headers: string[]): string[] {
  return headers.map((header) => String(obj[header] || ''));
}

// Main handler
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Parse path from query or URL
  // req.query.path can be a string or array depending on Vercel version
  let path: string[] = [];
  if (req.query.path) {
    path = Array.isArray(req.query.path) ? req.query.path : [req.query.path];
  } else if (req.url) {
    // Fallback: parse from URL directly
    // URL format: /api/People or /api/People/123
    const urlPath = req.url.split('?')[0].replace(/^\/api\//, '');
    if (urlPath) {
      path = urlPath.split('/').filter(Boolean);
    }
  }

  if (!path || path.length === 0) {
    return res.status(400).json({
      error: 'Missing sheet name',
      debug: { query: req.query, url: req.url }
    });
  }

  const [sheetName, id] = path;

  // Health check endpoint
  if (sheetName === 'health') {
    return res.json({ status: 'ok', timestamp: new Date().toISOString() });
  }

  // Validate configuration
  if (!SHEET_ID || !SERVICE_ACCOUNT_EMAIL || !PRIVATE_KEY) {
    return res.status(500).json({
      error: 'Server configuration missing',
      details: 'Google Sheets credentials not configured',
    });
  }

  const sheets = getSheets();

  try {
    switch (req.method) {
      case 'GET': {
        // GET /api/:sheetName - Get all records
        const result = await sheets.spreadsheets.values.get({
          spreadsheetId: SHEET_ID,
          range: `${sheetName}!A:Z`,
        });
        const data = rowsToObjects(result.data.values as string[][] || []);
        return res.json(data);
      }

      case 'POST': {
        // POST /api/:sheetName - Add new record
        const data = req.body as Record<string, unknown>;

        // Get headers first
        const headerResult = await sheets.spreadsheets.values.get({
          spreadsheetId: SHEET_ID,
          range: `${sheetName}!1:1`,
        });
        const headers = (headerResult.data.values?.[0] as string[]) || [];

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

        return res.json({ success: true, id: data.id, data });
      }

      case 'PUT': {
        // PUT /api/:sheetName/:id - Update record
        if (!id) {
          return res.status(400).json({ error: 'Missing record ID' });
        }

        const data = req.body as Record<string, unknown>;

        // Get all data to find row
        const result = await sheets.spreadsheets.values.get({
          spreadsheetId: SHEET_ID,
          range: `${sheetName}!A:Z`,
        });
        const rows = (result.data.values as string[][]) || [];
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

        return res.json({ success: true, data });
      }

      case 'DELETE': {
        // DELETE /api/:sheetName/:id - Delete record
        if (!id) {
          return res.status(400).json({ error: 'Missing record ID' });
        }

        // Get spreadsheet metadata to find sheet ID
        const metadata = await sheets.spreadsheets.get({
          spreadsheetId: SHEET_ID,
        });
        const sheet = metadata.data.sheets?.find(
          (s) => s.properties?.title === sheetName
        );
        if (!sheet) {
          return res.status(404).json({ error: 'Sheet not found' });
        }
        const sheetId = sheet.properties?.sheetId;

        // Get all data to find row
        const result = await sheets.spreadsheets.values.get({
          spreadsheetId: SHEET_ID,
          range: `${sheetName}!A:Z`,
        });
        const rows = (result.data.values as string[][]) || [];
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
            requests: [
              {
                deleteDimension: {
                  range: {
                    sheetId: sheetId,
                    dimension: 'ROWS',
                    startIndex: rowIndex,
                    endIndex: rowIndex + 1,
                  },
                },
              },
            ],
          },
        });

        return res.json({ success: true });
      }

      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error(`API Error (${req.method} /api/${path.join('/')}):`, error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
