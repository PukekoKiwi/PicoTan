import { MongoClient, ServerApiVersion } from "mongodb";

const uri = process.env.MONGODB_URI;

// Use a global variable to persist the client between serverless invocations
let clientPromise;

/**
 * Connects to MongoDB and returns the database and client objects.
 * Ensures the client is reused in serverless environments.
 * @returns {Promise<{db: object, client: MongoClient}>}
 */
export default async function connectMongo() {
  if (!clientPromise) {
    const client = new MongoClient(uri, {
      serverApi: {
        version: ServerApiVersion.v1,
        //strict: true,
        deprecationErrors: true,
      },
    });
    clientPromise = client.connect(); // Save the promise for the client
  }

  const client = await clientPromise;
  const db = client.db("picotan"); // Access the "picotan" database
  return { db, client };
}
