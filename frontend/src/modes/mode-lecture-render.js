const { ipcRenderer } = require('electron') // For IPC
const path = require('path') // For joining paths
const { DISPLAY_SOURCES, SAVE_PATH, SUDO_ENLARGE, SUDO_SHRINK } = require('../actions/ipcChannels') // Main Procsses name constants (path relative to the html file)
const { writeFile } = require('fs') // Save video to disk
const { PythonShell } = require("python-shell") // Run python scripts

// Resize window
ipcRenderer.invoke(SUDO_ENLARGE)

// DOM Elements

const getSourcesBtn = document.getElementById("getSourcesBtn")
const startBtn = document.getElementById("startBtn")
const pauseBtn = document.getElementById("pauseBtn")
const stopBtn = document.getElementById("stopBtn")
const saveBtn = document.getElementById("saveBtn")
const newRecordingBtn = document.getElementById("newRecordingBtn")
const videoElement = document.getElementsByTagName("video")[0]
const backButton = document.getElementById("back-button")
const transcribedTextElement = document.getElementById("transcribedTextElement")
const finalTranscribedTextElement = document.getElementById("finalTranscribedTextElement")
const hoursElement = document.getElementById("hours")
const minutesElement = document.getElementById("minutes")
const secondsElement = document.getElementById("seconds")

// Global Variables

let mediaRecorder
let chunks = []
let timeslice = 5000
let tempDirectory = path.join(__dirname, "../../../backend/temp/")
let scriptDirectory = path.join(__dirname, "../../../backend/scripts/")
let sliceIndex = -1
let totalDuration = 0
let finalTranscribedText = {}
let finalFilePaths = []






// ----------------------TimeKeeper Functions----------------------

let refreshInterval = 150
let baseTime = 0
let timeElapsedTillPause = 0

timeKeeperReset = () => {
  baseTime = 0
  timeElapsedTillPause = 0
  timeKeeperUpdateElements(["00", "00", "00.0"])
}

timeKeeperGetTimeElapsed = () => {
  let elapsedTime = Date.now() - baseTime + timeElapsedTillPause
  return [
    Math.floor(elapsedTime / (1000 * 60 * 60)),
    Math.floor((elapsedTime % (1000 * 60 * 60)) / (1000 * 60)),
    ((elapsedTime % (1000 * 60)) / 1000).toFixed(1)
  ]
}

timeKeeperUpdateElements = (data = timeKeeperGetTimeElapsed()) => {
  hoursElement.innerText = data[0]
  minutesElement.innerText = data[1]
  secondsElement.innerText = data[2]
}

timeKeeperResume = () => {
  baseTime = Date.now()
  timeKeeper = setInterval(timeKeeperUpdateElements, refreshInterval)
}

timeKeeperStop = () => {
  timeElapsedTillPause += Date.now() - baseTime
  clearInterval(timeKeeper)
}

timeKeeperStart = (interval = refreshInterval) => {
  refreshInterval = interval
  baseTime = Date.now()
  timeElapsedTillPause = 0
  timeKeeper = setInterval(timeKeeperUpdateElements, refreshInterval)
}






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

guiUpdateOnSourceAvailable = (videoStream, sourceName) => {
  videoElement.srcObject = videoStream
  videoElement.play()
  getSourcesBtn.innerText = sourceName
  startBtn.removeAttribute('disabled')
}

guiUpdateOnSourceUnavailable = error => {
  alert("Could not find the Source. Please select again.")
  guiUpdateOnNew()
}

guiUpdateOnNew = () => {
  getSourcesBtn.removeAttribute("disabled")
  if (mediaRecorder != undefined)
    startBtn.removeAttribute("disabled")
  pauseBtn.setAttribute("disabled", "true")
  stopBtn.setAttribute("disabled", "true")
  saveBtn.setAttribute("disabled", "true")
  newRecordingBtn.setAttribute("disabled", "true")
  transcribedTextElement.innerHTML = ""
  finalTranscribedTextElement.innerHTML = ""
  timeKeeperReset()
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
  if (timeslice)
    mediaRecorder.start(timeslice)
  else
    mediaRecorder.start()
  guiUpdateOnStart()
}

backButton.onclick = e => {
  ipcRenderer.invoke(SUDO_SHRINK)
}

getSourcesBtn.onclick = (event) => ipcRenderer.invoke(DISPLAY_SOURCES)


handleNewRecording = (event) => {
  if (finalFilePaths != [])
    deleteChunkFiles(finalFilePaths)
  finalFilePaths = []
  chunks = []
  sliceIndex = -1
  totalDuration = 0
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






// Media Recorder Event Handlers

const handleRecordingStart = (e) => {
  timeKeeperStart()
  return
}

const handleDataAvailable = (e) => {
  sliceIndex++
  chunks.push(e.data)
  convertToBuffer(chunks, totalDuration.toFixed(3), sliceIndex)
  return
}

const handleRecordingPause = (e) => {
  timeKeeperStop()
  // let chunk = mediaRecorder.requestData()    // This creates a partial chunk on pause
  return
}

const handleRecordingResume = (e) => {
  timeKeeperResume()
  return
}

const handleRecordingStopped = (e) => {
  timeKeeperStop()
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
