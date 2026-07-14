import { 
  LayoutDashboard, 
  Users, 
  Briefcase, 
  Calendar, 
  Database, 
  BarChart3, 
  Plus, 
  Settings, 
  HelpCircle,
  LogOut,
  FileSpreadsheet
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onAddCandidate: () => void;
  onLogout: () => void;
}

export default function Sidebar({ activeTab, setActiveTab, onAddCandidate, onLogout }: SidebarProps) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'candidates', label: 'Candidates', icon: Users },
    { id: 'jobs', label: 'Job Openings', icon: Briefcase },
    { id: 'interviews', label: 'Interviews', icon: Calendar },
    { id: 'talent', label: 'Talent Pool', icon: Database },
    { id: 'sheets', label: 'Sheets Sync', icon: FileSpreadsheet },
    { id: 'reports', label: 'Reports', icon: BarChart3 },
  ];

  return (
    <aside className="h-screen w-64 fixed left-0 top-0 bg-surface-container-lowest border-r border-table-border flex flex-col py-6 z-50">
      {/* Brand Header */}
      <div className="px-6 mb-8">
        <h1 className="font-sans text-lg font-bold text-primary">RecruitPro</h1>
        <p className="font-mono text-xs font-semibold text-on-surface-variant uppercase tracking-wider">Admin Console</p>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center px-6 py-3 transition-colors duration-200 text-left focus:outline-none ${
                isActive
                  ? 'text-primary font-bold border-r-4 border-primary bg-surface-container-low/50'
                  : 'text-on-surface-variant hover:bg-surface-container-low'
              }`}
            >
              <Icon className="mr-3 w-5 h-5 shrink-0" />
              <span className="font-sans text-xs font-semibold">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Add Candidate Button */}
      <div className="px-6 mb-6">
        <button
          onClick={onAddCandidate}
          className="w-full bg-primary text-white py-3 px-4 rounded font-sans font-semibold text-xs hover:bg-primary-container transition-colors flex items-center justify-center gap-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
        >
          <Plus className="w-4 h-4 shrink-0" />
          <span>Add Candidate</span>
        </button>
      </div>

      {/* Footer Settings & Support */}
      <div className="border-t border-table-border pt-4 space-y-1">
        <button
          onClick={() => {
            setActiveTab('settings');
          }}
          className={`w-full flex items-center px-6 py-2 transition-colors duration-200 text-left focus:outline-none ${
            activeTab === 'settings' ? 'text-primary font-bold' : 'text-on-surface-variant hover:bg-surface-container-low'
          }`}
        >
          <Settings className="mr-3 w-5 h-5 shrink-0" />
          <span className="font-sans text-xs font-semibold">Settings</span>
        </button>
        
        <button
          onClick={() => alert('Support ticketing system is loaded. For urgent issues, email Hilmiassidqi27@gmail.com')}
          className="w-full flex items-center px-6 py-2 text-on-surface-variant hover:bg-surface-container-low transition-colors duration-200 text-left focus:outline-none"
        >
          <HelpCircle className="mr-3 w-5 h-5 shrink-0" />
          <span className="font-sans text-xs font-semibold">Support</span>
        </button>

        <button
          onClick={onLogout}
          className="w-full flex items-center px-6 py-2 text-status-error hover:bg-red-50/50 transition-colors duration-200 text-left focus:outline-none"
        >
          <LogOut className="mr-3 w-5 h-5 shrink-0" />
          <span className="font-sans text-xs font-semibold">Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
