import { ref, computed } from 'vue'
import { useSubscription } from './useSubscription'

const USAGE_KEY = 'name_generator_usage'
const DAILY_LIMIT_FREE = 3 // 免费用户每日生成次数限制

/**
 * 获取今日使用次数
 * @returns {number}
 */
function getTodayUsage() {
  try {
    const usageData = JSON.parse(localStorage.getItem(USAGE_KEY) || '{}')
    const today = new Date().toDateString()

    if (usageData.date !== today) {
      // 新的一天，重置计数
      return 0
    }

    return usageData.count || 0
  } catch (error) {
    console.error('Failed to get usage:', error)
    return 0
  }
}

/**
 * 增加今日使用次数
 */
function incrementUsage() {
  try {
    const today = new Date().toDateString()
    const usageData = {
      date: today,
      count: getTodayUsage() + 1
    }
    localStorage.setItem(USAGE_KEY, JSON.stringify(usageData))
  } catch (error) {
    console.error('Failed to increment usage:', error)
  }
}

const showPaywallModal = ref(false)
const paywallReason = ref('')

export function usePaywall() {
  const { canGenerateUnlimited } = useSubscription()

  const todayUsage = ref(getTodayUsage())

  // 剩余使用次数
  const remainingUses = computed(() => {
    if (canGenerateUnlimited.value) {
      return Infinity
    }
    return Math.max(0, DAILY_LIMIT_FREE - todayUsage.value)
  })

  // 是否达到使用限制
  const hasReachedLimit = computed(() => {
    if (canGenerateUnlimited.value) {
      return false
    }
    return remainingUses.value <= 0
  })

  /**
   * 检查是否可以生成名字
   * @returns {boolean}
   */
  function canGenerate() {
    if (canGenerateUnlimited.value) {
      return true
    }

    const can = !hasReachedLimit.value
    if (!can) {
      paywallReason.value = 'You have reached your daily generation limit. Upgrade to Pro for unlimited access.'
      showPaywallModal.value = true
    }
    return can
  }

  /**
   * 记录一次生成
   */
  function recordGeneration() {
    if (!canGenerateUnlimited.value) {
      incrementUsage()
      todayUsage.value = getTodayUsage()
    }
  }

  /**
   * 显示付费墙
   * @param {string} reason 原因
   */
  function triggerPaywall(reason = 'This feature is only available for Pro users.') {
    paywallReason.value = reason
    showPaywallModal.value = true
  }

  /**
   * 隐藏付费墙
   */
  function hidePaywall() {
    showPaywallModal.value = false
    paywallReason.value = ''
  }

  return {
    // 状态
    showPaywallModal,
    paywallReason,
    todayUsage,
    dailyLimit: DAILY_LIMIT_FREE,

    // 计算属性
    remainingUses,
    hasReachedLimit,

    // 方法
    canGenerate,
    recordGeneration,
    triggerPaywall,
    hidePaywall
  }
}
