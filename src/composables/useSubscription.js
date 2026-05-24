import { ref, computed, watch } from 'vue'
import { getUserSubscription } from '../services/supabase'
import { createCheckoutSession, createCustomerPortalSession, PLANS } from '../services/stripe'
import { useAuth } from './useAuth'

const subscription = ref(null)
const loading = ref(false)
const subscriptionInitialized = ref(false)

export function useSubscription() {
  const { user, authInitialized } = useAuth()

  /**
   * 加载用户订阅状态
   */
  async function loadSubscription() {
    if (!user.value) {
      subscription.value = {
        plan_type: 'free',
        status: 'active',
        current_period_end: null
      }
      subscriptionInitialized.value = true
      return
    }

    try {
      loading.value = true
      const { subscription: userSubscription, error } = await getUserSubscription(user.value.id)
      if (error) throw error
      subscription.value = userSubscription
    } catch (error) {
      console.error('Failed to load subscription:', error)
      subscription.value = {
        plan_type: 'free',
        status: 'active',
        current_period_end: null
      }
    } finally {
      loading.value = false
      subscriptionInitialized.value = true
    }
  }

  /**
   * 订阅套餐
   * @param {string} priceId 价格ID
   * @returns {Promise<{error: Error | null}>}
   */
  async function subscribe(priceId) {
    if (!user.value) {
      return { error: new Error('Please login first') }
    }

    try {
      loading.value = true
      const { error } = await createCheckoutSession(
        priceId,
        user.value.id,
        user.value.email
      )
      if (error) throw error
      return { error: null }
    } catch (error) {
      return { error }
    } finally {
      loading.value = false
    }
  }

  /**
   * 打开订阅管理门户
   * @returns {Promise<{error: Error | null}>}
   */
  async function manageSubscription() {
    if (!user.value) {
      return { error: new Error('Please login first') }
    }

    try {
      loading.value = true
      const { url, error } = await createCustomerPortalSession()
      if (error) throw error
      if (url) {
        window.location.href = url
      }
      return { error: null }
    } catch (error) {
      return { error }
    } finally {
      loading.value = false
    }
  }

  // 计算属性
  const currentPlan = computed(() => {
    if (!subscription.value) return PLANS[0] // 默认免费版
    return PLANS.find(plan => plan.id === subscription.value.plan_type) || PLANS[0]
  })

  const isPro = computed(() => subscription.value?.plan_type === 'pro')
  const isEnterprise = computed(() => subscription.value?.plan_type === 'enterprise')
  const isPaid = computed(() => isPro.value || isEnterprise.value)
  const subscriptionActive = computed(() => subscription.value?.status === 'active')

  // 权限检查
  const canGenerateUnlimited = computed(() => isPaid.value && subscriptionActive.value)
  const canUseAdvancedFeatures = computed(() => isPaid.value && subscriptionActive.value)
  const canUseBatchGeneration = computed(() => isEnterprise.value && subscriptionActive.value)
  const canUseAPI = computed(() => isEnterprise.value && subscriptionActive.value)

  // 用户变化时重新加载订阅
  watch(
    () => user.value,
    () => {
      if (authInitialized.value) {
        loadSubscription()
      }
    },
    { immediate: true }
  )

  // 认证初始化完成后加载订阅
  watch(
    () => authInitialized.value,
    (initialized) => {
      if (initialized) {
        loadSubscription()
      }
    },
    { immediate: true }
  )

  return {
    // 状态
    subscription,
    loading,
    subscriptionInitialized,

    // 计算属性
    currentPlan,
    isPro,
    isEnterprise,
    isPaid,
    subscriptionActive,
    canGenerateUnlimited,
    canUseAdvancedFeatures,
    canUseBatchGeneration,
    canUseAPI,

    // 方法
    loadSubscription,
    subscribe,
    manageSubscription
  }
}
