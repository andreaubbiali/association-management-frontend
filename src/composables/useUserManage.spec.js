import { describe, it, expect, vi, beforeEach } from 'vitest'
import { usersService } from '../services/usersService.js'
import { useUserManage } from './useUserManage.js'

vi.mock('../services/usersService.js', () => ({
  usersService: {
    getUser: vi.fn(),
    getUserRelations: vi.fn(),
    updateUser: vi.fn()
  }
}))

describe('useUserManage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('initializes with null user, empty relations array, and all loading/error/updating flags falsy', () => {
    const { user, loading, error, relations, relationsLoading, relationsError, updating, updateError } = useUserManage()

    expect(user.value).toBeNull()
    expect(loading.value).toBe(false)
    expect(error.value).toBeNull()
    expect(relations.value).toEqual([])
    expect(relationsLoading.value).toBe(false)
    expect(relationsError.value).toBeNull()
    expect(updating.value).toBe(false)
    expect(updateError.value).toBeNull()
  })

  describe('fetchUser', () => {
    it('sets loading true while in flight, populates user on success, then sets loading false', async () => {
      let resolvePromise
      usersService.getUser.mockReturnValue(new Promise((resolve) => { resolvePromise = resolve }))

      const { fetchUser, loading, user, error } = useUserManage()
      const promise = fetchUser(1)

      expect(loading.value).toBe(true)

      const payload = { id: 1, bloomId: 'BLOOM_20251', name: 'Mario', lastName: 'Rossi' }
      resolvePromise(payload)
      await promise

      expect(loading.value).toBe(false)
      expect(error.value).toBeNull()
      expect(user.value).toEqual(payload)
      expect(usersService.getUser).toHaveBeenCalledWith(1)
    })

    it('sets error and clears user to null when the request fails', async () => {
      usersService.getUser.mockRejectedValue(new Error('User not found'))

      const { fetchUser, user, error, loading } = useUserManage()
      await fetchUser(999)

      expect(loading.value).toBe(false)
      expect(error.value).toBe('User not found')
      expect(user.value).toBeNull()
    })
  })

  describe('fetchUserRelations', () => {
    it('sets relationsLoading true while in flight, populates relations on success, then sets relationsLoading false', async () => {
      let resolvePromise
      usersService.getUserRelations.mockReturnValue(new Promise((resolve) => { resolvePromise = resolve }))

      const { fetchUserRelations, relationsLoading, relations, relationsError } = useUserManage()
      const promise = fetchUserRelations(1)

      expect(relationsLoading.value).toBe(true)

      const payload = [
        {
          id: 10,
          relationType: 'parent',
          isRelatedUserReceiptHolder: true,
          otherUser: { id: 2, bloomId: 'BLOOM_20252', name: 'Anna', lastName: 'Rossi' }
        }
      ]
      resolvePromise(payload)
      await promise

      expect(relationsLoading.value).toBe(false)
      expect(relationsError.value).toBeNull()
      expect(relations.value).toEqual(payload)
      expect(usersService.getUserRelations).toHaveBeenCalledWith(1)
    })

    it('sets relationsError and does not throw when the relations request fails', async () => {
      usersService.getUserRelations.mockRejectedValue(new Error('Relations service unavailable'))

      const { fetchUserRelations, relationsError, relationsLoading, relations } = useUserManage()

      await expect(fetchUserRelations(1)).resolves.not.toThrow()

      expect(relationsLoading.value).toBe(false)
      expect(relationsError.value).toBe('Relations service unavailable')
      expect(relations.value).toEqual([])
    })

    it('does not clear or block an already-loaded user when the relations fetch fails', async () => {
      const userPayload = { id: 1, bloomId: 'BLOOM_20251', name: 'Mario', lastName: 'Rossi' }
      usersService.getUser.mockResolvedValue(userPayload)
      usersService.getUserRelations.mockRejectedValue(new Error('Relations service unavailable'))

      const { fetchUser, fetchUserRelations, user, error, relationsError } = useUserManage()

      await fetchUser(1)
      expect(user.value).toEqual(userPayload)
      expect(error.value).toBeNull()

      await fetchUserRelations(1)

      // User detail must remain intact and its own error state untouched.
      expect(user.value).toEqual(userPayload)
      expect(error.value).toBeNull()
      expect(relationsError.value).toBe('Relations service unavailable')
    })

    it('keeps user detail loading/error state independent when relations are fetched concurrently with a failing user fetch', async () => {
      usersService.getUser.mockRejectedValue(new Error('User not found'))
      usersService.getUserRelations.mockResolvedValue([])

      const { fetchUser, fetchUserRelations, user, error, relations, relationsError } = useUserManage()

      await Promise.all([fetchUser(1), fetchUserRelations(1)])

      expect(user.value).toBeNull()
      expect(error.value).toBe('User not found')
      expect(relations.value).toEqual([])
      expect(relationsError.value).toBeNull()
    })
  })

  describe('updateUser', () => {
    it('sets updating true while in flight, replaces user with the server response on success, then sets updating false', async () => {
      let resolvePromise
      usersService.updateUser.mockReturnValue(new Promise((resolve) => { resolvePromise = resolve }))

      const { updateUser, updating, user, updateError } = useUserManage()
      const promise = updateUser(1, { name: 'Mario' })

      expect(updating.value).toBe(true)

      const payload = { id: 1, bloomId: 'BLOOM_20251', name: 'Mario', lastName: 'Rossi' }
      resolvePromise(payload)
      const result = await promise

      expect(result).toBe(true)
      expect(updating.value).toBe(false)
      expect(updateError.value).toBeNull()
      expect(user.value).toEqual(payload)
      expect(usersService.updateUser).toHaveBeenCalledWith(1, { name: 'Mario' })
    })

    it('resolves false, sets updateError from the response body, and leaves the last-known-good user untouched on failure', async () => {
      const existingUser = { id: 1, bloomId: 'BLOOM_20251', name: 'Mario', lastName: 'Rossi', fiscalCode: 'RSSMRA80A01H501Z' }
      usersService.getUser.mockResolvedValue(existingUser)
      usersService.updateUser.mockRejectedValue({
        response: { status: 400, data: { fiscalCode: ['A user with this fiscal code already exists.'] } }
      })

      const { fetchUser, updateUser, updating, user, updateError } = useUserManage()
      await fetchUser(1)
      expect(user.value).toEqual(existingUser)

      const result = await updateUser(1, { fiscalCode: 'DUPLICATE123' })

      expect(result).toBe(false)
      expect(updating.value).toBe(false)
      expect(updateError.value).toEqual({ fiscalCode: ['A user with this fiscal code already exists.'] })
      // The last-known-good user must not be corrupted by the failed edit.
      expect(user.value).toEqual(existingUser)
    })

    it('falls back to a non_field_errors shape when the failure has no response body', async () => {
      usersService.updateUser.mockRejectedValue(new Error('Network error'))

      const { updateUser, updateError } = useUserManage()
      const result = await updateUser(1, { name: 'Mario' })

      expect(result).toBe(false)
      expect(updateError.value).toEqual({ non_field_errors: ['Network error'] })
    })
  })

  describe('clearUpdateError', () => {
    it('clears only updateError, leaving user-detail and relations error state untouched', async () => {
      usersService.updateUser.mockRejectedValue({ response: { data: { fiscalCode: ['Duplicate'] } } })
      usersService.getUserRelations.mockRejectedValue(new Error('Relations down'))

      const { updateUser, fetchUserRelations, clearUpdateError, updateError, relationsError } = useUserManage()
      await updateUser(1, { fiscalCode: 'X' })
      await fetchUserRelations(1)

      clearUpdateError()

      expect(updateError.value).toBeNull()
      expect(relationsError.value).toBe('Relations down')
    })
  })

  describe('clearError', () => {
    it('clears only the user-detail error, leaving relationsError untouched', async () => {
      usersService.getUser.mockRejectedValue(new Error('User not found'))
      usersService.getUserRelations.mockRejectedValue(new Error('Relations down'))

      const { fetchUser, fetchUserRelations, clearError, error, relationsError } = useUserManage()
      await fetchUser(1)
      await fetchUserRelations(1)

      clearError()

      expect(error.value).toBeNull()
      expect(relationsError.value).toBe('Relations down')
    })
  })

  describe('clearRelationsError', () => {
    it('clears only the relations error, leaving the user-detail error untouched', async () => {
      usersService.getUser.mockRejectedValue(new Error('User not found'))
      usersService.getUserRelations.mockRejectedValue(new Error('Relations down'))

      const { fetchUser, fetchUserRelations, clearRelationsError, error, relationsError } = useUserManage()
      await fetchUser(1)
      await fetchUserRelations(1)

      clearRelationsError()

      expect(relationsError.value).toBeNull()
      expect(error.value).toBe('User not found')
    })
  })

  describe('reset', () => {
    it('resets user, relations, loading, error and update state back to initial values', async () => {
      usersService.getUser.mockResolvedValue({ id: 1, bloomId: 'BLOOM_20251' })
      usersService.getUserRelations.mockResolvedValue([{ id: 10, relationType: 'parent' }])
      usersService.updateUser.mockRejectedValue({ response: { data: { fiscalCode: ['Duplicate'] } } })

      const {
        fetchUser, fetchUserRelations, updateUser, reset,
        user, relations, loading, error, relationsLoading, relationsError, updating, updateError
      } = useUserManage()
      await fetchUser(1)
      await fetchUserRelations(1)
      await updateUser(1, { fiscalCode: 'X' })

      reset()

      expect(user.value).toBeNull()
      expect(relations.value).toEqual([])
      expect(loading.value).toBe(false)
      expect(error.value).toBeNull()
      expect(relationsLoading.value).toBe(false)
      expect(relationsError.value).toBeNull()
      expect(updating.value).toBe(false)
      expect(updateError.value).toBeNull()
    })
  })
})
