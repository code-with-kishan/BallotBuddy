/* ═══════════════════════════════════════════════════════════
   firebase_services.js – Optional Firebase/GA4 integration
   Keeps app fully functional without credentials.
   ═══════════════════════════════════════════════════════════ */

(function () {
  const state = {
    enabled: false,
    initialized: false,
    analytics: false,
    projectId: null,
    error: null,
  };

  function readMeta(name) {
    return document.querySelector(`meta[name="${name}"]`)?.content?.trim() || '';
  }

  function readFirebaseConfig() {
    const apiKey = readMeta('firebase-api-key') || localStorage.getItem('electionGuide_firebase_api_key') || '';
    const authDomain = readMeta('firebase-auth-domain') || localStorage.getItem('electionGuide_firebase_auth_domain') || '';
    const projectId = readMeta('firebase-project-id') || localStorage.getItem('electionGuide_firebase_project_id') || '';
    const appId = readMeta('firebase-app-id') || localStorage.getItem('electionGuide_firebase_app_id') || '';
    const measurementId = readMeta('firebase-measurement-id') || localStorage.getItem('electionGuide_firebase_measurement_id') || '';

    if (!apiKey || !projectId || !appId) return null;

    return {
      apiKey,
      authDomain: authDomain || `${projectId}.firebaseapp.com`,
      projectId,
      appId,
      measurementId,
    };
  }

  function setStatus(status) {
    window.firebaseServicesStatus = {
      enabled: state.enabled,
      initialized: state.initialized,
      analytics: state.analytics,
      projectId: state.projectId,
      error: state.error,
      ...status,
    };
  }

  async function initFirebaseServices() {
    const config = readFirebaseConfig();
    if (!config) {
      setStatus({ reason: 'not-configured' });
      return;
    }

    state.enabled = true;
    state.projectId = config.projectId;

    try {
      const appMod = await import('https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js');
      const analyticsMod = await import('https://www.gstatic.com/firebasejs/10.12.5/firebase-analytics.js');

      const app = appMod.initializeApp(config);
      state.initialized = true;

      const supported = await analyticsMod.isSupported();
      if (supported && config.measurementId) {
        const analytics = analyticsMod.getAnalytics(app);
        analyticsMod.logEvent(analytics, 'app_boot', { app_name: 'ElectionGuideAI' });

        document.addEventListener('app:section-change', (event) => {
          analyticsMod.logEvent(analytics, 'section_view', {
            section_name: event.detail?.section || 'unknown',
          });
        });

        document.addEventListener('app:error', (event) => {
          analyticsMod.logEvent(analytics, 'app_error', {
            message: String(event.detail?.message || 'unknown').slice(0, 200),
          });
        });

        state.analytics = true;
      }

      setStatus({ reason: 'ok' });
    } catch (error) {
      state.error = String(error?.message || error || 'firebase-init-failed');
      setStatus({ reason: 'init-failed' });
      console.warn('Firebase init skipped:', state.error);
    }
  }

  window.initFirebaseServices = initFirebaseServices;
})();
