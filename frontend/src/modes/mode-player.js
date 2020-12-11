let fs = require('fs')
import {html, render} from '../../node_modules/lit-html/lit-html.js'
const { ipcRenderer } = require('electron') // For IPC
const { SUDO_PLAYER } = require('../actions/ipcChannels')

// Resize window
ipcRenderer.invoke(SUDO_PLAYER)

let filesListContainer = document.getElementById('filesList')
let videoConatainer = document.getElementById('video')

let files = fs.readdirSync('../Recordings', {withFileTypes: true})
console.log(files)

let fullFilesList = constructContainer(files)
render(fullFilesList, filesListContainer)

function playVideoFile(fileName) {
    console.log(fileName)
    let path = '../../../Recordings/' + fileName
    videoConatainer.setAttribute('src', path)
    videoConatainer.play()
}


function constructContainer(files) {

    const listener = {
        handleEvent(e) {
          let fileName = e.path[0].id
          playVideoFile(fileName)
        },
        capture: true,
      };

    let filesContanierHTML = 
    html`${files.map((file) => 
        html`<div class="row justify-content-center">
                <div class="card border-success align-items-center">
                    <div class="card-content">
                        <div class="content">
                            <a class="name" id="${file.name}" 
                                data-toggle="tooltip" title="${file.name}" 
                                @click="${listener}">${file.name}</a>
                            <div class="description">${file.type}</div>
                        </div>
                    </div>
                </div>
            </div>`
        )}`;
    return filesContanierHTML
}

