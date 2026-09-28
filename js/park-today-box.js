/*
  park-today-box.js
  Fills the "Today at [Park]" placeholder (id="today-at-park", rendered by
  park-render.js directly below the hero) with the same data today.html
  uses, scoped to this one park.

  Stale-data guard: when data/park-status.json's generatedAt is null or
  more than 48 hours old, this box shows nothing at all — the stale
  message only appears on today.html. The box also stays hidden if the
  data is fresh but this one park genuinely has no entry.
*/
(function () {
  var box = document.getElementById('today-at-park');
  if (!box || typeof PARKS === 'undefined' || !window.trailmarkParkStatus) return;
  var STATUS = window.trailmarkParkStatus;

  var mount = document.getElementById('park-page');
  var parkId = mount && mount.dataset.parkId;
  var park = parkId && PARKS.filter(function (p) { return p.id === parkId; })[0];
  if (!park) return;

  function esc(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function hasAnyData(entry) {
    if (!entry) return false;
    return Boolean(entry.standardHours)
      || (entry.alerts && entry.alerts.length)
      || (entry.visitorCenters && entry.visitorCenters.length)
      || entry.feeSummary;
  }

  fetch('../data/park-status.json', { cache: 'no-store' })
    .then(function (response) { return response.ok ? response.json() : null; })
    .catch(function () { return null; })
    .then(function (json) {
      var entry = json && json.parks && json.parks[parkId];
      var npsHref = (entry && entry.parkUrl) || ('https://www.nps.gov/' + park.npsCode + '/');
      var dataFresh = STATUS.isDataFresh(json && json.generatedAt);

      if (!dataFresh) return; // stale/missing data — show nothing on park pages

      if (!hasAnyData(entry)) return; // fresh data, but nothing for this park — stays hidden

      var dateKey = STATUS.todayKeyInZone(park.timeZone);
      var status = STATUS.statusLineFor(entry, dateKey);
      var isClosureActive = STATUS.hasClosureAlert(entry);

      var parts = [];
      parts.push('<p class="today-box-kicker">Today at ' + esc(park.name) + '</p>');
      if (status.line) {
        parts.push('<p class="today-box-status">' + esc(status.line) + (status.exceptionName ? ' (' + esc(status.exceptionName) + ')' : '') + '</p>');
      }
      if (isClosureActive) {
        parts.push('<p class="today-box-closure-flag">Closure alerts active</p>');
      }
      if (entry.alerts && entry.alerts.length) {
        var items = entry.alerts.slice(0, 2).map(function (alert) {
          return '<li><span class="today-box-chip">' + esc(alert.category || 'Alert') + '</span> '
            + '<a href="' + esc(alert.url || npsHref) + '" target="_blank" rel="noopener">' + esc(alert.title) + '</a></li>';
        }).join('');
        parts.push('<ul class="today-box-alerts">' + items + '</ul>');
      }
      parts.push('<div class="today-box-links">'
        + '<a href="../today.html#park-' + esc(parkId) + '">See all parks today</a>'
        + '<a href="' + esc(npsHref) + '" target="_blank" rel="noopener">NPS alerts for ' + esc(park.name) + '</a>'
        + '</div>');

      box.innerHTML = parts.join('');
      box.hidden = false;
    });
})();
