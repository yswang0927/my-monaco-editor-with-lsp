# LSP

提供了 `java`, `groovy` 和 `python` 语言LSP能力, 使用 `nodejs` 提供LSP服务启动和对外提供 websocket 服务.

## 启动服务

```shell
cd node

# 先安装依赖
npm i 

# 启动 java-lsp 服务
npm run start:server:java

# 启动 groovy-lsp 服务
npm run start:server:groovy

# 启动 python-lsp 服务
npm run start:server:python

```

## Java lsp说明

Java LSP 能力依赖 `eclipse-jdtls`, 下载 [jdt-language-server-1.40.0](https://download.eclipse.org/jdtls/milestones/1.40.0/jdt-language-server-1.40.0-202409261450.tar.gz), 解压到 `java/jdtls/` 目录下.

Node启动脚本见 `node/src/java-server.ts`


## Groovy lsp说明

Groovy LSP 能力依赖 `groovy-language-server-all.jar`, 它是从 [github:GroovyLanguageServer](https://github.com/GroovyLanguageServer/groovy-language-server) 源码编译得到的.

```shell
# 下载源码
git clone https://github.com/GroovyLanguageServer/groovy-language-server.git

# 进行定制修改, 支持导入额外的 jar 包来进行提示

public class GroovyLanguageServer {
   public static void main(String[] args) {
        InputStream systemIn = System.in;
        OutputStream systemOut = System.out;
        // redirect System.out to System.err because we need to prevent
        // System.out from receiving anything that isn't an LSP message
        System.setOut(new PrintStream(System.err));

        // yswang: 增加支持外部 additional classpath 配置
        // java -Dadditional.classpath=/path1/*:/path2/xx.jar -jar groovy-language-server-all.jar
        CompilationUnitFactory compilationUnitFactory = new CompilationUnitFactory();

        String additionalClasspath = System.getProperty("additional.classpath");
        if (additionalClasspath != null && !additionalClasspath.isEmpty()) {
            String[] paths = additionalClasspath.split(System.getProperty("path.separator"));
            compilationUnitFactory.setAdditionalClasspathList(Arrays.asList(paths));
        }

        GroovyLanguageServer server = new GroovyLanguageServer(compilationUnitFactory);
        
        Launcher<LanguageClient> launcher = Launcher.createLauncher(server, LanguageClient.class, systemIn, systemOut);
        server.connect(launcher.getRemoteProxy());
        launcher.startListening();
   }
}

# 使用 gradle 进行编译输出 groovy-language-server-all.jar
./gradlew build

```

Node启动脚本见 `node/src/groovy-server.ts`

> 
> 额外支持2个配置项
> 
> - groovy.java.home (string - sets a custom JDK path)
> - groovy.classpath (string[] - sets a custom classpath to include .jar files)
> 

