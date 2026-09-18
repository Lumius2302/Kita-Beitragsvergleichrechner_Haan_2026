const assert = require('node:assert/strict');
const calc = require('../dist/calculator.js');
const tariffs = require('../dist/tariff-data.js');
const child = (birth, entry = '2026-08-01', hours = 45) => ({ birth, entry, hours });
const at = (result, year, month) => result.sections.find(s => s.startMonth <= calc.monthIndex(year, month) && s.endMonth >= calc.monthIndex(year, month));
const run = children => calc.calculate({ income: 90000, startYear: 2026, children });
const oldRate = 180, newRate = tariffs.new.brackets.find(r => r.max >= 90000).ogsFirst;
// Sommerkind: letzter Kita-Juli, exakt 48 OGS-Monate, letzter OGS-Juli.
let result = run([child('2022-09-30')]);
assert.equal(at(result, 2028, 7).newMonthly, 0);
assert.equal(at(result, 2028, 8).newMonthly, newRate);
assert.equal(result.endMonth, calc.monthIndex(2032, 7));
assert.equal(result.sections.filter(s => s.newChildren[0].ogs).reduce((n,s) => n+s.monthCount,0),48);
// Oktober-Grenze: ein Jahr späterer Übergang als Septemberkind.
result = run([child('2022-10-01')]);
assert.equal(at(result, 2029, 7).newMonthly, 0);
assert.equal(at(result, 2029, 8).newMonthly, newRate);
assert.equal(result.endMonth, calc.monthIndex(2033, 7));
// Ausschließlich OGS: 100 %, 50 %, 0 %, 0 %.
for (let count=1; count<=4; count++) {
 result = run(Array.from({length:count},()=>child('2020-06-15','2024-08-01')));
 assert.equal(result.sections[0].oldMonthly, oldRate*(count===1?1:1.5));
 assert.equal(result.sections[0].newMonthly, newRate*(count===1?1:1.5));
}
// Beitragsfreies Kita-Kind löst halben OGS-Beitrag aus.
result=run([child('2020-06-15','2024-08-01'),child('2022-06-15')]);
assert.equal(result.sections[0].oldMonthly, oldRate/2);
assert.equal(result.sections[0].newMonthly, newRate/2);
// Ein zahlendes Kita-Kind: voller Kita-Beitrag plus halbe OGS.
result=run([child('2020-06-15','2024-08-01'),child('2025-06-15')]);
assert.equal(result.sections[0].oldMonthly,629+oldRate/2);
assert.equal(result.sections[0].newMonthly,550+newRate/2);
// Zwei Kita + OGS: neue Gesamtbegrenzung nach den Ermäßigungen.
result=run([child('2020-06-15','2024-08-01'),child('2025-06-15'),child('2025-06-16')]);
assert.equal(result.sections[0].newMonthly,550+Math.max(550/4,newRate/2));
assert.equal(result.sections[0].newChildren.filter(c=>c.charged>0).length,2);
// Niedriger Kita-Zweitbeitrag: stattdessen bleiben Kita-Erstbeitrag und OGS stehen.
result=run([child('2020-06-15','2024-08-01'),child('2025-06-15'),child('2025-06-16','2026-08-01',15)]);
assert.equal(result.sections[0].newMonthly,550+newRate/2);
assert.equal(result.sections[0].newChildren[2].charged,0);
assert.match(result.sections[0].newChildren[2].role,/Gesamtbegrenzung/);
// Gemeinsamer Beginn erst in der OGS ist ebenfalls berechenbar.
result=calc.calculate({income:90000,startYear:2028,children:[child('2022-09-30')]});
assert.equal(result.sections[0].newMonthly,newRate);
assert.equal(result.newTotal,newRate*48);
// Mehrere OGS + Kita: ausschließlich ein halber OGS-Beitrag.
result=run([child('2020-06-15','2024-08-01'),child('2020-06-16','2024-08-01'),child('2025-06-15')]);
assert.equal(result.sections[0].newMonthly,550+newRate/2);
// Sobald OGS endet, darf das Kind keine Geschwisterermäßigung mehr auslösen.
result=run([child('2020-06-15','2024-08-01'),child('2025-06-15')]);
assert.equal(at(result,2030,8).newChildren[0].charged,0);
assert.equal(at(result,2030,8).newChildren[0].active,false);
// Monatsreferenz und Abschnitte stimmen für alle Einkommensgrenzen überein.
for(const income of [0,32999.99,33000,36000,36000.01,75000,90000,130000,200000]) {
 result=calc.calculate({income,startYear:2026,children:[child('2020-06-15','2024-08-01'),child('2025-06-15'),child('2025-06-16')]});
 let old=0,neu=0;
 for(let month=result.startMonth;month<=result.endMonth;month++) {
  const s=result.sections.find(s=>s.startMonth<=month&&s.endMonth>=month);
  assert.ok(s);
  assert.ok(s.newChildren.filter(c=>c.charged>0).length<=2);
  old+=s.oldMonthly;neu+=s.newMonthly;
 }
 assert.equal(result.oldTotal,old);assert.equal(result.newTotal,neu);
 assert.equal(result.difference,neu-old);
 assert.equal(result.careTotals.kita.oldTotal+result.careTotals.ogs.oldTotal,result.oldTotal);
 assert.equal(result.careTotals.kita.newTotal+result.careTotals.ogs.newTotal,result.newTotal);
 assert.equal(result.careTotals.kita.difference+result.careTotals.ogs.difference,result.difference);
}
const twins=calc.calculate({income:36500,startYear:2026,children:[child('2025-08-05'),child('2025-08-05')]});
assert.deepEqual(twins.careTotals.kita,{oldTotal:2781,newTotal:4940,difference:2159});
assert.deepEqual(twins.careTotals.ogs,{oldTotal:3960,newTotal:3600,difference:-360});
console.log('OGS-Übergänge, 48 Monate, Geschwisterregeln, Kita/OGS und Gesamtbegrenzung erfolgreich geprüft.');
// Beispiel 6: OGS 90 € bleibt knapp unter dem Kita-Zweitbeitrag 91,50 €.
const capFamily=calc.calculate({income:90000,startYear:2026,children:[
 child('2020-06-15','2021-08-01'),child('2024-06-15','2025-08-01'),child('2025-06-15','2026-08-01'),
]});
const before=at(capFamily,2026,8);
assert.equal(before.oldMonthly,719);
assert.equal(before.newMonthly,687.5);
assert.deepEqual(before.newChildren.map(c=>c.charged),[0,550,137.5]);
assert.match(before.newChildren[0].role,/Gesamtbegrenzung/);
const after=at(capFamily,2027,7);
assert.equal(after.oldMonthly,449);
assert.equal(after.newMonthly,641.5);
assert.deepEqual(after.newChildren.map(c=>c.charged),[0,91.5,550]);
assert.match(after.newChildren[0].role,/Gesamtbegrenzung/);
