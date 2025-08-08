/**
 * login.js
 * ---------
 * Behaviour for the login page. The script reads the username and password
 * from the form, sends them to the server, and shows a "terminal" style
 * status message while waiting for the response.  No business logic lives
 * here—only small helpers to keep the interface responsive and friendly for
 * newcomers.
 */

// ---------------------------------------------------------------------------
// 1. DOM references
//    Cache elements that we need more than once.  Grabbing them up front keeps
//    event handlers simple and avoids repeated document look‑ups.
// ---------------------------------------------------------------------------
const loginForm     = document.querySelector("#loginForm");
const loginMessage  = document.querySelector("#loginMessage");
const usernameInput = document.querySelector("#username");
const passwordInput = document.querySelector("#password");

// ---------------------------------------------------------------------------
// 2. ASCII-spinner factory
//    Displays a little rotating glyph while the network request is pending.
//    The function returns a `stop()` callback so the caller can easily halt
//    the spinner once the request finishes.
// ---------------------------------------------------------------------------
function makeSpinner(el, prefix = "> 接続中 ") {
  const frames = ["-", "\\", "|", "/"]; // characters for the spinner
  let i = 0;
  const id = setInterval(() => {
    el.textContent = prefix + frames[i++ % frames.length];
  }, 120); // roughly 8 frames per second
  return () => clearInterval(id); // give back a handle to stop the spinner
}

// ---------------------------------------------------------------------------
// 3. Initial idle prompt
//    Show the user that the page is ready and waiting for input.  CSS supplies
//    the blinking cursor effect via the "idle" class.
// ---------------------------------------------------------------------------
loginMessage.textContent = "> 待機中";
loginMessage.classList.add("idle");          // blinking cursor via CSS

// ---------------------------------------------------------------------------
// 4. Form submit handler
//    Prevent the default form submission, show the spinner, send the
//    credentials to the server and handle the JSON response.  Everything is
//    wrapped in a try/catch to keep the UI consistent even on network errors.
// ---------------------------------------------------------------------------
loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  /* 4-1 → switch to “busy” spinner */
  loginMessage.classList.remove("idle");
  const stopSpinner = makeSpinner(loginMessage);

  /* 4-2 → collect creds */
  const username = usernameInput.value.trim();
  const password = passwordInput.value.trim();

  try {
    /* 4-3 → POST to backend */
    const res  = await fetch("/api/login", {
      method : "POST",
      headers: { "Content-Type": "application/json" },
      body   : JSON.stringify({ username, password })
    });
    const data = await res.json();

    /* 4-4 → stop spinner & show outcome */
    stopSpinner();

    if (res.ok) {
      localStorage.setItem("picotan_jwt", data.token);
      loginMessage.textContent = "> ログイン成功―転送中…";
      loginMessage.style.color = "var(--radicals-color)";

      setTimeout(() => (window.location.href = "index.html"), 300);

    } else {
      loginMessage.textContent = `> エラー: ${data.error || "ログイン失敗"}`;
      loginMessage.style.color = "var(--sentences-color)";
    }
  } catch (err) {
    console.error("Login error:", err);
    stopSpinner();
    loginMessage.textContent = "> ネットワークエラー";
    loginMessage.style.color = "var(--sentences-color)";
  } finally {
    /* 4-5 → after a pause, revert to idle prompt */
    setTimeout(() => {
      loginMessage.textContent = "> 待機中";
      loginMessage.style.color = "var(--radicals-color)";
      loginMessage.classList.add("idle");
    }, 4000);
  }
});
