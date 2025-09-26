import { ExtensionHostKind, registerExtension } from '@codingame/monaco-vscode-api/extensions'

// Example: 测试手工添加 notifications 扩展
const { getApi } = registerExtension(
  {
    name: 'welcome-notifications',
    publisher: 'codingame',
    version: '1.0.0',
    engines: {
      vscode: '*'
    }
  },
  ExtensionHostKind.LocalProcess
)

void getApi().then(async (api) => {
    api.window.showInformationMessage('Hello', {
      detail: '测试打开编辑器时显示一条通知信息',
      modal: true
    })
    .then(() => {
      api.window.showInformationMessage(
        'Try to change the settings or the configuration, the changes will be applied to all 3 editors'
      )
    });

  /*
  setTimeout(() => {
    api.workspace.onDidChangeConfiguration(() => {
      void api.window.showInformationMessage('The configuration was changed')
    })
  }, 1000);
  */

})
