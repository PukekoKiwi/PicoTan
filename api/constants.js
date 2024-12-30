/**
 * Maps collection names to their corresponding indexed field names.
 * This is used to dynamically construct queries for MongoDB.
 */
export const indexFieldMap = {
    radicals: "character",  // Indexed field for the "radicals" collection
    kanji: "character",     // Indexed field for the "kanji" collection
    words: "word",          // Indexed field for the "words" collection
    yojijukugo: "idiom",    // Indexed field for the "yojijukugo" collection
    kotowaza: "proverb",    // Indexed field for the "kotowaza" collection
  };
  
// constants.js

/**
 * Each collection has a default "shape" that we want
 * to ensure is present in the database even if fields are empty.
 * Also mark which fields are required.
 *
 * The "required" property controls whether we throw an error (or fill in defaults).
 * The "default" property is what we fill in if the user omits the field.
 */

export const collectionSchemas = {
    radicals: {
      character:       { required: true,  default: "" },
      stroke_count:    { required: true,  default: { "$numberInt": "0" } },
      names:           { required: true,  default: [] },
      meaning:         {
        required: true,
        // meaning is nested: { japanese: "", english: "" }
        default: {
          japanese: "",
          english: ""
        }
      }
    },
  
    kanji: {
      character:       { required: true,  default: "" },
      alternate_forms: { required: false, default: [] }, 
      // e.g. [ { character: "", type: ""} ]
      radical:         { required: true,  default: "" },
      stroke_count:    { required: true,  default: { "$numberInt": "0" } },
      readings:        {
        required: true,
        default: {
          on:  [{ reading: "", tags: [] }],
          kun: [{ reading: "", okurigana: "", tags: [] }]
        }
      },
      meanings: {
        required: true,
        default: [
          { japanese: "", english: "" }
        ]
      },
      kanken_level:    { required: true, default: { "$numberDouble": "10.0" } },
      categories:      { required: true, default: [] },
      references:      { required: true, default: [] }
    },
  
    words: {
      word:        { required: true, default: "" },
      meanings:    {
        required: true,
        // typically an array of objects like: [{ japanese: "", english: "", english_extension: "" }]
        default: [
          { japanese: "", english: "", english_extension: "" }
        ]
      },
      synonyms:     { required: false, default: [] },
      antonyms:     { required: false, default: [] },
      readings:     {
        required: true,
        // e.g. [ { reading: "", furigana: "" } ]
        default: [
          { reading: "", furigana: "" }
        ]
      },
      collocations: { required: false, default: [] },
      nuance:       {
        required: false,
        default: {
          japanese: "",
          english: ""
        }
      },
      related_words: { required: false, default: [] },
      kanken_level:  { required: true,  default: { "$numberDouble": "10.0" } },
      references:    { required: false, default: [] },
      other_forms:   { required: false, default: [] }
    },
  
    yojijukugo: {
      idiom:        { required: true, default: "" },
      readings:     {
        required: true,
        default: [
          { reading: "", furigana: "" }
        ]
      },
      meaning:      {
        required: true,
        default: {
          japanese: "",
          english: ""
        }
      },
      explanation:  {
        required: true,
        default: {
          japanese: "",
          english: ""
        }
      },
      source:       { required: false, default: "" },
      synonyms:     { required: false, default: [] },
      antonyms:     { required: false, default: [] },
      tags:         { required: false, default: [] },
      kanken_level: { required: true,  default: { "$numberDouble": "10.0" } },
      references:   { required: false, default: [] }
    },
  
    kotowaza: {
      proverb:      { required: true,  default: "" },
      readings:     {
        required: true,
        default: [
          { reading: "", furigana: "" }
        ]
      },
      meanings:     {
        required: true,
        default: {
          japanese: "",
          english: ""
        }
      },
      explanation:  {
        required: true,
        default: {
          japanese: "",
          english: ""
        }
      },
      related_phrases: { required: false, default: [] },
      kanken_level: { required: true,  default: { "$numberDouble": "10.0" } },
      references:   { required: false, default: [] }
    },
  
    sentences: {
      sentence:         { required: true,  default: "" },
      words_in_sentence:{ required: true,  default: [] },
      explanation:      { required: false, default: "" },
      english:          { required: false, default: "" },
      kanken_level:     { required: true,  default: { "$numberDouble": "10.0" } },
      references:       { required: false, default: [] }
    }
  };
  