(function (root, factory) {
  const tariffs = typeof module === "object" && module.exports ? require("./tariff-data.js") : root.KitaTariffs;
  const api = factory(tariffs);
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.KitaCalculator = api;
})(typeof window !== "undefined" ? window : globalThis, function (tariffs) {
  "use strict";

  if (!tariffs) throw new Error("Die Beitragstabellen konnten nicht geladen werden.");
  const hourColumn = tariffs.hours.indexOf(tariffs.defaultHours);
  const OLD_BRACKETS = tariffs.old.brackets.map((row) => ({
    min: row.min, maxExclusive: row.max === null ? Infinity : row.max,
    young: row.young[hourColumn], older: row.older[hourColumn],
  }));
  const NEW_BRACKETS = tariffs.new.brackets.map((row) => ({
    maxInclusive: row.max === null ? Infinity : row.max,
    young: row.young[hourColumn], older: row.older[hourColumn],
  }));

  function parseDate(value) {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value || "");
    if (!match) throw new Error("Ungültiges Datum: " + value);
    const year = Number(match[1]);
    const month = Number(match[2]);
    const day = Number(match[3]);
    const date = new Date(Date.UTC(year, month - 1, day));
    if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) {
      throw new Error("Ungültiges Datum: " + value);
    }
    return { year, month, day };
  }

  function monthIndex(year, month) {
    return year * 12 + month - 1;
  }

  function fromMonthIndex(index) {
    return { year: Math.floor(index / 12), month: (index % 12) + 1 };
  }

  function ageInMonths(birth, month) {
    return month - monthIndex(birth.year, birth.month);
  }

  function freeStartMonth(birth) {
    const summerChild = birth.month <= 9;
    return monthIndex(birth.year + (summerChild ? 4 : 5), 8);
  }

  function exitMonth(birth) {
    return freeStartMonth(birth) + 23;
  }

  function hoursIndex(hours) {
    if (hours === "" || hours === null || !tariffs.hours.includes(Number(hours))) {
      throw new Error("Bitte eine gültige Betreuungszeit auswählen.");
    }
    return tariffs.hours.indexOf(Number(hours));
  }

  function oldRate(income, category, hours = tariffs.defaultHours) {
    const column = hoursIndex(hours);
    const bracket = tariffs.old.brackets.find((item) => income >= item.min && (item.max === null || income < item.max));
    if (!bracket) throw new Error("Für das beitragsrelevante Jahreseinkommen wurde kein Tarif gefunden.");
    return (category === "U2" ? bracket.young : bracket.older)[column];
  }

  function newRate(income, category, hours = tariffs.defaultHours) {
    const column = hoursIndex(hours);
    const bracket = tariffs.new.brackets.find((item) => item.max === null || income <= item.max);
    if (!bracket || !Number.isFinite(income) || income < 0) throw new Error("Für das beitragsrelevante Jahreseinkommen wurde kein Tarif gefunden.");
    return (category === "U3" ? bracket.young : bracket.older)[column];
  }

  function childBaseState(child, month, income, statute) {
    const entered = month >= child.entryMonth;
    const left = month > child.careEndMonth;
    const active = entered && !left;
    const ogs = active && month > child.exitMonth;
    const free = active && !ogs && month >= child.freeStartMonth;
    const ageMonths = ageInMonths(child.birth, month);
    let category = null;
    let base = 0;

    if (ogs) {
      category = "OGS";
      const bracket = statute === "old"
        ? tariffs.old.brackets.find((row) => income >= row.min && (row.max === null || income < row.max))
        : tariffs.new.brackets.find((row) => row.max === null || income <= row.max);
      base = bracket.ogsFirst;
    } else if (active && !free) {
      if (statute === "old") {
        category = ageMonths <= 24 ? "U2" : "Ü2";
        base = oldRate(income, category, child.hours);
      } else {
        category = ageMonths <= 36 ? "U3" : "Ü3";
        base = newRate(income, category, child.hours);
      }
    }

    return {
      id: child.id,
      name: child.name,
      birth: child.birth,
      ageMonths,
      hours: child.hours,
      active,
      ogs,
      entered,
      left,
      free,
      category,
      base,
      charged: 0,
      role: active ? (free ? "Beitragsfreie Kita-Jahre" : "") : (left ? "Betreuung beendet" : "Noch nicht gestartet"),
    };
  }

  function orderPayingChildren(states) {
    return states
      .filter((state) => state.active && !state.free)
      .sort((a, b) => b.base - a.base || a.birth.year - b.birth.year || a.birth.month - b.birth.month || a.birth.day - b.birth.day || a.id - b.id);
  }

  function applyOldSiblingRule(states) {
    const active = states.filter((state) => state.active);
    const freeCount = active.filter((state) => state.free).length;
    const paying = orderPayingChildren(states);

    if (freeCount > 0) {
      paying.forEach((state) => { state.role = "Geschwisterregel · 0 %"; });
    } else if (paying.length) {
      paying[0].charged = paying[0].base;
      paying[0].role = "Höchster Beitrag · 100 %";
      paying.slice(1).forEach((state) => { state.role = "Geschwisterregel · 0 %"; });
    }
    return states;
  }

  function applyNewSiblingRule(states) {
    const active = states.filter((state) => state.active);
    const freeCount = active.filter((state) => state.free).length;
    const paying = orderPayingChildren(states);

    paying.forEach((state, index) => {
      const siblingPosition = freeCount + index;
      if (siblingPosition === 0) {
        state.charged = state.base;
        state.role = "Höchster Beitrag · 100 %";
      } else if (siblingPosition === 1) {
        state.charged = state.base * 0.25;
        state.role = "Zweitkind · 25 %";
      } else {
        state.role = "Weiteres Kind · 0 %";
      }
    });
    return states;
  }

  function evaluateMonth(month, children, income) {
    const evaluate = (statute) => {
      const states = children.map((child) => childBaseState(child, month, income, statute));
      const kita = states.filter((state) => !state.ogs);
      (statute === "old" ? applyOldSiblingRule : applyNewSiblingRule)(kita);
      const ogs = orderPayingChildren(states.filter((state) => state.ogs));
      const mixed = kita.some((state) => state.active);
      ogs.forEach((state, index) => {
        const fraction = mixed ? (index === 0 ? 0.5 : 0) : (index === 0 ? 1 : index === 1 ? 0.5 : 0);
        state.charged = state.base * fraction;
        state.role = mixed ? (index === 0 ? "Kita + OGS · 50 %" : "Weitere OGS · 0 %")
          : (index === 0 ? "OGS · 100 %" : index === 1 ? "OGS-Zweitkind · 50 %" : "Weitere OGS · 0 %");
      });
      if (statute === "new") {
        const charged = states.filter((state) => state.charged > 0).sort((a, b) => b.charged - a.charged || a.id - b.id);
        charged.slice(2).forEach((state) => {
          state.charged = 0;
          state.role += " · Gesamtbegrenzung: 0 %";
        });
      }
      return states;
    };
    const oldChildren = evaluate("old");
    const newChildren = evaluate("new");
    const oldTotal = oldChildren.reduce((sum, child) => sum + child.charged, 0);
    const newTotal = newChildren.reduce((sum, child) => sum + child.charged, 0);
    return { month, oldTotal, newTotal, difference: newTotal - oldTotal, oldChildren, newChildren };
  }

  function stateKey(monthResult) {
    const childKey = (children) => children.map((child) => [
      child.hours,
      child.active,
      child.ogs,
      child.free,
      child.category || "-",
      child.base,
      child.charged,
      child.role,
    ].join(":"));
    return JSON.stringify([
      monthResult.oldTotal,
      monthResult.newTotal,
      childKey(monthResult.oldChildren),
      childKey(monthResult.newChildren),
    ]);
  }

  function normalizeChildren(children) {
    return children.map((child, index) => {
      const birth = typeof child.birth === "string" ? parseDate(child.birth) : child.birth;
      const entry = typeof child.entry === "string" ? parseDate(child.entry) : child.entry;
      const hours = child.hours === undefined ? tariffs.defaultHours : child.hours;
      hoursIndex(hours);
      const normalized = {
        id: child.id || index + 1,
        name: child.name || "Kind " + (index + 1),
        birth,
        entry,
        hours: Number(hours),
        entryMonth: monthIndex(entry.year, entry.month),
        freeStartMonth: freeStartMonth(birth),
        exitMonth: exitMonth(birth),
      };
      if (normalized.entryMonth > normalized.exitMonth) {
        throw new Error(normalized.name + ": Der Kita-Start liegt nach dem errechneten Kita-Ende.");
      }
      if (normalized.entryMonth < monthIndex(birth.year, birth.month)) {
        throw new Error(normalized.name + ": Der Kita-Start liegt vor der Geburt.");
      }
      return normalized;
    });
  }

  function calculate(input) {
    const income = input.income == null || String(input.income).trim() === "" ? NaN : Number(input.income);
    const startYear = Number(input.startYear);
    if (!Number.isFinite(income) || income < 0) throw new Error("Bitte ein gültiges, nicht negatives beitragsrelevantes Jahreseinkommen eingeben.");
    if (!Number.isInteger(startYear) || startYear < 2000 || startYear > 2200) throw new Error("Bitte ein gültiges Startjahr eingeben.");
    if (!Array.isArray(input.children) || input.children.length === 0) throw new Error("Bitte mindestens ein Kind vollständig eintragen.");

    const children = normalizeChildren(input.children);
    children.forEach((child) => { child.careEndMonth = child.exitMonth + (input.includeOgs === false ? 0 : 48); });
    const startMonth = monthIndex(startYear, 8);
    const endMonth = Math.max(...children.map((child) => child.careEndMonth));
    if (startMonth > endMonth) throw new Error("Im gewählten Startjahr ist keines der Kinder mehr in Kita oder OGS.");

    const months = [];
    for (let month = startMonth; month <= endMonth; month += 1) {
      months.push(evaluateMonth(month, children, income));
    }

    const sections = [];
    months.forEach((monthResult) => {
      const key = stateKey(monthResult);
      const previous = sections[sections.length - 1];
      if (!previous || previous.key !== key) {
        sections.push({
          key,
          startMonth: monthResult.month,
          endMonth: monthResult.month,
          monthCount: 1,
          oldMonthly: monthResult.oldTotal,
          newMonthly: monthResult.newTotal,
          differenceMonthly: monthResult.difference,
          oldChildren: monthResult.oldChildren,
          newChildren: monthResult.newChildren,
        });
      } else {
        previous.endMonth = monthResult.month;
        previous.monthCount += 1;
      }
    });

    sections.forEach((section) => {
      section.oldTotal = section.oldMonthly * section.monthCount;
      section.newTotal = section.newMonthly * section.monthCount;
      section.differenceTotal = section.newTotal - section.oldTotal;
    });

    const oldTotal = sections.reduce((sum, section) => sum + section.oldTotal, 0);
    const newTotal = sections.reduce((sum, section) => sum + section.newTotal, 0);
    const careTotals = {};
    for (const [type, ogs] of [["kita", false], ["ogs", true]]) {
      const sum = (key) => sections.reduce((total, section) => total + section[key]
        .filter((child) => child.ogs === ogs)
        .reduce((subtotal, child) => subtotal + child.charged, 0) * section.monthCount, 0);
      const old = sum("oldChildren");
      const current = sum("newChildren");
      careTotals[type] = { oldTotal: old, newTotal: current, difference: current - old };
    }
    return {
      income,
      startYear,
      children,
      startMonth,
      endMonth,
      sections,
      oldTotal,
      newTotal,
      difference: newTotal - oldTotal,
      careTotals,
    };
  }

  return {
    OLD_BRACKETS,
    NEW_BRACKETS,
    parseDate,
    monthIndex,
    fromMonthIndex,
    ageInMonths,
    freeStartMonth,
    exitMonth,
    oldRate,
    newRate,
    calculate,
  };
});
