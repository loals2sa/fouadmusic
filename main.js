const { app, BrowserWindow, ipcMain, dialog, Menu } = require('electron');
const path = require('path');
const fs = require('fs');
const ytdl = require('ytdl-core');
const Store = require('electron-store');

const store = new Store();

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1000,
    minHeight: 700,
    backgroundColor: '#0a0a0a',
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true
    },
    icon: path.join(__dirname, 'assets/icon.png'),
    frame: true,
    titleBarStyle: 'default'
  });

  mainWindow.loadFile('index.html');
  
  // Create application menu
  const menu = Menu.buildFromTemplate([
    {
      label: 'File',
      submenu: [
        { label: 'Add Music', click: () => addMusic() },
        { label: 'Download from URL', click: () => mainWindow.webContents.send('open-download-dialog') },
        { type: 'separator' },
        { label: 'Exit', click: () => app.quit() }
      ]
    },
    {
      label: 'View',
      submenu: [
        { label: 'Toggle Developer Tools', role: 'toggleDevTools' },
        { type: 'separator' },
        { label: 'Reload', role: 'reload' }
      ]
    },
    {
      label: 'Help',
      submenu: [
        { label: 'About Fouad Music', click: () => {
          dialog.showMessageBox(mainWindow, {
            title: 'About Fouad Music',
            message: 'Fouad Music v1.0.0',
            detail: 'Advanced Music Player with Mixer Controls\n\nFeatures:\n• Audio Download from URLs\n• Advanced Equalizer\n• Bass Booster\n• Animated Backgrounds\n• Playlist Management',
            type: 'info'
          });
        }}
      ]
    }
  ]);
  Menu.setApplicationMenu(menu);
}

function addMusic() {
  dialog.showOpenDialog(mainWindow, {
    properties: ['openFile', 'multiSelections'],
    filters: [
      { name: 'Audio Files', extensions: ['mp3', 'wav', 'ogg', 'flac', 'm4a', 'aac', 'webm'] }
    ]
  }).then(result => {
    if (!result.canceled && result.filePaths.length > 0) {
      mainWindow.webContents.send('files-added', result.filePaths);
    }
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// IPC Handlers
ipcMain.on('add-music-file', () => {
  addMusic();
});

ipcMain.on('download-music', async (event, url) => {
  try {
    const savePath = dialog.showSaveDialogSync(mainWindow, {
      title: 'Save Music File',
      defaultPath: 'audio.mp3',
      filters: [{ name: 'Audio', extensions: ['mp3'] }]
    });

    if (!savePath) {
      event.reply('download-status', { success: false, message: 'Download cancelled' });
      return;
    }

    event.reply('download-status', { success: true, message: 'Downloading...', progress: 0 });

    const info = await ytdl.getInfo(url);
    const audioFormat = ytdl.chooseFormat(info.formats, { quality: 'highestaudio' });
    
    const writeStream = fs.createWriteStream(savePath);
    const readStream = ytdl(url, { format: audioFormat });

    let downloadedBytes = 0;
    const totalBytes = parseInt(audioFormat.contentLength || 0);

    readStream.on('data', (chunk) => {
      downloadedBytes += chunk.length;
      const progress = totalBytes > 0 ? (downloadedBytes / totalBytes) * 100 : 0;
      event.reply('download-progress', progress);
    });

    readStream.pipe(writeStream);

    writeStream.on('finish', () => {
      event.reply('download-status', { 
        success: true, 
        message: 'Download complete!', 
        filePath: savePath 
      });
    });

    writeStream.on('error', (error) => {
      event.reply('download-status', { 
        success: false, 
        message: 'Download failed: ' + error.message 
      });
    });

  } catch (error) {
    event.reply('download-status', { 
      success: false, 
      message: 'Error: ' + error.message 
    });
  }
});

// Save/Load playlists
ipcMain.on('save-playlist', (event, playlist) => {
  store.set('playlist', playlist);
  event.reply('playlist-saved', { success: true });
});

ipcMain.on('load-playlist', (event) => {
  const playlist = store.get('playlist', []);
  event.reply('playlist-loaded', playlist);
});

// Save settings
ipcMain.on('save-settings', (event, settings) => {
  store.set('settings', settings);
});

ipcMain.on('load-settings', (event) => {
  const settings = store.get('settings', {
    volume: 0.7,
    bass: 0,
    equalizer: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
  });
  event.reply('settings-loaded', settings);
});
