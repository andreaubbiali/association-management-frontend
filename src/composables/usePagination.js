import { computed, isRef, ref, unref } from 'vue'

/**
 * Shared pagination composable, extracted from the duplicated widget logic
 * in AssociatesFilteredTable.vue / UsersFilteredTable.vue.
 *
 * Owns only the page arithmetic (currentPage, totalPages, hasNextPage,
 * hasPreviousPage, goToNextPage/goToPreviousPage). It is agnostic to what the
 * caller's `onChange` callback does with the new page number -- an emit for a
 * remote refetch, or a local re-slice of an already-loaded array.
 *
 * @param {Object} options
 * @param {number|import('vue').Ref<number>} options.totalCount
 * @param {number|import('vue').Ref<number>} options.itemsPerPage
 * @param {number} [options.currentPage] - initial page, defaults to 1
 */
export function usePagination({ totalCount, itemsPerPage, currentPage: initialPage = 1 } = {}) {
  const totalCountRef = isRef(totalCount) ? totalCount : ref(totalCount)
  const itemsPerPageRef = isRef(itemsPerPage) ? itemsPerPage : ref(itemsPerPage)

  const currentPage = ref(initialPage)

  const totalPages = computed(() => {
    const perPage = unref(itemsPerPageRef)
    if (!perPage) return 0
    return Math.ceil(unref(totalCountRef) / perPage)
  })

  const hasNextPage = computed(() => currentPage.value < totalPages.value)
  const hasPreviousPage = computed(() => currentPage.value > 1)

  const goToNextPage = (onChange) => {
    if (!hasNextPage.value) return
    currentPage.value += 1
    if (typeof onChange === 'function') {
      onChange(currentPage.value)
    }
  }

  const goToPreviousPage = (onChange) => {
    if (!hasPreviousPage.value) return
    currentPage.value -= 1
    if (typeof onChange === 'function') {
      onChange(currentPage.value)
    }
  }

  return {
    currentPage,
    totalPages,
    hasNextPage,
    hasPreviousPage,
    goToNextPage,
    goToPreviousPage
  }
}
