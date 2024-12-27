import {
    loadAllData,
    searchKanji,
    searchWords,
    searchYojijukugo
  } from './dataManager.js';
  
  document.addEventListener('DOMContentLoaded', async () => {
    // 1. Load data once the page is ready
    await loadAllData();
  
    // 2. Grab DOM elements
    const searchTypeSelect = document.querySelector('#search-type');
    const searchInput = document.querySelector('#search-input');
    const searchBtn = document.querySelector('#search-btn');
    const resultsContainer = document.querySelector('#results-container');
  
    // 3. Attach Event Listeners
    searchBtn.addEventListener('click', () => {
      const searchMode = searchTypeSelect.value;
      const query = searchInput.value.trim();
      if (!query) return;
  
      let results = [];
  
      if (searchMode === 'kanji') {
        results = searchKanji(query);
      } else if (searchMode === 'word') {
        results = searchWords(query);
      } else if (searchMode === 'idiom') {
        results = searchYojijukugo(query);
      }
  
      // 4. Clear old results
      resultsContainer.innerHTML = '';
  
      // 5. Render new results
      if (results.length === 0) {
        const noResult = document.createElement('p');
        noResult.textContent = '該当なし。';
        resultsContainer.appendChild(noResult);
      } else {
        results.forEach(item => {
          // Basic example of how to render
          const div = document.createElement('div');
          div.classList.add('search-results__item');
  
          // Kanji example
          if (searchMode === 'kanji') {
            div.textContent = `漢字: ${item.character}, 意味: ${item.meaning}`;
          }
          // Word example
          else if (searchMode === 'word') {
            div.textContent = `言葉: ${item.word}, 意味: ${item.meaning}`;
          }
          // Idiom example
          else if (searchMode === 'idiom') {
            div.textContent = `四字熟語: ${item.idiom}, 意味: ${item.meaning}`;
          }
  
          resultsContainer.appendChild(div);
        });
      }
    });
  });
  