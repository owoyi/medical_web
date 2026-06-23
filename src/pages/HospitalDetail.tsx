import { Link, useNavigate, useParams } from "react-router-dom";
import { useApp, db } from "../context/AppContext";
import { t } from "../lib/i18n";
import { ArrowLeft, Award, Languages, Star } from "lucide-react";
import { useState } from "react";

export default function HospitalDetail() {
  const { id } = useParams();
  const { lang, user } = useApp();
  const nav = useNavigate();
  const hospital = db.hospitals.get(id || "");
  const [selectedTreatment, setSelectedTreatment] = useState<string | null>(null);

  if (!hospital) {
    return (
      <div className="max-w-6xl mx-auto px-5 py-20 text-center">
        <p className="text-slate-500">{t(lang, "detail.notFound")}</p>
        <Link to="/hospitals" className="mt-4 inline-block text-sky-600 hover:underline">
          ← {t(lang, "detail.back")}
        </Link>
      </div>
    );
  }

  const goBooking = () => {
    if (!selectedTreatment) return;
    if (!user) {
      nav("/login", { state: { from: `/booking/${hospital.id}/${selectedTreatment}` } });
      return;
    }
    nav(`/booking/${hospital.id}/${selectedTreatment}`);
  };

  return (
    <div className="max-w-6xl mx-auto px-5 py-8">
      <Link
        to="/hospitals"
        className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900"
      >
        <ArrowLeft className="h-4 w-4" /> {t(lang, "detail.back")}
      </Link>

      {/* Header */}
      <div className="mt-5 grid md:grid-cols-5 gap-6 bg-white border border-slate-200 rounded-2xl overflow-hidden">
        <div className="md:col-span-2 aspect-[4/3] md:aspect-auto bg-slate-100">
          <img src={hospital.image} alt={hospital.name} className="h-full w-full object-cover" />
        </div>
        <div className="md:col-span-3 p-6 md:p-8">
          <div className="text-xs font-semibold uppercase tracking-wide text-sky-600">
            {t(lang, `categories.${hospital.category}`)}
          </div>
          <h1 className="mt-1 text-3xl font-bold text-slate-900">{hospital.name}</h1>
          {lang === "ko" && <div className="text-slate-500">{hospital.nameKo}</div>}

          <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-slate-600">
            <span className="inline-flex items-center gap-1">
              📍 {hospital.district}, {hospital.city}
            </span>
            <span className="inline-flex items-center gap-1 text-amber-600">
              <Star className="h-4 w-4 fill-amber-500" /> {hospital.rating}
              <span className="text-slate-400">({hospital.reviewCount} {t(lang, "hospitals.reviews")})</span>
            </span>
          </div>

          <p className="mt-4 text-slate-700 leading-relaxed">
            {lang === "ko" ? hospital.descriptionKo : hospital.description}
          </p>

          <div className="mt-5 grid grid-cols-2 gap-4">
            <div className="flex items-start gap-2">
              <Languages className="h-4 w-4 mt-0.5 text-sky-600" />
              <div>
                <div className="text-xs font-semibold uppercase text-slate-500">
                  {t(lang, "detail.languages")}
                </div>
                <div className="text-sm text-slate-700">{hospital.languages.join(", ")}</div>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Award className="h-4 w-4 mt-0.5 text-sky-600" />
              <div>
                <div className="text-xs font-semibold uppercase text-slate-500">
                  {t(lang, "detail.certifications")}
                </div>
                <div className="text-sm text-slate-700">{hospital.certifications.join(" · ")}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Doctors */}
      <section className="mt-10">
        <h2 className="text-xl font-bold text-slate-900">{t(lang, "detail.doctors")}</h2>
        <div className="mt-4 grid sm:grid-cols-2 gap-4">
          {hospital.doctors.map((d) => (
            <div key={d.id} className="bg-white border border-slate-200 rounded-xl p-5 flex items-center gap-4">
              <div className="h-14 w-14 rounded-full bg-slate-100 flex items-center justify-center text-2xl">
                {d.avatar}
              </div>
              <div className="flex-1">
                <div className="font-semibold text-slate-900">{d.name}</div>
                <div className="text-sm text-slate-500">{d.specialty} · {d.experience} {t(lang, "detail.exp")}</div>
                <div className="text-sm text-slate-600 mt-1">{d.bio}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Treatments */}
      <section className="mt-10">
        <h2 className="text-xl font-bold text-slate-900">{t(lang, "detail.treatments")}</h2>
        <div className="mt-4 bg-white border border-slate-200 rounded-2xl overflow-hidden">
          {hospital.treatments.map((tr) => {
            const sel = selectedTreatment === tr.id;
            return (
              <button
                key={tr.id}
                onClick={() => setSelectedTreatment(tr.id)}
                className={
                  "w-full flex items-center justify-between px-5 py-4 text-left border-b last:border-b-0 border-slate-100 transition " +
                  (sel ? "bg-sky-50" : "hover:bg-slate-50")
                }
              >
                <div>
                  <div className="font-semibold text-slate-900">{tr.name}</div>
                  <div className="text-xs text-slate-500">{tr.nameKo} · {tr.duration}</div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="font-bold text-slate-900">${tr.price.toLocaleString()}</div>
                  <div
                    className={
                      "h-5 w-5 rounded-full border-2 " +
                      (sel ? "bg-sky-600 border-sky-600" : "border-slate-300")
                    }
                  >
                    {sel && (
                      <div className="h-full w-full flex items-center justify-center text-white text-xs">✓</div>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        <button
          disabled={!selectedTreatment}
          onClick={goBooking}
          className="mt-6 w-full sm:w-auto inline-flex justify-center rounded-xl bg-slate-900 text-white px-6 py-3 text-sm font-semibold hover:bg-slate-800 transition disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {t(lang, "detail.book")} →
        </button>
      </section>
    </div>
  );
}
