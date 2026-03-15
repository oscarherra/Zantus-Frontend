<template>
  <MainLayout
    title="Dashboard"
    subtitle="Resumen de ingresos, egresos, tendencias y vencimientos"
  >
    <div class="kpi-row">
      <StatCard label="Ingresos" :value="currency(kpis.income)">
        <TrendingUp size="18" />
      </StatCard>

      <StatCard label="Gastos" :value="currency(kpis.expense)">
        <TrendingDown size="18" />
      </StatCard>

      <StatCard label="Utilidad" :value="currency(kpis.profit)">
        <BadgeDollarSign size="18" />
      </StatCard>

      <StatCard label="Facturas próximas" :value="String(upcoming.length)">
        <CalendarClock size="18" />
      </StatCard>
    </div>

    <div class="grid grid-2" style="margin-top: 18px;">
      <AppPanel
        title="Ventas por período"
        subtitle="Comparativo por semana o mes"
      >
        <div class="row-between" style="margin-bottom: 16px;">
          <div class="muted">Seleccione el período del gráfico</div>

          <select v-model="period" class="select" style="max-width: 160px;" @change="loadSeries">
            <option value="week">Semana</option>
            <option value="month">Mes</option>
          </select>
        </div>

        <apexchart
          type="line"
          height="320"
          :options="lineOptions"
          :series="lineSeries"
        />
      </AppPanel>

      <AppPanel
        title="Gastos por categoría"
        subtitle="Distribución del gasto del período actual"
      >
        <apexchart
          type="donut"
          height="320"
          :options="donutOptions"
          :series="donutSeries"
        />
      </AppPanel>
    </div>

    <div class="grid grid-2" style="margin-top: 18px;">
      <AppPanel
        title="Facturas por vencer"
        subtitle="Pendientes dentro de los próximos 7 días"
      >
        <div v-if="upcoming.length" class="table-wrap">
          <table class="table">
            <thead>
              <tr>
                <th>Proveedor</th>
                <th>Categoría</th>
                <th>Vence</th>
                <th>Monto</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in upcoming" :key="item.id">
                <td>{{ item.supplier?.name || "Sin proveedor" }}</td>
                <td>{{ item.category?.name || "Sin categoría" }}</td>
                <td>{{ item.due_date }}</td>
                <td>{{ currency(item.amount) }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <EmptyState v-else>
          No hay facturas próximas por vencer.
        </EmptyState>
      </AppPanel>

      <AppPanel
        title="Últimas transacciones"
        subtitle="Movimientos recientes registrados en caja"
      >
        <div v-if="transactions.length" class="table-wrap">
          <table class="table">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Tipo</th>
                <th>Categoría</th>
                <th>Método</th>
                <th>Monto</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in transactions" :key="item.id">
                <td>{{ formatDateTime(item.happened_at) }}</td>
                <td>{{ item.type === "income" ? "Ingreso" : "Gasto" }}</td>
                <td>{{ item.category?.name || "-" }}</td>
                <td>{{ paymentLabel(item.payment_method) }}</td>
                <td>{{ currency(item.amount) }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <EmptyState v-else>
          No hay transacciones registradas.
        </EmptyState>
      </AppPanel>
    </div>
  </MainLayout>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from "vue";
import {
  TrendingUp,
  TrendingDown,
  BadgeDollarSign,
  CalendarClock,
} from "lucide-vue-next";
import api from "../services/api";
import MainLayout from "../layouts/MainLayout.vue";
import StatCard from "../components/StatCard.vue";
import AppPanel from "../components/AppPanel.vue";
import EmptyState from "../components/EmptyState.vue";

const kpis = reactive({
  income: 0,
  expense: 0,
  profit: 0,
});

const period = ref("week");
const labels = ref([]);
const salesData = ref([]);
const expenseLabels = ref([]);
const expenseData = ref([]);
const upcoming = ref([]);
const transactions = ref([]);

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

async function loadKpis() {
  const { data } = await api.get("/dashboard/kpis");
  kpis.income = data.income;
  kpis.expense = data.expense;
  kpis.profit = data.profit;
}

async function loadSeries() {
  const { data } = await api.get("/dashboard/sales-series", {
    params: { period: period.value },
  });

  labels.value = data.series.map((item) => item.label);
  salesData.value = data.series.map((item) => Number(item.total));
}

async function loadExpenseCategories() {
  const { data } = await api.get("/dashboard/expenses-by-category");
  expenseLabels.value = data.series.map((item) => item.label);
  expenseData.value = data.series.map((item) => Number(item.total));
}

async function loadUpcomingInvoices() {
  try {
    const { data } = await api.get("/invoices/upcoming", {
      params: { days: 7 },
    });
    upcoming.value = data.invoices || [];
  } catch (error) {
    upcoming.value = [];
  }
}

async function loadTransactions() {
  const { data } = await api.get("/transactions");
  transactions.value = data.transactions?.data?.slice(0, 6) || [];
}

const lineOptions = computed(() => ({
  chart: {
    toolbar: { show: false },
    foreColor: "#9aa8c7",
  },
  stroke: {
    curve: "smooth",
    width: 3,
  },
  grid: {
    borderColor: "#25314a",
  },
  xaxis: {
    categories: labels.value,
  },
  yaxis: {
    labels: {
      formatter: (value) =>
        new Intl.NumberFormat("es-CR", {
          style: "currency",
          currency: "CRC",
          maximumFractionDigits: 0,
        }).format(value),
    },
  },
  legend: {
    show: false,
  },
  tooltip: {
    theme: "dark",
  },
}));

const lineSeries = computed(() => [
  {
    name: "Ventas",
    data: salesData.value,
  },
]);

const donutOptions = computed(() => ({
  labels: expenseLabels.value,
  legend: {
    position: "bottom",
    labels: { colors: "#9aa8c7" },
  },
  dataLabels: {
    enabled: true,
  },
  tooltip: {
    theme: "dark",
  },
}));

const donutSeries = computed(() => expenseData.value);

onMounted(async () => {
  await Promise.all([
    loadKpis(),
    loadSeries(),
    loadExpenseCategories(),
    loadUpcomingInvoices(),
    loadTransactions(),
  ]);
});
</script>