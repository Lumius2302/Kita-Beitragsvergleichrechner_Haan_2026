# Kita- und OGS-Beitragsvergleich Haan – Version 3.0

Vergleicht die Betreuungskosten nach alter und neuer Haaner Beitragssatzung für bis zu vier Kinder. Open Source unter der MIT-Lizenz.

## Nutzen

Online über GitHub Pages oder offline: `index.html` herunterladen und im Browser öffnen. Kein Server und keine Installation erforderlich. Einkommen und Geburtstage werden ausschließlich im Browser verarbeitet; die Anwendung übermittelt und speichert diese Eingaben nicht auf einem Server. Beim Online-Aufruf gelten zusätzlich die technischen Zugriffsprotokolle des Hostinganbieters.

## Funktionen

- Gemeinsames beitragsrelevantes Jahreseinkommen nach § 3 für beide Satzungen; nicht einfach Bruttogehalt oder zu versteuerndes Einkommen.
- Geburtstag, Kita-Eintrittsjahr und Betreuungszeit pro Kind: 15, 20, 25, 30, 35, 40, 45 oder 50 Stunden.
- Monatsgenaue Kita-Berechnung und anschließend vier Jahre OGS.
- Jeweilige Geschwisterermäßigungen, gemischte Kita-/OGS-Betreuung und neue Begrenzung auf zwei Kinderbeiträge.
- Kita, OGS und Gesamt getrennt; kompakte kopierbare Tabelle und aufklappbare Detailansicht.
- Sechs Beispielkonstellationen.

## Grenzen und Annahmen

Kein amtlicher Rechner, keine verbindliche Beitragsfestsetzung. Alle Ergebnisse ohne Gewähr. Maßgeblich sind die gültigen Satzungen und der Bescheid der Stadt Haan. Der Rechner wendet alte und neue Regeln jeweils als Vergleichsszenario auf den gesamten gewählten Zeitraum an; er wechselt nicht anhand historischer Inkrafttretensdaten zwischen den Satzungen.

Die Einkommensgrundlage muss bereits nach § 3 ermittelt eingegeben werden. Einkommen, Tarife und Kita-Stunden bleiben in der Simulation konstant. Jede Kita beginnt im August des eingegebenen Eintrittsjahres. Gesetzliche beitragsfreie Kita-Jahre richten sich nach der Sommer-/Winterkindregel. Automatischer OGS-Besuch unmittelbar nach der Kita und genau 48 Monate OGS sind Simulationsannahmen.

Keine individuelle Einschulung, Rückstellung, unterjährige Betreuung, Sozialleistungsbefreiung, Essens- oder Zusatzkosten. Keine zukünftigen Tarifänderungen. Beitragstabellen wurden aus der bereitgestellten Excel-Datei übernommen. Offizielle Satzungen sind im [Ortsrecht der Stadt Haan](https://www.haan.de/Stadt-Rathaus/Politik/Ortsrecht) verfügbar.

## Prüfstand

Sechs automatisierte Testdateien prüfen Berechnung, Einkommensgrenzen, alle Stunden-Tarife, OGS-Übergänge, Geschwisterregeln, Gesamtbegrenzung und UI-Logik. Die UI-Tests simulieren einen Browser und ersetzen keine vollständige Browser-/Geräteprüfung. Beispiele 4 und 5 wurden zusätzlich Abschnitt für Abschnitt gemeinsam geprüft; Beispiel 6 enthält automatisierte Prüfungen der Begrenzung. Details: [OGS_PRUEFBERICHT.md](OGS_PRUEFBERICHT.md).

## Entwicklung

Quelldateien stehen in `dist/`. Nach Änderungen mit Node.js `node build-single-file.js` ausführen. Das aktualisiert alle drei Offline-/Startdateien. Die verschiedenen HTML-Dateien im Hauptordner enthalten denselben Rechner; die bisherigen Dateinamen bleiben für bestehende Links erhalten.

Tests einzeln mit `node tests/calculator.test.js`, `node tests/income-split.test.js`, `node tests/hours.test.js`, `node tests/ogs.test.js`, `node tests/browser-smoke.test.js` und `node tests/single-file.test.js` ausführen. Bestehende Kita-Regressionstests prüfen mit `includeOgs: false` bewusst nur die Kita-Zeit; die Anwendung rechnet standardmäßig einschließlich OGS.
