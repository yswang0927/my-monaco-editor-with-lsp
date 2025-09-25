/* --------------------------------------------------------------------------------------------
 * Copyright (c) 2024 TypeFox and others.
 * Licensed under the MIT License. See LICENSE in the package root for license information.
 * 
 * jdt-language-server-1.40.0-202409261450.tar.gz 下载 https://download.eclipse.org/jdtls/milestones/
 * ------------------------------------------------------------------------------------------ */

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

import { runLanguageServer } from './common/language-server-runner.js';
import { LanguageName } from './common/server-commons.js';


const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(dirname(dirname(__filename)));
const javaServerBasePath = join(__dirname, 'java');

// 定义websocket服务配置
const eclipseJdtLsConfig = {
    port: 30003,
    path: '/java',
    basePath: javaServerBasePath,
    languageId: 'java'
};

const runEclipseJdtLs = () => {
    runLanguageServer({
        serverName: 'Eclipse JDT LS',
        pathName: eclipseJdtLsConfig.path,
        serverPort: eclipseJdtLsConfig.port,
        runCommand: LanguageName.java,
        runCommandArgs: [
            '-Declipse.application=org.eclipse.jdt.ls.core.id1',
            '-Dosgi.bundles.defaultStartLevel=4',
            '-Declipse.product=org.eclipse.jdt.ls.core.product',
            '-Dlog.level=ALL',
            '-Xmx1G',
            '--add-modules=ALL-SYSTEM',
            '--add-opens',
            'java.base/java.util=ALL-UNNAMED',
            '--add-opens',
            'java.base/java.lang=ALL-UNNAMED',
            '-jar',
            `${eclipseJdtLsConfig.basePath}/jdtls/plugins/org.eclipse.equinox.launcher_1.6.900.v20240613-2009.jar`,
            '-configuration',
            `${eclipseJdtLsConfig.basePath}/jdtls/config_linux`,
            '-data',
            `${eclipseJdtLsConfig.basePath}/workspace`
        ],
        wsServerOptions: {
            noServer: true,
            perMessageDeflate: false
        }
    });
};

runEclipseJdtLs();
