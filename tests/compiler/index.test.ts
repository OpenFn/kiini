import { join } from "path/posix";
import { Compiler } from "../../src/compiler";
import { format } from "../Utils";
import { dtsResolve, packageResolve } from "../../src/resolver";
import { readFileSync } from "fs";

describe("compiler", () => {
  it("can compile something with no dependencies", () => {
    const compiler = new Compiler();

    // compiler.addTypeDefinition(moduleName, dts)
    // compiler.addTransform(transformer)

    const expression = "console.log(foo)";
    compiler.addExpression(expression);

    const result = compiler.compile();

    expect(result).toEqual(
      expect.stringContaining(
        format(`
          "use strict";
          console.log(foo);
        `)
      )
    );

    const diagnostics = compiler.formatDiagnostics();

    expect(diagnostics).toEqual(["index.ts (1,13): Cannot find name 'foo'."]);
  });

  it("can have type definitions added", async () => {
    const compiler = new Compiler();
    const expression = "console.log(foo)";
    compiler.addExpression(expression);

    const moduleName = "language-http";
    const dtsPath = await dtsResolve(
      join(__dirname, "../fixtures"),
      moduleName
    );
    const dts = readFileSync(dtsPath, "utf8");
    compiler.addTypeDefinition(moduleName, dts);

    expect(
      compiler.fsMap.has("/node_modules/@types/language-http/index.d.ts")
    ).toBe(true);
  });
});
