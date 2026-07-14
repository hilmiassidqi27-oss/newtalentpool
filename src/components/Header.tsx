import { useState } from 'react';
import { Search, Bell, Grid, Download, CheckCircle2, RefreshCw } from 'lucide-react';
import { User, Candidate } from '../types';
import jsPDF from 'jspdf';

interface HeaderProps {
  user: User;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  candidates: Candidate[];
  onLogout: () => void;
}

export default function Header({ user, searchQuery, onSearchChange, candidates, onLogout }: HeaderProps) {
  const [showNotificationMenu, setShowNotificationMenu] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [exporting, setExporting] = useState(false);

  const notifications = [
    { id: 1, text: "Julianda Toni scheduled for User Interview", time: "10 mins ago", unread: true },
    { id: 2, text: "Hendrik, Fadillah and Taufik passed Medical Check", time: "2 hours ago", unread: true },
    { id: 3, text: "Completed daily pipeline tracking summary reports", time: "1 day ago", unread: false },
  ];

  const handleExport = () => {
    setExporting(true);
    setTimeout(() => {
      // Create JSON structure of candidate pipeline
      const jsonString = JSON.stringify(candidates, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const downloadAnchor = document.createElement('a');
      downloadAnchor.href = url;
      downloadAnchor.setAttribute("download", `RecruitPro_Pipeline_Report_${new Date().toISOString().split('T')[0]}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      document.body.removeChild(downloadAnchor);
      URL.revokeObjectURL(url);
      setExporting(false);
    }, 1000);
  };

  const handleExportCSV = () => {
    setExporting(true);
    setTimeout(() => {
      try {
        let csvContent = '\uFEFF'; // UTF-8 BOM for Excel compatibility
        
        const headers = [
          'ID', 
          'Nama Lengkap', 
          'Posisi Pekerjaan', 
          'Status Rekrutmen', 
          'Hasil HR Interview', 
          'Hasil User Interview', 
          'Catatan Evaluasi', 
          'Tanggal Ditambahkan', 
          'Sumber'
        ];
        
        csvContent += headers.map(h => `"${h.replace(/"/g, '""')}"`).join(',') + '\r\n';
        
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
        link.setAttribute('download', `RecruitPro_Pipeline_Sheets_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      } catch (error) {
        console.error('Error exporting CSV:', error);
      } finally {
        setExporting(false);
      }
    }, 1000);
  };

  const handleExportPDF = () => {
    setExporting(true);
    setTimeout(() => {
      try {
        const doc = new jsPDF({
          orientation: 'portrait',
          unit: 'mm',
          format: 'a4',
        });

        const pageWidth = doc.internal.pageSize.getWidth();
        
        // Header Banner
        doc.setFillColor(15, 76, 129); // Premium Blue Theme
        doc.rect(0, 0, pageWidth, 40, 'F');
        
        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(20);
        doc.text('RECRUITPRO PIPELINE REPORT', 15, 18);
        
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.text(`Generated: ${new Date().toLocaleDateString('id-ID')} | Total Candidates: ${candidates.length}`, 15, 28);
        
        // Summary statistics
        doc.setTextColor(50, 50, 50);
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('Pipeline Summary Statistics:', 15, 52);
        
        const hired = candidates.filter(c => c.status === 'Onboarding' || c.status === 'Lolos').length;
        const pending = candidates.filter(c => c.status === 'Pending').length;
        const interview = candidates.filter(c => c.status === 'HR Interview' || c.status === 'User Interview').length;
        const rejected = candidates.filter(c => c.status === 'Ditolak').length;
        
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.text(`• Lolos / Onboarding: ${hired}`, 20, 60);
        doc.text(`• Interviewing: ${interview}`, 20, 66);
        doc.text(`• Pending Review: ${pending}`, 80, 60);
        doc.text(`• Rejected: ${rejected}`, 80, 66);
        
        // Line separator
        doc.setDrawColor(220, 220, 220);
        doc.setLineWidth(0.5);
        doc.line(15, 75, pageWidth - 15, 75);
        
        // Table Headers
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.text('ID', 15, 83);
        doc.text('Name', 25, 83);
        doc.text('Position', 75, 83);
        doc.text('Status', 125, 83);
        doc.text('Source', 165, 83);
        
        doc.line(15, 87, pageWidth - 15, 87);
        
        // Candidates rows
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        let y = 94;
        
        candidates.forEach((cand) => {
          if (y > 275) {
            doc.addPage();
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(10);
            doc.text('ID', 15, 15);
            doc.text('Name', 25, 15);
            doc.text('Position', 75, 15);
            doc.text('Status', 125, 15);
            doc.text('Source', 165, 15);
            doc.line(15, 18, pageWidth - 15, 18);
            
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(9);
            y = 25;
          }
          
          doc.text(String(cand.id), 15, y);
          
          const nameText = cand.name.length > 24 ? cand.name.substring(0, 22) + '..' : cand.name;
          const posText = cand.position.length > 24 ? cand.position.substring(0, 22) + '..' : cand.position;
          
          doc.text(nameText, 25, y);
          doc.text(posText, 75, y);
          doc.text(cand.status, 125, y);
          doc.text(cand.source || 'LinkedIn', 165, y);
          
          y += 8;
        });
        
        // Save PDF
        doc.save(`RecruitPro_Pipeline_Report_${new Date().toISOString().split('T')[0]}.pdf`);
      } catch (error) {
        console.error('Error generating programmatic PDF:', error);
      } finally {
        setExporting(false);
      }
    }, 1000);
  };

  return (
    <header className="flex justify-between items-center h-16 px-8 bg-surface-container-lowest border-b border-table-border sticky top-0 z-40 font-sans">
      {/* Left Title & Search */}
      <div className="flex items-center gap-6 flex-1 max-w-2xl">
        <h2 className="text-sm font-bold text-primary whitespace-nowrap tracking-tight md:text-base lg:text-lg">
          Recruitment Pipeline
        </h2>
        
        {/* Interactive Search Bar */}
        <div className="relative w-full max-w-md hidden sm:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant w-4 h-4" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search candidates, positions..."
            className="w-full pl-10 pr-4 py-2 bg-surface-container-low border border-transparent rounded focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary text-xs font-sans text-on-surface"
          />
          {searchQuery && (
            <button 
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-on-surface-variant hover:text-primary"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Right Actions & Profile */}
      <div className="flex items-center gap-4">
        
        {/* Export Button & Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setShowExportMenu(!showExportMenu);
              setShowNotificationMenu(false);
              setShowProfileMenu(false);
            }}
            disabled={exporting}
            className="bg-primary text-white px-4 py-2 rounded font-sans font-semibold text-xs hover:bg-primary-container transition-colors flex items-center gap-1.5 focus:outline-none cursor-pointer"
          >
            {exporting ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Download className="w-3.5 h-3.5" />
            )}
            <span>{exporting ? 'Exporting...' : 'Export Report'}</span>
            <span className="text-[9px] opacity-80">▼</span>
          </button>

          {showExportMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-white border border-table-border rounded-lg shadow-lg z-50 py-1 font-sans">
              <div className="px-4 py-1.5 border-b border-table-border bg-surface-container-low text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">
                Pilih Format Laporan
              </div>
              <button
                onClick={() => {
                  setShowExportMenu(false);
                  handleExportCSV();
                }}
                className="w-full text-left px-4 py-2 text-xs text-on-surface hover:bg-surface-container-low transition-colors flex items-center gap-2 cursor-pointer"
              >
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
                <div className="min-w-0">
                  <p className="font-semibold text-on-surface text-[11px] leading-tight">Laporan Excel / Sheets</p>
                  <p className="text-[9px] text-on-surface-variant font-mono truncate">Format .csv spreadsheet</p>
                </div>
              </button>
              <button
                onClick={() => {
                  setShowExportMenu(false);
                  handleExportPDF();
                }}
                className="w-full text-left px-4 py-2 text-xs text-on-surface hover:bg-surface-container-low transition-colors flex items-center gap-2 cursor-pointer"
              >
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 shrink-0" />
                <div className="min-w-0">
                  <p className="font-semibold text-on-surface text-[11px] leading-tight">Laporan Resmi PDF</p>
                  <p className="text-[9px] text-on-surface-variant font-mono truncate">Format PDF Berwarna</p>
                </div>
              </button>
              <button
                onClick={() => {
                  setShowExportMenu(false);
                  handleExport();
                }}
                className="w-full text-left px-4 py-2 text-xs text-on-surface hover:bg-surface-container-low transition-colors flex items-center gap-2 cursor-pointer"
              >
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shrink-0" />
                <div className="min-w-0">
                  <p className="font-semibold text-on-surface text-[11px] leading-tight">Data Mentah JSON</p>
                  <p className="text-[9px] text-on-surface-variant font-mono truncate">Data pipeline terstruktur</p>
                </div>
              </button>
            </div>
          )}
        </div>

        {/* Notifications Button & Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotificationMenu(!showNotificationMenu);
              setShowProfileMenu(false);
            }}
            className="p-2 text-on-surface-variant hover:bg-surface-container-low rounded-full transition-colors relative focus:outline-none cursor-pointer"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-status-warning rounded-full border border-white" />
          </button>

          {showNotificationMenu && (
            <div className="absolute right-0 mt-2 w-80 bg-white border border-table-border rounded-lg shadow-lg z-50 overflow-hidden">
              <div className="px-4 py-3 border-b border-table-border bg-surface-container-low flex justify-between items-center">
                <span className="font-semibold text-xs text-primary">Notifications</span>
                <span className="text-[10px] text-status-success font-semibold uppercase">2 New</span>
              </div>
              <div className="divide-y divide-table-border max-h-64 overflow-y-auto">
                {notifications.map((notif) => (
                  <div key={notif.id} className={`px-4 py-3 hover:bg-surface-container-low transition-colors ${notif.unread ? 'bg-blue-50/20' : ''}`}>
                    <p className="text-xs text-on-surface font-sans leading-snug">{notif.text}</p>
                    <span className="text-[10px] text-on-surface-variant mt-1 block">{notif.time}</span>
                  </div>
                ))}
              </div>
              <div className="px-4 py-2 text-center border-t border-table-border bg-surface-container-low">
                <button 
                  onClick={() => setShowNotificationMenu(false)}
                  className="text-[11px] font-semibold text-primary hover:underline focus:outline-none"
                >
                  Mark all as read
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Apps Grid Icon */}
        <button
          onClick={() => alert("Core Integration Suites Loaded. RecruitPro connected securely with Spanner and Workspace G-Suite.")}
          className="p-2 text-on-surface-variant hover:bg-surface-container-low rounded-full transition-colors focus:outline-none hidden sm:block cursor-pointer"
        >
          <Grid className="w-5 h-5" />
        </button>

        {/* User profile section */}
        <div className="relative">
          <button
            onClick={() => {
              setShowProfileMenu(!showProfileMenu);
              setShowNotificationMenu(false);
            }}
            className="flex items-center gap-3 pl-4 border-l border-table-border text-left focus:outline-none cursor-pointer"
          >
            <div className="text-right hidden md:block">
              <p className="font-sans text-xs font-semibold text-on-surface leading-none">{user.fullName}</p>
              <p className="font-mono text-[11px] font-medium text-on-surface-variant mt-0.5 leading-none">{user.role}</p>
            </div>
            <img
              referrerPolicy="no-referrer"
              src={user.avatarUrl}
              alt="Profile"
              className="w-8 h-8 rounded-full bg-surface-container-high object-cover ring-2 ring-primary/10 hover:ring-primary/30 transition-all"
            />
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white border border-table-border rounded-lg shadow-lg z-50 py-1">
              <div className="px-4 py-2 border-b border-table-border">
                <p className="text-xs font-bold text-on-surface leading-snug">{user.fullName}</p>
                <p className="text-[11px] text-on-surface-variant font-mono truncate">{user.email}</p>
              </div>
              <button
                onClick={() => {
                  setShowProfileMenu(false);
                  alert(`Logged in as Administrator (${user.email}). System fully operational!`);
                }}
                className="w-full text-left px-4 py-2 text-xs text-on-surface hover:bg-surface-container-low transition-colors font-sans focus:outline-none"
              >
                My Account
              </button>
              <button
                onClick={() => {
                  setShowProfileMenu(false);
                  onLogout();
                }}
                className="w-full text-left px-4 py-2 text-xs text-status-error hover:bg-red-50/50 transition-colors font-sans focus:outline-none"
              >
                Sign Out
              </button>
            </div>
          )}
        </div>

      </div>
    </header>
  );
}
