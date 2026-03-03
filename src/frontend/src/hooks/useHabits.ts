import {
  type DayKey,
  type Habit,
  type WeekRecord,
  ensureCurrentWeekRecords,
  generateId,
  getISOWeekKey,
  initializeStorage,
  loadHabits,
  loadWeekRecords,
  saveHabits,
  saveWeekRecords,
} from "@/lib/habitStorage";
import { useCallback, useEffect, useState } from "react";

export function useHabits() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [weekRecords, setWeekRecords] = useState<WeekRecord[]>([]);
  const [currentWeekKey] = useState(() => getISOWeekKey(new Date()));
  const [isReady, setIsReady] = useState(false);

  // Initialize on mount
  useEffect(() => {
    const { habits: h, weekRecords: wr } = initializeStorage();
    setHabits(h);
    setWeekRecords(wr);
    setIsReady(true);
  }, []);

  // Re-check week rollover whenever tab regains focus
  useEffect(() => {
    const handleFocus = () => {
      const current = getISOWeekKey(new Date());
      const currentHabits = loadHabits();
      const currentRecords = loadWeekRecords();
      const updated = ensureCurrentWeekRecords(
        currentHabits,
        currentRecords,
        current,
      );
      setHabits(currentHabits);
      setWeekRecords(updated);
    };
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, []);

  const addHabit = useCallback(
    (name: string) => {
      const trimmed = name.trim();
      if (!trimmed) return;

      const newHabit: Habit = {
        id: generateId(),
        name: trimmed,
        createdAt: new Date().toISOString(),
      };

      const newRecord: WeekRecord = {
        weekKey: currentWeekKey,
        habitId: newHabit.id,
        completions: {
          mon: false,
          tue: false,
          wed: false,
          thu: false,
          fri: false,
          sat: false,
          sun: false,
        },
      };

      setHabits((prev) => {
        const updated = [...prev, newHabit];
        saveHabits(updated);
        return updated;
      });
      setWeekRecords((prev) => {
        const updated = [...prev, newRecord];
        saveWeekRecords(updated);
        return updated;
      });
    },
    [currentWeekKey],
  );

  const deleteHabit = useCallback((habitId: string) => {
    setHabits((prev) => {
      const updated = prev.filter((h) => h.id !== habitId);
      saveHabits(updated);
      return updated;
    });
    setWeekRecords((prev) => {
      const updated = prev.filter((r) => r.habitId !== habitId);
      saveWeekRecords(updated);
      return updated;
    });
  }, []);

  const toggleDay = useCallback(
    (habitId: string, weekKey: string, dayKey: DayKey) => {
      setWeekRecords((prev) => {
        const idx = prev.findIndex(
          (r) => r.habitId === habitId && r.weekKey === weekKey,
        );
        if (idx === -1) return prev;

        const updated = [...prev];
        updated[idx] = {
          ...updated[idx],
          completions: {
            ...updated[idx].completions,
            [dayKey]: !updated[idx].completions[dayKey],
          },
        };
        saveWeekRecords(updated);
        return updated;
      });
    },
    [],
  );

  const getWeekRecord = useCallback(
    (habitId: string, weekKey: string): WeekRecord | undefined => {
      return weekRecords.find(
        (r) => r.habitId === habitId && r.weekKey === weekKey,
      );
    },
    [weekRecords],
  );

  return {
    habits,
    weekRecords,
    currentWeekKey,
    isReady,
    addHabit,
    deleteHabit,
    toggleDay,
    getWeekRecord,
  };
}
