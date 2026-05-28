import { useTranslation } from "react-i18next";
import { selectTodayRecord, useStore } from "../shared/store";
import { formatClock } from "../shared/date";

interface Props {
  onPlanNext: () => void;
}

export function AllDoneView({ onPlanNext }: Props) {
  const { t } = useTranslation();
  const day = useStore(selectTodayRecord);
  const uncompleteTask = useStore((s) => s.uncompleteTask);
  const sorted = [...day.tasks].sort((a, b) => a.order - b.order);
  const total = sorted.length;

  const durationLabel =
    day.startedAt && day.completedAt
      ? formatClock(day.completedAt - day.startedAt)
      : "";

  return (
    <div>
      <div className="all-done">
        <div className="all-done-title">{t("focus.allDoneTitle")}</div>
        <div className="all-done-sub">
          {t("focus.allDoneSub", { n: total })}
          {durationLabel && (
            <>
              <br />
              <span style={{ opacity: 0.7 }}>{durationLabel}</span>
            </>
          )}
        </div>
        <button type="button" className="btn btn-primary" onClick={onPlanNext}>
          {t("focus.planNext")}
        </button>
      </div>

      <details className="completed-fold" open>
        <summary>
          <span>{t("focus.completed", { n: total })}</span>
          <span className="completed-fold-actions">
            <button
              type="button"
              className="undo-btn"
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                const last = sorted[sorted.length - 1];
                if (last) uncompleteTask(last.id);
              }}
            >
              {t("focus.undoLast")}
            </button>
          </span>
        </summary>
        <ul className="completed-list">
          {sorted.map((task) => (
            <li key={task.id} className="completed-task">
              <span className="check-mark">✓</span>
              <span className="completed-task-text">{task.text}</span>
              <span className="completed-task-time">{formatTime(task.completedAt)}</span>
            </li>
          ))}
        </ul>
      </details>
    </div>
  );
}

function formatTime(ms: number | null): string {
  if (!ms) return "";
  const d = new Date(ms);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}
