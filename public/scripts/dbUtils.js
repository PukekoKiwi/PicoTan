// Core read operations

/**
 * Fetches multiple entries from the database by their IDs via the /api/getEntriesByIds endpoint.
 * @param {string} collectionName - The name of the collection (e.g., "kanji", "words").
 * @param {Array<string>} ids - An array of document IDs to fetch.
 * @returns {Promise<Array<object>>} - An array of matching documents.
 * @throws {Error} if the request fails.
 */
export async function getEntriesByIds(collectionName, ids) {
  try {
    const response = await fetch(`/api/getEntriesByIds`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ collectionName, ids })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || response.statusText);
    }

    return await response.json();
  } catch (error) {
    console.error("Failed to fetch entries by IDs:", error);
    throw error;
  }
}

/**
 * Fetches multiple entries from the database via the API.
 * @param {string} collectionName - The collection to search in (e.g., "kanji", "words").
 * @param {Array<string>} indexValues - An array of values to search for (e.g., ["漢", "感謝"]).
 * @returns {Promise<Array<object>>} - An array of fetched documents.
 */
export async function getEntriesByIndexes(collectionName, indexValues) {
  try {
    const response = await fetch(`/api/getEntriesByIndexes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ collectionName, indexValues }),
    });
    if (!response.ok) throw new Error(`Error: ${response.statusText}`);
    return await response.json();
  } catch (error) {
    console.error("Failed to get entries by indexes:", error);
    return [];
  }
}
 
/**
 * Fetches entries from the database based on flexible filters.
 * @param {string} collectionName - The name of the collection to search.
 * @param {object} filters - Filters for the search (e.g., { "readings.on.reading": "カン" }).
 * @returns {Promise<Array<object>>} - An array of matching documents.
 */
export async function getEntriesBySearch(collectionName, filters) {
  try {
    const response = await fetch(`/api/getEntriesBySearch`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ collectionName, filters }),
    });
    if (!response.ok) throw new Error(`Error: ${response.statusText}`);
    return await response.json();
  } catch (error) {
    console.error("Failed to get entries by search:", error);
    return [];
  }
}

/**
 * Fetches entries from the database using a fuzzy search.
 * @param {string} collectionName - The collection to search in (e.g., "words", "yojijukugo", "kotowaza").
 * @param {string} searchText - The text to search for (e.g., "漢字").
 * @param {string} [path="*"] - The field to search in (default: "*", all).
 * @returns {Promise<Array<object>>} - An array of matching documents.
 */
export async function getEntriesByFuzzySearch(collectionName, searchText, path = "*") {
  try {
    const response = await fetch(`/api/getEntriesByFuzzySearch`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ collectionName, searchText, path }),
    });
    if (!response.ok) throw new Error(`Error: ${response.statusText}`);
    return await response.json();
  } catch (error) {
    console.error("Failed to get entries by fuzzy search:", error);
    return [];
  }
}

// Core write operations

/**
 * Adds a new entry to the database via the /api/addEntry endpoint.
 * @param {string} collectionName - The name of the collection (e.g., "kanji", "words").
 * @param {object} newEntry - The document to add.
 * @param {string} jwtToken - The JWT token for authentication (e.g. from localStorage).
 * @returns {Promise<object>} - The response JSON from the server (or error).
 * @throws {Error} if the response is not OK or if the server returns an error message.
 */
export async function addEntry(collectionName, newEntry, jwtToken) {
  try {
    const response = await fetch("/api/addEntry", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${jwtToken}` // Attach the JWT token
      },
      body: JSON.stringify({ collectionName, newEntry })
    });

    // If the server responds with a non-OK status, parse and throw the error details
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.details || response.statusText);
    }

    // Otherwise parse the successful JSON response
    return await response.json();
  } catch (error) {
    console.error("Failed to add entry:", error);
    throw error; // Re-throw so the caller can handle/log it
  }
}

/**
 * Edits an existing entry in the database via the /api/editEntry endpoint.
 * @param {string} collectionName - The name of the collection (e.g., "kanji", "words").
 * @param {string} id - The _id of the document to update.
 * @param {object} updateData - The fields to update.
 * @param {string} jwtToken - The JWT token for authentication.
 * @returns {Promise<object>} - The response JSON from the server.
 * @throws {Error} if the response is not OK or if the server returns an error message.
 */
export async function editEntry(collectionName, id, updateData, jwtToken) {
  try {
    const response = await fetch("/api/editEntry", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${jwtToken}`
      },
      body: JSON.stringify({ collectionName, id, updateData })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.details || response.statusText);
    }

    return await response.json();
  } catch (error) {
    console.error("Failed to edit entry:", error);
    throw error;
  }
}