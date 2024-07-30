const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true // Ensure context isolation for security
    },
    frame: false, // This removes the default window frame
  });

  mainWindow.loadFile('src/index.html');
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// Listen for 'close' event from renderer process
ipcMain.on('close', () => {
  app.quit();
});

// Send kanji data to renderer process
ipcMain.handle('fetch-kanji-data', () => {
  const dataPath = path.join(__dirname, 'data', 'kanji-de-go.json');
  const jsonData = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
  return jsonData;
});
