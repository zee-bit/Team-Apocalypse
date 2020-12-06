exports.callClient = (query, filePath, startPosition) => {
  const { PythonShell } = require("python-shell")
  const path = require("path")
  const { ipcRenderer } = require('electron') // For IPC

  let options = {
    scriptPath: path.join(__dirname, "/../../backend"),
    args: [query, filePath]
  }

  let callClient = new PythonShell('client.py', options)
  callClient.on('message', (message) => {
    // console.log(startPosition, message)
    ipcRenderer.invoke("TRANSCRIBED",startPosition,message)
  })
}
