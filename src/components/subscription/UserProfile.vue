<template>
  <div class="user-profile">
    <!-- 未登录状态 -->
    <button
      v-if="!user && authInitialized"
      class="btn btn-outline login-btn"
      @click="showLoginModal = true"
    >
      Sign In
    </button>

    <!-- 已登录状态 -->
    <div v-else-if="user && authInitialized" class="profile-dropdown">
      <button
        class="profile-trigger"
        @click="isOpen = !isOpen"
        @blur="handleBlur"
      >
        <div class="profile-avatar-sm">
          {{ user.email?.charAt(0).toUpperCase() }}
        </div>
        <span class="profile-email-sm">{{ user.email }}</span>
        <svg
          class="dropdown-icon"
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M2.5 4.5L6 8L9.5 4.5"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </button>

      <div v-if="isOpen" class="dropdown-menu">
        <div class="dropdown-header">
          <div class="profile-avatar-sm">
            {{ user.email?.charAt(0).toUpperCase() }}
          </div>
          <div class="profile-info">
            <p class="profile-email">{{ user.email }}</p>
            <span
              class="plan-badge-small"
              :class="{
                'free-badge': currentPlan.id === 'free',
                'pro-badge': currentPlan.id === 'pro',
                'enterprise-badge': currentPlan.id === 'enterprise'
              }"
            >
              {{ currentPlan.name }}
            </span>
          </div>
        </div>

        <div class="dropdown-divider"></div>

        <router-link to="/account" class="dropdown-item" @click="isOpen = false">
          <span>⚙️</span>
          My Account
        </router-link>

        <router-link
          v-if="currentPlan.id === 'free'"
          to="/pricing"
          class="dropdown-item upgrade-item"
          @click="isOpen = false"
        >
          <span>💎</span>
          Upgrade to Pro
        </router-link>

        <div class="dropdown-divider"></div>

        <button class="dropdown-item logout-item" @click="handleLogout">
          <span>🚪</span>
          Sign Out
        </button>
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-else class="profile-loading">
      <div class="loading-skeleton"></div>
    </div>

    <LoginModal v-model:show="showLoginModal" />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../../composables/useAuth'
import { useSubscription } from '../../composables/useSubscription'
import LoginModal from './LoginModal.vue'

const { user, authInitialized, logout } = useAuth()
const { currentPlan } = useSubscription()
const router = useRouter()

const showLoginModal = ref(false)
const isOpen = ref(false)

/**
 * 处理失焦关闭下拉菜单
 */
function handleBlur() {
  setTimeout(() => {
    isOpen.value = false
  }, 150)
}

/**
 * 处理登出
 */
async function handleLogout() {
  isOpen.value = false
  await logout()
  router.push('/')
}
</script>

<style scoped>
.user-profile {
  position: relative;
}

.login-btn {
  font-size: 0.875rem;
  padding: 0.5rem 1rem;
}

.profile-trigger {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 0.75rem;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 9999px;
  cursor: pointer;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.profile-trigger:hover {
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.profile-avatar-sm {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 700;
  flex-shrink: 0;
}

.profile-email-sm {
  font-size: 0.875rem;
  font-weight: 500;
  color: #2d3748;
  max-width: 150px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dropdown-icon {
  color: #718096;
  flex-shrink: 0;
  transition: transform 0.2s;
}

.profile-trigger:hover .dropdown-icon {
  color: #667eea;
}

.dropdown-menu {
  position: absolute;
  top: calc(100% + 0.5rem);
  right: 0;
  background: white;
  border-radius: 0.75rem;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  border: 1px solid #e2e8f0;
  min-width: 280px;
  z-index: 100;
  animation: slideDown 0.2s ease;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.dropdown-header {
  padding: 1rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  border-bottom: 1px solid #e2e8f0;
}

.dropdown-header .profile-email {
  font-size: 0.875rem;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 0.25rem;
}

.plan-badge-small {
  padding: 0.125rem 0.5rem;
  border-radius: 9999px;
  font-weight: 600;
  font-size: 0.625rem;
}

.free-badge {
  background: #e2e8f0;
  color: #4a5568;
}

.pro-badge {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.enterprise-badge {
  background: #2d3748;
  color: white;
}

.dropdown-divider {
  height: 1px;
  background: #e2e8f0;
  margin: 0.5rem 0;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  color: #4a5568;
  text-decoration: none;
  font-size: 0.875rem;
  transition: background-color 0.2s;
  border: none;
  background: none;
  width: 100%;
  text-align: left;
  cursor: pointer;
}

.dropdown-item:hover {
  background: #f7fafc;
  color: #2d3748;
}

.dropdown-item span:first-child {
  font-size: 1rem;
}

.upgrade-item {
  color: #667eea;
  font-weight: 500;
}

.upgrade-item:hover {
  background: #f0f4ff;
  color: #5a6fd8;
}

.logout-item {
  color: #e53e3e;
}

.logout-item:hover {
  background: #fff5f5;
  color: #c53030;
}

.profile-loading {
  width: 100px;
}

.loading-skeleton {
  height: 38px;
  background: #e2e8f0;
  border-radius: 9999px;
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

@media (max-width: 768px) {
  .profile-email-sm {
    display: none;
  }

  .dropdown-menu {
    right: 50%;
    transform: translateX(50%);
    min-width: 250px;
  }
}
</style>
