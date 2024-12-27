export default async function handler(req, res) {
    const { filePath, newContent, commitMessage } = req.body;
    const repo = "PukekoKiwi/PicoTan";
    const token = process.env.GITHUB_PAT;
  
    if (!filePath || !newContent) {
        return res.status(400).json({ error: "File path and content are required." });
    }

    const contentsUrl = `https://api.github.com/repos/${repo}/contents/${filePath}`;

    try {
        // Fetch the current file metadata to get the SHA
        const response = await fetch(contentsUrl, {
            headers: { Authorization: `token ${token}` },
        });

        if (!response.ok) {
            throw new Error(`Error fetching file metadata. Status: ${response.status}`);
        }

        const fileData = await response.json();
        const sha = fileData.sha; // Required for updates

        // Encode the new content to Base64
        const encodedContent = btoa(
            String.fromCharCode(...new TextEncoder().encode(JSON.stringify(newContent, null, 2)))
        );

        // Send the update request to GitHub
        const updateResponse = await fetch(contentsUrl, {
            method: "PUT",
            headers: {
                Authorization: `token ${token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                message: commitMessage || `Update file: ${filePath}`, // Use custom commit message
                content: encodedContent,
                sha,
            }),
        });

        if (!updateResponse.ok) {
            throw new Error(`Error updating file. Status: ${updateResponse.status}`);
        }

        res.status(200).json({ message: "File updated successfully!" });
    } catch (error) {
        console.error("Error writing to file:", error);
        res.status(500).json({ error: "Failed to update file on GitHub." });
    }
}
