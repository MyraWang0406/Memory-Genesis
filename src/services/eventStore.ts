/**
 * eventStore.ts — shared in-memory store for MemoryEvents.
 * HomeView writes here; time views read from here.
 */
import type { MemoryEvent } from '../data/memoryEvents'
import { DEMO_EVENTS } from '../data/memoryEvents'

type Listener = () => void
const listeners = new Set<Listener>()
let events: MemoryEvent[] = [...DEMO_EVENTS]

export function getEvents(): MemoryEvent[] {
  return events
}

export function addEvent(ev: MemoryEvent): void {
  events = [ev, ...events]
  listeners.forEach(l => l())
}

export function subscribeEvents(fn: Listener): () => void {
  listeners.add(fn)
  return () => listeners.delete(fn)
}

/** Get events whose date falls in [startDate, endDate] inclusive (yyyy-MM-dd) */
export function getEventsInRange(startDate: string, endDate: string): MemoryEvent[] {
  return events.filter(ev => ev.date >= startDate && ev.date <= endDate)
}
