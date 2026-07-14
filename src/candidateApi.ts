// candidateApi.ts
// Ganti URL ini dengan URL Web App hasil Deploy Apps Script kamu
const API_URL = "https://script.google.com/macros/s/AKfycbwBZo7e_qzO2c_9ufF2rZwIOLMWDmAwNcmabA6EaXMYU89-k4m2rj_nXd_c-LvW0RgX/exec";

export interface Candidate {
  id: number;
  name: string;
  position: string;
  status: "Ditolak" | "User Interview" | "HR Interview" | "Medical Check" | "Lolos" | "Onboarding" | "Pending";
  hrResult: "Lolos" | "Tidak Lolos" | "Dijadwalkan" | "No Show" | "-";
  userResult: "Lolos" | "Tidak Lolos" | "Dijadwalkan" | "No Show" | "-";
  notes: string;
  dateAdded: string;
  source: string;
}

// Ambil semua kandidat
export async function getCandidates(): Promise<Candidate[]> {
  const res = await fetch(API_URL);
  return res.json();
}

// Ambil satu kandidat by id
export async function getCandidateById(id: number): Promise<Candidate> {
  const res = await fetch(`${API_URL}?id=${id}`);
  return res.json();
}

// Tambah kandidat baru
export async function createCandidate(candidate: Candidate) {
  const res = await fetch(API_URL, {
    method: "POST",
    body: JSON.stringify({ action: "create", data: candidate }),
  });
  return res.json();
}

// Update kandidat (harus ada id yang sudah ada)
export async function updateCandidate(candidate: Candidate) {
  const res = await fetch(API_URL, {
    method: "POST",
    body: JSON.stringify({ action: "update", data: candidate }),
  });
  return res.json();
}

// Hapus kandidat by id
export async function deleteCandidate(id: number) {
  const res = await fetch(API_URL, {
    method: "POST",
    body: JSON.stringify({ action: "delete", data: { id } }),
  });
  return res.json();
}
