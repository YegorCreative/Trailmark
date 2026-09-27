#!/usr/bin/env node
/**
 * Pulls live operating hours, alerts, and visitor-center hours for all 63
 * parks from the NPS API (developer.nps.gov/api/v1) and writes a trimmed
 * data/park-status.json for today.html and the per-park "Today at" box.
 *
 * Requires NPS_API_KEY in the environment. Never hardcode a key here, and
 * never let one reach the browser — this script only runs in CI or a
 * developer's own shell, and only ever writes to data/park-status.json.
 *
 * On any failure this script exits non-zero and does NOT touch the existing
 * data/park-status.json, so a bad run can never clobber the last good
 * (committed) snapshot. The workflow step that calls this is expected to
 * tolerate that failure and deploy the site with the file already in git.
 */
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const API_BASE = 'https://developer.nps.gov/api/v1';
const OUTPUT = path.join(root, 'data', 'park-status.json');
const BATCH_SIZE = 20;
const REQUEST_DELAY_MS = 300;
const ALERT_CAP_PER_PARK = 8;
const VISITOR_CENTER_CAP = 3;
const DESCRIPTION_CLIP = 200;
const EXCEPTION_HORIZON_MONTHS = 12;

function load(file, returned) {
  const source = fs.readFileSync(path.join(root, file), 'utf8');
  return new Function(source + '\nreturn ' + returned + ';')();
}

function sleep(ms) {
  return new Promise(function (resolve) { setTimeout(resolve, ms); });
}

function chunk(list, size) {
  const out = [];
  for (let i = 0; i < list.length; i += size) out.push(list.slice(i, i + size));
  return out;
}

function clip(text, max) {
  const value = String(text || '').replace(/\s+/g, ' ').trim();
  if (value.length <= max) return value;
  const cut = value.slice(0, max);
  const space = cut.lastIndexOf(' ');
  return (space > max * 0.6 ? cut.slice(0, space) : cut).trim() + '…';
}

async function fetchJson(url, attempt) {
  attempt = attempt || 1;
  let response;
  try {
    response = await fetch(url, { headers: { 'User-Agent': 'TrailMark/1.0 (trailmark park status build)' } });
  } catch (error) {
    if (attempt < 2) {
      await sleep(1000);
      return fetchJson(url, attempt + 1);
    }
    throw new Error('network error fetching ' + url.split('?')[0] + ': ' + error.message);
  }
  if (!response.ok) {
    if (attempt < 2 && response.status >= 500) {
      await sleep(1000);
      return fetchJson(url, attempt + 1);
    }
    const body = await response.text().catch(function () { return ''; });
    throw new Error('HTTP ' + response.status + ' from ' + url.split('?')[0] + ': ' + body.slice(0, 200));
  }
  return response.json();
}

async function fetchAllPages(endpoint, parkCodes, apiKey, extra) {
  const items = [];
  for (const batch of chunk(parkCodes, BATCH_SIZE)) {
    const params = new URLSearchParams(Object.assign({
      parkCode: batch.join(','),
      limit: '200',
      api_key: apiKey,
    }, extra || {}));
    const url = API_BASE + endpoint + '?' + params.toString();
    const json = await fetchJson(url);
    if (Array.isArray(json.data)) items.push.apply(items, json.data);
    await sleep(REQUEST_DELAY_MS);
  }
  return items;
}

function standardHoursOf(record) {
  const hours = record && Array.isArray(record.operatingHours) ? record.operatingHours[0] : null;
  if (!hours || !hours.standardHours) return null;
  return hours.standardHours;
}

function exceptionsOf(record, horizonEnd) {
  const hours = record && Array.isArray(record.operatingHours) ? record.operatingHours[0] : null;
  const list = (hours && Array.isArray(hours.exceptions)) ? hours.exceptions : [];
  return list
    .filter(function (exception) {
      if (!exception.startDate) return false;
      const start = new Date(exception.startDate + 'T00:00:00Z');
      return start <= horizonEnd;
    })
    .map(function (exception) {
      return {
        name: exception.name || '',
        startDate: exception.startDate || '',
        endDate: exception.endDate || '',
        hours: exception.exceptionHours || null,
      };
    });
}

function feeSummaryOf(record) {
  const fees = record && Array.isArray(record.entranceFees) ? record.entranceFees : [];
  if (!fees.length) return null;
  const first = fees[0];
  const cost = parseFloat(first.cost);
  const amount = isFinite(cost) ? (cost <= 0 ? 'Free' : '$' + cost.toFixed(2).replace(/\.00$/, '')) : null;
  const title = String(first.title || '').trim();
  if (!amount && !title) return null;
  return [amount, title].filter(Boolean).join(' — ');
}

async function main() {
  const apiKey = process.env.NPS_API_KEY;
  if (!apiKey) {
    console.error('fetch-park-status: NPS_API_KEY is not set in the environment. Refusing to run.');
    console.error('The existing data/park-status.json (if any) is left untouched.');
    process.exit(1);
  }

  const parks = load('js/parks-data.js', 'PARKS');
  const codeToIds = new Map();
  parks.forEach(function (park) {
    if (!park.npsCode) return;
    if (!codeToIds.has(park.npsCode)) codeToIds.set(park.npsCode, []);
    codeToIds.get(park.npsCode).push(park.id);
  });
  const uniqueCodes = Array.from(codeToIds.keys());
  if (!uniqueCodes.length) {
    console.error('fetch-park-status: no npsCode values found in js/parks-data.js');
    process.exit(1);
  }

  console.log('Fetching status for ' + uniqueCodes.length + ' unique NPS codes (' + parks.length + ' parks)…');

  const generatedAt = new Date();
  const horizonEnd = new Date(generatedAt.getTime());
  horizonEnd.setUTCMonth(horizonEnd.getUTCMonth() + EXCEPTION_HORIZON_MONTHS);

  let parksData, alertsData, vcData;
  try {
    parksData = await fetchAllPages('/parks', uniqueCodes, apiKey);
    alertsData = await fetchAllPages('/alerts', uniqueCodes, apiKey);
    vcData = await fetchAllPages('/visitorcenters', uniqueCodes, apiKey);
  } catch (error) {
    console.error('fetch-park-status: fetch failed — ' + error.message);
    console.error('The existing data/park-status.json (if any) is left untouched.');
    process.exit(1);
  }

  const parksByCode = new Map();
  parksData.forEach(function (record) {
    if (!parksByCode.has(record.parkCode)) parksByCode.set(record.parkCode, []);
    parksByCode.get(record.parkCode).push(record);
  });
  const alertsByCode = new Map();
  alertsData.forEach(function (alert) {
    if (!alertsByCode.has(alert.parkCode)) alertsByCode.set(alert.parkCode, []);
    alertsByCode.get(alert.parkCode).push(alert);
  });
  const vcByCode = new Map();
  vcData.forEach(function (center) {
    if (!vcByCode.has(center.parkCode)) vcByCode.set(center.parkCode, []);
    vcByCode.get(center.parkCode).push(center);
  });

  const out = { generatedAt: generatedAt.toISOString(), parks: {} };
  let missingCodes = [];

  uniqueCodes.forEach(function (code) {
    const parkRecords = parksByCode.get(code) || [];
    if (!parkRecords.length) missingCodes.push(code);
    // A code can represent more than one NPS unit record (rare) or more
    // than one local park id (seki -> sequoia + kings-canyon). Merge all
    // records for the code into one status payload, then apply it to
    // every local id that shares the code.
    const standardHours = standardHoursOf(parkRecords[0]);
    let exceptions = [];
    parkRecords.forEach(function (record) {
      exceptions = exceptions.concat(exceptionsOf(record, horizonEnd));
    });
    const feeSummary = feeSummaryOf(parkRecords[0]);
    const parkUrl = parkRecords[0] && parkRecords[0].url ? parkRecords[0].url : null;

    const alerts = (alertsByCode.get(code) || [])
      .slice()
      .sort(function (a, b) { return String(b.lastIndexedDate).localeCompare(String(a.lastIndexedDate)); })
      .slice(0, ALERT_CAP_PER_PARK)
      .map(function (alert) {
        return {
          title: alert.title || '',
          category: alert.category || '',
          description: clip(alert.description, DESCRIPTION_CLIP),
          url: alert.url || '',
          lastIndexedDate: alert.lastIndexedDate || '',
        };
      });

    const visitorCenters = (vcByCode.get(code) || [])
      .filter(function (center) { return standardHoursOf(center); })
      .slice(0, VISITOR_CENTER_CAP)
      .map(function (center) {
        return { name: center.name || '', hours: standardHoursOf(center) };
      });

    const payload = { standardHours: standardHours, exceptions: exceptions, alerts: alerts, visitorCenters: visitorCenters, feeSummary: feeSummary, parkUrl: parkUrl };

    (codeToIds.get(code) || []).forEach(function (id) {
      out.parks[id] = payload;
    });
  });

  if (missingCodes.length) {
    console.error('fetch-park-status: NPS API returned no /parks record for: ' + missingCodes.join(', '));
    console.error('The existing data/park-status.json (if any) is left untouched.');
    process.exit(1);
  }

  fs.mkdirSync(path.dirname(OUTPUT), { recursive: true });
  const json = JSON.stringify(out, null, 2);
  fs.writeFileSync(OUTPUT, json + '\n');
  const kb = (Buffer.byteLength(json, 'utf8') / 1024).toFixed(1);
  console.log('Wrote ' + OUTPUT + ' (' + kb + ' KB) for ' + Object.keys(out.parks).length + ' parks.');
}

main();
