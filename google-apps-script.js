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

  let emailQuota = "N/A";
  try {
    emailQuota = MailApp.getRemainingDailyQuota();
  } catch (_) {}

  Logger.log("==================================================");
  Logger.log("🎉 NEW GOOGLE SHEET SETUP COMPLETE!");
  Logger.log("📄 Spreadsheet: " + ss.getName());
  Logger.log("📋 Sheet Name: " + sheet.getName());
  Logger.log("📁 Drive Folder: " + folder.getName());
  Logger.log("✨ 25 columns configured with Team Name at Column D.");
  Logger.log("📧 Daily Email Quota Remaining: " + emailQuota + " emails");
  Logger.log("==================================================");

  return "Setup successful! 25 standard columns are ready with dropdowns, photo folder, and automatic confirmation emails.";
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

    // Update registration from GET query (supports environments where POST/CORS is restricted)
    if (action === "updateRegistration" || action === "update" || action === "editRegistration") {
      const ss = getSpreadsheet();
      const sheet = setupNewSheet(ss);
      let updatePayload = {};
      if (params.data) {
        try {
          updatePayload = JSON.parse(decodeURIComponent(params.data));
        } catch (_) {
          try {
            updatePayload = JSON.parse(params.data);
          } catch (_) {
            updatePayload = params;
          }
        }
      } else {
        updatePayload = params;
      }
      return handleUpdateRegistration(sheet, updatePayload);
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
    // ACTION: UPDATE REGISTRATION DETAILS (TEAM NAME, PARTICIPANTS, PHOTOS)
    // =========================================================================
    if (data.action === "updateRegistration" || data.action === "editRegistration" || data.action === "update") {
      return handleUpdateRegistration(sheet, data);
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

    // =========================================================================
    // 📧 SEND AUTOMATIC REGISTRATION CONFIRMATION EMAIL IMMEDIATELY (WITH ATTACHED PDF VOUCHER)
    // =========================================================================
    let emailSent = false;
    let emailStatusMessage = "No valid leader email provided";

    if (leaderEmail && leaderEmail.indexOf("@") !== -1) {
      try {
        emailSent = sendRegistrationConfirmationEmail({
          registrationId: regId,
          teamName: teamName || "N/A",
          leaderName: leaderName,
          leaderRoll: leaderRoll,
          leaderDept: leaderDept,
          leaderWhatsApp: leaderWhatsApp,
          paymentStatus: "Pending",
          submissionDate: submissionDate,
          email: leaderEmail,
          pdfBase64: data.pdfBase64 || (data.formData && data.formData.pdfBase64) || null,
          m1Name: m1Name,
          m1Roll: m1Roll,
          m1Dept: m1Dept,
          m1Mobile: m1WhatsApp,
          m2Name: m2Name,
          m2Roll: m2Roll,
          m2Dept: m2Dept,
          m2Mobile: m2WhatsApp,
          bkashNum: bkashNum,
          transactionId: transactionId
        });
        emailStatusMessage = emailSent 
          ? "Automatic confirmation email with PDF voucher attached sent successfully to " + leaderEmail
          : "Could not send email (quota limit or permissions)";
      } catch (mailEx) {
        emailStatusMessage = "Email error: " + mailEx.toString();
        Logger.log("[EMAIL ERROR] " + mailEx.toString());
      }
    }

    return createResponse({
      success: true,
      status: "success",
      registrationId: regId,
      submissionDate: submissionDate,
      teamName: teamName,
      paymentStatus: "Pending",
      emailSent: emailSent,
      emailRecipient: leaderEmail,
      emailStatusMessage: emailStatusMessage,
      message: "Registration saved to Google Sheets and confirmation email processed.",
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

// =============================================================================
// 📧 OFFICIAL REGISTRATION CONFIRMATION EMAIL ENGINE
// =============================================================================

/**
 * Sends official registration confirmation email immediately after successful registration.
 * Dynamically replaces all {{ }} placeholders with the corresponding registration data.
 * 
 * Exact format:
 * Subject: Registration Confirmation – Textile Presentation Competition 2026 | {{Registration ID}}
 * 
 * Dear {{Group Leader Name}},
 * 
 * We are pleased to inform you that your registration for the Textile Presentation Competition 2026 has been successfully received and recorded.
 * 
 * Registration Details
 * 
 * Registration ID: {{Registration ID}}
 * Team Name: {{Team Name}}
 * Group Leader: {{Group Leader Name}}
 * Roll No.: {{Group Leader Roll}}
 * Department: {{Group Leader Department}}
 * Mobile No.: {{Group Leader WhatsApp}}
 * Payment Status: {{Payment Status}}
 * Submission Date: {{Submission Date}}
 * 
 * Registration Verification
 * 
 * You may check and verify your registration information through our official website using:
 * 
 * Registration ID + Mobile No. + Roll No.
 * 
 * Please keep these details safe and readily available for future reference, verification, or any registration-related communication.
 * 
 * Thank you for your participation. We sincerely appreciate your interest in the Textile Presentation Competition 2026 and look forward to your participation.
 * 
 * Sincerely,
 * Organizing Committee
 * Career Club BTEC
 * Barishal Textile Engineering College (BTEC)
 */
function sendRegistrationConfirmationEmail(details) {
  if (!details || !details.email || details.email.indexOf("@") === -1) {
    Logger.log("Skipping confirmation email: No valid recipient email address provided.");
    return false;
  }

  const regId = String(details.registrationId || "").trim();
  const teamName = String(details.teamName || "N/A").trim();
  const leaderName = String(details.leaderName || "").trim();
  const leaderRoll = String(details.leaderRoll || "").trim();
  const leaderDept = String(details.leaderDept || "").trim();
  const leaderWhatsApp = String(details.leaderWhatsApp || "").trim();
  const paymentStatus = String(details.paymentStatus || "Pending").trim();
  const submissionDate = String(details.submissionDate || Utilities.formatDate(new Date(), "Asia/Dhaka", "yyyy-MM-dd HH:mm:ss")).trim();

  // Exact Subject format
  const subject = "Registration Confirmation – Textile Presentation Competition 2026 | " + regId;

  // Clean, formal and professional plain text body
  const plainBody = 
    "Dear " + leaderName + ",\n\n" +
    "We are pleased to inform you that your registration for the Textile Presentation Competition 2026 has been successfully received and recorded.\n\n" +
    "Registration Details\n\n" +
    "Registration ID: " + regId + "\n" +
    "Team Name: " + teamName + "\n" +
    "Group Leader: " + leaderName + "\n" +
    "Roll No.: " + leaderRoll + "\n" +
    "Department: " + leaderDept + "\n" +
    "Mobile No.: " + leaderWhatsApp + "\n" +
    "Payment Status: " + paymentStatus + "\n" +
    "Submission Date: " + submissionDate + "\n\n" +
    "Registration Verification\n\n" +
    "You may check and verify your registration information through our official website using:\n\n" +
    "Registration ID + Mobile No. + Roll No.\n\n" +
    "Please keep these details safe and readily available for future reference, verification, or any registration-related communication.\n\n" +
    "Support & Inquiries: careerclubbtec@gmail.com | Helpline: +880 1798-246810\n\n" +
    "Thank you for your participation. We sincerely appreciate your interest in the Textile Presentation Competition 2026 and look forward to your participation.\n\n" +
    "Sincerely,\n" +
    "Organizing Committee\n" +
    "Career Club BTEC\n" +
    "Barishal Textile Engineering College (BTEC)";

  // Professional Formal HTML Email Body
  const htmlBody = 
    '<div style="font-family: -apple-system, BlinkMacSystemFont, \'Segoe UI\', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; color: #0f172a; line-height: 1.6;">' +
      '<div style="background-color: #0A192F; padding: 26px 30px; text-align: center; border-bottom: 3px solid #16A34A;">' +
        '<h1 style="color: #ffffff; margin: 0; font-size: 20px; font-weight: 800; letter-spacing: -0.5px;">Textile Presentation Competition 2026</h1>' +
        '<p style="color: #22C55E; margin: 5px 0 0 0; font-size: 13px; font-weight: 700;">Career Club BTEC • Barishal Textile Engineering College</p>' +
      '</div>' +
      '<div style="padding: 28px 30px 24px 30px;">' +
        '<p style="font-size: 15px; margin: 0 0 16px 0; color: #0A192F;">Dear <strong>' + escapeHtml(leaderName) + '</strong>,</p>' +
        '<p style="font-size: 14px; margin: 0 0 24px 0; color: #334155; line-height: 1.6;">We are pleased to inform you that your registration for the <strong>Textile Presentation Competition 2026</strong> has been successfully received and recorded.</p>' +

        '<div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin-bottom: 24px;">' +
          '<h2 style="font-size: 15px; font-weight: 800; margin: 0 0 14px 0; color: #0A192F; border-bottom: 1px solid #cbd5e1; padding-bottom: 8px;">Registration Details</h2>' +
          '<table style="width: 100%; border-collapse: collapse; font-size: 13.5px;">' +
            '<tr><td style="padding: 6px 0; color: #64748b; width: 145px; font-weight: 600;">Registration ID:</td><td style="padding: 6px 0; color: #16A34A; font-weight: 800; font-family: monospace; font-size: 15px;">' + escapeHtml(regId) + '</td></tr>' +
            '<tr><td style="padding: 6px 0; color: #64748b; font-weight: 600;">Team Name:</td><td style="padding: 6px 0; color: #0A192F; font-weight: 700;">' + escapeHtml(teamName) + '</td></tr>' +
            '<tr><td style="padding: 6px 0; color: #64748b; font-weight: 600;">Group Leader:</td><td style="padding: 6px 0; color: #0A192F; font-weight: 600;">' + escapeHtml(leaderName) + '</td></tr>' +
            '<tr><td style="padding: 6px 0; color: #64748b; font-weight: 600;">Roll No.:</td><td style="padding: 6px 0; color: #0A192F; font-weight: 600;">' + escapeHtml(leaderRoll) + '</td></tr>' +
            '<tr><td style="padding: 6px 0; color: #64748b; font-weight: 600;">Department:</td><td style="padding: 6px 0; color: #0A192F; font-weight: 600;">' + escapeHtml(leaderDept) + '</td></tr>' +
            '<tr><td style="padding: 6px 0; color: #64748b; font-weight: 600;">Mobile No.:</td><td style="padding: 6px 0; color: #0A192F; font-weight: 600;">' + escapeHtml(leaderWhatsApp) + '</td></tr>' +
            '<tr><td style="padding: 6px 0; color: #64748b; font-weight: 600;">Payment Status:</td><td style="padding: 6px 0;"><span style="background-color: #fef3c7; color: #92400e; padding: 3px 10px; border-radius: 6px; font-weight: 700; font-size: 12px; display: inline-block;">' + escapeHtml(paymentStatus) + '</span></td></tr>' +
            '<tr><td style="padding: 6px 0; color: #64748b; font-weight: 600;">Submission Date:</td><td style="padding: 6px 0; color: #0A192F; font-weight: 600;">' + escapeHtml(submissionDate) + '</td></tr>' +
          '</table>' +
        '</div>' +

        '<div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 18px 20px; margin-bottom: 24px;">' +
          '<h3 style="font-size: 14px; font-weight: 800; margin: 0 0 8px 0; color: #166534;">Registration Verification</h3>' +
          '<p style="font-size: 13px; margin: 0 0 12px 0; color: #14532d;">You may check and verify your registration information through our official website using:</p>' +
          '<div style="background-color: #ffffff; border: 1px dashed #22c55e; border-radius: 8px; padding: 10px 14px; font-weight: 800; color: #0A192F; font-size: 13.5px; text-align: center; letter-spacing: 0.3px;">' +
            'Registration ID + Mobile No. + Roll No.' +
          '</div>' +
        '</div>' +

        '<p style="font-size: 13px; color: #475569; margin: 0 0 16px 0; line-height: 1.6;">Please keep these details safe and readily available for future reference, verification, or any registration-related communication.</p>' +
        '<p style="font-size: 13px; color: #475569; margin: 0 0 26px 0; line-height: 1.6;">Thank you for your participation. We sincerely appreciate your interest in the Textile Presentation Competition 2026 and look forward to your participation.</p>' +

        '<div style="border-top: 1px solid #e2e8f0; padding-top: 18px; font-size: 13px; color: #334155; line-height: 1.5;">' +
          '<p style="margin: 0; font-weight: 600;">Sincerely,</p>' +
          '<p style="margin: 2px 0 0 0; font-weight: 800; color: #0A192F;">Organizing Committee</p>' +
          '<p style="margin: 2px 0 0 0; color: #16A34A; font-weight: 700;">Career Club BTEC</p>' +
          '<p style="margin: 2px 0 0 0; color: #64748b;">Barishal Textile Engineering College (BTEC)</p>' +
          '<p style="margin: 6px 0 0 0; font-size: 12px; color: #94a3b8;">Email: <a href="mailto:careerclubbtec@gmail.com" style="color: #16A34A; text-decoration: none;">careerclubbtec@gmail.com</a> | Helpline: +880 1798-246810</p>' +
        '</div>' +
      '</div>' +
    '</div>';

  // Prepare Registration PDF voucher attachment
  let pdfAttachment = null;
  const pdfFilename = "Registration_Voucher_" + regId + ".pdf";

  // Method 1: If client or server supplied pre-generated base64 PDF
  if (details.pdfBase64 && typeof details.pdfBase64 === "string" && details.pdfBase64.trim().length > 100) {
    try {
      let rawBase64 = String(details.pdfBase64).trim();
      if (rawBase64.indexOf(",") !== -1) {
        rawBase64 = rawBase64.split(",")[1];
      }
      rawBase64 = rawBase64.replace(/\s+/g, "");
      const decodedBytes = Utilities.base64Decode(rawBase64);
      if (decodedBytes && decodedBytes.length > 0) {
        pdfAttachment = Utilities.newBlob(decodedBytes, "application/pdf", pdfFilename);
        Logger.log("[PDF ATTACHMENT] Successfully decoded client base64 PDF (" + decodedBytes.length + " bytes)");
      }
    } catch (decodeErr) {
      Logger.log("[PDF NOTICE] Could not decode client base64 PDF: " + decodeErr.toString());
    }
  }

  // Method 2: Native Google Apps Script PDF Generation via HtmlService (100% reliable)
  if (!pdfAttachment) {
    try {
      const voucherHtml =
        '<!DOCTYPE html><html><head><meta charset="utf-8">' +
        '<style>' +
        'body { font-family: -apple-system, BlinkMacSystemFont, Arial, sans-serif; margin: 30px; color: #0A192F; }' +
        '.card { border: 2px solid #0A192F; border-radius: 12px; overflow: hidden; }' +
        '.hdr { background-color: #0A192F; color: #ffffff; padding: 22px 26px; border-bottom: 3px solid #16A34A; }' +
        '.hdr h1 { margin: 0; font-size: 20px; font-weight: 800; letter-spacing: 0.5px; }' +
        '.hdr p { margin: 4px 0 0; color: #22C55E; font-size: 12px; font-weight: bold; }' +
        '.bdy { padding: 24px 26px; }' +
        '.info-box { background-color: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; padding: 14px 18px; margin-bottom: 20px; }' +
        'table { width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 13px; }' +
        'th { background-color: #f1f5f9; color: #475569; font-weight: bold; padding: 8px 10px; text-align: left; border-bottom: 2px solid #cbd5e1; font-size: 11px; text-transform: uppercase; }' +
        'td { padding: 8px 10px; border-bottom: 1px solid #e2e8f0; font-size: 12.5px; }' +
        '.section-title { font-size: 14px; font-weight: bold; color: #0A192F; margin: 18px 0 8px; border-bottom: 1px solid #cbd5e1; padding-bottom: 4px; }' +
        '.note-box { background-color: #f0fdf4; border: 1px solid #86efac; border-radius: 8px; padding: 12px 16px; color: #166534; font-size: 11.5px; line-height: 1.5; margin-top: 20px; }' +
        '.footer { margin-top: 26px; text-align: center; font-size: 11px; color: #64748b; border-top: 1px solid #e2e8f0; padding-top: 12px; }' +
        '</style></head><body>' +
        '<div class="card">' +
          '<div class="hdr">' +
            '<h1>CAREER CLUB BTEC</h1>' +
            '<p>TEXTILE PRESENTATION COMPETITION 2026 • OFFICIAL ENTRY VOUCHER</p>' +
          '</div>' +
          '<div class="bdy">' +
            '<div class="info-box">' +
              '<table style="margin: 0; border: none;">' +
                '<tr style="border: none;"><td style="border: none; padding: 3px 0;"><strong>Registration ID:</strong> <span style="color: #16A34A; font-family: monospace; font-size: 15px; font-weight: bold;">' + escapeHtml(regId) + '</span></td>' +
                '<td style="border: none; padding: 3px 0; text-align: right;"><strong>Event Date:</strong> 04 Oct 2026 (9:00 AM BST)</td></tr>' +
                '<tr style="border: none;"><td style="border: none; padding: 3px 0;"><strong>Team Name:</strong> <span style="font-weight: bold; color: #0A192F;">' + escapeHtml(teamName) + '</span></td>' +
                '<td style="border: none; padding: 3px 0; text-align: right;"><strong>Venue:</strong> BTEC Auditorium</td></tr>' +
              '</table>' +
            '</div>' +
            '<div class="section-title">Team Participants</div>' +
            '<table>' +
              '<tr><th>Role</th><th>Name</th><th>Roll</th><th>Department</th><th>Mobile No.</th></tr>' +
              '<tr><td><strong>Leader</strong></td><td>' + escapeHtml(leaderName) + '</td><td>' + escapeHtml(leaderRoll) + '</td><td>' + escapeHtml(leaderDept) + '</td><td>' + escapeHtml(leaderWhatsApp) + '</td></tr>' +
              '<tr><td><strong>Member 1</strong></td><td>' + escapeHtml(details.m1Name || "—") + '</td><td>' + escapeHtml(details.m1Roll || "—") + '</td><td>' + escapeHtml(details.m1Dept || "—") + '</td><td>' + escapeHtml(details.m1Mobile || "—") + '</td></tr>' +
              '<tr><td><strong>Member 2</strong></td><td>' + escapeHtml(details.m2Name || "—") + '</td><td>' + escapeHtml(details.m2Roll || "—") + '</td><td>' + escapeHtml(details.m2Dept || "—") + '</td><td>' + escapeHtml(details.m2Mobile || "—") + '</td></tr>' +
            '</table>' +
            '<div class="section-title">Payment Verification</div>' +
            '<table>' +
              '<tr><td><strong>Registration Fee:</strong></td><td style="color: #E2136E; font-weight: bold;">149 BDT (bKash)</td><td><strong>Sender bKash:</strong></td><td>' + escapeHtml(details.bkashNum || "—") + '</td></tr>' +
              '<tr><td><strong>Transaction ID (TrxID):</strong></td><td style="font-family: monospace; font-weight: bold; color: #E2136E;">' + escapeHtml(details.transactionId || "—") + '</td><td><strong>Payment Status:</strong></td><td>' + escapeHtml(paymentStatus) + '</td></tr>' +
              '<tr><td><strong>Submission Date:</strong></td><td colspan="3">' + escapeHtml(submissionDate) + '</td></tr>' +
            '</table>' +
            '<div class="note-box">' +
              '<strong>IMPORTANT EVENT INSTRUCTIONS:</strong><br/>' +
              '• Please print this voucher or carry this digital PDF along with your student ID on the event day.<br/>' +
              '• Reporting time: 8:30 AM BST on 04 October 2026 at BTEC Auditorium.<br/>' +
              '• Support Helpline: +880 1798-246810 | Email: careerclubbtec@gmail.com' +
            '</div>' +
            '<div class="footer">' +
              '© 2026 Career Club BTEC • Barishal Textile Engineering College • Doc Ref: ' + escapeHtml(regId) +
            '</div>' +
          '</div>' +
        '</div>' +
        '</body></html>';

      const htmlOutput = HtmlService.createHtmlOutput(voucherHtml);
      pdfAttachment = htmlOutput.getAs("application/pdf").setName(pdfFilename);
      Logger.log("[PDF ATTACHMENT] Successfully created PDF via HtmlService for " + regId);
    } catch (pdfErr) {
      Logger.log("[PDF NOTICE] HtmlService generation notice: " + pdfErr.toString() + " - Trying DriveApp fallback...");
      try {
        const tempFile = DriveApp.createFile("temp_voucher_" + regId + ".html", voucherHtml, MimeType.HTML);
        pdfAttachment = tempFile.getAs(MimeType.PDF).setName(pdfFilename);
        tempFile.setTrashed(true);
        Logger.log("[PDF ATTACHMENT] Successfully created PDF via DriveApp fallback for " + regId);
      } catch (driveErr) {
        Logger.log("[PDF ERROR] All PDF generation methods failed: " + driveErr.toString());
      }
    }
  }

  const mailOptions = {
    to: details.email,
    subject: subject,
    body: plainBody,
    htmlBody: htmlBody,
    name: "Career Club BTEC"
  };
  if (pdfAttachment) {
    mailOptions.attachments = [pdfAttachment];
    Logger.log("[EMAIL] Attaching PDF voucher: " + pdfAttachment.getName());
  } else {
    Logger.log("[EMAIL WARNING] No PDF attachment could be created for: " + details.email);
  }

  try {
    MailApp.sendEmail(mailOptions);
    Logger.log("[EMAIL SUCCESS] Confirmation email successfully sent via MailApp (with PDF voucher attachment) to: " + details.email);
    return true;
  } catch (mailErr) {
    Logger.log("[EMAIL NOTICE] MailApp notice: " + mailErr.toString() + " - Attempting GmailApp fallback...");
    try {
      const gmailAdvanced = {
        htmlBody: htmlBody,
        name: "Career Club BTEC"
      };
      if (pdfAttachment) {
        gmailAdvanced.attachments = [pdfAttachment];
      }
      GmailApp.sendEmail(details.email, subject, plainBody, gmailAdvanced);
      Logger.log("[EMAIL SUCCESS] Confirmation email successfully sent via GmailApp (with PDF voucher attachment) to: " + details.email);
      return true;
    } catch (gmailErr) {
      Logger.log("[EMAIL FAILURE] Failed to send confirmation email via GmailApp: " + gmailErr.toString());
      return false;
    }
  }
}

function escapeHtml(text) {
  if (!text) return "";
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * 🧪 Test sending a confirmation email to the currently logged in Google user.
 * Select "testConfirmationEmail" in Apps Script toolbar and click ▶ Run.
 */
function testConfirmationEmail() {
  const userEmail = Session.getActiveUser().getEmail();
  if (!userEmail) {
    Logger.log("Could not detect active user email. Please run setup first.");
    return "Error: No user email";
  }

  Logger.log("Sending test confirmation email to: " + userEmail);
  const result = sendRegistrationConfirmationEmail({
    registrationId: "TEX2026-001",
    teamName: "TexGenius",
    leaderName: "Test Group Leader",
    leaderRoll: "12401",
    leaderDept: "Yarn Engineering",
    leaderWhatsApp: "01700000000",
    paymentStatus: "Pending",
    submissionDate: Utilities.formatDate(new Date(), "Asia/Dhaka", "yyyy-MM-dd HH:mm:ss"),
    email: userEmail
  });

  Logger.log("Test email result: " + (result ? "SUCCESS" : "FAILED"));
  return result ? "Test email sent to " + userEmail : "Test email failed";
}

/**
 * Updates an existing registration row in the Google Sheet and updates Drive photos if changed.
 * Calls SpreadsheetApp.flush() to guarantee immediate persistence.
 */
function handleUpdateRegistration(sheet, data) {
  const targetId = String(data.registrationId || data.regId || "").trim().toUpperCase();
  const updatedForm = data.formData || data;

  if (!targetId) {
    return createResponse({
      success: false,
      error: "Missing registration ID for update."
    });
  }

  const rows = sheet.getDataRange().getValues();
  if (!rows || rows.length < 2) {
    return createResponse({
      success: false,
      error: "Sheet is empty or missing headers."
    });
  }

  const leader = updatedForm.leader || {};
  const m1 = updatedForm.member1 || {};
  const m2 = updatedForm.member2 || {};

  let foundRowIndex = -1;
  for (let i = 1; i < rows.length; i++) {
    const cellId = String(rows[i][0] || "").trim().toUpperCase();
    if (cellId === targetId || cellId.replace(/[^A-Z0-9]/g, "") === targetId.replace(/[^A-Z0-9]/g, "")) {
      foundRowIndex = i + 1; // 1-based row index in Sheet
      break;
    }
  }

  // Secondary fallback: match by student roll or transaction ID if ID had minor format mismatch
  if (foundRowIndex <= 0) {
    const leaderRoll = String(leader.roll || "").trim().toUpperCase();
    const trxId = String(updatedForm.payment?.transactionId || "").trim().toUpperCase();
    for (let i = 1; i < rows.length; i++) {
      const rL = String(rows[i][5] || "").trim().toUpperCase();
      const rT = String(rows[i][24] || "").trim().toUpperCase();
      if ((leaderRoll && rL === leaderRoll) || (trxId && rT === trxId)) {
        foundRowIndex = i + 1;
        break;
      }
    }
  }

  if (foundRowIndex <= 0) {
    return createResponse({
      success: false,
      error: "Registration ID " + targetId + " not found in sheet."
    });
  }

  const headers = rows[0].map(h => String(h || "").trim().toLowerCase());
  const findCol = (pattern) => {
    const idx = headers.findIndex(h => pattern.test(h));
    return idx >= 0 ? idx + 1 : -1;
  };

  const colTeam = findCol(/team/i) > 0 ? findCol(/team/i) : 4;
  const colLeaderName = findCol(/leader.*name/i) > 0 ? findCol(/leader.*name/i) : 5;
  const colLeaderRoll = findCol(/leader.*roll/i) > 0 ? findCol(/leader.*roll/i) : 6;
  const colLeaderDept = findCol(/leader.*dep/i) > 0 ? findCol(/leader.*dep/i) : 7;
  const colLeaderMobile = findCol(/leader.*(mob|what|pho)/i) > 0 ? findCol(/leader.*(mob|what|pho)/i) : 8;
  const colLeaderFb = findCol(/leader.*(face|fb)/i) > 0 ? findCol(/leader.*(face|fb)/i) : 9;
  const colLeaderEmail = findCol(/leader.*email|email/i) > 0 ? findCol(/leader.*email|email/i) : 10;
  const colLeaderPhoto = findCol(/leader.*photo/i) > 0 ? findCol(/leader.*photo/i) : 11;

  const colM1Name = findCol(/member\s*1.*name/i) > 0 ? findCol(/member\s*1.*name/i) : 12;
  const colM1Roll = findCol(/member\s*1.*roll/i) > 0 ? findCol(/member\s*1.*roll/i) : 13;
  const colM1Dept = findCol(/member\s*1.*dep/i) > 0 ? findCol(/member\s*1.*dep/i) : 14;
  const colM1Mobile = findCol(/member\s*1.*(mob|what|pho)/i) > 0 ? findCol(/member\s*1.*(mob|what|pho)/i) : 15;
  const colM1Fb = findCol(/member\s*1.*(face|fb)/i) > 0 ? findCol(/member\s*1.*(face|fb)/i) : 16;
  const colM1Photo = findCol(/member\s*1.*photo/i) > 0 ? findCol(/member\s*1.*photo/i) : 17;

  const colM2Name = findCol(/member\s*2.*name/i) > 0 ? findCol(/member\s*2.*name/i) : 18;
  const colM2Roll = findCol(/member\s*2.*roll/i) > 0 ? findCol(/member\s*2.*roll/i) : 19;
  const colM2Dept = findCol(/member\s*2.*dep/i) > 0 ? findCol(/member\s*2.*dep/i) : 20;
  const colM2Mobile = findCol(/member\s*2.*(mob|what|pho)/i) > 0 ? findCol(/member\s*2.*(mob|what|pho)/i) : 21;
  const colM2Fb = findCol(/member\s*2.*(face|fb)/i) > 0 ? findCol(/member\s*2.*(face|fb)/i) : 22;
  const colM2Photo = findCol(/member\s*2.*photo/i) > 0 ? findCol(/member\s*2.*photo/i) : 23;

  // Handle photos if new base64 image data is provided
  let folder = null;
  try {
    folder = getOrCreateDriveFolder();
  } catch (fErr) {
    Logger.log("[PHOTO WARN] Drive folder issue: " + fErr.message);
  }

  let leaderPhotoUrl = "";
  let m1PhotoUrl = "";
  let m2PhotoUrl = "";

  if (folder) {
    if (leader.photoBase64 || (leader.photoPreview && String(leader.photoPreview).startsWith("data:"))) {
      leaderPhotoUrl = saveBase64ImageToDrive(folder, leader.photoBase64 || leader.photoPreview, targetId, "leader", leader.name || "Leader");
    }
    if (m1.photoBase64 || (m1.photoPreview && String(m1.photoPreview).startsWith("data:"))) {
      m1PhotoUrl = saveBase64ImageToDrive(folder, m1.photoBase64 || m1.photoPreview, targetId, "member1", m1.name || "Member1");
    }
    if (m2.photoBase64 || (m2.photoPreview && String(m2.photoPreview).startsWith("data:"))) {
      m2PhotoUrl = saveBase64ImageToDrive(folder, m2.photoBase64 || m2.photoPreview, targetId, "member2", m2.name || "Member2");
    }
  }

  // 1. Team Name
  if (updatedForm.teamName) {
    sheet.getRange(foundRowIndex, colTeam).setValue(String(updatedForm.teamName).trim());
  }

  // 2. Leader
  if (leader.name) sheet.getRange(foundRowIndex, colLeaderName).setValue(String(leader.name).trim());
  if (leader.roll) {
    const c = sheet.getRange(foundRowIndex, colLeaderRoll);
    c.setNumberFormat("@");
    c.setValue(String(leader.roll).trim());
  }
  if (leader.department) sheet.getRange(foundRowIndex, colLeaderDept).setValue(String(leader.department).trim());
  if (leader.whatsapp || leader.mobile) {
    const c = sheet.getRange(foundRowIndex, colLeaderMobile);
    c.setNumberFormat("@");
    c.setValue(String(leader.whatsapp || leader.mobile).trim());
  }
  if (leader.facebook !== undefined) sheet.getRange(foundRowIndex, colLeaderFb).setValue(String(leader.facebook || "").trim());
  if (leader.email !== undefined) sheet.getRange(foundRowIndex, colLeaderEmail).setValue(String(leader.email || "").trim());
  if (leaderPhotoUrl) sheet.getRange(foundRowIndex, colLeaderPhoto).setValue(leaderPhotoUrl);

  // 3. Member 1
  if (m1.name) sheet.getRange(foundRowIndex, colM1Name).setValue(String(m1.name).trim());
  if (m1.roll) {
    const c = sheet.getRange(foundRowIndex, colM1Roll);
    c.setNumberFormat("@");
    c.setValue(String(m1.roll).trim());
  }
  if (m1.department) sheet.getRange(foundRowIndex, colM1Dept).setValue(String(m1.department).trim());
  if (m1.whatsapp !== undefined || m1.mobile !== undefined) {
    const c = sheet.getRange(foundRowIndex, colM1Mobile);
    c.setNumberFormat("@");
    c.setValue(String(m1.whatsapp || m1.mobile || "").trim());
  }
  if (m1.facebook !== undefined) sheet.getRange(foundRowIndex, colM1Fb).setValue(String(m1.facebook || "").trim());
  if (m1PhotoUrl) sheet.getRange(foundRowIndex, colM1Photo).setValue(m1PhotoUrl);

  // 4. Member 2
  if (m2.name) sheet.getRange(foundRowIndex, colM2Name).setValue(String(m2.name).trim());
  if (m2.roll) {
    const c = sheet.getRange(foundRowIndex, colM2Roll);
    c.setNumberFormat("@");
    c.setValue(String(m2.roll).trim());
  }
  if (m2.department) sheet.getRange(foundRowIndex, colM2Dept).setValue(String(m2.department).trim());
  if (m2.whatsapp !== undefined || m2.mobile !== undefined) {
    const c = sheet.getRange(foundRowIndex, colM2Mobile);
    c.setNumberFormat("@");
    c.setValue(String(m2.whatsapp || m2.mobile || "").trim());
  }
  if (m2.facebook !== undefined) sheet.getRange(foundRowIndex, colM2Fb).setValue(String(m2.facebook || "").trim());
  if (m2PhotoUrl) sheet.getRange(foundRowIndex, colM2Photo).setValue(m2PhotoUrl);

  SpreadsheetApp.flush(); // Force write to Google Sheets immediately

  return createResponse({
    success: true,
    message: "Registration updated successfully in Google Sheet for " + targetId,
    registrationId: targetId,
    teamName: String(updatedForm.teamName || "").trim(),
    rowIndex: foundRowIndex
  });
}
