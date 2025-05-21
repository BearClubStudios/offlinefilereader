document.addEventListener('DOMContentLoaded', () => {
    // Initialize editors - MODIFY THIS SECTION
    const editors = {
        'index.html': CodeMirror(document.getElementById('html-editor'), {
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
        'style.css': CodeMirror(document.getElementById('css-editor'), {
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
        'script.js': CodeMirror(document.getElementById('js-editor'), {
            mode: 'javascript',
            theme: 'material-ocean',
            lineNumbers: true,
            value: `console.log('Hello from JavaScript!');\n\ndocument.querySelector('h1').addEventListener('click', () => {\n    alert('Clicked!');\n});`
        })
    };

    // Add these constants HERE
    const FILE_TYPES = {
        html: { mode: 'htmlmixed', icon: 'fab fa-html5' },
        css: { mode: 'css', icon: 'fab fa-css3-alt' },
        js: { mode: 'javascript', icon: 'fab fa-js-square' }
    };

    // MODIFIED Tab management
    document.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', () => {
            const fileName = tab.dataset.file;
            switchFile(fileName);
        });
        
        // Add close button functionality to existing tabs
        tab.querySelector('.close').addEventListener('click', (e) => {
            e.stopPropagation();
            closeFile(tab.dataset.file);
        });
    });

    // Button functionality - ADD NEW EVENT LISTENERS HERE
    document.getElementById('runBtn').addEventListener('click', runCode);
    document.getElementById('downloadBtn').addEventListener('click', downloadCode);
    document.getElementById('newTabBtn').addEventListener('click', openNewTab);
    document.getElementById('verticalLayout').addEventListener('click', () => toggleLayout('vertical'));
    document.getElementById('horizontalLayout').addEventListener('click', () => toggleLayout('horizontal'));
    document.getElementById('fileInput').addEventListener('change', handleFileImport);
    document.getElementById('newFileBtn').addEventListener('click', createNewFile);

    // ADD ALL NEW FUNCTIONS HERE
    function createNewFile() {
        const fileName = prompt('Enter filename (e.g., newfile.html):');
        if (!fileName) return;

        const ext = fileName.split('.').pop();
        if (!FILE_TYPES[ext]) {
            alert('Only .html, .css, and .js files allowed!');
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
            <span class="close">×</span>
        `;
        
        // Add close button handler
        tab.querySelector('.close').addEventListener('click', (e) => {
            e.stopPropagation();
            closeFile(fileName);
        });

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
            <span class="close">×</span>
        `;
        
        tab.querySelector('.close').addEventListener('click', (e) => {
            e.stopPropagation();
            closeFile(fileName);
        });

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
        
        const remainingFiles = Object.keys(editors);
        if (remainingFiles.length > 0) {
            switchFile(remainingFiles[0]);
        }
    }

    function switchFile(fileName) {
        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.editor').forEach(e => e.style.display = 'none');
        
        const tab = document.querySelector(`.tab[data-file="${fileName}"]`);
        const editor = document.getElementById(`${fileName.replace('.','-')}-editor`);
        
        if (tab && editor) {
            tab.classList.add('active');
            editor.style.display = 'block';
            editors[fileName].refresh();
        }
    }

    // MODIFIED runCode function
    function runCode() {
        const html = editors['index.html'].getValue();
        const css = editors['style.css'].getValue();
        const js = editors['script.js'].getValue();

        const fullCode = `
            <!DOCTYPE html>
            ${html.replace('</head>', `<style>${css}</style></head>`)}
            <script>${js}<\/script>
        `;
        
        document.getElementById('preview').srcdoc = fullCode;
    }

    // MODIFIED downloadCode function
    async function downloadCode() {
        try {
            const zip = new JSZip();
            for (const [filename, editor] of Object.entries(editors)) {
                zip.file(filename, editor.getValue());
            }
            const content = await zip.generateAsync({type: "blob"});
            const url = URL.createObjectURL(content);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'project.zip';
            a.click();
            URL.revokeObjectURL(url);
        } catch (error) {
            alert('Download error: ' + error.message);
        }
    }

    // Keep the rest of your existing functions
    function openNewTab() {
        const html = editors['index.html'].getValue();
        const css = editors['style.css'].getValue();
        const js = editors['script.js'].getValue();
        
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
