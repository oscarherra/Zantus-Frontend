<template>
  <div class="layout-wrapper">
    <div
      v-if="sidebarOpen && isMobileSidebar"
      class="sidebar-overlay"
      @click="sidebarOpen = false"
    ></div>

    <aside
      class="layout-sidebar"
      :class="{
        'sidebar-mobile': isMobileSidebar,
        'sidebar-open': sidebarOpen
      }"
    >
      <AppSidebar @close="sidebarOpen = false" />
    </aside>

    <div class="layout-main">
      <header class="layout-header">
        <button
          v-if="isMobileSidebar"
          class="menu-toggle"
          @click="sidebarOpen = true"
          aria-label="Abrir menú"
        >
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
import { ref, onMounted, onBeforeUnmount } from "vue";
import { Menu } from "lucide-vue-next";
import AppSidebar from "../components/AppSidebar.vue";
import AppTopbar from "../components/AppTopbar.vue";

defineProps({
  title: String,
  subtitle: String,
});

const sidebarOpen = ref(false);
const isMobileSidebar = ref(false);

function checkSidebarMode() {
  isMobileSidebar.value = window.innerWidth <= 1280;

  if (!isMobileSidebar.value) {
    sidebarOpen.value = false;
  }
}

onMounted(() => {
  checkSidebarMode();
  window.addEventListener("resize", checkSidebarMode);
});

onBeforeUnmount(() => {
  window.removeEventListener("resize", checkSidebarMode);
});
</script>

<style scoped>
.layout-wrapper {
  height: 100vh;
  display: flex;
  background-color: var(--color-bg-base);
  overflow: hidden;
  position: relative;
}

/* SIDEBAR DESKTOP */
.layout-sidebar {
  width: 260px;
  height: 100vh;
  flex-shrink: 0;
  background-color: var(--color-bg-surface);
  border-right: 1px solid var(--color-border);
  position: sticky;
  top: 0;
  left: 0;
  z-index: 50;
  overflow: hidden;
}

/* MAIN */
.layout-main {
  flex: 1;
  min-width: 0;
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* HEADER */
.layout-header {
  height: 72px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 0 24px;
  border-bottom: 1px solid var(--color-border);
  background-color: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(12px);
  position: sticky;
  top: 0;
  z-index: 30;
}

/* SOLO ESTA PARTE SCROLLEA */
.layout-content {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  overflow-x: hidden;
}

.content-container {
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
  padding: 28px 24px;
}

.menu-toggle {
  display: inline-flex;
  align-items: center;
  justify-content: center;
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

/* Ocultar botón en desktop */
.layout-sidebar:not(.sidebar-mobile) + .layout-main .menu-toggle {
  display: none;
}

.sidebar-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  z-index: 40;
}

/* SIDEBAR MOBILE / TABLET */
.sidebar-mobile {
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  transform: translateX(-100%);
  transition: transform 0.25s ease;
  box-shadow: var(--shadow-lg);
}

.sidebar-mobile.sidebar-open {
  transform: translateX(0);
}

@media (max-width: 1280px) {
  .layout-header {
    padding: 0 20px;
  }

  .content-container {
    padding: 24px 20px;
  }
}

@media (max-width: 640px) {
  .layout-header {
    height: 60px;
    padding: 0 16px;
    gap: 12px;
  }

  .content-container {
    padding: 16px;
  }

  .layout-sidebar {
    width: min(85vw, 300px);
  }
}
</style>