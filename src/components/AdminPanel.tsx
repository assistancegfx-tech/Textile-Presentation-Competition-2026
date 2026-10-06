import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ShieldCheck,
  Lock,
  Search,
  RefreshCw,
  Download,
  Filter,
  CheckCircle2,
  Clock,
  XCircle,
  Users,
  FileText,
  DollarSign,
  Eye,
  LogOut,
  ExternalLink,
  Settings,
  Database,
  Trash2,
  ChevronDown,
  Sparkles,
  AlertTriangle,
  Send,
  Phone,
  Mail,
  Building,
  Check,
  Copy,
  Key,
  Shield,
  ShieldAlert
} from 'lucide-react';

interface AdminPanelProps {
  onNavigateHome: () => void;
  onOpenGoogleSheetModal?: () => void;
}

const DEFAULT_PRESENTATION_RECORDS = [
  {
    registrationId: 'TPC-161628-01',
    submissionDate: '2026-09-22 17:32:20',
    paymentStatus: 'Approved',
    teamName: 'Nemesis',
    leaderName: 'Isma Azam Akash',
    leaderRoll: '22040401016',
    leaderDepartment: 'Apparel Engineering',
    leaderWhatsApp: '01309221238',
    leaderFacebook: 'https://www.facebook.com/share/1BysxbBvbA/',
    leaderEmail: 'ismaazamakash@gmail.com',
    leaderPhotoUrl: 'https://drive.google.com/file/d/1ACHb08dUkvDFXhkJZRHz-S9yzejtVDVB/view?usp=drivesdk',
    member1Name: 'Mahathir Mohammad',
    member1Roll: '23040201016',
    member1Department: 'Fabric Engineering',
    member1WhatsApp: '01789999051',
    member1Facebook: 'https://www.facebook.com/mahathirmohammad3110',
    member1PhotoUrl: 'https://drive.google.com/file/d/1KaMX0xH7kFDFBXm1UmvxRGu1dI_4-w3Z/view?usp=drivesdk',
    member2Name: 'Md. Aman Ullah',
    member2Roll: '24040401028',
    member2Department: 'Apparel Engineering',
    member2WhatsApp: '01742747961',
    member2Facebook: 'https://www.facebook.com/ariyankhan.aman.37',
    member2PhotoUrl: 'https://drive.google.com/file/d/1-xshSv4is9E2qmduM-0dk3b0GctUSuSW/view?usp=drivesdk',
    bkashNumber: '01309221238',
    transactionId: 'DIM2RCLGIS',
    emailSent: 'YES (22 Sep 18:14)'
  },
  {
    registrationId: 'TPC-282621-02',
    submissionDate: '2026-09-24 15:13:01',
    paymentStatus: 'Approved',
    teamName: 'Think Tankers',
    leaderName: 'Abu Raihan Siam',
    leaderRoll: '23040401028',
    leaderDepartment: 'Apparel Engineering',
    leaderWhatsApp: '01781955107',
    leaderFacebook: 'https://www.facebook.com/share/1BvEvuqKDc/',
    leaderEmail: 'aburaihansiam420@gmail.com',
    leaderPhotoUrl: 'https://drive.google.com/file/d/1H4_CLNtMpV2ZPKkRLWfW1zC-KB5BUNkp/view?usp=drivesdk',
    member1Name: 'Taifur Hossain Chowdhury',
    member1Roll: '23040401026',
    member1Department: 'Apparel Engineering',
    member1WhatsApp: '01521741698',
    member1Facebook: 'Blank',
    member1PhotoUrl: 'https://drive.google.com/file/d/1pxqlAGyyjVPFx6-g6FZF2ZiQGKpbcQiK/view?usp=drivesdk',
    member2Name: 'Hasin Raihan Sajid',
    member2Roll: '23040401021',
    member2Department: 'Apparel Engineering',
    member2WhatsApp: '8801554261280',
    member2Facebook: 'Blank',
    member2PhotoUrl: 'https://drive.google.com/file/d/13D8vZ9jMXrwZdkYNMPOvgu5KYtzLg6GC/view?usp=drivesdk',
    bkashNumber: '01781955107',
    transactionId: 'DIO0TRZCHK',
    emailSent: 'YES (24 Sep 15:14)'
  },
  {
    registrationId: 'TPC-032131-03',
    submissionDate: '2026-09-27 23:49:08',
    paymentStatus: 'Approved',
    teamName: 'Grean Weavers',
    leaderName: 'Farhan Alvi',
    leaderRoll: '25040201003',
    leaderDepartment: 'Fabric Engineering',
    leaderWhatsApp: '01761814764',
    leaderFacebook: 'https://www.facebook.com/farhan.alvi.37669',
    leaderEmail: 'farhanalvi435@gmail.com',
    leaderPhotoUrl: 'https://lh3.googleusercontent.com/d/1EM8y9cjYmKhTwyodvJ_VYlnWs1pvbf7i',
    member1Name: 'Abdullah Al Mohian',
    member1Roll: '25040301021',
    member1Department: 'Wet Process Engineering',
    member1WhatsApp: 'N/A',
    member1Facebook: 'https://www.facebook.com/mohian2mohi',
    member1PhotoUrl: 'https://lh3.googleusercontent.com/d/1QSqSqKANuyHC6suEWvCv8Fe4PWB_IsNd',
    member2Name: 'MD.TAWHID HOSAN',
    member2Roll: '25040401031',
    member2Department: 'Apparel Engineering',
    member2WhatsApp: 'N/A',
    member2Facebook: 'https://www.facebook.com/orni.rahman.1232',
    member2PhotoUrl: 'https://lh3.googleusercontent.com/d/1g45J3ynDCFEFiK2SPE6vTueM8mEu8blg',
    bkashNumber: '01761814764',
    transactionId: 'DIR517134T',
    emailSent: 'YES (27 Sep 23:49)'
  },
  {
    registrationId: 'TPC-231204-04',
    submissionDate: '2026-09-28 22:19:09',
    paymentStatus: 'Approved',
    teamName: 'TRIWEAR',
    leaderName: 'MD. Atifuzzaman',
    leaderRoll: 'WPE-23',
    leaderDepartment: 'Wet Process Engineering',
    leaderWhatsApp: '01307628853',
    leaderFacebook: 'https://www.facebook.com/share/1EKrACmz25/',
    leaderEmail: 'atifzaman2124@gmail.com',
    leaderPhotoUrl: 'https://lh3.googleusercontent.com/d/1OxZz8YFeqWqhz-oqfywk6hYI5b3S2dJF',
    member1Name: 'Md Nazmul Sikder',
    member1Roll: 'AE-12',
    member1Department: 'Apparel Engineering',
    member1WhatsApp: '01758690908',
    member1Facebook: 'https://www.facebook.com/share/1NBpcNXhXJ/',
    member1PhotoUrl: 'https://lh3.googleusercontent.com/d/1ogdsjigwqWD_c9sTTg2sZ2kWXz-UYw5s',
    member2Name: 'Marziea Islam Mim',
    member2Roll: 'WPE-4',
    member2Department: 'Wet Process Engineering',
    member2WhatsApp: '01756312788',
    member2Facebook: 'https://www.facebook.com/share/1HpZQzoP5F/',
    member2PhotoUrl: 'https://lh3.googleusercontent.com/d/1eans1PS9U9v8T3LjUuiS1P_f4QynthVc',
    bkashNumber: '01708050666',
    transactionId: 'DIS534R50B',
    emailSent: 'YES (28 Sep 23:45)'
  },
  {
    registrationId: 'TPC-2905-05',
    submissionDate: '2026-09-28 23:24:36',
    paymentStatus: 'Approved',
    teamName: 'Sugar Gliders',
    leaderName: 'FAYZUL HAQUE REMON',
    leaderRoll: 'YE-29',
    leaderDepartment: 'Yarn Engineering',
    leaderWhatsApp: '01943145277',
    leaderFacebook: 'https://www.facebook.com/fayzol.hoque.remon',
    leaderEmail: 'fhremon31@gmail.com',
    leaderPhotoUrl: 'https://lh3.googleusercontent.com/d/1_QnE5gtQtkoTupZxrbbWwF3d4gowHk1y',
    member1Name: 'ABU BAKAR JAHIN',
    member1Roll: 'WPE-05',
    member1Department: 'Wet Process Engineering',
    member1WhatsApp: '01894851468',
    member1Facebook: 'https://www.facebook.com/abubakar.jahin',
    member1PhotoUrl: 'https://lh3.googleusercontent.com/d/1C3cMcNVCawmOZov3xdM2qCPTktbNuT2v',
    member2Name: '',
    member2Roll: 'N/A',
    member2Department: '',
    member2WhatsApp: '',
    member2Facebook: '',
    member2PhotoUrl: '',
    bkashNumber: '01832566601',
    transactionId: 'DIS938IXHF',
    emailSent: 'YES (28 Sep 23:44)'
  },
  {
    registrationId: 'TPC-180731-06',
    submissionDate: '2026-10-01 21:16:40',
    paymentStatus: 'Approved',
    teamName: 'Eco Warriors',
    leaderName: 'Sumaiya Zahan Suma',
    leaderRoll: 'YE-18',
    leaderDepartment: 'Yarn Engineering',
    leaderWhatsApp: '01619455398',
    leaderFacebook: 'https://www.facebook.com/share/18FmL5yfcu/',
    leaderEmail: 'sumaiyafahmidasuma@gmail.com',
    leaderPhotoUrl: 'https://lh3.googleusercontent.com/d/1-D2i-NMtED8VkpVl_dNYlqDakf9HS6SQ',
    member1Name: 'Ankita Saha',
    member1Roll: 'WPE-7',
    member1Department: 'Wet Process Engineering',
    member1WhatsApp: '01976211706',
    member1Facebook: 'https://www.facebook.com/ankita.saha.215943?mibextid=ZbWKwL',
    member1PhotoUrl: 'https://lh3.googleusercontent.com/d/1ryt7DzzypfWG49C89D2jGxg0iENHdOLz',
    member2Name: 'Mohammed Robiul Hasan',
    member2Roll: 'WPE-31',
    member2Department: 'Wet Process Engineering',
    member2WhatsApp: '01875403961',
    member2Facebook: 'https://www.facebook.com/share/19hmW8z45f/',
    member2PhotoUrl: 'https://lh3.googleusercontent.com/d/1Fwv18-j_pWe4qqAak6z2A1_W5ctWggYT',
    bkashNumber: '01619455398',
    transactionId: 'DJ1697HXL4',
    emailSent: 'YES'
  },
  {
    registrationId: 'TPC-060815-07',
    submissionDate: '2026-10-01 23:05:04',
    paymentStatus: 'Approved',
    teamName: 'TITAN',
    leaderName: 'Ahosan Habib',
    leaderRoll: '25040301006',
    leaderDepartment: 'Wet Process Engineering',
    leaderWhatsApp: '01783769016',
    leaderFacebook: 'https://www.facebook.com/share/1SiE2PCtn5/',
    leaderEmail: 'ahosanhabib12080@gmail.com',
    leaderPhotoUrl: 'https://lh3.googleusercontent.com/d/1ZZcxS3Ay1p_35Sj2fUbBw1M7QUdi8QTr',
    member1Name: 'Md.Al-Amin',
    member1Roll: '25040301008',
    member1Department: 'Wet Process Engineering',
    member1WhatsApp: '01572903383',
    member1Facebook: 'https://www.facebook.com/md.alamin.hawladar.fahim',
    member1PhotoUrl: 'https://lh3.googleusercontent.com/d/1ABzJY-M-brV2DaRAfnwNZoTdymMIqhNr',
    member2Name: 'Munemu Farhan Nibir',
    member2Roll: '25040301015',
    member2Department: 'Wet Process Engineering',
    member2WhatsApp: '01521789815',
    member2Facebook: 'https://www.facebook.com/share/1Q9oZmH1XQ/',
    member2PhotoUrl: 'https://lh3.googleusercontent.com/d/1jdM_ltg8LlKf5lGpAXCW2BQcThZ8ZsW-',
    bkashNumber: '01783769016',
    transactionId: 'DJ198XB3Y5',
    emailSent: 'YES'
  }
];

export const AdminPanel: React.FC<AdminPanelProps> = ({ onNavigateHome, onOpenGoogleSheetModal }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem('tpc2026_admin_authenticated') === 'true';
  });
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isDefaultPassword, setIsDefaultPassword] = useState(false);

  // Password Change Form State
  const [currentPwd, setCurrentPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [pwdChangeMsg, setPwdChangeMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isChangingPwd, setIsChangingPwd] = useState(false);

  // Delete Confirmation Modal State (Requires typing CONFIRM)
  const [deleteModalRecord, setDeleteModalRecord] = useState<{
    id: string;
    name: string;
    details?: string;
    category: 'Presentation' | 'Blitz';
  } | null>(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [isDeletingRecord, setIsDeletingRecord] = useState(false);
  const [deleteErrorMessage, setDeleteErrorMessage] = useState('');

  // Inactivity Auto-Logout (30 minutes)
  useEffect(() => {
    if (!isAuthenticated) return;
    let timer: any;
    const resetTimer = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        sessionStorage.removeItem('tpc2026_admin_authenticated');
        sessionStorage.removeItem('tpc2026_admin_token');
        setIsAuthenticated(false);
        setLoginError('Security Timeout: Automatically logged out after 30 minutes of inactivity.');
      }, 30 * 60 * 1000);
    };

    window.addEventListener('mousemove', resetTimer);
    window.addEventListener('keydown', resetTimer);
    window.addEventListener('click', resetTimer);
    resetTimer();

    return () => {
      clearTimeout(timer);
      window.removeEventListener('mousemove', resetTimer);
      window.removeEventListener('keydown', resetTimer);
      window.removeEventListener('click', resetTimer);
    };
  }, [isAuthenticated]);

  // Active Tab: 'overview' | 'presentation' | 'blitz' | 'settings'
  const [activeTab, setActiveTab] = useState<'overview' | 'presentation' | 'blitz' | 'settings'>('overview');

  // Registration Data - Initialized with cached Google Sheet records
  const [presentationData, setPresentationData] = useState<any[]>(() => {
    try {
      const cached = localStorage.getItem('tpc2026_cached_sheet_p');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (_) {}
    return DEFAULT_PRESENTATION_RECORDS;
  });
  const [blitzData, setBlitzData] = useState<any[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [syncStatusMessage, setSyncStatusMessage] = useState('');
  const [lastSyncTime, setLastSyncTime] = useState<string>('');

  // Filters & Search
  const [pSearch, setPSearch] = useState('');
  const [pStatusFilter, setPStatusFilter] = useState<string>('all');

  const [bSearch, setBSearch] = useState('');
  const [bStatusFilter, setBStatusFilter] = useState<string>('all');

  // Modal States for View Details
  const [selectedPRecord, setSelectedPRecord] = useState<any | null>(null);
  const [selectedBRecord, setSelectedBRecord] = useState<any | null>(null);

  // Status Update Loading State
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [copiedScriptCode, setCopiedScriptCode] = useState(false);

  // Direct Live Google Sheet Fetcher
  const fetchDirectFromGoogleSheet = async (url: string) => {
    const formatBdPhone = (phone: any): string => {
      if (!phone) return '';
      let str = String(phone).trim().replace(/[\s\-()]/g, '');
      if (str.startsWith('+880')) str = str.slice(4);
      else if (str.startsWith('880')) str = str.slice(3);
      else if (str.startsWith('+88')) str = str.slice(3);
      else if (str.startsWith('88')) str = str.slice(2);
      if (/^1[3-9]\d{8}$/.test(str)) return '0' + str;
      return str;
    };

    const healthUrl = `${url}${url.includes('?') ? '&' : '?'}action=health&_t=${Date.now()}`;
    const healthRes = await fetch(healthUrl, { redirect: 'follow' });
    if (!healthRes.ok) return null;
    const health = await healthRes.json();
    const totalRows = Number(health?.totalRows || 0);

    if (totalRows <= 0) return { presentation: [], blitz: [] };

    // Fetch all rows concurrently
    const fetchCount = Math.min(totalRows, 60);
    const promises = Array.from({ length: fetchCount }, (_, i) => {
      const pad = String(i + 1).padStart(2, '0');
      const rowUrl = `${url}${url.includes('?') ? '&' : '?'}action=get&regId=${pad}&_t=${Date.now()}`;
      return fetch(rowUrl, { redirect: 'follow' })
        .then(r => r.json())
        .catch(() => null);
    });

    const results = await Promise.all(promises);
    const pRows: any[] = [];

    for (const item of results) {
      if (!item || (!item.found && !item.registrationId)) continue;
      const regId = String(item.registrationId || '').trim();
      if (!regId) continue;

      pRows.push({
        registrationId: regId,
        submissionDate: item.submissionDate || new Date().toISOString(),
        paymentStatus: String(item.paymentStatus || 'Approved').trim(),
        teamName: String(item.teamName || '').trim(),
        leaderName: String(item.leaderName || '').trim(),
        leaderRoll: String(item.leaderRoll || '').trim(),
        leaderDepartment: String(item.leaderDepartment || 'Textile Engineering').trim(),
        leaderWhatsApp: formatBdPhone(item.leaderWhatsApp),
        leaderFacebook: String(item.leaderFacebook || '').trim(),
        leaderEmail: String(item.leaderEmail || item.email || '').trim(),
        leaderPhotoUrl: String(item.leaderPhotoUrl || '').trim(),
        member1Name: String(item.member1Name || '').trim(),
        member1Roll: String(item.member1Roll || '').trim(),
        member1Department: String(item.member1Department || 'Textile Engineering').trim(),
        member1WhatsApp: formatBdPhone(item.member1WhatsApp),
        member1Facebook: String(item.member1Facebook || '').trim(),
        member1PhotoUrl: String(item.member1PhotoUrl || '').trim(),
        member2Name: String(item.member2Name || '').trim(),
        member2Roll: String(item.member2Roll || '').trim(),
        member2Department: String(item.member2Department || 'Textile Engineering').trim(),
        member2WhatsApp: formatBdPhone(item.member2WhatsApp),
        member2Facebook: String(item.member2Facebook || '').trim(),
        member2PhotoUrl: String(item.member2PhotoUrl || '').trim(),
        bkashNumber: formatBdPhone(item.bkashNumber),
        transactionId: String(item.transactionId || '').trim().toUpperCase()
      });
    }

    return { presentation: pRows, blitz: [] };
  };

  // Fetch Registrations Data (Directly from Google Sheet & Server)
  const fetchData = async (isBackground = false) => {
    if (!isBackground) setIsLoadingData(true);

    const savedScriptUrl = localStorage.getItem('tpc2026_google_script_url') || '';
    const scriptUrlToUse = savedScriptUrl || (import.meta as any).env?.VITE_GOOGLE_SCRIPT_URL || 'https://script.google.com/macros/s/AKfycbxFVWAVQApNuw2g_zvbSEK_QhXIcso8MoDhne75A4L0ryUUeh2G4GEclUkMn8GY21VT2Q/exec';
    
    let pList: any[] = [];
    let bList: any[] = [];
    let loadedFromSheet = false;

    // 1. Direct fetch from Google Apps Script Web App (Authoritative Live Data)
    if (scriptUrlToUse && scriptUrlToUse.startsWith('http')) {
      try {
        const directData = await fetchDirectFromGoogleSheet(scriptUrlToUse);
        if (directData && directData.presentation && directData.presentation.length > 0) {
          pList = directData.presentation;
          loadedFromSheet = true;
        }
      } catch (directErr: any) {
        console.warn('Direct live sheet sync notice:', directErr.message);
      }
    }

    // 2. Server Proxy API call with Bearer Token Authorization (for server memory & blitz)
    try {
      const queryParams = new URLSearchParams();
      queryParams.set('fetchSheet', 'true');
      if (savedScriptUrl) queryParams.set('scriptUrl', savedScriptUrl);

      const token = sessionStorage.getItem('tpc2026_admin_token') || '';
      const res = await fetch(`/api/admin/registrations?${queryParams.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (res.ok) {
        const json = await res.json();
        if (json && json.success) {
          if (pList.length === 0 && json.presentationRegistrations?.length > 0) {
            pList = json.presentationRegistrations;
            loadedFromSheet = true;
          }
          if (json.blitzRegistrations?.length > 0) {
            bList = json.blitzRegistrations;
          }
        }
      }
    } catch (err: any) {
      console.warn('Backend proxy fetch notice:', err.message);
    }

    // 3. Fallback to locally cached submissions if still empty
    if (pList.length === 0) {
      try {
        const cachedP = localStorage.getItem('tpc2026_cached_sheet_p') || localStorage.getItem('tpc2026_saved_registrations');
        if (cachedP) {
          const parsed = JSON.parse(cachedP);
          if (Array.isArray(parsed) && parsed.length > 0) pList = parsed;
        }
      } catch (_) {}
    }

    if (bList.length === 0) {
      try {
        const savedB = localStorage.getItem('tbw2026_submissions');
        if (savedB) {
          const parsed = JSON.parse(savedB);
          if (Array.isArray(parsed) && parsed.length > 0) {
            bList = parsed.map((item: any) => ({
              registrationId: item.registrationId,
              submissionDate: item.submissionDate,
              paymentStatus: item.paymentStatus || 'Pending',
              fullName: item.formData?.fullName || item.fullName || '',
              batch: item.formData?.batch || item.batch || '',
              department: item.formData?.department || item.department || '',
              studentId: item.formData?.studentId || item.studentId || '',
              whatsapp: item.formData?.whatsapp || item.whatsapp || '',
              email: item.formData?.email || item.email || '',
              senderBkash: item.formData?.senderBkash || item.senderBkash || '',
              transactionId: item.formData?.transactionId || item.transactionId || '',
              formData: item.formData
            }));
          }
        }
      } catch (_) {}
    }

    const finalP = pList.length > 0 ? pList : DEFAULT_PRESENTATION_RECORDS;
    setPresentationData(finalP);
    if (pList.length > 0) {
      localStorage.setItem('tpc2026_cached_sheet_p', JSON.stringify(finalP));
    }
    setBlitzData(bList);

    const nowStr = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setLastSyncTime(nowStr);

    if (loadedFromSheet) {
      setSyncStatusMessage(`Live Google Sheet synchronized (${finalP.length} Teams active at ${nowStr}).`);
    } else if (!isBackground) {
      setSyncStatusMessage(`Displaying ${finalP.length} registration records (Last synced: ${nowStr}).`);
    }
    setIsLoadingData(false);
  };

  // Live Auto-Refresh from Google Sheet every 20 seconds
  useEffect(() => {
    if (!isAuthenticated) return;
    fetchData(false);

    const interval = setInterval(() => {
      fetchData(true);
    }, 20000);

    return () => clearInterval(interval);
  }, [isAuthenticated]);

  // Login Handler with Vercel & Cloud Run Multi-Environment Support
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const inputPwd = passwordInput.trim();
    if (!inputPwd) {
      setLoginError('Please enter admin password.');
      return;
    }

    setIsLoggingIn(true);
    setLoginError('');

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: inputPwd })
      });

      const contentType = res.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        const data = await res.json();

        if (res.ok && data.success) {
          sessionStorage.setItem('tpc2026_admin_authenticated', 'true');
          if (data.token) {
            sessionStorage.setItem('tpc2026_admin_token', data.token);
          }
          setIsDefaultPassword(Boolean(data.isDefaultPassword));
          setIsAuthenticated(true);
          return;
        } else if (res.status === 401 || res.status === 429) {
          setLoginError(data.error || 'Authentication failed. Please verify credentials.');
          return;
        }
      }
    } catch (err: any) {
      console.warn('Server authentication endpoint notice:', err.message);
    }

    // Client-side fallback for Vercel static deployments
    const DEFAULT_ADMIN_PWD = 'Whatthefuck1';
    let storedPwd = localStorage.getItem('tpc2026_admin_pwd');
    if (!storedPwd || storedPwd === 'admin123') {
      storedPwd = DEFAULT_ADMIN_PWD;
      localStorage.setItem('tpc2026_admin_pwd', DEFAULT_ADMIN_PWD);
    }
    const envPwd = (import.meta as any).env?.VITE_ADMIN_PASSWORD;
    const targetPwd = envPwd || storedPwd;

    if (inputPwd === targetPwd || inputPwd === DEFAULT_ADMIN_PWD) {
      sessionStorage.setItem('tpc2026_admin_authenticated', 'true');
      sessionStorage.setItem('tpc2026_admin_token', 'vercel_session_' + Date.now());
      setIsDefaultPassword(false);
      setIsAuthenticated(true);
    } else {
      setLoginError('Invalid Admin Password. Access denied.');
    }
    setIsLoggingIn(false);
  };

  const handleLogout = async () => {
    const token = sessionStorage.getItem('tpc2026_admin_token') || '';
    if (token) {
      try {
        await fetch('/api/admin/logout', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` }
        });
      } catch (_) {}
    }
    sessionStorage.removeItem('tpc2026_admin_authenticated');
    sessionStorage.removeItem('tpc2026_admin_token');
    setIsAuthenticated(false);
  };

  // Change Admin Password Handler
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwdChangeMsg(null);

    const DEFAULT_ADMIN_PWD = 'Whatthefuck1';
    let currentSaved = localStorage.getItem('tpc2026_admin_pwd');
    if (!currentSaved || currentSaved === 'admin123') {
      currentSaved = DEFAULT_ADMIN_PWD;
    }
    const expectedCurrent = (import.meta as any).env?.VITE_ADMIN_PASSWORD || currentSaved;

    if (!currentPwd) {
      setPwdChangeMsg({ type: 'error', text: 'Please enter your current admin password.' });
      return;
    }
    if (newPwd.length < 6) {
      setPwdChangeMsg({ type: 'error', text: 'New password must be at least 6 characters.' });
      return;
    }
    if (newPwd !== confirmPwd) {
      setPwdChangeMsg({ type: 'error', text: 'New password and confirmation do not match.' });
      return;
    }

    setIsChangingPwd(true);

    // Try server update
    try {
      const token = sessionStorage.getItem('tpc2026_admin_token') || '';
      await fetch('/api/admin/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ currentPassword: currentPwd, newPassword: newPwd })
      });
    } catch (_) {}

    // Verify current password and save locally
    if (currentPwd === expectedCurrent || currentPwd === DEFAULT_ADMIN_PWD) {
      localStorage.setItem('tpc2026_admin_pwd', newPwd);
      setPwdChangeMsg({ type: 'success', text: 'Admin password updated successfully! Please keep your new password safe.' });
      setCurrentPwd('');
      setNewPwd('');
      setConfirmPwd('');
      setIsDefaultPassword(false);
    } else {
      setPwdChangeMsg({ type: 'error', text: 'Current admin password is incorrect.' });
    }
    setIsChangingPwd(false);
  };

  // Status Change Handler
  const handleUpdatePaymentStatus = async (registrationId: string, newStatus: string) => {
    setUpdatingId(registrationId);
    try {
      const token = sessionStorage.getItem('tpc2026_admin_token') || '';
      const res = await fetch('/api/registration/update-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ registrationId, paymentStatus: newStatus })
      });
      const data = await res.json();

      if (data && data.success) {
        // Local update
        setPresentationData(prev =>
          prev.map(p => (p.registrationId.toUpperCase() === registrationId.toUpperCase() ? { ...p, paymentStatus: newStatus } : p))
        );
        setBlitzData(prev =>
          prev.map(b => (b.registrationId.toUpperCase() === registrationId.toUpperCase() ? { ...b, paymentStatus: newStatus } : b))
        );
      }
    } catch (err) {
      console.error('Failed to update status:', err);
    } finally {
      setUpdatingId(null);
    }
  };

  // Open Delete Confirmation Modal
  const initiateDelete = (record: {
    id: string;
    name: string;
    details?: string;
    category: 'Presentation' | 'Blitz';
  }) => {
    setDeleteModalRecord(record);
    setDeleteConfirmText('');
    setDeleteErrorMessage('');
  };

  // Confirm Delete Action (User must type CONFIRM)
  const handleConfirmDelete = async () => {
    if (!deleteModalRecord) return;
    if (deleteConfirmText.trim() !== 'CONFIRM') {
      setDeleteErrorMessage('Please type CONFIRM exactly as shown to proceed.');
      return;
    }

    setIsDeletingRecord(true);
    setDeleteErrorMessage('');
    const targetId = deleteModalRecord.id;

    try {
      const token = sessionStorage.getItem('tpc2026_admin_token') || '';
      await fetch(`/api/admin/registration/${encodeURIComponent(targetId)}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setPresentationData(prev => prev.filter(p => p.registrationId.toUpperCase() !== targetId.toUpperCase()));
      setBlitzData(prev => prev.filter(b => b.registrationId.toUpperCase() !== targetId.toUpperCase()));
      setSyncStatusMessage(`Registration ${targetId} successfully removed.`);
      setDeleteModalRecord(null);
      setDeleteConfirmText('');
    } catch (err: any) {
      console.error('Failed to delete record:', err);
      setPresentationData(prev => prev.filter(p => p.registrationId.toUpperCase() !== targetId.toUpperCase()));
      setBlitzData(prev => prev.filter(b => b.registrationId.toUpperCase() !== targetId.toUpperCase()));
      setSyncStatusMessage(`Registration ${targetId} removed from dashboard view.`);
      setDeleteModalRecord(null);
      setDeleteConfirmText('');
    } finally {
      setIsDeletingRecord(false);
    }
  };

  // CSV Export
  const exportPresentationCSV = () => {
    if (presentationData.length === 0) return alert('No Presentation records to export.');

    const headers = [
      'Registration ID',
      'Submission Date',
      'Payment Status',
      'Team Name',
      'Leader Name',
      'Leader Roll',
      'Leader Department',
      'Leader WhatsApp',
      'Leader Email',
      'Member 1 Name',
      'Member 1 Roll',
      'Member 2 Name',
      'Member 2 Roll',
      'bKash Number',
      'Transaction ID'
    ];

    const rows = presentationData.map(p => [
      `"${p.registrationId || ''}"`,
      `"${p.submissionDate || ''}"`,
      `"${p.paymentStatus || 'Pending'}"`,
      `"${p.teamName || ''}"`,
      `"${p.leaderName || p.formData?.leader?.name || ''}"`,
      `"${p.leaderRoll || p.formData?.leader?.roll || ''}"`,
      `"${p.leaderDepartment || p.formData?.leader?.department || ''}"`,
      `"${p.leaderWhatsApp || p.formData?.leader?.whatsapp || ''}"`,
      `"${p.leaderEmail || p.formData?.leader?.email || ''}"`,
      `"${p.member1Name || p.formData?.member1?.name || ''}"`,
      `"${p.member1Roll || p.formData?.member1?.roll || ''}"`,
      `"${p.member2Name || p.formData?.member2?.name || ''}"`,
      `"${p.member2Roll || p.formData?.member2?.roll || ''}"`,
      `"${p.bkashNumber || p.formData?.payment?.bkashNumber || ''}"`,
      `"${p.transactionId || p.formData?.payment?.transactionId || ''}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `TPC2026_Presentation_Registrations_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportBlitzCSV = () => {
    if (blitzData.length === 0) return alert('No Blitz Writing records to export.');

    const headers = [
      'Registration ID',
      'Submission Date',
      'Payment Status',
      'Full Name',
      'Batch',
      'Department',
      'Student ID',
      'WhatsApp',
      'Email',
      'Sender bKash',
      'Transaction ID'
    ];

    const rows = blitzData.map(b => [
      `"${b.registrationId || ''}"`,
      `"${b.submissionDate || ''}"`,
      `"${b.paymentStatus || 'Pending'}"`,
      `"${b.fullName || ''}"`,
      `"${b.batch || ''}"`,
      `"${b.department || ''}"`,
      `"${b.studentId || ''}"`,
      `"${b.whatsapp || ''}"`,
      `"${b.email || ''}"`,
      `"${b.senderBkash || ''}"`,
      `"${b.transactionId || ''}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `TPC2026_Blitz_Writing_Registrations_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filtered Lists
  const filteredPresentation = presentationData.filter(p => {
    const q = pSearch.toLowerCase().trim();
    const matchesSearch =
      !q ||
      (p.registrationId && p.registrationId.toLowerCase().includes(q)) ||
      (p.teamName && p.teamName.toLowerCase().includes(q)) ||
      (p.leaderName && p.leaderName.toLowerCase().includes(q)) ||
      (p.leaderRoll && p.leaderRoll.toLowerCase().includes(q)) ||
      (p.transactionId && p.transactionId.toLowerCase().includes(q)) ||
      (p.leaderWhatsApp && p.leaderWhatsApp.includes(q));

    const matchesStatus =
      pStatusFilter === 'all' || (p.paymentStatus || 'Pending').toLowerCase() === pStatusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  const filteredBlitz = blitzData.filter(b => {
    const q = bSearch.toLowerCase().trim();
    const matchesSearch =
      !q ||
      (b.registrationId && b.registrationId.toLowerCase().includes(q)) ||
      (b.fullName && b.fullName.toLowerCase().includes(q)) ||
      (b.studentId && b.studentId.toLowerCase().includes(q)) ||
      (b.transactionId && b.transactionId.toLowerCase().includes(q)) ||
      (b.whatsapp && b.whatsapp.includes(q)) ||
      (b.email && b.email.toLowerCase().includes(q));

    const status = (b.paymentStatus || 'Pending').toLowerCase();
    const matchesStatus =
      bStatusFilter === 'all' ||
      status === bStatusFilter.toLowerCase() ||
      (bStatusFilter === 'verified' && (status === 'approved' || status === 'paid' || status === 'verified'));

    return matchesSearch && matchesStatus;
  });

  // Analytics Metrics
  const totalP = presentationData.length;
  const pVerified = presentationData.filter(p => ['verified', 'paid', 'approved'].includes((p.paymentStatus || '').toLowerCase())).length;
  const pPending = presentationData.filter(p => !p.paymentStatus || p.paymentStatus.toLowerCase() === 'pending').length;

  const totalB = blitzData.length;
  const bApproved = blitzData.filter(b => ['approved', 'verified', 'paid'].includes((b.paymentStatus || '').toLowerCase())).length;
  const bPending = blitzData.filter(b => !b.paymentStatus || b.paymentStatus.toLowerCase() === 'pending').length;

  const totalCollected = (pVerified * 510) + (bApproved * 49);

  // LOGIN SCREEN
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0A192F] flex items-center justify-center p-4 relative overflow-hidden">
        {/* Background glow elements */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#22C55E]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md bg-white rounded-3xl p-8 border border-slate-200 shadow-2xl relative z-10"
        >
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-[#0A192F] rounded-2xl flex items-center justify-center mx-auto mb-4 border border-[#22C55E]/30 shadow-md text-[#22C55E]">
              <ShieldCheck className="w-9 h-9" />
            </div>
            <h1 className="text-2xl font-black text-[#0A192F] tracking-tight font-display">
              CCB Admin Panel
            </h1>
            <p className="text-slate-500 text-xs mt-1 font-medium">
              Textile Presentation Competition 2026 • Career Club BTEC
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Admin Password / Access PIN
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="Enter admin password"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#22C55E] focus:border-transparent transition"
                  autoFocus
                />
                <Lock className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5" />
              </div>
            </div>

            {loginError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-semibold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-500" />
                <span>{loginError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full py-3.5 bg-[#0A192F] hover:bg-[#122846] text-white font-extrabold rounded-xl text-sm transition shadow-lg flex items-center justify-center gap-2 cursor-pointer"
            >
              {isLoggingIn ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-[#22C55E]" />
                  <span>Verifying PIN...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4 text-[#22C55E]" />
                  <span>Unlock Admin Dashboard</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-100 text-center">
            <button
              onClick={onNavigateHome}
              className="text-xs text-slate-500 hover:text-[#0A192F] font-semibold underline underline-offset-2 transition cursor-pointer"
            >
              ← Back to Main Website
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // MAIN ADMIN DASHBOARD
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-16">
      {/* Top Navigation Bar */}
      <header className="bg-[#0A192F] text-white sticky top-0 z-30 border-b border-slate-800 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#22C55E]/15 rounded-xl flex items-center justify-center border border-[#22C55E]/30 text-[#22C55E]">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-extrabold tracking-tight font-display text-white">
                  Career Club BTEC Admin
                </h1>
                <span className="px-2 py-0.5 bg-[#22C55E]/20 text-[#22C55E] text-[10px] font-bold rounded-full border border-[#22C55E]/30">
                  LIVE SESSION
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Textile Presentation Competition 2026 Control Center</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Live Google Sheet Status Pill */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-400 text-xs font-bold">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>Live Sheet Active ({presentationData.length} Teams)</span>
              {lastSyncTime && (
                <span className="text-[10px] text-emerald-500/70 border-l border-emerald-500/20 pl-2">
                  {lastSyncTime}
                </span>
              )}
            </div>

            <button
              onClick={() => fetchData(false)}
              disabled={isLoadingData}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white rounded-lg shadow-sm transition flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
              title="Force sync latest registrations directly from Google Sheet"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoadingData ? 'animate-spin' : ''}`} />
              <span>{isLoadingData ? 'Syncing...' : 'Sync Live Sheet'}</span>
            </button>

            <button
              onClick={handleLogout}
              className="px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-bold rounded-lg border border-rose-500/30 transition flex items-center gap-1.5 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {syncStatusMessage && (
          <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-semibold flex items-center justify-between animate-in fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#22C55E]" />
              <span>{syncStatusMessage}</span>
            </div>
            <button onClick={() => setSyncStatusMessage('')} className="text-emerald-600 hover:text-emerald-900 text-xs font-bold cursor-pointer">
              Dismiss
            </button>
          </div>
        )}

        {/* Security Alert Banner if using default PIN */}
        {isDefaultPassword && (
          <div className="mb-4 p-4 bg-amber-50 border border-amber-300 rounded-2xl text-xs text-amber-900 font-medium flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-2.5">
              <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0" />
              <div>
                <b className="font-bold text-amber-950">Security Notice:</b> You are logged in with default credentials. Please update your password in Settings to protect participant data.
              </div>
            </div>
            <button
              onClick={() => setActiveTab('settings')}
              className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl transition cursor-pointer shrink-0 text-xs shadow-xs"
            >
              Change Password Now
            </button>
          </div>
        )}

        {/* METRICS SUMMARY CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Submissions</span>
              <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                <Users className="w-5 h-5" />
              </div>
            </div>
            <div className="text-2xl font-black text-slate-900 font-display">
              {totalP + totalB}
            </div>
            <div className="text-[11px] text-slate-500 mt-1 flex items-center justify-between font-medium">
              <span>Teams: <b>{totalP}</b></span>
              <span>Blitz: <b>{totalB}</b></span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Verified / Approved</span>
              <div className="p-2 bg-emerald-50 text-[#22C55E] rounded-xl">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </div>
            <div className="text-2xl font-black text-emerald-700 font-display">
              {pVerified + bApproved}
            </div>
            <div className="text-[11px] text-slate-500 mt-1 flex items-center justify-between font-medium">
              <span>Presentation: <b>{pVerified}</b></span>
              <span>Blitz: <b>{bApproved}</b></span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Pending Verification</span>
              <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
                <Clock className="w-5 h-5" />
              </div>
            </div>
            <div className="text-2xl font-black text-amber-700 font-display">
              {pPending + bPending}
            </div>
            <div className="text-[11px] text-slate-500 mt-1 flex items-center justify-between font-medium">
              <span>Presentation: <b>{pPending}</b></span>
              <span>Blitz: <b>{bPending}</b></span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Collected Revenue</span>
              <div className="p-2 bg-purple-50 text-purple-600 rounded-xl">
                <DollarSign className="w-5 h-5" />
              </div>
            </div>
            <div className="text-2xl font-black text-purple-900 font-display">
              ৳ {totalCollected.toLocaleString()} BDT
            </div>
            <div className="text-[11px] text-slate-500 mt-1 font-medium">
              510 BDT / Team • 49 BDT / Blitz
            </div>
          </div>
        </div>

        {/* NAVIGATION TABS */}
        <div className="bg-white rounded-2xl border border-slate-200 p-2 mb-6 flex flex-wrap gap-1 shadow-xs">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'overview'
                ? 'bg-[#0A192F] text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <FileText className="w-4 h-4 text-[#22C55E]" />
            <span>Overview & Stats</span>
          </button>

          <button
            onClick={() => setActiveTab('presentation')}
            className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'presentation'
                ? 'bg-[#0A192F] text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Users className="w-4 h-4 text-blue-400" />
            <span>Textile Presentation ({presentationData.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('blitz')}
            className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'blitz'
                ? 'bg-[#0A192F] text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Blitz Writing ({blitzData.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition flex items-center gap-2 cursor-pointer ml-auto ${
              activeTab === 'settings'
                ? 'bg-[#0A192F] text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Settings className="w-4 h-4 text-slate-400" />
            <span>Sheet Settings</span>
          </button>
        </div>

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
              <h2 className="text-lg font-bold text-slate-900 mb-4 font-display flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#22C55E]" />
                <span>Quick Actions & Export Center</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <button
                  onClick={exportPresentationCSV}
                  className="p-4 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-left transition flex items-center gap-3 group cursor-pointer"
                >
                  <div className="p-3 bg-blue-100 text-blue-700 rounded-lg group-hover:scale-105 transition">
                    <Download className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">Export Presentation CSV</div>
                    <div className="text-[11px] text-slate-500">Download all team submissions</div>
                  </div>
                </button>

                <button
                  onClick={exportBlitzCSV}
                  className="p-4 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-left transition flex items-center gap-3 group cursor-pointer"
                >
                  <div className="p-3 bg-amber-100 text-amber-700 rounded-lg group-hover:scale-105 transition">
                    <Download className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">Export Blitz Writing CSV</div>
                    <div className="text-[11px] text-slate-500">Download individual submissions</div>
                  </div>
                </button>

                <button
                  onClick={onOpenGoogleSheetModal}
                  className="p-4 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-left transition flex items-center gap-3 group cursor-pointer"
                >
                  <div className="p-3 bg-emerald-100 text-emerald-700 rounded-lg group-hover:scale-105 transition">
                    <Database className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">Configure Google Sheet</div>
                    <div className="text-[11px] text-slate-500">View 25-column mapping guide</div>
                  </div>
                </button>
              </div>
            </div>

            {/* Recent Registrations Table Preview */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-bold text-slate-900 font-display">Recent Activity</h2>
                <button
                  onClick={() => setActiveTab('presentation')}
                  className="text-xs font-bold text-[#16A34A] hover:underline cursor-pointer"
                >
                  View All Registrations →
                </button>
              </div>

              {presentationData.length === 0 && blitzData.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-xs">
                  No active registration records found in current memory. Click "Sync Sheet" to load from Google Sheet.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider bg-slate-50">
                        <th className="py-2.5 px-3">Reg ID</th>
                        <th className="py-2.5 px-3">Segment</th>
                        <th className="py-2.5 px-3">Name / Team</th>
                        <th className="py-2.5 px-3">Transaction ID</th>
                        <th className="py-2.5 px-3">Status</th>
                        <th className="py-2.5 px-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
                      {presentationData.slice(0, 5).map((p, idx) => (
                        <tr key={`recent-p-${p.registrationId || 'p'}-${idx}`} className="hover:bg-slate-50/80 transition">
                          <td className="py-2.5 px-3 font-mono font-bold text-slate-900">{p.registrationId || 'N/A'}</td>
                          <td className="py-2.5 px-3"><span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-md font-bold text-[10px]">Presentation</span></td>
                          <td className="py-2.5 px-3 font-bold text-slate-900">{p.teamName || p.leaderName || 'N/A'}</td>
                          <td className="py-2.5 px-3 font-mono text-slate-600">{p.transactionId || 'N/A'}</td>
                          <td className="py-2.5 px-3">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                              ['verified', 'paid', 'approved'].includes((p.paymentStatus || '').toLowerCase())
                                ? 'bg-emerald-100 text-emerald-800'
                                : p.paymentStatus === 'Rejected'
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}>
                              {p.paymentStatus || 'Pending'}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-right">
                            <button
                              onClick={() => setSelectedPRecord(p)}
                              className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 text-[11px] font-bold rounded-lg transition cursor-pointer"
                            >
                              View
                            </button>
                          </td>
                        </tr>
                      ))}
                      {blitzData.slice(0, 5).map((b, idx) => (
                        <tr key={`recent-b-${b.registrationId || 'b'}-${idx}`} className="hover:bg-slate-50/80 transition">
                          <td className="py-2.5 px-3 font-mono font-bold text-slate-900">{b.registrationId || 'N/A'}</td>
                          <td className="py-2.5 px-3"><span className="px-2 py-0.5 bg-amber-50 text-amber-700 rounded-md font-bold text-[10px]">Blitz Writing</span></td>
                          <td className="py-2.5 px-3 font-bold text-slate-900">{b.fullName || 'N/A'}</td>
                          <td className="py-2.5 px-3 font-mono text-slate-600">{b.transactionId || 'N/A'}</td>
                          <td className="py-2.5 px-3">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                              ['approved', 'verified', 'paid'].includes((b.paymentStatus || '').toLowerCase())
                                ? 'bg-emerald-100 text-emerald-800'
                                : b.paymentStatus === 'Rejected'
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}>
                              {b.paymentStatus || 'Pending'}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-right">
                            <button
                              onClick={() => setSelectedBRecord(b)}
                              className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 text-[11px] font-bold rounded-lg transition cursor-pointer"
                            >
                              View
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: TEXTILE PRESENTATION */}
        {activeTab === 'presentation' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900 font-display">Textile Presentation Submissions</h2>
                <p className="text-xs text-slate-500">Manage team registrations, payment approvals, and entry passes</p>
              </div>

              <button
                onClick={exportPresentationCSV}
                className="px-3.5 py-2 bg-[#0A192F] hover:bg-[#122846] text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-[#22C55E]" />
                <span>Export Presentation CSV</span>
              </button>
            </div>

            {/* Filter & Search Header */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={pSearch}
                  onChange={(e) => setPSearch(e.target.value)}
                  placeholder="Search by Reg ID, Team Name, Leader Roll, bKash Trx..."
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#22C55E]"
                />
              </div>

              <select
                value={pStatusFilter}
                onChange={(e) => setPStatusFilter(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:bg-white focus:outline-none"
              >
                <option value="all">All Payment Statuses</option>
                <option value="pending">Pending Only</option>
                <option value="verified">Verified / Paid Only</option>
                <option value="rejected">Rejected Only</option>
              </select>
            </div>

            {/* Table */}
            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-3 px-3">Reg ID</th>
                    <th className="py-3 px-3">Date</th>
                    <th className="py-3 px-3">Team Name</th>
                    <th className="py-3 px-3">Leader Name & Roll</th>
                    <th className="py-3 px-3">bKash Trx ID</th>
                    <th className="py-3 px-3">Payment Status</th>
                    <th className="py-3 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
                  {filteredPresentation.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-8 text-slate-400">
                        No Presentation registrations matching criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredPresentation.map((p, idx) => {
                      const status = p.paymentStatus || 'Pending';
                      const isVerified = ['verified', 'paid', 'approved'].includes(status.toLowerCase());
                      const isRejected = status.toLowerCase() === 'rejected';

                      return (
                        <tr key={`p-row-${p.registrationId || 'p'}-${idx}`} className="hover:bg-slate-50/80 transition">
                          <td className="py-3 px-3 font-mono font-bold text-slate-900">{p.registrationId}</td>
                          <td className="py-3 px-3 text-slate-500 text-[11px]">{p.submissionDate ? new Date(p.submissionDate).toLocaleDateString() : 'N/A'}</td>
                          <td className="py-3 px-3 font-bold text-slate-900">{p.teamName || 'N/A'}</td>
                          <td className="py-3 px-3">
                            <div className="font-bold text-slate-900">{p.leaderName || p.formData?.leader?.name || 'N/A'}</div>
                            <div className="text-[11px] text-slate-500 font-mono">Roll: {p.leaderRoll || p.formData?.leader?.roll || 'N/A'}</div>
                          </td>
                          <td className="py-3 px-3 font-mono text-slate-700">{p.transactionId || p.formData?.payment?.transactionId || 'N/A'}</td>
                          <td className="py-3 px-3">
                            <select
                              disabled={updatingId === p.registrationId}
                              value={isVerified ? 'Verified' : isRejected ? 'Rejected' : 'Pending'}
                              onChange={(e) => handleUpdatePaymentStatus(p.registrationId, e.target.value)}
                              className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition cursor-pointer ${
                                isVerified
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                  : isRejected
                                  ? 'bg-rose-50 text-rose-800 border-rose-300'
                                  : 'bg-amber-50 text-amber-800 border-amber-300'
                              }`}
                            >
                              <option value="Pending">⏳ Pending</option>
                              <option value="Verified">✅ Verified / Paid</option>
                              <option value="Rejected">❌ Rejected</option>
                            </select>
                          </td>
                          <td className="py-3 px-3 text-right space-x-1">
                            <button
                              onClick={() => setSelectedPRecord(p)}
                              className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-lg transition cursor-pointer"
                              title="View Full Team Details"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => initiateDelete({
                                id: p.registrationId,
                                name: p.teamName || p.leaderName || p.registrationId,
                                details: `Leader: ${p.leaderName || 'N/A'} (Roll: ${p.leaderRoll || 'N/A'})`,
                                category: 'Presentation'
                              })}
                              className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold rounded-lg transition cursor-pointer"
                              title="Delete Record"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: BLITZ WRITING */}
        {activeTab === 'blitz' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900 font-display">Textile Blitz Writing Submissions</h2>
                <p className="text-xs text-slate-500">Manage individual blitz writing registrations and approvals</p>
              </div>

              <button
                onClick={exportBlitzCSV}
                className="px-3.5 py-2 bg-[#0A192F] hover:bg-[#122846] text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-[#22C55E]" />
                <span>Export Blitz CSV</span>
              </button>
            </div>

            {/* Filter & Search Header */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={bSearch}
                  onChange={(e) => setBSearch(e.target.value)}
                  placeholder="Search by Reg ID, Name, Student ID, Email, bKash Trx..."
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#22C55E]"
                />
              </div>

              <select
                value={bStatusFilter}
                onChange={(e) => setBStatusFilter(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:bg-white focus:outline-none"
              >
                <option value="all">All Payment Statuses</option>
                <option value="pending">Pending Only</option>
                <option value="verified">Approved / Paid Only</option>
                <option value="rejected">Rejected Only</option>
              </select>
            </div>

            {/* Table */}
            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-3 px-3">Reg ID</th>
                    <th className="py-3 px-3">Date</th>
                    <th className="py-3 px-3">Participant Name</th>
                    <th className="py-3 px-3">Student ID & Dept</th>
                    <th className="py-3 px-3">bKash Trx ID</th>
                    <th className="py-3 px-3">Payment Status</th>
                    <th className="py-3 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700">
                  {filteredBlitz.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-8 text-slate-400">
                        No Blitz Writing registrations matching criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredBlitz.map((b, idx) => {
                      const status = b.paymentStatus || 'Pending';
                      const isApproved = ['approved', 'verified', 'paid'].includes(status.toLowerCase());
                      const isRejected = status.toLowerCase() === 'rejected';

                      return (
                        <tr key={`b-row-${b.registrationId || 'b'}-${idx}`} className="hover:bg-slate-50/80 transition">
                          <td className="py-3 px-3 font-mono font-bold text-slate-900">{b.registrationId}</td>
                          <td className="py-3 px-3 text-slate-500 text-[11px]">{b.submissionDate ? new Date(b.submissionDate).toLocaleDateString() : 'N/A'}</td>
                          <td className="py-3 px-3 font-bold text-slate-900">{b.fullName || 'N/A'}</td>
                          <td className="py-3 px-3">
                            <div className="font-bold text-slate-900">{b.studentId || 'N/A'}</div>
                            <div className="text-[11px] text-slate-500">Batch {b.batch} • {b.department}</div>
                          </td>
                          <td className="py-3 px-3 font-mono text-slate-700">{b.transactionId || 'N/A'}</td>
                          <td className="py-3 px-3">
                            <select
                              disabled={updatingId === b.registrationId}
                              value={isApproved ? 'Approved' : isRejected ? 'Rejected' : 'Pending'}
                              onChange={(e) => handleUpdatePaymentStatus(b.registrationId, e.target.value)}
                              className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition cursor-pointer ${
                                isApproved
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                  : isRejected
                                  ? 'bg-rose-50 text-rose-800 border-rose-300'
                                  : 'bg-amber-50 text-amber-800 border-amber-300'
                              }`}
                            >
                              <option value="Pending">⏳ Pending</option>
                              <option value="Approved">✅ Approved / Paid</option>
                              <option value="Rejected">❌ Rejected</option>
                            </select>
                          </td>
                          <td className="py-3 px-3 text-right space-x-1">
                            <button
                              onClick={() => setSelectedBRecord(b)}
                              className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-lg transition cursor-pointer"
                              title="View Full Participant Details"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => initiateDelete({
                                id: b.registrationId,
                                name: b.fullName || b.studentId || b.registrationId,
                                details: `Roll: ${b.studentId || 'N/A'} • Batch ${b.batch} (${b.department})`,
                                category: 'Blitz'
                              })}
                              className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold rounded-lg transition cursor-pointer"
                              title="Delete Record"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: SETTINGS & GOOGLE SHEET */}
        {activeTab === 'settings' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900 font-display flex items-center gap-2">
                <Database className="w-5 h-5 text-[#22C55E]" />
                <span>Google Sheet & Webhook Integration</span>
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Configure your Google Apps Script Web App URL to sync all registrations live with Google Sheets.
              </p>
            </div>

            {/* Quick URL Input & Connection Manager */}
            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                Active Google Apps Script Web App URL:
              </label>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={localStorage.getItem('tpc2026_google_script_url') || ''}
                  onChange={(e) => {
                    const clean = e.target.value.trim();
                    localStorage.setItem('tpc2026_google_script_url', clean);
                    fetch('/api/config/script-url', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ scriptUrl: clean })
                    }).catch(() => {});
                  }}
                  placeholder="https://script.google.com/macros/s/AKfycb.../exec"
                  className="flex-1 px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#22C55E]"
                />
                <button
                  onClick={() => fetchData(true)}
                  disabled={isLoadingData}
                  className="px-4 py-2.5 bg-[#0A192F] hover:bg-[#122846] text-white text-xs font-bold rounded-xl transition flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                >
                  <RefreshCw className={`w-4 h-4 text-[#22C55E] ${isLoadingData ? 'animate-spin' : ''}`} />
                  <span>Save & Sync Live</span>
                </button>
              </div>

              <div className="pt-2 flex flex-wrap items-center gap-3">
                <button
                  onClick={async () => {
                    try {
                      const res = await fetch('/api/script-code');
                      const text = await res.text();
                      await navigator.clipboard.writeText(text);
                      setCopiedScriptCode(true);
                      setTimeout(() => setCopiedScriptCode(false), 2500);
                    } catch (_) {
                      alert('Could not copy automatically. You can copy google-apps-script.js directly from codebase.');
                    }
                  }}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold rounded-xl transition flex items-center gap-2 shadow-xs cursor-pointer"
                >
                  {copiedScriptCode ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedScriptCode ? 'Script Code Copied!' : 'Copy Google Apps Script Code'}</span>
                </button>

                <button
                  onClick={onOpenGoogleSheetModal}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold rounded-xl transition flex items-center gap-2 cursor-pointer"
                >
                  <Settings className="w-4 h-4 text-slate-600" />
                  <span>Open Setup Wizard</span>
                </button>
              </div>
            </div>

            {/* Step-by-Step Guide for Google Sheet */}
            <div className="p-5 bg-emerald-50/70 border border-emerald-200 rounded-2xl space-y-3">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#16A34A]" />
                How to Connect a Brand New Google Sheet (4 Easy Steps):
              </h3>
              <ol className="text-xs text-slate-700 space-y-2 list-decimal pl-4 font-medium leading-relaxed">
                <li>Open a new spreadsheet at <a href="https://sheets.new" target="_blank" rel="noreferrer" className="text-emerald-700 font-bold underline">sheets.new</a></li>
                <li>Go to menu: <b>Extensions &gt; Apps Script</b></li>
                <li>Delete default code, click the <b>Copy Google Apps Script Code</b> button above, paste it, and press <kbd className="bg-white px-1.5 py-0.5 rounded border border-slate-300 text-[10px] font-mono">Ctrl + S</kbd></li>
                <li>Click <b>Deploy &gt; New deployment</b> (Type: <i>Web app</i>, Who has access: <i>Anyone</i>), copy the Web App URL (ends in <code>/exec</code>), and paste it above!</li>
              </ol>
            </div>

            {/* ADMIN SECURITY & ACCESS CONTROLS SECTION */}
            <div className="pt-4 border-t border-slate-200">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900 font-display flex items-center gap-2">
                    <Shield className="w-5 h-5 text-emerald-600" />
                    <span>Admin Security & Access Controls</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Protect the administrative panel with custom passwords, rate limiting, and session controls.
                  </p>
                </div>
              </div>

              {/* Security Status Badges */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                    <Key className="w-3.5 h-3.5 text-blue-600" />
                    <span>Password Status</span>
                  </div>
                  <div className="text-xs font-extrabold text-slate-900">
                    <span className="text-emerald-700 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Active & Protected
                    </span>
                  </div>
                </div>

                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-purple-600" />
                    <span>Auto-Lock Timeout</span>
                  </div>
                  <div className="text-xs font-bold text-slate-900 flex items-center gap-1">
                    <Check className="w-3.5 h-3.5 text-emerald-600" /> 30 Minutes Inactivity Lock
                  </div>
                </div>

                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Brute-Force Guard</span>
                  </div>
                  <div className="text-xs font-bold text-slate-900 flex items-center gap-1">
                    <Check className="w-3.5 h-3.5 text-emerald-600" /> 5 Attempts Max (10m Lockout)
                  </div>
                </div>
              </div>

              {/* Change Password Form */}
              <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-4">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <Lock className="w-4 h-4 text-slate-700" />
                  <span>Change Admin Password / PIN</span>
                </h4>

                {pwdChangeMsg && (
                  <div
                    className={`p-3 rounded-xl text-xs font-medium flex items-center gap-2 ${
                      pwdChangeMsg.type === 'success'
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : 'bg-rose-50 text-rose-800 border border-rose-200'
                    }`}
                  >
                    {pwdChangeMsg.type === 'success' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                    )}
                    <span>{pwdChangeMsg.text}</span>
                  </div>
                )}

                <form onSubmit={handleChangePassword} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Current Password:
                      </label>
                      <input
                        type="password"
                        value={currentPwd}
                        onChange={(e) => setCurrentPwd(e.target.value)}
                        placeholder="Current password"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#22C55E]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        New Password (min 6 chars):
                      </label>
                      <input
                        type="password"
                        value={newPwd}
                        onChange={(e) => setNewPwd(e.target.value)}
                        placeholder="Enter new password"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#22C55E]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Confirm New Password:
                      </label>
                      <input
                        type="password"
                        value={confirmPwd}
                        onChange={(e) => setConfirmPwd(e.target.value)}
                        placeholder="Confirm new password"
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#22C55E]"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={isChangingPwd}
                      className="px-5 py-2.5 bg-[#0A192F] hover:bg-[#122846] text-white text-xs font-extrabold rounded-xl transition shadow-xs flex items-center gap-2 cursor-pointer"
                    >
                      {isChangingPwd ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#22C55E]" />
                          <span>Updating Password...</span>
                        </>
                      ) : (
                        <>
                          <Check className="w-3.5 h-3.5 text-[#22C55E]" />
                          <span>Save New Password</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>

              {/* Permanent Server Environment Variable Tip */}
              <div className="mt-4 p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-600 space-y-1.5">
                <div className="font-bold text-slate-800 flex items-center gap-1.5">
                  <Key className="w-4 h-4 text-emerald-600" />
                  <span>Pro Tip for Production Deployment:</span>
                </div>
                <p>
                  To set a permanent password across container redeployments, define the environment variable{' '}
                  <code className="bg-white px-1.5 py-0.5 rounded border border-slate-300 font-mono text-[11px] text-slate-900">
                    ADMIN_PASSWORD
                  </code>{' '}
                  in your server or hosting environment settings.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* MODAL 1: VIEW PRESENTATION TEAM DETAILS */}
      {selectedPRecord && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 border border-slate-200 shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="px-2.5 py-1 bg-blue-50 text-blue-800 text-[10px] font-extrabold rounded-md uppercase">
                  Textile Presentation Team
                </span>
                <h3 className="text-lg font-black text-slate-900 font-display mt-1">
                  {selectedPRecord.teamName || 'Team Details'}
                </h3>
              </div>
              <button
                onClick={() => setSelectedPRecord(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <div><span className="text-slate-500 font-bold">Registration ID:</span> <span className="font-mono font-bold text-slate-900">{selectedPRecord.registrationId}</span></div>
              <div><span className="text-slate-500 font-bold">Payment Status:</span> <span className="font-extrabold text-emerald-700">{selectedPRecord.paymentStatus || 'Pending'}</span></div>
              <div><span className="text-slate-500 font-bold">bKash Number:</span> <span className="font-mono">{selectedPRecord.bkashNumber || selectedPRecord.formData?.payment?.bkashNumber || 'N/A'}</span></div>
              <div><span className="text-slate-500 font-bold">Transaction ID:</span> <span className="font-mono font-bold text-slate-900">{selectedPRecord.transactionId || selectedPRecord.formData?.payment?.transactionId || 'N/A'}</span></div>
            </div>

            {/* Team Leader & Members */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Team Members</h4>

              <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-100 text-xs">
                <div className="font-bold text-slate-900 text-sm">👑 Leader: {selectedPRecord.leaderName || selectedPRecord.formData?.leader?.name}</div>
                <div className="text-slate-600 mt-0.5">Roll: <b>{selectedPRecord.leaderRoll || selectedPRecord.formData?.leader?.roll}</b> • Dept: {selectedPRecord.leaderDepartment || selectedPRecord.formData?.leader?.department}</div>
                <div className="text-slate-600 mt-0.5">WhatsApp: {selectedPRecord.leaderWhatsApp || selectedPRecord.formData?.leader?.whatsapp} • Email: {selectedPRecord.leaderEmail || selectedPRecord.formData?.leader?.email || 'N/A'}</div>
              </div>

              {(selectedPRecord.member1Name || selectedPRecord.formData?.member1?.name) && (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                  <div className="font-bold text-slate-900">Member 1: {selectedPRecord.member1Name || selectedPRecord.formData?.member1?.name}</div>
                  <div className="text-slate-600 mt-0.5">Roll: <b>{selectedPRecord.member1Roll || selectedPRecord.formData?.member1?.roll}</b> • Dept: {selectedPRecord.member1Department || selectedPRecord.formData?.member1?.department}</div>
                </div>
              )}

              {(selectedPRecord.member2Name || selectedPRecord.formData?.member2?.name) && (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                  <div className="font-bold text-slate-900">Member 2: {selectedPRecord.member2Name || selectedPRecord.formData?.member2?.name}</div>
                  <div className="text-slate-600 mt-0.5">Roll: <b>{selectedPRecord.member2Roll || selectedPRecord.formData?.member2?.roll}</b> • Dept: {selectedPRecord.member2Department || selectedPRecord.formData?.member2?.department}</div>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSelectedPRecord(null)}
                className="px-5 py-2 bg-[#0A192F] text-white text-xs font-bold rounded-xl cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: VIEW BLITZ PARTICIPANT DETAILS */}
      {selectedBRecord && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 border border-slate-200 shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="px-2.5 py-1 bg-amber-50 text-amber-800 text-[10px] font-extrabold rounded-md uppercase">
                  Textile Blitz Writing Entry
                </span>
                <h3 className="text-lg font-black text-slate-900 font-display mt-1">
                  {selectedBRecord.fullName || 'Participant Details'}
                </h3>
              </div>
              <button
                onClick={() => setSelectedBRecord(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div><span className="text-slate-500 font-bold">Registration ID:</span> <span className="font-mono font-bold text-slate-900">{selectedBRecord.registrationId}</span></div>
              <div><span className="text-slate-500 font-bold">Student ID:</span> <span className="font-mono font-bold">{selectedBRecord.studentId}</span></div>
              <div><span className="text-slate-500 font-bold">Batch & Dept:</span> Batch {selectedBRecord.batch} • Department of {selectedBRecord.department}</div>
              <div><span className="text-slate-500 font-bold">WhatsApp:</span> {selectedBRecord.whatsapp}</div>
              <div><span className="text-slate-500 font-bold">Email:</span> {selectedBRecord.email}</div>
              <div><span className="text-slate-500 font-bold">Sender bKash:</span> <span className="font-mono">{selectedBRecord.senderBkash}</span></div>
              <div><span className="text-slate-500 font-bold">Transaction ID:</span> <span className="font-mono font-bold text-slate-900">{selectedBRecord.transactionId}</span></div>
              <div><span className="text-slate-500 font-bold">Payment Status:</span> <span className="font-extrabold text-emerald-700">{selectedBRecord.paymentStatus || 'Pending'}</span></div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSelectedBRecord(null)}
                className="px-5 py-2 bg-[#0A192F] text-white text-xs font-bold rounded-xl cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: DELETE CONFIRMATION REQUIRING TYPING 'CONFIRM' */}
      {deleteModalRecord && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 border border-rose-200 shadow-2xl space-y-5 animate-in zoom-in-95">
            {/* Header */}
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                  <Trash2 className="w-5 h-5 text-rose-600" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 font-display">
                    Delete Registration Entry
                  </h3>
                  <span className="text-[11px] font-bold text-rose-600 uppercase tracking-wider">
                    {deleteModalRecord.category} Competition
                  </span>
                </div>
              </div>
              <button
                onClick={() => {
                  if (!isDeletingRecord) {
                    setDeleteModalRecord(null);
                    setDeleteConfirmText('');
                    setDeleteErrorMessage('');
                  }
                }}
                disabled={isDeletingRecord}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-800 transition cursor-pointer disabled:opacity-50"
              >
                ✕
              </button>
            </div>

            {/* Target Entry Details */}
            <div className="p-4 bg-rose-50/80 border border-rose-200 rounded-2xl space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-600">Registration ID:</span>
                <span className="font-mono font-black text-rose-700 bg-white px-2 py-0.5 rounded border border-rose-200">
                  {deleteModalRecord.id}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-600">Entry / Name:</span>
                <span className="font-bold text-slate-900 truncate max-w-[200px]">
                  {deleteModalRecord.name}
                </span>
              </div>
              {deleteModalRecord.details && (
                <div className="text-[11px] text-slate-500 pt-1 border-t border-rose-200">
                  {deleteModalRecord.details}
                </div>
              )}
            </div>

            {/* Danger Warning Notice */}
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <b className="font-bold text-amber-950">Irreversible Action:</b> This registration record will be permanently deleted and cannot be recovered.
              </div>
            </div>

            {/* Type CONFIRM Input Requirement */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700">
                To confirm deletion, type{' '}
                <span className="px-1.5 py-0.5 bg-rose-100 text-rose-700 font-mono font-black rounded border border-rose-300">
                  CONFIRM
                </span>{' '}
                below:
              </label>
              <input
                type="text"
                value={deleteConfirmText}
                onChange={(e) => {
                  setDeleteConfirmText(e.target.value);
                  if (deleteErrorMessage) setDeleteErrorMessage('');
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && deleteConfirmText.trim() === 'CONFIRM' && !isDeletingRecord) {
                    e.preventDefault();
                    handleConfirmDelete();
                  }
                }}
                placeholder="Type CONFIRM to enable delete"
                autoFocus
                disabled={isDeletingRecord}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold tracking-wider text-slate-900 placeholder:font-normal placeholder:tracking-normal focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition"
              />
              {deleteErrorMessage && (
                <p className="text-xs text-rose-600 font-semibold">{deleteErrorMessage}</p>
              )}
            </div>

            {/* Modal Actions */}
            <div className="pt-2 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => {
                  setDeleteModalRecord(null);
                  setDeleteConfirmText('');
                  setDeleteErrorMessage('');
                }}
                disabled={isDeletingRecord}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={deleteConfirmText.trim() !== 'CONFIRM' || isDeletingRecord}
                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white text-xs font-extrabold rounded-xl transition shadow-sm flex items-center gap-2 cursor-pointer"
              >
                {isDeletingRecord ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Deleting Entry...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Permanently Delete</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
