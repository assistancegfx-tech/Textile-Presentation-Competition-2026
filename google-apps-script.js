/**
 * Google Apps Script for Textile Presentation Competition 2026
 * Organized by Career Club BTEC, Barishal Textile Engineering College
 *
 * ============================================================================
 * SETUP INSTRUCTIONS:
 * ============================================================================
 * 1. Open your Google Sheet (or create a new one: "Textile Presentation Competition 2026 Registrations")
 * 2. In Google Sheets menu, click: Extensions > Apps Script
 * 3. Replace all existing code in Code.gs with THIS ENTIRE FILE
 * 4. (Optional) If running as standalone script, paste your Sheet ID in SPREADSHEET_ID below
 * 5. Click Save (Ctrl+S)
 * 6. Select "setup" from the function dropdown at top and click "▶ Run"
 *    - Click "Review permissions" -> Choose your Google Account -> "Advanced" -> "Go to ... (unsafe)" -> "Allow"
 * 7. Click "Deploy" > "New deployment"
 *    - Select type: "Web app"
 *    - Description: "Competition Registration API"
 *    - Execute as: "Me" (your Google account)
 *    - Who has access: "Anyone"  <-- CRITICAL! Must be "Anyone" so public form can save
 * 8. Click "Deploy", copy the Web App URL (ends in /exec)
 * 9. Add the URL as GOOGLE_SCRIPT_URL in your Vercel Environment Variables or Settings!
 * ============================================================================
 */

// Optional: Paste your Google Sheet ID or URL here if you created a standalone script at script.google.com
// Leave empty if you opened this script from inside Google Sheets (Extensions > Apps Script)
const SPREADSHEET_ID = ""; 

const SHEET_NAME = "Registrations";
const DRIVE_FOLDER_NAME = "Textile Presentation 2026 - Participant Photos";

const HEADERS = [
  "Registration ID",
  "Submission Date & Time",
  "Payment Status",
  "Group Leader Name",
  "Group Leader Roll",
  "Group Leader Department",
  "Group Leader WhatsApp",
  "Group Leader Facebook",
  "Group Leader Photo URL",
  "Member 1 Name",
  "Member 1 Roll",
  "Member 1 Department",
  "Member 1 WhatsApp",
  "Member 1 Facebook",
  "Member 1 Photo URL",
  "Member 2 Name",
  "Member 2 Roll",
  "Member 2 Department",
  "Member 2 WhatsApp",
  "Member 2 Facebook",
  "Member 2 Photo URL",
  "bKash Number",
  "Transaction ID"
];

/**
 * ⚡ RUN THIS FUNCTION ONCE IN APPS SCRIPT EDITOR (CLICK ▶ Run)
 * This grants permissions to SpreadsheetApp and DriveApp and sets up the sheet & folder!
 */
function setup() {
  const ss = getSpreadsheet();
  const sheet = getOrCreateSheet(ss);
  const folder = getOrCreateDriveFolder(DRIVE_FOLDER_NAME);
  Logger.log("==================================================");
  Logger.log("✅ SUCCESS! Google Sheet linked: " + ss.getName());
  Logger.log("   Sheet URL: " + ss.getUrl());
  Logger.log("✅ SUCCESS! Drive Folder created: " + folder.getName());
  Logger.log("   Drive Folder URL: " + folder.getUrl());
  Logger.log("🎉 Authorization complete! Your Web App is ready to receive submissions.");
  Logger.log("==================================================");
  return "Ready";
}

function doGet(e) {
  try {
    const params = e && e.parameter ? e.parameter : {};
    const action = params.action || (params.regId ? "get" : "health");
    const regId = String(params.regId || params.registrationId || "").trim().toUpperCase();

    if (action === "get" || action === "status") {
      if (!regId) {
        return createResponse({
          success: false,
          error: "Missing registration ID (regId parameter required)"
        });
      }

      const ss = getSpreadsheet();
      const sheet = getOrCreateSheet(ss);
      const data = sheet.getDataRange().getValues();

      if (data && data.length > 1) {
        for (let i = 1; i < data.length; i++) {
          const row = data[i];
          const rowId = String(row[0] || "").trim().toUpperCase();
          if (rowId === regId) {
            return createResponse({
              success: true,
              found: true,
              registrationId: row[0],
              submissionDate: row[1],
              paymentStatus: row[2] || "Pending",
              leaderName: row[3],
              leaderRoll: row[4],
              leaderDepartment: row[5],
              leaderWhatsApp: row[6],
              leaderFacebook: row[7],
              leaderPhotoUrl: row[8],
              member1Name: row[9],
              member1Roll: row[10],
              member1Department: row[11],
              member1WhatsApp: row[12],
              member1Facebook: row[13],
              member1PhotoUrl: row[14],
              member2Name: row[15],
              member2Roll: row[16],
              member2Department: row[17],
              member2WhatsApp: row[18],
              member2Facebook: row[19],
              member2PhotoUrl: row[20],
              bkashNumber: row[21],
              transactionId: row[22]
            });
          }
        }
      }

      return createResponse({
        success: false,
        found: false,
        error: "No registration found in Google Sheet for " + regId
      });
    }

    // List all registrations (lightweight summary)
    if (action === "list") {
      const ss = getSpreadsheet();
      const sheet = getOrCreateSheet(ss);
      const data = sheet.getDataRange().getValues();
      const list = [];
      if (data && data.length > 1) {
        for (let i = 1; i < data.length; i++) {
          const row = data[i];
          list.push({
            registrationId: row[0],
            submissionDate: row[1],
            paymentStatus: row[2] || "Pending",
            leaderName: row[3],
            leaderRoll: row[4],
            transactionId: row[22]
          });
        }
      }
      return createResponse({
        success: true,
        total: list.length,
        registrations: list
      });
    }

    // Default health response
    return createResponse({
      status: "ok",
      success: true,
      message: "Textile Presentation Competition 2026 Registration API is running.",
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    return createResponse({
      success: false,
      error: "doGet error: " + err.toString()
    });
  }
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  let lockAcquired = false;
  try {
    try {
      lockAcquired = lock.tryLock(20000);
    } catch (lockErr) {
      Logger.log("Lock acquisition warning: " + lockErr.toString());
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
    const sheet = getOrCreateSheet(ss);

    // Handle updateStatus action
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
          foundIndex = i + 1; // 1-indexed for getRange
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

    // Duplicate prevention check
    const existingValues = sheet.getDataRange().getValues();
    const leaderRoll = String(data.leader?.roll || data["leader[roll]"] || "").trim();
    const m1Roll = String(data.member1?.roll || data["member1[roll]"] || "").trim();
    const m2Roll = String(data.member2?.roll || data["member2[roll]"] || "").trim();
    const member1Roll = m1Roll;
    const member2Roll = m2Roll;
    const transactionId = String(data.payment?.transactionId || data["payment[transactionId]"] || "").trim().toUpperCase();

    if (existingValues && existingValues.length > 1) {
      for (let i = 1; i < existingValues.length; i++) {
        const row = existingValues[i];
        const rowLeaderRoll = String(row[4] || "").trim();
        const rowM1Roll = String(row[10] || "").trim();
        const rowM2Roll = String(row[16] || "").trim();
        const rowTrxId = String(row[22] || "").trim().toUpperCase();

        if (rowTrxId && transactionId && rowTrxId === transactionId) {
          return createResponse({
            success: false,
            status: "error",
            error: "Duplicate Transaction ID detected. This transaction has already been registered."
          });
        }

        const incomingRolls = [leaderRoll, m1Roll, m2Roll].filter(Boolean);
        const rowRolls = [rowLeaderRoll, rowM1Roll, rowM2Roll].filter(Boolean);

        for (let r of incomingRolls) {
          if (rowRolls.includes(r)) {
            return createResponse({
              success: false,
              status: "error",
              error: "Student Roll " + r + " is already registered in team " + row[0] + "."
            });
          }
        }
      }
    }

    // Prepare Google Drive folder for participant photos
    let leaderPhotoUrl = data.leader?.photoUrl || "";
    let m1PhotoUrl = data.member1?.photoUrl || "";
    let m2PhotoUrl = data.member2?.photoUrl || "";
    let member1PhotoUrl = m1PhotoUrl;
    let member2PhotoUrl = m2PhotoUrl;

    try {
      const driveFolder = getOrCreateDriveFolder(DRIVE_FOLDER_NAME);
      if (data.leader?.photoBase64) {
        leaderPhotoUrl = saveBase64Image(driveFolder, data.leader.photoBase64, "Leader_" + (leaderRoll || "photo"));
      }
      if (data.member1?.photoBase64) {
        m1PhotoUrl = saveBase64Image(driveFolder, data.member1.photoBase64, "Member1_" + (m1Roll || "photo"));
        member1PhotoUrl = m1PhotoUrl;
      }
      if (data.member2?.photoBase64) {
        m2PhotoUrl = saveBase64Image(driveFolder, data.member2.photoBase64, "Member2_" + (m2Roll || "photo"));
        member2PhotoUrl = m2PhotoUrl;
      }
    } catch (driveErr) {
      Logger.log("Google Drive photo notice: " + driveErr.toString());
      // Non-blocking: We still save the registration row in Google Sheets even if Drive throws a permission notice
      if (!leaderPhotoUrl && data.leader?.photoBase64) leaderPhotoUrl = "Uploaded (Saved in form)";
      if (!m1PhotoUrl && data.member1?.photoBase64) {
        m1PhotoUrl = "Uploaded (Saved in form)";
        member1PhotoUrl = m1PhotoUrl;
      }
      if (!m2PhotoUrl && data.member2?.photoBase64) {
        m2PhotoUrl = "Uploaded (Saved in form)";
        member2PhotoUrl = m2PhotoUrl;
      }
    }

    // Generate unique Registration ID: TEX2026-001, TEX2026-002, etc.
    const lastRow = sheet.getLastRow();
    const regSequence = Math.max(1, lastRow);
    const regId = "TEX2026-" + ("000" + regSequence).slice(-3);

    // Format local Bangladesh Time
    const now = new Date();
    const submissionDate = Utilities.formatDate(now, "Asia/Dhaka", "yyyy-MM-dd HH:mm:ss");

    const leaderName = data.leader?.name || data["leader[name]"] || "";
    const leaderDept = data.leader?.department || data["leader[department]"] || "";
    const leaderWhatsApp = data.leader?.whatsapp || data["leader[whatsapp]"] || "";
    const leaderFacebook = data.leader?.facebook || data["leader[facebook]"] || "";

    const m1Name = data.member1?.name || data["member1[name]"] || "";
    const m1Dept = data.member1?.department || data["member1[department]"] || "";
    const m1WhatsApp = data.member1?.whatsapp || data["member1[whatsapp]"] || "";
    const m1Facebook = data.member1?.facebook || data["member1[facebook]"] || "";

    const m2Name = data.member2?.name || data["member2[name]"] || "";
    const m2Dept = data.member2?.department || data["member2[department]"] || "";
    const m2WhatsApp = data.member2?.whatsapp || data["member2[whatsapp]"] || "";
    const m2Facebook = data.member2?.facebook || data["member2[facebook]"] || "";

    const bkashNum = data.payment?.bkashNumber || data["payment[bkashNumber]"] || "";

    // Append row to sheet
    sheet.appendRow([
      regId,
      submissionDate,
      "Pending",
      leaderName,
      leaderRoll,
      leaderDept,
      leaderWhatsApp,
      leaderFacebook,
      leaderPhotoUrl,
      m1Name,
      m1Roll,
      m1Dept,
      m1WhatsApp,
      m1Facebook,
      m1PhotoUrl,
      m2Name,
      m2Roll,
      m2Dept,
      m2WhatsApp,
      m2Facebook,
      m2PhotoUrl,
      bkashNum,
      transactionId
    ]);

    return createResponse({
      success: true,
      status: "success",
      registrationId: regId,
      submissionDate: submissionDate,
      paymentStatus: "Pending",
      message: "Registration saved to Google Sheets and Drive successfully",
      photos: {
        leader: leaderPhotoUrl,
        member1: member1PhotoUrl,
        member2: member2PhotoUrl
      }
    });

  } catch (err) {
    Logger.log("Error in doPost: " + err.toString());
    return createResponse({
      success: false,
      status: "error",
      error: "Unable to submit registration",
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
  // 1. If SPREADSHEET_ID is provided
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

  // 2. If opened from within a Google Sheet (Container-bound script)
  try {
    const active = SpreadsheetApp.getActiveSpreadsheet();
    if (active) return active;
  } catch (e) {}

  // 3. Search Drive for existing sheet by name
  try {
    const files = DriveApp.getFilesByName("Textile Presentation Competition 2026 Registrations");
    if (files.hasNext()) {
      return SpreadsheetApp.open(files.next());
    }
    const oldFiles = DriveApp.getFilesByName("Textile Presentation 2026 - Registrations");
    if (oldFiles.hasNext()) {
      return SpreadsheetApp.open(oldFiles.next());
    }
  } catch (driveSearchErr) {
    Logger.log("Drive search error: " + driveSearchErr.toString());
  }

  // 4. Auto-create spreadsheet in Drive if none exists
  try {
    const newSs = SpreadsheetApp.create("Textile Presentation Competition 2026 Registrations");
    return newSs;
  } catch (createErr) {
    throw new Error("Could not access or create Google Spreadsheet. Please run 'setup' in Apps Script to authorize permissions: " + createErr.toString());
  }
}

function getOrCreateSheet(ss) {
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
  }

  // Initialize headers if sheet is empty
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    const headerRange = sheet.getRange(1, 1, 1, HEADERS.length);
    headerRange.setFontWeight("bold");
    headerRange.setBackground("#0A192F");
    headerRange.setFontColor("#FFFFFF");
    sheet.setFrozenRows(1);
  }

  return sheet;
}

function getOrCreateDriveFolder(folderName) {
  try {
    const folders = DriveApp.getFoldersByName(folderName);
    if (folders.hasNext()) {
      return folders.next();
    }
    return DriveApp.createFolder(folderName);
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
