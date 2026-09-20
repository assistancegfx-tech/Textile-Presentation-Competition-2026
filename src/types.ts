export interface Participant {
  name: string;
  roll: string;
  department: string;
  whatsapp: string;
  facebook: string;
  email?: string;
  photoBase64?: string;
  photoPreview?: string;
  photoName?: string;
  photoSize?: number;
}

export interface PaymentDetails {
  bkashNumber: string;
  transactionId: string;
}

export interface RegistrationFormData {
  teamName: string;
  leader: Participant;
  member1: Participant;
  member2: Participant;
  payment: PaymentDetails;
}

export interface SubmissionResponse {
  success: boolean;
  registrationId?: string;
  submissionDate?: string;
  teamName?: string;
  paymentStatus?: 'Pending' | 'Verified' | 'Rejected';
  editCount?: number;
  maxEdits?: number;
  remainingEdits?: number;
  emailSent?: boolean;
  emailRecipient?: string;
  message: string;
  error?: string;
  source?: 'google_sheets' | 'local_fallback';
  photos?: {
    leader?: string;
    member1?: string;
    member2?: string;
  };
}

export interface RegisteredTeamRecord {
  registrationId: string;
  submissionDate: string;
  paymentStatus: 'Pending' | 'Verified' | 'Rejected';
  teamName?: string;
  editCount: number;
  maxEdits: number;
  remainingEdits: number;
  canEdit: boolean;
  lastEditedAt?: string;
  formData: RegistrationFormData;
}

export interface ExistingRegistrationRecord {
  id: string;
  registrationId: string;
  submittedAt: string;
  paymentStatus: 'Pending' | 'Verified' | 'Rejected';
  teamName?: string;
  leader: {
    name: string;
    roll: string;
    department: string;
    whatsapp: string;
    facebook: string;
    email?: string;
    photoPreview?: string;
  };
  member1: {
    name: string;
    roll: string;
    department: string;
    whatsapp: string;
    facebook: string;
    email?: string;
    photoPreview?: string;
  };
  member2: {
    name: string;
    roll: string;
    department: string;
    whatsapp: string;
    facebook: string;
    email?: string;
    photoPreview?: string;
  };
  payment: {
    bkashNumber: string;
    transactionId: string;
  };
}

export type PageId = 'home' | 'event' | 'registration' | 'guidelines' | 'contact' | 'registration-success';

export type SubmissionProgressStage = 
  | 'idle'
  | 'validating'
  | 'photos'
  | 'saving_sheets'
  | 'finalizing';
