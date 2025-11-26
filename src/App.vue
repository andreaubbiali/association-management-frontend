<script setup>
import { ref } from 'vue'
import { RouterView, useRouter } from 'vue-router'

const menuOpen = ref(false)
const router = useRouter()

const showNotImplemented = (feature) => {
  alert(`${feature} not implemented yet`)
}

const goToAssociates = () => {
  router.push('/')
}

const goToCourses = () => {
  router.push('/courses')
}

const goToReports = () => {
  router.push('/reports')
}
</script>

<template>
  <header class="main-header">
    <nav class="main-nav">
      <button @click="goToAssociates" class="nav-button">Associates</button>
      <button @click="showNotImplemented('Users')" class="nav-button">Users</button>
      <button @click="goToCourses" class="nav-button">Courses</button>
      <button @click="goToReports" class="nav-button">Reports</button>
    </nav>
  </header>
  <RouterView />
</template>

<!-- Styles are in style.css -->
