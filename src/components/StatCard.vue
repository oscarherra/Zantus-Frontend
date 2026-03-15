<template>
  <section class="panel stat-card">
    <div class="stat-top">
      <div>
        <div class="stat-label">{{ label }}</div>
        <div class="stat-value">{{ value }}</div>
      </div>
      <div class="stat-icon">
        <slot />
      </div>
    </div>
  </section>
</template>

<script setup>
defineProps({
  label: String,
  value: String,
});
</script>