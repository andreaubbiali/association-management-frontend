import api from './api.js'

/**
 * Users API service
 */
export const usersService = {
  /**
   * Search users with optional filters
   * @param {Object} filters - Filter parameters
   * @param {string} filters.name - Filter by name
   * @param {string} filters.email - Filter by email
   * @param {string} filters.bloomId - Filter by Bloom id
   * @param {number} filters.page - Page number for pagination
   * @param {number} filters.limit - Items per page
   * @returns {Promise} API response
   */
  async searchUsers(filters = {}) {
    try {
      const params = new URLSearchParams()

      // Add filters to query params
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
          params.append(key, value)
        }
      })

      const response = await api.get(`/user/search?${params.toString()}`)
      return response.data
    } catch (error) {
      console.error('Error fetching users:', error)
      throw error
    }
  },

  /**
   * Get a single user by ID
   * @param {number} id - User ID
   * @returns {Promise} API response
   */
  async getUser(id) {
    try {
      const response = await api.get(`/user/${id}`)
      return response.data
    } catch (error) {
      console.error('Error fetching user:', error)
      throw error
    }
  },

  /**
   * Update a user's editable fields (partial update)
   * @param {number} id - User ID
   * @param {Object} data - Any subset of the 13 editable fields
   * @returns {Promise} API response (full updated user, same shape as getUser)
   */
  async updateUser(id, data) {
    try {
      const response = await api.patch(`/user/${id}`, data)
      return response.data
    } catch (error) {
      console.error('Error updating user:', error)
      throw error
    }
  },

  /**
   * Get the relations for a given user
   * @param {number} id - User ID
   * @returns {Promise} API response (flat array)
   */
  async getUserRelations(id) {
    try {
      const response = await api.get(`/user/${id}/relations`)
      return response.data
    } catch (error) {
      console.error('Error fetching user relations:', error)
      throw error
    }
  },

  /**
   * Create a standalone User (identity data only, optional relations array
   * for minors). The only service method whose caller needs the response
   * status itself (201 newly created vs 200 fiscalCode already matched an
   * existing user), so this resolves with { data, status } rather than the
   * bare body every other method on this service returns.
   * @param {Object} payload - 13 identity fields + optional relations array
   * @returns {Promise<{data: Object, status: number}>}
   */
  async createUser(payload) {
    try {
      const response = await api.post('/user', payload)
      return { data: response.data, status: response.status }
    } catch (error) {
      console.error('Error creating user:', error)
      throw error
    }
  },

  /**
   * Get a user's paginated association (Associate) history.
   * @param {number} userId - User ID
   * @param {Object} params - { page, limit }
   * @returns {Promise} API response (DRF pagination envelope)
   */
  async getAssociateHistory(userId, { page, limit } = {}) {
    try {
      const params = new URLSearchParams()
      if (page !== undefined && page !== null && page !== '') {
        params.append('page', page)
      }
      if (limit !== undefined && limit !== null && limit !== '') {
        params.append('limit', limit)
      }

      const queryString = params.toString()
      const url = queryString ? `/user/${userId}/associates?${queryString}` : `/user/${userId}/associates`
      const response = await api.get(url)
      return response.data
    } catch (error) {
      console.error('Error fetching associate history:', error)
      throw error
    }
  }
}
