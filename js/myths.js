/* ═══════════════════════════════════════════════════════════
   myths.js – Myth vs Fact Card Grid Renderer
   ═══════════════════════════════════════════════════════════ */

/* ─── Render myth cards ──────────────────────────────────── */
function renderMyths() {
  const grid = document.getElementById('mythsGrid');
  if (!grid) return;

  grid.innerHTML = MYTHS.map((item, idx) => `
    <div class="myth-card" id="myth-${idx}" style="animation-delay:${idx * 0.06}s">
      <div class="myth-card-header">
        <div class="myth-icon">${item.icon}</div>
        <div style="flex:1">
          <span class="myth-label myth">❌ MYTH</span>
          <div class="myth-text">${item.myth}</div>
        </div>
      </div>
      <div class="myth-card-body">
        <div class="myth-divider"></div>
        <div class="myth-fact-label">✅ THE FACT</div>
        <div class="myth-fact-text">${item.fact}</div>
        <div style="margin-top:.85rem;">
          <span style="
            background:rgba(108,99,255,.1);
            color:var(--accent-1);
            border-radius:99px;
            padding:2px 10px;
            font-size:.7rem;
            font-weight:700;
            border:1px solid rgba(108,99,255,.2);
          ">🏷️ ${item.category}</span>
        </div>
      </div>
    </div>
  `).join('');

  // Animate in
  requestAnimationFrame(() => {
    grid.querySelectorAll('.myth-card').forEach((card, i) => {
      card.style.opacity = '0';
      card.style.transform = 'translateY(24px) scale(0.97)';
      setTimeout(() => {
        card.style.transition = 'opacity 0.45s ease, transform 0.45s ease';
        card.style.opacity = '1';
        card.style.transform = 'none';
      }, i * 70);
    });
  });

  // Award badge when user reaches myths section
  awardBadge('🔍 Myth Buster');
}
