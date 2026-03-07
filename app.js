// ─────────────────────────────────────────────
//  Critter Quest — App Logic
// ─────────────────────────────────────────────

// ── Theme definitions ─────────────────────────
const THEMES = {
  forest: { name: 'Forest', icon: '🌲', bg: 'linear-gradient(160deg, #FFF3E0 0%, #E8F5E9 100%)' },
  ocean:  { name: 'Ocean',  icon: '🌊', bg: 'linear-gradient(160deg, #E0F2FE 0%, #ECFEFF 100%)' },
  farm:   { name: 'Farm',   icon: '🌾', bg: 'linear-gradient(160deg, #FFFBEB 0%, #FEF9C3 100%)' },
  jungle: { name: 'Jungle', icon: '🌴', bg: 'linear-gradient(160deg, #ECFDF5 0%, #D1FAE5 100%)' },
  arctic: { name: 'Arctic', icon: '❄️', bg: 'linear-gradient(160deg, #EFF6FF 0%, #DBEAFE 100%)' },
};

// ── Grade configs ─────────────────────────────
const GRADE_CONFIGS = {
  kindergarten: {
    availableOps: ['addition', 'subtraction', 'mixed'],
    generate: {
      addition()    { const a = rand(1,9), b = rand(1,10-a);          return { a, b, answer: a+b }; },
      subtraction() { const a = rand(2,10), b = rand(1,a);            return { a, b, answer: a-b }; },
    },
  },
  grade3: {
    availableOps: ['addition', 'subtraction', 'multiplication', 'division', 'mixed'],
    generate: {
      addition()       { const a = rand(10,500), b = rand(10,499);    return { a, b, answer: a+b }; },
      subtraction()    { let a, b; do { a = rand(20,999); b = rand(1,a); } while (requiresRegrouping(a,b)); return { a, b, answer: a-b }; },
      multiplication() { const a = rand(1,12),   b = rand(1,12);      return { a, b, answer: a*b }; },
      division()       { const d=rand(1,10), q=rand(1,12);            return { a:d*q, b:d, answer:q }; },
    },
  },
};

const OPS = {
  addition:       { symbol: '+', accent: '#22C55E', accentLight: '#DCFCE7' },
  subtraction:    { symbol: '−', accent: '#3B82F6', accentLight: '#DBEAFE' },
  multiplication: { symbol: '×', accent: '#F97316', accentLight: '#FFEDD5' },
  division:       { symbol: '÷', accent: '#A855F7', accentLight: '#F3E8FF' },
  mixed:          { symbol: '?', accent: '#EC4899', accentLight: '#FCE7F3' },
  // Reading categories
  'sight-words':   { symbol: '📖', accent: '#8B5CF6', accentLight: '#EDE9FE' },
  'letter-sounds': { symbol: '🔤', accent: '#0EA5E9', accentLight: '#E0F2FE' },
  'word-building': { symbol: '🔨', accent: '#F97316', accentLight: '#FFEDD5' },
  'vocabulary':    { symbol: '📚', accent: '#10B981', accentLight: '#D1FAE5' },
  'spelling':      { symbol: '✏️', accent: '#06B6D4', accentLight: '#CFFAFE' },
  'grammar':       { symbol: '📝', accent: '#F59E0B', accentLight: '#FEF3C7' },
  'read-mixed':    { symbol: '🎲', accent: '#EC4899', accentLight: '#FCE7F3' },
};

const CORRECT_MSGS = [
  '🎉 You got it!', '⭐ Awesome!',    '🌟 Nailed it!',
  '🎊 Way to go!',  '✅ Correct!',   '🔥 Nice work!',
  '💪 You rock!',   '🏆 Brilliant!', '🌈 Fantastic!',
  '🐾 Amazing!',    '👏 Woohoo!',    '🥳 Super star!',
];

// ── Math game state ───────────────────────────
const G = {
  op: 'addition', problem: null, answered: false,
  streak: 0, correct: 0, total: 0,
  sessionQ: 0, sessionCorrect: 0, sessionCoins: 0,
  lastOp: 'addition',
  steps: [],          // step definitions for current problem
  currentStep: 0,     // index of active step
  stepAttempts: 0,    // wrong guesses on current intermediate step
  missedProblems: [], // problems answered wrong this session (final step)
};

// ── Helpers ───────────────────────────────────
function rand(min, max) { return Math.floor(Math.random() * (max-min+1)) + min; }
function pickRandom(arr) { return arr[rand(0, arr.length-1)]; }
function fmt(date) { return new Date(date).toLocaleDateString(undefined, { month:'short', day:'numeric', year:'numeric' }); }
function fmtTime(date) { return new Date(date).toLocaleTimeString(undefined, { hour:'2-digit', minute:'2-digit' }); }
function requiresRegrouping(a, b) {
  return (a % 10) < (b % 10)
      || Math.floor((a % 100) / 10) < Math.floor((b % 100) / 10)
      || Math.floor(a / 100) < Math.floor(b / 100);
}

// ── Apply theme visuals ───────────────────────
function applyTheme(themeKey, opKey) {
  const theme = THEMES[themeKey] || THEMES.forest;
  const op    = OPS[opKey] || OPS.addition;
  document.body.style.background = theme.bg;
  document.documentElement.style.setProperty('--accent',       op.accent);
  document.documentElement.style.setProperty('--accent-light', op.accentLight);
}

// ── Router ────────────────────────────────────
const NO_HEADER_SCREENS = ['profiles', 'profile-form'];

function nav(screenId, data = {}) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  const el = document.getElementById('screen-' + screenId);
  if (!el) return;
  el.classList.add('active');
  el.scrollTop = 0;
  window.scrollTo(0, 0);

  const showHeader = !NO_HEADER_SCREENS.includes(screenId);
  document.getElementById('app-header').style.display = showHeader ? 'flex' : 'none';
  if (showHeader) renderHeader();

  // Apply theme from active profile
  const p = getActiveProfile();
  if (p) applyTheme(p.theme, G.op);

  switch (screenId) {
    case 'profiles':     renderProfiles(); break;
    case 'profile-form': renderProfileForm(data); break;
    case 'dashboard':    renderDashboard(); break;
    case 'quest-select': renderQuestSelect(); break;
    case 'quest-game':   initQuestGame(data); break;
    case 'quest-done':   renderQuestDone(data); break;
    case 'read-game':    initReadGame(data); break;
    case 'inventory':    renderInventory(); break;
    case 'bank':         renderBank(); break;
    case 'store':        renderStore(); break;
    case 'store-admin':  renderStoreAdmin(data); break;
    case 'themes':       renderThemes(); break;
    case 'journey':      renderJourney(); break;
  }
}

// ── Header ────────────────────────────────────
function renderHeader() {
  const p = getActiveProfile();
  if (!p) return;
  const nameBtn  = document.getElementById('hdr-name');
  const coinsBtn = document.getElementById('hdr-coins');
  const flairEl  = document.getElementById('hdr-flair');

  nameBtn.textContent  = `${THEMES[p.theme].icon} ${p.name}`;
  coinsBtn.textContent = `🪙 ${p.coins}`;

  flairEl.innerHTML = p.flair.map((cid, i) => {
    const card = cid ? p.inventory.find(c => c.id === cid) : null;
    const cls  = card ? 'flair-slot filled' : 'flair-slot';
    return `<button class="${cls}" data-slot="${i}" onclick="nav('inventory')">${card ? card.emoji : '+'}</button>`;
  }).join('');
}

// Header events (static elements, wired once)
document.getElementById('hdr-name').addEventListener('click', showThemeModal);
document.getElementById('hdr-dashboard').addEventListener('click', () => nav('dashboard'));
document.getElementById('hdr-coins').addEventListener('click', () => nav('bank'));

// ── Profiles screen ───────────────────────────
function renderProfiles() {
  const profiles = getProfiles();
  document.getElementById('screen-profiles').innerHTML = `
    <div class="profiles-page">
      <div class="logo-big">🐾 Critter Quest</div>
      <p class="page-subtitle">Who's ready to learn today?</p>
      <div class="profile-grid">
        ${profiles.map(p => `
          <div class="profile-card" onclick="selectProfile('${p.id}')">
            <button class="pc-edit-btn" onclick="event.stopPropagation(); nav('profile-form', {editId:'${p.id}'})">✏️</button>
            <div class="pc-critter">${p.themeCreatures[p.theme] || '🐾'}</div>
            <div class="pc-name">${esc(p.name)}</div>
            <div class="pc-grade">${p.grade === 'grade3' ? '3rd Grade 🚀' : 'Kindergarten ⭐'}</div>
            <div class="pc-theme">${THEMES[p.theme].icon} ${THEMES[p.theme].name}</div>
          </div>
        `).join('')}
        <button class="profile-card add-profile" onclick="nav('profile-form',{})">
          <div class="pc-critter">➕</div>
          <div class="pc-name">Add Profile</div>
        </button>
      </div>
    </div>`;
}

function selectProfile(id) {
  setActiveProfile(id);
  const p = getProfile(id);
  G.op = 'addition';
  applyTheme(p.theme, 'addition');
  nav('dashboard');
}

// ── Profile form screen ───────────────────────
let _pfGrade = 'kindergarten';
let _pfTheme = 'forest';

function renderProfileForm(data) {
  const editing = data.editId ? getProfile(data.editId) : null;
  _pfGrade = editing ? editing.grade : 'kindergarten';
  _pfTheme = editing ? editing.theme : 'forest';

  document.getElementById('screen-profile-form').innerHTML = `
    <div class="page-wrap">
      <button class="back-btn" onclick="nav('profiles')">← Back</button>
      <h2 class="page-title">${editing ? 'Edit Profile' : '✨ New Profile'}</h2>
      <div class="form-group">
        <label>Name</label>
        <input type="text" id="pf-name" class="form-input" placeholder="What's your name?"
          value="${editing ? esc(editing.name) : ''}" maxlength="20" autocomplete="off" />
      </div>
      <div class="form-group">
        <label>Grade</label>
        <div class="grade-btns">
          <button class="grade-btn ${_pfGrade==='kindergarten'?'active':''}" id="pf-g-k" onclick="pfGrade('kindergarten')">
            <span class="grade-emoji">⭐</span>
            <span class="grade-name">Kindergarten</span>
            <span class="grade-sub">Add &amp; Subtract within 10</span>
          </button>
          <button class="grade-btn ${_pfGrade==='grade3'?'active':''}" id="pf-g-3" onclick="pfGrade('grade3')">
            <span class="grade-emoji">🚀</span>
            <span class="grade-name">3rd Grade</span>
            <span class="grade-sub">All operations &amp; bigger numbers</span>
          </button>
        </div>
      </div>
      <div class="form-group">
        <label>Theme</label>
        <div class="theme-btns">
          ${Object.entries(THEMES).map(([k,t]) => `
            <button class="theme-btn ${_pfTheme===k?'active':''}" id="pf-t-${k}" onclick="pfTheme('${k}')">
              <span class="theme-icon">${t.icon}</span>
              <span class="theme-name">${t.name}</span>
            </button>
          `).join('')}
        </div>
      </div>
      ${editing ? `<button class="danger-btn" onclick="confirmDeleteProfile('${editing.id}')">🗑️ Delete Profile</button>` : ''}
      <button class="primary-btn big" onclick="saveProfile('${editing ? editing.id : ''}')">
        ${editing ? 'Save Changes ✓' : 'Create Profile! 🎉'}
      </button>
    </div>`;

  document.getElementById('pf-name').focus();
}

function pfGrade(g) {
  _pfGrade = g;
  document.querySelectorAll('#screen-profile-form .grade-btn').forEach(b =>
    b.classList.toggle('active', b.id === 'pf-g-' + (g === 'grade3' ? '3' : 'k')));
}
function pfTheme(t) {
  _pfTheme = t;
  document.querySelectorAll('#screen-profile-form .theme-btn').forEach(b =>
    b.classList.toggle('active', b.id === 'pf-t-' + t));
}
async function saveProfile(editId) {
  const name = (document.getElementById('pf-name').value || '').trim();
  if (!name) { document.getElementById('pf-name').focus(); return; }
  if (editId) {
    await updateProfile(editId, { name, grade: _pfGrade, theme: _pfTheme });
    setActiveProfile(editId);
  } else {
    const p = await createProfile(name, _pfGrade, _pfTheme);
    setActiveProfile(p.id);
  }
  const p = getActiveProfile();
  applyTheme(p.theme, 'addition');
  nav('dashboard');
}
function confirmDeleteProfile(id) {
  showModal(`<div class="modal-title">Delete Profile?</div>
    <div class="modal-text">All progress, coins, and cards will be lost. This cannot be undone.</div>
    <div class="modal-btns">
      <button class="danger-btn" onclick="doDeleteProfile('${id}')">Yes, Delete</button>
      <button class="primary-btn" onclick="closeModal()">Cancel</button>
    </div>`);
}
async function doDeleteProfile(id) {
  await deleteProfile(id); closeModal(); nav('profiles');
}

// ── Dashboard screen ──────────────────────────
function renderDashboard() {
  const p = getActiveProfile();
  if (!p) { nav('profiles'); return; }
  const storeCount = getStore().length;

  document.getElementById('screen-dashboard').innerHTML = `
    <div class="page-wrap">
      <div class="dash-welcome">
        <button class="dash-mascot" onclick="showMascotModal()" title="Change your mascot">
          ${p.themeCreatures[p.theme]}
          <span class="dash-mascot-hint">✏️</span>
        </button>
        <div class="dash-welcome-text">
          <h1>Hi, ${esc(p.name)}! 👋 <button class="name-edit-btn" onclick="showRenameModal()" title="Edit name">✏️</button></h1>
          <p>${p.stats.sessionsCompleted} quests · ${p.stats.totalCorrect} correct · Best streak ${p.stats.bestStreak}</p>
        </div>
      </div>
      <div class="dash-grid">
        <button class="dash-card accent wide" onclick="nav('quest-select')">
          <div class="dc-icon">⚔️</div>
          <div class="dc-label">Quests</div>
          <div class="dc-sub">Start learning — 10 questions per quest!</div>
        </button>
        <button class="dash-card" onclick="nav('inventory')">
          <div class="dc-icon">🎒</div>
          <div class="dc-label">Inventory</div>
          <div class="dc-sub">${p.inventory.length} card${p.inventory.length !== 1 ? 's' : ''}</div>
        </button>
        <button class="dash-card" onclick="nav('bank')">
          <div class="dc-icon">🪙</div>
          <div class="dc-label">Coins</div>
          <div class="dc-sub">${p.coins} available</div>
        </button>
        <button class="dash-card" onclick="nav('store')">
          <div class="dc-icon">🏪</div>
          <div class="dc-label">Store</div>
          <div class="dc-sub">${storeCount} reward${storeCount !== 1 ? 's' : ''}</div>
        </button>
        <button class="dash-card" onclick="nav('themes')">
          <div class="dc-icon">${THEMES[p.theme].icon}</div>
          <div class="dc-label">Themes</div>
          <div class="dc-sub">${THEMES[p.theme].name} — ${p.themeCreatures[p.theme]}</div>
        </button>
        <button class="dash-card" onclick="nav('journey')">
          ${(() => {
            const j = (p.journeys && p.journeys[p.theme]) || { chapter: 1, stopsCompleted: 0 };
            return `<div class="dc-icon">🗺️</div>
            <div class="dc-label">Journey</div>
            <div class="dc-sub">Chapter ${j.chapter} · Stop ${j.stopsCompleted}/10</div>`;
          })()}
        </button>
      </div>
      <button class="text-btn" onclick="nav('profiles')">👥 Switch Profile</button>
    </div>`;
}

// ── Quest select screen ───────────────────────
function renderQuestSelect() {
  document.getElementById('screen-quest-select').innerHTML = `
    <div class="page-wrap">
      <button class="back-btn" onclick="nav('dashboard')">← Dashboard</button>
      <h2 class="page-title">Choose Your Quest</h2>
      <div class="subject-grid">
        <button class="subject-card" onclick="nav('quest-game',{})">
          <div class="sc-icon sc-icon-grid">
            <span>➕</span><span>➖</span>
            <span>✖️</span><span>➗</span>
          </div>
          <div class="sc-label">Math</div>
          <div class="sc-sub">Addition, Subtraction &amp; more</div>
        </button>
        <button class="subject-card" onclick="nav('read-game',{})">
          <div class="sc-icon">📖</div>
          <div class="sc-label">Reading</div>
          <div class="sc-sub">Sight Words, Phonics &amp; more</div>
        </button>
        <div class="subject-card coming-soon">
          <div class="sc-icon">🔬</div>
          <div class="sc-label">Science</div>
          <div class="sc-sub">Coming Soon!</div>
        </div>
      </div>
    </div>`;
}

// ── Quest game screen ─────────────────────────
function initQuestGame(data) {
  const p = getActiveProfile();
  if (!p) { nav('profiles'); return; }
  if (data.resumeOp) G.op = data.resumeOp;

  // Daily op limit: 2 sessions/op for grade3, 3 for kindergarten (only 2 ops available)
  const _limit  = p.grade === 'kindergarten' ? 3 : 2;
  const _daily  = getDailyOpCounts(p.id);
  const _avail  = GRADE_CONFIGS[p.grade].availableOps;
  if ((_daily[G.op] || 0) >= _limit) {
    const nextOp = _avail.find(op => (_daily[op] || 0) < _limit);
    if (!nextOp) {
      showModal(`<div class="modal-title">All Done for Today! 🌟</div>
        <div class="modal-text">Amazing work — you've finished all your quests for today. Come back tomorrow for more coins and cards!</div>
        <div class="modal-btns"><button class="primary-btn" onclick="closeModal(); nav('dashboard')">OK!</button></div>`);
      return;
    }
    G.op = nextOp;
  }

  // Reset session counters
  G.sessionQ = 0; G.sessionCorrect = 0; G.sessionCoins = 0;
  G.streak = 0; G.correct = 0; G.total = 0; G.answered = false;
  G.missedProblems = [];

  renderQuestGame();
  newProblem();
}

function renderQuestGame() {
  const p = getActiveProfile();
  const grade = p.grade;
  const available = GRADE_CONFIGS[grade].availableOps;
  if (!available.includes(G.op)) G.op = 'addition';

  document.getElementById('screen-quest-game').innerHTML = `
    <div class="quest-game-page">
      <div class="quest-top-bar">
        <button class="back-btn" onclick="nav('quest-select')">← Quests</button>
        <span class="quest-coin-hint">2 🪙 per correct answer</span>
      </div>

      <!-- Session progress -->
      <div class="session-bar">
        <span class="session-label" id="sess-label">Question 1 / 10</span>
        <div class="session-progress"><div class="session-progress-fill" id="sess-fill" style="width:0%"></div></div>
        <span class="session-coins" id="sess-coins">🪙 0</span>
      </div>

      <!-- Operation tabs -->
      <div class="op-tabs" role="group">
        ${(() => {
          const daily = getDailyOpCounts(p.id);
          const limit = grade === 'kindergarten' ? 3 : 2;
          return available.map(op => {
            const maxed = (daily[op] || 0) >= limit;
            const label = op==='addition'?'➕ Add':op==='subtraction'?'➖ Sub':op==='multiplication'?'✖️ Mult':op==='division'?'➗ Div':'🎲 Mix';
            return `<button class="op-tab ${G.op===op?'active':''} ${maxed?'op-tab-maxed':''}" data-op="${op}"
              ${maxed ? 'disabled title="Done for today!"' : `onclick="selectOp('${op}')"`}>
              ${label}${maxed ? '<span class="op-done-badge">✓ done</span>' : ''}
            </button>`;
          }).join('');
        })()}
      </div>

      <!-- Streak banner -->
      <div class="streak-banner" id="streak-banner">🔥 <span id="streak-count">3</span> in a row!</div>

      <!-- Problem card -->
      <div class="card">
        <div class="critter-wrap">
          <div class="critter" id="critter">${p.themeCreatures[p.theme]}</div>
        </div>
        <div class="problem-display">
          <span class="num" id="num-a">?</span>
          <span class="op-sym" id="op-symbol">+</span>
          <span class="num" id="num-b">?</span>
          <span class="equals">=</span>
          <span class="question-mark">?</span>
        </div>
        <div id="step-scaffold"></div>
        <div class="feedback" id="feedback"></div>
        <button class="next-btn" id="next-btn" onclick="nextProblem()">Next →</button>
        <button class="help-btn" onclick="showHelpModal()">💡 How do I solve this?</button>
      </div>

      <!-- Score row -->
      <div class="score-display">
        <span>✅ <span class="score-num" id="score-correct">0</span></span>
        <span style="color:#CBD5E1">/</span>
        <span><span class="score-num" id="score-total">0</span> answered</span>
      </div>
    </div>`;

}

// ── Game logic ────────────────────────────────
function resolvedOp() {
  if (G.op !== 'mixed') return G.op;
  const p = getActiveProfile();
  const choices = GRADE_CONFIGS[p.grade].availableOps.filter(o => o !== 'mixed');
  return choices[rand(0, choices.length-1)];
}

function newProblem() {
  const p     = getActiveProfile();
  const opKey = resolvedOp();
  const opCfg = OPS[opKey];
  const gen   = GRADE_CONFIGS[p.grade].generate;
  const { a, b, answer } = (gen[opKey] || gen.addition)();

  G.problem      = { a, b, answer, opKey };
  G.answered     = false;
  G.steps        = buildSteps(p.grade, opKey, a, b, answer);
  G.currentStep  = 0;
  G.stepAttempts = 0;

  const critterEl = document.getElementById('critter');
  if (critterEl) critterEl.textContent = p.themeCreatures[p.theme];

  document.getElementById('num-a').textContent     = a;
  document.getElementById('op-symbol').textContent = opCfg.symbol;
  document.getElementById('num-b').textContent     = b;

  document.getElementById('feedback').textContent = '';
  document.getElementById('feedback').className   = 'feedback';
  document.getElementById('next-btn').style.display = 'none';
  document.getElementById('next-btn').textContent  = 'Next →';
  document.getElementById('next-btn').onclick      = nextProblem;

  applyTheme(p.theme, G.op);
  renderSteps();
}

// ── Step scaffold rendering ────────────────────
function buildSteps(grade, opKey, a, b, answer) {
  if (grade === 'kindergarten') return buildKinderSteps(opKey, a, b, answer);
  return buildGrade3Steps(opKey, a, b, answer);
}

function buildKinderSteps(opKey, a, b, answer) {
  if (opKey === 'addition' || opKey === 'mixed') {
    const big = Math.max(a, b), small = Math.min(a, b);
    const shown = Array.from({ length: small - 1 }, (_, i) => big + i + 1);
    const seq   = shown.length ? shown.join(' → ') + ' → ___' : '___';
    return [{ label: `Start at ${big}. Count on ${small} more: ${seq}`, answer, isFinal: true,
      hint: `Hold up ${small} finger${small > 1 ? 's' : ''}. Start at ${big} and tap each finger as you count up!` }];
  }
  if (opKey === 'subtraction') {
    const shown = Array.from({ length: b - 1 }, (_, i) => a - i - 1);
    const seq   = shown.length ? shown.join(' → ') + ' → ___' : '___';
    return [{ label: `Start at ${a}. Count back ${b}: ${seq}`, answer, isFinal: true,
      hint: `Hold up ${b} finger${b > 1 ? 's' : ''}. Start at ${a} and put one finger down each time you count back!` }];
  }
  return [{ label: `${a} ${OPS[opKey].symbol} ${b} = ___`, answer, isFinal: true,
    hint: `Try counting on your fingers!` }];
}

function buildGrade3Steps(opKey, a, b, answer) {
  if (opKey === 'addition') {
    const aH = Math.floor(a / 100) * 100, bH = Math.floor(b / 100) * 100;
    const aT = Math.floor((a % 100) / 10) * 10, bT = Math.floor((b % 100) / 10) * 10;
    const aO = a % 10, bO = b % 10;
    const sumH = aH + bH, sumT = aT + bT, sumO = aO + bO;
    const steps = [], parts = [];
    if (aH + bH > 0) {
      steps.push({ label: `Add the hundreds: ${aH} + ${bH} = ___`, answer: sumH,
        hint: `Think: ${aH/100} + ${bH/100} = ?, then put two zeros at the end.` });
      parts.push(sumH);
    }
    steps.push({ label: `Add the tens: ${aT} + ${bT} = ___`, answer: sumT,
      hint: `Think: ${aT/10} + ${bT/10} = ?, then put a zero at the end.` });
    parts.push(sumT);
    steps.push({ label: `Add the ones: ${aO} + ${bO} = ___`, answer: sumO,
      hint: `Start at ${aO} and count up ${bO} more on your fingers.` });
    parts.push(sumO);
    steps.push({ label: `Add the parts: ${parts.join(' + ')} = ___`, answer, isFinal: true,
      hint: `Start with the biggest number (${Math.max(...parts)}) and add the rest one at a time.` });
    return steps;
  }
  if (opKey === 'subtraction') {
    const aH = Math.floor(a / 100) * 100, bH = Math.floor(b / 100) * 100;
    const aT = Math.floor((a % 100) / 10) * 10, bT = Math.floor((b % 100) / 10) * 10;
    const aO = a % 10, bO = b % 10;
    const diffO = aO - bO, diffT = aT - bT, diffH = aH - bH;
    const steps = [], parts = [];
    steps.push({ label: `Subtract the ones: ${aO} − ${bO} = ___`, answer: diffO,
      hint: `Start at ${aO} and count back ${bO} steps.` });
    parts.push(diffO);
    steps.push({ label: `Subtract the tens: ${aT} − ${bT} = ___`, answer: diffT,
      hint: `Think: ${aT/10} − ${bT/10} = ?, then put a zero at the end.` });
    parts.push(diffT);
    if (aH + bH > 0) {
      steps.push({ label: `Subtract the hundreds: ${aH} − ${bH} = ___`, answer: diffH,
        hint: `Think: ${aH/100} − ${bH/100} = ?, then put two zeros at the end.` });
      parts.push(diffH);
    }
    const nonZero = parts.filter(v => v > 0);
    steps.push({ label: `Put it together: ${nonZero.join(' + ')} = ___`, answer, isFinal: true,
      hint: `Add the numbers you found: ${nonZero.join(' + ')}. Start with the biggest!` });
    return steps;
  }
  if (opKey === 'multiplication') {
    const [big, small] = a >= b ? [a, b] : [b, a];
    if (small <= 9) {
      const seq = Array.from({ length: big - 1 }, (_, i) => (i + 1) * small);
      const txt = seq.length ? seq.join(', ') + ', ___' : '___';
      return [{ label: `Count by ${small}s, ${big} times: ${txt}`, answer, isFinal: true,
        hint: `Use your fingers! Count: ${Array.from({length: big}, (_, i) => (i+1)*small).join(', ')}` }];
    }
    // One factor is 10, 11, or 12 — break apart
    const smallT = Math.floor(small / 10) * 10, smallO = small % 10;
    const part1 = big * smallT, part2 = big * smallO;
    if (smallO === 0) {
      return [{ label: `${big} × ${small} = ___`, answer, isFinal: true,
        hint: `${big} × ${smallT/10} = ?, then add a zero.` }];
    }
    return [
      { label: `${big} × ${smallT} = ___`, answer: part1,
        hint: `${big} × ${smallT/10} = ?, then add a zero. (${smallT} = ${smallT/10} tens)` },
      { label: `${big} × ${smallO} = ___`, answer: part2,
        hint: `Think of your ${big}s times table: ${big} × ${smallO} = ?` },
      { label: `${part1} + ${part2} = ___`, answer, isFinal: true,
        hint: `You found ${part1} and ${part2}. Now add them together!` },
    ];
  }
  if (opKey === 'division') {
    const counts = Array.from({ length: Math.min(answer, 5) }, (_, i) => `${i+1}×${b}=${(i+1)*b}`).join(', ');
    return [{ label: `___ × ${b} = ${a}`, answer, isFinal: true,
      hint: `Count by ${b}s: ${counts}… keep going until you reach ${a}!` }];
  }
  return [{ label: `${a} ${OPS[opKey].symbol} ${b} = ___`, answer, isFinal: true,
    hint: `Check your work and try again.` }];
}

function renderSteps() {
  const scaffold = document.getElementById('step-scaffold');
  if (!scaffold) return;
  const { steps, currentStep, answered } = G;

  scaffold.innerHTML = steps.map((step, i) => {
    if (i < currentStep || (answered && i === currentStep)) {
      // Completed
      const filled = step.label.replace('___', `<strong>${step.answer}</strong>`);
      return `<div class="step-row completed">
        <span class="step-label">${filled}</span>
        <span class="step-check-icon">✓</span>
      </div>`;
    } else if (i === currentStep && !answered) {
      // Active
      const prompt = step.label.replace('___', '<span class="step-blank">___</span>');
      return `<div class="step-row active">
        <div class="step-prompt">${prompt}</div>
        <div class="step-input-row">
          <input type="number" id="step-input" class="step-input"
            placeholder="?" inputmode="numeric" autocomplete="off" />
          <button class="step-check-btn" onclick="checkStep()">✓</button>
        </div>
        <div class="step-feedback" id="step-feedback"></div>
      </div>`;
    } else {
      // Locked future step
      const preview = step.label.replace('___', '?');
      return `<div class="step-row locked">
        <span class="step-label">${preview}</span>
      </div>`;
    }
  }).join('');

  const inp = document.getElementById('step-input');
  if (inp) {
    inp.focus();
    inp.addEventListener('keydown', e => { if (e.key === 'Enter') checkStep(); });
  }
}

async function checkStep() {
  if (G.answered) return;
  const inp = document.getElementById('step-input');
  if (!inp) return;
  const raw = (inp.value || '').trim();
  if (!raw) { inp.focus(); return; }
  const userAnswer = parseInt(raw, 10);
  if (isNaN(userAnswer)) { inp.focus(); return; }

  const step = G.steps[G.currentStep];
  const ok   = userAnswer === step.answer;

  if (!ok && !step.isFinal) {
    // Wrong intermediate step — escalate through 3 levels, no score penalty
    G.stepAttempts++;

    if (G.stepAttempts >= 3) {
      // Level 3: auto-fill the answer and advance after a short pause
      inp.disabled = true;
      inp.value    = step.answer;
      inp.classList.add('step-reveal');
      const btn = document.querySelector('.step-check-btn');
      if (btn) btn.disabled = true;
      const fb = document.getElementById('step-feedback');
      if (fb) { fb.textContent = `That one was tricky — it was ${step.answer}. Moving on!`; fb.className = 'step-feedback hint'; }
      setTimeout(() => {
        G.stepAttempts = 0;
        G.currentStep++;
        renderSteps();
      }, 1400);
      return;
    }

    inp.classList.add('step-wrong');
    setTimeout(() => inp && inp.classList.remove('step-wrong'), 500);
    const fb = document.getElementById('step-feedback');
    if (fb) {
      if (G.stepAttempts >= 2 && step.hint) {
        // Level 2: show the hint
        fb.textContent = `💡 ${step.hint}`;
        fb.className   = 'step-feedback hint';
      } else {
        // Level 1: simple try-again
        fb.textContent = 'Try again! 🤔';
        fb.className   = 'step-feedback wrong';
      }
    }
    inp.select();
    return;
  }

  if (!ok && step.isFinal) {
    // Wrong final step — score it as wrong and move on
    G.missedProblems.push({
      a:      G.problem.a,
      b:      G.problem.b,
      opKey:  G.problem.opKey,
      answer: G.problem.answer,
      steps:  G.steps.slice(),
    });
    G.answered = true;
    G.total++;
    G.sessionQ++;
    G.streak = 0;
    triggerAnim('shake');
    showFeedback(`❌ Not quite — the answer was ${G.problem.answer}`, 'wrong');
    renderSteps();
    updateScoreUI();
    updateStreakUI();
    updateSessionBar();
    document.getElementById('next-btn').style.display = 'block';
    if (G.sessionQ >= 10) {
      document.getElementById('next-btn').textContent = '🎉 See Results!';
      document.getElementById('next-btn').onclick = finishSession;
    }
    return;
  }

  if (!step.isFinal) {
    // Correct intermediate step — unlock next
    G.stepAttempts = 0;
    G.currentStep++;
    renderSteps();
    return;
  }

  // ── Final step ───────────────────────────────
  G.answered = true;
  G.total++;
  G.sessionQ++;
  G.correct++; G.streak++; G.sessionCorrect++;
  G.sessionCoins += 2;

  triggerAnim('bounce');
  showFeedback(pickRandom(CORRECT_MSGS), 'correct');
  spawnConfetti(G.streak >= 5 ? 30 : 14);
  const p = getActiveProfile();
  if (p) await addCoins(p.id, 2, 'Correct math answer');
  renderHeader();

  renderSteps(); // re-render to show completed state

  updateScoreUI();
  updateStreakUI();
  updateSessionBar();

  document.getElementById('next-btn').style.display = 'block';
  if (G.sessionQ >= 10) {
    document.getElementById('next-btn').textContent = '🎉 See Results!';
    document.getElementById('next-btn').onclick = finishSession;
  }
}

function nextProblem() {
  newProblem();
}

// ── Step-by-step help modal ────────────────────
function showHelpModal() {
  if (!G.problem) return;
  const p = getActiveProfile();
  if (!p) return;
  const { a: realA, b: realB, opKey } = G.problem;
  const grade = p.grade;

  // Generate a random example that isn't the same as the current problem
  const gen = GRADE_CONFIGS[grade].generate;
  const generator = gen[opKey] || gen.addition;
  let ex;
  let attempts = 0;
  do {
    ex = generator();
    attempts++;
  } while (attempts < 20 && ex.a === realA && ex.b === realB);

  const html = buildHelpHtml(grade, opKey, ex.a, ex.b, ex.answer);
  showModal(html);
}

function buildHelpHtml(grade, op, a, b, answer) {
  const sections = {
    kindergarten: {
      addition: () => {
        const bigger  = Math.max(a, b);
        const smaller = Math.min(a, b);
        const dots    = Array.from({ length: smaller }, (_, i) => bigger + i + 1);
        return {
          strategy: 'Count On',
          color: '#22C55E',
          steps: [
            { icon: '1️⃣', text: `Find the <strong>bigger number</strong>: start at <strong>${bigger}</strong>` },
            { icon: '2️⃣', text: `Count on <strong>${smaller}</strong> more using your fingers` },
            { icon: '🤚', text: `Say each number as you go: <strong>${dots.join(', ')}</strong>` },
            { icon: '✅', text: `The last number you said is the answer: <strong>${answer}</strong>` },
          ],
          visual: `<div class="help-visual">
            <span class="help-dot-group">${'🔵'.repeat(bigger)}</span>
            <span class="help-dot-group">${'🟢'.repeat(smaller)}</span>
            <span class="help-eq">${bigger} + ${smaller} = <strong>${answer}</strong></span>
          </div>`,
        };
      },
      subtraction: () => {
        const countback = Array.from({ length: b }, (_, i) => a - i - 1);
        return {
          strategy: 'Count Back',
          color: '#3B82F6',
          steps: [
            { icon: '1️⃣', text: `Start at the <strong>big number</strong>: <strong>${a}</strong>` },
            { icon: '2️⃣', text: `Count <strong>back ${b}</strong> steps using your fingers` },
            { icon: '🤚', text: `Say each number as you go: <strong>${countback.join(', ')}</strong>` },
            { icon: '✅', text: `The last number you said is the answer: <strong>${answer}</strong>` },
          ],
          visual: `<div class="help-visual">
            <span class="help-dot-group">${'🔵'.repeat(a)}</span>
            <span class="help-eq">Cross out <strong>${b}</strong>: ${'❌'.repeat(b)} = <strong>${answer}</strong> left</span>
          </div>`,
        };
      },
    },
    grade3: {
      addition: () => {
        const aH = Math.floor(a / 100) * 100, aT = Math.floor((a % 100) / 10) * 10, aO = a % 10;
        const bH = Math.floor(b / 100) * 100, bT = Math.floor((b % 100) / 10) * 10, bO = b % 10;
        const sumH = aH + bH, sumT = aT + bT, sumO = aO + bO;
        const steps = [
          { icon: '1️⃣', text: `<strong>Break apart</strong> each number by place value` },
          { icon: '🔢', text: `<strong>${a}</strong> = ${aH > 0 ? aH : ''}${aT > 0 ? ' + ' + aT : ''}${aO > 0 ? ' + ' + aO : ''}`.replace(/^= \+\s*/, '= ') },
          { icon: '🔢', text: `<strong>${b}</strong> = ${bH > 0 ? bH : ''}${bT > 0 ? ' + ' + bT : ''}${bO > 0 ? ' + ' + bO : ''}`.replace(/^= \+\s*/, '= ') },
        ];
        if (aH + bH > 0) steps.push({ icon: '2️⃣', text: `Add the <strong>hundreds</strong>: ${aH} + ${bH} = <strong>${sumH}</strong>` });
        steps.push({ icon: aH + bH > 0 ? '3️⃣' : '2️⃣', text: `Add the <strong>tens</strong>: ${aT} + ${bT} = <strong>${sumT}</strong>` });
        steps.push({ icon: aH + bH > 0 ? '4️⃣' : '3️⃣', text: `Add the <strong>ones</strong>: ${aO} + ${bO} = <strong>${sumO}</strong>` });
        steps.push({ icon: '✅', text: `Add the parts together: ${[sumH, sumT, sumO].filter(v => v > 0).join(' + ')} = <strong>${answer}</strong>` });
        return {
          strategy: 'Break Apart (Partial Sums)',
          color: '#22C55E',
          steps,
          visual: `<div class="help-visual help-place-value">
            <div class="help-pv-row"><span class="help-pv-label">Hundreds</span><span class="help-pv-label">Tens</span><span class="help-pv-label">Ones</span></div>
            <div class="help-pv-row"><span class="help-pv-num">${aH || '—'}</span><span class="help-pv-num">${aT || '—'}</span><span class="help-pv-num">${aO || '—'}</span></div>
            <div class="help-pv-row"><span class="help-pv-num">+ ${bH || '—'}</span><span class="help-pv-num">${bT || '—'}</span><span class="help-pv-num">${bO || '—'}</span></div>
            <div class="help-pv-divider"></div>
            <div class="help-pv-row"><span class="help-pv-num">${sumH}</span><span class="help-pv-num">${sumT}</span><span class="help-pv-num"><strong>${sumO}</strong></span></div>
          </div>`,
        };
      },
      subtraction: () => {
        const aH = Math.floor(a / 100) * 100, aT = Math.floor((a % 100) / 10) * 10, aO = a % 10;
        const bH = Math.floor(b / 100) * 100, bT = Math.floor((b % 100) / 10) * 10, bO = b % 10;
        return {
          strategy: 'Place Value Subtraction',
          color: '#3B82F6',
          steps: [
            { icon: '1️⃣', text: `<strong>Break apart</strong> each number by place value` },
            { icon: '🔢', text: `<strong>${a}</strong> → ${aH > 0 ? aH + ' + ' : ''}${aT > 0 ? aT + ' + ' : ''}${aO}` },
            { icon: '🔢', text: `<strong>${b}</strong> → ${bH > 0 ? bH + ' + ' : ''}${bT > 0 ? bT + ' + ' : ''}${bO}` },
            { icon: '2️⃣', text: `Subtract <strong>ones</strong> first: ${aO} − ${bO}${aO < bO ? ' (regroup from tens!)' : ''}` },
            { icon: '3️⃣', text: `Subtract <strong>tens</strong> next: ${aT} − ${bT}${aT < bT ? ' (regroup from hundreds!)' : ''}` },
            { icon: aH + bH > 0 ? '4️⃣' : '', text: aH + bH > 0 ? `Subtract <strong>hundreds</strong>: ${aH} − ${bH}` : '' },
            { icon: '✅', text: `Answer: <strong>${answer}</strong>` },
          ].filter(s => s.icon),
          visual: `<div class="help-visual"><span class="help-eq">${a} − ${b} = <strong>${answer}</strong></span></div>`,
        };
      },
      multiplication: () => {
        // Area model: break the smaller factor into tens + ones
        const [big, small] = a >= b ? [a, b] : [b, a];
        const smallT = Math.floor(small / 10) * 10;
        const smallO = small % 10;
        const useAreaModel = small > 9;
        if (useAreaModel) {
          const part1 = big * smallT, part2 = big * smallO;
          return {
            strategy: 'Area Model',
            color: '#F97316',
            steps: [
              { icon: '1️⃣', text: `Break <strong>${small}</strong> into tens and ones: <strong>${smallT} + ${smallO}</strong>` },
              { icon: '2️⃣', text: `Multiply <strong>${big} × ${smallT}</strong> = <strong>${part1}</strong>` },
              { icon: '3️⃣', text: `Multiply <strong>${big} × ${smallO}</strong> = <strong>${part2}</strong>` },
              { icon: '4️⃣', text: `Add the two parts: <strong>${part1} + ${part2}</strong> = <strong>${answer}</strong>` },
            ],
            visual: `<div class="help-visual help-area-model">
              <div class="help-area-row">
                <div class="help-area-label"></div>
                <div class="help-area-cell head">${smallT}</div>
                <div class="help-area-cell head">${smallO}</div>
              </div>
              <div class="help-area-row">
                <div class="help-area-label head">${big}</div>
                <div class="help-area-cell">${part1}</div>
                <div class="help-area-cell">${part2}</div>
              </div>
              <div class="help-area-sum">${part1} + ${part2} = <strong>${answer}</strong></div>
            </div>`,
          };
        } else {
          // Both single digit — use simple skip count / known facts
          return {
            strategy: 'Equal Groups',
            color: '#F97316',
            steps: [
              { icon: '1️⃣', text: `Think of <strong>${a} × ${b}</strong> as <strong>${a} groups of ${b}</strong>` },
              { icon: '2️⃣', text: `Count by <strong>${b}s</strong>, <strong>${a}</strong> times:` },
              { icon: '🔢', text: Array.from({ length: a }, (_, i) => (i + 1) * b).join(', ') },
              { icon: '✅', text: `Answer: <strong>${answer}</strong>` },
            ],
            visual: `<div class="help-visual"><span class="help-eq">${Array.from({ length: a }, () => b).join(' + ')} = <strong>${answer}</strong></span></div>`,
          };
        }
      },
      division: () => {
        const multiples = Array.from({ length: 5 }, (_, i) => `${i + 1} × ${b} = ${(i + 1) * b}`);
        const qIdx = answer <= 5 ? answer - 1 : 4;
        return {
          strategy: 'Think Multiplication',
          color: '#A855F7',
          steps: [
            { icon: '1️⃣', text: `Ask yourself: <strong>__ × ${b} = ${a}?</strong>` },
            { icon: '2️⃣', text: `Think through your <strong>${b}s</strong> times table:` },
            { icon: '🔢', text: `1×${b}=${b}, 2×${b}=${b*2}, 3×${b}=${b*3}… until you reach <strong>${a}</strong>` },
            { icon: '3️⃣', text: `<strong>${answer} × ${b} = ${a}</strong> ✓` },
            { icon: '✅', text: `So <strong>${a} ÷ ${b} = ${answer}</strong>` },
          ],
          visual: `<div class="help-visual"><span class="help-eq"><strong>${answer}</strong> × ${b} = ${a}<br>${a} ÷ ${b} = <strong>${answer}</strong></span></div>`,
        };
      },
    },
  };

  const gradeKey = grade === 'kindergarten' ? 'kindergarten' : 'grade3';
  const opKey    = ['addition','subtraction','multiplication','division'].includes(op) ? op : 'addition';
  const build    = sections[gradeKey][opKey];
  if (!build) return '<p>No help available for this problem.</p>';
  const { strategy, color, steps, visual } = build();

  const opLabels = { addition: 'Addition', subtraction: 'Subtraction', multiplication: 'Multiplication', division: 'Division' };
  const gradeLabel = grade === 'kindergarten' ? 'Kindergarten' : '3rd Grade';

  return `
    <div class="help-modal">
      <div class="help-header" style="border-color:${color}">
        <div class="help-title">${opLabels[opKey] || opKey}</div>
        <div class="help-strategy" style="color:${color}">${strategy}</div>
        <div class="help-grade-tag">${gradeLabel} · i-Ready Classroom Mathematics</div>
      </div>
      <div class="help-problem-echo">${a} ${OPS[opKey].symbol} ${b} = ?</div>
      <div class="help-steps">
        ${steps.map(s => `
          <div class="help-step">
            <span class="help-step-icon">${s.icon}</span>
            <span class="help-step-text">${s.text}</span>
          </div>
        `).join('')}
      </div>
      ${visual}
      <div class="help-citation">
        Method used by <a href="https://www.westada.org/Page/15143" target="_blank">West Ada School District</a>
        &amp; <a href="https://www.westada.org/barbaramorgan" target="_blank">Barbara Morgan STEM Academy</a>,
        Meridian, Idaho.
      </div>
      <button class="modal-close-btn" onclick="closeModal()">Got it! 👍</button>
    </div>`;
}

async function finishSession() {
  const p = getActiveProfile();
  if (!p) return;
  const card = drawCard(p.theme);
  await addCard(p.id, card);
  await updateStats(p.id, G.sessionCorrect, G.sessionQ, G.streak);
  await recordQuestSession(p.id, {
    theme:   p.theme,
    op:      G.op,
    correct: G.sessionCorrect,
    total:   G.sessionQ,
    coins:   G.sessionCoins,
    cardId:  card.id,
  });
  nav('quest-done', {
    correct:        G.sessionCorrect,
    total:          G.sessionQ,
    coins:          G.sessionCoins,
    card,
    resumeOp:       G.op,
    missedProblems: G.missedProblems,
  });
}

function selectOp(op) {
  const _p = getActiveProfile();
  if (_p) {
    const _limit = _p.grade === 'kindergarten' ? 3 : 2;
    if ((getDailyOpCounts(_p.id)[op] || 0) >= _limit) return;
  }
  G.op = op; G.streak = 0;
  updateStreakUI();
  document.querySelectorAll('.op-tab').forEach(b => b.classList.toggle('active', b.dataset.op === op));
  const p = getActiveProfile();
  if (p) applyTheme(p.theme, op);
  newProblem();
}

function triggerAnim(cls) {
  const el = document.getElementById('critter');
  if (!el) return;
  el.classList.remove('bounce','shake');
  void el.offsetWidth;
  el.classList.add(cls);
}

function showFeedback(msg, type) {
  const el = document.getElementById('feedback');
  el.textContent = msg;
  el.className   = `feedback ${type} show`;
}

function updateScoreUI() {
  const c = document.getElementById('score-correct');
  const t = document.getElementById('score-total');
  if (c) c.textContent = G.correct;
  if (t) t.textContent = G.total;
}

function updateStreakUI() {
  const el = document.getElementById('streak-banner');
  const sc = document.getElementById('streak-count');
  if (!el) return;
  el.style.display = G.streak >= 3 ? 'block' : 'none';
  if (sc && G.streak >= 3) sc.textContent = G.streak;
}

function updateSessionBar() {
  const fill  = document.getElementById('sess-fill');
  const label = document.getElementById('sess-label');
  const coins = document.getElementById('sess-coins');
  const q = Math.min(G.sessionQ, 10);
  if (fill)  fill.style.width = (q / 10 * 100) + '%';
  if (label) label.textContent = `Question ${q} / 10`;
  if (coins) coins.textContent = `🪙 ${G.sessionCoins}`;
}

// ── Confetti ──────────────────────────────────
const CONFETTI_COLORS = ['#FF6B6B','#FFD93D','#6BCB77','#4D96FF','#C77DFF','#FF9A3C'];
function spawnConfetti(count) {
  const box = document.getElementById('confetti-box');
  for (let i = 0; i < count; i++) {
    const el = document.createElement('div');
    el.className               = 'confetti-piece';
    el.style.left              = rand(5, 95) + 'vw';
    el.style.background        = CONFETTI_COLORS[rand(0, CONFETTI_COLORS.length-1)];
    el.style.animationDelay    = rand(0, 600) + 'ms';
    el.style.animationDuration = rand(900, 1600) + 'ms';
    el.style.width             = rand(8, 16) + 'px';
    el.style.height            = rand(8, 16) + 'px';
    el.style.borderRadius      = rand(0, 1) ? '50%' : '2px';
    box.appendChild(el);
    el.addEventListener('animationend', () => el.remove());
  }
}

// ── Quest done screen ─────────────────────────
function renderQuestDone(data) {
  const { correct, total, coins, card, resumeOp, missedProblems = [],
          subject = 'math', resumeCat = '', missedQuestions = [] } = data;
  const pct = Math.round((correct / total) * 100);
  const msg = pct === 100 ? '🏆 Perfect Score!' : pct >= 70 ? '⭐ Great Job!' : '💪 Keep Practicing!';
  const rc  = RARITY_COLORS[card.rarity];

  const toReview = missedProblems.slice(0, 5);
  const readReviewHtml = subject === 'reading' && missedQuestions.length > 0 ? `
    <div class="review-section">
      <div class="review-title">📝 Let's look at the ones you missed</div>
      ${missedQuestions.map(q => `
        <div class="review-card" style="border-left-color:#8B5CF6">
          <div class="review-problem-head" style="color:#8B5CF6;white-space:pre-line">${esc(q.prompt)}</div>
          <div class="review-correct">✓ Correct answer: <strong>${esc(q.answer)}</strong></div>
        </div>`).join('')}
    </div>` : '';
  const reviewHtml = toReview.length === 0 ? '' : `
    <div class="review-section">
      <div class="review-title">📝 Let's look at the ones you missed</div>
      ${toReview.map(prob => {
        const opCfg = OPS[prob.opKey];
        return `
          <div class="review-card" style="border-left-color:${opCfg.accent}">
            <div class="review-problem-head" style="color:${opCfg.accent}">
              ${prob.a} ${opCfg.symbol} ${prob.b} = <strong>${prob.answer}</strong>
            </div>
            <div class="review-steps">
              ${prob.steps.map(step => `
                <div class="review-step${step.isFinal ? ' review-step-final' : ''}">
                  ${step.label.replace('___', `<strong>${step.answer}</strong>`)}
                </div>`).join('')}
            </div>
          </div>`;
      }).join('')}
    </div>`;

  document.getElementById('screen-quest-done').innerHTML = `
    <div class="quest-done-page">
      <div class="done-title">${msg}</div>
      <div class="done-score">
        <div class="done-score-num">${correct} / ${total}</div>
        <div class="done-score-label">Correct Answers</div>
        <div class="done-coins">+${coins} 🪙 coins earned this quest!</div>
      </div>
      <div class="card-reveal">
        <div class="card-reveal-label">🎁 You earned a new card!</div>
        <div class="card-reveal-emoji">${card.emoji}</div>
        <div class="card-reveal-name">${card.name}</div>
        <div class="rarity-badge" style="background:${rc}">${RARITY_LABELS[card.rarity]}</div>
        <div style="font-size:.72rem;font-weight:700;color:#94A3B8">${THEMES[card.theme].icon} ${THEMES[card.theme].name} · ${card.earnedDate}</div>
      </div>
      ${reviewHtml}
      ${readReviewHtml}
      <div class="done-btn-row">
        ${subject === 'reading'
          ? `<button class="primary-btn" onclick="nav('read-game',{resumeCat:'${resumeCat}'})">Play Again! 📖</button>`
          : `<button class="primary-btn" onclick="nav('quest-game',{resumeOp:'${resumeOp}'})">Play Again! ⚔️</button>`}
        <button class="primary-btn" style="background:#1E293B;box-shadow:0 4px 0 #0F172A" onclick="nav('dashboard')">Dashboard 🏠</button>
      </div>
    </div>`;

  spawnConfetti(20);
}

// ── Inventory screen ──────────────────────────
let _invFilter = 'all';

function renderInventory() {
  const p = getActiveProfile();
  if (!p) return;

  const flair = p.flair;
  const flairSet = new Set(flair.filter(Boolean));

  let cards = p.inventory;
  if (_invFilter !== 'all') cards = cards.filter(c => c.rarity === _invFilter || c.theme === _invFilter);

  const rarities = ['common','uncommon','rare','epic','legendary'];
  const filterBtns = ['all', ...rarities, ...Object.keys(THEMES)]
    .map(f => `<button class="inv-filter-btn ${_invFilter===f?'active':''}" onclick="setInvFilter('${f}')">
      ${f==='all'?'All':f.charAt(0).toUpperCase()+f.slice(1)}</button>`).join('');

  const flairSlots = flair.map((cid, i) => {
    const card = cid ? p.inventory.find(c => c.id === cid) : null;
    const cls  = card ? 'flair-slot-big filled' : 'flair-slot-big';
    return `<div style="display:flex;flex-direction:column;align-items:center;gap:2px">
      <div class="${cls}">${card ? card.emoji : '+'}</div>
      ${card ? `<button class="flair-remove" onclick="removeFlair(${i})">✕ Remove</button>` : ''}
    </div>`;
  }).join('');

  const cardHtml = cards.length === 0
    ? `<div class="inv-empty">No cards yet${_invFilter!=='all'?' in this filter':''}! Complete a quest to earn your first card.</div>`
    : cards.map(c => {
        const rc     = RARITY_COLORS[c.rarity];
        const inFlair = flairSet.has(c.id);
        return `<div class="inv-card" style="border-color:${rc}20">
          <div class="inv-card-emoji">${c.emoji}</div>
          <span class="rarity-badge" style="background:${rc}">${RARITY_LABELS[c.rarity]}</span>
          <div class="inv-card-name">${c.name}</div>
          <div class="inv-card-theme">${THEMES[c.theme]?.icon} ${THEMES[c.theme]?.name}</div>
          <div class="inv-card-date">${c.earnedDate}</div>
          <button class="flair-toggle-btn ${inFlair?'remove':'add'}"
            onclick="toggleFlair('${c.id}')">
            ${inFlair ? '⭐ Remove Flair' : '+ Add Flair'}
          </button>
        </div>`;
      }).join('');

  document.getElementById('screen-inventory').innerHTML = `
    <div class="page-wrap">
      <button class="back-btn" onclick="nav('dashboard')">← Dashboard</button>
      <h2 class="page-title">🎒 Inventory</h2>
      <div class="flair-manager">
        <div class="flair-manager-title">Your Flair (shown in header)</div>
        <div class="flair-row">${flairSlots}</div>
      </div>
      <div class="inv-filter-row">${filterBtns}</div>
      <div class="inv-grid">${cardHtml}</div>
    </div>`;
}

function setInvFilter(f) { _invFilter = f; renderInventory(); }

async function toggleFlair(cardId) {
  const p = getActiveProfile();
  if (!p) return;
  const flair = [...p.flair];
  const idx   = flair.indexOf(cardId);
  if (idx !== -1) {
    flair[idx] = null;
  } else {
    const empty = flair.indexOf(null);
    if (empty === -1) { showModal(`<div class="modal-title">Flair Full!</div>
      <div class="modal-text">Remove a flair first to add this card.</div>
      <div class="modal-btns"><button class="primary-btn" onclick="closeModal()">OK</button></div>`); return; }
    flair[empty] = cardId;
  }
  await setFlair(p.id, flair);
  renderInventory();
  renderHeader();
}

async function removeFlair(slot) {
  const p = getActiveProfile();
  if (!p) return;
  const flair = [...p.flair];
  flair[slot] = null;
  await setFlair(p.id, flair);
  renderInventory();
  renderHeader();
}

// ── Bank screen ───────────────────────────────
function renderBank() {
  const p = getActiveProfile();
  if (!p) return;

  const txHtml = p.transactions.length === 0
    ? `<div class="inv-empty">No transactions yet. Start a quest to earn coins!</div>`
    : p.transactions.map(tx => {
        const isEarn  = tx.type === 'earn';
        const amtSign = isEarn ? '+' : '-';
        return `<div class="tx-row">
          <div class="tx-icon">${isEarn ? '🪙' : '🏪'}</div>
          <div class="tx-info">
            <div class="tx-reason">${tx.reason}</div>
            <div class="tx-date">${fmt(tx.date)} at ${fmtTime(tx.date)}</div>
          </div>
          <div class="tx-amount ${tx.type}">${amtSign}${tx.amount} 🪙</div>
        </div>`;
      }).join('');

  document.getElementById('screen-bank').innerHTML = `
    <div class="page-wrap">
      <button class="back-btn" onclick="nav('dashboard')">← Dashboard</button>
      <h2 class="page-title">🪙 Coin Bank</h2>
      <div class="bank-balance">
        <div class="bank-balance-label">Current Balance</div>
        <div class="bank-balance-num">${p.coins} 🪙</div>
        <div class="bank-balance-label">${p.stats.totalCorrect} correct answers · ${p.stats.sessionsCompleted} quests</div>
      </div>
      <button class="store-link-btn" onclick="nav('store')">🏪 Go to Store</button>
      <div style="font-size:.78rem;font-weight:800;color:#94A3B8;text-transform:uppercase;letter-spacing:.06em">Transaction History</div>
      <div class="tx-list">${txHtml}</div>
    </div>`;
}

// ── Store screen ──────────────────────────────
function renderStore() {
  const p     = getActiveProfile();
  const items = getStore();

  const itemsHtml = items.length === 0
    ? `<div class="store-empty">No rewards yet! Ask a parent to add some. 🛍️</div>`
    : items.map(item => {
        const check  = p ? canPurchase(p.id, item.id) : { ok: false, reason: 'No profile' };
        return `<div class="store-card">
          <div class="store-card-top">
            <div class="store-card-icon">${item.emoji || '🎁'}</div>
            <div class="store-card-info">
              <div class="store-card-name">${esc(item.name)}</div>
              <div class="store-card-type">${esc(item.type || 'Reward')}</div>
            </div>
          </div>
          <div class="store-card-desc">${esc(item.description || '')}</div>
          <div class="store-card-foot">
            <div class="store-cost">🪙 ${item.cost}</div>
            <button class="buy-btn" ${check.ok ? '' : 'disabled'}
              onclick="${check.ok ? `buyItem('${item.id}')` : ''}">
              ${check.ok ? 'Buy! 🛒' : esc(check.reason)}
            </button>
          </div>
        </div>`;
      }).join('');

  document.getElementById('screen-store').innerHTML = `
    <div class="page-wrap">
      <button class="back-btn" onclick="nav('dashboard')">← Dashboard</button>
      <h2 class="page-title">🏪 Store</h2>
      ${p ? `<div class="page-subtitle">Your balance: 🪙 ${p.coins}</div>` : ''}
      <div class="store-grid">${itemsHtml}</div>
      <button class="text-btn" onclick="promptParentPin()">⚙️ Parent: Edit Store</button>
    </div>`;
}

function buyItem(itemId) {
  const p = getActiveProfile();
  if (!p) return;
  const item = getStore().find(s => s.id === itemId);
  if (!item) return;
  const check = canPurchase(p.id, itemId);
  if (!check.ok) { showModal(`<div class="modal-title">Can't buy yet</div>
    <div class="modal-text">${check.reason}</div>
    <div class="modal-btns"><button class="primary-btn" onclick="closeModal()">OK</button></div>`); return; }

  showModal(`<div class="modal-title">Buy ${item.emoji || '🎁'} ${esc(item.name)}?</div>
    <div class="modal-text">This costs <strong>${item.cost} 🪙</strong>. You have ${p.coins} 🪙.</div>
    <div class="modal-btns">
      <button class="primary-btn" onclick="confirmBuy('${itemId}')">Yes, Buy!</button>
      <button class="danger-btn" onclick="closeModal()">Cancel</button>
    </div>`);
}

async function confirmBuy(itemId) {
  const p = getActiveProfile();
  if (!p) return;
  await purchaseItem(p.id, itemId);
  closeModal();
  renderStore();
  renderHeader();
  spawnConfetti(12);
}

// ── Parent PIN prompt ─────────────────────────
function promptParentPin() {
  showModal(`
    <div class="modal-title">🔐 Parent Mode</div>
    <div class="modal-text">Enter the 4-digit PIN to edit the store.</div>
    <div class="pin-row">
      <input class="pin-digit" id="pin0" type="password" inputmode="numeric" maxlength="1" oninput="pinNext(0)" />
      <input class="pin-digit" id="pin1" type="password" inputmode="numeric" maxlength="1" oninput="pinNext(1)" />
      <input class="pin-digit" id="pin2" type="password" inputmode="numeric" maxlength="1" oninput="pinNext(2)" />
      <input class="pin-digit" id="pin3" type="password" inputmode="numeric" maxlength="1" oninput="pinCheck()" />
    </div>
    <div class="pin-error" id="pin-error">Wrong PIN. Try again.</div>
    <div class="modal-btns">
      <button class="primary-btn" onclick="submitPin()">Enter</button>
      <button class="text-btn" onclick="closeModal()">Cancel</button>
    </div>`);
  setTimeout(() => { const d = document.getElementById('pin0'); if(d) d.focus(); }, 50);
}

function pinNext(i) {
  const next = document.getElementById('pin' + (i+1));
  if (next && document.getElementById('pin'+i).value) next.focus();
}
function pinCheck() { /* auto-submit handled by submitPin */ }
function submitPin() {
  const pin = [0,1,2,3].map(i => (document.getElementById('pin'+i)||{}).value || '').join('');
  if (pin === getParentPin()) {
    closeModal(); nav('store-admin', {});
  } else {
    const err = document.getElementById('pin-error');
    if (err) { err.classList.add('show'); [0,1,2,3].forEach(i => { const d=document.getElementById('pin'+i); if(d) d.value=''; }); document.getElementById('pin0').focus(); }
  }
}

// ── Store admin screen ────────────────────────
let _editItemId = null;

function renderStoreAdmin(data) {
  const items = getStore();
  const itemList = items.length === 0
    ? '<div class="store-empty">No items yet. Add one below!</div>'
    : items.map(it => `
        <div class="admin-item">
          <div class="admin-item-emoji">${it.emoji || '🎁'}</div>
          <div class="admin-item-info">
            <div class="admin-item-name">${esc(it.name)}</div>
            <div class="admin-item-meta">🪙 ${it.cost} · ${it.type || 'Reward'} · ${it.cooldownDays || 0}d cooldown</div>
          </div>
          <div class="admin-item-btns">
            <button class="edit-btn" onclick="editStoreItem('${it.id}')">Edit</button>
            <button class="del-btn"  onclick="deleteItem('${it.id}')">Delete</button>
          </div>
        </div>`).join('');

  const editing = _editItemId ? getStore().find(s => s.id === _editItemId) : null;

  document.getElementById('screen-store-admin').innerHTML = `
    <div class="page-wrap">
      <button class="back-btn" onclick="nav('store')">← Store</button>
      <h2 class="page-title">⚙️ Parent: Edit Store</h2>
      <div class="admin-item-list">${itemList}</div>
      <div class="add-item-form">
        <h3>${editing ? '✏️ Edit Item' : '➕ Add New Reward'}</h3>
        <input type="hidden" id="ai-id" value="${editing ? editing.id : ''}" />
        <div class="form-row">
          <div class="form-group" style="flex:.3">
            <label>Emoji</label>
            <input type="text" id="ai-emoji" class="form-input" placeholder="🎁" maxlength="2" value="${editing ? editing.emoji||'' : ''}" />
          </div>
          <div class="form-group" style="flex:1">
            <label>Reward Name</label>
            <input type="text" id="ai-name" class="form-input" placeholder="Ice Cream Trip" value="${editing ? esc(editing.name) : ''}" />
          </div>
        </div>
        <div class="form-row">
          <div class="form-group" style="flex:1">
            <label>Category</label>
            <input type="text" id="ai-type" class="form-input" placeholder="Outing, Food, Toy…" value="${editing ? esc(editing.type||'') : ''}" />
          </div>
          <div class="form-group" style="flex:.6">
            <label>Coin Cost 🪙</label>
            <input type="number" id="ai-cost" class="form-input" placeholder="50" min="1" value="${editing ? editing.cost : ''}" />
          </div>
        </div>
        <div class="form-group">
          <label>Description</label>
          <input type="text" id="ai-desc" class="form-input" placeholder="A trip to your favorite ice cream place!" value="${editing ? esc(editing.description||'') : ''}" />
        </div>
        <div class="form-group">
          <label>Cooldown (days between purchases, 0 = no limit)</label>
          <input type="number" id="ai-cd" class="form-input" placeholder="7" min="0" value="${editing ? editing.cooldownDays||0 : 0}" />
        </div>
        <div style="display:flex;gap:10px">
          <button class="primary-btn" style="flex:1" onclick="saveStoreItem()">${editing ? 'Save Changes' : 'Add Reward'}</button>
          ${editing ? `<button class="danger-btn" onclick="cancelEditItem()">Cancel</button>` : ''}
        </div>
      </div>
      <div class="add-item-form" style="gap:10px">
        <h3>🔑 Change Parent PIN</h3>
        <div class="form-row">
          <div class="form-group" style="flex:1">
            <label>New PIN (4 digits)</label>
            <input type="password" id="new-pin" class="form-input" placeholder="1234" maxlength="4" inputmode="numeric" />
          </div>
          <div style="flex:.4;display:flex;align-items:flex-end">
            <button class="primary-btn" onclick="changePin()" style="width:100%">Save PIN</button>
          </div>
        </div>
      </div>
      <div class="add-item-form" style="gap:10px">
        <h3>🏠 Family Settings</h3>
        <div class="form-group">
          <label>Family Join Code</label>
          <div style="display:flex;gap:8px;align-items:center">
            <div class="form-input" style="flex:1;font-size:1.2rem;font-weight:900;letter-spacing:.08em;text-align:center">${esc(getJoinCode() || '—')}</div>
            <button class="primary-btn" onclick="copyCode('${esc(getJoinCode() || '')}')" style="white-space:nowrap">📋 Copy</button>
          </div>
          <p style="font-size:.8rem;color:#94a3b8;font-weight:700;margin-top:.4rem">Share this with any device to join your family's profiles.</p>
        </div>
        <button class="primary-btn" style="width:100%" onclick="showFamilyPickerScreen()">🔄 Switch / Manage Families</button>
      </div>
    </div>`;
}

function editStoreItem(id) { _editItemId = id; renderStoreAdmin({}); }
function cancelEditItem()  { _editItemId = null; renderStoreAdmin({}); }

async function saveStoreItem() {
  const id   = document.getElementById('ai-id').value;
  const name = (document.getElementById('ai-name').value || '').trim();
  const cost = parseInt(document.getElementById('ai-cost').value, 10);
  if (!name || isNaN(cost) || cost < 1) { alert('Please fill in name and a valid coin cost.'); return; }
  const item = {
    name,
    emoji:        document.getElementById('ai-emoji').value.trim() || '🎁',
    type:         document.getElementById('ai-type').value.trim() || 'Reward',
    cost,
    description:  document.getElementById('ai-desc').value.trim(),
    cooldownDays: parseInt(document.getElementById('ai-cd').value, 10) || 0,
  };
  if (id) { await updateStoreItem(id, item); _editItemId = null; }
  else     { await addStoreItem(item); }
  renderStoreAdmin({});
}

function deleteItem(id) {
  showModal(`<div class="modal-title">Delete this reward?</div>
    <div class="modal-text">This cannot be undone.</div>
    <div class="modal-btns">
      <button class="danger-btn" onclick="doDeleteItem('${id}')">Delete</button>
      <button class="primary-btn" onclick="closeModal()">Cancel</button>
    </div>`);
}
async function doDeleteItem(id) { await deleteStoreItem(id); closeModal(); renderStoreAdmin({}); }

async function changePin() {
  const p = (document.getElementById('new-pin').value || '').trim();
  if (!/^\d{4}$/.test(p)) { alert('PIN must be exactly 4 digits.'); return; }
  await setParentPin(p);
  showModal(`<div class="modal-title">PIN Updated ✓</div>
    <div class="modal-text">New PIN: ${p}</div>
    <div class="modal-btns"><button class="primary-btn" onclick="closeModal()">Done</button></div>`);
}

// ── Themes screen ─────────────────────────────
let _themePicking = null;  // which theme we're picking a mascot for

function renderThemes() {
  const p = getActiveProfile();
  if (!p) return;

  const themeCards = Object.entries(THEMES).map(([k, t]) => {
    const isActive  = p.theme === k;
    const mascot    = p.themeCreatures[k] || '🐾';
    const cardCount = p.inventory.filter(c => c.theme === k).length;
    return `<div class="theme-option-card ${isActive?'active':''}" onclick="switchTheme('${k}')">
      <div class="toc-icon">${t.icon}</div>
      <div class="toc-name">${t.name}</div>
      <div class="toc-mascot">${mascot}</div>
      <div class="toc-count">${cardCount} card${cardCount!==1?'s':''} collected</div>
      ${isActive ? `<div class="toc-active-badge">✓ Active</div>` : ''}
      <button class="flair-toggle-btn add" onclick="event.stopPropagation();startMascotPick('${k}')">Change Animal</button>
    </div>`;
  }).join('');

  const pickerHtml = _themePicking ? renderMascotPicker(_themePicking, p) : '';

  document.getElementById('screen-themes').innerHTML = `
    <div class="page-wrap">
      <button class="back-btn" onclick="nav('dashboard')">← Dashboard</button>
      <h2 class="page-title">🎨 Themes</h2>
      <p class="page-subtitle">Pick your world — and your animal mascot!</p>
      ${pickerHtml}
      <div class="themes-grid">${themeCards}</div>
    </div>`;
}

function renderMascotPicker(themeKey, p) {
  const pool   = MASCOT_POOLS[themeKey] || [];
  const cur    = p.themeCreatures[themeKey];
  const t      = THEMES[themeKey];
  const btns   = pool.map(emoji =>
    `<button class="mascot-btn ${emoji===cur?'active':''}" onclick="pickMascot('${themeKey}','${emoji}')">${emoji}</button>`
  ).join('');
  return `<div class="mascot-picker">
    <h3>${t.icon} ${t.name} — Pick Your Mascot</h3>
    <div class="mascot-grid">${btns}</div>
    <button class="text-btn" onclick="cancelMascotPick()">Cancel</button>
  </div>`;
}

function startMascotPick(themeKey) { _themePicking = themeKey; renderThemes(); }
function cancelMascotPick()        { _themePicking = null;     renderThemes(); }

async function pickMascot(themeKey, emoji) {
  const p = getActiveProfile();
  if (!p) return;
  const tc = { ...p.themeCreatures, [themeKey]: emoji };
  await updateProfile(p.id, { themeCreatures: tc });
  _themePicking = null;
  renderThemes();
  renderHeader();
}

async function switchTheme(themeKey) {
  const p = getActiveProfile();
  if (!p) return;
  await updateProfile(p.id, { theme: themeKey });
  applyTheme(themeKey, G.op);
  renderThemes();
  renderHeader();
}

// ── Journey screen ────────────────────────────
const JOURNEY_MAPS = {
  forest: [
    { emoji: '🌱', name: 'Sunny Meadow'     },
    { emoji: '🍄', name: 'Mushroom Hollow'  },
    { emoji: '🌊', name: 'Babbling Brook'   },
    { emoji: '🦊', name: 'Fox Den'          },
    { emoji: '🌲', name: 'Deep Woods'       },
    { emoji: '🦉', name: 'Owl Tower'        },
    { emoji: '🐻', name: 'Bear Cave'        },
    { emoji: '🌙', name: 'Moonlit Glade'    },
    { emoji: '🦅', name: "Eagle's Peak"     },
    { emoji: '🦄', name: 'Unicorn Glade'    },
  ],
  ocean: [
    { emoji: '🏖️', name: 'Sandy Shore'      },
    { emoji: '🪸', name: 'Tide Pools'       },
    { emoji: '🐠', name: 'Coral Reef'       },
    { emoji: '🦭', name: 'Seal Rocks'       },
    { emoji: '🌊', name: 'Open Current'     },
    { emoji: '🐙', name: 'Kelp Forest'      },
    { emoji: '🦈', name: 'Deep Blue'        },
    { emoji: '🐋', name: 'Whale Highway'    },
    { emoji: '🌀', name: 'The Vortex'       },
    { emoji: '🐉', name: "Sea Dragon's Lair"},
  ],
  farm: [
    { emoji: '🐣', name: 'Chicken Coop'     },
    { emoji: '🌻', name: 'Sunflower Field'  },
    { emoji: '🐄', name: 'Cow Pasture'      },
    { emoji: '🌾', name: 'Wheat Field'      },
    { emoji: '🐴', name: 'Horse Stable'     },
    { emoji: '🍎', name: 'Apple Orchard'    },
    { emoji: '🐑', name: 'Sheep Meadow'     },
    { emoji: '🌽', name: 'Corn Maze'        },
    { emoji: '🦚', name: 'Peacock Garden'   },
    { emoji: '🌟', name: "Golden Hen's Nest"},
  ],
  jungle: [
    { emoji: '🌿', name: 'Jungle Edge'      },
    { emoji: '🐸', name: 'Frog Pond'        },
    { emoji: '🐒', name: 'Monkey Trees'     },
    { emoji: '🌺', name: 'Flower Clearing'  },
    { emoji: '🦒', name: 'Tall Grass Plains'},
    { emoji: '🐆', name: 'Leopard Trail'    },
    { emoji: '🦍', name: 'Gorilla Highlands'},
    { emoji: '🐊', name: 'River Crossing'   },
    { emoji: '🐅', name: "Tiger's Realm"    },
    { emoji: '🦎', name: 'Komodo Summit'    },
  ],
  arctic: [
    { emoji: '❄️', name: 'Ice Shore'        },
    { emoji: '🐧', name: 'Penguin Colony'   },
    { emoji: '🌨️', name: 'Snowy Tundra'     },
    { emoji: '🦊', name: 'Arctic Fox Den'   },
    { emoji: '🦌', name: 'Reindeer Run'     },
    { emoji: '🐺', name: 'Wolf Ridge'       },
    { emoji: '🐳', name: 'Beluga Bay'       },
    { emoji: '🌊', name: 'Orca Strait'      },
    { emoji: '🦅', name: 'Ice Griffin Cliffs'},
    { emoji: '✨', name: 'Aurora Summit'    },
  ],
};

function renderJourney() {
  const p = getActiveProfile();
  if (!p) { nav('dashboard'); return; }

  const theme   = p.theme;
  const stops   = JOURNEY_MAPS[theme];
  const j       = (p.journeys && p.journeys[theme]) || { chapter: 1, stopsCompleted: 0 };
  const sessions = (p.sessions || []).filter(s => s.theme === theme && s.chapter === j.chapter);
  // Build a lookup: stop number → session
  const byStop  = {};
  sessions.forEach(s => { byStop[s.stop] = s; });

  const opLabels = { addition: '➕ Add', subtraction: '➖ Sub', multiplication: '✖️ Mult', division: '➗ Div', mixed: '🎲 Mix' };

  const stopsHtml = stops.map((stop, i) => {
    const stopNum   = i + 1;
    const sess      = byStop[stopNum];
    const completed = stopNum <= j.stopsCompleted;
    const isCurrent = stopNum === j.stopsCompleted + 1;
    const locked    = !completed && !isCurrent;

    let stateClass = locked ? 'locked' : completed ? 'done' : 'current';
    let detail = '';
    if (completed && sess) {
      const pct = Math.round((sess.correct / sess.total) * 100);
      detail = `<div class="jstop-score">${sess.correct}/${sess.total} · ${pct}%</div>`;
    }

    return `
      <div class="journey-row ${i % 2 === 1 ? 'right' : 'left'}">
        ${i > 0 ? '<div class="journey-path"></div>' : ''}
        <button class="jstop ${stateClass}"
          ${completed ? `onclick="showStopDetail('${sess ? sess.id : ''}')"` : ''}
          ${locked || isCurrent ? 'disabled' : ''}>
          <div class="jstop-emoji">${locked ? '🔒' : stop.emoji}</div>
          <div class="jstop-name">${stop.name}</div>
          ${isCurrent ? '<div class="jstop-badge">Next stop!</div>' : ''}
          ${detail}
        </button>
      </div>`;
  }).join('');

  document.getElementById('screen-journey').innerHTML = `
    <div class="page-wrap">
      <button class="back-btn" onclick="nav('dashboard')">← Dashboard</button>
      <h2 class="page-title">🗺️ Journey Map</h2>
      <div class="journey-header">
        <div class="journey-theme-badge">${THEMES[theme].icon} ${THEMES[theme].name}</div>
        <div class="journey-chapter">Chapter ${j.chapter}</div>
        <div class="journey-progress-label">${j.stopsCompleted} / 10 stops complete</div>
        <div class="journey-bar"><div class="journey-bar-fill" style="width:${j.stopsCompleted * 10}%"></div></div>
      </div>
      <div class="journey-map">${stopsHtml}</div>
      <p class="journey-tip">Tap a completed stop to see how you did! 👆</p>
    </div>`;
}

function showStopDetail(sessionId) {
  const p = getActiveProfile();
  if (!p) return;
  const sess = (p.sessions || []).find(s => s.id === sessionId);
  if (!sess) return;

  const stops     = JOURNEY_MAPS[sess.theme];
  const stop      = stops[sess.stop - 1];
  const pct       = Math.round((sess.correct / sess.total) * 100);
  const stars     = pct >= 90 ? '⭐⭐⭐' : pct >= 70 ? '⭐⭐' : '⭐';
  const opLabels  = { addition: 'Addition ➕', subtraction: 'Subtraction ➖', multiplication: 'Multiplication ✖️', division: 'Division ➗', mixed: 'Mixed 🎲' };
  const card      = (p.inventory || []).find(c => c.id === sess.cardId);
  const dateStr   = new Date(sess.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  showModal(`
    <div class="stop-detail">
      <div class="stop-detail-icon">${stop.emoji}</div>
      <div class="stop-detail-name">${stop.name}</div>
      <div class="stop-detail-stars">${stars}</div>
      <div class="stop-detail-score">${sess.correct} / ${sess.total} correct (${pct}%)</div>
      <div class="stop-detail-meta">
        <span>${opLabels[sess.op] || sess.op}</span>
        <span>🪙 ${sess.coins} earned</span>
        <span>📅 ${dateStr}</span>
      </div>
      ${card ? `<div class="stop-detail-card">
        <span style="font-size:1.6rem">${card.emoji}</span>
        <span>Card earned: <strong>${card.name}</strong></span>
      </div>` : ''}
      <button class="modal-close-btn" onclick="closeModal()">Close</button>
    </div>`);
}

// ── Mascot modal (from dashboard avatar click) ──
function showMascotModal() {
  const p = getActiveProfile();
  if (!p) return;
  const pool = MASCOT_POOLS[p.theme] || [];
  const cur  = p.themeCreatures[p.theme];
  const t    = THEMES[p.theme];
  const btns = pool.map(emoji =>
    `<button class="mascot-btn ${emoji === cur ? 'active' : ''}" onclick="pickDashMascot('${emoji}')">${emoji}</button>`
  ).join('');
  showModal(`
    <div class="modal-title">${t.icon} Change Your Mascot</div>
    <div class="modal-text">Pick your animal for the ${t.name} theme</div>
    <div class="mascot-grid" style="justify-content:center;max-width:320px">${btns}</div>
    <div class="modal-btns"><button class="text-btn" onclick="closeModal()">Cancel</button></div>`);
}

function showRenameModal() {
  const p = getActiveProfile();
  if (!p) return;
  showModal(`
    <div class="modal-title">✏️ Edit Name</div>
    <input type="text" id="rename-input" class="form-input" value="${esc(p.name)}"
      maxlength="20" autocomplete="off" style="width:100%;text-align:center;font-size:1.3rem" />
    <div class="modal-btns">
      <button class="primary-btn" onclick="saveRename()">Save</button>
      <button class="text-btn" onclick="closeModal()">Cancel</button>
    </div>`);
  const inp = document.getElementById('rename-input');
  inp.focus(); inp.select();
  inp.addEventListener('keydown', e => { if (e.key === 'Enter') saveRename(); });
}

async function saveRename() {
  const p    = getActiveProfile();
  const name = (document.getElementById('rename-input').value || '').trim();
  if (!p || !name) return;
  await updateProfile(p.id, { name });
  closeModal();
  renderDashboard();
  renderHeader();
}

async function pickDashMascot(emoji) {
  const p = getActiveProfile();
  if (!p) return;
  await updateProfile(p.id, { themeCreatures: { ...p.themeCreatures, [p.theme]: emoji } });
  closeModal();
  renderDashboard();
  renderHeader();
}

// ── Theme modal (from header name click) ──────
function showThemeModal() {
  const p = getActiveProfile();
  if (!p) return;
  const btns = Object.entries(THEMES).map(([k,t]) =>
    `<button class="quick-theme-btn ${p.theme===k?'active':''}" onclick="quickSwitchTheme('${k}')">
      <span>${t.icon}</span>${t.name}
    </button>`).join('');
  showModal(`<div class="modal-title">🎨 Change Theme</div>
    <div class="quick-theme-grid">${btns}</div>
    <div class="modal-btns"><button class="text-btn" onclick="closeModal()">Close</button></div>`);
}

async function quickSwitchTheme(themeKey) {
  const p = getActiveProfile();
  if (!p) return;
  await updateProfile(p.id, { theme: themeKey });
  applyTheme(themeKey, G.op);
  renderHeader();
  closeModal();
}

// ── Modal helpers ─────────────────────────────
function showModal(html) {
  document.getElementById('modal-box').innerHTML     = html;
  document.getElementById('modal-overlay').style.display = 'flex';
}
function closeModal() {
  document.getElementById('modal-overlay').style.display = 'none';
}
document.getElementById('modal-overlay').addEventListener('click', e => {
  if (e.target === document.getElementById('modal-overlay')) closeModal();
});

// ── Utility ───────────────────────────────────
function esc(str) {
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// ─────────────────────────────────────────────
//  READING QUEST
// ─────────────────────────────────────────────

// ── Reading category configs ──────────────────
const READ_CATS = {
  kindergarten: {
    availableCats: ['sight-words', 'letter-sounds', 'word-building', 'mixed'],
    labels: { 'sight-words': '📖 Sight', 'letter-sounds': '🔤 Sounds', 'word-building': '🔨 Words', 'mixed': '🎲 Mix' },
  },
  grade3: {
    availableCats: ['vocabulary', 'spelling', 'grammar', 'mixed'],
    labels: { 'vocabulary': '📚 Vocab', 'spelling': '✏️ Spell', 'grammar': '📝 Grammar', 'mixed': '🎲 Mix' },
  },
};

// ── Reading question banks ─────────────────────
// Each entry: { prompt, answer, others: [3 wrong choices] }
const READ_QUESTIONS = {
  kindergarten: {
    'sight-words': [
      { prompt: 'Find the word:\nTHE',    answer: 'the',    others: ['she', 'her', 'then'] },
      { prompt: 'Find the word:\nAND',    answer: 'and',    others: ['ant', 'end', 'any'] },
      { prompt: 'Find the word:\nA',      answer: 'a',      others: ['at', 'an', 'as'] },
      { prompt: 'Find the word:\nI',      answer: 'I',      others: ['in', 'it', 'is'] },
      { prompt: 'Find the word:\nIN',     answer: 'in',     others: ['is', 'it', 'on'] },
      { prompt: 'Find the word:\nIS',     answer: 'is',     others: ['in', 'it', 'if'] },
      { prompt: 'Find the word:\nIT',     answer: 'it',     others: ['in', 'is', 'at'] },
      { prompt: 'Find the word:\nUP',     answer: 'up',     others: ['us', 'on', 'or'] },
      { prompt: 'Find the word:\nGO',     answer: 'go',     others: ['so', 'do', 'to'] },
      { prompt: 'Find the word:\nTO',     answer: 'to',     others: ['do', 'so', 'by'] },
      { prompt: 'Find the word:\nWE',     answer: 'we',     others: ['me', 'he', 'be'] },
      { prompt: 'Find the word:\nME',     answer: 'me',     others: ['we', 'he', 'be'] },
      { prompt: 'Find the word:\nHE',     answer: 'he',     others: ['we', 'me', 'be'] },
      { prompt: 'Find the word:\nSHE',    answer: 'she',    others: ['the', 'her', 'see'] },
      { prompt: 'Find the word:\nSEE',    answer: 'see',    others: ['she', 'bee', 'fee'] },
      { prompt: 'Find the word:\nMY',     answer: 'my',     others: ['me', 'by', 'may'] },
      { prompt: 'Find the word:\nBIG',    answer: 'big',    others: ['bag', 'pig', 'dig'] },
      { prompt: 'Find the word:\nBLUE',   answer: 'blue',   others: ['blew', 'clue', 'glue'] },
      { prompt: 'Find the word:\nCAN',    answer: 'can',    others: ['car', 'cap', 'cat'] },
      { prompt: 'Find the word:\nCOME',   answer: 'come',   others: ['came', 'some', 'home'] },
      { prompt: 'Find the word:\nDOWN',   answer: 'down',   others: ['town', 'gown', 'dawn'] },
      { prompt: 'Find the word:\nFIND',   answer: 'find',   others: ['kind', 'mind', 'fine'] },
      { prompt: 'Find the word:\nFOR',    answer: 'for',    others: ['far', 'fur', 'from'] },
      { prompt: 'Find the word:\nFUNNY',  answer: 'funny',  others: ['bunny', 'sunny', 'money'] },
      { prompt: 'Find the word:\nHELP',   answer: 'help',   others: ['held', 'helm', 'heap'] },
      { prompt: 'Find the word:\nHERE',   answer: 'here',   others: ['her', 'there', 'were'] },
      { prompt: 'Find the word:\nJUMP',   answer: 'jump',   others: ['bump', 'dump', 'pump'] },
      { prompt: 'Find the word:\nLITTLE', answer: 'little', others: ['bottle', 'battle', 'title'] },
      { prompt: 'Find the word:\nLOOK',   answer: 'look',   others: ['book', 'cook', 'took'] },
      { prompt: 'Find the word:\nMAKE',   answer: 'make',   others: ['lake', 'bake', 'cake'] },
      { prompt: 'Find the word:\nNOT',    answer: 'not',    others: ['now', 'nor', 'net'] },
      { prompt: 'Find the word:\nONE',    answer: 'one',    others: ['none', 'tone', 'bone'] },
      { prompt: 'Find the word:\nPLAY',   answer: 'play',   others: ['clay', 'pray', 'stay'] },
      { prompt: 'Find the word:\nRED',    answer: 'red',    others: ['bed', 'led', 'fed'] },
      { prompt: 'Find the word:\nRUN',    answer: 'run',    others: ['fun', 'sun', 'bun'] },
      { prompt: 'Find the word:\nSAID',   answer: 'said',   others: ['sail', 'sand', 'tail'] },
      { prompt: 'Find the word:\nTHREE',  answer: 'three',  others: ['tree', 'free', 'there'] },
      { prompt: 'Find the word:\nWHERE',  answer: 'where',  others: ['there', 'here', 'were'] },
      { prompt: 'Find the word:\nYELLOW', answer: 'yellow', others: ['fellow', 'below', 'hello'] },
      { prompt: 'Find the word:\nYOU',    answer: 'you',    others: ['your', 'yes', 'yet'] },
    ],
    'letter-sounds': [
      { prompt: 'What sound does  B  make?', answer: '/b/ — ball 🏀',   others: ['/d/ — dog 🐕',  '/p/ — pig 🐷',  '/m/ — moon 🌙'] },
      { prompt: 'What sound does  C  make?', answer: '/k/ — cat 🐱',   others: ['/s/ — sun ☀️',  '/g/ — goat 🐐', '/t/ — top 🎯'] },
      { prompt: 'What sound does  D  make?', answer: '/d/ — dog 🐕',   others: ['/b/ — ball 🏀',  '/g/ — goat 🐐', '/t/ — top 🎯'] },
      { prompt: 'What sound does  F  make?', answer: '/f/ — fish 🐟',  others: ['/v/ — van 🚐',  '/p/ — pig 🐷',  '/b/ — ball 🏀'] },
      { prompt: 'What sound does  G  make?', answer: '/g/ — goat 🐐',  others: ['/j/ — jam 🍓',  '/k/ — kite 🪁', '/d/ — dog 🐕'] },
      { prompt: 'What sound does  H  make?', answer: '/h/ — hat 🎩',   others: ['/w/ — web 🕸️', '/r/ — run 🏃',  '/n/ — nose 👃'] },
      { prompt: 'What sound does  J  make?', answer: '/j/ — jump 🏃',  others: ['/g/ — goat 🐐', '/y/ — yam 🍠',  '/ch/ — chin 👶'] },
      { prompt: 'What sound does  K  make?', answer: '/k/ — kite 🪁',  others: ['/g/ — goat 🐐', '/ch/ — chin 👶', '/t/ — top 🎯'] },
      { prompt: 'What sound does  L  make?', answer: '/l/ — lion 🦁',  others: ['/r/ — run 🏃',  '/w/ — web 🕸️', '/n/ — nose 👃'] },
      { prompt: 'What sound does  M  make?', answer: '/m/ — moon 🌙',  others: ['/n/ — nose 👃', '/b/ — ball 🏀',  '/w/ — web 🕸️'] },
      { prompt: 'What sound does  N  make?', answer: '/n/ — nose 👃',  others: ['/m/ — moon 🌙', '/d/ — dog 🐕',  '/k/ — kite 🪁'] },
      { prompt: 'What sound does  P  make?', answer: '/p/ — pig 🐷',   others: ['/b/ — ball 🏀',  '/f/ — fish 🐟', '/t/ — top 🎯'] },
      { prompt: 'What sound does  R  make?', answer: '/r/ — run 🏃',   others: ['/l/ — lion 🦁', '/w/ — web 🕸️', '/n/ — nose 👃'] },
      { prompt: 'What sound does  S  make?', answer: '/s/ — sun ☀️',   others: ['/z/ — zip 🤐',  '/sh/ — ship 🚢', '/k/ — kite 🪁'] },
      { prompt: 'What sound does  T  make?', answer: '/t/ — top 🎯',   others: ['/d/ — dog 🐕',  '/p/ — pig 🐷',  '/k/ — kite 🪁'] },
      { prompt: 'What sound does  V  make?', answer: '/v/ — van 🚐',   others: ['/f/ — fish 🐟', '/b/ — ball 🏀',  '/w/ — web 🕸️'] },
      { prompt: 'What sound does  W  make?', answer: '/w/ — web 🕸️',  others: ['/v/ — van 🚐',  '/y/ — yam 🍠',  '/h/ — hat 🎩'] },
      { prompt: 'What sound does  Y  make?', answer: '/y/ — yam 🍠',   others: ['/w/ — web 🕸️', '/j/ — jump 🏃', '/g/ — goat 🐐'] },
      { prompt: 'What sound does  Z  make?', answer: '/z/ — zip 🤐',   others: ['/s/ — sun ☀️',  '/v/ — van 🚐',  '/f/ — fish 🐟'] },
      { prompt: 'What short sound does  A  make?', answer: '/a/ — apple 🍎',  others: ['/e/ — egg 🥚',  '/i/ — itch 🦟', '/o/ — odd 🎲'] },
      { prompt: 'What short sound does  E  make?', answer: '/e/ — egg 🥚',    others: ['/a/ — apple 🍎', '/i/ — itch 🦟', '/u/ — up ⬆️'] },
      { prompt: 'What short sound does  I  make?', answer: '/i/ — itch 🦟',   others: ['/e/ — egg 🥚',  '/a/ — apple 🍎', '/u/ — up ⬆️'] },
      { prompt: 'What short sound does  O  make?', answer: '/o/ — odd 🎲',    others: ['/u/ — up ⬆️',  '/a/ — apple 🍎', '/e/ — egg 🥚'] },
      { prompt: 'What short sound does  U  make?', answer: '/u/ — up ⬆️',     others: ['/o/ — odd 🎲',  '/i/ — itch 🦟', '/e/ — egg 🥚'] },
    ],
    'word-building': [
      { prompt: 'Sound it out:\nC · A · T', answer: 'cat', others: ['bat', 'sat', 'hat'] },
      { prompt: 'Sound it out:\nD · O · G', answer: 'dog', others: ['log', 'fog', 'hog'] },
      { prompt: 'Sound it out:\nP · I · G', answer: 'pig', others: ['big', 'dig', 'wig'] },
      { prompt: 'Sound it out:\nS · U · N', answer: 'sun', others: ['run', 'fun', 'bun'] },
      { prompt: 'Sound it out:\nH · E · N', answer: 'hen', others: ['ten', 'pen', 'den'] },
      { prompt: 'Sound it out:\nB · U · G', answer: 'bug', others: ['hug', 'mug', 'rug'] },
      { prompt: 'Sound it out:\nH · O · T', answer: 'hot', others: ['dot', 'pot', 'lot'] },
      { prompt: 'Sound it out:\nB · E · D', answer: 'bed', others: ['red', 'led', 'fed'] },
      { prompt: 'Sound it out:\nM · A · P', answer: 'map', others: ['cap', 'lap', 'tap'] },
      { prompt: 'Sound it out:\nC · U · P', answer: 'cup', others: ['pup', 'cut', 'cub'] },
      { prompt: 'Sound it out:\nT · U · B', answer: 'tub', others: ['hub', 'rub', 'tab'] },
      { prompt: 'Sound it out:\nJ · A · M', answer: 'jam', others: ['ham', 'ram', 'yam'] },
      { prompt: 'Sound it out:\nS · I · T', answer: 'sit', others: ['bit', 'hit', 'kit'] },
      { prompt: 'Sound it out:\nN · A · P', answer: 'nap', others: ['cap', 'lap', 'sap'] },
      { prompt: 'Sound it out:\nW · I · N', answer: 'win', others: ['bin', 'pin', 'fin'] },
      { prompt: 'Sound it out:\nG · O · T', answer: 'got', others: ['hot', 'dot', 'pot'] },
      { prompt: 'Sound it out:\nP · E · T', answer: 'pet', others: ['bet', 'jet', 'net'] },
      { prompt: 'Sound it out:\nH · I · T', answer: 'hit', others: ['bit', 'sit', 'kit'] },
      { prompt: 'Sound it out:\nM · U · D', answer: 'mud', others: ['bud', 'bug', 'bus'] },
      { prompt: 'Sound it out:\nF · A · N', answer: 'fan', others: ['can', 'man', 'pan'] },
    ],
  },
  grade3: {
    'vocabulary': [
      { prompt: 'What does "enormous" mean?',    answer: 'Very large',                        others: ['Very small', 'Very loud', 'Very fast'] },
      { prompt: 'What does "ancient" mean?',     answer: 'Very old',                          others: ['Very young', 'Very tall', 'Very cold'] },
      { prompt: 'What does "curious" mean?',     answer: 'Wanting to know or learn',          others: ['Very tired', 'Very angry', 'Very hungry'] },
      { prompt: 'What does "brave" mean?',       answer: 'Not afraid to face danger',         others: ['Very shy and quiet', 'Very fast and clever', 'Unable to move'] },
      { prompt: 'What does "patient" mean?',     answer: 'Able to wait calmly',               others: ['Moving very quickly', 'Very loud and silly', 'Always feeling sad'] },
      { prompt: 'What does "gentle" mean?',      answer: 'Soft and careful',                  others: ['Loud and rough', 'Dark and scary', 'Big and heavy'] },
      { prompt: 'What does "discover" mean?',    answer: 'To find something for the first time', others: ['To break something apart', 'To eat something quickly', 'To sleep for a long time'] },
      { prompt: 'What does "celebrate" mean?',   answer: 'To do something fun for a special event', others: ['To feel very sad', 'To rest and be still', 'To run very far'] },
      { prompt: 'What does "harvest" mean?',     answer: 'To gather crops from a farm',       others: ['To plant seeds in spring', 'To fly through the clouds', 'To swim in the ocean'] },
      { prompt: 'What does "whisper" mean?',     answer: 'To speak very quietly',             others: ['To sing very loudly', 'To run very fast', 'To jump very high'] },
      { prompt: 'What does "predict" mean?',     answer: 'To say what will happen before it does', others: ['To remember the past clearly', 'To draw a picture', 'To ask a question'] },
      { prompt: 'What does "protect" mean?',     answer: 'To keep something safe from harm',  others: ['To make something bigger', 'To break something apart', 'To move something far away'] },
      { prompt: 'What does "solution" mean?',    answer: 'The answer to a problem',           others: ['A type of weather', 'A kind of food', 'A place to sleep'] },
      { prompt: 'What does "migrate" mean?',     answer: 'To move from one place to another', others: ['To build a new home', 'To eat a lot of food', 'To sleep all winter'] },
      { prompt: 'What does "habitat" mean?',     answer: 'The natural home of an animal',     others: ['What an animal eats', 'The color of an animal', 'How fast an animal runs'] },
      { prompt: 'What does "observe" mean?',     answer: 'To watch carefully and pay attention', others: ['To run as fast as you can', 'To eat slowly', 'To sleep without moving'] },
      { prompt: 'What does "imagine" mean?',     answer: 'To picture something in your mind', others: ['To write something down', 'To throw something far', 'To count things carefully'] },
      { prompt: 'What does "exhausted" mean?',   answer: 'Very, very tired',                  others: ['Very, very happy', 'Very, very cold', 'Very, very full'] },
      { prompt: 'What does "generous" mean?',    answer: 'Happy to share and give to others', others: ['Always taking from others', 'Never talking to anyone', 'Sleeping most of the time'] },
      { prompt: 'What does "persevere" mean?',   answer: 'To keep trying even when it is hard', others: ['To give up quickly', 'To ask for help right away', 'To rest when tired'] },
      { prompt: 'What does "unique" mean?',      answer: 'One of a kind; unlike anything else', others: ['Exactly the same as others', 'Very old and worn out', 'Very big and heavy'] },
      { prompt: 'What does "evidence" mean?',    answer: 'Facts that help prove something is true', others: ['A type of story', 'A kind of animal', 'A weather event'] },
      { prompt: 'What does "summarize" mean?',   answer: 'To tell the main ideas in a short way', others: ['To retell every single detail', 'To make something longer', 'To ask many questions'] },
      { prompt: 'What does "compare" mean?',     answer: 'To look at how things are alike and different', others: ['To count how many things there are', 'To put things in size order', 'To name all the parts of something'] },
      { prompt: 'What does "determined" mean?',  answer: 'Very focused on reaching a goal',   others: ['Very easy to give up', 'Very confused and lost', 'Very tired and slow'] },
    ],
    'spelling': [
      { prompt: 'Which word is spelled correctly?', answer: 'because',   others: ['becuase',   'becawse',    'becaus'] },
      { prompt: 'Which word is spelled correctly?', answer: 'friend',    others: ['freind',    'frend',      'friand'] },
      { prompt: 'Which word is spelled correctly?', answer: 'different', others: ['diferent',  'diffrent',   'diferrant'] },
      { prompt: 'Which word is spelled correctly?', answer: 'beautiful', others: ['beatiful',  'beutiful',   'beautifull'] },
      { prompt: 'Which word is spelled correctly?', answer: 'people',    others: ['pepole',    'peaple',     'poeple'] },
      { prompt: 'Which word is spelled correctly?', answer: 'would',     others: ['woud',      'whould',     'wuld'] },
      { prompt: 'Which word is spelled correctly?', answer: 'thought',   others: ['thot',      'thaut',      'thougt'] },
      { prompt: 'Which word is spelled correctly?', answer: 'enough',    others: ['enuf',      'enuph',      'enaugh'] },
      { prompt: 'Which word is spelled correctly?', answer: 'surprise',  others: ['suprise',   'surprize',   'sirprise'] },
      { prompt: 'Which word is spelled correctly?', answer: 'special',   others: ['speshal',   'speciel',    'specel'] },
      { prompt: 'Which word is spelled correctly?', answer: 'together',  others: ['togather',  'togeather',  'togeter'] },
      { prompt: 'Which word is spelled correctly?', answer: 'usually',   others: ['usally',    'usualy',     'yousually'] },
      { prompt: 'Which word is spelled correctly?', answer: 'probably',  others: ['probaly',   'probibly',   'probbably'] },
      { prompt: 'Which word is spelled correctly?', answer: 'important', others: ['importent', 'inportant',  'importint'] },
      { prompt: 'Which word is spelled correctly?', answer: 'something', others: ['sumthing',  'somthing',   'somethng'] },
      { prompt: 'Which word is spelled correctly?', answer: 'favorite',  others: ['favrite',   'favorit',    'faviorite'] },
      { prompt: 'Which word is spelled correctly?', answer: 'library',   others: ['liberry',   'libary',     'liebrary'] },
      { prompt: 'Which word is spelled correctly?', answer: 'February',  others: ['Febuary',   'Feburary',   'Febreaury'] },
      { prompt: 'Which word is spelled correctly?', answer: 'Wednesday', others: ['Wensday',   'Wendsday',   'Wednsday'] },
      { prompt: 'Which word is spelled correctly?', answer: 'family',    others: ['famaly',    'fammily',    'famly'] },
      { prompt: 'Which word is spelled correctly?', answer: 'animal',    others: ['animle',    'animmal',    'anmial'] },
      { prompt: 'Which word is spelled correctly?', answer: 'practice',  others: ['practise',  'practace',   'practis'] },
      { prompt: 'Which word is spelled correctly?', answer: 'adventure', others: ['advenchure','adventur',   'advenshure'] },
      { prompt: 'Which word is spelled correctly?', answer: 'already',   others: ['allready',  'alredy',     'allredy'] },
      { prompt: 'Which word is spelled correctly?', answer: 'building',  others: ['bulding',   'buildding',  'buiding'] },
    ],
    'grammar': [
      { prompt: 'Which word is a NOUN?\n(A noun is a person, place, or thing)', answer: 'mountain', others: ['tall', 'climb', 'quickly'] },
      { prompt: 'Which word is a VERB?\n(A verb is an action word)',             answer: 'jumped',   others: ['rabbit', 'happy', 'slowly'] },
      { prompt: 'Which word is an ADJECTIVE?\n(An adjective describes a noun)',  answer: 'colorful', others: ['butterfly', 'flew', 'gently'] },
      { prompt: 'Which word is an ADVERB?\n(An adverb describes a verb)',        answer: 'gently',   others: ['flower', 'bright', 'bird'] },
      { prompt: '"Yesterday, we ___ to the park."\nChoose the correct verb:',    answer: 'went',         others: ['go', 'will go', 'going'] },
      { prompt: '"Right now, she ___ her book."\nChoose the correct verb:',      answer: 'is reading',   others: ['read', 'will read', 'reads tomorrow'] },
      { prompt: '"Tomorrow, he ___ his friend."\nChoose the correct verb:',      answer: 'will call',    others: ['called', 'was calling', 'calls yesterday'] },
      { prompt: 'What is the correct PLURAL of "mouse"?',  answer: 'mice',     others: ['mouses',   'mouse',    'meese'] },
      { prompt: 'What is the correct PLURAL of "child"?',  answer: 'children', others: ['childs',   'childen',  'childrens'] },
      { prompt: 'What is the correct PLURAL of "goose"?',  answer: 'geese',    others: ['gooses',   'goose',    'goosen'] },
      { prompt: 'What is the correct PLURAL of "foot"?',   answer: 'feet',     others: ['foots',    'foot',     'footses'] },
      { prompt: 'Which sentence is written CORRECTLY?', answer: 'We live in Boise, Idaho.', others: ['we live in boise, idaho.', 'We live in boise, Idaho.', 'We Live In Boise, Idaho.'] },
      { prompt: 'Which sentence is written CORRECTLY?', answer: 'My birthday is in January.', others: ['My birthday is in january.', 'my birthday is in January.', 'My Birthday is in january.'] },
      { prompt: 'Which sentence needs a QUESTION MARK?',         answer: 'Where did you put my shoes', others: ['I love pizza', 'She runs every day', 'The cat sat on the mat'] },
      { prompt: 'Which sentence should end with an EXCLAMATION MARK?', answer: 'Watch out for that bee', others: ['The library opens at nine', 'She has a blue backpack', 'We went to the store'] },
      { prompt: 'Which pronoun can replace "Maria and Carlos"?', answer: 'They', others: ['We', 'Them', 'He'] },
      { prompt: 'Which pronoun can replace "the big book"?',     answer: 'it',   others: ['they', 'he', 'she'] },
      { prompt: '"The dogs ___ very loud."\nChoose the correct verb:',        answer: 'are',  others: ['is', 'was', 'am'] },
      { prompt: '"She ___ her vegetables every night."\nChoose the correct verb:', answer: 'eats', others: ['eat', 'eating', 'eaten'] },
      { prompt: 'Which of these is a COMPLETE SENTENCE?', answer: 'The cat jumped over the fence.', others: ['jumped over the fence', 'The big fluffy cat', 'When the cat jumped'] },
      { prompt: 'What is the SUBJECT of:\n"The little puppy ran fast."', answer: 'puppy',  others: ['ran', 'fast', 'little'] },
      { prompt: 'What is the VERB in:\n"My sister baked cookies yesterday."', answer: 'baked', others: ['sister', 'cookies', 'yesterday'] },
      { prompt: 'Which is a PROPER NOUN?', answer: 'Idaho',   others: ['mountain', 'river', 'school'] },
      { prompt: 'What punctuation ends a QUESTION?', answer: '?', others: ['.', '!', ','] },
      { prompt: 'What punctuation ends a STATEMENT?', answer: '.', others: ['?', '!', ','] },
    ],
  },
};

// ── Reading game state ────────────────────────
const R = {
  cat: 'sight-words',
  sessionQ: 0, sessionCorrect: 0, sessionCoins: 0,
  streak: 0,
  missedQuestions: [],
  qPool: [],
  answered: false,
};

// ── Shuffle array (Fisher-Yates) ──────────────
function shuffleArr(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ── Build question pool (10 questions) ────────
function buildReadPool(grade, cat) {
  const nonMixed = READ_CATS[grade].availableCats.filter(c => c !== 'mixed');
  if (cat !== 'mixed') {
    return shuffleArr(READ_QUESTIONS[grade][cat]).slice(0, 10);
  }
  // Mixed: sample roughly evenly from all categories
  const pool = [];
  const perCat = Math.ceil(10 / nonMixed.length);
  nonMixed.forEach(c => pool.push(...shuffleArr(READ_QUESTIONS[grade][c]).slice(0, perCat)));
  return shuffleArr(pool).slice(0, 10);
}

// ── Init reading game ─────────────────────────
function initReadGame(data) {
  const p = getActiveProfile();
  if (!p) { nav('profiles'); return; }
  if (data.resumeCat) R.cat = data.resumeCat;
  const cfg = READ_CATS[p.grade];
  if (!cfg.availableCats.includes(R.cat)) R.cat = cfg.availableCats[0];

  R.sessionQ = 0; R.sessionCorrect = 0; R.sessionCoins = 0;
  R.streak = 0; R.answered = false; R.missedQuestions = [];
  R.qPool = buildReadPool(p.grade, R.cat);

  renderReadGame();
  showReadQuestion();
}

// ── Render game shell ─────────────────────────
function renderReadGame() {
  const p   = getActiveProfile();
  const cfg = READ_CATS[p.grade];
  const opKey = R.cat === 'mixed' ? 'read-mixed' : R.cat;

  document.getElementById('screen-read-game').innerHTML = `
    <div class="quest-game-page">
      <div class="quest-top-bar">
        <button class="back-btn" onclick="nav('quest-select')">← Quests</button>
        <span class="quest-coin-hint">2 🪙 per correct answer</span>
      </div>

      <div class="session-bar">
        <span class="session-label" id="read-sess-label">Question 1 / 10</span>
        <div class="session-progress"><div class="session-progress-fill" id="read-sess-fill" style="width:0%"></div></div>
        <span class="session-coins" id="read-sess-coins">🪙 0</span>
      </div>

      <div class="op-tabs" role="group">
        ${cfg.availableCats.map(cat => {
          const opK = cat === 'mixed' ? 'read-mixed' : cat;
          return `<button class="op-tab ${R.cat === cat ? 'active' : ''}" data-cat="${opK}"
            onclick="selectReadCat('${cat}')">${cfg.labels[cat]}</button>`;
        }).join('')}
      </div>

      <div class="streak-banner" id="read-streak-banner" style="display:none">
        🔥 <span id="read-streak-count">3</span> in a row!
      </div>

      <div class="card">
        <div class="critter-wrap">
          <div class="critter" id="read-critter">${p.themeCreatures[p.theme]}</div>
        </div>
        <div class="read-prompt" id="read-prompt"></div>
        <div class="read-choices" id="read-choices"></div>
        <div class="feedback" id="read-feedback"></div>
        <button class="next-btn" id="read-next-btn" style="display:none" onclick="nextReadQuestion()">Next →</button>
      </div>

      <div class="score-display">
        <span>✅ <span class="score-num" id="read-score-correct">0</span></span>
        <span style="color:#CBD5E1">/</span>
        <span><span class="score-num" id="read-score-total">0</span> answered</span>
      </div>
    </div>`;

  applyTheme(p.theme, opKey);
}

// ── Show current question ─────────────────────
function showReadQuestion() {
  const q = R.qPool[R.sessionQ];
  if (!q) return;
  R.answered = false;

  const choices = shuffleArr([q.answer, ...q.others]);
  document.getElementById('read-prompt').textContent = q.prompt;
  document.getElementById('read-choices').innerHTML = choices.map(c =>
    `<button class="read-choice-btn" onclick="answerReadQuestion(${JSON.stringify(c)})">${esc(c)}</button>`
  ).join('');
  document.getElementById('read-feedback').textContent = '';
  document.getElementById('read-feedback').className = 'feedback';
  const nb = document.getElementById('read-next-btn');
  if (nb) { nb.style.display = 'none'; nb.textContent = 'Next →'; nb.onclick = nextReadQuestion; }
}

// ── Category tab switch ───────────────────────
function selectReadCat(cat) {
  R.cat = cat;
  R.streak = 0;
  const p = getActiveProfile();
  R.qPool = buildReadPool(p.grade, cat);
  const opKey = cat === 'mixed' ? 'read-mixed' : cat;
  document.querySelectorAll('#screen-read-game .op-tab').forEach(b =>
    b.classList.toggle('active', b.dataset.cat === opKey));
  applyTheme(p.theme, opKey);
  const banner = document.getElementById('read-streak-banner');
  if (banner) banner.style.display = 'none';
  showReadQuestion();
}

// ── Handle answer ─────────────────────────────
function answerReadQuestion(choice) {
  if (R.answered) return;
  R.answered = true;
  const q = R.qPool[R.sessionQ];
  const correct = choice === q.answer;

  document.querySelectorAll('.read-choice-btn').forEach(btn => {
    btn.disabled = true;
    if (btn.textContent === q.answer) btn.classList.add('correct');
    else if (btn.textContent === choice && !correct) btn.classList.add('wrong');
  });

  const fb = document.getElementById('read-feedback');
  const crEl = document.getElementById('read-critter');
  function readAnim(cls) { if (!crEl) return; crEl.classList.remove('bounce','shake'); void crEl.offsetWidth; crEl.classList.add(cls); }

  if (correct) {
    R.streak++; R.sessionCorrect++; R.sessionCoins += 2;
    fb.textContent = CORRECT_MSGS[rand(0, CORRECT_MSGS.length - 1)];
    fb.className = 'feedback correct';
    readAnim('bounce');
  } else {
    R.streak = 0;
    fb.textContent = 'Not quite! The answer is: ' + q.answer;
    fb.className = 'feedback wrong';
    readAnim('shake');
    R.missedQuestions.push({ prompt: q.prompt, answer: q.answer });
  }

  R.sessionQ++;

  // Streak banner
  const banner = document.getElementById('read-streak-banner');
  if (banner) {
    banner.style.display = R.streak >= 3 ? 'flex' : 'none';
    const sc = document.getElementById('read-streak-count');
    if (sc && R.streak >= 3) sc.textContent = R.streak;
  }

  // Session bar & score
  const fill  = document.getElementById('read-sess-fill');
  const label = document.getElementById('read-sess-label');
  const coins = document.getElementById('read-sess-coins');
  const q2 = Math.min(R.sessionQ, 10);
  if (fill)  fill.style.width = (q2 / 10 * 100) + '%';
  if (label) label.textContent = `Question ${q2} / 10`;
  if (coins) coins.textContent = `🪙 ${R.sessionCoins}`;
  const sc2 = document.getElementById('read-score-correct');
  const st2 = document.getElementById('read-score-total');
  if (sc2) sc2.textContent = R.sessionCorrect;
  if (st2) st2.textContent = R.sessionQ;

  const nb = document.getElementById('read-next-btn');
  if (nb) {
    nb.style.display = 'block';
    if (R.sessionQ >= 10) { nb.textContent = '🎉 See Results!'; nb.onclick = finishReadSession; }
    else { nb.textContent = 'Next →'; nb.onclick = nextReadQuestion; }
  }
}

// ── Advance to next question ──────────────────
function nextReadQuestion() {
  if (R.sessionQ >= 10) { finishReadSession(); return; }
  showReadQuestion();
}

// ── End reading session ───────────────────────
async function finishReadSession() {
  const p = getActiveProfile();
  await addCoins(p.id, R.sessionCoins, 'Reading quest coins');
  const card = drawCard(p.theme);
  await addCard(p.id, card);
  await updateStats(p.id, R.sessionCorrect, R.sessionQ, R.streak);
  nav('quest-done', {
    subject:        'reading',
    correct:        R.sessionCorrect,
    total:          R.sessionQ,
    coins:          R.sessionCoins,
    card,
    resumeCat:      R.cat,
    missedProblems: [],
    missedQuestions: R.missedQuestions.slice(0, 5),
  });
}

// ── Init ──────────────────────────────────────
nav('profiles');
