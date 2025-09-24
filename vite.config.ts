import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import importMetaUrlPlugin from '@codingame/esbuild-import-meta-url-plugin'
import vsixPlugin from '@codingame/monaco-vscode-rollup-vsix-plugin'

export default defineConfig({
  worker: {
    format: 'es',
  },
  esbuild: {
    minifySyntax: false
  },
  plugins: [react(), vsixPlugin()],
  optimizeDeps: {
    include: [
      'vscode-textmate',
      'vscode-oniguruma',
    ],
    esbuildOptions: {
      plugins: [importMetaUrlPlugin]
    }
  }
})
