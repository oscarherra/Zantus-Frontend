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
    meta: { auth: true },
  },
  // Catch-all: Si alguien escribe una URL que no existe, lo manda al inicio
  {
    path: "/:pathMatch(.*)*",
    redirect: "/",
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach(async (to) => {
  const auth = useAuthStore();

  // 1. Restaurar sesión si hay token guardado pero el usuario no está en memoria
  if (auth.token && !auth.user) {
    try {
      await auth.fetchMe();
    } catch (error) {
      await auth.logout();
      return "/login";
    }
  }

  // 2. Proteger rutas que requieren autenticación
  if (to.meta.auth && !auth.isAuthenticated) {
    return "/login";
  }

  // 3. Evitar que un usuario que ya inició sesión vuelva a entrar a la pantalla de login
  if (to.path === "/login" && auth.isAuthenticated) {
    return "/";
  }

  // 4. Proteger rutas exclusivas de administrador (como Facturas)
  if (to.meta.adminOnly && auth.user?.role !== "admin") {
    return "/";
  }
});

export default router;