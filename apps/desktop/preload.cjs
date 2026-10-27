// The only bridge into the page: a way to receive .tavla files opened from Finder.
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('tavlaDesktop', {
  platform: process.platform,
  onOpenFile: (cb) => ipcRenderer.on('tavla:open-file', (_e, file) => cb(file)),
});
