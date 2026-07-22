import { Job } from './types';

export const INITIAL_JOBS: Job[] = [
  {
    id: 'job-1',
    position: 'Senior Software Engineer',
    reqCode: 'REQ-2026-001',
    customer: 'Tech Solutions Inc.',
    location: 'Jakarta Selatan',
    manpowerNeeded: 5,
    type: 'PENAMBAHAN',
    isUrgent: false,
    status: 'Open',
    datePosted: '2026-06-20'
  },
  {
    id: 'job-2',
    position: 'Specialist Welder',
    reqCode: 'REQ-2026-002',
    customer: 'Heavy Metal Industries',
    location: 'Cilegon, Banten',
    manpowerNeeded: 2,
    type: 'PERGANTIAN',
    isUrgent: true,
    status: 'Open',
    datePosted: '2026-06-21'
  },
  {
    id: 'job-3',
    position: 'Digital Marketer',
    reqCode: 'REQ-2026-003',
    customer: 'Bright Agency',
    location: 'Bandung',
    manpowerNeeded: 1,
    type: 'PENAMBAHAN',
    isUrgent: false,
    status: 'Open',
    datePosted: '2026-06-22'
  },
  {
    id: 'job-4',
    position: 'Warehouse Manager',
    reqCode: 'REQ-2026-004',
    customer: 'Logistics Hub Co.',
    location: 'Surabaya',
    manpowerNeeded: 3,
    type: 'PERGANTIAN',
    isUrgent: false,
    status: 'Open',
    datePosted: '2026-06-23'
  },
  {
    id: 'job-5',
    position: 'Quality Assurance',
    reqCode: 'REQ-2026-005',
    customer: 'PharmaCorp',
    location: 'Semarang',
    manpowerNeeded: 10,
    type: 'PENAMBAHAN',
    isUrgent: false,
    status: 'Open',
    datePosted: '2026-06-24'
  }
];
