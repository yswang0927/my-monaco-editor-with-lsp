/* --------------------------------------------------------------------------------------------
 * Copyright (c) 2024 TypeFox and others.
 * Licensed under the MIT License. See LICENSE in the package root for license information.
 * ------------------------------------------------------------------------------------------ */

import { configure } from './config';
import { configurePostStart } from './common';
import { MonacoVscodeApiWrapper } from 'monaco-languageclient/vscodeApiWrapper';
import { type HtmlContainerConfig } from 'monaco-languageclient/vscodeApiWrapper';

export const runVscodeWeb = async (htmlContainer: HtmlContainerConfig) => {
    const configResult = await configure(htmlContainer || document.body);

    // perform global init
    const apiWrapper = new MonacoVscodeApiWrapper(configResult.vscodeApiConfig);
    await apiWrapper.start();

    await configurePostStart(apiWrapper, configResult);
};
