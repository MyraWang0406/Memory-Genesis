/**
 * store.ts — 统一数据层
 * 写入策略：先写 localStorage（同步，保证 UI 即时可用），再异步写云端。
 * 读取策略：优先从云端拉取（初次加载），云端不可用则用 localStorage。
 */
import type { DayRecord, RegretArchive, Profile, MemoEntry, DecisionReview } from './types'
import { COL, dbQuery, dbUpsert, dbDelete, isCloudBaseReady } from './services/cloudbase'

const DAYS_KEY = 'whatif-days'
const DECISION_REVIEWS_KEY = 'whatif-decision-reviews'
const REGRETS_KEY = 'whatif-regrets'
const PROFILES_KEY = 'whatif-profiles'
const CURRENT_PROFILE_KEY = 'whatif-current-profile'
const MEMOS_KEY = 'whatif-memos'
const LANG_KEY = 'whatif-lang'
const CONSTELLATION_MODE_KEY = 'whatif-constellation-mode'

export type ConstellationMode = 'profile' | 'date'

// ─── 云端异步写（fire-and-forget，不阻塞 UI）────────────────────────────────
function cloudPush(collection: string, doc: Record<string, unknown>) {
  if (isCloudBaseReady()) {
    dbUpsert(collection, doc).catch(() => {})
  }
}
function cloudDelete(collection: string, id: string) {
  if (isCloudBaseReady()) {
    dbDelete(collection, id).catch(() => {})
  }
}

// ─── 云端拉取并合并到本地（覆盖策略：云端优先）───────────────────────────────
async function pullFromCloud<T extends { id: string }>(
  collection: string,
  localKey: string,
  profileId?: string,
): Promise<T[]> {
  if (!isCloudBaseReady()) return localGet<T>(localKey, profileId)
  try {
    const remote = await dbQuery<T & Record<string, unknown>>(collection, profileId)
    if (remote.length > 0) {
      // 合并：将云端数据写回本地缓存
      const all = localGetAll<T>(localKey)
      for (const item of remote) {
        const idx = all.findIndex((x) => x.id === item.id)
        if (idx >= 0) all[idx] = item
        else all.push(item)
      }
      localStorage.setItem(localKey, JSON.stringify(all))
      return profileId ? all.filter((x: T & Record<string, unknown>) => (x as Record<string, unknown>).profileId === profileId) : all
    }
  } catch (e) {
    console.warn('[store] cloud pull failed, using localStorage', e)
  }
  return localGet<T>(localKey, profileId)
}

function localGetAll<T>(key: string): T[] {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : []
  } catch { return [] }
}

function localGet<T extends Record<string, unknown>>(key: string, profileId?: string): T[] {
  const all = localGetAll<T>(key)
  if (profileId) return all.filter((x) => x.profileId === profileId)
  return all
}

// ---------- Profiles ----------
export function loadProfiles(): Profile[] {
  return localGetAll<Profile>(PROFILES_KEY)
}

export async function loadProfilesAsync(): Promise<Profile[]> {
  return pullFromCloud<Profile>(COL.profiles, PROFILES_KEY)
}

export function saveProfiles(profiles: Profile[]) {
  localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles))
  // 逐条同步云端
  for (const p of profiles) cloudPush(COL.profiles, p as unknown as Record<string, unknown>)
}

export function getCurrentProfileId(): string | null {
  return localStorage.getItem(CURRENT_PROFILE_KEY)
}

export function setCurrentProfileId(id: string | null) {
  if (id == null) localStorage.removeItem(CURRENT_PROFILE_KEY)
  else localStorage.setItem(CURRENT_PROFILE_KEY, id)
}

export function getCurrentProfile(): Profile | null {
  const id = getCurrentProfileId()
  if (!id) return null
  return loadProfiles().find((p) => p.id === id) ?? null
}

// ---------- Days ----------
export function loadDays(profileId?: string | null): DayRecord[] {
  return localGet<DayRecord & Record<string, unknown>>(DAYS_KEY, profileId ?? undefined)
}

export async function loadDaysAsync(profileId?: string | null): Promise<DayRecord[]> {
  return pullFromCloud<DayRecord>(COL.days, DAYS_KEY, profileId ?? undefined)
}

export function saveDays(days: DayRecord[]) {
  localStorage.setItem(DAYS_KEY, JSON.stringify(days))
}

export function getDayRecord(date: string, profileId: string | null): DayRecord | null {
  if (!profileId) return null
  return loadDays(profileId).find((d) => d.date === date) ?? null
}

export function upsertDayRecord(record: DayRecord) {
  const all = loadDays(null)
  const idx = all.findIndex((d) => d.date === record.date && d.profileId === record.profileId)
  if (idx >= 0) all[idx] = record
  else all.push(record)
  all.sort((a, b) => a.date.localeCompare(b.date))
  saveDays(all)
  cloudPush(COL.days, record as unknown as Record<string, unknown>)
  return record
}

// ---------- Memos ----------
function loadAllMemos(): MemoEntry[] {
  return localGetAll<MemoEntry>(MEMOS_KEY)
}

export function loadMemos(profileId: string | null): MemoEntry[] {
  if (!profileId) return []
  return loadAllMemos().filter((m) => m.profileId === profileId)
}

export async function loadMemosAsync(profileId: string): Promise<MemoEntry[]> {
  return pullFromCloud<MemoEntry>(COL.memos, MEMOS_KEY, profileId)
}

export function upsertMemo(entry: MemoEntry) {
  const global = loadAllMemos()
  const idx = global.findIndex((m) => m.id === entry.id)
  if (idx >= 0) global[idx] = entry
  else global.push(entry)
  localStorage.setItem(MEMOS_KEY, JSON.stringify(global))
  cloudPush(COL.memos, entry as unknown as Record<string, unknown>)
}

export function deleteMemo(id: string) {
  const global = loadAllMemos().filter((m) => m.id !== id)
  localStorage.setItem(MEMOS_KEY, JSON.stringify(global))
  cloudDelete(COL.memos, id)
}

// ---------- Regrets ----------
export function loadRegrets(profileId?: string | null): RegretArchive[] {
  return localGet<RegretArchive & Record<string, unknown>>(REGRETS_KEY, profileId ?? undefined)
}

export async function loadRegretsAsync(profileId?: string): Promise<RegretArchive[]> {
  return pullFromCloud<RegretArchive>(COL.regrets, REGRETS_KEY, profileId)
}

export function saveRegrets(regrets: RegretArchive[]) {
  localStorage.setItem(REGRETS_KEY, JSON.stringify(regrets))
  for (const r of regrets) cloudPush(COL.regrets, r as unknown as Record<string, unknown>)
}

export function addRegret(archive: RegretArchive) {
  const list = loadRegrets(null)
  list.unshift(archive)
  saveRegrets(list)
}

// ---------- Decision Reviews ----------
export function loadDecisionReviews(profileId?: string | null): DecisionReview[] {
  return localGet<DecisionReview & Record<string, unknown>>(DECISION_REVIEWS_KEY, profileId ?? undefined)
}

export async function loadDecisionReviewsAsync(profileId?: string): Promise<DecisionReview[]> {
  return pullFromCloud<DecisionReview>(COL.decisionReviews, DECISION_REVIEWS_KEY, profileId)
}

export function upsertDecisionReview(review: DecisionReview) {
  const all = loadDecisionReviews()
  const idx = all.findIndex((r) => r.id === review.id)
  if (idx >= 0) all[idx] = review
  else all.unshift(review)
  localStorage.setItem(DECISION_REVIEWS_KEY, JSON.stringify(all))
  cloudPush(COL.decisionReviews, review as unknown as Record<string, unknown>)
}

export function deleteDecisionReview(id: string) {
  const all = loadDecisionReviews().filter((r) => r.id !== id)
  localStorage.setItem(DECISION_REVIEWS_KEY, JSON.stringify(all))
  cloudDelete(COL.decisionReviews, id)
}

// ---------- Lang ----------
export function loadLang(): 'zh' | 'en' {
  try {
    const v = localStorage.getItem(LANG_KEY) as 'zh' | 'en' | null
    return v === 'zh' || v === 'en' ? v : 'zh'
  } catch { return 'zh' }
}

export function saveLang(lang: 'zh' | 'en') {
  localStorage.setItem(LANG_KEY, lang)
}

// ---------- Constellation ----------
export function loadConstellationMode(): ConstellationMode {
  try {
    const v = localStorage.getItem(CONSTELLATION_MODE_KEY) as ConstellationMode | null
    return v === 'profile' || v === 'date' ? v : 'date'
  } catch { return 'date' }
}

export function saveConstellationMode(mode: ConstellationMode) {
  localStorage.setItem(CONSTELLATION_MODE_KEY, mode)
}
