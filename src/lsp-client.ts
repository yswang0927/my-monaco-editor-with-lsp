// lsp-client.ts
import { CloseAction, ErrorAction, MessageTransports } from 'vscode-languageclient/browser.js';
import { WebSocketMessageReader, WebSocketMessageWriter, toSocket } from 'vscode-ws-jsonrpc';
import { MonacoLanguageClient } from 'monaco-languageclient';

export const initWebSocketAndStartClient = (url: string, languageId: string): WebSocket => {
    const webSocket = new WebSocket(url);
    webSocket.onopen = () => {
	    // creating messageTransport
        const socket = toSocket(webSocket);
        const reader = new WebSocketMessageReader(socket);
        const writer = new WebSocketMessageWriter(socket);
        // creating language client
        const languageClient = createLanguageClient({
            reader,
            writer
        }, languageId);
        languageClient.start();
        reader.onClose(() => languageClient.stop());
    };
    return webSocket;
};

const createLanguageClient = (messageTransports: MessageTransports, languageId: string): MonacoLanguageClient => {
    return new MonacoLanguageClient({
        name: 'Sample Language Client',
        clientOptions: {
            // use a language id as a document selector
            documentSelector: [languageId],
            // disable the default error handler
            errorHandler: {
                error: () => ({ action: ErrorAction.Continue }),
                closed: () => ({ action: CloseAction.DoNotRestart })
            }
        },
        messageTransports: messageTransports
    });
};