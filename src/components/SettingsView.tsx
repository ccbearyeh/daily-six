import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useStore } from "../shared/store";
import type { Locale } from "../shared/types";

interface Props {
  onSaved: () => void;
}

export function SettingsView({ onSaved }: Props) {
  const { t } = useTranslation();
  const settings = useStore((s) => s.settings);
  const setLocale = useStore((s) => s.setLocale);
  const updateSettings = useStore((s) => s.updateSettings);
  const resetAll = useStore((s) => s.resetAll);
  const exportJSON = useStore((s) => s.exportJSON);

  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);
  const [resetInput, setResetInput] = useState("");

  function announce() {
    onSaved();
  }

  function handleLocale(next: Locale) {
    if (next === settings.locale) return;
    setLocale(next);
    announce();
  }

  function patchReminderMorning(patch: Partial<typeof settings.reminders.morningPlan>) {
    updateSettings({
      reminders: {
        ...settings.reminders,
        morningPlan: { ...settings.reminders.morningPlan, ...patch },
      },
    });
    announce();
  }

  function patchReminderEvening(patch: Partial<typeof settings.reminders.eveningReview>) {
    updateSettings({
      reminders: {
        ...settings.reminders,
        eveningReview: { ...settings.reminders.eveningReview, ...patch },
      },
    });
    announce();
  }

  function patchReminderStale(patch: Partial<typeof settings.reminders.staleFocus>) {
    updateSettings({
      reminders: {
        ...settings.reminders,
        staleFocus: { ...settings.reminders.staleFocus, ...patch },
      },
    });
    announce();
  }

  function patchRetention(days: number) {
    if (!Number.isFinite(days) || days < 1) return;
    updateSettings({ historyRetentionDays: Math.floor(days) });
    announce();
  }

  function handleExport() {
    const json = exportJSON();
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `daily-six-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  async function handleReset() {
    if (resetInput !== "DELETE") return;
    await resetAll();
    setResetConfirmOpen(false);
    setResetInput("");
    announce();
  }

  return (
    <div>
      <section className="settings-group">
        <h2>{t("settings.language")}</h2>
        <p className="settings-row-desc">{t("settings.languageDesc")}</p>
        <div className="lang-options">
          <button
            type="button"
            className={`lang-option${settings.locale === "zh-TW" ? " is-active" : ""}`}
            onClick={() => handleLocale("zh-TW")}
          >
            中文
          </button>
          <button
            type="button"
            className={`lang-option${settings.locale === "en" ? " is-active" : ""}`}
            onClick={() => handleLocale("en")}
          >
            English
          </button>
        </div>
      </section>

      <section className="settings-group">
        <h2>{t("settings.reminders")}</h2>

        <div className="settings-row">
          <div className="settings-label">
            <div>{t("settings.morningPlan")}</div>
            <div className="settings-row-desc">{t("settings.morningPlanDesc")}</div>
          </div>
          <div className="settings-control">
            <input
              type="time"
              className="time-input"
              value={settings.reminders.morningPlan.time}
              onChange={(e) => patchReminderMorning({ time: e.target.value })}
              disabled={!settings.reminders.morningPlan.enabled}
            />
            <ToggleSwitch
              checked={settings.reminders.morningPlan.enabled}
              onChange={(v) => patchReminderMorning({ enabled: v })}
            />
          </div>
        </div>

        <div className="settings-row">
          <div className="settings-label">
            <div>{t("settings.eveningReview")}</div>
            <div className="settings-row-desc">{t("settings.eveningReviewDesc")}</div>
          </div>
          <div className="settings-control">
            <input
              type="time"
              className="time-input"
              value={settings.reminders.eveningReview.time}
              onChange={(e) => patchReminderEvening({ time: e.target.value })}
              disabled={!settings.reminders.eveningReview.enabled}
            />
            <ToggleSwitch
              checked={settings.reminders.eveningReview.enabled}
              onChange={(v) => patchReminderEvening({ enabled: v })}
            />
          </div>
        </div>

        <div className="settings-row">
          <div className="settings-label">
            <div>{t("settings.staleFocus")}</div>
            <div className="settings-row-desc">
              {t("settings.staleFocusDesc", {
                n: settings.reminders.staleFocus.thresholdMinutes,
              })}
            </div>
          </div>
          <div className="settings-control">
            <input
              type="number"
              className="number-input"
              min={15}
              max={240}
              step={5}
              value={settings.reminders.staleFocus.thresholdMinutes}
              onChange={(e) =>
                patchReminderStale({
                  thresholdMinutes: Math.max(15, Number(e.target.value) || 90),
                })
              }
              disabled={!settings.reminders.staleFocus.enabled}
            />
            <span className="settings-unit">{t("common.minutes")}</span>
            <ToggleSwitch
              checked={settings.reminders.staleFocus.enabled}
              onChange={(v) => patchReminderStale({ enabled: v })}
            />
          </div>
        </div>
      </section>

      <section className="settings-group">
        <h2>{t("settings.data")}</h2>

        <div className="settings-row">
          <div className="settings-label">
            <div>{t("settings.retention")}</div>
            <div className="settings-row-desc">{t("settings.retentionDesc")}</div>
          </div>
          <div className="settings-control">
            <input
              type="number"
              className="number-input"
              min={7}
              max={365}
              step={1}
              value={settings.historyRetentionDays}
              onChange={(e) => patchRetention(Number(e.target.value))}
            />
            <span className="settings-unit">{t("common.days")}</span>
          </div>
        </div>

        <div className="settings-row">
          <div className="settings-label">
            <div>{t("settings.export")}</div>
            <div className="settings-row-desc">{t("settings.exportDesc")}</div>
          </div>
          <div className="settings-control">
            <button type="button" className="btn btn-ghost" onClick={handleExport}>
              {t("settings.exportBtn")}
            </button>
          </div>
        </div>

        <div className="settings-row">
          <div className="settings-label">
            <div>{t("settings.reset")}</div>
            <div className="settings-row-desc">{t("settings.resetDesc")}</div>
          </div>
          <div className="settings-control">
            <button
              type="button"
              className="btn btn-danger-ghost"
              onClick={() => setResetConfirmOpen(true)}
            >
              {t("settings.resetBtn")}
            </button>
          </div>
        </div>

        {resetConfirmOpen && (
          <div className="reset-confirm">
            <div className="reset-confirm-title">{t("settings.resetConfirmTitle")}</div>
            <p>{t("settings.resetConfirmBody")}</p>
            <input
              type="text"
              className="task-input"
              value={resetInput}
              onChange={(e) => setResetInput(e.target.value)}
              placeholder="DELETE"
              autoFocus
            />
            <div className="dialog-actions">
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => {
                  setResetConfirmOpen(false);
                  setResetInput("");
                }}
              >
                {t("common.cancel")}
              </button>
              <button
                type="button"
                className="btn btn-danger-ghost"
                onClick={handleReset}
                disabled={resetInput !== "DELETE"}
              >
                {t("settings.resetConfirmCta")}
              </button>
            </div>
          </div>
        )}
      </section>

      <section className="settings-group">
        <h2>{t("settings.support")}</h2>

        <div className="settings-row">
          <div className="settings-label">
            <div>{t("settings.support")}</div>
            <div className="settings-row-desc">{t("settings.supportDesc")}</div>
          </div>
          <div className="settings-control">
            <a
              className="btn btn-ghost"
              href="https://buymeacoffee.com/shawnyeh"
              target="_blank"
              rel="noopener noreferrer"
            >
              {t("settings.supportBtn")}
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}

interface ToggleProps {
  checked: boolean;
  onChange: (next: boolean) => void;
}

function ToggleSwitch({ checked, onChange }: ToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      className={`toggle${checked ? " on" : ""}`}
      onClick={() => onChange(!checked)}
    />
  );
}
