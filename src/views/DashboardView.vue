<template>
  <MainLayout
    title="Dashboard"
    subtitle="Resumen de ingresos, egresos, tendencias y vencimientos"
  >
    <div class="kpi-row">
      <StatCard label="Ingresos" :value="currency(kpis.income)">
        <TrendingUp size="24" />
      </StatCard>

      <StatCard label="Gastos" :value="currency(kpis.expense)">
        <TrendingDown size="24" />
      </StatCard>

      <StatCard label="Utilidad" :value="currency(kpis.profit)">
        <BadgeDollarSign size="24" />
      </StatCard>

      <StatCard label="Facturas próximas" :value="String(upcoming.length)">
        <CalendarClock size="24" />
      </StatCard>
    </div>

    <div class="grid grid-2">
      <AppPanel
        title="Ventas por período"
        subtitle="Comparativo por semana o mes"
      >
        <div class="row-between mb-4">
          <div class="muted">Seleccione el período</div>
          <select v-model="period" class="select select-sm" @change="loadSeries">
            <option value="week">Semana</option>
            <option value="month">Mes</option>
          </select>
        </div>

        <apexchart
          type="line"
          :height="chartHeight"
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
          :height="chartHeight"
          :options="donutOptions"
          :series="donutSeries"
        />
      </AppPanel>
    </div>

    <div class="grid grid-2">
      <AppPanel
        title="Facturas por vencer"
        subtitle="Pendientes dentro de los próximos 7 días"
      >
        <div v-if="upcoming.length" class="table-wrap">
          <!-- Desktop -->
          <table class="table hide-mobile">
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
                <td><strong>{{ currency(item.amount) }}</strong></td>
              </tr>
            </tbody>
          </table>
          <!-- Mobile cards -->
          <div class="mobile-cards show-mobile">
            <div v-for="item in upcoming" :key="item.id" class="mobile-card">
              <div class="mobile-card-row">
                <strong>{{ item.supplier?.name || "Sin proveedor" }}</strong>
                <strong>{{ currency(item.amount) }}</strong>
              </div>
              <div class="mobile-card-meta">
                <span>{{ item.category?.name || "Sin categoría" }}</span>
                <span>Vence: {{ item.due_date }}</span>
              </div>
            </div>
          </div>
        </div>
        <EmptyState v-else>No hay facturas próximas por vencer.</EmptyState>
      </AppPanel>

      <AppPanel
        title="Últimas transacciones"
        subtitle="Movimientos recientes registrados en caja"
      >
        <div v-if="transactions.length" class="table-wrap">
          <!-- Desktop -->
          <table class="table hide-mobile">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Tipo</th>
                <th>Categoría</th>
                <th>Monto</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in transactions" :key="item.id">
                <td>{{ formatDateTime(item.happened_at) }}</td>
                <td>
                  <span :class="item.type === 'income' ? 'type-income' : 'type-expense'">
                    {{ item.type === "income" ? "Ingreso" : "Gasto" }}
                  </span>
                </td>
                <td>{{ item.category?.name || "-" }}</td>
                <td><strong>{{ currency(item.amount) }}</strong></td>
              </tr>
            </tbody>
          </table>
          <!-- Mobile cards -->
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
                <span v-if="item.category?.name">{{ item.category.name }}</span>
              </div>
            </div>
          </div>
        </div>
        <EmptyState v-else>No hay transacciones registradas.</EmptyState>
      </AppPanel>
    </div>
  </MainLayout>
</template>

<script setup>
import { computed, onMounted, onUnmounted, reactive, ref } from "vue";
import { TrendingUp, TrendingDown, BadgeDollarSign, CalendarClock } from "lucide-vue-next";
import api from "../services/api";
import MainLayout from "../layouts/MainLayout.vue";
import StatCard from "../components/StatCard.vue";
import AppPanel from "../components/AppPanel.vue";
import EmptyState from "../components/EmptyState.vue";

const kpis = reactive({ income: 0, expense: 0, profit: 0 });
const period = ref("week");
const labels = ref([]);
const salesData = ref([]);
const expenseLabels = ref([]);
const expenseData = ref([]);
const upcoming = ref([]);
const transactions = ref([]);
const windowWidth = ref(window.innerWidth);

function onResize() { windowWidth.value = window.innerWidth; }
onMounted(() => window.addEventListener('resize', onResize));
onUnmounted(() => window.removeEventListener('resize', onResize));

const chartHeight = computed(() => windowWidth.value < 640 ? 220 : 300);

function currency(value) {
  return new Intl.NumberFormat("es-CR", { style: "currency", currency: "CRC", maximumFractionDigits: 2 }).format(Number(value || 0));
}

function formatDateTime(value) {
  return new Date(value).toLocaleDateString("es-CR", { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
}

async function loadKpis() {
  const { data } = await api.get("/dashboard/kpis");
  Object.assign(kpis, data);
}

async function loadSeries() {
  const { data } = await api.get("/dashboard/sales-series", { params: { period: period.value } });
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
    const { data } = await api.get("/invoices/upcoming", { params: { days: 7 } });
    upcoming.value = data.invoices || [];
  } catch { upcoming.value = []; }
}

async function loadTransactions() {
  const { data } = await api.get("/transactions");
  transactions.value = data.transactions?.data?.slice(0, 5) || [];
}

const lineOptions = computed(() => ({
  chart: { toolbar: { show: false }, foreColor: "#52525b", fontFamily: "inherit" },
  colors: ["#2563eb"],
  stroke: { curve: "smooth", width: 3 },
  grid: { borderColor: "#e4e4e7", strokeDashArray: 4 },
  xaxis: { categories: labels.value },
  yaxis: { labels: { formatter: (val) => "₡" + val.toLocaleString("es-CR") } },
  tooltip: { theme: "light" },
}));

const lineSeries = computed(() => [{ name: "Ingresos", data: salesData.value }]);

const donutOptions = computed(() => ({
  labels: expenseLabels.value,
  colors: ["#3b82f6", "#ef4444", "#f59e0b", "#10b981", "#8b5cf6", "#64748b"],
  legend: { position: "bottom", labels: { colors: "#18181b" } },
  dataLabels: { enabled: windowWidth.value >= 640, style: { fontFamily: "inherit" } },
  tooltip: { theme: "light" },
  stroke: { colors: ["#ffffff"] }
}));

const donutSeries = computed(() => expenseData.value);

onMounted(async () => {
  await Promise.all([loadKpis(), loadSeries(), loadExpenseCategories(), loadUpcomingInvoices(), loadTransactions()]);
});
</script>

<style scoped>
.mb-4 { margin-bottom: 16px; }

.select-sm {
  max-width: 140px;
  padding: 6px 10px;
  font-size: 0.85rem;
}

.type-income { color: var(--color-success); font-weight: 500; }
.type-expense { color: var(--color-danger); font-weight: 500; }

.hide-mobile { display: table; width: 100%; }
.show-mobile { display: none; }

.mobile-cards {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.mobile-card {
  background: #f8fafc;
  border: 1px solid var(--color-border);
  border-radius: 10px;
  padding: 12px 14px;
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.mobile-card-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.mobile-card-meta {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  font-size: 0.8rem;
  color: var(--color-text-secondary);
}

@media (max-width: 640px) {
  .hide-mobile { display: none; }
  .show-mobile { display: block; }
}
</style>