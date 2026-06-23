import { useMemo, useState } from "react";
import { useApp, db } from "../context/AppContext";
import { t } from "../lib/i18n";
import type { Hospital, Category } from "../lib/types";
import { Pencil, Save, X, Plus, Building2 } from "lucide-react";

export default function HospitalManagerPanel() {
  const { lang, user, refresh } = useApp();
  const [tick, setTick] = useState(0);
  const bump = () => { refresh(); setTick((n) => n + 1); };

  const managedHospitals = useMemo(() => {
    void tick;
    if (!user || !user.managedHospitalIds?.length) return [];
    const all = db.hospitals.list();
    return all.filter((h) => user.managedHospitalIds!.includes(h.id));
  }, [user, tick]);

  const [editing, setEditing] = useState<Hospital | null>(null);

  if (!user || !user.managedHospitalIds?.length) {
    return (
      <div className="max-w-4xl mx-auto px-5 py-20 text-center">
        <div className="text-5xl">🏥</div>
        <h1 className="mt-4 text-2xl font-bold text-slate-900">{t(lang, "manager.title")}</h1>
        <p className="mt-2 text-slate-500">{t(lang, "manager.noHospitals")}</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-5 py-10">
      <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-sky-700 bg-sky-100 px-2.5 py-1 rounded-full">
        <Building2 className="h-3.5 w-3.5" /> {t(lang, "manager.badge")}
      </div>
      <h1 className="mt-2 text-3xl font-bold text-slate-900">{t(lang, "manager.title")}</h1>
      <p className="mt-1 text-slate-500">{t(lang, "manager.desc")}</p>

      <div className="mt-6 space-y-4">
        {managedHospitals.map((h) => (
          <div key={h.id} className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col md:flex-row md:items-center gap-4">
            <img src={h.image} alt="" className="h-16 w-24 rounded-lg object-cover bg-slate-100 shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="font-bold text-slate-900">{h.name} <span className="text-sm text-slate-500">({h.nameKo})</span></div>
              <div className="text-xs text-slate-500">{t(lang, `categories.${h.category}`)} · {h.district} · {h.treatments.length} {t(lang, "admin.hospital.treatmentCount")} · {h.doctors.length} {t(lang, "admin.hospital.doctorCount")}</div>
            </div>
            <button onClick={() => setEditing(h)} className="px-4 py-2 rounded-lg border border-slate-200 text-sm font-semibold hover:bg-slate-50 inline-flex items-center gap-1.5 shrink-0">
              <Pencil className="h-4 w-4" /> {t(lang, "admin.btn.edit")}
            </button>
          </div>
        ))}
      </div>

      {editing && <EditModal hospital={editing} onClose={() => setEditing(null)} bump={bump} lang={lang} />}
    </div>
  );
}

const CATS: Category[] = ["plastic-surgery", "dermatology", "dentistry", "orthopedics", "checkup"];

function EditModal({ hospital, onClose, bump, lang }: { hospital: Hospital; onClose: () => void; bump: () => void; lang: "en" | "ko" }) {
  const [f, setF] = useState<Hospital>({ ...hospital });
  const [langInput, setLangInput] = useState("");
  const [certInput, setCertInput] = useState("");
  const save = () => { if (!f.name) return; db.hospitals.save(f); bump(); onClose(); };
  const upd = (p: Partial<Hospital>) => setF((prev) => ({ ...prev, ...p }));

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-16 bg-black/40" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 sticky top-0 bg-white rounded-t-2xl z-10">
          <h2 className="font-bold text-slate-900">{t(lang, "manager.editTitle")}: {hospital.name}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700"><X className="h-5 w-5" /></button>
        </div>
        <div className="p-6 space-y-5">
          <div className="grid sm:grid-cols-2 gap-4">
            <Inp label={t(lang, "admin.hospital.nameEn")} value={f.name} onChange={(v) => upd({ name: v })} />
            <Inp label={t(lang, "admin.hospital.nameKo")} value={f.nameKo} onChange={(v) => upd({ nameKo: v })} />
            <div><label className="block text-xs font-semibold uppercase text-slate-500 mb-1">{t(lang, "admin.hospital.category")}</label><select value={f.category} onChange={(e) => upd({ category: e.target.value as Category })} className="w-full px-3 py-2 rounded-lg border border-slate-200">{CATS.map((c) => <option key={c} value={c}>{t(lang, `categories.${c}`)}</option>)}</select></div>
            <Inp label={t(lang, "admin.hospital.district")} value={f.district} onChange={(v) => upd({ district: v })} />
            <Inp label={t(lang, "admin.hospital.city")} value={f.city} onChange={(v) => upd({ city: v })} />
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
          <div className="flex justify-end gap-2 pt-4 border-t">
            <button onClick={onClose} className="px-4 py-2 rounded-lg border border-slate-200 text-sm font-semibold hover:bg-slate-50">{t(lang, "admin.btn.cancel")}</button>
            <button onClick={save} className="px-4 py-2 rounded-lg bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 inline-flex items-center gap-1.5"><Save className="h-4 w-4" /> {t(lang, "admin.btn.save")}</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Inp({ label, value, onChange, type, placeholder }: {
  label: string; value: string | number; onChange: (v: string) => void; type?: string; placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold uppercase text-slate-500 mb-1">{label}</label>
      <input type={type ?? "text"} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100" />
    </div>
  );
}
