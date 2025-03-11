import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import axios from 'axios'

// Set base URL for axios
axios.defaults.baseURL = process.env.VUE_APP_API_URL || '/api'

// Log the base URL for debugging
console.log('API Base URL:', axios.defaults.baseURL)

// Add a request interceptor
axios.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

// Add a response interceptor for better error handling
axios.interceptors.response.use(
  response => {
    return response
  },
  error => {
    console.error('API Error:', error)
    if (error.response && error.response.status === 401) {
      // Unauthorized - clear token and redirect to login
      localStorage.removeItem('token')
      router.push('/login')
    }
    return Promise.reject(error)
  }
)

// Global error handler
window.addEventListener('error', (event) => {
  console.error('Global error:', event.error)
})

// Global unhandled promise rejection handler
window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason)
})

const app = createApp(App)

// Global error handler for Vue
app.config.errorHandler = (err, vm, info) => {
  console.error('Vue error handler:', err, info)
}

app.use(store)
app.use(router)
app.mount('#app')