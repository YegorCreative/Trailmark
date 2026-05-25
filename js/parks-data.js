/**
 * parks-data.js
 * Master data source for all Trailmark park entries.
 * Cards are rendered dynamically by js/script.js.
 * This file is the source of truth for all park data.
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
    pageUrl: 'parks/yosemite.html',
    svgInner: `
  makePark({
    id: 'yosemite',
    name: 'Yosemite',
    state: 'California',
    region: 'West',
    shortDescription: 'Granite walls, sequoia groves, and high Sierra waterfalls gathered into one iconic valley.',
    badgeTheme: 'green',
    status: 'available',
    futureSlug: 'yosemite',
    pageUrl: 'parks/yosemite.html',
    svgInner: buildBadgeSvgInner('yosemite', 'green'),
  }),
  makePark({
    id: 'yellowstone',
    name: 'Yellowstone',
    state: 'Wyoming, Montana, Idaho',
    region: 'Mountain West',
    shortDescription: 'Geyser basins, hot springs, and wide wildlife valleys across the high plateau.',
    badgeTheme: 'blue',
    status: 'in-progress',
    futureSlug: 'yellowstone',
    svgInner: buildBadgeSvgInner('yellowstone', 'blue'),
  }),
        <clipPath id="clip-yellowstone">
          <circle cx="100" cy="100" r="82" />
        </clipPath>
      </defs>
      <circle cx="100" cy="100" r="97" fill="#1A4A6B" />
      <g clip-path="url(#clip-yellowstone)">
        <rect x="0" y="0" width="200" height="200" fill="#B8DEED" />
        <ellipse cx="30" cy="155" rx="60" ry="24" fill="#4A7A2C" />
        <ellipse cx="170" cy="155" rx="60" ry="24" fill="#4A7A2C" />
        <rect x="0" y="158" width="200" height="42" fill="#3D6B1F" />
        <ellipse cx="100" cy="148" rx="46" ry="18" fill="#096B6B" />
        <ellipse cx="100" cy="148" rx="34" ry="13" fill="#0F9090" />
        <ellipse cx="100" cy="148" rx="22" ry="8" fill="#20C0C0" />
        <ellipse cx="100" cy="148" rx="10" ry="4" fill="#60E0E0" />
        <ellipse cx="100" cy="118" rx="9" ry="20" fill="rgba(255,255,255,0.72)" />
        <ellipse cx="97" cy="97" rx="11" ry="20" fill="rgba(255,255,255,0.55)" />
        <ellipse cx="103" cy="77" rx="13" ry="22" fill="rgba(255,255,255,0.38)" />
        <ellipse cx="100" cy="57" rx="16" ry="22" fill="rgba(255,255,255,0.22)" />
      </g>
      <circle cx="100" cy="100" r="82" fill="none" stroke="#F7F3EC" stroke-width="2" stroke-dasharray="5,4" />
      <circle cx="100" cy="100" r="89" fill="none" stroke="#2A6A9B" stroke-width="1.5" />
    `,
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
    svgInner: `
      <defs>
        <clipPath id="clip-grand-canyon">
          <circle cx="100" cy="100" r="82" />
        </clipPath>
      </defs>
      <circle cx="100" cy="100" r="97" fill="#8B2210" />
      <g clip-path="url(#clip-grand-canyon)">
        <rect x="0" y="0" width="200" height="200" fill="#C9E8F5" />
        <circle cx="100" cy="44" r="18" fill="#F5C518" />
        <rect x="0" y="82"  width="200" height="14" fill="#D9A882" />
        <rect x="0" y="96"  width="200" height="13" fill="#C9896A" />
        <rect x="0" y="109" width="200" height="13" fill="#B8633A" />
        <rect x="0" y="122" width="200" height="13" fill="#A0432A" />
        <rect x="0" y="135" width="200" height="13" fill="#8B2E1A" />
        <rect x="0" y="148" width="200" height="52" fill="#5A1508" />
        <polygon points="0,82 42,62 74,82" fill="#D9A882" />
        <polygon points="126,82 158,60 200,82" fill="#D9A882" />
        <rect x="68" y="152" width="64" height="8" rx="4" fill="#4A90B8" />
      </g>
      <circle cx="100" cy="100" r="82" fill="none" stroke="#F7F3EC" stroke-width="2" stroke-dasharray="5,4" />
      <circle cx="100" cy="100" r="89" fill="none" stroke="#B03015" stroke-width="1.5" />
    `,
  },
];
