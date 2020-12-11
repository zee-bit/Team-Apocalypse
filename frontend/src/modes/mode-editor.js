let fs = require('fs')
import {html, render} from '../../node_modules/lit-html/lit-html.js'

let filesListContainer = document.getElementById('filesList')

let files = fs.readdirSync('../Saved Texts', {withFileTypes: true})
console.log(files)

let fullFilesList = constructContainer(files)
render(fullFilesList, filesListContainer)


function loadRichTextFromList(file) {
    // Requires system specific utility download for 'unrtf' engine.
    // Python engine does not require any download but it doesnt 
    // work for me, but you can try it yourself by passing
    // default engine as python. Download link below.
    // [https://www.npmjs.com/package/unrtf]
    let unrtf = require('unrtf')
    unrtf.defaultEngine = 'unrtf'

    // const fileReader = new FileReader()
    // fileReader.addEventListener('load', () => {
    //     let rtf = fileReader.result
    //     console.log(rtf)
    //     unrtf(rtf, (err, res) => {
    //         if(err) throw err
    //         console.log(res.html)
    //         quill.root.innerHTML = res.html
    //     })
    // })
    // fileReader.readAsText(file, 'ascii')
    // fileReader.readAsArrayBuffer(file)

    let rtf = fs.readFileSync(file, {encoding: 'ascii'})
    unrtf(rtf, (err, res) => {
        if(err) throw err
        console.log(res.html)
        quill.root.innerHTML = res.html
    })
}

function constructContainer(files) {

    const listener = {
        handleEvent(e) {
          let fileName = e.path[0].id
          fileName = '../Saved Texts/' + fileName
          loadRichTextFromList(fileName)
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
        console.log(filesContanierHTML)
    return filesContanierHTML
}
