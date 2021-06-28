import * as ts from "typescript";

const { factory } = ts;

export default function (program: ts.Program, pluginOptions: {}) {
  return (ctx: ts.TransformationContext) => {
    return (sourceFile: ts.SourceFile) => {
      sourceFile = factory.updateSourceFile(sourceFile, [
        factory.createNotEmittedStatement(
          factory.createImportDeclaration(
            undefined,
            undefined,
            factory.createImportClause(
              false,
              undefined,
              factory.createNamespaceImport(factory.createIdentifier("adaptor"))
            ),
            factory.createStringLiteral("../dummy-adaptor/http")
          )
        ),
        // Ensures the rest of the source files statements are still defined.
        ...sourceFile.statements,
      ]);


      function visitor(node: ts.Node): ts.Node {
        // if (ts.isCallExpression(node)) {
        //     return ts.createLiteral('call');
        // }
        return ts.visitEachChild(node, visitor, ctx);
      }
      return ts.visitEachChild(sourceFile, visitor, ctx);
    };
  };
}
