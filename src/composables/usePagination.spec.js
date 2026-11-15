import { describe, it, expect, vi } from 'vitest'
import { ref } from 'vue'
import { usePagination } from './usePagination.js'

describe('usePagination', () => {
  it('defaults currentPage to 1 when no initial page is given', () => {
    const { currentPage } = usePagination({ totalCount: ref(20), itemsPerPage: ref(5) })
    expect(currentPage.value).toBe(1)
  })

  it('accepts an explicit initial currentPage', () => {
    const { currentPage } = usePagination({ totalCount: ref(20), itemsPerPage: ref(5), currentPage: 3 })
    expect(currentPage.value).toBe(3)
  })

  it('computes totalPages as ceil(totalCount / itemsPerPage)', () => {
    const { totalPages } = usePagination({ totalCount: ref(12), itemsPerPage: ref(5) })
    expect(totalPages.value).toBe(3)
  })

  it('accepts plain numbers (not just refs/computed) for totalCount and itemsPerPage', () => {
    const { totalPages } = usePagination({ totalCount: 12, itemsPerPage: 5 })
    expect(totalPages.value).toBe(3)
  })

  it('recomputes totalPages reactively when a reactive totalCount changes', () => {
    const totalCount = ref(10)
    const { totalPages } = usePagination({ totalCount, itemsPerPage: ref(5) })

    expect(totalPages.value).toBe(2)
    totalCount.value = 21
    expect(totalPages.value).toBe(5)
  })

  it('hasPreviousPage is false on page 1 and true once a next page has been visited', () => {
    const { hasPreviousPage, goToNextPage } = usePagination({ totalCount: ref(20), itemsPerPage: ref(5) })

    expect(hasPreviousPage.value).toBe(false)
    goToNextPage()
    expect(hasPreviousPage.value).toBe(true)
  })

  it('hasNextPage is false on the last page', () => {
    const { hasNextPage, currentPage } = usePagination({ totalCount: ref(10), itemsPerPage: ref(5), currentPage: 2 })

    expect(currentPage.value).toBe(2)
    expect(hasNextPage.value).toBe(false)
  })

  it('hasNextPage is true when more pages remain', () => {
    const { hasNextPage } = usePagination({ totalCount: ref(20), itemsPerPage: ref(5) })
    expect(hasNextPage.value).toBe(true)
  })

  it('a totalCount of exactly one page leaves both hasPreviousPage and hasNextPage false on page 1', () => {
    const { hasPreviousPage, hasNextPage, totalPages, currentPage } = usePagination({
      totalCount: ref(5),
      itemsPerPage: ref(5)
    })

    expect(currentPage.value).toBe(1)
    expect(totalPages.value).toBe(1)
    expect(hasPreviousPage.value).toBe(false)
    expect(hasNextPage.value).toBe(false)
  })

  it('a totalCount smaller than one full page (a partial single page) also disables both nav directions on page 1', () => {
    const { hasPreviousPage, hasNextPage, totalPages } = usePagination({
      totalCount: ref(3),
      itemsPerPage: ref(5)
    })

    expect(totalPages.value).toBe(1)
    expect(hasPreviousPage.value).toBe(false)
    expect(hasNextPage.value).toBe(false)
  })

  it('goToNextPage increments currentPage and invokes the onChange callback with the new page number', () => {
    const { goToNextPage, currentPage } = usePagination({ totalCount: ref(20), itemsPerPage: ref(5) })
    const onChange = vi.fn()

    goToNextPage(onChange)

    expect(currentPage.value).toBe(2)
    expect(onChange).toHaveBeenCalledTimes(1)
    expect(onChange).toHaveBeenCalledWith(2)
  })

  it('goToNextPage does nothing and never calls onChange when already on the last page', () => {
    const { goToNextPage, currentPage } = usePagination({ totalCount: ref(10), itemsPerPage: ref(5), currentPage: 2 })
    const onChange = vi.fn()

    goToNextPage(onChange)

    expect(currentPage.value).toBe(2)
    expect(onChange).not.toHaveBeenCalled()
  })

  it('goToPreviousPage decrements currentPage and invokes the onChange callback with the new page number', () => {
    const { goToPreviousPage, currentPage } = usePagination({ totalCount: ref(20), itemsPerPage: ref(5), currentPage: 3 })
    const onChange = vi.fn()

    goToPreviousPage(onChange)

    expect(currentPage.value).toBe(2)
    expect(onChange).toHaveBeenCalledWith(2)
  })

  it('goToPreviousPage does nothing and never calls onChange on page 1', () => {
    const { goToPreviousPage, currentPage } = usePagination({ totalCount: ref(20), itemsPerPage: ref(5) })
    const onChange = vi.fn()

    goToPreviousPage(onChange)

    expect(currentPage.value).toBe(1)
    expect(onChange).not.toHaveBeenCalled()
  })

  it('onChange is optional -- calling goToNextPage/goToPreviousPage without a callback does not throw', () => {
    const { goToNextPage, goToPreviousPage, currentPage } = usePagination({
      totalCount: ref(20),
      itemsPerPage: ref(5),
      currentPage: 2
    })

    expect(() => goToNextPage()).not.toThrow()
    expect(currentPage.value).toBe(3)
    expect(() => goToPreviousPage()).not.toThrow()
    expect(currentPage.value).toBe(2)
  })

  // The composable must stay agnostic to what the caller's callback does with
  // the new page number: a remote-refetch emit (AssociatesFilteredTable.vue /
  // UsersFilteredTable.vue) and a local re-slice of an already-loaded array
  // (the new History modal) must both work unmodified against the same API.
  it('is agnostic to the callback: works for an emit-style remote-refetch caller', () => {
    const emitted = []
    const emit = (event, page) => emitted.push([event, page])
    const { goToNextPage } = usePagination({ totalCount: ref(20), itemsPerPage: ref(5) })

    goToNextPage((page) => emit('page-change', page))

    expect(emitted).toEqual([['page-change', 2]])
  })

  it('is agnostic to the callback: works for a local re-slice caller over an already-loaded array', () => {
    const fullList = Array.from({ length: 12 }, (_, i) => i + 1)
    let displayed = fullList.slice(0, 5)
    const { goToNextPage } = usePagination({ totalCount: ref(fullList.length), itemsPerPage: ref(5) })

    goToNextPage((page) => {
      displayed = fullList.slice((page - 1) * 5, page * 5)
    })

    expect(displayed).toEqual([6, 7, 8, 9, 10])
  })
})
