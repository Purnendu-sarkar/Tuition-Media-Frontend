"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Calendar, 
  Clock, 
  CheckCircle2, 
  Save, 
  Loader2, 
  Plus, 
  X, 
  Info,
  CalendarDays,
  Sun,
  Moon,
  Coffee,
  Activity
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { tutorApi, Availability } from "@/lib/api/tutor";

const DAYS = [
  "SATURDAY",
  "SUNDAY",
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY"
];

const TIME_SLOTS = [
  "08:00 AM", "09:00 AM", "10:00 AM", "11:00 AM", 
  "12:00 PM", "01:00 PM", "02:00 PM", "03:00 PM", 
  "04:00 PM", "05:00 PM", "06:00 PM", "07:00 PM", 
  "08:00 PM", "09:00 PM", "10:00 PM"
];

export default function SchedulePage() {
  const { data: session } = useSession();
  const [availabilities, setAvailabilities] = useState<Record<string, string[]>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeDay, setActiveDay] = useState<string>("SATURDAY");

  useEffect(() => {
    if (session?.accessToken) {
      fetchAvailability();
    }
  }, [session?.accessToken]);

  const fetchAvailability = async () => {
    try {
      setIsLoading(true);
      const data = await tutorApi.getAvailability(session!.accessToken as string);
      const availabilityMap: Record<string, string[]> = {};
      data.forEach((item) => {
        availabilityMap[item.day] = item.slots;
      });
      setAvailabilities(availabilityMap);
    } catch (err) {
      console.error("Failed to load availability:", err);
      toast.error("Failed to load your schedule.");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSlot = (day: string, slot: string) => {
    setAvailabilities((prev) => {
      const daySlots = prev[day] || [];
      if (daySlots.includes(slot)) {
        return { ...prev, [day]: daySlots.filter((s) => s !== slot) };
      } else {
        return { ...prev, [day]: [...daySlots, slot].sort() };
      }
    });
  };

  const handleSave = async () => {
    if (!session?.accessToken) return;

    setIsSaving(true);
    try {
      const payload = DAYS.map((day) => ({
        day,
        slots: availabilities[day] || [],
      }));
      await tutorApi.updateAvailability(session.accessToken as string, payload);
      toast.success("Schedule updated successfully!");
    } catch (err) {
      console.error("Failed to update schedule:", err);
      toast.error("Failed to save changes.");
    } finally {
      setIsSaving(false);
    }
  };

  const copyToAllDays = (sourceDay: string) => {
    const slotsToCopy = availabilities[sourceDay] || [];
    const nextAvail = { ...availabilities };
    DAYS.forEach(day => {
      if (day !== sourceDay) {
        nextAvail[day] = [...slotsToCopy];
      }
    });
    setAvailabilities(nextAvail);
    toast.success(`Schedule copied to all days`);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-muted-foreground animate-pulse font-medium">Loading your schedule...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-32 relative">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-border pb-8">
        <div className="space-y-2">
          <h1 className="text-4xl font-black font-[var(--font-space-grotesk)] text-foreground tracking-tight">
            Schedule & Availability
          </h1>
          <p className="text-muted-foreground text-lg">
            Set your weekly teaching hours to help students find you when you're free.
          </p>
        </div>
        <div className="flex items-center gap-4 bg-primary/5 border border-primary/10 px-5 py-3 rounded-2xl">
          <div className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-sm font-bold text-primary">Your profile is visible to students</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Day Selector Sidebar */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-surface border border-border rounded-3xl p-6 shadow-sm">
            <h3 className="text-sm font-black text-muted-foreground uppercase tracking-widest mb-6 flex items-center gap-2">
              <CalendarDays className="h-4 w-4" /> Weekly Days
            </h3>
            <div className="space-y-2">
              {DAYS.map((day) => {
                const count = availabilities[day]?.length || 0;
                const isActive = activeDay === day;
                return (
                  <button
                    key={day}
                    onClick={() => setActiveDay(day)}
                    className={`w-full flex items-center justify-between px-5 py-4 rounded-2xl transition-all duration-300 group ${
                      isActive 
                        ? "bg-primary text-white shadow-xl shadow-primary/20 scale-[1.02]" 
                        : "hover:bg-muted/50 text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <span className="font-bold tracking-wide">{day.charAt(0) + day.slice(1).toLowerCase()}</span>
                    {count > 0 ? (
                      <span className={`text-xs font-black px-2.5 py-1 rounded-lg ${isActive ? "bg-white/20 text-white" : "bg-primary/10 text-primary"}`}>
                        {count} Slots
                      </span>
                    ) : (
                      <span className="text-[10px] uppercase font-bold opacity-40">Empty</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Actions Card */}
          <Card className="p-6 border-indigo-500/20 bg-indigo-500/5 rounded-3xl">
            <h4 className="font-bold text-indigo-700 flex items-center gap-2 mb-4">
              <Info className="h-4 w-4" /> Quick Tip
            </h4>
            <p className="text-sm text-indigo-600/80 leading-relaxed mb-4">
              Setting consistent hours helps our AI Match Engine recommend you for jobs that fit your routine.
            </p>
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full rounded-xl border-indigo-500/20 text-indigo-600 hover:bg-indigo-500/10 font-bold"
              onClick={() => copyToAllDays(activeDay)}
            >
              Apply this schedule to all days
            </Button>
          </Card>
        </div>

        {/* Slots Grid */}
        <div className="lg:col-span-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeDay}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="bg-surface border border-border rounded-[2rem] p-8 md:p-10 shadow-xl relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none">
                <Clock className="h-48 w-48 text-primary" />
              </div>

              <div className="flex items-center justify-between mb-10 relative z-10">
                <div>
                  <h2 className="text-3xl font-black text-foreground">{activeDay.charAt(0) + activeDay.slice(1).toLowerCase()}</h2>
                  <p className="text-muted-foreground mt-1 font-medium">Select the time slots you are available for tuition.</p>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-xs font-black text-muted-foreground uppercase tracking-tighter">Selected Slots</span>
                  <span className="text-4xl font-black text-primary">{availabilities[activeDay]?.length || 0}</span>
                </div>
              </div>

              {/* Slot Categories */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 relative z-10">
                {TIME_SLOTS.map((slot) => {
                  const isSelected = availabilities[activeDay]?.includes(slot);
                  const isMorning = slot.includes("AM") || slot.startsWith("12");
                  const isEvening = slot.includes("06") || slot.includes("07") || slot.includes("08") || slot.includes("09") || slot.includes("10");

                  return (
                    <button
                      key={slot}
                      onClick={() => toggleSlot(activeDay, slot)}
                      className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all duration-300 group ${
                        isSelected 
                          ? "border-primary bg-primary/5 text-primary shadow-lg shadow-primary/5" 
                          : "border-border hover:border-primary/30 hover:bg-muted/50"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-xl ${isSelected ? "bg-primary text-white" : "bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"} transition-colors`}>
                          {isMorning ? <Sun className="h-4 w-4" /> : isEvening ? <Moon className="h-4 w-4" /> : <Coffee className="h-4 w-4" />}
                        </div>
                        <span className={`font-bold text-sm ${isSelected ? "text-primary" : "text-muted-foreground group-hover:text-foreground"}`}>
                          {slot}
                        </span>
                      </div>
                      {isSelected && (
                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                          <CheckCircle2 className="h-4 w-4" />
                        </motion.div>
                      )}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Floating Action Bar */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-full max-w-4xl px-4 z-50">
        <Card className="p-4 bg-background/80 backdrop-blur-2xl border-primary/20 shadow-2xl flex items-center justify-between ring-1 ring-primary/20 rounded-3xl">
          <div className="hidden sm:flex items-center gap-4 pl-4">
            <div className="p-2 rounded-full bg-primary/10 text-primary">
              <Activity className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-foreground">Draft Schedule</p>
              <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest">Not yet synced to cloud</p>
            </div>
          </div>
          <div className="flex gap-4 w-full sm:w-auto">
            <Button 
              variant="ghost" 
              className="flex-1 sm:flex-none h-14 px-8 font-bold text-muted-foreground hover:bg-muted/50 rounded-2xl transition-all"
              onClick={fetchAvailability}
            >
              Discard
            </Button>
            <Button 
              disabled={isSaving}
              className="flex-[2] sm:flex-none h-14 px-12 font-black rounded-2xl bg-primary text-primary-foreground shadow-2xl shadow-primary/30 hover:scale-[1.02] active:scale-[0.98] transition-all gap-3"
              onClick={handleSave}
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Saving Changes...
                </>
              ) : (
                <>
                  <Save className="h-5 w-5" />
                  Sync Schedule
                </>
              )}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
