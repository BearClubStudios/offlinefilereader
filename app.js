document.addEventListener('DOMContentLoaded', () => {
    // Initialize editors
    const editors = {
        html: CodeMirror(document.getElementById('html-editor'), {
            mode: 'htmlmixed',
            theme: 'material-ocean',
            lineNumbers: true,
            autoCloseTags: true,
            value: `<!DOCTYPE html>
<html>
<head>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <h1>Hello World</h1>
    <script src="script.js"></script>
</body>
</html>`
        }),
        css: CodeMirror(document.getElementById('css-editor'), {
            mode: 'css',
            theme: 'material-ocean',
            lineNumbers: true,
            value: `body {
    background: #f0f0f0;
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
}`
        }),
        js: CodeMirror(document.getElementById('js-editor'), {
            mode: 'javascript',
            theme: 'material-ocean',
            lineNumbers: true,
            value: `console.log('Hello from JavaScript!');\n\ndocument.querySelector('h1').addEventListener('click', () => {\n    alert('Clicked!');\n});`
        })
    };

    // Tab management
    document.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.editor').forEach(e => e.style.display = 'none');
            tab.classList.add('active');
            const fileType = tab.dataset.file;
            document.getElementById(`${fileType}-editor`).style.display = 'block';
            editors[fileType].refresh();
        });
    });

    // Button functionality
    document.getElementById('runBtn').addEventListener('click', runCode);
    document.getElementById('downloadBtn').addEventListener('click', downloadCode);
    document.getElementById('newTabBtn').addEventListener('click', openNewTab);
    document.getElementById('verticalLayout').addEventListener('click', () => toggleLayout('vertical'));
    document.getElementById('horizontalLayout').addEventListener('click', () => toggleLayout('horizontal'));

    function runCode() {
        const html = editors.html.getValue();
        const css = editors.css.getValue();
        const js = editors.js.getValue();
        
        const fullCode = `
            <!DOCTYPE html>
            ${html.replace('</head>', `<style>${css}</style></head>`)}
            <script>${js}<\/script>
        `;
        
        document.getElementById('preview').srcdoc = fullCode;
    }

    // Add at the top with other constants
const FILE_TYPES = {
    html: { mode: 'htmlmixed', icon: 'fab fa-html5' },
    css: { mode: 'css', icon: 'fab fa-css3-alt' },
    js: { mode: 'javascript', icon: 'fab fa-js-square' }
};

// Add with other event listeners
document.getElementById('fileInput').addEventListener('change', handleFileImport);

// Add these new functions
function createNewFile() {
    const fileName = prompt('Enter filename (e.g., newfile.html):');
    if (!fileName) return;

    const ext = fileName.split('.').pop();
    if (!FILE_TYPES[ext]) {
        alert('Invalid file type! Use .html, .css, or .js');
        return;
    }

    if (editors[fileName]) {
        alert('File already exists!');
        return;
    }

    // Create editor container
    const editorDiv = document.createElement('div');
    editorDiv.className = 'editor';
    editorDiv.id = `${fileName.replace('.','-')}-editor`;
    document.querySelector('.editor-pane').appendChild(editorDiv);

    // Initialize editor
    editors[fileName] = CodeMirror(editorDiv, {
        mode: FILE_TYPES[ext].mode,
        theme: 'material-ocean',
        lineNumbers: true,
        value: ext === 'html' ? '<!DOCTYPE html>\n<html>\n\n</html>' : '',
        autoCloseTags: ext === 'html'
    });

    // Create tab
    const tab = document.createElement('div');
    tab.className = 'tab';
    tab.dataset.file = fileName;
    tab.innerHTML = `
        <i class="${FILE_TYPES[ext].icon}"></i>
        <span>${fileName}</span>
        <span class="close" onclick="closeFile('${fileName}')">×</span>
    `;
    tab.addEventListener('click', () => switchFile(fileName));
    document.querySelector('.tabs-bar').appendChild(tab);

    switchFile(fileName);
}

function handleFileImport(e) {
    const files = e.target.files;
    Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onload = (e) => {
            createFileFromImport(file.name, e.target.result);
        };
        reader.readAsText(file);
    });
}

function createFileFromImport(fileName, content) {
    const ext = fileName.split('.').pop();
    if (!FILE_TYPES[ext]) {
        alert('Unsupported file type: ' + fileName);
        return;
    }

    // Create editor container
    const editorDiv = document.createElement('div');
    editorDiv.className = 'editor';
    editorDiv.id = `${fileName.replace('.','-')}-editor`;
    document.querySelector('.editor-pane').appendChild(editorDiv);

    // Initialize editor
    editors[fileName] = CodeMirror(editorDiv, {
        mode: FILE_TYPES[ext].mode,
        theme: 'material-ocean',
        lineNumbers: true,
        value: content,
        autoCloseTags: ext === 'html'
    });

    // Create tab
    const tab = document.createElement('div');
    tab.className = 'tab';
    tab.dataset.file = fileName;
    tab.innerHTML = `
        <i class="${FILE_TYPES[ext].icon}"></i>
        <span>${fileName}</span>
        <span class="close" onclick="closeFile('${fileName}')">×</span>
    `;
    tab.addEventListener('click', () => switchFile(fileName));
    document.querySelector('.tabs-bar').appendChild(tab);

    switchFile(fileName);
}

function closeFile(fileName) {
    if (Object.keys(editors).length === 1) {
        alert("Can't close the last file!");
        return;
    }
    
    delete editors[fileName];
    document.getElementById(`${fileName.replace('.','-')}-editor`).remove();
    document.querySelector(`.tab[data-file="${fileName}"]`).remove();
    switchFile(Object.keys(editors)[0]);
}

// Update switchFile function
function switchFile(fileName) {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.editor').forEach(e => e.style.display = 'none');
    
    const tab = document.querySelector(`.tab[data-file="${fileName}"]`);
    const editor = document.getElementById(`${fileName.replace('.','-')}-editor`);
    
    tab.classList.add('active');
    editor.style.display = 'block';
    editors[fileName].refresh();
    currentFile = fileName;
}

// Update runCode to use all files
function runCode() {
    let html = '';
    let css = '';
    let js = '';

    // Collect code from all files
    Object.entries(editors).forEach(([name, editor]) => {
        const ext = name.split('.').pop();
        const content = editor.getValue();
        
        if (ext === 'html') html = content;
        if (ext === 'css') css = content;
        if (ext === 'js') js = content;
    });

    const fullCode = `
        <!DOCTYPE html>
        ${html.replace('</head>', `<style>${css}</style></head>`)}
        <script>${js}<\/script>
    `;
    
    document.getElementById('preview').srcdoc = fullCode;
}

    async function downloadCode() {
        const zip = new JSZip();
        zip.file("index.html", editors.html.getValue());
        zip.file("style.css", editors.css.getValue());
        zip.file("script.js", editors.js.getValue());
        
        const content = await zip.generateAsync({type: "blob"});
        const url = URL.createObjectURL(content);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'project.zip';
        a.click();
        URL.revokeObjectURL(url);
    }

    function openNewTab() {
        const html = editors.html.getValue();
        const css = editors.css.getValue();
        const js = editors.js.getValue();
        
        const fullCode = `
            <!DOCTYPE html>
            ${html.replace('</head>', `<style>${css}</style></head>`)}
            <script>${js}<\/script>
        `;
        
        const newWindow = window.open();
        newWindow.document.write(fullCode);
        newWindow.document.close();
    }

    function toggleLayout(direction) {
        const container = document.getElementById('container');
        container.style.gridTemplateColumns = direction === 'vertical' ? '1fr 1fr' : '1fr';
        container.style.gridTemplateRows = direction === 'horizontal' ? '1fr 1fr' : '1fr';
        setTimeout(() => {
            Object.values(editors).forEach(editor => editor.refresh());
        }, 100);
    }

    // Initial code execution
    runCode();
});
