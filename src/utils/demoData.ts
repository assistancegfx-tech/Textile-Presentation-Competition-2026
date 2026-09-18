import { RegistrationFormData } from '../types';

/**
 * Creates an in-browser sample avatar photo using HTML5 canvas
 * so file uploads in demo fillup have complete, valid image data.
 */
function createDemoAvatar(initials: string, roleName: string, bgColor: string): {
  base64: string;
  previewUrl: string;
  fileName: string;
  sizeBytes: number;
} {
  const canvas = document.createElement('canvas');
  canvas.width = 400;
  canvas.height = 400;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    // Gradient background
    const grad = ctx.createLinearGradient(0, 0, 400, 400);
    grad.addColorStop(0, bgColor);
    grad.addColorStop(1, '#0A192F');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 400, 400);

    // Decorative circle
    ctx.beginPath();
    ctx.arc(200, 175, 105, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.fill();

    // Initials
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 80px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(initials, 200, 175);

    // Subtitle badges
    ctx.fillStyle = '#22C55E';
    ctx.font = 'bold 20px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText('BTEC 2026', 200, 315);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.font = '500 17px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText(roleName, 200, 345);
  }

  const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
  return {
    base64: dataUrl,
    previewUrl: dataUrl,
    fileName: `${roleName.toLowerCase().replace(/\s+/g, '_')}_demo.jpg`,
    sizeBytes: Math.round((dataUrl.length * 3) / 4)
  };
}

/**
 * Returns a complete, valid team registration dataset for quick testing
 */
export function getDemoFormData(): RegistrationFormData {
  // Generate random digits to avoid duplicate roll or transaction ID collisions on repeated tests
  const randomSuffix = Math.floor(100 + Math.random() * 800);
  const randomTrx = 'TXN' + Math.random().toString(36).substring(2, 7).toUpperCase() + Math.floor(10 + Math.random() * 89);

  const leaderPhoto = createDemoAvatar('TR', 'Team Leader', '#1E3A8A');
  const member1Photo = createDemoAvatar('FA', 'Member 1', '#065F46');
  const member2Photo = createDemoAvatar('TH', 'Member 2', '#6D28D9');

  return {
    leader: {
      name: 'Tahmidur Rahman',
      roll: `2022${randomSuffix}`,
      department: 'Yarn Engineering',
      whatsapp: '01711223344',
      facebook: 'https://facebook.com/tahmidur.rahman.btec',
      photoBase64: leaderPhoto.base64,
      photoPreview: leaderPhoto.previewUrl,
      photoName: leaderPhoto.fileName,
      photoSize: leaderPhoto.sizeBytes
    },
    member1: {
      name: 'Fariha Anjum',
      roll: `2022${randomSuffix + 1}`,
      department: 'Fabric Engineering',
      whatsapp: '01819887766',
      facebook: 'https://facebook.com/fariha.anjum.btec',
      photoBase64: member1Photo.base64,
      photoPreview: member1Photo.previewUrl,
      photoName: member1Photo.fileName,
      photoSize: member1Photo.sizeBytes
    },
    member2: {
      name: 'Tanvir Hossain',
      roll: `2022${randomSuffix + 2}`,
      department: 'Wet Process Engineering',
      whatsapp: '01915443322',
      facebook: 'https://facebook.com/tanvir.hossain.btec',
      photoBase64: member2Photo.base64,
      photoPreview: member2Photo.previewUrl,
      photoName: member2Photo.fileName,
      photoSize: member2Photo.sizeBytes
    },
    payment: {
      bkashNumber: '01711223344',
      transactionId: randomTrx
    }
  };
}
