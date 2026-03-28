<template>
  <div class="create-associate-page">
    <div class="page-header">
      <button @click="goBack" class="back-btn">← Back to Associates</button>
      <h1>Create Associate</h1>
    </div>

    <div v-if="error" class="error-container">
      <p class="error-message">{{ error }}</p>
      <button @click="clearError" class="error-dismiss">Dismiss</button>
    </div>

    <form @submit.prevent="submitAssociate" class="associate-form">
      <section class="form-section">
        <h2>Validity Year</h2>
        <div class="form-row two-columns">
          <div class="form-group">
            <label for="validityYearStart">Start Year *</label>
            <input
              id="validityYearStart"
              v-model.number="validityYearStart"
              type="number"
              min="1900"
              max="3000"
              :class="['form-input', { 'input-error': hasTriedSubmit && !isYearRangeValid }]"
              required
            />
            <p v-if="hasTriedSubmit && !isYearRangeValid" class="field-error">Start/End year must differ by exactly 1.</p>
          </div>

          <div class="form-group">
            <label for="validityYearEnd">End Year *</label>
            <input
              id="validityYearEnd"
              :value="validityYearEnd"
              type="number"
              :class="['form-input', { 'input-error': hasTriedSubmit && !isYearRangeValid }]"
              readonly
            />
            <p v-if="hasTriedSubmit && !isYearRangeValid" class="field-error">End year is automatically set to start year + 1.</p>
          </div>
        </div>
        <p class="field-help">End year is automatically set to start year + 1.</p>
      </section>

      <section class="form-section">
        <h2>Associate Data</h2>
        <div class="form-row two-columns">
          <div class="form-group">
            <label for="associateName">Name *</label>
            <input id="associateName" v-model.trim="associate.name" type="text" :class="['form-input', { 'input-error': showRequiredError(associate.name) }]" required />
            <p v-if="showRequiredError(associate.name)" class="field-error">Name is required.</p>
          </div>
          <div class="form-group">
            <label for="associateLastName">Last Name *</label>
            <input id="associateLastName" v-model.trim="associate.lastName" type="text" :class="['form-input', { 'input-error': showRequiredError(associate.lastName) }]" required />
            <p v-if="showRequiredError(associate.lastName)" class="field-error">Last name is required.</p>
          </div>
        </div>

        <div class="form-row two-columns">
          <div class="form-group">
            <label for="associateBirthDate">Birth Date *</label>
            <input id="associateBirthDate" v-model="associate.birthDate" type="date" :class="['form-input', { 'input-error': showRequiredError(associate.birthDate) || showInvalidAgeError }]" required />
            <p v-if="showRequiredError(associate.birthDate)" class="field-error">Birth date is required.</p>
            <p v-else-if="showInvalidAgeError" class="field-error">Birth date is not valid.</p>
          </div>
          <div class="form-group">
            <label for="associateBirthCity">Birth City *</label>
            <input id="associateBirthCity" v-model.trim="associate.birthCity" type="text" :class="['form-input', { 'input-error': showRequiredError(associate.birthCity) }]" required />
            <p v-if="showRequiredError(associate.birthCity)" class="field-error">Birth city is required.</p>
          </div>
        </div>

        <div class="form-row two-columns">
          <div class="form-group">
            <label for="associateFiscalCode">Fiscal Code *</label>
            <input id="associateFiscalCode" v-model.trim="associate.fiscalCode" type="text" :class="['form-input', { 'input-error': showRequiredError(associate.fiscalCode) }]" required />
            <p v-if="showRequiredError(associate.fiscalCode)" class="field-error">Fiscal code is required.</p>
          </div>
          <div class="form-group">
            <label for="associateIdentityCardNumber">
              Identity Card Number {{ isAdult ? '*' : '(optional)' }}
            </label>
            <input
              id="associateIdentityCardNumber"
              v-model.trim="associate.identityCardNumber"
              type="text"
              :class="['form-input', { 'input-error': isAdult && showRequiredError(associate.identityCardNumber) }]"
              :required="isAdult"
            />
            <p v-if="isAdult && showRequiredError(associate.identityCardNumber)" class="field-error">Identity card number is required for adults.</p>
          </div>
        </div>

        <div class="form-row two-columns">
          <div class="form-group">
            <label for="associateResidenceAddress">Residence Address *</label>
            <input id="associateResidenceAddress" v-model.trim="associate.residenceAddress" type="text" :class="['form-input', { 'input-error': showRequiredError(associate.residenceAddress) }]" required />
            <p v-if="showRequiredError(associate.residenceAddress)" class="field-error">Residence address is required.</p>
          </div>
          <div class="form-group">
            <label for="associateResidenceCity">Residence City *</label>
            <input id="associateResidenceCity" v-model.trim="associate.residenceCity" type="text" :class="['form-input', { 'input-error': showRequiredError(associate.residenceCity) }]" required />
            <p v-if="showRequiredError(associate.residenceCity)" class="field-error">Residence city is required.</p>
          </div>
        </div>

        <div class="form-row three-columns">
          <div class="form-group">
            <label for="associateResidenceCAP">Residence CAP *</label>
            <input id="associateResidenceCAP" v-model.trim="associate.residenceCAP" type="text" :class="['form-input', { 'input-error': showRequiredError(associate.residenceCAP) }]" required />
            <p v-if="showRequiredError(associate.residenceCAP)" class="field-error">Residence CAP is required.</p>
          </div>
          <div class="form-group">
            <label for="associateResidenceProvince">Residence Province *</label>
            <input id="associateResidenceProvince" v-model.trim="associate.residenceProvince" type="text" :class="['form-input', { 'input-error': showRequiredError(associate.residenceProvince) }]" required />
            <p v-if="showRequiredError(associate.residenceProvince)" class="field-error">Residence province is required.</p>
          </div>
          <div class="form-group">
            <label for="associatePhoneNumber">Phone Number *</label>
            <input id="associatePhoneNumber" v-model.trim="associate.phoneNumber" type="text" :class="['form-input', { 'input-error': showRequiredError(associate.phoneNumber) }]" required />
            <p v-if="showRequiredError(associate.phoneNumber)" class="field-error">Phone number is required.</p>
          </div>
        </div>

        <div class="form-row two-columns">
          <div class="form-group">
            <label for="associateEmail">Email *</label>
            <input id="associateEmail" v-model.trim="associate.email" type="email" :class="['form-input', { 'input-error': showRequiredError(associate.email) }]" required />
            <p v-if="showRequiredError(associate.email)" class="field-error">Email is required.</p>
          </div>
          <div class="form-group">
            <label for="associateSecondaryEmail">Secondary Email (optional)</label>
            <input id="associateSecondaryEmail" v-model.trim="associate.secondaryEmail" type="email" class="form-input" />
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
        <button type="submit" class="submit-btn" :disabled="submitting">
          {{ submitting ? 'Creating...' : 'Create Associate' }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { associatesService } from '../services/associatesService.js'

const router = useRouter()

const currentYear = new Date().getFullYear()
const validityYearStart = ref(currentYear)
const submitting = ref(false)
const error = ref(null)
const hasTriedSubmit = ref(false)

const associate = reactive({
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

const validityYearEnd = computed(() => Number(validityYearStart.value || 0) + 1)

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

const associateAge = computed(() => calculateAge(associate.birthDate))
const isMinor = computed(() => associateAge.value !== null && associateAge.value < 18)
const isAdult = computed(() => associateAge.value !== null && associateAge.value >= 18)
const showInvalidAgeError = computed(() => hasTriedSubmit.value && associate.birthDate && (associateAge.value === null || associateAge.value < 0))

const showRequiredError = (value) => {
  return hasTriedSubmit.value && String(value || '').trim() === ''
}

const requiredFieldsFilled = (obj, keys) => {
  return keys.every((key) => String(obj[key] || '').trim() !== '')
}

const associateRequiredFields = computed(() => {
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

  return requiredFieldsFilled(associate, baseFields)
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

const isYearRangeValid = computed(() => {
  const start = Number(validityYearStart.value)
  const end = Number(validityYearEnd.value)
  return Number.isInteger(start) && Number.isInteger(end) && end - start === 1
})

const isFormValid = computed(() => {
  if (!associateRequiredFields.value) {
    return false
  }

  if (associateAge.value === null || associateAge.value < 0) {
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
    validityYearStart: String(validityYearStart.value),
    validityYearEnd: String(validityYearEnd.value),
    associate: {
      name: associate.name,
      lastName: associate.lastName,
      birthDate: associate.birthDate,
      birthCity: associate.birthCity,
      fiscalCode: associate.fiscalCode,
      residenceAddress: associate.residenceAddress,
      residenceCAP: associate.residenceCAP,
      residenceCity: associate.residenceCity,
      residenceProvince: associate.residenceProvince,
      phoneNumber: associate.phoneNumber,
      email: associate.email
    }
  }

  withOptional(payload.associate, 'identityCardNumber', associate.identityCardNumber)
  withOptional(payload.associate, 'secondaryEmail', associate.secondaryEmail)

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
  error.value = null
}

const goBack = () => {
  router.push('/associates')
}

const submitAssociate = async () => {
  hasTriedSubmit.value = true
  clearError()

  if (!isYearRangeValid.value) {
    error.value = 'Validity years are invalid: end year must be exactly start year + 1.'
    return
  }

  if (!isFormValid.value) {
    error.value = 'Please fill all mandatory fields correctly before submitting.'
    return
  }

  submitting.value = true

  try {
    const payload = buildPayload()
    await associatesService.createAssociate(payload)
    router.push({ path: '/associates', query: { created: '1' } })
  } catch (err) {
    error.value = err.response?.data?.message || 'Failed to create associate. Please try again.'
    console.error('Create associate failed:', err)
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.create-associate-page {
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

.associate-form {
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

.field-help {
  margin: 0;
  color: #586f85;
  font-size: 0.9rem;
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
