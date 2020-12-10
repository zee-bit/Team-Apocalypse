const path = require('path')
const { app, BrowserWindow, ipcMain, screen } = require('electron')
const { WINDOW_MINIMIZE, WINDOW_MAXIMIZE, WINDOW_CLOSE, DISPLAY_SOURCES, SAVE_PATH, SUDO_DOCKED, SUDO_ENLARGE, SUDO_SHRINK } = require('./actions/ipcChannels')
const { handleSavePath } = require('./actions/dialogs')
const { handleDisplaySources } = require('./actions/displaySources')
const { createTempFolder } = require("./actions/utilityFunctions")

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) { // eslint-disable-line global-require
  app.quit();
}

let mainWindow

const createWindow = () => {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 1000,
    height: 650,
    autoHideMenuBar: true,
    frame: false,
    webPreferences: {
      nodeIntegration: true,
    }
  });

  // and load the index.html of the app.
  mainWindow.loadFile(path.join(__dirname, 'modes/index.html'));

  // Open the DevTools.
  // mainWindow.webContents.openDevTools();
};

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

// Create temp folder if folder unavailable
app.on('ready', () => createTempFolder())

ipcMain.handle(WINDOW_MINIMIZE, handleWindowMinimize = (e) => {
  mainWindow.minimize()
})
ipcMain.handle(WINDOW_MAXIMIZE, handleWindowMaximize = (e) => {
  if (mainWindow.isMaximized())
    mainWindow.unmaximize()
  else
    mainWindow.maximize()
})
ipcMain.handle(WINDOW_CLOSE, handleWindowClose = (e) => {
  mainWindow.close()
})

ipcMain.handle(DISPLAY_SOURCES, handleDisplaySources)
ipcMain.handle(SAVE_PATH, handleSavePath)

resizeAndCentre = (w, h) => {
  let { width, height } = screen.getPrimaryDisplay().workAreaSize
  mainWindow.setBounds({ x: Math.floor((width - w) / 2), y: Math.floor((height - h) / 2), width: w, height: h })
}

ipcMain.handle(SUDO_ENLARGE, (event, arg) => {
  let { width, height } = screen.getPrimaryDisplay().workAreaSize
  mainWindow.setBounds({ x: 50, y: 50, width: width - 100, height: height - 100 })
})

ipcMain.handle(SUDO_SHRINK, (event, arg) => resizeAndCentre(1000, 650))

ipcMain.handle(SUDO_DOCKED, (event, arg) => resizeAndCentre(630, 200))


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
