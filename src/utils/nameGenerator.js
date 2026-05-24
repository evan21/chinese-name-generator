import { pinyin } from 'pinyin-pro'
import names from '../data/names.json'
import { checkTaboo } from '../data/taboo.js'

// 计算英文名和中文名的音译匹配度
function calculatePinyinMatch(englishName, chineseName) {
  const englishLower = englishName.toLowerCase()
  const chinesePinyin = pinyin(chineseName, { toneType: 'none' }).replace(/\s+/g, '').toLowerCase()

  // 计算首字母匹配
  const englishFirst = englishLower[0]
  const chineseFirst = chinesePinyin[0]
  const firstLetterMatch = englishFirst === chineseFirst ? 3 : 0

  // 计算发音相似度
  let similarity = 0
  if (chinesePinyin.includes(englishLower.slice(0, 2))) similarity += 2
  if (englishLower.includes(chinesePinyin.slice(0, 2))) similarity += 2
  if (Math.abs(englishLower.length - chinesePinyin.length) <= 2) similarity += 1

  return firstLetterMatch + similarity
}

// 计算用户偏好匹配度
function calculatePreferenceMatch(name, preferences) {
  let score = 0

  // 性别匹配
  if (name.gender === preferences.gender || name.gender === 'neutral') {
    score += 5
  }

  // 使用场景匹配
  if (preferences.scene) {
    score += name.suitability[preferences.scene] || 0
  }

  // 风格标签匹配
  if (preferences.style && name.tags.includes(preferences.style)) {
    score += 3
  }

  // 爱好关键词匹配
  if (preferences.hobbies) {
    const hobbies = preferences.hobbies.toLowerCase()
    if (hobbies.includes('art') || hobbies.includes('music') || hobbies.includes('creative')) {
      if (name.tags.includes('creative') || name.tags.includes('poetic')) score += 2
    }
    if (hobbies.includes('business') || hobbies.includes('career')) {
      if (name.tags.includes('professional') || name.tags.includes('ambitious')) score += 2
    }
    if (hobbies.includes('nature') || hobbies.includes('outdoor')) {
      if (name.tags.includes('natural') || name.tags.includes('nature')) score += 2
    }
  }

  return score
}

// 生成名字主函数
export function generateNames(userInput) {
  const { englishName, gender, scene, style, hobbies } = userInput
  const preferences = { gender, scene, style, hobbies }

  // 为每个名字计算总分
  const scoredNames = names.map(name => {
    // 先检查禁忌
    const tabooCheck = checkTaboo(name.name)
    if (tabooCheck.hasTaboo) return null

    const pinyinScore = calculatePinyinMatch(englishName, name.name)
    const preferenceScore = calculatePreferenceMatch(name, preferences)
    const totalScore = pinyinScore + preferenceScore

    return {
      ...name,
      score: totalScore,
      matchPercentage: Math.min(Math.round((totalScore / 15) * 100), 100)
    }
  })

  // 过滤掉无效名字，按分数排序，取前5个
  const validNames = scoredNames.filter(Boolean).sort((a, b) => b.score - a.score).slice(0, 5)

  return validNames
}