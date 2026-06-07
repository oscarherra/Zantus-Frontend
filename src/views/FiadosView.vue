<template>
  <MainLayout
    title="Fiados"
    subtitle="Registro de personas, montos fiados y abonos"
  >
    <div class="kpi-row">
      <StatCard label="Pendiente total" :value="currency(summary.pending_total)">
        <BadgeDollarSign size="22" />
      </StatCard>

      <StatCard label="Fiado esta semana" :value="currency(summary.week_total)">
        <CalendarDays size="22" />
      </StatCard>

      <StatCard label="Pagado esta semana" :value="currency(summary.paid_this_week)">
        <CircleDollarSign size="22" />
      </StatCard>

      <StatCard label="Personas con saldo" :value="String(summary.by_customer?.length || 0)">
        <Users size="22" />
      </StatCard>
    </div>

    <div class="grid grid-2">
      <AppPanel title="Agregar persona" subtitle="Registra a quien se le puede fiar">
        <form class="form-grid" @submit.prevent="createCustomer">
          <label class="label">
            Nombre
            <input
              v-model="customerForm.name"
              class="input"
              type="text"
              placeholder="Ej. María López"
              required
            />
          </label>

          <label class="label">
            Teléfono opcional
            <input
              v-model="customerForm.phone"
              class="input"
              type="text"
              placeholder="Ej. 8888-8888"
            />
          </label>

          <label class="label">
            Nota opcional
            <textarea
              v-model="customerForm.notes"
              class="textarea"
              rows="3"
              placeholder="Ej. Compra regularmente"
            ></textarea>
          </label>

          <button class="btn btn-primary" type="submit">
            <UserPlus size="18" />
            Guardar persona
          </button>
        </form>
      </AppPanel>

      <AppPanel title="Registrar fiado" subtitle="Agrega un nuevo monto pendiente">
        <form class="form-grid" @submit.prevent="createCredit">
          <label class="label">
            Persona
            <select v-model="creditForm.customer_id" class="select" required>
              <option value="">Seleccione una persona</option>
              <option v-for="customer in customers" :key="customer.id" :value="customer.id">
                {{ customer.name }}
              </option>
            </select>
          </label>

          <label class="label">
            Monto
            <input
              v-model.number="creditForm.amount"
              class="input"
              type="number"
              min="1"
              step="0.01"
              placeholder="Ej. 1500"
              required
            />
          </label>

          <label class="label">
            Descripción
            <input
              v-model="creditForm.description"
              class="input"
              type="text"
              placeholder="Ej. Desayuno fiado"
            />
          </label>

          <label class="checkbox-row">
            <input v-model="creditForm.use_cash_session" type="checkbox" />
            Asociar a la caja abierta
          </label>

          <button class="btn btn-primary" type="submit">
            <Plus size="18" />
            Registrar fiado
          </button>
        </form>
      </AppPanel>
    </div>

    <div v-if="success" class="success-box mt-4">{{ success }}</div>
    <div v-if="error" class="error-box mt-4">{{ error }}</div>

    <div class="grid grid-2 mt-4">
      <AppPanel title="Saldos por persona" subtitle="Resumen de pendientes">
        <div v-if="!summary.by_customer?.length">
          <EmptyState>No hay saldos pendientes.</EmptyState>
        </div>

        <div v-else class="customer-summary-list">
          <div
            v-for="row in summary.by_customer"
            :key="row.customer_id"
            class="summary-row"
          >
            <span>{{ row.customer_name }}</span>
            <strong>{{ currency(row.pending_total) }}</strong>
          </div>
        </div>
      </AppPanel>

      <AppPanel title="Filtros" subtitle="Busca fiados por estado o persona">
        <div class="form-grid">
          <label class="label">
            Estado
            <select v-model="filters.status" class="select" @change="loadCredits">
              <option value="">Todos</option>
              <option value="pending">Pendiente</option>
              <option value="partial">Parcial</option>
              <option value="paid">Pagado</option>
            </select>
          </label>

          <label class="label">
            Persona
            <select v-model="filters.customer_id" class="select" @change="loadCredits">
              <option value="">Todas</option>
              <option v-for="customer in customers" :key="customer.id" :value="customer.id">
                {{ customer.name }}
              </option>
            </select>
          </label>

          <button class="btn btn-secondary" type="button" @click="clearFilters">
            <X size="16" />
            Limpiar filtros
          </button>
        </div>
      </AppPanel>
    </div>

    <AppPanel title="Lista de fiados" subtitle="Historial de montos fiados y abonos" class="mt-4">
      <div v-if="loading" class="state-center">
        <Loader2 size="24" class="spin" />
        Cargando fiados...
      </div>

      <EmptyState v-else-if="!credits.length">
        No hay fiados registrados.
      </EmptyState>

      <div v-else class="credits-list">
        <div
          v-for="credit in credits"
          :key="credit.id"
          class="credit-card"
          :class="`status-${credit.status}`"
        >
          <div class="credit-header">
            <div>
              <h3>{{ credit.customer?.name || "Sin nombre" }}</h3>
              <p class="muted">
                {{ credit.description || "Sin descripción" }}
              </p>
            </div>

            <span class="status-pill" :class="`pill-${credit.status}`">
              {{ statusLabel(credit.status) }}
            </span>
          </div>

          <div class="amount-grid">
            <div>
              <span class="muted">Monto fiado</span>
              <strong>{{ currency(credit.amount) }}</strong>
            </div>

            <div>
              <span class="muted">Abonado</span>
              <strong>{{ currency(credit.paid_amount) }}</strong>
            </div>

            <div>
              <span class="muted">Pendiente</span>
              <strong>{{ currency(Number(credit.amount) - Number(credit.paid_amount)) }}</strong>
            </div>
          </div>

          <div v-if="credit.status !== 'paid'" class="payment-box">
            <label class="label">
              Abono
              <input
                v-model.number="paymentForms[credit.id].amount"
                class="input"
                type="number"
                min="1"
                step="0.01"
                placeholder="Monto a abonar"
              />
            </label>

            <label class="label">
              Método
              <select v-model="paymentForms[credit.id].payment_method" class="select">
                <option value="cash">Efectivo</option>
                <option value="sinpe">SINPE</option>
                <option value="card">Tarjeta</option>
              </select>
            </label>

            <label class="checkbox-row">
              <input v-model="paymentForms[credit.id].register_income" type="checkbox" />
              Registrar como ingreso en caja
            </label>

            <button class="btn btn-secondary" type="button" @click="payCredit(credit)">
              <CircleDollarSign size="17" />
              Registrar abono
            </button>
          </div>

          <div v-if="credit.payments?.length" class="payments-list">
            <strong>Abonos realizados</strong>

            <div
              v-for="payment in credit.payments"
              :key="payment.id"
              class="payment-row"
            >
              <span>{{ formatDate(payment.paid_at) }}</span>
              <span>{{ paymentLabel(payment.payment_method) }}</span>
              <strong>{{ currency(payment.amount) }}</strong>
            </div>
          </div>
        </div>
      </div>
    </AppPanel>
  </MainLayout>
</template>

<script setup>
import { onMounted, reactive, ref } from "vue";
import {
  BadgeDollarSign,
  CalendarDays,
  CircleDollarSign,
  Users,
  UserPlus,
  Plus,
  X,
  Loader2,
} from "lucide-vue-next";

import api from "../services/api";
import MainLayout from "../layouts/MainLayout.vue";
import AppPanel from "../components/AppPanel.vue";
import EmptyState from "../components/EmptyState.vue";
import StatCard from "../components/StatCard.vue";

const customers = ref([]);
const credits = ref([]);
const loading = ref(false);
const success = ref("");
const error = ref("");
const currentCash = ref(null);

const summary = reactive({
  pending_total: 0,
  week_total: 0,
  paid_this_week: 0,
  by_customer: [],
});

const customerForm = reactive({
  name: "",
  phone: "",
  notes: "",
});

const creditForm = reactive({
  customer_id: "",
  amount: "",
  description: "",
  use_cash_session: true,
});

const filters = reactive({
  status: "",
  customer_id: "",
});

const paymentForms = reactive({});

function currency(value) {
  return new Intl.NumberFormat("es-CR", {
    style: "currency",
    currency: "CRC",
    maximumFractionDigits: 2,
  }).format(Number(value || 0));
}

function formatDate(value) {
  if (!value) return "-";

  return new Date(value).toLocaleDateString("es-CR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function statusLabel(status) {
  const map = {
    pending: "Pendiente",
    partial: "Parcial",
    paid: "Pagado",
  };

  return map[status] || status;
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

function ensurePaymentForm(credit) {
  if (!paymentForms[credit.id]) {
    paymentForms[credit.id] = {
      amount: "",
      payment_method: "cash",
      register_income: true,
    };
  }
}

async function loadCurrentCash() {
  try {
    const { data } = await api.get("/cash-sessions/current");
    currentCash.value = data.cash_session;
  } catch (e) {
    currentCash.value = null;
  }
}

async function loadCustomers() {
  const { data } = await api.get("/credits/customers");
  customers.value = data.customers || [];
}

async function loadSummary() {
  const { data } = await api.get("/credits-summary");

  summary.pending_total = data.pending_total || 0;
  summary.week_total = data.week_total || 0;
  summary.paid_this_week = data.paid_this_week || 0;
  summary.by_customer = data.by_customer || [];
}

async function loadCredits() {
  loading.value = true;

  try {
    const params = {};

    if (filters.status) params.status = filters.status;
    if (filters.customer_id) params.customer_id = filters.customer_id;

    const { data } = await api.get("/credits", { params });

    credits.value = data.credits?.data || [];

    credits.value.forEach(ensurePaymentForm);
  } catch (e) {
    error.value = "No se pudieron cargar los fiados.";
  } finally {
    loading.value = false;
  }
}

async function createCustomer() {
  clearMessages();

  try {
    const { data } = await api.post("/credits/customers", { ...customerForm });

    customers.value.push(data.customer);
    customers.value.sort((a, b) => a.name.localeCompare(b.name));

    customerForm.name = "";
    customerForm.phone = "";
    customerForm.notes = "";

    success.value = "Persona agregada correctamente.";
  } catch (e) {
    error.value = e?.response?.data?.message || "No se pudo agregar la persona.";
  }
}

async function createCredit() {
  clearMessages();

  try {
    let cashSessionId = null;

    if (creditForm.use_cash_session) {
      await loadCurrentCash();
      cashSessionId = currentCash.value?.status === "open" ? currentCash.value.id : null;
    }

    const payload = {
      customer_id: creditForm.customer_id,
      amount: creditForm.amount,
      description: creditForm.description,
      cash_session_id: cashSessionId,
    };

    await api.post("/credits", payload);

    creditForm.customer_id = "";
    creditForm.amount = "";
    creditForm.description = "";
    creditForm.use_cash_session = true;

    success.value = "Fiado registrado correctamente.";

    await Promise.all([loadCredits(), loadSummary()]);
  } catch (e) {
    error.value = e?.response?.data?.message || "No se pudo registrar el fiado.";
  }
}

async function payCredit(credit) {
  clearMessages();

  const form = paymentForms[credit.id];

  if (!form?.amount) {
    error.value = "Digite el monto del abono.";
    return;
  }

  try {
    let cashSessionId = null;

    if (form.register_income) {
      await loadCurrentCash();
      cashSessionId = currentCash.value?.status === "open" ? currentCash.value.id : null;

      if (!cashSessionId) {
        error.value = "Para registrar el abono como ingreso, debe haber una caja abierta.";
        return;
      }
    }

    await api.post(`/credits/${credit.id}/pay`, {
      amount: form.amount,
      payment_method: form.payment_method,
      register_income: form.register_income,
      cash_session_id: cashSessionId,
    });

    form.amount = "";
    form.payment_method = "cash";
    form.register_income = true;

    success.value = "Abono registrado correctamente.";

    await Promise.all([loadCredits(), loadSummary()]);
  } catch (e) {
    error.value = e?.response?.data?.message || "No se pudo registrar el abono.";
  }
}

function clearFilters() {
  filters.status = "";
  filters.customer_id = "";
  loadCredits();
}

onMounted(async () => {
  await Promise.all([
    loadCurrentCash(),
    loadCustomers(),
    loadSummary(),
    loadCredits(),
  ]);
});
</script>

<style scoped>
.mt-4 {
  margin-top: 16px;
}

.state-center {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 9px;
  padding: 32px;
  color: var(--color-text-secondary);
}

.spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.customer-summary-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border: 1px solid var(--color-border);
  padding: 12px 14px;
  border-radius: 10px;
  background: #f8fafc;
}

.credits-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.credit-card {
  border: 1px solid var(--color-border);
  border-radius: 14px;
  padding: 16px;
  background: #fff;
}

.credit-card.status-pending {
  border-left: 4px solid #f59e0b;
}

.credit-card.status-partial {
  border-left: 4px solid var(--color-brand);
}

.credit-card.status-paid {
  border-left: 4px solid var(--color-success);
}

.credit-header {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: flex-start;
  margin-bottom: 14px;
}

.credit-header h3 {
  margin: 0 0 4px;
  font-size: 1rem;
}

.status-pill {
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 700;
  white-space: nowrap;
}

.pill-pending {
  background: #fef3c7;
  color: #92400e;
}

.pill-partial {
  background: var(--color-brand-alpha);
  color: var(--color-brand);
}

.pill-paid {
  background: var(--color-success-alpha);
  color: var(--color-success);
}

.amount-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  border-top: 1px solid var(--color-border);
  border-bottom: 1px solid var(--color-border);
  padding: 14px 0;
  gap: 12px;
}

.amount-grid div {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.payment-box {
  display: grid;
  grid-template-columns: 1fr 160px auto auto;
  gap: 12px;
  align-items: end;
  margin-top: 14px;
}

.checkbox-row {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: var(--color-text-secondary);
  font-size: 0.9rem;
}

.payments-list {
  margin-top: 14px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  background: #f8fafc;
  border-radius: 10px;
  padding: 12px;
}

.payment-row {
  display: grid;
  grid-template-columns: 1fr 1fr auto;
  gap: 10px;
  font-size: 0.86rem;
  color: var(--color-text-secondary);
}

@media (max-width: 900px) {
  .payment-box {
    grid-template-columns: 1fr;
  }

  .amount-grid {
    grid-template-columns: 1fr;
  }

  .credit-header {
    flex-direction: column;
  }
}
</style>