import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { db, seedIfEmpty } from "../lib/db";
import type { User } from "../lib/types";
import type { Lang } from "../lib/i18n";

interface AppCtx {
  lang: Lang;
  setLang: (l: Lang) => void;
  refreshTick: number;
  refresh: () => void;
  user: User | undefined;
  setUser: (u: User | undefined) => void;
  logout: () => void;
}

const Ctx = createContext<AppCtx | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    const saved = localStorage.getItem("mk_lang");
    return (saved === "ko" ? "ko" : "en") as Lang;
  });
  const [refreshTick, setRefreshTick] = useState(0);
  const [user, setUserState] = useState<User | undefined>(() => {
    seedIfEmpty();
    return db.auth.current();
  });

  useEffect(() => {
    seedIfEmpty();
    setUserState(db.auth.current());
  }, []);

  const setLang = (l: Lang) => {
    setLangState(l);
    localStorage.setItem("mk_lang", l);
  };

  const refresh = () => setRefreshTick((n) => n + 1);

  const setUser = (u: User | undefined) => setUserState(u);

  const logout = () => {
    db.auth.logout();
    setUserState(undefined);
  };

  return (
    <Ctx.Provider value={{ lang, setLang, refreshTick, refresh, user, setUser, logout }}>
      {children}
    </Ctx.Provider>
  );
}

export function useApp() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useApp must be inside AppProvider");
  return c;
}

export { db };
