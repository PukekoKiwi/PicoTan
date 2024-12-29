import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const SECRET_KEY = process.env.JWT_SECRET;
const USERS = JSON.parse(process.env.USERS || "[]");

export default async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { username, password } = req.body;

  // Find the user by username
  const user = USERS.find((u) => u.username === username);
  if (!user) {
    return res.status(401).json({ error: "Invalid username or password" });
  }

  // Verify the password
  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
  if (!isPasswordValid) {
    return res.status(401).json({ error: "Invalid username or password" });
  }

  // Generate a JWT
  const token = jwt.sign({ username: user.username }, SECRET_KEY, { expiresIn: "7d" });

  res.status(200).json({ token });
};
