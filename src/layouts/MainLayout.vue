<template>
  <div class="app-shell">
    <AppSidebar />

    <div class="main-area">
      <AppTopbar :title="title" :subtitle="subtitle" />
      <main class="content">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup>
import AppSidebar from "../components/AppSidebar.vue";
import AppTopbar from "../components/AppTopbar.vue";

defineProps({
  title: String,
  subtitle: String,
});
</script>