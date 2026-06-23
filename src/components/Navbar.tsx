import { Link, useLocation, useNavigate } from "react-router-dom";
import { Stethoscope, Globe2, LogOut, ShieldCheck, Building2 } from "lucide-react";
import { useApp } from "../context/AppContext";
import { t } from "../lib/i18n";

export default function Navbar() {
  const { lang, setLang, user, logout } = useApp();
  const loc = useLocation();
  const nav = useNavigate();

  const links = [
    { to: "/", label: t(lang, "nav.home"), special: "" },
    { to: "/hospitals", label: t(lang, "nav.hospitals"), special: "" },
    ...(user ? [{ to: "/dashboard", label: t(lang, "nav.dashboard"), special: "" }] : []),
    ...(user?.role === "hospital_manager" || (user?.role === "admin" && (user.managedHospitalIds?.length ?? 0) > 0)
      ? [{ to: "/manager", label: t(lang, "nav.manager"), special: "hospital" }] : []),
    ...(user?.role === "admin" ? [{ to: "/admin", label: t(lang, "nav.admin"), special: "admin" }] : []),
  ];

  const handleLogout = () => { logout(); nav("/"); };

  const roleBadges: Record<string, { label: string; cls: string }> = {
    admin: { label: t(lang, "admin.roles.admin"), cls: "bg-amber-100 text-amber-700" },
    hospital_manager: { label: t(lang, "admin.roles.hospital_manager"), cls: "bg-sky-100 text-sky-700" },
    interpreter_manager: { label: t(lang, "admin.roles.interpreter_manager"), cls: "bg-violet-100 text-violet-700" },
    hotel_manager: { label: t(lang, "admin.roles.hotel_manager"), cls: "bg-emerald-100 text-emerald-700" },
    vehicle_manager: { label: t(lang, "admin.roles.vehicle_manager"), cls: "bg-orange-100 text-orange-700" },
  };
  const badge = user && user.role !== "user" ? roleBadges[user.role] : null;

  return (
    <header className="sticky top-0 z-40 backdrop-blur bg-white/80 border-b border-slate-200">
      <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between gap-3">
        <Link to="/" className="flex items-center gap-2 font-bold text-slate-900">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500 to-indigo-600 text-white shadow-sm">
            <Stethoscope className="h-5 w-5" />
          </span>
          <span className="text-lg tracking-tight">{t(lang, "brand")}</span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {links.map((l) => {
            const active = loc.pathname === l.to || (l.to !== "/" && loc.pathname.startsWith(l.to));
            const isAdmin = l.special === "admin";
            const isHosp = l.special === "hospital";
            return (
              <Link key={l.to} to={l.to} className={
                "px-3 py-2 rounded-lg text-sm font-medium transition inline-flex items-center gap-1.5 " +
                (isAdmin ? active ? "bg-amber-500 text-white" : "text-amber-700 bg-amber-50 hover:bg-amber-100"
                  : isHosp ? active ? "bg-sky-500 text-white" : "text-sky-700 bg-sky-50 hover:bg-sky-100"
                  : active ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100")
              }>
                {isAdmin && <ShieldCheck className="h-3.5 w-3.5" />}
                {isHosp && <Building2 className="h-3.5 w-3.5" />}
                {l.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <button onClick={() => setLang(lang === "en" ? "ko" : "en")}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-sm font-medium text-slate-700">
            <Globe2 className="h-4 w-4" />
            <span className="hidden sm:inline">{lang === "en" ? "한국어" : "English"}</span>
          </button>

          {user ? (
            <div className="flex items-center gap-2">
              <div className="hidden sm:block text-right">
                <div className="text-xs font-semibold text-slate-900 flex items-center gap-1 justify-end">
                  {user.name}
                  {badge && <span className={"text-[10px] px-1.5 rounded font-bold " + badge.cls}>{badge.label}</span>}
                </div>
                <div className="text-[11px] text-slate-500">{user.email}</div>
              </div>
              <button onClick={handleLogout} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-sm font-medium text-slate-700" title={t(lang, "auth.signOut")}>
                <LogOut className="h-4 w-4" /><span className="hidden sm:inline">{t(lang, "auth.signOut")}</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login" className="px-3 py-2 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-100">{t(lang, "auth.signIn")}</Link>
              <Link to="/signup" className="hidden sm:inline-flex px-3 py-2 rounded-lg bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800">{t(lang, "auth.signUp")}</Link>
            </div>
          )}
        </div>
      </div>

      <nav className="md:hidden flex border-t border-slate-200 overflow-x-auto">
        {links.map((l) => {
          const active = loc.pathname === l.to || (l.to !== "/" && loc.pathname.startsWith(l.to));
          const isAdmin = l.special === "admin";
          const isHosp = l.special === "hospital";
          return (
            <Link key={l.to} to={l.to} className={
              "flex-1 text-center py-3 text-xs font-medium whitespace-nowrap " +
              (isAdmin ? active ? "text-amber-700 border-b-2 border-amber-500" : "text-amber-600"
                : isHosp ? active ? "text-sky-700 border-b-2 border-sky-500" : "text-sky-600"
                : active ? "text-sky-600 border-b-2 border-sky-600" : "text-slate-500")
            }>{l.label}</Link>
          );
        })}
      </nav>
    </header>
  );
}
