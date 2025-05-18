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
