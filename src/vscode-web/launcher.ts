/* --------------------------------------------------------------------------------------------
 * Copyright (c) 2024 TypeFox and others.
 * Licensed under the MIT License. See LICENSE in the package root for license information.
 * ------------------------------------------------------------------------------------------ */

import './style.css';

import { initLocaleLoader } from 'monaco-languageclient/vscodeApiLocales';
import { runVscodeWeb } from './main';

await initLocaleLoader();

runVscodeWeb(document.getElementById('editor')!);
