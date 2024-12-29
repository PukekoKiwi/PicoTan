async function fetchKanji() {
    try {
      const response = await fetch("/api/connectMongo");
      const data = await response.json();
      console.log("Kanji Data:", data);
    } catch (error) {
      console.error("Error fetching kanji:", error);
    }
  }
  
  fetchKanji();
  