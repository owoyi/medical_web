import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useApp, db } from "../context/AppContext";
import { t } from "../lib/i18n";
import { UserPlus } from "lucide-react";

export default function Signup() {
  const { lang, setUser } = useApp();
  const nav = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", country: "", password: "", confirm: "" });
  const [error, setError] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (form.password.length < 4) { setError(t(lang, "auth.pwMin")); return; }
    if (form.password !== form.confirm) { setError(t(lang, "auth.pwMismatch")); return; }
    const res = db.users.create({ email: form.email.trim(), password: form.password, name: form.name.trim(), country: form.country.trim() });
    if ("error" in res) { setError(res.error); return; }
    db.auth.login(form.email.trim(), form.password);
    setUser(res);
    nav("/hospitals", { replace: true });
  };

  return (
    <div className="max-w-md mx-auto px-5 py-16">
      <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
        <div className="text-center">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500 to-indigo-600 text-white">
            <UserPlus className="h-6 w-6" />
          </div>
          <h1 className="mt-4 text-2xl font-bold text-slate-900">{t(lang, "auth.createAccount")}</h1>
          <p className="mt-1 text-sm text-slate-500">{t(lang, "auth.createAccountDesc")}</p>
        </div>

        <form onSubmit={submit} className="mt-6 space-y-4">
          <Field label={t(lang, "auth.fullName")} value={form.name} onChange={(v) => setForm({ ...form, name: v })} required />
          <Field label={t(lang, "booking.email")} type="email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} required />
          <Field label={t(lang, "auth.country")} value={form.country} onChange={(v) => setForm({ ...form, country: v })} required />
          <Field label={t(lang, "auth.password")} type="password" value={form.password} onChange={(v) => setForm({ ...form, password: v })} required />
          <Field label={t(lang, "auth.confirmPw")} type="password" value={form.confirm} onChange={(v) => setForm({ ...form, confirm: v })} required />

          {error && <div className="rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-sm p-3">{error}</div>}

          <button type="submit" className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 text-white px-5 py-3 text-sm font-semibold hover:bg-slate-800 transition">
            <UserPlus className="h-4 w-4" /> {t(lang, "auth.createBtn")}
          </button>
        </form>

        <div className="mt-5 text-center text-sm text-slate-600">
          {t(lang, "auth.hasAccount")}{" "}
          <Link to="/login" className="text-sky-600 font-semibold hover:underline">{t(lang, "auth.signIn")}</Link>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, type = "text", required }: {
  label: string; value: string; onChange: (v: string) => void; type?: string; required?: boolean;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">{label}</label>
      <input type={type} value={value} required={required} onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100" />
    </div>
  );
}
