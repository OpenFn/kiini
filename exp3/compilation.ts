import * as path from "path";
import * as ts from "typescript";
import * as fs from "fs";

const filePath = path.resolve(process.argv.slice(2)[0]);

const program = ts.createProgram([filePath], {});
const checker = program.getTypeChecker();
const source = program.getSourceFile(filePath);
const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed });

import transformer from "./transformer";

// Run source file through our transformer
const result = ts.transform(source, [transformer(program)]);

// Create our output folder
// const outputDir = path.resolve(__dirname, '../generated');
// if (!fs.existsSync(outputDir)) {
//   fs.mkdirSync(outputDir);
// }
console.log(result.emitNodeWithNotification(ts.EmitHint.SourceFile, result.transformed[0], (hint, node) => {
	console.log([hint, node]);
	
}));


console.log(printer.printFile(result.transformed[0]));
// Write pretty printed transformed typescript to output directory
// fs.writeFileSync(
//   path.resolve(__dirname, '../generated/models.ts'),
// );


console.log(printer.printNode(ts.EmitHint.Unspecified, result, result));

function compile(fileNames: string[], options: ts.CompilerOptions): void {
  let program = ts.createProgram(fileNames, options);
  let emitResult = program.emit();

  let allDiagnostics = ts
    .getPreEmitDiagnostics(program)
    .concat(emitResult.diagnostics);

  allDiagnostics.forEach(diagnostic => {
    if (diagnostic.file) {
      let { line, character } = ts.getLineAndCharacterOfPosition(diagnostic.file, diagnostic.start!);
      let message = ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n");
      console.log(`${diagnostic.file.fileName} (${line + 1},${character + 1}): ${message}`);
    } else {
      console.log(ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n"));
    }
  });

  let exitCode = emitResult.emitSkipped ? 1 : 0;
  console.log(`Process exiting with code '${exitCode}'.`);
  process.exit(exitCode);
}

compile(process.argv.slice(2), {
  noEmitOnError: true,
  noImplicitAny: true,
  target: ts.ScriptTarget.ES5,
  module: ts.ModuleKind.CommonJS
});