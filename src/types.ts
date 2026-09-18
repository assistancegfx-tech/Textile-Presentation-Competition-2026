export interface Participant {
  name: string;
  roll: string;
  department: string;
  whatsapp: string;
  facebook: string;
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
  leader: Participant;
  member1: Participant;
  member2: Participant;
  payment: PaymentDetails;
}

export interface SubmissionResponse {
  success: boolean;
  registrationId?: string;
  submissionDate?: string;
  paymentStatus?: 'Pending' | 'Verified' | 'Rejected';
  message: string;
  error?: string;
  source?: 'google_sheets' | 'local_fallback';
  photos?: {
    leader?: string;
    member1?: string;
    member2?: string;
  };
}

export interface ExistingRegistrationRecord {
  id: string;
  registrationId: string;
  submittedAt: string;
  paymentStatus: 'Pending' | 'Verified' | 'Rejected';
  leader: {
    name: string;
    roll: string;
    department: string;
    whatsapp: string;
    facebook: string;
    photoPreview?: string;
  };
  member1: {
    name: string;
    roll: string;
    department: string;
    whatsapp: string;
    facebook: string;
    photoPreview?: string;
  };
  member2: {
    name: string;
    roll: string;
    department: string;
    whatsapp: string;
    facebook: string;
    photoPreview?: string;
  };
  payment: {
    bkashNumber: string;
    transactionId: string;
  };
}

export type PageId = 'home' | 'event' | 'registration' | 'guidelines' | 'contact';
