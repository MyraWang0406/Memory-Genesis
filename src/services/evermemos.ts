/**
 * EverMemOS 可选接入：当配置了 VITE_EVERMEMOS_API_BASE 时，将档案/悔棋/WhatIf 同步为记忆，
 * 并支持按「用户」检索，用于复盘建议与类似场景提醒。
 * 不配置时所有调用静默跳过，不影响本地使用。
 *
 * 使用：在项目根目录创建 .env，添加 VITE_EVERMEMOS_API_BASE=http://localhost:1995
 * （需先按 EverMemOS 文档启动服务：docker compose up -d && uv run python src/run.py）
 */

const API_BASE = typeof import.meta !== 'undefined' && import.meta.env?.VITE_EVERMEMOS_API_BASE
  ? String(import.meta.env.VITE_EVERMEMOS_API_BASE).replace(/\/$/, '')
  : ''

const MEMORIES = `${API_BASE}/api/v1/memories`

function genMsgId(): string {
  return `whatif_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
}

export function isEverMemOSEnabled(): boolean {
  return !!API_BASE
}

/** 写入一条「消息」，由 EverMemOS 侧抽取为 Profile / Episodic / EventLog / Foresight */
export async function postMessage(userId: string, content: string, options?: { messageId?: string; senderName?: string }): Promise<boolean> {
  if (!API_BASE) return false
  const messageId = options?.messageId ?? genMsgId()
  try {
    const res = await fetch(`${MEMORIES}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message_id: messageId,
        create_time: new Date().toISOString(),
        sender: userId,
        sender_name: options?.senderName ?? userId,
        role: 'user',
        content,
      }),
    })
    return res.ok
  } catch {
    return false
  }
}

/** 同步档案为「身份/偏好」类记忆（Profile） */
export async function syncProfile(userId: string, profile: { name?: string; birthDate?: string; birthTime?: string; birthPlace?: string; calibrationEvents?: { timeKey: string; desc: string; kind: string }[] }): Promise<boolean> {
  const parts = ['【档案】']
  if (profile.name) parts.push(`姓名：${profile.name}`)
  if (profile.birthDate) parts.push(`出生日期：${profile.birthDate}`)
  if (profile.birthTime) parts.push(`出生时间：${profile.birthTime}`)
  if (profile.birthPlace) parts.push(`出生地：${profile.birthPlace}`)
  if (profile.calibrationEvents?.length) {
    parts.push('校准事件：' + profile.calibrationEvents.map(e => `${e.timeKey} ${e.desc}(${e.kind})`).join('；'))
  }
  return postMessage(userId, parts.join('，'))
}

/** 同步悔棋留档为事件事实（EventLog），便于后续「类似场景」检索 */
export async function syncRegret(userId: string, archive: { date: string; goal: string; loss: string; need: string; trigger: string }): Promise<boolean> {
  const content = [
    '【悔棋留档】',
    `日期：${archive.date}`,
    `当时真实目标：${archive.goal}`,
    `实际损失（时间/机会/情绪/关系）：${archive.loss}`,
    `真实需求（安全感/认可/掌控/自由/被爱）：${archive.need}`,
    `触发场景（压力/被否定/熬夜/孤独/冲动）：${archive.trigger}`,
  ].join('。')
  return postMessage(userId, content)
}

/** 同步当日情绪与简要叙事（Episodic） */
export async function syncDaySummary(userId: string, date: string, moodScore: number | null, timelineCount: number): Promise<boolean> {
  const parts = [`【日记录】日期：${date}`]
  if (moodScore != null) parts.push(`当日心情分数：${moodScore}`)
  if (timelineCount > 0) parts.push(`时间轴条目数：${timelineCount}`)
  return postMessage(userId, parts.join('；'))
}

/** 同步 WhatIf 推演/补充背景为前瞻类记忆（Foresight） */
export async function syncWhatIf(userId: string, date: string, context: string): Promise<boolean> {
  if (!context.trim()) return false
  const content = `【WhatIf推演】日期：${date}。补充背景与假设：${context.trim()}`
  return postMessage(userId, content)
}

/** 同步决策复盘为结构化事件记忆（EventLog + Episodic） */
export async function syncDecisionReview(
  userId: string,
  review: {
    id: string
    date: string
    title: string
    sceneEvent: string
    userEmotion: string
    whatHappened: string
    turningPoint: string
    userChoice: string
    regretPoint: string
    fearOrRegret: string
    desire: string
    selfAttack: string
    futureOptimize: string
    aiSummary?: string
  }
): Promise<boolean> {
  const parts = [
    `【决策复盘】ID:${review.id}`,
    `日期：${review.date}`,
    `事件：${review.title} — ${review.sceneEvent}`,
    `用户情绪：${review.userEmotion}`,
    `发生了什么：${review.whatHappened}`,
    `转折点：${review.turningPoint}`,
    `当时选择：${review.userChoice}`,
    `后悔点：${review.regretPoint}`,
    `害怕/后悔：${review.fearOrRegret}`,
    `真实渴望：${review.desire}`,
    `自我攻击点：${review.selfAttack}`,
    `未来优化：${review.futureOptimize}`,
  ]
  if (review.aiSummary) parts.push(`AI复盘摘要：${review.aiSummary}`)
  return postMessage(userId, parts.join('。'), { messageId: `dr_${review.id}` })
}

/** 检索记忆：用于「类似场景」提醒与复盘建议 */
export async function searchMemories(
  userId: string,
  query: string,
  options?: { memoryTypes?: string[]; topK?: number }
): Promise<{ ok: boolean; memories?: unknown[]; totalCount?: number }> {
  if (!API_BASE) return { ok: false }
  try {
    const res = await fetch(`${MEMORIES}/search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query,
        user_id: userId,
        memory_types: options?.memoryTypes ?? ['episodic_memory', 'event_log'],
        top_k: options?.topK ?? 10,
        retrieve_method: 'hybrid',
      }),
    })
    if (!res.ok) return { ok: false }
    const data = await res.json()
    const result = data?.result ?? {}
    return {
      ok: true,
      memories: result.memories,
      totalCount: result.total_count,
    }
  } catch {
    return { ok: false }
  }
}
