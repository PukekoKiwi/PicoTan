import { MongoClient, ServerApiVersion } from "mongodb";

const uri = process.env.MONGODB_URI;

// Create a MongoClient
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

export default async (req, res) => {
  const { collectionName } = req.query; // Extract collection name from query

  if (!collectionName) {
    return res.status(400).json({ error: "Please provide a collection name in the query parameter." });
  }

  try {
    // Connect to MongoDB
    await client.connect();
    const db = client.db("picotan");
    const collection = db.collection(collectionName);

    if (req.method === "GET") {
      // Handle GET requests (fetch all documents)
      const data = await collection.find({}).toArray();
      res.status(200).json({ message: `Fetched data from ${collectionName}`, data });
    } else if (req.method === "POST") {
      // Handle POST requests (add new entry)
      const newEntry = req.body; // Data from the POST request
      if (!newEntry) {
        return res.status(400).json({ error: "Please provide entry data in the request body." });
      }

      const result = await collection.insertOne(newEntry);
      res.status(201).json({ message: "Entry added successfully", insertedId: result.insertedId });
    } else {
      res.status(405).json({ error: "Method not allowed" });
    }
  } catch (error) {
    console.error("Error processing request:", error);
    res.status(500).json({ error: "Internal server error", details: error.message });
  } finally {
    await client.close();
  }
};
