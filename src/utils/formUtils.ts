export const DEPARTMENTS = [
  'Yarn Engineering',
  'Fabric Engineering',
  'Wet Process Engineering',
  'Apparel Engineering',
  'Industrial & Production Engineering (IPE)',
  'Textile Engineering (General)'
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
 * Client-side image resizer and compressor
 * Takes a File (JPG/PNG), creates an image preview, resizes it to max 800x800,
 * and returns clean base64 dataURL + preview.
 */
export async function processAndCompressImage(file: File): Promise<{
  base64: string;
  previewUrl: string;
  fileName: string;
  sizeBytes: number;
}> {
  // Validate format
  const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];
  if (!validTypes.includes(file.type.toLowerCase())) {
    throw new Error('Only JPG, JPEG, and PNG image formats are accepted.');
  }

  // Check initial size cap (e.g. 8MB)
  if (file.size > 8 * 1024 * 1024) {
    throw new Error('Image file is too large. Please select a photo under 8MB.');
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (readerEvent) => {
      const img = new Image();
      img.onload = () => {
        // Canvas compression for fast network & Google Drive upload
        const MAX_WIDTH = 480;
        const MAX_HEIGHT = 480;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height = Math.round((height * MAX_WIDTH) / width);
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width = Math.round((width * MAX_HEIGHT) / height);
            height = MAX_HEIGHT;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          reject(new Error('Failed to process image canvas.'));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        // Compress to efficient JPEG (0.75) for fast upload under Vercel execution limits
        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.75);

        // Estimate size
        const head = 'data:image/jpeg;base64,';
        const sizeBytes = Math.round(((compressedBase64.length - head.length) * 3) / 4);

        resolve({
          base64: compressedBase64,
          previewUrl: compressedBase64,
          fileName: file.name,
          sizeBytes
        });
      };

      img.onerror = () => {
        reject(new Error('Failed to load image for compression. Please choose another image.'));
      };

      img.src = readerEvent.target?.result as string;
    };

    reader.onerror = () => {
      reject(new Error('Error reading selected file.'));
    };

    reader.readAsDataURL(file);
  });
}
