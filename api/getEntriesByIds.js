import { getEntriesByIds } from "./database";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { collectionName, ids } = req.body;

  if (!collectionName || !Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ error: "Missing or invalid parameters. Provide a collection name and a non-empty array of IDs." });
  }

  try {
    const entries = await getEntriesByIds(collectionName, ids);
    if (entries.length === 0) {
      return res.status(404).json({ error: "No entries found for the provided IDs." });
    }

    res.status(200).json(entries);
  } catch (error) {
    console.error("Error fetching entries by IDs:", error);
    res.status(500).json({ error: "Internal server error", details: error.message });
  }
}
