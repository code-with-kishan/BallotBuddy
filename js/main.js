/* ═══════════════════════════════════════════════════════════
   main.js – App Bootstrap, Navigation, Progress & Utilities
   Entry point — initializes all modules after DOM is ready
   ═══════════════════════════════════════════════════════════ */

/* ══════════════════════════════════════════════════════════
   NAVIGATION
   ══════════════════════════════════════════════════════════ */
const SECTIONS = ['home', 'assistant', 'guide', 'timeline', 'faq', 'myths', 'map'];
let currentSection = 'home';

function toSafeText(value) {
  return String(value ?? '');
}

/**
 * Navigate to a named section, updating nav state and URL hash.
 * Lazy-initializes each section the first time it's visited.
 */
function navigateTo(sectionId) {
  if (!SECTIONS.includes(sectionId)) return;

  // Deactivate current section
  const currentEl = document.getElementById(currentSection);
  if (currentEl) currentEl.classList.remove('active');

  // Update nav links
  document.querySelectorAll('.nav-link').forEach(link => {
    link.classList.toggle('active', link.dataset.section === sectionId);
  });

  // Activate new section
  const newEl = document.getElementById(sectionId);
  if (newEl) newEl.classList.add('active');

  currentSection = sectionId;
  window.location.hash = sectionId;

  document.dispatchEvent(new CustomEvent('app:section-change', {
    detail: { section: sectionId }
  }));

  // Scroll to top of main content
  document.getElementById('mainContent')?.scrollTo({ top: 0, behavior: 'smooth' });

  // Close sidebar on mobile
  closeSidebar();

  // Lazy-init sections
  initSection(sectionId);
}

/* ─── Lazy section initializers ─────────────────────────── */
const _initialized = new Set();

function initSection(id) {
  if (_initialized.has(id)) return;
  _initialized.add(id);

  switch (id) {
    case 'assistant': initChat();       break;
    case 'guide':     renderGuide();    break;
    case 'timeline':  renderTimeline(); break;
    case 'faq':       initFaq();        break;
    case 'myths':     renderMyths();    break;
    case 'map':       initMap();        break;
  }
}

/* ══════════════════════════════════════════════════════════
   SIDEBAR (MOBILE)
   ══════════════════════════════════════════════════════════ */
function openSidebar() {
  document.getElementById('sidebar')?.classList.add('open');
  document.getElementById('sidebarOverlay')?.classList.add('open');
  const btn = document.getElementById('hamburger');
  if (btn) btn.setAttribute('aria-expanded', 'true');
  document.body.style.overflow = 'hidden';
}

function closeSidebar() {
  document.getElementById('sidebar')?.classList.remove('open');
  document.getElementById('sidebarOverlay')?.classList.remove('open');
  const btn = document.getElementById('hamburger');
  if (btn) btn.setAttribute('aria-expanded', 'false');
  document.body.style.overflow = '';
}

function setupCardKeyboardNavigation() {
  document.querySelectorAll('.feature-card[data-nav-target]').forEach((card) => {
    card.addEventListener('keydown', (e) => {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      e.preventDefault();
      const target = card.getAttribute('data-nav-target');
      if (target) navigateTo(target);
    });
  });
}

function setServiceStatusText(id, text, className) {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = text;
  el.classList.remove('status-ok', 'status-warn', 'status-off');
  el.classList.add(className);
}

function applyGoogleServicesStatus(status) {
  if (!status) return;
  setServiceStatusText('gsStorageApiStatus', status.storageApiOk ? 'Connected' : 'Unavailable', status.storageApiOk ? 'status-ok' : 'status-off');
  setServiceStatusText('gsDiscoveryApiStatus', status.discoveryApiOk ? 'Connected' : 'Unavailable', status.discoveryApiOk ? 'status-ok' : 'status-off');
  if ('booksApiOk' in status) {
    const label = status.booksApiOk ? 'Connected' : 'Unavailable';
    const existing = document.getElementById('gsBooksStatus');
    if (existing) {
      existing.textContent = label;
      existing.classList.remove('status-ok', 'status-off');
      existing.classList.add(status.booksApiOk ? 'status-ok' : 'status-off');
    }
  }
  setServiceStatusText('gsCalendarStatus', status.calendarEnabled ? 'Enabled' : 'Disabled', status.calendarEnabled ? 'status-ok' : 'status-off');
  setServiceStatusText('gsMapsStatus', status.mapsEnabled ? 'Enabled' : 'Disabled', status.mapsEnabled ? 'status-ok' : 'status-off');
}

function applyFirebaseStatus(status) {
  if (!status) return;
  if (status.initialized && status.analytics) {
    setServiceStatusText('gsFirebaseStatus', 'Analytics Active', 'status-ok');
    return;
  }
  if (status.enabled && status.initialized) {
    setServiceStatusText('gsFirebaseStatus', 'Configured', 'status-warn');
    return;
  }
  setServiceStatusText('gsFirebaseStatus', 'Optional Setup', 'status-warn');
}

/* ══════════════════════════════════════════════════════════
   DARK / LIGHT MODE TOGGLE
   ══════════════════════════════════════════════════════════ */
let isDark = true;

function toggleDarkMode() {
  isDark = !isDark;
  document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
  const btn = document.getElementById('darkModeToggle');
  if (btn) {
    btn.textContent = isDark ? '🌙' : '☀️';
    btn.title = isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode';
  }
  localStorage.setItem('electionGuide_theme', isDark ? 'dark' : 'light');
  showToast(`${isDark ? '🌙 Dark' : '☀️ Light'} mode activated`, 'info');
}

/* ══════════════════════════════════════════════════════════
   HIGH CONTRAST MODE
   ══════════════════════════════════════════════════════════ */
let isHighContrast = false;

function toggleContrast() {
  isHighContrast = !isHighContrast;
  document.documentElement.setAttribute('data-contrast', isHighContrast ? 'high' : '');
  const btn = document.getElementById('contrastToggle');
  if (btn) {
    btn.title = isHighContrast ? 'Disable High Contrast' : 'Enable High Contrast';
  }
  localStorage.setItem('electionGuide_contrast', isHighContrast ? 'high' : '');
  showToast(`👁️ High contrast mode ${isHighContrast ? 'ON' : 'OFF'}`, 'info');
}

/* ══════════════════════════════════════════════════════════
   PROGRESS TRACKER & BADGES
   ══════════════════════════════════════════════════════════ */
let currentProgress = 0;
const awardedBadges  = new Set();

/**
 * Set the progress percentage and optionally add badge objects.
 * @param {number}   pct    Progress 0–100
 * @param {Array}    badges Array of {label, style} objects
 */
function setProgress(pct, badges = []) {
  const clamped = Math.min(100, Math.max(0, pct));
  if (clamped > currentProgress) currentProgress = clamped;

  const fillEl = document.getElementById('progressFill');
  const pctEl  = document.getElementById('progressPct');
  if (fillEl) fillEl.style.width = currentProgress + '%';
  if (pctEl)  pctEl.textContent  = currentProgress + '% Ready';

  badges.forEach(b => awardBadge(b.label));
}

/**
 * Award a named badge (idempotent — won't re-award duplicates).
 */
function awardBadge(label) {
  if (awardedBadges.has(label)) return;
  awardedBadges.add(label);

  const container = document.getElementById('progressBadges');
  if (!container) return;

  const badge = document.createElement('span');
  badge.className = 'badge';
  badge.textContent = label;
  container.appendChild(badge);

  // Nudge progress
  if (currentProgress < 90) {
    currentProgress = Math.min(90, currentProgress + 5);
    const fillEl = document.getElementById('progressFill');
    const pctEl  = document.getElementById('progressPct');
    if (fillEl) fillEl.style.width = currentProgress + '%';
    if (pctEl)  pctEl.textContent  = currentProgress + '% Ready';
  }
}

/* ══════════════════════════════════════════════════════════
   TOAST NOTIFICATIONS
   ══════════════════════════════════════════════════════════ */
const toastIcons = { success:'✅', error:'❌', info:'ℹ️' };

/**
 * Show a dismissible toast notification.
 * @param {string} message  Toast text
 * @param {string} type     'success' | 'error' | 'info'
 * @param {number} duration Auto-dismiss after ms (default 3500)
 */
function showToast(message, type = 'info', duration = 3500) {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;

  const icon = document.createElement('span');
  icon.className = 'toast-icon';
  icon.textContent = toastIcons[type] || 'ℹ️';

  const text = document.createElement('span');
  text.style.flex = '1';
  text.textContent = toSafeText(message);

  const closeBtn = document.createElement('button');
  closeBtn.type = 'button';
  closeBtn.textContent = '✕';
  closeBtn.setAttribute('aria-label', 'Dismiss notification');
  closeBtn.style.background = 'none';
  closeBtn.style.border = 'none';
  closeBtn.style.color = 'var(--text-muted)';
  closeBtn.style.cursor = 'pointer';
  closeBtn.style.fontSize = '1rem';
  closeBtn.style.padding = '0 0 0 .5rem';
  closeBtn.style.flexShrink = '0';
  closeBtn.addEventListener('click', () => toast.remove());

  toast.appendChild(icon);
  toast.appendChild(text);
  toast.appendChild(closeBtn);

  container.appendChild(toast);

  // Auto-remove
  setTimeout(() => {
    toast.style.transition = 'opacity .4s ease, transform .4s ease';
    toast.style.opacity    = '0';
    toast.style.transform  = 'translateX(80px)';
    setTimeout(() => toast.remove(), 400);
  }, duration);
}

/* ══════════════════════════════════════════════════════════
   KEYBOARD SHORTCUTS
   ══════════════════════════════════════════════════════════ */
function setupKeyboardShortcuts() {
  document.addEventListener('keydown', (e) => {
    // Alt + number to switch sections
    if (e.altKey && !e.shiftKey && !e.ctrlKey) {
      const keyMap = {
        '1':'home', '2':'assistant', '3':'guide',
        '4':'timeline', '5':'faq', '6':'myths', '7':'map'
      };
      if (keyMap[e.key]) {
        e.preventDefault();
        navigateTo(keyMap[e.key]);
      }
    }
    // Escape: close sidebar on mobile
    if (e.key === 'Escape') closeSidebar();
  });
}

/* ══════════════════════════════════════════════════════════
   RESTORE USER PREFERENCES
   ══════════════════════════════════════════════════════════ */
function restorePreferences() {
  const savedTheme    = localStorage.getItem('electionGuide_theme')    || 'dark';
  const savedContrast = localStorage.getItem('electionGuide_contrast') || '';

  isDark = savedTheme === 'dark';
  document.documentElement.setAttribute('data-theme', savedTheme);
  const themeBtn = document.getElementById('darkModeToggle');
  if (themeBtn) themeBtn.textContent = isDark ? '🌙' : '☀️';

  if (savedContrast === 'high') {
    isHighContrast = true;
    document.documentElement.setAttribute('data-contrast', 'high');
  }
}

/* ══════════════════════════════════════════════════════════
   HANDLE HASH-BASED ROUTING
   ══════════════════════════════════════════════════════════ */
function handleHashRouting() {
  const hash = window.location.hash.replace('#', '');
  if (hash && SECTIONS.includes(hash)) {
    navigateTo(hash);
  } else {
    navigateTo('home');
  }
}

/* ══════════════════════════════════════════════════════════
   DOM READY – Bootstrap
   ══════════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {

  window.addEventListener('error', (event) => {
    document.dispatchEvent(new CustomEvent('app:error', {
      detail: {
        message: event.message,
        source: event.filename,
      }
    }));
  });

  window.addEventListener('unhandledrejection', (event) => {
    document.dispatchEvent(new CustomEvent('app:error', {
      detail: {
        message: String(event.reason || 'Unhandled rejection'),
        source: 'promise',
      }
    }));
  });

  /* ── Restore saved prefs ─────────────────────────────── */
  restorePreferences();

  /* ── Nav link click handlers ─────────────────────────── */
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      navigateTo(link.dataset.section);
    });
  });

  /* ── Hamburger (mobile sidebar toggle) ───────────────── */
  document.getElementById('hamburger')?.addEventListener('click', openSidebar);
  document.getElementById('sidebarOverlay')?.addEventListener('click', closeSidebar);

  /* ── Control buttons ─────────────────────────────────── */
  document.getElementById('darkModeToggle')?.addEventListener('click', toggleDarkMode);
  document.getElementById('contrastToggle')?.addEventListener('click', toggleContrast);
  document.getElementById('ttsToggle')?.addEventListener('click', toggleTTS);

  /* ── Keyboard shortcuts ──────────────────────────────── */
  setupKeyboardShortcuts();
  setupCardKeyboardNavigation();

  if (typeof initGoogleServices === 'function') {
    initGoogleServices();
  }

  if (typeof initFirebaseServices === 'function') {
    initFirebaseServices();
  }

  document.addEventListener('app:google-services-status', (event) => {
    applyGoogleServicesStatus(event.detail);
  });

  document.addEventListener('app:firebase-services-status', (event) => {
    applyFirebaseStatus(event.detail);
  });

  setTimeout(() => {
    applyGoogleServicesStatus(window.googleServicesStatus);
    applyFirebaseStatus(window.firebaseServicesStatus);
  }, 700);

  /* ── Hash routing ────────────────────────────────────── */
  handleHashRouting();
  window.addEventListener('hashchange', handleHashRouting);

  /* ── Home section "Start Chat" button (direct DOM bind) */
  document.getElementById('startChatBtn')?.addEventListener('click', () => navigateTo('assistant'));

  /* ── Initial progress nudge ──────────────────────────── */
  setTimeout(() => {
    setProgress(10, []);
    awardBadge('👋 First Visit');
  }, 600);

  /* ── Log welcome ─────────────────────────────────────── */
  console.log(`
  ╔══════════════════════════════════════╗
  ║       ElectionGuide AI v1.0          ║
  ║  Your Smart Democracy Companion 🗳️   ║
  ║  Built by Kishan Nishad              ║
  ╚══════════════════════════════════════╝
  Keyboard shortcuts:
    Alt+1 → Home       Alt+5 → FAQ
    Alt+2 → Assistant  Alt+6 → Myths
    Alt+3 → Guide      Alt+7 → Map
    Alt+4 → Timeline
  `);

  if (typeof maybeRunSelfTestsFromQuery === 'function') {
    maybeRunSelfTestsFromQuery();
  }
});
