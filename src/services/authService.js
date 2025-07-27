import api from './api.js'

/**
 * Auth API service
 */
export const authService = {
  /**
   * Login user
   * @param {Object} credentials - Login credentials
   * @param {string} credentials.username
   * @param {string} credentials.password - User password
   * @returns {Promise} API response
   */
  async login(credentials) {
    try {
      const response = await api.post('/auth/login', credentials)
      
      // Store token if login successful
      if (response.data.token) {
        localStorage.setItem('authToken', response.data.token)
      }
      
      return response.data
    } catch (error) {
      console.error('Error during login:', error)
      throw error
    }
  },

  /**
   * Logout user
   * @returns {Promise} API response
   */
  async logout() {
    try {
      const response = await api.post('/auth/logout')
      localStorage.removeItem('authToken')
      return response.data
    } catch (error) {
      console.error('Error during logout:', error)
      localStorage.removeItem('authToken') // Remove token anyway
      throw error
    }
  },
}
