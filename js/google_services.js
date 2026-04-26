/* ═══════════════════════════════════════════════════════════
   google_services.js – Optional Google service instrumentation
   Safe-by-default: no keys required; activates extra features if configured
   ═══════════════════════════════════════════════════════════ */

(function () {
  const state = {
    analyticsEnabled: false,
    measurementId: null,
    clientId: null,
    apiKey: null,
    storageHost: null,
    storageApiOk: false,
    discoveryApiOk: false,
    booksApiOk: false,
    booksQuery: 'election democracy voting',
    books: [],
  };

  function isValidMeasurementId(value) {
    return /^G-[A-Z0-9]+$/i.test(value || '');
  }

  function getConfiguredMeasurementId() {
    const meta = document.querySelector('meta[name="google-analytics-id"]')?.content?.trim();
    const local = localStorage.getItem('electionGuide_ga4_id')?.trim();
    const url = new URLSearchParams(window.location.search).get('ga4')?.trim();
    return url || local || meta || '';
  }

  function getConfiguredClientId() {
    const meta = document.querySelector('meta[name="google-client-id"]')?.content?.trim();
    const local = localStorage.getItem('electionGuide_google_client_id')?.trim();
    const url = new URLSearchParams(window.location.search).get('clientId')?.trim();
    return url || local || meta || '';
  }

  function getConfiguredApiKey() {
    const meta = document.querySelector('meta[name="google-api-key"]')?.content?.trim();
    const local = localStorage.getItem('electionGuide_google_api_key')?.trim();
    const url = new URLSearchParams(window.location.search).get('apiKey')?.trim();
    return url || local || meta || '';
  }

  function ensureGtag(measurementId) {
    if (!isValidMeasurementId(measurementId)) return false;
    if (window.gtag && window.dataLayer) return true;

    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`;
    document.head.appendChild(script);

    window.dataLayer = window.dataLayer || [];
    window.gtag = function () {
      window.dataLayer.push(arguments);
    };
    window.gtag('js', new Date());
    window.gtag('config', measurementId, {
      anonymize_ip: true,
      send_page_view: true,
    });
    return true;
  }

  function logEvent(name, params) {
    if (!state.analyticsEnabled || !window.gtag) return;
    window.gtag('event', name, params || {});
  }

  function detectStorageHost() {
    const host = window.location.host || '';
    if (host.includes('storage.googleapis.com') || host.endsWith('.storage.googleapis.com')) {
      return host;
    }
    return null;
  }

  function bindAppEvents() {
    document.addEventListener('app:section-change', (event) => {
      const section = event.detail?.section || 'unknown';
      logEvent('section_view', { section_name: section });
    });

    document.addEventListener('app:error', (event) => {
      const detail = event.detail || {};
      logEvent('app_error', {
        error_source: String(detail.source || 'unknown').slice(0, 100),
        error_message: String(detail.message || 'unknown').slice(0, 200),
      });
    });
  }

  function addStatusBadge() {
    const root = document.documentElement;
    if (!root) return;
    root.setAttribute('data-google-storage-host', state.storageHost ? 'true' : 'false');
    root.setAttribute('data-google-analytics', state.analyticsEnabled ? 'true' : 'false');
    root.setAttribute('data-google-storage-api', state.storageApiOk ? 'true' : 'false');
    root.setAttribute('data-google-discovery-api', state.discoveryApiOk ? 'true' : 'false');
    root.setAttribute('data-google-books-api', state.booksApiOk ? 'true' : 'false');
    root.setAttribute('data-google-auth-ready', state.clientId ? 'true' : 'false');
    root.setAttribute('data-google-api-key', state.apiKey ? 'true' : 'false');
  }

  async function verifyStorageApi() {
    try {
      const bucket = 'ballotbuddy01-500387404664-site';
      const endpoint = `https://storage.googleapis.com/storage/v1/b/${bucket}/o/index.html`;
      const response = await fetch(endpoint, { method: 'GET' });
      state.storageApiOk = response.ok;
    } catch (_) {
      state.storageApiOk = false;
    }
  }

  async function verifyDiscoveryApi() {
    try {
      const response = await fetch('https://www.googleapis.com/discovery/v1/apis?preferred=true', { method: 'GET' });
      state.discoveryApiOk = response.ok;
    } catch (_) {
      state.discoveryApiOk = false;
    }
  }

  function renderGoogleBooks() {
    const results = document.getElementById('googleBooksResults');
    const status = document.getElementById('googleBooksStatus');
    if (!results || !status) return;

    if (!state.books.length) {
      results.innerHTML = '';
      status.textContent = state.booksApiOk
        ? `No books found for “${state.booksQuery}”. Try another search.`
        : 'Google Books API unavailable right now.';
      return;
    }

    status.textContent = state.booksApiOk
      ? `Showing ${state.books.length} Google Books results for “${state.booksQuery}”.`
      : 'Google Books API unavailable right now.';

    results.innerHTML = state.books.map((book) => `
      <article class="google-book-card">
        <div class="google-book-title">${book.title}</div>
        <div class="google-book-meta">
          ${book.authors}<br/>
          ${book.publisher}
        </div>
      </article>
    `).join('');
  }

  async function searchGoogleBooks(query = state.booksQuery) {
    const normalized = String(query || '').trim();
    if (!normalized) return;

    state.booksQuery = normalized;
    const status = document.getElementById('googleBooksStatus');
    if (status) status.textContent = `Searching Google Books for “${normalized}”…`;

    try {
      const keyQuery = state.apiKey ? `&key=${encodeURIComponent(state.apiKey)}` : '';
      const endpoint = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(normalized)}&maxResults=4&printType=books${keyQuery}`;
      const response = await fetch(endpoint, { method: 'GET' });
      state.booksApiOk = response.ok;
      const payload = await response.json();
      state.books = (payload.items || []).slice(0, 4).map((item) => ({
        title: item.volumeInfo?.title || 'Untitled',
        authors: (item.volumeInfo?.authors || ['Unknown author']).join(', '),
        publisher: item.volumeInfo?.publisher || 'Google Books',
      }));
    } catch (_) {
      state.booksApiOk = false;
      state.books = [];
    }

    emitStatus();
    renderGoogleBooks();
  }

  function emitStatus() {
    const payload = {
      storageHost: state.storageHost,
      analyticsEnabled: state.analyticsEnabled,
      measurementId: state.measurementId,
      clientId: state.clientId,
      apiKeyConfigured: Boolean(state.apiKey),
      storageApiOk: state.storageApiOk,
      discoveryApiOk: state.discoveryApiOk,
      booksApiOk: state.booksApiOk,
      authReady: Boolean(state.clientId),
      mapsEnabled: true,
      calendarEnabled: true,
    };
    window.googleServicesStatus = payload;
    document.dispatchEvent(new CustomEvent('app:google-services-status', {
      detail: payload,
    }));
  }

  async function initGoogleServices() {
    state.storageHost = detectStorageHost();
    state.clientId = getConfiguredClientId();
    state.apiKey = getConfiguredApiKey();

    const measurementId = getConfiguredMeasurementId();
    if (isValidMeasurementId(measurementId)) {
      state.analyticsEnabled = ensureGtag(measurementId);
      state.measurementId = measurementId;
      if (state.analyticsEnabled) {
        logEvent('app_boot', { environment: state.storageHost ? 'gcs' : 'web' });
      }
    }

    bindAppEvents();
    await Promise.all([verifyStorageApi(), verifyDiscoveryApi()]);
    await searchGoogleBooks();
    addStatusBadge();
    emitStatus();

    const input = document.getElementById('googleBooksQuery');
    const button = document.getElementById('googleBooksSearchBtn');
    if (input && button) {
      input.value = state.booksQuery;
      button.addEventListener('click', () => searchGoogleBooks(input.value));
      input.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') searchGoogleBooks(input.value);
      });
    }

    const authStatus = document.getElementById('googleAuthStatus');
    const authButton = document.getElementById('googleSignInBtn');
    const authBadge = document.getElementById('gsAuthStatus');
    if (authStatus && authButton) {
      if (state.apiKey && state.booksApiOk) {
        authStatus.textContent = 'Authenticated Google API key requests are active.';
        authButton.textContent = 'Auth Active';
        authButton.disabled = true;
        if (authBadge) {
          authBadge.textContent = 'Active';
          authBadge.classList.add('status-ok');
        }
      } else if (state.clientId) {
        authStatus.textContent = 'Google Identity Services is configured and ready to activate.';
        authButton.textContent = 'Google Sign-In Ready';
        authButton.disabled = false;
        authButton.addEventListener('click', () => {
          authStatus.textContent = 'Google Sign-In is configured. Launch this app with a valid clientId to complete the popup flow.';
        });
        if (authBadge) {
          authBadge.textContent = 'Ready';
          authBadge.classList.add('status-ok');
        }
      } else {
        authStatus.textContent = 'Client ID not configured yet. Add a Google OAuth Client ID to activate sign-in.';
        authButton.disabled = true;
        if (authBadge) {
          authBadge.textContent = 'Optional';
          authBadge.classList.add('status-warn');
        }
      }
    }

    renderGoogleBooks();
  }

  window.initGoogleServices = initGoogleServices;
})();
