document.addEventListener("DOMContentLoaded", () => {
  handleExpiredToken(); // Check for expired token on page load

  const logoutItem = document.querySelector(".navigation__item--logout");
  const logoutButton = document.querySelector("#logoutButton");

  // Show or hide logout item based on token existence
  const token = localStorage.getItem("picotan_jwt");
  if (token && logoutItem) {
    logoutItem.style.display = "block";
  } else if (logoutItem) {
    logoutItem.style.display = "none";
  }

  // Attach logout functionality
  if (logoutButton) {
    logoutButton.addEventListener("click", (event) => {
      event.preventDefault();
      logoutButton.textContent = "ログアウト中...";
      logoutButton.style.pointerEvents = "none";
      logoutButton.style.opacity = "0.6";
      localStorage.removeItem("picotan_jwt");
      setTimeout(() => {
        window.location.href = "login.html";
      }, 200);
    });
  }
});

// Log the user out if the token is expired
function handleExpiredToken() {
  const token = localStorage.getItem("picotan_jwt");
  if (token && isTokenExpired(token)) {
    console.log("Token expired. Logging out...");
    localStorage.removeItem("picotan_jwt");
    window.location.href = "login.html"; // Redirect to login page
  }
}

function isTokenExpired(token) {
  try {
    const payload = JSON.parse(atob(token.split(".")[1])); // Decode the payload
    const expirationTime = payload.exp * 1000; // Convert exp to milliseconds
    return Date.now() > expirationTime; // Compare with the current time
  } catch (e) {
    console.error("Error decoding token:", e);
    return true; // Assume expired if decoding fails
  }
}