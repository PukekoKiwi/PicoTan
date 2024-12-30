import { getEntryById } from "./database";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { collectionName, id } = req.query;

  if (!collectionName || !id) {
    return res.status(400).json({ error: "Missing collectionName or ID." });
  }

  try {
    const entry = await getEntryById(collectionName, id);
    if (!entry) {
      return res.status(404).json({ error: `Entry not found with ID: ${id}` });
    }

    res.status(200).json(entry);
  } catch (error) {
    console.error("Error fetching entry by ID:", error);
    res.status(500).json({ error: "Internal server error", details: error.message });
  }
}
