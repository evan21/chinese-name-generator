<template>
  <div class="app">
    <header class="header">
      <h1>Get Your Chinese Name</h1>
      <p class="subtitle">Discover your meaningful, authentic Chinese name</p>
    </header>
    <main class="main">
      <NameGenerator />
      <History @load-history="handleLoadHistory" />
    </main>
    <footer class="footer">
      <p>© 2026 Chinese Name Generator</p>
    </footer>
  </div>
</template>

<script setup>
import NameGenerator from './components/NameGenerator.vue'
import History from './components/History.vue'

const handleLoadHistory = (item) => {
  console.log('Load history:', item)
}
</script>

<style src="./style/global.css"></style>