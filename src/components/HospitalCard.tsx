import { Link } from "react-router-dom";
import type { Hospital } from "../lib/types";
import { MapPin, Star } from "lucide-react";
import { useApp } from "../context/AppContext";
import { t } from "../lib/i18n";

export default function HospitalCard({ hospital }: { hospital: Hospital }) {
  const { lang } = useApp();
  return (
    <Link
      to={`/hospitals/${hospital.id}`}
      className="group bg-white rounded-2xl overflow-hidden border border-slate-200 hover:border-sky-300 hover:shadow-lg transition flex flex-col"
    >
      <div className="aspect-[16/10] overflow-hidden bg-slate-100">
        <img
          src={hospital.image}
          alt={hospital.name}
          className="h-full w-full object-cover group-hover:scale-105 transition duration-500"
          loading="lazy"
        />
      </div>
      <div className="p-5 flex flex-col gap-3 flex-1">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wide text-sky-600">
            {t(lang, `categories.${hospital.category}`)}
          </div>
          <h3 className="mt-1 text-lg font-bold text-slate-900">
            {hospital.name}
          </h3>
          {lang === "ko" && (
            <div className="text-sm text-slate-500">{hospital.nameKo}</div>
          )}
        </div>
        <div className="flex items-center gap-3 text-sm text-slate-600">
          <span className="inline-flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5" /> {hospital.district}, {hospital.city}
          </span>
          <span className="inline-flex items-center gap-1 text-amber-600">
            <Star className="h-3.5 w-3.5 fill-amber-500" /> {hospital.rating}
            <span className="text-slate-400">({hospital.reviewCount})</span>
          </span>
        </div>
        <div className="mt-auto pt-3 border-t border-slate-100 flex items-center justify-between">
          <div className="text-xs text-slate-500">
            {t(lang, "hospitals.from")}
          </div>
          <div className="text-lg font-bold text-slate-900">
            ${hospital.priceFrom.toLocaleString()}
          </div>
        </div>
      </div>
    </Link>
  );
}
