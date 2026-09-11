# Prüfbericht zum Kita-Beitragsrechner

Stand: 11. September 2026

## Ziel der Prüfung

Die Berechnungslogik wurde anhand der drei gemeinsam kontrollierten Beispielrechnungen sowie zusätzlicher Grenz- und Plausibilitätsfälle geprüft. Die Tests vergleichen nicht nur die Endsumme, sondern auch ausgewählte Monate unmittelbar vor und nach jedem maßgeblichen Wechsel.

## Ergebnis

Alle automatisierten Tests wurden erfolgreich ausgeführt. Bei den drei Referenzfällen stimmen die Monatsbeiträge, Gesamtsummen und Differenzen mit den gemeinsam ermittelten Kontrollwerten überein.

| Referenzfall | Alte Satzung | Neue Satzung | Differenz | Mehrkosten |
| --- | ---: | ---: | ---: | ---: |
| 1 – Zwillinge, 36.500 € | 2.781,00 € | 4.940,00 € | 2.159,00 € | 77,63 % |
| 2 – Drei Kinder, 130.000 € | 13.370,00 € | 21.669,00 € | 8.299,00 € | 62,07 % |
| 3 – Sommer- und Winterkind, 90.000 € | 5.658,00 € | 10.124,00 € | 4.466,00 € | 78,93 % |

## Referenzfall 1

- Einkommen: 36.500 €
- Startjahr: 2026
- Kind 1: geboren am 05.08.2025, Kita-Startjahr 2026
- Kind 2: geboren am 05.08.2025, Kita-Startjahr 2026

Geprüfte Monatswechsel:

- August 2026: alt 106,00 €, neu 152,50 €
- August 2027: alt 106,00 €, neu 152,50 €
- September 2027: alt 61,00 €, neu 152,50 €
- September 2028: alt 61,00 €, neu 102,50 €
- August 2029: beide Satzungen 0,00 €

## Referenzfall 2

- Einkommen: 130.000 €
- Startjahr: 2026
- Kind 1: geboren am 05.06.2025, Kita-Startjahr 2026
- Kind 2: geboren am 05.06.2025, Kita-Startjahr 2026
- Kind 3: geboren am 06.01.2024, Kita-Startjahr 2026

Geprüfte Monatswechsel:

- August 2026: alt 725,00 €, neu 857,50 €
- Juli 2027: alt 415,00 €, neu 857,50 €
- Juli 2028: alt 415,00 €, neu 572,50 €
- August 2028: alt 0,00 €, neu 114,50 €
- August 2029: beide Satzungen 0,00 €

## Referenzfall 3

- Einkommen: 90.000 €
- Startjahr: 2026
- Kind 1: geboren am 15.12.2024, Kita-Startjahr 2026
- Kind 2: geboren am 20.03.2023, Kita-Startjahr 2026

Geprüfte Monatswechsel:

- August 2026: alt 629,00 €, neu 641,50 €
- Januar 2027: alt 359,00 €, neu 641,50 €
- August 2027: alt 0,00 €, neu 137,50 €
- Januar 2028: alt 0,00 €, neu 91,50 €
- August 2029: beide Satzungen 0,00 €

## Zusätzlich geprüfte Fehlerquellen

- Sämtliche Einkommensgrenzen beider Beitragstabellen, jeweils unmittelbar unterhalb, auf und oberhalb der Grenze
- Wechsel U2 zu Ü2 im Monat nach dem zweiten Geburtstag
- Wechsel U3 zu Ü3 im Monat nach dem dritten Geburtstag
- Abgrenzung Sommerkind am 30. September und Winterkind am 1. Oktober
- Beginn der beitragsfreien Zeit jeweils im August
- Ende der Betreuung jeweils nach dem vollständigen Juli
- Alte Geschwisterregel: nur der höchste Beitrag beziehungsweise vollständige Befreiung bei einem beitragsfreien Kind
- Neue Geschwisterregel: 100 %, 25 %, anschließend 0 %
- Centgenaue Berechnung der 25-%-Beiträge ohne Rundung auf volle Euro
- Lückenlose und überschneidungsfreie Monatsabdeckung
- Übereinstimmung von Monatswerten, Abschnittssummen, Gesamtsummen und Differenzen
- Keine negativen Beiträge und kein Beitrag oberhalb des Grundbeitrags eines Kindes
- Funktionsprüfung der lokalen HTML-Datei einschließlich Eingabeauswertung und Ergebnisanzeige

## So lassen sich die Ergebnisse selbst nachprüfen

1. `Kita-Beitragsrechner.html` öffnen.
2. Die Eingaben eines der drei Referenzfälle übernehmen.
3. Auf „Beiträge berechnen“ klicken.
4. Die drei Gesamtsummen oben mit der Tabelle in diesem Prüfbericht vergleichen.
5. In der ausführlichen Tabelle die genannten Kontrollmonate prüfen. Besonders wichtig sind jeweils der August und der Monat nach einem maßgeblichen Geburtstag.

Die kompakte Übersicht fasst direkt aufeinanderfolgende Zeiträume mit unverändertem Gesamtbeitrag zusammen. Die aufklappbare Detailansicht zeigt zusätzlich Altersklassen, Kita-Status, Geschwisterrollen und die Beiträge der einzelnen Kinder.
