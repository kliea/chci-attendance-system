import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { supabase } from "@/lib/supabase.js";

export const useSettingsStore = defineStore("settings", () => {
  const settings = ref({});
  const loading = ref(false);
  const error = ref(null);

  // Getters
  const workStartTime = computed(() => settings.value.work_start_time || "08:00");
  const workEndTime = computed(() => settings.value.work_end_time || "17:00");
  const gracePeriodMinutes = computed(() => settings.value.grace_period_minutes || 30);

  // Calculate late threshold by adding grace period to work start time
  const lateThresholdMinutes = computed(() => {
    const [hours, minutes] = workStartTime.value.split(":").map(Number);
    const graceMinutes = gracePeriodMinutes.value;
    return hours * 60 + minutes + graceMinutes;
  });

  // Formatted late threshold for display
  const lateThresholdDisplay = computed(() => {
    const [hours, minutes] = workStartTime.value.split(":").map(Number);
    const graceMinutes = gracePeriodMinutes.value;
    const totalMinutes = minutes + graceMinutes;
    
    if (totalMinutes >= 60) {
      const adjustedHours = hours + Math.floor(totalMinutes / 60);
      const adjustedMinutes = totalMinutes % 60;
      return `${adjustedHours.toString().padStart(2, "0")}:${adjustedMinutes.toString().padStart(2, "0")}`;
    }
    
    return `${hours.toString().padStart(2, "0")}:${totalMinutes.toString().padStart(2, "0")}`;
  });

  // Actions
  async function fetchSettings() {
    loading.value = true;
    error.value = null;

    try {
      const { data, error } = await supabase
        .from("settings")
        .select("key, value")
        .in("key", ["work_start_time", "work_end_time", "grace_period_minutes"]);

      if (error) throw error;

      // Convert array to object for easier access
      const settingsObj = {};
      (data || []).forEach((setting) => {
        settingsObj[setting.key] = setting.value;
      });

      settings.value = settingsObj;
    } catch (err) {
      console.error("Error fetching settings:", err);
      error.value = "Failed to load settings";
    } finally {
      loading.value = false;
    }
  }

  async function updateSetting(key, value) {
    try {
      const { error } = await supabase.rpc("update_setting", {
        setting_key: key,
        setting_value: value,
      });

      if (error) throw error;

      // Update local cache
      settings.value[key] = value;
      return { ok: true };
    } catch (err) {
      console.error("Error updating setting:", err);
      return { ok: false, error: err.message };
    }
  }

  async function updateWorkStartTime(time) {
    return await updateSetting("work_start_time", time);
  }

  async function updateWorkEndTime(time) {
    return await updateSetting("work_end_time", time);
  }

  async function updateGracePeriod(minutes) {
    return await updateSetting("grace_period_minutes", minutes);
  }

  // Initialize settings on store creation
  fetchSettings();

  return {
    // State
    settings,
    loading,
    error,

    // Getters
    workStartTime,
    workEndTime,
    gracePeriodMinutes,
    lateThresholdMinutes,
    lateThresholdDisplay,

    // Actions
    fetchSettings,
    updateSetting,
    updateWorkStartTime,
    updateWorkEndTime,
    updateGracePeriod,
  };
});
