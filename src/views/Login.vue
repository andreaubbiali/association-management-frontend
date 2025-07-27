<template>
  <div class="login-page">
    <div class="login-container">
      <div class="login-card">
        <!-- Header -->
        <div class="login-header">
          <h1>Welcome Back</h1>
        </div>

        <!-- Login Form -->
        <form @submit.prevent="handleLogin" class="login-form">
          <!-- Username Field -->
          <div class="form-group">
            <label for="username">Username</label>
            <input
              id="username"
              v-model="loginForm.username"
              type="text"
              placeholder="Enter your username"
              required
              :disabled="loading"
              class="form-input"
              :class="{ 'error': errors.username }"
            />
            <span v-if="errors.username" class="error-message">{{ errors.username }}</span>
          </div>

          <!-- Password Field -->
          <div class="form-group">
            <label for="password">Password</label>
            <div class="password-input-container">
              <input
                id="password"
                v-model="loginForm.password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="Enter your password"
                required
                :disabled="loading"
                class="form-input"
                :class="{ 'error': errors.password }"
              />
              <button
                type="button"
                @click="togglePasswordVisibility"
                class="password-toggle"
                :disabled="loading"
              >
                {{ showPassword ? '👁️' : '👁️‍🗨️' }}
              </button>
            </div>
            <span v-if="errors.password" class="error-message">{{ errors.password }}</span>
          </div>

          <!-- Error Message -->
          <div v-if="error" class="error-container">
            <p class="error-message">{{ error }}</p>
            <button type="button" @click="clearError" class="error-dismiss">×</button>
          </div>

          <!-- Submit Button -->
          <button
            type="submit"
            :disabled="loading || !isFormValid"
            class="login-button"
          >
            <span v-if="loading" class="loading-spinner"></span>
            {{ loading ? 'Signing in...' : 'Sign In' }}
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { authService } from '../services/authService.js'

// Router
const router = useRouter()

// Reactive data
const loginForm = ref({
  username: '',
  password: ''
})

const loading = ref(false)
const error = ref(null)
const errors = ref({})
const showPassword = ref(false)

// Computed properties
const isFormValid = computed(() => {
  return loginForm.value.username && 
         loginForm.value.password && 
         loginForm.value.username.includes('@') &&
         loginForm.value.password.length >= 6
})

// Methods
const validateForm = () => {
  errors.value = {}
  
  // Username validation
  if (!loginForm.value.username) {
    errors.value.username = 'Username is required'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(loginForm.value.username)) {
    errors.value.username = 'Please enter a valid username'
  }
  
  // Password validation
  if (!loginForm.value.password) {
    errors.value.password = 'Password is required'
  } else if (loginForm.value.password.length < 6) {
    errors.value.password = 'Password must be at least 6 characters'
  }
  
  return Object.keys(errors.value).length === 0
}

const handleLogin = async () => {
  // Clear previous errors
  error.value = null
  
  // Validate form
  if (!validateForm()) {
    return
  }
  
  loading.value = true
  
  try {
    const credentials = {
      username: loginForm.value.username,
      password: loginForm.value.password
    }
    
    const response = await authService.login(credentials)
    
    console.log('Login successful:', response)
    
    // Redirect to dashboard or intended page
    const redirectTo = router.currentRoute.value.query.redirect || '/associates'
    
    console.log('Redirecting to:', redirectTo)

    await router.push(redirectTo)
    
  } catch (err) {
    console.error('Login error:', err)
    
    // Handle different error types
    if (err.response?.status === 401) {
      error.value = 'Invalid username or password'
    } else if (err.response?.status === 422) {
      // Validation errors from backend
      if (err.response.data.errors) {
        errors.value = err.response.data.errors
      } else {
        error.value = 'Please check your input and try again'
      }
    } else if (err.response?.status >= 500) {
      error.value = 'Server error. Please try again later.'
    } else if (!err.response) {
      error.value = 'Network error. Please check your connection.'
    } else {
      error.value = err.response?.data?.message || 'Login failed. Please try again.'
    }
  } finally {
    loading.value = false
  }
}

const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value
}

const clearError = () => {
  error.value = null
}

// Check if user is already logged in
onMounted(() => {
  const token = localStorage.getItem('authToken')
  if (token) {
    // User is already logged in, redirect to dashboard
    router.push('/associates')
  }
})
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #d8def4;
  padding: 1rem;
}

.login-container {
  width: 100%;
  max-width: 400px;
}

.login-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  padding: 2rem;
  animation: slideUp 0.3s ease-out;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.login-header {
  text-align: center;
  margin-bottom: 2rem;
}

.login-header h1 {
  color: #333;
  margin: 0 0 0.5rem 0;
  font-size: 1.8rem;
  font-weight: 600;
}

.login-header p {
  color: #666;
  margin: 0;
  font-size: 0.9rem;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group label {
  font-weight: 500;
  margin-bottom: 0.5rem;
  color: #333;
  font-size: 0.9rem;
}

.form-input {
  padding: 0.75rem;
  border: 2px solid #e1e5e9;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.2s ease;
  background: white;
  color: #333; /* Add explicit text color */
}

.form-input::placeholder {
  color: #999; /* Ensure placeholder is visible */
}

.form-input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  color: #333; /* Ensure text stays dark on focus */
}

.form-input:disabled {
  background: #f8f9fa;
  cursor: not-allowed;
  color: #666; /* Darker color for disabled state */
}

.form-input.error {
  border-color: #dc3545;
  color: #333; /* Keep text dark even with error */
}

.password-input-container {
  position: relative;
  display: flex;
  align-items: center;
}

.password-toggle {
  position: absolute;
  right: 0.75rem;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.25rem;
  color: #666;
  font-size: 1rem;
}

.password-toggle:hover {
  color: #333;
}

.checkbox-group {
  flex-direction: row;
  align-items: center;
}

.checkbox-label {
  display: flex;
  align-items: center;
  cursor: pointer;
  font-size: 0.9rem;
  color: #333;
}

.checkbox-label input[type="checkbox"] {
  margin-right: 0.5rem;
}

.error-container {
  position: relative;
  background: #f8d7da;
  border: 1px solid #f5c6cb;
  border-radius: 6px;
  padding: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.error-message {
  color: #721c24;
  font-size: 0.85rem;
  margin: 0;
}

.form-group .error-message {
  margin-top: 0.25rem;
  color: #dc3545;
}

.error-dismiss {
  background: none;
  border: none;
  color: #721c24;
  cursor: pointer;
  font-size: 1.2rem;
  padding: 0;
  margin-left: 0.5rem;
}

.login-button {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 0.875rem;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.login-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(102, 126, 234, 0.3);
}

.login-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.loading-spinner {
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.login-footer {
  text-align: center;
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e1e5e9;
}

.login-footer p {
  margin: 0 0 0.5rem 0;
  color: #666;
  font-size: 0.9rem;
}

.link {
  color: #667eea;
  text-decoration: none;
  font-weight: 500;
}

.link:hover {
  text-decoration: underline;
}

/* Responsive design */
@media (max-width: 480px) {
  .login-page {
    padding: 0.5rem;
  }
  
  .login-card {
    padding: 1.5rem;
  }
  
  .login-header h1 {
    font-size: 1.5rem;
  }
}
</style>
