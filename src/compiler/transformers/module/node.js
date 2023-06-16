"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.transformNodeModule = void 0;
var ts_1 = require("../../_namespaces/ts");
/** @internal */
function transformNodeModule(context) {
    var previousOnSubstituteNode = context.onSubstituteNode;
    var previousOnEmitNode = context.onEmitNode;
    var esmTransform = (0, ts_1.transformECMAScriptModule)(context);
    var esmOnSubstituteNode = context.onSubstituteNode;
    var esmOnEmitNode = context.onEmitNode;
    context.onSubstituteNode = previousOnSubstituteNode;
    context.onEmitNode = previousOnEmitNode;
    var cjsTransform = (0, ts_1.transformModule)(context);
    var cjsOnSubstituteNode = context.onSubstituteNode;
    var cjsOnEmitNode = context.onEmitNode;
    context.onSubstituteNode = onSubstituteNode;
    context.onEmitNode = onEmitNode;
    context.enableSubstitution(311 /* SyntaxKind.SourceFile */);
    context.enableEmitNotification(311 /* SyntaxKind.SourceFile */);
    var currentSourceFile;
    return transformSourceFileOrBundle;
    function onSubstituteNode(hint, node) {
        if ((0, ts_1.isSourceFile)(node)) {
            currentSourceFile = node;
            // Neither component transform wants substitution notifications for `SourceFile`s, and, in fact, relies on
            // the source file emit notification to setup scope variables for substitutions (so we _cannot_ call their substitute
            // functions on source files safely, as that context only gets setup in a later pipeline phase!)
            return previousOnSubstituteNode(hint, node);
        }
        else {
            if (!currentSourceFile) {
                return previousOnSubstituteNode(hint, node);
            }
            if (currentSourceFile.impliedNodeFormat === ts_1.ModuleKind.ESNext) {
                return esmOnSubstituteNode(hint, node);
            }
            return cjsOnSubstituteNode(hint, node);
        }
    }
    function onEmitNode(hint, node, emitCallback) {
        if ((0, ts_1.isSourceFile)(node)) {
            currentSourceFile = node;
        }
        if (!currentSourceFile) {
            return previousOnEmitNode(hint, node, emitCallback);
        }
        if (currentSourceFile.impliedNodeFormat === ts_1.ModuleKind.ESNext) {
            return esmOnEmitNode(hint, node, emitCallback);
        }
        return cjsOnEmitNode(hint, node, emitCallback);
    }
    function getModuleTransformForFile(file) {
        return file.impliedNodeFormat === ts_1.ModuleKind.ESNext ? esmTransform : cjsTransform;
    }
    function transformSourceFile(node) {
        if (node.isDeclarationFile) {
            return node;
        }
        currentSourceFile = node;
        var result = getModuleTransformForFile(node)(node);
        currentSourceFile = undefined;
        ts_1.Debug.assert((0, ts_1.isSourceFile)(result));
        return result;
    }
    function transformSourceFileOrBundle(node) {
        return node.kind === 311 /* SyntaxKind.SourceFile */ ? transformSourceFile(node) : transformBundle(node);
    }
    function transformBundle(node) {
        return context.factory.createBundle((0, ts_1.map)(node.sourceFiles, transformSourceFile), node.prepends);
    }
}
exports.transformNodeModule = transformNodeModule;
