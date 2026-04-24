/* ═══════════════════════════════════════════════════════════
   guide.js – Election Guide Step-by-Step Component
   Renders expandable step cards with content from data.js
   ═══════════════════════════════════════════════════════════ */

let openStepId = null;

/* ─── Render all steps ──────────────────────────────────── */
function renderGuide() {
  const container = document.getElementById('stepsContainer');
  if (!container) return;

  container.innerHTML = '';

  ELECTION_STEPS.forEach((step, idx) => {
    const card = document.createElement('div');
    card.className = 'step-card';
    card.id = `step-${step.id}`;
    card.setAttribute('role', 'button');
    card.setAttribute('aria-expanded', 'false');
    card.setAttribute('tabindex', '0');

    card.innerHTML = `
      <div class="step-header" onclick="toggleStep(${step.id})">
        <div class="step-number" style="background:${step.color}; color:#fff; box-shadow: 0 4px 20px rgba(0,0,0,0.25);">
          ${step.icon}
        </div>
        <div class="step-info">
          <div class="step-title">${step.title}</div>
          <div class="step-desc">${step.description}</div>
        </div>
        <span class="step-badge" style="background:${step.badgeColor}; color:${step.badgeText};">
          ${step.badge}
        </span>
        <div class="step-chevron">▼</div>
      </div>

      <div class="step-body" id="step-body-${step.id}">
        <div class="step-content-grid">
          <div class="step-what">
            <h4>📌 What You Need to Do</h4>
            <ul>
              ${step.what.map(item => `<li>${item}</li>`).join('')}
            </ul>
          </div>
          <div class="step-docs">
            <h4>📄 Documents Required</h4>
            <ul>
              ${step.docs.map(doc => `<li>${doc}</li>`).join('')}
            </ul>
          </div>
        </div>
        <div class="step-tip">${step.tip}</div>
        <div style="margin-top:1rem; display:flex; gap:.75rem; flex-wrap:wrap;">
          <button class="btn-primary btn-sm" onclick="markStepDone(${step.id}, this)">✅ Mark as Done</button>
          <button class="btn-outline btn-sm" onclick="askAboutStep('${step.title}')">💬 Ask AI About This</button>
        </div>
      </div>
    `;

    // Keyboard support
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggleStep(step.id);
      }
    });

    // Animate in with delay
    card.style.opacity = '0';
    card.style.transform = 'translateY(20px)';
    container.appendChild(card);

    setTimeout(() => {
      card.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
      card.style.opacity = '1';
      card.style.transform = 'translateY(0)';
    }, idx * 100);
  });
}

/* ─── Toggle step open/close ────────────────────────────── */
function toggleStep(id) {
  const card = document.getElementById(`step-${id}`);
  const body = document.getElementById(`step-body-${id}`);
  if (!card || !body) return;

  const isOpen = card.classList.contains('open');

  // Close all steps first
  document.querySelectorAll('.step-card.open').forEach(c => {
    c.classList.remove('open');
    c.setAttribute('aria-expanded', 'false');
    const b = c.querySelector('.step-body');
    if (b) b.style.maxHeight = '0';
  });

  // Open clicked step (if it was closed)
  if (!isOpen) {
    card.classList.add('open');
    card.setAttribute('aria-expanded', 'true');
    body.style.maxHeight = body.scrollHeight + 'px';
    openStepId = id;

    // Award badge for exploring
    awardBadge('📋 Guide Explorer');
  } else {
    openStepId = null;
  }
}

/* ─── Mark step as done ─────────────────────────────────── */
const completedSteps = new Set();

function markStepDone(id, btn) {
  if (completedSteps.has(id)) {
    showToast('This step is already marked as done!', 'info');
    return;
  }

  completedSteps.add(id);

  // Style the button
  btn.textContent = '✅ Done!';
  btn.disabled = true;
  btn.style.opacity = '0.7';

  // Add visual indicator to card header
  const card = document.getElementById(`step-${id}`);
  if (card) {
    const header = card.querySelector('.step-header');
    const existingDone = header.querySelector('.done-tag');
    if (!existingDone) {
      const doneTag = document.createElement('span');
      doneTag.className = 'done-tag';
      doneTag.style.cssText = `
        background:rgba(67,233,123,.15);
        color:#43E97B;
        border: 1px solid rgba(67,233,123,.3);
        border-radius: 99px;
        padding: 2px 10px;
        font-size: 0.72rem;
        font-weight: 700;
        margin-left: 0.5rem;
      `;
      doneTag.textContent = '✓ Done';
      header.querySelector('.step-info').appendChild(doneTag);
    }
  }

  showToast(`Step "${ELECTION_STEPS.find(s => s.id === id)?.title}" marked as complete! 🎉`, 'success');

  // Update progress based on completed steps
  const pct = Math.round((completedSteps.size / ELECTION_STEPS.length) * 100);
  const bonusBadges = [];
  if (completedSteps.size === 1) bonusBadges.push({ label:'🥉 Started Journey' });
  if (completedSteps.size === 3) bonusBadges.push({ label:'🥈 Halfway There' });
  if (completedSteps.size === ELECTION_STEPS.length) {
    bonusBadges.push({ label:'🥇 Voter Ready!' });
    showToast('🎉 Congratulations! You\'ve completed all election steps!', 'success');
  }

  // Merge with existing progress
  const currentPct = parseInt(document.getElementById('progressPct')?.textContent) || 0;
  setProgress(Math.max(currentPct, pct), bonusBadges);
}

/* ─── Ask AI about a step ───────────────────────────────── */
function askAboutStep(stepTitle) {
  const chatInput = document.getElementById('chatInput');
  if (chatInput) {
    chatInput.value = `Tell me more about: ${stepTitle}`;
  }
  navigateTo('assistant');
  // Auto-send after a small delay
  setTimeout(() => sendMessage(), 300);
}
