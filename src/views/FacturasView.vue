<template>
  <MainLayout
    title="Facturas"
    subtitle="Control de pagos, vencimientos y estados administrativos"
  >
    <div class="grid grid-2">
      <AppPanel
        title="Registrar factura"
        subtitle="Nueva obligación de pago"
      >
        <div class="form-grid">
          <div class="form-grid two">
            <label class="label">
              Proveedor
              <select v-model="form.supplier_id" class="select">
                <option :value="null">Sin proveedor</option>
                <option v-for="item in suppliers" :key="item.id" :value="item.id">
                  {{ item.name }}
                </option>
              </select>
            </label>

            <label class="label">
              Categoría
              <select v-model="form.category_id" class="select">
                <option :value="null">Sin categoría</option>
                <option v-for="item in expenseCategories" :key="item.id" :value="item.id">
                  {{ item.name }}
                </option>
              </select>
            </label>
          </div>

          <div class="form-grid two">
            <label class="label">
              Referencia
              <input
                v-model="form.reference"
                class="input"
                type="text"
                placeholder="Número o código"
              />
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
          </div>

          <div class="form-grid two">
            <label class="label">
              Fecha de emisión
              <input v-model="form.issue_date" class="input" type="date" />
            </label>

            <label class="label">
              Fecha de vencimiento
              <input v-model="form.due_date" class="input" type="date" />
            </label>
          </div>

          <label class="label">
            Notas
            <textarea
              v-model="form.notes"
              class="textarea"
              placeholder="Observaciones internas"
            />
          </label>

          <div class="actions-row">
            <BaseButton variant="primary" @click="createInvoice">
              <Plus size="16" />
              Guardar factura
            </BaseButton>

            <BaseButton variant="secondary" @click="refreshStatuses">
              <RefreshCcw size="16" />
              Actualizar vencidas
            </BaseButton>
          </div>

          <div v-if="success" class="success-box">{{ success }}</div>
          <div v-if="error" class="error-box">{{ error }}</div>
        </div>
      </AppPanel>

      <AppPanel
        title="Filtros"
        subtitle="Consulta por estado"
      >
        <div class="form-grid">
          <label class="label">
            Estado
            <select v-model="statusFilter" class="select" @change="loadInvoices">
              <option value="">Todos</option>
              <option value="pending">Pendientes</option>
              <option value="paid">Pagadas</option>
              <option value="overdue">Vencidas</option>
            </select>
          </label>

          <div class="muted">
            Este módulo está visible únicamente para el rol administrador.
          </div>
        </div>
      </AppPanel>
    </div>

    <div style="margin-top: 18px;">
      <AppPanel
        title="Listado de facturas"
        subtitle="Gestión completa de cuentas por pagar"
      >
        <div v-if="invoices.length" class="table-wrap">
          <table class="table">
            <thead>
              <tr>
                <th>Proveedor</th>
                <th>Categoría</th>
                <th>Referencia</th>
                <th>Vence</th>
                <th>Monto</th>
                <th>Estado</th>
                <th>Acción</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in invoices" :key="item.id">
                <td>{{ item.supplier?.name || "Sin proveedor" }}</td>
                <td>{{ item.category?.name || "Sin categoría" }}</td>
                <td>{{ item.reference || "-" }}</td>
                <td>{{ item.due_date }}</td>
                <td>{{ currency(item.amount) }}</td>
                <td>
                  <span
                    class="status-pill"
                    :class="statusClass(item.status)"
                  >
                    {{ statusLabel(item.status) }}
                  </span>
                </td>
                <td>
                  <BaseButton
                    v-if="item.status !== 'paid'"
                    variant="secondary"
                    @click="payInvoice(item.id)"
                  >
                    <CheckCircle2 size="16" />
                    Marcar pagada
                  </BaseButton>
                  <span v-else class="muted">Registrada</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <EmptyState v-else>
          No hay facturas registradas con ese filtro.
        </EmptyState>
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
import BaseButton from "../components/BaseButton.vue";

const invoices = ref([]);
const suppliers = ref([]);
const expenseCategories = ref([]);
const statusFilter = ref("");

const success = ref("");
const error = ref("");

const form = reactive({
  supplier_id: null,
  category_id: null,
  reference: "",
  amount: 0,
  issue_date: "",
  due_date: "",
  notes: "",
});

function currency(value) {
  return new Intl.NumberFormat("es-CR", {
    style: "currency",
    currency: "CRC",
    maximumFractionDigits: 2,
  }).format(Number(value || 0));
}

function statusLabel(status) {
  const map = {
    pending: "Pendiente",
    paid: "Pagada",
    overdue: "Vencida",
  };
  return map[status] || status;
}

function statusClass(status) {
  return {
    "status-pending": status === "pending",
    "status-paid": status === "paid",
    "status-overdue": status === "overdue",
  };
}

function clearMessages() {
  success.value = "";
  error.value = "";
}

async function loadInvoices() {
  const params = {};
  if (statusFilter.value) params.status = statusFilter.value;

  const { data } = await api.get("/invoices", { params });
  invoices.value = data.invoices?.data || [];
}

async function loadSuppliers() {
  try {
    const { data } = await api.get("/suppliers");
    suppliers.value = data.suppliers || [];
  } catch (e) {
    suppliers.value = [];
  }
}

async function loadExpenseCategories() {
  const { data } = await api.get("/categories", {
    params: { type: "expense" },
  });
  expenseCategories.value = data.categories || [];
}

async function createInvoice() {
  clearMessages();

  try {
    await api.post("/invoices", {
      supplier_id: form.supplier_id,
      category_id: form.category_id,
      reference: form.reference,
      amount: form.amount,
      issue_date: form.issue_date || null,
      due_date: form.due_date,
      notes: form.notes,
    });

    success.value = "Factura registrada correctamente.";

    form.supplier_id = null;
    form.category_id = null;
    form.reference = "";
    form.amount = 0;
    form.issue_date = "";
    form.due_date = "";
    form.notes = "";

    await loadInvoices();
  } catch (e) {
    error.value = e?.response?.data?.message || "No se pudo registrar la factura.";
  }
}

async function payInvoice(id) {
  clearMessages();

  try {
    await api.post(`/invoices/${id}/pay`);
    success.value = "Factura marcada como pagada.";
    await loadInvoices();
  } catch (e) {
    error.value = e?.response?.data?.message || "No se pudo actualizar la factura.";
  }
}

async function refreshStatuses() {
  clearMessages();

  try {
    await api.post("/invoices/refresh-statuses");
    success.value = "Estados de facturas actualizados.";
    await loadInvoices();
  } catch (e) {
    error.value = e?.response?.data?.message || "No se pudieron actualizar los estados.";
  }
}

onMounted(async () => {
  await Promise.all([
    loadInvoices(),
    loadSuppliers(),
    loadExpenseCategories(),
  ]);
});
</script>