<template>
  <section class="panel">
    <div v-if="title || subtitle" class="panel-header">
      <h3 class="panel-title">{{ title }}</h3>
      <p v-if="subtitle" class="panel-subtitle">{{ subtitle }}</p>
    </div>
    <div class="panel-body">
      <slot />
    </div>
  </section>
</template>

<script setup>
defineProps({
  title: String,
  subtitle: String,
});
</script>