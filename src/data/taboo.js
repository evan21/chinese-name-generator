export const tabooWords = [
  // 负面含义词汇
  "死", "亡", "病", "灾", "难", "祸", "悲", "哀", "伤", "痛",
  "贫", "穷", "苦", "难", "愚", "蠢", "笨", "傻", "呆", "懒",
  // 不好的谐音词
  "霉", "楣", "煤",
  "屎",
  "猪",
  "狗",
  "无",
  "假",
  // 现代网络贬义词汇
  "坑", "菜", "渣",
  // 文化敏感词汇
  "鬼", "怪", "妖", "魔", "邪", "恶"
]

export const tabooCombinations = [
  // 不好的名字组合
  ["史", "珍"], // 谐音"屎真"
  ["吴", "德"], // 谐音"无德"
  ["贾", "正"], // 谐音"假正"
  ["苟", "胜"], // 谐音"狗剩"
  ["朱", "投"], // 谐音"猪头"
]

// 检查名字是否包含禁忌内容
export function checkTaboo(name) {
  // 检查单个字
  for (const char of name) {
    if (tabooWords.includes(char)) {
      return {
        hasTaboo: true,
        reason: `Contains inappropriate character: "${char}"`
      }
    }
  }

  // 检查组合禁忌
  for (const combo of tabooCombinations) {
    if (name.includes(combo[0]) && name.includes(combo[1])) {
      return {
        hasTaboo: true,
        reason: `Contains inappropriate combination: "${combo[0]}${combo[1]}"`
      }
    }
  }

  return { hasTaboo: false }
}