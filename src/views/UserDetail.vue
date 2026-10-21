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
      <h2>User Information</h2>
      <div class="info-grid">
        <div class="info-item">
          <label>Bloom Id:</label>
          <span>{{ user.bloomId }}</span>
        </div>
        <div class="info-item">
          <label>Name:</label>
          <span>{{ user.name }}</span>
        </div>
        <div class="info-item">
          <label>Last Name:</label>
          <span>{{ user.lastName }}</span>
        </div>
        <div class="info-item">
          <label>Email:</label>
          <span>{{ user.email }}</span>
        </div>
        <div class="info-item">
          <label>Secondary Email:</label>
          <span>{{ user.secondaryEmail || '-' }}</span>
        </div>
        <div class="info-item">
          <label>Fiscal Code:</label>
          <span>{{ user.fiscalCode }}</span>
        </div>
        <div class="info-item">
          <label>Birth Date:</label>
          <span>{{ formatDate(user.birthDate) }}</span>
        </div>
        <div class="info-item">
          <label>Birth City:</label>
          <span>{{ user.birthCity }}</span>
        </div>
        <div class="info-item">
          <label>Identity Card Number:</label>
          <span>{{ user.identityCardNumber || '-' }}</span>
        </div>
        <div class="info-item">
          <label>Residence Address:</label>
          <span>{{ user.residenceAddress }}</span>
        </div>
        <div class="info-item">
          <label>Residence City:</label>
          <span>{{ user.residenceCity }}</span>
        </div>
        <div class="info-item">
          <label>Residence CAP:</label>
          <span>{{ user.residenceCAP }}</span>
        </div>
        <div class="info-item">
          <label>Residence Province:</label>
          <span>{{ user.residenceProvince }}</span>
        </div>
        <div class="info-item">
          <label>Phone Number:</label>
          <span>{{ user.phoneNumber }}</span>
        </div>
        <div class="info-item">
          <label>Data Validated:</label>
          <span class="flag" :class="{ 'flag-true': user.dataValidated, 'flag-false': !user.dataValidated }">
            {{ user.dataValidated ? '✓' : '✗' }}
          </span>
        </div>
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
import { onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserManage } from '../composables/useUserManage.js'

const route = useRoute()
const router = useRouter()

const userId = route.params.id

const {
  user,
  loading,
  error,
  relations,
  relationsLoading,
  relationsError,
  fetchUser,
  fetchUserRelations,
  clearError,
  clearRelationsError
} = useUserManage()

onMounted(async () => {
  await Promise.all([
    fetchUser(userId),
    fetchUserRelations(userId)
  ])
})

const goBack = () => {
  router.push('/users')
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
