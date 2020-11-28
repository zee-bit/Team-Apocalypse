const { desktopCapturer, Menu, dialog } = require('electron')
const { DISPLAY_SOURCES, SAVE_PATH } = require('./ipcChannels')

// Saving the video dialog

exports.handleSaveVideo = async (e) => {
  const { filePath } = await dialog.showSaveDialog({
    buttonLabel: 'Save video',
    defaultPath: `vid-${Date.now()}.webm`
  })
  e.sender.send(SAVE_PATH, filePath)
}