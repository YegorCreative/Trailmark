/*
  Lightbox for visitor photos, and the submission button when a form URL exists.
*/
(function () {
  const formUrl = typeof PHOTO_FORM_URL === 'string' ? PHOTO_FORM_URL : '';
  const realForm = /^https?:\/\//.test(formUrl) && formUrl.indexOf('PASTE_FORM_URL') === -1;
  document.querySelectorAll('[data-photo-form]').forEach(function (node) {
    if (!realForm) return;
    const link = document.createElement('a');
    link.className = 'about-btn';
    link.href = formUrl;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.innerHTML = 'Send photos<span class="visually-hidden"> (opens a Google Form)</span>';
    node.replaceWith(link);
  });

  const buttons = Array.prototype.slice.call(document.querySelectorAll('.visitor-open'));
  if (!buttons.length) return;

  const lightbox = document.createElement('div');
  lightbox.className = 'photo-lightbox';
  lightbox.hidden = true;
  lightbox.innerHTML = '<div class="photo-lightbox-dialog" role="dialog" aria-modal="true" aria-label="Visitor photo">'
    + '<button type="button" class="photo-lightbox-close">Close</button>'
    + '<button type="button" class="photo-lightbox-prev">Previous</button>'
    + '<figure><img alt="" /><figcaption></figcaption></figure>'
    + '<button type="button" class="photo-lightbox-next">Next</button>'
    + '</div>';
  document.body.appendChild(lightbox);

  const dialog = lightbox.querySelector('.photo-lightbox-dialog');
  const image = lightbox.querySelector('img');
  const caption = lightbox.querySelector('figcaption');
  let index = 0;
  let opener = null;

  function show(next) {
    index = (next + buttons.length) % buttons.length;
    const button = buttons[index];
    image.src = button.getAttribute('data-photo-src');
    image.alt = button.getAttribute('data-photo-alt') || '';
    caption.textContent = button.getAttribute('data-photo-credit') || '';
  }

  function open(button) {
    opener = button;
    lightbox.hidden = false;
    document.body.classList.add('photo-lightbox-open');
    show(buttons.indexOf(button));
    lightbox.querySelector('.photo-lightbox-close').focus();
  }

  function close() {
    lightbox.hidden = true;
    image.removeAttribute('src');
    document.body.classList.remove('photo-lightbox-open');
    if (opener) opener.focus();
  }

  buttons.forEach(function (button) {
    button.addEventListener('click', function () { open(button); });
  });
  lightbox.querySelector('.photo-lightbox-close').addEventListener('click', close);
  lightbox.querySelector('.photo-lightbox-prev').addEventListener('click', function () { show(index - 1); });
  lightbox.querySelector('.photo-lightbox-next').addEventListener('click', function () { show(index + 1); });
  lightbox.addEventListener('click', function (event) {
    if (event.target === lightbox) close();
  });
  document.addEventListener('keydown', function (event) {
    if (lightbox.hidden) return;
    const items = lightbox.querySelectorAll('button');
    const first = items[0];
    const last = items[items.length - 1];
    if (event.key === 'Escape') {
      event.preventDefault();
      close();
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      show(index + 1);
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault();
      show(index - 1);
    } else if (event.key === 'Tab') {
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  });
}());
