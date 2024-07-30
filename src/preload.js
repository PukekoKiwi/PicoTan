const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  send: (channel, data) => ipcRenderer.send(channel, data),
  fetchKanjiData: async () => await ipcRenderer.invoke('fetch-kanji-data')
});
