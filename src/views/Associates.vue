<template>
  <AssociatesFilteredTable
    :associates="associatesData"
    :items-per-page="15"
    @edit-associate="handleEdit"
    @delete-associate="handleDelete"
  />
</template>

<script setup>
import { ref } from 'vue'
import AssociatesFilteredTable from '../components/AssociatesFilteredTable.vue'

const associatesData = ref([
  {
    "id": 15,
    "user": {
      "id": 24,
      "name": "laura",
      "lastName": "ubbiali",
      "birthDate": "1999-04-14",
      "birthPlace": "calcinate",
      "fiscalCode": "BBLNDR99D14Blln",
      "email": "uba99a@gmail.com"
    },
    "associationYear": 2025,
    "createdAt": "2025-07-26T14:53:16.198010Z",
    "updatedAt": "2025-07-26T14:53:16.198017Z"
  }
  // ... more associates
])

const handleEdit = (associate) => {
  console.log('Edit associate:', associate)
  // Handle edit logic
}

const handleDelete = (associate) => {
  console.log('Delete associate:', associate)
  // Handle delete logic
}

</script>

<!-- Styles are in style.css -->
