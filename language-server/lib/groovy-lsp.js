const path = require('path');
const { runLanguageServer } = require('./lsp-common');

// 定义websocket服务配置
const groovyLspConfig = {
    languageId: 'groovy',
    port: 30002,
    path: '/groovy',
    basePath: path.join(__dirname, 'providers', 'groovy')
};

const runGroovyLanguageServer = () => {
    runLanguageServer({
        serverName: 'GROOVY',
        pathName: groovyLspConfig.path,
        serverPort: groovyLspConfig.port,
        runCommand: 'java',
        runCommandArgs: [
            path.join(`-Dadditional.classpath=${groovyLspConfig.basePath}`, 'libs', '*'),
            '-jar',
            path.join(`${groovyLspConfig.basePath}`, 'groovy-language-server-all.jar')
        ],
        wsServerOptions: {
            noServer: true,
            perMessageDeflate: false
        }
    });
};

runGroovyLanguageServer();
