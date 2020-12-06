const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path')
const { DISPLAY_SOURCES, SAVE_PATH } = require('./actions/ipcChannels')
const { handleSavePath, exitDialog } = require('./actions/dialogs')
const { handleDisplaySources } = require('./actions/displaySources')

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) { // eslint-disable-line global-require
  app.quit();
}

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1000,
    height: 650,
    webPreferences: {
      nodeIntegration: true,
    }
  });

  // and load the index.html of the app.
  mainWindow.loadFile(path.join(__dirname, 'index.html'));

  // Open the DevTools.
<<<<<<< HEAD
  // mainWindow.webContents.openDevTools();

  ipcMain.on('sudo-enlarge', (event, arg) => {
    mainWindow.setSize(2000, 1500)
  })

  ipcMain.on('sudo-shrink', (event, arg) => {
    mainWindow.setSize(1000, 650)
  })
};
=======
  mainWindow.webContents.openDevTools();
}
>>>>>>> 000121f4075505dba2c57d7936129de5afbed6ba

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.



///////////////////////////////////////////////////////////////////////////////////////////////////////////


ipcMain.handle(DISPLAY_SOURCES, handleDisplaySources)
ipcMain.handle(SAVE_PATH, handleSavePath)


///////////////////////////////////////////////////////////////////////////////////////////////////////////


// Live reload using electron-reload
require('electron-reload')(__dirname, {
  electron: require('../node_modules/electron'),
  // electron: require(`${__dirname}/../node_modules/electron`)
  // electron: path.join(__dirname, '/../node_modules/electron'),
  hardResetMethod: 'exit',
  forceHardReset: true
});

// Live reload using electron-reloader
// Both electron and content
// try {
//   require('electron-reloader')(module)
// } catch (_) {}


///////////////////////////////////////////////////////////////////////////////////////////////////////////
