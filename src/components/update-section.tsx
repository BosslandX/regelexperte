import { useCallback, useState } from 'react'
import { Capacitor } from '@capacitor/core'
import { Button } from './button'
import { checkForUpdate, downloadAndInstall, type UpdateInfo } from '@/update/updater'

function errMsg(e: unknown): string {
  return e instanceof Error ? e.message : String(e)
}

export function UpdateSection() {
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState('')
  const [available, setAvailable] = useState<UpdateInfo | null>(null)

  const onCheck = useCallback(async () => {
    setBusy(true)
    setMsg('')
    setAvailable(null)
    try {
      const info = await checkForUpdate()
      if (info) {
        setAvailable(info)
        setMsg(`Neue Version ${info.versionName} verfügbar (installiert: ${info.currentVersionName}).`)
      } else {
        setMsg('Du hast bereits die neueste Version.')
      }
    } catch (e) {
      setMsg(`Update-Prüfung fehlgeschlagen: ${errMsg(e)}`)
    } finally {
      setBusy(false)
    }
  }, [])

  const onInstall = useCallback(async () => {
    if (!available) return
    setBusy(true)
    setMsg('Lade Update herunter …')
    try {
      await downloadAndInstall(available)
      setMsg('Installation gestartet – bitte den System-Dialog bestätigen.')
    } catch (e) {
      setMsg(`Update fehlgeschlagen: ${errMsg(e)}`)
    } finally {
      setBusy(false)
    }
  }, [available])

  // Update-Funktion existiert nur in der nativen App.
  if (!Capacitor.isNativePlatform()) return null

  return (
    <div className="mt-6 bg-card border border-border rounded-xl p-5 space-y-3">
      <h3 className="text-sm font-semibold">App-Update</h3>
      <div className="flex flex-wrap gap-2">
        <Button onClick={onCheck} disabled={busy} variant="outline" size="sm">
          Nach Update suchen
        </Button>
        {available && (
          <Button onClick={onInstall} disabled={busy} size="sm">
            Version {available.versionName} installieren
          </Button>
        )}
      </div>
      {msg && <p className="text-xs text-muted-foreground">{msg}</p>}
      {available?.notes && <p className="text-xs text-muted-foreground">{available.notes}</p>}
    </div>
  )
}
