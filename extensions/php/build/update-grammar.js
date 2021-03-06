/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
'use strict';

const updateGrammar = require('../../../build/npm/update-grammar');

function adaptInjectionScope(grammar) {
	// we're using the HTML grammar from https://github.com/textmate/html.tmbundle which has moved away from source.js.embedded.html
	const oldInjectionKey = "text.html.php - (meta.embedded | meta.tag), L:((text.html.php meta.tag) - (meta.embedded.block.php | meta.embedded.line.php)), L:(source.js.embedded.html - (meta.embedded.block.php | meta.embedded.line.php))";
	const newInjectionKey = "text.html.php - (meta.embedded | meta.tag), L:((text.html.php meta.tag) - (meta.embedded.block.php | meta.embedded.line.php)), L:(source.js - (meta.embedded.block.php | meta.embedded.line.php))";

	const injections = grammar.injections;
	const injection = injections[oldInjectionKey];
	if (!injection) {
		throw new Error("Can not find PHP injection to patch");
	}
	delete injections[oldInjectionKey];
	injections[newInjectionKey] = injection;
}

// Workaround for https://github.com/Microsoft/vscode/issues/40279
// and https://github.com/Microsoft/vscode-textmate/issues/59
function fixBadRegex(grammar) {
	const scopeResolution = grammar.repository['scope-resolution'];
	if (scopeResolution) {
		const match = scopeResolution.patterns[0].match;
		if (match === '(?i)([a-z_\\x{7f}-\\x{7fffffff}\\\\][a-z0-9_\\x{7f}-\\x{7fffffff}\\\\]*)(?=\\s*::)') {
			scopeResolution.patterns[0].match = '([A-Za-z_\\x{7f}-\\x{7fffffff}\\\\][A-Za-z0-9_\\x{7f}-\\x{7fffffff}\\\\]*)(?=\\s*::)';
			return;
		}
	}

	throw new Error(`fixBadRegex callback couldn't patch the regex. It may be obsolete`);
}

updateGrammar.update('atom/language-php', 'grammars/php.cson', './syntaxes/php.tmLanguage.json', fixBadRegex);
updateGrammar.update('atom/language-php', 'grammars/html.cson', './syntaxes/html.tmLanguage.json', adaptInjectionScope);
