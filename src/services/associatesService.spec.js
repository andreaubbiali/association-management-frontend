import { describe, it, expect, vi, beforeEach } from 'vitest'
import api from './api.js'
import { associatesService } from './associatesService.js'

vi.mock('./api.js', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn()
  }
}))

describe('associatesService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // The edit-user-data feature moves all person-data editing (including
  // birthDate) onto UserDetail.vue / usersService.updateUser. This narrower
  // wrapper around PATCH /user/<id> must not survive alongside it.
  it('no longer exposes updateBirthDate (superseded by usersService.updateUser)', () => {
    expect(associatesService.updateBirthDate).toBeUndefined()
  })

  // associate-renewal: createAssociate is kept under the same method name,
  // but its payload/meaning changes completely -- it is now the minimal
  // "Associate for <year>" yearly-renewal call, not the old combined
  // identity+relations+year creation payload CreateAssociate.vue used to send.
  describe('createAssociate (associate-renewal: minimal yearly-renewal payload)', () => {
    it('calls POST /associate with only { userId, validityYearStart } -- no identity or relation fields', async () => {
      api.post.mockResolvedValue({
        data: { id: 5, validityYearStart: 2026, validityYearEnd: 2027, annualFeePaid: false }
      })

      await associatesService.createAssociate({ userId: 10, validityYearStart: 2026 })

      expect(api.post).toHaveBeenCalledWith('/associate', { userId: 10, validityYearStart: 2026 })
    })

    it('returns { id, validityYearStart, validityYearEnd, annualFeePaid } on success', async () => {
      const payload = { id: 5, validityYearStart: 2026, validityYearEnd: 2027, annualFeePaid: false }
      api.post.mockResolvedValue({ data: payload })

      const result = await associatesService.createAssociate({ userId: 10, validityYearStart: 2026 })

      expect(result).toEqual(payload)
    })

    it('rethrows a 409 (associate already exists for that user+year) without swallowing it', async () => {
      const apiError = { response: { status: 409, data: { error: 'An associate already exists for this year' } } }
      api.post.mockRejectedValue(apiError)

      await expect(
        associatesService.createAssociate({ userId: 10, validityYearStart: 2026 })
      ).rejects.toEqual(apiError)
    })

    it('rethrows a 400 (minor with no adult relation on file) without swallowing it', async () => {
      const apiError = { response: { status: 400, data: { error: 'User is a minor with no adult relation on file.' } } }
      api.post.mockRejectedValue(apiError)

      await expect(
        associatesService.createAssociate({ userId: 10, validityYearStart: 2026 })
      ).rejects.toEqual(apiError)
    })
  })
})
