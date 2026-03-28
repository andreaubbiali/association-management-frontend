<template>
  <div class="associates-page">
    <div class="associates-header">
      <h1>Associates</h1>
      <button @click="goToCreateAssociate" class="create-associate-btn">+ New Associate</button>
    </div>

    <div v-if="showCreatedMessage" class="success-banner">
      <p>Associate created successfully.</p>
      <button @click="dismissCreatedMessage" class="dismiss-success-btn">Dismiss</button>
    </div>

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
        :items-per-page="itemsPerPage"
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
import { onMounted, computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AssociatesFilteredTable from '../components/AssociatesFilteredTable.vue'
import { useAssociates } from '../composables/useAssociates.js'

// Router
const router = useRouter()
const route = useRoute()
const showCreatedMessage = ref(false)

// Environment-based pagination
const itemsPerPage = computed(() => {
  return parseInt(import.meta.env.VITE_ITEMS_PER_PAGE) || 5
})

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
  if (route.query.created === '1') {
    showCreatedMessage.value = true
    router.replace({ path: '/associates' })
  }

  await fetchAssociates()
})

const goToCreateAssociate = () => {
  router.push('/associates/create')
}

const dismissCreatedMessage = () => {
  showCreatedMessage.value = false
}

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

<style scoped>
.associates-header {
  max-width: 1200px;
  margin: 0 auto 1rem auto;
  padding: 1rem 1rem 0 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.75rem;
}

.associates-header h1 {
  margin: 0;
  color: #2c3e50;
}

.create-associate-btn {
  border: none;
  border-radius: 8px;
  background: #2c3e50;
  color: #fff;
  padding: 0.65rem 1rem;
  font-weight: 600;
  cursor: pointer;
}

.create-associate-btn:hover {
  background: #223241;
}

.success-banner {
  max-width: 1200px;
  margin: 0 auto 1rem auto;
  padding: 0.75rem 1rem;
  border-radius: 10px;
  background: #e7f7ec;
  border: 1px solid #b6e8c5;
  color: #176a3a;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.75rem;
}

.success-banner p {
  margin: 0;
}

.dismiss-success-btn {
  border: none;
  border-radius: 8px;
  background: #d0f0dc;
  color: #0f5a30;
  padding: 0.45rem 0.8rem;
  font-weight: 600;
  cursor: pointer;
}

@media (max-width: 768px) {
  .associates-header,
  .success-banner {
    padding-left: 0.75rem;
    padding-right: 0.75rem;
  }

  .associates-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .create-associate-btn {
    width: 100%;
  }

  .success-banner {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
