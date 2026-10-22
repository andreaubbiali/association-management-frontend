import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import UsersFilteredTable from './UsersFilteredTable.vue'

const sampleUsers = [
  {
    id: 1,
    bloomId: 'BLOOM_20251',
    name: 'Mario',
    lastName: 'Rossi',
    email: 'mario@example.com',
    fiscalCode: 'RSSMRA80A01H501Z',
    birthDate: '1980-01-01',
    phoneNumber: '3331234567'
  },
  {
    id: 2,
    bloomId: 'BLOOM_20252',
    name: 'Anna',
    lastName: 'Bianchi',
    email: 'anna@example.com',
    fiscalCode: 'BNCANN85A41H501Z',
    birthDate: '1985-01-01',
    phoneNumber: '3339876543'
  }
]

function mountTable(props = {}) {
  return mount(UsersFilteredTable, {
    props: {
      users: sampleUsers,
      itemsPerPage: 5,
      totalCount: sampleUsers.length,
      currentPage: 1,
      ...props
    }
  })
}

describe('UsersFilteredTable.vue', () => {
  it('renders one table row per user with the resolved main-data columns', () => {
    const wrapper = mountTable()

    const rows = wrapper.findAll('tbody tr')
    expect(rows).toHaveLength(2)

    const firstRowText = rows[0].text()
    expect(firstRowText).toContain('BLOOM_20251')
    expect(firstRowText).toContain('Mario')
    expect(firstRowText).toContain('Rossi')
    expect(firstRowText).toContain('mario@example.com')
    expect(firstRowText).toContain('RSSMRA80A01H501Z')
    expect(firstRowText).toContain('3331234567')
  })

  it('renders table headers for bloomId, name, lastName, email, fiscalCode, birthDate, phoneNumber and Actions', () => {
    const wrapper = mountTable()
    const headerText = wrapper.findAll('thead th').map((th) => th.text().trim()).join(' | ').toLowerCase()

    expect(headerText).toContain('bloom')
    expect(headerText).toContain('name')
    expect(headerText).toContain('last name')
    expect(headerText).toContain('email')
    expect(headerText).toContain('fiscal code')
    expect(headerText).toContain('birth date')
    expect(headerText).toContain('phone')
    expect(headerText).toContain('action')
  })

  it('formats birthDate rather than rendering the raw ISO string', () => {
    const wrapper = mountTable()
    const firstRowText = wrapper.findAll('tbody tr')[0].text()

    expect(firstRowText).not.toContain('1980-01-01')
  })

  it('renders a "View" action button, not "Manage", since the page is read-only', () => {
    const wrapper = mountTable()
    const firstRowActionBtn = wrapper.findAll('tbody tr')[0].find('button')

    expect(firstRowActionBtn.text()).toBe('View')
  })

  it('emits view-user with the row user object when the View button is clicked', async () => {
    const wrapper = mountTable()
    const firstRowActionBtn = wrapper.findAll('tbody tr')[0].find('button')

    await firstRowActionBtn.trigger('click')

    expect(wrapper.emitted('view-user')).toBeTruthy()
    expect(wrapper.emitted('view-user')[0]).toEqual([sampleUsers[0]])
  })

  it('renders an empty state when there are no users', () => {
    const wrapper = mountTable({ users: [], totalCount: 0 })

    expect(wrapper.text()).toContain('No users found')
  })

  it('shows a results count line', () => {
    const wrapper = mountTable({ totalCount: 12 })

    expect(wrapper.text()).toMatch(/12/)
  })

  it('emits apply-filters with name, email and bloomId values when Search is clicked', async () => {
    const wrapper = mountTable()

    const nameInput = wrapper.find('input[id*="name" i]')
    const emailInput = wrapper.find('input[id*="email" i]')
    const bloomIdInput = wrapper.find('input[id*="bloomId" i], input[id*="bloom" i]')

    await nameInput.setValue('Mario')
    await emailInput.setValue('mario@example.com')
    await bloomIdInput.setValue('BLOOM_20251')

    const searchBtn = wrapper.findAll('button').find((b) => b.text().toLowerCase().includes('search'))
    await searchBtn.trigger('click')

    expect(wrapper.emitted('apply-filters')).toBeTruthy()
    const emittedFilters = wrapper.emitted('apply-filters')[0][0]
    expect(emittedFilters).toMatchObject({
      name: 'Mario',
      email: 'mario@example.com',
      bloomId: 'BLOOM_20251'
    })
  })

  it('emits apply-filters with cleared values when Clear Filters is clicked', async () => {
    const wrapper = mountTable()

    const nameInput = wrapper.find('input[id*="name" i]')
    await nameInput.setValue('Mario')

    const clearBtn = wrapper.findAll('button').find((b) => b.text().toLowerCase().includes('clear'))
    await clearBtn.trigger('click')

    expect(wrapper.emitted('apply-filters')).toBeTruthy()
    const lastCall = wrapper.emitted('apply-filters').at(-1)[0]
    expect(lastCall.name).toBe('')
  })

  it('does not render pagination controls when totalCount is less than or equal to itemsPerPage', () => {
    const wrapper = mountTable({ totalCount: 2, itemsPerPage: 5 })

    expect(wrapper.find('.pagination').exists()).toBe(false)
  })

  it('renders pagination controls and emits page-change when totalCount exceeds itemsPerPage', async () => {
    const wrapper = mountTable({ totalCount: 20, itemsPerPage: 5, currentPage: 1 })

    const nextBtn = wrapper.findAll('button').find((b) => b.text().toLowerCase().includes('next'))
    expect(nextBtn).toBeTruthy()

    await nextBtn.trigger('click')

    expect(wrapper.emitted('page-change')).toBeTruthy()
    expect(wrapper.emitted('page-change')[0]).toEqual([2])
  })
})
