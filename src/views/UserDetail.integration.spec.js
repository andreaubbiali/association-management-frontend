import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { useRoute, useRouter } from 'vue-router'
import { usersService } from '../services/usersService.js'
import { associatesService } from '../services/associatesService.js'
import UserDetail from './UserDetail.vue'

// Deliberately NOT mocking useUserManage.js here -- this file exercises the
// real composable wired to UserDetail.vue, with only the network boundary
// (the two services) mocked. This is what catches a regression where
// createAssociateForUser's "prepend to associateHistory" behavior is tested
// in isolation at the composable level (useUserManage.spec.js) but the view
// doesn't actually forward/re-render from the same reactive state.
vi.mock('vue-router', () => ({
  useRoute: vi.fn(),
  useRouter: vi.fn()
}))

vi.mock('../services/usersService.js', () => ({
  usersService: {
    getUser: vi.fn(),
    getUserRelations: vi.fn(),
    updateUser: vi.fn(),
    createUser: vi.fn(),
    getAssociateHistory: vi.fn()
  }
}))

vi.mock('../services/associatesService.js', () => ({
  associatesService: {
    createAssociate: vi.fn()
  }
}))

const RouterLinkStub = {
  name: 'RouterLink',
  props: ['to'],
  template: '<a :href="typeof to === \'string\' ? to : to.path"><slot /></a>'
}

const fullUser = {
  id: 1,
  bloomId: 'BLOOM_20251',
  name: 'Mario',
  lastName: 'Rossi',
  email: 'mario@example.com',
  secondaryEmail: '',
  fiscalCode: 'RSSMRA80A01H501Z',
  birthDate: '1980-01-01',
  birthCity: 'Milano',
  identityCardNumber: 'CA12345AB',
  residenceAddress: 'Via Roma 1',
  residenceCity: 'Milano',
  residenceCAP: '20100',
  residenceProvince: 'MI',
  phoneNumber: '3331234567',
  dataValidated: true
}

function mountUserDetail() {
  const pushMock = vi.fn()
  useRoute.mockReturnValue({ params: { id: '1' } })
  useRouter.mockReturnValue({ push: pushMock })

  const wrapper = mount(UserDetail, {
    global: {
      stubs: { RouterLink: RouterLinkStub, 'router-link': RouterLinkStub }
    }
  })

  return { wrapper, pushMock }
}

describe('UserDetail.vue + useUserManage integration (real composable, mocked services)', () => {
  const currentYear = new Date().getFullYear()

  beforeEach(() => {
    vi.clearAllMocks()
    usersService.getUser.mockResolvedValue(fullUser)
    usersService.getUserRelations.mockResolvedValue([])
    usersService.getAssociateHistory.mockResolvedValue({ count: 0, next: null, previous: null, results: [] })
  })

  it('reflects a newly-created associate immediately in both the Yes/No indicator and the History modal, with no refetch', async () => {
    const newRow = { id: 99, validityYearStart: currentYear, validityYearEnd: currentYear + 1, annualFeePaid: false }
    associatesService.createAssociate.mockResolvedValue(newRow)

    const { wrapper } = mountUserDetail()
    await flushPromises()

    // Before creating: not associated for the current year yet.
    expect(wrapper.text()).toMatch(new RegExp(`Associated for ${currentYear}:\\s*No`, 'i'))

    const cta = wrapper.findAll('button').find((b) => new RegExp(`associate for ${currentYear}`, 'i').test(b.text()))
    expect(cta, 'expected an "Associate for <year>" button').toBeTruthy()
    await cta.trigger('click')
    await flushPromises()

    expect(associatesService.createAssociate).toHaveBeenCalledWith({ userId: '1', validityYearStart: currentYear })

    // The indicator flips to Yes and the CTA becomes disabled, purely from the
    // mutated associateHistory state -- no second fetch happened.
    expect(wrapper.text()).toMatch(new RegExp(`Associated for ${currentYear}:\\s*Yes`, 'i'))
    expect(usersService.getAssociateHistory).toHaveBeenCalledTimes(1)

    const ctaAfter = wrapper.findAll('button').find((b) => new RegExp(`associate for ${currentYear}`, 'i').test(b.text()))
    expect(ctaAfter.attributes('disabled')).not.toBeUndefined()

    // Opening the History modal (fed from the same associateHistory state)
    // shows the newly-created row without any additional fetch.
    const historyBtn = wrapper.findAll('button').find((b) => /view association history/i.test(b.text()))
    await historyBtn.trigger('click')
    await flushPromises()

    expect(wrapper.text()).toContain(`${currentYear}/${currentYear + 1}`)
    expect(usersService.getAssociateHistory).toHaveBeenCalledTimes(1)
  })
})
