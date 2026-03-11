import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "@/stores/auth.js";

const routes = [
  {
    path: "/login",
    name: "login",
    component: () => import("@/views/auth/LoginView.vue"),
    meta: { public: true },
  },
  {
    path: "/register",
    name: "register",
    component: () => import("@/views/auth/RegisterView.vue"),
    meta: { public: true },
  },
  {
    path: "/",
    component: () => import("@/components/layout/AppShell.vue"),
    meta: { requiresAuth: true },
    children: [
      { path: "", redirect: { name: "dashboard" } },
      {
        path: "dashboard",
        name: "dashboard",
        component: () => import("@/views/manager/DashboardView.vue"),
        meta: { managerOnly: true },
      },
      {
        path: "employees",
        name: "employees",
        component: () => import("@/views/manager/EmployeesView.vue"),
        meta: { managerOnly: true },
      },
      {
        path: "attendance",
        name: "attendance",
        component: () => import("@/views/manager/AttendanceView.vue"),
        meta: { managerOnly: true },
      },
      {
        path: "import",
        name: "import",
        component: () => import("@/views/manager/ImportView.vue"),
        meta: { managerOnly: true },
      },
      {
        path: "rectifications",
        name: "rectifications",
        component: () => import("@/views/manager/RectificationsView.vue"),
        meta: { managerOnly: true },
      },
      {
        path: "overtime",
        name: "manager-overtime",
        component: () => import("@/views/manager/OvertimeView.vue"),
        meta: { managerOnly: true },
      },
      {
        path: "settings",
        name: "settings",
        component: () => import("@/views/manager/SettingsView.vue"),
        meta: { managerOnly: true },
      },
      {
        path: "holidays",
        name: "holidays",
        component: () => import("@/views/manager/HolidaysView.vue"),
        meta: { managerOnly: true },
      },
      {
        path: "my-attendance",
        name: "my-attendance",
        component: () => import("@/views/employee/MyAttendanceView.vue"),
        meta: { employeeOnly: true },
      },
      {
        path: "rectify",
        name: "rectify",
        component: () => import("@/views/employee/RectifyView.vue"),
        meta: { employeeOnly: true },
      },
      {
        path: "my-overtime",
        name: "employee-overtime",
        component: () => import("@/views/employee/OvertimeView.vue"),
        meta: { employeeOnly: true },
      },
    ],
  },
  {
    path: "/:pathMatch(.*)*",
    name: "not-found",
    component: () => import("@/views/NotFoundView.vue"),
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach(async (to, _from, next) => {
  const auth = useAuthStore();

  // Simple timeout protection
  const timeout = setTimeout(() => {
    if (import.meta.env.DEV) {
      console.warn("Router timeout - proceeding");
    }
    next({ name: "login" });
  }, 2000);

  try {
    if (!auth.user && !auth.loading) {
      await auth.init();
    }
  } catch (err) {
    if (import.meta.env.DEV) {
      console.error("Router auth error:", err);
    }
  } finally {
    clearTimeout(timeout);
  }

  // Public routes
  if (to.meta.public) {
    if (auth.isAuthenticated) {
      const role = auth.role;
      if (["admin", "manager", "supervisor"].includes(role)) {
        next({ name: "dashboard" });
      } else if (role === "employee") {
        next({ name: "my-attendance" });
      } else {
        next({ name: "login" });
      }
    } else {
      next();
    }
    return;
  }

  // Protected routes
  if (!auth.isAuthenticated) {
    next({ name: "login", query: { redirect: to.fullPath } });
    return;
  }

  // Role-based access
  const role = auth.role;
  const canAccessManagerRoutes = ["admin", "manager", "supervisor"].includes(
    role,
  );

  if (to.meta.managerOnly && !canAccessManagerRoutes) {
    next({ name: "my-attendance" });
    return;
  }

  if (to.meta.employeeOnly && role !== "employee") {
    next({ name: "dashboard" });
    return;
  }

  next();
});

export default router;
