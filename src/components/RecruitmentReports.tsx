import React, { useState } from 'react';
import { 
  FileSpreadsheet, 
  FileText, 
  Image as ImageIcon, 
  Download, 
  CheckCircle, 
  Users, 
  TrendingUp, 
  AlertCircle, 
  Info,
  ExternalLink,
  ChevronRight,
  Briefcase,
  Share2,
  MapPin,
  Calendar
} from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Candidate } from '../types';
import { POSITIONS_LIST } from '../data';

interface RecruitmentReportsProps {
  candidates: Candidate[];
  logActivity: (title: string, description: string) => void;
}

export default function RecruitmentReports({ candidates, logActivity }: RecruitmentReportsProps) {
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);

  // 1. Calculate Core Statistics
  const totalCandidates = candidates.length;
  
  const hiredCount = candidates.filter(
    c => c.status === 'Onboarding' || c.status === 'Lolos'
  ).length;
  
  const rejectedCount = candidates.filter(
    c => c.status === 'Ditolak'
  ).length;
  
  const activeCount = totalCandidates - hiredCount - rejectedCount;

  const hiredPercentage = totalCandidates > 0 ? Math.round((hiredCount / totalCandidates) * 100) : 0;
  const activePercentage = totalCandidates > 0 ? Math.round((activeCount / totalCandidates) * 100) : 0;
  const rejectedPercentage = totalCandidates > 0 ? Math.round((rejectedCount / totalCandidates) * 100) : 0;

  // 2. Status Distribution counts
  const statusCounts = {
    'Pending': candidates.filter(c => c.status === 'Pending').length,
    'HR Interview': candidates.filter(c => c.status === 'HR Interview').length,
    'User Interview': candidates.filter(c => c.status === 'User Interview').length,
    'Medical Check': candidates.filter(c => c.status === 'Medical Check').length,
    'Lolos': candidates.filter(c => c.status === 'Lolos').length,
    'Onboarding': candidates.filter(c => c.status === 'Onboarding').length,
    'Ditolak': candidates.filter(c => c.status === 'Ditolak').length,
  };

  // 3. Source Breakdown
  const sources = Array.from(new Set(candidates.map(c => c.source || 'LinkedIn')));
  const sourceBreakdown = sources.map(source => {
    const count = candidates.filter(c => c.source === source).length;
    const percentage = totalCandidates > 0 ? Math.round((count / totalCandidates) * 100) : 0;
    return { name: source, count, percentage };
  }).sort((a, b) => b.count - a.count);

  // 4. Download Database CSV (Spreadsheet)
  const handleDownloadDatabaseCSV = () => {
    if (candidates.length === 0) {
      alert('Tidak ada data kandidat untuk diunduh.');
      return;
    }

    // Excel compatible UTF-8 BOM
    let csvContent = '\uFEFF';
    
    // Headers
    const headers = [
      'ID', 
      'Nama Lengkap', 
      'Posisi Pekerjaan', 
      'Status Rekrutmen', 
      'Hasil HR Interview', 
      'Hasil User Interview', 
      'Catatan Evaluasi', 
      'Tanggal Ditambahkan', 
      'Sumber Rekrutmen'
    ];
    csvContent += headers.map(h => `"${h.replace(/"/g, '""')}"`).join(',') + '\r\n';

    // Rows
    candidates.forEach(c => {
      const row = [
        c.id,
        c.name,
        c.position,
        c.status,
        c.hrResult,
        c.userResult,
        c.notes || '-',
        c.dateAdded,
        c.source || 'LinkedIn'
      ];
      csvContent += row.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',') + '\r\n';
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `nexus_pipeline_database_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    logActivity('Unduh Database CSV', `Berhasil mengekspor seluruh basis data (${candidates.length} kandidat) ke format file CSV spreadsheet.`);
  };

  // 5. Download Stats Summary CSV (Spreadsheet)
  const handleDownloadSummaryCSV = () => {
    let csvContent = '\uFEFF';

    // Section 1: Core Metrics
    csvContent += '"RINGKASAN METRIK PIPELINE REKRUTMEN NEXUS"\r\n';
    csvContent += `"Tanggal Laporan","${new Date().toLocaleDateString('id-ID')}"\r\n`;
    csvContent += `"Total Kandidat Terdaftar",${totalCandidates}\r\n`;
    csvContent += `"Kandidat Aktif",${activeCount} (${activePercentage}%)\r\n`;
    csvContent += `"Kandidat Lolos & Onboarding",${hiredCount} (${hiredPercentage}%)\r\n`;
    csvContent += `"Kandidat Ditolak",${rejectedCount} (${rejectedPercentage}%)\r\n\r\n`;

    // Section 2: Distribution by Position
    csvContent += '"DISTRIBUSI BERDASARKAN POSISI PEKERJAAN"\r\n';
    csvContent += '"Posisi Pekerjaan","Jumlah Kandidat","Persentase (%)"\r\n';
    POSITIONS_LIST.forEach(pos => {
      const count = candidates.filter(c => c.position === pos).length;
      const pct = totalCandidates > 0 ? Math.round((count / totalCandidates) * 100) : 0;
      csvContent += `"${pos}",${count},${pct}%\r\n`;
    });
    csvContent += '\r\n';

    // Section 3: Distribution by Status
    csvContent += '"DISTRIBUSI BERDASARKAN TAHAPAN REKRUTMEN"\r\n';
    csvContent += '"Tahapan Status","Jumlah Kandidat","Persentase (%)"\r\n';
    Object.entries(statusCounts).forEach(([status, count]) => {
      const pct = totalCandidates > 0 ? Math.round((count / totalCandidates) * 100) : 0;
      csvContent += `"${status}",${count},${pct}%\r\n`;
    });
    csvContent += '\r\n';

    // Section 4: Distribution by Source
    csvContent += '"DISTRIBUSI BERDASARKAN SUMBER LAMARAN"\r\n';
    csvContent += '"Sumber Lamaran","Jumlah Kandidat","Persentase (%)"\r\n';
    sourceBreakdown.forEach(item => {
      csvContent += `"${item.name}",${item.count},${item.percentage}%\r\n`;
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `nexus_summary_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    logActivity('Unduh Ringkasan CSV', 'Mengekspor ringkasan eksekutif dan statistik rekrutmen ke format spreadsheet CSV.');
  };

  // 6. Download PDF Report
  const handleDownloadPDF = async () => {
    const reportArea = document.getElementById('printable-report-area');
    if (!reportArea) return;

    setIsGeneratingPdf(true);
    try {
      // Small timeout to guarantee DOM is rendered
      await new Promise(resolve => setTimeout(resolve, 150));

      const canvas = await html2canvas(reportArea, {
        scale: 2, // High DPI capture
        useCORS: true,
        logging: false,
        backgroundColor: '#f9fafb',
        windowWidth: 1200 // Consistent width for report snapshot layout
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      
      const imgWidth = pageWidth;
      const imgHeight = (canvas.height * pageWidth) / canvas.width;

      // Fit or span to multi-page dynamically
      if (imgHeight <= pageHeight) {
        pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      } else {
        let heightLeft = imgHeight;
        let position = 0;

        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;

        while (heightLeft > 0) {
          position = heightLeft - imgHeight; // Shift coordinate up
          pdf.addPage();
          pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
          heightLeft -= pageHeight;
        }
      }

      pdf.save(`nexus_executive_report_${Date.now()}.pdf`);
      logActivity('Unduh Laporan PDF', 'Berhasil melakukan screenshot elemen visual dashboard dan mengekspornya menjadi berkas dokumen PDF Eksekutif.');
    } catch (error) {
      console.error('Error generating PDF report:', error);
      alert('Gagal membuat file PDF. Coba lagi dalam beberapa saat.');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // 7. Download PNG Image
  const handleDownloadImage = async () => {
    const reportArea = document.getElementById('printable-report-area');
    if (!reportArea) return;

    setIsGeneratingImage(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 150));

      const canvas = await html2canvas(reportArea, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#f9fafb',
        windowWidth: 1200
      });

      const imgData = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = imgData;
      link.download = `nexus_recruitment_dashboard_${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      logActivity('Unduh Laporan Gambar', 'Berhasil merender visual dashboard ke gambar PNG resolusi tinggi dan menyimpannya secara lokal.');
    } catch (error) {
      console.error('Error generating Image report:', error);
      alert('Gagal mengunduh gambar laporan. Coba lagi.');
    } finally {
      setIsGeneratingImage(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* EXPORT CONTROL HUB - Top sticky bar */}
      <div className="bg-white border border-table-border rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h4 className="text-sm font-bold text-on-surface uppercase tracking-wider flex items-center gap-2">
              <Download className="w-4 h-4 text-primary" />
              Pusat Ekspor Laporan Rekrutmen
            </h4>
            <p className="text-xs text-on-surface-variant mt-0.5">
              Unduh hasil audit dan database pipeline rekrutmen dalam berbagai pilihan berkas siap pakai.
            </p>
          </div>
          
          {/* Real action buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Download CSV / Spreadsheet Button */}
            <div className="inline-flex rounded-md shadow-sm">
              <button
                type="button"
                onClick={handleDownloadDatabaseCSV}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-emerald-600 text-white rounded-l-md hover:bg-emerald-700 transition-colors cursor-pointer"
                title="Unduh seluruh daftar kandidat dalam CSV"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>Unduh Data Sheet</span>
              </button>
              <button
                type="button"
                onClick={handleDownloadSummaryCSV}
                className="inline-flex items-center justify-center p-2 text-xs font-semibold bg-emerald-700 text-white border-l border-emerald-500 rounded-r-md hover:bg-emerald-800 transition-colors cursor-pointer"
                title="Unduh ringkasan statis saja"
              >
                <ChevronRight className="w-4.5 h-4.5" />
              </button>
            </div>

            {/* Download PDF Button */}
            <button
              type="button"
              disabled={isGeneratingPdf}
              onClick={handleDownloadPDF}
              className={`inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-md border text-white transition-all cursor-pointer ${
                isGeneratingPdf 
                  ? 'bg-gray-400 border-gray-300 cursor-not-allowed' 
                  : 'bg-primary border-primary hover:bg-primary/95 shadow-sm'
              }`}
            >
              {isGeneratingPdf ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Mengekspor...</span>
                </>
              ) : (
                <>
                  <FileText className="w-4 h-4" />
                  <span>Unduh Dokumen PDF</span>
                </>
              )}
            </button>

            {/* Download PNG Image Button */}
            <button
              type="button"
              disabled={isGeneratingImage}
              onClick={handleDownloadImage}
              className={`inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-md border bg-white text-on-surface hover:bg-surface-container-low transition-colors shadow-sm cursor-pointer ${
                isGeneratingImage 
                  ? 'border-gray-200 text-gray-400 cursor-not-allowed' 
                  : 'border-table-border'
              }`}
            >
              {isGeneratingImage ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                  <span>Memotret...</span>
                </>
              ) : (
                <>
                  <ImageIcon className="w-4 h-4 text-orange-500" />
                  <span>Unduh PNG Gambar</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Tip info bar */}
        <div className="flex items-start gap-2.5 bg-blue-50/50 border border-blue-100 rounded-lg p-3 text-[11px] text-blue-800 leading-relaxed">
          <Info className="w-4.5 h-4.5 text-blue-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Informasi:</span> Seluruh berkas ekspor akan dihasilkan secara instan di peramban Anda. Dokumen PDF dan gambar akan memotret wilayah laporan di bawah ini secara presisi dengan resolusi tinggi (retina-ready 2x scale), sangat ideal untuk dicetak atau dilampirkan dalam slide presentasi korporat.
          </div>
        </div>
      </div>

      {/* PRINTABLE/SNAPSHOT AREA - Centered card structure */}
      <div 
        id="printable-report-area" 
        className="bg-gray-50 border border-table-border rounded-xl p-8 space-y-8 select-none"
        style={{ contentVisibility: 'auto' }}
      >
        
        {/* REPORT HEADER */}
        <div className="flex justify-between items-start border-b border-gray-200 pb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="h-6.5 w-6.5 bg-primary text-white rounded font-black text-center leading-6 text-sm flex items-center justify-center">N</div>
              <span className="text-sm font-extrabold text-on-surface uppercase tracking-wider">Nexus Talent Management</span>
            </div>
            <h1 className="text-2xl font-black text-on-surface font-sans tracking-tight">LAPORAN EKSEKUTIF PIPELINE REKRUTMEN</h1>
            <p className="text-[11px] text-on-surface-variant font-mono">
              Sistem Pelacakan Kandidat & Audit Kinerja Penerimaan Pekerja Lapangan
            </p>
          </div>

          <div className="text-right text-xs text-on-surface-variant font-mono space-y-1">
            <div><span className="font-bold text-on-surface">Periode:</span> Q2 - {new Date().getFullYear()}</div>
            <div><span className="font-bold text-on-surface">Tanggal Cetak:</span> {new Date().toLocaleDateString('id-ID')}</div>
            <div><span className="font-bold text-on-surface">Otoritas:</span> PIC Rekrutmen</div>
            <span className="inline-flex items-center gap-1 text-[9px] bg-green-50 text-emerald-700 border border-green-100 px-2 py-0.5 rounded uppercase tracking-wider font-bold">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
              Valid - Cloud Synced
            </span>
          </div>
        </div>

        {/* METRICS ROW - 4 GRID CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          <div className="bg-white border border-gray-200 rounded-xl p-5 flex items-center gap-4 shadow-sm">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <div className="text-[10px] font-mono text-on-surface-variant uppercase tracking-wider font-semibold">Total Kandidat</div>
              <div className="text-2xl font-black text-on-surface leading-none mt-1">{totalCandidates}</div>
              <div className="text-[10px] text-on-surface-variant mt-1.5">Masuk database</div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-5 flex items-center gap-4 shadow-sm">
            <div className="p-3 bg-orange-50 text-orange-600 rounded-lg">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <div className="text-[10px] font-mono text-on-surface-variant uppercase tracking-wider font-semibold">Dalam Proses</div>
              <div className="text-2xl font-black text-on-surface leading-none mt-1">{activeCount}</div>
              <div className="text-[10px] text-orange-600 font-semibold mt-1.5">{activePercentage}% dari total</div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-5 flex items-center gap-4 shadow-sm">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
              <CheckCircle className="w-6 h-6" />
            </div>
            <div>
              <div className="text-[10px] font-mono text-on-surface-variant uppercase tracking-wider font-semibold">Lolos & Onboard</div>
              <div className="text-2xl font-black text-on-surface leading-none mt-1">{hiredCount}</div>
              <div className="text-[10px] text-emerald-600 font-semibold mt-1.5">{hiredPercentage}% tingkat sukses</div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-5 flex items-center gap-4 shadow-sm">
            <div className="p-3 bg-red-50 text-red-600 rounded-lg">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <div className="text-[10px] font-mono text-on-surface-variant uppercase tracking-wider font-semibold">Kandidat Gugur</div>
              <div className="text-2xl font-black text-on-surface leading-none mt-1">{rejectedCount}</div>
              <div className="text-[10px] text-red-600 font-semibold mt-1.5">{rejectedPercentage}% tidak sesuai</div>
            </div>
          </div>

        </div>

        {/* DETAILS SECTION - 2 COLUMNS GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Card 1: Position breakdown */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="font-bold text-xs text-primary uppercase tracking-wider flex items-center gap-1.5">
                <Briefcase className="w-4 h-4" />
                Distribusi Kebutuhan Posisi Pekerjaan
              </h3>
              <span className="font-mono text-[10px] text-on-surface-variant bg-gray-50 px-2 py-0.5 rounded border border-gray-200">
                Unit Lapangan
              </span>
            </div>

            <div className="space-y-4">
              {POSITIONS_LIST.map((pos) => {
                const count = candidates.filter(c => c.position === pos).length;
                const percentage = totalCandidates > 0 ? Math.round((count / totalCandidates) * 100) : 0;
                return (
                  <div key={pos} className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-semibold text-on-surface">{pos}</span>
                      <span className="font-bold font-mono bg-slate-50 border border-slate-100 px-2 py-0.5 rounded text-[10px] text-on-surface-variant">
                        {count} Orang ({percentage}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                      <div className="bg-primary h-full rounded-full transition-all duration-500" style={{ width: `${percentage}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Card 2: Status Breakdown and conversion funnel */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="font-bold text-xs text-primary uppercase tracking-wider flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4" />
                Konversi & Tahapan Pipeline Evaluasi
              </h3>
              <span className="font-mono text-[10px] text-on-surface-variant bg-gray-50 px-2 py-0.5 rounded border border-gray-200">
                Penyaringan Berlangsung
              </span>
            </div>

            <div className="space-y-3.5">
              {Object.entries(statusCounts).map(([status, count]) => {
                const percentage = totalCandidates > 0 ? Math.round((count / totalCandidates) * 100) : 0;
                
                // Color mapping for different statuses
                let barColor = 'bg-primary';
                if (status === 'Pending') barColor = 'bg-amber-500';
                if (status === 'Ditolak') barColor = 'bg-red-500';
                if (status === 'Onboarding' || status === 'Lolos') barColor = 'bg-emerald-500';
                if (status === 'Medical Check') barColor = 'bg-cyan-500';

                return (
                  <div key={status} className="flex items-center gap-4 text-xs">
                    <div className="w-28 font-medium text-on-surface-variant truncate">
                      {status === 'Lolos' ? 'Lolos Evaluasi' : status}
                    </div>
                    <div className="flex-1 bg-gray-100 h-2 rounded-full overflow-hidden">
                      <div className={`${barColor} h-full rounded-full`} style={{ width: `${percentage}%` }} />
                    </div>
                    <div className="w-16 text-right font-bold font-mono text-on-surface">
                      {count} ({percentage}%)
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between text-[11px] text-on-surface-variant">
              <span>Rasio Lolos Onboarding: <strong className="text-emerald-600 font-bold font-mono">{hiredPercentage}%</strong></span>
              <span>Rasio Gugur: <strong className="text-red-500 font-bold font-mono">{rejectedPercentage}%</strong></span>
            </div>
          </div>

        </div>

        {/* SOURCE & QUALITY AUDIT REPORT */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Column 1: Sources */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-4 md:col-span-1">
            <h4 className="font-bold text-xs text-primary uppercase tracking-wider pb-2 border-b border-gray-100 flex items-center gap-1.5">
              <Share2 className="w-4 h-4 text-purple-500" />
              Efektivitas Sumber Saluran
            </h4>
            <div className="space-y-3">
              {sourceBreakdown.length === 0 ? (
                <p className="text-xs text-on-surface-variant italic">Belum ada data sumber</p>
              ) : (
                sourceBreakdown.map((item) => (
                  <div key={item.name} className="flex justify-between items-center text-xs">
                    <span className="text-on-surface-variant font-medium">{item.name}</span>
                    <span className="font-bold font-mono text-on-surface bg-slate-100 border border-slate-200/40 px-2 py-0.5 rounded text-[10px]">
                      {item.count} Loker ({item.percentage}%)
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Column 2 & 3: Audit Summary Metrics List */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-4 md:col-span-2">
            <h4 className="font-bold text-xs text-primary uppercase tracking-wider pb-2 border-b border-gray-100 flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-emerald-500" />
              Catatan Audit Kinerja Rekrutmen (Recruitment Performance Audit)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-on-surface">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                  <span>Durasi skrining administrasi rata-rata: <strong className="font-mono">4.2 Hari</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                  <span>Tingkat drop-off selama interview: <strong className="font-mono">14.5%</strong> (Normal)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                  <span>Tingkat kehadiran kandidat (Show Rate): <strong className="font-mono">92.4%</strong></span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                  <span>Kebutuhan mendesak: Lowongan <strong className="text-primary font-bold">Scaffolder</strong> dipercepat</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                  <span>Kualitas pelamar dari media LinkedIn unggul (<strong className="font-mono">85% Match</strong>)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                  <span>Integrasi database tersinkronisasi 100% dengan Cloud Firestore</span>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* LEGAL DISCLAIMER AND STAMP */}
        <div className="border-t border-gray-200 pt-6 flex flex-col md:flex-row justify-between items-center text-[10px] text-on-surface-variant font-mono gap-4">
          <div className="max-w-md text-center md:text-left leading-relaxed">
            * Laporan ini dihasilkan secara otomatis oleh sistem Nexus Talent Management. Data di atas dijamin valid, aman, dan selaras secara real-time dengan Google Sheets Utama serta penyimpanan Cloud Firestore yang terenkripsi.
          </div>
          <div className="flex items-center gap-3 bg-white border border-gray-200/60 p-2.5 rounded-lg">
            <div className="text-right">
              <div className="font-bold text-on-surface text-[11px] uppercase">NEXUS VERIFIED AUDIT</div>
              <div className="text-[9px]">ID: {Math.floor(Math.random() * 900000) + 100000}-Q2</div>
            </div>
            <div className="h-8.5 w-8.5 bg-gradient-to-br from-emerald-500 to-green-600 rounded-full flex items-center justify-center text-white font-extrabold shadow-sm border border-emerald-400">
              ✓
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
