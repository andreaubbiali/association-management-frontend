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
      <!-- Results Count and Create Button -->
      <div class="results-info">
        <p>Showing {{ courses.length }} active courses</p>
        <button @click="showCreateForm = true" class="create-course-btn">
          Create New Course
        </button>
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

    <!-- Create Course Modal -->
    <div v-if="showCreateForm" class="modal-overlay" @click.self="closeCreateForm">
      <div class="modal-content">
        <div class="modal-header">
          <h3>Create New Course</h3>
          <button @click="closeCreateForm" class="close-btn">&times;</button>
        </div>
        
        <form @submit.prevent="submitCourse" class="course-form">
          <div class="form-group">
            <label for="courseName">Course Name *</label>
            <input
              id="courseName"
              v-model="newCourse.name"
              type="text"
              required
              placeholder="Enter course name..."
              class="form-input"
            />
          </div>

          <div class="form-group">
            <label for="courseType">Course Type *</label>
            <select
              id="courseType"
              v-model="newCourse.type"
              required
              class="form-select"
            >
              <option value="">Select course type...</option>
              <option value="Gym">Gym</option>
              <option value="Workshop">Workshop</option>
            </select>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="startDate">Start Date *</label>
              <input
                id="startDate"
                v-model="newCourse.startDate"
                type="date"
                required
                class="form-input"
              />
            </div>

            <div class="form-group">
              <label for="endDate">End Date *</label>
              <input
                id="endDate"
                v-model="newCourse.endDate"
                type="date"
                required
                class="form-input"
              />
            </div>
          </div>

          <div class="form-actions">
            <button type="button" @click="closeCreateForm" class="cancel-btn">
              Cancel
            </button>
            <button 
              type="submit" 
              :disabled="creating || !isFormValid"
              class="submit-btn"
            >
              {{ creating ? 'Creating...' : 'Create Course' }}
            </button>
          </div>
        </form>
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
const showCreateForm = ref(false)
const creating = ref(false)
const newCourse = ref({
  name: '',
  type: '',
  startDate: '',
  endDate: ''
})

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

const isFormValid = computed(() => {
  return newCourse.value.name.trim() &&
         newCourse.value.type &&
         newCourse.value.startDate &&
         newCourse.value.endDate &&
         new Date(newCourse.value.startDate) <= new Date(newCourse.value.endDate)
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

const closeCreateForm = () => {
  showCreateForm.value = false
  // Reset form
  newCourse.value = {
    name: '',
    type: '',
    startDate: '',
    endDate: ''
  }
}

const submitCourse = async () => {
  if (!isFormValid.value) return
  
  creating.value = true
  
  try {
    await coursesService.createCourse(newCourse.value)
    
    // Refresh the courses list
    await fetchActiveCourses()
    
    // Close the form
    closeCreateForm()
    
    // You could add a success notification here
    console.log('Course created successfully!')
    
  } catch (err) {
    console.error('Error creating course:', err)
    // You could add error notification here
    alert('Failed to create course. Please try again.', err)
  } finally {
    creating.value = false
  }
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
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.create-course-btn {
  padding: 0.5rem 1rem;
  background: #28a745;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  transition: background-color 0.2s ease;
}

.create-course-btn:hover {
  background: #218838;
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

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 8px;
  padding: 0;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #dee2e6;
  background: #f8f9fa;
  border-radius: 8px 8px 0 0;
}

.modal-header h3 {
  margin: 0;
  color: #2c3e50;
  font-size: 1.25rem;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #666;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background-color 0.2s ease;
}

.close-btn:hover {
  background: #e9ecef;
}

.course-form {
  padding: 1.5rem;
}

.form-group {
  margin-bottom: 1rem;
}

.form-row {
  display: flex;
  gap: 1rem;
}

.form-row .form-group {
  flex: 1;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #333;
}

.form-input,
.form-select {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.9rem;
  transition: border-color 0.2s ease;
  box-sizing: border-box;
}

.form-input:focus,
.form-select:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
}

.form-actions {
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid #dee2e6;
}

.cancel-btn {
  padding: 0.75rem 1.5rem;
  background: #6c757d;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background-color 0.2s ease;
}

.cancel-btn:hover {
  background: #5a6268;
}

.submit-btn {
  padding: 0.75rem 1.5rem;
  background: #28a745;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  transition: background-color 0.2s ease;
}

.submit-btn:hover:not(:disabled) {
  background: #218838;
}

.submit-btn:disabled {
  background: #6c757d;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .results-info {
    flex-direction: column;
    gap: 0.5rem;
    align-items: flex-start;
  }
  
  .create-course-btn {
    align-self: stretch;
    text-align: center;
  }
  
  .modal-content {
    width: 95%;
    margin: 1rem;
  }
  
  .form-row {
    flex-direction: column;
  }
  
  .form-actions {
    flex-direction: column;
  }
  
  .cancel-btn,
  .submit-btn {
    width: 100%;
  }
}
</style>
