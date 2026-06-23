import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useApp, db } from "../context/AppContext";
import { t } from "../lib/i18n";
import { ArrowLeft, BadgeCheck, Check } from "lucide-react";
import { RequireAuth } from "../components/AuthGuards";

function BookingInner() {
  const { hospitalId, treatmentId } = useParams();
  const { lang, user, refresh } = useApp();
  const nav = useNavigate();

  const hospital = db.hospitals.get(hospitalId || "");
  const treatment = hospital?.treatments.find((tr) => tr.id === treatmentId);

  // Filter services by hospital compatibility
  const allInterpreters = db.interpreters.list();
  const allHotels = db.hotels.list();
  const allVehicles = db.vehicles.list();

  const interpreters = hospital?.allowedInterpreters?.length
    ? allInterpreters.filter((i) => hospital.allowedInterpreters!.includes(i.id))
    : allInterpreters;
  const hotels = hospital?.allowedHotels?.length
    ? allHotels.filter((h) => hospital.allowedHotels!.includes(h.id))
    : allHotels;
  const vehicles = hospital?.allowedVehicles?.length
    ? allVehicles.filter((v) => hospital.allowedVehicles!.includes(v.id))
    : allVehicles;

  const [form, setForm] = useState({
    name: user?.name ?? "",
    email: user?.email ?? "",
    country: user?.country ?? "",
    phone: "",
    date: new Date(Date.now() + 7 * 864e5).toISOString().slice(0, 10),
  });
  const [interpreterId, setInterpreterId] = useState<string | undefined>();
  const [hotelId, setHotelId] = useState<string | undefined>();
  const [vehicleId, setVehicleId] = useState<string | undefined>();

  const totals = useMemo(() => {
    const trPrice = treatment?.price ?? 0;
    const ip = interpreters.find((i) => i.id === interpreterId);
    const ht = hotels.find((h) => h.id === hotelId);
    const vh = vehicles.find((v) => v.id === vehicleId);
    return {
      treatment: trPrice,
      interpreter: ip?.pricePerDay ?? 0,
      hotel: ht?.pricePerNight ?? 0,
      vehicle: vh?.pricePerDay ?? 0,
      total: trPrice + (ip?.pricePerDay ?? 0) + (ht?.pricePerNight ?? 0) + (vh?.pricePerDay ?? 0),
      names: { ip: ip?.name, ht: ht?.name, vh: vh?.name },
    };
  }, [treatment, interpreterId, hotelId, vehicleId, interpreters, hotels, vehicles]);

  if (!hospital || !treatment || !user) {
    return (
      <div className="max-w-4xl mx-auto px-5 py-20 text-center text-slate-500">
        {t(lang, "booking.invalid")}
      </div>
    );
  }

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.country) return;
    db.bookings.create({
      userId: user.id,
      patient: {
        name: form.name,
        email: form.email,
        country: form.country,
        phone: form.phone,
      },
      hospitalId: hospital.id,
      hospitalName: hospital.name,
      treatmentId: treatment.id,
      treatmentName: treatment.name,
      date: form.date,
      interpreterId,
      interpreterName: totals.names.ip,
      hotelId,
      hotelName: totals.names.ht,
      vehicleId,
      vehicleName: totals.names.vh,
      total: totals.total,
    });
    refresh();
    nav("/dashboard", { state: { justBooked: true } });
  };

  return (
    <div className="max-w-6xl mx-auto px-5 py-8">
      <button onClick={() => nav(-1)} className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900">
        <ArrowLeft className="h-4 w-4" /> {t(lang, "booking.back")}
      </button>

      <h1 className="mt-4 text-3xl font-bold text-slate-900">{t(lang, "booking.title")}</h1>
      <div className="mt-1 text-slate-500">
        {hospital.name} · {treatment.name}
      </div>

      <form onSubmit={submit} className="mt-8 grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <section className="bg-white border border-slate-200 rounded-2xl p-6">
            <h2 className="font-bold text-slate-900">{t(lang, "booking.patient")}</h2>
            <div className="mt-4 grid sm:grid-cols-2 gap-4">
              <Field label={t(lang, "booking.name")} value={form.name} onChange={(v) => setForm({ ...form, name: v })} required />
              <Field label={t(lang, "booking.email")} type="email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} required />
              <Field label={t(lang, "booking.country")} value={form.country} onChange={(v) => setForm({ ...form, country: v })} required />
              <Field label={t(lang, "booking.phone")} value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} />
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
                  {t(lang, "booking.date")}
                </label>
                <input
                  type="date"
                  value={form.date}
                  min={new Date().toISOString().slice(0, 10)}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
                />
              </div>
            </div>
          </section>

          <section className="bg-white border border-slate-200 rounded-2xl p-6">
            <h2 className="font-bold text-slate-900">{t(lang, "booking.extras")}</h2>

            <div className="mt-5">
              <div className="text-xs font-semibold uppercase text-slate-500 mb-2">
                🗣️ {t(lang, "booking.interpreter")}
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                {interpreters.map((i) => {
                  const sel = interpreterId === i.id;
                  return (
                    <button
                      type="button"
                      key={i.id}
                      onClick={() => setInterpreterId(sel ? undefined : i.id)}
                      className={
                        "text-left p-3 rounded-xl border transition flex items-center gap-3 " +
                        (sel ? "border-sky-500 bg-sky-50" : "border-slate-200 hover:border-slate-300")
                      }
                    >
                      <div className="text-2xl">{i.flag}</div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-sm text-slate-900">{i.name}</div>
                        <div className="text-xs text-slate-500 flex items-center gap-2 flex-wrap">
                          <span>{i.language}</span>
                          {i.medical && (
                            <span className="inline-flex items-center gap-0.5 text-emerald-600">
                              <BadgeCheck className="h-3 w-3" /> {t(lang, "booking.medical")}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-sm font-bold text-slate-900">
                        ${i.pricePerDay}
                        <span className="text-xs font-normal text-slate-500">{t(lang, "booking.perDay")}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-6">
              <div className="text-xs font-semibold uppercase text-slate-500 mb-2">
                🏨 {t(lang, "booking.hotel")}
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                {hotels.map((h) => {
                  const sel = hotelId === h.id;
                  return (
                    <button
                      type="button"
                      key={h.id}
                      onClick={() => setHotelId(sel ? undefined : h.id)}
                      className={
                        "text-left p-3 rounded-xl border transition " +
                        (sel ? "border-sky-500 bg-sky-50" : "border-slate-200 hover:border-slate-300")
                      }
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="font-semibold text-sm text-slate-900">{h.name}</div>
                          <div className="text-xs text-slate-500">
                            {h.district} · {"★".repeat(h.stars)}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-slate-900">${h.pricePerNight}</div>
                          <div className="text-xs text-slate-500">{t(lang, "booking.perNight")}</div>
                        </div>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-1">
                        {h.amenities.slice(0, 3).map((a) => (
                          <span key={a} className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{a}</span>
                        ))}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-6">
              <div className="text-xs font-semibold uppercase text-slate-500 mb-2">
                🚗 {t(lang, "booking.vehicle")}
              </div>
              <div className="grid sm:grid-cols-3 gap-3">
                {vehicles.map((v) => {
                  const sel = vehicleId === v.id;
                  return (
                    <button
                      type="button"
                      key={v.id}
                      onClick={() => setVehicleId(sel ? undefined : v.id)}
                      className={
                        "text-left p-3 rounded-xl border transition " +
                        (sel ? "border-sky-500 bg-sky-50" : "border-slate-200 hover:border-slate-300")
                      }
                    >
                      <div className="text-2xl">{v.image}</div>
                      <div className="mt-1 font-semibold text-sm text-slate-900">{v.name}</div>
                      <div className="text-xs text-slate-500">
                        {v.capacity} {t(lang, "booking.seats")}
                      </div>
                      <div className="mt-2 font-bold text-slate-900">
                        ${v.pricePerDay}
                        <span className="text-xs font-normal text-slate-500">{t(lang, "booking.perDay")}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </section>
        </div>

        <aside className="lg:col-span-1">
          <div className="sticky top-20 bg-white border border-slate-200 rounded-2xl p-6">
            <h3 className="font-bold text-slate-900">{t(lang, "booking.summary")}</h3>
            <div className="mt-4 space-y-3 text-sm">
              <Row label={t(lang, "booking.treatment")} value={`$${totals.treatment.toLocaleString()}`} sub={treatment.name} />
              {totals.interpreter > 0 && (
                <Row label={t(lang, "booking.interpreter")} value={`$${totals.interpreter}`} sub={totals.names.ip} />
              )}
              {totals.hotel > 0 && (
                <Row label={t(lang, "booking.hotel")} value={`$${totals.hotel}`} sub={totals.names.ht} />
              )}
              {totals.vehicle > 0 && (
                <Row label={t(lang, "booking.vehicle")} value={`$${totals.vehicle}`} sub={totals.names.vh} />
              )}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="font-bold text-slate-900">{t(lang, "booking.total")}</span>
                <span className="text-2xl font-extrabold text-slate-900">
                  ${totals.total.toLocaleString()}
                </span>
              </div>
            </div>
            <button
              type="submit"
              className="mt-6 w-full inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 text-white px-5 py-3 text-sm font-semibold hover:bg-slate-800 transition"
            >
              <Check className="h-4 w-4" /> {t(lang, "booking.confirm")}
            </button>
            <p className="mt-3 text-xs text-slate-500 text-center">
              {t(lang, "booking.demoNote")}
            </p>
          </div>
        </aside>
      </form>
    </div>
  );
}

export default function Booking() {
  return (
    <RequireAuth>
      <BookingInner />
    </RequireAuth>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">
        {label}
      </label>
      <input
        type={type}
        value={value}
        required={required}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
      />
    </div>
  );
}

function Row({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <div className="font-medium text-slate-700">{label}</div>
        {sub && <div className="text-xs text-slate-500 truncate">{sub}</div>}
      </div>
      <div className="font-semibold text-slate-900 shrink-0">{value}</div>
    </div>
  );
}
