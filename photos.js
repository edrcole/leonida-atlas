'use strict';

window.AtlasPhotos = (() => {
  const views = {
    ig: { field: 'igPhoto', label: '🎮 In-game' },
    rl: { field: 'rlPhoto', label: '🌎 Real-life' }
  };
  const make = (tag, className, text) => {
    const node = document.createElement(tag);
    node.className = className;
    if (text) node.textContent = text;
    return node;
  };
  function button(className, label, action) {
    const node = make('button', className, label);
    node.type = 'button';
    node.addEventListener('click', action);
    return node;
  }
  function url(spot, kind) {
    const value = spot[views[kind].field];
    if (!value) return '';
    try {
      const link = new URL(value);
      return link.protocol === 'https:' ? link.href : '';
    } catch { return ''; }
  }
  const available = s => Object.keys(views).filter(k => url(s, k));
  function image(spot, kind, onFail, lazy) {
    const img = new Image();
    const remote = url(spot, kind);
    const local = spot.id === 'L367';
    img.loading = lazy ? 'lazy' : 'eager';
    img.decoding = 'async';
    img.alt = [spot.title, views[kind].label, '#' + spot.id].join(' · ');
    img.referrerPolicy = 'no-referrer';
    img.onerror = () => {
      if (img.src !== remote) img.src = remote;
      else { img.onerror = null; onFail(); }
    };
    img.src = local ? 'assets/photos/L367-' + kind + '.jpg' : remote;
    return img;
  }
  function fallback(spot, kind) {
    const note = make('div', 'ap-error');
    note.append(make('span', '', atlasText('Immagine non disponibile', 'Image unavailable')));
    const link = make('a', '', atlasText('Verifica sulla fonte ↗', 'View original source ↗'));
    link.href = url(spot, kind);
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    note.append(link);
    return note;
  }
  function picker(spot, selected, select) {
    const choices = make('div', 'ap-switch');
    choices.setAttribute('role', 'group');
    choices.setAttribute('aria-label', atlasText('Tipo di foto', 'Photo type'));
    for (const k of available(spot)) {
      const item = button('ap-option', views[k].label, () => select(k));
      item.setAttribute('aria-pressed', String(k === selected));
      item.dataset.kind = k;
      choices.append(item);
    }
    return choices;
  }
  function selectKind(container, kind) {
    container.querySelectorAll('.ap-option').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.kind === kind)));
  }
  function viewer(spot, initial, onOpenSpot) {
    const dialog = make('dialog', 'ap-lightbox');
    const name = spot.title + ' · #' + spot.id;
    dialog.setAttribute('aria-label', name);
    const head = make('div', 'ap-light-head');
    const close = button('ap-close', '×', () => dialog.close());
    close.setAttribute('aria-label', atlasText('Chiudi foto', 'Close photo'));
    close.autofocus = true;
    head.append(make('h2', '', name), close);
    const stage = make('div', 'ap-light-stage');
    const foot = make('div', 'ap-light-foot');
    let kind = initial;
    function show(k) {
      kind = k;
      selectKind(foot, k);
      stage.replaceChildren(image(spot, k, () => {if (kind === k) stage.replaceChildren(fallback(spot,k));}, false));
    }
    foot.append(picker(spot, kind, show));
    if (onOpenSpot) foot.append(button('ap-go', atlasText('Vai allo spot sulla mappa', 'Show location on map'), () => {dialog.close(); onOpenSpot(spot);}));
    dialog.append(head, stage, foot);
    document.body.append(dialog);
    dialog.addEventListener('click', event => {
      if (event.target !== dialog) return;
      const box = dialog.getBoundingClientRect();
      if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) dialog.close();
    });
    dialog.addEventListener('keydown', event => {
      if (['ArrowLeft', 'ArrowRight'].includes(event.key) && available(spot).length === 2) {
        event.preventDefault();
        show(kind === 'ig' ? 'rl' : 'ig');
      }
    });
    dialog.addEventListener('close', () => dialog.remove(), {once: true});
    show(kind);
    dialog.showModal();
  }
  function thumbnail(spot, kind, onOpenSpot, lazy) {
    const stage = make('div', 'ap-frame');
    const open = button('ap-preview', '', () => viewer(spot,kind,onOpenSpot));
    open.setAttribute('aria-label', atlasText('Ingrandisci ', 'Enlarge ') + views[kind].label.toLowerCase() + ' · ' + spot.title);
    const mark = make('span', 'ap-enlarge', '⛶');
    mark.setAttribute('aria-hidden', 'true');
    open.append(image(spot, kind, () => stage.replaceChildren(fallback(spot,kind)), lazy),mark);
    stage.append(open);
    return stage;
  }
  function mount(host, spot, onOpenSpot) {
    const kinds = available(spot);
    if (!kinds.length) {
      host.replaceChildren(make('p', 'ap-empty', atlasText('Nessuna foto in archivio per questo spot.', 'No photos available for this location.')));
      return;
    }
    const box = make('div', 'ap-detail');
    const frame = make('div', 'ap-stage');
    function show(k) {
      selectKind(box,k);
      frame.replaceChildren(thumbnail(spot,k,onOpenSpot,false));
    }
    box.append(frame, picker(spot,kinds[0],show));
    host.replaceChildren(box);
    show(kinds[0]);
  }
  function mountArchive(host, spots, onOpenSpot) {
    const photos = spots.filter(s => available(s).length);
    const gallery = make('div', 'ap-grid');
    let shown = 0;
    const loader = button('ap-more', atlasText('Mostra altre foto', 'Show more photos'), () => addPage(true));
    host.replaceChildren(gallery,loader);
    if (!photos.length) gallery.append(make('p', 'ap-empty', atlasText('Nessuna foto per questi spot.', 'No photos available for these locations.')));
    function addPage(moveFocus) {
      const oldCount = shown;
      for (const s of photos.slice(shown,shown + 18)) {
        const card = make('article', 'ap-card');
        const kinds = available(s);
        const stage = make('div','ap-stage');
        function change(k) {
          selectKind(card,k);
          stage.replaceChildren(thumbnail(s,k,onOpenSpot,true));
        }
        const title = make('strong','ap-title',s.title);
        const label = make('small','ap-card-label',[s.district,'#'+s.id].filter(Boolean).join(' · '));
        card.append(stage,picker(s,kinds[0],change),title,label);
        if (onOpenSpot) card.append(button('ap-go',atlasText('Vai allo spot sulla mappa', 'Show location on map'),() => onOpenSpot(s)));
        gallery.append(card);
        change(kinds[0]);
        shown++;
      }
      loader.hidden = shown >= photos.length;
      if (moveFocus) gallery.children[oldCount]?.querySelector('button')?.focus();
    }
    addPage(false);
  }
  return {mount, mountArchive, hasPhotos: s => available(s).length > 0};
})();
