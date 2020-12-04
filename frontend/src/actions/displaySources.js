const { Menu, desktopCapturer } = require('electron')
const { DISPLAY_SOURCES } = require('./ipcChannels')

// Returns Source Name and Constraint Dictionary

onSelectSource = (source) => {

  return {
    "name": source.name,
    "constraints": {
      audio: false,
      video: {
        mandatory: {
          chromeMediaSource: 'desktop',
          chromeMediaSourceId: source.id
        }
      }
    }
  }
}

// Displays Popus Menu for Sources

exports.handleDisplaySources = async (e) => {

  // Gets the names of the available screens and windows
  const inputSources = await desktopCapturer.getSources({
    types: ['window', 'screen']
  });

  // console.log(inputSources)

  // Builds a menu using Electron Menu Class
  const videoOptionsMenu = Menu.buildFromTemplate(
    inputSources.map(source => {
      return {
        label: source.name,
        click: () => {
          let selectedSource = onSelectSource(source)
          e.sender.send(DISPLAY_SOURCES, selectedSource)
        }
      }
    })
  )

  // Show popup menu
  videoOptionsMenu.popup()
}
