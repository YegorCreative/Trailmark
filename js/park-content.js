/*
  park-content.js
  Version 1 park page content schema.
  Yosemite is the canonical template entry for future park pages.
*/

const PARK_PAGE_CONTENT = {
  yosemite: {
    id: 'yosemite',
    name: 'Yosemite',
    fullName: 'Yosemite National Park',
    archiveNumber: 'TM-YOS-001',
    collection: 'Western Parks',
    region: 'West',
    state: 'California',
    landscape: 'Sierra Nevada',
    established: '1890',
    hero: {
      kicker: 'TrailMark Archive Edition',
      eyebrow: 'California | Sierra Nevada',
      title: 'Yosemite',
      subtitle: 'Granite walls hold the morning light, waterfalls speak from unseen heights, and the valley opens slowly like a preserved print pulled from its sleeve.',
      posterSrc: '../assets/svg/yosemite.svg',
      posterAlt: '',
    },
    overview: {
      kicker: 'Park Overview',
      title: 'A high Sierra sanctuary shaped by granite, water, and time',
      lead: 'Yosemite gathers some of the American Wests most recognizable forms into one valley: sheer granite, spring waterfalls, meadow light, black oak, pine shadow, and the slow presence of stone.',
      body: [
        'The park reaches far beyond Yosemite Valley, but the valley remains its emotional center. It is where scale becomes immediate, where cliffs rise like architecture, and where water turns distance into sound.',
        'TrailMark treats Yosemite as the first archive chapter because it contains the core language every future park page should carry: wonder first, meaningful context second, and a preserved sense of place throughout.',
      ],
      facts: [
        { label: 'Region', value: 'West' },
        { label: 'State', value: 'California' },
        { label: 'Protected', value: 'Since 1890' },
        { label: 'Granite Icon', value: 'El Capitan' },
        { label: 'Waterfall Season', value: 'Spring Snowmelt' },
      ],
    },
    emotionalThesis: {
      kicker: 'Emotional Thesis',
      title: 'A landscape that expands through scale, silence, and light',
      body: [
        'Yosemite Valley does not arrive all at once. It unfolds by degrees: a wall of granite catching pale morning light, water heard before it is seen, distance compressing and then opening again.',
        'The valley floor feels quiet even when it is full of movement. Pine shadow, cold river air, and the sound of falling water give the entire basin the atmosphere of a place preserved rather than merely visited.',
      ],
    },
    landscapeHighlights: {
      kicker: 'Landscape Highlights',
      title: 'Three enduring forms in the Yosemite memory',
      items: [
        {
          title: 'El Capitan',
          modifier: 'el-capitan',
          body: 'A single sheer wall rising with impossible calm, more monolith than mountain, holding the western edge of the valley in shadow and scale.',
        },
        {
          title: 'Half Dome',
          modifier: 'half-dome',
          body: 'Seen at a distance, it feels almost drawn into the skyline: stern, unmistakable, and luminous when the last light moves across its face.',
        },
        {
          title: 'Yosemite Falls',
          modifier: 'yosemite-falls',
          body: 'In spring it arrives as sound before image, a vertical rush of white water turning cliff and air into a single column of motion.',
        },
      ],
    },
    hiddenDiscoveries: {
      kicker: 'Hidden Discoveries',
      title: 'Quiet details reward visitors who slow down',
      items: [
        {
          title: 'Meadow Edges',
          body: 'The open meadows are not empty foreground. They hold seasonal water, soft grasses, animal movement, and some of the valleys clearest views of changing light.',
        },
        {
          title: 'Granite After Weather',
          body: 'Rain and snowmelt darken the stone, making cracks, ledges, and water paths visible in ways that dry summer afternoons often hide.',
        },
        {
          title: 'The Sound Before the View',
          body: 'In peak runoff, waterfalls announce themselves from around bends and through trees, turning a walk through the valley into a sequence of acoustic discoveries.',
        },
      ],
    },
    wildlife: {
      kicker: 'Wildlife',
      title: 'A living valley, not just a scenic one',
      lead: 'Yosemite supports black bears, mule deer, coyotes, bobcats, songbirds, raptors, amphibians, and countless smaller species that depend on meadow, river, forest, and cliff habitats.',
      notes: [
        'Wildlife should be observed quietly and from a respectful distance.',
        'Food storage is part of stewardship here; careless food access can harm both visitors and bears.',
        'Dawn and dusk often reveal more movement, but visitors should avoid crowding animals or blocking roads for photographs.',
      ],
    },
    geology: {
      kicker: 'Geology',
      title: 'Granite made visible by uplift, ice, and water',
      lead: 'Yosemites signature walls are the exposed remains of deep granitic rock, shaped over immense time by uplift, erosion, glaciers, rivers, and freeze-thaw weathering.',
      notes: [
        'Glaciers widened and polished the valley, leaving a form that feels carved rather than merely eroded.',
        'Domes and cliffs reveal how durable granite responds when pressure, joints, ice, and water work across geologic time.',
        'Waterfalls trace hanging valleys and steep drops left by the different depths of glacial carving.',
      ],
    },
    seasons: {
      kicker: 'Seasonal Moods',
      title: 'The same valley, four different emotional registers',
      items: [
        { name: 'Spring', modifier: 'spring', body: 'Waterfall thunder, wet granite, and river air cold enough to make the whole valley feel newly awakened.' },
        { name: 'Summer', modifier: 'summer', body: 'Heat gathers on the stone by afternoon, the walls appear even taller, and the distance shimmers with a pale mineral haze.' },
        { name: 'Autumn', modifier: 'autumn', body: 'Gold light settles lower in the valley, the crowds thin, and the meadows take on a softer, more reflective quiet.' },
        { name: 'Winter', modifier: 'winter', body: 'Blue-white silence, dark pines, and snow-held edges that turn the familiar valley into something almost monastic.' },
      ],
    },
    photography: {
      kicker: 'Photography Guidance',
      title: 'Photograph the light, not only the landmark',
      lead: 'Yosemite rewards patience. The most memorable images often come from waiting for scale, weather, shadow, and water to align rather than chasing only the famous viewpoint.',
      tips: [
        { label: 'Morning', body: 'Look for soft side light along granite walls and mist near the valley floor.' },
        { label: 'Spring', body: 'Use waterfall sound and spray as cues for atmosphere, but protect gear near heavy runoff.' },
        { label: 'Evening', body: 'Watch how the last light moves across Half Dome and the upper walls before the valley floor darkens.' },
      ],
    },
    fieldNotes: {
      quote: 'Yosemite does not reveal itself immediately. It expands slowly through scale, silence, and distance, until even the smallest movement of water or light feels monumental.',
      attribution: 'TrailMark Archive Journal',
    },
    badgeStory: {
      kicker: 'Badge Story',
      title: 'An earned mark preserved like an expedition record',
      label: 'Yosemite Mark No. 001',
      description: 'Granite, waterfall mist, and valley shadow form the first mark in the TrailMark archive. The badge is presented less as an icon and more as a kept piece of park memory.',
      notes: [
        'The circular mark reduces Yosemite to its essential forms: stone, forest, sky, and snow light.',
        'Its restrained palette gives it the feel of a preserved patch or field-journal stamp rather than a modern badge set.',
        'Placed on warm paper with quiet labeling, it reads as a collected artifact from the archives first completed chapter.',
      ],
      details: [
        { label: 'Archive No.', value: '001' },
        { label: 'Location', value: 'Yosemite Valley' },
        { label: 'Release', value: 'First Archive Mark' },
      ],
    },
    stewardship: {
      kicker: 'Stewardship / Safety',
      title: 'The park is strongest when visitors move with care',
      lead: 'Yosemites beauty depends on restraint: staying on durable surfaces, storing food correctly, respecting closures, giving wildlife space, and treating crowded places with patience.',
      items: [
        'Use marked trails and boardwalks where provided, especially around meadows and wet areas.',
        'Store food and scented items exactly as required; bear safety is visitor safety and wildlife protection.',
        'Check seasonal road, waterfall, smoke, snow, and permit conditions before committing to a plan.',
        'Give other visitors room to experience quiet, especially at overlooks, meadows, and narrow trail sections.',
      ],
    },
    archive: {
      kicker: 'Continue the Archive',
      title: 'Yosemite is the first finished chapter, not the last.',
      body: 'The TrailMark collection grows one preserved landscape at a time, each page treated as an artifact rather than a listing.',
      links: [
        { label: 'Yellowstone', status: 'In progress', href: '../index.html#park-grid' },
        { label: 'Zion', status: 'In progress', href: '../index.html#park-grid' },
        { label: 'Glacier', status: 'In progress', href: '../index.html#park-grid' },
      ],
    },
  },
  yellowstone: {
    id: 'yellowstone',
    name: 'Yellowstone',
    fullName: 'Yellowstone National Park',
    archiveNumber: 'TM-YEL-002',
    collection: 'Mountain West Parks',
    region: 'Mountain West',
    state: 'Wyoming, Montana, Idaho',
    landscape: 'Greater Yellowstone Plateau',
    established: '1872',
    hero: {
      theme: 'yellowstone',
      kicker: 'TrailMark Archive Edition',
      eyebrow: 'Wyoming | Montana | Idaho',
      title: 'Yellowstone',
      subtitle: 'Steam rises from mineral color, rivers cut through ancient volcanic stone, and broad valleys hold wildlife with a stillness that feels older than the road.',
      posterSrc: '../assets/svg/parks.svg',
      posterAlt: '',
    },
    overview: {
      kicker: 'Park Overview',
      title: 'A volcanic plateau where water, heat, and wild movement shape the story',
      lead: 'Yellowstone is the first national park in the United States and still feels elemental: geysers breathe through the ground, hot springs hold impossible color, and open valleys gather bison, elk, wolves, bears, and weather.',
      body: [
        'The park is not one landscape but a connected field of forces. Thermal basins, lodgepole forests, high lakes, canyon walls, rivers, grasslands, and snowbound passes all belong to the same restless volcanic system.',
        'TrailMark treats Yellowstone as the second archive chapter because it proves the template can hold a different kind of wonder: less granite monument, more living geology, motion, steam, and scale.',
      ],
      facts: [
        { label: 'Region', value: 'Mountain West' },
        { label: 'States', value: 'Wyoming, Montana, Idaho' },
        { label: 'Protected', value: 'Since 1872' },
        { label: 'Thermal Icon', value: 'Old Faithful' },
        { label: 'Wildlife Valleys', value: 'Lamar and Hayden' },
      ],
    },
    emotionalThesis: {
      kicker: 'Emotional Thesis',
      title: 'The ground feels alive, and the horizon never quite settles',
      body: [
        'Yellowstone asks visitors to notice motion at every scale: steam leaving a vent, a river turning through a canyon, bison crossing a road, clouds dragging shadows over a valley.',
        'Its power is not only in famous eruptions or rare wildlife sightings. It is in the feeling that the landscape is still being made, visibly and audibly, beneath your feet.',
      ],
    },
    landscapeHighlights: {
      kicker: 'Landscape Highlights',
      title: 'Three forms that define the Yellowstone memory',
      items: [
        {
          title: 'Old Faithful',
          modifier: 'old-faithful',
          body: 'A geyser known for rhythm rather than spectacle alone, turning heat, pressure, and time into a public act of geology.',
        },
        {
          title: 'Grand Prismatic Spring',
          modifier: 'grand-prismatic',
          body: 'A field of mineral blue, orange, and gold where microscopic life and hot water make the ground appear almost painted from within.',
        },
        {
          title: 'Grand Canyon of the Yellowstone',
          modifier: 'yellowstone-canyon',
          body: 'A river-cut canyon of pale volcanic stone, bright walls, and falling water that gives the park one of its most dramatic vertical moments.',
        },
      ],
    },
    hiddenDiscoveries: {
      kicker: 'Hidden Discoveries',
      title: 'Yellowstone rewards attention beyond the famous stops',
      items: [
        {
          title: 'Thermal Edges',
          body: 'The margins of geyser basins often reveal the most delicate details: mineral crusts, runoff channels, small vents, and color changes that show where heat is moving.',
        },
        {
          title: 'Valley Silence',
          body: 'In Lamar or Hayden Valley, long pauses matter. Waiting quietly can reveal distant herds, bird movement, weather shifts, or the subtle shape of a river corridor.',
        },
        {
          title: 'Forest Recovery',
          body: 'Young lodgepole pines and open burn areas show how fire remains part of Yellowstones living pattern rather than only a past disturbance.',
        },
      ],
    },
    wildlife: {
      kicker: 'Wildlife',
      title: 'One of North Americas great intact wildlife stages',
      lead: 'Yellowstone is home to bison, elk, pronghorn, bighorn sheep, wolves, coyotes, grizzly bears, black bears, trumpeter swans, raptors, and many smaller species tied to valley, forest, river, and thermal habitats.',
      notes: [
        'Wildlife distance is essential here; large animals can move quickly and unpredictably.',
        'Roadside viewing should never block traffic or pressure animals toward people, vehicles, or thermal areas.',
        'Dawn and dusk often bring more visible movement, especially in the open valleys.',
      ],
    },
    geology: {
      kicker: 'Geology',
      title: 'A vast volcanic system expressed through water and heat',
      lead: 'Yellowstone sits above a major volcanic hot spot. Its geysers, fumaroles, mudpots, hot springs, canyon walls, and mineral terraces are surface signs of deep heat interacting with groundwater and ancient volcanic rock.',
      notes: [
        'Thermal features are fragile and dangerous; boardwalks protect both visitors and the thin mineral crusts around hot water.',
        'Geysers depend on heat, water supply, pressure, and underground plumbing that can change over time.',
        'The parks canyon colors come from altered volcanic rock, oxidation, and water working through stone over long periods.',
      ],
    },
    seasons: {
      kicker: 'Seasonal Moods',
      title: 'A park transformed by snow, steam, green valleys, and gold light',
      items: [
        { name: 'Spring', modifier: 'spring', body: 'Snow retreats unevenly, rivers run full, newborn animals appear in the valleys, and steam feels especially visible in cold morning air.' },
        { name: 'Summer', modifier: 'summer', body: 'Boardwalks, basins, and overlooks fill with movement while long daylight opens the parks largest circuit of landscapes.' },
        { name: 'Autumn', modifier: 'autumn', body: 'Elk bugles, cottonwoods turn, crowds thin, and the valleys take on a quieter, more watchful atmosphere.' },
        { name: 'Winter', modifier: 'winter', body: 'Snow simplifies the park into white ground, dark trees, blue shadows, and thermal clouds rising like signals through the cold.' },
      ],
    },
    photography: {
      kicker: 'Photography Guidance',
      title: 'Use steam, distance, and patience as compositional tools',
      lead: 'Yellowstone photography works best when it respects space. The strongest images often come from waiting for weather, steam, light, and wildlife movement to define the frame naturally.',
      tips: [
        { label: 'Thermal Basins', body: 'Arrive early for cooler air, visible steam, and lower boardwalk traffic around colorful springs and vents.' },
        { label: 'Wildlife', body: 'Use a long lens and keep distance; behavior and habitat tell a better story than a close, stressful image.' },
        { label: 'Canyon Light', body: 'Watch how angled sun catches the canyon walls and waterfall spray, especially when clouds move quickly overhead.' },
      ],
    },
    fieldNotes: {
      quote: 'Yellowstone feels less like a place frozen in beauty than a landscape still speaking: heat below, water above, animals moving through the open spaces between.',
      attribution: 'TrailMark Archive Journal',
    },
    badgeStory: {
      kicker: 'Badge Story',
      title: 'A mark built from steam, color, and volcanic motion',
      label: 'Yellowstone Mark No. 002',
      description: 'The Yellowstone badge centers thermal color and rising steam, preserving the park as a living system rather than a single scenic view.',
      notes: [
        'Blue and pale mineral tones suggest hot spring water and high plateau air.',
        'The rising steam forms the emotional center of the mark, turning geology into movement.',
        'As the second archive badge, Yellowstone proves the system can shift from granite stillness to volcanic energy while staying recognizably TrailMark.',
      ],
      details: [
        { label: 'Archive No.', value: '002' },
        { label: 'Location', value: 'Upper Geyser Basin' },
        { label: 'Release', value: 'Second Archive Mark' },
      ],
    },
    stewardship: {
      kicker: 'Stewardship / Safety',
      title: 'Respect the heat, the wildlife, and the distances',
      lead: 'Yellowstone asks for restraint. Its most memorable places are also fragile, hot, wild, and sometimes remote, so care is part of the experience rather than a rule placed over it.',
      items: [
        'Stay on boardwalks and marked paths in thermal areas; thin crust can hide scalding water.',
        'Give wildlife generous distance and use pullouts rather than stopping in traffic lanes.',
        'Carry layers, water, and realistic timing; weather and drive distances can change a day quickly.',
        'Follow all seasonal closures and bear-safety guidance, especially in quieter trail areas.',
      ],
    },
    archive: {
      kicker: 'Continue the Archive',
      title: 'Yellowstone expands the archive from stone monument to living geology.',
      body: 'The TrailMark collection grows by giving each park its own emotional structure, not by forcing every landscape into the same mood.',
      links: [
        { label: 'Grand Canyon', status: 'In progress', href: '../index.html#park-grid' },
        { label: 'Zion', status: 'In progress', href: '../index.html#park-grid' },
        { label: 'Glacier', status: 'In progress', href: '../index.html#park-grid' },
      ],
    },
  },
};
