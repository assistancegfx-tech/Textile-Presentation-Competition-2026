import { RegistrationFormData } from '../types';

export const DEPARTMENTS = [
  'Yarn Engineering',
  'Fabric Engineering',
  'Wet Process Engineering',
  'Apparel Engineering'
] as const;

/**
 * Validates Bangladesh mobile phone numbers.
 * Allowed formats:
 * - 013XXXXXXXX, 014XXXXXXXX, 015XXXXXXXX, 016XXXXXXXX, 017XXXXXXXX, 018XXXXXXXX, 019XXXXXXXX
 * - +8801XXXXXXXXX or 8801XXXXXXXXX
 */
export function validateBangladeshPhone(phone: string): boolean {
  if (!phone) return false;
  const cleaned = phone.replace(/[\s\-()]/g, '');
  const regex = /^(?:\+?88)?01[3-9]\d{8}$/;
  return regex.test(cleaned);
}

/**
 * Normalizes Bangladesh phone number to 01XXXXXXXXX format for consistent database storage
 */
export function normalizeBangladeshPhone(phone: string): string {
  const cleaned = phone.replace(/[\s\-()]/g, '');
  if (cleaned.startsWith('+88')) return cleaned.slice(3);
  if (cleaned.startsWith('88') && cleaned.length === 13) return cleaned.slice(2);
  return cleaned;
}

/**
 * Validates transaction ID format
 * bKash Transaction IDs are typically alphanumeric, 8-12 characters long (e.g. BL92A87X3)
 */
export function validateTransactionId(trxId: string): boolean {
  if (!trxId) return false;
  const cleaned = trxId.trim();
  return cleaned.length >= 6 && /^[a-zA-Z0-9]+$/.test(cleaned);
}

/**
 * Validates standard email address format
 */
export function validateEmail(email: string): boolean {
  if (!email) return false;
  const cleaned = email.trim();
  const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return regex.test(cleaned);
}

/**
 * Client-side image processor
 * Preserves 100% original image quality without lossy downscaling/compression.
 * Enforces maximum 5 MB file size limit and validates image integrity.
 */
export async function processAndCompressImage(file: File): Promise<{
  base64: string;
  previewUrl: string;
  fileName: string;
  sizeBytes: number;
}> {
  // Validate image format
  const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
  if (!validTypes.includes(file.type.toLowerCase()) && !file.type.startsWith('image/')) {
    throw new Error('Only JPG, JPEG, PNG, and WEBP image formats are accepted.');
  }

  // Strictly enforce 5MB maximum file size limit
  const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
  if (file.size > MAX_FILE_SIZE_BYTES) {
    const sizeInMb = (file.size / (1024 * 1024)).toFixed(2);
    throw new Error(`Image size is ${sizeInMb}MB, which exceeds the maximum limit of 5MB. Please choose a photo under 5MB.`);
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (readerEvent) => {
      const dataUrl = readerEvent.target?.result as string;
      if (!dataUrl) {
        reject(new Error('Failed to read image file data.'));
        return;
      }

      // Verify that the file can be loaded and decoded as a valid image
      const img = new Image();
      img.onload = () => {
        // Preserves 100% original uncompressed quality without canvas downsampling
        resolve({
          base64: dataUrl,
          previewUrl: dataUrl,
          fileName: file.name,
          sizeBytes: file.size
        });
      };

      img.onerror = () => {
        reject(new Error('Selected file is not a valid image. Please choose another photo.'));
      };

      img.src = dataUrl;
    };

    reader.onerror = () => {
      reject(new Error('Error reading selected file.'));
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Generates a clean, crisp canvas-based demo avatar Data URL
 */
export function createDemoAvatarDataUrl(initials: string, bgColor: string = '#0A192F', accentColor: string = '#22C55E'): string {
  if (typeof document === 'undefined') return '';
  const canvas = document.createElement('canvas');
  canvas.width = 320;
  canvas.height = 320;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    // Rich gradient background
    const grad = ctx.createLinearGradient(0, 0, 320, 320);
    grad.addColorStop(0, bgColor);
    grad.addColorStop(1, '#081426');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 320, 320);

    // Decorative outer ring
    ctx.strokeStyle = accentColor;
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.arc(160, 160, 135, 0, Math.PI * 2);
    ctx.stroke();

    // Subtle inner glowing border
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(160, 160, 120, 0, Math.PI * 2);
    ctx.stroke();

    // Initials text
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 100px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(initials, 160, 160);
  }
  return canvas.toDataURL('image/jpeg', 0.85);
}

/**
 * Generates high quality realistic demo registration form data for quick testing and demonstration.
 */
export function getDemoFormData(): RegistrationFormData {
  // Generate a random dynamic roll & transaction suffix so multiple demo submissions don't trigger duplicate error
  const randomSuffix = Math.floor(100 + Math.random() * 900);
  const randomTrx = '8N' + Math.random().toString(36).substring(2, 8).toUpperCase();

  const leaderAvatar = createDemoAvatarDataUrl('TA', '#0A192F', '#22C55E');
  const m1Avatar = createDemoAvatarDataUrl('NJ', '#102A43', '#0EA5E9');
  const m2Avatar = createDemoAvatarDataUrl('SM', '#1E293B', '#F59E0B');

  const demoTeamNames = [
    'Weaver Dynamics',
    'TexGenius BTEC',
    'Fiber Innovators',
    'EcoTextile Pioneers',
    'SpinTech Masters',
    'Apex Weavers'
  ];
  const randomTeamName = demoTeamNames[Math.floor(Math.random() * demoTeamNames.length)];

  return {
    teamName: randomTeamName,
    leader: {
      name: 'Tanvir Ahmed',
      roll: `132${randomSuffix}`,
      department: 'Wet Process Engineering',
      whatsapp: '01712345678',
      facebook: 'https://facebook.com/tanvir.ahmed.btec',
      email: `tanvir.btec${randomSuffix}@gmail.com`,
      photoBase64: leaderAvatar,
      photoPreview: leaderAvatar,
      photoName: 'tanvir_leader_photo.jpg',
      photoSize: 15420
    },
    member1: {
      name: 'Nusrat Jahan',
      roll: `133${randomSuffix}`,
      department: 'Fabric Engineering',
      whatsapp: '01812345679',
      facebook: 'https://facebook.com/nusrat.jahan.textile',
      photoBase64: m1Avatar,
      photoPreview: m1Avatar,
      photoName: 'nusrat_member1_photo.jpg',
      photoSize: 14880
    },
    member2: {
      name: 'Shakil Mahmud',
      roll: `134${randomSuffix}`,
      department: 'Yarn Engineering',
      whatsapp: '01912345680',
      facebook: 'https://facebook.com/shakil.mahmud.ccb',
      photoBase64: m2Avatar,
      photoPreview: m2Avatar,
      photoName: 'shakil_member2_photo.jpg',
      photoSize: 15110
    },
    payment: {
      bkashNumber: '01798765432',
      transactionId: randomTrx
    }
  };
}

