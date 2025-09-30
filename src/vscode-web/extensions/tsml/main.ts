/**
 * 为TSML语言开发扩展支持
 */
import * as vscode from 'vscode'
import { ExtensionHostKind, registerExtension } from '@codingame/monaco-vscode-api/extensions'

const { getApi, registerFileUrl } = registerExtension(
  {
    name: 'tsml-extension',
    publisher: 'mycoder',
    version: '1.0.0',
    engines: {
      vscode: '^1.100.0'
    },
    l10n: './l10n',
    contributes: {
      commands: [
        {
          command: 'tsml.run',
          title: '%tsml.run.title%',
          icon: '$(play)'
        },
        {
          command: 'tsml.newFile',
          title: '%tsml.newFile.title%',
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
);

// 配置语言国际化
registerFileUrl('package.nls.json', new URL('./package.nls.json', import.meta.url).href);
registerFileUrl('package.nls.zh-cn.json', new URL('./package.nls.zh-cn.json', import.meta.url).href);
registerFileUrl('./l10n/bundle.l10n.zh-cn.json', new URL('./l10n/bundle.l10n.zh-cn.json', import.meta.url).href);

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
      api.window.showTextDocument(document);
    } else {
      const editor = api.window.activeTextEditor;
      if (editor) {
        document = editor.document;
      } else {
        api.window.showInformationMessage(api.l10n.t('No executable TSML script available'));
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

    // TODO 执行代码
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
      void api.window.showErrorMessage(api.l10n.t('Unable to get current directory, cannot create new TSML script'));
      return;
    }
    
    api.window.showInputBox({
      placeHolder: api.l10n.t('Input tsml file name'),
      ignoreFocusOut: true,
      validateInput: (value) => {
        if (!value || value.trim().length === 0) {
          return api.l10n.t('File name cannot be empty');
        }
        if (value.includes('/') || value.includes('\\')) {
          return api.l10n.t('File name cannot contain path separators');
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
          api.window.showWarningMessage(
            api.l10n.t('File {0} already exists, do you want to overwrite it?', fileName), 
            api.l10n.t('Override'), 
            api.l10n.t('Cancel')
          ).then((answer) => {
            if (answer === api.l10n.t('Override')) {
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


});
