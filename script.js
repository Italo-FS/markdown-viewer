const DEFAULT_MARKDOWN = `# Monaco Markdown Viewer
Este editor possui suporte a **multi-cursor** (Alt+Click) e comandos do VS Code.

## Funcionalidades
1. Edição em tempo real.
2. Scroll sincronizado.
3. Cache automático.
`;

const CACHE_KEY = 'monaco-markdown-content';
const THEME_KEY = 'monaco-app-theme';
let editor;
let isIgnoreScroll = false;

// Configuração do Loader do Monaco
require.config({ paths: { vs: 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.44.0/min/vs' } });

require(['vs/editor/editor.main'], function () {
  const container = document.getElementById('editorContainer');
  const savedData = localStorage.getItem(CACHE_KEY) || DEFAULT_MARKDOWN;
  const savedTheme = localStorage.getItem(THEME_KEY) || 'light';
  const isDark = savedTheme === 'dark';

  applyTheme(isDark);
  document.getElementById('themeToggle').checked = isDark;

  editor = monaco.editor.create(container, {
    value: savedData,
    language: 'markdown',
    theme: isDark ? 'vs-dark' : 'vs',
    automaticLayout: true,
    wordWrap: 'on',
    minimap: { enabled: false },
    fontSize: 14,
    lineNumbers: 'on'
  });

  // Inicializar Preview
  updatePreview(savedData);

  // Evento de Mudança no Texto
  editor.onDidChangeModelContent(() => {
    const value = editor.getValue();
    updatePreview(value);
    localStorage.setItem(CACHE_KEY, value);
  });

  // Scroll Sincronizado
  const previewPanel = document.getElementById('previewPanel');

  editor.onDidScrollChange(() => {
    if (!document.getElementById('syncScroll').checked || isIgnoreScroll) return;

    const scrollHeight = editor.getScrollHeight() - editor.getLayoutInfo().height;
    const scrollPercent = editor.getScrollTop() / scrollHeight;

    const destScroll = (previewPanel.scrollHeight - previewPanel.clientHeight) * scrollPercent;
    previewPanel.scrollTop = destScroll;
  });
});

// Atualizar Preview HTML
function updatePreview(value) {
  const content = document.getElementById('markdownContent');
  content.innerHTML = marked.parse(value);
}

function applyTheme(isDark) {
  const themeName = isDark ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', themeName);
  localStorage.setItem(THEME_KEY, themeName);
  if (typeof monaco !== 'undefined' && monaco.editor) {
    monaco.editor.setTheme(isDark ? 'vs-dark' : 'vs');
  }
}

// Alternar Visibilidade do Editor
document.getElementById('toggleEditor').addEventListener('click', () => {
  document.getElementById('mainContainer').classList.toggle('editor-hidden');
  // Forçar o Monaco a recalcular o tamanho ao voltar
  if (editor) editor.layout();
});

// Resetar Conteúdo
document.getElementById('resetButton').addEventListener('click', () => {
  if (confirm("Resetar para o conteúdo padrão?")) {
    editor.setValue(DEFAULT_MARKDOWN);
  }
});

document.getElementById('themeToggle').addEventListener('change', (e) => {
  applyTheme(e.target.checked);
});