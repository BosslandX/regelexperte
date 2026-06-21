// Plattformneutraler Gradle-Aufruf für die Android-App.
// Aufruf: node tools/gradle.mjs assembleDebug | assembleRelease
import { spawnSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { resolve } from 'node:path'

const task = process.argv[2] ?? 'assembleDebug'
const androidDir = resolve(process.cwd(), 'android')
const isWin = process.platform === 'win32'
const gradlew = resolve(androidDir, isWin ? 'gradlew.bat' : 'gradlew')

if (!existsSync(gradlew)) {
  console.error('gradlew nicht gefunden. Wurde "npx cap add android" ausgeführt?')
  process.exit(1)
}

const res = spawnSync(gradlew, [task], { cwd: androidDir, stdio: 'inherit', shell: isWin })
process.exit(res.status ?? 1)
