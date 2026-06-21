import { useMemo } from 'react'
import { Button } from './button'
import type { Answer, Question } from '@/types'

interface Props {
  questions: readonly Question[]
  answers: readonly Answer[]
  onRestart: () => void
}

export function QuizResults({ questions, answers, onRestart }: Props) {
  const correct = answers.filter((a) => a.isCorrect).length
  const total = answers.length
  const pct = total > 0 ? Math.round((correct / total) * 100) : 0

  const byGroup = useMemo(() => {
    const map = new Map<string, { correct: number; total: number }>()
    for (const q of questions) {
      const a = answers.find((x) => x.questionId === q.id)
      if (!a) continue
      const cur = map.get(q.group) ?? { correct: 0, total: 0 }
      map.set(q.group, {
        correct: cur.correct + (a.isCorrect ? 1 : 0),
        total: cur.total + 1,
      })
    }
    return [...map.entries()].sort((a, b) => b[1].total - a[1].total)
  }, [questions, answers])

  const wrong = useMemo(
    () =>
      answers
        .filter((a) => !a.isCorrect)
        .map((a) => {
          const q = questions.find((x) => x.id === a.questionId)
          return q ? { q, a } : null
        })
        .filter((x): x is { q: Question; a: Answer } => x !== null),
    [questions, answers],
  )

  const grade =
    pct >= 90
      ? { label: 'Ausgezeichnet!', color: 'text-green-600 dark:text-green-400' }
      : pct >= 75
        ? { label: 'Gut bestanden', color: 'text-green-600 dark:text-green-400' }
        : pct >= 60
          ? { label: 'Bestanden', color: 'text-yellow-600 dark:text-yellow-400' }
          : { label: 'Nicht bestanden', color: 'text-red-600 dark:text-red-400' }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      <div className="bg-card border border-border rounded-xl p-8 text-center">
        <h2 className="text-2xl font-bold mb-2">Quiz-Ergebnis</h2>
        <div className="text-5xl font-bold my-4">
          {correct}/{total}
        </div>
        <div className="text-xl mb-1">{pct}%</div>
        <div className={`text-lg font-semibold ${grade.color}`}>{grade.label}</div>
      </div>

      {byGroup.length > 1 && (
        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="font-semibold mb-4">Nach Regel-Bereich</h3>
          <div className="space-y-2">
            {byGroup.map(([name, stats]) => {
              const gPct = Math.round((stats.correct / stats.total) * 100)
              return (
                <div key={name} className="flex items-center gap-3">
                  <span className="text-sm w-40 truncate" title={name}>
                    {name}
                  </span>
                  <div className="flex-1 bg-muted rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        gPct >= 75 ? 'bg-green-500' : gPct >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${gPct}%` }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground w-12 text-right">
                    {stats.correct}/{stats.total}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {wrong.length > 0 && (
        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="font-semibold mb-4">Falsch beantwortet ({wrong.length})</h3>
          <div className="space-y-4">
            {wrong.map(({ q, a }) => (
              <div key={q.id} className="border-l-2 border-red-400 pl-4 py-2">
                <p className="text-sm font-medium">{q.question}</p>
                <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                  Deine Antwort: {q.options[a.selectedIndex]}
                </p>
                <p className="text-xs text-green-600 dark:text-green-400">
                  Richtig: {q.options[q.correct]}
                </p>
                {q.explanation && (
                  <p className="text-xs text-muted-foreground mt-1">{q.explanation}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <Button onClick={onRestart} className="w-full" size="lg">
        Neues Quiz starten
      </Button>
    </div>
  )
}
