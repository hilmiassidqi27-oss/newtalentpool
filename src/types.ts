export type CandidateStatus =
  | 'Applied'
  | 'Skill Test'
  | 'Psychological Test'
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
  source: string; // e.g. "LinkedIn", "Google Form"
}

export interface Job {
  id: string;
  position: string;
  reqCode: string;
  customer: string;
  location: string;
  manpowerNeeded: number;
  type: 'PENAMBAHAN' | 'PERGANTIAN';
  isUrgent: boolean;
  status: 'Open' | 'Closed' | 'On Hold';
  datePosted: string;
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
