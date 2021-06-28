import { Project, ts } from "ts-morph";

const project = new Project({
  compilerOptions: { outDir: "dist", declaration: true },
});
const sourceFile = project.createSourceFile("MyFile.ts", "const num = 1; console.log(MyClass.foo);");

// project.emit(); // async
// or
// project.emitSync(); // slow

function visitSourceFile(
  sourceFile: ts.SourceFile,
  context: ts.TransformationContext,
  visitNode: (node: ts.Node) => ts.Node
) {
  return visitNodeAndChildren(sourceFile) as ts.SourceFile;

  function visitNodeAndChildren(node: ts.Node): ts.Node {
    return ts.visitEachChild(visitNode(node), visitNodeAndChildren, context);
  }
}

function numericLiteralToStringLiteral(node: ts.Node) {
  if (ts.isNumericLiteral(node))
    return ts.factory.createStringLiteral(node.text);
  return node;
}

sourceFile.addImportDeclaration({
  defaultImport: "MyClass",
  moduleSpecifier: "./file",
});
const result = project.emitToMemory({
  customTransformers: {
    // optional transformers to evaluate before built in .js transformations
    before: [
      (context) => (sourceFile) => {
        return visitSourceFile(
          sourceFile,
          context,
          numericLiteralToStringLiteral
        );
      },
    ],
    // optional transformers to evaluate after built in .js transformations
    after: [],
    // optional transformers to evaluate after built in .d.ts transformations
    afterDeclarations: [],
  },
});

for (const diagnostic of result.getDiagnostics())
    console.log(diagnostic.getMessageText());


// output the emitted files to the console
for (const file of result.getFiles()) {
  console.log("----");
  console.log(file.filePath);
  console.log("----");
  console.log(file.text);
  console.log("\n");
}
