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
        kanjiDictionary = await fetchKanjiDataWithBlob();
        isFetchingData = false; // Reset fetch flag
        if (kanjiDictionary) {
            console.log("Kanji data successfully loaded!");
        } else {
            console.error("Failed to load kanji data.");
        }
    }
}

/**
 * Fetches kanji data from a GitHub repository using the GitHub API.
 * @returns {Promise<Object>} The kanji data as a dictionary
 */
async function fetchKanjiDataWithBlob() {
    const repo = "PukekoKiwi/PicoTan"; // GitHub repo
    const filePath = "data/picotan/kanji.json"; // Path to kanji.json file in the repo
    const token = ""; // Personal Access Token (replace with yours)

    const contentsUrl = `https://api.github.com/repos/${repo}/contents/${filePath}`;

    try {
        // Fetch file metadata from GitHub
        const contentsResponse = await fetch(contentsUrl, {
            headers: { Authorization: `token ${token}` },
        });

        if (!contentsResponse.ok) throw new Error(`HTTP error! Status: ${contentsResponse.status}`);

        const contentsData = await contentsResponse.json();
        const gitUrl = contentsData.git_url; // Get the Blob URL for file content

        // Fetch file content
        const blobResponse = await fetch(gitUrl, {
            headers: { Authorization: `token ${token}` },
        });

        if (!blobResponse.ok) throw new Error(`HTTP error! Status: ${blobResponse.status}`);

        // Decode Base64 content into JSON
        const blobData = await blobResponse.json();
        const decodedContent = new TextDecoder("utf-8").decode(
            Uint8Array.from(atob(blobData.content), (c) => c.charCodeAt(0))
        );

        return JSON.parse(decodedContent); // Return parsed JSON dictionary
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
 * Adds a new kanji entry to the GitHub-hosted dictionary and updates the local cache.
 * @param {Object} newEntry - The new kanji entry to add
 */
async function addKanjiEntry(newEntry) {
    const repo = "PukekoKiwi/PicoTan"; // GitHub repo
    const filePath = "data/picotan/kanji.json"; // Path to kanji.json file in the repo
    const token = "";

    const contentsUrl = `https://api.github.com/repos/${repo}/contents/${filePath}`;
    try {
        // Fetch file metadata from GitHub
        const contentsResponse = await fetch(contentsUrl, {
            headers: { Authorization: `token ${token}` },
        });

        if (!contentsResponse.ok) throw new Error(`HTTP error! Status: ${contentsResponse.status}`);

        const contentsData = await contentsResponse.json();
        const sha = contentsData.sha; // Required for updating the file
        const base64Content = contentsData.content; // Base64-encoded content

        // Decode, update, and re-encode content
        const decodedContent = new TextDecoder("utf-8").decode(
            Uint8Array.from(atob(base64Content), (c) => c.charCodeAt(0))
        );
        const jsonData = JSON.parse(decodedContent); // Parse JSON dictionary
        jsonData[newEntry.character] = newEntry; // Add new entry to the dictionary

        // Update the local cache
        if (!kanjiDictionary) {
            kanjiDictionary = jsonData; // Initialize cache if not already loaded
        } else {
            kanjiDictionary[newEntry.character] = newEntry; // Add to the cache
        }

        const encodedContent = btoa(
            String.fromCharCode(...new TextEncoder().encode(JSON.stringify(jsonData, null, 2)))
        );

        // Push updated content to GitHub
        const updateResponse = await fetch(contentsUrl, {
            method: "PUT",
            headers: {
                Authorization: `token ${token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                message: `Add new kanji entry: ${newEntry.character}`,
                content: encodedContent,
                sha,
            }),
        });

        if (!updateResponse.ok) throw new Error(`HTTP error! Status: ${updateResponse.status}`);

        console.log("New entry added successfully!");
    } catch (error) {
        console.error("Error adding new kanji entry:", error);
    }
}

// Test calls after initialization
(async () => {
    await initializeKanjiData(); // Load kanji data on startup
    showRandomKanji(); // Show a random kanji
    lookupKanji("静"); // Look up specific kanji
    lookupKanji("漢"); // Look up another kanji

})();
