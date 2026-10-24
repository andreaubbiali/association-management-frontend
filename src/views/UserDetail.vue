<template>
  <div class="user-detail-page">
    <!-- Navigation -->
    <div class="page-header">
      <button @click="goBack" class="back-btn">
        ← Back to Users
      </button>
      <h1>User Detail</h1>
    </div>

    <!-- User Detail Loading State -->
    <div v-if="loading" class="loading-container">
      <p>Loading user details...</p>
    </div>

    <!-- User Detail Error State -->
    <div v-if="error" class="error-container">
      <p class="error-message">{{ error }}</p>
      <button @click="clearError" class="error-dismiss">Dismiss</button>
      <button @click="retryFetchUser" class="retry-button">Retry</button>
    </div>

    <!-- User Information -->
    <div v-if="!loading && !error && user" class="details-card">
      <div class="card-header">
        <h2>User Information</h2>
        <button v-if="!isEditing" @click="startEdit" class="edit-btn">Edit</button>
      </div>

      <p v-if="isEditing && updateError?.non_field_errors" class="error-message">
        {{ updateError.non_field_errors[0] }}
      </p>

      <div class="info-grid">
        <div class="info-item">
          <label>Bloom Id:</label>
          <span>{{ user.bloomId }}</span>
        </div>
        <div class="info-item">
          <label>Name:</label>
          <span v-if="!isEditing">{{ user.name }}</span>
          <template v-else>
            <input v-model="editForm.name" type="text" class="form-input" />
            <p v-if="updateError?.name" class="field-error">{{ updateError.name[0] }}</p>
          </template>
        </div>
        <div class="info-item">
          <label>Last Name:</label>
          <span v-if="!isEditing">{{ user.lastName }}</span>
          <template v-else>
            <input v-model="editForm.lastName" type="text" class="form-input" />
            <p v-if="updateError?.lastName" class="field-error">{{ updateError.lastName[0] }}</p>
          </template>
        </div>
        <div class="info-item">
          <label>Email:</label>
          <span v-if="!isEditing">{{ user.email }}</span>
          <template v-else>
            <input v-model="editForm.email" type="email" class="form-input" />
            <p v-if="updateError?.email" class="field-error">{{ updateError.email[0] }}</p>
          </template>
        </div>
        <div class="info-item">
          <label>Secondary Email:</label>
          <span v-if="!isEditing">{{ user.secondaryEmail || '-' }}</span>
          <template v-else>
            <input v-model="editForm.secondaryEmail" type="email" class="form-input" />
            <p v-if="updateError?.secondaryEmail" class="field-error">{{ updateError.secondaryEmail[0] }}</p>
          </template>
        </div>
        <div class="info-item">
          <label>Fiscal Code:</label>
          <span v-if="!isEditing">{{ user.fiscalCode }}</span>
          <template v-else>
            <input v-model="editForm.fiscalCode" type="text" class="form-input" />
            <p v-if="updateError?.fiscalCode" class="field-error">{{ updateError.fiscalCode[0] }}</p>
          </template>
        </div>
        <div class="info-item">
          <label>Birth Date:</label>
          <span v-if="!isEditing">{{ formatDate(user.birthDate) }}</span>
          <template v-else>
            <input v-model="editForm.birthDate" type="date" class="form-input" />
            <p v-if="updateError?.birthDate" class="field-error">{{ updateError.birthDate[0] }}</p>
          </template>
        </div>
        <div class="info-item">
          <label>Birth City:</label>
          <span v-if="!isEditing">{{ user.birthCity }}</span>
          <template v-else>
            <input v-model="editForm.birthCity" type="text" class="form-input" />
            <p v-if="updateError?.birthCity" class="field-error">{{ updateError.birthCity[0] }}</p>
          </template>
        </div>
        <div class="info-item">
          <label>Identity Card Number:</label>
          <span v-if="!isEditing">{{ user.identityCardNumber || '-' }}</span>
          <template v-else>
            <input v-model="editForm.identityCardNumber" type="text" class="form-input" />
            <p v-if="updateError?.identityCardNumber" class="field-error">{{ updateError.identityCardNumber[0] }}</p>
          </template>
        </div>
        <div class="info-item">
          <label>Residence Address:</label>
          <span v-if="!isEditing">{{ user.residenceAddress }}</span>
          <template v-else>
            <input v-model="editForm.residenceAddress" type="text" class="form-input" />
            <p v-if="updateError?.residenceAddress" class="field-error">{{ updateError.residenceAddress[0] }}</p>
          </template>
        </div>
        <div class="info-item">
          <label>Residence City:</label>
          <span v-if="!isEditing">{{ user.residenceCity }}</span>
          <template v-else>
            <input v-model="editForm.residenceCity" type="text" class="form-input" />
            <p v-if="updateError?.residenceCity" class="field-error">{{ updateError.residenceCity[0] }}</p>
          </template>
        </div>
        <div class="info-item">
          <label>Residence CAP:</label>
          <span v-if="!isEditing">{{ user.residenceCAP }}</span>
          <template v-else>
            <input v-model="editForm.residenceCAP" type="text" class="form-input" />
            <p v-if="updateError?.residenceCAP" class="field-error">{{ updateError.residenceCAP[0] }}</p>
          </template>
        </div>
        <div class="info-item">
          <label>Residence Province:</label>
          <span v-if="!isEditing">{{ user.residenceProvince }}</span>
          <template v-else>
            <input v-model="editForm.residenceProvince" type="text" class="form-input" />
            <p v-if="updateError?.residenceProvince" class="field-error">{{ updateError.residenceProvince[0] }}</p>
          </template>
        </div>
        <div class="info-item">
          <label>Phone Number:</label>
          <span v-if="!isEditing">{{ user.phoneNumber }}</span>
          <template v-else>
            <input v-model="editForm.phoneNumber" type="text" class="form-input" />
            <p v-if="updateError?.phoneNumber" class="field-error">{{ updateError.phoneNumber[0] }}</p>
          </template>
        </div>
        <div class="info-item">
          <label>Data Validated:</label>
          <span class="flag" :class="{ 'flag-true': user.dataValidated, 'flag-false': !user.dataValidated }">
            {{ user.dataValidated ? '✓' : '✗' }}
          </span>
        </div>
      </div>

      <div v-if="isEditing" class="edit-actions">
        <button @click="cancelEdit" class="btn-secondary">Cancel</button>
        <button @click="saveEdit" class="btn-primary" :disabled="updating">Save</button>
      </div>
    </div>

    <!-- Relations Section -->
    <div class="relations-card">
      <h2>Relations</h2>

      <!-- Relations Loading State -->
      <div v-if="relationsLoading" class="loading-container">
        <p>Loading relations...</p>
      </div>

      <!-- Relations Error State -->
      <div v-if="relationsError" class="error-container">
        <p class="error-message">{{ relationsError }}</p>
        <button @click="clearRelationsError" class="error-dismiss">Dismiss</button>
        <button @click="retryFetchUserRelations" class="retry-button">Retry</button>
      </div>

      <div v-if="!relationsLoading && !relationsError">
        <!-- Empty State -->
        <div v-if="relations.length === 0" class="empty-state">
          <p>No relations found.</p>
        </div>

        <!-- Relations Table -->
        <table v-else class="relations-table">
          <thead>
            <tr>
              <th>Relation Type</th>
              <th>Other User</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="relation in relations" :key="relation.id" class="relation-row">
              <td>{{ relation.relationType }}</td>
              <td>
                <router-link :to="`/users/${relation.otherUser.id}`">
                  {{ relation.otherUser.name }} {{ relation.otherUser.lastName }}
                </router-link>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref, reactive } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserManage } from '../composables/useUserManage.js'

const route = useRoute()
const router = useRouter()

const userId = route.params.id

// The 13 fields this page allows editing, per the edit-user-data feature.
const EDITABLE_FIELDS = [
  'name',
  'lastName',
  'email',
  'secondaryEmail',
  'fiscalCode',
  'birthDate',
  'birthCity',
  'identityCardNumber',
  'residenceAddress',
  'residenceCity',
  'residenceCAP',
  'residenceProvince',
  'phoneNumber'
]

const {
  user,
  loading,
  error,
  relations,
  relationsLoading,
  relationsError,
  updating,
  updateError,
  fetchUser,
  fetchUserRelations,
  updateUser,
  clearError,
  clearRelationsError,
  clearUpdateError
} = useUserManage()

const isEditing = ref(false)
const editForm = reactive({})

onMounted(async () => {
  await Promise.all([
    fetchUser(userId),
    fetchUserRelations(userId)
  ])
})

const goBack = () => {
  router.push('/users')
}

const startEdit = () => {
  EDITABLE_FIELDS.forEach((field) => {
    editForm[field] = user.value[field]
  })
  isEditing.value = true
}

const cancelEdit = () => {
  isEditing.value = false
  clearUpdateError()
}

const saveEdit = async () => {
  const success = await updateUser(userId, { ...editForm })
  if (success) {
    isEditing.value = false
  }
}

const retryFetchUser = () => {
  fetchUser(userId)
}

const retryFetchUserRelations = () => {
  fetchUserRelations(userId)
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}
</script>

<style scoped>
.user-detail-page {
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
  margin-bottom: 1.5rem;
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

.details-card,
.relations-card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
  margin-bottom: 1.5rem;
}

.details-card h2,
.relations-card h2 {
  margin: 0 0 1.5rem 0;
  color: #333;
  border-bottom: 2px solid #007bff;
  padding-bottom: 0.5rem;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 2px solid #007bff;
  padding-bottom: 0.5rem;
  margin-bottom: 1.5rem;
}

.card-header h2 {
  margin: 0;
  border-bottom: none;
  padding-bottom: 0;
}

.edit-btn {
  padding: 0.5rem 1rem;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
}

.edit-btn:hover {
  background: #0056b3;
}

.form-input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  background: white;
  color: #333;
}

.form-input:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
}

.field-error {
  color: #dc3545;
  font-size: 0.85rem;
  margin: 0.25rem 0 0 0;
}

.edit-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 1.5rem;
}

.btn-primary,
.btn-secondary {
  padding: 0.5rem 1.5rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 500;
}

.btn-primary {
  background: #007bff;
  color: white;
}

.btn-primary:disabled {
  background: #6c757d;
  cursor: not-allowed;
}

.btn-secondary {
  background: #6c757d;
  color: white;
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

.flag {
  font-weight: bold;
  font-size: 1.1rem;
}

.flag-true {
  color: #28a745;
}

.flag-false {
  color: #dc3545;
}

.empty-state {
  text-align: center;
  padding: 2rem;
  color: #666;
}

.relations-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
}

.relations-table th,
.relations-table td {
  padding: 0.75rem;
  text-align: left;
  border-bottom: 1px solid #dee2e6;
}

.relations-table th {
  background: #f8f9fa;
  font-weight: 600;
  color: #333;
}

.relation-row:hover {
  background: #f8f9fa;
}

@media (max-width: 768px) {
  .info-grid {
    grid-template-columns: 1fr;
  }
}
</style>
