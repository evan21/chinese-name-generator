<template>
  <div class="success-container">
    <div class="success-card">
      <div class="success-icon">🎉</div>
      <h1 class="success-title">Payment Successful!</h1>
      <p class="success-message">
        Thank you for upgrading to Pro! Your subscription is now active.
      </p>
      <div class="success-benefits">
        <h3>You now have access to:</h3>
        <ul>
          <li>✅ Unlimited name generations</li>
          <li>✅ Advanced AI name analysis</li>
          <li>✅ Custom surname support</li>
          <li>✅ Calligraphy generation</li>
          <li>✅ HD wallpaper and business card export</li>
          <li>✅ No advertisements</li>
        </ul>
      </div>
      <div class="success-actions">
        <router-link to="/" class="btn btn-primary">
          Start Generating Names
        </router-link>
        <router-link to="/account" class="btn btn-outline">
          View My Account
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useSubscription } from '../composables/useSubscription'

const { loadSubscription } = useSubscription()

onMounted(() => {
  // 重新加载订阅状态
  loadSubscription()
})
</script>

<style scoped>
.success-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem 1rem;
  background: linear-gradient(135deg, #667eea15 0%, #764ba215 100%);
}

.success-card {
  background: white;
  padding: 3rem 2rem;
  border-radius: 1.5rem;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  text-align: center;
  max-width: 500px;
  width: 100%;
}

.success-icon {
  font-size: 4rem;
  margin-bottom: 1.5rem;
}

.success-title {
  font-size: 2rem;
  font-weight: 700;
  color: #2d3748;
  margin-bottom: 1rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.success-message {
  font-size: 1.125rem;
  color: #718096;
  margin-bottom: 2rem;
  line-height: 1.6;
}

.success-benefits {
  background: #f7fafc;
  padding: 1.5rem;
  border-radius: 1rem;
  margin-bottom: 2rem;
  text-align: left;
}

.success-benefits h3 {
  font-size: 1.125rem;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 1rem;
  text-align: center;
}

.success-benefits ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.success-benefits li {
  color: #4a5568;
  padding: 0.5rem 0;
  border-bottom: 1px solid #e2e8f0;
}

.success-benefits li:last-child {
  border-bottom: none;
}

.success-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

@media (max-width: 768px) {
  .success-card {
    padding: 2rem 1.5rem;
  }

  .success-title {
    font-size: 1.75rem;
  }

  .success-actions {
    flex-direction: column;
  }
}
</style>
