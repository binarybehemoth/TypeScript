"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.nullNodeConverters = exports.createNodeConverters = void 0;
var ts_1 = require("../_namespaces/ts");
/** @internal */
function createNodeConverters(factory) {
    return {
        convertToFunctionBlock: convertToFunctionBlock,
        convertToFunctionExpression: convertToFunctionExpression,
        convertToArrayAssignmentElement: convertToArrayAssignmentElement,
        convertToObjectAssignmentElement: convertToObjectAssignmentElement,
        convertToAssignmentPattern: convertToAssignmentPattern,
        convertToObjectAssignmentPattern: convertToObjectAssignmentPattern,
        convertToArrayAssignmentPattern: convertToArrayAssignmentPattern,
        convertToAssignmentElementTarget: convertToAssignmentElementTarget,
    };
    function convertToFunctionBlock(node, multiLine) {
        if ((0, ts_1.isBlock)(node))
            return node;
        var returnStatement = factory.createReturnStatement(node);
        (0, ts_1.setTextRange)(returnStatement, node);
        var body = factory.createBlock([returnStatement], multiLine);
        (0, ts_1.setTextRange)(body, node);
        return body;
    }
    function convertToFunctionExpression(node) {
        if (!node.body)
            return ts_1.Debug.fail("Cannot convert a FunctionDeclaration without a body");
        var updated = factory.createFunctionExpression((0, ts_1.getModifiers)(node), node.asteriskToken, node.name, node.typeParameters, node.parameters, node.type, node.body);
        (0, ts_1.setOriginalNode)(updated, node);
        (0, ts_1.setTextRange)(updated, node);
        if ((0, ts_1.getStartsOnNewLine)(node)) {
            (0, ts_1.setStartsOnNewLine)(updated, /*newLine*/ true);
        }
        return updated;
    }
    function convertToArrayAssignmentElement(element) {
        if ((0, ts_1.isBindingElement)(element)) {
            if (element.dotDotDotToken) {
                ts_1.Debug.assertNode(element.name, ts_1.isIdentifier);
                return (0, ts_1.setOriginalNode)((0, ts_1.setTextRange)(factory.createSpreadElement(element.name), element), element);
            }
            var expression = convertToAssignmentElementTarget(element.name);
            return element.initializer
                ? (0, ts_1.setOriginalNode)((0, ts_1.setTextRange)(factory.createAssignment(expression, element.initializer), element), element)
                : expression;
        }
        return (0, ts_1.cast)(element, ts_1.isExpression);
    }
    function convertToObjectAssignmentElement(element) {
        if ((0, ts_1.isBindingElement)(element)) {
            if (element.dotDotDotToken) {
                ts_1.Debug.assertNode(element.name, ts_1.isIdentifier);
                return (0, ts_1.setOriginalNode)((0, ts_1.setTextRange)(factory.createSpreadAssignment(element.name), element), element);
            }
            if (element.propertyName) {
                var expression = convertToAssignmentElementTarget(element.name);
                return (0, ts_1.setOriginalNode)((0, ts_1.setTextRange)(factory.createPropertyAssignment(element.propertyName, element.initializer ? factory.createAssignment(expression, element.initializer) : expression), element), element);
            }
            ts_1.Debug.assertNode(element.name, ts_1.isIdentifier);
            return (0, ts_1.setOriginalNode)((0, ts_1.setTextRange)(factory.createShorthandPropertyAssignment(element.name, element.initializer), element), element);
        }
        return (0, ts_1.cast)(element, ts_1.isObjectLiteralElementLike);
    }
    function convertToAssignmentPattern(node) {
        switch (node.kind) {
            case 206 /* SyntaxKind.ArrayBindingPattern */:
            case 208 /* SyntaxKind.ArrayLiteralExpression */:
                return convertToArrayAssignmentPattern(node);
            case 205 /* SyntaxKind.ObjectBindingPattern */:
            case 209 /* SyntaxKind.ObjectLiteralExpression */:
                return convertToObjectAssignmentPattern(node);
        }
    }
    function convertToObjectAssignmentPattern(node) {
        if ((0, ts_1.isObjectBindingPattern)(node)) {
            return (0, ts_1.setOriginalNode)((0, ts_1.setTextRange)(factory.createObjectLiteralExpression((0, ts_1.map)(node.elements, convertToObjectAssignmentElement)), node), node);
        }
        return (0, ts_1.cast)(node, ts_1.isObjectLiteralExpression);
    }
    function convertToArrayAssignmentPattern(node) {
        if ((0, ts_1.isArrayBindingPattern)(node)) {
            return (0, ts_1.setOriginalNode)((0, ts_1.setTextRange)(factory.createArrayLiteralExpression((0, ts_1.map)(node.elements, convertToArrayAssignmentElement)), node), node);
        }
        return (0, ts_1.cast)(node, ts_1.isArrayLiteralExpression);
    }
    function convertToAssignmentElementTarget(node) {
        if ((0, ts_1.isBindingPattern)(node)) {
            return convertToAssignmentPattern(node);
        }
        return (0, ts_1.cast)(node, ts_1.isExpression);
    }
}
exports.createNodeConverters = createNodeConverters;
/** @internal */
exports.nullNodeConverters = {
    convertToFunctionBlock: ts_1.notImplemented,
    convertToFunctionExpression: ts_1.notImplemented,
    convertToArrayAssignmentElement: ts_1.notImplemented,
    convertToObjectAssignmentElement: ts_1.notImplemented,
    convertToAssignmentPattern: ts_1.notImplemented,
    convertToObjectAssignmentPattern: ts_1.notImplemented,
    convertToArrayAssignmentPattern: ts_1.notImplemented,
    convertToAssignmentElementTarget: ts_1.notImplemented,
};
