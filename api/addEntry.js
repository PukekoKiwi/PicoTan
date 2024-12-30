// /api/addEntry.js
import { authenticate } from "./auth";
import { addEntry } from "./database";
import { validateAndPrepareEntry } from "./validation"; 

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // 1) Verify JWT token
  authenticate(req, res, async () => {
    const { collectionName, newEntry } = req.body;

    if (!collectionName || !newEntry) {
      return res.status(400).json({ error: "Missing required parameters" });
    }

    try {
      // 2) Validate & shape the incoming data
      const preparedEntry = validateAndPrepareEntry(collectionName, newEntry);

      // 3) Insert into the DB
      const result = await addEntry(collectionName, preparedEntry);

      // 4) Send success response
      res.status(201).json({
        message: "Entry added successfully",
        insertedId: result.insertedId
      });
    } catch (error) {
      console.error("Error adding entry:", error);

      // For validation errors, 400 (Bad Request) might be more appropriate than 500
      res.status(400).json({
        error: "Validation or insertion error",
        details: error.message
      });
    }
  });
}
