/**
 * auth.js
 * -------
 * Simple Express-style middleware used by the serverless endpoints to verify
 * JSON Web Tokens.  If a valid token is present the decoded payload is attached
 * to `req.user`.
 */

import jwt from "jsonwebtoken";

const SECRET_KEY = process.env.JWT_SECRET;

export function authenticate(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1]; // Expect "Bearer <token>"

  if (!token) {
    return res.status(401).json({ error: "Unauthorized: No token provided" });
  }

  if (!SECRET_KEY) {
    console.error("JWT secret key is not defined");
    return res
      .status(500)
      .json({ error: "Internal server error: missing secret key" });
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    req.user = decoded; // Attach user info to the request object
    next(); // Proceed to the next middleware or endpoint
  } catch (err) {
    res.status(403).json({ error: "Forbidden: Invalid token" });
  }
}
