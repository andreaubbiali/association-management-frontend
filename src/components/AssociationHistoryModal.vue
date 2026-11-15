<template>
  <div v-if="visible" class="modal-overlay">
    <div class="modal-content">
      <div class="modal-header">
        <h2>Association History</h2>
        <button @click="close" class="close-btn" title="Close">✕</button>
      </div>

      <div v-if="history.length === 0" class="empty-state">
        <p>No association history found.</p>
      </div>

      <template v-else>
        <table class="history-table">
          <thead>
            <tr>
              <th>Validity Year</th>
              <th>Annual Fee Paid</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in displayedHistory" :key="item.id">
              <td>{{ item.validityYearStart }}/{{ item.validityYearEnd }}</td>
              <td class="payment-status">
                <span v-if="item.annualFeePaid" class="status-icon paid">✓</span>
                <span v-else class="status-icon unpaid">✗</span>
              </td>
            </tr>
          </tbody>
        </table>

        <div class="pagination">
          <button @click="onPreviousPage" :disabled="!hasPreviousPage" class="pagination-btn">
            Previous
          </button>
          <span class="pagination-info">
            Page {{ currentPage }} of {{ totalPages }}
          </span>
          <button @click="onNextPage" :disabled="!hasNextPage" class="pagination-btn">
            Next
          </button>
        </div>
      </template>

      <div class="modal-actions">
        <button @click="close" class="dismiss-btn">Dismiss</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { usePagination } from '../composables/usePagination.js'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  history: {
    type: Array,
    default: () => []
  },
  itemsPerPage: {
    type: Number,
    default: 10
  }
})

const emit = defineEmits(['close'])

const {
  currentPage,
  totalPages,
  hasNextPage,
  hasPreviousPage,
  goToNextPage,
  goToPreviousPage
} = usePagination({
  totalCount: computed(() => props.history.length),
  itemsPerPage: computed(() => props.itemsPerPage)
})

// Computed, not a ref assigned once at setup time -- the modal is mounted
// before UserDetail.vue's fetchAssociateHistory() resolves, and history can
// also grow later (a newly-created associate prepended), so this must stay
// reactive to the `history` prop, not just to pagination clicks.
const displayedHistory = computed(() =>
  props.history.slice((currentPage.value - 1) * props.itemsPerPage, currentPage.value * props.itemsPerPage)
)

const onNextPage = () => {
  goToNextPage()
}

const onPreviousPage = () => {
  goToPreviousPage()
}

const close = () => {
  emit('close')
}
</script>

<style scoped>
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
  padding: 1.5rem;
  max-width: 600px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 2px solid #007bff;
  padding-bottom: 0.5rem;
  margin-bottom: 1rem;
}

.modal-header h2 {
  margin: 0;
  color: #333;
}

.close-btn {
  border: none;
  background: transparent;
  font-size: 1.2rem;
  cursor: pointer;
  color: #555;
}

.empty-state {
  text-align: center;
  padding: 2rem;
  color: #666;
}

.history-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
  margin-bottom: 1rem;
}

.history-table th,
.history-table td {
  padding: 0.75rem;
  text-align: left;
  border-bottom: 1px solid #dee2e6;
}

.history-table th {
  background: #f8f9fa;
  font-weight: 600;
  color: #333;
}

.payment-status {
  text-align: center;
}

.status-icon {
  font-weight: bold;
}

.status-icon.paid {
  color: #28a745;
}

.status-icon.unpaid {
  color: #dc3545;
}

.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
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

.pagination-btn:disabled {
  background: #6c757d;
  cursor: not-allowed;
}

.pagination-info {
  margin: 0 1rem;
  font-weight: 500;
  color: #333;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
}

.dismiss-btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  background: #6c757d;
  color: white;
  cursor: pointer;
}
</style>
