// validation.js
import { collectionSchemas } from "./constants.js";

/**
 * Validates and/or normalizes the user-supplied `newEntry` against
 * the default schema for the given `collectionName`, then applies
 * deeper constraints. If a required field is blank, or a deeper constraint
 * is violated, it throws an Error describing what's wrong.
 *
 * @param {string} collectionName
 * @param {object} newEntry
 * @returns {object} finalEntry - guaranteed to have the minimal shape
 * @throws {Error}
 */
export function validateAndPrepareEntry(collectionName, newEntry) {
  const schema = collectionSchemas[collectionName];
  if (!schema) {
    throw new Error(`No schema found for collection "${collectionName}"`);
  }

  // 1. Create a final object that will hold the validated/merged data
  const finalEntry = {};

  // 2. Merge user data with the schema defaults
  for (const [fieldName, fieldRules] of Object.entries(schema)) {
    const userValue = newEntry[fieldName];

    // If user didn't supply this field at all
    if (userValue === undefined) {
      // We'll fill in the default shape from the schema
      finalEntry[fieldName] = structuredClone(fieldRules.default);
    } else {
      // Otherwise, we use the user-supplied value
      finalEntry[fieldName] = userValue;
    }
  }

  // 3. Now do deeper validations based on collection
  switch (collectionName) {
    case "radicals":
      validateRadicals(finalEntry);
      break;
    case "kanji":
      validateKanji(finalEntry);
      break;
    case "words":
      validateWords(finalEntry);
      break;
    case "yojijukugo":
      validateYojijukugo(finalEntry);
      break;
    case "kotowaza":
      validateKotowaza(finalEntry);
      break;
    case "sentences":
      validateSentences(finalEntry);
      break;
    default:
      // No deeper validation if we haven't coded one
      break;
  }

  return finalEntry;
}

/* ------------------------------------------------------------------
   1) RADICALS
   Must have:
     - character (non-empty)
     - stroke_count
     - at least one name in `names`
     - a `meaning` object with at least a Japanese meaning
------------------------------------------------------------------ */
function validateRadicals(finalEntry) {
  const errors = [];

  // character must not be empty
  if (!finalEntry.character?.trim()) {
    errors.push("Field 'character' is required and cannot be empty for radicals.");
  }

  // names must be a non-empty array
  if (!Array.isArray(finalEntry.names) || finalEntry.names.length === 0) {
    errors.push("Field 'names' must be a non-empty array for radicals.");
  }

  // meaning.japanese must be non-empty
  if (!finalEntry.meaning?.japanese?.trim()) {
    errors.push("Field 'meaning.japanese' is required and cannot be empty for radicals.");
  }

  if (errors.length > 0) {
    throw new Error(`Radicals validation failed:\n- ${errors.join("\n- ")}`);
  }
}

/* ------------------------------------------------------------------
   2) KANJI
   Must have:
     - character (non-empty)
     - stroke_count
     - radical (non-empty)
     - at least one reading in on or kun
     - at least one Japanese meaning
     - at least one category
     - at least one reference
     - a kanken level
   We'll also do deeper checks: 
     - `readings.on` => array of { reading, tags[] }
     - `readings.kun` => array of { reading, okurigana, tags[] }
------------------------------------------------------------------ */
function validateKanji(finalEntry) {
  const errors = [];

  // character must not be empty
  if (!finalEntry.character?.trim()) {
    errors.push("Field 'character' is required and cannot be empty for kanji.");
  }

  // radical must not be empty
  if (!finalEntry.radical?.trim()) {
    errors.push("Field 'radical' is required and cannot be empty for kanji.");
  }

  // readings.on => must be an array, each element must have reading + tags array
  if (!Array.isArray(finalEntry.readings?.on)) {
    errors.push("Field 'readings.on' must be an array.");
  } else if (finalEntry.readings.on.length === 0 && (!finalEntry.readings?.kun || finalEntry.readings.kun.length === 0)) {
    // If on is empty, we better check kun isn't empty
    errors.push("Kanji must have at least one reading in on[] or kun[].");
  } else {
    // Validate each object in on[]
    finalEntry.readings.on.forEach((onObj, i) => {
      if (typeof onObj.reading !== "string" || !onObj.reading.trim()) {
        errors.push(`'readings.on[${i}].reading' must be a non-empty string.`);
      }
      if (!Array.isArray(onObj.tags)) {
        errors.push(`'readings.on[${i}].tags' must be an array.`);
      }
    });
  }

  // readings.kun => must be an array, each element must have reading + okurigana + tags array
  if (!Array.isArray(finalEntry.readings?.kun)) {
    errors.push("Field 'readings.kun' must be an array.");
  } else if (finalEntry.readings.kun.length === 0 && (!finalEntry.readings?.on || finalEntry.readings.on.length === 0)) {
    // If kun is empty, we better check on isn't empty
    errors.push("Kanji must have at least one reading in on[] or kun[].");
  } else {
    // Validate each object in kun[]
    finalEntry.readings.kun.forEach((kunObj, i) => {
      if (typeof kunObj.reading !== "string") {
        errors.push(`'readings.kun[${i}].reading' must be a string.`);
      }
      if (typeof kunObj.okurigana !== "string") {
        errors.push(`'readings.kun[${i}].okurigana' must be a string.`);
      }
      if (!Array.isArray(kunObj.tags)) {
        errors.push(`'readings.kun[${i}].tags' must be an array.`);
      }
    });
  }

  // meanings => must be a non-empty array
  if (!Array.isArray(finalEntry.meanings) || finalEntry.meanings.length === 0) {
    errors.push("'meanings' must be a non-empty array for kanji.");
  } else {
    // Check that at least one meaning has a non-empty japanese field
    const hasValidJapanese = finalEntry.meanings.some(
      (meaning) => meaning.japanese?.trim()
    );

    if (!hasValidJapanese) {
      errors.push("At least one object in 'meanings' must have a non-empty 'japanese' field.");
    }

    // Validate each meaning object (allowing english to be empty)
    finalEntry.meanings.forEach((meaning, i) => {
      if (!meaning.japanese?.trim()) {
        errors.push(`'meanings[${i}].japanese' is required and cannot be empty.`);
      }
      if (meaning.english !== undefined && typeof meaning.english !== "string") {
        errors.push(`'meanings[${i}].english' must be a string if provided.`);
      }
    });
  }

  // categories => must be an array, non-empty
  if (!Array.isArray(finalEntry.categories) || finalEntry.categories.length === 0) {
    errors.push("Field 'categories' must be a non-empty array for kanji.");
  }

  // references => must be an array, non-empty
  if (!Array.isArray(finalEntry.references) || finalEntry.references.length === 0) {
    errors.push("Field 'references' must be a non-empty array for kanji.");
  }

  if (errors.length > 0) {
    throw new Error(`Kanji validation failed:\n- ${errors.join("\n- ")}`);
  }
}

/* ------------------------------------------------------------------
   3) WORDS
   Must have:
     - word (non-empty)
     - at least one meaning with japanese text
     - at least one reading
     - kanken_level
------------------------------------------------------------------ */
function validateWords(finalEntry) {
  const errors = [];

  // word => non-empty
  if (!finalEntry.word?.trim()) {
    errors.push("Field 'word' is required and cannot be empty for words.");
  }

  // meanings => array, at least one with a Japanese meaning
  if (!Array.isArray(finalEntry.meanings) || finalEntry.meanings.length === 0) {
    errors.push("Field 'meanings' must be a non-empty array for words.");
  } else {
    // Check that at least one item has a non-empty japanese string
    const hasJapaneseMeaning = finalEntry.meanings.some(
      (m) => m.japanese && m.japanese.trim().length > 0
    );
    if (!hasJapaneseMeaning) {
      errors.push("At least one object in 'meanings' must have a non-empty 'japanese' field for words.");
    }
  }

  // readings => array, at least one item
  if (!Array.isArray(finalEntry.readings) || finalEntry.readings.length === 0) {
    errors.push("Field 'readings' must be a non-empty array for words.");
  } else {
    finalEntry.readings.forEach((r, i) => {
      if (!r.reading?.trim()) {
        errors.push(`'readings[${i}].reading' must be a non-empty string for words.`);
      }
    });
  }

  if (errors.length > 0) {
    throw new Error(`Words validation failed:\n- ${errors.join("\n- ")}`);
  }
}

/* ------------------------------------------------------------------
   4) YOJIJUKUGO
   Must have:
     - idiom (non-empty)
     - at least one reading
     - a meaning with japanese
     - an explanation with japanese
     - a kanken level
     - a reference (?)
     (You mentioned you have references in your sample data, so let's require it.)
------------------------------------------------------------------ */
function validateYojijukugo(finalEntry) {
  const errors = [];

  if (!finalEntry.idiom?.trim()) {
    errors.push("Field 'idiom' is required and cannot be empty for yojijukugo.");
  }

  if (!Array.isArray(finalEntry.readings) || finalEntry.readings.length === 0) {
    errors.push("Field 'readings' must be a non-empty array for yojijukugo.");
  } else {
    finalEntry.readings.forEach((r, i) => {
      if (!r.reading?.trim()) {
        errors.push(`'readings[${i}].reading' must be non-empty for yojijukugo.`);
      }
    });
  }

  // meaning.japanese
  if (!finalEntry.meaning?.japanese?.trim()) {
    errors.push("Field 'meaning.japanese' is required and cannot be empty for yojijukugo.");
  }

  // explanation.japanese
  if (!finalEntry.explanation?.japanese?.trim()) {
    errors.push("Field 'explanation.japanese' is required and cannot be empty for yojijukugo.");
  }

  // references
  if (!Array.isArray(finalEntry.references) || finalEntry.references.length === 0) {
    errors.push("Field 'references' must be a non-empty array for yojijukugo.");
  }

  if (errors.length > 0) {
    throw new Error(`Yojijukugo validation failed:\n- ${errors.join("\n- ")}`);
  }
}

/* ------------------------------------------------------------------
   5) KOTOWAZA
   Must have:
     - proverb (non-empty)
     - at least one reading
     - meanings (with japanese)
     - explanation (with japanese)
     - kanken level
     - references
------------------------------------------------------------------ */
function validateKotowaza(finalEntry) {
  const errors = [];

  if (!finalEntry.proverb?.trim()) {
    errors.push("Field 'proverb' is required and cannot be empty for kotowaza.");
  }

  if (!Array.isArray(finalEntry.readings) || finalEntry.readings.length === 0) {
    errors.push("Field 'readings' must be a non-empty array for kotowaza.");
  } else {
    finalEntry.readings.forEach((r, i) => {
      if (!r.reading?.trim()) {
        errors.push(`'readings[${i}].reading' must be a non-empty string for kotowaza.`);
      }
    });
  }

  if (!finalEntry.meanings?.japanese?.trim()) {
    errors.push("Field 'meanings.japanese' is required and cannot be empty for kotowaza.");
  }

  if (!finalEntry.explanation?.japanese?.trim()) {
    errors.push("Field 'explanation.japanese' is required and cannot be empty for kotowaza.");
  }

  // references => if we want at least one reference
  if (!Array.isArray(finalEntry.references) || finalEntry.references.length === 0) {
    errors.push("Field 'references' must be a non-empty array for kotowaza.");
  }

  if (errors.length > 0) {
    throw new Error(`Kotowaza validation failed:\n- ${errors.join("\n- ")}`);
  }
}

/* ------------------------------------------------------------------
   6) SENTENCES
   Must have:
     - sentence (non-empty)
     - at least 2 words in words_in_sentence
     - all kanji in the sentence must appear in the union of words_in_sentence
     - kanken level
------------------------------------------------------------------ */
function validateSentences(finalEntry) {
  const errors = [];

  if (!finalEntry.sentence?.trim()) {
    errors.push("Field 'sentence' is required and cannot be empty for sentences.");
  }

  // words_in_sentence => must have at least 2 items
  if (!Array.isArray(finalEntry.words_in_sentence) || finalEntry.words_in_sentence.length < 2) {
    errors.push("Field 'words_in_sentence' must be an array of at least 2 items for sentences.");
  }

  // Check that all kanji in the sentence appear among the words in words_in_sentence
  const sentenceKanji = extractKanji(finalEntry.sentence);
  if (sentenceKanji.length > 0) {
    // Combine all words into a big string for naive check
    const combinedWords = finalEntry.words_in_sentence.join("");
    sentenceKanji.forEach((k) => {
      if (!combinedWords.includes(k)) {
        errors.push(`Kanji '${k}' in sentence not found in words_in_sentence.`);
      }
    });
  }

  if (errors.length > 0) {
    throw new Error(`Sentence validation failed:\n- ${errors.join("\n- ")}`);
  }
}

/* ------------------------------------------------------------------
   Helper: Extract all CJK Kanji from a string using the Basic CJK range.
------------------------------------------------------------------ */
function extractKanji(str) {
  if (!str) return [];
  return Array.from(str.matchAll(/[\u4E00-\u9FFF]/g)).map((m) => m[0]);
}
