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