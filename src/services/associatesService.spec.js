import { describe, it, expect } from 'vitest'
import { associatesService } from './associatesService.js'

describe('associatesService', () => {
  // The edit-user-data feature moves all person-data editing (including
  // birthDate) onto UserDetail.vue / usersService.updateUser. This narrower
  // wrapper around PATCH /user/<id> must not survive alongside it.
  it('no longer exposes updateBirthDate (superseded by usersService.updateUser)', () => {
    expect(associatesService.updateBirthDate).toBeUndefined()
  })
})
