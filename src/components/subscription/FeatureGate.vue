<template>
  <slot v-if="hasAccess" />
  <div v-else-if="showFallback" class="feature-gate-fallback">
    <div class="fallback-content">
      <div class="fallback-icon">🔒</div>
      <p class="fallback-text">{{ fallbackMessage }}</p>
      <button
        v-if="showUpgradeButton"
        class="btn btn-sm btn-primary"
        @click="handleUpgrade"
      >
        Upgrade to Pro
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useSubscription } from '../../composables/useSubscription'
import { usePaywall } from '../../composables/usePaywall'
import { useRouter } from 'vue-router'

const props = defineProps({
  /**
   * 需要的权限级别：'pro', 'enterprise', 'paid'
   */
  feature: {
    type: String,
    default: 'pro',
    validator: (value) => ['pro', 'enterprise', 'paid'].includes(value)
  },
  /**
   * 是否显示降级内容
   */
  showFallback: {
    type: Boolean,
    default: true
  },
  /**
   * 降级显示的消息
   */
  fallbackMessage: {
    type: String,
    default: 'This feature is available for Pro users only.'
  },
  /**
   * 是否显示升级按钮
   */
  showUpgradeButton: {
    type: Boolean,
    default: true
  }
})

const router = useRouter()
const { isPro, isEnterprise, isPaid, subscriptionActive } = useSubscription()
const { triggerPaywall } = usePaywall()

const hasAccess = computed(() => {
  if (!subscriptionActive.value) return false

  switch (props.feature) {
    case 'pro':
      return isPro.value || isEnterprise.value
    case 'enterprise':
      return isEnterprise.value
    case 'paid':
      return isPaid.value
    default:
      return false
  }
})

function handleUpgrade() {
  triggerPaywall(props.fallbackMessage)
}
</script>

<style scoped>
.feature-gate-fallback {
  padding: 2rem;
  background: #f7fafc;
  border-radius: 0.75rem;
  border: 2px dashed #e2e8f0;
  text-align: center;
}

.fallback-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.fallback-icon {
  font-size: 2rem;
}

.fallback-text {
  color: #718096;
  font-size: 0.875rem;
  line-height: 1.5;
}

.btn-sm {
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
}
</style>
