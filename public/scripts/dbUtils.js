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