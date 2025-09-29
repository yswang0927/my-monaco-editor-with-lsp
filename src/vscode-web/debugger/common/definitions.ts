/* --------------------------------------------------------------------------------------------
 * from https://github.com/TypeFox/monaco-languageclient/blob/main/packages/examples/src/debugger/common/definitions.ts
 * ------------------------------------------------------------------------------------------ 
 */

import { RegisteredMemoryFile } from '@codingame/monaco-vscode-files-service-override';
import { Uri } from 'vscode';

export type FileDefinition = {
    path: string;
    code: string;
    uri: Uri;
}

export type InitMessage = {
    id: 'init',
    files: Record<string, FileDefinition>
    defaultFile: string;
    debuggerExecCall: string;
};

export type ConfigParams = {
    extensionName: string;
    languageId: string;
    documentSelector: string[];
    homeDir: string;
    workspaceRoot: string;
    workspaceFile: Uri;
    htmlContainer: HTMLElement | 'ReactPlaceholder';
    protocol: 'ws' | 'wss';
    hostname: string;
    port: number;
    files: Map<string, FileDefinition>;
    defaultFile: string;
    helpContainerCmd: string;
    debuggerExecCall: string;
}

export const createDebugLaunchConfigFile = (workspacePath: string, type: string) => {
    return new RegisteredMemoryFile(
        Uri.file(`${workspacePath}/.vscode/launch.json`),
        JSON.stringify(
            {
                version: '0.2.0',
                configurations: [
                    {
                        name: 'Debugger: Lauch',
                        type,
                        request: 'attach',
                    }
                ]
            },
            null,
            2
        )
    );
};