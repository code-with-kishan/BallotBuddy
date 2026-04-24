/* ═══════════════════════════════════════════════════════════
   data.js – All mock / static data for ElectionGuide AI
   ═══════════════════════════════════════════════════════════ */

/* ─── Election Steps ───────────────────────────────────── */
const ELECTION_STEPS = [
  {
    id: 1,
    icon: "📝",
    title: "Voter Registration",
    description: "Register your name in the electoral roll before the deadline.",
    color: "linear-gradient(135deg,#6C63FF,#4FACFE)",
    badge: "Step 1",
    badgeColor: "rgba(108,99,255,.2)",
    badgeText: "#6C63FF",
    what: [
      "Visit your local electoral office or official online portal",
      "Fill Form 6 (new voter) or Form 8 (correction / transfer)",
      "Submit within the registration deadline",
      "Track application status online using reference number",
      "Receive Voter ID card (EPIC) by post or download e-EPIC"
    ],
    docs: [
      "Proof of age (birth certificate / 10th marksheet)",
      "Proof of address (Aadhaar / utility bill / passport)",
      "Passport-size photograph (2 copies)",
      "Identity proof (Aadhaar card preferred)"
    ],
    tip: "💡 Register at least 30 days before the election deadline. Many countries allow online registration — check your country's official election commission website."
  },
  {
    id: 2,
    icon: "✅",
    title: "Verification & ID Card",
    description: "Verify your registration and collect your Voter ID card.",
    color: "linear-gradient(135deg,#43E97B,#38F9D7)",
    badge: "Step 2",
    badgeColor: "rgba(67,233,123,.2)",
    badgeText: "#43E97B",
    what: [
      "Check your name on the electoral roll (voter list)",
      "Visit your Booth Level Officer (BLO) if any issue",
      "Download your e-EPIC from official portal",
      "Verify your assigned polling booth number",
      "Update address if you have moved recently"
    ],
    docs: [
      "Acknowledgment slip from registration",
      "Original Aadhaar card for verification",
      "Any government-issued photo ID",
      "Mobile number linked to Aadhaar (for OTP)"
    ],
    tip: "💡 You can verify your voter status on the National Voter Service Portal (NVSP) or your state's election commission website."
  },
  {
    id: 3,
    icon: "📢",
    title: "Campaign Awareness",
    description: "Stay informed about candidates, parties, and their manifestos.",
    color: "linear-gradient(135deg,#F7971E,#FFD200)",
    badge: "Step 3",
    badgeColor: "rgba(247,201,72,.2)",
    badgeText: "#F7C948",
    what: [
      "Research candidates standing in your constituency",
      "Read party manifestos on official party websites",
      "Attend public rallies and town halls if possible",
      "Follow election commission's official updates",
      "Watch debates and verified news sources"
    ],
    docs: [
      "No documents required — just awareness!",
      "Note your constituency name and number",
      "Keep list of candidate names handy",
      "Save election commission helpline: 1950"
    ],
    tip: "💡 Campaign period comes with a Model Code of Conduct. Parties cannot make new announcements after the code kicks in. Vote based on facts, not misinformation."
  },
  {
    id: 4,
    icon: "🗳️",
    title: "Voting Day Process",
    description: "Know exactly what happens on election day at your polling booth.",
    color: "linear-gradient(135deg,#FF6B6B,#FE9A85)",
    badge: "Step 4",
    badgeColor: "rgba(255,107,107,.2)",
    badgeText: "#FF6B6B",
    what: [
      "Arrive at your assigned polling booth on time",
      "Join the queue and wait for your turn",
      "Show your Voter ID / approved alternate ID",
      "Get your finger inked and receive the ballot slip",
      "Go to the EVM, press the button for your candidate",
      "Collect the VVPAT slip confirmation (auto-drops)"
    ],
    docs: [
      "Voter ID card (EPIC) — primary",
      "Aadhaar card (accepted alternate ID)",
      "Passport / Driving License / PAN card",
      "Bank / Post Office passbook with photo",
      "MNREGA Job card"
    ],
    tip: "💡 Polling booths open at 7:00 AM and close at 6:00 PM (may vary). If you're in queue before closing time, you WILL be allowed to vote. Mock poll is conducted at 6:00 AM."
  },
  {
    id: 5,
    icon: "📊",
    title: "Counting & Results",
    description: "Understand how votes are counted and results are declared.",
    color: "linear-gradient(135deg,#A18CD1,#FBC2EB)",
    badge: "Step 5",
    badgeColor: "rgba(161,140,209,.2)",
    badgeText: "#A18CD1",
    what: [
      "Counting begins on the declared counting date",
      "Postal ballots are counted first",
      "EVM votes counted round by round",
      "Candidates / agents can observe the process",
      "Winning candidate receives the election certificate",
      "Results declared on Election Commission website"
    ],
    docs: [
      "No voter action needed at this stage",
      "Follow official ECI website for live results",
      "Results also broadcast on Doordarshan / news",
      "Dispute process available within 45 days"
    ],
    tip: "💡 EVM results cannot be altered — they are sealed after voting. VVPAT slips can be verified if 47% majority requests recount (Supreme Court ruling)."
  }
];

/* ─── Timeline Data ────────────────────────────────────── */
const TIMELINES = {
  India: [
    { phase:"Announcement",  title:"Election Schedule Announced",     date:"March 5, 2024",  desc:"Election Commission announces election dates and Model Code of Conduct comes into effect.",       icon:"📣", color:"#6C63FF", nodeColor:"#6C63FF" },
    { phase:"Registration",  title:"Voter Registration Deadline",     date:"March 25, 2024", desc:"Last date to register as a new voter or correct details in the electoral roll.",                  icon:"📝", color:"#4FACFE", nodeColor:"#4FACFE" },
    { phase:"Nomination",    title:"Candidate Nomination Deadline",   date:"April 2, 2024",  desc:"Candidates file nominations. Scrutiny on April 3, withdrawal deadline April 5.",                  icon:"🏅", color:"#F7C948", nodeColor:"#F7C948" },
    { phase:"Campaign",      title:"Campaign Period",                 date:"Apr 5–17, 2024", desc:"Parties and candidates campaign across constituencies. Subject to Model Code of Conduct.",        icon:"📢", color:"#FF6B6B", nodeColor:"#FF6B6B" },
    { phase:"Silent Period", title:"Campaign Silence (48 hrs)",       date:"April 17, 2024", desc:"No campaigning allowed in the 48 hours before polling starts.",                                   icon:"🤫", color:"#A18CD1", nodeColor:"#A18CD1" },
    { phase:"Voting",        title:"Election Day (Phase 1)",          date:"April 19, 2024", desc:"Polling booths open 7 AM–6 PM. Voters cast their votes using EVMs.",                             icon:"🗳️", color:"#43E97B", nodeColor:"#43E97B" },
    { phase:"Counting",      title:"Vote Counting & Results",         date:"June 4, 2024",   desc:"Postal ballots counted first, then EVM votes. Results announced live.",                          icon:"📊", color:"#38F9D7", nodeColor:"#38F9D7" },
    { phase:"Government",    title:"New Government Formed",           date:"June 9, 2024",   desc:"President invites the majority party/alliance to form the government. PM takes oath.",           icon:"🏛️", color:"#FBC2EB", nodeColor:"#FBC2EB" },
  ],
  USA: [
    { phase:"Primary",       title:"Primary Elections Begin",         date:"January 15, 2024",    desc:"State primary elections to select party candidates for the Presidential race.",               icon:"🗳️", color:"#6C63FF", nodeColor:"#6C63FF" },
    { phase:"Registration",  title:"Voter Registration Deadlines",    date:"Varies by state",     desc:"Most states require registration 15–30 days before election day. Check your state's deadline.",icon:"📝", color:"#4FACFE", nodeColor:"#4FACFE" },
    { phase:"Convention",    title:"Party Conventions",               date:"Jul–Aug 2024",        desc:"Democratic (Chicago) and Republican (Milwaukee) conventions officially nominate candidates.", icon:"📢", color:"#F7C948", nodeColor:"#F7C948" },
    { phase:"Debate",        title:"Presidential Debates",            date:"September 2024",      desc:"Nationally televised debates between major party candidates.",                                 icon:"🎙️", color:"#FF6B6B", nodeColor:"#FF6B6B" },
    { phase:"Early Voting",  title:"Early Voting Period",             date:"Oct 12–Nov 3, 2024",  desc:"Many states allow early in-person voting or mail-in ballots.",                               icon:"📬", color:"#A18CD1", nodeColor:"#A18CD1" },
    { phase:"Election Day",  title:"General Election Day",            date:"November 5, 2024",    desc:"All eligible voters cast ballots. Polls open hours vary by state.",                          icon:"🗳️", color:"#43E97B", nodeColor:"#43E97B" },
    { phase:"Certification", title:"Electoral College Vote",          date:"December 17, 2024",   desc:"Electors cast their official votes in the Electoral College.",                               icon:"📊", color:"#38F9D7", nodeColor:"#38F9D7" },
    { phase:"Inauguration",  title:"Presidential Inauguration",       date:"January 20, 2025",    desc:"The new President is sworn into office on the steps of the US Capitol.",                     icon:"🏛️", color:"#FBC2EB", nodeColor:"#FBC2EB" },
  ],
  UK: [
    { phase:"Dissolution",   title:"Parliament Dissolved",            date:"May 22, 2024",   desc:"King dissolves Parliament on PM's advice. Official election campaign begins.",                   icon:"📣", color:"#6C63FF", nodeColor:"#6C63FF" },
    { phase:"Registration",  title:"Voter Registration Deadline",     date:"June 18, 2024",  desc:"Final date to register to vote or register for a postal/proxy vote.",                           icon:"📝", color:"#4FACFE", nodeColor:"#4FACFE" },
    { phase:"Postal Votes",  title:"Postal Vote Applications",        date:"June 19, 2024",  desc:"Last day to apply for postal voting. Ballots sent to registered postal voters.",                icon:"📬", color:"#F7C948", nodeColor:"#F7C948" },
    { phase:"Campaign",      title:"Final Campaign Sprint",           date:"Jun 18–Jul 3",   desc:"Party leaders hold rallies, debates broadcast, manifestos launched.",                           icon:"📢", color:"#FF6B6B", nodeColor:"#FF6B6B" },
    { phase:"Election Day",  title:"General Election Day",            date:"July 4, 2024",   desc:"Polls open 7 AM–10 PM. Voters use first-past-the-post system in 650 constituencies.",          icon:"🗳️", color:"#43E97B", nodeColor:"#43E97B" },
    { phase:"Counting",      title:"Overnight Count & Results",       date:"July 4–5, 2024", desc:"Counting begins immediately after polls close. Results declared constituency by constituency.", icon:"📊", color:"#38F9D7", nodeColor:"#38F9D7" },
    { phase:"Government",    title:"New Government Formed",           date:"July 5, 2024",   desc:"Party leader with majority invited to Buckingham Palace to become Prime Minister.",            icon:"🏛️", color:"#FBC2EB", nodeColor:"#FBC2EB" },
  ]
};

/* ─── FAQ Data ─────────────────────────────────────────── */
const FAQS = [
  // Eligibility
  { id:1, cat:"Eligibility", q:"What is the minimum age to vote?", a:"In most democracies, the minimum voting age is <strong>18 years</strong>. In India, USA, UK, Australia, and Canada, you must be at least 18 on the cut-off date (January 1 of that year for India). Some countries like Austria allow voting from age 16." },
  { id:2, cat:"Eligibility", q:"Can Non-Resident Citizens (NRIs) vote?", a:"<strong>Yes!</strong> In India, NRIs who hold an Indian passport can vote from their overseas location. They must be enrolled in the electoral roll of their home constituency. The Representation of the People Act 1950 was amended in 2010 to allow this." },
  { id:3, cat:"Eligibility", q:"Can someone with a criminal record vote?", a:"It depends on the country. In India, a person undergoing imprisonment cannot vote, but can vote after release. In the USA, rules vary by state — some restore voting rights immediately, others require completing parole/probation." },
  { id:4, cat:"Eligibility", q:"Can I vote if I've recently moved?", a:"Yes, but you need to <strong>update your address</strong> in the electoral roll first. File Form 8A (India) for address within the same constituency, or Form 6 for a new constituency. In the UK, simply re-register online at your new address." },

  // Registration
  { id:5, cat:"Registration", q:"How do I register to vote for the first time?", a:"<strong>For India:</strong> Visit voters.eci.gov.in and fill Form 6 online. You'll need Aadhaar, age proof, and address proof. <strong>For USA:</strong> Visit vote.gov to register state-by-state. <strong>For UK:</strong> Register at gov.uk/register-to-vote. It only takes 5 minutes!" },
  { id:6, cat:"Registration", q:"What happens if I miss the registration deadline?", a:"Unfortunately, if you miss the deadline, you cannot vote in that election. However, the election commission periodically opens the roll for new registrations. In India, there are 4 qualifying dates per year (Jan 1, Apr 1, Jul 1, Oct 1) for continuous enrollment." },
  { id:7, cat:"Registration", q:"How do I check if I'm already registered?", a:"<strong>India:</strong> Visit electoralsearch.eci.gov.in or call 1950. <strong>USA:</strong> Visit vote.gov/register and check your state's lookup tool. <strong>UK:</strong> Contact your local council. You can also check on your polling card if you receive one." },
  { id:8, cat:"Registration", q:"Can I register and vote on the same day?", a:"It depends on your country/state. Some US states like California and Wisconsin allow same-day voter registration. India and UK do NOT allow same-day registration — you must be registered before the published deadline." },

  // Voting Process
  { id:9,  cat:"Voting Process", q:"What ID do I need to carry on election day?", a:"<strong>India:</strong> Voter ID (EPIC) is primary. Alternatives: Aadhaar, Passport, Driving License, PAN Card, MNREGA card, Bank/Post Office passbook with photo, Smart card from RGI, Pension document. <strong>UK:</strong> Photo ID required since 2023 (passport, driving license, or free Voter Authority Certificate)." },
  { id:10, cat:"Voting Process", q:"What if my name isn't on the voter list?", a:"Don't panic. Visit the Presiding Officer at your polling booth and ask for a Tender Vote/Provisional ballot. In India, contact the Election Commission helpline at <strong>1950</strong>. If your name was removed in error, you have the right to challenge it." },
  { id:11, cat:"Voting Process", q:"Can I vote if I'm sick or disabled?", a:"<strong>Yes!</strong> India's election commission provides special facilities including ramps, wheelchairs, and Braille ballot guides. For severe cases, you can apply for a <strong>postal ballot</strong> in advance. The UK provides similar accessibility, and the USA has absentee voting options." },
  { id:12, cat:"Voting Process", q:"How long does voting take at the booth?", a:"The entire process typically takes <strong>5–10 minutes</strong> at the booth itself. However, wait time depends on queue length. Tip: Vote early morning (7–9 AM) or late afternoon (4–6 PM) to avoid peak queues." },
  { id:13, cat:"Voting Process", q:"What is NOTA (None of the Above)?", a:"NOTA is an option on the EVM for voters who don't want to vote for any candidate. Introduced in India in 2013 following a Supreme Court ruling. Even if NOTA gets the most votes, the candidate with the next highest votes still wins. It's essentially a way to register protest." },

  // Technology
  { id:14, cat:"Technology", q:"How does an EVM (Electronic Voting Machine) work?", a:"An EVM has two units: the <strong>Control Unit</strong> (with the polling officer) and the <strong>Balloting Unit</strong> (with the voter). The officer enables one vote, the voter presses their candidate's button, a beep confirms the vote. EVMs run on one-time programmable chips and are not connected to the internet." },
  { id:15, cat:"Technology", q:"What is VVPAT and how does it work?", a:"VVPAT (Voter Verifiable Paper Audit Trail) is a printer attached to the EVM that prints a slip showing the candidate name and symbol after you vote. The slip is visible through a glass window for 7 seconds, then drops into a sealed box. It allows paper verification of electronic votes." },
  { id:16, cat:"Technology", q:"Can EVMs be hacked or tampered with?", a:"EVMs are standalone devices with <strong>no network, bluetooth, or wireless connectivity</strong>. They use one-time programmable chips that can't be reprogrammed after manufacture. They undergo rigorous mock polls before every election. Multiple court challenges in India have been dismissed after technical scrutiny." },
  { id:17, cat:"Technology", q:"Can I vote online?", a:"Currently, most countries including India and USA do NOT allow online internet voting for security reasons. <strong>Exceptions:</strong> Estonia allows internet voting since 2005. Some US states allow email/fax for overseas military voters. Postal voting (offline) is available in most democracies as an alternative." },

  // Results & After
  { id:18, cat:"Results", q:"How are votes counted after election day?", a:"In India with EVMs: Postal ballots are counted first, then EVM votes are counted round by round (one round per candidate table). Counting agents from each party observe. The candidate with the <strong>most votes (FPTP system)</strong> wins. Results are uploaded live to the ECI website." },
  { id:19, cat:"Results", q:"What happens if there's a tie?", a:"In case of a tie in results, the Returning Officer conducts a <strong>draw of lots</strong> between the tied candidates (in India). In the USA, tie-breaking methods vary by state — some use a coin flip, others a draw of cards. This is extremely rare but has happened!" },
  { id:20, cat:"Results", q:"Can election results be challenged?", a:"Yes! Any candidate or voter can file an <strong>Election Petition</strong> in the High Court within 45 days of result declaration (India). Grounds include corrupt practices, electoral malpractice, or incorrect counting. The court can order a recount or declare the election void." },
];

/* ─── FAQ Categories ───────────────────────────────────── */
const FAQ_CATEGORIES = ["All", "Eligibility", "Registration", "Voting Process", "Technology", "Results"];

/* ─── Myths vs Facts ───────────────────────────────────── */
const MYTHS = [
  {
    icon:"🔴",
    myth:"You need to carry your Voter ID card to vote — nothing else is accepted.",
    fact:"False. India accepts 12 alternate photo IDs including Aadhaar, Passport, Driving License, PAN Card, and MNREGA Job Card. The UK since 2023 accepts several approved photo IDs beyond just a driver's license.",
    category:"Documents"
  },
  {
    icon:"🔴",
    myth:"EVMs (Electronic Voting Machines) can be hacked via Bluetooth or internet.",
    fact:"EVMs are standalone, air-gapped devices with zero network connectivity. They run on one-time programmable chips manufactured before the election and are physically sealed. Numerous court challenges and technical reviews have confirmed their security.",
    category:"Technology"
  },
  {
    icon:"🔴",
    myth:"Your vote is recorded against your name — the government knows who you voted for.",
    fact:"Voting is completely anonymous and secret. The ballot paper / EVM has no connection to the voter's identity after the vote is cast. Even election officials cannot determine how someone voted. This is protected by law.",
    category:"Secrecy"
  },
  {
    icon:"🔴",
    myth:"If NOTA gets the most votes, there will be a re-election with new candidates.",
    fact:"Currently, even if NOTA receives the most votes in India, the candidate with the next highest vote total still wins. NOTA votes are counted but do not trigger a re-election. Legal battles to change this are ongoing.",
    category:"NOTA"
  },
  {
    icon:"🔴",
    myth:"You can't vote if your name has a spelling mistake in the voter list.",
    fact:"Minor spelling errors don't bar you from voting. The Presiding Officer can verify your identity through your voter slip and photo ID. You should still file for correction (Form 8) to fix it for future elections.",
    category:"Registration"
  },
  {
    icon:"🔴",
    myth:"Voting is compulsory — you'll be fined if you don't vote.",
    fact:"Voting is voluntary in most democracies including India, USA, and UK. However, some countries like Australia, Belgium, and Brazil DO have compulsory voting laws with fines for non-compliance. In India, there is no penalty for not voting.",
    category:"Participation"
  },
  {
    icon:"🔴",
    myth:"Once you press the EVM button, you can cancel and change your vote.",
    fact:"No — your vote is final the moment you press the button. The EVM records one vote per ballot authorization. The ballot slip returned by the VVPAT is also final. Think carefully before pressing!",
    category:"Voting Process"
  },
  {
    icon:"🔴",
    myth:"Candidates can pay voters with cash and gifts on election day without consequences.",
    fact:"Vote buying is a serious criminal offence under the Representation of the People Act. Penalties include up to 1 year imprisonment and disqualification. The Model Code of Conduct activates flying squads. You can report on the cVIGIL app anonymously.",
    category:"Ethics"
  },
  {
    icon:"🔴",
    myth:"NRIs (Non-Resident Indians) living abroad have no right to vote in Indian elections.",
    fact:"NRIs holding valid Indian passports have the right to vote in the constituency where they are enrolled. However, they must be physically present in India on election day (no proxy/postal voting for NRIs currently, though proposed reforms are under consideration).",
    category:"NRI Voting"
  },
  {
    icon:"🔴",
    myth:"The Election Commission is under the central government and can be influenced.",
    fact:"The Election Commission of India is a constitutional body operating under Article 324. Chief Election Commissioner has security of tenure equivalent to a Supreme Court judge and can only be removed by Parliament through a special process — not by the government.",
    category:"Independence"
  },
  {
    icon:"🔴",
    myth:"Postal ballots are always lost or not counted properly.",
    fact:"Postal ballots are a legally mandated alternative for voters such as army personnel and election officials on duty. They are counted first on counting day, before EVM results. Each ballot is tracked and counted under the observation of candidate agents.",
    category:"Postal Voting"
  },
  {
    icon:"🔴",
    myth:"Young people's votes don't matter — only older voters decide elections.",
    fact:"Youth voters (18–35) are one of the largest demographic blocs in most countries. In India, 18–39 year olds make up over 40% of the electorate. Many elections have been decided by margins smaller than the number of abstaining youth voters in a constituency.",
    category:"Youth Voting"
  }
];

/* ─── Polling Stations (Mock Data) ─────────────────────── */
const POLLING_STATIONS = [
  { name:"Government High School, Sector 12",    addr:"Plot 45, Sector 12, New Delhi – 110001",   dist:"0.4 km", tags:["Wheelchair Access","Ramp","Braille EVM"],   lat:28.6315, lng:77.2167 },
  { name:"Community Hall, Lajpat Nagar",         addr:"H-Block, Lajpat Nagar II, New Delhi – 110024", dist:"0.9 km", tags:["Air Conditioned","Parking","First Aid"], lat:28.5706, lng:77.2370 },
  { name:"Municipal Primary School, Karol Bagh", addr:"Near Metro Exit 5, Karol Bagh, Delhi – 110005", dist:"1.2 km", tags:["EVM+VVPAT","Queue Manager"],          lat:28.6514, lng:77.1900 },
  { name:"Town Hall Civic Centre, Connaught Pl", addr:"Connaught Place Inner Circle, New Delhi – 110001", dist:"1.7 km", tags:["Large Venue","Multiple Booths","Medical"],lat:28.6315, lng:77.2167 },
  { name:"St. Mary's School, Vasant Kunj",       addr:"Vasant Kunj Sector C, New Delhi – 110070",  dist:"2.1 km", tags:["Ramp","Drinking Water","Shade"],         lat:28.5270, lng:77.1570 },
  { name:"Ramlila Maidan Booth Zone 3",          addr:"Near ITO, Delhi – 110002",                  dist:"2.4 km", tags:["Open Area","High Capacity","CCTV"],       lat:28.6431, lng:77.2392 },
];

/* ─── AI Knowledgebase (Rule-based responses) ──────────── */
const AI_KB = {
  // Greetings
  greet: ["hello","hi","hey","namaste","good morning","good evening","good afternoon","start","help"],
  // Age-related
  age_eligible: ["eligible","eligib","can i vote","am i old enough","voting age","18","age to vote"],
  age_minor: ["16","17","15","14","13","12","minor","too young"],
  // Registration
  register: ["register","registration","enroll","sign up","form 6","form6","nvsp","voter list"],
  // Documents
  documents: ["document","id","identity","proof","what do i need","voter id","epic","aadhar","aadhaar","passport","driving license","pan card"],
  // Voting process
  howto_vote: ["how to vote","how do i vote","voting process","polling booth","election day","what to do","steps to vote"],
  // EVM
  evm: ["evm","voting machine","electronic","machine","button","nota","vvpat"],
  // Eligibility - country specific
  india: ["india","indian","delhi","mumbai","bangalore","chennai","kolkata","eci","nia","lok sabha","assembly"],
  usa: ["usa","united states","america","american","electoral college","senate","house"],
  uk: ["uk","united kingdom","british","england","scotland","wales","parliament","westminster"],
  // First-time voter
  firsttime: ["first time","first-time","new voter","never voted","beginner","new to voting"],
  // Timeline
  timeline: ["when","date","deadline","schedule","next election","when is","timeline","registration deadline"],
  // Results
  results: ["count","counting","result","declare","winner","mandate","majority","fptp"],
  // Myths
  myths: ["hack","tamper","safe","secret","anonymous","rig","rigged","fraud","corrupt"],
  // Maps
  map: ["polling station","booth","where","location","nearest","find booth","where to vote","polling place"],
  // Postal / NRI
  nri: ["nri","overseas","abroad","outside india","foreign","postal","postal vote","absentee"],
  // NOTA
  nota: ["nota","none of the above","protest vote","no candidate"],
};
