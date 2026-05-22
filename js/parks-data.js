/**
 * parks-data.js
 * Master data source for all Trailmark park entries.
 * Cards are currently rendered statically in index.html.
 * This file is the source of truth for Phase 3+ dynamic rendering.
 */

const PARKS = [
  {
    id: 'yosemite',
    name: 'Yosemite',
    state: 'California',
    region: 'West',
    shortDescription:
      'Towering granite cliffs, ancient sequoias, and cascading waterfalls in the heart of the Sierra Nevada.',
    badgeTheme: 'green',
    futureSlug: 'yosemite',
  },
  {
    id: 'yellowstone',
    name: 'Yellowstone',
    state: 'Wyoming',
    region: 'Mountain West',
    shortDescription:
      "The world\u2019s first national park \u2014 home to half the planet\u2019s geysers, boiling springs, and vast wildlife.",
    badgeTheme: 'blue',
    futureSlug: 'yellowstone',
  },
  {
    id: 'grand-canyon',
    name: 'Grand Canyon',
    state: 'Arizona',
    region: 'Southwest',
    shortDescription:
      "A mile-deep chasm carved by the Colorado River, exposing two billion years of Earth\u2019s geological history.",
    badgeTheme: 'red',
    futureSlug: 'grand-canyon',
  },
];
