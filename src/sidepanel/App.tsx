import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  selectPhase,
  selectTodayRecord,
  useStore,
} from "../shared/store";
import { formatLocaleDate } from "../shared/date";
import i18n from "../shared/i18n";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { PlanningView } from "../components/PlanningView";
import { FocusView } from "../components/FocusView";
import { AllDoneView } from "../components/AllDoneView";
import { RolloverDialog } from "../components/RolloverDialog";
import { SettingsView } from "../components/SettingsView";
import { Toast } from "../components/Toast";

type Route = "today" | "settings";

export default function App() {
  const { t } = useTranslation();
  const [route, setRoute] = useState<Route>("today");
  const [toast, setToast] = useState<string | null>(null);

  const locale = useStore((s) => s.settings.locale);
  const phase = useStore(selectPhase);
  const day = useStore(selectTodayRecord);
  const needsRollover = useStore((s) => s.needsRolloverFrom);
  const hydrated = useStore((s) => s.hydrated);

  useEffect(() => {
    if (i18n.language !== locale) {
      i18n.changeLanguage(locale);
    }
    document.documentElement.lang = locale;
  }, [locale]);

  useEffect(() => {
    if (!toast) return;
    const id = window.setTimeout(() => setToast(null), 2000);
    return () => window.clearTimeout(id);
  }, [toast]);

  if (!hydrated) {
    return <div className="side-panel" />;
  }

  const dateLabel = formatLocaleDate(day.date, locale);
  const total = day.tasks.length;
  const done = day.tasks.filter((task) => task.completed).length;

  return (
    <div className="side-panel">
      <Header
        title={t("app.brand")}
        dateLabel={dateLabel}
        onSettings={() => setRoute(route === "settings" ? "today" : "settings")}
        onToggleLang={() => {
          const next = locale === "zh-TW" ? "en" : "zh-TW";
          useStore.getState().setLocale(next);
        }}
        settingsActive={route === "settings"}
        locale={locale}
      />

      <main className="sp-body">
        {route === "settings" ? (
          <SettingsView onSaved={() => setToast(t("settings.saved"))} />
        ) : phase === "planning" ? (
          <PlanningView />
        ) : phase === "focus" ? (
          <FocusView />
        ) : (
          <AllDoneView onPlanNext={() => useStore.getState().resetAll()} />
        )}
      </main>

      <Footer
        progressLabel={
          total === 0
            ? ""
            : t("focus.progressFooter", { done, total })
        }
      />

      {needsRollover && route !== "settings" && <RolloverDialog />}
      {toast && <Toast text={toast} />}
    </div>
  );
}
