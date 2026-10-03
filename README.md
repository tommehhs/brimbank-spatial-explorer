# Brimbank Spatial Explorer

A desktop web map for exploring free Victorian public spatial data, centred on Keilor East but built to work anywhere in Victoria. Built as a public demo and lead magnet for Brimbank Spatial.

Vanilla JavaScript with [Leaflet](https://leafletjs.com/), [proj4js](https://github.com/proj4js/proj4js) and [Leaflet.draw](https://github.com/Leaflet/Leaflet.draw). No framework, no build step.

**Status:** v0.1, built 22 May 2026. The untouched single-file original is the first commit, `74025ab`. It came from the build chat, so if you edited or deployed a different copy afterwards, this may not match it.

## Features

- Dark CartoDB basemap, with Esri aerial imagery as an optional layer
- 19 data layers in 8 groups (Basemap, Cadastre, Planning, Administrative, Water, Environment, Transport, Terrain), each with an on/off toggle, opacity slider and status dot (green loaded, amber loading, red failed)
- Live cursor coordinates in MGA Zone 55 (easting/northing) and WGS84
- Distance and area measuring, with a Clear button
- Address search across Victoria (Nominatim)
- Click a WMS layer to see its feature attributes (best effort; fails silently if blocked)
- Scale bar, loading bar and a subtle brimbankspatial.com.au watermark

## Project structure

```
index.html        Page markup; loads Leaflet, proj4, Leaflet.draw, then src/layers.js, then src/map.js
src/styles.css    All styles (dark theme, Rajdhani + Share Tech Mono)
src/layers.js     LAYER_CONFIG: every data layer, one object each
src/map.js        Map setup, layer engine, sidebar, coordinates, measuring, search, feature info
```

To add, remove or reorder a layer, edit the matching object in `LAYER_CONFIG` in `src/layers.js`. Nothing else needs to change.

## Run it locally

No install needed. Open `index.html` in a browser, or serve the folder with `python3 -m http.server 8000` and open http://localhost:8000. An internet connection is required for all map data.

## Deploy (Cloudflare Pages)

Upload the **whole folder** (`index.html` plus `src/`) as a new deployment, or connect this repo to Cloudflare Pages with no build command and output directory `/`.

## Configuration and secrets

None. All sources are public and keyless, so there is no `.env`. If a keyed service is added later, put the key in `.env` (gitignored) and list the variable name here.

## Known issues

Carried over unchanged from the original build. None were fixed during the migration.

1. **Most data layers probably show red.** They use the DataVic endpoint `services.land.vic.gov.au/catalogue/publicproxy/guest/dv_geoserver/wms` with best-guess layer names (`VMPROPERT:PARCEL`, `VMPLAN:...`, etc.) that were flagged at build time as needing a second pass. That pass never happened. MelbMaps later confirmed a different endpoint and names that do work (`opendata.maps.vic.gov.au/geoserver/wms`, e.g. `plan_zone`, `open-data-platform:property_view`); see the melbmaps repo's `docs/vicmap-layers.md`.
2. **Flood Extent and Native Vegetation are placeholders.** Their endpoint and layer name are marked "TBC" in the config.
3. **Minimum zoom isn't enforced.** Each layer shows "zoom ≥ N" in the panel, but the value is never passed to Leaflet, so dense layers (addresses, buildings) request tiles at any zoom.
4. **Coordinates are GDA94, not GDA2020.** MGA55 uses the GDA94 definition (EPSG:28355). Victoria's current datum is GDA2020 (EPSG:7855), about 1.5 m different.
5. **Not built for phones.** Fixed 272 px sidebar and a single-row toolbar, and coordinates only update on mouse movement (no tap readout).
6. **Search sets a `User-Agent` header**, which browsers block (and it's misspelt "Brimank"). Harmless, but it does nothing.
7. **Unescaped text in the page.** Search results and feature-info values from third-party services are inserted as raw HTML.
8. **Feature info only queries the topmost active WMS layer**, not every layer that's switched on.
9. **Measuring wasn't verified** in the migration test (the automated clicks didn't complete a line in either version). Check it by hand.

## Backlog

- [ ] Re-point layers to the confirmed `opendata.maps.vic.gov.au` endpoint and names, layer by layer
- [ ] Find real endpoints for flood extent and native vegetation, or drop them
- [ ] Decide whether this stays separate from MelbMaps or merges into it
