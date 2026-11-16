/**
 * FairFly Pro — Shared Application Controller
 */
document.addEventListener('DOMContentLoaded', () => {
  if (window.lucide) lucide.createIcons();

  // Animated Number Counters
  document.querySelectorAll('.counter').forEach((el) => {
    const target = parseInt(el.getAttribute('data-target'), 10);
    let current = 0;
    const step = Math.ceil(target / 45);
    const timer = setInterval(() => {
      current += step;
      if (current >= target) {
        el.innerText = target.toLocaleString();
        clearInterval(timer);
      } else {
        el.innerText = current.toLocaleString();
      }
    }, 28);
  });

  // Live UTC Clock
  const clockEl = document.getElementById('liveClock');
  if (clockEl) {
    setInterval(() => {
      const now = new Date();
      clockEl.innerText = 'UTC ' + now.toUTCString().split(' ')[4];
    }, 1000);
  }
});

/* 1. Web Audio API Synthesizer */
let soundEnabled = true;
const AudioCtx = window.AudioContext || window.webkitAudioContext;
let audioCtx = null;

window.playChime = function (freq = 580, type = 'sine', duration = 0.09) {
  if (!soundEnabled) return;
  try {
    if (!audioCtx) audioCtx = new AudioCtx();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(freq * 1.35, audioCtx.currentTime + duration);
    gain.gain.setValueAtTime(0.04, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + duration);
  } catch (e) {}
};

window.toggleSound = function () {
  soundEnabled = !soundEnabled;
  const icon = document.getElementById('soundIcon');
  if (icon) {
    icon.setAttribute('data-lucide', soundEnabled ? 'volume-2' : 'volume-x');
    if (window.lucide) lucide.createIcons();
  }
  if (soundEnabled) playChime(660);
};

/* 2. Ambient Sky Particle Canvas */
(function initSkyCanvas() {
  const canvas = document.getElementById('skyCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let particles = [];

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  for (let i = 0; i < 36; i++) {
    particles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 2.2 + 0.8,
      vy: -(Math.random() * 0.45 + 0.15),
      alpha: Math.random() * 0.45 + 0.15
    });
  }

  function animateSky() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach((p) => {
      p.y += p.vy;
      if (p.y < -10) {
        p.y = canvas.height + 10;
        p.x = Math.random() * canvas.width;
      }
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${p.alpha})`;
      ctx.fill();
    });
    requestAnimationFrame(animateSky);
  }
  animateSky();
})();

/* 3. Custom Magnetic Cursor Follower */
(function initCursor() {
  const dot = document.getElementById('cursorDot');
  const ring = document.getElementById('cursorRing');
  window.addEventListener('mousemove', (e) => {
    if (dot && ring) {
      dot.style.left = e.clientX + 'px';
      dot.style.top = e.clientY + 'px';
      ring.style.left = e.clientX + 'px';
      ring.style.top = e.clientY + 'px';
    }
  });
})();

/* 4. Home Search & Traveler Controls */
let adults = 2, children = 1, swapAngle = 0;

window.quickFillRoute = function (from, to) {
  playChime(650);
  document.getElementById('fromCity').value = from;
  document.getElementById('toCity').value = to;
};

window.swapCities = function () {
  playChime(620);
  const f = document.getElementById('fromCity');
  const t = document.getElementById('toCity');
  [f.value, t.value] = [t.value, f.value];
  swapAngle += 180;
  document.getElementById('swapBtn').style.transform = `translate(-50%, -50%) rotate(${swapAngle}deg)`;
};

window.toggleTravelerDropdown = function () {
  playChime(540);
  document.getElementById('travelerDropdown').classList.toggle('hidden');
};

window.updateCount = function (type, delta) {
  playChime(600);
  if (type === 'adults') {
    adults = Math.max(1, adults + delta);
    document.getElementById('adultsCount').innerText = adults;
  } else {
    children = Math.max(0, children + delta);
    document.getElementById('childrenCount').innerText = children;
  }
  const cTxt = children === 1 ? '1 Child' : `${children} Children`;
  const aTxt = adults === 1 ? '1 Adult' : `${adults} Adults`;
  document.getElementById('travelerSummary').innerText = children > 0 ? `${aTxt}, ${cTxt}` : aTxt;
};

window.executeSearch = function () {
  playChime(780);
  const searchData = {
    from: document.getElementById('fromCity').value || 'Jakarta',
    to: document.getElementById('toCity').value || 'Tokyo',
    date: document.getElementById('flightDate').value || '2026-12-04',
    travelers: document.getElementById('travelerSummary').innerText,
    cabin: document.getElementById('cabinClass').value,
    tripType: document.querySelector('input[name="tripType"]:checked').value
  };
  localStorage.setItem('fairfly_search', JSON.stringify(searchData));
  if (typeof window.navigateSmooth === 'function') {
    window.navigateSmooth(null, 'flights.html');
  } else {
    window.location.href = 'flights.html';
  }
};

/* 5. AI Travel Concierge Drawer */
window.toggleAiCopilot = function () {
  playChime(620);
  const drawer = document.getElementById('aiDrawer');
  if (drawer) drawer.classList.toggle('translate-x-full');
};

window.askAiPreset = function (q) {
  document.getElementById('aiChatInput').value = q;
  handleAiChat(new Event('submit'));
};

window.handleAiChat = function (e) {
  e.preventDefault();
  const input = document.getElementById('aiChatInput');
  const msg = input.value.trim();
  if (!msg) return;
  playChime(700);

  const box = document.getElementById('aiChatMessages');
  box.innerHTML += `<div class="ml-auto max-w-[80%] brand-gradient text-white rounded-2xl rounded-tr-none p-3.5 shadow-sm">${msg}</div>`;
  input.value = '';
  box.scrollTop = box.scrollHeight;

  setTimeout(() => {
    let reply = "I found 6 non-stop flights matching your request starting at <strong>$540</strong>! Want me to open the live flight board?";
    const lower = msg.toLowerCase();
    if (lower.includes('bali')) {
      reply = "🌴 <strong>Bali Fare Forecast:</strong> Fares from Jakarta start at <strong>$145</strong> on Garuda Indonesia. Prices are 18% lower than average this week!";
    } else if (lower.includes('cabin') || lower.includes('business')) {
      reply = "🥂 <strong>Business Class</strong> includes lie-flat seats, 40kg baggage, and VIP lounge access (use code <code>VIPLOUNGE</code> on the Deals page!).";
    } else if (lower.includes('tokyo')) {
      reply = "🗼 <strong>Jakarta → Tokyo:</strong> Non-stop on ANA Airways takes 7h 20m ($720) or Garuda Indonesia ($585).";
    }
    box.innerHTML += `
      <div class="bg-purple-50 border border-purple-100 rounded-2xl rounded-tl-none p-4 text-navy space-y-2.5">
        <div>${reply}</div>
        <a href="flights.html" onclick="navigateSmooth(event, 'flights.html')" class="inline-flex items-center gap-1.5 text-xs font-bold text-brandPurple hover:underline">
          View Live Flights →
        </a>
      </div>`;
    box.scrollTop = box.scrollHeight;
    playChime(820);
  }, 500);
};

/* 6. Ctrl+K Command Palette */
const commands = [
  { label: 'Go to Home & Jet Launchpad', tag: 'Page', action: () => navigateSmooth(null, 'index.html') },
  { label: 'Search Live Flights & Seat Map', tag: 'Page', action: () => navigateSmooth(null, 'flights.html') },
  { label: 'Explore Global Destinations & Radar', tag: 'Page', action: () => navigateSmooth(null, 'destinations.html') },
  { label: 'View Flash Deals & Promo Codes', tag: 'Page', action: () => navigateSmooth(null, 'deals.html') },
  { label: 'About FairFly Aero-OS', tag: 'Page', action: () => navigateSmooth(null, 'about.html') },
  { label: 'Contact Us & 24/7 Support', tag: 'Page', action: () => navigateSmooth(null, 'support.html') },
  { label: 'Open AI Flight Concierge', tag: 'AI Tool', action: () => { closeCommandPalette(); toggleAiCopilot(); } }
];

window.openCommandPalette = function () {
  playChime(600);
  const m = document.getElementById('cmdModal');
  m.classList.remove('hidden');
  m.classList.add('flex');
  renderCommands(commands);
  setTimeout(() => document.getElementById('cmdSearchInput').focus(), 50);
};

window.closeCommandPalette = function () {
  const m = document.getElementById('cmdModal');
  m.classList.add('hidden');
  m.classList.remove('flex');
};

window.filterCommands = function (q) {
  const filtered = commands.filter((c) => c.label.toLowerCase().includes(q.toLowerCase()));
  renderCommands(filtered);
};

function renderCommands(list) {
  const el = document.getElementById('cmdList');
  el.innerHTML = list.map((c) => `
    <button onclick="commands[${commands.indexOf(c)}].action()" class="w-full text-left px-3.5 py-3 hover:bg-purple-50 rounded-xl flex items-center justify-between transition cursor-pointer">
      <span class="font-semibold text-navy">${c.label}</span>
      <span class="text-[11px] font-mono bg-slate-100 text-slate-500 px-2 py-0.5 rounded">${c.tag}</span>
    </button>
  `).join('');
}

window.addEventListener('keydown', (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
    e.preventDefault();
    openCommandPalette();
  } else if (e.key === 'Escape') {
    closeCommandPalette();
    closeLoginModal();
  }
});

/* 7. Login Modal */
window.openLoginModal = function () {
  playChime(580);
  const modal = document.getElementById('loginModal');
  modal.classList.remove('hidden');
  modal.classList.add('flex');
};

window.closeLoginModal = function () {
  const modal = document.getElementById('loginModal');
  modal.classList.add('hidden');
  modal.classList.remove('flex');
};

window.handleLoginSubmit = function (e) {
  e.preventDefault();
  playChime(880);
  document.getElementById('loginSuccessMsg').classList.remove('hidden');
  setTimeout(() => {
    document.getElementById('loginSuccessMsg').classList.add('hidden');
    closeLoginModal();
  }, 1000);
};
