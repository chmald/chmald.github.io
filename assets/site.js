// Progressive enhancement only: the page is fully usable without JavaScript.
(function () {
  'use strict';

  // Fall back to the generated placeholder if a repo diagram fails to load.
  function dropBrokenImage(img) {
    if (img.parentNode) img.parentNode.removeChild(img);
  }
  document.querySelectorAll('.thumb img').forEach(function (img) {
    if (img.complete && img.naturalWidth === 0) dropBrokenImage(img);
    else img.addEventListener('error', function () { dropBrokenImage(img); }, { once: true });
  });

  // Track filter for the project grid.
  var toolbar = document.querySelector('.filters');
  var cards = Array.prototype.slice.call(document.querySelectorAll('.grid .card'));
  var status = document.querySelector('.filter-status');
  if (!toolbar || !cards.length) return;

  var buttons = Array.prototype.slice.call(toolbar.querySelectorAll('.filter'));
  var labels = {};
  buttons.forEach(function (b) { labels[b.dataset.filter] = b.firstChild.textContent.trim(); });

  function apply(filter, updateUrl) {
    if (!labels[filter]) filter = 'all';
    var shown = 0;
    cards.forEach(function (card) {
      var match = filter === 'all' || card.dataset.tracks.split(' ').indexOf(filter) !== -1;
      card.hidden = !match;
      if (match) shown++;
    });
    buttons.forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.filter === filter)); });
    if (status) {
      status.textContent = filter === 'all'
        ? 'Showing all ' + shown + ' projects'
        : 'Showing ' + shown + ' ' + labels[filter] + ' project' + (shown === 1 ? '' : 's');
    }
    if (updateUrl && window.history && history.replaceState) {
      var url = new URL(window.location.href);
      if (filter === 'all') url.searchParams.delete('track');
      else url.searchParams.set('track', filter);
      history.replaceState(null, '', url);
    }
  }

  toolbar.addEventListener('click', function (event) {
    var button = event.target.closest('.filter');
    if (button) apply(button.dataset.filter, true);
  });

  toolbar.hidden = false;
  var initial = new URLSearchParams(window.location.search).get('track');
  if (initial) apply(initial, false);
})();
