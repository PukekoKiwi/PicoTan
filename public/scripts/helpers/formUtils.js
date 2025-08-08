/**
 * formUtils.js
 * ------------
 * Low-level helpers for creating and reading values from the dynamic forms
 * used throughout the admin interface.  These functions hide repetitive DOM
 * manipulation code and expose small utilities like `createTextField`,
 * `getArrayValues`, etc.
 */

import { getWordEntries, getKanjiEntries } from "./dbUtils.js";

// ---------------------------------------------------------------------------
// 1) DOM-Creation: Basic Fields
// ---------------------------------------------------------------------------
export function createTextField({ id, labelText, required = false, inputType = "text" }) {
    const wrapper = document.createElement("div");
    wrapper.classList.add("form-field");
  
    const label = document.createElement("label");
    label.textContent = labelText;
    label.setAttribute("for", id);
    label.classList.add("form-label");
    if (required) label.classList.add("required");
  
    const input = document.createElement("input");
    input.id = id;
    input.type = inputType;
    input.classList.add("form-input");
    if (required) input.required = true;
  
    wrapper.appendChild(label);
    wrapper.appendChild(input);
    return wrapper;
  }
  
  export function createArrayField({
    containerId,
    labelText,
    minItems = 0,
    placeholder = "",
    addButtonLabel = "追加",
    isRequiredArray = false,
  }) {
    const wrapper = document.createElement("div");
    wrapper.classList.add("form-field", "array-field-wrapper");
  
    const label = document.createElement("label");
    label.textContent = labelText;
    label.classList.add("form-label");
    if (isRequiredArray) label.classList.add("required");
    wrapper.appendChild(label);
  
    const container = document.createElement("div");
    container.id = containerId;
    container.classList.add("array-field-container");
    wrapper.appendChild(container);
  
    for (let i = 0; i < minItems; i++) {
      addInputRow(container, placeholder);
    }
  
    const addBtn = document.createElement("button");
    addBtn.type = "button";
    addBtn.classList.add("array-field-add-btn");
    addBtn.textContent = addButtonLabel;
    addBtn.addEventListener("click", () => addInputRow(container, placeholder));
    wrapper.appendChild(addBtn);
  
    return wrapper;
  }
  
  // Helper for createArrayField
  function addInputRow(container, placeholder) {
    const row = document.createElement("div");
    row.classList.add("array-field-row");
  
    const input = document.createElement("input");
    input.type = "text";
    input.placeholder = placeholder;
    input.classList.add("form-input");
    row.appendChild(input);
  
    const removeBtn = document.createElement("button");
    removeBtn.type = "button";
    removeBtn.textContent = "削除";
    removeBtn.classList.add("array-field-remove-btn");
    removeBtn.addEventListener("click", () => {
      container.removeChild(row);
    });
    row.appendChild(removeBtn);
  
    container.appendChild(row);
  }
  
  export function createObjectArrayField({
    containerId,
    labelText,
    addButtonLabel = "追加",
    minItems = 0,
    fields = [],
  }) {
    const wrapper = document.createElement("div");
    wrapper.classList.add("form-field", "object-array-field-wrapper");
  
    const label = document.createElement("label");
    label.textContent = labelText;
    label.classList.add("form-label");
    if (minItems > 0) label.classList.add("required");
    wrapper.appendChild(label);
  
    const container = document.createElement("div");
    container.id = containerId;
    container.classList.add("object-array-container");
    wrapper.appendChild(container);
  
    for (let i = 0; i < minItems; i++) {
      addObjectRow(container, fields);
    }
  
    const addBtn = document.createElement("button");
    addBtn.type = "button";
    addBtn.classList.add("object-array-add-btn");
    addBtn.textContent = addButtonLabel;
    addBtn.addEventListener("click", () => addObjectRow(container, fields));
    wrapper.appendChild(addBtn);
  
    return wrapper;
  }
  
  // Helper for createObjectArrayField
  function addObjectRow(container, fields) {
    const row = document.createElement("div");
    row.classList.add("object-array-row");
  
    fields.forEach((f) => {
      const fieldWrapper = document.createElement("div");
      fieldWrapper.classList.add("object-field");
  
      const subLabel = document.createElement("label");
      subLabel.textContent = f.label;
      subLabel.classList.add("object-field-label");
      if (f.required) subLabel.classList.add("required");
      fieldWrapper.appendChild(subLabel);
  
      const input = document.createElement("input");
      input.type = f.type || "text";
      input.placeholder = f.placeholder || "";
      input.classList.add("form-input");
      input.dataset.subid = f.subId; // store subId
      fieldWrapper.appendChild(input);
  
      row.appendChild(fieldWrapper);
    });
  
    const removeBtn = document.createElement("button");
    removeBtn.type = "button";
    removeBtn.textContent = "削除";
    removeBtn.classList.add("object-array-remove-btn");
    removeBtn.addEventListener("click", () => {
      container.removeChild(row);
    });
    row.appendChild(removeBtn);
  
    container.appendChild(row);
  }
  
  // 2) Special Fields: checkbox, radio, select
  export function createSingleCheckField({ containerId, labelText, value = "" }) {
    const wrapper = document.createElement("div");
    wrapper.classList.add("form-field", "single-check-field-wrapper");
  
    const label = document.createElement("label");
    label.textContent = labelText;
    label.classList.add("form-label");
    wrapper.appendChild(label);
  
    const container = document.createElement("div");
    container.id = containerId;
    container.classList.add("single-check-container");
    wrapper.appendChild(container);
  
    const cb = document.createElement("input");
    cb.type = "checkbox";
    cb.value = value;
    cb.id = `${containerId}_checkbox`;
    cb.classList.add("single-check-input");
  
    const cbLabel = document.createElement("label");
    cbLabel.setAttribute("for", cb.id);
    cbLabel.textContent = value;
  
    container.appendChild(cb);
    container.appendChild(cbLabel);
  
    return wrapper;
  }
  
  export function getSingleCheckValue(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return null;
    const cb = container.querySelector("input[type='checkbox']");
    return cb && cb.checked ? cb.value : null;
  }
  
  export function createRadioField({ containerId, labelText, name, options = [] }) {
    const wrapper = document.createElement("div");
    wrapper.classList.add("form-field", "radio-field-wrapper");
  
    const label = document.createElement("label");
    label.textContent = labelText;
    label.classList.add("form-label");
    wrapper.appendChild(label);
  
    const container = document.createElement("div");
    container.id = containerId;
    container.classList.add("radio-container");
    wrapper.appendChild(container);
  
    options.forEach((opt) => {
      const radioWrapper = document.createElement("div");
      radioWrapper.classList.add("radio-item");
  
      const rb = document.createElement("input");
      rb.type = "radio";
      rb.name = name;
      rb.value = opt;
      rb.id = `${containerId}_${opt}`;
      rb.classList.add("radio-input");
  
      const rbLabel = document.createElement("label");
      rbLabel.setAttribute("for", rb.id);
      rbLabel.textContent = opt;
  
      radioWrapper.appendChild(rb);
      radioWrapper.appendChild(rbLabel);
      container.appendChild(radioWrapper);
    });
  
    return wrapper;
  }
  
  export function getSelectedRadioValue(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return null;
    const checked = container.querySelector("input[type='radio']:checked");
    return checked ? checked.value : null;
  }
  
  export function createKankenSelectField({ id, labelText, required = false }) {
    const wrapper = document.createElement("div");
    wrapper.classList.add("form-field");
  
    const label = document.createElement("label");
    label.textContent = labelText;
    label.setAttribute("for", id);
    label.classList.add("form-label");
    if (required) label.classList.add("required");
  
    const select = document.createElement("select");
    select.id = id;
    select.classList.add("form-select");
    if (required) select.required = true;
  
    const levels = [
      { value: 10, label: "10級" },
      { value: 9, label: "9級" },
      { value: 8, label: "8級" },
      { value: 7, label: "7級" },
      { value: 6, label: "6級" },
      { value: 5, label: "5級" },
      { value: 4, label: "4級" },
      { value: 3, label: "3級" },
      { value: 2.5, label: "準2級" },
      { value: 2, label: "2級" },
      { value: 1.5, label: "準1級" },
      { value: 1, label: "1級" },
    ];
  
    levels.forEach((lvl) => {
      const option = document.createElement("option");
      option.value = lvl.value;
      option.textContent = lvl.label;
      select.appendChild(option);
    });
  
    wrapper.appendChild(label);
    wrapper.appendChild(select);
    return wrapper;
  }
  
  export function getSelectValue(id) {
    const sel = document.getElementById(id);
    if (!sel) return "0";
    return sel.value;
  }
  
  // 3) Getting Values from DOM
  export function getValue(selector) {
    const el = document.querySelector(selector);
    return el ? el.value.trim() : "";
  }
  
  export function getArrayValues(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return [];
    const inputs = container.querySelectorAll("input");
    const result = [];
    inputs.forEach((inp) => {
      const val = inp.value.trim();
      if (val) result.push(val);
    });
    return result;
  }
  
  export function getObjectArrayValues(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return [];
  
    const rows = container.querySelectorAll(".object-array-row");
    const results = [];
  
    rows.forEach((row) => {
      const inputs = row.querySelectorAll("input");
      const obj = {};
      inputs.forEach((inp) => {
        const key = inp.dataset.subid; 
        if (inp.type === "checkbox") {
          obj[key] = inp.checked ? "on" : "";
        } else {
          obj[key] = inp.value.trim();
        }
      });
      const hasData = Object.values(obj).some((v) => v);
      if (hasData) {
        results.push(obj);
      }
    });
  
    return results;
  }  

  /**
 * Return a set of unique kanji from a string.
 */
export function extractKanji(str = "") {
  // Match all characters in the main CJK range
  const matches = str.match(/[\u4E00-\u9FFF]/g);
  return new Set(matches || []);
}

/**
 * Takes an array of “dictionary forms” for words, queries the DB in one shot,
 * returns the *lowest* kanken level from the matched docs. If no docs found, returns `defaultLevel`.
 */
export async function getMinKankenLevelForWords(wordsArray, defaultLevel = 10) {
  if (!wordsArray.length) return defaultLevel;

  const docs = await getWordEntries(wordsArray);
  if (!docs.length) return defaultLevel;

  // doc.kanken_level might be a float (like 1.5). Safely handle missing docs.
  const minLevel = Math.min(
    ...docs.map((d) => d?.kanken_level ?? defaultLevel)
  );
  return minLevel;
}

/**
 * Takes an array of single-character kanji, queries the DB in one shot,
 * returns the *lowest* kanken level from the matched docs. If no docs found, returns `defaultLevel`.
 */
export async function getMinKankenLevelForKanji(kanjiArray, defaultLevel = 10) {
  if (!kanjiArray.length) return defaultLevel;

  const docs = await getKanjiEntries(kanjiArray);
  if (!docs.length) return defaultLevel;

  const minLevel = Math.min(
    ...docs.map((d) => d?.kanken_level ?? defaultLevel)
  );
  return minLevel;
}

/**
 * A generic function that merges the logic:
 *  - For a given set of words 
 *  - For a given set of kanji
 *  → Returns the overall minimum kanken level.
 */
export async function autoDetectKankenLevel(wordsArray, kanjiArray, defaultLevel = 10) {
  let result = defaultLevel;

  // 1) Word-based
  const minWordsLevel = await getMinKankenLevelForWords(wordsArray, defaultLevel);
  if (minWordsLevel < result) result = minWordsLevel;

  // 2) Kanji-based
  const minKanjiLevel = await getMinKankenLevelForKanji(kanjiArray, defaultLevel);
  if (minKanjiLevel < result) result = minKanjiLevel;

  return result;
}
