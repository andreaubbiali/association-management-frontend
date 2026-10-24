import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ref } from 'vue'
import { mount } from '@vue/test-utils'
import { useRoute, useRouter } from 'vue-router'
import { useAssociateManage } from '../composables/useAssociateManage.js'
import AssociateManage from './AssociateManage.vue'

vi.mock('vue-router', () => ({
  useRoute: vi.fn(),
  useRouter: vi.fn()
}))

vi.mock('../composables/useAssociateManage.js', () => ({
  useAssociateManage: vi.fn()
}))

const sampleAssociate = {
  id: 7,
  annualFeePaid: true,
  privacyModuleDelivered: true,
  photoVideoAuthorized: true,
  medicalCertificateDelivered: true,
  sportMaterialModuleDelivered: true,
  validityYearStart: 2025,
  validityYearEnd: 2026,
  discount: null,
  courses: [],
  user: {
    id: 1,
    bloomId: 'BLOOM_20251',
    name: 'Mario',
    lastName: 'Rossi',
    email: 'mario@example.com',
    secondaryEmail: '',
    phoneNumber: '3331234567',
    fiscalCode: 'RSSMRA80A01H501Z',
    birthDate: '1980-01-01',
    birthCity: 'Milano'
  }
}

function mountAssociateManage(overrides = {}) {
  const state = {
    associate: ref(sampleAssociate),
    loading: ref(false),
    error: ref(null),
    fetchAssociate: vi.fn(),
    clearError: vi.fn(),
    reset: vi.fn(),
    ...overrides
  }
  useAssociateManage.mockReturnValue(state)

  const pushMock = vi.fn()
  useRoute.mockReturnValue({ params: { id: '7' } })
  useRouter.mockReturnValue({ push: pushMock })

  const wrapper = mount(AssociateManage)

  return { wrapper, state, pushMock }
}

describe('AssociateManage.vue - birthDate editing removal (edit-user-data feature)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders no "Update" trigger button next to the Birth Date info item', () => {
    const { wrapper } = mountAssociateManage()

    const birthDateItem = wrapper.findAll('.info-item').find((item) => item.find('label').text().trim() === 'Birth Date:')
    expect(birthDateItem).toBeTruthy()
    expect(birthDateItem.find('button').exists()).toBe(false)
    expect(birthDateItem.text()).toContain('January 1, 1980')
  })

  it('renders no button titled "Update birth date" anywhere on the page', () => {
    const { wrapper } = mountAssociateManage()

    const buttons = wrapper.findAll('button')
    const updateBirthDateBtn = buttons.find((b) => b.attributes('title') === 'Update birth date')
    expect(updateBirthDateBtn).toBeUndefined()
  })

  it('never renders the "Update Birth Date" modal, even though its backing refs no longer exist', () => {
    const { wrapper } = mountAssociateManage()

    expect(wrapper.html()).not.toContain('Update Birth Date')
    expect(wrapper.find('#newBirthDate').exists()).toBe(false)
  })

  it('renders the Birth Date info item as a plain read-only span, matching every other read-only field in the card', () => {
    const { wrapper } = mountAssociateManage()

    const birthDateItem = wrapper.findAll('.info-item').find((item) => item.find('label').text().trim() === 'Birth Date:')
    const lastNameItem = wrapper.findAll('.info-item').find((item) => item.find('label').text().trim() === 'Last Name:')

    // Same shape as an untouched read-only field: a single <span>, no wrapping
    // "fee-status-container" div that used to also host the Update button.
    expect(birthDateItem.find('.fee-status-container').exists()).toBe(false)
    expect(birthDateItem.find('span').exists()).toBe(true)
    expect(lastNameItem.find('span').exists()).toBe(true)
  })
})

describe('AssociateManage.vue - unaffected areas still work (no regression)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('still renders the associate detail card and fee status when loaded', () => {
    const { wrapper } = mountAssociateManage()

    expect(wrapper.text()).toContain('Mario')
    expect(wrapper.text()).toContain('Rossi')
    expect(wrapper.text()).toContain('RSSMRA80A01H501Z')
  })

  it('still navigates back to /associates when the back button is clicked', async () => {
    const { wrapper, pushMock } = mountAssociateManage()

    const backBtn = wrapper.findAll('button').find((b) => b.text().toLowerCase().includes('back'))
    await backBtn.trigger('click')

    expect(pushMock).toHaveBeenCalledWith('/associates')
  })
})
