"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createBaseNodeFactory = void 0;
var ts_1 = require("../_namespaces/ts");
/**
 * Creates a `BaseNodeFactory` which can be used to create `Node` instances from the constructors provided by the object allocator.
 *
 * @internal
 */
function createBaseNodeFactory() {
    var NodeConstructor;
    var TokenConstructor;
    var IdentifierConstructor;
    var PrivateIdentifierConstructor;
    var SourceFileConstructor;
    return {
        createBaseSourceFileNode: createBaseSourceFileNode,
        createBaseIdentifierNode: createBaseIdentifierNode,
        createBasePrivateIdentifierNode: createBasePrivateIdentifierNode,
        createBaseTokenNode: createBaseTokenNode,
        createBaseNode: createBaseNode
    };
    function createBaseSourceFileNode(kind) {
        return new (SourceFileConstructor || (SourceFileConstructor = ts_1.objectAllocator.getSourceFileConstructor()))(kind, /*pos*/ -1, /*end*/ -1);
    }
    function createBaseIdentifierNode(kind) {
        return new (IdentifierConstructor || (IdentifierConstructor = ts_1.objectAllocator.getIdentifierConstructor()))(kind, /*pos*/ -1, /*end*/ -1);
    }
    function createBasePrivateIdentifierNode(kind) {
        return new (PrivateIdentifierConstructor || (PrivateIdentifierConstructor = ts_1.objectAllocator.getPrivateIdentifierConstructor()))(kind, /*pos*/ -1, /*end*/ -1);
    }
    function createBaseTokenNode(kind) {
        return new (TokenConstructor || (TokenConstructor = ts_1.objectAllocator.getTokenConstructor()))(kind, /*pos*/ -1, /*end*/ -1);
    }
    function createBaseNode(kind) {
        return new (NodeConstructor || (NodeConstructor = ts_1.objectAllocator.getNodeConstructor()))(kind, /*pos*/ -1, /*end*/ -1);
    }
}
exports.createBaseNodeFactory = createBaseNodeFactory;
