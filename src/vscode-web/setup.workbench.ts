import { 
  IStorageService, 
  IWorkbenchLayoutService, 
  getService, 
  initialize as initializeMonacoService 
} from '@codingame/monaco-vscode-api'
import getWorkbenchServiceOverride from '@codingame/monaco-vscode-workbench-service-override'
//import getViewsServiceOverride, { attachPart, Parts } from "@codingame/monaco-vscode-views-service-override"
import getQuickAccessServiceOverride from '@codingame/monaco-vscode-quickaccess-service-override'
import { BrowserStorageService } from '@codingame/monaco-vscode-storage-service-override'
import { ExtensionHostKind } from '@codingame/monaco-vscode-extensions-service-override'
import { registerExtension } from '@codingame/monaco-vscode-api/extensions'

import {
  commonServices,
  constructOptions,
  envOptions,
  remoteAuthority,
  userDataProvider,
  disableShadowDom
} from './setup.common'

// import { initLspClient } from './features/lsp'

let container = (window as any).vscodeContainer;

if (container == null || container === undefined) {
  container = document.createElement('div');
  container.style.height = '100vh';

  document.body.appendChild(container);

  if (!disableShadowDom) {
    const shadowRoot = container.attachShadow({ mode: 'open' });

    const workbenchElement = document.createElement('div');
    workbenchElement.style.height = '100vh';
    
    const style = document.createElement('style');
    style.textContent = `
    .monaco-workbench .pane-composite-part > .header-or-footer .composite-bar-container {
      justify-content: center;
    }
    .monaco-workbench .pane-composite-part > .header-or-footer .composite-bar-container .actions-container {
      gap: 6px;
    }
    `;
    shadowRoot.appendChild(style);
    shadowRoot.appendChild(workbenchElement);
    container = workbenchElement;
  }
}


// Override services
await initializeMonacoService(
  {
    ...commonServices,
    ...getWorkbenchServiceOverride(),
    ...getQuickAccessServiceOverride({
      isKeybindingConfigurationVisible: () => true,
      shouldUseGlobalPicker: () => true
    })
  },
  container,
  constructOptions,
  envOptions
);

// Use `monaco-languageclient` to connect to the java lsp-server
/*
await initLspClient({
  websocketUrl: 'ws://127.0.0.1:30003/java',
  languageId: 'java',
  basePath: '/home/xk/myvscode-workspace' // 必须是一个存在的物理绝对路径,否则LSP不生效
});
*/

// 可以通过 attachPart() 自定义挂载视图部分
// attachPart(Parts.EDITOR_PART, this.editorRef);
// attachPart(Parts.ACTIVITYBAR_PART, this.activityBarRef);
// attachPart(Parts.SIDEBAR_PART, this.sidebarRef);

//const layoutService = await getService(IWorkbenchLayoutService)


export async function clearStorage(): Promise<void> {
  await userDataProvider.reset()
  await ((await getService(IStorageService)) as BrowserStorageService).clear()
}

await registerExtension(
  {
    name: 'mycoder',
    publisher: 'MyCoder',
    version: '1.0.0',
    engines: {
      vscode: '*'
    }
  },
  ExtensionHostKind.LocalProcess
).setAsDefaultApi();

export { remoteAuthority }
