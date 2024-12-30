import { getEntryById, getEntriesByIds, getEntryByIndex, getEntriesByIndexes, getEntriesBySearch, getEntriesByFuzzySearch, addEntry, editEntry, deleteEntry } from "./dbUtils.js";

document.addEventListener("DOMContentLoaded", async () => {
  /*
  console.log("Experimenting with database queries...");

  // Fetch a single entry directly
  console.log("\nFetching a single entry by index:");

  const kanjiEntry = await getEntryByIndex("kanji", "新"); 
  console.log("Fetched Kanji Entry for '新':", kanjiEntry);

  const kanjiEntry2 = await getEntryByIndex("kanji", "感"); 
  console.log("Fetched Kanji Entry for '感':", kanjiEntry);

  const radicalEntry = await getEntryByIndex("radicals", "氵"); 
  console.log("Fetched Radical Entry for '氵':", radicalEntry);

  const wordEntry = await getEntryByIndex("words", "漢字"); 
  console.log("Fetched Word Entry for '漢字':", wordEntry);

  console.log("   ");
  console.log("Testing getEntryById...");
  console.log("   ");

  // Fetch a single entry by its ID
  const collectionName = "kanji";
  const documentId = kanjiEntry._id;

  try {
    // Fetch the entry by ID
    console.log(`Fetching entry from collection "${collectionName}" with ID "${documentId}"...`);
    const entry = await getEntryById(collectionName, documentId);
    console.log("Fetched entry:", entry);
  } catch (error) {
    console.error("Failed to fetch entry by ID:", error.message);
  }

  console.log("   ");
  console.log("Testing getEntriesByIds...");
  console.log("   ");

  // Fetch multiple entries by their IDs
  const documentIds = [
    kanjiEntry._id,
    kanjiEntry2._id
  ];

  try {
    // Fetch the entries by their IDs
    console.log(`Fetching entries from collection "${collectionName}" with IDs:`, documentIds);
    const entries = await getEntriesByIds(collectionName, documentIds);
    console.log("Fetched entries:", entries);
  } catch (error) {
    console.error("Failed to fetch entries by IDs:", error.message);
  }

  console.log("   ");
  console.log("Fetching multiple entries...");
  console.log("   ");

  const indexValues = ["新", "漢", "感"];

  const entriesByIndex = await getEntriesByIndexes(collectionName, indexValues);
  console.log("Fetched entries:", entriesByIndex);

  console.log("   ");
  console.log("Fetching entries via search...");
  console.log("   ");

  console.log("Fetching entries with on-reading 'カン'");
  const kanjiWithOnReading = await getEntriesBySearch("kanji", {
    "readings.on.reading": "カン",
  });
  console.log(kanjiWithOnReading);

  console.log("Fetching words with pronunciation 'かんじ'");
  const wordsWithPronunciation = await getEntriesBySearch("words", {
    "readings.reading": "かんじ",
  });
  console.log(wordsWithPronunciation);

  console.log("Fetching radicals with pronunciation 'さんずい'");
  const radicalsWithPronunciation = await getEntriesBySearch("radicals", {
    names: { $regex: "さんずい" },
  });
  console.log(radicalsWithPronunciation);

  console.log("Fetching sentences with Kanken Level 4");
  const sentencesWithKankenLevel = await getEntriesBySearch("sentences", {
    kanken_level: 4,
  });
  console.log(sentencesWithKankenLevel);

  console.log("Fetching words with collocations containing '教育漢字'");
  const wordsWithCollocations = await getEntriesBySearch("words", {
    collocations: { $regex: "教育漢字" },
  });
  console.log(wordsWithCollocations);

  console.log("   ");
  console.log("Testing fuzzy search...");
  console.log("   ");

  // Example 1: Fuzzy search for a word in the "words" collection
  try {
    const wordsResults = await getEntriesByFuzzySearch("words", "漢字");
    console.log("Fuzzy search results for '漢字' in 'words':", wordsResults);
  } catch (error) {
    console.error("Error fetching words:", error);
  }

  // Example 2: Fuzzy search for a meaning in the "kotowaza" collection
  try {
    const kotowazaResults = await getEntriesByFuzzySearch("kotowaza", "persevere", "meanings.english");
    console.log("Fuzzy search results for 'persevere' in 'kotowaza':", kotowazaResults);
  } catch (error) {
    console.error("Error fetching kotowaza:", error);
  }

  // Example 3: Fuzzy search for an idiom in the "yojijukugo" collection
  try {
    const yojijukugoResults = await getEntriesByFuzzySearch("yojijukugo", "異口同音");
    console.log("Fuzzy search results for '異口同音' in 'yojijukugo':", yojijukugoResults);
  } catch (error) {
    console.error("Error fetching yojijukugo:", error);
  }

  // Experimenting with adding new entries to the database
  console.log("   ");
  console.log("Experimenting with adding new entries...");
  console.log("   ");

  // Example: Retrieve token from localStorage (assuming you store it there after login)
  const jwtToken = localStorage.getItem("picotan_jwt");

  // Construct a new Kanji entry for testing
  const newKanji = {
    character: "卜",               // required
    radical: "卜",                 // required
    stroke_count: { "$numberInt": "2" }, // or { "$numberDouble": "13.0" }
    readings: {
      on:  [{ reading: "ボク", tags: [] }, { reading: "ホク", tags: [] }],
      kun: [{ reading: "うらな", okurigana: "う", tags: [] }, { reading: "うらな", okurigana: "い", tags: [] }]
    },
    meanings: {
      japanese: ["うらない。うらなう。物事の吉凶を判断する。", "選ぶ。選定する。"],
      english: ["Fortune-telling. To judge the fortune or misfortune of events.", "To select. To choose or make a selection."]
    },
    kanken_level: { "$numberDouble": "1.5" },
    categories: ["第１水準"],
    references: [{ source: "漢字辞典オンライン", url: "https://example.com" },{ source: "漢字ペディア", url: "https://example.com" }],
    // optional fields
    alternate_forms: []
  };

  // Attempt to insert into "kanji" collection
  try {
    console.log("Sending new Kanji data to server...");
    const response = await addEntry("kanji", newKanji, jwtToken);
    console.log("Server response:", response);
    // e.g. { message: "Entry added successfully", insertedId: "..." }
  } catch (error) {
    console.error("Failed to add new Kanji entry:", error.message);
    // Possibly show a user-friendly message in the UI
  }

  // Experimenting with editing existing entries in the database
  console.log("   ");
  console.log("Experimenting with appending text to meanings...");
  console.log("   ");

  try {
    // Retrieve an existing Kanji entry by its character
    const kanjiEntry = await getEntryByIndex("kanji", "新");

    // If the entry doesn't exist, log an error and stop
    if (!kanjiEntry) {
      console.error("Kanji entry not found for character '新'.");
      return;
    }

    // Extract the ID of the existing entry
    const kanjiId = kanjiEntry._id;

    // Retrieve token from localStorage (assuming you store it there after login)
    const jwtToken = localStorage.getItem("picotan_jwt");

    if (!jwtToken) {
      console.error("No JWT token found. Please log in first.");
      return;
    }

    // Clone the existing meanings to avoid direct mutation
    const updatedMeanings = kanjiEntry.meanings.map((meaning, index) => {
      // Append "(updated)" or "（更新）" to the first meaning only
      if (index === 0) {
        return {
          japanese: meaning.japanese + "（更新）",
          english: meaning.english ? meaning.english + " (updated)" : ""
        };
      }
      return meaning; // Keep the rest unchanged
    });

    // Define the updates to apply
    const updatedData = { meanings: updatedMeanings };

    // Send the update to the server
    console.log("Sending update to server...");
    const response = await editEntry("kanji", kanjiId, updatedData, jwtToken);

    // Log the server response
    console.log("Server response:", response);
    // Example: { message: "Entry updated successfully", matchedCount: 1, modifiedCount: 1 }
  } catch (error) {
    console.error("Failed to edit Kanji entry:", error.message);
    // Possibly show a user-friendly message in the UI
  }


  const kanjiToDelete = await getEntryByIndex("kanji", "闇"); 
  console.log("Fetched Kanji Entry for '闇':", kanjiToDelete);

  console.log("   ");
  console.log("Testing deleteEntry...");
  console.log("   ");

  // Example: Retrieve token from localStorage (assuming you store it there after login)
  const jwtToken = localStorage.getItem("picotan_jwt");

  if (!jwtToken) {
    console.error("No JWT token found. Please log in first.");
    return;
  }

  // Example collection name and document ID (replace with actual values)
  const collectionName = "kanji";
  const documentId = kanjiToDelete._id;

  try {
    // Attempt to delete the entry
    console.log(`Deleting entry from collection "${collectionName}" with ID "${documentId}"...`);
    const response = await deleteEntry(collectionName, documentId, jwtToken);
    console.log("Server response:", response);
    // Example: { message: "Entry deleted successfully", deletedCount: 1 }
  } catch (error) {
    console.error("Failed to delete entry:", error.message);
  }
          */
});
