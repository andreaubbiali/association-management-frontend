<template>
  <div class="associate-manage-page">
    <!-- Navigation -->
    <div class="page-header">
      <button @click="goBack" class="back-btn">
        ← Back to Associates
      </button>
      <h1>Manage Associate</h1>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-container">
      <p>Loading associate details...</p>
    </div>

    <!-- Error State -->
    <div v-if="error" class="error-container">
      <p class="error-message">{{ error }}</p>
      <button @click="clearError" class="error-dismiss">Dismiss</button>
      <button @click="fetchAssociateDetails" class="retry-button">Retry</button>
    </div>

    <!-- Associate Details -->
    <div v-if="!loading && !error && associate" class="associate-details">
      <div class="details-card">
        <h2>Associate Information</h2>
        <div class="info-grid">
          <div class="info-item">
            <label>Annual fee paid:</label>
            <div class="fee-status-container">
              <span class="fee-status" :class="{ 'paid': associate.annualFeePaid, 'unpaid': !associate.annualFeePaid }">
                {{ associate.annualFeePaid ? '✓' : '✗' }}
              </span>
              <button 
                @click="markFeePaid" 
                :disabled="associate.annualFeePaid" 
                class="fee-action-btn"
                :class="{ 'disabled': associate.annualFeePaid }"
                :title="associate.annualFeePaid ? 'Fee already paid' : 'Mark fee as paid'"
              >
                {{ associate.annualFeePaid ? 'Paid' : 'Mark as Paid' }}
              </button>
              <button 
                v-if="!associate.annualFeePaid"
                @click="sendFeeEmail" 
                class="fee-action-btn email-btn"
                title="Send reminder email for annual fee payment"
              >
                📧 Send Email
              </button>
            </div>
          </div>
          <div class="info-item">
            <label>ID:</label>
            <span>{{ associate.id }}</span>
          </div>
          <div class="info-item">
            <label>Name:</label>
            <span>{{ associate.user.name }}</span>
          </div>
          <div class="info-item">
            <label>Last Name:</label>
            <span>{{ associate.user.lastName }}</span>
          </div>
          <div class="info-item">
            <label>Email:</label>
            <span>{{ associate.user.email }}</span>
          </div>
          <div class="info-item">
            <label>Birth Date:</label>
            <span>{{ formatDate(associate.user.birthDate) }}</span>
          </div>
          <div class="info-item">
            <label>Birth Place:</label>
            <span>{{ associate.user.birthPlace }}</span>
          </div>
          <div class="info-item">
            <label>Fiscal Code:</label>
            <span>{{ associate.user.fiscalCode }}</span>
          </div>
          <div class="info-item">
            <label>Association Year:</label>
            <span>{{ associate.associationYear }}</span>
          </div>
        </div>
      </div>

      <!-- Actions Section -->
      <div class="actions-card">
        <h2>Courses Management</h2>
        
        <!-- Add Course Button -->
        <div class="add-course-section">
          <button @click="addCourse" class="action-btn add-course-btn">
            + Add Course
          </button>
        </div>

        <!-- Courses Table -->
        <div v-if="associate.courses && associate.courses.length > 0" class="courses-table-container">
          <table class="courses-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Type</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Payment Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="course in associate.courses" :key="course.name" class="course-row">
                <td>{{ course.name }}</td>
                <td>{{ course.type }}</td>
                <td>{{ formatDate(course.startDate) }}</td>
                <td>{{ formatDate(course.endDate) }}</td>
                <td class="payment-status">
                  <span v-if="isCoursePaid(course)" class="payment-status-icon paid">✓</span>
                  <span v-else class="payment-status-icon unpaid">✗</span>
                </td>
                <td class="course-actions">
                  <button @click="manageCourse(course)" class="course-action-btn manage-course-btn">
                    Manage
                  </button>
                  <button @click="removeCourse(course)" disabled class="course-action-btn remove-course-btn">
                    Remove
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Empty State for Courses -->
        <div v-else class="empty-courses">
          <p>No courses assigned to this associate.</p>
        </div>
      </div>
    </div>

    <!-- Add Course Modal -->
    <div v-if="showAddCourseModal" class="modal-overlay" @click="closeAddCourseModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>Add Course to Associate</h3>
          <button @click="closeAddCourseModal" class="modal-close-btn">×</button>
        </div>
        
        <div class="modal-body">
          <!-- Loading State for Courses -->
          <div v-if="coursesLoading" class="loading-container">
            <p>Loading available courses...</p>
          </div>

          <!-- Error State for Courses -->
          <div v-if="coursesError" class="error-container">
            <p class="error-message">{{ coursesError }}</p>
            <button @click="fetchAvailableCourses" class="retry-button">Retry</button>
          </div>

          <!-- Course Selection Form -->
          <form v-if="!coursesLoading && !coursesError" @submit.prevent="submitAddCourse">
            <div class="form-group">
              <label for="courseSelect">Course:</label>
              <select 
                id="courseSelect" 
                v-model="selectedCourseId" 
                class="form-select"
                required
              >
                <option value="">Select a course...</option>
                <option 
                  v-for="course in availableCourses" 
                  :key="course.id" 
                  :value="String(course.id)"
                >
                  {{ formatCourseOption(course) }}
                </option>
              </select>
              
              <!-- Show selected course info -->
              <div v-if="selectedCourseId" class="selected-course-info">
                <small class="text-muted">
                  Selected: {{ getSelectedCourseName() }}
                </small>
              </div>
            </div>

            <div class="form-group">
              <label for="paymentType">Payment Type:</label>
              <select 
                id="paymentType" 
                v-model="paymentType" 
                class="form-select"
                required
              >
                <option value="">Select payment type...</option>
                <option value="unique">Unique Payment</option>
                <option value="trimestral">Trimestral Payment</option>
              </select>
            </div>

            <!-- Unique Payment Fields -->
            <div v-if="paymentType === 'unique'" class="form-group">
              <label for="uniquePrice">Price (€):</label>
              <input 
                id="uniquePrice"
                v-model="uniquePrice" 
                type="number" 
                step="0.01" 
                min="0"
                class="form-input"
                placeholder="Enter the total price"
                required
              >
            </div>

            <!-- Trimestral Payment Fields -->
            <div v-if="paymentType === 'trimestral'" class="trimestral-payments">
              <h4>Trimestral Payment Amounts</h4>
              <div class="trimester-grid">
                <div class="form-group">
                  <label for="firstTrimester">1st Trimester (€):</label>
                  <input 
                    id="firstTrimester"
                    v-model="firstTrimesterPrice" 
                    type="number" 
                    step="0.01" 
                    min="0"
                    class="form-input"
                    placeholder="First trimester amount"
                  >
                </div>
                <div class="form-group">
                  <label for="secondTrimester">2nd Trimester (€):</label>
                  <input 
                    id="secondTrimester"
                    v-model="secondTrimesterPrice" 
                    type="number" 
                    step="0.01" 
                    min="0"
                    class="form-input"
                    placeholder="Second trimester amount"
                  >
                </div>
                <div class="form-group">
                  <label for="thirdTrimester">3rd Trimester (€):</label>
                  <input 
                    id="thirdTrimester"
                    v-model="thirdTrimesterPrice" 
                    type="number" 
                    step="0.01" 
                    min="0"
                    class="form-input"
                    placeholder="Third trimester amount"
                  >
                </div>
              </div>
              
              <!-- Show total for trimestral -->
              <div v-if="trimestralTotal > 0" class="total-info">
                <strong>Total: €{{ trimestralTotal.toFixed(2) }}</strong>
              </div>
            </div>

            <div class="form-actions">
              <button type="button" @click="closeAddCourseModal" class="btn-secondary">
                Cancel
              </button>
              <button type="submit" class="btn-primary" :disabled="!isFormValid">
                Add Course
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAssociateManage } from '../composables/useAssociateManage.js'
import { coursesService } from '../services/coursesService.js'
import { associatesService } from '../services/associatesService.js'

// Router
const route = useRoute()
const router = useRouter()

// Get associate ID from route params
const associateId = route.params.id

// Use the associate manage composable
const {
  associate,
  loading,
  error,
  fetchAssociate,
  clearError
} = useAssociateManage()

// Modal and course selection state
const showAddCourseModal = ref(false)
const availableCourses = ref([])
const coursesLoading = ref(false)
const coursesError = ref(null)
const selectedCourseId = ref('')

// Payment form state
const paymentType = ref('')
const uniquePrice = ref('')
const firstTrimesterPrice = ref('')
const secondTrimesterPrice = ref('')
const thirdTrimesterPrice = ref('')

// Load associate details when component mounts
onMounted(async () => {
  if (associateId) {
    await fetchAssociate(associateId)
  } else {
    error.value = 'No associate ID provided'
  }
})

// Methods
const goBack = () => {
  router.push('/associates')
}

const fetchAssociateDetails = async () => {
  if (associateId) {
    await fetchAssociate(associateId)
  }
}

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const formatCourseOption = (course) => {
  const startDate = formatDate(course.startDate)
  const endDate = formatDate(course.endDate)
  return `${course.name} - ${startDate} - ${endDate}`
}

const getSelectedCourseName = () => {
  if (!selectedCourseId.value) return ''
  const selectedCourse = availableCourses.value.find(course => String(course.id) === selectedCourseId.value)
  return selectedCourse ? formatCourseOption(selectedCourse) : ''
}

// Computed properties for payment form
const trimestralTotal = computed(() => {
  const first = parseFloat(firstTrimesterPrice.value) || 0
  const second = parseFloat(secondTrimesterPrice.value) || 0
  const third = parseFloat(thirdTrimesterPrice.value) || 0
  return first + second + third
})

const isFormValid = computed(() => {
  if (!selectedCourseId.value || !paymentType.value) return false
  
  if (paymentType.value === 'unique') {
    return uniquePrice.value && parseFloat(uniquePrice.value) > 0
  }
  
  if (paymentType.value === 'trimestral') {
    // At least 1 out of 3 trimesters must be specified
    const validTrimesters = [
      firstTrimesterPrice.value && parseFloat(firstTrimesterPrice.value) > 0,
      secondTrimesterPrice.value && parseFloat(secondTrimesterPrice.value) > 0,
      thirdTrimesterPrice.value && parseFloat(thirdTrimesterPrice.value) > 0
    ].filter(Boolean)
    
    return validTrimesters.length >= 1
  }
  
  return false
})

// Function to check if all payments for a course are settled
const isCoursePaid = (course) => {
  if (!course.payments || course.payments.length === 0) {
    return false
  }
  
  // Check if every payment has a paymentDate
  return course.payments.every(payment => payment.paymentDate)
}

const addCourse = async () => {
  showAddCourseModal.value = true
  await fetchAvailableCourses()
}

const closeAddCourseModal = () => {
  showAddCourseModal.value = false
  selectedCourseId.value = ''
  paymentType.value = ''
  uniquePrice.value = ''
  firstTrimesterPrice.value = ''
  secondTrimesterPrice.value = ''
  thirdTrimesterPrice.value = ''
  coursesError.value = null
}

const fetchAvailableCourses = async () => {
  coursesLoading.value = true
  coursesError.value = null
  
  try {
    const response = await coursesService.getActiveCourses()
    
    // Handle different response structures
    if (Array.isArray(response)) {
      availableCourses.value = response
    } else if (response.data && Array.isArray(response.data)) {
      availableCourses.value = response.data
    } else {
      availableCourses.value = []
      coursesError.value = 'Invalid response format'
    }
  } catch (err) {
    console.error('Failed to fetch available courses:', err)
    coursesError.value = err.response?.data?.message || err.message || 'Failed to fetch courses'
    availableCourses.value = []
  } finally {
    coursesLoading.value = false
  }
}

const submitAddCourse = async () => {
  if (!isFormValid.value) {
    return
  }
  
  const selectedCourse = availableCourses.value.find(course => course.id === parseInt(selectedCourseId.value))
  
  if (selectedCourse) {
    // Prepare the payload based on payment type
    let payments = []
    
    if (paymentType.value === 'unique') {
      payments = [{
        paymentType: 'unique',
        amount: parseFloat(uniquePrice.value)
      }]
    } else if (paymentType.value === 'trimestral') {
      // Only include trimesters with valid amounts
      if (firstTrimesterPrice.value && parseFloat(firstTrimesterPrice.value) > 0) {
        payments.push({
          paymentType: 'trimestral_first',
          amount: parseFloat(firstTrimesterPrice.value)
        })
      }
      if (secondTrimesterPrice.value && parseFloat(secondTrimesterPrice.value) > 0) {
        payments.push({
          paymentType: 'trimestral_second',
          amount: parseFloat(secondTrimesterPrice.value)
        })
      }
      if (thirdTrimesterPrice.value && parseFloat(thirdTrimesterPrice.value) > 0) {
        payments.push({
          paymentType: 'trimestral_third',
          amount: parseFloat(thirdTrimesterPrice.value)
        })
      }
    }
    
    const courseData = {
      courseId: selectedCourse.id,
      payments: payments
    }
    
    try {
      // Make API call to add course to associate
      await associatesService.addCourseToAssociate(associate.value.id, courseData)
      
      console.log('Course added successfully:', {
        associate: associate.value,
        course: selectedCourse,
        payments: payments
      })
      
      // Refresh associate data to show the new course
      await fetchAssociate(associateId)
      
      // Close modal
      closeAddCourseModal()
      
    } catch (err) {
      console.error('Failed to add course to associate:', err)
      // Handle error - could show a notification or error message
      const errorMessage = err.response?.data?.error || err.message || 'Unknown error'
      alert(`Failed to add course to associate: ${errorMessage}`)
    }
  }
}

const manageCourse = (course) => {
  console.log('Manage course:', course, 'for associate:', associate.value)
  // TODO: Implement manage course functionality
  // Could open a modal with course manage form
}

const removeCourse = async (course) => {
  const confirmed = confirm(`Are you sure you want to remove ${course.name} from this associate?`)
  
  if (confirmed) {
    console.log('Remove course:', course, 'from associate:', associate.value)
    // TODO: Implement remove course functionality
    // Make API call to remove course from associate
  }
}

const markFeePaid = async () => {
  const confirmed = confirm(`Are you sure you want to mark the fee as paid for ${associate.value.user.name}?`)

  if (confirmed) {
    try {
      // Make API call to mark fee as paid
      await associatesService.markFeePaid(associate.value.id)
      
      console.log('Fee marked as paid for associate:', associate.value)
      
      // Refresh associate data to show updated fee status
      await fetchAssociate(associateId)
      
    } catch (err) {
      console.error('Failed to mark fee as paid:', err)
      const errorMessage = err.response?.data?.error || err.message || 'Unknown error'
      alert(`Failed to mark fee as paid: ${errorMessage}`)
    }
  }
}

const sendFeeEmail = async () => {
  const confirmed = confirm(`Send annual fee reminder email to ${associate.value.user.email}?`)

  if (confirmed) {
    console.log('Send fee email for associate:', associate.value)
    // TODO: Implement send email functionality
    // Make API call to send reminder email for annual fee payment
  }
}
</script>

<style scoped>
.associate-manage-page {
  padding: 1rem;
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
}

.back-btn {
  padding: 0.5rem 1rem;
  background: #6c757d;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.back-btn:hover {
  background: #5a6268;
}

.page-header h1 {
  margin: 0;
  color: #333;
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

.associate-details {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.details-card,
.actions-card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
}

.details-card h2,
.actions-card h2 {
  margin: 0 0 1.5rem 0;
  color: #333;
  border-bottom: 2px solid #007bff;
  padding-bottom: 0.5rem;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1rem;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.info-item label {
  font-weight: 600;
  color: #555;
  font-size: 0.9rem;
}

.info-item span {
  font-size: 1rem;
  color: #333;
  padding: 0.5rem;
  background: #f8f9fa;
  border-radius: 4px;
  border: 1px solid #e9ecef;
}

.fee-status {
  font-weight: bold;
  font-size: 1.2rem;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 40px;
}

.fee-status.paid {
  color: #28a745;
  background: #d4edda;
  border-color: #c3e6cb;
}

.fee-status.unpaid {
  color: #dc3545;
  background: #f8d7da;
  border-color: #f5c6cb;
}

.fee-status-container {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.fee-action-btn {
  padding: 0.375rem 0.75rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.85rem;
  font-weight: 500;
  background: #28a745;
  color: white;
  transition: background-color 0.2s;
}

.fee-action-btn:hover:not(:disabled) {
  background: #218838;
}

.fee-action-btn.disabled,
.fee-action-btn:disabled {
  background: #6c757d;
  cursor: not-allowed;
  opacity: 0.6;
}

.fee-action-btn.email-btn {
  background: #17a2b8;
  color: white;
}

.fee-action-btn.email-btn:hover {
  background: #138496;
}

.action-buttons {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.action-btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 500;
  transition: background-color 0.2s;
}

.courses-btn {
  background: #28a745;
  color: white;
}

.courses-btn:hover {
  background: #218838;
}

/* Course Management Styles */
.add-course-section {
  margin-bottom: 1.5rem;
}

.add-course-btn {
  background: #17a2b8;
  color: white;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 500;
  transition: background-color 0.2s;
}

.add-course-btn:hover {
  background: #138496;
}

.courses-table-container {
  margin-bottom: 2rem;
  overflow-x: auto;
}

.courses-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
  background: white;
}

.courses-table th,
.courses-table td {
  padding: 0.75rem;
  text-align: left;
  border-bottom: 1px solid #dee2e6;
}

.courses-table th {
  background: #f8f9fa;
  font-weight: 600;
  color: #333;
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

.course-row:hover {
  background: #f8f9fa;
}

.course-actions {
  white-space: nowrap;
}

.course-action-btn {
  padding: 0.25rem 0.75rem;
  margin: 0 0.25rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.8rem;
  font-weight: 500;
}

.manage-course-btn {
  background: #007bff;
  color: white;
}

.manage-course-btn:hover {
  background: #0056b3;
}

.remove-course-btn {
  background: #dc3545;
  color: white;
}

.remove-course-btn:hover {
  background: #c82333;
}

.empty-courses {
  text-align: center;
  padding: 2rem;
  color: #666;
  background: #f8f9fa;
  border-radius: 4px;
  margin-bottom: 2rem;
}

.other-actions {
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 2px solid #e9ecef;
}

.other-actions h3 {
  margin: 0 0 1rem 0;
  color: #333;
  font-size: 1.1rem;
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
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  max-width: 500px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e9ecef;
}

.modal-header h3 {
  margin: 0;
  color: #333;
}

.modal-close-btn {
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
}

.modal-close-btn:hover {
  color: #000;
}

.modal-body {
  padding: 1.5rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #333;
}

.form-select {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  background: white;
  color: #333;
}

.form-input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  background: white;
  color: #333;
}

.form-select:focus,
.form-input:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
}

.trimestral-payments {
  margin-top: 1rem;
}

.trimestral-payments h4 {
  margin: 0 0 1rem 0;
  color: #333;
  font-size: 1rem;
  border-bottom: 1px solid #e9ecef;
  padding-bottom: 0.5rem;
}

.trimester-grid {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1rem;
}

.total-info {
  text-align: right;
  padding: 0.75rem;
  background: #f8f9fa;
  border-radius: 4px;
  border: 1px solid #e9ecef;
  color: #333;
}

.selected-course-info {
  margin-top: 0.5rem;
}

.text-muted {
  color: #6c757d;
  font-style: italic;
}

.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 2rem;
}

.btn-primary,
.btn-secondary {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 500;
  transition: background-color 0.2s;
}

.btn-primary {
  background: #007bff;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #0056b3;
}

.btn-primary:disabled {
  background: #6c757d;
  cursor: not-allowed;
}

.btn-secondary {
  background: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background: #5a6268;
}

/* Responsive design */
@media (max-width: 768px) {
  .info-grid {
    grid-template-columns: 1fr;
  }
  
  .action-buttons {
    flex-direction: column;
  }
  
  .action-btn {
    width: 100%;
  }
}
</style>
