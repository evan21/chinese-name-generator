<template>
  <div class="name-result">
    <h2 class="result-title">Your Chinese Names</h2>
    <p class="result-subtitle">We found these names that best match your preferences</p>

    <div class="names-list">
      <div v-for="(name, index) in names" :key="index" class="name-card">
        <div class="name-header">
          <div class="name-main">
            <h3 class="chinese-name">{{ name.name }}</h3>
            <p class="pinyin">{{ name.pinyin }}</p>
          </div>
          <div class="match-score">
            <div class="score-circle" :style="getScoreStyle(name.matchPercentage)">
              <span class="score-text">{{ name.matchPercentage }}%</span>
            </div>
            <span class="match-label">Match</span>
          </div>
        </div>

        <div class="name-meaning">
          <strong>Meaning:</strong> {{ name.meaning }}
        </div>

        <div class="name-tags">
          <span v-for="tag in name.tags" :key="tag" class="tag">
            {{ tag }}
          </span>
        </div>

        <div class="name-actions">
          <button @click="playPronunciation(name.name)" class="btn btn-secondary">
            🔊 Play Pronunciation
          </button>
          <button @click="playPronunciationSlow(name.name)" class="btn btn-secondary">
            🐢 Slow Pronunciation
          </button>
          <ShareCard :name="name" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { speakChinese, speakChineseSlow } from '../utils/tts.js'
import ShareCard from './ShareCard.vue'

const props = defineProps({
  names: {
    type: Array,
    required: true
  }
})

const getScoreStyle = (score) => {
  let color = '#10b981' // green for high score
  if (score < 70) color = '#f59e0b' // orange for medium
  if (score < 50) color = '#ef4444' // red for low

  return {
    background: `conic-gradient(${color} ${score}%, #e5e7eb ${score}%)`
  }
}

const playPronunciation = (name) => {
  speakChinese(name)
}

const playPronunciationSlow = (name) => {
  speakChineseSlow(name)
}
</script>

<style scoped>
.name-result {
  margin-top: 3rem;
}

.result-title {
  font-size: 1.8rem;
  color: #333;
  margin-bottom: 0.5rem;
  text-align: center;
}

.result-subtitle {
  text-align: center;
  color: #666;
  margin-bottom: 2rem;
}

.names-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.name-card {
  background: #f8fafc;
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid #e2e8f0;
}

.name-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.name-main {
  flex: 1;
}

.chinese-name {
  font-size: 2.5rem;
  font-weight: 700;
  color: #667eea;
  margin-bottom: 0.25rem;
  font-family: 'Microsoft YaHei', 'PingFang SC', sans-serif;
}

.pinyin {
  font-size: 1.2rem;
  color: #64748b;
  font-style: italic;
}

.match-score {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
}

.score-circle {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.score-circle::before {
  content: '';
  position: absolute;
  width: 45px;
  height: 45px;
  background: white;
  border-radius: 50%;
}

.score-text {
  position: relative;
  font-weight: 700;
  font-size: 0.9rem;
  color: #333;
}

.match-label {
  font-size: 0.8rem;
  color: #64748b;
  font-weight: 500;
}

.name-meaning {
  margin-bottom: 1rem;
  line-height: 1.6;
  color: #333;
}

.name-tags {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}

.tag {
  background: #e0e7ff;
  color: #4f46e5;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 500;
  text-transform: capitalize;
}

.name-actions {
  display: flex;
  gap: 0.8rem;
  flex-wrap: wrap;
}

.btn-secondary {
  background: white;
  color: #667eea;
  border: 2px solid #667eea;
  padding: 0.6rem 1.2rem;
  font-size: 0.9rem;
}

.btn-secondary:hover {
  background: #667eea;
  color: white;
}
</style>
