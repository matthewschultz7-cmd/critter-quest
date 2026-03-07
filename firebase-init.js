// ─────────────────────────────────────────────
//  Critter Quest — Firebase Init & Join Code UI
// ─────────────────────────────────────────────
//
//  SETUP INSTRUCTIONS:
//  1. Go to https://firebase.google.com → create a project
//  2. Add a Web App → copy the firebaseConfig values below
//  3. In Firebase console:
//       - Firestore Database → Create (start in test mode)
//       - Authentication → Sign-in method → Anonymous → Enable
//  4. Replace the placeholder values in firebaseConfig below
// ─────────────────────────────────────────────

const firebaseConfig = {
  apiKey: "AIzaSyBMa9EtDF4RBO-_LZzLa-f69m22KRsPlx0",
  authDomain: "critter-quest-d0c28.firebaseapp.com",
  projectId: "critter-quest-d0c28",
  storageBucket: "critter-quest-d0c28.firebasestorage.app",
  messagingSenderId: "34422330986",
  appId: "1:34422330986:web:36d77353940734a595dc13",
  measurementId: "G-QYT3WN8PH8"
}

// ── Bootstrap ─────────────────────────────────
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db   = firebase.firestore();
initFirestore(db);  // hand instance to data.js

// ── App entry point ───────────────────────────
async function bootApp() {
  showLoadingScreen();
  try {
    await auth.signInAnonymously();

    // Migration: if old single-family key exists but no known-families list yet,
    // load that family and register it in the new list.
    const oldFamilyId = localStorage.getItem('cq_family_id');
    if (oldFamilyId && getKnownFamilies().length === 0) {
      const ok = await loadFamily(oldFamilyId);
      if (ok) {
        addKnownFamily(oldFamilyId, getJoinCode());
        nav('profiles');
        return;
      }
    }

    const known = getKnownFamilies();
    if (known.length === 0) {
      showJoinScreen();
    } else if (known.length === 1) {
      const ok = await loadFamily(known[0].familyId);
      if (ok) { addKnownFamily(known[0].familyId, getJoinCode()); nav('profiles'); }
      else     { removeKnownFamily(known[0].familyId); showJoinScreen(); }
    } else {
      showFamilyPickerScreen();
    }
  } catch (err) {
    console.error('Boot error:', err);
    showJoinScreen();
  }
}

// ── Loading screen ────────────────────────────
function showLoadingScreen() {
  const el = document.getElementById('screen-join');
  el.innerHTML = `
    <div class="join-page">
      <div class="join-mascot">🦁 🐸 🦋</div>
      <div class="logo-big">🐾 Critter Quest</div>
      <div class="join-loading">
        <div class="loading-spinner"></div>
        <p>Loading…</p>
      </div>
    </div>`;
  el.classList.add('active');
  document.querySelectorAll('.screen:not(#screen-join)').forEach(s => s.classList.remove('active'));
}

// ── Join / Create screen ──────────────────────
function showJoinScreen(errorMsg) {
  const el = document.getElementById('screen-join');
  el.classList.add('active');
  document.querySelectorAll('.screen:not(#screen-join)').forEach(s => s.classList.remove('active'));
  document.getElementById('app-header').style.display = 'none';

  el.innerHTML = `
    <div class="join-page">
      <div class="join-mascot">🦁 🐸 🦋</div>
      <div class="logo-big">🐾 Critter Quest</div>
      <p class="join-tagline">Math quests for curious kids!</p>

      ${errorMsg ? `<div class="join-error">${errorMsg}</div>` : ''}

      <div class="join-card">
        <div class="join-card-title">👨‍👩‍👧 Returning family?</div>
        <p class="join-card-sub">Enter your family's join code</p>
        <input
          type="text"
          id="join-code-input"
          class="join-input"
          placeholder="e.g. TIGER-42"
          maxlength="12"
          autocomplete="off"
          autocapitalize="characters"
        />
        <button class="primary-btn big" onclick="handleJoinCode()">Join Family →</button>
      </div>

      <div class="join-divider"><span>or</span></div>

      <div class="join-card secondary">
        <div class="join-card-title">✨ New here?</div>
        <p class="join-card-sub">Create a family account — it's free!</p>
        <button class="primary-btn big outline" onclick="handleCreateFamily()">Create New Family</button>
      </div>

      <p class="join-footer">
        Your family code lets any device join your family's profiles.
        Parents: keep your code somewhere safe!
      </p>
    </div>`;

  const input = document.getElementById('join-code-input');
  if (input) {
    input.focus();
    input.addEventListener('keydown', e => { if (e.key === 'Enter') handleJoinCode(); });
  }
}

// ── Family picker (shown when device has 2+ saved families) ───
let _pickerBackTo = null;
function showFamilyPickerScreen(backTo) {
  if (backTo !== undefined) _pickerBackTo = backTo;
  const families = getKnownFamilies().sort((a, b) => (b.lastUsed || 0) - (a.lastUsed || 0));
  const el = document.getElementById('screen-join');
  el.classList.add('active');
  document.querySelectorAll('.screen:not(#screen-join)').forEach(s => s.classList.remove('active'));
  document.getElementById('app-header').style.display = 'none';

  const items = families.map(f => {
    const label = f.nickname || f.joinCode || 'Family';
    const sub   = f.nickname && f.joinCode ? f.joinCode : '';
    return `
      <div class="family-item">
        <button class="family-item-main" onclick="enterFamily('${f.familyId}')">
          <span class="family-item-name">${label}</span>
          ${sub ? `<span class="family-item-code">${sub}</span>` : ''}
        </button>
        <div class="family-item-actions">
          <button class="family-action-btn" onclick="editFamilyNickname('${f.familyId}','${(f.nickname||'').replace(/'/g,"\\'")}')">✏️</button>
          <button class="family-action-btn" onclick="deleteFamilyFromDevice('${f.familyId}')">🗑️</button>
        </div>
      </div>`;
  }).join('');

  el.innerHTML = `
    <div class="join-page">
      <div class="join-mascot">🦁 🐸 🦋</div>
      <div class="logo-big">🐾 Critter Quest</div>
      <p class="join-tagline">${families.length === 1 ? 'Manage your family' : 'Which family are you?'}</p>
      <div class="family-list">${items}</div>
      <button class="primary-btn big outline" onclick="showAddFamilyScreen()" style="margin-top:0.5rem">+ Join another family</button>
      ${_pickerBackTo ? `<button class="text-btn" onclick="nav('${_pickerBackTo}', {})" style="margin-top:0.25rem">← Back to Store</button>` : ''}
    </div>`;
}

async function enterFamily(familyId) {
  const el = document.getElementById('screen-join');
  el.innerHTML = `
    <div class="join-page">
      <div class="join-mascot">🦁 🐸 🦋</div>
      <div class="logo-big">🐾 Critter Quest</div>
      <div class="join-loading"><div class="loading-spinner"></div><p>Loading…</p></div>
    </div>`;
  try {
    const ok = await loadFamily(familyId);
    if (ok) { addKnownFamily(familyId, getJoinCode()); nav('profiles'); }
    else    { removeKnownFamily(familyId); showFamilyPickerScreen(); }
  } catch (err) {
    console.error('Enter family error:', err);
    showFamilyPickerScreen();
  }
}

function editFamilyNickname(familyId, currentNickname) {
  showModal(`
    <div class="modal-title">✏️ Rename Family</div>
    <p class="modal-text" style="margin-bottom:0.75rem">Give this family a friendly name on this device.</p>
    <input type="text" id="nickname-input" class="join-input"
      placeholder="e.g. Our Family" value="${currentNickname}" maxlength="20" />
    <div class="modal-btns" style="margin-top:1rem">
      <button class="text-btn" onclick="closeModal()">Cancel</button>
      <button class="primary-btn" onclick="saveNickname('${familyId}')">Save</button>
    </div>`);
  setTimeout(() => document.getElementById('nickname-input')?.select(), 50);
}

function saveNickname(familyId) {
  const nickname = (document.getElementById('nickname-input')?.value || '').trim();
  renameKnownFamily(familyId, nickname);
  closeModal();
  showFamilyPickerScreen();
}

function deleteFamilyFromDevice(familyId) {
  const f = getKnownFamilies().find(f => f.familyId === familyId);
  const label = f?.nickname || f?.joinCode || 'this family';
  showModal(`
    <div class="modal-title">🗑️ Remove from this device?</div>
    <p class="modal-text"><strong>${label}</strong> will be removed from this device only. Your family's data in the cloud is safe — you can rejoin anytime with your family code.</p>
    <div class="modal-btns" style="margin-top:1rem">
      <button class="text-btn" onclick="closeModal()">Cancel</button>
      <button class="danger-btn" onclick="confirmDeleteFamily('${familyId}')">Remove</button>
    </div>`);
}

function confirmDeleteFamily(familyId) {
  removeKnownFamily(familyId);
  closeModal();
  const remaining = getKnownFamilies();
  if (remaining.length === 0) showJoinScreen();
  else showFamilyPickerScreen();
}

// ── Add family screen (stripped-down, for existing users) ─────
function showAddFamilyScreen(errorMsg) {
  const el = document.getElementById('screen-join');
  el.classList.add('active');
  document.querySelectorAll('.screen:not(#screen-join)').forEach(s => s.classList.remove('active'));
  document.getElementById('app-header').style.display = 'none';

  el.innerHTML = `
    <div class="join-page">
      <div class="join-mascot">🦁 🐸 🦋</div>
      <div class="logo-big">🐾 Critter Quest</div>
      <p class="join-tagline">Add a family to this device</p>
      ${errorMsg ? `<div class="join-error">${errorMsg}</div>` : ''}
      <div class="join-card">
        <div class="join-card-title">👨‍👩‍👧 Enter your family code</div>
        <input
          type="text"
          id="join-code-input"
          class="join-input"
          placeholder="e.g. TIGER-42"
          maxlength="12"
          autocomplete="off"
          autocapitalize="characters"
        />
        <button class="primary-btn big" onclick="handleJoinCode()">Join Family →</button>
        <button class="text-btn" onclick="showFamilyPickerScreen()" style="align-self:center">← Back</button>
      </div>
    </div>`;

  const input = document.getElementById('join-code-input');
  if (input) {
    input.focus();
    input.addEventListener('keydown', e => { if (e.key === 'Enter') handleJoinCode(); });
  }
}

// ── Join code handler ─────────────────────────
async function handleJoinCode() {
  const input = document.getElementById('join-code-input');
  const code  = (input?.value || '').trim();
  if (!code) { input?.focus(); return; }

  const btn = document.querySelector('#screen-join .primary-btn.big');
  if (btn) { btn.textContent = 'Joining…'; btn.disabled = true; }

  const hasExistingFamilies = getKnownFamilies().length > 0;
  try {
    const result = await joinFamilyByCode(code);
    if (result.ok) {
      nav('profiles');
    } else {
      hasExistingFamilies ? showAddFamilyScreen(result.reason) : showJoinScreen(result.reason);
    }
  } catch (err) {
    console.error('Join error:', err);
    hasExistingFamilies ? showAddFamilyScreen('Something went wrong. Please try again.') : showJoinScreen('Something went wrong. Please try again.');
  }
}

// ── Create family handler ─────────────────────
// Shows a confirmation screen first so accidental taps can go back
function handleCreateFamily() {
  const el = document.getElementById('screen-join');
  el.innerHTML = `
    <div class="join-page">
      <div class="join-mascot">🦁 🐸 🦋</div>
      <div class="logo-big">🐾 Critter Quest</div>
      <p class="join-tagline">Math quests for curious kids!</p>
      <div class="join-card">
        <div class="join-card-title">✨ Create a new family?</div>
        <p class="join-card-sub">This makes a brand-new family account. If you already have a family code from another device, go back and use that instead.</p>
        <button class="primary-btn big" onclick="confirmCreateFamily()">Yes, create new family →</button>
        <button class="text-btn" onclick="showJoinScreen()" style="align-self:center;margin-top:0.25rem">← Back</button>
      </div>
    </div>`;
}

async function confirmCreateFamily() {
  const btn = document.querySelector('#screen-join .primary-btn.big');
  if (btn) { btn.textContent = 'Creating…'; btn.disabled = true; }

  try {
    const { joinCode } = await createFamily();
    showCodeRevealScreen(joinCode);
  } catch (err) {
    console.error('Create error:', err);
    showJoinScreen('Could not create family. Check your connection and try again.');
  }
}

// ── Code reveal screen (shown once after creation) ──
function showCodeRevealScreen(code) {
  const el = document.getElementById('screen-join');
  el.innerHTML = `
    <div class="join-page">
      <div class="logo-big">🎉 Family Created!</div>
      <p class="join-tagline">Save your family join code below</p>

      <div class="code-reveal-box">
        <div class="code-reveal-label">Your Family Code</div>
        <div class="code-reveal-code" id="reveal-code">${code}</div>
        <button class="copy-btn" onclick="copyCode('${code}')">📋 Copy Code</button>
      </div>

      <div class="code-reveal-info">
        <p>📱 <strong>Any device</strong> can join your family by entering this code.</p>
        <p>📝 <strong>Write it down</strong> or screenshot this screen — you'll need it on other devices.</p>
        <p>🔒 The parent PIN is <strong>1234</strong> — change it in the Store Admin settings.</p>
      </div>

      <button class="primary-btn big" onclick="nav('profiles')">
        Let's Go! →
      </button>
    </div>`;
}

function copyCode(code) {
  navigator.clipboard?.writeText(code).then(() => {
    const btn = document.querySelector('.copy-btn');
    if (btn) { btn.textContent = '✅ Copied!'; setTimeout(() => { btn.textContent = '📋 Copy Code'; }, 2000); }
  });
}

// ── Show join code from settings ──────────────
// Call this from your settings/admin area if needed
function showMyCode() {
  const code = getJoinCode();
  if (!code) return;
  showModal(`
    <div class="modal-title">🏠 Your Family Code</div>
    <div class="code-reveal-box" style="margin:1rem 0">
      <div class="code-reveal-code">${code}</div>
      <button class="copy-btn" onclick="copyCode('${code}')">📋 Copy Code</button>
    </div>
    <div class="modal-text">Share this code with any device to join your family's profiles.</div>
    <div class="modal-btns"><button class="text-btn" onclick="closeModal()">Close</button></div>`);
}

// ── Start ─────────────────────────────────────
window.addEventListener('DOMContentLoaded', bootApp);
