import api from './api.js'

/**
 * Courses API service
 */
export const paymentService = {
  
  /**
   * Update payment amount
   * @param {number} paymentId - Payment ID
   * @param {Object} paymentData - Payment data
   * @param {number} paymentData.amount - New payment amount
   * @returns {Promise} API response
   */
  async updatePaymentAmount(paymentId, paymentData) {
    try {
      const response = await api.patch(`/payment/${paymentId}`, paymentData)
      return response.data
    } catch (error) {
      console.error('Error updating payment amount:', error)
      throw error
    }
  }
}