const assert = require("node:assert/strict");
const fs = require("node:fs");

const html = fs.readFileSync("Kitabeitragsrechner_3.0.html", "utf8");
const formPosition = html.indexOf('<form id="calculator-form"');
const appPosition = html.indexOf('document.documentElement.classList.add("js-ready")');
const bodyEndPosition = html.indexOf("</body>");

assert.ok(formPosition > -1, "Das Formular fehlt in der Einzeldatei.");
assert.ok(appPosition > formPosition, "Der Anwendungscode muss nach dem Formular geladen werden.");
assert.ok(appPosition < bodyEndPosition, "Der Anwendungscode muss noch innerhalb des Dokuments liegen.");
assert.ok(!html.includes('src="app.js"'), "Die Einzeldatei darf nicht von app.js abhängen.");
assert.ok(!html.includes('src="calculator.js"'), "Die Einzeldatei darf nicht von calculator.js abhängen.");
assert.ok(!html.includes('href="styles.css"'), "Die Einzeldatei darf nicht von styles.css abhängen.");
assert.ok(html.includes('name="entry-1" type="number"'), "Der Kita-Start muss als Jahr eingegeben werden.");
assert.ok(!html.includes('name="entry-1" type="date"'), "Der Kita-Start darf kein Datumsfeld mehr sein.");
assert.ok(html.includes('id="copy-table-button"'), "Der Button zum Kopieren der kompakten Tabelle fehlt.");
assert.ok(html.includes('id="clear-child-1"'), "Der Button zum Löschen eines Kindereintrags fehlt.");
assert.ok(html.includes('id="detail-view"'), "Die aufklappbare Detailansicht fehlt.");
assert.ok(html.includes('id="example-1"'), "Das erste geprüfte Beispiel fehlt.");
assert.ok(html.includes('id="example-2"'), "Das zweite geprüfte Beispiel fehlt.");
assert.ok(html.includes('id="example-3"'), "Das dritte geprüfte Beispiel fehlt.");
assert.ok(
  html.indexOf('id="compact-table-heading"') < html.indexOf('id="detail-view"'),
  "Die kompakte Tabelle muss vor der Detailansicht stehen.",
);

console.log("Einzeldatei wird in der richtigen Reihenfolge geladen.");

assert.ok(!html.includes('src="tariff-data.js"'), "Die Tarife müssen in der Einzeldatei enthalten sein.");
assert.ok(html.includes('id="income"'), "Das gemeinsame Einkommensfeld fehlt.");
assert.ok(!html.includes('id="taxable-income"'), "Das getrennte Feld darf nicht mehr vorhanden sein.");
assert.ok(!html.includes('id="gross-income"'), "Das getrennte Bruttofeld darf nicht mehr vorhanden sein.");

for (let index = 1; index <= 4; index++) {
  const select = html.match(new RegExp('<select name="hours-' + index + '"[\\s\\S]*?</select>'));
  assert.ok(select, "Betreuungszeit-Dropdown für Kind " + index + " fehlt.");
  for (const hours of [15, 20, 25, 30, 35, 40, 45, 50]) {
    assert.ok(select[0].includes('value="' + hours + '"'), "Stundenoption fehlt.");
  }
  assert.ok(select[0].includes('value="45" selected'), "Standard muss 45 Stunden sein.");
}
