// Core read operations

/**
 * A generic function that talks to `/api/readEntries`
 * with your desired operation and parameters.
 * @param {string} operation - e.g., "getEntriesByIds", "getEntriesByIndexes", etc.
 * @param {object} params - Additional parameters required by the operation
 * @returns {Promise<Array<object>>} - The fetched documents
 * @throws {Error} if the request fails.
 */
export async function readEntriesClient(operation, params = {}) {
  try {
    // `params` can include { collectionName, ids, indexValues, filters, searchText, path }
    const response = await fetch("/api/readEntries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ operation, ...params }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || response.statusText);
    }

    return await response.json();
  } catch (error) {
    console.error("Error in readEntriesClient:", error);
    throw error;
  }
}

export async function getAllEntries(collectionName) {
  return getEntriesBySearch(collectionName, {}); // Empty filter retrieves all entries
}

export async function getEntryById(collectionName, id) {
  try {
    const results = await getEntriesByIds(collectionName, [id]); // Wrap `id` in an array
    return results[0]; // Return the first (and only) result
  } catch (error) {
    console.error("Error in getEntryById:", error);
    throw error;
  }
}

export async function getEntryByIndex(collectionName, indexValue) {
  try {
    const results = await getEntriesByIndexes(collectionName, [indexValue]); // Wrap `indexValue` in an array
    return results[0]; // Return the first (and only) result
  } catch (error) {
    console.error("Error in getEntryByIndex:", error);
    throw error;
  }
}

export function getEntriesByIds(collectionName, ids) {
  return readEntriesClient("getEntriesByIds", { collectionName, ids });
}

export function getEntriesByIndexes(collectionName, indexValues) {
  return readEntriesClient("getEntriesByIndexes", { collectionName, indexValues });
}

export function getEntriesBySearch(collectionName, filters) {
  return readEntriesClient("getEntriesBySearch", { collectionName, filters });
}

export function getEntriesByFuzzySearch(collectionName, searchText, path = "*") {
  return readEntriesClient("getEntriesByFuzzySearch", { collectionName, searchText, path });
}

// Core write operations

/**
 * A generic function to handle "addEntry", "editEntry", or "deleteEntry"
 * via the single `/api/writeEntries` endpoint.
 * @param {object} params
 * @param {string} params.operation - "addEntry" | "editEntry" | "deleteEntry"
 * @param {string} params.collectionName
 * @param {object} [params.newEntry]
 * @param {string} [params.id]
 * @param {object} [params.updateData]
 * @param {string} jwtToken
 */
export async function writeEntriesClient(params, jwtToken) {
  try {
    const response = await fetch("/api/writeEntries", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${jwtToken}`,
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.details || response.statusText);
    }

    return await response.json();
  } catch (error) {
    console.error("Error in writeEntriesClient:", error);
    throw error;
  }
}


export async function addEntry(collectionName, newEntry, jwtToken) {
  return writeEntriesClient(
    {
      operation: "addEntry",
      collectionName,
      newEntry,
    },
    jwtToken
  );
}

export async function editEntry(collectionName, id, updateData, jwtToken) {
  return writeEntriesClient(
    {
      operation: "editEntry",
      collectionName,
      id,
      updateData,
    },
    jwtToken
  );
}

export async function deleteEntry(collectionName, id, jwtToken) {
  return writeEntriesClient(
    {
      operation: "deleteEntry",
      collectionName,
      id,
    },
    jwtToken
  );
}

// Big bunch of utility functions for specific data types

// KANJI
export async function getKanjiEntry(indexValue) {
  return getEntryByIndex("kanji", indexValue);
}

export async function getKanjiEntries(indexValues) {
  return getEntriesByIndexes("kanji", indexValues);
}

export async function getKanjiEntriesThatMatch(filters) {
  return getEntriesBySearch("kanji", filters);
}

export async function getKanjiEntriesByKankenLevel(level) {
  return getEntriesBySearch("kanji", { kanken_level: level });
}

export async function getKanjiEntriesThatHaveTheRadical(radical) {
  return getEntriesBySearch("kanji", { radical: radical });
}

export async function addKanji(kanjiObject, jwtToken) {
  return addEntry("kanji", kanjiObject, jwtToken);
}

export async function editKanji(kanjiObject, dataToUpdate, jwtToken) {
  const id = kanjiObject._id;
  return editEntry("kanji", id, dataToUpdate, jwtToken);
}

export async function deleteKanji(id, jwtToken) {
  return deleteEntry("kanji", id, jwtToken);
}

// RADICALS
export async function getRadicalEntry(indexValue) {
  return getEntryByIndex("radicals", indexValue);
}

export async function getRadicalEntries(indexValues) {
  return getEntriesByIndexes("radicals", indexValues);
}

export async function getRadicalEntriesThatMatch(filters) {
  return getEntriesBySearch("radicals", filters);
}

export async function addRadical(radicalObject, jwtToken) {
  return addEntry("radicals", radicalObject, jwtToken);
}

export async function editRadical(radicalObject, dataToUpdate, jwtToken) {
  const id = radicalObject._id;
  return editEntry("radicals", id, dataToUpdate, jwtToken);
}

export async function deleteRadical(radicalObject, jwtToken) {
  const id = radicalObject._id;
  return deleteEntry("radicals", id, jwtToken);
}

// WORDS
export async function getWordEntry(indexValue) {
  return getEntryByIndex("words", indexValue);
}

export async function getWordEntries(indexValues) {
  return getEntriesByIndexes("words", indexValues);
}

export async function getWordEntriesThatMatch(filters) {
  return getEntriesBySearch("words", filters);
}

export async function getWordEntriesThatContainTheKanji(kanji) {
  const filters = {
    word: { $regex: kanji, $options: "i" }, // Case-insensitive match for the kanji in the word field
  };
  return getEntriesBySearch("words", filters);
}

export async function getWordEntriesByKankenLevel(level) {
  return getEntriesBySearch("words", { kanken_level: level });
}

export async function fuzzySearchWords(searchText, path = "*") {
  return getEntriesByFuzzySearch("words", searchText, path);
}

export async function addWord(wordObject, jwtToken) {
  return addEntry("words", wordObject, jwtToken);
}

export async function editWord(wordObject, dataToUpdate, jwtToken) {
  const id = wordObject._id;
  return editEntry("words", id, dataToUpdate, jwtToken);
}

export async function deleteWord(wordObject, jwtToken) {
  const id = wordObject._id;
  return deleteEntry("words", id, jwtToken);
}

// YOJIJUKUGO
export async function getYojijukugoEntry(indexValue) {
  return getEntryByIndex("yojijukugo", indexValue);
}

export async function getYojijukugoEntries(indexValues) {
  return getEntriesByIndexes("yojijukugo", indexValues);
}

export async function getYojijukugoEntriesThatMatch(filters) {
  return getEntriesBySearch("yojijukugo", filters);
}

export async function getYojijukugoEntriesThatContainTheKanji(kanji) {
  const filters = {
    idiom: { $regex: kanji, $options: "i" }, // Case-insensitive match for the kanji in the idiom field
  };
  return getEntriesBySearch("yojijukugo", filters);
}

export async function getYojijukugoEntriesByKankenLevel(level) {
  return getEntriesBySearch("yojijukugo", { kanken_level: level });
}

export async function fuzzySearchYojijukugo(searchText, path = "*") {
  return getEntriesByFuzzySearch("yojijukugo", searchText, path);
}

export async function addYojijukugo(yojijukugoObject, jwtToken) {
  return addEntry("yojijukugo", yojijukugoObject, jwtToken);
}

export async function editYojijukugo(yojijukugoObject, dataToUpdate, jwtToken) {
  const id = yojijukugoObject._id;
  return editEntry("yojijukugo", id, dataToUpdate, jwtToken);
}

export async function deleteYojijukugo(yojijukugoObject, jwtToken) {
  const id = yojijukugoObject._id;
  return deleteEntry("yojijukugo", id, jwtToken);
}

// KOTOWAZA
export async function getKotowazaEntry(indexValue) {
  return getEntryByIndex("kotowaza", indexValue);
}

export async function getKotowazaEntries(indexValues) {
  return getEntriesByIndexes("kotowaza", indexValues);
}

export async function getKotowazaEntriesThatMatch(filters) {
  return getEntriesBySearch("kotowaza", filters);
}

export async function getKotowazaEntriesThatContainTheKanji(kanji) {
  const filters = {
    proverb: { $regex: kanji, $options: "i" }, // Case-insensitive match for the kanji in the proverb field
  };
  return getEntriesBySearch("kotowaza", filters);
}

export async function fuzzySearchKotowaza(searchText, path = "*") {
  return getEntriesByFuzzySearch("kotowaza", searchText, path);
}

export async function addKotowaza(kotowazaObject, jwtToken) {
  return addEntry("kotowaza", kotowazaObject, jwtToken);
}

export async function editKotowaza(kotowazaObject, dataToUpdate, jwtToken) {
  const id = kotowazaObject._id;
  return editEntry("kotowaza", id, dataToUpdate, jwtToken);
}

export async function deleteKotowaza(kotowazaObject, jwtToken) {
  const id = kotowazaObject._id;
  return deleteEntry("kotowaza", id, jwtToken);
}

// SENTENCES
export async function getSentenceEntriesThatMatch(filters) {
  return getEntriesBySearch("sentences", filters);
}

export async function getSentenceEntriesThatContainTheWord(word) {
  const filters = {
    words_in_sentence: {
      $elemMatch: { $regex: word, $options: "i" }, // Case-insensitive match in any element of the array
    },
  };
  return getEntriesBySearch("sentences", filters);
}

export async function addSentence(sentenceObject, jwtToken) {
  return addEntry("sentences", sentenceObject, jwtToken);
}

export async function editSentence(sentenceObject, dataToUpdate, jwtToken) {
  const id = sentenceObject._id;
  return editEntry("sentences", id, dataToUpdate, jwtToken);
}

export async function deleteSentence(sentenceObject, jwtToken) {
  const id = sentenceObject._id;
  return deleteEntry("sentences", id, jwtToken);
}
