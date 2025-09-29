import Url from 'url-parse';
import * as vscode from 'vscode';

import { DataProviderKind, URI_SCHEME } from './costants';

export const stripSlash = (str: string) => {
  // strip leading and trailing slashes
  return str.replace(/^\//, '').replace(/\/$/, '');
};

export const pathBasename = (uriPath: string) => {
  // 1. 如果路径是空字符串或不是字符串，返回空字符串
  if (typeof uriPath !== 'string' || uriPath.length === 0) {
    return '';
  }

  // 2. 移除末尾的斜杠，除非路径是根目录 '/'
  let path = uriPath;
  if (path.length > 1 && path.endsWith('/')) {
    path = path.slice(0, -1);
  }

  // 3. 找到最后一个斜杠的位置
  const lastSlashIndex = path.lastIndexOf('/');

  // 4. 如果找到斜杠，返回它之后的部分；否则，返回整个路径
  if (lastSlashIndex === -1) {
    return path;
  }
  return path.slice(lastSlashIndex + 1);
};

export const pathDirname = (uriPath: string) => {
  // 1. 如果路径是空字符串或不是字符串，返回 '.'
  if (typeof uriPath !== 'string' || uriPath.length === 0) {
    return '.';
  }

  // 2. 移除末尾的斜杠，除非路径是根目录 '/'
  let path = uriPath;
  if (path.length > 1 && path.endsWith('/')) {
    path = path.slice(0, -1);
  }

  // 3. 找到最后一个斜杠的位置
  const lastSlashIndex = path.lastIndexOf('/');
  
  // 4. 如果没有找到斜杠，返回 '.'
  if (lastSlashIndex === -1) {
    return '.';
  }

  // 5. 如果斜杠在第一个位置（即路径是 '/...'）
  if (lastSlashIndex === 0) {
    return '/';
  }

  // 6. 返回斜杠之前的所有部分
  return path.slice(0, lastSlashIndex);
};


export const getApiBaseUrl = (repoUrl: string) => {
  const p = new Url(repoUrl);
  return `${p.protocol}//api.${stripSlash(p.hostname)}/repos/${stripSlash(p.pathname)}`;
};

export const getRefQuery = (repoUrl: string) => {
  const p = new Url(repoUrl);
  const refQuery = String(p.query || '');
  return `${refQuery}`;
};

export const getProviderKindFromRepoUrl = (repoUrl: string ): DataProviderKind => {
  const { hostname } = new Url(repoUrl);
  if (hostname.includes('github.com')) {
    return DataProviderKind.Github;
  } else if (hostname.includes('bitbucket.org')) {
    return DataProviderKind.Bitbucket;
  } else if (hostname.includes('gitlab.com')) {
    return DataProviderKind.Gitlab;
  }
  return DataProviderKind.Unknown;
};

export const getFsBasePathFromRepoUrl = (repoUrl: string): string => {
  const { pathname } = new Url(repoUrl);
  let [repoPath, ref] = pathname.split('@');

  // vscode does not like `/` in the base path for some reason
  const friendlyRepoPath = stripSlash(repoPath).replace('/', ':');
  const friendlyRef = stripSlash(ref || '').replace('/', ':');

  // example: GITHUB@vscode:microsoft#master
  return (
    `${getProviderKindFromRepoUrl(repoUrl)}@${friendlyRepoPath}` +
    (friendlyRef ? `:${friendlyRef}` : '')
  );
};

export const getRepoUrlFromFsBasePath = (fsBasePath: string) => {
  let [kind, pathName] = fsBasePath.split('@');

  const [owner, repo, ref] = pathName.split(':');
  const refQuery = ref ? `?ref=${ref}` : '';

  if (kind === DataProviderKind.Github) {
    return `https://github.com/${owner}/${repo}${refQuery}`;
  } else if (kind === DataProviderKind.Bitbucket) {
    return `https://bitbucket.com/${owner}/${repo}${refQuery}`;
  } else if (kind === DataProviderKind.Gitlab) {
    return `https://gitlab.com/${owner}/${repo}${refQuery}`;
  }
};

export const getWorkspaceFolderLabel = (repoUrl: string) => {
  const { pathname } = new Url(repoUrl);

  // example: github://vscode/microsoft@master
  const kind = getProviderKindFromRepoUrl(repoUrl).toLowerCase();
  return `${kind}://${stripSlash(pathname)}`;
};

export const validateRepoUrl = (repoUrl: string = '') => {
  const regex = /https:\/\/github.com\/[A-Za-z0-9_.\-~]+\/[A-Za-z0-9_.\-~]+/;
  return regex.test(repoUrl);
};

export const getWsFolder = (): vscode.WorkspaceFolder | undefined => {
  const workspaceFolders = vscode.workspace.workspaceFolders;
  if (workspaceFolders) {
    const ws = workspaceFolders.find(wsf => wsf.uri.scheme === URI_SCHEME);
    return ws;
  }
};