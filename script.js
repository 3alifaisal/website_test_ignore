'use strict';

// ==================== UTILS ====================
function getTime() {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

// ==================== CONFETTI ====================
const CONFETTI_COLORS = ['#ff4fa3','#ffe94f','#4ff0ff','#a84fff','#ff6b35','#7fff00'];

function launchConfettiBurst(count) {
  for (let i = 0; i < count; i++) {
    setTimeout(() => spawnConfettiPiece(), Math.random() * 1800);
  }
}

function spawnConfettiPiece() {
  const el = document.createElement('div');
  el.className = 'confetti-piece';
  el.style.left            = Math.random() * 100 + 'vw';
  el.style.backgroundColor = CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)];
  el.style.width           = (6 + Math.random() * 10) + 'px';
  el.style.height          = (6 + Math.random() * 10) + 'px';
  el.style.borderRadius    = Math.random() > 0.5 ? '50%' : '2px';
  const dur = 2.5 + Math.random() * 3;
  el.style.animationDuration = dur + 's';
  document.body.appendChild(el);
  setTimeout(() => el.remove(), dur * 1000 + 200);
}

// Gentle ongoing drizzle once chat is open
let drizzleActive = false;
const drizzleInterval = setInterval(() => {
  if (drizzleActive) spawnConfettiPiece();
}, 400);

// ==================== INTERACTIVE CONFETTI ====================
let lastTrailTime = 0;
document.addEventListener('mousemove', (e) => {
  if (!drizzleActive) return;
  const now = Date.now();
  if (now - lastTrailTime < 40) return; // throttle to ~25fps
  lastTrailTime = now;
  spawnInteractiveConfetti(e.clientX, e.clientY, 'trail');
});

document.addEventListener('click', (e) => {
  if (!drizzleActive) return;
  if (e.target.closest('#wa-send-btn, #wa-tap-hint, #chat-challenge-btn, a, button')) return;
  for (let i = 0; i < 22; i++) spawnInteractiveConfetti(e.clientX, e.clientY, 'explode');
  playPop();
});

function spawnInteractiveConfetti(x, y, type) {
  const el   = document.createElement('div');
  el.className = `confetti-interact ${type}`;
  const size = (type === 'trail' ? 4 : 6) + Math.random() * 6;
  el.style.width           = size + 'px';
  el.style.height          = size + 'px';
  el.style.left            = x + 'px';
  el.style.top             = y + 'px';
  el.style.backgroundColor = CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)];
  el.style.borderRadius    = Math.random() > 0.4 ? '50%' : '2px';

  if (type === 'explode') {
    const angle = Math.random() * Math.PI * 2;
    const dist  = 80 + Math.random() * 160;
    el.style.setProperty('--tx',  Math.cos(angle) * dist + 'px');
    el.style.setProperty('--ty',  Math.sin(angle) * dist + 'px');
    el.style.setProperty('--rot', (Math.random() * 720 - 360) + 'deg');
    el.style.setProperty('--dur', (0.5 + Math.random() * 0.7) + 's');
  }
  document.body.appendChild(el);
  setTimeout(() => el.remove(), type === 'trail' ? 700 : 1300);
}

// ==================== WEB AUDIO ====================
let audioCtx = null;
function getAudioCtx() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  return audioCtx;
}
function playTone(freq, type, duration, start, gain = 0.28) {
  if (gain <= 0) return;
  const ctx  = getAudioCtx();
  const osc  = ctx.createOscillator();
  const vol  = ctx.createGain();
  osc.connect(vol); vol.connect(ctx.destination);
  osc.type = type;
  osc.frequency.setValueAtTime(freq, start);
  vol.gain.setValueAtTime(gain, start);
  vol.gain.exponentialRampToValueAtTime(0.001, start + duration);
  osc.start(start); osc.stop(start + duration);
}
function playPop() {
  const ctx = getAudioCtx(), now = ctx.currentTime;
  playTone(600, 'sine', 0.1, now, 0.35);
  playTone(900, 'sine', 0.08, now + 0.05, 0.25);
}
function playFanfare() {
  const ctx = getAudioCtx(), now = ctx.currentTime;
  [523, 659, 784, 1047, 784, 1047].forEach((f, i) =>
    playTone(f, 'square', 0.18, now + i * 0.12, 0.22));
}
// WhatsApp-style message received "ding"
function playDing() {
  const ctx = getAudioCtx(), now = ctx.currentTime;
  playTone(880, 'sine', 0.15, now, 0.18);
  playTone(1100, 'sine', 0.1, now + 0.07, 0.12);
}

// ==================== TOAST ====================
function showToast(msg) {
  const t = document.createElement('div');
  t.textContent = msg;
  Object.assign(t.style, {
    position: 'fixed', bottom: '5rem', left: '50%',
    transform: 'translateX(-50%) translateY(14px)',
    background: 'rgba(0,0,0,0.85)', color: '#fff',
    padding: '0.65rem 1.4rem', borderRadius: '99px',
    fontSize: '0.95rem', zIndex: '99999',
    opacity: '0', transition: 'opacity 0.3s, transform 0.3s',
    maxWidth: '90vw', textAlign: 'center', pointerEvents: 'none',
  });
  document.body.appendChild(t);
  requestAnimationFrame(() => {
    t.style.opacity   = '1';
    t.style.transform = 'translateX(-50%) translateY(0)';
  });
  setTimeout(() => {
    t.style.opacity = '0';
    setTimeout(() => t.remove(), 400);
  }, 3000);
}

// ==================== MESSAGE TEMPLATES ====================
function mkDrawingHTML() {
  return `<span class="chess-card-board">🎨 🖌️ ✨ 🌈 💕 🖼️</span>
    <strong style="display:block;margin:0.35rem 0 0.65rem;">a canvas for your creativity 🎨</strong>
    <a href="drawing.html" class="chat-card-btn chess-btn">🎨 Open Drawing Studio</a>`;
}

function mkBirthdayHTML() {
  return `🎂🎉<br>HAPPY BIRTHDAY,<br>ATHENA!!<br>🎉🎂`;
}


function mkChallengeHTML() {
  let slots = '';
  for (let i = 0; i < CHALLENGE_CLICKS; i++) {
    slots += `<span class="candle-slot" id="candle-${i}" style="opacity:0.2; filter:grayscale(100%); transition:all 0.3s; display:inline-block; font-size:1.4rem; margin:0.1rem;">🧶</span>`;
  }
  return `<div id="candle-grid">${slots}</div>
    <button id="chat-challenge-btn">🧶 Knit the birthday cake!</button>`;
}

function mkHeartfeltHTML() {
  return `<p><strong>Dear Athena,</strong></p>
    <p>I want to start off this letter by mentioning how much I am proud of you, and how much you have grown since we first met. Its insane how much has changed since we first met.</p>
    <p>we got to know each other in krakow, that was 6 years ago, crazy how time flies. I have had the pleasure of being your best friend for all these years, and I would wish for many many more to come, filled with health, hope, learning and luck, and many many shenanigans.</p>
    <p>I wish that you will stay on your path, and that everything you have planned for, will work out exactly how you imagine it. You are really a wonderful person and its all right for your life to be blessed and for you to feel a holy angel on your shoulder whenever you need it.</p>
    <p>Youre the bestiestest friend a guy could ask for and I hope i get to wish you for many, many decades to come,</p>
    <p class="heartfelt-sig">love, Ali. 💖</p>`;
}

function mkPostBubbleHTML() {
  return `<span class="post-envelope-icon">💌</span>
    <div class="post-open-hint">tap to open</div>`;
}

// ==================== CHALLENGE / DINO CONSTANTS ====================
// Defined here (before SCRIPT) so mkChallengeHTML() can reference them
// during SCRIPT array initialization without hitting the TDZ.
const CHALLENGE_CLICKS = 24; // Athena is turning 24!
const CAKE_PARTS = [
  '🍰', '🍰', '🍰', '🍰', '🍰', '🍰', '🍰', '🍰', '🍰', '🍰', '🍰', '🍰',
  '🍓', '🍓', '🍓', '🍓', '🍓', '🍓', '🍓', '🍓',
  '🕯️', '🕯️', '🕯️', '🕯️'
];
const DINO_DELAY_MS    = 3000; // ms after drawing card before dress-up appears

// ==================== MESSAGE SCRIPT ====================
// Each beat is one of:
//   { type:'preload', ... }   — shown instantly when chat opens
//   { type:'delay',  ms }     — pause before continuing
//   { type:'msg',    ... }    — show typing indicator then append bubble
//   { type:'gate',   label }  — pause until user taps the input bar
const SCRIPT = [
  { type:'msg', text:'Hey 👋',                                                          typing: 600  },
  { type:'msg', text:'Sorry for being not original',                                    typing: 1000 },
  { type:'msg', text:'But I wanted to emphasize how much your gift meant to me',        typing: 1400 },

  { type:'delay', ms: 1000 },

  // ---- Phase 1: calm intro (auto-play) ----
  { type:'msg', text:'Since we\'ve known each other so long, you know I\'m always busy schooling you on fashion...', typing: 1400 },
  { type:'msg', text:'But I wanted to build a little digital space just for you to have fun today! 🎨👗', typing: 1600 },

  { type:'gate', label:'Tap to open 📩' },

  // ---- Phase 2: knitting cake challenge ----
  { type:'msg', text:'now let\'s knit your birthday cake! 🎂🧶',                                         typing: 900  },
  { type:'msg', bubbleClass:'challenge-bubble', html:mkChallengeHTML(),                              typing:1500 },
];

// ==================== CHAT ENGINE ====================
let qIdx     = 0;
let gateOpen = false;
let busy     = false;

const chatEl   = document.getElementById('chat-messages');
const winEl    = document.getElementById('chat-window');
const tapEl    = document.getElementById('wa-tap-hint');
const sendEl   = document.getElementById('wa-send-btn');
const typingEl = document.getElementById('typing-indicator');
const statusEl = document.getElementById('wa-header-status');

// Reveal a hidden header icon with a pop-in animation.
function revealHeaderIcon(id) {
  const el = document.getElementById(id);
  if (!el || !el.hasAttribute('hidden')) return;
  el.removeAttribute('hidden');
  // Re-trigger the CSS animation each time (removes then re-adds the class)
  el.classList.remove('header-unlock-icon');
  void el.offsetWidth; // force reflow
  el.classList.add('header-unlock-icon');
}

function scrollBottom() {
  winEl.scrollTo({ top: winEl.scrollHeight, behavior: 'smooth' });
}

function showTyping() {
  typingEl.style.display = 'flex';
  statusEl.textContent   = 'typing...';
  scrollBottom();
}

function hideTyping() {
  typingEl.style.display = 'none';
  statusEl.textContent   = 'online';
}

function buildBubble(beat, timeStr) {
  const wrap   = document.createElement('div');
  wrap.className = 'wa-msg received';

  const bubble = document.createElement('div');
  bubble.className = `wa-bubble ${beat.bubbleClass || ''}`;

  if (beat.html) {
    bubble.innerHTML = beat.html;
  } else {
    bubble.textContent = beat.text || '';
  }

  const ts = document.createElement('span');
  ts.className   = 'wa-time';
  ts.textContent = timeStr;
  bubble.appendChild(ts);

  wrap.appendChild(bubble);
  return wrap;
}

function appendMsg(beat) {
  const el = buildBubble(beat, beat.time || getTime());
  chatEl.insertBefore(el, typingEl);
  scrollBottom();
  playDing();
  if (beat.onShow) beat.onShow();
  if (beat.bubbleClass === 'challenge-bubble') initChallenge();
  return el;
}

function setGate(label) {
  gateOpen = true;
  tapEl.textContent = label || 'Tap to continue...';
  tapEl.classList.add('active-hint');
  sendEl.classList.remove('locked');
}

function clearGate() {
  gateOpen = false;
  tapEl.textContent = 'Type a message';
  tapEl.classList.remove('active-hint');
  sendEl.classList.add('locked');
}

function advance() {
  if (busy || qIdx >= SCRIPT.length) return;

  const beat = SCRIPT[qIdx++];

  if (beat.type === 'preload') {
    appendMsg(beat);
    advance();
    return;
  }

  if (beat.type === 'delay') {
    setTimeout(advance, beat.ms || 1000);
    return;
  }

  if (beat.type === 'gate') {
    setGate(beat.label);
    return;
  }

  if (beat.type === 'msg') {
    busy = true;
    sendEl.classList.add('locked');
    showTyping();
    setTimeout(() => {
      hideTyping();
      appendMsg(beat);
      busy = false;
      // Immediately advance to see if next is gate/delay/another msg
      const next = SCRIPT[qIdx];
      if (!next) return;
      if (next.type === 'msg') {
        setTimeout(advance, 280);
      } else {
        advance();
      }
    }, beat.typing || 1000);
  }
}

function handleTap() {
  if (!gateOpen || busy) return;
  clearGate();
  playPop();
  advance();
}

tapEl.addEventListener('click',   handleTap);
sendEl.addEventListener('click',  handleTap);
tapEl.addEventListener('keydown', e => {
  if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleTap(); }
});

// ==================== FLYING PLANE ====================
let planeActive = false; // prevent relaunching

function launchFlyingPlane(onArrived) {
  const plane = document.getElementById('flying-plane');
  if (!plane || planeActive) return;
  planeActive = true;

  plane.removeAttribute('hidden');

  let x  = Math.random() * Math.max(1, window.innerWidth  - 80);
  let y  = 80 + Math.random() * Math.max(1, window.innerHeight - 180);
  let vx = (Math.random() < 0.5 ? 1 : -1) * (9 + Math.random() * 7);
  let vy = (Math.random() < 0.5 ? 1 : -1) * (6 + Math.random() * 6);

  plane.style.left = x + 'px';
  plane.style.top  = y + 'px';

  let rafId     = null;
  let startTime = null;
  const CHAOS_MS = 5500;
  const SLOW_MS  = 2000;

  function animPlane(ts) {
    if (!startTime) startTime = ts;
    const elapsed = ts - startTime;

    if (elapsed < CHAOS_MS) {
      // Chaotic phase — random direction nudges
      if (Math.random() < 0.06) {
        vx += (Math.random() - 0.5) * 12;
        vy += (Math.random() - 0.5) * 12;
      }
      const spd = Math.hypot(vx, vy);
      if (spd > 16) { vx = vx / spd * 16; vy = vy / spd * 16; }
      if (spd < 7)  { vx = vx / spd * 7;  vy = vy / spd * 7;  }
    } else if (elapsed < CHAOS_MS + SLOW_MS) {
      // Decelerate toward viewport centre
      const t  = (elapsed - CHAOS_MS) / SLOW_MS;
      const cx = window.innerWidth  / 2 - 30;
      const cy = window.innerHeight / 2 - 30;
      vx = vx * 0.90 + (cx - x) * 0.018 * t;
      vy = vy * 0.90 + (cy - y) * 0.018 * t;
    } else {
      // Arrived — hover
      plane.classList.add('plane-ready');
      plane.addEventListener('click', () => {
        saveState();
        window.location.href = 'map.html';
      }, { once: true });
      if (onArrived) onArrived();
      return; // stop RAF
    }

    // Bounce off screen edges (leave room for header)
    const W = window.innerWidth, H = window.innerHeight;
    if (x < 8)      { x = 8;      vx =  Math.abs(vx); }
    if (x > W - 68) { x = W - 68; vx = -Math.abs(vx); }
    if (y < 64)     { y = 64;     vy =  Math.abs(vy); }
    if (y > H - 72) { y = H - 72; vy = -Math.abs(vy); }

    x += vx;
    y += vy;

    const angle = Math.atan2(vy, vx) * 180 / Math.PI;
    plane.style.left      = x + 'px';
    plane.style.top       = y + 'px';
    plane.style.transform = `rotate(${angle}deg)`;

    rafId = requestAnimationFrame(animPlane);
  }

  rafId = requestAnimationFrame(animPlane);
}
// ==================== STATE PERSISTENCE ====================
// State is saved to sessionStorage only when the user explicitly navigates to
// map.html or chess.html.  The wa_return flag is the guard: it is set on that
// click and consumed when index.html reloads.  A hard refresh (F5) never sets
// the flag, so the conversation always starts fresh on a true page reload.
//
// To avoid injecting raw HTML from sessionStorage (XSS risk), we serialise
// only primitive data: beat indices that have been rendered.  On restore we
// reconstruct each bubble from the original SCRIPT array and template
// functions — no external HTML ever enters innerHTML.

function saveState() {
  const renderedIdxs = [];
  for (let i = 0; i < qIdx; i++) {
    const t = SCRIPT[i].type;
    if (t === 'preload' || t === 'msg') renderedIdxs.push(i);
  }

  sessionStorage.setItem('wa_state', JSON.stringify({
    renderedIdxs,
    heartfeltShown,
    endStickersShown,
    qIdx,
    gateOpen,
    gateLabel:      gateOpen ? tapEl.textContent : null,
    challengeCount,
    challengeDone,
    postIntroShown,
  }));
  sessionStorage.setItem('wa_return', '1');
}

// Intercept clicks on outbound links so state is saved before navigating away
document.addEventListener('click', (e) => {
  const link = e.target.closest('a[href="map.html"], a[href="drawing.html"]');
  if (!link) return;
  saveState();
}, true); // capture phase so it fires before any stopPropagation

function restoreChallenge() {
  const btn        = document.getElementById('chat-challenge-btn');

  // Restore knitted cake parts (no pop animation for already-knitted ones)
  for (let i = 0; i < challengeCount; i++) {
    const candleEl = document.getElementById('candle-' + i);
    if (candleEl) {
      candleEl.textContent = CAKE_PARTS[i] || '🍰';
      candleEl.style.opacity = '1';
      candleEl.style.filter = 'none';
      candleEl.classList.add('lit');
    }
  }

  if (challengeDone) {
    if (btn) { btn.disabled = true; btn.textContent = '🎂'; }
  } else {
    initChallenge(); // re-attach click handler
  }
}

function buildHeartfeltWrap() {
  const wrap   = document.createElement('div');
  wrap.className = 'wa-msg received';
  const bubble = document.createElement('div');
  bubble.className = 'wa-bubble heartfelt-bubble';
  bubble.innerHTML = mkHeartfeltHTML(); // mkHeartfeltHTML is hardcoded, not user-supplied
  const ts = document.createElement('span');
  ts.className   = 'wa-time';
  ts.textContent = getTime();
  bubble.appendChild(ts);
  wrap.appendChild(bubble);
  return wrap;
}

function buildTextWrap(text) {
  const wrap   = document.createElement('div');
  wrap.className = 'wa-msg received';
  const bubble = document.createElement('div');
  bubble.className = 'wa-bubble';
  bubble.textContent = text;
  const ts = document.createElement('span');
  ts.className   = 'wa-time';
  ts.textContent = getTime();
  bubble.appendChild(ts);
  wrap.appendChild(bubble);
  return wrap;
}


function buildDrawingWrap() {
  const wrap   = document.createElement('div');
  wrap.className = 'wa-msg received';
  const bubble = document.createElement('div');
  bubble.className = 'wa-bubble chess-bubble';
  bubble.innerHTML = mkDrawingHTML(); // mkDrawingHTML is hardcoded, not user-supplied
  const ts = document.createElement('span');
  ts.className   = 'wa-time';
  ts.textContent = getTime();
  bubble.appendChild(ts);
  wrap.appendChild(bubble);
  return wrap;
}

function buildPostBubbleWrap() {
  const wrap   = document.createElement('div');
  wrap.className = 'wa-msg received';
  const bubble = document.createElement('div');
  bubble.className = 'wa-bubble post-bubble';
  bubble.innerHTML = mkPostBubbleHTML(); // mkPostBubbleHTML is hardcoded, not user-supplied
  const ts = document.createElement('span');
  ts.className   = 'wa-time';
  ts.textContent = getTime();
  bubble.appendChild(ts);
  wrap.appendChild(bubble);
  return wrap;
}

function loadState() {
  if (sessionStorage.getItem('wa_return') !== '1') return false;
  const raw = sessionStorage.getItem('wa_state');
  if (!raw) { sessionStorage.removeItem('wa_return'); return false; }
  sessionStorage.removeItem('wa_return');

  let s;
  try { s = JSON.parse(raw); } catch (e) { return false; }

  qIdx              = s.qIdx              || 0;
  challengeCount    = s.challengeCount    || 0;
  challengeDone     = s.challengeDone     || false;
  heartfeltShown    = s.heartfeltShown    || false;
  endStickersShown  = s.endStickersShown  || 0;
  postIntroShown    = s.postIntroShown    || false;

  // Re-render saved beats without pop-in animation
  chatEl.classList.add('restore-mode');

  for (const idx of (s.renderedIdxs || [])) {
    const beat = SCRIPT[idx];
    if (!beat) continue;
    const el = buildBubble(beat, beat.time || getTime());
    chatEl.insertBefore(el, typingEl);
    // initChallenge is handled separately via restoreChallenge below
  }

  if (heartfeltShown) {
    chatEl.insertBefore(buildHeartfeltWrap(), typingEl);
    // Restore messages that had appeared after the heartfelt
    if (endStickersShown >= 1) chatEl.insertBefore(buildTextWrap('Also... since you love drawing so much 🎨'), typingEl);
    if (endStickersShown >= 2) chatEl.insertBefore(buildTextWrap('I made you a little canvas to sketch on! ✨'), typingEl);
    if (endStickersShown >= 3) chatEl.insertBefore(buildDrawingWrap(), typingEl);
  }

  requestAnimationFrame(() => chatEl.classList.remove('restore-mode'));

  // Re-wire the challenge button if it's in the restored DOM
  if (document.getElementById('chat-challenge-btn')) {
    restoreChallenge();
  }

  // Restore header unlock icons
  if (endStickersShown >= 3) revealHeaderIcon('hdr-draw-icon');

  if (s.gateOpen && s.gateLabel) {
    setGate(s.gateLabel);
  } else {
    clearGate();
    if (qIdx < SCRIPT.length) setTimeout(advance, 350);
  }

  scrollBottom();

  // If the challenge is done but the heartfelt hasn't been revealed yet, the
  // user returned from map.html before finishing the post sequence — replay it.
  if (challengeDone && !heartfeltShown) {
    if (postIntroShown) {
      // The 3 intro messages were already shown before navigation; render them
      // instantly and pick up from "but wait theres more?" to avoid replaying
      // the plane animation from scratch.
      setTimeout(restorePostIntroAndContinue, 600);
    } else {
      setTimeout(revealPostSequence, 600);
    }
  }

  return true;
}

// ==================== CHALLENGE ====================
let challengeCount    = 0;
let challengeDone     = false;
let heartfeltShown    = false;
let endStickersShown  = 0;
let postIntroShown    = false; // true once the 3 intro messages before the plane have been appended

function initChallenge() {
  const btn = document.getElementById('chat-challenge-btn');
  if (!btn) return;
  btn.addEventListener('click', (e) => {
    if (challengeDone) return;
    challengeCount++;

    // Knit the next cake part
    const candleEl = document.getElementById('candle-' + (challengeCount - 1));
    if (candleEl) {
      candleEl.textContent = CAKE_PARTS[challengeCount - 1] || '🍰';
      candleEl.style.opacity = '1';
      candleEl.style.filter = 'none';
      candleEl.classList.add('lit', 'just-lit');
      setTimeout(() => candleEl.classList.remove('just-lit'), 500);
    }

    for (let i = 0; i < 10; i++) spawnInteractiveConfetti(e.clientX, e.clientY, 'explode');
    playPop();

    if (challengeCount >= CHALLENGE_CLICKS) {
      challengeDone = true;
      btn.disabled    = true;
      btn.textContent = '🎂';
      setTimeout(revealPostSequence, 900);
    }
  });
}

// Module-level helper: show typing indicator then append a plain text bubble.
function appendTypedBubble(text, typingMs, onDone) {
  showTyping();
  statusEl.textContent = 'typing...';
  setTimeout(() => {
    hideTyping();
    const wrap   = document.createElement('div');
    wrap.className = 'wa-msg received';
    const bubble = document.createElement('div');
    bubble.className = 'wa-bubble';
    bubble.textContent = text;
    const ts = document.createElement('span');
    ts.className   = 'wa-time';
    ts.textContent = getTime();
    bubble.appendChild(ts);
    wrap.appendChild(bubble);
    chatEl.insertBefore(wrap, typingEl);
    scrollBottom();
    playDing();
    if (onDone) onDone();
  }, typingMs);
}

// Step 2 of the post-challenge sequence ("but wait theres more?" onwards).
// Called both after the plane animation completes and on restore when the
// intro messages have already been pre-rendered.
function revealPostStep2() {
  setTimeout(() => {
    appendTypedBubble('but wait, there\'s more? 👀', 700, () => {
      setTimeout(() => {
        appendTypedBubble('open this bahan! 💌', 800, () => {
          setTimeout(() => {
            const postWrap = buildPostBubbleWrap();
            chatEl.insertBefore(postWrap, typingEl);
            scrollBottom();
            playDing();
            const bubble = postWrap.querySelector('.post-bubble');
            bubble.addEventListener('click', () => {
              if (bubble.dataset.opened) return;
              bubble.dataset.opened = '1';
              bubble.classList.add('post-opened');
              revealHeartfelt();
            });
          }, 400);
        });
      }, 600);
    });
  }, 800);
}

// On restore: render the 3 intro messages instantly (no typing delay) and
// jump straight to step 2 so the user isn't shown the plane animation again.
function restorePostIntroAndContinue() {
  function addStaticBubble(text) {
    const wrap   = document.createElement('div');
    wrap.className = 'wa-msg received';
    const bubble = document.createElement('div');
    bubble.className = 'wa-bubble';
    bubble.textContent = text;
    const ts = document.createElement('span');
    ts.className   = 'wa-time';
    ts.textContent = getTime();
    bubble.appendChild(ts);
    wrap.appendChild(bubble);
    chatEl.insertBefore(wrap, typingEl);
  }
  addStaticBubble('omg look out! 😱');
  addStaticBubble('here comes the plane ✈️');
  addStaticBubble('try and catch it bahan 😄');
  scrollBottom();
  revealPostStep2();
}

function revealPostSequence() {
  // Step 1: three intro messages, then launch the plane
  appendTypedBubble('omg look out! 😱', 1000, () => {
    setTimeout(() => {
      appendTypedBubble('here comes the plane ✈️', 800, () => {
        setTimeout(() => {
          appendTypedBubble('try and catch it bahan 😄', 600, () => {
            postIntroShown = true;
            launchFlyingPlane(revealPostStep2);
          });
        }, 400);
      });
    }, 400);
  });
}

function revealHeartfelt() {
  showTyping();
  statusEl.textContent = 'typing...';
  setTimeout(() => {
    hideTyping();
    heartfeltShown = true;
    chatEl.insertBefore(buildHeartfeltWrap(), typingEl);
    scrollBottom();
    launchConfettiBurst(80);
    playFanfare();
    // End messages appear shortly after the heartfelt message
    setTimeout(() => {
      endStickersShown = 1;
      chatEl.insertBefore(buildTextWrap('Also... since you love drawing so much 🎨'), typingEl);
      scrollBottom();
      playDing();
    }, 1600);
    setTimeout(() => {
      endStickersShown = 2;
      chatEl.insertBefore(buildTextWrap('I made you a little canvas to sketch on! ✨'), typingEl);
      scrollBottom();
      playDing();
    }, 3000);
    setTimeout(() => {
      endStickersShown = 3;
      chatEl.insertBefore(buildDrawingWrap(), typingEl);
      scrollBottom();
      playDing();
      revealHeaderIcon('hdr-draw-icon');
      // Dress-up warning message and game
      setTimeout(() => {
        appendTypedBubble('Since I have been your fashion expert its only right that I include a dress up game. 💅👗', 1200, () => {
          setTimeout(showDressUpGame, 1000);
        });
      }, DINO_DELAY_MS);
    }, 4500);
  }, 1800);
}

// ==================== LOADING SCREEN ====================
function runLoadingBar() {
  const bar      = document.getElementById('wa-load-progress');
  const isReturn = sessionStorage.getItem('wa_return') === '1';
  let pct = 0;
  const tick = isReturn ? 70 : 160;
  const iv = setInterval(() => {
    pct += isReturn ? (Math.random() * 45 + 30) : (Math.random() * 18 + 4);
    if (pct > 100) pct = 100;
    bar.style.width = pct + '%';
    if (pct >= 100) {
      clearInterval(iv);
      setTimeout(openChat, isReturn ? 180 : 500);
    }
  }, tick);
}

function openChat() {
  const loading = document.getElementById('wa-loading');
  const app     = document.getElementById('wa-app');

  loading.classList.add('fade-out');
  setTimeout(() => {
    loading.style.display = 'none';
    app.removeAttribute('aria-hidden');
    app.classList.add('visible');
    drizzleActive = true;

    // If returning from map/chess, restore saved state; otherwise start fresh
    if (!loadState()) {
      setTimeout(advance, 500);
    }
  }, 580);
}

// ==================== INIT ====================
document.addEventListener('DOMContentLoaded', () => {
  const isReturn = sessionStorage.getItem('wa_return') === '1';
  if (isReturn) {
    const hint = document.querySelector('.wa-load-hint');
    if (hint) hint.innerHTML = 'Reconnecting<span class="wa-load-dots"></span>';
  }
  clearGate();
  runLoadingBar();

  // ---- Dress-up header icon — click to show dress-up game ----
  const dressIcon = document.getElementById('hdr-dress-icon');
  if (dressIcon) {
    dressIcon.addEventListener('click', showDressUpGame);
  }

  // ---- Hamburger menu ----
  const menuBtn      = document.getElementById('wa-menu-btn');
  const menuDropdown = document.getElementById('wa-menu-dropdown');
  if (menuBtn && menuDropdown) {
    menuBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = !menuDropdown.hasAttribute('hidden');
      if (isOpen) {
        menuDropdown.setAttribute('hidden', '');
        menuBtn.setAttribute('aria-expanded', 'false');
      } else {
        menuDropdown.removeAttribute('hidden');
        menuBtn.setAttribute('aria-expanded', 'true');
      }
    });
    // Close on any outside click
    document.addEventListener('click', () => {
      if (!menuDropdown.hasAttribute('hidden')) {
        menuDropdown.setAttribute('hidden', '');
        menuBtn.setAttribute('aria-expanded', 'false');
      }
    });
  }
});

// When the browser restores this page from the bfcache (user pressed the
// Back button rather than clicking the in-page back link), scripts are NOT
// re-executed and loadState() is never called.  Force a proper reload so the
// normal restore path runs and revealPostSequence() fires if needed.
window.addEventListener('pageshow', (e) => {
  if (e.persisted && sessionStorage.getItem('wa_return') === '1') {
    window.location.reload();
  }
});

// ==================== DRESS-UP GAME ====================
let dressUpStarted = false;

function showDressUpGame() {
  if (dressUpStarted) return;
  dressUpStarted = true;

  const overlay = document.getElementById('dino-overlay');
  const canvas  = document.getElementById('dino-canvas');
  if (!overlay) return;
  if (canvas) canvas.style.display = 'none';

  overlay.removeAttribute('hidden');
  overlay.classList.add('active');

  const chatWin = document.getElementById('chat-window');
  if (chatWin) {
    chatWin.classList.add('dino-active');
    scrollBottom();
  }
  revealHeaderIcon('hdr-dress-icon');

  // Build dress-up UI inside the overlay
  overlay.innerHTML = `
    <div style="display:flex;flex-direction:column;align-items:center;height:100%;padding:0.5rem 1rem;gap:0.4rem;pointer-events:all;">
      <div style="font-size:0.8rem;color:#ec4899;font-weight:700;text-align:center;">👗 Dress Up Game — tap items to style!</div>
      <div style="display:flex;align-items:flex-end;justify-content:center;gap:0.5rem;flex:1;min-height:0;">
        <div id="dress-char" style="position:relative;font-size:3.5rem;line-height:1;text-align:center;filter:drop-shadow(0 2px 12px rgba(255,79,163,0.5));">
          <div id="dress-acc" style="position:absolute;top:-0.6em;left:50%;transform:translateX(-50%);font-size:1.2rem;min-height:1.4rem;"></div>
          <div>🧑‍🦰</div>
          <div id="dress-outfit" style="font-size:2rem;min-height:2.2rem;">👚</div>
          <div id="dress-shoes" style="font-size:1.2rem;min-height:1.4rem;">👟</div>
        </div>
      </div>
      <div id="dress-items" style="display:flex;flex-wrap:wrap;justify-content:center;gap:0.3rem;max-width:500px;">
        <button class="dress-btn" data-slot="outfit" data-item="👚" style="font-size:1.3rem;background:#1f2c34;border:1px solid #2a3942;border-radius:8px;padding:0.25rem 0.45rem;cursor:pointer;transition:all 0.15s;">👚</button>
        <button class="dress-btn" data-slot="outfit" data-item="👗" style="font-size:1.3rem;background:#1f2c34;border:1px solid #2a3942;border-radius:8px;padding:0.25rem 0.45rem;cursor:pointer;transition:all 0.15s;">👗</button>
        <button class="dress-btn" data-slot="outfit" data-item="🎽" style="font-size:1.3rem;background:#1f2c34;border:1px solid #2a3942;border-radius:8px;padding:0.25rem 0.45rem;cursor:pointer;transition:all 0.15s;">🎽</button>
        <button class="dress-btn" data-slot="outfit" data-item="👘" style="font-size:1.3rem;background:#1f2c34;border:1px solid #2a3942;border-radius:8px;padding:0.25rem 0.45rem;cursor:pointer;transition:all 0.15s;">👘</button>
        <button class="dress-btn" data-slot="outfit" data-item="💃" style="font-size:1.3rem;background:#1f2c34;border:1px solid #2a3942;border-radius:8px;padding:0.25rem 0.45rem;cursor:pointer;transition:all 0.15s;">💃</button>
        <button class="dress-btn" data-slot="acc" data-item="👑" style="font-size:1.3rem;background:#1f2c34;border:1px solid #2a3942;border-radius:8px;padding:0.25rem 0.45rem;cursor:pointer;transition:all 0.15s;">👑</button>
        <button class="dress-btn" data-slot="acc" data-item="🎀" style="font-size:1.3rem;background:#1f2c34;border:1px solid #2a3942;border-radius:8px;padding:0.25rem 0.45rem;cursor:pointer;transition:all 0.15s;">🎀</button>
        <button class="dress-btn" data-slot="acc" data-item="💍" style="font-size:1.3rem;background:#1f2c34;border:1px solid #2a3942;border-radius:8px;padding:0.25rem 0.45rem;cursor:pointer;transition:all 0.15s;">💍</button>
        <button class="dress-btn" data-slot="acc" data-item="🕶️" style="font-size:1.3rem;background:#1f2c34;border:1px solid #2a3942;border-radius:8px;padding:0.25rem 0.45rem;cursor:pointer;transition:all 0.15s;">🕶️</button>
        <button class="dress-btn" data-slot="acc" data-item="🌸" style="font-size:1.3rem;background:#1f2c34;border:1px solid #2a3942;border-radius:8px;padding:0.25rem 0.45rem;cursor:pointer;transition:all 0.15s;">🌸</button>
        <button class="dress-btn" data-slot="shoes" data-item="👠" style="font-size:1.3rem;background:#1f2c34;border:1px solid #2a3942;border-radius:8px;padding:0.25rem 0.45rem;cursor:pointer;transition:all 0.15s;">👠</button>
        <button class="dress-btn" data-slot="shoes" data-item="👟" style="font-size:1.3rem;background:#1f2c34;border:1px solid #2a3942;border-radius:8px;padding:0.25rem 0.45rem;cursor:pointer;transition:all 0.15s;">👟</button>
        <button class="dress-btn" data-slot="shoes" data-item="👢" style="font-size:1.3rem;background:#1f2c34;border:1px solid #2a3942;border-radius:8px;padding:0.25rem 0.45rem;cursor:pointer;transition:all 0.15s;">👢</button>
        <button class="dress-btn" data-slot="shoes" data-item="👡" style="font-size:1.3rem;background:#1f2c34;border:1px solid #2a3942;border-radius:8px;padding:0.25rem 0.45rem;cursor:pointer;transition:all 0.15s;">👡</button>
        <button id="dress-random" style="font-size:0.85rem;background:#ec4899;border:none;border-radius:8px;padding:0.25rem 0.65rem;cursor:pointer;color:#fff;font-weight:700;transition:all 0.15s;">✨ Random!</button>
      </div>
    </div>
  `;

  // Wire up item buttons
  overlay.querySelectorAll('.dress-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const slot = btn.dataset.slot;
      const item = btn.dataset.item;
      const el = document.getElementById('dress-' + slot);
      if (el) {
        el.textContent = item;
        el.style.animation = 'none';
        void el.offsetWidth;
        el.style.animation = 'msgPop 0.22s ease-out both';
      }
      // Highlight active in category
      overlay.querySelectorAll(`.dress-btn[data-slot="${slot}"]`).forEach(b => {
        b.style.borderColor = '#2a3942';
        b.style.background = '#1f2c34';
      });
      btn.style.borderColor = '#ec4899';
      btn.style.background = 'rgba(236,72,153,0.2)';
      playPop();
    });
  });

  // Random button
  const randomBtn = document.getElementById('dress-random');
  if (randomBtn) {
    randomBtn.addEventListener('click', () => {
      const slots = { outfit: [], acc: [], shoes: [] };
      overlay.querySelectorAll('.dress-btn').forEach(b => {
        if (slots[b.dataset.slot]) slots[b.dataset.slot].push(b);
      });
      Object.values(slots).forEach(arr => {
        if (arr.length) {
          const pick = arr[Math.floor(Math.random() * arr.length)];
          pick.click();
        }
      });
      for (let i = 0; i < 15; i++) {
        const rect = randomBtn.getBoundingClientRect();
        spawnInteractiveConfetti(rect.left + rect.width / 2, rect.top, 'explode');
      }
    });
  }
}
