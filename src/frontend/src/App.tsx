import HabitsPage from "@/components/HabitsPage";
import StatsPage from "@/components/StatsPage";
import { Toaster } from "@/components/ui/sonner";
import { useHabits } from "@/hooks/useHabits";
import { BarChart2, CheckSquare } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

type Tab = "habits" | "stats";

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>("habits");
  const {
    habits,
    weekRecords,
    currentWeekKey,
    isReady,
    addHabit,
    deleteHabit,
    toggleDay,
    getWeekRecord,
  } = useHabits();

  if (!isReady) {
    return (
      <div
        className="flex items-center justify-center h-screen"
        style={{ background: "oklch(0.11 0.005 240)" }}
      >
        <div className="flex flex-col items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: "oklch(0.72 0.14 195 / 0.15)" }}
          >
            <CheckSquare
              className="w-5 h-5"
              style={{ color: "oklch(0.72 0.14 195)" }}
            />
          </div>
          <div
            className="w-5 h-0.5 rounded-full animate-pulse"
            style={{ background: "oklch(0.72 0.14 195 / 0.5)" }}
          />
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex flex-col h-screen max-w-lg mx-auto overflow-hidden"
      style={{ background: "oklch(0.11 0.005 240)" }}
    >
      {/* Main content area */}
      <main className="flex-1 overflow-hidden relative">
        <AnimatePresence mode="wait">
          {activeTab === "habits" ? (
            <motion.div
              key="habits"
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="absolute inset-0 overflow-y-auto"
            >
              <HabitsPage
                habits={habits}
                currentWeekKey={currentWeekKey}
                onAddHabit={addHabit}
                onDeleteHabit={deleteHabit}
                onToggleDay={toggleDay}
                getWeekRecord={getWeekRecord}
              />
            </motion.div>
          ) : (
            <motion.div
              key="stats"
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 16 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="absolute inset-0 overflow-y-auto"
            >
              <StatsPage habits={habits} weekRecords={weekRecords} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Bottom Tab Navigation */}
      <nav
        className="shrink-0"
        style={{
          background: "oklch(0.13 0.007 240)",
          borderTop: "1px solid oklch(0.26 0.010 240)",
          paddingBottom: "env(safe-area-inset-bottom)",
        }}
      >
        <div className="flex">
          <TabButton
            ocid="habits.tab"
            label="Habits"
            icon={<CheckSquare className="w-5 h-5" />}
            isActive={activeTab === "habits"}
            onClick={() => setActiveTab("habits")}
          />
          <TabButton
            ocid="stats.tab"
            label="Stats"
            icon={<BarChart2 className="w-5 h-5" />}
            isActive={activeTab === "stats"}
            onClick={() => setActiveTab("stats")}
          />
        </div>
      </nav>

      <Toaster />
    </div>
  );
}

// ─── Tab Button ──────────────────────────────────────────────────────────────────

interface TabButtonProps {
  ocid: string;
  label: string;
  icon: React.ReactNode;
  isActive: boolean;
  onClick: () => void;
}

function TabButton({ ocid, label, icon, isActive, onClick }: TabButtonProps) {
  return (
    <motion.button
      data-ocid={ocid}
      onClick={onClick}
      whileTap={{ scale: 0.95 }}
      className="flex-1 flex flex-col items-center justify-center py-3 gap-1 transition-colors relative"
      style={{
        color: isActive ? "oklch(0.72 0.14 195)" : "oklch(0.50 0.010 240)",
      }}
      aria-selected={isActive}
      role="tab"
    >
      {/* Active indicator */}
      {isActive && (
        <motion.div
          layoutId="tab-indicator"
          className="absolute top-0 left-1/4 right-1/4 h-0.5 rounded-full"
          style={{ background: "oklch(0.72 0.14 195)" }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
        />
      )}
      {icon}
      <span className="text-xs font-sans font-medium">{label}</span>
    </motion.button>
  );
}
