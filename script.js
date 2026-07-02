"use strict";

const PARSER_BUILD = "2026-07-02-dropdown-side-by-side-v6";

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
  specimen_id: ["specimen_id", "specimen", "sample_id", "sample", "id"],
  nextclade_lineage: ["nextclade_lineage", "nextclade", "nextclade_clade", "clade"],
  pango_lineage: ["pango_lineage", "pango", "pangolin_lineage", "lineage_call"],
  lineages: ["lineages", "freyja_lineages", "freyja_lineage", "lineage_list"],
  abundances: ["abundances", "freyja_abundances", "abundance", "abundance_list"],
  sample_collect_date: ["sample_collect_date", "collection_date", "sample_date", "collect_date", "date"],
  pcr_target_avg_conc_log: [
    "pcr_target_avg_conc_log",
    "pcr_target_avg_conc_log10",
    "pcr_target_avg_conc_log_10",
    "pcr_log_conc",
    "pcr_target_log_conc",
    "pcr_concentration_log"
  ],
  sample_location_specify: ["sample_location_specify", "sample_location", "location", "sample_site", "sampling_location"],
  wwtp_name: ["wwtp_name", "wwtp", "site", "treatment_plant", "plant", "wwtp_site"],
  freyja_coverage: ["freyja_coverage", "coverage", "freyja_cov", "mean_coverage"]
};

const SAMPLE_DATA = `specimen_id\tnextclade_lineage\tpango_lineage\tpercent_reference_coverage\tfreyja_coverage\twwtp_name\tsample_collect_date\tsample_location_specify\tpcr_target_avg_conc_log\tlineages\tabundances
SP-001\t23A\tXBB.1.5\t94.2\t120.5\tArea 1 WRF\t2025-01-06\tInfluent\t5.42\t['XBB.1.5','BQ.1']\t[0.82,0.18]
SP-002\t23A\tXBB.1.5\t92.8\t98.3\tArea 1 WRF\t2025-01-13\tInfluent\t5.61\t['XBB.1.5','JN.1']\t[0.64,0.36]
SP-003\t23I\tJN.1\t95.1\t133.7\tArea 1 WRF\t2025-01-20\tInfluent\t5.86\t['JN.1','XBB.1.5']\t[0.71,0.29]
SP-004\t23I\tJN.1\t96.4\t141.2\tArea 1 WRF\t2025-01-27\tInfluent\t5.74\t['JN.1','KP.2']\t[0.59,0.41]
SP-005\t24A\tKP.2\t93.7\t115.9\tArea 1 WRF\t2025-02-03\tInfluent\t5.91\t['KP.2','JN.1']\t[0.68,0.32]
SP-006\t23A\tXBB.1.5\t88.7\t89.4\tArea 2 WRF\t2025-01-06\tInfluent\t4.92\t['XBB.1.5','JN.1']\t[0.54,0.46]
SP-007\t23I\tJN.1\t89.1\t91.7\tArea 2 WRF\t2025-01-13\tInfluent\t5.04\t['JN.1','XBB.1.5']\t[0.73,0.27]
SP-008\t23I\tJN.1\t90.3\t100.0\tArea 2 WRF\t2025-01-20\tInfluent\t5.33\t['JN.1','KP.2']\t[0.61,0.39]
SP-009\t24A\tKP.2\t91.5\t126.8\tArea 2 WRF\t2025-01-27\tInfluent\t5.38\t['KP.2','JN.1']\t[0.77,0.23]
SP-010\t24A\tKP.2\t91.9\t130.1\tArea 2 WRF\t2025-02-03\tInfluent\t5.52\t['KP.2','LB.1']\t[0.66,0.34]
SP-011\t23I\tJN.1\t83.4\t77.8\tArea 3 WRF\t2025-01-13\tSecondary\t4.88\t['JN.1','KP.2']\t[0.58,0.42]
SP-012\t24A\tKP.2\t84.2\t84.9\tArea 3 WRF\t2025-01-20\tSecondary\t5.12\t['KP.2','JN.1']\t[0.62,0.38]
SP-013\t24A\tKP.2\t85.1\t90.4\tArea 3 WRF\t2025-01-27\tSecondary\t5.28\t['KP.2','LB.1']\t[0.72,0.28]
SP-014\t24B\tLB.1\t87.5\t93.2\tArea 3 WRF\t2025-02-03\tSecondary\t5.47\t['LB.1','KP.2']\t[0.57,0.43]`;

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
  visibleVariantOptions: [],
  activeFileName: null,
  warnings: []
};

const els = {
  dropZone: document.getElementById("drop-zone"),
  fileInput: document.getElementById("file-input"),
  fileStatus: document.getElementById("file-status"),
  messageBox: document.getElementById("message-box"),
  workspacePanel: document.getElementById("workspace-panel"),
  plotsPanel: document.getElementById("plots-panel"),
  startDate: document.getElementById("start-date"),
  endDate: document.getElementById("end-date"),
  comparisonToggle: document.getElementById("comparison-toggle"),
  dimToggle: document.getElementById("dim-toggle"),
  resetFiltersBtn: document.getElementById("reset-filters-btn"),
  loadSampleBtn: document.getElementById("load-sample-btn"),
  openChartsBtn: document.getElementById("open-charts-btn"),
  backToFiltersBtn: document.getElementById("back-to-filters-btn"),
  clearHighlightBtn: document.getElementById("clear-highlight-btn"),
  summaryCards: document.getElementById("summary-cards"),
  siteDropdown: document.getElementById("site-dropdown"),
  siteDropdownTrigger: document.getElementById("site-dropdown-trigger"),
  siteDropdownLabel: document.getElementById("site-dropdown-label"),
  siteOptionList: document.getElementById("site-option-list"),
  locationDropdown: document.getElementById("location-dropdown"),
  locationDropdownTrigger: document.getElementById("location-dropdown-trigger"),
  locationDropdownLabel: document.getElementById("location-dropdown-label"),
  locationOptionList: document.getElementById("location-option-list"),
  variantDropdown: document.getElementById("variant-dropdown"),
  variantDropdownTrigger: document.getElementById("variant-dropdown-trigger"),
  variantDropdownLabel: document.getElementById("variant-dropdown-label"),
  variantOptionList: document.getElementById("variant-option-list"),
  selectAllSitesBtn: document.getElementById("select-all-sites-btn"),
  clearSitesBtn: document.getElementById("clear-sites-btn"),
  selectAllLocationsBtn: document.getElementById("select-all-locations-btn"),
  clearLocationsBtn: document.getElementById("clear-locations-btn"),
  selectAllVariantsBtn: document.getElementById("select-all-variants-btn"),
  clearVariantsBtn: document.getElementById("clear-variants-btn")
};

const plotConfig = {
  responsive: true,
  displaylogo: false,
  modeBarButtonsToRemove: ["lasso2d", "select2d"]
};

document.addEventListener("DOMContentLoaded", init);

function init() {
  if (!window.Plotly || !window.Papa || !window.XLSX) {
    showMessage(
      "One or more browser dependencies did not load. Check your internet connection or vendor Plotly.js, PapaParse, and SheetJS locally.",
      "error"
    );
  }

  setupFileUpload();
  setupDropdowns();
  setupTabs();
  setupControls();
}

function setupFileUpload() {
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
}

function setupDropdowns() {
  [els.siteDropdownTrigger, els.locationDropdownTrigger, els.variantDropdownTrigger].forEach((trigger) => {
    trigger.addEventListener("click", (event) => {
      event.stopPropagation();
      const dropdown = trigger.closest(".multi-dropdown");
      toggleDropdown(dropdown);
    });
  });

  document.addEventListener("click", (event) => {
    if (!event.target.closest(".multi-dropdown")) closeAllDropdowns();
  });

  [els.siteDropdown, els.locationDropdown, els.variantDropdown].forEach((dropdown) => {
    dropdown.addEventListener("click", (event) => event.stopPropagation());
  });

  els.siteOptionList.addEventListener("change", (event) => {
    if (!event.target.matches("input[type='checkbox']")) return;
    updateSetFromCheckboxList(state.selectedSites, els.siteOptionList);
    refreshLocationOptions();
    renderDashboard();
  });

  els.locationOptionList.addEventListener("change", (event) => {
    if (!event.target.matches("input[type='checkbox']")) return;
    updateSetFromCheckboxList(state.selectedLocations, els.locationOptionList);
    renderDashboard();
  });

  els.variantOptionList.addEventListener("change", (event) => {
    if (!event.target.matches("input[type='checkbox']")) return;
    updateSetFromCheckboxList(state.selectedVariants, els.variantOptionList);
    renderDashboard({ keepVariantMenu: true });
  });
}

function setupTabs() {
  document.querySelectorAll(".workspace-tab").forEach((button) => {
    button.addEventListener("click", () => activateWorkspaceTab(button.dataset.workspaceTab));
  });

  els.openChartsBtn.addEventListener("click", () => activateWorkspaceTab("charts"));
  els.backToFiltersBtn.addEventListener("click", () => activateWorkspaceTab("filters"));
}

function setupControls() {
  els.startDate.addEventListener("change", renderDashboard);
  els.endDate.addEventListener("change", renderDashboard);
  els.comparisonToggle.addEventListener("change", renderDashboard);
  els.dimToggle.addEventListener("change", renderDashboard);

  els.selectAllSitesBtn.addEventListener("click", () => {
    setOptionListChecked(els.siteOptionList, true);
    updateSetFromCheckboxList(state.selectedSites, els.siteOptionList);
    refreshLocationOptions();
    renderDashboard();
  });

  els.clearSitesBtn.addEventListener("click", () => {
    setOptionListChecked(els.siteOptionList, false);
    state.selectedSites.clear();
    refreshLocationOptions();
    renderDashboard();
  });

  els.selectAllLocationsBtn.addEventListener("click", () => {
    setOptionListChecked(els.locationOptionList, true);
    updateSetFromCheckboxList(state.selectedLocations, els.locationOptionList);
    renderDashboard();
  });

  els.clearLocationsBtn.addEventListener("click", () => {
    setOptionListChecked(els.locationOptionList, false);
    state.selectedLocations.clear();
    renderDashboard();
  });

  els.selectAllVariantsBtn.addEventListener("click", () => {
    state.visibleVariantOptions.forEach((variant) => state.selectedVariants.add(variant));
    renderDashboard({ keepVariantMenu: true });
  });

  els.clearVariantsBtn.addEventListener("click", () => {
    state.selectedVariants.clear();
    renderDashboard({ keepVariantMenu: true });
  });

  els.resetFiltersBtn.addEventListener("click", resetFilters);
  els.clearHighlightBtn.addEventListener("click", () => {
    state.selectedVariants.clear();
    renderDashboard();
  });
}

function activateWorkspaceTab(tabName) {
  document.querySelectorAll(".workspace-tab").forEach((button) => {
    const active = button.dataset.workspaceTab === tabName;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-selected", active ? "true" : "false");
  });

  document.querySelectorAll(".workspace-tab-panel").forEach((panel) => {
    panel.classList.toggle("is-active", panel.id === `${tabName}-tab`);
  });

  closeAllDropdowns();
  if (tabName === "charts") setTimeout(resizeVisiblePlots, 50);
}

function toggleDropdown(dropdown) {
  if (!dropdown || dropdown.classList.contains("is-disabled")) return;
  const shouldOpen = !dropdown.classList.contains("is-open");
  closeAllDropdowns();
  dropdown.classList.toggle("is-open", shouldOpen);
  const trigger = dropdown.querySelector(".dropdown-trigger");
  if (trigger) trigger.setAttribute("aria-expanded", shouldOpen ? "true" : "false");
}

function closeAllDropdowns() {
  document.querySelectorAll(".multi-dropdown.is-open").forEach((dropdown) => {
    dropdown.classList.remove("is-open");
    const trigger = dropdown.querySelector(".dropdown-trigger");
    if (trigger) trigger.setAttribute("aria-expanded", "false");
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
    dynamicTyping: false,
    complete: (results) => loadRows(results.data, "sample_data.tsv"),
    error: (error) => showMessage(error.message, "error")
  });
}

function parseUploadedFile(file) {
  const extension = file.name.split(".").pop().toLowerCase();

  if (["xlsx", "xls"].includes(extension)) {
    return parseExcelFile(file);
  }

  if (["csv", "tsv", "txt"].includes(extension)) {
    return parseDelimitedFile(file, extension);
  }

  throw new Error("Unsupported file type. Please upload a CSV, TSV, TXT, XLSX, or XLS file.");
}

function parseDelimitedFile(file, extension) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = decodeArrayBuffer(event.target.result);
        const delimiter = chooseDelimiter(text, extension);
        const results = Papa.parse(text, {
          header: true,
          delimiter,
          skipEmptyLines: "greedy",
          dynamicTyping: false,
          transformHeader: (header) => cleanHeader(header)
        });

        const fatalError = (results.errors || []).find((err) => err.type === "Delimiter" || err.type === "Quotes");
        if (fatalError) throw new Error(`CSV/TSV parsing error: ${fatalError.message}`);
        resolve(results.data || []);
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = () => reject(new Error("Unable to read the uploaded file."));
    reader.readAsArrayBuffer(file);
  });
}

function decodeArrayBuffer(buffer) {
  const bytes = new Uint8Array(buffer);
  if (bytes.length >= 2) {
    if (bytes[0] === 0xff && bytes[1] === 0xfe) return new TextDecoder("utf-16le").decode(bytes);
    if (bytes[0] === 0xfe && bytes[1] === 0xff) return new TextDecoder("utf-16be").decode(bytes);
  }

  const firstChunk = bytes.slice(0, Math.min(bytes.length, 1000));
  let nullOdd = 0;
  let nullEven = 0;
  for (let i = 0; i < firstChunk.length; i += 1) {
    if (firstChunk[i] === 0) {
      if (i % 2) nullOdd += 1;
      else nullEven += 1;
    }
  }
  if (nullOdd > firstChunk.length * 0.2) return new TextDecoder("utf-16le").decode(bytes);
  if (nullEven > firstChunk.length * 0.2) return new TextDecoder("utf-16be").decode(bytes);

  return new TextDecoder("utf-8").decode(bytes);
}

function chooseDelimiter(text, extension) {
  if (extension === "tsv") return "\t";
  if (extension === "csv") return ",";
  const firstLine = text.split(/\r?\n/).find((line) => line.trim()) || "";
  const tabs = (firstLine.match(/\t/g) || []).length;
  const commas = (firstLine.match(/,/g) || []).length;
  return tabs > commas ? "\t" : ",";
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
  if (!rawRows || !rawRows.length) {
    throw new Error("The uploaded file did not contain any data rows.");
  }

  const { rows, warnings } = canonicalizeRows(rawRows);
  const preparedRows = prepareRows(rows);
  const invalidDateCount = rows.length - preparedRows.length;

  if (!preparedRows.length) {
    throw new Error("No usable rows were found after date parsing. Check sample_collect_date values.");
  }

  state.rawRows = rawRows;
  state.rows = preparedRows;
  state.activeFileName = fileName;
  state.warnings = [...warnings];
  if (invalidDateCount > 0) {
    state.warnings.push(`${invalidDateCount} row(s) were skipped because sample_collect_date could not be parsed.`);
  }

  state.variants = collectVariants(preparedRows);
  state.colorMap = buildColorMap(state.variants);
  state.selectedVariants.clear();
  state.selectedLocations.clear();

  hydrateControls();
  setPanelsEnabled(true);
  els.fileStatus.textContent = `Loaded ${preparedRows.length.toLocaleString()} rows from ${fileName}`;
  els.fileStatus.classList.add("success");

  if (state.warnings.length) {
    showMessage(`Loaded with warning(s):\n- ${state.warnings.join("\n- ")}`, "warning");
  } else {
    showMessage("File loaded successfully. The dashboard has been generated below.", "info");
  }

  renderDashboard();
}

function canonicalizeRows(rawRows) {
  const sourceColumns = Object.keys(rawRows[0] || {}).map(cleanHeader);
  const normalizedSourceMap = new Map();

  Object.keys(rawRows[0] || {}).forEach((originalColumn) => {
    const cleaned = cleanHeader(originalColumn);
    normalizedSourceMap.set(normalizeColumnName(cleaned), originalColumn);
  });

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
      aliasWarnings.push(`Mapped input column "${cleanHeader(sourceName)}" to expected column "${target}".`);
    }
  });

  if (missing.length) {
    throw new Error(
      `Parser build: ${PARSER_BUILD}\n` +
      `Missing required column(s): ${missing.join(", ")}.\n\n` +
      `Expected columns: ${REQUIRED_COLUMNS.join(", ")}.\n\n` +
      `Detected columns: ${sourceColumns.join(", ") || "No header row detected"}.`
    );
  }

  const rows = rawRows.map((row) => {
    const clean = {};
    REQUIRED_COLUMNS.forEach((target) => {
      clean[target] = row[resolved[target]];
    });
    return clean;
  });

  return { rows, warnings: aliasWarnings };
}

function cleanHeader(name) {
  return String(name || "")
    .replace(/^\uFEFF/, "")
    .replace(/\u0000/g, "")
    .replace(/^['"]|['"]$/g, "")
    .trim();
}

function normalizeColumnName(name) {
  return cleanHeader(name)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function prepareRows(rows) {
  return rows
    .map((row, idx) => {
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
    })
    .filter(Boolean);
}

function hydrateControls() {
  const sites = uniqueSorted(state.rows.map((row) => row.wwtp_name).filter(Boolean));
  state.selectedSites = new Set(sites.length ? [sites[0]] : []);

  renderCheckboxOptions({
    container: els.siteOptionList,
    values: sites,
    selectedSet: state.selectedSites,
    includeSwatch: false,
    name: "site-option"
  });
  updateSiteDropdownLabel();

  const dates = state.rows.map((row) => row.__date).sort((a, b) => a - b);
  const minDate = formatISODate(dates[0]);
  const maxDate = formatISODate(dates[dates.length - 1]);
  [els.startDate, els.endDate].forEach((input) => {
    input.min = minDate;
    input.max = maxDate;
  });
  els.startDate.value = minDate;
  els.endDate.value = maxDate;

  refreshLocationOptions();
  setControlsDisabled(false);
}

function setPanelsEnabled(enabled) {
  els.workspacePanel.classList.toggle("is-disabled", !enabled);
}

function setControlsDisabled(disabled) {
  [
    els.siteDropdownTrigger,
    els.locationDropdownTrigger,
    els.variantDropdownTrigger,
    els.startDate,
    els.endDate,
    els.comparisonToggle,
    els.dimToggle,
    els.selectAllSitesBtn,
    els.clearSitesBtn,
    els.selectAllLocationsBtn,
    els.clearLocationsBtn,
    els.selectAllVariantsBtn,
    els.clearVariantsBtn,
    els.resetFiltersBtn,
    els.clearHighlightBtn,
    els.openChartsBtn
  ].forEach((el) => {
    if (el) el.disabled = disabled;
  });

  [els.siteDropdown, els.locationDropdown, els.variantDropdown].forEach((dropdown) => {
    dropdown.classList.toggle("is-disabled", disabled);
  });
}

function refreshLocationOptions() {
  const selectedSites = state.selectedSites;
  const locationRows = selectedSites.size
    ? state.rows.filter((row) => selectedSites.has(row.wwtp_name))
    : [];
  const locations = uniqueSorted(locationRows.map((row) => row.sample_location_specify).filter(Boolean));

  state.selectedLocations = new Set([...state.selectedLocations].filter((location) => locations.includes(location)));

  renderCheckboxOptions({
    container: els.locationOptionList,
    values: locations,
    selectedSet: state.selectedLocations,
    includeSwatch: false,
    name: "location-option"
  });

  const disabled = !state.rows.length || !locations.length || !state.selectedSites.size;
  els.locationDropdown.classList.toggle("is-disabled", disabled);
  els.locationDropdownTrigger.disabled = disabled;
  updateLocationDropdownLabel(locations.length);
}

function renderCheckboxOptions({ container, values, selectedSet, includeSwatch, name }) {
  if (!values.length) {
    container.innerHTML = `<div class="dropdown-empty">No options available</div>`;
    return;
  }

  container.innerHTML = values.map((value, index) => {
    const id = `${name}-${index}-${stableHash(value)}`;
    const checked = selectedSet.has(value) ? "checked" : "";
    const swatch = includeSwatch ? `<span class="swatch" style="background:${getVariantColor(value)}"></span>` : "";
    return `
      <label class="dropdown-option" for="${id}">
        <input id="${id}" type="checkbox" value="${escapeAttribute(value)}" ${checked} />
        ${swatch}
        <span class="option-label">${escapeHTML(value)}</span>
      </label>`;
  }).join("");
}

function updateSetFromCheckboxList(targetSet, container) {
  targetSet.clear();
  container.querySelectorAll("input[type='checkbox']:checked").forEach((input) => {
    targetSet.add(input.value);
  });
}

function setOptionListChecked(container, checked) {
  container.querySelectorAll("input[type='checkbox']").forEach((input) => {
    input.checked = checked;
  });
}

function resetFilters() {
  if (!state.rows.length) return;
  const sites = uniqueSorted(state.rows.map((row) => row.wwtp_name).filter(Boolean));
  state.selectedSites = new Set(sites.length ? [sites[0]] : []);
  state.selectedLocations.clear();
  state.selectedVariants.clear();

  renderCheckboxOptions({
    container: els.siteOptionList,
    values: sites,
    selectedSet: state.selectedSites,
    includeSwatch: false,
    name: "site-option"
  });

  refreshLocationOptions();

  const dates = state.rows.map((row) => row.__date).sort((a, b) => a - b);
  els.startDate.value = formatISODate(dates[0]);
  els.endDate.value = formatISODate(dates[dates.length - 1]);
  els.comparisonToggle.checked = true;
  els.dimToggle.checked = true;
  closeAllDropdowns();
  renderDashboard();
}

function renderDashboard(options = {}) {
  if (!state.rows.length) return;

  updateSiteDropdownLabel();
  updateLocationDropdownLabel();

  if (!state.selectedSites.size) {
    renderSummary([]);
    renderVariantOptions([]);
    els.plotsPanel.innerHTML = `
      <div class="empty-state">
        <h2>No WWTP selected</h2>
        <p>Select at least one wastewater treatment plant to generate plots.</p>
      </div>`;
    return;
  }

  const filteredRows = getFilteredRows();
  renderSummary(filteredRows);
  renderVariantOptions(filteredRows);

  if (options.keepVariantMenu) {
    els.variantDropdown.classList.add("is-open");
    els.variantDropdownTrigger.setAttribute("aria-expanded", "true");
  }

  if (!filteredRows.length) {
    els.plotsPanel.innerHTML = `
      <div class="empty-state">
        <h2>No rows match the selected filters</h2>
        <p>Adjust the WWTP, sample location, or date range filters.</p>
      </div>`;
    return;
  }

  const selectedSites = [...state.selectedSites];
  const useComparison = els.comparisonToggle.checked && selectedSites.length > 1;
  const groups = useComparison
    ? selectedSites.map((site) => ({
        key: site,
        label: site,
        rows: filteredRows.filter((row) => row.wwtp_name === site)
      }))
    : [{
        key: "combined",
        label: selectedSites.length > 1 ? `Combined view: ${selectedSites.length} WWTPs` : selectedSites[0],
        rows: filteredRows
      }];

  const globalScales = computeGlobalScales(filteredRows);
  els.plotsPanel.innerHTML = "";

  const grid = document.createElement("div");
  grid.className = "site-grid";
  els.plotsPanel.appendChild(grid);

  groups.forEach((group, groupIndex) => {
    const card = buildSiteCard(group, groupIndex);
    grid.appendChild(card);
    renderGroupPlots(group, groupIndex, globalScales, useComparison);
  });
}

function getFilteredRows() {
  const start = els.startDate.value ? parseDate(els.startDate.value) : null;
  const end = els.endDate.value ? parseDate(els.endDate.value) : null;

  return state.rows.filter((row) => {
    if (state.selectedSites.size && !state.selectedSites.has(row.wwtp_name)) return false;
    if (state.selectedLocations.size && !state.selectedLocations.has(row.sample_location_specify)) return false;
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

  const dateLabel = dates.length
    ? `${formatISODate(dates[0])} → ${formatISODate(dates[dates.length - 1])}`
    : "No data";

  const cards = [
    { value: rows.length.toLocaleString(), label: "Filtered rows" },
    { value: sites.length.toLocaleString(), label: "WWTPs" },
    { value: specimens.length.toLocaleString(), label: "Specimens" },
    { value: locations.length.toLocaleString(), label: "Sample locations" },
    { value: freyjaLineages.size.toLocaleString(), label: "Freyja lineages" },
    { value: dateLabel, label: "Filtered date range" }
  ];

  els.summaryCards.innerHTML = cards
    .map((card) => `
      <div class="summary-card">
        <strong>${escapeHTML(card.value)}</strong>
        <span>${escapeHTML(card.label)}</span>
      </div>`)
    .join("");
}

function renderVariantOptions(rows) {
  const availableVariants = collectVariants(rows.length ? rows : state.rows);
  state.visibleVariantOptions = availableVariants;

  // Drop highlighted variants that no longer exist in the filtered data.
  state.selectedVariants = new Set([...state.selectedVariants].filter((variant) => availableVariants.includes(variant)));

  renderCheckboxOptions({
    container: els.variantOptionList,
    values: availableVariants,
    selectedSet: state.selectedVariants,
    includeSwatch: true,
    name: "variant-option"
  });
  updateVariantDropdownLabel();
}

function updateSiteDropdownLabel() {
  const selected = [...state.selectedSites];
  els.siteDropdownLabel.textContent = selected.length === 0
    ? "Select WWTPs"
    : selected.length === 1
      ? selected[0]
      : `${selected.length} WWTPs selected`;
}

function updateLocationDropdownLabel(totalOptions = null) {
  const selected = [...state.selectedLocations];
  const total = totalOptions ?? els.locationOptionList.querySelectorAll("input[type='checkbox']").length;
  els.locationDropdownLabel.textContent = total === 0
    ? "No locations available"
    : selected.length === 0
      ? "All locations"
      : selected.length === 1
        ? selected[0]
        : `${selected.length} locations selected`;
}

function updateVariantDropdownLabel() {
  const selected = [...state.selectedVariants];
  els.variantDropdownLabel.textContent = selected.length === 0
    ? "No variants selected"
    : selected.length === 1
      ? selected[0]
      : `${selected.length} variants selected`;
  els.clearHighlightBtn.disabled = !state.rows.length || selected.length === 0;
}

function buildSiteCard(group, groupIndex) {
  const card = document.createElement("article");
  card.className = "site-card";

  const dates = group.rows.map((row) => row.__date).sort((a, b) => a - b);
  const dateLabel = dates.length
    ? `${formatISODate(dates[0])} → ${formatISODate(dates[dates.length - 1])}`
    : "No matching dates";
  const specimens = uniqueSorted(group.rows.map((row) => row.specimen_id).filter(Boolean));

  card.innerHTML = `
    <div class="site-card-header">
      <div>
        <h3>${escapeHTML(group.label)}</h3>
        <p>${dateLabel}</p>
      </div>
      <div class="site-mini-stats">
        ${group.rows.length.toLocaleString()} rows · ${specimens.length.toLocaleString()} specimens
      </div>
    </div>
    <div class="chart-grid">
      <div id="chart-${groupIndex}-nextclade" class="chart-box"></div>
      <div id="chart-${groupIndex}-pango" class="chart-box"></div>
      <div id="chart-${groupIndex}-pcr" class="chart-box"></div>
      <div id="chart-${groupIndex}-freyja" class="chart-box"></div>
    </div>
  `;
  return card;
}

function renderGroupPlots(group, groupIndex, globalScales, isComparison) {
  const suffix = isComparison ? ` — ${group.label}` : "";

  const nextcladeFig = makeStackedWeeklyFigure({
    rows: group.rows,
    column: "nextclade_lineage",
    title: `Nextclade Lineages (Weekly, Proportional)${suffix}`,
    legendTitle: "Nextclade lineage",
    globalWeeks: globalScales.weeks
  });

  const pangoFig = makeStackedWeeklyFigure({
    rows: group.rows,
    column: "pango_lineage",
    title: `Pango Lineages (Weekly, Proportional)${suffix}`,
    legendTitle: "Pango lineage",
    globalWeeks: globalScales.weeks
  });

  const pcrFig = makePCRFigure({
    rows: group.rows,
    title: `PCR Target Avg Conc (log)${suffix}`,
    yRange: globalScales.pcrYRange,
    dateRange: globalScales.dateRange
  });

  const freyjaFig = makeFreyjaFigure({
    rows: group.rows,
    title: `Freyja Results per Specimen${suffix}`
  });

  drawPlot(`chart-${groupIndex}-nextclade`, nextcladeFig);
  drawPlot(`chart-${groupIndex}-pango`, pangoFig);
  drawPlot(`chart-${groupIndex}-pcr`, pcrFig);
  drawPlot(`chart-${groupIndex}-freyja`, freyjaFig);
}

function drawPlot(elementId, fig) {
  const element = document.getElementById(elementId);
  if (!element) return;
  Plotly.react(element, fig.data, fig.layout, plotConfig).then(() => {
    element.removeAllListeners && element.removeAllListeners("plotly_legendclick");
    element.on("plotly_legendclick", (eventData) => {
      const trace = eventData.fullData || eventData.data?.[eventData.curveNumber];
      const traceName = trace && trace.name;
      if (traceName && state.variants.includes(traceName)) {
        toggleVariant(traceName);
        renderDashboard();
        return false;
      }
      return true;
    });
  });
}

function toggleVariant(variant) {
  if (state.selectedVariants.has(variant)) {
    state.selectedVariants.delete(variant);
  } else {
    state.selectedVariants.add(variant);
  }
}

function resizeVisiblePlots() {
  document.querySelectorAll(".chart-box").forEach((el) => {
    if (el.offsetParent !== null && window.Plotly) Plotly.Plots.resize(el);
  });
}

function computeGlobalScales(rows) {
  const dates = rows.map((row) => row.__date).sort((a, b) => a - b);
  const dateRange = dates.length ? [formatISODate(dates[0]), formatISODate(dates[dates.length - 1])] : null;
  const weeks = buildContinuousWeeks(rows.map((row) => row.__week));
  const pcrValues = rows
    .map((row) => row.pcr_target_avg_conc_log)
    .filter((value) => Number.isFinite(value));
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
  if (min === max) {
    min -= 0.5;
    max += 0.5;
  }
  const pad = (max - min) * 0.12;
  return [min - pad, max + pad];
}

function makeStackedWeeklyFigure({ rows, column, title, legendTitle, globalWeeks }) {
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
        line: getMarkerLine(variant)
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
      legend: compactLegend(),
      xaxis: {
        title: "Week starting",
        type: "date",
        tickformat: "%Y-%m-%d"
      },
      yaxis: {
        title: "Proportion",
        range: [0, 1],
        tickformat: ".0%"
      }
    })
  };
}

function makePCRFigure({ rows, title, yRange, dateRange }) {
  const pcrRows = rows
    .filter((row) => Number.isFinite(row.pcr_target_avg_conc_log))
    .sort((a, b) => a.__date - b.__date || a.wwtp_name.localeCompare(b.wwtp_name));

  if (!pcrRows.length) return makeEmptyFigure(title, "No valid PCR log concentration values match these filters.");

  const sites = uniqueSorted(pcrRows.map((row) => row.wwtp_name).filter(Boolean));
  const makeTrace = (siteRows, traceName) => ({
    type: "scatter",
    mode: "lines+markers",
    x: siteRows.map((row) => row.__dateISO),
    y: siteRows.map((row) => row.pcr_target_avg_conc_log),
    text: siteRows.map((row) => row.specimen_id),
    name: traceName,
    hovertemplate: "Specimen: %{text}<br>Date: %{x}<br>PCR log conc: %{y}<extra></extra>"
  });

  const data = sites.length > 1
    ? sites.map((site) => makeTrace(pcrRows.filter((row) => row.wwtp_name === site), site))
    : [makeTrace(pcrRows, "PCR log conc")];

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
      xref: "paper",
      x0: 0,
      x1: 1,
      y0: item.value,
      y1: item.value,
      line: { dash: "dash", width: 1.2, color: "rgba(20,32,51,0.55)" }
    });
    annotations.push({
      xref: "paper",
      x: 0.01,
      y: item.value,
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
      legend: sites.length > 1 ? compactLegend("Site") : { orientation: "h", y: -0.22 },
      shapes,
      annotations,
      xaxis: {
        title: "Sample collect date",
        type: "date",
        tickformat: "%Y-%m-%d",
        range: dateRange || undefined
      },
      yaxis: {
        title: "log conc",
        range: yRange || undefined
      }
    })
  };
}

function makeFreyjaFigure({ rows, title }) {
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
    marker: {
      color: getVariantColor(lineage),
      line: getMarkerLine(lineage)
    },
    opacity: getVariantOpacity(lineage),
    hovertemplate: `Specimen: %{x}<br>Lineage: ${escapeForHover(lineage)}<br>Abundance: %{y:.1%}<extra></extra>`
  }));

  const coverageBySpecimen = new Map();
  const totalBySpecimen = new Map();
  rows.forEach((row) => {
    coverageBySpecimen.set(row.specimen_id, row.freyja_coverage);
  });
  exploded.forEach((row) => {
    totalBySpecimen.set(row.specimen_id, (totalBySpecimen.get(row.specimen_id) || 0) + row.abundance);
  });

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
      legend: compactLegend(),
      xaxis: {
        title: "Specimen ID",
        type: "category",
        tickangle: specimens.length > 7 ? -35 : 0,
        automargin: true
      },
      yaxis: {
        title: "abundance (proportion)",
        range: [0, 1.15],
        tickformat: ".0%"
      }
    })
  };
}

function explodeLineagesAbundances(rows) {
  const exploded = [];
  rows.forEach((row) => {
    const length = Math.min(row.lineages.length, row.abundances.length);
    for (let i = 0; i < length; i += 1) {
      const lineage = safeString(row.lineages[i]);
      const abundance = row.abundances[i];
      if (!lineage || !Number.isFinite(abundance)) continue;
      exploded.push({
        specimen_id: row.specimen_id,
        lineage,
        abundance
      });
    }
  });
  return exploded;
}

function collectVariants(rows) {
  const variants = new Set();
  rows.forEach((row) => {
    if (row.nextclade_lineage) variants.add(row.nextclade_lineage);
    if (row.pango_lineage) variants.add(row.pango_lineage);
    row.lineages.forEach((lineage) => {
      if (lineage) variants.add(lineage);
    });
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
  for (let i = 0; i < String(text).length; i += 1) {
    hash = ((hash << 5) - hash + String(text).charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
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
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return new Date(Date.UTC(value.getFullYear(), value.getMonth(), value.getDate()));
  }

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
  if (!text || text.toLowerCase() === "nan" || text.toLowerCase() === "none") return [];

  try {
    return JSON.parse(text);
  } catch (_) {
    try {
      const jsonish = text
        .replace(/\bNone\b/g, "null")
        .replace(/\bnan\b/gi, "null")
        .replace(/'/g, '"');
      return JSON.parse(jsonish);
    } catch (__) {
      return text
        .replace(/^\[/, "")
        .replace(/\]$/, "")
        .split(/[;,]/)
        .map((part) => part.trim().replace(/^['"]|['"]$/g, ""))
        .filter(Boolean);
    }
  }
}

function uniqueSorted(values) {
  return [...new Set(values)].sort((a, b) => String(a).localeCompare(String(b), undefined, { numeric: true }));
}

function quantile(sortedValues, q) {
  if (!sortedValues.length) return NaN;
  const pos = (sortedValues.length - 1) * q;
  const base = Math.floor(pos);
  const rest = pos - base;
  if (sortedValues[base + 1] !== undefined) {
    return sortedValues[base] + rest * (sortedValues[base + 1] - sortedValues[base]);
  }
  return sortedValues[base];
}

function baseLayout(title, overrides = {}) {
  return {
    title: { text: title, x: 0.02, xanchor: "left", font: { size: 15 } },
    height: 430,
    margin: { l: 58, r: 20, t: 60, b: 82 },
    paper_bgcolor: "#ffffff",
    plot_bgcolor: "#ffffff",
    hovermode: "closest",
    font: { family: "Inter, system-ui, -apple-system, Segoe UI, sans-serif", color: "#142033" },
    ...overrides
  };
}

function compactLegend(title = "Click to highlight") {
  return {
    title: { text: title },
    orientation: "h",
    y: -0.24,
    x: 0,
    itemclick: "toggle",
    itemdoubleclick: "toggleothers",
    font: { size: 10 }
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
        x: 0.5,
        y: 0.5,
        xref: "paper",
        yref: "paper",
        showarrow: false,
        font: { size: 13, color: "#61708a" }
      }]
    })
  };
}

function getVariantColor(variant) {
  return state.colorMap[variant] || PALETTE[stableHash(variant) % PALETTE.length];
}

function getMarkerLine(variant) {
  const selected = state.selectedVariants.has(variant);
  return {
    color: selected ? "#111827" : "rgba(0,0,0,0)",
    width: selected ? 1.6 : 0
  };
}

function getVariantOpacity(variant) {
  if (!state.selectedVariants.size || !els.dimToggle.checked) return 1;
  return state.selectedVariants.has(variant) ? 1 : 0.16;
}

function showMessage(message, type = "info") {
  els.messageBox.textContent = message;
  els.messageBox.className = `message-box is-${type}`;
}

function clearMessage() {
  els.messageBox.textContent = "";
  els.messageBox.className = "message-box";
}

function escapeHTML(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function escapeAttribute(value) {
  return escapeHTML(value);
}

function escapeForHover(value) {
  return String(value).replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
