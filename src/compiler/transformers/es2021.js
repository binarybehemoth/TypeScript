"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.transformES2021 = void 0;
var ts_1 = require("../_namespaces/ts");
/** @internal */
function transformES2021(context) {
    var hoistVariableDeclaration = context.hoistVariableDeclaration, factory = context.factory;
    return (0, ts_1.chainBundle)(context, transformSourceFile);
    function transformSourceFile(node) {
        if (node.isDeclarationFile) {
            return node;
        }
        return (0, ts_1.visitEachChild)(node, visitor, context);
    }
    function visitor(node) {
        if ((node.transformFlags & 16 /* TransformFlags.ContainsES2021 */) === 0) {
            return node;
        }
        if ((0, ts_1.isLogicalOrCoalescingAssignmentExpression)(node)) {
            return transformLogicalAssignment(node);
        }
        return (0, ts_1.visitEachChild)(node, visitor, context);
    }
    function transformLogicalAssignment(binaryExpression) {
        var operator = binaryExpression.operatorToken;
        var nonAssignmentOperator = (0, ts_1.getNonAssignmentOperatorForCompoundAssignment)(operator.kind);
        var left = (0, ts_1.skipParentheses)((0, ts_1.visitNode)(binaryExpression.left, visitor, ts_1.isLeftHandSideExpression));
        var assignmentTarget = left;
        var right = (0, ts_1.skipParentheses)((0, ts_1.visitNode)(binaryExpression.right, visitor, ts_1.isExpression));
        if ((0, ts_1.isAccessExpression)(left)) {
            var propertyAccessTargetSimpleCopiable = (0, ts_1.isSimpleCopiableExpression)(left.expression);
            var propertyAccessTarget = propertyAccessTargetSimpleCopiable ? left.expression :
                factory.createTempVariable(hoistVariableDeclaration);
            var propertyAccessTargetAssignment = propertyAccessTargetSimpleCopiable ? left.expression : factory.createAssignment(propertyAccessTarget, left.expression);
            if ((0, ts_1.isPropertyAccessExpression)(left)) {
                assignmentTarget = factory.createPropertyAccessExpression(propertyAccessTarget, left.name);
                left = factory.createPropertyAccessExpression(propertyAccessTargetAssignment, left.name);
            }
            else {
                var elementAccessArgumentSimpleCopiable = (0, ts_1.isSimpleCopiableExpression)(left.argumentExpression);
                var elementAccessArgument = elementAccessArgumentSimpleCopiable ? left.argumentExpression :
                    factory.createTempVariable(hoistVariableDeclaration);
                assignmentTarget = factory.createElementAccessExpression(propertyAccessTarget, elementAccessArgument);
                left = factory.createElementAccessExpression(propertyAccessTargetAssignment, elementAccessArgumentSimpleCopiable ? left.argumentExpression : factory.createAssignment(elementAccessArgument, left.argumentExpression));
            }
        }
        return factory.createBinaryExpression(left, nonAssignmentOperator, factory.createParenthesizedExpression(factory.createAssignment(assignmentTarget, right)));
    }
}
exports.transformES2021 = transformES2021;
