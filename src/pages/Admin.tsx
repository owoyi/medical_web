import { useMemo, useState, type ReactNode } from "react";
import { useApp, db } from "../context/AppContext";
import { t } from "../lib/i18n";
import type { Booking, BookingStatus, Category, Hospital, Hotel, Interpreter, Role, User, Vehicle } from "../lib/types";
import {
  LayoutDashboard, CalendarDays, DollarSign, Users2, Building2,
  CheckCircle2, Trash2, Search, ChevronDown, Plus, Pencil, X, Save, Languages, Car, BedDouble,
} from "lucide-react";

const STATUS_COLORS: Record<BookingStatus, string> = {
  pending: "bg-amber-100 text-amber-700", confirmed: "bg-sky-100 text-sky-700",
  "in-progress": "bg-indigo-100 text-indigo-700", completed: "bg-emerald-100 text-emerald-700",
  cancelled: "bg-slate-200 text-slate-600",
};
const ALL_STATUSES: BookingStatus[] = ["pending", "confirmed", "in-progress", "completed", "cancelled"];
const CATS: Category[] = ["plastic-surgery", "dermatology", "dentistry", "orthopedics", "checkup"];
const ROLE_COLORS: Record<Role, string> = {
  user: "bg-slate-100 text-slate-600", admin: "bg-amber-100 text-amber-700",
  hospital_manager: "bg-sky-100 text-sky-700", interpreter_manager: "bg-violet-100 text-violet-700",
  hotel_manager: "bg-emerald-100 text-emerald-700", vehicle_manager: "bg-orange-100 text-orange-700",
};

type Tab = "overview" | "bookings" | "users" | "hospitals" | "interpreters" | "hotels" | "vehicles";

export default function Admin() {
  const { lang, refresh } = useApp();
  const [tab, setTab] = useState<Tab>("overview");
  const [tick, setTick] = useState(0);
  const bump = () => { refresh(); setTick((n) => n + 1); };

  const data = useMemo(() => {
    void tick;
    return { bookings: db.bookings.list(), users: db.users.list(), hospitals: db.hospitals.list(), interpreters: db.interpreters.list(), hotels: db.hotels.list(), vehicles: db.vehicles.list() };
  }, [tick]);

  const stats = useMemo(() => {
    const active = data.bookings.filter((b) => b.status !== "cancelled");
    const revenue = active.reduce((s, b) => s + b.total, 0);
    const byCategory = new Map<string, number>();
    for (const b of data.bookings) { const h = data.hospitals.find((x) => x.id === b.hospitalId); byCategory.set(h?.category ?? "unknown", (byCategory.get(h?.category ?? "unknown") ?? 0) + 1); }
    const byStatus = new Map<BookingStatus, number>();
    for (const b of data.bookings) byStatus.set(b.status, (byStatus.get(b.status) ?? 0) + 1);
    return { total: data.bookings.length, active: active.length, revenue, byCategory, byStatus };
  }, [data]);

  const tabItems: { k: Tab; labelKey: string; icon: typeof LayoutDashboard }[] = [
    { k: "overview", labelKey: "admin.tabs.overview", icon: LayoutDashboard },
    { k: "bookings", labelKey: "admin.tabs.bookings", icon: CalendarDays },
    { k: "users", labelKey: "admin.tabs.users", icon: Users2 },
    { k: "hospitals", labelKey: "admin.tabs.hospitals", icon: Building2 },
    { k: "interpreters", labelKey: "admin.tabs.interpreters", icon: Languages },
    { k: "hotels", labelKey: "admin.tabs.hotels", icon: BedDouble },
    { k: "vehicles", labelKey: "admin.tabs.vehicles", icon: Car },
  ];

  return (
    <div className="max-w-7xl mx-auto px-5 py-10">
      <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-amber-700 bg-amber-100 px-2.5 py-1 rounded-full">👑 {t(lang, "admin.badge")}</div>
      <h1 className="mt-2 text-3xl font-bold text-slate-900">{t(lang, "admin.title")}</h1>
      <p className="mt-1 text-slate-500">{t(lang, "admin.desc")}</p>

      <div className="mt-5 border-b border-slate-200 flex gap-1 overflow-x-auto">
        {tabItems.map((ti) => (
          <button key={ti.k} onClick={() => setTab(ti.k)} className={
            "inline-flex items-center gap-1.5 px-3 py-2.5 text-sm font-semibold border-b-2 -mb-px transition whitespace-nowrap " +
            (tab === ti.k ? "border-slate-900 text-slate-900" : "border-transparent text-slate-500 hover:text-slate-800")
          }><ti.icon className="h-4 w-4" /> {t(lang, ti.labelKey)}</button>
        ))}
      </div>

      <div className="mt-6">
        {tab === "overview" && <OverviewTab stats={stats} bookings={data.bookings} lang={lang} />}
        {tab === "bookings" && <BookingsTab data={data} bump={bump} lang={lang} />}
        {tab === "users" && <UsersTab data={data} bump={bump} lang={lang} />}
        {tab === "hospitals" && <HospitalsTab data={data} bump={bump} lang={lang} />}
        {tab === "interpreters" && <InterpretersTab data={data} bump={bump} lang={lang} />}
        {tab === "hotels" && <HotelsTab data={data} bump={bump} lang={lang} />}
        {tab === "vehicles" && <VehiclesTab data={data} bump={bump} lang={lang} />}
      </div>
    </div>
  );
}

type L = ReturnType<typeof useApp>["lang"];
type D = { bookings: Booking[]; users: User[]; hospitals: Hospital[]; interpreters: Interpreter[]; hotels: Hotel[]; vehicles: Vehicle[] };

/* ── shared ── */
function StatCard({ label, value, icon, tint }: { label: string; value: string; icon: ReactNode; tint: string }) {
  const colors: Record<string, string> = { sky: "bg-sky-50 text-sky-600", emerald: "bg-emerald-50 text-emerald-600", indigo: "bg-indigo-50 text-indigo-600", amber: "bg-amber-50 text-amber-600" };
  return (<div className="bg-white border border-slate-200 rounded-2xl p-5"><div className={"inline-flex h-10 w-10 items-center justify-center rounded-lg " + colors[tint]}>{icon}</div><div className="mt-3 text-sm text-slate-500">{label}</div><div className="text-2xl font-bold text-slate-900">{value}</div></div>);
}
function Modal({ title, onClose, children, wide }: { title: string; onClose: () => void; children: ReactNode; wide?: boolean }) {
  return (<div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-20 bg-black/40" onClick={onClose}><div className={"bg-white rounded-2xl shadow-xl w-full max-h-[80vh] overflow-y-auto " + (wide ? "max-w-3xl" : "max-w-lg")} onClick={(e) => e.stopPropagation()}><div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 sticky top-0 bg-white rounded-t-2xl z-10"><h2 className="font-bold text-slate-900">{title}</h2><button onClick={onClose} className="text-slate-400 hover:text-slate-700"><X className="h-5 w-5" /></button></div><div className="p-6">{children}</div></div></div>);
}
function Inp({ label, value, onChange, type, placeholder, required, disabled }: { label: string; value: string | number; onChange: (v: string) => void; type?: string; placeholder?: string; required?: boolean; disabled?: boolean; }) {
  return (<div><label className="block text-xs font-semibold uppercase text-slate-500 mb-1">{label}</label><input type={type ?? "text"} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} required={required} disabled={disabled} className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 disabled:bg-slate-50 disabled:text-slate-400" /></div>);
}
function CheckboxGroup({ label, items, selected, toggle }: { label: string; items: { id: string; label: string }[]; selected: string[]; toggle: (id: string) => void }) {
  return (<div><label className="block text-xs font-semibold uppercase text-slate-500 mb-2">{label}</label><div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto">{items.map((item) => { const sel = selected.includes(item.id); return (<button key={item.id} onClick={() => toggle(item.id)} className={"text-left px-3 py-2 rounded-lg border text-sm " + (sel ? "border-sky-500 bg-sky-50 text-sky-700 font-semibold" : "border-slate-200 text-slate-600 hover:border-slate-300")}><span className="mr-1.5">{sel ? "☑" : "☐"}</span>{item.label}</button>); })}</div></div>);
}

/* ── Overview ── */
function OverviewTab({ stats, bookings, lang }: { stats: { total: number; active: number; revenue: number; byCategory: Map<string, number>; byStatus: Map<BookingStatus, number> }; bookings: Booking[]; lang: L }) {
  const maxCat = Math.max(1, ...Array.from(stats.byCategory.values()));
  return (
    <div className="space-y-6">
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label={t(lang, "admin.overview.totalBookings")} value={String(stats.total)} icon={<CalendarDays className="h-5 w-5" />} tint="sky" />
        <StatCard label={t(lang, "admin.overview.active")} value={String(stats.active)} icon={<CheckCircle2 className="h-5 w-5" />} tint="emerald" />
        <StatCard label={t(lang, "admin.overview.revenue")} value={"$" + stats.revenue.toLocaleString()} icon={<DollarSign className="h-5 w-5" />} tint="indigo" />
        <StatCard label={t(lang, "admin.overview.users")} value={String(db.users.list().length)} icon={<Users2 className="h-5 w-5" />} tint="amber" />
      </div>
      <div className="grid lg:grid-cols-2 gap-5">
        <div className="bg-white border border-slate-200 rounded-2xl p-6">
          <h3 className="font-bold text-slate-900">{t(lang, "admin.overview.byCat")}</h3>
          <div className="mt-4 space-y-3">
            {Array.from(stats.byCategory.entries()).map(([cat, count]) => (
              <div key={cat}><div className="flex justify-between text-sm mb-1"><span className="text-slate-700">{t(lang, `categories.${cat}`) || cat}</span><span className="text-slate-500">{count}</span></div>
                <div className="h-2 rounded-full bg-slate-100 overflow-hidden"><div className="h-full bg-gradient-to-r from-sky-500 to-indigo-600" style={{ width: `${(count / maxCat) * 100}%` }} /></div></div>
            ))}
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-6">
          <h3 className="font-bold text-slate-900">{t(lang, "admin.overview.byStatus")}</h3>
          <div className="mt-4 grid grid-cols-2 gap-3">
            {ALL_STATUSES.map((s) => (
              <div key={s} className="rounded-xl border border-slate-200 p-3"><div className={"inline-block text-xs font-bold uppercase px-2 py-0.5 rounded " + STATUS_COLORS[s]}>{t(lang, `admin.status.${s}`)}</div><div className="mt-2 text-2xl font-bold text-slate-900">{stats.byStatus.get(s) ?? 0}</div></div>
            ))}
          </div>
        </div>
      </div>
      <div className="bg-white border border-slate-200 rounded-2xl p-6">
        <h3 className="font-bold text-slate-900">{t(lang, "admin.overview.recent")}</h3>
        <div className="mt-4 space-y-2">
          {bookings.slice(0, 5).map((b) => (
            <div key={b.id} className="flex items-center justify-between py-2 border-b last:border-b-0 border-slate-100 text-sm">
              <div className="min-w-0"><div className="font-semibold text-slate-900 truncate">{b.patient.name} · {b.hospitalName}</div><div className="text-xs text-slate-500">{b.treatmentName} · {b.date}</div></div>
              <div className="flex items-center gap-3 shrink-0"><span className={"text-xs font-bold uppercase px-2 py-0.5 rounded " + STATUS_COLORS[b.status]}>{t(lang, `admin.status.${b.status}`)}</span><span className="font-semibold">${b.total.toLocaleString()}</span></div>
            </div>
          ))}
          {bookings.length === 0 && <div className="text-sm text-slate-400">{t(lang, "admin.overview.noBookings")}</div>}
        </div>
      </div>
    </div>
  );
}

/* ── Bookings ── */
function BookingsTab({ data, bump, lang }: { data: D; bump: () => void; lang: L }) {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<BookingStatus | "all">("all");
  const filtered = data.bookings.filter((b) => {
    if (status !== "all" && b.status !== status) return false;
    if (!q) return true;
    const n = q.toLowerCase();
    return [b.patient.name, b.patient.email, b.hospitalName, b.treatmentName, b.id].some((s) => s.toLowerCase().includes(n));
  });
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t(lang, "admin.searchBookings")} className="w-full pl-10 pr-3 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-sky-400" /></div>
        <select value={status} onChange={(e) => setStatus(e.target.value as BookingStatus | "all")} className="px-3 py-2.5 rounded-lg border border-slate-200 bg-white">
          <option value="all">{t(lang, "admin.allStatuses")}</option>
          {ALL_STATUSES.map((s) => <option key={s} value={s}>{t(lang, `admin.status.${s}`)}</option>)}
        </select>
      </div>
      <div className="bg-white border border-slate-200 rounded-2xl overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr>
            <th className="text-left px-4 py-3">{t(lang, "admin.th.patient")}</th><th className="text-left px-4 py-3">{t(lang, "admin.th.hospital")}</th><th className="text-left px-4 py-3">{t(lang, "admin.th.treatment")}</th><th className="text-left px-4 py-3">{t(lang, "admin.th.date")}</th><th className="text-left px-4 py-3">{t(lang, "admin.th.status")}</th><th className="text-right px-4 py-3">{t(lang, "admin.th.total")}</th><th className="text-right px-4 py-3">{t(lang, "admin.th.actions")}</th>
          </tr></thead>
          <tbody>
            {filtered.map((b) => (
              <tr key={b.id} className="border-t border-slate-100 hover:bg-slate-50/50">
                <td className="px-4 py-3"><div className="font-semibold">{b.patient.name}</div><div className="text-xs text-slate-500">{b.patient.email}</div></td>
                <td className="px-4 py-3">{b.hospitalName}</td><td className="px-4 py-3">{b.treatmentName}</td><td className="px-4 py-3">{b.date}</td>
                <td className="px-4 py-3"><div className="relative inline-block"><select value={b.status} onChange={(e) => { db.bookings.updateStatus(b.id, e.target.value as BookingStatus); bump(); }} className={"appearance-none pr-7 pl-2 py-1 text-xs font-bold uppercase rounded cursor-pointer border-0 " + STATUS_COLORS[b.status]}>{ALL_STATUSES.map((s) => <option key={s} value={s}>{t(lang, `admin.status.${s}`)}</option>)}</select><ChevronDown className="pointer-events-none absolute right-1 top-1/2 -translate-y-1/2 h-3 w-3" /></div></td>
                <td className="px-4 py-3 text-right font-semibold">${b.total.toLocaleString()}</td>
                <td className="px-4 py-3 text-right"><button onClick={() => { if (confirm(t(lang, "admin.confirm.deleteBooking"))) { db.bookings.remove(b.id); bump(); } }} className="text-xs text-slate-500 hover:text-rose-600 inline-flex items-center gap-1"><Trash2 className="h-3.5 w-3.5" /></button></td>
              </tr>
            ))}
            {filtered.length === 0 && <tr><td colSpan={7} className="px-4 py-10 text-center text-slate-400">{t(lang, "admin.noBookingsFound")}</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ── Users ── */
function UsersTab({ data, bump, lang }: { data: D; bump: () => void; lang: L }) {
  const [q, setQ] = useState("");
  const [editing, setEditing] = useState<User | null>(null);
  const filtered = data.users.filter((u) => !q || [u.name, u.email, u.country].some((s) => s.toLowerCase().includes(q.toLowerCase())));
  return (
    <div className="space-y-4">
      <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t(lang, "admin.searchUsers")} className="w-full pl-10 pr-3 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-sky-400" /></div>
      <div className="bg-white border border-slate-200 rounded-2xl overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr><th className="text-left px-4 py-3">{t(lang, "admin.th.user")}</th><th className="text-left px-4 py-3">{t(lang, "admin.th.country")}</th><th className="text-left px-4 py-3">{t(lang, "admin.th.role")}</th><th className="text-left px-4 py-3">{t(lang, "admin.th.managed")}</th><th className="text-left px-4 py-3">{t(lang, "admin.th.bookings")}</th><th className="text-right px-4 py-3">{t(lang, "admin.th.actions")}</th></tr></thead>
          <tbody>
            {filtered.map((u) => {
              const bkCount = data.bookings.filter((b) => b.userId === u.id).length;
              const managed: string[] = [];
              if (u.managedHospitalIds?.length) managed.push(`🏥 ${u.managedHospitalIds.length}`);
              if (u.managedInterpreterIds?.length) managed.push(`🗣️ ${u.managedInterpreterIds.length}`);
              if (u.managedHotelIds?.length) managed.push(`🏨 ${u.managedHotelIds.length}`);
              if (u.managedVehicleIds?.length) managed.push(`🚗 ${u.managedVehicleIds.length}`);
              return (
                <tr key={u.id} className="border-t border-slate-100 hover:bg-slate-50/50">
                  <td className="px-4 py-3"><div className="font-semibold">{u.name}</div><div className="text-xs text-slate-500">{u.email}</div></td>
                  <td className="px-4 py-3">{u.country}</td>
                  <td className="px-4 py-3"><span className={"text-xs font-bold px-2 py-0.5 rounded " + ROLE_COLORS[u.role]}>{t(lang, `admin.roles.${u.role}`)}</span></td>
                  <td className="px-4 py-3 text-xs text-slate-500">{managed.length ? managed.join(", ") : "—"}</td>
                  <td className="px-4 py-3">{bkCount}</td>
                  <td className="px-4 py-3 text-right space-x-2">
                    <button onClick={() => setEditing(u)} className="text-xs text-sky-600 hover:text-sky-800 inline-flex items-center gap-1"><Pencil className="h-3.5 w-3.5" /> {t(lang, "admin.btn.edit")}</button>
                    {u.role !== "admin" && <button onClick={() => { if (confirm(t(lang, "admin.confirm.deleteUser"))) { db.users.remove(u.id); bump(); } }} className="text-xs text-slate-500 hover:text-rose-600 inline-flex items-center gap-1"><Trash2 className="h-3.5 w-3.5" /></button>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {editing && <UserEditModal user={editing} data={data} onClose={() => setEditing(null)} bump={bump} lang={lang} />}
    </div>
  );
}

function UserEditModal({ user, data, onClose, bump, lang }: { user: User; data: D; onClose: () => void; bump: () => void; lang: L }) {
  const [role, setRole] = useState(user.role);
  const [hospIds, setHospIds] = useState<string[]>(user.managedHospitalIds ?? []);
  const [interpIds, setInterpIds] = useState<string[]>(user.managedInterpreterIds ?? []);
  const [hotelIds, setHotelIds] = useState<string[]>(user.managedHotelIds ?? []);
  const [vehicleIds, setVehicleIds] = useState<string[]>(user.managedVehicleIds ?? []);
  const save = () => {
    db.users.update({ ...user, role, managedHospitalIds: role === "hospital_manager" || role === "admin" ? hospIds : [], managedInterpreterIds: role === "interpreter_manager" || role === "admin" ? interpIds : [], managedHotelIds: role === "hotel_manager" || role === "admin" ? hotelIds : [], managedVehicleIds: role === "vehicle_manager" || role === "admin" ? vehicleIds : [] });
    bump(); onClose();
  };
  const tog = (list: string[], id: string) => list.includes(id) ? list.filter((x) => x !== id) : [...list, id];
  const allRoles: Role[] = ["user", "admin", "hospital_manager", "interpreter_manager", "hotel_manager", "vehicle_manager"];
  return (
    <Modal title={`${t(lang, "admin.user.editTitle")}: ${user.name}`} onClose={onClose} wide>
      <div className="space-y-5">
        <div><Inp label={t(lang, "booking.name")} value={user.name} onChange={() => {}} disabled /><p className="text-xs text-slate-400 mt-1">{user.email}</p></div>
        <div><label className="block text-xs font-semibold uppercase text-slate-500 mb-1">{t(lang, "admin.user.role")}</label>
          <div className="flex flex-wrap gap-2">{allRoles.map((r) => (<button key={r} onClick={() => setRole(r)} className={"px-3 py-1.5 rounded-lg border text-sm font-semibold " + (role === r ? "bg-slate-900 text-white border-slate-900" : "border-slate-200 text-slate-700 hover:border-slate-300")}>{t(lang, `admin.roles.${r}`)}</button>))}</div>
        </div>
        {(role === "hospital_manager" || role === "admin") && <CheckboxGroup label={t(lang, "admin.user.managedHospitals")} items={data.hospitals.map((h) => ({ id: h.id, label: h.name }))} selected={hospIds} toggle={(id) => setHospIds(tog(hospIds, id))} />}
        {(role === "interpreter_manager" || role === "admin") && <CheckboxGroup label={t(lang, "admin.user.managedInterp")} items={data.interpreters.map((i) => ({ id: i.id, label: `${i.flag} ${i.name}` }))} selected={interpIds} toggle={(id) => setInterpIds(tog(interpIds, id))} />}
        {(role === "hotel_manager" || role === "admin") && <CheckboxGroup label={t(lang, "admin.user.managedHotels")} items={data.hotels.map((h) => ({ id: h.id, label: h.name }))} selected={hotelIds} toggle={(id) => setHotelIds(tog(hotelIds, id))} />}
        {(role === "vehicle_manager" || role === "admin") && <CheckboxGroup label={t(lang, "admin.user.managedVehicles")} items={data.vehicles.map((v) => ({ id: v.id, label: v.name }))} selected={vehicleIds} toggle={(id) => setVehicleIds(tog(vehicleIds, id))} />}
        <div className="flex justify-end gap-2 pt-4 border-t">
          <button onClick={onClose} className="px-4 py-2 rounded-lg border border-slate-200 text-sm font-semibold hover:bg-slate-50">{t(lang, "admin.btn.cancel")}</button>
          <button onClick={save} className="px-4 py-2 rounded-lg bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 inline-flex items-center gap-1.5"><Save className="h-4 w-4" /> {t(lang, "admin.btn.save")}</button>
        </div>
      </div>
    </Modal>
  );
}

/* ── Hospitals ── */
function HospitalsTab({ data, bump, lang }: { data: D; bump: () => void; lang: L }) {
  const [editing, setEditing] = useState<Hospital | "new" | null>(null);
  return (
    <div className="space-y-4">
      <div className="flex justify-end"><button onClick={() => setEditing("new")} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800"><Plus className="h-4 w-4" /> {t(lang, "admin.hospital.addTitle")}</button></div>
      <div className="grid gap-3">
        {data.hospitals.map((h) => (
          <div key={h.id} className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col md:flex-row md:items-center gap-4">
            <img src={h.image} alt="" className="h-16 w-24 rounded-lg object-cover bg-slate-100 shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="font-bold text-slate-900">{h.name} <span className="text-sm text-slate-500">({h.nameKo})</span></div>
              <div className="text-xs text-slate-500">{t(lang, `categories.${h.category}`)} · {h.district}, {h.city} · {h.treatments.length} {t(lang, "admin.hospital.treatmentCount")} · {h.doctors.length} {t(lang, "admin.hospital.doctorCount")}</div>
              <div className="mt-1 flex flex-wrap gap-1 text-[10px]">
                {(h.allowedInterpreters?.length ?? 0) > 0 && <span className="bg-violet-100 text-violet-700 px-1.5 py-0.5 rounded">🗣️ {h.allowedInterpreters!.length}</span>}
                {(h.allowedHotels?.length ?? 0) > 0 && <span className="bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded">🏨 {h.allowedHotels!.length}</span>}
                {(h.allowedVehicles?.length ?? 0) > 0 && <span className="bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded">🚗 {h.allowedVehicles!.length}</span>}
                {!(h.allowedInterpreters?.length) && !(h.allowedHotels?.length) && !(h.allowedVehicles?.length) && <span className="bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">{t(lang, "admin.hospital.allServices")}</span>}
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button onClick={() => setEditing(h)} className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold hover:bg-slate-50 inline-flex items-center gap-1"><Pencil className="h-3 w-3" /> {t(lang, "admin.btn.edit")}</button>
              <button onClick={() => { if (confirm(t(lang, "admin.confirm.deleteHospital"))) { db.hospitals.remove(h.id); bump(); } }} className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-rose-600 hover:bg-rose-50 inline-flex items-center gap-1"><Trash2 className="h-3 w-3" /></button>
            </div>
          </div>
        ))}
      </div>
      {editing && <HospitalEditModal hospital={editing === "new" ? null : editing} data={data} onClose={() => setEditing(null)} bump={bump} lang={lang} />}
    </div>
  );
}

function HospitalEditModal({ hospital, data, onClose, bump, lang }: { hospital: Hospital | null; data: D; onClose: () => void; bump: () => void; lang: L }) {
  const isNew = !hospital;
  const [f, setF] = useState<Omit<Hospital, "id">>(() => hospital ?? { name: "", nameKo: "", category: "plastic-surgery" as Category, city: "Seoul", district: "", rating: 4.5, reviewCount: 0, priceFrom: 0, image: "https://images.pexels.com/photos/3985296/pexels-photo-3985296.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200", description: "", descriptionKo: "", languages: [], certifications: [], doctors: [], treatments: [], allowedInterpreters: [], allowedHotels: [], allowedVehicles: [] });
  const [langInput, setLangInput] = useState("");
  const [certInput, setCertInput] = useState("");
  const save = () => { if (!f.name) return; if (isNew) db.hospitals.create(f); else db.hospitals.save({ ...f, id: hospital!.id }); bump(); onClose(); };
  const upd = (p: Partial<Hospital>) => setF((prev) => ({ ...prev, ...p }));
  const tog = (list: string[], id: string) => list.includes(id) ? list.filter((x) => x !== id) : [...list, id];
  return (
    <Modal title={isNew ? t(lang, "admin.hospital.addTitle") : `${t(lang, "admin.hospital.editTitle")}: ${hospital!.name}`} onClose={onClose} wide>
      <div className="space-y-5">
        <div className="grid sm:grid-cols-2 gap-4">
          <Inp label={t(lang, "admin.hospital.nameEn")} value={f.name} onChange={(v) => upd({ name: v })} required />
          <Inp label={t(lang, "admin.hospital.nameKo")} value={f.nameKo} onChange={(v) => upd({ nameKo: v })} />
          <div><label className="block text-xs font-semibold uppercase text-slate-500 mb-1">{t(lang, "admin.hospital.category")}</label><select value={f.category} onChange={(e) => upd({ category: e.target.value as Category })} className="w-full px-3 py-2 rounded-lg border border-slate-200">{CATS.map((c) => <option key={c} value={c}>{t(lang, `categories.${c}`)}</option>)}</select></div>
          <Inp label={t(lang, "admin.hospital.district")} value={f.district} onChange={(v) => upd({ district: v })} />
          <Inp label={t(lang, "admin.hospital.city")} value={f.city} onChange={(v) => upd({ city: v })} />
          <Inp label={t(lang, "admin.hospital.rating")} value={f.rating} onChange={(v) => upd({ rating: Number(v) })} type="number" />
          <Inp label={t(lang, "admin.hospital.priceFrom")} value={f.priceFrom} onChange={(v) => upd({ priceFrom: Number(v) })} type="number" />
          <Inp label={t(lang, "admin.hospital.imageUrl")} value={f.image} onChange={(v) => upd({ image: v })} />
        </div>
        <div><label className="block text-xs font-semibold uppercase text-slate-500 mb-1">{t(lang, "admin.hospital.descEn")}</label><textarea value={f.description} onChange={(e) => upd({ description: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-slate-200 h-20" /></div>
        <div><label className="block text-xs font-semibold uppercase text-slate-500 mb-1">{t(lang, "admin.hospital.descKo")}</label><textarea value={f.descriptionKo} onChange={(e) => upd({ descriptionKo: e.target.value })} className="w-full px-3 py-2 rounded-lg border border-slate-200 h-20" /></div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div><label className="block text-xs font-semibold uppercase text-slate-500 mb-1">{t(lang, "admin.hospital.languages")}</label><div className="flex flex-wrap gap-1 mb-2">{f.languages.map((l, i) => <span key={i} className="bg-sky-100 text-sky-700 text-xs px-2 py-0.5 rounded-full inline-flex items-center gap-1">{l}<button onClick={() => upd({ languages: f.languages.filter((_, idx) => idx !== i) })}>×</button></span>)}</div><div className="flex gap-1"><input value={langInput} onChange={(e) => setLangInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); if (langInput.trim()) { upd({ languages: [...f.languages, langInput.trim()] }); setLangInput(""); } } }} className="flex-1 px-2 py-1 rounded border border-slate-200 text-sm" /><button onClick={() => { if (langInput.trim()) { upd({ languages: [...f.languages, langInput.trim()] }); setLangInput(""); } }} className="px-2 py-1 rounded bg-slate-100 text-xs font-semibold">+</button></div></div>
          <div><label className="block text-xs font-semibold uppercase text-slate-500 mb-1">{t(lang, "admin.hospital.certifications")}</label><div className="flex flex-wrap gap-1 mb-2">{f.certifications.map((c, i) => <span key={i} className="bg-emerald-100 text-emerald-700 text-xs px-2 py-0.5 rounded-full inline-flex items-center gap-1">{c}<button onClick={() => upd({ certifications: f.certifications.filter((_, idx) => idx !== i) })}>×</button></span>)}</div><div className="flex gap-1"><input value={certInput} onChange={(e) => setCertInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); if (certInput.trim()) { upd({ certifications: [...f.certifications, certInput.trim()] }); setCertInput(""); } } }} className="flex-1 px-2 py-1 rounded border border-slate-200 text-sm" /><button onClick={() => { if (certInput.trim()) { upd({ certifications: [...f.certifications, certInput.trim()] }); setCertInput(""); } }} className="px-2 py-1 rounded bg-slate-100 text-xs font-semibold">+</button></div></div>
        </div>
        <div><div className="flex items-center justify-between mb-2"><label className="text-xs font-semibold uppercase text-slate-500">{t(lang, "admin.hospital.treatments")} ({f.treatments.length})</label><button onClick={() => upd({ treatments: [...f.treatments, { id: "t_" + Math.random().toString(36).slice(2, 6), name: "", nameKo: "", duration: "", price: 0 }] })} className="text-xs text-sky-600 font-semibold inline-flex items-center gap-1"><Plus className="h-3 w-3" />{t(lang, "admin.btn.add")}</button></div><div className="space-y-2 max-h-48 overflow-y-auto">{f.treatments.map((tr, i) => (<div key={tr.id} className="flex items-center gap-2 bg-slate-50 rounded-lg p-2"><input value={tr.name} onChange={(e) => { const ts = [...f.treatments]; ts[i] = { ...ts[i], name: e.target.value }; upd({ treatments: ts }); }} placeholder="Name" className="flex-1 px-2 py-1 rounded border border-slate-200 text-sm" /><input value={tr.nameKo} onChange={(e) => { const ts = [...f.treatments]; ts[i] = { ...ts[i], nameKo: e.target.value }; upd({ treatments: ts }); }} placeholder="한국어" className="w-24 px-2 py-1 rounded border border-slate-200 text-sm" /><input value={tr.duration} onChange={(e) => { const ts = [...f.treatments]; ts[i] = { ...ts[i], duration: e.target.value }; upd({ treatments: ts }); }} placeholder="1h" className="w-16 px-2 py-1 rounded border border-slate-200 text-sm" /><input type="number" value={tr.price} onChange={(e) => { const ts = [...f.treatments]; ts[i] = { ...ts[i], price: Number(e.target.value) }; upd({ treatments: ts }); }} className="w-20 px-2 py-1 rounded border border-slate-200 text-sm" /><button onClick={() => upd({ treatments: f.treatments.filter((_, idx) => idx !== i) })} className="text-rose-500 hover:text-rose-700"><X className="h-4 w-4" /></button></div>))}</div></div>
        <div><div className="flex items-center justify-between mb-2"><label className="text-xs font-semibold uppercase text-slate-500">{t(lang, "admin.hospital.doctors")} ({f.doctors.length})</label><button onClick={() => upd({ doctors: [...f.doctors, { id: "d_" + Math.random().toString(36).slice(2, 6), name: "", specialty: "", experience: 0, avatar: "🧑‍⚕️", bio: "" }] })} className="text-xs text-sky-600 font-semibold inline-flex items-center gap-1"><Plus className="h-3 w-3" />{t(lang, "admin.btn.add")}</button></div><div className="space-y-2 max-h-48 overflow-y-auto">{f.doctors.map((doc, i) => (<div key={doc.id} className="flex items-center gap-2 bg-slate-50 rounded-lg p-2"><input value={doc.name} onChange={(e) => { const d = [...f.doctors]; d[i] = { ...d[i], name: e.target.value }; upd({ doctors: d }); }} placeholder="Name" className="flex-1 px-2 py-1 rounded border border-slate-200 text-sm" /><input value={doc.specialty} onChange={(e) => { const d = [...f.doctors]; d[i] = { ...d[i], specialty: e.target.value }; upd({ doctors: d }); }} placeholder="Specialty" className="w-28 px-2 py-1 rounded border border-slate-200 text-sm" /><input type="number" value={doc.experience} onChange={(e) => { const d = [...f.doctors]; d[i] = { ...d[i], experience: Number(e.target.value) }; upd({ doctors: d }); }} className="w-14 px-2 py-1 rounded border border-slate-200 text-sm" /><button onClick={() => upd({ doctors: f.doctors.filter((_, idx) => idx !== i) })} className="text-rose-500 hover:text-rose-700"><X className="h-4 w-4" /></button></div>))}</div></div>
        <div className="bg-sky-50/50 border border-sky-200 rounded-xl p-4 space-y-3"><h4 className="font-bold text-sm text-sky-900">🔗 {t(lang, "admin.hospital.compatibility")}</h4><p className="text-xs text-sky-800">{t(lang, "admin.hospital.compatDesc")}</p>
          <CheckboxGroup label={t(lang, "admin.hospital.allowedInterp")} items={data.interpreters.map((i) => ({ id: i.id, label: `${i.flag} ${i.name} (${i.language})` }))} selected={f.allowedInterpreters ?? []} toggle={(id) => upd({ allowedInterpreters: tog(f.allowedInterpreters ?? [], id) })} />
          <CheckboxGroup label={t(lang, "admin.hospital.allowedHotels")} items={data.hotels.map((h) => ({ id: h.id, label: h.name }))} selected={f.allowedHotels ?? []} toggle={(id) => upd({ allowedHotels: tog(f.allowedHotels ?? [], id) })} />
          <CheckboxGroup label={t(lang, "admin.hospital.allowedVehicles")} items={data.vehicles.map((v) => ({ id: v.id, label: v.name }))} selected={f.allowedVehicles ?? []} toggle={(id) => upd({ allowedVehicles: tog(f.allowedVehicles ?? [], id) })} />
        </div>
        <div className="flex justify-end gap-2 pt-4 border-t"><button onClick={onClose} className="px-4 py-2 rounded-lg border border-slate-200 text-sm font-semibold hover:bg-slate-50">{t(lang, "admin.btn.cancel")}</button><button onClick={save} className="px-4 py-2 rounded-lg bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 inline-flex items-center gap-1.5"><Save className="h-4 w-4" /> {isNew ? t(lang, "admin.btn.create") : t(lang, "admin.btn.save")}</button></div>
      </div>
    </Modal>
  );
}

/* ── Interpreters ── */
function InterpretersTab({ data, bump, lang }: { data: D; bump: () => void; lang: L }) {
  const [editing, setEditing] = useState<Interpreter | "new" | null>(null);
  return (
    <div className="space-y-4">
      <div className="flex justify-end"><button onClick={() => setEditing("new")} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800"><Plus className="h-4 w-4" /> {t(lang, "admin.interpreter.addTitle")}</button></div>
      <div className="bg-white border border-slate-200 rounded-2xl overflow-x-auto">
        <table className="w-full text-sm"><thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr><th className="text-left px-4 py-3">{t(lang, "admin.th.interpreter")}</th><th className="text-left px-4 py-3">{t(lang, "admin.th.language")}</th><th className="text-left px-4 py-3">{t(lang, "admin.th.rate")}</th><th className="text-left px-4 py-3">{t(lang, "admin.th.rating")}</th><th className="text-left px-4 py-3">{t(lang, "admin.th.medicalCert")}</th><th className="text-right px-4 py-3">{t(lang, "admin.th.actions")}</th></tr></thead>
          <tbody>{data.interpreters.map((i) => (
            <tr key={i.id} className="border-t border-slate-100 hover:bg-slate-50/50"><td className="px-4 py-3 font-semibold">{i.flag} {i.name}</td><td className="px-4 py-3">{i.language}</td><td className="px-4 py-3">${i.pricePerDay}/{lang === "ko" ? "일" : "day"}</td><td className="px-4 py-3">⭐ {i.rating}</td><td className="px-4 py-3">{i.medical ? <span className="text-emerald-600 font-semibold text-xs">✔ {t(lang, "admin.interpreter.certified")}</span> : <span className="text-slate-400 text-xs">{t(lang, "admin.interpreter.no")}</span>}</td><td className="px-4 py-3 text-right space-x-2"><button onClick={() => setEditing(i)} className="text-xs text-sky-600 inline-flex items-center gap-1"><Pencil className="h-3.5 w-3.5" /> {t(lang, "admin.btn.edit")}</button><button onClick={() => { if (confirm(t(lang, "admin.confirm.deleteInterpreter"))) { db.interpreters.remove(i.id); bump(); } }} className="text-xs text-slate-500 hover:text-rose-600 inline-flex items-center gap-1"><Trash2 className="h-3.5 w-3.5" /></button></td></tr>
          ))}</tbody></table></div>
      {editing && <InterpreterEditModal interp={editing === "new" ? null : editing} onClose={() => setEditing(null)} bump={bump} lang={lang} />}
    </div>
  );
}
function InterpreterEditModal({ interp, onClose, bump, lang }: { interp: Interpreter | null; onClose: () => void; bump: () => void; lang: L }) {
  const isNew = !interp;
  const [f, setF] = useState<Omit<Interpreter, "id">>(() => interp ?? { name: "", language: "", flag: "🌐", pricePerDay: 120, rating: 4.5, experience: 1, medical: false });
  const save = () => { if (!f.name) return; if (isNew) db.interpreters.create(f); else db.interpreters.save({ ...f, id: interp!.id }); bump(); onClose(); };
  const upd = (p: Partial<Interpreter>) => setF((prev) => ({ ...prev, ...p }));
  return (<Modal title={isNew ? t(lang, "admin.interpreter.addTitle") : `${t(lang, "admin.interpreter.editTitle")}: ${interp!.name}`} onClose={onClose}><div className="space-y-4"><div className="grid grid-cols-2 gap-4"><Inp label={t(lang, "admin.interpreter.name")} value={f.name} onChange={(v) => upd({ name: v })} required /><Inp label={t(lang, "admin.interpreter.language")} value={f.language} onChange={(v) => upd({ language: v })} /><Inp label={t(lang, "admin.interpreter.flag")} value={f.flag} onChange={(v) => upd({ flag: v })} /><Inp label={t(lang, "admin.interpreter.rate")} value={f.pricePerDay} onChange={(v) => upd({ pricePerDay: Number(v) })} type="number" /><Inp label={t(lang, "admin.interpreter.rating")} value={f.rating} onChange={(v) => upd({ rating: Number(v) })} type="number" /><Inp label={t(lang, "admin.interpreter.experience")} value={f.experience} onChange={(v) => upd({ experience: Number(v) })} type="number" /></div><label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={f.medical} onChange={(e) => upd({ medical: e.target.checked })} className="rounded" /><span className="text-sm font-semibold text-slate-700">{t(lang, "admin.interpreter.medicalCert")}</span></label><div className="flex justify-end gap-2 pt-4 border-t"><button onClick={onClose} className="px-4 py-2 rounded-lg border border-slate-200 text-sm font-semibold hover:bg-slate-50">{t(lang, "admin.btn.cancel")}</button><button onClick={save} className="px-4 py-2 rounded-lg bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 inline-flex items-center gap-1.5"><Save className="h-4 w-4" />{isNew ? t(lang, "admin.btn.create") : t(lang, "admin.btn.save")}</button></div></div></Modal>);
}

/* ── Hotels ── */
function HotelsTab({ data, bump, lang }: { data: D; bump: () => void; lang: L }) {
  const [editing, setEditing] = useState<Hotel | "new" | null>(null);
  return (
    <div className="space-y-4">
      <div className="flex justify-end"><button onClick={() => setEditing("new")} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800"><Plus className="h-4 w-4" /> {t(lang, "admin.hotel.addTitle")}</button></div>
      <div className="bg-white border border-slate-200 rounded-2xl overflow-x-auto">
        <table className="w-full text-sm"><thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr><th className="text-left px-4 py-3">{t(lang, "admin.th.hotel")}</th><th className="text-left px-4 py-3">{t(lang, "admin.th.district")}</th><th className="text-left px-4 py-3">{t(lang, "admin.th.stars")}</th><th className="text-left px-4 py-3">{t(lang, "admin.th.rate")}</th><th className="text-left px-4 py-3">{t(lang, "admin.th.amenities")}</th><th className="text-right px-4 py-3">{t(lang, "admin.th.actions")}</th></tr></thead>
          <tbody>{data.hotels.map((h) => (
            <tr key={h.id} className="border-t border-slate-100 hover:bg-slate-50/50"><td className="px-4 py-3 font-semibold">{h.image} {h.name}</td><td className="px-4 py-3">{h.district}</td><td className="px-4 py-3">{"★".repeat(h.stars)}</td><td className="px-4 py-3">${h.pricePerNight}/{lang === "ko" ? "박" : "n"}</td><td className="px-4 py-3"><div className="flex flex-wrap gap-1">{h.amenities.map((a) => <span key={a} className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded">{a}</span>)}</div></td><td className="px-4 py-3 text-right space-x-2"><button onClick={() => setEditing(h)} className="text-xs text-sky-600 inline-flex items-center gap-1"><Pencil className="h-3.5 w-3.5" /> {t(lang, "admin.btn.edit")}</button><button onClick={() => { if (confirm(t(lang, "admin.confirm.deleteHotel"))) { db.hotels.remove(h.id); bump(); } }} className="text-xs text-slate-500 hover:text-rose-600 inline-flex items-center gap-1"><Trash2 className="h-3.5 w-3.5" /></button></td></tr>
          ))}</tbody></table></div>
      {editing && <HotelEditModal hotel={editing === "new" ? null : editing} onClose={() => setEditing(null)} bump={bump} lang={lang} />}
    </div>
  );
}
function HotelEditModal({ hotel, onClose, bump, lang }: { hotel: Hotel | null; onClose: () => void; bump: () => void; lang: L }) {
  const isNew = !hotel;
  const [f, setF] = useState<Omit<Hotel, "id">>(() => hotel ?? { name: "", district: "", stars: 3, pricePerNight: 100, image: "🏨", amenities: [] });
  const [amIn, setAmIn] = useState("");
  const save = () => { if (!f.name) return; if (isNew) db.hotels.create(f); else db.hotels.save({ ...f, id: hotel!.id }); bump(); onClose(); };
  const upd = (p: Partial<Hotel>) => setF((prev) => ({ ...prev, ...p }));
  return (<Modal title={isNew ? t(lang, "admin.hotel.addTitle") : `${t(lang, "admin.hotel.editTitle")}: ${hotel!.name}`} onClose={onClose}><div className="space-y-4"><div className="grid grid-cols-2 gap-4"><Inp label={t(lang, "admin.hotel.name")} value={f.name} onChange={(v) => upd({ name: v })} required /><Inp label={t(lang, "admin.hotel.district")} value={f.district} onChange={(v) => upd({ district: v })} /><Inp label={t(lang, "admin.hotel.stars")} value={f.stars} onChange={(v) => upd({ stars: Number(v) })} type="number" /><Inp label={t(lang, "admin.hotel.rate")} value={f.pricePerNight} onChange={(v) => upd({ pricePerNight: Number(v) })} type="number" /><Inp label={t(lang, "admin.hotel.emoji")} value={f.image} onChange={(v) => upd({ image: v })} /></div><div><label className="block text-xs font-semibold uppercase text-slate-500 mb-1">{t(lang, "admin.hotel.amenities")}</label><div className="flex flex-wrap gap-1 mb-2">{f.amenities.map((a, i) => <span key={i} className="bg-sky-100 text-sky-700 text-xs px-2 py-0.5 rounded-full inline-flex items-center gap-1">{a}<button onClick={() => upd({ amenities: f.amenities.filter((_, idx) => idx !== i) })}>×</button></span>)}</div><div className="flex gap-1"><input value={amIn} onChange={(e) => setAmIn(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); if (amIn.trim()) { upd({ amenities: [...f.amenities, amIn.trim()] }); setAmIn(""); } } }} className="flex-1 px-2 py-1 rounded border border-slate-200 text-sm" /><button onClick={() => { if (amIn.trim()) { upd({ amenities: [...f.amenities, amIn.trim()] }); setAmIn(""); } }} className="px-2 py-1 rounded bg-slate-100 text-xs font-semibold">+</button></div></div><div className="flex justify-end gap-2 pt-4 border-t"><button onClick={onClose} className="px-4 py-2 rounded-lg border border-slate-200 text-sm font-semibold hover:bg-slate-50">{t(lang, "admin.btn.cancel")}</button><button onClick={save} className="px-4 py-2 rounded-lg bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 inline-flex items-center gap-1.5"><Save className="h-4 w-4" />{isNew ? t(lang, "admin.btn.create") : t(lang, "admin.btn.save")}</button></div></div></Modal>);
}

/* ── Vehicles ── */
function VehiclesTab({ data, bump, lang }: { data: D; bump: () => void; lang: L }) {
  const [editing, setEditing] = useState<Vehicle | "new" | null>(null);
  return (
    <div className="space-y-4">
      <div className="flex justify-end"><button onClick={() => setEditing("new")} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800"><Plus className="h-4 w-4" /> {t(lang, "admin.vehicle.addTitle")}</button></div>
      <div className="bg-white border border-slate-200 rounded-2xl overflow-x-auto">
        <table className="w-full text-sm"><thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr><th className="text-left px-4 py-3">{t(lang, "admin.th.vehicle")}</th><th className="text-left px-4 py-3">{t(lang, "admin.th.type")}</th><th className="text-left px-4 py-3">{t(lang, "admin.th.capacity")}</th><th className="text-left px-4 py-3">{t(lang, "admin.th.rate")}</th><th className="text-right px-4 py-3">{t(lang, "admin.th.actions")}</th></tr></thead>
          <tbody>{data.vehicles.map((v) => (
            <tr key={v.id} className="border-t border-slate-100 hover:bg-slate-50/50"><td className="px-4 py-3 font-semibold">{v.image} {v.name}</td><td className="px-4 py-3 uppercase text-xs">{t(lang, `admin.vehicle.${v.type}`)}</td><td className="px-4 py-3">{v.capacity} {t(lang, "admin.vehicle.seats")}</td><td className="px-4 py-3">${v.pricePerDay}/{lang === "ko" ? "일" : "day"}</td><td className="px-4 py-3 text-right space-x-2"><button onClick={() => setEditing(v)} className="text-xs text-sky-600 inline-flex items-center gap-1"><Pencil className="h-3.5 w-3.5" /> {t(lang, "admin.btn.edit")}</button><button onClick={() => { if (confirm(t(lang, "admin.confirm.deleteVehicle"))) { db.vehicles.remove(v.id); bump(); } }} className="text-xs text-slate-500 hover:text-rose-600 inline-flex items-center gap-1"><Trash2 className="h-3.5 w-3.5" /></button></td></tr>
          ))}</tbody></table></div>
      {editing && <VehicleEditModal vehicle={editing === "new" ? null : editing} onClose={() => setEditing(null)} bump={bump} lang={lang} />}
    </div>
  );
}
function VehicleEditModal({ vehicle, onClose, bump, lang }: { vehicle: Vehicle | null; onClose: () => void; bump: () => void; lang: L }) {
  const isNew = !vehicle;
  const [f, setF] = useState<Omit<Vehicle, "id">>(() => vehicle ?? { name: "", type: "sedan", capacity: 4, pricePerDay: 150, image: "🚗" });
  const save = () => { if (!f.name) return; if (isNew) db.vehicles.create(f); else db.vehicles.save({ ...f, id: vehicle!.id }); bump(); onClose(); };
  const upd = (p: Partial<Vehicle>) => setF((prev) => ({ ...prev, ...p }));
  return (<Modal title={isNew ? t(lang, "admin.vehicle.addTitle") : `${t(lang, "admin.vehicle.editTitle")}: ${vehicle!.name}`} onClose={onClose}><div className="space-y-4"><div className="grid grid-cols-2 gap-4"><Inp label={t(lang, "admin.vehicle.name")} value={f.name} onChange={(v) => upd({ name: v })} required /><div><label className="block text-xs font-semibold uppercase text-slate-500 mb-1">{t(lang, "admin.vehicle.type")}</label><select value={f.type} onChange={(e) => upd({ type: e.target.value as Vehicle["type"] })} className="w-full px-3 py-2 rounded-lg border border-slate-200"><option value="sedan">{t(lang, "admin.vehicle.sedan")}</option><option value="van">{t(lang, "admin.vehicle.van")}</option><option value="suv">{t(lang, "admin.vehicle.suv")}</option></select></div><Inp label={t(lang, "admin.vehicle.capacity")} value={f.capacity} onChange={(v) => upd({ capacity: Number(v) })} type="number" /><Inp label={t(lang, "admin.vehicle.rate")} value={f.pricePerDay} onChange={(v) => upd({ pricePerDay: Number(v) })} type="number" /><Inp label={t(lang, "admin.vehicle.emoji")} value={f.image} onChange={(v) => upd({ image: v })} /></div><div className="flex justify-end gap-2 pt-4 border-t"><button onClick={onClose} className="px-4 py-2 rounded-lg border border-slate-200 text-sm font-semibold hover:bg-slate-50">{t(lang, "admin.btn.cancel")}</button><button onClick={save} className="px-4 py-2 rounded-lg bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 inline-flex items-center gap-1.5"><Save className="h-4 w-4" />{isNew ? t(lang, "admin.btn.create") : t(lang, "admin.btn.save")}</button></div></div></Modal>);
}
