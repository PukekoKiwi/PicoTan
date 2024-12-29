import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;

let client;
let clientPromise;

if (!global._mongoClientPromise) {
  client = new MongoClient(uri);
  global._mongoClientPromise = client.connect();
}
clientPromise = global._mongoClientPromise;

export default async (req, res) => {
  try {
    const client = await clientPromise;
    const db = client.db("picotan"); // Replace with your DB name
    const collection = db.collection("Kanji");

    // Example: Fetch all kanji from the database
    const kanji = await collection.find({}).toArray();
    res.status(200).json(kanji);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch data" });
  }
};
