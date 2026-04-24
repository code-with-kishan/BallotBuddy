/* ═══════════════════════════════════════════════════════════
   chat.js – AI Chat Assistant Logic (Rule-based engine)
   Handles message rendering, voice input, TTS, personalization
   ═══════════════════════════════════════════════════════════ */

/* ── State ─────────────────────────────────────────────── */
let userProfile = { age: null, country: null, firstTime: null };
let ttsEnabled  = false;
let isRecording = false;
let recognition = null;
let chatHistory = [];

/* ── DOM refs (set after DOM ready) ────────────────────── */
let chatMessagesEl, chatInputEl;

/* ═══════════════════════════════════════════════════════════
   Init
   ═══════════════════════════════════════════════════════════ */
function initChat() {
  chatMessagesEl = document.getElementById('chatMessages');
  chatInputEl    = document.getElementById('chatInput');

  // Send on Enter (not Shift+Enter)
  chatInputEl.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });

  // Auto-resize textarea
  chatInputEl.addEventListener('input', () => {
    chatInputEl.style.height = 'auto';
    chatInputEl.style.height = Math.min(chatInputEl.scrollHeight, 120) + 'px';
  });

  // Setup voice
  setupVoice();

  // Show welcome
  addWelcomeMessage();
}

/* ═══════════════════════════════════════════════════════════
   Welcome message
   ═══════════════════════════════════════════════════════════ */
function addWelcomeMessage() {
  const welcome = `
    <strong>👋 Welcome to ElectionGuide AI!</strong><br/><br/>
    I'm your personalized election assistant. I can help you with:<br/>
    • 🗳️ Voter registration guidance<br/>
    • ✅ Eligibility checks<br/>
    • 📄 Required documents<br/>
    • 📅 Election timelines & deadlines<br/>
    • 🔍 Myth-busting & FAQs<br/>
    • 📍 Finding your polling booth<br/><br/>
    <em>Tell me your age and country for personalized advice, or just ask away!</em>
  `;
  appendMessage('ai', welcome, { allowHtml: true });
}

/* ═══════════════════════════════════════════════════════════
   Send Message
   ═══════════════════════════════════════════════════════════ */
function sendMessage() {
  const input = chatInputEl.value.trim();
  if (!input) return;

  // Sanitize input (strip HTML)
  const sanitized = input.replace(/[<>]/g, '').slice(0, 500);

  // Render user bubble
  appendMessage('user', sanitized, { allowHtml: false });
  chatInputEl.value = '';
  chatInputEl.style.height = 'auto';

  // Save history
  chatHistory.push({ role:'user', text: sanitized });

  // Show typing indicator
  const typingId = showTyping();

  // Simulate AI thinking (100–800ms variable)
  const delay = 400 + Math.random() * 500;
  setTimeout(() => {
    removeTyping(typingId);
    const response = generateResponse(sanitized);
    appendMessage('ai', response, { allowHtml: true });
    chatHistory.push({ role:'ai', text: response });

    // TTS
    if (ttsEnabled) speakText(stripHtml(response));

    // Update progress
    updateProgressFromChat(sanitized);
  }, delay);
}

/* ── Quick prompt helper ─────────────────────────────────── */
function sendQuickPrompt(text) {
  chatInputEl.value = text;
  sendMessage();
  // Navigate to assistant if not there
  navigateTo('assistant');
}

/* ═══════════════════════════════════════════════════════════
   Append message bubble
   ═══════════════════════════════════════════════════════════ */
function appendMessage(role, content, options = {}) {
  const allowHtml = options.allowHtml === true;
  const wrapper = document.createElement('div');
  wrapper.className = `message msg-${role}`;

  const avatar = document.createElement('div');
  avatar.className = 'msg-avatar';
  avatar.textContent = role === 'ai' ? '🤖' : '👤';

  const bubble = document.createElement('div');
  bubble.className = 'msg-bubble';
  if (allowHtml) {
    bubble.innerHTML = content;
  } else {
    bubble.textContent = content;
  }

  wrapper.appendChild(avatar);
  wrapper.appendChild(bubble);
  chatMessagesEl.appendChild(wrapper);
  chatMessagesEl.scrollTop = chatMessagesEl.scrollHeight;
  return wrapper;
}

/* ═══════════════════════════════════════════════════════════
   Typing indicator
   ═══════════════════════════════════════════════════════════ */
function showTyping() {
  const id = 'typing-' + Date.now();
  const wrapper = document.createElement('div');
  wrapper.className = 'message msg-ai';
  wrapper.id = id;

  const avatar = document.createElement('div');
  avatar.className = 'msg-avatar';
  avatar.textContent = '🤖';

  const bubble = document.createElement('div');
  bubble.className = 'msg-bubble';
  bubble.innerHTML = `<div class="typing-indicator"><div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div></div>`;

  wrapper.appendChild(avatar);
  wrapper.appendChild(bubble);
  chatMessagesEl.appendChild(wrapper);
  chatMessagesEl.scrollTop = chatMessagesEl.scrollHeight;
  return id;
}
function removeTyping(id) {
  const el = document.getElementById(id);
  if (el) el.remove();
}

/* ═══════════════════════════════════════════════════════════
   Rule-based AI Response Engine
   ═══════════════════════════════════════════════════════════ */
function generateResponse(input) {
  const text  = input.toLowerCase();
  const kb    = AI_KB;
  const prof  = userProfile;
  const country = prof.country || 'India'; // default

  /* ─ Check for age extraction ─────────────────────────── */
  const ageMatch = text.match(/\b(1[0-9]|[2-9][0-9]|1[0-1][0-9])\b/);
  if (ageMatch) {
    const age = parseInt(ageMatch[0]);
    if (!prof.age) {
      prof.age = age;
      if (age >= 18) {
        updateProfileDisplay();
        return `Great! At <strong>${age} years old</strong>, you are <strong>eligible to vote</strong> in most democracies! 🎉
        <br/><br/>
        <span class="eligibility-tag eligible">✅ Eligible to Vote</span>
        <br/><br/>
        Based on your age, here are your next steps:<br/>
        1. <a href="#" onclick="navigateTo('guide')">📋 Check the registration steps</a><br/>
        2. Ensure you're enrolled in the voter list<br/>
        3. Gather your documents<br/><br/>
        Would you like to tell me your <strong>country</strong> for more specific advice?`;
      } else {
        return `At <strong>${age} years old</strong>, you are <strong>not yet eligible</strong> to vote in most countries — the minimum age is 18.
        <br/><br/>
        <span class="eligibility-tag ineligible">❌ Not Yet Eligible</span>
        <br/><br/>
        But it's great that you're learning! You'll be eligible when you turn 18. Meanwhile, stay informed about the election process here! 📚`;
      }
    }
  }

  /* ─ Country extraction ───────────────────────────────── */
  const countries = { india:['india','indian'], usa:['usa','america','united states','american'], uk:['uk','united kingdom','british','england'] };
  for (const [key, terms] of Object.entries(countries)) {
    if (terms.some(t => text.includes(t))) {
      prof.country = { india:'India', usa:'USA', uk:'UK' }[key];
      updateProfileDisplay();
    }
  }
  if (text.includes('first time') || text.includes('first-time') || text.includes('never voted')) {
    prof.firstTime = 'yes';
  }

  /* ─ Greeting ─────────────────────────────────────────── */
  if (kb.greet.some(g => text.includes(g))) {
    return `Hello there! 👋 I'm <strong>ElectionGuide AI</strong>, your smart voting assistant.<br/><br/>
    To give you the most personalized advice, could you share:<br/>
    • Your <strong>age</strong><br/>
    • Your <strong>country</strong> (India, USA, UK, etc.)<br/>
    • Are you a <strong>first-time voter</strong>?<br/><br/>
    Or ask me anything — I'm here to help! 🗳️`;
  }

  /* ─ Eligibility ──────────────────────────────────────── */
  if (kb.age_eligible.some(k => text.includes(k))) {
    if (prof.age && prof.age >= 18) {
      return `Based on what you've told me, you are <strong>eligible to vote</strong>! ✅
      <br/><br/><span class="eligibility-tag eligible">✅ Eligible – Age ${prof.age}</span>
      <br/><br/>
      <strong>Eligibility criteria (${country}):</strong><br/>
      ${getEligibilityRules(country)}
      <br/><br/>
      <a href="#" onclick="navigateTo('guide')">→ See the Full Registration Guide</a>`;
    }
    if (prof.age && prof.age < 18) {
      return `At <strong>${prof.age} years old</strong>, you are not yet eligible. You need to be <strong>18 years or older</strong>.
      <br/><br/><span class="eligibility-tag ineligible">❌ Not Yet Eligible</span>`;
    }
    return `The minimum age to vote in most democracies is <strong>18 years</strong>.<br/><br/>
    Could you tell me your age? I'll confirm your eligibility instantly! 😊<br/><br/>
    ${getEligibilityRules(country)}`;
  }

  /* ─ Documents ────────────────────────────────────────── */
  if (kb.documents.some(k => text.includes(k))) {
    return getDocumentResponse(country);
  }

  /* ─ Registration ─────────────────────────────────────── */
  if (kb.register.some(k => text.includes(k))) {
    return getRegistrationResponse(country);
  }

  /* ─ How to vote ──────────────────────────────────────── */
  if (kb.howto_vote.some(k => text.includes(k))) {
    return `Here's what happens on <strong>Election Day</strong> in ${country}:<br/><br/>
    <strong>Step-by-step at the polling booth:</strong><br/>
    1. 📍 Locate your assigned polling booth on your Voter ID / ECI website<br/>
    2. 🕖 Arrive early (opens at 7:00 AM, closes at 6:00 PM)<br/>
    3. 👤 Join the queue and show your Voter ID to the officer<br/>
    4. ✋ Your finger will be inked (prevents double voting)<br/>
    5. 🗳️ Press the button next to your chosen candidate on the EVM<br/>
    6. 📄 Verify the VVPAT slip (visible for 7 seconds)<br/>
    7. ✅ Done — you've voted!<br/><br/>
    <a href="#" onclick="navigateTo('guide')">→ See the complete interactive guide</a>`;
  }

  /* ─ EVM / Technology ─────────────────────────────────── */
  if (kb.evm.some(k => text.includes(k))) {
    if (text.includes('nota')) {
      return `<strong>NOTA (None of the Above)</strong> was introduced in India in 2013 after a Supreme Court ruling.<br/><br/>
      ℹ️ When you press NOTA:<br/>
      • Your vote is counted as a NOTA vote<br/>
      • NOTA does <strong>NOT</strong> invalidate the election<br/>
      • The candidate with the most non-NOTA votes still wins<br/>
      • It's a way to express dissatisfaction with all candidates<br/><br/>
      Some demand that if NOTA wins, a fresh election should be held — but this is not the current law.`;
    }
    return `<strong>How EVMs Work:</strong><br/><br/>
    India's EVMs are:<br/>
    • 🔌 <strong>Standalone devices</strong> — no internet, no Bluetooth, no Wi-Fi<br/>
    • 🔒 <strong>One-time programmable chips</strong> — firmware cannot be altered after manufacture<br/>
    • 🛡️ Controlled by the Election Commission, not the government<br/>
    • ✅ Tested via mock polls before every election<br/><br/>
    <strong>VVPAT</strong> (Voter Verifiable Paper Audit Trail) adds a paper layer — after you vote, a slip shows your candidate's name for 7 seconds then falls into a sealed box.<br/><br/>
    EVMs are considered one of the world's most secure voting systems.`;
  }

  /* ─ First-time voter ─────────────────────────────────── */
  if (kb.firsttime.some(k => text.includes(k))) {
    prof.firstTime = 'yes';
    updateProgressFromChat('firsttime');
    return `Welcome to your first election! 🎉 It's a big moment. Here's your <strong>First-Time Voter Checklist</strong>:<br/><br/>
    <strong>Before Election Day:</strong><br/>
    ☑️ Register to vote (Form 6 if in India)<br/>
    ☑️ Check your name on the voter list<br/>
    ☑️ Find your polling booth on ECI website<br/>
    ☑️ Research candidates in your constituency<br/>
    ☑️ Gather your Voter ID + one alternate ID<br/><br/>
    <strong>On Election Day:</strong><br/>
    ☑️ Go early to avoid queues<br/>
    ☑️ Carry your Voter ID + alternate proof<br/>
    ☑️ Follow the queue, wait for your turn<br/>
    ☑️ Ink your finger → Get ballot slip → Vote on EVM<br/><br/>
    <a href="#" onclick="navigateTo('guide')">→ See the Full Interactive Guide</a>`;
  }

  /* ─ Timeline / deadlines ─────────────────────────────── */
  if (kb.timeline.some(k => text.includes(k))) {
    return `📅 <strong>Key Election Dates (${country}):</strong><br/><br/>
    ${getTimelineSummary(country)}<br/><br/>
    <a href="#" onclick="navigateTo('timeline')">→ View Full Interactive Timeline</a><br/>
    You can also <a href="#" onclick="addToCalendar()">📆 add reminders to Google Calendar</a>!`;
  }

  /* ─ Results / counting ───────────────────────────────── */
  if (kb.results.some(k => text.includes(k))) {
    return `<strong>How vote counting works in ${country}:</strong><br/><br/>
    1. 📬 <strong>Postal ballots counted first</strong> on counting day<br/>
    2. 🗳️ EVM votes counted round-by-round at counting tables<br/>
    3. 👀 Candidate agents observe every round<br/>
    4. 📊 Results uploaded live on ECI website<br/>
    5. 🏆 Candidate with most votes (FPTP system) wins<br/>
    6. 📜 Winning candidate receives election certificate<br/><br/>
    Results are also broadcast live on news channels and DD News. The entire process takes 4–8 hours for most constituencies.`;
  }

  /* ─ Myths / security ─────────────────────────────────── */
  if (kb.myths.some(k => text.includes(k))) {
    return `EVMs are <strong>completely secure</strong> — here's why the hacking myth is false:<br/><br/>
    ❌ No internet connection<br/>
    ❌ No Bluetooth or radio frequency<br/>
    ❌ No external memory slots<br/>
    ✅ One-time programmable chip (set at manufacture)<br/>
    ✅ Physical tamper-evident seals<br/>
    ✅ Multiple rounds of mock polls before election<br/>
    ✅ Candidate/agent-witnessed sealing and storage<br/><br/>
    <strong>Your vote is also 100% secret</strong> — no one can trace which button you pressed.<br/><br/>
    <a onclick="navigateTo('myths')" href="#">→ See all Myth vs Fact busters</a>`;
  }

  /* ─ Polling stations / map ───────────────────────────── */
  if (kb.map.some(k => text.includes(k))) {
    return `📍 <strong>Finding your polling station:</strong><br/><br/>
    <strong>Step 1:</strong> Visit <a href="https://electoralsearch.eci.gov.in" target="_blank" rel="noopener">electoralsearch.eci.gov.in</a> (India)<br/>
    <strong>Step 2:</strong> Enter your name, state, assembly constituency<br/>
    <strong>Step 3:</strong> Your booth address will be shown<br/><br/>
    Or use our <a href="#" onclick="navigateTo('map')">📍 interactive Polling Station Finder</a> here!<br/><br/>
    💡 Your polling booth is in your own constituency — you <strong>cannot</strong> vote at any other booth.`;
  }

  /* ─ NRI / Postal ─────────────────────────────────────── */
  if (kb.nri.some(k => text.includes(k))) {
    return `<strong>NRI Voting (India):</strong><br/><br/>
    🌍 NRIs with valid Indian passports <strong>can</strong> vote as overseas voters<br/>
    📋 They must be enrolled in the voter list of their home constituency<br/>
    ✈️ Currently, NRIs must be <strong>physically present in India</strong> on election day<br/>
    📬 Postal voting for NRIs is proposed but not yet implemented<br/><br/>
    To register as an overseas voter: visit <a href="https://www.nvsp.in" target="_blank" rel="noopener">NVSP Portal</a> and fill <strong>Form 6A</strong>.<br/><br/>
    <strong>For USA:</strong> Citizens living abroad can vote via absentee ballot using UOCAVA rules.`;
  }

  /* ─ Country-specific fallbacks ───────────────────────── */
  if (kb.india.some(k => text.includes(k))) {
    return getIndiaSpecificResponse(text);
  }
  if (kb.usa.some(k => text.includes(k))) {
    return `<strong>US Election System:</strong><br/><br/>
    🏛️ USA uses an <strong>Electoral College</strong> system — not a direct popular vote for President<br/>
    🗳️ Each state has a number of electors (based on congressional seats)<br/>
    📌 Most states are "winner-takes-all" — the popular vote winner gets all electors<br/>
    📅 Elections held every 4 years on the <strong>first Tuesday after the first Monday in November</strong><br/><br/>
    Register at: <a href="https://vote.gov" target="_blank" rel="noopener">vote.gov</a>`;
  }

  /* ─ Default fallback ─────────────────────────────────── */
  return getFallbackResponse(text);
}

/* ─── Country-specific helpers ───────────────────────────── */
function getEligibilityRules(country) {
  const rules = {
    India: `• Must be <strong>18+ years</strong> of age<br/>
    • Must be a <strong>citizen of India</strong><br/>
    • Must be a <strong>resident</strong> in the constituency for ≥6 months<br/>
    • Name must be on the <strong>electoral roll</strong><br/>
    • Must not be of unsound mind (as declared by court)`,
    USA: `• Must be a <strong>US citizen</strong><br/>
    • Must be <strong>18+ years</strong> by Election Day<br/>
    • Must be a <strong>resident</strong> of the state where you register<br/>
    • Must register <strong>before the state deadline</strong> (varies by state)<br/>
    • Must not be a convicted felon (varies by state)`,
    UK: `• Must be a <strong>UK, Irish, or qualifying Commonwealth citizen</strong><br/>
    • Must be <strong>18+ years</strong> on election day<br/>
    • Must be <strong>registered</strong> at a UK address<br/>
    • Must not be a peer sitting in the House of Lords<br/>
    • Must not be serving a prison sentence`,
  };
  return rules[country] || rules['India'];
}

function getDocumentResponse(country) {
  const docs = {
    India: `<strong>Documents for Voting in India:</strong><br/><br/>
    <strong>Primary (preferred):</strong><br/>
    🪪 Voter ID Card (EPIC)<br/><br/>
    <strong>Accepted Alternatives (any one):</strong><br/>
    🆔 Aadhaar Card<br/>
    🛂 Passport<br/>
    🚗 Driving License<br/>
    💳 PAN Card<br/>
    🏦 Bank/Post Office Passbook with photo<br/>
    📋 MNREGA Job Card<br/>
    🧾 Health Insurance Smart Card (ESIC)<br/>
    📸 Pension document with photo<br/>
    📱 Smart Card (National Population Register)<br/><br/>
    <em>Any ONE from the list above is sufficient.</em>`,
    USA: `<strong>Documents for Voting in USA:</strong><br/><br/>
    Requirements vary by state, but generally:<br/>
    🛂 Passport<br/>
    🚗 State-issued Driver's License / ID<br/>
    📋 Voter Registration Card<br/>
    🎖️ Military ID<br/><br/>
    Some states (like California) don't require ID for registered voters. Check your state's specific requirements at <a href="https://vote.gov" target="_blank" rel="noopener">vote.gov</a>.`,
    UK: `<strong>Documents for Voting in UK (from 2023):</strong><br/><br/>
    Photo ID now required — accepted IDs:<br/>
    🛂 Passport (UK or foreign)<br/>
    🚗 UK Driving Licence (full or provisional)<br/>
    🎖️ Military ID<br/>
    💳 Blue Badge (disability parking)<br/>
    🪪 Voter Authority Certificate (free from council)<br/><br/>
    Apply for a free Voter Authority Certificate at your local council if you don't have accepted ID.`,
  };
  return docs[country] || docs['India'];
}

function getRegistrationResponse(country) {
  const reg = {
    India: `<strong>How to Register in India:</strong><br/><br/>
    🌐 <strong>Online:</strong> Visit <a href="https://voters.eci.gov.in" target="_blank" rel="noopener">voters.eci.gov.in</a> → Fill <strong>Form 6</strong><br/>
    📍 <strong>Offline:</strong> Visit your nearest Electoral Registration Office<br/><br/>
    <strong>What you'll need:</strong><br/>
    • Age proof (Aadhaar / Birth Certificate)<br/>
    • Address proof<br/>
    • Passport photo<br/><br/>
    <strong>Track status:</strong> You'll get a reference number — check status on NVSP portal within 30 days.<br/><br/>
    <a href="#" onclick="navigateTo('guide')">→ Full Step-by-Step Guide</a>`,
    USA: `<strong>How to Register in USA:</strong><br/><br/>
    🌐 Visit <a href="https://vote.gov" target="_blank" rel="noopener">vote.gov</a> and select your state<br/>
    🏛️ Or register at your local DMV, post office, or state election office<br/><br/>
    Most states require registration <strong>15–30 days before election day</strong>. Some states like California allow same-day registration.`,
    UK: `<strong>How to Register in UK:</strong><br/><br/>
    🌐 Visit <a href="https://www.gov.uk/register-to-vote" target="_blank" rel="noopener">gov.uk/register-to-vote</a><br/>
    ⏱️ Takes about 5 minutes — you'll need your National Insurance number<br/><br/>
    Deadline is usually <strong>12 working days</strong> before election day. You'll receive a polling card by post confirming your registration.`,
  };
  return reg[country] || reg['India'];
}

function getTimelineSummary(country) {
  const tl = TIMELINES[country] || TIMELINES['India'];
  return tl.slice(0, 4).map(t => `📌 <strong>${t.title}</strong> — ${t.date}`).join('<br/>');
}

function getIndiaSpecificResponse(text) {
  if (text.includes('lok sabha')) {
    return `<strong>Lok Sabha Elections (India):</strong><br/><br/>
    🏛️ Lok Sabha = Lower House of Parliament<br/>
    👥 543 constituencies across India<br/>
    🗓️ Held every <strong>5 years</strong><br/>
    🗳️ Each voter votes for their local MP (Member of Parliament)<br/>
    📊 The party/alliance with majority (272+ seats) forms the government<br/>
    👑 The majority leader is invited to become <strong>Prime Minister</strong>`;
  }
  return `<strong>Indian Election System:</strong><br/><br/>
  🗳️ <strong>FPTP System</strong> — First Past the Post (most votes wins)<br/>
  🏛️ Both Lok Sabha (national) and Vidhan Sabha (state) elections<br/>
  ⚖️ Election Commission of India (ECI) is the independent body<br/>
  📱 Use the <strong>Voter Helpline 1950</strong> for any queries<br/>
  🌐 Official portal: <a href="https://eci.gov.in" target="_blank" rel="noopener">eci.gov.in</a>`;
}

function getFallbackResponse(text) {
  const fallbacks = [
    `I'm not sure I fully understood that. Could you rephrase your question?<br/><br/>
    You can ask me about:<br/>
    • "How do I register to vote?"<br/>
    • "What documents do I need?"<br/>
    • "Am I eligible to vote?"<br/>
    • "When is the registration deadline?"`,
    `Great question! Let me help. Could you be a bit more specific?<br/><br/>
    I can help with <strong>registration, eligibility, voting process, documents, timelines,</strong> and more.<br/><br/>
    Or <a href="#" onclick="navigateTo('faq')">browse our FAQ section</a> for quick answers!`,
    `I want to make sure I give you the right answer! Could you ask that in a different way?<br/><br/>
    <em>Tip: Use the Quick Questions panel on the left for common queries!</em>`,
  ];
  return fallbacks[Math.floor(Math.random() * fallbacks.length)];
}

/* ═══════════════════════════════════════════════════════════
   Personalization
   ═══════════════════════════════════════════════════════════ */
function applyPersonalization() {
  const ageEl     = document.getElementById('userAge');
  const countryEl = document.getElementById('userCountry');
  const ftEl      = document.getElementById('firstTimeVoter');

  const age     = parseInt(ageEl?.value);
  const country = countryEl?.value;
  const ft      = ftEl?.value;

  if (age && age > 0 && age < 120) { userProfile.age = age; }
  if (country) { userProfile.country = country; }
  if (ft)      { userProfile.firstTime = ft; }

  updateProfileDisplay();
  showToast('✅ Profile updated! Responses are now personalized.', 'success');

  // Send a personalized greeting
  if (userProfile.age && userProfile.country) {
    const ftMsg = userProfile.firstTime === 'yes' ? ' and a first-time voter' : '';
    const msg = `I am ${userProfile.age} years old${ftMsg} from ${userProfile.country}.`;
    chatInputEl.value = msg;
    sendMessage();
  }
}

function updateProfileDisplay() {
  // Update progress
  let progress = 0;
  const badges = [];
  if (userProfile.age >= 18)       { progress += 30; badges.push({ label:'🎂 Age Set',    style:'background:var(--gradient-a)' }); }
  if (userProfile.country)         { progress += 20; badges.push({ label:'🌍 Country Set', style:'background:var(--gradient-c)' }); }
  if (userProfile.firstTime)       { progress += 10; }
  setProgress(progress, badges);
}

/* ═══════════════════════════════════════════════════════════
   Progress update from chat interactions
   ═══════════════════════════════════════════════════════════ */
function updateProgressFromChat(text) {
  // Called each time user sends a message — encourage engagement
  window._chatInteractions = (window._chatInteractions || 0) + 1;
  if (window._chatInteractions === 3) {
    awardBadge('💬 Engaged Learner');
  }
  if (window._chatInteractions === 7) {
    awardBadge('🔥 Power User');
  }
}

/* ═══════════════════════════════════════════════════════════
   Voice Input (Web Speech API)
   ═══════════════════════════════════════════════════════════ */
function setupVoice() {
  const voiceBtn = document.getElementById('voiceBtn');
  if (!voiceBtn) return;

  // Check browser support
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    voiceBtn.title = 'Voice input not supported in this browser';
    voiceBtn.style.opacity = '0.4';
    voiceBtn.style.cursor  = 'not-allowed';
    return;
  }

  recognition = new SpeechRecognition();
  recognition.lang = 'en-US';
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    chatInputEl.value = transcript;
    isRecording = false;
    voiceBtn.classList.remove('recording');
    voiceBtn.textContent = '🎤';
    showToast('🎤 Voice captured: "' + transcript + '"', 'info');
  };

  recognition.onerror = () => {
    isRecording = false;
    voiceBtn.classList.remove('recording');
    voiceBtn.textContent = '🎤';
    showToast('Voice recognition failed. Please try again.', 'error');
  };

  recognition.onend = () => {
    isRecording = false;
    voiceBtn.classList.remove('recording');
    voiceBtn.textContent = '🎤';
  };

  voiceBtn.addEventListener('click', () => {
    if (isRecording) {
      recognition.stop();
    } else {
      recognition.start();
      isRecording = true;
      voiceBtn.classList.add('recording');
      voiceBtn.textContent = '⏹️';
      showToast('🎤 Listening… Speak now!', 'info');
    }
  });
}

/* ═══════════════════════════════════════════════════════════
   Text-to-Speech
   ═══════════════════════════════════════════════════════════ */
function speakText(text) {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text.slice(0, 300));
  utterance.rate  = 0.95;
  utterance.pitch = 1;
  utterance.lang  = 'en-US';
  const voices = window.speechSynthesis.getVoices();
  const preferred = voices.find(v => v.name.includes('Google') || v.name.includes('Natural'));
  if (preferred) utterance.voice = preferred;
  window.speechSynthesis.speak(utterance);
}

function toggleTTS() {
  ttsEnabled = !ttsEnabled;
  const btn = document.getElementById('ttsToggle');
  if (btn) {
    btn.textContent = ttsEnabled ? '🔇' : '🔊';
    btn.title = ttsEnabled ? 'Disable Text-to-Speech' : 'Enable Text-to-Speech';
  }
  showToast(ttsEnabled ? '🔊 Text-to-Speech ON' : '🔇 Text-to-Speech OFF', 'info');
  if (ttsEnabled) speakText('Text to speech is now enabled. I will read my responses aloud.');
}

/* ─── Utility ─────────────────────────────────────────── */
function stripHtml(html) {
  const div = document.createElement('div');
  div.innerHTML = html;
  return div.textContent || div.innerText || '';
}
