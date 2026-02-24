<template>
  <div class="max-w-4xl">
    <header class="mb-6">
      <h1
        class="font-display font-light text-xl tracking-wide text-anito-black"
      >
        Rectify Attendance
      </h1>
      <p
        class="text-anito-gray text-sm font-sans font-light mt-1 leading-relaxed"
      >
        Request corrections for your attendance records.
      </p>
    </header>

    <!-- Rectification Form -->
    <section
      class="rounded border border-anito-gray-light overflow-hidden mb-8"
    >
      <h2
        class="text-[10px] tracking-[0.25em] uppercase text-anito-gray font-sans font-medium px-4 py-3 border-b border-anito-gray-light bg-white"
      >
        New Request
      </h2>
      <div class="p-6">
        <form class="space-y-4" @submit.prevent="submitRequest">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                for="date"
                class="block text-[10px] tracking-[0.25em] uppercase text-anito-gray font-sans font-medium mb-2"
                >Date *</label
              >
              <input
                id="date"
                v-model="form.date"
                type="date"
                required
                class="border border-anito-gray-light rounded bg-transparent px-4 py-3 text-sm font-sans text-anito-black focus:border-anito-blue-mid focus:outline-none w-full transition-colors"
              />
            </div>
            <div>
              <label
                for="type"
                class="block text-[10px] tracking-[0.25em] uppercase text-anito-gray font-sans font-medium mb-2"
                >Type *</label
              >
              <select
                id="type"
                v-model="form.type"
                required
                class="border border-anito-gray-light rounded bg-transparent px-4 py-3 text-sm font-sans text-anito-black focus:border-anito-blue-mid focus:outline-none w-full transition-colors"
              >
                <option value="">Select type</option>
                <option value="time_in">Time In Correction</option>
                <option value="time_out">Time Out Correction</option>
                <option value="both">Time In & Out Correction</option>
                <option value="missing">Missing Record</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                for="timeIn"
                class="block text-[10px] tracking-[0.25em] uppercase text-anito-gray font-sans font-medium mb-2"
                >Corrected Time In</label
              >
              <input
                id="timeIn"
                v-model="form.timeIn"
                type="time"
                class="border border-anito-gray-light rounded bg-transparent px-4 py-3 text-sm font-sans text-anito-black focus:border-anito-blue-mid focus:outline-none w-full transition-colors"
              />
            </div>
            <div>
              <label
                for="timeOut"
                class="block text-[10px] tracking-[0.25em] uppercase text-anito-gray font-sans font-medium mb-2"
                >Corrected Time Out</label
              >
              <input
                id="timeOut"
                v-model="form.timeOut"
                type="time"
                class="border border-anito-gray-light rounded bg-transparent px-4 py-3 text-sm font-sans text-anito-black focus:border-anito-blue-mid focus:outline-none w-full transition-colors"
              />
            </div>
          </div>

          <div>
            <label
              for="title"
              class="block text-[10px] tracking-[0.25em] uppercase text-anito-gray font-sans font-medium mb-2"
              >Title *</label
            >
            <input
              id="title"
              v-model="form.title"
              type="text"
              required
              class="border border-anito-gray-light rounded bg-transparent px-4 py-3 text-sm font-sans text-anito-black placeholder-anito-gray focus:border-anito-blue-mid focus:outline-none w-full transition-colors"
              placeholder="Brief description of the correction needed"
            />
          </div>

          <div>
            <label
              for="description"
              class="block text-[10px] tracking-[0.25em] uppercase text-anito-gray font-sans font-medium mb-2"
              >Description *</label
            >
            <textarea
              id="description"
              v-model="form.description"
              rows="4"
              required
              class="border border-anito-gray-light rounded bg-transparent px-4 py-3 text-sm font-sans text-anito-black placeholder-anito-gray focus:border-anito-blue-mid focus:outline-none w-full transition-colors resize-none"
              placeholder="Explain why this correction is needed and provide any relevant details..."
            />
          </div>

          <div v-if="submitError" class="text-red-600 text-sm">
            {{ submitError }}
          </div>
          <div v-if="submitSuccess" class="text-anito-black text-sm">
            {{ submitSuccess }}
          </div>

          <div class="flex gap-2 pt-2">
            <button
              type="button"
              class="border border-anito-gray-light text-anito-black text-[10px] tracking-[0.2em] uppercase px-5 py-2.5 rounded hover:border-anito-black transition-colors duration-150 font-sans font-medium"
              @click="resetForm"
            >
              Clear
            </button>
            <button
              type="submit"
              class="bg-anito-black text-white text-[10px] tracking-[0.2em] uppercase px-5 py-2.5 rounded hover:bg-anito-blue-deep transition-colors duration-150 font-sans font-medium disabled:opacity-50"
              :disabled="submitting"
            >
              {{ submitting ? "Submitting…" : "Submit Request" }}
            </button>
          </div>
        </form>
      </div>
    </section>

    <!-- Previous Requests -->
    <section class="rounded border border-anito-gray-light overflow-hidden">
      <h2
        class="text-[10px] tracking-[0.25em] uppercase text-anito-gray font-sans font-medium px-4 py-3 border-b border-anito-gray-light bg-white"
      >
        Your Previous Requests
      </h2>
      <div v-if="loading" class="p-8 space-y-2">
        <div
          class="h-0.5 w-full bg-anito-gray-light rounded-full overflow-hidden"
        >
          <div
            class="h-full bg-anito-blue-mid animate-pulse rounded-full transition-all duration-300"
            style="width: 60%"
          ></div>
        </div>
      </div>
      <div v-else-if="error" class="p-4 text-red-600 text-sm">{{ error }}</div>
      <div
        v-else-if="!userRequests.length"
        class="p-8 text-center text-anito-gray text-sm font-sans font-light"
      >
        No previous requests found.
      </div>
      <div v-else class="overflow-x-auto">
        <table class="w-full text-sm text-left">
          <thead class="bg-anito-black">
            <tr>
              <th
                class="text-anito-gray-light text-[9px] tracking-[0.25em] uppercase font-sans font-medium px-4 py-3 text-left"
              >
                Date
              </th>
              <th
                class="text-anito-gray-light text-[9px] tracking-[0.25em] uppercase font-sans font-medium px-4 py-3 text-left"
              >
                Title
              </th>
              <th
                class="text-anito-gray-light text-[9px] tracking-[0.25em] uppercase font-sans font-medium px-4 py-3 text-left"
              >
                Type
              </th>
              <th
                class="text-anito-gray-light text-[9px] tracking-[0.25em] uppercase font-sans font-medium px-4 py-3 text-left"
              >
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="request in userRequests"
              :key="request.id"
              class="bg-white hover:bg-anito-blue-light border-b border-anito-gray-light transition-colors duration-150"
            >
              <td class="px-4 py-3 text-sm font-sans text-anito-black">
                {{ formatDate(request.date) }}
              </td>
              <td class="px-4 py-3 text-sm font-sans text-anito-black">
                {{ request.rectification_title }}
              </td>
              <td class="px-4 py-3 text-sm font-sans text-anito-gray">
                {{ formatType(request.rectification_type) }}
              </td>
              <td class="px-4 py-3">
                <span
                  :class="getStatusClass(request.status)"
                  class="text-[10px] tracking-[0.2em] uppercase px-2 py-1 rounded font-sans font-medium"
                >
                  {{ request.status }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from "vue";
import { useRectificationsStore } from "@/stores/rectifications.js";
import { useAuthStore } from "@/stores/auth.js";

const rectificationsStore = useRectificationsStore();
const authStore = useAuthStore();

const form = reactive({
  date: "",
  type: "",
  timeIn: "",
  timeOut: "",
  title: "",
  description: "",
});

const userRequests = ref([]);
const loading = ref(false);
const error = ref("");

const submitting = ref(false);
const submitError = ref("");
const submitSuccess = ref("");

onMounted(async () => {
  await fetchUserRequests();
});

async function fetchUserRequests() {
  if (!authStore.profile?.id) return;

  loading.value = true;
  error.value = "";

  try {
    userRequests.value = await rectificationsStore.fetchUserRequests(
      authStore.profile.id,
    );
  } catch (err) {
    error.value = "Failed to fetch your requests";
  } finally {
    loading.value = false;
  }
}

async function submitRequest() {
  submitting.value = true;
  submitError.value = "";
  submitSuccess.value = "";

  const result = await rectificationsStore.createRequest({
    userId: authStore.profile?.id,
    attendanceId: null, // Can be enhanced to link to specific attendance record
    title: form.title.trim(),
    description: form.description.trim(),
    type: form.type,
    date: form.date,
    timeIn: form.timeIn || null,
    timeOut: form.timeOut || null,
  });

  if (result.ok) {
    submitSuccess.value =
      "Your rectification request has been submitted successfully.";
    resetForm();
    await fetchUserRequests();

    // Clear success message after 5 seconds
    setTimeout(() => {
      submitSuccess.value = "";
    }, 5000);
  } else {
    submitError.value = result.error || "Failed to submit request";
  }

  submitting.value = false;
}

function resetForm() {
  form.date = "";
  form.type = "";
  form.timeIn = "";
  form.timeOut = "";
  form.title = "";
  form.description = "";
  rectificationsStore.clearSubmitStatus();
}

function formatDate(dateString) {
  if (!dateString) return "—";
  return new Date(dateString).toLocaleDateString();
}

function formatType(type) {
  const types = {
    time_in: "Time In",
    time_out: "Time Out",
    both: "Both",
    missing: "Missing",
    other: "Other",
  };
  return types[type] || type;
}

function getStatusClass(status) {
  const classes = {
    pending: "bg-yellow-100 text-yellow-800",
    approved: "bg-green-100 text-green-800",
    rejected: "bg-red-100 text-red-800",
  };
  return classes[status] || "bg-gray-100 text-gray-800";
}
</script>
