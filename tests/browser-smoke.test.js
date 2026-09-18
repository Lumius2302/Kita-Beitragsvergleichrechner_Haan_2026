const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");

function element(id = "") {
  return {
    id,
    value: "",
    hidden: false,
    textContent: "",
    innerHTML: "",
    listeners: {},
    classList: { add() {}, remove() {} },
    addEventListener(type, callback) { this.listeners[type] = callback; },
    scrollIntoView() {},
  };
}

const ids = [
  "calculator-form", "income", "start-year", "form-error", "results", "result-body", "compact-result-body",
  "old-total", "new-total", "difference-card", "difference-total", "difference-label",
  "difference-caption", "percentage-card", "percentage-total", "percentage-label", "percentage-caption",
  "result-description", "example-menu", "example-1", "example-2", "example-3", "example-4", "example-5", "example-6", "print-button",
  "copy-table-button", "copy-status", "detail-view", "care-summary-body",
  "clear-child-1", "clear-child-2", "clear-child-3", "clear-child-4",
];
const elements = Object.fromEntries(ids.map((id) => [id, element(id)]));
const formElements = {};
for (let index = 1; index <= 4; index += 1) {
  formElements["birth-" + index] = element("birth-" + index);
  formElements["entry-" + index] = element("entry-" + index);
  formElements["hours-" + index] = element("hours-" + index);
  formElements["hours-" + index].value = "45";
}
elements["calculator-form"].elements = formElements;
elements["calculator-form"].requestSubmit = function () {
  this.listeners.submit({ preventDefault() {} });
};
let copiedText = "";

const context = {
  console,
  Date,
  Intl,
  setTimeout,
  clearTimeout,
  navigator: {
    clipboard: {
      writeText(value) {
        copiedText = value;
        return Promise.resolve();
      },
    },
  },
  globalThis: null,
  document: {
    documentElement: { classList: { add() {} } },
    getElementById(id) { return elements[id]; },
  },
  window: {
    listeners: {},
    addEventListener(type, callback) { this.listeners[type] = callback; },
    print() {},
  },
};
context.globalThis = context;
vm.createContext(context);
vm.runInContext(fs.readFileSync("dist/tariff-data.js", "utf8"), context);
vm.runInContext(fs.readFileSync("dist/calculator.js", "utf8"), context);
context.KitaCalculator = context.window.KitaCalculator;
vm.runInContext(fs.readFileSync("dist/app.js", "utf8"), context);

// Alle drei geprüften Referenzfälle müssen vollständig eingesetzt und berechnet werden.
elements["example-1"].listeners.click();
assert.equal(formElements["birth-1"].value, "2025-08-05");
assert.equal(formElements["entry-1"].value, "2026");
assert.equal(formElements["birth-2"].value, "2025-08-05");
assert.equal(formElements["birth-3"].value, "");
assert.match(elements["old-total"].textContent, /6\.741,00/);
assert.match(elements["new-total"].textContent, /8\.540,00/);
assert.match(elements["care-summary-body"].innerHTML, /Kita/);
assert.match(elements["care-summary-body"].innerHTML, /2\.781,00/);
assert.match(elements["care-summary-body"].innerHTML, /77,6 %/);
assert.match(elements["care-summary-body"].innerHTML, /-360,00/);
assert.match(elements["care-summary-body"].innerHTML, /-9,1 %/);

elements["example-2"].listeners.click();
assert.equal(formElements["birth-1"].value, "2025-06-05");
assert.equal(formElements["birth-3"].value, "2024-01-06");
assert.match(elements["old-total"].textContent, /27\.410,00/);
assert.match(elements["new-total"].textContent, /38\.829,00/);

elements["example-3"].listeners.click();
assert.equal(formElements["birth-1"].value, "2024-12-15");
assert.equal(formElements["birth-2"].value, "2023-03-20");
assert.equal(formElements["birth-3"].value, "");
assert.match(elements["old-total"].textContent, /18\.618,00/);
assert.match(elements["new-total"].textContent, /23\.084,00/);
assert.equal(elements["form-error"].hidden, true, elements["form-error"].textContent);
assert.equal(elements.results.hidden, false);
assert.match(elements["old-total"].textContent, /€/);
assert.match(elements["new-total"].textContent, /€/);
assert.ok(elements["result-body"].innerHTML.includes('<tr class="amount-row">'));
assert.ok(elements["result-body"].innerHTML.includes("Kinder und Alter"));
assert.ok(elements["compact-result-body"].innerHTML.includes('<tr class="amount-row">'));
assert.ok(!elements["compact-result-body"].innerHTML.includes("Kinder und Alter"));
assert.ok(elements["compact-result-body"].innerHTML.indexOf("<strong>") > -1, "Zeiträume müssen fett dargestellt werden.");
assert.ok(!/^0,00/.test(elements["new-total"].textContent), "Das Beispiel muss einen Beitrag oberhalb von 0 € ergeben.");
assert.match(elements["percentage-total"].textContent, /24,0/);
assert.equal(elements['income'].value, '90.000');
assert.match(elements['result-description'].textContent, /Beitragsrelevantes Jahreseinkommen:/);
const oldTotal = elements['old-total'].textContent;
const newTotal = elements['new-total'].textContent;
elements['income'].value = '36.500';
elements['calculator-form'].requestSubmit();
assert.notEqual(elements['old-total'].textContent, oldTotal);
assert.notEqual(elements['new-total'].textContent, newTotal);
assert.equal(elements['income'].value, '36.500');
elements['income'].value = '';
elements['calculator-form'].requestSubmit();
assert.equal(elements['form-error'].hidden, false);
assert.equal(elements.results.hidden, true);
elements['example-3'].listeners.click();
elements["copy-table-button"].listeners.click();
assert.match(copiedText, /^Zeitraum\tMonate\tAlt \/ Monat/m);
assert.match(copiedText, /bis/);

assert.notEqual(formElements["birth-2"].value, "");
elements["clear-child-2"].listeners.click();
assert.equal(formElements["birth-2"].value, "");
assert.equal(formElements["entry-2"].value, "");
assert.notEqual(formElements["birth-1"].value, "", "Andere Kindereinträge dürfen nicht gelöscht werden.");

assert.equal(context.window.KitaApp.parseIncome("64.500"), 64500);
assert.equal(context.window.KitaApp.parseIncome("64,500"), 64500);
assert.equal(context.window.KitaApp.parseIncome("64.500,50 €"), 64500.5);
assert.ok(Number.isNaN(context.window.KitaApp.parseIncome("")));
// Zusätzlich genau die ausgelieferte Offline-Datei ausführen, nicht nur die Quelldateien.
const offlineHtml = fs.readFileSync('Kitabeitragsrechner_3.0.html', 'utf8');
for (const match of offlineHtml.matchAll(/<script>([\s\S]*?)<\/script>/g)) {
  vm.runInContext(match[1], context);
}
elements['example-1'].listeners.click();
assert.equal(elements['income'].value, '36.500');
assert.match(elements['old-total'].textContent, /6\.741,00/);
assert.match(elements['new-total'].textContent, /8\.540,00/);
assert.equal(elements['form-error'].hidden, true);
formElements['hours-1'].value = '25';
formElements['hours-2'].value = '50';
elements['calculator-form'].requestSubmit();
assert.equal(elements['form-error'].hidden, true);
assert.ok(elements['result-body'].innerHTML.includes('152,75'));
assert.ok(elements['result-body'].innerHTML.includes('25 Stunden/Woche'));
assert.ok(elements['result-body'].innerHTML.includes('50 Stunden/Woche'));
assert.equal(formElements['hours-1'].value, '25', 'Berechnen muss die Stunden behalten.');
formElements['hours-1'].value = '';
elements['calculator-form'].requestSubmit();
assert.equal(elements['form-error'].hidden, false);
assert.match(elements['form-error'].textContent, /Betreuungszeit/);
elements['example-2'].listeners.click();
for (let index = 1; index <= 4; index++) assert.equal(formElements['hours-' + index].value, '45');
formElements['hours-2'].value = '20';
elements['clear-child-2'].listeners.click();
assert.equal(formElements['hours-2'].value, '45');
assert.equal(formElements['birth-2'].value, '');
assert.equal(formElements['entry-2'].value, '');
elements['calculator-form'].requestSubmit();
assert.equal(elements['form-error'].hidden, true, 'Leeres Kind mit Standard-Stunden muss ignoriert werden.');
elements['example-4'].listeners.click();
assert.equal(elements['income'].value,'180.000');
assert.equal(elements['start-year'].value,'2026');
for (let i=1;i<=3;i++) assert.equal(formElements['hours-'+i].value,'35');
assert.equal(formElements['birth-1'].value,'2022-04-25');
assert.equal(formElements['entry-1'].value,'2023');
assert.equal(formElements['birth-2'].value,'2024-01-03');
assert.equal(formElements['entry-2'].value,'2025');
assert.equal(formElements['birth-3'].value,'2026-07-16');
assert.equal(formElements['entry-3'].value,'2027');
assert.match(elements['old-total'].textContent,/15\.120,00/);
assert.match(elements['new-total'].textContent,/24\.982,50/);
assert.equal(elements['form-error'].hidden,true);
elements['example-5'].listeners.click();
assert.equal(elements['income'].value,'70.000');
assert.equal(elements['start-year'].value,'2026');
assert.equal(formElements['hours-1'].value,'45');
assert.equal(formElements['hours-2'].value,'45');
assert.equal(formElements['birth-1'].value,'2024-06-25');
assert.equal(formElements['entry-1'].value,'2025');
assert.equal(formElements['birth-2'].value,'2025-04-03');
assert.equal(formElements['entry-2'].value,'2026');
assert.equal(formElements['birth-3'].value,'');
assert.match(elements['old-total'].textContent,/16\.590,00/);
assert.match(elements['new-total'].textContent,/19\.569,75/);
assert.equal(elements['form-error'].hidden,true);
console.log("Browser Smoke Test erfolgreich.");
elements['example-6'].listeners.click();
assert.equal(elements['income'].value,'90.000');
assert.equal(elements['start-year'].value,'2026');
assert.equal(formElements['birth-1'].value,'2020-06-15');
assert.equal(formElements['entry-1'].value,'2021');
assert.equal(formElements['birth-2'].value,'2024-06-15');
assert.equal(formElements['entry-2'].value,'2025');
assert.equal(formElements['birth-3'].value,'2025-06-15');
assert.equal(formElements['entry-3'].value,'2026');
for(let i=1;i<=3;i++) assert.equal(formElements['hours-'+i].value,'45');
assert.match(elements['old-total'].textContent,/28\.866,00/);
assert.match(elements['new-total'].textContent,/31\.936,00/);
assert.match(elements['result-body'].innerHTML,/So setzt sich die Differenz zusammen/);
assert.match(elements['result-body'].innerHTML,/\+282,50/);
assert.match(elements['result-body'].innerHTML,/-90,00/);
assert.match(elements['result-body'].innerHTML,/-1\.080,00/);
assert.ok(!elements['compact-result-body'].innerHTML.includes('care-difference-details'));
assert.equal(elements['form-error'].hidden,true);
