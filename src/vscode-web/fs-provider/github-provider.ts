import * as vscode from 'vscode';

import { DataProvider, Item } from './data-provider';
import { URI_SCHEME } from './costants';
import {
  getApiBaseUrl,
  getRefQuery,
  stripSlash,
  getRepoUrlFromFsBasePath,
} from './utils';

type GithubItem = {
  path: string;
  type: 'dir' | 'file';
  download_url: string;
};

export class GitHubProvider implements DataProvider {
  constructor(private fsBasePath: string) {}
  public async getItemsInPath(path: string): Promise<Item[]> {
    const repoUrl = getRepoUrlFromFsBasePath(this.fsBasePath);
    const apiUrl = `${getApiBaseUrl(repoUrl!)}/contents/${stripSlash(path)}${getRefQuery(repoUrl!)}`;

    const res = await fetch(apiUrl);

    if (!res.ok) {
      const errorMessge = await res.text();
      throw new Error(errorMessge);
    }

    const data: GithubItem[] = await res.json();

    return data.map(item => {
      if (item.path.startsWith('./')) {
        item.path = item.path.split('./')[1] || '';
      }

      const uri = vscode.Uri.parse(`${URI_SCHEME}://${this.fsBasePath}/${item.path}`);

      if (item.type === 'dir') {
        return {
          uri: uri.with({ query: `type=${vscode.FileType.Directory}` }),
          type: vscode.FileType.Directory,
        };
      } else {
        const content = new TextEncoder().encode('');
        return {
          uri: uri.with({ query: `type=${vscode.FileType.File}` }),
          content,
          type: vscode.FileType.File,
          downloadUrl: item.download_url,
        };
      }
    });
  }

  public async getFileContent(fileDownloadUrl: string): Promise<Uint8Array> {
    const res = await fetch(fileDownloadUrl);
    const text = await res.text();
    return new TextEncoder().encode(text);
  }
  
}