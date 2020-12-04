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
    let element = document.createElement('a')
    let filename = `rtf-${Date.now()}`
    let notesData = quill.root.innerHTML;

    element.setAttribute('href', 'data:text/html,' + encodeURIComponent(notesData));
    element.setAttribute('download', filename);

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
    console.log(notesData)
}