const { desktopCapturer, dialog } = require('electron')
const path = require('path')
const { title } = require('process')
const { DISPLAY_SOURCES, SAVE_PATH } = require('./ipcChannels')

// Saving the video dialog

exports.handleSavePath = async (e, saveFormat) => {
  if (saveFormat == ".mp3") {
    dialogTitle = "Save Recording As mp3"
    defaultFileName = `TextronAI-AUD-${Date.now()}.mp3`
  }
  else if (saveFormat == ".mp4") {
    dialogTitle = "Save Recording As mp4"
    defaultFileName = `TextronAI-VID-${Date.now()}.mp4`
  }

  const { filePath } = await dialog.showSaveDialog({
    title: dialogTitle,
    buttonLabel: 'Save Recording',
    defaultPath: path.join(__dirname, "..", "..", "..", "Recordings", defaultFileName)
  })
  e.sender.send(SAVE_PATH, filePath, saveFormat)
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
