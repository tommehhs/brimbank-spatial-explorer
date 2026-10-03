// Brimbank Spatial Explorer — layer config. Extracted verbatim from the original index.html.
// Loaded as a classic script before src/map.js, which reads DV and LAYER_CONFIG.
'use strict';

/* ============================================================
   LAYER CONFIGURATION
   ─────────────────────────────────────────────────────────
   To add a layer:    add one object to the array.
   To remove a layer: delete the object.
   To reorder:        move the object.
   All WMS requests use dynamic viewport bbox automatically.
============================================================ */

const DV  = 'https://services.land.vic.gov.au/catalogue/publicproxy/guest/dv_geoserver/wms';

const LAYER_CONFIG = [

  // ── BASEMAP ───────────────────────────────────────────────
  {
    id: 'aerial', name: 'Aerial Imagery', group: 'Basemap',
    type: 'tile',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: '© Esri World Imagery',
    opacity: 1, defaultOn: false, minZoom: 1,
    desc: 'Esri World Imagery satellite basemap',
  },

  // ── CADASTRE ─────────────────────────────────────────────
  {
    id: 'parcels', name: 'Land Parcels', group: 'Cadastre',
    type: 'wms', url: DV, layers: 'VMPROPERT:PARCEL',
    opacity: 0.8, defaultOn: true, minZoom: 14,
    desc: 'Property lot boundaries — Vicmap Property',
  },
  {
    id: 'addresses', name: 'Address Points', group: 'Cadastre',
    type: 'wms', url: DV, layers: 'VMADD:ADDRESS',
    opacity: 0.9, defaultOn: false, minZoom: 16,
    desc: 'Addressable property points — Vicmap Address',
  },
  {
    id: 'buildings', name: 'Building Footprints', group: 'Cadastre',
    type: 'wms', url: DV, layers: 'VMBLDG:BUILDING',
    opacity: 0.7, defaultOn: false, minZoom: 15,
    desc: 'Building outlines — Vicmap Buildings',
  },

  // ── PLANNING ─────────────────────────────────────────────
  {
    id: 'planning_zones', name: 'Planning Zones', group: 'Planning',
    type: 'wms', url: DV, layers: 'VMPLAN:PLANNING_ZONE_POLYGON',
    opacity: 0.6, defaultOn: false, minZoom: 12,
    desc: 'Victorian planning zones — Vicmap Planning',
  },
  {
    id: 'heritage', name: 'Heritage Overlays', group: 'Planning',
    type: 'wms', url: DV, layers: 'VMPLAN:HERITAGE_OVERLAY_POLYGON',
    opacity: 0.7, defaultOn: false, minZoom: 12,
    desc: 'Heritage overlay areas — Vicmap Planning',
  },
  {
    id: 'bushfire', name: 'Bushfire Prone Areas', group: 'Planning',
    type: 'wms', url: DV, layers: 'VMPLAN:BUSHFIRE_PRONE_AREA',
    opacity: 0.6, defaultOn: false, minZoom: 10,
    desc: 'CFA Bushfire Prone Areas — DataVic',
  },

  // ── ADMINISTRATIVE ────────────────────────────────────────
  {
    id: 'suburbs', name: 'Suburb Boundaries', group: 'Administrative',
    type: 'wms', url: DV, layers: 'VMADMIN:LOCALITY_POLYGON',
    opacity: 0.65, defaultOn: true, minZoom: 10,
    desc: 'Suburb and locality boundaries — Vicmap Admin',
  },
  {
    id: 'lga', name: 'LGA Boundaries', group: 'Administrative',
    type: 'wms', url: DV, layers: 'VMADMIN:LGA_POLYGON',
    opacity: 0.7, defaultOn: false, minZoom: 8,
    desc: 'Local Government Areas incl. Brimbank — Vicmap Admin',
  },
  {
    id: 'crown_land', name: 'Crown & Public Land', group: 'Administrative',
    type: 'wms', url: DV, layers: 'VMPLAN:PUBLIC_LAND_POLYGON',
    opacity: 0.5, defaultOn: false, minZoom: 11,
    desc: 'Crown and public land tenure — DataVic',
  },

  // ── WATER ─────────────────────────────────────────────────
  {
    id: 'waterways', name: 'Waterways & Rivers', group: 'Water',
    type: 'wms', url: DV, layers: 'VMWATER:WATERCOURSE_CENTRELINE',
    opacity: 0.9, defaultOn: false, minZoom: 10,
    desc: 'Rivers, creeks and streams — Vicmap Hydro',
  },
  {
    id: 'water_bodies', name: 'Water Bodies', group: 'Water',
    type: 'wms', url: DV, layers: 'VMWATER:WATER_AREA_POLYGON',
    opacity: 0.8, defaultOn: false, minZoom: 10,
    desc: 'Lakes, wetlands, reservoirs — Vicmap Hydro',
  },
  {
    id: 'flood', name: 'Flood Extent', group: 'Water',
    type: 'wms',
    url: 'https://opendata.deeca.vic.gov.au/server/rest/services/FloodMapping/MapServer/WMSServer',
    layers: '0',
    opacity: 0.55, defaultOn: false, minZoom: 10,
    desc: 'Flood extent mapping — DEECA (endpoint TBC)',
  },
  {
    id: 'drainage', name: 'Drainage Catchments', group: 'Water',
    type: 'wms', url: DV, layers: 'VMWATER:DRAINAGE_AREA_POLYGON',
    opacity: 0.5, defaultOn: false, minZoom: 10,
    desc: 'Drainage catchment boundaries — Vicmap Hydro',
  },

  // ── ENVIRONMENT ───────────────────────────────────────────
  {
    id: 'native_veg', name: 'Native Vegetation', group: 'Environment',
    type: 'wms', url: DV, layers: 'DEECA:NATIVE_VEGETATION',
    opacity: 0.6, defaultOn: false, minZoom: 11,
    desc: 'Native vegetation extent — DEECA (layer name TBC)',
  },

  // ── TRANSPORT ─────────────────────────────────────────────
  {
    id: 'roads', name: 'Roads', group: 'Transport',
    type: 'wms', url: DV, layers: 'VMTRANS:ROAD',
    opacity: 0.7, defaultOn: false, minZoom: 12,
    desc: 'Road network — Vicmap Transport',
  },
  {
    id: 'pt_stops', name: 'PT Stops', group: 'Transport',
    type: 'wms', url: DV, layers: 'VMTRANS:STOP',
    opacity: 0.9, defaultOn: false, minZoom: 13,
    desc: 'Train, tram & bus stops — Vicmap Transport / PTV',
  },
  {
    id: 'bike_paths', name: 'Bike Paths & Trails', group: 'Transport',
    type: 'wms', url: DV, layers: 'VMTRANS:TRACK',
    opacity: 0.8, defaultOn: false, minZoom: 12,
    desc: 'Cycling infrastructure — Vicmap Transport',
  },

  // ── TERRAIN ───────────────────────────────────────────────
  {
    id: 'contours', name: 'Contours / Elevation', group: 'Terrain',
    type: 'wms', url: DV, layers: 'VMELEV:CONTOUR',
    opacity: 0.7, defaultOn: false, minZoom: 13,
    desc: 'Elevation contours — Vicmap Elevation',
  },

]; // END LAYER_CONFIG
