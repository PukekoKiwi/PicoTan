// Array of possible greetings
const greetings = [
    "ようこそ、{username}さん。今日も精進を。",
    "ようこそ、{username}さん。大禁忌は作輟なり。",
    "ようこそ、{username}さん。日進月歩。",
    "ようこそ、{username}さん。切磋琢磨。",
    "ようこそ、{username}さん。磨穿鉄硯。",
    "ようこそ、{username}さん。雨垂れ石を穿つ。",
    "ようこそ、{username}さん。石の上にも三年。",
    "ようこそ、{username}さん。千里の道も一歩から。",
    "ようこそ、{username}さん。最善を尽くしましょう。",
    "ようこそ、{username}さん。学問に王道なし。",
    "ようこそ、{username}さん。倦まず撓まず。",
    "ようこそ、{username}さん。目標に邁進。"
];
  
// Select the greeting message element
const greetingMessage = document.querySelector("#greetingMessage");
  
// Check if the user is logged in and display a greeting
const token = localStorage.getItem("picotan_jwt");
if (token) {
    const decoded = parseJwt(token); // Decode the token to get user info
    if (decoded?.username) {
        // Pick a random greeting
        const randomGreeting = greetings[Math.floor(Math.random() * greetings.length)];
      
        // Replace the placeholder with the username
        const personalizedGreeting = randomGreeting.replace(
            "{username}",
            decoded.username
        );
      
        // Display the greeting
        greetingMessage.textContent = personalizedGreeting;
        greetingMessage.style.display = "block"; // Ensure the greeting is visible
    }
}
  
// Utility function to decode JWT
function parseJwt(token) {
    try {
        const base64Url = token.split(".")[1];
        const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
        const jsonPayload = decodeURIComponent(
            atob(base64)
            .split("")
            .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
            .join("")
        );
        return JSON.parse(jsonPayload);
    } catch (e) {
        console.error("Failed to parse token:", e);
        return null;
    }
}
  