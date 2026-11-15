import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ref } from 'vue'
import { mount } from '@vue/test-utils'
import { useRouter } from 'vue-router'
import { useUserManage } from '../composables/useUserManage.js'
import AddUser from './AddUser.vue'

vi.mock('vue-router', () => ({
  useRouter: vi.fn()
}))

vi.mock('../composables/useUserManage.js', () => ({
  useUserManage: vi.fn()
}))

const currentYear = new Date().getFullYear()
const ADULT_BIRTHDATE = `${currentYear - 30}-06-15`
const MINOR_BIRTHDATE = `${currentYear - 10}-06-15`

function mountAddUser(overrides = {}) {
  const state = {
    creating: ref(false),
    createError: ref(null),
    createUser: vi.fn(),
    ...overrides
  }
  useUserManage.mockReturnValue(state)

  const pushMock = vi.fn()
  useRouter.mockReturnValue({ push: pushMock })

  const wrapper = mount(AddUser)
  return { wrapper, state, pushMock }
}

// Looks up the <input> associated with a <label> whose text starts with the
// given text, via the label's `for` attribute -- the same id/for convention
// CreateAssociate.vue (this form's ancestor) used for every field.
function labelInput(wrapper, labelStartsWith) {
  const label = wrapper
    .findAll('label')
    .find((l) => l.text().trim().toLowerCase().startsWith(labelStartsWith.toLowerCase()))
  if (!label) return undefined
  const forId = label.attributes('for')
  if (!forId) return undefined
  const input = wrapper.find(`#${forId}`)
  return input.exists() ? input : undefined
}

function submit(wrapper) {
  return wrapper.find('form').trigger('submit.prevent')
}

async function fillIdentityFields(wrapper, { birthDate = ADULT_BIRTHDATE } = {}) {
  await labelInput(wrapper, 'Name').setValue('Mario')
  await labelInput(wrapper, 'Last Name').setValue('Rossi')
  await labelInput(wrapper, 'Email').setValue('mario@example.com')
  await labelInput(wrapper, 'Fiscal Code').setValue('RSSMRA80A01H501Z')
  await labelInput(wrapper, 'Birth Date').setValue(birthDate)
  await labelInput(wrapper, 'Birth City').setValue('Milano')
  await labelInput(wrapper, 'Residence Address').setValue('Via Roma 1')
  await labelInput(wrapper, 'Residence City').setValue('Milano')
  await labelInput(wrapper, 'Residence CAP').setValue('20100')
  await labelInput(wrapper, 'Residence Province').setValue('MI')
  await labelInput(wrapper, 'Phone Number').setValue('3331234567')
  if (birthDate === ADULT_BIRTHDATE) {
    await labelInput(wrapper, 'Identity Card Number').setValue('CA12345AB')
  }
}

async function fillParentRelationFields(wrapper) {
  await labelInput(wrapper, 'Parent Name').setValue('Giulia')
  await labelInput(wrapper, 'Parent Last Name').setValue('Verdi')
  await labelInput(wrapper, 'Parent Birth Date').setValue('1980-05-05')
  await labelInput(wrapper, 'Parent Birth City').setValue('Roma')
  await labelInput(wrapper, 'Parent Fiscal Code').setValue('VRDGLI80E45H501Z')
  await labelInput(wrapper, 'Parent Identity Card Number').setValue('CB98765CD')
  await labelInput(wrapper, 'Parent Residence Address').setValue('Via Milano 2')
  await labelInput(wrapper, 'Parent Residence City').setValue('Roma')
  await labelInput(wrapper, 'Parent Residence CAP').setValue('00100')
  await labelInput(wrapper, 'Parent Residence Province').setValue('RM')
  await labelInput(wrapper, 'Parent Phone Number').setValue('3339998888')
  await labelInput(wrapper, 'Parent Email').setValue('giulia@example.com')
}

describe('AddUser.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders an input for each of the 13 identity fields', () => {
    const { wrapper } = mountAddUser()
    const labels = [
      'Name', 'Last Name', 'Email', 'Secondary Email', 'Fiscal Code', 'Birth Date', 'Birth City',
      'Identity Card Number', 'Residence Address', 'Residence City', 'Residence CAP',
      'Residence Province', 'Phone Number'
    ]

    labels.forEach((label) => {
      expect(labelInput(wrapper, label), `expected an input for "${label}"`).toBeTruthy()
    })
  })

  it('does not render a Validity Year section (the year no longer belongs on this form)', () => {
    const { wrapper } = mountAddUser()
    expect(wrapper.text().toLowerCase()).not.toContain('validity year')
  })

  it('does not render the Parent Relation section for an adult birth date', async () => {
    const { wrapper } = mountAddUser()
    await labelInput(wrapper, 'Birth Date').setValue(ADULT_BIRTHDATE)

    expect(wrapper.text()).not.toContain('Parent Relation')
  })

  it('renders the required Parent Relation section for a minor birth date', async () => {
    const { wrapper } = mountAddUser()
    await labelInput(wrapper, 'Birth Date').setValue(MINOR_BIRTHDATE)

    expect(wrapper.text()).toContain('Parent Relation')
  })

  it('blocks submission and shows required-field errors when mandatory fields are empty', async () => {
    const { wrapper, state } = mountAddUser()

    await submit(wrapper)

    expect(state.createUser).not.toHaveBeenCalled()
    expect(wrapper.findAll('.field-error, .input-error').length).toBeGreaterThan(0)
  })

  it('calls createUser with the 13 top-level identity fields for an adult -- no "associate" wrapper key, no validity year, no relations', async () => {
    const createUser = vi.fn().mockResolvedValue({ user: { id: 42 }, created: true })
    const { wrapper } = mountAddUser({ createUser })

    await fillIdentityFields(wrapper, { birthDate: ADULT_BIRTHDATE })
    await submit(wrapper)
    await wrapper.vm.$nextTick()

    expect(createUser).toHaveBeenCalledTimes(1)
    const payload = createUser.mock.calls[0][0]

    expect(payload).toMatchObject({
      name: 'Mario',
      lastName: 'Rossi',
      email: 'mario@example.com',
      fiscalCode: 'RSSMRA80A01H501Z',
      birthDate: ADULT_BIRTHDATE,
      birthCity: 'Milano',
      residenceAddress: 'Via Roma 1',
      residenceCity: 'Milano',
      residenceCAP: '20100',
      residenceProvince: 'MI',
      phoneNumber: '3331234567'
    })
    expect(payload.associate).toBeUndefined()
    expect(payload.validityYearStart).toBeUndefined()
    expect(payload.validityYearEnd).toBeUndefined()
    expect(payload.relations).toBeUndefined()
  })

  it('blocks submission for a minor until the parent relation required fields are filled', async () => {
    const { wrapper, state } = mountAddUser()

    await fillIdentityFields(wrapper, { birthDate: MINOR_BIRTHDATE })
    await submit(wrapper)

    expect(state.createUser).not.toHaveBeenCalled()
    expect(wrapper.text()).toContain('Parent Relation')
  })

  it('submits a relations array with a single parent entry for a minor once the parent fields are filled', async () => {
    const createUser = vi.fn().mockResolvedValue({ user: { id: 43 }, created: true })
    const { wrapper } = mountAddUser({ createUser })

    await fillIdentityFields(wrapper, { birthDate: MINOR_BIRTHDATE })
    await fillParentRelationFields(wrapper)
    await submit(wrapper)
    await wrapper.vm.$nextTick()

    expect(createUser).toHaveBeenCalledTimes(1)
    const payload = createUser.mock.calls[0][0]

    expect(payload.relations).toEqual([
      {
        user: expect.objectContaining({ name: 'Giulia', lastName: 'Verdi', fiscalCode: 'VRDGLI80E45H501Z' }),
        relationType: 'parent'
      }
    ])
  })

  it('no discount field exists anywhere on this form', () => {
    const { wrapper } = mountAddUser()
    expect(wrapper.text().toLowerCase()).not.toContain('discount')
  })

  it('on created === true, navigates straight to the new user\'s profile with no "already exists" message', async () => {
    const createUser = vi.fn().mockResolvedValue({ user: { id: 42 }, created: true })
    const { wrapper, pushMock } = mountAddUser({ createUser })

    await fillIdentityFields(wrapper)
    await submit(wrapper)
    await wrapper.vm.$nextTick()

    expect(pushMock).toHaveBeenCalledWith('/users/42')
    expect(wrapper.text().toLowerCase()).not.toContain('already exists')
  })

  it('on created === false, shows the explicit "already exists, no changes made" message and still navigates to that user\'s profile', async () => {
    const createUser = vi.fn().mockResolvedValue({ user: { id: 7 }, created: false })
    const { wrapper, pushMock } = mountAddUser({ createUser })

    await fillIdentityFields(wrapper)
    await submit(wrapper)
    await wrapper.vm.$nextTick()

    const text = wrapper.text().toLowerCase()
    expect(text).toContain('already exists')
    expect(text).toContain('no changes')
    expect(pushMock).toHaveBeenCalledWith('/users/7')
  })

  it('shows a specific on-screen error (actual message, no reference code) and does not navigate when createUser fails', async () => {
    const createUser = vi.fn().mockResolvedValue(null)
    const { wrapper, pushMock } = mountAddUser({
      createUser,
      createError: ref({ non_field_errors: ['A user under 18 requires at least one adult relation.'] })
    })

    await fillIdentityFields(wrapper)
    await submit(wrapper)
    await wrapper.vm.$nextTick()

    const errorBanner = wrapper.find('.error-message')
    expect(errorBanner.exists()).toBe(true)
    expect(errorBanner.text()).toContain('A user under 18 requires at least one adult relation.')
    expect(wrapper.text()).not.toMatch(/reference\s*(code|id|#)?[:\-]/i)
    expect(pushMock).not.toHaveBeenCalled()
  })

  it('renders a nested relation validation error as readable text, not "[object Object]"', async () => {
    const createUser = vi.fn().mockResolvedValue(null)
    const { wrapper } = mountAddUser({
      createUser,
      createError: ref({ relations: [{ user: { birthDate: ['This field is required.'] } }] })
    })

    await fillIdentityFields(wrapper)
    await submit(wrapper)
    await wrapper.vm.$nextTick()

    const errorBanner = wrapper.find('.error-message')
    expect(errorBanner.exists()).toBe(true)
    expect(errorBanner.text()).toContain('This field is required.')
    expect(errorBanner.text()).not.toContain('[object Object]')
  })

  it('navigates back to /users on cancel/back', async () => {
    const { wrapper, pushMock } = mountAddUser()
    const cancelBtn = wrapper.findAll('button').find((b) => /cancel|back/i.test(b.text()))
    expect(cancelBtn, 'expected a cancel/back button').toBeTruthy()

    await cancelBtn.trigger('click')

    expect(pushMock).toHaveBeenCalledWith('/users')
  })
})
