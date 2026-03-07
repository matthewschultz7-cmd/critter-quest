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
// Called once Firebase is ready. Tries to restore
// an existing session; if none, shows the join/create screen.
async function bootApp() {
  showLoadingScreen();
  try {
    // Sign in anonymously so Firestore security rules work
    await auth.signInAnonymously();
    const restored = await tryRestoreSession();
    if (restored) {
      nav('profiles');
    } else {
      showJoinScreen();
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

// ── Join code handler ─────────────────────────
async function handleJoinCode() {
  const input = document.getElementById('join-code-input');
  const code  = (input?.value || '').trim();
  if (!code) { input?.focus(); return; }

  const btn = document.querySelector('#screen-join .primary-btn.big');
  if (btn) { btn.textContent = 'Joining…'; btn.disabled = true; }

  try {
    const result = await joinFamilyByCode(code);
    if (result.ok) {
      nav('profiles');
    } else {
      showJoinScreen(result.reason);
    }
  } catch (err) {
    console.error('Join error:', err);
    showJoinScreen('Something went wrong. Please try again.');
  }
}

// ── Create family handler ─────────────────────
async function handleCreateFamily() {
  const btn = document.querySelector('#screen-join .outline');
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
