/* --------------------------------------------------------------------------------------------
 * Copyright (c) 2024 TypeFox and others.
 * Licensed under the MIT License. See LICENSE in the package root for license information.
 * ------------------------------------------------------------------------------------------ */

//import type { IStoredWorkspace } from '@codingame/monaco-vscode-configuration-service-override';
import type { EditorAppConfig } from 'monaco-languageclient/editorApp';
import type { LanguageClientConfig } from 'monaco-languageclient/lcwrapper';
import type { MonacoVscodeApiConfig } from 'monaco-languageclient/vscodeApiWrapper';

export const createDefaultWorkspaceContent = (workspacePath: string) => {
    return JSON.stringify(
        {
            folders: [
                {
                    path: workspacePath
                }
            ]
        },
        null,
        2
    );
};

export type ExampleAppConfig = {
    vscodeApiConfig: MonacoVscodeApiConfig;
    languageClientConfig: LanguageClientConfig;
    editorAppConfig: EditorAppConfig;
};
