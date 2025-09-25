const path = require('path');
const { runLanguageServer } = require('./lsp-common');


// 定义websocket服务配置
const eclipseJdtLsConfig = {
    languageId: 'java',
    port: 30003,
    path: '/java',
    basePath: path.join(__dirname, 'providers', 'java')
};

const runEclipseJdtLs = () => {
    const platformConfig = { 'win32': 'win', 'darwin': 'mac', 'linux': 'linux' }[process.platform];
    if (platformConfig == null) {
      throw Error(`java-lsp not supported on ${process.platform}`);
    }

    runLanguageServer({
        serverName: 'Eclipse JDT LS',
        pathName: eclipseJdtLsConfig.path,
        serverPort: eclipseJdtLsConfig.port,
        runCommand: 'java',
        runCommandArgs: [
            '-Declipse.application=org.eclipse.jdt.ls.core.id1',
            '-Dosgi.bundles.defaultStartLevel=4',
            '-Declipse.product=org.eclipse.jdt.ls.core.product',
            '-Dlog.level=ALL',
            '-Xmx1G',
            '--add-modules=ALL-SYSTEM',
            '--add-opens', 'java.base/java.util=ALL-UNNAMED',
            '--add-opens', 'java.base/java.lang=ALL-UNNAMED',
            '-jar',
            path.join(`${eclipseJdtLsConfig.basePath}`, 'jdtls', 'plugins', 'org.eclipse.equinox.launcher_1.6.900.v20240613-2009.jar'),
            '-configuration',
            path.join(`${eclipseJdtLsConfig.basePath}`, 'jdtls', `config_${platformConfig}`),
            '-data',
            path.join(`${eclipseJdtLsConfig.basePath}`, 'workspace')
        ],
        wsServerOptions: {
            noServer: true,
            perMessageDeflate: false
        }
    });
};

runEclipseJdtLs();
