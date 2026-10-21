<template>
  <div class="users-page">
    <div class="users-header">
      <h1>Users</h1>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-container">
      <p>Loading users...</p>
    </div>

    <!-- Error State -->
    <div v-if="error" class="error-container">
      <p class="error-message">{{ error }}</p>
      <button @click="clearError" class="error-dismiss">Dismiss</button>
      <button @click="refreshUsers" class="retry-button">Retry</button>
    </div>

    <!-- Success State -->
    <div v-if="!loading && !error">
      <UsersFilteredTable
        :users="users"
        :items-per-page="itemsPerPage"
        :total-count="totalCount"
        :current-page="filters.page"
        @apply-filters="handleApplyFilters"
        @page-change="handlePageChange"
        @view-user="handleViewUser"
      />
    </div>
  </div>
</template>

<script setup>
import { onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import UsersFilteredTable from '../components/UsersFilteredTable.vue'
import { useUsers } from '../composables/useUsers.js'

const router = useRouter()

// Environment-based pagination
const itemsPerPage = computed(() => {
  return parseInt(import.meta.env.VITE_ITEMS_PER_PAGE) || 5
})

// Use the users composable
const {
  users,
  loading,
  error,
  totalCount,
  filters,
  fetchUsers,
  clearError,
  refreshUsers,
  applyFilters,
  changePage
} = useUsers()

// Load users when component mounts
onMounted(async () => {
  await fetchUsers()
})

const handleApplyFilters = async (newFilters) => {
  await applyFilters(newFilters)
}

const handlePageChange = async (page) => {
  await changePage(page)
}

const handleViewUser = (user) => {
  router.push(`/users/${user.id}`)
}
</script>

<style scoped>
.users-page {
  padding: 1rem;
  max-width: 1200px;
  margin: 0 auto;
}

.users-header {
  margin-bottom: 1rem;
}

.users-header h1 {
  margin: 0;
  color: #2c3e50;
}

.loading-container,
.error-container {
  text-align: center;
  padding: 2rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.error-container {
  border-left: 4px solid #dc3545;
}

.error-message {
  color: #dc3545;
  margin-bottom: 1rem;
}

.error-dismiss,
.retry-button {
  padding: 0.5rem 1rem;
  margin: 0 0.5rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
}

.error-dismiss {
  background: #6c757d;
  color: white;
}

.retry-button {
  background: #007bff;
  color: white;
}
</style>
