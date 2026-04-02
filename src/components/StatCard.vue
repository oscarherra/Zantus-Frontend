<template>
  <div class="panel stat-card">
    <div class="stat-info">
      <span class="stat-label">{{ label }}</span>
      <span class="stat-value">{{ value }}</span>
    </div>
    <div class="stat-icon">
      <slot />
    </div>
  </div>
</template>

<script setup>
defineProps({
  label: String,
  value: String,
});
</script>