// addEntry.js
import { addRadical, addKanji, addWord } from "./dbUtils.js";

const jwtToken = localStorage.getItem("picotan_jwt");

// DOM elements
const entryTypeSelect = document.getElementById("entry-type");
const entryFieldsContainer = document.getElementById("entry-fields");
const saveBtn = document.getElementById("save-btn");
const outputContainer = document.getElementById("output-container");

document.addEventListener("DOMContentLoaded", () => {
  // 1) If not logged in, hide form and show message
  if (!jwtToken) {
    if (entryTypeSelect) entryTypeSelect.style.display = "none";
    if (saveBtn) saveBtn.style.display = "none";

    const notLoggedInMsg = document.createElement("p");
    notLoggedInMsg.textContent = "データベースに追加するには、ログインが必要です。";
    outputContainer.appendChild(notLoggedInMsg);
    return; // Stop here
  }

  // 2) If logged in, restore last used mode or default to "radical"
  let lastMode = localStorage.getItem("picotan-addEntryMode");
  if (!lastMode) {
    lastMode = "radical"; // fallback
  }
  entryTypeSelect.value = lastMode;
  renderForm(lastMode);

  // 3) Listen for changes in the dropdown
  entryTypeSelect.addEventListener("change", () => {
    const newVal = entryTypeSelect.value;
    // Save newVal to localStorage
    localStorage.setItem("picotan-addEntryMode", newVal);

    clearOutput();
    renderForm(newVal);
  });

  // 4) Save button
  saveBtn.addEventListener("click", handleSave);
});

/* ----------------------------------------------
   RENDER FORMS PER TYPE
---------------------------------------------- */
function renderForm(type) {
  entryFieldsContainer.innerHTML = ""; // Clear old form

  if (type === "radical") {
    renderRadicalForm();
  } else if (type === "kanji") {
    renderKanjiForm();
  } else if (type === "word") {
    renderWordForm();
  }
  // else if (type === 'sentence') { ... etc. }
}

/* ----------------------------------------------
   1) RADICAL FORM (unchanged)
---------------------------------------------- */
function renderRadicalForm() {
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

/* ----------------------------------------------
   2) KANJI FORM (somewhat unchanged)
---------------------------------------------- */
function renderKanjiForm() {
  // Basic fields
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
      labelText: "異体字（任意, 複数可）",
      addButtonLabel: "異体字を追加",
      minItems: 0,
      fields: [
        { subId: "character", label: "文字", placeholder: "漢", required: false },
        {
          subId: "type",
          label: "種類",
          placeholder: "旧字体 / 新字体 / 略字 等",
          required: false,
        },
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

  // On Readings => array of objects
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

  // Kun Readings => array of objects
  entryFieldsContainer.appendChild(
    createObjectArrayField({
      containerId: "kanji_kun_readings",
      labelText: "訓読み（複数可）",
      addButtonLabel: "訓読みを追加",
      minItems: 0,
      fields: [
        { subId: "reading", label: "読み方", placeholder: "おとこ", required: false },
        { subId: "okurigana", label: "送り仮名", placeholder: "う, かる 等", required: false },
        {
          subId: "isHyougai",
          label: "表外？",
          type: "checkbox",
          required: false,
        },
      ],
    })
  );

  // Meanings => array
  entryFieldsContainer.appendChild(
    createObjectArrayField({
      containerId: "kanji_meanings",
      labelText: "意味（必須, 複数可, 日本語・英語）",
      addButtonLabel: "意味を追加",
      minItems: 1,
      fields: [
        { subId: "japanese", label: "日本語 (必須)", placeholder: "中国を流れる川の名…", required: true },
        { subId: "english", label: "英語 (必須)", placeholder: "A river flowing in China…", required: true },
      ],
    })
  );

  // Kanken level => select
  entryFieldsContainer.appendChild(
    createKankenSelectField({
      id: "kanji_kanken_level",
      labelText: "漢検級（必須）",
      required: true,
    })
  );

  // Single checkbox for "常用漢字"
  entryFieldsContainer.appendChild(
    createSingleCheckField({
      containerId: "kanji_is_jouyou",
      labelText: "常用漢字？",
      value: "常用漢字",
    })
  );

  // Radio group for "第１水準", "第２水準", "第３水準"
  entryFieldsContainer.appendChild(
    createRadioField({
      containerId: "kanji_water_level",
      labelText: "水準（任意, いずれか1つ）",
      name: "waterLevel",
      options: ["第１水準", "第２水準", "第３水準"],
    })
  );

  // references => array of objects
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

/* ----------------------------------------------
   3) WORD FORM (NEW)
---------------------------------------------- */
function renderWordForm() {
  // 1) word (必須)
  entryFieldsContainer.appendChild(
    createTextField({
      id: "word_word",
      labelText: "言葉（必須）",
      required: true,
      inputType: "text",
    })
  );

  // other_forms => string array (optional)
  entryFieldsContainer.appendChild(
    createArrayField({
      containerId: "word_other_forms",
      labelText: "他の形（任意, 複数可）",
      minItems: 0,
      placeholder: "他の形",
      addButtonLabel: "形を追加",
      isRequiredArray: false,
    })
  );

  // readings => array of objects, each { reading, furigana }, required
  entryFieldsContainer.appendChild(
    createObjectArrayField({
      containerId: "word_readings",
      labelText: "読み（必須, 複数可）",
      addButtonLabel: "読みを追加",
      minItems: 1,
      fields: [
        { subId: "reading", label: "読み", placeholder: "かんじ", required: true },
        { subId: "furigana", label: "ふりがな", placeholder: "[漢](かん)[字](じ)", required: true },
      ],
    })
  );

  // 2) meanings => array of objects, each with { japanese, english, english_extension }
  entryFieldsContainer.appendChild(
    createObjectArrayField({
      containerId: "word_meanings",
      labelText: "意味（必須, 複数可, 日本語・英語・英語拡張）",
      addButtonLabel: "意味を追加",
      minItems: 1,
      fields: [
        { subId: "japanese", label: "日本語", placeholder: "日本語の説明", required: true },
        { subId: "english", label: "英語", placeholder: "English explanation", required: true },
        {
          subId: "english_extension",
          label: "追加の英語情報",
          placeholder: "e.g. synonyms, short gloss",
          required: true,
        },
      ],
    })
  );

  // synonyms => string array
  entryFieldsContainer.appendChild(
    createArrayField({
      containerId: "word_synonyms",
      labelText: "同義語（任意, 複数可）",
      minItems: 0,
      placeholder: "同義語",
      addButtonLabel: "同義語を追加",
      isRequiredArray: false,
    })
  );

  // antonyms => string array
  entryFieldsContainer.appendChild(
    createArrayField({
      containerId: "word_antonyms",
      labelText: "反意語（任意, 複数可）",
      minItems: 0,
      placeholder: "反意語",
      addButtonLabel: "反意語を追加",
      isRequiredArray: false,
    })
  );

  // collocations => string array
  entryFieldsContainer.appendChild(
    createArrayField({
      containerId: "word_collocations",
      labelText: "共起表現（任意, 複数可）",
      minItems: 0,
      placeholder: "共起表現",
      addButtonLabel: "共起表現を追加",
      isRequiredArray: false,
    })
  );

  // nuance => object with { japanese, english } optional
  // We'll do two text fields: nuance_jp, nuance_en
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

  // related_words => string array
  entryFieldsContainer.appendChild(
    createArrayField({
      containerId: "word_related",
      labelText: "関連語（任意, 複数可）",
      minItems: 0,
      placeholder: "関連語",
      addButtonLabel: "関連語を追加",
      isRequiredArray: false,
    })
  );

  // kanken level => select (必須)
  entryFieldsContainer.appendChild(
    createKankenSelectField({
      id: "word_kanken_level",
      labelText: "漢検級（必須）",
      required: true,
    })
  );

  // references => array of objects => { source, url } => required, only the source
  entryFieldsContainer.appendChild(
    createObjectArrayField({
      containerId: "word_references",
      labelText: "参考（必須, 複数可）",
      addButtonLabel: "参考を追加",
      minItems: 1, // at least one reference
      fields: [
        { subId: "source", label: "ソース", placeholder: "広辞苑第六版", required: true },
        { subId: "url", label: "URL", placeholder: "https://example.com", required: false },
      ],
    })
  );
}

/* ----------------------------------------------
   HANDLE SAVE
---------------------------------------------- */
async function handleSave() {
  clearOutput();
  const type = entryTypeSelect.value;

  try {
    const newDoc = buildDoc(type);
    let response;

    if (type === "radical") {
      response = await addRadical(newDoc, jwtToken);
      displayMessage("部首を追加しました！");
    } else if (type === "kanji") {
      response = await addKanji(newDoc, jwtToken);
      displayMessage("漢字を追加しました！");
    } else if (type === "word") {
      response = await addWord(newDoc, jwtToken);
      displayMessage("言葉を追加しました！");
    }

    // Show the object
    displayJSON(newDoc);
    console.log("Server response:", response);

    // Clear and re-render
    entryFieldsContainer.innerHTML = "";
    renderForm(type);
  } catch (error) {
    displayMessage(`エラー：${error.message}`);
    console.error(error);
  }
}

/* ----------------------------------------------
   BUILD DOC
---------------------------------------------- */
function buildDoc(type) {
  if (type === "radical") {
    return buildRadicalDoc();
  } else if (type === "kanji") {
    return buildKanjiDoc();
  } else if (type === "word") {
    return buildWordDoc();
  }
  throw new Error("Unsupported type: " + type);
}

/* ---- RADICAL BUILDER ---- */
function buildRadicalDoc() {
  const character = getValue("#character");
  const stroke_count = parseInt(getValue("#stroke_count"), 10) || 0;
  const names = getArrayValues("names-container");
  const alternates = getArrayValues("alternates-container");
  const meaning_jp = getValue("#meaning_jp");
  const meaning_en = getValue("#meaning_en");

  if (!character) throw new Error("部首が入力されていません。");
  if (!meaning_jp || !meaning_en) {
    throw new Error("意味 (日本語・英語) は必須です。");
  }
  if (!names.length) {
    throw new Error("名称が1つ以上必要です。");
  }

  return {
    character,
    stroke_count,
    names,
    alternates,
    meaning: {
      japanese: meaning_jp,
      english: meaning_en,
    },
  };
}

/* ---- KANJI BUILDER ---- */
function buildKanjiDoc() {
  const character = getValue("#kanji_character");
  const radical = getValue("#kanji_radical");
  const stroke_count = parseInt(getValue("#kanji_stroke_count"), 10) || 0;
  const kanken_level = parseFloat(getSelectValue("kanji_kanken_level")) || 0;

  if (!character) throw new Error("漢字（必須）が入力されていません。");
  if (!radical) throw new Error("部首（必須）が入力されていません。");

  const alternate_forms = getObjectArrayValues("kanji_alternate_forms");
  const references = getObjectArrayValues("kanji_references");

  const onArr = getObjectArrayValues("kanji_on_readings").map((item) => {
    const tags = [];
    if (item.isHyougai === "on") {
      // means the checkbox was checked => "表外"
      tags.push("表外");
    }
    return { reading: item.reading || "", tags };
  });

  const kunArr = getObjectArrayValues("kanji_kun_readings").map((item) => {
    const tags = [];
    if (item.isHyougai === "on") {
      tags.push("表外");
    }
    return {
      reading: item.reading || "",
      okurigana: item.okurigana || "",
      tags,
    };
  });

  const readings = { on: onArr, kun: kunArr };

  const meanings = getObjectArrayValues("kanji_meanings").map((m) => ({
    japanese: m.japanese || "",
    english: m.english || "",
  }));
  if (!meanings.length) {
    throw new Error("少なくとも1つの意味を追加してください。");
  }

  // categories => combine single checkbox + radio
  const categories = [];
  const jouyouVal = getSingleCheckValue("kanji_is_jouyou"); // "常用漢字" if checked
  if (jouyouVal) categories.push(jouyouVal);

  const waterLevelVal = getSelectedRadioValue("kanji_water_level"); // "第１水準" etc.
  if (waterLevelVal) categories.push(waterLevelVal);

  return {
    character,
    radical,
    stroke_count,
    readings,
    meanings,
    kanken_level,
    categories,
    references,
    alternate_forms,
  };
}

/* ---- WORD BUILDER (NEW) ---- */
function buildWordDoc() {
  // 1) word
  const word = getValue("#word_word");
  if (!word) {
    throw new Error("言葉 (word) が入力されていません。");
  }

  // 2) meanings => array of { japanese, english, english_extension }
  const rawMeanings = getObjectArrayValues("word_meanings");
  if (!rawMeanings.length) {
    throw new Error("少なくとも1つの意味を追加してください。");
  }
  const meanings = rawMeanings.map((m) => {
    if (!m.japanese || !m.english || !m.english_extension) {
      throw new Error("意味の日本語・英語・追加英語は全て必須です。");
    }
    return {
      japanese: m.japanese,
      english: m.english,
      english_extension: m.english_extension,
    };
  });

  // synonyms, antonyms, collocations, related_words, other_forms => arrays of strings
  const synonyms = getArrayValues("word_synonyms");
  const antonyms = getArrayValues("word_antonyms");
  const collocations = getArrayValues("word_collocations");
  const related_words = getArrayValues("word_related");
  const other_forms = getArrayValues("word_other_forms");

  // readings => array of { reading, furigana }, required
  const rawReadings = getObjectArrayValues("word_readings");
  if (!rawReadings.length) {
    throw new Error("少なくとも1つの読みを追加してください。");
  }
  const readings = rawReadings.map((r) => {
    if (!r.reading || !r.furigana) {
      throw new Error("読み・ふりがなは必須です。");
    }
    return { reading: r.reading, furigana: r.furigana };
  });

  // nuance => optional { japanese, english }
  // If one is filled, the other is required. If both empty, omit entirely
  const nuance_jp = getValue("#word_nuance_jp");
  const nuance_en = getValue("#word_nuance_en");
  let nuance = null;
  if (nuance_jp || nuance_en) {
    if (!nuance_jp || !nuance_en) {
      throw new Error("ニュアンスを入れる場合は、日本語と英語の両方が必要です。");
    }
    nuance = { japanese: nuance_jp, english: nuance_en };
  }

  // kanken_level => required
  const kanken_level = parseFloat(getSelectValue("word_kanken_level")) || 0;
  if (!kanken_level) {
    throw new Error("漢検級が選択されていません。");
  }

  // references => array of { source, url }, minItems=1
  const rawRefs = getObjectArrayValues("word_references");
  if (!rawRefs.length) {
    throw new Error("少なくとも1つの参考を追加してください。");
  }
  const references = rawRefs.map((ref) => {
    if (!ref.source || !ref.url) {
      throw new Error("参考のsourceとurlは必須です。");
    }
    return { source: ref.source, url: ref.url };
  });

  return {
    word,
    meanings,
    synonyms,
    antonyms,
    readings,
    collocations,
    nuance: nuance || {}, // if you prefer to send empty object or omit entirely
    related_words,
    kanken_level,
    references,
    other_forms,
  };
}

/* ----------------------------------------------
   GENERIC FIELD CREATION (unchanged)
---------------------------------------------- */
function createTextField({ id, labelText, required = false, inputType = "text" }) {
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

function createArrayField({
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

function createObjectArrayField({
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
  if (minItems > 0) {
    label.classList.add("required");
  }
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

/* ----------------------------------------------
   CHECKBOX / RADIO / SELECT FIELDS (unchanged)
---------------------------------------------- */
function createSingleCheckField({ containerId, labelText, value = "" }) {
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

function getSingleCheckValue(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return null;
  const cb = container.querySelector("input[type='checkbox']");
  if (cb && cb.checked) {
    return cb.value; // e.g. "常用漢字"
  }
  return null;
}

function createRadioField({ containerId, labelText, name, options = [] }) {
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
    rb.name = name; // all share the same name => mutually exclusive
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

function getSelectedRadioValue(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return null;
  const checked = container.querySelector("input[type='radio']:checked");
  return checked ? checked.value : null;
}

function createKankenSelectField({ id, labelText, required = false }) {
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

  // Define your levels
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

function getSelectValue(id) {
  const sel = document.getElementById(id);
  if (!sel) return 0;
  return parseFloat(sel.value) || 0;
}

/* ----------------------------------------------
   GETTING DOM VALUES (unchanged)
---------------------------------------------- */
function getValue(selector) {
  const el = document.querySelector(selector);
  return el ? el.value.trim() : "";
}

function getArrayValues(containerId) {
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

function getObjectArrayValues(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return [];

  const rows = container.querySelectorAll(".object-array-row");
  const results = [];

  rows.forEach((row) => {
    const inputs = row.querySelectorAll("input");
    const obj = {};
    inputs.forEach((inp) => {
      const key = inp.dataset.subid; // e.g. "reading" or "furigana"
      if (inp.type === "checkbox") {
        // Mark "on" if checked, "" if not
        obj[key] = inp.checked ? "on" : "";
      } else {
        obj[key] = inp.value.trim();
      }
    });
    // Only push if at least one subfield is non-empty,
    // or you can decide to always push
    const hasData = Object.values(obj).some((v) => v.length > 0);
    if (hasData) {
      results.push(obj);
    }
  });

  return results;
}

/* ----------------------------------------------
   OUTPUT
---------------------------------------------- */
function displayMessage(msg) {
  const p = document.createElement("p");
  p.textContent = msg;
  outputContainer.appendChild(p);
}

function displayJSON(obj) {
  const pre = document.createElement("pre");
  pre.textContent = JSON.stringify(obj, null, 2);
  outputContainer.appendChild(pre);
}

function clearOutput() {
  outputContainer.innerHTML = "";
}