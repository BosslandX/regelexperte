import { useCallback, useMemo, useState } from 'react'
import { Button } from './button'
import { QuestionCard } from './question-card'
import { QuizResults } from './quiz-results'
import { UpdateSection } from './update-section'
import { listCatalogs, listDifficulties, listGroups, pickQuestions } from '@/data/load-questions'
import type { Answer, FilterMode, Question } from '@/types'

type Phase = 'setup' | 'playing' | 'results'

const DIFF_STYLE: Record<string, string> = {
  leicht: 'border-green-300 text-green-700 dark:text-green-400',
  mittel: 'border-yellow-300 text-yellow-700 dark:text-yellow-400',
  schwer: 'border-red-300 text-red-700 dark:text-red-400',
}

export function QuizClient({ questions: all }: { questions: Question[] }) {
  const [phase, setPhase] = useState<Phase>('setup')
  const [filterMode, setFilterMode] = useState<FilterMode>('thema')
  const [group, setGroup] = useState('all')
  const [source, setSource] = useState('all')
  const [count, setCount] = useState(20)
  const [quiz, setQuiz] = useState<Question[]>([])
  const [current, setCurrent] = useState(0)
  const [answers, setAnswers] = useState<Answer[]>([])

  const groups = useMemo(() => listGroups(all), [all])
  const catalogs = useMemo(() => listCatalogs(all), [all])
  const difficulties = useMemo(() => listDifficulties(all), [all])

  const maxCount =
    filterMode === 'thema'
      ? group === 'all'
        ? all.length
        : (groups.find((g) => g.name === group)?.count ?? all.length)
      : source === 'all'
        ? all.length
        : (catalogs.find((c) => c.name === source)?.count ?? all.length)

  const start = useCallback(() => {
    const picked = pickQuestions(
      all,
      count,
      filterMode === 'thema' ? group : 'all',
      filterMode === 'katalog' ? source : 'all',
    )
    if (picked.length === 0) return
    setQuiz(picked)
    setCurrent(0)
    setAnswers([])
    setPhase('playing')
  }, [all, count, filterMode, group, source])

  const handleAnswer = useCallback(
    (selectedIndex: number) => {
      const q = quiz[current]
      setAnswers((prev) =>
        prev.some((a) => a.questionId === q.id)
          ? prev
          : [...prev, { questionId: q.id, selectedIndex, isCorrect: selectedIndex === q.correct }],
      )
    },
    [quiz, current],
  )

  const handleNext = useCallback(() => {
    if (current + 1 >= quiz.length) setPhase('results')
    else setCurrent((i) => i + 1)
  }, [current, quiz.length])

  const handleRestart = useCallback(() => {
    setPhase('setup')
    setQuiz([])
    setAnswers([])
    setCurrent(0)
  }, [])

  if (phase === 'setup') {
    const effectiveCount = Math.min(count, maxCount)
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold mb-2">Regelkunde-Quiz</h2>
          <p className="text-muted-foreground text-sm">
            {all.length} offizielle Prüfungsfragen für Schiedsrichter-Anwärter
          </p>
        </div>

        <div className="bg-card border border-border rounded-xl p-6 space-y-6">
          <div>
            <span className="block text-sm font-medium mb-2">Filtern nach</span>
            <div className="grid grid-cols-2 gap-1 p-1 bg-muted rounded-lg">
              {(['thema', 'katalog'] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setFilterMode(m)}
                  className={`py-1.5 rounded-md text-sm font-medium transition-colors ${
                    filterMode === m
                      ? 'bg-card text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {m === 'thema' ? 'Thema' : 'Katalog'}
                </button>
              ))}
            </div>
          </div>

          {filterMode === 'thema' ? (
            <div>
              <label className="block text-sm font-medium mb-2">Regel-Bereich</label>
              <select
                value={group}
                onChange={(e) => setGroup(e.target.value)}
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="all">Alle Bereiche ({all.length})</option>
                {groups.map((g) => (
                  <option key={g.name} value={g.name}>
                    {g.name} ({g.count})
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium mb-2">Fragenkatalog (Quelle)</label>
              <select
                value={source}
                onChange={(e) => setSource(e.target.value)}
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="all">Alle Kataloge ({all.length})</option>
                {catalogs.map((c) => (
                  <option key={c.name} value={c.name}>
                    {c.label} ({c.count})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-2">
              Anzahl Fragen: {effectiveCount}
            </label>
            <input
              type="range"
              min={5}
              max={Math.min(50, maxCount)}
              value={effectiveCount}
              onChange={(e) => setCount(Number(e.target.value))}
              className="w-full accent-primary"
            />
          </div>

          <div className="flex flex-wrap gap-2 text-xs">
            {difficulties.map((d) => (
              <span
                key={d.name}
                className={`px-2 py-1 rounded-full border ${DIFF_STYLE[d.name] ?? 'border-border'}`}
              >
                {d.name}: {d.count}
              </span>
            ))}
          </div>

          <Button onClick={start} className="w-full" size="lg">
            Quiz starten
          </Button>
        </div>

        <UpdateSection />
      </div>
    )
  }

  if (phase === 'playing') {
    const q = quiz[current]
    const answered = answers.find((a) => a.questionId === q.id)
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-muted-foreground">
            Frage {current + 1} / {quiz.length}
          </span>
          <span
            className={`text-xs px-2 py-1 rounded-full border ${DIFF_STYLE[q.difficulty] ?? 'border-border'}`}
          >
            {q.difficulty}
          </span>
        </div>

        <div className="w-full bg-muted rounded-full h-2 mb-6">
          <div
            className="bg-primary h-2 rounded-full transition-all duration-300"
            style={{ width: `${((current + (answered ? 1 : 0)) / quiz.length) * 100}%` }}
          />
        </div>

        <QuestionCard
          question={q}
          selectedIndex={answered?.selectedIndex ?? null}
          onSelect={handleAnswer}
          onNext={handleNext}
          isLast={current + 1 >= quiz.length}
        />

        <div className="mt-4 text-center">
          <button
            onClick={handleRestart}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Quiz abbrechen
          </button>
        </div>
      </div>
    )
  }

  return <QuizResults questions={quiz} answers={answers} onRestart={handleRestart} />
}
