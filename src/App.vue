<script setup>
import { ref } from 'vue'
import { RouterLink, RouterView } from 'vue-router'
const menuOpen = ref(false)
</script>

<template>
  <header class="main-header">
    <div class="header-center">
      <img src="../assets/vue.svg" alt="Association logo" class="header-logo" />
    </div>
    <button class="hamburger" @click="menuOpen = !menuOpen" :aria-expanded="menuOpen" aria-label="Open menu">
      <span :class="{ 'open': menuOpen }"></span>
      <span :class="{ 'open': menuOpen }"></span>
      <span :class="{ 'open': menuOpen }"></span>
    </button>
    <nav class="main-nav" v-if="menuOpen">
      <ul>
        <li><RouterLink to="/gym" @click.native="menuOpen = false">Gym</RouterLink></li>
        <li><RouterLink to="/workshop" @click.native="menuOpen = false">Workshop</RouterLink></li>
        <li><RouterLink to="/about" @click.native="menuOpen = false">About</RouterLink></li>
        <li><RouterLink to="/location" @click.native="menuOpen = false">Location</RouterLink></li>
        <li><RouterLink to="/contacts" @click.native="menuOpen = false">Contacts</RouterLink></li>
      </ul>
    </nav>
  </header>
  <RouterView />
</template>

<!-- Styles are in style.css -->
