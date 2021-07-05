import {
  createDefaultMapFromNodeModules,
  createSystem,
  createVirtualTypeScriptEnvironment,
  VirtualTypeScriptEnvironment,
} from "@typescript/vfs";
import { readFileSync } from "fs";
import { join } from "path";
import * as ts from "typescript";
import transformer from "../src/transformer";
import { format } from "./Utils";

// Adds a packages type definitions as if they came from the @types modules.
// We read the packages details, and look speficially for a `types` or `typings`
// key - and if found we put that `.d.ts` file in
// `/node_modules/@types/<typedModuleName>/index.d.ts` which the TS compiler
// will try and lookup when an import to that module is found.
export function addAdaptorFSMap(
  fsMap: Map<string, string>,
  adaptorPackagePath: string
): Map<string, string> {
  const pkgJsonPath = require.resolve(`${adaptorPackagePath}/package.json`);
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

type TransformerOptions = {
  wrapWithRuntime?: string;
};
export class TestCompiler {
  fsMap: Map<string, string>;
  env: VirtualTypeScriptEnvironment;
  program: ts.Program;
  system: ts.System;
  transformOptions: {};

  constructor(
    adaptorPackagePath: string,
    expression: string,
    transformOptions: TransformerOptions = {}
  ) {
    this.transformOptions = transformOptions;
    // You start with creating a map which represents all the files in the virtual ts.System
    this.fsMap = createDefaultMapFromNodeModules({
      target: ts.ScriptTarget.ES2020,
    });

    this.fsMap.set("index.ts", expression);
    this.addAdaptorFSMap(adaptorPackagePath);

    // If you need a FS backed system, useful for debugging missing definitions.
    // const projectRoot = join(__dirname, "..");
    // this.system = createFSBackedSystem(fsMap, projectRoot, ts)
    this.system = createSystem(this.fsMap);
    this.env = createVirtualTypeScriptEnvironment(
      this.system,
      ["index.ts"],
      ts,
      TestCompiler.compilerOpts
    );

    this.program = this.env.languageService.getProgram();
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

  public get sourceFile(): ts.SourceFile {
    return this.program.getSourceFile("index.ts");
  }

  compile(): string {
    const sourceFile = this.program.getSourceFile("index.ts");
    const emitResult = this.program.emit(
      sourceFile,
      this.system.writeFile,
      undefined,
      false,
      {
        before: [transformer(this.program, {})],
        after: [],
        afterDeclarations: [],
      }
    );
    console.log(sourceFile.getText());
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
    lib: ["ES2020"],
    target: ts.ScriptTarget.ES2020,
  };

  transform(): string {
    const sourceFile = this.program.getSourceFile("index.ts");
    const transformedSourceFile = ts.transform(
      sourceFile,
      [transformer(this.program, this.transformOptions)],
      TestCompiler.compilerOpts
    ).transformed;

    const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed });
    return format(printer.printFile(transformedSourceFile[0]));
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
