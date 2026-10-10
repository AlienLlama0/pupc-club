import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import type { DemoState, Executive, NotifType, Permission } from '../types';
import { buildSeed } from '../data/seed';
import { nowISO, uid } from '../lib/util';

/*
 * DEMO STATE LAYER
 * -----------------
 * All data lives in React state and is mirrored to localStorage. To move to production,
 * replace `update()` call sites with API mutations (e.g. React Query) and `can()` with
 * permissions returned by the server. Client-side checks here are NOT a security boundary.
 */

const STATE_KEY = 'pupc-demo-state-v1';
const SESSION_KEY = 'pupc-demo-session-v1';

function safeGet(store: 'local' | 'session', key: string): string | null {
  try { return (store === 'local' ? localStorage : sessionStorage).getItem(key); } catch { return null; }
}
function safeSet(store: 'local' | 'session', key: string, value: string | null) {
  try {
    const s = store === 'local' ? localStorage : sessionStorage;
    if (value === null) s.removeItem(key); else s.setItem(key, value);
  } catch { /* storage unavailable or full — demo keeps working in memory */ }
}

function loadState(): DemoState {

  return buildSeed();
}

interface Ctx {
  state: DemoState;
  update: (fn: (draft: DemoState) => void) => void;
  user: Executive | null;
  perms: Set<Permission>;
  can: (p: Permission) => boolean;
  login: (email: string, password: string, remember: boolean) => { ok: true } | { ok: false; error: string };
  loginAs: (execId: string) => void;
  logout: () => void;
  reset: () => void;
  storageWarning: boolean;
}

const StoreCtx = createContext<Ctx | null>(null);

export function DemoProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<DemoState>(loadState);
  const [userId, setUserId] = useState<string | null>(() => safeGet('local', SESSION_KEY) ?? safeGet('session', SESSION_KEY));
  const [storageWarning, setStorageWarning] = useState(false);
  const first = useRef(true);

  useEffect(() => {
    if (first.current) { first.current = false; return; }
    try { localStorage.setItem(STATE_KEY, JSON.stringify(state)); setStorageWarning(false); }
    catch { setStorageWarning(true); }
  }, [state]);

  const update = useCallback((fn: (d: DemoState) => void) => {
    setState(prev => { const next = structuredClone(prev); fn(next); return next; });
  }, []);

  const user = useMemo(() => state.executives.find(e => e.id === userId) ?? null, [state.executives, userId]);
  const perms = useMemo(() => {
    const set = new Set<Permission>();
    if (!user) return set;
    for (const rid of user.roleIds) {
      const r = state.roles.find(x => x.id === rid);
      if (r?.active) r.permissions.forEach(p => set.add(p));
    }
    set.add('dashboard.view');
    return set;
  }, [user, state.roles]);
  const can = useCallback((p: Permission) => perms.has(p), [perms]);

  const persistSession = (id: string | null, remember: boolean) => {
    safeSet('local', SESSION_KEY, null); safeSet('session', SESSION_KEY, null);
    if (id) safeSet(remember ? 'local' : 'session', SESSION_KEY, id);
  };

  const login: Ctx['login'] = (email, password, remember) => {
    const ex = state.executives.find(
  e => e.email?.toLowerCase() === email.trim().toLowerCase()
);
    if (!ex || !ex.password) return { ok: false, error: 'No demo account uses that email. Try one of the demo credentials below.' };
    if (ex.password !== password) return { ok: false, error: 'Incorrect password for this demo account.' };
    setUserId(ex.id); persistSession(ex.id, remember);
    return { ok: true };
  };
  const loginAs = (id: string) => { setUserId(id); persistSession(id, true); };
  const logout = () => { setUserId(null); persistSession(null, false); };
  const reset = () => { const s = buildSeed(); setState(s); safeSet('local', STATE_KEY, JSON.stringify(s)); };

  return (
    <StoreCtx.Provider value={{ state, update, user, perms, can, login, loginAs, logout, reset, storageWarning }}>
      {children}
    </StoreCtx.Provider>
  );
}

export function useDemo() {
  const c = useContext(StoreCtx);
  if (!c) throw new Error('useDemo must be used inside DemoProvider');
  return c;
}

// ---- mutation helpers (operate on a draft inside update()) ----
export function notify(d: DemoState, userIds: string[] | 'all', title: string, body: string, type: NotifType, link?: string) {
  const ids = userIds === 'all' ? ['all'] : Array.from(new Set(userIds));
  ids.forEach(u => d.notifications.unshift({ id: uid('nt'), userId: u, title, body, at: nowISO(), read: false, type, link }));
}
export function logActivity(d: DemoState, actorId: string, text: string) {
  d.activity.unshift({ id: uid('ac'), at: nowISO(), actorId, text });
  d.activity = d.activity.slice(0, 60);
}
export const execsWithRole = (d: Pick<DemoState, 'executives'>, roleId: string) => d.executives.filter(e => e.roleIds.includes(roleId));
export const execName = (d: Pick<DemoState, 'executives'>, id: string) => d.executives.find(e => e.id === id)?.name ?? 'Unknown';

// ---- toasts ----
type Toast = { id: string; text: string; tone: 'success' | 'error' | 'info' };
const ToastCtx = createContext<(text: string, tone?: Toast['tone']) => void>(() => {});
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const push = useCallback((text: string, tone: Toast['tone'] = 'success') => {
    const id = uid('t');
    setToasts(t => [...t, { id, text, tone }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3200);
  }, []);
  return (
    <ToastCtx.Provider value={push}>
      {children}
      <div className="pointer-events-none fixed bottom-4 right-4 z-[100] flex w-[calc(100%-2rem)] max-w-sm flex-col gap-2" aria-live="polite">
        {toasts.map(t => (
          <div key={t.id} className={`pointer-events-auto animate-rise rounded-xl border px-4 py-3 text-sm shadow-card backdrop-blur ${t.tone === 'success' ? 'border-emerald-400/30 bg-emerald-500/15 text-emerald-100' : t.tone === 'error' ? 'border-ember/40 bg-ember/15 text-red-100' : 'border-cyan/30 bg-cyan/10 text-ice'}`}>
            {t.text}
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}
export const useToast = () => useContext(ToastCtx);
