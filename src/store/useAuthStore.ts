import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Tier = 'free' | 'pro' | 'enterprise';
export type AuthStatus = 'unverified' | 'active' | 'suspended';

export interface User {
  id: string;
  email: string;
  name: string;
  tier: Tier;
  status: AuthStatus;
  createdAt: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  company?: string;
}

// ✅ Usa variabile d'ambiente o fallback
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api/auth';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, pass: string) => Promise<boolean>;
  register: ( RegisterData) => Promise<{ success: boolean; message: string }>;
  verifyEmail: (token: string, email: string) => Promise<boolean>;
  resendVerification: (email: string) => Promise<boolean>;
  logout: () => void;
  upgradeTier: (tier: Tier) => void;
}

export const useAuthStore = create<AuthState>()(
  persist((set) => ({
    user: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,

    login: async (email, pass) => {
      set({ isLoading: true, error: null });
      await new Promise(r => setTimeout(r, 800));
      if (email && pass.length >= 6) {
        set({ 
          user: { 
            id: 'local', 
            email, 
            name: email.split('@')[0], 
            tier: 'free', 
            status: 'active', 
            createdAt: new Date().toISOString() 
          }, 
          isAuthenticated: true, 
          isLoading: false 
        });
        return true;
      }
      set({ error: 'Credenziali non valide', isLoading: false });
      return false;
    },

    register: async (data) => {
      set({ isLoading: true, error: null });
      try {
        console.log('📤 Invio richiesta register a:', `${API_BASE}/register`);
        
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 15000); // 15s timeout
        
        const res = await fetch(`${API_BASE}/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            email: data.email, 
            password: data.password, 
            name: data.name 
          }),
          signal: controller.signal
        });
        
        clearTimeout(timeout);
        const json = await res.json();
        console.log('📥 Risposta backend:', json);
        
        if (!res.ok) {
          throw new Error(json.error || `Errore HTTP ${res.status}`);
        }
        
        set({ isLoading: false });
        return { success: true, message: 'Email di verifica inviata. Controlla la casella.' };
        
      } catch (err: any) {
        console.error('❌ Errore register frontend:', err);
        const msg = err.name === 'AbortError' 
          ? 'Timeout: il server non risponde. Verifica che il backend sia attivo su http://localhost:3001'
          : err.message || 'Errore di connessione al server';
        set({ error: msg, isLoading: false });
        return { success: false, message: msg };
      }
    },

    verifyEmail: async (token, email) => {
      set({ isLoading: true });
      try {
        const res = await fetch(`${API_BASE}/verify`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token, email })
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error);
        set({ isLoading: false });
        return true;
      } catch (err: any) {
        console.error('❌ Errore verify:', err);
        set({ error: err.message, isLoading: false });
        return false;
      }
    },

    resendVerification: async (email) => {
      set({ isLoading: true });
      try {
        const res = await fetch(`${API_BASE}/resend`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email })
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error);
        set({ isLoading: false });
        return true;
      } catch (err: any) {
        console.error('❌ Errore resend:', err);
        set({ error: err.message, isLoading: false });
        return false;
      }
    },

    logout: () => set({ user: null, isAuthenticated: false, error: null }),
    upgradeTier: (tier) => set((s) => s.user ? { user: { ...s.user, tier } } : {})
  }), { name: 'geoanalytics-auth-v4' })
);
