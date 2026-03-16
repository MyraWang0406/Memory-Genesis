/**
 * 豆包 API 存根（降级版）
 * 当前未接入任何 AI 服务，所有函数安全降级，不发起网络请求。
 * 接入真实 API 时替换此文件即可。
 */

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface DoubaoResponse {
  ok: boolean
  content?: string
  error?: string
}

/** 永远返回 false，表示 AI 服务未配置 */
export function isDoubaoEnabled(): boolean {
  return false
}

/** 不发起任何网络请求，直接返回未配置提示 */
export async function chatWithDoubao(
  _messages: ChatMessage[],
  _options?: { temperature?: number; maxTokens?: number },
): Promise<DoubaoResponse> {
  return { ok: false, error: 'AI service is not configured yet' }
}

/** 将复盘上下文对象序列化为可读文本 */
export function serializeReviewContext(context: unknown): string {
  try {
    if (typeof context === 'string') return context
    return JSON.stringify(context, null, 2)
  } catch {
    return String(context ?? '')
  }
}

/** 构造本地占位 messages，保证类型正确，组件调用不报错 */
export function buildAnalysisMessages(
  contextText: string,
  chatHistory: { role: 'user' | 'assistant'; content: string }[] = [],
  _forceAnalyze = false,
): ChatMessage[] {
  const history: ChatMessage[] = chatHistory.map((m) => ({
    role: m.role,
    content: m.content,
  }))
  return [
    {
      role: 'system',
      content: '你是一位温柔、理性、治愈的人生决策复盘顾问。（AI 服务暂未配置，此为本地占位消息）',
    },
    ...history,
    {
      role: 'user',
      content: contextText,
    },
  ]
}
