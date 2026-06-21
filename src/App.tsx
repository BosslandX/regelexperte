import { useEffect, useState } from 'react'
import { Capacitor } from '@capacitor/core'
import { loadQuestions } from '@/data/load-questions'
import type { Question } from '@/types'
import { QuizClient } from '@/components/quiz-client'

const ICON = `${import.meta.env.BASE_URL}icon.webp`

export function App() {
  const [questions, setQuestions] = useState<Question[] | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    loadQuestions()
      .then(setQuestions)
      .catch((e) => setError(e instanceof Error ? e.message : String(e)))
  }, [])

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return
    void import('@capacitor/splash-screen')
      .then(({ SplashScreen }) => SplashScreen.hide())
      .catch(() => {})
    // Statusleiste: Edge-to-Edge mit lesbaren (dunklen) Icons über dem hellen Header.
    void import('@capacitor/status-bar')
      .then(({ StatusBar, Style }) => {
        void StatusBar.setOverlaysWebView({ overlay: true }).catch(() => {})
        void StatusBar.setStyle({ style: Style.Light }).catch(() => {})
      })
      .catch(() => {})
  }, [])

  return (
    <div className="min-h-screen flex flex-col">
      <header
        className="sticky top-0 z-10 border-b border-border bg-card/80 backdrop-blur"
        style={{ paddingTop: 'env(safe-area-inset-top)' }}
      >
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <img src={ICON} alt="" className="w-9 h-9 rounded-lg" width={36} height={36} />
          <div className="leading-tight">
            <h1 className="font-bold text-base">Deutschlands Regelexperte</h1>
            <p className="text-xs text-muted-foreground">Schiedsrichter-Regelkunde-Quiz</p>
          </div>
        </div>
      </header>

      <main className="flex-1" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
        {error ? (
          <div className="max-w-2xl mx-auto px-4 py-16 text-center">
            <p className="text-destructive font-medium">Fehler beim Laden</p>
            <p className="text-sm text-muted-foreground mt-2">{error}</p>
          </div>
        ) : !questions ? (
          <div className="max-w-2xl mx-auto px-4 py-16 text-center text-muted-foreground">
            Lädt Fragenkatalog…
          </div>
        ) : (
          <QuizClient questions={questions} />
        )}
      </main>
    </div>
  )
}
