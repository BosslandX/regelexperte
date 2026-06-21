export interface Question {
  readonly id: number
  readonly question: string
  readonly options: readonly string[]
  readonly correct: number
  readonly explanation: string
  readonly rule: string
  readonly group: string
  readonly difficulty: string
  readonly source: string
}

export interface Answer {
  readonly questionId: number
  readonly selectedIndex: number
  readonly isCorrect: boolean
}

export interface GroupInfo {
  readonly name: string
  readonly count: number
}
