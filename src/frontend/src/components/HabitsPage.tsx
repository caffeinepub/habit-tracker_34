import {
  DAY_KEYS,
  DAY_LABELS,
  type DayKey,
  type Habit,
  type WeekRecord,
} from "@/lib/habitStorage";
import { Check, Flame, Plus, Trash2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";

interface HabitsPageProps {
  habits: Habit[];
  currentWeekKey: string;
  onAddHabit: (name: string) => void;
  onDeleteHabit: (id: string) => void;
  onToggleDay: (habitId: string, weekKey: string, dayKey: DayKey) => void;
  getWeekRecord: (habitId: string, weekKey: string) => WeekRecord | undefined;
}

export default function HabitsPage({
  habits,
  currentWeekKey,
  onAddHabit,
  onDeleteHabit,
  onToggleDay,
  getWeekRecord,
}: HabitsPageProps) {
  const [showInput, setShowInput] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (showInput) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [showInput]);

  const handleAdd = () => {
    if (!inputValue.trim()) return;
    onAddHabit(inputValue.trim());
    setInputValue("");
    setShowInput(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleAdd();
    if (e.key === "Escape") {
      setShowInput(false);
      setInputValue("");
    }
  };

  const handleCancelAdd = () => {
    setShowInput(false);
    setInputValue("");
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 pt-6 pb-4">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <Flame
              className="w-5 h-5 text-teal-DEFAULT"
              style={{ color: "oklch(0.72 0.14 195)" }}
            />
            <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">
              Habits
            </h1>
          </div>
          <motion.button
            data-ocid="habits.add_button"
            onClick={() => setShowInput((v) => !v)}
            whileTap={{ scale: 0.9 }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors"
            style={{
              background: showInput
                ? "oklch(0.72 0.14 195 / 0.15)"
                : "oklch(0.72 0.14 195)",
              color: showInput
                ? "oklch(0.72 0.14 195)"
                : "oklch(0.10 0.01 240)",
              border: showInput
                ? "1px solid oklch(0.72 0.14 195 / 0.4)"
                : "none",
            }}
            aria-label="Add habit"
          >
            <Plus className="w-4 h-4" />
            <span>Add</span>
          </motion.button>
        </div>
        <p
          className="text-xs font-sans"
          style={{ color: "oklch(0.58 0.010 240)" }}
        >
          Track your daily progress
        </p>
      </div>

      {/* Day column headers */}
      <div
        className="px-4 pb-2 flex items-center"
        style={{ borderBottom: "1px solid oklch(0.26 0.010 240)" }}
      >
        {/* Spacer for habit name */}
        <div className="flex-1 min-w-0" />
        {/* Day labels */}
        <div className="flex gap-1 shrink-0">
          {DAY_KEYS.map((day) => (
            <div
              key={day}
              className="w-8 text-center text-xs font-medium font-display"
              style={{ color: "oklch(0.58 0.010 240)" }}
            >
              {DAY_LABELS[day]}
            </div>
          ))}
          {/* Space for delete icon */}
          <div className="w-7" />
        </div>
      </div>

      {/* Add habit inline input */}
      <AnimatePresence>
        {showInput && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <div
              className="px-4 py-3 flex items-center gap-2"
              style={{
                background: "oklch(0.15 0.008 240)",
                borderBottom: "1px solid oklch(0.26 0.010 240)",
              }}
            >
              <input
                ref={inputRef}
                data-ocid="habits.add_input"
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="New habit name..."
                className="flex-1 bg-transparent text-sm font-sans text-foreground placeholder:text-muted-foreground outline-none"
                maxLength={60}
              />
              <motion.button
                data-ocid="habits.add_submit_button"
                onClick={handleAdd}
                whileTap={{ scale: 0.9 }}
                disabled={!inputValue.trim()}
                className="px-3 py-1 rounded-md text-xs font-medium transition-opacity disabled:opacity-40"
                style={{
                  background: "oklch(0.72 0.14 195)",
                  color: "oklch(0.10 0.01 240)",
                }}
              >
                Add
              </motion.button>
              <button
                type="button"
                onClick={handleCancelAdd}
                className="px-2 py-1 rounded-md text-xs font-medium transition-colors hover:bg-muted"
                style={{ color: "oklch(0.58 0.010 240)" }}
              >
                Cancel
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Habit list */}
      <div className="flex-1 overflow-y-auto pb-4">
        <AnimatePresence initial={false}>
          {habits.length === 0 ? (
            <motion.div
              data-ocid="habits.empty_state"
              key="empty"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="flex flex-col items-center justify-center py-20 px-8 text-center"
            >
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
                style={{ background: "oklch(0.72 0.14 195 / 0.10)" }}
              >
                <Flame
                  className="w-8 h-8"
                  style={{ color: "oklch(0.72 0.14 195 / 0.6)" }}
                />
              </div>
              <p className="font-display text-lg font-semibold text-foreground mb-2">
                No habits yet
              </p>
              <p
                className="text-sm font-sans"
                style={{ color: "oklch(0.58 0.010 240)" }}
              >
                Tap{" "}
                <span
                  className="font-medium"
                  style={{ color: "oklch(0.72 0.14 195)" }}
                >
                  + Add
                </span>{" "}
                to create your first habit and start tracking.
              </p>
            </motion.div>
          ) : (
            habits.map((habit, index) => (
              <HabitRow
                key={habit.id}
                habit={habit}
                index={index}
                weekRecord={getWeekRecord(habit.id, currentWeekKey)}
                currentWeekKey={currentWeekKey}
                onToggleDay={onToggleDay}
                onDelete={onDeleteHabit}
              />
            ))
          )}
        </AnimatePresence>
      </div>

      {/* Week indicator + Footer */}
      <div
        className="px-4 py-2 flex items-center justify-between"
        style={{ borderTop: "1px solid oklch(0.26 0.010 240)" }}
      >
        <span
          className="text-xs font-sans"
          style={{ color: "oklch(0.40 0.008 240)" }}
        >
          {habits.length > 0 ? `Week ${currentWeekKey}` : ""}
        </span>
        <a
          href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-sans transition-opacity hover:opacity-80"
          style={{ color: "oklch(0.40 0.008 240)" }}
        >
          Built with caffeine.ai
        </a>
      </div>
    </div>
  );
}

// ─── Habit Row ───────────────────────────────────────────────────────────────────

interface HabitRowProps {
  habit: Habit;
  index: number;
  weekRecord: WeekRecord | undefined;
  currentWeekKey: string;
  onToggleDay: (habitId: string, weekKey: string, dayKey: DayKey) => void;
  onDelete: (id: string) => void;
}

function HabitRow({
  habit,
  index,
  weekRecord,
  currentWeekKey,
  onToggleDay,
  onDelete,
}: HabitRowProps) {
  const completions = weekRecord?.completions ?? {
    mon: false,
    tue: false,
    wed: false,
    thu: false,
    fri: false,
    sat: false,
    sun: false,
  };

  const completedCount = DAY_KEYS.filter((d) => completions[d]).length;
  const allDone = completedCount === 7;

  // Current day highlighting
  const todayDayKey = (() => {
    const day = new Date().getDay();
    const map: Record<number, DayKey> = {
      0: "sun",
      1: "mon",
      2: "tue",
      3: "wed",
      4: "thu",
      5: "fri",
      6: "sat",
    };
    return map[day];
  })();

  return (
    <motion.div
      data-ocid={`habits.item.${index + 1}`}
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -12, height: 0 }}
      transition={{ duration: 0.2, delay: index * 0.04 }}
      className="px-4 py-3 flex items-center group"
      style={{
        borderBottom: "1px solid oklch(0.26 0.010 240 / 0.5)",
      }}
    >
      {/* Habit Name */}
      <div className="flex-1 min-w-0 mr-2">
        <div className="flex items-center gap-2">
          <span
            className="text-sm font-sans font-medium truncate block"
            style={{
              color: allDone ? "oklch(0.72 0.14 195)" : "oklch(0.92 0.008 240)",
            }}
          >
            {habit.name}
          </span>
          {completedCount > 0 && (
            <span
              className="text-xs font-sans shrink-0"
              style={{ color: "oklch(0.72 0.14 195 / 0.8)" }}
            >
              {completedCount}/7
            </span>
          )}
        </div>
      </div>

      {/* Day boxes */}
      <div className="flex gap-1 shrink-0">
        {DAY_KEYS.map((day, dayIdx) => {
          const isDone = completions[day];
          const isToday = day === todayDayKey;
          const flatIndex = index * 7 + dayIdx + 1;

          return (
            <DayBox
              key={day}
              ocid={`habits.day_checkbox.${flatIndex}`}
              isDone={isDone}
              isToday={isToday}
              dayLabel={DAY_LABELS[day]}
              onToggle={() => onToggleDay(habit.id, currentWeekKey, day)}
            />
          );
        })}
      </div>

      {/* Delete button */}
      <motion.button
        data-ocid={`habits.delete_button.${index + 1}`}
        onClick={() => onDelete(habit.id)}
        whileTap={{ scale: 0.85 }}
        className="ml-1 w-7 h-7 flex items-center justify-center rounded-md opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
        style={{
          color: "oklch(0.62 0.22 25 / 0.7)",
        }}
        aria-label={`Delete ${habit.name}`}
      >
        <Trash2 className="w-3.5 h-3.5" />
      </motion.button>
    </motion.div>
  );
}

// ─── Day Box ─────────────────────────────────────────────────────────────────────

interface DayBoxProps {
  ocid: string;
  isDone: boolean;
  isToday: boolean;
  dayLabel: string;
  onToggle: () => void;
}

function DayBox({ ocid, isDone, isToday, onToggle }: DayBoxProps) {
  return (
    <motion.button
      data-ocid={ocid}
      onClick={onToggle}
      whileTap={{ scale: 0.85 }}
      className="w-8 h-8 rounded-md flex items-center justify-center transition-colors relative shrink-0"
      style={{
        background: isDone
          ? "oklch(0.72 0.14 195 / 0.20)"
          : isToday
            ? "oklch(0.20 0.010 240)"
            : "oklch(0.18 0.007 240)",
        border: isDone
          ? "1px solid oklch(0.72 0.14 195 / 0.55)"
          : isToday
            ? "1px solid oklch(0.72 0.14 195 / 0.30)"
            : "1px solid oklch(0.26 0.010 240)",
        boxShadow: isDone ? "0 0 8px oklch(0.72 0.14 195 / 0.25)" : "none",
      }}
      aria-label={isDone ? "Mark incomplete" : "Mark complete"}
      aria-pressed={isDone}
    >
      <AnimatePresence mode="wait">
        {isDone ? (
          <motion.div
            key="check"
            initial={{ scale: 0.4, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.4, opacity: 0 }}
            transition={{ duration: 0.15, ease: "backOut" }}
          >
            <Check
              className="w-3.5 h-3.5"
              style={{ color: "oklch(0.72 0.14 195)" }}
              strokeWidth={2.5}
            />
          </motion.div>
        ) : isToday ? (
          <motion.div
            key="dot"
            className="w-1 h-1 rounded-full"
            style={{ background: "oklch(0.72 0.14 195 / 0.5)" }}
          />
        ) : null}
      </AnimatePresence>
    </motion.button>
  );
}
