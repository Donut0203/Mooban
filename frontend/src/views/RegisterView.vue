<template>
  <div class="register">
    <div class="register-container">
      <h2>Register</h2>
      <form @submit.prevent="handleRegister" id="registerForm">
        <div class="form-group">
          <label for="firstName">First Name</label>
          <input type="text" id="firstName" v-model="firstName" name="firstName">
        </div>
        <div class="form-group">
          <label for="lastName">Last Name</label>
          <input type="text" id="lastName" v-model="lastName" name="lastName">
        </div>
        <div class="form-group">
          <label for="email">Email (lowercase only)</label>
          <input type="email" id="email" v-model="email" name="email" required placeholder="example@domain.com">
        </div>
        <div class="form-group">
          <label for="phone">Phone Number</label>
          <input type="tel" id="phone" v-model="phone" name="phone">
        </div>
        <div class="form-group">
          <label for="address">Address</label>
          <input type="text" id="address" v-model="address" name="address">
        </div>
        <div class="form-group">
          <label for="password">Password</label>
          <div class="password-input-container">
            <input
              :type="showPassword ? 'text' : 'password'"
              id="password"
              v-model="password"
              name="password"
              required
            >
            <button
              type="button"
              class="toggle-password-btn"
              @click="togglePasswordVisibility"
            >
              <i :class="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
            </button>
          </div>
          <p class="password-requirements">
            Password must be 10 characters or less and contain uppercase letters, lowercase letters, and numbers.
          </p>
        </div>
        <div class="form-group">
          <label for="confirmPassword">Confirm Password</label>
          <div class="password-input-container">
            <input
              :type="showConfirmPassword ? 'text' : 'password'"
              id="confirmPassword"
              v-model="confirmPassword"
              name="confirmPassword"
              required
            >
            <button
              type="button"
              class="toggle-password-btn"
              @click="toggleConfirmPasswordVisibility"
            >
              <i :class="showConfirmPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
            </button>
          </div>
        </div>
        <button type="submit" id="registerButton" :disabled="loading">
          {{ loading ? 'Registering...' : 'Register' }}
        </button>
        <div v-if="error" id="error" class="error">{{ error }}</div>
      </form>
      <div class="login-link">
        Already have an account? <router-link to="/login">Login here</router-link>
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions } from 'vuex'

export default {
  name: 'RegisterView',
  data() {
    return {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      address: '',
      password: '',
      confirmPassword: '',
      error: null,
      loading: false,
      showPassword: false,
      showConfirmPassword: false
    }
  },
  methods: {
    ...mapActions(['register']),
    togglePasswordVisibility() {
      this.showPassword = !this.showPassword;
    },
    toggleConfirmPasswordVisibility() {
      this.showConfirmPassword = !this.showConfirmPassword;
    },
    validateEmail(email) {
      // Check if email contains uppercase letters
      if (/[A-Z]/.test(email)) {
        return 'Email must be in lowercase only';
      }

      // Check if email is valid
      const emailRegex = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/;
      if (!emailRegex.test(email)) {
        return 'Please enter a valid email address (lowercase only)';
      }

      return null; // No error
    },
    validatePassword(password) {
      // Check length
      if (password.length > 10) {
        return 'Password must be 10 characters or less';
      }

      // Check for uppercase, lowercase, and numbers
      const hasUpperCase = /[A-Z]/.test(password);
      const hasLowerCase = /[a-z]/.test(password);
      const hasNumbers = /[0-9]/.test(password);

      if (!hasUpperCase || !hasLowerCase || !hasNumbers) {
        return 'Password must contain uppercase letters, lowercase letters, and numbers';
      }

      return null; // No error
    },
    async handleRegister() {
      // Validate email (must be lowercase)
      const emailError = this.validateEmail(this.email);
      if (emailError) {
        this.error = emailError;
        return;
      }

      // Validate password
      const passwordError = this.validatePassword(this.password);
      if (passwordError) {
        this.error = passwordError;
        return;
      }

      // Validate passwords match
      if (this.password !== this.confirmPassword) {
        this.error = 'Passwords do not match';
        return;
      }

      this.loading = true;
      this.error = null;

      try {
        await this.register({
          email: this.email,
          password: this.password,
          firstName: this.firstName,
          lastName: this.lastName,
          phone: this.phone,
          address: this.address,
          status: 'pending' // Default status for new users
        });

        // Redirect to home page after successful registration
        window.location.href = '/';
      } catch (error) {
        console.error('Registration error:', error);
        this.error = error.response?.data?.message || 'Registration failed. Please try again.';
      } finally {
        this.loading = false;
      }
    }
  }
}
</script>

<style scoped>
.register {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f5f5f5;
  padding: 20px;
}

.register-container {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 30px;
  width: 100%;
  max-width: 500px;
}

h2 {
  text-align: center;
  color: #333;
  margin-bottom: 25px;
  font-size: 24px;
}

.form-group {
  margin-bottom: 15px;
}

label {
  display: block;
  margin-bottom: 5px;
  font-weight: 500;
  color: #333;
  font-size: 14px;
}

input {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  transition: border-color 0.3s;
}

input:focus {
  border-color: #4CAF50;
  outline: none;
  box-shadow: 0 0 0 2px rgba(76, 175, 80, 0.2);
}

.password-input-container {
  position: relative;
  display: flex;
  align-items: center;
}

.password-input-container input {
  width: 100%;
  padding-right: 40px; /* Make room for the button */
}

.toggle-password-btn {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #666;
  cursor: pointer;
  padding: 5px;
  font-size: 16px;
}

.toggle-password-btn:hover {
  color: #333;
}

.toggle-password-btn:focus {
  outline: none;
}

.password-requirements {
  font-size: 12px;
  color: #666;
  margin-top: 5px;
  margin-bottom: 0;
}

button[type="submit"] {
  width: 100%;
  padding: 12px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.3s;
  margin-top: 10px;
}

button[type="submit"]:hover {
  background-color: #45a049;
}

button[type="submit"]:disabled {
  background-color: #9e9e9e;
  cursor: not-allowed;
}

.error {
  color: #f44336;
  margin-top: 15px;
  text-align: center;
  font-size: 14px;
}

.login-link {
  text-align: center;
  margin-top: 20px;
  color: #666;
  font-size: 14px;
}

.login-link a {
  color: #4CAF50;
  text-decoration: none;
  font-weight: 500;
}

.login-link a:hover {
  text-decoration: underline;
}

@media (max-width: 576px) {
  .register-container {
    padding: 20px;
  }

  h2 {
    font-size: 22px;
  }

  input, button[type="submit"] {
    font-size: 14px;
  }
}
</style>