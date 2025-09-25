## Java lsp说明

Java LSP 能力依赖 `eclipse-jdtls`, 下载 [jdt-language-server-1.40.0](https://download.eclipse.org/jdtls/milestones/1.40.0/jdt-language-server-1.40.0-202409261450.tar.gz), 解压到 `java/jdtls/` 目录下.

```shell
# 解压后的目录结构如下

jdtls/
  |- bin
  |- config_linux
  |- config_xxx
  |- features
  |- plugins

```

### 核心启动命令

```shell
java \
	-Declipse.application=org.eclipse.jdt.ls.core.id1 \
	-Dosgi.bundles.defaultStartLevel=4 \
	-Declipse.product=org.eclipse.jdt.ls.core.product \
	-Dlog.level=ALL \
	-Xmx1G \
	--add-modules=ALL-SYSTEM \
	--add-opens java.base/java.util=ALL-UNNAMED \
	--add-opens java.base/java.lang=ALL-UNNAMED \
	-jar ./plugins/org.eclipse.equinox.launcher_1.6.900.v20240613-2009.jar \
	-configuration ./config_linux \
	-data /path/to/data
```