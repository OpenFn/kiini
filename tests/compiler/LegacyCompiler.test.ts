import { join } from "path/posix";
import { LegacyCompiler } from "../../src/compiler/LegacyCompiler";
import { format } from "../Utils";
import { dtsResolve, packageResolve } from "../../src/resolver";
import { readFileSync } from "fs";

describe("compiler", () => {
  it("can give access to type defs", async () => {
    const compiler = new LegacyCompiler({ adaptorModule: "language-http" });
    const expression = "get()";
    compiler.addExpression(expression);

    const moduleName = "language-http";
    const dtsPath = await dtsResolve(
      join(__dirname, "../fixtures"),
      moduleName
    );
    const dts = readFileSync(dtsPath, "utf8");
    compiler.addTypeDefinition(moduleName, dts);

    const result = compiler.compile();
  });
});
