import { ObjectId } from "mongodb";
import connectMongo from "./connectMongo";
import { indexFieldMap } from "./constants";

// Read operations

/**
 * Retrieves entries by their IDs from the specified collection, preserving the order of the input IDs.
 * @param {string} collectionName - The name of the collection (e.g., "kanji", "words").
 * @param {Array<string>} ids - An array of document IDs to fetch.
 * @returns {Promise<Array<object>>} - An array of matching documents in the same order as the input IDs.
 */
export async function getEntriesByIds(collectionName, ids) {
  const { db } = await connectMongo();

  // Validate and convert IDs to ObjectId
  const objectIds = ids.map(id => {
    if (!ObjectId.isValid(id)) {
      throw new Error(`Invalid document ID: ${id}`);
    }
    return new ObjectId(id);
  });

  // Query the collection
  const results = await db.collection(collectionName).find({ _id: { $in: objectIds } }).toArray();

  // Sort the results to match the order of the input IDs
  const resultsById = new Map(results.map(doc => [doc._id.toString(), doc]));
  return ids.map(id => resultsById.get(id) || null); // Ensure order and include nulls for missing entries
}

/**
 * Retrieves entries from a specified collection based on a list of indexed values.
 * @param {string} collectionName - The name of the collection (e.g., "kanji", "words").
 * @param {Array<string>} indexValues - An array of values to search for (e.g., ["漢字", "感謝"]).
 * @returns {Promise<Array<object>>} - An array of matching documents.
 */
export async function getEntriesByIndexes(collectionName, indexValues) {
  if (!Array.isArray(indexValues) || indexValues.length === 0) {
    throw new Error("indexValues must be a non-empty array.");
  }

  const { db } = await connectMongo();
  const indexField = indexFieldMap[collectionName]; // Use the map to get the indexed field
  if (!indexField) throw new Error(`Invalid collection: ${collectionName}`);

  const query = { [indexField]: { $in: indexValues } }; // Use $in for multiple values
  return db.collection(collectionName).find(query).toArray();
}

/**
 * Performs a flexible search in a specified collection based on filters.
 * @param {string} collectionName - The name of the collection to search.
 * @param {object} filters - Key-value pairs representing search filters.
 * @returns {Promise<Array<object>>} - An array of matching documents.
 */
export async function getEntriesBySearch(collectionName, filters) {
  const { db } = await connectMongo();
  const query = {};

  // Build the query dynamically based on filters
  for (const [key, value] of Object.entries(filters)) {
    if (Array.isArray(value)) {
      // If the value is an array, use $in for matching
      query[key] = { $in: value };
    } else if (typeof value === "string" && value.startsWith("regex:")) {
      // If the value starts with "regex:", treat it as a regex pattern
      const regex = new RegExp(value.slice(6), "i"); // Remove "regex:" and create a case-insensitive regex
      query[key] = regex;
    } else {
      // Default equality match
      query[key] = value;
    }
  }

  // Perform the search in the specified collection
  return db.collection(collectionName).find(query).toArray();
}

/**
 * Performs a fuzzy search in a specified collection using MongoDB Atlas Search.
 * @param {string} collectionName - The name of the collection to search (e.g., "words", "yojijukugo", "kotowaza").
 * @param {string} searchText - The text to search for (e.g., "漢字", "meaning").
 * @param {string|object} [path="*"] - The field(s) to search in. Default is wildcard "*".
 * @returns {Promise<Array<object>>} - Matching documents sorted by relevance.
 */
export async function getEntriesByFuzzySearch(collectionName, searchText, path = "*") {
  const { db } = await connectMongo();

  // Validate supported collections for fuzzy search
  const supportedCollections = ["words", "yojijukugo", "kotowaza"];
  if (!supportedCollections.includes(collectionName)) {
    throw new Error(`Fuzzy search is not supported for collection: ${collectionName}. Supported collections are: ${supportedCollections.join(", ")}`);
  }

  if (!searchText.trim()) {
    throw new Error("Search text cannot be empty");
  }

  // Atlas Search query
  let query = [
    {
      $search: {
        "index": `${collectionName}_search`,
        "text": {
          "query": searchText,
          "path": {
            wildcard: "*"
          }
        }
      }
    }
  ];

  // Changes the path to a specific field if provided
  if (path !== "*") {
    query[0].$search.text.path = path;
  }

  return db.collection(collectionName).aggregate(query).toArray();
}

// Write operations

/**
 * Adds a new document to the specified collection.
 * @param {string} collectionName - The name of the collection (e.g., "kanji", "words").
 * @param {object} newEntry - The document to be added.
 * @returns {Promise<object>} - The result of the insert operation.
 */
export async function addEntry(collectionName, newEntry) {
  const { db } = await connectMongo();

  // Validate collection name
  if (!Object.keys(indexFieldMap).includes(collectionName)) {
    throw new Error(`Invalid collection: ${collectionName}`);
  }

  // Insert the new document
  const result = await db.collection(collectionName).insertOne(newEntry);
  return result;
}


/**
 * Edits an existing document in the specified collection.
 * @param {string} collectionName - The name of the collection (e.g., "kanji", "words").
 * @param {string} id - The _id of the document to update.
 * @param {object} updateData - The fields to update.
 * @returns {Promise<object>} - The result of the update operation.
 */
export async function editEntry(collectionName, id, updateData) {
  const { db } = await connectMongo();

  // Validate the id format
  if (!ObjectId.isValid(id)) {
    throw new Error(`Invalid document ID: ${id}`);
  }

  // Update the document
  const result = await db.collection(collectionName).updateOne(
    { _id: new ObjectId(id) }, // Match by ID
    { $set: updateData }       // Set only the fields in updateData
  );

  if (result.matchedCount === 0) {
    throw new Error(`No document found with _id: ${id}`);
  }

  return result;
}