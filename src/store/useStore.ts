import { create } from 'zustand';

export interface UserProfile {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  city: string | null;
  country: string | null;
  isAnonymous: boolean;
  targetKgPerDay: number;
}

export interface CategoryBreakdown {
  transport: number;
  energy: number;
  diet: number;
  shopping: number;
}

export interface ChartDay {
  date: string;
  transport: number;
  energy: number;
  diet: number;
  shopping: number;
  total: number;
}

export interface HistoryItem {
  id: string;
  date: string;
  total: number;
  transport: number;
  energy: number;
  diet: number;
  shopping: number;
}

export interface LeaderboardUser {
  id: string;
  email: string;
  name: string;
  city: string;
  country: string;
  avgEmission: number;
  logsLogged: number;
  targetGoal: number;
}

interface CarbonState {
  email: string;
  user: UserProfile | null;
  scoreToday: number;
  consecutiveDays: number;
  averageKg: number;
  todayCategoryBreakdown: CategoryBreakdown;
  stats7Days: ChartDay[];
  categoryBreakdown: CategoryBreakdown;
  history: HistoryItem[];
  leaderboard: LeaderboardUser[];
  aiTip: string;
  loading: boolean;
  error: string | null;
  activeTab: string; // 'dashboard' | 'log' | 'insights' | 'leaderboard' | 'offset' | 'profile' | 'landing'
  
  // Actions
  setEmail: (email: string) => void;
  setActiveTab: (tab: string) => void;
  fetchStats: () => Promise<void>;
  fetchLeaderboard: () => Promise<void>;
  fetchAiTip: () => Promise<void>;
  saveLog: (data: any) => Promise<boolean>;
  updateProfile: (profile: Partial<UserProfile>) => Promise<boolean>;
}

export const useStore = create<CarbonState>((set, get) => ({
  email: localStorage.getItem('trace_user_email') || 'aryan.raj@trace.earth',
  user: null,
  scoreToday: 0,
  consecutiveDays: 0,
  averageKg: 13.7,
  todayCategoryBreakdown: { transport: 0, energy: 0, diet: 0, shopping: 0 },
  stats7Days: [],
  categoryBreakdown: { transport: 0, energy: 0, diet: 0, shopping: 0 },
  history: [],
  leaderboard: [],
  aiTip: 'Analyzing your emission habits... Complete today\'s entry for targeted guidance.',
  loading: false,
  error: null,
  activeTab: localStorage.getItem('trace_user_email') ? 'dashboard' : 'landing',

  setEmail: (email: string) => {
    localStorage.setItem('trace_user_email', email);
    set({ email });
    get().fetchStats();
    get().fetchAiTip();
  },

  setActiveTab: (tab: string) => {
    set({ activeTab: tab });
  },

  fetchStats: async () => {
    set({ loading: true, error: null });
    try {
      const email = get().email;
      const res = await fetch(`/api/stats?email=${encodeURIComponent(email)}`);
      if (!res.ok) throw new Error('Failed to load carbon statistics');
      const data = await res.json();
      
      set({
        user: data.user,
        scoreToday: data.scoreToday,
        todayCategoryBreakdown: data.todayCategoryBreakdown || { transport: 0, energy: 0, diet: 0, shopping: 0 },
        consecutiveDays: data.consecutiveDays,
        averageKg: data.averageKg,
        stats7Days: data.stats7Days,
        categoryBreakdown: data.categoryBreakdown,
        history: data.history,
        loading: false,
      });
    } catch (err: any) {
      console.error(err);
      set({ error: err.message, loading: false });
    }
  },

  fetchLeaderboard: async () => {
    try {
      const res = await fetch('/api/leaderboard');
      if (!res.ok) throw new Error('Failed to load global leaderboard');
      const data = await res.json();
      set({ leaderboard: data });
    } catch (err: any) {
      console.error(err);
    }
  },

  fetchAiTip: async () => {
    try {
      const email = get().email;
      const res = await fetch(`/api/insights/ai?email=${encodeURIComponent(email)}`);
      if (!res.ok) throw new Error('Failed to fetch AI coaching tip');
      const data = await res.json();
      set({ aiTip: data.tip });
    } catch (err: any) {
      console.error(err);
    }
  },

  saveLog: async (logData: any) => {
    set({ loading: true, error: null });
    try {
      const email = get().email;
      const res = await fetch('/api/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...logData, email }),
      });

      if (!res.ok) throw new Error('Failed to save activity log entry');
      
      // Update statistics and AI suggestions
      await get().fetchStats();
      await get().fetchAiTip();
      set({ loading: false });
      return true;
    } catch (err: any) {
      console.error(err);
      set({ error: err.message, loading: false });
      return false;
    }
  },

  updateProfile: async (updates: Partial<UserProfile>) => {
    try {
      const email = get().email;
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...updates, email }),
      });

      if (!res.ok) throw new Error('Failed to update system settings');
      const data = await res.json();

      set({ user: data.user });
      await get().fetchStats(); // Relive values
      await get().fetchLeaderboard(); // Ensure leaderboard is synced
      return true;
    } catch (err: any) {
      console.error(err);
      return false;
    }
  },
}));
