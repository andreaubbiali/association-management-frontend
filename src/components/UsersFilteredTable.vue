<template>
  <div class="users-table-container">
    <!-- Filter Section -->
    <div class="filters">
      <h3>Filter Users</h3>
      <div class="filter-row">
        <div class="filter-group">
          <label for="nameFilter">Name:</label>
          <input
            id="nameFilter"
            v-model="filters.name"
            type="text"
            placeholder="Search by name..."
            class="filter-input"
          />
        </div>
        <div class="filter-group">
          <label for="emailFilter">Email:</label>
          <input
            id="emailFilter"
            v-model="filters.email"
            type="text"
            placeholder="Search by email..."
            class="filter-input"
          />
        </div>
        <div class="filter-group">
          <label for="bloomIdFilter">Bloom id:</label>
          <input
            id="bloomIdFilter"
            v-model="filters.bloomId"
            type="text"
            placeholder="Search by Bloom id..."
            class="filter-input"
          />
        </div>
        <button @click="applyFilters" class="search-btn">Search</button>
        <button @click="clearFilters" class="clear-filters-btn">Clear Filters</button>
      </div>
    </div>

    <!-- Results Count -->
    <div class="results-info">
      <p>Showing {{ Math.min(users.length, props.itemsPerPage) }} of {{ props.totalCount }} users</p>
    </div>

    <!-- Table -->
    <div class="table-container">
      <table class="users-table">
        <thead>
          <tr>
            <th>Bloom Id</th>
            <th>Name</th>
            <th>Last Name</th>
            <th>Email</th>
            <th>Fiscal Code</th>
            <th>Birth Date</th>
            <th>Phone Number</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in users" :key="user.id" class="table-row">
            <td>{{ user.bloomId }}</td>
            <td>{{ user.name }}</td>
            <td>{{ user.lastName }}</td>
            <td>{{ user.email }}</td>
            <td>{{ user.fiscalCode }}</td>
            <td>{{ formatDate(user.birthDate) }}</td>
            <td>{{ user.phoneNumber }}</td>
            <td class="actions-cell">
              <button
                @click="viewUser(user)"
                class="action-btn view-btn"
                title="View User"
              >
                View
              </button>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Empty State -->
      <div v-if="users.length === 0" class="empty-state">
        <p>No users found.</p>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="props.totalCount > props.itemsPerPage" class="pagination">
      <button
        @click="goToPreviousPage"
        :disabled="!hasPreviousPage"
        class="pagination-btn"
      >
        Previous
      </button>
      <span class="pagination-info">
        Page {{ currentPage }} of {{ totalPages }}
      </span>
      <button
        @click="goToNextPage"
        :disabled="!hasNextPage"
        class="pagination-btn"
      >
        Next
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

// Props
const props = defineProps({
  users: {
    type: Array,
    required: true,
    default: () => []
  },
  itemsPerPage: {
    type: Number,
    default: 5
  },
  totalCount: {
    type: Number,
    default: 0
  },
  currentPage: {
    type: Number,
    default: 1
  }
})

// Emits
const emit = defineEmits(['apply-filters', 'page-change', 'view-user'])

// Reactive data
const filters = ref({
  name: '',
  email: '',
  bloomId: ''
})

const currentPage = ref(props.currentPage)

// Watch for currentPage prop changes and update local state
watch(() => props.currentPage, (newPage) => {
  currentPage.value = newPage
}, { immediate: true })

// Computed properties
const totalPages = computed(() => {
  return Math.ceil(props.totalCount / props.itemsPerPage)
})

const hasNextPage = computed(() => {
  return currentPage.value < totalPages.value
})

const hasPreviousPage = computed(() => {
  return currentPage.value > 1
})

// Methods
const applyFilters = () => {
  emit('apply-filters', { ...filters.value })
  currentPage.value = 1
}

const clearFilters = () => {
  filters.value = {
    name: '',
    email: '',
    bloomId: ''
  }
  currentPage.value = 1
  emit('apply-filters', { ...filters.value })
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const viewUser = (user) => {
  emit('view-user', user)
}

const goToNextPage = () => {
  if (hasNextPage.value) {
    currentPage.value++
    emit('page-change', currentPage.value)
  }
}

const goToPreviousPage = () => {
  if (hasPreviousPage.value) {
    currentPage.value--
    emit('page-change', currentPage.value)
  }
}
</script>

<style scoped>
.users-table-container {
  padding: 1rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.filters {
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 6px;
}

.filters h3 {
  margin: 0 0 1rem 0;
  color: #333;
}

.filter-row {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  align-items: end;
}

.filter-group {
  display: flex;
  flex-direction: column;
  min-width: 150px;
}

.filter-group label {
  font-weight: 500;
  margin-bottom: 0.25rem;
  color: #555;
}

.filter-input {
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.9rem;
}

.filter-input:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
}

.search-btn {
  padding: 0.5rem 1rem;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  height: fit-content;
  margin-right: 0.5rem;
}

.search-btn:hover {
  background: #0056b3;
}

.clear-filters-btn {
  padding: 0.5rem 1rem;
  background: #6c757d;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  height: fit-content;
}

.clear-filters-btn:hover {
  background: #5a6268;
}

.results-info {
  margin-bottom: 1rem;
  color: #666;
  font-size: 0.9rem;
}

.table-container {
  overflow-x: auto;
  margin-bottom: 1rem;
}

.users-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
}

.users-table th,
.users-table td {
  padding: 0.75rem;
  text-align: left;
  border-bottom: 1px solid #dee2e6;
}

.users-table th {
  background: #f8f9fa;
  font-weight: 600;
  color: #333;
  position: sticky;
  top: 0;
}

.table-row:hover {
  background: #f8f9fa;
}

.actions-cell {
  white-space: nowrap;
}

.action-btn {
  padding: 0.25rem 0.75rem;
  margin: 0 0.25rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.8rem;
  font-weight: 500;
}

.view-btn {
  background: #007bff;
  color: white;
}

.view-btn:hover {
  background: #0056b3;
}

.empty-state {
  text-align: center;
  padding: 2rem;
  color: #666;
}

.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 1rem;
}

.pagination-btn {
  padding: 0.5rem 0.75rem;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
}

.pagination-btn:hover:not(:disabled) {
  background: #0056b3;
}

.pagination-btn:disabled {
  background: #6c757d;
  cursor: not-allowed;
}

.pagination-info {
  margin: 0 1rem;
  font-weight: 500;
  color: #333;
}

/* Responsive design */
@media (max-width: 768px) {
  .filter-row {
    flex-direction: column;
  }

  .filter-group {
    min-width: 100%;
  }

  .users-table {
    font-size: 0.8rem;
  }

  .users-table th,
  .users-table td {
    padding: 0.5rem;
  }
}
</style>
