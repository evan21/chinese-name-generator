<template>
  <div class="pricing-container">
    <header class="pricing-header">
      <router-link to="/" class="back-link">
        ← Back to Home
      </router-link>
      <h1 class="pricing-title">Simple, Transparent Pricing</h1>
      <p class="pricing-subtitle">Choose the plan that fits your needs</p>
    </header>

    <main class="pricing-main">
      <PricingTable />
    </main>

    <footer class="pricing-footer">
      <div class="faq-section">
        <h2>Frequently Asked Questions</h2>
        <div class="faq-grid">
          <div class="faq-item">
            <h3>Can I cancel my subscription anytime?</h3>
            <p>Yes, you can cancel your subscription at any time. You'll continue to have access until the end of your billing period.</p>
          </div>
          <div class="faq-item">
            <h3>Do you offer a free trial?</h3>
            <p>We offer a 7-day free trial for all new Pro subscriptions. You won't be charged until the trial period ends.</p>
          </div>
          <div class="faq-item">
            <h3>What payment methods do you accept?</h3>
            <p>We accept all major credit cards (Visa, Mastercard, American Express, Discover), as well as Apple Pay and Google Pay.</p>
          </div>
          <div class="faq-item">
            <h3>Can I upgrade or downgrade my plan later?</h3>
            <p>Yes, you can change your plan at any time. The new price will be prorated for the remainder of your billing cycle.</p>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
import PricingTable from '../components/subscription/PricingTable.vue'
</script>

<style scoped>
.pricing-container {
  max-width: 1200px;
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

.pricing-header {
  text-align: center;
  margin-bottom: 3rem;
}

.pricing-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: #2d3748;
  margin-bottom: 0.5rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.pricing-subtitle {
  font-size: 1.125rem;
  color: #718096;
}

.pricing-main {
  flex: 1;
}

.pricing-footer {
  margin-top: 4rem;
}

.faq-section {
  text-align: center;
}

.faq-section h2 {
  font-size: 1.875rem;
  font-weight: 700;
  color: #2d3748;
  margin-bottom: 2rem;
}

.faq-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  text-align: left;
}

.faq-item h3 {
  font-size: 1.125rem;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 0.5rem;
}

.faq-item p {
  color: #718096;
  line-height: 1.6;
}

@media (max-width: 768px) {
  .pricing-title {
    font-size: 2rem;
  }

  .faq-grid {
    grid-template-columns: 1fr;
  }
}
</style>
