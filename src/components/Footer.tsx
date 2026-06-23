import { useApp } from "../context/AppContext";
import { t } from "../lib/i18n";

export default function Footer() {
  const { lang } = useApp();
  return (
    <footer className="border-t border-slate-200 mt-16">
      <div className="max-w-6xl mx-auto px-5 py-8 flex flex-col md:flex-row items-center justify-between gap-3 text-sm text-slate-500">
        <div>© {new Date().getFullYear()} {t(lang, "brand")}. {t(lang, "footer")}.</div>
        <div className="flex gap-4">
          <span>🇰🇷 Seoul, Korea</span>
          <span>contact@medikorea.demo</span>
        </div>
      </div>
    </footer>
  );
}
