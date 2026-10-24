import { describe, it, expect, vi, beforeEach } from 'vitest'
import api from './api.js'
import { usersService } from './usersService.js'

vi.mock('./api.js', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn()
  }
}))

describe('usersService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('searchUsers', () => {
    it('calls GET /user/search with no query params when no filters are provided', async () => {
      api.get.mockResolvedValue({ data: { results: [], count: 0 } })

      await usersService.searchUsers()

      expect(api.get).toHaveBeenCalledTimes(1)
      const calledUrl = api.get.mock.calls[0][0]
      expect(calledUrl).toBe('/user/search?')
    })

    it('builds the query string from name, email, bloomId, page and limit filters', async () => {
      api.get.mockResolvedValue({ data: { results: [], count: 0 } })

      await usersService.searchUsers({
        name: 'Mario',
        email: 'mario@example.com',
        bloomId: 'BLOOM_20251',
        page: 2,
        limit: 5
      })

      expect(api.get).toHaveBeenCalledTimes(1)
      const calledUrl = api.get.mock.calls[0][0]
      expect(calledUrl.startsWith('/user/search?')).toBe(true)

      const queryString = calledUrl.split('?')[1]
      const params = new URLSearchParams(queryString)
      expect(params.get('name')).toBe('Mario')
      expect(params.get('email')).toBe('mario@example.com')
      expect(params.get('bloomId')).toBe('BLOOM_20251')
      expect(params.get('page')).toBe('2')
      expect(params.get('limit')).toBe('5')
    })

    it('omits empty-string, null and undefined filter values from the query string', async () => {
      api.get.mockResolvedValue({ data: { results: [], count: 0 } })

      await usersService.searchUsers({
        name: '',
        email: null,
        bloomId: undefined,
        page: 1,
        limit: 5
      })

      const calledUrl = api.get.mock.calls[0][0]
      const params = new URLSearchParams(calledUrl.split('?')[1])
      expect(params.has('name')).toBe(false)
      expect(params.has('email')).toBe(false)
      expect(params.has('bloomId')).toBe(false)
      expect(params.get('page')).toBe('1')
      expect(params.get('limit')).toBe('5')
    })

    it('returns response.data on success', async () => {
      const payload = { results: [{ id: 1, bloomId: 'BLOOM_20251' }], count: 1 }
      api.get.mockResolvedValue({ data: payload })

      const result = await usersService.searchUsers({ name: 'Mario' })

      expect(result).toEqual(payload)
    })

    it('rethrows the error when the request fails', async () => {
      const apiError = new Error('Network error')
      api.get.mockRejectedValue(apiError)

      await expect(usersService.searchUsers({ name: 'Mario' })).rejects.toThrow('Network error')
    })
  })

  describe('getUser', () => {
    it('calls GET /user/:id with the given id', async () => {
      api.get.mockResolvedValue({ data: { id: 1, bloomId: 'BLOOM_20251' } })

      await usersService.getUser(1)

      expect(api.get).toHaveBeenCalledWith('/user/1')
    })

    it('returns response.data on success', async () => {
      const payload = { id: 1, bloomId: 'BLOOM_20251', name: 'Mario', lastName: 'Rossi' }
      api.get.mockResolvedValue({ data: payload })

      const result = await usersService.getUser(1)

      expect(result).toEqual(payload)
    })

    it('rethrows the error when the request fails', async () => {
      const apiError = new Error('Not found')
      api.get.mockRejectedValue(apiError)

      await expect(usersService.getUser(999)).rejects.toThrow('Not found')
    })
  })

  describe('updateUser', () => {
    it('calls PATCH /user/:id with the given id and data payload', async () => {
      const payload = { name: 'Mario', lastName: 'Rossi' }
      api.patch.mockResolvedValue({ data: { id: 1, ...payload } })

      await usersService.updateUser(1, payload)

      expect(api.patch).toHaveBeenCalledWith('/user/1', payload)
    })

    it('returns response.data (the full updated user) on success', async () => {
      const payload = { id: 1, bloomId: 'BLOOM_20251', name: 'Mario', lastName: 'Rossi', fiscalCode: 'RSSMRA80A01H501Z' }
      api.patch.mockResolvedValue({ data: payload })

      const result = await usersService.updateUser(1, { name: 'Mario' })

      expect(result).toEqual(payload)
    })

    it('rethrows the error when the request fails (e.g. duplicate fiscalCode 400)', async () => {
      const apiError = {
        response: { status: 400, data: { fiscalCode: ['A user with this fiscal code already exists.'] } }
      }
      api.patch.mockRejectedValue(apiError)

      await expect(usersService.updateUser(1, { fiscalCode: 'RSSMRA80A01H501Z' })).rejects.toEqual(apiError)
    })
  })

  describe('getUserRelations', () => {
    it('calls GET /user/:id/relations with the given id', async () => {
      api.get.mockResolvedValue({ data: [] })

      await usersService.getUserRelations(1)

      expect(api.get).toHaveBeenCalledWith('/user/1/relations')
    })

    it('returns response.data (a flat array) on success', async () => {
      const payload = [
        {
          id: 10,
          relationType: 'parent',
          isRelatedUserReceiptHolder: true,
          otherUser: { id: 2, bloomId: 'BLOOM_20252', name: 'Anna', lastName: 'Rossi' }
        }
      ]
      api.get.mockResolvedValue({ data: payload })

      const result = await usersService.getUserRelations(1)

      expect(result).toEqual(payload)
    })

    it('rethrows the error when the request fails', async () => {
      const apiError = new Error('Server error')
      api.get.mockRejectedValue(apiError)

      await expect(usersService.getUserRelations(1)).rejects.toThrow('Server error')
    })
  })
})
