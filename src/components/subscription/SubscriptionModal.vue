<template>
  <div v-if="show" class="modal-overlay" @click.self="handleClose">
    <div class="modal-content">
      <button class="close-btn" @click="handleClose">×</button>

      <div class="modal-header">
        <div class="upgrade-icon">💎</div>
        <h2 class="modal-title">Upgrade to Pro</h2>
        <p class="modal-subtitle">
          {{ reason || 'Unlock all premium features and get unlimited name generations.' }}
        </p>
      </div>

      <div class="modal-body">
        <div class="features-highlight">
          <h3>Pro benefits include:</h3>
          <ul>
            <li>✅ Unlimited name generations</li>
            <li>✅ Advanced AI name analysis</li>
            <li>✅ Custom surname support</li>
            <li>✅ Calligraphy generation</li>
            <li>✅ HD wallpaper and business card export</li>
            <li>✅ No advertisements</li>
            <li>✅ Priority support</li>
          </ul>
        </div>

        <div class="pricing-option">
          <div class="pricing-details">
            <div class="price">
              $4.99 <span class="interval">/ month</span>
            </div>
            <p class="price-note">or $29.99/year (save 50%)</p>
          </div>
          <button
            class="btn btn-primary"
            @click="handleUpgrade"
            :disabled="loading"
          >
            {{ loading ? 'Redirecting to checkout...' : 'Upgrade Now' }}
          </button>
        </div>

        <div class="footer-notes">
          <p>🔒 Secure payment powered by Stripe</p>
          <p>📝 7-day free trial • Cancel anytime</p>
        </div>
      </div>
    </div>
  </div>

  <LoginModal v-model:show="showLoginModal" />
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../../composables/useAuth'
import { useSubscription } from '../../composables/useSubscription'
import { PRICE_IDS } from '../../services/stripe'
import LoginModal from './LoginModal.vue'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  reason: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['update:show'])

const { isLoggedIn } = useAuth()
const { subscribe, loading } = useSubscription()
const router = useRouter()

const showLoginModal = ref(false)

/**
 * 关闭弹窗
 */
function handleClose() {
  emit('update:show', false)
}

/**
 * 处理升级
 */
async function handleUpgrade() {
  if (!isLoggedIn()) {
    showLoginModal.value = true
    return
  }

  // 跳转到结账页面
  const { error } = await subscribe(PRICE_IDS.PRO_MONTHLY)
  if (!error) {
    handleClose()
  }
}

/**
 * 登录成功后处理
 */
async function handleLoginSuccess() {
  showLoginModal.value = false
  await handleUpgrade()
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-content {
  background: white;
  border-radius: 1rem;
  padding: 2rem;
  max-width: 500px;
  width: 100%;
  position: relative;
}

.close-btn {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #718096;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background-color 0.2s;
}

.close-btn:hover {
  background: #f7fafc;
}

.modal-header {
  text-align: center;
  margin-bottom: 2rem;
}

.upgrade-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.modal-title {
  font-size: 1.75rem;
  font-weight: 700;
  color: #2d3748;
  margin-bottom: 0.5rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.modal-subtitle {
  color: #718096;
  font-size: 1rem;
  line-height: 1.6;
}

.features-highlight {
  background: #f7fafc;
  padding: 1.5rem;
  border-radius: 0.75rem;
  margin-bottom: 2rem;
}

.features-highlight h3 {
  font-size: 1.125rem;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 1rem;
  text-align: center;
}

.features-highlight ul {
  list-style: none;
  padding: 0;
  margin: 0;
  columns: 2;
  gap: 1rem;
}

.features-highlight li {
  color: #4a5568;
  padding: 0.25rem 0;
  font-size: 0.875rem;
}

.pricing-option {
  background: linear-gradient(135deg, #667eea15 0%, #764ba215 100%);
  border: 2px solid #667eea;
  border-radius: 0.75rem;
  padding: 1.5rem;
  text-align: center;
  margin-bottom: 1.5rem;
}

.pricing-details {
  margin-bottom: 1rem;
}

.price {
  font-size: 2rem;
  font-weight: 700;
  color: #2d3748;
  margin-bottom: 0.25rem;
}

.interval {
  font-size: 1rem;
  color: #718096;
  font-weight: 400;
}

.price-note {
  color: #38a169;
  font-size: 0.875rem;
  font-weight: 500;
}

.footer-notes {
  text-align: center;
  font-size: 0.75rem;
  color: #718096;
  line-height: 1.6;
}

.footer-notes p {
  margin: 0.25rem 0;
}

@media (max-width: 768px) {
  .features-highlight ul {
    columns: 1;
  }

  .modal-content {
    padding: 1.5rem;
  }

  .modal-title {
    font-size: 1.5rem;
  }
}
</style>
