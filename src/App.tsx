import { useEffect, useState, type FormEvent, type MouseEvent } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  Download,
  Plus,
  RefreshCw,
  LogOut,
  MapPin,
  Trophy,
  Leaf,
  Settings,
  Sparkles,
  Github,
  Globe,
  Compass,
  ArrowRight,
  Trash2,
  CheckCircle2
} from 'lucide-react';
import { useStore } from './store/useStore.js';
import SplashScreen from './components/SplashScreen.js';
import Navbar from './components/Navbar.js';
import ScoreRing from './components/ScoreRing.js';
import WeeklyChart from './components/WeeklyChart.js';
import CategoryBreakdown from './components/CategoryBreakdown.js';
import CalendarHeatmap from './components/CalendarHeatmap.js';
import LeaderboardTable from './components/LeaderboardTable.js';
import ActivityForm from './components/ActivityForm.js';
import OffsetCard, { OFFSET_PROJECTS } from './components/OffsetCard.js';
import AIInsightCard from './components/AIInsightCard.js';
import GlobalEmissionsCounter from './components/GlobalEmissionsCounter.js';
import { Toaster, toast } from 'sonner';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const NAME_PATTERN = /^[a-zA-Z][a-zA-Z\s'.-]{1,79}$/;

const normalizeText = (value: string) => value.trim().replace(/\s+/g, ' ');

const getPasswordError = (password: string) => {
  if (!password) return 'Please enter a password';
  if (password.length < 8) return 'Password must be at least 8 characters';
  if (password.length > 128) return 'Password must be 128 characters or less';
  return null;
};

const createGuestIdentity = () => {
  const guestId = crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  return {
    id: guestId,
    email: `guest-${guestId}@guest.trace.earth`,
    password: `Guest-${guestId}`,
  };
};

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [authEmail, setAuthEmail] = useState('');
  const [authName, setAuthName] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authCity, setAuthCity] = useState('');
  const [authCountry, setAuthCountry] = useState('');
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [logSuccess, setLogSuccess] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [authError, setAuthError] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.location.search.includes('error') || window.location.href.includes('error');
    }
    return false;
  });
  
  // Settings view inputs
  const [tgtName, setTgtName] = useState('');
  const [tgtCity, setTgtCity] = useState('');
  const [tgtCountry, setTgtCountry] = useState('');
  const [tgtTarget, setTgtTarget] = useState(13.7);
  const [tgtImage, setTgtImage] = useState('');

  const {
    email,
    user,
    scoreToday,
    consecutiveDays,
    averageKg,
    todayCategoryBreakdown,
    stats7Days,
    categoryBreakdown,
    history,
    leaderboard,
    aiTip,
    loading,
    error,
    activeTab,
    setEmail,
    setActiveTab,
    fetchStats,
    fetchLeaderboard,
    fetchAiTip,
    saveLog,
    updateProfile,
  } = useStore();

  // On mount or email change, fetch database records
  useEffect(() => {
    if (email) {
      fetchStats();
      fetchLeaderboard();
      fetchAiTip();
    }
  }, [email]);

  // On mount: check session from server cookie and register message receiver for OAuth popup frames
  useEffect(() => {
    const checkUserSession = async () => {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          if (data.authenticated && data.user?.email) {
            setEmail(data.user.email);
            setActiveTab('dashboard');
          }
        }
      } catch (err) {
        console.error('Error during automatic session check:', err);
      }
    };
    checkUserSession();

    const receiveOAuthMessage = (event: MessageEvent) => {
      if (event.data?.type === 'OAUTH_AUTH_SUCCESS' && event.data?.email) {
        setEmail(event.data.email);
        setActiveTab('dashboard');
        toast.success(`Successfully signed in as ${event.data.email}!`);
      } else if (event.data?.type === 'OAUTH_AUTH_FAILURE') {
        toast.error(`OAuth login failed: ${event.data.error || 'Identity verification cancelled'}`);
      }
    };

    window.addEventListener('message', receiveOAuthMessage);
    return () => {
      window.removeEventListener('message', receiveOAuthMessage);
    };
  }, []);

  // Sync settings local state with loaded user profile
  useEffect(() => {
    if (user) {
      setTgtName(user.name || '');
      setTgtCity(user.city || '');
      setTgtCountry(user.country || '');
      setTgtTarget(user.targetKgPerDay);
      setTgtImage(user.image || '🌿');
    }
  }, [user]);

  const handleSplashComplete = () => {
    setShowSplash(false);
  };

  const handleOAuthLogin = (e: MouseEvent, provider: 'google' | 'github') => {
    e.preventDefault();
    setAuthLoading(true);

    const width = 600;
    const height = 700;
    const left = window.screen.width / 2 - width / 2;
    const top = window.screen.height / 2 - height / 2;

    const popup = window.open(
      `/api/auth/${provider}`,
      'oauth_popup',
      `width=${width},height=${height},left=${left},top=${top},status=no,resizable=yes`
    );

    if (!popup) {
      toast.error('Popup blocked! Please allow popups to sign in.');
      setAuthLoading(false);
      return;
    }

    const checkPopupClosed = setInterval(() => {
      if (popup.closed) {
        clearInterval(checkPopupClosed);
        setAuthLoading(false);
      }
    }, 1000);
  };

  const handleSimulateLogin = async (e: FormEvent, provider: 'google' | 'github' | 'guest' | 'email') => {
    e.preventDefault();
    setAuthLoading(true);

    let resolvedEmail = 'aryan.raj@trace.earth';
    let resolvedName = 'Aryan Raj';

    if (provider === 'guest') {
      const guest = createGuestIdentity();
      try {
        const response = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: 'Guest',
            email: guest.email,
            password: guest.password,
            city: 'New Delhi',
            country: 'India',
          }),
        });
        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Could not create guest account');
        }
        const data = await response.json();
        resolvedEmail = data.user.email;
        resolvedName = 'Guest';
        localStorage.setItem('trace_guest_id', guest.id);
        localStorage.setItem('trace_guest_email', resolvedEmail);
      } catch (err: any) {
        toast.error(err.message || 'Could not create guest account');
        setAuthLoading(false);
        return;
      }
    } else if (provider === 'google') {
      resolvedEmail = 'aryan.google@gmail.com';
      resolvedName = 'Aryan Raj (Google)';
    } else if (provider === 'github') {
      resolvedEmail = 'aryan.github@gmail.com';
      resolvedName = 'Aryan Raj (GitHub)';
    } else if (provider === 'email') {
      const emailVal = authEmail.trim().toLowerCase();
      const passwordError = getPasswordError(authPassword);

      if (!EMAIL_PATTERN.test(emailVal)) {
        toast.error('Please enter a valid email address');
        setAuthLoading(false);
        return;
      }

      if (passwordError) {
        toast.error(passwordError);
        setAuthLoading(false);
        return;
      }
      try {
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: emailVal, password: authPassword }),
        });
        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Invalid email or password');
        }
        const data = await response.json();
        resolvedEmail = data.user.email;
        resolvedName = data.user.name || 'User';
        toast.success(`Welcome back, ${resolvedName}!`);
      } catch (err: any) {
        toast.error(err.message || 'Login failed');
        setAuthLoading(false);
        return;
      }
    }

    // Set email inside store (triggers automated DB sync)
    setEmail(resolvedEmail);
    
    if (provider === 'guest') {
      setAuthLoading(false);
      setActiveTab('dashboard');
      toast.success('Signed in as Guest');
      return;
    }

    // Set custom initial values for profile if creating new
    setTimeout(async () => {
      await updateProfile({
        name: resolvedName,
        city: 'New Delhi',
        country: 'India',
      });
      setAuthLoading(false);
      setActiveTab('dashboard');
    }, 800);
  };

  const handleRealRegister = async (e: FormEvent) => {
    e.preventDefault();
    const nameVal = normalizeText(authName);
    const emailVal = authEmail.trim().toLowerCase();
    const cityVal = normalizeText(authCity);
    const countryVal = normalizeText(authCountry);
    const passwordError = getPasswordError(authPassword);

    if (!NAME_PATTERN.test(nameVal)) {
      toast.error('Please enter a valid name');
      return;
    }

    if (!EMAIL_PATTERN.test(emailVal)) {
      toast.error('Please enter a valid email address');
      return;
    }

    if (passwordError) {
      toast.error(passwordError);
      return;
    }

    if (!NAME_PATTERN.test(cityVal)) {
      toast.error('Please enter a valid city');
      return;
    }

    if (!NAME_PATTERN.test(countryVal)) {
      toast.error('Please enter a valid country');
      return;
    }
    setAuthLoading(true);
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: nameVal,
          email: emailVal,
          password: authPassword,
          city: cityVal,
          country: countryVal,
        }),
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Registration failed');
      }
      const data = await response.json();
      toast.success("Account registered! Logging you in...");
      
      setEmail(data.user.email);
      setTimeout(async () => {
        await updateProfile({
          name: nameVal,
          city: cityVal,
          country: countryVal,
        });
        setAuthLoading(false);
        setActiveTab('dashboard');
      }, 800);
    } catch (err: any) {
      toast.error(err.message || 'Registration failed');
      setAuthLoading(false);
    }
  };

  const handleUpdateProfileSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const ok = await updateProfile({
      name: tgtName,
      city: tgtCity,
      country: tgtCountry,
      targetKgPerDay: Number(tgtTarget),
      image: tgtImage,
    });
    if (ok) {
      toast.success("Changes saved");
    }
  };

  const handleExportCSV = () => {
    window.location.href = `/api/export?email=${encodeURIComponent(email)}`;
  };

  const handleLogSuccessDismiss = () => {
    setLogSuccess(false);
    setActiveTab('dashboard');
  };

  const handleResetData = () => {
    setShowResetConfirm(true);
  };

  const handleUserLogout = async () => {
    localStorage.removeItem('trace_user_email');
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (err) {
      console.error('Failed backend session logout:', err);
    }
    window.location.reload();
  };

  // 1. Initial Splash Screen loader
  if (showSplash) {
    return <SplashScreen onComplete={handleSplashComplete} />;
  }

  // 2. Simulated Auth / Onboarding Landing Page (if user clicked logout or has no session email yet)
  if (activeTab === 'landing' || !email) {
    return (
      <div className="min-h-screen flex flex-col justify-between bg-white dark:bg-zinc-950 text-slate-800 dark:text-zinc-100 font-sans p-6 select-none relative overflow-hidden">
        {/* Subtle background nodes for decorative aesthetics */}
        <div className="absolute top-0 right-0 h-[400px] w-[400px] bg-radial from-emerald-500/5 via-transparent to-transparent pointer-events-none" />
        <div className="absolute bottom-0 left-0 h-[400px] w-[400px] bg-radial from-blue-500/5 via-transparent to-transparent pointer-events-none" />

        {/* Top Header */}
        <header className="flex items-center justify-between max-w-7xl mx-auto w-full">
          <div className="flex items-center space-x-1.5">
            <span className="font-sans text-[18px] font-bold text-slate-800 dark:text-zinc-100 tracking-tight">
              <span className="font-medium">trace</span>
              <span className="font-normal text-green-600 dark:text-green-400">.earth</span>
            </span>
          </div>
          
          <span className="font-sans text-xs text-slate-600 dark:text-zinc-400 font-medium">Environment Dashboard</span>
        </header>

        {/* Middle Core Card block */}
        <main className="max-w-md w-full mx-auto my-12 bg-white dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800 p-6 sm:p-8 pt-12 space-y-6 shadow-xl relative">
          <div className="text-center space-y-2">
            <div className="flex justify-center pb-2">
              <svg width="160" height="40" viewBox="0 0 160 40" xmlns="http://www.w3.org/2000/svg">
                <rect width="160" height="40" rx="20" fill="#16a34a"/>
                <defs><clipPath id="ac"><circle cx="22" cy="20" r="10"/></clipPath></defs>
                <circle cx="22" cy="20" r="10" fill="#166534"/>
                <ellipse cx="20" cy="19" rx="3" ry="4" fill="#4ade80" opacity="0.8" clipPath="url(#ac)"/>
                <ellipse cx="26" cy="22" rx="2.5" ry="3" fill="#4ade80" opacity="0.6" clipPath="url(#ac)"/>
                <ellipse cx="22" cy="20" rx="13" ry="4" fill="none" stroke="#4ade80" strokeWidth="1" strokeDasharray="3 2" opacity="0.5"/>
                <circle cx="35" cy="20" r="2" fill="#4ade80"/>
                <text x="46" y="25" fontFamily="Inter, sans-serif" fontSize="14" fontWeight="500" fill="white">trace<tspan fill="#bbf7d0" fontWeight="400">.earth</tspan></text>
              </svg>
            </div>
            <h1 className="font-sans text-2xl font-bold text-slate-900 tracking-tight dark:text-zinc-100">
              Begin footprint tracking
            </h1>
            <p className="text-slate-600 text-xs leading-relaxed dark:text-zinc-400">
              Measure, visualize, and reduce your daily emission pillars in one simple client-side platform.
            </p>
          </div>

          {/* Google and GitHub Sign-in buttons */}
          <div className="space-y-3">
            <button
              onClick={(e) => handleOAuthLogin(e, 'google')}
              className="w-full flex items-center justify-center space-x-2 rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 py-2 px-4 text-xs font-semibold text-slate-700 dark:text-zinc-200 hover:bg-slate-50 dark:hover:bg-zinc-800 hover:text-slate-950 hover:border-slate-300 transition-all active:scale-98 cursor-pointer"
            >
              <Globe className="h-4 w-4 text-blue-500" />
              <span>Sign in with Google</span>
            </button>
            
            <button
              onClick={(e) => handleOAuthLogin(e, 'github')}
              className="w-full flex items-center justify-center space-x-2 rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 py-2 px-4 text-xs font-semibold text-slate-700 dark:text-zinc-200 hover:bg-slate-50 dark:hover:bg-zinc-800 hover:text-slate-950 hover:border-slate-300 transition-all active:scale-98 cursor-pointer"
            >
              <Github className="h-4 w-4 text-slate-950 dark:text-zinc-100" />
              <span>Sign in with GitHub</span>
            </button>
          </div>

          {authError && (
            <p className="text-xs text-red-500 font-semibold text-center bg-red-50 dark:bg-red-950/10 border border-red-100 dark:border-red-950/20 py-2 rounded-lg">
              Sign-in failed. Please try again.
            </p>
          )}

          <div className="relative flex py-2 items-center text-[10px] text-slate-600 dark:text-zinc-400 uppercase tracking-widest font-semibold">
            <div className="flex-grow border-t border-slate-200 dark:border-zinc-800"></div>
            <span className="flex-shrink mx-3 whitespace-nowrap">OR</span>
            <div className="flex-grow border-t border-slate-200 dark:border-zinc-800"></div>
          </div>

          {!isRegisterMode ? (
            /* Email Login form setup */
            <form className="space-y-4" onSubmit={(e) => handleSimulateLogin(e, 'email')}>
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-700 dark:text-zinc-300 uppercase tracking-wider">Email Address</label>
                <input
                  type="email"
                  placeholder=""
                  required
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 py-2 text-xs text-slate-950 dark:text-zinc-100 outline-none focus:border-green-500 font-medium"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-700 dark:text-zinc-300 uppercase tracking-wider">Password</label>
                <input
                  type="password"
                  placeholder=""
                  required
                  minLength={8}
                  maxLength={128}
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 py-2 text-xs text-slate-950 dark:text-zinc-100 outline-none focus:border-green-500 font-medium"
                />
              </div>

              {/* Below inputs links */}
              <div className="flex items-center justify-between text-xs pt-1">
                <span className="text-slate-500 dark:text-zinc-400">
                  New User?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setIsRegisterMode(true);
                      setAuthName('');
                      setAuthEmail('');
                      setAuthPassword('');
                    }}
                    className="text-green-600 dark:text-green-400 font-bold hover:underline cursor-pointer ml-0.5"
                  >
                    Create account
                  </button>
                </span>
                <button
                  type="button"
                  onClick={() => toast.info('Forgot password instructions have been sent via mock SMTP.')}
                  className="text-slate-500 dark:text-zinc-400 hover:text-green-600 dark:hover:text-green-400 hover:underline cursor-pointer font-bold"
                >
                  Forgot password
                </button>
              </div>

              <button
                type="submit"
                disabled={authLoading}
                className="w-full flex items-center justify-center space-x-1 rounded-lg bg-green-600 text-white font-bold py-2 px-4 text-xs hover:bg-green-700 transition-all active:scale-98 disabled:opacity-50 cursor-pointer shadow-sm mt-2"
              >
                <span>{authLoading ? 'Logging In...' : 'Log In'}</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </form>
          ) : (
            /* Register Account mode */
            <form className="space-y-4" onSubmit={handleRealRegister}>
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-700 dark:text-zinc-300 uppercase tracking-wider">Name</label>
                <input
                  type="text"
                  placeholder=""
                  required
                  minLength={2}
                  maxLength={80}
                  value={authName}
                  onChange={(e) => setAuthName(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 py-2 text-xs text-slate-950 dark:text-zinc-100 outline-none focus:border-green-500 font-medium"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-700 dark:text-zinc-300 uppercase tracking-wider">Email</label>
                <input
                  type="email"
                  placeholder=""
                  required
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 py-2 text-xs text-slate-950 dark:text-zinc-100 outline-none focus:border-green-500 font-medium"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-700 dark:text-zinc-300 uppercase tracking-wider">Password</label>
                <input
                  type="password"
                  placeholder=""
                  required
                  minLength={8}
                  maxLength={128}
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 py-2 text-xs text-slate-950 dark:text-zinc-100 outline-none focus:border-green-500 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-700 dark:text-zinc-300 uppercase tracking-wider">City</label>
                  <input
                    type="text"
                    placeholder=""
                    required
                    minLength={2}
                    maxLength={80}
                    value={authCity}
                    onChange={(e) => setAuthCity(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 py-2 text-xs text-slate-950 dark:text-zinc-100 outline-none focus:border-green-500 font-medium"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-700 dark:text-zinc-300 uppercase tracking-wider">Country</label>
                  <input
                    type="text"
                    placeholder=""
                    required
                    minLength={2}
                    maxLength={80}
                    value={authCountry}
                    onChange={(e) => setAuthCountry(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 py-2 text-xs text-slate-950 dark:text-zinc-100 outline-none focus:border-green-500 font-medium"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={authLoading}
                className="w-full flex items-center justify-center space-x-1 rounded-lg bg-green-600 text-white font-bold py-2 px-4 text-xs hover:bg-green-700 transition-all active:scale-98 disabled:opacity-50 cursor-pointer shadow-sm mt-2"
              >
                <span>{authLoading ? 'Creating...' : 'CREATE'}</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>

              <div className="text-center pt-1 text-xs">
                <button
                  type="button"
                  onClick={() => setIsRegisterMode(false)}
                  className="text-green-600 dark:text-green-400 font-bold hover:underline cursor-pointer"
                >
                  Already have an account? Sign In
                </button>
              </div>
            </form>
          )}

          {/* Guest account immediate testing skip */}
          <div className="text-center pt-2 border-t border-slate-100 dark:border-zinc-800">
            <button
              onClick={(e) => handleSimulateLogin(e, 'guest')}
              className="text-xs text-slate-600 dark:text-zinc-400 hover:text-green-600 dark:hover:text-green-400 transition-colors font-bold underline cursor-pointer"
            >
              Enter as guest
            </button>
          </div>
        </main>

        {/* Footer */}
        <footer className="text-center text-slate-600 dark:text-zinc-500 text-[11px] font-semibold font-sans">
          <span>PromptWars • Built by <a href="https://github.com/aryxncodes7" target="_blank" rel="noopener noreferrer" className="text-green-600 hover:underline font-semibold transition-all">Aryan Raj</a></span>
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-[#121212] text-slate-800 dark:text-zinc-100 font-sans pb-24 md:pb-6 relative flex flex-col justify-between">
      {/* Dynamic Navigation */}
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} email={email} user={user} onLogout={handleUserLogout} />

      {/* Main Container Core */}
      <main className="mx-auto w-full max-w-7xl px-4 md:px-6 pt-6 flex-grow">
        {loading && (
          <div className="fixed top-2 right-4 z-50 flex items-center space-x-1.5 rounded-lg bg-white border border-slate-200 px-3 py-1 shadow-sm text-xs text-slate-500">
            <RefreshCw className="h-3 w-3 animate-spin text-green-600" />
            <span>Syncing database...</span>
          </div>
        )}

        {error && (
          <div className="mb-6 rounded-lg border border-red-100 bg-red-50 p-4 text-sm text-red-600 font-medium flex items-center justify-between">
            <span>{error}</span>
            <button onClick={() => fetchStats()} className="text-xs underline hover:no-underline">Retry syncing</button>
          </div>
        )}

        {/* --- VIEW 1: DASHBOARD --- */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Top Greeting banner summary */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-5 gap-3">
              <div>
                <h1 className="font-sans text-xl font-semibold text-slate-800 tracking-tight dark:text-zinc-100">
                  Namaste, {user?.name || email.split('@')[0]}
                </h1>
                <div className="flex flex-col gap-1 mt-0.5">
                  <span className="text-xs text-slate-500 font-medium">
                    Currently logging emissions in <span className="text-slate-600 dark:text-zinc-300">{user?.city || 'New Delhi'}, {user?.country || 'India'}</span>
                  </span>
                  <span className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
                    <span>Streak:</span>
                    <span className="text-green-600 font-semibold">{consecutiveDays} days</span>
                  </span>
                </div>
              </div>

              {/* Functional Dashboard Action Controls */}
              <div className="flex items-center space-x-1.5 self-start sm:self-auto">
                <button
                  onClick={handleExportCSV}
                  className="inline-flex items-center space-x-1.5 rounded-lg border border-slate-200 bg-white py-1.5 px-3.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-800 hover:border-slate-300 transition-all active:scale-95 cursor-pointer"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Download .CSV</span>
                </button>
                
                <button
                  onClick={() => setActiveTab('log')}
                  className="inline-flex items-center space-x-1.5 rounded-lg bg-green-600 py-1.5 px-3.5 text-xs font-semibold text-white hover:bg-green-700 transition-all active:scale-95 cursor-pointer shadow-sm shadow-green-600/10"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Log Activity</span>
                </button>
              </div>
            </div>

            <GlobalEmissionsCounter />

            {/* Core Bento Grid layout */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* LEFT SIDE COLUMN (Scoring and AI Advice, takes 1 column) */}
              <div className="md:col-span-1 space-y-6">
                {/* Scoring ring dashboard box card */}
                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:bg-zinc-950 dark:border-zinc-800">
                  <ScoreRing score={scoreToday} target={user?.targetKgPerDay || 13.7} />
                </div>

                {/* Intelligent Coach AI advice element */}
                <AIInsightCard tip={aiTip} onRefresh={fetchAiTip} />
              </div>

              {/* RIGHT SIDE COLUMN (Charts and History lists, takes 2 columns) */}
              <div className="md:col-span-2 space-y-6">
                {/* Trends Line chart box card */}
                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm space-y-4 dark:bg-zinc-950 dark:border-zinc-800">
                  <div>
                    <h3 className="font-sans text-sm font-semibold text-slate-800">Weekly Emission Trend</h3>
                    <span className="text-[11px] text-slate-500 font-medium">Carbon footprints logged over the past 7 daily logs</span>
                  </div>
                  <WeeklyChart data={stats7Days} />
                </div>

                {/* Sub row breakdown bento */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Category percentage share meter */}
                  <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:border-slate-300 dark:hover:border-zinc-700 transition-colors dark:bg-zinc-950 dark:border-zinc-800">
                    <CategoryBreakdown breakdown={categoryBreakdown} />
                  </div>

                  {/* Calendar footprints tracker diary heatmap */}
                  <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:border-slate-300 dark:hover:border-zinc-700 transition-colors dark:bg-zinc-950 dark:border-zinc-800">
                    <CalendarHeatmap history={history} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- VIEW 2: LOG ACTIVITY WIZARD --- */}
        {activeTab === 'log' && (
          <div className="space-y-6">
            <div className="border-b border-slate-100 pb-5">
              <h1 className="font-sans text-xl font-semibold text-slate-800 tracking-tight">
                Log today's habits
              </h1>
              <p className="text-xs text-slate-500 font-medium">
                Track transport commute kilometers, food diets, heating utilities, apparel purchases, and screen timers.
              </p>
            </div>

            {logSuccess ? (
              <div className="rounded-xl border border-emerald-100 bg-emerald-50/25 p-8 max-w-2xl mx-auto text-center space-y-5 shadow-sm">
                <div className="mx-auto h-12 w-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
                
                <div className="space-y-2">
                  <h3 className="font-sans text-base font-semibold text-slate-800">Activity Habit Logged!</h3>
                  <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                    Emission metrics have been stored on SQLite, global carbon indexes recalculated, and coaching suggestions retrieved.
                  </p>
                </div>

                <div className="flex justify-center space-x-3 pt-2">
                  <button
                    onClick={() => setLogSuccess(false)}
                    className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 tracking-wide transition-all select-none cursor-pointer"
                  >
                    Log another entry
                  </button>
                  <button
                    onClick={handleLogSuccessDismiss}
                    className="rounded-lg bg-green-600 px-4 py-2 text-xs font-semibold text-white hover:bg-green-700 tracking-wide transition-all select-none cursor-pointer shadow-sm shadow-green-600/10"
                  >
                    View dashboard overview
                  </button>
                </div>
              </div>
            ) : (
              <ActivityForm
                onSave={saveLog}
                onSuccess={() => setLogSuccess(true)}
              />
            )}
          </div>
        )}

        {/* --- VIEW 3: GLOBAL LEADERBOARD --- */}
        {activeTab === 'leaderboard' && (
          <div className="space-y-6">
            <div className="border-b border-slate-100 pb-5">
              <h1 className="font-sans text-xl font-semibold text-slate-800 tracking-tight">
                National Leaderboard Index
              </h1>
              <p className="text-xs text-slate-500 font-medium">
                Ranked index listing average daily carbon footprints across system participants. Lower average values achieve champion placement.
              </p>
            </div>

            <LeaderboardTable
              leaderboard={leaderboard}
              currentUserEmail={email}
              currentIsAnonymous={user?.isAnonymous || false}
              onToggleAnonymous={async (anonVal) => updateProfile({ isAnonymous: anonVal })}
            />
          </div>
        )}

        {/* --- VIEW 4: CLIMATE CARBON OFFSETS --- */}
        {activeTab === 'offset' && (
          <div className="space-y-6">
            {/* Title header */}
            <div className="border-b border-slate-100 pb-5">
              <h1 className="font-sans text-xl font-semibold text-slate-800 tracking-tight">
                Neutralize emissions
              </h1>
              <p className="text-xs text-slate-500 font-medium">
                Connect directly with certified Gold Standard and VCS offset actions to balance out your remaining carbon footprints.
              </p>
            </div>

            {/* Quote calculator panel */}
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 space-y-4 max-w-4xl">
              <div>
                <h3 className="font-sans text-sm font-semibold text-slate-800">Your Offset Calculator</h3>
                <p className="text-[11px] text-slate-500 font-medium">
                  Estimating neutralization costs to make you carbon-neutral based on your personal average footprint.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-slate-700">
                <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-sm">
                  <span className="block text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Your Daily Avg</span>
                  <span className="font-sans text-xl font-semibold text-slate-800 tabular-nums">
                    {averageKg.toFixed(1)} <span className="text-xs font-semibold text-slate-500">kg</span>
                  </span>
                </div>
                
                <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-sm">
                  <span className="block text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Monthly equivalent</span>
                  <span className="font-sans text-xl font-semibold text-slate-800 tabular-nums">
                    {((averageKg * 30) / 1000).toFixed(2)} <span className="text-xs font-semibold text-slate-500">tonnes</span>
                  </span>
                </div>

                <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-sm">
                  <span className="block text-[10px] text-slate-500 font-semibold uppercase tracking-wider font-semibold text-green-600">Neutralization tier</span>
                  <span className="font-sans text-xl font-semibold text-slate-800 tabular-nums text-green-600">
                    🥇 Tier A
                  </span>
                </div>
              </div>
            </div>

            {/* Offset options Grid mapping */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {OFFSET_PROJECTS.map((project) => (
                <OffsetCard
                  key={project.id}
                  project={project}
                  userMonthlyAverageKg={averageKg}
                />
              ))}
            </div>
          </div>
        )}

        {/* --- VIEW 5: USER SETTINGS --- */}
        {activeTab === 'profile' && (
          <div className="space-y-6 max-w-3xl">
            <div className="border-b border-slate-100 pb-5">
              <h1 className="font-sans text-xl font-semibold text-slate-800 tracking-tight">
                Account Settings
              </h1>
              <p className="text-xs text-slate-500 font-medium">
                Adjust carbon reduction goals, localize regional cities, and switch leaderboard profile modes.
              </p>
            </div>

            {/* Profile modification config form */}
            <form onSubmit={handleUpdateProfileSubmit} className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6 space-y-5 shadow-sm">
              <h3 className="font-sans text-sm font-semibold text-slate-800">Configure Profile</h3>

              {/* Avatar Picker */}
              <div className="space-y-2 pb-1">
                <label className="text-xs font-semibold text-slate-500">Choose Eco-Avatar Icon</label>
                <div className="flex flex-wrap gap-2.5">
                  {['🌿', '🦊', '⚡', '🚴', '🌍', '🐼', '🦉', '🥕', '💡', '🌳'].map((avatarChar) => {
                    const isSelected = tgtImage === avatarChar;
                    return (
                      <button
                        key={avatarChar}
                        type="button"
                        onClick={() => setTgtImage(avatarChar)}
                        className={`flex h-11 w-11 items-center justify-center rounded-full text-xl border-2 transition-all cursor-pointer ${
                          isSelected
                            ? 'border-green-600 bg-green-50 shadow-sm scale-105 font-bold'
                            : 'border-slate-100 bg-slate-50 hover:border-slate-200 hover:bg-slate-100/80'
                        }`}
                        title={`Select ${avatarChar}`}
                      >
                        {avatarChar}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-500">Full Display Name</label>
                  <input
                    type="text"
                    required
                    value={tgtName}
                    onChange={(e) => setTgtName(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 outline-none focus:border-green-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-500">Connected Email Address</label>
                  <input
                    type="text"
                    disabled
                    value={email}
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-400 outline-none cursor-not-allowed font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-500">Resident City Name</label>
                  <input
                    type="text"
                    required
                    value={tgtCity}
                    onChange={(e) => setTgtCity(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 outline-none focus:border-green-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-500">Resident Country Name</label>
                  <input
                    type="text"
                    required
                    value={tgtCountry}
                    onChange={(e) => setTgtCountry(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 outline-none focus:border-green-500"
                  />
                </div>

                <div className="space-y-1.5 col-span-1 sm:col-span-2">
                  <label className="text-xs font-medium text-slate-500">
                    Daily Carbon Goal (kg CO₂ / day) — <span className="text-slate-500 font-semibold">Recommended target is 10.0</span>
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    max="100"
                    required
                    value={tgtTarget}
                    onChange={(e) => setTgtTarget(Math.max(Number(e.target.value), 1))}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 outline-none focus:border-green-500"
                  />
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex justify-end pt-3 border-t border-slate-100">
                <button
                  type="submit"
                  className="rounded-lg bg-green-600 px-5 py-2 text-xs font-semibold text-white hover:bg-green-700 transition-all select-none cursor-pointer"
                >
                  Save settings
                </button>
              </div>
            </form>

            {/* Destructive / Testing account triggers */}
            <div className="rounded-xl border border-red-200 bg-red-50/10 p-5 space-y-4">
              <div>
                <h3 className="font-sans text-sm font-semibold text-red-600">Account Actions</h3>
                <p className="text-[11px] text-slate-500 font-medium">
                  Clear the demo profile or sign out of the current account.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  onClick={handleResetData}
                  className="inline-flex items-center space-x-1.5 rounded-lg border border-red-200 bg-white py-1.5 px-4 text-xs font-semibold text-red-600 hover:bg-red-50 hover:border-red-300 transition-all select-none cursor-pointer"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Reset Demo Profile</span>
                </button>

                <button
                  onClick={handleUserLogout}
                  className="inline-flex items-center space-x-1.5 rounded-lg border border-slate-200 bg-white py-1.5 px-4 text-xs font-semibold text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-all select-none cursor-pointer"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>Sign Out of Account</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer copyright */}
      <footer className="mt-12 mx-auto max-w-7xl px-4 md:px-6 w-full text-center text-slate-500 text-[11px] py-4 border-t border-slate-200 pb-28 md:pb-6 dark:border-zinc-800">
        <span>PromptWars • Built by <a href="https://github.com/aryxncodes7" target="_blank" rel="noopener noreferrer" className="text-green-600 hover:underline font-semibold transition-all">Aryan Raj</a></span>
      </footer>

      <Toaster richColors position="bottom-right" />

      {/* Modern custom confirmation modal for resetting data */}
      <AnimatePresence>
        {showResetConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowResetConfirm(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />

            {/* Modal Body */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="relative w-full max-w-sm rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 shadow-2xl space-y-4"
            >
              <h3 className="font-sans text-base font-bold text-slate-900 dark:text-zinc-100">
                Reset Account Data?
              </h3>
              <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed">
                Are you sure you want to reset your account? This will clear all logged carbon diaries and reset your sandbox profile. This action is irreversible.
              </p>
              
              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowResetConfirm(false)}
                  className="rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowResetConfirm(false);
                    // Refresh with original standard Aryan Raj credentials
                    setEmail('aryan.raj@trace.earth');
                    setActiveTab('dashboard');
                    toast.success("Account loaded with Aryan Raj profile");
                  }}
                  className="rounded-lg bg-red-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-red-700 active:scale-98 transition-all cursor-pointer shadow-sm shadow-red-600/10"
                >
                  Yes, Reset
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
