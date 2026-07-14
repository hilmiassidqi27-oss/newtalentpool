import { Candidate, CandidateStatus, InterviewResult } from '../types';

export interface SpreadsheetInfo {
  id: string;
  title: string;
  url: string;
  sheets: string[];
}

/**
 * Fetch spreadsheet metadata to get its title and sheet tab names.
 */
export async function getSpreadsheetInfo(token: string, spreadsheetId: string): Promise<SpreadsheetInfo> {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}`;
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Failed to fetch spreadsheet info: ${response.statusText}. ${errText}`);
  }

  const data = await response.json();
  const sheets = data.sheets?.map((s: any) => s.properties?.title as string) || [];
  
  return {
    id: data.spreadsheetId,
    title: data.properties?.title || 'Untitled Spreadsheet',
    url: data.spreadsheetUrl || `https://docs.google.com/spreadsheets/d/${data.spreadsheetId}/edit`,
    sheets,
  };
}

/**
 * Create a new spreadsheet in Google Sheets and return its ID and URL.
 */
export async function createSpreadsheet(token: string, title: string): Promise<SpreadsheetInfo> {
  const url = 'https://sheets.googleapis.com/v4/spreadsheets';
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      properties: {
        title,
      },
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Failed to create spreadsheet: ${response.statusText}. ${errText}`);
  }

  const data = await response.json();
  const sheets = data.sheets?.map((s: any) => s.properties?.title as string) || [];
  
  return {
    id: data.spreadsheetId,
    title: data.properties?.title,
    url: data.spreadsheetUrl || `https://docs.google.com/spreadsheets/d/${data.spreadsheetId}/edit`,
    sheets,
  };
}

/**
 * Export active candidate pipeline data into a Google Sheet tab.
 */
export async function exportCandidatesToSheet(
  token: string,
  spreadsheetId: string,
  sheetName: string,
  candidates: Candidate[]
): Promise<void> {
  const range = `'${sheetName}'!A1`;
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}?valueInputOption=USER_ENTERED`;

  // Define headers and format rows
  const headers = ['ID', 'Name (Nama Kandidat)', 'Position (Posisi)', 'Status Saat Ini', 'HR Result', 'User Result', 'Notes (Catatan)', 'Date Added', 'Source (Sumber Lamaran)'];
  const rows = candidates.map((c) => [
    c.id.toString(),
    c.name,
    c.position,
    c.status,
    c.hrResult,
    c.userResult,
    c.notes || '-',
    c.dateAdded,
    c.source || 'LinkedIn',
  ]);

  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      range,
      majorDimension: 'ROWS',
      values: [headers, ...rows],
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Failed to write values: ${response.statusText}. ${errText}`);
  }
}

/**
 * Import and parse candidates from any Google Sheet tab.
 * Dynamically detects matching headers (id, name, position, status, hr, user, notes).
 * Supports headers located in non-first rows, multi-language keywords, and smart column fallbacks.
 */
export async function importCandidatesFromSheet(
  token: string,
  spreadsheetId: string,
  sheetName: string
): Promise<Partial<Candidate>[]> {
  const range = `'${sheetName}'!A1:Z500`; // Fetch first 500 rows and up to Z column
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Failed to read sheet data: ${response.statusText}. ${errText}`);
  }

  const data = await response.json();
  const values: string[][] = data.values;

  if (!values || values.length === 0) {
    throw new Error('Spreadsheet appears to be empty or contains no data in the specified range.');
  }

  // 1. DYNAMIC HEADER ROW DETECTION:
  // Spreadsheets often have empty rows or title banners at the top. We scan the first 10 rows
  // and score them based on containing known candidate recruitment header keywords.
  const nameSynonyms = ['name', 'nama', 'kandidat', 'candidate', 'peserta', 'pelamar', 'employee', 'karyawan', 'fullname', 'full name'];
  const positionSynonyms = ['posisi', 'position', 'jabatan', 'role', 'pekerjaan', 'bidang', 'divisi', 'division'];
  const statusSynonyms = ['status', 'tahap', 'stage', 'proses', 'state'];
  const hrSynonyms = ['hr', 'screening', 'interview hr', 'hrd', 'hr interview', 'hr result', 'hr screening', 'status hr'];
  const userSynonyms = ['user', 'interview user', 'user interview', 'client', 'user result', 'status user'];
  const notesSynonyms = ['note', 'catatan', 'keterangan', 'keterangan tambahan', 'remarks', 'deskripsi', 'info', 'notes'];
  const idSynonyms = ['id', 'nomor', 'no', 'no.'];
  const sourceSynonyms = ['source', 'sumber', 'sumber lamaran', 'lamaran', 'asal', 'channel', 'kanal'];

  const allKeywords = [
    ...nameSynonyms,
    ...positionSynonyms,
    ...statusSynonyms,
    ...hrSynonyms,
    ...userSynonyms,
    ...notesSynonyms,
    ...idSynonyms,
    ...sourceSynonyms
  ];

  let headerRowIndex = 0;
  let maxScore = -1;
  const rowsToScan = Math.min(10, values.length);

  for (let r = 0; r < rowsToScan; r++) {
    const row = values[r];
    if (!row || row.length === 0) continue;
    let score = 0;
    for (const cell of row) {
      if (!cell) continue;
      const cleanCell = String(cell).trim().toLowerCase();
      if (allKeywords.some(kw => cleanCell === kw || cleanCell.includes(kw))) {
        score++;
      }
    }
    if (score > maxScore) {
      maxScore = score;
      headerRowIndex = r;
    }
  }

  // Fallback to row index 0 if no matching header keywords found
  if (maxScore <= 0) {
    headerRowIndex = 0;
  }

  const headers = values[headerRowIndex].map(h => (h ? String(h).trim().toLowerCase() : ''));
  
  // Find column indexes of fields dynamically
  let nameIndex = headers.findIndex(h => nameSynonyms.some(s => h === s || h.includes(s)));
  const positionIndex = headers.findIndex(h => positionSynonyms.some(s => h === s || h.includes(s)));
  const statusIndex = headers.findIndex(h => statusSynonyms.some(s => h === s || h.includes(s)));
  const hrIndex = headers.findIndex(h => hrSynonyms.some(s => h === s || h.includes(s)));
  const userIndex = headers.findIndex(h => userSynonyms.some(s => h === s || h.includes(s)));
  const notesIndex = headers.findIndex(h => notesSynonyms.some(s => h === s || h.includes(s)));
  const idIndex = headers.findIndex(h => idSynonyms.some(s => h === s || h === s.replace('.', '')));
  const sourceIndex = headers.findIndex(h => sourceSynonyms.some(s => h === s || h.includes(s)));

  // Smart fallback for name index to prevent breaking
  if (nameIndex === -1) {
    nameIndex = headers.findIndex(h => h.includes('name') || h.includes('nama') || h.includes('kand') || h.includes('pelamar') || h.includes('peserta'));
  }
  if (nameIndex === -1) {
    // If still not found, fallback to 2nd column (index 1) if available, otherwise 1st column (index 0)
    if (headers.length > 1) {
      nameIndex = 1;
    } else if (headers.length > 0) {
      nameIndex = 0;
    } else {
      throw new Error(`Could not find a valid column containing candidate names. Detected columns: ${JSON.stringify(headers)}`);
    }
  }

  const parsedCandidates: Partial<Candidate>[] = [];

  // Parse data rows starting after the detected header row
  for (let i = headerRowIndex + 1; i < values.length; i++) {
    const row = values[i];
    if (!row || row.length === 0 || !row[nameIndex]?.trim()) continue;

    let id: number | undefined = undefined;
    if (idIndex !== -1 && row[idIndex]) {
      const parsedId = parseInt(row[idIndex].trim(), 10);
      if (!isNaN(parsedId)) {
        id = parsedId;
      }
    }
    const name = row[nameIndex]?.trim() || '';
    const position = positionIndex !== -1 && row[positionIndex] ? row[positionIndex].trim() : 'Scaffolder';
    
    // Status normalization
    let status: CandidateStatus = 'HR Interview';
    if (statusIndex !== -1 && row[statusIndex]) {
      const sVal = row[statusIndex].trim();
      if (['Ditolak', 'Rejected'].some(x => sVal.toLowerCase().includes(x.toLowerCase()))) status = 'Ditolak';
      else if (sVal.toLowerCase().includes('user')) status = 'User Interview';
      else if (sVal.toLowerCase().includes('hr')) status = 'HR Interview';
      else if (['medical', 'mcu'].some(x => sVal.toLowerCase().includes(x.toLowerCase()))) status = 'Medical Check';
      else if (sVal.toLowerCase().includes('lolos') || sVal.toLowerCase().includes('pass')) status = 'Lolos';
      else if (sVal.toLowerCase().includes('onboard')) status = 'Onboarding';
      else status = 'Pending';
    }

    // HR / User Results normalization
    const normalizeResult = (val?: string): InterviewResult => {
      if (!val) return '-';
      const cleanVal = val.trim().toLowerCase();
      if (cleanVal.includes('lolos') || cleanVal.includes('pass') || cleanVal === 'yes') return 'Lolos';
      if (cleanVal.includes('tidak') || cleanVal.includes('fail') || cleanVal === 'no') return 'Tidak Lolos';
      if (cleanVal.includes('jadwal') || cleanVal.includes('schedule') || cleanVal.includes('dijadwalkan')) return 'Dijadwalkan';
      if (cleanVal.includes('show') || cleanVal.includes('mangkir')) return 'No Show';
      return '-';
    };

    const hrResult = hrIndex !== -1 ? normalizeResult(row[hrIndex]) : '-';
    const userResult = userIndex !== -1 ? normalizeResult(row[userIndex]) : '-';
    const notes = notesIndex !== -1 && row[notesIndex] ? row[notesIndex].trim() : '-';
    const source = sourceIndex !== -1 && row[sourceIndex] ? row[sourceIndex].trim() : 'LinkedIn';

    parsedCandidates.push({
      id,
      name,
      position,
      status,
      hrResult,
      userResult,
      notes,
      source,
    });
  }

  return parsedCandidates;
}
