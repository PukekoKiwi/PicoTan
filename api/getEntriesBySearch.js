import { getEntriesBySearch } from "./database";

/**
 * API handler for performing flexible searches in collections.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { collectionName, filters } = req.body;

  // Validate input
  if (!collectionName || !filters || typeof filters !== "object") {
    return res.status(400).json({ error: "Invalid or missing parameters" });
  }

  try {
    const results = await getEntriesBySearch(collectionName, filters);
    res.status(200).json(results);
  } catch (error) {
    console.error("Error in getEntriesBySearch:", error);
    res.status(500).json({ error: "Internal server error", details: error.message });
  }
}
