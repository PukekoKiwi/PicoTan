/**
 * docBuilders.js
 * --------------
 * Converts values from the dynamic entry forms into plain JavaScript objects
 * that match the schema expected by the MongoDB collections.  Each `buildXDoc`
 * function focuses on one document type and performs basic validation before
 * returning the ready-to-send object.
 */

import {
    getValue,
    getArrayValues,
    getObjectArrayValues,
    getSingleCheckValue,
    getSelectedRadioValue,
    getSelectValue,
  } from "./formUtils.js";
  
  import { getFuriganaArrayValues } from "./furiganaUtils.js";
  
  // ---------- RADICAL BUILDER ----------
  export function buildRadicalDoc() {
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
  
  // ---------- KANJI BUILDER ----------
  export function buildKanjiDoc() {
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
  
    // categories => combine the checkbox + radio
    const categories = [];
    const jouyouVal = getSingleCheckValue("kanji_is_jouyou");
    if (jouyouVal) categories.push(jouyouVal);
  
    const waterLevelVal = getSelectedRadioValue("kanji_water_level");
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
  
  // ---------- WORD BUILDER ----------
  export function buildWordDoc() {
    const wordText = getValue("#word_text");
    if (!wordText) {
      throw new Error("単語（必須）が入力されていません。");
    }
    const readingLines = getFuriganaArrayValues("word_readings");
    if (!readingLines.length) {
      throw new Error("少なくとも1つの読みが必要です。");
    }
    const readings = readingLines.map((line) => ({
      reading: line.base,
      furigana: line.bracketed,
    }));
  
    const other_forms = getArrayValues("word_other_forms");
    const rawMeanings = getObjectArrayValues("word_meanings");
    if (!rawMeanings.length) {
      throw new Error("少なくとも1つの意味を追加してください。");
    }
    const meanings = rawMeanings.map((m) => ({
      japanese: m.japanese,
      english: m.english,
      english_extension: m.english_extension,
    }));
  
    const synonyms = getArrayValues("word_synonyms");
    const antonyms = getArrayValues("word_antonyms");
    const collocations = getArrayValues("word_collocations");
    const related_words = getArrayValues("word_related");
  
    const nuance_jp = getValue("#word_nuance_jp");
    const nuance_en = getValue("#word_nuance_en");
    let nuance = {};
    if (nuance_jp || nuance_en) {
      if (!nuance_jp || !nuance_en) {
        throw new Error("ニュアンスを入れる場合、日本語と英語の両方が必要です。");
      }
      nuance = { japanese: nuance_jp, english: nuance_en };
    }
  
    const kanken_level = parseFloat(getSelectValue("word_kanken_level")) || 0;
    if (!kanken_level) {
      throw new Error("漢検級が選択されていません。");
    }
  
    const rawRefs = getObjectArrayValues("word_references");
    if (!rawRefs.length) {
      throw new Error("少なくとも1つの参考が必要です。");
    }
    const references = rawRefs.map((ref) => ({
      source: ref.source,
      url: ref.url || "",
    }));
  
    return {
      word: wordText,
      readings,
      meanings,
      synonyms,
      antonyms,
      collocations,
      nuance,
      related_words,
      kanken_level,
      references,
      other_forms,
    };
  }
  
  // ---------- SENTENCE BUILDER ----------
  export function buildSentenceDoc() {
    const sentenceText = getValue("#sentence_text");
    if (!sentenceText) {
      throw new Error("例文（必須）が入力されていません。");
    }
  
    const rawWords = getObjectArrayValues("sentence_words");
  
    const words_in_sentence = rawWords.map((obj) => {
      const surface = obj.surfaceForm || "";
      const dict = obj.defaultForm || "";
      return dict
        ? `${surface}|${dict}`
        : surface;
    });
  
    if (!words_in_sentence.length) {
      throw new Error("1つ以上の単語が必要です。");
    }
  
    const explanation = getValue("#sentence_explanation");
    const english = getValue("#sentence_english");
    const kanken_level = parseFloat(getSelectValue("sentence_kanken_level")) || 0;
    if (!kanken_level) {
      throw new Error("漢検級が選択されていません。");
    }
  
    const rawRefs = getObjectArrayValues("sentence_references");
    const references = rawRefs.map((ref) => ({
      source: ref.source || "",
      url: ref.url || "",
    }));
  
    return {
      sentence: sentenceText,
      words_in_sentence,
      explanation,
      english,
      kanken_level,
      references,
    };
  }  
  
  // ---------- YOJIJUKUGO BUILDER ----------
  export function buildYojijukugoDoc() {
    const baseIdiom = getValue("#yoji_idiom");
    if (!baseIdiom) {
      throw new Error("四字熟語（必須）が入力されていません。");
    }
  
    const readingLines = getFuriganaArrayValues("yoji_readings");
    if (!readingLines.length) {
      throw new Error("少なくとも1つの読みが必要です。");
    }
    const readings = readingLines.map((line) => ({
      reading: line.base,
      furigana: line.bracketed,
    }));
  
    const meaning_jp = getValue("#yoji_meaning_jp");
    const meaning_en = getValue("#yoji_meaning_en");
    if (!meaning_jp || !meaning_en) {
      throw new Error("意味（日本語・英語）は必須です。");
    }
  
    const expl_jp = getValue("#yoji_expl_jp");
    const expl_en = getValue("#yoji_expl_en");
    if (!expl_jp || !expl_en) {
      throw new Error("解説（日本語・英語）は必須です。");
    }
  
    const source = getValue("#yoji_source");
    const synonyms = getArrayValues("yoji_synonyms");
    const antonyms = getArrayValues("yoji_antonyms");
    const tags = getArrayValues("yoji_tags");
  
    const kanken_level = parseFloat(getSelectValue("yoji_kanken_level")) || 0;
    if (!kanken_level) {
      throw new Error("漢検級（必須）が選択されていません。");
    }
  
    const rawRefs = getObjectArrayValues("yoji_references");
    const references = rawRefs.map((ref) => ({
      source: ref.source || "",
      url: ref.url || "",
    }));
  
    return {
      idiom: baseIdiom,
      readings,
      meaning: {
        japanese: meaning_jp,
        english: meaning_en,
      },
      explanation: {
        japanese: expl_jp,
        english: expl_en,
      },
      source,
      synonyms,
      antonyms,
      tags,
      kanken_level,
      references,
    };
  }
  
  // ---------- KOTOWAZA BUILDER ----------
  export function buildKotowazaDoc() {
    const baseProverb = getValue("#kotowaza_proverb");
    if (!baseProverb) {
      throw new Error("諺（必須）が入力されていません。");
    }
  
    const readingLines = getFuriganaArrayValues("kotowaza_readings");
    if (!readingLines.length) {
      throw new Error("少なくとも1つの読みが必要です。");
    }
    const readings = readingLines.map((line) => ({
      reading: line.base,
      furigana: line.bracketed,
    }));
  
    const meaning_jp = getValue("#kotowaza_meaning_jp");
    const meaning_en = getValue("#kotowaza_meaning_en");
    if (!meaning_jp || !meaning_en) {
      throw new Error("意味（日本語・英語）は必須です。");
    }
  
    const expl_jp = getValue("#kotowaza_expl_jp");
    const expl_en = getValue("#kotowaza_expl_en");
    if (!expl_jp || !expl_en) {
      throw new Error("解説（日本語・英語）は必須です。");
    }
  
    const related_phrases = getArrayValues("kotowaza_related_phrases");
    const kanken_level = parseFloat(getSelectValue("kotowaza_kanken_level")) || 0;
    if (!kanken_level) {
      throw new Error("漢検級（必須）が選択されていません。");
    }
  
    const rawRefs = getObjectArrayValues("kotowaza_references");
    const references = rawRefs.map((ref) => ({
      source: ref.source || "",
      url: ref.url || "",
    }));
  
    return {
      proverb: baseProverb,
      readings,
      meanings: {
        japanese: meaning_jp,
        english: meaning_en,
      },
      explanation: {
        japanese: expl_jp,
        english: expl_en,
      },
      related_phrases,
      kanken_level,
      references,
    };
  }
  