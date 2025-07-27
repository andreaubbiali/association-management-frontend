<template>
  <div class="associates-table-container">
    <!-- Filter Section -->
    <div class="filters">
      <h3>Filter Associates</h3>
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
          <label for="lastNameFilter">Last Name:</label>
          <input
            id="lastNameFilter"
            v-model="filters.lastName"
            type="text"
            placeholder="Search by last name..."
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
          <label for="yearFilter">Year:</label>
          <select id="yearFilter" v-model="filters.associationYear" class="filter-select">
            <option value="">All Years</option>
            <option v-for="year in availableYears" :key="year" :value="year">
              {{ year }}
            </option>
          </select>
        </div>
        <button @click="clearFilters" class="clear-filters-btn">Clear Filters</button>
      </div>
    </div>

    <!-- Results Count -->
    <div class="results-info">
      <p>Showing {{ filteredAssociates.length }} of {{ associates.length }} associates</p>
    </div>

    <!-- Table -->
    <div class="table-container">
      <table class="associates-table">
        <thead>
          <tr>
            <th @click="sortBy('id')" class="sortable">
              ID 
              <span class="sort-indicator" v-if="sortField === 'id'">
                {{ sortDirection === 'asc' ? '↑' : '↓' }}
              </span>
            </th>
            <th @click="sortBy('user.name')" class="sortable">
              Name
              <span class="sort-indicator" v-if="sortField === 'user.name'">
                {{ sortDirection === 'asc' ? '↑' : '↓' }}
              </span>
            </th>
            <th @click="sortBy('user.lastName')" class="sortable">
              Last Name
              <span class="sort-indicator" v-if="sortField === 'user.lastName'">
                {{ sortDirection === 'asc' ? '↑' : '↓' }}
              </span>
            </th>
            <th @click="sortBy('user.email')" class="sortable">
              Email
              <span class="sort-indicator" v-if="sortField === 'user.email'">
                {{ sortDirection === 'asc' ? '↑' : '↓' }}
              </span>
            </th>
            <th @click="sortBy('user.birthDate')" class="sortable">
              Birth Date
              <span class="sort-indicator" v-if="sortField === 'user.birthDate'">
                {{ sortDirection === 'asc' ? '↑' : '↓' }}
              </span>
            </th>
            <th>Birth Place</th>
            <th>Fiscal Code</th>
            <th @click="sortBy('associationYear')" class="sortable">
              Association Year
              <span class="sort-indicator" v-if="sortField === 'associationYear'">
                {{ sortDirection === 'asc' ? '↑' : '↓' }}
              </span>
            </th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="associate in paginatedAssociates" :key="associate.id" class="table-row">
            <td>{{ associate.id }}</td>
            <td>{{ associate.user.name }}</td>
            <td>{{ associate.user.lastName }}</td>
            <td>{{ associate.user.email }}</td>
            <td>{{ formatDate(associate.user.birthDate) }}</td>
            <td>{{ associate.user.birthPlace }}</td>
            <td>{{ associate.user.fiscalCode }}</td>
            <td>{{ associate.associationYear }}</td>
            <td class="actions-cell">
              <button
                @click="editAssociate(associate)"
                class="action-btn edit-btn"
                title="Edit Associate"
              >
                Edit
              </button>
              <button
                @click="deleteAssociate(associate)"
                class="action-btn delete-btn"
                title="Delete Associate"
              >
                Delete
              </button>
            </td>
          </tr>
        </tbody>
      </table>
      
      <!-- Empty State -->
      <div v-if="filteredAssociates.length === 0" class="empty-state">
        <p>No associates found matching your filters.</p>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="totalPages > 1" class="pagination">
      <button
        @click="currentPage = 1"
        :disabled="currentPage === 1"
        class="pagination-btn"
      >
        First
      </button>
      <button
        @click="currentPage--"
        :disabled="currentPage === 1"
        class="pagination-btn"
      >
        Previous
      </button>
      <span class="pagination-info">
        Page {{ currentPage }} of {{ totalPages }}
      </span>
      <button
        @click="currentPage++"
        :disabled="currentPage === totalPages"
        class="pagination-btn"
      >
        Next
      </button>
      <button
        @click="currentPage = totalPages"
        :disabled="currentPage === totalPages"
        class="pagination-btn"
      >
        Last
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

// Props
const props = defineProps({
  associates: {
    type: Array,
    required: true,
    default: () => []
  },
  itemsPerPage: {
    type: Number,
    default: 10
  }
})

// Emits
const emit = defineEmits(['edit-associate', 'delete-associate'])

// Reactive data
const filters = ref({
  name: '',
  lastName: '',
  email: '',
  associationYear: ''
})

const sortField = ref('')
const sortDirection = ref('asc')
const currentPage = ref(1)

// Computed properties
const availableYears = computed(() => {
  const years = [...new Set(props.associates.map(associate => associate.associationYear))]
  return years.sort((a, b) => b - a)
})

const filteredAssociates = computed(() => {
  let result = [...props.associates]

  // Apply filters
  if (filters.value.name) {
    result = result.filter(associate =>
      associate.user.name.toLowerCase().includes(filters.value.name.toLowerCase())
    )
  }

  if (filters.value.lastName) {
    result = result.filter(associate =>
      associate.user.lastName.toLowerCase().includes(filters.value.lastName.toLowerCase())
    )
  }

  if (filters.value.email) {
    result = result.filter(associate =>
      associate.user.email.toLowerCase().includes(filters.value.email.toLowerCase())
    )
  }

  if (filters.value.associationYear) {
    result = result.filter(associate =>
      associate.associationYear === parseInt(filters.value.associationYear)
    )
  }

  // Apply sorting
  if (sortField.value) {
    result.sort((a, b) => {
      let aValue, bValue

      if (sortField.value.includes('.')) {
        const [obj, prop] = sortField.value.split('.')
        aValue = a[obj][prop]
        bValue = b[obj][prop]
      } else {
        aValue = a[sortField.value]
        bValue = b[sortField.value]
      }

      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase()
        bValue = bValue.toLowerCase()
      }

      if (sortDirection.value === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0
      }
    })
  }

  return result
})

const totalPages = computed(() => {
  return Math.ceil(filteredAssociates.value.length / props.itemsPerPage)
})

const paginatedAssociates = computed(() => {
  const start = (currentPage.value - 1) * props.itemsPerPage
  const end = start + props.itemsPerPage
  return filteredAssociates.value.slice(start, end)
})

// Methods
const sortBy = (field) => {
  if (sortField.value === field) {
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortField.value = field
    sortDirection.value = 'asc'
  }
  currentPage.value = 1
}

const clearFilters = () => {
  filters.value = {
    name: '',
    lastName: '',
    email: '',
    associationYear: ''
  }
  currentPage.value = 1
}

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const editAssociate = (associate) => {
  emit('edit-associate', associate)
}

const deleteAssociate = (associate) => {
  emit('delete-associate', associate)
}

// Reset page when filters change
watch(filters, () => {
  currentPage.value = 1
}, { deep: true })
</script>

<style scoped>
.associates-table-container {
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

.filter-input,
.filter-select {
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.9rem;
}

.filter-input:focus,
.filter-select:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
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

.associates-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
}

.associates-table th,
.associates-table td {
  padding: 0.75rem;
  text-align: left;
  border-bottom: 1px solid #dee2e6;
}

.associates-table th {
  background: #f8f9fa;
  font-weight: 600;
  color: #333;
  position: sticky;
  top: 0;
}

.sortable {
  cursor: pointer;
  user-select: none;
  position: relative;
}

.sortable:hover {
  background: #e9ecef;
}

.sort-indicator {
  margin-left: 0.25rem;
  font-size: 0.8rem;
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

.edit-btn {
  background: #007bff;
  color: white;
}

.edit-btn:hover {
  background: #0056b3;
}

.delete-btn {
  background: #dc3545;
  color: white;
}

.delete-btn:hover {
  background: #c82333;
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
  
  .associates-table {
    font-size: 0.8rem;
  }
  
  .associates-table th,
  .associates-table td {
    padding: 0.5rem;
  }
}
</style>
