const assert = require('node:assert/strict');
const original = require('../dist/calculator.js');
// Die bisherigen Tests prüfen bewusst weiterhin nur den Kita-Zeitraum.
const calc = { ...original, calculate: input => original.calculate({ ...input, includeOgs: false }) };
const tariffs = require('../dist/tariff-data.js');

const family = {
  startYear: 2026,
  children: [
    { birth: '2025-08-05', entry: '2026-08-01' },
    { birth: '2025-08-05', entry: '2026-08-01' },
  ],
};
const baseline = calc.calculate({ ...family, income: 36500 });
const higher = calc.calculate({ ...family, income: 90000 });
assert.equal(baseline.oldTotal, 2781);
assert.equal(baseline.newTotal, 4940);
assert.equal(higher.sections[0].oldMonthly, 629);
assert.equal(higher.sections[0].newMonthly, 687.5);
for (const income of ['', ' ', undefined, null, NaN, Infinity, -1]) {
 assert.throws(() => calc.calculate({ ...family, income }), /Jahreseinkommen/);
}
for (const [income, oldFee, newFee] of [[0,0,0],[32999.99,0,0],[33000,106,0],[36000,106,0],[36000.01,106,152.5]]) {
 const section = calc.calculate({ ...family, income }).sections[0];
 assert.equal(section.oldMonthly, oldFee);
 assert.equal(section.newMonthly, newFee);
}
assert.deepEqual(tariffs.hours, [15, 20, 25, 30, 35, 40, 45, 50]);
assert.equal(tariffs.old.brackets.length, 8);
assert.equal(tariffs.new.brackets.length, 13);
for (const table of [tariffs.old, tariffs.new]) {
  for (const row of table.brackets) {
    assert.equal(row.young.length, tariffs.hours.length);
    assert.equal(row.older.length, tariffs.hours.length);
    for (const value of [...row.young, ...row.older, row.ogsFirst, row.ogsSecond]) {
      assert.ok(Number.isFinite(value) && value >= 0, 'Jeder Tabellenbeitrag muss ein gültiger nicht negativer Betrag sein.');
    }
    assert.equal(row.ogsSecond, row.ogsFirst * 0.5, 'Die OGS-Zweitkindspalte entspricht exakt 50 %.');
  }
}
console.log('Gemeinsames Einkommen, Eingabevalidierung und vollständige Tarifstruktur erfolgreich geprüft.');
