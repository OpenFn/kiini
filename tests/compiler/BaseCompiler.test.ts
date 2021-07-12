import { join } from "path/posix";
import { BaseCompiler } from "../../src/compiler/BaseCompiler";
import { format } from "../Utils";
import { dtsResolve, packageResolve } from "../../src/resolver";
import { readFileSync } from "fs";
import ts from "typescript";

describe("compiler", () => {
  it("can compile something with no dependencies", () => {
    const compiler = new BaseCompiler();

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

  it("complains when something with dependencies isn't correct", async () => {
    const compiler = new BaseCompiler();
    const expression = format(`
    import * as adaptor from 'language-http';
    adaptor.get()
    `);
    compiler.addExpression(expression);

    const moduleName = "language-http";
    const dtsPath = await dtsResolve(
      join(__dirname, "../fixtures"),
      moduleName
    );

    const dts = readFileSync(dtsPath, "utf8");
    compiler.addTypeDefinition(moduleName, dts);

    const diagnostics = compiler.formatDiagnostics();

    expect(diagnostics).toEqual([
      "index.ts (2,9): Expected 2-3 arguments, but got 0.",
    ]);
  });

  it("can have type definitions added", async () => {
    const compiler = new BaseCompiler();
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

  function testTransformer(): ts.TransformerFactory<ts.SourceFile> {
    return (ctx: ts.TransformationContext) => {
      const visitor = (node: ts.Node): ts.Node => {
        if (ts.isCallExpression(node) && ts) {
          return ctx.factory.updateCallExpression(
            node,
            ctx.factory.createIdentifier("foo"),
            undefined,
            node.arguments
          );
        }
        return ts.visitEachChild(node, visitor, ctx);
      };

      return (sourceFile: ts.SourceFile) => {
        return ts.visitNode(sourceFile, visitor);
      };
    };
  }

  it("can add a transform", async () => {
    const compiler = new BaseCompiler();
    const expression = "adaptor.get()";
    compiler.addExpression(expression);
    compiler.useTransform(testTransformer);

    const moduleName = "language-http";
    const dtsPath = await dtsResolve(
      join(__dirname, "../fixtures"),
      moduleName
    );
    const dts = readFileSync(dtsPath, "utf8");
    compiler.addTypeDefinition(moduleName, dts);

    const result = compiler.compile();

    expect(result).toEqual(
      expect.stringContaining(
        format(`
        "use strict";
        foo()
        `)
      )
    );
  });

  it("can give access to type defs", async () => {
    const compiler = new BaseCompiler();
    const expression = "adaptor.get()";
    compiler.addExpression(expression);
    compiler.useTransform(testTransformer);

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
