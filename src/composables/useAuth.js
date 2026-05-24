import { ref, onMounted, onUnmounted } from 'vue'
import { getCurrentUser, signInWithEmail, signUpWithEmail, signInWithGoogle, signOut, onAuthStateChange } from '../services/supabase'

const user = ref(null)
const loading = ref(true)
const authInitialized = ref(false)
let authListener = null

export function useAuth() {
  /**
   * 初始化认证状态
   */
  async function initAuth() {
    try {
      loading.value = true
      const { user: currentUser } = await getCurrentUser()
      user.value = currentUser
    } catch (error) {
      console.error('Failed to initialize auth:', error)
      user.value = null
    } finally {
      loading.value = false
      authInitialized.value = true
    }
  }

  /**
   * 邮箱登录
   * @param {string} email 邮箱
   * @param {string} password 密码
   * @returns {Promise<{error: Error | null}>}
   */
  async function loginWithEmail(email, password) {
    try {
      loading.value = true
      const { error } = await signInWithEmail(email, password)
      if (error) throw error
      return { error: null }
    } catch (error) {
      return { error }
    } finally {
      loading.value = false
    }
  }

  /**
   * 邮箱注册
   * @param {string} email 邮箱
   * @param {string} password 密码
   * @param {object} options 额外选项
   * @returns {Promise<{error: Error | null}>}
   */
  async function registerWithEmail(email, password, options = {}) {
    try {
      loading.value = true
      const { error } = await signUpWithEmail(email, password, options)
      if (error) throw error
      return { error: null }
    } catch (error) {
      return { error }
    } finally {
      loading.value = false
    }
  }

  /**
   * Google登录
   * @returns {Promise<{error: Error | null}>}
   */
  async function loginWithGoogle() {
    try {
      loading.value = true
      const { error } = await signInWithGoogle()
      if (error) throw error
      return { error: null }
    } catch (error) {
      return { error }
    } finally {
      loading.value = false
    }
  }

  /**
   * 登出
   * @returns {Promise<{error: Error | null}>}
   */
  async function logout() {
    try {
      loading.value = true
      const { error } = await signOut()
      if (error) throw error
      user.value = null
      return { error: null }
    } catch (error) {
      return { error }
    } finally {
      loading.value = false
    }
  }

  onMounted(() => {
    if (!authListener) {
      // 监听认证状态变化
      authListener = onAuthStateChange((event, session) => {
        if (session) {
          user.value = session.user
        } else {
          user.value = null
        }
        loading.value = false
        authInitialized.value = true
      })
    }

    // 初始化认证状态
    if (!authInitialized.value) {
      initAuth()
    }
  })

  onUnmounted(() => {
    if (authListener?.unsubscribe) {
      authListener.unsubscribe()
      authListener = null
    }
  })

  return {
    // 状态
    user,
    loading,
    authInitialized,
    isLoggedIn: () => !!user.value,

    // 方法
    loginWithEmail,
    registerWithEmail,
    loginWithGoogle,
    logout
  }
}
