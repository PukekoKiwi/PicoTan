/**
 * Builds bracket notation for a list of segments, e.g.:
 *   [漢](かん)[字](じ)
 */
export function buildFuriganaString(segments) {
    return segments
      .map((seg) => {
        if (seg.isKanji && seg.furigana) {
          return `[${seg.text}](${seg.furigana})`;
        }
        return seg.text;
      })
      .join("");
  }
  
  /**
   * Splits a string into segments: each Kanji is a separate segment,
   * everything else is lumped as one segment (until next Kanji).
   */
  export function parseIntoSegments(baseText) {
    const segments = [];
    let currentRun = "";
    let currentIsKanji = null;
  
    for (let i = 0; i < baseText.length; i++) {
      const char = baseText[i];
      const charIsKanji = isKanji(char);
  
      if (currentIsKanji === null) {
        currentRun = char;
        currentIsKanji = charIsKanji;
        continue;
      }
  
      if (charIsKanji === currentIsKanji) {
        currentRun += char;
      } else {
        segments.push({ text: currentRun, furigana: "", isKanji: currentIsKanji });
        currentRun = char;
        currentIsKanji = charIsKanji;
      }
    }
    if (currentRun) {
      segments.push({ text: currentRun, furigana: "", isKanji: currentIsKanji });
    }
  
    // For any multi-Kanji segments, break them further into single chars
    const final = [];
    for (const seg of segments) {
      if (seg.isKanji && seg.text.length > 1) {
        for (const c of seg.text) {
          final.push({ text: c, furigana: "", isKanji: true });
        }
      } else {
        final.push(seg);
      }
    }
    return final;
  }
  
  /** Simple check: is this char a Kanji codepoint in the CJK range? */
  export function isKanji(char) {
    const code = char.charCodeAt(0);
    return code >= 0x4E00 && code <= 0x9FFF;
  }
  
  /**
   * Re-renders the segment container. Called whenever we “merge” or “split”.
   */
  export function reRenderFuriganaSegments(container, segments) {
    container.innerHTML = "";
    segments.forEach((seg, i) => {
      const segDiv = document.createElement("div");
      segDiv.classList.add("furigana-segment");
  
      // If Kanji => create input for furigana
      if (seg.isKanji) {
        const furiganaInput = document.createElement("input");
        furiganaInput.classList.add("furigana-segment-input");
        furiganaInput.type = "text";
        furiganaInput.value = seg.furigana || "";
        furiganaInput.addEventListener("input", () => {
          seg.furigana = furiganaInput.value;
        });
        segDiv.appendChild(furiganaInput);
      }
  
      // Base text
      const textDiv = document.createElement("div");
      textDiv.classList.add("furigana-segment-text");
      textDiv.textContent = seg.text;
      segDiv.appendChild(textDiv);
  
      // Possibly show merge button
      if (seg.isKanji && i < segments.length - 1 && segments[i + 1].isKanji) {
        const mergeBtn = document.createElement("button");
        mergeBtn.type = "button";
        mergeBtn.classList.add("furigana-segment-merge-btn");
        mergeBtn.textContent = "Merge →";
        mergeBtn.addEventListener("click", () => {
          const nextSeg = segments[i + 1];
          seg.text += nextSeg.text;
          seg.furigana += nextSeg.furigana;
          segments.splice(i + 1, 1);
          reRenderFuriganaSegments(container, segments);
        });
        segDiv.appendChild(mergeBtn);
      }
  
      // Possibly show split button
      if (seg.isKanji && seg.text.length > 1) {
        const splitBtn = document.createElement("button");
        splitBtn.type = "button";
        splitBtn.classList.add("furigana-segment-split-btn");
        splitBtn.textContent = "Split";
        splitBtn.addEventListener("click", () => {
          const firstChar = seg.text[0];
          const rest = seg.text.slice(1);
          const firstFuri = seg.furigana.slice(0, 1);
          const restFuri = seg.furigana.slice(1);
  
          segments[i] = { text: firstChar, furigana: firstFuri, isKanji: true };
          segments.splice(i + 1, 0, { text: rest, furigana: restFuri, isKanji: true });
          reRenderFuriganaSegments(container, segments);
        });
        segDiv.appendChild(splitBtn);
      }
  
      container.appendChild(segDiv);
    });
  }
  
  /**
   * Creates the entire DOM for a single “furigana field”.
   *  - internal array of segments
   *  - a container that displays merges/splits
   *  - a method to set the base text, etc.
   */
  export function createFuriganaField({ id, labelText, required = false }) {
    const wrapper = document.createElement("div");
    wrapper.classList.add("furigana-field-wrapper");
    wrapper.id = id;
  
    const segmentContainer = document.createElement("div");
    segmentContainer.classList.add("furigana-segment-container");
    wrapper.appendChild(segmentContainer);
  
    let segments = [];
  
    // Called whenever you want to (re)parse the base text
    function setBaseText(newBase) {
      if (!newBase) {
        segments = [];
        segmentContainer.innerHTML = "";
        return;
      }
      segments = parseIntoSegments(newBase);
      reRenderFuriganaSegments(segmentContainer, segments);
    }
  
    // Expose a small API on the wrapper
    wrapper._furiganaFieldObject = {
      getSegments: () => segments,
      setBaseText,
    };
  
    return wrapper;
  }

// In furiganaUtils.js (or wherever you define createFuriganaArrayField)
export function createFuriganaArrayField({
    containerId,
    labelText,
    minItems = 0,
    baseInputId = null, // <--- NEW optional param
  }) {
    const wrapper = document.createElement("div");
    wrapper.classList.add("form-field", "furigana-array-field-wrapper");
  
    const label = document.createElement("label");
    label.textContent = labelText;
    label.classList.add("form-label");
    if (minItems > 0) label.classList.add("required");
    wrapper.appendChild(label);
  
    // This container holds all furigana lines
    const container = document.createElement("div");
    container.id = containerId;
    container.classList.add("furigana-array-container");
    wrapper.appendChild(container);
  
    // Initialize with minItems lines
    for (let i = 0; i < minItems; i++) {
      addFuriganaLine(container, baseInputId);
    }
  
    // Button to add additional reading lines
    const addBtn = document.createElement("button");
    addBtn.type = "button";
    addBtn.textContent = "読みを追加";
    addBtn.classList.add("furigana-array-add-btn");
    addBtn.addEventListener("click", () => {
      addFuriganaLine(container, baseInputId);
    });
    wrapper.appendChild(addBtn);
  
    return wrapper;
  }
  
  /**
   * Helper function to add a single “furigana line”.
   * After creating the line, we optionally auto-populate the base text 
   * from the main input (if `baseInputId` is provided).
   */
  function addFuriganaLine(container, baseInputId) {
    const lineDiv = document.createElement("div");
    lineDiv.classList.add("furigana-line");
  
    // 1) Create the furigana field
    const furiganaId = `furigana_line_${Math.random().toString(16).slice(2)}`;
    const furiganaField = createFuriganaField({
      id: furiganaId,
      labelText: "",
      required: false,
    });
    lineDiv.appendChild(furiganaField);
  
    // 2) Auto-populate if we have a valid baseInputId
    if (baseInputId) {
      const mainInput = document.getElementById(baseInputId);
      if (mainInput && mainInput.value.trim()) {
        furiganaField._furiganaFieldObject.setBaseText(mainInput.value.trim());
      }
    }
  
    // 3) A remove button
    const removeBtn = document.createElement("button");
    removeBtn.type = "button";
    removeBtn.textContent = "削除";
    removeBtn.classList.add("furigana-array-remove-btn");
    removeBtn.addEventListener("click", () => {
      container.removeChild(lineDiv);
    });
    lineDiv.appendChild(removeBtn);
  
    container.appendChild(lineDiv);
    return lineDiv;
  }  
  
  /**
   * Build an array of { base, bracketed } from all furigana lines in a container.
   * Each line is a `.furigana-field-wrapper` with `_furiganaFieldObject`.
   */
  export function getFuriganaArrayValues(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return [];
  
    const lines = container.querySelectorAll(".furigana-line");
    const results = [];
  
    lines.forEach((line) => {
      const furiDiv = line.querySelector(".furigana-field-wrapper");
      if (!furiDiv || !furiDiv._furiganaFieldObject) return;
      const segments = furiDiv._furiganaFieldObject.getSegments();
      if (!segments.length) return;
  
      const base = segments.map((s) => s.text).join("");
      const bracketed = buildFuriganaString(segments);
      results.push({ base, bracketed });
    });
  
    return results;
  }
  