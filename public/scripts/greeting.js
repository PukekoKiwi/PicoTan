/* ---------- 1. Greeting templates ---------- */

import { glitchText } from './helpers/glitchTextEffect.js';

/* ---------- greeting templates ---------- */
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

/* ---------- tiny JWT helper ---------- */
function parseJwt(t){
  try{
    const [,b]=t.split('.');                         // payload only
    return JSON.parse(atob(b.replace(/-/g,'+').replace(/_/g,'/')));
  }catch{return {};}
}

document.addEventListener('DOMContentLoaded', async () => {
  const bubble = document.getElementById('greeting-message');
  if (!bubble) return;

  /* build personalised message */
  const token = localStorage.getItem('picotan_jwt');
  let final   = '頑張って！';
  if (token) {
    const user = parseJwt(token).username ?? '';
    const name = user === 'Liam' ? '琉煌' : user;
    if (name) {
      final = greetings[Math.floor(Math.random() * greetings.length)]
              .replace('{username}', name);
    }
  }

  /* animate, then fade away */
  bubble.textContent = '';
  await glitchText(t => bubble.textContent = t, final);

  setTimeout(() => {
    bubble.style.transition = 'opacity .8s';
    bubble.style.opacity = 0;
    bubble.style.pointerEvents = 'none';
    bubble.style.userSelect = 'none';
  }, 3000);
});
