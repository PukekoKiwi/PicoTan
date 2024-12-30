import { getEntriesByIndexes } from "./database";

/**
 * API handler for fetching multiple entries by their indexed values.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { collectionName, indexValues } = req.body;

  // Validate input
  if (!collectionName || !Array.isArray(indexValues) || indexValues.length === 0) {
    return res.status(400).json({ error: "Missing or invalid collectionName or indexValues" });
  }

  try {
    const results = await getEntriesByIndexes(collectionName, indexValues);
    res.status(200).json(results);
  } catch (error) {
    console.error("API error in getEntriesByIndexes:", error);
    res.status(500).json({ error: "Internal server error", details: error.message });
  }
}
