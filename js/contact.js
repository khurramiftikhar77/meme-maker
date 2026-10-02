// Contact form, delivered by Web3Forms (https://web3forms.com) like the form on khurramiftikhar.com.
(() => {
  'use strict';

  // Web3Forms access key. It is public by design: it can only send messages to the inbox
  // it was created for, so it is safe in the page. Replace it to deliver to another inbox.
  const WEB3FORMS_KEY = 'a0c9cd86-ac81-4200-a287-8c8837616a0e';  // delivers to mememaker@khurramiftikhar.com
  const EMAIL = 'mememaker@khurramiftikhar.com';

  const form = document.getElementById('contact-form');
  if (!form) return;
  const status = form.querySelector('[data-status]');
  const button = form.querySelector('button[type="submit"]');

  const setStatus = (message, type = '') => {
    status.textContent = message;
    status.dataset.type = type;
  };

  // /contact?topic=add-template picks the matching subject, e.g. from a template page.
  const wanted = new URLSearchParams(location.search).get('topic');
  if (wanted && [...form.topic.options].some((o) => o.value === wanted)) form.topic.value = wanted;

  form.addEventListener('input', (e) => e.target.removeAttribute('aria-invalid'));
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const invalid = [...form.querySelectorAll('[required]')].filter((f) => !f.checkValidity());
    invalid.forEach((f) => f.setAttribute('aria-invalid', 'true'));
    if (invalid.length) {
      const first = invalid[0];
      setStatus(
        first.name === 'email' && first.value
          ? 'That email address does not look right. Check it so we can reply.'
          : 'Add your name, email and a short message, then send.',
        'error',
      );
      first.focus();
      return;
    }
    if (form.botcheck.checked) return;  // spam bots fill in the hidden box

    const data = Object.fromEntries(new FormData(form));
    const topic = form.topic.selectedOptions[0].textContent;

    button.disabled = true;
    setStatus('Sending…');
    try {
      const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          access_key: WEB3FORMS_KEY,
          subject: `[Meme Maker: ${topic}] Message from ${data.name}`,
          from_name: 'Meme Maker',
          replyto: data.email,
          name: data.name,
          email: data.email,
          topic,
          message: data.message,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.message);
      form.reset();
      setStatus('Sent. Thanks, we will get back to you soon.', 'ok');
    } catch {
      setStatus(`That did not go through. Email us directly at ${EMAIL}.`, 'error');
    } finally {
      button.disabled = false;
    }
  });
})();
