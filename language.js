const atlasLabels = {
  "Filtri rapidi": "Quick filters",
  "Con foto": "With photos",
  "Preferiti": "Favorites",
  "Trovati": "Found",
  "Info atlante": "About the atlas",
  "Esplora la mappa interattiva di GTA VI.": "Explore the interactive GTA VI map.",
  "Esplora gli spot": "Explore locations",
  "Cerca uno spot": "Search locations",
  "Categorie": "Categories",
  "Stile mappa": "Map style",
  "Strumenti mappa": "Map tools",
  "Zone e città": "Regions and cities",
  "Misura distanza": "Measure distance",
  "Spot casuale": "Random location",
  "Crea nuovo spot": "Add a location",
  "Mappa di Leonida": "Leonida map",
  "Espandi la mappa": "Expand map",
  "Cerca sulla mappa": "Search the map",
  "Annulla ultimo punto": "Undo last point",
  "Termina strumento": "Exit tool",
  "Controlli zoom": "Zoom controls",
  "Riduci zoom": "Zoom out",
  "Livello di zoom": "Zoom level",
  "Aumenta zoom": "Zoom in",
  "Centra la mappa": "Recenter map",
  "TROVATI": "FOUND",
  "Chiudi": "Close",
  "Cartografia": "Cartography",
  "Crediti e fonti": "Credits and sources",
  "Mappa interattiva di GTA 6 – Leonida Sosa | ERACLE": "Interactive GTA 6 Map – Leonida Sosa | ERACLE"
};
function savedLanguage(storage, key) {
  try { return window[storage].getItem(key); } catch { return null; }
}
function saveLanguage(storage, key, value) {
  try { window[storage].setItem(key, value); } catch { /* Storage is optional. */ }
}
const requestedLanguage = new URL(location.href).searchParams.get('lang');
const validLanguage = value => value === 'it' || value === 'en';
const preference = savedLanguage('localStorage','atlasLanguage');
const country = savedLanguage('sessionStorage','atlasCountry');
const browserDefault = /^it(?:-|$)/i.test(navigator.language) ? 'it' : 'en';
const atlasLanguage = validLanguage(requestedLanguage) ? requestedLanguage : validLanguage(preference) ? preference : country ? (country === 'IT' ? 'it' : 'en') : browserDefault;
document.documentElement.lang = atlasLanguage;
const atlasNumbers = new Intl.NumberFormat(atlasLanguage === 'it' ? 'it-IT' : 'en-US',{useGrouping:true});
function atlasText(it, en) { return atlasLanguage === 'en' ? en : it; }
if (atlasLanguage === 'en') {
  function translate(value) {
    const trimmed = value.trim();
    return trimmed && atlasLabels[trimmed] ? value.replace(trimmed,atlasLabels[trimmed]) : value;
  }
  const walker = document.createTreeWalker(document.documentElement, NodeFilter.SHOW_TEXT);
  while (walker.nextNode()) {
    const node = walker.currentNode;
    if (node.parentElement.matches('script,style')) continue;
    node.nodeValue = node.nodeValue.trim() === 'Cerca uno spot…' ? 'Search locations…' : translate(node.nodeValue);
  }
  for (const attr of ['aria-label','data-tip','title','placeholder']) {
    for (const el of document.querySelectorAll('['+attr+']')) {
      const value = el.getAttribute(attr);
      el.setAttribute(attr,value === 'Cerca uno spot…' ? 'Search locations…' : translate(value));
    }
  }
}
const languagePicker = document.getElementById('language');
languagePicker.value = atlasLanguage;
languagePicker.onchange = () => {
  saveLanguage('localStorage','atlasLanguage',languagePicker.value);
  const url = new URL(location.href);
  url.searchParams.set('lang',languagePicker.value);
  location.replace(url);
};
if (!validLanguage(requestedLanguage) && !validLanguage(preference) && !country) {
  fetch('https://api.country.is/', {credentials:'omit',referrerPolicy:'no-referrer',signal:AbortSignal.timeout(2500)})
    .then(response => response.ok ? response.json() : null)
    .then(result => {
      if (!/^[A-Z]{2}$/.test(result?.country || '')) return;
      saveLanguage('sessionStorage','atlasCountry',result.country);
      if (savedLanguage('sessionStorage','atlasCountry') !== result.country || validLanguage(savedLanguage('localStorage','atlasLanguage'))) return;
      if ((result.country === 'IT' ? 'it' : 'en') !== atlasLanguage) location.reload();
    }).catch(() => {});
}
