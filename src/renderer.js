let currentKanjiIndex = 0;
let kanjiData = [];

function closeApp(e) {
    e.preventDefault();
    window.api.send('close');
}

document.getElementById('closeBtn').addEventListener('click', closeApp);

window.addEventListener('DOMContentLoaded', async () => {
  kanjiData = await window.api.fetchKanjiData();
  displayKanji(currentKanjiIndex);
});

document.getElementById('nextBtn').addEventListener('click', () => {
  checkAnswer();
  currentKanjiIndex = (currentKanjiIndex + 1) % kanjiData.length;
  displayKanji(currentKanjiIndex);
});

function displayKanji(index) {
  const kanji = kanjiData[index];
  document.getElementById('kanjiTerm').innerText = kanji.termReading.term;
  document.getElementById('kanjiReading').innerText = '';
  document.getElementById('kanjiMeaning').innerText = '';
  document.getElementById('userAnswer').value = '';
}

// Initialize wanakana
const userAnswerInput = document.getElementById('userAnswer');
wanakana.bind(userAnswerInput);

function checkAnswer() {
  const userAnswer = document.getElementById('userAnswer').value;
  const correctReading = kanjiData[currentKanjiIndex].termReading.reading;
  const correctMeaning = kanjiData[currentKanjiIndex].termInfo.意味;

  if (userAnswer === correctReading || userAnswer === correctMeaning) {
    document.getElementById('kanjiReading').innerText = `Reading: ${correctReading}`;
    document.getElementById('kanjiMeaning').innerText = `Meaning: ${correctMeaning}`;
  } else {
    document.getElementById('kanjiReading').innerText = `Incorrect! Correct Reading: ${correctReading}`;
    document.getElementById('kanjiMeaning').innerText = `Correct Meaning: ${correctMeaning}`;
  }
}
