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
        :items-per-page="15"
        @edit-associate="handleEdit"
        @delete-associate="handleDelete"
      />
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import AssociatesFilteredTable from '../components/AssociatesFilteredTable.vue'
import { useAssociates } from '../composables/useAssociates.js'

// Use the associates composable
const {
  associates,
  loading,
  error,
  fetchAssociates,
  deleteAssociate,
  clearError,
  refreshAssociates
} = useAssociates()

// Load associates when component mounts
onMounted(async () => {
  await fetchAssociates()
})

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

</script>

<!-- Styles are in style.css -->
