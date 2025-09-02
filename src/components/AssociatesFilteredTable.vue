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
        <button @click="applyFilters" class="search-btn">Search</button>
        <button @click="clearFilters" class="clear-filters-btn">Clear Filters</button>
      </div>
    </div>

    <!-- Results Count -->
    <div class="results-info">
      <p>Showing {{ Math.min(associates.length, props.itemsPerPage) }} of {{ props.totalCount }} associates</p>
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
            <th>Payment Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="associate in associates" :key="associate.id" class="table-row">
            <td>{{ associate.id }}</td>
            <td>{{ associate.user.name }}</td>
            <td>{{ associate.user.lastName }}</td>
            <td>{{ associate.user.email }}</td>
            <td>{{ formatDate(associate.user.birthDate) }}</td>
            <td>{{ associate.user.birthPlace }}</td>
            <td>{{ associate.user.fiscalCode }}</td>
            <td>{{ associate.associationYear }}</td>
            <td class="payment-status">
              <span v-if="isAssociateFullyPaid(associate)" class="payment-status-icon paid">✓</span>
              <span v-else class="payment-status-icon unpaid">✗</span>
            </td>
            <td class="actions-cell">
              <button
                @click="manageAssociate(associate)"
                class="action-btn manage-btn"
                title="Manage Associate"
              >
                Manage
              </button>
            </td>
          </tr>
        </tbody>
      </table>
      
      <!-- Empty State -->
      <div v-if="associates.length === 0" class="empty-state">
        <p>No associates found.</p>
      </div>
    </div>

    <!-- Pagination -->
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
  associates: {
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
const emit = defineEmits(['manage-associate', 'delete-associate', 'apply-filters', 'page-change'])

// Reactive data
const filters = ref({
  name: '',
  lastName: '',
  email: '',
  associationYear: ''
})

const sortField = ref('')
const sortDirection = ref('asc')
const currentPage = ref(props.currentPage)

// Watch for currentPage prop changes and update local state
watch(() => props.currentPage, (newPage) => {
  currentPage.value = newPage
}, { immediate: true })

// Computed properties
const availableYears = computed(() => {
  const years = [...new Set(props.associates.map(associate => associate.associationYear))]
  return years.sort((a, b) => b - a)
})

const totalPages = computed(() => {
  return Math.ceil(props.totalCount / props.itemsPerPage)
})

const hasNextPage = computed(() => {
  return currentPage.value < totalPages.value
})

const hasPreviousPage = computed(() => {
  return currentPage.value > 1
})

const paginatedAssociates = computed(() => {
  // Since we're doing server-side pagination, we just return the associates as-is
  return props.associates
})

// Methods
const applyFilters = () => {
  emit('apply-filters', { ...filters.value })
  currentPage.value = 1
}

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
  // Trigger API call to fetch all data without filters
  emit('apply-filters', { ...filters.value })
}

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const manageAssociate = (associate) => {
  emit('manage-associate', associate)
}

const deleteAssociate = (associate) => {
  emit('delete-associate', associate)
}

// Function to check if an associate has all payments settled
const isAssociateFullyPaid = (associate) => {
  // Check if annual fee is paid
  if (!associate.annualFeePaid) {
    return false
  }
  
  // Check if associate has courses
  if (!associate.courses || associate.courses.length === 0) {
    return true // If no courses, only annual fee matters
  }
  
  // Check if every payment of every course has a paymentDate
  return associate.courses.every(course => {
    if (!course.payments || course.payments.length === 0) {
      return false // Course has no payments
    }
    return course.payments.every(payment => payment.paymentDate)
  })
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

.payment-status {
  text-align: center;
}

.payment-status-icon {
  font-size: 1.2rem;
  font-weight: bold;
  display: inline-block;
  width: 20px;
  height: 20px;
  line-height: 20px;
  text-align: center;
  border-radius: 50%;
}

.payment-status-icon.paid {
  color: #28a745;
  background: #d4edda;
  border: 1px solid #c3e6cb;
}

.payment-status-icon.unpaid {
  color: #dc3545;
  background: #f8d7da;
  border: 1px solid #f5c6cb;
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

.manage-btn {
  background: #007bff;
  color: white;
}

.manage-btn:hover {
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

.pagination-btn:disabled:hover {
  background: #6c757d;
}

.pagination-info {
  margin: 0 1rem;
  font-weight: 500;
  color: #333;
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
