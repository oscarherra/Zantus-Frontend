import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "../stores/auth";

import LoginView from "../views/LoginView.vue";
import DashboardView from "../views/DashboardView.vue";
import CajaView from "../views/CajaView.vue";
import FacturasView from "../views/FacturasView.vue";

const routes = [
  {
    path: "/login",
    name: "login",
    component: LoginView,
  },
  {
    path: "/",
    name: "dashboard",
    component: DashboardView,
    meta: { auth: true },
  },
  {
    path: "/caja",
    name: "caja",
    component: CajaView,
    meta: { auth: true },
  },
  {
    path: "/facturas",
    name: "facturas",
    component: FacturasView,
    meta: { auth: true, adminOnly: true },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach(async (to) => {
  const auth = useAuthStore();

  if (auth.token && !auth.user) {
    try {
      await auth.fetchMe();
    } catch (error) {
      await auth.logout();
      return "/login";
    }
  }

  if (to.meta.auth && !auth.isAuthenticated) {
    return "/login";
  }

  if (to.path === "/login" && auth.isAuthenticated) {
    return "/";
  }

  if (to.meta.adminOnly && auth.user?.role !== "admin") {
    return "/";
  }
});

export default router;