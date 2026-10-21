import { ref, computed } from 'vue'
import { usersService } from '../services/usersService.js'

/**
 * Composable for managing users data and operations
 * This provides reactive state management for the users list page
 */
export function useUsers() {
  // Reactive state
  const users = ref([])
  const loading = ref(false)
  const error = ref(null)
  const totalCount = ref(0)
  const filters = ref({
    name: '',
    email: '',
    bloomId: '',
    page: 1,
    limit: parseInt(import.meta.env.VITE_ITEMS_PER_PAGE) || 5
  })

  // Computed properties
  const hasUsers = computed(() => users.value.length > 0)

  /**
   * Fetch all users with current filters
   */
  const fetchUsers = async () => {
    loading.value = true
    error.value = null

    try {
      const response = await usersService.searchUsers(filters.value)

      // Handle different response structures
      if (Array.isArray(response)) {
        users.value = response
        totalCount.value = response.length
      } else if (response.results && Array.isArray(response.results)) {
        users.value = response.results
        totalCount.value = response.count ?? response.results.length
      } else if (response.data && Array.isArray(response.data)) {
        users.value = response.data
        totalCount.value = response.total || response.data.length
      } else {
        users.value = []
        totalCount.value = 0
      }
    } catch (err) {
      console.error('useUsers: API call failed:', err)
      error.value = err.response?.data?.message || err.message || 'Failed to fetch users'
      users.value = []
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
    await fetchUsers()
  }

  /**
   * Clear all filters and refetch data
   */
  const clearFilters = async () => {
    filters.value = {
      name: '',
      email: '',
      bloomId: '',
      page: 1,
      limit: parseInt(import.meta.env.VITE_ITEMS_PER_PAGE) || 5
    }
    await fetchUsers()
  }

  /**
   * Refresh users data
   */
  const refreshUsers = async () => {
    await fetchUsers()
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
    await fetchUsers()
  }

  return {
    // State
    users,
    loading,
    error,
    filters,
    totalCount,

    // Computed
    hasUsers,

    // Methods
    fetchUsers,
    applyFilters,
    clearFilters,
    refreshUsers,
    clearError,
    changePage
  }
}
