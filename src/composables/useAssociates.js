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
  const totalCount = ref(0)
  const filters = ref({
    name: '',
    lastName: '',
    email: '',
    associationYear: '',
    page: 1,
    limit: 5
  })

  // Computed properties
  const hasAssociates = computed(() => associates.value.length > 0)

  /**
   * Fetch all associates with current filters
   */
  const fetchAssociates = async () => {
    loading.value = true
    error.value = null
    
    try {
      const response = await associatesService.searchAssociates(filters.value)
      
      // Handle different response structures
      if (Array.isArray(response)) {
        associates.value = response
        totalCount.value = response.length
      } else if (response.data && Array.isArray(response.data)) {
        associates.value = response.data
        totalCount.value = response.total || response.data.length
      } else if (response.results && Array.isArray(response.results)) {
        associates.value = response.results
        totalCount.value = response.total || response.count || response.results.length
      } else {
        associates.value = []
        totalCount.value = 0
      }
    } catch (err) {
      console.error('useAssociates: API call failed:', err)
      error.value = err.response?.data?.message || err.message || 'Failed to fetch associates'
      associates.value = []
      totalCount.value = 0
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

  /**
   * Change page and refetch data
   * @param {number} page - New page number
   */
  const changePage = async (page) => {
    filters.value.page = page
    await fetchAssociates()
  }

  return {
    // State
    associates,
    loading,
    error,
    filters,
    totalCount,
    
    // Computed
    hasAssociates,
    
    // Methods
    fetchAssociates,
    applyFilters,
    clearFilters,
    refreshAssociates,
    clearError,
    changePage
  }
}
