// Picotan — Random page interactions
// Seamless with global palette: we update --accent and --accent-color when mode changes

// ---------- Palette hookup ----------
const css = getComputedStyle(document.documentElement);
const colorVars = {
  kanji:      { rgb: css.getPropertyValue('--kanji').trim(),      color: css.getPropertyValue('--kanji-color').trim() },
  word:       { rgb: css.getPropertyValue('--words').trim(),      color: css.getPropertyValue('--words-color').trim() },
  idiom:      { rgb: css.getPropertyValue('--yojijukugo').trim(), color: css.getPropertyValue('--yojijukugo-color').trim() },
  kotowaza:   { rgb: css.getPropertyValue('--kotowaza').trim(),   color: css.getPropertyValue('--kotowaza-color').trim() },
  sentences:  { rgb: css.getPropertyValue('--sentences').trim(),  color: css.getPropertyValue('--sentences-color').trim() },
};

function setAccent(mode){
  const c = colorVars[mode] || colorVars.kanji;
  document.documentElement.style.setProperty('--accent', c.rgb);
  document.documentElement.style.setProperty('--accent-color', c.color);
}

// ---------- Mode switch (five-box radios) ----------
const modeSelect = document.getElementById('random-type');
const modeSwitch  = document.getElementById('mode-switch');
const modeCursor  = document.getElementById('mode-cursor');

function moveCursorTo(label){
  if (!label) return;
  // use offsetLeft/offsetWidth for padding-safe, grid-safe positioning
  const x = label.offsetLeft;
  const w = label.offsetWidth;
  modeCursor.style.width = `${w}px`;
  modeCursor.style.transform = `translateX(${x}px)`;
}

function updateModeFromRadio(){
  const checked = modeSwitch.querySelector('input[type="radio"]:checked');
  if(!checked) return;

  const val = checked.value; // kanji | word | idiom | kotowaza | sentences
  modeSelect.value = val;
  modeSelect.dispatchEvent(new Event('change', { bubbles:true }));
  setAccent(val);

  const label = modeSwitch.querySelector(`label[for="${checked.id}"]`);
  moveCursorTo(label);
}

// Keyboard focusability for labels
modeSwitch.querySelectorAll('.mode-chip').forEach(label => {
  label.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    e.preventDefault();
    const id = label.getAttribute('for');
    const input = document.getElementById(id);
    if (input) { input.checked = true; input.dispatchEvent(new Event('change', {bubbles:true})); }
  });
});

modeSwitch.addEventListener('change', updateModeFromRadio);

// observe size changes (fonts, wrap resizing)
const modeResizeObs = new ResizeObserver(() => updateModeFromRadio());
modeResizeObs.observe(modeSwitch);
window.addEventListener('resize', updateModeFromRadio);
requestAnimationFrame(updateModeFromRadio); // initial paint

// ---------- Kanken HUD slider (reversed: 10 → … → 1 → 全) ----------
const levelSelect = document.getElementById('random-level');
const slider   = document.getElementById('level-range');
const marks    = document.getElementById('marks');
const meter    = document.getElementById('meter');
const bubble   = document.getElementById('bubble');
const readout  = document.getElementById('level-readout');
const wrap     = document.getElementById('rangeWrap');

// reversed order: 10 → 9 → ... → 1 → all
const LEVELS = [
  { val:'10',  label:'十' },
  { val:'9',   label:'九' },
  { val:'8',   label:'八' },
  { val:'7',   label:'七' },
  { val:'6',   label:'六' },
  { val:'5',   label:'五' },
  { val:'4',   label:'四' },
  { val:'3',   label:'三' },
  { val:'2.5', label:'準二' },
  { val:'2',   label:'二' },
  { val:'1.5', label:'準一' },
  { val:'1',   label:'一' },
  { val:'all', label:'全' },
];

// ticks & meter
LEVELS.forEach((_m,i)=>{
  const li  = document.createElement('li'); li.textContent = LEVELS[i].label; li.id = `mark-${i}`; marks.appendChild(li);
  meter.appendChild(document.createElement('span'));
});

// prevent recursion when syncing <select> programmatically
let isInternalLevelChange = false;

function positionBubble(){
  const i = Number(slider.value);
  const ratio = i / (LEVELS.length - 1); // 0..1
  const thumbW = 28;                     // must match CSS thumb size
  // robust, padding-safe bubble X
  const x = slider.offsetLeft + (ratio * (slider.clientWidth - thumbW)) + (thumbW / 2);
  wrap.style.setProperty('--bubble-x', `${x}px`);
  wrap.style.setProperty('--pct', `${ratio * 100}%`);
}

function syncFromIndex(i, announce = false, emitChange = true){
  i = Math.max(0, Math.min(LEVELS.length - 1, i));

  slider.value = i;
  slider.setAttribute('aria-valuenow', String(i));

  const nextVal = LEVELS[i].val;
  if (emitChange) {
    isInternalLevelChange = true;
    levelSelect.value = nextVal;
    levelSelect.dispatchEvent(new Event('change', { bubbles: true }));
    isInternalLevelChange = false;
  } else {
    levelSelect.value = nextVal;
  }

  const label = LEVELS[i].label;
  bubble.textContent  = label;
  readout.textContent = label;

  marks.querySelectorAll('li').forEach((el, idx)=> el.classList.toggle('active', idx === i));
  meter.querySelectorAll('span').forEach((el, idx)=> el.classList.toggle('on', idx <= i));

  positionBubble();
  if (announce) bubble.setAttribute('aria-live','polite');
}

// init from select; avoid firing change
const initIndex = Math.max(0, LEVELS.findIndex(m => m.val === levelSelect.value));
slider.value = String(initIndex < 0 ? 0 : initIndex);
requestAnimationFrame(() => syncFromIndex(Number(slider.value), false, false));

slider.addEventListener('input', () => { syncFromIndex(Number(slider.value), true); });
slider.addEventListener('keydown', (e)=>{
  if(e.key === 'Home'){ e.preventDefault(); syncFromIndex(0, true); }
  if(e.key === 'End'){  e.preventDefault(); syncFromIndex(LEVELS.length-1, true); }
});

// resize-safe positioning
const sliderResizeObs = new ResizeObserver(positionBubble);
sliderResizeObs.observe(wrap);
sliderResizeObs.observe(slider);
window.addEventListener('resize', positionBubble);

// reflect external changes to the hidden <select>
levelSelect.addEventListener('change', () => {
  if (isInternalLevelChange) return;
  const i = LEVELS.findIndex(m => m.val === levelSelect.value);
  syncFromIndex(i, false, false);
});

// ---------- Primary action ----------
const randomBtn = document.getElementById('random-btn');
randomBtn.addEventListener('click', ()=>{
  const payload = { type: modeSelect.value, level: levelSelect.value };
  console.log('[PICOTAN] おまかせ trigger:', payload);
});
