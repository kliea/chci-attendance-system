import { defineStore } from "pinia";
import { supabase } from "@/lib/supabase.js";

export const useOvertimeStore = defineStore("overtime", {
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
          .from("overtime_requests")
          .select(
            "id, user_id, date, start_time, end_time, reason, type, status, created_at, approved_by, approved_at, rejection_reason",
          )
          .order("created_at", { ascending: false });

        if (error) throw error;

        // Resolve requester and approver from profiles
        const profileIds = new Set();
        (rows || []).forEach((r) => {
          if (r.user_id) profileIds.add(r.user_id);
          if (r.approved_by) profileIds.add(r.approved_by);
        });
        const ids = [...profileIds];
        const profileMap = {};
        if (ids.length) {
          const { data: profiles, error: profError } = await supabase
            .from("profiles")
            .select("id, full_name, bio_id")
            .in("id", ids);

          if (profError) throw profError;
          (profiles || []).forEach((p) => {
            profileMap[p.id] = p;
          });
        }

        // Attach profile info
        this.requests = (rows || []).map((r) => ({
          ...r,
          requester: profileMap[r.user_id] || null,
          approver: profileMap[r.approved_by] || null,
        }));
      } catch (err) {
        console.error("Error fetching overtime requests:", err);
        this.error = "Failed to fetch overtime requests";
      } finally {
        this.loading = false;
      }
    },

    async fetchUserRequests(userId) {
      this.loading = true;
      this.error = null;

      try {
        const { data: rows, error } = await supabase
          .from("overtime_requests")
          .select(
            "id, user_id, date, start_time, end_time, reason, type, status, created_at, approved_by, approved_at, rejection_reason",
          )
          .eq("user_id", userId)
          .order("created_at", { ascending: false });

        if (error) throw error;

        // Resolve approver from profiles
        const profileIds = new Set();
        (rows || []).forEach((r) => {
          if (r.approved_by) profileIds.add(r.approved_by);
        });
        const ids = [...profileIds];
        const profileMap = {};
        if (ids.length) {
          const { data: profiles, error: profError } = await supabase
            .from("profiles")
            .select("id, full_name, bio_id")
            .in("id", ids);

          if (profError) throw profError;
          (profiles || []).forEach((p) => {
            profileMap[p.id] = p;
          });
        }

        // Attach approver info and update store state
        const processedRequests = (rows || []).map((r) => ({
          ...r,
          approver: profileMap[r.approved_by] || null,
        }));

        // Update store state for consistency
        this.requests = processedRequests;

        // Return processed requests for backward compatibility
        return processedRequests;
      } catch (err) {
        console.error("Error fetching user overtime requests:", err);
        this.error = "Failed to fetch overtime requests";
        return [];
      } finally {
        this.loading = false;
      }
    },

    async createRequest(payload) {
      this.submitting = true;
      this.submitError = null;
      this.submitSuccess = null;

      try {
        const { data, error } = await supabase
          .from("overtime_requests")
          .insert({
            user_id: payload.userId,
            date: payload.date,
            start_time: payload.startTime,
            end_time: payload.endTime,
            reason: payload.reason,
            type: payload.type,
            status: "pending",
          })
          .select()
          .single();

        if (error) throw error;

        this.submitSuccess = "Overtime request submitted successfully";
        return { ok: true, data };
      } catch (err) {
        console.error("Error creating overtime request:", err);
        this.submitError = "Failed to submit overtime request";
        return { ok: false, error: err.message };
      } finally {
        this.submitting = false;
      }
    },

    async updateRequest(requestId, payload) {
      this.submitting = true;
      this.submitError = null;
      this.submitSuccess = null;

      try {
        const { data, error } = await supabase
          .from("overtime_requests")
          .update({
            date: payload.date,
            start_time: payload.startTime,
            end_time: payload.endTime,
            reason: payload.reason,
            type: payload.type,
          })
          .eq("id", requestId)
          .select()
          .single();

        if (error) throw error;

        this.submitSuccess = "Overtime request updated successfully";
        return { ok: true, data };
      } catch (err) {
        console.error("Error updating overtime request:", err);
        this.submitError = "Failed to update overtime request";
        return { ok: false, error: err.message };
      } finally {
        this.submitting = false;
      }
    },

    async deleteRequest(requestId) {
      this.submitting = true;
      this.submitError = null;
      this.submitSuccess = null;

      try {
        const { error } = await supabase
          .from("overtime_requests")
          .delete()
          .eq("id", requestId);

        if (error) throw error;

        this.submitSuccess = "Overtime request deleted successfully";
        return { ok: true };
      } catch (err) {
        console.error("Error deleting overtime request:", err);
        this.submitError = "Failed to delete overtime request";
        return { ok: false, error: err.message };
      } finally {
        this.submitting = false;
      }
    },

    async approveRequest(requestId, approverId) {
      this.submitting = true;
      this.submitError = null;
      this.submitSuccess = null;

      try {
        const { data, error } = await supabase
          .from("overtime_requests")
          .update({
            status: "approved",
            approved_by: approverId,
            approved_at: new Date().toISOString(),
          })
          .eq("id", requestId)
          .select()
          .single();

        if (error) throw error;

        // Add overtime to attendance logs
        await this.addOvertimeToAttendance(requestId);

        this.submitSuccess = "Overtime request approved successfully";
        return { ok: true, data };
      } catch (err) {
        console.error("Error approving overtime request:", err);
        this.submitError = "Failed to approve overtime request";
        return { ok: false, error: err.message };
      } finally {
        this.submitting = false;
      }
    },

    async rejectRequest(requestId, approverId, rejectionReason) {
      this.submitting = true;
      this.submitError = null;
      this.submitSuccess = null;

      try {
        const { data, error } = await supabase
          .from("overtime_requests")
          .update({
            status: "rejected",
            approved_by: approverId,
            approved_at: new Date().toISOString(),
            rejection_reason: rejectionReason,
          })
          .eq("id", requestId)
          .select()
          .single();

        if (error) throw error;

        this.submitSuccess = "Overtime request rejected successfully";
        return { ok: true, data };
      } catch (err) {
        console.error("Error rejecting overtime request:", err);
        this.submitError = "Failed to reject overtime request";
        return { ok: false, error: err.message };
      } finally {
        this.submitting = false;
      }
    },

    clearSubmitStatus() {
      this.submitError = null;
      this.submitSuccess = null;
    },

    async addOvertimeToAttendance(requestId) {
      try {
        // Get the overtime request details
        const { data: overtimeRequest, error: fetchError } = await supabase
          .from("overtime_requests")
          .select("user_id, date, start_time, end_time")
          .eq("id", requestId)
          .single();

        if (fetchError) throw fetchError;
        if (!overtimeRequest) throw new Error("Overtime request not found");

        // Get staff_id from user profile
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("bio_id")
          .eq("id", overtimeRequest.user_id)
          .single();

        if (profileError) throw profileError;
        if (!profile?.bio_id)
          throw new Error("User profile not linked to staff record");

        const { data: staff, error: staffError } = await supabase
          .from("staff")
          .select("id")
          .eq("bio_id", profile.bio_id)
          .single();

        if (staffError) throw staffError;
        if (!staff?.id) throw new Error("Staff record not found");

        // Calculate overtime hours (anything beyond 8 hours is overtime)
        const startTime = new Date(`2000-01-01T${overtimeRequest.start_time}`);
        const endTime = new Date(`2000-01-01T${overtimeRequest.end_time}`);
        const totalHours = (endTime - startTime) / (1000 * 60 * 60); // Convert to hours

        const regularHours = 8;
        const overtimeHours = Math.max(0, totalHours - regularHours);

        if (overtimeHours > 0) {
          const overtimeIn = new Date(
            startTime.getTime() + regularHours * 60 * 60 * 1000,
          );
          const overtimeInTime = overtimeIn.toTimeString().slice(0, 8); // HH:MM:SS format

          // Check if attendance record exists for this date
          const { data: existingRecord, error: checkError } = await supabase
            .from("attendance_logs")
            .select("id")
            .eq("staff_id", staff.id)
            .eq("date", overtimeRequest.date)
            .maybeSingle();

          if (checkError) throw checkError;

          if (existingRecord) {
            // Update existing attendance record with overtime
            const { error: updateError } = await supabase
              .from("attendance_logs")
              .update({
                overtime_in: overtimeInTime,
                overtime_out: overtimeRequest.end_time,
                updated_at: new Date().toISOString(),
              })
              .eq("id", existingRecord.id);

            if (updateError) throw updateError;
          } else {
            // Create new attendance record with overtime
            const { error: insertError } = await supabase
              .from("attendance_logs")
              .insert({
                staff_id: staff.id,
                date: overtimeRequest.date,
                time_in: overtimeRequest.start_time,
                time_out: overtimeRequest.end_time,
                overtime_in: overtimeInTime,
                overtime_out: overtimeRequest.end_time,
                source: "overtime_approval",
              });

            if (insertError) throw insertError;
          }
        }

        return { ok: true };
      } catch (err) {
        console.error("Error adding overtime to attendance:", err);
        return { ok: false, error: err.message };
      }
    },
  },
});
