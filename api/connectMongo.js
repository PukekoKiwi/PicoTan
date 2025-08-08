import { MongoClient, ServerApiVersion } from "mongodb";

// Use a global variable to persist the client between serverless invocations
let clientPromise;

/**
 * Connects to MongoDB and returns the database and client objects.
 * Ensures the client is reused in serverless environments.
 * Validates the presence of the connection string and gracefully
 * handles connection failures.
 *
 * @returns {Promise<{db: object, client: MongoClient}>}
 */
export default async function connectMongo() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI is not defined");
  }

  if (!clientPromise) {
    const client = new MongoClient(uri, {
      serverApi: {
        version: ServerApiVersion.v1,
        //strict: true,
        deprecationErrors: true,
      },
    });

    // Store the connection promise and reset it on failure so future
    // calls can retry a connection instead of using a rejected promise.
    clientPromise = client.connect().catch((err) => {
      clientPromise = undefined;
      throw err;
    });
  }

  const client = await clientPromise;
  const db = client.db("picotan"); // Access the "picotan" database
  return { db, client };
}
