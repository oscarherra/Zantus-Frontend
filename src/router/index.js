import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "../stores/auth";

import LoginView from "../views/LoginView.vue";
import DashboardView from "../views/DashboardView.vue";
import CajaView from "../views/CajaView.vue";
import FacturasView from "../views/FacturasView.vue";
import HistorialCajaView from "../views/HistorialCajaView.vue";
import ListaComprasView from "../views/ListacomprasView.vue";
import FiadosView from "../views/FiadosView.vue";

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
    path: "/historial",
    name: "historial",
    component: HistorialCajaView,
    meta: { auth: true },
  },
  {
    path: "/facturas",
    name: "facturas",
    component: FacturasView,
    meta: { auth: true },
  },
  {
    path: "/compras",
    name: "compras",
    component: ListaComprasView,
    meta: { auth: true },
  },
  {
    path: "/fiados",
    name: "fiados",
    component: FiadosView,
    meta: { auth: true },
  },
  {
    path: "/:pathMatch(.*)*",
    redirect: "/",
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

  return true;
});

export default router;