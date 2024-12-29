async function fetchCollectionData(collectionName) {
  try {
    const response = await fetch(`/api/connectMongo?collectionName=${collectionName}`);
    const result = await response.json();

    if (result.data) {
      console.log(`Data from ${collectionName}:`, result.data);
    } else {
      console.error(`No data returned from ${collectionName}`);
    }
  } catch (error) {
    console.error(`Error fetching data from ${collectionName}:`, error);
  }
}

// Test fetching data from multiple collections
//fetchCollectionData("kanji");
//fetchCollectionData("kotowaza");
//fetchCollectionData("radicals");

async function addEntry(collectionName, entry) {
  try {
    const response = await fetch(`/api/connectMongo?collectionName=${collectionName}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(entry),
    });

    const result = await response.json();
    console.log("Add Entry Result:", result);
  } catch (error) {
    console.error("Error adding entry:", error);
  }
}

/*
const newKanjiEntry = {
  character: "新",
  alternate_forms: [],
  radical: "斤",
  stroke_count: 13,
  readings: {
    on: [{ reading: "シン", tags: [""] }],
    kun: [
      { reading: "あたら", okurigana: "しい", tags: [""] },
      { reading: "あら", okurigana: "た", tags: [""] },
      { reading: "にい", okurigana: "", tags: [""] },
      { reading: "さら", okurigana: "", tags: ["表外"] }
    ]
  },
  meanings: {
    japanese: [
      "あたらしい。あらた。あたらしい物事。",
      "あらたにする。あたらしいものにする。あらたまる。",
      "にい。あら。ことばの上につけて「あたらしい」の意を表す。"
    ],
    english: [
      "New. Fresh. Something new or recent.",
      "To renew. To make something new. To change or reform.",
      "Neo-, Nov-. Often used as a prefix in words to indicate newness or recentness."
    ]
  },
  kanken_level: 9.0,
  categories: ["常用漢字", "第１水準"],
  references: [
    { source: "漢字辞典オンライン", url: "https://kanji.jitenon.jp/kanji/163" },
    { source: "漢字ペディア", url: "https://www.kanjipedia.jp/kanji/0003650300" }
  ]
};

addEntry("kanji", newKanjiEntry);*/

