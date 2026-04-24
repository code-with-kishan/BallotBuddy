/* ═══════════════════════════════════════════════════════════
   faq.js – FAQ Engine with search, categories & accordion
   ═══════════════════════════════════════════════════════════ */

let activeFaqCategory = 'All';
let openFaqId = null;

/* ─── Render categories ──────────────────────────────────── */
function renderFaqCategories() {
  const container = document.getElementById('faqCategories');
  if (!container) return;

  container.innerHTML = FAQ_CATEGORIES.map(cat => `
    <button
      class="faq-cat-btn ${cat === activeFaqCategory ? 'active' : ''}"
      onclick="setFaqCategory('${cat}')"
      aria-pressed="${cat === activeFaqCategory}"
    >${cat}</button>
  `).join('');
}

/* ─── Set active category ────────────────────────────────── */
function setFaqCategory(cat) {
  activeFaqCategory = cat;
  renderFaqCategories();
  renderFaqList();
}

/* ─── Render FAQ list ────────────────────────────────────── */
function renderFaqList(filter = '') {
  const container = document.getElementById('faqList');
  const emptyEl   = document.getElementById('faqEmpty');
  if (!container) return;

  const query = filter.trim().toLowerCase();

  // Filter by category + search query
  const filtered = FAQS.filter(faq => {
    const matchCat   = activeFaqCategory === 'All' || faq.cat === activeFaqCategory;
    const matchQuery = !query ||
      faq.q.toLowerCase().includes(query) ||
      faq.a.toLowerCase().includes(query) ||
      faq.cat.toLowerCase().includes(query);
    return matchCat && matchQuery;
  });

  if (filtered.length === 0) {
    container.innerHTML = '';
    emptyEl.style.display = 'block';
    return;
  }

  emptyEl.style.display = 'none';

  container.innerHTML = filtered.map((faq, idx) => `
    <div
      class="faq-item ${openFaqId === faq.id ? 'open' : ''}"
      id="faq-${faq.id}"
      onclick="toggleFaq(${faq.id})"
      role="button"
      aria-expanded="${openFaqId === faq.id}"
      tabindex="0"
    >
      <div class="faq-question">
        <span>
          <span style="
            background:rgba(108,99,255,.1);
            color:var(--accent-1);
            border-radius:99px;
            padding:1px 8px;
            font-size:.72rem;
            font-weight:700;
            margin-right:.5rem;
          ">${faq.cat}</span>
          ${highlightQuery(faq.q, query)}
        </span>
        <span class="faq-chevron">▼</span>
      </div>
      <div class="faq-answer" id="faq-answer-${faq.id}">
        <div class="faq-answer-inner">${faq.a}</div>
      </div>
    </div>
  `).join('');

  // Restore open state heights
  filtered.forEach(faq => {
    if (openFaqId === faq.id) {
      const ansEl = document.getElementById(`faq-answer-${faq.id}`);
      if (ansEl) ansEl.style.maxHeight = ansEl.scrollHeight + 'px';
    }
  });

  // Keyboard support for each item
  container.querySelectorAll('.faq-item').forEach(item => {
    item.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        item.click();
      }
    });
  });
}

/* ─── Toggle FAQ item open/close ─────────────────────────── */
function toggleFaq(id) {
  const item  = document.getElementById(`faq-${id}`);
  const ans   = document.getElementById(`faq-answer-${id}`);
  if (!item || !ans) return;

  const isOpen = item.classList.contains('open');

  // Close all
  document.querySelectorAll('.faq-item.open').forEach(el => {
    el.classList.remove('open');
    el.setAttribute('aria-expanded', 'false');
    const a = el.querySelector('.faq-answer');
    if (a) a.style.maxHeight = '0';
  });

  if (!isOpen) {
    item.classList.add('open');
    item.setAttribute('aria-expanded', 'true');
    ans.style.maxHeight = ans.scrollHeight + 'px';
    openFaqId = id;
    awardBadge('❓ FAQ Explorer');
  } else {
    openFaqId = null;
  }
}

/* ─── Search/filter FAQs ─────────────────────────────────── */
function filterFAQ() {
  const query = document.getElementById('faqSearch')?.value || '';
  openFaqId = null; // reset open state on search
  renderFaqList(query);
}

/* ─── Highlight search term in text ─────────────────────── */
function highlightQuery(text, query) {
  if (!query) return text;
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  return text.replace(regex, `<mark style="background:rgba(247,201,72,.25);color:var(--accent-gold);border-radius:3px;">$1</mark>`);
}

/* ─── Init ───────────────────────────────────────────────── */
function initFaq() {
  renderFaqCategories();
  renderFaqList();
}
