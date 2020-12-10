let fs = require('fs')
import {html, render} from '../../node_modules/lit-html/lit-html.js'

let filesListContainer = document.getElementById('filesList')

let files = fs.readdirSync('./media', {withFileTypes: true})
console.log(files)

let fullFilesList = constructContainer(files)
render(fullFilesList, filesListContainer)

function constructContainer(files) {
    let filesContanierHTML = 
    html`${files.map((file) => 
        html`<div class="row justify-content-center">
                <div class="card align-items-center">
                    <div class="card-content">
                        <div class="content">
                            <h3 class="name">${file.name}</h3>
                            <div class="description">${file.type}</div>
                        </div>
                    </div>
                </div>
            </div>`
        )}`;
    return filesContanierHTML
}
