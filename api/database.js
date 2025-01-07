import { ObjectId } from "mongodb";
import connectMongo from "./connectMongo";

const validCollections = [
  "radicals",
  "kanji",
  "words",
  "yojijukugo",
  "kotowaza",
  "sentences",
];

const indexFieldMap = {
  radicals: "character",  // Indexed field for the "radicals" collection
  kanji: "character",     // Indexed field for the "kanji" collection
  words: "word",          // Indexed field for the "words" collection
  yojijukugo: "idiom",    // Indexed field for the "yojijukugo" collection
  kotowaza: "proverb",    // Indexed field for the "kotowaza" collection
};

// Read operations

export async function readEntries({ operation, collectionName, ids, indexValues, filters, searchText, path = "*" }) {
  const { db } = await connectMongo();

  switch (operation) {
    /**
     * ------------------------------------------------------
     * Get entries by IDs
     * ------------------------------------------------------
     */
    case "getEntriesByIds": {
      if (!collectionName || !Array.isArray(ids) || ids.length === 0) {
        throw new Error("Missing or invalid parameters. Provide a collection name and a non-empty array of IDs.");
      }

      // Validate and convert IDs to ObjectId
      const objectIds = ids.map((id) => {
        if (!ObjectId.isValid(id)) {
          throw new Error(`Invalid document ID: ${id}`);
        }
        return new ObjectId(id);
      });

      // Query the collection
      const results = await db.collection(collectionName).find({ _id: { $in: objectIds } }).toArray();

      // Sort the results to match the order of the input IDs
      const resultsById = new Map(results.map((doc) => [doc._id.toString(), doc]));
      return ids.map((id) => resultsById.get(id) || null); 
    }

    /**
     * ------------------------------------------------------
     * Get entries by indexValues
     * ------------------------------------------------------
     */
    case "getEntriesByIndexes": {
      if (!collectionName || !Array.isArray(indexValues) || indexValues.length === 0) {
        throw new Error("Missing or invalid collectionName or indexValues");
      }
      // If there's no entry for this collection in indexFieldMap, 
      // then it doesn't support index-based lookups:
      const indexField = indexFieldMap[collectionName];
      if (!indexField) {
        throw new Error(`Collection '${collectionName}' does not support index-based lookups.`);
      }
    
      const query = { [indexField]: { $in: indexValues } };
      return db.collection(collectionName).find(query).toArray();
    }

    /**
     * ------------------------------------------------------
     * Get entries by Search
     * ------------------------------------------------------
     */
    case "getEntriesBySearch": {
      if (!collectionName || !filters || typeof filters !== "object") {
        throw new Error("Invalid or missing parameters for getEntriesBySearch");
      }
    
      const query = {};
      for (const [key, value] of Object.entries(filters)) {
        // 1) If it's an operator like $or, $and, etc., use it verbatim
        if (key.startsWith("$")) {
          query[key] = value;
        }
        // 2) If it's an array but *not* a special operator, do $in
        else if (Array.isArray(value)) {
          query[key] = { $in: value };
        }
        // 3) If it's "regex:...", handle that
        else if (typeof value === "string" && value.startsWith("regex:")) {
          const regex = new RegExp(value.slice(6), "i");
          query[key] = regex;
        }
        // 4) Otherwise, just assign the value
        else {
          query[key] = value;
        }
      }
    
      return db.collection(collectionName).find(query).toArray();
    }

    /**
     * ------------------------------------------------------
     * Get entries by Fuzzy Search
     * ------------------------------------------------------
     */
    case "getEntriesByFuzzySearch": {
      if (!collectionName || !searchText) {
        throw new Error("Missing required parameters: collectionName or searchText");
      }

      const supportedCollections = ["words", "yojijukugo", "kotowaza"];
      if (!supportedCollections.includes(collectionName)) {
        throw new Error(
          `Fuzzy search is not supported for collection: ${collectionName}.` +
          ` Supported collections are: ${supportedCollections.join(", ")}`
        );
      }

      if (!searchText.trim()) {
        throw new Error("Search text cannot be empty");
      }

      // Build Atlas Search pipeline
      const pipeline = [
        {
          $search: {
            index: `${collectionName}_search`,
            text: {
              query: searchText,
              path: {
                wildcard: "*",
              },
            },
          },
        },
      ];

      // If a specific path is provided, override the wildcard path
      if (path !== "*") {
        pipeline[0].$search.text.path = path;
      }

      return db.collection(collectionName).aggregate(pipeline).toArray();
    }

    default:
      throw new Error(`Unknown operation: ${operation}`);
  }
}

// Write operations

/**
 * @param {object} params
 * @param {string} params.operation - "addEntry" | "editEntry" | "deleteEntry"
 * @param {string} params.collectionName - The name of the collection to act on
 * @param {object} [params.newEntry] - For "addEntry": the document to be inserted
 * @param {string} [params.id] - For "editEntry" or "deleteEntry": the _id of the document
 * @param {object} [params.updateData] - For "editEntry": the fields to update
 * @returns {Promise<object>} - Depending on operation, returns insertion result, update result, or deletion result
 */
export async function writeEntries({ operation, collectionName, newEntry, id, updateData }) {
  const { db } = await connectMongo();

  switch (operation) {
    case "addEntry": {
      if (!validCollections.includes(collectionName)) {
        throw new Error(`Invalid collection: ${collectionName}`);
      }
      if (!newEntry) {
        throw new Error("Missing newEntry for addEntry operation");
      }
      const result = await db.collection(collectionName).insertOne(newEntry);
      return { insertedId: result.insertedId };
    }

    case "editEntry": {
      if (!id || !updateData) {
        throw new Error("Missing id or updateData for editEntry operation");
      }
      if (!ObjectId.isValid(id)) {
        throw new Error(`Invalid document ID: ${id}`);
      }
      const result = await db
        .collection(collectionName)
        .updateOne({ _id: new ObjectId(id) }, { $set: updateData });
      return {
        matchedCount: result.matchedCount,
        modifiedCount: result.modifiedCount,
      };
    }

    case "deleteEntry": {
      if (!id) {
        throw new Error("Missing id for deleteEntry operation");
      }
      if (!ObjectId.isValid(id)) {
        throw new Error(`Invalid document ID: ${id}`);
      }
      const result = await db
        .collection(collectionName)
        .deleteOne({ _id: new ObjectId(id) });
      return {
        deletedCount: result.deletedCount,
      };
    }

    default:
      throw new Error(`Unknown write operation: ${operation}`);
  }
}