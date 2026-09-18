export interface StoredRegistration {
  registrationId: string;
  submissionDate: string;
  paymentStatus: 'Pending' | 'Verified' | 'Rejected';
  leaderRoll: string;
  m1Roll: string;
  m2Roll: string;
  transactionId: string;
  editCount: number;
  maxEdits: number;
  lastEditedAt?: string;
  payload: any;
}

// Memory store that persists across warm invocations
const globalStore = globalThis as unknown as {
  __tpc_registrations?: StoredRegistration[];
  __tpc_idSequence?: number;
};

if (!globalStore.__tpc_registrations) {
  globalStore.__tpc_registrations = [];
}
if (!globalStore.__tpc_idSequence) {
  globalStore.__tpc_idSequence = 1;
}

export const registrationsStore: StoredRegistration[] = globalStore.__tpc_registrations;

export function getNextRegistrationId(): string {
  const nextId = globalStore.__tpc_idSequence || 1;
  globalStore.__tpc_idSequence = nextId + 1;
  return `TEX2026-${String(nextId).padStart(3, '0')}`;
}

export function findDuplicateTransaction(transactionId: string): StoredRegistration | undefined {
  const cleanTrx = String(transactionId || '').trim().toUpperCase();
  if (!cleanTrx) return undefined;
  return registrationsStore.find(r => r.transactionId && r.transactionId.toUpperCase() === cleanTrx);
}

export function findDuplicateRoll(rolls: string[]): { roll: string; record: StoredRegistration } | undefined {
  const cleanRolls = rolls.map(r => String(r).trim()).filter(Boolean);
  for (const roll of cleanRolls) {
    const found = registrationsStore.find(r => [r.leaderRoll, r.m1Roll, r.m2Roll].includes(roll));
    if (found) {
      return { roll, record: found };
    }
  }
  return undefined;
}

export function saveRegistration(record: StoredRegistration): void {
  const existingIdx = registrationsStore.findIndex(
    r => r.registrationId.toUpperCase() === record.registrationId.toUpperCase()
  );
  if (existingIdx >= 0) {
    registrationsStore[existingIdx] = record;
  } else {
    registrationsStore.push(record);
  }
}

export function getRegistrationById(id: string): StoredRegistration | undefined {
  const cleanId = String(id || '').trim().toUpperCase();
  return registrationsStore.find(r => r.registrationId.toUpperCase() === cleanId);
}
