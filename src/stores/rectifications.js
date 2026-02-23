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
        const { data, error } = await supabase
          .from("rectification_requests")
          .select(
            `
            *,
            users!rectification_requests_user_id_fkey (
              fname,
              lname,
              bio_id
            ),
            reviewers:users!rectification_requests_reviewed_by_fkey (
              fname,
              lname
            )
          `,
          )
          .order("created_at", { ascending: false });

        if (error) throw error;
        this.requests = data || [];
      } catch (error) {
        this.error = error.message;
        console.error("Error fetching rectification requests:", error);
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
            rectification_title: requestData.title,
            description: requestData.description,
            rectification_type: requestData.type,
            date: requestData.date,
            time_in: requestData.timeIn || null,
            time_out: requestData.timeOut || null,
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
        console.error("Error creating rectification request:", error);
        return { ok: false, error: error.message };
      } finally {
        this.submitting = false;
      }
    },

    async updateRequestStatus(requestId, status, reviewedBy, notes = null) {
      this.submitting = true;
      this.error = null;

      try {
        const updateData = {
          status,
          reviewed_by: reviewedBy,
          reviewed_at: new Date().toISOString(),
        };

        if (notes) {
          updateData.review_notes = notes;
        }

        const { data, error } = await supabase
          .from("rectification_requests")
          .update(updateData)
          .eq("id", requestId)
          .select()
          .single();

        if (error) throw error;

        // If approved, update attendance record
        if (status === "approved" && data.attendance_id) {
          await this.updateAttendanceRecord(data);
        }

        await this.fetchRequests();
        return { ok: true, data };
      } catch (error) {
        this.error = error.message;
        console.error("Error updating rectification request:", error);
        return { ok: false, error: error.message };
      } finally {
        this.submitting = false;
      }
    },

    async updateAttendanceRecord(rectificationRequest) {
      try {
        // First, try to find an existing attendance record for the date
        const { data: existingRecord, error: fetchError } = await supabase
          .from("attendance")
          .select("*")
          .eq("user_id", rectificationRequest.user_id)
          .eq("date", rectificationRequest.date)
          .single();

        if (fetchError && fetchError.code !== "PGRST116") {
          // PGRST116 is "not found"
          throw fetchError;
        }

        let attendanceRecord;

        if (existingRecord) {
          // Update existing record
          const updateData = {
            status: "rectified",
          };

          if (rectificationRequest.time_in) {
            updateData.time_in = rectificationRequest.time_in;
          }
          if (rectificationRequest.time_out) {
            updateData.time_out = rectificationRequest.time_out;
          }

          const { data, error } = await supabase
            .from("attendance")
            .update(updateData)
            .eq("attendance_id", existingRecord.attendance_id)
            .select()
            .single();

          if (error) throw error;
          attendanceRecord = data;
        } else {
          // Create new attendance record
          const newRecordData = {
            user_id: rectificationRequest.user_id,
            date: rectificationRequest.date,
            status: "rectified",
          };

          if (rectificationRequest.time_in) {
            newRecordData.time_in = rectificationRequest.time_in;
          }
          if (rectificationRequest.time_out) {
            newRecordData.time_out = rectificationRequest.time_out;
          }

          const { data, error } = await supabase
            .from("attendance")
            .insert(newRecordData)
            .select()
            .single();

          if (error) throw error;
          attendanceRecord = data;
        }

        // Update the rectification request to link to the attendance record
        const { error: updateError } = await supabase
          .from("rectification_requests")
          .update({ attendance_id: attendanceRecord.attendance_id })
          .eq("id", rectificationRequest.id);

        if (updateError) throw updateError;

        return attendanceRecord;
      } catch (error) {
        console.error("Error updating attendance record:", error);
        throw error;
      }
    },

    async fetchUserRequests(userId) {
      this.loading = true;
      this.error = null;

      try {
        const { data, error } = await supabase
          .from("rectification_requests")
          .select("*")
          .eq("user_id", userId)
          .order("created_at", { ascending: false });

        if (error) throw error;
        return data || [];
      } catch (error) {
        this.error = error.message;
        console.error("Error fetching user rectification requests:", error);
        return [];
      } finally {
        this.loading = false;
      }
    },

    async fetchAttendanceWithRectifications(userId, startDate, endDate) {
      try {
        // Get attendance records
        const { data: attendance, error: attendanceError } = await supabase
          .from("attendance")
          .select("*")
          .eq("user_id", userId)
          .gte("date", startDate)
          .lte("date", endDate)
          .order("date", { ascending: true });

        if (attendanceError) throw attendanceError;

        // Get approved rectifications for the same period
        const { data: rectifications, error: rectificationError } =
          await supabase
            .from("rectification_requests")
            .select("*")
            .eq("user_id", userId)
            .eq("status", "approved")
            .gte("date", startDate)
            .lte("date", endDate)
            .order("date", { ascending: true });

        if (rectificationError) throw rectificationError;

        // Merge attendance with rectifications
        const mergedRecords = [];

        // Create a map of attendance records by date
        const attendanceMap = {};
        attendance.forEach((record) => {
          attendanceMap[record.date] = record;
        });

        // Process each date in the range
        const currentDate = new Date(startDate);
        const end = new Date(endDate);

        while (currentDate <= end) {
          const dateStr = currentDate.toISOString().split("T")[0];
          const attendanceRecord = attendanceMap[dateStr];
          const rectification = rectifications.find((r) => r.date === dateStr);

          if (attendanceRecord) {
            // If there's a rectification for this date, use the rectified data
            if (rectification) {
              mergedRecords.push({
                ...attendanceRecord,
                time_in: rectification.time_in || attendanceRecord.time_in,
                time_out: rectification.time_out || attendanceRecord.time_out,
                status: "rectified",
                rectification_id: rectification.id,
                rectification_notes: rectification.review_notes,
              });
            } else {
              mergedRecords.push(attendanceRecord);
            }
          } else if (rectification) {
            // Create a virtual attendance record from rectification
            mergedRecords.push({
              attendance_id: `rectified_${rectification.id}`,
              user_id: userId,
              date: dateStr,
              time_in: rectification.time_in,
              time_out: rectification.time_out,
              status: "rectified",
              rectification_id: rectification.id,
              rectification_notes: rectification.review_notes,
              overtime_in: null,
              overtime_out: null,
              undertime: null,
            });
          }

          currentDate.setDate(currentDate.getDate() + 1);
        }

        return mergedRecords;
      } catch (error) {
        console.error("Error fetching attendance with rectifications:", error);
        throw error;
      }
    },

    clearSubmitStatus() {
      this.submitError = null;
      this.submitSuccess = null;
    },
  },
});
