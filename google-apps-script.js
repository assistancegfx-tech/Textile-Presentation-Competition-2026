/**
 * ============================================================================
 * Google Apps Script for Textile Presentation Competition 2026
 * Organized by Career Club BTEC, Barishal Textile Engineering College
 * Technical Support: IT Wing - CCB
 * ============================================================================
 * 
 * 🚀 QUICK SETUP GUIDE FOR A BRAND NEW GOOGLE SHEET:
 * ----------------------------------------------------------------------------
 * 1. Create a brand new Google Sheet at https://sheets.new
 * 2. In Google Sheets menu, click: Extensions > Apps Script
 * 3. Delete any default code inside Code.gs, paste this entire file, and click Save (Ctrl+S).
 * 4. In the toolbar dropdown at top (next to "Debug"), select "setup" and click "▶ Run".
 *    - Click "Review permissions" > Choose your Google account > "Advanced" > "Go to ... (unsafe)" > "Allow".
 *    - In ~2 seconds, your new Google Sheet will be automatically renamed to "Registrations",
 *      formatted with 25 styled columns, dark navy headers, dropdowns, plain text formatting,
 *      and a Google Drive folder for participant photos!
 * 5. Click "Deploy" (top right) > "New deployment"
 *    - Click the gear icon ⚙️ next to "Select type" > choose "Web app"
 *    - Description: "TPC 2026 Live Registration API"
 *    - Execute as: "Me" (your email)
 *    - Who has access: "Anyone" (⚠️ CRITICAL! Must select Anyone so registration form can submit)
 *    - Click "Deploy"
 * 6. Copy the "Web app URL" (ends in /exec) and paste it into the website's
 *    "Google Sheet Connection" modal.
 * ============================================================================
 * 
 * 🎯 STANDARD 25-COLUMN STRUCTURE (INCLUDES TEAM NAME):
 * 1.  Registration ID          [Col A / 1]
 * 2.  Submission Date & Time   [Col B / 2]
 * 3.  Payment Status           [Col C / 3]  <-- Dropdown: Pending, Approved, Paid, Rejected
 * 4.  Team Name                [Col D / 4]  <-- Official Team Identity
 * 5.  Group Leader Name        [Col E / 5]
 * 6.  Group Leader Roll        [Col F / 6]
 * 7.  Group Leader Department  [Col G / 7]
 * 8.  Group Leader WhatsApp    [Col H / 8]
 * 9.  Group Leader Facebook    [Col I / 9]
 * 10. Group Leader Email       [Col J / 10]
 * 11. Group Leader Photo URL   [Col K / 11]
 * 12. Member 1 Name            [Col L / 12]
 * 13. Member 1 Roll            [Col M / 13]
 * 14. Member 1 Department      [Col N / 14]
 * 15. Member 1 WhatsApp        [Col O / 15]
 * 16. Member 1 Facebook        [Col P / 16]
 * 17. Member 1 Photo URL       [Col Q / 17]
 * 18. Member 2 Name            [Col R / 18]
 * 19. Member 2 Roll            [Col S / 19]
 * 20. Member 2 Department      [Col T / 20]
 * 21. Member 2 WhatsApp        [Col U / 21]
 * 22. Member 2 Facebook        [Col V / 22]
 * 23. Member 2 Photo URL       [Col W / 23]
 * 24. bKash Number             [Col X / 24]
 * 25. Transaction ID           [Col Y / 25]
 * ============================================================================
 */

// Optional: Paste your Google Sheet ID or URL here if running standalone at script.google.com
// Leave empty if opened directly inside Google Sheets (Extensions > Apps Script)
const SPREADSHEET_ID = ""; 

const SHEET_NAME = "Registrations";
const DRIVE_FOLDER_NAME = "Textile Presentation 2026 - Participant Photos";

const STANDARD_HEADERS = [
  "Registration ID",          // Col 1 (A)
  "Submission Date & Time",   // Col 2 (B)
  "Payment Status",           // Col 3 (C)
  "Team Name",                // Col 4 (D)
  "Group Leader Name",        // Col 5 (E)
  "Group Leader Roll",        // Col 6 (F)
  "Group Leader Department",  // Col 7 (G)
  "Group Leader WhatsApp",    // Col 8 (H)
  "Group Leader Facebook",    // Col 9 (I)
  "Group Leader Email",       // Col 10 (J)
  "Group Leader Photo URL",   // Col 11 (K)
  "Member 1 Name",            // Col 12 (L)
  "Member 1 Roll",            // Col 13 (M)
  "Member 1 Department",      // Col 14 (N)
  "Member 1 WhatsApp",        // Col 15 (O)
  "Member 1 Facebook",        // Col 16 (P)
  "Member 1 Photo URL",       // Col 17 (Q)
  "Member 2 Name",            // Col 18 (R)
  "Member 2 Roll",            // Col 19 (S)
  "Member 2 Department",      // Col 20 (T)
  "Member 2 WhatsApp",        // Col 21 (U)
  "Member 2 Facebook",        // Col 22 (V)
  "Member 2 Photo URL",       // Col 23 (W)
  "bKash Number",             // Col 24 (X)
  "Transaction ID"            // Col 25 (Y)
];

const COLUMN_WIDTHS = [
  140, // 1. Registration ID
  170, // 2. Submission Date & Time
  130, // 3. Payment Status
  180, // 4. Team Name
  180, // 5. Group Leader Name
  115, // 6. Group Leader Roll
  200, // 7. Group Leader Department
  145, // 8. Group Leader WhatsApp
  190, // 9. Group Leader Facebook
  200, // 10. Group Leader Email
  210, // 11. Group Leader Photo URL
  170, // 12. Member 1 Name
  115, // 13. Member 1 Roll
  200, // 14. Member 1 Department
  145, // 15. Member 1 WhatsApp
  190, // 16. Member 1 Facebook
  210, // 17. Member 1 Photo URL
  170, // 18. Member 2 Name
  115, // 19. Member 2 Roll
  200, // 20. Member 2 Department
  145, // 21. Member 2 WhatsApp
  190, // 22. Member 2 Facebook
  210, // 23. Member 2 Photo URL
  145, // 24. bKash Number
  150  // 25. Transaction ID
];

/**
 * ⚡ RUN THIS FUNCTION ONCE IN APPS SCRIPT EDITOR (CLICK ▶ Run)
 * 1. Renames Sheet1 to "Registrations" (or creates it).
 * 2. Applies dark navy styling, bold white text, and sets frozen header.
 * 3. Adjusts all 25 column widths and sets plain text format for rolls and phone numbers.
 * 4. Sets up Payment Status dropdown and conditional color formatting.
 * 5. Prepares Google Drive folder for participant photo uploads.
 */
function setup() {
  const ss = getSpreadsheet();
  const sheet = setupNewSheet(ss);
  const folder = getOrCreateDriveFolder(DRIVE_FOLDER_NAME);

  Logger.log("==================================================");
  Logger.log("🎉 NEW GOOGLE SHEET SETUP COMPLETE!");
  Logger.log("📄 Spreadsheet: " + ss.getName());
  Logger.log("📋 Sheet Name: " + sheet.getName());
  Logger.log("📁 Drive Folder: " + folder.getName());
  Logger.log("✨ 25 columns configured with Team Name at Column D.");
  Logger.log("==================================================");

  return "Setup successful! 25 standard columns are ready with dropdowns and formatting.";
}

/**
 * 🧪 OPTIONAL: Test your new sheet with a sample registration!
 * Run this function (select "testNewSheet" > click ▶ Run) to insert a demo team.
 */
function testNewSheet() {
  setup();
  const ss = getSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_NAME);

  const testPayload = {
    teamName: "TexGenius",
    leader: {
      name: "Naimur Rahman",
      roll: "12401",
      department: "Yarn Engineering",
      whatsapp: "01712345678",
      facebook: "https://facebook.com/naimur.rahman",
      email: "naimur.rahman@example.com",
      photoUrl: "https://placehold.co/400x500/0a192f/ffffff?text=Leader"
    },
    member1: {
      name: "Tanjim Hasan",
      roll: "12415",
      department: "Fabric Engineering",
      whatsapp: "01812345678",
      facebook: "https://facebook.com/tanjim.hasan",
      photoUrl: "https://placehold.co/400x500/0a192f/ffffff?text=Member+1"
    },
    member2: {
      name: "Ayesha Siddiqua",
      roll: "12428",
      department: "Wet Process Engineering",
      whatsapp: "01912345678",
      facebook: "https://facebook.com/ayesha.siddiqua",
      photoUrl: "https://placehold.co/400x500/0a192f/ffffff?text=Member+2"
    },
    payment: {
      bkashNumber: "01712345678",
      transactionId: "TRX99887766"
    }
  };

  const fakeEvent = {
    postData: {
      contents: JSON.stringify(testPayload)
    }
  };

  const res = doPost(fakeEvent);
  Logger.log("Test submission response: " + res.getContent());
  return "Sample registration TEX2026-001 inserted successfully!";
}

/**
 * Thoroughly prepares a brand new Google Sheet with formatting, widths, and rules
 */
function setupNewSheet(ss) {
  let sheet = ss.getSheetByName(SHEET_NAME);

  // If "Registrations" doesn't exist yet, check existing sheets
  if (!sheet) {
    const allSheets = ss.getSheets();
    if (allSheets.length === 1 && allSheets[0].getLastRow() <= 1) {
      // Cleanly rename the default sheet (e.g. "Sheet1") to "Registrations"
      sheet = allSheets[0];
      sheet.setName(SHEET_NAME);
    } else {
      sheet = ss.insertSheet(SHEET_NAME);
    }
  }

  // Set Tab Color to vibrant green
  try {
    sheet.setTabColor("#16A34A");
  } catch (_) {}

  // Set Row 1 Headers
  const headerRange = sheet.getRange(1, 1, 1, STANDARD_HEADERS.length);
  headerRange.setValues([STANDARD_HEADERS]);

  // Style Header Row (Deep Navy, White Bold, Center, Middle)
  headerRange.setBackground("#0A192F");
  headerRange.setFontColor("#FFFFFF");
  headerRange.setFontFamily("Arial");
  headerRange.setFontSize(10);
  headerRange.setFontWeight("bold");
  headerRange.setHorizontalAlignment("center");
  headerRange.setVerticalAlignment("middle");
  headerRange.setWrapStrategy(SpreadsheetApp.WrapStrategy.WRAP);

  sheet.setRowHeight(1, 42);
  sheet.setFrozenRows(1);

  // Set individual column widths
  for (let i = 0; i < COLUMN_WIDTHS.length; i++) {
    sheet.setColumnWidth(i + 1, COLUMN_WIDTHS[i]);
  }

  // Format Plain Text Columns (@) so leading zeroes in Phone & Roll are NEVER stripped!
  // Col 1 (Reg ID), Col 6 (Leader Roll), Col 8 (Leader WhatsApp),
  // Col 13 (M1 Roll), Col 15 (M1 WhatsApp), Col 19 (M2 Roll), Col 21 (M2 WhatsApp),
  // Col 24 (bKash Number), Col 25 (Transaction ID)
  const plainTextCols = [1, 6, 8, 13, 15, 19, 21, 24, 25];
  const maxRows = Math.max(100, sheet.getMaxRows());

  plainTextCols.forEach(col => {
    sheet.getRange(2, col, maxRows - 1, 1).setNumberFormat("@");
  });

  // Date column format
  sheet.getRange(2, 2, maxRows - 1, 1).setNumberFormat("yyyy-mm-dd hh:mm:ss");

  // Center align specific columns
  const centerCols = [1, 2, 3, 6, 8, 13, 15, 19, 21, 24, 25];
  centerCols.forEach(col => {
    sheet.getRange(2, col, maxRows - 1, 1).setHorizontalAlignment("center");
  });

  // Payment Status Dropdown Data Validation (Col C / 3)
  const statusRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(["Pending", "Approved", "Paid", "Rejected"], true)
    .setAllowInvalid(true)
    .build();
  sheet.getRange(2, 3, maxRows - 1, 1).setDataValidation(statusRule);

  // Conditional Formatting Rules for Payment Status
  applyPaymentConditionalFormatting(sheet, maxRows);

  // Auto-Filter
  try {
    const existingFilter = sheet.getFilter();
    if (!existingFilter) {
      sheet.getRange(1, 1, maxRows, STANDARD_HEADERS.length).createFilter();
    }
  } catch (_) {}

  return sheet;
}

/**
 * Sets color coding for Payment Status
 */
function applyPaymentConditionalFormatting(sheet, maxRows) {
  try {
    const statusRange = sheet.getRange(2, 3, maxRows - 1, 1);
    
    // Rule for Pending (Amber / Yellow)
    const rulePending = SpreadsheetApp.newConditionalFormatRule()
      .whenTextEqualTo("Pending")
      .setBackground("#FEF3C7")
      .setFontColor("#92400E")
      .setBold(true)
      .setRanges([statusRange])
      .build();

    // Rule for Approved / Paid (Green)
    const ruleApproved = SpreadsheetApp.newConditionalFormatRule()
      .whenTextEqualTo("Approved")
      .setBackground("#D1FAE5")
      .setFontColor("#065F46")
      .setBold(true)
      .setRanges([statusRange])
      .build();

    const rulePaid = SpreadsheetApp.newConditionalFormatRule()
      .whenTextEqualTo("Paid")
      .setBackground("#D1FAE5")
      .setFontColor("#065F46")
      .setBold(true)
      .setRanges([statusRange])
      .build();

    // Rule for Rejected (Red)
    const ruleRejected = SpreadsheetApp.newConditionalFormatRule()
      .whenTextEqualTo("Rejected")
      .setBackground("#FEE2E2")
      .setFontColor("#991B1B")
      .setBold(true)
      .setRanges([statusRange])
      .build();

    sheet.setConditionalFormatRules([rulePending, ruleApproved, rulePaid, ruleRejected]);
  } catch (e) {
    Logger.log("Conditional format notice: " + e.toString());
  }
}

/**
 * 🛠️ AUTO-FIX & REALIGN FUNCTION
 * If you ever have shifted columns from older tests, this realigns everything.
 */
function autoFixSheet() {
  const ss = getSpreadsheet();
  const sheet = setupNewSheet(ss);
  
  const lastRow = sheet.getLastRow();
  let fixedCount = 0;

  if (lastRow > 1) {
    const totalCols = Math.max(sheet.getLastColumn(), 25);
    const range = sheet.getRange(2, 1, lastRow - 1, totalCols);
    const rows = range.getValues();
    const updatedRows = [];

    for (let i = 0; i < rows.length; i++) {
      const rawRow = rows[i];
      const fixedRow = realignRowData(rawRow);
      updatedRows.push(fixedRow);
      fixedCount++;
    }

    if (updatedRows.length > 0) {
      sheet.getRange(2, 1, updatedRows.length, 25).setValues(updatedRows);
    }
  }

  return "Verified & aligned " + fixedCount + " rows. 25 columns fully active.";
}

/**
 * Intelligent helper to re-align any shifted row back to its proper 25 columns
 */
function realignRowData(row) {
  const clean = new Array(25).fill("");

  const isUrl = (v) => String(v || "").startsWith("http://") || String(v || "").startsWith("https://");
  const isDriveUrl = (v) => String(v || "").indexOf("drive.google.com") !== -1 || isUrl(v);
  const isPhone = (v) => {
    const digits = String(v || "").replace(/[^0-9]/g, "");
    return (digits.length === 11 && (digits.startsWith("01") || digits.startsWith("1"))) || (digits.length === 10 && digits.startsWith("1"));
  };
  const isEmail = (v) => String(v || "").includes("@") && String(v || "").includes(".");
  const isDept = (v) => {
    const s = String(v || "").toLowerCase();
    return s.includes("engineering") || s.includes("yarn") || s.includes("fabric") || s.includes("wet") || s.includes("apparel") || s === "ae" || s === "ye" || s === "fe" || s === "wpe";
  };

  clean[0] = row[0] || ""; // Reg ID
  clean[1] = row[1] || ""; // Date
  clean[2] = row[2] || "Pending"; // Status

  let teamName = "";
  let leaderName = "";
  let leaderRoll = "";
  let leaderDept = "";
  let leaderWhatsApp = "";
  let leaderFb = "";
  let leaderEmail = "";
  let leaderPhoto = "";

  const drivePhotos = [];
  const fbs = [];
  const phones = [];
  const depts = [];

  for (let c = 3; c < row.length; c++) {
    const val = String(row[c] || "").trim();
    if (!val) continue;

    if (val.indexOf("drive.google.com") !== -1) {
      drivePhotos.push(val);
    } else if (isEmail(val)) {
      if (!leaderEmail) leaderEmail = val;
    } else if (isDept(val)) {
      depts.push(val);
    } else if (isPhone(val)) {
      phones.push(val);
    } else if (isUrl(val) && (val.includes("facebook") || val.includes("fb.com"))) {
      fbs.push(val);
    }
  }

  const colD = String(row[3] || "").trim();
  const colE = String(row[4] || "").trim();

  if (colD && colE && !isDept(colE) && !isPhone(colE) && !isUrl(colE) && isNaN(Number(colE))) {
    teamName = colD;
    leaderName = colE;
  } else {
    leaderName = colD;
    teamName = "";
  }

  if (row[5] && !isDept(row[5])) leaderRoll = row[5];
  else if (row[4] && !isDept(row[4]) && !isNaN(Number(row[4]))) leaderRoll = row[4];

  if (row[6] && isDept(row[6])) leaderDept = row[6];
  else if (row[5] && isDept(row[5])) leaderDept = row[5];
  else if (depts.length > 0) leaderDept = depts[0];

  if (phones.length > 0) leaderWhatsApp = phones[0];
  if (fbs.length > 0) leaderFb = fbs[0];
  if (drivePhotos.length > 0) leaderPhoto = drivePhotos[0];

  clean[3] = teamName;
  clean[4] = leaderName;
  clean[5] = leaderRoll || "";
  clean[6] = leaderDept || "";
  clean[7] = leaderWhatsApp || "";
  clean[8] = leaderFb || "";
  clean[9] = leaderEmail || "";
  clean[10] = leaderPhoto || "";

  // Member 1
  clean[11] = row[11] && !isDriveUrl(row[11]) ? row[11] : (row[12] && !isDriveUrl(row[12]) && !isPhone(row[12]) ? row[12] : "");
  clean[12] = row[12] && !isDept(row[12]) ? row[12] : (row[13] && !isDept(row[13]) ? row[13] : "");
  clean[13] = depts[1] || "";
  clean[14] = phones[1] || "";
  clean[15] = fbs[1] || "";
  clean[16] = drivePhotos[1] || "";

  // Member 2
  clean[17] = row[17] && !isDriveUrl(row[17]) ? row[17] : (row[18] && !isDriveUrl(row[18]) && !isPhone(row[18]) ? row[18] : "");
  clean[18] = row[18] && !isDept(row[18]) ? row[18] : (row[19] && !isDept(row[19]) ? row[19] : "");
  clean[19] = depts[2] || "";
  clean[20] = phones[2] || "";
  clean[21] = fbs[2] || "";
  clean[22] = drivePhotos[2] || "";

  // Payment
  clean[23] = phones.length > 3 ? phones[phones.length - 1] : (row[23] || row[22] || "");
  clean[24] = row[24] || row[23] || "";

  return clean;
}

/**
 * Handle HTTP GET Requests (Health check, Search, List, Setup)
 */
function doGet(e) {
  try {
    const params = e && e.parameter ? e.parameter : {};
    const action = params.action || (params.regId ? "get" : "health");
    const rawSearch = String(params.regId || params.registrationId || params.search || "").trim();
    const cleanSearch = rawSearch.toUpperCase();

    // Trigger Setup directly from URL if requested
    if (action === "setup" || action === "init") {
      const msg = setup();
      return createResponse({ success: true, message: msg });
    }

    if (action === "repair" || action === "autofix") {
      const msg = autoFixSheet();
      return createResponse({ success: true, message: msg });
    }

    // Health / Test connection
    if (action === "health" || action === "test" || action === "ping") {
      const ss = getSpreadsheet();
      const sheet = setupNewSheet(ss);
      const totalRows = Math.max(0, sheet.getLastRow() - 1);
      return createResponse({
        status: "ok",
        success: true,
        message: "Connected to Textile Presentation 2026 Google Sheet (25 columns active).",
        sheetName: sheet.getName(),
        totalRows: totalRows,
        totalCols: 25,
        timestamp: new Date().toISOString()
      });
    }

    // Live search for single registration
    if (action === "get" || action === "status" || action === "find") {
      if (!rawSearch) {
        return createResponse({
          success: false,
          error: "Missing registration ID or search keyword."
        });
      }

      const ss = getSpreadsheet();
      const sheet = setupNewSheet(ss);
      const data = sheet.getDataRange().getValues();

      if (data && data.length > 1) {
        const headers = data[0].map(h => String(h || "").trim().toLowerCase());
        const findCol = (name) => headers.findIndex(h => h.includes(name.toLowerCase()));

        const colTeam = findCol("team");
        const colLeaderRoll = findCol("leader roll");
        const colM1Roll = findCol("member 1 roll");
        const colM2Roll = findCol("member 2 roll");
        const colTrx = findCol("transaction");
        const colEmail = findCol("email");
        const colLeaderPhone = findCol("leader whatsapp");
        const colM1Phone = findCol("member 1 whatsapp");
        const colM2Phone = findCol("member 2 whatsapp");

        for (let i = 1; i < data.length; i++) {
          const row = data[i];
          const rowId = String(row[0] || "").trim().toUpperCase();
          const rowTeam = colTeam >= 0 ? String(row[colTeam] || "").trim() : String(row[3] || "").trim();
          const rowLeaderRoll = colLeaderRoll >= 0 ? String(row[colLeaderRoll] || "").trim().toUpperCase() : String(row[5] || row[4] || "").trim().toUpperCase();
          const rowM1Roll = colM1Roll >= 0 ? String(row[colM1Roll] || "").trim().toUpperCase() : String(row[12] || row[11] || "").trim().toUpperCase();
          const rowM2Roll = colM2Roll >= 0 ? String(row[colM2Roll] || "").trim().toUpperCase() : String(row[18] || row[17] || "").trim().toUpperCase();
          const rowTrx = colTrx >= 0 ? String(row[colTrx] || "").trim().toUpperCase() : String(row[24] || row[23] || "").trim().toUpperCase();
          const rowEmail = colEmail >= 0 ? String(row[colEmail] || "").trim().toLowerCase() : "";
          
          const normalizePhone = (p) => String(p || "").replace(/[^0-9]/g, "").slice(-10);
          const cleanPhoneSearch = normalizePhone(cleanSearch);
          const leaderPhone = colLeaderPhone >= 0 ? normalizePhone(row[colLeaderPhone]) : "";
          const m1Phone = colM1Phone >= 0 ? normalizePhone(row[colM1Phone]) : "";
          const m2Phone = colM2Phone >= 0 ? normalizePhone(row[colM2Phone]) : "";
          const searchEmail = rawSearch.toLowerCase();

          const cleanNum = cleanSearch.replace(/[^0-9]/g, "");
          const rowNum = rowId.replace(/[^0-9]/g, "");

          const isMatch = 
            rowId === cleanSearch ||
            (cleanNum && rowNum && rowNum.endsWith(cleanNum)) ||
            (rowTeam && rowTeam.toUpperCase() === cleanSearch) ||
            rowLeaderRoll === cleanSearch ||
            rowM1Roll === cleanSearch ||
            rowM2Roll === cleanSearch ||
            (rowEmail && searchEmail.includes("@") && rowEmail === searchEmail) ||
            (rowTrx && cleanSearch.length >= 6 && rowTrx === cleanSearch) ||
            (cleanPhoneSearch.length >= 8 && (leaderPhone === cleanPhoneSearch || m1Phone === cleanPhoneSearch || m2Phone === cleanPhoneSearch));

          if (isMatch) {
            const hasTeamCol = colTeam >= 0;
            return createResponse({
              success: true,
              found: true,
              registrationId: row[0],
              submissionDate: row[1],
              paymentStatus: row[2] || "Pending",
              teamName: hasTeamCol ? row[colTeam] : (row[3] || ""),
              leaderName: hasTeamCol ? row[4] : row[3],
              leaderRoll: hasTeamCol ? row[5] : row[4],
              leaderDepartment: hasTeamCol ? row[6] : row[5],
              leaderWhatsApp: hasTeamCol ? row[7] : row[6],
              leaderFacebook: hasTeamCol ? row[8] : row[7],
              leaderEmail: hasTeamCol ? row[9] : (row[8] || ""),
              leaderPhotoUrl: hasTeamCol ? row[10] : (row[9] || ""),
              member1Name: hasTeamCol ? row[11] : row[10],
              member1Roll: hasTeamCol ? row[12] : row[11],
              member1Department: hasTeamCol ? row[13] : row[12],
              member1WhatsApp: hasTeamCol ? row[14] : row[13],
              member1Facebook: hasTeamCol ? row[15] : row[14],
              member1PhotoUrl: hasTeamCol ? row[16] : (row[15] || ""),
              member2Name: hasTeamCol ? row[17] : row[16],
              member2Roll: hasTeamCol ? row[18] : row[17],
              member2Department: hasTeamCol ? row[19] : row[18],
              member2WhatsApp: hasTeamCol ? row[20] : row[19],
              member2Facebook: hasTeamCol ? row[21] : row[20],
              member2PhotoUrl: hasTeamCol ? row[22] : (row[21] || ""),
              bkashNumber: hasTeamCol ? row[23] : row[22],
              transactionId: hasTeamCol ? row[24] : row[23]
            });
          }
        }
      }

      return createResponse({
        success: false,
        found: false,
        error: "No registration found in Google Sheet for " + rawSearch
      });
    }

    return createResponse({
      status: "ok",
      success: true,
      message: "Textile Presentation Competition 2026 API ready.",
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    return createResponse({
      success: false,
      error: "doGet error: " + err.toString()
    });
  }
}

/**
 * Handle HTTP POST Requests (New Registrations, Edits, Payment Status Updates)
 */
function doPost(e) {
  const lock = LockService.getScriptLock();
  let lockAcquired = false;
  try {
    try {
      lockAcquired = lock.tryLock(25000);
    } catch (lockErr) {
      Logger.log("Lock warning: " + lockErr.toString());
    }

    let data;
    if (e && e.postData && e.postData.contents) {
      try {
        data = typeof e.postData.contents === "string" ? JSON.parse(e.postData.contents) : e.postData.contents;
      } catch (parseErr) {
        try {
          data = JSON.parse(decodeURIComponent(e.postData.contents));
        } catch (p2) {
          data = e.parameter;
        }
      }
    } else if (e && e.parameter) {
      data = e.parameter;
    } else {
      data = {};
    }

    const ss = getSpreadsheet();
    const sheet = setupNewSheet(ss);

    // =========================================================================
    // ACTION 1: STATUS UPDATE ONLY
    // =========================================================================
    if (data.action === "updateStatus" || data.action === "update_status") {
      const targetId = String(data.registrationId || data.regId || "").trim().toUpperCase();
      const newStatus = String(data.paymentStatus || data.status || "Paid").trim();

      if (!targetId) {
        return createResponse({
          success: false,
          error: "Missing registration ID for status update."
        });
      }

      const rows = sheet.getDataRange().getValues();
      let foundIndex = -1;
      for (let i = 1; i < rows.length; i++) {
        if (String(rows[i][0] || "").trim().toUpperCase() === targetId) {
          foundIndex = i + 1; // 1-based row index in Sheet
          break;
        }
      }

      if (foundIndex > 0) {
        sheet.getRange(foundIndex, 3).setValue(newStatus); // Column 3: Payment Status
        return createResponse({
          success: true,
          message: "Payment status updated to " + newStatus + " for " + targetId,
          registrationId: targetId,
          paymentStatus: newStatus
        });
      } else {
        return createResponse({
          success: false,
          error: "Registration ID " + targetId + " not found in sheet."
        });
      }
    }

    // =========================================================================
    // ACTION 2: NEW REGISTRATION SUBMISSION (25 COLUMNS WITH TEAM NAME)
    // =========================================================================
    const existingValues = sheet.getDataRange().getValues();

    const teamName = String(data.teamName || data.formData?.teamName || data["teamName"] || "").trim();
    const leaderObj = data.leader || data.formData?.leader || {};
    const member1Obj = data.member1 || data.formData?.member1 || {};
    const member2Obj = data.member2 || data.formData?.member2 || {};
    const paymentObj = data.payment || data.formData?.payment || {};

    const leaderRoll = String(leaderObj.roll || data["leader[roll]"] || "").trim();
    const m1Roll = String(member1Obj.roll || data["member1[roll]"] || "").trim();
    const m2Roll = String(member2Obj.roll || data["member2[roll]"] || "").trim();
    const transactionId = String(
      paymentObj.transactionId || 
      data["payment[transactionId]"] || 
      ""
    ).trim().toUpperCase();

    // Duplicate roll and transaction verification (only if existing data rows exist)
    if (existingValues && existingValues.length > 1) {
      for (let i = 1; i < existingValues.length; i++) {
        const row = existingValues[i];
        const rowTrxId = String(row[24] || row[row.length - 1] || "").trim().toUpperCase();

        if (rowTrxId && transactionId && rowTrxId === transactionId) {
          return createResponse({
            success: false,
            status: "error",
            error: "Duplicate Transaction ID detected. This transaction has already been registered."
          });
        }

        const incomingRolls = [leaderRoll, m1Roll, m2Roll].filter(Boolean);
        const rowText = row.map(v => String(v || "").trim());

        for (let r of incomingRolls) {
          if (rowText.includes(r)) {
            return createResponse({
              success: false,
              status: "error",
              error: "Student Roll " + r + " is already registered in team " + row[0] + "."
            });
          }
        }
      }
    }

    // Process participant photos to Google Drive
    let leaderPhotoUrl = leaderObj.photoUrl || leaderObj.photoPreview || "";
    let m1PhotoUrl = member1Obj.photoUrl || member1Obj.photoPreview || "";
    let m2PhotoUrl = member2Obj.photoUrl || member2Obj.photoPreview || "";

    try {
      const driveFolder = getOrCreateDriveFolder(DRIVE_FOLDER_NAME);
      const lBase64 = leaderObj.photoBase64;
      const m1Base64 = member1Obj.photoBase64;
      const m2Base64 = member2Obj.photoBase64;

      if (lBase64) {
        leaderPhotoUrl = saveBase64Image(driveFolder, lBase64, "Leader_" + (leaderRoll || "photo"));
      }
      if (m1Base64) {
        m1PhotoUrl = saveBase64Image(driveFolder, m1Base64, "Member1_" + (m1Roll || "photo"));
      }
      if (m2Base64) {
        m2PhotoUrl = saveBase64Image(driveFolder, m2Base64, "Member2_" + (m2Roll || "photo"));
      }
    } catch (driveErr) {
      Logger.log("Google Drive photo notice: " + driveErr.toString());
      if (!leaderPhotoUrl && leaderObj.photoBase64) leaderPhotoUrl = "Uploaded";
      if (!m1PhotoUrl && member1Obj.photoBase64) m1PhotoUrl = "Uploaded";
      if (!m2PhotoUrl && member2Obj.photoBase64) m2PhotoUrl = "Uploaded";
    }

    // Compute Registration ID: Scan highest existing sequence number + 1
    // (For brand new sheet, highest is 0 -> TEX2026-001)
    let highestSeq = 0;
    if (existingValues && existingValues.length > 1) {
      for (let i = 1; i < existingValues.length; i++) {
        const idStr = String(existingValues[i][0] || "").trim();
        const match = idStr.match(/(\d+)$/);
        if (match) {
          const num = parseInt(match[1], 10);
          if (!isNaN(num) && num > highestSeq) {
            highestSeq = num;
          }
        }
      }
    }

    const regSequence = highestSeq + 1;
    const regId = "TEX2026-" + ("000" + regSequence).slice(-3);

    // Format local Bangladesh Time (BST)
    const now = new Date();
    const submissionDate = Utilities.formatDate(now, "Asia/Dhaka", "yyyy-MM-dd HH:mm:ss");

    // Extract exact field values
    const leaderName = String(leaderObj.name || data["leader[name]"] || "").trim();
    const leaderDept = String(leaderObj.department || data["leader[department]"] || "").trim();
    const leaderWhatsApp = String(leaderObj.whatsapp || data["leader[whatsapp]"] || "").trim();
    const leaderFacebook = String(leaderObj.facebook || data["leader[facebook]"] || "").trim();
    const leaderEmail = String(leaderObj.email || data["leader[email]"] || data.email || data.leaderEmail || "").trim();

    const m1Name = String(member1Obj.name || data["member1[name]"] || "").trim();
    const m1Dept = String(member1Obj.department || data["member1[department]"] || "").trim();
    const m1WhatsApp = String(member1Obj.whatsapp || data["member1[whatsapp]"] || "").trim();
    const m1Facebook = String(member1Obj.facebook || data["member1[facebook]"] || "").trim();

    const m2Name = String(member2Obj.name || data["member2[name]"] || "").trim();
    const m2Dept = String(member2Obj.department || data["member2[department]"] || "").trim();
    const m2WhatsApp = String(member2Obj.whatsapp || data["member2[whatsapp]"] || "").trim();
    const m2Facebook = String(member2Obj.facebook || data["member2[facebook]"] || "").trim();

    const bkashNum = String(paymentObj.bkashNumber || data["payment[bkashNumber]"] || "").trim();

    // =========================================================================
    // 🎯 STRICT FIXED 25-COLUMN ARRAY (With Team Name at Column D / 4)
    // =========================================================================
    const newRow = [
      regId,            // 1.  Registration ID          [Col A / 1]
      submissionDate,   // 2.  Submission Date & Time   [Col B / 2]
      "Pending",        // 3.  Payment Status           [Col C / 3]
      teamName,         // 4.  Team Name                [Col D / 4]  <-- Official Team Identity
      leaderName,       // 5.  Group Leader Name        [Col E / 5]
      leaderRoll,       // 6.  Group Leader Roll        [Col F / 6]
      leaderDept,       // 7.  Group Leader Department  [Col G / 7]
      leaderWhatsApp,   // 8.  Group Leader WhatsApp    [Col H / 8]
      leaderFacebook,   // 9.  Group Leader Facebook    [Col I / 9]
      leaderEmail,      // 10. Group Leader Email       [Col J / 10]
      leaderPhotoUrl,   // 11. Group Leader Photo URL   [Col K / 11]
      m1Name,           // 12. Member 1 Name            [Col L / 12]
      m1Roll,           // 13. Member 1 Roll            [Col M / 13]
      m1Dept,           // 14. Member 1 Department      [Col N / 14]
      m1WhatsApp,       // 15. Member 1 WhatsApp        [Col O / 15]
      m1Facebook,       // 16. Member 1 Facebook        [Col P / 16]
      m1PhotoUrl,       // 17. Member 1 Photo URL       [Col Q / 17]
      m2Name,           // 18. Member 2 Name            [Col R / 18]
      m2Roll,           // 19. Member 2 Roll            [Col S / 19]
      m2Dept,           // 20. Member 2 Department      [Col T / 20]
      m2WhatsApp,       // 21. Member 2 WhatsApp        [Col U / 21]
      m2Facebook,       // 22. Member 2 Facebook        [Col V / 22]
      m2PhotoUrl,       // 23. Member 2 Photo URL       [Col W / 23]
      bkashNum,         // 24. bKash Number             [Col X / 24]
      transactionId     // 25. Transaction ID           [Col Y / 25]
    ];

    // Append exactly 25 values to the sheet
    sheet.appendRow(newRow);

    // Style the newly inserted row
    const newRowNum = sheet.getLastRow();
    try {
      sheet.setRowHeight(newRowNum, 32);
      sheet.getRange(newRowNum, 1, 1, 25).setVerticalAlignment("middle");
      
      // Center align ID, Date, Status, Rolls, Phones, Trx
      const centerCols = [1, 2, 3, 6, 8, 13, 15, 19, 21, 24, 25];
      centerCols.forEach(col => {
        sheet.getRange(newRowNum, col).setHorizontalAlignment("center");
      });
    } catch (_) {}

    return createResponse({
      success: true,
      status: "success",
      registrationId: regId,
      submissionDate: submissionDate,
      teamName: teamName,
      paymentStatus: "Pending",
      message: "Registration saved to Google Sheets with 25 aligned columns (including Team Name).",
      photos: {
        leader: leaderPhotoUrl,
        member1: m1PhotoUrl,
        member2: m2PhotoUrl
      }
    });

  } catch (err) {
    Logger.log("Error in doPost: " + err.toString());
    return createResponse({
      success: false,
      status: "error",
      error: "Unable to submit registration: " + err.toString(),
      details: err.toString()
    });
  } finally {
    if (lockAcquired) {
      try {
        lock.releaseLock();
      } catch (_) {}
    }
  }
}

function getSpreadsheet() {
  if (typeof SPREADSHEET_ID !== "undefined" && SPREADSHEET_ID && SPREADSHEET_ID.trim() !== "") {
    const cleanId = SPREADSHEET_ID.trim();
    try {
      if (cleanId.indexOf("http") === 0) {
        return SpreadsheetApp.openByUrl(cleanId);
      }
      return SpreadsheetApp.openById(cleanId);
    } catch (openErr) {
      Logger.log("Failed to open spreadsheet by ID/URL: " + openErr.toString());
    }
  }

  try {
    const active = SpreadsheetApp.getActiveSpreadsheet();
    if (active) return active;
  } catch (e) {}

  try {
    const files = DriveApp.getFilesByName("Textile Presentation Competition 2026 Registrations");
    if (files.hasNext()) {
      return SpreadsheetApp.open(files.next());
    }
  } catch (driveSearchErr) {
    Logger.log("Drive search error: " + driveSearchErr.toString());
  }

  try {
    const newSs = SpreadsheetApp.create("Textile Presentation Competition 2026 Registrations");
    return newSs;
  } catch (createErr) {
    throw new Error("Could not access Google Spreadsheet: " + createErr.toString());
  }
}

function getOrCreateDriveFolder(folderName) {
  try {
    const folders = DriveApp.getFoldersByName(folderName);
    if (folders.hasNext()) {
      const f = folders.next();
      try {
        f.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
      } catch (_) {}
      return f;
    }
    const created = DriveApp.createFolder(folderName);
    try {
      created.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    } catch (_) {}
    return created;
  } catch (e) {
    Logger.log("Drive folder access notice: " + e.toString());
    return DriveApp.getRootFolder();
  }
}

function saveBase64Image(folder, base64Data, filenamePrefix) {
  if (!base64Data) return "";
  let contentType = "image/jpeg";
  let data = base64Data;
  if (base64Data.indexOf("data:") === 0) {
    const parts = base64Data.split(",");
    const match = parts[0].match(/:(.*?);/);
    if (match) {
      contentType = match[1];
    }
    data = parts[1];
  }
  const decoded = Utilities.base64Decode(data);
  const blob = Utilities.newBlob(decoded, contentType, filenamePrefix + "_" + Date.now() + ".jpg");
  const file = folder.createFile(blob);
  try {
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  } catch (shareErr) {
    Logger.log("Permission notice: " + shareErr.toString());
  }
  return file.getUrl();
}

function createResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
