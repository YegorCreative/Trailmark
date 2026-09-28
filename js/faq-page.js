/*
  faq-page.js
  Behavior for faq.html: live search filtering with an aria-live result
  count, opening the linked question when the page loads with a #id, and
  "Copy link" on each answer. All of this is progressive — the accordions
  themselves are native <details>/<summary> and work with none of this.
*/
(function () {
  var list = document.querySelector('[data-faq-root]');
  if (!list) return;

  var items = Array.prototype.slice.call(list.querySelectorAll('.faq-item'));
  var categories = Array.prototype.slice.call(list.querySelectorAll('.faq-category'));
  var search = document.getElementById('faq-search');
  var liveRegion = document.getElementById('faq-search-status');
  var totalCount = items.length;

  var index = items.map(function (item) {
    return { el: item, text: item.textContent.toLowerCase() };
  });

  function applyFilter() {
    var query = search ? search.value.trim().toLowerCase() : '';
    var visible = 0;
    index.forEach(function (entry) {
      var match = !query || entry.text.indexOf(query) !== -1;
      entry.el.hidden = !match;
      if (match) visible++;
    });
    categories.forEach(function (category) {
      var anyVisible = category.querySelector('.faq-item:not([hidden])');
      category.hidden = !anyVisible;
    });
    if (liveRegion) {
      liveRegion.textContent = query
        ? (visible === 0 ? 'No questions match “' + search.value.trim() + '”.' : visible + ' of ' + totalCount + ' questions match.')
        : '';
    }
  }

  if (search) {
    search.addEventListener('input', applyFilter);
  }

  // Open (not just scroll to) the linked question, if any.
  function openTarget() {
    var id = decodeURIComponent(location.hash.replace(/^#/, ''));
    if (!id) return;
    var target = document.getElementById(id);
    if (target && target.tagName === 'DETAILS') target.open = true;
  }
  openTarget();
  window.addEventListener('hashchange', openTarget);

  // Copy link, with a graceful fallback to plain navigation if the
  // Clipboard API isn't available.
  list.addEventListener('click', function (event) {
    var link = event.target.closest('[data-copy-link]');
    if (!link) return;
    if (!navigator.clipboard) return; // let the default anchor click happen
    event.preventDefault();
    var url = location.origin + location.pathname + link.getAttribute('href');
    navigator.clipboard.writeText(url).then(function () {
      history.replaceState(null, '', link.getAttribute('href'));
      var original = link.textContent;
      link.textContent = 'Copied!';
      window.setTimeout(function () { link.textContent = original; }, 1600);
    }).catch(function () {
      location.hash = link.getAttribute('href');
    });
  });
}());
