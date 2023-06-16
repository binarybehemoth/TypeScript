"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.transformES2019 = void 0;
var ts_1 = require("../_namespaces/ts");
/** @internal */
function transformES2019(context) {
    var factory = context.factory;
    return (0, ts_1.chainBundle)(context, transformSourceFile);
    function transformSourceFile(node) {
        if (node.isDeclarationFile) {
            return node;
        }
        return (0, ts_1.visitEachChild)(node, visitor, context);
    }
    function visitor(node) {
        if ((node.transformFlags & 64 /* TransformFlags.ContainsES2019 */) === 0) {
            return node;
        }
        switch (node.kind) {
            case 298 /* SyntaxKind.CatchClause */:
                return visitCatchClause(node);
            default:
                return (0, ts_1.visitEachChild)(node, visitor, context);
        }
    }
    function visitCatchClause(node) {
        if (!node.variableDeclaration) {
            return factory.updateCatchClause(node, factory.createVariableDeclaration(factory.createTempVariable(/*recordTempVariable*/ undefined)), (0, ts_1.visitNode)(node.block, visitor, ts_1.isBlock));
        }
        return (0, ts_1.visitEachChild)(node, visitor, context);
    }
}
exports.transformES2019 = transformES2019;
