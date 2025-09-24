import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import importMetaUrlPlugin from '@codingame/esbuild-import-meta-url-plugin'

export default defineConfig({
  esbuild: {
    minifySyntax: false
  },
  worker: {
    format: 'es',
  },
  plugins: [react()],
  optimizeDeps: {
    include: [
      'vscode-textmate',
      'vscode-oniguruma',
      '@vscode/vscode-languagedetection'
    ],
    esbuildOptions: {
      plugins: [importMetaUrlPlugin]
    }
  }
})
