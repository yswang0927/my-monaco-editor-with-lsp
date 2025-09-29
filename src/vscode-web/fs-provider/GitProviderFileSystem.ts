import * as vscode from 'vscode';
import { File, Directory, type Entry } from './fs-provider';
import { factory } from './data-provider';
import { pathBasename, pathDirname } from './utils';

export class GitProviderFileSystem implements vscode.FileSystemProvider {
  root = new Directory('');

  //constructor(private _context: vscode.ExtensionContext) {}
  constructor() {}

  getFsBasePath(uri: vscode.Uri) {
    return uri.authority;
  }

  // --- manage file metadata

  stat(uri: vscode.Uri): vscode.FileStat {
    return this._lookup(uri, false);
  }

  async readDirectory(uri: vscode.Uri): Promise<[string, vscode.FileType][]> {
    let entry = this._lookupAsDirectory(uri, false);
    if (!(entry && entry.entries.size)) {
      let res;
      try {
        res = await factory
          .provider(this.getFsBasePath(uri))
          .getItemsInPath(uri.path);
      } catch (e: any) {
        vscode.window.showErrorMessage(e.message);
        throw vscode.FileSystemError.Unavailable('Failed to fetch');
      }

      res.forEach(item => {
        if (item.type === vscode.FileType.Directory) {
          this.createDirectory(item.uri, { inMemory: true });
        } else {
          this.writeFile(
            item.uri,
            item.content!,
            {
              create: true,
              overwrite: true,
              inMemory: true,
            },
            item.downloadUrl
          );
        }
      });
    }
    
    entry = this._lookupAsDirectory(uri, false);
    let result: [string, vscode.FileType][] = [];
    for (const [name, child] of entry.entries) {
      result.push([name, child.type]);
    }
    return result;
  }

  // --- manage file contents

  async readFile(uri: vscode.Uri): Promise<Uint8Array> {
    let entry = this._lookupAsFile(uri, false);
    if (entry.data) {
      if (entry.data.length === 0) {
        if (entry.dowloadUrl) {
          const content = await factory
            .provider(this.getFsBasePath(uri))
            .getFileContent(entry.dowloadUrl);
          this.writeFile(uri, content, {
            create: true,
            overwrite: true,
            inMemory: true,
          });
        }
      }
      if (entry.data) {
        return entry.data;
      }
    }
    throw vscode.FileSystemError.FileNotFound();
  }

  writeFile(
    uri: vscode.Uri,
    content: Uint8Array,
    options: { create: boolean; overwrite: boolean; inMemory: boolean },
    downloadUrl?: string
  ): void {
    if (!options.inMemory) {
      throw vscode.FileSystemError.NoPermissions(
        'You cannot write a file to a remote repo'
      );
    }

    let basename = pathBasename(uri.path);
    let parent = this._lookupParentDirectory(uri);
    let entry = parent.entries.get(basename);
    if (entry instanceof Directory) {
      throw vscode.FileSystemError.FileIsADirectory(uri);
    }
    if (!entry && !options.create) {
      throw vscode.FileSystemError.FileNotFound(uri);
    }
    if (entry && options.create && !options.overwrite) {
      throw vscode.FileSystemError.FileExists(uri);
    }
    if (!entry) {
      entry = new File(basename, downloadUrl);
      parent.entries.set(basename, entry);
      this._fireSoon({ type: vscode.FileChangeType.Created, uri });
    }
    entry.mtime = Date.now();
    entry.size = content.byteLength;
    entry.data = content;

    this._fireSoon({ type: vscode.FileChangeType.Changed, uri });
  }

  // --- manage files/folders

  rename(oldUri: vscode.Uri, newUri: vscode.Uri, options: { overwrite: boolean }): void {
    throw vscode.FileSystemError.NoPermissions;
  }

  delete(uri: vscode.Uri): void {
    throw vscode.FileSystemError.NoPermissions('You have no permission to delete this file');
  }

  createDirectory(uri: vscode.Uri, options?: { inMemory: boolean }): void {
    // @ts-ignore
    if (!(options || {}).inMemory) {
      throw vscode.FileSystemError.NoPermissions('You have no permission to create a directory');
    }
    let basename = pathBasename(uri.path);
    let dirname = uri.with({ path: pathDirname(uri.path) });
    let parent = this._lookupAsDirectory(dirname, false);

    let entry = new Directory(basename);
    parent.entries.set(entry.name, entry);
    parent.mtime = Date.now();
    parent.size += 1;
    this._fireSoon(
      { type: vscode.FileChangeType.Changed, uri: dirname },
      { type: vscode.FileChangeType.Created, uri }
    );
  }

  // --- lookup

  private _lookup(uri: vscode.Uri, silent: false): Entry;
  private _lookup(uri: vscode.Uri, silent: boolean): Entry | undefined;
  private _lookup(uri: vscode.Uri, silent: boolean): Entry | undefined {
    let parts = uri.path.split('/');
    let entry: Entry = this.root;
    for (const part of parts) {
      if (!part) {
        continue;
      }
      let child: Entry | undefined;
      if (entry instanceof Directory) {
        child = entry.entries.get(part);
      }
      if (!child) {
        if (!silent) {
          throw vscode.FileSystemError.FileNotFound(uri);
        } else {
          return undefined;
        }
      }
      entry = child;
    }
    return entry;
  }

  private _lookupAsDirectory(uri: vscode.Uri, silent: boolean): Directory {
    let entry = this._lookup(uri, silent);
    if (entry instanceof Directory) {
      return entry;
    }
    throw vscode.FileSystemError.FileNotADirectory(uri);
  }

  private _lookupAsFile(uri: vscode.Uri, silent: boolean): File {
    let entry = this._lookup(uri, silent);
    if (entry instanceof File) {
      return entry;
    }
    throw vscode.FileSystemError.FileIsADirectory(uri);
  }

  private _lookupParentDirectory(uri: vscode.Uri): Directory {
    const dirname = uri.with({ path: pathDirname(uri.path) });
    return this._lookupAsDirectory(dirname, false);
  }

  // --- manage file events

  private _emitter = new vscode.EventEmitter<vscode.FileChangeEvent[]>();
  private _bufferedEvents: vscode.FileChangeEvent[] = [];
  private _fireSoonHandle?: any;

  readonly onDidChangeFile: vscode.Event<vscode.FileChangeEvent[]> = this
    ._emitter.event;

  watch(_resource: vscode.Uri): vscode.Disposable {
    // ignore, fires for all changes...
    return new vscode.Disposable(() => {});
  }

  private _fireSoon(...events: vscode.FileChangeEvent[]): void {
    this._bufferedEvents.push(...events);

    if (this._fireSoonHandle) {
      clearTimeout(this._fireSoonHandle);
    }

    this._fireSoonHandle = setTimeout(() => {
      this._emitter.fire(this._bufferedEvents);
      this._bufferedEvents.length = 0;
    }, 5);
  }
}