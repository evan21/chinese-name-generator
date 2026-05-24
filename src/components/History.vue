<template>
  <div class="history-section" v-if="history.length > 0">
    <h3 class="history-title">Your Previously Generated Names</h3>
    <div class="history-list">
      <div v-for="(item, index) in history" :key="index" class="history-item">
        <div class="history-date">
          {{ new Date(item.timestamp).toLocaleDateString() }}
        </div>
        <div class="history-names">
          <span v-for="name in item.names.slice(0, 3)" :key="name.name" class="history-name">
            {{ name.name }}
          </span>
          <span v-if="item.names.length > 3">+{{ item.names.length - 3 }} more</span>
        </div>
        <button @click="loadHistory(item)" class="btn-small">
          Load
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const emit = defineEmits(['load-history'])

const history = ref([])

onMounted(() => {
  const savedHistory = localStorage.getItem('nameHistory')
  if (savedHistory) {
    history.value = JSON.parse(savedHistory)
  }
})

const loadHistory = (item) => {
  emit('load-history', item)
}
</script>

<style scoped>
.history-section {
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid #e0e0e0;
}

.history-title {
  font-size: 1.2rem;
  color: #333;
  margin-bottom: 1rem;
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
}

.history-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.8rem;
  background: #f8fafc;
  border-radius: 8px;
}

.history-date {
  color: #64748b;
  font-size: 0.9rem;
  width: 100px;
}

.history-names {
  flex: 1;
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.history-name {
  background: #e0e7ff;
  color: #4f46e5;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  font-size: 0.85rem;
  font-family: 'Microsoft YaHei', 'PingFang SC', sans-serif;
}

.btn-small {
  padding: 0.4rem 0.8rem;
  font-size: 0.85rem;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

.btn-small:hover {
  background: #5568d3;
}
</style>
