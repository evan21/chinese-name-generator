<template>
  <div class="name-generator">
    <form @submit.prevent="handleSubmit" class="form">
      <div class="form-group">
        <label for="englishName">Your English Name *</label>
        <input
          type="text"
          id="englishName"
          v-model="form.englishName"
          placeholder="e.g. Mary, John"
          required
          class="input"
        />
      </div>

      <div class="form-group">
        <label for="gender">Gender *</label>
        <select id="gender" v-model="form.gender" required class="input">
          <option value="">Select gender</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="neutral">No preference</option>
        </select>
      </div>

      <div class="form-group">
        <label for="scene">Main Usage Scenario</label>
        <select id="scene" v-model="form.scene" class="input">
          <option value="daily">Daily use / Social</option>
          <option value="business">Business / Work</option>
          <option value="creative">Creative / Artistic</option>
        </select>
      </div>

      <div class="form-group">
        <label for="style">Preferred Name Style</label>
        <select id="style" v-model="form.style" class="input">
          <option value="elegant">Elegant / Graceful</option>
          <option value="strong">Strong / Powerful</option>
          <option value="modern">Modern / Trendy</option>
          <option value="traditional">Traditional / Classic</option>
        </select>
      </div>

      <div class="form-group">
        <label for="hobbies">Your Hobbies / Interests (optional)</label>
        <input
          type="text"
          id="hobbies"
          v-model="form.hobbies"
          placeholder="e.g. art, music, travel, business"
          class="input"
        />
      </div>

      <button type="submit" class="btn submit-btn" :disabled="loading">
        {{ loading ? 'Generating...' : 'Generate My Chinese Name' }}
      </button>
    </form>

    <NameResult v-if="generatedNames.length > 0" :names="generatedNames" />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import NameResult from './NameResult.vue'
import { generateNames } from '../utils/nameGenerator.js'

const form = ref({
  englishName: '',
  gender: '',
  scene: 'daily',
  style: 'elegant',
  hobbies: ''
})

const loading = ref(false)
const generatedNames = ref([])

const handleSubmit = () => {
  loading.value = true

  // 模拟生成延迟，提升用户体验
  setTimeout(() => {
    generatedNames.value = generateNames(form.value)
    loading.value = false

    // 保存到本地历史记录
    const history = JSON.parse(localStorage.getItem('nameHistory') || '[]')
    history.unshift({
      timestamp: Date.now(),
      input: form.value,
      names: generatedNames.value
    })
    localStorage.setItem('nameHistory', JSON.stringify(history.slice(0, 10)))
  }, 800)
}
</script>

<style scoped>
.form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-weight: 600;
  color: #333;
  font-size: 0.95rem;
}

.input {
  padding: 0.8rem 1rem;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.2s;
}

.input:focus {
  outline: none;
  border-color: #667eea;
}

.submit-btn {
  margin-top: 1rem;
  padding: 1rem 2rem;
  font-size: 1.1rem;
}

.submit-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}
</style>
