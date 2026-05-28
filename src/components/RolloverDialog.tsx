import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useStore } from "../shared/store";

export function RolloverDialog() {
  const { t } = useTranslation();
  const sourceDate = useStore((s) => s.needsRolloverFrom);
  const sourceDay = useStore((s) =>
    s.needsRolloverFrom ? s.days[s.needsRolloverFrom] : null,
  );
  const applyRollover = useStore((s) => s.applyRollover);
  const dismissRolloverDay = useStore((s) => s.dismissRolloverDay);

  const unfinished = useMemo(() => {
    if (!sourceDay) return [];
    return [...sourceDay.tasks]
      .filter((task) => !task.completed)
      .sort((a, b) => a.order - b.order);
  }, [sourceDay]);

  const [checked, setChecked] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(unfinished.map((task) => [task.id, true])),
  );

  if (!sourceDate || unfinished.length === 0) return null;

  const selectedCount = Object.values(checked).filter(Boolean).length;

  function toggle(id: string) {
    setChecked((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  function handleMove() {
    const decisions = unfinished.map((task) => ({
      taskId: task.id,
      carry: !!checked[task.id],
    }));
    applyRollover(decisions);
  }

  function handleDiscard() {
    dismissRolloverDay();
  }

  return (
    <div className="dialog-backdrop" role="dialog" aria-modal="true">
      <div className="dialog">
        <h2>{t("rollover.title", { n: unfinished.length })}</h2>
        <p>{t("rollover.body")}</p>
        <ul className="dialog-list">
          {unfinished.map((task) => (
            <li key={task.id} className="dialog-item">
              <label className="dialog-checkbox">
                <input
                  type="checkbox"
                  checked={!!checked[task.id]}
                  onChange={() => toggle(task.id)}
                />
                <span className="dialog-task">{task.text}</span>
              </label>
              <span className="dialog-source-tag">{sourceDate}</span>
            </li>
          ))}
        </ul>
        <div className="dialog-actions">
          <button
            type="button"
            className="btn btn-ghost"
            onClick={handleDiscard}
          >
            {t("rollover.discardAll")}
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleMove}
            disabled={selectedCount === 0}
          >
            {t("rollover.moveCta", { n: selectedCount })}
          </button>
        </div>
      </div>
    </div>
  );
}
