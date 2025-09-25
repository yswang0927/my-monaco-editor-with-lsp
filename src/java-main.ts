/**
 * 这是一个使用 monaco-languageclient 实现的支持 groovy-lsp 编辑器
 */

import * as vscode from 'vscode';
import { LogLevel } from '@codingame/monaco-vscode-api';
import '@codingame/monaco-vscode-java-default-extension';
import '@codingame/monaco-vscode-groovy-default-extension';

import { RegisteredFileSystemProvider, RegisteredMemoryFile, registerFileSystemOverlay } from '@codingame/monaco-vscode-files-service-override';
import getKeybindingsServiceOverride from '@codingame/monaco-vscode-keybindings-service-override';
import { EditorApp, type EditorAppConfig } from 'monaco-languageclient/editorApp';
import { configureDefaultWorkerFactory } from 'monaco-languageclient/workerFactory';
import { LanguageClientWrapper, type LanguageClientConfig } from 'monaco-languageclient/lcwrapper';
import { MonacoVscodeApiWrapper, type MonacoVscodeApiConfig } from 'monaco-languageclient/vscodeApiWrapper';


export type LspConfig = {
    ip: string;
    port: number;
    path: string;
    languageId: string;
    basePath: string;
};

const main = async (lsConfig: LspConfig, helloCode: string) => {
    const helloUri = vscode.Uri.file(`${lsConfig.basePath}/workspace/hello.${lsConfig.languageId}`);
    const fileSystemProvider = new RegisteredFileSystemProvider(false);
    fileSystemProvider.registerFile(new RegisteredMemoryFile(helloUri, helloCode));
    registerFileSystemOverlay(1, fileSystemProvider);

    const htmlContainer = document.getElementById('editor')!;
    const vscodeApiConfig: MonacoVscodeApiConfig = {
        $type: 'extended',
        viewsConfig: {
            $type: 'EditorService',
            htmlContainer
        },
        logLevel: LogLevel.Debug,
        serviceOverrides: {
            ...getKeybindingsServiceOverride(),
        },
        userConfiguration: {
            json: JSON.stringify({
                'workbench.colorTheme': 'Default Light Modern',
                'editor.guides.bracketPairsHorizontal': 'active',
                'editor.lightbulb.enabled': 'On',
                'editor.wordBasedSuggestions': 'off',
                'editor.experimental.asyncTokenization': true
            })
        },
        monacoWorkerFactory: configureDefaultWorkerFactory
    };

    const languageClientConfig: LanguageClientConfig = {
        languageId: lsConfig.languageId,
        connection: {
            options: {
                $type: 'WebSocketUrl',
                url: `ws://${lsConfig.ip}:${lsConfig.port}${lsConfig.path}`,
                startOptions: {
                    onCall: () => {
                        console.log('Connected to socket.');
                    },
                    reportStatus: true
                },
                stopOptions: {
                    onCall: () => {
                        console.log('Disconnected from socket.');
                    },
                    reportStatus: true
                }
            },
        },
        clientOptions: {
            documentSelector: [lsConfig.languageId],
            workspaceFolder: {
                index: 0,
                name: 'workspace',
                uri: vscode.Uri.parse(`${lsConfig.basePath}/workspace`)
            }
        }
    };

    const editorAppConfig: EditorAppConfig = {
        codeResources: {
            modified: {
                text: helloCode,
                uri: helloUri.path
            }
        }
    };

    // perform global init
    const apiWrapper = new MonacoVscodeApiWrapper(vscodeApiConfig);
    await apiWrapper.start();

    const lcWrapper = new LanguageClientWrapper(languageClientConfig, apiWrapper.getLogger());
    const editorApp = new EditorApp(editorAppConfig);

    await editorApp.start(apiWrapper.getHtmlContainer());
    await lcWrapper.start();
    // open files, so the LS can pick it up
    await vscode.workspace.openTextDocument(helloUri);
};


main({
    ip: '127.0.0.1',
    port: 30003,
    path: '/java',
    languageId: 'java',
    basePath: '/home/xk/文档/my-monaco-editor-with-lsp/language-server/providers/java'
}, "");


/*
main({
    ip: '127.0.0.1',
    port: 30002,
    path: '/groovy',
    languageId: 'groovy',
    basePath: '/home/xk/文档/my-monaco-editor-with-lsp/language-server/providers/groovy'
}, "");
*/