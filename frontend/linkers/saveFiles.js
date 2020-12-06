exports.saveAsWav = (inputFilePath, outputFilePath, startPosition) => {
  const { PythonShell } = require("python-shell")
  const path = require("path")
  const { callClient } = require('./callClient')

  let options = {
    scriptPath: path.join(__dirname, "/../../backend/scripts"),
    args: [inputFilePath, outputFilePath, startPosition]
  }

  let webm_to_wav = new PythonShell('webm_to_wav.py', options)
  webm_to_wav.on('message', (message) => {
    console.log(startPosition, "Wave: ", message.slice(-26,-4))
    return callClient("all_at_once", outputFilePath, startPosition)
    console.log(startPosition, "Sent to client")
  })

  // PythonShell.run('webm_to_wav.py', options, (err, results) => {
  //   if (err)
  //     console.log("Eror: ", err)
  //   console.log("Results:", results)
  //   callClient("all_at_once", outputFilePath)
  // })
}
















exports.saveAsMp4 = (inputFilePath, outputFilePath) => {
  const { PythonShell } = require("python-shell")
  const path = require("path")

  let options = {
    scriptPath: path.join(__dirname, "/../../backend/scripts"),
    args: [inputFilePath, outputFilePath]
  }

  let webm_to_mp4 = new PythonShell('webm_to_mp4', options, (err, results) => {
    if (err)
      console.log(err)
    console.log("Results:", results)
  })
  webm_to_mp4.on('message', (message) => {
    return message
  })
}
