/**
 * Generic handler to fetch file data from GitHub.
 */
export default async function handler(req, res) {
    const { filePath } = req.query; // Accept file path as a query parameter
    const repo = "PukekoKiwi/PicoTan"; // Replace with your repo
    const token = process.env.GITHUB_PAT; // Securely stored GitHub token
  
    if (!filePath) {
      return res.status(400).json({ error: "File path is required." });
    }
  
    const contentsUrl = `https://api.github.com/repos/${repo}/contents/${filePath}`;
  
    try {
      // Fetch the file metadata from GitHub
      const response = await fetch(contentsUrl, {
        headers: { Authorization: `token ${token}` },
      });
  
      if (!response.ok) {
        throw new Error(`Error fetching file. Status: ${response.status}`);
      }
  
      const fileData = await response.json();
  
      // Decode the Base64 content
      const decodedContent = new TextDecoder("utf-8").decode(
        Uint8Array.from(atob(fileData.content), (c) => c.charCodeAt(0))
      );
  
      res.status(200).json(JSON.parse(decodedContent)); // Send the JSON back to the client
    } catch (error) {
      console.error("Error fetching file:", error);
      res.status(500).json({ error: "Failed to fetch file from GitHub." });
    }
  }
  