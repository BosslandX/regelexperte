# Deutschlands Regelexperte

Schiedsrichter-Regelkunde-Quiz als Android-App. **339 offizielle Prüfungsfragen**
aus den Fragenkatalogen deutscher Fußballverbände – mit ausführlicher
Regelbegründung zu jeder Antwort.

## Features

- 🟢 **339 Fragen** in 19 Regel-Bereichen (Regel 1–17 + Elfmeterschießen + Persönliche Strafen)
- 📖 **Begründung zu jeder Antwort** auf Basis der IFAB Laws of the Game 2024/25
- 🎯 Filter nach Regel-Bereich, frei wählbare Fragenanzahl (5–50)
- 📊 Auswertung nach Regel-Bereich + Liste der falsch beantworteten Fragen
- 🔄 **In-App-Updater** über GitHub Releases (keine Store-Installation nötig)
- 📴 Vollständig offline – keine Server, keine Tracker, keine Anmeldung

## Quellen der Fragen

Die Fragen stammen aus offiziellen, frei zugänglichen Prüfungskatalogen:

- NFV-Übungsfragen für Schiedsrichter-Anwärter (ab 2021)
- BFV Regelkunde-Prüfungsfragen (2022/2023) und Trainerlehrgang-Regelfragen
- IFAB Laws of the Game 2024/25
- DFB-/Landesverbands-Richtlinien

Die Regelbegründungen wurden auf Basis der IFAB Laws of the Game erstellt und
fachlich geprüft; bei verbandsspezifischen Sonderregeln wird auf die jeweilige
Verbandsauslegung hingewiesen.

## Stack

Vite 7 · React 19 · TypeScript · Tailwind CSS 4 · Capacitor 8 (Android).
Der Fragenkatalog liegt als statische `public/questions.json` (≈ 240 KB) vor –
keine Datenbank, kein WASM.

## Entwicklung

```bash
npm install
npm run dev          # Web-Dev-Server (Browser)
npm run build        # TypeScript-Check + Vite-Build → dist/
npm run apk          # Debug-APK bauen
npm run apk:release  # Signierte Release-APK (braucht android/keystore.properties)
npm run icons        # Icons/Splash aus assets/ neu generieren
```

### Android-Build (lokal)

```powershell
$env:JAVA_HOME = "C:\Program Files\Android\Android Studio\jbr"
$env:ANDROID_HOME = "C:\Users\<user>\AppData\Local\Android\Sdk"
npm run apk:release
# → android/app/build/outputs/apk/release/regelexperte-<version>-release.apk
```

## Release & Updates

Releases werden automatisch per GitHub Actions gebaut – siehe
[`docs/RELEASE.md`](docs/RELEASE.md). Ein Tag `v1.1` löst den Build aus;
die signierte APK und `version.json` landen als Release-Assets. Die App prüft
über `releases/latest/download/version.json` auf neue Versionen und installiert
die APK über den System-Installer.

## Lizenz

Quellcode: MIT. Die Prüfungsfragen sind Eigentum der jeweiligen Verbände und
hier zu Lern-/Ausbildungszwecken zusammengeführt.
