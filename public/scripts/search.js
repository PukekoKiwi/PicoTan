// search.js
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
  getSentenceEntriesThatContainTheWord
} from "./dbUtils.js";

// DOM references
const searchTypeSelect = document.getElementById("search-type");
const searchInput = document.getElementById("search-input");
const searchBtn = document.getElementById("search-btn");
const toggleAdvancedBtn = document.getElementById("toggle-advanced");
const simpleSearchContainer = document.getElementById("simple-search");
const advancedSearchContainer = document.getElementById("advanced-search");
const resultsContainer = document.getElementById("results-container");

// State
let inAdvancedMode = false;
let kankenRadicalsSet = null; // We'll store the loaded radicals here

document.addEventListener("DOMContentLoaded", async () => {
  // 1) Load the single-line radicals from /data/radicals.txt
  kankenRadicalsSet = await loadRadicalsSet("/data/radicals.txt");

  // 2) Set up event listeners
  toggleAdvancedBtn.addEventListener("click", handleToggleAdvanced);
  searchBtn.addEventListener("click", handleSearch);
  searchTypeSelect.addEventListener("change", () => {
    if (inAdvancedMode) {
      renderAdvancedSearchFields();
    }
  });
});

/**
 * Loads radicals from a single-line file, e.g. "乀乁一丨丶丿乙..."
 * We'll remove any accidental newlines and split by each char.
 */
async function loadRadicalsSet(url) {
  try {
    const response = await fetch(url);
    let text = await response.text();
    // Remove any accidental whitespace/newlines
    text = text.replace(/\s+/g, "");
    // Now split every character
    const chars = text.split(""); // each radical is 1 char
    return new Set(chars);
  } catch (error) {
    console.error("Error loading radicals.txt:", error);
    return new Set();
  }
}

/**
 * Toggles between simple and advanced search modes.
 */
function handleToggleAdvanced() {
  inAdvancedMode = !inAdvancedMode;
  // Hide/show containers
  simpleSearchContainer.classList.toggle("hidden", inAdvancedMode);
  advancedSearchContainer.classList.toggle("hidden", !inAdvancedMode);

  if (inAdvancedMode) {
    renderAdvancedSearchFields();
  } else {
    advancedSearchContainer.innerHTML = "";
  }
}

/**
 * Main search handler for both simple and advanced modes.
 */
async function handleSearch() {
  clearResults();

  if (!inAdvancedMode) {
    // SIMPLE SEARCH
    await handleSimpleSearch();
  } else {
    // ADVANCED SEARCH
    await handleAdvancedSearch();
  }
}

/**
 * Simple search logic based on the selected mode.
 */
async function handleSimpleSearch() {
  const mode = searchTypeSelect.value;
  const query = searchInput.value.trim();

  // 1) Check if user actually entered something
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
        // Default to getSentenceEntriesThatContainTheWord()
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

/**
 * Simple search logic for radicals:
 *  - If the entire input is only kana, convert to hiragana and search by names array.
 *  - Else, for each character in the input:
 *      (a) If it's a recognized radical in kankenRadicalsSet, fetch that doc directly.
 *      (b) Otherwise, assume it's a Kanji => get that Kanji doc => from doc.radical => fetch the radical doc.
 */
async function handleSimpleRadicalSearch(input) {
  // Trim just in case
  input = input.trim();
  const unionResults = [];

  // 1) If the entire input is only kana (hiragana or katakana)
  if (isKana(input)) {
    // Convert to hiragana
    const hiragana = toHiragana(input);

    // Search radical docs by name match
    // e.g. if user typed "さんずい" => we match "さんずい" in names
    // Use a case-insensitive, partial match:
    const radResults = await getRadicalEntriesThatMatch({
      names: { $regex: hiragana, $options: "i" }
    });

    unionResults.push(...radResults);
    return unionResults; // We can return right away, or keep going if you prefer a combined approach
  }

  // 2) Otherwise, fall back to existing character-by-character logic
  for (const char of input) {
    if (kankenRadicalsSet.has(char)) {
      // Directly fetch the doc for this radical
      const radResults = await getRadicalEntriesThatMatch({
        $or: [
          { character: char },
          { alternates: char },
          { names: { $regex: char, $options: "i" } }
        ]
      });
      unionResults.push(...radResults);

    } else {
      // Assume it's Kanji => get the Kanji doc => from that doc, get .radical => fetch that radical doc
      const kanjiMatches = await getKanjiEntriesThatMatch({ character: char });
      if (kanjiMatches.length > 0) {
        const radChar = kanjiMatches[0].radical;
        const radResults = await getRadicalEntriesThatMatch({
          $or: [
            { character: radChar },
            { alternates: radChar }
          ]
        });
        unionResults.push(...radResults);
      }
    }
  }

  return unionResults;
}

/**
 * Simple search logic for Kanji:
 * - If the string is entirely Kanji and length > 1, we fetch each character with getKanjiEntries().
 * - If it's a single Kanji, direct match { character: input }.
 * - If it's Kana, search both hiragana/katakana forms in On/Kun readings.
 * - Else fallback: broad search among character + On/Kun readings.
 */
async function handleSimpleKanjiSearch(input) {
  if (isKanji(input)) {
    // More than one Kanji => fetch them all by array
    if (input.length > 1) {
      const kanjiArray = input.split("");
      return await getKanjiEntries(kanjiArray);
    } else {
      // Single Kanji
      return await getKanjiEntriesThatMatch({ character: input });
    }
  } else if (isKana(input)) {
    // Convert input to both hiragana and katakana
    const [hiraganaInput, katakanaInput] = convertKanaBothWays(input);
    const filter = {
      $or: [
        { "readings.on.reading": { $regex: hiraganaInput, $options: "i" } },
        { "readings.on.reading": { $regex: katakanaInput, $options: "i" } },
        { "readings.kun.reading": { $regex: hiraganaInput, $options: "i" } },
        { "readings.kun.reading": { $regex: katakanaInput, $options: "i" } }
      ]
    };
    return await getKanjiEntriesThatMatch(filter);
  } else {
    // Fallback for mixed or unknown strings
    const [hiraganaInput, katakanaInput] = convertKanaBothWays(input);
    const filter = {
      $or: [
        { character: input },
        { "readings.on.reading": { $regex: hiraganaInput, $options: "i" } },
        { "readings.on.reading": { $regex: katakanaInput, $options: "i" } },
        { "readings.kun.reading": { $regex: hiraganaInput, $options: "i" } },
        { "readings.kun.reading": { $regex: katakanaInput, $options: "i" } }
      ]
    };
    return await getKanjiEntriesThatMatch(filter);
  }
}

/**
 * Conducts the advanced search based on the data type (radicals, kanji, words, etc.).
 * If all fields are empty, we prompt the user to enter something instead of returning everything.
 */
async function handleAdvancedSearch(mode = searchTypeSelect.value) {
  const formData = readAdvancedFormData();

  // If all fields are empty, prompt the user
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

  if (!results || results.length === 0) {
    displayMessage("該当する結果がありませんでした。");
  } else {
    displayResults(results);
  }
}

/**
 * Dynamically renders the advanced search fields based on the selected mode.
 */
function renderAdvancedSearchFields() {
  advancedSearchContainer.innerHTML = "";
  const mode = searchTypeSelect.value;

  const wrapper = document.createElement("div");

  switch (mode) {
    case "radicals":
      wrapper.appendChild(createField("character", "部首/漢字"));
      wrapper.appendChild(createField("alternates", "別形 (亻など)"));
      wrapper.appendChild(createField("names", "名称 (にんべんなど)"));
      wrapper.appendChild(createField("meaning", "意味（日本語/英語）"));
      wrapper.appendChild(createField("stroke_count", "画数"));
      break;

    case "kanji":
      wrapper.appendChild(createField("character", "漢字（１文字）"));
      wrapper.appendChild(createField("onyomi", "音読み"));
      wrapper.appendChild(createField("kunyomi", "訓読み"));
      wrapper.appendChild(createField("meaning", "意味"));
      wrapper.appendChild(createField("radical", "部首 (例: 氵 または 水)"));
      wrapper.appendChild(createField("stroke_count", "画数"));
      wrapper.appendChild(createField("kanken_level", "漢検級"));
      wrapper.appendChild(createField("categories", "カテゴリー"));
      break;

    case "words":
      wrapper.appendChild(createField("wordWildcard", "単語 (例: 感*)"));
      wrapper.appendChild(createField("readingWildcard", "読み (例: かん*)"));
      wrapper.appendChild(createField("kanken_level", "漢検級"));
      break;

    case "yojijukugo":
      wrapper.appendChild(createField("idiomWildcard", "ワイルドカード"));
      wrapper.appendChild(createField("kanken_level", "漢検級"));
      break;

    case "kotowaza":
      wrapper.appendChild(createField("proverbWildcard", "ワイルドカード"));
      wrapper.appendChild(createField("kanken_level", "漢検級"));
      break;

    case "sentences":
      wrapper.appendChild(createField("word", "含まれる単語"));
      wrapper.appendChild(createField("kanken_level", "漢検級"));
      break;
  }

  advancedSearchContainer.appendChild(wrapper);
}

/**
 * Helper function to create labeled text fields for advanced search.
 */
function createField(name, labelText) {
  const div = document.createElement("div");
  const label = document.createElement("label");
  label.textContent = labelText;
  label.htmlFor = name;

  const input = document.createElement("input");
  input.type = "text";
  input.id = name;
  input.name = name;

  div.appendChild(label);
  div.appendChild(input);
  return div;
}

/**
 * ADVANCED SEARCH HELPERS
 */
async function advancedRadicalSearch({ character, alternates, names, meaning, stroke_count }) {
  const filters = { $and: [] };

  // Convert each field to string to avoid $regex errors if numeric
  if (character) {
    filters.$and.push({
      $or: [
        { character },
        { alternates: character },
        { names: { $regex: stringToRegex(character), $options: "i" } }
      ]
    });
  }
  if (alternates) {
    filters.$and.push({ alternates: { $regex: stringToRegex(alternates), $options: "i" } });
  }
  if (names) {
    filters.$and.push({ names: { $regex: stringToRegex(names), $options: "i" } });
  }
  if (meaning) {
    filters.$and.push({
      $or: [
        { "meaning.japanese": { $regex: stringToRegex(meaning), $options: "i" } },
        { "meaning.english": { $regex: stringToRegex(meaning), $options: "i" } }
      ]
    });
  }
  if (stroke_count) {
    filters.$and.push({ stroke_count: parseInt(stroke_count, 10) });
  }

  if (filters.$and.length === 0) {
    return getRadicalEntriesThatMatch({});
  } else {
    return getRadicalEntriesThatMatch(filters);
  }
}

/**
 * We'll handle variant radicals in advanced Kanji search:
 * If user typed '水', and there's a radical doc with alternates '氵', we'll also match Kanji that have radical='氵'.
 */
async function advancedKanjiSearch({ character, onyomi, kunyomi, meaning, radical, stroke_count, kanken_level, categories }) {
  const filter = { $and: [] };

  if (character) {
    filter.$and.push({ character });
  }
  if (onyomi) {
    const [hiragana, katakana] = convertKanaBothWays(onyomi);
    filter.$and.push({
      $or: [
        { "readings.on.reading": { $regex: stringToRegex(hiragana), $options: "i" } },
        { "readings.on.reading": { $regex: stringToRegex(katakana), $options: "i" } }
      ]
    });
  }
  if (kunyomi) {
    const [hiragana, katakana] = convertKanaBothWays(kunyomi);
    filter.$and.push({
      $or: [
        { "readings.kun.reading": { $regex: stringToRegex(hiragana), $options: "i" } },
        { "readings.kun.reading": { $regex: stringToRegex(katakana), $options: "i" } }
      ]
    });
  }
  if (meaning) {
    filter.$and.push({
      $or: [
        { "meanings.japanese": { $regex: stringToRegex(meaning), $options: "i" } },
        { "meanings.english": { $regex: stringToRegex(meaning), $options: "i" } }
      ]
    });
  }

  // If 'radical' is typed, let's fetch that radical's doc to see if it has alternates
  if (radical) {
    // We attempt to find the radical doc(s) that match 'radical' or its alternates
    // Then we gather all possible forms in an array, so we do $in for 'radical' field in Kanji doc
    const possibleRadicals = new Set([radical]); // always include the user typed form

    // 1) Try to see if there's a radical doc for `radical`
    const radDocs = await getRadicalEntriesThatMatch({
      $or: [
        { character: radical },
        { alternates: radical }
      ]
    });
    // 2) If found, add its "character" and "alternates" to the set
    for (const rDoc of radDocs) {
      possibleRadicals.add(rDoc.character);
      if (Array.isArray(rDoc.alternates)) {
        rDoc.alternates.forEach((alt) => possibleRadicals.add(alt));
      }
    }

    // Now do { radical: { $in: [water variants] } }
    filter.$and.push({ radical: { $in: [...possibleRadicals] } });
  }

  if (stroke_count) {
    filter.$and.push({ stroke_count: parseInt(stroke_count, 10) });
  }
  if (kanken_level) {
    filter.$and.push({ kanken_level: parseInt(kanken_level, 10) });
  }
  if (categories) {
    filter.$and.push({ categories: { $regex: stringToRegex(categories), $options: "i" } });
  }

  if (filter.$and.length === 0) {
    return getKanjiEntriesThatMatch({});
  } else {
    return getKanjiEntriesThatMatch(filter);
  }
}

async function advancedWordsSearch({ wordWildcard, readingWildcard, kanken_level }) {
  // Build a filter with $and
  const filter = { $and: [] };

  // 1) Word wildcard
  if (wordWildcard) {
    const wordRegex = convertWildcardToRegex(wordWildcard); 
    // e.g. "*感*" => "^.*感.*$" => matches "感じる", "感謝", "共感", etc.
    filter.$and.push({
      word: { $regex: wordRegex, $options: "i" }
    });
  }

  // 2) Reading wildcard
  if (readingWildcard) {
    const readingRegex = convertWildcardToRegex(readingWildcard);
    // We search inside the array of readings: "readings.reading"
    // e.g. "*かん*" => "^.*かん.*$" => matches "かんじる", "かんしゃ", "きょうかん", etc.
    filter.$and.push({
      "readings.reading": { $regex: readingRegex, $options: "i" }
    });
  }

  // 3) Kanken level
  if (kanken_level) {
    const levelNum = parseInt(kanken_level, 10);
    if (!isNaN(levelNum)) {
      filter.$and.push({ kanken_level: levelNum });
    }
  }

  // If user didn’t fill in *any* fields, you can either:
  //  - return everything (pass an empty object)
  //  - or prompt them to enter something
  if (filter.$and.length === 0) {
    // Return *everything* or handle differently:
    // e.g. return getWordEntriesThatMatch({});
    return [];
  } else {
    return getWordEntriesThatMatch(filter);
  }
}


async function advancedYojijukugoSearch({ idiomWildcard, kanken_level }) {
  let results = [];
  if (idiomWildcard) {
    const regex = convertWildcardToRegex(idiomWildcard);
    results = await getYojijukugoEntriesThatMatch({
      idiom: { $regex: regex, $options: "i" }
    });
  } else {
    results = await getYojijukugoEntriesThatMatch({});
  }

  if (kanken_level) {
    const levelNum = parseInt(kanken_level, 10);
    if (!isNaN(levelNum)) {
      results = results.filter(r => r.kanken_level === levelNum);
    }
  }
  return results;
}

async function advancedKotowazaSearch({ proverbWildcard, kanken_level }) {
  let results = [];
  if (proverbWildcard) {
    const regex = convertWildcardToRegex(proverbWildcard);
    results = await getKotowazaEntriesThatMatch({
      proverb: { $regex: regex, $options: "i" }
    });
  } else {
    results = await getKotowazaEntriesThatMatch({});
  }

  if (kanken_level) {
    const levelNum = parseInt(kanken_level, 10);
    if (!isNaN(levelNum)) {
      results = results.filter(r => r.kanken_level === levelNum);
    }
  }
  return results;
}

async function advancedSentenceSearch({ word, kanken_level }) {
  // We do $regex for 'word' inside words_in_sentence
  // If user typed something numeric => might cause $regex error => fallback to string
  const filter = {};
  if (word) {
    filter.words_in_sentence = { $regex: stringToRegex(word), $options: "i" };
  }
  if (kanken_level) {
    const levelNum = parseFloat(kanken_level);
    if (!isNaN(levelNum)) {
      filter.kanken_level = levelNum;
    }
  }
  return getSentenceEntriesThatMatch(filter);
}

/**
 * Utility to convert wildcards * => .*, ? => .
 */
function convertWildcardToRegex(wildcard) {
  if (!wildcard) return "";
  // Escape special chars
  let pattern = wildcard.replace(/[.+^${}()|[\]\\]/g, "\\$&");
  // Convert wildcards
  pattern = pattern.replace(/\*/g, ".*");
  pattern = pattern.replace(/\?/g, ".");
  // Return string pattern suitable for `$regex`
  return `^${pattern}$`;
}

/**
 * Safely convert a user string to a usable regex pattern, or empty string if invalid.
 */
function stringToRegex(str) {
  if (!str || typeof str !== "string") return "";
  // We could also sanitize here if needed
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Reads the advanced form data dynamically generated, returning a plain object.
 */
function readAdvancedFormData() {
  const inputs = advancedSearchContainer.querySelectorAll("input");
  const data = {};
  inputs.forEach((input) => {
    data[input.name] = input.value.trim();
  });
  return data;
}

/**
 * Utility to convert a Kana string to both Hiragana and Katakana forms.
 * If user typed hiragana, we produce a katakana version, and vice versa.
 */
function convertKanaBothWays(kanaInput) {
  const hiragana = toHiragana(kanaInput);
  const katakana = toKatakana(kanaInput);
  return [hiragana, katakana];
}

/**
 * Conversion to Hiragana.
 */
function toHiragana(input) {
  return input
    .replace(/[\u30A0-\u30FF]/g, (ch) => {
      // Katakana => Hiragana
      return String.fromCharCode(ch.charCodeAt(0) - 0x60);
    });
}

/**
 * Conversion to Katakana.
 */
function toKatakana(input) {
  return input
    .replace(/[\u3040-\u309F]/g, (ch) => {
      // Hiragana => Katakana
      return String.fromCharCode(ch.charCodeAt(0) + 0x60);
    });
}

/**
 * Helper: check if a string is entirely Kanji [一-龯].
 */
function isKanji(str) {
  return /^[\u4E00-\u9FFF]+$/.test(str);
}

/**
 * Helper: check if a string is entirely composed of Hiragana [ぁ-ん] or Katakana [ァ-ン].
 */
function isKana(str) {
  return /^[\u3040-\u309F\u30A0-\u30FF]+$/.test(str);
}

/**
 * Clears the results area.
 */
function clearResults() {
  resultsContainer.innerHTML = "";
}

/**
 * Displays a list of results as JSON (for debugging).
 */
function displayResults(results) {
  const ul = document.createElement("ul");
  results.forEach((r) => {
    const li = document.createElement("li");
    li.textContent = JSON.stringify(r, null, 2);
    ul.appendChild(li);
  });
  resultsContainer.appendChild(ul);
}

/**
 * Displays a message to the user (e.g., errors, notices).
 */
function displayMessage(msg) {
  const p = document.createElement("p");
  p.textContent = msg;
  resultsContainer.appendChild(p);
}
