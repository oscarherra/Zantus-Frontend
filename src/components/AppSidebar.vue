<template>
  <aside class="sidebar">
    <div class="sidebar-brand">
      <div class="sidebar-brand-logo">
        <Store size="20" />
      </div>
      <div>
        <h1>Zantu's Food ERP</h1>
        <p>Gestión operativa y caja</p>
      </div>
    </div>

    <nav class="sidebar-nav">
      <router-link class="sidebar-link" to="/">
        <LayoutDashboard size="18" />
        <span>Dashboard</span>
      </router-link>

      <router-link class="sidebar-link" to="/caja">
        <Wallet size="18" />
        <span>Caja</span>
      </router-link>

      <router-link
        v-if="auth.user?.role === 'admin'"
        class="sidebar-link"
        to="/facturas"
      >
        <ReceiptText size="18" />
        <span>Facturas</span>
      </router-link>
    </nav>
  </aside>
</template>

<script setup>
import { LayoutDashboard, Wallet, ReceiptText, Store } from "lucide-vue-next";
import { useAuthStore } from "../stores/auth";

const auth = useAuthStore();
</script>