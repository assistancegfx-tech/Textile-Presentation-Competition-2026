import { jsPDF } from 'jspdf';
import { RegistrationFormData } from '../types';

export interface RegistrationPdfData {
  registrationId: string;
  submissionDate: string;
  paymentStatus?: string;
  editCount?: number;
  formData: RegistrationFormData;
}

export function buildRegistrationPdfDoc(data: RegistrationPdfData): jsPDF {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;
  const contentWidth = pageWidth - margin * 2;

  // Header Banner Background
  doc.setFillColor(10, 25, 47); // #0A192F Dark Navy
  doc.rect(0, 0, pageWidth, 40, 'F');

  // Accent Green Line
  doc.setFillColor(34, 197, 94); // #22C55E Green
  doc.rect(0, 40, pageWidth, 2.5, 'F');

  // Header Text
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('CAREER CLUB BTEC', margin, 14);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(203, 213, 225); // Slate 300
  doc.text('Barishal Textile Engineering College • Established 2020', margin, 19);

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text('TEXTILE PRESENTATION COMPETITION 2026', margin, 27);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(148, 163, 184);
  doc.text('Official Participant Registration Info & Entry Voucher', margin, 33);

  // Right side header badge: Date & Venue
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.text('EVENT DATE: 04 OCT 2026', pageWidth - margin, 16, { align: 'right' });
  doc.text('VENUE: BTEC Auditorium', pageWidth - margin, 22, { align: 'right' });
  doc.setTextColor(132, 204, 22); // Lime accent
  doc.text('Time: 9:00 AM BST', pageWidth - margin, 28, { align: 'right' });

  // Registration ID Box
  let y = 49;
  doc.setFillColor(248, 250, 252); // Slate 50
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.4);
  doc.roundedRect(margin, y, contentWidth, 24, 2, 2, 'FD');

  // Left column in box: Reg ID & Team Name
  doc.setTextColor(100, 116, 139);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.text('REGISTRATION NUMBER', margin + 6, y + 6);

  doc.setTextColor(15, 23, 42); // Slate 900
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text(data.registrationId, margin + 6, y + 12.5);

  const teamNameText = (data.formData?.teamName || '').trim();
  if (teamNameText) {
    doc.setTextColor(22, 163, 74); // Green
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text(`TEAM: ${teamNameText.substring(0, 30)}`, margin + 6, y + 19);
  }

  // Middle column in box: Submission Date
  doc.setTextColor(100, 116, 139);
  doc.setFontSize(7.5);
  doc.text('SUBMISSION DATE', margin + 75, y + 6);
  doc.setTextColor(51, 65, 85);
  doc.setFontSize(9.5);
  doc.setFont('helvetica', 'normal');
  doc.text(data.submissionDate || new Date().toLocaleDateString(), margin + 75, y + 13);

  // Right column in box: Verification Status
  doc.setTextColor(100, 116, 139);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('STATUS', pageWidth - margin - 6, y + 7, { align: 'right' });

  // Status Badge
  const isPaidStatus = /^(paid|verified|approved|received|completed|success)/i.test((data.paymentStatus || '').trim());
  if (isPaidStatus) {
    doc.setFillColor(220, 252, 231); // Emerald 100
    doc.setDrawColor(34, 197, 94); // Emerald 500
    doc.roundedRect(pageWidth - margin - 52, y + 10, 46, 8, 1.5, 1.5, 'FD');
    doc.setTextColor(21, 128, 61); // Emerald 700
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text('PAID / VERIFIED', pageWidth - margin - 29, y + 15.5, { align: 'center' });
  } else {
    doc.setFillColor(254, 243, 199); // Amber 100
    doc.setDrawColor(245, 158, 11); // Amber 500
    doc.roundedRect(pageWidth - margin - 52, y + 10, 46, 8, 1.5, 1.5, 'FD');
    doc.setTextColor(180, 83, 9); // Amber 700
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text(data.paymentStatus || 'Pending Verification', pageWidth - margin - 29, y + 15.5, { align: 'center' });
  }

  // Edit count indicator if present
  if (data.editCount !== undefined) {
    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139);
    doc.setFont('helvetica', 'normal');
    doc.text(`Edits Used: ${data.editCount}/3 (${3 - data.editCount} remaining)`, margin + 75, y + 21);
  }

  y = 80;

  // Helper function to draw participant card
  const drawParticipantCard = (
    title: string,
    role: string,
    participant: { name: string; roll: string; department: string; whatsapp: string; facebook: string; email?: string },
    boxY: number
  ) => {
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.roundedRect(margin, boxY, contentWidth, 34, 2, 2, 'FD');

    // Title tag
    doc.setFillColor(241, 245, 249);
    doc.rect(margin, boxY, contentWidth, 7, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.line(margin, boxY + 7, margin + contentWidth, boxY + 7);

    doc.setTextColor(15, 23, 42);
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'bold');
    doc.text(title.toUpperCase(), margin + 4, boxY + 5);

    doc.setTextColor(22, 163, 74); // Green
    doc.setFontSize(7.5);
    doc.text(role, margin + contentWidth - 4, boxY + 5, { align: 'right' });

    // Details Grid
    const col1X = margin + 4;
    const col2X = margin + 65;
    const col3X = margin + 120;

    // Line 1: Name, Roll, Dept
    doc.setTextColor(100, 116, 139);
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    doc.text('Full Name:', col1X, boxY + 13);
    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text(participant.name || '—', col1X, boxY + 18);

    doc.setTextColor(100, 116, 139);
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    doc.text('Student Roll:', col2X, boxY + 13);
    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text(participant.roll || '—', col2X, boxY + 18);

    doc.setTextColor(100, 116, 139);
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    doc.text('Department:', col3X, boxY + 13);
    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.text(participant.department || '—', col3X, boxY + 18);

    // Line 2: WhatsApp, Email (if present) / Facebook
    doc.setTextColor(100, 116, 139);
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    doc.text('WhatsApp Number:', col1X, boxY + 25);
    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.text(participant.whatsapp || '—', col1X, boxY + 30);

    if (participant.email) {
      doc.setTextColor(100, 116, 139);
      doc.setFontSize(7.5);
      doc.setFont('helvetica', 'normal');
      doc.text('Email Address:', col2X, boxY + 25);
      doc.setTextColor(15, 23, 42);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      const emailText = participant.email;
      doc.text(emailText.length > 30 ? emailText.substring(0, 27) + '...' : emailText, col2X, boxY + 30);

      doc.setTextColor(100, 116, 139);
      doc.setFontSize(7.5);
      doc.setFont('helvetica', 'normal');
      doc.text('Facebook Profile:', col3X, boxY + 25);
      doc.setTextColor(15, 23, 42);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      const fbText = participant.facebook ? participant.facebook.replace(/^https?:\/\/(www\.)?/, '') : '—';
      doc.text(fbText.length > 25 ? fbText.substring(0, 22) + '...' : fbText, col3X, boxY + 30);
    } else {
      doc.setTextColor(100, 116, 139);
      doc.setFontSize(7.5);
      doc.setFont('helvetica', 'normal');
      doc.text('Facebook Profile:', col2X, boxY + 25);
      doc.setTextColor(15, 23, 42);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      const fbText = participant.facebook ? participant.facebook.replace(/^https?:\/\/(www\.)?/, '') : '—';
      doc.text(fbText.length > 45 ? fbText.substring(0, 42) + '...' : fbText, col2X, boxY + 30);
    }
  };

  // Section Header: Team Members
  doc.setTextColor(10, 25, 47);
  doc.setFontSize(10.5);
  doc.setFont('helvetica', 'bold');
  doc.text('TEAM PARTICIPANTS (3 MEMBERS)', margin, y - 2);

  // Participant 1: Group Leader
  drawParticipantCard('1. Group Leader', 'Primary Contact', data.formData.leader, y);
  y += 38;

  // Participant 2: Member 1
  drawParticipantCard('2. Team Member 1', 'Presenter', data.formData.member1, y);
  y += 38;

  // Participant 3: Member 2
  drawParticipantCard('3. Team Member 2', 'Presenter', data.formData.member2, y);
  y += 40;

  // Section Header: Payment Verification Info
  doc.setTextColor(10, 25, 47);
  doc.setFontSize(10.5);
  doc.setFont('helvetica', 'bold');
  doc.text('PAYMENT VERIFICATION DETAILS', margin, y - 2);

  // Payment Box
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, y, contentWidth, 22, 2, 2, 'FD');

  doc.setTextColor(100, 116, 139);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('bKash Sender Number:', margin + 6, y + 8);
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text(data.formData.payment.bkashNumber || '—', margin + 6, y + 16);

  doc.setTextColor(100, 116, 139);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('Transaction ID (TrxID):', margin + 65, y + 8);
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text(data.formData.payment.transactionId || '—', margin + 65, y + 16);

  doc.setTextColor(100, 116, 139);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('Amount Paid:', margin + 130, y + 8);
  doc.setTextColor(226, 19, 110); // bKash Pink
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('149 BDT', margin + 130, y + 16);

  y += 28;

  // Important Guidelines Note Box
  doc.setFillColor(240, 253, 244); // Green 50
  doc.setDrawColor(187, 247, 208); // Green 200
  doc.roundedRect(margin, y, contentWidth, 24, 2, 2, 'FD');

  doc.setTextColor(22, 101, 52); // Green 800
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('IMPORTANT GUIDELINES FOR EVENT DAY:', margin + 4, y + 6);

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(21, 128, 61);
  doc.text('• Please carry this printed voucher or digital copy to the BTEC Auditorium entrance on 04 October 2026.', margin + 4, y + 11);
  doc.text('• All team members must report by 8:30 AM BST. The event commences promptly at 9:00 AM BST.', margin + 4, y + 16);
  doc.text('• Registered teams can view and edit their registration info up to 3 times on the portal using this Registration No.', margin + 4, y + 21);

  // Footer text
  doc.setDrawColor(226, 232, 240);
  doc.line(margin, pageHeight - 12, pageWidth - margin, pageHeight - 12);

  doc.setTextColor(148, 163, 184);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.text('© 2026 Career Club BTEC • Barishal Textile Engineering College • Officially Issued Registration Voucher', margin, pageHeight - 8);
  doc.text(`Doc Ref: ${data.registrationId}`, pageWidth - margin, pageHeight - 8, { align: 'right' });

  return doc;
}

export function generateRegistrationPdf(data: RegistrationPdfData) {
  const doc = buildRegistrationPdfDoc(data);
  const filename = `Registration_${data.registrationId}_Info.pdf`;
  doc.save(filename);
}

export function getRegistrationPdfBase64(data: RegistrationPdfData): string {
  try {
    const doc = buildRegistrationPdfDoc(data);
    const dataUri = doc.output('datauristring');
    const parts = dataUri.split(',');
    return parts.length > 1 ? parts[1].replace(/\s+/g, '') : '';
  } catch (err) {
    console.error('Error generating PDF base64:', err);
    return '';
  }
}
