/*
  today.js
  Renders today.html: loads data/park-status.json once, filters/searches the
  63-park grid, and evaluates each park's NPS hours for the selected date —
  in that park's own time zone when the date picker is still at its default.
*/
(function () {
  if (typeof PARKS === 'undefined' || !window.trailmarkParkStatus) return;
  var STATUS = window.trailmarkParkStatus;
  var CONTENT = typeof PARK_PAGE_CONTENT === 'undefined' ? {} : PARK_PAGE_CONTENT;

  var els = {
    todayDate: document.querySelector('[data-today-date]'),
    generatedAt: document.querySelector('[data-generated-at]'),
    datePicker: document.getElementById('today-date-picker'),
    futureNote: document.querySelector('[data-future-note]'),
    regionSelect: document.getElementById('today-filter-region'),
    stateSelect: document.getElementById('today-filter-state'),
    closuresCheck: document.getElementById('today-filter-closures'),
    search: document.getElementById('today-search'),
    count: document.querySelector('[data-today-count]'),
    grid: document.querySelector('[data-today-grid]'),
    empty: document.querySelector('[data-today-empty]'),
    template: document.getElementById('today-card-template'),
  };
  if (!els.grid || !els.template) return;

  var statusJson = null; // { generatedAt, parks: { id: {...} } }
  var pickerTouched = false;
  var todayKeyLocal = STATUS.localDateKey(new Date());

  function esc(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function headerImage(park) {
    var header = park.art && park.art.header;
    if (!header) return '';
    return header.replace(/header\.webp$/, 'header-640.webp');
  }

  function selectedDateKey() {
    return pickerTouched && els.datePicker.value ? els.datePicker.value : null;
  }

  function statusEntryFor(id) {
    return (statusJson && statusJson.parks && statusJson.parks[id]) || null;
  }

  function populateFilterOptions() {
    var regions = [];
    var states = [];
    PARKS.forEach(function (park) {
      if (park.region && regions.indexOf(park.region) === -1) regions.push(park.region);
      if (park.state && states.indexOf(park.state) === -1) states.push(park.state);
    });
    regions.sort();
    states.sort();
    regions.forEach(function (region) {
      var opt = document.createElement('option');
      opt.value = region; opt.textContent = region;
      els.regionSelect.appendChild(opt);
    });
    states.forEach(function (state) {
      var opt = document.createElement('option');
      opt.value = state; opt.textContent = state;
      els.stateSelect.appendChild(opt);
    });
  }

  function setupDatePicker() {
    var maxKey = STATUS.addMonthsToDateKey(todayKeyLocal, 12);
    els.datePicker.min = todayKeyLocal;
    els.datePicker.max = maxKey;
    els.datePicker.value = todayKeyLocal;
    els.datePicker.addEventListener('change', function () {
      pickerTouched = els.datePicker.value !== todayKeyLocal;
      els.futureNote.hidden = !pickerTouched;
      renderGrid();
    });
  }

  function visitorCenterHoursText(center, dateKey) {
    if (!center || !center.hours) return null;
    var weekday = STATUS.weekdayOfDateKey(dateKey);
    var raw = center.hours[weekday];
    if (!raw) return null;
    var normalized = raw.trim().toLowerCase();
    if (normalized === 'all day') return center.name + ': open 24 hours';
    if (normalized === 'closed') return center.name + ': closed today';
    return center.name + ': ' + raw;
  }

  function fillCard(node, park, entry, dateKey, showAlerts) {
    var chapterHref = park.pageUrl || ('parks/' + park.id + '.html');
    var npsHref = (entry && entry.parkUrl) || ('https://www.nps.gov/' + park.npsCode + '/');

    node.querySelectorAll('[data-card-link]').forEach(function (a) {
      a.href = chapterHref;
      if (!a.textContent.trim()) a.setAttribute('aria-label', 'View ' + park.name);
    });
    var img = node.querySelector('[data-card-img]');
    img.src = headerImage(park);
    img.alt = '';
    node.querySelector('[data-card-name]').textContent = park.name;
    node.querySelector('[data-card-name]').href = chapterHref;
    node.querySelector('[data-card-state]').textContent = park.state || '';

    var status = STATUS.statusLineFor(entry, dateKey);
    var statusEl = node.querySelector('[data-card-status]');
    if (status.line) {
      statusEl.textContent = status.line + (status.exceptionName ? ' (' + status.exceptionName + ')' : '');
    } else {
      statusEl.textContent = 'NPS hours not available yet — check NPS before you go.';
    }

    var closureFlag = node.querySelector('[data-card-closure-flag]');
    var isClosureActive = showAlerts && STATUS.hasClosureAlert(entry);
    closureFlag.hidden = !isClosureActive;

    var alertsEl = node.querySelector('[data-card-alerts]');
    alertsEl.innerHTML = '';
    if (showAlerts && entry && entry.alerts && entry.alerts.length) {
      entry.alerts.slice(0, 2).forEach(function (alert) {
        var li = document.createElement('li');
        li.className = 'today-alert-item';
        li.innerHTML = '<span class="today-alert-chip">' + esc(alert.category || 'Alert') + '</span> '
          + '<a href="' + esc(alert.url || npsHref) + '" target="_blank" rel="noopener">' + esc(alert.title) + '</a>';
        alertsEl.appendChild(li);
      });
    }

    var vcEl = node.querySelector('[data-card-vc]');
    var vcText = entry && entry.visitorCenters && entry.visitorCenters.length
      ? visitorCenterHoursText(entry.visitorCenters[0], dateKey) : null;
    vcEl.hidden = !vcText;
    if (vcText) vcEl.textContent = vcText;

    var feeEl = node.querySelector('[data-card-fee]');
    feeEl.hidden = !(entry && entry.feeSummary);
    if (entry && entry.feeSummary) feeEl.textContent = 'Entrance fee: ' + entry.feeSummary;

    var seasonEl = node.querySelector('[data-card-season]');
    var essay = CONTENT[park.id];
    var season = essay ? STATUS.pickSeasonLine(essay, STATUS.monthOfDateKey(dateKey)) : null;
    seasonEl.hidden = !season;
    if (season) seasonEl.textContent = season.body;

    node.querySelector('[data-card-chapter-link]').href = chapterHref;
    node.querySelector('[data-card-nps-link]').href = npsHref;

    node.dataset.region = park.region || '';
    node.dataset.state = park.state || '';
    node.dataset.closure = isClosureActive ? '1' : '0';
    node.dataset.search = (park.name + ' ' + (park.state || '') + ' ' + (park.region || '')).toLowerCase();
  }

  function renderGrid() {
    var dateKey = selectedDateKey() || null;
    var showAlerts = !pickerTouched;
    var sorted = PARKS.slice().sort(function (a, b) { return a.name.localeCompare(b.name); });

    els.grid.innerHTML = '';
    sorted.forEach(function (park) {
      var entry = statusEntryFor(park.id);
      var parkDateKey = dateKey || STATUS.todayKeyInZone(park.timeZone);
      var node = els.template.content.firstElementChild.cloneNode(true);
      node.id = 'park-' + park.id;
      fillCard(node, park, entry, parkDateKey, showAlerts);
      els.grid.appendChild(node);
    });

    applyFilters();
  }

  function applyFilters() {
    var region = els.regionSelect.value;
    var state = els.stateSelect.value;
    var closuresOnly = els.closuresCheck.checked;
    var query = els.search.value.trim().toLowerCase();
    var shown = 0;

    els.grid.querySelectorAll('.today-card').forEach(function (card) {
      var matches = true;
      if (region && card.dataset.region !== region) matches = false;
      if (state && card.dataset.state !== state) matches = false;
      if (closuresOnly && card.dataset.closure !== '1') matches = false;
      if (query && card.dataset.search.indexOf(query) === -1) matches = false;
      card.hidden = !matches;
      if (matches) shown++;
    });

    els.count.textContent = shown + ' of ' + PARKS.length + ' parks shown';
    els.empty.hidden = shown !== 0;
  }

  function renderHeader() {
    var now = new Date();
    els.todayDate.textContent = now.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    if (!statusJson || !statusJson.generatedAt) {
      els.generatedAt.textContent = 'NPS data as of: not yet available for this deployment. Every link below still goes straight to NPS.';
      return;
    }
    var generated = new Date(statusJson.generatedAt);
    els.generatedAt.textContent = 'NPS data as of ' + generated.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' }) + ' (your local time).';
  }

  function init() {
    populateFilterOptions();
    setupDatePicker();
    [els.regionSelect, els.stateSelect, els.closuresCheck, els.search].forEach(function (el) {
      el.addEventListener('input', applyFilters);
      el.addEventListener('change', applyFilters);
    });

    fetch('data/park-status.json', { cache: 'no-store' })
      .then(function (response) { return response.ok ? response.json() : null; })
      .catch(function () { return null; })
      .then(function (json) {
        statusJson = json;
        renderHeader();
        renderGrid();
      });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
