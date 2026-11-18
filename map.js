/* Yanis V17 coordinates are measured in original image pixels (north-up). */
window.AtlasMap = (() => {
  const W = 14550, H = 20000, WEST = -10550, NORTH = 11000;
  const palettes = {landmark:'#ff7e9c', enterable:'#76e0be', shop:'#deb1ff', transit:'#70d9fc', nightlife:'#e78ffa', hotel:'#ff9d81', trailer:'#ffbd78', screenshot:'#ffcf78', leak:'#f990ad'};
  const colorStops = ['#fa91aa','#ffaf76','#86dbc3','#ad9ded'];
  const images = {}, tiles = new Map(), fingers = new Map();
  let host, canvas, ctx, terrainCanvas, terrainContext, ro, select, move, width=0, height=0, frame=0, ratio=1;
  let spots=[], theme='sunset', magnify=1, cx=W/2, cy=H/2, drawn=[], hover, chosen;
  let pickHandler=null, ruler=[], animation=null, districts=[], labelBoxes=[];
  let worldPoints=[], spotSet=new Set(), gpsHandler=null, gpsFrame=0, pointerGPS=null;
  let tileRevision=0, terrainKey='', tilePlanKey='', tileQueue=[], wantedTiles=new Set(), inFlight=0;
  let pulseStart=-Infinity;
  const clusterLevels=new Map(), spriteCache=new Map(), textWidths=new Map();
  let down, dragged=false, multi=false, previousPinch, cycle=0, initialized=false;
  const norm=s=>({x:s.lng-WEST,y:NORTH-s.lat});
  const scale=()=>Math.min(width/W,height/H)*1.04*magnify;
  const view=(x,y)=>({x:(x-cx)*scale()+width/2,y:(y-cy)*scale()+height/2});
  const world=(x,y)=>({x:(x-width/2)/scale()+cx,y:(y-height/2)/scale()+cy});
  const clamp=(v,l,h)=>Math.max(l,Math.min(h,v));
  function redraw(){if(!frame&&canvas)frame=requestAnimationFrame(draw);}
  function preload(key,url) {
    const img=new Image(); img.onload=()=>{tileRevision++;redraw();}; img.src=url; images[key]=img;
  }
  function bounds() {
    const margin=1/scale(); cx=clamp(cx,-width*margin*.16,W+width*margin*.16);
    cy=clamp(cy,-height*margin*.16,H+height*margin*.16);
  }
  function resize() {
    if (!host)return;
    const nextRatio=Math.min(2,window.devicePixelRatio||1);
    if(host.clientWidth===width&&host.clientHeight===height&&nextRatio===ratio)return;
    width=host.clientWidth;height=host.clientHeight;ratio=nextRatio;
    for(const layer of [canvas,terrainCanvas]){
      layer.width=Math.round(width*ratio);layer.height=Math.round(height*ratio);
    }
    spriteCache.clear();terrainKey='';queueGPS();
    redraw();
  }
  function queueGPS(){
    if(!gpsHandler||gpsFrame||!width||!height)return;
    gpsFrame=requestAnimationFrame(()=>{
      gpsFrame=0;if(!gpsHandler)return;
      const point=pointerGPS?world(pointerGPS.x,pointerGPS.y):{x:cx,y:cy};
      gpsHandler({lat:NORTH-point.y,lng:WEST+point.x,z:6+Math.log2(scale()),source:pointerGPS?.source||'center'});
    });
  }
  function maxZoom(){return clamp(2/(Math.min(width/W,height/H)*1.04),20,128);}
  function stopAnimation(){animation=null;}
  function camera(x,y,z,animate=true){
    if(!width||!height)return;
    z=clamp(z,.68,maxZoom());
    if(animate&&!window.matchMedia('(prefers-reduced-motion: reduce)').matches){
      animation={at:performance.now(),x:cx,y:cy,z:magnify,tx:x,ty:y,tz:z};
    }else{
      stopAnimation();cx=x;cy=y;magnify=z;bounds();move?.(magnify);
    }
    hover=null;redraw();
  }
  function tick(){
    if(!animation)return;
    const a=animation,t=Math.min(1,(performance.now()-a.at)/235),u=1-(1-t)**3;
    magnify=a.z*(a.tz/a.z)**u;
    // Interpolate in inverse scale to keep the point beneath the cursor stationary.
    const f=Math.abs(a.z-a.tz)<.0001?u:(1/magnify-1/a.z)/(1/a.tz-1/a.z);
    cx=a.x+(a.tx-a.x)*f;cy=a.y+(a.ty-a.y)*f;bounds();move?.(magnify);
    if(t===1)animation=null;else redraw();
  }
  function zoomTo(next,x=width/2,y=height/2,animate=true){
    if(!width||!height)return;
    const anchor=world(x,y),z=clamp(next,.68,maxZoom()),sc=scale()*z/magnify;
    camera(anchor.x-(x-width/2)/sc,anchor.y-(y-height/2)/sc,z,animate);
  }
  function reset(){chosen=null;camera(W/2,H/2,1);}
  function flyTo(s,z=7){pointerGPS=null;if(!s||!Number.isFinite(s.lat)||!Number.isFinite(s.lng))return;const p=norm(s);camera(p.x,p.y,z);}
  function focus(s){if(s){chosen=s;pulseStart=performance.now();pointerGPS=null;flyTo(s,Math.max(magnify,15));}}
  function backdrop(ctx){
    ctx.fillStyle=theme==='night'?'#384950':'#2c67a4';ctx.fillRect(0,0,width,height);
  }
  function pumpTiles(){
    while(inFlight<8&&tileQueue.length){
      const key=tileQueue.shift();
      if(tiles.has(key)||!wantedTiles.has(key))continue;
      const img=new Image();img.decoding='async';tiles.set(key,img);inFlight++;
      const complete=()=>{
        inFlight--;
        if(wantedTiles.has(key)){tileRevision++;redraw();}
        pumpTiles();
      };
      img.onload=complete;img.onerror=complete;
      img.src='https://map.stateofleonida.net/tiles/YANIS/v17/nocams/'+key+'.png';
    }
    if(tiles.size>180)for(const [key,img] of tiles){
      if(!wantedTiles.has(key)&&img.complete)tiles.delete(key);
      if(tiles.size<=140)break;
    }
  }
  function planTiles(style,z,x1,y1,x2,y2){
    const plan=[style,z,x1,y1,x2,y2].join('/');
    if(plan===tilePlanKey)return;
    tilePlanKey=plan;wantedTiles=new Set();const queue=[];
    const mx=(x1+x2)*.5,my=(y1+y2)*.5;
    for(let x=x1;x<=x2;x++)for(let y=y1;y<=y2;y++){
      const key=style+'/'+z+'/'+x+'/'+y;wantedTiles.add(key);
      if(!tiles.has(key))queue.push({key,d:(x-mx)**2+(y-my)**2});
    }
    tileQueue=queue.sort((a,b)=>a.d-b.d).map(item=>item.key);pumpTiles();
  }
  function terrain(ctx){
    const mode=theme==='night'?'night':'day', origin=view(0,0);
    const base=images['map-'+mode];
    if(base?.naturalWidth){
      // Crop before scaling so that deep zoom never stretches a full-island texture.
      const a=world(0,0),b=world(width,height),x=clamp(a.x,0,W),y=clamp(a.y,0,H);
      const w=Math.min(b.x,W)-x,h=Math.min(b.y,H)-y;
      if(w>0&&h>0){const dst=view(x,y);ctx.drawImage(base,x/W*base.naturalWidth,y/H*base.naturalHeight,w/W*base.naturalWidth,h/H*base.naturalHeight,dst.x,dst.y,w*scale(),h*scale());}
    }
    const z=clamp(Math.ceil(6+Math.log2(scale()*ratio)),3,6);
    if(z<=3){if(tilePlanKey){tilePlanKey='';wantedTiles.clear();tileQueue=[];}return;} // The bundled overview is a complete mosaic of native zoom 3.
    const edge=256*2**(6-z);
    const tl=world(0,0),br=world(width,height);
    const x1=Math.max(0,Math.floor((6450+Math.max(tl.x,0))/edge)),y1=Math.max(0,Math.floor(tl.y/edge));
    const x2=Math.floor((6450+Math.min(W-1,br.x))/edge),y2=Math.floor(Math.min(H-1,br.y)/edge);
    const style=theme==='night'?'dark':'normal';
    if(!animation)planTiles(style,z,x1,y1,x2,y2);
    ctx.save();ctx.beginPath();ctx.rect(origin.x,origin.y,W*scale(),H*scale());ctx.clip();
    for(let x=x1;x<=x2;x++)for(let y=y1;y<=y2;y++){
      const img=tiles.get(style+'/'+z+'/'+x+'/'+y);if(!img?.naturalWidth)continue;
      const p=view(x*edge-6450,y*edge);ctx.drawImage(img,p.x,p.y,edge*scale()+.3,edge*scale()+.3);
    }
    ctx.restore();
  }
  function seaLabel(s,x,y){
    if(x<-40||x>width+40||y<30||y>height-25)return;
    ctx.save();ctx.translate(x,y);ctx.textAlign='center';ctx.fillStyle='rgba(202,183,206,.43)';
    ctx.font='italic 14px Georgia, serif';ctx.fillText(s,0,0);ctx.restore();
  }
  function labels(){
    if(magnify>2.8)return;
    const left=view(-1300,10300),right=view(W+1200,12200);
    seaLabel('Golfo di Leonida',left.x,left.y);seaLabel('Oceano Atlantico',right.x,right.y);
  }
  const places=[
    ['Mount Kalaga',-2750,7750,0],['Port Gellhorn',-6549,3669,0],['Vice City',-615,150,0],['Leonida Keys',-2508,-5893,0],
    ['Grassrivers',-3477,-4502,1.25],['Ambrosia',-2785,3981,1.25],['Vice Beach',1670,1570,2],['Hamlet',-2691,-3193,2],
    ['Ocean Beach',1744,699,3.5],['Crosstown',-636,1157,3.5],['Downtown',-662,-102,3.5]
  ];
  function buildDistricts(list){
    const samples=new Map(),fixed=new Set(places.map(p=>p[0].toLowerCase()));
    for(const s of list){
      if(!s.district||!['landmark','enterable','shop','hotel','nightlife','transit'].includes(s.category))continue;
      const name=s.district.split(',')[0].trim();
      if(!name||fixed.has(name.toLowerCase())||name==='Leonida')continue;
      const coords=samples.get(name)||[];coords.push(s);samples.set(name,coords);
    }
    const sorted=[...samples.entries()].filter(([,rows])=>rows.length>=4).sort((a,b)=>b[1].length-a[1].length);
    return sorted.map(([name,rows])=>{
      const i=Math.floor(rows.length/2);
      return [name,rows.map(s=>s.lng).sort((a,b)=>a-b)[i],rows.map(s=>s.lat).sort((a,b)=>a-b)[i],rows.length>20?4:7];
    });
  }
  const regionSymbols=['tree','anchor','building','boat','tree','industry','bed','home','bed','road','building'];
  function textWidth(text,font){
    const key=font+'|'+text;
    if(!textWidths.has(key)){if(textWidths.size>1500)textWidths.clear();textWidths.set(key,ctx.measureText(text).width);}
    return textWidths.get(key);
  }
  function callout(name,x,y,key,priority=false,side=1,spot=null){
    const mobile=width<560;
    if(x<-5||x>width+5||y<5||y>height-5)return;
    const size=priority?(mobile?12:15):11;
    ctx.font=(priority?'800 ':'650 ')+size+'px Barlow, system-ui, sans-serif';
    const w=textWidth(name,ctx.font)+20,h=size+4;
    // Screen-space separation converges smoothly as the camera moves closer.
    const distance=(mobile?Math.min(width*.135,52):Math.min(width*.15,145))/Math.sqrt(magnify)+7;
    const offsets=[-1,1,-1.75,1.75];
    for(const dir of [side,-side])for(const dy of offsets){
      const start=x+dir*distance, top=clamp(y+dy*(10+Math.min(15,distance*.16)),h/2+3,height-h/2-3);
      const left=dir>0?start:start-w;
      const box={l:left-3,r:left+w+3,t:top-h/2-2,b:top+h/2+2,spot};
      if(box.l<2||box.r>width-2||labelBoxes.some(k=>box.l<k.r&&box.r>k.l&&box.t<k.b&&box.b>k.t))continue;
      labelBoxes.push(box);
      const elbow=x+dir*Math.min(distance*.47,24);
      ctx.save();ctx.lineCap='round';ctx.lineJoin='round';ctx.beginPath();
      ctx.moveTo(x,y);ctx.lineTo(elbow,top);ctx.lineTo(start-dir*3,top);
      ctx.lineWidth=3;ctx.strokeStyle='rgba(25,22,36,.74)';ctx.stroke();
      ctx.lineWidth=1.1;ctx.strokeStyle=priority?'#ffe0bf':'#e2d1ea';ctx.stroke();
      // Arrow tip points back to the exact mapped coordinate.
      const a=Math.atan2(top-y,elbow-x);ctx.beginPath();ctx.moveTo(x,y);
      ctx.lineTo(x+5*Math.cos(a-.48),y+5*Math.sin(a-.48));ctx.lineTo(x+5*Math.cos(a+.48),y+5*Math.sin(a+.48));ctx.closePath();ctx.fillStyle='#ffe3c7';ctx.fill();
      ctx.fillStyle='rgba(31,24,42,.86)';ctx.beginPath();ctx.roundRect(box.l,box.t,box.r-box.l,box.b-box.t,5);ctx.fill();
      paintGlyph(ctx,key,left+6,top,13,'#ffcbb1');
      ctx.font=(priority?'800 ':'650 ')+size+'px Barlow, system-ui, sans-serif';ctx.textAlign='left';ctx.textBaseline='middle';ctx.fillStyle='#fff5eb';ctx.fillText(name,left+16,top+.4);
      ctx.restore();return true;
    }
    return false;
  }
  function regionLabels(){
    // Prioritize the selected spot and regional names, then fill remaining room.
    labelBoxes=[];
    if(chosen&&spotSet.has(chosen)){const p=norm(chosen),v=view(p.x,p.y);callout(chosen.title,v.x,v.y,symbol(chosen).key,true,1,chosen);}
    for(let i=0;i<places.length;i++){
      const [name,lng,lat,min]=places[i];if(magnify<min)continue;
      const v=view(lng-WEST,NORTH-lat);callout(name,v.x,v.y,regionSymbols[i],true,i===0||i===1?-1:1);
    }
    for(const [name,lng,lat,min] of districts){
      if(magnify<min)continue;
      const v=view(lng-WEST,NORTH-lat);callout(name,v.x,v.y,'flag');
    }
    if(magnify>=5&&!animation){
      const seen=new Set(),limit=width<560?9:22;let emitted=0;
      for(const g of drawn){
        if(g.members.length!==1)continue;
        const s=g.members[0],name=s.title;
        if(!name||name.length>43||seen.has(name)||s===chosen)continue;
        if(callout(name,g.x,g.y,symbol(s).key,false,1,s)){seen.add(name);if(++emitted===limit)break;}
      }
    }
  }
  function groupSpots(){
    const cell=magnify<=1.6?(width<560?70:110):magnify<5?58:magnify<16?40:28;
    const sc=scale(),bucket=Math.round(Math.log2(sc)*3),key=bucket+'/'+cell;
    let groups=clusterLevels.get(key);
    if(!groups){
      const step=cell/2**(bucket/3),cells=new Map();
      for(const p of worldPoints){
        const gx=Math.floor(p.x/step),gy=Math.floor(p.y/step),cellId=gx+gy*100000;
        let g=cells.get(cellId);
        if(!g){g={wx:0,wy:0,x:0,y:0,members:[],seed:gx+gy*7,r:0};cells.set(cellId,g);}
        g.wx+=p.x;g.wy+=p.y;g.members.push(p.spot);
      }
      groups=Array.from(cells.values());
      for(const g of groups){g.wx/=g.members.length;g.wy/=g.members.length;}
      if(clusterLevels.size>=10)clusterLevels.delete(clusterLevels.keys().next().value);
      clusterLevels.set(key,groups);
    }
    const visible=[],ox=width*.5-cx*sc,oy=height*.5-cy*sc;
    for(const g of groups){
      g.x=g.wx*sc+ox;g.y=g.wy*sc+oy;
      if(g.x>=-22&&g.x<=width+22&&g.y>=-22&&g.y<=height+22)visible.push(g);
    }
    return visible;
  }
  function circle(x,y,r){ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);}
  // Pictograms share a 24-unit coordinate system, both on the map and in detail cards.
  const glyphs={
    bed:'M3 20V6 M3 16h18v4 M4 12h16l1 4 M6 8h4v4H6z M12 9h6l2 3',
    home:'M2 11l10-8 10 8 M5 10v11h5v-7h4v7h5V10',
    shop:'M3 10l2-6h14l2 6 M3 10q2 4 5 0 2 4 4 0 3 4 5 0 2 4 4 0 M5 12v8h14v-8',
    food:'M5 3v6q3 3 6 0V3 M8 3v18 M18 3q-5 4-4 10h4 M18 3v18',
    drink:'M3 4h18l-9 10z M12 14v6 M7 21h10',
    music:'M8 17V6l12-3v12 M8 16q-7-1-6 3t6-1 M20 14q-7-1-6 3t6-1',
    airplane:'M12 2l2 7 7 5v2l-8-3v5l3 2v1l-4-1-4 1v-1l3-2v-5l-8 3v-2l7-5z',
    bus:'M5 16V6q0-3 3-3h8q3 0 3 3v11H5z M5 11h14 M7 17v3m10-3v3 M8 14h1m6 0h1',
    train:'M6 16V5q0-2 2-2h8q2 0 2 2v11z M6 10h12 M8 13h1m6 0h1 M8 17l-4 5m12-5 4 5 M6 20h12',
    boat:'M2 13l10-4 10 4-4 6H6z M7 11V6h10v5 M12 3v3 M3 21q2-2 4 0 2 2 5 0 3-2 5 0 2 2 4 0',
    road:'M7 3L2 21m15-18 5 18 M12 3v4m0 3v4m0 3v4',
    fuel:'M3 21V4h10v17 M2 21h13 M5 6h6v5H5z M13 10h2q2 0 2 3v4q0 3 2 3t2-3V9l-4-5',
    clinic:'M8 3h8v5h5v8h-5v5H8v-5H3V8h5z',
    badge:'M12 2l8 4v6q0 6-8 10-8-4-8-10V6z M8 12l3 3 5-6',
    tree:'M12 2L5 10h3l-5 6h7v5h4v-5h7l-5-6h3z',
    sport:'M12 2a10 10 0 1 0 .01 0 M4 6q7-1 10 4t6 7 M5 19q6-11 14-14',
    building:'M3 21h18 M5 21V6l9-3v18 M14 9h5v12 M8 8h2m-2 4h2m-2 4h2',
    industry:'M3 21V9l6 3V8l6 4 1-9h4l1 18z M6 17h2m3 0h2m3 0h2',
    door:'M3 21h18 M6 21V4l10-2v19 M16 5h3v16 M12 12h1',
    film:'M3 8h18v12H3z M3 8 2 4l18-3 1 4z M7 3l3 4m4-5 3 4',
    camera:'M2 7h5l2-3h6l2 3h5v13H2z M12 9a4 4 0 1 0 .01 0',
    eye:'M2 12q10-15 20 0-10 15-20 0z M12 9a3 3 0 1 0 .01 0',
    bank:'M2 8l10-6 10 6z M5 10v8m5-8v8m4-8v8m5-8v8 M2 21h20',
    anchor:'M12 3a2 2 0 1 0 .01 0 M12 6v15 M4 13q1 7 8 8 7-1 8-8 M2 15l2-3 3 2m10 0 3-2 2 3',
    tool:'M15 3q-6 1-5 7L3 17q-2 4 2 4l8-8q8 1 8-7l-4 3-3-3z',
    cart:'M2 4h3l3 12h11l3-9H6 M9 19a1 1 0 1 0 .01 0 M18 19a1 1 0 1 0 .01 0',
    lock:'M5 10h14v11H5z M8 10V7a4 4 0 0 1 8 0v3 M12 14v3',
    star:'M12 2l3 6.5 7 1-5 5 1 7-6-3.4-6 3.4 1-7-5-5 7-1z',
    target:'M12 4a8 8 0 1 0 .01 0 M12 1v6m0 10v6 M1 12h6m10 0h6 M12 10a2 2 0 1 0 .01 0',
    scissors:'M6 13a4 4 0 1 0 .01 0 M18 13a4 4 0 1 0 .01 0 M8 14l11-12 M16 14 5 2',
    shirt:'M8 3q4 3 8 0l6 4-3 4-3-2v12H8V9l-3 2-3-4z',
    bridge:'M2 16h20 M6 4v16m12-16v16 M2 13q3-2 4-8 6 13 12 0 1 6 4 8',
    screen:'M2 4h20v13H2z M12 17v3 M7 21h10',
    light:'M12 2a7 7 0 0 1 5 12l-2 3H9l-2-3a7 7 0 0 1 5-12z M9 20h6',
    flag:'M5 21V3q4-2 8 0t7 0v9q-4 2-7 0t-8 0'
  };
  const glyphByTag={guns:'target',hair:'scissors',clothes:'shirt',shoes:'shop',electronics:'screen',tattoos:'star',fence:'shop',vendor:'cart',bikeshop:'tool',carwash:'tool',"pay'n'spray":'tool',cinema:'film',ferriswheel:'sport',leisure:'sport',events:'flag',recreation:'sport',agriculture:'tree',safehouse:'home',residential:'home',hotel:'bed',airport:'airplane',airbase:'airplane',blimp:'airplane',bus:'bus',metro:'train',metromover:'train',train:'train',marina:'anchor',gas:'fuel',supermarket:'cart',restaurant:'food',fastfood:'food',food:'food',bar:'drink',liquor:'drink',drinks:'drink',nightclub:'music',stripclub:'music',police:'badge',hospital:'clinic',pharmacy:'clinic',jail:'lock',tennis:'sport',gym:'sport',golf:'sport',volleyball:'sport',racetrack:'flag',natural:'tree',government:'bank',industrial:'industry',utilities:'industry',construction:'tool',modshop:'tool',retail:'shop',office:'building',transportation:'road'};
  const glyphByCat={landmark:'building',enterable:'door',shop:'shop',hotel:'bed',transit:'road',nightlife:'drink',trailer:'film',screenshot:'camera',leak:'eye',custom:'star'};
  const pathCache={}, symbolCache=new WeakMap();
  function symbol(s){
    if(symbolCache.has(s))return symbolCache.get(s);
    let glyph=glyphByCat[s.category]||'star';
    if(!['trailer','screenshot','leak'].includes(s.category)){
      const tags=s.tags||[],specific=tags.find(t=>t.startsWith('#')&&glyphByTag[t.slice(1).toLowerCase()]);
      const broad=tags.find(t=>glyphByTag[t.toLowerCase()]);
      const named=[
        [/airport|airfield/i,'airplane'],[/bridge/i,'bridge'],[/station.*(rail|train)|train station/i,'train'],
        [/marina|yacht|boatyard/i,'anchor'],[/stadium|arena/i,'sport'],[/factory|warehouse|refinery/i,'industry'],
        [/lighthouse/i,'light'],[/hospital|clinic/i,'clinic'],[/police|sheriff/i,'badge'],[/bank of/i,'bank'],[/amm[u]?[- ]nation|pawn . gun/i,'target']
      ].find(([pattern])=>pattern.test(s.title));
      glyph=specific?glyphByTag[specific.slice(1).toLowerCase()]:named?named[1]:broad?glyphByTag[broad.toLowerCase()]:glyph;
    }
    const info={key:glyph,path:glyphs[glyph],color:palettes[s.category]||'#ffc182'};
    symbolCache.set(s,info);return info;
  }
  function paintGlyph(context,key,x,y,size,color){
    pathCache[key]??=new Path2D(glyphs[key]);
    context.save();context.translate(x-size/2,y-size/2);context.scale(size/24,size/24);
    context.strokeStyle=color;context.lineWidth=2.1;context.lineCap='round';context.lineJoin='round';context.stroke(pathCache[key]);context.restore();
  }
  function marker(g){
    const n=g.members.length,s=g.members[0],active=hover===s;
    const color=n>1?colorStops[Math.abs(g.seed)%4]:symbol(s).color;
    const r=n===1?(magnify<2?8.5:11):Math.min(19,10.5+Math.log10(n)*3);g.r=r;
    const glyph=n===1?symbol(s).key:'',key=[n,glyph,color,r,active].join('/'),size=Math.ceil((r+4)*2);
    let sprite=spriteCache.get(key);
    if(!sprite){
      sprite=document.createElement('canvas');sprite.width=sprite.height=Math.ceil(size*ratio);
      const c=sprite.getContext('2d'),mid=size/2;c.scale(sprite.width/size,sprite.height/size);
      c.beginPath();c.arc(mid,mid,r+2.5,0,Math.PI*2);c.fillStyle=color+'48';c.fill();
      c.beginPath();c.arc(mid,mid,r,0,Math.PI*2);c.fillStyle=active?'#514155':'#26212c';c.fill();c.strokeStyle=color;c.lineWidth=1.8;c.stroke();
      if(n===1)paintGlyph(c,glyph,mid,mid,r*1.45,color);
      else{c.fillStyle='#fff4f6';c.textAlign='center';c.textBaseline='middle';c.font='bold '+(n>=1000?10:11.5)+'px system-ui, sans-serif';c.fillText(String(n),mid,mid+.6);}
      if(spriteCache.size>=320)spriteCache.delete(spriteCache.keys().next().value);
      spriteCache.set(key,sprite);
    }
    ctx.drawImage(sprite,g.x-size/2,g.y-size/2,size,size);
  }
  function selected(){
    if(!chosen||!spotSet.has(chosen))return;
    const p=norm(chosen),v=view(p.x,p.y),color=symbol(chosen).color;
    circle(v.x,v.y,17);ctx.fillStyle='#251c34';ctx.fill();ctx.lineWidth=3;ctx.strokeStyle=color;ctx.stroke();
    paintGlyph(ctx,symbol(chosen).key,v.x,v.y,22,'#ffffff');
    const t=(performance.now()-pulseStart)/480;
    if(t>=0&&t<1&&!window.matchMedia('(prefers-reduced-motion: reduce)').matches){
      ctx.save();ctx.globalAlpha=1-t;circle(v.x,v.y,19+14*t);ctx.strokeStyle=color;ctx.lineWidth=2;ctx.stroke();ctx.restore();redraw();
    }
  }
  function drawRuler(){
    if(!ruler.length)return;
    const points=ruler.map(s=>{const p=norm(s);return view(p.x,p.y);});
    ctx.save();ctx.lineCap='round';ctx.beginPath();points.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));
    ctx.lineWidth=5;ctx.strokeStyle='rgba(20,16,32,.82)';ctx.stroke();ctx.setLineDash([7,5]);ctx.lineWidth=2.4;ctx.strokeStyle='#ffdc9e';ctx.stroke();ctx.setLineDash([]);
    points.forEach((p,i)=>{circle(p.x,p.y,10);ctx.fillStyle='#302438';ctx.fill();ctx.strokeStyle='#ffdc9e';ctx.lineWidth=2;ctx.stroke();ctx.fillStyle='#fff';ctx.textAlign='center';ctx.textBaseline='middle';ctx.font='bold 11px system-ui';ctx.fillText(i<26?String.fromCharCode(65+i):String(i+1),p.x,p.y);});ctx.restore();
  }
  function draw(){
    frame=0;if(!width||!height)return;tick();
    const key=[cx,cy,magnify,width,height,ratio,theme,tileRevision,!!animation].join('|');
    if(key!==terrainKey){
      terrainKey=key;const base=terrainContext;base.setTransform(ratio,0,0,ratio,0,0);
      base.imageSmoothingEnabled=true;base.imageSmoothingQuality=animation||fingers.size?'low':'medium';
      backdrop(base);terrain(base);
      base.fillStyle=theme==='night'?'rgba(90,52,127,.24)':'rgba(239,160,118,.07)';base.fillRect(0,0,width,height);
    }
    ctx.setTransform(ratio,0,0,ratio,0,0);ctx.clearRect(0,0,width,height);
    labels();drawn=groupSpots();for(const g of drawn)marker(g);regionLabels();selected();drawRuler();queueGPS();
  }
  function hit(x,y){
    for(const label of labelBoxes){
      if(label.spot&&x>=label.l&&x<=label.r&&y>=label.t&&y<=label.b)return {members:[label.spot]};
    }
    for(let i=drawn.length-1;i>=0;i--){
      const g=drawn[i],dx=x-g.x,dy=y-g.y;if(dx*dx+dy*dy<=Math.max(12,g.r+4)**2)return g;
    }
  }
  function activate(g){
    if(!g)return;
    if(g.members.length===1||magnify>=maxZoom()-.05){const s=g.members[cycle++%g.members.length];focus(s);select?.(s);return;}
    const p=world(g.x,g.y);camera(p.x,p.y,magnify*2.4);
  }
  function coords(e){const r=canvas.getBoundingClientRect();return{x:e.clientX-r.left,y:e.clientY-r.top};}
  function pinchInfo(){
    const [a,b]=[...fingers.values()];return{x:(a.x+b.x)/2,y:(a.y+b.y)/2,d:Math.hypot(a.x-b.x,a.y-b.y)};
  }
  function attach(){
    canvas.addEventListener('pointerdown',e=>{
      if(e.button!==0)return; stopAnimation();const p=coords(e);pointerGPS={...p,source:e.pointerType==='touch'?'touch':'cursor'};queueGPS();
      fingers.set(e.pointerId,p);canvas.setPointerCapture(e.pointerId);
      if(fingers.size===1){down=p;dragged=false;multi=false;}
      if(fingers.size===2){previousPinch=pinchInfo();multi=true;}
      canvas.style.cursor='grabbing';
    });
    canvas.addEventListener('pointermove',e=>{
      const p=coords(e);
      if(!fingers.has(e.pointerId)){
        pointerGPS={...p,source:e.pointerType==='touch'?'touch':'cursor'};queueGPS();
        const g=hit(p.x,p.y),nextHover=g?.members[0];
        if(nextHover===hover)return;hover=nextHover;canvas.style.cursor=pickHandler?'crosshair':g?'pointer':'grab';
        canvas.title=g?(g.members.length===1?hover.title:g.members.length+' spot · Seleziona per ingrandire'):'';redraw();return;
      }
      pointerGPS=null;queueGPS();const last=fingers.get(e.pointerId);fingers.set(e.pointerId,p);
      if(fingers.size===2){
        const now=pinchInfo(),prev=previousPinch;previousPinch=now;
        if(prev?.d>0){cx-=(now.x-prev.x)/scale();cy-=(now.y-prev.y)/scale();zoomTo(magnify*now.d/prev.d,now.x,now.y,false);}return;
      }
      if(!dragged&&Math.hypot(p.x-down.x,p.y-down.y)<3)return;
      dragged=true;cx-=(p.x-last.x)/scale();cy-=(p.y-last.y)/scale();bounds();hover=null;redraw();
    });
    function end(e){
      if(!fingers.has(e.pointerId))return;
      const p=coords(e);fingers.delete(e.pointerId);
      if(!multi&&!dragged&&e.type!=='pointercancel'){
        if(pickHandler){const w=world(p.x,p.y);pickHandler({lat:NORTH-w.y,lng:w.x+WEST});}
        else activate(hit(p.x,p.y));
      }
      canvas.style.cursor=pickHandler?'crosshair':'grab';if(fingers.size===0){down=null;previousPinch=null;}
    }
    canvas.addEventListener('pointerleave',()=>{pointerGPS=null;queueGPS();if(hover){hover=null;redraw();}});
    canvas.addEventListener('pointerup',end);canvas.addEventListener('pointercancel',end);
    canvas.addEventListener('dblclick',e=>{const p=coords(e);if(!pickHandler&&!hit(p.x,p.y))zoomTo(magnify*2,p.x,p.y);});
    canvas.addEventListener('wheel',e=>{
      e.preventDefault();const p=coords(e);pointerGPS={...p,source:'cursor'};zoomTo((animation?.tz||magnify)*Math.exp(-clamp(e.deltaY,-150,150)*.004),p.x,p.y);
    },{passive:false});
    canvas.addEventListener('keydown',e=>{
      if(pickHandler&&e.key==='Enter'){e.preventDefault();pickHandler({lat:NORTH-cy,lng:cx+WEST});return;}
      const steps={ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowUp:[0,-1],ArrowDown:[0,1]};
      if(steps[e.key]){e.preventDefault();stopAnimation();cx+=steps[e.key][0]*75/scale();cy+=steps[e.key][1]*75/scale();bounds();redraw();}
      if(e.key==='+'||e.key==='=')zoomTo(magnify*1.7);if(e.key==='-')zoomTo(magnify/1.7);if(e.key==='Home'){e.preventDefault();reset();}
    });
  }
  return {
    init(el,onSelect,onMove){
      if(initialized)return;initialized=true;host=el;select=onSelect;move=onMove;
      canvas=document.createElement('canvas');canvas.tabIndex=0;canvas.setAttribute('aria-label','Mappa di Leonida. Usa le frecce per spostarti, più e meno per lo zoom. Seleziona gli spot anche dalla lista.');
      canvas.style.cssText='position:absolute;inset:0;width:100%;height:100%;touch-action:none;cursor:grab;display:block;';
      if(getComputedStyle(host).position==='static')host.style.position='relative';
      terrainCanvas=document.createElement('canvas');terrainCanvas.setAttribute('aria-hidden','true');
      terrainCanvas.style.cssText='position:absolute;inset:0;width:100%;height:100%;pointer-events:none;display:block;';
      host.prepend(terrainCanvas,canvas);terrainContext=terrainCanvas.getContext('2d',{alpha:false});ctx=canvas.getContext('2d');attach();ro=new ResizeObserver(resize);ro.observe(host);
      for(const mode of ['day','night'])preload('map-'+mode,'assets/map-'+mode+'.webp');
      districts=buildDistricts(window.VICE_ATLAS_SPOTS||[]);
      resize();
    },
    setSpots(list){
      spots=Array.isArray(list)?list:[];spotSet=new Set(spots);
      worldPoints=spots.map(spot=>({x:spot.lng-WEST,y:NORTH-spot.lat,spot}));
      clusterLevels.clear();hover=null;redraw();
    },
    setGPSHandler(fn){gpsHandler=typeof fn==='function'?fn:null;queueGPS();},
    focus,reset,resize,flyTo,symbol,
    setPickHandler(fn){pickHandler=typeof fn==='function'?fn:null;if(canvas)canvas.style.cursor=pickHandler?'crosshair':'grab';},
    setRuler(points){ruler=Array.isArray(points)?points.filter(s=>Number.isFinite(s.lat)&&Number.isFinite(s.lng)):[];redraw();},
    zoom(delta){zoomTo((animation?.tz||magnify)*Math.pow(1.6,delta));},
    theme(mode){theme=mode==='night'?'night':'sunset';redraw();}
  };
})();
