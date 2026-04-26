/* ═══════════════════════════════════════════════════════════
   map.js – Polling Station Finder
   Uses Google Maps embed + mock station list
   ═══════════════════════════════════════════════════════════ */

/* ─── Render default stations ────────────────────────────── */
function renderPollingStations(stations = POLLING_STATIONS) {
  const list = document.getElementById('stationsList');
  if (!list) return;

  if (stations.length === 0) {
    list.innerHTML = `
      <div style="grid-column:1/-1;text-align:center;padding:2rem;color:var(--text-secondary);">
        <div style="font-size:2.5rem;margin-bottom:.75rem;">📍</div>
        <p>No stations found for that area. Try a different search term.</p>
      </div>`;
    return;
  }

  list.innerHTML = stations.map((st, idx) => `
    <div class="station-card" style="animation-delay:${idx * 0.06}s">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:.25rem;">
        <div class="station-name">📍 ${st.name}</div>
        <div class="station-dist">📏 ${st.dist}</div>
      </div>
      <div class="station-addr">🏠 ${st.addr}</div>
      <div class="station-meta">
        ${st.tags.map(tag => `<span class="station-tag">${tag}</span>`).join('')}
      </div>
      <div style="margin-top:.85rem;display:flex;gap:.5rem;flex-wrap:wrap;">
        <button class="btn-outline btn-sm" data-action="open-maps" data-query="${encodeURIComponent(st.name + ', ' + st.addr)}">
          🗺️ Open in Maps
        </button>
        <button class="btn-outline btn-sm" data-action="get-directions" data-query="${encodeURIComponent(st.addr)}">
          🧭 Directions
        </button>
      </div>
    </div>
  `).join('');

  // Fade in cards
  requestAnimationFrame(() => {
    list.querySelectorAll('.station-card').forEach((card, i) => {
      card.style.opacity = '0';
      card.style.transform = 'translateY(16px)';
      setTimeout(() => {
        card.style.transition = 'opacity .4s ease, transform .4s ease';
        card.style.opacity = '1';
        card.style.transform = 'none';
      }, i * 70);
    });
  });
}

/* ─── Search polling stations by area/pincode ──────────── */
function searchPollingStations() {
  const input   = document.getElementById('mapSearch');
  const query   = (input?.value || '').trim().toLowerCase();

  if (!query) {
    renderPollingStations(POLLING_STATIONS);
    updateMapEmbed('polling station near me');
    return;
  }

  // Filter mock data by name/address
  const filtered = POLLING_STATIONS.filter(st =>
    st.name.toLowerCase().includes(query) ||
    st.addr.toLowerCase().includes(query) ||
    st.tags.some(t => t.toLowerCase().includes(query))
  );

  renderPollingStations(filtered);
  updateMapEmbed(`polling station near ${query}`);
  showToast(`🔍 Found ${filtered.length} station(s) near "${query}"`, filtered.length ? 'success' : 'info');
}

/* ─── Use geolocation ────────────────────────────────────── */
function useMyLocation() {
  const btn = document.getElementById('locationBtn');
  if (!navigator.geolocation) {
    showToast('Geolocation is not supported by your browser.', 'error');
    return;
  }

  btn.textContent = '⏳ Locating…';
  btn.disabled = true;

  navigator.geolocation.getCurrentPosition(
    (pos) => {
      const { latitude, longitude } = pos.coords;
      btn.textContent = '📡 Use My Location';
      btn.disabled = false;

      showToast(`📍 Location found (${latitude.toFixed(3)}, ${longitude.toFixed(3)}). Showing nearest booths!`, 'success');

      // Update map embed with coordinates
      const iframe = document.getElementById('googleMapIframe');
      if (iframe) {
        iframe.src = `https://maps.google.com/maps?q=polling+station&ll=${latitude},${longitude}&z=14&output=embed`;
      }

      // Show mock "nearby" stations (sort by mock distance)
      const nearby = [...POLLING_STATIONS].sort(() => Math.random() - 0.5);
      renderPollingStations(nearby);
      awardBadge('📍 Location Finder');
    },
    (err) => {
      btn.textContent = '📡 Use My Location';
      btn.disabled = false;
      showToast('Could not get your location. Please search manually.', 'error');
    },
    { timeout: 8000, maximumAge: 60000 }
  );
}

/* ─── Update the Google Maps embed ──────────────────────── */
function updateMapEmbed(query) {
  const iframe = document.getElementById('googleMapIframe');
  if (!iframe) return;

  // Use Google Maps search embed (no API key needed for basic embed)
  const encoded = encodeURIComponent(query);
  iframe.src = `https://maps.google.com/maps?q=${encoded}&output=embed`;
}

/* ─── Open station in Google Maps ───────────────────────── */
function openInMaps(encodedAddr) {
  window.open(`https://www.google.com/maps/search/?api=1&query=${encodedAddr}`, '_blank', 'noopener,noreferrer');
}

/* ─── Get directions to station ─────────────────────────── */
function getDirections(encodedAddr) {
  window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodedAddr}`, '_blank', 'noopener,noreferrer');
}

/* ─── Init map section ───────────────────────────────────── */
function initMap() {
  renderPollingStations();

  // Set initial map embed
  updateMapEmbed('polling station near New Delhi India');

  // Enter key on search input
  const input = document.getElementById('mapSearch');
  if (input) {
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') searchPollingStations();
    });
  }
}
