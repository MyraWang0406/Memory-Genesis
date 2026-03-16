export type EventType = 'interview' | 'negotiation' | 'collaboration' | 'project' | 'relationship' | 'personal' | 'other'
export type RiskPreference = 'low' | 'medium' | 'high'

export interface RoleProfile {
  id: string
  name: string
  type: 'self' | 'counterpart' | 'third-party'
  goal: string
  constraints: string
  riskPreference: RiskPreference
  typicalBehavior: string
  impactOnOutcome: string
}

export interface WhatIfBranch {
  id: string
  hypothesis: string
  likelyCounterpartReaction: string
  chainedOutcome: string
  finalImpact: 'positive' | 'neutral' | 'negative'
}

export interface MemoryEvent {
  id: string
  title: string
  type: EventType
  date: string
  myGoal: string
  constraints: string
  actions: string
  result: string
  misjudgment: string
  nextTimeWouldDo: string
  roles: RoleProfile[]
  whatIfBranches: WhatIfBranch[]
  tags: string[]
  moodScore?: number
}

export interface RecurringPattern {
  id: string
  label: string
  description: string
  occurrences: number
  affectedEvents: string[]
  severity: 'low' | 'medium' | 'high'
}

export interface ActionPlan {
  id: string
  forEventType: EventType
  triggerContext: string
  steps: string[]
  avoidList: string[]
  firstQuestions: string[]
  signalToStop: string
  roleSpecificTips: { roleType: string; tip: string }[]
}

export const DEMO_EVENTS: MemoryEvent[] = [
  {
    id: 'evt-001', title: '与主管的季度沟通 — 期望错位',
    type: 'collaboration', date: '2024-10-12', moodScore: 4,
    myGoal: '争取 Q4 资源支持，推进项目立项',
    constraints: '主管在推进另一条业务线；我没提前了解她的优先级',
    actions: '花大半会议时间汇报进展细节，最后才提资源需求',
    result: '主管说先等等，Q4 方向还没定，资源未获批',
    misjudgment: '以为详细汇报能建立信任；实际主管关心方向对不对，不是进展细节',
    nextTimeWouldDo: '开场先问主管当前最关心的方向，把项目挂钩，最后提需求',
    tags: ['context-mismatch', 'work', 'communication'],
    roles: [
      { id: 'r-001-1', name: '我', type: 'self', goal: '获得资源支持', constraints: '不了解对方优先级', riskPreference: 'low', typicalBehavior: '先铺垫再提需求', impactOnOutcome: '占用时间，错过对齐窗口' },
      { id: 'r-001-2', name: '主管', type: 'counterpart', goal: '稳住整体方向', constraints: 'Q4 资源吃紧方向未定', riskPreference: 'low', typicalBehavior: '不确定时倾向搁置', impactOnOutcome: '方向未对齐前拒绝资源申请' },
    ],
    whatIfBranches: [
      { id: 'wif-001-1', hypothesis: '如果开场先问主管最看重的 Q4 方向', likelyCounterpartReaction: '她会说出核心业务线，我可以立刻挂钩', chainedOutcome: '资源申请进入对的语境，被搁置概率大幅降低', finalImpact: 'positive' },
      { id: 'wif-001-2', hypothesis: '如果把进展汇报压缩到 3 分钟重心放在业务价值', likelyCounterpartReaction: '更容易看到战略价值', chainedOutcome: '即使资源未批，留下更好印象', finalImpact: 'neutral' },
    ],
  },
  {
    id: 'evt-002', title: '和老友的合伙谈判 — 情感与商业边界模糊',
    type: 'negotiation', date: '2024-11-28', moodScore: 3,
    myGoal: '确定合伙条款，明确分工与利润分配',
    constraints: '对方是多年朋友，不想谈钱伤感情',
    actions: '绕了很多圈子，没有直接谈分成；最后匆忙口头约定未落文字',
    result: '合伙启动，三个月后因分成理解不同产生争议',
    misjudgment: '以为老朋友默契可以替代清晰约定；越是老朋友越需要白纸黑字',
    nextTimeWouldDo: '把核心条款用文字列出来，以保护彼此为出发点引导对方确认',
    tags: ['negotiation', 'relationship', 'ambiguity'],
    roles: [
      { id: 'r-002-1', name: '我', type: 'self', goal: '推进合伙又维护关系', constraints: '害怕谈钱破坏友谊', riskPreference: 'low', typicalBehavior: '回避直接冲突模糊处理', impactOnOutcome: '关键条款悬而未决' },
      { id: 'r-002-2', name: '老朋友', type: 'counterpart', goal: '快速启动项目', constraints: '觉得以后再说', riskPreference: 'high', typicalBehavior: '乐观主义先做再说', impactOnOutcome: '强化了模糊处理动机' },
    ],
    whatIfBranches: [
      { id: 'wif-002-1', hypothesis: '如果用保护我们的友谊作为框架引出条款讨论', likelyCounterpartReaction: '朋友更容易接受，这是保护关系不是讲钱', chainedOutcome: '条款谈清楚，后来争议大概率不会发生', finalImpact: 'positive' },
      { id: 'wif-002-2', hypothesis: '如果发起简短确认邮件记录口头约定', likelyCounterpartReaction: '对方大概率回复确认形成非正式书面记录', chainedOutcome: '即使记忆偏差也有参考依据', finalImpact: 'positive' },
    ],
  },
  {
    id: 'evt-003', title: '新功能立项推动 — 跨部门阻力',
    type: 'project', date: '2025-01-08', moodScore: 5,
    myGoal: '推动新功能立项，获得技术和设计资源',
    constraints: '技术排期已满；设计优先级由另一条线决定；我没有直接管理权',
    actions: '发了一封长邮件说明需求背景和用户价值，等待回复',
    result: '技术回复排期看下周，设计没有回复；两周后项目被搁置',
    misjudgment: '以为发邮件说清楚需求就够了；跨部门推动需要当面对齐，邮件容易被忽视',
    nextTimeWouldDo: '先和关键决策者当面 15 分钟同步，找到利益接合点，再推资源',
    tags: ['project', 'cross-team', 'alignment'],
    roles: [
      { id: 'r-003-1', name: '我（产品经理）', type: 'self', goal: '推动立项落地', constraints: '没有直线管理权', riskPreference: 'medium', typicalBehavior: '用文档和邮件推进', impactOnOutcome: '邮件在高排期压力下效率极低' },
      { id: 'r-003-2', name: '技术负责人', type: 'counterpart', goal: '完成当前排期', constraints: 'Sprint 已排满', riskPreference: 'low', typicalBehavior: '没有明确优先级就不动', impactOnOutcome: '搁置了优先级不明的需求' },
      { id: 'r-003-3', name: '设计团队', type: 'third-party', goal: '完成已有任务', constraints: '另一条线优先', riskPreference: 'low', typicalBehavior: '无明确指令不响应', impactOnOutcome: '无回复，项目搁置' },
    ],
    whatIfBranches: [
      { id: 'wif-003-1', hypothesis: '如果先约技术负责人 15 分钟当面对话', likelyCounterpartReaction: '当面更难拒绝，能直接了解排期窗口', chainedOutcome: '找到资源缺口，推动小版本先行', finalImpact: 'positive' },
      { id: 'wif-003-2', hypothesis: '如果把需求拆成最小 MVP 只申请 1 人 1 周', likelyCounterpartReaction: '小资源申请更容易获批', chainedOutcome: '先跑通核心路径后续迭代', finalImpact: 'positive' },
    ],
  },
  {
    id: 'evt-004', title: '面试终面 — 表达失焦',
    type: 'interview', date: '2025-02-20', moodScore: 4,
    myGoal: '展示系统性产品思维，拿到 offer',
    constraints: '只有 45 分钟；面试官日程很满',
    actions: '一上来花 15 分钟讲项目背景，试图铺垫再讲亮点',
    result: '面试官中途打断，问最核心的判断是什么，我没能清晰回答，未通过',
    misjudgment: '以为对方需要完整上下文；实际面试官想要的是结论与判断力',
    nextTimeWouldDo: '先给结论再补充背景；前 2 分钟问对方最关心什么维度',
    tags: ['context-mismatch', 'interview', 'over-explain'],
    roles: [
      { id: 'r-004-1', name: '我', type: 'self', goal: '展示完整项目经历', constraints: '习惯铺垫背景再讲结论', riskPreference: 'low', typicalBehavior: '详细叙述背景再过渡结论', impactOnOutcome: '面试官失去耐心' },
      { id: 'r-004-2', name: '面试官 P8', type: 'counterpart', goal: '快速判断候选人决策质量', constraints: '日程紧张已看过简历', riskPreference: 'low', typicalBehavior: '听 2 分钟没看到判断力会打断', impactOnOutcome: '打断后候选人慌乱' },
    ],
    whatIfBranches: [
      { id: 'wif-004-1', hypothesis: '如果先问您最想了解哪个维度', likelyCounterpartReaction: '面试官会说想看判断力和取舍逻辑', chainedOutcome: '可以直接跳过铺垫聚焦决策过程', finalImpact: 'positive' },
      { id: 'wif-004-2', hypothesis: '如果前 3 分钟只讲结论和核心判断', likelyCounterpartReaction: '面试官会主动追问背景进入双向对话', chainedOutcome: '展示判断力节奏由面试官主导', finalImpact: 'positive' },
    ],
  },
  {
    id: 'evt-005', title: '个人职业方向抉择 — 留还是转',
    type: 'personal', date: '2025-03-01', moodScore: 3,
    myGoal: '做出是否跳槽的决策，减少后悔',
    constraints: '房贷压力大，不能轻易断薪；当前工作成长停滞',
    actions: '和几个朋友聊了聊，刷了一些 offer，没有系统评估',
    result: '还在犹豫中，已经拖了 3 个月',
    misjudgment: '把收集信息等同于在推进决策；没有设定截止日期，信息收集无限延续',
    nextTimeWouldDo: '列出最重要的 3 个决策标准，设定 2 周决策窗口，到期强制做出选择',
    tags: ['personal', 'career', 'decision'],
    roles: [
      { id: 'r-005-1', name: '我', type: 'self', goal: '找到更有成长性的工作', constraints: '财务压力 + 信息焦虑', riskPreference: 'low', typicalBehavior: '收集信息拖延决策', impactOnOutcome: '决策窗口一再延迟' },
      { id: 'r-005-2', name: '市场环境', type: 'third-party', goal: '无主观目标', constraints: '经济下行，机会减少', riskPreference: 'high', typicalBehavior: '不确定性持续增加', impactOnOutcome: '拖延越久选项越少' },
    ],
    whatIfBranches: [
      { id: 'wif-005-1', hypothesis: '如果设定 2 周决策窗口并写下 3 个核心标准', likelyCounterpartReaction: '强制自己在约束内做决定', chainedOutcome: '减少信息焦虑，做出当前最优选择', finalImpact: 'positive' },
      { id: 'wif-005-2', hypothesis: '如果先做一个最小测试（兼职或副业）', likelyCounterpartReaction: '用行动降低风险感知', chainedOutcome: '在不断薪的情况下验证新方向', finalImpact: 'positive' },
    ],
  },
]

export const RECURRING_PATTERNS: RecurringPattern[] = [
  { id: 'pat-001', label: 'Context 不对齐就开始表达', description: '在没确认对方的关注点和期望之前，就开始展开自己的背景和方案。短期收益：快速进入表达，避免冷场。长期代价：双方信息框架不同，表达失焦，重复沟通成本高。', occurrences: 3, affectedEvents: ['evt-001', 'evt-003', 'evt-004'], severity: 'high' },
  { id: 'pat-002', label: '结论后置 / 铺垫过多', description: '习惯先讲背景和过程，再给结论。短期收益：感觉更完整、更有说服力。长期代价：在高压、时间有限的场景中，对方失去耐心或无法抓住重点，错失关键窗口。', occurrences: 3, affectedEvents: ['evt-001', 'evt-004'], severity: 'high' },
  { id: 'pat-003', label: '模糊处理以回避冲突', description: '在有潜在冲突的场景（谈判、资源申请）中，倾向于回避直接表达。短期收益：维持表面和谐，避免当下不适。长期代价：关键问题悬而未决，后续争议成本更高，路径依赖加深。', occurrences: 2, affectedEvents: ['evt-002', 'evt-005'], severity: 'medium' },
]

export const SIMILARITY_RECALL = [
  { eventId: 'evt-001', score: 0.88, reason: '同为职场沟通场景，对方优先级未知。你在此类场景中重复了"context 不对齐就开始表达"的旧路径', warningPatterns: ['Context 不对齐就开始表达', '结论后置'], preemptiveAdvice: '开场 2 分钟：先问对方最关心什么，再决定怎么展开。这是中断旧反应的关键窗口' },
  { eventId: 'evt-004', score: 0.76, reason: '高压时间有限场景，你容易触发"过度铺垫"的自动化反应', warningPatterns: ['结论后置 / 铺垫过多'], preemptiveAdvice: '结论先行，控制每段表达在 90 秒内。感到想铺垫背景时，暂停 2 秒问自己"这是旧路吗"' },
]

export const CURRENT_EVENT: Partial<MemoryEvent> = {
  id: 'evt-current',
  title: '即将进行的重要沟通（待录入）',
  type: 'other',
  date: new Date().toISOString().slice(0, 10),
  myGoal: '',
  constraints: '',
  tags: [],
  roles: [],
  whatIfBranches: [],
}

export const ACTION_PLAN: ActionPlan = {
  id: 'plan-001',
  forEventType: 'interview',
  triggerContext: '任何高压、时间有限、对方优先级未知的沟通场景',
  steps: [
    '识别触发信号：感到想立刻开始铺垫背景时，暂停 2 秒',
    '中断旧反应：问自己"这是不是又要走老路了？"',
    '启动新反应：开场 90 秒直接给出核心结论或目标，不铺垫',
    '第 2 分钟：主动问对方最关心哪个维度或最想解决什么问题',
    '每段表达控制在 2 分钟内；感知到打断信号立刻收束',
  ],
  avoidList: [
    '不要先讲背景再过渡到结论（旧路径特征）',
    '不要试图展示所有信息（旧路径特征）',
    '不要在对方打断后慌乱（旧路径特征）',
    '不要用"我觉得"开头，改用"我的判断是"',
  ],
  firstQuestions: [
    '你现在最关心的问题是什么？',
    '你希望这次沟通最重要的结果是什么？',
  ],
  signalToStop: '对方开始频繁看表、打断、或切换话题 → 立刻收束，问"希望我聚焦哪个部分"',
  roleSpecificTips: [
    { roleType: '上级 / 资源方', tip: '先对齐方向和优先级，再提需求；不要用细节建立信任（旧路径）' },
    { roleType: '平级合作方', tip: '找到共同利益点，把你的需求包装成对对方有价值的事' },
    { roleType: '谈判对象', tip: '用书面记录替代口头默契；越是关系近越需要清晰约定' },
  ],
}


