<template>
  <div class="add-user-page">
    <div class="page-header">
      <button @click="goBack" class="back-btn">← Back to Users</button>
      <h1>Add User</h1>
    </div>

    <div v-if="error" class="error-container">
      <p class="error-message">{{ error }}</p>
      <button @click="clearError" class="error-dismiss">Dismiss</button>
    </div>

    <div v-if="alreadyExistsMessage" class="info-banner">
      <p>{{ alreadyExistsMessage }}</p>
    </div>

    <form @submit.prevent="submitUser" class="user-form">
      <section class="form-section">
        <h2>User Data</h2>
        <div class="form-row two-columns">
          <div class="form-group">
            <label for="userName">Name *</label>
            <input id="userName" v-model.trim="identity.name" type="text" :class="['form-input', { 'input-error': showRequiredError(identity.name) }]" required />
            <p v-if="showRequiredError(identity.name)" class="field-error">Name is required.</p>
          </div>
          <div class="form-group">
            <label for="userLastName">Last Name *</label>
            <input id="userLastName" v-model.trim="identity.lastName" type="text" :class="['form-input', { 'input-error': showRequiredError(identity.lastName) }]" required />
            <p v-if="showRequiredError(identity.lastName)" class="field-error">Last name is required.</p>
          </div>
        </div>

        <div class="form-row two-columns">
          <div class="form-group">
            <label for="userBirthDate">Birth Date *</label>
            <input id="userBirthDate" v-model="identity.birthDate" type="date" :class="['form-input', { 'input-error': showRequiredError(identity.birthDate) || showInvalidAgeError }]" required />
            <p v-if="showRequiredError(identity.birthDate)" class="field-error">Birth date is required.</p>
            <p v-else-if="showInvalidAgeError" class="field-error">Birth date is not valid.</p>
          </div>
          <div class="form-group">
            <label for="userBirthCity">Birth City *</label>
            <input id="userBirthCity" v-model.trim="identity.birthCity" type="text" :class="['form-input', { 'input-error': showRequiredError(identity.birthCity) }]" required />
            <p v-if="showRequiredError(identity.birthCity)" class="field-error">Birth city is required.</p>
          </div>
        </div>

        <div class="form-row two-columns">
          <div class="form-group">
            <label for="userFiscalCode">Fiscal Code *</label>
            <input id="userFiscalCode" v-model.trim="identity.fiscalCode" type="text" :class="['form-input', { 'input-error': showRequiredError(identity.fiscalCode) }]" required />
            <p v-if="showRequiredError(identity.fiscalCode)" class="field-error">Fiscal code is required.</p>
          </div>
          <div class="form-group">
            <label for="userIdentityCardNumber">
              Identity Card Number {{ isAdult ? '*' : '(optional)' }}
            </label>
            <input
              id="userIdentityCardNumber"
              v-model.trim="identity.identityCardNumber"
              type="text"
              :class="['form-input', { 'input-error': isAdult && showRequiredError(identity.identityCardNumber) }]"
              :required="isAdult"
            />
            <p v-if="isAdult && showRequiredError(identity.identityCardNumber)" class="field-error">Identity card number is required for adults.</p>
          </div>
        </div>

        <div class="form-row two-columns">
          <div class="form-group">
            <label for="userResidenceAddress">Residence Address *</label>
            <input id="userResidenceAddress" v-model.trim="identity.residenceAddress" type="text" :class="['form-input', { 'input-error': showRequiredError(identity.residenceAddress) }]" required />
            <p v-if="showRequiredError(identity.residenceAddress)" class="field-error">Residence address is required.</p>
          </div>
          <div class="form-group">
            <label for="userResidenceCity">Residence City *</label>
            <input id="userResidenceCity" v-model.trim="identity.residenceCity" type="text" :class="['form-input', { 'input-error': showRequiredError(identity.residenceCity) }]" required />
            <p v-if="showRequiredError(identity.residenceCity)" class="field-error">Residence city is required.</p>
          </div>
        </div>

        <div class="form-row three-columns">
          <div class="form-group">
            <label for="userResidenceCAP">Residence CAP *</label>
            <input id="userResidenceCAP" v-model.trim="identity.residenceCAP" type="text" :class="['form-input', { 'input-error': showRequiredError(identity.residenceCAP) }]" required />
            <p v-if="showRequiredError(identity.residenceCAP)" class="field-error">Residence CAP is required.</p>
          </div>
          <div class="form-group">
            <label for="userResidenceProvince">Residence Province *</label>
            <input id="userResidenceProvince" v-model.trim="identity.residenceProvince" type="text" :class="['form-input', { 'input-error': showRequiredError(identity.residenceProvince) }]" required />
            <p v-if="showRequiredError(identity.residenceProvince)" class="field-error">Residence province is required.</p>
          </div>
          <div class="form-group">
            <label for="userPhoneNumber">Phone Number *</label>
            <input id="userPhoneNumber" v-model.trim="identity.phoneNumber" type="text" :class="['form-input', { 'input-error': showRequiredError(identity.phoneNumber) }]" required />
            <p v-if="showRequiredError(identity.phoneNumber)" class="field-error">Phone number is required.</p>
          </div>
        </div>

        <div class="form-row two-columns">
          <div class="form-group">
            <label for="userEmail">Email *</label>
            <input id="userEmail" v-model.trim="identity.email" type="email" :class="['form-input', { 'input-error': showRequiredError(identity.email) }]" required />
            <p v-if="showRequiredError(identity.email)" class="field-error">Email is required.</p>
          </div>
          <div class="form-group">
            <label for="userSecondaryEmail">Secondary Email (optional)</label>
            <input id="userSecondaryEmail" v-model.trim="identity.secondaryEmail" type="email" class="form-input" />
          </div>
        </div>
      </section>

      <section v-if="isMinor" class="form-section relation-section">
        <h2>Parent Relation (Required for minors)</h2>
        <div class="relation-type-badge">relationType: parent</div>

        <div class="form-row two-columns">
          <div class="form-group">
            <label for="parentName">Parent Name *</label>
            <input id="parentName" v-model.trim="parent.name" type="text" :class="['form-input', { 'input-error': showRequiredError(parent.name) }]" required />
            <p v-if="showRequiredError(parent.name)" class="field-error">Parent name is required.</p>
          </div>
          <div class="form-group">
            <label for="parentLastName">Parent Last Name *</label>
            <input id="parentLastName" v-model.trim="parent.lastName" type="text" :class="['form-input', { 'input-error': showRequiredError(parent.lastName) }]" required />
            <p v-if="showRequiredError(parent.lastName)" class="field-error">Parent last name is required.</p>
          </div>
        </div>

        <div class="form-row two-columns">
          <div class="form-group">
            <label for="parentBirthDate">Parent Birth Date *</label>
            <input id="parentBirthDate" v-model="parent.birthDate" type="date" :class="['form-input', { 'input-error': showRequiredError(parent.birthDate) }]" required />
            <p v-if="showRequiredError(parent.birthDate)" class="field-error">Parent birth date is required.</p>
          </div>
          <div class="form-group">
            <label for="parentBirthCity">Parent Birth City *</label>
            <input id="parentBirthCity" v-model.trim="parent.birthCity" type="text" :class="['form-input', { 'input-error': showRequiredError(parent.birthCity) }]" required />
            <p v-if="showRequiredError(parent.birthCity)" class="field-error">Parent birth city is required.</p>
          </div>
        </div>

        <div class="form-row two-columns">
          <div class="form-group">
            <label for="parentFiscalCode">Parent Fiscal Code *</label>
            <input id="parentFiscalCode" v-model.trim="parent.fiscalCode" type="text" :class="['form-input', { 'input-error': showRequiredError(parent.fiscalCode) }]" required />
            <p v-if="showRequiredError(parent.fiscalCode)" class="field-error">Parent fiscal code is required.</p>
          </div>
          <div class="form-group">
            <label for="parentIdentityCardNumber">Parent Identity Card Number *</label>
            <input id="parentIdentityCardNumber" v-model.trim="parent.identityCardNumber" type="text" :class="['form-input', { 'input-error': showRequiredError(parent.identityCardNumber) }]" required />
            <p v-if="showRequiredError(parent.identityCardNumber)" class="field-error">Parent identity card number is required.</p>
          </div>
        </div>

        <div class="form-row two-columns">
          <div class="form-group">
            <label for="parentResidenceAddress">Parent Residence Address *</label>
            <input id="parentResidenceAddress" v-model.trim="parent.residenceAddress" type="text" :class="['form-input', { 'input-error': showRequiredError(parent.residenceAddress) }]" required />
            <p v-if="showRequiredError(parent.residenceAddress)" class="field-error">Parent residence address is required.</p>
          </div>
          <div class="form-group">
            <label for="parentResidenceCity">Parent Residence City *</label>
            <input id="parentResidenceCity" v-model.trim="parent.residenceCity" type="text" :class="['form-input', { 'input-error': showRequiredError(parent.residenceCity) }]" required />
            <p v-if="showRequiredError(parent.residenceCity)" class="field-error">Parent residence city is required.</p>
          </div>
        </div>

        <div class="form-row three-columns">
          <div class="form-group">
            <label for="parentResidenceCAP">Parent Residence CAP *</label>
            <input id="parentResidenceCAP" v-model.trim="parent.residenceCAP" type="text" :class="['form-input', { 'input-error': showRequiredError(parent.residenceCAP) }]" required />
            <p v-if="showRequiredError(parent.residenceCAP)" class="field-error">Parent residence CAP is required.</p>
          </div>
          <div class="form-group">
            <label for="parentResidenceProvince">Parent Residence Province *</label>
            <input id="parentResidenceProvince" v-model.trim="parent.residenceProvince" type="text" :class="['form-input', { 'input-error': showRequiredError(parent.residenceProvince) }]" required />
            <p v-if="showRequiredError(parent.residenceProvince)" class="field-error">Parent residence province is required.</p>
          </div>
          <div class="form-group">
            <label for="parentPhoneNumber">Parent Phone Number *</label>
            <input id="parentPhoneNumber" v-model.trim="parent.phoneNumber" type="text" :class="['form-input', { 'input-error': showRequiredError(parent.phoneNumber) }]" required />
            <p v-if="showRequiredError(parent.phoneNumber)" class="field-error">Parent phone number is required.</p>
          </div>
        </div>

        <div class="form-row two-columns">
          <div class="form-group">
            <label for="parentEmail">Parent Email *</label>
            <input id="parentEmail" v-model.trim="parent.email" type="email" :class="['form-input', { 'input-error': showRequiredError(parent.email) }]" required />
            <p v-if="showRequiredError(parent.email)" class="field-error">Parent email is required.</p>
          </div>
          <div class="form-group">
            <label for="parentSecondaryEmail">Parent Secondary Email (optional)</label>
            <input id="parentSecondaryEmail" v-model.trim="parent.secondaryEmail" type="email" class="form-input" />
          </div>
        </div>
      </section>

      <div class="form-actions">
        <button type="button" class="cancel-btn" @click="goBack">Cancel</button>
        <button type="submit" class="submit-btn" :disabled="creating">
          {{ creating ? 'Creating...' : 'Create User' }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserManage } from '../composables/useUserManage.js'

const router = useRouter()

const { creating, createError, createUser } = useUserManage()

const hasTriedSubmit = ref(false)
const alreadyExistsMessage = ref('')

const identity = reactive({
  name: '',
  lastName: '',
  birthDate: '',
  birthCity: '',
  fiscalCode: '',
  identityCardNumber: '',
  residenceAddress: '',
  residenceCAP: '',
  residenceCity: '',
  residenceProvince: '',
  phoneNumber: '',
  email: '',
  secondaryEmail: ''
})

const parent = reactive({
  name: '',
  lastName: '',
  birthDate: '',
  birthCity: '',
  fiscalCode: '',
  identityCardNumber: '',
  residenceAddress: '',
  residenceCity: '',
  residenceCAP: '',
  residenceProvince: '',
  phoneNumber: '',
  email: '',
  secondaryEmail: ''
})

const calculateAge = (birthDate) => {
  if (!birthDate) {
    return null
  }

  const today = new Date()
  const birthday = new Date(birthDate)

  if (Number.isNaN(birthday.getTime())) {
    return null
  }

  let age = today.getFullYear() - birthday.getFullYear()
  const monthDiff = today.getMonth() - birthday.getMonth()

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthday.getDate())) {
    age -= 1
  }

  return age
}

const identityAge = computed(() => calculateAge(identity.birthDate))
const isMinor = computed(() => identityAge.value !== null && identityAge.value < 18)
const isAdult = computed(() => identityAge.value !== null && identityAge.value >= 18)
const showInvalidAgeError = computed(() => hasTriedSubmit.value && identity.birthDate && (identityAge.value === null || identityAge.value < 0))

const showRequiredError = (value) => {
  return hasTriedSubmit.value && String(value || '').trim() === ''
}

const requiredFieldsFilled = (obj, keys) => {
  return keys.every((key) => String(obj[key] || '').trim() !== '')
}

const identityRequiredFields = computed(() => {
  const baseFields = [
    'name',
    'lastName',
    'birthDate',
    'birthCity',
    'fiscalCode',
    'residenceAddress',
    'residenceCAP',
    'residenceCity',
    'residenceProvince',
    'phoneNumber',
    'email'
  ]

  if (isAdult.value) {
    baseFields.push('identityCardNumber')
  }

  return requiredFieldsFilled(identity, baseFields)
})

const parentRequiredFields = computed(() => {
  const keys = [
    'name',
    'lastName',
    'birthDate',
    'birthCity',
    'fiscalCode',
    'identityCardNumber',
    'residenceAddress',
    'residenceCity',
    'residenceCAP',
    'residenceProvince',
    'phoneNumber',
    'email'
  ]

  return requiredFieldsFilled(parent, keys)
})

const isFormValid = computed(() => {
  if (!identityRequiredFields.value) {
    return false
  }

  if (identityAge.value === null || identityAge.value < 0) {
    return false
  }

  if (isMinor.value && !parentRequiredFields.value) {
    return false
  }

  return true
})

const buildPayload = () => {
  const withOptional = (target, key, value) => {
    if (String(value || '').trim() !== '') {
      target[key] = value
    }
  }

  const payload = {
    name: identity.name,
    lastName: identity.lastName,
    birthDate: identity.birthDate,
    birthCity: identity.birthCity,
    fiscalCode: identity.fiscalCode,
    residenceAddress: identity.residenceAddress,
    residenceCAP: identity.residenceCAP,
    residenceCity: identity.residenceCity,
    residenceProvince: identity.residenceProvince,
    phoneNumber: identity.phoneNumber,
    email: identity.email
  }

  withOptional(payload, 'identityCardNumber', identity.identityCardNumber)
  withOptional(payload, 'secondaryEmail', identity.secondaryEmail)

  if (isMinor.value) {
    const parentUser = {
      name: parent.name,
      lastName: parent.lastName,
      birthDate: parent.birthDate,
      birthCity: parent.birthCity,
      fiscalCode: parent.fiscalCode,
      identityCardNumber: parent.identityCardNumber,
      residenceAddress: parent.residenceAddress,
      residenceCity: parent.residenceCity,
      residenceCAP: parent.residenceCAP,
      residenceProvince: parent.residenceProvince,
      phoneNumber: parent.phoneNumber,
      email: parent.email
    }

    withOptional(parentUser, 'secondaryEmail', parent.secondaryEmail)

    payload.relations = [
      {
        user: parentUser,
        relationType: 'parent'
      }
    ]
  }

  return payload
}

const clearError = () => {
  createError.value = null
}

const goBack = () => {
  router.push('/users')
}

const submitUser = async () => {
  hasTriedSubmit.value = true
  alreadyExistsMessage.value = ''

  if (!isFormValid.value) {
    return
  }

  const payload = buildPayload()
  const result = await createUser(payload)

  if (!result) {
    return
  }

  const { user, created } = result

  if (!created) {
    alreadyExistsMessage.value = 'A user with this fiscal code already exists — no changes were made to their record.'
  }

  router.push(`/users/${user.id}`)
}

// Recurses because a relation's nested UserDto/RelationDto errors come back
// as nested objects/arrays (e.g. { relations: [{ user: { birthDate: [...] } }] }),
// not just a flat { field: [messages] } shape -- a shallow lookup would render
// the nested object as "[object Object]" instead of the actual message.
const firstErrorMessage = (data) => {
  if (typeof data === 'string') return data
  if (Array.isArray(data)) {
    for (const item of data) {
      const message = firstErrorMessage(item)
      if (message) return message
    }
    return null
  }
  if (data && typeof data === 'object') {
    for (const value of Object.values(data)) {
      const message = firstErrorMessage(value)
      if (message) return message
    }
  }
  return null
}

const error = computed(() => {
  if (!createError.value) return null
  return firstErrorMessage(createError.value) || 'Failed to create user. Please try again.'
})
</script>

<style scoped>
.add-user-page {
  max-width: 1100px;
  margin: 0 auto;
  padding: 1.5rem;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.page-header h1 {
  margin: 0;
  color: #2c3e50;
}

.back-btn {
  padding: 0.6rem 1rem;
  background: #eef2f7;
  border: 1px solid #d7dfe8;
  border-radius: 8px;
  color: #1f2f3f;
  cursor: pointer;
}

.back-btn:hover {
  background: #e3e9f1;
}

.user-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-section {
  background: #fff;
  border: 1px solid #e7edf3;
  border-radius: 12px;
  padding: 1rem;
}

.form-section h2 {
  margin-top: 0;
  margin-bottom: 1rem;
  color: #2c3e50;
}

.form-row {
  display: grid;
  gap: 0.9rem;
  margin-bottom: 0.9rem;
}

.two-columns {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.three-columns {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.form-group label {
  font-weight: 600;
  color: #31475c;
}

.form-input {
  width: 100%;
  box-sizing: border-box;
  padding: 0.65rem;
  border: 1px solid #ced9e5;
  border-radius: 8px;
  font-size: 0.95rem;
}

.form-input:focus {
  outline: 2px solid #8fb7e2;
  border-color: #8fb7e2;
}

.form-input.input-error {
  border-color: #d9534f;
  background: #fff5f5;
}

.field-error {
  margin: 0;
  color: #b13a37;
  font-size: 0.82rem;
}

.relation-section {
  border-left: 4px solid #2c6fb0;
}

.relation-type-badge {
  display: inline-block;
  margin-bottom: 0.9rem;
  background: #e8f1fb;
  color: #1f5d95;
  border: 1px solid #bdd7f3;
  padding: 0.25rem 0.6rem;
  border-radius: 999px;
  font-size: 0.85rem;
  font-weight: 600;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
}

.cancel-btn,
.submit-btn,
.error-dismiss {
  border: none;
  border-radius: 8px;
  padding: 0.65rem 1rem;
  font-weight: 600;
  cursor: pointer;
}

.cancel-btn {
  background: #e9eef5;
  color: #2b3b4c;
}

.submit-btn {
  background: #2c3e50;
  color: #fff;
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.error-container {
  margin-bottom: 1rem;
  background: #fdeaea;
  border: 1px solid #f5c0c0;
  border-radius: 10px;
  padding: 0.9rem;
}

.error-message {
  margin: 0 0 0.5rem 0;
  color: #a33d3d;
}

.error-dismiss {
  background: #f9dede;
  color: #7f2424;
}

.info-banner {
  margin-bottom: 1rem;
  background: #eef6fb;
  border: 1px solid #bcdcef;
  border-radius: 10px;
  padding: 0.9rem;
  color: #1f5d8f;
}

.info-banner p {
  margin: 0;
}

@media (max-width: 900px) {
  .two-columns,
  .three-columns {
    grid-template-columns: 1fr;
  }

  .page-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .form-actions {
    flex-direction: column;
  }

  .submit-btn,
  .cancel-btn {
    width: 100%;
  }
}
</style>
