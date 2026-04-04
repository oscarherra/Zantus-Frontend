<template>
  <div class="topbar-container">
    <div class="topbar-left">
      <h1 class="page-title">{{ title }}</h1>
      <p v-if="subtitle" class="page-subtitle">{{ subtitle }}</p>
    </div>

    <div class="topbar-right">
      <div class="user-profile">
        <div class="avatar">
          <User size="18" stroke-width="2.5" />
        </div>
        <div class="user-info">
          <span class="user-name">{{ user?.name || 'Administrador' }}</span>
          <span class="user-role">{{ user?.role?.toUpperCase() || 'ADMIN' }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { User } from 'lucide-vue-next';
import { useAuthStore } from '../stores/auth';

defineProps({
  title: String,
  subtitle: String,
});

const auth = useAuthStore();
const user = computed(() => auth.user);
</script>

<style scoped>
.topbar-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  min-width: 0;
  gap: 12px;
}

.topbar-left {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
  flex: 1;
}

.page-title {
  font-size: 1.375rem;
  font-weight: 700;
  color: var(--color-text-primary);
  margin: 0;
  line-height: 1.2;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.page-subtitle {
  font-size: 0.8rem;
  color: var(--color-text-secondary);
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.topbar-right {
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

.user-profile {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 5px 14px 5px 5px;
  background-color: #f4f4f5;
  border-radius: 50px;
  border: 1px solid var(--color-border);
  max-width: 100%;
}

.avatar {
  width: 30px;
  height: 30px;
  background-color: var(--color-brand-alpha);
  color: var(--color-brand);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.user-info {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.user-name {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--color-text-primary);
  line-height: 1.2;
  white-space: nowrap;
}

.user-role {
  font-size: 0.65rem;
  color: var(--color-text-secondary);
  line-height: 1.2;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-weight: 500;
  white-space: nowrap;
}

/* Mobile */
@media (max-width: 640px) {
  .page-title {
    font-size: 1.05rem;
  }

  .page-subtitle {
    display: none;
  }

  .user-info {
    display: none;
  }

  .user-profile {
    padding: 5px;
    border-radius: 50%;
  }
}
</style>