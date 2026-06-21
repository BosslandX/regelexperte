import { Capacitor, CapacitorHttp, registerPlugin } from '@capacitor/core'
import { App as CapApp } from '@capacitor/app'
import { Directory, Filesystem } from '@capacitor/filesystem'

interface ApkInstallerPlugin {
  install(options: { path: string }): Promise<void>
}
const ApkInstaller = registerPlugin<ApkInstallerPlugin>('ApkInstaller')

// Bezug über GitHub Releases: Die "latest/download"-URL zeigt stabil auf das
// jeweils neueste Release-Asset – kein API-Rate-Limit, kein eigener Server nötig.
const GH_OWNER = 'BosslandX'
const GH_REPO = 'regelexperte'
export const UPDATE_MANIFEST_URL = `https://github.com/${GH_OWNER}/${GH_REPO}/releases/latest/download/version.json`

export interface RemoteVersion {
  versionCode: number // muss zur build.gradle versionCode passen
  versionName: string // z. B. "1.1"
  url: string // Direktlink zur APK (HTTPS)
  notes?: string // optionaler Changelog
}

export interface UpdateInfo extends RemoteVersion {
  currentVersionName: string
}

/** Prüft auf eine neuere Version. Gibt UpdateInfo zurück, wenn eine bereitsteht, sonst null. */
export async function checkForUpdate(): Promise<UpdateInfo | null> {
  if (!Capacitor.isNativePlatform()) return null
  // Nativer HTTP-Request statt WebView-fetch: GitHubs Release-Asset-Server
  // (release-assets.githubusercontent.com) sendet keine CORS-Header, ein
  // fetch() aus der WebView scheitert daher mit "Failed to fetch".
  const res = await CapacitorHttp.get({
    url: UPDATE_MANIFEST_URL,
    headers: { 'Cache-Control': 'no-cache' },
  })
  if (res.status < 200 || res.status >= 300) {
    throw new Error(`Server antwortete mit Status ${res.status}.`)
  }
  const remote: unknown = typeof res.data === 'string' ? JSON.parse(res.data) : res.data
  if (!isRemoteVersion(remote)) {
    throw new Error('version.json hat ein ungültiges Format.')
  }
  const info = await CapApp.getInfo()
  const current = Number(info.build) // build = versionCode auf Android
  if (!Number.isFinite(current) || remote.versionCode <= current) return null
  return { ...remote, currentVersionName: info.version }
}

/** Lädt die APK herunter und öffnet den System-Installer. */
export async function downloadAndInstall(remote: RemoteVersion): Promise<void> {
  if (!Capacitor.isNativePlatform()) {
    throw new Error('Update ist nur in der Android-App möglich.')
  }
  const result = await Filesystem.downloadFile({
    url: remote.url,
    path: 'update.apk',
    directory: Directory.Cache,
  })
  if (!result.path) throw new Error('Download fehlgeschlagen.')
  await ApkInstaller.install({ path: result.path })
}

function isRemoteVersion(value: unknown): value is RemoteVersion {
  if (typeof value !== 'object' || value === null) return false
  const v = value as Record<string, unknown>
  return (
    typeof v.versionCode === 'number' &&
    Number.isFinite(v.versionCode) &&
    typeof v.versionName === 'string' &&
    typeof v.url === 'string' &&
    v.url.startsWith('https://')
  )
}
