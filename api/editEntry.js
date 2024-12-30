import { authenticate } from "./auth";
import { editEntry, getEntryById } from "./database"; // Add getEntryById
import { validateAndPrepareEntry } from "./validation";

export default async function handler(req, res) {
  if (req.method !== "PATCH") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  authenticate(req, res, async () => {
    const { collectionName, id, updateData } = req.body;

    if (!collectionName || !id || !updateData) {
      return res.status(400).json({ error: "Missing required parameters" });
    }

    try {
      // Fetch the existing entry from the database
      const existingEntry = await getEntryById(collectionName, id);
      if (!existingEntry) {
        return res.status(404).json({ error: `No document found with ID: ${id}` });
      }

      // Merge the existing entry with the updateData
      const mergedData = { ...existingEntry, ...updateData };

      // Validate the merged data against the schema
      const validatedData = validateAndPrepareEntry(collectionName, mergedData);

      // Perform the update
      const result = await editEntry(collectionName, id, validatedData);

      res.status(200).json({
        message: "Entry updated successfully",
        matchedCount: result.matchedCount,
        modifiedCount: result.modifiedCount
      });
    } catch (error) {
      console.error("Error editing entry:", error);
      res.status(400).json({ error: "Validation or update error", details: error.message });
    }
  });
}
