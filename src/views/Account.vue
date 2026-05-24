<template>
  <div class="account-container">
    <header class="account-header">
      <router-link to="/" class="back-link">
        ← Back to Home
      </router-link>
      <h1 class="account-title">My Account</h1>
    </header>

    <main class="account-main" v-if="authInitialized && subscriptionInitialized">
      <div v-if="!user" class="login-prompt">
        <div class="login-card">
          <h2>Please log in to view your account</h2>
          <p>Sign in to manage your subscription and access your saved names.</p>
          <button class="btn btn-primary" @click="showLoginModal = true">
            Sign In / Sign Up
          </button>
        </div>
      </div>

      <div v-else class="account-content">
        <div class="account-section profile-section">
          <h2>Profile Information</h2>
          <div class="profile-card">
            <div class="profile-avatar">
              {{ user.email?.charAt(0).toUpperCase() }}
            </div>
            <div class="profile-info">
              <p class="profile-email">{{ user.email }}</p>
              <p class="profile-joined">
                Joined {{ new Date(user.created_at).toLocaleDateString() }}
              </p>
            </div>
            <button class="btn btn-outline" @click="logout">
              Sign Out
            </button>
          </div>
        </div>

        <div class="account-section subscription-section">
          <h2>Subscription Plan</h2>
          <div class="subscription-card">
            <div class="plan-header">
              <div class="plan-name">
                <span
                  class="plan-badge"
                  :class="{
                    'free-badge': currentPlan.id === 'free',
                    'pro-badge': currentPlan.id === 'pro',
                    'enterprise-badge': currentPlan.id === 'enterprise'
                  }"
                >
                  {{ currentPlan.name }}
                </span>
                <span class="plan-status" v-if="subscriptionActive">
                  ✅ Active
                </span>
                <span class="plan-status canceled" v-else>
                  ❌ {{ subscription?.status }}
                </span>
              </div>
              <div class="plan-price">
                {{ currentPlan.price }}
                <span class="plan-interval" v-if="currentPlan.interval !== 'forever'">
                  {{ currentPlan.interval }}
                </span>
              </div>
            </div>

            <div class="plan-features">
              <h3>Features included:</h3>
              <ul>
                <li v-for="(feature, index) in currentPlan.features" :key="index">
                  ✅ {{ feature }}
                </li>
              </ul>
            </div>

            <div class="plan-actions" v-if="currentPlan.id === 'free'">
              <router-link to="/pricing" class="btn btn-primary">
                Upgrade to Pro
              </router-link>
            </div>

            <div class="plan-actions" v-else>
              <button
                class="btn btn-outline"
                @click="manageSubscription"
                :disabled="loading"
              >
                {{ loading ? 'Loading...' : 'Manage Subscription' }}
              </button>
              <p class="subscription-note">
                You will be redirected to Stripe to manage your subscription.
              </p>
            </div>

            <div v-if="subscription?.current_period_end && subscriptionActive" class="subscription-period">
              Next billing date: {{ new Date(subscription.current_period_end).toLocaleDateString() }}
            </div>
          </div>
        </div>

        <div class="account-section usage-section">
          <h2>Usage Statistics</h2>
          <div class="usage-card">
            <div class="usage-item">
              <div class="usage-label">Today's generations:</div>
              <div class="usage-value">
                <span class="usage-count">{{ todayUsage }}</span>
                <span v-if="remainingUses !== Infinity">
                  / {{ dailyLimit }} ({{ remainingUses }} remaining)
                </span>
                <span v-else>
                  / Unlimited
                </span>
              </div>
            </div>
            <div class="usage-progress" v-if="remainingUses !== Infinity">
              <div
                class="progress-bar"
                :style="{ width: `${(todayUsage / dailyLimit) * 100}%` }"
              ></div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <div v-else class="loading-container">
      <div class="loading-spinner"></div>
      <p>Loading account information...</p>
    </div>

    <!-- 登录弹窗 -->
    <LoginModal v-model:show="showLoginModal" />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useAuth } from '../composables/useAuth'
import { useSubscription } from '../composables/useSubscription'
import { usePaywall } from '../composables/usePaywall'
import LoginModal from '../components/subscription/LoginModal.vue'

const { user, authInitialized, logout, loading: authLoading } = useAuth()
const {
  subscription,
  subscriptionInitialized,
  currentPlan,
  subscriptionActive,
  manageSubscription,
  loading: subscriptionLoading
} = useSubscription()
const { todayUsage, remainingUses, dailyLimit } = usePaywall()

const showLoginModal = ref(false)
const loading = computed(() => authLoading.value || subscriptionLoading.value)
</script>

<style scoped>
.account-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem 1rem;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.back-link {
  display: inline-flex;
  align-items: center;
  color: #667eea;
  text-decoration: none;
  font-weight: 500;
  margin-bottom: 2rem;
  transition: color 0.2s;
}

.back-link:hover {
  color: #764ba2;
}

.account-header {
  margin-bottom: 2rem;
}

.account-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: #2d3748;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.account-main {
  flex: 1;
}

.loading-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  color: #718096;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #e2e8f0;
  border-top-color: #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.login-prompt {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
}

.login-card {
  background: white;
  padding: 2rem;
  border-radius: 1rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  text-align: center;
  max-width: 400px;
  width: 100%;
}

.login-card h2 {
  font-size: 1.5rem;
  font-weight: 700;
  color: #2d3748;
  margin-bottom: 1rem;
}

.login-card p {
  color: #718096;
  margin-bottom: 2rem;
  line-height: 1.6;
}

.account-content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.account-section h2 {
  font-size: 1.5rem;
  font-weight: 700;
  color: #2d3748;
  margin-bottom: 1rem;
}

.profile-card,
.subscription-card,
.usage-card {
  background: white;
  padding: 2rem;
  border-radius: 1rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.profile-card {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  flex-wrap: wrap;
}

.profile-avatar {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: 700;
}

.profile-info {
  flex: 1;
  min-width: 200px;
}

.profile-email {
  font-size: 1.25rem;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 0.25rem;
}

.profile-joined {
  color: #718096;
  font-size: 0.875rem;
}

.plan-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.plan-name {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.plan-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-weight: 600;
  font-size: 0.875rem;
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

.plan-status {
  font-size: 0.875rem;
  color: #38a169;
}

.plan-status.canceled {
  color: #e53e3e;
}

.plan-price {
  font-size: 1.5rem;
  font-weight: 700;
  color: #2d3748;
}

.plan-interval {
  font-size: 0.875rem;
  color: #718096;
  font-weight: 400;
}

.plan-features h3 {
  font-size: 1rem;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 1rem;
}

.plan-features ul {
  list-style: none;
  padding: 0;
  margin: 0 0 2rem 0;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 0.75rem;
}

.plan-features li {
  color: #4a5568;
  font-size: 0.875rem;
}

.plan-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.subscription-note {
  font-size: 0.75rem;
  color: #718096;
  margin-top: 0.5rem;
}

.subscription-period {
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e2e8f0;
  color: #718096;
  font-size: 0.875rem;
}

.usage-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.usage-label {
  color: #4a5568;
  font-weight: 500;
}

.usage-value {
  color: #2d3748;
  font-weight: 600;
}

.usage-count {
  color: #667eea;
}

.usage-progress {
  width: 100%;
  height: 8px;
  background: #e2e8f0;
  border-radius: 9999px;
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  border-radius: 9999px;
  transition: width 0.3s ease;
}

@media (max-width: 768px) {
  .account-title {
    font-size: 2rem;
  }

  .profile-card {
    flex-direction: column;
    text-align: center;
  }

  .plan-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .plan-features ul {
    grid-template-columns: 1fr;
  }
}
</style>
