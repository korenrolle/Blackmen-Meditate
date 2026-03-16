'use strict';

/* ═══════════════════════════════════════════════
   STILL WATERS — Script
   ═══════════════════════════════════════════════ */

// ── Data ──────────────────────────────────────
const AFFIRMATIONS = [
  { text: "I am allowed to rest. My worth is not measured by my productivity or how much I endure.", author: "For the man who was taught to keep pushing", prompt: "What does your body feel like when you truly allow yourself to rest — not just sleep, but stop? When did you last feel that?" },
  { text: "The anger I carry is valid. It is a response to real things. I honor it without letting it consume me.", author: "For the man whose anger has nowhere to go", prompt: "What is underneath the anger? What would you say to the world if you knew someone would actually listen?" },
  { text: "I do not owe anyone a performance of strength. I am allowed to not be okay, and to say so.", author: "For the man told to be strong since childhood", prompt: "Who in your life actually sees you — not your strength, but you? What would it feel like to be fully seen?" },
  { text: "My mental health matters as much as anyone else's. Asking for help is not weakness. It is wisdom.", author: "Against the silence taught to us", prompt: "What stopped you — or stops you — from seeking help? What would you tell your son, your brother, your friend if they came to you with the same struggle?" },
  { text: "I carry the resilience of everyone who survived so I could be here. I honor them by thriving — not just surviving.", author: "For the man who knows the weight of lineage", prompt: "Whose strength lives in you? Name them. How does their story show up in how you move through the world?" },
  { text: "I am more than what this world has reduced me to. My full humanity is not up for debate.", author: "Against every system that said otherwise", prompt: "In what spaces do you feel most fully yourself? What makes those spaces different from others?" },
  { text: "Grieving is not weakness. Something was taken from me — from all of us — and the grief is real and it deserves space.", author: "For the losses that were never acknowledged", prompt: "What are you grieving that the world doesn't seem to recognize? What would a proper mourning look like for that loss?" },
  { text: "I am building something — within myself. Not for anyone watching. For me. That is enough.", author: "For the man doing the invisible work", prompt: "What is the version of yourself you are working toward? What is one small thing you did this week toward that person?" },
  { text: "Joy is not frivolous. Black joy is resistance. I give myself permission to experience it fully.", author: "Reclaiming what is ours", prompt: "What brings you pure, uncomplicated joy? When did you last let yourself have it without guilt?" },
  { text: "My presence is powerful. I take up space with intention — and I belong in every room I enter.", author: "For the man who learned to make himself small", prompt: "Think of a time you shrunk yourself to make others comfortable. What would have happened if you hadn't?" },
];

const FOOTER_QUOTES = [
  '"The most courageous act is still to think for yourself. Aloud." — Coco Chanel',
  '"We are the ones we have been waiting for." — June Jordan',
  '"Healing is not a destination. It is a practice of returning to yourself."',
  '"There is no greater agony than bearing an untold story inside you." — Maya Angelou',
  '"The wound is the place where the light enters you." — Rumi',
  '"Black men deserve tenderness. Full stop."',
  '"You don\'t have to be perfect to deserve care. You just have to be human."',
];

const TECHNIQUES = {
  box:   { inhale: 4, hold1: 4, exhale: 4, hold2: 4 },
  '478': { inhale: 4, hold1: 7, exhale: 8, hold2: 0 },
  calm:  { inhale: 4, hold1: 0, exhale: 6, hold2: 0 },
};

// ── State ─────────────────────────────────────
let currentTechnique    = 'box';
let breathRunning       = false;
let breathRAF           = null;
let breathCycles        = 0;
let timerRunning        = false;
let timerInterval       = null;
let timerTotal          = 5 * 60;
let timerRemaining      = 5 * 60;
let affirmIndex         = 0;
let affirmTransitioning = false;
let groundStepIdx       = 0;

// ── Ambient canvas ────────────────────────────
(function () {
  const canvas = document.getElementById('ambientCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const NUM = 60;
  const particles = [];

  function resize() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
  function mkP() {
    return { x: Math.random() * canvas.width, y: Math.random() * canvas.height,
             r: 0.5 + Math.random() * 2.4, vx: (Math.random() - 0.5) * 0.15,
             vy: (Math.random() - 0.5) * 0.15, a: 0.04 + Math.random() * 0.16,
             h: 28 + Math.random() * 22 };
  }

  resize();
  window.addEventListener('resize', resize);
  for (let i = 0; i < NUM; i++) particles.push(mkP());

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const g = ctx.createRadialGradient(canvas.width * 0.5, canvas.height * 0.35, 0, canvas.width * 0.5, canvas.height * 0.35, canvas.width * 0.6);
    g.addColorStop(0, 'rgba(201,146,42,0.05)');
    g.addColorStop(0.5, 'rgba(80,50,10,0.03)');
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    for (const p of particles) {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${p.h},65%,58%,${p.a})`;
      ctx.fill();
      p.x += p.vx; p.y += p.vy;
      if (p.x < -10) p.x = canvas.width + 10;
      if (p.x > canvas.width + 10) p.x = -10;
      if (p.y < -10) p.y = canvas.height + 10;
      if (p.y > canvas.height + 10) p.y = -10;
    }
    requestAnimationFrame(draw);
  }
  draw();
})();

// ── Navigation ────────────────────────────────
document.querySelectorAll('.nav-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    const el = document.getElementById('view-' + btn.dataset.view);
    if (el) { el.classList.add('active'); el.style.animation = 'none'; requestAnimationFrame(() => { el.style.animation = ''; }); }
  });
});

// ── Ring helpers ──────────────────────────────
function setRingProgress(el, frac) {
  const r = parseFloat(el.getAttribute('r'));
  const c = 2 * Math.PI * r;
  el.style.strokeDasharray  = c;
  el.style.strokeDashoffset = c * (1 - Math.max(0, Math.min(1, frac)));
}
function initRing(el) { const r = parseFloat(el.getAttribute('r')); const c = 2 * Math.PI * r; el.style.strokeDasharray = c; el.style.strokeDashoffset = c; }

initRing(document.getElementById('breathRingProgress'));
initRing(document.getElementById('timerRingProgress'));

// ── Breathing ─────────────────────────────────
const phaseNames = ['Inhale', 'Hold', 'Exhale', 'Hold'];
const phaseClss  = ['inhale', 'hold', 'exhale', 'hold'];
const phaseKeys  = ['inhale', 'hold1', 'exhale', 'hold2'];

function buildPhases(tech) {
  return phaseKeys.map((k, i) => ({ name: phaseNames[i], cls: phaseClss[i], dur: tech[k] * 1000 })).filter(p => p.dur > 0);
}

function startBreath() {
  const tech = TECHNIQUES[currentTechnique];
  const phases = buildPhases(tech);
  const wrap = document.querySelector('.breath-ring-wrap');
  const phaseEl = document.getElementById('breathPhase');
  const countEl = document.getElementById('breathCount');
  const ring = document.getElementById('breathRingProgress');
  const statEl = document.getElementById('breathStat');
  let phaseIdx = 0, phaseStart = Date.now();
  breathRunning = true;
  document.getElementById('btnBreath').textContent = 'Pause';
  document.getElementById('btnBreathReset').style.display = 'inline-flex';

  function tick() {
    if (!breathRunning) return;
    const phase = phases[phaseIdx];
    const elapsed = Date.now() - phaseStart;
    const frac = Math.min(elapsed / phase.dur, 1);
    const secLeft = Math.ceil((phase.dur - elapsed) / 1000);
    phaseEl.textContent = phase.name.toUpperCase();
    countEl.textContent = secLeft > 0 ? secLeft : '';
    if (phase.name === 'Inhale') setRingProgress(ring, frac);
    else if (phase.name === 'Exhale') setRingProgress(ring, 1 - frac);
    else setRingProgress(ring, phaseIdx < 2 ? 1 : 0);
    wrap.classList.remove('inhale', 'hold', 'exhale');
    wrap.classList.add(phase.cls);
    if (frac >= 1) {
      phaseIdx = (phaseIdx + 1) % phases.length;
      if (phaseIdx === 0) { breathCycles++; statEl.textContent = `${breathCycles} cycle${breathCycles !== 1 ? 's' : ''} complete`; }
      phaseStart = Date.now();
    }
    breathRAF = requestAnimationFrame(tick);
  }
  tick();
}

function pauseBreath() {
  breathRunning = false;
  cancelAnimationFrame(breathRAF);
  document.getElementById('btnBreath').textContent = 'Resume';
  document.getElementById('breathPhase').textContent = 'Paused';
}

function resetBreath() {
  breathRunning = false;
  cancelAnimationFrame(breathRAF);
  breathCycles = 0;
  document.getElementById('btnBreath').textContent = 'Begin';
  document.getElementById('btnBreathReset').style.display = 'none';
  document.getElementById('breathPhase').textContent = 'Ready';
  document.getElementById('breathCount').textContent = '—';
  document.getElementById('breathStat').textContent = '';
  initRing(document.getElementById('breathRingProgress'));
  document.querySelector('.breath-ring-wrap').classList.remove('inhale', 'hold', 'exhale');
}

document.getElementById('btnBreath').addEventListener('click', () => {
  const lbl = document.getElementById('btnBreath').textContent;
  if (lbl === 'Begin') startBreath();
  else if (lbl === 'Pause') pauseBreath();
  else { breathRunning = true; startBreath(); }
});
document.getElementById('btnBreathReset').addEventListener('click', resetBreath);
document.querySelectorAll('.technique-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    resetBreath();
    document.querySelectorAll('.technique-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentTechnique = btn.dataset.technique;
  });
});

// ── Timer ─────────────────────────────────────
function fmtTime(s) { return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`; }

function updateTimerDisplay() {
  document.getElementById('timerDigits').textContent = fmtTime(timerRemaining);
  setRingProgress(document.getElementById('timerRingProgress'), timerRemaining / timerTotal);
}

function startTimer() {
  if (timerInterval) clearInterval(timerInterval);
  timerRunning = true;
  document.getElementById('btnTimer').textContent = 'Pause';
  document.getElementById('btnTimerReset').style.display = 'inline-flex';
  timerInterval = setInterval(() => {
    if (timerRemaining <= 0) {
      clearInterval(timerInterval);
      timerRunning = false;
      document.getElementById('timerDigits').textContent = '00:00';
      document.getElementById('timerLabel').textContent = 'complete ◎';
      document.getElementById('btnTimer').textContent = 'Start';
      document.querySelector('.timer-display-wrap').classList.add('completion-flash');
      setTimeout(() => document.querySelector('.timer-display-wrap').classList.remove('completion-flash'), 1400);
      playBowlTone();
      return;
    }
    timerRemaining--;
    updateTimerDisplay();
  }, 1000);
}

function pauseTimer() { clearInterval(timerInterval); timerRunning = false; document.getElementById('btnTimer').textContent = 'Resume'; }

function resetTimer() {
  clearInterval(timerInterval);
  timerRunning = false;
  timerRemaining = timerTotal;
  document.getElementById('timerLabel').textContent = 'minutes';
  document.getElementById('btnTimer').textContent = 'Start';
  document.getElementById('btnTimerReset').style.display = 'none';
  updateTimerDisplay();
}

document.getElementById('btnTimer').addEventListener('click', () => {
  const lbl = document.getElementById('btnTimer').textContent;
  if (lbl === 'Start' || lbl === 'Resume') startTimer(); else pauseTimer();
});
document.getElementById('btnTimerReset').addEventListener('click', resetTimer);
document.querySelectorAll('.dur-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    if (timerRunning) pauseTimer();
    document.querySelectorAll('.dur-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    timerTotal = parseInt(btn.dataset.minutes, 10) * 60;
    timerRemaining = timerTotal;
    document.getElementById('btnTimer').textContent = 'Start';
    document.getElementById('btnTimerReset').style.display = 'none';
    document.getElementById('timerLabel').textContent = 'minutes';
    updateTimerDisplay();
  });
});
updateTimerDisplay();

// ── Web Audio (ambient sounds for timer) ──────
let audioCtx = null, ambientNode = null;

function getACtx() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  return audioCtx;
}

function playBowlTone() {
  try {
    const c = getACtx(), o = c.createOscillator(), g = c.createGain();
    o.type = 'sine';
    o.frequency.setValueAtTime(432, c.currentTime);
    o.frequency.exponentialRampToValueAtTime(216, c.currentTime + 3.5);
    g.gain.setValueAtTime(0.35, c.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 3.5);
    o.connect(g); g.connect(c.destination);
    o.start(); o.stop(c.currentTime + 3.7);
  } catch (_) {}
}

function stopAmbient() {
  if (!ambientNode) return;
  try { if (ambientNode.type === 'interval') clearInterval(ambientNode.id); else ambientNode.stop(); } catch (_) {}
  ambientNode = null;
}

function startAmbient(type) {
  stopAmbient();
  if (type === 'none') return;
  try {
    const c = getACtx();
    if (type === 'rain' || type === 'forest') {
      const len = c.sampleRate * 2, buf = c.createBuffer(1, len, c.sampleRate), data = buf.getChannelData(0);
      for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (type === 'rain' ? 0.1 : 0.06);
      const src = c.createBufferSource(); src.buffer = buf; src.loop = true;
      const flt = c.createBiquadFilter(); flt.type = type === 'rain' ? 'lowpass' : 'bandpass'; flt.frequency.value = type === 'rain' ? 700 : 1000;
      if (type === 'forest') flt.Q.value = 0.6;
      const g = c.createGain(); g.gain.value = type === 'rain' ? 0.5 : 0.38;
      src.connect(flt); flt.connect(g); g.connect(c.destination); src.start();
      ambientNode = src;
    } else if (type === 'bowl') {
      const id = setInterval(() => {
        try {
          const c2 = getACtx(), o = c2.createOscillator(), g = c2.createGain();
          o.type = 'sine'; o.frequency.value = 432;
          g.gain.setValueAtTime(0.16, c2.currentTime); g.gain.exponentialRampToValueAtTime(0.001, c2.currentTime + 4.5);
          o.connect(g); g.connect(c2.destination); o.start(); o.stop(c2.currentTime + 4.7);
        } catch (_) {}
      }, 7000);
      ambientNode = { type: 'interval', id };
    }
  } catch (_) {}
}

document.querySelectorAll('.sound-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.sound-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    startAmbient(btn.dataset.sound);
  });
});

// ── Affirmations ──────────────────────────────
const affirmTextEl  = document.getElementById('affirmationText');
const affirmAuthor  = document.getElementById('affirmationAuthor');
const journalEl     = document.getElementById('journalPrompt');
const dotsWrap      = document.getElementById('affirmationDots');

function buildDots() {
  dotsWrap.innerHTML = '';
  AFFIRMATIONS.forEach((_, i) => {
    const d = document.createElement('span');
    if (i === affirmIndex) d.classList.add('active');
    d.addEventListener('click', () => goToAffirm(i));
    dotsWrap.appendChild(d);
  });
}

function goToAffirm(idx) {
  if (affirmTransitioning) return;
  affirmTransitioning = true;
  affirmTextEl.style.opacity = '0';
  setTimeout(() => {
    affirmIndex = ((idx % AFFIRMATIONS.length) + AFFIRMATIONS.length) % AFFIRMATIONS.length;
    const a = AFFIRMATIONS[affirmIndex];
    affirmTextEl.textContent  = a.text;
    affirmAuthor.textContent  = a.author;
    journalEl.textContent     = a.prompt;
    buildDots();
    affirmTextEl.style.opacity = '1';
    affirmTransitioning = false;
  }, 260);
}

document.getElementById('btnNextAffirm').addEventListener('click', () => goToAffirm(affirmIndex + 1));
document.getElementById('btnPrevAffirm').addEventListener('click', () => goToAffirm(affirmIndex - 1));

let swipeX = 0;
const affCard = document.getElementById('affirmationCard');
affCard.addEventListener('touchstart', e => { swipeX = e.changedTouches[0].clientX; });
affCard.addEventListener('touchend',   e => { const dx = e.changedTouches[0].clientX - swipeX; if (Math.abs(dx) > 50) goToAffirm(affirmIndex + (dx < 0 ? 1 : -1)); });
goToAffirm(0);

// ── Grounding ─────────────────────────────────
const groundStepEls = document.querySelectorAll('.ground-step');

function setGroundStep(idx) {
  groundStepIdx = Math.min(idx, groundStepEls.length - 1);
  groundStepEls.forEach((s, i) => s.classList.toggle('active', i === groundStepIdx));
  const btn = document.getElementById('btnNextGround');
  if (btn) btn.textContent = groundStepIdx >= groundStepEls.length - 1 ? '↺ Restart' : 'Next sense →';
}

document.getElementById('btnNextGround').addEventListener('click', () => {
  if (groundStepIdx >= groundStepEls.length - 1) setGroundStep(0); else setGroundStep(groundStepIdx + 1);
});
groundStepEls.forEach((s, i) => s.addEventListener('click', () => setGroundStep(i)));

// ── Footer quotes ─────────────────────────────
(function () {
  const el = document.getElementById('footerQuote');
  let i = Math.floor(Math.random() * FOOTER_QUOTES.length);
  function show() {
    el.style.opacity = '0';
    setTimeout(() => { el.textContent = FOOTER_QUOTES[i]; el.style.opacity = '1'; i = (i + 1) % FOOTER_QUOTES.length; }, 600);
  }
  show();
  setInterval(show, 10000);
})();

// ══════════════════════════════════════════════
// SMOOTH JAZZ ENGINE
// Procedural jazz: walking bass, piano chords,
// saxophone melody, soft brush percussion.
// ══════════════════════════════════════════════

// Note frequency lookup (octave 4 = middle)
const _NF = { C:261.63, Db:277.18, D:293.66, Eb:311.13, E:329.63, F:349.23,
              Gb:369.99, G:392.00, Ab:415.30, A:440.00, Bb:466.16, B:493.88 };
function hz(note, oct = 4) { return _NF[note] * Math.pow(2, oct - 4); }

// 5 smooth jazz tracks — each has its own feel, key, BPM, and progression
const MUSIC_TRACKS = [
  {
    name: 'Midnight Blue · slow ballad',
    bpm: 66, key: 'F',
    // Walking bass notes per bar [note, octave] × 4 beats
    bass: [
      ['F',2],['A',2],['C',3],['Eb',3],  // Fmaj7
      ['D',2],['F',2],['A',2],['C',3],   // Dm7
      ['G',2],['Bb',2],['D',3],['F',3],  // Gm7
      ['C',2],['E',2],['G',2],['Bb',2],  // C7
    ],
    // Chord voicings [notes×octaves] per bar
    chords: [
      [['F',3],['A',3],['C',4],['E',4]],
      [['D',3],['F',3],['A',3],['C',4]],
      [['G',3],['Bb',3],['D',4],['F',4]],
      [['C',3],['E',3],['G',3],['Bb',3]],
    ],
    // Melody [note, oct, beat_offset, duration_beats]
    melody: [
      ['C',5, 0,   1.8], ['E',5, 2,   0.9], ['F',5, 3,   0.9],
      ['A',4, 4,   2.2], ['G',4, 6.5, 1.4],
      ['D',5, 8,   0.7], ['Bb',4,9,   2.8],
      ['G',4, 12,  1.5], ['E',4, 14,  2.0],
    ],
  },
  {
    name: 'Silk & Smoke · cool jazz',
    bpm: 88, key: 'Bb',
    bass: [
      ['Bb',2],['D',3],['F',3],['A',3],
      ['G',2], ['Bb',2],['D',3],['F',3],
      ['C',2], ['Eb',3],['G',3],['Bb',3],
      ['F',2], ['A',2], ['C',3],['Eb',3],
    ],
    chords: [
      [['Bb',3],['D',4],['F',4],['A',4]],
      [['G',3], ['Bb',3],['D',4],['F',4]],
      [['C',3], ['Eb',4],['G',4],['Bb',4]],
      [['F',3], ['A',3], ['C',4],['Eb',4]],
    ],
    melody: [
      ['F',5,  0,  0.8], ['Eb',5, 1,  1.5], ['D',5, 2.5, 0.8],
      ['C',5,  4,  2.0], ['Bb',4, 6,  1.8],
      ['G',4,  8,  0.6], ['A',4,  9,  0.6], ['Bb',4,10, 1.8],
      ['F',4,  12, 1.5], ['G',4,  14, 2.0],
    ],
  },
  {
    name: 'Still Waters · bossa groove',
    bpm: 80, key: 'A',
    bass: [
      ['A',2], ['C#',3],['E',3],['G#',3],
      ['F#',2],['A',2], ['C#',3],['E',3],
      ['B',2], ['D',3], ['F#',3],['A',3],
      ['E',2], ['G#',2],['B',2], ['D',3],
    ],
    chords: [
      [['A',3], ['C#',4],['E',4], ['G#',4]],
      [['F#',3],['A',3], ['C#',4],['E',4]],
      [['B',3], ['D',4], ['F#',4],['A',4]],
      [['E',3], ['G#',3],['B',3], ['D',4]],
    ],
    melody: [
      ['E',5,  0,  1.0], ['C#',5, 1.5, 1.5], ['A',4, 3,  1.0],
      ['F#',4, 4,  2.0], ['G#',4, 6,   2.0],
      ['B',4,  8,  0.8], ['A',4,  9,   2.2],
      ['C#',5, 12, 1.5], ['E',5,  14,  2.0],
    ],
  },
  {
    name: 'Velvet Evening · slow groove',
    bpm: 72, key: 'G',
    bass: [
      ['G',2], ['B',2], ['D',3],['F#',3],
      ['E',2], ['G',2], ['B',2],['D',3],
      ['A',2], ['C',3], ['E',3],['G',3],
      ['D',2], ['F#',2],['A',2],['C',3],
    ],
    chords: [
      [['G',3], ['B',3], ['D',4],['F#',4]],
      [['E',3], ['G',3], ['B',3],['D',4]],
      [['A',3], ['C',4], ['E',4],['G',4]],
      [['D',3], ['F#',3],['A',3],['C',4]],
    ],
    melody: [
      ['D',5,  0,  2.0], ['B',4,  2,  1.8],
      ['G',4,  4,  1.0], ['A',4,  5.5, 1.5], ['B',4, 7, 1.0],
      ['C',5,  8,  0.8], ['B',4,  9,  0.8], ['A',4, 10, 2.0],
      ['F#',4, 12, 1.5], ['G',4,  14, 2.5],
    ],
  },
  {
    name: 'Easy Sunday · laid back',
    bpm: 76, key: 'D',
    bass: [
      ['D',2], ['F#',2],['A',2],['C#',3],
      ['B',1], ['D',2], ['F#',2],['A',2],
      ['E',2], ['G',2], ['B',2], ['D',3],
      ['A',1], ['C#',2],['E',2], ['G',2],
    ],
    chords: [
      [['D',3], ['F#',3],['A',3],['C#',4]],
      [['B',3], ['D',4], ['F#',4],['A',4]],
      [['E',3], ['G',3], ['B',3], ['D',4]],
      [['A',3], ['C#',4],['E',4], ['G',4]],
    ],
    melody: [
      ['A',4,  0,  1.5], ['F#',4, 2,  2.0],
      ['D',4,  4,  1.0], ['E',4,  5,  0.8], ['F#',4,6,  2.0],
      ['G',4,  8,  0.6], ['A',4,  9,  0.9], ['B',4,10,  2.2],
      ['C#',5, 12, 1.8], ['A',4,  14, 2.5],
    ],
  },
];

// Add C# alias
_NF['C#'] = _NF['Db'];

let musicCtx = null, musicPlaying = false, musicTrackIdx = 0, musicVolume = 0.4;
let musicMasterGain = null, musicLoopTimeout = null, musicAllNodes = [];

function getMusicCtx() {
  if (!musicCtx) {
    musicCtx = new (window.AudioContext || window.webkitAudioContext)();
    musicMasterGain = musicCtx.createGain();
    musicMasterGain.gain.value = musicVolume;
    musicMasterGain.connect(musicCtx.destination);
  }
  return musicCtx;
}

// Schedule one note with attack/decay envelope
function schedNote(ctx, dest, freq, t, dur, vol, type = 'sine') {
  if (!freq || !isFinite(freq)) return null;
  const osc = ctx.createOscillator(), g = ctx.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  const att = Math.min(0.03, dur * 0.08);
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(vol, t + att);
  g.gain.setValueAtTime(vol * 0.75, t + dur * 0.65);
  g.gain.exponentialRampToValueAtTime(0.001, t + dur);
  osc.connect(g); g.connect(dest);
  osc.start(t); osc.stop(t + dur + 0.05);
  musicAllNodes.push(osc);
  return osc;
}

// Saxophone-like: sawtooth + lowpass + vibrato
function schedSax(ctx, dest, freq, t, dur, vol) {
  if (!freq || !isFinite(freq)) return;
  const osc = ctx.createOscillator();
  const filt = ctx.createBiquadFilter();
  const g = ctx.createGain();
  const lfo = ctx.createOscillator();
  const lfoG = ctx.createGain();

  osc.type = 'sawtooth';
  osc.frequency.value = freq;
  lfo.frequency.value = 5.2;
  lfoG.gain.value = 4;
  lfo.connect(lfoG); lfoG.connect(osc.frequency);

  filt.type = 'lowpass';
  filt.frequency.setValueAtTime(600, t);
  filt.frequency.exponentialRampToValueAtTime(2200, t + 0.08);
  filt.frequency.exponentialRampToValueAtTime(1400, t + dur * 0.5);
  filt.Q.value = 1.8;

  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(vol, t + 0.07);
  g.gain.setValueAtTime(vol * 0.8, t + dur * 0.6);
  g.gain.exponentialRampToValueAtTime(0.001, t + dur);

  osc.connect(filt); filt.connect(g); g.connect(dest);
  lfo.start(t + 0.12); lfo.stop(t + dur + 0.1);
  osc.start(t); osc.stop(t + dur + 0.1);
  musicAllNodes.push(osc, lfo);
}

// Brush hi-hat: short noise burst filtered high
function schedBrush(ctx, dest, t, vol = 0.028) {
  try {
    const len = Math.floor(ctx.sampleRate * 0.045);
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    const src = ctx.createBufferSource(); src.buffer = buf;
    const filt = ctx.createBiquadFilter(); filt.type = 'highpass'; filt.frequency.value = 6000;
    const g = ctx.createGain();
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.055);
    src.connect(filt); filt.connect(g); g.connect(dest);
    src.start(t);
    musicAllNodes.push(src);
  } catch (_) {}
}

// Soft kick drum: sine sweep low to very low
function schedKick(ctx, dest, t, vol = 0.10) {
  const osc = ctx.createOscillator(), g = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(110, t);
  osc.frequency.exponentialRampToValueAtTime(38, t + 0.22);
  g.gain.setValueAtTime(vol, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + 0.28);
  osc.connect(g); g.connect(dest);
  osc.start(t); osc.stop(t + 0.32);
  musicAllNodes.push(osc);
}

function stopMusic() {
  clearTimeout(musicLoopTimeout);
  musicLoopTimeout = null;
  for (const n of musicAllNodes) { try { n.stop(); } catch (_) {} }
  musicAllNodes = [];
}

function scheduleJazzPattern(track, startTime) {
  const ctx = getMusicCtx();
  const dest = musicMasterGain;
  const beat = 60 / track.bpm;          // seconds per beat
  const swing = beat * 0.06;            // slight swing offset on offbeats
  const totalBeats = 16;                // 4 bars × 4 beats
  const totalTime = totalBeats * beat;

  // ── Walking bass (one note per beat) ──
  for (let i = 0; i < track.bass.length; i++) {
    const [note, oct] = track.bass[i];
    const t = startTime + i * beat;
    const dur = beat * 0.88;
    schedNote(ctx, dest, hz(note, oct), t, dur, 0.30, 'sine');
  }

  // ── Piano chord pads (once per bar, held) ──
  for (let bar = 0; bar < 4; bar++) {
    const t = startTime + bar * 4 * beat;
    const voicing = track.chords[bar];
    // Play chord on beat 1 and beat 3 of each bar
    [0, 2].forEach(beatOff => {
      voicing.forEach(([note, oct]) => {
        schedNote(ctx, dest, hz(note, oct), t + beatOff * beat, beat * 1.6, 0.07, 'triangle');
      });
    });
    // Offbeat (beat 2 & 4) lighter stab
    [1, 3].forEach(beatOff => {
      voicing.forEach(([note, oct]) => {
        schedNote(ctx, dest, hz(note, oct), t + beatOff * beat + swing, beat * 0.55, 0.04, 'triangle');
      });
    });
  }

  // ── Saxophone melody ──
  for (const [note, oct, beatOff, durBeats] of track.melody) {
    const t = startTime + beatOff * beat;
    const dur = durBeats * beat * 0.92;
    schedSax(ctx, dest, hz(note, oct), t, dur, 0.13);
  }

  // ── Brush percussion ──
  for (let b = 0; b < totalBeats; b++) {
    const t = startTime + b * beat;
    // Kick on beats 1 and 3 of each bar
    if (b % 4 === 0)       schedKick(ctx, dest, t, 0.09);
    if (b % 4 === 2)       schedKick(ctx, dest, t, 0.06);
    // Brush on every beat
    schedBrush(ctx, dest, t, 0.025);
    // Extra brush on 8th-note offbeat (with swing)
    schedBrush(ctx, dest, t + beat * 0.5 + swing, 0.015);
  }

  return totalTime;
}

function startJazzLoop(track) {
  stopMusic();
  const ctx = getMusicCtx();
  const patternDur = scheduleJazzPattern(track, ctx.currentTime + 0.05);

  function loop() {
    if (!musicPlaying) return;
    const now = ctx.currentTime;
    scheduleJazzPattern(track, now + 0.1);
    musicLoopTimeout = setTimeout(loop, (patternDur - 0.2) * 1000);
  }

  musicLoopTimeout = setTimeout(loop, (patternDur - 0.2) * 1000);
}

function updateMusicUI() {
  document.getElementById('musicTitle').textContent = MUSIC_TRACKS[musicTrackIdx].name;
  const btn = document.getElementById('musicPlay');
  btn.innerHTML = musicPlaying ? '&#9646;&#9646;' : '&#9654;';
  btn.classList.toggle('playing', musicPlaying);
}

document.getElementById('musicPlay').addEventListener('click', () => {
  if (musicPlaying) { stopMusic(); musicPlaying = false; }
  else { musicPlaying = true; startJazzLoop(MUSIC_TRACKS[musicTrackIdx]); }
  updateMusicUI();
});

document.getElementById('musicNext').addEventListener('click', () => {
  musicTrackIdx = (musicTrackIdx + 1) % MUSIC_TRACKS.length;
  if (musicPlaying) { musicPlaying = true; startJazzLoop(MUSIC_TRACKS[musicTrackIdx]); }
  updateMusicUI();
});

document.getElementById('musicPrev').addEventListener('click', () => {
  musicTrackIdx = (musicTrackIdx - 1 + MUSIC_TRACKS.length) % MUSIC_TRACKS.length;
  if (musicPlaying) { musicPlaying = true; startJazzLoop(MUSIC_TRACKS[musicTrackIdx]); }
  updateMusicUI();
});

document.getElementById('musicVol').addEventListener('input', e => {
  musicVolume = parseFloat(e.target.value);
  if (musicMasterGain) musicMasterGain.gain.setTargetAtTime(musicVolume, getMusicCtx().currentTime, 0.05);
});

updateMusicUI();

// ══════════════════════════════════════════════
// AI COUNSELOR — Dr. Waters
// ══════════════════════════════════════════════

const SYSTEM_PROMPT = `You are Dr. Waters, a clinical psychologist with a PhD in Psychology specializing in:
- Racial trauma and race-based stress (everyday racism, vicarious trauma, acute racial incidents)
- Intergenerational trauma in Black families and communities
- Black male psychology, identity, and mental health
- Culturally responsive therapy specifically for Black men
- Somatic approaches to trauma healing
- The intersection of masculinity, Blackness, and emotional expression

Your approach:
- Warm, grounded, and deeply empathetic — you speak like someone who truly gets it
- You do not pathologize Blackness or Black responses to racism — you contextualize them
- You acknowledge systemic realities without being preachy or political in tone
- You meet men where they are — if they're guarded, you don't push; if they're open, you go deeper
- You validate before advising. You ask thoughtful questions that invite reflection
- You understand pressures specific to Black men: the strong Black man trope, code-switching exhaustion, hypermasculinity pressure, the racial empathy gap in healthcare
- You are familiar with Joy DeGruy's Post Traumatic Slave Syndrome, Resmaa Menakem's "My Grandmother's Hands", and Chester Pierce's work on racial microaggressions

Language:
- Conversational and accessible — not clinical jargon
- Warm but boundaried — you're a therapist, not a friend
- Never preachy, never performative
- 2-4 paragraphs max unless more depth is clearly needed

If someone appears to be in crisis, gently direct them to call or text 988.`;

// API Key management
function getKey() { return localStorage.getItem('sw_openai_key') || ''; }
function saveKey(k) { localStorage.setItem('sw_openai_key', k); }
function clearKey() { localStorage.removeItem('sw_openai_key'); }

function refreshKeyUI() {
  const has = !!getKey();
  const keySection    = document.getElementById('keySection');
  const keyConnected  = document.getElementById('keyConnected');
  if (keySection)   keySection.style.display   = has ? 'none' : 'flex';
  if (keyConnected) keyConnected.style.display  = has ? 'flex' : 'none';
}
refreshKeyUI();

document.getElementById('apiKeySave').addEventListener('click', () => {
  const input = document.getElementById('apiKeyInput');
  const val   = input.value.trim();
  if (val.startsWith('sk-')) {
    saveKey(val);
    input.value = '';
    input.classList.remove('error');
    document.getElementById('keyNote').textContent = 'Connected! Start chatting.';
    refreshKeyUI();
  } else {
    input.classList.add('error');
    document.getElementById('keyNote').textContent = 'Key must start with sk-';
    setTimeout(() => { input.classList.remove('error'); document.getElementById('keyNote').textContent = 'Stored in your browser only.'; }, 2000);
  }
});

document.getElementById('keyReset').addEventListener('click', () => {
  clearKey();
  refreshKeyUI();
});

// Chat
const chatHistory = [];
const chatWindow  = document.getElementById('chatWindow');
const chatInput   = document.getElementById('chatInput');
const chatSendBtn = document.getElementById('chatSendBtn');

function appendMsg(role, html) {
  const wrap   = document.createElement('div');
  wrap.className = `chat-message ${role}`;
  const bubble = document.createElement('div');
  bubble.className = 'chat-bubble';
  bubble.innerHTML = html;
  wrap.appendChild(bubble);
  chatWindow.appendChild(wrap);
  chatWindow.scrollTop = chatWindow.scrollHeight;
  return wrap;
}

function showTyping() {
  const wrap   = document.createElement('div');
  wrap.className = 'chat-message assistant chat-typing';
  const bubble = document.createElement('div');
  bubble.className = 'chat-bubble';
  bubble.innerHTML = '<span class="typing-dot"></span><span class="typing-dot"></span><span class="typing-dot"></span>';
  wrap.appendChild(bubble);
  chatWindow.appendChild(wrap);
  chatWindow.scrollTop = chatWindow.scrollHeight;
  return wrap;
}

function escapeHtml(str) {
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/\n\n/g,'<br><br>').replace(/\n/g,'<br>');
}

async function sendMessage() {
  const text = chatInput.value.trim();
  if (!text || chatSendBtn.disabled) return;

  const key = getKey();
  if (!key) {
    refreshKeyUI();
    // Scroll sidebar into view
    document.getElementById('keySection').scrollIntoView({ behavior: 'smooth' });
    appendMsg('assistant', 'Please enter your OpenAI API key in the sidebar to connect with Dr. Waters.');
    return;
  }

  chatInput.value = '';
  chatInput.style.height = 'auto';
  chatSendBtn.disabled = true;

  appendMsg('user', escapeHtml(text));
  chatHistory.push({ role: 'user', content: text });

  const typingEl = showTyping();

  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${key}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...chatHistory],
        max_tokens: 600,
        temperature: 0.8,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      const code    = data.error?.code || '';
      const errMsg  = data.error?.message || 'Unknown error';
      // Attach the code so the catch block can check it
      const err2    = new Error(errMsg);
      err2.apiCode  = code;
      throw err2;
    }

    const reply = data.choices[0].message.content.trim();
    chatHistory.push({ role: 'assistant', content: reply });
    typingEl.remove();
    appendMsg('assistant', escapeHtml(reply));

  } catch (err) {
    typingEl.remove();
    const msg  = (err.message || '').toLowerCase();
    const code = (err.apiCode || '').toLowerCase();
    console.error('Dr. Waters error:', err.message, '| code:', err.apiCode);

    if (msg.includes('incorrect api key') || code === 'invalid_api_key' || msg.includes('401')) {
      clearKey();
      refreshKeyUI();
      appendMsg('assistant', 'Your API key appears to be invalid or expired. Please enter a new one in the sidebar.');
    } else if (code === 'insufficient_quota' || msg.includes('insufficient_quota') || msg.includes('exceeded your current quota')) {
      appendMsg('assistant',
        'Your OpenAI account has no credits. You need to add a payment method and purchase credits at ' +
        '<a href="https://platform.openai.com/settings/organization/billing" target="_blank" style="color:var(--gold-light)">platform.openai.com/settings/organization/billing</a> — ' +
        'even $5 is enough to get started. Once you\'ve added credits, come right back.'
      );
    } else if (msg.includes('rate_limit') || (msg.includes('429') && !msg.includes('quota'))) {
      appendMsg('assistant', "Too many requests at once — give it 30 seconds and try again.");
    } else if (msg.includes('failed to fetch') || msg.includes('networkerror') || msg.includes('load')) {
      appendMsg('assistant', "Can't reach the server — check your internet connection and try again.");
    } else {
      appendMsg('assistant', `Something went wrong: <em>${err.message || 'unknown error'}</em>. If you're in a difficult moment, please call or text <strong>988</strong>.`);
    }
  }

  chatSendBtn.disabled = false;
  chatInput.focus();
}

chatSendBtn.addEventListener('click', sendMessage);
chatInput.addEventListener('keydown', e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } });
chatInput.addEventListener('input', () => { chatInput.style.height = 'auto'; chatInput.style.height = Math.min(chatInput.scrollHeight, 120) + 'px'; });
