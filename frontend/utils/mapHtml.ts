import type { Place } from '../data/places';
import type { Language } from '../contexts/LanguageContext';

/** Leaflet from a CDN, pinned with Subresource Integrity. */
const LEAFLET_CSS = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
const LEAFLET_CSS_SRI = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
const LEAFLET_JS = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
const LEAFLET_JS_SRI = 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=';

export interface MapOptions {
  places: Place[];
  language: Language;
  user?: { latitude: number; longitude: number } | null;
  dark: boolean;
  colors: { primary: string; ritual: string; history: string; user: string; text: string; surface: string };
  labels: { directions: string; you: string };
}

/** Messages posted by the map page to the app. */
export type MapMessage = { type: 'directions'; id: string } | { type: 'offline' };

/** JSON safe to embed in a <script> element. */
const toScript = (value: unknown) =>
  JSON.stringify(value).replace(/</g, '\\u003c').replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');

/** The places that can be drawn on the map (landmarks with coordinates). */
export const mappable = (places: Place[]) =>
  places.filter((p) => typeof p.lat === 'number' && typeof p.lng === 'number');

/** Parses a message from the map page, ignoring anything unexpected. */
export function parseMapMessage(data: unknown): MapMessage | null {
  if (typeof data !== 'string') return null;
  try {
    const message = JSON.parse(data);
    if (message?.type === 'offline') return { type: 'offline' };
    if (message?.type === 'directions' && typeof message.id === 'string') return { type: 'directions', id: message.id };
  } catch {
    // Not one of ours.
  }
  return null;
}

/**
 * A self-contained page showing the places on an OpenStreetMap map with Leaflet.
 * Tapping "Directions" in a popup posts {type: 'directions', id} to the app
 * (react-native-webview on Android, the parent window on the web).
 */
export function buildMapHtml({ places, language, user, dark, colors, labels }: MapOptions): string {
  const data = {
    places: mappable(places).map((p) => ({
      id: p.id,
      lat: p.lat,
      lng: p.lng,
      kind: p.kind,
      name: p.name[language],
      description: p.description[language],
    })),
    user: user ? [user.latitude, user.longitude] : null,
    colors,
    labels,
    rtl: language === 'ar',
  };
  return `<!DOCTYPE html>
<html lang="${language}" dir="${language === 'ar' ? 'rtl' : 'ltr'}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">
<link rel="stylesheet" href="${LEAFLET_CSS}" integrity="${LEAFLET_CSS_SRI}" crossorigin="">
<style>
  html, body, #map { height: 100%; margin: 0; background: ${colors.surface}; }
  body { font-family: -apple-system, Roboto, "Noto Sans Arabic", sans-serif; }
  ${dark ? '.leaflet-tile-pane { filter: invert(1) hue-rotate(180deg) brightness(0.9) contrast(0.9); }' : ''}
  .leaflet-popup-content-wrapper, .leaflet-popup-tip { background: ${colors.surface}; color: ${colors.text}; }
  .leaflet-popup-content { margin: 12px 14px; }
  .leaflet-popup-content h3 { margin: 0 0 4px; font-size: 15px; }
  .leaflet-popup-content p { margin: 0 0 8px; font-size: 13px; line-height: 1.4; }
  .go { border: 0; border-radius: 16px; padding: 6px 14px; font-weight: 700; font-size: 13px;
        background: ${colors.primary}; color: #fff; }
</style>
</head>
<body>
<div id="map"></div>
<script>
  function post(message) {
    var text = JSON.stringify(message);
    if (window.ReactNativeWebView) window.ReactNativeWebView.postMessage(text);
    else if (window.parent !== window) window.parent.postMessage(text, '*');
  }
  function offline() { post({ type: 'offline' }); }
</script>
<script src="${LEAFLET_JS}" integrity="${LEAFLET_JS_SRI}" crossorigin="" onerror="offline()"></script>
<script>
(function () {
  if (typeof L === 'undefined') return offline();
  var data = ${toScript(data)};
  var map = L.map('map', { zoomControl: true, attributionControl: true });
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  }).addTo(map);

  function el(tag, text, className) {
    var node = document.createElement(tag);
    if (text) node.textContent = text;
    if (className) node.className = className;
    return node;
  }
  var colorOf = { ritual: data.colors.ritual, history: data.colors.history };
  var bounds = [];
  data.places.forEach(function (p) {
    var popup = el('div');
    popup.dir = data.rtl ? 'rtl' : 'ltr';
    popup.appendChild(el('h3', p.name));
    popup.appendChild(el('p', p.description));
    var go = el('button', data.labels.directions, 'go');
    go.onclick = function () { post({ type: 'directions', id: p.id }); };
    popup.appendChild(go);
    L.circleMarker([p.lat, p.lng], {
      radius: 9, weight: 3, color: '#fff', fillColor: colorOf[p.kind] || data.colors.primary, fillOpacity: 1
    }).bindPopup(popup).bindTooltip(p.name, { direction: 'top', offset: [0, -8] }).addTo(map);
    bounds.push([p.lat, p.lng]);
  });
  if (data.user) {
    L.circleMarker(data.user, { radius: 8, weight: 3, color: '#fff', fillColor: data.colors.user, fillOpacity: 1 })
      .bindTooltip(data.labels.you).addTo(map);
  }
  if (bounds.length) map.fitBounds(bounds, { padding: [30, 30], maxZoom: 15 });
  else map.setView([21.4225, 39.8262], 13);
})();
</script>
</body>
</html>`;
}
