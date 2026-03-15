<template>
  <MainLayout
    title="Caja del día"
    subtitle="Apertura, movimientos, cierre y control operativo"
  >
    <div class="grid grid-2">
      <AppPanel
        title="Estado de caja"
        subtitle="Sesión diaria de caja activa o cerrada"
      >
        <div v-if="cash" class="form-grid">
          <div class="row-between">
            <div>
              <div class="muted">Estado actual</div>
              <strong>{{ cash.status === "open" ? "Abierta" : "Cerrada" }}</strong>
            </div>

            <div>
              <div class="muted">Apertura</div>
              <strong>{{ currency(cash.opening_amount) }}</strong>
            </div>
          </div>

          <div v-if="cash.status === 'closed'" class="success-box">
            Caja cerrada con monto de cierre {{ currency(cash.closing_amount) }}.
          </div>

          <div v-if="cash.status === 'open'" class="form-grid">
            <label class="label">
              Monto contado al cierre
              <input
                v-model.number="closing"
                class="input"
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
              />
            </label>

            <BaseButton variant="secondary" @click="closeCash">
              <Lock size="16" />
              Cerrar caja
            </BaseButton>
          </div>
        </div>

        <div v-else class="form-grid">
          <label class="label">
            Monto inicial
            <input
              v-model.number="opening"
              class="input"
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
            />
          </label>

          <BaseButton variant="primary" @click="openCash">
            <LockOpen size="16" />
            Abrir caja
          </BaseButton>
        </div>

        <div v-if="success" class="success-box">{{ success }}</div>
        <div v-if="error" class="error-box">{{ error }}</div>
      </AppPanel>

      <AppPanel
        title="Registrar movimiento"
        subtitle="Ingresos y egresos con categoría real"
      >
        <div class="form-grid">
          <div class="form-grid two">
            <label class="label">
              Tipo
              <select v-model="form.type" class="select">
                <option value="income">Ingreso</option>
                <option value="expense">Gasto</option>
              </select>
            </label>

            <label class="label">
              Método de pago
              <select v-model="form.payment_method" class="select">
                <option value="cash">Efectivo</option>
                <option value="sinpe">SINPE</option>
                <option value="card">Tarjeta</option>
              </select>
            </label>
          </div>

          <label class="label">
            Categoría
            <select v-model="form.category_id" class="select">
              <option disabled value="">Seleccione una categoría</option>
              <option v-for="item in categories" :key="item.id" :value="item.id">
                {{ item.name }}
              </option>
            </select>
          </label>

          <label class="label">
            Monto
            <input
              v-model.number="form.amount"
              class="input"
              type="number"
              min="0.01"
              step="0.01"
              placeholder="0.00"
            />
          </label>

          <label class="label">
            Descripción
            <textarea
              v-model="form.description"
              class="textarea"
              placeholder="Detalle del movimiento"
            />
          </label>

          <BaseButton variant="primary" @click="addTransaction" :disabled="!cash || cash.status !== 'open'">
            <Plus size="16" />
            Guardar movimiento
          </BaseButton>
        </div>
      </AppPanel>
    </div>

    <div style="margin-top: 18px;">
      <AppPanel
        title="Movimientos del día"
        subtitle="Listado completo de ingresos y egresos"
      >
        <div v-if="transactions.length" class="table-wrap">
          <table class="table">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Tipo</th>
                <th>Categoría</th>
                <th>Método</th>
                <th>Descripción</th>
                <th>Monto</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in transactions" :key="item.id">
                <td>{{ formatDateTime(item.happened_at) }}</td>
                <td>{{ item.type === "income" ? "Ingreso" : "Gasto" }}</td>
                <td>{{ item.category?.name || "-" }}</td>
                <td>{{ paymentLabel(item.payment_method) }}</td>
                <td>{{ item.description || "-" }}</td>
                <td>{{ currency(item.amount) }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <EmptyState v-else>
          No hay movimientos registrados para esta caja.
        </EmptyState>
      </AppPanel>
    </div>
  </MainLayout>
</template>

<script setup>
import { onMounted, reactive, ref, watch } from "vue";
import { Plus, LockOpen, Lock } from "lucide-vue-next";
import api from "../services/api";
import MainLayout from "../layouts/MainLayout.vue";
import AppPanel from "../components/AppPanel.vue";
import EmptyState from "../components/EmptyState.vue";
import BaseButton from "../components/BaseButton.vue";

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
  amount: 0,
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
  return new Date(value).toLocaleString("es-CR");
}

function paymentLabel(method) {
  const map = {
    cash: "Efectivo",
    sinpe: "SINPE",
    card: "Tarjeta",
  };
  return map[method] || method;
}

function clearMessages() {
  success.value = "";
  error.value = "";
}

async function loadTodayCash() {
  const { data } = await api.get("/cash-sessions/today");
  cash.value = data.cash_session;

  if (cash.value) {
    await loadTransactions();
  }
}

async function loadTransactions() {
  const { data } = await api.get("/transactions", {
    params: {
      cash_session_id: cash.value?.id,
    },
  });

  transactions.value = data.transactions?.data || [];
}

async function loadCategories() {
  const { data } = await api.get("/categories", {
    params: { type: form.type },
  });

  categories.value = data.categories || [];

  if (!categories.value.find((item) => item.id === form.category_id)) {
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

  try {
    await api.post("/transactions", {
      cash_session_id: cash.value.id,
      type: form.type,
      category_id: form.category_id,
      amount: form.amount,
      payment_method: form.payment_method,
      description: form.description,
    });

    success.value = "Movimiento registrado correctamente.";

    form.category_id = "";
    form.amount = 0;
    form.description = "";

    await loadCategories();
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