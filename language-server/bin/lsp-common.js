const { WebSocketServer } = require('ws');
const express = require('express');

const { WebSocketMessageReader, WebSocketMessageWriter } = require('vscode-ws-jsonrpc');
const { createConnection, createServerProcess, forward } = require('vscode-ws-jsonrpc/server');
const { Message, InitializeRequest } = require('vscode-languageserver-protocol');

/*
type languageServerRunConfig = {
    serverName: string;
    pathName: string;
    serverPort: number;
    runCommand: string;
    runCommandArgs: string[];
    wsServerOptions: ServerOptions,
    spawnOptions?: cp.SpawnOptions;
    logMessages?: boolean;
    requestMessageHandler?: (message: RequestMessage) => RequestMessage;
    responseMessageHandler?: (message: ResponseMessage) => ResponseMessage;
}
*/

/*
type config = {
    server: Server,
    wss: WebSocketServer
}
*/

/**
 * start the language server inside the current process
 */
const launchLanguageServer = (runconfig, socket) => {
    const { serverName, runCommand, runCommandArgs, spawnOptions } = runconfig;
    // start the language server as an external process
    const reader = new WebSocketMessageReader(socket);
    const writer = new WebSocketMessageWriter(socket);
    const socketConnection = createConnection(reader, writer, () => socket.dispose());
    const serverConnection = createServerProcess(serverName, runCommand, runCommandArgs, spawnOptions);
    if (serverConnection !== undefined) {
        forward(socketConnection, serverConnection, message => {
            if (Message.isRequest(message)) {
                if (message.method === InitializeRequest.type.method) {
                    const initializeParams = message.params;
                    initializeParams.processId = process.pid;
                }

                if (runconfig.logMessages ?? false) {
                    console.log(`${serverName} Server received: ${message.method}`);
                    console.log(message);
                }
                if (runconfig.requestMessageHandler !== undefined) {
                    return runconfig.requestMessageHandler(message);
                }
            }
            if (Message.isResponse(message)) {
                if (runconfig.logMessages ?? false) {
                    console.log(`${serverName} Server sent:`);
                    console.log(message);
                }
                if (runconfig.responseMessageHandler !== undefined) {
                    return runconfig.responseMessageHandler(message);
                }
            }
            return message;
        });
    }
};

const upgradeWsServer = (runconfig, config) => {
    /**
     * @param {IncomingMessage} request
     * @param {Socket} socket
     * @param {Buffer} head
     */
    config.server.on('upgrade', (request, socket, head) => {
        const baseURL = `http://${request.headers.host}/`;
        const pathName = request.url !== undefined ? new URL(request.url, baseURL).pathname : undefined;
        if (pathName === runconfig.pathName) {
            config.wss.handleUpgrade(request, socket, head, webSocket => {
                const socket /* IWebSocket */ = {
                    send: content => webSocket.send(content, error => {
                        if (error) {
                            throw error;
                        }
                    }),
                    onMessage: cb => webSocket.on('message', (data) => {
                        cb(data);
                    }),
                    onError: cb => webSocket.on('error', cb),
                    onClose: cb => webSocket.on('close', cb),
                    dispose: () => webSocket.close()
                };
                // launch the server when the web socket is opened
                if (webSocket.readyState === webSocket.OPEN) {
                    launchLanguageServer(runconfig, socket);
                } else {
                    webSocket.on('open', () => {
                        launchLanguageServer(runconfig, socket);
                    });
                }
            });
        }
    });
};


const runLanguageServer = (languageServerRunConfig) => {
    process.on('uncaughtException', err => {
        console.error('Uncaught Exception: ', err.toString());
        if (err.stack !== undefined) {
            console.error(err.stack);
        }
    });

    // create the express application
    const app = express();
    // server the static content, i.e. index.html
    app.use(express.static(__dirname));
    // start the http server
    const httpServer = app.listen(languageServerRunConfig.serverPort);
    const wss = new WebSocketServer(languageServerRunConfig.wsServerOptions);
    // create the web socket
    upgradeWsServer(languageServerRunConfig, {
        server: httpServer,
        wss: wss
    });
};

module.exports = { runLanguageServer };
