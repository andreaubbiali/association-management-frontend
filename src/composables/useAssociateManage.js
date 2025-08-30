import { ref } from 'vue'
import { associatesService } from '../services/associatesService.js'

/**
 * Composable for managing individual associate data and operations
 */
export function useAssociateManage() {
  // Reactive state
  const associate = ref(null)
  const loading = ref(false)
  const error = ref(null)

  /**
   * Fetch a single associate by ID
   * @param {number} id - Associate ID
   */
  const fetchAssociate = async (id) => {
    loading.value = true
    error.value = null
    
    try {
      const response = await associatesService.getAssociate(id)
      
      // Handle different response structures
      if (response && typeof response === 'object') {
        associate.value = response
      } else {
        associate.value = null
        error.value = 'Invalid response format'
      }
    } catch (err) {
      console.error('useAssociateManage: API call failed:', err)
      error.value = err.response?.data?.message || err.message || 'Failed to fetch associate'
      associate.value = null
    } finally {
      loading.value = false
    }
  }

  /**
   * Clear error state
   */
  const clearError = () => {
    error.value = null
  }

  /**
   * Reset all state
   */
  const reset = () => {
    associate.value = null
    loading.value = false
    error.value = null
  }

  return {
    // State
    associate,
    loading,
    error,
    
    // Methods
    fetchAssociate,
    clearError,
    reset
  }
}
