'use strict';

/* ═══════════════════════════════════════════════
   STILL WATERS — Script
   A healing space built for Black men.
   ═══════════════════════════════════════════════ */

// ── Affirmations — written specifically for Black men navigating trauma ────
const AFFIRMATIONS = [
  {
    text: "I am allowed to rest. My worth is not measured by my productivity or how much I endure.",
    author: "For the man who was taught to keep pushing",
    prompt: "What does your body feel like when you truly allow yourself to rest — not just sleep, but stop? When did you last feel that?"
  },
  {
    text: "The anger I carry is valid. It is a response to real things. I honor it without letting it consume me.",
    author: "For the man whose anger has nowhere to go",
    prompt: "What is underneath the anger? What would you say to the world if you knew someone would actually listen?"
  },
  {
    text: "I do not owe anyone a performance of strength. I am allowed to not be okay, and to say so.",
    author: "For the man told to be strong since childhood",
    prompt: "Who in your life actually sees you — not your strength, but you? What would it feel like to be fully seen?"
  },
  {
    text: "My mental health matters as much as anyone else's. Asking for help is not weakness. It is wisdom.",
    author: "Against the silence taught to us",
    prompt: "What stopped you — or stops you — from seeking help? What would you tell your son, your brother, your friend, if they came to you with the same struggle?"
  },
  {
    text: "I carry the resilience of everyone who survived so I could be here. I honor them by thriving — not just surviving.",
    author: "For the man who knows the weight of lineage",
    prompt: "Whose strength lives in you? Name them. How does their story show up in how you move through the world?"
  },
  {
    text: "I am more than what this world has reduced me to. My full humanity is not up for debate.",
    author: "Against every system that said otherwise",
    prompt: "In what spaces do you feel most fully yourself? What makes those spaces different from others?"
  },
  {
    text: "Grieving is not weakness. Something was taken from me — from all of us — and the grief is real and it deserves space.",
    author: "For the losses that were never acknowledged",
    prompt: "What are you grieving that the world doesn't seem to recognize? What would a proper mourning look like for that loss?"
  },
  {
    text: "I am building something — within myself. Not for anyone watching. For me. That is enough.",
    author: "For the man doing the invisible work",
    prompt: "What is the version of yourself you are working toward? What is one small thing you did this week toward that person?"
  },
  {
    text: "Joy is not frivolous. Black joy is resistance. I give myself permission to experience it fully.",
    author: "Reclaiming what is ours",
    prompt: "What brings you pure, uncomplicated joy? When did you last let yourself have it without guilt?"
  },
  {
    text: "My presence is powerful. I take up space with intention — and I belong in every room I enter.",
    author: "For the man who learned to make himself small",
    prompt: "Think of a time you shrunk yourself to make others comfortable. What would have happened if you hadn't?"
  },
];

const FOOTER_QUOTES = [
  "\"The most courageous act is still to think for yourself. Aloud.\" — Coco Chanel",
  "\"We are the ones we have been waiting for.\" — June Jordan",
  "\"Healing is not a destination. It is a practice of returning to yourself.\"",
  "\"I am not afraid of storms, for I am learning how to sail my ship.\" — Louisa May Alcott",
  "\"There is no greater agony than bearing an untold story inside you.\" — Maya Angelou",
  "\"The wound is the place where the light enters you.\" — Rumi",
  "\"You don't have to be perfect to deserve care. You just have to be human.\"",
  "\"Black men deserve tenderness. Full stop.\"",
];

// ── Breathing techniques ───────────────────────
const TECHNIQUES = {
  box:  { inhale: 4, hold1: 4, exhale: 4, hold2: 4,  label: "Box Breathing — balanced regulation" },
  "478":{ inhale: 4, hold1: 7, exhale: 8, hold2: 0,  label: "4-7-8 — activates the parasympathetic nervous system" },
  calm: { inhale: 4, hold1: 0, exhale: 6, hold2: 0,  label: "Calm Breath — gentle, extended exhale" },
};

// ── State ──────────────────────────────────────
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

// ── Ambient canvas ─────────────────────────────
(function initCanvas() {
  const canvas = document.getElementById('ambientCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  const NUM = 60;
  const particles = [];

  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  function mkParticle() {
    const h = 28 + Math.random() * 22;
    return {
      x:    Math.random() * canvas.width,
      y:    Math.random() * canvas.height,
      r:    0.5 + Math.random() * 2.4,
      vx:   (Math.random() - 0.5) * 0.15,
      vy:   (Math.random() - 0.5) * 0.15,
      a:    0.04 + Math.random() * 0.16,
      h,
    };
  }

  resize();
  window.addEventListener('resize', resize);
  for (let i = 0; i < NUM; i++) particles.push(mkParticle());

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Warm radial wash
    const g = ctx.createRadialGradient(
      canvas.width * 0.5, canvas.height * 0.35, 0,
      canvas.width * 0.5, canvas.height * 0.35, canvas.width * 0.6
    );
    g.addColorStop(0,   'rgba(201,146,42,0.05)');
    g.addColorStop(0.5, 'rgba(80,50,10,0.03)');
    g.addColorStop(1,   'rgba(0,0,0,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (const p of particles) {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${p.h}, 65%, 58%, ${p.a})`;
      ctx.fill();
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < -10) p.x = canvas.width + 10;
      if (p.x > canvas.width + 10) p.x = -10;
      if (p.y < -10) p.y = canvas.height + 10;
      if (p.y > canvas.height + 10) p.y = -10;
    }
    requestAnimationFrame(draw);
  }
  draw();
})();

// ── Navigation ─────────────────────────────────
document.querySelectorAll('.nav-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    const el = document.getElementById('view-' + btn.dataset.view);
    if (el) {
      el.classList.add('active');
      el.style.animation = 'none';
      requestAnimationFrame(() => { el.style.animation = ''; });
    }
  });
});

// ── SVG Ring helpers ───────────────────────────
function setRingProgress(ringEl, frac) {
  const r    = parseFloat(ringEl.getAttribute('r'));
  const circ = 2 * Math.PI * r;
  ringEl.style.strokeDasharray  = circ;
  ringEl.style.strokeDashoffset = circ * (1 - Math.max(0, Math.min(1, frac)));
}

function initRing(ringEl) {
  const r    = parseFloat(ringEl.getAttribute('r'));
  const circ = 2 * Math.PI * r;
  ringEl.style.strokeDasharray  = circ;
  ringEl.style.strokeDashoffset = circ;
}

initRing(document.getElementById('breathRingProgress'));
initRing(document.getElementById('timerRingProgress'));

// ── Breathing ─────────────────────────────────
const phaseNames = ['Inhale', 'Hold', 'Exhale', 'Hold'];
const phaseClss  = ['inhale', 'hold',  'exhale', 'hold'];
const phaseKeys  = ['inhale', 'hold1', 'exhale', 'hold2'];

function buildPhases(tech) {
  return phaseKeys
    .map((k, i) => ({ name: phaseNames[i], cls: phaseClss[i], dur: tech[k] * 1000 }))
    .filter(p => p.dur > 0);
}

function startBreath() {
  const tech   = TECHNIQUES[currentTechnique];
  const phases = buildPhases(tech);
  const wrap   = document.querySelector('.breath-ring-wrap');
  const phaseEl= document.getElementById('breathPhase');
  const countEl= document.getElementById('breathCount');
  const ring   = document.getElementById('breathRingProgress');
  const statEl = document.getElementById('breathStat');

  let phaseIdx      = 0;
  let phaseStart    = Date.now();
  breathRunning     = true;

  document.getElementById('btnBreath').textContent           = 'Pause';
  document.getElementById('btnBreathReset').style.display   = 'inline-flex';

  function tick() {
    if (!breathRunning) return;
    const phase   = phases[phaseIdx];
    const elapsed = Date.now() - phaseStart;
    const frac    = Math.min(elapsed / phase.dur, 1);
    const secLeft = Math.ceil((phase.dur - elapsed) / 1000);

    phaseEl.textContent = phase.name.toUpperCase();
    countEl.textContent = secLeft > 0 ? secLeft : '';

    if (phase.name === 'Inhale')       setRingProgress(ring, frac);
    else if (phase.name === 'Exhale')  setRingProgress(ring, 1 - frac);
    else setRingProgress(ring, phaseIdx < 2 ? 1 : 0); // hold after inhale = full, hold after exhale = empty

    wrap.classList.remove('inhale', 'hold', 'exhale');
    wrap.classList.add(phase.cls);

    if (frac >= 1) {
      phaseIdx = (phaseIdx + 1) % phases.length;
      if (phaseIdx === 0) {
        breathCycles++;
        statEl.textContent = `${breathCycles} cycle${breathCycles !== 1 ? 's' : ''} complete`;
      }
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
  document.getElementById('btnBreath').textContent          = 'Begin';
  document.getElementById('btnBreathReset').style.display   = 'none';
  document.getElementById('breathPhase').textContent        = 'Ready';
  document.getElementById('breathCount').textContent        = '—';
  document.getElementById('breathStat').textContent         = '';
  initRing(document.getElementById('breathRingProgress'));
  document.querySelector('.breath-ring-wrap').classList.remove('inhale','hold','exhale');
}

document.getElementById('btnBreath').addEventListener('click', () => {
  const lbl = document.getElementById('btnBreath').textContent;
  if (lbl === 'Begin')   { startBreath(); }
  else if (lbl === 'Pause')   { pauseBreath(); }
  else { breathRunning = true; startBreath(); } // Resume
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

// ── Timer ──────────────────────────────────────
const timerDigits = document.getElementById('timerDigits');
const timerLabel  = document.getElementById('timerLabel');
const timerRing   = document.getElementById('timerRingProgress');

function fmtTime(s) {
  return `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;
}

function updateTimerDisplay() {
  timerDigits.textContent = fmtTime(timerRemaining);
  setRingProgress(timerRing, timerRemaining / timerTotal);
}

function startTimer() {
  if (timerInterval) clearInterval(timerInterval);
  timerRunning = true;
  document.getElementById('btnTimer').textContent          = 'Pause';
  document.getElementById('btnTimerReset').style.display  = 'inline-flex';

  timerInterval = setInterval(() => {
    if (timerRemaining <= 0) {
      clearInterval(timerInterval);
      timerRunning = false;
      timerDigits.textContent = '00:00';
      timerLabel.textContent  = 'complete ◎';
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

function pauseTimer() {
  clearInterval(timerInterval);
  timerRunning = false;
  document.getElementById('btnTimer').textContent = 'Resume';
}

function resetTimer() {
  clearInterval(timerInterval);
  timerRunning   = false;
  timerRemaining = timerTotal;
  timerLabel.textContent = 'minutes';
  document.getElementById('btnTimer').textContent        = 'Start';
  document.getElementById('btnTimerReset').style.display = 'none';
  updateTimerDisplay();
}

document.getElementById('btnTimer').addEventListener('click', () => {
  const lbl = document.getElementById('btnTimer').textContent;
  if (lbl === 'Start' || lbl === 'Resume') startTimer();
  else pauseTimer();
});
document.getElementById('btnTimerReset').addEventListener('click', resetTimer);

document.querySelectorAll('.dur-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    if (timerRunning) pauseTimer();
    document.querySelectorAll('.dur-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    timerTotal     = parseInt(btn.dataset.minutes, 10) * 60;
    timerRemaining = timerTotal;
    document.getElementById('btnTimer').textContent        = 'Start';
    document.getElementById('btnTimerReset').style.display = 'none';
    timerLabel.textContent = 'minutes';
    updateTimerDisplay();
  });
});

updateTimerDisplay();

// ── Web Audio ──────────────────────────────────
let audioCtx    = null;
let ambientNode = null;

function getACtx() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  return audioCtx;
}

function playBowlTone() {
  try {
    const c = getACtx();
    const o = c.createOscillator();
    const g = c.createGain();
    o.type  = 'sine';
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
  try {
    if (ambientNode.type === 'interval') clearInterval(ambientNode.id);
    else ambientNode.stop();
  } catch (_) {}
  ambientNode = null;
}

function startAmbient(type) {
  stopAmbient();
  if (type === 'none') return;
  try {
    const c = getACtx();
    if (type === 'rain' || type === 'forest') {
      const len  = c.sampleRate * 2;
      const buf  = c.createBuffer(1, len, c.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (type === 'rain' ? 0.1 : 0.06);
      const src  = c.createBufferSource();
      src.buffer = buf;
      src.loop   = true;
      const flt  = c.createBiquadFilter();
      flt.type   = type === 'rain' ? 'lowpass' : 'bandpass';
      flt.frequency.value = type === 'rain' ? 700 : 1000;
      if (type === 'forest') flt.Q.value = 0.6;
      const g = c.createGain();
      g.gain.value = type === 'rain' ? 0.5 : 0.38;
      src.connect(flt); flt.connect(g); g.connect(c.destination);
      src.start();
      ambientNode = src;
    } else if (type === 'bowl') {
      const id = setInterval(() => {
        try {
          const c2 = getACtx();
          const o  = c2.createOscillator();
          const g  = c2.createGain();
          o.type   = 'sine';
          o.frequency.value = 432;
          g.gain.setValueAtTime(0.16, c2.currentTime);
          g.gain.exponentialRampToValueAtTime(0.001, c2.currentTime + 4.5);
          o.connect(g); g.connect(c2.destination);
          o.start(); o.stop(c2.currentTime + 4.7);
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

// ── Affirmations ───────────────────────────────
const affirmText   = document.getElementById('affirmationText');
const affirmAuthor = document.getElementById('affirmationAuthor');
const journalEl    = document.getElementById('journalPrompt');
const dotsWrap     = document.getElementById('affirmationDots');

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
  affirmText.style.opacity = '0';
  setTimeout(() => {
    affirmIndex            = ((idx % AFFIRMATIONS.length) + AFFIRMATIONS.length) % AFFIRMATIONS.length;
    const a                = AFFIRMATIONS[affirmIndex];
    affirmText.textContent   = a.text;
    affirmAuthor.textContent = a.author;
    journalEl.textContent    = a.prompt;
    buildDots();
    affirmText.style.opacity = '1';
    affirmTransitioning      = false;
  }, 260);
}

document.getElementById('btnNextAffirm').addEventListener('click', () => goToAffirm(affirmIndex + 1));
document.getElementById('btnPrevAffirm').addEventListener('click', () => goToAffirm(affirmIndex - 1));

// Swipe
let swipeX = 0;
const card = document.getElementById('affirmationCard');
card.addEventListener('touchstart', e => { swipeX = e.changedTouches[0].clientX; });
card.addEventListener('touchend',   e => {
  const dx = e.changedTouches[0].clientX - swipeX;
  if (Math.abs(dx) > 50) goToAffirm(affirmIndex + (dx < 0 ? 1 : -1));
});

goToAffirm(0);

// ── 5-4-3-2-1 Grounding ───────────────────────
const groundSteps = document.querySelectorAll('.ground-step');

function setGroundStep(idx) {
  groundStepIdx = Math.min(idx, groundSteps.length - 1);
  groundSteps.forEach((s, i) => s.classList.toggle('active', i === groundStepIdx));
  const btn = document.getElementById('btnNextGround');
  if (btn) btn.textContent = groundStepIdx >= groundSteps.length - 1 ? '↺ Restart' : 'Next sense →';
}

document.getElementById('btnNextGround').addEventListener('click', () => {
  if (groundStepIdx >= groundSteps.length - 1) setGroundStep(0);
  else setGroundStep(groundStepIdx + 1);
});

groundSteps.forEach((s, i) => s.addEventListener('click', () => setGroundStep(i)));

// ── Footer quote rotation ──────────────────────
(function() {
  const el = document.getElementById('footerQuote');
  let i = Math.floor(Math.random() * FOOTER_QUOTES.length);
  function show() {
    el.style.opacity = '0';
    setTimeout(() => {
      el.textContent = FOOTER_QUOTES[i];
      el.style.opacity = '1';
      i = (i + 1) % FOOTER_QUOTES.length;
    }, 600);
  }
  show();
  setInterval(show, 10000);
})();

// ══════════════════════════════════════════════════════
// MEDITATION MUSIC ENGINE (Web Audio API procedural)
// ══════════════════════════════════════════════════════
const MUSIC_TRACKS = [
  { name: 'Still River — 432Hz Drone',    root: 432,  style: 'drone'   },
  { name: 'Ancestors\' Rest — 528Hz',     root: 528,  style: 'drone'   },
  { name: 'Deep Ground — Earth Tone',     root: 174,  style: 'deep'    },
  { name: 'Morning Light — Soft Bells',   root: 528,  style: 'bells'   },
  { name: 'Safe Space — Ambient Pad',     root: 396,  style: 'pad'     },
];

let musicCtx        = null;
let musicNodes      = [];
let musicPlaying    = false;
let musicTrackIdx   = 0;
let musicVolume     = 0.4;
let musicMasterGain = null;

function getMusicCtx() {
  if (!musicCtx) {
    musicCtx = new (window.AudioContext || window.webkitAudioContext)();
    musicMasterGain = musicCtx.createGain();
    musicMasterGain.gain.value = musicVolume;
    musicMasterGain.connect(musicCtx.destination);
  }
  return musicCtx;
}

function stopMusic() {
  for (const n of musicNodes) {
    try { n.stop(); } catch (_) {}
  }
  musicNodes = [];
}

function playTrack(track) {
  stopMusic();
  const c   = getMusicCtx();
  const out = musicMasterGain;

  function makeOsc(freq, type, gain, detune = 0) {
    const o = c.createOscillator();
    const g = c.createGain();
    o.type  = type;
    o.frequency.value = freq;
    o.detune.value    = detune;
    g.gain.value      = gain;
    o.connect(g);
    g.connect(out);
    o.start();
    musicNodes.push(o);
    return { osc: o, gain: g };
  }

  function makeNoise(gainVal, lpFreq) {
    const len  = c.sampleRate * 4;
    const buf  = c.createBuffer(1, len, c.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * 0.04;
    const src  = c.createBufferSource();
    src.buffer = buf;
    src.loop   = true;
    const flt  = c.createBiquadFilter();
    flt.type   = 'lowpass';
    flt.frequency.value = lpFreq;
    const g    = c.createGain();
    g.gain.value = gainVal;
    src.connect(flt); flt.connect(g); g.connect(out);
    src.start();
    musicNodes.push(src);
  }

  const root = track.root;

  if (track.style === 'drone') {
    // Rich harmonic drone: root + octave + fifth + slight detuning for warmth
    makeOsc(root,        'sine',     0.28);
    makeOsc(root,        'sine',     0.12,  4);   // slight detune for chorus
    makeOsc(root * 2,    'sine',     0.14);
    makeOsc(root * 1.5,  'sine',     0.10);        // perfect fifth
    makeOsc(root * 3,    'sine',     0.05);
    makeNoise(0.015, 400);
  } else if (track.style === 'deep') {
    // Sub bass rumble — very calming
    makeOsc(root,        'sine',     0.35);
    makeOsc(root * 2,    'sine',     0.14);
    makeOsc(root * 1.33, 'sine',     0.08);
    makeNoise(0.012, 300);
  } else if (track.style === 'bells') {
    // Soft bell-like tones with reverb simulation via feedback
    makeOsc(root,        'sine',     0.18);
    makeOsc(root * 2,    'sine',     0.10);
    makeOsc(root * 4,    'sine',     0.06);
    makeOsc(root * 6,    'sine',     0.03);
    makeNoise(0.01, 600);
    // Slow gentle modulation
    const lfo = c.createOscillator();
    const lfoG = c.createGain();
    lfo.frequency.value = 0.08;
    lfoG.gain.value = 4;
    lfo.connect(lfoG);
    lfo.start();
    musicNodes.push(lfo);
  } else if (track.style === 'pad') {
    // Lush ambient pad
    makeOsc(root,        'sine',     0.22);
    makeOsc(root,        'triangle', 0.10,  7);
    makeOsc(root * 1.5,  'sine',     0.09);
    makeOsc(root * 2,    'sine',     0.07);
    makeOsc(root * 0.5,  'sine',     0.14);
    makeNoise(0.018, 500);
  }
}

function updateMusicUI() {
  const track = MUSIC_TRACKS[musicTrackIdx];
  document.getElementById('musicTitle').textContent = track.name;
  const btn = document.getElementById('musicPlay');
  if (musicPlaying) {
    btn.innerHTML = '&#9646;&#9646;'; // pause
    btn.classList.add('playing');
  } else {
    btn.innerHTML = '&#9654;';
    btn.classList.remove('playing');
  }
}

document.getElementById('musicPlay').addEventListener('click', () => {
  if (musicPlaying) {
    stopMusic();
    musicPlaying = false;
  } else {
    playTrack(MUSIC_TRACKS[musicTrackIdx]);
    musicPlaying = true;
  }
  updateMusicUI();
});

document.getElementById('musicNext').addEventListener('click', () => {
  musicTrackIdx = (musicTrackIdx + 1) % MUSIC_TRACKS.length;
  if (musicPlaying) playTrack(MUSIC_TRACKS[musicTrackIdx]);
  updateMusicUI();
});

document.getElementById('musicPrev').addEventListener('click', () => {
  musicTrackIdx = (musicTrackIdx - 1 + MUSIC_TRACKS.length) % MUSIC_TRACKS.length;
  if (musicPlaying) playTrack(MUSIC_TRACKS[musicTrackIdx]);
  updateMusicUI();
});

document.getElementById('musicVol').addEventListener('input', e => {
  musicVolume = parseFloat(e.target.value);
  if (musicMasterGain) musicMasterGain.gain.setTargetAtTime(musicVolume, getMusicCtx().currentTime, 0.05);
});

updateMusicUI();

// ══════════════════════════════════════════════════════
// AI COUNSELOR — Dr. Waters
// Powered by OpenAI GPT-4o
// ══════════════════════════════════════════════════════

// API key stored in localStorage — never in source code
function getOpenAIKey() { return localStorage.getItem('sw_openai_key') || ''; }
function setOpenAIKey(k) { localStorage.setItem('sw_openai_key', k); }

// Show/hide key setup UI
function refreshKeyUI() {
  const wrap = document.getElementById('apiKeyWrap');
  if (!wrap) return;
  wrap.classList.toggle('hidden', !!getOpenAIKey());
}
refreshKeyUI();

document.getElementById('apiKeySave').addEventListener('click', () => {
  const val = document.getElementById('apiKeyInput').value.trim();
  if (val.startsWith('sk-')) {
    setOpenAIKey(val);
    document.getElementById('apiKeyInput').value = '';
    refreshKeyUI();
  } else {
    document.getElementById('apiKeyInput').style.borderColor = 'rgba(255,80,80,0.5)';
    setTimeout(() => { document.getElementById('apiKeyInput').style.borderColor = ''; }, 1500);
  }
});

const SYSTEM_PROMPT = `You are Dr. Waters, a clinical psychologist with a PhD in Psychology, specializing in:
- Racial trauma and race-based stress (including everyday racism, vicarious trauma, and acute racial incidents)
- Intergenerational trauma in Black families and communities
- Black male psychology, identity, and mental health
- Culturally responsive therapy, specifically for Black men
- Somatic approaches to trauma healing
- The intersection of masculinity, Blackness, and emotional expression

Your approach:
- Warm, grounded, and deeply empathetic — you speak like someone who truly gets it
- You do not pathologize Blackness or Black responses to racism — you contextualize them
- You acknowledge systemic realities without being preachy or political in tone
- You meet men where they are — if they're guarded, you don't push; if they're open, you go deeper
- You use both clinical knowledge and cultural understanding
- You ask thoughtful, open questions that invite reflection
- You validate before advising
- You understand the unique pressures on Black men: the strong Black man trope, hypermasculinity pressures, code-switching exhaustion, the racial empathy gap in healthcare, and more
- You are familiar with key scholars and frameworks: Joy DeGruy's Post Traumatic Slave Syndrome, Resmaa Menakem's somatic work in "My Grandmother's Hands," Chester Pierce's concept of racial microaggressions, and contemporary Black mental health research

Language:
- Conversational and accessible — not clinical jargon unless explaining a concept
- Warm but boundaried — you're a therapist, not a friend
- Never preachy, never performative
- Keep responses focused and meaningful — 2-4 paragraphs max unless more depth is clearly needed

If someone is in crisis, always gently direct them to call or text 988.`;

const chatHistory = []; // tracks conversation for context

const chatWindow  = document.getElementById('chatWindow');
const chatInput   = document.getElementById('chatInput');
const chatSendBtn = document.getElementById('chatSendBtn');

function appendMessage(role, text) {
  const wrap   = document.createElement('div');
  wrap.className = `chat-message ${role}`;

  const sender = document.createElement('div');
  sender.className = 'chat-sender';
  sender.textContent = role === 'assistant' ? 'Dr. Waters' : 'You';

  const bubble = document.createElement('div');
  bubble.className = 'chat-bubble';
  // Render line breaks
  bubble.innerHTML = text.replace(/\n\n/g, '<br><br>').replace(/\n/g, '<br>');

  wrap.appendChild(sender);
  wrap.appendChild(bubble);
  chatWindow.appendChild(wrap);
  chatWindow.scrollTop = chatWindow.scrollHeight;
  return wrap;
}

function showTyping() {
  const wrap   = document.createElement('div');
  wrap.className = 'chat-message assistant chat-typing';
  const sender = document.createElement('div');
  sender.className = 'chat-sender';
  sender.textContent = 'Dr. Waters';
  const bubble = document.createElement('div');
  bubble.className = 'chat-bubble';
  bubble.innerHTML = '<span class="typing-dot"></span><span class="typing-dot"></span><span class="typing-dot"></span>';
  wrap.appendChild(sender);
  wrap.appendChild(bubble);
  chatWindow.appendChild(wrap);
  chatWindow.scrollTop = chatWindow.scrollHeight;
  return wrap;
}

async function sendMessage() {
  const text = chatInput.value.trim();
  if (!text) return;

  chatInput.value = '';
  chatInput.style.height = 'auto';
  chatSendBtn.disabled   = true;

  appendMessage('user', text);
  chatHistory.push({ role: 'user', content: text });

  const typingEl = showTyping();

  try {
    const key = getOpenAIKey();
    if (!key) {
      typingEl.remove();
      appendMessage('assistant', 'Please enter your OpenAI API key above to start talking with Dr. Waters.');
      chatSendBtn.disabled = false;
      refreshKeyUI();
      return;
    }

    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${key}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          ...chatHistory,
        ],
        max_tokens: 600,
        temperature: 0.8,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error?.message || 'API error');
    }

    const reply = data.choices[0].message.content.trim();
    chatHistory.push({ role: 'assistant', content: reply });

    typingEl.remove();
    appendMessage('assistant', reply);

  } catch (err) {
    typingEl.remove();
    appendMessage('assistant', `I'm having trouble connecting right now. If you're in a difficult moment, please reach out to the 988 Suicide & Crisis Lifeline by calling or texting 988. You deserve support.`);
    console.error('Dr. Waters API error:', err);
  }

  chatSendBtn.disabled = false;
  chatInput.focus();
}

chatSendBtn.addEventListener('click', sendMessage);

chatInput.addEventListener('keydown', e => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
});

// Auto-resize textarea
chatInput.addEventListener('input', () => {
  chatInput.style.height = 'auto';
  chatInput.style.height = Math.min(chatInput.scrollHeight, 120) + 'px';
});
