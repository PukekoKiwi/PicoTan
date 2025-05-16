/*-------------------------------------------------------------
  ui-glitch.js
  – attaches glitch behaviour to nav tool-tips and the
    login / logout menu label.
--------------------------------------------------------------*/

import { glitchText } from './helpers/glitchTextEffect.js';

document.addEventListener('DOMContentLoaded', () => {

  /* A. tool-tips on any .nav-btn that owns data-tooltip */
  document.querySelectorAll('.nav-btn[data-tooltip]').forEach(btn => {
    const original = btn.dataset.tooltip;
    let busy = false;
    btn.addEventListener('mouseenter', async () => {
      if (busy) return;
      busy = true;
      await glitchText(t => (btn.dataset.tooltip = t), original);
      busy = false;
    });
  });

  /* B. login  / logout label when account menu pops up */
  const menu      = document.getElementById('account-menu');
  const loginBtn  = document.getElementById('login-btn');
  const logoutBtn = document.getElementById('logout-btn');
  const acctBtn   = document.getElementById('nav-account-btn');

  acctBtn?.addEventListener('click', () => {
    requestAnimationFrame(async () => {           // after menu toggle
      const active =
        !menu?.classList.contains('hidden') &&
        (loginBtn?.offsetParent ? loginBtn :
         logoutBtn?.offsetParent ? logoutBtn : null);
      if (active) {
        const txt = active.textContent.trim();    // ログイン / ログアウト
        await glitchText(t => (active.textContent = t), txt, 3, 3);
      }
    });
  });
});
