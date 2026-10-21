import { describe, it, expect, vi, beforeEach } from 'vitest'
import { usersService } from '../services/usersService.js'
import { useUsers } from './useUsers.js'

vi.mock('../services/usersService.js', () => ({
  usersService: {
    searchUsers: vi.fn()
  }
}))

describe('useUsers', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('initializes with empty users, no error, not loading, and default filters', () => {
    const { users, loading, error, totalCount, filters } = useUsers()

    expect(users.value).toEqual([])
    expect(loading.value).toBe(false)
    expect(error.value).toBeNull()
    expect(totalCount.value).toBe(0)
    expect(filters.value).toEqual({
      name: '',
      email: '',
      bloomId: '',
      page: 1,
      limit: 5
    })
  })

  describe('fetchUsers', () => {
    it('sets loading true while in flight, then false, and populates users/totalCount on a results-shaped response', async () => {
      let resolvePromise
      usersService.searchUsers.mockReturnValue(
        new Promise((resolve) => { resolvePromise = resolve })
      )

      const { fetchUsers, loading, users, totalCount, error } = useUsers()
      const fetchPromise = fetchUsers()

      expect(loading.value).toBe(true)

      resolvePromise({
        results: [{ id: 1, bloomId: 'BLOOM_20251', name: 'Mario', lastName: 'Rossi' }],
        count: 1
      })
      await fetchPromise

      expect(loading.value).toBe(false)
      expect(error.value).toBeNull()
      expect(users.value).toEqual([{ id: 1, bloomId: 'BLOOM_20251', name: 'Mario', lastName: 'Rossi' }])
      expect(totalCount.value).toBe(1)
    })

    it('handles a plain-array response by using its length as totalCount', async () => {
      usersService.searchUsers.mockResolvedValue([
        { id: 1, bloomId: 'BLOOM_20251' },
        { id: 2, bloomId: 'BLOOM_20252' }
      ])

      const { fetchUsers, users, totalCount } = useUsers()
      await fetchUsers()

      expect(users.value).toHaveLength(2)
      expect(totalCount.value).toBe(2)
    })

    it('sets error and clears users when the request fails', async () => {
      usersService.searchUsers.mockRejectedValue(new Error('Boom'))

      const { fetchUsers, users, error, loading, totalCount } = useUsers()
      await fetchUsers()

      expect(loading.value).toBe(false)
      expect(error.value).toBe('Boom')
      expect(users.value).toEqual([])
      expect(totalCount.value).toBe(0)
    })

    it('calls usersService.searchUsers with the current filters', async () => {
      usersService.searchUsers.mockResolvedValue({ results: [], count: 0 })

      const { fetchUsers, filters } = useUsers()
      await fetchUsers()

      expect(usersService.searchUsers).toHaveBeenCalledWith(filters.value)
    })
  })

  describe('applyFilters', () => {
    it('merges new filters into existing filters, resets page to 1, and refetches', async () => {
      usersService.searchUsers.mockResolvedValue({ results: [], count: 0 })

      const { applyFilters, filters } = useUsers()
      filters.value.page = 3

      await applyFilters({ name: 'Mario', email: 'mario@example.com' })

      expect(filters.value.name).toBe('Mario')
      expect(filters.value.email).toBe('mario@example.com')
      expect(filters.value.page).toBe(1)
      expect(usersService.searchUsers).toHaveBeenCalledTimes(1)
    })
  })

  describe('clearFilters', () => {
    it('resets filters to defaults and refetches', async () => {
      usersService.searchUsers.mockResolvedValue({ results: [], count: 0 })

      const { applyFilters, clearFilters, filters } = useUsers()
      await applyFilters({ name: 'Mario', email: 'mario@example.com', bloomId: 'BLOOM_1' })

      await clearFilters()

      expect(filters.value).toEqual({
        name: '',
        email: '',
        bloomId: '',
        page: 1,
        limit: 5
      })
      expect(usersService.searchUsers).toHaveBeenCalledTimes(2)
    })
  })

  describe('refreshUsers', () => {
    it('refetches users with the current filters', async () => {
      usersService.searchUsers.mockResolvedValue({ results: [], count: 0 })

      const { refreshUsers } = useUsers()
      await refreshUsers()

      expect(usersService.searchUsers).toHaveBeenCalledTimes(1)
    })
  })

  describe('clearError', () => {
    it('clears a previously set error without touching other state', async () => {
      usersService.searchUsers.mockRejectedValue(new Error('Boom'))

      const { fetchUsers, clearError, error } = useUsers()
      await fetchUsers()
      expect(error.value).toBe('Boom')

      clearError()
      expect(error.value).toBeNull()
    })
  })

  describe('changePage', () => {
    it('updates filters.page and refetches', async () => {
      usersService.searchUsers.mockResolvedValue({ results: [], count: 0 })

      const { changePage, filters } = useUsers()
      await changePage(3)

      expect(filters.value.page).toBe(3)
      expect(usersService.searchUsers).toHaveBeenCalledTimes(1)
      expect(usersService.searchUsers).toHaveBeenCalledWith(expect.objectContaining({ page: 3 }))
    })
  })
})
