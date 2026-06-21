import type { Question, GroupInfo } from '@/types'

let cache: Question[] | null = null

/** Lädt den Fragenkatalog einmalig aus public/questions.json. */
export async function loadQuestions(): Promise<Question[]> {
  if (cache) return cache
  const res = await fetch(`${import.meta.env.BASE_URL}questions.json`, { cache: 'force-cache' })
  if (!res.ok) {
    throw new Error(`Fragenkatalog konnte nicht geladen werden (HTTP ${res.status}).`)
  }
  const data = (await res.json()) as Question[]
  if (!Array.isArray(data) || data.length === 0) {
    throw new Error('Fragenkatalog ist leer oder ungültig.')
  }
  cache = data
  return data
}

function ruleNum(group: string): number {
  const m = group.match(/Regel (\d+)/)
  return m ? Number(m[1]) : 999
}

/** Regel-Gruppen mit Anzahl, sortiert nach Regelnummer. */
export function listGroups(all: readonly Question[]): GroupInfo[] {
  const map = new Map<string, number>()
  for (const q of all) map.set(q.group, (map.get(q.group) ?? 0) + 1)
  return [...map.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => ruleNum(a.name) - ruleNum(b.name))
}

/** Schwierigkeitsstufen mit Anzahl, sortiert leicht → mittel → schwer. */
export function listDifficulties(all: readonly Question[]): GroupInfo[] {
  const order = ['leicht', 'mittel', 'schwer']
  const map = new Map<string, number>()
  for (const q of all) map.set(q.difficulty, (map.get(q.difficulty) ?? 0) + 1)
  return [...map.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => order.indexOf(a.name) - order.indexOf(b.name))
}

/** Zieht `count` zufällige Fragen, optional auf eine Regel-Gruppe gefiltert. */
export function pickQuestions(
  all: readonly Question[],
  count: number,
  group: string,
): Question[] {
  const pool = group === 'all' ? [...all] : all.filter((q) => q.group === group)
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[pool[i], pool[j]] = [pool[j], pool[i]]
  }
  return pool.slice(0, Math.min(count, pool.length))
}
