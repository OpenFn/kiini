import * as ts from 'typescript';

const code = "if(true){alert('foo')}";

const sourceFile = ts.createSourceFile('temp.ts', code);
let indent = 0;

function printTree(node) {
    console.log(new Array(indent + 1).join(' ') + ts.SyntaxKind[node.kind]);
    indent++;
    ts.forEachChild(node, printTree);
    indent--;
}
printTree(sourceFile);
