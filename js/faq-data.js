/**
 * faq-data.js
 * Single source of truth for faq.html: the accordion content, the category
 * pills, and the FAQPage JSON-LD are all generated from this array by
 * scripts/build-static-pages.js. Edit here, then rebuild — never hand-edit
 * the rendered <details> blocks in faq.html.
 */
const FAQ_DATA = [
  {
    id: 'about-trailmark',
    label: 'About TrailMark',
    items: [
      {
        id: 'what-is-trailmark',
        q: 'What is TrailMark?',
        a: 'An illustrated archive of all 63 U.S. national parks. Each park has its own painting, badge, and chapter covering the landscape, wildlife, geology, seasons, photography, and how to visit responsibly.',
      },
      {
        id: 'affiliated-with-nps',
        q: 'Is TrailMark part of the National Park Service?',
        a: 'No. TrailMark is an independent project and isn’t affiliated with or endorsed by the NPS. Park facts come from NPS sources, and for anything official (permits, closures, emergencies) the <a href="https://www.nps.gov/">NPS</a> is the authority.',
      },
      {
        id: 'who-makes-trailmark',
        q: 'Who makes TrailMark?',
        a: 'It’s designed and built by Yegor Hambaryan, a web designer and developer in New York. (<a href="about.html">More on the About page</a>.)',
      },
      {
        id: 'photographs-or-illustrations',
        q: 'Are the pictures photographs?',
        a: 'The park paintings and badges are illustrations created for TrailMark. Visitor photos (on the <a href="photos.html">Photos page</a> and park pages) are real photographs shared with permission and credited.',
      },
      {
        id: 'where-information-comes-from',
        q: 'Where does the information come from?',
        a: 'Each chapter is researched from National Park Service pages, and the sources are recorded for every park. Numbers that can’t be confirmed are left out.',
      },
      {
        id: 'is-it-free',
        q: 'Is it free?',
        a: 'Yes. No ads, no account.',
      },
      {
        id: 'how-often-updated',
        q: 'How often is it updated?',
        a: 'Park chapters are revised when better information comes in. The <a href="today.html">Today page</a> refreshes from official NPS data every day.',
      },
    ],
  },
  {
    id: 'using-the-site',
    label: 'Using the site',
    items: [
      {
        id: 'find-a-park',
        q: 'How do I find a park?',
        a: 'Use <a href="parks.html">Parks</a> in the menu to see all 63, then filter by region, state, or landscape, or search by name.',
      },
      {
        id: 'today-page',
        q: 'What does the Today page show?',
        a: 'For each park: current NPS alerts and closures, today’s hours, visitor-center hours, and entrance-fee information, refreshed daily from NPS data, with an “as of” time. Conditions change quickly, so always confirm with NPS before you go. (<a href="today.html">See the Today page</a>.)',
      },
      {
        id: 'badges',
        q: 'What are the badges?',
        a: 'Every park has its own circular mark. They’re part of the collection on the homepage and <a href="about.html">About page</a>.',
      },
      {
        id: 'works-on-phone',
        q: 'Does it work on my phone?',
        a: 'Yes. TrailMark is built mobile-first and loads light.',
      },
      {
        id: 'accessible',
        q: 'Is TrailMark accessible?',
        a: 'It aims for WCAG 2.2 AA: pages work from the keyboard, including the menu, the park filters, and the chapter links on a park page; text stays at a contrast of at least 4.5:1, including type over paintings; images carry alt text; and reduced motion turns off the crossfade, parallax, badge tilt, and scroll reveals while leaving the content visible. Report problems via <a href="contact.html">Contact</a>.',
      },
    ],
  },
  {
    id: 'planning-a-visit',
    label: 'Planning a visit',
    items: [
      {
        id: 'how-many-parks',
        q: 'How many national parks are there?',
        a: '63 sites carry the “National Park” title. The National Park Service manages more than 400 sites in total, including monuments, historic sites, and seashores.',
      },
      {
        id: 'reservations',
        q: 'Do I need a reservation to enter?',
        a: 'Some parks require timed-entry or vehicle reservations during busy seasons, and the rules change year to year. Check the park’s NPS page and <a href="https://www.recreation.gov/">Recreation.gov</a> before you go.',
      },
      {
        id: 'cost',
        q: 'How much does it cost?',
        a: 'Many parks charge an entrance fee and some are free. Annual passes like America the Beautiful cover entrance at all national parks. Fees change, so check nps.gov (the <a href="today.html">Today page</a> shows the current fee NPS lists).',
      },
      {
        id: 'free-days',
        q: 'Are there free entrance days?',
        a: 'Yes, the NPS sets several fee-free days each year. Check the <a href="https://www.nps.gov/planyourvisit/fee-free-parks.htm">NPS fee-free days page</a> for this year’s dates.',
      },
      {
        id: 'best-time-to-visit',
        q: 'When is the best time to visit?',
        a: 'It depends on the park. Each chapter has a Seasons section describing what each part of the year is like there (for example, <a href="parks/yosemite.html#park-seasons">Yosemite’s seasons</a>).',
      },
      {
        id: 'dogs',
        q: 'Can I bring my dog?',
        a: 'Rules vary by park. Pets are usually allowed in developed areas and on some trails, but not in most backcountry. Check the park’s <a href="https://www.nps.gov/subjects/pets/index.htm">pets page on NPS</a>.',
      },
      {
        id: 'drones',
        q: 'Can I fly a drone?',
        a: 'Launching or landing drones is prohibited in national parks without special authorization.',
      },
      {
        id: 'wildlife-distance',
        q: 'How close can I get to wildlife?',
        a: 'Keep your distance. <a href="https://www.nps.gov/subjects/watchingwildlife/7ways.htm">NPS guidance</a> commonly asks for at least 100 yards from bears and wolves and 25 yards from other large animals, and some parks set their own rules. Never feed wildlife.',
      },
      {
        id: 'cell-service',
        q: 'Will I have cell service?',
        a: 'Often not. Download maps and park info before you go, and tell someone your plans.',
      },
      {
        id: 'emergency',
        q: 'What should I do in an emergency?',
        a: 'Call 911. For park-specific emergencies and rangers, use the contact information on the park’s NPS page.',
      },
    ],
  },
  {
    id: 'photos-stories',
    label: 'Photos & stories',
    items: [
      {
        id: 'share-photos',
        q: 'Can I share my photos?',
        a: 'Yes. Use the form on the <a href="photos.html">Photos page</a>. Every photo is reviewed, and the ones that fit are added to that park’s page with your name.',
      },
      {
        id: 'photo-rights',
        q: 'Do I keep the rights to my photo?',
        a: 'Yes. Sharing gives TrailMark permission to publish it with credit, and location data is removed before posting.',
      },
      {
        id: 'share-a-story',
        q: 'Can I share a story from a park?',
        a: 'Yes, same form. Stories may be featured on the park’s page with your permission.',
      },
    ],
  },
  {
    id: 'corrections-contact',
    label: 'Corrections & contact',
    items: [
      {
        id: 'found-a-mistake',
        q: 'I found a mistake.',
        a: 'Thank you. Use the <a href="contact.html">Contact page</a>, choose “Correction”, and include the park and what’s wrong (and a source if you have one).',
      },
      {
        id: 'use-illustrations',
        q: 'Can I use TrailMark’s illustrations?',
        a: 'Not without permission. Ask via <a href="contact.html">Contact</a>.',
      },
      {
        id: 'get-in-touch',
        q: 'How do I get in touch?',
        a: 'The <a href="contact.html">Contact page</a>.',
      },
    ],
  },
];

if (typeof module !== 'undefined' && module.exports) module.exports = FAQ_DATA;
