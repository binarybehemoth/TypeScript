"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.transformESNext = void 0;
var ts_1 = require("../_namespaces/ts");
/** @internal */
function transformESNext(context) {
    return (0, ts_1.chainBundle)(context, transformSourceFile);
    function transformSourceFile(node) {
        if (node.isDeclarationFile) {
            return node;
        }
        return (0, ts_1.visitEachChild)(node, visitor, context);
    }
    function visitor(node) {
        if ((node.transformFlags & 4 /* TransformFlags.ContainsESNext */) === 0) {
            return node;
        }
        switch (node.kind) {
            default:
                return (0, ts_1.visitEachChild)(node, visitor, context);
        }
    }
}
exports.transformESNext = transformESNext;
