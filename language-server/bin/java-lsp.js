const fs = require('fs');
const path = require('path');
const { runLanguageServer } = require('./lsp-common');


// 定义websocket服务配置
const eclipseJdtLsConfig = {
    languageId: 'java',
    port: 30003,
    path: '/java',
    basePath: path.join(path.dirname(__dirname), 'providers', 'java')
};

const runEclipseJdtLs = () => {
    const platformConfig = { 'win32': 'win', 'darwin': 'mac', 'linux': 'linux' }[process.platform];
    if (platformConfig == null) {
      throw Error(`java-lsp not supported on ${process.platform}`);
    }

    // 支持使用内置自带的JRE，也可以使用系统环境变量JAVA_HOME指定的JDK
    let javaHome = path.join(eclipseJdtLsConfig.basePath, 'jre');
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

    const jdtlsPath = path.join(eclipseJdtLsConfig.basePath, 'jdtls');
    const jdtlsLauncherJar = path.join(`${jdtlsPath}`, 'plugins', 'org.eclipse.equinox.launcher_1.6.900.v20240613-2009.jar');
    const jdtlsConfig = path.join(`${jdtlsPath}`, `config_${platformConfig}`);

    const eclipseWorkspacePath = path.join(eclipseJdtLsConfig.basePath, 'workspace');
    if (!fs.existsSync(eclipseWorkspacePath)) {
        fs.mkdirSync(eclipseWorkspacePath, { recursive: true });
    }

    runLanguageServer({
        serverName: 'Eclipse JDT LS',
        pathName: eclipseJdtLsConfig.path,
        serverPort: eclipseJdtLsConfig.port,
        runCommand: javaCmd,
        runCommandArgs: [
            '-Declipse.application=org.eclipse.jdt.ls.core.id1',
            '-Dosgi.bundles.defaultStartLevel=4',
            '-Declipse.product=org.eclipse.jdt.ls.core.product',
            '-Djava.import.generatesMetadataFilesAtProjectRoot=false',
            '-DDetectVMInstallationsJob.disabled=true',
            '-Dfile.encoding=utf8',
            '-Dsun.zip.disableMemoryMapping=true',
            '-Dlog.level=ALL',
            '-XX:+UseParallelGC',
            '-XX:GCTimeRatio=4',
            '-XX:AdaptiveSizePolicyWeight=90',
            '-Xms200m', '-Xmx2G',
            '-Xlog:disable',
            '--add-modules=ALL-SYSTEM',
            '--add-opens', 'java.base/java.util=ALL-UNNAMED',
            '--add-opens', 'java.base/java.lang=ALL-UNNAMED',
            '--add-opens', 'java.base/sun.nio.fs=ALL-UNNAMED',
            '-jar', jdtlsLauncherJar,
            '-configuration', jdtlsConfig,
            '-data', eclipseWorkspacePath
        ],
        wsServerOptions: {
            noServer: true,
            perMessageDeflate: false
        }
    });
};

runEclipseJdtLs();
