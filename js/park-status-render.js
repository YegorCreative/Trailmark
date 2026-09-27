/*
  park-status-render.js
  Pure helpers shared by today.js (the full grid) and the per-park "Today at"
  box: date/time-zone math, NPS hours lookup for a given calendar date, and a
  best-effort match of a park essay's current-season line. No DOM access, so
  it can be unit-reasoned about and reused from either script.
*/
(function (root) {
  var WEEKDAYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  var SEASON_WORDS = {
    winter: ['winter'],
    spring: ['spring'],
    summer: ['summer'],
    autumn: ['autumn', 'fall'],
  };

  function pad(n) { return n < 10 ? '0' + n : String(n); }

  function localDateKey(date) {
    return date.getFullYear() + '-' + pad(date.getMonth() + 1) + '-' + pad(date.getDate());
  }

  function partsInZone(date, timeZone) {
    var fmt = new Intl.DateTimeFormat('en-US', {
      timeZone: timeZone, year: 'numeric', month: '2-digit', day: '2-digit',
    });
    var out = {};
    fmt.formatToParts(date).forEach(function (part) { out[part.type] = part.value; });
    return out.year + '-' + out.month + '-' + out.day;
  }

  function todayKeyInZone(timeZone) {
    try {
      return partsInZone(new Date(), timeZone);
    } catch (error) {
      return localDateKey(new Date());
    }
  }

  function weekdayOfDateKey(dateKey) {
    var d = new Date(dateKey + 'T12:00:00Z');
    return WEEKDAYS[d.getUTCDay()];
  }

  function monthOfDateKey(dateKey) {
    return Number(dateKey.slice(5, 7)) - 1; // 0-11
  }

  function addMonthsToDateKey(dateKey, months) {
    var parts = dateKey.split('-').map(Number);
    var d = new Date(Date.UTC(parts[0], parts[1] - 1 + months, parts[2]));
    return d.getUTCFullYear() + '-' + pad(d.getUTCMonth() + 1) + '-' + pad(d.getUTCDate());
  }

  function findActiveException(exceptions, dateKey) {
    if (!exceptions || !exceptions.length) return null;
    var match = exceptions.filter(function (exception) {
      return exception.startDate && exception.endDate
        && dateKey >= exception.startDate && dateKey <= exception.endDate;
    });
    return match.length ? match[0] : null;
  }

  function hoursForDate(entry, dateKey) {
    if (!entry || !entry.standardHours) return { text: null, exceptionName: null };
    var weekday = weekdayOfDateKey(dateKey);
    var exception = findActiveException(entry.exceptions, dateKey);
    var hoursObj = exception && exception.hours ? exception.hours : entry.standardHours;
    var raw = hoursObj ? hoursObj[weekday] : null;
    return { text: raw || null, exceptionName: exception ? exception.name : null };
  }

  // { line, kind } where kind is one of: 'allday' | 'closed' | 'specific' | 'unknown'
  function statusLineFor(entry, dateKey) {
    var hours = hoursForDate(entry, dateKey);
    if (!hours.text) return { line: null, kind: 'unknown', exceptionName: null };
    var normalized = hours.text.trim().toLowerCase();
    if (normalized === 'all day') {
      return { line: 'Open 24 hours', kind: 'allday', exceptionName: hours.exceptionName };
    }
    if (normalized === 'closed') {
      return { line: 'Closed today, per NPS', kind: 'closed', exceptionName: hours.exceptionName };
    }
    return { line: 'Hours today: ' + hours.text, kind: 'specific', exceptionName: hours.exceptionName };
  }

  var FRESHNESS_WINDOW_MS = 48 * 60 * 60 * 1000;

  // True only when generatedAt parses to a real date within the last 48
  // hours. Null, missing, unparsable, or older all count as stale — the
  // UI must not show any status/hours/fee/alert built from stale data.
  function isDataFresh(generatedAt, now) {
    if (!generatedAt) return false;
    var generated = new Date(generatedAt);
    if (isNaN(generated.getTime())) return false;
    var reference = now instanceof Date ? now : new Date();
    return reference.getTime() - generated.getTime() <= FRESHNESS_WINDOW_MS;
  }

  function hasClosureAlert(entry) {
    return Boolean(entry && Array.isArray(entry.alerts)
      && entry.alerts.some(function (alert) { return alert.category === 'Park Closure'; }));
  }

  // Best-effort match of one seasons.items[] entry to a calendar month.
  // Essays don't share one vocabulary for season names, so this only
  // returns a result when it can match a real season word — otherwise
  // null, so the UI can omit the line rather than mislabel one.
  function pickSeasonLine(essay, monthIndex) {
    var items = essay && essay.seasons && essay.seasons.items;
    if (!items || !items.length) return null;
    var seasonName = monthIndex <= 1 || monthIndex === 11 ? 'winter'
      : monthIndex <= 4 ? 'spring'
      : monthIndex <= 7 ? 'summer'
      : 'autumn';
    var words = SEASON_WORDS[seasonName];
    var byModifier = items.filter(function (item) { return words.indexOf(item.modifier) !== -1; })[0];
    if (byModifier) return { title: byModifier.name, body: byModifier.body };
    var byName = items.filter(function (item) {
      var lower = String(item.name || '').toLowerCase();
      return words.some(function (word) { return lower.indexOf(word) !== -1; });
    })[0];
    if (byName) return { title: byName.name, body: byName.body };
    return null;
  }

  root.trailmarkParkStatus = {
    WEEKDAYS: WEEKDAYS,
    STALE_MESSAGE: "Live park conditions aren't available right now. Check the National Park Service before you go.",
    isDataFresh: isDataFresh,
    localDateKey: localDateKey,
    todayKeyInZone: todayKeyInZone,
    weekdayOfDateKey: weekdayOfDateKey,
    monthOfDateKey: monthOfDateKey,
    addMonthsToDateKey: addMonthsToDateKey,
    findActiveException: findActiveException,
    hoursForDate: hoursForDate,
    statusLineFor: statusLineFor,
    hasClosureAlert: hasClosureAlert,
    pickSeasonLine: pickSeasonLine,
  };
})(typeof window !== 'undefined' ? window : globalThis);
