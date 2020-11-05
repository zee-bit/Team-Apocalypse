// Logic for toggle button
let currentToggle = 1
let start = document.getElementById("startAudio")
let stop = document.getElementById("stopAudio")

function toggleAudio() {
    currentToggle = (currentToggle + 1) % 2
    if(currentToggle === 1) {
        start.play()
    } else {
        stop.play()
    }
}