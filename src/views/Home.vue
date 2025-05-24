<template>
  <header class="main-header">
    <div class="header-center">
      <img src="../assets/vue.svg" alt="Logo associazione" class="header-logo" />
    </div>
    <button class="hamburger" @click="menuOpen = !menuOpen" :aria-expanded="menuOpen" aria-label="Apri menu">
      <span :class="{ 'open': menuOpen }"></span>
      <span :class="{ 'open': menuOpen }"></span>
      <span :class="{ 'open': menuOpen }"></span>
    </button>
    <nav class="main-nav" v-if="menuOpen">
      <ul>
        <li><a href="#ginnastica">Ginnastica</a></li>
        <li><a href="#workshop">Workshop</a></li>
        <li><a href="#chi-siamo">Chi siamo</a></li>
        <li><a href="#dove-siamo">Dove siamo</a></li>
        <li><a href="#contatti">Contatti</a></li>
      </ul>
    </nav>
  </header>
  <div class="home-container">
    <header class="hero">
      <img class="hero-image" src="../assets/vue.svg" alt="Associazione - Immagine Esemplificativa" />
      <h1>Benvenuti nell'Associazione</h1>
      <p class="subtitle">Un luogo dove crescere insieme, condividere passioni e costruire il futuro della nostra comunità.</p>
    </header>
    <section class="about">
      <h2>Chi siamo</h2>
      <p>
        Siamo un'associazione dedicata a promuovere iniziative sociali, culturali e ricreative per tutte le età. La nostra missione è creare uno spazio accogliente e inclusivo per tutti.
      </p>
      <img class="about-image" src="../assets/vue.svg" alt="Chi siamo - Immagine Esemplificativa" />
    </section>
    <section class="cta">
      <h2>Vuoi saperne di più?</h2>
      <p>Contattaci o vieni a trovarci per scoprire tutte le nostre attività!</p>
      <button class="cta-button">Contattaci</button>
    </section>
  </div>
</template>

<script setup>
import { ref } from 'vue'
const menuOpen = ref(false)
</script>

<!-- Gli stili sono in style.css -->
