import "@codingame/monaco-vscode-python-default-extension";
import "@codingame/monaco-vscode-theme-defaults-default-extension";

import './index.css'

import * as monaco from 'monaco-editor';
import { initialize } from '@codingame/monaco-vscode-api';

// we need to import this so monaco-languageclient can use vscode-api
import "vscode/localExtensionHost";
import { initWebSocketAndStartClient } from "./lsp-client";

// everything else is the same except the last line
import getLanguagesServiceOverride from "@codingame/monaco-vscode-languages-service-override";
import getThemeServiceOverride from "@codingame/monaco-vscode-theme-service-override";
import getTextMateServiceOverride from "@codingame/monaco-vscode-textmate-service-override";

import getConfigurationServiceOverride, { initUserConfiguration } from "@codingame/monaco-vscode-configuration-service-override";


export type WorkerLoader = () => Worker;
const workerLoaders: Partial<Record<string, WorkerLoader>> = {
  TextEditorWorker: () => new Worker(new URL('monaco-editor/esm/vs/editor/editor.worker.js', import.meta.url), { type: 'module' }),
  TextMateWorker: () => new Worker(new URL('@codingame/monaco-vscode-textmate-service-override/worker', import.meta.url), { type: 'module' })
};

window.MonacoEnvironment = {
  getWorker: function (_moduleId, label) {
    //console.log('getWorker', _moduleId, label);
    const workerFactory = workerLoaders[label];
    if (workerFactory != null) {
      return workerFactory();
    }
    throw new Error(`Worker ${label} not found`);
  }
}

const themeBtn = document.querySelector("#themeBtn") as HTMLButtonElement;
themeBtn.dataset.theme = "light";
themeBtn.addEventListener("click", function () {
  const isDark = this.dataset.theme === "dark";
  //const theme = isDark ? "Visual Studio Light" : "Visual Studio Dark";
  const theme = isDark ? "Default Light Modern" : "Default Dark Modern";
  this.dataset.theme = isDark ? "light" : "dark";
  monaco.editor.setTheme(theme);
});

const main = async () => {
  await initUserConfiguration(
    JSON.stringify({
      "workbench.colorTheme": "Default Light Modern"
    })
  );

  await initialize({
    ...getConfigurationServiceOverride(),
    ...getTextMateServiceOverride(),
    ...getThemeServiceOverride(),
    ...getLanguagesServiceOverride()
  });

  monaco.editor.create(document.getElementById("editor")!, {
    value: "import numpy as np\nprint('Hello world!')",
    language: "python"
  });

  initWebSocketAndStartClient("ws://localhost:5007");
};

main();
