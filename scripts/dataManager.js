let kanjiData = [];
let wordData = [];
let yojijukugoData = [];

// 1. Fetch data on page load
export async function loadAllData() {
  try {
    // Parallel fetching for each JSON file
    const [kanjiResponse, wordResponse, yjResponse] = await Promise.all([
      fetch('../data/kanji.json'),
      fetch('../data/words.json'),
      fetch('../data/yojijukugo.json')
    ]);

    kanjiData = await kanjiResponse.json();
    wordData = await wordResponse.json();
    yojijukugoData = await yjResponse.json();

    console.log('Data loaded:', { kanjiData, wordData, yojijukugoData });
  } catch (error) {
    console.error('Error loading JSON data:', error);
  }
}

// 2. Getters
export function getKanjiData() {
  return kanjiData;
}

export function getWordData() {
  return wordData;
}

export function getYojijukugoData() {
  return yojijukugoData;
}

// 3. Example search function for kanji
export function searchKanji(query) {
  // E.g., find kanji whose "character" property matches the query
  return kanjiData.filter(k => k.character.includes(query));
}

// 4. Example search for words
export function searchWords(query) {
  return wordData.filter(w => w.word.includes(query));
}

// 5. Example search for yojijukugo
export function searchYojijukugo(query) {
  return yojijukugoData.filter(y => y.idiom.includes(query));
}
