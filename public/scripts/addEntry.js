import {
  renderRadicalForm,
  renderKanjiForm,
  renderWordForm,
  renderSentenceForm,
  renderYojijukugoForm,
  renderKotowazaForm,
} from "./helpers/formRenders.js";

import {
  buildRadicalDoc,
  buildKanjiDoc,
  buildWordDoc,
  buildSentenceDoc,
  buildYojijukugoDoc,
  buildKotowazaDoc,
} from "./helpers/docBuilders.js";

import {
  addRadical,
  addKanji,
  addWord,
  addSentence,
  addYojijukugo,
  addKotowaza,
} from "./helpers/dbUtils.js";

const jwtToken = localStorage.getItem("picotan_jwt");
const entryTypeSelect = document.getElementById("entry-type");
const entryFieldsContainer = document.getElementById("entry-fields");
const saveBtn = document.getElementById("save-btn");
const outputContainer = document.getElementById("output-container");

document.addEventListener("DOMContentLoaded", () => {
  // If no JWT, hide form
  if (!jwtToken) {
    if (entryTypeSelect) entryTypeSelect.style.display = "none";
    if (saveBtn) saveBtn.style.display = "none";
    outputContainer.textContent = "データベースに追加するには、ログインが必要です。";
    return;
  }

  let lastMode = localStorage.getItem("picotan-addEntryMode") || "radical";
  entryTypeSelect.value = lastMode;
  renderForm(lastMode);

  entryTypeSelect.addEventListener("change", () => {
    const newVal = entryTypeSelect.value;
    localStorage.setItem("picotan-addEntryMode", newVal);
    clearOutput();
    renderForm(newVal);
  });

  saveBtn.addEventListener("click", handleSave);
});

function renderForm(type) {
  entryFieldsContainer.innerHTML = "";
  switch (type) {
    case "radical":
      renderRadicalForm(entryFieldsContainer);
      break;
    case "kanji":
      renderKanjiForm(entryFieldsContainer);
      break;
    case "word":
      renderWordForm(entryFieldsContainer);
      break;
    case "sentence":
      renderSentenceForm(entryFieldsContainer);
      break;
    case "yojijukugo":
      renderYojijukugoForm(entryFieldsContainer);
      break;
    case "kotowaza":
      renderKotowazaForm(entryFieldsContainer);
      break;
    default:
      // fallback
      break;
  }
}

async function handleSave() {
  clearOutput();
  const type = entryTypeSelect.value;
  let newDoc, response;

  try {
    switch (type) {
      case "radical":
        newDoc = buildRadicalDoc();
        response = await addRadical(newDoc, jwtToken);
        displayMessage("部首を追加しました！");
        break;
      case "kanji":
        newDoc = buildKanjiDoc();
        response = await addKanji(newDoc, jwtToken);
        displayMessage("漢字を追加しました！");
        break;
      case "word":
        newDoc = buildWordDoc();
        response = await addWord(newDoc, jwtToken);
        displayMessage("言葉を追加しました！");
        break;
      case "sentence":
        newDoc = buildSentenceDoc();
        response = await addSentence(newDoc, jwtToken);
        displayMessage("例文を追加しました！");
        break;
      case "yojijukugo":
        newDoc = buildYojijukugoDoc();
        response = await addYojijukugo(newDoc, jwtToken);
        displayMessage("四字熟語を追加しました！");
        break;
      case "kotowaza":
        newDoc = buildKotowazaDoc();
        response = await addKotowaza(newDoc, jwtToken);
        displayMessage("諺を追加しました！");
        break;
      default:
        throw new Error("未対応の種類です。");
    }

    displayJSON(newDoc);
    console.log("Server response:", response);

    // Reset the form for a fresh entry
    entryFieldsContainer.innerHTML = "";
    renderForm(type);

  } catch (error) {
    displayMessage(`エラー：${error.message}`);
    console.error(error);
  }
}

function clearOutput() {
  outputContainer.innerHTML = "";
}

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