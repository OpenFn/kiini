import * as ts from "typescript";
import * as tsvfs from "@typescript/vfs";
import * as fetch from 'fetch';
import path = require("path");

async function main() {
  const compilerOptions: ts.CompilerOptions = {
    target: ts.ScriptTarget.ES2020,
    esModuleInterop: true,
  };
  const fsMap = new Map<string, string>();
  fsMap.set("index.ts", "import  as adaptor from '../dummy-adaptor/http';");

	const projectRoot = path.join(__dirname, "..")
	const system = tsvfs.createFSBackedSystem(fsMap, projectRoot, ts)
	const env = tsvfs.createVirtualTypeScriptEnvironment(system, ["index.ts"], ts, compilerOptions)

  const host = tsvfs.createVirtualCompilerHost(system, compilerOptions, ts);

  const program = ts.createProgram({
    rootNames: [...fsMap.keys()],
    options: compilerOptions,
    host: host.compilerHost,
  });

  // This will update the fsMap with new files
  // for the .d.ts and .js files
  program.emit();

	console.log(env.languageService.getEmitOutput("index.ts"));
  // Now I can look at the AST for the .ts file too
  const index = program.getSourceFile("index.ts");

	

	// console.log(index);
}

main()
