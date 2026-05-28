import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  DndContext,
  PointerSensor,
  KeyboardSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { MAX_TASKS, selectTodayRecord, useStore } from "../shared/store";
import type { Task } from "../shared/types";

export function PlanningView() {
  const { t } = useTranslation();
  const day = useStore(selectTodayRecord);
  const addTask = useStore((s) => s.addTask);
  const updateTaskText = useStore((s) => s.updateTaskText);
  const removeTask = useStore((s) => s.removeTask);
  const reorderTasks = useStore((s) => s.reorderTasks);
  const lockAndStart = useStore((s) => s.lockAndStart);

  const tasks = [...day.tasks].sort((a, b) => a.order - b.order);
  const filled = tasks.length;
  const canAdd = filled < MAX_TASKS;
  const [draft, setDraft] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = tasks.findIndex((task) => task.id === active.id);
    const newIndex = tasks.findIndex((task) => task.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;
    const reordered = arrayMove(tasks, oldIndex, newIndex).map((task) => task.id);
    reorderTasks(reordered);
  }

  function handleSubmitDraft() {
    const value = draft.trim();
    if (!value) return;
    addTask(value);
    setDraft("");
    requestAnimationFrame(() => inputRef.current?.focus());
  }

  return (
    <div>
      <p className="planning-prompt">{t("planning.prompt")}</p>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={tasks.map((task) => task.id)} strategy={verticalListSortingStrategy}>
          <ul className="task-list">
            {tasks.map((task, idx) => (
              <SortableTaskRow
                key={task.id}
                task={task}
                index={idx}
                placeholder={t("planning.placeholder", { n: idx + 1 })}
                onChange={(text) => updateTaskText(task.id, text)}
                onRemove={() => removeTask(task.id)}
              />
            ))}
          </ul>
        </SortableContext>
      </DndContext>

      {canAdd && (
        <div className="task-input-row is-empty">
          <span className="task-drag-handle" aria-hidden="true">·</span>
          <span className="task-number">{filled + 1}</span>
          <input
            ref={inputRef}
            className="task-input"
            value={draft}
            placeholder={
              filled === 0 ? t("planning.empty") : t("planning.placeholder", { n: filled + 1 })
            }
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                handleSubmitDraft();
              }
            }}
            onBlur={handleSubmitDraft}
            maxLength={120}
          />
        </div>
      )}

      <p className="planning-hint">
        {canAdd
          ? t("planning.filledOf", { filled, total: MAX_TASKS })
          : t("planning.max")}
      </p>

      <div style={{ marginTop: 18 }}>
        <button
          type="button"
          className="btn btn-primary"
          onClick={lockAndStart}
          disabled={filled === 0}
          style={{ width: "100%" }}
        >
          {t("planning.lockCta")}
        </button>
      </div>
    </div>
  );
}

interface SortableRowProps {
  task: Task;
  index: number;
  placeholder: string;
  onChange: (text: string) => void;
  onRemove: () => void;
}

function SortableTaskRow({ task, index, placeholder, onChange, onRemove }: SortableRowProps) {
  const { t } = useTranslation();
  const sortable = useSortable({ id: task.id });
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = sortable;

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  const className = ["task-input-row", isDragging ? "is-dragging" : ""].join(" ");

  const [local, setLocal] = useState(task.text);
  useEffect(() => setLocal(task.text), [task.text]);

  return (
    <li ref={setNodeRef} style={style} className={className}>
      <button
        type="button"
        className="task-drag-handle"
        aria-label="Drag to reorder"
        {...attributes}
        {...listeners}
      >
        ⋮⋮
      </button>
      <span className="task-number">{index + 1}</span>
      <input
        className="task-input"
        value={local}
        placeholder={placeholder}
        onChange={(event) => setLocal(event.target.value)}
        onBlur={() => {
          if (local !== task.text) onChange(local);
        }}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            (event.target as HTMLInputElement).blur();
          }
        }}
        maxLength={120}
      />
      {task.carriedFrom && <span className="carried-tag">↻</span>}
      <button
        type="button"
        className="task-row-remove"
        onClick={onRemove}
        aria-label={t("planning.remove")}
        title={t("planning.remove")}
      >
        ✕
      </button>
    </li>
  );
}
