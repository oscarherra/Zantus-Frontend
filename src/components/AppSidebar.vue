<template>
  <aside class="sidebar-container">
    <div class="sidebar-logo">
      <div class="logo-icon">
        <Store size="22" stroke-width="2" />
      </div>

      <span class="logo-text">Zantu's ERP</span>

      <button class="sidebar-close" @click="$emit('close')" aria-label="Cerrar menú">
        <X size="20" />
      </button>
    </div>

    <nav class="sidebar-nav">
      <router-link
        v-if="auth.isSuperAdmin"
        to="/"
        class="nav-item"
        active-class="active"
        exact
        @click="$emit('close')"
      >
        <LayoutDashboard size="20" class="nav-icon" />
        <span>Dashboard</span>
      </router-link>

      <router-link to="/caja" class="nav-item" active-class="active" @click="$emit('close')">
        <Wallet size="20" class="nav-icon" />
        <span>Caja</span>
      </router-link>

      <router-link
        v-if="auth.isSuperAdmin"
        to="/historial"
        class="nav-item"
        active-class="active"
        @click="$emit('close')"
      >
        <ClipboardList size="20" class="nav-icon" />
        <span>Historial de caja</span>
      </router-link>

      <router-link
        v-if="auth.isSuperAdmin"
        to="/facturas"
        class="nav-item"
        active-class="active"
        @click="$emit('close')"
      >
        <Receipt size="20" class="nav-icon" />
        <span>Facturas</span>
      </router-link>

      <router-link to="/compras" class="nav-item" active-class="active" @click="$emit('close')">
        <ShoppingCart size="20" class="nav-icon" />
        <span>Lista de compras</span>
      </router-link>

      <router-link to="/fiados" class="nav-item" active-class="active" @click="$emit('close')">
        <Users size="20" class="nav-icon" />
        <span>Fiados</span>
      </router-link>
    </nav>

    <div class="sidebar-footer">
      <button @click="logout" class="btn-logout">
        <LogOut size="20" class="nav-icon" />
        <span>Cerrar Sesión</span>
      </button>
    </div>
  </aside>
</template>

<script setup>
import { useRouter } from "vue-router";
import { useAuthStore } from "../stores/auth";

import {
  Store,
  LayoutDashboard,
  Wallet,
  Receipt,
  LogOut,
  X,
  ClipboardList,
  ShoppingCart,
  Users,
} from "lucide-vue-next";

defineEmits(["close"]);

const router = useRouter();
const auth = useAuthStore();

async function logout() {
  await auth.logout();
  router.push("/login");
}
</script>

<style scoped>
.sidebar-container {
  width: 280px;
  min-width: 280px;
  max-width: 280px;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: var(--color-bg-surface, #ffffff);
  border-right: 1px solid var(--color-border, #e5e7eb);
  overflow: hidden;
}

.sidebar-logo {
  min-height: 72px;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 24px;
  border-bottom: 1px solid var(--color-border, #e5e7eb);
}

.logo-icon {
  width: 38px;
  height: 38px;
  background-color: var(--color-brand, #2563eb);
  color: white;
  border-radius: var(--radius-md, 10px);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 10px rgba(37, 99, 235, 0.2);
  flex-shrink: 0;
}

.logo-text {
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--color-text-primary, #18181b);
  letter-spacing: -0.02em;
  white-space: nowrap;
}

.sidebar-close {
  display: none;
  background: none;
  border: none;
  cursor: pointer;
  color: var(--color-text-secondary, #71717a);
  padding: 6px;
  border-radius: 8px;
  margin-left: auto;
}

.sidebar-close:hover {
  background-color: var(--color-border, #e5e7eb);
  color: var(--color-text-primary, #18181b);
}

.sidebar-nav {
  flex: 1;
  padding: 24px 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.nav-item {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-radius: var(--radius-md, 10px);
  color: var(--color-text-secondary, #52525b);
  text-decoration: none;
  font-weight: 500;
  transition: all 0.2s ease;
  box-sizing: border-box;
}

.nav-item:hover {
  background-color: #f4f4f5;
  color: var(--color-text-primary, #18181b);
  text-decoration: none;
}

.nav-item.active {
  background-color: var(--color-brand-alpha, #e8efff);
  color: var(--color-brand, #2563eb);
  font-weight: 600;
  text-decoration: none;
}

.nav-icon {
  flex-shrink: 0;
}

.sidebar-footer {
  padding: 24px 16px;
  border-top: 1px solid var(--color-border, #e5e7eb);
}

.btn-logout {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-radius: var(--radius-md, 10px);
  background: transparent;
  border: none;
  color: var(--color-danger, #ef4444);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 1rem;
  text-align: left;
}

.btn-logout:hover {
  background-color: var(--color-danger-alpha, #fee2e2);
}

@media (max-width: 1024px) {
  .sidebar-close {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .sidebar-logo {
    min-height: 60px;
    padding: 0 18px;
  }

  .sidebar-nav {
    padding: 18px 12px;
  }

  .sidebar-footer {
    padding: 18px 12px;
  }
}
</style>