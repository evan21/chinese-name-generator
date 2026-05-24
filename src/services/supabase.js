import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

/**
 * 获取当前登录用户
 * @returns {Promise<{user: import('@supabase/supabase-js').User | null, error: import('@supabase/supabase-js').AuthError | null}>}
 */
export async function getCurrentUser() {
  try {
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error) throw error
    return { user, error: null }
  } catch (error) {
    return { user: null, error }
  }
}

/**
 * 用户登录
 * @param {string} email 邮箱
 * @param {string} password 密码
 * @returns {Promise<{user: import('@supabase/supabase-js').User | null, session: import('@supabase/supabase-js').Session | null, error: import('@supabase/supabase-js').AuthError | null}>}
 */
export async function signInWithEmail(email, password) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    if (error) throw error
    return { user: data.user, session: data.session, error: null }
  } catch (error) {
    return { user: null, session: null, error }
  }
}

/**
 * 用户注册
 * @param {string} email 邮箱
 * @param {string} password 密码
 * @param {object} options 额外选项
 * @returns {Promise<{user: import('@supabase/supabase-js').User | null, session: import('@supabase/supabase-js').Session | null, error: import('@supabase/supabase-js').AuthError | null}>}
 */
export async function signUpWithEmail(email, password, options = {}) {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options
    })
    if (error) throw error
    return { user: data.user, session: data.session, error: null }
  } catch (error) {
    return { user: null, session: null, error }
  }
}

/**
 * 使用Google登录
 * @returns {Promise<{error: import('@supabase/supabase-js').AuthError | null}>}
 */
export async function signInWithGoogle() {
  try {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin
      }
    })
    if (error) throw error
    return { error: null }
  } catch (error) {
    return { error }
  }
}

/**
 * 用户登出
 * @returns {Promise<{error: import('@supabase/supabase-js').AuthError | null}>}
 */
export async function signOut() {
  try {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    return { error: null }
  } catch (error) {
    return { error }
  }
}

/**
 * 获取用户订阅状态
 * @param {string} userId 用户ID
 * @returns {Promise<{subscription: object | null, error: Error | null}>}
 */
export async function getUserSubscription(userId) {
  try {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error && error.code !== 'PGRST116') throw error // PGRST116 = no rows found

    return {
      subscription: data || {
        plan_type: 'free',
        status: 'active',
        current_period_end: null
      },
      error: null
    }
  } catch (error) {
    return { subscription: null, error }
  }
}

/**
 * 监听认证状态变化
 * @param {function} callback 回调函数
 * @returns {import('@supabase/supabase-js').Subscription} 订阅对象
 */
export function onAuthStateChange(callback) {
  return supabase.auth.onAuthStateChange(callback)
}
