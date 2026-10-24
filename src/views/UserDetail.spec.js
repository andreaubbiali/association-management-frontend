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
    updating: ref(false),
    updateError: ref(null),
    fetchUser: vi.fn(),
    fetchUserRelations: vi.fn(),
    clearError: vi.fn(),
    clearRelationsError: vi.fn(),
    updateUser: vi.fn(),
    clearUpdateError: vi.fn(),
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

  it('shows exactly one whole-card "Edit" button for the User Information card, not one per field', () => {
    const { wrapper } = mountUserDetail({ user: ref(fullUser) })

    const editButtons = wrapper.findAll('button').filter((b) => b.text().trim().toLowerCase() === 'edit')
    expect(editButtons.length).toBe(1)
  })

  it('renders no input controls while not in edit mode', () => {
    const { wrapper } = mountUserDetail({ user: ref(fullUser) })

    expect(wrapper.find('.details-card').findAll('input').length).toBe(0)
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

// The 13 fields the edit-user-data feature makes editable, mapped to the
// exact label text each one is rendered under in the "User Information" card.
const EDITABLE_FIELDS = [
  ['Name:', 'name'],
  ['Last Name:', 'lastName'],
  ['Email:', 'email'],
  ['Secondary Email:', 'secondaryEmail'],
  ['Fiscal Code:', 'fiscalCode'],
  ['Birth Date:', 'birthDate'],
  ['Birth City:', 'birthCity'],
  ['Identity Card Number:', 'identityCardNumber'],
  ['Residence Address:', 'residenceAddress'],
  ['Residence City:', 'residenceCity'],
  ['Residence CAP:', 'residenceCAP'],
  ['Residence Province:', 'residenceProvince'],
  ['Phone Number:', 'phoneNumber']
]

function getInfoItem(wrapper, labelText) {
  return wrapper.findAll('.info-item').find((item) => item.find('label').text().trim() === labelText)
}

function getFieldInput(wrapper, labelText) {
  const item = getInfoItem(wrapper, labelText)
  return item ? item.find('input') : undefined
}

async function clickEdit(wrapper) {
  const editBtn = wrapper.findAll('button').find((b) => b.text().trim().toLowerCase() === 'edit')
  await editBtn.trigger('click')
}

function findButtonByText(wrapper, text) {
  return wrapper.findAll('button').find((b) => b.text().trim().toLowerCase() === text.toLowerCase())
}

describe('UserDetail.vue - User Information edit mode', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('switches the card into edit mode with an input per editable field, seeded from the current user values, when Edit is clicked', async () => {
    const { wrapper } = mountUserDetail({ user: ref(fullUser) })

    await clickEdit(wrapper)

    for (const [label, key] of EDITABLE_FIELDS) {
      const input = getFieldInput(wrapper, label)
      expect(input, `expected an <input> for "${label}"`).toBeTruthy()
      expect(input.element.value).toBe(String(fullUser[key]))
    }
  })

  it('never renders an input for Bloom Id or Data Validated, even in edit mode', async () => {
    const { wrapper } = mountUserDetail({ user: ref(fullUser) })

    await clickEdit(wrapper)

    const bloomIdItem = getInfoItem(wrapper, 'Bloom Id:')
    const dataValidatedItem = getInfoItem(wrapper, 'Data Validated:')

    expect(bloomIdItem.find('input').exists()).toBe(false)
    expect(bloomIdItem.text()).toContain('BLOOM_20251')

    expect(dataValidatedItem.find('input').exists()).toBe(false)
  })

  it('renders exactly 13 inputs in the User Information card while editing (no stray input for id/bloomId/dataValidated)', async () => {
    const { wrapper } = mountUserDetail({ user: ref(fullUser) })

    await clickEdit(wrapper)

    expect(wrapper.find('.details-card').findAll('input').length).toBe(13)
  })

  it('calls updateUser with the user id and the full edited form, then exits edit mode and re-renders the new value on success', async () => {
    const updatedUser = { ...fullUser, name: 'Luigi' }
    const updateUser = vi.fn().mockImplementation(async () => {
      state.user.value = updatedUser
      return true
    })
    const { wrapper, state } = mountUserDetail({ user: ref(fullUser), updateUser })

    await clickEdit(wrapper)
    const nameInput = getFieldInput(wrapper, 'Name:')
    await nameInput.setValue('Luigi')

    const saveBtn = findButtonByText(wrapper, 'Save')
    expect(saveBtn, 'expected a Save button while editing').toBeTruthy()
    await saveBtn.trigger('click')
    await wrapper.vm.$nextTick()

    expect(updateUser).toHaveBeenCalledTimes(1)
    const [calledId, calledData] = updateUser.mock.calls[0]
    expect(String(calledId)).toBe('1')
    expect(calledData).toMatchObject({
      name: 'Luigi',
      lastName: fullUser.lastName,
      email: fullUser.email,
      fiscalCode: fullUser.fiscalCode,
      phoneNumber: fullUser.phoneNumber
    })

    // Edit mode is exited and the card shows the freshly-saved value, no refetch required.
    expect(wrapper.find('.details-card').findAll('input').length).toBe(0)
    expect(wrapper.text()).toContain('Luigi')
  })

  it('does not call fetchUser again after a successful save (re-renders directly from the mutation result)', async () => {
    const updateUser = vi.fn().mockImplementation(async () => {
      state.user.value = { ...fullUser }
      return true
    })
    const { wrapper, state } = mountUserDetail({ user: ref(fullUser), updateUser })

    await clickEdit(wrapper)
    await findButtonByText(wrapper, 'Save').trigger('click')
    await wrapper.vm.$nextTick()

    expect(state.fetchUser).toHaveBeenCalledTimes(1) // only the initial on-mount fetch
  })

  it('stays in edit mode, keeps the in-progress edits, and shows a field-level error near the relevant input when the save fails', async () => {
    const updateUserState = ref(null)
    const updateUser = vi.fn().mockImplementation(async () => {
      updateUserState.value = { fiscalCode: ['A user with this fiscal code already exists.'] }
      return false
    })
    const { wrapper } = mountUserDetail({
      user: ref(fullUser),
      updateUser,
      updateError: updateUserState
    })

    await clickEdit(wrapper)
    const fiscalCodeInput = getFieldInput(wrapper, 'Fiscal Code:')
    await fiscalCodeInput.setValue('DUPLICATE123')

    await findButtonByText(wrapper, 'Save').trigger('click')
    await wrapper.vm.$nextTick()

    // Still editing: the input keeps what the user typed, it isn't discarded.
    expect(wrapper.find('.details-card').findAll('input').length).toBeGreaterThan(0)
    expect(getFieldInput(wrapper, 'Fiscal Code:').element.value).toBe('DUPLICATE123')

    const fiscalCodeItem = getInfoItem(wrapper, 'Fiscal Code:')
    const fieldError = fiscalCodeItem.find('.field-error')
    expect(fieldError.exists()).toBe(true)
    expect(fieldError.text()).toContain('already exists')
  })

  it('shows a field-level error near Identity Card Number too when the backend rejects a duplicate identityCardNumber', async () => {
    const updateErrorState = ref(null)
    const updateUser = vi.fn().mockImplementation(async () => {
      updateErrorState.value = { identityCardNumber: ['A user with this identity card number already exists.'] }
      return false
    })
    const { wrapper } = mountUserDetail({
      user: ref(fullUser),
      updateUser,
      updateError: updateErrorState
    })

    await clickEdit(wrapper)
    await getFieldInput(wrapper, 'Identity Card Number:').setValue('DUPLICATECARD')
    await findButtonByText(wrapper, 'Save').trigger('click')
    await wrapper.vm.$nextTick()

    const idCardItem = getInfoItem(wrapper, 'Identity Card Number:')
    const fieldError = idCardItem.find('.field-error')
    expect(fieldError.exists()).toBe(true)
    expect(fieldError.text()).toContain('already exists')
  })

  it('does not corrupt the displayed user data on a failed save: cancelling after a failed save restores the last-known-good value', async () => {
    const updateErrorRef = ref(null)
    const updateUser = vi.fn().mockImplementation(async () => {
      updateErrorRef.value = { fiscalCode: ['A user with this fiscal code already exists.'] }
      return false
    })
    const { wrapper, state } = mountUserDetail({
      user: ref(fullUser),
      updateUser,
      updateError: updateErrorRef
    })

    await clickEdit(wrapper)
    await getFieldInput(wrapper, 'Fiscal Code:').setValue('DUPLICATE123')
    await findButtonByText(wrapper, 'Save').trigger('click')
    await wrapper.vm.$nextTick()

    // user was never mutated by the failed save.
    expect(state.user.value.fiscalCode).toBe(fullUser.fiscalCode)

    const cancelBtn = findButtonByText(wrapper, 'Cancel')
    expect(cancelBtn, 'expected a Cancel button while editing').toBeTruthy()
    await cancelBtn.trigger('click')

    expect(wrapper.find('.details-card').findAll('input').length).toBe(0)
    expect(wrapper.text()).toContain(fullUser.fiscalCode)
    expect(wrapper.text()).not.toContain('DUPLICATE123')
    expect(state.clearUpdateError).toHaveBeenCalled()
  })

  it('Cancel discards in-progress edits without calling updateUser and restores display mode', async () => {
    const { wrapper, state } = mountUserDetail({ user: ref(fullUser) })

    await clickEdit(wrapper)
    await getFieldInput(wrapper, 'Name:').setValue('Someone Else')
    await findButtonByText(wrapper, 'Cancel').trigger('click')

    expect(state.updateUser).not.toHaveBeenCalled()
    expect(wrapper.find('.details-card').findAll('input').length).toBe(0)
    expect(wrapper.text()).toContain('Mario')
    expect(wrapper.text()).not.toContain('Someone Else')
  })

  it('renders a non_field_errors conflict message as a banner using the existing .error-message convention', async () => {
    const { wrapper } = mountUserDetail({
      user: ref(fullUser),
      updateError: ref({ non_field_errors: ['Conflict: the record was modified concurrently.'] })
    })

    await clickEdit(wrapper)

    const banner = wrapper.findAll('.error-message').find((el) => el.text().includes('Conflict'))
    expect(banner).toBeTruthy()
  })

  it('disables the Save button while updating is true', async () => {
    const { wrapper } = mountUserDetail({ user: ref(fullUser), updating: ref(true) })

    await clickEdit(wrapper)
    const saveBtn = findButtonByText(wrapper, 'Save')

    expect(saveBtn).toBeTruthy()
    expect(saveBtn.attributes('disabled')).not.toBeUndefined()
  })
})
