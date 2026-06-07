<template>
  <MainLayout
    title="Historial de caja"
    subtitle="Movimientos registrados por día"
  >
    <!-- Filtros -->
    <AppPanel title="Filtros" subtitle="Busca por rango de fechas o estado">
      <div class="filters-row">
        <label class="label">
          Desde
          <input v-model="filters.from" type="date" class="input" @change="loadSessions" />
        </label>
        <label class="label">
          Hasta
          <input v-model="filters.to" type="date" class="input" @change="loadSessions" />
        </label>
        <label class="label">
          Estado
          <select v-model="filters.status" class="select" @change="loadSessions">
            <option value="">Todos</option>
            <option value="open">Abierta</option>
            <option value="closed">Cerrada</option>
          </select>
        </label>
        <button class="btn btn-secondary filter-clear-btn" @click="clearFilters">
          <X size="16" /> Limpiar
        </button>
      </div>
    </AppPanel>

    <!-- Contenido -->
    <div class="sessions-list">
      <!-- Loading -->
      <div v-if="loading" class="state-center">
        <Loader2 size="26" class="spin" />
        <span>Cargando historial...</span>
      </div>

      <!-- Vacío -->
      <AppPanel v-else-if="!sessions.length">
        <EmptyState>No hay sesiones de caja en el período seleccionado.</EmptyState>
      </AppPanel>

      <!-- Sesiones -->
      <template v-else>
        <div
          v-for="session in sessions"
          :key="session.id"
          class="session-card"
          :class="{ 'is-open': session.status === 'open' }"
        >
          <!-- Header clickeable -->
          <div class="session-header" @click="toggleSession(session.id)">
            <div class="session-info">
              <div class="session-date">
                <CalendarDays size="15" />
                {{ formatDate(session.date || session.opened_at) }}
              </div>
              <div class="session-meta">
                <span class="status-pill" :class="session.status === 'open' ? 'pill-open' : 'pill-closed'">
                  {{ session.status === 'open' ? 'Abierta' : 'Cerrada' }}
                </span>
                <span class="meta-chip">
                  <Banknote size="13" />
                  Apertura: {{ currency(session.opening_amount) }}
                </span>
                <span v-if="session.closing_amount != null" class="meta-chip">
                  <Lock size="13" />
                  Cierre: {{ currency(session.closing_amount) }}
                </span>
              </div>
            </div>

            <div class="session-totals">
              <div class="total-chip income">
                <TrendingUp size="13" />
                {{ currency(totals[session.id]?.income || 0) }}
              </div>
              <div class="total-chip expense">
                <TrendingDown size="13" />
                {{ currency(totals[session.id]?.expense || 0) }}
              </div>
              <div class="total-chip profit" :class="{ negative: (totals[session.id]?.profit || 0) < 0 }">
                <BadgeDollarSign size="13" />
                {{ currency(totals[session.id]?.profit || 0) }}
              </div>
              <ChevronDown
                size="17"
                class="chevron"
                :class="{ rotated: expanded.includes(session.id) }"
              />
            </div>
          </div>

          <!-- Detalle expandible -->
          <div v-if="expanded.includes(session.id)" class="session-body">

            <div v-if="loadingTx[session.id]" class="state-center small">
              <Loader2 size="18" class="spin" /> Cargando movimientos...
            </div>

            <template v-else-if="txBySession[session.id]?.length">
              <!-- Tabla desktop -->
              <table class="table hide-mobile">
                <thead>
                  <tr>
                    <th>Hora</th>
                    <th>Tipo</th>
                    <th>Categoría</th>
                    <th>Método</th>
                    <th>Descripción</th>
                    <th style="text-align:right;">Monto</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="tx in txBySession[session.id]" :key="tx.id">
                    <td class="muted">{{ formatTime(tx.happened_at) }}</td>
                    <td>
                      <span :class="tx.type === 'income' ? 'chip-income' : 'chip-expense'">
                        {{ tx.type === 'income' ? 'Ingreso' : 'Gasto' }}
                      </span>
                    </td>
                    <td>{{ tx.category?.name || '-' }}</td>
                    <td>{{ paymentLabel(tx.payment_method) }}</td>
                    <td>{{ tx.description || '-' }}</td>
                    <td style="text-align:right;"><strong>{{ currency(tx.amount) }}</strong></td>
                  </tr>
                </tbody>
              </table>

              <!-- Cards móvil -->
              <div class="mobile-tx-list show-mobile">
                <div v-for="tx in txBySession[session.id]" :key="tx.id" class="tx-card">
                  <div class="tx-card-top">
                    <span :class="tx.type === 'income' ? 'chip-income' : 'chip-expense'">
                      {{ tx.type === 'income' ? 'Ingreso' : 'Gasto' }}
                    </span>
                    <strong>{{ currency(tx.amount) }}</strong>
                  </div>
                  <div class="tx-card-meta">
                    <span>{{ formatTime(tx.happened_at) }}</span>
                    <span>{{ paymentLabel(tx.payment_method) }}</span>
                    <span v-if="tx.category?.name">{{ tx.category.name }}</span>
                  </div>
                  <div v-if="tx.description" class="tx-card-desc">{{ tx.description }}</div>
                </div>
              </div>

              <!-- Resumen del día -->
              <div class="day-summary">
                <div class="day-summary-item">
                  <span class="muted">Total ingresos</span>
                  <strong class="chip-income">{{ currency(totals[session.id]?.income || 0) }}</strong>
                </div>
                <div class="day-summary-item">
                  <span class="muted">Total gastos</span>
                  <strong class="chip-expense">{{ currency(totals[session.id]?.expense || 0) }}</strong>
                </div>
                <div class="day-summary-item">
                  <span class="muted">Utilidad del día</span>
                  <strong :class="(totals[session.id]?.profit || 0) >= 0 ? 'chip-income' : 'chip-expense'">
                    {{ currency(totals[session.id]?.profit || 0) }}
                  </strong>
                </div>
              </div>
            </template>

            <div v-else class="state-center small muted">
              Sin movimientos en esta sesión.
            </div>
          </div>
        </div>
      </template>
    </div>
  </MainLayout>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue';
import {
  CalendarDays, TrendingUp, TrendingDown, BadgeDollarSign,
  Lock, Banknote, ChevronDown, X, Loader2
} from 'lucide-vue-next';
import api from '../services/api';
import MainLayout from '../layouts/MainLayout.vue';
import AppPanel from '../components/AppPanel.vue';
import EmptyState from '../components/EmptyState.vue';

const sessions    = ref([]);
const loading     = ref(false);
const expanded    = ref([]);
const txBySession = reactive({});
const loadingTx   = reactive({});
const totals      = reactive({});

const filters = reactive({ from: '', to: '', status: '' });

function currency(value) {
  return new Intl.NumberFormat('es-CR', { style: 'currency', currency: 'CRC', maximumFractionDigits: 2 }).format(Number(value || 0));
}

function formatDate(value) {
  return new Date(value).toLocaleDateString('es-CR', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });
}

function formatTime(value) {
  return new Date(value).toLocaleTimeString('es-CR', { hour: '2-digit', minute: '2-digit' });
}

function paymentLabel(m) {
  return { cash: 'Efectivo', sinpe: 'SINPE', card: 'Tarjeta' }[m] || m;
}

function computeTotals(id, txs) {
  const income  = txs.filter(t => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0);
  const expense = txs.filter(t => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0);
  totals[id] = { income, expense, profit: income - expense };
}

async function loadSessions() {
  loading.value = true;
  try {
    const params = {};
    if (filters.from)   params.from   = filters.from;
    if (filters.to)     params.to     = filters.to;
    if (filters.status) params.status = filters.status;

    const { data } = await api.get('/cash-sessions', { params });
    sessions.value = data.cash_sessions || data.data || [];

    // Cargar transacciones y calcular totales para cada sesión
    for (const session of sessions.value) {
      const { data: txData } = await api.get('/transactions', {
        params: { cash_session_id: session.id, per_page: 500 }
      });
      const txs = txData.transactions?.data || [];
      txBySession[session.id] = txs;
      computeTotals(session.id, txs);
    }
  } catch (e) {
    console.error(e);
  } finally {
    loading.value = false;
  }
}

function toggleSession(id) {
  if (expanded.value.includes(id)) {
    expanded.value = expanded.value.filter(i => i !== id);
  } else {
    expanded.value.push(id);
  }
}

function clearFilters() {
  filters.from = '';
  filters.to = '';
  filters.status = '';
  loadSessions();
}

onMounted(loadSessions);
</script>

<style scoped>
/* ── Filtros ── */
.filters-row {
  display: flex;
  gap: 16px;
  align-items: flex-end;
  flex-wrap: wrap;
}

.filters-row .label {
  flex: 1;
  min-width: 130px;
}

.filter-clear-btn {
  height: 42px;
  align-self: flex-end;
  white-space: nowrap;
  flex-shrink: 0;
}

/* ── Lista ── */
.sessions-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

/* ── Estado cargando / vacío ── */
.state-center {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 48px;
  color: var(--color-text-secondary);
  font-size: 0.9rem;
}

.state-center.small {
  padding: 24px;
  font-size: 0.85rem;
}

/* ── Tarjeta de sesión ── */
.session-card {
  background: var(--color-bg-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  overflow: hidden;
  transition: box-shadow 0.2s;
}

.session-card:hover {
  box-shadow: var(--shadow-md);
}

.session-card.is-open {
  border-left: 3px solid var(--color-success);
}

/* ── Header de la sesión ── */
.session-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  cursor: pointer;
  gap: 16px;
  user-select: none;
  transition: background 0.15s;
}

.session-header:hover {
  background-color: #f8fafc;
}

.session-info {
  display: flex;
  flex-direction: column;
  gap: 7px;
  min-width: 0;
}

.session-date {
  display: flex;
  align-items: center;
  gap: 7px;
  font-weight: 600;
  font-size: 0.9rem;
  color: var(--color-text-primary);
  text-transform: capitalize;
}

.session-meta {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.status-pill {
  display: inline-flex;
  align-items: center;
  padding: 2px 9px;
  border-radius: 50px;
  font-size: 0.68rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.pill-open   { background: #d1fae5; color: #047857; }
.pill-closed { background: #f1f5f9; color: #64748b; }

.meta-chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 0.78rem;
  color: var(--color-text-secondary);
}

/* ── Totales del header ── */
.session-totals {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}

.total-chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 0.8rem;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: 6px;
}

.total-chip.income  { background: var(--color-success-alpha); color: #047857; }
.total-chip.expense { background: var(--color-danger-alpha); color: #b91c1c; }
.total-chip.profit  { background: var(--color-brand-alpha); color: var(--color-brand); }
.total-chip.profit.negative { background: var(--color-danger-alpha); color: #b91c1c; }

.chevron {
  color: var(--color-text-secondary);
  transition: transform 0.2s;
  flex-shrink: 0;
}

.chevron.rotated { transform: rotate(180deg); }

/* ── Cuerpo expandido ── */
.session-body {
  border-top: 1px solid var(--color-border);
  background: #fafafa;
  padding: 20px;
}

/* ── Tipo de transacción ── */
.chip-income { color: var(--color-success); font-weight: 600; }
.chip-expense { color: var(--color-danger); font-weight: 600; }

/* ── Cards móvil ── */
.hide-mobile { display: table; width: 100%; }
.show-mobile { display: none; }

.mobile-tx-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.tx-card {
  background: #fff;
  border: 1px solid var(--color-border);
  border-radius: 10px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.tx-card-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.tx-card-meta {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  font-size: 0.78rem;
  color: var(--color-text-secondary);
}

.tx-card-desc {
  font-size: 0.8rem;
  color: var(--color-text-secondary);
  border-top: 1px solid var(--color-border);
  padding-top: 6px;
}

/* ── Resumen del día ── */
.day-summary {
  display: flex;
  gap: 24px;
  flex-wrap: wrap;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid var(--color-border);
}

.day-summary-item {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.day-summary-item span { font-size: 0.75rem; }
.day-summary-item strong { font-size: 0.95rem; }

/* ── Spin ── */
.spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* ── Responsive ── */
@media (max-width: 768px) {
  .session-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
    padding: 14px 16px;
  }

  .session-totals {
    width: 100%;
    justify-content: space-between;
  }

  .session-body {
    padding: 14px;
  }
}

@media (max-width: 640px) {
  .hide-mobile { display: none; }
  .show-mobile { display: block; }

  .filters-row .label { min-width: 100%; }

  .filter-clear-btn {
    width: 100%;
    justify-content: center;
  }

  .total-chip { font-size: 0.72rem; padding: 3px 7px; }

  .day-summary { gap: 14px; }
}
</style>