// Import the correct function from database.js
import { getEntryByIndex } from "./database";

// Use the correct function
export default async function handler(req, res) {

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { collectionName, indexValue } = req.query;

  if (!collectionName || !indexValue) {
    return res.status(400).json({ error: "Missing collectionName or indexValue" });
  }

  try {
    const result = await getEntryByIndex(collectionName, indexValue);
    if (!result) {
      return res.status(404).json({ error: "Entry not found" });
    }

    res.status(200).json(result);
  } catch (error) {
    console.error("API error:", error);
    res.status(500).json({ error: "Internal server error", details: error.message });
  }
}
