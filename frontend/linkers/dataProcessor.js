exports.appendData = (inputFileName, outputFileName) => {
  const { PythonShell } = require("python-shell")
  const path = require("path")
  const { saveAsWav } = require('./saveFiles')

  let options = {
    scriptPath: path.join(__dirname, "..", "..", "backend", "scripts"),
    args: [filename + '.webm', filename + '.wav']
  }

  let model_data_concatenate = new PythonShell('model_data_concatenate', options)
  model_data_concatenate.on('message', (message) => {
    return
  })
}