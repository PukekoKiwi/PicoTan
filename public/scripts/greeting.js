/* ---------- 1. Greeting templates ---------- */
const greetings = [
  "ようこそ、{username}さん。今日も精進を。",
  "ようこそ、{username}さん。大禁忌は作輟なり。",
  "ようこそ、{username}さん。日進月歩。",
  "ようこそ、{username}さん。切磋琢磨。",
  "ようこそ、{username}さん。磨穿鉄硯。",
  "ようこそ、{username}さん。雨垂れ石を穿つ。",
  "ようこそ、{username}さん。石の上にも三年。",
  "ようこそ、{username}さん。千里の道も一歩から。",
  "ようこそ、{username}さん。最善を尽くしましょう。",
  "ようこそ、{username}さん。学問に王道なし。",
  "ようこそ、{username}さん。倦まず撓まず。",
  "ようこそ、{username}さん。目標に邁進。"
];

/* ---------- 2. Simple JWT decoder ---------- */
function parseJwt(token) {
  try {
    const [, base64Url] = token.split('.');
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const json = decodeURIComponent(atob(base64)
      .split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));
    return JSON.parse(json);
  } catch { return {}; }
}

/* ---------- 3. Helpers to pick “nearby” glyphs ---------- */
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/** Return a random char from the same Unicode block as cp */
function glitchCharFor(cp) {
  let start, end;

  if (0x3040 <= cp && cp <= 0x309F) {          // Hiragana
    start = 0x3040; end = 0x309F;
  } else if (0x30A0 <= cp && cp <= 0x30FF) {   // Katakana
    start = 0x30A0; end = 0x30FF;
  } else if (0x4E00 <= cp && cp <= 0x9FFF) {   // CJK Unified Ideographs
    start = 0x4E00; end = 0x9FFF;
  } else if (0xFF00 <= cp && cp <= 0xFFEF) {   // Full-width ASCII / Kana etc.
    start = 0xFF00; end = 0xFFEF;
  } else {                                     // Fallback: printable ASCII
    start = 0x21; end = 0x7E;
  }

  return String.fromCodePoint(randomInt(start, end));
}

/* ---------- 4. Glitch-then-type animation ---------- */
async function animateGlitch(el, finalText) {
  /* ------- configurable bits ---------- */
  const framesPerChar = 5;     // glitch frames per glyph
  const frameDelay    = 5;     // ms between those frames

  /* per-punctuation pause table (ms) */
  const pauseTable = {
    '、': 100,
    '，': 100,
    ',':  100,

    '。': 400,
    '．': 400,
    '.':  400,

    '？': 500,
    '?':  500,
    '！': 500,
    '!':  500,
  };
  /* ------------------------------------ */

  const sleep = ms => new Promise(r => setTimeout(r, ms));

  for (let i = 0; i < finalText.length; i++) {
    const cp = finalText.codePointAt(i);

    /* 1) glitch frames */
    for (let f = 0; f < framesPerChar; f++) {
      el.textContent = finalText.slice(0, i) + glitchCharFor(cp);
      await sleep(frameDelay);
    }

    /* 2) lock real glyph */
    el.textContent = finalText.slice(0, i + 1);

    /* 3) punctuation-specific pause */
    const pause = pauseTable[finalText[i]];
    if (pause) await sleep(pause);
  }
}

/* ---------- 5. Main ---------- */
document.addEventListener('DOMContentLoaded', async () => {
  const bubble = document.getElementById('greeting-message');
  if (!bubble) return;

  /* 5-1  Build final greeting */
  const token = localStorage.getItem('picotan_jwt');
  let final = '頑張って！';

  if (token) {
    const user = parseJwt(token).username || '';
    const name = user === 'Liam' ? '琉煌' : user;
    if (name) {
      const tpl = greetings[randomInt(0, greetings.length - 1)];
      final = tpl.replace('{username}', name);
    }
  }

  /* 5-2  Run animation, then fade */
  bubble.textContent = '';
  await animateGlitch(bubble, final);

  setTimeout(() => {
    bubble.style.transition = 'opacity .8s';
    bubble.style.opacity = 0;
  }, 2500);
});
