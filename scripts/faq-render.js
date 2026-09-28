/*
  faq-render.js
  Turns js/faq-data.js into the FAQ page's markup (category pills,
  accordion sections, FAQPage JSON-LD) at build time. Node-only; used by
  build-static-pages.js. Answers may already contain trusted inline HTML
  (links); questions are plain text and get escaped.
*/

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function stripHtml(value) {
  return String(value).replace(/<[^>]*>/g, '');
}

function pillsHtml(faqData) {
  return faqData.map(function (category) {
    return '<a class="faq-pill" href="#' + escapeHtml(category.id) + '">' + escapeHtml(category.label) + '</a>';
  }).join('\n              ');
}

function categoriesHtml(faqData) {
  return faqData.map(function (category) {
    var items = category.items.map(function (item) {
      return '<details class="faq-item" id="' + escapeHtml(item.id) + '">\n'
        + '              <summary class="faq-question">' + escapeHtml(item.q) + '</summary>\n'
        + '              <div class="faq-answer">\n'
        + '                <p>' + item.a + '</p>\n'
        + '                <a class="faq-copy-link" href="#' + escapeHtml(item.id) + '" data-copy-link>Copy link</a>\n'
        + '              </div>\n'
        + '            </details>';
    }).join('\n            ');
    return '<section class="faq-category" id="' + escapeHtml(category.id) + '" aria-labelledby="' + escapeHtml(category.id) + '-title">\n'
      + '          <h2 id="' + escapeHtml(category.id) + '-title" class="faq-category-title">' + escapeHtml(category.label) + '</h2>\n'
      + '          <div class="faq-list">\n'
      + '            ' + items + '\n'
      + '          </div>\n'
      + '        </section>';
  }).join('\n        ');
}

function jsonLd(faqData, siteUrl) {
  var mainEntity = [];
  faqData.forEach(function (category) {
    category.items.forEach(function (item) {
      mainEntity.push({
        '@type': 'Question',
        name: item.q,
        acceptedAnswer: { '@type': 'Answer', text: stripHtml(item.a) },
      });
    });
  });
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    name: 'TrailMark FAQ',
    url: siteUrl + '/faq.html',
    isPartOf: { '@type': 'WebSite', name: 'TrailMark', url: siteUrl + '/' },
    mainEntity: mainEntity,
  }, null, 2).replace(/</g, '\\u003c');
}

module.exports = { pillsHtml, categoriesHtml, jsonLd };
