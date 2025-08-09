/**
 * search.js
 * ---------
 * Implements the search page. Users can perform a quick "simple" search or
 * switch to an "advanced" mode with multiple fields.
 *
 * + DATARAIL mode switcher (keyboard-first, neon underline).
 *   - Keeps #search-type in sync so existing logic remains unchanged.
 *   - Updates global --accent / --accent-color based on active mode.
 */

import {
  // from dbUtils.js
  getRadicalEntriesThatMatch,
  getKanjiEntriesThatMatch,
  getKanjiEntries,
  fuzzySearchWords,
  getWordEntriesThatMatch,
  fuzzySearchYojijukugo,
  getYojijukugoEntriesThatMatch,
  fuzzySearchKotowaza,
  getKotowazaEntriesThatMatch,
  getSentenceEntriesThatMatch,
  getSentenceEntriesThatContainTheWord,
} from "./helpers/dbUtils.js";

// ---------------------------------------------------------------------------
// DOM references
// ---------------------------------------------------------------------------
const $  = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

const searchTypeSelect        = $("#search-type");
const searchInput             = $("#search-input");
const searchBtn               = $("#search-btn");
const toggleAdvancedBtn       = $("#toggle-advanced");
const simpleSearchContainer   = $("#simple-search");
const advancedSearchContainer = $("#advanced-search");
const resultsContainer        = $("#results-container");

// DATARAIL elements
const modeSwitcher = $(".mode-switch");
const modeCursor   = modeSwitcher ? $(".mode-cursor", modeSwitcher) : null;
const modeRadios   = modeSwitcher ? $$('input[type="radio"][name="mode"]', modeSwitcher) : [];

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------
let inAdvancedMode    = false; // tracks whether advanced form is shown
let kankenRadicalsSet = null;  // cache of valid radicals for searches

// ---------------------------------------------------------------------------
// Boot
// ---------------------------------------------------------------------------
document.addEventListener("DOMContentLoaded", async () => {
  // Load radicals
  kankenRadicalsSet = await loadRadicalsSet("/data/radicals.txt");

  // Core listeners
  if (toggleAdvancedBtn) toggleAdvancedBtn.addEventListener("click", handleToggleAdvanced);
  if (searchBtn)         searchBtn.addEventListener("click", handleSearch);
  if (searchTypeSelect)  searchTypeSelect.addEventListener("change", () => {
    if (inAdvancedMode) renderAdvancedSearchFields();
  });

  if (toggleAdvancedBtn) toggleAdvancedBtn.type = "button";
  if (searchBtn)         searchBtn.type = "submit";

  const searchForm = document.getElementById("search-form");
  if (searchForm) {
    searchForm.addEventListener("submit", (e) => {
      e.preventDefault();
    });
  }

  // Init DATARAIL
  initModeRail();
});

// ===========================================================================
//  A. DATARAIL — keyboard-first mode selector (1–6, ←/→)
// ===========================================================================
function initModeRail() {
  if (!modeSwitcher || !modeCursor || modeRadios.length === 0 || !searchTypeSelect) return;

  const root = document.documentElement;
  const MODE_ORDER = ["radicals", "kanji", "words", "yojijukugo", "kotowaza", "sentences"];

  // Mapping to global palette vars from global.css
  const varMap = {
    radicals:   { triplet: "--radicals",   color: "--radicals-color" },
    kanji:      { triplet: "--kanji",      color: "--kanji-color" },
    words:      { triplet: "--words",      color: "--words-color" },
    yojijukugo: { triplet: "--yojijukugo", color: "--yojijukugo-color" },
    kotowaza:   { triplet: "--kotowaza",   color: "--kotowaza-color" },
    sentences:  { triplet: "--sentences",  color: "--sentences-color" },
  };

  const getVar = (name) => getComputedStyle(root).getPropertyValue(name).trim();

  let animateEnabled = false; // first paint w/o motion

  function moveCursorTo(label) {
    const rect  = modeSwitcher.getBoundingClientRect();
    const lrect = label.getBoundingClientRect();
    const left  = lrect.left   - rect.left;
    const top   = lrect.bottom - rect.top - 6;
    modeCursor.style.width = `${lrect.width}px`;
    requestAnimationFrame(() => {
      modeCursor.style.transform = `translate(${left}px, ${top}px)`;
    });
  }

  const syncAccent = (mode) => {
    const conf = varMap[mode];
    if (!conf) return;
    // For rgba(var(--accent), a) usages (triplet) and rgb() usages
    root.style.setProperty("--accent",       getVar(conf.triplet));
    root.style.setProperty("--accent-color", getVar(conf.color));
    modeSwitcher.dataset.active = mode; // for CSS tinting on the chips
  };

  const activate = (value, { dispatch = true, focus = false } = {}) => {
    const radio = modeRadios.find((r) => r.value === value);
    if (!radio) return;

    radio.checked = true;
    const label = $(`label[for="${radio.id}"]`, modeSwitcher);
    if (label) {
      moveCursorTo(label);
      if (focus) label.focus({ preventScroll: true });
    }

    // Sync hidden select for the rest of the app
    searchTypeSelect.value = value;
    if (dispatch) searchTypeSelect.dispatchEvent(new Event("change", { bubbles: true }));
    syncAccent(value);

    if (searchInput) searchInput.focus({ preventScroll: true });

    // After the first activation, enable transitions
    if (!animateEnabled) {
      requestAnimationFrame(() => {
        modeSwitcher.setAttribute("data-animate", "1");
        animateEnabled = true;
      });
    }
  };

  const idxFromValue     = (v) => MODE_ORDER.indexOf(v);
  const currentIndex     = ()  => idxFromValue(searchTypeSelect.value);
  const activateByIndex  = (i, opts) => {
    const clamped = Math.max(0, Math.min(MODE_ORDER.length - 1, i));
    activate(MODE_ORDER[clamped], opts);
  };

  // Click / change on chips
  modeRadios.forEach((r) => {
    r.addEventListener("change", () => activate(r.value));
    const label = $(`label[for="${r.id}"]`, modeSwitcher);
    if (label) label.addEventListener("click", () => activate(r.value));
  });

  // Hotkeys – ignored while typing in the query box
  const isTypingTarget = (el) =>
    el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.isContentEditable);

  document.addEventListener("keydown", (e) => {
    if (isTypingTarget(e.target) && e.target.id === "search-input") return;

    if (/^[1-6]$/.test(e.key)) {
      activateByIndex(parseInt(e.key, 10) - 1, { focus: true });
      e.preventDefault();
    } else if (e.key === "ArrowRight") {
      activateByIndex(currentIndex() + 1, { focus: true });
      e.preventDefault();
    } else if (e.key === "ArrowLeft") {
      activateByIndex(currentIndex() - 1, { focus: true });
      e.preventDefault();
    }
  });

  // Initial position and color
  requestAnimationFrame(() => {
    const initial = searchTypeSelect.value || "radicals";
    activate(initial, { dispatch: false });
    syncAccent(initial);
    const label = $(`label[for="mode-${initial}"]`, modeSwitcher);
    if (label) moveCursorTo(label);
  });

  // Reposition underline on resize
  window.addEventListener("resize", () => {
    const checked = $(".mode-switch input[name='mode']:checked");
    if (!checked) return;
    const label = $(`label[for='${checked.id}']`, modeSwitcher);
    if (label) moveCursorTo(label);
  });
}

// ===========================================================================
//  B. CORE SEARCH LOGIC
// ===========================================================================
/**
 * Fetch a plain text file that contains all radicals in one long string and
 * turn it into a `Set` for quick membership checks.
 */
async function loadRadicalsSet(url) {
  try {
    const response = await fetch(url);
    let text = await response.text();
    text = text.replace(/\s+/g, "");    // strip whitespace
    const chars = text.split("");       // each radical is 1 char
    return new Set(chars);
  } catch (error) {
    console.error("Error loading radicals.txt:", error);
    return new Set();
  }
}

/** Toggle advanced/simple mode */
function handleToggleAdvanced() {
  inAdvancedMode = !inAdvancedMode;
  simpleSearchContainer.classList.toggle("hidden", inAdvancedMode);
  advancedSearchContainer.classList.toggle("hidden", !inAdvancedMode);
  if (inAdvancedMode) renderAdvancedSearchFields();
  else advancedSearchContainer.innerHTML = "";
}

/** Entry point for searches */
async function handleSearch() {
  clearResults();
  if (!inAdvancedMode) await handleSimpleSearch();
  else await handleAdvancedSearch();
}

/** Simple search routing */
async function handleSimpleSearch() {
  const mode  = searchTypeSelect.value;
  const query = searchInput.value.trim();

  if (!query) {
    displayMessage("入力欄が空です。検索ワードを入力してください。");
    return;
  }

  let results = [];
  try {
    switch (mode) {
      case "radicals":
        results = await handleSimpleRadicalSearch(query);
        break;
      case "kanji":
        results = await handleSimpleKanjiSearch(query);
        break;
      case "words":
        results = await fuzzySearchWords(query);
        break;
      case "yojijukugo":
        results = await fuzzySearchYojijukugo(query);
        break;
      case "kotowaza":
        results = await fuzzySearchKotowaza(query);
        break;
      case "sentences":
        results = await getSentenceEntriesThatContainTheWord(query);
        break;
    }
  } catch (err) {
    displayMessage(`Search error: ${err.message}`);
    return;
  }

  if (!results || results.length === 0) {
    displayMessage(`該当する結果がありませんでした: 「${query}」`);
  } else {
    displayResults(results);
  }
}

/** Simple: radicals */
async function handleSimpleRadicalSearch(input) {
  input = input.trim();
  const unionResults = [];

  if (isKana(input)) {
    const hiragana   = toHiragana(input);
    const radResults = await getRadicalEntriesThatMatch({
      names: { $regex: hiragana, $options: "i" },
    });
    unionResults.push(...radResults);
    return unionResults;
  }

  for (const char of input) {
    if (kankenRadicalsSet.has(char)) {
      const radResults = await getRadicalEntriesThatMatch({
        $or: [
          { character: char },
          { alternates: char },
          { names: { $regex: char, $options: "i" } },
        ],
      });
      unionResults.push(...radResults);
    } else {
      const kanjiMatches = await getKanjiEntriesThatMatch({ character: char });
      if (kanjiMatches.length > 0) {
        const radChar = kanjiMatches[0].radical;
        const radResults = await getRadicalEntriesThatMatch({
          $or: [{ character: radChar }, { alternates: radChar }],
        });
        unionResults.push(...radResults);
      }
    }
  }
  return unionResults;
}

/** Simple: kanji */
async function handleSimpleKanjiSearch(input) {
  if (isKanji(input)) {
    if (input.length > 1) {
      const kanjiArray = input.split("");
      return await getKanjiEntries(kanjiArray);
    } else {
      return await getKanjiEntriesThatMatch({ character: input });
    }
  } else if (isKana(input)) {
    const [hiraganaInput, katakanaInput] = convertKanaBothWays(input);
    const filter = {
      $or: [
        { "readings.on.reading":  { $regex: hiraganaInput,  $options: "i" } },
        { "readings.on.reading":  { $regex: katakanaInput, $options: "i" } },
        { "readings.kun.reading": { $regex: hiraganaInput,  $options: "i" } },
        { "readings.kun.reading": { $regex: katakanaInput, $options: "i" } },
      ],
    };
    return await getKanjiEntriesThatMatch(filter);
  } else {
    const [hiraganaInput, katakanaInput] = convertKanaBothWays(input);
    const filter = {
      $or: [
        { character: input },
        { "readings.on.reading":  { $regex: hiraganaInput,  $options: "i" } },
        { "readings.on.reading":  { $regex: katakanaInput, $options: "i" } },
        { "readings.kun.reading": { $regex: hiraganaInput,  $options: "i" } },
        { "readings.kun.reading": { $regex: katakanaInput, $options: "i" } },
      ],
    };
    return await getKanjiEntriesThatMatch(filter);
  }
}

/** Advanced search orchestrator */
async function handleAdvancedSearch(mode = searchTypeSelect.value) {
  const formData = readAdvancedFormData();
  const allEmpty = Object.values(formData).every((val) => val === "");
  if (allEmpty) {
    displayMessage("検索条件を入力してください。");
    return;
  }

  let results = [];
  try {
    switch (mode) {
      case "radicals":
        results = await advancedRadicalSearch(formData);
        break;
      case "kanji":
        results = await advancedKanjiSearch(formData);
        break;
      case "words":
        results = await advancedWordsSearch(formData);
        break;
      case "yojijukugo":
        results = await advancedYojijukugoSearch(formData);
        break;
      case "kotowaza":
        results = await advancedKotowazaSearch(formData);
        break;
      case "sentences":
        results = await advancedSentenceSearch(formData);
        break;
    }
  } catch (error) {
    displayMessage(`Search error: ${error.message}`);
    return;
  }

  if (!results || results.length === 0) displayMessage("該当する結果がありませんでした。");
  else displayResults(results);
}

/** Build dynamic advanced form */
function renderAdvancedSearchFields() {
  advancedSearchContainer.innerHTML = "";
  const mode = searchTypeSelect.value;
  const wrapper = document.createElement("div");

  switch (mode) {
    case "radicals":
      wrapper.append(
        createField("character", "部首/漢字"),
        createField("alternates", "別形 (亻など)"),
        createField("names", "名称 (にんべんなど)"),
        createField("meaning", "意味（日本語/英語）"),
        createField("stroke_count", "画数"),
      );
      break;

    case "kanji":
      wrapper.append(
        createField("character", "漢字（１文字）"),
        createField("onyomi", "音読み"),
        createField("kunyomi", "訓読み"),
        createField("meaning", "意味"),
        createField("radical", "部首 (例: 氵 または 水)"),
        createField("stroke_count", "画数"),
        createField("kanken_level", "漢検級"),
        createField("categories", "カテゴリー"),
      );
      break;

    case "words":
      wrapper.append(
        createField("wordWildcard", "単語 (例: 感*)"),
        createField("readingWildcard", "読み (例: かん*)"),
        createField("kanken_level", "漢検級"),
      );
      break;

    case "yojijukugo":
      wrapper.append(
        createField("idiomWildcard", "ワイルドカード"),
        createField("kanken_level", "漢検級"),
      );
      break;

    case "kotowaza":
      wrapper.append(
        createField("proverbWildcard", "ワイルドカード"),
        createField("kanken_level", "漢検級"),
      );
      break;

    case "sentences":
      wrapper.append(
        createField("word", "含まれる単語"),
        createField("kanken_level", "漢検級"),
      );
      break;
  }

  advancedSearchContainer.appendChild(wrapper);
}

function createField(name, labelText) {
  const div   = document.createElement("div");
  const label = document.createElement("label");
  const input = document.createElement("input");
  label.textContent = labelText;
  label.htmlFor = name;
  input.type = "text";
  input.id   = name;
  input.name = name;
  div.append(label, input);
  return div;
}

// ========================= ADVANCED SEARCH HELPERS =========================
async function advancedRadicalSearch({ character, alternates, names, meaning, stroke_count }) {
  const filters = { $and: [] };
  if (character) {
    filters.$and.push({
      $or: [
        { character },
        { alternates: character },
        { names: { $regex: stringToRegex(character), $options: "i" } },
      ],
    });
  }
  if (alternates) filters.$and.push({ alternates: { $regex: stringToRegex(alternates), $options: "i" } });
  if (names)     filters.$and.push({ names:     { $regex: stringToRegex(names),     $options: "i" } });
  if (meaning) {
    filters.$and.push({
      $or: [
        { "meaning.japanese": { $regex: stringToRegex(meaning), $options: "i" } },
        { "meaning.english":  { $regex: stringToRegex(meaning), $options: "i" } },
      ],
    });
  }
  if (stroke_count) filters.$and.push({ stroke_count: parseInt(stroke_count, 10) });
  return filters.$and.length === 0 ? getRadicalEntriesThatMatch({}) : getRadicalEntriesThatMatch(filters);
}

/** Handle radical alternates when searching kanji */
async function advancedKanjiSearch({ character, onyomi, kunyomi, meaning, radical, stroke_count, kanken_level, categories }) {
  const filter = { $and: [] };

  if (character) filter.$and.push({ character });

  if (onyomi) {
    const [hiragana, katakana] = convertKanaBothWays(onyomi);
    filter.$and.push({
      $or: [
        { "readings.on.reading": { $regex: stringToRegex(hiragana),  $options: "i" } },
        { "readings.on.reading": { $regex: stringToRegex(katakana), $options: "i" } },
      ],
    });
  }
  if (kunyomi) {
    const [hiragana, katakana] = convertKanaBothWays(kunyomi);
    filter.$and.push({
      $or: [
        { "readings.kun.reading": { $regex: stringToRegex(hiragana),  $options: "i" } },
        { "readings.kun.reading": { $regex: stringToRegex(katakana), $options: "i" } },
      ],
    });
  }
  if (meaning) {
    filter.$and.push({
      $or: [
        { "meanings.japanese": { $regex: stringToRegex(meaning), $options: "i" } },
        { "meanings.english":  { $regex: stringToRegex(meaning), $options: "i" } },
      ],
    });
  }

  if (radical) {
    const possibleRadicals = new Set([radical]);
    const radDocs = await getRadicalEntriesThatMatch({ $or: [{ character: radical }, { alternates: radical }] });
    for (const rDoc of radDocs) {
      possibleRadicals.add(rDoc.character);
      if (Array.isArray(rDoc.alternates)) rDoc.alternates.forEach((alt) => possibleRadicals.add(alt));
    }
    filter.$and.push({ radical: { $in: [...possibleRadicals] } });
  }

  if (stroke_count) filter.$and.push({ stroke_count: parseInt(stroke_count, 10) });
  if (kanken_level) filter.$and.push({ kanken_level: parseInt(kanken_level, 10) });
  if (categories)   filter.$and.push({ categories: { $regex: stringToRegex(categories), $options: "i" } });

  return filter.$and.length === 0 ? getKanjiEntriesThatMatch({}) : getKanjiEntriesThatMatch(filter);
}

async function advancedWordsSearch({ wordWildcard, readingWildcard, kanken_level }) {
  const filter = { $and: [] };
  if (wordWildcard)    filter.$and.push({ word: { $regex: convertWildcardToRegex(wordWildcard),    $options: "i" } });
  if (readingWildcard) filter.$and.push({ "readings.reading": { $regex: convertWildcardToRegex(readingWildcard), $options: "i" } });
  if (kanken_level) {
    const levelNum = parseInt(kanken_level, 10);
    if (!isNaN(levelNum)) filter.$and.push({ kanken_level: levelNum });
  }
  return filter.$and.length === 0 ? [] : getWordEntriesThatMatch(filter);
}

async function advancedYojijukugoSearch({ idiomWildcard, kanken_level }) {
  let results = [];
  if (idiomWildcard) {
    const regex = convertWildcardToRegex(idiomWildcard);
    results = await getYojijukugoEntriesThatMatch({ idiom: { $regex: regex, $options: "i" } });
  } else {
    results = await getYojijukugoEntriesThatMatch({});
  }
  if (kanken_level) {
    const levelNum = parseInt(kanken_level, 10);
    if (!isNaN(levelNum)) results = results.filter((r) => r.kanken_level === levelNum);
  }
  return results;
}

async function advancedKotowazaSearch({ proverbWildcard, kanken_level }) {
  let results = [];
  if (proverbWildcard) {
    const regex = convertWildcardToRegex(proverbWildcard);
    results = await getKotowazaEntriesThatMatch({ proverb: { $regex: regex, $options: "i" } });
  } else {
    results = await getKotowazaEntriesThatMatch({});
  }
  if (kanken_level) {
    const levelNum = parseInt(kanken_level, 10);
    if (!isNaN(levelNum)) results = results.filter((r) => r.kanken_level === levelNum);
  }
  return results;
}

async function advancedSentenceSearch({ word, kanken_level }) {
  const filter = {};
  if (word)        filter.words_in_sentence = { $regex: stringToRegex(word), $options: "i" };
  if (kanken_level) {
    const levelNum = parseFloat(kanken_level);
    if (!isNaN(levelNum)) filter.kanken_level = levelNum;
  }
  return getSentenceEntriesThatMatch(filter);
}

// ================================ Utilities ================================
function convertWildcardToRegex(wildcard) {
  if (!wildcard) return "";
  // Escape special regex chars, then convert * and ? wildcards
  let pattern = wildcard.replace(/[.+^${}()|[\]\\]/g, "\\$&");
  pattern = pattern.replace(/\*/g, ".*");
  pattern = pattern.replace(/\?/g, ".");
  return `^${pattern}$`;
}

function stringToRegex(str) {
  if (!str || typeof str !== "string") return "";
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function readAdvancedFormData() {
  const inputs = $$("input", advancedSearchContainer);
  const data = {};
  inputs.forEach((input) => { data[input.name] = input.value.trim(); });
  return data;
}

function convertKanaBothWays(kanaInput) {
  const hiragana = toHiragana(kanaInput);
  const katakana = toKatakana(kanaInput);
  return [hiragana, katakana];
}

function toHiragana(input) {
  return input.replace(/[\u30A0-\u30FF]/g, (ch) => String.fromCharCode(ch.charCodeAt(0) - 0x60));
}
function toKatakana(input) {
  return input.replace(/[\u3040-\u309F]/g, (ch) => String.fromCharCode(ch.charCodeAt(0) + 0x60));
}

function isKanji(str) { return /^[\u4E00-\u9FFF]+$/.test(str); }
function isKana(str)  { return /^[\u3040-\u309F\u30A0-\u30FF]+$/.test(str); }

function clearResults() { resultsContainer.innerHTML = ""; }

function displayResults(results) {
  const ul = document.createElement("ul");
  results.forEach((r) => {
    const li = document.createElement("li");
    li.textContent = JSON.stringify(r, null, 2);
    ul.appendChild(li);
  });
  resultsContainer.appendChild(ul);
}

function displayMessage(msg) {
  const p = document.createElement("p");
  p.textContent = msg;
  resultsContainer.appendChild(p);
}
