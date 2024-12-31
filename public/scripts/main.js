// Import all utility functions for testing
import { 
  getAllEntries, 
  getKanjiEntry, 
  getKanjiEntriesByKankenLevel, 
  getSentenceEntriesThatContainTheWord, 
  getKotowazaEntriesThatContainTheKanji, 
  fuzzySearchWords, 
  getEntriesBySearch 
} from "./dbUtils.js";

document.addEventListener("DOMContentLoaded", async () => {
  console.log("Testing read operations...");

  // Example: Retrieve all entries in the "kanji" collection
  try {
    console.log("Fetching all kanji entries...");
    const allKanji = await getAllEntries("kanji");
    console.log("All Kanji Entries:", allKanji);
  } catch (error) {
    console.error("Error fetching all Kanji entries:", error);
  }

  // Example: Fetch a specific kanji by index
  try {
    console.log("Fetching kanji by index ('新')...");
    const kanjiEntry = await getKanjiEntry("新");
    console.log("Kanji Entry for '新':", kanjiEntry);
  } catch (error) {
    console.error("Error fetching Kanji by index:", error);
  }

  // Example: Fetch kanji by kanken level
  try {
    console.log("Fetching Kanji with Kanken Level 4...");
    const kankenLevelKanji = await getKanjiEntriesByKankenLevel(4);
    console.log("Kanji with Kanken Level 4:", kankenLevelKanji);
  } catch (error) {
    console.error("Error fetching Kanji by Kanken level:", error);
  }

  // Example: Fetch sentences containing a specific word
  try {
    console.log("Fetching sentences that contain the word '漢字'...");
    const sentencesWithWord = await getSentenceEntriesThatContainTheWord("漢字");
    console.log("Sentences containing '漢字':", sentencesWithWord);
  } catch (error) {
    console.error("Error fetching sentences by word:", error);
  }

  // Example: Fetch proverbs containing a specific kanji
  try {
    console.log("Fetching Kotowaza that contain the kanji '石'...");
    const kotowazaWithKanji = await getKotowazaEntriesThatContainTheKanji("石");
    console.log("Kotowaza containing '石':", kotowazaWithKanji);
  } catch (error) {
    console.error("Error fetching Kotowaza by kanji:", error);
  }

  // Example: Perform a fuzzy search for words
  try {
    console.log("Performing a fuzzy search for words with '漢'...");
    const fuzzyWords = await fuzzySearchWords("漢");
    console.log("Words matching '漢':", fuzzyWords);
  } catch (error) {
    console.error("Error performing fuzzy search for words:", error);
  }

  // Example: Fetch sentences with Kanken level harder than 5
  try {
    console.log("Fetching sentences with Kanken levels harder than 5...");
    const sentencesHarderThanKankenLevel5 = await getEntriesBySearch("sentences", {
      kanken_level: { $lt: 5 },
    });
    console.log("Sentences with Kanken levels harder than 5:", sentencesHarderThanKankenLevel5);
  } catch (error) {
    console.error("Error fetching sentences with Kanken level harder than 5:", error);
  }

  // Example: Fetch radicals with one of the readings being 'さんずい'
  try {
    console.log("Fetching radicals with the reading 'さんずい'...");
    const radicalsWithReading = await getEntriesBySearch("radicals", {
      names: { $elemMatch: { $regex: "さんずい", $options: "i" } },
    });
    console.log("Radicals with reading 'さんずい':", radicalsWithReading);
  } catch (error) {
    console.error("Error fetching radicals by reading:", error);
  }

  console.log("Finished testing read operations.");
});
