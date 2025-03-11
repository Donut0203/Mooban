// Login page HTML template
function getLoginPageHTML() {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Login</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100vh;
          margin: 0;
          background-color: #f5f5f5;
        }
        .login-container {
          background-color: white;
          padding: 20px;
          border-radius: 5px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          width: 300px;
        }
        h2 {
          text-align: center;
          margin-bottom: 20px;
        }
        .form-group {
          margin-bottom: 15px;
        }
        label {
          display: block;
          margin-bottom: 5px;
          font-weight: bold;
        }
        input {
          width: 100%;
          padding: 8px;
          box-sizing: border-box;
          border: 1px solid #ddd;
          border-radius: 4px;
        }
        button {
          width: 100%;
          padding: 10px;
          background-color: #4CAF50;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }
        button:hover {
          background-color: #45a049;
        }
        button:disabled {
          background-color: #cccccc;
          cursor: not-allowed;
        }
        .error {
          color: red;
          margin-top: 10px;
          text-align: center;
        }
        .register-link {
          text-align: center;
          margin-top: 15px;
        }
        .register-link a {
          color: #4CAF50;
          text-decoration: none;
        }
        .register-link a:hover {
          text-decoration: underline;
        }
        .password-requirements {
          font-size: 12px;
          color: #666;
          margin-top: 5px;
        }
      </style>
    </head>
    <body>
      <div class="login-container">
        <h2>Login</h2>
        <form id="loginForm">
          <div class="form-group">
            <label for="email">Email</label>
            <input type="email" id="email" name="email" required>
          </div>
          <div class="form-group">
            <label for="password">Password</label>
            <input type="password" id="password" name="password" required>
            <p class="password-requirements">
              Password must be 10 characters or less and contain uppercase letters, lowercase letters, and numbers.
            </p>
            <button type="button" id="togglePassword" style="background: none; border: none; color: #4CAF50; cursor: pointer; font-size: 14px; margin-top: 5px; padding: 0; text-align: right; width: 100%;">Show Password</button>
          </div>
          <button type="submit" id="loginButton">Login</button>
          <div id="error" class="error"></div>
        </form>
        <div class="register-link">
          Don't have an account? <a href="/register">Register here</a>
        </div>
      </div>

      <script>
        // Toggle password visibility
        document.getElementById('togglePassword').addEventListener('click', function() {
          const passwordInput = document.getElementById('password');
          const toggleBtn = document.getElementById('togglePassword');

          if (passwordInput.type === 'password') {
            passwordInput.type = 'text';
            toggleBtn.textContent = 'Hide Password';
          } else {
            passwordInput.type = 'password';
            toggleBtn.textContent = 'Show Password';
          }
        });

        // Regular login
        document.getElementById('loginForm').addEventListener('submit', async (e) => {
          e.preventDefault();

          const email = document.getElementById('email').value;
          const password = document.getElementById('password').value;
          const errorElement = document.getElementById('error');
          const loginButton = document.getElementById('loginButton');

          // Validate password format
          if (password.length > 10) {
            errorElement.textContent = 'Password must be 10 characters or less';
            return;
          }

          // Check for uppercase, lowercase, and numbers
          const hasUpperCase = /[A-Z]/.test(password);
          const hasLowerCase = /[a-z]/.test(password);
          const hasNumbers = /[0-9]/.test(password);

          if (!hasUpperCase || !hasLowerCase || !hasNumbers) {
            errorElement.textContent = 'Password must contain uppercase letters, lowercase letters, and numbers';
            return;
          }

          try {
            console.log('Attempting login with:', { email, password });
            const response = await fetch('/api/auth/login', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ email, password })
            });

            const data = await response.json();
            console.log('Login response:', data);

            if (response.ok) {
              // Save token and redirect
              localStorage.setItem('token', data.token);
              localStorage.setItem('userId', data.userId);
              localStorage.setItem('email', email);
              localStorage.setItem('status', data.userStatus || data.status || 'pending');
              alert('Login successful! Redirecting to home page...');
              window.location.href = '/home';
            } else {
              // Check if account is locked
              if (data.isLocked && data.lockedUntil) {
                loginButton.disabled = true;
                
                // Convert lockedUntil to Date object
                const lockedUntil = new Date(data.lockedUntil);
                
                // Show countdown
                const countdownInterval = setInterval(() => {
                  const now = new Date();
                  const remainingTimeMs = Math.max(0, lockedUntil - now);
                  const remainingSeconds = Math.ceil(remainingTimeMs / 1000);
                  
                  if (remainingSeconds <= 0) {
                    clearInterval(countdownInterval);
                    errorElement.textContent = 'You can try again now.';
                    loginButton.disabled = false;
                  } else {
                    // Display time in readable format
                    let timeDisplay;
                    if (remainingSeconds > 86400) { // more than 1 day
                      const days = Math.floor(remainingSeconds / 86400);
                      timeDisplay = days + ' day' + (days > 1 ? 's' : '');
                    } else if (remainingSeconds > 3600) { // more than 1 hour
                      const hours = Math.floor(remainingSeconds / 3600);
                      timeDisplay = hours + ' hour' + (hours > 1 ? 's' : '');
                    } else if (remainingSeconds > 60) { // more than 1 minute
                      const minutes = Math.floor(remainingSeconds / 60);
                      timeDisplay = minutes + ' minute' + (minutes > 1 ? 's' : '');
                    } else { // show in seconds
                      timeDisplay = remainingSeconds + ' second' + (remainingSeconds > 1 ? 's' : '');
                    }
                    
                    errorElement.textContent = 'Account locked. Try again in ' + timeDisplay + '.';
                    errorElement.style.color = 'red';
                    errorElement.style.fontWeight = 'bold';
                  }
                }, 1000);
                
                // Set timer to unlock button
                setTimeout(() => {
                  loginButton.disabled = false;
                  clearInterval(countdownInterval);
                  errorElement.textContent = 'You can try again now.';
                  errorElement.style.fontWeight = 'normal';
                }, lockedUntil - new Date());
              } else if (data.attemptsRemaining !== undefined) {
                // Show remaining attempts
                errorElement.textContent = data.message + '. You have ' + data.attemptsRemaining + ' attempt' + (data.attemptsRemaining !== 1 ? 's' : '') + ' remaining.';
                errorElement.style.color = data.attemptsRemaining === 1 ? '#ff6600' : 'red'; // orange for last attempt
              } else {
                errorElement.textContent = data.message || 'Login failed';
              }
            }
          } catch (error) {
            errorElement.textContent = 'An error occurred. Please try again.';
            console.error('Login error:', error);
          }
        });
      </script>
    </body>
    </html>
  `;
}

module.exports = getLoginPageHTML;