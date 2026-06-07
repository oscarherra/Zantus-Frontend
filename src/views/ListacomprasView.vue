<template>
  <MainLayout title="Lista de compras" subtitle="Faltantes y artículos por reponer en la soda">

    <div class="grid grid-2">
      <!-- Panel agregar ítem -->
      <AppPanel title="Agregar faltante" subtitle="¿Qué hace falta en la soda?">
        <form class="form-grid" @submit.prevent="addItem">
          <label class="label">
            Nombre del artículo
            <input
              v-model="form.name"
              class="input"
              type="text"
              placeholder="Ej. Queso mozarella"
              required
              autofocus
            />
          </label>

          <div class="form-grid two">
            <label class="label">
              Cantidad
              <input
                v-model="form.quantity"
                class="input"
                type="text"
                placeholder="Ej. 2"
              />
            </label>
            <label class="label">
              Unidad
              <select v-model="form.unit" class="select">
                <option value="">Sin unidad</option>
                <option value="kg">Kilogramos (kg)</option>
                <option value="g">Gramos (g)</option>
                <option value="L">Litros (L)</option>
                <option value="ml">Mililitros (ml)</option>
                <option value="unidad">Unidad(es)</option>
                <option value="paquete">Paquete(s)</option>
                <option value="caja">Caja(s)</option>
                <option value="bolsa">Bolsa(s)</option>
                <option value="docena">Docena(s)</option>
              </select>
            </label>
          </div>

          <label class="label">
            Nota (opcional)
            <input
              v-model="form.notes"
              class="input"
              type="text"
              placeholder="Ej. Marca Los Alpes, no otra"
            />
          </label>

          <label class="label">
            Categoría
            <select v-model="form.category" class="select">
              <option value="general">General</option>
              <option value="lacteos">Lácteos</option>
              <option value="carnes">Carnes</option>
              <option value="vegetales">Vegetales / Frutas</option>
              <option value="bebidas">Bebidas</option>
              <option value="panaderia">Panadería</option>
              <option value="limpieza">Limpieza</option>
              <option value="condimentos">Condimentos</option>
              <option value="otros">Otros</option>
            </select>
          </label>

          <button type="submit" class="btn btn-primary" :disabled="!form.name.trim()">
            <Plus size="18" /> Agregar a la lista
          </button>
        </form>

        <div v-if="success" class="success-box" style="margin-top: 12px;">{{ success }}</div>
        <div v-if="error" class="error-box" style="margin-top: 12px;">{{ error }}</div>
      </AppPanel>

      <!-- Panel resumen + acciones -->
      <AppPanel title="Resumen" subtitle="Estado de la lista de compras">
        <div class="summary-stats">
          <div class="summary-stat">
            <span class="summary-number pending-color">{{ pendingItems.length }}</span>
            <span class="summary-label">Pendientes</span>
          </div>
          <div class="summary-divider"></div>
          <div class="summary-stat">
            <span class="summary-number done-color">{{ doneItems.length }}</span>
            <span class="summary-label">Comprados</span>
          </div>
          <div class="summary-divider"></div>
          <div class="summary-stat">
            <span class="summary-number">{{ items.length }}</span>
            <span class="summary-label">Total</span>
          </div>
        </div>

        <!-- Filtros -->
        <div class="filter-tabs">
          <button
            v-for="tab in tabs"
            :key="tab.value"
            class="tab-btn"
            :class="{ active: activeTab === tab.value }"
            @click="activeTab = tab.value"
          >
            {{ tab.label }}
            <span class="tab-count">{{ tab.count }}</span>
          </button>
        </div>

        <!-- Acciones PDF -->
        <div class="pdf-actions">
          <button class="btn btn-secondary" @click="downloadPdf('pending')" :disabled="!pendingItems.length">
            <FileDown size="16" /> PDF pendientes
          </button>
          <button class="btn btn-secondary" @click="downloadPdf('all')" :disabled="!items.length">
            <FileDown size="16" /> PDF completo
          </button>
        </div>

        <!-- Acción limpiar comprados -->
        <button
          v-if="doneItems.length"
          class="btn btn-danger-soft"
          style="margin-top: 12px; width: 100%;"
          @click="clearDone"
        >
          <Trash2 size="16" /> Limpiar {{ doneItems.length }} comprado(s)
        </button>
      </AppPanel>
    </div>

    <!-- Lista de ítems en tarjetas -->
    <div class="items-section">
      <div v-if="loading" class="state-center">
        <Loader2 size="24" class="spin" /> Cargando lista...
      </div>

      <EmptyState v-else-if="!filteredItems.length">
        {{ activeTab === 'pending' ? 'No hay artículos pendientes. ¡Todo está completo!' :
           activeTab === 'done' ? 'Aún no has marcado nada como comprado.' :
           'La lista está vacía. Agrega el primer faltante.' }}
      </EmptyState>

      <div v-else class="items-grid">
        <div
          v-for="item in filteredItems"
          :key="item.id"
          class="item-card"
          :class="[`cat-${item.category || 'general'}`, { 'is-done': item.status === 'done' }]"
        >
          <!-- Checkbox superior -->
          <div class="item-card-header">
            <button
              class="check-btn"
              :class="{ checked: item.status === 'done' }"
              @click="toggleItem(item)"
              :title="item.status === 'done' ? 'Marcar pendiente' : 'Marcar comprado'"
            >
              <Check size="14" />
            </button>
            <span class="item-category-badge">{{ categoryLabel(item.category) }}</span>
            <button class="delete-btn" @click="deleteItem(item.id)" title="Eliminar">
              <X size="14" />
            </button>
          </div>

          <!-- Contenido -->
          <div class="item-card-body">
            <p class="item-name" :class="{ crossed: item.status === 'done' }">{{ item.name }}</p>
            <p v-if="item.quantity || item.unit" class="item-qty">
              {{ item.quantity }} {{ item.unit }}
            </p>
            <p v-if="item.notes" class="item-notes">
              <MessageSquare size="11" /> {{ item.notes }}
            </p>
          </div>

          <!-- Footer -->
          <div class="item-card-footer">
            <span class="item-date">{{ formatDate(item.created_at) }}</span>
            <span v-if="item.status === 'done'" class="done-tag">
              <CheckCircle2 size="12" /> Comprado
            </span>
          </div>
        </div>
      </div>
    </div>

  </MainLayout>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue';
import {
  Plus, Check, X, Trash2, FileDown, Loader2,
  MessageSquare, CheckCircle2
} from 'lucide-vue-next';
import api from '../services/api';
import MainLayout from '../layouts/MainLayout.vue';
import AppPanel from '../components/AppPanel.vue';
import EmptyState from '../components/EmptyState.vue';

// ── State ──
const items     = ref([]);
const loading   = ref(false);
const success   = ref('');
const error     = ref('');
const activeTab = ref('pending');

const form = reactive({
  name: '',
  quantity: '',
  unit: '',
  notes: '',
  category: 'general',
});

// ── Computed ──
const pendingItems  = computed(() => items.value.filter(i => i.status === 'pending'));
const doneItems     = computed(() => items.value.filter(i => i.status === 'done'));
const filteredItems = computed(() => {
  if (activeTab.value === 'pending') return pendingItems.value;
  if (activeTab.value === 'done')    return doneItems.value;
  return items.value;
});

const tabs = computed(() => [
  { value: 'pending', label: 'Pendientes', count: pendingItems.value.length },
  { value: 'done',    label: 'Comprados',  count: doneItems.value.length },
  { value: 'all',     label: 'Todos',      count: items.value.length },
]);

// ── Helpers ──
function categoryLabel(cat) {
  const map = {
    general: 'General', lacteos: 'Lácteos', carnes: 'Carnes',
    vegetales: 'Vegetales', bebidas: 'Bebidas', panaderia: 'Panadería',
    limpieza: 'Limpieza', condimentos: 'Condimentos', otros: 'Otros',
  };
  return map[cat] || 'General';
}

function formatDate(value) {
  return new Date(value).toLocaleDateString('es-CR', { day: '2-digit', month: 'short' });
}

function clearMessages() { success.value = ''; error.value = ''; }

// ── API ──
async function loadItems() {
  loading.value = true;
  try {
    const { data } = await api.get('/shopping-items');
    items.value = data.items || [];
  } catch (e) {
    error.value = 'No se pudo cargar la lista.';
  } finally {
    loading.value = false;
  }
}

async function addItem() {
  clearMessages();
  try {
    const { data } = await api.post('/shopping-items', { ...form });
    items.value.unshift(data.item);
    success.value = `"${form.name}" agregado a la lista.`;
    form.name = ''; form.quantity = ''; form.unit = '';
    form.notes = ''; form.category = 'general';
    setTimeout(() => success.value = '', 3000);
  } catch (e) {
    error.value = e?.response?.data?.message || 'No se pudo agregar el artículo.';
  }
}

async function toggleItem(item) {
  const newStatus = item.status === 'pending' ? 'done' : 'pending';
  try {
    await api.patch(`/shopping-items/${item.id}`, { status: newStatus });
    item.status = newStatus;
  } catch (e) {
    error.value = 'No se pudo actualizar el artículo.';
  }
}

async function deleteItem(id) {
  try {
    await api.delete(`/shopping-items/${id}`);
    items.value = items.value.filter(i => i.id !== id);
  } catch (e) {
    error.value = 'No se pudo eliminar el artículo.';
  }
}

async function clearDone() {
  try {
    await api.delete('/shopping-items/done');
    items.value = items.value.filter(i => i.status !== 'done');
  } catch (e) {
    error.value = 'No se pudo limpiar los artículos comprados.';
  }
}

// ── PDF con jsPDF (CDN via dynamic import) ──
async function downloadPdf(mode) {
  const list = mode === 'pending' ? pendingItems.value : items.value;
  if (!list.length) return;

  // Cargar jsPDF dinámicamente
  const { jsPDF } = await import('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js').catch(() => null)
    || await import('jspdf');

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageW = doc.internal.pageSize.getWidth();
  const margin = 18;
  let y = margin;

  // Header
  doc.setFillColor(37, 99, 235);
  doc.rect(0, 0, pageW, 28, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text("Lista de Compras - Zantu's ERP", margin, 12);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  const dateStr = new Date().toLocaleDateString('es-CR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  doc.text(dateStr, margin, 21);
  doc.text(mode === 'pending' ? 'Solo pendientes' : 'Lista completa', pageW - margin, 21, { align: 'right' });

  y = 38;

  // Agrupar por categoría
  const grouped = {};
  for (const item of list) {
    const cat = categoryLabel(item.category || 'general');
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(item);
  }

  doc.setTextColor(24, 24, 27);

  for (const [cat, catItems] of Object.entries(grouped)) {
    // Verificar espacio
    if (y > 265) { doc.addPage(); y = margin; }

    // Encabezado de categoría
    doc.setFillColor(244, 244, 245);
    doc.roundedRect(margin, y, pageW - margin * 2, 8, 2, 2, 'F');
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(82, 82, 91);
    doc.text(cat.toUpperCase(), margin + 4, y + 5.5);
    y += 11;

    for (const item of catItems) {
      if (y > 272) { doc.addPage(); y = margin; }

      // Checkbox
      doc.setDrawColor(180, 180, 190);
      doc.setLineWidth(0.4);
      doc.roundedRect(margin, y + 0.5, 5, 5, 1, 1, 'S');

      if (item.status === 'done') {
        doc.setDrawColor(16, 185, 129);
        doc.setLineWidth(0.8);
        doc.line(margin + 1, y + 3, margin + 2.5, y + 4.8);
        doc.line(margin + 2.5, y + 4.8, margin + 4.5, y + 1.5);
      }

      // Nombre
      doc.setFont('helvetica', item.status === 'done' ? 'normal' : 'bold');
      doc.setFontSize(10);
      doc.setTextColor(item.status === 'done' ? 150 : 24, item.status === 'done' ? 150 : 24, item.status === 'done' ? 150 : 27);
      doc.text(item.name, margin + 8, y + 4.5);

      // Cantidad + unidad
      if (item.quantity || item.unit) {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(82, 82, 91);
        const qtyText = `${item.quantity || ''} ${item.unit || ''}`.trim();
        doc.text(qtyText, pageW - margin, y + 4.5, { align: 'right' });
      }

      y += 8;

      // Nota
      if (item.notes) {
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(8);
        doc.setTextColor(130, 130, 140);
        doc.text(`  ${item.notes}`, margin + 8, y);
        y += 6;
      }

      // Línea separadora ligera
      doc.setDrawColor(228, 228, 231);
      doc.setLineWidth(0.2);
      doc.line(margin + 8, y, pageW - margin, y);
      y += 3;
    }

    y += 4;
  }

  // Footer
  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(160, 160, 170);
    doc.text(`Página ${i} de ${totalPages}`, pageW / 2, 292, { align: 'center' });
  }

  doc.save(`lista-compras-${new Date().toISOString().slice(0, 10)}.pdf`);
}

onMounted(loadItems);
</script>

<style scoped>
/* ── Resumen ── */
.summary-stats {
  display: flex;
  align-items: center;
  justify-content: space-around;
  padding: 16px 0 20px;
  gap: 8px;
}

.summary-stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.summary-number {
  font-size: 2rem;
  font-weight: 800;
  line-height: 1;
  color: var(--color-text-primary);
}

.pending-color { color: #f59e0b; }
.done-color    { color: var(--color-success); }

.summary-label {
  font-size: 0.75rem;
  color: var(--color-text-secondary);
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.summary-divider {
  width: 1px;
  height: 40px;
  background: var(--color-border);
}

/* ── Tabs ── */
.filter-tabs {
  display: flex;
  gap: 6px;
  margin-bottom: 16px;
  border-bottom: 1px solid var(--color-border);
  padding-bottom: 12px;
}

.tab-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  border-radius: 6px;
  border: 1px solid var(--color-border);
  background: transparent;
  font-size: 0.82rem;
  font-weight: 500;
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all 0.15s;
}

.tab-btn:hover {
  background: #f4f4f5;
  color: var(--color-text-primary);
}

.tab-btn.active {
  background: var(--color-brand-alpha);
  color: var(--color-brand);
  border-color: var(--color-brand);
  font-weight: 600;
}

.tab-count {
  background: currentColor;
  color: white;
  font-size: 0.68rem;
  font-weight: 700;
  padding: 1px 6px;
  border-radius: 50px;
  opacity: 0.85;
}

/* ── Acciones PDF ── */
.pdf-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.pdf-actions .btn {
  flex: 1;
  min-width: 130px;
  font-size: 0.82rem;
  padding: 8px 12px;
}

/* ── Botón danger soft ── */
.btn-danger-soft {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: var(--radius-md);
  border: 1px solid rgba(239, 68, 68, 0.3);
  background: var(--color-danger-alpha);
  color: var(--color-danger);
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s;
}

.btn-danger-soft:hover {
  background: rgba(239, 68, 68, 0.15);
}

/* ── Sección de items ── */
.items-section {
  min-height: 120px;
}

.state-center {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 48px;
  color: var(--color-text-secondary);
}

/* ── Grid de tarjetas ── */
.items-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 14px;
}

/* ── Tarjeta de ítem ── */
.item-card {
  border-radius: 14px;
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  border: 1.5px solid transparent;
  transition: transform 0.15s, box-shadow 0.15s;
  position: relative;
  min-height: 130px;
}

.item-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0,0,0,0.10);
}

.item-card.is-done {
  opacity: 0.6;
}

/* Colores por categoría */
.cat-general     { background: #fefce8; border-color: #fde68a; }
.cat-lacteos     { background: #eff6ff; border-color: #bfdbfe; }
.cat-carnes      { background: #fff1f2; border-color: #fecdd3; }
.cat-vegetales   { background: #f0fdf4; border-color: #bbf7d0; }
.cat-bebidas     { background: #f0f9ff; border-color: #bae6fd; }
.cat-panaderia   { background: #fffbeb; border-color: #fde68a; }
.cat-limpieza    { background: #faf5ff; border-color: #e9d5ff; }
.cat-condimentos { background: #fff7ed; border-color: #fed7aa; }
.cat-otros       { background: #f8fafc; border-color: #e2e8f0; }

/* ── Header de la tarjeta ── */
.item-card-header {
  display: flex;
  align-items: center;
  gap: 6px;
}

.check-btn {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: 2px solid #cbd5e1;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: transparent;
  transition: all 0.15s;
  flex-shrink: 0;
  padding: 0;
}

.check-btn:hover {
  border-color: var(--color-success);
  color: var(--color-success);
}

.check-btn.checked {
  background: var(--color-success);
  border-color: var(--color-success);
  color: white;
}

.item-category-badge {
  flex: 1;
  font-size: 0.65rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #64748b;
}

.delete-btn {
  width: 22px;
  height: 22px;
  border-radius: 6px;
  border: none;
  background: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #94a3b8;
  transition: all 0.15s;
  padding: 0;
  flex-shrink: 0;
}

.delete-btn:hover {
  background: var(--color-danger-alpha);
  color: var(--color-danger);
}

/* ── Body ── */
.item-card-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.item-name {
  font-size: 0.95rem;
  font-weight: 700;
  color: #1e293b;
  line-height: 1.3;
  word-break: break-word;
}

.item-name.crossed {
  text-decoration: line-through;
  color: #94a3b8;
}

.item-qty {
  font-size: 0.8rem;
  font-weight: 600;
  color: #475569;
}

.item-notes {
  font-size: 0.75rem;
  color: #64748b;
  display: flex;
  align-items: flex-start;
  gap: 4px;
  font-style: italic;
  line-height: 1.4;
}

/* ── Footer ── */
.item-card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-top: 1px solid rgba(0,0,0,0.07);
  padding-top: 8px;
  margin-top: auto;
}

.item-date {
  font-size: 0.7rem;
  color: #94a3b8;
}

.done-tag {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  font-size: 0.68rem;
  font-weight: 700;
  color: var(--color-success);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

/* ── Spin ── */
.spin { animation: spin 1s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

/* ── Responsive ── */
@media (max-width: 640px) {
  .items-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px;
  }

  .filter-tabs {
    flex-wrap: wrap;
  }

  .tab-btn {
    flex: 1;
    justify-content: center;
    padding: 6px 8px;
  }

  .pdf-actions {
    flex-direction: column;
  }

  .pdf-actions .btn {
    width: 100%;
  }

  .item-card {
    min-height: 110px;
    padding: 12px;
  }

  .item-name {
    font-size: 0.85rem;
  }
}

@media (max-width: 380px) {
  .items-grid {
    grid-template-columns: 1fr;
  }
}
</style>