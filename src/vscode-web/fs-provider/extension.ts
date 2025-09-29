import { ExtensionHostKind, registerExtension } from '@codingame/monaco-vscode-api/extensions';

import { URI_SCHEME } from './costants';
import { GitProviderFileSystem } from './GitProviderFileSystem';
import {
  getFsBasePathFromRepoUrl,
  getWorkspaceFolderLabel,
  getWsFolder,
  validateRepoUrl,
} from './utils';

const { getApi } = registerExtension(
  {
    name: 'customize-fs-provider-extension',
    publisher: 'mycoder',
    version: '1.0.0',
    engines: {
      vscode: '*'
    },
    contributes: {
      commands: [
        {
          command: 'GPFS.workspaceInit',
          title: '打开Git仓库',
        }
      ],
      menus: {
        commandPalette: [
          {
            command: "GPFS.workspaceInit"
          }
        ]
      }
    }
  },
  ExtensionHostKind.LocalProcess
);


void getApi().then(async (api) => {
  const fs = new GitProviderFileSystem();
  api.workspace.registerFileSystemProvider(URI_SCHEME, fs, { isCaseSensitive: true });

  api.commands.registerCommand('GPFS.workspaceInit', () => {
    api.window.showInputBox({
      prompt: '输入Git仓库地址',
      ignoreFocusOut: true,
      placeHolder: `E.g. https://github.com/microsoft/vscode`,
    })
      .then(repoUrl => {
        if (!validateRepoUrl(repoUrl)) {
          api.window.showErrorMessage('请输入一个有效的URL，例如：https://github.com/microsoft/vscode@master');
          return;
        }

        initWorkspace(repoUrl!);
      });
  });


  const initWorkspace = (repoUrl: string) => {
    // I could only make one WS foler open at a time with URI_SCHEME == 'GPFS :(
    // @ts-ignore
    const wsIndex = (getWsFolder() || {}).index;
    const hasWsAlready = typeof wsIndex === 'number';
    const insertIndex = hasWsAlready ? wsIndex : 0;
    const deleteCount = hasWsAlready ? 1 : 0;

    api.workspace.updateWorkspaceFolders(insertIndex!, deleteCount, {
      uri: api.Uri.parse(`${URI_SCHEME}://${getFsBasePathFromRepoUrl(repoUrl)}/`),
      name: getWorkspaceFolderLabel(repoUrl),
    });
  };

});