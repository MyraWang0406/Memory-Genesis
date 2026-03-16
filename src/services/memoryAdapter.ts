/**
 * EverMemOS Memory Adapter
 * 提供长期记忆存储与检索接口
 * 优先调用真实 EverMemOS API，失败时自动 fallback 到 localStorage/mock
 */

export interface MemoryCell {
  id: string;
  content: string;
  tags: string[];
  type: 'event' | 'insight' | 'decision' | 'action' | 'reminder';
  timestamp: string;
  metadata?: Record<string, any>;
}

class MemoryAdapter {
  private storageKey = 'evermemos_mock_storage';
  private apiBase = (import.meta as any).env.VITE_EVERMEMOS_API_URL || 'http://localhost:8000';
  private userId = (import.meta as any).env.VITE_EVERMEMOS_USER_ID || 'default_user';

  constructor() {
    if (typeof window !== 'undefined' && !localStorage.getItem(this.storageKey)) {
      localStorage.setItem(this.storageKey, JSON.stringify([]));
    }
  }

  /**
   * 存储记忆片段
   */
  async saveMemory(cell: Omit<MemoryCell, 'id' | 'timestamp'>): Promise<MemoryCell> {
    const newCell: MemoryCell = {
      ...cell,
      id: Math.random().toString(36).substring(2, 11),
      timestamp: new Date().toISOString(),
    };

    try {
      // 尝试调用真实 EverMemOS API
      const response = await fetch(`${this.apiBase}/api/v1/memories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message_id: newCell.id,
          create_time: newCell.timestamp,
          sender: this.userId,
          content: newCell.content,
          metadata: {
            tags: newCell.tags,
            type: newCell.type,
            ...newCell.metadata
          }
        }),
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      console.log('[MemoryAdapter] Saved to EverMemOS:', newCell);
    } catch (error) {
      console.warn('[MemoryAdapter] EverMemOS save failed, falling back to localStorage:', error);
      this.saveToLocalStorage(newCell);
    }

    return newCell;
  }

  /**
   * 检索相似记忆
   */
  async searchSimilar(query: string, limit: number = 3): Promise<MemoryCell[]> {
    try {
      // 尝试调用真实 EverMemOS API
      const response = await fetch(`${this.apiBase}/api/v1/memories/search`, {
        method: 'POST', // 根据文档示例，search 接口可能使用 POST 传递 JSON
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: query,
          user_id: this.userId,
          memory_types: ["episodic_memory"],
          retrieve_method: "hybrid"
        }),
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const data = await response.json();
      const memories = data.result?.memories || [];
      
      // 将 EverMemOS 格式转换为 MemoryCell 格式
      return memories.slice(0, limit).map((m: any) => ({
        id: m.message_id || Math.random().toString(36).substring(2, 11),
        content: m.content,
        timestamp: m.create_time,
        tags: m.metadata?.tags || [],
        type: m.metadata?.type || 'event'
      }));
    } catch (error) {
      console.warn('[MemoryAdapter] EverMemOS search failed, falling back to localStorage:', error);
      return this.searchLocalStorage(query, limit);
    }
  }

  /**
   * 获取所有记忆
   */
  async getAllMemories(): Promise<MemoryCell[]> {
    // 暂时保留 localStorage 作为全量获取的来源，或者未来可以接入 EverMemOS 的 list 接口
    return this.getMemoriesSync();
  }

  private saveToLocalStorage(cell: MemoryCell) {
    const memories = this.getMemoriesSync();
    memories.push(cell);
    localStorage.setItem(this.storageKey, JSON.stringify(memories));
  }

  private searchLocalStorage(query: string, limit: number): MemoryCell[] {
    const memories = this.getMemoriesSync();
    return memories
      .filter(m => m.content.includes(query) || m.tags.some(t => query.includes(t)))
      .slice(0, limit);
  }

  private getMemoriesSync(): MemoryCell[] {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(this.storageKey);
    return data ? JSON.parse(data) : [];
  }

  /**
   * 同步接口 (保留原样)
   */
  async syncToEverMemOS() {
    console.log('[MemoryAdapter] Syncing local memories to EverMemOS...');
    const localMemories = this.getMemoriesSync();
    for (const memory of localMemories) {
      await this.saveMemory(memory);
    }
  }
}

export const memoryAdapter = new MemoryAdapter();
