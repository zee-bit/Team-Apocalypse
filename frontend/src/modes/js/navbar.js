const ipc = require('electron').ipcRenderer
const { WINDOW_MINIMIZE, WINDOW_MAXIMIZE, WINDOW_CLOSE, SUDO_SHRINK } = require('../actions/ipcChannels')

document.getElementById("btn-minimize").onclick = e => {
  ipc.invoke(WINDOW_MINIMIZE)
}

document.getElementById("btn-maximize").onclick = e => {
  ipc.invoke(WINDOW_MAXIMIZE)
}

document.getElementById("btn-close").onclick = e => {
  ipc.invoke(WINDOW_CLOSE)
}

document.getElementById("btn-back").onclick = e => {
  ipc.invoke(SUDO_SHRINK)
}
