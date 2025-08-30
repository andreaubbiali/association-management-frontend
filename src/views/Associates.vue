<template>
  <div class="associates-page">
    <!-- Loading State -->
    <div v-if="loading" class="loading-container">
      <p>Loading associates...</p>
    </div>

    <!-- Error State -->
    <div v-if="error" class="error-container">
      <p class="error-message">{{ error }}</p>
      <button @click="clearError" class="error-dismiss">Dismiss</button>
      <button @click="refreshAssociates" class="retry-button">Retry</button>
    </div>

    <!-- Success State -->
    <div v-if="!loading && !error">

      <AssociatesFilteredTable
        :associates="associates"
        :items-per-page="5"
        :total-count="totalCount"
        :current-page="filters.page"
        @manage-associate="handleManage"
        @edit-associate="handleEdit"
        @delete-associate="handleDelete"
        @apply-filters="handleApplyFilters"
        @page-change="handlePageChange"
      />
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import AssociatesFilteredTable from '../components/AssociatesFilteredTable.vue'
import { useAssociates } from '../composables/useAssociates.js'

// Router
const router = useRouter()

// Use the associates composable
const {
  associates,
  loading,
  error,
  totalCount,
  filters,
  fetchAssociates,
  deleteAssociate,
  clearError,
  refreshAssociates,
  applyFilters,
  changePage
} = useAssociates()

// Load associates when component mounts
onMounted(async () => {
  await fetchAssociates()
})

const handleManage = (associate) => {
  console.log('Manage associate:', associate)
  // Navigate to the manage page for this associate
  router.push(`/associates/${associate.id}/manage`)
}

const handleEdit = (associate) => {
  console.log('Edit associate:', associate)
  // TODO: Implement edit functionality
  // Could open a modal or navigate to edit page
  // router.push(`/associates/${associate.id}/edit`)
}

const handleDelete = async (associate) => {
  // Show confirmation dialog
  const confirmed = confirm(`Are you sure you want to delete ${associate.user.name} ${associate.user.lastName}?`)
  
  if (confirmed) {
    try {
      await deleteAssociate(associate.id)
      console.log('Associate deleted successfully')
      // Could show a success toast/notification
    } catch (err) {
      console.error('Failed to delete associate:', err)
      // Error is already handled by the composable
    }
  }
}

const handleApplyFilters = async (filters) => {
  console.log('Applying filters:', filters)
  try {
    await applyFilters(filters)
    console.log('Filters applied successfully, associates count:', associates.value.length)
  } catch (err) {
    console.error('Failed to apply filters:', err)
  }
}

const handlePageChange = async (page) => {
  console.log('Changing to page:', page)
  try {
    await changePage(page)
    console.log('Page changed successfully, associates count:', associates.value.length)
  } catch (err) {
    console.error('Failed to change page:', err)
  }
}

</script>

<!-- Styles are in style.css -->
