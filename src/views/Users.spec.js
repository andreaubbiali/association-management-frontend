import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ref } from 'vue'
import { mount } from '@vue/test-utils'
import { useRouter } from 'vue-router'
import { useUsers } from '../composables/useUsers.js'
import Users from './Users.vue'

vi.mock('vue-router', () => ({
  useRouter: vi.fn()
}))

vi.mock('../composables/useUsers.js', () => ({
  useUsers: vi.fn()
}))

const UsersFilteredTableStub = {
  name: 'UsersFilteredTable',
  template: '<div class="users-filtered-table-stub" />'
}

function mountUsers(overrides = {}) {
  const state = {
    users: ref([]),
    loading: ref(false),
    error: ref(null),
    totalCount: ref(0),
    filters: ref({ page: 1 }),
    fetchUsers: vi.fn(),
    clearError: vi.fn(),
    refreshUsers: vi.fn(),
    applyFilters: vi.fn(),
    changePage: vi.fn(),
    ...overrides
  }
  useUsers.mockReturnValue(state)

  const pushMock = vi.fn()
  useRouter.mockReturnValue({ push: pushMock })

  const wrapper = mount(Users, {
    global: { stubs: { UsersFilteredTable: UsersFilteredTableStub } }
  })

  return { wrapper, state, pushMock }
}

describe('Users.vue (associate-renewal: Add User entry point)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders a "+ Add User" button', () => {
    const { wrapper } = mountUsers()
    const addBtn = wrapper.findAll('button').find((b) => /add user/i.test(b.text()))

    expect(addBtn).toBeTruthy()
  })

  it('navigates to /users/create when the "+ Add User" button is clicked', async () => {
    const { wrapper, pushMock } = mountUsers()
    const addBtn = wrapper.findAll('button').find((b) => /add user/i.test(b.text()))

    await addBtn.trigger('click')

    expect(pushMock).toHaveBeenCalledWith('/users/create')
  })
})
