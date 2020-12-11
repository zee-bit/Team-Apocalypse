const path = require('path') // For joining paths
const { writeFile } = require('fs') // Save video to disk
const { PythonShell } = require("python-shell") // Run python scripts
const { ipcRenderer } = require('electron') // For IPC
const { DISPLAY_SOURCES, SAVE_PATH, SUDO_ENLARGE } = require(path.join(__dirname, "..", "actions", "ipcChannels")) // Main Procsses name constants (path relative to the html file)
const { DEVELOPER_MODE, FINAL_TRANSCRIBED_TEXT_SHOW } = require(path.join(__dirname, "..", "actions", "flags"))
const { deleteFiles } = require(path.join(__dirname, "..", "actions", "utilityFunctions"))

// Resize window
ipcRenderer.invoke(SUDO_ENLARGE)

// DOM Elements

const getSourcesBtn = document.getElementById("getSourcesBtn")
const startBtn = document.getElementById("startBtn")
const stopBtn = document.getElementById("stopBtn")
const saveMp3Btn = document.getElementById("saveMp3Btn")
const saveMp4Btn = document.getElementById("saveMp4Btn")
const newRecordingBtn = document.getElementById("newRecordingBtn")
const videoElement = document.getElementsByTagName("video")[0]
const transcribedTextElement = document.getElementById("transcribedTextElement")
const timeKeeperElement = document.getElementById("timeKeeper")
const hoursElement = document.getElementById("hours")
const minutesElement = document.getElementById("minutes")
const secondsElement = document.getElementById("seconds")

// Global Variables

let mediaRecorder
let chunks = []
let timeslice = 5000
let tempDirectory = path.join(__dirname, "..", "..", "..", "backend", "temp")
let scriptDirectory = path.join(__dirname, "..", "..", "..", "backend", "scripts")
let sliceIndex = -1
let totalDuration = 0
let finalTranscribedText = {}
let finalFilePaths = []
let TRANSCRIPTION_ENABLED = true






// ----------------------TimeKeeper Functions----------------------

let refreshInterval = 50
let baseTime = 0
let timeElapsedTillPause = 0
let timeKeeper

timeKeeperReset = () => {
  baseTime = 0
  timeElapsedTillPause = 0
  timeKeeper = undefined
  timeKeeperUpdateElements(["00", "00", "00.00"])
}

timeKeeperGetTimeElapsed = () => {
  let elapsedTime = Date.now() - baseTime + timeElapsedTillPause
  return [
    Math.floor(elapsedTime / (1000 * 60 * 60)),
    Math.floor((elapsedTime % (1000 * 60 * 60)) / (1000 * 60)),
    ((elapsedTime % (1000 * 60)) / 1000).toFixed(2)
  ]
}

timeKeeperResume = () => {
  baseTime = Date.now()
  timeKeeper = setInterval(timeKeeperUpdateElements, refreshInterval)
  timeKeeperElement.classList.add("blinking")
}

timeKeeperStop = () => {
  timeElapsedTillPause += Date.now() - baseTime
  clearInterval(timeKeeper)
  timeKeeperElement.classList.remove("blinking")
}

timeKeeperStart = (interval = refreshInterval) => {
  refreshInterval = interval
  baseTime = Date.now()
  timeElapsedTillPause = 0
  timeKeeper = setInterval(timeKeeperUpdateElements, refreshInterval)
  timeKeeperElement.classList.add("blinking")
}






// ------------------------GUI Updating Methods------------------------

timeKeeperUpdateElements = (data = timeKeeperGetTimeElapsed()) => {
  hoursElement.innerText = (data[0].toString().length == 1 ? "0" : "") + data[0].toString()
  minutesElement.innerText = (data[1].toString().length == 1 ? "0" : "") + data[1].toString()
  secondsElement.innerText = (data[2].length == 4 ? "0" : "") + data[2]
}

guiUpdateOnStop = () => {
  startBtn.innerText = "Start ⏺"
  startBtn.setAttribute("disabled", "true")
  stopBtn.setAttribute("disabled", "true")
  saveMp3Btn.removeAttribute("disabled")
  saveMp4Btn.removeAttribute("disabled")
}

guiUpdateOnResume = () => {
  startBtn.innerText = "Pause ⏸"
}

guiUpdateOnPause = () => {
  startBtn.innerText = "Resume ▶"
}

guiUpdateOnStart = () => {
  startBtn.innerText = "Pause ⏸"
  getSourcesBtn.setAttribute("disabled", "true")
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
  startBtn.innerText = "Start ⏺"
  if (mediaRecorder != undefined)
    startBtn.removeAttribute("disabled")
  stopBtn.setAttribute("disabled", "true")
  saveMp3Btn.setAttribute("disabled", "true")
  saveMp4Btn.setAttribute("disabled", "true")
  newRecordingBtn.setAttribute("disabled", "true")
  transcribedTextElement.innerHTML = ""
  timeKeeperStop()
  timeKeeperReset()
}






// --------------------Assigning events to buttons-------------------

[startBtn, stopBtn, newRecordingBtn].forEach(btn => btn.addEventListener("click", () => console.log(baseTime, timeElapsedTillPause, timeKeeper)))

document.getElementById("transcribeBtn").onclick = e => {
  if (TRANSCRIPTION_ENABLED)
    e.target.innerHTML = "Transcription Off"
  else
    e.target.innerHTML = "Transcription On"
  TRANSCRIPTION_ENABLED = !TRANSCRIPTION_ENABLED
}

saveMp3Btn.onclick = e => ipcRenderer.invoke(SAVE_PATH, ".mp3")
saveMp4Btn.onclick = e => ipcRenderer.invoke(SAVE_PATH, ".mp4")

stopBtn.onclick = e => {
  mediaRecorder.stop()
  guiUpdateOnStop()
}

startBtn.onclick = e => {
  console.log(mediaRecorder.state)
  if (mediaRecorder.state == "inactive" || mediaRecorder.state == "stopped") {
    if (timeslice)
      mediaRecorder.start(timeslice)
    else
      mediaRecorder.start()
    guiUpdateOnStart()
  } else if (mediaRecorder.state == "recording") {
    mediaRecorder.pause()
    guiUpdateOnPause()
  } else if (mediaRecorder.state == "paused") {
    mediaRecorder.resume()
    guiUpdateOnResume()
  }
}

getSourcesBtn.onclick = (event) => ipcRenderer.invoke(DISPLAY_SOURCES)


handleNewRecording = (event) => {
  chunks = []
  sliceIndex = -1
  totalDuration = 0
  finalTranscribedText = {}
  guiUpdateOnNew()
  if (mediaRecorder != undefined)
    if (mediaRecorder.state == "paused" || mediaRecorder.state == "recording")
      mediaRecorder.stop()
  if (finalFilePaths != [])
    deleteFiles(finalFilePaths)
  finalFilePaths = []
}
newRecordingBtn.onclick = handleNewRecording






// ----------------Handle Returns from Scripts----------------

const handleDisplayTranscribed = (transcribedText, chunkIndex) => {
  if (newRecordingBtn.attributes.disabled)
    retun
  if (DEVELOPER_MODE)
    console.log(chunkIndex, transcribedText)
  if ((DEVELOPER_MODE && !FINAL_TRANSCRIBED_TEXT_SHOW) && chunkIndex != -1)
    transcribedTextElement.innerHTML = transcribedTextElement.innerHTML + " " + transcribedText
  else {
    transcribedTextElement.innerHTML = (chunkIndex == -1 ? "" : transcribedTextElement.innerHTML + " ") + transcribedText
  }
  finalTranscribedText[chunkIndex] = transcribedText
}

handleLastWavDuration = (duration, chunkIndex) => {
  totalDuration += parseFloat(duration)
  return
}






// ---------------------------Linkers---------------------------

// Convert to mp4

const saveAsMp3 = (inputFileName, outputFileName) => {
  const { PythonShell } = require("python-shell")
  const path = require("path")

  let options = {
    scriptPath: scriptDirectory,
    args: [inputFileName, outputFileName]
  }

  let webm_to_mp3 = new PythonShell('webm_to_mp3.py', options)
  webm_to_mp3.on('message', (message) => {
    return
  })
}

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
// deleteChunkFiles = async (list) => {

//   let options = {
//     scriptPath: scriptDirectory,
//     args: list
//   }

//   let delete_Files = new PythonShell('delete_files.py', options)
//   delete_Files.on('message', (success) => {
//     return
//   })
// }

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
    scriptPath: path.join(__dirname, "..", "..", "..", "backend"),
    args: [query, wavFilePath]
  }

  let call_Client = new PythonShell('client.py', options)
  call_Client.on('message', (transcribedText) => {
    handleDisplayTranscribed(transcribedText, chunkIndex)
    if (chunkIndex != -1)
      // deleteChunkFiles([webmFilePath, wavFilePath])
      deleteFiles([webmFilePath, wavFilePath])
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

saveRecording = (e, savePath, saveFormat) => {
  if (savePath != '') {
    if (savePath.slice(-1 * saveFormat.length) != saveFormat)
      savePath += saveFormat
    saveFormat == ".mp3" ? saveAsMp3(finalFilePaths[0], savePath) : saveAsMp4(finalFilePaths[0], savePath)
  }
  return
}
ipcRenderer.on(SAVE_PATH, saveRecording)






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
  if (TRANSCRIPTION_ENABLED)
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
