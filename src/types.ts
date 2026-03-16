export type Dimension = 'home' | 'about' | 'profile' | 'day' | 'week' | 'month' | 'quarter' | 'year' | 'lifetime'

/** EverMemOS-style: Profile = Who，长期身份与档案 */
export interface Profile {
  id: string
  name?: string
  birthDate: string // YYYY-MM-DD
  birthTime?: string // HH:mm，出生时间
  birthPlace?: string // 存储格式 "国家|省|市"，如 "中国|广东省|深圳市" 或 "美国||纽约"
  calibrationEvents: CalibrationEvent[]
  createdAt: string
}

/** 校准吉凶：时间可精确到年 / 年月 / 日 */
export interface CalibrationEvent {
  id: string
  timeKey: string // YYYY | YYYY-MM | YYYY-MM-DD
  desc: string
  kind: '吉' | '凶'
}

/** 日记录：与档案绑定，一生维度仍用 lifetime */
export interface DayRecord {
  id: string
  profileId: string
  date: string // YYYY-MM-DD
  moodScore: number | null // 每日一行心情分数 0～10
  timeline: TimelineEntry[]
  whatIfContext?: string // 模拟推演/WhatIf 补充背景
  edits: number
}

/** Memo & WhatIf 标签类型 */
export type MemoTagType = '心情随感' | '职场随记' | '设想推演'

export interface TimelineEntry {
  id: string
  time: string // HH:mm（日精确到小时）
  tagType: MemoTagType
  tags: string[]
  memo: string
  createdAt: string
}

/** 统一 Memo 档案：日周月年一生共用，精度由 timeKey 决定 */
export interface MemoEntry {
  id: string
  profileId: string
  dimension: Dimension
  timeKey: string // 日: YYYY-MM-DDTHH:mm, 周/月: YYYY-MM-DD, 年: YYYY-MM, 一生: YYYY
  tagType: MemoTagType
  content: string
  createdAt: string
}

export interface RegretArchive {
  id: string
  profileId: string
  date: string
  recordId: string
  goal: string
  loss: string
  need: string
  trigger: string
  createdAt: string
}

// ─── 人生决策复盘与心理释怀系统 ───────────────────────────────────────────────

/** 场景信息 */
export interface DecisionSceneInfo {
  event: string
  time: string        // 可选择预设时间段
  place: string
  userEmotion: string
}

/** 单个人物信息 */
export interface DecisionCharacter {
  id: string
  name: string          // 名字/昵称/代号
  role: string          // 棋局角色
  behavior: string
  personality: string
  stance: string        // 立场/背后苦衷
  realDemand: string    // 真实诉求
}

/** 事件事实 */
export interface DecisionFacts {
  whatHappened: string
  turningPoint: string
  userChoice: string
  regretPoint: string
}

/** 潜在背景 */
export interface DecisionBackground {
  interestRelation: string   // 利益关系
  powerRelation: string      // 权力关系
  historicalIssues: string   // 历史旧账
  hiddenRules: string        // 隐性规则
}

/** 用户内心 */
export interface DecisionInnerWorld {
  fearOrRegret: string       // 害怕/后悔什么
  desire: string             // 想要什么
  selfAttack: string         // 自我攻击点
  futureOptimize: string     // 下回如何优化
}

/** AI 输出结果 */
export interface DecisionAIOutput {
  rolePanorama: string       // 角色全景立场分析
  boardAnalysis: string      // 局解
  optimalPath: string        // 当时最优决策路径
  futureGuide: string        // 未来破局指南
  bulletNote: string         // 可复盘子弹笔记
  adviceFa?: string
  adviceShi?: string
  adviceQing?: string
  adviceRen?: string
}

/** 完整决策复盘档案 */
export interface DecisionReview {
  id: string
  profileId: string
  date: string               // YYYY-MM-DD 关联日期
  endDate?: string           // 可跨天/月/季/年
  title: string              // 事件简标题
  scene: DecisionSceneInfo
  characters: DecisionCharacter[]
  facts: DecisionFacts
  background: DecisionBackground
  innerWorld: DecisionInnerWorld
  aiOutput?: DecisionAIOutput
  chatHistory: DecisionChatMessage[]
  createdAt: string
  updatedAt: string
}

/** 多轮对话消息 */
export interface DecisionChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

export interface FortuneItem {
  yi: string[]
  ji: string[]
  constellation: string
  tip: string
}
