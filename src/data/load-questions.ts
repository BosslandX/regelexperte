import type { Question, GroupInfo, CatalogInfo } from '@/types'

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

// Kurzlabels für die (langen) Quell-Bezeichnungen.
const CATALOG_LABELS: Record<string, string> = {
  'NFV Übungsfragen für Schiedsrichter-Anwärter ab 2021': 'NFV Schiedsrichter-Anwärter',
  'BFV Regelkunde-Prüfungsfragen (2022/2023)': 'BFV Regelkunde 2022/23',
  'BFV Trainerlehrgang Regelfragen (Stand 31.07.2020)': 'BFV Trainerlehrgang 2020',
  'IFAB Laws of the Game 2024/25': 'IFAB Laws of the Game 2024/25',
  'Trainerlizenzierung-Prüfungsfragen (Stand 7.06.2024)': 'Trainerlizenzierung 2024',
  'DFB-Jugendordnung / Landesverbands-Richtlinien': 'DFB-Jugendordnung',
}

export function catalogLabel(source: string): string {
  return CATALOG_LABELS[source] ?? source
}

/** Kataloge (Quellen) mit Anzahl, sortiert nach Häufigkeit. */
export function listCatalogs(all: readonly Question[]): CatalogInfo[] {
  const map = new Map<string, number>()
  for (const q of all) map.set(q.source, (map.get(q.source) ?? 0) + 1)
  return [...map.entries()]
    .map(([name, count]) => ({ name, label: catalogLabel(name), count }))
    .sort((a, b) => b.count - a.count)
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

/**
 * Zieht `count` zufällige Fragen, optional gefiltert nach Regel-Gruppe und/oder
 * Katalog (Quelle). Der Wert 'all' (oder undefined) bedeutet "kein Filter".
 */
export function pickQuestions(
  all: readonly Question[],
  count: number,
  group?: string,
  source?: string,
): Question[] {
  const pool = all.filter(
    (q) =>
      (!group || group === 'all' || q.group === group) &&
      (!source || source === 'all' || q.source === source),
  )
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[pool[i], pool[j]] = [pool[j], pool[i]]
  }
  return pool.slice(0, Math.min(count, pool.length))
}
