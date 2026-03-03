import {
  type DayKey,
  type Habit,
  type WeekRecord,
  calcDailyPercent,
  calcMonthlyPercent,
  calcWeeklyPercent,
  calcWeeklyTrend,
  getDayKey,
  getISOWeekKey,
} from "@/lib/habitStorage";
import { Calendar, CalendarDays, Target, TrendingUp } from "lucide-react";
import { motion } from "motion/react";
import { useMemo } from "react";
import {
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Tooltip as LineTooltip,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface StatsPageProps {
  habits: Habit[];
  weekRecords: WeekRecord[];
}

export default function StatsPage({ habits, weekRecords }: StatsPageProps) {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();
  const currentWeekKey = getISOWeekKey(now);
  const todayDayKey: DayKey = getDayKey(now);

  const dailyPct = useMemo(
    () => calcDailyPercent(habits, weekRecords, currentWeekKey, todayDayKey),
    [habits, weekRecords, currentWeekKey, todayDayKey],
  );

  const weeklyPct = useMemo(
    () => calcWeeklyPercent(habits, weekRecords, currentWeekKey),
    [habits, weekRecords, currentWeekKey],
  );

  const monthlyPct = useMemo(
    () => calcMonthlyPercent(habits, weekRecords, currentYear, currentMonth),
    [habits, weekRecords, currentYear, currentMonth],
  );

  // Pie chart data: completed vs missed for current week
  const pieData = useMemo(() => {
    const totalSlots = habits.length * 7;
    const currentRecords = weekRecords.filter(
      (r) => r.weekKey === currentWeekKey,
    );
    const completed = currentRecords.reduce(
      (acc, r) =>
        acc +
        (["mon", "tue", "wed", "thu", "fri", "sat", "sun"] as DayKey[]).filter(
          (d) => r.completions[d],
        ).length,
      0,
    );
    const missed = totalSlots - completed;
    return [
      { name: "Completed", value: completed },
      { name: "Missed", value: Math.max(0, missed) },
    ];
  }, [habits, weekRecords, currentWeekKey]);

  // Line chart: 8-week trend
  const trendData = useMemo(
    () => calcWeeklyTrend(habits, weekRecords, 8),
    [habits, weekRecords],
  );

  const noHabits = habits.length === 0;

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      {/* Header */}
      <div className="px-4 pt-6 pb-4">
        <div className="flex items-center gap-2 mb-1">
          <TrendingUp
            className="w-5 h-5"
            style={{ color: "oklch(0.72 0.14 195)" }}
          />
          <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">
            Stats
          </h1>
        </div>
        <p
          className="text-xs font-sans"
          style={{ color: "oklch(0.58 0.010 240)" }}
        >
          Your habit completion overview
        </p>
      </div>

      {noHabits ? (
        <div className="flex flex-col items-center justify-center py-20 px-8 text-center">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
            style={{ background: "oklch(0.72 0.14 195 / 0.10)" }}
          >
            <TrendingUp
              className="w-8 h-8"
              style={{ color: "oklch(0.72 0.14 195 / 0.6)" }}
            />
          </div>
          <p className="font-display text-lg font-semibold text-foreground mb-2">
            No data yet
          </p>
          <p
            className="text-sm font-sans"
            style={{ color: "oklch(0.58 0.010 240)" }}
          >
            Add some habits and start completing them to see your stats here.
          </p>
        </div>
      ) : (
        <div className="px-4 space-y-5 pb-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-3 gap-3">
            <StatCard
              ocid="stats.today_card"
              icon={<Target className="w-3.5 h-3.5" />}
              label="Today"
              value={dailyPct}
              delay={0}
            />
            <StatCard
              ocid="stats.week_card"
              icon={<CalendarDays className="w-3.5 h-3.5" />}
              label="This Week"
              value={weeklyPct}
              delay={0.06}
            />
            <StatCard
              ocid="stats.month_card"
              icon={<Calendar className="w-3.5 h-3.5" />}
              label="This Month"
              value={monthlyPct}
              delay={0.12}
            />
          </div>

          {/* Pie Chart */}
          <motion.div
            data-ocid="stats.pie_chart"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.18, duration: 0.3 }}
            className="rounded-xl p-4"
            style={{
              background: "oklch(0.15 0.008 240)",
              border: "1px solid oklch(0.26 0.010 240)",
            }}
          >
            <h2
              className="font-display text-sm font-semibold mb-1"
              style={{ color: "oklch(0.92 0.008 240)" }}
            >
              This Week
            </h2>
            <p
              className="text-xs font-sans mb-4"
              style={{ color: "oklch(0.55 0.010 240)" }}
            >
              Completed vs missed
            </p>

            <div className="flex items-center gap-4">
              <div className="w-36 h-36 shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={60}
                      paddingAngle={3}
                      dataKey="value"
                      startAngle={90}
                      endAngle={-270}
                    >
                      <Cell fill="oklch(0.72 0.14 195)" />
                      <Cell fill="oklch(0.22 0.009 240)" />
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        background: "oklch(0.17 0.009 240)",
                        border: "1px solid oklch(0.26 0.010 240)",
                        borderRadius: "8px",
                        color: "oklch(0.95 0.008 240)",
                        fontSize: "12px",
                        fontFamily: "General Sans, sans-serif",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="flex-1 space-y-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ background: "oklch(0.72 0.14 195)" }}
                    />
                    <span
                      className="text-xs font-sans"
                      style={{ color: "oklch(0.70 0.008 240)" }}
                    >
                      Completed
                    </span>
                  </div>
                  <p
                    className="font-display text-2xl font-bold pl-4"
                    style={{ color: "oklch(0.72 0.14 195)" }}
                  >
                    {pieData[0].value}
                  </p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ background: "oklch(0.30 0.009 240)" }}
                    />
                    <span
                      className="text-xs font-sans"
                      style={{ color: "oklch(0.70 0.008 240)" }}
                    >
                      Missed
                    </span>
                  </div>
                  <p
                    className="font-display text-2xl font-bold pl-4"
                    style={{ color: "oklch(0.55 0.010 240)" }}
                  >
                    {pieData[1].value}
                  </p>
                </div>
              </div>
            </div>

            {/* Progress bar */}
            <div className="mt-4">
              <div
                className="h-1.5 rounded-full overflow-hidden"
                style={{ background: "oklch(0.22 0.009 240)" }}
              >
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: "oklch(0.72 0.14 195)" }}
                  initial={{ width: 0 }}
                  animate={{
                    width:
                      pieData[0].value + pieData[1].value > 0
                        ? `${Math.round((pieData[0].value / (pieData[0].value + pieData[1].value)) * 100)}%`
                        : "0%",
                  }}
                  transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
                />
              </div>
              <p
                className="text-xs font-sans mt-1.5 text-right"
                style={{ color: "oklch(0.55 0.010 240)" }}
              >
                {pieData[0].value + pieData[1].value > 0
                  ? `${Math.round((pieData[0].value / (pieData[0].value + pieData[1].value)) * 100)}%`
                  : "0%"}{" "}
                completion rate
              </p>
            </div>
          </motion.div>

          {/* Line Chart */}
          <motion.div
            data-ocid="stats.line_chart"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.24, duration: 0.3 }}
            className="rounded-xl p-4"
            style={{
              background: "oklch(0.15 0.008 240)",
              border: "1px solid oklch(0.26 0.010 240)",
            }}
          >
            <h2
              className="font-display text-sm font-semibold mb-1"
              style={{ color: "oklch(0.92 0.008 240)" }}
            >
              Weekly Trend
            </h2>
            <p
              className="text-xs font-sans mb-4"
              style={{ color: "oklch(0.55 0.010 240)" }}
            >
              Completion % over the past 8 weeks
            </p>

            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={trendData}
                  margin={{ top: 4, right: 4, bottom: 0, left: -24 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="oklch(0.22 0.009 240)"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="label"
                    tick={{
                      fill: "oklch(0.50 0.010 240)",
                      fontSize: 10,
                      fontFamily: "General Sans, sans-serif",
                    }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    domain={[0, 100]}
                    tick={{
                      fill: "oklch(0.50 0.010 240)",
                      fontSize: 10,
                      fontFamily: "General Sans, sans-serif",
                    }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v: number) => `${v}%`}
                  />
                  <LineTooltip
                    contentStyle={{
                      background: "oklch(0.17 0.009 240)",
                      border: "1px solid oklch(0.26 0.010 240)",
                      borderRadius: "8px",
                      color: "oklch(0.95 0.008 240)",
                      fontSize: "12px",
                      fontFamily: "General Sans, sans-serif",
                    }}
                    formatter={(value: number) => [`${value}%`, "Completion"]}
                  />
                  <Line
                    type="monotone"
                    dataKey="percent"
                    stroke="oklch(0.72 0.14 195)"
                    strokeWidth={2}
                    dot={{
                      fill: "oklch(0.72 0.14 195)",
                      strokeWidth: 0,
                      r: 3,
                    }}
                    activeDot={{
                      fill: "oklch(0.72 0.14 195)",
                      r: 5,
                      strokeWidth: 2,
                      stroke: "oklch(0.15 0.008 240)",
                    }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

// ─── Stat Card ───────────────────────────────────────────────────────────────────

interface StatCardProps {
  ocid: string;
  icon: React.ReactNode;
  label: string;
  value: number;
  delay: number;
}

function StatCard({ ocid, icon, label, value, delay }: StatCardProps) {
  const color =
    value >= 80
      ? "oklch(0.72 0.14 195)"
      : value >= 50
        ? "oklch(0.75 0.14 145)"
        : value > 0
          ? "oklch(0.75 0.18 55)"
          : "oklch(0.55 0.010 240)";

  return (
    <motion.div
      data-ocid={ocid}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.25 }}
      className="rounded-xl p-3 flex flex-col gap-2"
      style={{
        background: "oklch(0.15 0.008 240)",
        border: "1px solid oklch(0.26 0.010 240)",
      }}
    >
      <div
        className="flex items-center gap-1.5"
        style={{ color: "oklch(0.58 0.010 240)" }}
      >
        {icon}
        <span className="text-xs font-sans">{label}</span>
      </div>
      <p
        className="font-display text-2xl font-bold leading-none"
        style={{ color }}
      >
        {value}
        <span
          className="text-sm font-medium ml-0.5"
          style={{ color: "oklch(0.55 0.010 240)" }}
        >
          %
        </span>
      </p>

      {/* Mini progress bar */}
      <div
        className="h-1 rounded-full overflow-hidden"
        style={{ background: "oklch(0.20 0.010 240)" }}
      >
        <motion.div
          className="h-full rounded-full"
          style={{ background: color }}
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.5, delay: delay + 0.2, ease: "easeOut" }}
        />
      </div>
    </motion.div>
  );
}
