import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  selectActiveTask,
  selectTodayRecord,
  useStore,
} from "../shared/store";
import { formatClock } from "../shared/date";
import type { Task } from "../shared/types";

export function FocusView() {
  const { t } = useTranslation();
  const day = useStore(selectTodayRecord);
  const active = useStore(selectActiveTask);
  const completeTask = useStore((s) => s.completeTask);
  const uncompleteTask = useStore((s) => s.uncompleteTask);

  const sorted = [...day.tasks].sort((a, b) => a.order - b.order);
  const completed = sorted.filter((task) => task.completed);
  const upcoming = sorted.filter((task) => !task.completed && task.id !== active?.id);
  const activeIndex = active ? sorted.findIndex((task) => task.id === active.id) : -1;

  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 60_000);
    return () => window.clearInterval(id);
  }, []);

  if (!active) return null;

  const elapsed = day.startedAt ? now - day.startedAt : 0;

  return (
    <div>
      <p className="focus-prompt">{t("focus.prompt", { n: activeIndex + 1 })}</p>

      <div className="active-task">
        <div className="active-task-header">
          <span className="active-task-number">{activeIndex + 1}</span>
          <span className="active-task-timer">
            {t("focus.focusedFor", { duration: formatClock(elapsed) })}
          </span>
        </div>
        <div className="active-task-text">{active.text}</div>
        <button
          type="button"
          className="active-task-cta"
          onClick={() => completeTask(active.id)}
        >
          ✓ {t("focus.complete")}
        </button>
      </div>

      {upcoming.length > 0 && (
        <ul className="locked-list">
          {upcoming.map((task) => {
            const n = sorted.findIndex((other) => other.id === task.id) + 1;
            return (
              <li key={task.id} className="locked-task" title={t("focus.lockedHint", { n: activeIndex + 1 })}>
                <span className="task-number">{n}</span>
                <span className="locked-task-text">{task.text}</span>
                <span className="locked-task-icon" aria-hidden="true">🔒</span>
              </li>
            );
          })}
        </ul>
      )}

      {completed.length > 0 && (
        <CompletedFold
          completed={completed}
          onUndoLast={() => {
            const last = completed[completed.length - 1];
            if (last) uncompleteTask(last.id);
          }}
        />
      )}
    </div>
  );
}

interface CompletedFoldProps {
  completed: Task[];
  onUndoLast: () => void;
}

function CompletedFold({ completed, onUndoLast }: CompletedFoldProps) {
  const { t } = useTranslation();
  return (
    <details className="completed-fold" open>
      <summary>
        <span>{t("focus.completed", { n: completed.length })}</span>
        <span className="completed-fold-actions">
          <button
            type="button"
            className="undo-btn"
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              onUndoLast();
            }}
          >
            {t("focus.undoLast")}
          </button>
        </span>
      </summary>
      <ul className="completed-list">
        {completed.map((task) => (
          <li key={task.id} className="completed-task">
            <span className="check-mark">✓</span>
            <span className="completed-task-text">{task.text}</span>
            <span className="completed-task-time">{formatTime(task.completedAt)}</span>
          </li>
        ))}
      </ul>
    </details>
  );
}

function formatTime(ms: number | null): string {
  if (!ms) return "";
  const d = new Date(ms);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}
