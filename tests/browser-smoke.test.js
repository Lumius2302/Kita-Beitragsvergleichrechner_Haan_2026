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
  "result-description", "example-menu", "example-1", "example-2", "example-3", "print-button",
  "copy-table-button", "copy-status", "detail-view",
  "clear-child-1", "clear-child-2", "clear-child-3", "clear-child-4",
];
const elements = Object.fromEntries(ids.map((id) => [id, element(id)]));
const formElements = {};
for (let index = 1; index <= 4; index += 1) {
  formElements["birth-" + index] = element("birth-" + index);
  formElements["entry-" + index] = element("entry-" + index);
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
vm.runInContext(fs.readFileSync("dist/calculator.js", "utf8"), context);
context.KitaCalculator = context.window.KitaCalculator;
vm.runInContext(fs.readFileSync("dist/app.js", "utf8"), context);

// Alle drei geprüften Referenzfälle müssen vollständig eingesetzt und berechnet werden.
elements["example-1"].listeners.click();
assert.equal(formElements["birth-1"].value, "2025-08-05");
assert.equal(formElements["entry-1"].value, "2026");
assert.equal(formElements["birth-2"].value, "2025-08-05");
assert.equal(formElements["birth-3"].value, "");
assert.match(elements["old-total"].textContent, /2\.781,00/);
assert.match(elements["new-total"].textContent, /4\.940,00/);

elements["example-2"].listeners.click();
assert.equal(formElements["birth-1"].value, "2025-06-05");
assert.equal(formElements["birth-3"].value, "2024-01-06");
assert.match(elements["old-total"].textContent, /13\.370,00/);
assert.match(elements["new-total"].textContent, /21\.669,00/);

elements["example-3"].listeners.click();
assert.equal(formElements["birth-1"].value, "2024-12-15");
assert.equal(formElements["birth-2"].value, "2023-03-20");
assert.equal(formElements["birth-3"].value, "");
assert.match(elements["old-total"].textContent, /5\.658,00/);
assert.match(elements["new-total"].textContent, /10\.124,00/);
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
assert.match(elements["percentage-total"].textContent, /78,9/);
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
console.log("Browser Smoke Test erfolgreich.");
