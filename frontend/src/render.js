// Logic for toggle button
let currentToggle = 0
let start = document.getElementById("startAudio")
let stop = document.getElementById("stopAudio")

// Grab rest of DOM elements
let textContainer = document.getElementById("text_container")

function toggleAudio() {
    currentToggle = (currentToggle + 1) % 2
    if(currentToggle === 1) {
        start.play()
        startModel()
    } else {
        stop.play()
        stopModel()
    }
}

function startModel() {
    textContainer.innerText = ""

    let dummyText = "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged."

    let dummyTextList = dummyText.split(" ")
    dummyTextList.forEach((word, index) => {
        setTimeout(() => {
            textContainer.textContent += word + " "
        }, index * 700)
    })
}

// Stop Model won't work until we have a dynamic array
// But this should work on our use case
function stopModel() {

}

// Testing audio stream here
const { desktopCapturer } = require('electron')

const constraints = {
    audio: {
        mandatory: {
            chromeMediaSource: 'desktop'
        }
    },
    video: false
}

desktopCapturer.getSources({types: ['window', 'screen']}).then(async sources => {
    
})