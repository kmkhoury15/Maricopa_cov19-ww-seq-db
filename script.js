/*
  AZ State Wastewater Sequencing Dashboard
  Browser-only rewrite of the original Dash/Python Plotly app.

  Required source columns from the Python script:
    specimen_id, nextclade_lineage, pango_lineage, lineages, abundances,
    sample_collect_date, pcr_target_avg_conc_log,
    sample_location_specify, wwtp_name, freyja_coverage
*/

const APP_BUILD = "20260702-freyja-side-legend-tabs-v7";

const REQUIRED_COLUMNS = [
  "specimen_id",
  "nextclade_lineage",
  "pango_lineage",
  "lineages",
  "abundances",
  "sample_collect_date",
  "pcr_target_avg_conc_log",
  "sample_location_specify",
  "wwtp_name",
  "freyja_coverage"
];

const COLUMN_ALIASES = {
  specimen_id: ["specimen_id", "specimen", "sample_id", "sampleid", "lab_id"],
  nextclade_lineage: ["nextclade_lineage", "nextclade", "nextclade_clade", "clade"],
  pango_lineage: ["pango_lineage", "pango", "lineage_pango", "pangolin_lineage"],
  lineages: ["lineages", "freyja_lineages", "freyja_lineage", "lineage_list"],
  abundances: ["abundances", "freyja_abundances", "freyja_abundance", "abundance_list"],
  sample_collect_date: ["sample_collect_date", "collection_date", "date", "sample_date", "collect_date"],
  pcr_target_avg_conc_log: ["pcr_target_avg_conc_log", "pcr_target_avg_conc_log10", "pcr_log_conc", "pcr_target_log", "pcr_target_avg_conc_log_10"],
  sample_location_specify: ["sample_location_specify", "sample_location", "location", "sample_location_name"],
  wwtp_name: ["wwtp_name", "wwtp", "site", "treatment_plant", "wwtpname"],
  freyja_coverage: ["freyja_coverage", "coverage", "freyja_cov", "percent_reference_coverage"]
};

const SAMPLE_DATA = `specimen_id\tnextclade_lineage\tpango_lineage\tlineages\tabundances\tsample_collect_date\tpcr_target_avg_conc_log\tsample_location_specify\twwtp_name\tfreyja_coverage
SP-001\t23A\tXBB.1.5\t['XBB.1.5','BQ.1']\t[0.82,0.18]\t2025-01-06\t5.42\tInfluent\tArea 1 WRF\t120.5
SP-002\t23A\tXBB.1.5\t['XBB.1.5','JN.1']\t[0.64,0.36]\t2025-01-13\t5.61\tInfluent\tArea 1 WRF\t98.3
SP-003\t23I\tJN.1\t['JN.1','XBB.1.5']\t[0.71,0.29]\t2025-01-20\t5.86\tInfluent\tArea 1 WRF\t133.7
SP-004\t23I\tJN.1\t['JN.1','KP.2']\t[0.59,0.41]\t2025-01-27\t5.74\tInfluent\tArea 1 WRF\t141.2
SP-005\t24A\tKP.2\t['KP.2','JN.1']\t[0.68,0.32]\t2025-02-03\t5.91\tInfluent\tArea 1 WRF\t115.9
SP-006\t23A\tXBB.1.5\t['XBB.1.5','JN.1']\t[0.54,0.46]\t2025-01-06\t4.92\tInfluent\tArea 2 WRF\t89.4
SP-007\t23I\tJN.1\t['JN.1','XBB.1.5']\t[0.73,0.27]\t2025-01-13\t5.04\tInfluent\tArea 2 WRF\t91.7
SP-008\t23I\tJN.1\t['JN.1','KP.2']\t[0.61,0.39]\t2025-01-20\t5.33\tInfluent\tArea 2 WRF\t100.0
SP-009\t24A\tKP.2\t['KP.2','JN.1']\t[0.77,0.23]\t2025-01-27\t5.38\tInfluent\tArea 2 WRF\t126.8
SP-010\t24A\tKP.2\t['KP.2','LB.1']\t[0.66,0.34]\t2025-02-03\t5.52\tInfluent\tArea 2 WRF\t130.1
SP-011\t23I\tJN.1\t['JN.1','KP.2']\t[0.58,0.42]\t2025-01-13\t4.88\tSecondary\tArea 3 WRF\t77.8
SP-012\t24A\tKP.2\t['KP.2','JN.1']\t[0.62,0.38]\t2025-01-20\t5.12\tSecondary\tArea 3 WRF\t84.9
SP-013\t24A\tKP.2\t['KP.2','LB.1']\t[0.72,0.28]\t2025-01-27\t5.28\tSecondary\tArea 3 WRF\t90.4
SP-014\t24B\tLB.1\t['LB.1','KP.2']\t[0.57,0.43]\t2025-02-03\t5.47\tSecondary\tArea 3 WRF\t93.2`;

const PALETTE = [
  "#2E91E5", "#E15F99", "#1CA71C", "#FB0D0D", "#DA16FF", "#222A2A",
  "#B68100", "#750D86", "#EB663B", "#511CFB", "#00A08B", "#FB00D1",
  "#FC0080", "#B2828D", "#6C7C32", "#778AAE", "#862A16", "#A777F1",
  "#620042", "#1616A7", "#DA60CA", "#6C4516", "#0D2A63", "#AF0038",
  "#8dd3c7", "#ffffb3", "#bebada", "#fb8072", "#80b1d3", "#fdb462",
  "#b3de69", "#fccde5", "#d9d9d9", "#bc80bd", "#ccebc5", "#ffed6f",
  "#636EFA", "#EF553B", "#00CC96", "#AB63FA", "#FFA15A", "#19D3F3",
  "#FF6692", "#B6E880", "#FF97FF", "#FECB52"
];

const state = {
  rawRows: [],
  rows: [],
  variants: [],
  colorMap: {},
  selectedVariants: new Set(),
  selectedSites: new Set(),
  selectedLocations: new Set(),
  activeWorkspaceTab: "filters",
  activeChartTab: "nextclade",
  activeFileName: null,
  warnings: []
};

const els = {};

const plotConfig = {
  responsive: true,
  displaylogo: false,
  modeBarButtonsToRemove: ["lasso2d", "select2d"]
};

document.addEventListener("DOMContentLoaded", init);

function init() {
  cacheElements();

  if (!window.Plotly || !window.Papa || !window.XLSX) {
    showMessage(
      "One or more browser dependencies did not load. Check your internet connection or vendor Plotly.js, PapaParse, and SheetJS locally.",
      "error"
    );
  }

  els.dropZone.addEventListener("click", () => els.fileInput.click());
  els.dropZone.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      els.fileInput.click();
    }
  });
  els.fileInput.addEventListener("change", (event) => {
    const file = event.target.files && event.target.files[0];
    if (file) handleFile(file);
  });

  ["dragenter", "dragover"].forEach((eventName) => {
    els.dropZone.addEventListener(eventName, (event) => {
      event.preventDefault();
      els.dropZone.classList.add("is-dragover");
    });
  });

  ["dragleave", "drop"].forEach((eventName) => {
    els.dropZone.addEventListener(eventName, (event) => {
      event.preventDefault();
      els.dropZone.classList.remove("is-dragover");
    });
  });

  els.dropZone.addEventListener("drop", (event) => {
    const file = event.dataTransfer.files && event.dataTransfer.files[0];
    if (file) handleFile(file);
  });

  els.loadSampleBtn.addEventListener("click", loadSampleData);
  els.startDate.addEventListener("change", renderDashboard);
  els.endDate.addEventListener("change", renderDashboard);
  els.dimToggle.addEventListener("change", renderDashboard);
  els.resetFiltersBtn.addEventListener("click", resetFilters);
  els.clearHighlightBtn.addEventListener("click", () => {
    state.selectedVariants.clear();
    refreshVariantOptionList(getFilteredRows());
    renderDashboard();
  });

  els.openChartsBtn.addEventListener("click", () => switchWorkspaceTab("charts"));
  els.backToFiltersBtn.addEventListener("click", () => switchWorkspaceTab("filters"));

  setupWorkspaceTabs();
  setupChartTabs();
  setupDropdowns();

  els.selectAllSitesBtn.addEventListener("click", () => {
    uniqueSorted(state.rows.map((row) => row.wwtp_name).filter(Boolean)).forEach((site) => state.selectedSites.add(site));
    refreshSiteOptionList();
    refreshLocationOptions();
    renderDashboard();
  });

  els.clearSitesBtn.addEventListener("click", () => {
    state.selectedSites.clear();
    state.selectedLocations.clear();
    refreshSiteOptionList();
    refreshLocationOptions();
    renderDashboard();
  });

  els.selectAllLocationsBtn.addEventListener("click", () => {
    availableLocations().forEach((loc) => state.selectedLocations.add(loc));
    refreshLocationOptionList();
    renderDashboard();
  });

  els.clearLocationsBtn.addEventListener("click", () => {
    state.selectedLocations.clear();
    refreshLocationOptionList();
    renderDashboard();
  });

  els.selectAllVariantsBtn.addEventListener("click", () => {
    availableVariants(getFilteredRows()).forEach((variant) => state.selectedVariants.add(variant));
    refreshVariantOptionList(getFilteredRows());
    renderDashboard();
  });

  els.clearVariantsBtn.addEventListener("click", () => {
    state.selectedVariants.clear();
    refreshVariantOptionList(getFilteredRows());
    renderDashboard();
  });
}

function cacheElements() {
  [
    "drop-zone", "file-input", "file-status", "message-box", "workspace-panel", "controls-panel", "summary-panel",
    "plots-panel", "start-date", "end-date", "dim-toggle", "select-all-sites-btn", "clear-sites-btn",
    "select-all-locations-btn", "clear-locations-btn", "select-all-variants-btn", "clear-variants-btn",
    "reset-filters-btn", "clear-highlight-btn", "load-sample-btn", "summary-cards", "open-charts-btn",
    "back-to-filters-btn", "site-dropdown", "site-dropdown-trigger", "site-dropdown-label", "site-option-list",
    "location-dropdown", "location-dropdown-trigger", "location-dropdown-label", "location-option-list",
    "variant-dropdown", "variant-dropdown-trigger", "variant-dropdown-label", "variant-option-list"
  ].forEach((id) => {
    els[toCamel(id)] = document.getElementById(id);
  });
}

function toCamel(id) {
  return id.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
}

function setupWorkspaceTabs() {
  document.querySelectorAll("[data-workspace-tab]").forEach((button) => {
    button.addEventListener("click", () => switchWorkspaceTab(button.dataset.workspaceTab));
  });
}

function switchWorkspaceTab(tab) {
  state.activeWorkspaceTab = tab;
  document.querySelectorAll("[data-workspace-tab]").forEach((button) => {
    const active = button.dataset.workspaceTab === tab;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-selected", String(active));
  });
  document.getElementById("filters-tab").classList.toggle("is-active", tab === "filters");
  document.getElementById("charts-tab").classList.toggle("is-active", tab === "charts");
  if (tab === "charts") setTimeout(renderDashboard, 0);
}

function setupChartTabs() {
  document.querySelectorAll("[data-chart-tab]").forEach((button) => {
    button.addEventListener("click", () => {
      state.activeChartTab = button.dataset.chartTab;
      document.querySelectorAll("[data-chart-tab]").forEach((tabButton) => {
        const active = tabButton.dataset.chartTab === state.activeChartTab;
        tabButton.classList.toggle("is-active", active);
        tabButton.setAttribute("aria-selected", String(active));
      });
      renderDashboard();
    });
  });
}

function setupDropdowns() {
  [
    [els.siteDropdown, els.siteDropdownTrigger],
    [els.locationDropdown, els.locationDropdownTrigger],
    [els.variantDropdown, els.variantDropdownTrigger]
  ].forEach(([dropdown, trigger]) => {
    trigger.addEventListener("click", (event) => {
      event.stopPropagation();
      if (trigger.disabled) return;
      const willOpen = !dropdown.classList.contains("is-open");
      closeAllDropdowns();
      dropdown.classList.toggle("is-open", willOpen);
      trigger.setAttribute("aria-expanded", String(willOpen));
    });
  });

  document.addEventListener("click", (event) => {
    if (!event.target.closest(".multi-dropdown")) closeAllDropdowns();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeAllDropdowns();
  });
}

function closeAllDropdowns() {
  [els.siteDropdown, els.locationDropdown, els.variantDropdown].forEach((dropdown) => dropdown.classList.remove("is-open"));
  [els.siteDropdownTrigger, els.locationDropdownTrigger, els.variantDropdownTrigger].forEach((trigger) => {
    trigger.setAttribute("aria-expanded", "false");
  });
}

async function handleFile(file) {
  clearMessage();
  state.activeFileName = file.name;

  try {
    const rows = await parseUploadedFile(file);
    loadRows(rows, file.name);
  } catch (error) {
    console.error(error);
    showMessage(error.message || "Unable to parse this file.", "error");
  }
}

function loadSampleData() {
  Papa.parse(SAMPLE_DATA, {
    header: true,
    delimiter: "\t",
    skipEmptyLines: "greedy",
    complete: (results) => loadRows(results.data, "sample_data.tsv"),
    error: (error) => showMessage(error.message, "error")
  });
}

function parseUploadedFile(file) {
  const extension = file.name.split(".").pop().toLowerCase();

  if (["xlsx", "xls"].includes(extension)) return parseExcelFile(file);
  if (["csv", "tsv", "txt"].includes(extension)) return parseDelimitedFile(file, extension);

  throw new Error("Unsupported file type. Please upload a CSV, TSV, TXT, XLSX, or XLS file.");
}

function parseDelimitedFile(file, extension) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const text = decodeArrayBuffer(reader.result);
        const delimiter = extension === "tsv" ? "\t" : extension === "csv" ? "," : "";
        Papa.parse(text, {
          header: true,
          skipEmptyLines: "greedy",
          dynamicTyping: false,
          delimiter,
          transformHeader: (header) => cleanHeader(header),
          complete: (results) => {
            const fatalError = (results.errors || []).find((err) => err.type === "Delimiter" || err.type === "Quotes");
            if (fatalError) {
              reject(new Error(`CSV/TSV parsing error: ${fatalError.message}`));
              return;
            }
            resolve(results.data || []);
          },
          error: (error) => reject(error)
        });
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = () => reject(new Error("Unable to read this delimited file."));
    reader.readAsArrayBuffer(file);
  });
}

function decodeArrayBuffer(buffer) {
  const bytes = new Uint8Array(buffer);
  if (bytes.length >= 2 && bytes[0] === 0xff && bytes[1] === 0xfe) return new TextDecoder("utf-16le").decode(bytes);
  if (bytes.length >= 2 && bytes[0] === 0xfe && bytes[1] === 0xff) return new TextDecoder("utf-16be").decode(bytes);
  if (bytes.length >= 3 && bytes[0] === 0xef && bytes[1] === 0xbb && bytes[2] === 0xbf) return new TextDecoder("utf-8").decode(bytes);

  const sampleLength = Math.min(bytes.length, 2000);
  let oddNulls = 0;
  let evenNulls = 0;
  for (let i = 0; i < sampleLength; i += 1) {
    if (bytes[i] === 0) {
      if (i % 2) oddNulls += 1;
      else evenNulls += 1;
    }
  }
  if (oddNulls > sampleLength * 0.15) return new TextDecoder("utf-16le").decode(bytes);
  if (evenNulls > sampleLength * 0.15) return new TextDecoder("utf-16be").decode(bytes);
  return new TextDecoder("utf-8").decode(bytes);
}

function parseExcelFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const workbook = XLSX.read(event.target.result, { type: "array", cellDates: true });
        const firstSheetName = workbook.SheetNames[0];
        if (!firstSheetName) throw new Error("The workbook does not contain any sheets.");
        const worksheet = workbook.Sheets[firstSheetName];
        const rows = XLSX.utils.sheet_to_json(worksheet, { defval: "", raw: false });
        resolve(rows);
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = () => reject(new Error("Unable to read the Excel file."));
    reader.readAsArrayBuffer(file);
  });
}

function loadRows(rawRows, fileName) {
  if (!rawRows || !rawRows.length) throw new Error("The uploaded file did not contain any data rows.");

  const { rows, warnings, detectedColumns } = canonicalizeRows(rawRows);
  const preparedRows = prepareRows(rows);
  const invalidDateCount = rows.length - preparedRows.length;

  if (!preparedRows.length) throw new Error("No usable rows were found after date parsing. Check sample_collect_date values.");

  state.rawRows = rawRows;
  state.rows = preparedRows;
  state.activeFileName = fileName;
  state.warnings = [...warnings];
  if (invalidDateCount > 0) state.warnings.push(`${invalidDateCount} row(s) were skipped because sample_collect_date could not be parsed.`);

  state.variants = collectVariants(preparedRows);
  state.colorMap = buildColorMap(state.variants);
  state.selectedVariants = new Set();
  state.selectedLocations = new Set();

  const sites = uniqueSorted(preparedRows.map((row) => row.wwtp_name).filter(Boolean));
  state.selectedSites = new Set(sites.slice(0, 1));

  hydrateControls();
  setPanelsEnabled(true);
  els.fileStatus.textContent = `Loaded ${preparedRows.length.toLocaleString()} rows from ${fileName}`;
  els.fileStatus.classList.add("success");

  if (state.warnings.length) showMessage(`Loaded with warning(s):\n- ${state.warnings.join("\n- ")}`, "warning");
  else showMessage(`File loaded successfully. Parser build: ${APP_BUILD}. Detected ${detectedColumns.length} column(s).`, "info");

  renderDashboard();
}

function canonicalizeRows(rawRows) {
  const sourceColumns = Object.keys(rawRows[0] || {});
  const normalizedSourceMap = new Map();

  sourceColumns.forEach((col) => normalizedSourceMap.set(normalizeColumnName(col), col));

  const resolved = {};
  const aliasWarnings = [];
  const missing = [];

  REQUIRED_COLUMNS.forEach((target) => {
    const aliases = COLUMN_ALIASES[target] || [target];
    const foundAlias = aliases.find((alias) => normalizedSourceMap.has(normalizeColumnName(alias)));
    if (!foundAlias) {
      missing.push(target);
      return;
    }
    const sourceName = normalizedSourceMap.get(normalizeColumnName(foundAlias));
    resolved[target] = sourceName;
    if (normalizeColumnName(sourceName) !== normalizeColumnName(target)) {
      aliasWarnings.push(`Mapped input column "${sourceName}" to expected column "${target}".`);
    }
  });

  if (missing.length) {
    throw new Error(
      `Missing required column(s): ${missing.join(", ")}.\n\n` +
      `Parser build: ${APP_BUILD}\n` +
      `Detected columns: ${sourceColumns.map((c) => `"${c}"`).join(", ")}\n\n` +
      `Expected columns: ${REQUIRED_COLUMNS.join(", ")}.`
    );
  }

  const rows = rawRows.map((row) => {
    const clean = {};
    REQUIRED_COLUMNS.forEach((target) => { clean[target] = row[resolved[target]]; });
    return clean;
  });

  return { rows, warnings: aliasWarnings, detectedColumns: sourceColumns };
}

function cleanHeader(name) {
  return String(name || "").replace(/^\uFEFF/, "").replace(/\u0000/g, "").trim().replace(/^['"]|['"]$/g, "");
}

function normalizeColumnName(name) {
  return cleanHeader(name).toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
}

function prepareRows(rows) {
  return rows.map((row, idx) => {
    const date = parseDate(row.sample_collect_date);
    if (!date) return null;

    const lineages = parseListLike(row.lineages).map((value) => String(value).trim()).filter(Boolean);
    const abundances = parseListLike(row.abundances).map(parseNumber).filter((value) => Number.isFinite(value));
    const pcrValue = parseNumber(row.pcr_target_avg_conc_log);
    const coverage = parseNumber(row.freyja_coverage);

    return {
      ...row,
      __rowIndex: idx,
      specimen_id: safeString(row.specimen_id),
      nextclade_lineage: safeString(row.nextclade_lineage),
      pango_lineage: safeString(row.pango_lineage),
      sample_location_specify: safeString(row.sample_location_specify),
      wwtp_name: safeString(row.wwtp_name),
      lineages,
      abundances,
      pcr_target_avg_conc_log: pcrValue,
      freyja_coverage: coverage,
      __date: date,
      __dateISO: formatISODate(date),
      __week: weekStartMonday(date),
      __weekISO: formatISODate(weekStartMonday(date))
    };
  }).filter(Boolean);
}

function safeString(value) {
  if (value === null || value === undefined) return "";
  return String(value).trim();
}

function parseNumber(value) {
  if (value === null || value === undefined || value === "") return NaN;
  if (typeof value === "number") return value;
  const cleaned = String(value).replace(/,/g, "").trim();
  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : NaN;
}

function parseDate(value) {
  if (value instanceof Date && !Number.isNaN(value.getTime())) return new Date(Date.UTC(value.getFullYear(), value.getMonth(), value.getDate()));

  const text = safeString(value);
  if (!text) return null;

  const isoLike = text.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (isoLike) {
    const [, year, month, day] = isoLike.map(Number);
    return new Date(Date.UTC(year, month - 1, day));
  }

  const slashLike = text.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/);
  if (slashLike) {
    let [, month, day, year] = slashLike.map(Number);
    if (year < 100) year += 2000;
    return new Date(Date.UTC(year, month - 1, day));
  }

  const parsed = new Date(text);
  if (Number.isNaN(parsed.getTime())) return null;
  return new Date(Date.UTC(parsed.getFullYear(), parsed.getMonth(), parsed.getDate()));
}

function formatISODate(date) {
  return date.toISOString().slice(0, 10);
}

function weekStartMonday(date) {
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const day = d.getUTCDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setUTCDate(d.getUTCDate() + diff);
  return d;
}

function parseListLike(value) {
  if (Array.isArray(value)) return value;
  if (value === null || value === undefined) return [];

  const text = String(value).trim();
  if (!text || ["nan", "none", "null"].includes(text.toLowerCase())) return [];

  try { return JSON.parse(text); }
  catch (_) {
    try {
      const jsonish = text.replace(/\bNone\b/g, "null").replace(/\bnan\b/gi, "null").replace(/'/g, '"');
      return JSON.parse(jsonish);
    } catch (__) {
      return text.replace(/^\[/, "").replace(/\]$/, "").split(/[;,]/).map((part) => part.trim().replace(/^['"]|['"]$/g, "")).filter(Boolean);
    }
  }
}

function collectVariants(rows) {
  const variants = new Set();
  rows.forEach((row) => {
    if (row.nextclade_lineage) variants.add(row.nextclade_lineage);
    if (row.pango_lineage) variants.add(row.pango_lineage);
    row.lineages.forEach((lineage) => { if (lineage) variants.add(lineage); });
  });
  return [...variants].sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
}

function buildColorMap(variants) {
  const map = {};
  variants.forEach((variant) => {
    const index = stableHash(variant) % PALETTE.length;
    map[variant] = PALETTE[index];
  });
  return map;
}

function stableHash(text) {
  let hash = 0;
  for (let i = 0; i < text.length; i += 1) hash = ((hash << 5) - hash + text.charCodeAt(i)) | 0;
  return Math.abs(hash);
}

function hydrateControls() {
  const dates = state.rows.map((row) => row.__date).sort((a, b) => a - b);
  const minDate = formatISODate(dates[0]);
  const maxDate = formatISODate(dates[dates.length - 1]);
  [els.startDate, els.endDate].forEach((input) => {
    input.min = minDate;
    input.max = maxDate;
  });
  els.startDate.value = minDate;
  els.endDate.value = maxDate;

  refreshSiteOptionList();
  refreshLocationOptions();
  refreshVariantOptionList(state.rows);
  setControlsDisabled(false);
}

function setPanelsEnabled(enabled) {
  els.workspacePanel.classList.toggle("is-disabled", !enabled);
  els.controlsPanel.classList.toggle("is-disabled", !enabled);
  els.summaryPanel.classList.toggle("is-disabled", !enabled);
}

function setControlsDisabled(disabled) {
  [
    els.startDate, els.endDate, els.dimToggle, els.selectAllSitesBtn, els.clearSitesBtn,
    els.selectAllLocationsBtn, els.clearLocationsBtn, els.selectAllVariantsBtn, els.clearVariantsBtn,
    els.resetFiltersBtn, els.clearHighlightBtn, els.openChartsBtn, els.siteDropdownTrigger,
    els.locationDropdownTrigger, els.variantDropdownTrigger
  ].forEach((el) => { if (el) el.disabled = disabled; });

  [els.siteDropdown, els.locationDropdown, els.variantDropdown].forEach((dropdown) => {
    dropdown.classList.toggle("is-disabled", disabled);
  });
}

function refreshSiteOptionList() {
  const sites = uniqueSorted(state.rows.map((row) => row.wwtp_name).filter(Boolean));
  renderCheckboxList({
    container: els.siteOptionList,
    values: sites,
    selectedSet: state.selectedSites,
    colorize: false,
    onChange: (value, checked) => {
      if (checked) state.selectedSites.add(value);
      else state.selectedSites.delete(value);
      refreshSiteLabel();
      refreshLocationOptions();
      renderDashboard();
    }
  });
  refreshSiteLabel();
}

function refreshSiteLabel() {
  const count = state.selectedSites.size;
  if (!state.rows.length) els.siteDropdownLabel.textContent = "Load data first";
  else if (!count) els.siteDropdownLabel.textContent = "No WWTP selected";
  else if (count === 1) els.siteDropdownLabel.textContent = [...state.selectedSites][0];
  else els.siteDropdownLabel.textContent = `${count} WWTPs selected`;
}

function refreshLocationOptions() {
  const validLocations = availableLocations();
  state.selectedLocations = new Set([...state.selectedLocations].filter((loc) => validLocations.includes(loc)));
  refreshLocationOptionList();
}

function availableLocations() {
  const selectedSites = state.selectedSites;
  const rows = selectedSites.size ? state.rows.filter((row) => selectedSites.has(row.wwtp_name)) : [];
  return uniqueSorted(rows.map((row) => row.sample_location_specify).filter(Boolean));
}

function refreshLocationOptionList() {
  const locations = availableLocations();
  renderCheckboxList({
    container: els.locationOptionList,
    values: locations,
    selectedSet: state.selectedLocations,
    colorize: false,
    emptyText: state.selectedSites.size ? "No sample locations found." : "Select a WWTP first.",
    onChange: (value, checked) => {
      if (checked) state.selectedLocations.add(value);
      else state.selectedLocations.delete(value);
      refreshLocationLabel();
      renderDashboard();
    }
  });
  refreshLocationLabel();
  const disabled = !state.rows.length || !state.selectedSites.size || !locations.length;
  els.locationDropdownTrigger.disabled = disabled;
  els.locationDropdown.classList.toggle("is-disabled", disabled);
}

function refreshLocationLabel() {
  const count = state.selectedLocations.size;
  const total = availableLocations().length;
  if (!state.selectedSites.size) els.locationDropdownLabel.textContent = "Select WWTPs first";
  else if (!total) els.locationDropdownLabel.textContent = "No locations found";
  else if (!count) els.locationDropdownLabel.textContent = "All locations";
  else if (count === 1) els.locationDropdownLabel.textContent = [...state.selectedLocations][0];
  else els.locationDropdownLabel.textContent = `${count} locations selected`;
}

function refreshVariantOptionList(rowsForAvailability) {
  const variants = availableVariants(rowsForAvailability || state.rows);
  renderCheckboxList({
    container: els.variantOptionList,
    values: variants,
    selectedSet: state.selectedVariants,
    colorize: true,
    emptyText: "No variants found in the current filters.",
    onChange: (value, checked) => {
      if (checked) state.selectedVariants.add(value);
      else state.selectedVariants.delete(value);
      refreshVariantLabel();
      renderDashboard();
    }
  });
  refreshVariantLabel();
}

function availableVariants(rows) {
  const variants = new Set();
  rows.forEach((row) => {
    if (row.nextclade_lineage) variants.add(row.nextclade_lineage);
    if (row.pango_lineage) variants.add(row.pango_lineage);
    row.lineages.forEach((lineage) => { if (lineage) variants.add(lineage); });
  });
  return [...variants].sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
}

function refreshVariantLabel() {
  const count = state.selectedVariants.size;
  if (!state.rows.length) els.variantDropdownLabel.textContent = "Load data first";
  else if (!count) els.variantDropdownLabel.textContent = "No variants selected";
  else if (count === 1) els.variantDropdownLabel.textContent = [...state.selectedVariants][0];
  else els.variantDropdownLabel.textContent = `${count} variants selected`;
}

function renderCheckboxList({ container, values, selectedSet, colorize, onChange, emptyText = "No options available." }) {
  container.innerHTML = "";
  if (!values.length) {
    const empty = document.createElement("div");
    empty.className = "option-row";
    empty.textContent = emptyText;
    container.appendChild(empty);
    return;
  }

  values.forEach((value) => {
    const label = document.createElement("label");
    label.className = "option-row";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = selectedSet.has(value);
    checkbox.addEventListener("change", () => onChange(value, checkbox.checked));

    label.appendChild(checkbox);
    if (colorize) {
      const swatch = document.createElement("span");
      swatch.className = "swatch";
      swatch.style.background = getVariantColor(value);
      label.appendChild(swatch);
    }
    const text = document.createElement("span");
    text.className = "option-label";
    text.textContent = value;
    label.appendChild(text);
    container.appendChild(label);
  });
}

function resetFilters() {
  if (!state.rows.length) return;

  const sites = uniqueSorted(state.rows.map((row) => row.wwtp_name).filter(Boolean));
  state.selectedSites = new Set(sites.slice(0, 1));
  state.selectedLocations.clear();
  state.selectedVariants.clear();

  const dates = state.rows.map((row) => row.__date).sort((a, b) => a - b);
  els.startDate.value = formatISODate(dates[0]);
  els.endDate.value = formatISODate(dates[dates.length - 1]);
  els.dimToggle.checked = true;

  refreshSiteOptionList();
  refreshLocationOptions();
  refreshVariantOptionList(state.rows);
  renderDashboard();
}

function uniqueSorted(values) {
  return [...new Set(values)].sort((a, b) => String(a).localeCompare(String(b), undefined, { numeric: true }));
}

function renderDashboard() {
  if (!state.rows.length) return;

  const filteredRows = getFilteredRows();
  renderSummary(filteredRows);
  refreshVariantOptionList(filteredRows.length ? filteredRows : state.rows);
  els.clearHighlightBtn.disabled = !state.selectedVariants.size;

  if (!state.selectedSites.size) {
    renderEmptyPlots("No WWTP selected", "Select at least one wastewater treatment plant to generate plots.");
    return;
  }

  if (!filteredRows.length) {
    renderEmptyPlots("No rows match the selected filters", "Adjust the WWTP, sample location, date range, or selected sites.");
    return;
  }

  renderActiveChartTab(filteredRows);
}

function getFilteredRows() {
  const selectedSites = state.selectedSites;
  const selectedLocations = state.selectedLocations;
  const start = els.startDate.value ? parseDate(els.startDate.value) : null;
  const end = els.endDate.value ? parseDate(els.endDate.value) : null;

  return state.rows.filter((row) => {
    if (selectedSites.size && !selectedSites.has(row.wwtp_name)) return false;
    if (selectedLocations.size && !selectedLocations.has(row.sample_location_specify)) return false;
    if (start && row.__date < start) return false;
    if (end && row.__date > end) return false;
    return true;
  });
}

function renderSummary(rows) {
  const sites = uniqueSorted(rows.map((row) => row.wwtp_name).filter(Boolean));
  const specimens = uniqueSorted(rows.map((row) => row.specimen_id).filter(Boolean));
  const locations = uniqueSorted(rows.map((row) => row.sample_location_specify).filter(Boolean));
  const dates = rows.map((row) => row.__date).sort((a, b) => a - b);
  const freyjaLineages = new Set();
  rows.forEach((row) => row.lineages.forEach((lineage) => freyjaLineages.add(lineage)));

  const dateLabel = dates.length ? `${formatISODate(dates[0])} → ${formatISODate(dates[dates.length - 1])}` : "No data";
  const cards = [
    { value: rows.length.toLocaleString(), label: "Filtered rows" },
    { value: sites.length.toLocaleString(), label: "WWTPs" },
    { value: specimens.length.toLocaleString(), label: "Specimens" },
    { value: locations.length.toLocaleString(), label: "Sample locations" },
    { value: freyjaLineages.size.toLocaleString(), label: "Freyja lineages" },
    { value: dateLabel, label: "Filtered date range" }
  ];

  els.summaryCards.innerHTML = cards.map((card) => `
    <div class="summary-card">
      <strong>${escapeHTML(card.value)}</strong>
      <span>${escapeHTML(card.label)}</span>
    </div>`).join("");
}

function renderEmptyPlots(title, message) {
  els.plotsPanel.innerHTML = `
    <div class="empty-state">
      <div>
        <h2>${escapeHTML(title)}</h2>
        <p>${escapeHTML(message)}</p>
      </div>
    </div>`;
}

function renderActiveChartTab(filteredRows) {
  const selectedSites = [...state.selectedSites];
  const groups = selectedSites.map((site) => ({
    key: site,
    label: site,
    rows: filteredRows.filter((row) => row.wwtp_name === site)
  }));

  const globalScales = computeGlobalScales(filteredRows);
  const tab = state.activeChartTab;
  const tabTitle = chartTabTitle(tab);

  if (tab === "freyja") {
    renderFreyjaTab(groups, globalScales, tabTitle, filteredRows);
    return;
  }

  els.plotsPanel.innerHTML = `<div class="chart-type-title">${escapeHTML(tabTitle)} · selected WWTPs shown side by side</div><div class="site-grid" id="active-site-grid"></div>`;
  const grid = document.getElementById("active-site-grid");
  groups.forEach((group, index) => {
    const card = buildSingleChartCard(group, index, tab);
    grid.appendChild(card);
    renderOnePlotForTab(tab, group, index, globalScales);
  });
}

function chartTabTitle(tab) {
  return {
    nextclade: "Nextclade lineages, weekly proportional",
    pango: "Pango lineages, weekly proportional",
    pcr: "PCR target average concentration log",
    freyja: "Freyja lineage abundance by specimen"
  }[tab] || "Charts";
}

function buildSingleChartCard(group, index, tab) {
  const card = document.createElement("article");
  card.className = "site-card single-chart-card";

  const dates = group.rows.map((row) => row.__date).sort((a, b) => a - b);
  const dateLabel = dates.length ? `${formatISODate(dates[0])} → ${formatISODate(dates[dates.length - 1])}` : "No matching dates";
  const specimens = uniqueSorted(group.rows.map((row) => row.specimen_id).filter(Boolean));

  card.innerHTML = `
    <div class="site-card-header">
      <div>
        <h3>${escapeHTML(group.label)}</h3>
        <p>${escapeHTML(dateLabel)}</p>
      </div>
      <div class="site-mini-stats">${group.rows.length.toLocaleString()} rows · ${specimens.length.toLocaleString()} specimens</div>
    </div>
    <div id="chart-${index}-${tab}" class="chart-box"></div>
  `;
  return card;
}

function renderOnePlotForTab(tab, group, index, globalScales) {
  const suffix = ` — ${group.label}`;
  let fig;
  if (tab === "nextclade") {
    fig = makeStackedWeeklyFigure({
      rows: group.rows,
      column: "nextclade_lineage",
      title: `Nextclade Lineages (Weekly, Proportional)${suffix}`,
      legendTitle: "Nextclade lineage",
      globalWeeks: globalScales.weeks,
      showLegend: true
    });
  } else if (tab === "pango") {
    fig = makeStackedWeeklyFigure({
      rows: group.rows,
      column: "pango_lineage",
      title: `Pango Lineages (Weekly, Proportional)${suffix}`,
      legendTitle: "Pango lineage",
      globalWeeks: globalScales.weeks,
      showLegend: true
    });
  } else if (tab === "pcr") {
    fig = makePCRFigure({
      rows: group.rows,
      title: `PCR Target Avg Conc (log)${suffix}`,
      yRange: globalScales.pcrYRange,
      dateRange: globalScales.dateRange
    });
  }
  drawPlot(`chart-${index}-${tab}`, fig);
}

function renderFreyjaTab(groups, globalScales, tabTitle, filteredRows) {
  els.plotsPanel.innerHTML = `
    <div class="chart-type-title">${escapeHTML(tabTitle)} · selected WWTPs shown side by side</div>
    <div class="freyja-tab-layout">
      <div class="site-grid" id="active-site-grid"></div>
      <aside class="freyja-legend-panel" aria-label="Freyja lineage legend">
        <div>
          <h4>Freyja lineage legend</h4>
          <p>Scrollable legend. Check lineages to highlight them across all Freyja plots.</p>
        </div>
        <div class="freyja-legend-actions">
          <button id="freyja-legend-select-all" class="mini-btn" type="button">Select all shown</button>
          <button id="freyja-legend-clear" class="mini-btn" type="button">Clear</button>
        </div>
        <div id="freyja-side-legend-list" class="freyja-legend-list"></div>
      </aside>
    </div>`;

  const grid = document.getElementById("active-site-grid");
  groups.forEach((group, index) => {
    const card = buildSingleChartCard(group, index, "freyja");
    grid.appendChild(card);
    const fig = makeFreyjaFigure({
      rows: group.rows,
      title: `Freyja Results per Specimen — ${group.label}`,
      showLegend: false
    });
    drawPlot(`chart-${index}-freyja`, fig);
  });

  renderFreyjaSideLegend(filteredRows);
}

function renderFreyjaSideLegend(rows) {
  const list = document.getElementById("freyja-side-legend-list");
  const selectAll = document.getElementById("freyja-legend-select-all");
  const clear = document.getElementById("freyja-legend-clear");
  if (!list) return;

  const lineages = availableFreyjaLineages(rows);
  renderCheckboxList({
    container: list,
    values: lineages,
    selectedSet: state.selectedVariants,
    colorize: true,
    emptyText: "No Freyja lineages in the current filters.",
    onChange: (value, checked) => {
      if (checked) state.selectedVariants.add(value);
      else state.selectedVariants.delete(value);
      refreshVariantOptionList(getFilteredRows());
      renderDashboard();
    }
  });

  if (selectAll) {
    selectAll.addEventListener("click", () => {
      lineages.forEach((lineage) => state.selectedVariants.add(lineage));
      refreshVariantOptionList(getFilteredRows());
      renderDashboard();
    });
  }

  if (clear) {
    clear.addEventListener("click", () => {
      lineages.forEach((lineage) => state.selectedVariants.delete(lineage));
      refreshVariantOptionList(getFilteredRows());
      renderDashboard();
    });
  }
}

function availableFreyjaLineages(rows) {
  const lineages = new Set();
  rows.forEach((row) => row.lineages.forEach((lineage) => { if (lineage) lineages.add(lineage); }));
  return [...lineages].sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
}

function drawPlot(elementId, fig) {
  const element = document.getElementById(elementId);
  if (!element || !fig) return;
  Plotly.react(element, fig.data, fig.layout, plotConfig).then(() => {
    if (element.removeAllListeners) element.removeAllListeners("plotly_legendclick");
    element.on("plotly_legendclick", (eventData) => {
      const trace = eventData.fullData || eventData.data?.[eventData.curveNumber];
      const traceName = trace && trace.name;
      if (traceName && state.variants.includes(traceName)) {
        if (state.selectedVariants.has(traceName)) state.selectedVariants.delete(traceName);
        else state.selectedVariants.add(traceName);
        refreshVariantOptionList(getFilteredRows());
        renderDashboard();
        return false;
      }
      return true;
    });
  });
}

function computeGlobalScales(rows) {
  const dates = rows.map((row) => row.__date).sort((a, b) => a - b);
  const dateRange = dates.length ? [formatISODate(dates[0]), formatISODate(dates[dates.length - 1])] : null;
  const weeks = buildContinuousWeeks(rows.map((row) => row.__week));
  const pcrValues = rows.map((row) => row.pcr_target_avg_conc_log).filter((value) => Number.isFinite(value));
  const pcrYRange = makePaddedRange(pcrValues);
  return { dateRange, weeks, pcrYRange };
}

function buildContinuousWeeks(weekDates) {
  const valid = weekDates.filter(Boolean).sort((a, b) => a - b);
  if (!valid.length) return [];
  const weeks = [];
  const current = new Date(valid[0].getTime());
  const last = valid[valid.length - 1];
  while (current <= last) {
    weeks.push(formatISODate(current));
    current.setUTCDate(current.getUTCDate() + 7);
  }
  return weeks;
}

function makePaddedRange(values) {
  if (!values.length) return null;
  let min = Math.min(...values);
  let max = Math.max(...values);
  if (min === max) { min -= 0.5; max += 0.5; }
  const pad = (max - min) * 0.12;
  return [min - pad, max + pad];
}

function makeStackedWeeklyFigure({ rows, column, title, legendTitle, globalWeeks, showLegend }) {
  const nonEmptyRows = rows.filter((row) => row[column]);
  if (!nonEmptyRows.length) return makeEmptyFigure(title, "No lineage records match these filters.");

  const weeks = globalWeeks && globalWeeks.length ? globalWeeks : buildContinuousWeeks(nonEmptyRows.map((row) => row.__week));
  const totalsByWeek = new Map();
  const counts = new Map();
  const variants = new Set();

  nonEmptyRows.forEach((row) => {
    const week = row.__weekISO;
    const variant = row[column];
    variants.add(variant);
    totalsByWeek.set(week, (totalsByWeek.get(week) || 0) + 1);
    const key = `${week}|||${variant}`;
    counts.set(key, (counts.get(key) || 0) + 1);
  });

  const sortedVariants = [...variants].sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  const data = sortedVariants.map((variant) => {
    const y = weeks.map((week) => {
      const total = totalsByWeek.get(week) || 0;
      const count = counts.get(`${week}|||${variant}`) || 0;
      return total ? count / total : 0;
    });
    const countValues = weeks.map((week) => counts.get(`${week}|||${variant}`) || 0);
    return {
      type: "bar",
      x: weeks,
      y,
      name: variant,
      legendgroup: variant,
      marker: {
        color: getVariantColor(variant),
        line: { color: isVariantSelected(variant) ? "#111827" : "rgba(0,0,0,0)", width: isVariantSelected(variant) ? 2 : 0 }
      },
      opacity: getVariantOpacity(variant),
      customdata: countValues,
      hovertemplate: `${legendTitle}: ${escapeForHover(variant)}<br>Week: %{x}<br>Proportion: %{y:.1%}<br>Count: %{customdata}<extra></extra>`
    };
  });

  return {
    data,
    layout: baseLayout(title, {
      barmode: "stack",
      showlegend: showLegend,
      legend: compactLegend(),
      xaxis: { title: "Week starting", type: "date", tickformat: "%Y-%m-%d" },
      yaxis: { title: "Proportion", range: [0, 1], tickformat: ".0%" }
    })
  };
}

function makePCRFigure({ rows, title, yRange, dateRange }) {
  const pcrRows = rows.filter((row) => Number.isFinite(row.pcr_target_avg_conc_log)).sort((a, b) => a.__date - b.__date || a.wwtp_name.localeCompare(b.wwtp_name));
  if (!pcrRows.length) return makeEmptyFigure(title, "No valid PCR log concentration values match these filters.");

  const data = [{
    type: "scatter",
    mode: "lines+markers",
    x: pcrRows.map((row) => row.__dateISO),
    y: pcrRows.map((row) => row.pcr_target_avg_conc_log),
    text: pcrRows.map((row) => row.specimen_id),
    name: "PCR log conc",
    hovertemplate: "Specimen: %{text}<br>Date: %{x}<br>PCR log conc: %{y}<extra></extra>"
  }];

  const values = pcrRows.map((row) => row.pcr_target_avg_conc_log).sort((a, b) => a - b);
  const q1 = quantile(values, 0.25);
  const median = quantile(values, 0.5);
  const q3 = quantile(values, 0.75);
  const shapes = [];
  const annotations = [];

  [
    { value: q1, label: "Q1" },
    { value: median, label: "Median" },
    { value: q3, label: "Q3" }
  ].forEach((item, index) => {
    if (!Number.isFinite(item.value)) return;
    shapes.push({
      type: "line",
      xref: "paper", x0: 0, x1: 1,
      y0: item.value, y1: item.value,
      line: { dash: "dash", width: 1.2, color: "rgba(20,32,51,0.55)" }
    });
    annotations.push({
      xref: "paper", x: 0.01, y: item.value,
      text: item.label,
      showarrow: false,
      xanchor: "left",
      yanchor: index === 1 ? "bottom" : "top",
      bgcolor: "rgba(255,255,255,0.72)",
      font: { size: 11, color: "#344054" }
    });
  });

  return {
    data,
    layout: baseLayout(title, {
      showlegend: false,
      shapes,
      annotations,
      xaxis: { title: "Sample collect date", type: "date", tickformat: "%Y-%m-%d", range: dateRange || undefined },
      yaxis: { title: "log conc", range: yRange || undefined }
    })
  };
}

function makeFreyjaFigure({ rows, title, showLegend }) {
  const exploded = explodeLineagesAbundances(rows);
  if (!exploded.length) return makeEmptyFigure(title, "No valid Freyja lineage/abundance pairs match these filters.");

  const specimenDates = new Map();
  rows.forEach((row) => specimenDates.set(row.specimen_id, row.__dateISO));

  const specimens = uniqueSorted(exploded.map((row) => row.specimen_id)).sort((a, b) => {
    const ad = specimenDates.get(a) || "";
    const bd = specimenDates.get(b) || "";
    return ad.localeCompare(bd) || a.localeCompare(b, undefined, { numeric: true });
  });

  const lineages = uniqueSorted(exploded.map((row) => row.lineage));
  const abundanceMap = new Map();
  exploded.forEach((row) => {
    const key = `${row.specimen_id}|||${row.lineage}`;
    abundanceMap.set(key, (abundanceMap.get(key) || 0) + row.abundance);
  });

  const data = lineages.map((lineage) => ({
    type: "bar",
    x: specimens,
    y: specimens.map((specimen) => abundanceMap.get(`${specimen}|||${lineage}`) || 0),
    name: lineage,
    legendgroup: lineage,
    showlegend: showLegend,
    marker: {
      color: getVariantColor(lineage),
      line: { color: isVariantSelected(lineage) ? "#111827" : "rgba(0,0,0,0)", width: isVariantSelected(lineage) ? 2 : 0 }
    },
    opacity: getVariantOpacity(lineage),
    hovertemplate: `Specimen: %{x}<br>Lineage: ${escapeForHover(lineage)}<br>Abundance: %{y:.1%}<extra></extra>`
  }));

  const coverageBySpecimen = new Map();
  const totalBySpecimen = new Map();
  rows.forEach((row) => coverageBySpecimen.set(row.specimen_id, row.freyja_coverage));
  exploded.forEach((row) => totalBySpecimen.set(row.specimen_id, (totalBySpecimen.get(row.specimen_id) || 0) + row.abundance));

  data.push({
    type: "scatter",
    mode: "text",
    x: specimens,
    y: specimens.map((specimen) => Math.min((totalBySpecimen.get(specimen) || 1) + 0.04, 1.1)),
    text: specimens.map((specimen) => {
      const cov = coverageBySpecimen.get(specimen);
      return Number.isFinite(cov) ? cov.toFixed(2) : "";
    }),
    name: "Freyja coverage",
    showlegend: false,
    hoverinfo: "skip",
    textfont: { size: 11, color: "#344054" }
  });

  return {
    data,
    layout: baseLayout(title, {
      barmode: "stack",
      showlegend: showLegend,
      legend: compactLegend(),
      xaxis: { title: "Specimen ID", automargin: true, tickangle: -45 },
      yaxis: { title: "abundance (proportion)", range: [0, 1.12], tickformat: ".0%" },
      margin: { l: 58, r: 20, t: 70, b: 115 }
    })
  };
}

function explodeLineagesAbundances(rows) {
  const exploded = [];
  rows.forEach((row) => {
    const length = Math.min(row.lineages.length, row.abundances.length);
    for (let i = 0; i < length; i += 1) {
      const lineage = safeString(row.lineages[i]);
      const abundance = parseNumber(row.abundances[i]);
      if (!lineage || !Number.isFinite(abundance)) continue;
      exploded.push({ specimen_id: row.specimen_id, lineage, abundance });
    }
  });
  return exploded;
}

function baseLayout(title, overrides = {}) {
  return {
    title: { text: title, x: 0.01, xanchor: "left", font: { size: 16 } },
    height: 520,
    margin: { l: 58, r: 20, t: 70, b: 70 },
    paper_bgcolor: "#ffffff",
    plot_bgcolor: "#ffffff",
    font: { family: "Inter, ui-sans-serif, system-ui, sans-serif", color: "#142033" },
    hovermode: "closest",
    ...overrides
  };
}

function makeEmptyFigure(title, message) {
  return {
    data: [],
    layout: baseLayout(title, {
      xaxis: { visible: false },
      yaxis: { visible: false },
      annotations: [{
        text: message,
        xref: "paper", yref: "paper", x: 0.5, y: 0.5,
        showarrow: false,
        font: { size: 14, color: "#61708a" }
      }]
    })
  };
}

function compactLegend() {
  return {
    orientation: "h",
    x: 0,
    y: -0.24,
    xanchor: "left",
    yanchor: "top",
    font: { size: 10 },
    itemwidth: 30
  };
}

function getVariantColor(variant) {
  return state.colorMap[variant] || PALETTE[stableHash(variant || "unknown") % PALETTE.length];
}

function isVariantSelected(variant) {
  return state.selectedVariants.has(variant);
}

function getVariantOpacity(variant) {
  if (!state.selectedVariants.size || !els.dimToggle.checked) return 1;
  return state.selectedVariants.has(variant) ? 1 : 0.18;
}

function quantile(sortedValues, q) {
  if (!sortedValues.length) return NaN;
  const position = (sortedValues.length - 1) * q;
  const base = Math.floor(position);
  const rest = position - base;
  if (sortedValues[base + 1] !== undefined) return sortedValues[base] + rest * (sortedValues[base + 1] - sortedValues[base]);
  return sortedValues[base];
}

function escapeHTML(value) {
  return String(value).replace(/[&<>'"]/g, (char) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;"
  }[char]));
}

function escapeForHover(value) {
  return String(value).replace(/%/g, "%%").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function showMessage(message, type = "info") {
  els.messageBox.textContent = message;
  els.messageBox.className = `message-box is-${type}`;
}

function clearMessage() {
  els.messageBox.textContent = "";
  els.messageBox.className = "message-box";
}
