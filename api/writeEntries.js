/**
 * writeEntries.js
 * ----------------
 * Serverless endpoint for all write operations.  After authenticating the
 * request it forwards the payload to the `writeEntries` helper and returns a
 * descriptive response depending on the operation performed.
 */

import { authenticate } from "./auth.js";
import { writeEntries } from "./database.js";
import { Double } from "mongodb";

export default async function handler(req, res) {
  // We'll allow multiple HTTP verbs,
  // but often you'll just use POST for all state-changing ops in serverless.
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  authenticate(req, res, async () => {
    try {
      // Handle Double weirdness with MongoDB when adding a new entry
      if (req.body.operation === "addEntry" && req.body?.newEntry) {
        if (typeof req.body.newEntry.kanken_level === "number") {
          req.body.newEntry.kanken_level = new Double(req.body.newEntry.kanken_level);
        }
      }

      // Handle Double weirdness with MongoDB when editing an entry
      if (req.body.operation === "editEntry" && req.body?.updateData) {
        if (typeof req.body.updateData.kanken_level === "number") {
          req.body.updateData.kanken_level = new Double(req.body.updateData.kanken_level);
        }
      }

      const result = await writeEntries(req.body);

      switch (req.body.operation) {
        case "addEntry":
          return res.status(201).json({
            message: "Entry added successfully",
            insertedId: result.insertedId,
          });

        case "editEntry":
          if (result.matchedCount === 0) {
            return res.status(404).json({
              error: `No document found with ID: ${req.body.id}`
            });
          }
          return res.status(200).json({
            message: "Entry updated successfully",
            matchedCount: result.matchedCount,
            modifiedCount: result.modifiedCount,
          });

        case "deleteEntry":
          if (result.deletedCount === 0) {
            return res.status(404).json({
              error: `No document found with ID: ${req.body.id}`
            });
          }
          return res.status(200).json({
            message: "Entry deleted successfully",
            deletedCount: result.deletedCount,
          });

        default:
          return res
            .status(400)
            .json({ error: "Invalid or missing operation type" });
      }
    } catch (error) {
      // Log the entire error as JSON so you can see schema details in the terminal
      console.error("Error in writeEntries handler (detailed):", JSON.stringify(error, null, 2));

      // Include extra info in the response if you like
      return res.status(400).json({
        error: "Write operation error",
        details: error.message,
        schemaValidationDetails: error.errInfo?.details, // sometimes present for schema validation
      });
    }
  });
}
