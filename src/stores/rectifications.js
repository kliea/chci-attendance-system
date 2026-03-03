import { defineStore } from "pinia";
import { supabase } from "@/lib/supabase.js";

export const useRectificationsStore = defineStore("rectifications", {
  state: () => ({
    requests: [],
    loading: false,
    error: null,
    submitting: false,
    submitError: null,
    submitSuccess: null,
  }),

  getters: {
    pendingRequests: (state) =>
      state.requests.filter((req) => req.status === "pending"),
    approvedRequests: (state) =>
      state.requests.filter((req) => req.status === "approved"),
    rejectedRequests: (state) =>
      state.requests.filter((req) => req.status === "rejected"),
  },

  actions: {
    async fetchRequests() {
      this.loading = true;
      this.error = null;

      try {
        const { data: rows, error } = await supabase
          .from("rectification_requests")
          .select(
            "id, user_id, attendance_id, date, reason, requested_in, requested_out, status, created_at, reviewed_by, reviewed_at",
          )
          .order("created_at", { ascending: false });

        if (error) throw error;

        // Resolve requester and reviewer from profiles (no embed to avoid "users" relation)
        const profileIds = new Set();
        (rows || []).forEach((r) => {
          if (r.user_id) profileIds.add(r.user_id);
          if (r.reviewed_by) profileIds.add(r.reviewed_by);
        });
        const ids = [...profileIds];
        const profileMap = {};
        if (ids.length) {
          const { data: profiles, error: profError } = await supabase
            .from("profiles")
            .select("id, full_name, bio_id")
            .in("id", ids);
          if (!profError && profiles) {
            profiles.forEach((p) => {
              profileMap[p.id] = p;
            });
          }
        }

        this.requests = (rows || []).map((r) => ({
          ...r,
          requester: profileMap[r.user_id] ?? null,
          reviewer: profileMap[r.reviewed_by] ?? null,
        }));
      } catch (error) {
        this.error = error.message;
        if (import.meta.env.DEV) {
          console.error("Error fetching rectification requests:", error);
        }
      } finally {
        this.loading = false;
      }
    },

    async createRequest(requestData) {
      this.submitting = true;
      this.submitError = null;
      this.submitSuccess = null;

      try {
        const { data, error } = await supabase
          .from("rectification_requests")
          .insert({
            user_id: requestData.userId,
            attendance_id: requestData.attendanceId || null,
            date: requestData.date,
            reason: requestData.reason,
            requested_in: requestData.requestedIn || null,
            requested_out: requestData.requestedOut || null,
            status: "pending",
          })
          .select()
          .single();

        if (error) throw error;

        this.submitSuccess = "Rectification request submitted successfully";
        await this.fetchRequests();
        return { ok: true, data };
      } catch (error) {
        this.submitError = error.message;
        if (import.meta.env.DEV) {
          console.error("Error creating rectification request:", error);
        }
        return { ok: false, error: error.message };
      } finally {
        this.submitting = false;
      }
    },

    async updateRequest(requestId, requestData) {
      this.submitting = true;
      this.submitError = null;
      this.submitSuccess = null;

      try {
        const { data, error } = await supabase
          .from("rectification_requests")
          .update({
            date: requestData.date,
            reason: requestData.reason,
            requested_in: requestData.requestedIn || null,
            requested_out: requestData.requestedOut || null,
          })
          .eq("id", requestId)
          .select()
          .single();

        if (error) throw error;

        this.submitSuccess = "Rectification request updated successfully";
        await this.fetchRequests();
        return { ok: true, data };
      } catch (error) {
        this.submitError = error.message;
        if (import.meta.env.DEV) {
          console.error("Error updating rectification request:", error);
        }
        return { ok: false, error: error.message };
      } finally {
        this.submitting = false;
      }
    },

    async updateRequestStatus(requestId, status, reviewedBy) {
      this.submitting = true;
      this.error = null;

      try {
        const updateData = {
          status,
          reviewed_by: reviewedBy,
          reviewed_at: new Date().toISOString(),
        };

        const { data, error } = await supabase
          .from("rectification_requests")
          .update(updateData)
          .eq("id", requestId)
          .select()
          .single();

        if (error) throw error;

        // If approved, update attendance_logs (by staff_id from profile)
        if (status === "approved") {
          await this.updateAttendanceRecord(data);
        }

        await this.fetchRequests();
        return { ok: true, data };
      } catch (error) {
        this.error = error.message;
        if (import.meta.env.DEV) {
          console.error("Error updating rectification request:", error);
        }
        return { ok: false, error: error.message };
      } finally {
        this.submitting = false;
      }
    },

    async updateAttendanceRecord(rectificationRequest) {
      try {
        // Resolve staff_id from user_id (profile) via profile.bio_id → staff.id
        const { data: profile } = await supabase
          .from("profiles")
          .select("bio_id")
          .eq("id", rectificationRequest.user_id)
          .maybeSingle();
        if (!profile?.bio_id) {
          if (import.meta.env.DEV) {
            console.warn(
              "Rectification: profile has no bio_id, cannot update attendance_logs",
            );
          }
          return null;
        }
        const { data: staffRow } = await supabase
          .from("staff")
          .select("id")
          .eq("bio_id", profile.bio_id)
          .maybeSingle();
        if (!staffRow?.id) {
          if (import.meta.env.DEV) {
            console.warn("Rectification: no staff for bio_id", profile.bio_id);
          }
          return null;
        }
        const staffId = staffRow.id;

        const { data: existingRecord, error: fetchError } = await supabase
          .from("attendance_logs")
          .select("id")
          .eq("staff_id", staffId)
          .eq("date", rectificationRequest.date)
          .maybeSingle();

        if (fetchError) throw fetchError;

        const updatePayload = {};
        if (rectificationRequest.requested_in != null)
          updatePayload.time_in = rectificationRequest.requested_in;
        if (rectificationRequest.requested_out != null)
          updatePayload.time_out = rectificationRequest.requested_out;

        if (existingRecord) {
          if (Object.keys(updatePayload).length) {
            const { data, error } = await supabase
              .from("attendance_logs")
              .update(updatePayload)
              .eq("id", existingRecord.id)
              .select()
              .single();
            if (error) throw error;
            // Link rectification to this log if not already
            if (!rectificationRequest.attendance_id) {
              await supabase
                .from("rectification_requests")
                .update({ attendance_id: data.id })
                .eq("id", rectificationRequest.id);
            }
            return data;
          }
          return existingRecord;
        }

        // Insert new attendance_logs row (missing record case)
        const insertPayload = {
          staff_id: staffId,
          date: rectificationRequest.date,
          source: "rectification",
          ...updatePayload,
        };
        const { data: newRecord, error: insertError } = await supabase
          .from("attendance_logs")
          .insert(insertPayload)
          .select()
          .single();
        if (insertError) throw insertError;
        await supabase
          .from("rectification_requests")
          .update({ attendance_id: newRecord.id })
          .eq("id", rectificationRequest.id);
        return newRecord;
      } catch (error) {
        if (import.meta.env.DEV) {
          console.error("Error updating attendance record:", error);
        }
        throw error;
      }
    },

    async fetchUserRequests(userId) {
      this.loading = true;
      this.error = null;

      try {
        const { data, error } = await supabase
          .from("rectification_requests")
          .select(
            "id, user_id, attendance_id, date, reason, requested_in, requested_out, status, created_at, reviewed_by, reviewed_at",
          )
          .eq("user_id", userId)
          .order("created_at", { ascending: false });

        if (error) throw error;
        return data || [];
      } catch (error) {
        this.error = error.message;
        if (import.meta.env.DEV) {
          console.error("Error fetching user rectification requests:", error);
        }
        return [];
      } finally {
        this.loading = false;
      }
    },

    async fetchAttendanceWithRectifications(profileId, startDate, endDate) {
      try {
        // Resolve staff_id from profile (profileId = profiles.id)
        const { data: profile } = await supabase
          .from("profiles")
          .select("bio_id")
          .eq("id", profileId)
          .maybeSingle();
        if (!profile?.bio_id) return [];
        const { data: staffRow } = await supabase
          .from("staff")
          .select("id")
          .eq("bio_id", profile.bio_id)
          .maybeSingle();
        if (!staffRow?.id) return [];
        const staffId = staffRow.id;

        const { data: attendance, error: attendanceError } = await supabase
          .from("attendance_logs")
          .select("id, staff_id, date, time_in, time_out, source")
          .eq("staff_id", staffId)
          .gte("date", startDate)
          .lte("date", endDate)
          .order("date", { ascending: true });

        if (attendanceError) throw attendanceError;

        const { data: rectifications, error: rectificationError } =
          await supabase
            .from("rectification_requests")
            .select("id, user_id, date, requested_in, requested_out, status")
            .eq("user_id", profileId)
            .eq("status", "approved")
            .gte("date", startDate)
            .lte("date", endDate)
            .order("date", { ascending: true });

        if (rectificationError) throw rectificationError;

        const attendanceMap = {};
        (attendance || []).forEach((record) => {
          attendanceMap[record.date] = record;
        });

        const mergedRecords = [];
        const currentDate = new Date(startDate);
        const end = new Date(endDate);

        while (currentDate <= end) {
          const dateStr = currentDate.toISOString().split("T")[0];
          const log = attendanceMap[dateStr];
          const rect = (rectifications || []).find((r) => r.date === dateStr);

          if (log) {
            mergedRecords.push({
              ...log,
              time_in: rect?.requested_in ?? log.time_in,
              time_out: rect?.requested_out ?? log.time_out,
              rectification_id: rect?.id ?? null,
            });
          } else if (rect) {
            mergedRecords.push({
              id: `rectified_${rect.id}`,
              staff_id: staffId,
              date: dateStr,
              time_in: rect.requested_in,
              time_out: rect.requested_out,
              source: "rectification",
              rectification_id: rect.id,
            });
          }
          currentDate.setDate(currentDate.getDate() + 1);
        }

        return mergedRecords;
      } catch (error) {
        if (import.meta.env.DEV) {
          console.error(
            "Error fetching attendance with rectifications:",
            error,
          );
        }
        throw error;
      }
    },

    async deleteRequest(requestId) {
      this.submitting = true;
      this.submitError = null;
      this.submitSuccess = null;

      try {
        const { error } = await supabase
          .from("rectification_requests")
          .delete()
          .eq("id", requestId);

        if (error) throw error;

        this.submitSuccess = "Rectification request deleted successfully";
        await this.fetchRequests();
        return { ok: true };
      } catch (error) {
        this.submitError = error.message;
        if (import.meta.env.DEV) {
          console.error("Error deleting rectification request:", error);
        }
        return { ok: false, error: error.message };
      } finally {
        this.submitting = false;
      }
    },

    clearSubmitStatus() {
      this.submitError = null;
      this.submitSuccess = null;
    },

    $reset() {
      this.requests = [];
      this.loading = false;
      this.error = null;
      this.submitting = false;
      this.submitError = null;
      this.submitSuccess = null;
    },
  },
});
