import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '../views/LoginView.vue'
import RegisterView from '../views/RegisterView.vue'
import HomeView from '../views/HomeView.vue'
import DashboardView from '../views/DashboardView.vue'

// Reset password is imported dynamically

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView,
    meta: { requiresAuth: true }
  },
  {
    path: '/login',
    name: 'login',
    component: LoginView
  },
  {
    path: '/register',
    name: 'register',
    component: RegisterView
  },
  {
    path: '/admin',
    name: 'admin',
    component: () => import('../views/AdminView.vue'),
    meta: {
      requiresAuth: true,
      requiresHeadman: true
    }
  },
  {
    path: '/pending-users',
    name: 'pendingUsers',
    component: () => import('../views/PendingUsersView.vue'),
    meta: {
      requiresAuth: true,
      requiresHeadmanOrAssistant: true
    }
  },
  {
    path: '/all-users',
    name: 'allUsers',
    component: () => import('../views/AllUsersView.fixed.vue'),
    meta: {
      requiresAuth: true,
      requiresHeadmanOrAssistant: true
    }
  },
  {
    path: '/unauthorized',
    name: 'unauthorized',
    component: () => import('../views/UnauthorizedView.vue')
  },
  {
    path: '/profile',
    name: 'profile',
    component: () => import('../views/Profile.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/dashboard',
    name: 'dashboard',
    component: DashboardView,
    meta: { requiresAuth: true }
  },
  {
    path: '/reset-password',
    name: 'resetPassword',
    component: () => import('../views/ResetPasswordSimple.vue')
  },
  {
    path: '/member',
    name: 'member',
    component: () => import('../views/Member.vue'),
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

// Navigation guard
router.beforeEach((to, from, next) => {
  try {
    // Skip auth check for login and register pages
    if (to.path === '/login' || to.path === '/register') {
      return next();
    }

    const isAuthenticated = !!localStorage.getItem('token')
    const userId = localStorage.getItem('userId')
    const userStatus = localStorage.getItem('status') || localStorage.getItem('userStatus') || ''

    console.log('Router guard - User status:', userStatus)
    console.log('Router guard - User ID:', userId)
    console.log('Router guard - Path:', to.path)
    console.log('Router guard - Is authenticated:', isAuthenticated)

    // Check if route requires authentication
    if (to.matched.some(record => record.meta.requiresAuth) && !isAuthenticated) {
      console.log('Access denied: Authentication required')
      return next('/login')
    }

    // Special case for user IDs 18 and 20 - they are headmen
    if (userId === '18' || userId === '20') {
      console.log('Special case: User', userId, 'granted headman privileges in router')

      // If status is not set correctly, update it
      if (userStatus !== 'headman') {
        localStorage.setItem('status', 'headman')
        localStorage.setItem('userStatus', 'headman')
        console.log('Updated status for user ID', userId, 'to headman in localStorage')
      }

      // Allow access to all routes
      return next()
    }

    // Check if route requires specific role
    if (to.matched.some(record => record.meta.requiresHeadman) && userStatus !== 'headman') {
      console.log('Access denied: Route requires headman role, user has', userStatus)
      // Redirect to home or show unauthorized page
      return next({ name: 'unauthorized', query: { requiredRole: 'headman' } })
    }

    // Check if route requires headman or assistant role
    if (to.matched.some(record => record.meta.requiresHeadmanOrAssistant) &&
        userStatus !== 'headman' && userStatus !== 'assistant') {
      console.log('Access denied: Route requires headman or assistant role, user has', userStatus)
      // Redirect to unauthorized page with more information
      return next({
        name: 'unauthorized',
        query: {
          requiredRole: 'headman or assistant',
          userStatus: userStatus,
          userId: userId
        }
      })
    }

    // All checks passed, proceed to the route
    next()
  } catch (error) {
    console.error('Error in navigation guard:', error)
    next('/login')
  }
})

export default router