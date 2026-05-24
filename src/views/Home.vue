<template>
  <div class="container">
    <header class="app-header">
      <h1 class="app-title">Get Your Chinese Name</h1>
      <p class="app-subtitle">Discover your meaningful, culturally authentic Chinese name</p>
      <div class="header-actions">
        <router-link to="/pricing" class="btn btn-outline">
          💎 Upgrade to Pro
        </router-link>
        <UserProfile />
      </div>
    </header>

    <main class="app-main">
      <NameGenerator @generated="handleGenerated" />

      <div v-if="generatedNames.length > 0">
        <NameResult
          :names="generatedNames"
          :user-input="userInput"
        />
      </div>

      <History @load-history="handleLoadHistory" />
    </main>

    <footer class="app-footer">
      <p>© {{ new Date().getFullYear() }} Chinese Name Generator. All rights reserved.</p>
      <div class="footer-links">
        <router-link to="/pricing">Pricing</router-link>
        <a href="#" target="_blank">Privacy Policy</a>
        <a href="#" target="_blank">Terms of Service</a>
      </div>
    </footer>

    <SubscriptionModal
      v-model:show="showSubscriptionModal"
      :reason="paywallReason"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import NameGenerator from '../components/NameGenerator.vue'
import NameResult from '../components/NameResult.vue'
import History from '../components/History.vue'
import UserProfile from '../components/subscription/UserProfile.vue'
import SubscriptionModal from '../components/subscription/SubscriptionModal.vue'
import { usePaywall } from '../composables/usePaywall'

const generatedNames = ref([])
const userInput = ref(null)
const showSubscriptionModal = ref(false)
const { paywallReason } = usePaywall()

/**
 * 处理生成结果
 * @param {Array} names 生成的名字列表
 * @param {Object} input 用户输入参数
 */
function handleGenerated(names, input) {
  generatedNames.value = names
  userInput.value = input
}

/**
 * 处理加载历史记录
 * @param {Array} names 历史名字列表
 * @param {Object} input 用户输入参数
 */
function handleLoadHistory(names, input) {
  generatedNames.value = names
  userInput.value = input
  // 滚动到结果区域
  document.querySelector('.name-result-section')?.scrollIntoView({ behavior: 'smooth' })
}
</script>

<style scoped>
.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem 1rem;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.app-header {
  text-align: center;
  margin-bottom: 3rem;
}

.app-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: #2d3748;
  margin-bottom: 0.5rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.app-subtitle {
  font-size: 1.125rem;
  color: #718096;
  margin-bottom: 1.5rem;
}

.header-actions {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.app-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.app-footer {
  margin-top: 4rem;
  padding-top: 2rem;
  border-top: 1px solid #e2e8f0;
  text-align: center;
  color: #718096;
  font-size: 0.875rem;
}

.footer-links {
  display: flex;
  justify-content: center;
  gap: 1.5rem;
  margin-top: 1rem;
}

.footer-links a {
  color: #667eea;
  text-decoration: none;
  transition: color 0.2s;
}

.footer-links a:hover {
  color: #764ba2;
}

@media (max-width: 768px) {
  .app-title {
    font-size: 2rem;
  }

  .app-subtitle {
    font-size: 1rem;
  }
}
</style>
