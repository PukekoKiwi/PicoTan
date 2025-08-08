/**
 * login.js
 * --------
 * API endpoint that verifies a username/password pair and returns a JSON Web
 * Token.  User records are provided via environment variables so that this
 * example can run without an external database.
 */

import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const SECRET_KEY = process.env.JWT_SECRET;
const USERS = JSON.parse(process.env.USERS || "[]");

export default async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { username, password } = req.body;

  // Find the user record by username
  const user = USERS.find((u) => u.username === username);
  if (!user) {
    return res.status(401).json({ error: "Invalid username or password" });
  }

  // Compare the submitted password with the stored hash
  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
  if (!isPasswordValid) {
    return res.status(401).json({ error: "Invalid username or password" });
  }

  // Generate a JWT that expires in roughly three months
  const token = jwt.sign({ username: user.username }, SECRET_KEY, { expiresIn: "90d" });

  res.status(200).json({ token });
};
