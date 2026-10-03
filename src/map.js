// Brimbank Spatial Explorer — map, layers, tools. Extracted verbatim from the original index.html.
// Requires Leaflet, proj4, Leaflet.draw and src/layers.js to load first.
'use strict';

/* ============================================================
   PROJECTIONS — MGA Zone 55 / GDA94 (covers all of Victoria)
============================================================ */
proj4.defs('EPSG:28355',
  '+proj=utm +zone=55 +south +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs'
);

function toMGA55(lat, lng) {
  try {
    const [e, n] = proj4('EPSG:4326', 'EPSG:28355', [lng, lat]);
    return {
      e: Math.round(e).toLocaleString('en-AU') + ' E',
      n: Math.round(n).toLocaleString('en-AU') + ' N'
    };
  } catch { return { e: '— E', n: '— N' }; }
}


/* ============================================================
   MAP INIT — centred on Keilor East
============================================================ */
const map = L.map('map', {
  center: [-37.7258, 144.8738],
  zoom: 15,
  zoomControl: true,
});

// Dark basemap
L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
  attribution: '© OpenStreetMap contributors © CARTO',
  subdomains: 'abcd',
  maxZoom: 21,
}).addTo(map);

// Scale bar
L.control.scale({ imperial: false, position: 'bottomleft', maxWidth: 200 }).addTo(map);

/* ============================================================
   LAYER ENGINE
============================================================ */
const instances = {};     // id → Leaflet layer
const statuses  = {};     // id → 'inactive'|'loading'|'ok'|'error'

function buildLayer(cfg) {
  if (cfg.type === 'tile') {
    return L.tileLayer(cfg.url, {
      attribution: cfg.attribution || '',
      opacity: cfg.opacity || 1,
      maxZoom: 21,
    });
  }
  if (cfg.type === 'wms') {
    return L.tileLayer.wms(cfg.url, {
      layers:      cfg.layers,
      format:      'image/png',
      transparent: true,
      opacity:     cfg.opacity || 0.8,
      attribution: '© State of Victoria (DataVic)',
      version:     '1.1.1',
      // Leaflet uses viewport bbox dynamically — scales to all of VIC ✓
    });
  }
  return null;
}

function setStatus(id, s) {
  statuses[id] = s;
  const dot = document.querySelector(`.sdot[data-id="${id}"]`);
  if (dot) { dot.className = `sdot ${s}`; dot.title = s.toUpperCase(); }
}

function toggleLayer(cfg, on) {
  let layer = instances[cfg.id];
  if (on) {
    if (!layer) {
      layer = buildLayer(cfg);
      if (!layer) return;
      instances[cfg.id] = layer;
      setStatus(cfg.id, 'loading');
      layer.on('tileload',  () => { if (statuses[cfg.id] !== 'ok') setStatus(cfg.id, 'ok'); });
      layer.on('tileerror', () => { setStatus(cfg.id, 'error'); });
      layer.on('loading',   () => { if (statuses[cfg.id] !== 'ok') setStatus(cfg.id, 'loading'); });
    }
    map.addLayer(layer);
    if (statuses[cfg.id] !== 'ok') setStatus(cfg.id, 'loading');
  } else {
    if (layer) map.removeLayer(layer);
    setStatus(cfg.id, 'inactive');
  }
}

/* ============================================================
   SIDEBAR — BUILD LAYER PANEL
============================================================ */
(function buildPanel() {
  const panel = document.getElementById('layer-panel');
  const groups = {};
  LAYER_CONFIG.forEach(c => { (groups[c.group] = groups[c.group] || []).push(c); });

  let firstTwo = 0;
  Object.entries(groups).forEach(([gname, layers]) => {
    const div = document.createElement('div');
    div.className = 'lg';

    const head = document.createElement('div');
    head.className = 'lg-head';
    head.innerHTML =
      `<span class="lg-chev">▶</span>` +
      `<span class="lg-name">${gname}</span>` +
      `<span class="lg-count">${layers.length}</span>`;

    const body = document.createElement('div');
    body.className = 'lg-body';

    head.addEventListener('click', () => {
      head.classList.toggle('open');
      body.classList.toggle('open');
    });

    layers.forEach(cfg => {
      statuses[cfg.id] = 'inactive';

      const row = document.createElement('div');
      row.className = 'li' + (cfg.defaultOn ? ' is-on' : '');
      row.dataset.id = cfg.id;
      row.innerHTML =
        `<input type="checkbox" class="li-cb" id="cb-${cfg.id}" ${cfg.defaultOn ? 'checked' : ''} data-id="${cfg.id}"/>` +
        `<div class="li-info">` +
          `<div class="li-name" title="${cfg.desc}">${cfg.name}</div>` +
          (cfg.minZoom > 1 ? `<div class="li-zoom">zoom ≥ ${cfg.minZoom}</div>` : '') +
        `</div>` +
        `<div class="sdot" data-id="${cfg.id}" title="INACTIVE"></div>`;

      const opRow = document.createElement('div');
      opRow.className = 'li-op' + (cfg.defaultOn ? ' show' : '');
      opRow.dataset.id = cfg.id;
      const pct = Math.round((cfg.opacity || 0.8) * 100);
      opRow.innerHTML =
        `<input type="range" class="op-slider" min="0" max="1" step="0.05" value="${cfg.opacity || 0.8}" data-id="${cfg.id}"/>` +
        `<span class="op-val" data-id="${cfg.id}">${pct}%</span>`;

      // Checkbox toggle
      row.querySelector('.li-cb').addEventListener('change', e => {
        const on = e.target.checked;
        row.classList.toggle('is-on', on);
        opRow.classList.toggle('show', on);
        toggleLayer(cfg, on);
      });

      // Opacity
      opRow.querySelector('.op-slider').addEventListener('input', e => {
        const v = parseFloat(e.target.value);
        opRow.querySelector('.op-val').textContent = Math.round(v * 100) + '%';
        if (instances[cfg.id]) instances[cfg.id].setOpacity(v);
      });

      body.appendChild(row);
      body.appendChild(opRow);
      if (cfg.defaultOn) toggleLayer(cfg, true);
    });

    div.appendChild(head);
    div.appendChild(body);
    panel.appendChild(div);

    // Auto-open Basemap + Cadastre
    if (firstTwo < 2) {
      head.classList.add('open');
      body.classList.add('open');
      firstTwo++;
    }
  });
})();

/* ============================================================
   SIDEBAR TOGGLE
============================================================ */
const sidebar = document.getElementById('sidebar');
const btnLayers = document.getElementById('btn-layers');

btnLayers.addEventListener('click', () => {
  sidebar.classList.toggle('open');
  btnLayers.classList.toggle('active', sidebar.classList.contains('open'));
});
document.getElementById('sb-close').addEventListener('click', () => {
  sidebar.classList.remove('open');
  btnLayers.classList.remove('active');
});

/* ============================================================
   COORDINATES — live MGA55 + WGS84 on mousemove
============================================================ */
const sE    = document.getElementById('s-e');
const sN    = document.getElementById('s-n');
const sLat  = document.getElementById('s-lat');
const sLng  = document.getElementById('s-lng');
const sZoom = document.getElementById('s-zoom');

map.on('mousemove', ({ latlng: { lat, lng } }) => {
  const m = toMGA55(lat, lng);
  sE.textContent   = m.e;
  sN.textContent   = m.n;
  sLat.textContent = lat.toFixed(5) + '°';
  sLng.textContent = lng.toFixed(5) + '°';
});

function updateZoom() { sZoom.textContent = map.getZoom(); }
map.on('zoom', updateZoom);
updateZoom();

/* ============================================================
   LOADING BAR — fires on map tile loading
============================================================ */
const loadbar = document.getElementById('loadbar');
map.on('loading', () => loadbar.classList.add('go'));
map.on('load',    () => loadbar.classList.remove('go'));

/* ============================================================
   MEASURE TOOLS — Leaflet.draw (toolbar hidden, custom buttons)
============================================================ */
const drawn = new L.FeatureGroup().addTo(map);

// Add draw control to map (needed for event system) but toolbar hidden via CSS
const drawCtrl = new L.Control.Draw({
  draw: {
    polyline: { shapeOptions: { color: '#f59e0b', weight: 2.5 }, metric: true },
    polygon:  { shapeOptions: { color: '#22d3ee', weight: 2.5, fillOpacity: 0.12 }, metric: true, showArea: true },
    rectangle: false, circle: false, marker: false, circlemarker: false,
  },
  edit: { featureGroup: drawn, remove: true, edit: false },
});
map.addControl(drawCtrl);

let activeHandler = null;
const sMeasure = document.getElementById('s-measure');
const mLabel   = document.getElementById('m-label');
const measureSi = document.getElementById('measure-si');
const msep      = document.getElementById('msep');

function showMeasure(label, val) {
  mLabel.textContent = label;
  sMeasure.textContent = val;
  measureSi.style.display = 'flex';
  msep.style.display = 'block';
}

function stopHandler() {
  if (activeHandler) { try { activeHandler.disable(); } catch(e){} activeHandler = null; }
  document.getElementById('btn-measure').classList.remove('active');
  document.getElementById('btn-area').classList.remove('active');
}

document.getElementById('btn-measure').addEventListener('click', () => {
  const btn = document.getElementById('btn-measure');
  if (btn.classList.contains('active')) { stopHandler(); return; }
  stopHandler();
  activeHandler = new L.Draw.Polyline(map, drawCtrl.options.draw.polyline);
  activeHandler.enable();
  btn.classList.add('active');
});

document.getElementById('btn-area').addEventListener('click', () => {
  const btn = document.getElementById('btn-area');
  if (btn.classList.contains('active')) { stopHandler(); return; }
  stopHandler();
  activeHandler = new L.Draw.Polygon(map, drawCtrl.options.draw.polygon);
  activeHandler.enable();
  btn.classList.add('active');
});

document.getElementById('btn-clear').addEventListener('click', () => {
  drawn.clearLayers();
  stopHandler();
  measureSi.style.display = 'none';
  msep.style.display = 'none';
});

map.on(L.Draw.Event.CREATED, e => {
  drawn.addLayer(e.layer);
  stopHandler();

  if (e.layerType === 'polyline') {
    const pts = e.layer.getLatLngs();
    let d = 0;
    for (let i = 1; i < pts.length; i++) d += pts[i-1].distanceTo(pts[i]);
    const lbl = d >= 1000 ? (d/1000).toFixed(3) + ' km' : d.toFixed(1) + ' m';
    showMeasure('DIST', lbl);
    e.layer.bindPopup(`📏 ${lbl}`).openPopup();
  }

  if (e.layerType === 'polygon') {
    const a = L.GeometryUtil.geodesicArea(e.layer.getLatLngs()[0]);
    const lbl = a >= 10000 ? (a/10000).toFixed(3) + ' ha' : a.toFixed(1) + ' m²';
    showMeasure('AREA', lbl);
    e.layer.bindPopup(`⬛ ${lbl}`).openPopup();
  }
});

/* ============================================================
   ADDRESS SEARCH — Nominatim (OSM geocoder, Victoria)
============================================================ */
const searchInput   = document.getElementById('search-input');
const searchResults = document.getElementById('search-results');
let searchMarker = null;

async function doSearch() {
  const q = searchInput.value.trim();
  if (!q) return;
  searchResults.style.display = 'block';
  searchResults.innerHTML = '<div class="sr-item">Searching…</div>';

  try {
    const url =
      `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=6` +
      `&q=${encodeURIComponent(q + ', Victoria, Australia')}`;
    const res  = await fetch(url, { headers: { 'Accept-Language': 'en-AU', 'User-Agent': 'BrimankSpatialExplorer/1.0' } });
    const data = await res.json();

    if (!data.length) {
      searchResults.innerHTML = '<div class="sr-item">No results — try a street, suburb or place name</div>';
      return;
    }

    searchResults.innerHTML = '';
    data.forEach(item => {
      const parts = item.display_name.split(',').map(s => s.trim());
      const title = parts.slice(0, 2).join(', ');
      const sub   = parts.slice(2, 4).join(', ');
      const el = document.createElement('div');
      el.className = 'sr-item';
      el.innerHTML = `<strong>${title}</strong>${sub}`;
      el.addEventListener('click', () => {
        const lat = parseFloat(item.lat), lng = parseFloat(item.lon);
        map.setView([lat, lng], 17);
        if (searchMarker) map.removeLayer(searchMarker);
        searchMarker = L.circleMarker([lat, lng], {
          radius: 7, color: '#f59e0b', fillColor: '#f59e0b', fillOpacity: 0.55, weight: 2,
        }).addTo(map).bindPopup(`<div style="font-size:11px;color:#f59e0b">${title}</div>`).openPopup();
        searchResults.style.display = 'none';
        searchInput.value = title;
      });
      searchResults.appendChild(el);
    });
  } catch {
    searchResults.innerHTML = '<div class="sr-item">Search unavailable — check connection</div>';
  }
}

document.getElementById('search-go').addEventListener('click', doSearch);
searchInput.addEventListener('keydown', e => { if (e.key === 'Enter') doSearch(); });
document.addEventListener('click', e => {
  if (!e.target.closest('#search-wrap')) searchResults.style.display = 'none';
});

/* ============================================================
   WMS GETFEATUREINFO — click any active WMS layer
   (best-effort: silently fails if server blocks CORS on GFI)
============================================================ */
const ipPanel = document.getElementById('info-panel');
const ipBody  = document.getElementById('ip-body');

document.getElementById('ip-close').addEventListener('click', () => ipPanel.classList.remove('show'));

map.on('click', async e => {
  // Find topmost visible WMS layer
  const active = LAYER_CONFIG.filter(c =>
    c.type === 'wms' && instances[c.id] && map.hasLayer(instances[c.id])
  );
  if (!active.length) return;

  const cfg   = active[active.length - 1];
  const size  = map.getSize();
  const bnds  = map.getBounds();
  const px    = map.latLngToContainerPoint(e.latlng);
  const sw    = bnds.getSouthWest();
  const ne    = bnds.getNorthEast();

  const qs = new URLSearchParams({
    SERVICE:      'WMS',
    VERSION:      '1.1.1',
    REQUEST:      'GetFeatureInfo',
    LAYERS:       cfg.layers,
    QUERY_LAYERS: cfg.layers,
    STYLES:       '',
    BBOX:         `${sw.lng},${sw.lat},${ne.lng},${ne.lat}`,
    WIDTH:        size.x,
    HEIGHT:       size.y,
    SRS:          'EPSG:4326',
    INFO_FORMAT:  'application/json',
    X:            Math.round(px.x),
    Y:            Math.round(px.y),
    FEATURE_COUNT: 5,
  });

  try {
    const res  = await fetch(`${cfg.url}?${qs}`, { signal: AbortSignal.timeout(6000) });
    const data = await res.json();
    if (data.features && data.features.length) {
      const props = data.features[0].properties || {};
      const entries = Object.entries(props).filter(([,v]) => v !== null && v !== '' && v !== undefined);
      if (!entries.length) return;
      ipBody.innerHTML = `<div style="font-size:9px;color:var(--text-lo);margin-bottom:6px;letter-spacing:.12em">${cfg.name.toUpperCase()}</div>` +
        entries.map(([k,v]) =>
          `<div class="ip-row"><div class="ip-k">${k.toLowerCase()}</div><div class="ip-v">${v}</div></div>`
        ).join('');
      ipPanel.classList.add('show');
    }
  } catch { /* CORS / timeout — silent fail */ }
});

