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
    sessionLimit: 3,
    generate: {
      addition()    { const a = rand(1,9), b = rand(1,10-a);                                          return { a, b, answer: a+b }; },
      subtraction() { const a = rand(2,10), b = rand(1,a);                                            return { a, b, answer: a-b }; },
    },
  },
  grade1: {
    availableOps: ['addition', 'subtraction', 'mixed'],
    sessionLimit: 3,
    generate: {
      addition()    { const a = rand(1,9), b = rand(1, Math.min(9, 20-a));                            return { a, b, answer: a+b }; },
      subtraction() { const a = rand(2,20), b = rand(1,a);                                            return { a, b, answer: a-b }; },
    },
  },
  grade2: {
    availableOps: ['addition', 'subtraction', 'mixed'],
    sessionLimit: 3,
    generate: {
      addition()    { const a = rand(10,99), b = rand(1, Math.min(99, 100-a));                        return { a, b, answer: a+b }; },
      subtraction() { let a, b; do { a = rand(11,99); b = rand(1,a-1); } while (requiresRegrouping(a,b)); return { a, b, answer: a-b }; },
    },
  },
  grade3: {
    availableOps: ['addition', 'subtraction', 'multiplication', 'division', 'mixed'],
    sessionLimit: 2,
    generate: {
      addition()       { const a = rand(10,500), b = rand(10,499);                                    return { a, b, answer: a+b }; },
      subtraction()    { let a, b; do { a = rand(20,999); b = rand(1,a); } while (requiresRegrouping(a,b)); return { a, b, answer: a-b }; },
      multiplication() { const a = rand(1,12),   b = rand(1,12);                                      return { a, b, answer: a*b }; },
      division()       { const d=rand(1,10), q=rand(1,12);                                            return { a:d*q, b:d, answer:q }; },
    },
  },
  grade4: {
    availableOps: ['addition', 'subtraction', 'multiplication', 'division', 'mixed'],
    sessionLimit: 2,
    generate: {
      addition()       { const a = rand(100,500), b = rand(100,499);                                  return { a, b, answer: a+b }; },
      subtraction()    { let a, b; do { a = rand(100,999); b = rand(10,a-10); } while (requiresRegrouping(a,b)); return { a, b, answer: a-b }; },
      multiplication() { const a = rand(10,99), b = rand(2,9);                                        return { a, b, answer: a*b }; },
      division()       { const d=rand(2,9), q=rand(10,99);                                            return { a:d*q, b:d, answer:q }; },
    },
  },
  grade5: {
    availableOps: ['addition', 'subtraction', 'multiplication', 'division', 'mixed'],
    sessionLimit: 2,
    generate: {
      addition()       { const a = rand(100,999), b = rand(100,899);                                  return { a, b, answer: a+b }; },
      subtraction()    { let a, b; do { a = rand(200,999); b = rand(10,a-10); } while (requiresRegrouping(a,b)); return { a, b, answer: a-b }; },
      multiplication() { const a = rand(10,99), b = rand(2,12);                                       return { a, b, answer: a*b }; },
      division()       { const d=rand(2,12), q=rand(10,99);                                           return { a:d*q, b:d, answer:q }; },
    },
  },
  grade6: {
    availableOps: ['addition', 'subtraction', 'multiplication', 'division', 'mixed'],
    sessionLimit: 2,
    generate: {
      addition()       { const a = rand(-50,50), b = rand(-50,50);                                    return { a, b, answer: a+b }; },
      subtraction()    { const a = rand(-50,50), b = rand(-50,50);                                    return { a, b, answer: a-b }; },
      multiplication() { const a = rand(-12,12), b = rand(-12,12);                                    return { a, b, answer: a*b }; },
      division()       { const s=rand(0,1)?1:-1, d=rand(2,9)*s, q=rand(2,12);                        return { a:d*q, b:d, answer:q }; },
    },
  },
};

// ── Grade display helpers ──────────────────────
const GRADE_LABELS = {
  kindergarten: 'Kindergarten ⭐',
  grade1: '1st Grade 🌟',
  grade2: '2nd Grade 🌈',
  grade3: '3rd Grade 🚀',
  grade4: '4th Grade ⚡',
  grade5: '5th Grade 🔥',
  grade6: '6th Grade 💎',
};

const GRADE_OPTIONS = [
  { key: 'kindergarten', emoji: '⭐', name: 'Kindergarten', sub: 'Add &amp; Subtract within 10' },
  { key: 'grade1',       emoji: '🌟', name: '1st Grade',    sub: 'Add &amp; Subtract within 20' },
  { key: 'grade2',       emoji: '🌈', name: '2nd Grade',    sub: 'Add &amp; Subtract within 100' },
  { key: 'grade3',       emoji: '🚀', name: '3rd Grade',    sub: 'All four operations' },
  { key: 'grade4',       emoji: '⚡', name: '4th Grade',    sub: 'Multi-digit &amp; division' },
  { key: 'grade5',       emoji: '🔥', name: '5th Grade',    sub: 'Larger numbers &amp; all ops' },
  { key: 'grade6',       emoji: '💎', name: '6th Grade',    sub: 'Integers &amp; expressions' },
];

const OPS = {
  addition:       { symbol: '+', accent: '#22C55E', accentLight: '#DCFCE7' },
  subtraction:    { symbol: '−', accent: '#3B82F6', accentLight: '#DBEAFE' },
  multiplication: { symbol: '×', accent: '#F97316', accentLight: '#FFEDD5' },
  division:       { symbol: '÷', accent: '#A855F7', accentLight: '#F3E8FF' },
  mixed:          { symbol: '?', accent: '#EC4899', accentLight: '#FCE7F3' },
  // Reading categories
  'sight-words':       { symbol: '📖', accent: '#8B5CF6', accentLight: '#EDE9FE' },
  'letter-sounds':     { symbol: '🔤', accent: '#0EA5E9', accentLight: '#E0F2FE' },
  'word-building':     { symbol: '🔨', accent: '#F97316', accentLight: '#FFEDD5' },
  'phonics':           { symbol: '🔡', accent: '#14B8A6', accentLight: '#CCFBF1' },
  'word-families':     { symbol: '🔗', accent: '#F43F5E', accentLight: '#FFE4E6' },
  'vowel-teams':       { symbol: '🗣️', accent: '#6366F1', accentLight: '#EEF2FF' },
  'prefixes-suffixes': { symbol: '🧩', accent: '#D946EF', accentLight: '#FAE8FF' },
  'vocabulary':        { symbol: '📚', accent: '#10B981', accentLight: '#D1FAE5' },
  'spelling':          { symbol: '✏️', accent: '#06B6D4', accentLight: '#CFFAFE' },
  'grammar':           { symbol: '📝', accent: '#F59E0B', accentLight: '#FEF3C7' },
  'read-mixed':        { symbol: '🎲', accent: '#EC4899', accentLight: '#FCE7F3' },
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

  const homeBtn = document.getElementById('hdr-dashboard');
  if (homeBtn) homeBtn.disabled = (screenId === 'dashboard');

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
document.getElementById('hdr-feedback').addEventListener('click', showFeedbackModal);

// ── Profiles screen ───────────────────────────
function renderProfiles() {
  const profiles = getProfiles();
  document.getElementById('screen-profiles').innerHTML = `
    <div class="profiles-page">
      <img src="logo.png" class="logo-img" alt="Critter Quest">
      <p class="page-subtitle">Who's ready to learn today?</p>
      <div class="profile-grid">
        ${profiles.map(p => `
          <div class="profile-card" onclick="selectProfile('${p.id}')">
            <button class="pc-edit-btn" onclick="event.stopPropagation(); nav('profile-form', {editId:'${p.id}'})">✏️</button>
            <div class="pc-critter">${p.themeCreatures[p.theme] || '🐾'}</div>
            <div class="pc-name">${esc(p.name)}</div>
            <div class="pc-grade">${GRADE_LABELS[p.grade] || 'Student'}</div>
            <div class="pc-theme">${THEMES[p.theme].icon} ${THEMES[p.theme].name}</div>
            ${(p.loginStreak || 0) >= 2 ? `<div class="pc-streak">🔥 ${p.loginStreak}-day streak</div>` : ''}
          </div>
        `).join('')}
        <button class="profile-card add-profile" onclick="nav('profile-form',{})">
          <div class="pc-critter">➕</div>
          <div class="pc-name">Add Profile</div>
        </button>
      </div>
      <button class="parent-store-btn" onclick="promptParentPin({screen:'store-admin',data:{backTo:'profiles'}})">⚙️ Parent Store</button>
    </div>`;
  // Show What's New popup on first ever visit
  if (!localStorage.getItem('cq_whats_new_seen_v1')) {
    setTimeout(showWhatsNewModal, 300);
  }
}

async function selectProfile(id) {
  setActiveProfile(id);
  const p = getProfile(id);
  G.op = 'addition';
  applyTheme(p.theme, 'addition');

  const result = await checkDailyLogin(id);
  if (result && result.isNewDay) {
    showLoginStreakModal(result, p);
  } else {
    nav('dashboard');
  }
}

function showLoginStreakModal(result, profile) {
  const { newStreak, wasGrace, milestoneCard } = result;
  const RARITY_BG = { common:'#64748B', uncommon:'#16A34A', rare:'#2563EB', epic:'#9333EA', legendary:'#D97706' };

  let streakMsg = wasGrace
    ? `<p style="color:#F97316;font-weight:700;font-size:0.9rem;margin:0">⚠️ You almost lost it — don't miss tomorrow!</p>`
    : `<p style="color:#64748B;font-size:0.85rem;margin:0">Keep it up!</p>`;

  let milestoneHtml = '';
  if (milestoneCard) {
    const col = RARITY_BG[milestoneCard.rarity] || '#64748B';
    milestoneHtml = `
      <div style="margin:12px 0;padding:12px;background:#F8FAFC;border-radius:12px;border:2px solid ${col}">
        <div style="font-size:0.75rem;font-weight:700;color:${col};text-transform:uppercase;letter-spacing:.05em">Milestone Bonus!</div>
        <div style="font-size:2rem;margin:4px 0">${milestoneCard.emoji}</div>
        <div style="font-weight:800;color:#1E293B">${esc(milestoneCard.name)}</div>
        <div style="font-size:0.7rem;font-weight:700;color:${col}">${milestoneCard.rarity.toUpperCase()}</div>
      </div>`;
  }

  showModal(`
    <div style="text-align:center;padding:8px 0">
      <div style="font-size:3rem;line-height:1">🔥</div>
      <div style="font-size:2rem;font-weight:900;color:#1E293B;margin:6px 0">${newStreak}-Day Streak!</div>
      <div style="font-size:0.9rem;color:#64748B;margin-bottom:4px">+2 coins added to your bank</div>
      ${streakMsg}
      ${milestoneHtml}
      <button class="btn-primary" style="margin-top:16px;width:100%" onclick="closeModal();nav('dashboard')">Let's Go! 🚀</button>
    </div>
  `);
}

function closeStreakModal() {
  closeModal();
  nav('dashboard');
}

// ── What's New modal (shown once on first visit) ──────────────────────────
const WHATS_NEW_ITEMS = [
  { icon: '🔥', title: 'Daily Login Streaks',  desc: 'Log in every day to earn 2 bonus coins. Hit 7, 14, or 30 days in a row for a rare card reward!' },
  { icon: '🃏', title: 'Card Wall',             desc: 'Hang your favorite cards on your dashboard wall — pick up to 4 cards to show off!' },
  { icon: '📊', title: 'Stats Panel',           desc: 'Your best streak, total correct answers, and sessions completed are now on your home screen.' },
  { icon: '🎨', title: 'Fresh New Look',        desc: 'Critter Quest has a brand-new logo and polished design across every screen.' },
  { icon: '📧', title: 'Contact Us',            desc: 'Questions or feedback? Reach us anytime at contact@critterquest.org.' },
];

function showWhatsNewModal() {
  const itemsHtml = WHATS_NEW_ITEMS.map(it => `
    <div class="wn-item">
      <div class="wn-icon">${it.icon}</div>
      <div class="wn-text">
        <div class="wn-title">${esc(it.title)}</div>
        <div class="wn-desc">${esc(it.desc)}</div>
      </div>
    </div>
  `).join('');

  showModal(`
    <div class="wn-modal">
      <div class="wn-header">
        <div class="wn-star">⭐</div>
        <div class="wn-headline">What's New in Critter Quest!</div>
        <div class="wn-sub">Here's what we've been building for you</div>
      </div>
      <div class="wn-list">${itemsHtml}</div>
      <button class="btn-primary" style="width:100%;margin-top:8px" onclick="dismissWhatsNew()">Let's Play! 🚀</button>
    </div>
  `);
}

function dismissWhatsNew() {
  localStorage.setItem('cq_whats_new_seen_v1', '1');
  closeModal();
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
          ${GRADE_OPTIONS.map(g => `
            <button class="grade-btn ${_pfGrade===g.key?'active':''}" data-grade="${g.key}" onclick="pfGrade('${g.key}')">
              <span class="grade-emoji">${g.emoji}</span>
              <span class="grade-name">${g.name}</span>
              <span class="grade-sub">${g.sub}</span>
            </button>`).join('')}
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
    b.classList.toggle('active', b.dataset.grade === g));
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
    logCQ('profile_created', { grade: _pfGrade, theme: _pfTheme });
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
const THEME_WALL_DECOS = {
  forest: ['🌲','🍃','🌿','🐿️','🍄','🌲','🍃','🌿'],
  ocean:  ['🌊','🐚','⭐','🪸','🐠','🌊','🐚','⭐'],
  farm:   ['🌾','🌻','🐣','🍀','🌼','🌾','🌻','🐣'],
  jungle: ['🌴','🌿','🦋','🍃','🌺','🌴','🌿','🦋'],
  arctic: ['❄️','⛄','✨','🌨️','💎','❄️','⛄','✨'],
};

function renderDashboard() {
  const p = getActiveProfile();
  if (!p) { nav('profiles'); return; }
  const storeCount = getStore().length;
  const wallCards  = p.wallCards || [null, null, null, null];
  const decos      = THEME_WALL_DECOS[p.theme] || [];

  // Build wall card slots
  const wallSlotsHtml = wallCards.map((cardId, i) => {
    const card = cardId ? p.inventory.find(c => c.id === cardId) : null;
    if (card) {
      const col = RARITY_COLORS[card.rarity] || '#64748B';
      return `<div class="wall-slot filled" style="border-color:${col}" onclick="openWallCardPicker(${i})">
        <div class="ws-emoji">${card.emoji}</div>
        <div class="ws-name">${esc(card.name)}</div>
        <div class="ws-rarity" style="color:${col}">${card.rarity}</div>
      </div>`;
    }
    return `<div class="wall-slot empty" onclick="openWallCardPicker(${i})">
      <div class="ws-plus">＋</div>
      <div class="ws-hint">Add a card</div>
    </div>`;
  }).join('');

  // Build decorative background emojis
  const decoHtml = decos.map((e, i) =>
    `<span class="wall-deco-item" style="--di:${i}">${e}</span>`
  ).join('');

  document.getElementById('screen-dashboard').innerHTML = `
    <div class="dash-layout">

      <!-- Left: card wall -->
      <aside class="dash-wall" data-theme="${p.theme}">
        <div class="wall-decos">${decoHtml}</div>
        <div class="wall-inner">
          <div class="wall-title">🎨 My Wall</div>
          <div class="wall-slots">${wallSlotsHtml}</div>
        </div>
      </aside>

      <!-- Center: main content -->
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
          <button class="dash-card wide" onclick="nav('journey')">
            ${(() => {
              const j = (p.journeys && p.journeys[p.theme]) || { chapter: 1, stopsCompleted: 0 };
              return `<div class="dc-icon">🗺️</div>
              <div class="dc-label">Journey</div>
              <div class="dc-sub">Chapter ${j.chapter} · Stop ${j.stopsCompleted}/10</div>`;
            })()}
          </button>
        </div>
        <button class="text-btn" onclick="nav('profiles')">👥 Switch Profile</button>
      </div>

      <!-- Right: stats -->
      <aside class="dash-stats">
        <div class="stats-title">📊 My Stats</div>
        <div class="stat-row"><span class="stat-icon">🔥</span><span class="stat-val">${p.loginStreak || 0}</span><span class="stat-lbl">day streak</span></div>
        <div class="stat-row"><span class="stat-icon">⚔️</span><span class="stat-val">${p.stats.sessionsCompleted}</span><span class="stat-lbl">quests done</span></div>
        <div class="stat-row"><span class="stat-icon">✅</span><span class="stat-val">${p.stats.totalCorrect}</span><span class="stat-lbl">correct</span></div>
        <div class="stat-row"><span class="stat-icon">⭐</span><span class="stat-val">${p.stats.bestStreak}</span><span class="stat-lbl">best streak</span></div>
        <div class="stat-row"><span class="stat-icon">🪙</span><span class="stat-val">${p.coins}</span><span class="stat-lbl">coins</span></div>
      </aside>

    </div>`;
}

// ── Wall card picker ───────────────────────────
function openWallCardPicker(slotIndex) {
  const p = getActiveProfile();
  const wallCards = p.wallCards || [null, null, null, null];
  const currentId = wallCards[slotIndex];
  const current   = currentId ? p.inventory.find(c => c.id === currentId) : null;

  // If slot is filled, show swap/remove options first
  if (current) {
    const col = RARITY_COLORS[current.rarity] || '#64748B';
    showModal(`
      <div style="text-align:center">
        <div style="font-size:3rem">${current.emoji}</div>
        <div style="font-weight:900;font-size:1.1rem;color:#1E293B;margin:4px 0">${esc(current.name)}</div>
        <div style="font-size:0.75rem;font-weight:700;color:${col};text-transform:uppercase;margin-bottom:16px">${current.rarity}</div>
        <div style="display:flex;gap:10px;justify-content:center">
          <button class="btn-secondary" onclick="removeWallCard(${slotIndex})">Remove</button>
          <button class="btn-primary" onclick="showWallCardPicker(${slotIndex})">Swap Card</button>
        </div>
      </div>
    `);
    return;
  }
  showWallCardPicker(slotIndex);
}

function showWallCardPicker(slotIndex) {
  const p = getActiveProfile();
  const wallCards   = p.wallCards || [null, null, null, null];
  const usedIds     = new Set(wallCards.filter(Boolean));
  const available   = p.inventory.filter(c => !usedIds.has(c.id));

  if (!available.length) {
    showModal(`<div style="text-align:center;padding:8px">
      <div style="font-size:2rem">🎒</div>
      <div style="font-weight:800;margin:8px 0">No cards yet!</div>
      <p style="color:#64748B;font-size:0.9rem">Complete quests to earn cards, then hang them here.</p>
      <button class="btn-primary" style="margin-top:12px" onclick="closeModal()">Got it!</button>
    </div>`);
    return;
  }

  const grid = available.map(c => {
    const col = RARITY_COLORS[c.rarity] || '#64748B';
    return `<button class="wcp-card" style="border-color:${col}" onclick="pickWallCard(${slotIndex},'${c.id}')">
      <div style="font-size:2rem">${c.emoji}</div>
      <div style="font-size:0.7rem;font-weight:800;color:#1E293B;margin-top:4px">${esc(c.name)}</div>
      <div style="font-size:0.6rem;font-weight:700;color:${col}">${c.rarity}</div>
    </button>`;
  }).join('');

  showModal(`
    <div>
      <div style="font-weight:900;font-size:1rem;color:#1E293B;margin-bottom:12px">🎨 Pick a card for slot ${slotIndex + 1}</div>
      <div class="wcp-grid">${grid}</div>
      <button class="btn-secondary" style="margin-top:12px;width:100%" onclick="closeModal()">Cancel</button>
    </div>
  `);
}

async function pickWallCard(slotIndex, cardId) {
  const p = getActiveProfile();
  const wallCards = [...(p.wallCards || [null, null, null, null])];
  wallCards[slotIndex] = cardId;
  await setWallCards(p.id, wallCards);
  closeModal();
  renderDashboard();
}

async function removeWallCard(slotIndex) {
  const p = getActiveProfile();
  const wallCards = [...(p.wallCards || [null, null, null, null])];
  wallCards[slotIndex] = null;
  await setWallCards(p.id, wallCards);
  closeModal();
  renderDashboard();
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

  // Daily op limit per grade (fewer ops → more sessions per op)
  const _limit  = GRADE_CONFIGS[p.grade]?.sessionLimit ?? 2;
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

  logCQ('quest_started', { subject: 'math', operation: G.op, grade: p.grade, theme: p.theme });

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
          const limit = GRADE_CONFIGS[grade]?.sessionLimit ?? 2;
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
  if (grade === 'grade1')       return buildGrade1Steps(opKey, a, b, answer);
  if (grade === 'grade6')       return buildGrade6Steps(opKey, a, b, answer);
  return buildGrade3Steps(opKey, a, b, answer); // grades 2, 3, 4, 5
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

// Grade 1 — Make a Ten (Idaho 1.OA.6) + Think Addition for subtraction
function buildGrade1Steps(opKey, a, b, answer) {
  if (opKey === 'addition' || opKey === 'mixed') {
    const big = Math.max(a, b), small = Math.min(a, b);
    const partner = 10 - big;
    if (partner > 0 && small > partner) {
      // Make a Ten strategy
      const leftover = small - partner;
      return [
        { label: `Make a 10!\n${big} + ___ = 10`,                              answer: partner,  hint: `What number added to ${big} gives you 10?` },
        { label: `You used ${partner} of the ${small}.\n${small} − ${partner} = ___`, answer: leftover, hint: `${small} take away ${partner} equals?` },
        { label: `10 + ${leftover} = ___`,                                      answer,           isFinal: true, hint: `Start at 10 and count up ${leftover} more!` },
      ];
    }
    // Count on (sum ≤ 10 or big already ≥ 10)
    const shown = Array.from({ length: small - 1 }, (_, i) => big + i + 1);
    const seq   = shown.length ? shown.join(' → ') + ' → ___' : '___';
    return [{ label: `Start at ${big}. Count on ${small} more:\n${seq}`, answer, isFinal: true,
      hint: `Hold up ${small} finger${small > 1 ? 's' : ''}. Count up from ${big}!` }];
  }
  if (opKey === 'subtraction') {
    return [{ label: `Think Addition:\n${b} + ___ = ${a}`, answer, isFinal: true,
      hint: `Count up from ${b} until you reach ${a}. How many steps?` }];
  }
  return [{ label: `${a} ${OPS[opKey]?.symbol || '?'} ${b} = ___`, answer, isFinal: true, hint: `Count carefully!` }];
}

// Grade 6 — Integers (single-step with sign-rule hint)
function buildGrade6Steps(opKey, a, b, answer) {
  const sym = OPS[opKey]?.symbol || '?';
  const hints = {
    addition:       (a < 0 || b < 0)
      ? `💡 Same signs → add & keep the sign. Different signs → subtract & keep the bigger sign.`
      : `💡 Add the values.`,
    subtraction:    b < 0
      ? `💡 Subtracting a negative = adding its opposite. ${a} − (${b}) = ${a} + ${Math.abs(b)}`
      : `💡 Subtract on the number line.`,
    multiplication: (a < 0) !== (b < 0)
      ? `💡 Positive × Negative = NEGATIVE.`
      : `💡 Same signs → POSITIVE result. Multiply the values.`,
    division:       `💡 Same signs → positive quotient. Different signs → negative quotient.`,
  };
  return [{ label: `${a} ${sym} ${b} = ___`, answer, isFinal: true, hint: hints[opKey] || `💡 Calculate carefully!` }];
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

  const gradeKey = grade === 'kindergarten' || grade === 'grade1' ? 'kindergarten'
    : sections[grade] ? grade : 'grade3';
  const opKey    = ['addition','subtraction','multiplication','division'].includes(op) ? op : 'addition';
  const build    = sections[gradeKey]?.[opKey];
  if (!build) return '<p>No help available for this problem.</p>';
  const { strategy, color, steps, visual } = build();

  const opLabels = { addition: 'Addition', subtraction: 'Subtraction', multiplication: 'Multiplication', division: 'Division' };
  const gradeLabel = GRADE_LABELS[grade]?.replace(/\s*[⭐🌟🌈🚀⚡🔥💎]$/, '') || 'Elementary';

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
  logCQ('quest_completed', { subject: 'math', operation: G.op, grade: p.grade,
    correct: G.sessionCorrect, total: G.sessionQ, coins: G.sessionCoins, card_rarity: card.rarity });
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
    const _limit = GRADE_CONFIGS[_p.grade]?.sessionLimit ?? 2;
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
  const item = getStore().find(i => i.id === itemId);
  logCQ('store_purchase', { item_name: item?.name, item_type: item?.type,
    cost: item?.cost, grade: p.grade });
  closeModal();
  renderStore();
  renderHeader();
  spawnConfetti(12);
}

// ── Parent PIN prompt ─────────────────────────
let _pinTarget = { screen: 'store-admin', data: {} };

function promptParentPin(target) {
  _pinTarget = target || { screen: 'store-admin', data: {} };
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
    closeModal(); nav(_pinTarget.screen, _pinTarget.data);
  } else {
    const err = document.getElementById('pin-error');
    if (err) { err.classList.add('show'); [0,1,2,3].forEach(i => { const d=document.getElementById('pin'+i); if(d) d.value=''; }); document.getElementById('pin0').focus(); }
  }
}

// ── Store admin screen ────────────────────────
let _editItemId = null;
let _storeAdminBackTo = 'store';

function renderStoreAdmin(data = {}) {
  if (data.backTo) _storeAdminBackTo = data.backTo;
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

  const backTo = _storeAdminBackTo;
  if (backTo === 'profiles') document.getElementById('app-header').style.display = 'none';

  document.getElementById('screen-store-admin').innerHTML = `
    <div class="page-wrap">
      <button class="back-btn" onclick="nav('${backTo}')">← ${backTo === 'profiles' ? 'Profiles' : 'Store'}</button>
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
        <button class="primary-btn" style="width:100%" onclick="showFamilyPickerScreen('store-admin')">🔄 Switch / Manage Families</button>
      </div>
    </div>`;
}

function editStoreItem(id) { _editItemId = id; renderStoreAdmin({ backTo: _storeAdminBackTo }); }
function cancelEditItem()  { _editItemId = null; renderStoreAdmin({ backTo: _storeAdminBackTo }); }

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
  renderStoreAdmin({ backTo: _storeAdminBackTo });
}

function deleteItem(id) {
  showModal(`<div class="modal-title">Delete this reward?</div>
    <div class="modal-text">This cannot be undone.</div>
    <div class="modal-btns">
      <button class="danger-btn" onclick="doDeleteItem('${id}')">Delete</button>
      <button class="primary-btn" onclick="closeModal()">Cancel</button>
    </div>`);
}
async function doDeleteItem(id) { await deleteStoreItem(id); closeModal(); renderStoreAdmin({ backTo: _storeAdminBackTo }); }

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
    <div class="modal-btns">
      <button class="primary-btn" onclick="closeModal(); nav('profiles')">👤 Switch Profile</button>
      <button class="text-btn" onclick="closeModal()">Close</button>
    </div>`);
}

// ── Feedback modal ────────────────────────────
function showFeedbackModal() {
  showModal(`
    <div class="modal-title">💬 Share Feedback</div>
    <div class="modal-text" style="margin-bottom:10px">What do you think of Critter Quest? Any ideas or suggestions?</div>
    <textarea id="feedback-text" placeholder="Type your feedback here…"
      style="width:100%;min-height:100px;border-radius:12px;border:2px solid #E2E8F0;
             padding:10px;font-family:'Nunito',sans-serif;font-size:0.95rem;
             resize:vertical;box-sizing:border-box;"></textarea>
    <div class="modal-btns" style="margin-top:12px">
      <button class="primary-btn" onclick="submitFeedback()">Send ✉️</button>
      <button class="text-btn" onclick="closeModal()">Cancel</button>
    </div>`);
  setTimeout(() => document.getElementById('feedback-text')?.focus(), 50);
}

async function submitFeedback() {
  const text = document.getElementById('feedback-text')?.value?.trim();
  if (!text) {
    document.getElementById('feedback-text').style.borderColor = '#EF4444';
    return;
  }
  const p = getActiveProfile();
  try { await saveFeedback(text, p?.name || 'Unknown'); } catch (e) { console.warn('Feedback save failed:', e); }
  logCQ('feedback_submitted', { grade: p?.grade });
  showModal(`
    <div class="modal-title">🙏 Thank you!</div>
    <div class="modal-text">Your feedback helps make Critter Quest better for everyone.</div>
    <div class="modal-btns"><button class="primary-btn" onclick="closeModal()">Close</button></div>`);
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
  grade1: {
    availableCats: ['sight-words', 'phonics', 'word-families', 'mixed'],
    labels: { 'sight-words': '📖 Sight', 'phonics': '🔡 Phonics', 'word-families': '🔗 Families', 'mixed': '🎲 Mix' },
  },
  grade2: {
    availableCats: ['sight-words', 'vowel-teams', 'prefixes-suffixes', 'mixed'],
    labels: { 'sight-words': '📖 Sight', 'vowel-teams': '🗣️ Vowels', 'prefixes-suffixes': '🧩 Affixes', 'mixed': '🎲 Mix' },
  },
  grade3: {
    availableCats: ['vocabulary', 'spelling', 'grammar', 'mixed'],
    labels: { 'vocabulary': '📚 Vocab', 'spelling': '✏️ Spell', 'grammar': '📝 Grammar', 'mixed': '🎲 Mix' },
  },
  grade4: {
    availableCats: ['vocabulary', 'spelling', 'grammar', 'mixed'],
    labels: { 'vocabulary': '📚 Vocab', 'spelling': '✏️ Spell', 'grammar': '📝 Grammar', 'mixed': '🎲 Mix' },
  },
  grade5: {
    availableCats: ['vocabulary', 'spelling', 'grammar', 'mixed'],
    labels: { 'vocabulary': '📚 Vocab', 'spelling': '✏️ Spell', 'grammar': '📝 Grammar', 'mixed': '🎲 Mix' },
  },
  grade6: {
    availableCats: ['vocabulary', 'spelling', 'grammar', 'mixed'],
    labels: { 'vocabulary': '📚 Vocab', 'spelling': '✏️ Spell', 'grammar': '📝 Grammar', 'mixed': '🎲 Mix' },
  },
};

// ── Reading question banks ─────────────────────
// Each entry: { prompt, hint, answer, others: [3 wrong choices] }
// Aligned to Idaho ELA Content Standards (2022) — Barbara Morgan STEM Academy / West Ada SD
const READ_QUESTIONS = {
  kindergarten: {
    'sight-words': [
      // Dolch Pre-Primer & Primer high-frequency words (Idaho RF.K.3.c)
      { prompt: 'Find the word:\nTHE',    hint: '💡 "The dog ran home."',                     answer: 'the',    others: ['she', 'her', 'then'] },
      { prompt: 'Find the word:\nAND',    hint: '💡 "I like cats and dogs."',                 answer: 'and',    others: ['ant', 'end', 'any'] },
      { prompt: 'Find the word:\nA',      hint: '💡 "I have a red ball."',                    answer: 'a',      others: ['at', 'an', 'as'] },
      { prompt: 'Find the word:\nI',      hint: '💡 "I love to read books."',                 answer: 'I',      others: ['in', 'it', 'is'] },
      { prompt: 'Find the word:\nIN',     hint: '💡 "The cat sat in the box."',               answer: 'in',     others: ['is', 'it', 'on'] },
      { prompt: 'Find the word:\nIS',     hint: '💡 "This is my hat."',                       answer: 'is',     others: ['in', 'it', 'if'] },
      { prompt: 'Find the word:\nIT',     hint: '💡 "It is big and blue."',                   answer: 'it',     others: ['in', 'is', 'at'] },
      { prompt: 'Find the word:\nUP',     hint: '💡 "Look up at the sky!"',                   answer: 'up',     others: ['us', 'on', 'or'] },
      { prompt: 'Find the word:\nGO',     hint: '💡 "Let\'s go to the park."',                answer: 'go',     others: ['so', 'do', 'to'] },
      { prompt: 'Find the word:\nTO',     hint: '💡 "I like to run fast."',                   answer: 'to',     others: ['do', 'so', 'by'] },
      { prompt: 'Find the word:\nWE',     hint: '💡 "We play games at school."',              answer: 'we',     others: ['me', 'he', 'be'] },
      { prompt: 'Find the word:\nME',     hint: '💡 "She gave the book to me."',              answer: 'me',     others: ['we', 'he', 'be'] },
      { prompt: 'Find the word:\nHE',     hint: '💡 "He is my best friend."',                 answer: 'he',     others: ['we', 'me', 'be'] },
      { prompt: 'Find the word:\nSHE',    hint: '💡 "She has a little dog."',                 answer: 'she',    others: ['the', 'her', 'see'] },
      { prompt: 'Find the word:\nSEE',    hint: '💡 "I can see the moon."',                   answer: 'see',    others: ['she', 'bee', 'fee'] },
      { prompt: 'Find the word:\nMY',     hint: '💡 "This is my backpack."',                  answer: 'my',     others: ['me', 'by', 'may'] },
      { prompt: 'Find the word:\nBIG',    hint: '💡 "An elephant is very big."',              answer: 'big',    others: ['bag', 'pig', 'dig'] },
      { prompt: 'Find the word:\nBLUE',   hint: '💡 "The sky is blue today."',                answer: 'blue',   others: ['blew', 'clue', 'glue'] },
      { prompt: 'Find the word:\nCAN',    hint: '💡 "I can read this book."',                 answer: 'can',    others: ['car', 'cap', 'cat'] },
      { prompt: 'Find the word:\nCOME',   hint: '💡 "Come and play with me!"',                answer: 'come',   others: ['came', 'some', 'home'] },
      { prompt: 'Find the word:\nDOWN',   hint: '💡 "The ball rolled down the hill."',        answer: 'down',   others: ['town', 'gown', 'dawn'] },
      { prompt: 'Find the word:\nFIND',   hint: '💡 "Can you find the red hat?"',             answer: 'find',   others: ['kind', 'mind', 'fine'] },
      { prompt: 'Find the word:\nFOR',    hint: '💡 "This gift is for you!"',                 answer: 'for',    others: ['far', 'fur', 'from'] },
      { prompt: 'Find the word:\nFUNNY',  hint: '💡 "The clown was so funny."',               answer: 'funny',  others: ['bunny', 'sunny', 'money'] },
      { prompt: 'Find the word:\nHELP',   hint: '💡 "I need help with this puzzle."',         answer: 'help',   others: ['held', 'helm', 'heap'] },
      { prompt: 'Find the word:\nHERE',   hint: '💡 "Come sit here with me."',                answer: 'here',   others: ['her', 'there', 'were'] },
      { prompt: 'Find the word:\nJUMP',   hint: '💡 "I can jump over the puddle."',           answer: 'jump',   others: ['bump', 'dump', 'pump'] },
      { prompt: 'Find the word:\nLITTLE', hint: '💡 "She has a little puppy."',               answer: 'little', others: ['bottle', 'battle', 'title'] },
      { prompt: 'Find the word:\nLOOK',   hint: '💡 "Look at that big bird!"',                answer: 'look',   others: ['book', 'cook', 'took'] },
      { prompt: 'Find the word:\nMAKE',   hint: '💡 "Let\'s make a sandcastle."',             answer: 'make',   others: ['lake', 'bake', 'cake'] },
      { prompt: 'Find the word:\nNOT',    hint: '💡 "I am not tired yet."',                   answer: 'not',    others: ['now', 'nor', 'net'] },
      { prompt: 'Find the word:\nONE',    hint: '💡 "I have one red apple."',                 answer: 'one',    others: ['none', 'tone', 'bone'] },
      { prompt: 'Find the word:\nPLAY',   hint: '💡 "We like to play outside."',              answer: 'play',   others: ['clay', 'pray', 'stay'] },
      { prompt: 'Find the word:\nRED',    hint: '💡 "She wore a red hat."',                   answer: 'red',    others: ['bed', 'led', 'fed'] },
      { prompt: 'Find the word:\nRUN',    hint: '💡 "I can run very fast."',                  answer: 'run',    others: ['fun', 'sun', 'bun'] },
      { prompt: 'Find the word:\nSAID',   hint: '💡 "He said, \'Hello!\'"',                   answer: 'said',   others: ['sail', 'sand', 'tail'] },
      { prompt: 'Find the word:\nTHREE',  hint: '💡 "I have three cats at home."',            answer: 'three',  others: ['tree', 'free', 'there'] },
      { prompt: 'Find the word:\nWHERE',  hint: '💡 "Where is my backpack?"',                 answer: 'where',  others: ['there', 'here', 'were'] },
      { prompt: 'Find the word:\nYELLOW', hint: '💡 "The sun is bright yellow."',             answer: 'yellow', others: ['fellow', 'below', 'hello'] },
      { prompt: 'Find the word:\nYOU',    hint: '💡 "I like you a lot!"',                     answer: 'you',    others: ['your', 'yes', 'yet'] },
    ],
    'letter-sounds': [
      // Single consonants + short vowels + digraphs (Idaho RF.K.3.a-b)
      { prompt: 'What sound does  B  make?', hint: '💡 Also in: bat 🏏, bee 🐝, bird 🐦',      answer: '/b/ — ball 🏀',   others: ['/d/ — dog 🐕',  '/p/ — pig 🐷',  '/m/ — moon 🌙'] },
      { prompt: 'What sound does  C  make?', hint: '💡 Also in: car 🚗, cow 🐄, cup ☕',       answer: '/k/ — cat 🐱',   others: ['/s/ — sun ☀️',  '/g/ — goat 🐐', '/t/ — top 🎯'] },
      { prompt: 'What sound does  D  make?', hint: '💡 Also in: duck 🦆, door 🚪, desk 📚',    answer: '/d/ — dog 🐕',   others: ['/b/ — ball 🏀',  '/g/ — goat 🐐', '/t/ — top 🎯'] },
      { prompt: 'What sound does  F  make?', hint: '💡 Also in: frog 🐸, fan 🌀, feet 🦶',     answer: '/f/ — fish 🐟',  others: ['/v/ — van 🚐',  '/p/ — pig 🐷',  '/b/ — ball 🏀'] },
      { prompt: 'What sound does  G  make?', hint: '💡 Also in: girl 👧, gap, gift 🎁',         answer: '/g/ — goat 🐐',  others: ['/j/ — jam 🍓',  '/k/ — kite 🪁', '/d/ — dog 🐕'] },
      { prompt: 'What sound does  H  make?', hint: '💡 Also in: hop, hill, hand 🤚',            answer: '/h/ — hat 🎩',   others: ['/w/ — web 🕸️', '/r/ — run 🏃',  '/n/ — nose 👃'] },
      { prompt: 'What sound does  J  make?', hint: '💡 Also in: jet ✈️, jar 🫙, job',           answer: '/j/ — jump 🏃',  others: ['/g/ — goat 🐐', '/y/ — yam 🍠',  '/ch/ — chin'] },
      { prompt: 'What sound does  K  make?', hint: '💡 Also in: key 🔑, king 👑, kick',         answer: '/k/ — kite 🪁',  others: ['/g/ — goat 🐐', '/ch/ — chin',   '/t/ — top 🎯'] },
      { prompt: 'What sound does  L  make?', hint: '💡 Also in: leaf 🍃, lip, leg 🦵',          answer: '/l/ — lion 🦁',  others: ['/r/ — run 🏃',  '/w/ — web 🕸️', '/n/ — nose 👃'] },
      { prompt: 'What sound does  M  make?', hint: '💡 Also in: map 🗺️, mud, mitt 🧤',         answer: '/m/ — moon 🌙',  others: ['/n/ — nose 👃', '/b/ — ball 🏀',  '/w/ — web 🕸️'] },
      { prompt: 'What sound does  N  make?', hint: '💡 Also in: net, nap, nut 🥜',              answer: '/n/ — nose 👃',  others: ['/m/ — moon 🌙', '/d/ — dog 🐕',  '/k/ — kite 🪁'] },
      { prompt: 'What sound does  P  make?', hint: '💡 Also in: pan, pet, pop 🍭',              answer: '/p/ — pig 🐷',   others: ['/b/ — ball 🏀',  '/f/ — fish 🐟', '/t/ — top 🎯'] },
      { prompt: 'What sound does  R  make?', hint: '💡 Also in: rat 🐀, red, rock 🪨',          answer: '/r/ — run 🏃',   others: ['/l/ — lion 🦁', '/w/ — web 🕸️', '/n/ — nose 👃'] },
      { prompt: 'What sound does  S  make?', hint: '💡 Also in: sit, sad, sock 🧦',             answer: '/s/ — sun ☀️',   others: ['/z/ — zip 🤐',  '/sh/ — ship 🚢', '/k/ — kite 🪁'] },
      { prompt: 'What sound does  T  make?', hint: '💡 Also in: tap, ten, tug',                 answer: '/t/ — top 🎯',   others: ['/d/ — dog 🐕',  '/p/ — pig 🐷',  '/k/ — kite 🪁'] },
      { prompt: 'What sound does  V  make?', hint: '💡 Also in: vet 🩺, vine, vest 🦺',         answer: '/v/ — van 🚐',   others: ['/f/ — fish 🐟', '/b/ — ball 🏀',  '/w/ — web 🕸️'] },
      { prompt: 'What sound does  W  make?', hint: '💡 Also in: win, wet, wig',                 answer: '/w/ — web 🕸️',  others: ['/v/ — van 🚐',  '/y/ — yam 🍠',  '/h/ — hat 🎩'] },
      { prompt: 'What sound does  Y  make?', hint: '💡 Also in: yes, yet, yell',                answer: '/y/ — yam 🍠',   others: ['/w/ — web 🕸️', '/j/ — jump 🏃', '/g/ — goat 🐐'] },
      { prompt: 'What sound does  Z  make?', hint: '💡 Also in: zoo 🦓, zap, zero',             answer: '/z/ — zip 🤐',   others: ['/s/ — sun ☀️',  '/v/ — van 🚐',  '/f/ — fish 🐟'] },
      // Short vowels
      { prompt: 'What short sound does  A  make?', hint: '💡 Short /a/: bat, cap, map, ran',   answer: '/a/ — apple 🍎',  others: ['/e/ — egg 🥚',  '/i/ — itch 🦟', '/o/ — odd 🎲'] },
      { prompt: 'What short sound does  E  make?', hint: '💡 Short /e/: bed, pet, ten, red',   answer: '/e/ — egg 🥚',    others: ['/a/ — apple 🍎', '/i/ — itch 🦟', '/u/ — up ⬆️'] },
      { prompt: 'What short sound does  I  make?', hint: '💡 Short /i/: sit, bin, hit, tip',   answer: '/i/ — itch 🦟',   others: ['/e/ — egg 🥚',  '/a/ — apple 🍎', '/u/ — up ⬆️'] },
      { prompt: 'What short sound does  O  make?', hint: '💡 Short /o/: hot, dot, fog, hop',   answer: '/o/ — odd 🎲',    others: ['/u/ — up ⬆️',  '/a/ — apple 🍎', '/e/ — egg 🥚'] },
      { prompt: 'What short sound does  U  make?', hint: '💡 Short /u/: bug, mud, cup, run',   answer: '/u/ — up ⬆️',     others: ['/o/ — odd 🎲',  '/i/ — itch 🦟', '/e/ — egg 🥚'] },
      // Digraphs — Idaho K ELA standard (RF.K.3.a)
      { prompt: 'What sound do  SH  make together?', hint: '💡 SH blends into one sound: ship 🚢, fish 🐟, shell 🐚', answer: '/sh/ — ship 🚢',  others: ['/s/ — sun ☀️', '/ch/ — chin', '/th/ — the'] },
      { prompt: 'What sound do  CH  make together?', hint: '💡 CH blends into one sound: chin, chair 🪑, lunch 🍱',  answer: '/ch/ — chin 👶',  others: ['/sh/ — ship 🚢', '/k/ — kite 🪁', '/j/ — jump 🏃'] },
      { prompt: 'What sound do  TH  make together?', hint: '💡 TH blends: the, this, that, three',                   answer: '/th/ — the 🐾',   others: ['/t/ — top 🎯', '/d/ — dog 🐕', '/f/ — fish 🐟'] },
      { prompt: 'What sound do  WH  make together?', hint: '💡 WH blends: when, where, what, whale 🐋',             answer: '/wh/ — whale 🐋', others: ['/v/ — van 🚐', '/sh/ — ship 🚢', '/h/ — hat 🎩'] },
    ],
    'word-building': [
      // CVC words (Idaho RF.K.3) + CCVC/CVCC blends
      { prompt: 'Sound it out:\nC · A · T', hint: '💡 /k/ + short /a/ + /t/ = ?',       answer: 'cat', others: ['bat', 'sat', 'hat'] },
      { prompt: 'Sound it out:\nD · O · G', hint: '💡 /d/ + short /o/ + /g/ = ?',       answer: 'dog', others: ['log', 'fog', 'hog'] },
      { prompt: 'Sound it out:\nP · I · G', hint: '💡 /p/ + short /i/ + /g/ = ?',       answer: 'pig', others: ['big', 'dig', 'wig'] },
      { prompt: 'Sound it out:\nS · U · N', hint: '💡 /s/ + short /u/ + /n/ = ?',       answer: 'sun', others: ['run', 'fun', 'bun'] },
      { prompt: 'Sound it out:\nH · E · N', hint: '💡 /h/ + short /e/ + /n/ = ?',       answer: 'hen', others: ['ten', 'pen', 'den'] },
      { prompt: 'Sound it out:\nB · U · G', hint: '💡 /b/ + short /u/ + /g/ = ?',       answer: 'bug', others: ['hug', 'mug', 'rug'] },
      { prompt: 'Sound it out:\nH · O · T', hint: '💡 /h/ + short /o/ + /t/ = ?',       answer: 'hot', others: ['dot', 'pot', 'lot'] },
      { prompt: 'Sound it out:\nB · E · D', hint: '💡 /b/ + short /e/ + /d/ = ?',       answer: 'bed', others: ['red', 'led', 'fed'] },
      { prompt: 'Sound it out:\nM · A · P', hint: '💡 /m/ + short /a/ + /p/ = ?',       answer: 'map', others: ['cap', 'lap', 'tap'] },
      { prompt: 'Sound it out:\nC · U · P', hint: '💡 /k/ + short /u/ + /p/ = ?',       answer: 'cup', others: ['pup', 'cut', 'cub'] },
      { prompt: 'Sound it out:\nT · U · B', hint: '💡 /t/ + short /u/ + /b/ = ?',       answer: 'tub', others: ['hub', 'rub', 'tab'] },
      { prompt: 'Sound it out:\nJ · A · M', hint: '💡 /j/ + short /a/ + /m/ = ?',       answer: 'jam', others: ['ham', 'ram', 'yam'] },
      { prompt: 'Sound it out:\nS · I · T', hint: '💡 /s/ + short /i/ + /t/ = ?',       answer: 'sit', others: ['bit', 'hit', 'kit'] },
      { prompt: 'Sound it out:\nN · A · P', hint: '💡 /n/ + short /a/ + /p/ = ?',       answer: 'nap', others: ['cap', 'lap', 'sap'] },
      { prompt: 'Sound it out:\nW · I · N', hint: '💡 /w/ + short /i/ + /n/ = ?',       answer: 'win', others: ['bin', 'pin', 'fin'] },
      { prompt: 'Sound it out:\nP · E · T', hint: '💡 /p/ + short /e/ + /t/ = ?',       answer: 'pet', others: ['bet', 'jet', 'net'] },
      { prompt: 'Sound it out:\nM · U · D', hint: '💡 /m/ + short /u/ + /d/ = ?',       answer: 'mud', others: ['bud', 'bug', 'bus'] },
      { prompt: 'Sound it out:\nF · A · N', hint: '💡 /f/ + short /a/ + /n/ = ?',       answer: 'fan', others: ['can', 'man', 'pan'] },
      // Blends (Idaho K RF.K.3)
      { prompt: 'Sound it out:\nST · O · P', hint: '💡 ST blend = /st/: stop, step, stem',  answer: 'stop', others: ['step', 'drop', 'shop'] },
      { prompt: 'Sound it out:\nFL · A · G', hint: '💡 FL blend = /fl/: flag, flat, flip',  answer: 'flag', others: ['flat', 'flab', 'drag'] },
      { prompt: 'Sound it out:\nCL · A · P', hint: '💡 CL blend = /kl/: clap, clip, clay', answer: 'clap', others: ['clip', 'flap', 'snap'] },
      { prompt: 'Sound it out:\nSL · I · P', hint: '💡 SL blend = /sl/: slip, slim, sled', answer: 'slip', others: ['slim', 'slap', 'drip'] },
      { prompt: 'Sound it out:\nGR · A · B', hint: '💡 GR blend = /gr/: grab, grin, drip', answer: 'grab', others: ['crab', 'grub', 'drab'] },
    ],
  },
  grade3: {
    'vocabulary': [
      // Tier 2 academic words + prefix/suffix word analysis (Idaho L.3.4, L.3.6)
      { prompt: 'What does "enormous" mean?',    hint: '💡 "The enormous elephant filled the whole room!"',         answer: 'Very large',                        others: ['Very small', 'Very loud', 'Very fast'] },
      { prompt: 'What does "ancient" mean?',     hint: '💡 "The ancient ruins were thousands of years old."',        answer: 'Very old',                          others: ['Very young', 'Very tall', 'Very cold'] },
      { prompt: 'What does "curious" mean?',     hint: '💡 "The curious cat peeked inside every box."',             answer: 'Wanting to know or learn',          others: ['Very tired', 'Very angry', 'Very hungry'] },
      { prompt: 'What does "brave" mean?',       hint: '💡 "The brave firefighter ran into the burning building."', answer: 'Not afraid to face danger',         others: ['Very shy and quiet', 'Very fast and clever', 'Unable to move'] },
      { prompt: 'What does "patient" mean?',     hint: '💡 "She was patient and waited calmly in line."',           answer: 'Able to wait calmly',               others: ['Moving very quickly', 'Very loud and silly', 'Always feeling sad'] },
      { prompt: 'What does "gentle" mean?',      hint: '💡 "He was gentle when he held the baby bird."',            answer: 'Soft and careful',                  others: ['Loud and rough', 'Dark and scary', 'Big and heavy'] },
      { prompt: 'What does "discover" mean?',    hint: '💡 "She was thrilled to discover a new trail in the forest."', answer: 'To find something for the first time', others: ['To break something apart', 'To eat something quickly', 'To sleep for a long time'] },
      { prompt: 'What does "celebrate" mean?',   hint: '💡 "We celebrate birthdays with cake and balloons!"',       answer: 'To do something fun for a special event', others: ['To feel very sad', 'To rest and be still', 'To run very far'] },
      { prompt: 'What does "harvest" mean?',     hint: '💡 "In autumn, farmers harvest apples and corn."',          answer: 'To gather crops from a farm',       others: ['To plant seeds in spring', 'To fly through the clouds', 'To swim in the ocean'] },
      { prompt: 'What does "whisper" mean?',     hint: '💡 "Please whisper so you don\'t wake the baby."',          answer: 'To speak very quietly',             others: ['To sing very loudly', 'To run very fast', 'To jump very high'] },
      { prompt: 'What does "predict" mean?',     hint: '💡 "I predict it will rain because I see dark clouds."',    answer: 'To say what will happen before it does', others: ['To remember the past clearly', 'To draw a picture', 'To ask a question'] },
      { prompt: 'What does "protect" mean?',     hint: '💡 "A mother bear will protect her cubs from danger."',     answer: 'To keep something safe from harm',  others: ['To make something bigger', 'To break something apart', 'To move something far away'] },
      { prompt: 'What does "solution" mean?',    hint: '💡 "Working together was the solution to their problem."',  answer: 'The answer to a problem',           others: ['A type of weather', 'A kind of food', 'A place to sleep'] },
      { prompt: 'What does "migrate" mean?',     hint: '💡 "Birds migrate south every winter to stay warm."',       answer: 'To move from one place to another', others: ['To build a new home', 'To eat a lot of food', 'To sleep all winter'] },
      { prompt: 'What does "habitat" mean?',     hint: '💡 "The rainforest is the habitat of many colorful frogs."', answer: 'The natural home of an animal',   others: ['What an animal eats', 'The color of an animal', 'How fast an animal runs'] },
      { prompt: 'What does "observe" mean?',     hint: '💡 "Scientists observe animals to learn how they behave."', answer: 'To watch carefully and pay attention', others: ['To run as fast as you can', 'To eat slowly', 'To sleep without moving'] },
      { prompt: 'What does "exhausted" mean?',   hint: '💡 "After the long hike, she was exhausted and fell asleep fast."', answer: 'Very, very tired',           others: ['Very, very happy', 'Very, very cold', 'Very, very full'] },
      { prompt: 'What does "generous" mean?',    hint: '💡 "The generous student shared all of her crayons."',      answer: 'Happy to share and give to others', others: ['Always taking from others', 'Never talking to anyone', 'Sleeping most of the time'] },
      { prompt: 'What does "persevere" mean?',   hint: '💡 "Even when it got hard, he persevered and finished the race."', answer: 'To keep trying even when it is hard', others: ['To give up quickly', 'To ask for help right away', 'To rest when tired'] },
      { prompt: 'What does "evidence" mean?',    hint: '💡 "The muddy footprints were evidence that someone had been there."', answer: 'Facts that help prove something is true', others: ['A type of story', 'A kind of animal', 'A weather event'] },
      { prompt: 'What does "summarize" mean?',   hint: '💡 "Can you summarize the story in just two or three sentences?"', answer: 'To tell the main ideas in a short way', others: ['To retell every single detail', 'To make something longer', 'To ask many questions'] },
      { prompt: 'What does "compare" mean?',     hint: '💡 "Compare a dog and a cat — how are they alike? How are they different?"', answer: 'To look at how things are alike and different', others: ['To count how many things there are', 'To put things in size order', 'To name all the parts of something'] },
      // Prefix/suffix word analysis — Idaho L.3.4.b
      { prompt: 'The prefix "re-" means:\n(as in "redo" or "rewrite")',       hint: '💡 redo = do again, rewrite = write again, replay = play again', answer: 'Again',          others: ['Not', 'Before', 'Full of'] },
      { prompt: 'The prefix "un-" means:\n(as in "unhappy" or "unkind")',     hint: '💡 unhappy = not happy, unkind = not kind, undo = not done',      answer: 'Not / opposite', others: ['Again', 'Before', 'Full of'] },
      { prompt: 'The prefix "pre-" means:\n(as in "preview" or "preheat")',   hint: '💡 preview = see before, preheat = heat before the oven is ready', answer: 'Before',        others: ['After', 'Again', 'Not'] },
      { prompt: 'The suffix "-ful" means:\n(as in "helpful" or "colorful")',  hint: '💡 helpful = full of help, colorful = full of color, joyful = full of joy', answer: 'Full of',  others: ['Without', 'Again', 'Not'] },
      { prompt: 'The suffix "-less" means:\n(as in "hopeless" or "fearless")',hint: '💡 hopeless = without hope, fearless = without fear, painless = without pain', answer: 'Without', others: ['Full of', 'Again', 'Before'] },
      { prompt: 'The suffix "-er" makes a word mean:\n(as in "faster" or "taller")', hint: '💡 fast → faster (comparing 2 things), tall → taller, bright → brighter', answer: 'More (comparing two)',  others: ['Less', 'The most of all', 'Without'] },
      { prompt: 'The suffix "-est" makes a word mean:\n(as in "fastest" or "tallest")', hint: '💡 fast → fastest (the most of all!), tall → tallest, bright → brightest', answer: 'The most of all', others: ['More', 'Less', 'Without'] },
    ],
    'spelling': [
      // Common spelling patterns + tricky words — Idaho L.3.2.e
      { prompt: 'Which word is spelled correctly?', answer: 'because',   hint: '💡 B-E-C-A-U-S-E. Remember: "Big Elephants Can Always Use Small Exits"', others: ['becuase',   'becawse',    'becaus'] },
      { prompt: 'Which word is spelled correctly?', answer: 'friend',    hint: '💡 "fri-END" — a friend stays with you to the END',                      others: ['freind',    'frend',      'friand'] },
      { prompt: 'Which word is spelled correctly?', answer: 'different', hint: '💡 dif-fer-ent — two f\'s in the middle',                                 others: ['diferent',  'diffrent',   'diferrant'] },
      { prompt: 'Which word is spelled correctly?', answer: 'beautiful', hint: '💡 beau-ti-ful — "beau" means beautiful in French!',                      others: ['beatiful',  'beutiful',   'beautifull'] },
      { prompt: 'Which word is spelled correctly?', answer: 'people',    hint: '💡 peo-ple — the "eo" together makes the /ee/ sound',                     others: ['pepole',    'peaple',     'poeple'] },
      { prompt: 'Which word is spelled correctly?', answer: 'would',     hint: '💡 "would, could, should" — all share the -ould pattern',                 others: ['woud',      'whould',     'wuld'] },
      { prompt: 'Which word is spelled correctly?', answer: 'thought',   hint: '💡 -ough says /aw/: thought, bought, fought',                            others: ['thot',      'thaut',      'thougt'] },
      { prompt: 'Which word is spelled correctly?', answer: 'enough',    hint: '💡 -ough says /uf/ here: enough, tough, rough',                          others: ['enuf',      'enuph',      'enaugh'] },
      { prompt: 'Which word is spelled correctly?', answer: 'surprise',  hint: '💡 sur-prise — no double p! (not "suprise")',                            others: ['suprise',   'surprize',   'sirprise'] },
      { prompt: 'Which word is spelled correctly?', answer: 'special',   hint: '💡 spe-cial — the "ci" makes a /sh/ sound',                             others: ['speshal',   'speciel',    'specel'] },
      { prompt: 'Which word is spelled correctly?', answer: 'together',  hint: '💡 to-get-her — say each part: to / get / her',                          others: ['togather',  'togeather',  'togeter'] },
      { prompt: 'Which word is spelled correctly?', answer: 'usually',   hint: '💡 u-su-al-ly — four syllables, ends in -ally',                          others: ['usally',    'usualy',     'yousually'] },
      { prompt: 'Which word is spelled correctly?', answer: 'probably',  hint: '💡 prob-ab-ly — three syllables (not "probly"!)',                         others: ['probaly',   'probibly',   'probbably'] },
      { prompt: 'Which word is spelled correctly?', answer: 'important', hint: '💡 im-por-tant — three syllables, ends in -tant',                        others: ['importent', 'inportant',  'importint'] },
      { prompt: 'Which word is spelled correctly?', answer: 'something', hint: '💡 some + thing — two smaller words put together',                       others: ['sumthing',  'somthing',   'somethng'] },
      { prompt: 'Which word is spelled correctly?', answer: 'favorite',  hint: '💡 fa-vor-ite — three syllables (not "favrite"!)',                        others: ['favrite',   'favorit',    'faviorite'] },
      { prompt: 'Which word is spelled correctly?', answer: 'library',   hint: '💡 li-brar-y — say ALL the letters, even the first r!',                   others: ['liberry',   'libary',     'liebrary'] },
      { prompt: 'Which word is spelled correctly?', answer: 'February',  hint: '💡 Feb-ru-ar-y — that first "r" is often skipped when saying it!',        others: ['Febuary',   'Feburary',   'Febreaury'] },
      { prompt: 'Which word is spelled correctly?', answer: 'Wednesday', hint: '💡 Wed-nes-day — "Wednes" is hiding inside the word!',                    others: ['Wensday',   'Wendsday',   'Wednsday'] },
      { prompt: 'Which word is spelled correctly?', answer: 'family',    hint: '💡 fam-i-ly — three syllables: fam / i / ly',                            others: ['famaly',    'fammily',    'famly'] },
      { prompt: 'Which word is spelled correctly?', answer: 'animal',    hint: '💡 an-i-mal — three syllables: an / i / mal',                            others: ['animle',    'animmal',    'anmial'] },
      { prompt: 'Which word is spelled correctly?', answer: 'practice',  hint: '💡 prac-tice — ends in -tice (not -tise)',                               others: ['practise',  'practace',   'practis'] },
      { prompt: 'Which word is spelled correctly?', answer: 'adventure', hint: '💡 ad-ven-ture — three syllables: ad / ven / ture',                      others: ['advenchure','adventur',   'advenshure'] },
      { prompt: 'Which word is spelled correctly?', answer: 'already',   hint: '💡 al-ready — only ONE "l" (not "allready")',                            others: ['allready',  'alredy',     'allredy'] },
      { prompt: 'Which word is spelled correctly?', answer: 'building',  hint: '💡 build-ing — think of "built": b-u-i-l-d',                            others: ['bulding',   'buildding',  'buiding'] },
    ],
    'grammar': [
      // Parts of speech, verb tenses, plurals, conjunctions, comparatives — Idaho L.3.1
      { prompt: 'Which word is a NOUN?\n(person, place, animal, or thing)', hint: '💡 Nouns name things: girl, park, dog, book, Idaho 🗺️',              answer: 'mountain', others: ['tall', 'climb', 'quickly'] },
      { prompt: 'Which word is a VERB?\n(action or being word)',            hint: '💡 Verbs show action (jump, bake) or being (is, was, are)',           answer: 'jumped',   others: ['rabbit', 'happy', 'slowly'] },
      { prompt: 'Which word is an ADJECTIVE?\n(describes a noun)',          hint: '💡 Adjectives describe nouns: big, red, happy, colorful',             answer: 'colorful', others: ['butterfly', 'flew', 'gently'] },
      { prompt: 'Which word is an ADVERB?\n(describes a verb)',             hint: '💡 Adverbs describe HOW: quickly, gently, loudly, carefully',         answer: 'gently',   others: ['flower', 'bright', 'bird'] },
      { prompt: '"Yesterday, we ___ to the park."\nChoose the correct verb:', hint: '💡 "Yesterday" = past tense. "go" changes to "went" in the past.',  answer: 'went',         others: ['go', 'will go', 'going'] },
      { prompt: '"Right now, she ___ her book."\nChoose the correct verb:',   hint: '💡 "Right now" = present continuous: is/am/are + verb-ing',         answer: 'is reading',   others: ['read', 'will read', 'reads tomorrow'] },
      { prompt: '"Tomorrow, he ___ his friend."\nChoose the correct verb:',   hint: '💡 "Tomorrow" = future tense: will + verb',                          answer: 'will call',    others: ['called', 'was calling', 'calls yesterday'] },
      { prompt: 'What is the correct PLURAL of "mouse"?',  hint: '💡 "Mouse" is irregular — it does NOT follow the normal -s rule',    answer: 'mice',     others: ['mouses',   'mouse',    'meese'] },
      { prompt: 'What is the correct PLURAL of "child"?',  hint: '💡 "Child" is irregular — it becomes "children" (not "childs")',     answer: 'children', others: ['childs',   'childen',  'childrens'] },
      { prompt: 'What is the correct PLURAL of "goose"?',  hint: '💡 "Goose" is irregular — it becomes "geese" (not "gooses")',       answer: 'geese',    others: ['gooses',   'goose',    'goosen'] },
      { prompt: 'What is the correct PLURAL of "foot"?',   hint: '💡 "Foot" is irregular — it becomes "feet" (not "foots")',          answer: 'feet',     others: ['foots',    'foot',     'footses'] },
      { prompt: 'Which sentence is written CORRECTLY?',    hint: '💡 City names (Boise) and state names (Idaho) are always capitalized.', answer: 'We live in Boise, Idaho.', others: ['we live in boise, idaho.', 'We live in boise, Idaho.', 'We Live In Boise, Idaho.'] },
      { prompt: 'Which sentence is written CORRECTLY?',    hint: '💡 Names of months (January, February…) are always capitalized.',      answer: 'My birthday is in January.', others: ['My birthday is in january.', 'my birthday is in January.', 'My Birthday is in january.'] },
      { prompt: 'Which sentence needs a QUESTION MARK?',   hint: '💡 Questions ask something. They start with: Who, What, Where, When, Why, How…', answer: 'Where did you put my shoes', others: ['I love pizza', 'She runs every day', 'The cat sat on the mat'] },
      { prompt: 'Which sentence should end with an EXCLAMATION MARK?', hint: '💡 Exclamation marks show strong feelings or urgent warnings!', answer: 'Watch out for that bee', others: ['The library opens at nine', 'She has a blue backpack', 'We went to the store'] },
      { prompt: 'Which pronoun replaces "Maria and Carlos"?', hint: '💡 Two or more people = "They" (plural pronoun)',         answer: 'They', others: ['We', 'Them', 'He'] },
      { prompt: 'Which pronoun replaces "the big book"?',     hint: '💡 A thing (not a person) = "it" (singular pronoun)',    answer: 'it',   others: ['they', 'he', 'she'] },
      { prompt: '"The dogs ___ very loud."\nChoose the correct verb:',         hint: '💡 "Dogs" is plural, so use "are" (not "is")',           answer: 'are',  others: ['is', 'was', 'am'] },
      { prompt: '"She ___ her vegetables every night."\nChoose the correct verb:', hint: '💡 She/He/It + present tense = add -s: eats, runs, plays', answer: 'eats', others: ['eat', 'eating', 'eaten'] },
      { prompt: 'Which of these is a COMPLETE SENTENCE?',    hint: '💡 A complete sentence has a subject (who) AND a verb (what they do)',  answer: 'The cat jumped over the fence.', others: ['jumped over the fence', 'The big fluffy cat', 'When the cat jumped'] },
      { prompt: 'What is the SUBJECT of:\n"The little puppy ran fast."', hint: '💡 The subject = WHO or WHAT the sentence is about',       answer: 'puppy',  others: ['ran', 'fast', 'little'] },
      { prompt: 'What is the VERB in:\n"My sister baked cookies yesterday."', hint: '💡 The verb = WHAT the subject DID (action word)',     answer: 'baked',  others: ['sister', 'cookies', 'yesterday'] },
      { prompt: 'Which is a PROPER NOUN?',                   hint: '💡 Proper nouns name specific places or people: Boise, Idaho, West Ada', answer: 'Idaho',  others: ['mountain', 'river', 'school'] },
      // Conjunctions — Idaho L.3.1.h
      { prompt: '"I wanted pizza ___ pasta for dinner."\nWhich conjunction fits?', hint: '💡 Conjunctions join ideas: and, but, or, so, because', answer: 'and', others: ['but', 'because', 'although'] },
      { prompt: '"She was tired, ___ she kept on reading."\nWhich conjunction shows contrast?', hint: '💡 "but" connects two ideas that seem opposite', answer: 'but', others: ['and', 'so', 'or'] },
      // Comparative/Superlative — Idaho L.3.1.g
      { prompt: 'Which is a COMPARATIVE adjective?\n(comparing two things)',   hint: '💡 Comparative = -er ending: taller, faster, brighter',   answer: 'taller',    others: ['tall', 'tallest', 'tallness'] },
      { prompt: 'Which is a SUPERLATIVE adjective?\n(the most of all)',        hint: '💡 Superlative = -est ending: tallest, fastest, brightest', answer: 'brightest', others: ['bright', 'brighter', 'brightly'] },
    ],
  },
};

// ── Grade 1–2 reading question banks ───────────
Object.assign(READ_QUESTIONS, {
  grade1: {
    // Dolch Grade 1 sight words (Idaho RF.1.3.c)
    'sight-words': [
      { prompt: 'Find the word:\nAFTER',  hint: '💡 "She arrived after dinner."',               answer: 'after',  others: ['often', 'offer', 'afar'] },
      { prompt: 'Find the word:\nAGAIN',  hint: '💡 "Please read that again!"',                  answer: 'again',  others: ['began', 'begin', 'again'] },
      { prompt: 'Find the word:\nANY',    hint: '💡 "Do you have any apples?"',                  answer: 'any',    others: ['and', 'ant', 'own'] },
      { prompt: 'Find the word:\nAS',     hint: '💡 "She ran as fast as she could."',            answer: 'as',     others: ['at', 'an', 'us'] },
      { prompt: 'Find the word:\nASK',    hint: '💡 "I will ask my teacher."',                   answer: 'ask',    others: ['oak', 'ache', 'ink'] },
      { prompt: 'Find the word:\nBY',     hint: '💡 "The bag is by the door."',                  answer: 'by',     others: ['be', 'my', 'buy'] },
      { prompt: 'Find the word:\nCOULD',  hint: '💡 "She could swim very well."',                answer: 'could',  others: ['would', 'cold', 'colds'] },
      { prompt: 'Find the word:\nEVERY',  hint: '💡 "I brush my teeth every morning."',          answer: 'every',  others: ['even', 'ever', 'event'] },
      { prompt: 'Find the word:\nFLY',    hint: '💡 "Birds can fly high in the sky."',           answer: 'fly',    others: ['fry', 'sly', 'clay'] },
      { prompt: 'Find the word:\nFROM',   hint: '💡 "I got a letter from my friend."',           answer: 'from',   others: ['form', 'frog', 'for'] },
      { prompt: 'Find the word:\nGIVE',   hint: '💡 "Please give me a pencil."',                 answer: 'give',   others: ['live', 'gave', 'vine'] },
      { prompt: 'Find the word:\nGOING',  hint: '💡 "We are going to the park."',                answer: 'going',  others: ['doing', 'gone', 'goings'] },
      { prompt: 'Find the word:\nHAD',    hint: '💡 "She had a great idea."',                    answer: 'had',    others: ['has', 'have', 'bad'] },
      { prompt: 'Find the word:\nHAS',    hint: '💡 "He has a blue backpack."',                  answer: 'has',    others: ['had', 'was', 'his'] },
      { prompt: 'Find the word:\nHER',    hint: '💡 "This book belongs to her."',                answer: 'her',    others: ['here', 'there', 'him'] },
      { prompt: 'Find the word:\nHIM',    hint: '💡 "Give the ball to him."',                    answer: 'him',    others: ['his', 'hit', 'hid'] },
      { prompt: 'Find the word:\nHIS',    hint: '💡 "That is his lunchbox."',                    answer: 'his',    others: ['hers', 'him', 'this'] },
      { prompt: 'Find the word:\nHOW',    hint: '💡 "How did you do that?"',                     answer: 'how',    others: ['now', 'wow', 'who'] },
      { prompt: 'Find the word:\nJUST',   hint: '💡 "I just finished my homework."',             answer: 'just',   others: ['gust', 'bust', 'rust'] },
      { prompt: 'Find the word:\nKNOW',   hint: '💡 "I know the answer!"',                       answer: 'know',   others: ['now', 'knew', 'knob'] },
      { prompt: 'Find the word:\nLET',    hint: '💡 "Let me try that again."',                   answer: 'let',    others: ['lot', 'lit', 'net'] },
      { prompt: 'Find the word:\nLIVE',   hint: '💡 "We live on Oak Street."',                   answer: 'live',   others: ['like', 'lime', 'give'] },
      { prompt: 'Find the word:\nMAY',    hint: '💡 "May I have a cookie please?"',              answer: 'may',    others: ['say', 'man', 'many'] },
      { prompt: 'Find the word:\nOF',     hint: '💡 "A cup of water, please."',                  answer: 'of',     others: ['off', 'if', 'or'] },
      { prompt: 'Find the word:\nOLD',    hint: '💡 "My grandpa is old and wise."',              answer: 'old',    others: ['gold', 'hold', 'told'] },
      { prompt: 'Find the word:\nONCE',   hint: '💡 "I visited that park once before."',         answer: 'once',   others: ['one', 'ounce', 'dance'] },
      { prompt: 'Find the word:\nOPEN',   hint: '💡 "Please open the window."',                  answer: 'open',   others: ['oven', 'over', 'upon'] },
      { prompt: 'Find the word:\nOVER',   hint: '💡 "The bird flew over the tree."',             answer: 'over',   others: ['ever', 'oven', 'offer'] },
      { prompt: 'Find the word:\nPUT',    hint: '💡 "Put your backpack on the hook."',           answer: 'put',    others: ['but', 'cut', 'gut'] },
      { prompt: 'Find the word:\nROUND',  hint: '💡 "The Earth is round."',                      answer: 'round',  others: ['found', 'mound', 'wound'] },
      { prompt: 'Find the word:\nSOME',   hint: '💡 "I would like some grapes."',                answer: 'some',   others: ['home', 'same', 'foam'] },
      { prompt: 'Find the word:\nSTOP',   hint: '💡 "Stop at the red light."',                   answer: 'stop',   others: ['step', 'shop', 'drop'] },
      { prompt: 'Find the word:\nTAKE',   hint: '💡 "Take your jacket — it is cold!"',           answer: 'take',   others: ['lake', 'make', 'rake'] },
      { prompt: 'Find the word:\nTHANK',  hint: '💡 "Thank you for your help!"',                 answer: 'thank',  others: ['think', 'thing', 'tank'] },
      { prompt: 'Find the word:\nTHEM',   hint: '💡 "I gave the books to them."',                answer: 'them',   others: ['then', 'there', 'the'] },
      { prompt: 'Find the word:\nTHEN',   hint: '💡 "First wash your hands, then eat."',         answer: 'then',   others: ['them', 'when', 'than'] },
      { prompt: 'Find the word:\nTHINK',  hint: '💡 "Think before you answer."',                 answer: 'think',  others: ['thing', 'thank', 'thick'] },
      { prompt: 'Find the word:\nWALK',   hint: '💡 "We walk to school every day."',             answer: 'walk',   others: ['talk', 'wall', 'woke'] },
      { prompt: 'Find the word:\nWERE',   hint: '💡 "They were at the park."',                   answer: 'were',   others: ['here', 'where', 'we\'re'] },
      { prompt: 'Find the word:\nWHEN',   hint: '💡 "When does school start?"',                  answer: 'when',   others: ['then', 'where', 'what'] },
    ],
    // Long vowels, CVCe, vowel digraphs (Idaho RF.1.3.b-c)
    'phonics': [
      { prompt: 'Which word has a LONG A sound?',  hint: '💡 Long A says /ay/ as in: cake, rain, day',   answer: 'cake',  others: ['cap', 'cat', 'cab'] },
      { prompt: 'Which word has a LONG E sound?',  hint: '💡 Long E says /ee/ as in: tree, feet, meat',  answer: 'tree',  others: ['ten', 'tell', 'tent'] },
      { prompt: 'Which word has a LONG I sound?',  hint: '💡 Long I says /eye/ as in: bike, kite, pine', answer: 'bike',  others: ['big', 'bit', 'bid'] },
      { prompt: 'Which word has a LONG O sound?',  hint: '💡 Long O says /oh/ as in: rope, boat, snow',  answer: 'rope',  others: ['hop', 'rob', 'rod'] },
      { prompt: 'Which word has a LONG U sound?',  hint: '💡 Long U says /yoo/ as in: cube, flute, mule',answer: 'cube',  others: ['cub', 'cup', 'cut'] },
      { prompt: 'What does the silent E do\nin the word CAKE?',  hint: '💡 Silent E at the end makes the vowel before it say its name!', answer: 'Makes the A say its name /ay/', others: ['Makes the C quiet', 'Adds a new sound', 'Makes the word shorter'] },
      { prompt: 'Which word uses the AI pattern?', hint: '💡 AI together says /ay/: rain, tail, mail, sail', answer: 'rain',  others: ['ran', 'run', 'rin'] },
      { prompt: 'Which word uses the AY pattern?', hint: '💡 AY at the end says /ay/: day, play, say, way',  answer: 'play',  others: ['plan', 'plop', 'plot'] },
      { prompt: 'Which word uses the EE pattern?', hint: '💡 EE together says /ee/: tree, feet, sleep',      answer: 'feet',  others: ['fat', 'fit', 'felt'] },
      { prompt: 'Which word uses the EA pattern?', hint: '💡 EA together says /ee/: meat, read, seat, beat', answer: 'meat',  others: ['mat', 'met', 'mitt'] },
      { prompt: 'Which word uses the OA pattern?', hint: '💡 OA together says /oh/: boat, coat, goat, road', answer: 'boat',  others: ['bat', 'bit', 'but'] },
      { prompt: 'Which word uses the OW pattern?', hint: '💡 OW can say /oh/: snow, blow, show, flow',       answer: 'snow',  others: ['snob', 'snop', 'snap'] },
      { prompt: 'Sound it out (CVCe):\nP · I · N · E',  hint: '💡 The silent E makes I say /eye/: p-i-n-e = pine', answer: 'pine', others: ['pin', 'pan', 'pen'] },
      { prompt: 'Sound it out (CVCe):\nH · O · M · E',  hint: '💡 The silent E makes O say /oh/: h-o-m-e = home', answer: 'home', others: ['hom', 'ham', 'hem'] },
      { prompt: 'Sound it out (CVCe):\nT · U · B · E',  hint: '💡 The silent E makes U say /yoo/: t-u-b-e = tube', answer: 'tube', others: ['tub', 'tab', 'top'] },
      { prompt: 'Sound it out (CVCe):\nN · A · M · E',  hint: '💡 The silent E makes A say /ay/: n-a-m-e = name', answer: 'name', others: ['nap', 'nab', 'knob'] },
      { prompt: 'Sound it out (CVCe):\nH · I · D · E',  hint: '💡 The silent E makes I say /eye/: h-i-d-e = hide', answer: 'hide', others: ['hid', 'had', 'head'] },
      { prompt: 'Sound it out (CVCe):\nR · O · P · E',  hint: '💡 The silent E makes O say /oh/: r-o-p-e = rope', answer: 'rope', others: ['rob', 'rip', 'rap'] },
      { prompt: 'Which word rhymes with RAIN?',   hint: '💡 Rhyming words share the same ending sound: -ain', answer: 'main',  others: ['man', 'moon', 'mine'] },
      { prompt: 'Which word rhymes with TREE?',   hint: '💡 Rhyming words share the same ending sound: -ee',  answer: 'bee',   others: ['bat', 'bit', 'bay'] },
      { prompt: 'Which word rhymes with KITE?',   hint: '💡 Rhyming words share the same ending sound: -ite', answer: 'bite',  others: ['kit', 'cat', 'cute'] },
      { prompt: 'Which word rhymes with COAT?',   hint: '💡 Rhyming words share the same ending sound: -oat', answer: 'goat',  others: ['got', 'gate', 'gust'] },
      { prompt: 'Which word has a SHORT vowel?',  hint: '💡 Short vowel = closed in by consonants: cat, sit, hop, run', answer: 'hat',  others: ['hate', 'heat', 'hoot'] },
      { prompt: 'Which word has a LONG vowel?',   hint: '💡 Long vowel = vowel says its name: cake, feet, kite, bone', answer: 'lake', others: ['lick', 'lock', 'luck'] },
      { prompt: 'What does the OU pattern say\nin the word CLOUD?', hint: '💡 OU in cloud/out/round = /ow/ (like "ow that hurts!")', answer: '/ow/ as in "out"', others: ['/oh/ as in "boat"', '/oo/ as in "moon"', '/uh/ as in "up"'] },
    ],
    // Word families / rimes (Idaho RF.1.2.a-c)
    'word-families': [
      { prompt: 'Which word belongs to\nthe -IGHT family?',   hint: '💡 -ight family: night, light, right, fight, sight, might',  answer: 'night',  others: ['nine', 'nice', 'nail'] },
      { prompt: 'Which word belongs to\nthe -AKE family?',    hint: '💡 -ake family: cake, lake, take, make, rake, wake, bake',    answer: 'lake',   others: ['like', 'luck', 'lock'] },
      { prompt: 'Which word belongs to\nthe -INE family?',    hint: '💡 -ine family: nine, pine, fine, mine, vine, line, dine',    answer: 'pine',   others: ['pan', 'pen', 'pin'] },
      { prompt: 'Which word belongs to\nthe -ATE family?',    hint: '💡 -ate family: late, gate, date, rate, plate, skate',        answer: 'gate',   others: ['got', 'gut', 'get'] },
      { prompt: 'Which word belongs to\nthe -OAT family?',    hint: '💡 -oat family: boat, goat, coat, float, throat',             answer: 'goat',   others: ['got', 'gust', 'gate'] },
      { prompt: 'Which word rhymes with NIGHT\nand has 5 letters?', hint: '💡 -ight family: light, fight, might, right, sight',    answer: 'light',  others: ['limp', 'lime', 'link'] },
      { prompt: 'Make a new word!\nChange B in BIKE to L:', hint: '💡 B-ike → L-ike: just swap the first letter!',                 answer: 'like',   others: ['lake', 'loke', 'luke'] },
      { prompt: 'Make a new word!\nChange C in CAKE to L:', hint: '💡 C-ake → L-ake: swap the first letter!',                      answer: 'lake',   others: ['like', 'luck', 'lack'] },
      { prompt: 'Make a new word!\nChange H in HAT to B:',  hint: '💡 H-at → B-at: just swap the first letter!',                   answer: 'bat',    others: ['bit', 'but', 'bet'] },
      { prompt: 'Make a new word!\nChange C in CAT to M:',  hint: '💡 C-at → M-at: swap the first letter!',                        answer: 'mat',    others: ['met', 'mit', 'mut'] },
      { prompt: 'Which word is in the\n-OT family?',        hint: '💡 -ot family: hot, dot, pot, lot, rot, got, not',              answer: 'pot',    others: ['pat', 'pit', 'put'] },
      { prompt: 'Which word is in the\n-UN family?',        hint: '💡 -un family: run, fun, sun, bun, gun, nun',                   answer: 'sun',    others: ['sin', 'son', 'seen'] },
      { prompt: 'Which word is in the\n-ELL family?',       hint: '💡 -ell family: bell, sell, tell, well, fell, yell',            answer: 'bell',   others: ['bill', 'ball', 'bull'] },
      { prompt: 'Which word is in the\n-INK family?',       hint: '💡 -ink family: pink, sink, link, rink, wink, think',           answer: 'pink',   others: ['pine', 'pint', 'pick'] },
      { prompt: 'Which word is in the\n-ANG family?',       hint: '💡 -ang family: sang, bang, rang, hang, fang',                  answer: 'sang',   others: ['sand', 'same', 'save'] },
      { prompt: 'Which word is in the\n-ONG family?',       hint: '💡 -ong family: long, song, strong, belong, wrong',             answer: 'song',   others: ['some', 'sort', 'sole'] },
      { prompt: 'Which word is in the\n-ACK family?',       hint: '💡 -ack family: back, pack, rack, sack, track, black',          answer: 'pack',   others: ['peak', 'pick', 'poke'] },
      { prompt: 'Which word is in the\n-OOK family?',       hint: '💡 -ook family: book, look, cook, took, hook, brook',           answer: 'cook',   others: ['coat', 'coil', 'cope'] },
      { prompt: 'Which word is in the\n-EAT family?',       hint: '💡 -eat family: meat, beat, heat, feat, seat, treat, wheat',    answer: 'heat',   others: ['hat', 'hit', 'hut'] },
      { prompt: 'Change the middle letter!\nMake PAN into PIN:', hint: '💡 P-A-N → P-I-N: just change the vowel!',                 answer: 'pin',    others: ['pan', 'pen', 'pun'] },
      { prompt: 'Change the middle letter!\nMake HIT into HAT:', hint: '💡 H-I-T → H-A-T: swap the vowel!',                       answer: 'hat',    others: ['hit', 'hot', 'hut'] },
      { prompt: 'Which two words rhyme?',                   hint: '💡 Rhyming words share the same ending sounds',                 answer: 'cake / lake',  others: ['cake / cup', 'lake / look', 'cake / back'] },
      { prompt: 'Which two words rhyme?',                   hint: '💡 Rhyming words share the same ending sounds',                 answer: 'night / right', others: ['night / nine', 'right / rot', 'night / neat'] },
      { prompt: 'Which two words rhyme?',                   hint: '💡 Rhyming words share the same ending sounds',                 answer: 'sing / ring',  others: ['sing / sink', 'ring / ran', 'sing / song'] },
      { prompt: 'Which two words rhyme?',                   hint: '💡 Rhyming words share the same ending sounds',                 answer: 'tree / bee',   others: ['tree / trick', 'bee / bay', 'tree / tray'] },
    ],
  },
  grade2: {
    // Dolch Grade 2 sight words (Idaho RF.2.3.c)
    'sight-words': [
      { prompt: 'Find the word:\nALWAYS',  hint: '💡 "She always brushes her teeth."',             answer: 'always',  others: ['already', 'almost', 'also'] },
      { prompt: 'Find the word:\nAROUND',  hint: '💡 "We walked around the lake."',                 answer: 'around',  others: ['ground', 'found', 'abound'] },
      { prompt: 'Find the word:\nBECAUSE', hint: '💡 "I smiled because I was happy."',              answer: 'because', others: ['before', 'become', 'below'] },
      { prompt: 'Find the word:\nBEEN',    hint: '💡 "We have been to that park before."',          answer: 'been',    others: ['bean', 'seen', 'keen'] },
      { prompt: 'Find the word:\nBEFORE',  hint: '💡 "Wash your hands before dinner."',             answer: 'before',  others: ['below', 'between', 'behind'] },
      { prompt: 'Find the word:\nBEST',    hint: '💡 "That is my best drawing."',                   answer: 'best',    others: ['rest', 'nest', 'test'] },
      { prompt: 'Find the word:\nBOTH',    hint: '💡 "Both dogs are friendly."',                    answer: 'both',    others: ['moth', 'cloth', 'broth'] },
      { prompt: 'Find the word:\nBUY',     hint: '💡 "I want to buy a new book."',                  answer: 'buy',     others: ['by', 'guy', 'bye'] },
      { prompt: 'Find the word:\nCALL',    hint: '💡 "Please call me when you arrive."',            answer: 'call',    others: ['fall', 'tall', 'wall'] },
      { prompt: 'Find the word:\nCOLD',    hint: '💡 "It is very cold outside today."',             answer: 'cold',    others: ['gold', 'bold', 'told'] },
      { prompt: 'Find the word:\nDOES',    hint: '💡 "She does her homework every night."',         answer: 'does',    others: ['goes', 'toes', 'foes'] },
      { prompt: "Find the word:\nDON'T",  hint: "💡 \"I don't like spiders!\"",                    answer: "don't",   others: ['dont', "didn't", "won't"] },
      { prompt: 'Find the word:\nFAST',    hint: '💡 "The cheetah runs very fast."',                answer: 'fast',    others: ['last', 'past', 'mast'] },
      { prompt: 'Find the word:\nFIRST',   hint: '💡 "I was the first one in line."',               answer: 'first',   others: ['thirst', 'burst', 'worst'] },
      { prompt: 'Find the word:\nFOUND',   hint: '💡 "I found my lost pencil!"',                    answer: 'found',   others: ['round', 'sound', 'bound'] },
      { prompt: 'Find the word:\nGAVE',    hint: '💡 "She gave me a birthday card."',               answer: 'gave',    others: ['cave', 'save', 'wave'] },
      { prompt: 'Find the word:\nGOES',    hint: '💡 "He goes to the park on Saturdays."',          answer: 'goes',    others: ['does', 'toes', 'foes'] },
      { prompt: 'Find the word:\nGREEN',   hint: '💡 "The grass is bright green."',                 answer: 'green',   others: ['greet', 'greed', 'greel'] },
      { prompt: "Find the word:\nITS",     hint: '💡 "The dog wagged its tail." (belonging)',       answer: 'its',     others: ["it's", 'its\'', 'its,'] },
      { prompt: 'Find the word:\nMANY',    hint: '💡 "There are many stars in the sky."',           answer: 'many',    others: ['may', 'mane', 'men'] },
      { prompt: 'Find the word:\nOFF',     hint: '💡 "Please turn off the light."',                 answer: 'off',     others: ['of', 'offer', 'often'] },
      { prompt: 'Find the word:\nSLEEP',   hint: '💡 "I sleep eight hours every night."',           answer: 'sleep',   others: ['steep', 'sheep', 'seep'] },
      { prompt: 'Find the word:\nTHEIR',   hint: '💡 "The kids left their backpacks by the door."', answer: 'their',   others: ['there', "they're", 'the'] },
      { prompt: 'Find the word:\nTHESE',   hint: '💡 "These shoes are too small."',                 answer: 'these',   others: ['those', 'there', 'them'] },
      { prompt: 'Find the word:\nWOULD',   hint: '💡 "I would love some ice cream."',               answer: 'would',   others: ['could', 'should', 'wood'] },
    ],
    // Vowel teams + r-controlled vowels (Idaho RF.2.3.a-b)
    'vowel-teams': [
      { prompt: 'What sound does AI make\nin the word RAIN?',  hint: '💡 AI together = /ay/ as in: rain, mail, tail, sail, trail',  answer: '/ay/ — like in "day"',  others: ['/ah/ — like in "cat"', '/ee/ — like in "feet"', '/ih/ — like in "sit"'] },
      { prompt: 'What sound does AY make\nin the word DAY?',   hint: '💡 AY at the end = /ay/: day, play, say, stay, spray',       answer: '/ay/ — like in "rain"', others: ['/ah/ — like in "cat"', '/oh/ — like in "boat"', '/oo/ — like in "moon"'] },
      { prompt: 'What sound does EE make\nin the word TREE?',  hint: '💡 EE together = /ee/: tree, feet, sleep, keep, green',      answer: '/ee/ — like in "me"',   others: ['/ay/ — like in "day"', '/eh/ — like in "bed"', '/oh/ — like in "boat"'] },
      { prompt: 'What sound does EA make\nin the word MEAT?',  hint: '💡 EA together usually = /ee/: meat, read, seat, beach',     answer: '/ee/ — like in "tree"', others: ['/ay/ — like in "day"', '/uh/ — like in "up"', '/ah/ — like in "cat"'] },
      { prompt: 'What sound does OA make\nin the word BOAT?',  hint: '💡 OA together = /oh/: boat, coat, goat, float, road',      answer: '/oh/ — like in "no"',   others: ['/aw/ — like in "saw"', '/oo/ — like in "moon"', '/ow/ — like in "cow"'] },
      { prompt: 'What sound does OW make\nin SNOW?',          hint: '💡 OW can say /oh/ in: snow, blow, flow, glow, show',       answer: '/oh/ — like in "boat"', others: ['/ow/ — like in "cow"', '/oo/ — like in "moon"', '/aw/ — like in "saw"'] },
      { prompt: 'What sound does OW make\nin COW?',           hint: '💡 OW can say /ow/ in: cow, now, how, plow, crowd',         answer: '/ow/ — like in "out"',  others: ['/oh/ — like in "snow"', '/oo/ — like in "moon"', '/ah/ — like in "cat"'] },
      { prompt: 'What sound does OI make\nin COIN?',          hint: '💡 OI together = /oy/: coin, oil, boil, foil, join, point', answer: '/oy/ — like in "boy"',  others: ['/oh/ — like in "boat"', '/ee/ — like in "tree"', '/oo/ — like in "moon"'] },
      { prompt: 'What sound does OY make\nin BOY?',           hint: '💡 OY at the end = /oy/: boy, joy, toy, enjoy, destroy',   answer: '/oy/ — like in "coin"', others: ['/oh/ — like in "boat"', '/oo/ — like in "moon"', '/ay/ — like in "day"'] },
      { prompt: 'What sound does OU make\nin CLOUD?',         hint: '💡 OU = /ow/ in: cloud, out, round, found, sound',         answer: '/ow/ — like in "cow"',  others: ['/oh/ — like in "boat"', '/oo/ — like in "moon"', '/uh/ — like in "up"'] },
      { prompt: 'What does AR sound like\nin the word CAR?',  hint: '💡 AR = r-controlled vowel: car, star, farm, hard, yard',  answer: '/ar/ — like in "star"', others: ['/air/ — like in "hair"', '/or/ — like in "corn"', '/er/ — like in "her"'] },
      { prompt: 'What does ER sound like\nin the word HER?',  hint: '💡 ER = r-controlled vowel: her, fern, verb, stern, perch', answer: '/er/ — like in "bird"', others: ['/ar/ — like in "car"', '/or/ — like in "corn"', '/air/ — like in "hair"'] },
      { prompt: 'What does IR sound like\nin the word BIRD?', hint: '💡 IR = r-controlled vowel: bird, girl, shirt, first, third', answer: '/er/ — like in "her"', others: ['/ar/ — like in "car"', '/or/ — like in "corn"', '/igh/ — like in "night"'] },
      { prompt: 'What does OR sound like\nin the word CORN?', hint: '💡 OR = r-controlled vowel: corn, born, fork, horn, storm', answer: '/or/ — like in "for"',  others: ['/ar/ — like in "car"', '/er/ — like in "her"', '/oo/ — like in "moon"'] },
      { prompt: 'What does UR sound like\nin the word FUR?',  hint: '💡 UR = r-controlled vowel: fur, burn, turn, hurt, curve', answer: '/er/ — like in "her"',  others: ['/ar/ — like in "car"', '/or/ — like in "corn"', '/oo/ — like in "moon"'] },
      { prompt: 'Which word has the AR sound?',  hint: '💡 AR sounds like /ar/: car, jar, star, park, farm',  answer: 'star',  others: ['stir', 'store', 'steer'] },
      { prompt: 'Which word has the ER sound?',  hint: '💡 ER sounds like /er/: her, fern, serve, stern',     answer: 'fern',  others: ['fun', 'fan', 'fin'] },
      { prompt: 'Which word has the OR sound?',  hint: '💡 OR sounds like /or/: horn, corn, torn, storm',     answer: 'horn',  others: ['hen', 'hun', 'han'] },
      { prompt: 'Which word uses the OO pattern\nthat sounds like "moon"?', hint: '💡 OO (long) = /oo/: moon, soon, food, pool, tooth', answer: 'moon',  others: ['man', 'men', 'mon'] },
      { prompt: 'Which word uses the OO pattern\nthat sounds like "book"?', hint: '💡 OO (short) = /oo/: book, cook, hook, look, took', answer: 'book',  others: ['bake', 'bike', 'broke'] },
      { prompt: 'Which vowel team is in SLEEP?', hint: '💡 What two vowels are together in sleep? S-L-EE-P',  answer: 'EE',   others: ['EA', 'AI', 'OA'] },
      { prompt: 'Which vowel team is in GOAT?',  hint: '💡 What two vowels are together in goat? G-OA-T',     answer: 'OA',   others: ['OW', 'OU', 'OI'] },
      { prompt: 'Which vowel team is in TRAIL?', hint: '💡 What two vowels are together in trail? T-R-AI-L',  answer: 'AI',   others: ['AY', 'EA', 'EE'] },
      { prompt: 'Which vowel team is in TEACH?', hint: '💡 What two vowels are together in teach? T-EA-CH',   answer: 'EA',   others: ['EE', 'AI', 'OA'] },
      { prompt: 'Which word has a\nr-controlled vowel?',      hint: '💡 R-controlled vowels: ar, er, ir, or, ur — the R changes the vowel sound!', answer: 'farm', others: ['fame', 'face', 'fake'] },
    ],
    // Prefixes and suffixes (Idaho RF.2.3.d, L.2.4.b)
    'prefixes-suffixes': [
      { prompt: 'What does UN- mean\nin "unkind"?',         hint: '💡 UN- means "not": unkind = not kind, unhappy = not happy',     answer: 'Not',         others: ['Very', 'Again', 'Before'] },
      { prompt: 'What does RE- mean\nin "redo"?',           hint: '💡 RE- means "again": redo = do again, rewrite = write again',   answer: 'Again',       others: ['Not', 'Before', 'After'] },
      { prompt: 'What does PRE- mean\nin "preview"?',       hint: '💡 PRE- means "before": preview = see before, preheat = heat before', answer: 'Before',  others: ['After', 'Again', 'Not'] },
      { prompt: 'What does -FUL mean\nin "helpful"?',       hint: '💡 -ful means "full of": helpful = full of help, joyful = full of joy', answer: 'Full of', others: ['Without', 'Again', 'Very'] },
      { prompt: 'What does -LESS mean\nin "hopeless"?',     hint: '💡 -less means "without": hopeless = without hope, fearless = without fear', answer: 'Without', others: ['Full of', 'Again', 'Before'] },
      { prompt: 'What does -ED mean\nin "jumped"?',         hint: '💡 -ed means it already happened in the past: jumped, walked, played', answer: 'Already happened (past)', others: ['Happening right now', 'Will happen later', 'Happens all the time'] },
      { prompt: 'What does -ING mean\nin "running"?',       hint: '💡 -ing means happening right now: running, jumping, eating',    answer: 'Happening right now',    others: ['Already happened', 'Will happen later', 'Happens every day'] },
      { prompt: 'What does -ER mean\nin "faster"?',         hint: '💡 -er compares two things: faster = more fast, taller = more tall', answer: 'More (comparing two things)', others: ['The most of all', 'Without', 'Full of'] },
      { prompt: 'What does -EST mean\nin "fastest"?',       hint: '💡 -est = the most of all: fastest, tallest, brightest',         answer: 'The most of all',    others: ['Comparing two', 'Without', 'Full of'] },
      { prompt: 'Add UN- to "happy".\nWhat is the new word?', hint: '💡 UN- + happy = unhappy (means not happy)',                  answer: 'unhappy',     others: ['unhappy', 'nothappy', 'dehappy', 'unhappily'] },
      { prompt: 'Add RE- to "build".\nWhat is the new word?',  hint: '💡 RE- + build = rebuild (means build again)',               answer: 'rebuild',     others: ['debuld', 'prebuild', 'unbuild'] },
      { prompt: 'Add -FUL to "color".\nWhat is the new word?', hint: '💡 color + -ful = colorful (means full of color)',           answer: 'colorful',    others: ['coloring', 'colored', 'colorless'] },
      { prompt: 'Add -LESS to "care".\nWhat is the new word?', hint: '💡 care + -less = careless (means without care)',            answer: 'careless',    others: ['careful', 'caring', 'carer'] },
      { prompt: 'Which word means\n"do again"?',             hint: '💡 RE- means "again": re + do = redo',                         answer: 'redo',        others: ['undo', 'overdo', 'prodo'] },
      { prompt: 'Which word means\n"not safe"?',             hint: '💡 UN- means "not": un + safe = unsafe',                       answer: 'unsafe',      others: ['resafe', 'presafe', 'desafe'] },
      { prompt: 'Which word means\n"full of hope"?',         hint: '💡 hope + -ful = hopeful (full of hope)',                      answer: 'hopeful',     others: ['hopeless', 'hoping', 'hoped'] },
      { prompt: 'Which word means\n"without power"?',        hint: '💡 power + -less = powerless (without power)',                 answer: 'powerless',   others: ['powerful', 'powering', 'overpower'] },
      { prompt: 'What is the ROOT WORD\nin "replaying"?',    hint: '💡 Root word = the base word without prefixes/suffixes: re-PLAY-ing', answer: 'play',  others: ['replay', 'replaying', 'playing'] },
      { prompt: 'What is the ROOT WORD\nin "unhelpful"?',    hint: '💡 Root word = the base word: un-HELP-ful',                   answer: 'help',        others: ['unhelpful', 'helpful', 'helping'] },
      { prompt: 'Which word has a PREFIX?',                  hint: '💡 A prefix comes BEFORE the root word: un-, re-, pre-, dis-', answer: 'rewrite',     others: ['writing', 'written', 'writes'] },
      { prompt: 'Which word has a SUFFIX?',                  hint: '💡 A suffix comes AFTER the root word: -ful, -less, -er, -ed, -ing', answer: 'playful', others: ['play', 'replay', 'preplayed'] },
      { prompt: 'How many syllables\nin "helpful"?',         hint: '💡 Clap it out: HELP-ful = 2 claps = 2 syllables',             answer: '2',           others: ['1', '3', '4'] },
      { prompt: 'How many syllables\nin "unhappy"?',         hint: '💡 Clap it out: un-HAP-py = 3 claps = 3 syllables',            answer: '3',           others: ['1', '2', '4'] },
      { prompt: 'Add -LY to "slow".\nWhat is the new word?',  hint: '💡 slow + -ly = slowly (describes HOW something is done)',   answer: 'slowly',      others: ['slowful', 'slowest', 'slower'] },
      { prompt: 'What does -LY mean\nin "quickly"?',          hint: '💡 -ly turns adjectives into adverbs describing HOW: quickly = in a quick way', answer: 'In that way / how it is done', others: ['Full of', 'Without', 'The most'] },
    ],
  },
});

// ── Grade 4–6 reading question banks ───────────
Object.assign(READ_QUESTIONS, {
  grade4: {
    // Tier 2 academic vocabulary + context clues (Idaho L.4.4, L.4.6)
    'vocabulary': [
      { prompt: 'What does "analyze" mean?',      hint: '💡 "Scientists analyze data carefully to find patterns in their experiments."',       answer: 'To study something carefully to understand it',   others: ['To ignore something', 'To break something apart physically', 'To describe something quickly'] },
      { prompt: 'What does "conclude" mean?',     hint: '💡 "After reading the evidence, she concluded the experiment was a success."',        answer: 'To reach a decision after careful thought',       others: ['To begin something', 'To disagree with someone', 'To make a mistake'] },
      { prompt: 'What does "sufficient" mean?',   hint: '💡 "She had sufficient supplies to complete the project before the deadline."',       answer: 'Enough for what is needed',                       others: ['Far too much', 'Not nearly enough', 'Exactly perfect'] },
      { prompt: 'What does "contribute" mean?',   hint: '💡 "Each student contributed ideas to the group project."',                          answer: 'To give or add to something',                     others: ['To take away from something', 'To finish something', 'To argue about something'] },
      { prompt: 'What does "significant" mean?',  hint: '💡 "The discovery was significant — it changed everything scientists believed."',    answer: 'Important or meaningful',                         others: ['Very small and unimportant', 'Hard to see or find', 'Simple and easy'] },
      { prompt: 'What does "interpret" mean?',    hint: '💡 "Can you interpret what this graph is showing us?"',                              answer: 'To explain the meaning of something',             others: ['To copy something exactly', 'To erase something', 'To predict the future'] },
      { prompt: 'What does "demonstrate" mean?',  hint: '💡 "The teacher demonstrated the experiment step by step so we could follow."',     answer: 'To show how something is done',                   others: ['To hide how something works', 'To ask a question about something', 'To write about something'] },
      { prompt: 'What does "evaluate" mean?',     hint: '💡 "The judges will evaluate each student\'s science fair project carefully."',     answer: 'To judge the value or quality of something',      others: ['To ignore something', 'To copy something', 'To build something new'] },
      { prompt: 'What does "technique" mean?',    hint: '💡 "She used a special painting technique to blend the colors perfectly."',         answer: 'A specific way of doing something skillfully',    others: ['A type of tool or machine', 'A kind of material', 'A location or place'] },
      { prompt: 'What does "consequence" mean?',  hint: '💡 "Leaving food out had a serious consequence — ants came in!"',                  answer: 'A result or outcome of an action',                others: ['A type of question', 'A beginning or start', 'A reason for doing something'] },
      { prompt: 'What does "perspective" mean?',  hint: '💡 "From a bird\'s perspective, the neighborhood looks like a tiny patchwork."',    answer: 'A particular point of view or way of seeing',    others: ['A type of measurement', 'A kind of color', 'A style of clothing'] },
      { prompt: 'What does "transform" mean?',    hint: '💡 "The caterpillar transforms into a beautiful butterfly."',                       answer: 'To change completely in form or nature',          others: ['To stay exactly the same', 'To become smaller', 'To travel to a new place'] },
      { prompt: 'What does "relevant" mean?',     hint: '💡 "Make sure your details are relevant to the main topic of your essay."',        answer: 'Directly connected to the topic at hand',        others: ['Far off topic', 'Very interesting', 'Difficult to understand'] },
      { prompt: 'What does "acquire" mean?',      hint: '💡 "Over time, she acquired many new skills by practicing every day."',            answer: 'To gain or obtain something over time',           others: ['To lose something slowly', 'To give something away', 'To break something apart'] },
      { prompt: 'What does "efficient" mean?',    hint: '💡 "The efficient worker finished her tasks quickly without wasting any time."',    answer: 'Getting things done without wasting time or effort', others: ['Doing things slowly and carefully', 'Making many mistakes', 'Working alone'] },
      { prompt: 'What does "precise" mean?',      hint: '💡 "The engineer made precise measurements — every millimeter counted."',          answer: 'Exact and accurate, without error',               others: ['Rough and approximate', 'Very large and broad', 'Simple and basic'] },
      { prompt: 'What does "establish" mean?',    hint: '💡 "The settlers worked hard to establish a new community in the wilderness."',    answer: 'To set up or create something firmly',            others: ['To destroy something completely', 'To move somewhere', 'To find something lost'] },
      { prompt: 'What does "identify" mean?',     hint: '💡 "Can you identify which rock is granite and which is limestone?"',             answer: 'To recognize and name something',                 others: ['To hide or disguise something', 'To measure something', 'To sort things by size'] },
      { prompt: 'What does "examine" mean?',      hint: '💡 "The doctor examined the patient carefully to check for any problems."',        answer: 'To look at or study something very carefully',    others: ['To glance at quickly', 'To destroy or remove', 'To guess without looking'] },
      { prompt: 'What does "influence" mean?',    hint: '💡 "A good book can influence the way you think about the world."',               answer: 'To have an effect on someone or something',       others: ['To have no effect at all', 'To push something away', 'To completely change direction'] },
      { prompt: 'What does "justify" mean?',      hint: '💡 "She had to justify her answer by explaining her reasoning clearly."',         answer: 'To give reasons to support a decision or action', others: ['To apologize for being wrong', 'To change your mind', 'To avoid answering'] },
      { prompt: 'What does "structure" mean?',    hint: '💡 "A good essay has a clear structure: introduction, body, and conclusion."',    answer: 'The way something is organized or built',         others: ['The color of something', 'The length of something', 'The age of something'] },
      { prompt: 'What does "obtain" mean?',       hint: '💡 "You need a library card to obtain books from the public library."',           answer: 'To get or receive something',                     others: ['To give something away', 'To break something apart', 'To hide something away'] },
      { prompt: 'What does "determine" mean?',    hint: '💡 "The detective tried to determine the cause of the mysterious sound."',        answer: 'To find out or decide something',                 others: ['To ignore a problem', 'To create something from scratch', 'To celebrate something'] },
      { prompt: 'What does "support" mean\n(in writing)?', hint: '💡 "Use evidence from the text to support your argument."',              answer: 'To back up an idea with evidence or reasons',    others: ['To disagree with an idea', 'To delete part of your writing', 'To start a new paragraph'] },
    ],
    // Homophones, spelling patterns (Idaho L.4.2.d)
    'spelling': [
      { prompt: 'Choose the correct word:\n"Put the book over ___ on the shelf."', hint: '💡 "there" = a place. "their" = belonging to them. "they\'re" = they are.', answer: 'there', others: ['their', "they're", 'thare'] },
      { prompt: 'Choose the correct word:\n"___ backpacks are on the hook."',      hint: '💡 "Their" = belonging to them (possessive).', answer: 'Their', others: ['There', "They're", 'Thier'] },
      { prompt: 'Choose the correct word:\n"___ going to the science fair!"',       hint: '💡 "They\'re" = they are (contraction).', answer: "They're", others: ['Their', 'There', 'Theyre'] },
      { prompt: 'Choose the correct word:\n"I want ___ go to the movies."',         hint: '💡 "to" = direction or purpose. "too" = also/very. "two" = the number 2.', answer: 'to', others: ['too', 'two', 'tow'] },
      { prompt: 'Choose the correct word:\n"Can I come ___ ?"',                     hint: '💡 "too" means also or as well.', answer: 'too', others: ['to', 'two', 'tow'] },
      { prompt: 'Choose the correct word:\n"I have ___ dogs."',                     hint: '💡 "two" = the number 2.', answer: 'two', others: ['too', 'to', 'tow'] },
      { prompt: 'Choose the correct word:\n"Is that ___ lunchbox?"',                hint: '💡 "your" = belonging to you. "you\'re" = you are.', answer: 'your', others: ["you're", 'yore', 'yor'] },
      { prompt: 'Choose the correct word:\n"___ going to love this book!"',         hint: '💡 "you\'re" = you are (contraction).', answer: "You're", others: ['Your', 'Yore', 'Youre'] },
      { prompt: 'Choose the correct word:\n"The dog wagged ___ tail."',             hint: '💡 "its" = belonging to it. "it\'s" = it is.', answer: 'its', others: ["it's", 'its\'', 'its,'] },
      { prompt: 'Choose the correct word:\n"___ raining outside today."',           hint: '💡 "It\'s" = it is (contraction).', answer: "It's", others: ['Its', "Its'", 'Itss'] },
      { prompt: 'Choose the correct word:\n"She is taller ___ her brother."',       hint: '💡 "than" compares two things. "then" means after that.', answer: 'than', others: ['then', 'then,', 'thane'] },
      { prompt: 'Choose the correct word:\n"Finish dinner, ___ you can play."',     hint: '💡 "then" means after that or next in time.', answer: 'then', others: ['than', 'when', 'than,'] },
      { prompt: 'Choose the correct word:\n"The weather ___ how I feel."',          hint: '💡 "affects" (verb) = has an effect on. "effects" (noun) = the results.', answer: 'affects', others: ['effects', 'affectes', 'efectts'] },
      { prompt: 'Choose the correct word:\n"The ___ of the storm were terrible."',  hint: '💡 "effects" (noun) = the results or outcomes.', answer: 'effects', others: ['affects', 'affectes', 'efects'] },
      { prompt: 'Which word is spelled correctly?', answer: 'necessary',   hint: '💡 One C, two S\'s: ne-C-es-S-ary. "One collar, two socks!"',   others: ['neccessary', 'neccesary', 'necesary'] },
      { prompt: 'Which word is spelled correctly?', answer: 'beginning',   hint: '💡 begin → beginning: double the N before -ing',                 others: ['begining', 'beggining', 'biginning'] },
      { prompt: 'Which word is spelled correctly?', answer: 'separate',    hint: '💡 sep-ar-ate: there\'s "a rat" in sep-A-RAT-e!',                others: ['seperate', 'seperrate', 'separete'] },
      { prompt: 'Which word is spelled correctly?', answer: 'definitely',  hint: '💡 definite + ly: de-FIN-ite-ly (not "defin-A-tely")',           others: ['definately', 'definitly', 'defenitely'] },
      { prompt: 'Which word is spelled correctly?', answer: 'government',  hint: '💡 govern + ment: the "n" is in govern-N-ment',                  others: ['goverment', 'govenment', 'governement'] },
      { prompt: 'Which word is spelled correctly?', answer: 'environment', hint: '💡 environ + ment: envir-ON-ment (not "envirnment")',            others: ['enviroment', 'enviornment', 'enviorment'] },
      { prompt: 'Which word is spelled correctly?', answer: 'explanation', hint: '💡 explain → explanation (not "explaination")',                  others: ['explaination', 'explination', 'explantion'] },
      { prompt: 'Which word is spelled correctly?', answer: 'conscience',  hint: '💡 con-science: the "science" is right there in the word!',      others: ['consciense', 'consience', 'consciene'] },
      { prompt: 'Which word is spelled correctly?', answer: 'especially',  hint: '💡 e-SPECIAL-ly: "special" is hiding inside!',                  others: ['especialy', 'expecially', 'espesially'] },
      { prompt: 'Which word is spelled correctly?', answer: 'weird',       hint: '💡 "Weird" breaks the i-before-e rule: w-EI-rd',                others: ['wierd', 'weerd', 'wired'] },
      { prompt: 'Which word is spelled correctly?', answer: 'achieve',     hint: '💡 i before e except after c: ach-IE-ve',                       others: ['acheive', 'achive', 'acheeve'] },
    ],
    // Complex grammar: relative pronouns, verb tenses, complex sentences (Idaho L.4.1)
    'grammar': [
      { prompt: 'Which pronoun completes the sentence?\n"The student ___ won the prize was thrilled."', hint: '💡 Use "who" for people, "that/which" for things.',             answer: 'who',   others: ['which', 'what', 'whose'] },
      { prompt: 'Which pronoun completes the sentence?\n"The book ___ I read was amazing."',           hint: '💡 Use "that" or "which" for things, not people.',               answer: 'that',  others: ['who', 'whom', 'what'] },
      { prompt: 'Which pronoun completes the sentence?\n"The park, ___ opens at 9, is nearby."',      hint: '💡 "which" adds extra information about a thing.',                answer: 'which', others: ['who', 'that', 'what'] },
      { prompt: '"She has eaten breakfast."\nThis sentence is in the ___ tense.',                      hint: '💡 has/have + past participle = present perfect tense',           answer: 'present perfect',  others: ['simple past', 'future', 'past continuous'] },
      { prompt: '"They had finished before I arrived."\nThis uses the ___ tense.',                     hint: '💡 had + past participle = past perfect (happened before another past event)', answer: 'past perfect', others: ['present perfect', 'simple past', 'future perfect'] },
      { prompt: 'Which sentence uses a RELATIVE ADVERB correctly?',                                    hint: '💡 Relative adverbs: where (place), when (time), why (reason)',   answer: 'That is the house where I grew up.', others: ['That is the house who I grew up.', 'That is the house which I grew up.', 'That is the house when I grew up.'] },
      { prompt: '"Could" in a sentence shows:',                                                        hint: '💡 Modal auxiliary verbs show possibility, ability, permission.',   answer: 'Ability or possibility in the past', others: ['Something that must happen', 'Something that will definitely happen', 'Something happening right now'] },
      { prompt: 'Which sentence uses a PREPOSITIONAL PHRASE?',                                         hint: '💡 Prepositional phrases begin with: in, on, at, by, under, above, near…', answer: 'The cat slept under the warm blanket.', others: ['The cat slept quickly.', 'The cat quickly slept.', 'The cat was sleeping.'] },
      { prompt: 'Which sentence is COMPOUND?',                                                         hint: '💡 Compound sentence = two independent clauses joined by a conjunction (and, but, or, so)', answer: 'I like hiking, and my sister likes swimming.', others: ['I like hiking in the woods.', 'Because I like hiking, I bought boots.', 'I like hiking more than swimming.'] },
      { prompt: 'Which sentence is COMPLEX?',                                                          hint: '💡 Complex sentence = independent clause + dependent clause (because, when, if, although…)', answer: 'Because it was raining, we stayed inside.', others: ['It was raining and we stayed inside.', 'We stayed inside all day long.', 'It was raining; we stayed inside.'] },
      { prompt: '"Although she was tired, she finished her homework."\nWhat type of sentence is this?', hint: '💡 "Although" starts a dependent clause — this is a complex sentence.', answer: 'Complex', others: ['Simple', 'Compound', 'Compound-complex'] },
      { prompt: 'Which is the correct PAST TENSE of "swim"?',                                          hint: '💡 Swim is an irregular verb: swim → swam (not "swimmed")',        answer: 'swam',  others: ['swimmed', 'swum', 'swammed'] },
      { prompt: 'Which is the correct PAST TENSE of "bring"?',                                        hint: '💡 Bring is irregular: bring → brought (not "bringed")',           answer: 'brought', others: ['brang', 'bringed', 'brung'] },
      { prompt: 'Which is the correct PAST TENSE of "grow"?',                                         hint: '💡 Grow is irregular: grow → grew (not "growed")',                answer: 'grew',  others: ['growed', 'grown', 'grewn'] },
      { prompt: 'Which sentence uses CORRECT punctuation\nwith an appositive?',                        hint: '💡 Appositives (renaming phrases) are set off by commas: "My dog, Rex, loves to run."', answer: 'My teacher, Mrs. Smith, is very kind.', others: ['My teacher Mrs. Smith is very kind.', 'My teacher, Mrs. Smith is very kind.', 'My teacher Mrs. Smith, is very kind.'] },
      { prompt: 'Which word is an ADVERB in:\n"She quietly read her book."',                           hint: '💡 Adverbs describe HOW something is done. Look for -ly words.',   answer: 'quietly', others: ['She', 'read', 'book'] },
      { prompt: 'Which sentence avoids\na DOUBLE NEGATIVE?',                                           hint: '💡 Double negatives cancel out. Use only one negative word per thought.', answer: 'I don\'t have any money.', others: ["I don't have no money.", "I haven't got no money.", "I don't got nothing."] },
      { prompt: 'In "The dog bit the boy,"\nwhat is the DIRECT OBJECT?',                               hint: '💡 Direct object = WHO or WHAT receives the action of the verb.',  answer: 'boy',   others: ['dog', 'bit', 'the'] },
      { prompt: 'Which sentence uses\ncorrect SUBJECT-VERB AGREEMENT?',                                hint: '💡 A singular subject needs a singular verb (is, was, has, does).',  answer: 'Everyone is excited for the trip.', others: ['Everyone are excited for the trip.', 'Everyone were excited for the trip.', 'Everyone have been excited for the trip.'] },
      { prompt: 'Which word is a CONJUNCTION\nin "I wanted pizza, but we had tacos."?',                hint: '💡 Coordinating conjunctions join two independent clauses: FANBOYS (For, And, Nor, But, Or, Yet, So)', answer: 'but', others: ['pizza', 'wanted', 'had'] },
      { prompt: '"It was the most exciting game I had ever seen!"\nWhich verb tense is "had ever seen"?', hint: '💡 had + past participle = past perfect (action completed before another past moment)', answer: 'Past perfect', others: ['Present perfect', 'Simple past', 'Past continuous'] },
      { prompt: 'Which sentence has an ERROR\nin pronoun use?',                                        hint: '💡 Subject pronouns: I, he, she, we, they. Object pronouns: me, him, her, us, them.', answer: 'Her and me went to the park.', others: ['She and I went to the park.', 'She and I walked together.', 'She went with me to the park.'] },
      { prompt: 'Which is a DEPENDENT clause?',                                                        hint: '💡 Dependent clauses cannot stand alone — they start with: because, when, if, although, since…', answer: 'because the storm was coming', others: ['The storm was coming.', 'We went inside.', 'It started to rain hard.'] },
      { prompt: 'Which sentence uses\nCORRECT capitalization?',                                        hint: '💡 Capitalize proper nouns: specific people, places, holidays, titles.', answer: 'We visited the Lincoln Memorial in Washington, D.C.', others: ['We visited the lincoln memorial in washington, d.c.', 'We visited The Lincoln memorial in Washington, D.C.', 'we visited the Lincoln Memorial in washington, D.C.'] },
      { prompt: 'What mark goes at the end of:\n"What time does the movie start"',                     hint: '💡 Questions end with a question mark ?',                          answer: '?',     others: ['.', '!', ';'] },
    ],
  },
  grade5: {
    // Greek/Latin roots + academic vocabulary (Idaho L.5.4.b-c, L.5.6)
    'vocabulary': [
      { prompt: 'What does the Latin root "PORT" mean?\n(as in transport, portable, import)', hint: '💡 transport = carry across, portable = able to be carried, import = carry in', answer: 'To carry',        others: ['To open', 'To send messages', 'To measure'] },
      { prompt: 'What does the Greek root "BIO" mean?\n(as in biology, biography, biome)',   hint: '💡 biology = study of life, biography = writing about a life',                  answer: 'Life',            others: ['Earth', 'Water', 'Study of'] },
      { prompt: 'What does the Greek root "GEO" mean?\n(as in geography, geology, geometry)',hint: '💡 geography = writing about the earth, geology = study of earth',               answer: 'Earth',           others: ['Life', 'Water', 'Light'] },
      { prompt: 'What does the Latin root "AUD" mean?\n(as in auditorium, audio, audience)', hint: '💡 auditorium = place to hear, audience = people who hear/watch',               answer: 'To hear',         others: ['To see', 'To speak', 'To think'] },
      { prompt: 'What does the Latin root "VIS" mean?\n(as in visible, vision, visual)',     hint: '💡 visible = able to be seen, vision = ability to see',                         answer: 'To see',          others: ['To hear', 'To touch', 'To carry'] },
      { prompt: 'What does the Latin root "DICT" mean?\n(as in dictate, dictionary, predict)',hint: '💡 dictate = to speak, dictionary = book of words, predict = say before',      answer: 'To say or speak', others: ['To write', 'To hear', 'To carry'] },
      { prompt: 'What does the Greek root "GRAPH" mean?\n(as in photograph, autograph, paragraph)', hint: '💡 photograph = light-writing, autograph = self-writing',              answer: 'To write',        others: ['To read', 'To draw', 'To speak'] },
      { prompt: 'What does the Greek root "TELE" mean?\n(as in telephone, telescope, television)', hint: '💡 telephone = far-away sound, telescope = see from far away',            answer: 'Far away',        others: ['Very small', 'Very large', 'Very fast'] },
      { prompt: 'What does the Latin root "STRUCT" mean?\n(as in construct, structure, instruct)', hint: '💡 construct = build together, structure = something built',             answer: 'To build',        others: ['To destroy', 'To measure', 'To paint'] },
      { prompt: 'What does the Latin root "SCRIB/SCRIPT" mean?\n(as in describe, script, inscription)', hint: '💡 describe = write about, script = written words, inscription = written on', answer: 'To write', others: ['To read', 'To speak', 'To build'] },
      { prompt: 'What does "infer" mean?',       hint: '💡 "Based on the clues, I could infer that the character was nervous."',            answer: 'To conclude from evidence without being directly told', others: ['To memorize the exact words', 'To guess randomly', 'To look something up'] },
      { prompt: 'What does "synthesize" mean?',  hint: '💡 "She synthesized information from three different sources into one clear summary."', answer: 'To combine information from multiple sources',       others: ['To separate ideas apart', 'To copy exactly', 'To ignore some information'] },
      { prompt: 'What does "elaborate" mean?',   hint: '💡 "Please elaborate on your answer — I want to know more details!"',               answer: 'To add more detail or explanation',                 others: ['To shorten your answer', 'To change your answer', 'To ask a question'] },
      { prompt: 'What does "relevant" mean?',    hint: '💡 "Only include details that are relevant to the main topic of your essay."',      answer: 'Directly connected and important to the topic',     others: ['Interesting but off-topic', 'Very confusing', 'Hard to understand'] },
      { prompt: 'What does "alternative" mean?', hint: '💡 "If the highway is blocked, take an alternative route to avoid traffic."',       answer: 'Another option or choice',                          others: ['The only possible way', 'The most expensive option', 'A type of road'] },
      { prompt: 'What does "contradict" mean?',  hint: '💡 "The second witness contradicted the first by saying the opposite happened."',   answer: 'To say or do the opposite of something',            others: ['To agree completely', 'To explain something clearly', 'To ask for more time'] },
      { prompt: 'What does "imply" mean?',       hint: '💡 "Her smile implied she was happy, even though she never said a word."',         answer: 'To suggest something without saying it directly',   others: ['To say something loudly and clearly', 'To deny something', 'To write something down'] },
      { prompt: 'What does "consequence" mean?', hint: '💡 "One consequence of not studying is doing poorly on the test."',                 answer: 'A result or effect of an action',                   others: ['A reason for doing something', 'A type of question', 'A reward for good work'] },
      { prompt: 'What does "reliable" mean?',    hint: '💡 "A reliable source gives you accurate information you can trust."',             answer: 'Can be trusted to be accurate and consistent',      others: ['Very difficult to find', 'Very exciting to read', 'Always changing'] },
      { prompt: 'What does "chronological" mean?', hint: '💡 "The events are told in chronological order — from earliest to latest."',    answer: 'Arranged in order of time, from earliest to latest', others: ['Arranged by importance', 'Arranged alphabetically', 'Arranged by size'] },
      { prompt: 'What does "objective" mean?\n(in writing)',  hint: '💡 "A news reporter should be objective and not show personal opinions."', answer: 'Based on facts, not personal feelings or opinions', others: ['Based on personal feelings only', 'Very exciting and dramatic', 'Very long and detailed'] },
      { prompt: 'What does "subjective" mean?',  hint: '💡 "Whether pizza tastes good is subjective — it depends on who you ask!"',        answer: 'Based on personal opinions and feelings',           others: ['Based only on facts', 'Completely fair to everyone', 'Agreed on by everyone'] },
      { prompt: 'What does "perspective" mean?', hint: '💡 "From the wolf\'s perspective, the story of the three pigs might sound very different!"', answer: 'A particular point of view or way of seeing things', others: ['A type of drawing technique', 'A mathematical formula', 'A kind of tool'] },
      { prompt: 'What does "stereotype" mean?',  hint: '💡 "Assuming all cats are unfriendly is a stereotype — it\'s not true of every cat!"', answer: 'An oversimplified, fixed idea about a group',     others: ['A scientific fact about a group', 'A personal experience', 'A kind of artwork'] },
      { prompt: 'What does "theme" mean\n(in a story)?', hint: '💡 "The theme of Charlotte\'s Web is the power of friendship and sacrifice."', answer: 'The central message or lesson of a story',        others: ['The setting of the story', 'The main character\'s name', 'The length of the story'] },
    ],
    // Advanced spelling patterns (Idaho L.5.2.e)
    'spelling': [
      { prompt: 'Which word is spelled correctly?', answer: 'accommodation',  hint: '💡 ac-com-mo-da-tion: double C, double M',                      others: ['acommodation', 'accomodation', 'accomadation'] },
      { prompt: 'Which word is spelled correctly?', answer: 'occurrence',     hint: '💡 oc-cur-rence: double C, double R',                           others: ['occurence', 'ocurrence', 'occurrance'] },
      { prompt: 'Which word is spelled correctly?', answer: 'rhythm',         hint: '💡 rh-y-thm: no vowels except Y — very unusual!',               others: ['rythm', 'rhythem', 'rhthym'] },
      { prompt: 'Which word is spelled correctly?', answer: 'committee',      hint: '💡 com-mit-tee: double M, double T, double E',                  others: ['commitee', 'comittee', 'committe'] },
      { prompt: 'Which word is spelled correctly?', answer: 'argument',       hint: '💡 argue → argument: drop the E before -ment',                  others: ['arguement', 'arguemant', 'argumant'] },
      { prompt: 'Which word is spelled correctly?', answer: 'conscience',     hint: '💡 con-science: the word "science" is hiding inside!',           others: ['consciense', 'consience', 'concience'] },
      { prompt: 'Which word is spelled correctly?', answer: 'privilege',      hint: '💡 priv-i-lege: not "priviledge" — no D!',                      others: ['priviledge', 'privelege', 'privelidge'] },
      { prompt: 'Which word is spelled correctly?', answer: 'noticeable',     hint: '💡 notice + able: keep the E to protect the /s/ sound',         others: ['noticable', 'noticeable', 'noticible'] },
      { prompt: 'Which word is spelled correctly?', answer: 'supersede',      hint: '💡 super-sede: the only -sede word (not -cede or -ceed)',        others: ['supercede', 'superseed', 'superceed'] },
      { prompt: 'Which word is spelled correctly?', answer: 'questionnaire',  hint: '💡 question + -naire: double N in the middle',                  others: ['questionaire', 'questionnare', 'questionair'] },
      { prompt: 'Which word means\n"to give something up"?', answer: 'forfeit', hint: '💡 for-feit: breaks the i-before-e rule (f-e-i-t)',          others: ['forfiet', 'forfeat', 'forfit'] },
      { prompt: 'Which word is spelled correctly?', answer: 'fluorescent',    hint: '💡 flu-o-res-cent: starts with flu- (like a river)',             others: ['flourescent', 'flurecent', 'floresent'] },
      { prompt: 'Which word is spelled correctly?', answer: 'perseverance',   hint: '💡 per-se-ver-ance: ends in -ance (not -ence)',                 others: ['perseverence', 'perseverance', 'persevereance'] },
      { prompt: 'Which word is spelled correctly?', answer: 'pneumonia',      hint: '💡 pneu-mo-ni-a: silent P at the start (Greek origin)',          others: ['neumonia', 'pnuemonia', 'pneumonea'] },
      { prompt: 'Which word is spelled correctly?', answer: 'mischievous',    hint: '💡 mis-chie-vous: 3 syllables (not "mis-chiev-i-ous")',         others: ['mischievious', 'mischeivous', 'mischevious'] },
      { prompt: 'Which word means "more than enough"?', answer: 'sufficient', hint: '💡 suf-fi-cient: double F, ends in -icient',                    others: ['suficient', 'sufficent', 'suficent'] },
      { prompt: 'Which word is spelled correctly?', answer: 'exaggerate',     hint: '💡 ex-ag-ger-ate: double G in the middle',                      others: ['exagerate', 'exaggerrate', 'exaggarate'] },
      { prompt: 'Which word is spelled correctly?', answer: 'lightning',      hint: '💡 light-ning: no E after light (not "lightening")',            others: ['lightening', 'lightneing', 'ligtning'] },
      { prompt: 'Which word is spelled correctly?', answer: 'embarrass',      hint: '💡 em-bar-rass: double R, double S',                            others: ['embarras', 'embarass', 'embarrass'] },
      { prompt: 'Which word is spelled correctly?', answer: 'receive',        hint: '💡 i before E except after C: re-CE-ive',                      others: ['recieve', 'receve', 'receeve'] },
      { prompt: 'Which word is spelled correctly?', answer: 'acquaintance',   hint: '💡 ac-quaint-ance: silent C in acquaint-',                      others: ['aquaintance', 'acquantance', 'acquaintence'] },
      { prompt: 'Which word is spelled correctly?', answer: 'disappear',      hint: '💡 dis- + appear: one S, double P',                             others: ['dissapear', 'disapear', 'disappear'] },
      { prompt: 'Which word is spelled correctly?', answer: 'fascinate',      hint: '💡 fas-cin-ate: silent C (like "science")',                     others: ['fasinate', 'fascenate', 'facinate'] },
      { prompt: 'Which word is spelled correctly?', answer: 'maintenance',    hint: '💡 main-te-nance: main + ten + ance (not "maintanance")',        others: ['maintanance', 'maintainance', 'maintenence'] },
      { prompt: 'Which word is spelled correctly?', answer: 'parallel',       hint: '💡 par-al-lel: one R, double L in the middle, one L at end',    others: ['paralell', 'parallell', 'parrallel'] },
    ],
    // Complex grammar: perfect tenses, correlative conjunctions, voice (Idaho L.5.1)
    'grammar': [
      { prompt: '"She has finished her project."\nThis is in the ___ tense.',       hint: '💡 has/have + past participle = present perfect',                  answer: 'Present perfect',  others: ['Simple past', 'Future', 'Past continuous'] },
      { prompt: '"By noon, he will have eaten."\nThis is in the ___ tense.',        hint: '💡 will have + past participle = future perfect',                  answer: 'Future perfect',   others: ['Simple future', 'Present perfect', 'Past perfect'] },
      { prompt: 'Which sentence uses CORRELATIVE CONJUNCTIONS?',                    hint: '💡 Correlative conjunctions work in pairs: either/or, neither/nor, not only/but also', answer: 'Either you study or you fail.', others: ['You study and succeed.', 'You study, but you might still fail.', 'You study so that you succeed.'] },
      { prompt: '"Not only ___ she smart, ___ also kind."',                         hint: '💡 "Not only … but also" is a correlative conjunction pair.',       answer: 'is / but',     others: ['was / and', 'is / and', 'is / or'] },
      { prompt: '"Neither the dog ___ the cat ate its food."',                      hint: '💡 "Neither … nor" is a correlative conjunction pair.',            answer: 'nor',          others: ['or', 'and', 'but'] },
      { prompt: 'Which sentence is in the ACTIVE VOICE?',                          hint: '💡 Active voice: subject DOES the action. Passive voice: subject RECEIVES the action.', answer: 'The dog chased the cat.',       others: ['The cat was chased by the dog.', 'The cat was being chased.', 'The dog was chasing.'] },
      { prompt: 'Which sentence is in the PASSIVE VOICE?',                         hint: '💡 Passive = subject receives the action (is/was/were + past participle).', answer: 'The book was written by a child.',  others: ['A child wrote the book.', 'The child is writing.', 'A child had written quickly.'] },
      { prompt: 'Which sentence is in the INDICATIVE mood?',                       hint: '💡 Indicative mood = stating facts or asking questions.',            answer: 'It is raining outside.',         others: ['Please stop raining!', 'If only it would rain!', 'Rain harder, sky!'] },
      { prompt: 'Which sentence is in the IMPERATIVE mood?',                       hint: '💡 Imperative mood = giving a command or making a request.',        answer: 'Close the door quietly, please.', others: ['The door is closed.', 'The door will close soon.', 'If only the door were closed.'] },
      { prompt: 'Which sentence uses the SUBJUNCTIVE mood?',                       hint: '💡 Subjunctive = hypothetical/wishes: "If I WERE you…" (not "was")', answer: 'If I were taller, I could reach the shelf.', others: ['If I was taller, I reached the shelf.', 'Because I am tall, I reached the shelf.', 'I am tall enough to reach.'] },
      { prompt: '"They are swimming" is in the ___ tense.',                         hint: '💡 am/is/are + -ing = present progressive (happening right now)',    answer: 'Present progressive', others: ['Simple present', 'Present perfect', 'Past progressive'] },
      { prompt: 'Which sentence correctly uses\na SEMICOLON?',                     hint: '💡 A semicolon joins two related independent clauses without a conjunction.', answer: 'It was late; she was tired.',    others: ['It was late, she was tired.', 'It was late and; she was tired.', 'It was late. and she was tired.'] },
      { prompt: 'Which sentence correctly uses a COLON?',                          hint: '💡 A colon introduces a list or an explanation: "She needed three things: a pencil, paper, and an eraser."', answer: 'She packed three things: a towel, sunscreen, and water.', others: ['She packed: three things in total.', 'She packed three things, a towel sunscreen and water.', 'She packed three things; a towel, sunscreen, and water.'] },
      { prompt: 'What is the GERUND in:\n"Swimming every day keeps me healthy."?', hint: '💡 A gerund = verb + -ing used as a NOUN (subject, object, or complement)', answer: 'Swimming',  others: ['every', 'healthy', 'keeps'] },
      { prompt: 'What is an INFINITIVE?',                                           hint: '💡 An infinitive = "to" + base verb: to run, to read, to think, to eat', answer: '"To" + base verb form (e.g., to run, to read)', others: ['A verb ending in -ing', 'A verb in past tense', 'An action done in the future'] },
      { prompt: 'Which sentence correctly\nuses a HYPHEN?',                         hint: '💡 Hyphens connect compound modifiers before a noun: "a well-known author."', answer: 'She is a well-known author.',   others: ['She is a well known author.', 'She is a well, known author.', 'She is an well-known author.'] },
      { prompt: 'What is the PARTICIPLE in:\n"The running water filled the tub."?', hint: '💡 Participial adjective = verb form used to describe a noun',        answer: 'running',   others: ['water', 'filled', 'tub'] },
      { prompt: 'Which is a COMPOUND-COMPLEX sentence?',                            hint: '💡 Compound-complex = 2 independent clauses + 1 dependent clause',     answer: 'She likes art, and he likes music, although both enjoy history.', others: ['She likes art and he likes music.', 'Although she likes art, she draws daily.', 'She likes art.'] },
      { prompt: 'Which sentence uses CORRECT\nsubject-verb agreement with "neither"?', hint: '💡 "Neither" is singular: "Neither … is" not "Neither … are".',   answer: 'Neither of the answers is correct.',  others: ['Neither of the answers are correct.', 'Neither answer are correct.', 'Neither answers is correct.'] },
      { prompt: 'What does an ADVERBIAL CLAUSE do?',                               hint: '💡 An adverbial clause modifies a verb, adjective, or another adverb. It starts with: because, when, although, while, if…', answer: 'Modifies a verb by telling when, why, or how',  others: ['Names a person or place', 'Describes a noun', 'Connects two nouns together'] },
      { prompt: 'Which sentence correctly\nuses "whom"?',                           hint: '💡 Use "whom" when it is the object: "To whom did you speak?" (him, not he)', answer: 'To whom did you give the award?',  others: ['Who did you give the award to?', 'Whom gave you the award?', 'Whom is at the door?'] },
      { prompt: 'What is the ANTECEDENT in:\n"Maria lost her backpack"?',           hint: '💡 Antecedent = the noun that a pronoun refers back to.',             answer: 'Maria',   others: ['lost', 'backpack', 'her'] },
      { prompt: 'Which sentence contains\nan APPOSITIVE?',                          hint: '💡 Appositive = a noun phrase that renames another noun, set off by commas.', answer: 'My best friend, Jayden, loves to code.', others: ['My best friend loves to code.', 'My friend Jayden loves coding.', 'Jayden, my friend, coded together.'] },
      { prompt: 'Which sentence correctly\nuses "fewer" vs. "less"?',               hint: '💡 "Fewer" = countable things (books, people). "Less" = uncountable things (water, time).', answer: 'I have fewer pencils than you.', others: ['I have less pencils than you.', 'I have fewer water than you.', 'I have less friends than you.'] },
      { prompt: 'What is the OBJECT of the PREPOSITION\nin "The cat jumped over the fence"?', hint: '💡 Preposition + object: "over the fence" — the object is the noun after the preposition.', answer: 'fence', others: ['cat', 'jumped', 'over'] },
    ],
  },
  grade6: {
    // Figurative language, connotation, word relationships (Idaho L.6.4, L.6.5)
    'vocabulary': [
      { prompt: 'What is a SIMILE?',                          hint: '💡 Simile compares using "like" or "as": "She runs LIKE the wind." "He is AS tall AS a tree."', answer: 'A comparison using "like" or "as"',      others: ['A comparison without using "like" or "as"', 'An exaggeration for effect', 'Giving human traits to a non-human thing'] },
      { prompt: 'What is a METAPHOR?',                        hint: '💡 Metaphor compares directly without "like/as": "Life IS a journey." "Time IS money."',         answer: 'A direct comparison without "like" or "as"', others: ['A comparison using "like" or "as"', 'An exaggeration', 'Repeating beginning sounds'] },
      { prompt: 'What is PERSONIFICATION?',                   hint: '💡 Personification gives human traits to non-human things: "The wind WHISPERED through the trees."', answer: 'Giving human traits to non-human things', others: ['A comparison using "like" or "as"', 'An extreme exaggeration', 'A word that imitates a sound'] },
      { prompt: 'What is HYPERBOLE?',                         hint: '💡 Hyperbole is extreme exaggeration: "I\'ve told you a MILLION times!" "I\'m so hungry I could eat a horse!"', answer: 'Extreme exaggeration for emphasis',      others: ['A mild understatement', 'A direct comparison', 'Giving objects human qualities'] },
      { prompt: 'What is an IDIOM?',                          hint: '💡 Idiom = a phrase meaning something different from its literal words: "Break a leg!" really means "Good luck!"', answer: 'A phrase with a non-literal meaning',     others: ['A comparison using "like" or "as"', 'An extreme exaggeration', 'A word that sounds like what it means'] },
      { prompt: '"Break a leg!" is an example of:',           hint: '💡 This idiom means "Good luck!" — the words don\'t mean what they literally say.',              answer: 'An idiom',                              others: ['A simile', 'Hyperbole', 'Personification'] },
      { prompt: '"The stars danced in the night sky" is:', hint: '💡 Stars cannot really dance — this gives stars a human action. That\'s personification!',       answer: 'Personification',                       others: ['A simile', 'A metaphor', 'Hyperbole'] },
      { prompt: '"She was as brave as a lion" is:',           hint: '💡 Uses "as…as" to compare — that\'s a simile!',                                               answer: 'A simile',                              others: ['A metaphor', 'Personification', 'An idiom'] },
      { prompt: '"Life is a roller coaster" is:',             hint: '💡 Compares directly without "like" or "as" — that\'s a metaphor!',                            answer: 'A metaphor',                            others: ['A simile', 'Personification', 'Hyperbole'] },
      { prompt: '"I have a million things to do!" is:',       hint: '💡 Nobody really has a million things — this is an extreme exaggeration (hyperbole).',         answer: 'Hyperbole',                             others: ['A simile', 'A metaphor', 'Personification'] },
      { prompt: 'What is CONNOTATION?',                       hint: '💡 Connotation = the feelings/ideas associated with a word beyond its definition. "Home" feels warm; "house" feels neutral.', answer: 'The emotional feeling or association a word carries', others: ['The exact dictionary definition of a word', 'The number of syllables in a word', 'The origin language of a word'] },
      { prompt: 'What is DENOTATION?',                        hint: '💡 Denotation = the literal, dictionary definition of a word.',                                answer: 'The literal dictionary definition of a word', others: ['The feeling a word gives you', 'A word\'s synonym', 'The word\'s root language'] },
      { prompt: '"Slender" vs. "scrawny" — both mean thin.\nWhich has a NEGATIVE connotation?', hint: '💡 Connotation: slender sounds positive/elegant. Scrawny sounds unhealthy.',  answer: 'scrawny',  others: ['slender', 'Both are equally neutral', 'Neither — they are the same'] },
      { prompt: 'What does the Latin root "CRED" mean?\n(as in credible, credit, incredible)', hint: '💡 credible = believable, incredible = not believable, credit = trust/belief', answer: 'To believe or trust', others: ['To create', 'To carry', 'To speak'] },
      { prompt: 'What does the Greek root "CHRON" mean?\n(as in chronological, chronicle, synchronize)', hint: '💡 chronological = ordered by time, synchronize = make time the same', answer: 'Time',              others: ['Color', 'Number', 'Space'] },
      { prompt: 'What does the Latin root "BENE" mean?\n(as in benefit, benevolent, benefactor)', hint: '💡 benefit = a good outcome, benevolent = wishing good to others',          answer: 'Good or well',     others: ['Bad or evil', 'Before', 'Life'] },
      { prompt: 'What does the Greek root "MICRO" mean?\n(as in microscope, microphone, microchip)', hint: '💡 microscope = instrument to see tiny things, microphone = tiny sound tool', answer: 'Small or tiny',  others: ['Large or big', 'Far away', 'Fast or quick'] },
      { prompt: 'What does the Latin root "MULTI" mean?\n(as in multiply, multiple, multimedia)', hint: '💡 multiply = make many, multiple = many',                                  answer: 'Many',             others: ['One', 'None', 'Half'] },
      { prompt: 'ALLITERATION is:',                          hint: '💡 "Peter Piper picked a peck of pickled peppers" — repeating the same beginning consonant sound.',    answer: 'Repetition of the same beginning consonant sound', others: ['Words that rhyme at the end', 'An extreme exaggeration', 'A phrase with hidden meaning'] },
      { prompt: 'ONOMATOPOEIA means:',                       hint: '💡 Words that sound like what they describe: buzz, crash, sizzle, hiss, pop, boom!',                      answer: 'Words that imitate the sound they describe', others: ['Words that mean the opposite', 'Words that rhyme', 'Giving objects human feelings'] },
      { prompt: '"The sun smiled down on us" is:',           hint: '💡 The sun cannot really smile — this gives the sun a human action. Personification!',               answer: 'Personification',  others: ['A simile', 'Hyperbole', 'Alliteration'] },
      { prompt: 'What is an ANALOGY?',                       hint: '💡 Analogy shows a similar relationship: "Puppy is to dog as kitten is to cat."',                    answer: 'A comparison that shows a relationship between two pairs', others: ['A word that means the opposite', 'A phrase with hidden meaning', 'A comparison using "like"'] },
      { prompt: '"Hot is to cold as dark is to ___."',       hint: '💡 Hot and cold are OPPOSITES (antonyms). Dark and ___ should also be opposites.',                   answer: 'light',    others: ['night', 'dim', 'shade'] },
      { prompt: '"Author is to book as painter is to ___."', hint: '💡 An author CREATES a book. A painter CREATES a ___.',                                              answer: 'painting', others: ['brush', 'canvas', 'gallery'] },
      { prompt: '"Glance" and "stare" are SYNONYMS for looking.\nWhich has the connotation of looking BRIEFLY?', hint: '💡 Glance = a quick look. Stare = a long, fixed look.',  answer: 'glance',   others: ['stare', 'Both mean the same length', 'Neither — they are antonyms'] },
    ],
    // Complex spelling patterns (Idaho L.6.2.b)
    'spelling': [
      { prompt: 'Which word is spelled correctly?', answer: 'bureaucracy',    hint: '💡 bu-reau-cra-cy: "bureau" (French for desk) + -cracy',           others: ['burocracy', 'bureacracy', 'beaurocracy'] },
      { prompt: 'Which word is spelled correctly?', answer: 'surveillance',   hint: '💡 sur-veil-lance: like "veil" — watching from behind a veil',      others: ['surveilance', 'survelance', 'survaillance'] },
      { prompt: 'Which word is spelled correctly?', answer: 'entrepreneur',   hint: '💡 en-tre-pre-neur: French origin, ends in -eur',                    others: ['entrepeneur', 'entrepreunr', 'entrepraneur'] },
      { prompt: 'Which word is spelled correctly?', answer: 'conscientious',  hint: '💡 con-sci-en-tious: "science" is hiding inside again!',             others: ['conscientous', 'consciencious', 'conscienscious'] },
      { prompt: 'Which word is spelled correctly?', answer: 'Mediterranean',  hint: '💡 Med-i-ter-ra-ne-an: double R, ends in -ranean',                   others: ['Mediteranean', 'Meditirranean', 'Mediteranean'] },
      { prompt: 'Which word is spelled correctly?', answer: 'millennium',     hint: '💡 mil-len-ni-um: double L, double N',                               others: ['millenium', 'milenium', 'milleniom'] },
      { prompt: 'Which word is spelled correctly?', answer: 'camaraderie',    hint: '💡 cam-a-ra-de-rie: French origin, ends in -erie',                   others: ['camaradary', 'comraderie', 'camaraderie'] },
      { prompt: 'Which word is spelled correctly?', answer: 'miscellaneous',  hint: '💡 mis-cel-la-ne-ous: double L, ends in -aneous',                    others: ['miscelaneous', 'miscellaneous', 'miscelanious'] },
      { prompt: 'Which word is spelled correctly?', answer: 'ambiguous',      hint: '💡 am-big-u-ous: ends in -guous (not -gous)',                        others: ['ambigous', 'ambiguious', 'ambigious'] },
      { prompt: 'Which word is spelled correctly?', answer: 'catastrophe',    hint: '💡 ca-tas-tro-phe: ends in -phe (Greek origin, like "phone")',        others: ['catastrophy', 'catastropy', 'catistrophe'] },
      { prompt: 'Which word is spelled correctly?', answer: 'lieutenant',     hint: '💡 lieu-ten-ant: "lieu" means place in French (lieutenant = one who holds a place)', others: ['leutenant', 'leftenant', 'lieutanant'] },
      { prompt: 'Which word is spelled correctly?', answer: 'silhouette',     hint: '💡 sil-hou-ette: French origin, silent H, double T, ends in -ette',  others: ['silouette', 'siluette', 'silhouete'] },
      { prompt: 'Which word is spelled correctly?', answer: 'exhilarate',     hint: '💡 ex-hil-a-rate: silent H after x, note the A before -rate',        others: ['exhilerate', 'exhalarate', 'exhilarait'] },
      { prompt: 'Which word is spelled correctly?', answer: 'onomatopoeia',   hint: '💡 on-o-mat-o-poe-ia: 7 letters, ends in -oeia',                     others: ['onomatopeia', 'onomatapoeia', 'onomatopeja'] },
      { prompt: 'Which word is spelled correctly?', answer: 'camouflage',     hint: '💡 cam-ou-flage: French origin, -ou- in the middle, -flage at end',   others: ['camoflage', 'camouflauge', 'camouflarge'] },
      { prompt: 'Which word is spelled correctly?', answer: 'plagiarism',     hint: '💡 pla-gia-rism: -gia- in the middle (not -gea-)',                    others: ['plagerism', 'plagirism', 'plagerizm'] },
      { prompt: 'Which word is spelled correctly?', answer: 'discrepancy',    hint: '💡 dis-crep-an-cy: ends in -ancy (not -ency)',                        others: ['discrepency', 'discrepansy', 'discrepency'] },
      { prompt: 'Which word is spelled correctly?', answer: 'archaeological', hint: '💡 ar-chae-o-log-i-cal: ae together (like in "aeon")',                others: ['archeological', 'archaelogical', 'archealogical'] },
      { prompt: 'Which word is spelled correctly?', answer: 'gubernatorial',  hint: '💡 gu-ber-na-to-ri-al: from Latin "gubernator" (governor)',            others: ['gubernitorial', 'goveratorial', 'gubernatorial'] },
      { prompt: 'Which word is spelled correctly?', answer: 'omniscient',     hint: '💡 om-ni-sci-ent: omni = all, scient = knowing. Silent C!',           others: ['omnisient', 'omnicient', 'omnisicent'] },
      { prompt: 'Which word is spelled correctly?', answer: 'choreography',   hint: '💡 cho-re-og-ra-phy: chore + ography (like geography)',               others: ['coreography', 'choreograpy', 'chorography'] },
      { prompt: 'Which word is spelled correctly?', answer: 'prerequisite',   hint: '💡 pre-req-ui-site: pre + requisite, note the QUI in the middle',     others: ['prerequite', 'prerequisit', 'prereqisite'] },
      { prompt: 'Which word is spelled correctly?', answer: 'mediterranean',  hint: '💡 med-i-ter-ra-ne-an: double R in terr- (earth in Latin)',           others: ['mediteranean', 'mediteranian', 'meditarranean'] },
      { prompt: 'Which word is spelled correctly?', answer: 'benevolent',     hint: '💡 be-nev-o-lent: bene (good) + volent (wishing)',                    others: ['benevollent', 'benivolent', 'benevelent'] },
      { prompt: 'Which word is spelled correctly?', answer: 'perspicacious',  hint: '💡 per-spi-ca-cious: means having keen insight. Ends in -cious.',     others: ['perspicacous', 'perspicatious', 'perspicacious'] },
    ],
    // Advanced grammar: pronoun case, punctuation, voice, agreement (Idaho L.6.1-2)
    'grammar': [
      { prompt: 'Which is a SUBJECTIVE pronoun?',                          hint: '💡 Subjective (subject) pronouns: I, he, she, we, they, who — they DO the action.', answer: 'She',  others: ['her', 'him', 'them'] },
      { prompt: 'Which is an OBJECTIVE pronoun?',                          hint: '💡 Objective pronouns: me, him, her, us, them, whom — they RECEIVE the action.',   answer: 'them', others: ['they', 'we', 'she'] },
      { prompt: 'Which is a POSSESSIVE pronoun?',                          hint: '💡 Possessive pronouns show ownership: mine, his, hers, ours, theirs, whose.',      answer: 'hers', others: ['her', 'she', 'her\'s'] },
      { prompt: 'Which sentence uses the CORRECT\npronoun case?',          hint: '💡 Subject does the action → use "I/he/she/we/they". Object receives → use "me/him/her/us/them".', answer: 'She and I went to the game.',  others: ['Her and me went to the game.', 'Her and I went to the game.', 'She and me went to the game.'] },
      { prompt: '"Give the trophy to ___ who deserves it."',               hint: '💡 "who" = subject. "whom" = object. "To ___" → the pronoun receives "to" → use "whom".', answer: 'whoever', others: ['whomever', 'who', 'whom'] },
      { prompt: 'Which sentence correctly\nuses "who" vs. "whom"?',       hint: '💡 who = subject (who did it?), whom = object (to whom? for whom?)',              answer: 'To whom did she give the award?',  others: ['To who did she give the award?', 'Whom is at the door?', 'Who did she give it to whom?'] },
      { prompt: 'Which sentence has CORRECT\npronoun-antecedent agreement?', hint: '💡 Pronoun must match its antecedent: singular noun → singular pronoun.',     answer: 'Each student must bring their own pencil.', others: ['Each student must bring our own pencil.', 'Each student must bring its own pencil.', 'Each students must bring their own pencil.'] },
      { prompt: 'Which sentence avoids\na VAGUE PRONOUN?',                hint: '💡 Avoid vague pronouns: "She told Maria she was late" is unclear — who was late?', answer: 'Mr. Lee told the class that the field trip was postponed.', others: ['He told them it was postponed.', 'They said it got moved.', 'Someone said it was postponed.'] },
      { prompt: 'Which sentence correctly\nuses a SEMICOLON?',             hint: '💡 Semicolon joins 2 related independent clauses: "Clause 1; Clause 2."',        answer: 'The sun set; the stars appeared.',          others: ['The sun; set and stars appeared.', 'The sun set, the stars appeared.', 'The sun set the stars; appeared.'] },
      { prompt: 'Which sentence correctly\nuses a COLON?',                 hint: '💡 Colon introduces a list or explanation. The clause before the colon must be complete.',   answer: 'She excels in three subjects: math, science, and art.', others: ['She excels in: math, science, and art.', 'She excels: in math, science, and art.', 'She: excels in math, science, and art.'] },
      { prompt: 'Which sentence correctly\nuses an EM DASH?',              hint: '💡 Em dash (—) adds emphasis or inserts a strong interruption: "She finally arrived—two hours late."', answer: 'She finally answered—after three days of silence.', others: ['She finally answered, after three days.', 'She finally answered - after three days of silence.', 'She finally, answered—after three days.'] },
      { prompt: 'Which is in the ACTIVE VOICE?',                           hint: '💡 Active voice: SUBJECT → VERB → OBJECT. The subject does the action.',           answer: 'The committee approved the proposal.',       others: ['The proposal was approved by the committee.', 'The proposal had been approved.', 'Approval was given by the committee.'] },
      { prompt: 'Which is in the PASSIVE VOICE?',                          hint: '💡 Passive voice: subject receives the action (is/was/were + past participle).',   answer: 'The ancient artifact was discovered by archaeologists.', others: ['Archaeologists discovered the ancient artifact.', 'The archaeologists made a great discovery.', 'The ancient artifact amazed archaeologists.'] },
      { prompt: '"Whom" is used when the pronoun is:',                     hint: '💡 "Whom" replaces him/her/them (object). If you can say "him," use "whom."',     answer: 'The object of a verb or preposition',        others: ['The subject of a verb', 'A possessive pronoun', 'An indefinite reference'] },
      { prompt: 'Which sentence has CORRECT\nsubject-verb agreement?',     hint: '💡 "None" can be singular or plural. "Neither" is usually singular.',            answer: 'Neither of the options is correct.',         others: ['Neither of the options are correct.', 'Neither option are correct.', 'Neither of the option is correct.'] },
      { prompt: 'Which sentence uses CORRECT\nappositive punctuation?',    hint: '💡 A non-essential appositive (extra info) is set off by commas. An essential one is not.', answer: 'My sister, the one in college, is visiting.', others: ['My sister the one in college is visiting.', 'My sister — the one in college is visiting.', 'My sister; the one in college; is visiting.'] },
      { prompt: 'Which sentence correctly\npunctuates a QUOTATION?',       hint: '💡 Commas and periods go INSIDE quotation marks in American English.',           answer: '"I\'ll be there," she promised.',             others: ['"I\'ll be there", she promised.', '"I\'ll be there" she promised.', '"I\'ll be there." she promised.'] },
      { prompt: 'Which sentence shows\nVARIED SENTENCE STRUCTURE?',        hint: '💡 Good writing varies sentence length and structure — not all simple, not all long and complex.', answer: 'The storm hit suddenly. By morning, however, the sky had cleared and the sun shone brightly.', others: ['The storm hit. The sky cleared. The sun shone.', 'The storm hit suddenly and by morning the sky had cleared and the sun shone brightly and it was a beautiful day.', 'The storm hit suddenly.'] },
      { prompt: 'What is the ERROR in:\n"Running down the street, the car hit him."?', hint: '💡 Dangling modifier: "Running down the street" should describe HIM, but the car cannot run.', answer: 'Dangling modifier — the car cannot be running down the street.', others: ['Incorrect verb tense', 'Wrong pronoun case', 'Sentence fragment'] },
      { prompt: 'Which sentence correctly\nuses "affect" vs. "effect"?',   hint: '💡 affect (verb) = to influence. effect (noun) = the result.',                  answer: 'The rain affected our plans; its effects lasted all week.', others: ['The rain effected our plans; its affects lasted all week.', 'The rain affected our plans; its affects lasted all week.', 'The rain effected our plans; its effects lasted all week.'] },
      { prompt: 'Which sentence correctly\nuses "lay" vs. "lie"?',         hint: '💡 "lay" needs an object (lay the book down). "lie" = recline (no object needed).', answer: 'She laid the book on the table.',           others: ['She lay the book on the table.', 'She lied the book on the table.', 'She lain the book on the table.'] },
      { prompt: 'Which is a CORRECTLY\nformatted TITLE?',                  hint: '💡 Books, movies, albums = italics or underline. Articles, poems, short stories = quotation marks.', answer: '"The Road Not Taken" (poem title in quotes)', others: ['The Road Not Taken (poem with no formatting)', '"Charlotte\'s Web" (novel should be italicized)', '"The Dark Knight" (movie should be italicized)'] },
      { prompt: 'Which sentence uses\ncorrect PARALLELISM?',               hint: '💡 Parallel structure: items in a list should have the same grammatical form.',  answer: 'She enjoys hiking, swimming, and biking.',   others: ['She enjoys hiking, to swim, and bikes.', 'She enjoys to hike, swimming, and biking.', 'She enjoys hiking, swim, and to bike.'] },
      { prompt: '"Its" vs "It\'s" — which correctly\ncompletes: "___ time to leave"?', hint: '💡 "It\'s" = it is. "Its" = belonging to it.',                      answer: "It's",     others: ['Its', "Its'", 'It is\''] },
      { prompt: 'A TRANSITIONAL word or phrase:',                          hint: '💡 Transitions connect ideas: however, therefore, furthermore, in contrast, as a result, for example…', answer: 'Connects ideas between sentences or paragraphs', others: ['Starts every new paragraph', 'Is always a conjunction', 'Replaces a pronoun'] },
    ],
  },
});

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

  logCQ('quest_started', { subject: 'reading', category: R.cat, grade: p.grade, theme: p.theme });

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
        <div class="read-hint" id="read-hint" style="display:none"></div>
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

  R.choices = shuffleArr([q.answer, ...q.others]);
  document.getElementById('read-prompt').textContent = q.prompt;
  const hintEl = document.getElementById('read-hint');
  if (hintEl) { hintEl.textContent = q.hint || ''; hintEl.style.display = q.hint ? 'block' : 'none'; }
  document.getElementById('read-choices').innerHTML = R.choices.map((c, i) =>
    `<button class="read-choice-btn" onclick="answerReadQuestion(R.choices[${i}])">${esc(c)}</button>`
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
  logCQ('quest_completed', { subject: 'reading', category: R.cat, grade: p.grade,
    correct: R.sessionCorrect, total: R.sessionQ, coins: R.sessionCoins, card_rarity: card.rarity });
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
