import * as prettier from "prettier";
import minIndent from "min-indent";

export function format(code: string): string {
  return prettier.format(stripIndent(code), { parser: "typescript" });
}

// Remove all indentation based on the position of the first/minimum indentation.
function stripIndent(string: string): string {
	const indent = minIndent(string);

	if (indent === 0) {
		return string;
	}

	const regex = new RegExp(`^[ \\t]{${indent}}`, 'gm');

	return string.replace(regex, '');
}