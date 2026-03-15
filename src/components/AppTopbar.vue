<template>
  <header class="topbar">
    <div class="topbar-row">
      <div class="topbar-title">
        <h2>{{ title }}</h2>
        <p>{{ subtitle }}</p>
      </div>

      <div class="topbar-user">
        <span class="badge-role">{{ auth.user?.role || "user" }}</span>
        <BaseButton variant="secondary" @click="handleLogout">
          <LogOut size="16" />
          Cerrar sesión
        </BaseButton>
      </div>
    </div>
  </header>
</template>

<script setup>
import { LogOut } from "lucide-vue-next";
import { useRouter } from "vue-router";
import { useAuthStore } from "../stores/auth";
import BaseButton from "./BaseButton.vue";

defineProps({
  title: String,
  subtitle: String,
});

const auth = useAuthStore();
const router = useRouter();

async function handleLogout() {
  await auth.logout();
  router.push("/login");
}
</script>