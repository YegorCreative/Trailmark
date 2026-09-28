/*
  contact-page.js
  Populates the park select, wires the topic cards to the hidden field and
  helper text, and — once a real Formspree ID is in place — submits the
  form via fetch with inline validation and success/error states. Until
  then (action still contains the literal "FORMSPREE_ID"), the form is
  disabled and a plain-text fallback notice is shown instead; the <form>
  still degrades to a normal POST if JS fails to load.
*/
(function () {
  var form = document.getElementById('contact-form');
  if (!form) return;

  var parkSelect = document.getElementById('contact-park');
  if (parkSelect && typeof PARKS !== 'undefined') {
    var open = PARKS.filter(function (park) { return park.pageUrl; }).slice().sort(function (a, b) {
      return a.name.localeCompare(b.name);
    });
    parkSelect.insertAdjacentHTML('beforeend', open.map(function (park) {
      return '<option value="' + park.name.replace(/"/g, '&quot;') + '">' + park.name + '</option>';
    }).join(''));
  }

  var topicInputs = Array.prototype.slice.call(form.querySelectorAll('input[name="topic"]'));
  var topicHelper = document.getElementById('contact-topic-helper');
  var topicHidden = document.getElementById('contact-topic-hidden');
  topicInputs.forEach(function (input) {
    input.addEventListener('change', function () {
      topicHidden.value = input.value;
      topicHelper.textContent = input.getAttribute('data-helper') || '';
      topicInputs.forEach(function (other) {
        other.closest('.contact-topic-card').classList.toggle('is-selected', other === input);
      });
    });
  });

  var notice = document.getElementById('contact-form-notice');
  var formReady = form.getAttribute('action').indexOf('FORMSPREE_ID') === -1;

  if (!formReady) {
    notice.hidden = false;
    Array.prototype.slice.call(form.querySelectorAll('input, select, textarea, button')).forEach(function (field) {
      if (field.id !== 'contact-company') field.disabled = true;
    });
    return;
  }

  var statusEl = form.querySelector('.contact-form-status');
  var submitBtn = form.querySelector('.contact-submit');

  function fieldError(id) {
    return form.querySelector('[data-error-for="' + id + '"]');
  }

  function setError(input, message) {
    var errorEl = fieldError(input.id);
    if (!errorEl) return;
    if (message) {
      errorEl.textContent = message;
      errorEl.hidden = false;
      input.setAttribute('aria-invalid', 'true');
      input.setAttribute('aria-describedby', errorEl.id || (errorEl.id = input.id + '-error'));
    } else {
      errorEl.hidden = true;
      input.removeAttribute('aria-invalid');
    }
  }

  function validate() {
    var ok = true;
    var name = document.getElementById('contact-name');
    var email = document.getElementById('contact-email');
    var message = document.getElementById('contact-message');

    if (!name.value.trim()) { setError(name, 'Enter your name.'); ok = false; }
    else setError(name, '');

    if (!email.value.trim()) { setError(email, 'Enter your email.'); ok = false; }
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) { setError(email, 'That email doesn’t look right.'); ok = false; }
    else setError(email, '');

    if (!message.value.trim()) { setError(message, 'Enter a message.'); ok = false; }
    else setError(message, '');

    return ok;
  }

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    // Honeypot: if filled, silently pretend success without sending anything.
    var honeypot = document.getElementById('contact-company');
    if (honeypot && honeypot.value.trim()) {
      showSuccess();
      return;
    }
    if (!validate()) {
      statusEl.textContent = 'Please fix the highlighted fields.';
      return;
    }
    submitBtn.disabled = true;
    statusEl.textContent = 'Sending…';
    fetch(form.action, {
      method: 'POST',
      body: new FormData(form),
      headers: { Accept: 'application/json' },
    }).then(function (response) {
      if (response.ok) showSuccess();
      else showError();
    }).catch(showError);
  });

  function showSuccess() {
    form.hidden = true;
    var success = document.createElement('div');
    success.className = 'contact-success';
    success.setAttribute('role', 'status');
    success.innerHTML = '<h2>Thanks. Your message is on its way.</h2><p>I read every message and reply when I can.</p>';
    form.insertAdjacentElement('afterend', success);
  }

  function showError() {
    submitBtn.disabled = false;
    statusEl.innerHTML = 'Something went wrong sending that. You can also email directly: '
      + '<a href="mailto:CONTACT_EMAIL?subject=' + encodeURIComponent('TrailMark contact') + '">CONTACT_EMAIL</a>.';
  }
}());
