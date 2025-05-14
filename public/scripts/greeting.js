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
  
/**
 * Decode JWT payload.
 */
function parseJwt(token) {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const json = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(json);
    } catch {
      return {};
    }
  }
  
  document.addEventListener('DOMContentLoaded', () => {
    const bubble = document.getElementById('greeting-message');
    if (!bubble) return;
  
    const token = localStorage.getItem('picotan_jwt');
    if (!token) {
      bubble.textContent = '頑張って！';
      return;
    }
  
    const decoded = parseJwt(token);
    const rawName = decoded?.username;
    if (!rawName) {
      bubble.textContent = '頑張って！';
      return;
    }
  
    // Just for fun: replace 'Liam' with '琉煌', my Japanese name
    const username = rawName === 'Liam' ? '琉煌' : rawName;
  
    // Pick a random template and inject the (possibly replaced) username
    const template = greetings[
      Math.floor(Math.random() * greetings.length)
    ];
    bubble.textContent = template.replace('{username}', username);
  });