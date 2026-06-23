import { Link, useLocation, useNavigate } from "react-router-dom";
import { useApp, db } from "../context/AppContext";
import { t } from "../lib/i18n";
import { Calendar, MapPin, XCircle, CheckCircle2 } from "lucide-react";
import { useEffect, useState } from "react";
import { RequireAuth } from "../components/AuthGuards";

function DashboardInner() {
  const { lang, user, refreshTick, refresh } = useApp();
  const loc = useLocation();
  const nav = useNavigate();
  const [showSuccess, setShowSuccess] = useState(
    (loc.state as { justBooked?: boolean } | null)?.justBooked ?? false,
  );

  useEffect(() => {
    if (showSuccess) {
      const id = setTimeout(() => setShowSuccess(false), 4000);
      return () => clearTimeout(id);
    }
  }, [showSuccess]);

  if (!user) return null;

  const bookings = db.bookings.list().filter((b) => b.userId === user.id);

  const cancel = (id: string) => {
    db.bookings.cancel(id);
    refresh();
  };

  return (
    <div className="max-w-5xl mx-auto px-5 py-10">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-3xl font-bold text-slate-900">{t(lang, "dashboard.title")}</h1>
        {user.role === "admin" && (
          <button
            onClick={() => nav("/admin")}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-amber-100 text-amber-800 text-xs font-semibold hover:bg-amber-200"
          >
            👑 {t(lang, "dashboard.openAdmin")}
          </button>
        )}
      </div>

      {showSuccess && (
        <div className="mt-5 flex items-start gap-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 p-4">
          <CheckCircle2 className="h-5 w-5 shrink-0 mt-0.5" />
          <div className="text-sm">{t(lang, "booking.success")}</div>
        </div>
      )}

      {bookings.length === 0 ? (
        <div className="mt-16 text-center">
          <div className="text-5xl">📋</div>
          <p className="mt-4 text-slate-500">{t(lang, "dashboard.empty")}</p>
          <Link
            to="/hospitals"
            className="mt-5 inline-flex rounded-xl bg-slate-900 text-white px-5 py-3 text-sm font-semibold hover:bg-slate-800"
          >
            {t(lang, "dashboard.browse")} →
          </Link>
        </div>
      ) : (
        <div className="mt-6 space-y-3" key={refreshTick}>
          {bookings.map((b) => {
            const cancelled = b.status === "cancelled";
            return (
              <div
                key={b.id}
                className={
                  "bg-white border rounded-2xl p-5 flex flex-col md:flex-row md:items-center gap-4 " +
                  (cancelled ? "border-slate-200 opacity-60" : "border-slate-200")
                }
              >
                <div className="h-12 w-12 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center text-xl">
                  🏥
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <div className="font-bold text-slate-900">{b.hospitalName}</div>
                    <span
                      className={
                        "text-xs font-semibold px-2 py-0.5 rounded-full " +
                        (cancelled
                          ? "bg-slate-100 text-slate-600"
                          : b.status === "confirmed"
                          ? "bg-emerald-100 text-emerald-700"
                          : b.status === "in-progress"
                          ? "bg-indigo-100 text-indigo-700"
                          : b.status === "completed"
                          ? "bg-sky-100 text-sky-700"
                          : "bg-amber-100 text-amber-700")
                      }
                    >
                      {b.status}
                    </span>
                  </div>
                  <div className="mt-1 text-sm text-slate-600">{b.treatmentName}</div>
                  <div className="mt-2 flex flex-wrap gap-4 text-xs text-slate-500">
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" /> {b.date}
                    </span>
                    {b.interpreterName && <span>🗣️ {b.interpreterName}</span>}
                    {b.hotelName && <span>🏨 {b.hotelName}</span>}
                    {b.vehicleName && <span>🚗 {b.vehicleName}</span>}
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" /> {b.patient.country}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold text-slate-900">
                    ${b.total.toLocaleString()}
                  </div>
                  {!cancelled && (
                    <button
                      onClick={() => cancel(b.id)}
                      className="mt-1 inline-flex items-center gap-1 text-xs text-slate-500 hover:text-rose-600"
                    >
                      <XCircle className="h-3.5 w-3.5" /> {t(lang, "dashboard.cancel")}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function Dashboard() {
  return (
    <RequireAuth>
      <DashboardInner />
    </RequireAuth>
  );
}
