import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Pricing from '../views/Pricing.vue'
import Account from '../views/Account.vue'
import PaymentSuccess from '../views/PaymentSuccess.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
    meta: {
      title: 'Get Your Chinese Name | Free Chinese Name Generator'
    }
  },
  {
    path: '/pricing',
    name: 'Pricing',
    component: Pricing,
    meta: {
      title: 'Pricing | Chinese Name Generator'
    }
  },
  {
    path: '/account',
    name: 'Account',
    component: Account,
    meta: {
      title: 'My Account | Chinese Name Generator',
      requiresAuth: true
    }
  },
  {
    path: '/payment-success',
    name: 'PaymentSuccess',
    component: PaymentSuccess,
    meta: {
      title: 'Payment Successful | Chinese Name Generator'
    }
  },
  // 404页面
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
  // 设置页面标题
  if (to.meta.title) {
    document.title = to.meta.title
  }

  // 检查是否需要认证
  if (to.meta.requiresAuth) {
    // 这里我们在组件内部处理认证检查，因为是异步的
    next()
  } else {
    next()
  }
})

export default router
