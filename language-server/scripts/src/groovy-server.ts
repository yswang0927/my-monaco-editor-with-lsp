import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

import { runLanguageServer } from './common/language-server-runner';
import { LanguageName } from './common/server-commons';


const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(dirname(dirname(__filename)));
const groovyServerBasePath = join(__dirname, 'groovy');

// 定义websocket服务配置
const groovyLspConfig = {
    port: 30002,
    path: '/groovy',
    basePath: groovyServerBasePath,
    languageId: 'groovy'
};

const runGroovyLanguageServer = () => {
    runLanguageServer({
        serverName: 'GROOVY',
        pathName: groovyLspConfig.path,
        serverPort: groovyLspConfig.port,
        runCommand: LanguageName.java,
        runCommandArgs: [
            '-jar',
            `${groovyLspConfig.basePath}/groovy-language-server-all.jar`
        ],
        wsServerOptions: {
            noServer: true,
            perMessageDeflate: false
        }
    });
};

runGroovyLanguageServer();