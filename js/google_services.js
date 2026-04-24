/* ═══════════════════════════════════════════════════════════
   google_services.js – Optional Google service instrumentation
   Safe-by-default: no keys required; activates extra features if configured
   ═══════════════════════════════════════════════════════════ */

(function () {
  const state = {
    analyticsEnabled: false,
    measurementId: null,
    storageHost: null,
    storageApiOk: false,
    discoveryApiOk: false,
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

  function emitStatus() {
    const payload = {
      storageHost: state.storageHost,
      analyticsEnabled: state.analyticsEnabled,
      measurementId: state.measurementId,
      storageApiOk: state.storageApiOk,
      discoveryApiOk: state.discoveryApiOk,
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
    addStatusBadge();
    emitStatus();
  }

  window.initGoogleServices = initGoogleServices;
})();
