import type { Locale } from "../shared/types";

interface HeaderProps {
  title: string;
  dateLabel: string;
  onSettings: () => void;
  onToggleLang: () => void;
  settingsActive: boolean;
  locale: Locale;
}

export function Header(props: HeaderProps) {
  const langLabel = props.locale === "zh-TW" ? "中" : "EN";
  return (
    <header className="sp-header">
      <div className="sp-brand">
        <span className="sp-brand-mark">6</span>
        <span>{props.title}</span>
        <span className="sp-date">{props.dateLabel}</span>
      </div>
      <div className="sp-header-actions">
        <button
          type="button"
          className="sp-lang-toggle"
          onClick={props.onToggleLang}
          title={props.locale === "zh-TW" ? "Switch to English" : "切換成中文"}
        >
          {langLabel}
        </button>
        <button
          type="button"
          className="sp-icon-btn"
          onClick={props.onSettings}
          aria-pressed={props.settingsActive}
          aria-label="Settings"
        >
          {props.settingsActive ? "✕" : "⚙"}
        </button>
      </div>
    </header>
  );
}
