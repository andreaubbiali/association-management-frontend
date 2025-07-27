<template>
  <div class="home-container">
    <header class="hero">
      <img class="hero-image" src="../assets/vue.svg" alt="Association - Example image" />
      <h1>Welcome to the Association</h1>
      <p class="subtitle">A place to grow together, share passions, and build the future of our community.</p>
    </header>
    <section class="about">
      <h2>About us</h2>
      <p>
        We are an association dedicated to promoting social, cultural, and recreational initiatives for all ages. Our mission is to create a welcoming and inclusive space for everyone.
      </p>
      <img class="about-image" src="../assets/vue.svg" alt="About us - Example image" />
    </section>
    <section class="cta">
      <h2>Want to know more?</h2>
      <p>Contact us or come visit to discover all our activities!</p>
      <RouterLink to="/contacts" class="cta-button">Contact us</RouterLink>
    </section>
  </div>
</template>

<script setup>
import { RouterLink } from 'vue-router'
</script>

<!-- Styles are in style.css -->
