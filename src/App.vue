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
</script>

<template>
  <header class="main-header">
    <nav class="main-nav">
      <button @click="goToAssociates" class="nav-button">Associates</button>
      <button @click="showNotImplemented('Users')" class="nav-button">Users</button>
      <button @click="showNotImplemented('Courses')" class="nav-button">Courses</button>
    </nav>
  </header>
  <RouterView />
</template>

<!-- Styles are in style.css -->
