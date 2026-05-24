<template>
  <div class="share-card-component">
    <button @click="generateShareCard" class="btn btn-secondary">
      📷 Generate Share Card
    </button>

    <div v-if="showModal" class="modal-overlay" @click="showModal = false">
      <div class="modal-content" @click.stop>
        <button class="close-btn" @click="showModal = false">×</button>
        <h3 class="modal-title">Your Chinese Name Card</h3>

        <!-- 可导出的分享卡内容 -->
        <div ref="shareCardRef" class="share-card">
          <div class="share-card-header">
            <h2 class="share-card-title">My Chinese Name</h2>
          </div>
          <div class="share-card-body">
            <div class="share-name">{{ name.name }}</div>
            <div class="share-pinyin">{{ name.pinyin }}</div>
            <div class="share-meaning">"{{ name.meaning }}"</div>
          </div>
          <div class="share-card-footer">
            <p>Generated with ❤️ by Chinese Name Generator</p>
            <p class="website">yourwebsite.com</p>
          </div>
        </div>

        <div class="modal-actions">
          <button @click="downloadCard" class="btn">
            💾 Download Image
          </button>
          <button @click="shareToSocial" class="btn btn-secondary">
            📤 Share
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick } from 'vue'
import html2canvas from 'html2canvas'

const props = defineProps({
  name: {
    type: Object,
    required: true
  }
})

const shareCardRef = ref(null)
const showModal = ref(false)

const generateShareCard = async () => {
  showModal.value = true
  // 等待DOM渲染完成
  await nextTick()
}

const downloadCard = async () => {
  if (!shareCardRef.value) return

  const canvas = await html2canvas(shareCardRef.value, {
    scale: 2,
    backgroundColor: '#ffffff',
    useCORS: true
  })

  const link = document.createElement('a')
  link.download = `my-chinese-name-${props.name.pinyin.toLowerCase().replace(/\s+/g, '-')}.png`
  link.href = canvas.toDataURL('image/png')
  link.click()
}

const shareToSocial = async () => {
  if (!shareCardRef.value) return

  const canvas = await html2canvas(shareCardRef.value, {
    scale: 1,
    backgroundColor: '#ffffff'
  })

  const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'))

  if (navigator.share) {
    try {
      await navigator.share({
        title: 'My Chinese Name',
        text: `Check out my Chinese name: ${props.name.name} (${props.name.pinyin}) - ${props.name.meaning}`,
        files: [new File([blob], 'my-chinese-name.png', { type: 'image/png' })]
      })
    } catch (error) {
      console.log('Share canceled or failed:', error)
    }
  } else {
    // 降级处理：复制分享文案到剪贴板
    const shareText = `My Chinese name is ${props.name.name} (${props.name.pinyin}) which means "${props.name.meaning}". Generate yours at yourwebsite.com!`
    await navigator.clipboard.writeText(shareText)
    alert('Share text copied to clipboard! You can paste it to social media.')
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 16px;
  padding: 2rem;
  max-width: 500px;
  width: 90%;
  position: relative;
}

.close-btn {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #666;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-title {
  text-align: center;
  margin-bottom: 1.5rem;
  color: #333;
}

.share-card {
  width: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  padding: 2rem;
  color: white;
  text-align: center;
  margin-bottom: 1.5rem;
}

.share-card-header {
  margin-bottom: 2rem;
}

.share-card-title {
  font-size: 1.5rem;
  font-weight: 600;
  opacity: 0.95;
}

.share-name {
  font-size: 3.5rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  font-family: 'Microsoft YaHei', 'PingFang SC', sans-serif;
}

.share-pinyin {
  font-size: 1.5rem;
  margin-bottom: 1rem;
  opacity: 0.9;
}

.share-meaning {
  font-size: 1.1rem;
  line-height: 1.6;
  font-style: italic;
  opacity: 0.95;
}

.share-card-footer {
  margin-top: 2rem;
  font-size: 0.9rem;
  opacity: 0.8;
}

.website {
  font-weight: 600;
  margin-top: 0.25rem;
}

.modal-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
}
</style>
