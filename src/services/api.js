import axios from 'axios'

// Create axios instance with base configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1/',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  }
})

// Request interceptor for adding auth tokens
api.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem('authToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor for handling common errors
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    console.error('API error:', error)
    
    // Check if it's a CORS error (no response object)
    if (!error.response) {
      console.error('Network error or CORS issue:', error.message)
      return Promise.reject(error)
    }
    
    // Handle common error scenarios
    if (error.response?.status === 401) {
      // Unauthorized - redirect to login
      console.log('401 Unauthorized - redirecting to login')
      localStorage.removeItem('authToken')
      // Use window.location for now, router would need to be imported
      if (typeof window !== 'undefined') {
        window.location.href = '/login'
      }
    } else if (error.response?.status === 403) {
      // Forbidden
      console.error('Access forbidden')
    } else if (error.response?.status >= 500) {
      // Server errors
      console.error('Server error:', error.response.data)
    }
    
    return Promise.reject(error)
  }
)

export default api
