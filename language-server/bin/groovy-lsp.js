const fs = require('fs');
const path = require('path');
const { runLanguageServer } = require('./lsp-common');

// 定义websocket服务配置
const groovyLspConfig = {
    languageId: 'groovy',
    port: 30002,
    path: '/groovy',
    basePath: path.join(path.dirname(__dirname), 'providers', 'groovy')
};

const runGroovyLanguageServer = () => {

    // 支持使用内置自带的JRE，也可以使用系统环境变量JAVA_HOME指定的JDK
    let javaHome = path.join(groovyLspConfig.basePath, 'jre');
    if (!fs.existsSync(javaHome)) {
        javaHome = process.env.JAVA_HOME;
    }
    if (!javaHome) {
        throw Error('JAVA_HOME environment variable is not set. Please set it to your JDK installation path.');
    }
    const javaCmd = path.join(javaHome, 'bin', process.platform === 'win32' ? 'java.exe' : 'java');
    if (!fs.existsSync(javaCmd)) {
        throw Error(`Java executable not found at ${javaCmd}. Please check your JAVA_HOME setting.`);
    }

    const additionalClasspath = path.join(groovyLspConfig.basePath, 'libs');
    if (!fs.existsSync(additionalClasspath)) {
        fs.mkdirSync(additionalClasspath, { recursive: true });
    }

    runLanguageServer({
        serverName: 'GROOVY',
        pathName: groovyLspConfig.path,
        serverPort: groovyLspConfig.port,
        runCommand: javaCmd,
        runCommandArgs: [
            path.join(`-Dadditional.classpath=${additionalClasspath}`, '*'),
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
