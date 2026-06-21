# Release-Prozess

Releases werden über **GitHub Actions** gebaut und veröffentlicht
(`.github/workflows/release.yml`). Der In-App-Updater bezieht die jeweils
neueste Version über die stabile URL
`https://github.com/<owner>/<repo>/releases/latest/download/version.json`.

## Einmalige Einrichtung: GitHub-Secrets

Im öffentlichen Repo unter **Settings → Secrets and variables → Actions**
folgende vier Secrets anlegen:

| Secret | Wert |
|--------|------|
| `KEYSTORE_BASE64` | Base64 des Keystores: `base64 -w0 android/regelexperte-release.keystore` |
| `KEYSTORE_PASSWORD` | Keystore-Passwort |
| `KEY_ALIAS` | `regelexperte` |
| `KEY_PASSWORD` | Key-Passwort (identisch zum Keystore-Passwort) |

> Der Keystore selbst wird **nie** committet (`.gitignore`). Geht er verloren,
> sind keine In-Place-Updates der App mehr möglich – sicher aufbewahren!

## Neues Release veröffentlichen

1. **Version erhöhen** in `android/app/build.gradle`:
   - `versionCode` um 1 erhöhen (Ganzzahl, steuert die Update-Erkennung)
   - `versionName` anpassen (z. B. `"1.1"`)
2. Änderungen committen und pushen.
3. **Tag setzen und pushen:**
   ```bash
   git tag v1.1
   git push origin v1.1
   ```
4. GitHub Actions baut die signierte APK, erzeugt `version.json` und legt beides
   als Release-Assets ab.
5. Bestehende Nutzer erhalten das Update über **„Nach Update suchen"** in der App.

## Versionslogik

- `versionCode` (Ganzzahl, monoton steigend) ist maßgeblich für die
  Update-Erkennung: Der Updater bietet ein Update an, wenn der Remote-`versionCode`
  größer ist als der installierte.
- `versionName` ist der nutzersichtbare Text (z. B. „1.1").
- Beide stehen in `android/app/build.gradle` und werden vom Workflow ausgelesen.
