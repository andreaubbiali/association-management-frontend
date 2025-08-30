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
                <th>Price</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="course in associate.courses" :key="course.name" class="course-row">
                <td>{{ course.name }}</td>
                <td>{{ course.type }}</td>
                <td>{{ formatDate(course.startDate) }}</td>
                <td>{{ formatDate(course.endDate) }}</td>
                <td>€{{ course.price }}</td>
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
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAssociateManage } from '../composables/useAssociateManage.js'

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

const addCourse = () => {
  console.log('Add course for associate:', associate.value)
  // TODO: Implement add course functionality
  // Could open a modal or navigate to add course form
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
    console.log('Mark fee as paid for associate:', associate.value)
    // TODO: Implement mark fee as paid functionality
    // Make API call to update annualFeePaid to true
    // associate.value.annualFeePaid = true
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
