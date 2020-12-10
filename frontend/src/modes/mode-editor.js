let quill = new Quill('#editor-container', {
    modules: {
        toolbar: [
            [{ header: [1, 2, 3, false] }],
            ['bold', 'italic', 'underline'],
            ['link', 'blockquote', 'code-block', 'image'],
            [{ list: 'ordered' }, { list: 'bullet' }]
        ]
    },
    placeholder: 'Start writing here...',
    theme: 'snow'  // or 'bubble'
});

function saveRichText() {
    let htmlToRtf = require('html-to-rtf')
    let element = document.createElement('a')
    let filename = `rtf-${Date.now()}.rtf`
    let notesHTML = quill.root.innerHTML;

    notesRTF = htmlToRtf.convertHtmlToRtf(notesHTML)
    element.setAttribute('href', 'data:application/octet-stream,' + encodeURIComponent(notesRTF));
    element.setAttribute('download', filename);
    element.style.display = 'none';
    
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
}

function loadRichText() {
    // Requires system specific utility download for 'unrtf' engine.
    // Python engine does not require any download but it doesnt 
    // work for me, but you can try it yourself by passing
    // default engine as python. Download link below.
    // [https://www.npmjs.com/package/unrtf]
    let unrtf = require('unrtf')
    unrtf.defaultEngine = 'unrtf'
    let element = document.createElement('input')
    element.setAttribute('type', 'file')
    element.style.display = 'none'

    element.addEventListener('change', () => {
        const fileReader = new FileReader()
        fileReader.addEventListener('load', () => {
            let rtf = fileReader.result
            console.log(rtf)
            unrtf(rtf, (err, res) => {
                if(err) throw err
                console.log(res.html)
                quill.root.innerHTML = res.html
            })
        })
        fileReader.readAsText(element.files[0], 'ascii')
    })

    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
}