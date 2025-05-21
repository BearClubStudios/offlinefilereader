// file-manager.js
class FileManager {
  constructor() {
    this.editors = window.editors; // Reference existing editors
    this.initialFiles = ['index.html', 'style.css', 'script.js'];
    this.setupFileHandlers();
    this.addCloseToDefaultFiles();
  }

  setupFileHandlers() {
    // Add close button handlers
    document.querySelector('.tabs-bar').addEventListener('click', (e) => {
      if (e.target.classList.contains('close')) {
        this.closeFile(e.target.closest('.tab').dataset.file);
      }
    });

    // New file button
    document.getElementById('newFileBtn').addEventListener('click', () => this.createNewFile());
    
    // File import
    document.getElementById('fileInput').addEventListener('change', (e) => this.importFiles(e));
  }

  addCloseToDefaultFiles() {
    this.initialFiles.forEach(file => {
      const tab = document.querySelector(`.tab[data-file="${file}"]`);
      if (tab && !tab.querySelector('.close')) {
        tab.innerHTML += `<span class="close">&times;</span>`;
      }
    });
  }

  createNewFile() {
    const name = prompt('Enter filename (include .html/.css/.js):');
    if (!name) return;

    const ext = name.split('.').pop();
    if (!['html', 'css', 'js'].includes(ext)) {
      alert('Invalid file type!');
      return;
    }

    if (this.editors[name]) {
      alert('File exists!');
      return;
    }

    this.createEditor(name, this.getDefaultContent(ext));
    this.createTab(name);
  }

  importFiles(e) {
    Array.from(e.target.files).forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        this.createEditor(file.name, e.target.result);
        this.createTab(file.name);
      };
      reader.readAsText(file);
    });
  }

  createEditor(name, content) {
    const editorId = `${name.replace('.','-')}-editor`;
    const div = document.createElement('div');
    div.className = 'editor';
    div.id = editorId;
    document.querySelector('.editor-container').appendChild(div);

    this.editors[name] = CodeMirror(div, {
      mode: this.getMode(name),
      theme: 'material-ocean',
      lineNumbers: true,
      value: content,
      autoCloseTags: name.endsWith('.html')
    });
  }

  createTab(name) {
    const tab = document.createElement('div');
    tab.className = 'tab';
    tab.dataset.file = name;
    tab.innerHTML = `
      <i class="${this.getIcon(name)}"></i>
      <span>${name}</span>
      <span class="close">&times;</span>
    `;
    document.querySelector('.tabs-bar').appendChild(tab);
    this.switchFile(name);
  }

  closeFile(name) {
    if (Object.keys(this.editors).length === 1) {
      alert("Can't close last file!");
      return;
    }

    delete this.editors[name];
    document.getElementById(`${name.replace('.','-')}-editor`).remove();
    document.querySelector(`.tab[data-file="${name}"]`).remove();
    
    const remaining = Object.keys(this.editors);
    if (remaining.length) this.switchFile(remaining[0]);
  }

  switchFile(name) {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.editor').forEach(e => e.style.display = 'none');
    
    const tab = document.querySelector(`.tab[data-file="${name}"]`);
    const editor = document.getElementById(`${name.replace('.','-')}-editor`);
    
    if (tab && editor) {
      tab.classList.add('active');
      editor.style.display = 'block';
      this.editors[name].refresh();
    }
  }

  // Helper methods
  getMode(name) {
    return {
      html: 'htmlmixed',
      css: 'css',
      js: 'javascript'
    }[name.split('.').pop()];
  }

  getIcon(name) {
    return {
      html: 'fab fa-html5',
      css: 'fab fa-css3-alt',
      js: 'fab fa-js-square'
    }[name.split('.').pop()];
  }

  getDefaultContent(ext) {
    return {
      html: '<!DOCTYPE html>\n<html>\n\n</html>',
      css: '/* New CSS File */',
      js: '// New JavaScript File'
    }[ext];
  }

  // Override existing download function
  enhancedDownload() {
    const zip = new JSZip();
    Object.entries(this.editors).forEach(([name, editor]) => {
      zip.file(name, editor.getValue());
    });
    zip.generateAsync({type:"blob"}).then(blob => {
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'project.zip';
      a.click();
    });
  }
}

// Initialize after DOM loads
document.addEventListener('DOMContentLoaded', () => {
  window.fileManager = new FileManager();
  
  // Override original download function
  document.getElementById('downloadBtn').addEventListener('click', () => {
    fileManager.enhancedDownload();
  });
});
