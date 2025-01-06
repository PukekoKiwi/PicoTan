/**
 * Imports for the various field-creation functions
 * and other utilities. Update paths as needed.
 */
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
    entryFieldsContainer.appendChild(
      createTextField({
        id: "sentence_text",
        labelText: "例文（必須）",
        required: true,
        inputType: "text",
      })
    );
  
    entryFieldsContainer.appendChild(
      createArrayField({
        containerId: "sentence_words",
        labelText: "例文中の単語（必須）",
        minItems: 1,
        placeholder: "単語",
        addButtonLabel: "単語を追加",
        isRequiredArray: true,
      })
    );
  
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
  