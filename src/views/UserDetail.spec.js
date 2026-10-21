import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ref } from 'vue'
import { mount } from '@vue/test-utils'
import { useRoute, useRouter } from 'vue-router'
import { useUserManage } from '../composables/useUserManage.js'
import UserDetail from './UserDetail.vue'

vi.mock('vue-router', () => ({
  useRoute: vi.fn(),
  useRouter: vi.fn()
}))

vi.mock('../composables/useUserManage.js', () => ({
  useUserManage: vi.fn()
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
  secondaryEmail: 'mario.secondary@example.com',
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

const sampleRelations = [
  {
    id: 10,
    relationType: 'parent',
    isRelatedUserReceiptHolder: true,
    otherUser: { id: 2, bloomId: 'BLOOM_20252', name: 'Anna', lastName: 'Rossi' }
  },
  {
    id: 11,
    relationType: 'sibling',
    isRelatedUserReceiptHolder: false,
    otherUser: { id: 3, bloomId: 'BLOOM_20253', name: 'Luca', lastName: 'Rossi' }
  }
]

function mountUserDetail(overrides = {}) {
  const state = {
    user: ref(null),
    loading: ref(false),
    error: ref(null),
    relations: ref([]),
    relationsLoading: ref(false),
    relationsError: ref(null),
    fetchUser: vi.fn(),
    fetchUserRelations: vi.fn(),
    clearError: vi.fn(),
    clearRelationsError: vi.fn(),
    reset: vi.fn(),
    ...overrides
  }
  useUserManage.mockReturnValue(state)

  const pushMock = vi.fn()
  useRoute.mockReturnValue({ params: { id: '1' } })
  useRouter.mockReturnValue({ push: pushMock })

  const wrapper = mount(UserDetail, {
    global: {
      stubs: { RouterLink: RouterLinkStub, 'router-link': RouterLinkStub }
    }
  })

  return { wrapper, state, pushMock }
}

describe('UserDetail.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('calls fetchUser and fetchUserRelations with the route id on mount', () => {
    const { state } = mountUserDetail()

    expect(state.fetchUser).toHaveBeenCalledWith('1')
    expect(state.fetchUserRelations).toHaveBeenCalledWith('1')
  })

  it('shows a loading message for the user detail while loading is true', () => {
    const { wrapper } = mountUserDetail({ loading: ref(true) })

    expect(wrapper.text().toLowerCase()).toContain('loading')
  })

  it('shows a dismissible error banner with a retry button when the user-detail fetch fails', async () => {
    const { wrapper, state } = mountUserDetail({ error: ref('Failed to fetch user') })

    expect(wrapper.text()).toContain('Failed to fetch user')

    const buttons = wrapper.findAll('button')
    const retryBtn = buttons.find((b) => b.text().toLowerCase().includes('retry'))
    const dismissBtn = buttons.find((b) => b.text().toLowerCase().includes('dismiss'))

    expect(retryBtn).toBeTruthy()
    expect(dismissBtn).toBeTruthy()

    await retryBtn.trigger('click')
    expect(state.fetchUser).toHaveBeenCalled()

    await dismissBtn.trigger('click')
    expect(state.clearError).toHaveBeenCalled()
  })

  it('renders every field returned by the detail endpoint when the user is loaded', () => {
    const { wrapper } = mountUserDetail({ user: ref(fullUser) })
    const text = wrapper.text()

    expect(text).toContain('BLOOM_20251')
    expect(text).toContain('Mario')
    expect(text).toContain('Rossi')
    expect(text).toContain('mario@example.com')
    expect(text).toContain('mario.secondary@example.com')
    expect(text).toContain('RSSMRA80A01H501Z')
    expect(text).toContain('Milano')
    expect(text).toContain('CA12345AB')
    expect(text).toContain('Via Roma 1')
    expect(text).toContain('20100')
    expect(text).toContain('MI')
    expect(text).toContain('3331234567')
  })

  it('does not render the raw ISO birthDate string (it is formatted)', () => {
    const { wrapper } = mountUserDetail({ user: ref(fullUser) })

    expect(wrapper.text()).not.toContain('1980-01-01')
  })

  it('renders no edit/update controls for any user field (read-only page)', () => {
    const { wrapper } = mountUserDetail({ user: ref(fullUser) })

    const buttons = wrapper.findAll('button').map((b) => b.text().toLowerCase())
    expect(buttons.some((text) => text.includes('update'))).toBe(false)
    expect(buttons.some((text) => text.includes('edit'))).toBe(false)
  })

  it('shows a relations loading message independent from the user-detail loading state', () => {
    const { wrapper } = mountUserDetail({
      user: ref(fullUser),
      loading: ref(false),
      relationsLoading: ref(true)
    })

    expect(wrapper.text().toLowerCase()).toContain('loading')
  })

  it('shows a dismissible relations error banner with its own retry, independent of the user-detail error', async () => {
    const { wrapper, state } = mountUserDetail({
      user: ref(fullUser),
      error: ref(null),
      relationsError: ref('Failed to fetch relations')
    })

    expect(wrapper.text()).toContain('Failed to fetch relations')
    // The user data must still be shown even though relations failed.
    expect(wrapper.text()).toContain('Mario')

    const buttons = wrapper.findAll('button')
    const retryBtn = buttons.find((b) => b.text().toLowerCase().includes('retry'))
    await retryBtn.trigger('click')
    expect(state.fetchUserRelations).toHaveBeenCalled()

    const dismissBtn = buttons.find((b) => b.text().toLowerCase().includes('dismiss'))
    await dismissBtn.trigger('click')
    expect(state.clearRelationsError).toHaveBeenCalled()
  })

  it('shows a "No relations found" empty state when relations is an empty array', () => {
    const { wrapper } = mountUserDetail({ user: ref(fullUser), relations: ref([]) })

    expect(wrapper.text()).toContain('No relations found')
  })

  it('renders one entry per relation with relation type and the other user data', () => {
    const { wrapper } = mountUserDetail({ user: ref(fullUser), relations: ref(sampleRelations) })
    const text = wrapper.text()

    expect(text).toContain('parent')
    expect(text).toContain('sibling')
    expect(text).toContain('Anna')
    expect(text).toContain('Luca')
  })

  it('renders each relation entry\'s other-user data as a router-link to that user\'s own detail page', () => {
    const { wrapper } = mountUserDetail({ user: ref(fullUser), relations: ref(sampleRelations) })

    const links = wrapper.findAllComponents(RouterLinkStub)
    const hrefs = links.map((l) => (typeof l.props('to') === 'string' ? l.props('to') : l.props('to').path))

    expect(hrefs).toContain('/users/2')
    expect(hrefs).toContain('/users/3')
  })

  it('navigates back to /users when the back button is clicked', async () => {
    const { wrapper, pushMock } = mountUserDetail({ user: ref(fullUser) })

    const backBtn = wrapper.findAll('button').find((b) => b.text().toLowerCase().includes('back'))
    expect(backBtn).toBeTruthy()

    await backBtn.trigger('click')
    expect(pushMock).toHaveBeenCalledWith('/users')
  })
})
