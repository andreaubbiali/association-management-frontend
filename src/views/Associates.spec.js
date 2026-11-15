import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ref } from 'vue'
import { mount } from '@vue/test-utils'
import { useRoute, useRouter } from 'vue-router'
import { useAssociates } from '../composables/useAssociates.js'
import Associates from './Associates.vue'

vi.mock('vue-router', () => ({
  useRoute: vi.fn(),
  useRouter: vi.fn()
}))

vi.mock('../composables/useAssociates.js', () => ({
  useAssociates: vi.fn()
}))

const AssociatesFilteredTableStub = {
  name: 'AssociatesFilteredTable',
  template: '<div class="associates-filtered-table-stub" />'
}

function mountAssociates({ query = {} } = {}, overrides = {}) {
  const state = {
    associates: ref([]),
    loading: ref(false),
    error: ref(null),
    totalCount: ref(0),
    filters: ref({ page: 1 }),
    fetchAssociates: vi.fn(),
    deleteAssociate: vi.fn(),
    clearError: vi.fn(),
    refreshAssociates: vi.fn(),
    applyFilters: vi.fn(),
    changePage: vi.fn(),
    ...overrides
  }
  useAssociates.mockReturnValue(state)

  const pushMock = vi.fn()
  const replaceMock = vi.fn()
  useRoute.mockReturnValue({ query })
  useRouter.mockReturnValue({ push: pushMock, replace: replaceMock })

  const wrapper = mount(Associates, {
    global: { stubs: { AssociatesFilteredTable: AssociatesFilteredTableStub } }
  })

  return { wrapper, state, pushMock, replaceMock }
}

describe('Associates.vue (associate-renewal: Create Associate flow removed)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('no longer renders a "+ New Associate" button', () => {
    const { wrapper } = mountAssociates()
    const createBtn = wrapper.findAll('button').find((b) => /new associate/i.test(b.text()))

    expect(createBtn).toBeUndefined()
  })

  it('never navigates to the removed /associates/create route', () => {
    const { wrapper, pushMock } = mountAssociates()

    expect(wrapper.html()).not.toContain('associates/create')
    expect(pushMock).not.toHaveBeenCalledWith('/associates/create')
  })

  it('no longer shows the old create-success banner, even when landing with ?created=1, and does not strip the query param for it', () => {
    const { wrapper, replaceMock } = mountAssociates({ query: { created: '1' } })

    expect(wrapper.text().toLowerCase()).not.toContain('associate created successfully')
    expect(replaceMock).not.toHaveBeenCalled()
  })

  it('still fetches and renders the associates table, untouched by this feature', () => {
    const { wrapper, state } = mountAssociates()

    expect(state.fetchAssociates).toHaveBeenCalled()
    expect(wrapper.findComponent(AssociatesFilteredTableStub).exists()).toBe(true)
  })
})
