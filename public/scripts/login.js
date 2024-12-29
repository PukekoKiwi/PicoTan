// Select form and message elements
const loginForm = document.querySelector("#loginForm");
const loginMessage = document.querySelector("#loginMessage");

// Handle form submission
loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  // Get form values
  const username = document.querySelector("#username").value.trim();
  const password = document.querySelector("#password").value.trim();

  try {
    // Send login request to the backend
    const response = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    // Parse the response
    const result = await response.json();

    if (response.ok) {
      // Save the token and display success message
      localStorage.setItem("picotan_jwt", result.token);
      displayMessage("ログイン成功！", "success");

      // Redirect to homepage after a short delay
      setTimeout(() => {
        window.location.href = "index.html";
      }, 1500);
    } else {
      // Show error message from backend
      displayMessage(result.error || "ログイン失敗", "error");
    }
  } catch (error) {
    console.error("Login error:", error);
    displayMessage("エラーが発生しました。", "error");
  }
});

// Utility function to display messages
const displayMessage = (message, type) => {
  loginMessage.textContent = message;
  loginMessage.style.color = type === "success" ? "green" : "red";
};
