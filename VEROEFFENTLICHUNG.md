# Veröffentlichung auf GitHub Pages

## 1. Neues Repository anlegen

1. Bei GitHub anmelden.
2. Rechts oben auf das Pluszeichen und dann auf **New repository** klicken.
3. Als Namen `kita-beitragsrechner` eintragen.
4. **Public** auswählen.
5. Die Optionen zum Erstellen einer README-, `.gitignore`- oder Lizenzdatei nicht aktivieren.
6. Auf **Create repository** klicken.

## 2. Paket hochladen

1. Im leeren Repository auf **uploading an existing file** klicken.
2. Den Inhalt dieses Ordners vollständig in das Upload-Feld ziehen. Nicht nur die ZIP-Datei und nicht den übergeordneten Ordner hochladen.
3. Prüfen, dass `index.html`, `README.md`, `LICENSE`, `dist` und `tests` in der Dateiliste erscheinen.
4. Unten als Beschreibung zum Beispiel `Stabile Version des Kita-Beitragsrechners` eintragen.
5. Auf **Commit changes** klicken.

## 3. GitHub Pages einschalten

1. Im Repository auf **Settings** klicken.
2. Links unter **Code and automation** auf **Pages** klicken.
3. Unter **Build and deployment** bei **Source** die Option **Deploy from a branch** auswählen.
4. Als Branch **main** und als Ordner **/(root)** auswählen.
5. Auf **Save** klicken.

Nach wenigen Minuten zeigt GitHub dort die Internetadresse an. Bei dem Benutzernamen `Lumius2302` und dem vorgeschlagenen Repository-Namen lautet sie voraussichtlich:

`https://lumius2302.github.io/kita-beitragsrechner/`

## 4. Ergebnis kontrollieren

1. Die angezeigte Internetadresse öffnen.
2. Eines der drei geprüften Beispiele auswählen.
3. Kontrollieren, ob die Ergebniswerte erscheinen.
4. Den Link anschließend in einem privaten Browserfenster öffnen. So lässt sich prüfen, dass die Seite wirklich öffentlich erreichbar ist.

## Spätere Aktualisierung

Geänderte Dateien können im Repository über **Add file** und **Upload files** erneut hochgeladen werden. Dateien mit gleichem Namen werden dabei durch die neue Version ersetzt. Für eine bewusste Aktualisierung sollte wieder nur ein zuvor geprüftes, stabiles Paket verwendet werden.
