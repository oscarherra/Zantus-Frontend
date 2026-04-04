<template>
  <div class="sidebar-container">
    <div class="sidebar-logo">
      <div class="logo-icon">
        <Store size="24" stroke-width="2" />
      </div>
      <span class="logo-text">Zantu's ERP</span>
      <button class="sidebar-close" @click="$emit('close')" aria-label="Cerrar menú">
        <X size="20" />
      </button>
    </div>

    <nav class="sidebar-nav">
      <router-link to="/" class="nav-item" active-class="active" exact @click="$emit('close')">
        <LayoutDashboard size="20" class="nav-icon" />
        <span>Dashboard</span>
      </router-link>

      <router-link to="/caja" class="nav-item" active-class="active" @click="$emit('close')">
        <Wallet size="20" class="nav-icon" />
        <span>Caja del día</span>
      </router-link>

      <router-link to="/facturas" class="nav-item" active-class="active" @click="$emit('close')">
        <Receipt size="20" class="nav-icon" />
        <span>Facturas</span>
      </router-link>
    </nav>

    <div class="sidebar-footer">
      <button @click="logout" class="btn-logout">
        <LogOut size="20" class="nav-icon" />
        <span>Cerrar Sesión</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { Store, LayoutDashboard, Wallet, Receipt, LogOut, X } from 'lucide-vue-next';

defineEmits(['close']);

const router = useRouter();
const auth = useAuthStore();

function logout() {
  auth.logout();
  router.push('/login');
}
</script>

<style scoped>
.sidebar-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: var(--color-bg-surface);
}

.sidebar-logo {
  min-height: 72px;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 24px;
  border-bottom: 1px solid var(--color-border);
}

.logo-icon {
  width: 36px;
  height: 36px;
  background-color: var(--color-brand);
  color: white;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 10px rgba(37, 99, 235, 0.2);
  flex-shrink: 0;
}

.logo-text {
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--color-text-primary);
  letter-spacing: -0.02em;
  flex: 1;
  min-width: 0;
}

.sidebar-close {
  display: none;
  background: none;
  border: none;
  cursor: pointer;
  color: var(--color-text-secondary);
  padding: 6px;
  border-radius: 8px;
  margin-left: auto;
}

.sidebar-close:hover {
  background-color: var(--color-border);
  color: var(--color-text-primary);
}

.sidebar-nav {
  flex: 1;
  padding: 24px 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-radius: var(--radius-md);
  color: var(--color-text-secondary);
  text-decoration: none;
  font-weight: 500;
  transition: all 0.2s ease;
  min-width: 0;
}

.nav-item:hover {
  background-color: #f4f4f5;
  color: var(--color-text-primary);
}

.nav-item.active {
  background-color: var(--color-brand-alpha);
  color: var(--color-brand);
  font-weight: 600;
}

.nav-icon {
  flex-shrink: 0;
}

.sidebar-footer {
  padding: 24px 16px;
  border-top: 1px solid var(--color-border);
}

.btn-logout {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-radius: var(--radius-md);
  background: transparent;
  border: none;
  color: var(--color-danger);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 1rem;
}

.btn-logout:hover {
  background-color: var(--color-danger-alpha);
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