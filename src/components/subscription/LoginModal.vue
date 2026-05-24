<template>
  <div v-if="show" class="modal-overlay" @click.self="handleClose">
    <div class="modal-content">
      <button class="close-btn" @click="handleClose">×</button>

      <div class="modal-header">
        <h2 class="modal-title">{{ isLoginMode ? 'Welcome Back' : 'Create Account' }}</h2>
        <p class="modal-subtitle">
          {{ isLoginMode
            ? 'Sign in to access your account and saved names'
            : 'Create an account to unlock more features and save your names'
          }}
        </p>
      </div>

      <div class="modal-body">
        <form @submit.prevent="handleSubmit" class="login-form">
          <div class="form-group">
            <label for="email">Email Address</label>
            <input
              id="email"
              v-model="formData.email"
              type="email"
              class="form-input"
              placeholder="your@email.com"
              required
            />
          </div>

          <div class="form-group">
            <label for="password">Password</label>
            <input
              id="password"
              v-model="formData.password"
              type="password"
              class="form-input"
              placeholder="••••••••"
              required
              minlength="6"
            />
          </div>

          <div v-if="!isLoginMode" class="form-group">
            <label for="confirmPassword">Confirm Password</label>
            <input
              id="confirmPassword"
              v-model="formData.confirmPassword"
              type="password"
              class="form-input"
              placeholder="••••••••"
              required
              minlength="6"
            />
          </div>

          <div v-if="errorMessage" class="error-message">
            ❌ {{ errorMessage }}
          </div>

          <button type="submit" class="btn btn-primary btn-full" :disabled="loading">
            {{ loading
              ? 'Please wait...'
              : isLoginMode
                ? 'Sign In'
                : 'Create Account'
            }}
          </button>
        </form>

        <div class="divider">
          <span>or continue with</span>
        </div>

        <button
          class="btn btn-outline btn-full google-btn"
          @click="handleGoogleLogin"
          :disabled="loading"
        >
          <svg class="google-icon" viewBox="0 0 24 24" width="18" height="18">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12c0 1.78.43 3.45 1.18 4.93l3.66-2.84z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          Continue with Google
        </button>

        <div class="auth-switch">
          <p>
            {{ isLoginMode
              ? "Don't have an account?"
              : "Already have an account?"
            }}
            <button type="button" class="link-btn" @click="toggleMode">
              {{ isLoginMode ? 'Sign up' : 'Sign in' }}
            </button>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useAuth } from '../../composables/useAuth'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:show'])

const { loginWithEmail, registerWithEmail, loginWithGoogle, loading } = useAuth()

const isLoginMode = ref(true)
const errorMessage = ref('')

const formData = reactive({
  email: '',
  password: '',
  confirmPassword: ''
})

/**
 * 切换登录/注册模式
 */
function toggleMode() {
  isLoginMode.value = !isLoginMode.value
  errorMessage.value = ''
  formData.password = ''
  formData.confirmPassword = ''
}

/**
 * 关闭弹窗
 */
function handleClose() {
  emit('update:show', false)
  errorMessage.value = ''
  formData.email = ''
  formData.password = ''
  formData.confirmPassword = ''
}

/**
 * 提交表单
 */
async function handleSubmit() {
  errorMessage.value = ''

  if (!isLoginMode.value && formData.password !== formData.confirmPassword) {
    errorMessage.value = 'Passwords do not match'
    return
  }

  let result
  if (isLoginMode.value) {
    result = await loginWithEmail(formData.email, formData.password)
  } else {
    result = await registerWithEmail(formData.email, formData.password)
  }

  if (result.error) {
    errorMessage.value = result.error.message
    return
  }

  // 登录/注册成功
  handleClose()
}

/**
 * Google登录
 */
async function handleGoogleLogin() {
  errorMessage.value = ''
  const { error } = await loginWithGoogle()
  if (error) {
    errorMessage.value = error.message
  }
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
  max-width: 450px;
  width: 100%;
  position: relative;
  max-height: 90vh;
  overflow-y: auto;
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

.modal-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #2d3748;
  margin-bottom: 0.5rem;
}

.modal-subtitle {
  color: #718096;
  font-size: 0.875rem;
  line-height: 1.5;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  font-weight: 500;
  color: #2d3748;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
}

.form-input {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.5rem;
  font-size: 1rem;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.form-input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.error-message {
  background: #fff5f5;
  color: #c53030;
  padding: 0.75rem;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  margin-bottom: 1rem;
  border: 1px solid #fed7d7;
}

.btn-full {
  width: 100%;
}

.divider {
  position: relative;
  text-align: center;
  margin: 1.5rem 0;
  color: #718096;
  font-size: 0.875rem;
}

.divider::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 1px;
  background: #e2e8f0;
}

.divider span {
  background: white;
  padding: 0 1rem;
  position: relative;
  z-index: 1;
}

.google-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
}

.google-icon {
  width: 18px;
  height: 18px;
}

.auth-switch {
  text-align: center;
  margin-top: 1.5rem;
  font-size: 0.875rem;
  color: #718096;
}

.link-btn {
  background: none;
  border: none;
  color: #667eea;
  cursor: pointer;
  font-weight: 500;
  padding: 0;
  margin-left: 0.25rem;
  text-decoration: underline;
}

.link-btn:hover {
  color: #764ba2;
}

@media (max-width: 768px) {
  .modal-content {
    padding: 1.5rem;
  }
}
</style>
