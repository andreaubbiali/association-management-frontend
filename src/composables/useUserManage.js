import { ref } from 'vue'
import { usersService } from '../services/usersService.js'
import { associatesService } from '../services/associatesService.js'

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

  // Create-user (Add User flow) state
  const creating = ref(false)
  const createError = ref(null)

  // Create-associate ("Associate for <year>" action) state
  const associateCreating = ref(false)
  const associateCreateError = ref(null)

  // Associate history state
  const associateHistory = ref([])
  const associateHistoryTotalCount = ref(0)
  const associateHistoryLoading = ref(false)
  const associateHistoryError = ref(null)

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
   * Create a standalone User (identity data only, optional relations array
   * for minors), used by the "Add User" page. Does not mutate the
   * user/relations state used by fetchUser/fetchUserRelations -- this
   * composable instance is a fresh instance per page visit.
   * @param {Object} payload - 13 identity fields + optional relations array
   * @returns {Promise<{user: Object, created: boolean}|null>} null on failure
   */
  const createUser = async (payload) => {
    creating.value = true
    createError.value = null
    try {
      const { data, status } = await usersService.createUser(payload)
      return { user: data, created: status === 201 }
    } catch (err) {
      console.error('useUserManage: createUser failed:', err)
      createError.value = err.response?.data || { non_field_errors: [err.message || 'Failed to create user'] }
      return null
    } finally {
      creating.value = false
    }
  }

  /**
   * Create a minimal yearly Associate renewal for an already-registered User.
   * On success, prepends the new row to associateHistory so the indicator
   * and the History modal reflect it immediately without a refetch.
   * @param {number|string} userId - User ID
   * @param {number} validityYearStart - Validity start year
   * @returns {Promise<Object|null>} the created associate row, or null on failure
   */
  const createAssociateForUser = async (userId, validityYearStart) => {
    associateCreating.value = true
    associateCreateError.value = null
    try {
      const created = await associatesService.createAssociate({ userId, validityYearStart })
      associateHistory.value = [created, ...associateHistory.value]
      return created
    } catch (err) {
      console.error('useUserManage: createAssociateForUser failed:', err)
      if (err.response?.status === 409) {
        associateCreateError.value = err.response?.data?.error || 'An associate already exists for this year'
      } else {
        associateCreateError.value = err.response?.data?.error || err.response?.data?.message || err.message || 'Failed to create associate'
      }
      return null
    } finally {
      associateCreating.value = false
    }
  }

  /**
   * Fetch a user's paginated association (Associate) history.
   * @param {number|string} userId - User ID
   * @param {Object} params - { page, limit }
   */
  const fetchAssociateHistory = async (userId, { page, limit } = {}) => {
    associateHistoryLoading.value = true
    associateHistoryError.value = null
    try {
      const envelope = await usersService.getAssociateHistory(userId, { page, limit })
      associateHistory.value = envelope.results || []
      associateHistoryTotalCount.value = envelope.count || 0
    } catch (err) {
      console.error('useUserManage: fetchAssociateHistory failed:', err)
      associateHistoryError.value = err.response?.data?.message || err.message || 'Failed to fetch associate history'
      associateHistory.value = []
    } finally {
      associateHistoryLoading.value = false
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
    creating,
    createError,
    associateCreating,
    associateCreateError,
    associateHistory,
    associateHistoryTotalCount,
    associateHistoryLoading,
    associateHistoryError,

    // Methods
    fetchUser,
    fetchUserRelations,
    updateUser,
    createUser,
    createAssociateForUser,
    fetchAssociateHistory,
    clearError,
    clearRelationsError,
    clearUpdateError,
    reset
  }
}
