# Kita-Beitragsrechner – stabile Version

Dieser statische Rechner vergleicht Kita-Beiträge nach der hinterlegten alten und neuen Satzung. Er läuft vollständig im Browser: Es gibt keinen Server, keine Anmeldung und keine Übertragung der eingegebenen Daten.

## Online verwenden

Nach der Aktivierung von GitHub Pages ist der Rechner direkt über die veröffentlichte Internetadresse nutzbar. GitHub lädt dafür automatisch die Datei `index.html` im Hauptverzeichnis.

## Offline verwenden

Die Datei `Kita-Beitragsrechner.html` herunterladen und per Doppelklick in einem aktuellen Browser öffnen. Sie enthält die komplette Anwendung in einer einzigen Datei und benötigt keine weiteren Dateien.

## Inhalt

- `index.html`: direkt von GitHub Pages angezeigte stabile App
- `Kita-Beitragsrechner.html`: vollständige Offline-Version
- `dist/`: getrennte Quelldateien der stabilen App
- `Kita-Beitragsrechner-Logikbericht.docx`: ausführliche Beschreibung der Berechnungslogik
- `PRUEFBERICHT.md`: geprüfte Beispiele, Grenzfälle und Kontrollwerte
- `tests/`: automatisierte Prüfungen
- `build-single-file.js`: erzeugt die Offline-Datei aus den Dateien in `dist/`

## Lokal testen

Mit installiertem Node.js im Hauptverzeichnis:

```bash
node tests/calculator.test.js
node tests/browser-smoke.test.js
node tests/single-file.test.js
```

## Hinweis

Der Rechner ist ein transparentes Rechen- und Vergleichswerkzeug. Vor einer verbindlichen Nutzung sollten die Beitragstabellen und Satzungsregeln mit den jeweils geltenden amtlichen Grundlagen abgeglichen werden.

## Lizenz

Veröffentlicht unter der MIT-Lizenz. Einzelheiten stehen in `LICENSE`.
