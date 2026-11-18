'use strict';
const paths={map:'m3 5 6-2 6 2 6-2v16l-6 2-6-2-6 2z M9 3v16 M15 5v16',grid:'M3 3h7v7H3z M14 3h7v7h-7z M3 14h7v7H3z M14 14h7v7h-7z',bookmark:'M6 3h12v18l-6-4-6 4z',info:'M12 2a10 10 0 1 0 .01 0 M12 10v6 M12 7h.01',search:'M10 3a7 7 0 1 0 .01 0 M15 15l6 6',sliders:'M3 7h7m4 0h7M3 17h11m4 0h3M10 4v6m6 4v6',layers:'m2 8 10-5 10 5-10 5z M2 12l10 5 10-5 M2 16l10 5 10-5',sun:'M3 17h18M5 14a7 7 0 0 1 14 0M12 2v3M3 6l2 2m16-2-2 2M6 21h12',moon:'M20 14a9 9 0 0 1-11-11A9.5 9.5 0 1 0 20 14z',expand:'M8 3H3v5m13-5h5v5M3 16v5h5m13-5v5h-5',target:'M12 4a8 8 0 1 0 .01 0 M12 1v5m0 12v5M1 12h5m12 0h5 M12 10a2 2 0 1 0 .01 0',x:'m6 6 12 12M18 6 6 18',arrow:'M5 17 18 4M7 4h11v11',pin:'M12 22s8-8 8-13a8 8 0 1 0-16 0c0 5 8 13 8 13z M12 6a3 3 0 1 0 .01 0',building:'M3 21h18M5 21V6l9-3v18m0-11h5v11M8 8h2m-2 4h2m-2 4h2',door:'M3 21h18M6 21V4l10-2v19m0-16h3v16M12 12h.01',bag:'M4 8h16l1 13H3zM8 8V6a4 4 0 0 1 8 0v2',film:'M3 7h18v14H3zM3 7l-1-4 18-3 1 4zM8 2l3 4m3-5 3 4',plane:'m2 14 8-3 6-8 3 1-4 8 6 5-1 2-8-3-4 5-2-1 2-6z',bed:'M3 18V6m18 15v-8H3m0 5h18M6 9h3v4H6zm6-1h6l3 5',glass:'M3 3h18l-9 10zM12 13v7m-5 1h10',camera:'M2 7h5l2-3h6l2 3h5v13H2z M12 9a4 4 0 1 0 .01 0',eye:'M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7z M12 9a3 3 0 1 0 .01 0',next:'m9 5 7 7-7 7',dots:'M4 12h1m6 0h1m6 0h1'};
Object.assign(paths,{star:'m12 2 3 6.5 7 1-5 5 1 7-6-3.4-6 3.4 1-7-5-5 7-1z',tick:'M12 2a10 10 0 1 0 .01 0 M7 12l3 3 7-7',ruler:'m2 8 6-6 14 14-6 6z M7 7l2-2m2 6 2-2m2 6 2-2',navigation:'m3 10 18-7-7 18-3-8z',pinplus:'M13 21s-9-8-9-13a7 7 0 1 1 14 0 M11 6a2 2 0 1 0 .01 0 M18 13v8m-4-4h8',spark:'m12 4 1.8 6.2L20 12l-6.2 1.8L12 20l-1.8-6.2L4 12l6.2-1.8z M20 2v4m-2-2h4',copy:'M8 8h12v13H8z M5 16H3V3h12v2'});
const icon=k=>'<svg aria-hidden="true" viewBox="0 0 24 24"><path d="'+paths[k]+'"/></svg>';
document.querySelectorAll('[data-i]').forEach(el=>el.outerHTML=icon(el.dataset.i));
const $=id=>document.getElementById(id), spots=window.VICE_ATLAS_SPOTS, fmt=n=>atlasNumbers.format(n);
const meta={all:[atlasText('Tutti gli spot', 'All locations'),'layers','#ffa989'],landmark:[atlasText('Landmark ed edifici', 'Landmarks and buildings'),'building','#f6a5c2'],enterable:[atlasText('Interni esplorabili', 'Enterable interiors'),'door','#f8a675'],shop:[atlasText('Negozi e armi', 'Shops and weapons'),'bag','#a6e0c8'],transit:[atlasText('Trasporti e ponti', 'Transport and bridges'),'plane','#8ecfe5'],hotel:[atlasText('Hotel e resort', 'Hotels and resorts'),'bed','#f0b5df'],nightlife:[atlasText('Nightlife e club', 'Nightlife and clubs'),'glass','#de9de4'],trailer:[atlasText('Spot dei trailer', 'Trailer locations'),'film','#f5aa9d'],screenshot:[atlasText('Screenshot Rockstar', 'Rockstar screenshots'),'camera','#eac989'],leak:[atlasText('Avvistamenti', 'Sightings'),'eye','#cab4e7']};

const TELEPORT_REGIONS = [
        { id: 'ocean_beach', name: 'Ocean Beach & Ocean Drive', sub: atlasText('Art Deco District, Hotel & Neon', 'Art Deco district, hotels and neon'), emoji: '🌴', lat: 699, lng: 1744, zoom: 5 },
        { id: 'vice_beach', name: 'Vice Beach & Washington', sub: atlasText('Spiagge Tropicali & Resort', 'Tropical beaches and resorts'), emoji: '🏖️', lat: 1450, lng: 1700, zoom: 5 },
        { id: 'downtown', name: 'Downtown Vice City', sub: atlasText('Grattacieli, Finanza & Autostrade', 'Skyscrapers, finance and highways'), emoji: '🏙️', lat: -102, lng: -662, zoom: 5 },
        { id: 'crosstown', name: 'Crosstown & Little Haiti', sub: atlasText('Cuore Urbano di Vice City', 'Urban heart of Vice City'), emoji: '🌺', lat: 1157, lng: -636, zoom: 5 },
        { id: 'vcia', name: 'Vice City Int. Airport (VCIA)', sub: atlasText('Terminal Aerei & Hangar', 'Airport terminals and hangars'), emoji: '✈️', lat: -706, lng: -2330, zoom: 5 },
        { id: 'leonida_keys', name: 'Leonida Keys & Key Lento', sub: atlasText('Arcipelago Tropicale & Ponti sul Mare', 'Tropical islands and ocean bridges'), emoji: '🏝️', lat: -5893, lng: -2508, zoom: 4 },
        { id: 'grassrivers', name: 'Grassrivers (Everglades)', sub: atlasText('Paludi, Airboat & Alligatori', 'Wetlands, airboats and alligators'), emoji: '🐊', lat: -4502, lng: -3477, zoom: 4 },
        { id: 'port_gellhorn', name: 'Port Gellhorn', sub: atlasText('Costa Ovest, Motel, Circuito & Porto', 'West coast, motels, racetrack and port'), emoji: '⚓', lat: 3669, lng: -6549, zoom: 4 },
        { id: 'raceway', name: 'Gellhorn Int. Raceway', sub: atlasText('Autodromo & Pista da Corsa', 'Speedway and racing circuit'), emoji: '🏎️', lat: 1983, lng: -6462, zoom: 5 },
        { id: 'ambrosia', name: 'Lake Leonida & Ambrosia', sub: atlasText('Grande Lago Centrale & Colline', 'Central lake and rolling hills'), emoji: '🌅', lat: 3981, lng: -2785, zoom: 4 },
        { id: 'hamlet', name: 'Hamlet & Homestead', sub: atlasText('Sud Leonida & Campi Agricoli', 'Southern Leonida and farmland'), emoji: '🌾', lat: -3193, lng: -2691, zoom: 4 }
    ];
meta.custom=[atlasText('Spot personali', 'Personal locations'),'pinplus','#ff97ca'];
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const txt=s=>String(s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
function readList(key){try{const a=JSON.parse(localStorage.getItem(key)||'[]');return Array.isArray(a)?a:[]}catch{return []}}
function persist(key,value){try{localStorage.setItem(key,JSON.stringify(value));return true}catch{toast(atlasText('Memoria locale non disponibile', 'Local storage unavailable'));return false}}
const saveIds=new Set(readList('atlasBookmarks')),foundIds=new Set(readList('atlasFound'));
const personal=readList('atlasCustomSpots').filter(s=>s?.category==='custom'&&Number.isFinite(s.lng)&&Number.isFinite(s.lat));
const records=[...spots,...personal], index=new Map(),counts={all:0};
meta.sport=[atlasText('Impianti sportivi', 'Sports venues'),'target','#a3e3b4'];
const categoryKeys=['landmark','enterable','hotel','nightlife','shop','trailer','screenshot','transit','sport','leak'];
const sportTags=new Set(['#tennis','#volleyball','#golf','#gym','#racetrack']);
const recordCategory=new Map();
let activeCategories=new Set(categoryKeys);
function indexSpot(s){
  const category=s.tags?.some(t=>sportTags.has(t))?'sport':s.category;
  recordCategory.set(s.id,category);
  index.set(s.id,txt([s.title,s.id,s.district,s.rlAddress,...(s.tags||[])].join(' ')));
  counts.all++;counts[category]=(counts[category]||0)+1;
}
records.forEach(indexSpot);
let scope='',selected=null,current=[],limit=35,exploring=false,theme='sunset',toastTimer,mode='',points=[];
try{if(localStorage.atlasTheme==='night')theme='night'}catch{}
const validPhoto=s=>AtlasPhotos.hasPhotos(s);
function categories(){
  const keys=['all',...categoryKeys];
  $('categories').innerHTML=keys.map(k=>{
    const [name,ic,color]=meta[k];
    const on=k==='all'?activeCategories.size===categoryKeys.length:activeCategories.has(k);
    return '<button data-cat="'+k+'" style="--c:'+color+'" class="cat '+(on?'active':'')+'" aria-pressed="'+on+'"><span class="ico">'+icon(ic)+'</span><strong>'+name+'</strong><span class="count">'+fmt(counts[k]||0)+'</span><span class="catCheck" aria-hidden="true">'+(on?'✓':'')+'</span></button>';
  }).join('');
}
function toggleCategory(k){
  if(k==='all')activeCategories=activeCategories.size===categoryKeys.length?new Set():new Set(categoryKeys);
  else if(activeCategories.has(k))activeCategories.delete(k);
  else activeCategories.add(k);
}
function modal(title,html){$('modalTitle').textContent=title;$('modalBody').innerHTML=html;if(!$('modal').open)$('modal').showModal()}
function restoreSearch(){const field=$('query')?.closest('.search');if(field&&$('drawerBody').contains(field))document.querySelector('.explorehead').after(field)}
function hideDrawer(){restoreSearch();window.fromLens=false;selected=null;exploring=false;$('drawer').hidden=true}
function searchTerm(){return txt($('query').value.trim()).replace(/^#/,'').trim()}
function relevance(s,q){
  const name=txt(s.title), district=txt(s.district);
  if(txt(s.id)===q)return 0;
  if(name===q)return 1;
  if(name.startsWith(q))return 2;
  if(name.includes(q))return 3;
  if(district===q)return 4;
  if(district.includes(q))return 5;
  return 6;
}
function refresh(){
  const query=searchTerm();
  current=records.filter(s=>(activeCategories.has(recordCategory.get(s.id))||s.category==='custom'&&(activeCategories.size===categoryKeys.length||scope==='saved'&&activeCategories.size>0))&&(!query||index.get(s.id).includes(query))&&
    (!scope||scope==='photo'&&validPhoto(s)||scope==='saved'&&saveIds.has(s.id)||scope==='found'&&foundIds.has(s.id)));
  if(query){
    const exact=current.find(s=>txt(s.id)===query);
    current=exact?[exact]:current.map(s=>({s,rank:relevance(s,query)})).sort((a,b)=>a.rank-b.rank).map(hit=>hit.s);
  }
  AtlasMap.setSpots(current);$('visible').textContent=fmt(current.length)+atlasText(' spot attivi', ' active locations');$('foundCount').textContent=foundIds.size+' / '+fmt(records.length);categories();
  document.querySelectorAll('[data-scope]').forEach(b=>{const on=scope===b.dataset.scope;b.classList.toggle('active',on);b.setAttribute('aria-pressed',on)});
  if(selected&&!current.includes(selected))selected=null;
  if(selected)detail(selected);else if(exploring)list();else hideDrawer();
}
function showDrawer(title,type){if(panel.classList.contains('floatingPanel'))closeExplorer();$('drawer').hidden=false;$('drawer').className=type;$('drawerTitle').textContent=title}
function list(){
  showDrawer(({saved:atlasText('Preferiti', 'Favorites'),found:atlasText('Trovati', 'Found'),photo:atlasText('Con foto', 'With photos')})[scope]||atlasText('Esplora gli spot', 'Explore locations'),'results');
  const area=$('drawerBody');
  const shared=document.querySelector('.panel .search')||document.querySelector('#drawerBody .search');
  if(shared && area.contains(shared))document.querySelector('.explorehead').after(shared);
  area.innerHTML='<div class="resultCount">'+fmt(current.length)+atlasText(' spot</div><div id="resultRows"></div>', ' locations</div><div id="resultRows"></div>');
  if(scope||document.body.classList.contains('fullMap')||window.fromLens)area.prepend(shared);
  const term=searchTerm();
  const zones=term&&!scope?TELEPORT_REGIONS.filter(r=>txt(r.name).includes(term)):[];
  if(zones.length){
    const group=document.createElement('div');
    group.className='searchZones';
    group.innerHTML=zones.map(r=>'<button class="row" data-region="'+r.id+'">'+icon('navigation')+'<span>'+esc(r.name)+atlasText('<small>Zona · Inquadra sulla mappa</small></span>', '<small>Region · Show on map</small></span>')+icon('next')+'</button>').join('');
    area.querySelector('.resultCount').before(group);
  }
  const rows=$('resultRows');
  function page(start){rows.querySelector('.more')?.remove();rows.insertAdjacentHTML('beforeend',current.slice(start,limit).map(s=>'<button class="row" data-spot="'+esc(s.id)+'" style="--c:'+meta[s.category][2]+'">'+icon(meta[s.category][1])+'<span>'+esc(s.title)+'<small>'+esc(s.district||'Leonida')+' · #'+esc(s.id)+'</small></span>'+icon('next')+'</button>').join(''));if(current.length>limit){const more=document.createElement('button');more.className='action more';more.textContent=atlasText('Altri risultati', 'More results');more.onclick=()=>{const start=limit;limit+=35;page(start)};rows.append(more)}}
  page(0);if(matchMedia('(max-width:680px)').matches)$('drawer').scrollTop=$('drawer').scrollHeight;
  if(!current.length)rows.innerHTML='<p class="empty">'+(scope==='saved'?atlasText('Tocca la stella in una scheda per aggiungere uno spot ai preferiti.', 'Tap the star on a location card to add it to your favorites.'):scope==='found'?atlasText('Segna uno spot come trovato dalla sua scheda.', 'Mark a location as found on its card.'):atlasText('Nessuno spot corrisponde ai filtri scelti.', 'No locations match these filters.'))+'</p>';
}
function toggleMembership(s,ids,key){const next=new Set(ids);if(next.has(s.id))next.delete(s.id);else next.add(s.id);if(!persist(key,[...next]))return;ids.clear();next.forEach(id=>ids.add(id));refresh()}
function detailsAction(id,label,glyph,on){return '<button id="'+id+'" aria-pressed="'+on+'">'+icon(glyph)+' '+label+'</button>'}
function detail(s){restoreSearch();
  selected=s;showDrawer(s.title,'spotCard');const [category,ic,color]=meta[s.category], coord='X: '+s.lng+', Y: '+s.lat;
  const hasCoords=Array.isArray(s.rlCoords)&&s.rlCoords.length===2&&s.rlCoords.every(Number.isFinite);
  const street=hasCoords?'https://www.google.com/maps/@?api=1&map_action=pano&viewpoint='+encodeURIComponent(s.rlCoords.join(',')):'';
  const maps=s.rlAddress?'https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(s.rlAddress):'';
  $('drawerBody').innerHTML='<div class="mediaWrap"><div id="gallery"></div><div class="badges"><span style="--badge:'+color+'">'+icon(ic)+esc(category)+'</span><span>#'+esc(s.id)+'</span></div></div><div class="spotDetails"><div class="label">'+esc(s.district||'Leonida')+'</div><h3>'+esc(s.title)+'</h3><div class="tags">'+(s.tags||[]).map(t=>'<span>'+esc(t)+'</span>').join('')+atlasText('</div><div class="facts"><button id="copyCoords" title="Copia coordinate"><small>Coordinate in-game</small><span>', '</div><div class="facts"><button id="copyCoords" title="Copy coordinates"><small>In-game coordinates</small><span>')+esc(coord)+'</span>'+icon('copy')+atlasText('</button><div><small>Fonte mapping</small><span>', '</button><div><small>Mapping source</small><span>')+esc(s.source==='Spot personale'?atlasText('Spot personale','Personal location'):s.source||'GTADB / Yanis V17')+'</span></div></div>'+
  (street||maps?atlasText('<div class="counterpart"><small>Controparte reale · Florida</small>', '<div class="counterpart"><small>Real-world counterpart · Florida</small>')+esc(s.rlAddress||s.rlCoords.join(', '))+'<a target="_blank" rel="noopener" href="'+esc(street||maps)+'">'+(street?atlasText('Apri in Google Street View', 'Open in Google Street View'):atlasText('Cerca in Google Maps', 'Search Google Maps'))+' ↗</a></div>':'')+
  '<div class="spotActions">'+detailsAction('starSpot',atlasText('Preferito', 'Favorite'),'star',saveIds.has(s.id))+detailsAction('foundSpot',atlasText('Trovato', 'Found'),'tick',foundIds.has(s.id))+'<button id="zoomSpot">'+icon('target')+' Zoom</button></div></div>';
  mountGallery(s);
  $('starSpot').onclick=()=>toggleMembership(s,saveIds,'atlasBookmarks');$('foundSpot').onclick=()=>toggleMembership(s,foundIds,'atlasFound');
  $('zoomSpot').onclick=()=>goSpot(s);
  $('copyCoords').onclick=async()=>{try{await navigator.clipboard.writeText(coord);toast(atlasText('Coordinate copiate', 'Coordinates copied'))}catch{modal(atlasText('Copia coordinate', 'Copy coordinates'),'<input class="field" readonly id="manualCoords">');$('manualCoords').value=coord;$('manualCoords').select()}};
}
function goSpot(s){hideDrawer();AtlasMap.focus(s);revealMap()}
function revealMap(){if(matchMedia('(max-width:680px)').matches&&!$('mapframe').classList.contains('expanded'))$('mapframe').scrollIntoView({block:'start',behavior:'instant'})}
function setTheme(t){theme=t;document.body.classList.toggle('night',t==='night');document.querySelectorAll('[data-theme]').forEach(b=>{b.classList.toggle('selected',b.dataset.theme===t);b.setAttribute('aria-pressed',b.dataset.theme===t)});AtlasMap.theme(t);try{localStorage.atlasTheme=t}catch{}}
function info(){modal(atlasText('Crediti e fonti', 'Credits and sources'),atlasText('<p>Leonida Sosa raccoglie i ', '<p>Leonida Sosa features ')+fmt(spots.length)+atlasText(' spot del progetto ERACLE. La cartografia Yanis V18 è una ricostruzione della community. Le posizioni possono essere approssimative.</p><p><a href="https://map.gtadb.org" target="_blank" rel="noopener">Yanis V18 · GTADB e collaboratori ↗</a><br><a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noopener">CC BY 4.0 ↗</a> · Cartografia ritagliata e ricolorata.</p><p><a href="https://edrcole.github.io/gtavimap/" target="_blank" rel="noopener">Atlante originale di ERACLE ↗</a></p><p>GTA VI e il logo appartengono a Rockstar Games. Sfondi fotografici da Unsplash.</p>', ' locations from the ERACLE project. Yanis V18 is a community reconstruction. Locations may be approximate.</p><p><a href="https://map.gtadb.org" target="_blank" rel="noopener">Yanis V18 · GTADB and contributors ↗</a><br><a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noopener">CC BY 4.0 ↗</a> · Map cropped and recolored.</p><p><a href="https://edrcole.github.io/gtavimap/" target="_blank" rel="noopener">Original ERACLE atlas ↗</a></p><p>GTA VI and its logo belong to Rockstar Games. Background photography from Unsplash.</p>'))}
function toast(msg){$('toast').textContent=msg;$('toast').classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('toast').classList.remove('show'),3800)}
function mountGallery(s){AtlasPhotos.mount($('gallery'),s,()=>goSpot(s))}
function stopTool(){mode='';points=[];AtlasMap.setPickHandler(null);AtlasMap.setRuler([]);$('toolBanner').hidden=true;document.querySelectorAll('[data-tool]').forEach(b=>b.classList.remove('using'))}
function measure(){
  AtlasMap.setRuler(points);
  const meters=points.reduce((sum,p,i)=>i?sum+Math.hypot(p.lat-points[i-1].lat,p.lng-points[i-1].lng):0,0);
  $('toolText').textContent=points.length>1?'≈ '+(meters/1000).toLocaleString(document.documentElement.lang,{minimumFractionDigits:2,maximumFractionDigits:2})+' km · '+points.length+atlasText(' punti', ' points'):points.length?atlasText('Tocca il punto di arrivo', 'Tap the end point'):atlasText('Tocca il primo punto sulla mappa', 'Tap the first point on the map');
  $('undo').hidden=!points.length;
}
function newSpot(point){
  stopTool();
  modal(atlasText('Crea nuovo spot', 'Add a location'),atlasText('<form id="newForm"><label class="formLabel">Nome dello spot<input class="field" id="spotName" required maxlength="100" placeholder="Es. Tramonto sul porto"></label><label class="formLabel">Zona o città<input class="field" id="spotZone" maxlength="100" placeholder="Facoltativo"></label><p class="coordsLine">X ', '<form id="newForm"><label class="formLabel">Location name<input class="field" id="spotName" required maxlength="100" placeholder="e.g. Sunset at the harbor"></label><label class="formLabel">Region or city<input class="field" id="spotZone" maxlength="100" placeholder="Optional"></label><p class="coordsLine">X ')+point.lng.toFixed(2)+' · Y '+point.lat.toFixed(2)+atlasText('</p><button class="cta">Aggiungi alla mappa</button></form>', '</p><button class="cta">Add to map</button></form>'));
  $('spotName').focus();$('newForm').onsubmit=e=>{e.preventDefault();const title=$('spotName').value.trim();if(!title){$('spotName').focus();return}
    const s={id:'P-'+crypto.randomUUID(),category:'custom',title,district:$('spotZone').value.trim()||'Leonida',tags:[],source:atlasText('Spot personale', 'Personal location'),lng:+point.lng.toFixed(2),lat:+point.lat.toFixed(2)};
    if(!persist('atlasCustomSpots',[...personal,s]))return;personal.push(s);saveIds.add(s.id);persist('atlasBookmarks',[...saveIds]);records.push(s);indexSpot(s);$('modal').close();activeCategories=new Set(categoryKeys);scope='';$('query').value='';exploring=false;selected=s;refresh();AtlasMap.focus(s);toast(atlasText('Spot personale aggiunto', 'Personal location added'))};
}
function startTool(tool){
  const was=mode;stopTool();if(was===tool)return;
  if(tool==='zones'){modal(atlasText('Zone e città', 'Regions and cities'),TELEPORT_REGIONS.map((r,i)=>'<button class="zone" data-zone="'+i+'"><span>'+r.emoji+'</span><span>'+esc(r.name)+'<small>'+esc(r.sub)+'</small></span>'+icon('next')+'</button>').join(''));return}
  if(tool==='random'){if(!current.length){toast(atlasText('Nessuno spot tra i filtri attivi', 'No locations match the active filters'));return}const s=current[Math.floor(Math.random()*current.length)];AtlasMap.focus(s);detail(s);revealMap();return}
  hideDrawer();mode=tool;revealMap();$('toolBanner').hidden=false;document.querySelector('[data-tool="'+tool+'"]').classList.add('using');
  if(tool==='ruler'){measure();AtlasMap.setPickHandler(p=>{points.push(p);measure()})}else{$('undo').hidden=true;$('toolText').textContent=atlasText('Tocca la posizione del nuovo spot', 'Tap the map to place your location');AtlasMap.setPickHandler(newSpot)}
}
function updateSearch(value){$('query').value=value;if(txt(value)==='hesoyam'){toast(atlasText('✦ HESOYAM · Bonus Vice City sbloccato', '✦ HESOYAM · Vice City bonus unlocked'));$('query').value='';setTheme(theme==='night'?'sunset':'night')}selected=null;limit=35;exploring=true;const typing=document.activeElement===$('query');refresh();if(typing)$('query').focus({preventScroll:true})}
$('query').oninput=e=>updateSearch(e.target.value);
$('query').onfocus=()=>{
  const floating=panel.classList.contains('floatingPanel');
  if(!exploring||selected||floating){selected=null;exploring=true;refresh()}
  if(floating)$('query').focus({preventScroll:true});
};
const panel=document.querySelector('.panel');
const panelHome=document.createComment('explorer');
panel.before(panelHome);
function closeExplorer(){panelHome.after(panel);panel.classList.remove('floatingPanel')}
function openExplorer(){
  if(panel.classList.contains('floatingPanel')){closeExplorer();return}
  hideDrawer();$('mapframe').append(panel);panel.classList.add('floatingPanel');
}
$('mobileSearch').onclick=()=>{if($('mapframe').classList.contains('expanded')){openExplorer();return}stopTool();window.fromLens=true;exploring=true;selected=null;list();$('query').focus({preventScroll:true})};
const privacyButton = document.createElement('button');
privacyButton.type = 'button';
privacyButton.textContent = atlasText('Privacy e cookie', 'Privacy and cookies');
privacyButton.setAttribute('aria-haspopup', 'dialog');
privacyButton.onclick = () => modal(privacyButton.textContent, atlasText(
  '<p><strong>Sul tuo dispositivo</strong><br>Il browser ricorda preferiti, luoghi trovati, spot personali, lingua e stile della mappa. Le ricerche filtrano gli spot mentre scrivi. Puoi cancellare i salvataggi eliminando i dati di questo sito nel browser.</p><p><strong>Quando apri la mappa</strong><br>GitHub Pages ospita il sito e registra l’indirizzo IP per sicurezza. Se la lingua è da determinare, country.is riceve l’IP per stimare il Paese. Il browser conserva il codice del Paese per la sessione.</p><p><strong>Mappe e foto</strong><br>Per mostrare l’area che esplori, il browser richiede le immagini della mappa al servizio GitHub (raw.githubusercontent.com). Quando carica foto esterne, contatta anche i rispettivi fornitori. Questi servizi ricevono l’indirizzo IP e la richiesta dell’immagine.</p>',
  '<p><strong>On your device</strong><br>Your browser remembers favorites, found locations, personal spots, language and map style. Searches filter locations as you type. You can erase your saved choices by clearing this site’s data in your browser.</p><p><strong>When you open the map</strong><br>GitHub Pages hosts the site and logs IP addresses for security. When the language needs to be determined, country.is receives your IP address to estimate your country. Your browser keeps the country code for the session.</p><p><strong>Maps and photos</strong><br>To show the area you explore, your browser requests map images from GitHub (raw.githubusercontent.com). When it loads external photos it also contacts their providers. These services receive your IP address and the image request.</p>'
));
const footerLinks = document.createElement('div');
footerLinks.className = 'footerLinks';
const creditsButton = $('credits');
creditsButton.replaceWith(footerLinks);
footerLinks.append(creditsButton, privacyButton);

$('closeModal').onclick=()=>$('modal').close();$('info').onclick=$('credits').onclick=info;
$('modal').onclick=e=>{if(e.target===$('modal'))$('modal').close()};
$('undo').onclick=()=>{points.pop();measure()};$('stop').onclick=stopTool;
document.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;
  if(b.dataset.scope){stopTool();scope=scope===b.dataset.scope?'':b.dataset.scope;selected=null;limit=35;exploring=Boolean(scope||$('query').value);refresh()}
  if(b.dataset.cat){stopTool();toggleCategory(b.dataset.cat);selected=null;limit=35;if($('modal').open)$('modal').close();refresh()}
  if(b.dataset.theme)setTheme(b.dataset.theme);if(b.dataset.tool)startTool(b.dataset.tool);
  if(b.dataset.spot){const s=records.find(r=>r.id===b.dataset.spot);if(s){AtlasMap.focus(s);detail(s);$('drawer').scrollTop=0}}
  if(b.dataset.region){
    const region=TELEPORT_REGIONS.find(r=>r.id===b.dataset.region);
    $('query').value='';hideDrawer();refresh();AtlasMap.flyTo(region,region.zoom===5?9:5);revealMap();
  }
  if(b.dataset.zone!==undefined){const r=TELEPORT_REGIONS[+b.dataset.zone];$('modal').close();hideDrawer();AtlasMap.flyTo(r,r.zoom===5?9:5);revealMap()}
});
function closeDrawer(){
  if(scope){scope='';hideDrawer();refresh();return}
  if(selected&&exploring){selected=null;list();return}
  hideDrawer();
}
$('drawerClose').onclick=closeDrawer;
$('plus').onclick=()=>AtlasMap.zoom(1);$('minus').onclick=()=>AtlasMap.zoom(-1);$('reset').onclick=()=>AtlasMap.reset();
function expand(){const el=$('mapframe'),first=el.getBoundingClientRect(),enabled=el.classList.toggle('expanded');
  document.body.classList.toggle('fullMap',enabled);(enabled?el:document.querySelector('aside')).append($('dock'));
  $('expand').setAttribute('aria-label',enabled?atlasText('Riduci la mappa', 'Collapse map'):atlasText('Espandi la mappa', 'Expand map'));AtlasMap.resize();
  const nav=document.querySelector('nav');if(enabled)el.append(nav);else document.querySelector('.headerActions').before(nav);
  if(!enabled){closeExplorer();placeHeading()}
  const last=el.getBoundingClientRect();if(!matchMedia('(prefers-reduced-motion: reduce)').matches)el.animate([{transformOrigin:'top left',transform:'translate('+ (first.x-last.x)+'px,'+(first.y-last.y)+'px) scale('+first.width/last.width+','+first.height/last.height+')'},{transformOrigin:'top left',transform:'none'}],{duration:390,easing:'cubic-bezier(.22,1,.36,1)'});
}
$('expand').onclick=expand;
document.addEventListener('keydown',e=>{if(document.querySelector('dialog[open]'))return;if(e.key==='/'&&!e.target.matches('input,textarea')){e.preventDefault();if(matchMedia('(max-width:680px)').matches)$('mobileSearch').click();else $('query').focus()}if(e.key==='Escape'){if(mode)stopTool();else if(!$('drawer').hidden)closeDrawer();else if($('mapframe').classList.contains('expanded'))expand()}});
let taps=0,last=0;$('logo').onclick=()=>{if(Date.now()-last>1300)taps=0;last=Date.now();if(++taps===5){taps=0;document.body.classList.add('wanted');$('wantedStars').hidden=false;toast(atlasText('Livello ricercato massimo', 'Maximum wanted level'));setTimeout(()=>{document.body.classList.remove('wanted');$('wantedStars').hidden=true},8000)}};
AtlasMap.init($('carto'),detail,()=>{});
AtlasMap.setGPSHandler(({lat,lng,z})=>{
  const coords='X '+Math.round(lng)+' · Y '+Math.round(lat);
  const level='Z'+z.toFixed(1);
  if($('gps').textContent!==coords)$('gps').textContent=coords;
  if($('zoomLevel').textContent!==level)$('zoomLevel').textContent=level;
});
setTheme(theme);refresh();

let mapDown;
$('carto').addEventListener('pointerdown',e=>{mapDown=[e.clientX,e.clientY,selected]},true);
$('carto').addEventListener('pointerup',e=>{
 if(!mapDown||Math.hypot(e.clientX-mapDown[0],e.clientY-mapDown[1])>5)return;
 if(selected!==mapDown[2])return;
 if(panel.classList.contains('floatingPanel'))closeExplorer();
 if(!$('drawer').hidden){scope='';hideDrawer();refresh()}
});
document.addEventListener('pointerdown',e=>{const b=e.target.closest('button');if(b&&!matchMedia('(prefers-reduced-motion:reduce)').matches)b.animate([{scale:'1'},{scale:b.closest('.panel,#drawer,nav')?'1.018':'1.09',offset:.38},{scale:'1'}],{duration:240})},true);

const compactHeading = document.createElement('div');
compactHeading.className = 'mobileHeading';
const hero = document.querySelector('.hero');
const heroHome = document.createComment('titolo');
hero.before(heroHome);
const compactLayout = matchMedia('(max-width:680px)');
function placeHeading(){
  if(compactLayout.matches){
    heroHome.after(compactHeading);
    compactHeading.append(hero);
    if(!document.body.classList.contains('fullMap'))compactHeading.append($('dock'));
  }else{
    heroHome.after(hero);
    if(!document.body.classList.contains('fullMap'))document.querySelector('aside').append($('dock'));
    compactHeading.remove();
  }
}
compactLayout.addEventListener('change',placeHeading);
placeHeading();
