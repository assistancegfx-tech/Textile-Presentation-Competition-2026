export interface SpreadsheetInfo {
  id: string;
  name: string;
  url: string;
}

export const HEADERS = [
  'Registration ID',
  'Submission Date & Time',
  'Payment Status',
  'Group Leader Name',
  'Group Leader Roll',
  'Group Leader Department',
  'Group Leader WhatsApp',
  'Group Leader Facebook',
  'Group Leader Photo URL',
  'Member 1 Name',
  'Member 1 Roll',
  'Member 1 Department',
  'Member 1 WhatsApp',
  'Member 1 Facebook',
  'Member 1 Photo URL',
  'Member 2 Name',
  'Member 2 Roll',
  'Member 2 Department',
  'Member 2 WhatsApp',
  'Member 2 Facebook',
  'Member 2 Photo URL',
  'bKash Number',
  'Transaction ID'
];

/**
 * Searches user's Google Drive for an existing competition spreadsheet,
 * or creates a new formatted spreadsheet with headers.
 */
export async function findOrCreateSpreadsheet(accessToken: string): Promise<SpreadsheetInfo> {
  const fileName = 'Textile Presentation Competition 2026 - Registrations';

  // 1. Search existing files in Google Drive
  const query = encodeURIComponent(`name = '${fileName}' and mimeType = 'application/vnd.google-apps.spreadsheet' and trashed = false`);
  const searchRes = await fetch(`https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name,webViewLink)`, {
    headers: { Authorization: `Bearer ${accessToken}` }
  });

  if (searchRes.ok) {
    const searchData = await searchRes.json();
    if (searchData.files && searchData.files.length > 0) {
      const existing = searchData.files[0];
      return {
        id: existing.id,
        name: existing.name,
        url: existing.webViewLink || `https://docs.google.com/spreadsheets/d/${existing.id}/edit`
      };
    }
  }

  // 2. Create a new Spreadsheet
  const createRes = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      properties: {
        title: fileName
      },
      sheets: [
        {
          properties: {
            title: 'Registrations',
            gridProperties: {
              frozenRowCount: 1
            }
          }
        }
      ]
    })
  });

  if (!createRes.ok) {
    const err = await createRes.json();
    throw new Error(err.error?.message || 'Failed to create Google Spreadsheet');
  }

  const newSheet = await createRes.json();
  const spreadsheetId = newSheet.spreadsheetId;
  const sheetUrl = newSheet.spreadsheetUrl || `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`;

  // 3. Append headers to the new sheet
  await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Registrations!A1:W1:append?valueInputOption=USER_ENTERED`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      values: [HEADERS]
    })
  });

  // 4. Format header row styling (Bold font, Navy background, white text)
  try {
    await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        requests: [
          {
            repeatCell: {
              range: {
                sheetId: 0,
                startRowIndex: 0,
                endRowIndex: 1,
                startColumnIndex: 0,
                endColumnIndex: HEADERS.length
              },
              cell: {
                userEnteredFormat: {
                  backgroundColor: { red: 10 / 255, green: 25 / 255, blue: 47 / 255 },
                  textFormat: { bold: true, foregroundColor: { red: 1, green: 1, blue: 1 } },
                  horizontalAlignment: 'CENTER'
                }
              },
              fields: 'userEnteredFormat(backgroundColor,textFormat,horizontalAlignment)'
            }
          }
        ]
      })
    });
  } catch (_) {
    // Non-critical visual formatting fallback
  }

  return {
    id: spreadsheetId,
    name: fileName,
    url: sheetUrl
  };
}

/**
 * Appends a registration row directly to the user's Google Sheet
 */
export async function appendRegistrationToSheet(
  accessToken: string,
  spreadsheetId: string,
  rowValues: any[]
): Promise<void> {
  const res = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Registrations!A:W:append?valueInputOption=USER_ENTERED`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        values: [rowValues]
      })
    }
  );

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error?.message || 'Failed to append registration row to Google Sheets');
  }
}

/**
 * Fetches existing registrations from Google Sheet
 */
export async function fetchRegistrationsFromSheet(
  accessToken: string,
  spreadsheetId: string
): Promise<any[][]> {
  const res = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Registrations!A2:W`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    }
  );

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error?.message || 'Failed to read rows from Google Sheet');
  }

  const data = await res.json();
  return data.values || [];
}
