import './style.css'
import * as monaco from 'monaco-editor'
import { ExtensionHostKind, registerExtension } from '@codingame/monaco-vscode-api/extensions'
import { useHtmlFileSystemProvider } from './setup.common'
import './features/output'
import './features/debugger'
import './features/intellisense'
import './features/notifications'
import './features/terminal'
import './features/scm'
import './features/ai'
import '@codingame/monaco-vscode-cpp-default-extension'
import '@codingame/monaco-vscode-css-default-extension'
import '@codingame/monaco-vscode-html-default-extension'
import '@codingame/monaco-vscode-javascript-default-extension'
import '@codingame/monaco-vscode-typescript-basics-default-extension'
import '@codingame/monaco-vscode-json-default-extension'
import '@codingame/monaco-vscode-diff-default-extension'
import '@codingame/monaco-vscode-java-default-extension'
import '@codingame/monaco-vscode-groovy-default-extension'
import '@codingame/monaco-vscode-python-default-extension'
import '@codingame/monaco-vscode-sql-default-extension'
import '@codingame/monaco-vscode-xml-default-extension'
import '@codingame/monaco-vscode-yaml-default-extension'
import '@codingame/monaco-vscode-theme-defaults-default-extension'
import '@codingame/monaco-vscode-theme-seti-default-extension'
import '@codingame/monaco-vscode-references-view-default-extension'
import '@codingame/monaco-vscode-search-result-default-extension'
import '@codingame/monaco-vscode-configuration-editing-default-extension'
import '@codingame/monaco-vscode-markdown-math-default-extension'
import '@codingame/monaco-vscode-media-preview-default-extension'
import '@codingame/monaco-vscode-simple-browser-default-extension'

const { getApi } = registerExtension(
  {
    name: 'demo-main',
    publisher: 'codingame',
    version: '1.0.0',
    engines: {
      vscode: '*'
    }
  },
  ExtensionHostKind.LocalProcess
);

// Example: 测试手工添加 diagnostics API
void getApi().then(async (vscode) => {
  if (!useHtmlFileSystemProvider) {
    const mainModelUri = vscode.Uri.file('/workspace/test.js')
    await Promise.all([
      vscode.workspace.openTextDocument(mainModelUri),
      vscode.workspace.openTextDocument(monaco.Uri.file('/workspace/test_readonly.js')) // open the file so vscode sees it's locked
    ])

    const diagnostics = vscode.languages.createDiagnosticCollection('demo')
    diagnostics.set(mainModelUri, [
      {
        range: new vscode.Range(2, 9, 2, 12),
        severity: vscode.DiagnosticSeverity.Error,
        message: "简单测试下手工添加的 diagnostics 错误提示",
        source: 'Demo',
        code: 42
      }
    ])
  }
 
})
