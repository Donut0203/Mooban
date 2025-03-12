<template>
  <div class="login">
    <h1>Login</h1>
    <div class="form-container">
      <form @submit.prevent="handleLogin">
        <div class="form-group">
          <label for="email">Email</label>
          <input
            type="email"
            id="email"
            v-model="email"
            required
            placeholder="Enter your email"
          >
        </div>

        <div class="form-group">
          <label for="password">Password</label>
          <div class="password-input-container">
            <input
              :type="showPassword ? 'text' : 'password'"
              id="password"
              v-model="password"
              required
              placeholder="Enter your password"
            >
            <button
              type="button"
              class="toggle-password-btn"
              @click="togglePasswordVisibility"
            >
              <i :class="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
            </button>
          </div>
        </div>

        <button type="submit" :disabled="loading || isLocked" class="login-btn">
          {{ loading ? 'Logging in...' : (isLocked ? `รอ ${lockCountdown} วินาที` : 'Login') }}
        </button>

        <p v-if="error" class="error-message" :class="{ 'locked-message': isLocked }" v-html="error"></p>
        <p v-if="loginAttempts > 0 && !isLocked && !isPendingAccount" class="warning-message">
          ความพยายามในการเข้าสู่ระบบที่ล้มเหลว: {{ loginAttempts }}/3
        </p>
      </form>

      <p>
        Don't have an account?
        <router-link to="/register" class="link">Register here</router-link>
      </p>
      <p>
        <a href="#" class="link" @click.prevent="showSimpleReset = true">ลืมรหัสผ่าน?</a>
      </p>

      <!-- Simple Reset Password Form -->
      <div v-if="showSimpleReset" class="modal">
        <div class="modal-content">
          <span class="close" @click="showSimpleReset = false">&times;</span>
          <h2>รีเซ็ตรหัสผ่าน</h2>

          <div v-if="!resetSuccess">
            <p>หมายเหตุ: การรีเซ็ตรหัสผ่านนี้สำหรับผู้ใหญ่บ้านและผู้ช่วยผู้ใหญ่บ้านเท่านั้น</p>
            <div class="form-group">
              <label for="resetEmail">อีเมล</label>
              <input
                type="email"
                id="resetEmail"
                v-model="resetEmail"
                placeholder="กรอกอีเมลของคุณ"
              >
            </div>

            <div class="form-group">
              <label for="newPass">รหัสผ่านใหม่</label>
              <div class="password-input-container">
                <input
                  :type="showNewPass ? 'text' : 'password'"
                  id="newPass"
                  v-model="newPass"
                  placeholder="กรอกรหัสผ่านใหม่"
                >
                <button
                  type="button"
                  class="toggle-password-btn"
                  @click="showNewPass = !showNewPass"
                >
                  <i :class="showNewPass ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
                </button>
              </div>
            </div>

            <div class="form-group">
              <label for="confirmPass">ยืนยันรหัสผ่านใหม่</label>
              <div class="password-input-container">
                <input
                  :type="showConfirmPass ? 'text' : 'password'"
                  id="confirmPass"
                  v-model="confirmPass"
                  placeholder="กรอกรหัสผ่านใหม่อีกครั้ง"
                >
                <button
                  type="button"
                  class="toggle-password-btn"
                  @click="showConfirmPass = !showConfirmPass"
                >
                  <i :class="showConfirmPass ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
                </button>
              </div>
            </div>

            <p class="password-requirements">
              รหัสผ่านต้องมีความยาวไม่เกิน 10 ตัวอักษร และประกอบด้วยตัวอักษรพิมพ์ใหญ่ ตัวอักษรพิมพ์เล็ก และตัวเลข
            </p>

            <div v-if="resetError" class="error-message">{{ resetError }}</div>

            <button @click="simpleResetPassword" class="btn-primary">
              {{ isResetting ? 'กำลังรีเซ็ต...' : 'รีเซ็ตรหัสผ่าน' }}
            </button>
          </div>

          <div v-else>
            <p class="success-message">{{ resetSuccessMessage }}</p>
            <button @click="showSimpleReset = false" class="btn-primary">กลับไปยังหน้าเข้าสู่ระบบ</button>
          </div>
        </div>
      </div>

      <!-- Forgot Password Modal -->
      <div v-if="showForgotPassword" class="modal">
        <div class="modal-content">
          <span class="close" @click="showForgotPassword = false">&times;</span>
          <h2>รีเซ็ตรหัสผ่าน</h2>

          <div v-if="forgotPasswordStep === 'email'">
            <p>กรอกอีเมลของคุณเพื่อรับรหัสยืนยัน</p>
            <div class="form-group">
              <input
                type="email"
                v-model="forgotPasswordEmail"
                placeholder="กรอกอีเมลของคุณ"
                required
              >
            </div>
            <button
              @click="sendResetCode"
              :disabled="sendingCode || !forgotPasswordEmail"
              class="btn-primary"
            >
              {{ sendingCode ? 'กำลังส่ง...' : 'ส่งรหัสยืนยัน' }}
            </button>

            <!-- Display verification code for testing -->
            <div v-if="testVerificationCode" class="test-code-box">
              <p>รหัสยืนยันของคุณ:</p>
              <div class="code-display">{{ testVerificationCode }}</div>
              <p class="note">กรุณาใช้รหัสนี้ในขั้นตอนถัดไป รหัสนี้จะหมดอายุใน 5 นาที</p>
            </div>
          </div>

          <div v-if="forgotPasswordStep === 'verify'">
            <p>กรอกรหัสยืนยันที่ส่งไปยังอีเมลของคุณ</p>



            <div class="form-group otp-input">
              <input
                type="text"
                v-model="verificationCode"
                placeholder="กรอกรหัสยืนยัน 6 หลัก"
                maxlength="6"
                required
              >
            </div>
            <p class="timer" v-if="otpTimer > 0">รหัสจะหมดอายุใน: {{ formatTime(otpTimer) }}</p>
            <button
              @click="verifyCode"
              :disabled="verifyingCode || !verificationCode"
              class="btn-primary"
            >
              {{ verifyingCode ? 'กำลังตรวจสอบ...' : 'ตรวจสอบรหัส' }}
            </button>
            <p>
              <a href="#" @click.prevent="resendCode" :class="{ 'disabled': otpTimer > 0 }">
                {{ otpTimer > 0 ? `ส่งรหัสใหม่ใน ${formatTime(otpTimer)}` : 'ส่งรหัสใหม่' }}
              </a>
            </p>
          </div>

          <div v-if="forgotPasswordStep === 'reset'">
            <p>กรอกรหัสผ่านใหม่ของคุณ</p>
            <div class="form-group">
              <input
                :type="showNewPassword ? 'text' : 'password'"
                v-model="newPassword"
                placeholder="รหัสผ่านใหม่"
                required
              >
              <button
                type="button"
                class="toggle-password-btn"
                @click="showNewPassword = !showNewPassword"
              >
                <i :class="showNewPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
              </button>
            </div>
            <div class="form-group">
              <input
                :type="showConfirmPassword ? 'text' : 'password'"
                v-model="confirmPassword"
                placeholder="ยืนยันรหัสผ่านใหม่"
                required
              >
              <button
                type="button"
                class="toggle-password-btn"
                @click="showConfirmPassword = !showConfirmPassword"
              >
                <i :class="showConfirmPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
              </button>
            </div>
            <p class="password-requirements">
              รหัสผ่านต้องมีความยาวไม่เกิน 10 ตัวอักษร และประกอบด้วยตัวอักษรพิมพ์ใหญ่ ตัวอักษรพิมพ์เล็ก และตัวเลข
            </p>
            <button
              @click="resetPassword"
              :disabled="resettingPassword || !newPassword || !confirmPassword || newPassword !== confirmPassword"
              class="btn-primary"
            >
              {{ resettingPassword ? 'กำลังรีเซ็ต...' : 'รีเซ็ตรหัสผ่าน' }}
            </button>
          </div>

          <div v-if="forgotPasswordStep === 'success'">
            <p class="success-message">รีเซ็ตรหัสผ่านสำเร็จแล้ว!</p>
            <button @click="closeForgotPassword" class="btn-primary">กลับไปหน้าเข้าสู่ระบบ</button>
          </div>

          <p v-if="forgotPasswordError" class="error-message">{{ forgotPasswordError }}</p>

          <!-- Only show verification code in development mode or if email sending failed -->
          <div v-if="testVerificationCode && forgotPasswordStep !== 'email' && forgotPasswordStep !== 'success' && !emailSent" class="test-code-box fixed-code">
            <p>รหัสยืนยันของคุณ:</p>
            <div class="code-display">{{ testVerificationCode }}</div>
            <p class="note">กรุณาใช้รหัสนี้ด้านบน รหัสนี้จะหมดอายุใน {{ formatTime(otpTimer) }}</p>
            <p class="note">(รหัสนี้แสดงเนื่องจากไม่สามารถส่งอีเมลได้)</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions } from 'vuex'

export default {
  name: 'LoginView',
  data() {
    return {
      email: '',
      password: '',
      error: null,
      loading: false,
      showPassword: false,
      loginAttempts: 0,
      isLocked: false,
      lockCountdown: 0,
      countdownInterval: null,
      isPendingAccount: false,
      isPendingAccount: false,

      // Forgot password
      showForgotPassword: false,
      forgotPasswordStep: 'email', // email, verify, reset, success
      forgotPasswordEmail: '',
      verificationCode: '',
      newPassword: '',
      confirmPassword: '',
      forgotPasswordError: null,
      sendingCode: false,
      verifyingCode: false,
      resettingPassword: false,
      otpTimer: 0,
      otpTimerInterval: null,
      showNewPassword: false,
      showConfirmPassword: false,
      testVerificationCode: null, // For testing only
      emailSent: false, // Track if email was sent successfully

      // Simple reset password
      showSimpleReset: false,
      resetEmail: '',
      newPass: '',
      confirmPass: '',
      resetError: null,
      isResetting: false,
      resetSuccess: false,
      resetSuccessMessage: '',
      showNewPass: false,
      showConfirmPass: false
    }
  },
  created() {
    // Check if there's a stored login attempt count in localStorage
    const storedAttempts = localStorage.getItem('loginAttempts');
    if (storedAttempts) {
      this.loginAttempts = parseInt(storedAttempts);
    }

    // Check if account is locked
    const lockExpiry = localStorage.getItem('lockExpiry');
    if (lockExpiry) {
      const expiryTime = parseInt(lockExpiry);
      const currentTime = new Date().getTime();

      if (expiryTime > currentTime) {
        // Account is still locked
        this.isLocked = true;
        this.lockCountdown = Math.ceil((expiryTime - currentTime) / 1000);
        this.error = `บัญชีถูกล็อคชั่วคราว กรุณารอ ${this.lockCountdown} วินาที`;

        // Start countdown
        this.countdownInterval = setInterval(() => {
          this.lockCountdown--;
          this.error = `บัญชีถูกล็อคชั่วคราว กรุณารอ ${this.lockCountdown} วินาที`;

          if (this.lockCountdown <= 0) {
            this.unlockAccount();
          }
        }, 1000);
      } else {
        // Lock has expired
        localStorage.removeItem('lockExpiry');
      }
    }
  },

  beforeUnmount() {
    // Clear any intervals when component is destroyed
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }
    if (this.otpTimerInterval) {
      clearInterval(this.otpTimerInterval);
    }
  },

  methods: {
    ...mapActions(['login']),
    togglePasswordVisibility() {
      this.showPassword = !this.showPassword;
    },


    async handleLogin() {
      // Check if account is locked
      if (this.isLocked) {
        this.error = `บัญชีถูกล็อคชั่วคราว กรุณารอ ${this.lockCountdown} วินาที`
        return
      }

      // Reset pending account status on each login attempt
      this.isPendingAccount = false

      this.loading = true
      this.error = null

      try {
        // Proceed with login
        console.log('Attempting login with:', {
          email: this.email,
          passwordLength: this.password?.length || 0
        });

        await this.login({
          email: this.email,
          password: this.password
        })

        // Reset login attempts on successful login
        this.loginAttempts = 0
        localStorage.removeItem('loginAttempts')
        localStorage.removeItem('lockExpiry')

        // Check user status to determine redirect page
        const userStatus = localStorage.getItem('userStatus');
        let redirectPath = '/';

        // If user is headman or assistant, redirect to all-users page
        if (userStatus === 'headman' || userStatus === 'assistant') {
          redirectPath = '/';
        }

        console.log('Login successful, redirecting to:', redirectPath);

        // Force page reload after successful login
        window.location.href = redirectPath;
      } catch (error) {
        console.error('Login error:', error)

        // Check if it's a network error (no response from server)
        if (!error.response) {
          this.error = "เกิดข้อผิดพลาดในการเข้าสู่ระบบ กรุณาลองใหม่อีกครั้ง";
          this.loading = false;
          return;
        }

        // Check if it's a database lock timeout error
        if (error.response?.data?.code === 'ER_LOCK_WAIT_TIMEOUT') {
          this.error = "เกิดข้อผิดพลาดในการเข้าสู่ระบบเนื่องจากฐานข้อมูลไม่ตอบสนอง กรุณาลองใหม่อีกครั้งในอีกสักครู่";
          this.loading = false;
          return;
        }

        // Check if the error message contains "locked" or "locked until"
        const errorMessage = error.response?.data?.message || '';
        if (errorMessage.includes('locked') || errorMessage.includes('locked until')) {
          // Override the server's lock with our own 10-second lock
          this.lockAccount()
          this.loading = false
          return
        }

        // Check if account is pending approval
        if (errorMessage.includes('รออนุมัติ') || errorMessage.includes('pending approval') || error.response?.data?.isPending) {
          this.isPendingAccount = true;
          this.error = 'บัญชีของคุณกำลังรออนุมัติ กรุณาติดต่อผู้ใหญ่บ้าน';
          this.loginAttempts = 0; // Reset login attempts for pending accounts
          localStorage.removeItem('loginAttempts'); // Clear from localStorage
          this.loading = false;
          return;
        }

        // If the error message is about invalid credentials but the account is pending
        // This can happen when the password is wrong for a pending account
        if (errorMessage.includes('Invalid credentials') && error.response?.data?.isPending) {
          this.isPendingAccount = true;
          this.error = 'บัญชีของคุณกำลังรออนุมัติ กรุณาติดต่อผู้ใหญ่บ้าน';
          this.loginAttempts = 0; // Reset login attempts for pending accounts
          localStorage.removeItem('loginAttempts'); // Clear from localStorage
          this.loading = false;
          return;
        }

        // For any other error, make sure isPendingAccount is false
        this.isPendingAccount = false;

        this.error = errorMessage || 'Login failed. Please try again.'
        this.loading = false

        // Increment login attempts (we already checked for pending account above)
        this.loginAttempts++
        localStorage.setItem('loginAttempts', this.loginAttempts.toString())

        // Lock account after 3 failed attempts
        if (this.loginAttempts >= 3) {
          this.lockAccount()
        }
      }
    },

    lockAccount() {
      this.isLocked = true
      this.lockCountdown = 10 // 10 seconds
      this.error = `บัญชีถูกล็อคชั่วคราว กรุณารอ ${this.lockCountdown} วินาที`

      // Store login attempts and lock expiry in localStorage
      localStorage.setItem('loginAttempts', this.loginAttempts.toString())
      const expiryTime = new Date().getTime() + (this.lockCountdown * 1000)
      localStorage.setItem('lockExpiry', expiryTime.toString())

      // Clear any existing interval
      if (this.countdownInterval) {
        clearInterval(this.countdownInterval)
      }

      // Start countdown
      this.countdownInterval = setInterval(() => {
        this.lockCountdown--
        this.error = `บัญชีถูกล็อคชั่วคราว กรุณารอ ${this.lockCountdown} วินาที`

        if (this.lockCountdown <= 0) {
          this.unlockAccount()
        }
      }, 1000)
    },

    unlockAccount() {
      this.isLocked = false
      this.loginAttempts = 0

      // Clear localStorage
      localStorage.removeItem('loginAttempts')
      localStorage.removeItem('lockExpiry')

      // Clear the interval
      if (this.countdownInterval) {
        clearInterval(this.countdownInterval)
        this.countdownInterval = null
      }

      this.error = 'บัญชีถูกปลดล็อคแล้ว คุณสามารถลองเข้าสู่ระบบได้อีกครั้ง'
    },

    // Forgot password methods
    async sendResetCode() {
      if (!this.forgotPasswordEmail) {
        this.forgotPasswordError = 'Please enter your email address';
        return;
      }

      this.forgotPasswordError = null;
      this.sendingCode = true;
      this.testVerificationCode = null; // Reset test code

      try {
        // Call API to send verification code
        const response = await fetch('/api/auth/forgot-password', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ email: this.forgotPasswordEmail })
        });

        const data = await response.json();

        if (response.ok) {
          // Move to verification step
          this.forgotPasswordStep = 'verify';

          // Start OTP timer (5 minutes)
          this.otpTimer = 300;
          this.startOtpTimer();

          // Store test verification code if provided by the API
          if (data.code) {
            this.testVerificationCode = data.code;
            console.log('Test verification code:', data.code);
          }

          // Store email sent status
          this.emailSent = data.emailSent;

          // Show appropriate message
          this.forgotPasswordError = null;
          if (data.emailSent) {
            this.forgotPasswordError = 'รหัสยืนยันได้ถูกส่งไปยังอีเมลของคุณแล้ว กรุณาตรวจสอบกล่องจดหมายของคุณ (รวมถึงโฟลเดอร์สแปม)';
          }
        } else {
          // If we got a code but there was an error sending email, show the code
          if (data.code) {
            this.testVerificationCode = data.code;
            this.forgotPasswordStep = 'verify';
            this.otpTimer = 300;
            this.startOtpTimer();
          } else {
            this.forgotPasswordError = data.message || 'Failed to send verification code';
          }
        }
      } catch (error) {
        console.error('Error sending reset code:', error);
        this.forgotPasswordError = 'An error occurred. Please try again.';
      } finally {
        this.sendingCode = false;
      }
    },

    startOtpTimer() {
      // Clear any existing timer
      if (this.otpTimerInterval) {
        clearInterval(this.otpTimerInterval);
      }

      // Start countdown
      this.otpTimerInterval = setInterval(() => {
        this.otpTimer--;

        if (this.otpTimer <= 0) {
          clearInterval(this.otpTimerInterval);
          this.otpTimerInterval = null;
        }
      }, 1000);
    },

    formatTime(seconds) {
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = seconds % 60;
      return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
    },

    async simpleResetPassword() {
      // Validate inputs
      if (!this.resetEmail) {
        this.resetError = 'กรุณากรอกอีเมล';
        return;
      }

      if (!this.newPass) {
        this.resetError = 'กรุณากรอกรหัสผ่านใหม่';
        return;
      }

      if (this.newPass !== this.confirmPass) {
        this.resetError = 'รหัสผ่านไม่ตรงกัน';
        return;
      }

      // Validate password complexity
      if (this.newPass.length > 10) {
        this.resetError = 'รหัสผ่านต้องมีความยาวไม่เกิน 10 ตัวอักษร';
        return;
      }

      const hasUpperCase = /[A-Z]/.test(this.newPass);
      const hasLowerCase = /[a-z]/.test(this.newPass);
      const hasNumbers = /[0-9]/.test(this.newPass);

      if (!hasUpperCase || !hasLowerCase || !hasNumbers) {
        this.resetError = 'รหัสผ่านต้องประกอบด้วยตัวอักษรพิมพ์ใหญ่ ตัวอักษรพิมพ์เล็ก และตัวเลข';
        return;
      }

      this.isResetting = true;
      this.resetError = null;

      try {
        const response = await fetch('/api/auth/reset-password', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            email: this.resetEmail,
            newPassword: this.newPass
          })
        });

        const data = await response.json();

        if (response.ok) {
          this.resetSuccess = true;
          this.resetSuccessMessage = data.message || 'รหัสผ่านของคุณได้ถูกรีเซ็ตเรียบร้อยแล้ว';

          // Clear form
          this.resetEmail = '';
          this.newPass = '';
          this.confirmPass = '';
        } else {
          this.resetError = data.message || 'เกิดข้อผิดพลาดในการรีเซ็ตรหัสผ่าน';
        }
      } catch (error) {
        console.error('Error resetting password:', error);
        this.resetError = 'เกิดข้อผิดพลาดในการเชื่อมต่อกับเซิร์ฟเวอร์';
      } finally {
        this.isResetting = false;
      }
    },

    async resendCode() {
      if (this.otpTimer > 0) return;

      await this.sendResetCode();
    },

    async verifyCode() {
      if (!this.verificationCode) {
        this.forgotPasswordError = 'Please enter the verification code';
        return;
      }

      this.forgotPasswordError = null;
      this.verifyingCode = true;

      try {
        // Call API to verify code
        const response = await fetch('/api/auth/verify-reset-code', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            email: this.forgotPasswordEmail,
            code: this.verificationCode
          })
        });

        const data = await response.json();

        if (response.ok) {
          // Move to reset password step
          this.forgotPasswordStep = 'reset';

          // Clear the OTP timer
          if (this.otpTimerInterval) {
            clearInterval(this.otpTimerInterval);
            this.otpTimerInterval = null;
          }
        } else {
          this.forgotPasswordError = data.message || 'Invalid verification code';
        }
      } catch (error) {
        console.error('Error verifying code:', error);
        this.forgotPasswordError = 'An error occurred. Please try again.';
      } finally {
        this.verifyingCode = false;
      }
    },

    async resetPassword() {
      if (!this.newPassword) {
        this.forgotPasswordError = 'Please enter a new password';
        return;
      }

      if (this.newPassword !== this.confirmPassword) {
        this.forgotPasswordError = 'Passwords do not match';
        return;
      }

      // Validate password length (max 10 characters)
      if (this.newPassword.length > 10) {
        this.forgotPasswordError = 'Password must be 10 characters or less';
        return;
      }

      // Validate password complexity
      const hasUpperCase = /[A-Z]/.test(this.newPassword);
      const hasLowerCase = /[a-z]/.test(this.newPassword);
      const hasNumbers = /[0-9]/.test(this.newPassword);

      if (!hasUpperCase || !hasLowerCase || !hasNumbers) {
        this.forgotPasswordError = 'Password must contain uppercase letters, lowercase letters, and numbers';
        return;
      }

      this.forgotPasswordError = null;
      this.resettingPassword = true;

      try {
        // Call API to reset password
        const response = await fetch('/api/auth/reset-password', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            email: this.forgotPasswordEmail,
            code: this.verificationCode,
            newPassword: this.newPassword
          })
        });

        const data = await response.json();

        if (response.ok) {
          // Show success message
          this.forgotPasswordStep = 'success';
        } else {
          this.forgotPasswordError = data.message || 'Failed to reset password';
        }
      } catch (error) {
        console.error('Error resetting password:', error);
        this.forgotPasswordError = 'An error occurred. Please try again.';
      } finally {
        this.resettingPassword = false;
      }
    },

    closeForgotPassword() {
      this.showForgotPassword = false;
      this.forgotPasswordStep = 'email';
      this.forgotPasswordEmail = '';
      this.verificationCode = '';
      this.newPassword = '';
      this.confirmPassword = '';
      this.forgotPasswordError = null;

      if (this.otpTimerInterval) {
        clearInterval(this.otpTimerInterval);
        this.otpTimerInterval = null;
      }
    }
  }
}
</script>

<style scoped>
.login {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 80vh;
  padding: 20px;
}

.form-container {
  width: 100%;
  max-width: 400px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 30px;
}

.login-btn {
  width: 100%;
  background-color: #4CAF50;
  margin-bottom: 15px;
}

h1 {
  text-align: center;
  color: #333;
  margin-bottom: 30px;
  font-size: 28px;
}

.form-group {
  margin-bottom: 20px;
}

label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #333;
}

input {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
  transition: border-color 0.3s;
}

input:focus {
  border-color: #4CAF50;
  outline: none;
  box-shadow: 0 0 0 2px rgba(76, 175, 80, 0.2);
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

.error-message {
  color: #f44336;
  margin-top: 15px;
  text-align: center;
}

.locked-message {
  color: #ff9800;
  font-weight: bold;
}

.warning-message {
  color: #ff9800;
  margin-top: 10px;
  text-align: center;
  font-size: 14px;
}

p {
  text-align: center;
  margin-top: 20px;
  color: #666;
}

.link {
  color: #4CAF50;
  text-decoration: none;
  font-weight: 500;
}

.link:hover {
  text-decoration: underline;
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

/* Modal styles */
.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.test-code-box {
  background-color: #f8f9fa;
  border: 1px dashed #4CAF50;
  border-radius: 5px;
  padding: 15px;
  margin: 15px 0;
  text-align: center;
}

.fixed-code {
  position: sticky;
  top: 10px;
  z-index: 100;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  background-color: #f0f8f0;
  border: 2px solid #4CAF50;
}

.code-display {
  font-size: 28px;
  font-weight: bold;
  letter-spacing: 5px;
  color: #4CAF50;
  margin: 10px 0;
  background-color: #fff;
  padding: 10px;
  border-radius: 4px;
  border: 1px solid #e0e0e0;
}

.note {
  font-size: 12px;
  color: #666;
  font-style: italic;
  margin-top: 10px;
}

.modal-content {
  background-color: white;
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  width: 90%;
  max-width: 400px;
  position: relative;
}

.close {
  position: absolute;
  top: 15px;
  right: 20px;
  font-size: 24px;
  cursor: pointer;
  color: #666;
}

.close:hover {
  color: #333;
}

.modal h2 {
  margin-top: 0;
  margin-bottom: 20px;
  text-align: center;
}

.otp-input input {
  letter-spacing: 4px;
  font-size: 18px;
  text-align: center;
}

.timer {
  text-align: center;
  color: #666;
  font-size: 14px;
  margin: 10px 0;
}

.success-message {
  color: #4CAF50;
  text-align: center;
  font-weight: bold;
  margin: 20px 0;
}

.btn-primary {
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

.btn-primary:hover {
  background-color: #45a049;
}

.btn-primary:disabled {
  background-color: #9e9e9e;
  cursor: not-allowed;
}

.password-requirements {
  font-size: 12px;
  color: #666;
  margin-top: 5px;
  margin-bottom: 10px;
}

a.disabled {
  color: #999;
  cursor: not-allowed;
  text-decoration: none;
}

.test-code-box {
  background-color: #f8f9fa;
  border: 1px dashed #ccc;
  border-radius: 5px;
  padding: 15px;
  margin: 15px 0;
  text-align: center;
}

.test-code {
  font-size: 24px;
  font-weight: bold;
  letter-spacing: 5px;
  color: #4CAF50;
  margin: 10px 0;
  background-color: #fff;
  padding: 10px;
  border-radius: 4px;
  border: 1px solid #e0e0e0;
}

.test-note {
  font-size: 12px;
  color: #666;
  font-style: italic;
  margin-top: 10px;
}
</style>