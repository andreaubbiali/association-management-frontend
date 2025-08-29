import api from './api.js'

/**
 * Associates API service
 */
export const associatesService = {
  /**
   * Get all associates with optional filters
   * @param {Object} filters - Filter parameters
   * @param {string} filters.name - Filter by name
   * @param {string} filters.lastName - Filter by last name
   * @param {string} filters.email - Filter by email
   * @param {number} filters.associationYear - Filter by association year
   * @param {number} filters.page - Page number for pagination
   * @param {number} filters.limit - Items per page
   * @returns {Promise} API response
   */
  async searchAssociates(filters = {}) {
    try {
      const params = new URLSearchParams()
      
      // Add filters to query params
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
          params.append(key, value)
        }
      })
      
      const response = await api.get(`/associate/search?${params.toString()}`)
      return response.data
    } catch (error) {
      console.error('Error fetching associates:', error)
      throw error
    }
  },

  /**
   * Get a single associate by ID
   * @param {number} id - Associate ID
   * @returns {Promise} API response
   */
  async getAssociate(id) {
    try {
      const response = await api.get(`/associate/${id}`)
      return response.data
    } catch (error) {
      console.error('Error fetching associate:', error)
      throw error
    }
  },
}

