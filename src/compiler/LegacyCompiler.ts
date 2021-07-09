import * as ts from "typescript";
import { BaseCompiler } from "./BaseCompiler";

function testTransformer(): ts.TransformerFactory<ts.SourceFile> {
  return (ctx: ts.TransformationContext) => {
    const visitor = (node: ts.Node): ts.Node => {
      return ts.visitEachChild(node, visitor, ctx);
    };
    return (sourceFile: ts.SourceFile) => {
      return ts.visitNode(sourceFile, visitor);
    };
  };
}

/**
 * Turns an array of call expression statements into resolved operations.
 * This replaces the original `execute` function from `language-common`.
 * @param ctx transformation context provided by transformer
 * @param ops node array of statements.
 * In the case of legacy expressions, these will always be ExpressionStatements
 * with a CallExpression in them.
 */
function asyncOperations(
  ctx: ts.TransformationContext,
  ops: ts.NodeArray<ts.Statement>
) {
  const { factory } = ctx;

  return [
    ...ops.map((node) => {
      if (
        ts.isExpressionStatement(node) &&
        ts.isCallExpression(node.expression)
      ) {
        const caller = node.expression;

        return factory.updateExpressionStatement(
          node,
          factory.createBinaryExpression(
            factory.createIdentifier("state"),
            factory.createToken(ts.SyntaxKind.EqualsToken),

            factory.createAwaitExpression(
              factory.createCallExpression(
                factory.updateCallExpression(
                  caller,
                  caller.expression,
                  undefined,
                  caller.arguments
                ),
                undefined,
                [factory.createIdentifier("state")]
              )
            )
          )
        );
      }
      return node;
    }),
    factory.createReturnStatement(factory.createIdentifier("state")),
  ];
}

function expressionEntrypoint(
  ctx: ts.TransformationContext,
  statements: Array<ts.Statement>
): ts.FunctionDeclaration {
  const { factory } = ctx;

  return factory.createFunctionDeclaration(
    undefined,
    [
      factory.createModifier(ts.SyntaxKind.ExportKeyword),
      factory.createModifier(ts.SyntaxKind.DefaultKeyword),
      factory.createModifier(ts.SyntaxKind.AsyncKeyword),
    ],
    undefined,
    factory.createIdentifier("main"),
    undefined,
    [
      factory.createParameterDeclaration(
        undefined,
        undefined,
        undefined,
        factory.createIdentifier("state"),
        undefined,
        undefined,
        undefined
      ),
    ],
    undefined,
    factory.createBlock(statements, true)
  );
}

function adaptorImport(
  ctx: ts.TransformationContext,
  adaptorModule: string
): ts.ImportDeclaration {
  const { factory } = ctx;
  return factory.createImportDeclaration(
    undefined,
    undefined,
    factory.createImportClause(
      false,
      undefined,
      factory.createNamespaceImport(factory.createIdentifier("adaptor"))
    ),
    factory.createStringLiteral(adaptorModule)
  );
}

function legacyTransform(
  _program,
  options: TransformOptions
): ts.TransformerFactory<ts.SourceFile> {
  return (ctx: ts.TransformationContext) => {
    const { factory } = ctx;

    return (sourceFile: ts.SourceFile) => {
      return factory.updateSourceFile(sourceFile, [
        adaptorImport(ctx, options.adaptorModule),
        expressionEntrypoint(ctx, asyncOperations(ctx, sourceFile.statements)),
      ]);
    };
  };
}

interface TransformOptions {
  adaptorModule: string;
}

export class LegacyCompiler extends BaseCompiler {
  constructor(transformOptions: TransformOptions) {
    super();
    this.transformOptions = transformOptions;
    this.transformers = [legacyTransform];
  }
}
