import * as vscode from 'vscode';
import { getProviderKindFromRepoUrl, getRepoUrlFromFsBasePath } from './utils';
import { DataProviderKind } from './costants';
import { GitHubProvider } from './github-provider';

export type Item = {
  type: vscode.FileType;
  uri: vscode.Uri;
  downloadUrl?: string;
  content?: Uint8Array;
};

export interface DataProvider {
  getItemsInPath(path: string): Promise<Item[]>;
  getFileContent(fileDownloadUrl: string): Promise<Uint8Array>;
};

class DataProviderFactory {
  private instances: { [fsBasePath: string]: DataProvider } = {};

  public provider(fsBasePath: string) {
    if (!this.instances[fsBasePath]) {
      this.instances[fsBasePath] = this.createInstance(
        fsBasePath
      );
    }
    return this.instances[fsBasePath];
  }

  private createInstance(fsBasePath: string) {
    const repoUrl = getRepoUrlFromFsBasePath(fsBasePath);
    const kind: DataProviderKind = getProviderKindFromRepoUrl(repoUrl!);

    switch (kind) {
      case DataProviderKind.Github:
        return new GitHubProvider(fsBasePath);
      case DataProviderKind.Bitbucket:
      case DataProviderKind.Gitlab:
      case DataProviderKind.Unknown:
      default:
        throw new Error(`Data provider not implemented for: ${kind}`);
    }
  }
}

export const factory = new DataProviderFactory();