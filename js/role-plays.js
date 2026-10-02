/**
 * BowtieGOAT Role Plays page: renders role play tiles from js/roleplays.json
 * (built from the PDFs by scripts/build_roleplays.py) with multi-select
 * filters, keyword search, active-filter chips, and shareable URLs.
 *
 * Filters combine as: ANY match within one dropdown, ALL dropdowns must match.
 * Shareable URL format: role-plays.html?event=AAM,RMS&ia=Promotion&cluster=marketing&q=pricing
 */
(() => {
  const PAGE_SIZE = 24;

  const CLUSTERS = {
    business: { name: 'Business Management & Administration', color: '#E3B23C' },
    entrepreneurship: { name: 'Entrepreneurship', color: '#5F6670' },
    finance: { name: 'Finance', color: '#2E7D4F' },
    hospitality: { name: 'Hospitality & Tourism', color: '#1F5F8B' },
    marketing: { name: 'Marketing', color: '#A8323A' },
    pfl: { name: 'Personal Financial Literacy', color: '#52913A' },
  };

  // Dropdown order on the page; `param` is the key used in shareable URLs
  const FILTERS = [
    { key: 'event', param: 'event', label: 'Event', value: (rp) => rp.code, name: (v, items) => items.find((rp) => rp.code === v)?.event || v },
    { key: 'ia', param: 'ia', label: 'Instructional Area', value: (rp) => rp.ia, name: (v) => v },
    { key: 'cluster', param: 'cluster', label: 'Career Cluster', value: (rp) => rp.cluster, name: (v) => CLUSTERS[v]?.name || v, dot: (v) => CLUSTERS[v]?.color },
  ];

  const els = {
    controls: document.querySelector('[data-rp-controls]'),
    search: document.querySelector('[data-rp-search]'),
    mobileToggle: document.querySelector('[data-rp-mobile-toggle]'),
    mobileBadge: document.querySelector('[data-rp-mobile-badge]'),
    chips: document.querySelector('[data-rp-chips]'),
    count: document.querySelector('[data-rp-count]'),
    empty: document.querySelector('[data-rp-empty]'),
    grid: document.querySelector('[data-rp-grid]'),
    more: document.querySelector('[data-rp-more]'),
  };

  const state = { event: new Set(), ia: new Set(), cluster: new Set(), q: '' };
  const openIndicators = new Set();
  let items = [];
  let visible = PAGE_SIZE;

  const escapeHtml = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  function highlight(text, q) {
    const safe = escapeHtml(text);
    if (!q) return safe;
    return safe.replace(new RegExp(`(${escapeRegex(escapeHtml(q))})`, 'ig'), '<mark>$1</mark>');
  }

  const searchText = (rp) => [rp.event, rp.code, rp.ia, CLUSTERS[rp.cluster]?.name, rp.situation, ...rp.pis].join(' ').toLowerCase();

  // Does a role play pass every active filter (optionally ignoring one, for dropdown counts)?
  function passes(rp, skipKey) {
    const filtersOk = FILTERS.every((f) => f.key === skipKey || !state[f.key].size || state[f.key].has(f.value(rp)));
    return filtersOk && (!state.q || rp._search.includes(state.q));
  }

  /* ---------- URL <-> state ---------- */

  function readUrl() {
    const params = new URLSearchParams(window.location.search);
    FILTERS.forEach((f) => {
      (params.get(f.param) || '').split(',').map((v) => v.trim()).filter(Boolean).forEach((v) => state[f.key].add(v));
    });
    state.q = (params.get('q') || '').trim().toLowerCase();
    els.search.value = params.get('q') || '';
  }

  function writeUrl() {
    const params = new URLSearchParams();
    FILTERS.forEach((f) => { if (state[f.key].size) params.set(f.param, [...state[f.key]].join(',')); });
    if (state.q) params.set('q', state.q);
    const query = params.toString().replace(/%2C/g, ',');
    history.replaceState(null, '', query ? `?${query}` : window.location.pathname);
  }

  /* ---------- Rendering ---------- */

  function renderFilters() {
    const openId = els.controls.querySelector('[data-rp-panel][data-open="true"]')?.id;

    els.controls.innerHTML = FILTERS.map((f) => {
      const counts = {};
      items.filter((rp) => passes(rp, f.key)).forEach((rp) => { counts[f.value(rp)] = (counts[f.value(rp)] || 0) + 1; });
      state[f.key].forEach((v) => { counts[v] ??= 0; }); // keep selected options visible even at 0
      const options = Object.keys(counts).sort((a, b) => f.name(a, items).localeCompare(f.name(b, items)));
      const selected = state[f.key].size;

      return `
        <div class="relative">
          <button type="button" data-rp-toggle="rp-panel-${f.key}" aria-expanded="false"
            class="w-full md:w-auto flex items-center justify-between md:justify-start gap-2 rounded-full border ${selected ? 'border-blue-400' : 'border-ink-200'} bg-white px-4 py-2.5 text-sm font-medium text-ink-700 hover:border-blue-400 transition-colors">
            ${f.label}
            <span class="flex items-center gap-2">
              ${selected ? `<span class="inline-flex items-center justify-center w-5 h-5 rounded-full bg-blue-600 text-cream-50 text-[10px] font-semibold">${selected}</span>` : ''}
              <svg class="w-3.5 h-3.5 text-ink-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7"/></svg>
            </span>
          </button>
          <div id="rp-panel-${f.key}" data-rp-panel data-open="false"
            class="absolute left-0 z-20 mt-2 w-full md:w-80 rounded-lg border border-ink-200 bg-white shadow-lg p-2 max-h-80 overflow-auto">
            ${options.map((v) => `
              <label class="flex items-center gap-2.5 px-2 py-2 rounded-md hover:bg-ink-50 cursor-pointer text-sm text-ink-700">
                <input type="checkbox" data-rp-filter="${f.key}" value="${escapeHtml(v)}" ${state[f.key].has(v) ? 'checked' : ''} class="w-4 h-4 flex-shrink-0 accent-blue-600" />
                ${f.dot ? `<span class="w-2.5 h-2.5 rounded-full flex-shrink-0" style="background:${f.dot(v)}"></span>` : ''}
                <span>${escapeHtml(f.name(v, items))}</span>
                <span class="ml-auto pl-2 text-ink-400">${counts[v]}</span>
              </label>`).join('')}
          </div>
        </div>`;
    }).join('');

    if (openId) setPanel(document.getElementById(openId), true);
  }

  function renderChips() {
    const chips = [];
    FILTERS.forEach((f) => state[f.key].forEach((v) => chips.push({ key: f.key, value: v, text: f.name(v, items) })));
    if (state.q) chips.push({ key: 'q', value: state.q, text: `Search: “${state.q}”` });

    els.chips.classList.toggle('hidden', !chips.length);
    els.chips.innerHTML = `<span class="text-xs font-semibold uppercase tracking-wide text-ink-500 mr-1">Active filters:</span>` +
      chips.map((c) => `
        <button type="button" data-rp-chip="${c.key}" data-value="${escapeHtml(c.value)}" aria-label="Remove filter: ${escapeHtml(c.text)}"
          class="inline-flex items-center gap-1.5 rounded-full bg-ink-900 text-cream-50 text-xs font-medium pl-3 pr-2 py-1.5 hover:bg-ink-700 transition-colors">
          ${escapeHtml(c.text)}
          <svg class="w-3.5 h-3.5 opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" d="M6 6l12 12M18 6L6 18"/></svg>
        </button>`).join('') +
      `<button type="button" data-rp-clear class="ml-1 text-sm font-semibold text-blue-600 hover:text-blue-500 transition-colors">Clear all filters</button>`;

    const dropdownCount = FILTERS.reduce((n, f) => n + state[f.key].size, 0);
    els.mobileBadge.textContent = dropdownCount;
    els.mobileBadge.classList.toggle('hidden', !dropdownCount);
  }

  function tileHtml(rp) {
    const q = state.q;
    const indicatorMatch = q && rp.pis.some((p) => p.toLowerCase().includes(q));
    const open = openIndicators.has(rp.file) || indicatorMatch;
    const href = `roleplays/${encodeURIComponent(rp.file)}`;
    const sentenceMatch = q && rp.sentence.toLowerCase().includes(q);

    return `
      <article class="cl-${rp.cluster} flex flex-col self-start rounded-xl bg-white border border-ink-200 shadow-sm overflow-hidden hover:shadow-lg transition-shadow duration-200">
        <a href="${href}" target="_blank" rel="noopener" class="block" aria-label="Open ${escapeHtml(rp.event)} role play (${escapeHtml(rp.ia)}) PDF">
          <div class="rp-head px-6 pt-5 pb-5 min-h-[160px] flex flex-col">
            <div class="flex items-start justify-between gap-4">
              <p class="text-[11px] font-semibold uppercase tracking-[0.1em] opacity-90 pt-1.5 min-w-0">${escapeHtml(CLUSTERS[rp.cluster]?.name || '')}</p>
              <span class="flex-shrink-0 max-w-[60%] rounded-full bg-white text-ink-800 text-xs font-semibold px-3.5 py-1.5 text-center leading-snug">${highlight(rp.ia, q)}</span>
            </div>
            <h3 class="mt-auto pt-3 font-serif text-[22px] font-bold leading-tight">${highlight(rp.event, q)}</h3>
          </div>
          <div class="px-6 pt-5 min-h-[124px]">
            <p class="text-[15px] leading-relaxed text-ink-700 ${sentenceMatch ? '' : 'rp-clamp-4'}">${highlight(rp.sentence, q)}</p>
          </div>
        </a>
        <div class="px-6 pt-3 pb-5">
          <div class="border-t border-ink-100 pt-3">
            <button type="button" data-rp-indicators="${escapeHtml(rp.file)}" aria-expanded="${open}"
              class="flex w-full items-center justify-between text-sm font-medium text-ink-600 hover:text-ink-900 transition-colors">
              <span>${open ? 'Hide' : 'Show'} performance indicators${indicatorMatch ? ' <span class="ml-1 rounded bg-cream-100 px-1.5 py-0.5 text-[11px] font-semibold text-ink-800">search match</span>' : ''}</span>
              <svg class="w-4 h-4 transition-transform ${open ? 'rotate-180' : ''}" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7"/></svg>
            </button>
            ${open ? `<ol class="mt-3 space-y-1.5 text-sm text-ink-700 list-decimal pl-5 marker:text-ink-400">${rp.pis.map((p) => `<li>${highlight(p, q)}</li>`).join('')}</ol>` : ''}
          </div>
          <a href="${href}" target="_blank" rel="noopener" class="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:text-blue-500 transition-colors">
            Open Role Play
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M13 7l5 5-5 5M6 12h12"/></svg>
          </a>
        </div>
      </article>`;
  }

  function renderGrid() {
    const matches = items.filter((rp) => passes(rp));
    const shown = matches.slice(0, visible);

    const filtered = matches.length < items.length;
    els.count.textContent = `Showing ${shown.length} of ${matches.length} role play${matches.length === 1 ? '' : 's'}${filtered ? ` (filtered from ${items.length})` : ''}`;
    els.empty.classList.toggle('hidden', matches.length > 0);
    els.grid.innerHTML = shown.map(tileHtml).join('');
    els.more.classList.toggle('hidden', matches.length <= visible);
  }

  function render({ resetPaging = true } = {}) {
    if (resetPaging) visible = PAGE_SIZE;
    renderFilters();
    renderChips();
    renderGrid();
    writeUrl();
  }

  /* ---------- Events ---------- */

  function setPanel(panel, open) {
    panel.setAttribute('data-open', String(open));
    document.querySelector(`[data-rp-toggle="${panel.id}"]`)?.setAttribute('aria-expanded', String(open));
  }
  const closePanels = () => document.querySelectorAll('[data-rp-panel][data-open="true"]').forEach((p) => setPanel(p, false));

  function clearAll() {
    FILTERS.forEach((f) => state[f.key].clear());
    state.q = '';
    els.search.value = '';
    render();
  }

  function bindEvents() {
    document.addEventListener('change', (e) => {
      const key = e.target.dataset.rpFilter;
      if (!key) return;
      if (e.target.checked) state[key].add(e.target.value); else state[key].delete(e.target.value);
      render();
    });

    let searchTimer;
    els.search.addEventListener('input', () => {
      clearTimeout(searchTimer);
      searchTimer = setTimeout(() => { state.q = els.search.value.trim().toLowerCase(); render(); }, 150);
    });

    document.addEventListener('click', (e) => {
      const toggle = e.target.closest('[data-rp-toggle]');
      if (toggle) {
        const panel = document.getElementById(toggle.dataset.rpToggle);
        const wasOpen = panel.getAttribute('data-open') === 'true';
        closePanels();
        setPanel(panel, !wasOpen);
        return;
      }
      const chip = e.target.closest('[data-rp-chip]');
      if (chip) {
        if (chip.dataset.rpChip === 'q') { state.q = ''; els.search.value = ''; }
        else state[chip.dataset.rpChip].delete(chip.dataset.value);
        render();
        return;
      }
      if (e.target.closest('[data-rp-clear]')) { clearAll(); return; }
      const indicators = e.target.closest('[data-rp-indicators]');
      if (indicators) {
        const file = indicators.dataset.rpIndicators;
        if (openIndicators.has(file)) openIndicators.delete(file); else openIndicators.add(file);
        renderGrid();
        return;
      }
      if (!e.target.closest('[data-rp-panel]')) closePanels();
    });

    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closePanels(); });

    els.more.addEventListener('click', () => { visible += PAGE_SIZE; renderGrid(); });

    els.mobileToggle.addEventListener('click', () => {
      const open = els.controls.getAttribute('data-open') !== 'true';
      els.controls.setAttribute('data-open', String(open));
      els.mobileToggle.setAttribute('aria-expanded', String(open));
    });
  }

  /* ---------- Start ---------- */

  fetch('js/roleplays.json')
    .then((res) => { if (!res.ok) throw new Error(res.status); return res.json(); })
    .then((data) => {
      items = data.map((rp) => ({ ...rp, _search: searchText(rp) }));
      readUrl();
      bindEvents();
      render();
    })
    .catch(() => {
      els.count.textContent = '';
      els.grid.innerHTML = '<p class="col-span-full text-center text-ink-500 py-16">Role plays couldn’t be loaded. Please refresh the page.</p>';
    });
})();
