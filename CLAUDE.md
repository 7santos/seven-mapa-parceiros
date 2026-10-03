# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development

This is a dependency-free static site. There is no package manager, build step, linter, or automated test suite.

- Serve locally (required because `app.js` loads the JSON dataset via `fetch`):
  ```bash
  python3 -m http.server 8000
  ```
  Open `http://localhost:8000`.
- Validate the primary data file after edits:
  ```bash
  python3 -m json.tool data/parceiros.json >/dev/null
  ```

Test browser behavior manually after changing UI or data: the full map view, partner selection from the sidebar, accent-insensitive search, popup links, the **Ver todos** control, and direct links such as `index.html?p=<partner-id>`.

## Architecture

The application is a small client-rendered Leaflet map. `index.html` loads Leaflet from unpkg, the local stylesheet, and `app.js`; `app.js` owns all application behavior.

At startup, `init()` in `app.js` creates the OpenStreetMap-backed Leaflet map, fetches `data/parceiros.json`, and derives both map markers and the sidebar list from that single dataset. `markersPorId` connects partner IDs to Leaflet markers. Selecting a sidebar entry pans/zooms to its marker and opens the same popup; the `p` query parameter selects an initial partner.

`popupHtml()` and `itemListaHtml()` render partner data. Preserve `escapeHtml()` for every string inserted into these HTML templates. The custom marker's SVG is defined in `app.js`; its logo overlay is supplied by the `.pin-logo` CSS rule in `style.css`.

`style.css` defines the Seven Santos black-and-gold visual system, layout, responsive sidebar behavior, custom marker, Leaflet popup overrides, and list/search states.

## Partner data workflow

`data/parceiros.json` is the runtime source of truth. Each record needs a stable unique `id`, partner metadata, `endereco_precisao` (`"endereco"` or `"cidade"`), numeric `lat`/`lon`, and a relative photo path. Partners without numeric coordinates are intentionally omitted from map markers and the sidebar.

`parceiros.txt` is the manually reviewed source list. `raw/parceiros-raw.json` is the pre-geocoding extraction, and `raw/geocode/*.json` preserves Nominatim responses used to derive final coordinates. When adding or correcting an address, geocode with Nominatim at no more than one request per second and include an identifying User-Agent, then update the final record in `data/parceiros.json`.

Partner photos are local files under `img/`; `assets/seven-santos-mark.png` is used in the header and marker, while the complete logo JPEG is reference material.
