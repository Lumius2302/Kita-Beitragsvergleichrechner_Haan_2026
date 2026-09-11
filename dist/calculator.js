(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (root) root.KitaCalculator = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  "use strict";

  const OLD_BRACKETS = [
    { min: 0, maxExclusive: 33000, young: 0, older: 0 },
    { min: 33000, maxExclusive: 37000, young: 106, older: 61 },
    { min: 37000, maxExclusive: 50000, young: 178, older: 102 },
    { min: 50000, maxExclusive: 62000, young: 266, older: 152 },
    { min: 62000, maxExclusive: 75000, young: 370, older: 212 },
    { min: 75000, maxExclusive: 87000, young: 491, older: 281 },
    { min: 87000, maxExclusive: 100000, young: 629, older: 359 },
    { min: 100000, maxExclusive: Infinity, young: 725, older: 415 },
  ];

  const NEW_BRACKETS = [
    { maxInclusive: 36000, young: 0, older: 0 },
    { maxInclusive: 43000, young: 122, older: 82 },
    { maxInclusive: 50000, young: 153, older: 102 },
    { maxInclusive: 56000, young: 190, older: 127 },
    { maxInclusive: 62000, young: 228, older: 152 },
    { maxInclusive: 75000, young: 317, older: 212 },
    { maxInclusive: 87000, young: 421, older: 281 },
    { maxInclusive: 100000, young: 550, older: 366 },
    { maxInclusive: 112000, young: 634, older: 423 },
    { maxInclusive: 125000, young: 659, older: 440 },
    { maxInclusive: 150000, young: 686, older: 458 },
    { maxInclusive: 175000, young: 713, older: 476 },
    { maxInclusive: Infinity, young: 742, older: 495 },
  ];

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

  function oldRate(income, category) {
    const bracket = OLD_BRACKETS.find((item) => income >= item.min && income < item.maxExclusive);
    return category === "U2" ? bracket.young : bracket.older;
  }

  function newRate(income, category) {
    const bracket = NEW_BRACKETS.find((item) => income <= item.maxInclusive);
    return category === "U3" ? bracket.young : bracket.older;
  }

  function childBaseState(child, month, income, statute) {
    const entered = month >= child.entryMonth;
    const left = month > child.exitMonth;
    const active = entered && !left;
    const free = active && month >= child.freeStartMonth;
    const ageMonths = ageInMonths(child.birth, month);
    let category = null;
    let base = 0;

    if (active && !free) {
      if (statute === "old") {
        category = ageMonths <= 24 ? "U2" : "Ü2";
        base = oldRate(income, category);
      } else {
        category = ageMonths <= 36 ? "U3" : "Ü3";
        base = newRate(income, category);
      }
    }

    return {
      id: child.id,
      name: child.name,
      birth: child.birth,
      ageMonths,
      active,
      entered,
      left,
      free,
      category,
      base,
      charged: 0,
      role: active ? (free ? "Beitragsfreie Jahre" : "") : (left ? "Kita beendet" : "Noch nicht gestartet"),
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
    const oldChildren = applyOldSiblingRule(children.map((child) => childBaseState(child, month, income, "old")));
    const newChildren = applyNewSiblingRule(children.map((child) => childBaseState(child, month, income, "new")));
    const oldTotal = oldChildren.reduce((sum, child) => sum + child.charged, 0);
    const newTotal = newChildren.reduce((sum, child) => sum + child.charged, 0);
    return { month, oldTotal, newTotal, difference: newTotal - oldTotal, oldChildren, newChildren };
  }

  function stateKey(monthResult) {
    const childKey = (children) => children.map((child) => [
      child.active,
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
      const normalized = {
        id: child.id || index + 1,
        name: child.name || "Kind " + (index + 1),
        birth,
        entry,
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
    const income = Number(input.income);
    const startYear = Number(input.startYear);
    if (!Number.isFinite(income) || income < 0) throw new Error("Bitte ein gültiges, nicht negatives Einkommen eingeben.");
    if (!Number.isInteger(startYear) || startYear < 2000 || startYear > 2200) throw new Error("Bitte ein gültiges Startjahr eingeben.");
    if (!Array.isArray(input.children) || input.children.length === 0) throw new Error("Bitte mindestens ein Kind vollständig eintragen.");

    const children = normalizeChildren(input.children);
    const startMonth = monthIndex(startYear, 8);
    const endMonth = Math.max(...children.map((child) => child.exitMonth));
    if (startMonth > endMonth) throw new Error("Im gewählten Startjahr ist keines der Kinder mehr in der Kita.");

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
