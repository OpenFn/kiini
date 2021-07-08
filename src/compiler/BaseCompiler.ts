import {
  createDefaultMapFromNodeModules,
  createSystem,
  createVirtualTypeScriptEnvironment,
  VirtualTypeScriptEnvironment,
} from "@typescript/vfs";
import { readFileSync } from "fs";
import { join } from "path";
import * as ts from "typescript";
import transformer from "../transformer";

// Adds a packages type definitions as if they came from the @types modules.
// We read the packages details, and look speficially for a `types` or `typings`
// key - and if found we put that `.d.ts` file in
// `/node_modules/@types/<typedModuleName>/index.d.ts` which the TS compiler
// will try and lookup when an import to that module is found.
export function addAdaptorFSMap(
  fsMap: Map<string, string>,
  adaptorPackagePath: string
): Map<string, string> {
  const pkgJsonPath = join(`${adaptorPackagePath}/package.json`);
  const pkg = require(pkgJsonPath);

  const adaptorModuleName = pkg.name;
  const typedModulePath = adaptorModuleName.replace("@", "").replace("/", "__");

  const types = pkg.types || pkg.typings;

  if (types) {
    const dtsPath = join(pkgJsonPath, "..", types);
    const dts = readFileSync(dtsPath, { encoding: "utf-8" });
    fsMap.set(`/node_modules/@types/${typedModulePath}/index.d.ts`, dts);
  }

  return fsMap;
}

export class BaseCompiler {
  fsMap: Map<string, string>;
  env: VirtualTypeScriptEnvironment;
  system: ts.System;
  transformers: Array<
    (program: ts.Program, {}) => ts.TransformerFactory<ts.SourceFile>
  >;
  transformOptions: {};

  constructor() {
    this.transformers = [];
    // You start with creating a map which represents all the files in the virtual ts.System
    this.fsMap = createDefaultMapFromNodeModules(BaseCompiler.compilerOpts, ts);

    // If you need a FS backed system, useful for debugging missing definitions.
    // const projectRoot = join(__dirname, "..");
    // this.system = createFSBackedSystem(fsMap, projectRoot, ts)
    this.system = createSystem(this.fsMap);
    this.env = createVirtualTypeScriptEnvironment(
      this.system,
      [],
      ts,
      BaseCompiler.compilerOpts
    );
  }

  /**
   * Add the adaptors type definition to the compilers filesystem map
   * @param moduleName the name of the module that will be imported,
   * i.e. the adaptors name `@openfn/language-http`.
   * @param dts the .d.ts file as a string
   */
  addTypeDefinition(moduleName: string, dts: string) {
    const typedModulePath = moduleName.replace("@", "").replace("/", "__");

    this.fsMap.set(`/node_modules/@types/${typedModulePath}/index.d.ts`, dts);
  }

  addAdaptorFSMap(adaptorPackagePath: string) {
    addAdaptorFSMap(this.fsMap, adaptorPackagePath);
  }

  wrap(
    func: (sf: ts.SourceFile, ...args: any[]) => ts.SourceFile,
    ...args: any[]
  ) {
    return func(this.sourceFile, ...args);
  }

  public get program(): ts.Program {
    return this.env.languageService.getProgram();
  }

  public get sourceFile(): ts.SourceFile {
    return this.program.getSourceFile("index.ts");
  }

  addExpression(expression: string, filename: string = "index.ts") {
    this.env.createFile(filename, expression);
  }

  useTransform(func: () => ts.TransformerFactory<ts.SourceFile>) {
    this.transformers.push(func);
  }

  getDiagnostics(): readonly ts.Diagnostic[] {
    return ts.getPreEmitDiagnostics(this.program, this.sourceFile);
    return this.env.languageService.getSemanticDiagnostics("index.ts");
  }

  formatDiagnostics(): string[] {
    return this.getDiagnostics().map((diagnostic) => {
      if (diagnostic.file) {
        let { line, character } = ts.getLineAndCharacterOfPosition(
          diagnostic.file,
          diagnostic.start!
        );
        let message = ts.flattenDiagnosticMessageText(
          diagnostic.messageText,
          "\n"
        );
        return `${diagnostic.file.fileName} (${line + 1},${
          character + 1
        }): ${message}`;
      } else {
        return ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n");
      }
    });
  }

  compile(): string {
    const sourceFile = this.program.getSourceFile("index.ts");
    const emitResult = this.program.emit(
      sourceFile,
      this.system.writeFile,
      undefined,
      false,
      {
        before: this.transformers.map((t) => t(this.program, {})), // [transformer(this.program, {})],
        after: [],
        afterDeclarations: [],
      }
    );
    // console.log(sourceFile.getText());
    // console.log(emitResult);
    // console.log(program.getSourceFile("index.ts"));
    return this.system.readFile("index.js");
  }

  static compilerOpts: ts.CompilerOptions = {
    experimentalDecorators: true,
    // jsx: ts.JsxEmit.React,
    module: ts.ModuleKind.ES2020,
    moduleResolution: ts.ModuleResolutionKind.NodeJs,
    noEmitOnError: false,
    noUnusedLocals: true,
    noUnusedParameters: true,
    // stripInternal: true,
    // declaration: true,
    baseUrl: __dirname,
    lib: ["ES2020", "dom"],
    target: ts.ScriptTarget.ES2020,
  };

  transform(): ts.TransformationResult<ts.Node> {
    const sourceFile = this.program.getSourceFile("index.ts");
    const transformedSourceFile = ts.transform(
      sourceFile,
      [transformer(this.program, this.transformOptions)],
      BaseCompiler.compilerOpts
    );

    return transformedSourceFile;
    // const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed });
    // return printer.printFile(transformedSourceFile[0]);
  }
}

export function wrapWithRuntime(
  expressionSource: ts.SourceFile,
  adaptorModule: string
): ts.SourceFile {
  const { factory } = ts;

  return factory.updateSourceFile(expressionSource, [
    factory.createImportDeclaration(
      undefined,
      undefined,
      factory.createImportClause(
        false,
        undefined,
        factory.createNamespaceImport(factory.createIdentifier("adaptor"))
      ),
      factory.createStringLiteral(adaptorModule)
    ),
    factory.createFunctionDeclaration(
      undefined,
      [
        factory.createModifier(ts.SyntaxKind.ExportKeyword),
        factory.createModifier(ts.SyntaxKind.DefaultKeyword),
        factory.createModifier(ts.SyntaxKind.AsyncKeyword),
      ],
      undefined,
      factory.createIdentifier("main"),
      undefined,
      [],
      undefined,
      factory.createBlock(expressionSource.statements, true)
    ),
  ]);
}