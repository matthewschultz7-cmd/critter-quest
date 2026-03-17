// ─────────────────────────────────────────────
//  Critter Quest — Data Layer (Firebase Edition)
// ─────────────────────────────────────────────
//
//  Firestore structure:
//    families/{familyId}/
//      parentPin: string
//      joinCode:  string   (e.g. "TIGER-42")
//      store:     array
//      profiles:  subcollection
//        {profileId}/  (all profile fields)
//
//    profiles/{profileId}/
//      profileName: string
//      familyId:    string
//      joinCode:    string
//      createdAt:   string (ISO)
//
//  How join codes work:
//    - familyCodes/{joinCode} → { familyId }  (lookup index)
//    - Device stores familyId in localStorage (just the ID, not the data)
// ─────────────────────────────────────────────

const FAMILY_ID_KEY      = 'cq_family_id';
const ACTIVE_PROFILE_KEY = 'cq_active_profile';
const KNOWN_FAMILIES_KEY = 'cq_known_families';

// ── In-memory cache (keeps UI snappy) ─────────
let _db = {
  familyId:        null,
  parentPin:       '1234',
  joinCode:        null,
  store:           [],
  profiles:        [],
  activeProfileId: null,
};

// Firestore references (set after Firebase init)
let _firestore = null;

function initFirestore(firestoreInstance) {
  _firestore = firestoreInstance;
}

// ── Family helpers ────────────────────────────
function getFamilyId()      { return _db.familyId; }
function getJoinCode()      { return _db.joinCode; }

// Known-families list (stored locally so the picker works across sessions)
function getKnownFamilies() {
  try { return JSON.parse(localStorage.getItem(KNOWN_FAMILIES_KEY) || '[]'); }
  catch { return []; }
}
function _saveKnownFamilies(list) {
  localStorage.setItem(KNOWN_FAMILIES_KEY, JSON.stringify(list));
}
function addKnownFamily(familyId, joinCode) {
  const list = getKnownFamilies();
  const existing = list.find(f => f.familyId === familyId);
  if (existing) {
    existing.joinCode  = joinCode || existing.joinCode;
    existing.lastUsed  = Date.now();
  } else {
    list.push({ familyId, joinCode: joinCode || '', nickname: '', lastUsed: Date.now() });
  }
  _saveKnownFamilies(list);
}
function removeKnownFamily(familyId) {
  _saveKnownFamilies(getKnownFamilies().filter(f => f.familyId !== familyId));
  if (localStorage.getItem(FAMILY_ID_KEY) === familyId) {
    localStorage.removeItem(FAMILY_ID_KEY);
  }
}
function renameKnownFamily(familyId, nickname) {
  const list = getKnownFamilies();
  const f = list.find(f => f.familyId === familyId);
  if (f) { f.nickname = nickname; _saveKnownFamilies(list); }
}

// Generate a friendly player code like "FROG-42" (different pool from join codes)
function generatePlayerCode() {
  const animals = ['FROG','BEAR','WOLF','DEER','FISH','CROW','DUCK','HAWK',
                   'LYNX','MOLE','NEWT','PUMA','TOAD','WREN','IBIS'];
  const word = animals[Math.floor(Math.random() * animals.length)];
  const num  = Math.floor(Math.random() * 90) + 10;
  return `${word}-${num}`;
}

// Generate a friendly join code like "TIGER-42"
function generateJoinCode() {
  const words = ['TIGER','EAGLE','PANDA','KOALA','OTTER','GECKO',
                 'BISON','CRANE','LEMUR','RAVEN','MOOSE','VIXEN',
                 'BEARS','LLAMA','STOAT','FINCH'];
  const word = words[Math.floor(Math.random() * words.length)];
  const num  = Math.floor(Math.random() * 90) + 10;
  return `${word}-${num}`;
}

// Create a brand-new family in Firestore
async function createFamily() {
  if (!_firestore) throw new Error('Firestore not ready');
  const joinCode = generateJoinCode();
  const familyRef = _firestore.collection('families').doc();
  const familyId  = familyRef.id;

  // Check code isn't taken (very unlikely but safe)
  const codeSnap = await _firestore.collection('familyCodes').doc(joinCode).get();
  const finalCode = codeSnap.exists ? generateJoinCode() + '-' + Date.now() : joinCode;

  await familyRef.set({
    joinCode:  finalCode,
    parentPin: '1234',
    store:     [],
    createdAt: new Date().toISOString(),
  });

  // Index: joinCode → familyId
  await _firestore.collection('familyCodes').doc(finalCode).set({ familyId });

  _db.familyId  = familyId;
  _db.joinCode  = finalCode;
  _db.parentPin = '1234';
  _db.store     = [];
  _db.profiles  = [];
  localStorage.setItem(FAMILY_ID_KEY, familyId);
  addKnownFamily(familyId, finalCode);
  return { familyId, joinCode: finalCode };
}

// Join an existing family by code
async function joinFamilyByCode(code) {
  if (!_firestore) throw new Error('Firestore not ready');
  const clean = code.trim().toUpperCase();
  const codeSnap = await _firestore.collection('familyCodes').doc(clean).get();
  if (!codeSnap.exists) return { ok: false, reason: 'Code not found. Check and try again!' };

  const { familyId } = codeSnap.data();
  await loadFamily(familyId);
  localStorage.setItem(FAMILY_ID_KEY, familyId);
  addKnownFamily(familyId, clean);
  return { ok: true };
}

// Load a family's data into the cache
async function loadFamily(familyId) {
  if (!_firestore) throw new Error('Firestore not ready');
  const famSnap  = await _firestore.collection('families').doc(familyId).get();
  if (!famSnap.exists) {
    localStorage.removeItem(FAMILY_ID_KEY);
    return false;
  }
  const famData = famSnap.data();

  const profileSnap = await _firestore
    .collection('families').doc(familyId)
    .collection('profiles').get();

  const profiles = [];
  profileSnap.forEach(doc => profiles.push({ id: doc.id, ...doc.data() }));

  _db.familyId        = familyId;
  _db.joinCode        = famData.joinCode  || null;
  _db.parentPin       = famData.parentPin || '1234';
  _db.store           = famData.store     || [];
  _db.profiles        = profiles;
  _db.activeProfileId = localStorage.getItem(ACTIVE_PROFILE_KEY) || null;
  return true;
}

// Try to restore session from localStorage
async function tryRestoreSession() {
  const familyId = localStorage.getItem(FAMILY_ID_KEY);
  if (!familyId) return false;
  return await loadFamily(familyId);
}

// ── Write helpers ─────────────────────────────
async function _saveFamily(changes) {
  if (!_firestore || !_db.familyId) return;
  await _firestore.collection('families').doc(_db.familyId).update(changes);
}

async function _saveProfile(profile) {
  if (!_firestore || !_db.familyId) return;
  const { id, ...data } = profile;
  await _firestore
    .collection('families').doc(_db.familyId)
    .collection('profiles').doc(id)
    .set(data);
}

async function _deleteProfileDoc(profileId) {
  if (!_firestore || !_db.familyId) return;
  await _firestore
    .collection('families').doc(_db.familyId)
    .collection('profiles').doc(profileId)
    .delete();
}

// ── Profile CRUD ──────────────────────────────
function getProfiles()  { return _db.profiles; }
function getProfile(id) { return _db.profiles.find(p => p.id === id) || null; }

function getActiveProfile() {
  return _db.profiles.find(p => p.id === _db.activeProfileId) || null;
}

function setActiveProfile(id) {
  _db.activeProfileId = id;
  localStorage.setItem(ACTIVE_PROFILE_KEY, id);
}

async function createProfile(name, grade, theme) {
  const defaultMascots = { forest:'🐱', ocean:'🐠', farm:'🐔', jungle:'🦁', arctic:'🐧' };
  const playerCode = generatePlayerCode();
  const profile = {
    id:             'p_' + Date.now(),
    name,
    grade,
    theme,
    themeCreatures: { ...defaultMascots },
    coins:          0,
    coinsEarned:    0,
    flair:          [null, null, null],
    inventory:      [],
    transactions:   [],
    stats:          { totalCorrect: 0, totalAttempted: 0, sessionsCompleted: 0, bestStreak: 0 },
    sessions:       [],
    journeys:       {},
    loginStreak:    0,
    lastLoginDate:  null,
    wallCards:      [null, null, null, null],
    playerCode,
    friends:        [],
    // Parent learning controls
    learningMode:   'guided',   // 'guided' | 'mental'
    operationLock:  null,       // null | 'addition' | 'subtraction' | 'multiplication' | 'division'
    sessionLength:  10,         // 5 | 10 | 15
    visualAids:     true,       // bead bar + ten frame
  };
  _db.profiles.push(profile);
  await _saveProfile(profile);
  if (_firestore && _db.familyId) {
    await _firestore.collection('playerCodes').doc(playerCode).set({ profileId: profile.id });
    await _firestore.collection('profiles').doc(profile.id).set({
      profileName:       profile.name,
      familyId:          _db.familyId,
      joinCode:          _db.joinCode,
      createdAt:         new Date().toISOString(),
      playerCode,
      totalCorrect:      0,
      sessionsCompleted: 0,
      bestStreak:        0,
      coinsEarned:       0,
    });
  }
  return profile;
}

// One-time backfill: writes top-level profiles/{id} for all profiles in the
// currently-loaded family. Safe to re-run (uses merge). Call from browser console.
async function backfillProfiles() {
  if (!_firestore || !_db.familyId) { console.warn('backfillProfiles: no family loaded'); return; }
  let count = 0;
  for (const p of _db.profiles) {
    const ts = parseInt(p.id.replace('p_', ''), 10);
    const createdAt = ts ? new Date(ts).toISOString() : new Date().toISOString();
    await _firestore.collection('profiles').doc(p.id).set({
      profileName: p.name,
      familyId:    _db.familyId,
      joinCode:    _db.joinCode,
      createdAt,
    }, { merge: true });
    count++;
  }
  console.log(`backfillProfiles: wrote ${count} profile(s) for family ${_db.familyId}`);
}

// ── Friends ────────────────────────────────────
async function findProfileByCode(playerCode) {
  if (!_firestore) return null;
  const clean = playerCode.trim().toUpperCase();
  const codeSnap = await _firestore.collection('playerCodes').doc(clean).get();
  if (!codeSnap.exists) return null;
  const { profileId } = codeSnap.data();
  const profSnap = await _firestore.collection('profiles').doc(profileId).get();
  if (!profSnap.exists) return null;
  return { profileId, ...profSnap.data() };
}

async function addFriend(profileId, friendProfileId) {
  const p = _db.profiles.find(p => p.id === profileId);
  if (!p) return;
  if (!p.friends) p.friends = [];
  if (!p.friends.includes(friendProfileId)) {
    p.friends.push(friendProfileId);
    await _saveProfile(p);
  }
}

async function removeFriend(profileId, friendProfileId) {
  const p = _db.profiles.find(p => p.id === profileId);
  if (!p) return;
  p.friends = (p.friends || []).filter(id => id !== friendProfileId);
  await _saveProfile(p);
}

async function getFriendsStats(friendIds) {
  if (!_firestore || !friendIds.length) return [];
  const snaps = await Promise.all(
    friendIds.map(id => _firestore.collection('profiles').doc(id).get())
  );
  return snaps
    .filter(s => s.exists)
    .map(s => ({ profileId: s.id, ...s.data() }));
}

// One-time backfill: adds playerCode + stats to top-level profiles docs for
// profiles that predate the friends feature. Call from browser console.
async function backfillPlayerCodes() {
  if (!_firestore || !_db.familyId) { console.warn('backfillPlayerCodes: no family loaded'); return; }
  let count = 0;
  for (const p of _db.profiles) {
    if (!p.playerCode) {
      p.playerCode = generatePlayerCode();
      await _saveProfile(p);
      await _firestore.collection('playerCodes').doc(p.playerCode).set({ profileId: p.id });
    }
    await _firestore.collection('profiles').doc(p.id).set({
      playerCode:        p.playerCode,
      totalCorrect:      p.stats.totalCorrect,
      sessionsCompleted: p.stats.sessionsCompleted,
      bestStreak:        p.stats.bestStreak,
      coinsEarned:       p.coinsEarned || 0,
    }, { merge: true });
    count++;
    console.log(`backfillPlayerCodes: ${p.name} → ${p.playerCode}`);
  }
  console.log(`Done! Updated ${count} profile(s).`);
}

async function updateProfile(id, changes) {
  const idx = _db.profiles.findIndex(p => p.id === id);
  if (idx === -1) return null;
  _db.profiles[idx] = { ..._db.profiles[idx], ...changes };
  await _saveProfile(_db.profiles[idx]);
  return _db.profiles[idx];
}

async function deleteProfile(id) {
  _db.profiles = _db.profiles.filter(p => p.id !== id);
  if (_db.activeProfileId === id) {
    _db.activeProfileId = null;
    localStorage.removeItem(ACTIVE_PROFILE_KEY);
  }
  await _deleteProfileDoc(id);
}

// ── Coins ─────────────────────────────────────
async function addCoins(profileId, amount, reason) {
  const p = _db.profiles.find(p => p.id === profileId);
  if (!p) return;
  p.coins += amount;
  p.coinsEarned = (p.coinsEarned || 0) + amount;
  p.transactions.unshift({ id: 't_' + Date.now(), type: 'earn', amount, reason, date: new Date().toISOString() });
  await _saveProfile(p);
  if (_firestore && p.id) {
    _firestore.collection('profiles').doc(p.id).update({ coinsEarned: p.coinsEarned }).catch(() => {});
  }
}

async function spendCoins(profileId, amount, reason) {
  const p = _db.profiles.find(p => p.id === profileId);
  if (!p || p.coins < amount) return false;
  p.coins -= amount;
  p.transactions.unshift({ id: 't_' + Date.now(), type: 'spend', amount, reason, date: new Date().toISOString() });
  await _saveProfile(p);
  return true;
}

// ── Cards / inventory ─────────────────────────
function drawCard(theme) {
  const r = Math.random();
  const rarity = r < 0.60 ? 'common' : r < 0.85 ? 'uncommon' : r < 0.95 ? 'rare' : r < 0.99 ? 'epic' : 'legendary';
  const pool   = CARD_CATALOG[theme].filter(c => c.rarity === rarity);
  const tmpl   = pool[Math.floor(Math.random() * pool.length)];
  return {
    id:          'card_' + Date.now() + '_' + Math.floor(Math.random() * 9999),
    name:        tmpl.name,
    emoji:       tmpl.emoji,
    rarity:      tmpl.rarity,
    theme,
    earnedDate:  new Date().toLocaleDateString(),
  };
}

async function addCard(profileId, card) {
  const p = _db.profiles.find(p => p.id === profileId);
  if (!p) return;
  p.inventory.unshift(card);
  await _saveProfile(p);
}

async function setFlair(profileId, flairArray) {
  await updateProfile(profileId, { flair: flairArray });
}

async function setWallCards(profileId, wallCards) {
  await updateProfile(profileId, { wallCards });
}

async function updateStats(profileId, correct, attempted, streak) {
  const p = _db.profiles.find(p => p.id === profileId);
  if (!p) return;
  p.stats.totalCorrect      += correct;
  p.stats.totalAttempted    += attempted;
  p.stats.sessionsCompleted += 1;
  if (streak > p.stats.bestStreak) p.stats.bestStreak = streak;
  await _saveProfile(p);
  if (_firestore && p.id) {
    _firestore.collection('profiles').doc(p.id).update({
      totalCorrect:      p.stats.totalCorrect,
      sessionsCompleted: p.stats.sessionsCompleted,
      bestStreak:        p.stats.bestStreak,
    }).catch(() => {});
  }
}

// ── Store ─────────────────────────────────────
function getStore() { return _db.store; }

async function addStoreItem(item) {
  _db.store.push({ id: 'item_' + Date.now(), purchases: [], ...item });
  await _saveFamily({ store: _db.store });
}

async function updateStoreItem(id, changes) {
  const idx = _db.store.findIndex(s => s.id === id);
  if (idx !== -1) {
    _db.store[idx] = { ..._db.store[idx], ...changes };
    await _saveFamily({ store: _db.store });
  }
}

async function deleteStoreItem(id) {
  _db.store = _db.store.filter(s => s.id !== id);
  await _saveFamily({ store: _db.store });
}

async function purchaseItem(profileId, itemId) {
  const p    = _db.profiles.find(p => p.id === profileId);
  const item = _db.store.find(s => s.id === itemId);
  if (!p || !item || p.coins < item.cost) return false;
  p.coins -= item.cost;
  p.transactions.unshift({ id: 't_' + Date.now(), type: 'spend', amount: item.cost, reason: 'Bought: ' + item.name, date: new Date().toISOString() });
  if (!item.purchases) item.purchases = [];
  item.purchases.push({ profileId, date: new Date().toISOString() });
  await _saveProfile(p);
  await _saveFamily({ store: _db.store });
  return true;
}

function canPurchase(profileId, itemId) {
  const p    = getProfile(profileId);
  const item = getStore().find(s => s.id === itemId);
  if (!p || !item) return { ok: false, reason: 'Not found' };
  if (p.coins < item.cost) return { ok: false, reason: `Need ${item.cost - p.coins} more coins` };
  if (item.cooldownDays && item.purchases && item.purchases.length) {
    const mine = item.purchases.filter(pur => pur.profileId === profileId);
    if (mine.length) {
      const lastPurchase = mine[mine.length - 1]; // most recent purchase
      const daysSince = (Date.now() - new Date(lastPurchase.date)) / 86400000;
      if (daysSince < item.cooldownDays) {
        const daysLeft = Math.ceil(item.cooldownDays - daysSince);
        return { ok: false, reason: `Available in ${daysLeft} day${daysLeft !== 1 ? 's' : ''}` };
      }
    }
  }
  return { ok: true };
}

function getParentPin() { return _db.parentPin || '1234'; }
async function setParentPin(pin) {
  _db.parentPin = pin;
  await _saveFamily({ parentPin: pin });
}

// ── Feedback ───────────────────────────────────
async function saveFeedback(text, profileName) {
  if (!_firestore) return;
  await _firestore.collection('feedback').add({
    text,
    profileName,
    familyId:  _db.familyId  || null,
    joinCode:  _db.joinCode  || null,
    createdAt: new Date().toISOString(),
  });
}

// ── Journey / session log ──────────────────────
function getJourney(profileId, theme) {
  const p = getProfile(profileId);
  if (!p) return { chapter: 1, stopsCompleted: 0 };
  return (p.journeys && p.journeys[theme]) || { chapter: 1, stopsCompleted: 0 };
}

async function recordQuestSession(profileId, sessionData) {
  const p = _db.profiles.find(pr => pr.id === profileId);
  if (!p) return;
  if (!p.sessions)  p.sessions  = [];
  if (!p.journeys)  p.journeys  = {};
  if (!p.journeys[sessionData.theme]) p.journeys[sessionData.theme] = { chapter: 1, stopsCompleted: 0 };

  const j    = p.journeys[sessionData.theme];
  const stop = j.stopsCompleted + 1;

  p.sessions.unshift({
    id:      'sess_' + Date.now(),
    date:    new Date().toISOString(),
    theme:   sessionData.theme,
    op:      sessionData.op,
    correct: sessionData.correct,
    total:   sessionData.total,
    coins:   sessionData.coins,
    cardId:  sessionData.cardId,
    chapter: j.chapter,
    stop,
  });

  j.stopsCompleted = stop;
  if (j.stopsCompleted >= 10) { j.chapter++; j.stopsCompleted = 0; }
  await _saveProfile(p);
}

function getDailyOpCounts(profileId) {
  const p = getProfile(profileId);
  if (!p || !p.sessions) return {};
  const today  = new Date().toDateString();
  const counts = {};
  for (const s of p.sessions) {
    if (new Date(s.date).toDateString() === today) {
      counts[s.op] = (counts[s.op] || 0) + 1;
    }
  }
  return counts;
}

// ── Daily login streak ────────────────────────
async function checkDailyLogin(profileId) {
  const p = _db.profiles.find(pr => pr.id === profileId);
  if (!p) return null;

  const todayStr = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  const lastDate = p.lastLoginDate || null;

  // Same day — no change
  if (lastDate === todayStr) {
    return { isNewDay: false, wasGrace: false, newStreak: p.loginStreak || 0 };
  }

  // Calculate calendar days since last login
  let daysSince = Infinity;
  if (lastDate) {
    daysSince = Math.round((new Date(todayStr) - new Date(lastDate)) / (1000 * 60 * 60 * 24));
  }

  let newStreak;
  let wasGrace = false;
  if (!lastDate || daysSince >= 3) {
    newStreak = 1;
  } else if (daysSince === 1) {
    newStreak = (p.loginStreak || 0) + 1;
  } else {
    // daysSince === 2: grace day
    newStreak = (p.loginStreak || 0) + 1;
    wasGrace = true;
  }

  // Check milestones — draw card before saving so it gets included
  let milestoneCard = null;
  if (newStreak === 7) {
    milestoneCard = drawCard(p.theme);
  } else if (newStreak === 14) {
    const pool = CARD_CATALOG[p.theme].filter(c => ['rare','epic','legendary'].includes(c.rarity));
    const tmpl = pool[Math.floor(Math.random() * pool.length)];
    milestoneCard = { id: 'card_' + Date.now() + '_' + Math.floor(Math.random() * 9999), name: tmpl.name, emoji: tmpl.emoji, rarity: tmpl.rarity, theme: p.theme, earnedDate: new Date().toLocaleDateString() };
  } else if (newStreak === 30) {
    const pool = CARD_CATALOG[p.theme].filter(c => ['epic','legendary'].includes(c.rarity));
    const tmpl = pool[Math.floor(Math.random() * pool.length)];
    milestoneCard = { id: 'card_' + Date.now() + '_' + Math.floor(Math.random() * 9999), name: tmpl.name, emoji: tmpl.emoji, rarity: tmpl.rarity, theme: p.theme, earnedDate: new Date().toLocaleDateString() };
  }

  // Update streak fields on the profile object before saving
  p.loginStreak   = newStreak;
  p.lastLoginDate = todayStr;

  // addCoins saves the full profile (including updated streak fields)
  await addCoins(profileId, 2, '🔥 Daily login bonus');

  if (milestoneCard) {
    await addCard(profileId, milestoneCard);
  }

  return { isNewDay: true, wasGrace, newStreak, milestoneCard };
}

// ── Card catalog & other constants (unchanged) ─
const CARD_CATALOG = {
  forest: [
    { name: 'Sleepy Squirrel',   emoji: '🐿️', rarity: 'common' },
    { name: 'Happy Bunny',       emoji: '🐰', rarity: 'common' },
    { name: 'Mischief Mouse',    emoji: '🐭', rarity: 'common' },
    { name: 'Friendly Dog',      emoji: '🐶', rarity: 'common' },
    { name: 'Cozy Cat',          emoji: '🐱', rarity: 'common' },
    { name: 'Clever Fox',        emoji: '🦊', rarity: 'uncommon' },
    { name: 'Gentle Deer',       emoji: '🦌', rarity: 'uncommon' },
    { name: 'Busy Beaver',       emoji: '🦫', rarity: 'uncommon' },
    { name: 'Sneaky Raccoon',    emoji: '🦝', rarity: 'uncommon' },
    { name: 'Wise Owl',          emoji: '🦉', rarity: 'rare' },
    { name: 'Mighty Bear',       emoji: '🐻', rarity: 'rare' },
    { name: 'Ancient Tortoise',  emoji: '🐢', rarity: 'rare' },
    { name: 'Night Wolf',        emoji: '🐺', rarity: 'epic' },
    { name: 'Golden Eagle',      emoji: '🦅', rarity: 'epic' },
    { name: 'Enchanted Unicorn', emoji: '🦄', rarity: 'legendary' },
  ],
  ocean: [
    { name: 'Tiny Clownfish',    emoji: '🐠', rarity: 'common' },
    { name: 'Happy Crab',        emoji: '🦀', rarity: 'common' },
    { name: 'Blue Jellyfish',    emoji: '🪼', rarity: 'common' },
    { name: 'Spotty Turtle',     emoji: '🐢', rarity: 'common' },
    { name: 'Silly Pufferfish',  emoji: '🐡', rarity: 'common' },
    { name: 'Playful Seal',      emoji: '🦭', rarity: 'uncommon' },
    { name: 'Smart Octopus',     emoji: '🐙', rarity: 'uncommon' },
    { name: 'Fast Squid',        emoji: '🦑', rarity: 'uncommon' },
    { name: 'Striped Fish',      emoji: '🐟', rarity: 'uncommon' },
    { name: 'Cool Dolphin',      emoji: '🐬', rarity: 'rare' },
    { name: 'Reef Shark',        emoji: '🦈', rarity: 'rare' },
    { name: 'Glowing Seahorse',  emoji: '🌊', rarity: 'rare' },
    { name: 'Majestic Orca',     emoji: '🐋', rarity: 'epic' },
    { name: 'Giant Manta Ray',   emoji: '🦑', rarity: 'epic' },
    { name: 'Ancient Sea Dragon',emoji: '🐉', rarity: 'legendary' },
  ],
  farm: [
    { name: 'Clucky Chicken',    emoji: '🐔', rarity: 'common' },
    { name: 'Happy Cow',         emoji: '🐮', rarity: 'common' },
    { name: 'Fluffy Sheep',      emoji: '🐑', rarity: 'common' },
    { name: 'Playful Pig',       emoji: '🐷', rarity: 'common' },
    { name: 'Friendly Duck',     emoji: '🦆', rarity: 'common' },
    { name: 'Swift Horse',       emoji: '🐴', rarity: 'uncommon' },
    { name: 'Proud Rooster',     emoji: '🐓', rarity: 'uncommon' },
    { name: 'Fluffy Rabbit',     emoji: '🐇', rarity: 'uncommon' },
    { name: 'Bouncy Goat',       emoji: '🐐', rarity: 'uncommon' },
    { name: 'Guard Dog',         emoji: '🐕', rarity: 'rare' },
    { name: 'Barn Cat',          emoji: '🐈', rarity: 'rare' },
    { name: 'Wise Turkey',       emoji: '🦃', rarity: 'rare' },
    { name: 'Champion Bull',     emoji: '🐂', rarity: 'epic' },
    { name: 'Royal Peacock',     emoji: '🦚', rarity: 'epic' },
    { name: 'Golden Hen',        emoji: '🌟', rarity: 'legendary' },
  ],
  jungle: [
    { name: 'Curious Monkey',    emoji: '🐒', rarity: 'common' },
    { name: 'Colorful Parrot',   emoji: '🦜', rarity: 'common' },
    { name: 'Spotty Frog',       emoji: '🐸', rarity: 'common' },
    { name: 'Happy Elephant',    emoji: '🐘', rarity: 'common' },
    { name: 'Silly Rhino',       emoji: '🦏', rarity: 'common' },
    { name: 'Striped Zebra',     emoji: '🦓', rarity: 'uncommon' },
    { name: 'Long Giraffe',      emoji: '🦒', rarity: 'uncommon' },
    { name: 'Sneaky Leopard',    emoji: '🐆', rarity: 'uncommon' },
    { name: 'Cool Hippo',        emoji: '🦛', rarity: 'uncommon' },
    { name: 'Fierce Tiger',      emoji: '🐯', rarity: 'rare' },
    { name: 'Proud Lion',        emoji: '🦁', rarity: 'rare' },
    { name: 'Wise Gorilla',      emoji: '🦍', rarity: 'rare' },
    { name: 'Crocodile King',    emoji: '🐊', rarity: 'epic' },
    { name: 'Jungle Jaguar',     emoji: '🐅', rarity: 'epic' },
    { name: 'Mythic Komodo',     emoji: '🦎', rarity: 'legendary' },
  ],
  arctic: [
    { name: 'Happy Penguin',     emoji: '🐧', rarity: 'common' },
    { name: 'Playful Seal',      emoji: '🦭', rarity: 'common' },
    { name: 'Arctic Fox',        emoji: '🦊', rarity: 'common' },
    { name: 'Snow Rabbit',       emoji: '🐰', rarity: 'common' },
    { name: 'Fluffy Puffin',     emoji: '🐦', rarity: 'common' },
    { name: 'Reindeer Runner',   emoji: '🦌', rarity: 'uncommon' },
    { name: 'Polar Dog',         emoji: '🐕', rarity: 'uncommon' },
    { name: 'Snowy Owl',         emoji: '🦉', rarity: 'uncommon' },
    { name: 'Tundra Wolf',       emoji: '🐺', rarity: 'uncommon' },
    { name: 'Polar Bear',        emoji: '🐻', rarity: 'rare' },
    { name: 'Beluga Whale',      emoji: '🐳', rarity: 'rare' },
    { name: 'Walrus Guard',      emoji: '🦭', rarity: 'rare' },
    { name: 'Orca Warrior',      emoji: '🐋', rarity: 'epic' },
    { name: 'Ice Griffin',       emoji: '🦅', rarity: 'epic' },
    { name: 'Aurora Dragon',     emoji: '✨', rarity: 'legendary' },
  ],
};

const MASCOT_POOLS = {
  forest: ['🐱','🐶','🦊','🐻','🐰','🐭','🦔','🦝','🦌','🦉','🐺','🦅','🦫','🐿️','🦄'],
  ocean:  ['🐠','🦈','🐙','🐬','🐳','🦭','🦀','🪼','🦑','🐡','🐢','🐋','🐟','🐉','🌊'],
  farm:   ['🐔','🐮','🐷','🐑','🐴','🦆','🐓','🐇','🐐','🦃','🐕','🐈','🐂','🦚','🌟'],
  jungle: ['🦁','🐯','🐘','🦒','🐸','🦍','🐊','🦓','🐒','🦜','🐆','🦛','🦏','🐅','🦎'],
  arctic: ['🐧','🦭','🐳','🦊','🐺','🦌','🐋','🦅','🐦','🦉','🐕','🐰','🐻','🪶','❄️'],
};

const RARITY_COLORS = {
  common:    '#64748B',
  uncommon:  '#16A34A',
  rare:      '#2563EB',
  epic:      '#9333EA',
  legendary: '#D97706',
};

const RARITY_LABELS = {
  common:    'Common',
  uncommon:  'Uncommon',
  rare:      'Rare',
  epic:      'Epic',
  legendary: 'Legendary ✨',
};
