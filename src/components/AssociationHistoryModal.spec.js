import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import AssociationHistoryModal from './AssociationHistoryModal.vue'

// 12 entries so pagination with itemsPerPage=10 produces a real 2nd page.
const sampleHistory = Array.from({ length: 12 }, (_, i) => ({
  id: i + 1,
  validityYearStart: 2015 + i,
  validityYearEnd: 2016 + i,
  annualFeePaid: i % 2 === 0
}))

function mountModal(props = {}) {
  return mount(AssociationHistoryModal, {
    props: {
      visible: true,
      history: sampleHistory,
      itemsPerPage: 10,
      ...props
    }
  })
}

describe('AssociationHistoryModal.vue', () => {
  it('renders no table when visible is false', () => {
    const wrapper = mountModal({ visible: false })
    expect(wrapper.find('table').exists()).toBe(false)
  })

  it('renders a table row per history entry on the first page, capped at itemsPerPage', () => {
    const wrapper = mountModal()
    expect(wrapper.findAll('tbody tr')).toHaveLength(10)
  })

  it('renders the validity year range as "start/end"', () => {
    const wrapper = mountModal()
    expect(wrapper.text()).toContain('2015/2016')
  })

  it('renders a check mark for a paid year and a cross for an unpaid year', () => {
    const wrapper = mountModal({ history: [sampleHistory[0], sampleHistory[1]], itemsPerPage: 10 })
    const rows = wrapper.findAll('tbody tr')

    expect(rows[0].text()).toContain('✓')
    expect(rows[1].text()).toContain('✗')
  })

  it('shows an empty state when history is an empty array, with no table rows', () => {
    const wrapper = mountModal({ history: [] })

    expect(wrapper.findAll('tbody tr')).toHaveLength(0)
    expect(wrapper.text().toLowerCase()).toMatch(/no .*(history|record)/)
  })

  it('shows "Page 1 of 2" pagination info, consistent with the rest of the app', () => {
    const wrapper = mountModal()
    expect(wrapper.text()).toMatch(/Page 1 of 2/)
  })

  it('paginates client-side: Next shows the remaining already-loaded rows with no page-change-style emit', async () => {
    const wrapper = mountModal()
    const nextBtn = wrapper.findAll('button').find((b) => b.text().toLowerCase().includes('next'))
    expect(nextBtn, 'expected a Next pagination button').toBeTruthy()

    await nextBtn.trigger('click')

    const rows = wrapper.findAll('tbody tr')
    expect(rows).toHaveLength(2) // remaining 2 of 12
    expect(wrapper.text()).toContain('2025/2026')

    // The data is already fully loaded client-side -- no network-triggering emit on page change.
    expect(wrapper.emitted('page-change')).toBeFalsy()
  })

  it('disables Previous on the first page and disables Next once on the last page', async () => {
    const wrapper = mountModal()
    const prevBtn = wrapper.findAll('button').find((b) => b.text().toLowerCase().includes('previous'))
    expect(prevBtn.attributes('disabled')).not.toBeUndefined()

    const nextBtn = wrapper.findAll('button').find((b) => b.text().toLowerCase().includes('next'))
    await nextBtn.trigger('click')

    expect(nextBtn.attributes('disabled')).not.toBeUndefined()
  })

  it('reacts to the history prop arriving after mount (e.g. the parent\'s async fetch resolving later), not just to pagination clicks', async () => {
    const wrapper = mountModal({ history: [] })
    expect(wrapper.findAll('tbody tr')).toHaveLength(0)

    await wrapper.setProps({ history: sampleHistory })

    expect(wrapper.findAll('tbody tr')).toHaveLength(10)
    expect(wrapper.text()).toContain('2015/2016')
  })

  it('reflects a row prepended to history (e.g. a newly-created associate) without needing a page change', async () => {
    const wrapper = mountModal({ history: sampleHistory.slice(0, 2), itemsPerPage: 10 })
    expect(wrapper.findAll('tbody tr')).toHaveLength(2)

    await wrapper.setProps({ history: [{ id: 99, validityYearStart: 2099, validityYearEnd: 2100, annualFeePaid: false }, ...sampleHistory.slice(0, 2)] })

    expect(wrapper.findAll('tbody tr')).toHaveLength(3)
    expect(wrapper.text()).toContain('2099/2100')
  })

  it('emits close when the dismiss/close action is clicked', async () => {
    const wrapper = mountModal()
    const closeBtn = wrapper.findAll('button').find((b) => /close|dismiss/i.test(b.text()))
    expect(closeBtn, 'expected a close/dismiss button').toBeTruthy()

    await closeBtn.trigger('click')

    expect(wrapper.emitted('close')).toBeTruthy()
  })
})
