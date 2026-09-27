# park-status.json fallback sources

`data/park-status.json` as committed is **not** output from `scripts/fetch-park-status.js` — no `NPS_API_KEY` was available in this environment to run it. It is a hand-built fallback with `generatedAt: null`, so `today.html` shows "NPS data not yet available" rather than any specific claim, for every park except the five below.

Those five were named in the task as the live-page validation spot-check. Their alerts, hours, and fees were read directly from nps.gov on 2026-09-27 and encoded by hand into the same schema `fetch-park-status.js` produces, so the UI has real content to render and the spot-check has something real to compare against. Every other park gets only its deterministic `https://www.nps.gov/<code>/` URL — no hours, fee, or alert is invented for them.

Once `NPS_API_KEY` is added to the repo's GitHub Secrets, the first scheduled (or manually dispatched) run of the `static.yml` workflow overwrites this entire file with real API data for all 63 parks, and this fallback stops mattering except as a safety net for a future fetch failure.

## Sources used

- Yosemite (yose): https://www.nps.gov/yose/planyourvisit/conditions.htm (alerts), https://www.nps.gov/yose/planyourvisit/hours.htm (open 24 hours per day, 365 days per year), https://www.nps.gov/yose/planyourvisit/fees.htm ($35.00 private vehicle, 7 consecutive days)
- Glacier (glac): https://www.nps.gov/glac/planyourvisit/conditions.htm and the global alerts filter at https://nps.gov/planyourvisit/alerts.htm?s=MT (no alert with a confirmed still-current date as of 2026-09-27 — a Sept 6–8 alpine road closure had already lapsed, so alerts is left empty rather than shown as still active), https://www.nps.gov/glac/planyourvisit/hours.htm (park open year-round, no stated closing time), https://www.nps.gov/glac/planyourvisit/fees.htm ($35.00 summer / $25.00 winter, Nov 1–Apr 30, private vehicle, 7 days)
- Everglades (ever): https://www.nps.gov/ever/planyourvisit/conditions.htm (page dated "Last Updated: September 9, 2026"; five Park Closure/Caution alerts), https://www.nps.gov/ever/planyourvisit/hours.htm (open daily, rain or shine, including holidays; Shark Valley Visitor Center 8:30 AM–6:00 PM). The page states an entrance fee exists but does not give the dollar amount on the page fetched, so `feeSummary` is left `null` rather than guessed.
- Denali (dena): https://www.nps.gov/dena/planyourvisit/conditions.htm (four Information/Caution alerts, consistent with the current date — the Winter Visitor Center opening September 24, 2026 is named directly), https://www.nps.gov/dena/planyourvisit/hours.htm (open year-round, not 24-hour-gated; specific current visitor-center hours not stated on the page fetched, so `visitorCenters` is left empty), https://www.nps.gov/dena/planyourvisit/fees.htm ($15.00 per person, age 16+, 7-day permit)
- Hawaiʻi Volcanoes (havo): https://www.nps.gov/havo/planyourvisit/conditions.htm (one ongoing Park Closure alert: a two-year construction project at the summit), https://www.nps.gov/havo/planyourvisit/hours.htm (open 24 hours a day, 7 days a week, including holidays; Welcome Center location named but not specific hours, so `visitorCenters` is left empty), https://www.nps.gov/havo/planyourvisit/fees.htm ($30.00 private vehicle, 7 days)

## What was deliberately left out

- Any alert without a title/description specific and dated enough to trust as a genuine, currently-active item (several parks' "conditions" pages mix real alerts with evergreen sections like "Weather" or "Trail Status Reports" that are not individually dated the way the NPS alerts API's `lastIndexedDate` field is).
- Everglades' entrance fee amount (page didn't state it).
- Any visitor-center hours not given as an explicit, current schedule on the page fetched (Yosemite, Glacier, Denali, Hawaiʻi Volcanoes visitor centers).
- `standardHours` for parks not confirmed as effectively 24-hour/no-gate access; represented as `"All Day"` for all seven days only where the fetched page said so explicitly ("open 24 hours," "open year-round" with no stated closing time).
