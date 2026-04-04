<template>
  <MainLayout
    title="Caja del día"
    subtitle="Apertura, movimientos, cierre y control operativo"
  >
    <div class="grid grid-2">
      <AppPanel
        title="Estado de caja"
        subtitle="Sesión de caja activa o cerrada"
      >
        <div v-if="cash" class="form-grid">
          <div class="cash-status-box">
            <div>
              <div class="muted">Estado actual</div>
              <strong :style="{ color: cash.status === 'open' ? 'var(--color-success)' : 'var(--color-danger)' }">
                {{ cash.status === "open" ? "Abierta" : "Cerrada" }}
              </strong>
            </div>
            <div class="text-right">
              <div class="muted">Apertura</div>
              <strong class="amount-display">{{ currency(cash.opening_amount) }}</strong>
            </div>
          </div>

          <div v-if="cash.status === 'closed'" class="success-box">
            <strong>Caja cerrada</strong><br />
            Monto de cierre reportado: {{ currency(cash.closing_amount) }}.
          </div>

          <form v-if="cash.status === 'open'" class="form-grid" @submit.prevent="closeCash">
            <label class="label">
              Monto contado al cierre en colones
              <input
                v-model.number="closing"
                class="input"
                type="number"
                min="0"
                step="0.01"
                placeholder="Ej. 150000"
                required
              />
            </label>
            <button type="submit" class="btn btn-secondary">
              <Lock size="18" /> Cerrar caja
            </button>
          </form>

          <button
            v-if="cash.status === 'closed'"
            type="button"
            class="btn btn-primary mt-4"
            @click="cash = null"
          >
            <LockOpen size="18" /> Iniciar nueva caja
          </button>
        </div>

        <form v-else class="form-grid" @submit.prevent="openCash">
          <label class="label">
            Monto inicial en caja (Fondo)
            <input
              v-model.number="opening"
              class="input"
              type="number"
              min="0"
              step="0.01"
              placeholder="Ej. 25000"
              required
            />
          </label>
          <button type="submit" class="btn btn-primary">
            <LockOpen size="18" /> Abrir caja
          </button>
        </form>

        <div v-if="success" class="success-box mt-4">{{ success }}</div>
        <div v-if="error" class="error-box mt-4">{{ error }}</div>
      </AppPanel>

      <AppPanel
        title="Registrar movimiento"
        subtitle="Ingresos y egresos rápidos"
      >
        <form class="form-grid" @submit.prevent="addTransaction">
          <div class="form-grid two">
            <label class="label">
              Tipo de movimiento
              <select v-model="form.type" class="select">
                <option value="income">Ingreso (+)</option>
                <option value="expense">Gasto (-)</option>
              </select>
            </label>

            <label class="label">
              Método de pago
              <select v-model="form.payment_method" class="select">
                <option value="cash">Efectivo</option>
                <option value="sinpe">SINPE Móvil</option>
                <option value="card">Tarjeta</option>
              </select>
            </label>
          </div>

          <div class="form-grid two">
            <label class="label">
              Categoría (Opcional)
              <select v-model="form.category_id" class="select">
                <option value="">Ninguna</option>
                <option v-for="item in categories" :key="item.id" :value="item.id">
                  {{ item.name }}
                </option>
              </select>
            </label>

            <label class="label">
              Monto (₡)
              <input
                v-model.number="form.amount"
                class="input"
                type="number"
                min="0.01"
                step="0.01"
                placeholder="0.00"
                required
              />
            </label>
          </div>

          <label class="label">
            Descripción / Detalle
            <textarea
              v-model="form.description"
              class="textarea"
              placeholder="¿Por qué se hace este movimiento?"
              required
            ></textarea>
          </label>

          <button type="submit" class="btn btn-primary" :disabled="!cash || cash.status !== 'open'">
            <Plus size="18" /> Registrar transacción
          </button>
        </form>
      </AppPanel>
    </div>

    <AppPanel
      title="Movimientos de esta caja"
      subtitle="Listado de ingresos y egresos de la sesión actual"
    >
      <div v-if="transactions.length" class="table-wrap">
        <table class="table hide-mobile">
          <thead>
            <tr>
              <th>Hora</th>
              <th>Tipo</th>
              <th>Categoría</th>
              <th>Método</th>
              <th>Descripción</th>
              <th>Monto</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in transactions" :key="item.id">
              <td class="muted-cell">{{ formatDateTime(item.happened_at) }}</td>
              <td>
                <span :class="item.type === 'income' ? 'type-income' : 'type-expense'">
                  {{ item.type === "income" ? "Ingreso" : "Gasto" }}
                </span>
              </td>
              <td>{{ item.category?.name || "-" }}</td>
              <td>{{ paymentLabel(item.payment_method) }}</td>
              <td>{{ item.description || "-" }}</td>
              <td><strong>{{ currency(item.amount) }}</strong></td>
            </tr>
          </tbody>
        </table>

        <div class="mobile-cards show-mobile">
          <div v-for="item in transactions" :key="item.id" class="mobile-card">
            <div class="mobile-card-row">
              <span :class="item.type === 'income' ? 'type-income' : 'type-expense'">
                {{ item.type === "income" ? "Ingreso" : "Gasto" }}
              </span>
              <strong>{{ currency(item.amount) }}</strong>
            </div>
            <div class="mobile-card-meta">
              <span>{{ formatDateTime(item.happened_at) }}</span>
              <span>{{ paymentLabel(item.payment_method) }}</span>
              <span v-if="item.category?.name">{{ item.category.name }}</span>
            </div>
            <div v-if="item.description" class="mobile-card-desc">{{ item.description }}</div>
          </div>
        </div>
      </div>

      <EmptyState v-else>
        No hay movimientos registrados en la caja actual.
      </EmptyState>
    </AppPanel>
  </MainLayout>
</template>

<script setup>
import { onMounted, reactive, ref, watch } from "vue";
import { Plus, LockOpen, Lock } from "lucide-vue-next";
import api from "../services/api";
import MainLayout from "../layouts/MainLayout.vue";
import AppPanel from "../components/AppPanel.vue";
import EmptyState from "../components/EmptyState.vue";

const cash = ref(null);
const categories = ref([]);
const transactions = ref([]);
const opening = ref(0);
const closing = ref(0);
const success = ref("");
const error = ref("");

const form = reactive({
  type: "income",
  category_id: "",
  amount: "",
  payment_method: "cash",
  description: "",
});

function currency(value) {
  return new Intl.NumberFormat("es-CR", {
    style: "currency",
    currency: "CRC",
    maximumFractionDigits: 2,
  }).format(Number(value || 0));
}

function formatDateTime(value) {
  return new Date(value).toLocaleTimeString("es-CR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function paymentLabel(method) {
  const map = { cash: "Efectivo", sinpe: "SINPE", card: "Tarjeta" };
  return map[method] || method;
}

function clearMessages() {
  success.value = "";
  error.value = "";
}

async function loadTodayCash() {
  const { data } = await api.get("/cash-sessions/today");
  cash.value = data.cash_session;
  if (cash.value) await loadTransactions();
}

async function loadTransactions() {
  const { data } = await api.get("/transactions", {
    params: { cash_session_id: cash.value?.id },
  });
  transactions.value = data.transactions?.data || [];
}

async function loadCategories() {
  const { data } = await api.get("/categories", { params: { type: form.type } });
  categories.value = data.categories || [];

  if (form.category_id && !categories.value.find((item) => item.id === form.category_id)) {
    form.category_id = "";
  }
}

async function openCash() {
  clearMessages();
  try {
    const { data } = await api.post("/cash-sessions/open", {
      opening_amount: opening.value,
    });
    cash.value = data.cash_session;
    success.value = "Caja abierta correctamente.";
    opening.value = 0;
    await loadTransactions();
  } catch (e) {
    error.value = e?.response?.data?.message || "No se pudo abrir la caja.";
  }
}

async function closeCash() {
  clearMessages();
  try {
    const { data } = await api.post(`/cash-sessions/${cash.value.id}/close`, {
      closing_amount: closing.value,
    });
    cash.value = data.cash_session;
    success.value = "Caja cerrada correctamente.";
    closing.value = 0;
  } catch (e) {
    error.value = e?.response?.data?.message || "No se pudo cerrar la caja.";
  }
}

async function addTransaction() {
  clearMessages();

  if (!cash.value || cash.value.status !== "open") {
    error.value = "Debe existir una caja abierta para registrar movimientos.";
    return;
  }

  const payload = { ...form, cash_session_id: cash.value.id };
  if (!payload.category_id) payload.category_id = null;

  try {
    await api.post("/transactions", payload);
    success.value = "Movimiento registrado correctamente.";
    form.amount = "";
    form.description = "";
    await loadTransactions();
  } catch (e) {
    error.value = e?.response?.data?.message || "No se pudo registrar el movimiento.";
  }
}

watch(
  () => form.type,
  async () => {
    await loadCategories();
  }
);

onMounted(async () => {
  await Promise.all([loadTodayCash(), loadCategories()]);
});
</script>

<style scoped>
.cash-status-box {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #f8fafc;
  padding: 16px;
  border-radius: 8px;
  border: 1px solid var(--color-border);
  gap: 12px;
  flex-wrap: wrap;
}

.text-right {
  text-align: right;
}

.amount-display {
  font-size: 1.05rem;
}

.mt-4 {
  margin-top: 16px;
}

.type-income {
  color: var(--color-success);
  font-weight: 500;
}

.type-expense {
  color: var(--color-danger);
  font-weight: 500;
}

.muted-cell {
  color: var(--color-text-secondary);
}

.hide-mobile {
  display: table;
}

.show-mobile {
  display: none;
}

.mobile-cards {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.mobile-card {
  background: #f8fafc;
  border: 1px solid var(--color-border);
  border-radius: 10px;
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.mobile-card-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
}

.mobile-card-meta {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  font-size: 0.8rem;
  color: var(--color-text-secondary);
}

.mobile-card-desc {
  font-size: 0.85rem;
  color: var(--color-text-secondary);
  border-top: 1px solid var(--color-border);
  padding-top: 6px;
  margin-top: 2px;
  word-break: break-word;
}

@media (max-width: 1024px) {
  .hide-mobile {
    display: none;
  }

  .show-mobile {
    display: block;
  }

  .cash-status-box {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .text-right {
    text-align: left;
  }

  .mobile-card-row,
  .mobile-card-meta {
    flex-wrap: wrap;
  }

  .amount-display {
    font-size: 1rem;
  }
}
</style>