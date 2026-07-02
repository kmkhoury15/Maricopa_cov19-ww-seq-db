# AZ State Wastewater Sequencing Dashboard

A browser-only, single-page Plotly.js dashboard for wastewater sequencing data. The app runs entirely from static files, so it can be opened directly in a browser or hosted on GitHub Pages. No Python backend, Dash server, or local hosting is required.

## What changed in this version

- Replaced the plain WWTP and sample-location controls with polished click-down multi-select menus.
- Replaced the variant-selection area with a click-down dropdown menu containing variant checkboxes and color swatches.
- Added a workspace tab layout:
  - **Filters & summary** for upload-driven controls, summary cards, and variant highlighting.
  - **All charts side by side** for larger chart cards.
- The charts tab shows all four visualizations together for each selected WWTP:
  - Nextclade weekly proportional lineage bars
  - Pango weekly proportional lineage bars
  - PCR target average concentration log trend with Q1, median, and Q3 lines
  - Freyja specimen-level abundance bars with coverage labels
- When multiple WWTPs are selected, each WWTP is displayed in its own side-by-side chart card.
- Variant colors remain stable across all charts.
- Selected variants are highlighted across Nextclade, Pango, and Freyja plots; non-selected variants can be dimmed.

## Files

```text
index.html
style.css
script.js
README.md
sample_data.tsv
```

## Required input columns

The expected columns are based on the original Dash/Python dashboard:

```text
specimen_id
nextclade_lineage
pango_lineage
lineages
abundances
sample_collect_date
pcr_target_avg_conc_log
sample_location_specify
wwtp_name
freyja_coverage
```

The app also accepts several common aliases, including:

```text
pcr_target_avg_conc_log10
sample_location
location
wwtp
site
coverage
freyja_cov
collection_date
sample_date
```

Extra columns, such as `percent_reference_coverage`, are allowed and ignored unless later added to the dashboard.

## Supported upload formats

- `.tsv`
- `.csv`
- `.txt`
- `.xlsx`
- `.xls`

For `.tsv` files, the parser forces tab-delimited parsing. The app also attempts to detect UTF-16 TSV exports, which can occur when files are saved from Excel.

## How to use locally

Option 1: Open directly in your browser.

```text
index.html
```

Option 2: Serve from a simple static server.

```bash
python -m http.server 8000
```

Then open:

```text
http://localhost:8000
```

## GitHub Pages deployment

1. Create or open your GitHub repository.
2. Upload these files to the root of the repository:
   - `index.html`
   - `style.css`
   - `script.js`
   - `README.md`
   - `sample_data.tsv` if you want to keep the demo data
3. Go to **Settings → Pages**.
4. Under **Build and deployment**, choose **Deploy from a branch**.
5. Select the `main` branch and `/root` folder.
6. Save.

Your app should publish at:

```text
https://YOUR-USERNAME.github.io/YOUR-REPO-NAME/
```

## Notes and assumptions

- All computation is performed in the browser.
- Very large files may load more slowly than a Python/Dash backend because parsing and rendering happen client-side.
- Excel files are read from the first worksheet.
- The `lineages` and `abundances` columns should contain list-like values, for example:

```text
['JN.1','KP.2']
[0.62,0.38]
```

JSON-style lists are also supported:

```text
["JN.1", "KP.2"]
[0.62, 0.38]
```
