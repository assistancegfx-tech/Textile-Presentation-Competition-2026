import React, { useState, useEffect } from 'react';
import { X, Copy, Check, Database, FileSpreadsheet, CheckCircle2, AlertCircle, RefreshCw, AlertTriangle, ShieldCheck, ExternalLink, LogOut, CheckCircle } from 'lucide-react';
import { User } from 'firebase/auth';
import { googleSignIn, initAuth, logout, getAccessToken } from '../services/googleAuth';
import { findOrCreateSpreadsheet, SpreadsheetInfo } from '../services/sheetsService';
import { GoogleSignInButton } from './GoogleSignInButton';

interface GoogleSheetsModalProps {
  isOpen: boolean;
  onClose: () => void;
  scriptUrl: string;
  onSaveScriptUrl: (url: string) => void;
  isEnvConfigured: boolean;
}

export const GoogleSheetsModal: React.FC<GoogleSheetsModalProps> = ({
  isOpen,
  onClose,
  scriptUrl,
  onSaveScriptUrl,
  isEnvConfigured
}) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [activeSpreadsheet, setActiveSpreadsheet] = useState<SpreadsheetInfo | null>(() => {
    const id = localStorage.getItem('tpc2026_active_spreadsheet_id');
    const url = localStorage.getItem('tpc2026_active_spreadsheet_url');
    if (id && url) {
      return { id, name: 'Textile Presentation Competition 2026 - Registrations', url };
    }
    return null;
  });
  const [isInitializingSheet, setIsInitializingSheet] = useState(false);
  const [sheetSuccessMessage, setSheetSuccessMessage] = useState<string | null>(null);

  const [inputUrl, setInputUrl] = useState(scriptUrl);
  const [copiedCode, setCopiedCode] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [activeTab, setActiveTab] = useState<'oauth' | 'script'>('oauth');

  useEffect(() => {
    const unsubscribe = initAuth(
      (user) => {
        setCurrentUser(user);
      },
      () => {
        setCurrentUser(null);
      }
    );
    return () => unsubscribe();
  }, []);

  if (!isOpen) return null;

  const handleGoogleLogin = async () => {
    setIsLoggingIn(true);
    try {
      const res = await googleSignIn();
      if (res?.user) {
        setCurrentUser(res.user);
        // Automatically find or create spreadsheet
        setIsInitializingSheet(true);
        try {
          const sheetInfo = await findOrCreateSpreadsheet(res.accessToken);
          setActiveSpreadsheet(sheetInfo);
          localStorage.setItem('tpc2026_active_spreadsheet_id', sheetInfo.id);
          localStorage.setItem('tpc2026_active_spreadsheet_url', sheetInfo.url);
          setSheetSuccessMessage('Spreadsheet linked successfully! New submissions will automatically sync to your Google Sheet.');
        } catch (e: any) {
          console.error('Failed to init sheet:', e);
        } finally {
          setIsInitializingSheet(false);
        }
      }
    } catch (err: any) {
      console.error('Login error:', err);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleSyncSpreadsheet = async () => {
    setIsInitializingSheet(true);
    setSheetSuccessMessage(null);
    try {
      const token = await getAccessToken();
      if (!token) {
        await handleGoogleLogin();
        return;
      }
      const sheetInfo = await findOrCreateSpreadsheet(token);
      setActiveSpreadsheet(sheetInfo);
      localStorage.setItem('tpc2026_active_spreadsheet_id', sheetInfo.id);
      localStorage.setItem('tpc2026_active_spreadsheet_url', sheetInfo.url);
      setSheetSuccessMessage('Spreadsheet linked successfully to Google Drive & Sheets!');
    } catch (err: any) {
      console.error('Failed to sync sheet:', err);
    } finally {
      setIsInitializingSheet(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    setCurrentUser(null);
  };

  const scriptCode = `/**
 * Google Apps Script for Textile Presentation Competition 2026
 * Organized by Career Club BTEC, Barishal Textile Engineering College
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

function setup() {
  const ss = getSpreadsheet();
  const sheet = getOrCreateSheet(ss);
  const folder = getOrCreateDriveFolder(DRIVE_FOLDER_NAME);
  Logger.log("✅ Google Sheet linked: " + ss.getName());
  Logger.log("🎉 Authorization complete! Your Web App is ready.");
  return "Ready";
}

function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({
    status: "ok",
    message: "Textile Presentation Competition 2026 Registration API is active.",
    timestamp: new Date().toISOString()
  })).setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(30000);
    const data = JSON.parse(e.postData ? e.postData.contents : "{}");
    const ss = getSpreadsheet();
    const sheet = getOrCreateSheet(ss);

    const leaderRoll = String(data.leader?.roll || "").trim();
    const member1Roll = String(data.member1?.roll || "").trim();
    const member2Roll = String(data.member2?.roll || "").trim();
    const transactionId = String(data.payment?.transactionId || "").trim().toUpperCase();

    const lastRow = sheet.getLastRow();
    const regId = "TEX2026-" + ("000" + Math.max(1, lastRow)).slice(-3);
    const submissionDate = Utilities.formatDate(new Date(), "Asia/Dhaka", "yyyy-MM-dd HH:mm:ss");

    sheet.appendRow([
      regId, submissionDate, "Pending",
      data.leader?.name || "", leaderRoll, data.leader?.department || "", data.leader?.whatsapp || "", data.leader?.facebook || "", "",
      data.member1?.name || "", member1Roll, data.member1?.department || "", data.member1?.whatsapp || "", data.member1?.facebook || "", "",
      data.member2?.name || "", member2Roll, data.member2?.department || "", data.member2?.whatsapp || "", data.member2?.facebook || "", "",
      data.payment?.bkashNumber || "", transactionId
    ]);

    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      registrationId: regId,
      submissionDate: submissionDate,
      paymentStatus: "Pending"
    })).setMimeType(ContentService.MimeType.JSON);
  } catch(err) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: err.toString() })).setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

function getSpreadsheet() {
  try {
    const active = SpreadsheetApp.getActiveSpreadsheet();
    if (active) return active;
  } catch(e) {}
  try {
    const files = DriveApp.getFilesByName("Textile Presentation 2026 - Registrations");
    if (files.hasNext()) return SpreadsheetApp.open(files.next());
    return SpreadsheetApp.create("Textile Presentation 2026 - Registrations");
  } catch(e) {
    throw new Error(e.toString());
  }
}

function getOrCreateSheet(ss) {
  let sheet = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight("bold").setBackground("#0A192F").setFontColor("#FFFFFF");
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function getOrCreateDriveFolder(name) {
  const folders = DriveApp.getFoldersByName(name);
  return folders.hasNext() ? folders.next() : DriveApp.createFolder(name);
}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(scriptCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleSave = () => {
    onSaveScriptUrl(inputUrl.trim());
    setTestResult(null);
  };

  const handleTestConnection = async () => {
    const url = inputUrl.trim() || scriptUrl;
    if (!url) {
      setTestResult({ success: false, message: 'Please enter a Google Apps Script Web App URL first.' });
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    try {
      const res = await fetch('/api/test-google-script', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scriptUrl: url })
      });
      const rawText = await res.text();
      let data: any = {};
      try {
        data = JSON.parse(rawText);
      } catch {
        console.error('Non-JSON response from test-google-script:', rawText);
        setTestResult({
          success: false,
          message: `Server returned non-JSON response (${res.status}). Check script deployment.`
        });
        return;
      }

      if (data.success) {
        setTestResult({
          success: true,
          message: data.message || 'Connected successfully! Google Apps Script is active and responsive.'
        });
      } else {
        setTestResult({
          success: false,
          message: data.error || 'Connection failed. Please check script authorization and deployment.'
        });
      }
    } catch (err: any) {
      setTestResult({
        success: false,
        message: 'Could not reach endpoint. Please verify server connection and try again.'
      });
    } finally {
      setIsTesting(false);
    }
  };

  const isConnected = Boolean(activeSpreadsheet || scriptUrl || isEnvConfigured);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0A192F]/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-slate-200 flex items-center justify-between bg-[#FAFBF9]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#22C55E]/15 text-[#15803D] flex items-center justify-center">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#0A192F]">Google Sheets Integration</h3>
              <p className="text-xs text-slate-500">
                Official registration database and spreadsheet synchronization for Career Club BTEC
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-200 bg-slate-50/50 px-6 pt-3 gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('oauth')}
            className={`pb-3 px-4 text-xs font-bold border-b-2 transition flex items-center gap-2 ${
              activeTab === 'oauth'
                ? 'border-[#15803D] text-[#15803D]'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Google Account Sign-In (Recommended)</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('script')}
            className={`pb-3 px-4 text-xs font-bold border-b-2 transition flex items-center gap-2 ${
              activeTab === 'script'
                ? 'border-[#15803D] text-[#15803D]'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Apps Script Webhook URL</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 text-xs text-slate-600">
          {/* Status banner */}
          <div className={`p-4 rounded-2xl border flex items-start gap-3 ${
            isConnected
              ? 'bg-[#22C55E]/10 border-[#22C55E]/30 text-[#15803D]'
              : 'bg-amber-50 border-amber-200 text-amber-900'
          }`}>
            <FileSpreadsheet className="w-5 h-5 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-bold text-sm">
                {isConnected ? '✓ Google Sheets Connected' : 'Google Sheets Not Connected'}
              </p>
              <p className="leading-relaxed text-xs">
                {activeSpreadsheet
                  ? `Active Spreadsheet: "${activeSpreadsheet.name}". All new team registrations will append to this Google Sheet in real time.`
                  : isConnected
                  ? 'Configured via Google Apps Script. Form entries will relay directly into your Google Sheet.'
                  : 'Connect your Google account below or enter an Apps Script URL to save all submissions in Google Sheets.'}
              </p>
            </div>
          </div>

          {activeTab === 'oauth' && (
            <div className="space-y-5">
              {/* Account Card */}
              <div className="p-5 rounded-2xl border border-slate-200 bg-[#FAFBF9] space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h4 className="font-bold text-sm text-[#0A192F]">Google Workspace Account</h4>
                    <p className="text-xs text-slate-500">
                      Sign in with your Google account to grant access to Google Sheets & Drive.
                    </p>
                  </div>

                  {currentUser ? (
                    <div className="flex items-center gap-3">
                      <div className="text-right hidden sm:block">
                        <p className="font-bold text-xs text-slate-800">{currentUser.displayName || 'Google User'}</p>
                        <p className="text-[11px] text-slate-500">{currentUser.email}</p>
                      </div>
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-slate-600 hover:text-rose-600 text-xs font-semibold transition"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign out</span>
                      </button>
                    </div>
                  ) : (
                    <GoogleSignInButton onClick={handleGoogleLogin} isLoading={isLoggingIn} />
                  )}
                </div>

                {currentUser && (
                  <div className="pt-4 border-t border-slate-200 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200">
                      <div className="space-y-1">
                        <p className="font-bold text-xs text-[#0A192F] flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-[#15803D]" />
                          <span>Competition Spreadsheet</span>
                        </p>
                        <p className="text-[11px] text-slate-500">
                          {activeSpreadsheet
                            ? `Spreadsheet ID: ${activeSpreadsheet.id.slice(0, 16)}...`
                            : 'Click initialize to link or create the competition sheet in your Google Drive.'}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        {activeSpreadsheet && (
                          <a
                            href={activeSpreadsheet.url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-[#0A192F] hover:bg-[#122846] transition"
                          >
                            <span>Open Google Sheet</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                        <button
                          type="button"
                          onClick={handleSyncSpreadsheet}
                          disabled={isInitializingSheet}
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border border-slate-300 text-slate-700 bg-white hover:bg-slate-50 transition disabled:opacity-50"
                        >
                          {isInitializingSheet ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : null}
                          <span>{activeSpreadsheet ? 'Refresh / Re-link' : 'Initialize Sheet'}</span>
                        </button>
                      </div>
                    </div>

                    {sheetSuccessMessage && (
                      <p className="text-xs text-[#15803D] font-medium flex items-center gap-1.5 bg-green-50 p-2.5 rounded-xl border border-green-200">
                        <CheckCircle2 className="w-4 h-4 shrink-0" />
                        <span>{sheetSuccessMessage}</span>
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'script' && (
            <div className="space-y-5">
              {/* Web App URL Config Input */}
              <div className="space-y-2 bg-[#FAFBF9] p-4 rounded-2xl border border-slate-200">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Google Apps Script Web App URL
                </label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="url"
                    value={inputUrl}
                    onChange={(e) => setInputUrl(e.target.value)}
                    placeholder="https://script.google.com/macros/s/.../exec"
                    className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-[#22C55E]/20 focus:border-[#16A34A]"
                  />
                  <button
                    type="button"
                    onClick={handleSave}
                    className="px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-[#0A192F] hover:bg-[#122846] transition whitespace-nowrap"
                  >
                    Save URL
                  </button>
                  <button
                    type="button"
                    onClick={handleTestConnection}
                    disabled={isTesting}
                    className="px-3.5 py-2.5 rounded-xl text-xs font-bold border border-slate-300 text-slate-700 bg-white hover:bg-slate-50 transition flex items-center justify-center gap-1.5 whitespace-nowrap"
                  >
                    {isTesting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : null}
                    <span>Diagnose URL</span>
                  </button>
                </div>

                {testResult && (
                  <div className={`p-3 rounded-xl text-xs mt-2 flex items-start gap-2 ${
                    testResult.success ? 'bg-green-50 text-[#16A34A] border border-green-200' : 'bg-amber-50 text-amber-900 border border-amber-200'
                  }`}>
                    {testResult.success ? <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" /> : <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />}
                    <span className="leading-relaxed">{testResult.message}</span>
                  </div>
                )}
              </div>

              {/* Code block with copy button */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-700">Apps Script Code (Code.gs)</span>
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold bg-[#0A192F] text-white hover:bg-[#122846] transition"
                  >
                    {copiedCode ? <Check className="w-3.5 h-3.5 text-[#22C55E]" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedCode ? 'Copied Code!' : 'Copy Script'}</span>
                  </button>
                </div>

                <div className="bg-[#0A192F] rounded-xl p-4 text-[11px] text-slate-300 font-mono overflow-x-auto max-h-48 border border-slate-800">
                  <pre>{scriptCode}</pre>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-200 bg-[#FAFBF9] flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-bold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
