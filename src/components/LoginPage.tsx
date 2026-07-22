import React, { useState } from 'react';
import { UserPlus, User, Lock, Eye, EyeOff, LogIn, HelpCircle, Headphones, BarChart2, ShieldCheck, Loader2, AlertCircle } from 'lucide-react';
import { googleSignIn } from '../lib/googleAuth';

interface LoginPageProps {
  onLoginSuccess: (userPayload?: any) => void;
}

export default function LoginPage({ onLoginSuccess }: LoginPageProps) {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authSuccess, setAuthSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Helper to fetch whitelisted emails
  const getAllowedEmails = (): string[] => {
    const stored = localStorage.getItem('nexus_allowed_emails');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          return parsed.map(e => String(e).trim().toLowerCase());
        }
      } catch (err) {
        console.error(err);
      }
    }
    const defaults = ['hilmiassidqi27@gmail.com', 'admin@nexus.com', 'recruiter@nexus.com', 'manager@nexus.com'];
    localStorage.setItem('nexus_allowed_emails', JSON.stringify(defaults));
    return defaults;
  };

  // Pre-configured simulated credentials (Username/Password)
  const getAuthorizedLogins = () => {
    const stored = localStorage.getItem('nexus_authorized_logins');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      } catch (err) {
        console.error(err);
      }
    }
    const defaults = [
      { username: 'admin', password: 'password123', role: 'Administrator', email: 'admin@nexus.com', fullName: 'PIC Rekrutmen' },
      { username: 'recruiter', password: 'password123', role: 'Recruiter', email: 'recruiter@nexus.com', fullName: 'Recruitment Staff' },
      { username: 'hilmiassidqi27', password: 'password123', role: 'Super Admin', email: 'hilmiassidqi27@gmail.com', fullName: 'Hilmi Assidqi' },
      { username: 'hilmi', password: 'password123', role: 'Manager', email: 'hilmi@nexus.com', fullName: 'Hilmi Manager' }
    ];
    localStorage.setItem('nexus_authorized_logins', JSON.stringify(defaults));
    return defaults;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsAuthenticating(true);
    setErrorMsg('');

    setTimeout(() => {
      const inputId = identifier.trim().toLowerCase();
      const credentialsList = getAuthorizedLogins();
      const matched = credentialsList.find(
        acc => (acc.username.toLowerCase() === inputId || acc.email.toLowerCase() === inputId) && acc.password === password
      );

      if (!matched) {
        setIsAuthenticating(false);
        setErrorMsg('Invalid login credentials. Access is restricted to specific authorized personnel.');
        return;
      }

      // Handle persistence
      if (rememberMe) {
        localStorage.setItem('nexus_remember_login', 'true');
        localStorage.setItem('nexus_logged_user', JSON.stringify({
          username: matched.username,
          email: matched.email,
          fullName: matched.fullName,
          role: matched.role
        }));
      } else {
        localStorage.removeItem('nexus_remember_login');
        localStorage.removeItem('nexus_logged_user');
      }

      setIsAuthenticating(false);
      setAuthSuccess(true);
      
      setTimeout(() => {
        onLoginSuccess(matched);
      }, 800);
    }, 1200);
  };

  const handleGoogleLogin = async () => {
    setIsAuthenticating(true);
    setErrorMsg('');
    try {
      const res = await googleSignIn();
      if (res) {
        const userEmail = res.user.email?.toLowerCase() || '';
        
        let allowedList = getAllowedEmails();
        try {
          const { fetchAllowedEmailsFromFirestore } = await import('../lib/firebaseService');
          const dbEmails = await fetchAllowedEmailsFromFirestore();
          if (dbEmails && dbEmails.length > 0) {
            allowedList = dbEmails;
            localStorage.setItem('nexus_allowed_emails', JSON.stringify(dbEmails));
          }
        } catch (dbErr) {
          console.error("Failed to fetch live allowed emails, falling back to local list:", dbErr);
        }

        if (!allowedList.includes(userEmail)) {
          const { logoutGoogle } = await import('../lib/googleAuth');
          await logoutGoogle();
          throw new Error(`Email "${res.user.email}" is not authorized. Whitelist this email in Settings first.`);
        }

        const userPayload = {
          username: res.user.displayName?.replace(/\s+/g, '').toLowerCase() || userEmail.split('@')[0],
          email: userEmail,
          fullName: res.user.displayName || 'Google User',
          role: 'Administrator',
          avatarUrl: res.user.photoURL || undefined
        };

        // Handle persistence
        if (rememberMe) {
          localStorage.setItem('nexus_remember_login', 'true');
          localStorage.setItem('nexus_logged_user', JSON.stringify(userPayload));
        } else {
          localStorage.removeItem('nexus_remember_login');
          localStorage.removeItem('nexus_logged_user');
        }

        setAuthSuccess(true);
        setTimeout(() => {
          onLoginSuccess(userPayload);
        }, 800);
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Google authentication failed.');
      setIsAuthenticating(false);
    }
  };

  return (
    <div className="bg-surface-bright flex min-h-screen items-center justify-center p-4 md:p-0 relative overflow-hidden font-sans">
      {/* Subtle Background Pattern */}
      <div 
        className="absolute inset-0 z-0 pointer-events-none opacity-20" 
        style={{ 
          backgroundImage: 'radial-gradient(#00355f 0.5px, transparent 0.5px)', 
          backgroundSize: '24px 24px' 
        }}
      />
      
      {/* Hero Image Decoration (Asymmetric Layout Element) */}
      <div className="hidden lg:block absolute -left-20 bottom-10 w-96 h-96 rounded-full bg-secondary-container blur-3xl opacity-40 z-0" />
      <div className="hidden lg:block absolute -right-20 top-10 w-80 h-80 rounded-full bg-primary-container blur-3xl opacity-20 z-0" />

      <main className="relative z-10 w-full max-w-[480px]">
        {/* Login Card Container */}
        <div className="bg-surface-container-lowest border border-table-border rounded-lg shadow-sm p-8 md:p-12">
          
          {/* Brand Identity */}
          <div className="flex flex-col items-center mb-10">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-primary flex items-center justify-center rounded">
                <UserPlus className="text-white w-6 h-6" />
              </div>
              <h1 className="font-sans text-3xl font-bold text-primary tracking-tight">Nexus Talent</h1>
            </div>
            <p className="font-sans text-sm text-on-surface-variant text-center">Recruitment Management System</p>
          </div>

          {/* Error Message Box */}
          {errorMsg && (
            <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded text-xs text-status-error flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-status-error" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Login Form */}
          <form className="space-y-6" onSubmit={handleSubmit}>
            
            {/* Username/Email Field */}
            <div className="space-y-1.5">
              <label className="font-mono text-[11px] font-semibold text-on-surface uppercase tracking-wider block" htmlFor="identifier">
                Username or Email
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant w-5 h-5" />
                <input 
                  type="text"
                  id="identifier" 
                  name="identifier" 
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="Enter your credentials" 
                  required
                  className="w-full h-11 pl-10 pr-4 bg-white border border-outline-variant rounded text-sm transition-all focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary font-sans"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="font-mono text-[11px] font-semibold text-on-surface uppercase tracking-wider block" htmlFor="password">
                  Password
                </label>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant w-5 h-5" />
                <input 
                  type={showPassword ? "text" : "password"}
                  id="password" 
                  name="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••" 
                  required
                  className="w-full h-11 pl-10 pr-12 bg-white border border-outline-variant rounded text-sm transition-all focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary font-sans"
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary focus:outline-none"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Action Row */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input 
                  type="checkbox" 
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-outline-variant text-primary focus:ring-primary"
                />
                <span className="font-sans text-xs text-on-surface-variant group-hover:text-on-surface transition-colors">
                  Remember me
                </span>
              </label>
              <button 
                type="button" 
                onClick={() => alert("Password reset is simulated. Any login attempt succeeds!")}
                className="font-mono text-xs font-semibold text-primary hover:underline underline-offset-4"
              >
                Forgot password?
              </button>
            </div>

            {/* Submit Button */}
            <button 
              type="submit" 
              disabled={isAuthenticating || authSuccess}
              className={`w-full text-white h-12 rounded font-sans font-medium text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98] ${
                authSuccess 
                  ? "bg-status-success" 
                  : "bg-primary hover:bg-primary-container"
              }`}
            >
              {isAuthenticating ? (
                <>
                  <Loader2 className="animate-spin w-5 h-5" />
                  <span>Authenticating...</span>
                </>
              ) : authSuccess ? (
                <>
                  <ShieldCheck className="w-5 h-5" />
                  <span>Success</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <LogIn className="w-5 h-5" />
                </>
              )}
            </button>

            {/* Separator */}
            <div className="relative flex py-1 items-center">
              <div className="flex-grow border-t border-table-border"></div>
              <span className="flex-shrink mx-4 text-[10px] font-mono text-on-surface-variant uppercase tracking-widest">or</span>
              <div className="flex-grow border-t border-table-border"></div>
            </div>

            {/* Google Login Button */}
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={isAuthenticating || authSuccess}
              className="w-full flex items-center justify-center gap-3 h-12 px-4 bg-white border border-outline-variant hover:border-primary/50 text-xs font-semibold text-on-surface hover:bg-surface-container-low/20 rounded shadow-sm transition-all cursor-pointer active:scale-[0.98]"
            >
              <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-5 h-5 shrink-0">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
              </svg>
              <span>Sign In with Google</span>
            </button>
          </form>

          {/* Footer Info */}
          <div className="mt-10 pt-8 border-t border-table-border text-center">
            <p className="font-sans text-xs text-on-surface-variant mb-4">Are you a recruiter or administrator?</p>
            <div className="flex flex-wrap justify-center items-center gap-3">
              <button 
                onClick={() => alert("Access Request Form is simulated.")}
                className="flex items-center gap-1.5 font-sans text-xs font-semibold text-secondary hover:text-primary transition-colors focus:outline-none"
              >
                <HelpCircle className="w-4 h-4" />
                <span>Request Access</span>
              </button>
              <span className="text-outline-variant">|</span>
              <button 
                onClick={() => alert("Please contact Hilmiassidqi27@gmail.com for technical support.")}
                className="flex items-center gap-1.5 font-sans text-xs font-semibold text-secondary hover:text-primary transition-colors focus:outline-none"
              >
                <Headphones className="w-4 h-4" />
                <span>Technical Support</span>
              </button>
            </div>
          </div>
        </div>

        {/* System Status Bar */}
        <div className="mt-6 flex items-center justify-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-status-success animate-pulse" />
            <span className="font-sans text-xs text-on-surface-variant">System Operational</span>
          </div>
          <span className="text-outline-variant text-[10px] font-mono">v2.4.0-build.82</span>
        </div>
      </main>

      {/* Side Graphic for Desktop */}
      <aside className="hidden xl:flex fixed right-8 top-1/2 -translate-y-1/2 flex-col gap-4 max-w-sm pointer-events-none">
        <div className="p-6 bg-surface-container-high border border-table-border rounded-lg space-y-4">
          <div className="w-12 h-12 rounded-full bg-primary-fixed flex items-center justify-center bg-[#d2e4ff]">
            <BarChart2 className="text-primary w-6 h-6" />
          </div>
          <h3 className="font-sans text-lg font-semibold text-primary">Advanced Analytics</h3>
          <p className="font-sans text-xs text-on-surface-variant leading-relaxed">
            Track your recruitment pipeline with real-time data visualization and industrial-grade reporting tools designed for high-volume operations.
          </p>
        </div>
        
        <div className="p-6 bg-surface-container-low border border-table-border rounded-lg space-y-4 opacity-70 scale-95 origin-right">
          <div className="w-12 h-12 rounded-full bg-secondary-fixed flex items-center justify-center bg-[#cbe7f5]">
            <ShieldCheck className="text-secondary w-6 h-6" />
          </div>
          <h3 className="font-sans text-lg font-semibold text-secondary">Secure Integration</h3>
          <p className="font-sans text-xs text-on-surface-variant leading-relaxed">
            Enterprise-level security protocols ensuring your talent pool and candidate data remain compliant and protected.
          </p>
        </div>
      </aside>
    </div>
  );
}
