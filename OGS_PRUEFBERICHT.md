# Version 3.0: Kita und OGS

## Berechnungsstand

Beide Satzungen verwenden ein gemeinsames beitragsrelevantes Jahreseinkommen nach § 3. Direkt nach dem letzten Kita-Juli beginnt die OGS für genau 48 Monate. Kita-Ende: Juli im Jahr des sechsten Geburtstags für Januar–September-Kinder, Juli im Jahr des siebten Geburtstags für Oktober–Dezember-Kinder.

Nur OGS: höchster Regelbeitrag vollständig, zweiter zu 50 %, weitere beitragsfrei. Kita und OGS gleichzeitig: ausschließlich der höchste OGS-Regelbeitrag zu 50 %. Ein beitragsfreies Kita-Kind zählt ebenfalls für diese OGS-Ermäßigung. OGS-Kinder ändern nicht die separate Kita-Geschwisterregel.

Neue Satzung: Nach allen jeweiligen Geschwisterermäßigungen bleiben höchstens die zwei höchsten Kinderbeiträge zahlbar. Einkommen, Tarife und Kita-Stunden bleiben zeitlich konstant. Automatischer OGS-Besuch und vier Jahre sind Simulationsannahmen. Essen, zusätzliche Ferienkosten, Sozialleistungsbefreiungen und individuelle Schulverläufe sind nicht berücksichtigt.

## Referenzen: Kita und OGS zusammen

Die Ergebnisansicht zeigt zusätzlich Kita, OGS und Gesamt getrennt mit alten/neuen Kosten, vorzeichenbehafteter Differenz und prozentualer Veränderung. Die Zuordnung verwendet tatsächlich fällige Kinderbeiträge nach allen Ermäßigungen und der Gesamtbegrenzung, auch in gemischten Monaten. Bei alten Kosten von null und neuen Kosten über null ist kein Prozentwert berechenbar. Die Teilsummen werden automatisiert auf Übereinstimmung mit den Gesamtsummen geprüft.

| Eingebautes Beispiel | Alt gesamt | Neu gesamt | Differenz |
| --- | ---: | ---: | ---: |
| Zwillinge, 36.500 € | 6.741,00 € | 8.540,00 € | 1.799,00 € |
| Drei Kinder, 130.000 € | 27.410,00 € | 38.829,00 € | 11.419,00 € |
| Sommer-/Winterkind, 90.000 € | 18.618,00 € | 23.084,00 € | 4.466,00 € |

Die bisher geprüften Kita-Teilsummen bleiben separat überprüft. Die alten Beispiele waren keine geprüften OGS-Referenzen; die erweiterten Summen sind zusätzliche Software-Testwerte.

## Automatisierte Prüfungen

- Sommer-/Wintergrenze 30. September und 1. Oktober; OGS-Start im August.
- Genau 48 OGS-Monate und Ende im Juli.
- Ein bis vier gleichzeitig betreute OGS-Kinder.
- Kita und OGS gleichzeitig; beitragspflichtige und beitragsfreie Kita-Kinder.
- Zwei Kita-Kinder plus OGS: Gesamtbegrenzung nach Ermäßigungen.
- Mehrere OGS-Kinder plus ein Kita-Kind.
- Ausscheiden eines OGS-Kindes und Ende seiner Ermäßigung.
- Einkommensgrenzen und lückenlose Monats-/Abschnittssummen.
- Bestehende Kita-Tests, alle Stunden-Tarife, Eingabevalidierung, UI-Logik einschließlich Kopieren und Offline-Einzeldatei.

Die UI-Prüfung ist eine simulierte Browserprüfung, keine visuelle Freigabe. Die Sichtprüfung erfolgt durch den Nutzer.

## Gemeinsam manuell prüfen

Beispiele 4 und 5 wurden inzwischen vom Nutzer Abschnitt für Abschnitt bestätigt. Beispiel 6 ergänzt die Gesamtbegrenzung: 90.000 €, Start 2026, jeweils 45 Stunden; Geburtstage 15.06.2020 / 15.06.2024 / 15.06.2025, Kita-Startjahre 2021 / 2025 / 2026. August 2026–Juni 2027: alt 719 €, neu 687,50 € monatlich. Neu entfallen 90 € OGS zugunsten der Kita-Beiträge 550 € und 137,50 €. Ab Juli 2027 sinkt der Kita-Zweitbeitrag auf 91,50 € und bleibt knapp über den 90 € OGS; weiterhin entfällt der OGS-Beitrag. Der ursprüngliche Vorschlag hatte fälschlich 110 € für den halben OGS-Beitrag genannt; korrekt sind 90 €. Gesamtergebnis der Software: alt 28.866 €, neu 31.936 €, Differenz 3.070 €. Gemeinsame fachliche Prüfung dieses Beispiels steht noch aus.

Zusätzlich im Beispielmenü enthalten (noch nicht gemeinsam fachlich freigegeben):

- Beispiel 4: 180.000 €, Start 2026; Geburtstage 25.04.2022, 03.01.2024, 16.07.2026; Kita-Startjahre 2023, 2025, 2027; jeweils 35 Stunden. Software-Ergebnis: Kita alt 0 €, neu 5.662,50 €; OGS alt 15.120 €, neu 19.320 €; insgesamt alt 15.120 €, neu 24.982,50 €.
- Beispiel 5: 70.000 €, Start 2026; Geburtstage 25.06.2024 und 03.04.2025; Kita-Startjahre 2025 und 2026; jeweils 45 Stunden. Software-Ergebnis: Kita alt 6.510 €, neu 9.489,75 €; OGS in beiden Szenarien 10.080 €; insgesamt alt 16.590 €, neu 19.569,75 €.

Die Einsetzung aller Daten und der Wechsel zwischen den neuen Beispielen werden automatisiert geprüft. Fachliche Kontrolle der Abschnitte erfolgt anschließend gemeinsam.

1. Die drei eingebauten Beispiele ausführen und die Gesamtsummen oben vergleichen.
2. 90.000 €, Startjahr 2026, Kind 1 geboren 15.06.2020 (Kita-Startjahr 2024), Kind 2 geboren 15.06.2025 (Kita-Startjahr 2026), jeweils 45 Stunden: im ersten Abschnitt voller U-Kita-Beitrag plus halber OGS-Beitrag.
3. Im zweiten Fall Kind 2 durch Geburtstag 15.06.2022 ersetzen: beitragsfreie Kita, trotzdem nur halber OGS-Beitrag.
4. Zum zweiten Fall ein weiteres Kita-Kind mit Geburtstag 16.06.2025 hinzufügen: neue Satzung behält nur die zwei höchsten ermäßigten Beiträge. Mit 15 statt 45 Stunden beim dritten Kind prüfen, dass gegebenenfalls dessen Kita-Beitrag statt des OGS-Beitrags entfällt.
5. September-/Oktober-Grenze testen: Kind geboren 30.09.2022 gegenüber 01.10.2022, Kita-Startjahr 2026. OGS beginnt August 2028 bzw. August 2029.

## Tests wiederholen

Im Projektordner alle Dateien `tests/*.test.js` mit Node ausführen. `tests/ogs.test.js` prüft die OGS-Erweiterung. Die bisherigen Kita-Tests verwenden ausdrücklich `includeOgs: false`, um die bereits geprüfte Kita-Logik unabhängig zu kontrollieren. Die Anwendung selbst rechnet standardmäßig einschließlich OGS.
