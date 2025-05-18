document.addEventListener('DOMContentLoaded', () => {
    let currentFile = null;
    const editors = {};
    const fileTypeIcons = {
        html: 'fab fa-html5',
        css: 'fab fa-css3-alt',
        js: 'fab fa-js-square',
        txt: 'fas fa-file-alt',
        json: 'fas fa-code'
    };

    // Initialize default files
    createEditor('index.html', `<!DOCTYPE html>
<html>
<head>
    <title>New Project</title>
</head>
<body>
    <h1>Hello World</h1>
</body>
</html>`, 'htmlmixed');
    
    createEditor('style.css', `body {
    background: #f0f0f0;
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
}`, 'css');

    createEditor('script.js', `console.log('Hello from JavaScript!');`, 'javascript');

    // Event listeners
    document.getElementById('runBtn').addEventListener('click', runCode);
    document.getElementById('downloadBtn').addEventListener('click', downloadCode);
    document.getElementById('newTabBtn').addEventListener('click', openNewTab);
    document.getElementById('newFileBtn').addEventListener('click', createNewFile);
    document.getElementById('verticalLayout').addEventListener('click', () => toggleLayout('vertical'));
    document.getElementById('horizontalLayout').addEventListener('click', () => toggleLayout('horizontal'));

    function createEditor(filename, content, mode) {
        const editorId = `${filename.replace('.','-')}-editor`;
        const editorDiv = document.createElement('div');
        editorDiv.className = 'editor';
        editorDiv.id = editorId;
        document.getElementById('editorsContainer').appendChild(editorDiv);

        editors[filename] = CodeMirror(editorDiv, {
            mode: mode,
            theme: 'material-ocean',
            lineNumbers: true,
            value: content,
            autoCloseTags: mode === 'htmlmixed'
        });

        createTab(filename);
        switchFile(filename);
    }

    function createTab(filename) {
        const fileType = filename.split('.').pop();
        const tab = document.createElement('div');
        tab.className = 'tab';
        tab.dataset.file = filename;
        
        const icon = document.createElement('i');
        icon.className = fileTypeIcons[fileType] || 'fas fa-file-code';
        tab.appendChild(icon);
        
        const fileNameSpan = document.createElement('span');
        fileNameSpan.textContent = filename;
        tab.appendChild(fileNameSpan);

        const closeBtn = document.createElement('span');
        closeBtn.className = 'close';
        closeBtn.innerHTML = '×';
        closeBtn.onclick = (e) => {
            e.stopPropagation();
            if (Object.keys(editors).length === 1) return alert("Can't delete last file");
            delete editors[filename];
            document.getElementById(`${filename.replace('.','-')}-editor`).remove();
            tab.remove();
            switchFile(Object.keys(editors)[0]);
        };
        tab.appendChild(closeBtn);

        tab.addEventListener('click', () => switchFile(filename));
        document.getElementById('tabsBar').appendChild(tab);
    }

    function switchFile(filename) {
        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.editor').forEach(e => e.style.display = 'none');
        
        const tab = document.querySelector(`.tab[data-file="${filename}"]`);
        tab.classList.add('active');
        document.getElementById(`${filename.replace('.','-')}-editor`).style.display = 'block';
        editors[filename].refresh();
        currentFile = filename;
    }

    function createNewFile() {
        const fileName = prompt('Enter filename (e.g., newfile.html):');
        if (!fileName) return;

        const fileType = fileName.split('.').pop();
        const modeMap = {
            html: 'htmlmixed',
            css: 'css',
            js: 'javascript',
            txt: 'text',
            json: 'application/json'
        };

        const defaultContent = fileType === 'html' ? 
            `<!DOCTYPE html>\n<html>\n<head>\n    <title>New File</title>\n</head>\n<body>\n\n</body>\n</html>` : '';

        createEditor(fileName, defaultContent, modeMap[fileType] || 'text');
    }

    function runCode() {
        const files = {
            'index.html': editors['index.html'].getValue(),
            'style.css': editors['style.css'].getValue(),
            'script.js': editors['script.js'].getValue()
        };

        const fullCode = `
            <!DOCTYPE html>
            ${files['index.html'].replace('</head>', `<style>${files['style.css']}</style></head>`)}
            <script>${files['script.js']}<\/script>
        `;
        
        document.getElementById('preview').srcdoc = fullCode;
    }

    async function downloadCode() {
        try {
            const zip = new JSZip();
            
            // Include all files
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
            alert('Error generating ZIP file: ' + error.message);
        }
    }

    function openNewTab() {
        const content = editors[currentFile].getValue();
        const blob = new Blob([content], {type: 'text/plain'});
        window.open(URL.createObjectURL(blob));
    }

    function toggleLayout(direction) {
        const container = document.getElementById('container');
        container.style.gridTemplateColumns = direction === 'vertical' ? '1fr 1fr' : '1fr';
        container.style.gridTemplateRows = direction === 'horizontal' ? '1fr 1fr' : '1fr';
        setTimeout(() => {
            Object.values(editors).forEach(editor => editor.refresh());
        }, 100);
    }

    // Initial setup
    switchFile('index.html');
});
