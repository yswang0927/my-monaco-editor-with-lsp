import * as vscode from 'vscode';
import { LanguageClientWrapper, type LanguageClientConfig } from 'monaco-languageclient/lcwrapper';

export type LspConfig = {
    websocketUrl: string;
    languageId: string;
    basePath: string;
};

export const initLspClient = async (lsConfig: LspConfig) => {
    const languageClientConfig: LanguageClientConfig = {
        languageId: lsConfig.languageId,
        connection: {
            options: {
                $type: 'WebSocketUrl',
                url: lsConfig.websocketUrl,
                startOptions: {
                    onCall: () => {
                        console.log('Connected to lsp websocket.');
                    },
                    reportStatus: true
                },
                stopOptions: {
                    onCall: () => {
                        console.log('Disconnected from lsp websocket.');
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
                uri: vscode.Uri.parse(`${lsConfig.basePath}`)
            }
        }
    };

    const lcWrapper = new LanguageClientWrapper(languageClientConfig);
    await lcWrapper.start();
};
