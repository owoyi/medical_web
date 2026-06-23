import { Link } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { t } from "../lib/i18n";

export default function Landing() {
  const { lang } = useApp();

  const steps = [
    { n: "01", k: "s1", icon: "🏥" },
    { n: "02", k: "s2", icon: "📅" },
    { n: "03", k: "s3", icon: "🧳" },
    { n: "04", k: "s4", icon: "✈️" },
  ];

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <img
            src="https://images.pexels.com/photos/32211612/pexels-photo-32211612.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=800&w=1600"
            alt="Seoul"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-white via-white/90 to-white/40" />
        </div>

        <div className="max-w-6xl mx-auto px-5 py-20 md:py-28">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-sky-100 text-sky-700 px-3 py-1 text-xs font-semibold tracking-wide">
              🇰🇷 Korea · Medical Tourism Platform
            </div>
            <h1 className="mt-5 text-4xl md:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.1]">
              {t(lang, "hero.title")}{" "}
              <span className="bg-gradient-to-r from-sky-500 to-indigo-600 bg-clip-text text-transparent">
                {t(lang, "hero.titleAccent")}
              </span>
            </h1>
            <p className="mt-5 text-lg text-slate-600 max-w-xl">
              {t(lang, "hero.subtitle")}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/hospitals"
                className="inline-flex items-center rounded-xl bg-slate-900 text-white px-5 py-3 text-sm font-semibold hover:bg-slate-800 transition"
              >
                {t(lang, "hero.cta")} →
              </Link>
              <a
                href="#how"
                className="inline-flex items-center rounded-xl bg-white border border-slate-200 text-slate-700 px-5 py-3 text-sm font-semibold hover:bg-slate-50 transition"
              >
                {t(lang, "hero.cta2")}
              </a>
            </div>

            <div className="mt-10 flex flex-wrap gap-6 text-sm text-slate-600">
              <Stat n="120+" l={t(lang, "stat.partners")} />
              <Stat n="50+" l={t(lang, "stat.interpreters")} />
              <Stat n="15K+" l={t(lang, "stat.patients")} />
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="max-w-6xl mx-auto px-5 py-20">
        <h2 className="text-3xl font-bold text-slate-900">{t(lang, "how.title")}</h2>
        <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {steps.map((s) => (
            <div
              key={s.n}
              className="bg-white border border-slate-200 rounded-2xl p-6 hover:shadow-md transition"
            >
              <div className="text-3xl">{s.icon}</div>
              <div className="mt-4 text-xs font-bold text-sky-600">STEP {s.n}</div>
              <h3 className="mt-1 font-bold text-slate-900">
                {t(lang, `how.${s.k}t`)}
              </h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                {t(lang, `how.${s.k}d`)}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Categories CTA */}
      <section className="bg-slate-50 border-y border-slate-200">
        <div className="max-w-6xl mx-auto px-5 py-16">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
            <div>
              <h2 className="text-3xl font-bold text-slate-900">
                {t(lang, "hospitals.title")}
              </h2>
              <p className="mt-2 text-slate-600">{t(lang, "hospitals.sub")}</p>
            </div>
            <Link
              to="/hospitals"
              className="inline-flex items-center rounded-xl bg-slate-900 text-white px-5 py-3 text-sm font-semibold hover:bg-slate-800 transition self-start"
            >
              {t(lang, "hero.cta")} →
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function Stat({ n, l }: { n: string; l: string }) {
  return (
    <div>
      <div className="text-2xl font-bold text-slate-900">{n}</div>
      <div className="text-xs uppercase tracking-wide text-slate-500">{l}</div>
    </div>
  );
}
