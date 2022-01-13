import * as ts from "typescript";

const code = "if(true){alert('foo')}";

const sourceFile = ts.createSourceFile("temp.ts", code, 8);
let indent = 0;

function printTree(node: ts.Node) {
  console.log(new Array(indent + 1).join(" ") + ts.SyntaxKind[node.kind]);
  indent++;
  ts.forEachChild(node, printTree);
  indent--;
}
printTree(sourceFile);

/**
 * Generates a nested data structure representing parent and their child nodes
 * for a given node/ast.
 *
 * `[Kind, [Child, ...]]`
 */
export function generateTree(node: ts.Node, acc: string[][] = []) {
  const parent: string = ts.SyntaxKind[node.kind];
  const children: string[][] = [];

  ts.forEachChild(node, (node: ts.Node) => {
    generateTree(node, children);
  });
  acc.push([parent, children]);

  return acc;
}

export function stringToSourceFile(code: string): ts.Node {
  // 8 being ES2021, which sets the `languageVersion`.
  return ts.createSourceFile("temp.ts", code, 8);
}

console.log(generateTree(sourceFile));
