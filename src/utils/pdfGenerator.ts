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
  doc.text('Barishal Textile Engineering College | Established 2020', margin, 19);

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
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.text('PAYMENT STATUS', pageWidth - margin - 6, y + 6, { align: 'right' });

  // Status Badge
  const isPaidStatus = /^(paid|verified|approved|received|completed|success)/i.test((data.paymentStatus || '').trim());
  if (isPaidStatus) {
    doc.setFillColor(220, 252, 231); // Emerald 100
    doc.setDrawColor(34, 197, 94); // Emerald 500
    doc.roundedRect(pageWidth - margin - 56, y + 8, 50, 10, 1.5, 1.5, 'FD');
    doc.setTextColor(21, 128, 61); // Emerald 700
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text('PAYMENT APPROVED', pageWidth - margin - 31, y + 13, { align: 'center' });
    doc.setFontSize(6);
    doc.setTextColor(22, 101, 52);
    doc.setFont('helvetica', 'bold');
    doc.text('VALID FOR EVENT ENTRY', pageWidth - margin - 31, y + 16.5, { align: 'center' });

    doc.setFontSize(6);
    doc.setTextColor(22, 163, 74);
    doc.setFont('helvetica', 'normal');
    doc.text('Official Event Entry Voucher', pageWidth - margin - 31, y + 21.5, { align: 'center' });
  } else {
    doc.setFillColor(254, 242, 242); // Red 50
    doc.setDrawColor(239, 68, 68); // Red 500
    doc.roundedRect(pageWidth - margin - 56, y + 8, 50, 10, 1.5, 1.5, 'FD');
    doc.setTextColor(185, 28, 28); // Red 700
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text('PENDING APPROVAL', pageWidth - margin - 31, y + 13, { align: 'center' });
    doc.setFontSize(6);
    doc.setTextColor(220, 38, 38);
    doc.setFont('helvetica', 'bold');
    doc.text('NOT VALID FOR ENTRY', pageWidth - margin - 31, y + 16.5, { align: 'center' });

    doc.setFontSize(5.8);
    doc.setTextColor(185, 28, 28);
    doc.setFont('helvetica', 'bold');
    doc.text('Approved PDF Mandatory in Event', pageWidth - margin - 31, y + 21.5, { align: 'center' });
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
    doc.text(participant.name || '-', col1X, boxY + 18);

    doc.setTextColor(100, 116, 139);
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    doc.text('Student Roll:', col2X, boxY + 13);
    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text(participant.roll || '-', col2X, boxY + 18);

    doc.setTextColor(100, 116, 139);
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    doc.text('Department:', col3X, boxY + 13);
    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.text(participant.department || '-', col3X, boxY + 18);

    // Line 2: Mobile, Email (if present) / Facebook
    doc.setTextColor(100, 116, 139);
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    doc.text('Mobile Number:', col1X, boxY + 25);
    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.text(participant.whatsapp || '-', col1X, boxY + 30);

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
      const rawFb = String(participant.facebook || '').trim();
      const isBlank = !rawFb || rawFb.toLowerCase() === 'blank' || rawFb === '-';
      const fbText = isBlank ? 'Blank' : rawFb.replace(/^https?:\/\/(www\.)?/, '');
      doc.setFont('helvetica', isBlank ? 'italic' : 'normal');
      doc.setFontSize(8);
      if (isBlank) doc.setTextColor(148, 163, 184); // Muted slate 400 for Blank
      doc.text(fbText.length > 25 ? fbText.substring(0, 22) + '...' : fbText, col3X, boxY + 30);
    } else {
      doc.setTextColor(100, 116, 139);
      doc.setFontSize(7.5);
      doc.setFont('helvetica', 'normal');
      doc.text('Facebook Profile:', col2X, boxY + 25);
      doc.setTextColor(15, 23, 42);
      const rawFb = String(participant.facebook || '').trim();
      const isBlank = !rawFb || rawFb.toLowerCase() === 'blank' || rawFb === '-';
      const fbText = isBlank ? 'Blank' : rawFb.replace(/^https?:\/\/(www\.)?/, '');
      doc.setFont('helvetica', isBlank ? 'italic' : 'normal');
      doc.setFontSize(8);
      if (isBlank) doc.setTextColor(148, 163, 184); // Muted slate 400 for Blank
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
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('PAYMENT VERIFICATION DETAILS', margin, y - 2);

  // Payment Box
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, y, contentWidth, 18, 2, 2, 'FD');

  doc.setTextColor(100, 116, 139);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.text('bKash Sender Number:', margin + 6, y + 6.5);
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.text(data.formData.payment.bkashNumber || '-', margin + 6, y + 13.5);

  doc.setTextColor(100, 116, 139);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.text('Transaction ID (TrxID):', margin + 65, y + 6.5);
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.text(data.formData.payment.transactionId || '-', margin + 65, y + 13.5);

  doc.setTextColor(100, 116, 139);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.text('Amount Paid:', margin + 130, y + 6.5);
  doc.setTextColor(226, 19, 110); // bKash Pink
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.text('149 BDT', margin + 130, y + 13.5);

  y += 22;

  // Event Entry Requirement Highlight Box
  if (isPaidStatus) {
    doc.setFillColor(240, 253, 244); // Emerald 50
    doc.setDrawColor(34, 197, 94); // Emerald 500
    doc.setLineWidth(0.4);
    doc.roundedRect(margin, y, contentWidth, 12, 1.5, 1.5, 'FD');

    // Vector badge: "APPROVED"
    doc.setFillColor(22, 163, 74); // Green 600
    doc.roundedRect(margin + 4, y + 2.5, 18, 4.5, 1, 1, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(6.5);
    doc.setFont('helvetica', 'bold');
    doc.text('APPROVED', margin + 13, y + 5.7, { align: 'center' });

    doc.setTextColor(21, 128, 61); // Emerald 700
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text('ENTRY PASS VALIDATED: PAYMENT APPROVED', margin + 25, y + 5.7);

    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(22, 101, 52);
    doc.text('Payment is verified. Present this Payment Approved PDF at the BTEC Auditorium gate on event day (04 Oct 2026).', margin + 4, y + 9.5);
  } else {
    doc.setFillColor(254, 242, 242); // Red 50
    doc.setDrawColor(239, 68, 68); // Red 500
    doc.setLineWidth(0.5);
    doc.roundedRect(margin, y, contentWidth, 13, 1.5, 1.5, 'FD');

    // Vector badge: "ATTENTION"
    doc.setFillColor(220, 38, 38); // Red 600
    doc.roundedRect(margin + 4, y + 2.5, 20, 4.5, 1, 1, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(6.5);
    doc.setFont('helvetica', 'bold');
    doc.text('ATTENTION', margin + 14, y + 5.7, { align: 'center' });

    doc.setTextColor(185, 28, 28); // Red 700
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text('MANDATORY RULE: PAYMENT APPROVED PDF REQUIRED FOR EVENT ENTRY', margin + 27, y + 5.7);

    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(220, 38, 38);
    doc.text('A Payment Approved PDF is MANDATORY in the event. NO PENDING PDF WILL BE ACCEPTED at the venue.', margin + 4, y + 10.2);
  }

  y += isPaidStatus ? 16 : 17;

  // Important Guidelines Note Box
  doc.setFillColor(248, 250, 252); // Slate 50
  doc.setDrawColor(203, 213, 225); // Slate 300
  doc.setLineWidth(0.3);
  doc.roundedRect(margin, y, contentWidth, 27, 2, 2, 'FD');

  doc.setTextColor(10, 25, 47);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('EVENT DAY INSTRUCTIONS & ENTRY REQUIREMENTS:', margin + 4, y + 5.5);

  doc.setFontSize(7.2);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(185, 28, 28); // Red for mandatory rule
  doc.text('1. MANDATORY ENTRY: Payment approved PDF is mandatory in event. No pending PDF will be accepted.', margin + 4, y + 10.5);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(51, 65, 85);
  doc.text('2. IF PENDING: Verify your payment on the portal before 04 Oct 2026 and download the approved voucher once verified.', margin + 4, y + 15);
  doc.text('3. REPORTING TIME: All team members must report to BTEC Auditorium by 8:30 AM BST. Event starts at 9:00 AM BST.', margin + 4, y + 19.5);
  doc.text('4. EDITS: Registration information can be updated up to 3 times on the official portal using this Registration No.', margin + 4, y + 24);

  // Footer text
  doc.setDrawColor(226, 232, 240);
  doc.line(margin, pageHeight - 12, pageWidth - margin, pageHeight - 12);

  doc.setTextColor(148, 163, 184);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.text('Career Club BTEC | Barishal Textile Engineering College | Officially Issued Registration Voucher', margin, pageHeight - 8);
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
