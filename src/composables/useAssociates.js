import { ref, computed } from 'vue'
import { associatesService } from '../services/associatesService.js'

/**
 * Composable for managing associates data and operations
 * This provides reactive state management for associates
 */
export function useAssociates() {
  // Reactive state
  const associates = ref([])
  const loading = ref(false)
  const error = ref(null)
  const filters = ref({
    name: '',
    lastName: '',
    email: '',
    associationYear: '',
    page: 1,
    limit: 10
  })

  // Computed properties
  const hasAssociates = computed(() => associates.value.length > 0)
  const totalCount = computed(() => associates.value.length)

  /**
   * Fetch all associates with current filters
   */
  const fetchAssociates = async () => {
    loading.value = true
    error.value = null
    
    try {
      const response = await associatesService.getAssociates(filters.value)
      
      // Handle different response structures
      if (Array.isArray(response)) {
        associates.value = response
      } else if (response.data && Array.isArray(response.data)) {
        associates.value = response.data
      } else if (response.results && Array.isArray(response.results)) {
        associates.value = response.results
      } else {
        associates.value = []
      }
    } catch (err) {
      error.value = err.response?.data?.message || err.message || 'Failed to fetch associates'
      associates.value = []
    } finally {
      loading.value = false
    }
  }

  /**
   * Apply filters and refetch data
   * @param {Object} newFilters - New filter values
   */
  const applyFilters = async (newFilters) => {
    filters.value = { ...filters.value, ...newFilters, page: 1 }
    await fetchAssociates()
  }

  /**
   * Clear all filters and refetch data
   */
  const clearFilters = async () => {
    filters.value = {
      name: '',
      lastName: '',
      email: '',
      associationYear: '',
      page: 1,
      limit: filters.value.limit
    }
    await fetchAssociates()
  }

  /**
   * Refresh associates data
   */
  const refreshAssociates = async () => {
    await fetchAssociates()
  }

  /**
   * Clear error state
   */
  const clearError = () => {
    error.value = null
  }

  return {
    // State
    associates,
    loading,
    error,
    filters,
    
    // Computed
    hasAssociates,
    totalCount,
    
    // Methods
    fetchAssociates,
    applyFilters,
    clearFilters,
    refreshAssociates,
    clearError
  }
}
