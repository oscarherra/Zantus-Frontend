<template>
  <div class="login-container">
    <div class="login-brand">
      <div class="brand-content">
        <div class="logo-box">
          <Store size="48" stroke-width="1.5" />
        </div>
        <h1 class="brand-name">Zantu's ERP</h1>
        <p class="brand-tagline">
          Plataforma integral para la gestión avanzada de operaciones y recursos gastronómicos.
        </p>
      </div>
      <div class="brand-pattern"></div>
    </div>

    <div class="login-form-section">
      <div class="form-wrapper">
        <div class="form-header">
          <div class="mobile-logo">
            <Store size="32" stroke-width="1.5" />
          </div>
          <h2>Bienvenido</h2>
          <p>Ingresa tus credenciales para acceder al sistema</p>
        </div>

        <form @submit.prevent="submit" class="form-body">
          <div class="input-group">
            <label>Correo electrónico</label>
            <input
              v-model="email"
              type="email"
              placeholder="admin@zantu.com"
              required
            />
          </div>

          <div class="input-group">
            <label>Contraseña</label>
            <input
              v-model="password"
              type="password"
              placeholder="••••••••"
              required
            />
          </div>

          <div v-if="error" class="error-alert">
            {{ error }}
          </div>

          <button type="submit" class="btn-submit" :disabled="loading">
            <LogIn v-if="!loading" size="20" />
            <span>{{ loading ? 'Ingresando...' : 'Iniciar sesión' }}</span>
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { LogIn, Store } from "lucide-vue-next";
import { useAuthStore } from "../stores/auth";

const email = ref("admin@zantu.com");
const password = ref("Admin1234*");
const error = ref("");
const loading = ref(false);

const auth = useAuthStore();
const router = useRouter();

async function submit() {
  error.value = "";
  loading.value = true;
  try {
    await auth.login(email.value, password.value);
    await auth.fetchMe();
    router.push("/");
  } catch (e) {
    error.value = e?.response?.data?.message || "Credenciales incorrectas. Verifica tu correo y contraseña.";
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.login-container {
  display: flex;
  min-height: 100vh;
  width: 100vw;
  font-family: inherit;
  background-color: #ffffff;
}

/* Brand panel - hidden on mobile, shown on desktop */
.login-brand {
  flex: 1;
  display: none;
  background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%);
  color: white;
  position: relative;
  overflow: hidden;
  align-items: center;
  justify-content: center;
  padding: 40px;
}

@media (min-width: 1024px) {
  .login-brand {
    display: flex;
  }
}

.brand-content {
  position: relative;
  z-index: 2;
  max-width: 480px;
}

.logo-box {
  width: 80px;
  height: 80px;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 32px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
}

.brand-name {
  font-size: 3.5rem;
  font-weight: 800;
  margin-bottom: 16px;
  letter-spacing: -0.03em;
  line-height: 1.1;
}

.brand-tagline {
  font-size: 1.2rem;
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.85);
  font-weight: 400;
}

.brand-pattern {
  position: absolute;
  inset: 0;
  background-image: radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0);
  background-size: 32px 32px;
  opacity: 0.5;
  z-index: 1;
}

/* Form section */
.login-form-section {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px 20px;
  background-color: #ffffff;
}

.form-wrapper {
  width: 100%;
  max-width: 400px;
}

.mobile-logo {
  display: none;
  width: 52px;
  height: 52px;
  background: linear-gradient(135deg, #1e3a8a, #2563eb);
  color: white;
  border-radius: 14px;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
}

.form-header {
  margin-bottom: 36px;
  text-align: center;
}

.form-header h2 {
  font-size: 1.875rem;
  font-weight: 700;
  color: #111827;
  margin-bottom: 8px;
  letter-spacing: -0.02em;
}

.form-header p {
  color: #6b7280;
  font-size: 0.95rem;
}

.form-body {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 7px;
}

.input-group label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
}

.input-group input {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #d1d5db;
  border-radius: 12px;
  font-size: 1rem;
  color: #111827;
  background-color: #f9fafb;
  transition: all 0.2s ease;
  box-sizing: border-box;
}

.input-group input:focus {
  outline: none;
  border-color: #2563eb;
  background-color: #ffffff;
  box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.1);
}

.input-group input::placeholder {
  color: #9ca3af;
}

.btn-submit {
  width: 100%;
  padding: 13px;
  background-color: #2563eb;
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-top: 8px;
}

.btn-submit:hover:not(:disabled) {
  background-color: #1d4ed8;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.25);
}

.btn-submit:disabled {
  background-color: #93c5fd;
  cursor: not-allowed;
}

.error-alert {
  padding: 12px 16px;
  background-color: #fef2f2;
  border: 1px solid #fecaca;
  color: #b91c1c;
  border-radius: 10px;
  font-size: 0.875rem;
  text-align: center;
}

/* Mobile-only: show logo icon in form */
@media (max-width: 1023px) {
  .mobile-logo {
    display: flex;
  }
}

/* Small mobile */
@media (max-width: 400px) {
  .login-form-section {
    padding: 20px 16px;
    align-items: flex-start;
    padding-top: 40px;
  }

  .form-header h2 {
    font-size: 1.5rem;
  }
}
</style>