(function () {
  "use strict";

  document.documentElement.classList.add("js-ready");

  const form = document.getElementById("calculator-form");
  const incomeInput = document.getElementById("income");
  const startYearInput = document.getElementById("start-year");
  const errorBox = document.getElementById("form-error");
  const results = document.getElementById("results");
  const resultBody = document.getElementById("result-body");
  const compactResultBody = document.getElementById("compact-result-body");
  const copyTableButton = document.getElementById("copy-table-button");
  const copyStatus = document.getElementById("copy-status");
  const euro = new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" });
  const percent = new Intl.NumberFormat("de-DE", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  const monthLabel = new Intl.DateTimeFormat("de-DE", { month: "short", year: "numeric", timeZone: "UTC" });
  let lastCompactSections = [];
  let copyStatusTimer = null;

  startYearInput.value = new Date().getFullYear();

  function parseIncome(value) {
    let normalized = String(value).trim().replaceAll(" ", "").replaceAll("€", "").replaceAll("'", "");
    normalized = normalized.replace(/[^0-9.,-]/g, "");
    if (!normalized || normalized === "-") return NaN;

    const commaCount = normalized.split(",").length - 1;
    const dotCount = normalized.split(".").length - 1;
    let decimalSeparator = null;

    if (commaCount && dotCount) {
      decimalSeparator = normalized.lastIndexOf(",") > normalized.lastIndexOf(".") ? "," : ".";
    } else if (commaCount || dotCount) {
      const separator = commaCount ? "," : ".";
      const parts = normalized.split(separator);
      if (parts.length === 2) {
        decimalSeparator = parts[1].length === 3 ? null : separator;
      } else {
        const allThousands = parts.slice(1).every((part) => part.length === 3);
        decimalSeparator = allThousands ? null : separator;
      }
    }

    if (decimalSeparator) {
      const decimalPosition = normalized.lastIndexOf(decimalSeparator);
      const integerPart = normalized.slice(0, decimalPosition).replace(/[.,]/g, "");
      const decimalPart = normalized.slice(decimalPosition + 1).replace(/[.,]/g, "");
      normalized = integerPart + "." + decimalPart;
    } else {
      normalized = normalized.replace(/[.,]/g, "");
    }
    return Number(normalized);
  }

  function formatMonth(index) {
    const value = KitaCalculator.fromMonthIndex(index);
    return monthLabel.format(new Date(Date.UTC(value.year, value.month - 1, 1))).replace("Sept", "Sep");
  }

  function formatAge(totalMonths) {
    if (totalMonths < 0) return "noch nicht geboren";
    const years = Math.floor(totalMonths / 12);
    const months = totalMonths % 12;
    if (years === 0) return months + (months === 1 ? " Monat" : " Monate");
    if (months === 0) return years + (years === 1 ? " Jahr" : " Jahre");
    return years + " J. " + months + " Mon.";
  }

  function getChildren() {
    const children = [];
    for (let index = 1; index <= 4; index += 1) {
      const birth = form.elements["birth-" + index].value;
      const entryYearText = String(form.elements["entry-" + index].value).trim();
      if (!birth && !entryYearText) continue;
      if (!birth || !entryYearText) throw new Error("Bitte Geburtstag und Kita-Startjahr für Kind " + index + " vollständig eintragen.");
      const entryYear = Number(entryYearText);
      if (!Number.isInteger(entryYear) || entryYear < 2000 || entryYear > 2200) {
        throw new Error("Bitte für Kind " + index + " ein gültiges Kita-Startjahr eingeben.");
      }
      children.push({ id: index, name: "Kind " + index, birth, entry: entryYear + "-08-01" });
    }
    return children;
  }

  function statusFor(oldState, newState) {
    if (!oldState.active) return oldState.role;
    if (oldState.free) return "Beitragsfreie Jahre";
    return "Alt: " + oldState.category + " · Basis " + euro.format(oldState.base) + " · " + oldState.role + " = " + euro.format(oldState.charged) +
      " | Neu: " + newState.category + " · Basis " + euro.format(newState.base) + " · " + newState.role + " = " + euro.format(newState.charged);
  }

  function childCell(section) {
    return section.oldChildren.map((oldState, index) => {
      const newState = section.newChildren[index];
      const startAge = KitaCalculator.ageInMonths(oldState.birth, section.startMonth);
      const endAge = KitaCalculator.ageInMonths(oldState.birth, section.endMonth);
      const ageText = startAge === endAge ? formatAge(startAge) : formatAge(startAge) + " → " + formatAge(endAge);
      const inactiveClass = !oldState.active ? " muted" : "";
      return '<div class="child-status' + inactiveClass + '">' +
        '<strong>' + oldState.name + '</strong><span class="child-age">' + ageText + '</span>' +
        '<small>' + statusFor(oldState, newState) + '</small>' +
        '</div>';
    }).join("");
  }

  function differenceClass(value) {
    if (value < 0) return "saves";
    if (value > 0) return "costs";
    return "neutral";
  }

  function compactContributionSections(sections) {
    return sections.reduce((compacted, section) => {
      const previous = compacted[compacted.length - 1];
      const sameContribution = previous &&
        previous.endMonth + 1 === section.startMonth &&
        previous.oldMonthly === section.oldMonthly &&
        previous.newMonthly === section.newMonthly;

      if (sameContribution) {
        previous.endMonth = section.endMonth;
        previous.monthCount += section.monthCount;
        previous.oldTotal += section.oldTotal;
        previous.newTotal += section.newTotal;
        previous.differenceTotal += section.differenceTotal;
      } else {
        compacted.push({
          startMonth: section.startMonth,
          endMonth: section.endMonth,
          monthCount: section.monthCount,
          oldMonthly: section.oldMonthly,
          newMonthly: section.newMonthly,
          differenceMonthly: section.differenceMonthly,
          oldTotal: section.oldTotal,
          newTotal: section.newTotal,
          differenceTotal: section.differenceTotal,
        });
      }
      return compacted;
    }, []);
  }

  function compactTableText(sections) {
    const rows = [[
      "Zeitraum", "Monate", "Alt / Monat", "Neu / Monat", "Differenz / Monat",
      "Alt gesamt", "Neu gesamt", "Differenz gesamt",
    ]];
    sections.forEach((section) => {
      rows.push([
        formatMonth(section.startMonth) + " bis " + formatMonth(section.endMonth),
        String(section.monthCount),
        euro.format(section.oldMonthly),
        euro.format(section.newMonthly),
        euro.format(section.differenceMonthly),
        euro.format(section.oldTotal),
        euro.format(section.newTotal),
        euro.format(section.differenceTotal),
      ]);
    });
    return rows.map((row) => row.join("\t")).join("\n");
  }

  function showCopyStatus(message) {
    copyStatus.textContent = message;
    if (copyStatusTimer) clearTimeout(copyStatusTimer);
    copyStatusTimer = setTimeout(function () { copyStatus.textContent = ""; }, 2500);
  }

  function fallbackCopy(text) {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();
    const copied = document.execCommand("copy");
    document.body.removeChild(textarea);
    if (!copied) throw new Error("Kopieren nicht möglich");
  }

  function copyCompactTable() {
    if (!lastCompactSections.length) return;
    const text = compactTableText(lastCompactSections);
    if (typeof navigator !== "undefined" && navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text)
        .then(function () { showCopyStatus("Tabelle kopiert"); })
        .catch(function () {
          try {
            fallbackCopy(text);
            showCopyStatus("Tabelle kopiert");
          } catch (error) {
            showCopyStatus("Kopieren nicht möglich");
          }
        });
    } else {
      try {
        fallbackCopy(text);
        showCopyStatus("Tabelle kopiert");
      } catch (error) {
        showCopyStatus("Kopieren nicht möglich");
      }
    }
  }

  window.KitaApp = { parseIncome, compactContributionSections, compactTableText };

  function render(result) {
    const compactSections = compactContributionSections(result.sections);
    lastCompactSections = compactSections;
    document.getElementById("old-total").textContent = euro.format(result.oldTotal);
    document.getElementById("new-total").textContent = euro.format(result.newTotal);
    const differenceCard = document.getElementById("difference-card");
    differenceCard.classList.remove("saves", "costs", "neutral");
    differenceCard.classList.add(differenceClass(result.difference));

    const differenceTotal = document.getElementById("difference-total");
    const differenceLabel = document.getElementById("difference-label");
    const differenceCaption = document.getElementById("difference-caption");
    differenceTotal.textContent = euro.format(Math.abs(result.difference));
    if (result.difference < 0) {
      differenceLabel.textContent = "Ersparnis";
      differenceCaption.textContent = "durch die neue Satzung";
    } else if (result.difference > 0) {
      differenceLabel.textContent = "Mehrkosten";
      differenceCaption.textContent = "durch die neue Satzung";
    } else {
      differenceLabel.textContent = "Keine Differenz";
      differenceCaption.textContent = "beide Satzungen sind gleich";
    }

    const percentageCard = document.getElementById("percentage-card");
    const percentageTotal = document.getElementById("percentage-total");
    const percentageLabel = document.getElementById("percentage-label");
    const percentageCaption = document.getElementById("percentage-caption");
    percentageCard.classList.remove("saves", "costs", "neutral");
    percentageCard.classList.add(differenceClass(result.difference));
    if (result.oldTotal > 0) {
      const percentageDifference = result.difference / result.oldTotal * 100;
      percentageTotal.textContent = percent.format(Math.abs(percentageDifference)) + " %";
      percentageLabel.textContent = percentageDifference > 0 ? "Mehrkosten in %" : percentageDifference < 0 ? "Ersparnis in %" : "Veränderung in %";
      percentageCaption.textContent = "bezogen auf die alte Satzung";
    } else if (result.newTotal === 0) {
      percentageTotal.textContent = "0,0 %";
      percentageLabel.textContent = "Veränderung in %";
      percentageCaption.textContent = "beide Satzungen ergeben 0 €";
    } else {
      percentageTotal.textContent = "nicht berechenbar";
      percentageLabel.textContent = "Mehrkosten in %";
      percentageCaption.textContent = "kein Prozentwert bei 0 € Ausgangskosten";
    }

    document.getElementById("result-description").textContent =
      "Erkanntes Jahreseinkommen: " + euro.format(result.income) + " · " +
      compactSections.length + (compactSections.length === 1 ? " Beitragsabschnitt" : " Beitragsabschnitte") +
      " von " + formatMonth(result.startMonth) + " bis " + formatMonth(result.endMonth);

    resultBody.innerHTML = result.sections.map((section) => {
      const differenceMonthly = section.differenceMonthly;
      const differenceTotalValue = section.differenceTotal;
      return '<tr class="amount-row">' +
        '<td class="period"><strong>' + formatMonth(section.startMonth) + " bis " + formatMonth(section.endMonth) + "</strong></td>" +
        '<td class="number">' + section.monthCount + "</td>" +
        '<td class="number amount"><strong>' + euro.format(section.oldMonthly) + "</strong></td>" +
        '<td class="number amount"><strong>' + euro.format(section.newMonthly) + "</strong></td>" +
        '<td class="number amount delta ' + differenceClass(differenceMonthly) + '"><strong>' + euro.format(differenceMonthly) + "</strong></td>" +
        '<td class="number amount total-cell"><strong>' + euro.format(section.oldTotal) + "</strong></td>" +
        '<td class="number amount total-cell"><strong>' + euro.format(section.newTotal) + "</strong></td>" +
        '<td class="number amount delta total-cell ' + differenceClass(differenceTotalValue) + '"><strong>' + euro.format(differenceTotalValue) + "</strong></td>" +
        "</tr>" +
        '<tr class="details-row"><td colspan="8"><div class="details-label">Kinder und Alter</div><div class="children-detail-grid">' + childCell(section) + "</div></td></tr>";
    }).join("");

    compactResultBody.innerHTML = compactSections.map((section) => {
      return '<tr class="amount-row">' +
        '<td class="period"><strong>' + formatMonth(section.startMonth) + " bis " + formatMonth(section.endMonth) + "</strong></td>" +
        '<td class="number">' + section.monthCount + "</td>" +
        '<td class="number amount"><strong>' + euro.format(section.oldMonthly) + "</strong></td>" +
        '<td class="number amount"><strong>' + euro.format(section.newMonthly) + "</strong></td>" +
        '<td class="number amount delta ' + differenceClass(section.differenceMonthly) + '"><strong>' + euro.format(section.differenceMonthly) + "</strong></td>" +
        '<td class="number amount total-cell"><strong>' + euro.format(section.oldTotal) + "</strong></td>" +
        '<td class="number amount total-cell"><strong>' + euro.format(section.newTotal) + "</strong></td>" +
        '<td class="number amount delta total-cell ' + differenceClass(section.differenceTotal) + '"><strong>' + euro.format(section.differenceTotal) + "</strong></td>" +
        "</tr>";
    }).join("");

    results.hidden = false;
    results.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    errorBox.hidden = true;
    try {
      const result = KitaCalculator.calculate({
        income: parseIncome(incomeInput.value),
        startYear: Number(startYearInput.value),
        children: getChildren(),
      });
      render(result);
    } catch (error) {
      results.hidden = true;
      errorBox.textContent = error.message;
      errorBox.hidden = false;
      errorBox.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  });

  window.addEventListener("error", function () {
    errorBox.textContent = "Die Anwendung konnte nicht vollständig geladen werden. Bitte die Datei Kita-Beitragsrechner.html direkt in Safari, Chrome, Edge oder Firefox öffnen.";
    errorBox.hidden = false;
  });

  const referenceExamples = {
    1: {
      income: "36.500",
      startYear: "2026",
      children: [
        ["2025-08-05", "2026"],
        ["2025-08-05", "2026"],
      ],
    },
    2: {
      income: "130.000",
      startYear: "2026",
      children: [
        ["2025-06-05", "2026"],
        ["2025-06-05", "2026"],
        ["2024-01-06", "2026"],
      ],
    },
    3: {
      income: "90.000",
      startYear: "2026",
      children: [
        ["2024-12-15", "2026"],
        ["2023-03-20", "2026"],
      ],
    },
  };

  function applyReferenceExample(exampleNumber) {
    const example = referenceExamples[exampleNumber];
    incomeInput.value = example.income;
    startYearInput.value = example.startYear;
    for (let index = 1; index <= 4; index += 1) {
      const child = example.children[index - 1] || ["", ""];
      form.elements["birth-" + index].value = child[0];
      form.elements["entry-" + index].value = child[1];
    }
    document.getElementById("example-menu").open = false;
    form.requestSubmit();
  }

  for (let exampleNumber = 1; exampleNumber <= 3; exampleNumber += 1) {
    document.getElementById("example-" + exampleNumber).addEventListener("click", function () {
      applyReferenceExample(exampleNumber);
    });
  }

  for (let index = 1; index <= 4; index += 1) {
    document.getElementById("clear-child-" + index).addEventListener("click", function () {
      form.elements["birth-" + index].value = "";
      form.elements["entry-" + index].value = "";
      if (typeof form.elements["birth-" + index].focus === "function") {
        form.elements["birth-" + index].focus();
      }
    });
  }

  copyTableButton.addEventListener("click", copyCompactTable);

  document.getElementById("print-button").addEventListener("click", function () {
    window.print();
  });
})();
