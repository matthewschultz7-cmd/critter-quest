// ─────────────────────────────────────────────
//  Critter Quest — Story Quests Engine
//  Phase 1: static pre-written quests.
//  All functions are globally scoped so inline
//  onclick handlers can reach them.
// ─────────────────────────────────────────────

// ── State ─────────────────────────────────────
const SQ = {
  quest:       null,      // full quest object from STORY_QUESTS
  currentQ:    0,         // 0-indexed question index (0–9)
  answered:    false,     // has the current question been answered?
  attempts:    0,         // wrong attempt count on current question
  correct:     0,         // running correct count
  coins:       0,         // running coin count (2 × correct)
  phase:       'opening', // 'opening' | 'question' | 'milestone' | 'closing'
  continueFn:  null,      // stored callback for panel Continue button
};

// ── Story Select Screen ───────────────────────
function renderStorySelect() {
  const p = getActiveProfile();
  if (!p) { nav('profiles'); return; }

  // Grade key is stored exactly as profile.grade, e.g. 'kindergarten' or 'grade3'
  const grade     = p.grade;
  const forestQ   = STORY_QUESTS.forest[grade];
  const jungleQ   = STORY_QUESTS.jungle[grade];
  const hasQuests = (forestQ && forestQ.length > 0) || (jungleQ && jungleQ.length > 0);

  let cardsHtml = '';

  if (!hasQuests) {
    cardsHtml = `
      <div class="sq-coming-soon">
        <div class="sq-cs-emoji">🚀</div>
        <div class="sq-cs-title">Coming Soon!</div>
        <div class="sq-cs-text">More adventures are being written for your grade. Check back soon!</div>
      </div>`;
  } else {
    if (forestQ && forestQ.length > 0) {
      cardsHtml += forestQ.map(q => sqQuestCardHtml(q, 'forest')).join('');
    }
    if (jungleQ && jungleQ.length > 0) {
      cardsHtml += jungleQ.map(q => sqQuestCardHtml(q, 'jungle')).join('');
    }
  }

  document.getElementById('screen-story-select').innerHTML = `
    <div class="page-wrap">
      <button class="back-btn" onclick="nav('dashboard')">← Dashboard</button>
      <h2 class="page-title">📖 Story Quests</h2>
      <p class="page-subtitle">Math adventures with a twist — solve problems to move the story forward!</p>
      <div class="sq-select-grid">${cardsHtml}</div>
    </div>`;
}

function sqQuestCardHtml(quest, theme) {
  const themeIcon = theme === 'forest' ? '🌲' : '🌴';
  const themeName = theme === 'forest' ? 'Forest' : 'Jungle';
  return `
    <div class="sq-quest-card">
      <div class="sq-qc-emoji">${quest.emoji}</div>
      <div class="sq-qc-theme">${themeIcon} ${esc(themeName)}</div>
      <div class="sq-qc-chapter">Chapter ${quest.chapter}</div>
      <div class="sq-qc-title">${esc(quest.title)}</div>
      <div class="sq-qc-info">10 questions · 🪙 up to 20 coins</div>
      <button class="primary-btn" onclick="nav('story-game', { questId: '${esc(quest.id)}' })">Play! ⚔️</button>
    </div>`;
}

// ── Game Initialiser ──────────────────────────
function initStoryGame(data) {
  const { questId } = data;

  // Find the quest by scanning all themes/grades
  let found = null;
  for (const theme of Object.keys(STORY_QUESTS)) {
    for (const grade of Object.keys(STORY_QUESTS[theme])) {
      const match = STORY_QUESTS[theme][grade].find(q => q.id === questId);
      if (match) { found = match; break; }
    }
    if (found) break;
  }

  if (!found) {
    console.error('Story quest not found:', questId);
    nav('story-select');
    return;
  }

  // Reset state
  SQ.quest      = found;
  SQ.currentQ   = 0;
  SQ.answered   = false;
  SQ.attempts   = 0;
  SQ.correct    = 0;
  SQ.coins      = 0;
  SQ.phase      = 'opening';
  SQ.continueFn = null;

  // Apply theme based on active profile
  const p = getActiveProfile();
  if (!p) { nav('profiles'); return; }
  applyTheme(p.theme, null);

  sqShowPanel(found.openingScene, () => {
    SQ.phase = 'question';
    sqShowQuestion();
  });
}

// ── Panel Renderer ────────────────────────────
// Renders the story-game screen as a full narrative panel.
// onContinue is stored in SQ.continueFn and called by sqPanelContinue().
function sqShowPanel(panel, onContinue) {
  SQ.continueFn = onContinue;

  const titleHtml = panel.title
    ? `<div class="sq-panel-title">${esc(panel.title)}</div>`
    : '';

  document.getElementById('screen-story-game').innerHTML = `
    <div class="sq-panel">
      <div class="sq-panel-emoji">${panel.emoji}</div>
      ${titleHtml}
      <div class="sq-panel-text">${esc(panel.text)}</div>
      <button class="sq-panel-btn" onclick="sqPanelContinue()">${esc(panel.btnLabel || 'Continue →')}</button>
    </div>`;
}

// Called by the Continue button's inline onclick
function sqPanelContinue() {
  if (SQ.continueFn) {
    const fn = SQ.continueFn;
    SQ.continueFn = null;
    fn();
  }
}

// ── Question Renderer ─────────────────────────
function sqShowQuestion() {
  const q         = SQ.quest.questions[SQ.currentQ];
  const qNum      = SQ.currentQ + 1;   // 1-indexed for display
  const pct       = Math.round((SQ.currentQ / 10) * 100);
  const opSymbol  = q.op;               // already '+', '-', '×', '÷'

  document.getElementById('screen-story-game').innerHTML = `
    <div class="sq-question-wrap">

      <div class="sq-progress-row">
        <span class="sq-progress-label">Question ${qNum} of 10</span>
        <span class="sq-coins-label">🪙 ${SQ.coins}</span>
      </div>
      <div class="sq-progress-bar-track">
        <div class="sq-progress-bar-fill" style="width:${pct}%"></div>
      </div>

      <div class="sq-question-emoji">${q.emoji}</div>
      <div class="sq-story-context">${esc(q.storyContext)}</div>

      <div class="sq-problem" id="sq-problem-display">
        ${q.a} ${opSymbol} ${q.b} = ?
      </div>

      <div class="sq-input-row">
        <input
          id="sq-input"
          class="sq-input"
          type="number"
          inputmode="numeric"
          pattern="[0-9]*"
          placeholder="?"
          autocomplete="off"
        />
        <button class="sq-check-btn" onclick="sqCheckAnswer()">✓</button>
      </div>

      <div class="sq-feedback" id="sq-feedback"></div>

      <button class="sq-next-btn" id="sq-next-btn" onclick="sqNextQuestion()">Next →</button>

    </div>`;

  // Focus input; also wire Enter key
  const inp = document.getElementById('sq-input');
  if (inp) {
    inp.focus();
    inp.addEventListener('keydown', e => {
      if (e.key === 'Enter') {
        if (!SQ.answered) {
          sqCheckAnswer();
        } else {
          sqNextQuestion();
        }
      }
    });
  }
}

// ── Answer Checker ────────────────────────────
async function sqCheckAnswer() {
  if (SQ.answered) return;

  const inp = document.getElementById('sq-input');
  if (!inp) return;
  const raw = inp.value.trim();
  if (raw === '') { inp.focus(); return; }

  const guess  = parseInt(raw, 10);
  const q      = SQ.quest.questions[SQ.currentQ];
  const fb     = document.getElementById('sq-feedback');
  const nextBtn = document.getElementById('sq-next-btn');

  if (isNaN(guess)) { inp.focus(); return; }

  if (guess === q.answer) {
    // ── Correct ──────────────────────────────
    SQ.correct++;
    SQ.coins += 2;
    SQ.answered = true;

    const reactions  = SQ.quest.correctReactions;
    const reaction   = reactions[Math.floor(Math.random() * reactions.length)];

    if (fb) {
      fb.textContent  = reaction;
      fb.className    = 'sq-feedback correct show';
    }

    // Animate the problem display
    const prob = document.getElementById('sq-problem-display');
    if (prob) { prob.classList.add('sq-correct-pop'); }

    spawnConfetti(10);

    // Award coins in the database
    const p = getActiveProfile();
    if (p) await addCoins(p.id, 2, 'Story Quest answer');

    // Update coin display immediately
    const coinLabel = document.getElementById('sq-coins-label');
    if (coinLabel) coinLabel.textContent = `🪙 ${SQ.coins}`;
    // (also re-render header for the global coin counter)
    renderHeader();

    // Show Next button
    if (nextBtn) nextBtn.style.display = 'inline-block';

  } else {
    // ── Wrong ────────────────────────────────
    SQ.attempts++;

    if (SQ.attempts >= 3) {
      // Auto-reveal after 3 wrong attempts
      SQ.answered = true;
      if (fb) {
        fb.textContent = `The answer was ${q.answer}. You've got this next time! 💪`;
        fb.className   = 'sq-feedback reveal show';
      }
      if (nextBtn) nextBtn.style.display = 'inline-block';
    } else {
      // Show a story nudge
      const nudges = SQ.quest.wrongNudges;
      const nudge  = nudges[Math.floor(Math.random() * nudges.length)];
      if (fb) {
        fb.textContent = nudge;
        fb.className   = 'sq-feedback wrong show';
      }

      // Shake the problem display
      const prob = document.getElementById('sq-problem-display');
      if (prob) {
        prob.classList.remove('sq-shake');
        void prob.offsetWidth; // force reflow
        prob.classList.add('sq-shake');
      }

      // Clear input and refocus
      inp.value = '';
      inp.focus();
    }
  }
}

// ── Next Question ─────────────────────────────
function sqNextQuestion() {
  if (!SQ.answered) return;
  SQ.currentQ++;
  SQ.answered = false;
  SQ.attempts = 0;

  const quest = SQ.quest;

  // Check for milestone panels (shown AFTER questions 3, 6, 9)
  if ([3, 6, 9].includes(SQ.currentQ)) {
    const milestone = quest.milestones.find(m => m.afterQ === SQ.currentQ);
    if (milestone) {
      SQ.phase = 'milestone';
      sqShowPanel(milestone, () => {
        SQ.phase = 'question';
        sqShowQuestion();
      });
      return;
    }
  }

  // All 10 questions done — show closing panel
  if (SQ.currentQ === 10) {
    SQ.phase = 'closing';
    sqShowPanel(quest.closingScene, () => finishStoryQuest());
    return;
  }

  // Next question
  sqShowQuestion();
}

// ── Finish Quest ──────────────────────────────
async function finishStoryQuest() {
  const p = getActiveProfile();
  if (!p) { nav('dashboard'); return; }

  const card = drawCard(p.theme);
  await addCard(p.id, card);
  await updateStats(p.id, SQ.correct, 10, 0);

  nav('story-done', {
    quest:   SQ.quest,
    correct: SQ.correct,
    coins:   SQ.coins,
    card,
  });
}

// ── Story Done Screen ─────────────────────────
function renderStoryDone(data) {
  const { quest, correct, coins, card } = data;
  const rc  = RARITY_COLORS[card.rarity];
  const pct = Math.round((correct / 10) * 100);
  const msg = pct === 100 ? '🏆 Perfect Adventure!' : pct >= 70 ? '⭐ Great Quest!' : '💪 Adventure Complete!';

  document.getElementById('screen-story-done').innerHTML = `
    <div class="sq-done-wrap">
      <div class="sq-done-title">${msg}</div>
      <div class="sq-done-quest-name">${esc(quest.emoji)} ${esc(quest.title)}</div>

      <div class="sq-done-score">
        <div class="sq-done-score-num">${correct} / 10</div>
        <div class="sq-done-score-lbl">Correct Answers</div>
        <div class="sq-done-coins">+${coins} 🪙 coins earned!</div>
      </div>

      <div class="sq-teaser">${esc(quest.closingScene.teaser)}</div>

      <div class="card-reveal">
        <div class="card-reveal-label">🎁 You earned a new card!</div>
        <div class="card-reveal-emoji">${card.emoji}</div>
        <div class="card-reveal-name">${card.name}</div>
        <div class="rarity-badge" style="background:${rc}">${RARITY_LABELS[card.rarity]}</div>
        <div style="font-size:.72rem;font-weight:700;color:#94A3B8">${THEMES[card.theme].icon} ${THEMES[card.theme].name} · ${card.earnedDate}</div>
      </div>

      <div class="done-btn-row">
        <button class="primary-btn" onclick="nav('story-game', { questId: '${esc(quest.id)}' })">Play Again! ⚔️</button>
        <button class="primary-btn" style="background:#1E293B;box-shadow:0 4px 0 #0F172A" onclick="nav('dashboard')">Dashboard 🏠</button>
      </div>
    </div>`;

  spawnConfetti(20);
}
