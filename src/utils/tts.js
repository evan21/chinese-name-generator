// 使用Google TTS API生成发音
export function speakChinese(text) {
  // 构建Google TTS API URL
  const encodedText = encodeURIComponent(text)
  const url = `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=zh-CN&q=${encodedText}`

  // 创建音频对象并播放
  const audio = new Audio(url)
  audio.play().catch(error => {
    console.error('Failed to play audio:', error)
    // 降级处理：使用浏览器自带的语音合成
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = 'zh-CN'
      speechSynthesis.speak(utterance)
    }
  })
}

// 慢速发音
export function speakChineseSlow(text) {
  if ('speechSynthesis' in window) {
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = 'zh-CN'
    utterance.rate = 0.7 // 70%语速
    speechSynthesis.speak(utterance)
  } else {
    // 降级使用正常速度
    speakChinese(text)
  }
}
