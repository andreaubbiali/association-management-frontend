import { ref } from 'vue'
import { usersService } from '../services/usersService.js'

/**
 * Runs an async fetch against the given loading/error/data refs, following
 * the same loading-true/clear-error/try/catch/finally shape every fetch in
 * this composable needs.
 */
async function runFetch({ loadingRef, errorRef, dataRef, fetcher, fallbackValue, errorLabel }) {
  loadingRef.value = true
  errorRef.value = null

  try {
    dataRef.value = await fetcher()
  } catch (err) {
    console.error(`useUserManage: fetch ${errorLabel} failed:`, err)
    errorRef.value = err.response?.data?.message || err.message || `Failed to fetch ${errorLabel}`
    dataRef.value = fallbackValue
  } finally {
    loadingRef.value = false
  }
}

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

  // Update (mutation) state
  const updating = ref(false)
  const updateError = ref(null)

  /**
   * Fetch a single user by ID
   * @param {number|string} id - User ID
   */
  const fetchUser = (id) => runFetch({
    loadingRef: loading,
    errorRef: error,
    dataRef: user,
    fetcher: () => usersService.getUser(id),
    fallbackValue: null,
    errorLabel: 'user'
  })

  /**
   * Fetch the relations for a given user. Failures here never clear
   * or block the already-loaded user-detail state.
   * @param {number|string} id - User ID
   */
  const fetchUserRelations = (id) => runFetch({
    loadingRef: relationsLoading,
    errorRef: relationsError,
    dataRef: relations,
    fetcher: () => usersService.getUserRelations(id),
    fallbackValue: [],
    errorLabel: 'relations'
  })

  /**
   * Update a user's editable fields. On success, replaces `user` with the
   * server's response (same full shape as fetchUser) so the detail card can
   * re-render immediately without a refetch. On failure, `user` is left
   * untouched and `updateError` holds the DRF field-error object
   * (e.g. { fiscalCode: ["..."] }) for per-field display.
   * @param {number|string} id - User ID
   * @param {Object} data - Any subset of the 13 editable fields
   * @returns {Promise<boolean>} true on success, false on failure
   */
  const updateUser = async (id, data) => {
    updating.value = true
    updateError.value = null
    try {
      user.value = await usersService.updateUser(id, data)
      return true
    } catch (err) {
      console.error('useUserManage: updateUser failed:', err)
      updateError.value = err.response?.data || { non_field_errors: [err.message || 'Failed to update user'] }
      return false
    } finally {
      updating.value = false
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
   * Clear only the update error state
   */
  const clearUpdateError = () => {
    updateError.value = null
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
    updating.value = false
    updateError.value = null
  }

  return {
    // State
    user,
    loading,
    error,
    relations,
    relationsLoading,
    relationsError,
    updating,
    updateError,

    // Methods
    fetchUser,
    fetchUserRelations,
    updateUser,
    clearError,
    clearRelationsError,
    clearUpdateError,
    reset
  }
}
