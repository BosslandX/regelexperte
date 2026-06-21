import { Button } from './button'
import type { Question } from '@/types'

interface Props {
  question: Question
  selectedIndex: number | null
  onSelect: (index: number) => void
  onNext: () => void
  isLast: boolean
}

export function QuestionCard({ question, selectedIndex, onSelect, onNext, isLast }: Props) {
  const answered = selectedIndex !== null

  return (
    <div className="bg-card border border-border rounded-xl p-6 space-y-5">
      <h2 className="text-lg font-semibold leading-snug">{question.question}</h2>

      <p className="text-xs text-muted-foreground">
        {question.group}
        {question.rule ? ` · ${question.rule}` : ''}
      </p>

      <div className="space-y-2">
        {question.options.map((option, idx) => (
          <button
            key={idx}
            onClick={() => !answered && onSelect(idx)}
            disabled={answered}
            className={`w-full text-left px-4 py-3 rounded-lg border text-sm transition-all ${
              answered
                ? idx === question.correct
                  ? 'border-green-500 bg-green-50 dark:bg-green-950/30 text-green-800 dark:text-green-300 font-medium'
                  : idx === selectedIndex
                    ? 'border-red-500 bg-red-50 dark:bg-red-950/30 text-red-800 dark:text-red-300'
                    : 'border-border opacity-50'
                : 'border-border hover:border-primary hover:bg-accent cursor-pointer'
            }`}
          >
            <span className="font-mono text-xs mr-2 opacity-60">
              {String.fromCharCode(65 + idx)}
            </span>
            {option}
          </button>
        ))}
      </div>

      {answered && (
        <div className="space-y-3 pt-2">
          {question.explanation && (
            <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800/40 rounded-lg p-4">
              <p className="text-sm leading-relaxed text-blue-900 dark:text-blue-200">
                {question.explanation}
              </p>
              {question.rule && (
                <p className="text-xs text-blue-600 dark:text-blue-400 mt-2 font-medium">
                  {question.rule}
                </p>
              )}
            </div>
          )}

          <Button onClick={onNext} className="w-full" size="lg">
            {isLast ? 'Ergebnis anzeigen' : 'Nächste Frage'}
          </Button>
        </div>
      )}
    </div>
  )
}
