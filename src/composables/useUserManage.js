import { ref } from 'vue'
import { usersService } from '../services/usersService.js'

/**
 * Composable for managing a single user's detail and relations data.
 * The user-detail fetch and the relations fetch are two independent
 * operations, each with its own loading/error state.
 */
export function useUserManage() {
  // User-detail state
  const user = ref(null)
  const loading = ref(false)
  const error = ref(null)

  // Relations state
  const relations = ref([])
  const relationsLoading = ref(false)
  const relationsError = ref(null)

  /**
   * Fetch a single user by ID
   * @param {number|string} id - User ID
   */
  const fetchUser = async (id) => {
    loading.value = true
    error.value = null

    try {
      const response = await usersService.getUser(id)
      user.value = response
    } catch (err) {
      console.error('useUserManage: fetchUser failed:', err)
      error.value = err.response?.data?.message || err.message || 'Failed to fetch user'
      user.value = null
    } finally {
      loading.value = false
    }
  }

  /**
   * Fetch the relations for a given user. Failures here never clear
   * or block the already-loaded user-detail state.
   * @param {number|string} id - User ID
   */
  const fetchUserRelations = async (id) => {
    relationsLoading.value = true
    relationsError.value = null

    try {
      const response = await usersService.getUserRelations(id)
      relations.value = response
    } catch (err) {
      console.error('useUserManage: fetchUserRelations failed:', err)
      relationsError.value = err.response?.data?.message || err.message || 'Failed to fetch relations'
      relations.value = []
    } finally {
      relationsLoading.value = false
    }
  }

  /**
   * Clear only the user-detail error state
   */
  const clearError = () => {
    error.value = null
  }

  /**
   * Clear only the relations error state
   */
  const clearRelationsError = () => {
    relationsError.value = null
  }

  /**
   * Reset all state back to initial values
   */
  const reset = () => {
    user.value = null
    loading.value = false
    error.value = null
    relations.value = []
    relationsLoading.value = false
    relationsError.value = null
  }

  return {
    // State
    user,
    loading,
    error,
    relations,
    relationsLoading,
    relationsError,

    // Methods
    fetchUser,
    fetchUserRelations,
    clearError,
    clearRelationsError,
    reset
  }
}
