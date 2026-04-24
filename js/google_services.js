/* ═══════════════════════════════════════════════════════════
   google_services.js – Optional Google service instrumentation
   Safe-by-default: no keys required; activates extra features if configured
   ═══════════════════════════════════════════════════════════ */

(function () {
  const state = {
    analyticsEnabled: false,
    measurementId: null,
    storageHost: null,
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
  }

  function initGoogleServices() {
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
    addStatusBadge();

    window.googleServicesStatus = {
      storageHost: state.storageHost,
      analyticsEnabled: state.analyticsEnabled,
      measurementId: state.measurementId,
    };
  }

  window.initGoogleServices = initGoogleServices;
})();
