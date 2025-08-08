/**
 * readEntries.js
 * --------------
 * Serverless endpoint that proxies read-only requests to the database layer.
 * The client specifies an operation and parameters in the request body and this
 * handler simply forwards them to `readEntries`.
 */

import { readEntries } from "./database.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // The body should define the operation, collection name and any filters.
    // Example: { operation: "getEntriesByIndexes", collectionName: "kanji", indexValues: ["新"] }
    const results = await readEntries(req.body);
    return res.status(200).json(results);
  } catch (error) {
    console.error("Error in readEntries handler:", error);
    return res
      .status(500)
      .json({ error: "Internal server error", details: error.message });
  }
}
