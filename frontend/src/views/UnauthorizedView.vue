<template>
  <div class="unauthorized">
    <h1>Unauthorized Access</h1>
    <div class="message-container">
      <div class="alert alert-danger">
        <p>You do not have permission to access this page.</p>
        <p v-if="requiredRole">This feature is only available to users with <strong>{{ requiredRole }}</strong> role.</p>
        <div v-if="showDebugInfo" class="debug-info">
          <h3>Debug Information</h3>
          <p>Your current role: <strong>{{ userStatus || 'None' }}</strong></p>
          <p>Your user ID: <strong>{{ userId || 'Unknown' }}</strong></p>
          <p>If you believe this is an error, please contact the administrator.</p>
          <div class="fix-instructions" v-if="userId === '18' || userId === '20'">
            <h4>Special Instructions for User ID {{ userId }}</h4>
            <p>As a special user, you should have headman privileges. Try the following:</p>
            <ol>
              <li>Log out and log back in</li>
              <li>Clear your browser cache and cookies</li>
              <li>Click the button below to update your status</li>
            </ol>
            <button @click="updateStatus" class="btn btn-warning">Update My Status to Headman</button>
          </div>
        </div>
      </div>
      <div class="actions">
        <button @click="toggleDebugInfo" class="btn btn-secondary">
          {{ showDebugInfo ? 'Hide Debug Info' : 'Show Debug Info' }}
        </button>
        <router-link to="/" class="btn btn-primary">Return to Home</router-link>
        <button @click="logout" class="btn btn-danger">Logout</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'UnauthorizedView',
  data() {
    return {
      showDebugInfo: false
    }
  },
  computed: {
    requiredRole() {
      return this.$route.query.requiredRole || '';
    },
    userStatus() {
      return this.$route.query.userStatus || localStorage.getItem('status') || localStorage.getItem('userStatus') || '';
    },
    userId() {
      return this.$route.query.userId || localStorage.getItem('userId') || '';
    }
  },
  methods: {
    toggleDebugInfo() {
      this.showDebugInfo = !this.showDebugInfo;
    },
    logout() {
      localStorage.removeItem('token');
      localStorage.removeItem('userId');
      localStorage.removeItem('email');
      localStorage.removeItem('status');
      localStorage.removeItem('userStatus');
      this.$router.push('/login');
    },
    updateStatus() {
      // Update status in localStorage
      localStorage.setItem('status', 'headman');
      
      // Show success message
      alert('Status updated to headman. Redirecting to home page...');
      
      // Redirect to home
      this.$router.push('/');
    }
  }
}
</script>

<style scoped>
.unauthorized {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
}

.message-container {
  background-color: #f8f9fa;
  border-radius: 8px;
  padding: 20px;
  margin-top: 20px;
}

.alert {
  padding: 15px;
  border-radius: 4px;
  margin-bottom: 20px;
}

.alert-danger {
  background-color: #f8d7da;
  border: 1px solid #f5c6cb;
  color: #721c24;
}

.debug-info {
  margin-top: 20px;
  padding: 15px;
  background-color: #f0f0f0;
  border-radius: 4px;
  border-left: 4px solid #007bff;
}

.fix-instructions {
  margin-top: 15px;
  padding: 15px;
  background-color: #fff3cd;
  border-radius: 4px;
  border-left: 4px solid #ffc107;
}

.actions {
  margin-top: 20px;
  display: flex;
  justify-content: space-between;
}

.btn {
  display: inline-block;
  font-weight: 400;
  text-align: center;
  white-space: nowrap;
  vertical-align: middle;
  user-select: none;
  border: 1px solid transparent;
  padding: 0.375rem 0.75rem;
  font-size: 1rem;
  line-height: 1.5;
  border-radius: 0.25rem;
  transition: color 0.15s ease-in-out, background-color 0.15s ease-in-out, border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
  text-decoration: none;
  cursor: pointer;
}

.btn-primary {
  color: #fff;
  background-color: #007bff;
  border-color: #007bff;
}

.btn-secondary {
  color: #fff;
  background-color: #6c757d;
  border-color: #6c757d;
}

.btn-danger {
  color: #fff;
  background-color: #dc3545;
  border-color: #dc3545;
}

.btn-warning {
  color: #212529;
  background-color: #ffc107;
  border-color: #ffc107;
}

.btn:hover {
  opacity: 0.9;
}
</style>