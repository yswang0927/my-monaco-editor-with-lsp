import { ExtensionHostKind, registerExtension } from '@codingame/monaco-vscode-api/extensions'
import { useHtmlFileSystemProvider } from '../setup.common'

// Example: 测试手工添加 Output API
if (!useHtmlFileSystemProvider) {
  const { getApi } = registerExtension(
    {
      name: 'outputDemo',
      publisher: 'codingame',
      version: '1.0.0',
      engines: {
        vscode: '*'
      }
    },
    ExtensionHostKind.LocalProcess
  )

  void getApi().then(async (vscode) => {
    const fakeOutputChannel = vscode.window.createOutputChannel('自定义output窗口')
    //const anotherFakeOutputChannel = vscode.window.createOutputChannel('Your code', 'javascript')

    fakeOutputChannel.append("Here's some fake output\n")

    /*const mainDocument = await vscode.workspace.openTextDocument(
      vscode.Uri.file('/workspace/test.js')
    )
    anotherFakeOutputChannel.replace(mainDocument.getText())
    vscode.workspace.onDidChangeTextDocument((e) => {
      if (e.document === mainDocument && e.contentChanges.length > 0) {
        anotherFakeOutputChannel.replace(e.document.getText())
      }
    })*/

  });

}
