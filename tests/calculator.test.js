const assert = require("node:assert/strict");
const original = require("../dist/calculator.js");
// Die bisherigen Tests prüfen bewusst weiterhin nur den Kita-Zeitraum.
const calc = { ...original, calculate: input => original.calculate({ ...input, includeOgs: false }) };

function findSection(result, year, month) {
  const target = calc.monthIndex(year, month);
  return result.sections.find((section) => section.startMonth <= target && section.endMonth >= target);
}

function assertMoney(actual, expected, message) {
  assert.ok(Math.abs(actual - expected) < 0.000001, `${message}: erwartet ${expected}, erhalten ${actual}`);
}

function assertReferenceCase(name, input, expected) {
  const result = calc.calculate(input);
  assertMoney(result.oldTotal, expected.oldTotal, `${name} – alte Gesamtsumme`);
  assertMoney(result.newTotal, expected.newTotal, `${name} – neue Gesamtsumme`);
  assertMoney(result.difference, expected.difference, `${name} – Gesamtdifferenz`);

  expected.months.forEach(({ year, month, oldMonthly, newMonthly }) => {
    const section = findSection(result, year, month);
    assert.ok(section, `${name} – kein Abschnitt für ${month}/${year}`);
    assertMoney(section.oldMonthly, oldMonthly, `${name} – alter Monatsbeitrag ${month}/${year}`);
    assertMoney(section.newMonthly, newMonthly, `${name} – neuer Monatsbeitrag ${month}/${year}`);
    assertMoney(section.differenceMonthly, newMonthly - oldMonthly, `${name} – Monatsdifferenz ${month}/${year}`);
  });

  const coveredMonths = result.sections.reduce((sum, section) => sum + section.monthCount, 0);
  assert.equal(coveredMonths, result.endMonth - result.startMonth + 1, `${name} – lückenlose Monatsabdeckung`);
  return result;
}

// Einkommensgrenzen: alte Satzung beginnt bei 33.000 EUR in der zweiten Stufe,
// neue Satzung bleibt bis einschließlich 36.000 EUR beitragsfrei.
assert.equal(calc.oldRate(32999.99, "U2"), 0);
assert.equal(calc.oldRate(33000, "U2"), 106);
assert.equal(calc.newRate(36000, "U3"), 0);
assert.equal(calc.newRate(36000.01, "U3"), 122);

// Jede Einkommensgrenze wird auf beiden Seiten geprüft.
[
  [0, 0, 0], [32999.99, 0, 0], [33000, 106, 61], [36999.99, 106, 61],
  [37000, 178, 102], [49999.99, 178, 102], [50000, 266, 152],
  [61999.99, 266, 152], [62000, 370, 212], [74999.99, 370, 212],
  [75000, 491, 281], [86999.99, 491, 281], [87000, 629, 359],
  [99999.99, 629, 359], [100000, 725, 415], [999999, 725, 415],
].forEach(([income, u2, ue2]) => {
  assert.equal(calc.oldRate(income, "U2"), u2, `Alte Satzung U2 bei ${income}`);
  assert.equal(calc.oldRate(income, "Ü2"), ue2, `Alte Satzung Ü2 bei ${income}`);
});

[
  [0, 0, 0], [36000, 0, 0], [36000.01, 122, 82], [43000, 122, 82],
  [43000.01, 153, 102], [50000, 153, 102], [50000.01, 190, 127],
  [56000, 190, 127], [56000.01, 228, 152], [62000, 228, 152],
  [62000.01, 317, 212], [75000, 317, 212], [75000.01, 421, 281],
  [87000, 421, 281], [87000.01, 550, 366], [100000, 550, 366],
  [100000.01, 634, 423], [112000, 634, 423], [112000.01, 659, 440],
  [125000, 659, 440], [125000.01, 686, 458], [150000, 686, 458],
  [150000.01, 713, 476], [175000, 713, 476], [175000.01, 742, 495],
].forEach(([income, u3, ue3]) => {
  assert.equal(calc.newRate(income, "U3"), u3, `Neue Satzung U3 bei ${income}`);
  assert.equal(calc.newRate(income, "Ü3"), ue3, `Neue Satzung Ü3 bei ${income}`);
});

// Sommerkind: beitragsfrei ab August im Jahr des 4. Geburtstags, Ende Juli zwei Jahre später.
const summer = calc.parseDate("2022-09-30");
assert.equal(calc.freeStartMonth(summer), calc.monthIndex(2026, 8));
assert.equal(calc.exitMonth(summer), calc.monthIndex(2028, 7));

// Winterkind: beitragsfrei ab August im Jahr des 5. Geburtstags, Ende Juli zwei Jahre später.
const winter = calc.parseDate("2021-10-01");
assert.equal(calc.freeStartMonth(winter), calc.monthIndex(2026, 8));
assert.equal(calc.exitMonth(winter), calc.monthIndex(2028, 7));

// Der 30. September ist noch Sommerkind, der 1. Oktober bereits Winterkind.
assert.equal(calc.freeStartMonth(calc.parseDate("2022-09-30")), calc.monthIndex(2026, 8));
assert.equal(calc.freeStartMonth(calc.parseDate("2022-10-01")), calc.monthIndex(2027, 8));

// Altersklassen wechseln jeweils im Monat nach dem Geburtstag.
const single = calc.calculate({
  income: 50000,
  startYear: 2024,
  children: [{ birth: "2023-01-15", entry: "2024-08-01" }],
});
assert.equal(findSection(single, 2025, 1).oldChildren[0].category, "U2");
assert.equal(findSection(single, 2025, 2).oldChildren[0].category, "Ü2");
assert.equal(findSection(single, 2026, 1).newChildren[0].category, "U3");
assert.equal(findSection(single, 2026, 2).newChildren[0].category, "Ü3");

// Alte Satzung: ohne freies Kind wird nur der höchste Beitrag erhoben.
const siblings = calc.calculate({
  income: 62000,
  startYear: 2024,
  children: [
    { birth: "2022-10-10", entry: "2024-08-01" },
    { birth: "2023-10-10", entry: "2024-08-01" },
  ],
});
const siblingMonth = findSection(siblings, 2024, 8);
assert.equal(siblingMonth.oldMonthly, 370);
assert.equal(siblingMonth.newMonthly, 285); // 228 + 25 % von 228

// Ein beitragsfreies Kind belegt den ersten Platz: alt alles frei, neu nächstes Kind 25 %.
const withFreeChild = calc.calculate({
  income: 62000,
  startYear: 2026,
  children: [
    { birth: "2022-05-10", entry: "2024-08-01" },
    { birth: "2024-05-10", entry: "2025-08-01" },
  ],
});
const freeMonth = findSection(withFreeChild, 2026, 8);
assert.equal(freeMonth.oldMonthly, 0);
assert.equal(freeMonth.newMonthly, 57);

// Drei Kinder: 100 %, 25 %, 0 %. Es wird nicht auf volle Euro gerundet.
const threeChildren = calc.calculate({
  income: 90000,
  startYear: 2026,
  children: [
    { birth: "2025-01-10", entry: "2026-08-01" },
    { birth: "2025-02-10", entry: "2026-08-01" },
    { birth: "2025-03-10", entry: "2026-08-01" },
  ],
});
const threeChildrenMonth = findSection(threeChildren, 2026, 8);
assertMoney(threeChildrenMonth.oldMonthly, 629, "Drei Kinder – alte Geschwisterregel");
assertMoney(threeChildrenMonth.newMonthly, 687.5, "Drei Kinder – neue Geschwisterregel");
assert.deepEqual(
  threeChildrenMonth.newChildren.map((child) => child.charged),
  [550, 137.5, 0],
  "Neue Satzung muss exakt 100 %, 25 %, 0 % anwenden",
);

// Referenzfall 1: Zwillinge, 36.500 EUR.
assertReferenceCase("Referenzfall 1", {
  income: 36500,
  startYear: 2026,
  children: [
    { birth: "2025-08-05", entry: "2026-08-01" },
    { birth: "2025-08-05", entry: "2026-08-01" },
  ],
}, {
  oldTotal: 2781,
  newTotal: 4940,
  difference: 2159,
  months: [
    { year: 2026, month: 8, oldMonthly: 106, newMonthly: 152.5 },
    { year: 2027, month: 8, oldMonthly: 106, newMonthly: 152.5 },
    { year: 2027, month: 9, oldMonthly: 61, newMonthly: 152.5 },
    { year: 2028, month: 9, oldMonthly: 61, newMonthly: 102.5 },
    { year: 2029, month: 8, oldMonthly: 0, newMonthly: 0 },
  ],
});

// Referenzfall 2: Zwillinge plus älteres Kind, 130.000 EUR.
assertReferenceCase("Referenzfall 2", {
  income: 130000,
  startYear: 2026,
  children: [
    { birth: "2025-06-05", entry: "2026-08-01" },
    { birth: "2025-06-05", entry: "2026-08-01" },
    { birth: "2024-01-06", entry: "2026-08-01" },
  ],
}, {
  oldTotal: 13370,
  newTotal: 21669,
  difference: 8299,
  months: [
    { year: 2026, month: 8, oldMonthly: 725, newMonthly: 857.5 },
    { year: 2027, month: 7, oldMonthly: 415, newMonthly: 857.5 },
    { year: 2028, month: 7, oldMonthly: 415, newMonthly: 572.5 },
    { year: 2028, month: 8, oldMonthly: 0, newMonthly: 114.5 },
    { year: 2029, month: 8, oldMonthly: 0, newMonthly: 0 },
  ],
});

// Referenzfall 3: Winterkind plus älteres Sommerkind, 90.000 EUR.
assertReferenceCase("Referenzfall 3", {
  income: 90000,
  startYear: 2026,
  children: [
    { birth: "2024-12-15", entry: "2026-08-01" },
    { birth: "2023-03-20", entry: "2026-08-01" },
  ],
}, {
  oldTotal: 5658,
  newTotal: 10124,
  difference: 4466,
  months: [
    { year: 2026, month: 8, oldMonthly: 629, newMonthly: 641.5 },
    { year: 2027, month: 1, oldMonthly: 359, newMonthly: 641.5 },
    { year: 2027, month: 8, oldMonthly: 0, newMonthly: 137.5 },
    { year: 2028, month: 1, oldMonthly: 0, newMonthly: 91.5 },
    { year: 2029, month: 8, oldMonthly: 0, newMonthly: 0 },
  ],
});

// Plausibilitätsprüfung über viele Kombinationen: Abschnitte müssen lückenlos sein,
// Monats- und Gesamtsummen zusammenpassen und kein Kind darf negativ zahlen.
for (const income of [0, 33000, 36500, 50000, 62000, 90000, 130000, 180000]) {
  for (const birthMonth of [1, 6, 9, 10, 12]) {
    const birth = `2023-${String(birthMonth).padStart(2, "0")}-15`;
    const result = calc.calculate({
      income: income,
      startYear: 2025,
      children: [
        { birth, entry: "2025-08-01" },
        { birth: "2024-07-01", entry: "2025-08-01" },
      ],
    });
    let nextStart = result.startMonth;
    let oldSum = 0;
    let newSum = 0;
    result.sections.forEach((section) => {
      assert.equal(section.startMonth, nextStart, "Abschnitte müssen ohne Lücke aufeinanderfolgen");
      assert.equal(section.monthCount, section.endMonth - section.startMonth + 1, "Abschnittslänge muss stimmen");
      assertMoney(section.oldTotal, section.oldMonthly * section.monthCount, "Alte Abschnittssumme");
      assertMoney(section.newTotal, section.newMonthly * section.monthCount, "Neue Abschnittssumme");
      [...section.oldChildren, ...section.newChildren].forEach((child) => {
        assert.ok(child.charged >= 0, "Ein Beitrag darf nicht negativ sein");
        assert.ok(child.charged <= child.base, "Ein Kind darf höchstens seinen Grundbeitrag zahlen");
      });
      oldSum += section.oldTotal;
      newSum += section.newTotal;
      nextStart = section.endMonth + 1;
    });
    assert.equal(nextStart, result.endMonth + 1, "Berechnung muss bis zum Kita-Ende reichen");
    assertMoney(oldSum, result.oldTotal, "Alte Gesamtsumme aus Abschnitten");
    assertMoney(newSum, result.newTotal, "Neue Gesamtsumme aus Abschnitten");
    assertMoney(newSum - oldSum, result.difference, "Gesamtdifferenz aus Abschnitten");
  }
}

console.log("Alle Berechnungstests erfolgreich.");
