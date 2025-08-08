/* ──────────────────────────────────────────────────────────
   LOGIN PAGE SCRIPT  –  cyber-terminal style
───────────────────────────────────────────────────────────*/

// ── 1. DOM references ────────────────────────────────────
const loginForm     = document.querySelector("#loginForm");
const loginMessage  = document.querySelector("#loginMessage");
const usernameInput = document.querySelector("#username");
const passwordInput = document.querySelector("#password");

// ── 2. ASCII-spinner factory  ────────────────────────────
function makeSpinner(el, prefix = "> 接続中 ") {
  const frames = ["-", "\\", "|", "/"];      // (escape the back-slash)
  let i = 0;
  const id = setInterval(() => {
    el.textContent = prefix + frames[i++ % frames.length];
  }, 120);                                   // ≈ 8 fps
  return () => clearInterval(id);            // returns stop() handle
}

// ── 3. Initialize idle prompt ────────────────────────────
loginMessage.textContent = "> 待機中";
loginMessage.classList.add("idle");          // blinking cursor via CSS

// ── 4. Form submit handler ───────────────────────────────
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
