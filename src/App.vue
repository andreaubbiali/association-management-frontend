<script setup>
import { ref } from 'vue'
import { RouterView } from 'vue-router'
const menuOpen = ref(false)
</script>

<template>
  <header class="main-header">
    <nav class="main-nav">
      <RouterLink to="/" class="nav-button">Associates</RouterLink>
      <RouterLink to="/users" class="nav-button">Users</RouterLink>
      <RouterLink to="/courses" class="nav-button">Courses</RouterLink>
    </nav>
  </header>
  <RouterView />
</template>

<!-- Styles are in style.css -->
