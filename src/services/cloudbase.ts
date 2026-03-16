/**
 * 腾讯 CloudBase 接入层
 * 环境: matrixmirix-7g61h39ff45cbd14 (ap-shanghai)
 * 域名: myrawzm0406.online
 *
 * 策略：云端优先，失败自动降级到 localStorage，不影响页面使用。
 */

import cloudbase from '@cloudbase/js-sdk'

const ENV_ID = 'matrixmirix-7g61h39ff45cbd14'
const REGION = 'ap-shanghai'

// ─── 集合名称 ─────────────────────────────────────────────────────────────────
export const COL = {
  profiles: 'whatif_profiles',
  days: 'whatif_days',
  memos: 'whatif_memos',
  regrets: 'whatif_regrets',
  decisionReviews: 'whatif_decision_reviews',
} as const

// ─── 初始化 ───────────────────────────────────────────────────────────────────
let _app: ReturnType<typeof cloudbase.init> | null = null
let _db: ReturnType<ReturnType<typeof cloudbase.init>['database']> | null = null
let _ready = false
let _initPromise: Promise<boolean> | null = null

export function isCloudBaseReady(): boolean {
  return _ready
}

export function getDB() {
  return _db
}

export async function initCloudBase(): Promise<boolean> {
  if (_ready) return true
  if (_initPromise) return _initPromise

  _initPromise = (async () => {
    try {
      _app = cloudbase.init({
        env: ENV_ID,
        region: REGION,
      })

      // 匿名登录（无需用户账号即可读写，需在 CloudBase 控制台开启匿名登录）
      const auth = _app.auth({ persistence: 'local' })
      const loginState = await auth.getLoginState()
      if (!loginState) {
        await (auth as any).anonymousAuthProvider().signIn()
      }

      _db = _app.database()
      _ready = true
      console.log('[CloudBase] 初始化成功')
      return true
    } catch (e) {
      console.warn('[CloudBase] 初始化失败，降级到 localStorage', e)
      _ready = false
      return false
    }
  })()

  return _initPromise
}

// 在模块加载时异步初始化，不阻塞页面
initCloudBase().catch(() => {})

// ─── 通用 CRUD ────────────────────────────────────────────────────────────────

/** 查询集合，按 profileId 过滤 */
export async function dbQuery<T extends Record<string, unknown>>(
  collection: string,
  profileId?: string,
): Promise<T[]> {
  if (!_ready || !_db) return []
  try {
    const col = _db.collection(collection)
    const q = profileId ? col.where({ profileId }) : col
    const res = await q.limit(500).get()
    // CloudBase 返回的每条记录含 _id，透传给调用方
    return (res.data ?? []) as T[]
  } catch (e) {
    console.warn(`[CloudBase] query ${collection} failed`, e)
    return []
  }
}

/** 新增或更新一条记录（以 id 字段作为业务主键）*/
export async function dbUpsert(
  collection: string,
  doc: Record<string, unknown>,
): Promise<boolean> {
  if (!_ready || !_db) return false
  try {
    const id = doc.id as string
    if (!id) return false
    const col = _db.collection(collection)
    // 先查是否存在
    const existing = await col.where({ id }).limit(1).get()
    if (existing.data && existing.data.length > 0) {
      await col.where({ id }).update(doc)
    } else {
      await col.add(doc)
    }
    return true
  } catch (e) {
    console.warn(`[CloudBase] upsert ${collection} failed`, e)
    return false
  }
}

/** 删除一条记录（按业务 id 字段）*/
export async function dbDelete(
  collection: string,
  id: string,
): Promise<boolean> {
  if (!_ready || !_db) return false
  try {
    await _db.collection(collection).where({ id }).remove()
    return true
  } catch (e) {
    console.warn(`[CloudBase] delete ${collection} failed`, e)
    return false
  }
}

/** 批量同步：将本地数组全量 upsert 到云端 */
export async function dbSyncBatch(
  collection: string,
  docs: Record<string, unknown>[],
): Promise<void> {
  if (!_ready || !_db) return
  for (const doc of docs) {
    await dbUpsert(collection, doc)
  }
}
