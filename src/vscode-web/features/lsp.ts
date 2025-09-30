import * as vscode from 'vscode';
import { 
    LanguageClientWrapper, 
    type LanguageClientConfig,
    LanguageClientsManager, 
    type LanguageClientConfigs
} from 'monaco-languageclient/lcwrapper';

export type LspConfig = {
    websocketUrl: string;
    languageId: string;
    basePath: string;
};

const createLanguageClientConfig = (lsConfig: LspConfig): LanguageClientConfig => {
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

    return languageClientConfig;
};

/**
 * Demo: 单语言LSP客户端配置
 * @param lsConfig 单语言LSP客户端配置
 */
export const initSingleLspClient = async (lsConfig: LspConfig) => {
    const languageClientConfig = createLanguageClientConfig(lsConfig);
    const lcWrapper = new LanguageClientWrapper(languageClientConfig);
    await lcWrapper.start();
};

/**
 * 支持多语言LSP客户端初始化
 * @param multiLangClientConfigs LSP配置数组
 */
export const initMultiLspClients = async (multiLangClientConfigs: LspConfig[]) => {

    const configs = {} as { [languageId: string]: LanguageClientConfig };
    
    for (const langClientConfig of multiLangClientConfigs) {
        configs[langClientConfig.languageId] = createLanguageClientConfig(langClientConfig);
    }

    const lcManager = new LanguageClientsManager();
    const languageClientConfigs: LanguageClientConfigs = { configs: configs };

    await lcManager.setConfigs(languageClientConfigs);
    await lcManager.start();
};
