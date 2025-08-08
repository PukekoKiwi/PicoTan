/**
 * glitchTextEffect.js
 * -------------------
 * Contains a single exported helper, `glitchText`, which animates a string so
 * that each character rapidly cycles through neighbouring Unicode glyphs before
 * settling on the final text.  Useful for giving headings or tooltips a retro
 * terminal vibe.
 */

// --- 1. tiny utility helpers -------------------------------------------------
const rnd   = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a;
const sleep = ms => new Promise(r => setTimeout(r, ms));

// --- 2. random glyph drawn from the same Unicode block -----------------------
function siblingGlyph(cp) {
  let s, e;
  if (cp >= 0x3000 && cp <= 0x303F) {        // CJK symbols & punctuation
    s = 0x3000;  e = 0x3029;                 //   (shifted end)
  } else if (cp >= 0x3040 && cp <= 0x309F) { // Hiragana
    s = 0x3040;  e = 0x309F;
  } else if (cp >= 0x30A0 && cp <= 0x30FF) { // Katakana
    s = 0x30A0;  e = 0x30FF;
  } else if (cp >= 0x4E00 && cp <= 0x9FFF) { // CJK Unified Ideographs
    s = 0x4E00;  e = 0x9FFF;
  } else if (cp >= 0xFF00 && cp <= 0xFFEF) { // Full-width ASCII / Kana
    s = 0xFF00;  e = 0xFFEF;
  } else {                                   // printable ASCII fallback
    s = 0x21;    e = 0x7E;
  }
  return String.fromCodePoint(rnd(s, e));
}

// --- 3. default punctuation-pause table -------------------------------------
const defaultPause = {
  '、': 100, '，': 100, ',': 100,
  '。': 400, '．': 400, '.': 400,
  '？': 500, '?': 500,
  '！': 500, '!': 500,
};

// --- 4. main exported helper -------------------------------------------------
/**
 * Glitch‑types a string, locking each real glyph after a few random "sibling"
 * frames, plus optional punctuation pauses.
 *
 * @param {(t:string)=>void} setter – how to write the text
 * @param {string} finalText        – target string
 * @param {number} [framesPerChar=4] – glitch frames per glyph
 * @param {number} [frameDelay=2]   – ms between glitch frames
 * @param {Object<string,number>} [pauseTable=defaultPause]
 */
export async function glitchText(
  setter,
  finalText,
  framesPerChar = 4,
  frameDelay = 2,
  pauseTable   = defaultPause
) {
  for (let i = 0; i < finalText.length; i++) {
    const cp = finalText.codePointAt(i);

    // 1-A: glitch frames
    for (let f = 0; f < framesPerChar; f++) {
      setter(finalText.slice(0, i) + siblingGlyph(cp));
      await sleep(frameDelay);
    }

    // 1-B: lock real glyph
    setter(finalText.slice(0, i + 1));

    // 1-C: optional punctuation pause
    if (pauseTable?.[finalText[i]]) {
      await sleep(pauseTable[finalText[i]]);
    }
  }
}
