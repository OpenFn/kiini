import * as ts from 'typescript';
import transformer from './transformer'

const CJS_CONFIG: ts.CompilerOptions = {
  experimentalDecorators: true,
  jsx: ts.JsxEmit.React,
  module: ts.ModuleKind.ESNext,
  moduleResolution: ts.ModuleResolutionKind.NodeJs,
  noEmitOnError: false,
  noUnusedLocals: true,
  noUnusedParameters: true,
  stripInternal: true,
  declaration: true,
  baseUrl: __dirname,
  target: ts.ScriptTarget.ES2016
};

function compiler (configFilePath: string, fileNames: Array<string>) {
  // tslint:disable-next-line no-any
  const host: ts.ParseConfigFileHost = ts.sys as any;
  // Fix after https://github.com/Microsoft/TypeScript/issues/18217
  // host.onUnRecoverableConfigFileDiagnostic = printDiagnostic;
  const parsedCmd = ts.getParsedCommandLineOfConfigFile(configFilePath, CJS_CONFIG, host);
  // host.onUnRecoverableConfigFileDiagnostic = undefined;

  const {options} = parsedCmd;

  const program = ts.createProgram({
    rootNames: fileNames,
    options,
  });

  const emitResult = program.emit(
    undefined,
    undefined,
    undefined,
    undefined,
    {
      before: [transformer(program, {})],
      after: [],
      afterDeclarations: [],
    }
  );

	// To print the AST, we'll use TypeScript's printer
  // const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed });
	// console.log(printer.printNode(ts.EmitHint.Unspecified, node, sourceFile)) + "\n";

  ts.getPreEmitDiagnostics(program)
    .concat(emitResult.diagnostics)
    .forEach(diagnostic => {
      let msg = ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n');
      if (diagnostic.file) {
        const {line, character} = diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start);
        msg = `${diagnostic.file.fileName} (${line + 1},${character + 1}): ${msg}`;
      }
      console.error(msg);
    });


  const exitCode = emitResult.emitSkipped ? 1 : 0;
  if (exitCode) {
    console.log(`Process exiting with code '${exitCode}'.`);
    process.exit(exitCode);
  }
}

compiler('./tsconfig.json', ["./examples/basic-http.ts"])

// compiler('./tsconfig.json', process.argv.slice(2))