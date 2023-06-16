"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.transformES2016 = void 0;
var ts_1 = require("../_namespaces/ts");
/** @internal */
function transformES2016(context) {
    var factory = context.factory, hoistVariableDeclaration = context.hoistVariableDeclaration;
    return (0, ts_1.chainBundle)(context, transformSourceFile);
    function transformSourceFile(node) {
        if (node.isDeclarationFile) {
            return node;
        }
        return (0, ts_1.visitEachChild)(node, visitor, context);
    }
    function visitor(node) {
        if ((node.transformFlags & 512 /* TransformFlags.ContainsES2016 */) === 0) {
            return node;
        }
        switch (node.kind) {
            case 225 /* SyntaxKind.BinaryExpression */:
                return visitBinaryExpression(node);
            default:
                return (0, ts_1.visitEachChild)(node, visitor, context);
        }
    }
    function visitBinaryExpression(node) {
        switch (node.operatorToken.kind) {
            case 68 /* SyntaxKind.AsteriskAsteriskEqualsToken */:
                return visitExponentiationAssignmentExpression(node);
            case 43 /* SyntaxKind.AsteriskAsteriskToken */:
                return visitExponentiationExpression(node);
            default:
                return (0, ts_1.visitEachChild)(node, visitor, context);
        }
    }
    function visitExponentiationAssignmentExpression(node) {
        var target;
        var value;
        var left = (0, ts_1.visitNode)(node.left, visitor, ts_1.isExpression);
        var right = (0, ts_1.visitNode)(node.right, visitor, ts_1.isExpression);
        if ((0, ts_1.isElementAccessExpression)(left)) {
            // Transforms `a[x] **= b` into `(_a = a)[_x = x] = Math.pow(_a[_x], b)`
            var expressionTemp = factory.createTempVariable(hoistVariableDeclaration);
            var argumentExpressionTemp = factory.createTempVariable(hoistVariableDeclaration);
            target = (0, ts_1.setTextRange)(factory.createElementAccessExpression((0, ts_1.setTextRange)(factory.createAssignment(expressionTemp, left.expression), left.expression), (0, ts_1.setTextRange)(factory.createAssignment(argumentExpressionTemp, left.argumentExpression), left.argumentExpression)), left);
            value = (0, ts_1.setTextRange)(factory.createElementAccessExpression(expressionTemp, argumentExpressionTemp), left);
        }
        else if ((0, ts_1.isPropertyAccessExpression)(left)) {
            // Transforms `a.x **= b` into `(_a = a).x = Math.pow(_a.x, b)`
            var expressionTemp = factory.createTempVariable(hoistVariableDeclaration);
            target = (0, ts_1.setTextRange)(factory.createPropertyAccessExpression((0, ts_1.setTextRange)(factory.createAssignment(expressionTemp, left.expression), left.expression), left.name), left);
            value = (0, ts_1.setTextRange)(factory.createPropertyAccessExpression(expressionTemp, left.name), left);
        }
        else {
            // Transforms `a **= b` into `a = Math.pow(a, b)`
            target = left;
            value = left;
        }
        return (0, ts_1.setTextRange)(factory.createAssignment(target, (0, ts_1.setTextRange)(factory.createGlobalMethodCall("Math", "pow", [value, right]), node)), node);
    }
    function visitExponentiationExpression(node) {
        // Transforms `a ** b` into `Math.pow(a, b)`
        var left = (0, ts_1.visitNode)(node.left, visitor, ts_1.isExpression);
        var right = (0, ts_1.visitNode)(node.right, visitor, ts_1.isExpression);
        return (0, ts_1.setTextRange)(factory.createGlobalMethodCall("Math", "pow", [left, right]), node);
    }
}
exports.transformES2016 = transformES2016;
