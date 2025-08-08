/**
 * formRenders.js
 * --------------
 * Collection of functions that dynamically build the various entry forms used
 * by the admin interface.  Each `renderXForm` function receives a container
 * element and appends the necessary input fields using helpers from
 * `formUtils` and `furiganaUtils`.
 */

import TinySegmenter from "../../libs/tiny-segmenter.js";
import { getObjectArrayValues, getValue, getMinKankenLevelForKanji, autoDetectKankenLevel, extractKanji } from "./formUtils.js";

import {
    createTextField,
    createArrayField,
    createObjectArrayField,
    createSingleCheckField,
    createRadioField,
    createKankenSelectField,
  } from "./formUtils.js";
  
  import {
    createFuriganaField,
    createFuriganaArrayField,
  } from "./furiganaUtils.js";
  
  /**
   * Renders the form for adding a Radical entry.
   * @param {HTMLElement} entryFieldsContainer - The container in which to append fields.
   */
  export function renderRadicalForm(entryFieldsContainer) {
    entryFieldsContainer.appendChild(
      createTextField({
        id: "character",
        labelText: "部首（必須）",
        required: true,
        inputType: "text",
      })
    );
  
    entryFieldsContainer.appendChild(
      createTextField({
        id: "stroke_count",
        labelText: "画数（必須）",
        required: true,
        inputType: "number",
      })
    );
  
    entryFieldsContainer.appendChild(
      createArrayField({
        containerId: "names-container",
        labelText: "名称（必須）",
        minItems: 1,
        placeholder: "名称を入力",
        addButtonLabel: "名称を追加",
        isRequiredArray: true,
      })
    );
  
    entryFieldsContainer.appendChild(
      createArrayField({
        containerId: "alternates-container",
        labelText: "別形（任意）",
        minItems: 0,
        placeholder: "別形を入力",
        addButtonLabel: "別形を追加",
        isRequiredArray: false,
      })
    );
  
    entryFieldsContainer.appendChild(
      createTextField({
        id: "meaning_jp",
        labelText: "意味 (日本語, 必須)",
        required: true,
        inputType: "text",
      })
    );
  
    entryFieldsContainer.appendChild(
      createTextField({
        id: "meaning_en",
        labelText: "意味 (英語, 必須)",
        required: true,
        inputType: "text",
      })
    );
  }
  
  /**
   * Renders the form for adding a Kanji entry.
   * @param {HTMLElement} entryFieldsContainer
   */
  export function renderKanjiForm(entryFieldsContainer) {
    // Base fields
    entryFieldsContainer.appendChild(
      createTextField({
        id: "kanji_character",
        labelText: "漢字（必須）",
        required: true,
        inputType: "text",
      })
    );
  
    entryFieldsContainer.appendChild(
      createObjectArrayField({
        containerId: "kanji_alternate_forms",
        labelText: "異体字（任意）",
        addButtonLabel: "異体字を追加",
        minItems: 0,
        fields: [
          { subId: "character", label: "文字", placeholder: "漢", required: false },
          { subId: "type", label: "種類", placeholder: "旧字体 等", required: false },
        ],
      })
    );
  
    entryFieldsContainer.appendChild(
      createTextField({
        id: "kanji_radical",
        labelText: "部首（必須）",
        required: true,
        inputType: "text",
      })
    );
  
    entryFieldsContainer.appendChild(
      createTextField({
        id: "kanji_stroke_count",
        labelText: "画数（必須）",
        required: true,
        inputType: "number",
      })
    );
  
    // On Readings
    entryFieldsContainer.appendChild(
      createObjectArrayField({
        containerId: "kanji_on_readings",
        labelText: "音読み（複数可）",
        addButtonLabel: "音読みを追加",
        minItems: 0,
        fields: [
          { subId: "reading", label: "読み方", placeholder: "カン", required: false },
          {
            subId: "isHyougai",
            label: "表外？",
            type: "checkbox",
            required: false,
          },
        ],
      })
    );
  
    // Kun Readings
    entryFieldsContainer.appendChild(
      createObjectArrayField({
        containerId: "kanji_kun_readings",
        labelText: "訓読み（複数可）",
        addButtonLabel: "訓読みを追加",
        minItems: 0,
        fields: [
          { subId: "reading", label: "読み方", placeholder: "おとこ", required: false },
          { subId: "okurigana", label: "送り仮名", placeholder: "う", required: false },
          {
            subId: "isHyougai",
            label: "表外？",
            type: "checkbox",
            required: false,
          },
        ],
      })
    );
  
    // Meanings
    entryFieldsContainer.appendChild(
      createObjectArrayField({
        containerId: "kanji_meanings",
        labelText: "意味（必須, 日本語・英語）",
        addButtonLabel: "意味を追加",
        minItems: 1,
        fields: [
          { subId: "japanese", label: "日本語 (必須)", placeholder: "中国の～", required: true },
          { subId: "english", label: "英語 (必須)", placeholder: "A river in China...", required: true },
        ],
      })
    );
  
    // Kanken level
    entryFieldsContainer.appendChild(
      createKankenSelectField({
        id: "kanji_kanken_level",
        labelText: "漢検級（必須）",
        required: true,
      })
    );
  
    // Categories => single checkbox + radio example
    entryFieldsContainer.appendChild(
      createSingleCheckField({
        containerId: "kanji_is_jouyou",
        labelText: "常用漢字？",
        value: "常用漢字",
      })
    );
  
    entryFieldsContainer.appendChild(
      createRadioField({
        containerId: "kanji_water_level",
        labelText: "水準（任意）",
        name: "waterLevel",
        options: ["第１水準", "第２水準", "第３水準"],
      })
    );
  
    // References
    entryFieldsContainer.appendChild(
      createObjectArrayField({
        containerId: "kanji_references",
        labelText: "参考（任意, 複数可）",
        addButtonLabel: "参考を追加",
        minItems: 0,
        fields: [
          { subId: "source", label: "ソース", placeholder: "漢字辞典オンライン", required: false },
          { subId: "url", label: "URL", placeholder: "https://example.com", required: false },
        ],
      })
    );
  }
  
  /**
   * Renders the form for adding a Word entry.
   * @param {HTMLElement} entryFieldsContainer
   */
  export function renderWordForm(entryFieldsContainer) {
    // Word text
    entryFieldsContainer.appendChild(
      createTextField({
        id: "word_text",
        labelText: "単語（必須）",
        required: true,
        inputType: "text",
      })
    );

    const wordInput = document.getElementById("word_text");
    wordInput.addEventListener("blur", handleWordTextChange);
  
    // Furigana array
    entryFieldsContainer.appendChild(
      createFuriganaArrayField({
        containerId: "word_readings",
        labelText: "読み（必須、複数可）",
        minItems: 1,
        baseInputId: "word_text"
      })
    );
  
    // Sync furigana lines with the main word text
    const baseWordInput = document.getElementById("word_text");
    baseWordInput.addEventListener("input", () => {
      const newBase = baseWordInput.value.trim();
      const readingsContainer = document.getElementById("word_readings");
      if (!readingsContainer) return;
  
      // For each line in the container
      const lines = readingsContainer.querySelectorAll(".furigana-line");
      lines.forEach((line) => {
        const furiganaFieldDiv = line.querySelector(".furigana-field-wrapper");
        if (!furiganaFieldDiv || !furiganaFieldDiv._furiganaFieldObject) return;
        furiganaFieldDiv._furiganaFieldObject.setBaseText(newBase);
      });
    });
  
    // Other forms
    entryFieldsContainer.appendChild(
      createArrayField({
        containerId: "word_other_forms",
        labelText: "他の形（任意）",
        minItems: 0,
        placeholder: "他の形",
        addButtonLabel: "形を追加",
        isRequiredArray: false,
      })
    );
  
    // Meanings
    entryFieldsContainer.appendChild(
      createObjectArrayField({
        containerId: "word_meanings",
        labelText: "意味（必須, 日本語・英語・拡張英語）",
        addButtonLabel: "意味を追加",
        minItems: 1,
        fields: [
          { subId: "japanese", label: "日本語", placeholder: "日本語の説明", required: true },
          { subId: "english", label: "英語", placeholder: "English explanation", required: true },
          {
            subId: "english_extension",
            label: "追加英語情報",
            placeholder: "synonyms, short gloss",
            required: true,
          },
        ],
      })
    );
  
    // synonyms, antonyms, collocations, nuance, related_words
    entryFieldsContainer.appendChild(
      createArrayField({
        containerId: "word_synonyms",
        labelText: "同義語（任意）",
        minItems: 0,
        placeholder: "同義語",
        addButtonLabel: "同義語を追加",
        isRequiredArray: false,
      })
    );
  
    entryFieldsContainer.appendChild(
      createArrayField({
        containerId: "word_antonyms",
        labelText: "反意語（任意）",
        minItems: 0,
        placeholder: "反意語",
        addButtonLabel: "反意語を追加",
        isRequiredArray: false,
      })
    );
  
    entryFieldsContainer.appendChild(
      createArrayField({
        containerId: "word_collocations",
        labelText: "共起表現（任意）",
        minItems: 0,
        placeholder: "共起表現",
        addButtonLabel: "共起表現を追加",
        isRequiredArray: false,
      })
    );
  
    entryFieldsContainer.appendChild(
      createTextField({
        id: "word_nuance_jp",
        labelText: "ニュアンス (日本語, 任意)",
        required: false,
        inputType: "text",
      })
    );
    entryFieldsContainer.appendChild(
      createTextField({
        id: "word_nuance_en",
        labelText: "ニュアンス (英語, 任意)",
        required: false,
        inputType: "text",
      })
    );
  
    entryFieldsContainer.appendChild(
      createArrayField({
        containerId: "word_related",
        labelText: "関連語（任意）",
        minItems: 0,
        placeholder: "関連語",
        addButtonLabel: "関連語を追加",
        isRequiredArray: false,
      })
    );
  
    // Kanken level
    entryFieldsContainer.appendChild(
      createKankenSelectField({
        id: "word_kanken_level",
        labelText: "漢検級（必須）",
        required: true,
      })
    );
  
    // References
    entryFieldsContainer.appendChild(
      createObjectArrayField({
        containerId: "word_references",
        labelText: "参考（必須, 複数可）",
        addButtonLabel: "参考を追加",
        minItems: 1,
        fields: [
          { subId: "source", label: "ソース", placeholder: "広辞苑第六版", required: true },
          { subId: "url", label: "URL", placeholder: "https://example.com", required: false },
        ],
      })
    );
  }
  
  /**
   * Renders the form for adding a Sentence entry.
   * @param {HTMLElement} entryFieldsContainer
   */
  export function renderSentenceForm(entryFieldsContainer) {
    // Create sentence text input
    entryFieldsContainer.appendChild(
      createTextField({
        id: "sentence_text",
        labelText: "例文（必須）",
        required: true,
        inputType: "text",
      })
    );
  
    // Create sentence words array field
    entryFieldsContainer.appendChild(
      createObjectArrayField({
        containerId: "sentence_words",
        labelText: "例文中の単語（表層形＋辞書形, 任意）",
        addButtonLabel: "単語を追加",
        minItems: 0,
        fields: [
          {
            subId: "surfaceForm",
            label: "文中形",
            placeholder: "例：食べて",
            required: false,
          },
          {
            subId: "defaultForm",
            label: "辞書形 / 原形",
            placeholder: "例：食べる",
            required: false,
          },
        ],
      })
    );
  
    // Attach event listener to the sentence text input
    const sentenceInput = document.getElementById("sentence_text");
    sentenceInput.addEventListener("input", () => {
      const sentence = sentenceInput.value.trim();
      if (sentence) {
        const tokens = tokenizeSentence(sentence);
        updateSentenceWords(tokens, "sentence_words");
      }
    });

    sentenceInput.addEventListener("blur", handleSentenceOrWordsChange);
  
    // If you’re using object-array for words...
    const wordsContainer = document.getElementById("sentence_words");
    // Some event to say "when user finishes editing words"
    wordsContainer.addEventListener("blur", handleSentenceOrWordsChange, true); 
  
    // Other fields...
    entryFieldsContainer.appendChild(
      createTextField({
        id: "sentence_explanation",
        labelText: "説明（任意）",
        required: false,
        inputType: "text",
      })
    );
  
    entryFieldsContainer.appendChild(
      createTextField({
        id: "sentence_english",
        labelText: "英訳（任意）",
        required: false,
        inputType: "text",
      })
    );
  
    entryFieldsContainer.appendChild(
      createKankenSelectField({
        id: "sentence_kanken_level",
        labelText: "漢検級（必須）",
        required: true,
      })
    );
  
    entryFieldsContainer.appendChild(
      createObjectArrayField({
        containerId: "sentence_references",
        labelText: "参考（任意, 複数可）",
        addButtonLabel: "参考を追加",
        minItems: 0,
        fields: [
          { subId: "source", label: "ソース", placeholder: "山口瞳『草競馬流浪記』", required: false },
          { subId: "url", label: "URL", placeholder: "https://example.com", required: false },
        ],
      })
    );
  }
  
  /**
   * Renders the form for adding a Yojijukugo entry.
   * @param {HTMLElement} entryFieldsContainer
   */
  export function renderYojijukugoForm(entryFieldsContainer) {
    // Base idiom
    entryFieldsContainer.appendChild(
      createTextField({
        id: "yoji_idiom",
        labelText: "四字熟語（必須）",
        required: true,
        inputType: "text",
      })
    );

    const idiomInput = document.getElementById("yoji_idiom");
    idiomInput.addEventListener("blur", handleYojiIdiomChange);
  
    // Furigana array
    entryFieldsContainer.appendChild(
        createFuriganaArrayField({
          containerId: "yoji_readings",
          labelText: "読み（必須, 複数可）",
          minItems: 1,
          baseInputId: "yoji_idiom" // <--- PASS THIS
        })
    );
  
    // Auto-update furigana lines if the user changes the base idiom
    const baseYojiInput = document.getElementById("yoji_idiom");
    baseYojiInput.addEventListener("input", () => {
      const newBase = baseYojiInput.value.trim();
      const readingsContainer = document.getElementById("yoji_readings");
      if (!readingsContainer) return;
  
      const lines = readingsContainer.querySelectorAll(".furigana-line");
      lines.forEach((line) => {
        const furiganaFieldDiv = line.querySelector(".furigana-field-wrapper");
        if (!furiganaFieldDiv || !furiganaFieldDiv._furiganaFieldObject) return;
        furiganaFieldDiv._furiganaFieldObject.setBaseText(newBase);
      });
    });
  
    // Meaning
    entryFieldsContainer.appendChild(
      createTextField({
        id: "yoji_meaning_jp",
        labelText: "意味（日本語, 必須）",
        required: true,
        inputType: "text",
      })
    );
    entryFieldsContainer.appendChild(
      createTextField({
        id: "yoji_meaning_en",
        labelText: "意味（英語, 必須）",
        required: true,
        inputType: "text",
      })
    );
  
    // Explanation
    entryFieldsContainer.appendChild(
      createTextField({
        id: "yoji_expl_jp",
        labelText: "解説（日本語, 必須）",
        required: true,
        inputType: "text",
      })
    );
    entryFieldsContainer.appendChild(
      createTextField({
        id: "yoji_expl_en",
        labelText: "解説（英語, 必須）",
        required: true,
        inputType: "text",
      })
    );
  
    // Source
    entryFieldsContainer.appendChild(
      createTextField({
        id: "yoji_source",
        labelText: "出典（任意）",
        required: false,
        inputType: "text",
      })
    );
  
    // Synonyms, Antonyms, Tags
    entryFieldsContainer.appendChild(
      createArrayField({
        containerId: "yoji_synonyms",
        labelText: "同義語（任意）",
        minItems: 0,
        placeholder: "異口同辞 等",
        addButtonLabel: "追加",
        isRequiredArray: false,
      })
    );
  
    entryFieldsContainer.appendChild(
      createArrayField({
        containerId: "yoji_antonyms",
        labelText: "反対語（任意）",
        minItems: 0,
        placeholder: "真逆の意味の四字熟語",
        addButtonLabel: "追加",
        isRequiredArray: false,
      })
    );
  
    entryFieldsContainer.appendChild(
      createArrayField({
        containerId: "yoji_tags",
        labelText: "タグ（任意）",
        minItems: 0,
        placeholder: "考えが一致する, etc.",
        addButtonLabel: "追加",
        isRequiredArray: false,
      })
    );
  
    // Kanken level
    entryFieldsContainer.appendChild(
      createKankenSelectField({
        id: "yoji_kanken_level",
        labelText: "漢検級（必須）",
        required: true,
      })
    );
  
    // References
    entryFieldsContainer.appendChild(
      createObjectArrayField({
        containerId: "yoji_references",
        labelText: "参考（任意, 複数可）",
        addButtonLabel: "参考を追加",
        minItems: 0,
        fields: [
          { subId: "source", label: "ソース", placeholder: "四字熟語辞典", required: false },
          { subId: "url", label: "URL", placeholder: "https://example.com", required: false },
        ],
      })
    );
  }
  
  /**
   * Renders the form for adding a Kotowaza (proverb) entry.
   * @param {HTMLElement} entryFieldsContainer
   */
  export function renderKotowazaForm(entryFieldsContainer) {
    // Base proverb
    entryFieldsContainer.appendChild(
      createTextField({
        id: "kotowaza_proverb",
        labelText: "諺（必須）",
        required: true,
        inputType: "text",
      })
    );

    const proverbInput = document.getElementById("kotowaza_proverb");
    proverbInput.addEventListener("blur", handleKotowazaChange);
  
    // Furigana array
    entryFieldsContainer.appendChild(
        createFuriganaArrayField({
          containerId: "kotowaza_readings",
          labelText: "読み（必須・複数可）",
          minItems: 1,
          baseInputId: "kotowaza_proverb" // Same pattern
        })
      );
  
    // Update furigana lines if user changes the base proverb
    const baseProverbInput = document.getElementById("kotowaza_proverb");
    baseProverbInput.addEventListener("input", () => {
      const newBase = baseProverbInput.value.trim();
      const readingsContainer = document.getElementById("kotowaza_readings");
      if (!readingsContainer) return;
  
      const lines = readingsContainer.querySelectorAll(".furigana-line");
      lines.forEach((line) => {
        const furiganaFieldDiv = line.querySelector(".furigana-field-wrapper");
        if (!furiganaFieldDiv || !furiganaFieldDiv._furiganaFieldObject) return;
        furiganaFieldDiv._furiganaFieldObject.setBaseText(newBase);
      });
    });
  
    // Meanings
    entryFieldsContainer.appendChild(
      createTextField({
        id: "kotowaza_meaning_jp",
        labelText: "意味（日本語, 必須）",
        required: true,
        inputType: "text",
      })
    );
    entryFieldsContainer.appendChild(
      createTextField({
        id: "kotowaza_meaning_en",
        labelText: "意味（英語, 必須）",
        required: true,
        inputType: "text",
      })
    );
  
    // Explanation
    entryFieldsContainer.appendChild(
      createTextField({
        id: "kotowaza_expl_jp",
        labelText: "解説（日本語, 必須）",
        required: true,
        inputType: "text",
      })
    );
    entryFieldsContainer.appendChild(
      createTextField({
        id: "kotowaza_expl_en",
        labelText: "解説（英語, 必須）",
        required: true,
        inputType: "text",
      })
    );
  
    // Related phrases
    entryFieldsContainer.appendChild(
      createArrayField({
        containerId: "kotowaza_related_phrases",
        labelText: "関連フレーズ（任意）",
        minItems: 0,
        placeholder: "辛抱する木に金がなる",
        addButtonLabel: "追加",
        isRequiredArray: false,
      })
    );
  
    // Kanken level
    entryFieldsContainer.appendChild(
      createKankenSelectField({
        id: "kotowaza_kanken_level",
        labelText: "漢検級（必須）",
        required: true,
      })
    );
  
    // References
    entryFieldsContainer.appendChild(
      createObjectArrayField({
        containerId: "kotowaza_references",
        labelText: "参考（任意, 複数可）",
        addButtonLabel: "参考を追加",
        minItems: 0,
        fields: [
          {
            subId: "source",
            label: "ソース",
            placeholder: "故事・ことわざ・慣用句辞典オンライン",
            required: false,
          },
          {
            subId: "url",
            label: "URL",
            placeholder: "https://kotowaza.jitenon.jp/kotowaza/xxxx.php",
            required: false,
          },
        ],
      })
    );
  }
  
  /**
 * Tokenize a sentence and filter tokens containing Kanji.
 * @param {string} sentence - The input sentence.
 * @returns {Array} - Array of tokens containing Kanji.
 */
function tokenizeSentence(sentence) {
  const segmenter = new TinySegmenter();
  const tokens = segmenter.segment(sentence);

  // Filter tokens that contain at least one Kanji
  const kanjiRegex = /[\u4E00-\u9FFF]/; // Kanji Unicode range
  return tokens.filter((token) => kanjiRegex.test(token));
}

/**
 * Update the sentence_words array field with tokens.
 * @param {Array} tokens - The list of tokens containing Kanji.
 * @param {string} containerId - The ID of the array field container.
 */
function updateSentenceWords(tokens, containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  // Clear the container contents
  container.innerHTML = "";

  // Create object-array-row based on tokens
  tokens.forEach((token) => {
    // Create a row
    const row = document.createElement("div");
    row.classList.add("object-array-row");

    // Label + input for surface form
    const surfaceWrapper = document.createElement("div");
    surfaceWrapper.classList.add("object-field");
    const surfaceLabel = document.createElement("label");
    surfaceLabel.textContent = "文中形";
    surfaceLabel.classList.add("object-field-label");
    surfaceWrapper.appendChild(surfaceLabel);

    const surfaceInput = document.createElement("input");
    surfaceInput.type = "text";
    surfaceInput.classList.add("form-input");
    // Set data-subid so that it can be picked up later with getObjectArrayValues
    surfaceInput.dataset.subid = "surfaceForm";
    surfaceInput.value = token; // put the result of tokenizeSentence
    surfaceWrapper.appendChild(surfaceInput);

    row.appendChild(surfaceWrapper);

    // Label + input for dictionary form
    const defaultWrapper = document.createElement("div");
    defaultWrapper.classList.add("object-field");
    const defaultLabel = document.createElement("label");
    defaultLabel.textContent = "辞書形";
    defaultLabel.classList.add("object-field-label");
    defaultWrapper.appendChild(defaultLabel);

    const defaultInput = document.createElement("input");
    defaultInput.type = "text";
    defaultInput.classList.add("form-input");
    defaultInput.dataset.subid = "defaultForm";
    defaultInput.placeholder = "例：食べる";
    defaultWrapper.appendChild(defaultInput);

    row.appendChild(defaultWrapper);

    // Delete button
    const removeBtn = document.createElement("button");
    removeBtn.type = "button";
    removeBtn.textContent = "削除";
    removeBtn.classList.add("object-array-remove-btn");
    removeBtn.addEventListener("click", () => {
      container.removeChild(row);
    });
    row.appendChild(removeBtn);

    container.appendChild(row);
  });
}

async function handleWordTextChange() {
  const wordText = getValue("#word_text");
  const kanjiSet = extractKanji(wordText);
  const minLevel = await getMinKankenLevelForKanji([...kanjiSet]);
  const wordKankenSelect = document.getElementById("word_kanken_level");
  if (wordKankenSelect) {
    wordKankenSelect.value = minLevel;
  }
}

async function handleYojiIdiomChange() {
  const idiom = getValue("#yoji_idiom");
  const kanjiSet = extractKanji(idiom);
  const minLevel = await getMinKankenLevelForKanji([...kanjiSet]);
  const yojiKankenSelect = document.getElementById("yoji_kanken_level");
  if (yojiKankenSelect) {
    yojiKankenSelect.value = minLevel;
  }
}

async function handleKotowazaChange() {
  // 1) Get the proverb text
  const proverb = getValue("#kotowaza_proverb");
  // 2) Extract kanji
  const kanjiSet = extractKanji(proverb);

  // 3) Single call to getMinKankenLevelForKanji
  const minLevel = await getMinKankenLevelForKanji([...kanjiSet]);

  // 4) Update the <select>
  const proverbKankenSelect = document.getElementById("kotowaza_kanken_level");
  if (proverbKankenSelect) {
    proverbKankenSelect.value = minLevel;
  }
}

async function handleSentenceOrWordsChange() {
  // 1) Gather dictionary forms from #sentence_words
  const rawWords = getObjectArrayValues("sentence_words");
  const uniqueWords = new Set();
  rawWords.forEach(obj => {
    const dictForm = obj.defaultForm?.trim();
    const surface = obj.surfaceForm?.trim();
    const finalWord = dictForm || surface;
    if (finalWord) uniqueWords.add(finalWord);
  });

  // 2) Extract all kanji from #sentence_text
  const sentenceText = getValue("#sentence_text");
  const uniqueKanji = extractKanji(sentenceText);

  // 3) autoDetectKankenLevel
  const minLevel = await autoDetectKankenLevel([...uniqueWords], [...uniqueKanji]);
  
  // 4) Set the <select>
  const sentenceKankenSelect = document.getElementById("sentence_kanken_level");
  if (sentenceKankenSelect) {
    sentenceKankenSelect.value = minLevel;
  }
}