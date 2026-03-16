import type { FortuneItem } from '../types'

const CONSTELLATIONS_ZH = [
  '白羊座', '金牛座', '双子座', '巨蟹座', '狮子座', '处女座',
  '天秤座', '天蝎座', '射手座', '摩羯座', '水瓶座', '双鱼座',
]
const CONSTELLATIONS_EN = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces',
]

const YI_ZH = [
  ['决策', '沟通', '学习', '休息', '记录'],
  ['表达', '倾听', '复盘', '接纳', '顺势'],
  ['自省', '慎始', '知进退', '允许不完美', '温柔待己'],
  ['行动', '暂停', '觉察', '修复', '成长'],
]
const JI_ZH = [
  ['内耗', '冲动', '拖延', '自我攻击', '硬刚'],
  ['钻牛角尖', '被想法控制', '苛责自己', '逃避', '纠结'],
  ['自我定义失败', '急于求成', '对抗现实', '孤军奋战', '苛求完美'],
  ['忽视身体信号', '情绪化决策', '忽视退路', '自我否定', '固守'],
]

const YI_EN = [
  ['Decide', 'Communicate', 'Learn', 'Rest', 'Record'],
  ['Express', 'Listen', 'Review', 'Accept', 'Flow'],
  ['Reflect', 'Start wisely', 'Know when to yield', 'Allow imperfection', 'Be kind'],
  ['Act', 'Pause', 'Awareness', 'Repair', 'Grow'],
]
const JI_EN = [
  ['Rumination', 'Impulse', 'Procrastination', 'Self-attack', 'Confrontation'],
  ['Overthinking', 'Driven by thoughts', 'Self-blame', 'Avoidance', 'Worry'],
  ['Define yourself by failure', 'Rush for results', 'Fight reality', 'Go alone', 'Perfectionism'],
  ['Ignore body signals', 'Emotional decisions', 'Ignore retreat', 'Self-doubt', 'Stubborn'],
]

// 今日宜忌下方一句话：融合 ACT / 精神灵活性 / 臣服实验 / CBT / 自我悲悯 / 成长型思维 / 道家 / 儒家，不用「有气则活」式老登教诲
const TIPS_ZH = [
  '接纳情绪，不被想法带走；聚焦在当下能做的选择。（ACT）',
  '不钻牛角尖，可进可退，换一个角度就有空间。（精神灵活性）',
  '接纳现实，顺势而为，不强扭瓜。（臣服实验）',
  '用事实代替脑补，纠正认知扭曲，一步一验证。（CBT）',
  '不自我攻击，允许自己不完美，像对待朋友一样对自己。（精神灵活性：自我悲悯。来源：Kristin Neff 自我悲悯研究；核心要义：以善意与理解对待自己，尤其在失败或痛苦时，如同对待好友。）',
  '把失败当信息，不当定义；每次复盘都是下一次的起点。（成长型思维）',
  '顺势、知进退，柔弱胜刚强。（道家）',
  '每日自省，慎始慎终，知行合一。（儒家）',
]
const TIPS_EN = [
  'Accept the emotion; don’t be run by thoughts. Focus on what you can choose now. (ACT)',
  'Don’t get stuck. You can advance or step back; a shift in angle opens space. (Flexibility)',
  'Accept reality, go with the flow, don’t force it. (Surrender)',
  'Replace guesswork with facts; correct cognitive distortion step by step. (CBT)',
  'No self-attack. Allow imperfection; treat yourself as you would a friend. (Psychological flexibility: Self-compassion. Source: Kristin Neff self-compassion research; core idea: treat yourself with kindness and understanding, especially in failure or distress, as you would a good friend.)',
  'Treat failure as information, not identity; each review is the next starting point. (Growth)',
  'Flow with the situation, know when to yield; soft overcomes hard. (Daoism)',
  'Reflect daily, begin and end with care, align action with knowledge. (Confucianism)',
]

function seedFromDate(d: Date): number {
  return d.getFullYear() * 10000 + d.getMonth() * 100 + d.getDate()
}

function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5)
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t ^ (t >>> 12))
    return ((t >>> 0) / 4294967296)
  }
}

export function getConstellation(date: Date, lang: 'zh' | 'en'): string {
  const month = date.getMonth()
  const day = date.getDate()
  const list = lang === 'zh' ? CONSTELLATIONS_ZH : CONSTELLATIONS_EN
  const bounds = [21, 20, 21, 21, 22, 22, 23, 24, 24, 24, 23, 22]
  let idx = month
  if (day < bounds[month]) idx = (month + 11) % 12
  return list[idx]
}

export function getFortune(date: Date, lang: 'zh' | 'en'): FortuneItem {
  const r = mulberry32(seedFromDate(date))
  const yiList = lang === 'zh' ? YI_ZH : YI_EN
  const jiList = lang === 'zh' ? JI_ZH : JI_EN
  const tips = lang === 'zh' ? TIPS_ZH : TIPS_EN
  const yiIdx = Math.floor(r() * yiList.length)
  const jiIdx = Math.floor(r() * jiList.length)
  const tipIdx = Math.floor(r() * tips.length)
  return {
    constellation: getConstellation(date, lang),
    yi: yiList[yiIdx],
    ji: jiList[jiIdx],
    tip: tips[tipIdx],
  }
}
