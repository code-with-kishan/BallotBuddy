/* ═══════════════════════════════════════════════════════════
   selftest.js – Lightweight in-browser checks for scoring demos
   Run with: index.html?selftest=1
   ═══════════════════════════════════════════════════════════ */

(function () {
  function assert(condition, message) {
    if (!condition) throw new Error(message);
  }

  function runSelfTests() {
    const results = [];

    function test(name, fn) {
      try {
        fn();
        results.push({ name, pass: true });
      } catch (error) {
        results.push({ name, pass: false, error: error.message });
      }
    }

    test('stripHtml removes tags', () => {
      assert(typeof stripHtml === 'function', 'stripHtml not found');
      const out = stripHtml('<strong>Hello</strong> <script>alert(1)</script>');
      assert(out.includes('Hello'), 'Expected visible text missing');
      assert(!out.includes('<script>'), 'Tag was not stripped');
    });

    test('timeline calendar date parser works', () => {
      assert(typeof getCalendarDate === 'function', 'getCalendarDate not found');
      const value = getCalendarDate('April 19, 2024');
      assert(value === '20240419', `Unexpected value: ${value}`);
    });

    test('timeline status checker is deterministic', () => {
      assert(typeof getEventStatus === 'function', 'getEventStatus not found');
      const value = getEventStatus('January 1, 1999');
      assert(value === 'past', `Expected past, got ${value}`);
    });

    test('eligibility rules return rich text', () => {
      assert(typeof getEligibilityRules === 'function', 'getEligibilityRules not found');
      const value = getEligibilityRules('India');
      assert(value.includes('18+'), 'Eligibility details missing');
    });

    test('google services status object exists after init', () => {
      assert(typeof window.googleServicesStatus === 'object', 'googleServicesStatus missing');
      assert('analyticsEnabled' in window.googleServicesStatus, 'analytics flag missing');
    });

    test('firebase status object exists', () => {
      assert(typeof window.firebaseServicesStatus === 'object', 'firebaseServicesStatus missing');
      assert('initialized' in window.firebaseServicesStatus, 'firebase init flag missing');
    });

    test('navigation emits section change event', () => {
      assert(typeof navigateTo === 'function', 'navigateTo not found');
      let observed = null;
      const handler = (event) => {
        observed = event.detail?.section;
      };
      document.addEventListener('app:section-change', handler, { once: true });
      navigateTo('faq');
      assert(observed === 'faq', `Expected faq, got ${observed}`);
    });

    test('FAQ filter workflow executes', () => {
      assert(typeof initFaq === 'function', 'initFaq not found');
      assert(typeof filterFAQ === 'function', 'filterFAQ not found');
      const search = document.getElementById('faqSearch');
      assert(!!search, 'FAQ search input missing');
      initFaq();
      search.value = 'EVM';
      filterFAQ();
      const items = document.querySelectorAll('#faqList .faq-item');
      assert(items.length > 0, 'FAQ filter returned no items for EVM');
    });

    test('chat sanitization workflow blocks html injection', () => {
      assert(typeof initChat === 'function', 'initChat not found');
      assert(typeof sendMessage === 'function', 'sendMessage not found');
      if (!document.getElementById('assistant')?.classList.contains('active')) {
        navigateTo('assistant');
      }
      initChat();
      const input = document.getElementById('chatInput');
      assert(!!input, 'Chat input missing');
      input.value = '<img src=x onerror=alert(1)>hello';
      sendMessage();
      const userBubble = document.querySelector('#chatMessages .msg-user .msg-bubble');
      assert(!!userBubble, 'User message bubble missing');
      assert(!userBubble.innerHTML.includes('<img'), 'User message rendered unsanitized HTML');
    });

    test('skip link exists for keyboard navigation', () => {
      const skip = document.querySelector('.skip-link');
      assert(!!skip, 'Skip link missing');
      assert(skip.getAttribute('href') === '#mainContent', 'Skip link target mismatch');
    });

    test('feature cards are keyboard-focusable', () => {
      const cards = Array.from(document.querySelectorAll('.feature-card[data-nav-target]'));
      assert(cards.length >= 4, 'Expected at least 4 feature cards');
      cards.forEach((card) => {
        assert(card.getAttribute('tabindex') === '0', 'Feature card not focusable');
        assert(card.getAttribute('role') === 'button', 'Feature card missing button role');
      });
    });

    test('content security policy meta exists', () => {
      const csp = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
      assert(!!csp, 'CSP meta missing');
      const cspText = csp.getAttribute('content') || '';
      assert(cspText.includes("default-src 'self'"), 'CSP default-src policy missing');
      assert(cspText.includes('object-src'), 'CSP object-src policy missing');
    });

    return results;
  }

  function renderSelfTestPanel(results) {
    const passCount = results.filter((r) => r.pass).length;
    const total = results.length;
    const panel = document.createElement('div');
    panel.setAttribute('role', 'status');
    panel.setAttribute('aria-live', 'polite');
    panel.style.position = 'fixed';
    panel.style.right = '1rem';
    panel.style.bottom = '1rem';
    panel.style.zIndex = '9999';
    panel.style.width = 'min(420px, 92vw)';
    panel.style.maxHeight = '60vh';
    panel.style.overflow = 'auto';
    panel.style.padding = '12px';
    panel.style.borderRadius = '14px';
    panel.style.background = 'rgba(18, 21, 33, 0.95)';
    panel.style.color = '#E9EDF5';
    panel.style.border = '1px solid rgba(255,255,255,0.12)';
    panel.style.boxShadow = '0 10px 40px rgba(0,0,0,0.4)';

    const title = document.createElement('div');
    title.style.fontWeight = '700';
    title.style.marginBottom = '.65rem';
    title.textContent = `Self Tests: ${passCount}/${total} passed`;
    panel.appendChild(title);

    results.forEach((result) => {
      const line = document.createElement('div');
      line.style.fontSize = '.86rem';
      line.style.marginBottom = '.45rem';
      line.textContent = result.pass
        ? `PASS ${result.name}`
        : `FAIL ${result.name}: ${result.error}`;
      panel.appendChild(line);
    });

    const closeBtn = document.createElement('button');
    closeBtn.type = 'button';
    closeBtn.textContent = 'Close';
    closeBtn.style.marginTop = '.7rem';
    closeBtn.style.padding = '.4rem .7rem';
    closeBtn.style.borderRadius = '8px';
    closeBtn.style.border = '1px solid rgba(255,255,255,.25)';
    closeBtn.style.background = 'transparent';
    closeBtn.style.color = '#E9EDF5';
    closeBtn.addEventListener('click', () => panel.remove());
    panel.appendChild(closeBtn);

    document.body.appendChild(panel);
  }

  function maybeRunSelfTestsFromQuery() {
    const params = new URLSearchParams(window.location.search);
    if (params.get('selftest') !== '1') return;
    const results = runSelfTests();
    renderSelfTestPanel(results);
    console.table(results);
  }

  window.maybeRunSelfTestsFromQuery = maybeRunSelfTestsFromQuery;
})();
