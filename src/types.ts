export type CandidateStatus =
  | 'Ditolak'
  | 'User Interview'
  | 'HR Interview'
  | 'Medical Check'
  | 'Lolos'
  | 'Onboarding'
  | 'Pending';

export type InterviewResult =
  | 'Lolos'
  | 'Tidak Lolos'
  | 'Dijadwalkan'
  | 'No Show'
  | '-';

export interface Candidate {
  id: number;
  name: string;
  position: string;
  status: CandidateStatus;
  hrResult: InterviewResult;
  userResult: InterviewResult;
  notes: string;
  dateAdded: string; // e.g. "2026-06-25"
}

export interface TimelineItem {
  id: string;
  date: string;
  title: string;
  description: string;
}

export interface User {
  username: string;
  email: string;
  fullName: string;
  role: string;
  avatarUrl: string;
}

export interface FilterOptions {
  search: string;
  position: string;
  status: string;
}
