(async () => {
  // 根据 URL 参数或 localStorage 设置语言环境
  const searchParams = new URLSearchParams(window.location.search);

  let locale = searchParams.get('locale');
  if (locale == null) {
    locale = window.localStorage.getItem('vscode-locale');
  }
  
  if (locale == null) {
    locale = navigator.language.toLowerCase();
    if (locale === 'zh' || locale.startsWith('zh-')) {
      locale = 'zh-hans';
    } else {
      locale = 'en';
    }
  }

  const localeLoader: Partial<Record<string, () => Promise<void>>> = {
    /*
    cs: async () => {
      await import('@codingame/monaco-vscode-language-pack-cs')
    },
    de: async () => {
      await import('@codingame/monaco-vscode-language-pack-de')
    },
    es: async () => {
      await import('@codingame/monaco-vscode-language-pack-es')
    },
    fr: async () => {
      await import('@codingame/monaco-vscode-language-pack-fr')
    },
    it: async () => {
      await import('@codingame/monaco-vscode-language-pack-it')
    },
    ja: async () => {
      await import('@codingame/monaco-vscode-language-pack-ja')
    },
    ko: async () => {
      await import('@codingame/monaco-vscode-language-pack-ko')
    },
    pl: async () => {
      await import('@codingame/monaco-vscode-language-pack-pl')
    },
    'pt-br': async () => {
      await import('@codingame/monaco-vscode-language-pack-pt-br')
    },
    'qps-ploc': async () => {
      await import('@codingame/monaco-vscode-language-pack-qps-ploc')
    },
    ru: async () => {
      await import('@codingame/monaco-vscode-language-pack-ru')
    },
    tr: async () => {
      await import('@codingame/monaco-vscode-language-pack-tr')
    },
    */
    'zh-hans': async () => {
      await import('@codingame/monaco-vscode-language-pack-zh-hans')
    },
    'zh-hant': async () => {
      await import('@codingame/monaco-vscode-language-pack-zh-hant')
    }
  }

  if (locale != null) {
    window.localStorage.setItem('vscode-locale', locale);
    const loader = localeLoader[locale]
    if (loader != null) {
      await loader()
    } else {
      console.error(`Unknown locale ${locale}`)
    }
  }

  await import('./main.workbench');

})();
