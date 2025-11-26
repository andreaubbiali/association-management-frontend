<template>
  <div class="reports-page">
    <!-- Main Content -->
    <div class="reports-container">
      <h1 class="reports-title">Report</h1>
      <p class="reports-subtitle">Scarica i report</p>
      
      <button 
        @click="showModal = true" 
        class="download-report-button"
        :disabled="loading"
      >
        {{ loading ? 'Scaricando...' : 'Scarica Report' }}
      </button>

      <!-- Error Message -->
      <div v-if="error" class="error-container">
        <p class="error-message">{{ error }}</p>
        <button @click="clearError" class="error-dismiss">Chiudi</button>
      </div>
    </div>

    <!-- Date Selection Modal -->
    <div v-if="showModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <h3 class="modal-title">Seleziona periodo</h3>
        
        <form @submit.prevent="handleExport" class="date-form">
          <div class="form-group">
            <label for="fromDate">Data inizio:</label>
            <input 
              id="fromDate"
              v-model="formData.fromDate" 
              type="date" 
              required 
              class="date-input"
            />
          </div>
          
          <div class="form-group">
            <label for="toDate">Data fine:</label>
            <input 
              id="toDate"
              v-model="formData.toDate" 
              type="date" 
              required 
              class="date-input"
            />
          </div>
          
          <div class="modal-actions">
            <button 
              type="button" 
              @click="closeModal" 
              class="cancel-button"
              :disabled="loading"
            >
              Annulla
            </button>
            <button 
              type="submit" 
              class="confirm-button"
              :disabled="loading || !isFormValid"
            >
              {{ loading ? 'Scaricando...' : 'Conferma' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, reactive } from 'vue'
import { exportTransactions } from '../services/reportsService.js'

// Reactive state
const showModal = ref(false)
const loading = ref(false)
const error = ref(null)

const formData = reactive({
  fromDate: '',
  toDate: ''
})

// Computed properties
const isFormValid = computed(() => {
  return formData.fromDate && formData.toDate && formData.fromDate <= formData.toDate
})

// Methods
const closeModal = () => {
  if (!loading.value) {
    showModal.value = false
    resetForm()
  }
}

const resetForm = () => {
  formData.fromDate = ''
  formData.toDate = ''
}

const clearError = () => {
  error.value = null
}

const downloadFile = (response, fromDate, toDate) => {
  let blob
  let filename = `transactions_export_${fromDate}_${toDate}`
  
  // Handle different response types
  if (response.data && response.data.downloadUrl) {
    // If the API returns a download URL, open it directly
    const link = document.createElement('a')
    link.href = response.data.downloadUrl
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    return
  }
  
  // Determine content type and file extension
  const contentType = response.headers['content-type'] || response.headers['Content-Type'] || ''
  
  if (contentType.includes('application/json')) {
    // If JSON response, convert to CSV or download as JSON
    blob = new Blob([JSON.stringify(response.data, null, 2)], { type: 'application/json' })
    filename += '.json'
  } else if (contentType.includes('text/csv') || contentType.includes('application/csv')) {
    // CSV file
    blob = new Blob([response.data], { type: 'text/csv' })
    filename += '.csv'
  } else if (contentType.includes('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')) {
    // Excel file
    blob = new Blob([response.data], { type: contentType })
    filename += '.xlsx'
  } else if (contentType.includes('application/pdf')) {
    // PDF file
    blob = new Blob([response.data], { type: 'application/pdf' })
    filename += '.pdf'
  } else {
    // Default to CSV for any other type
    blob = new Blob([response.data], { type: 'text/csv' })
    filename += '.csv'
  }
  
  // Create download link and trigger download
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.style.display = 'none'
  
  // Add to DOM, click, and remove
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  
  // Clean up the URL object
  window.URL.revokeObjectURL(url)
}

const handleExport = async () => {
  if (!isFormValid.value) return
  
  loading.value = true
  error.value = null
  
  try {
    const response = await exportTransactions(formData.fromDate, formData.toDate)
    
    // Handle successful response
    console.log('Export successful:', response.data)
    
    // Close modal and reset form
    showModal.value = false
    resetForm()
    
    // Download the file to the host
    downloadFile(response, formData.fromDate, formData.toDate)
    
  } catch (err) {
    console.error('Export failed:', err)
    error.value = err.response?.data?.message || 'Errore durante l\'esportazione del report'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.reports-page {
  min-height: calc(100vh - 80px);
  background: #fff;
}

.reports-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 3rem 2rem;
  text-align: center;
}

.reports-title {
  font-size: 2.5rem;
  color: #2c3e50;
  margin-bottom: 1rem;
  font-weight: 600;
}

.reports-subtitle {
  font-size: 1.25rem;
  color: #666;
  margin-bottom: 2.5rem;
}

.download-report-button {
  padding: 1rem 2rem;
  font-size: 1.1rem;
  background: #2c3e50;
  color: #fff;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-weight: 500;
}

.download-report-button:hover:not(:disabled) {
  background: #1a252f;
  transform: translateY(-1px);
}

.download-report-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.error-container {
  margin-top: 2rem;
  padding: 1rem;
  background: #fee;
  border: 1px solid #fcc;
  border-radius: 8px;
  text-align: left;
}

.error-message {
  color: #c33;
  margin: 0 0 1rem 0;
}

.error-dismiss {
  padding: 0.5rem 1rem;
  background: #c33;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
}

.error-dismiss:hover {
  background: #a22;
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
  border-radius: 12px;
  padding: 2rem;
  width: 90%;
  max-width: 400px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
}

.modal-title {
  color: #2c3e50;
  margin: 0 0 1.5rem 0;
  font-size: 1.5rem;
  text-align: center;
}

.date-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-weight: 500;
  color: #2c3e50;
  text-align: left;
}

.date-input {
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 1rem;
  transition: border-color 0.2s ease;
}

.date-input:focus {
  outline: none;
  border-color: #2c3e50;
  box-shadow: 0 0 0 2px rgba(44, 62, 80, 0.1);
}

.modal-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 1rem;
}

.cancel-button {
  padding: 0.75rem 1.5rem;
  background: #f8f9fa;
  color: #666;
  border: 1px solid #ddd;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s ease;
}

.cancel-button:hover:not(:disabled) {
  background: #e9ecef;
  border-color: #adb5bd;
}

.confirm-button {
  padding: 0.75rem 1.5rem;
  background: #2c3e50;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s ease;
}

.confirm-button:hover:not(:disabled) {
  background: #1a252f;
}

.confirm-button:disabled,
.cancel-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Responsive Design */
@media (max-width: 768px) {
  .reports-container {
    padding: 2rem 1rem;
  }
  
  .reports-title {
    font-size: 2rem;
  }
  
  .reports-subtitle {
    font-size: 1.1rem;
  }
  
  .modal-content {
    margin: 1rem;
    padding: 1.5rem;
  }
  
  .modal-actions {
    flex-direction: column;
  }
  
  .cancel-button,
  .confirm-button {
    width: 100%;
  }
}
</style>