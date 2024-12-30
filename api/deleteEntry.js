import { authenticate } from "./auth";
import { deleteEntry } from "./database";

export default async function handler(req, res) {
  if (req.method !== "DELETE") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  authenticate(req, res, async () => {
    const { collectionName, id } = req.body;

    if (!collectionName || !id) {
      return res.status(400).json({ error: "Missing required parameters: collectionName and id." });
    }

    try {
      const result = await deleteEntry(collectionName, id);
      res.status(200).json({
        message: "Entry deleted successfully",
        deletedCount: result.deletedCount
      });
    } catch (error) {
      console.error("Error deleting entry:", error);
      res.status(400).json({ error: "Failed to delete entry", details: error.message });
    }
  });
}
