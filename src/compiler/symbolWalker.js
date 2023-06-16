"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createGetSymbolWalker = void 0;
var ts_1 = require("./_namespaces/ts");
/** @internal */
function createGetSymbolWalker(getRestTypeOfSignature, getTypePredicateOfSignature, getReturnTypeOfSignature, getBaseTypes, resolveStructuredTypeMembers, getTypeOfSymbol, getResolvedSymbol, getConstraintOfTypeParameter, getFirstIdentifier, getTypeArguments) {
    return getSymbolWalker;
    function getSymbolWalker(accept) {
        if (accept === void 0) { accept = function () { return true; }; }
        var visitedTypes = []; // Sparse array from id to type
        var visitedSymbols = []; // Sparse array from id to symbol
        return {
            walkType: function (type) {
                try {
                    visitType(type);
                    return { visitedTypes: (0, ts_1.getOwnValues)(visitedTypes), visitedSymbols: (0, ts_1.getOwnValues)(visitedSymbols) };
                }
                finally {
                    (0, ts_1.clear)(visitedTypes);
                    (0, ts_1.clear)(visitedSymbols);
                }
            },
            walkSymbol: function (symbol) {
                try {
                    visitSymbol(symbol);
                    return { visitedTypes: (0, ts_1.getOwnValues)(visitedTypes), visitedSymbols: (0, ts_1.getOwnValues)(visitedSymbols) };
                }
                finally {
                    (0, ts_1.clear)(visitedTypes);
                    (0, ts_1.clear)(visitedSymbols);
                }
            },
        };
        function visitType(type) {
            if (!type) {
                return;
            }
            if (visitedTypes[type.id]) {
                return;
            }
            visitedTypes[type.id] = type;
            // Reuse visitSymbol to visit the type's symbol,
            //  but be sure to bail on recuring into the type if accept declines the symbol.
            var shouldBail = visitSymbol(type.symbol);
            if (shouldBail)
                return;
            // Visit the type's related types, if any
            if (type.flags & 524288 /* TypeFlags.Object */) {
                var objectType = type;
                var objectFlags = objectType.objectFlags;
                if (objectFlags & 4 /* ObjectFlags.Reference */) {
                    visitTypeReference(type);
                }
                if (objectFlags & 32 /* ObjectFlags.Mapped */) {
                    visitMappedType(type);
                }
                if (objectFlags & (1 /* ObjectFlags.Class */ | 2 /* ObjectFlags.Interface */)) {
                    visitInterfaceType(type);
                }
                if (objectFlags & (8 /* ObjectFlags.Tuple */ | 16 /* ObjectFlags.Anonymous */)) {
                    visitObjectType(objectType);
                }
            }
            if (type.flags & 262144 /* TypeFlags.TypeParameter */) {
                visitTypeParameter(type);
            }
            if (type.flags & 3145728 /* TypeFlags.UnionOrIntersection */) {
                visitUnionOrIntersectionType(type);
            }
            if (type.flags & 4194304 /* TypeFlags.Index */) {
                visitIndexType(type);
            }
            if (type.flags & 8388608 /* TypeFlags.IndexedAccess */) {
                visitIndexedAccessType(type);
            }
        }
        function visitTypeReference(type) {
            visitType(type.target);
            (0, ts_1.forEach)(getTypeArguments(type), visitType);
        }
        function visitTypeParameter(type) {
            visitType(getConstraintOfTypeParameter(type));
        }
        function visitUnionOrIntersectionType(type) {
            (0, ts_1.forEach)(type.types, visitType);
        }
        function visitIndexType(type) {
            visitType(type.type);
        }
        function visitIndexedAccessType(type) {
            visitType(type.objectType);
            visitType(type.indexType);
            visitType(type.constraint);
        }
        function visitMappedType(type) {
            visitType(type.typeParameter);
            visitType(type.constraintType);
            visitType(type.templateType);
            visitType(type.modifiersType);
        }
        function visitSignature(signature) {
            var typePredicate = getTypePredicateOfSignature(signature);
            if (typePredicate) {
                visitType(typePredicate.type);
            }
            (0, ts_1.forEach)(signature.typeParameters, visitType);
            for (var _i = 0, _a = signature.parameters; _i < _a.length; _i++) {
                var parameter = _a[_i];
                visitSymbol(parameter);
            }
            visitType(getRestTypeOfSignature(signature));
            visitType(getReturnTypeOfSignature(signature));
        }
        function visitInterfaceType(interfaceT) {
            visitObjectType(interfaceT);
            (0, ts_1.forEach)(interfaceT.typeParameters, visitType);
            (0, ts_1.forEach)(getBaseTypes(interfaceT), visitType);
            visitType(interfaceT.thisType);
        }
        function visitObjectType(type) {
            var resolved = resolveStructuredTypeMembers(type);
            for (var _i = 0, _a = resolved.indexInfos; _i < _a.length; _i++) {
                var info = _a[_i];
                visitType(info.keyType);
                visitType(info.type);
            }
            for (var _b = 0, _c = resolved.callSignatures; _b < _c.length; _b++) {
                var signature = _c[_b];
                visitSignature(signature);
            }
            for (var _d = 0, _e = resolved.constructSignatures; _d < _e.length; _d++) {
                var signature = _e[_d];
                visitSignature(signature);
            }
            for (var _f = 0, _g = resolved.properties; _f < _g.length; _f++) {
                var p = _g[_f];
                visitSymbol(p);
            }
        }
        function visitSymbol(symbol) {
            if (!symbol) {
                return false;
            }
            var symbolId = (0, ts_1.getSymbolId)(symbol);
            if (visitedSymbols[symbolId]) {
                return false;
            }
            visitedSymbols[symbolId] = symbol;
            if (!accept(symbol)) {
                return true;
            }
            var t = getTypeOfSymbol(symbol);
            visitType(t); // Should handle members on classes and such
            if (symbol.exports) {
                symbol.exports.forEach(visitSymbol);
            }
            (0, ts_1.forEach)(symbol.declarations, function (d) {
                // Type queries are too far resolved when we just visit the symbol's type
                //  (their type resolved directly to the member deeply referenced)
                // So to get the intervening symbols, we need to check if there's a type
                // query node on any of the symbol's declarations and get symbols there
                if (d.type && d.type.kind === 185 /* SyntaxKind.TypeQuery */) {
                    var query = d.type;
                    var entity = getResolvedSymbol(getFirstIdentifier(query.exprName));
                    visitSymbol(entity);
                }
            });
            return false;
        }
    }
}
exports.createGetSymbolWalker = createGetSymbolWalker;
