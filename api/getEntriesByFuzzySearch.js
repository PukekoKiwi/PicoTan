import { getEntriesByFuzzySearch } from "./database";

/**
 * API handler for performing a fuzzy search in specified collections.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { collectionName, searchText, path = "*" } = req.body;

  // Validate input
  if (!collectionName || !searchText) {
    return res.status(400).json({ error: "Missing required parameters: collectionName or searchText" });
  }

  try {
    const results = await getEntriesByFuzzySearch(collectionName, searchText, path);
    res.status(200).json(results);
  } catch (error) {
    console.error("Error in getEntriesByFuzzySearch:", error);
    res.status(500).json({ error: "Internal server error", details: error.message });
  }
}
