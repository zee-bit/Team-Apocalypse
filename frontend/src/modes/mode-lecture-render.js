const { ipcRenderer } = require('electron') // For IPC
const { DISPLAY_SOURCES, SAVE_PATH } = require('../actions/ipcChannels') // Main Procsses name constants (path relative to the html file)
const { writeFile } = require('fs') // Save video to disk

// DOM Elements

const getSourcesBtn = document.getElementById("getSourcesBtn")
const startBtn = document.getElementById("startBtn")
const pauseBtn = document.getElementById("pauseBtn")
const stopBtn = document.getElementById("stopBtn")
const videoElement = document.getElementsByTagName("video")[0]

// Global Variables

let constraints
let mediaRecorder
let chunks = []

// GUI Updating Methods

guiUpdateOnStart = () => {
  startBtn.innerText = "Recording"
  startBtn.setAttribute("disabled", "true")
  pauseBtn.removeAttribute("disabled")
  stopBtn.removeAttribute('disabled')
}

guiUpdateOnPause = () => {
  pauseBtn.innerText = "Resume ▶"
}

guiUpdateOnResume = () => {
  pauseBtn.innerText = "Pause ⏸"
}

guiUpdateOnStop = () => {
  startBtn.innerText = "Start"
  startBtn.removeAttribute('disabled')
  pauseBtn.setAttribute("disabled", "true")
  stopBtn.setAttribute("disabled", "true")
}

guiUpdateOnSourceSelected = (sourceName) => {
  getSourcesBtn.innerText = sourceName
  startBtn.removeAttribute('disabled')
}

// Assigning events to buttons

startBtn.onclick = e => {
  mediaRecorder.start()
  guiUpdateOnStart()
}

pauseBtn.onclick = e => {
  if (mediaRecorder.state == "recording") {
    mediaRecorder.pause()
    guiUpdateOnPause()
  }
  else if (mediaRecorder.state == "paused") {
    mediaRecorder.resume()
    guiUpdateOnResume()
  }
}

stopBtn.onclick = e => {
  mediaRecorder.stop()
  guiUpdateOnStop()
}

getSourcesBtn.onclick = async (event) => await ipcRenderer.invoke(DISPLAY_SOURCES)

setSelectedSource = (e, selectedSource) => {
  guiUpdateOnSourceSelected(selectedSource.name)
  constraints = selectedSource.constraints
  setupStream()
}
ipcRenderer.on(DISPLAY_SOURCES, setSelectedSource)


// Function to set up stream on GUI using constraints

const setupStream = async () => {
  // Create stream
  let videoStream
  try {
    videoStream = await navigator.mediaDevices.getUserMedia(constraints)
  } catch (err) {
    alert(err);
    console.log(err)
    return
  }

  // Update Stream source in GUI
  videoElement.srcObject = videoStream
  videoElement.play()

  // Sending stream to media recorder
  setUpRecorder(videoStream)
}


// Set up Media Recorder

const setUpRecorder = (stream) => {

  const options = {
    mimeType: 'video/webm',
  }
  mediaRecorder = new MediaRecorder(stream, options)

  // Register event handlers
  mediaRecorder.ondataavailable = handleDataAvailable
  mediaRecorder.onpause = handleRecordingPause
  mediaRecorder.onresume = handleRecordingResume
  mediaRecorder.onstop = handleRecordingStopped
}

// Media Recorder Event Handlers

const handleDataAvailable = async (e) => {
  chunks.push(e.data)
}

const handleRecordingPause = async (e) => {
  return
}

const handleRecordingResume = async (e) => {
  return
}

const handleRecordingStopped = async (e) => {
  ipcRenderer.invoke(SAVE_PATH)
}

// Saving the file after getting saved path from the Dialog box through IPC

handleSavePath = async (e, filePath) => {

  const blob = new Blob(chunks, {
    type: 'video/webm; codecs=vp9'
  })
  const buffer = Buffer.from(await blob.arrayBuffer())

  if (filePath != '') {

    if (filePath.slice(-5) != ".webm")
      filePath += ".webm"

    writeFile(filePath, buffer, () => {
      console.log(`File was saved successfully.`)
      console.log(filePath)
      // Deleting the last recorded chunks stored in this global variable
      chunks = []
    })
  }
}
ipcRenderer.on(SAVE_PATH, handleSavePath)