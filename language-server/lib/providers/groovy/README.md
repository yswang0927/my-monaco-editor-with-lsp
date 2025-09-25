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