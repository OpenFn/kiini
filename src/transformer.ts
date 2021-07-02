import * as ts from "typescript";
const { factory } = ts;

export interface TransformerOptions {}

function getReturnTypeName(
  typeChecker: ts.TypeChecker,
  node: ts.CallExpression
) {
  const symbol = typeChecker
    .getResolvedSignature(node)
    .getReturnType()
    .getSymbol();

  if (symbol) {
    return symbol.getEscapedName();
  }

  return symbol;
}

const testVisitor = (
  ctx: ts.TransformationContext,
  typeChecker: ts.TypeChecker,
  _sf: ts.SourceFile
) => {
  const visitor: ts.Visitor = (node: ts.Node): ts.Node => {
    // We could use ts-query to help narrow this down: CallExpression>PropertyAccessExpression>[name="get"]
    if (ts.isCallExpression(node)) {
      if (getReturnTypeName(typeChecker, node) == "Operation") {
        // TODO: there are more ways to invalidate an Operation resolver transform
        // not just a variable declaration.
        if (!ts.isVariableDeclaration(node.parent)) {
          return factory.createAwaitExpression(
            factory.createCallExpression(
              factory.updateCallExpression(
                node,
                node.expression,
                undefined,
                node.arguments
              ),
              undefined,
              [factory.createIdentifier("state")]
            )
          );
        }
      }
      return node;
    }

    return ts.visitEachChild(node, visitor, ctx);
  };

  return visitor;
};

// This is a 'program' style transfomer, this is import since we use the
// typeChecker to validate Operation return types that an expression main use.
export default function (program: ts.Program, _pluginOptions: {}) {
  return (ctx: ts.TransformationContext) => {
    return (sourceFile: ts.SourceFile) => {
      const visitor = testVisitor(ctx, program.getTypeChecker(), sourceFile);
      return ts.visitEachChild(sourceFile, visitor, ctx);
    };
  };
}
