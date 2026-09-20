import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, AlertCircle, Link2, ExternalLink, RefreshCw, Copy, Check, ShieldCheck, Database, Sparkles, FolderSync } from 'lucide-react';

interface GoogleSheetSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUrlUpdated?: (newUrl: string) => void;
}

export const GoogleSheetSettingsModal: React.FC<GoogleSheetSettingsModalProps> = ({
  isOpen,
  onClose,
  onUrlUpdated
}) => {
  const [scriptUrl, setScriptUrl] = useState('');
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
    sheetName?: string;
    totalRows?: number;
    totalCols?: number;
  } | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Load current URL
      const saved = localStorage.getItem('tpc2026_google_script_url') || '';
      setScriptUrl(saved);
      setTestResult(null);

      // Also check server config
      fetch('/api/config/script-url')
        .then(res => res.json())
        .then(data => {
          if (data && data.scriptUrl && !saved) {
            setScriptUrl(data.scriptUrl);
          }
        })
        .catch(() => {});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleTestConnection = async (urlToTest?: string) => {
    const targetUrl = (urlToTest || scriptUrl).trim();
    if (!targetUrl) {
      setTestResult({
        success: false,
        message: 'Please paste your Google Apps Script Web App URL first.'
      });
      return;
    }

    if (!targetUrl.startsWith('https://script.google.com/macros/s/')) {
      setTestResult({
        success: false,
        message: 'URL must start with https://script.google.com/macros/s/... and end with /exec'
      });
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    try {
      // 1. Test via backend proxy
      const res = await fetch('/api/test-google-sheet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scriptUrl: targetUrl })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setTestResult({
          success: true,
          message: data.message || 'Connected to Google Sheet successfully!',
          sheetName: data.sheetName || 'Registrations',
          totalRows: data.totalRows ?? 0,
          totalCols: 25
        });
        saveUrl(targetUrl);
        return;
      }

      // 2. Direct client test fallback
      const directUrl = `${targetUrl}${targetUrl.includes('?') ? '&' : '?'}action=health`;
      const directRes = await fetch(directUrl, { redirect: 'follow' });
      if (directRes.ok) {
        const dJson = await directRes.json();
        setTestResult({
          success: true,
          message: 'Direct connection verified! Google Sheet API is live.',
          sheetName: dJson.sheetName || 'Registrations',
          totalRows: dJson.totalRows ?? 0,
          totalCols: 25
        });
        saveUrl(targetUrl);
      } else {
        setTestResult({
          success: false,
          message: data.error || 'Could not connect. Make sure Who has access is set to "Anyone" and version is "New version".'
        });
      }
    } catch (err: any) {
      setTestResult({
        success: false,
        message: `Connection failed: ${err.message || 'Check your URL and permissions.'}`
      });
    } finally {
      setIsTesting(false);
    }
  };

  const saveUrl = (url: string) => {
    const clean = url.trim();
    localStorage.setItem('tpc2026_google_script_url', clean);
    fetch('/api/config/script-url', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ scriptUrl: clean })
    }).catch(() => {});

    if (onUrlUpdated) {
      onUrlUpdated(clean);
    }
  };

  const handleSave = () => {
    saveUrl(scriptUrl);
    handleTestConnection(scriptUrl);
  };

  const handleCopyCode = async () => {
    try {
      const res = await fetch('/api/script-code');
      const text = await res.text();
      await navigator.clipboard.writeText(text);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2500);
    } catch (e) {
      alert('Could not copy automatically. You can view or copy google-apps-script.js directly from the codebase.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-[#0A192F] px-6 py-4 flex items-center justify-between text-white border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base tracking-tight">Connect a New Google Sheet</h3>
                <span className="text-[10px] uppercase font-black tracking-widest bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-full">
                  25 Columns
                </span>
              </div>
              <p className="text-xs text-slate-300">Fast 1-click setup for brand new spreadsheets & photo folders</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5 text-sm text-slate-700">
          
          {/* Quick Setup Checklist for NEW Sheet */}
          <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-4.5 space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h4 className="text-xs font-black text-[#0A192F] uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[#16A34A]" />
                Brand New Google Sheet Setup (Step-by-Step)
              </h4>
              <div className="flex items-center gap-2">
                <a
                  href="https://sheets.new"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-lg bg-white border border-emerald-300 text-emerald-800 hover:bg-emerald-100/70 transition shadow-2xs"
                >
                  <span>1. Open sheets.new</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-extrabold rounded-lg bg-[#16A34A] text-white hover:bg-[#15803D] active:scale-95 transition shadow-xs"
                >
                  {copiedCode ? <Check className="w-3.5 h-3.5 text-white" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCode ? 'Copied Code!' : '2. Copy Apps Script'}</span>
                </button>
              </div>
            </div>

            <ol className="text-xs text-slate-700 space-y-2.5 list-decimal list-inside leading-relaxed bg-white/80 p-3.5 rounded-xl border border-emerald-100">
              <li>
                In your new sheet, click: <strong>Extensions &gt; Apps Script</strong>.
              </li>
              <li>
                Delete any default code in <code>Code.gs</code>, paste the copied code, and press <strong>Ctrl+S (Save)</strong>.
              </li>
              <li>
                In the top toolbar dropdown (next to "Debug"), select <strong>setup</strong> and click <strong>▶ Run</strong>.
                <span className="block mt-1 text-[11px] text-emerald-800 font-medium pl-5">
                  ✨ <em>This automatically formats your 25 columns, dark navy headers, dropdowns, plain text formatting for student rolls & WhatsApp numbers, creates the Google Drive photo folder, and authorizes the automatic confirmation email engine!</em>
                </span>
              </li>
              <li>
                Click <strong>Deploy &gt; New deployment</strong>:
                <div className="ml-5 mt-1 text-[11px] space-y-0.5 text-slate-600">
                  <p>• Select type: <strong>Web app</strong> (gear icon)</p>
                  <p>• Execute as: <strong>Me</strong></p>
                  <p>• Who has access: <strong className="text-emerald-700">Anyone</strong> (⚠️ Must select Anyone so submissions can save)</p>
                  <p>• Click <strong>Deploy</strong></p>
                </div>
              </li>
              <li>
                Copy the generated <strong>Web app URL</strong> (ends in <code>/exec</code>) and paste it below!
              </li>
            </ol>
          </div>

          {/* URL Input Box */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-800">
                Google Apps Script Web App URL:
              </label>
              <span className="text-[11px] text-slate-500 font-mono">Ends with /exec</span>
            </div>
            <div className="relative">
              <input
                type="url"
                value={scriptUrl}
                onChange={(e) => setScriptUrl(e.target.value)}
                placeholder="https://script.google.com/macros/s/AKfycb.../exec"
                className="w-full px-3.5 py-2.5 text-xs font-mono rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#16A34A] focus:border-transparent bg-white shadow-2xs pr-10"
              />
              <Link2 className="absolute right-3 top-3 w-4 h-4 text-slate-400" />
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Whenever a team registers on the website, their details and photos will automatically sync to your new Google Sheet and Drive folder.
            </p>
          </div>

          {/* Test Status Banner */}
          {testResult && (
            <div
              className={`p-4 rounded-xl border flex items-start gap-3 text-xs leading-relaxed ${
                testResult.success
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                  : 'bg-rose-50 border-rose-300 text-rose-900'
              }`}
            >
              {testResult.success ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              )}
              <div className="space-y-1">
                <p className="font-bold">{testResult.message}</p>
                {testResult.success && (
                  <div className="text-[11px] flex flex-wrap items-center gap-3 pt-1">
                    <span className="bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 rounded-md border border-emerald-200">
                      Sheet: {testResult.sheetName || 'Registrations'}
                    </span>
                    <span className="bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 rounded-md border border-emerald-200">
                      Columns: 25 (Team Name at Col D)
                    </span>
                    <span className="bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 rounded-md border border-emerald-200">
                      Submissions: {testResult.totalRows || 0} teams
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 25 Columns Preview */}
          <div className="border border-slate-200 rounded-xl p-3.5 bg-slate-50/50 space-y-2">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
              <FolderSync className="w-3.5 h-3.5 text-emerald-600" />
              Standard 25 Columns Enforced:
            </span>
            <div className="flex flex-wrap gap-1 text-[10px]">
              {[
                '1. Reg ID', '2. Date & Time', '3. Payment Status', '4. Team Name',
                '5. Leader Name', '6. Leader Roll', '7. Leader Dept', '8. Leader WhatsApp', '9. Leader FB', '10. Leader Email', '11. Leader Photo',
                '12. M1 Name', '13. M1 Roll', '14. M1 Dept', '15. M1 WhatsApp', '16. M1 FB', '17. M1 Photo',
                '18. M2 Name', '19. M2 Roll', '20. M2 Dept', '21. M2 WhatsApp', '22. M2 FB', '23. M2 Photo',
                '24. bKash Number', '25. Transaction ID'
              ].map((col, idx) => (
                <span
                  key={col}
                  className={`px-1.5 py-0.5 rounded font-medium border ${
                    idx === 3
                      ? 'bg-emerald-100 text-emerald-900 border-emerald-300 font-bold'
                      : 'bg-white text-slate-700 border-slate-200'
                  }`}
                >
                  {col}
                </span>
              ))}
            </div>
          </div>

        </div>

        {/* Footer actions */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-between gap-3 flex-wrap">
          <button
            type="button"
            onClick={() => handleTestConnection()}
            disabled={isTesting || !scriptUrl.trim()}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 disabled:opacity-50 transition active:scale-95 shadow-2xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin text-[#16A34A]' : ''}`} />
            <span>{isTesting ? 'Testing Connection...' : 'Test Connection'}</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200 transition"
            >
              Close
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={isTesting || !scriptUrl.trim()}
              className="px-5 py-2 rounded-xl text-xs font-extrabold text-white bg-[#16A34A] hover:bg-[#15803D] active:scale-98 transition shadow-xs disabled:opacity-50"
            >
              Save & Connect
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
