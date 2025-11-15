<template>
  <div class="courses-container">
    <header class="courses-header">
      <h1>Corsi attivi</h1>
      <p class="courses-subtitle">In questa pagina sono elencati i corsi attivi disponibili.</p>
    </header>

    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <p>Loading courses...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-state">
      <p>{{ error }}</p>
      <button @click="fetchActiveCourses" class="retry-btn">Try Again</button>
    </div>

    <!-- Courses Table -->
    <div v-else class="courses-table-container">
      <!-- Results Count -->
      <div class="results-info">
        <p>Showing {{ courses.length }} active courses</p>
      </div>

      <!-- Table -->
      <div class="table-container">
        <table class="courses-table">
          <thead>
            <tr>
              <th @click="sortBy('name')" class="sortable">
                Course Name
                <span class="sort-indicator" v-if="sortField === 'name'">
                  {{ sortDirection === 'asc' ? '↑' : '↓' }}
                </span>
              </th>
              <th @click="sortBy('type')" class="sortable">
                Type
                <span class="sort-indicator" v-if="sortField === 'type'">
                  {{ sortDirection === 'asc' ? '↑' : '↓' }}
                </span>
              </th>
              <th @click="sortBy('startDate')" class="sortable">
                Start Date
                <span class="sort-indicator" v-if="sortField === 'startDate'">
                  {{ sortDirection === 'asc' ? '↑' : '↓' }}
                </span>
              </th>
              <th @click="sortBy('endDate')" class="sortable">
                End Date
                <span class="sort-indicator" v-if="sortField === 'endDate'">
                  {{ sortDirection === 'asc' ? '↑' : '↓' }}
                </span>
              </th>
              <th @click="sortBy('price')" class="sortable">
                Course Price (€)
                <span class="sort-indicator" v-if="sortField === 'price'">
                  {{ sortDirection === 'asc' ? '↑' : '↓' }}
                </span>
              </th>
              <th @click="sortBy('capacity')" class="sortable">
                Capacity
                <span class="sort-indicator" v-if="sortField === 'capacity'">
                  {{ sortDirection === 'asc' ? '↑' : '↓' }}
                </span>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="course in sortedCourses" :key="course.id" class="table-row">
              <td class="course-name">{{ course.name }}</td>
              <td>
                <span class="course-type-badge" :class="getCourseTypeClass(course.type)">
                  {{ course.type }}
                </span>
              </td>
              <td>{{ formatDate(course.startDate) }}</td>
              <td>{{ formatDate(course.endDate) }}</td>
              <td class="price-cell">
                <span class="price" :class="{ 'not-specified-price': parseFloat(course.price) === 0 }">
                  {{ parseFloat(course.price) === 0 ? 'NotSpecified' : `€${course.price}` }}
                </span>
              </td>
              <td class="capacity-cell">
                <span class="capacity" :class="{ 'unlimited': course.capacity === 0 }">
                  {{ course.capacity === 0 ? 'Unlimited' : course.capacity }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
        
        <!-- Empty State -->
        <div v-if="courses.length === 0" class="empty-state">
          <p>No active courses found.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { coursesService } from '../services/coursesService.js'

// Reactive data
const courses = ref([])
const loading = ref(false)
const error = ref(null)
const sortField = ref('')
const sortDirection = ref('asc')

// Computed properties
const sortedCourses = computed(() => {
  if (!sortField.value) {
    return courses.value
  }

  return [...courses.value].sort((a, b) => {
    let aValue = a[sortField.value]
    let bValue = b[sortField.value]

    // Handle numeric fields
    if (sortField.value === 'price' || sortField.value === 'capacity') {
      aValue = parseFloat(aValue) || 0
      bValue = parseFloat(bValue) || 0
    }

    // Handle date fields
    if (sortField.value === 'startDate' || sortField.value === 'endDate') {
      aValue = new Date(aValue)
      bValue = new Date(bValue)
    }

    // Handle string fields
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
})

// Methods
const fetchActiveCourses = async () => {
  loading.value = true
  error.value = null
  
  try {
    const response = await coursesService.getActiveCourses()
    courses.value = response || []
  } catch (err) {
    error.value = 'Failed to load courses. Please try again.'
    console.error('Error fetching courses:', err)
  } finally {
    loading.value = false
  }
}

const sortBy = (field) => {
  if (sortField.value === field) {
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortField.value = field
    sortDirection.value = 'asc'
  }
}

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const getCourseTypeClass = (type) => {
  return type.toLowerCase().replace(/\s+/g, '-')
}

// Lifecycle
onMounted(() => {
  fetchActiveCourses()
})
</script>

<style scoped>
.courses-container {
  padding: 1rem;
  max-width: 1200px;
  margin: 0 auto;
}

.courses-header {
  text-align: center;
  margin-bottom: 2rem;
}

.courses-header h1 {
  color: #2c3e50;
  margin-bottom: 0.5rem;
}

.courses-subtitle {
  color: #555;
  font-size: 1.1rem;
  margin: 0;
}

.loading-state,
.error-state {
  text-align: center;
  padding: 2rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.loading-state p {
  color: #666;
  font-size: 1.1rem;
  margin: 0;
}

.error-state p {
  color: #dc3545;
  font-size: 1.1rem;
  margin-bottom: 1rem;
}

.retry-btn {
  padding: 0.5rem 1rem;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
}

.retry-btn:hover {
  background: #0056b3;
}

.courses-table-container {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.results-info {
  padding: 1rem;
  background: #f8f9fa;
  border-bottom: 1px solid #dee2e6;
  color: #666;
  font-size: 0.9rem;
  margin: 0;
}

.table-container {
  overflow-x: auto;
}

.courses-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
}

.courses-table th,
.courses-table td {
  padding: 1rem;
  text-align: left;
  border-bottom: 1px solid #dee2e6;
}

.courses-table th {
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
  transition: background-color 0.2s ease;
}

.sortable:hover {
  background: #e9ecef;
}

.sort-indicator {
  margin-left: 0.25rem;
  font-size: 0.8rem;
  color: #007bff;
}

.table-row:hover {
  background: #f8f9fa;
}

.course-id {
  font-weight: 600;
  color: #666;
  font-family: 'Monaco', 'Menlo', monospace;
}

.course-name {
  font-weight: 600;
  color: #2c3e50;
}

.course-type-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.course-type-badge.gym {
  background: #e3f2fd;
  color: #1976d2;
  border: 1px solid #bbdefb;
}

.course-type-badge.workshop {
  background: #f3e5f5;
  color: #7b1fa2;
  border: 1px solid #e1bee7;
}

.price-cell {
  text-align: right;
}

.price {
  font-weight: 600;
  color: #28a745;
}

.price.not-specified-price {
  color: #17a2b8;
  background: #d1ecf1;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.capacity-cell {
  text-align: center;
}

.capacity {
  font-weight: 500;
}

.capacity.unlimited {
  color: #6c757d;
  font-style: italic;
}

.empty-state {
  text-align: center;
  padding: 3rem;
  color: #666;
}

.empty-state p {
  margin: 0;
  font-size: 1.1rem;
}

/* Responsive design */
@media (max-width: 768px) {
  .courses-container {
    padding: 0.5rem;
  }
  
  .courses-table {
    font-size: 0.8rem;
  }
  
  .courses-table th,
  .courses-table td {
    padding: 0.5rem;
  }
  
  .courses-header h1 {
    font-size: 1.5rem;
  }
  
  .courses-subtitle {
    font-size: 1rem;
  }
}

@media (max-width: 480px) {
  .table-container {
    font-size: 0.7rem;
  }
  
  .course-type-badge {
    font-size: 0.7rem;
    padding: 0.2rem 0.5rem;
  }
  
  .courses-table th,
  .courses-table td {
    padding: 0.25rem;
  }
}
</style>
