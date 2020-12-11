const { desktopCapturer, dialog } = require('electron')
const path = require('path')
const { DISPLAY_SOURCES, SAVE_PATH } = require('./ipcChannels')

// Saving the video dialog

exports.handleSavePath = async (e) => {
  const { filePath } = await dialog.showSaveDialog({
    title: 'Save Video As mp4',
    buttonLabel: 'Save video',
    defaultPath: path.join(__dirname, "..", "..", "..", "Recordings", `TextronAI-${Date.now()}.mp4`)
  })
  e.sender.send(SAVE_PATH, filePath)
}

// Exit dialog

exports.exitDialog = async () => {
  const { optionNumber } = await dialog.showMessageBoxSync({
    type: "question",
    buttons: [
      "&Cancel",
      "&Yes"
    ],
    defaultId: 0,
    title: "Textron AI",
    message: "Do you really want to exit?",
    cancelId: 0,
    noLink: false,
    normalizeAccessKeys: true
  })
  return optionNumber
}
