<template>
  <div class="layout-wrapper">
    <!-- Mobile overlay -->
    <div
      v-if="sidebarOpen"
      class="sidebar-overlay"
      @click="sidebarOpen = false"
    />

    <aside class="layout-sidebar" :class="{ 'sidebar-open': sidebarOpen }">
      <AppSidebar @close="sidebarOpen = false" />
    </aside>

    <div class="layout-main">
      <header class="layout-header">
        <button class="menu-toggle" @click="sidebarOpen = true" aria-label="Abrir menú">
          <Menu size="22" />
        </button>
        <AppTopbar :title="title" :subtitle="subtitle" />
      </header>

      <main class="layout-content">
        <div class="content-container">
          <slot />
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { Menu } from "lucide-vue-next";
import AppSidebar from "../components/AppSidebar.vue";
import AppTopbar from "../components/AppTopbar.vue";

defineProps({
  title: String,
  subtitle: String,
});

const sidebarOpen = ref(false);
</script>

<style scoped>
.layout-wrapper {
  display: flex;
  min-height: 100vh;
  background-color: var(--color-bg);
  position: relative;
}

/* Sidebar overlay for mobile */
.sidebar-overlay {
  display: none;
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  z-index: 40;
}

.layout-sidebar {
  width: 260px;
  flex-shrink: 0;
  height: 100vh;
  position: sticky;
  top: 0;
  border-right: 1px solid var(--color-border);
  background-color: var(--color-bg-surface);
  z-index: 50;
  transition: transform 0.25s ease;
}

.layout-main {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.layout-header {
  height: 72px;
  border-bottom: 1px solid var(--color-border);
  background-color: var(--color-bg-surface);
  padding: 0 24px;
  display: flex;
  align-items: center;
  gap: 16px;
  position: sticky;
  top: 0;
  z-index: 30;
}

.menu-toggle {
  display: none;
  background: none;
  border: none;
  cursor: pointer;
  color: var(--color-text-primary);
  padding: 6px;
  border-radius: 8px;
  flex-shrink: 0;
}

.menu-toggle:hover {
  background-color: var(--color-border);
}

.layout-content {
  flex: 1;
  overflow-y: auto;
}

.content-container {
  padding: 28px 24px;
  max-width: 1400px;
  margin: 0 auto;
}

/* ── Tablet ── */
@media (max-width: 1024px) {
  .layout-sidebar {
    position: fixed;
    top: 0;
    left: 0;
    height: 100vh;
    transform: translateX(-100%);
  }

  .layout-sidebar.sidebar-open {
    transform: translateX(0);
  }

  .sidebar-overlay {
    display: block;
  }

  .menu-toggle {
    display: flex;
    align-items: center;
    justify-content: center;
  }
}

/* ── Mobile ── */
@media (max-width: 640px) {
  .layout-header {
    padding: 0 16px;
    height: 60px;
  }

  .content-container {
    padding: 16px;
  }
}
</style>