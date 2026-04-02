<template>
  <MainLayout title="Facturas" subtitle="Control simplificado de cuentas por pagar">
    <div class="grid grid-2">
      <AppPanel title="Registrar factura" subtitle="Nueva obligación de pago">
        <form @submit.prevent="createInvoice" class="form-grid">
          <div class="form-grid two">
            <label class="label">
              Proveedor (Nombre)
              <input v-model="form.supplier_name" class="input" type="text" placeholder="Ej. Coca Cola" required />
            </label>

            <label class="label">
              Categoría
              <select v-model="form.category_name" class="select" required>
                <option value="" disabled>Seleccione...</option>
                <option value="Servicios">Servicios</option>
                <option value="Alquiler">Alquiler</option>
                <option value="Bebidas">Bebidas</option>
                <option value="Dulces">Dulces</option>
                <option value="Paquetes">Paquetes</option>
                <option value="Pago de trabajador">Pago de trabajador</option>
                <option value="Otro">Otro</option>
              </select>
            </label>
          </div>

          <div class="form-grid two">
            <label class="label">
              Fecha límite de pago
              <input v-model="form.due_date" class="input" type="date" required />
            </label>

            <label class="label">
              Monto a pagar (₡)
              <input v-model.number="form.amount" class="input" type="number" min="0.01" step="0.01" placeholder="0.00" required />
            </label>
          </div>

          <div class="actions-row">
            <button type="submit" class="btn btn-primary">
              <Plus size="18" /> Guardar factura
            </button>
            <button type="button" class="btn btn-secondary" @click="refreshStatuses">
              <RefreshCcw size="18" /> Refrescar vencidas
            </button>
          </div>

          <div v-if="success" class="success-box mt-2">{{ success }}</div>
          <div v-if="error" class="error-box mt-2">{{ error }}</div>
        </form>
      </AppPanel>

      <AppPanel title="Filtros rápidos" subtitle="Consulta rápida por estado">
        <div class="form-grid">
          <label class="label">
            Filtrar por Estado
            <select v-model="statusFilter" class="select" @change="loadInvoices">
              <option value="">Todas las facturas</option>
              <option value="pending">Pendientes de pago</option>
              <option value="paid">Pagadas</option>
              <option value="overdue">Vencidas</option>
            </select>
          </label>
        </div>
      </AppPanel>
    </div>

    <div class="mt-6">
      <AppPanel title="Listado de facturas" subtitle="Gestión completa de cuentas por pagar">
        <div v-if="invoices.length" class="table-wrap">
          <!-- Desktop table -->
          <table class="table hide-mobile">
            <thead>
              <tr>
                <th>Proveedor</th>
                <th>Categoría</th>
                <th>Fecha Límite</th>
                <th>Monto</th>
                <th>Estado</th>
                <th class="text-right">Acción</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in invoices" :key="item.id">
                <td><strong class="text-primary">{{ item.supplier_name }}</strong></td>
                <td>{{ item.category_name }}</td>
                <td :class="{ 'text-danger': item.status === 'overdue' }">{{ item.due_date }}</td>
                <td><strong>{{ currency(item.amount) }}</strong></td>
                <td><span class="status-pill" :class="statusClass(item.status)">{{ statusLabel(item.status) }}</span></td>
                <td class="text-right">
                  <button v-if="item.status !== 'paid'" class="btn btn-secondary btn-sm" @click="payInvoice(item.id)">
                    <CheckCircle2 size="16" class="icon-success" /> Pagar
                  </button>
                  <span v-else class="muted-action"><CheckCircle2 size="16" /> Pagada</span>
                </td>
              </tr>
            </tbody>
          </table>

          <!-- Mobile cards -->
          <div class="mobile-cards show-mobile">
            <div v-for="item in invoices" :key="item.id" class="mobile-invoice-card">
              <div class="mic-header">
                <strong class="text-primary">{{ item.supplier_name }}</strong>
                <span class="status-pill" :class="statusClass(item.status)">{{ statusLabel(item.status) }}</span>
              </div>
              <div class="mic-row">
                <span class="muted">{{ item.category_name }}</span>
                <strong>{{ currency(item.amount) }}</strong>
              </div>
              <div class="mic-footer">
                <span :class="{ 'text-danger': item.status === 'overdue', 'muted': item.status !== 'overdue' }">
                  Vence: {{ item.due_date }}
                </span>
                <button v-if="item.status !== 'paid'" class="btn btn-secondary btn-sm" @click="payInvoice(item.id)">
                  <CheckCircle2 size="15" class="icon-success" /> Pagar
                </button>
                <span v-else class="muted-action"><CheckCircle2 size="15" /> Pagada</span>
              </div>
            </div>
          </div>
        </div>
        <EmptyState v-else>No hay facturas registradas.</EmptyState>
      </AppPanel>
    </div>
  </MainLayout>
</template>

<script setup>
import { onMounted, reactive, ref } from "vue";
import { Plus, RefreshCcw, CheckCircle2 } from "lucide-vue-next";
import api from "../services/api";
import MainLayout from "../layouts/MainLayout.vue";
import AppPanel from "../components/AppPanel.vue";
import EmptyState from "../components/EmptyState.vue";

const invoices = ref([]);
const statusFilter = ref("");
const success = ref("");
const error = ref("");

const form = reactive({
  supplier_name: "",
  category_name: "",
  amount: "",
  due_date: "",
});

function currency(value) {
  return new Intl.NumberFormat("es-CR", { style: "currency", currency: "CRC", maximumFractionDigits: 2 }).format(Number(value || 0));
}

function statusLabel(status) {
  const map = { pending: "Pendiente", paid: "Pagada", overdue: "Vencida" };
  return map[status] || status;
}

function statusClass(status) {
  return { "pill-pending": status === "pending", "pill-paid": status === "paid", "pill-overdue": status === "overdue" };
}

function clearMessages() { success.value = ""; error.value = ""; }

async function loadInvoices() {
  const params = statusFilter.value ? { status: statusFilter.value } : {};
  const { data } = await api.get("/invoices", { params });
  invoices.value = data.invoices?.data || [];
}

async function createInvoice() {
  clearMessages();
  try {
    await api.post("/invoices", form);
    success.value = "Factura registrada correctamente.";
    form.supplier_name = ""; form.category_name = ""; form.amount = ""; form.due_date = "";
    await loadInvoices();
  } catch (e) { error.value = e?.response?.data?.message || "No se pudo registrar la factura."; }
}

async function payInvoice(id) {
  clearMessages();
  try {
    await api.post(`/invoices/${id}/pay`);
    success.value = "Factura marcada como pagada.";
    await loadInvoices();
  } catch (e) { error.value = "No se pudo actualizar la factura."; }
}

async function refreshStatuses() {
  clearMessages();
  try {
    await api.post("/invoices/refresh-statuses");
    success.value = "Estados actualizados.";
    await loadInvoices();
  } catch (e) { error.value = "Error al actualizar."; }
}

onMounted(() => { loadInvoices(); });
</script>

<style scoped>
.mt-2 { margin-top: 8px; }
.mt-6 { margin-top: 24px; }
.text-right { text-align: right; }
.text-primary { color: var(--color-text-primary); }
.text-danger { color: var(--color-danger); font-weight: 600; }
.icon-success { color: var(--color-success); }

.actions-row {
  display: flex;
  gap: 12px;
  margin-top: 8px;
  flex-wrap: wrap;
}

.status-pill {
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  border-radius: 50px;
  font-size: 0.72rem;
  font-weight: 600;
  text-transform: uppercase;
  white-space: nowrap;
}

.pill-pending { background-color: #fef3c7; color: #b45309; }
.pill-paid    { background-color: #d1fae5; color: #047857; }
.pill-overdue { background-color: #fee2e2; color: #b91c1c; }

.btn-sm { padding: 6px 12px; font-size: 0.82rem; }

.muted-action {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  color: var(--color-text-secondary);
  font-size: 0.82rem;
  font-weight: 500;
}

/* Desktop/Mobile toggle */
.hide-mobile { display: table; width: 100%; }
.show-mobile  { display: none; }

/* Mobile invoice cards */
.mobile-cards {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.mobile-invoice-card {
  background: #f8fafc;
  border: 1px solid var(--color-border);
  border-radius: 10px;
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.mic-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
}

.mic-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.mic-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1px solid var(--color-border);
  padding-top: 8px;
  margin-top: 2px;
  flex-wrap: wrap;
  gap: 8px;
}

@media (max-width: 640px) {
  .hide-mobile { display: none; }
  .show-mobile  { display: block; }

  .actions-row {
    flex-direction: column;
  }

  .actions-row .btn {
    width: 100%;
    justify-content: center;
  }
}
</style>