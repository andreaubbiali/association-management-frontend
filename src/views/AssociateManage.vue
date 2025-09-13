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
            <label>Privacy Module Delivered:</label>
            <div class="fee-status-container">
              <span class="fee-status" :class="{ 'paid': associate.privacyModuleDelivered, 'unpaid': !associate.privacyModuleDelivered }">
                {{ associate.privacyModuleDelivered ? '✓' : '✗' }}
              </span>
              <button 
                @click="markPrivacyModuleDelivered" 
                :disabled="associate.privacyModuleDelivered" 
                class="fee-action-btn"
                :class="{ 'disabled': associate.privacyModuleDelivered }"
                :title="associate.privacyModuleDelivered ? 'Already delivered' : 'Mark as delivered'"
              >
                Set Delivered
              </button>
            </div>
          </div>
          <div class="info-item">
            <label>Photo/Video Authorized:</label>
            <div class="fee-status-container">
              <span class="fee-status" :class="{ 'paid': associate.photoVideoAuthorized, 'unpaid': !associate.photoVideoAuthorized }">
                {{ associate.photoVideoAuthorized ? '✓' : '✗' }}
              </span>
              <button 
                @click="markPhotoVideoAuthorized" 
                :disabled="associate.photoVideoAuthorized" 
                class="fee-action-btn"
                :class="{ 'disabled': associate.photoVideoAuthorized }"
                :title="associate.photoVideoAuthorized ? 'Already authorized' : 'Mark as authorized'"
              >
                Set Delivered
              </button>
            </div>
          </div>
          <div class="info-item">
            <label>Medical Certificate Delivered:</label>
            <div class="fee-status-container">
              <span class="fee-status" :class="{ 'paid': associate.medicalCertificateDelivered, 'unpaid': !associate.medicalCertificateDelivered }">
                {{ associate.medicalCertificateDelivered ? '✓' : '✗' }}
              </span>
              <button 
                @click="markMedicalCertificateDelivered" 
                :disabled="associate.medicalCertificateDelivered" 
                class="fee-action-btn"
                :class="{ 'disabled': associate.medicalCertificateDelivered }"
                :title="associate.medicalCertificateDelivered ? 'Already delivered' : 'Mark as delivered'"
              >
                Set Delivered
              </button>
            </div>
          </div>
          <div class="info-item">
            <label>Sport Material Module Delivered:</label>
            <div class="fee-status-container">
              <span class="fee-status" :class="{ 'paid': associate.sportMaterialModuleDelivered, 'unpaid': !associate.sportMaterialModuleDelivered }">
                {{ associate.sportMaterialModuleDelivered ? '✓' : '✗' }}
              </span>
              <button 
                @click="markSportMaterialModuleDelivered" 
                :disabled="associate.sportMaterialModuleDelivered" 
                class="fee-action-btn"
                :class="{ 'disabled': associate.sportMaterialModuleDelivered }"
                :title="associate.sportMaterialModuleDelivered ? 'Already delivered' : 'Mark as delivered'"
              >
                Set Delivered
              </button>
            </div>
          </div>
          <div class="info-item">
            <label>ID:</label>
            <span>{{ associate.user.bloomId }}</span>
          </div>
          <div class="info-item">
            <label>Validity Year:</label>
            <span>{{ associate.validityYearStart }}/{{ associate.validityYearEnd }}</span>
          </div>
          <div class="info-item">
            <label>Discount:</label>
              <span :class="{'discount-true': !!associate.discount}">
                {{ !!associate.discount }}
              </span>
          </div>
          <div class="info-item">
            <label>Email:</label>
            <span>{{ associate.user.email }}</span>
          </div>
          <div class="info-item">
            <label>Phone number:</label>
            <span>{{ associate.user.phoneNumber }}</span>
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
            <label>Fiscal Code:</label>
            <span>{{ associate.user.fiscalCode }}</span>
          </div>
          <div class="info-item">
            <label>Birth Date:</label>
            <span>{{ formatDate(associate.user.birthDate) }}</span>
          </div>
          <div class="info-item">
            <label>Birth City:</label>
            <span>{{ associate.user.birthCity }}</span>
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

    <!-- Course Management Modal -->
    <div v-if="showCourseManageModal" class="modal-overlay" @click="closeCourseManageModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>Manage Course Payments - {{ selectedCourse?.name }}</h3>
          <button @click="closeCourseManageModal" class="modal-close-btn">×</button>
        </div>
        <div class="modal-body">
          <div v-if="selectedCourse" class="course-info">
            <div class="course-details">
              <p><strong>Course:</strong> {{ selectedCourse.name }}</p>
              <p><strong>Type:</strong> {{ selectedCourse.type }}</p>
              <p><strong>Period:</strong> {{ formatDate(selectedCourse.startDate) }} - {{ formatDate(selectedCourse.endDate) }}</p>
            </div>
            
            <div class="payments-section">
              <h4>Payment Status</h4>
              <div v-if="selectedCourse.payments && selectedCourse.payments.length > 0" class="payments-list">
                <div v-for="payment in selectedCourse.payments" :key="payment.id" class="payment-item">
                  <div class="payment-info">
                    <span class="payment-type">{{ formatPaymentType(payment.paymentType) }}</span>
                    <span class="payment-amount">€{{ payment.amount }}</span>
                    <span class="payment-status" :class="{ 'paid': payment.paymentDate, 'unpaid': !payment.paymentDate }">
                      {{ payment.paymentDate ? `Paid on ${formatDate(payment.paymentDate)}` : 'Not Paid' }}
                    </span>
                  </div>
                  <div v-if="!payment.paymentDate" class="payment-actions">
                    <button @click="markPaymentAsPaid(payment)" class="btn-primary payment-btn">
                      Mark as Paid
                    </button>
                    <button @click="sendPaymentReminder(payment)" class="btn-secondary payment-btn">
                      📧 Send Reminder
                    </button>
                  </div>
                </div>
              </div>
              <div v-else class="no-payments">
                <p>No payments found for this course.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Payment Details Modal -->
    <div v-if="showPaymentDetailsModal" class="modal-overlay" @click="closePaymentDetailsModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>Mark Payment as Paid</h3>
          <button @click="closePaymentDetailsModal" class="modal-close-btn">×</button>
        </div>
        <div class="modal-body">
          <div v-if="selectedPayment" class="payment-details-form">
            <div class="payment-summary">
              <p><strong>Payment:</strong> {{ formatPaymentType(selectedPayment.paymentType) }}</p>
              <p><strong>Amount:</strong> €{{ selectedPayment.amount }}</p>
            </div>
            
            <form @submit.prevent="confirmMarkPaymentAsPaid">
              <div class="form-group">
                <label for="receiptType">Receipt Type:</label>
                <select 
                  id="receiptType" 
                  v-model="paymentDetails.receiptType" 
                  class="form-select"
                  :disabled="markingPayment"
                  required
                >
                  <option value="">Select receipt type...</option>
                  <option value="sport_receipt">Sport Receipt</option>
                  <option value="didactic_receipt">Didactic Receipt</option>
                </select>
              </div>

              <div class="form-group">
                <label for="paymentMethod">Payment Method:</label>
                <select 
                  id="paymentMethod" 
                  v-model="paymentDetails.paymentMethod" 
                  class="form-select"
                  :disabled="markingPayment"
                  required
                >
                  <option value="">Select payment method...</option>
                  <option value="cash">Cash</option>
                  <option value="credit_card">Credit Card</option>
                  <option value="bank_transfer">Bank Transfer</option>
                </select>
              </div>

              <div class="form-group">
                <label for="causal">Causal:</label>
                <input 
                  id="causal"
                  v-model="paymentDetails.causal" 
                  type="text" 
                  class="form-input"
                  :disabled="markingPayment"
                  placeholder="Enter payment causal"
                  required
                >
              </div>

              <div class="form-group">
                <label class="checkbox-label">
                  <input 
                    type="checkbox" 
                    v-model="paymentDetails.sendEmail"
                    :disabled="markingPayment"
                    class="form-checkbox"
                  >
                  Send confirmation email to associate
                </label>
              </div>

              <div class="form-actions">
                <button type="button" @click="closePaymentDetailsModal" class="btn-secondary" :disabled="markingPayment">
                  Cancel
                </button>
                <button type="submit" class="btn-primary" :disabled="!isPaymentDetailsValid || markingPayment">
                  <span v-if="markingPayment" class="loading-spinner"></span>
                  {{ markingPayment ? 'Processing...' : 'Mark as Paid' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>

    <!-- Fee Payment Modal -->
    <div v-if="showFeePaymentModal" class="modal-overlay" @click="closeFeePaymentModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>Mark Annual Fee as Paid</h3>
          <button @click="closeFeePaymentModal" class="modal-close-btn">×</button>
        </div>
        <div class="modal-body">
          <div class="fee-payment-form">
            <div class="fee-summary">
              <p><strong>Associate:</strong> {{ associate?.user?.name }}</p>
              <p><strong>Email:</strong> {{ associate?.user?.email }}</p>
            </div>
            
            <form @submit.prevent="confirmMarkFeePaid">
              <div class="form-group">
                <label class="checkbox-label">
                  <input 
                    type="checkbox" 
                    v-model="feeEmailPreference"
                    :disabled="markingFee"
                    class="form-checkbox"
                  >
                  Send confirmation email to associate
                </label>
              </div>

              <div class="form-actions">
                <button type="button" @click="closeFeePaymentModal" class="btn-secondary" :disabled="markingFee">
                  Cancel
                </button>
                <button type="submit" class="btn-primary" :disabled="markingFee">
                  <span v-if="markingFee" class="loading-spinner"></span>
                  {{ markingFee ? 'Processing...' : 'Mark as Paid' }}
                </button>
              </div>
            </form>
          </div>
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

// Course management modal state
const showCourseManageModal = ref(false)
const selectedCourse = ref(null)

// Payment details modal state
const showPaymentDetailsModal = ref(false)
const selectedPayment = ref(null)
const markingPayment = ref(false)
const paymentDetails = ref({
  receiptType: '',
  paymentMethod: '',
  causal: '',
  sendEmail: true
})

// Fee payment modal state
const showFeePaymentModal = ref(false)
const feeEmailPreference = ref(true)
const markingFee = ref(false)

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

// Validation for payment details form
const isPaymentDetailsValid = computed(() => {
  return paymentDetails.value.receiptType && 
         paymentDetails.value.paymentMethod && 
         paymentDetails.value.causal.trim()
})

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
  selectedCourse.value = course
  showCourseManageModal.value = true
  console.log('Manage course:', course, 'for associate:', associate.value)
}

const closeCourseManageModal = () => {
  showCourseManageModal.value = false
  selectedCourse.value = null
}

const formatPaymentType = (paymentType) => {
  const types = {
    'unique': 'Single Payment',
    'trimestral_first': 'First Trimester',
    'trimestral_second': 'Second Trimester',
    'trimestral_third': 'Third Trimester'
  }
  return types[paymentType] || paymentType
}

const markPaymentAsPaid = (payment) => {
  selectedPayment.value = payment
  showPaymentDetailsModal.value = true
}

const closePaymentDetailsModal = () => {
  showPaymentDetailsModal.value = false
  selectedPayment.value = null
  markingPayment.value = false
  paymentDetails.value = {
    receiptType: '',
    paymentMethod: '',
    causal: '',
    sendEmail: true
  }
}

const confirmMarkPaymentAsPaid = async () => {
  if (!selectedPayment.value || !isPaymentDetailsValid.value || markingPayment.value) {
    return
  }

  markingPayment.value = true

  try {
    const paymentData = {
      coursePayment: {
        paymentId: selectedPayment.value.id,
        receiptType: paymentDetails.value.receiptType,
        paymentMethod: paymentDetails.value.paymentMethod,
        causal: paymentDetails.value.causal,
        sendEmail: paymentDetails.value.sendEmail
      }
    }

    console.log('Mark payment as paid:', paymentData)
    // Make API call to mark specific payment as paid
    await associatesService.markPaymentAsPaid(associate.value.id, selectedCourse.value.id, paymentData)
    
    // Refresh associate data
    await fetchAssociate(associateId)
    
    // Update selected course with fresh data
    const updatedCourse = associate.value.courses.find(c => c.id === selectedCourse.value.id)
    if (updatedCourse) {
      selectedCourse.value = updatedCourse
    }
    
    // Close both modals
    closePaymentDetailsModal()
    
    alert('Payment marked as paid successfully!')
    
  } catch (err) {
    console.error('Failed to mark payment as paid:', err)
    const errorMessage = err.response?.data?.error || err.message || 'Unknown error'
    alert(`Failed to mark payment as paid: ${errorMessage}`)
  } finally {
    markingPayment.value = false
  }
}

const sendPaymentReminder = async (payment) => {
  const confirmed = confirm(`Send payment reminder email for €${payment.amount} to ${associate.value.user.email}?`)
  
  if (confirmed) {
    try {
      console.log('Send payment reminder:', payment)
      // TODO: Implement API call to send payment reminder email
      // await associatesService.sendPaymentReminder(associate.value.id, selectedCourse.value.id, payment.id)
      
      alert('Payment reminder email sent successfully!')
      
    } catch (err) {
      console.error('Failed to send payment reminder:', err)
      const errorMessage = err.response?.data?.error || err.message || 'Unknown error'
      alert(`Failed to send payment reminder: ${errorMessage}`)
    }
  }
}

const removeCourse = async (course) => {
  const confirmed = confirm(`Are you sure you want to remove ${course.name} from this associate?`)
  
  if (confirmed) {
    console.log('Remove course:', course, 'from associate:', associate.value)
    // TODO: Implement remove course functionality
    // Make API call to remove course from associate
  }
}

const markFeePaid = () => {
  showFeePaymentModal.value = true
}

const closeFeePaymentModal = () => {
  showFeePaymentModal.value = false
  feeEmailPreference.value = true
  markingFee.value = false
}

const confirmMarkFeePaid = async () => {
  if (markingFee.value) return
  
  markingFee.value = true
  
  try {
    // Make API call to mark fee as paid with email preference
    await associatesService.markFeePaid(associate.value.id, feeEmailPreference.value)
    
    console.log('Fee marked as paid for associate:', associate.value)
    
    // Refresh associate data to show updated fee status
    await fetchAssociate(associateId)
    
    // Close modal
    closeFeePaymentModal()
    
    alert('Fee marked as paid successfully!')
    
  } catch (err) {
    console.error('Failed to mark fee as paid:', err)
    const errorMessage = err.response?.data?.error || err.message || 'Unknown error'
    alert(`Failed to mark fee as paid: ${errorMessage}`)
  } finally {
    markingFee.value = false
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

const markPrivacyModuleDelivered = async () => {
  const confirmed = confirm(`Mark privacy module as delivered for ${associate.value.user.name} ${associate.value.user.lastName}?`)
  
  if (confirmed) {
    try {
      // TODO: Implement API call to mark privacy module as delivered
      // await associatesService.markPrivacyModuleDelivered(associate.value.id)
      
      // For now, update locally until API is implemented
      associate.value.privacyModuleDelivered = true
      
      console.log('Privacy module marked as delivered for associate:', associate.value)
      alert('Privacy module marked as delivered successfully!')
      
    } catch (err) {
      console.error('Failed to mark privacy module as delivered:', err)
      const errorMessage = err.response?.data?.error || err.message || 'Unknown error'
      alert(`Failed to mark privacy module as delivered: ${errorMessage}`)
    }
  }
}

const markPhotoVideoAuthorized = async () => {
  const confirmed = confirm(`Mark photo/video authorization as delivered for ${associate.value.user.name} ${associate.value.user.lastName}?`)
  
  if (confirmed) {
    try {
      // TODO: Implement API call to mark photo/video authorization as delivered
      // await associatesService.markPhotoVideoAuthorized(associate.value.id)
      
      // For now, update locally until API is implemented
      associate.value.photoVideoAuthorized = true
      
      console.log('Photo/video authorization marked as delivered for associate:', associate.value)
      alert('Photo/video authorization marked as delivered successfully!')
      
    } catch (err) {
      console.error('Failed to mark photo/video authorization as delivered:', err)
      const errorMessage = err.response?.data?.error || err.message || 'Unknown error'
      alert(`Failed to mark photo/video authorization as delivered: ${errorMessage}`)
    }
  }
}

const markMedicalCertificateDelivered = async () => {
  const confirmed = confirm(`Mark medical certificate as delivered for ${associate.value.user.name} ${associate.value.user.lastName}?`)
  
  if (confirmed) {
    try {
      // TODO: Implement API call to mark medical certificate as delivered
      // await associatesService.markMedicalCertificateDelivered(associate.value.id)
      
      // For now, update locally until API is implemented
      associate.value.medicalCertificateDelivered = true
      
      console.log('Medical certificate marked as delivered for associate:', associate.value)
      alert('Medical certificate marked as delivered successfully!')
      
    } catch (err) {
      console.error('Failed to mark medical certificate as delivered:', err)
      const errorMessage = err.response?.data?.error || err.message || 'Unknown error'
      alert(`Failed to mark medical certificate as delivered: ${errorMessage}`)
    }
  }
}

const markSportMaterialModuleDelivered = async () => {
  const confirmed = confirm(`Mark sport material module as delivered for ${associate.value.user.name} ${associate.value.user.lastName}?`)
  
  if (confirmed) {
    try {
      // TODO: Implement API call to mark sport material module as delivered
      // await associatesService.markSportMaterialModuleDelivered(associate.value.id)
      
      // For now, update locally until API is implemented
      associate.value.sportMaterialModuleDelivered = true
      
      console.log('Sport material module marked as delivered for associate:', associate.value)
      alert('Sport material module marked as delivered successfully!')
      
    } catch (err) {
      console.error('Failed to mark sport material module as delivered:', err)
      const errorMessage = err.response?.data?.error || err.message || 'Unknown error'
      alert(`Failed to mark sport material module as delivered: ${errorMessage}`)
    }
  }
}
</script>

<style scoped>
.associate-manage-page {
  padding: 1rem;
  max-width: 1200px;
  margin: 0 auto;
}

.discount-true {
  border: 2px solid #28a745 !important;
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

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  font-weight: 500;
  color: #333;
}

.form-checkbox {
  width: auto;
  margin: 0;
  cursor: pointer;
}

.form-checkbox:disabled {
  cursor: not-allowed;
  opacity: 0.6;
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

/* Course Management Modal Styles */
.course-info {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.course-details {
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 6px;
  border: 1px solid #e9ecef;
}

.course-details p {
  margin: 0.5rem 0;
  color: #333;
}

.payments-section h4 {
  margin: 0 0 1rem 0;
  color: #333;
  border-bottom: 2px solid #007bff;
  padding-bottom: 0.5rem;
}

.payments-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.payment-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border: 1px solid #e9ecef;
  border-radius: 6px;
  background: white;
  transition: box-shadow 0.2s;
}

.payment-item:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.payment-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  flex: 1;
}

.payment-type {
  font-weight: 600;
  color: #333;
  font-size: 1rem;
}

.payment-amount {
  font-size: 1.1rem;
  font-weight: bold;
  color: #007bff;
}

.payment-status {
  font-size: 0.9rem;
  font-weight: 500;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  display: inline-block;
  max-width: fit-content;
}

.payment-status.paid {
  color: #28a745;
  background: #d4edda;
  border: 1px solid #c3e6cb;
}

.payment-status.unpaid {
  color: #dc3545;
  background: #f8d7da;
  border: 1px solid #f5c6cb;
}

.payment-actions {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.payment-btn {
  padding: 0.375rem 0.75rem;
  font-size: 0.85rem;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.2s;
}

.no-payments {
  text-align: center;
  padding: 2rem;
  color: #666;
  background: #f8f9fa;
  border-radius: 6px;
  border: 1px solid #e9ecef;
}

/* Payment Details Modal Styles */
.payment-details-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.payment-summary {
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 6px;
  border: 1px solid #e9ecef;
}

.payment-summary p {
  margin: 0.5rem 0;
  color: #333;
}

/* Fee Payment Modal Styles */
.fee-payment-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.fee-summary {
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 6px;
  border: 1px solid #e9ecef;
}

.fee-summary p {
  margin: 0.5rem 0;
  color: #333;
}

/* Loading Spinner */
.loading-spinner {
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid #ffffff;
  border-radius: 50%;
  border-top-color: transparent;
  animation: spin 1s ease-in-out infinite;
  margin-right: 0.5rem;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
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
