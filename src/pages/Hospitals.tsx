import { useMemo, useState } from "react";
import { useApp, db } from "../context/AppContext";
import { t } from "../lib/i18n";
import type { Category } from "../lib/types";
import HospitalCard from "../components/HospitalCard";
import { Search, ArrowUpDown } from "lucide-react";

const CATS: (Category | "all")[] = ["all", "plastic-surgery", "dermatology", "dentistry", "orthopedics", "checkup"];
const CAT_ICON: Record<Category, string> = { "plastic-surgery": "💉", dermatology: "✨", dentistry: "🦷", orthopedics: "🦴", checkup: "🩺" };

type SortKey = "default" | "price-asc" | "price-desc" | "rating-desc" | "reviews-desc" | "name-asc";
const SORT_I18N: Record<SortKey, string> = {
  default: "sort.default", "price-asc": "sort.priceAsc", "price-desc": "sort.priceDesc",
  "rating-desc": "sort.ratingDesc", "reviews-desc": "sort.reviewsDesc", "name-asc": "sort.nameAsc",
};

export default function Hospitals() {
  const { lang } = useApp();
  const [cat, setCat] = useState<Category | "all">("all");
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<SortKey>("default");

  const hospitals = db.hospitals.list();

  const filtered = useMemo(() => {
    let list = hospitals.filter((h) => {
      const byCat = cat === "all" || h.category === cat;
      const byQ = !q || h.name.toLowerCase().includes(q.toLowerCase()) || h.nameKo.includes(q) || h.district.toLowerCase().includes(q.toLowerCase());
      return byCat && byQ;
    });
    switch (sort) {
      case "price-asc": list = [...list].sort((a, b) => a.priceFrom - b.priceFrom); break;
      case "price-desc": list = [...list].sort((a, b) => b.priceFrom - a.priceFrom); break;
      case "rating-desc": list = [...list].sort((a, b) => b.rating - a.rating); break;
      case "reviews-desc": list = [...list].sort((a, b) => b.reviewCount - a.reviewCount); break;
      case "name-asc": list = [...list].sort((a, b) => a.name.localeCompare(b.name)); break;
    }
    return list;
  }, [hospitals, cat, q, sort]);

  return (
    <div className="max-w-6xl mx-auto px-5 py-10">
      <h1 className="text-3xl md:text-4xl font-bold text-slate-900">{t(lang, "hospitals.title")}</h1>
      <p className="mt-2 text-slate-600">{t(lang, "hospitals.sub")}</p>

      <div className="mt-6 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t(lang, "admin.search")}
            className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100" />
        </div>
        <div className="relative">
          <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
          <select value={sort} onChange={(e) => setSort(e.target.value as SortKey)}
            className="pl-9 pr-4 py-3 rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-sky-400 text-sm font-medium appearance-none cursor-pointer">
            {(Object.keys(SORT_I18N) as SortKey[]).map((k) => (
              <option key={k} value={k}>{t(lang, SORT_I18N[k])}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-5 flex gap-2 overflow-x-auto pb-2">
        {CATS.map((c) => {
          const active = c === cat;
          const label = c === "all" ? t(lang, "hospitals.all") : t(lang, `categories.${c}`);
          return (
            <button key={c} onClick={() => setCat(c)} className={
              "shrink-0 inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium transition " +
              (active ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-700 border-slate-200 hover:border-slate-300")
            }>
              {c !== "all" && <span>{CAT_ICON[c]}</span>}
              {label}
            </button>
          );
        })}
      </div>

      <div className="mt-4 text-sm text-slate-500">
        {filtered.length} {filtered.length === 1 ? t(lang, "hospitals.foundOne") : t(lang, "hospitals.found")}
      </div>

      <div className="mt-4 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((h) => <HospitalCard key={h.id} hospital={h} />)}
      </div>

      {filtered.length === 0 && <div className="mt-16 text-center text-slate-500">{t(lang, "hospitals.noMatch")}</div>}
    </div>
  );
}
