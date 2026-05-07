import * as React from 'react';
import { loginApi, type AuthUser, type AppRole } from '../lib/api';

export type { AppRole };

export type AuthState = {
  user: AuthUser | null;
  role: AppRole | null;
  fullName: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  authError: string | null;
};

type AuthContextType = AuthState & {
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signOut: () => void;
};

const AuthContext = React.createContext<AuthContextType | null>(null);

export function useAuth(): AuthContextType {
  const ctx = React.useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}

function loadFromStorage(): { user: AuthUser; token: string } | null {
  try {
    const token = localStorage.getItem('token');
    const raw = localStorage.getItem('auth_user');
    if (!token || !raw) return null;
    return { token, user: JSON.parse(raw) as AuthUser };
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const stored = loadFromStorage();

  const [state, setState] = React.useState<AuthState>({
    user: stored?.user ?? null,
    role: stored?.user?.role ?? null,
    fullName: stored?.user?.full_name ?? null,
    isAuthenticated: !!stored,
    isLoading: false,
    authError: null,
  });

  async function signIn(email: string, password: string): Promise<{ error?: string }> {
    setState((s) => ({ ...s, isLoading: true, authError: null }));
    try {
      const { token, user } = await loginApi(email, password);
      localStorage.setItem('token', token);
      localStorage.setItem('auth_user', JSON.stringify(user));
      setState({
        user,
        role: user.role,
        fullName: user.full_name,
        isAuthenticated: true,
        isLoading: false,
        authError: null,
      });
      return {};
    } catch (err: any) {
      const message = err.message ?? 'Login gagal';
      setState((s) => ({ ...s, isLoading: false, authError: message }));
      return { error: message };
    }
  }

  function signOut() {
    localStorage.removeItem('token');
    localStorage.removeItem('auth_user');
    setState({
      user: null,
      role: null,
      fullName: null,
      isAuthenticated: false,
      isLoading: false,
      authError: null,
    });
  }

  return (
    <AuthContext.Provider value={{ ...state, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
