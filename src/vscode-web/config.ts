/* --------------------------------------------------------------------------------------------
 * Copyright (c) 2024 TypeFox and others.
 * Licensed under the MIT License. See LICENSE in the package root for license information.
 * ------------------------------------------------------------------------------------------ */

/**
 * 完整的编辑器配置, 来自: https://github.com/TypeFox/monaco-languageclient/tree/main/packages/examples/src/appPlayground
 */
import '@codingame/monaco-vscode-language-pack-zh-hans';
import { LogLevel } from '@codingame/monaco-vscode-api';
import getEnvironmentServiceOverride from '@codingame/monaco-vscode-environment-service-override';
import getExplorerServiceOverride from '@codingame/monaco-vscode-explorer-service-override';
import { InMemoryFileSystemProvider, registerFileSystemOverlay, type IFileWriteOptions } from '@codingame/monaco-vscode-files-service-override';
import getKeybindingsServiceOverride from '@codingame/monaco-vscode-keybindings-service-override';
import getLifecycleServiceOverride from '@codingame/monaco-vscode-lifecycle-service-override';
import getLocalizationServiceOverride from '@codingame/monaco-vscode-localization-service-override';
import getOutlineServiceOverride from '@codingame/monaco-vscode-outline-service-override';
import getRemoteAgentServiceOverride from '@codingame/monaco-vscode-remote-agent-service-override';
import getSearchServiceOverride from '@codingame/monaco-vscode-search-service-override';
import getSecretStorageServiceOverride from '@codingame/monaco-vscode-secret-storage-service-override';
import getStorageServiceOverride from '@codingame/monaco-vscode-storage-service-override';
import getBannerServiceOverride from '@codingame/monaco-vscode-view-banner-service-override';
import getStatusBarServiceOverride from '@codingame/monaco-vscode-view-status-bar-service-override';
import getTitleBarServiceOverride from '@codingame/monaco-vscode-view-title-bar-service-override';
import * as vscode from 'vscode';

// this is required syntax highlighting
import '@codingame/monaco-vscode-search-result-default-extension';
import '@codingame/monaco-vscode-java-default-extension';
import '@codingame/monaco-vscode-groovy-default-extension';

import { createDefaultLocaleConfiguration } from 'monaco-languageclient/vscodeApiLocales';
import { defaultHtmlAugmentationInstructions, defaultViewsInit, type HtmlContainerConfig, type MonacoVscodeApiConfig } from 'monaco-languageclient/vscodeApiWrapper';
import { configureDefaultWorkerFactory } from 'monaco-languageclient/workerFactory';
import { createDefaultWorkspaceContent } from './utils.js';

export type ConfigResult = {
    vscodeApiConfig: MonacoVscodeApiConfig;
    workspaceFileUri: vscode.Uri;
    helloTsUri: vscode.Uri;
    testerTsUri: vscode.Uri;
};

export const configure = async (htmlContainer: HtmlContainerConfig): Promise<ConfigResult> => {
    const workspaceFileUri = vscode.Uri.file('/workspace.code-workspace');

    const vscodeApiConfig: MonacoVscodeApiConfig = {
        $type: 'extended',
        logLevel: LogLevel.Debug,
        serviceOverrides: {
            ...getKeybindingsServiceOverride(),
            ...getLifecycleServiceOverride(),
            ...getLocalizationServiceOverride(createDefaultLocaleConfiguration()),
            ...getBannerServiceOverride(),
            ...getStatusBarServiceOverride(),
            ...getTitleBarServiceOverride(),
            ...getExplorerServiceOverride(),
            ...getRemoteAgentServiceOverride(),
            ...getEnvironmentServiceOverride(),
            ...getSecretStorageServiceOverride(),
            ...getStorageServiceOverride(),
            ...getSearchServiceOverride(),
            ...getOutlineServiceOverride()
        },
        viewsConfig: {
            $type: 'ViewsService',
            htmlContainer: htmlContainer,
            htmlAugmentationInstructions: defaultHtmlAugmentationInstructions,
            viewsInitFunc: defaultViewsInit
        },
        workspaceConfig: {
            enableWorkspaceTrust: true,
            windowIndicator: {
                label: 'MyCodeEditor',
                tooltip: '',
                command: ''
            },
            workspaceProvider: {
                trusted: true,
                async open() {
                    window.open(window.location.href);
                    return true;
                },
                workspace: {
                    workspaceUri: workspaceFileUri
                }
            },
            configurationDefaults: {
                'window.title': 'MyCodeEditor${separator}${dirty}${activeEditorShort}'
            },
            productConfiguration: {
                nameShort: 'MyCodeEditor',
                nameLong: 'MyCodeEditor'
            }
        },
        userConfiguration: {
            json: JSON.stringify({
                'workbench.colorTheme': 'Default Light Modern',
                'editor.wordBasedSuggestions': 'off', //'off'
                //'typescript.tsserver.web.projectWideIntellisense.enabled': true,
                //'typescript.tsserver.web.projectWideIntellisense.suppressSemanticErrors': false,
                'editor.guides.bracketPairsHorizontal': true,
                'editor.experimental.asyncTokenization': true
            })
        },
        extensions: [{
            config: {
                name: 'mycode-editor-extension',
                publisher: 'yswang',
                version: '1.0.0',
                engines: {
                    vscode: '*'
                }
            }
        }],
        advanced: {
            enableExtHostWorker: true,
        },
        monacoWorkerFactory: configureDefaultWorkerFactory
    };

    const fileSystemProvider = new InMemoryFileSystemProvider();
    const textEncoder = new TextEncoder();
    
    const options: IFileWriteOptions = {
        atomic: false,
        unlock: false,
        create: true,
        overwrite: true
    };

    const workspaceUri = vscode.Uri.file('/workspace');
    const helloTsUri = vscode.Uri.file('/workspace/hello.groovy');
    const testerTsUri = vscode.Uri.file('/workspace/tester.java');

    await fileSystemProvider.mkdir(workspaceUri);
    await fileSystemProvider.writeFile(helloTsUri, textEncoder.encode("def a = 1"), options);
    await fileSystemProvider.writeFile(testerTsUri, textEncoder.encode("public class A {\n\n}"), options);

    await fileSystemProvider.writeFile(workspaceFileUri, textEncoder.encode(createDefaultWorkspaceContent('/workspace')), options);
    
    registerFileSystemOverlay(1, fileSystemProvider);

    return {
        vscodeApiConfig,
        workspaceFileUri,
        helloTsUri,
        testerTsUri
    };
};
