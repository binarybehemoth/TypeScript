"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.transformES5 = void 0;
var ts_1 = require("../_namespaces/ts");
/**
 * Transforms ES5 syntax into ES3 syntax.
 *
 * @param context Context and state information for the transformation.
 *
 * @internal
 */
function transformES5(context) {
    var factory = context.factory;
    var compilerOptions = context.getCompilerOptions();
    // enable emit notification only if using --jsx preserve or react-native
    var previousOnEmitNode;
    var noSubstitution;
    if (compilerOptions.jsx === 1 /* JsxEmit.Preserve */ || compilerOptions.jsx === 3 /* JsxEmit.ReactNative */) {
        previousOnEmitNode = context.onEmitNode;
        context.onEmitNode = onEmitNode;
        context.enableEmitNotification(285 /* SyntaxKind.JsxOpeningElement */);
        context.enableEmitNotification(286 /* SyntaxKind.JsxClosingElement */);
        context.enableEmitNotification(284 /* SyntaxKind.JsxSelfClosingElement */);
        noSubstitution = [];
    }
    var previousOnSubstituteNode = context.onSubstituteNode;
    context.onSubstituteNode = onSubstituteNode;
    context.enableSubstitution(210 /* SyntaxKind.PropertyAccessExpression */);
    context.enableSubstitution(302 /* SyntaxKind.PropertyAssignment */);
    return (0, ts_1.chainBundle)(context, transformSourceFile);
    /**
     * Transforms an ES5 source file to ES3.
     *
     * @param node A SourceFile
     */
    function transformSourceFile(node) {
        return node;
    }
    /**
     * Called by the printer just before a node is printed.
     *
     * @param hint A hint as to the intended usage of the node.
     * @param node The node to emit.
     * @param emitCallback A callback used to emit the node.
     */
    function onEmitNode(hint, node, emitCallback) {
        switch (node.kind) {
            case 285 /* SyntaxKind.JsxOpeningElement */:
            case 286 /* SyntaxKind.JsxClosingElement */:
            case 284 /* SyntaxKind.JsxSelfClosingElement */:
                var tagName = node.tagName;
                noSubstitution[(0, ts_1.getOriginalNodeId)(tagName)] = true;
                break;
        }
        previousOnEmitNode(hint, node, emitCallback);
    }
    /**
     * Hooks node substitutions.
     *
     * @param hint A hint as to the intended usage of the node.
     * @param node The node to substitute.
     */
    function onSubstituteNode(hint, node) {
        if (node.id && noSubstitution && noSubstitution[node.id]) {
            return previousOnSubstituteNode(hint, node);
        }
        node = previousOnSubstituteNode(hint, node);
        if ((0, ts_1.isPropertyAccessExpression)(node)) {
            return substitutePropertyAccessExpression(node);
        }
        else if ((0, ts_1.isPropertyAssignment)(node)) {
            return substitutePropertyAssignment(node);
        }
        return node;
    }
    /**
     * Substitutes a PropertyAccessExpression whose name is a reserved word.
     *
     * @param node A PropertyAccessExpression
     */
    function substitutePropertyAccessExpression(node) {
        if ((0, ts_1.isPrivateIdentifier)(node.name)) {
            return node;
        }
        var literalName = trySubstituteReservedName(node.name);
        if (literalName) {
            return (0, ts_1.setTextRange)(factory.createElementAccessExpression(node.expression, literalName), node);
        }
        return node;
    }
    /**
     * Substitutes a PropertyAssignment whose name is a reserved word.
     *
     * @param node A PropertyAssignment
     */
    function substitutePropertyAssignment(node) {
        var literalName = (0, ts_1.isIdentifier)(node.name) && trySubstituteReservedName(node.name);
        if (literalName) {
            return factory.updatePropertyAssignment(node, literalName, node.initializer);
        }
        return node;
    }
    /**
     * If an identifier name is a reserved word, returns a string literal for the name.
     *
     * @param name An Identifier
     */
    function trySubstituteReservedName(name) {
        var token = (0, ts_1.identifierToKeywordKind)(name);
        if (token !== undefined && token >= 83 /* SyntaxKind.FirstReservedWord */ && token <= 118 /* SyntaxKind.LastReservedWord */) {
            return (0, ts_1.setTextRange)(factory.createStringLiteralFromNode(name), name);
        }
        return undefined;
    }
}
exports.transformES5 = transformES5;
