// Vercel Edge Function 用于处理Stripe webhook事件
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2026-04-22.dahlia',
})

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
)

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

export const config = {
  runtime: 'edge',
}

export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  try {
    const signature = req.headers.get('stripe-signature')
    if (!signature) {
      return new Response('Missing stripe signature', { status: 400 })
    }

    const body = await req.text()
    const event = stripe.webhooks.constructEvent(body, signature, webhookSecret)

    // 处理订阅相关事件
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object
        const userId = session.metadata.user_id
        const subscriptionId = session.subscription

        // 获取订阅详情
        const subscription = await stripe.subscriptions.retrieve(subscriptionId)
        const priceId = subscription.items.data[0].price.id
        const planType = getPlanTypeFromPriceId(priceId)

        // 更新或创建用户订阅记录
        await upsertSubscription(userId, {
          stripe_customer_id: session.customer,
          stripe_subscription_id: subscriptionId,
          plan_type: planType,
          status: subscription.status,
          current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
        })

        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object
        const userId = subscription.metadata.user_id

        if (!userId) {
          console.warn('Subscription missing user_id in metadata:', subscription.id)
          break
        }

        const priceId = subscription.items.data[0].price.id
        const planType = getPlanTypeFromPriceId(priceId)

        await upsertSubscription(userId, {
          stripe_subscription_id: subscription.id,
          plan_type: planType,
          status: subscription.status,
          current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
        })

        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object
        const userId = subscription.metadata.user_id

        if (userId) {
          // 将订阅状态更新为已取消
          await updateSubscriptionStatus(userId, 'canceled')
        }

        break
      }

      default:
        console.log(`Unhandled event type ${event.type}`)
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Error handling webhook:', error)
    return new Response(`Webhook Error: ${error.message}`, { status: 400 })
  }
}

/**
 * 根据Price ID获取套餐类型
 * @param {string} priceId Stripe价格ID
 * @returns {string} 套餐类型：'free', 'pro', 'enterprise'
 */
function getPlanTypeFromPriceId(priceId) {
  // 这里需要根据你的实际Price ID进行配置
  const priceMap = {
    [process.env.STRIPE_PRICE_PRO_MONTHLY]: 'pro',
    [process.env.STRIPE_PRICE_PRO_YEARLY]: 'pro',
    [process.env.STRIPE_PRICE_ENTERPRISE_MONTHLY]: 'enterprise',
  }

  return priceMap[priceId] || 'pro'
}

/**
 * 更新或创建用户订阅记录
 * @param {string} userId 用户ID
 * @param {Object} subscriptionData 订阅数据
 */
async function upsertSubscription(userId, subscriptionData) {
  // 检查用户是否已有订阅记录
  const { data: existingSubscription } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (existingSubscription) {
    // 更新现有订阅
    await supabase
      .from('subscriptions')
      .update({
        ...subscriptionData,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId)
  } else {
    // 创建新订阅
    await supabase.from('subscriptions').insert({
      user_id: userId,
      ...subscriptionData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
  }
}

/**
 * 更新订阅状态
 * @param {string} userId 用户ID
 * @param {string} status 订阅状态
 */
async function updateSubscriptionStatus(userId, status) {
  await supabase
    .from('subscriptions')
    .update({
      status,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', userId)
}
