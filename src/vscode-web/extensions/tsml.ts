/**
 * 为TSML语言开发扩展支持
 */
import * as vscode from 'vscode'
import { ExtensionHostKind, registerExtension } from '@codingame/monaco-vscode-api/extensions'

const { getApi } = registerExtension(
  {
    name: 'tsml-extension',
    publisher: 'mycoder',
    version: '1.0.0',
    engines: {
      vscode: '*'
    },
    contributes: {
      commands: [
        {
          command: 'tsml.run',
          title: '运行TSML脚本',
          icon: '$(play)'
        },
        {
          command: 'tsml.newFile',
          title: '新建TSML脚本',
          icon: '$(new-file)'
        }
      ],
      keybindings: [
        {
          command: 'tsml.run',
          key: 'ctrl+alt+r',
          when: 'editorTextFocus && editorLangId == groovy'
        }
      ],
      menus: {
        'editor/context': [
          {
            command: 'tsml.run',
            when: 'editorLangId == groovy',
            group: 'navigation'
          }
        ],
        'editor/title/run': [
          {
            command: 'tsml.run',
            when: 'editorLangId == groovy',
            group: 'navigation'
          }
        ],
        'explorer/context': [
          {
            command: 'tsml.newFile',
            when: 'explorerResourceIsFolder',
            group: 'navigation'
          },
          {
            command: 'tsml.run',
            when: '!explorerResourceIsFolder && (resourceExtname == .tsml || resourceExtname == .tre)',
            group: 'navigation'
          }
        ]
      },
      languages: [
        {
          id: 'tsml-run-output',
          mimetypes: ['text/x-code-output']
        },
        {
          id: 'groovy',
          extensions: ['.groovy', '.tsml', '.tre'],
          aliases: ['groovy', 'TSML', 'tsml']
        }
      ]
    }
  },
  ExtensionHostKind.LocalProcess
)

void getApi().then(async (api) => {

  const checkIsRunFromExplorer = (fileUri: vscode.Uri) => {
    if (!fileUri || !fileUri.fsPath) {
      return false;
    }

    const activeEditor = api.window.activeTextEditor;
    if (!activeEditor) {
      return true;
    }

    if (activeEditor.document.uri.fsPath === fileUri.fsPath) {
      return false;
    }
    return true;
  };

  const runTsmlCode = async (fileUri: vscode.Uri) => {
    let document: vscode.TextDocument;
    if (checkIsRunFromExplorer(fileUri)) {
      document = await api.workspace.openTextDocument(fileUri);
    } else {
      const editor = api.window.activeTextEditor;
      if (editor) {
        document = editor.document;
      } else {
        api.window.showInformationMessage('暂无可执行的TSML脚本');
        return;
      }
    }

    let selection: vscode.Selection | undefined;
    const editor = api.window.activeTextEditor;
    if (editor) {
      selection = editor.selection;
    }

    let codeToRun: string;
    if (selection && !selection.isEmpty) {
      codeToRun = document.getText(selection);
    } else {
      await document.save();
      codeToRun = document.getText();
    }

    void api.window.showInformationMessage('运行TSML', {
      detail: codeToRun,
      modal: true
    });

  };

  const createNewTsmlFile = async (filePath: vscode.Uri) => {
    const tsmlCodeTpl = 
`import static com.fh.tre.cmd.Cmd.*

// 这是一个TSML脚本示例: 将 pg 数据库中 t_user 表数据迁移到 t_user_bak 表中
def pgDs = postgres('127.0.0.1', 5432, 'postgres', 'postgres', 'postgres')
def perDf = from(pgDs, "t_user").nodeId("1")
def perDf2 = perDf.select("name", "age").nodeId("2")
perDf2.to(postgres, "t_user_bak")

`;

    const data = await api.workspace.encode(tsmlCodeTpl, {encoding: 'utf-8'});
    api.workspace.fs.writeFile(filePath, data).then(() => {
      // 创建后打开文件
      api.workspace.openTextDocument(filePath).then((doc) => {
        api.window.showTextDocument(doc);
      });
    });
  };

  api.commands.registerCommand('tsml.run', (fileUri: vscode.Uri) => {
    runTsmlCode(fileUri);
  });

  api.commands.registerCommand('tsml.newFile', (dirUri: vscode.Uri) => {
    if (!dirUri) {
      void api.window.showErrorMessage('无法获取当前目录，无法新建TSML脚本');
      return;
    }
    
    api.window.showInputBox({
      placeHolder: '输入 TSML 文件名',
      ignoreFocusOut: true,
      validateInput: (value) => {
        if (!value || value.trim().length === 0) {
          return '文件名不能为空';
        }
        if (value.includes('/') || value.includes('\\')) {
          return '文件名不能包含路径分隔符';
        }
        return null;
      }
    }).then(async (name) => {
      if (name) {
        const fileName = name.endsWith('.tsml') ? name : (name ? `${name}.tsml` : name);
        const filePath = vscode.Uri.joinPath(dirUri, fileName);
        // 检查文件是否存在
        try {
          await api.workspace.fs.stat(filePath);
          api.window.showWarningMessage(`文件 ${fileName} 已存在，是否覆盖？`, '覆盖', '取消').then((answer) => {
            if (answer === '覆盖') {
              // 覆盖文件
              createNewTsmlFile(filePath);
            }
          });
        } catch (error) {
          createNewTsmlFile(filePath);
        }
      }
    });

  });

  // 文档内容变化时触发
  api.workspace.onDidChangeTextDocument((e) => {
    // console.log('Document changed:', e.document.uri.toString());
  });

  // 文档保存时触发
  api.workspace.onDidSaveTextDocument((e) => {
    // console.log('Document saved:', e.document.uri.toString());
    console.log('>> 文件保存:');
    console.log(' - 文件名: ', `${e.fileName}(${e.uri.toString()})`);
    console.log(' - 文件内容:\n', e.getText());
  });

  api.workspace.onDidCreateFiles((e) => {
    console.log('>> 文件创建:');
    e.files.forEach((file) => {
      console.log(' - ', `${file.fsPath}(${file.toString()})`);
    });
  });

  api.workspace.onDidDeleteFiles((e) => {
    console.log('>> 文件删除:');
    e.files.forEach((file) => {
      console.log(' - ', `${file.fsPath}(${file.toString()})`);
    });
  });

  api.workspace.onDidRenameFiles((e) => {
    console.log('>> 文件重命名:');
    e.files.forEach((file) => {
      console.log(' - ', `从 ${file.oldUri.fsPath}(${file.oldUri.toString()}) 重命名为 ${file.newUri.fsPath}(${file.newUri.toString()})`);
    });
  });

});
