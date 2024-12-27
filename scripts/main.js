// Global variables for kanji data
let kanjiDictionary = null; // Stores the dictionary version of kanji data
let isFetchingData = false; // Prevents multiple concurrent fetches

/**
 * Initializes kanji data into memory as a dictionary on startup.
 */
async function initializeKanjiData() {
    if (!kanjiDictionary && !isFetchingData) {
        console.log("Fetching kanji data...");
        isFetchingData = true; // Mark as fetching
        kanjiDictionary = await fetchKanjiData();
        isFetchingData = false; // Reset fetch flag
        if (kanjiDictionary) {
            console.log("Kanji data successfully loaded!");
        } else {
            console.error("Failed to load kanji data.");
        }
    }
}

/**
 * Fetches kanji data from the serverless function.
 * @returns {Promise<Object>} The kanji data as a dictionary.
 */
async function fetchKanjiData() {
    const filePath = "data/picotan/kanji.json"; // Path to the kanji JSON file from root
  
    try {
      // Call the serverless function to fetch the file
      const response = await fetch(`/api/getFile?filePath=${encodeURIComponent(filePath)}`);
  
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
  
      // Parse and return the JSON data
      const kanjiData = await response.json();
      return kanjiData;
    } catch (error) {
      console.error("Error fetching kanji data:", error);
      return null; // Return null if there's an error
    }
  }

/**
 * Displays a random kanji entry from the cached kanji dictionary.
 */
function showRandomKanji() {
    if (kanjiDictionary) {
        const kanjiKeys = Object.keys(kanjiDictionary); // Get all keys (kanji characters)
        const randomKey = kanjiKeys[Math.floor(Math.random() * kanjiKeys.length)];
        const randomEntry = kanjiDictionary[randomKey];

        console.log("Random Kanji Entry:", randomEntry);
    } else {
        console.error("Kanji data is not loaded yet.");
    }
}

/**
 * Looks up a kanji entry by its character using the dictionary.
 * @param {string} character - The kanji character to look up
 */
function lookupKanji(character) {
    if (kanjiDictionary && kanjiDictionary[character]) {
        console.log(`Kanji Entry for ${character}:`, kanjiDictionary[character]);
    } else {
        console.error(`Kanji ${character} not found or data not loaded.`);
    }
}

/**
 * Adds a new kanji entry to the kanji JSON file using the serverless function.
 * @param {Object} newEntry - The new kanji entry to add.
 */
async function addKanjiEntry(newEntry) {
    const filePath = "data/picotan/kanji.json"; // Path to the kanji JSON file
  
    try {
      // Fetch the current kanji data
      const currentData = await fetchKanjiData();
      if (!currentData) {
        throw new Error("Failed to fetch current kanji data.");
      }
  
      // Add the new entry to the kanji data
      currentData[newEntry.character] = newEntry;
  
      // Call the serverless function to update the file
      const response = await fetch(`/api/writeToFile`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filePath,
          newContent: currentData,
        }),
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
  
      console.log("New kanji entry added successfully!");
    } catch (error) {
      console.error("Error adding kanji entry:", error);
    }
  }  

// Test calls after initialization
(async () => {
    await initializeKanjiData(); // Load kanji data on startup
    
    // Show a random kanji
    showRandomKanji(); 

    // Look up specific kanji
    lookupKanji("静"); 
    lookupKanji("漢"); 

    // Add a new kanji entry for "新"
    const newKanjiEntry = {
        character: "新",
        radical: "斤",
        stroke_count: 13,
        readings: {
            on: ["シン"],
            kun: ["あたら.しい", "あら.た", "にい", "さら"]
        },
        meanings: {
            japanese: [
                "あたらしい。あらた。あたらしい物事。",
                "あらたにする。あたらしいものにする。あらたまる。",
                "にい。あら。ことばの上につけて「あたらしい」の意を表す。",
            ],
            english: [
                "New. Fresh. New things.",
                "To renew. To make something new. To be renewed.",
                "'Neo-' 'Nov-.' Attached to words to signify the meaning of 'new.'"
            ]
        },
        kanken_level: 9,
        references: {
            jitenon: "https://kanji.jitenon.jp/kanji/163",
            kanjipedia: "https://www.kanjipedia.jp/kanji/0003650300"
        },
        id: "k3"
    };

    await addKanjiEntry(newKanjiEntry); // Add the new kanji entry

    // Verify the new kanji entry
    lookupKanji("新"); 
})();