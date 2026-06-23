import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useApp, db } from "../context/AppContext";
import { t } from "../lib/i18n";
import { Lock, Mail, LogIn } from "lucide-react";

export default function Login() {
  const { lang, setUser } = useApp();
  const nav = useNavigate();
  const loc = useLocation();
  const from = (loc.state as { from?: string } | null)?.from || "/";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const res = db.auth.login(email.trim(), password);
    if ("error" in res) { setError(res.error); return; }
    setUser(res);
    nav(res.role === "admin" ? "/admin" : from, { replace: true });
  };

  return (
    <div className="max-w-md mx-auto px-5 py-16">
      <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
        <div className="text-center">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500 to-indigo-600 text-white">
            <Lock className="h-6 w-6" />
          </div>
          <h1 className="mt-4 text-2xl font-bold text-slate-900">{t(lang, "auth.welcome")}</h1>
          <p className="mt-1 text-sm text-slate-500">{t(lang, "auth.signInDesc")}</p>
        </div>

        <form onSubmit={submit} className="mt-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">{t(lang, "auth.emailId")}</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input value={email} onChange={(e) => setEmail(e.target.value)} required
                className="w-full pl-10 pr-3 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
                placeholder="you@example.com" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">{t(lang, "auth.password")}</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required
              className="w-full px-3 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
              placeholder="••••••••" />
          </div>

          {error && <div className="rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-sm p-3">{error}</div>}

          <button type="submit" className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 text-white px-5 py-3 text-sm font-semibold hover:bg-slate-800 transition">
            <LogIn className="h-4 w-4" /> {t(lang, "auth.signIn")}
          </button>
        </form>

        <div className="mt-5 text-center text-sm text-slate-600">
          {t(lang, "auth.noAccount")}{" "}
          <Link to="/signup" className="text-sky-600 font-semibold hover:underline">{t(lang, "auth.signUp")}</Link>
        </div>

        <div className="mt-6 pt-5 border-t border-slate-100">
          <div className="text-xs font-semibold uppercase text-slate-500 mb-2 text-center">{t(lang, "auth.quickFill")}</div>
          <div className="grid grid-cols-2 gap-2">
            <button type="button" onClick={() => { setEmail("admin"); setPassword("admin"); }}
              className="px-3 py-2 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold hover:bg-amber-100">
              👑 {t(lang, "auth.adminBtn")}
            </button>
            <button type="button" onClick={() => { setEmail("demo@traveler.com"); setPassword("demo"); }}
              className="px-3 py-2 rounded-lg bg-sky-50 border border-sky-200 text-sky-800 text-xs font-semibold hover:bg-sky-100">
              👤 {t(lang, "auth.demoBtn")}
            </button>
          </div>
        </div>

        <p className="mt-4 text-center text-xs text-slate-400">{t(lang, "footer")}</p>
      </div>
    </div>
  );
}
