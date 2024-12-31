import { readEntries } from "./database";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // The request body should include something like:
    // { operation: "getEntriesByIndexes", collectionName: "kanji", indexValues: ["新", "感"] }
    const results = await readEntries(req.body);
    return res.status(200).json(results);
  } catch (error) {
    console.error("Error in readEntries handler:", error);
    return res.status(500).json({ error: "Internal server error", details: error.message });
  }
}