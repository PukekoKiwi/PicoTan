/**
 * uiGlitch.js
 * ------------
 * Small visual flourish for the cyber‑style interface.  When the user hovers
 * navigation buttons or opens the account menu, the text briefly "glitches" in
 * a pseudo terminal fashion.  This file merely wires DOM events to the
 * `glitchText` helper.
 */

import { glitchText } from './helpers/glitchTextEffect.js';

document.addEventListener('DOMContentLoaded', () => {
  // A. Tool‑tips on any navigation button that has a data-tooltip attribute.
  //    The text content is swapped out letter by letter via glitchText.
  document.querySelectorAll('.nav-btn[data-tooltip]').forEach(btn => {
    const original = btn.dataset.tooltip;
    let busy = false;
    btn.addEventListener('mouseenter', async () => {
      if (busy) return;          // avoid overlapping animations
      busy = true;
      await glitchText(t => (btn.dataset.tooltip = t), original);
      busy = false;
    });
  });

  // B. Login / logout label when the account menu pops up.  After toggling
  //    the menu we glitch whichever label is currently visible.
  const menu      = document.getElementById('account-menu');
  const loginBtn  = document.getElementById('login-btn');
  const logoutBtn = document.getElementById('logout-btn');
  const acctBtn   = document.getElementById('nav-account-btn');

  acctBtn?.addEventListener('click', () => {
    requestAnimationFrame(async () => {           // wait until menu visibility updates
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
