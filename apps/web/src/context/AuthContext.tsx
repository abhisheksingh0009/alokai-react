import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

const API = 'http://localhost:4000/api/auth';

interface User { id: number; username: string; name: string; email: string; phone: string }

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (username: string, name: string, email: string, password: string, phone: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

async function authFetch(path: string, body: object) {
  const res = await fetch(`${API}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? 'Request failed');
  return data;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  // Restore session on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
    fetch(`${API}/me`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.ok ? r.json() : null)
      .then(data => data && setUser(data.user))
      .catch(() => localStorage.removeItem('token'));
  }, []);

  const login = async (email: string, password: string) => {
    const data = await authFetch('/login', { email, password });
    localStorage.setItem('token', data.token);
    setUser(data.user);
  };

  const signup = async (username: string, name: string, email: string, password: string, phone: string) => {
    const data = await authFetch('/register', { username, name, email, password, phone });
    localStorage.setItem('token', data.token);
    setUser(data.user);
  };

  const logout = async () => {
    const token = localStorage.getItem('token');
    if (token) await fetch(`${API}/logout`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } });
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext)!;
}
