import api from './api.js'

/**
 * Export payment transactions for a given date range
 * @param {string} fromDate - Start date in YYYY-MM-DD format
 * @param {string} toDate - End date in YYYY-MM-DD format
 * @returns {Promise} API response
 */
export const exportTransactions = async (fromDate, toDate) => {
  try {
    const response = await api.post('/payment/transactions/export', {
      fromDate,
      toDate
    }, {
      responseType: 'blob', // Handle binary data (files)
      timeout: 30000 // Increase timeout for file generation
    })
    return response
  } catch (error) {
    console.error('Error exporting transactions:', error)
    throw error
  }
}

export default {
  exportTransactions
}