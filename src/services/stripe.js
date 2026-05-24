import { loadStripe } from '@stripe/stripe-js'

const stripePublicKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY

let stripePromise = null

/**
 * 获取Stripe实例
 * @returns {Promise<import('@stripe/stripe-js').Stripe | null>}
 */
export async function getStripe() {
  if (!stripePromise && stripePublicKey) {
    stripePromise = loadStripe(stripePublicKey)
  }
  return stripePromise
}

/**
 * 创建结账会话并跳转到Stripe结账页面
 * @param {string} priceId 价格ID
 * @param {string} userId 用户ID
 * @param {string} userEmail 用户邮箱
 * @returns {Promise<{error: Error | null}>}
 */
export async function createCheckoutSession(priceId, userId, userEmail) {
  try {
    // 调用Edge Function创建结账会话
    const response = await fetch('/api/create-checkout-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        priceId,
        userId,
        email: userEmail,
        successUrl: `${window.location.origin}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
        cancelUrl: `${window.location.origin}/pricing?canceled=true`
      })
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Failed to create checkout session')
    }

    // 跳转到Stripe结账页面
    const stripe = await getStripe()
    if (!stripe) {
      throw new Error('Stripe not initialized')
    }

    const { error } = await stripe.redirectToCheckout({
      sessionId: data.sessionId
    })

    if (error) throw error

    return { error: null }
  } catch (error) {
    return { error }
  }
}

/**
 * 创建Stripe客户门户会话，用于管理订阅
 * @returns {Promise<{url: string | null, error: Error | null}>}
 */
export async function createCustomerPortalSession() {
  try {
    const response = await fetch('/api/create-portal-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Failed to create portal session')
    }

    return { url: data.url, error: null }
  } catch (error) {
    return { url: null, error }
  }
}

/**
 * 价格ID配置
 */
export const PRICE_IDS = {
  PRO_MONTHLY: import.meta.env.VITE_STRIPE_PRICE_PRO_MONTHLY,
  PRO_YEARLY: import.meta.env.VITE_STRIPE_PRICE_PRO_YEARLY,
  ENTERPRISE_MONTHLY: import.meta.env.VITE_STRIPE_PRICE_ENTERPRISE_MONTHLY
}

/**
 * 套餐配置
 */
export const PLANS = [
  {
    id: 'free',
    name: 'Free',
    price: '$0',
    interval: 'forever',
    features: [
      '每日最多3次生成',
      '每次最多5个名字结果',
      '最多保存10条历史记录',
      '标准发音播放',
      '基础含义解释',
      '基础分享卡片'
    ],
    cta: 'Current Plan',
    popular: false
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '$4.99',
    interval: 'per month',
    yearlyPrice: '$29.99 per year (save 50%)',
    features: [
      '无限次名字生成',
      '每次最多20个名字结果',
      '无限历史记录保存',
      '高级AI名字深度分析',
      '自定义姓氏支持',
      '书法字帖生成',
      '高清壁纸/名片生成',
      '无广告',
      '优先支持'
    ],
    cta: 'Upgrade to Pro',
    popular: true,
    priceId: PRICE_IDS.PRO_MONTHLY,
    yearlyPriceId: PRICE_IDS.PRO_YEARLY
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: '$29.99',
    interval: 'per month',
    features: [
      '所有Pro版功能',
      '批量名字生成（最多100个/次）',
      'API接口访问权限',
      '商业使用授权',
      '自定义品牌分享卡片',
      '专属客户经理',
      'SLA保障'
    ],
    cta: 'Contact Sales',
    popular: false,
    priceId: PRICE_IDS.ENTERPRISE_MONTHLY
  }
]
