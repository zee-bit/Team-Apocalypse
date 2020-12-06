const { ipcRenderer } = require('electron') // For IPC
const path = require('path') // For joining paths
const { DISPLAY_SOURCES, SAVE_PATH } = require('../actions/ipcChannels') // Main Procsses name constants (path relative to the html file)
const { writeFile } = require('fs') // Save video to disk
const { PythonShell } = require("python-shell") // Run python scripts

// Resize window
ipcRenderer.send('sudo-docked')

// DOM Elements

const getSourcesBtn = document.getElementById("getSourcesBtn")
const startBtn = document.getElementById("startBtn")
const pauseBtn = document.getElementById("pauseBtn")
const stopBtn = document.getElementById("stopBtn")
const saveBtn = document.getElementById("saveBtn")
const newRecordingBtn = document.getElementById("newRecordingBtn")
const backButton = document.getElementById("back-button")
const transcribedTextElement = document.getElementById("transcribedTextElement")
const finalTranscribedTextElement = document.getElementById("finalTranscribedTextElement")

// Global Variables

let mediaRecorder
let chunks = []
let timeslice = 5000
let tempDirectory = path.join(__dirname, "../../../backend/temp/")
let scriptDirectory = path.join(__dirname, "../../../backend/scripts/")
let sliceIndex = -1
let totalDuration = 0
let wavDurations = {}
let finalTranscribedText = {}
let finalFilePaths = []

// ------------------------GUI Updating Methods------------------------

guiUpdateOnStop = () => {
  startBtn.innerText = "Start"
  startBtn.setAttribute("disabled", "true")
  pauseBtn.setAttribute("disabled", "true")
  stopBtn.setAttribute("disabled", "true")
  saveBtn.removeAttribute("disabled")
}

guiUpdateOnResume = () => {
  pauseBtn.innerText = "Pause ⏸"
}

guiUpdateOnPause = () => {
  pauseBtn.innerText = "Resume ▶"
}

guiUpdateOnStart = () => {
  startBtn.innerText = "Recording"
  getSourcesBtn.setAttribute("disabled", "true")
  startBtn.setAttribute("disabled", "true")
  pauseBtn.removeAttribute("disabled")
  stopBtn.removeAttribute("disabled")
  newRecordingBtn.removeAttribute("disabled")
}

guiUpdateOnSourceAvailable = (sourceName) => {
  getSourcesBtn.innerText = sourceName
  startBtn.removeAttribute('disabled')
}

guiUpdateOnSourceUnavailable = error => {
  alert("Could not find the Source. Please select again.")
  guiUpdateOnNew()
}

guiUpdateOnNew = () => {
  // videoElement.srcObject = null
  getSourcesBtn.removeAttribute("disabled")
  // getSourcesBtn.innerText = "Select Video Source 📸"
  if (mediaRecorder != undefined)
    startBtn.removeAttribute("disabled")
  pauseBtn.setAttribute("disabled", "true")
  stopBtn.setAttribute("disabled", "true")
  saveBtn.setAttribute("disabled", "true")
  newRecordingBtn.setAttribute("disabled", "true")
  transcribedTextElement.innerHTML = ""
  finalTranscribedTextElement.innerHTML = ""
}

// --------------------Assigning events to buttons-------------------

saveBtn.onclick = e => ipcRenderer.invoke(SAVE_PATH)

stopBtn.onclick = e => {
  mediaRecorder.stop()
  guiUpdateOnStop()
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

startBtn.onclick = e => {
  mediaRecorder.start(timeslice)
  guiUpdateOnStart()
}

backButton.onclick = e => {
  ipcRenderer.send('sudo-shrink')
}

getSourcesBtn.onclick = (event) => ipcRenderer.invoke(DISPLAY_SOURCES)


handleNewRecording = (event) => {
  if (finalFilePaths != [])
    deleteChunkFiles(finalFilePaths)
  finalFilePaths = []
  chunks = []
  sliceIndex = -1
  totalDuration = 0
  wavDurations = {}
  finalTranscribedText = {}
  guiUpdateOnNew()
}
newRecordingBtn.onclick = handleNewRecording

// ----------------Handle Returns from Scripts----------------

const handleDisplayTranscribed = (transcribedText, chunkIndex) => {
  console.log(chunkIndex, transcribedText)
  if (chunkIndex != -1)
    transcribedTextElement.innerHTML = transcribedTextElement.innerHTML + " " + transcribedText
  else {
    finalTranscribedTextElement.innerHTML = transcribedText
    console.log(finalTranscribedText)
  }
  finalTranscribedText[chunkIndex] = transcribedText
}

handleLastWavDuration = (duration, chunkIndex) => {
  wavDurations[chunkIndex] = parseFloat(duration)
  totalDuration += parseFloat(duration)
  return
}

// ---------------------------Linkers---------------------------

// Convert to mp4

const saveAsMp4 = (inputFileName, outputFileName) => {
  const { PythonShell } = require("python-shell")
  const path = require("path")

  let options = {
    scriptPath: scriptDirectory,
    args: [inputFileName, outputFileName]
  }

  let webm_to_mp4 = new PythonShell('webm_to_mp4.py', options)
  webm_to_mp4.on('message', (message) => {
    return
  })
}

// Delete the Temporary Chunk Files
deleteChunkFiles = async (list) => {

  let options = {
    scriptPath: scriptDirectory,
    args: list
  }

  let delete_Files = new PythonShell('delete_files.py', options)
  delete_Files.on('message', (success) => {
    return
  })
}

// Get the wav file Length
getLastWavDuration = (wavFilePath, chunkIndex) => {

  let options = {
    scriptPath: scriptDirectory,
    args: [wavFilePath, chunkIndex]
  }

  let wav_duration = new PythonShell('wav_duration.py', options)
  wav_duration.on('message', (duration) => {
    handleLastWavDuration(duration, chunkIndex)
  })
}

// Get Transcribed Text From the Server By Running Client Script 
callClient = (query, webmFilePath, wavFilePath, wavFileName, chunkIndex) => {

  let options = {
    scriptPath: path.join(__dirname, "/../../../backend"),
    args: [query, wavFilePath]
  }

  let call_Client = new PythonShell('client.py', options)
  call_Client.on('message', (transcribedText) => {
    handleDisplayTranscribed(transcribedText, chunkIndex)
    if (chunkIndex != -1)
      deleteChunkFiles([webmFilePath, wavFilePath])
  })
}

// Save webm file to wav
saveAsWav = (webmFilePath, wavFilePath, startTime, wavFileName, chunkIndex) => {

  let options = {
    scriptPath: scriptDirectory,
    args: [webmFilePath, wavFilePath, `${startTime}s`]
  }

  let webm_to_wav = new PythonShell('webm_to_wav.py', options)
  webm_to_wav.on('message', (filePath) => {
    callClient("all_at_once", webmFilePath, wavFilePath, wavFileName, chunkIndex)
    getLastWavDuration(wavFilePath, chunkIndex)
  })
}

// Saving the file after getting saved path from the Dialog box through IPC

saveLecture = (e, savePath) => {
  if (savePath != '') {
    if (savePath.slice(-4) != ".mp4")
      savePath += ".mp4"
    saveAsMp4(finalFilePaths[0], savePath)
  }
  return
}
ipcRenderer.on(SAVE_PATH, saveLecture)

// Save the Buffer

saveAndConvertBuffer = (buffer, startTime, creationTime, chunkIndex) => {

  let webmFileName, webmFilePath, wavFileName, wavFilePath
  if (chunkIndex == -1) {
    webmFileName = "final-webm-" + creationTime
    wavFileName = "final-wav-" + creationTime
    webmFilePath = path.join(tempDirectory, webmFileName + ".webm")
    wavFilePath = path.join(tempDirectory, wavFileName + ".wav")
    finalFilePaths = [webmFilePath, wavFilePath]
  } else {
    webmFileName = "chunk-webm-" + creationTime
    wavFileName = "chunk-wav-" + creationTime
    webmFilePath = path.join(tempDirectory, webmFileName + ".webm")
    wavFilePath = path.join(tempDirectory, wavFileName + ".wav")
  }

  writeFile(webmFilePath, buffer, () => {
    saveAsWav(webmFilePath, wavFilePath, startTime, wavFileName, chunkIndex)
  })
}

// Async convert to Buffer

const convertToBuffer = async (chunks, startTime, chunkIndex) => {
  let creationTime = Date.now().toString()
  let blob = new Blob(chunks, {
    type: 'video/webm; codecs=vp9'
  })
  let buffer = Buffer.from(await blob.arrayBuffer())
  saveAndConvertBuffer(buffer, startTime, creationTime, chunkIndex)
}

// Get startTime

const getStartTime = (chunkIndex) => {
  return totalDuration.toFixed(3)
}

// Media Recorder Event Handlers

const handleRecordingStart = (e) => {
  return
}

const handleDataAvailable = (e) => {
  sliceIndex++
  chunks.push(e.data)
  convertToBuffer(chunks, getStartTime(sliceIndex), sliceIndex)
  return
}

const handleRecordingPause = (e) => {
  let chunk = mediaRecorder.requestData()
  return
}

const handleRecordingResume = (e) => {
  return
}

const handleRecordingStopped = (e) => {
  convertToBuffer(chunks, 0, -1)
  // setTimeout(convertToBuffer(chunks, 0),2000s)
  return
}

// Set up Media Recorder

const setUpRecorder = (videoStream) => {

  const options = {
    mimeType: 'video/webm',
  }
  mediaRecorder = new MediaRecorder(videoStream, options)

  // Register recorder event handlers
  mediaRecorder.onstart = handleRecordingStart
  mediaRecorder.ondataavailable = handleDataAvailable
  mediaRecorder.onpause = handleRecordingPause
  mediaRecorder.onresume = handleRecordingResume
  mediaRecorder.onstop = handleRecordingStopped
}

// Function to set up stream on GUI using constraints

const setupStream = async (e, selectedSource) => {

  let videoStream
  try {
    videoStream = await navigator.mediaDevices.getUserMedia(selectedSource.constraints)
  } catch (err) {
    guiUpdateOnSourceUnavailable(err)
    return
  }

  // Sending stream to media recorder
  setUpRecorder(videoStream)

  // Update Stream source in GUI
  guiUpdateOnSourceAvailable(videoStream, selectedSource.name)
}
ipcRenderer.on(DISPLAY_SOURCES, setupStream)
