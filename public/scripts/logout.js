// Wait for the DOM to fully load
document.addEventListener("DOMContentLoaded", () => {
    const logoutItem = document.querySelector(".navigation__item--logout"); // Target the list item
    const logoutButton = document.querySelector("#logoutButton"); // Target the logout button inside the list item
  
    // Check if the user is logged in (JWT exists)
    const token = localStorage.getItem("picotan_jwt");
  
    // Show the logout list item only if the token exists
    if (token && logoutItem) {
      logoutItem.style.display = "block"; // Reset to default display (e.g., block or inline-block)
    } else if (logoutItem) {
      logoutItem.style.display = "none"; // Ensure it's hidden if no token
    }
  
    // If the logout button exists, attach a click event listener
    if (logoutButton) {
      logoutButton.addEventListener("click", (event) => {
        event.preventDefault(); // Prevent default link behavior
  
        // Change button text to "ログアウト中..."
        logoutButton.textContent = "ログアウト中...";
        logoutButton.style.pointerEvents = "none"; // Disable further clicks
        logoutButton.style.opacity = "0.6"; // Visual feedback
  
        // Remove the JWT from localStorage
        localStorage.removeItem("picotan_jwt");

        // Redirect to the login page after a short delay
        setTimeout(() => {
            window.location.href = "login.html";
        }, 200);
      });
    }
  });
  