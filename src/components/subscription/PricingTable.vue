<template>
  <div class="pricing-grid">
    <div
      v-for="plan in PLANS"
      :key="plan.id"
      class="pricing-card"
      :class="{ 'popular-card': plan.popular }"
    >
      <div v-if="plan.popular" class="popular-badge">
        Most Popular
      </div>

      <div class="card-header">
        <h3 class="plan-name">{{ plan.name }}</h3>
        <div class="plan-price">
          <span class="price-amount">{{ plan.price }}</span>
          <span class="price-interval" v-if="plan.interval !== 'forever'">
            {{ plan.interval }}
          </span>
        </div>
        <p v-if="plan.yearlyPrice" class="yearly-price">
          {{ plan.yearlyPrice }}
        </p>
      </div>

      <div class="card-features">
        <ul>
          <li v-for="(feature, index) in plan.features" :key="index">
            <span class="check-icon">✅</span>
            <span class="feature-text">{{ feature }}</span>
          </li>
        </ul>
      </div>

      <div class="card-footer">
        <button
          class="btn"
          :class="{
            'btn-primary': plan.popular,
            'btn-outline': !plan.popular,
            'btn-disabled': isCurrentPlan(plan.id) || plan.id === 'enterprise'
          }"
          @click="handleSelectPlan(plan)"
          :disabled="isCurrentPlan(plan.id) || plan.id === 'enterprise'"
        >
          {{ getButtonText(plan) }}
        </button>

        <p v-if="plan.id === 'enterprise'" class="enterprise-note">
          Contact us for enterprise pricing and custom solutions.
        </p>
      </div>
    </div>
  </div>

  <LoginModal v-model:show="showLoginModal" />
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../../composables/useAuth'
import { useSubscription } from '../../composables/useSubscription'
import { PLANS, createCheckoutSession } from '../../services/stripe'
import LoginModal from './LoginModal.vue'

const { isLoggedIn } = useAuth()
const { currentPlan, loading } = useSubscription()
const router = useRouter()

const showLoginModal = ref(false)
const selectedPlan = ref(null)

/**
 * 检查是否是当前套餐
 * @param {string} planId 套餐ID
 * @returns {boolean}
 */
function isCurrentPlan(planId) {
  return currentPlan.value.id === planId
}

/**
 * 获取按钮文本
 * @param {Object} plan 套餐信息
 * @returns {string}
 */
function getButtonText(plan) {
  if (isCurrentPlan(plan.id)) {
    return 'Current Plan'
  }
  if (plan.id === 'enterprise') {
    return 'Contact Sales'
  }
  return plan.cta
}

/**
 * 处理选择套餐
 * @param {Object} plan 套餐信息
 */
async function handleSelectPlan(plan) {
  if (plan.id === 'enterprise') {
    // 企业版可以跳转到联系页面或打开联系表单
    window.open('mailto:sales@chinesenamegenerator.com', '_blank')
    return
  }

  if (isCurrentPlan(plan.id)) {
    return
  }

  if (!isLoggedIn()) {
    selectedPlan.value = plan
    showLoginModal.value = true
    return
  }

  // 创建结账会话
  const priceId = plan.priceId
  if (!priceId) {
    console.error('Price ID not found for plan:', plan.id)
    return
  }

  loading.value = true
  const { error } = await createCheckoutSession(priceId)
  loading.value = false

  if (error) {
    console.error('Failed to create checkout session:', error)
    alert('Failed to start checkout process. Please try again later.')
  }
}

/**
 * 登录成功后处理
 */
async function handleLoginSuccess() {
  showLoginModal.value = false
  if (selectedPlan.value) {
    await handleSelectPlan(selectedPlan.value)
    selectedPlan.value = null
  }
}
</script>

<style scoped>
.pricing-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 2rem;
  max-width: 1000px;
  margin: 0 auto;
}

.pricing-card {
  background: white;
  border-radius: 1rem;
  padding: 2rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  position: relative;
  transition: transform 0.2s, box-shadow 0.2s;
  border: 2px solid transparent;
  display: flex;
  flex-direction: column;
}

.pricing-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

.popular-card {
  border-color: #667eea;
  transform: scale(1.05);
}

.popular-card:hover {
  transform: scale(1.05) translateY(-4px);
}

.popular-badge {
  position: absolute;
  top: -12px;
  left: 50%;
  transform: translateX(-50%);
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 0.25rem 1rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
}

.card-header {
  text-align: center;
  margin-bottom: 2rem;
}

.plan-name {
  font-size: 1.5rem;
  font-weight: 700;
  color: #2d3748;
  margin-bottom: 1rem;
}

.plan-price {
  margin-bottom: 0.5rem;
}

.price-amount {
  font-size: 3rem;
  font-weight: 700;
  color: #2d3748;
}

.price-interval {
  font-size: 1rem;
  color: #718096;
  font-weight: 400;
  margin-left: 0.25rem;
}

.yearly-price {
  color: #38a169;
  font-size: 0.875rem;
  font-weight: 500;
}

.card-features {
  flex: 1;
  margin-bottom: 2rem;
}

.card-features ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.card-features li {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 0.75rem 0;
  border-bottom: 1px solid #e2e8f0;
  line-height: 1.5;
}

.card-features li:last-child {
  border-bottom: none;
}

.check-icon {
  color: #38a169;
  font-size: 1rem;
  margin-top: 0.125rem;
  flex-shrink: 0;
}

.feature-text {
  color: #4a5568;
  font-size: 0.875rem;
}

.card-footer {
  text-align: center;
}

.card-footer .btn {
  width: 100%;
}

.btn-disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.enterprise-note {
  margin-top: 1rem;
  font-size: 0.75rem;
  color: #718096;
  line-height: 1.5;
}

@media (max-width: 768px) {
  .pricing-grid {
    grid-template-columns: 1fr;
  }

  .popular-card {
    transform: none;
  }

  .popular-card:hover {
    transform: translateY(-4px);
  }
}
</style>
