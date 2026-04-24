/* ═══════════════════════════════════════════════════════════
   timeline.js – Interactive Election Timeline Visualizer
   Renders phase cards from TIMELINES data with color coding
   ═══════════════════════════════════════════════════════════ */

/* ─── Render timeline for selected country ─────────────── */
function renderTimeline() {
  const countrySelect = document.getElementById('timelineCountry');
  const country = countrySelect ? countrySelect.value : 'India';
  const wrapper  = document.getElementById('timelineWrapper');
  if (!wrapper) return;

  const events = TIMELINES[country] || TIMELINES['India'];

  wrapper.innerHTML = `<div class="timeline-line"></div>`;

  events.forEach((event, idx) => {
    const item = document.createElement('div');
    item.className = 'timeline-item';
    item.style.animationDelay = `${idx * 0.08}s`;

    // Determine if this is a past, current, or upcoming event
    const status = getEventStatus(event.date);
    const statusLabels = {
      past:    { label:'Completed', color:'rgba(67,233,123,.15)',  textColor:'#43E97B' },
      current: { label:'Active Now',color:'rgba(247,201,72,.15)',  textColor:'#F7C948' },
      upcoming:{ label:'Upcoming',  color:'rgba(108,99,255,.15)',  textColor:'#6C63FF' },
    };
    const s = statusLabels[status];

    item.innerHTML = `
      <div class="timeline-node" style="background:${event.nodeColor}; box-shadow:0 0 12px ${event.nodeColor}40;">
        ${event.icon}
      </div>
      <div class="timeline-card">
        <div class="timeline-card-phase" style="color:${event.color};">${event.phase}</div>
        <div class="timeline-card-title">${event.title}</div>
        <div class="timeline-card-date">📅 ${event.date}</div>
        <div class="timeline-card-desc">${event.desc}</div>
        <div style="margin-top:.75rem;">
          <span style="
            background:${s.color};
            color:${s.textColor};
            border:1px solid ${s.textColor}30;
            border-radius:99px;
            padding:2px 10px;
            font-size:.7rem;
            font-weight:700;
          ">${s.label}</span>
        </div>
      </div>
    `;

    wrapper.appendChild(item);
  });

  // Animate in
  requestAnimationFrame(() => {
    wrapper.querySelectorAll('.timeline-item').forEach((item, i) => {
      item.style.opacity = '0';
      item.style.transform = i % 2 === 0 ? 'translateX(-30px)' : 'translateX(30px)';
      setTimeout(() => {
        item.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        item.style.opacity = '1';
        item.style.transform = 'none';
      }, i * 80);
    });
  });
}

/* ─── Determine event status from date string ──────────── */
function getEventStatus(dateStr) {
  // Simple heuristic – treat "2024" events as past, future years as upcoming
  const now = new Date();
  const yearMatch = dateStr.match(/20(\d{2})/);
  if (!yearMatch) return 'upcoming';
  const year = parseInt('20' + yearMatch[1]);

  if (year < now.getFullYear()) return 'past';
  if (year > now.getFullYear()) return 'upcoming';

  // Same year — try to parse month
  const months = ['january','february','march','april','may','june',
                  'july','august','september','october','november','december'];
  const lower = dateStr.toLowerCase();
  const monthIdx = months.findIndex(m => lower.includes(m));
  if (monthIdx === -1) return 'current';

  const currentMonth = now.getMonth(); // 0-indexed
  if (monthIdx < currentMonth) return 'past';
  if (monthIdx > currentMonth) return 'upcoming';
  return 'current';
}

/* ─── Add to Google Calendar ────────────────────────────── */
function addToCalendar() {
  // Build a Google Calendar event URL for the election day
  const countryEl  = document.getElementById('timelineCountry');
  const country    = countryEl ? countryEl.value : 'India';
  const events     = TIMELINES[country] || TIMELINES['India'];

  // Find the voting/election day event
  const votingEvent = events.find(e =>
    e.phase.toLowerCase().includes('voting') ||
    e.phase.toLowerCase().includes('election day') ||
    e.title.toLowerCase().includes('election day')
  ) || events[5]; // fallback to index 5

  // Encode for Google Calendar URL
  const title   = encodeURIComponent(`🗳️ ${votingEvent.title} – ${country}`);
  const details = encodeURIComponent(votingEvent.desc + '\n\nPowered by ElectionGuide AI');
  const loc     = encodeURIComponent('Your nearest polling booth');

  // Build a date string – Google Calendar format: YYYYMMDD
  // Since dates are strings, use a mock upcoming date
  const calDate = getCalendarDate(votingEvent.date);

  const calUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&location=${loc}&dates=${calDate}/${calDate}`;

  // Open Google Calendar in a new tab
  window.open(calUrl, '_blank', 'noopener,noreferrer');

  // Show success message
  const successEl = document.getElementById('calendarSuccess');
  if (successEl) {
    successEl.style.display = 'block';
    setTimeout(() => { successEl.style.display = 'none'; }, 4000);
  }

  showToast('📅 Opening Google Calendar to add reminder…', 'success');
  awardBadge('📅 Calendar Pro');
}

/* ─── Parse date string to YYYYMMDD ────────────────────── */
function getCalendarDate(dateStr) {
  const months = {
    january:'01', february:'02', march:'03', april:'04',
    may:'05', june:'06', july:'07', august:'08',
    september:'09', october:'10', november:'11', december:'12'
  };

  const lower = dateStr.toLowerCase();
  const yearMatch  = dateStr.match(/\d{4}/);
  const year  = yearMatch ? yearMatch[0] : new Date().getFullYear().toString();

  let month = '01';
  for (const [name, num] of Object.entries(months)) {
    if (lower.includes(name)) { month = num; break; }
  }

  // Day
  const dayMatch = dateStr.match(/\b([1-9]|[12]\d|3[01])\b/);
  const day = dayMatch ? dayMatch[0].padStart(2, '0') : '01';

  return `${year}${month}${day}`;
}
