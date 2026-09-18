/**
 * Google Apps Script for Textile Presentation Competition 2026
 * Organized by Career Club BTEC, Barishal Textile Engineering College
 *
 * ============================================================================
 * CRITICAL SETUP STEPS (Prevents "Unable to open the file at present" error):
 * ============================================================================
 * 1. Open Google Sheets (create a blank sheet: "Textile Presentation Competition 2026 Registrations")
 * 2. In Google Sheets menu, click: Extensions > Apps Script
 * 3. Delete any default code in Code.gs and paste THIS ENTIRE FILE
 * 4. Click Save (Ctrl+S or the Floppy Disk icon)
 * 5. In the toolbar at the top, select "setup" from the function dropdown and click "▶ Run"
 * 6. Google will ask for permission:
 *    - Click "Review permissions"
 *    - Select your Google account
 *    - Click "Advanced" (small text at bottom)
 *    - Click "Go to ... (unsafe)"
 *    - Click "Allow"
 * 7. Click: Deploy > New deployment (or Manage Deployments > Edit > New Version)
 *    - Type: "Web app"
 *    - Description: "Competition Registration API v2"
 *    - Execute as: "Me" (your email)
 *    - Who has access: "Anyone"  <-- CRITICAL! Must be "Anyone", NOT "Only myself"
 * 8. Click "Deploy" and copy the Web App URL (ends in /exec)
 * ============================================================================
 */

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
 * This grants permissions to SpreadsheetApp and DriveApp and sets up your sheet!
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
  return ContentService.createTextOutput(JSON.stringify({
    status: "ok",
    message: "Textile Presentation Competition 2026 Registration API is running.",
    timestamp: new Date().toISOString()
  })).setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    // Wait up to 30 seconds for lock to avoid race conditions in ID generation
    lock.waitLock(30000);

    let data;
    if (e.postData && e.postData.contents) {
      data = JSON.parse(e.postData.contents);
    } else if (e.parameter) {
      data = e.parameter;
    } else {
      throw new Error("No data payload received.");
    }

    const ss = getSpreadsheet();
    const sheet = getOrCreateSheet(ss);

    // Duplicate prevention check
    const existingValues = sheet.getDataRange().getValues();
    const leaderRoll = String(data.leader?.roll || "").trim();
    const member1Roll = String(data.member1?.roll || "").trim();
    const member2Roll = String(data.member2?.roll || "").trim();
    const transactionId = String(data.payment?.transactionId || "").trim().toUpperCase();

    for (let i = 1; i < existingValues.length; i++) {
      const row = existingValues[i];
      const rowLeaderRoll = String(row[4]).trim();
      const rowM1Roll = String(row[10]).trim();
      const rowM2Roll = String(row[16]).trim();
      const rowTrxId = String(row[22]).trim().toUpperCase();

      if (rowTrxId && transactionId && rowTrxId === transactionId) {
        return createResponse({
          status: "error",
          message: "Duplicate Transaction ID detected. This transaction has already been registered."
        });
      }

      const incomingRolls = [leaderRoll, member1Roll, member2Roll].filter(Boolean);
      const rowRolls = [rowLeaderRoll, rowM1Roll, rowM2Roll].filter(Boolean);

      for (let r of incomingRolls) {
        if (rowRolls.includes(r)) {
          return createResponse({
            status: "error",
            message: "Student Roll " + r + " is already registered in team " + row[0] + "."
          });
        }
      }
    }

    // Prepare Google Drive folder for participant photos
    let leaderPhotoUrl = data.leader?.photoUrl || "";
    let member1PhotoUrl = data.member1?.photoUrl || "";
    let member2PhotoUrl = data.member2?.photoUrl || "";

    try {
      const driveFolder = getOrCreateDriveFolder(DRIVE_FOLDER_NAME);
      if (data.leader?.photoBase64) {
        leaderPhotoUrl = saveBase64Image(driveFolder, data.leader.photoBase64, "Leader_" + leaderRoll);
      }
      if (data.member1?.photoBase64) {
        member1PhotoUrl = saveBase64Image(driveFolder, data.member1.photoBase64, "Member1_" + member1Roll);
      }
      if (data.member2?.photoBase64) {
        member2PhotoUrl = saveBase64Image(driveFolder, data.member2.photoBase64, "Member2_" + member2Roll);
      }
    } catch (driveErr) {
      Logger.log("Google Drive photo upload failure: " + driveErr.toString());
      return createResponse({
        success: false,
        status: "error",
        error: "Photo upload failed",
        details: driveErr.toString()
      });
    }

    // Generate unique Registration ID: TEX2026-001, TEX2026-002, etc.
    const lastRow = sheet.getLastRow();
    const regSequence = Math.max(1, lastRow);
    const regId = "TEX2026-" + ("000" + regSequence).slice(-3);

    // Format local Bangladesh Time
    const now = new Date();
    const submissionDate = Utilities.formatDate(now, "Asia/Dhaka", "yyyy-MM-dd HH:mm:ss");

    // Append row to sheet
    sheet.appendRow([
      regId,
      submissionDate,
      "Pending",
      data.leader?.name || "",
      leaderRoll,
      data.leader?.department || "",
      data.leader?.whatsapp || "",
      data.leader?.facebook || "",
      leaderPhotoUrl,
      data.member1?.name || "",
      member1Roll,
      data.member1?.department || "",
      data.member1?.whatsapp || "",
      data.member1?.facebook || "",
      member1PhotoUrl,
      data.member2?.name || "",
      member2Roll,
      data.member2?.department || "",
      data.member2?.whatsapp || "",
      data.member2?.facebook || "",
      member2PhotoUrl,
      data.payment?.bkashNumber || "",
      transactionId
    ]);

    return createResponse({
      success: true,
      status: "success",
      registrationId: regId,
      submissionDate: submissionDate,
      paymentStatus: "Pending",
      message: "Registration submitted successfully",
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
    lock.releaseLock();
  }
}

function getSpreadsheet() {
  // 1. If script was opened from Google Sheet (Extensions > Apps Script)
  try {
    const active = SpreadsheetApp.getActiveSpreadsheet();
    if (active) return active;
  } catch (e) {}

  // 2. If standalone script, locate or create a sheet in Google Drive
  try {
    const files = DriveApp.getFilesByName("Textile Presentation 2026 - Registrations");
    if (files.hasNext()) {
      return SpreadsheetApp.open(files.next());
    }
    return SpreadsheetApp.create("Textile Presentation 2026 - Registrations");
  } catch (e) {
    throw new Error("Could not access Google Spreadsheet: " + e.toString());
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
  const folders = DriveApp.getFoldersByName(folderName);
  if (folders.hasNext()) {
    return folders.next();
  }
  return DriveApp.createFolder(folderName);
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
