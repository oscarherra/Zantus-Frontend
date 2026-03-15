<template>
  <div class="login-page">
    <section class="login-card">
      <div class="login-brand">
        <div class="login-brand-logo">
          <Store size="24" />
        </div>
        <div>
          <h1 class="login-title">Zantu's Food ERP</h1>
          <p class="login-subtitle">Ingreso seguro al sistema</p>
        </div>
      </div>

      <form class="form-grid" @submit.prevent="submit">
        <label class="label">
          Correo electrónico
          <input
            v-model="email"
            class="input"
            type="email"
            placeholder="admin@zantu.com"
          />
        </label>

        <label class="label">
          Contraseña
          <input
            v-model="password"
            class="input"
            type="password"
            placeholder="Ingrese su contraseña"
          />
        </label>

        <BaseButton variant="primary">
          <LogIn size="16" />
          Ingresar
        </BaseButton>

        <div v-if="error" class="error-box">
          {{ error }}
        </div>
      </form>
    </section>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { LogIn, Store } from "lucide-vue-next";
import { useAuthStore } from "../stores/auth";
import BaseButton from "../components/BaseButton.vue";

const email = ref("admin@zantu.com");
const password = ref("Admin1234*");
const error = ref("");

const auth = useAuthStore();
const router = useRouter();

async function submit() {
  error.value = "";

  try {
    await auth.login(email.value, password.value);
    await auth.fetchMe();
    router.push("/");
  } catch (e) {
    error.value = e?.response?.data?.message || "No se pudo iniciar sesión.";
  }
}
</script>