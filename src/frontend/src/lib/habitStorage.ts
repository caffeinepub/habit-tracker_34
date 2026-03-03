// ─── Data Model ────────────────────────────────────────────────────────────────

export type DayKey = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";

export const DAY_KEYS: DayKey[] = [
  "mon",
  "tue",
  "wed",
  "thu",
  "fri",
  "sat",
  "sun",
];
export const DAY_LABELS: Record<DayKey, string> = {
  mon: "M",
  tue: "T",
  wed: "W",
  thu: "T",
  fri: "F",
  sat: "S",
  sun: "S",
};
export const DAY_FULL: Record<DayKey, string> = {
  mon: "Monday",
  tue: "Tuesday",
  wed: "Wednesday",
  thu: "Thursday",
  fri: "Friday",
  sat: "Saturday",
  sun: "Sunday",
};

export type Habit = {
  id: string;
  name: string;
  createdAt: string; // ISO date
};

export type WeekRecord = {
  weekKey: string; // "YYYY-WW"
  habitId: string;
  completions: Record<DayKey, boolean>;
};

// ─── Storage Keys ───────────────────────────────────────────────────────────────

const HABITS_KEY = "ht_habits";
const WEEK_RECORDS_KEY = "ht_week_records";

// ─── ISO Week Key ───────────────────────────────────────────────────────────────

/**
 * Returns the ISO week key "YYYY-WW" for the given date.
 * ISO weeks start on Monday.
 */
export function getISOWeekKey(date: Date): string {
  const d = new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()),
  );
  // ISO week: Monday = 1
  const day = d.getUTCDay() || 7; // Convert Sunday (0) to 7
  d.setUTCDate(d.getUTCDate() + 4 - day); // Set to nearest Thursday
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNum = Math.ceil(
    ((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7,
  );
  const year = d.getUTCFullYear();
  return `${year}-${String(weekNum).padStart(2, "0")}`;
}

/**
 * Returns the DayKey for the given date (Monday = "mon", etc.)
 */
export function getDayKey(date: Date): DayKey {
  const day = date.getDay(); // 0=Sun,1=Mon,...,6=Sat
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
}

/**
 * Parse a "YYYY-WW" week key into the Monday Date of that week.
 */
export function weekKeyToDate(weekKey: string): Date {
  const [yearStr, weekStr] = weekKey.split("-");
  const year = Number.parseInt(yearStr, 10);
  const week = Number.parseInt(weekStr, 10);
  // Jan 4 is always in week 1
  const jan4 = new Date(Date.UTC(year, 0, 4));
  const jan4DayOfWeek = jan4.getUTCDay() || 7; // Mon=1..Sun=7
  const monday = new Date(jan4);
  monday.setUTCDate(jan4.getUTCDate() - jan4DayOfWeek + 1 + (week - 1) * 7);
  return monday;
}

/**
 * Returns a display label for a week key like "Dec 30"
 */
export function weekKeyToLabel(weekKey: string): string {
  const monday = weekKeyToDate(weekKey);
  return monday.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

// ─── UUID ───────────────────────────────────────────────────────────────────────

export function generateId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

// ─── Habit CRUD ─────────────────────────────────────────────────────────────────

export function loadHabits(): Habit[] {
  try {
    const raw = localStorage.getItem(HABITS_KEY);
    return raw ? (JSON.parse(raw) as Habit[]) : [];
  } catch {
    return [];
  }
}

export function saveHabits(habits: Habit[]): void {
  localStorage.setItem(HABITS_KEY, JSON.stringify(habits));
}

// ─── WeekRecord CRUD ─────────────────────────────────────────────────────────────

export function loadWeekRecords(): WeekRecord[] {
  try {
    const raw = localStorage.getItem(WEEK_RECORDS_KEY);
    return raw ? (JSON.parse(raw) as WeekRecord[]) : [];
  } catch {
    return [];
  }
}

export function saveWeekRecords(records: WeekRecord[]): void {
  localStorage.setItem(WEEK_RECORDS_KEY, JSON.stringify(records));
}

/** Get or create a WeekRecord for a habit in a specific week */
export function ensureWeekRecord(
  records: WeekRecord[],
  habitId: string,
  weekKey: string,
): WeekRecord {
  const existing = records.find(
    (r) => r.habitId === habitId && r.weekKey === weekKey,
  );
  if (existing) return existing;
  return {
    weekKey,
    habitId,
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
}

/** Ensure all habits have a WeekRecord for the current week */
export function ensureCurrentWeekRecords(
  habits: Habit[],
  records: WeekRecord[],
  currentWeekKey: string,
): WeekRecord[] {
  const updated = [...records];
  let changed = false;
  for (const habit of habits) {
    const exists = updated.some(
      (r) => r.habitId === habit.id && r.weekKey === currentWeekKey,
    );
    if (!exists) {
      updated.push(ensureWeekRecord([], habit.id, currentWeekKey));
      changed = true;
    }
  }
  if (changed) saveWeekRecords(updated);
  return updated;
}

// ─── Sample Data ─────────────────────────────────────────────────────────────────

const SAMPLE_HABITS: Pick<Habit, "name">[] = [
  { name: "Morning Exercise" },
  { name: "Read 30 mins" },
  { name: "Drink 8 glasses of water" },
];

/**
 * Initialize with sample habits if localStorage is empty.
 * Returns { habits, weekRecords } both loaded and persisted.
 */
export function initializeStorage(): {
  habits: Habit[];
  weekRecords: WeekRecord[];
} {
  const existingHabits = loadHabits();
  const existingRecords = loadWeekRecords();

  if (existingHabits.length > 0) {
    const currentWeekKey = getISOWeekKey(new Date());
    const weekRecords = ensureCurrentWeekRecords(
      existingHabits,
      existingRecords,
      currentWeekKey,
    );
    return { habits: existingHabits, weekRecords };
  }

  // First run — seed with sample habits
  const now = new Date().toISOString();
  const currentWeekKey = getISOWeekKey(new Date());

  const habits: Habit[] = SAMPLE_HABITS.map((h) => ({
    id: generateId(),
    name: h.name,
    createdAt: now,
  }));

  // Seed some sample completions to show a populated UI
  const weekRecords: WeekRecord[] = habits.map((habit) => {
    const completions: Record<DayKey, boolean> = {
      mon: false,
      tue: false,
      wed: false,
      thu: false,
      fri: false,
      sat: false,
      sun: false,
    };
    return { weekKey: currentWeekKey, habitId: habit.id, completions };
  });

  saveHabits(habits);
  saveWeekRecords(weekRecords);

  return { habits, weekRecords };
}

// ─── Stats Calculation ──────────────────────────────────────────────────────────

/**
 * Returns 0-100 percentage for a given day across all habits in the current week.
 */
export function calcDailyPercent(
  habits: Habit[],
  records: WeekRecord[],
  weekKey: string,
  dayKey: DayKey,
): number {
  if (habits.length === 0) return 0;
  const currentRecords = records.filter((r) => r.weekKey === weekKey);
  const completed = currentRecords.filter((r) => r.completions[dayKey]).length;
  return Math.round((completed / habits.length) * 100);
}

/**
 * Returns 0-100 percentage for the entire week.
 */
export function calcWeeklyPercent(
  habits: Habit[],
  records: WeekRecord[],
  weekKey: string,
): number {
  if (habits.length === 0) return 0;
  const total = habits.length * 7;
  const currentRecords = records.filter((r) => r.weekKey === weekKey);
  const completed = currentRecords.reduce((acc, r) => {
    return acc + DAY_KEYS.filter((d) => r.completions[d]).length;
  }, 0);
  return Math.round((completed / total) * 100);
}

/**
 * Returns 0-100 percentage for all weeks in the current calendar month.
 */
export function calcMonthlyPercent(
  habits: Habit[],
  records: WeekRecord[],
  year: number,
  month: number, // 0-indexed
): number {
  if (habits.length === 0) return 0;

  // Collect all day slots in this calendar month
  let totalSlots = 0;
  let completedSlots = 0;

  const daysInMonth = new Date(year, month + 1, 0).getDate();

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    const wk = getISOWeekKey(date);
    const dk = getDayKey(date);

    for (const habit of habits) {
      totalSlots++;
      const rec = records.find(
        (r) => r.habitId === habit.id && r.weekKey === wk,
      );
      if (rec?.completions[dk]) completedSlots++;
    }
  }

  if (totalSlots === 0) return 0;
  return Math.round((completedSlots / totalSlots) * 100);
}

/**
 * Returns last N week keys (including current), sorted oldest to newest.
 */
export function getLastNWeekKeys(n: number): string[] {
  const keys: string[] = [];
  const now = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i * 7);
    keys.push(getISOWeekKey(d));
  }
  return keys;
}

/**
 * Returns completion % trend data for the last N weeks.
 */
export function calcWeeklyTrend(
  habits: Habit[],
  records: WeekRecord[],
  weeks: number,
): Array<{ weekKey: string; label: string; percent: number }> {
  const weekKeys = getLastNWeekKeys(weeks);
  return weekKeys.map((wk) => ({
    weekKey: wk,
    label: weekKeyToLabel(wk),
    percent: calcWeeklyPercent(habits, records, wk),
  }));
}
