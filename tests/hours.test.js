const assert = require('node:assert/strict');
const original = require('../dist/calculator.js');
// Die bisherigen Tests prüfen bewusst weiterhin nur den Kita-Zeitraum.
const calc = { ...original, calculate: input => original.calculate({ ...input, includeOgs: false }) };
const tariffs = require('../dist/tariff-data.js');
const fs = require('node:fs');
const path = require('node:path');
let checkedRates = 0;
for (const [name, categories, rate] of [
  ['old', ['U2', 'Ü2'], calc.oldRate],
  ['new', ['U3', 'Ü3'], calc.newRate],
]) {
  const rows = tariffs[name].brackets;
  rows.forEach((row, index) => {
    tariffs.hours.forEach((hours, column) => {
      for (const [group, category] of [['young', categories[0]], ['older', categories[1]]]) {
        assert.equal(rate(row.min, category, hours), row[group][column]);
        checkedRates++;
        if (row.max !== null) {
          assert.equal(rate(row.max - 0.01, category, hours), row[group][column]);
          const next = rows[index + 1];
          assert.equal(rate(row.max, category, hours), (name === 'old' ? next : row)[group][column]);
          assert.equal(rate(row.max + 0.01, category, hours), next[group][column]);
        }
      }
    });
  });
}

const input = {
  income: 36500, startYear: 2026,
  children: [
    { id: 1, birth: '2025-08-05', entry: '2026-08-01', hours: 25 },
    { id: 2, birth: '2025-08-05', entry: '2026-08-01', hours: 50 },
  ],
};
function month(result, year, number) {
  const target = calc.monthIndex(year, number);
  return result.sections.find(s => s.startMonth <= target && s.endMonth >= target);
}
const mixed = calc.calculate(input);
assert.equal(month(mixed, 2026, 8).oldMonthly, 120);
assert.equal(month(mixed, 2026, 8).newMonthly, 152.75); // 137 + 25 % von 63
assert.deepEqual(month(mixed, 2026, 8).oldChildren.map(c => c.charged), [0, 120]);
assert.deepEqual(month(mixed, 2026, 8).newChildren.map(c => c.charged), [15.75, 137]);
assert.equal(month(mixed, 2027, 9).oldMonthly, 68);
assert.equal(month(mixed, 2027, 9).newMonthly, 152.75);
assert.equal(month(mixed, 2028, 9).newMonthly, 101.5); // 91 + 25 % von 42
assert.equal(month(mixed, 2029, 8).oldMonthly, 0);
assert.equal(month(mixed, 2029, 8).newMonthly, 0);
const swapped = calc.calculate({ ...input, children: [...input.children].reverse() });
assert.equal(swapped.oldTotal, mixed.oldTotal);
assert.equal(swapped.newTotal, mixed.newTotal);

// Das ältere Kind kann aufgrund seiner Stunden trotz älterer Altersklasse teurer sein.
const olderExpensive = calc.calculate({ ...input, income: 90000, children: [
  { birth: '2023-01-15', entry: '2026-08-01', hours: 50 },
  { birth: '2025-05-15', entry: '2026-08-01', hours: 15 },
] });
assert.equal(olderExpensive.sections[0].oldMonthly, 401);
assert.equal(olderExpensive.sections[0].newMonthly, 450.25); // 409 + 25 % von 165

const freeSibling = calc.calculate({ ...input, children: [
  { birth: '2022-06-15', entry: '2026-08-01', hours: 50 },
  { birth: '2025-05-15', entry: '2026-08-01', hours: 25 },
  { birth: '2025-05-16', entry: '2026-08-01', hours: 15 },
] });
assert.equal(freeSibling.sections[0].oldMonthly, 0);
assert.equal(freeSibling.sections[0].newMonthly, 15.75);

for (const hours of [0, 10, 26, 55, '', ' ', null, NaN, Infinity]) {
  assert.throws(() => calc.calculate({ ...input, children: [{ ...input.children[0], hours }] }), /Betreuungszeit/);
}
assert.equal(calc.calculate({ ...input, children: [{ ...input.children[0], hours: '35' }] }).children[0].hours, 35);
assert.equal(calc.calculate({ ...input, children: [{ birth: '2025-08-05', entry: '2026-08-01' }] }).children[0].hours, 45);

// Reconciliation über alle Stunden-Kombinationen und unterschiedliche Einkommensgrundlagen.
for (const firstHours of tariffs.hours) for (const secondHours of tariffs.hours) {
  const result = calc.calculate({ ...input, income: 90000,
    children: input.children.map((child, index) => ({ ...child, hours: index ? secondHours : firstHours })) });
  assert.equal(result.oldTotal, result.sections.reduce((sum, s) => sum + s.oldMonthly * s.monthCount, 0));
  assert.equal(result.newTotal, result.sections.reduce((sum, s) => sum + s.newMonthly * s.monthCount, 0));
  assert.equal(result.difference, result.newTotal - result.oldTotal);
}
// Die sichtbaren Beitragstabellen müssen alle Werte derselben Datengrundlage enthalten.
const html = fs.readFileSync(path.join(__dirname, '../dist/index.html'), 'utf8');
const euro = new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' });
for (const [name, group, category] of [['old', 'young', 'U2'], ['old', 'older', 'Ü2'], ['new', 'young', 'U3'], ['new', 'older', 'Ü3']]) {
  const table = html.match(new RegExp('<table class="rate-table" data-statute="' + name + '" data-category="' + category + '"[\\s\\S]*?</table>'));
  assert.ok(table, 'Sichtbare Tariftabelle fehlt.');
  for (const row of tariffs[name].brackets) {
    const values = row[group].map(value => '<td>' + euro.format(value) + '</td>').join('');
    assert.ok(table[0].includes(values), 'Sichtbare Tarifzeile muss mit Datenquelle übereinstimmen.');
  }
}
console.log(`${checkedRates} Tarif-/Altersgruppenwerte, alle Stunden-Grenzen und 64 Geschwisterkombinationen erfolgreich geprüft.`);
