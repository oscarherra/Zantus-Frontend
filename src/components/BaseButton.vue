<template>
  <button :class="classes">
    <slot />
  </button>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  variant: {
    type: String,
    default: "primary",
  },
});

const classes = computed(() => {
  return [
    "button",
    props.variant === "primary" && "button-primary",
    props.variant === "secondary" && "button-secondary",
    props.variant === "danger" && "button-danger",
  ];
});
</script>