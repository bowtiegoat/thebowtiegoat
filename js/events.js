/**
 * DECA Event Selection tool (event-selection.html).
 * All 60 competitive events, filterable by type, competitors, career
 * cluster, written pages, and presentation time. Filters combine with AND
 * across categories and OR within a category (an empty category matches
 * everything).
 */
const EVENTS = [{"event": "Accounting Applications", "code": "ACT", "type": "Role Play", "competitors": "1", "cluster": "Finance", "pages": 0, "presentation": 10, "url": "https://www.deca.org/compete/accounting-applications-series"}, {"event": "Apparel and Accessories Marketing", "code": "AAM", "type": "Role Play", "competitors": "1", "cluster": "Marketing", "pages": 0, "presentation": 10, "url": "https://www.deca.org/compete/apparel-and-accessories-marketing-series"}, {"event": "Automotive Services Marketing", "code": "ASM", "type": "Role Play", "competitors": "1", "cluster": "Marketing", "pages": 0, "presentation": 10, "url": "https://www.deca.org/compete/automotive-services-marketing-series"}, {"event": "Business Finance", "code": "BFS", "type": "Role Play", "competitors": "1", "cluster": "Finance", "pages": 0, "presentation": 10, "url": "https://www.deca.org/compete/business-finance-series"}, {"event": "Business Growth Plan", "code": "EBG", "type": "Prepared", "competitors": "1-3", "cluster": "Entrepreneurship", "pages": 20, "presentation": 15, "url": "https://www.deca.org/compete/business-growth-plan"}, {"event": "Business Law and Ethics Team", "code": "BLTDM", "type": "Role Play", "competitors": "2", "cluster": "Business Management and Administration", "pages": 0, "presentation": 15, "url": "https://www.deca.org/compete/business-law-and-ethics-team-decision-making"}, {"event": "Business Services Marketing", "code": "BSM", "type": "Role Play", "competitors": "1", "cluster": "Marketing", "pages": 0, "presentation": 10, "url": "https://www.deca.org/compete/business-services-marketing-series"}, {"event": "Business Services Operations", "code": "BOR", "type": "Prepared", "competitors": "1-3", "cluster": "Business Management and Administration", "pages": 20, "presentation": 15, "url": "https://www.deca.org/compete/business-services-operations-research"}, {"event": "Business Solutions Project", "code": "PMBS", "type": "Prepared", "competitors": "1-3", "cluster": "Business Management and Administration", "pages": 20, "presentation": 15, "url": "https://www.deca.org/compete/business-solutions-project"}, {"event": "Buying and Merchandising Operations", "code": "BMOR", "type": "Prepared", "competitors": "1-3", "cluster": "Marketing", "pages": 20, "presentation": 15, "url": "https://www.deca.org/compete/buying-and-merchandising-operations-research"}, {"event": "Buying and Merchandising Team", "code": "BTDM", "type": "Role Play", "competitors": "2", "cluster": "Marketing", "pages": 0, "presentation": 15, "url": "https://www.deca.org/compete/buying-and-merchandising-team-decision-making"}, {"event": "Career Development Project", "code": "PMCD", "type": "Prepared", "competitors": "1-3", "cluster": "Business Management and Administration", "pages": 20, "presentation": 15, "url": "https://www.deca.org/compete/career-development-project"}, {"event": "Community Awareness Project", "code": "PMCA", "type": "Prepared", "competitors": "1-3", "cluster": "Business Management and Administration", "pages": 20, "presentation": 15, "url": "https://www.deca.org/compete/community-awareness-project"}, {"event": "Community Giving Project", "code": "PMCG", "type": "Prepared", "competitors": "1-3", "cluster": "Business Management and Administration", "pages": 20, "presentation": 15, "url": "https://www.deca.org/compete/community-giving-project"}, {"event": "Entrepreneurship", "code": "ENT", "type": "Role Play", "competitors": "1", "cluster": "Entrepreneurship", "pages": 0, "presentation": 10, "url": "https://www.deca.org/compete/entrepreneurship-series"}, {"event": "Entrepreneurship Team", "code": "ETDM", "type": "Role Play", "competitors": "2", "cluster": "Entrepreneurship", "pages": 0, "presentation": 15, "url": "https://www.deca.org/compete/entrepreneurship-team-decision-making"}, {"event": "Finance Operations", "code": "FOR", "type": "Prepared", "competitors": "1-3", "cluster": "Finance", "pages": 20, "presentation": 15, "url": "https://www.deca.org/compete/finance-operations-research"}, {"event": "Financial Consulting", "code": "FCE", "type": "Prepared", "competitors": "1", "cluster": "Finance", "pages": 0, "presentation": 15, "url": "https://www.deca.org/compete/financial-consulting"}, {"event": "Financial Literacy Project", "code": "PMFL", "type": "Prepared", "competitors": "1-3", "cluster": "Business Management and Administration", "pages": 20, "presentation": 15, "url": "https://www.deca.org/compete/financial-literacy-project"}, {"event": "Financial Services Team", "code": "FTDM", "type": "Role Play", "competitors": "2", "cluster": "Finance", "pages": 0, "presentation": 15, "url": "https://www.deca.org/compete/financial-services-team-decision-making"}, {"event": "Food Marketing", "code": "FMS", "type": "Role Play", "competitors": "1", "cluster": "Marketing", "pages": 0, "presentation": 10, "url": "https://www.deca.org/compete/food-marketing-series"}, {"event": "Franchise Business Plan", "code": "EFB", "type": "Prepared", "competitors": "1-3", "cluster": "Entrepreneurship", "pages": 20, "presentation": 15, "url": "https://www.deca.org/compete/franchise-business-plan"}, {"event": "Hospitality Services Team", "code": "HTDM", "type": "Role Play", "competitors": "2", "cluster": "Hospitality and Tourism", "pages": 0, "presentation": 15, "url": "https://www.deca.org/compete/hospitality-services-team-decision-making"}, {"event": "Hospitality and Tourism Operations", "code": "HTOR", "type": "Prepared", "competitors": "1-3", "cluster": "Hospitality and Tourism", "pages": 20, "presentation": 15, "url": "https://www.deca.org/compete/hospitality-and-tourism-operations-research"}, {"event": "Hospitality and Tourism Professional Selling", "code": "HTPS", "type": "Prepared", "competitors": "1", "cluster": "Hospitality and Tourism", "pages": 0, "presentation": 15, "url": "https://www.deca.org/compete/hospitality-and-tourism-professional-selling"}, {"event": "Hotel and Lodging Management", "code": "HLM", "type": "Role Play", "competitors": "1", "cluster": "Hospitality and Tourism", "pages": 0, "presentation": 10, "url": "https://www.deca.org/compete/hotel-and-lodging-management-series"}, {"event": "Human Resources Management", "code": "HRM", "type": "Role Play", "competitors": "1", "cluster": "Business Management and Administration", "pages": 0, "presentation": 10, "url": "https://www.deca.org/compete/human-resources-management-series"}, {"event": "Independent Business Plan", "code": "EIB", "type": "Prepared", "competitors": "1-3", "cluster": "Entrepreneurship", "pages": 20, "presentation": 15, "url": "https://www.deca.org/compete/independent-business-plan"}, {"event": "Innovation Plan", "code": "EIP", "type": "Prepared", "competitors": "1-3", "cluster": "Entrepreneurship", "pages": 0, "presentation": 15, "url": "https://www.deca.org/compete/innovation-plan"}, {"event": "Integrated Marketing Campaign- Event", "code": "IMCE", "type": "Prepared", "competitors": "1-3", "cluster": "Marketing", "pages": 0, "presentation": 15, "url": "https://www.deca.org/compete/integrated-marketing-campaign-event"}, {"event": "Integrated Marketing Campaign- Product", "code": "IMCP", "type": "Prepared", "competitors": "1-3", "cluster": "Marketing", "pages": 0, "presentation": 15, "url": "https://www.deca.org/compete/integrated-marketing-campaign-product"}, {"event": "Integrated Marketing Campaign- Service", "code": "IMCS", "type": "Prepared", "competitors": "1-3", "cluster": "Marketing", "pages": 0, "presentation": 15, "url": "https://www.deca.org/compete/integrated-marketing-campaign-service"}, {"event": "International Business Plan", "code": "IBP", "type": "Prepared", "competitors": "1-3", "cluster": "Entrepreneurship", "pages": 20, "presentation": 15, "url": "https://www.deca.org/compete/international-business-plan"}, {"event": "Marketing Communications", "code": "MCS", "type": "Role Play", "competitors": "1", "cluster": "Marketing", "pages": 0, "presentation": 10, "url": "https://www.deca.org/compete/marketing-communications-series"}, {"event": "Marketing Management Team", "code": "MTDM", "type": "Role Play", "competitors": "2", "cluster": "Marketing", "pages": 0, "presentation": 15, "url": "https://www.deca.org/compete/marketing-management-team-decision-making"}, {"event": "Personal Financial Literacy", "code": "PFL", "type": "Role Play", "competitors": "1", "cluster": "Personal Financial Literacy", "pages": 0, "presentation": 10, "url": "https://www.deca.org/compete/personal-financial-literacy"}, {"event": "Principles of Business Management and Administration", "code": "PBM", "type": "Role Play", "competitors": "1", "cluster": "Business Administration Core", "pages": 0, "presentation": 10, "url": "https://www.deca.org/compete/principles-of-business-management-and-administration"}, {"event": "Principles of Entrepreneurship", "code": "PEN", "type": "Role Play", "competitors": "1", "cluster": "Business Administration Core", "pages": 0, "presentation": 10, "url": "https://www.deca.org/compete/principles-of-entrepreneurship"}, {"event": "Principles of Finance", "code": "PFN", "type": "Role Play", "competitors": "1", "cluster": "Business Administration Core", "pages": 0, "presentation": 10, "url": "https://www.deca.org/compete/principles-of-finance"}, {"event": "Principles of Hospitality and Tourism", "code": "PHT", "type": "Role Play", "competitors": "1", "cluster": "Business Administration Core", "pages": 0, "presentation": 10, "url": "https://www.deca.org/compete/principles-of-hospitality"}, {"event": "Principles of Marketing", "code": "PMK", "type": "Role Play", "competitors": "1", "cluster": "Business Administration Core", "pages": 0, "presentation": 10, "url": "https://www.deca.org/compete/principles-of-marketing"}, {"event": "Professional Selling", "code": "PSE", "type": "Prepared", "competitors": "1", "cluster": "Marketing", "pages": 0, "presentation": 15, "url": "https://www.deca.org/compete/professional-selling"}, {"event": "Quick Serve Restaurant Management", "code": "QSRM", "type": "Role Play", "competitors": "1", "cluster": "Hospitality and Tourism", "pages": 0, "presentation": 10, "url": "https://www.deca.org/compete/quick-serve-restaurant-management-series"}, {"event": "Restaurant and Food Services Management", "code": "RFSM", "type": "Role Play", "competitors": "1", "cluster": "Hospitality and Tourism", "pages": 0, "presentation": 10, "url": "https://www.deca.org/compete/restaurant-and-food-service-management-series"}, {"event": "Retail Merchandising", "code": "RMS", "type": "Role Play", "competitors": "1", "cluster": "Marketing", "pages": 0, "presentation": 10, "url": "https://www.deca.org/compete/retail-merchandising-series"}, {"event": "Sales Project", "code": "PMSP", "type": "Prepared", "competitors": "1-3", "cluster": "Business Management and Administration", "pages": 20, "presentation": 15, "url": "https://www.deca.org/compete/sales-project"}, {"event": "Sports and Entertainment Marketing", "code": "SEM", "type": "Role Play", "competitors": "1", "cluster": "Marketing", "pages": 0, "presentation": 10, "url": "https://www.deca.org/compete/sports-and-entertainment-marketing-series"}, {"event": "Sports and Entertainment Marketing Operations", "code": "SEOR", "type": "Prepared", "competitors": "1-3", "cluster": "Marketing", "pages": 20, "presentation": 15, "url": "https://www.deca.org/compete/sports-and-entertainment-marketing-operations-research"}, {"event": "Sports and Entertainment Team", "code": "STDM", "type": "Role Play", "competitors": "2", "cluster": "Marketing", "pages": 0, "presentation": 15, "url": "https://www.deca.org/compete/sports-and-entertainment-marketing-team-decision-making"}, {"event": "Start-up Business Plan", "code": "ESB", "type": "Prepared", "competitors": "1-3", "cluster": "Entrepreneurship", "pages": 0, "presentation": 15, "url": "https://www.deca.org/compete/start-up-business-plan"}, {"event": "Stock Market Game", "code": "SMG", "type": "Virtual", "competitors": "1-3", "cluster": "Finance", "pages": 10, "presentation": 15, "url": "https://www.deca.org/compete/stock-market-game"}, {"event": "Travel and Tourism Team", "code": "TTDM", "type": "Role Play", "competitors": "2", "cluster": "Hospitality and Tourism", "pages": 0, "presentation": 15, "url": "https://www.deca.org/compete/travel-and-tourism-team-decision-making"}, {"event": "Virtual Business Challenge- Accounting", "code": "VBCAC", "type": "Virtual", "competitors": "1-3", "cluster": "Finance", "pages": 0, "presentation": 0, "url": "https://www.deca.org/compete/virtual-business-challenge-accounting"}, {"event": "Virtual Business Challenge- Entrepreneurship", "code": "VBCEN", "type": "Virtual", "competitors": "1-3", "cluster": "Entrepreneurship", "pages": 0, "presentation": 0, "url": "https://www.deca.org/compete/virtual-business-challenge-entrepreneurship"}, {"event": "Virtual Business Challenge- Fashion", "code": "VBCFA", "type": "Virtual", "competitors": "1-3", "cluster": "Marketing", "pages": 0, "presentation": 0, "url": "https://www.deca.org/compete/virtual-business-challenge-fashion"}, {"event": "Virtual Business Challenge- Hotel Management", "code": "VBCHM", "type": "Virtual", "competitors": "1-3", "cluster": "Hospitality and Tourism", "pages": 0, "presentation": 0, "url": "https://www.deca.org/compete/virtual-business-challenge-hotel-management"}, {"event": "Virtual Business Challenge- Personal Finance", "code": "VBCPF", "type": "Virtual", "competitors": "1-3", "cluster": "Personal Financial Literacy", "pages": 0, "presentation": 0, "url": "https://www.deca.org/compete/virtual-business-challenge-personal-finance"}, {"event": "Virtual Business Challenge- Restaurant", "code": "VBCRS", "type": "Virtual", "competitors": "1-3", "cluster": "Hospitality and Tourism", "pages": 0, "presentation": 0, "url": "https://www.deca.org/compete/virtual-business-challenge-restaurant"}, {"event": "Virtual Business Challenge- Retail", "code": "VBCRT", "type": "Virtual", "competitors": "1-3", "cluster": "Marketing", "pages": 0, "presentation": 0, "url": "https://www.deca.org/compete/virtual-business-challenge-retail"}, {"event": "Virtual Business Challenge- Sports", "code": "VBCSP", "type": "Virtual", "competitors": "1-3", "cluster": "Marketing", "pages": 0, "presentation": 0, "url": "https://www.deca.org/compete/virtual-business-challenge-sports"}];

const FILTER_GROUPS = [
  { key: 'type', label: 'Event Type', options: ['Role Play', 'Prepared', 'Virtual'] },
  { key: 'competitors', label: 'Competitors', options: ['1', '2', '1-3'], optionLabels: { '1': '1 (Individual)', '2': '2 (Team)', '1-3': '1–3 (Individual or Team)' } },
  { key: 'cluster', label: 'Career Cluster', options: ['Business Administration Core', 'Business Management and Administration', 'Entrepreneurship', 'Finance', 'Hospitality and Tourism', 'Marketing', 'Personal Financial Literacy'] },
  { key: 'pages', label: 'Written Pages', options: [0, 10, 20], optionLabels: { 0: 'None', 10: '10 pages', 20: '20 pages' } },
  { key: 'presentation', label: 'Presentation Time', options: [0, 10, 15], optionLabels: { 0: 'None', 10: '10 minutes', 15: '15 minutes' } },
];

const activeFilters = {
  type: new Set(),
  competitors: new Set(),
  cluster: new Set(),
  pages: new Set(),
  presentation: new Set(),
};

function buildFilterBar() {
  const container = document.querySelector('[data-filter-bar]');
  if (!container) return;

  FILTER_GROUPS.forEach((group) => {
    const wrap = document.createElement('div');
    wrap.className = 'relative';
    wrap.dataset.filterDropdown = group.key;

    const trigger = document.createElement('button');
    trigger.type = 'button';
    trigger.dataset.filterTrigger = group.key;
    trigger.className = 'filter-trigger flex items-center gap-2 rounded-full border border-ink-200 bg-white px-4 py-2 text-sm font-medium text-ink-700 hover:border-blue-400 transition-colors';
    trigger.innerHTML = `
      <span data-trigger-label>${group.label}</span>
      <span data-trigger-badge class="hidden inline-flex items-center justify-center w-5 h-5 rounded-full bg-blue-600 text-cream-50 text-[10px] font-semibold"></span>
      <svg class="w-3.5 h-3.5 text-ink-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
      </svg>
    `;

    const panel = document.createElement('div');
    panel.dataset.filterPanel = group.key;
    panel.dataset.open = 'false';
    panel.className = 'hidden absolute left-0 z-20 mt-2 w-64 rounded-lg border border-ink-200 bg-white shadow-lg p-3';

    group.options.forEach((value) => {
      const label = document.createElement('label');
      label.className = 'flex items-center gap-2.5 px-2 py-2 rounded-md hover:bg-ink-50 cursor-pointer text-sm text-ink-700';

      const input = document.createElement('input');
      input.type = 'checkbox';
      input.dataset.filterGroup = group.key;
      input.dataset.filterValue = String(value);
      input.className = 'w-4 h-4 rounded border-ink-300 text-blue-600 focus:ring-blue-500 focus:ring-offset-0';
      input.addEventListener('change', () => toggleFilterValue(group.key, String(value), input.checked));

      const text = document.createElement('span');
      text.textContent = (group.optionLabels && group.optionLabels[value]) || String(value);

      label.appendChild(input);
      label.appendChild(text);
      panel.appendChild(label);
    });

    trigger.addEventListener('click', (event) => {
      event.stopPropagation();
      const isOpen = panel.dataset.open === 'true';
      closeAllFilterPanels();
      if (!isOpen) {
        panel.dataset.open = 'true';
        panel.classList.remove('hidden');
      }
    });

    wrap.appendChild(trigger);
    wrap.appendChild(panel);
    container.appendChild(wrap);
  });

  document.addEventListener('click', (event) => {
    document.querySelectorAll('[data-filter-dropdown]').forEach((dropdown) => {
      if (!dropdown.contains(event.target)) {
        const panel = dropdown.querySelector('[data-filter-panel]');
        panel.dataset.open = 'false';
        panel.classList.add('hidden');
      }
    });
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeAllFilterPanels();
  });
}

function closeAllFilterPanels() {
  document.querySelectorAll('[data-filter-panel]').forEach((panel) => {
    panel.dataset.open = 'false';
    panel.classList.add('hidden');
  });
}

function updateTriggerBadge(groupKey) {
  const trigger = document.querySelector(`[data-filter-trigger="${groupKey}"]`);
  const badge = trigger.querySelector('[data-trigger-badge]');
  const count = activeFilters[groupKey].size;

  badge.classList.toggle('hidden', count === 0);
  badge.textContent = String(count);
  trigger.classList.toggle('border-blue-400', count > 0);
  trigger.classList.toggle('text-blue-700', count > 0);
}

function toggleFilterValue(groupKey, value, isChecked) {
  if (isChecked) {
    activeFilters[groupKey].add(value);
  } else {
    activeFilters[groupKey].delete(value);
  }
  updateTriggerBadge(groupKey);
  render();
}

function clearAllFilters() {
  Object.keys(activeFilters).forEach((key) => {
    activeFilters[key].clear();
    updateTriggerBadge(key);
  });
  document.querySelectorAll('[data-filter-panel] input[type="checkbox"]').forEach((input) => {
    input.checked = false;
  });
  render();
}

function matchesFilters(evt) {
  return Object.keys(activeFilters).every((key) => {
    const set = activeFilters[key];
    if (set.size === 0) return true;
    return set.has(String(evt[key]));
  });
}

function render() {
  const grid = document.querySelector('[data-events-grid]');
  const countEl = document.querySelector('[data-events-count]');
  const emptyEl = document.querySelector('[data-events-empty]');
  const clearBtn = document.querySelector('[data-clear-filters]');
  if (!grid) return;

  const anyActive = Object.values(activeFilters).some((set) => set.size > 0);
  clearBtn?.classList.toggle('hidden', !anyActive);

  const matches = EVENTS.filter(matchesFilters);

  countEl.textContent = `Showing ${matches.length} of ${EVENTS.length} events`;
  emptyEl.classList.toggle('hidden', matches.length !== 0);

  grid.innerHTML = matches.map((evt) => `
    <a href="${evt.url}" target="_blank" rel="noopener noreferrer" class="group flex items-start justify-between gap-2 rounded-lg border border-ink-200 bg-white px-5 py-4 hover:shadow-md hover:border-blue-300 transition-all">
      <span>
        <span class="block font-serif text-base font-semibold text-ink-900">${evt.event}</span>
        <span class="block mt-1 text-xs font-mono uppercase tracking-wide text-blue-600">${evt.code}</span>
      </span>
      <svg class="w-4 h-4 mt-1 text-ink-300 group-hover:text-blue-500 transition-colors flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M7 17L17 7M17 7H9M17 7v8" />
      </svg>
    </a>
  `).join('');
}

document.addEventListener('DOMContentLoaded', () => {
  buildFilterBar();
  document.querySelector('[data-clear-filters]')?.addEventListener('click', clearAllFilters);
  render();
});
