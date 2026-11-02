// OpenTempl desktop. Serves the built editor from a private tavla:// origin so
// designs saved in IndexedDB stay put between launches, and opens .tavla files.
const { app, BrowserWindow, protocol, net, shell, Menu } = require('electron');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const fs = require('node:fs');

protocol.registerSchemesAsPrivileged([
  // The scheme keeps its old name on purpose: IndexedDB is keyed by origin, and a new one would hide saved designs.
  { scheme: 'tavla', privileges: { standard: true, secure: true, supportFetchAPI: true, corsEnabled: true, stream: true } },
]);

const APP_DIR = path.join(__dirname, 'app');
let win = null;
let pendingFile = null;

function createWindow() {
  win = new BrowserWindow({
    width: 1440,
    height: 920,
    minWidth: 960,
    minHeight: 640,
    backgroundColor: '#EDEDF0',
    titleBarStyle: 'hiddenInset',
    trafficLightPosition: { x: 14, y: 17 },
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      sandbox: true,
      nodeIntegration: false,
    },
  });
  win.loadURL('tavla://app/index.html');
  // Links leave the app for the real browser.
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (/^https?:/.test(url)) shell.openExternal(url);
    return { action: 'deny' };
  });
  win.webContents.on('will-navigate', (e, url) => {
    if (!url.startsWith('tavla://')) {
      e.preventDefault();
      shell.openExternal(url);
    }
  });
  win.webContents.on('did-finish-load', () => {
    if (pendingFile) openFile(pendingFile);
  });
}

function openFile(file) {
  if (!win) {
    pendingFile = file;
    return;
  }
  const bytes = fs.readFileSync(file);
  win.webContents.send('tavla:open-file', { name: path.basename(file), bytes });
  pendingFile = null;
}

app.on('open-file', (e, file) => {
  e.preventDefault();
  openFile(file);
});

app.whenReady().then(() => {
  protocol.handle('tavla', (req) => {
    const { pathname } = new URL(req.url);
    const target = path.normalize(path.join(APP_DIR, decodeURIComponent(pathname)));
    if (!target.startsWith(APP_DIR)) return new Response('Not found', { status: 404 });
    const file = fs.existsSync(target) && fs.statSync(target).isFile() ? target : path.join(APP_DIR, 'index.html');
    return net.fetch(pathToFileURL(file).toString());
  });
  Menu.setApplicationMenu(
    Menu.buildFromTemplate([
      ...(process.platform === 'darwin' ? [{ role: 'appMenu' }] : []),
      { role: 'fileMenu' },
      { role: 'editMenu' },
      { label: 'View', submenu: [{ role: 'reload' }, { role: 'toggleDevTools' }, { type: 'separator' }, { role: 'togglefullscreen' }] },
      { role: 'windowMenu' },
    ]),
  );
  createWindow();
  const arg = process.argv.find((a) => /\.(opentempl|tavla|pptx|pdf)$/i.test(a));
  if (arg) openFile(arg);
  app.on('activate', () => BrowserWindow.getAllWindows().length === 0 && createWindow());
});

app.on('window-all-closed', () => process.platform !== 'darwin' && app.quit());
