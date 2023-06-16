"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.tagNamesAreEquivalent = exports.processPragmasIntoFields = exports.processCommentPragmas = exports.isDeclarationFileName = exports.parseJSDocTypeExpressionForTests = exports.parseIsolatedJSDocComment = exports.updateSourceFile = exports.isExternalModule = exports.parseJsonText = exports.parseIsolatedEntityName = exports.createSourceFile = exports.forEachChildRecursively = exports.forEachChild = exports.isFileProbablyExternalModule = exports.isJSDocLikeText = exports.parseNodeFactory = exports.parseBaseNodeFactory = void 0;
var ts_1 = require("./_namespaces/ts");
var performance = require("./_namespaces/ts.performance");
var NodeConstructor;
var TokenConstructor;
var IdentifierConstructor;
var PrivateIdentifierConstructor;
var SourceFileConstructor;
/**
 * NOTE: You should not use this, it is only exported to support `createNode` in `~/src/deprecatedCompat/deprecations.ts`.
 *
 * @internal
 */
exports.parseBaseNodeFactory = {
    createBaseSourceFileNode: function (kind) { return new (SourceFileConstructor || (SourceFileConstructor = ts_1.objectAllocator.getSourceFileConstructor()))(kind, -1, -1); },
    createBaseIdentifierNode: function (kind) { return new (IdentifierConstructor || (IdentifierConstructor = ts_1.objectAllocator.getIdentifierConstructor()))(kind, -1, -1); },
    createBasePrivateIdentifierNode: function (kind) { return new (PrivateIdentifierConstructor || (PrivateIdentifierConstructor = ts_1.objectAllocator.getPrivateIdentifierConstructor()))(kind, -1, -1); },
    createBaseTokenNode: function (kind) { return new (TokenConstructor || (TokenConstructor = ts_1.objectAllocator.getTokenConstructor()))(kind, -1, -1); },
    createBaseNode: function (kind) { return new (NodeConstructor || (NodeConstructor = ts_1.objectAllocator.getNodeConstructor()))(kind, -1, -1); },
};
/** @internal */
exports.parseNodeFactory = (0, ts_1.createNodeFactory)(1 /* NodeFactoryFlags.NoParenthesizerRules */, exports.parseBaseNodeFactory);
function visitNode(cbNode, node) {
    return node && cbNode(node);
}
function visitNodes(cbNode, cbNodes, nodes) {
    if (nodes) {
        if (cbNodes) {
            return cbNodes(nodes);
        }
        for (var _i = 0, nodes_1 = nodes; _i < nodes_1.length; _i++) {
            var node = nodes_1[_i];
            var result = cbNode(node);
            if (result) {
                return result;
            }
        }
    }
}
/** @internal */
function isJSDocLikeText(text, start) {
    return text.charCodeAt(start + 1) === 42 /* CharacterCodes.asterisk */ &&
        text.charCodeAt(start + 2) === 42 /* CharacterCodes.asterisk */ &&
        text.charCodeAt(start + 3) !== 47 /* CharacterCodes.slash */;
}
exports.isJSDocLikeText = isJSDocLikeText;
/** @internal */
function isFileProbablyExternalModule(sourceFile) {
    // Try to use the first top-level import/export when available, then
    // fall back to looking for an 'import.meta' somewhere in the tree if necessary.
    return (0, ts_1.forEach)(sourceFile.statements, isAnExternalModuleIndicatorNode) ||
        getImportMetaIfNecessary(sourceFile);
}
exports.isFileProbablyExternalModule = isFileProbablyExternalModule;
function isAnExternalModuleIndicatorNode(node) {
    return (0, ts_1.canHaveModifiers)(node) && hasModifierOfKind(node, 95 /* SyntaxKind.ExportKeyword */)
        || (0, ts_1.isImportEqualsDeclaration)(node) && (0, ts_1.isExternalModuleReference)(node.moduleReference)
        || (0, ts_1.isImportDeclaration)(node)
        || (0, ts_1.isExportAssignment)(node)
        || (0, ts_1.isExportDeclaration)(node) ? node : undefined;
}
function getImportMetaIfNecessary(sourceFile) {
    return sourceFile.flags & 4194304 /* NodeFlags.PossiblyContainsImportMeta */ ?
        walkTreeForImportMeta(sourceFile) :
        undefined;
}
function walkTreeForImportMeta(node) {
    return isImportMeta(node) ? node : forEachChild(node, walkTreeForImportMeta);
}
/** Do not use hasModifier inside the parser; it relies on parent pointers. Use this instead. */
function hasModifierOfKind(node, kind) {
    return (0, ts_1.some)(node.modifiers, function (m) { return m.kind === kind; });
}
function isImportMeta(node) {
    return (0, ts_1.isMetaProperty)(node) && node.keywordToken === 102 /* SyntaxKind.ImportKeyword */ && node.name.escapedText === "meta";
}
var forEachChildTable = (_a = {},
    _a[165 /* SyntaxKind.QualifiedName */] = function forEachChildInQualifiedName(node, cbNode, _cbNodes) {
        return visitNode(cbNode, node.left) ||
            visitNode(cbNode, node.right);
    },
    _a[167 /* SyntaxKind.TypeParameter */] = function forEachChildInTypeParameter(node, cbNode, cbNodes) {
        return visitNodes(cbNode, cbNodes, node.modifiers) ||
            visitNode(cbNode, node.name) ||
            visitNode(cbNode, node.constraint) ||
            visitNode(cbNode, node.default) ||
            visitNode(cbNode, node.expression);
    },
    _a[303 /* SyntaxKind.ShorthandPropertyAssignment */] = function forEachChildInShorthandPropertyAssignment(node, cbNode, cbNodes) {
        return visitNodes(cbNode, cbNodes, node.modifiers) ||
            visitNode(cbNode, node.name) ||
            visitNode(cbNode, node.questionToken) ||
            visitNode(cbNode, node.exclamationToken) ||
            visitNode(cbNode, node.equalsToken) ||
            visitNode(cbNode, node.objectAssignmentInitializer);
    },
    _a[304 /* SyntaxKind.SpreadAssignment */] = function forEachChildInSpreadAssignment(node, cbNode, _cbNodes) {
        return visitNode(cbNode, node.expression);
    },
    _a[168 /* SyntaxKind.Parameter */] = function forEachChildInParameter(node, cbNode, cbNodes) {
        return visitNodes(cbNode, cbNodes, node.modifiers) ||
            visitNode(cbNode, node.dotDotDotToken) ||
            visitNode(cbNode, node.name) ||
            visitNode(cbNode, node.questionToken) ||
            visitNode(cbNode, node.type) ||
            visitNode(cbNode, node.initializer);
    },
    _a[171 /* SyntaxKind.PropertyDeclaration */] = function forEachChildInPropertyDeclaration(node, cbNode, cbNodes) {
        return visitNodes(cbNode, cbNodes, node.modifiers) ||
            visitNode(cbNode, node.name) ||
            visitNode(cbNode, node.questionToken) ||
            visitNode(cbNode, node.exclamationToken) ||
            visitNode(cbNode, node.type) ||
            visitNode(cbNode, node.initializer);
    },
    _a[170 /* SyntaxKind.PropertySignature */] = function forEachChildInPropertySignature(node, cbNode, cbNodes) {
        return visitNodes(cbNode, cbNodes, node.modifiers) ||
            visitNode(cbNode, node.name) ||
            visitNode(cbNode, node.questionToken) ||
            visitNode(cbNode, node.type) ||
            visitNode(cbNode, node.initializer);
    },
    _a[302 /* SyntaxKind.PropertyAssignment */] = function forEachChildInPropertyAssignment(node, cbNode, cbNodes) {
        return visitNodes(cbNode, cbNodes, node.modifiers) ||
            visitNode(cbNode, node.name) ||
            visitNode(cbNode, node.questionToken) ||
            visitNode(cbNode, node.exclamationToken) ||
            visitNode(cbNode, node.initializer);
    },
    _a[259 /* SyntaxKind.VariableDeclaration */] = function forEachChildInVariableDeclaration(node, cbNode, _cbNodes) {
        return visitNode(cbNode, node.name) ||
            visitNode(cbNode, node.exclamationToken) ||
            visitNode(cbNode, node.type) ||
            visitNode(cbNode, node.initializer);
    },
    _a[207 /* SyntaxKind.BindingElement */] = function forEachChildInBindingElement(node, cbNode, _cbNodes) {
        return visitNode(cbNode, node.dotDotDotToken) ||
            visitNode(cbNode, node.propertyName) ||
            visitNode(cbNode, node.name) ||
            visitNode(cbNode, node.initializer);
    },
    _a[180 /* SyntaxKind.IndexSignature */] = function forEachChildInIndexSignature(node, cbNode, cbNodes) {
        return visitNodes(cbNode, cbNodes, node.modifiers) ||
            visitNodes(cbNode, cbNodes, node.typeParameters) ||
            visitNodes(cbNode, cbNodes, node.parameters) ||
            visitNode(cbNode, node.type);
    },
    _a[184 /* SyntaxKind.ConstructorType */] = function forEachChildInConstructorType(node, cbNode, cbNodes) {
        return visitNodes(cbNode, cbNodes, node.modifiers) ||
            visitNodes(cbNode, cbNodes, node.typeParameters) ||
            visitNodes(cbNode, cbNodes, node.parameters) ||
            visitNode(cbNode, node.type);
    },
    _a[183 /* SyntaxKind.FunctionType */] = function forEachChildInFunctionType(node, cbNode, cbNodes) {
        return visitNodes(cbNode, cbNodes, node.modifiers) ||
            visitNodes(cbNode, cbNodes, node.typeParameters) ||
            visitNodes(cbNode, cbNodes, node.parameters) ||
            visitNode(cbNode, node.type);
    },
    _a[178 /* SyntaxKind.CallSignature */] = forEachChildInCallOrConstructSignature,
    _a[179 /* SyntaxKind.ConstructSignature */] = forEachChildInCallOrConstructSignature,
    _a[173 /* SyntaxKind.MethodDeclaration */] = function forEachChildInMethodDeclaration(node, cbNode, cbNodes) {
        return visitNodes(cbNode, cbNodes, node.modifiers) ||
            visitNode(cbNode, node.asteriskToken) ||
            visitNode(cbNode, node.name) ||
            visitNode(cbNode, node.questionToken) ||
            visitNode(cbNode, node.exclamationToken) ||
            visitNodes(cbNode, cbNodes, node.typeParameters) ||
            visitNodes(cbNode, cbNodes, node.parameters) ||
            visitNode(cbNode, node.type) ||
            visitNode(cbNode, node.body);
    },
    _a[172 /* SyntaxKind.MethodSignature */] = function forEachChildInMethodSignature(node, cbNode, cbNodes) {
        return visitNodes(cbNode, cbNodes, node.modifiers) ||
            visitNode(cbNode, node.name) ||
            visitNode(cbNode, node.questionToken) ||
            visitNodes(cbNode, cbNodes, node.typeParameters) ||
            visitNodes(cbNode, cbNodes, node.parameters) ||
            visitNode(cbNode, node.type);
    },
    _a[175 /* SyntaxKind.Constructor */] = function forEachChildInConstructor(node, cbNode, cbNodes) {
        return visitNodes(cbNode, cbNodes, node.modifiers) ||
            visitNode(cbNode, node.name) ||
            visitNodes(cbNode, cbNodes, node.typeParameters) ||
            visitNodes(cbNode, cbNodes, node.parameters) ||
            visitNode(cbNode, node.type) ||
            visitNode(cbNode, node.body);
    },
    _a[176 /* SyntaxKind.GetAccessor */] = function forEachChildInGetAccessor(node, cbNode, cbNodes) {
        return visitNodes(cbNode, cbNodes, node.modifiers) ||
            visitNode(cbNode, node.name) ||
            visitNodes(cbNode, cbNodes, node.typeParameters) ||
            visitNodes(cbNode, cbNodes, node.parameters) ||
            visitNode(cbNode, node.type) ||
            visitNode(cbNode, node.body);
    },
    _a[177 /* SyntaxKind.SetAccessor */] = function forEachChildInSetAccessor(node, cbNode, cbNodes) {
        return visitNodes(cbNode, cbNodes, node.modifiers) ||
            visitNode(cbNode, node.name) ||
            visitNodes(cbNode, cbNodes, node.typeParameters) ||
            visitNodes(cbNode, cbNodes, node.parameters) ||
            visitNode(cbNode, node.type) ||
            visitNode(cbNode, node.body);
    },
    _a[261 /* SyntaxKind.FunctionDeclaration */] = function forEachChildInFunctionDeclaration(node, cbNode, cbNodes) {
        return visitNodes(cbNode, cbNodes, node.modifiers) ||
            visitNode(cbNode, node.asteriskToken) ||
            visitNode(cbNode, node.name) ||
            visitNodes(cbNode, cbNodes, node.typeParameters) ||
            visitNodes(cbNode, cbNodes, node.parameters) ||
            visitNode(cbNode, node.type) ||
            visitNode(cbNode, node.body);
    },
    _a[217 /* SyntaxKind.FunctionExpression */] = function forEachChildInFunctionExpression(node, cbNode, cbNodes) {
        return visitNodes(cbNode, cbNodes, node.modifiers) ||
            visitNode(cbNode, node.asteriskToken) ||
            visitNode(cbNode, node.name) ||
            visitNodes(cbNode, cbNodes, node.typeParameters) ||
            visitNodes(cbNode, cbNodes, node.parameters) ||
            visitNode(cbNode, node.type) ||
            visitNode(cbNode, node.body);
    },
    _a[218 /* SyntaxKind.ArrowFunction */] = function forEachChildInArrowFunction(node, cbNode, cbNodes) {
        return visitNodes(cbNode, cbNodes, node.modifiers) ||
            visitNodes(cbNode, cbNodes, node.typeParameters) ||
            visitNodes(cbNode, cbNodes, node.parameters) ||
            visitNode(cbNode, node.type) ||
            visitNode(cbNode, node.equalsGreaterThanToken) ||
            visitNode(cbNode, node.body);
    },
    _a[174 /* SyntaxKind.ClassStaticBlockDeclaration */] = function forEachChildInClassStaticBlockDeclaration(node, cbNode, cbNodes) {
        return visitNodes(cbNode, cbNodes, node.modifiers) ||
            visitNode(cbNode, node.body);
    },
    _a[182 /* SyntaxKind.TypeReference */] = function forEachChildInTypeReference(node, cbNode, cbNodes) {
        return visitNode(cbNode, node.typeName) ||
            visitNodes(cbNode, cbNodes, node.typeArguments);
    },
    _a[181 /* SyntaxKind.TypePredicate */] = function forEachChildInTypePredicate(node, cbNode, _cbNodes) {
        return visitNode(cbNode, node.assertsModifier) ||
            visitNode(cbNode, node.parameterName) ||
            visitNode(cbNode, node.type);
    },
    _a[185 /* SyntaxKind.TypeQuery */] = function forEachChildInTypeQuery(node, cbNode, cbNodes) {
        return visitNode(cbNode, node.exprName) ||
            visitNodes(cbNode, cbNodes, node.typeArguments);
    },
    _a[186 /* SyntaxKind.TypeLiteral */] = function forEachChildInTypeLiteral(node, cbNode, cbNodes) {
        return visitNodes(cbNode, cbNodes, node.members);
    },
    _a[187 /* SyntaxKind.ArrayType */] = function forEachChildInArrayType(node, cbNode, _cbNodes) {
        return visitNode(cbNode, node.elementType);
    },
    _a[188 /* SyntaxKind.TupleType */] = function forEachChildInTupleType(node, cbNode, cbNodes) {
        return visitNodes(cbNode, cbNodes, node.elements);
    },
    _a[191 /* SyntaxKind.UnionType */] = forEachChildInUnionOrIntersectionType,
    _a[192 /* SyntaxKind.IntersectionType */] = forEachChildInUnionOrIntersectionType,
    _a[193 /* SyntaxKind.ConditionalType */] = function forEachChildInConditionalType(node, cbNode, _cbNodes) {
        return visitNode(cbNode, node.checkType) ||
            visitNode(cbNode, node.extendsType) ||
            visitNode(cbNode, node.trueType) ||
            visitNode(cbNode, node.falseType);
    },
    _a[194 /* SyntaxKind.InferType */] = function forEachChildInInferType(node, cbNode, _cbNodes) {
        return visitNode(cbNode, node.typeParameter);
    },
    _a[204 /* SyntaxKind.ImportType */] = function forEachChildInImportType(node, cbNode, cbNodes) {
        return visitNode(cbNode, node.argument) ||
            visitNode(cbNode, node.assertions) ||
            visitNode(cbNode, node.qualifier) ||
            visitNodes(cbNode, cbNodes, node.typeArguments);
    },
    _a[301 /* SyntaxKind.ImportTypeAssertionContainer */] = function forEachChildInImportTypeAssertionContainer(node, cbNode, _cbNodes) {
        return visitNode(cbNode, node.assertClause);
    },
    _a[195 /* SyntaxKind.ParenthesizedType */] = forEachChildInParenthesizedTypeOrTypeOperator,
    _a[197 /* SyntaxKind.TypeOperator */] = forEachChildInParenthesizedTypeOrTypeOperator,
    _a[198 /* SyntaxKind.IndexedAccessType */] = function forEachChildInIndexedAccessType(node, cbNode, _cbNodes) {
        return visitNode(cbNode, node.objectType) ||
            visitNode(cbNode, node.indexType);
    },
    _a[199 /* SyntaxKind.MappedType */] = function forEachChildInMappedType(node, cbNode, cbNodes) {
        return visitNode(cbNode, node.readonlyToken) ||
            visitNode(cbNode, node.typeParameter) ||
            visitNode(cbNode, node.nameType) ||
            visitNode(cbNode, node.questionToken) ||
            visitNode(cbNode, node.type) ||
            visitNodes(cbNode, cbNodes, node.members);
    },
    _a[200 /* SyntaxKind.LiteralType */] = function forEachChildInLiteralType(node, cbNode, _cbNodes) {
        return visitNode(cbNode, node.literal);
    },
    _a[201 /* SyntaxKind.NamedTupleMember */] = function forEachChildInNamedTupleMember(node, cbNode, _cbNodes) {
        return visitNode(cbNode, node.dotDotDotToken) ||
            visitNode(cbNode, node.name) ||
            visitNode(cbNode, node.questionToken) ||
            visitNode(cbNode, node.type);
    },
    _a[205 /* SyntaxKind.ObjectBindingPattern */] = forEachChildInObjectOrArrayBindingPattern,
    _a[206 /* SyntaxKind.ArrayBindingPattern */] = forEachChildInObjectOrArrayBindingPattern,
    _a[208 /* SyntaxKind.ArrayLiteralExpression */] = function forEachChildInArrayLiteralExpression(node, cbNode, cbNodes) {
        return visitNodes(cbNode, cbNodes, node.elements);
    },
    _a[209 /* SyntaxKind.ObjectLiteralExpression */] = function forEachChildInObjectLiteralExpression(node, cbNode, cbNodes) {
        return visitNodes(cbNode, cbNodes, node.properties);
    },
    _a[210 /* SyntaxKind.PropertyAccessExpression */] = function forEachChildInPropertyAccessExpression(node, cbNode, _cbNodes) {
        return visitNode(cbNode, node.expression) ||
            visitNode(cbNode, node.questionDotToken) ||
            visitNode(cbNode, node.name);
    },
    _a[211 /* SyntaxKind.ElementAccessExpression */] = function forEachChildInElementAccessExpression(node, cbNode, _cbNodes) {
        return visitNode(cbNode, node.expression) ||
            visitNode(cbNode, node.questionDotToken) ||
            visitNode(cbNode, node.argumentExpression);
    },
    _a[212 /* SyntaxKind.CallExpression */] = forEachChildInCallOrNewExpression,
    _a[213 /* SyntaxKind.NewExpression */] = forEachChildInCallOrNewExpression,
    _a[214 /* SyntaxKind.TaggedTemplateExpression */] = function forEachChildInTaggedTemplateExpression(node, cbNode, cbNodes) {
        return visitNode(cbNode, node.tag) ||
            visitNode(cbNode, node.questionDotToken) ||
            visitNodes(cbNode, cbNodes, node.typeArguments) ||
            visitNode(cbNode, node.template);
    },
    _a[215 /* SyntaxKind.TypeAssertionExpression */] = function forEachChildInTypeAssertionExpression(node, cbNode, _cbNodes) {
        return visitNode(cbNode, node.type) ||
            visitNode(cbNode, node.expression);
    },
    _a[216 /* SyntaxKind.ParenthesizedExpression */] = function forEachChildInParenthesizedExpression(node, cbNode, _cbNodes) {
        return visitNode(cbNode, node.expression);
    },
    _a[219 /* SyntaxKind.DeleteExpression */] = function forEachChildInDeleteExpression(node, cbNode, _cbNodes) {
        return visitNode(cbNode, node.expression);
    },
    _a[220 /* SyntaxKind.TypeOfExpression */] = function forEachChildInTypeOfExpression(node, cbNode, _cbNodes) {
        return visitNode(cbNode, node.expression);
    },
    _a[221 /* SyntaxKind.VoidExpression */] = function forEachChildInVoidExpression(node, cbNode, _cbNodes) {
        return visitNode(cbNode, node.expression);
    },
    _a[223 /* SyntaxKind.PrefixUnaryExpression */] = function forEachChildInPrefixUnaryExpression(node, cbNode, _cbNodes) {
        return visitNode(cbNode, node.operand);
    },
    _a[228 /* SyntaxKind.YieldExpression */] = function forEachChildInYieldExpression(node, cbNode, _cbNodes) {
        return visitNode(cbNode, node.asteriskToken) ||
            visitNode(cbNode, node.expression);
    },
    _a[222 /* SyntaxKind.AwaitExpression */] = function forEachChildInAwaitExpression(node, cbNode, _cbNodes) {
        return visitNode(cbNode, node.expression);
    },
    _a[224 /* SyntaxKind.PostfixUnaryExpression */] = function forEachChildInPostfixUnaryExpression(node, cbNode, _cbNodes) {
        return visitNode(cbNode, node.operand);
    },
    _a[225 /* SyntaxKind.BinaryExpression */] = function forEachChildInBinaryExpression(node, cbNode, _cbNodes) {
        return visitNode(cbNode, node.left) ||
            visitNode(cbNode, node.operatorToken) ||
            visitNode(cbNode, node.right);
    },
    _a[233 /* SyntaxKind.AsExpression */] = function forEachChildInAsExpression(node, cbNode, _cbNodes) {
        return visitNode(cbNode, node.expression) ||
            visitNode(cbNode, node.type);
    },
    _a[234 /* SyntaxKind.NonNullExpression */] = function forEachChildInNonNullExpression(node, cbNode, _cbNodes) {
        return visitNode(cbNode, node.expression);
    },
    _a[237 /* SyntaxKind.SatisfiesExpression */] = function forEachChildInSatisfiesExpression(node, cbNode, _cbNodes) {
        return visitNode(cbNode, node.expression) || visitNode(cbNode, node.type);
    },
    _a[235 /* SyntaxKind.MetaProperty */] = function forEachChildInMetaProperty(node, cbNode, _cbNodes) {
        return visitNode(cbNode, node.name);
    },
    _a[226 /* SyntaxKind.ConditionalExpression */] = function forEachChildInConditionalExpression(node, cbNode, _cbNodes) {
        return visitNode(cbNode, node.condition) ||
            visitNode(cbNode, node.questionToken) ||
            visitNode(cbNode, node.whenTrue) ||
            visitNode(cbNode, node.colonToken) ||
            visitNode(cbNode, node.whenFalse);
    },
    _a[229 /* SyntaxKind.SpreadElement */] = function forEachChildInSpreadElement(node, cbNode, _cbNodes) {
        return visitNode(cbNode, node.expression);
    },
    _a[240 /* SyntaxKind.Block */] = forEachChildInBlock,
    _a[267 /* SyntaxKind.ModuleBlock */] = forEachChildInBlock,
    _a[311 /* SyntaxKind.SourceFile */] = function forEachChildInSourceFile(node, cbNode, cbNodes) {
        return visitNodes(cbNode, cbNodes, node.statements) ||
            visitNode(cbNode, node.endOfFileToken);
    },
    _a[242 /* SyntaxKind.VariableStatement */] = function forEachChildInVariableStatement(node, cbNode, cbNodes) {
        return visitNodes(cbNode, cbNodes, node.modifiers) ||
            visitNode(cbNode, node.declarationList);
    },
    _a[260 /* SyntaxKind.VariableDeclarationList */] = function forEachChildInVariableDeclarationList(node, cbNode, cbNodes) {
        return visitNodes(cbNode, cbNodes, node.declarations);
    },
    _a[243 /* SyntaxKind.ExpressionStatement */] = function forEachChildInExpressionStatement(node, cbNode, _cbNodes) {
        return visitNode(cbNode, node.expression);
    },
    _a[244 /* SyntaxKind.IfStatement */] = function forEachChildInIfStatement(node, cbNode, _cbNodes) {
        return visitNode(cbNode, node.expression) ||
            visitNode(cbNode, node.thenStatement) ||
            visitNode(cbNode, node.elseStatement);
    },
    _a[245 /* SyntaxKind.DoStatement */] = function forEachChildInDoStatement(node, cbNode, _cbNodes) {
        return visitNode(cbNode, node.statement) ||
            visitNode(cbNode, node.expression);
    },
    _a[246 /* SyntaxKind.WhileStatement */] = function forEachChildInWhileStatement(node, cbNode, _cbNodes) {
        return visitNode(cbNode, node.expression) ||
            visitNode(cbNode, node.statement);
    },
    _a[247 /* SyntaxKind.ForStatement */] = function forEachChildInForStatement(node, cbNode, _cbNodes) {
        return visitNode(cbNode, node.initializer) ||
            visitNode(cbNode, node.condition) ||
            visitNode(cbNode, node.incrementor) ||
            visitNode(cbNode, node.statement);
    },
    _a[248 /* SyntaxKind.ForInStatement */] = function forEachChildInForInStatement(node, cbNode, _cbNodes) {
        return visitNode(cbNode, node.initializer) ||
            visitNode(cbNode, node.expression) ||
            visitNode(cbNode, node.statement);
    },
    _a[249 /* SyntaxKind.ForOfStatement */] = function forEachChildInForOfStatement(node, cbNode, _cbNodes) {
        return visitNode(cbNode, node.awaitModifier) ||
            visitNode(cbNode, node.initializer) ||
            visitNode(cbNode, node.expression) ||
            visitNode(cbNode, node.statement);
    },
    _a[250 /* SyntaxKind.ContinueStatement */] = forEachChildInContinueOrBreakStatement,
    _a[251 /* SyntaxKind.BreakStatement */] = forEachChildInContinueOrBreakStatement,
    _a[252 /* SyntaxKind.ReturnStatement */] = function forEachChildInReturnStatement(node, cbNode, _cbNodes) {
        return visitNode(cbNode, node.expression);
    },
    _a[253 /* SyntaxKind.WithStatement */] = function forEachChildInWithStatement(node, cbNode, _cbNodes) {
        return visitNode(cbNode, node.expression) ||
            visitNode(cbNode, node.statement);
    },
    _a[254 /* SyntaxKind.SwitchStatement */] = function forEachChildInSwitchStatement(node, cbNode, _cbNodes) {
        return visitNode(cbNode, node.expression) ||
            visitNode(cbNode, node.caseBlock);
    },
    _a[268 /* SyntaxKind.CaseBlock */] = function forEachChildInCaseBlock(node, cbNode, cbNodes) {
        return visitNodes(cbNode, cbNodes, node.clauses);
    },
    _a[295 /* SyntaxKind.CaseClause */] = function forEachChildInCaseClause(node, cbNode, cbNodes) {
        return visitNode(cbNode, node.expression) ||
            visitNodes(cbNode, cbNodes, node.statements);
    },
    _a[296 /* SyntaxKind.DefaultClause */] = function forEachChildInDefaultClause(node, cbNode, cbNodes) {
        return visitNodes(cbNode, cbNodes, node.statements);
    },
    _a[255 /* SyntaxKind.LabeledStatement */] = function forEachChildInLabeledStatement(node, cbNode, _cbNodes) {
        return visitNode(cbNode, node.label) ||
            visitNode(cbNode, node.statement);
    },
    _a[256 /* SyntaxKind.ThrowStatement */] = function forEachChildInThrowStatement(node, cbNode, _cbNodes) {
        return visitNode(cbNode, node.expression);
    },
    _a[257 /* SyntaxKind.TryStatement */] = function forEachChildInTryStatement(node, cbNode, _cbNodes) {
        return visitNode(cbNode, node.tryBlock) ||
            visitNode(cbNode, node.catchClause) ||
            visitNode(cbNode, node.finallyBlock);
    },
    _a[298 /* SyntaxKind.CatchClause */] = function forEachChildInCatchClause(node, cbNode, _cbNodes) {
        return visitNode(cbNode, node.variableDeclaration) ||
            visitNode(cbNode, node.block);
    },
    _a[169 /* SyntaxKind.Decorator */] = function forEachChildInDecorator(node, cbNode, _cbNodes) {
        return visitNode(cbNode, node.expression);
    },
    _a[262 /* SyntaxKind.ClassDeclaration */] = forEachChildInClassDeclarationOrExpression,
    _a[230 /* SyntaxKind.ClassExpression */] = forEachChildInClassDeclarationOrExpression,
    _a[263 /* SyntaxKind.InterfaceDeclaration */] = function forEachChildInInterfaceDeclaration(node, cbNode, cbNodes) {
        return visitNodes(cbNode, cbNodes, node.modifiers) ||
            visitNode(cbNode, node.name) ||
            visitNodes(cbNode, cbNodes, node.typeParameters) ||
            visitNodes(cbNode, cbNodes, node.heritageClauses) ||
            visitNodes(cbNode, cbNodes, node.members);
    },
    _a[264 /* SyntaxKind.TypeAliasDeclaration */] = function forEachChildInTypeAliasDeclaration(node, cbNode, cbNodes) {
        return visitNodes(cbNode, cbNodes, node.modifiers) ||
            visitNode(cbNode, node.name) ||
            visitNodes(cbNode, cbNodes, node.typeParameters) ||
            visitNode(cbNode, node.type);
    },
    _a[265 /* SyntaxKind.EnumDeclaration */] = function forEachChildInEnumDeclaration(node, cbNode, cbNodes) {
        return visitNodes(cbNode, cbNodes, node.modifiers) ||
            visitNode(cbNode, node.name) ||
            visitNodes(cbNode, cbNodes, node.members);
    },
    _a[305 /* SyntaxKind.EnumMember */] = function forEachChildInEnumMember(node, cbNode, _cbNodes) {
        return visitNode(cbNode, node.name) ||
            visitNode(cbNode, node.initializer);
    },
    _a[266 /* SyntaxKind.ModuleDeclaration */] = function forEachChildInModuleDeclaration(node, cbNode, cbNodes) {
        return visitNodes(cbNode, cbNodes, node.modifiers) ||
            visitNode(cbNode, node.name) ||
            visitNode(cbNode, node.body);
    },
    _a[270 /* SyntaxKind.ImportEqualsDeclaration */] = function forEachChildInImportEqualsDeclaration(node, cbNode, cbNodes) {
        return visitNodes(cbNode, cbNodes, node.modifiers) ||
            visitNode(cbNode, node.name) ||
            visitNode(cbNode, node.moduleReference);
    },
    _a[271 /* SyntaxKind.ImportDeclaration */] = function forEachChildInImportDeclaration(node, cbNode, cbNodes) {
        return visitNodes(cbNode, cbNodes, node.modifiers) ||
            visitNode(cbNode, node.importClause) ||
            visitNode(cbNode, node.moduleSpecifier) ||
            visitNode(cbNode, node.assertClause);
    },
    _a[272 /* SyntaxKind.ImportClause */] = function forEachChildInImportClause(node, cbNode, _cbNodes) {
        return visitNode(cbNode, node.name) ||
            visitNode(cbNode, node.namedBindings);
    },
    _a[299 /* SyntaxKind.AssertClause */] = function forEachChildInAssertClause(node, cbNode, cbNodes) {
        return visitNodes(cbNode, cbNodes, node.elements);
    },
    _a[300 /* SyntaxKind.AssertEntry */] = function forEachChildInAssertEntry(node, cbNode, _cbNodes) {
        return visitNode(cbNode, node.name) ||
            visitNode(cbNode, node.value);
    },
    _a[269 /* SyntaxKind.NamespaceExportDeclaration */] = function forEachChildInNamespaceExportDeclaration(node, cbNode, cbNodes) {
        return visitNodes(cbNode, cbNodes, node.modifiers) ||
            visitNode(cbNode, node.name);
    },
    _a[273 /* SyntaxKind.NamespaceImport */] = function forEachChildInNamespaceImport(node, cbNode, _cbNodes) {
        return visitNode(cbNode, node.name);
    },
    _a[279 /* SyntaxKind.NamespaceExport */] = function forEachChildInNamespaceExport(node, cbNode, _cbNodes) {
        return visitNode(cbNode, node.name);
    },
    _a[274 /* SyntaxKind.NamedImports */] = forEachChildInNamedImportsOrExports,
    _a[278 /* SyntaxKind.NamedExports */] = forEachChildInNamedImportsOrExports,
    _a[277 /* SyntaxKind.ExportDeclaration */] = function forEachChildInExportDeclaration(node, cbNode, cbNodes) {
        return visitNodes(cbNode, cbNodes, node.modifiers) ||
            visitNode(cbNode, node.exportClause) ||
            visitNode(cbNode, node.moduleSpecifier) ||
            visitNode(cbNode, node.assertClause);
    },
    _a[275 /* SyntaxKind.ImportSpecifier */] = forEachChildInImportOrExportSpecifier,
    _a[280 /* SyntaxKind.ExportSpecifier */] = forEachChildInImportOrExportSpecifier,
    _a[276 /* SyntaxKind.ExportAssignment */] = function forEachChildInExportAssignment(node, cbNode, cbNodes) {
        return visitNodes(cbNode, cbNodes, node.modifiers) ||
            visitNode(cbNode, node.expression);
    },
    _a[227 /* SyntaxKind.TemplateExpression */] = function forEachChildInTemplateExpression(node, cbNode, cbNodes) {
        return visitNode(cbNode, node.head) ||
            visitNodes(cbNode, cbNodes, node.templateSpans);
    },
    _a[238 /* SyntaxKind.TemplateSpan */] = function forEachChildInTemplateSpan(node, cbNode, _cbNodes) {
        return visitNode(cbNode, node.expression) ||
            visitNode(cbNode, node.literal);
    },
    _a[202 /* SyntaxKind.TemplateLiteralType */] = function forEachChildInTemplateLiteralType(node, cbNode, cbNodes) {
        return visitNode(cbNode, node.head) ||
            visitNodes(cbNode, cbNodes, node.templateSpans);
    },
    _a[203 /* SyntaxKind.TemplateLiteralTypeSpan */] = function forEachChildInTemplateLiteralTypeSpan(node, cbNode, _cbNodes) {
        return visitNode(cbNode, node.type) ||
            visitNode(cbNode, node.literal);
    },
    _a[166 /* SyntaxKind.ComputedPropertyName */] = function forEachChildInComputedPropertyName(node, cbNode, _cbNodes) {
        return visitNode(cbNode, node.expression);
    },
    _a[297 /* SyntaxKind.HeritageClause */] = function forEachChildInHeritageClause(node, cbNode, cbNodes) {
        return visitNodes(cbNode, cbNodes, node.types);
    },
    _a[232 /* SyntaxKind.ExpressionWithTypeArguments */] = function forEachChildInExpressionWithTypeArguments(node, cbNode, cbNodes) {
        return visitNode(cbNode, node.expression) ||
            visitNodes(cbNode, cbNodes, node.typeArguments);
    },
    _a[282 /* SyntaxKind.ExternalModuleReference */] = function forEachChildInExternalModuleReference(node, cbNode, _cbNodes) {
        return visitNode(cbNode, node.expression);
    },
    _a[281 /* SyntaxKind.MissingDeclaration */] = function forEachChildInMissingDeclaration(node, cbNode, cbNodes) {
        return visitNodes(cbNode, cbNodes, node.modifiers);
    },
    _a[360 /* SyntaxKind.CommaListExpression */] = function forEachChildInCommaListExpression(node, cbNode, cbNodes) {
        return visitNodes(cbNode, cbNodes, node.elements);
    },
    _a[283 /* SyntaxKind.JsxElement */] = function forEachChildInJsxElement(node, cbNode, cbNodes) {
        return visitNode(cbNode, node.openingElement) ||
            visitNodes(cbNode, cbNodes, node.children) ||
            visitNode(cbNode, node.closingElement);
    },
    _a[287 /* SyntaxKind.JsxFragment */] = function forEachChildInJsxFragment(node, cbNode, cbNodes) {
        return visitNode(cbNode, node.openingFragment) ||
            visitNodes(cbNode, cbNodes, node.children) ||
            visitNode(cbNode, node.closingFragment);
    },
    _a[284 /* SyntaxKind.JsxSelfClosingElement */] = forEachChildInJsxOpeningOrSelfClosingElement,
    _a[285 /* SyntaxKind.JsxOpeningElement */] = forEachChildInJsxOpeningOrSelfClosingElement,
    _a[291 /* SyntaxKind.JsxAttributes */] = function forEachChildInJsxAttributes(node, cbNode, cbNodes) {
        return visitNodes(cbNode, cbNodes, node.properties);
    },
    _a[290 /* SyntaxKind.JsxAttribute */] = function forEachChildInJsxAttribute(node, cbNode, _cbNodes) {
        return visitNode(cbNode, node.name) ||
            visitNode(cbNode, node.initializer);
    },
    _a[292 /* SyntaxKind.JsxSpreadAttribute */] = function forEachChildInJsxSpreadAttribute(node, cbNode, _cbNodes) {
        return visitNode(cbNode, node.expression);
    },
    _a[293 /* SyntaxKind.JsxExpression */] = function forEachChildInJsxExpression(node, cbNode, _cbNodes) {
        return visitNode(cbNode, node.dotDotDotToken) ||
            visitNode(cbNode, node.expression);
    },
    _a[286 /* SyntaxKind.JsxClosingElement */] = function forEachChildInJsxClosingElement(node, cbNode, _cbNodes) {
        return visitNode(cbNode, node.tagName);
    },
    _a[294 /* SyntaxKind.JsxNamespacedName */] = function forEachChildInJsxNamespacedName(node, cbNode, _cbNodes) {
        return visitNode(cbNode, node.namespace) ||
            visitNode(cbNode, node.name);
    },
    _a[189 /* SyntaxKind.OptionalType */] = forEachChildInOptionalRestOrJSDocParameterModifier,
    _a[190 /* SyntaxKind.RestType */] = forEachChildInOptionalRestOrJSDocParameterModifier,
    _a[315 /* SyntaxKind.JSDocTypeExpression */] = forEachChildInOptionalRestOrJSDocParameterModifier,
    _a[321 /* SyntaxKind.JSDocNonNullableType */] = forEachChildInOptionalRestOrJSDocParameterModifier,
    _a[320 /* SyntaxKind.JSDocNullableType */] = forEachChildInOptionalRestOrJSDocParameterModifier,
    _a[322 /* SyntaxKind.JSDocOptionalType */] = forEachChildInOptionalRestOrJSDocParameterModifier,
    _a[324 /* SyntaxKind.JSDocVariadicType */] = forEachChildInOptionalRestOrJSDocParameterModifier,
    _a[323 /* SyntaxKind.JSDocFunctionType */] = function forEachChildInJSDocFunctionType(node, cbNode, cbNodes) {
        return visitNodes(cbNode, cbNodes, node.parameters) ||
            visitNode(cbNode, node.type);
    },
    _a[326 /* SyntaxKind.JSDoc */] = function forEachChildInJSDoc(node, cbNode, cbNodes) {
        return (typeof node.comment === "string" ? undefined : visitNodes(cbNode, cbNodes, node.comment))
            || visitNodes(cbNode, cbNodes, node.tags);
    },
    _a[353 /* SyntaxKind.JSDocSeeTag */] = function forEachChildInJSDocSeeTag(node, cbNode, cbNodes) {
        return visitNode(cbNode, node.tagName) ||
            visitNode(cbNode, node.name) ||
            (typeof node.comment === "string" ? undefined : visitNodes(cbNode, cbNodes, node.comment));
    },
    _a[316 /* SyntaxKind.JSDocNameReference */] = function forEachChildInJSDocNameReference(node, cbNode, _cbNodes) {
        return visitNode(cbNode, node.name);
    },
    _a[317 /* SyntaxKind.JSDocMemberName */] = function forEachChildInJSDocMemberName(node, cbNode, _cbNodes) {
        return visitNode(cbNode, node.left) ||
            visitNode(cbNode, node.right);
    },
    _a[347 /* SyntaxKind.JSDocParameterTag */] = forEachChildInJSDocParameterOrPropertyTag,
    _a[354 /* SyntaxKind.JSDocPropertyTag */] = forEachChildInJSDocParameterOrPropertyTag,
    _a[336 /* SyntaxKind.JSDocAuthorTag */] = function forEachChildInJSDocAuthorTag(node, cbNode, cbNodes) {
        return visitNode(cbNode, node.tagName) ||
            (typeof node.comment === "string" ? undefined : visitNodes(cbNode, cbNodes, node.comment));
    },
    _a[335 /* SyntaxKind.JSDocImplementsTag */] = function forEachChildInJSDocImplementsTag(node, cbNode, cbNodes) {
        return visitNode(cbNode, node.tagName) ||
            visitNode(cbNode, node.class) ||
            (typeof node.comment === "string" ? undefined : visitNodes(cbNode, cbNodes, node.comment));
    },
    _a[334 /* SyntaxKind.JSDocAugmentsTag */] = function forEachChildInJSDocAugmentsTag(node, cbNode, cbNodes) {
        return visitNode(cbNode, node.tagName) ||
            visitNode(cbNode, node.class) ||
            (typeof node.comment === "string" ? undefined : visitNodes(cbNode, cbNodes, node.comment));
    },
    _a[351 /* SyntaxKind.JSDocTemplateTag */] = function forEachChildInJSDocTemplateTag(node, cbNode, cbNodes) {
        return visitNode(cbNode, node.tagName) ||
            visitNode(cbNode, node.constraint) ||
            visitNodes(cbNode, cbNodes, node.typeParameters) ||
            (typeof node.comment === "string" ? undefined : visitNodes(cbNode, cbNodes, node.comment));
    },
    _a[352 /* SyntaxKind.JSDocTypedefTag */] = function forEachChildInJSDocTypedefTag(node, cbNode, cbNodes) {
        return visitNode(cbNode, node.tagName) ||
            (node.typeExpression &&
                node.typeExpression.kind === 315 /* SyntaxKind.JSDocTypeExpression */
                ? visitNode(cbNode, node.typeExpression) ||
                    visitNode(cbNode, node.fullName) ||
                    (typeof node.comment === "string" ? undefined : visitNodes(cbNode, cbNodes, node.comment))
                : visitNode(cbNode, node.fullName) ||
                    visitNode(cbNode, node.typeExpression) ||
                    (typeof node.comment === "string" ? undefined : visitNodes(cbNode, cbNodes, node.comment)));
    },
    _a[344 /* SyntaxKind.JSDocCallbackTag */] = function forEachChildInJSDocCallbackTag(node, cbNode, cbNodes) {
        return visitNode(cbNode, node.tagName) ||
            visitNode(cbNode, node.fullName) ||
            visitNode(cbNode, node.typeExpression) ||
            (typeof node.comment === "string" ? undefined : visitNodes(cbNode, cbNodes, node.comment));
    },
    _a[348 /* SyntaxKind.JSDocReturnTag */] = forEachChildInJSDocTypeLikeTag,
    _a[350 /* SyntaxKind.JSDocTypeTag */] = forEachChildInJSDocTypeLikeTag,
    _a[349 /* SyntaxKind.JSDocThisTag */] = forEachChildInJSDocTypeLikeTag,
    _a[346 /* SyntaxKind.JSDocEnumTag */] = forEachChildInJSDocTypeLikeTag,
    _a[356 /* SyntaxKind.JSDocSatisfiesTag */] = forEachChildInJSDocTypeLikeTag,
    _a[355 /* SyntaxKind.JSDocThrowsTag */] = forEachChildInJSDocTypeLikeTag,
    _a[345 /* SyntaxKind.JSDocOverloadTag */] = forEachChildInJSDocTypeLikeTag,
    _a[329 /* SyntaxKind.JSDocSignature */] = function forEachChildInJSDocSignature(node, cbNode, _cbNodes) {
        return (0, ts_1.forEach)(node.typeParameters, cbNode) ||
            (0, ts_1.forEach)(node.parameters, cbNode) ||
            visitNode(cbNode, node.type);
    },
    _a[330 /* SyntaxKind.JSDocLink */] = forEachChildInJSDocLinkCodeOrPlain,
    _a[331 /* SyntaxKind.JSDocLinkCode */] = forEachChildInJSDocLinkCodeOrPlain,
    _a[332 /* SyntaxKind.JSDocLinkPlain */] = forEachChildInJSDocLinkCodeOrPlain,
    _a[328 /* SyntaxKind.JSDocTypeLiteral */] = function forEachChildInJSDocTypeLiteral(node, cbNode, _cbNodes) {
        return (0, ts_1.forEach)(node.jsDocPropertyTags, cbNode);
    },
    _a[333 /* SyntaxKind.JSDocTag */] = forEachChildInJSDocTag,
    _a[338 /* SyntaxKind.JSDocClassTag */] = forEachChildInJSDocTag,
    _a[339 /* SyntaxKind.JSDocPublicTag */] = forEachChildInJSDocTag,
    _a[340 /* SyntaxKind.JSDocPrivateTag */] = forEachChildInJSDocTag,
    _a[341 /* SyntaxKind.JSDocProtectedTag */] = forEachChildInJSDocTag,
    _a[342 /* SyntaxKind.JSDocReadonlyTag */] = forEachChildInJSDocTag,
    _a[337 /* SyntaxKind.JSDocDeprecatedTag */] = forEachChildInJSDocTag,
    _a[343 /* SyntaxKind.JSDocOverrideTag */] = forEachChildInJSDocTag,
    _a[359 /* SyntaxKind.PartiallyEmittedExpression */] = forEachChildInPartiallyEmittedExpression,
    _a);
// shared
function forEachChildInCallOrConstructSignature(node, cbNode, cbNodes) {
    return visitNodes(cbNode, cbNodes, node.typeParameters) ||
        visitNodes(cbNode, cbNodes, node.parameters) ||
        visitNode(cbNode, node.type);
}
function forEachChildInUnionOrIntersectionType(node, cbNode, cbNodes) {
    return visitNodes(cbNode, cbNodes, node.types);
}
function forEachChildInParenthesizedTypeOrTypeOperator(node, cbNode, _cbNodes) {
    return visitNode(cbNode, node.type);
}
function forEachChildInObjectOrArrayBindingPattern(node, cbNode, cbNodes) {
    return visitNodes(cbNode, cbNodes, node.elements);
}
function forEachChildInCallOrNewExpression(node, cbNode, cbNodes) {
    return visitNode(cbNode, node.expression) ||
        // TODO: should we separate these branches out?
        visitNode(cbNode, node.questionDotToken) ||
        visitNodes(cbNode, cbNodes, node.typeArguments) ||
        visitNodes(cbNode, cbNodes, node.arguments);
}
function forEachChildInBlock(node, cbNode, cbNodes) {
    return visitNodes(cbNode, cbNodes, node.statements);
}
function forEachChildInContinueOrBreakStatement(node, cbNode, _cbNodes) {
    return visitNode(cbNode, node.label);
}
function forEachChildInClassDeclarationOrExpression(node, cbNode, cbNodes) {
    return visitNodes(cbNode, cbNodes, node.modifiers) ||
        visitNode(cbNode, node.name) ||
        visitNodes(cbNode, cbNodes, node.typeParameters) ||
        visitNodes(cbNode, cbNodes, node.heritageClauses) ||
        visitNodes(cbNode, cbNodes, node.members);
}
function forEachChildInNamedImportsOrExports(node, cbNode, cbNodes) {
    return visitNodes(cbNode, cbNodes, node.elements);
}
function forEachChildInImportOrExportSpecifier(node, cbNode, _cbNodes) {
    return visitNode(cbNode, node.propertyName) ||
        visitNode(cbNode, node.name);
}
function forEachChildInJsxOpeningOrSelfClosingElement(node, cbNode, cbNodes) {
    return visitNode(cbNode, node.tagName) ||
        visitNodes(cbNode, cbNodes, node.typeArguments) ||
        visitNode(cbNode, node.attributes);
}
function forEachChildInOptionalRestOrJSDocParameterModifier(node, cbNode, _cbNodes) {
    return visitNode(cbNode, node.type);
}
function forEachChildInJSDocParameterOrPropertyTag(node, cbNode, cbNodes) {
    return visitNode(cbNode, node.tagName) ||
        (node.isNameFirst
            ? visitNode(cbNode, node.name) || visitNode(cbNode, node.typeExpression)
            : visitNode(cbNode, node.typeExpression) || visitNode(cbNode, node.name)) ||
        (typeof node.comment === "string" ? undefined : visitNodes(cbNode, cbNodes, node.comment));
}
function forEachChildInJSDocTypeLikeTag(node, cbNode, cbNodes) {
    return visitNode(cbNode, node.tagName) ||
        visitNode(cbNode, node.typeExpression) ||
        (typeof node.comment === "string" ? undefined : visitNodes(cbNode, cbNodes, node.comment));
}
function forEachChildInJSDocLinkCodeOrPlain(node, cbNode, _cbNodes) {
    return visitNode(cbNode, node.name);
}
function forEachChildInJSDocTag(node, cbNode, cbNodes) {
    return visitNode(cbNode, node.tagName)
        || (typeof node.comment === "string" ? undefined : visitNodes(cbNode, cbNodes, node.comment));
}
function forEachChildInPartiallyEmittedExpression(node, cbNode, _cbNodes) {
    return visitNode(cbNode, node.expression);
}
/**
 * Invokes a callback for each child of the given node. The 'cbNode' callback is invoked for all child nodes
 * stored in properties. If a 'cbNodes' callback is specified, it is invoked for embedded arrays; otherwise,
 * embedded arrays are flattened and the 'cbNode' callback is invoked for each element. If a callback returns
 * a truthy value, iteration stops and that value is returned. Otherwise, undefined is returned.
 *
 * @param node a given node to visit its children
 * @param cbNode a callback to be invoked for all child nodes
 * @param cbNodes a callback to be invoked for embedded array
 *
 * @remarks `forEachChild` must visit the children of a node in the order
 * that they appear in the source code. The language service depends on this property to locate nodes by position.
 */
function forEachChild(node, cbNode, cbNodes) {
    if (node === undefined || node.kind <= 164 /* SyntaxKind.LastToken */) {
        return;
    }
    var fn = forEachChildTable[node.kind];
    return fn === undefined ? undefined : fn(node, cbNode, cbNodes);
}
exports.forEachChild = forEachChild;
/**
 * Invokes a callback for each child of the given node. The 'cbNode' callback is invoked for all child nodes
 * stored in properties. If a 'cbNodes' callback is specified, it is invoked for embedded arrays; additionally,
 * unlike `forEachChild`, embedded arrays are flattened and the 'cbNode' callback is invoked for each element.
 *  If a callback returns a truthy value, iteration stops and that value is returned. Otherwise, undefined is returned.
 *
 * @param node a given node to visit its children
 * @param cbNode a callback to be invoked for all child nodes
 * @param cbNodes a callback to be invoked for embedded array
 *
 * @remarks Unlike `forEachChild`, `forEachChildRecursively` handles recursively invoking the traversal on each child node found,
 * and while doing so, handles traversing the structure without relying on the callstack to encode the tree structure.
 *
 * @internal
 */
function forEachChildRecursively(rootNode, cbNode, cbNodes) {
    var queue = gatherPossibleChildren(rootNode);
    var parents = []; // tracks parent references for elements in queue
    while (parents.length < queue.length) {
        parents.push(rootNode);
    }
    while (queue.length !== 0) {
        var current = queue.pop();
        var parent_1 = parents.pop();
        if ((0, ts_1.isArray)(current)) {
            if (cbNodes) {
                var res = cbNodes(current, parent_1);
                if (res) {
                    if (res === "skip")
                        continue;
                    return res;
                }
            }
            for (var i = current.length - 1; i >= 0; --i) {
                queue.push(current[i]);
                parents.push(parent_1);
            }
        }
        else {
            var res = cbNode(current, parent_1);
            if (res) {
                if (res === "skip")
                    continue;
                return res;
            }
            if (current.kind >= 165 /* SyntaxKind.FirstNode */) {
                // add children in reverse order to the queue, so popping gives the first child
                for (var _i = 0, _a = gatherPossibleChildren(current); _i < _a.length; _i++) {
                    var child = _a[_i];
                    queue.push(child);
                    parents.push(current);
                }
            }
        }
    }
}
exports.forEachChildRecursively = forEachChildRecursively;
function gatherPossibleChildren(node) {
    var children = [];
    forEachChild(node, addWorkItem, addWorkItem); // By using a stack above and `unshift` here, we emulate a depth-first preorder traversal
    return children;
    function addWorkItem(n) {
        children.unshift(n);
    }
}
function setExternalModuleIndicator(sourceFile) {
    sourceFile.externalModuleIndicator = isFileProbablyExternalModule(sourceFile);
}
function createSourceFile(fileName, sourceText, languageVersionOrOptions, setParentNodes, scriptKind) {
    if (setParentNodes === void 0) { setParentNodes = false; }
    ts_1.tracing === null || ts_1.tracing === void 0 ? void 0 : ts_1.tracing.push("parse" /* tracing.Phase.Parse */, "createSourceFile", { path: fileName }, /*separateBeginAndEnd*/ true);
    performance.mark("beforeParse");
    var result;
    ts_1.perfLogger === null || ts_1.perfLogger === void 0 ? void 0 : ts_1.perfLogger.logStartParseSourceFile(fileName);
    var _a = typeof languageVersionOrOptions === "object" ? languageVersionOrOptions : { languageVersion: languageVersionOrOptions }, languageVersion = _a.languageVersion, overrideSetExternalModuleIndicator = _a.setExternalModuleIndicator, format = _a.impliedNodeFormat;
    if (languageVersion === 100 /* ScriptTarget.JSON */) {
        result = Parser.parseSourceFile(fileName, sourceText, languageVersion, /*syntaxCursor*/ undefined, setParentNodes, 6 /* ScriptKind.JSON */, ts_1.noop);
    }
    else {
        var setIndicator = format === undefined ? overrideSetExternalModuleIndicator : function (file) {
            file.impliedNodeFormat = format;
            return (overrideSetExternalModuleIndicator || setExternalModuleIndicator)(file);
        };
        result = Parser.parseSourceFile(fileName, sourceText, languageVersion, /*syntaxCursor*/ undefined, setParentNodes, scriptKind, setIndicator);
    }
    ts_1.perfLogger === null || ts_1.perfLogger === void 0 ? void 0 : ts_1.perfLogger.logStopParseSourceFile();
    performance.mark("afterParse");
    performance.measure("Parse", "beforeParse", "afterParse");
    ts_1.tracing === null || ts_1.tracing === void 0 ? void 0 : ts_1.tracing.pop();
    return result;
}
exports.createSourceFile = createSourceFile;
function parseIsolatedEntityName(text, languageVersion) {
    return Parser.parseIsolatedEntityName(text, languageVersion);
}
exports.parseIsolatedEntityName = parseIsolatedEntityName;
/**
 * Parse json text into SyntaxTree and return node and parse errors if any
 * @param fileName
 * @param sourceText
 */
function parseJsonText(fileName, sourceText) {
    return Parser.parseJsonText(fileName, sourceText);
}
exports.parseJsonText = parseJsonText;
// See also `isExternalOrCommonJsModule` in utilities.ts
function isExternalModule(file) {
    return file.externalModuleIndicator !== undefined;
}
exports.isExternalModule = isExternalModule;
// Produces a new SourceFile for the 'newText' provided. The 'textChangeRange' parameter
// indicates what changed between the 'text' that this SourceFile has and the 'newText'.
// The SourceFile will be created with the compiler attempting to reuse as many nodes from
// this file as possible.
//
// Note: this function mutates nodes from this SourceFile. That means any existing nodes
// from this SourceFile that are being held onto may change as a result (including
// becoming detached from any SourceFile).  It is recommended that this SourceFile not
// be used once 'update' is called on it.
function updateSourceFile(sourceFile, newText, textChangeRange, aggressiveChecks) {
    if (aggressiveChecks === void 0) { aggressiveChecks = false; }
    var newSourceFile = IncrementalParser.updateSourceFile(sourceFile, newText, textChangeRange, aggressiveChecks);
    // Because new source file node is created, it may not have the flag PossiblyContainDynamicImport. This is the case if there is no new edit to add dynamic import.
    // We will manually port the flag to the new source file.
    newSourceFile.flags |= (sourceFile.flags & 6291456 /* NodeFlags.PermanentlySetIncrementalFlags */);
    return newSourceFile;
}
exports.updateSourceFile = updateSourceFile;
/** @internal */
function parseIsolatedJSDocComment(content, start, length) {
    var result = Parser.JSDocParser.parseIsolatedJSDocComment(content, start, length);
    if (result && result.jsDoc) {
        // because the jsDocComment was parsed out of the source file, it might
        // not be covered by the fixupParentReferences.
        Parser.fixupParentReferences(result.jsDoc);
    }
    return result;
}
exports.parseIsolatedJSDocComment = parseIsolatedJSDocComment;
/** @internal */
// Exposed only for testing.
function parseJSDocTypeExpressionForTests(content, start, length) {
    return Parser.JSDocParser.parseJSDocTypeExpressionForTests(content, start, length);
}
exports.parseJSDocTypeExpressionForTests = parseJSDocTypeExpressionForTests;
// Implement the parser as a singleton module.  We do this for perf reasons because creating
// parser instances can actually be expensive enough to impact us on projects with many source
// files.
var Parser;
(function (Parser) {
    // Why var? It avoids TDZ checks in the runtime which can be costly.
    // See: https://github.com/microsoft/TypeScript/issues/52924
    /* eslint-disable no-var */
    // Share a single scanner across all calls to parse a source file.  This helps speed things
    // up by avoiding the cost of creating/compiling scanners over and over again.
    var scanner = (0, ts_1.createScanner)(99 /* ScriptTarget.Latest */, /*skipTrivia*/ true);
    var disallowInAndDecoratorContext = 4096 /* NodeFlags.DisallowInContext */ | 16384 /* NodeFlags.DecoratorContext */;
    // capture constructors in 'initializeState' to avoid null checks
    var NodeConstructor;
    var TokenConstructor;
    var IdentifierConstructor;
    var PrivateIdentifierConstructor;
    var SourceFileConstructor;
    function countNode(node) {
        nodeCount++;
        return node;
    }
    // Rather than using `createBaseNodeFactory` here, we establish a `BaseNodeFactory` that closes over the
    // constructors above, which are reset each time `initializeState` is called.
    var baseNodeFactory = {
        createBaseSourceFileNode: function (kind) { return countNode(new SourceFileConstructor(kind, /*pos*/ 0, /*end*/ 0)); },
        createBaseIdentifierNode: function (kind) { return countNode(new IdentifierConstructor(kind, /*pos*/ 0, /*end*/ 0)); },
        createBasePrivateIdentifierNode: function (kind) { return countNode(new PrivateIdentifierConstructor(kind, /*pos*/ 0, /*end*/ 0)); },
        createBaseTokenNode: function (kind) { return countNode(new TokenConstructor(kind, /*pos*/ 0, /*end*/ 0)); },
        createBaseNode: function (kind) { return countNode(new NodeConstructor(kind, /*pos*/ 0, /*end*/ 0)); }
    };
    var factory = (0, ts_1.createNodeFactory)(1 /* NodeFactoryFlags.NoParenthesizerRules */ | 2 /* NodeFactoryFlags.NoNodeConverters */ | 8 /* NodeFactoryFlags.NoOriginalNode */, baseNodeFactory);
    var factoryCreateNodeArray = factory.createNodeArray, factoryCreateNumericLiteral = factory.createNumericLiteral, factoryCreateStringLiteral = factory.createStringLiteral, factoryCreateLiteralLikeNode = factory.createLiteralLikeNode, factoryCreateIdentifier = factory.createIdentifier, factoryCreatePrivateIdentifier = factory.createPrivateIdentifier, factoryCreateToken = factory.createToken, factoryCreateArrayLiteralExpression = factory.createArrayLiteralExpression, factoryCreateObjectLiteralExpression = factory.createObjectLiteralExpression, factoryCreatePropertyAccessExpression = factory.createPropertyAccessExpression, factoryCreatePropertyAccessChain = factory.createPropertyAccessChain, factoryCreateElementAccessExpression = factory.createElementAccessExpression, factoryCreateElementAccessChain = factory.createElementAccessChain, factoryCreateCallExpression = factory.createCallExpression, factoryCreateCallChain = factory.createCallChain, factoryCreateNewExpression = factory.createNewExpression, factoryCreateParenthesizedExpression = factory.createParenthesizedExpression, factoryCreateBlock = factory.createBlock, factoryCreateVariableStatement = factory.createVariableStatement, factoryCreateExpressionStatement = factory.createExpressionStatement, factoryCreateIfStatement = factory.createIfStatement, factoryCreateWhileStatement = factory.createWhileStatement, factoryCreateForStatement = factory.createForStatement, factoryCreateForOfStatement = factory.createForOfStatement, factoryCreateVariableDeclaration = factory.createVariableDeclaration, factoryCreateVariableDeclarationList = factory.createVariableDeclarationList;
    var fileName;
    var sourceFlags;
    var sourceText;
    var languageVersion;
    var scriptKind;
    var languageVariant;
    var parseDiagnostics;
    var jsDocDiagnostics;
    var syntaxCursor;
    var currentToken;
    var nodeCount;
    var identifiers;
    var identifierCount;
    // TODO(jakebailey): This type is a lie; this value actually contains the result
    // of ORing a bunch of `1 << ParsingContext.XYZ`.
    var parsingContext;
    var notParenthesizedArrow;
    // Flags that dictate what parsing context we're in.  For example:
    // Whether or not we are in strict parsing mode.  All that changes in strict parsing mode is
    // that some tokens that would be considered identifiers may be considered keywords.
    //
    // When adding more parser context flags, consider which is the more common case that the
    // flag will be in.  This should be the 'false' state for that flag.  The reason for this is
    // that we don't store data in our nodes unless the value is in the *non-default* state.  So,
    // for example, more often than code 'allows-in' (or doesn't 'disallow-in').  We opt for
    // 'disallow-in' set to 'false'.  Otherwise, if we had 'allowsIn' set to 'true', then almost
    // all nodes would need extra state on them to store this info.
    //
    // Note: 'allowIn' and 'allowYield' track 1:1 with the [in] and [yield] concepts in the ES6
    // grammar specification.
    //
    // An important thing about these context concepts.  By default they are effectively inherited
    // while parsing through every grammar production.  i.e. if you don't change them, then when
    // you parse a sub-production, it will have the same context values as the parent production.
    // This is great most of the time.  After all, consider all the 'expression' grammar productions
    // and how nearly all of them pass along the 'in' and 'yield' context values:
    //
    // EqualityExpression[In, Yield] :
    //      RelationalExpression[?In, ?Yield]
    //      EqualityExpression[?In, ?Yield] == RelationalExpression[?In, ?Yield]
    //      EqualityExpression[?In, ?Yield] != RelationalExpression[?In, ?Yield]
    //      EqualityExpression[?In, ?Yield] === RelationalExpression[?In, ?Yield]
    //      EqualityExpression[?In, ?Yield] !== RelationalExpression[?In, ?Yield]
    //
    // Where you have to be careful is then understanding what the points are in the grammar
    // where the values are *not* passed along.  For example:
    //
    // SingleNameBinding[Yield,GeneratorParameter]
    //      [+GeneratorParameter]BindingIdentifier[Yield] Initializer[In]opt
    //      [~GeneratorParameter]BindingIdentifier[?Yield]Initializer[In, ?Yield]opt
    //
    // Here this is saying that if the GeneratorParameter context flag is set, that we should
    // explicitly set the 'yield' context flag to false before calling into the BindingIdentifier
    // and we should explicitly unset the 'yield' context flag before calling into the Initializer.
    // production.  Conversely, if the GeneratorParameter context flag is not set, then we
    // should leave the 'yield' context flag alone.
    //
    // Getting this all correct is tricky and requires careful reading of the grammar to
    // understand when these values should be changed versus when they should be inherited.
    //
    // Note: it should not be necessary to save/restore these flags during speculative/lookahead
    // parsing.  These context flags are naturally stored and restored through normal recursive
    // descent parsing and unwinding.
    var contextFlags;
    // Indicates whether we are currently parsing top-level statements.
    var topLevel = true;
    // Whether or not we've had a parse error since creating the last AST node.  If we have
    // encountered an error, it will be stored on the next AST node we create.  Parse errors
    // can be broken down into three categories:
    //
    // 1) An error that occurred during scanning.  For example, an unterminated literal, or a
    //    character that was completely not understood.
    //
    // 2) A token was expected, but was not present.  This type of error is commonly produced
    //    by the 'parseExpected' function.
    //
    // 3) A token was present that no parsing function was able to consume.  This type of error
    //    only occurs in the 'abortParsingListOrMoveToNextToken' function when the parser
    //    decides to skip the token.
    //
    // In all of these cases, we want to mark the next node as having had an error before it.
    // With this mark, we can know in incremental settings if this node can be reused, or if
    // we have to reparse it.  If we don't keep this information around, we may just reuse the
    // node.  in that event we would then not produce the same errors as we did before, causing
    // significant confusion problems.
    //
    // Note: it is necessary that this value be saved/restored during speculative/lookahead
    // parsing.  During lookahead parsing, we will often create a node.  That node will have
    // this value attached, and then this value will be set back to 'false'.  If we decide to
    // rewind, we must get back to the same value we had prior to the lookahead.
    //
    // Note: any errors at the end of the file that do not precede a regular node, should get
    // attached to the EOF token.
    var parseErrorBeforeNextFinishedNode = false;
    /* eslint-enable no-var */
    function parseSourceFile(fileName, sourceText, languageVersion, syntaxCursor, setParentNodes, scriptKind, setExternalModuleIndicatorOverride) {
        var _a;
        if (setParentNodes === void 0) { setParentNodes = false; }
        scriptKind = (0, ts_1.ensureScriptKind)(fileName, scriptKind);
        if (scriptKind === 6 /* ScriptKind.JSON */) {
            var result_1 = parseJsonText(fileName, sourceText, languageVersion, syntaxCursor, setParentNodes);
            (0, ts_1.convertToJson)(result_1, (_a = result_1.statements[0]) === null || _a === void 0 ? void 0 : _a.expression, result_1.parseDiagnostics, /*returnValue*/ false, /*jsonConversionNotifier*/ undefined);
            result_1.referencedFiles = ts_1.emptyArray;
            result_1.typeReferenceDirectives = ts_1.emptyArray;
            result_1.libReferenceDirectives = ts_1.emptyArray;
            result_1.amdDependencies = ts_1.emptyArray;
            result_1.hasNoDefaultLib = false;
            result_1.pragmas = ts_1.emptyMap;
            return result_1;
        }
        initializeState(fileName, sourceText, languageVersion, syntaxCursor, scriptKind);
        var result = parseSourceFileWorker(languageVersion, setParentNodes, scriptKind, setExternalModuleIndicatorOverride || setExternalModuleIndicator);
        clearState();
        return result;
    }
    Parser.parseSourceFile = parseSourceFile;
    function parseIsolatedEntityName(content, languageVersion) {
        // Choice of `isDeclarationFile` should be arbitrary
        initializeState("", content, languageVersion, /*syntaxCursor*/ undefined, 1 /* ScriptKind.JS */);
        // Prime the scanner.
        nextToken();
        var entityName = parseEntityName(/*allowReservedWords*/ true);
        var isInvalid = token() === 1 /* SyntaxKind.EndOfFileToken */ && !parseDiagnostics.length;
        clearState();
        return isInvalid ? entityName : undefined;
    }
    Parser.parseIsolatedEntityName = parseIsolatedEntityName;
    function parseJsonText(fileName, sourceText, languageVersion, syntaxCursor, setParentNodes) {
        if (languageVersion === void 0) { languageVersion = 2 /* ScriptTarget.ES2015 */; }
        if (setParentNodes === void 0) { setParentNodes = false; }
        initializeState(fileName, sourceText, languageVersion, syntaxCursor, 6 /* ScriptKind.JSON */);
        sourceFlags = contextFlags;
        // Prime the scanner.
        nextToken();
        var pos = getNodePos();
        var statements, endOfFileToken;
        if (token() === 1 /* SyntaxKind.EndOfFileToken */) {
            statements = createNodeArray([], pos, pos);
            endOfFileToken = parseTokenNode();
        }
        else {
            // Loop and synthesize an ArrayLiteralExpression if there are more than
            // one top-level expressions to ensure all input text is consumed.
            var expressions = void 0;
            while (token() !== 1 /* SyntaxKind.EndOfFileToken */) {
                var expression_1 = void 0;
                switch (token()) {
                    case 23 /* SyntaxKind.OpenBracketToken */:
                        expression_1 = parseArrayLiteralExpression();
                        break;
                    case 112 /* SyntaxKind.TrueKeyword */:
                    case 97 /* SyntaxKind.FalseKeyword */:
                    case 106 /* SyntaxKind.NullKeyword */:
                        expression_1 = parseTokenNode();
                        break;
                    case 41 /* SyntaxKind.MinusToken */:
                        if (lookAhead(function () { return nextToken() === 9 /* SyntaxKind.NumericLiteral */ && nextToken() !== 59 /* SyntaxKind.ColonToken */; })) {
                            expression_1 = parsePrefixUnaryExpression();
                        }
                        else {
                            expression_1 = parseObjectLiteralExpression();
                        }
                        break;
                    case 9 /* SyntaxKind.NumericLiteral */:
                    case 11 /* SyntaxKind.StringLiteral */:
                        if (lookAhead(function () { return nextToken() !== 59 /* SyntaxKind.ColonToken */; })) {
                            expression_1 = parseLiteralNode();
                            break;
                        }
                    // falls through
                    default:
                        expression_1 = parseObjectLiteralExpression();
                        break;
                }
                // Error recovery: collect multiple top-level expressions
                if (expressions && (0, ts_1.isArray)(expressions)) {
                    expressions.push(expression_1);
                }
                else if (expressions) {
                    expressions = [expressions, expression_1];
                }
                else {
                    expressions = expression_1;
                    if (token() !== 1 /* SyntaxKind.EndOfFileToken */) {
                        parseErrorAtCurrentToken(ts_1.Diagnostics.Unexpected_token);
                    }
                }
            }
            var expression = (0, ts_1.isArray)(expressions) ? finishNode(factoryCreateArrayLiteralExpression(expressions), pos) : ts_1.Debug.checkDefined(expressions);
            var statement = factoryCreateExpressionStatement(expression);
            finishNode(statement, pos);
            statements = createNodeArray([statement], pos);
            endOfFileToken = parseExpectedToken(1 /* SyntaxKind.EndOfFileToken */, ts_1.Diagnostics.Unexpected_token);
        }
        // Set source file so that errors will be reported with this file name
        var sourceFile = createSourceFile(fileName, 2 /* ScriptTarget.ES2015 */, 6 /* ScriptKind.JSON */, /*isDeclarationFile*/ false, statements, endOfFileToken, sourceFlags, ts_1.noop);
        if (setParentNodes) {
            fixupParentReferences(sourceFile);
        }
        sourceFile.nodeCount = nodeCount;
        sourceFile.identifierCount = identifierCount;
        sourceFile.identifiers = identifiers;
        sourceFile.parseDiagnostics = (0, ts_1.attachFileToDiagnostics)(parseDiagnostics, sourceFile);
        if (jsDocDiagnostics) {
            sourceFile.jsDocDiagnostics = (0, ts_1.attachFileToDiagnostics)(jsDocDiagnostics, sourceFile);
        }
        var result = sourceFile;
        clearState();
        return result;
    }
    Parser.parseJsonText = parseJsonText;
    function initializeState(_fileName, _sourceText, _languageVersion, _syntaxCursor, _scriptKind) {
        NodeConstructor = ts_1.objectAllocator.getNodeConstructor();
        TokenConstructor = ts_1.objectAllocator.getTokenConstructor();
        IdentifierConstructor = ts_1.objectAllocator.getIdentifierConstructor();
        PrivateIdentifierConstructor = ts_1.objectAllocator.getPrivateIdentifierConstructor();
        SourceFileConstructor = ts_1.objectAllocator.getSourceFileConstructor();
        fileName = (0, ts_1.normalizePath)(_fileName);
        sourceText = _sourceText;
        languageVersion = _languageVersion;
        syntaxCursor = _syntaxCursor;
        scriptKind = _scriptKind;
        languageVariant = (0, ts_1.getLanguageVariant)(_scriptKind);
        parseDiagnostics = [];
        parsingContext = 0;
        identifiers = new Map();
        identifierCount = 0;
        nodeCount = 0;
        sourceFlags = 0;
        topLevel = true;
        switch (scriptKind) {
            case 1 /* ScriptKind.JS */:
            case 2 /* ScriptKind.JSX */:
                contextFlags = 262144 /* NodeFlags.JavaScriptFile */;
                break;
            case 6 /* ScriptKind.JSON */:
                contextFlags = 262144 /* NodeFlags.JavaScriptFile */ | 67108864 /* NodeFlags.JsonFile */;
                break;
            default:
                contextFlags = 0 /* NodeFlags.None */;
                break;
        }
        parseErrorBeforeNextFinishedNode = false;
        // Initialize and prime the scanner before parsing the source elements.
        scanner.setText(sourceText);
        scanner.setOnError(scanError);
        scanner.setScriptTarget(languageVersion);
        scanner.setLanguageVariant(languageVariant);
    }
    function clearState() {
        // Clear out the text the scanner is pointing at, so it doesn't keep anything alive unnecessarily.
        scanner.clearCommentDirectives();
        scanner.setText("");
        scanner.setOnError(undefined);
        // Clear any data.  We don't want to accidentally hold onto it for too long.
        sourceText = undefined;
        languageVersion = undefined;
        syntaxCursor = undefined;
        scriptKind = undefined;
        languageVariant = undefined;
        sourceFlags = 0;
        parseDiagnostics = undefined;
        jsDocDiagnostics = undefined;
        parsingContext = 0;
        identifiers = undefined;
        notParenthesizedArrow = undefined;
        topLevel = true;
    }
    function parseSourceFileWorker(languageVersion, setParentNodes, scriptKind, setExternalModuleIndicator) {
        var isDeclarationFile = isDeclarationFileName(fileName);
        if (isDeclarationFile) {
            contextFlags |= 16777216 /* NodeFlags.Ambient */;
        }
        sourceFlags = contextFlags;
        // Prime the scanner.
        nextToken();
        var statements = parseList(0 /* ParsingContext.SourceElements */, parseStatement);
        ts_1.Debug.assert(token() === 1 /* SyntaxKind.EndOfFileToken */);
        var endOfFileToken = addJSDocComment(parseTokenNode());
        var sourceFile = createSourceFile(fileName, languageVersion, scriptKind, isDeclarationFile, statements, endOfFileToken, sourceFlags, setExternalModuleIndicator);
        // A member of ReadonlyArray<T> isn't assignable to a member of T[] (and prevents a direct cast) - but this is where we set up those members so they can be readonly in the future
        processCommentPragmas(sourceFile, sourceText);
        processPragmasIntoFields(sourceFile, reportPragmaDiagnostic);
        sourceFile.commentDirectives = scanner.getCommentDirectives();
        sourceFile.nodeCount = nodeCount;
        sourceFile.identifierCount = identifierCount;
        sourceFile.identifiers = identifiers;
        sourceFile.parseDiagnostics = (0, ts_1.attachFileToDiagnostics)(parseDiagnostics, sourceFile);
        if (jsDocDiagnostics) {
            sourceFile.jsDocDiagnostics = (0, ts_1.attachFileToDiagnostics)(jsDocDiagnostics, sourceFile);
        }
        if (setParentNodes) {
            fixupParentReferences(sourceFile);
        }
        return sourceFile;
        function reportPragmaDiagnostic(pos, end, diagnostic) {
            parseDiagnostics.push((0, ts_1.createDetachedDiagnostic)(fileName, pos, end, diagnostic));
        }
    }
    function withJSDoc(node, hasJSDoc) {
        return hasJSDoc ? addJSDocComment(node) : node;
    }
    var hasDeprecatedTag = false;
    function addJSDocComment(node) {
        ts_1.Debug.assert(!node.jsDoc); // Should only be called once per node
        var jsDoc = (0, ts_1.mapDefined)((0, ts_1.getJSDocCommentRanges)(node, sourceText), function (comment) { return JSDocParser.parseJSDocComment(node, comment.pos, comment.end - comment.pos); });
        if (jsDoc.length)
            node.jsDoc = jsDoc;
        if (hasDeprecatedTag) {
            hasDeprecatedTag = false;
            node.flags |= 268435456 /* NodeFlags.Deprecated */;
        }
        return node;
    }
    function reparseTopLevelAwait(sourceFile) {
        var savedSyntaxCursor = syntaxCursor;
        var baseSyntaxCursor = IncrementalParser.createSyntaxCursor(sourceFile);
        syntaxCursor = { currentNode: currentNode };
        var statements = [];
        var savedParseDiagnostics = parseDiagnostics;
        parseDiagnostics = [];
        var pos = 0;
        var start = findNextStatementWithAwait(sourceFile.statements, 0);
        var _loop_1 = function () {
            // append all statements between pos and start
            var prevStatement = sourceFile.statements[pos];
            var nextStatement = sourceFile.statements[start];
            (0, ts_1.addRange)(statements, sourceFile.statements, pos, start);
            pos = findNextStatementWithoutAwait(sourceFile.statements, start);
            // append all diagnostics associated with the copied range
            var diagnosticStart = (0, ts_1.findIndex)(savedParseDiagnostics, function (diagnostic) { return diagnostic.start >= prevStatement.pos; });
            var diagnosticEnd = diagnosticStart >= 0 ? (0, ts_1.findIndex)(savedParseDiagnostics, function (diagnostic) { return diagnostic.start >= nextStatement.pos; }, diagnosticStart) : -1;
            if (diagnosticStart >= 0) {
                (0, ts_1.addRange)(parseDiagnostics, savedParseDiagnostics, diagnosticStart, diagnosticEnd >= 0 ? diagnosticEnd : undefined);
            }
            // reparse all statements between start and pos. We skip existing diagnostics for the same range and allow the parser to generate new ones.
            speculationHelper(function () {
                var savedContextFlags = contextFlags;
                contextFlags |= 32768 /* NodeFlags.AwaitContext */;
                scanner.resetTokenState(nextStatement.pos);
                nextToken();
                while (token() !== 1 /* SyntaxKind.EndOfFileToken */) {
                    var startPos = scanner.getTokenFullStart();
                    var statement = parseListElement(0 /* ParsingContext.SourceElements */, parseStatement);
                    statements.push(statement);
                    if (startPos === scanner.getTokenFullStart()) {
                        nextToken();
                    }
                    if (pos >= 0) {
                        var nonAwaitStatement = sourceFile.statements[pos];
                        if (statement.end === nonAwaitStatement.pos) {
                            // done reparsing this section
                            break;
                        }
                        if (statement.end > nonAwaitStatement.pos) {
                            // we ate into the next statement, so we must reparse it.
                            pos = findNextStatementWithoutAwait(sourceFile.statements, pos + 1);
                        }
                    }
                }
                contextFlags = savedContextFlags;
            }, 2 /* SpeculationKind.Reparse */);
            // find the next statement containing an `await`
            start = pos >= 0 ? findNextStatementWithAwait(sourceFile.statements, pos) : -1;
        };
        while (start !== -1) {
            _loop_1();
        }
        // append all statements between pos and the end of the list
        if (pos >= 0) {
            var prevStatement_1 = sourceFile.statements[pos];
            (0, ts_1.addRange)(statements, sourceFile.statements, pos);
            // append all diagnostics associated with the copied range
            var diagnosticStart = (0, ts_1.findIndex)(savedParseDiagnostics, function (diagnostic) { return diagnostic.start >= prevStatement_1.pos; });
            if (diagnosticStart >= 0) {
                (0, ts_1.addRange)(parseDiagnostics, savedParseDiagnostics, diagnosticStart);
            }
        }
        syntaxCursor = savedSyntaxCursor;
        return factory.updateSourceFile(sourceFile, (0, ts_1.setTextRange)(factoryCreateNodeArray(statements), sourceFile.statements));
        function containsPossibleTopLevelAwait(node) {
            return !(node.flags & 32768 /* NodeFlags.AwaitContext */)
                && !!(node.transformFlags & 67108864 /* TransformFlags.ContainsPossibleTopLevelAwait */);
        }
        function findNextStatementWithAwait(statements, start) {
            for (var i = start; i < statements.length; i++) {
                if (containsPossibleTopLevelAwait(statements[i])) {
                    return i;
                }
            }
            return -1;
        }
        function findNextStatementWithoutAwait(statements, start) {
            for (var i = start; i < statements.length; i++) {
                if (!containsPossibleTopLevelAwait(statements[i])) {
                    return i;
                }
            }
            return -1;
        }
        function currentNode(position) {
            var node = baseSyntaxCursor.currentNode(position);
            if (topLevel && node && containsPossibleTopLevelAwait(node)) {
                node.intersectsChange = true;
            }
            return node;
        }
    }
    function fixupParentReferences(rootNode) {
        // normally parent references are set during binding. However, for clients that only need
        // a syntax tree, and no semantic features, then the binding process is an unnecessary
        // overhead.  This functions allows us to set all the parents, without all the expense of
        // binding.
        (0, ts_1.setParentRecursive)(rootNode, /*incremental*/ true);
    }
    Parser.fixupParentReferences = fixupParentReferences;
    function createSourceFile(fileName, languageVersion, scriptKind, isDeclarationFile, statements, endOfFileToken, flags, setExternalModuleIndicator) {
        // code from createNode is inlined here so createNode won't have to deal with special case of creating source files
        // this is quite rare comparing to other nodes and createNode should be as fast as possible
        var sourceFile = factory.createSourceFile(statements, endOfFileToken, flags);
        (0, ts_1.setTextRangePosWidth)(sourceFile, 0, sourceText.length);
        setFields(sourceFile);
        // If we parsed this as an external module, it may contain top-level await
        if (!isDeclarationFile && isExternalModule(sourceFile) && sourceFile.transformFlags & 67108864 /* TransformFlags.ContainsPossibleTopLevelAwait */) {
            sourceFile = reparseTopLevelAwait(sourceFile);
            setFields(sourceFile);
        }
        return sourceFile;
        function setFields(sourceFile) {
            sourceFile.text = sourceText;
            sourceFile.bindDiagnostics = [];
            sourceFile.bindSuggestionDiagnostics = undefined;
            sourceFile.languageVersion = languageVersion;
            sourceFile.fileName = fileName;
            sourceFile.languageVariant = (0, ts_1.getLanguageVariant)(scriptKind);
            sourceFile.isDeclarationFile = isDeclarationFile;
            sourceFile.scriptKind = scriptKind;
            setExternalModuleIndicator(sourceFile);
            sourceFile.setExternalModuleIndicator = setExternalModuleIndicator;
        }
    }
    function setContextFlag(val, flag) {
        if (val) {
            contextFlags |= flag;
        }
        else {
            contextFlags &= ~flag;
        }
    }
    function setDisallowInContext(val) {
        setContextFlag(val, 4096 /* NodeFlags.DisallowInContext */);
    }
    function setYieldContext(val) {
        setContextFlag(val, 8192 /* NodeFlags.YieldContext */);
    }
    function setDecoratorContext(val) {
        setContextFlag(val, 16384 /* NodeFlags.DecoratorContext */);
    }
    function setAwaitContext(val) {
        setContextFlag(val, 32768 /* NodeFlags.AwaitContext */);
    }
    function doOutsideOfContext(context, func) {
        // contextFlagsToClear will contain only the context flags that are
        // currently set that we need to temporarily clear
        // We don't just blindly reset to the previous flags to ensure
        // that we do not mutate cached flags for the incremental
        // parser (ThisNodeHasError, ThisNodeOrAnySubNodesHasError, and
        // HasAggregatedChildData).
        var contextFlagsToClear = context & contextFlags;
        if (contextFlagsToClear) {
            // clear the requested context flags
            setContextFlag(/*val*/ false, contextFlagsToClear);
            var result = func();
            // restore the context flags we just cleared
            setContextFlag(/*val*/ true, contextFlagsToClear);
            return result;
        }
        // no need to do anything special as we are not in any of the requested contexts
        return func();
    }
    function doInsideOfContext(context, func) {
        // contextFlagsToSet will contain only the context flags that
        // are not currently set that we need to temporarily enable.
        // We don't just blindly reset to the previous flags to ensure
        // that we do not mutate cached flags for the incremental
        // parser (ThisNodeHasError, ThisNodeOrAnySubNodesHasError, and
        // HasAggregatedChildData).
        var contextFlagsToSet = context & ~contextFlags;
        if (contextFlagsToSet) {
            // set the requested context flags
            setContextFlag(/*val*/ true, contextFlagsToSet);
            var result = func();
            // reset the context flags we just set
            setContextFlag(/*val*/ false, contextFlagsToSet);
            return result;
        }
        // no need to do anything special as we are already in all of the requested contexts
        return func();
    }
    function allowInAnd(func) {
        return doOutsideOfContext(4096 /* NodeFlags.DisallowInContext */, func);
    }
    function disallowInAnd(func) {
        return doInsideOfContext(4096 /* NodeFlags.DisallowInContext */, func);
    }
    function allowConditionalTypesAnd(func) {
        return doOutsideOfContext(65536 /* NodeFlags.DisallowConditionalTypesContext */, func);
    }
    function disallowConditionalTypesAnd(func) {
        return doInsideOfContext(65536 /* NodeFlags.DisallowConditionalTypesContext */, func);
    }
    function doInYieldContext(func) {
        return doInsideOfContext(8192 /* NodeFlags.YieldContext */, func);
    }
    function doInDecoratorContext(func) {
        return doInsideOfContext(16384 /* NodeFlags.DecoratorContext */, func);
    }
    function doInAwaitContext(func) {
        return doInsideOfContext(32768 /* NodeFlags.AwaitContext */, func);
    }
    function doOutsideOfAwaitContext(func) {
        return doOutsideOfContext(32768 /* NodeFlags.AwaitContext */, func);
    }
    function doInYieldAndAwaitContext(func) {
        return doInsideOfContext(8192 /* NodeFlags.YieldContext */ | 32768 /* NodeFlags.AwaitContext */, func);
    }
    function doOutsideOfYieldAndAwaitContext(func) {
        return doOutsideOfContext(8192 /* NodeFlags.YieldContext */ | 32768 /* NodeFlags.AwaitContext */, func);
    }
    function inContext(flags) {
        return (contextFlags & flags) !== 0;
    }
    function inYieldContext() {
        return inContext(8192 /* NodeFlags.YieldContext */);
    }
    function inDisallowInContext() {
        return inContext(4096 /* NodeFlags.DisallowInContext */);
    }
    function inDisallowConditionalTypesContext() {
        return inContext(65536 /* NodeFlags.DisallowConditionalTypesContext */);
    }
    function inDecoratorContext() {
        return inContext(16384 /* NodeFlags.DecoratorContext */);
    }
    function inAwaitContext() {
        return inContext(32768 /* NodeFlags.AwaitContext */);
    }
    function parseErrorAtCurrentToken(message) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        return parseErrorAt.apply(void 0, __spreadArray([scanner.getTokenStart(), scanner.getTokenEnd(), message], args, false));
    }
    function parseErrorAtPosition(start, length, message) {
        var args = [];
        for (var _i = 3; _i < arguments.length; _i++) {
            args[_i - 3] = arguments[_i];
        }
        // Don't report another error if it would just be at the same position as the last error.
        var lastError = (0, ts_1.lastOrUndefined)(parseDiagnostics);
        var result;
        if (!lastError || start !== lastError.start) {
            result = ts_1.createDetachedDiagnostic.apply(void 0, __spreadArray([fileName, start, length, message], args, false));
            parseDiagnostics.push(result);
        }
        // Mark that we've encountered an error.  We'll set an appropriate bit on the next
        // node we finish so that it can't be reused incrementally.
        parseErrorBeforeNextFinishedNode = true;
        return result;
    }
    function parseErrorAt(start, end, message) {
        var args = [];
        for (var _i = 3; _i < arguments.length; _i++) {
            args[_i - 3] = arguments[_i];
        }
        return parseErrorAtPosition.apply(void 0, __spreadArray([start, end - start, message], args, false));
    }
    function parseErrorAtRange(range, message) {
        var args = [];
        for (var _i = 2; _i < arguments.length; _i++) {
            args[_i - 2] = arguments[_i];
        }
        parseErrorAt.apply(void 0, __spreadArray([range.pos, range.end, message], args, false));
    }
    function scanError(message, length, arg0) {
        parseErrorAtPosition(scanner.getTokenEnd(), length, message, arg0);
    }
    function getNodePos() {
        return scanner.getTokenFullStart();
    }
    function hasPrecedingJSDocComment() {
        return scanner.hasPrecedingJSDocComment();
    }
    // Use this function to access the current token instead of reading the currentToken
    // variable. Since function results aren't narrowed in control flow analysis, this ensures
    // that the type checker doesn't make wrong assumptions about the type of the current
    // token (e.g. a call to nextToken() changes the current token but the checker doesn't
    // reason about this side effect).  Mainstream VMs inline simple functions like this, so
    // there is no performance penalty.
    function token() {
        return currentToken;
    }
    function nextTokenWithoutCheck() {
        return currentToken = scanner.scan();
    }
    function nextTokenAnd(func) {
        nextToken();
        return func();
    }
    function nextToken() {
        // if the keyword had an escape
        if ((0, ts_1.isKeyword)(currentToken) && (scanner.hasUnicodeEscape() || scanner.hasExtendedUnicodeEscape())) {
            // issue a parse error for the escape
            parseErrorAt(scanner.getTokenStart(), scanner.getTokenEnd(), ts_1.Diagnostics.Keywords_cannot_contain_escape_characters);
        }
        return nextTokenWithoutCheck();
    }
    function nextTokenJSDoc() {
        return currentToken = scanner.scanJsDocToken();
    }
    function nextJSDocCommentTextToken(inBackticks) {
        return currentToken = scanner.scanJSDocCommentTextToken(inBackticks);
    }
    function reScanGreaterToken() {
        return currentToken = scanner.reScanGreaterToken();
    }
    function reScanSlashToken() {
        return currentToken = scanner.reScanSlashToken();
    }
    function reScanTemplateToken(isTaggedTemplate) {
        return currentToken = scanner.reScanTemplateToken(isTaggedTemplate);
    }
    function reScanLessThanToken() {
        return currentToken = scanner.reScanLessThanToken();
    }
    function reScanHashToken() {
        return currentToken = scanner.reScanHashToken();
    }
    function scanJsxIdentifier() {
        return currentToken = scanner.scanJsxIdentifier();
    }
    function scanJsxText() {
        return currentToken = scanner.scanJsxToken();
    }
    function scanJsxAttributeValue() {
        return currentToken = scanner.scanJsxAttributeValue();
    }
    function speculationHelper(callback, speculationKind) {
        // Keep track of the state we'll need to rollback to if lookahead fails (or if the
        // caller asked us to always reset our state).
        var saveToken = currentToken;
        var saveParseDiagnosticsLength = parseDiagnostics.length;
        var saveParseErrorBeforeNextFinishedNode = parseErrorBeforeNextFinishedNode;
        // Note: it is not actually necessary to save/restore the context flags here.  That's
        // because the saving/restoring of these flags happens naturally through the recursive
        // descent nature of our parser.  However, we still store this here just so we can
        // assert that invariant holds.
        var saveContextFlags = contextFlags;
        // If we're only looking ahead, then tell the scanner to only lookahead as well.
        // Otherwise, if we're actually speculatively parsing, then tell the scanner to do the
        // same.
        var result = speculationKind !== 0 /* SpeculationKind.TryParse */
            ? scanner.lookAhead(callback)
            : scanner.tryScan(callback);
        ts_1.Debug.assert(saveContextFlags === contextFlags);
        // If our callback returned something 'falsy' or we're just looking ahead,
        // then unconditionally restore us to where we were.
        if (!result || speculationKind !== 0 /* SpeculationKind.TryParse */) {
            currentToken = saveToken;
            if (speculationKind !== 2 /* SpeculationKind.Reparse */) {
                parseDiagnostics.length = saveParseDiagnosticsLength;
            }
            parseErrorBeforeNextFinishedNode = saveParseErrorBeforeNextFinishedNode;
        }
        return result;
    }
    /** Invokes the provided callback then unconditionally restores the parser to the state it
     * was in immediately prior to invoking the callback.  The result of invoking the callback
     * is returned from this function.
     */
    function lookAhead(callback) {
        return speculationHelper(callback, 1 /* SpeculationKind.Lookahead */);
    }
    /** Invokes the provided callback.  If the callback returns something falsy, then it restores
     * the parser to the state it was in immediately prior to invoking the callback.  If the
     * callback returns something truthy, then the parser state is not rolled back.  The result
     * of invoking the callback is returned from this function.
     */
    function tryParse(callback) {
        return speculationHelper(callback, 0 /* SpeculationKind.TryParse */);
    }
    function isBindingIdentifier() {
        if (token() === 80 /* SyntaxKind.Identifier */) {
            return true;
        }
        // `let await`/`let yield` in [Yield] or [Await] are allowed here and disallowed in the binder.
        return token() > 118 /* SyntaxKind.LastReservedWord */;
    }
    // Ignore strict mode flag because we will report an error in type checker instead.
    function isIdentifier() {
        if (token() === 80 /* SyntaxKind.Identifier */) {
            return true;
        }
        // If we have a 'yield' keyword, and we're in the [yield] context, then 'yield' is
        // considered a keyword and is not an identifier.
        if (token() === 127 /* SyntaxKind.YieldKeyword */ && inYieldContext()) {
            return false;
        }
        // If we have a 'await' keyword, and we're in the [Await] context, then 'await' is
        // considered a keyword and is not an identifier.
        if (token() === 135 /* SyntaxKind.AwaitKeyword */ && inAwaitContext()) {
            return false;
        }
        return token() > 118 /* SyntaxKind.LastReservedWord */;
    }
    function parseExpected(kind, diagnosticMessage, shouldAdvance) {
        if (shouldAdvance === void 0) { shouldAdvance = true; }
        if (token() === kind) {
            if (shouldAdvance) {
                nextToken();
            }
            return true;
        }
        // Report specific message if provided with one.  Otherwise, report generic fallback message.
        if (diagnosticMessage) {
            parseErrorAtCurrentToken(diagnosticMessage);
        }
        else {
            parseErrorAtCurrentToken(ts_1.Diagnostics._0_expected, (0, ts_1.tokenToString)(kind));
        }
        return false;
    }
    var viableKeywordSuggestions = Object.keys(ts_1.textToKeywordObj).filter(function (keyword) { return keyword.length > 2; });
    /**
     * Provides a better error message than the generic "';' expected" if possible for
     * known common variants of a missing semicolon, such as from a mispelled names.
     *
     * @param node Node preceding the expected semicolon location.
     */
    function parseErrorForMissingSemicolonAfter(node) {
        var _a;
        // Tagged template literals are sometimes used in places where only simple strings are allowed, i.e.:
        //   module `M1` {
        //   ^^^^^^^^^^^ This block is parsed as a template literal like module`M1`.
        if ((0, ts_1.isTaggedTemplateExpression)(node)) {
            parseErrorAt((0, ts_1.skipTrivia)(sourceText, node.template.pos), node.template.end, ts_1.Diagnostics.Module_declaration_names_may_only_use_or_quoted_strings);
            return;
        }
        // Otherwise, if this isn't a well-known keyword-like identifier, give the generic fallback message.
        var expressionText = (0, ts_1.isIdentifier)(node) ? (0, ts_1.idText)(node) : undefined;
        if (!expressionText || !(0, ts_1.isIdentifierText)(expressionText, languageVersion)) {
            parseErrorAtCurrentToken(ts_1.Diagnostics._0_expected, (0, ts_1.tokenToString)(27 /* SyntaxKind.SemicolonToken */));
            return;
        }
        var pos = (0, ts_1.skipTrivia)(sourceText, node.pos);
        // Some known keywords are likely signs of syntax being used improperly.
        switch (expressionText) {
            case "const":
            case "let":
            case "var":
                parseErrorAt(pos, node.end, ts_1.Diagnostics.Variable_declaration_not_allowed_at_this_location);
                return;
            case "declare":
                // If a declared node failed to parse, it would have emitted a diagnostic already.
                return;
            case "interface":
                parseErrorForInvalidName(ts_1.Diagnostics.Interface_name_cannot_be_0, ts_1.Diagnostics.Interface_must_be_given_a_name, 19 /* SyntaxKind.OpenBraceToken */);
                return;
            case "is":
                parseErrorAt(pos, scanner.getTokenStart(), ts_1.Diagnostics.A_type_predicate_is_only_allowed_in_return_type_position_for_functions_and_methods);
                return;
            case "module":
            case "namespace":
                parseErrorForInvalidName(ts_1.Diagnostics.Namespace_name_cannot_be_0, ts_1.Diagnostics.Namespace_must_be_given_a_name, 19 /* SyntaxKind.OpenBraceToken */);
                return;
            case "type":
                parseErrorForInvalidName(ts_1.Diagnostics.Type_alias_name_cannot_be_0, ts_1.Diagnostics.Type_alias_must_be_given_a_name, 64 /* SyntaxKind.EqualsToken */);
                return;
        }
        // The user alternatively might have misspelled or forgotten to add a space after a common keyword.
        var suggestion = (_a = (0, ts_1.getSpellingSuggestion)(expressionText, viableKeywordSuggestions, function (n) { return n; })) !== null && _a !== void 0 ? _a : getSpaceSuggestion(expressionText);
        if (suggestion) {
            parseErrorAt(pos, node.end, ts_1.Diagnostics.Unknown_keyword_or_identifier_Did_you_mean_0, suggestion);
            return;
        }
        // Unknown tokens are handled with their own errors in the scanner
        if (token() === 0 /* SyntaxKind.Unknown */) {
            return;
        }
        // Otherwise, we know this some kind of unknown word, not just a missing expected semicolon.
        parseErrorAt(pos, node.end, ts_1.Diagnostics.Unexpected_keyword_or_identifier);
    }
    /**
     * Reports a diagnostic error for the current token being an invalid name.
     *
     * @param blankDiagnostic Diagnostic to report for the case of the name being blank (matched tokenIfBlankName).
     * @param nameDiagnostic Diagnostic to report for all other cases.
     * @param tokenIfBlankName Current token if the name was invalid for being blank (not provided / skipped).
     */
    function parseErrorForInvalidName(nameDiagnostic, blankDiagnostic, tokenIfBlankName) {
        if (token() === tokenIfBlankName) {
            parseErrorAtCurrentToken(blankDiagnostic);
        }
        else {
            parseErrorAtCurrentToken(nameDiagnostic, scanner.getTokenValue());
        }
    }
    function getSpaceSuggestion(expressionText) {
        for (var _i = 0, viableKeywordSuggestions_1 = viableKeywordSuggestions; _i < viableKeywordSuggestions_1.length; _i++) {
            var keyword = viableKeywordSuggestions_1[_i];
            if (expressionText.length > keyword.length + 2 && (0, ts_1.startsWith)(expressionText, keyword)) {
                return "".concat(keyword, " ").concat(expressionText.slice(keyword.length));
            }
        }
        return undefined;
    }
    function parseSemicolonAfterPropertyName(name, type, initializer) {
        if (token() === 60 /* SyntaxKind.AtToken */ && !scanner.hasPrecedingLineBreak()) {
            parseErrorAtCurrentToken(ts_1.Diagnostics.Decorators_must_precede_the_name_and_all_keywords_of_property_declarations);
            return;
        }
        if (token() === 21 /* SyntaxKind.OpenParenToken */) {
            parseErrorAtCurrentToken(ts_1.Diagnostics.Cannot_start_a_function_call_in_a_type_annotation);
            nextToken();
            return;
        }
        if (type && !canParseSemicolon()) {
            if (initializer) {
                parseErrorAtCurrentToken(ts_1.Diagnostics._0_expected, (0, ts_1.tokenToString)(27 /* SyntaxKind.SemicolonToken */));
            }
            else {
                parseErrorAtCurrentToken(ts_1.Diagnostics.Expected_for_property_initializer);
            }
            return;
        }
        if (tryParseSemicolon()) {
            return;
        }
        if (initializer) {
            parseErrorAtCurrentToken(ts_1.Diagnostics._0_expected, (0, ts_1.tokenToString)(27 /* SyntaxKind.SemicolonToken */));
            return;
        }
        parseErrorForMissingSemicolonAfter(name);
    }
    function parseExpectedJSDoc(kind) {
        if (token() === kind) {
            nextTokenJSDoc();
            return true;
        }
        ts_1.Debug.assert((0, ts_1.isKeywordOrPunctuation)(kind));
        parseErrorAtCurrentToken(ts_1.Diagnostics._0_expected, (0, ts_1.tokenToString)(kind));
        return false;
    }
    function parseExpectedMatchingBrackets(openKind, closeKind, openParsed, openPosition) {
        if (token() === closeKind) {
            nextToken();
            return;
        }
        var lastError = parseErrorAtCurrentToken(ts_1.Diagnostics._0_expected, (0, ts_1.tokenToString)(closeKind));
        if (!openParsed) {
            return;
        }
        if (lastError) {
            (0, ts_1.addRelatedInfo)(lastError, (0, ts_1.createDetachedDiagnostic)(fileName, openPosition, 1, ts_1.Diagnostics.The_parser_expected_to_find_a_1_to_match_the_0_token_here, (0, ts_1.tokenToString)(openKind), (0, ts_1.tokenToString)(closeKind)));
        }
    }
    function parseOptional(t) {
        if (token() === t) {
            nextToken();
            return true;
        }
        return false;
    }
    function parseOptionalToken(t) {
        if (token() === t) {
            return parseTokenNode();
        }
        return undefined;
    }
    function parseOptionalTokenJSDoc(t) {
        if (token() === t) {
            return parseTokenNodeJSDoc();
        }
        return undefined;
    }
    function parseExpectedToken(t, diagnosticMessage, arg0) {
        return parseOptionalToken(t) ||
            createMissingNode(t, /*reportAtCurrentPosition*/ false, diagnosticMessage || ts_1.Diagnostics._0_expected, arg0 || (0, ts_1.tokenToString)(t));
    }
    function parseExpectedTokenJSDoc(t) {
        var optional = parseOptionalTokenJSDoc(t);
        if (optional)
            return optional;
        ts_1.Debug.assert((0, ts_1.isKeywordOrPunctuation)(t));
        return createMissingNode(t, /*reportAtCurrentPosition*/ false, ts_1.Diagnostics._0_expected, (0, ts_1.tokenToString)(t));
    }
    function parseTokenNode() {
        var pos = getNodePos();
        var kind = token();
        nextToken();
        return finishNode(factoryCreateToken(kind), pos);
    }
    function parseTokenNodeJSDoc() {
        var pos = getNodePos();
        var kind = token();
        nextTokenJSDoc();
        return finishNode(factoryCreateToken(kind), pos);
    }
    function canParseSemicolon() {
        // If there's a real semicolon, then we can always parse it out.
        if (token() === 27 /* SyntaxKind.SemicolonToken */) {
            return true;
        }
        // We can parse out an optional semicolon in ASI cases in the following cases.
        return token() === 20 /* SyntaxKind.CloseBraceToken */ || token() === 1 /* SyntaxKind.EndOfFileToken */ || scanner.hasPrecedingLineBreak();
    }
    function tryParseSemicolon() {
        if (!canParseSemicolon()) {
            return false;
        }
        if (token() === 27 /* SyntaxKind.SemicolonToken */) {
            // consume the semicolon if it was explicitly provided.
            nextToken();
        }
        return true;
    }
    function parseSemicolon() {
        return tryParseSemicolon() || parseExpected(27 /* SyntaxKind.SemicolonToken */);
    }
    function createNodeArray(elements, pos, end, hasTrailingComma) {
        var array = factoryCreateNodeArray(elements, hasTrailingComma);
        (0, ts_1.setTextRangePosEnd)(array, pos, end !== null && end !== void 0 ? end : scanner.getTokenFullStart());
        return array;
    }
    function finishNode(node, pos, end) {
        (0, ts_1.setTextRangePosEnd)(node, pos, end !== null && end !== void 0 ? end : scanner.getTokenFullStart());
        if (contextFlags) {
            node.flags |= contextFlags;
        }
        // Keep track on the node if we encountered an error while parsing it.  If we did, then
        // we cannot reuse the node incrementally.  Once we've marked this node, clear out the
        // flag so that we don't mark any subsequent nodes.
        if (parseErrorBeforeNextFinishedNode) {
            parseErrorBeforeNextFinishedNode = false;
            node.flags |= 131072 /* NodeFlags.ThisNodeHasError */;
        }
        return node;
    }
    function createMissingNode(kind, reportAtCurrentPosition, diagnosticMessage) {
        var args = [];
        for (var _i = 3; _i < arguments.length; _i++) {
            args[_i - 3] = arguments[_i];
        }
        if (reportAtCurrentPosition) {
            parseErrorAtPosition.apply(void 0, __spreadArray([scanner.getTokenFullStart(), 0, diagnosticMessage], args, false));
        }
        else if (diagnosticMessage) {
            parseErrorAtCurrentToken.apply(void 0, __spreadArray([diagnosticMessage], args, false));
        }
        var pos = getNodePos();
        var result = kind === 80 /* SyntaxKind.Identifier */ ? factoryCreateIdentifier("", /*originalKeywordKind*/ undefined) :
            (0, ts_1.isTemplateLiteralKind)(kind) ? factory.createTemplateLiteralLikeNode(kind, "", "", /*templateFlags*/ undefined) :
                kind === 9 /* SyntaxKind.NumericLiteral */ ? factoryCreateNumericLiteral("", /*numericLiteralFlags*/ undefined) :
                    kind === 11 /* SyntaxKind.StringLiteral */ ? factoryCreateStringLiteral("", /*isSingleQuote*/ undefined) :
                        kind === 281 /* SyntaxKind.MissingDeclaration */ ? factory.createMissingDeclaration() :
                            factoryCreateToken(kind);
        return finishNode(result, pos);
    }
    function internIdentifier(text) {
        var identifier = identifiers.get(text);
        if (identifier === undefined) {
            identifiers.set(text, identifier = text);
        }
        return identifier;
    }
    // An identifier that starts with two underscores has an extra underscore character prepended to it to avoid issues
    // with magic property names like '__proto__'. The 'identifiers' object is used to share a single string instance for
    // each identifier in order to reduce memory consumption.
    function createIdentifier(isIdentifier, diagnosticMessage, privateIdentifierDiagnosticMessage) {
        if (isIdentifier) {
            identifierCount++;
            var pos = getNodePos();
            // Store original token kind if it is not just an Identifier so we can report appropriate error later in type checker
            var originalKeywordKind = token();
            var text = internIdentifier(scanner.getTokenValue());
            var hasExtendedUnicodeEscape = scanner.hasExtendedUnicodeEscape();
            nextTokenWithoutCheck();
            return finishNode(factoryCreateIdentifier(text, originalKeywordKind, hasExtendedUnicodeEscape), pos);
        }
        if (token() === 81 /* SyntaxKind.PrivateIdentifier */) {
            parseErrorAtCurrentToken(privateIdentifierDiagnosticMessage || ts_1.Diagnostics.Private_identifiers_are_not_allowed_outside_class_bodies);
            return createIdentifier(/*isIdentifier*/ true);
        }
        if (token() === 0 /* SyntaxKind.Unknown */ && scanner.tryScan(function () { return scanner.reScanInvalidIdentifier() === 80 /* SyntaxKind.Identifier */; })) {
            // Scanner has already recorded an 'Invalid character' error, so no need to add another from the parser.
            return createIdentifier(/*isIdentifier*/ true);
        }
        identifierCount++;
        // Only for end of file because the error gets reported incorrectly on embedded script tags.
        var reportAtCurrentPosition = token() === 1 /* SyntaxKind.EndOfFileToken */;
        var isReservedWord = scanner.isReservedWord();
        var msgArg = scanner.getTokenText();
        var defaultMessage = isReservedWord ?
            ts_1.Diagnostics.Identifier_expected_0_is_a_reserved_word_that_cannot_be_used_here :
            ts_1.Diagnostics.Identifier_expected;
        return createMissingNode(80 /* SyntaxKind.Identifier */, reportAtCurrentPosition, diagnosticMessage || defaultMessage, msgArg);
    }
    function parseBindingIdentifier(privateIdentifierDiagnosticMessage) {
        return createIdentifier(isBindingIdentifier(), /*diagnosticMessage*/ undefined, privateIdentifierDiagnosticMessage);
    }
    function parseIdentifier(diagnosticMessage, privateIdentifierDiagnosticMessage) {
        return createIdentifier(isIdentifier(), diagnosticMessage, privateIdentifierDiagnosticMessage);
    }
    function parseIdentifierName(diagnosticMessage) {
        return createIdentifier((0, ts_1.tokenIsIdentifierOrKeyword)(token()), diagnosticMessage);
    }
    function isLiteralPropertyName() {
        return (0, ts_1.tokenIsIdentifierOrKeyword)(token()) ||
            token() === 11 /* SyntaxKind.StringLiteral */ ||
            token() === 9 /* SyntaxKind.NumericLiteral */;
    }
    function isAssertionKey() {
        return (0, ts_1.tokenIsIdentifierOrKeyword)(token()) ||
            token() === 11 /* SyntaxKind.StringLiteral */;
    }
    function parsePropertyNameWorker(allowComputedPropertyNames) {
        if (token() === 11 /* SyntaxKind.StringLiteral */ || token() === 9 /* SyntaxKind.NumericLiteral */) {
            var node = parseLiteralNode();
            node.text = internIdentifier(node.text);
            return node;
        }
        if (allowComputedPropertyNames && token() === 23 /* SyntaxKind.OpenBracketToken */) {
            return parseComputedPropertyName();
        }
        if (token() === 81 /* SyntaxKind.PrivateIdentifier */) {
            return parsePrivateIdentifier();
        }
        return parseIdentifierName();
    }
    function parsePropertyName() {
        return parsePropertyNameWorker(/*allowComputedPropertyNames*/ true);
    }
    function parseComputedPropertyName() {
        // PropertyName [Yield]:
        //      LiteralPropertyName
        //      ComputedPropertyName[?Yield]
        var pos = getNodePos();
        parseExpected(23 /* SyntaxKind.OpenBracketToken */);
        // We parse any expression (including a comma expression). But the grammar
        // says that only an assignment expression is allowed, so the grammar checker
        // will error if it sees a comma expression.
        var expression = allowInAnd(parseExpression);
        parseExpected(24 /* SyntaxKind.CloseBracketToken */);
        return finishNode(factory.createComputedPropertyName(expression), pos);
    }
    function parsePrivateIdentifier() {
        var pos = getNodePos();
        var node = factoryCreatePrivateIdentifier(internIdentifier(scanner.getTokenValue()));
        nextToken();
        return finishNode(node, pos);
    }
    function parseContextualModifier(t) {
        return token() === t && tryParse(nextTokenCanFollowModifier);
    }
    function nextTokenIsOnSameLineAndCanFollowModifier() {
        nextToken();
        if (scanner.hasPrecedingLineBreak()) {
            return false;
        }
        return canFollowModifier();
    }
    function nextTokenCanFollowModifier() {
        switch (token()) {
            case 87 /* SyntaxKind.ConstKeyword */:
                // 'const' is only a modifier if followed by 'enum'.
                return nextToken() === 94 /* SyntaxKind.EnumKeyword */;
            case 95 /* SyntaxKind.ExportKeyword */:
                nextToken();
                if (token() === 90 /* SyntaxKind.DefaultKeyword */) {
                    return lookAhead(nextTokenCanFollowDefaultKeyword);
                }
                if (token() === 156 /* SyntaxKind.TypeKeyword */) {
                    return lookAhead(nextTokenCanFollowExportModifier);
                }
                return canFollowExportModifier();
            case 90 /* SyntaxKind.DefaultKeyword */:
                return nextTokenCanFollowDefaultKeyword();
            case 126 /* SyntaxKind.StaticKeyword */:
            case 139 /* SyntaxKind.GetKeyword */:
            case 153 /* SyntaxKind.SetKeyword */:
                nextToken();
                return canFollowModifier();
            default:
                return nextTokenIsOnSameLineAndCanFollowModifier();
        }
    }
    function canFollowExportModifier() {
        return token() === 60 /* SyntaxKind.AtToken */
            || token() !== 42 /* SyntaxKind.AsteriskToken */
                && token() !== 130 /* SyntaxKind.AsKeyword */
                && token() !== 19 /* SyntaxKind.OpenBraceToken */
                && canFollowModifier();
    }
    function nextTokenCanFollowExportModifier() {
        nextToken();
        return canFollowExportModifier();
    }
    function parseAnyContextualModifier() {
        return (0, ts_1.isModifierKind)(token()) && tryParse(nextTokenCanFollowModifier);
    }
    function canFollowModifier() {
        return token() === 23 /* SyntaxKind.OpenBracketToken */
            || token() === 19 /* SyntaxKind.OpenBraceToken */
            || token() === 42 /* SyntaxKind.AsteriskToken */
            || token() === 26 /* SyntaxKind.DotDotDotToken */
            || isLiteralPropertyName();
    }
    function nextTokenCanFollowDefaultKeyword() {
        nextToken();
        return token() === 86 /* SyntaxKind.ClassKeyword */
            || token() === 100 /* SyntaxKind.FunctionKeyword */
            || token() === 120 /* SyntaxKind.InterfaceKeyword */
            || token() === 60 /* SyntaxKind.AtToken */
            || (token() === 128 /* SyntaxKind.AbstractKeyword */ && lookAhead(nextTokenIsClassKeywordOnSameLine))
            || (token() === 134 /* SyntaxKind.AsyncKeyword */ && lookAhead(nextTokenIsFunctionKeywordOnSameLine));
    }
    // True if positioned at the start of a list element
    function isListElement(parsingContext, inErrorRecovery) {
        var node = currentNode(parsingContext);
        if (node) {
            return true;
        }
        switch (parsingContext) {
            case 0 /* ParsingContext.SourceElements */:
            case 1 /* ParsingContext.BlockStatements */:
            case 3 /* ParsingContext.SwitchClauseStatements */:
                // If we're in error recovery, then we don't want to treat ';' as an empty statement.
                // The problem is that ';' can show up in far too many contexts, and if we see one
                // and assume it's a statement, then we may bail out inappropriately from whatever
                // we're parsing.  For example, if we have a semicolon in the middle of a class, then
                // we really don't want to assume the class is over and we're on a statement in the
                // outer module.  We just want to consume and move on.
                return !(token() === 27 /* SyntaxKind.SemicolonToken */ && inErrorRecovery) && isStartOfStatement();
            case 2 /* ParsingContext.SwitchClauses */:
                return token() === 84 /* SyntaxKind.CaseKeyword */ || token() === 90 /* SyntaxKind.DefaultKeyword */;
            case 4 /* ParsingContext.TypeMembers */:
                return lookAhead(isTypeMemberStart);
            case 5 /* ParsingContext.ClassMembers */:
                // We allow semicolons as class elements (as specified by ES6) as long as we're
                // not in error recovery.  If we're in error recovery, we don't want an errant
                // semicolon to be treated as a class member (since they're almost always used
                // for statements.
                return lookAhead(isClassMemberStart) || (token() === 27 /* SyntaxKind.SemicolonToken */ && !inErrorRecovery);
            case 6 /* ParsingContext.EnumMembers */:
                // Include open bracket computed properties. This technically also lets in indexers,
                // which would be a candidate for improved error reporting.
                return token() === 23 /* SyntaxKind.OpenBracketToken */ || isLiteralPropertyName();
            case 12 /* ParsingContext.ObjectLiteralMembers */:
                switch (token()) {
                    case 23 /* SyntaxKind.OpenBracketToken */:
                    case 42 /* SyntaxKind.AsteriskToken */:
                    case 26 /* SyntaxKind.DotDotDotToken */:
                    case 25 /* SyntaxKind.DotToken */: // Not an object literal member, but don't want to close the object (see `tests/cases/fourslash/completionsDotInObjectLiteral.ts`)
                        return true;
                    default:
                        return isLiteralPropertyName();
                }
            case 18 /* ParsingContext.RestProperties */:
                return isLiteralPropertyName();
            case 9 /* ParsingContext.ObjectBindingElements */:
                return token() === 23 /* SyntaxKind.OpenBracketToken */ || token() === 26 /* SyntaxKind.DotDotDotToken */ || isLiteralPropertyName();
            case 24 /* ParsingContext.AssertEntries */:
                return isAssertionKey();
            case 7 /* ParsingContext.HeritageClauseElement */:
                // If we see `{ ... }` then only consume it as an expression if it is followed by `,` or `{`
                // That way we won't consume the body of a class in its heritage clause.
                if (token() === 19 /* SyntaxKind.OpenBraceToken */) {
                    return lookAhead(isValidHeritageClauseObjectLiteral);
                }
                if (!inErrorRecovery) {
                    return isStartOfLeftHandSideExpression() && !isHeritageClauseExtendsOrImplementsKeyword();
                }
                else {
                    // If we're in error recovery we tighten up what we're willing to match.
                    // That way we don't treat something like "this" as a valid heritage clause
                    // element during recovery.
                    return isIdentifier() && !isHeritageClauseExtendsOrImplementsKeyword();
                }
            case 8 /* ParsingContext.VariableDeclarations */:
                return isBindingIdentifierOrPrivateIdentifierOrPattern();
            case 10 /* ParsingContext.ArrayBindingElements */:
                return token() === 28 /* SyntaxKind.CommaToken */ || token() === 26 /* SyntaxKind.DotDotDotToken */ || isBindingIdentifierOrPrivateIdentifierOrPattern();
            case 19 /* ParsingContext.TypeParameters */:
                return token() === 103 /* SyntaxKind.InKeyword */ || token() === 87 /* SyntaxKind.ConstKeyword */ || isIdentifier();
            case 15 /* ParsingContext.ArrayLiteralMembers */:
                switch (token()) {
                    case 28 /* SyntaxKind.CommaToken */:
                    case 25 /* SyntaxKind.DotToken */: // Not an array literal member, but don't want to close the array (see `tests/cases/fourslash/completionsDotInArrayLiteralInObjectLiteral.ts`)
                        return true;
                }
            // falls through
            case 11 /* ParsingContext.ArgumentExpressions */:
                return token() === 26 /* SyntaxKind.DotDotDotToken */ || isStartOfExpression();
            case 16 /* ParsingContext.Parameters */:
                return isStartOfParameter(/*isJSDocParameter*/ false);
            case 17 /* ParsingContext.JSDocParameters */:
                return isStartOfParameter(/*isJSDocParameter*/ true);
            case 20 /* ParsingContext.TypeArguments */:
            case 21 /* ParsingContext.TupleElementTypes */:
                return token() === 28 /* SyntaxKind.CommaToken */ || isStartOfType();
            case 22 /* ParsingContext.HeritageClauses */:
                return isHeritageClause();
            case 23 /* ParsingContext.ImportOrExportSpecifiers */:
                return (0, ts_1.tokenIsIdentifierOrKeyword)(token());
            case 13 /* ParsingContext.JsxAttributes */:
                return (0, ts_1.tokenIsIdentifierOrKeyword)(token()) || token() === 19 /* SyntaxKind.OpenBraceToken */;
            case 14 /* ParsingContext.JsxChildren */:
                return true;
            case 25 /* ParsingContext.JSDocComment */:
                return true;
            case 26 /* ParsingContext.Count */:
                return ts_1.Debug.fail("ParsingContext.Count used as a context"); // Not a real context, only a marker.
            default:
                ts_1.Debug.assertNever(parsingContext, "Non-exhaustive case in 'isListElement'.");
        }
    }
    function isValidHeritageClauseObjectLiteral() {
        ts_1.Debug.assert(token() === 19 /* SyntaxKind.OpenBraceToken */);
        if (nextToken() === 20 /* SyntaxKind.CloseBraceToken */) {
            // if we see "extends {}" then only treat the {} as what we're extending (and not
            // the class body) if we have:
            //
            //      extends {} {
            //      extends {},
            //      extends {} extends
            //      extends {} implements
            var next = nextToken();
            return next === 28 /* SyntaxKind.CommaToken */ || next === 19 /* SyntaxKind.OpenBraceToken */ || next === 96 /* SyntaxKind.ExtendsKeyword */ || next === 119 /* SyntaxKind.ImplementsKeyword */;
        }
        return true;
    }
    function nextTokenIsIdentifier() {
        nextToken();
        return isIdentifier();
    }
    function nextTokenIsIdentifierOrKeyword() {
        nextToken();
        return (0, ts_1.tokenIsIdentifierOrKeyword)(token());
    }
    function nextTokenIsIdentifierOrKeywordOrGreaterThan() {
        nextToken();
        return (0, ts_1.tokenIsIdentifierOrKeywordOrGreaterThan)(token());
    }
    function isHeritageClauseExtendsOrImplementsKeyword() {
        if (token() === 119 /* SyntaxKind.ImplementsKeyword */ ||
            token() === 96 /* SyntaxKind.ExtendsKeyword */) {
            return lookAhead(nextTokenIsStartOfExpression);
        }
        return false;
    }
    function nextTokenIsStartOfExpression() {
        nextToken();
        return isStartOfExpression();
    }
    function nextTokenIsStartOfType() {
        nextToken();
        return isStartOfType();
    }
    // True if positioned at a list terminator
    function isListTerminator(kind) {
        if (token() === 1 /* SyntaxKind.EndOfFileToken */) {
            // Being at the end of the file ends all lists.
            return true;
        }
        switch (kind) {
            case 1 /* ParsingContext.BlockStatements */:
            case 2 /* ParsingContext.SwitchClauses */:
            case 4 /* ParsingContext.TypeMembers */:
            case 5 /* ParsingContext.ClassMembers */:
            case 6 /* ParsingContext.EnumMembers */:
            case 12 /* ParsingContext.ObjectLiteralMembers */:
            case 9 /* ParsingContext.ObjectBindingElements */:
            case 23 /* ParsingContext.ImportOrExportSpecifiers */:
            case 24 /* ParsingContext.AssertEntries */:
                return token() === 20 /* SyntaxKind.CloseBraceToken */;
            case 3 /* ParsingContext.SwitchClauseStatements */:
                return token() === 20 /* SyntaxKind.CloseBraceToken */ || token() === 84 /* SyntaxKind.CaseKeyword */ || token() === 90 /* SyntaxKind.DefaultKeyword */;
            case 7 /* ParsingContext.HeritageClauseElement */:
                return token() === 19 /* SyntaxKind.OpenBraceToken */ || token() === 96 /* SyntaxKind.ExtendsKeyword */ || token() === 119 /* SyntaxKind.ImplementsKeyword */;
            case 8 /* ParsingContext.VariableDeclarations */:
                return isVariableDeclaratorListTerminator();
            case 19 /* ParsingContext.TypeParameters */:
                // Tokens other than '>' are here for better error recovery
                return token() === 32 /* SyntaxKind.GreaterThanToken */ || token() === 21 /* SyntaxKind.OpenParenToken */ || token() === 19 /* SyntaxKind.OpenBraceToken */ || token() === 96 /* SyntaxKind.ExtendsKeyword */ || token() === 119 /* SyntaxKind.ImplementsKeyword */;
            case 11 /* ParsingContext.ArgumentExpressions */:
                // Tokens other than ')' are here for better error recovery
                return token() === 22 /* SyntaxKind.CloseParenToken */ || token() === 27 /* SyntaxKind.SemicolonToken */;
            case 15 /* ParsingContext.ArrayLiteralMembers */:
            case 21 /* ParsingContext.TupleElementTypes */:
            case 10 /* ParsingContext.ArrayBindingElements */:
                return token() === 24 /* SyntaxKind.CloseBracketToken */;
            case 17 /* ParsingContext.JSDocParameters */:
            case 16 /* ParsingContext.Parameters */:
            case 18 /* ParsingContext.RestProperties */:
                // Tokens other than ')' and ']' (the latter for index signatures) are here for better error recovery
                return token() === 22 /* SyntaxKind.CloseParenToken */ || token() === 24 /* SyntaxKind.CloseBracketToken */ /*|| token === SyntaxKind.OpenBraceToken*/;
            case 20 /* ParsingContext.TypeArguments */:
                // All other tokens should cause the type-argument to terminate except comma token
                return token() !== 28 /* SyntaxKind.CommaToken */;
            case 22 /* ParsingContext.HeritageClauses */:
                return token() === 19 /* SyntaxKind.OpenBraceToken */ || token() === 20 /* SyntaxKind.CloseBraceToken */;
            case 13 /* ParsingContext.JsxAttributes */:
                return token() === 32 /* SyntaxKind.GreaterThanToken */ || token() === 44 /* SyntaxKind.SlashToken */;
            case 14 /* ParsingContext.JsxChildren */:
                return token() === 30 /* SyntaxKind.LessThanToken */ && lookAhead(nextTokenIsSlash);
            default:
                return false;
        }
    }
    function isVariableDeclaratorListTerminator() {
        // If we can consume a semicolon (either explicitly, or with ASI), then consider us done
        // with parsing the list of variable declarators.
        if (canParseSemicolon()) {
            return true;
        }
        // in the case where we're parsing the variable declarator of a 'for-in' statement, we
        // are done if we see an 'in' keyword in front of us. Same with for-of
        if (isInOrOfKeyword(token())) {
            return true;
        }
        // ERROR RECOVERY TWEAK:
        // For better error recovery, if we see an '=>' then we just stop immediately.  We've got an
        // arrow function here and it's going to be very unlikely that we'll resynchronize and get
        // another variable declaration.
        if (token() === 39 /* SyntaxKind.EqualsGreaterThanToken */) {
            return true;
        }
        // Keep trying to parse out variable declarators.
        return false;
    }
    // True if positioned at element or terminator of the current list or any enclosing list
    function isInSomeParsingContext() {
        // We should be in at least one parsing context, be it SourceElements while parsing
        // a SourceFile, or JSDocComment when lazily parsing JSDoc.
        ts_1.Debug.assert(parsingContext, "Missing parsing context");
        for (var kind = 0; kind < 26 /* ParsingContext.Count */; kind++) {
            if (parsingContext & (1 << kind)) {
                if (isListElement(kind, /*inErrorRecovery*/ true) || isListTerminator(kind)) {
                    return true;
                }
            }
        }
        return false;
    }
    // Parses a list of elements
    function parseList(kind, parseElement) {
        var saveParsingContext = parsingContext;
        parsingContext |= 1 << kind;
        var list = [];
        var listPos = getNodePos();
        while (!isListTerminator(kind)) {
            if (isListElement(kind, /*inErrorRecovery*/ false)) {
                list.push(parseListElement(kind, parseElement));
                continue;
            }
            if (abortParsingListOrMoveToNextToken(kind)) {
                break;
            }
        }
        parsingContext = saveParsingContext;
        return createNodeArray(list, listPos);
    }
    function parseListElement(parsingContext, parseElement) {
        var node = currentNode(parsingContext);
        if (node) {
            return consumeNode(node);
        }
        return parseElement();
    }
    function currentNode(parsingContext, pos) {
        var _a;
        // If we don't have a cursor or the parsing context isn't reusable, there's nothing to reuse.
        //
        // If there is an outstanding parse error that we've encountered, but not attached to
        // some node, then we cannot get a node from the old source tree.  This is because we
        // want to mark the next node we encounter as being unusable.
        //
        // Note: This may be too conservative.  Perhaps we could reuse the node and set the bit
        // on it (or its leftmost child) as having the error.  For now though, being conservative
        // is nice and likely won't ever affect perf.
        if (!syntaxCursor || !isReusableParsingContext(parsingContext) || parseErrorBeforeNextFinishedNode) {
            return undefined;
        }
        var node = syntaxCursor.currentNode(pos !== null && pos !== void 0 ? pos : scanner.getTokenFullStart());
        // Can't reuse a missing node.
        // Can't reuse a node that intersected the change range.
        // Can't reuse a node that contains a parse error.  This is necessary so that we
        // produce the same set of errors again.
        if ((0, ts_1.nodeIsMissing)(node) || node.intersectsChange || (0, ts_1.containsParseError)(node)) {
            return undefined;
        }
        // We can only reuse a node if it was parsed under the same strict mode that we're
        // currently in.  i.e. if we originally parsed a node in non-strict mode, but then
        // the user added 'using strict' at the top of the file, then we can't use that node
        // again as the presence of strict mode may cause us to parse the tokens in the file
        // differently.
        //
        // Note: we *can* reuse tokens when the strict mode changes.  That's because tokens
        // are unaffected by strict mode.  It's just the parser will decide what to do with it
        // differently depending on what mode it is in.
        //
        // This also applies to all our other context flags as well.
        var nodeContextFlags = node.flags & 50720768 /* NodeFlags.ContextFlags */;
        if (nodeContextFlags !== contextFlags) {
            return undefined;
        }
        // Ok, we have a node that looks like it could be reused.  Now verify that it is valid
        // in the current list parsing context that we're currently at.
        if (!canReuseNode(node, parsingContext)) {
            return undefined;
        }
        if ((0, ts_1.canHaveJSDoc)(node) && ((_a = node.jsDoc) === null || _a === void 0 ? void 0 : _a.jsDocCache)) {
            // jsDocCache may include tags from parent nodes, which might have been modified.
            node.jsDoc.jsDocCache = undefined;
        }
        return node;
    }
    function consumeNode(node) {
        // Move the scanner so it is after the node we just consumed.
        scanner.resetTokenState(node.end);
        nextToken();
        return node;
    }
    function isReusableParsingContext(parsingContext) {
        switch (parsingContext) {
            case 5 /* ParsingContext.ClassMembers */:
            case 2 /* ParsingContext.SwitchClauses */:
            case 0 /* ParsingContext.SourceElements */:
            case 1 /* ParsingContext.BlockStatements */:
            case 3 /* ParsingContext.SwitchClauseStatements */:
            case 6 /* ParsingContext.EnumMembers */:
            case 4 /* ParsingContext.TypeMembers */:
            case 8 /* ParsingContext.VariableDeclarations */:
            case 17 /* ParsingContext.JSDocParameters */:
            case 16 /* ParsingContext.Parameters */:
                return true;
        }
        return false;
    }
    function canReuseNode(node, parsingContext) {
        switch (parsingContext) {
            case 5 /* ParsingContext.ClassMembers */:
                return isReusableClassMember(node);
            case 2 /* ParsingContext.SwitchClauses */:
                return isReusableSwitchClause(node);
            case 0 /* ParsingContext.SourceElements */:
            case 1 /* ParsingContext.BlockStatements */:
            case 3 /* ParsingContext.SwitchClauseStatements */:
                return isReusableStatement(node);
            case 6 /* ParsingContext.EnumMembers */:
                return isReusableEnumMember(node);
            case 4 /* ParsingContext.TypeMembers */:
                return isReusableTypeMember(node);
            case 8 /* ParsingContext.VariableDeclarations */:
                return isReusableVariableDeclaration(node);
            case 17 /* ParsingContext.JSDocParameters */:
            case 16 /* ParsingContext.Parameters */:
                return isReusableParameter(node);
            // Any other lists we do not care about reusing nodes in.  But feel free to add if
            // you can do so safely.  Danger areas involve nodes that may involve speculative
            // parsing.  If speculative parsing is involved with the node, then the range the
            // parser reached while looking ahead might be in the edited range (see the example
            // in canReuseVariableDeclaratorNode for a good case of this).
            // case ParsingContext.HeritageClauses:
            // This would probably be safe to reuse.  There is no speculative parsing with
            // heritage clauses.
            // case ParsingContext.TypeParameters:
            // This would probably be safe to reuse.  There is no speculative parsing with
            // type parameters.  Note that that's because type *parameters* only occur in
            // unambiguous *type* contexts.  While type *arguments* occur in very ambiguous
            // *expression* contexts.
            // case ParsingContext.TupleElementTypes:
            // This would probably be safe to reuse.  There is no speculative parsing with
            // tuple types.
            // Technically, type argument list types are probably safe to reuse.  While
            // speculative parsing is involved with them (since type argument lists are only
            // produced from speculative parsing a < as a type argument list), we only have
            // the types because speculative parsing succeeded.  Thus, the lookahead never
            // went past the end of the list and rewound.
            // case ParsingContext.TypeArguments:
            // Note: these are almost certainly not safe to ever reuse.  Expressions commonly
            // need a large amount of lookahead, and we should not reuse them as they may
            // have actually intersected the edit.
            // case ParsingContext.ArgumentExpressions:
            // This is not safe to reuse for the same reason as the 'AssignmentExpression'
            // cases.  i.e. a property assignment may end with an expression, and thus might
            // have lookahead far beyond it's old node.
            // case ParsingContext.ObjectLiteralMembers:
            // This is probably not safe to reuse.  There can be speculative parsing with
            // type names in a heritage clause.  There can be generic names in the type
            // name list, and there can be left hand side expressions (which can have type
            // arguments.)
            // case ParsingContext.HeritageClauseElement:
            // Perhaps safe to reuse, but it's unlikely we'd see more than a dozen attributes
            // on any given element. Same for children.
            // case ParsingContext.JsxAttributes:
            // case ParsingContext.JsxChildren:
        }
        return false;
    }
    function isReusableClassMember(node) {
        if (node) {
            switch (node.kind) {
                case 175 /* SyntaxKind.Constructor */:
                case 180 /* SyntaxKind.IndexSignature */:
                case 176 /* SyntaxKind.GetAccessor */:
                case 177 /* SyntaxKind.SetAccessor */:
                case 171 /* SyntaxKind.PropertyDeclaration */:
                case 239 /* SyntaxKind.SemicolonClassElement */:
                    return true;
                case 173 /* SyntaxKind.MethodDeclaration */:
                    // Method declarations are not necessarily reusable.  An object-literal
                    // may have a method calls "constructor(...)" and we must reparse that
                    // into an actual .ConstructorDeclaration.
                    var methodDeclaration = node;
                    var nameIsConstructor = methodDeclaration.name.kind === 80 /* SyntaxKind.Identifier */ &&
                        methodDeclaration.name.escapedText === "constructor";
                    return !nameIsConstructor;
            }
        }
        return false;
    }
    function isReusableSwitchClause(node) {
        if (node) {
            switch (node.kind) {
                case 295 /* SyntaxKind.CaseClause */:
                case 296 /* SyntaxKind.DefaultClause */:
                    return true;
            }
        }
        return false;
    }
    function isReusableStatement(node) {
        if (node) {
            switch (node.kind) {
                case 261 /* SyntaxKind.FunctionDeclaration */:
                case 242 /* SyntaxKind.VariableStatement */:
                case 240 /* SyntaxKind.Block */:
                case 244 /* SyntaxKind.IfStatement */:
                case 243 /* SyntaxKind.ExpressionStatement */:
                case 256 /* SyntaxKind.ThrowStatement */:
                case 252 /* SyntaxKind.ReturnStatement */:
                case 254 /* SyntaxKind.SwitchStatement */:
                case 251 /* SyntaxKind.BreakStatement */:
                case 250 /* SyntaxKind.ContinueStatement */:
                case 248 /* SyntaxKind.ForInStatement */:
                case 249 /* SyntaxKind.ForOfStatement */:
                case 247 /* SyntaxKind.ForStatement */:
                case 246 /* SyntaxKind.WhileStatement */:
                case 253 /* SyntaxKind.WithStatement */:
                case 241 /* SyntaxKind.EmptyStatement */:
                case 257 /* SyntaxKind.TryStatement */:
                case 255 /* SyntaxKind.LabeledStatement */:
                case 245 /* SyntaxKind.DoStatement */:
                case 258 /* SyntaxKind.DebuggerStatement */:
                case 271 /* SyntaxKind.ImportDeclaration */:
                case 270 /* SyntaxKind.ImportEqualsDeclaration */:
                case 277 /* SyntaxKind.ExportDeclaration */:
                case 276 /* SyntaxKind.ExportAssignment */:
                case 266 /* SyntaxKind.ModuleDeclaration */:
                case 262 /* SyntaxKind.ClassDeclaration */:
                case 263 /* SyntaxKind.InterfaceDeclaration */:
                case 265 /* SyntaxKind.EnumDeclaration */:
                case 264 /* SyntaxKind.TypeAliasDeclaration */:
                    return true;
            }
        }
        return false;
    }
    function isReusableEnumMember(node) {
        return node.kind === 305 /* SyntaxKind.EnumMember */;
    }
    function isReusableTypeMember(node) {
        if (node) {
            switch (node.kind) {
                case 179 /* SyntaxKind.ConstructSignature */:
                case 172 /* SyntaxKind.MethodSignature */:
                case 180 /* SyntaxKind.IndexSignature */:
                case 170 /* SyntaxKind.PropertySignature */:
                case 178 /* SyntaxKind.CallSignature */:
                    return true;
            }
        }
        return false;
    }
    function isReusableVariableDeclaration(node) {
        if (node.kind !== 259 /* SyntaxKind.VariableDeclaration */) {
            return false;
        }
        // Very subtle incremental parsing bug.  Consider the following code:
        //
        //      let v = new List < A, B
        //
        // This is actually legal code.  It's a list of variable declarators "v = new List<A"
        // on one side and "B" on the other. If you then change that to:
        //
        //      let v = new List < A, B >()
        //
        // then we have a problem.  "v = new List<A" doesn't intersect the change range, so we
        // start reparsing at "B" and we completely fail to handle this properly.
        //
        // In order to prevent this, we do not allow a variable declarator to be reused if it
        // has an initializer.
        var variableDeclarator = node;
        return variableDeclarator.initializer === undefined;
    }
    function isReusableParameter(node) {
        if (node.kind !== 168 /* SyntaxKind.Parameter */) {
            return false;
        }
        // See the comment in isReusableVariableDeclaration for why we do this.
        var parameter = node;
        return parameter.initializer === undefined;
    }
    // Returns true if we should abort parsing.
    function abortParsingListOrMoveToNextToken(kind) {
        parsingContextErrors(kind);
        if (isInSomeParsingContext()) {
            return true;
        }
        nextToken();
        return false;
    }
    function parsingContextErrors(context) {
        switch (context) {
            case 0 /* ParsingContext.SourceElements */:
                return token() === 90 /* SyntaxKind.DefaultKeyword */
                    ? parseErrorAtCurrentToken(ts_1.Diagnostics._0_expected, (0, ts_1.tokenToString)(95 /* SyntaxKind.ExportKeyword */))
                    : parseErrorAtCurrentToken(ts_1.Diagnostics.Declaration_or_statement_expected);
            case 1 /* ParsingContext.BlockStatements */: return parseErrorAtCurrentToken(ts_1.Diagnostics.Declaration_or_statement_expected);
            case 2 /* ParsingContext.SwitchClauses */: return parseErrorAtCurrentToken(ts_1.Diagnostics.case_or_default_expected);
            case 3 /* ParsingContext.SwitchClauseStatements */: return parseErrorAtCurrentToken(ts_1.Diagnostics.Statement_expected);
            case 18 /* ParsingContext.RestProperties */: // fallthrough
            case 4 /* ParsingContext.TypeMembers */: return parseErrorAtCurrentToken(ts_1.Diagnostics.Property_or_signature_expected);
            case 5 /* ParsingContext.ClassMembers */: return parseErrorAtCurrentToken(ts_1.Diagnostics.Unexpected_token_A_constructor_method_accessor_or_property_was_expected);
            case 6 /* ParsingContext.EnumMembers */: return parseErrorAtCurrentToken(ts_1.Diagnostics.Enum_member_expected);
            case 7 /* ParsingContext.HeritageClauseElement */: return parseErrorAtCurrentToken(ts_1.Diagnostics.Expression_expected);
            case 8 /* ParsingContext.VariableDeclarations */:
                return (0, ts_1.isKeyword)(token())
                    ? parseErrorAtCurrentToken(ts_1.Diagnostics._0_is_not_allowed_as_a_variable_declaration_name, (0, ts_1.tokenToString)(token()))
                    : parseErrorAtCurrentToken(ts_1.Diagnostics.Variable_declaration_expected);
            case 9 /* ParsingContext.ObjectBindingElements */: return parseErrorAtCurrentToken(ts_1.Diagnostics.Property_destructuring_pattern_expected);
            case 10 /* ParsingContext.ArrayBindingElements */: return parseErrorAtCurrentToken(ts_1.Diagnostics.Array_element_destructuring_pattern_expected);
            case 11 /* ParsingContext.ArgumentExpressions */: return parseErrorAtCurrentToken(ts_1.Diagnostics.Argument_expression_expected);
            case 12 /* ParsingContext.ObjectLiteralMembers */: return parseErrorAtCurrentToken(ts_1.Diagnostics.Property_assignment_expected);
            case 15 /* ParsingContext.ArrayLiteralMembers */: return parseErrorAtCurrentToken(ts_1.Diagnostics.Expression_or_comma_expected);
            case 17 /* ParsingContext.JSDocParameters */: return parseErrorAtCurrentToken(ts_1.Diagnostics.Parameter_declaration_expected);
            case 16 /* ParsingContext.Parameters */:
                return (0, ts_1.isKeyword)(token())
                    ? parseErrorAtCurrentToken(ts_1.Diagnostics._0_is_not_allowed_as_a_parameter_name, (0, ts_1.tokenToString)(token()))
                    : parseErrorAtCurrentToken(ts_1.Diagnostics.Parameter_declaration_expected);
            case 19 /* ParsingContext.TypeParameters */: return parseErrorAtCurrentToken(ts_1.Diagnostics.Type_parameter_declaration_expected);
            case 20 /* ParsingContext.TypeArguments */: return parseErrorAtCurrentToken(ts_1.Diagnostics.Type_argument_expected);
            case 21 /* ParsingContext.TupleElementTypes */: return parseErrorAtCurrentToken(ts_1.Diagnostics.Type_expected);
            case 22 /* ParsingContext.HeritageClauses */: return parseErrorAtCurrentToken(ts_1.Diagnostics.Unexpected_token_expected);
            case 23 /* ParsingContext.ImportOrExportSpecifiers */: return parseErrorAtCurrentToken(ts_1.Diagnostics.Identifier_expected);
            case 13 /* ParsingContext.JsxAttributes */: return parseErrorAtCurrentToken(ts_1.Diagnostics.Identifier_expected);
            case 14 /* ParsingContext.JsxChildren */: return parseErrorAtCurrentToken(ts_1.Diagnostics.Identifier_expected);
            case 24 /* ParsingContext.AssertEntries */: return parseErrorAtCurrentToken(ts_1.Diagnostics.Identifier_or_string_literal_expected); // AssertionKey.
            case 25 /* ParsingContext.JSDocComment */: return parseErrorAtCurrentToken(ts_1.Diagnostics.Identifier_expected);
            case 26 /* ParsingContext.Count */: return ts_1.Debug.fail("ParsingContext.Count used as a context"); // Not a real context, only a marker.
            default: ts_1.Debug.assertNever(context);
        }
    }
    function parseDelimitedList(kind, parseElement, considerSemicolonAsDelimiter) {
        var saveParsingContext = parsingContext;
        parsingContext |= 1 << kind;
        var list = [];
        var listPos = getNodePos();
        var commaStart = -1; // Meaning the previous token was not a comma
        while (true) {
            if (isListElement(kind, /*inErrorRecovery*/ false)) {
                var startPos = scanner.getTokenFullStart();
                var result = parseListElement(kind, parseElement);
                if (!result) {
                    parsingContext = saveParsingContext;
                    return undefined;
                }
                list.push(result);
                commaStart = scanner.getTokenStart();
                if (parseOptional(28 /* SyntaxKind.CommaToken */)) {
                    // No need to check for a zero length node since we know we parsed a comma
                    continue;
                }
                commaStart = -1; // Back to the state where the last token was not a comma
                if (isListTerminator(kind)) {
                    break;
                }
                // We didn't get a comma, and the list wasn't terminated, explicitly parse
                // out a comma so we give a good error message.
                parseExpected(28 /* SyntaxKind.CommaToken */, getExpectedCommaDiagnostic(kind));
                // If the token was a semicolon, and the caller allows that, then skip it and
                // continue.  This ensures we get back on track and don't result in tons of
                // parse errors.  For example, this can happen when people do things like use
                // a semicolon to delimit object literal members.   Note: we'll have already
                // reported an error when we called parseExpected above.
                if (considerSemicolonAsDelimiter && token() === 27 /* SyntaxKind.SemicolonToken */ && !scanner.hasPrecedingLineBreak()) {
                    nextToken();
                }
                if (startPos === scanner.getTokenFullStart()) {
                    // What we're parsing isn't actually remotely recognizable as a element and we've consumed no tokens whatsoever
                    // Consume a token to advance the parser in some way and avoid an infinite loop
                    // This can happen when we're speculatively parsing parenthesized expressions which we think may be arrow functions,
                    // or when a modifier keyword which is disallowed as a parameter name (ie, `static` in strict mode) is supplied
                    nextToken();
                }
                continue;
            }
            if (isListTerminator(kind)) {
                break;
            }
            if (abortParsingListOrMoveToNextToken(kind)) {
                break;
            }
        }
        parsingContext = saveParsingContext;
        // Recording the trailing comma is deliberately done after the previous
        // loop, and not just if we see a list terminator. This is because the list
        // may have ended incorrectly, but it is still important to know if there
        // was a trailing comma.
        // Check if the last token was a comma.
        // Always preserve a trailing comma by marking it on the NodeArray
        return createNodeArray(list, listPos, /*end*/ undefined, commaStart >= 0);
    }
    function getExpectedCommaDiagnostic(kind) {
        return kind === 6 /* ParsingContext.EnumMembers */ ? ts_1.Diagnostics.An_enum_member_name_must_be_followed_by_a_or : undefined;
    }
    function createMissingList() {
        var list = createNodeArray([], getNodePos());
        list.isMissingList = true;
        return list;
    }
    function isMissingList(arr) {
        return !!arr.isMissingList;
    }
    function parseBracketedList(kind, parseElement, open, close) {
        if (parseExpected(open)) {
            var result = parseDelimitedList(kind, parseElement);
            parseExpected(close);
            return result;
        }
        return createMissingList();
    }
    function parseEntityName(allowReservedWords, diagnosticMessage) {
        var pos = getNodePos();
        var entity = allowReservedWords ? parseIdentifierName(diagnosticMessage) : parseIdentifier(diagnosticMessage);
        while (parseOptional(25 /* SyntaxKind.DotToken */)) {
            if (token() === 30 /* SyntaxKind.LessThanToken */) {
                // The entity is part of a JSDoc-style generic. We will use the gap between `typeName` and
                // `typeArguments` to report it as a grammar error in the checker.
                break;
            }
            entity = finishNode(factory.createQualifiedName(entity, parseRightSideOfDot(allowReservedWords, /*allowPrivateIdentifiers*/ false)), pos);
        }
        return entity;
    }
    function createQualifiedName(entity, name) {
        return finishNode(factory.createQualifiedName(entity, name), entity.pos);
    }
    function parseRightSideOfDot(allowIdentifierNames, allowPrivateIdentifiers) {
        // Technically a keyword is valid here as all identifiers and keywords are identifier names.
        // However, often we'll encounter this in error situations when the identifier or keyword
        // is actually starting another valid construct.
        //
        // So, we check for the following specific case:
        //
        //      name.
        //      identifierOrKeyword identifierNameOrKeyword
        //
        // Note: the newlines are important here.  For example, if that above code
        // were rewritten into:
        //
        //      name.identifierOrKeyword
        //      identifierNameOrKeyword
        //
        // Then we would consider it valid.  That's because ASI would take effect and
        // the code would be implicitly: "name.identifierOrKeyword; identifierNameOrKeyword".
        // In the first case though, ASI will not take effect because there is not a
        // line terminator after the identifier or keyword.
        if (scanner.hasPrecedingLineBreak() && (0, ts_1.tokenIsIdentifierOrKeyword)(token())) {
            var matchesPattern = lookAhead(nextTokenIsIdentifierOrKeywordOnSameLine);
            if (matchesPattern) {
                // Report that we need an identifier.  However, report it right after the dot,
                // and not on the next token.  This is because the next token might actually
                // be an identifier and the error would be quite confusing.
                return createMissingNode(80 /* SyntaxKind.Identifier */, /*reportAtCurrentPosition*/ true, ts_1.Diagnostics.Identifier_expected);
            }
        }
        if (token() === 81 /* SyntaxKind.PrivateIdentifier */) {
            var node = parsePrivateIdentifier();
            return allowPrivateIdentifiers ? node : createMissingNode(80 /* SyntaxKind.Identifier */, /*reportAtCurrentPosition*/ true, ts_1.Diagnostics.Identifier_expected);
        }
        return allowIdentifierNames ? parseIdentifierName() : parseIdentifier();
    }
    function parseTemplateSpans(isTaggedTemplate) {
        var pos = getNodePos();
        var list = [];
        var node;
        do {
            node = parseTemplateSpan(isTaggedTemplate);
            list.push(node);
        } while (node.literal.kind === 17 /* SyntaxKind.TemplateMiddle */);
        return createNodeArray(list, pos);
    }
    function parseTemplateExpression(isTaggedTemplate) {
        var pos = getNodePos();
        return finishNode(factory.createTemplateExpression(parseTemplateHead(isTaggedTemplate), parseTemplateSpans(isTaggedTemplate)), pos);
    }
    function parseTemplateType() {
        var pos = getNodePos();
        return finishNode(factory.createTemplateLiteralType(parseTemplateHead(/*isTaggedTemplate*/ false), parseTemplateTypeSpans()), pos);
    }
    function parseTemplateTypeSpans() {
        var pos = getNodePos();
        var list = [];
        var node;
        do {
            node = parseTemplateTypeSpan();
            list.push(node);
        } while (node.literal.kind === 17 /* SyntaxKind.TemplateMiddle */);
        return createNodeArray(list, pos);
    }
    function parseTemplateTypeSpan() {
        var pos = getNodePos();
        return finishNode(factory.createTemplateLiteralTypeSpan(parseType(), parseLiteralOfTemplateSpan(/*isTaggedTemplate*/ false)), pos);
    }
    function parseLiteralOfTemplateSpan(isTaggedTemplate) {
        if (token() === 20 /* SyntaxKind.CloseBraceToken */) {
            reScanTemplateToken(isTaggedTemplate);
            return parseTemplateMiddleOrTemplateTail();
        }
        else {
            // TODO(rbuckton): Do we need to call `parseExpectedToken` or can we just call `createMissingNode` directly?
            return parseExpectedToken(18 /* SyntaxKind.TemplateTail */, ts_1.Diagnostics._0_expected, (0, ts_1.tokenToString)(20 /* SyntaxKind.CloseBraceToken */));
        }
    }
    function parseTemplateSpan(isTaggedTemplate) {
        var pos = getNodePos();
        return finishNode(factory.createTemplateSpan(allowInAnd(parseExpression), parseLiteralOfTemplateSpan(isTaggedTemplate)), pos);
    }
    function parseLiteralNode() {
        return parseLiteralLikeNode(token());
    }
    function parseTemplateHead(isTaggedTemplate) {
        if (!isTaggedTemplate && scanner.getTokenFlags() & 26656 /* TokenFlags.IsInvalid */) {
            reScanTemplateToken(/*isTaggedTemplate*/ false);
        }
        var fragment = parseLiteralLikeNode(token());
        ts_1.Debug.assert(fragment.kind === 16 /* SyntaxKind.TemplateHead */, "Template head has wrong token kind");
        return fragment;
    }
    function parseTemplateMiddleOrTemplateTail() {
        var fragment = parseLiteralLikeNode(token());
        ts_1.Debug.assert(fragment.kind === 17 /* SyntaxKind.TemplateMiddle */ || fragment.kind === 18 /* SyntaxKind.TemplateTail */, "Template fragment has wrong token kind");
        return fragment;
    }
    function getTemplateLiteralRawText(kind) {
        var isLast = kind === 15 /* SyntaxKind.NoSubstitutionTemplateLiteral */ || kind === 18 /* SyntaxKind.TemplateTail */;
        var tokenText = scanner.getTokenText();
        return tokenText.substring(1, tokenText.length - (scanner.isUnterminated() ? 0 : isLast ? 1 : 2));
    }
    function parseLiteralLikeNode(kind) {
        var pos = getNodePos();
        var node = (0, ts_1.isTemplateLiteralKind)(kind) ? factory.createTemplateLiteralLikeNode(kind, scanner.getTokenValue(), getTemplateLiteralRawText(kind), scanner.getTokenFlags() & 7176 /* TokenFlags.TemplateLiteralLikeFlags */) :
            // Note that theoretically the following condition would hold true literals like 009,
            // which is not octal. But because of how the scanner separates the tokens, we would
            // never get a token like this. Instead, we would get 00 and 9 as two separate tokens.
            // We also do not need to check for negatives because any prefix operator would be part of a
            // parent unary expression.
            kind === 9 /* SyntaxKind.NumericLiteral */ ? factoryCreateNumericLiteral(scanner.getTokenValue(), scanner.getNumericLiteralFlags()) :
                kind === 11 /* SyntaxKind.StringLiteral */ ? factoryCreateStringLiteral(scanner.getTokenValue(), /*isSingleQuote*/ undefined, scanner.hasExtendedUnicodeEscape()) :
                    (0, ts_1.isLiteralKind)(kind) ? factoryCreateLiteralLikeNode(kind, scanner.getTokenValue()) :
                        ts_1.Debug.fail();
        if (scanner.hasExtendedUnicodeEscape()) {
            node.hasExtendedUnicodeEscape = true;
        }
        if (scanner.isUnterminated()) {
            node.isUnterminated = true;
        }
        nextToken();
        return finishNode(node, pos);
    }
    // TYPES
    function parseEntityNameOfTypeReference() {
        return parseEntityName(/*allowReservedWords*/ true, ts_1.Diagnostics.Type_expected);
    }
    function parseTypeArgumentsOfTypeReference() {
        if (!scanner.hasPrecedingLineBreak() && reScanLessThanToken() === 30 /* SyntaxKind.LessThanToken */) {
            return parseBracketedList(20 /* ParsingContext.TypeArguments */, parseType, 30 /* SyntaxKind.LessThanToken */, 32 /* SyntaxKind.GreaterThanToken */);
        }
    }
    function parseTypeReference() {
        var pos = getNodePos();
        return finishNode(factory.createTypeReferenceNode(parseEntityNameOfTypeReference(), parseTypeArgumentsOfTypeReference()), pos);
    }
    // If true, we should abort parsing an error function.
    function typeHasArrowFunctionBlockingParseError(node) {
        switch (node.kind) {
            case 182 /* SyntaxKind.TypeReference */:
                return (0, ts_1.nodeIsMissing)(node.typeName);
            case 183 /* SyntaxKind.FunctionType */:
            case 184 /* SyntaxKind.ConstructorType */: {
                var _a = node, parameters = _a.parameters, type = _a.type;
                return isMissingList(parameters) || typeHasArrowFunctionBlockingParseError(type);
            }
            case 195 /* SyntaxKind.ParenthesizedType */:
                return typeHasArrowFunctionBlockingParseError(node.type);
            default:
                return false;
        }
    }
    function parseThisTypePredicate(lhs) {
        nextToken();
        return finishNode(factory.createTypePredicateNode(/*assertsModifier*/ undefined, lhs, parseType()), lhs.pos);
    }
    function parseThisTypeNode() {
        var pos = getNodePos();
        nextToken();
        return finishNode(factory.createThisTypeNode(), pos);
    }
    function parseJSDocAllType() {
        var pos = getNodePos();
        nextToken();
        return finishNode(factory.createJSDocAllType(), pos);
    }
    function parseJSDocNonNullableType() {
        var pos = getNodePos();
        nextToken();
        return finishNode(factory.createJSDocNonNullableType(parseNonArrayType(), /*postfix*/ false), pos);
    }
    function parseJSDocUnknownOrNullableType() {
        var pos = getNodePos();
        // skip the ?
        nextToken();
        // Need to lookahead to decide if this is a nullable or unknown type.
        // Here are cases where we'll pick the unknown type:
        //
        //      Foo(?,
        //      { a: ? }
        //      Foo(?)
        //      Foo<?>
        //      Foo(?=
        //      (?|
        if (token() === 28 /* SyntaxKind.CommaToken */ ||
            token() === 20 /* SyntaxKind.CloseBraceToken */ ||
            token() === 22 /* SyntaxKind.CloseParenToken */ ||
            token() === 32 /* SyntaxKind.GreaterThanToken */ ||
            token() === 64 /* SyntaxKind.EqualsToken */ ||
            token() === 52 /* SyntaxKind.BarToken */) {
            return finishNode(factory.createJSDocUnknownType(), pos);
        }
        else {
            return finishNode(factory.createJSDocNullableType(parseType(), /*postfix*/ false), pos);
        }
    }
    function parseJSDocFunctionType() {
        var pos = getNodePos();
        var hasJSDoc = hasPrecedingJSDocComment();
        if (lookAhead(nextTokenIsOpenParen)) {
            nextToken();
            var parameters = parseParameters(4 /* SignatureFlags.Type */ | 32 /* SignatureFlags.JSDoc */);
            var type = parseReturnType(59 /* SyntaxKind.ColonToken */, /*isType*/ false);
            return withJSDoc(finishNode(factory.createJSDocFunctionType(parameters, type), pos), hasJSDoc);
        }
        return finishNode(factory.createTypeReferenceNode(parseIdentifierName(), /*typeArguments*/ undefined), pos);
    }
    function parseJSDocParameter() {
        var pos = getNodePos();
        var name;
        if (token() === 110 /* SyntaxKind.ThisKeyword */ || token() === 105 /* SyntaxKind.NewKeyword */) {
            name = parseIdentifierName();
            parseExpected(59 /* SyntaxKind.ColonToken */);
        }
        return finishNode(factory.createParameterDeclaration(
        /*modifiers*/ undefined, 
        /*dotDotDotToken*/ undefined, 
        // TODO(rbuckton): JSDoc parameters don't have names (except `this`/`new`), should we manufacture an empty identifier?
        name, 
        /*questionToken*/ undefined, parseJSDocType(), 
        /*initializer*/ undefined), pos);
    }
    function parseJSDocType() {
        scanner.setInJSDocType(true);
        var pos = getNodePos();
        if (parseOptional(144 /* SyntaxKind.ModuleKeyword */)) {
            // TODO(rbuckton): We never set the type for a JSDocNamepathType. What should we put here?
            var moduleTag = factory.createJSDocNamepathType(/*type*/ undefined);
            terminate: while (true) {
                switch (token()) {
                    case 20 /* SyntaxKind.CloseBraceToken */:
                    case 1 /* SyntaxKind.EndOfFileToken */:
                    case 28 /* SyntaxKind.CommaToken */:
                    case 5 /* SyntaxKind.WhitespaceTrivia */:
                        break terminate;
                    default:
                        nextTokenJSDoc();
                }
            }
            scanner.setInJSDocType(false);
            return finishNode(moduleTag, pos);
        }
        var hasDotDotDot = parseOptional(26 /* SyntaxKind.DotDotDotToken */);
        var type = parseTypeOrTypePredicate();
        scanner.setInJSDocType(false);
        if (hasDotDotDot) {
            type = finishNode(factory.createJSDocVariadicType(type), pos);
        }
        if (token() === 64 /* SyntaxKind.EqualsToken */) {
            nextToken();
            return finishNode(factory.createJSDocOptionalType(type), pos);
        }
        return type;
    }
    function parseTypeQuery() {
        var pos = getNodePos();
        parseExpected(114 /* SyntaxKind.TypeOfKeyword */);
        var entityName = parseEntityName(/*allowReservedWords*/ true);
        // Make sure we perform ASI to prevent parsing the next line's type arguments as part of an instantiation expression.
        var typeArguments = !scanner.hasPrecedingLineBreak() ? tryParseTypeArguments() : undefined;
        return finishNode(factory.createTypeQueryNode(entityName, typeArguments), pos);
    }
    function parseTypeParameter() {
        var pos = getNodePos();
        var modifiers = parseModifiers(/*allowDecorators*/ false, /*permitConstAsModifier*/ true);
        var name = parseIdentifier();
        var constraint;
        var expression;
        if (parseOptional(96 /* SyntaxKind.ExtendsKeyword */)) {
            // It's not uncommon for people to write improper constraints to a generic.  If the
            // user writes a constraint that is an expression and not an actual type, then parse
            // it out as an expression (so we can recover well), but report that a type is needed
            // instead.
            if (isStartOfType() || !isStartOfExpression()) {
                constraint = parseType();
            }
            else {
                // It was not a type, and it looked like an expression.  Parse out an expression
                // here so we recover well.  Note: it is important that we call parseUnaryExpression
                // and not parseExpression here.  If the user has:
                //
                //      <T extends "">
                //
                // We do *not* want to consume the `>` as we're consuming the expression for "".
                expression = parseUnaryExpressionOrHigher();
            }
        }
        var defaultType = parseOptional(64 /* SyntaxKind.EqualsToken */) ? parseType() : undefined;
        var node = factory.createTypeParameterDeclaration(modifiers, name, constraint, defaultType);
        node.expression = expression;
        return finishNode(node, pos);
    }
    function parseTypeParameters() {
        if (token() === 30 /* SyntaxKind.LessThanToken */) {
            return parseBracketedList(19 /* ParsingContext.TypeParameters */, parseTypeParameter, 30 /* SyntaxKind.LessThanToken */, 32 /* SyntaxKind.GreaterThanToken */);
        }
    }
    function isStartOfParameter(isJSDocParameter) {
        return token() === 26 /* SyntaxKind.DotDotDotToken */ ||
            isBindingIdentifierOrPrivateIdentifierOrPattern() ||
            (0, ts_1.isModifierKind)(token()) ||
            token() === 60 /* SyntaxKind.AtToken */ ||
            isStartOfType(/*inStartOfParameter*/ !isJSDocParameter);
    }
    function parseNameOfParameter(modifiers) {
        // FormalParameter [Yield,Await]:
        //      BindingElement[?Yield,?Await]
        var name = parseIdentifierOrPattern(ts_1.Diagnostics.Private_identifiers_cannot_be_used_as_parameters);
        if ((0, ts_1.getFullWidth)(name) === 0 && !(0, ts_1.some)(modifiers) && (0, ts_1.isModifierKind)(token())) {
            // in cases like
            // 'use strict'
            // function foo(static)
            // isParameter('static') === true, because of isModifier('static')
            // however 'static' is not a legal identifier in a strict mode.
            // so result of this function will be ParameterDeclaration (flags = 0, name = missing, type = undefined, initializer = undefined)
            // and current token will not change => parsing of the enclosing parameter list will last till the end of time (or OOM)
            // to avoid this we'll advance cursor to the next token.
            nextToken();
        }
        return name;
    }
    function isParameterNameStart() {
        // Be permissive about await and yield by calling isBindingIdentifier instead of isIdentifier; disallowing
        // them during a speculative parse leads to many more follow-on errors than allowing the function to parse then later
        // complaining about the use of the keywords.
        return isBindingIdentifier() || token() === 23 /* SyntaxKind.OpenBracketToken */ || token() === 19 /* SyntaxKind.OpenBraceToken */;
    }
    function parseParameter(inOuterAwaitContext) {
        return parseParameterWorker(inOuterAwaitContext);
    }
    function parseParameterForSpeculation(inOuterAwaitContext) {
        return parseParameterWorker(inOuterAwaitContext, /*allowAmbiguity*/ false);
    }
    function parseParameterWorker(inOuterAwaitContext, allowAmbiguity) {
        if (allowAmbiguity === void 0) { allowAmbiguity = true; }
        var pos = getNodePos();
        var hasJSDoc = hasPrecedingJSDocComment();
        // FormalParameter [Yield,Await]:
        //      BindingElement[?Yield,?Await]
        // Decorators are parsed in the outer [Await] context, the rest of the parameter is parsed in the function's [Await] context.
        var modifiers = inOuterAwaitContext ?
            doInAwaitContext(function () { return parseModifiers(/*allowDecorators*/ true); }) :
            doOutsideOfAwaitContext(function () { return parseModifiers(/*allowDecorators*/ true); });
        if (token() === 110 /* SyntaxKind.ThisKeyword */) {
            var node_1 = factory.createParameterDeclaration(modifiers, 
            /*dotDotDotToken*/ undefined, createIdentifier(/*isIdentifier*/ true), 
            /*questionToken*/ undefined, parseTypeAnnotation(), 
            /*initializer*/ undefined);
            var modifier = (0, ts_1.firstOrUndefined)(modifiers);
            if (modifier) {
                parseErrorAtRange(modifier, ts_1.Diagnostics.Neither_decorators_nor_modifiers_may_be_applied_to_this_parameters);
            }
            return withJSDoc(finishNode(node_1, pos), hasJSDoc);
        }
        var savedTopLevel = topLevel;
        topLevel = false;
        var dotDotDotToken = parseOptionalToken(26 /* SyntaxKind.DotDotDotToken */);
        if (!allowAmbiguity && !isParameterNameStart()) {
            return undefined;
        }
        var node = withJSDoc(finishNode(factory.createParameterDeclaration(modifiers, dotDotDotToken, parseNameOfParameter(modifiers), parseOptionalToken(58 /* SyntaxKind.QuestionToken */), parseTypeAnnotation(), parseInitializer()), pos), hasJSDoc);
        topLevel = savedTopLevel;
        return node;
    }
    function parseReturnType(returnToken, isType) {
        if (shouldParseReturnType(returnToken, isType)) {
            return allowConditionalTypesAnd(parseTypeOrTypePredicate);
        }
    }
    function shouldParseReturnType(returnToken, isType) {
        if (returnToken === 39 /* SyntaxKind.EqualsGreaterThanToken */) {
            parseExpected(returnToken);
            return true;
        }
        else if (parseOptional(59 /* SyntaxKind.ColonToken */)) {
            return true;
        }
        else if (isType && token() === 39 /* SyntaxKind.EqualsGreaterThanToken */) {
            // This is easy to get backward, especially in type contexts, so parse the type anyway
            parseErrorAtCurrentToken(ts_1.Diagnostics._0_expected, (0, ts_1.tokenToString)(59 /* SyntaxKind.ColonToken */));
            nextToken();
            return true;
        }
        return false;
    }
    function parseParametersWorker(flags, allowAmbiguity) {
        // FormalParameters [Yield,Await]: (modified)
        //      [empty]
        //      FormalParameterList[?Yield,Await]
        //
        // FormalParameter[Yield,Await]: (modified)
        //      BindingElement[?Yield,Await]
        //
        // BindingElement [Yield,Await]: (modified)
        //      SingleNameBinding[?Yield,?Await]
        //      BindingPattern[?Yield,?Await]Initializer [In, ?Yield,?Await] opt
        //
        // SingleNameBinding [Yield,Await]:
        //      BindingIdentifier[?Yield,?Await]Initializer [In, ?Yield,?Await] opt
        var savedYieldContext = inYieldContext();
        var savedAwaitContext = inAwaitContext();
        setYieldContext(!!(flags & 1 /* SignatureFlags.Yield */));
        setAwaitContext(!!(flags & 2 /* SignatureFlags.Await */));
        var parameters = flags & 32 /* SignatureFlags.JSDoc */ ?
            parseDelimitedList(17 /* ParsingContext.JSDocParameters */, parseJSDocParameter) :
            parseDelimitedList(16 /* ParsingContext.Parameters */, function () { return allowAmbiguity ? parseParameter(savedAwaitContext) : parseParameterForSpeculation(savedAwaitContext); });
        setYieldContext(savedYieldContext);
        setAwaitContext(savedAwaitContext);
        return parameters;
    }
    function parseParameters(flags) {
        // FormalParameters [Yield,Await]: (modified)
        //      [empty]
        //      FormalParameterList[?Yield,Await]
        //
        // FormalParameter[Yield,Await]: (modified)
        //      BindingElement[?Yield,Await]
        //
        // BindingElement [Yield,Await]: (modified)
        //      SingleNameBinding[?Yield,?Await]
        //      BindingPattern[?Yield,?Await]Initializer [In, ?Yield,?Await] opt
        //
        // SingleNameBinding [Yield,Await]:
        //      BindingIdentifier[?Yield,?Await]Initializer [In, ?Yield,?Await] opt
        if (!parseExpected(21 /* SyntaxKind.OpenParenToken */)) {
            return createMissingList();
        }
        var parameters = parseParametersWorker(flags, /*allowAmbiguity*/ true);
        parseExpected(22 /* SyntaxKind.CloseParenToken */);
        return parameters;
    }
    function parseTypeMemberSemicolon() {
        // We allow type members to be separated by commas or (possibly ASI) semicolons.
        // First check if it was a comma.  If so, we're done with the member.
        if (parseOptional(28 /* SyntaxKind.CommaToken */)) {
            return;
        }
        // Didn't have a comma.  We must have a (possible ASI) semicolon.
        parseSemicolon();
    }
    function parseSignatureMember(kind) {
        var pos = getNodePos();
        var hasJSDoc = hasPrecedingJSDocComment();
        if (kind === 179 /* SyntaxKind.ConstructSignature */) {
            parseExpected(105 /* SyntaxKind.NewKeyword */);
        }
        var typeParameters = parseTypeParameters();
        var parameters = parseParameters(4 /* SignatureFlags.Type */);
        var type = parseReturnType(59 /* SyntaxKind.ColonToken */, /*isType*/ true);
        parseTypeMemberSemicolon();
        var node = kind === 178 /* SyntaxKind.CallSignature */
            ? factory.createCallSignature(typeParameters, parameters, type)
            : factory.createConstructSignature(typeParameters, parameters, type);
        return withJSDoc(finishNode(node, pos), hasJSDoc);
    }
    function isIndexSignature() {
        return token() === 23 /* SyntaxKind.OpenBracketToken */ && lookAhead(isUnambiguouslyIndexSignature);
    }
    function isUnambiguouslyIndexSignature() {
        // The only allowed sequence is:
        //
        //   [id:
        //
        // However, for error recovery, we also check the following cases:
        //
        //   [...
        //   [id,
        //   [id?,
        //   [id?:
        //   [id?]
        //   [public id
        //   [private id
        //   [protected id
        //   []
        //
        nextToken();
        if (token() === 26 /* SyntaxKind.DotDotDotToken */ || token() === 24 /* SyntaxKind.CloseBracketToken */) {
            return true;
        }
        if ((0, ts_1.isModifierKind)(token())) {
            nextToken();
            if (isIdentifier()) {
                return true;
            }
        }
        else if (!isIdentifier()) {
            return false;
        }
        else {
            // Skip the identifier
            nextToken();
        }
        // A colon signifies a well formed indexer
        // A comma should be a badly formed indexer because comma expressions are not allowed
        // in computed properties.
        if (token() === 59 /* SyntaxKind.ColonToken */ || token() === 28 /* SyntaxKind.CommaToken */) {
            return true;
        }
        // Question mark could be an indexer with an optional property,
        // or it could be a conditional expression in a computed property.
        if (token() !== 58 /* SyntaxKind.QuestionToken */) {
            return false;
        }
        // If any of the following tokens are after the question mark, it cannot
        // be a conditional expression, so treat it as an indexer.
        nextToken();
        return token() === 59 /* SyntaxKind.ColonToken */ || token() === 28 /* SyntaxKind.CommaToken */ || token() === 24 /* SyntaxKind.CloseBracketToken */;
    }
    function parseIndexSignatureDeclaration(pos, hasJSDoc, modifiers) {
        var parameters = parseBracketedList(16 /* ParsingContext.Parameters */, function () { return parseParameter(/*inOuterAwaitContext*/ false); }, 23 /* SyntaxKind.OpenBracketToken */, 24 /* SyntaxKind.CloseBracketToken */);
        var type = parseTypeAnnotation();
        parseTypeMemberSemicolon();
        var node = factory.createIndexSignature(modifiers, parameters, type);
        return withJSDoc(finishNode(node, pos), hasJSDoc);
    }
    function parsePropertyOrMethodSignature(pos, hasJSDoc, modifiers) {
        var name = parsePropertyName();
        var questionToken = parseOptionalToken(58 /* SyntaxKind.QuestionToken */);
        var node;
        if (token() === 21 /* SyntaxKind.OpenParenToken */ || token() === 30 /* SyntaxKind.LessThanToken */) {
            // Method signatures don't exist in expression contexts.  So they have neither
            // [Yield] nor [Await]
            var typeParameters = parseTypeParameters();
            var parameters = parseParameters(4 /* SignatureFlags.Type */);
            var type = parseReturnType(59 /* SyntaxKind.ColonToken */, /*isType*/ true);
            node = factory.createMethodSignature(modifiers, name, questionToken, typeParameters, parameters, type);
        }
        else {
            var type = parseTypeAnnotation();
            node = factory.createPropertySignature(modifiers, name, questionToken, type);
            // Although type literal properties cannot not have initializers, we attempt
            // to parse an initializer so we can report in the checker that an interface
            // property or type literal property cannot have an initializer.
            if (token() === 64 /* SyntaxKind.EqualsToken */)
                node.initializer = parseInitializer();
        }
        parseTypeMemberSemicolon();
        return withJSDoc(finishNode(node, pos), hasJSDoc);
    }
    function isTypeMemberStart() {
        // Return true if we have the start of a signature member
        if (token() === 21 /* SyntaxKind.OpenParenToken */ ||
            token() === 30 /* SyntaxKind.LessThanToken */ ||
            token() === 139 /* SyntaxKind.GetKeyword */ ||
            token() === 153 /* SyntaxKind.SetKeyword */) {
            return true;
        }
        var idToken = false;
        // Eat up all modifiers, but hold on to the last one in case it is actually an identifier
        while ((0, ts_1.isModifierKind)(token())) {
            idToken = true;
            nextToken();
        }
        // Index signatures and computed property names are type members
        if (token() === 23 /* SyntaxKind.OpenBracketToken */) {
            return true;
        }
        // Try to get the first property-like token following all modifiers
        if (isLiteralPropertyName()) {
            idToken = true;
            nextToken();
        }
        // If we were able to get any potential identifier, check that it is
        // the start of a member declaration
        if (idToken) {
            return token() === 21 /* SyntaxKind.OpenParenToken */ ||
                token() === 30 /* SyntaxKind.LessThanToken */ ||
                token() === 58 /* SyntaxKind.QuestionToken */ ||
                token() === 59 /* SyntaxKind.ColonToken */ ||
                token() === 28 /* SyntaxKind.CommaToken */ ||
                canParseSemicolon();
        }
        return false;
    }
    function parseTypeMember() {
        if (token() === 21 /* SyntaxKind.OpenParenToken */ || token() === 30 /* SyntaxKind.LessThanToken */) {
            return parseSignatureMember(178 /* SyntaxKind.CallSignature */);
        }
        if (token() === 105 /* SyntaxKind.NewKeyword */ && lookAhead(nextTokenIsOpenParenOrLessThan)) {
            return parseSignatureMember(179 /* SyntaxKind.ConstructSignature */);
        }
        var pos = getNodePos();
        var hasJSDoc = hasPrecedingJSDocComment();
        var modifiers = parseModifiers(/*allowDecorators*/ false);
        if (parseContextualModifier(139 /* SyntaxKind.GetKeyword */)) {
            return parseAccessorDeclaration(pos, hasJSDoc, modifiers, 176 /* SyntaxKind.GetAccessor */, 4 /* SignatureFlags.Type */);
        }
        if (parseContextualModifier(153 /* SyntaxKind.SetKeyword */)) {
            return parseAccessorDeclaration(pos, hasJSDoc, modifiers, 177 /* SyntaxKind.SetAccessor */, 4 /* SignatureFlags.Type */);
        }
        if (isIndexSignature()) {
            return parseIndexSignatureDeclaration(pos, hasJSDoc, modifiers);
        }
        return parsePropertyOrMethodSignature(pos, hasJSDoc, modifiers);
    }
    function nextTokenIsOpenParenOrLessThan() {
        nextToken();
        return token() === 21 /* SyntaxKind.OpenParenToken */ || token() === 30 /* SyntaxKind.LessThanToken */;
    }
    function nextTokenIsDot() {
        return nextToken() === 25 /* SyntaxKind.DotToken */;
    }
    function nextTokenIsOpenParenOrLessThanOrDot() {
        switch (nextToken()) {
            case 21 /* SyntaxKind.OpenParenToken */:
            case 30 /* SyntaxKind.LessThanToken */:
            case 25 /* SyntaxKind.DotToken */:
                return true;
        }
        return false;
    }
    function parseTypeLiteral() {
        var pos = getNodePos();
        return finishNode(factory.createTypeLiteralNode(parseObjectTypeMembers()), pos);
    }
    function parseObjectTypeMembers() {
        var members;
        if (parseExpected(19 /* SyntaxKind.OpenBraceToken */)) {
            members = parseList(4 /* ParsingContext.TypeMembers */, parseTypeMember);
            parseExpected(20 /* SyntaxKind.CloseBraceToken */);
        }
        else {
            members = createMissingList();
        }
        return members;
    }
    function isStartOfMappedType() {
        nextToken();
        if (token() === 40 /* SyntaxKind.PlusToken */ || token() === 41 /* SyntaxKind.MinusToken */) {
            return nextToken() === 148 /* SyntaxKind.ReadonlyKeyword */;
        }
        if (token() === 148 /* SyntaxKind.ReadonlyKeyword */) {
            nextToken();
        }
        return token() === 23 /* SyntaxKind.OpenBracketToken */ && nextTokenIsIdentifier() && nextToken() === 103 /* SyntaxKind.InKeyword */;
    }
    function parseMappedTypeParameter() {
        var pos = getNodePos();
        var name = parseIdentifierName();
        parseExpected(103 /* SyntaxKind.InKeyword */);
        var type = parseType();
        return finishNode(factory.createTypeParameterDeclaration(/*modifiers*/ undefined, name, type, /*defaultType*/ undefined), pos);
    }
    function parseMappedType() {
        var pos = getNodePos();
        parseExpected(19 /* SyntaxKind.OpenBraceToken */);
        var readonlyToken;
        if (token() === 148 /* SyntaxKind.ReadonlyKeyword */ || token() === 40 /* SyntaxKind.PlusToken */ || token() === 41 /* SyntaxKind.MinusToken */) {
            readonlyToken = parseTokenNode();
            if (readonlyToken.kind !== 148 /* SyntaxKind.ReadonlyKeyword */) {
                parseExpected(148 /* SyntaxKind.ReadonlyKeyword */);
            }
        }
        parseExpected(23 /* SyntaxKind.OpenBracketToken */);
        var typeParameter = parseMappedTypeParameter();
        var nameType = parseOptional(130 /* SyntaxKind.AsKeyword */) ? parseType() : undefined;
        parseExpected(24 /* SyntaxKind.CloseBracketToken */);
        var questionToken;
        if (token() === 58 /* SyntaxKind.QuestionToken */ || token() === 40 /* SyntaxKind.PlusToken */ || token() === 41 /* SyntaxKind.MinusToken */) {
            questionToken = parseTokenNode();
            if (questionToken.kind !== 58 /* SyntaxKind.QuestionToken */) {
                parseExpected(58 /* SyntaxKind.QuestionToken */);
            }
        }
        var type = parseTypeAnnotation();
        parseSemicolon();
        var members = parseList(4 /* ParsingContext.TypeMembers */, parseTypeMember);
        parseExpected(20 /* SyntaxKind.CloseBraceToken */);
        return finishNode(factory.createMappedTypeNode(readonlyToken, typeParameter, nameType, questionToken, type, members), pos);
    }
    function parseTupleElementType() {
        var pos = getNodePos();
        if (parseOptional(26 /* SyntaxKind.DotDotDotToken */)) {
            return finishNode(factory.createRestTypeNode(parseType()), pos);
        }
        var type = parseType();
        if ((0, ts_1.isJSDocNullableType)(type) && type.pos === type.type.pos) {
            var node = factory.createOptionalTypeNode(type.type);
            (0, ts_1.setTextRange)(node, type);
            node.flags = type.flags;
            return node;
        }
        return type;
    }
    function isNextTokenColonOrQuestionColon() {
        return nextToken() === 59 /* SyntaxKind.ColonToken */ || (token() === 58 /* SyntaxKind.QuestionToken */ && nextToken() === 59 /* SyntaxKind.ColonToken */);
    }
    function isTupleElementName() {
        if (token() === 26 /* SyntaxKind.DotDotDotToken */) {
            return (0, ts_1.tokenIsIdentifierOrKeyword)(nextToken()) && isNextTokenColonOrQuestionColon();
        }
        return (0, ts_1.tokenIsIdentifierOrKeyword)(token()) && isNextTokenColonOrQuestionColon();
    }
    function parseTupleElementNameOrTupleElementType() {
        if (lookAhead(isTupleElementName)) {
            var pos = getNodePos();
            var hasJSDoc = hasPrecedingJSDocComment();
            var dotDotDotToken = parseOptionalToken(26 /* SyntaxKind.DotDotDotToken */);
            var name_1 = parseIdentifierName();
            var questionToken = parseOptionalToken(58 /* SyntaxKind.QuestionToken */);
            parseExpected(59 /* SyntaxKind.ColonToken */);
            var type = parseTupleElementType();
            var node = factory.createNamedTupleMember(dotDotDotToken, name_1, questionToken, type);
            return withJSDoc(finishNode(node, pos), hasJSDoc);
        }
        return parseTupleElementType();
    }
    function parseTupleType() {
        var pos = getNodePos();
        return finishNode(factory.createTupleTypeNode(parseBracketedList(21 /* ParsingContext.TupleElementTypes */, parseTupleElementNameOrTupleElementType, 23 /* SyntaxKind.OpenBracketToken */, 24 /* SyntaxKind.CloseBracketToken */)), pos);
    }
    function parseParenthesizedType() {
        var pos = getNodePos();
        parseExpected(21 /* SyntaxKind.OpenParenToken */);
        var type = parseType();
        parseExpected(22 /* SyntaxKind.CloseParenToken */);
        return finishNode(factory.createParenthesizedType(type), pos);
    }
    function parseModifiersForConstructorType() {
        var modifiers;
        if (token() === 128 /* SyntaxKind.AbstractKeyword */) {
            var pos = getNodePos();
            nextToken();
            var modifier = finishNode(factoryCreateToken(128 /* SyntaxKind.AbstractKeyword */), pos);
            modifiers = createNodeArray([modifier], pos);
        }
        return modifiers;
    }
    function parseFunctionOrConstructorType() {
        var pos = getNodePos();
        var hasJSDoc = hasPrecedingJSDocComment();
        var modifiers = parseModifiersForConstructorType();
        var isConstructorType = parseOptional(105 /* SyntaxKind.NewKeyword */);
        ts_1.Debug.assert(!modifiers || isConstructorType, "Per isStartOfFunctionOrConstructorType, a function type cannot have modifiers.");
        var typeParameters = parseTypeParameters();
        var parameters = parseParameters(4 /* SignatureFlags.Type */);
        var type = parseReturnType(39 /* SyntaxKind.EqualsGreaterThanToken */, /*isType*/ false);
        var node = isConstructorType
            ? factory.createConstructorTypeNode(modifiers, typeParameters, parameters, type)
            : factory.createFunctionTypeNode(typeParameters, parameters, type);
        return withJSDoc(finishNode(node, pos), hasJSDoc);
    }
    function parseKeywordAndNoDot() {
        var node = parseTokenNode();
        return token() === 25 /* SyntaxKind.DotToken */ ? undefined : node;
    }
    function parseLiteralTypeNode(negative) {
        var pos = getNodePos();
        if (negative) {
            nextToken();
        }
        var expression = token() === 112 /* SyntaxKind.TrueKeyword */ || token() === 97 /* SyntaxKind.FalseKeyword */ || token() === 106 /* SyntaxKind.NullKeyword */ ?
            parseTokenNode() :
            parseLiteralLikeNode(token());
        if (negative) {
            expression = finishNode(factory.createPrefixUnaryExpression(41 /* SyntaxKind.MinusToken */, expression), pos);
        }
        return finishNode(factory.createLiteralTypeNode(expression), pos);
    }
    function isStartOfTypeOfImportType() {
        nextToken();
        return token() === 102 /* SyntaxKind.ImportKeyword */;
    }
    function parseImportTypeAssertions() {
        var pos = getNodePos();
        var openBracePosition = scanner.getTokenStart();
        parseExpected(19 /* SyntaxKind.OpenBraceToken */);
        var multiLine = scanner.hasPrecedingLineBreak();
        parseExpected(132 /* SyntaxKind.AssertKeyword */);
        parseExpected(59 /* SyntaxKind.ColonToken */);
        var clause = parseAssertClause(/*skipAssertKeyword*/ true);
        if (!parseExpected(20 /* SyntaxKind.CloseBraceToken */)) {
            var lastError = (0, ts_1.lastOrUndefined)(parseDiagnostics);
            if (lastError && lastError.code === ts_1.Diagnostics._0_expected.code) {
                (0, ts_1.addRelatedInfo)(lastError, (0, ts_1.createDetachedDiagnostic)(fileName, openBracePosition, 1, ts_1.Diagnostics.The_parser_expected_to_find_a_1_to_match_the_0_token_here, "{", "}"));
            }
        }
        return finishNode(factory.createImportTypeAssertionContainer(clause, multiLine), pos);
    }
    function parseImportType() {
        sourceFlags |= 2097152 /* NodeFlags.PossiblyContainsDynamicImport */;
        var pos = getNodePos();
        var isTypeOf = parseOptional(114 /* SyntaxKind.TypeOfKeyword */);
        parseExpected(102 /* SyntaxKind.ImportKeyword */);
        parseExpected(21 /* SyntaxKind.OpenParenToken */);
        var type = parseType();
        var assertions;
        if (parseOptional(28 /* SyntaxKind.CommaToken */)) {
            assertions = parseImportTypeAssertions();
        }
        parseExpected(22 /* SyntaxKind.CloseParenToken */);
        var qualifier = parseOptional(25 /* SyntaxKind.DotToken */) ? parseEntityNameOfTypeReference() : undefined;
        var typeArguments = parseTypeArgumentsOfTypeReference();
        return finishNode(factory.createImportTypeNode(type, assertions, qualifier, typeArguments, isTypeOf), pos);
    }
    function nextTokenIsNumericOrBigIntLiteral() {
        nextToken();
        return token() === 9 /* SyntaxKind.NumericLiteral */ || token() === 10 /* SyntaxKind.BigIntLiteral */;
    }
    function parseNonArrayType() {
        switch (token()) {
            case 133 /* SyntaxKind.AnyKeyword */:
            case 159 /* SyntaxKind.UnknownKeyword */:
            case 154 /* SyntaxKind.StringKeyword */:
            case 150 /* SyntaxKind.NumberKeyword */:
            case 162 /* SyntaxKind.BigIntKeyword */:
            case 155 /* SyntaxKind.SymbolKeyword */:
            case 136 /* SyntaxKind.BooleanKeyword */:
            case 157 /* SyntaxKind.UndefinedKeyword */:
            case 146 /* SyntaxKind.NeverKeyword */:
            case 151 /* SyntaxKind.ObjectKeyword */:
                // If these are followed by a dot, then parse these out as a dotted type reference instead.
                return tryParse(parseKeywordAndNoDot) || parseTypeReference();
            case 67 /* SyntaxKind.AsteriskEqualsToken */:
                // If there is '*=', treat it as * followed by postfix =
                scanner.reScanAsteriskEqualsToken();
            // falls through
            case 42 /* SyntaxKind.AsteriskToken */:
                return parseJSDocAllType();
            case 61 /* SyntaxKind.QuestionQuestionToken */:
                // If there is '??', treat it as prefix-'?' in JSDoc type.
                scanner.reScanQuestionToken();
            // falls through
            case 58 /* SyntaxKind.QuestionToken */:
                return parseJSDocUnknownOrNullableType();
            case 100 /* SyntaxKind.FunctionKeyword */:
                return parseJSDocFunctionType();
            case 54 /* SyntaxKind.ExclamationToken */:
                return parseJSDocNonNullableType();
            case 15 /* SyntaxKind.NoSubstitutionTemplateLiteral */:
            case 11 /* SyntaxKind.StringLiteral */:
            case 9 /* SyntaxKind.NumericLiteral */:
            case 10 /* SyntaxKind.BigIntLiteral */:
            case 112 /* SyntaxKind.TrueKeyword */:
            case 97 /* SyntaxKind.FalseKeyword */:
            case 106 /* SyntaxKind.NullKeyword */:
                return parseLiteralTypeNode();
            case 41 /* SyntaxKind.MinusToken */:
                return lookAhead(nextTokenIsNumericOrBigIntLiteral) ? parseLiteralTypeNode(/*negative*/ true) : parseTypeReference();
            case 116 /* SyntaxKind.VoidKeyword */:
                return parseTokenNode();
            case 110 /* SyntaxKind.ThisKeyword */: {
                var thisKeyword = parseThisTypeNode();
                if (token() === 142 /* SyntaxKind.IsKeyword */ && !scanner.hasPrecedingLineBreak()) {
                    return parseThisTypePredicate(thisKeyword);
                }
                else {
                    return thisKeyword;
                }
            }
            case 114 /* SyntaxKind.TypeOfKeyword */:
                return lookAhead(isStartOfTypeOfImportType) ? parseImportType() : parseTypeQuery();
            case 19 /* SyntaxKind.OpenBraceToken */:
                return lookAhead(isStartOfMappedType) ? parseMappedType() : parseTypeLiteral();
            case 23 /* SyntaxKind.OpenBracketToken */:
                return parseTupleType();
            case 21 /* SyntaxKind.OpenParenToken */:
                return parseParenthesizedType();
            case 102 /* SyntaxKind.ImportKeyword */:
                return parseImportType();
            case 131 /* SyntaxKind.AssertsKeyword */:
                return lookAhead(nextTokenIsIdentifierOrKeywordOnSameLine) ? parseAssertsTypePredicate() : parseTypeReference();
            case 16 /* SyntaxKind.TemplateHead */:
                return parseTemplateType();
            default:
                return parseTypeReference();
        }
    }
    function isStartOfType(inStartOfParameter) {
        switch (token()) {
            case 133 /* SyntaxKind.AnyKeyword */:
            case 159 /* SyntaxKind.UnknownKeyword */:
            case 154 /* SyntaxKind.StringKeyword */:
            case 150 /* SyntaxKind.NumberKeyword */:
            case 162 /* SyntaxKind.BigIntKeyword */:
            case 136 /* SyntaxKind.BooleanKeyword */:
            case 148 /* SyntaxKind.ReadonlyKeyword */:
            case 155 /* SyntaxKind.SymbolKeyword */:
            case 158 /* SyntaxKind.UniqueKeyword */:
            case 116 /* SyntaxKind.VoidKeyword */:
            case 157 /* SyntaxKind.UndefinedKeyword */:
            case 106 /* SyntaxKind.NullKeyword */:
            case 110 /* SyntaxKind.ThisKeyword */:
            case 114 /* SyntaxKind.TypeOfKeyword */:
            case 146 /* SyntaxKind.NeverKeyword */:
            case 19 /* SyntaxKind.OpenBraceToken */:
            case 23 /* SyntaxKind.OpenBracketToken */:
            case 30 /* SyntaxKind.LessThanToken */:
            case 52 /* SyntaxKind.BarToken */:
            case 51 /* SyntaxKind.AmpersandToken */:
            case 105 /* SyntaxKind.NewKeyword */:
            case 11 /* SyntaxKind.StringLiteral */:
            case 9 /* SyntaxKind.NumericLiteral */:
            case 10 /* SyntaxKind.BigIntLiteral */:
            case 112 /* SyntaxKind.TrueKeyword */:
            case 97 /* SyntaxKind.FalseKeyword */:
            case 151 /* SyntaxKind.ObjectKeyword */:
            case 42 /* SyntaxKind.AsteriskToken */:
            case 58 /* SyntaxKind.QuestionToken */:
            case 54 /* SyntaxKind.ExclamationToken */:
            case 26 /* SyntaxKind.DotDotDotToken */:
            case 140 /* SyntaxKind.InferKeyword */:
            case 102 /* SyntaxKind.ImportKeyword */:
            case 131 /* SyntaxKind.AssertsKeyword */:
            case 15 /* SyntaxKind.NoSubstitutionTemplateLiteral */:
            case 16 /* SyntaxKind.TemplateHead */:
                return true;
            case 100 /* SyntaxKind.FunctionKeyword */:
                return !inStartOfParameter;
            case 41 /* SyntaxKind.MinusToken */:
                return !inStartOfParameter && lookAhead(nextTokenIsNumericOrBigIntLiteral);
            case 21 /* SyntaxKind.OpenParenToken */:
                // Only consider '(' the start of a type if followed by ')', '...', an identifier, a modifier,
                // or something that starts a type. We don't want to consider things like '(1)' a type.
                return !inStartOfParameter && lookAhead(isStartOfParenthesizedOrFunctionType);
            default:
                return isIdentifier();
        }
    }
    function isStartOfParenthesizedOrFunctionType() {
        nextToken();
        return token() === 22 /* SyntaxKind.CloseParenToken */ || isStartOfParameter(/*isJSDocParameter*/ false) || isStartOfType();
    }
    function parsePostfixTypeOrHigher() {
        var pos = getNodePos();
        var type = parseNonArrayType();
        while (!scanner.hasPrecedingLineBreak()) {
            switch (token()) {
                case 54 /* SyntaxKind.ExclamationToken */:
                    nextToken();
                    type = finishNode(factory.createJSDocNonNullableType(type, /*postfix*/ true), pos);
                    break;
                case 58 /* SyntaxKind.QuestionToken */:
                    // If next token is start of a type we have a conditional type
                    if (lookAhead(nextTokenIsStartOfType)) {
                        return type;
                    }
                    nextToken();
                    type = finishNode(factory.createJSDocNullableType(type, /*postfix*/ true), pos);
                    break;
                case 23 /* SyntaxKind.OpenBracketToken */:
                    parseExpected(23 /* SyntaxKind.OpenBracketToken */);
                    if (isStartOfType()) {
                        var indexType = parseType();
                        parseExpected(24 /* SyntaxKind.CloseBracketToken */);
                        type = finishNode(factory.createIndexedAccessTypeNode(type, indexType), pos);
                    }
                    else {
                        parseExpected(24 /* SyntaxKind.CloseBracketToken */);
                        type = finishNode(factory.createArrayTypeNode(type), pos);
                    }
                    break;
                default:
                    return type;
            }
        }
        return type;
    }
    function parseTypeOperator(operator) {
        var pos = getNodePos();
        parseExpected(operator);
        return finishNode(factory.createTypeOperatorNode(operator, parseTypeOperatorOrHigher()), pos);
    }
    function tryParseConstraintOfInferType() {
        if (parseOptional(96 /* SyntaxKind.ExtendsKeyword */)) {
            var constraint = disallowConditionalTypesAnd(parseType);
            if (inDisallowConditionalTypesContext() || token() !== 58 /* SyntaxKind.QuestionToken */) {
                return constraint;
            }
        }
    }
    function parseTypeParameterOfInferType() {
        var pos = getNodePos();
        var name = parseIdentifier();
        var constraint = tryParse(tryParseConstraintOfInferType);
        var node = factory.createTypeParameterDeclaration(/*modifiers*/ undefined, name, constraint);
        return finishNode(node, pos);
    }
    function parseInferType() {
        var pos = getNodePos();
        parseExpected(140 /* SyntaxKind.InferKeyword */);
        return finishNode(factory.createInferTypeNode(parseTypeParameterOfInferType()), pos);
    }
    function parseTypeOperatorOrHigher() {
        var operator = token();
        switch (operator) {
            case 143 /* SyntaxKind.KeyOfKeyword */:
            case 158 /* SyntaxKind.UniqueKeyword */:
            case 148 /* SyntaxKind.ReadonlyKeyword */:
                return parseTypeOperator(operator);
            case 140 /* SyntaxKind.InferKeyword */:
                return parseInferType();
        }
        return allowConditionalTypesAnd(parsePostfixTypeOrHigher);
    }
    function parseFunctionOrConstructorTypeToError(isInUnionType) {
        // the function type and constructor type shorthand notation
        // are not allowed directly in unions and intersections, but we'll
        // try to parse them gracefully and issue a helpful message.
        if (isStartOfFunctionTypeOrConstructorType()) {
            var type = parseFunctionOrConstructorType();
            var diagnostic = void 0;
            if ((0, ts_1.isFunctionTypeNode)(type)) {
                diagnostic = isInUnionType
                    ? ts_1.Diagnostics.Function_type_notation_must_be_parenthesized_when_used_in_a_union_type
                    : ts_1.Diagnostics.Function_type_notation_must_be_parenthesized_when_used_in_an_intersection_type;
            }
            else {
                diagnostic = isInUnionType
                    ? ts_1.Diagnostics.Constructor_type_notation_must_be_parenthesized_when_used_in_a_union_type
                    : ts_1.Diagnostics.Constructor_type_notation_must_be_parenthesized_when_used_in_an_intersection_type;
            }
            parseErrorAtRange(type, diagnostic);
            return type;
        }
        return undefined;
    }
    function parseUnionOrIntersectionType(operator, parseConstituentType, createTypeNode) {
        var pos = getNodePos();
        var isUnionType = operator === 52 /* SyntaxKind.BarToken */;
        var hasLeadingOperator = parseOptional(operator);
        var type = hasLeadingOperator && parseFunctionOrConstructorTypeToError(isUnionType)
            || parseConstituentType();
        if (token() === operator || hasLeadingOperator) {
            var types = [type];
            while (parseOptional(operator)) {
                types.push(parseFunctionOrConstructorTypeToError(isUnionType) || parseConstituentType());
            }
            type = finishNode(createTypeNode(createNodeArray(types, pos)), pos);
        }
        return type;
    }
    function parseIntersectionTypeOrHigher() {
        return parseUnionOrIntersectionType(51 /* SyntaxKind.AmpersandToken */, parseTypeOperatorOrHigher, factory.createIntersectionTypeNode);
    }
    function parseUnionTypeOrHigher() {
        return parseUnionOrIntersectionType(52 /* SyntaxKind.BarToken */, parseIntersectionTypeOrHigher, factory.createUnionTypeNode);
    }
    function nextTokenIsNewKeyword() {
        nextToken();
        return token() === 105 /* SyntaxKind.NewKeyword */;
    }
    function isStartOfFunctionTypeOrConstructorType() {
        if (token() === 30 /* SyntaxKind.LessThanToken */) {
            return true;
        }
        if (token() === 21 /* SyntaxKind.OpenParenToken */ && lookAhead(isUnambiguouslyStartOfFunctionType)) {
            return true;
        }
        return token() === 105 /* SyntaxKind.NewKeyword */ ||
            token() === 128 /* SyntaxKind.AbstractKeyword */ && lookAhead(nextTokenIsNewKeyword);
    }
    function skipParameterStart() {
        if ((0, ts_1.isModifierKind)(token())) {
            // Skip modifiers
            parseModifiers(/*allowDecorators*/ false);
        }
        if (isIdentifier() || token() === 110 /* SyntaxKind.ThisKeyword */) {
            nextToken();
            return true;
        }
        if (token() === 23 /* SyntaxKind.OpenBracketToken */ || token() === 19 /* SyntaxKind.OpenBraceToken */) {
            // Return true if we can parse an array or object binding pattern with no errors
            var previousErrorCount = parseDiagnostics.length;
            parseIdentifierOrPattern();
            return previousErrorCount === parseDiagnostics.length;
        }
        return false;
    }
    function isUnambiguouslyStartOfFunctionType() {
        nextToken();
        if (token() === 22 /* SyntaxKind.CloseParenToken */ || token() === 26 /* SyntaxKind.DotDotDotToken */) {
            // ( )
            // ( ...
            return true;
        }
        if (skipParameterStart()) {
            // We successfully skipped modifiers (if any) and an identifier or binding pattern,
            // now see if we have something that indicates a parameter declaration
            if (token() === 59 /* SyntaxKind.ColonToken */ || token() === 28 /* SyntaxKind.CommaToken */ ||
                token() === 58 /* SyntaxKind.QuestionToken */ || token() === 64 /* SyntaxKind.EqualsToken */) {
                // ( xxx :
                // ( xxx ,
                // ( xxx ?
                // ( xxx =
                return true;
            }
            if (token() === 22 /* SyntaxKind.CloseParenToken */) {
                nextToken();
                if (token() === 39 /* SyntaxKind.EqualsGreaterThanToken */) {
                    // ( xxx ) =>
                    return true;
                }
            }
        }
        return false;
    }
    function parseTypeOrTypePredicate() {
        var pos = getNodePos();
        var typePredicateVariable = isIdentifier() && tryParse(parseTypePredicatePrefix);
        var type = parseType();
        if (typePredicateVariable) {
            return finishNode(factory.createTypePredicateNode(/*assertsModifier*/ undefined, typePredicateVariable, type), pos);
        }
        else {
            return type;
        }
    }
    function parseTypePredicatePrefix() {
        var id = parseIdentifier();
        if (token() === 142 /* SyntaxKind.IsKeyword */ && !scanner.hasPrecedingLineBreak()) {
            nextToken();
            return id;
        }
    }
    function parseAssertsTypePredicate() {
        var pos = getNodePos();
        var assertsModifier = parseExpectedToken(131 /* SyntaxKind.AssertsKeyword */);
        var parameterName = token() === 110 /* SyntaxKind.ThisKeyword */ ? parseThisTypeNode() : parseIdentifier();
        var type = parseOptional(142 /* SyntaxKind.IsKeyword */) ? parseType() : undefined;
        return finishNode(factory.createTypePredicateNode(assertsModifier, parameterName, type), pos);
    }
    function parseType() {
        if (contextFlags & 40960 /* NodeFlags.TypeExcludesFlags */) {
            return doOutsideOfContext(40960 /* NodeFlags.TypeExcludesFlags */, parseType);
        }
        if (isStartOfFunctionTypeOrConstructorType()) {
            return parseFunctionOrConstructorType();
        }
        var pos = getNodePos();
        var type = parseUnionTypeOrHigher();
        if (!inDisallowConditionalTypesContext() && !scanner.hasPrecedingLineBreak() && parseOptional(96 /* SyntaxKind.ExtendsKeyword */)) {
            // The type following 'extends' is not permitted to be another conditional type
            var extendsType = disallowConditionalTypesAnd(parseType);
            parseExpected(58 /* SyntaxKind.QuestionToken */);
            var trueType = allowConditionalTypesAnd(parseType);
            parseExpected(59 /* SyntaxKind.ColonToken */);
            var falseType = allowConditionalTypesAnd(parseType);
            return finishNode(factory.createConditionalTypeNode(type, extendsType, trueType, falseType), pos);
        }
        return type;
    }
    function parseTypeAnnotation() {
        return parseOptional(59 /* SyntaxKind.ColonToken */) ? parseType() : undefined;
    }
    // EXPRESSIONS
    function isStartOfLeftHandSideExpression() {
        switch (token()) {
            case 110 /* SyntaxKind.ThisKeyword */:
            case 108 /* SyntaxKind.SuperKeyword */:
            case 106 /* SyntaxKind.NullKeyword */:
            case 112 /* SyntaxKind.TrueKeyword */:
            case 97 /* SyntaxKind.FalseKeyword */:
            case 9 /* SyntaxKind.NumericLiteral */:
            case 10 /* SyntaxKind.BigIntLiteral */:
            case 11 /* SyntaxKind.StringLiteral */:
            case 15 /* SyntaxKind.NoSubstitutionTemplateLiteral */:
            case 16 /* SyntaxKind.TemplateHead */:
            case 21 /* SyntaxKind.OpenParenToken */:
            case 23 /* SyntaxKind.OpenBracketToken */:
            case 19 /* SyntaxKind.OpenBraceToken */:
            case 100 /* SyntaxKind.FunctionKeyword */:
            case 86 /* SyntaxKind.ClassKeyword */:
            case 105 /* SyntaxKind.NewKeyword */:
            case 44 /* SyntaxKind.SlashToken */:
            case 69 /* SyntaxKind.SlashEqualsToken */:
            case 80 /* SyntaxKind.Identifier */:
                return true;
            case 102 /* SyntaxKind.ImportKeyword */:
                return lookAhead(nextTokenIsOpenParenOrLessThanOrDot);
            default:
                return isIdentifier();
        }
    }
    function isStartOfExpression() {
        if (isStartOfLeftHandSideExpression()) {
            return true;
        }
        switch (token()) {
            case 40 /* SyntaxKind.PlusToken */:
            case 41 /* SyntaxKind.MinusToken */:
            case 55 /* SyntaxKind.TildeToken */:
            case 54 /* SyntaxKind.ExclamationToken */:
            case 91 /* SyntaxKind.DeleteKeyword */:
            case 114 /* SyntaxKind.TypeOfKeyword */:
            case 116 /* SyntaxKind.VoidKeyword */:
            case 46 /* SyntaxKind.PlusPlusToken */:
            case 47 /* SyntaxKind.MinusMinusToken */:
            case 30 /* SyntaxKind.LessThanToken */:
            case 135 /* SyntaxKind.AwaitKeyword */:
            case 127 /* SyntaxKind.YieldKeyword */:
            case 81 /* SyntaxKind.PrivateIdentifier */:
            case 60 /* SyntaxKind.AtToken */:
                // Yield/await always starts an expression.  Either it is an identifier (in which case
                // it is definitely an expression).  Or it's a keyword (either because we're in
                // a generator or async function, or in strict mode (or both)) and it started a yield or await expression.
                return true;
            default:
                // Error tolerance.  If we see the start of some binary operator, we consider
                // that the start of an expression.  That way we'll parse out a missing identifier,
                // give a good message about an identifier being missing, and then consume the
                // rest of the binary expression.
                if (isBinaryOperator()) {
                    return true;
                }
                return isIdentifier();
        }
    }
    function isStartOfExpressionStatement() {
        // As per the grammar, none of '{' or 'function' or 'class' can start an expression statement.
        return token() !== 19 /* SyntaxKind.OpenBraceToken */ &&
            token() !== 100 /* SyntaxKind.FunctionKeyword */ &&
            token() !== 86 /* SyntaxKind.ClassKeyword */ &&
            token() !== 60 /* SyntaxKind.AtToken */ &&
            isStartOfExpression();
    }
    function parseExpression() {
        // Expression[in]:
        //      AssignmentExpression[in]
        //      Expression[in] , AssignmentExpression[in]
        // clear the decorator context when parsing Expression, as it should be unambiguous when parsing a decorator
        var saveDecoratorContext = inDecoratorContext();
        if (saveDecoratorContext) {
            setDecoratorContext(/*val*/ false);
        }
        var pos = getNodePos();
        var expr = parseAssignmentExpressionOrHigher(/*allowReturnTypeInArrowFunction*/ true);
        var operatorToken;
        while ((operatorToken = parseOptionalToken(28 /* SyntaxKind.CommaToken */))) {
            expr = makeBinaryExpression(expr, operatorToken, parseAssignmentExpressionOrHigher(/*allowReturnTypeInArrowFunction*/ true), pos);
        }
        if (saveDecoratorContext) {
            setDecoratorContext(/*val*/ true);
        }
        return expr;
    }
    function parseInitializer() {
        return parseOptional(64 /* SyntaxKind.EqualsToken */) ? parseAssignmentExpressionOrHigher(/*allowReturnTypeInArrowFunction*/ true) : undefined;
    }
    function parseAssignmentExpressionOrHigher(allowReturnTypeInArrowFunction) {
        //  AssignmentExpression[in,yield]:
        //      1) ConditionalExpression[?in,?yield]
        //      2) LeftHandSideExpression = AssignmentExpression[?in,?yield]
        //      3) LeftHandSideExpression AssignmentOperator AssignmentExpression[?in,?yield]
        //      4) ArrowFunctionExpression[?in,?yield]
        //      5) AsyncArrowFunctionExpression[in,yield,await]
        //      6) [+Yield] YieldExpression[?In]
        //
        // Note: for ease of implementation we treat productions '2' and '3' as the same thing.
        // (i.e. they're both BinaryExpressions with an assignment operator in it).
        // First, do the simple check if we have a YieldExpression (production '6').
        if (isYieldExpression()) {
            return parseYieldExpression();
        }
        // Then, check if we have an arrow function (production '4' and '5') that starts with a parenthesized
        // parameter list or is an async arrow function.
        // AsyncArrowFunctionExpression:
        //      1) async[no LineTerminator here]AsyncArrowBindingIdentifier[?Yield][no LineTerminator here]=>AsyncConciseBody[?In]
        //      2) CoverCallExpressionAndAsyncArrowHead[?Yield, ?Await][no LineTerminator here]=>AsyncConciseBody[?In]
        // Production (1) of AsyncArrowFunctionExpression is parsed in "tryParseAsyncSimpleArrowFunctionExpression".
        // And production (2) is parsed in "tryParseParenthesizedArrowFunctionExpression".
        //
        // If we do successfully parse arrow-function, we must *not* recurse for productions 1, 2 or 3. An ArrowFunction is
        // not a LeftHandSideExpression, nor does it start a ConditionalExpression.  So we are done
        // with AssignmentExpression if we see one.
        var arrowExpression = tryParseParenthesizedArrowFunctionExpression(allowReturnTypeInArrowFunction) || tryParseAsyncSimpleArrowFunctionExpression(allowReturnTypeInArrowFunction);
        if (arrowExpression) {
            return arrowExpression;
        }
        // Now try to see if we're in production '1', '2' or '3'.  A conditional expression can
        // start with a LogicalOrExpression, while the assignment productions can only start with
        // LeftHandSideExpressions.
        //
        // So, first, we try to just parse out a BinaryExpression.  If we get something that is a
        // LeftHandSide or higher, then we can try to parse out the assignment expression part.
        // Otherwise, we try to parse out the conditional expression bit.  We want to allow any
        // binary expression here, so we pass in the 'lowest' precedence here so that it matches
        // and consumes anything.
        var pos = getNodePos();
        var expr = parseBinaryExpressionOrHigher(0 /* OperatorPrecedence.Lowest */);
        // To avoid a look-ahead, we did not handle the case of an arrow function with a single un-parenthesized
        // parameter ('x => ...') above. We handle it here by checking if the parsed expression was a single
        // identifier and the current token is an arrow.
        if (expr.kind === 80 /* SyntaxKind.Identifier */ && token() === 39 /* SyntaxKind.EqualsGreaterThanToken */) {
            return parseSimpleArrowFunctionExpression(pos, expr, allowReturnTypeInArrowFunction, /*asyncModifier*/ undefined);
        }
        // Now see if we might be in cases '2' or '3'.
        // If the expression was a LHS expression, and we have an assignment operator, then
        // we're in '2' or '3'. Consume the assignment and return.
        //
        // Note: we call reScanGreaterToken so that we get an appropriately merged token
        // for cases like `> > =` becoming `>>=`
        if ((0, ts_1.isLeftHandSideExpression)(expr) && (0, ts_1.isAssignmentOperator)(reScanGreaterToken())) {
            return makeBinaryExpression(expr, parseTokenNode(), parseAssignmentExpressionOrHigher(allowReturnTypeInArrowFunction), pos);
        }
        // It wasn't an assignment or a lambda.  This is a conditional expression:
        return parseConditionalExpressionRest(expr, pos, allowReturnTypeInArrowFunction);
    }
    function isYieldExpression() {
        if (token() === 127 /* SyntaxKind.YieldKeyword */) {
            // If we have a 'yield' keyword, and this is a context where yield expressions are
            // allowed, then definitely parse out a yield expression.
            if (inYieldContext()) {
                return true;
            }
            // We're in a context where 'yield expr' is not allowed.  However, if we can
            // definitely tell that the user was trying to parse a 'yield expr' and not
            // just a normal expr that start with a 'yield' identifier, then parse out
            // a 'yield expr'.  We can then report an error later that they are only
            // allowed in generator expressions.
            //
            // for example, if we see 'yield(foo)', then we'll have to treat that as an
            // invocation expression of something called 'yield'.  However, if we have
            // 'yield foo' then that is not legal as a normal expression, so we can
            // definitely recognize this as a yield expression.
            //
            // for now we just check if the next token is an identifier.  More heuristics
            // can be added here later as necessary.  We just need to make sure that we
            // don't accidentally consume something legal.
            return lookAhead(nextTokenIsIdentifierOrKeywordOrLiteralOnSameLine);
        }
        return false;
    }
    function nextTokenIsIdentifierOnSameLine() {
        nextToken();
        return !scanner.hasPrecedingLineBreak() && isIdentifier();
    }
    function parseYieldExpression() {
        var pos = getNodePos();
        // YieldExpression[In] :
        //      yield
        //      yield [no LineTerminator here] [Lexical goal InputElementRegExp]AssignmentExpression[?In, Yield]
        //      yield [no LineTerminator here] * [Lexical goal InputElementRegExp]AssignmentExpression[?In, Yield]
        nextToken();
        if (!scanner.hasPrecedingLineBreak() &&
            (token() === 42 /* SyntaxKind.AsteriskToken */ || isStartOfExpression())) {
            return finishNode(factory.createYieldExpression(parseOptionalToken(42 /* SyntaxKind.AsteriskToken */), parseAssignmentExpressionOrHigher(/*allowReturnTypeInArrowFunction*/ true)), pos);
        }
        else {
            // if the next token is not on the same line as yield.  or we don't have an '*' or
            // the start of an expression, then this is just a simple "yield" expression.
            return finishNode(factory.createYieldExpression(/*asteriskToken*/ undefined, /*expression*/ undefined), pos);
        }
    }
    function parseSimpleArrowFunctionExpression(pos, identifier, allowReturnTypeInArrowFunction, asyncModifier) {
        ts_1.Debug.assert(token() === 39 /* SyntaxKind.EqualsGreaterThanToken */, "parseSimpleArrowFunctionExpression should only have been called if we had a =>");
        var parameter = factory.createParameterDeclaration(
        /*modifiers*/ undefined, 
        /*dotDotDotToken*/ undefined, identifier, 
        /*questionToken*/ undefined, 
        /*type*/ undefined, 
        /*initializer*/ undefined);
        finishNode(parameter, identifier.pos);
        var parameters = createNodeArray([parameter], parameter.pos, parameter.end);
        var equalsGreaterThanToken = parseExpectedToken(39 /* SyntaxKind.EqualsGreaterThanToken */);
        var body = parseArrowFunctionExpressionBody(/*isAsync*/ !!asyncModifier, allowReturnTypeInArrowFunction);
        var node = factory.createArrowFunction(asyncModifier, /*typeParameters*/ undefined, parameters, /*type*/ undefined, equalsGreaterThanToken, body);
        return addJSDocComment(finishNode(node, pos));
    }
    function tryParseParenthesizedArrowFunctionExpression(allowReturnTypeInArrowFunction) {
        var triState = isParenthesizedArrowFunctionExpression();
        if (triState === 0 /* Tristate.False */) {
            // It's definitely not a parenthesized arrow function expression.
            return undefined;
        }
        // If we definitely have an arrow function, then we can just parse one, not requiring a
        // following => or { token. Otherwise, we *might* have an arrow function.  Try to parse
        // it out, but don't allow any ambiguity, and return 'undefined' if this could be an
        // expression instead.
        return triState === 1 /* Tristate.True */ ?
            parseParenthesizedArrowFunctionExpression(/*allowAmbiguity*/ true, /*allowReturnTypeInArrowFunction*/ true) :
            tryParse(function () { return parsePossibleParenthesizedArrowFunctionExpression(allowReturnTypeInArrowFunction); });
    }
    //  True        -> We definitely expect a parenthesized arrow function here.
    //  False       -> There *cannot* be a parenthesized arrow function here.
    //  Unknown     -> There *might* be a parenthesized arrow function here.
    //                 Speculatively look ahead to be sure, and rollback if not.
    function isParenthesizedArrowFunctionExpression() {
        if (token() === 21 /* SyntaxKind.OpenParenToken */ || token() === 30 /* SyntaxKind.LessThanToken */ || token() === 134 /* SyntaxKind.AsyncKeyword */) {
            return lookAhead(isParenthesizedArrowFunctionExpressionWorker);
        }
        if (token() === 39 /* SyntaxKind.EqualsGreaterThanToken */) {
            // ERROR RECOVERY TWEAK:
            // If we see a standalone => try to parse it as an arrow function expression as that's
            // likely what the user intended to write.
            return 1 /* Tristate.True */;
        }
        // Definitely not a parenthesized arrow function.
        return 0 /* Tristate.False */;
    }
    function isParenthesizedArrowFunctionExpressionWorker() {
        if (token() === 134 /* SyntaxKind.AsyncKeyword */) {
            nextToken();
            if (scanner.hasPrecedingLineBreak()) {
                return 0 /* Tristate.False */;
            }
            if (token() !== 21 /* SyntaxKind.OpenParenToken */ && token() !== 30 /* SyntaxKind.LessThanToken */) {
                return 0 /* Tristate.False */;
            }
        }
        var first = token();
        var second = nextToken();
        if (first === 21 /* SyntaxKind.OpenParenToken */) {
            if (second === 22 /* SyntaxKind.CloseParenToken */) {
                // Simple cases: "() =>", "(): ", and "() {".
                // This is an arrow function with no parameters.
                // The last one is not actually an arrow function,
                // but this is probably what the user intended.
                var third = nextToken();
                switch (third) {
                    case 39 /* SyntaxKind.EqualsGreaterThanToken */:
                    case 59 /* SyntaxKind.ColonToken */:
                    case 19 /* SyntaxKind.OpenBraceToken */:
                        return 1 /* Tristate.True */;
                    default:
                        return 0 /* Tristate.False */;
                }
            }
            // If encounter "([" or "({", this could be the start of a binding pattern.
            // Examples:
            //      ([ x ]) => { }
            //      ({ x }) => { }
            //      ([ x ])
            //      ({ x })
            if (second === 23 /* SyntaxKind.OpenBracketToken */ || second === 19 /* SyntaxKind.OpenBraceToken */) {
                return 2 /* Tristate.Unknown */;
            }
            // Simple case: "(..."
            // This is an arrow function with a rest parameter.
            if (second === 26 /* SyntaxKind.DotDotDotToken */) {
                return 1 /* Tristate.True */;
            }
            // Check for "(xxx yyy", where xxx is a modifier and yyy is an identifier. This
            // isn't actually allowed, but we want to treat it as a lambda so we can provide
            // a good error message.
            if ((0, ts_1.isModifierKind)(second) && second !== 134 /* SyntaxKind.AsyncKeyword */ && lookAhead(nextTokenIsIdentifier)) {
                if (nextToken() === 130 /* SyntaxKind.AsKeyword */) {
                    // https://github.com/microsoft/TypeScript/issues/44466
                    return 0 /* Tristate.False */;
                }
                return 1 /* Tristate.True */;
            }
            // If we had "(" followed by something that's not an identifier,
            // then this definitely doesn't look like a lambda.  "this" is not
            // valid, but we want to parse it and then give a semantic error.
            if (!isIdentifier() && second !== 110 /* SyntaxKind.ThisKeyword */) {
                return 0 /* Tristate.False */;
            }
            switch (nextToken()) {
                case 59 /* SyntaxKind.ColonToken */:
                    // If we have something like "(a:", then we must have a
                    // type-annotated parameter in an arrow function expression.
                    return 1 /* Tristate.True */;
                case 58 /* SyntaxKind.QuestionToken */:
                    nextToken();
                    // If we have "(a?:" or "(a?," or "(a?=" or "(a?)" then it is definitely a lambda.
                    if (token() === 59 /* SyntaxKind.ColonToken */ || token() === 28 /* SyntaxKind.CommaToken */ || token() === 64 /* SyntaxKind.EqualsToken */ || token() === 22 /* SyntaxKind.CloseParenToken */) {
                        return 1 /* Tristate.True */;
                    }
                    // Otherwise it is definitely not a lambda.
                    return 0 /* Tristate.False */;
                case 28 /* SyntaxKind.CommaToken */:
                case 64 /* SyntaxKind.EqualsToken */:
                case 22 /* SyntaxKind.CloseParenToken */:
                    // If we have "(a," or "(a=" or "(a)" this *could* be an arrow function
                    return 2 /* Tristate.Unknown */;
            }
            // It is definitely not an arrow function
            return 0 /* Tristate.False */;
        }
        else {
            ts_1.Debug.assert(first === 30 /* SyntaxKind.LessThanToken */);
            // If we have "<" not followed by an identifier,
            // then this definitely is not an arrow function.
            if (!isIdentifier() && token() !== 87 /* SyntaxKind.ConstKeyword */) {
                return 0 /* Tristate.False */;
            }
            // JSX overrides
            if (languageVariant === 1 /* LanguageVariant.JSX */) {
                var isArrowFunctionInJsx = lookAhead(function () {
                    parseOptional(87 /* SyntaxKind.ConstKeyword */);
                    var third = nextToken();
                    if (third === 96 /* SyntaxKind.ExtendsKeyword */) {
                        var fourth = nextToken();
                        switch (fourth) {
                            case 64 /* SyntaxKind.EqualsToken */:
                            case 32 /* SyntaxKind.GreaterThanToken */:
                            case 44 /* SyntaxKind.SlashToken */:
                                return false;
                            default:
                                return true;
                        }
                    }
                    else if (third === 28 /* SyntaxKind.CommaToken */ || third === 64 /* SyntaxKind.EqualsToken */) {
                        return true;
                    }
                    return false;
                });
                if (isArrowFunctionInJsx) {
                    return 1 /* Tristate.True */;
                }
                return 0 /* Tristate.False */;
            }
            // This *could* be a parenthesized arrow function.
            return 2 /* Tristate.Unknown */;
        }
    }
    function parsePossibleParenthesizedArrowFunctionExpression(allowReturnTypeInArrowFunction) {
        var tokenPos = scanner.getTokenStart();
        if (notParenthesizedArrow === null || notParenthesizedArrow === void 0 ? void 0 : notParenthesizedArrow.has(tokenPos)) {
            return undefined;
        }
        var result = parseParenthesizedArrowFunctionExpression(/*allowAmbiguity*/ false, allowReturnTypeInArrowFunction);
        if (!result) {
            (notParenthesizedArrow || (notParenthesizedArrow = new Set())).add(tokenPos);
        }
        return result;
    }
    function tryParseAsyncSimpleArrowFunctionExpression(allowReturnTypeInArrowFunction) {
        // We do a check here so that we won't be doing unnecessarily call to "lookAhead"
        if (token() === 134 /* SyntaxKind.AsyncKeyword */) {
            if (lookAhead(isUnParenthesizedAsyncArrowFunctionWorker) === 1 /* Tristate.True */) {
                var pos = getNodePos();
                var asyncModifier = parseModifiersForArrowFunction();
                var expr = parseBinaryExpressionOrHigher(0 /* OperatorPrecedence.Lowest */);
                return parseSimpleArrowFunctionExpression(pos, expr, allowReturnTypeInArrowFunction, asyncModifier);
            }
        }
        return undefined;
    }
    function isUnParenthesizedAsyncArrowFunctionWorker() {
        // AsyncArrowFunctionExpression:
        //      1) async[no LineTerminator here]AsyncArrowBindingIdentifier[?Yield][no LineTerminator here]=>AsyncConciseBody[?In]
        //      2) CoverCallExpressionAndAsyncArrowHead[?Yield, ?Await][no LineTerminator here]=>AsyncConciseBody[?In]
        if (token() === 134 /* SyntaxKind.AsyncKeyword */) {
            nextToken();
            // If the "async" is followed by "=>" token then it is not a beginning of an async arrow-function
            // but instead a simple arrow-function which will be parsed inside "parseAssignmentExpressionOrHigher"
            if (scanner.hasPrecedingLineBreak() || token() === 39 /* SyntaxKind.EqualsGreaterThanToken */) {
                return 0 /* Tristate.False */;
            }
            // Check for un-parenthesized AsyncArrowFunction
            var expr = parseBinaryExpressionOrHigher(0 /* OperatorPrecedence.Lowest */);
            if (!scanner.hasPrecedingLineBreak() && expr.kind === 80 /* SyntaxKind.Identifier */ && token() === 39 /* SyntaxKind.EqualsGreaterThanToken */) {
                return 1 /* Tristate.True */;
            }
        }
        return 0 /* Tristate.False */;
    }
    function parseParenthesizedArrowFunctionExpression(allowAmbiguity, allowReturnTypeInArrowFunction) {
        var pos = getNodePos();
        var hasJSDoc = hasPrecedingJSDocComment();
        var modifiers = parseModifiersForArrowFunction();
        var isAsync = (0, ts_1.some)(modifiers, ts_1.isAsyncModifier) ? 2 /* SignatureFlags.Await */ : 0 /* SignatureFlags.None */;
        // Arrow functions are never generators.
        //
        // If we're speculatively parsing a signature for a parenthesized arrow function, then
        // we have to have a complete parameter list.  Otherwise we might see something like
        // a => (b => c)
        // And think that "(b =>" was actually a parenthesized arrow function with a missing
        // close paren.
        var typeParameters = parseTypeParameters();
        var parameters;
        if (!parseExpected(21 /* SyntaxKind.OpenParenToken */)) {
            if (!allowAmbiguity) {
                return undefined;
            }
            parameters = createMissingList();
        }
        else {
            if (!allowAmbiguity) {
                var maybeParameters = parseParametersWorker(isAsync, allowAmbiguity);
                if (!maybeParameters) {
                    return undefined;
                }
                parameters = maybeParameters;
            }
            else {
                parameters = parseParametersWorker(isAsync, allowAmbiguity);
            }
            if (!parseExpected(22 /* SyntaxKind.CloseParenToken */) && !allowAmbiguity) {
                return undefined;
            }
        }
        var hasReturnColon = token() === 59 /* SyntaxKind.ColonToken */;
        var type = parseReturnType(59 /* SyntaxKind.ColonToken */, /*isType*/ false);
        if (type && !allowAmbiguity && typeHasArrowFunctionBlockingParseError(type)) {
            return undefined;
        }
        // Parsing a signature isn't enough.
        // Parenthesized arrow signatures often look like other valid expressions.
        // For instance:
        //  - "(x = 10)" is an assignment expression parsed as a signature with a default parameter value.
        //  - "(x,y)" is a comma expression parsed as a signature with two parameters.
        //  - "a ? (b): c" will have "(b):" parsed as a signature with a return type annotation.
        //  - "a ? (b): function() {}" will too, since function() is a valid JSDoc function type.
        //  - "a ? (b): (function() {})" as well, but inside of a parenthesized type with an arbitrary amount of nesting.
        //
        // So we need just a bit of lookahead to ensure that it can only be a signature.
        var unwrappedType = type;
        while ((unwrappedType === null || unwrappedType === void 0 ? void 0 : unwrappedType.kind) === 195 /* SyntaxKind.ParenthesizedType */) {
            unwrappedType = unwrappedType.type; // Skip parens if need be
        }
        var hasJSDocFunctionType = unwrappedType && (0, ts_1.isJSDocFunctionType)(unwrappedType);
        if (!allowAmbiguity && token() !== 39 /* SyntaxKind.EqualsGreaterThanToken */ && (hasJSDocFunctionType || token() !== 19 /* SyntaxKind.OpenBraceToken */)) {
            // Returning undefined here will cause our caller to rewind to where we started from.
            return undefined;
        }
        // If we have an arrow, then try to parse the body. Even if not, try to parse if we
        // have an opening brace, just in case we're in an error state.
        var lastToken = token();
        var equalsGreaterThanToken = parseExpectedToken(39 /* SyntaxKind.EqualsGreaterThanToken */);
        var body = (lastToken === 39 /* SyntaxKind.EqualsGreaterThanToken */ || lastToken === 19 /* SyntaxKind.OpenBraceToken */)
            ? parseArrowFunctionExpressionBody((0, ts_1.some)(modifiers, ts_1.isAsyncModifier), allowReturnTypeInArrowFunction)
            : parseIdentifier();
        // Given:
        //     x ? y => ({ y }) : z => ({ z })
        // We try to parse the body of the first arrow function by looking at:
        //     ({ y }) : z => ({ z })
        // This is a valid arrow function with "z" as the return type.
        //
        // But, if we're in the true side of a conditional expression, this colon
        // terminates the expression, so we cannot allow a return type if we aren't
        // certain whether or not the preceding text was parsed as a parameter list.
        //
        // For example,
        //     a() ? (b: number, c?: string): void => d() : e
        // is determined by isParenthesizedArrowFunctionExpression to unambiguously
        // be an arrow expression, so we allow a return type.
        if (!allowReturnTypeInArrowFunction && hasReturnColon) {
            // However, if the arrow function we were able to parse is followed by another colon
            // as in:
            //     a ? (x): string => x : null
            // Then allow the arrow function, and treat the second colon as terminating
            // the conditional expression. It's okay to do this because this code would
            // be a syntax error in JavaScript (as the second colon shouldn't be there).
            if (token() !== 59 /* SyntaxKind.ColonToken */) {
                return undefined;
            }
        }
        var node = factory.createArrowFunction(modifiers, typeParameters, parameters, type, equalsGreaterThanToken, body);
        return withJSDoc(finishNode(node, pos), hasJSDoc);
    }
    function parseArrowFunctionExpressionBody(isAsync, allowReturnTypeInArrowFunction) {
        if (token() === 19 /* SyntaxKind.OpenBraceToken */) {
            return parseFunctionBlock(isAsync ? 2 /* SignatureFlags.Await */ : 0 /* SignatureFlags.None */);
        }
        if (token() !== 27 /* SyntaxKind.SemicolonToken */ &&
            token() !== 100 /* SyntaxKind.FunctionKeyword */ &&
            token() !== 86 /* SyntaxKind.ClassKeyword */ &&
            isStartOfStatement() &&
            !isStartOfExpressionStatement()) {
            // Check if we got a plain statement (i.e. no expression-statements, no function/class expressions/declarations)
            //
            // Here we try to recover from a potential error situation in the case where the
            // user meant to supply a block. For example, if the user wrote:
            //
            //  a =>
            //      let v = 0;
            //  }
            //
            // they may be missing an open brace.  Check to see if that's the case so we can
            // try to recover better.  If we don't do this, then the next close curly we see may end
            // up preemptively closing the containing construct.
            //
            // Note: even when 'IgnoreMissingOpenBrace' is passed, parseBody will still error.
            return parseFunctionBlock(16 /* SignatureFlags.IgnoreMissingOpenBrace */ | (isAsync ? 2 /* SignatureFlags.Await */ : 0 /* SignatureFlags.None */));
        }
        var savedTopLevel = topLevel;
        topLevel = false;
        var node = isAsync
            ? doInAwaitContext(function () { return parseAssignmentExpressionOrHigher(allowReturnTypeInArrowFunction); })
            : doOutsideOfAwaitContext(function () { return parseAssignmentExpressionOrHigher(allowReturnTypeInArrowFunction); });
        topLevel = savedTopLevel;
        return node;
    }
    function parseConditionalExpressionRest(leftOperand, pos, allowReturnTypeInArrowFunction) {
        // Note: we are passed in an expression which was produced from parseBinaryExpressionOrHigher.
        var questionToken = parseOptionalToken(58 /* SyntaxKind.QuestionToken */);
        if (!questionToken) {
            return leftOperand;
        }
        // Note: we explicitly 'allowIn' in the whenTrue part of the condition expression, and
        // we do not that for the 'whenFalse' part.
        var colonToken;
        return finishNode(factory.createConditionalExpression(leftOperand, questionToken, doOutsideOfContext(disallowInAndDecoratorContext, function () { return parseAssignmentExpressionOrHigher(/*allowReturnTypeInArrowFunction*/ false); }), colonToken = parseExpectedToken(59 /* SyntaxKind.ColonToken */), (0, ts_1.nodeIsPresent)(colonToken)
            ? parseAssignmentExpressionOrHigher(allowReturnTypeInArrowFunction)
            : createMissingNode(80 /* SyntaxKind.Identifier */, /*reportAtCurrentPosition*/ false, ts_1.Diagnostics._0_expected, (0, ts_1.tokenToString)(59 /* SyntaxKind.ColonToken */))), pos);
    }
    function parseBinaryExpressionOrHigher(precedence) {
        var pos = getNodePos();
        var leftOperand = parseUnaryExpressionOrHigher();
        return parseBinaryExpressionRest(precedence, leftOperand, pos);
    }
    function isInOrOfKeyword(t) {
        return t === 103 /* SyntaxKind.InKeyword */ || t === 164 /* SyntaxKind.OfKeyword */;
    }
    function parseBinaryExpressionRest(precedence, leftOperand, pos) {
        while (true) {
            // We either have a binary operator here, or we're finished.  We call
            // reScanGreaterToken so that we merge token sequences like > and = into >=
            reScanGreaterToken();
            var newPrecedence = (0, ts_1.getBinaryOperatorPrecedence)(token());
            // Check the precedence to see if we should "take" this operator
            // - For left associative operator (all operator but **), consume the operator,
            //   recursively call the function below, and parse binaryExpression as a rightOperand
            //   of the caller if the new precedence of the operator is greater then or equal to the current precedence.
            //   For example:
            //      a - b - c;
            //            ^token; leftOperand = b. Return b to the caller as a rightOperand
            //      a * b - c
            //            ^token; leftOperand = b. Return b to the caller as a rightOperand
            //      a - b * c;
            //            ^token; leftOperand = b. Return b * c to the caller as a rightOperand
            // - For right associative operator (**), consume the operator, recursively call the function
            //   and parse binaryExpression as a rightOperand of the caller if the new precedence of
            //   the operator is strictly grater than the current precedence
            //   For example:
            //      a ** b ** c;
            //             ^^token; leftOperand = b. Return b ** c to the caller as a rightOperand
            //      a - b ** c;
            //            ^^token; leftOperand = b. Return b ** c to the caller as a rightOperand
            //      a ** b - c
            //             ^token; leftOperand = b. Return b to the caller as a rightOperand
            var consumeCurrentOperator = token() === 43 /* SyntaxKind.AsteriskAsteriskToken */ ?
                newPrecedence >= precedence :
                newPrecedence > precedence;
            if (!consumeCurrentOperator) {
                break;
            }
            if (token() === 103 /* SyntaxKind.InKeyword */ && inDisallowInContext()) {
                break;
            }
            if (token() === 130 /* SyntaxKind.AsKeyword */ || token() === 152 /* SyntaxKind.SatisfiesKeyword */) {
                // Make sure we *do* perform ASI for constructs like this:
                //    var x = foo
                //    as (Bar)
                // This should be parsed as an initialized variable, followed
                // by a function call to 'as' with the argument 'Bar'
                if (scanner.hasPrecedingLineBreak()) {
                    break;
                }
                else {
                    var keywordKind = token();
                    nextToken();
                    leftOperand = keywordKind === 152 /* SyntaxKind.SatisfiesKeyword */ ? makeSatisfiesExpression(leftOperand, parseType()) :
                        makeAsExpression(leftOperand, parseType());
                }
            }
            else {
                leftOperand = makeBinaryExpression(leftOperand, parseTokenNode(), parseBinaryExpressionOrHigher(newPrecedence), pos);
            }
        }
        return leftOperand;
    }
    function isBinaryOperator() {
        if (inDisallowInContext() && token() === 103 /* SyntaxKind.InKeyword */) {
            return false;
        }
        return (0, ts_1.getBinaryOperatorPrecedence)(token()) > 0;
    }
    function makeSatisfiesExpression(left, right) {
        return finishNode(factory.createSatisfiesExpression(left, right), left.pos);
    }
    function makeBinaryExpression(left, operatorToken, right, pos) {
        return finishNode(factory.createBinaryExpression(left, operatorToken, right), pos);
    }
    function makeAsExpression(left, right) {
        return finishNode(factory.createAsExpression(left, right), left.pos);
    }
    function parsePrefixUnaryExpression() {
        var pos = getNodePos();
        return finishNode(factory.createPrefixUnaryExpression(token(), nextTokenAnd(parseSimpleUnaryExpression)), pos);
    }
    function parseDeleteExpression() {
        var pos = getNodePos();
        return finishNode(factory.createDeleteExpression(nextTokenAnd(parseSimpleUnaryExpression)), pos);
    }
    function parseTypeOfExpression() {
        var pos = getNodePos();
        return finishNode(factory.createTypeOfExpression(nextTokenAnd(parseSimpleUnaryExpression)), pos);
    }
    function parseVoidExpression() {
        var pos = getNodePos();
        return finishNode(factory.createVoidExpression(nextTokenAnd(parseSimpleUnaryExpression)), pos);
    }
    function isAwaitExpression() {
        if (token() === 135 /* SyntaxKind.AwaitKeyword */) {
            if (inAwaitContext()) {
                return true;
            }
            // here we are using similar heuristics as 'isYieldExpression'
            return lookAhead(nextTokenIsIdentifierOrKeywordOrLiteralOnSameLine);
        }
        return false;
    }
    function parseAwaitExpression() {
        var pos = getNodePos();
        return finishNode(factory.createAwaitExpression(nextTokenAnd(parseSimpleUnaryExpression)), pos);
    }
    /**
     * Parse ES7 exponential expression and await expression
     *
     * ES7 ExponentiationExpression:
     *      1) UnaryExpression[?Yield]
     *      2) UpdateExpression[?Yield] ** ExponentiationExpression[?Yield]
     *
     */
    function parseUnaryExpressionOrHigher() {
        /**
         * ES7 UpdateExpression:
         *      1) LeftHandSideExpression[?Yield]
         *      2) LeftHandSideExpression[?Yield][no LineTerminator here]++
         *      3) LeftHandSideExpression[?Yield][no LineTerminator here]--
         *      4) ++UnaryExpression[?Yield]
         *      5) --UnaryExpression[?Yield]
         */
        if (isUpdateExpression()) {
            var pos = getNodePos();
            var updateExpression = parseUpdateExpression();
            return token() === 43 /* SyntaxKind.AsteriskAsteriskToken */ ?
                parseBinaryExpressionRest((0, ts_1.getBinaryOperatorPrecedence)(token()), updateExpression, pos) :
                updateExpression;
        }
        /**
         * ES7 UnaryExpression:
         *      1) UpdateExpression[?yield]
         *      2) delete UpdateExpression[?yield]
         *      3) void UpdateExpression[?yield]
         *      4) typeof UpdateExpression[?yield]
         *      5) + UpdateExpression[?yield]
         *      6) - UpdateExpression[?yield]
         *      7) ~ UpdateExpression[?yield]
         *      8) ! UpdateExpression[?yield]
         */
        var unaryOperator = token();
        var simpleUnaryExpression = parseSimpleUnaryExpression();
        if (token() === 43 /* SyntaxKind.AsteriskAsteriskToken */) {
            var pos = (0, ts_1.skipTrivia)(sourceText, simpleUnaryExpression.pos);
            var end = simpleUnaryExpression.end;
            if (simpleUnaryExpression.kind === 215 /* SyntaxKind.TypeAssertionExpression */) {
                parseErrorAt(pos, end, ts_1.Diagnostics.A_type_assertion_expression_is_not_allowed_in_the_left_hand_side_of_an_exponentiation_expression_Consider_enclosing_the_expression_in_parentheses);
            }
            else {
                ts_1.Debug.assert((0, ts_1.isKeywordOrPunctuation)(unaryOperator));
                parseErrorAt(pos, end, ts_1.Diagnostics.An_unary_expression_with_the_0_operator_is_not_allowed_in_the_left_hand_side_of_an_exponentiation_expression_Consider_enclosing_the_expression_in_parentheses, (0, ts_1.tokenToString)(unaryOperator));
            }
        }
        return simpleUnaryExpression;
    }
    /**
     * Parse ES7 simple-unary expression or higher:
     *
     * ES7 UnaryExpression:
     *      1) UpdateExpression[?yield]
     *      2) delete UnaryExpression[?yield]
     *      3) void UnaryExpression[?yield]
     *      4) typeof UnaryExpression[?yield]
     *      5) + UnaryExpression[?yield]
     *      6) - UnaryExpression[?yield]
     *      7) ~ UnaryExpression[?yield]
     *      8) ! UnaryExpression[?yield]
     *      9) [+Await] await UnaryExpression[?yield]
     */
    function parseSimpleUnaryExpression() {
        switch (token()) {
            case 40 /* SyntaxKind.PlusToken */:
            case 41 /* SyntaxKind.MinusToken */:
            case 55 /* SyntaxKind.TildeToken */:
            case 54 /* SyntaxKind.ExclamationToken */:
                return parsePrefixUnaryExpression();
            case 91 /* SyntaxKind.DeleteKeyword */:
                return parseDeleteExpression();
            case 114 /* SyntaxKind.TypeOfKeyword */:
                return parseTypeOfExpression();
            case 116 /* SyntaxKind.VoidKeyword */:
                return parseVoidExpression();
            case 30 /* SyntaxKind.LessThanToken */:
                // Just like in parseUpdateExpression, we need to avoid parsing type assertions when
                // in JSX and we see an expression like "+ <foo> bar".
                if (languageVariant === 1 /* LanguageVariant.JSX */) {
                    return parseJsxElementOrSelfClosingElementOrFragment(/*inExpressionContext*/ true, /*topInvalidNodePosition*/ undefined, /*openingTag*/ undefined, /*mustBeUnary*/ true);
                }
                // This is modified UnaryExpression grammar in TypeScript
                //  UnaryExpression (modified):
                //      < type > UnaryExpression
                return parseTypeAssertion();
            case 135 /* SyntaxKind.AwaitKeyword */:
                if (isAwaitExpression()) {
                    return parseAwaitExpression();
                }
            // falls through
            default:
                return parseUpdateExpression();
        }
    }
    /**
     * Check if the current token can possibly be an ES7 increment expression.
     *
     * ES7 UpdateExpression:
     *      LeftHandSideExpression[?Yield]
     *      LeftHandSideExpression[?Yield][no LineTerminator here]++
     *      LeftHandSideExpression[?Yield][no LineTerminator here]--
     *      ++LeftHandSideExpression[?Yield]
     *      --LeftHandSideExpression[?Yield]
     */
    function isUpdateExpression() {
        // This function is called inside parseUnaryExpression to decide
        // whether to call parseSimpleUnaryExpression or call parseUpdateExpression directly
        switch (token()) {
            case 40 /* SyntaxKind.PlusToken */:
            case 41 /* SyntaxKind.MinusToken */:
            case 55 /* SyntaxKind.TildeToken */:
            case 54 /* SyntaxKind.ExclamationToken */:
            case 91 /* SyntaxKind.DeleteKeyword */:
            case 114 /* SyntaxKind.TypeOfKeyword */:
            case 116 /* SyntaxKind.VoidKeyword */:
            case 135 /* SyntaxKind.AwaitKeyword */:
                return false;
            case 30 /* SyntaxKind.LessThanToken */:
                // If we are not in JSX context, we are parsing TypeAssertion which is an UnaryExpression
                if (languageVariant !== 1 /* LanguageVariant.JSX */) {
                    return false;
                }
            // We are in JSX context and the token is part of JSXElement.
            // falls through
            default:
                return true;
        }
    }
    /**
     * Parse ES7 UpdateExpression. UpdateExpression is used instead of ES6's PostFixExpression.
     *
     * ES7 UpdateExpression[yield]:
     *      1) LeftHandSideExpression[?yield]
     *      2) LeftHandSideExpression[?yield] [[no LineTerminator here]]++
     *      3) LeftHandSideExpression[?yield] [[no LineTerminator here]]--
     *      4) ++LeftHandSideExpression[?yield]
     *      5) --LeftHandSideExpression[?yield]
     * In TypeScript (2), (3) are parsed as PostfixUnaryExpression. (4), (5) are parsed as PrefixUnaryExpression
     */
    function parseUpdateExpression() {
        if (token() === 46 /* SyntaxKind.PlusPlusToken */ || token() === 47 /* SyntaxKind.MinusMinusToken */) {
            var pos = getNodePos();
            return finishNode(factory.createPrefixUnaryExpression(token(), nextTokenAnd(parseLeftHandSideExpressionOrHigher)), pos);
        }
        else if (languageVariant === 1 /* LanguageVariant.JSX */ && token() === 30 /* SyntaxKind.LessThanToken */ && lookAhead(nextTokenIsIdentifierOrKeywordOrGreaterThan)) {
            // JSXElement is part of primaryExpression
            return parseJsxElementOrSelfClosingElementOrFragment(/*inExpressionContext*/ true);
        }
        var expression = parseLeftHandSideExpressionOrHigher();
        ts_1.Debug.assert((0, ts_1.isLeftHandSideExpression)(expression));
        if ((token() === 46 /* SyntaxKind.PlusPlusToken */ || token() === 47 /* SyntaxKind.MinusMinusToken */) && !scanner.hasPrecedingLineBreak()) {
            var operator = token();
            nextToken();
            return finishNode(factory.createPostfixUnaryExpression(expression, operator), expression.pos);
        }
        return expression;
    }
    function parseLeftHandSideExpressionOrHigher() {
        // Original Ecma:
        // LeftHandSideExpression: See 11.2
        //      NewExpression
        //      CallExpression
        //
        // Our simplification:
        //
        // LeftHandSideExpression: See 11.2
        //      MemberExpression
        //      CallExpression
        //
        // See comment in parseMemberExpressionOrHigher on how we replaced NewExpression with
        // MemberExpression to make our lives easier.
        //
        // to best understand the below code, it's important to see how CallExpression expands
        // out into its own productions:
        //
        // CallExpression:
        //      MemberExpression Arguments
        //      CallExpression Arguments
        //      CallExpression[Expression]
        //      CallExpression.IdentifierName
        //      import (AssignmentExpression)
        //      super Arguments
        //      super.IdentifierName
        //
        // Because of the recursion in these calls, we need to bottom out first. There are three
        // bottom out states we can run into: 1) We see 'super' which must start either of
        // the last two CallExpression productions. 2) We see 'import' which must start import call.
        // 3)we have a MemberExpression which either completes the LeftHandSideExpression,
        // or starts the beginning of the first four CallExpression productions.
        var pos = getNodePos();
        var expression;
        if (token() === 102 /* SyntaxKind.ImportKeyword */) {
            if (lookAhead(nextTokenIsOpenParenOrLessThan)) {
                // We don't want to eagerly consume all import keyword as import call expression so we look ahead to find "("
                // For example:
                //      var foo3 = require("subfolder
                //      import * as foo1 from "module-from-node
                // We want this import to be a statement rather than import call expression
                sourceFlags |= 2097152 /* NodeFlags.PossiblyContainsDynamicImport */;
                expression = parseTokenNode();
            }
            else if (lookAhead(nextTokenIsDot)) {
                // This is an 'import.*' metaproperty (i.e. 'import.meta')
                nextToken(); // advance past the 'import'
                nextToken(); // advance past the dot
                expression = finishNode(factory.createMetaProperty(102 /* SyntaxKind.ImportKeyword */, parseIdentifierName()), pos);
                sourceFlags |= 4194304 /* NodeFlags.PossiblyContainsImportMeta */;
            }
            else {
                expression = parseMemberExpressionOrHigher();
            }
        }
        else {
            expression = token() === 108 /* SyntaxKind.SuperKeyword */ ? parseSuperExpression() : parseMemberExpressionOrHigher();
        }
        // Now, we *may* be complete.  However, we might have consumed the start of a
        // CallExpression or OptionalExpression.  As such, we need to consume the rest
        // of it here to be complete.
        return parseCallExpressionRest(pos, expression);
    }
    function parseMemberExpressionOrHigher() {
        // Note: to make our lives simpler, we decompose the NewExpression productions and
        // place ObjectCreationExpression and FunctionExpression into PrimaryExpression.
        // like so:
        //
        //   PrimaryExpression : See 11.1
        //      this
        //      Identifier
        //      Literal
        //      ArrayLiteral
        //      ObjectLiteral
        //      (Expression)
        //      FunctionExpression
        //      new MemberExpression Arguments?
        //
        //   MemberExpression : See 11.2
        //      PrimaryExpression
        //      MemberExpression[Expression]
        //      MemberExpression.IdentifierName
        //
        //   CallExpression : See 11.2
        //      MemberExpression
        //      CallExpression Arguments
        //      CallExpression[Expression]
        //      CallExpression.IdentifierName
        //
        // Technically this is ambiguous.  i.e. CallExpression defines:
        //
        //   CallExpression:
        //      CallExpression Arguments
        //
        // If you see: "new Foo()"
        //
        // Then that could be treated as a single ObjectCreationExpression, or it could be
        // treated as the invocation of "new Foo".  We disambiguate that in code (to match
        // the original grammar) by making sure that if we see an ObjectCreationExpression
        // we always consume arguments if they are there. So we treat "new Foo()" as an
        // object creation only, and not at all as an invocation.  Another way to think
        // about this is that for every "new" that we see, we will consume an argument list if
        // it is there as part of the *associated* object creation node.  Any additional
        // argument lists we see, will become invocation expressions.
        //
        // Because there are no other places in the grammar now that refer to FunctionExpression
        // or ObjectCreationExpression, it is safe to push down into the PrimaryExpression
        // production.
        //
        // Because CallExpression and MemberExpression are left recursive, we need to bottom out
        // of the recursion immediately.  So we parse out a primary expression to start with.
        var pos = getNodePos();
        var expression = parsePrimaryExpression();
        return parseMemberExpressionRest(pos, expression, /*allowOptionalChain*/ true);
    }
    function parseSuperExpression() {
        var pos = getNodePos();
        var expression = parseTokenNode();
        if (token() === 30 /* SyntaxKind.LessThanToken */) {
            var startPos = getNodePos();
            var typeArguments = tryParse(parseTypeArgumentsInExpression);
            if (typeArguments !== undefined) {
                parseErrorAt(startPos, getNodePos(), ts_1.Diagnostics.super_may_not_use_type_arguments);
                if (!isTemplateStartOfTaggedTemplate()) {
                    expression = factory.createExpressionWithTypeArguments(expression, typeArguments);
                }
            }
        }
        if (token() === 21 /* SyntaxKind.OpenParenToken */ || token() === 25 /* SyntaxKind.DotToken */ || token() === 23 /* SyntaxKind.OpenBracketToken */) {
            return expression;
        }
        // If we have seen "super" it must be followed by '(' or '.'.
        // If it wasn't then just try to parse out a '.' and report an error.
        parseExpectedToken(25 /* SyntaxKind.DotToken */, ts_1.Diagnostics.super_must_be_followed_by_an_argument_list_or_member_access);
        // private names will never work with `super` (`super.#foo`), but that's a semantic error, not syntactic
        return finishNode(factoryCreatePropertyAccessExpression(expression, parseRightSideOfDot(/*allowIdentifierNames*/ true, /*allowPrivateIdentifiers*/ true)), pos);
    }
    function parseJsxElementOrSelfClosingElementOrFragment(inExpressionContext, topInvalidNodePosition, openingTag, mustBeUnary) {
        if (mustBeUnary === void 0) { mustBeUnary = false; }
        var pos = getNodePos();
        var opening = parseJsxOpeningOrSelfClosingElementOrOpeningFragment(inExpressionContext);
        var result;
        if (opening.kind === 285 /* SyntaxKind.JsxOpeningElement */) {
            var children = parseJsxChildren(opening);
            var closingElement = void 0;
            var lastChild = children[children.length - 1];
            if ((lastChild === null || lastChild === void 0 ? void 0 : lastChild.kind) === 283 /* SyntaxKind.JsxElement */
                && !tagNamesAreEquivalent(lastChild.openingElement.tagName, lastChild.closingElement.tagName)
                && tagNamesAreEquivalent(opening.tagName, lastChild.closingElement.tagName)) {
                // when an unclosed JsxOpeningElement incorrectly parses its parent's JsxClosingElement,
                // restructure (<div>(...<span>...</div>)) --> (<div>(...<span>...</>)</div>)
                // (no need to error; the parent will error)
                var end = lastChild.children.end;
                var newLast = finishNode(factory.createJsxElement(lastChild.openingElement, lastChild.children, finishNode(factory.createJsxClosingElement(finishNode(factoryCreateIdentifier(""), end, end)), end, end)), lastChild.openingElement.pos, end);
                children = createNodeArray(__spreadArray(__spreadArray([], children.slice(0, children.length - 1), true), [newLast], false), children.pos, end);
                closingElement = lastChild.closingElement;
            }
            else {
                closingElement = parseJsxClosingElement(opening, inExpressionContext);
                if (!tagNamesAreEquivalent(opening.tagName, closingElement.tagName)) {
                    if (openingTag && (0, ts_1.isJsxOpeningElement)(openingTag) && tagNamesAreEquivalent(closingElement.tagName, openingTag.tagName)) {
                        // opening incorrectly matched with its parent's closing -- put error on opening
                        parseErrorAtRange(opening.tagName, ts_1.Diagnostics.JSX_element_0_has_no_corresponding_closing_tag, (0, ts_1.getTextOfNodeFromSourceText)(sourceText, opening.tagName));
                    }
                    else {
                        // other opening/closing mismatches -- put error on closing
                        parseErrorAtRange(closingElement.tagName, ts_1.Diagnostics.Expected_corresponding_JSX_closing_tag_for_0, (0, ts_1.getTextOfNodeFromSourceText)(sourceText, opening.tagName));
                    }
                }
            }
            result = finishNode(factory.createJsxElement(opening, children, closingElement), pos);
        }
        else if (opening.kind === 288 /* SyntaxKind.JsxOpeningFragment */) {
            result = finishNode(factory.createJsxFragment(opening, parseJsxChildren(opening), parseJsxClosingFragment(inExpressionContext)), pos);
        }
        else {
            ts_1.Debug.assert(opening.kind === 284 /* SyntaxKind.JsxSelfClosingElement */);
            // Nothing else to do for self-closing elements
            result = opening;
        }
        // If the user writes the invalid code '<div></div><div></div>' in an expression context (i.e. not wrapped in
        // an enclosing tag), we'll naively try to parse   ^ this as a 'less than' operator and the remainder of the tag
        // as garbage, which will cause the formatter to badly mangle the JSX. Perform a speculative parse of a JSX
        // element if we see a < token so that we can wrap it in a synthetic binary expression so the formatter
        // does less damage and we can report a better error.
        // Since JSX elements are invalid < operands anyway, this lookahead parse will only occur in error scenarios
        // of one sort or another.
        // If we are in a unary context, we can't do this recovery; the binary expression we return here is not
        // a valid UnaryExpression and will cause problems later.
        if (!mustBeUnary && inExpressionContext && token() === 30 /* SyntaxKind.LessThanToken */) {
            var topBadPos_1 = typeof topInvalidNodePosition === "undefined" ? result.pos : topInvalidNodePosition;
            var invalidElement = tryParse(function () { return parseJsxElementOrSelfClosingElementOrFragment(/*inExpressionContext*/ true, topBadPos_1); });
            if (invalidElement) {
                var operatorToken = createMissingNode(28 /* SyntaxKind.CommaToken */, /*reportAtCurrentPosition*/ false);
                (0, ts_1.setTextRangePosWidth)(operatorToken, invalidElement.pos, 0);
                parseErrorAt((0, ts_1.skipTrivia)(sourceText, topBadPos_1), invalidElement.end, ts_1.Diagnostics.JSX_expressions_must_have_one_parent_element);
                return finishNode(factory.createBinaryExpression(result, operatorToken, invalidElement), pos);
            }
        }
        return result;
    }
    function parseJsxText() {
        var pos = getNodePos();
        var node = factory.createJsxText(scanner.getTokenValue(), currentToken === 13 /* SyntaxKind.JsxTextAllWhiteSpaces */);
        currentToken = scanner.scanJsxToken();
        return finishNode(node, pos);
    }
    function parseJsxChild(openingTag, token) {
        switch (token) {
            case 1 /* SyntaxKind.EndOfFileToken */:
                // If we hit EOF, issue the error at the tag that lacks the closing element
                // rather than at the end of the file (which is useless)
                if ((0, ts_1.isJsxOpeningFragment)(openingTag)) {
                    parseErrorAtRange(openingTag, ts_1.Diagnostics.JSX_fragment_has_no_corresponding_closing_tag);
                }
                else {
                    // We want the error span to cover only 'Foo.Bar' in < Foo.Bar >
                    // or to cover only 'Foo' in < Foo >
                    var tag = openingTag.tagName;
                    var start = Math.min((0, ts_1.skipTrivia)(sourceText, tag.pos), tag.end);
                    parseErrorAt(start, tag.end, ts_1.Diagnostics.JSX_element_0_has_no_corresponding_closing_tag, (0, ts_1.getTextOfNodeFromSourceText)(sourceText, openingTag.tagName));
                }
                return undefined;
            case 31 /* SyntaxKind.LessThanSlashToken */:
            case 7 /* SyntaxKind.ConflictMarkerTrivia */:
                return undefined;
            case 12 /* SyntaxKind.JsxText */:
            case 13 /* SyntaxKind.JsxTextAllWhiteSpaces */:
                return parseJsxText();
            case 19 /* SyntaxKind.OpenBraceToken */:
                return parseJsxExpression(/*inExpressionContext*/ false);
            case 30 /* SyntaxKind.LessThanToken */:
                return parseJsxElementOrSelfClosingElementOrFragment(/*inExpressionContext*/ false, /*topInvalidNodePosition*/ undefined, openingTag);
            default:
                return ts_1.Debug.assertNever(token);
        }
    }
    function parseJsxChildren(openingTag) {
        var list = [];
        var listPos = getNodePos();
        var saveParsingContext = parsingContext;
        parsingContext |= 1 << 14 /* ParsingContext.JsxChildren */;
        while (true) {
            var child = parseJsxChild(openingTag, currentToken = scanner.reScanJsxToken());
            if (!child)
                break;
            list.push(child);
            if ((0, ts_1.isJsxOpeningElement)(openingTag)
                && (child === null || child === void 0 ? void 0 : child.kind) === 283 /* SyntaxKind.JsxElement */
                && !tagNamesAreEquivalent(child.openingElement.tagName, child.closingElement.tagName)
                && tagNamesAreEquivalent(openingTag.tagName, child.closingElement.tagName)) {
                // stop after parsing a mismatched child like <div>...(<span></div>) in order to reattach the </div> higher
                break;
            }
        }
        parsingContext = saveParsingContext;
        return createNodeArray(list, listPos);
    }
    function parseJsxAttributes() {
        var pos = getNodePos();
        return finishNode(factory.createJsxAttributes(parseList(13 /* ParsingContext.JsxAttributes */, parseJsxAttribute)), pos);
    }
    function parseJsxOpeningOrSelfClosingElementOrOpeningFragment(inExpressionContext) {
        var pos = getNodePos();
        parseExpected(30 /* SyntaxKind.LessThanToken */);
        if (token() === 32 /* SyntaxKind.GreaterThanToken */) {
            // See below for explanation of scanJsxText
            scanJsxText();
            return finishNode(factory.createJsxOpeningFragment(), pos);
        }
        var tagName = parseJsxElementName();
        var typeArguments = (contextFlags & 262144 /* NodeFlags.JavaScriptFile */) === 0 ? tryParseTypeArguments() : undefined;
        var attributes = parseJsxAttributes();
        var node;
        if (token() === 32 /* SyntaxKind.GreaterThanToken */) {
            // Closing tag, so scan the immediately-following text with the JSX scanning instead
            // of regular scanning to avoid treating illegal characters (e.g. '#') as immediate
            // scanning errors
            scanJsxText();
            node = factory.createJsxOpeningElement(tagName, typeArguments, attributes);
        }
        else {
            parseExpected(44 /* SyntaxKind.SlashToken */);
            if (parseExpected(32 /* SyntaxKind.GreaterThanToken */, /*diagnosticMessage*/ undefined, /*shouldAdvance*/ false)) {
                // manually advance the scanner in order to look for jsx text inside jsx
                if (inExpressionContext) {
                    nextToken();
                }
                else {
                    scanJsxText();
                }
            }
            node = factory.createJsxSelfClosingElement(tagName, typeArguments, attributes);
        }
        return finishNode(node, pos);
    }
    function parseJsxElementName() {
        var pos = getNodePos();
        // JsxElement can have name in the form of
        //      propertyAccessExpression
        //      primaryExpression in the form of an identifier and "this" keyword
        // We can't just simply use parseLeftHandSideExpressionOrHigher because then we will start consider class,function etc as a keyword
        // We only want to consider "this" as a primaryExpression
        var initialExpression = parseJsxTagName();
        if ((0, ts_1.isJsxNamespacedName)(initialExpression)) {
            return initialExpression; // `a:b.c` is invalid syntax, don't even look for the `.` if we parse `a:b`, and let `parseAttribute` report "unexpected :" instead.
        }
        var expression = initialExpression;
        while (parseOptional(25 /* SyntaxKind.DotToken */)) {
            expression = finishNode(factoryCreatePropertyAccessExpression(expression, parseRightSideOfDot(/*allowIdentifierNames*/ true, /*allowPrivateIdentifiers*/ false)), pos);
        }
        return expression;
    }
    function parseJsxTagName() {
        var pos = getNodePos();
        scanJsxIdentifier();
        var isThis = token() === 110 /* SyntaxKind.ThisKeyword */;
        var tagName = parseIdentifierName();
        if (parseOptional(59 /* SyntaxKind.ColonToken */)) {
            scanJsxIdentifier();
            return finishNode(factory.createJsxNamespacedName(tagName, parseIdentifierName()), pos);
        }
        return isThis ? finishNode(factory.createToken(110 /* SyntaxKind.ThisKeyword */), pos) : tagName;
    }
    function parseJsxExpression(inExpressionContext) {
        var pos = getNodePos();
        if (!parseExpected(19 /* SyntaxKind.OpenBraceToken */)) {
            return undefined;
        }
        var dotDotDotToken;
        var expression;
        if (token() !== 20 /* SyntaxKind.CloseBraceToken */) {
            dotDotDotToken = parseOptionalToken(26 /* SyntaxKind.DotDotDotToken */);
            // Only an AssignmentExpression is valid here per the JSX spec,
            // but we can unambiguously parse a comma sequence and provide
            // a better error message in grammar checking.
            expression = parseExpression();
        }
        if (inExpressionContext) {
            parseExpected(20 /* SyntaxKind.CloseBraceToken */);
        }
        else {
            if (parseExpected(20 /* SyntaxKind.CloseBraceToken */, /*diagnosticMessage*/ undefined, /*shouldAdvance*/ false)) {
                scanJsxText();
            }
        }
        return finishNode(factory.createJsxExpression(dotDotDotToken, expression), pos);
    }
    function parseJsxAttribute() {
        if (token() === 19 /* SyntaxKind.OpenBraceToken */) {
            return parseJsxSpreadAttribute();
        }
        var pos = getNodePos();
        return finishNode(factory.createJsxAttribute(parseJsxAttributeName(), parseJsxAttributeValue()), pos);
    }
    function parseJsxAttributeValue() {
        if (token() === 64 /* SyntaxKind.EqualsToken */) {
            if (scanJsxAttributeValue() === 11 /* SyntaxKind.StringLiteral */) {
                return parseLiteralNode();
            }
            if (token() === 19 /* SyntaxKind.OpenBraceToken */) {
                return parseJsxExpression(/*inExpressionContext*/ true);
            }
            if (token() === 30 /* SyntaxKind.LessThanToken */) {
                return parseJsxElementOrSelfClosingElementOrFragment(/*inExpressionContext*/ true);
            }
            parseErrorAtCurrentToken(ts_1.Diagnostics.or_JSX_element_expected);
        }
        return undefined;
    }
    function parseJsxAttributeName() {
        var pos = getNodePos();
        scanJsxIdentifier();
        var attrName = parseIdentifierName();
        if (parseOptional(59 /* SyntaxKind.ColonToken */)) {
            scanJsxIdentifier();
            return finishNode(factory.createJsxNamespacedName(attrName, parseIdentifierName()), pos);
        }
        return attrName;
    }
    function parseJsxSpreadAttribute() {
        var pos = getNodePos();
        parseExpected(19 /* SyntaxKind.OpenBraceToken */);
        parseExpected(26 /* SyntaxKind.DotDotDotToken */);
        var expression = parseExpression();
        parseExpected(20 /* SyntaxKind.CloseBraceToken */);
        return finishNode(factory.createJsxSpreadAttribute(expression), pos);
    }
    function parseJsxClosingElement(open, inExpressionContext) {
        var pos = getNodePos();
        parseExpected(31 /* SyntaxKind.LessThanSlashToken */);
        var tagName = parseJsxElementName();
        if (parseExpected(32 /* SyntaxKind.GreaterThanToken */, /*diagnosticMessage*/ undefined, /*shouldAdvance*/ false)) {
            // manually advance the scanner in order to look for jsx text inside jsx
            if (inExpressionContext || !tagNamesAreEquivalent(open.tagName, tagName)) {
                nextToken();
            }
            else {
                scanJsxText();
            }
        }
        return finishNode(factory.createJsxClosingElement(tagName), pos);
    }
    function parseJsxClosingFragment(inExpressionContext) {
        var pos = getNodePos();
        parseExpected(31 /* SyntaxKind.LessThanSlashToken */);
        if (parseExpected(32 /* SyntaxKind.GreaterThanToken */, ts_1.Diagnostics.Expected_corresponding_closing_tag_for_JSX_fragment, /*shouldAdvance*/ false)) {
            // manually advance the scanner in order to look for jsx text inside jsx
            if (inExpressionContext) {
                nextToken();
            }
            else {
                scanJsxText();
            }
        }
        return finishNode(factory.createJsxJsxClosingFragment(), pos);
    }
    function parseTypeAssertion() {
        ts_1.Debug.assert(languageVariant !== 1 /* LanguageVariant.JSX */, "Type assertions should never be parsed in JSX; they should be parsed as comparisons or JSX elements/fragments.");
        var pos = getNodePos();
        parseExpected(30 /* SyntaxKind.LessThanToken */);
        var type = parseType();
        parseExpected(32 /* SyntaxKind.GreaterThanToken */);
        var expression = parseSimpleUnaryExpression();
        return finishNode(factory.createTypeAssertion(type, expression), pos);
    }
    function nextTokenIsIdentifierOrKeywordOrOpenBracketOrTemplate() {
        nextToken();
        return (0, ts_1.tokenIsIdentifierOrKeyword)(token())
            || token() === 23 /* SyntaxKind.OpenBracketToken */
            || isTemplateStartOfTaggedTemplate();
    }
    function isStartOfOptionalPropertyOrElementAccessChain() {
        return token() === 29 /* SyntaxKind.QuestionDotToken */
            && lookAhead(nextTokenIsIdentifierOrKeywordOrOpenBracketOrTemplate);
    }
    function tryReparseOptionalChain(node) {
        if (node.flags & 32 /* NodeFlags.OptionalChain */) {
            return true;
        }
        // check for an optional chain in a non-null expression
        if ((0, ts_1.isNonNullExpression)(node)) {
            var expr = node.expression;
            while ((0, ts_1.isNonNullExpression)(expr) && !(expr.flags & 32 /* NodeFlags.OptionalChain */)) {
                expr = expr.expression;
            }
            if (expr.flags & 32 /* NodeFlags.OptionalChain */) {
                // this is part of an optional chain. Walk down from `node` to `expression` and set the flag.
                while ((0, ts_1.isNonNullExpression)(node)) {
                    node.flags |= 32 /* NodeFlags.OptionalChain */;
                    node = node.expression;
                }
                return true;
            }
        }
        return false;
    }
    function parsePropertyAccessExpressionRest(pos, expression, questionDotToken) {
        var name = parseRightSideOfDot(/*allowIdentifierNames*/ true, /*allowPrivateIdentifiers*/ true);
        var isOptionalChain = questionDotToken || tryReparseOptionalChain(expression);
        var propertyAccess = isOptionalChain ?
            factoryCreatePropertyAccessChain(expression, questionDotToken, name) :
            factoryCreatePropertyAccessExpression(expression, name);
        if (isOptionalChain && (0, ts_1.isPrivateIdentifier)(propertyAccess.name)) {
            parseErrorAtRange(propertyAccess.name, ts_1.Diagnostics.An_optional_chain_cannot_contain_private_identifiers);
        }
        if ((0, ts_1.isExpressionWithTypeArguments)(expression) && expression.typeArguments) {
            var pos_1 = expression.typeArguments.pos - 1;
            var end = (0, ts_1.skipTrivia)(sourceText, expression.typeArguments.end) + 1;
            parseErrorAt(pos_1, end, ts_1.Diagnostics.An_instantiation_expression_cannot_be_followed_by_a_property_access);
        }
        return finishNode(propertyAccess, pos);
    }
    function parseElementAccessExpressionRest(pos, expression, questionDotToken) {
        var argumentExpression;
        if (token() === 24 /* SyntaxKind.CloseBracketToken */) {
            argumentExpression = createMissingNode(80 /* SyntaxKind.Identifier */, /*reportAtCurrentPosition*/ true, ts_1.Diagnostics.An_element_access_expression_should_take_an_argument);
        }
        else {
            var argument = allowInAnd(parseExpression);
            if ((0, ts_1.isStringOrNumericLiteralLike)(argument)) {
                argument.text = internIdentifier(argument.text);
            }
            argumentExpression = argument;
        }
        parseExpected(24 /* SyntaxKind.CloseBracketToken */);
        var indexedAccess = questionDotToken || tryReparseOptionalChain(expression) ?
            factoryCreateElementAccessChain(expression, questionDotToken, argumentExpression) :
            factoryCreateElementAccessExpression(expression, argumentExpression);
        return finishNode(indexedAccess, pos);
    }
    function parseMemberExpressionRest(pos, expression, allowOptionalChain) {
        while (true) {
            var questionDotToken = void 0;
            var isPropertyAccess = false;
            if (allowOptionalChain && isStartOfOptionalPropertyOrElementAccessChain()) {
                questionDotToken = parseExpectedToken(29 /* SyntaxKind.QuestionDotToken */);
                isPropertyAccess = (0, ts_1.tokenIsIdentifierOrKeyword)(token());
            }
            else {
                isPropertyAccess = parseOptional(25 /* SyntaxKind.DotToken */);
            }
            if (isPropertyAccess) {
                expression = parsePropertyAccessExpressionRest(pos, expression, questionDotToken);
                continue;
            }
            // when in the [Decorator] context, we do not parse ElementAccess as it could be part of a ComputedPropertyName
            if ((questionDotToken || !inDecoratorContext()) && parseOptional(23 /* SyntaxKind.OpenBracketToken */)) {
                expression = parseElementAccessExpressionRest(pos, expression, questionDotToken);
                continue;
            }
            if (isTemplateStartOfTaggedTemplate()) {
                // Absorb type arguments into TemplateExpression when preceding expression is ExpressionWithTypeArguments
                expression = !questionDotToken && expression.kind === 232 /* SyntaxKind.ExpressionWithTypeArguments */ ?
                    parseTaggedTemplateRest(pos, expression.expression, questionDotToken, expression.typeArguments) :
                    parseTaggedTemplateRest(pos, expression, questionDotToken, /*typeArguments*/ undefined);
                continue;
            }
            if (!questionDotToken) {
                if (token() === 54 /* SyntaxKind.ExclamationToken */ && !scanner.hasPrecedingLineBreak()) {
                    nextToken();
                    expression = finishNode(factory.createNonNullExpression(expression), pos);
                    continue;
                }
                var typeArguments = tryParse(parseTypeArgumentsInExpression);
                if (typeArguments) {
                    expression = finishNode(factory.createExpressionWithTypeArguments(expression, typeArguments), pos);
                    continue;
                }
            }
            return expression;
        }
    }
    function isTemplateStartOfTaggedTemplate() {
        return token() === 15 /* SyntaxKind.NoSubstitutionTemplateLiteral */ || token() === 16 /* SyntaxKind.TemplateHead */;
    }
    function parseTaggedTemplateRest(pos, tag, questionDotToken, typeArguments) {
        var tagExpression = factory.createTaggedTemplateExpression(tag, typeArguments, token() === 15 /* SyntaxKind.NoSubstitutionTemplateLiteral */ ?
            (reScanTemplateToken(/*isTaggedTemplate*/ true), parseLiteralNode()) :
            parseTemplateExpression(/*isTaggedTemplate*/ true));
        if (questionDotToken || tag.flags & 32 /* NodeFlags.OptionalChain */) {
            tagExpression.flags |= 32 /* NodeFlags.OptionalChain */;
        }
        tagExpression.questionDotToken = questionDotToken;
        return finishNode(tagExpression, pos);
    }
    function parseCallExpressionRest(pos, expression) {
        while (true) {
            expression = parseMemberExpressionRest(pos, expression, /*allowOptionalChain*/ true);
            var typeArguments = void 0;
            var questionDotToken = parseOptionalToken(29 /* SyntaxKind.QuestionDotToken */);
            if (questionDotToken) {
                typeArguments = tryParse(parseTypeArgumentsInExpression);
                if (isTemplateStartOfTaggedTemplate()) {
                    expression = parseTaggedTemplateRest(pos, expression, questionDotToken, typeArguments);
                    continue;
                }
            }
            if (typeArguments || token() === 21 /* SyntaxKind.OpenParenToken */) {
                // Absorb type arguments into CallExpression when preceding expression is ExpressionWithTypeArguments
                if (!questionDotToken && expression.kind === 232 /* SyntaxKind.ExpressionWithTypeArguments */) {
                    typeArguments = expression.typeArguments;
                    expression = expression.expression;
                }
                var argumentList = parseArgumentList();
                var callExpr = questionDotToken || tryReparseOptionalChain(expression) ?
                    factoryCreateCallChain(expression, questionDotToken, typeArguments, argumentList) :
                    factoryCreateCallExpression(expression, typeArguments, argumentList);
                expression = finishNode(callExpr, pos);
                continue;
            }
            if (questionDotToken) {
                // We parsed `?.` but then failed to parse anything, so report a missing identifier here.
                var name_2 = createMissingNode(80 /* SyntaxKind.Identifier */, /*reportAtCurrentPosition*/ false, ts_1.Diagnostics.Identifier_expected);
                expression = finishNode(factoryCreatePropertyAccessChain(expression, questionDotToken, name_2), pos);
            }
            break;
        }
        return expression;
    }
    function parseArgumentList() {
        parseExpected(21 /* SyntaxKind.OpenParenToken */);
        var result = parseDelimitedList(11 /* ParsingContext.ArgumentExpressions */, parseArgumentExpression);
        parseExpected(22 /* SyntaxKind.CloseParenToken */);
        return result;
    }
    function parseTypeArgumentsInExpression() {
        if ((contextFlags & 262144 /* NodeFlags.JavaScriptFile */) !== 0) {
            // TypeArguments must not be parsed in JavaScript files to avoid ambiguity with binary operators.
            return undefined;
        }
        if (reScanLessThanToken() !== 30 /* SyntaxKind.LessThanToken */) {
            return undefined;
        }
        nextToken();
        var typeArguments = parseDelimitedList(20 /* ParsingContext.TypeArguments */, parseType);
        if (reScanGreaterToken() !== 32 /* SyntaxKind.GreaterThanToken */) {
            // If it doesn't have the closing `>` then it's definitely not an type argument list.
            return undefined;
        }
        nextToken();
        // We successfully parsed a type argument list. The next token determines whether we want to
        // treat it as such. If the type argument list is followed by `(` or a template literal, as in
        // `f<number>(42)`, we favor the type argument interpretation even though JavaScript would view
        // it as a relational expression.
        return typeArguments && canFollowTypeArgumentsInExpression() ? typeArguments : undefined;
    }
    function canFollowTypeArgumentsInExpression() {
        switch (token()) {
            // These tokens can follow a type argument list in a call expression.
            case 21 /* SyntaxKind.OpenParenToken */: // foo<x>(
            case 15 /* SyntaxKind.NoSubstitutionTemplateLiteral */: // foo<T> `...`
            case 16 /* SyntaxKind.TemplateHead */: // foo<T> `...${100}...`
                return true;
            // A type argument list followed by `<` never makes sense, and a type argument list followed
            // by `>` is ambiguous with a (re-scanned) `>>` operator, so we disqualify both. Also, in
            // this context, `+` and `-` are unary operators, not binary operators.
            case 30 /* SyntaxKind.LessThanToken */:
            case 32 /* SyntaxKind.GreaterThanToken */:
            case 40 /* SyntaxKind.PlusToken */:
            case 41 /* SyntaxKind.MinusToken */:
                return false;
        }
        // We favor the type argument list interpretation when it is immediately followed by
        // a line break, a binary operator, or something that can't start an expression.
        return scanner.hasPrecedingLineBreak() || isBinaryOperator() || !isStartOfExpression();
    }
    function parsePrimaryExpression() {
        switch (token()) {
            case 15 /* SyntaxKind.NoSubstitutionTemplateLiteral */:
                if (scanner.getTokenFlags() & 26656 /* TokenFlags.IsInvalid */) {
                    reScanTemplateToken(/*isTaggedTemplate*/ false);
                }
            // falls through
            case 9 /* SyntaxKind.NumericLiteral */:
            case 10 /* SyntaxKind.BigIntLiteral */:
            case 11 /* SyntaxKind.StringLiteral */:
                return parseLiteralNode();
            case 110 /* SyntaxKind.ThisKeyword */:
            case 108 /* SyntaxKind.SuperKeyword */:
            case 106 /* SyntaxKind.NullKeyword */:
            case 112 /* SyntaxKind.TrueKeyword */:
            case 97 /* SyntaxKind.FalseKeyword */:
                return parseTokenNode();
            case 21 /* SyntaxKind.OpenParenToken */:
                return parseParenthesizedExpression();
            case 23 /* SyntaxKind.OpenBracketToken */:
                return parseArrayLiteralExpression();
            case 19 /* SyntaxKind.OpenBraceToken */:
                return parseObjectLiteralExpression();
            case 134 /* SyntaxKind.AsyncKeyword */:
                // Async arrow functions are parsed earlier in parseAssignmentExpressionOrHigher.
                // If we encounter `async [no LineTerminator here] function` then this is an async
                // function; otherwise, its an identifier.
                if (!lookAhead(nextTokenIsFunctionKeywordOnSameLine)) {
                    break;
                }
                return parseFunctionExpression();
            case 60 /* SyntaxKind.AtToken */:
                return parseDecoratedExpression();
            case 86 /* SyntaxKind.ClassKeyword */:
                return parseClassExpression();
            case 100 /* SyntaxKind.FunctionKeyword */:
                return parseFunctionExpression();
            case 105 /* SyntaxKind.NewKeyword */:
                return parseNewExpressionOrNewDotTarget();
            case 44 /* SyntaxKind.SlashToken */:
            case 69 /* SyntaxKind.SlashEqualsToken */:
                if (reScanSlashToken() === 14 /* SyntaxKind.RegularExpressionLiteral */) {
                    return parseLiteralNode();
                }
                break;
            case 16 /* SyntaxKind.TemplateHead */:
                return parseTemplateExpression(/*isTaggedTemplate*/ false);
            case 81 /* SyntaxKind.PrivateIdentifier */:
                return parsePrivateIdentifier();
        }
        return parseIdentifier(ts_1.Diagnostics.Expression_expected);
    }
    function parseParenthesizedExpression() {
        var pos = getNodePos();
        var hasJSDoc = hasPrecedingJSDocComment();
        parseExpected(21 /* SyntaxKind.OpenParenToken */);
        var expression = allowInAnd(parseExpression);
        parseExpected(22 /* SyntaxKind.CloseParenToken */);
        return withJSDoc(finishNode(factoryCreateParenthesizedExpression(expression), pos), hasJSDoc);
    }
    function parseSpreadElement() {
        var pos = getNodePos();
        parseExpected(26 /* SyntaxKind.DotDotDotToken */);
        var expression = parseAssignmentExpressionOrHigher(/*allowReturnTypeInArrowFunction*/ true);
        return finishNode(factory.createSpreadElement(expression), pos);
    }
    function parseArgumentOrArrayLiteralElement() {
        return token() === 26 /* SyntaxKind.DotDotDotToken */ ? parseSpreadElement() :
            token() === 28 /* SyntaxKind.CommaToken */ ? finishNode(factory.createOmittedExpression(), getNodePos()) :
                parseAssignmentExpressionOrHigher(/*allowReturnTypeInArrowFunction*/ true);
    }
    function parseArgumentExpression() {
        return doOutsideOfContext(disallowInAndDecoratorContext, parseArgumentOrArrayLiteralElement);
    }
    function parseArrayLiteralExpression() {
        var pos = getNodePos();
        var openBracketPosition = scanner.getTokenStart();
        var openBracketParsed = parseExpected(23 /* SyntaxKind.OpenBracketToken */);
        var multiLine = scanner.hasPrecedingLineBreak();
        var elements = parseDelimitedList(15 /* ParsingContext.ArrayLiteralMembers */, parseArgumentOrArrayLiteralElement);
        parseExpectedMatchingBrackets(23 /* SyntaxKind.OpenBracketToken */, 24 /* SyntaxKind.CloseBracketToken */, openBracketParsed, openBracketPosition);
        return finishNode(factoryCreateArrayLiteralExpression(elements, multiLine), pos);
    }
    function parseObjectLiteralElement() {
        var pos = getNodePos();
        var hasJSDoc = hasPrecedingJSDocComment();
        if (parseOptionalToken(26 /* SyntaxKind.DotDotDotToken */)) {
            var expression = parseAssignmentExpressionOrHigher(/*allowReturnTypeInArrowFunction*/ true);
            return withJSDoc(finishNode(factory.createSpreadAssignment(expression), pos), hasJSDoc);
        }
        var modifiers = parseModifiers(/*allowDecorators*/ true);
        if (parseContextualModifier(139 /* SyntaxKind.GetKeyword */)) {
            return parseAccessorDeclaration(pos, hasJSDoc, modifiers, 176 /* SyntaxKind.GetAccessor */, 0 /* SignatureFlags.None */);
        }
        if (parseContextualModifier(153 /* SyntaxKind.SetKeyword */)) {
            return parseAccessorDeclaration(pos, hasJSDoc, modifiers, 177 /* SyntaxKind.SetAccessor */, 0 /* SignatureFlags.None */);
        }
        var asteriskToken = parseOptionalToken(42 /* SyntaxKind.AsteriskToken */);
        var tokenIsIdentifier = isIdentifier();
        var name = parsePropertyName();
        // Disallowing of optional property assignments and definite assignment assertion happens in the grammar checker.
        var questionToken = parseOptionalToken(58 /* SyntaxKind.QuestionToken */);
        var exclamationToken = parseOptionalToken(54 /* SyntaxKind.ExclamationToken */);
        if (asteriskToken || token() === 21 /* SyntaxKind.OpenParenToken */ || token() === 30 /* SyntaxKind.LessThanToken */) {
            return parseMethodDeclaration(pos, hasJSDoc, modifiers, asteriskToken, name, questionToken, exclamationToken);
        }
        // check if it is short-hand property assignment or normal property assignment
        // NOTE: if token is EqualsToken it is interpreted as CoverInitializedName production
        // CoverInitializedName[Yield] :
        //     IdentifierReference[?Yield] Initializer[In, ?Yield]
        // this is necessary because ObjectLiteral productions are also used to cover grammar for ObjectAssignmentPattern
        var node;
        var isShorthandPropertyAssignment = tokenIsIdentifier && (token() !== 59 /* SyntaxKind.ColonToken */);
        if (isShorthandPropertyAssignment) {
            var equalsToken = parseOptionalToken(64 /* SyntaxKind.EqualsToken */);
            var objectAssignmentInitializer = equalsToken ? allowInAnd(function () { return parseAssignmentExpressionOrHigher(/*allowReturnTypeInArrowFunction*/ true); }) : undefined;
            node = factory.createShorthandPropertyAssignment(name, objectAssignmentInitializer);
            // Save equals token for error reporting.
            // TODO(rbuckton): Consider manufacturing this when we need to report an error as it is otherwise not useful.
            node.equalsToken = equalsToken;
        }
        else {
            parseExpected(59 /* SyntaxKind.ColonToken */);
            var initializer = allowInAnd(function () { return parseAssignmentExpressionOrHigher(/*allowReturnTypeInArrowFunction*/ true); });
            node = factory.createPropertyAssignment(name, initializer);
        }
        // Decorators, Modifiers, questionToken, and exclamationToken are not supported by property assignments and are reported in the grammar checker
        node.modifiers = modifiers;
        node.questionToken = questionToken;
        node.exclamationToken = exclamationToken;
        return withJSDoc(finishNode(node, pos), hasJSDoc);
    }
    function parseObjectLiteralExpression() {
        var pos = getNodePos();
        var openBracePosition = scanner.getTokenStart();
        var openBraceParsed = parseExpected(19 /* SyntaxKind.OpenBraceToken */);
        var multiLine = scanner.hasPrecedingLineBreak();
        var properties = parseDelimitedList(12 /* ParsingContext.ObjectLiteralMembers */, parseObjectLiteralElement, /*considerSemicolonAsDelimiter*/ true);
        parseExpectedMatchingBrackets(19 /* SyntaxKind.OpenBraceToken */, 20 /* SyntaxKind.CloseBraceToken */, openBraceParsed, openBracePosition);
        return finishNode(factoryCreateObjectLiteralExpression(properties, multiLine), pos);
    }
    function parseFunctionExpression() {
        // GeneratorExpression:
        //      function* BindingIdentifier [Yield][opt](FormalParameters[Yield]){ GeneratorBody }
        //
        // FunctionExpression:
        //      function BindingIdentifier[opt](FormalParameters){ FunctionBody }
        var savedDecoratorContext = inDecoratorContext();
        setDecoratorContext(/*val*/ false);
        var pos = getNodePos();
        var hasJSDoc = hasPrecedingJSDocComment();
        var modifiers = parseModifiers(/*allowDecorators*/ false);
        parseExpected(100 /* SyntaxKind.FunctionKeyword */);
        var asteriskToken = parseOptionalToken(42 /* SyntaxKind.AsteriskToken */);
        var isGenerator = asteriskToken ? 1 /* SignatureFlags.Yield */ : 0 /* SignatureFlags.None */;
        var isAsync = (0, ts_1.some)(modifiers, ts_1.isAsyncModifier) ? 2 /* SignatureFlags.Await */ : 0 /* SignatureFlags.None */;
        var name = isGenerator && isAsync ? doInYieldAndAwaitContext(parseOptionalBindingIdentifier) :
            isGenerator ? doInYieldContext(parseOptionalBindingIdentifier) :
                isAsync ? doInAwaitContext(parseOptionalBindingIdentifier) :
                    parseOptionalBindingIdentifier();
        var typeParameters = parseTypeParameters();
        var parameters = parseParameters(isGenerator | isAsync);
        var type = parseReturnType(59 /* SyntaxKind.ColonToken */, /*isType*/ false);
        var body = parseFunctionBlock(isGenerator | isAsync);
        setDecoratorContext(savedDecoratorContext);
        var node = factory.createFunctionExpression(modifiers, asteriskToken, name, typeParameters, parameters, type, body);
        return withJSDoc(finishNode(node, pos), hasJSDoc);
    }
    function parseOptionalBindingIdentifier() {
        return isBindingIdentifier() ? parseBindingIdentifier() : undefined;
    }
    function parseNewExpressionOrNewDotTarget() {
        var pos = getNodePos();
        parseExpected(105 /* SyntaxKind.NewKeyword */);
        if (parseOptional(25 /* SyntaxKind.DotToken */)) {
            var name_3 = parseIdentifierName();
            return finishNode(factory.createMetaProperty(105 /* SyntaxKind.NewKeyword */, name_3), pos);
        }
        var expressionPos = getNodePos();
        var expression = parseMemberExpressionRest(expressionPos, parsePrimaryExpression(), /*allowOptionalChain*/ false);
        var typeArguments;
        // Absorb type arguments into NewExpression when preceding expression is ExpressionWithTypeArguments
        if (expression.kind === 232 /* SyntaxKind.ExpressionWithTypeArguments */) {
            typeArguments = expression.typeArguments;
            expression = expression.expression;
        }
        if (token() === 29 /* SyntaxKind.QuestionDotToken */) {
            parseErrorAtCurrentToken(ts_1.Diagnostics.Invalid_optional_chain_from_new_expression_Did_you_mean_to_call_0, (0, ts_1.getTextOfNodeFromSourceText)(sourceText, expression));
        }
        var argumentList = token() === 21 /* SyntaxKind.OpenParenToken */ ? parseArgumentList() : undefined;
        return finishNode(factoryCreateNewExpression(expression, typeArguments, argumentList), pos);
    }
    // STATEMENTS
    function parseBlock(ignoreMissingOpenBrace, diagnosticMessage) {
        var pos = getNodePos();
        var hasJSDoc = hasPrecedingJSDocComment();
        var openBracePosition = scanner.getTokenStart();
        var openBraceParsed = parseExpected(19 /* SyntaxKind.OpenBraceToken */, diagnosticMessage);
        if (openBraceParsed || ignoreMissingOpenBrace) {
            var multiLine = scanner.hasPrecedingLineBreak();
            var statements = parseList(1 /* ParsingContext.BlockStatements */, parseStatement);
            parseExpectedMatchingBrackets(19 /* SyntaxKind.OpenBraceToken */, 20 /* SyntaxKind.CloseBraceToken */, openBraceParsed, openBracePosition);
            var result = withJSDoc(finishNode(factoryCreateBlock(statements, multiLine), pos), hasJSDoc);
            if (token() === 64 /* SyntaxKind.EqualsToken */) {
                parseErrorAtCurrentToken(ts_1.Diagnostics.Declaration_or_statement_expected_This_follows_a_block_of_statements_so_if_you_intended_to_write_a_destructuring_assignment_you_might_need_to_wrap_the_whole_assignment_in_parentheses);
                nextToken();
            }
            return result;
        }
        else {
            var statements = createMissingList();
            return withJSDoc(finishNode(factoryCreateBlock(statements, /*multiLine*/ undefined), pos), hasJSDoc);
        }
    }
    function parseFunctionBlock(flags, diagnosticMessage) {
        var savedYieldContext = inYieldContext();
        setYieldContext(!!(flags & 1 /* SignatureFlags.Yield */));
        var savedAwaitContext = inAwaitContext();
        setAwaitContext(!!(flags & 2 /* SignatureFlags.Await */));
        var savedTopLevel = topLevel;
        topLevel = false;
        // We may be in a [Decorator] context when parsing a function expression or
        // arrow function. The body of the function is not in [Decorator] context.
        var saveDecoratorContext = inDecoratorContext();
        if (saveDecoratorContext) {
            setDecoratorContext(/*val*/ false);
        }
        var block = parseBlock(!!(flags & 16 /* SignatureFlags.IgnoreMissingOpenBrace */), diagnosticMessage);
        if (saveDecoratorContext) {
            setDecoratorContext(/*val*/ true);
        }
        topLevel = savedTopLevel;
        setYieldContext(savedYieldContext);
        setAwaitContext(savedAwaitContext);
        return block;
    }
    function parseEmptyStatement() {
        var pos = getNodePos();
        var hasJSDoc = hasPrecedingJSDocComment();
        parseExpected(27 /* SyntaxKind.SemicolonToken */);
        return withJSDoc(finishNode(factory.createEmptyStatement(), pos), hasJSDoc);
    }
    function parseIfStatement() {
        var pos = getNodePos();
        var hasJSDoc = hasPrecedingJSDocComment();
        parseExpected(101 /* SyntaxKind.IfKeyword */);
        var openParenPosition = scanner.getTokenStart();
        var openParenParsed = parseExpected(21 /* SyntaxKind.OpenParenToken */);
        var expression = allowInAnd(parseExpression);
        parseExpectedMatchingBrackets(21 /* SyntaxKind.OpenParenToken */, 22 /* SyntaxKind.CloseParenToken */, openParenParsed, openParenPosition);
        var thenStatement = parseStatement();
        var elseStatement = parseOptional(93 /* SyntaxKind.ElseKeyword */) ? parseStatement() : undefined;
        return withJSDoc(finishNode(factoryCreateIfStatement(expression, thenStatement, elseStatement), pos), hasJSDoc);
    }
    function parseDoStatement() {
        var pos = getNodePos();
        var hasJSDoc = hasPrecedingJSDocComment();
        parseExpected(92 /* SyntaxKind.DoKeyword */);
        var statement = parseStatement();
        parseExpected(117 /* SyntaxKind.WhileKeyword */);
        var openParenPosition = scanner.getTokenStart();
        var openParenParsed = parseExpected(21 /* SyntaxKind.OpenParenToken */);
        var expression = allowInAnd(parseExpression);
        parseExpectedMatchingBrackets(21 /* SyntaxKind.OpenParenToken */, 22 /* SyntaxKind.CloseParenToken */, openParenParsed, openParenPosition);
        // From: https://mail.mozilla.org/pipermail/es-discuss/2011-August/016188.html
        // 157 min --- All allen at wirfs-brock.com CONF --- "do{;}while(false)false" prohibited in
        // spec but allowed in consensus reality. Approved -- this is the de-facto standard whereby
        //  do;while(0)x will have a semicolon inserted before x.
        parseOptional(27 /* SyntaxKind.SemicolonToken */);
        return withJSDoc(finishNode(factory.createDoStatement(statement, expression), pos), hasJSDoc);
    }
    function parseWhileStatement() {
        var pos = getNodePos();
        var hasJSDoc = hasPrecedingJSDocComment();
        parseExpected(117 /* SyntaxKind.WhileKeyword */);
        var openParenPosition = scanner.getTokenStart();
        var openParenParsed = parseExpected(21 /* SyntaxKind.OpenParenToken */);
        var expression = allowInAnd(parseExpression);
        parseExpectedMatchingBrackets(21 /* SyntaxKind.OpenParenToken */, 22 /* SyntaxKind.CloseParenToken */, openParenParsed, openParenPosition);
        var statement = parseStatement();
        return withJSDoc(finishNode(factoryCreateWhileStatement(expression, statement), pos), hasJSDoc);
    }
    function parseForOrForInOrForOfStatement() {
        var pos = getNodePos();
        var hasJSDoc = hasPrecedingJSDocComment();
        parseExpected(99 /* SyntaxKind.ForKeyword */);
        var awaitToken = parseOptionalToken(135 /* SyntaxKind.AwaitKeyword */);
        parseExpected(21 /* SyntaxKind.OpenParenToken */);
        var initializer;
        if (token() !== 27 /* SyntaxKind.SemicolonToken */) {
            if (token() === 115 /* SyntaxKind.VarKeyword */ || token() === 121 /* SyntaxKind.LetKeyword */ || token() === 87 /* SyntaxKind.ConstKeyword */) {
                initializer = parseVariableDeclarationList(/*inForStatementInitializer*/ true);
            }
            else {
                initializer = disallowInAnd(parseExpression);
            }
        }
        var node;
        if (awaitToken ? parseExpected(164 /* SyntaxKind.OfKeyword */) : parseOptional(164 /* SyntaxKind.OfKeyword */)) {
            var expression = allowInAnd(function () { return parseAssignmentExpressionOrHigher(/*allowReturnTypeInArrowFunction*/ true); });
            parseExpected(22 /* SyntaxKind.CloseParenToken */);
            node = factoryCreateForOfStatement(awaitToken, initializer, expression, parseStatement());
        }
        else if (parseOptional(103 /* SyntaxKind.InKeyword */)) {
            var expression = allowInAnd(parseExpression);
            parseExpected(22 /* SyntaxKind.CloseParenToken */);
            node = factory.createForInStatement(initializer, expression, parseStatement());
        }
        else {
            parseExpected(27 /* SyntaxKind.SemicolonToken */);
            var condition = token() !== 27 /* SyntaxKind.SemicolonToken */ && token() !== 22 /* SyntaxKind.CloseParenToken */
                ? allowInAnd(parseExpression)
                : undefined;
            parseExpected(27 /* SyntaxKind.SemicolonToken */);
            var incrementor = token() !== 22 /* SyntaxKind.CloseParenToken */
                ? allowInAnd(parseExpression)
                : undefined;
            parseExpected(22 /* SyntaxKind.CloseParenToken */);
            node = factoryCreateForStatement(initializer, condition, incrementor, parseStatement());
        }
        return withJSDoc(finishNode(node, pos), hasJSDoc);
    }
    function parseBreakOrContinueStatement(kind) {
        var pos = getNodePos();
        var hasJSDoc = hasPrecedingJSDocComment();
        parseExpected(kind === 251 /* SyntaxKind.BreakStatement */ ? 83 /* SyntaxKind.BreakKeyword */ : 88 /* SyntaxKind.ContinueKeyword */);
        var label = canParseSemicolon() ? undefined : parseIdentifier();
        parseSemicolon();
        var node = kind === 251 /* SyntaxKind.BreakStatement */
            ? factory.createBreakStatement(label)
            : factory.createContinueStatement(label);
        return withJSDoc(finishNode(node, pos), hasJSDoc);
    }
    function parseReturnStatement() {
        var pos = getNodePos();
        var hasJSDoc = hasPrecedingJSDocComment();
        parseExpected(107 /* SyntaxKind.ReturnKeyword */);
        var expression = canParseSemicolon() ? undefined : allowInAnd(parseExpression);
        parseSemicolon();
        return withJSDoc(finishNode(factory.createReturnStatement(expression), pos), hasJSDoc);
    }
    function parseWithStatement() {
        var pos = getNodePos();
        var hasJSDoc = hasPrecedingJSDocComment();
        parseExpected(118 /* SyntaxKind.WithKeyword */);
        var openParenPosition = scanner.getTokenStart();
        var openParenParsed = parseExpected(21 /* SyntaxKind.OpenParenToken */);
        var expression = allowInAnd(parseExpression);
        parseExpectedMatchingBrackets(21 /* SyntaxKind.OpenParenToken */, 22 /* SyntaxKind.CloseParenToken */, openParenParsed, openParenPosition);
        var statement = doInsideOfContext(33554432 /* NodeFlags.InWithStatement */, parseStatement);
        return withJSDoc(finishNode(factory.createWithStatement(expression, statement), pos), hasJSDoc);
    }
    function parseCaseClause() {
        var pos = getNodePos();
        var hasJSDoc = hasPrecedingJSDocComment();
        parseExpected(84 /* SyntaxKind.CaseKeyword */);
        var expression = allowInAnd(parseExpression);
        parseExpected(59 /* SyntaxKind.ColonToken */);
        var statements = parseList(3 /* ParsingContext.SwitchClauseStatements */, parseStatement);
        return withJSDoc(finishNode(factory.createCaseClause(expression, statements), pos), hasJSDoc);
    }
    function parseDefaultClause() {
        var pos = getNodePos();
        parseExpected(90 /* SyntaxKind.DefaultKeyword */);
        parseExpected(59 /* SyntaxKind.ColonToken */);
        var statements = parseList(3 /* ParsingContext.SwitchClauseStatements */, parseStatement);
        return finishNode(factory.createDefaultClause(statements), pos);
    }
    function parseCaseOrDefaultClause() {
        return token() === 84 /* SyntaxKind.CaseKeyword */ ? parseCaseClause() : parseDefaultClause();
    }
    function parseCaseBlock() {
        var pos = getNodePos();
        parseExpected(19 /* SyntaxKind.OpenBraceToken */);
        var clauses = parseList(2 /* ParsingContext.SwitchClauses */, parseCaseOrDefaultClause);
        parseExpected(20 /* SyntaxKind.CloseBraceToken */);
        return finishNode(factory.createCaseBlock(clauses), pos);
    }
    function parseSwitchStatement() {
        var pos = getNodePos();
        var hasJSDoc = hasPrecedingJSDocComment();
        parseExpected(109 /* SyntaxKind.SwitchKeyword */);
        parseExpected(21 /* SyntaxKind.OpenParenToken */);
        var expression = allowInAnd(parseExpression);
        parseExpected(22 /* SyntaxKind.CloseParenToken */);
        var caseBlock = parseCaseBlock();
        return withJSDoc(finishNode(factory.createSwitchStatement(expression, caseBlock), pos), hasJSDoc);
    }
    function parseThrowStatement() {
        // ThrowStatement[Yield] :
        //      throw [no LineTerminator here]Expression[In, ?Yield];
        var pos = getNodePos();
        var hasJSDoc = hasPrecedingJSDocComment();
        parseExpected(111 /* SyntaxKind.ThrowKeyword */);
        // Because of automatic semicolon insertion, we need to report error if this
        // throw could be terminated with a semicolon.  Note: we can't call 'parseExpression'
        // directly as that might consume an expression on the following line.
        // Instead, we create a "missing" identifier, but don't report an error. The actual error
        // will be reported in the grammar walker.
        var expression = scanner.hasPrecedingLineBreak() ? undefined : allowInAnd(parseExpression);
        if (expression === undefined) {
            identifierCount++;
            expression = finishNode(factoryCreateIdentifier(""), getNodePos());
        }
        if (!tryParseSemicolon()) {
            parseErrorForMissingSemicolonAfter(expression);
        }
        return withJSDoc(finishNode(factory.createThrowStatement(expression), pos), hasJSDoc);
    }
    // TODO: Review for error recovery
    function parseTryStatement() {
        var pos = getNodePos();
        var hasJSDoc = hasPrecedingJSDocComment();
        parseExpected(113 /* SyntaxKind.TryKeyword */);
        var tryBlock = parseBlock(/*ignoreMissingOpenBrace*/ false);
        var catchClause = token() === 85 /* SyntaxKind.CatchKeyword */ ? parseCatchClause() : undefined;
        // If we don't have a catch clause, then we must have a finally clause.  Try to parse
        // one out no matter what.
        var finallyBlock;
        if (!catchClause || token() === 98 /* SyntaxKind.FinallyKeyword */) {
            parseExpected(98 /* SyntaxKind.FinallyKeyword */, ts_1.Diagnostics.catch_or_finally_expected);
            finallyBlock = parseBlock(/*ignoreMissingOpenBrace*/ false);
        }
        return withJSDoc(finishNode(factory.createTryStatement(tryBlock, catchClause, finallyBlock), pos), hasJSDoc);
    }
    function parseCatchClause() {
        var pos = getNodePos();
        parseExpected(85 /* SyntaxKind.CatchKeyword */);
        var variableDeclaration;
        if (parseOptional(21 /* SyntaxKind.OpenParenToken */)) {
            variableDeclaration = parseVariableDeclaration();
            parseExpected(22 /* SyntaxKind.CloseParenToken */);
        }
        else {
            // Keep shape of node to avoid degrading performance.
            variableDeclaration = undefined;
        }
        var block = parseBlock(/*ignoreMissingOpenBrace*/ false);
        return finishNode(factory.createCatchClause(variableDeclaration, block), pos);
    }
    function parseDebuggerStatement() {
        var pos = getNodePos();
        var hasJSDoc = hasPrecedingJSDocComment();
        parseExpected(89 /* SyntaxKind.DebuggerKeyword */);
        parseSemicolon();
        return withJSDoc(finishNode(factory.createDebuggerStatement(), pos), hasJSDoc);
    }
    function parseExpressionOrLabeledStatement() {
        // Avoiding having to do the lookahead for a labeled statement by just trying to parse
        // out an expression, seeing if it is identifier and then seeing if it is followed by
        // a colon.
        var pos = getNodePos();
        var hasJSDoc = hasPrecedingJSDocComment();
        var node;
        var hasParen = token() === 21 /* SyntaxKind.OpenParenToken */;
        var expression = allowInAnd(parseExpression);
        if ((0, ts_1.isIdentifier)(expression) && parseOptional(59 /* SyntaxKind.ColonToken */)) {
            node = factory.createLabeledStatement(expression, parseStatement());
        }
        else {
            if (!tryParseSemicolon()) {
                parseErrorForMissingSemicolonAfter(expression);
            }
            node = factoryCreateExpressionStatement(expression);
            if (hasParen) {
                // do not parse the same jsdoc twice
                hasJSDoc = false;
            }
        }
        return withJSDoc(finishNode(node, pos), hasJSDoc);
    }
    function nextTokenIsIdentifierOrKeywordOnSameLine() {
        nextToken();
        return (0, ts_1.tokenIsIdentifierOrKeyword)(token()) && !scanner.hasPrecedingLineBreak();
    }
    function nextTokenIsClassKeywordOnSameLine() {
        nextToken();
        return token() === 86 /* SyntaxKind.ClassKeyword */ && !scanner.hasPrecedingLineBreak();
    }
    function nextTokenIsFunctionKeywordOnSameLine() {
        nextToken();
        return token() === 100 /* SyntaxKind.FunctionKeyword */ && !scanner.hasPrecedingLineBreak();
    }
    function nextTokenIsIdentifierOrKeywordOrLiteralOnSameLine() {
        nextToken();
        return ((0, ts_1.tokenIsIdentifierOrKeyword)(token()) || token() === 9 /* SyntaxKind.NumericLiteral */ || token() === 10 /* SyntaxKind.BigIntLiteral */ || token() === 11 /* SyntaxKind.StringLiteral */) && !scanner.hasPrecedingLineBreak();
    }
    function isDeclaration() {
        while (true) {
            switch (token()) {
                case 115 /* SyntaxKind.VarKeyword */:
                case 121 /* SyntaxKind.LetKeyword */:
                case 87 /* SyntaxKind.ConstKeyword */:
                case 100 /* SyntaxKind.FunctionKeyword */:
                case 86 /* SyntaxKind.ClassKeyword */:
                case 94 /* SyntaxKind.EnumKeyword */:
                    return true;
                // 'declare', 'module', 'namespace', 'interface'* and 'type' are all legal JavaScript identifiers;
                // however, an identifier cannot be followed by another identifier on the same line. This is what we
                // count on to parse out the respective declarations. For instance, we exploit this to say that
                //
                //    namespace n
                //
                // can be none other than the beginning of a namespace declaration, but need to respect that JavaScript sees
                //
                //    namespace
                //    n
                //
                // as the identifier 'namespace' on one line followed by the identifier 'n' on another.
                // We need to look one token ahead to see if it permissible to try parsing a declaration.
                //
                // *Note*: 'interface' is actually a strict mode reserved word. So while
                //
                //   "use strict"
                //   interface
                //   I {}
                //
                // could be legal, it would add complexity for very little gain.
                case 120 /* SyntaxKind.InterfaceKeyword */:
                case 156 /* SyntaxKind.TypeKeyword */:
                    return nextTokenIsIdentifierOnSameLine();
                case 144 /* SyntaxKind.ModuleKeyword */:
                case 145 /* SyntaxKind.NamespaceKeyword */:
                    return nextTokenIsIdentifierOrStringLiteralOnSameLine();
                case 128 /* SyntaxKind.AbstractKeyword */:
                case 129 /* SyntaxKind.AccessorKeyword */:
                case 134 /* SyntaxKind.AsyncKeyword */:
                case 138 /* SyntaxKind.DeclareKeyword */:
                case 123 /* SyntaxKind.PrivateKeyword */:
                case 124 /* SyntaxKind.ProtectedKeyword */:
                case 125 /* SyntaxKind.PublicKeyword */:
                case 148 /* SyntaxKind.ReadonlyKeyword */:
                    nextToken();
                    // ASI takes effect for this modifier.
                    if (scanner.hasPrecedingLineBreak()) {
                        return false;
                    }
                    continue;
                case 161 /* SyntaxKind.GlobalKeyword */:
                    nextToken();
                    return token() === 19 /* SyntaxKind.OpenBraceToken */ || token() === 80 /* SyntaxKind.Identifier */ || token() === 95 /* SyntaxKind.ExportKeyword */;
                case 102 /* SyntaxKind.ImportKeyword */:
                    nextToken();
                    return token() === 11 /* SyntaxKind.StringLiteral */ || token() === 42 /* SyntaxKind.AsteriskToken */ ||
                        token() === 19 /* SyntaxKind.OpenBraceToken */ || (0, ts_1.tokenIsIdentifierOrKeyword)(token());
                case 95 /* SyntaxKind.ExportKeyword */:
                    var currentToken_1 = nextToken();
                    if (currentToken_1 === 156 /* SyntaxKind.TypeKeyword */) {
                        currentToken_1 = lookAhead(nextToken);
                    }
                    if (currentToken_1 === 64 /* SyntaxKind.EqualsToken */ || currentToken_1 === 42 /* SyntaxKind.AsteriskToken */ ||
                        currentToken_1 === 19 /* SyntaxKind.OpenBraceToken */ || currentToken_1 === 90 /* SyntaxKind.DefaultKeyword */ ||
                        currentToken_1 === 130 /* SyntaxKind.AsKeyword */ || currentToken_1 === 60 /* SyntaxKind.AtToken */) {
                        return true;
                    }
                    continue;
                case 126 /* SyntaxKind.StaticKeyword */:
                    nextToken();
                    continue;
                default:
                    return false;
            }
        }
    }
    function isStartOfDeclaration() {
        return lookAhead(isDeclaration);
    }
    function isStartOfStatement() {
        switch (token()) {
            case 60 /* SyntaxKind.AtToken */:
            case 27 /* SyntaxKind.SemicolonToken */:
            case 19 /* SyntaxKind.OpenBraceToken */:
            case 115 /* SyntaxKind.VarKeyword */:
            case 121 /* SyntaxKind.LetKeyword */:
            case 100 /* SyntaxKind.FunctionKeyword */:
            case 86 /* SyntaxKind.ClassKeyword */:
            case 94 /* SyntaxKind.EnumKeyword */:
            case 101 /* SyntaxKind.IfKeyword */:
            case 92 /* SyntaxKind.DoKeyword */:
            case 117 /* SyntaxKind.WhileKeyword */:
            case 99 /* SyntaxKind.ForKeyword */:
            case 88 /* SyntaxKind.ContinueKeyword */:
            case 83 /* SyntaxKind.BreakKeyword */:
            case 107 /* SyntaxKind.ReturnKeyword */:
            case 118 /* SyntaxKind.WithKeyword */:
            case 109 /* SyntaxKind.SwitchKeyword */:
            case 111 /* SyntaxKind.ThrowKeyword */:
            case 113 /* SyntaxKind.TryKeyword */:
            case 89 /* SyntaxKind.DebuggerKeyword */:
            // 'catch' and 'finally' do not actually indicate that the code is part of a statement,
            // however, we say they are here so that we may gracefully parse them and error later.
            // falls through
            case 85 /* SyntaxKind.CatchKeyword */:
            case 98 /* SyntaxKind.FinallyKeyword */:
                return true;
            case 102 /* SyntaxKind.ImportKeyword */:
                return isStartOfDeclaration() || lookAhead(nextTokenIsOpenParenOrLessThanOrDot);
            case 87 /* SyntaxKind.ConstKeyword */:
            case 95 /* SyntaxKind.ExportKeyword */:
                return isStartOfDeclaration();
            case 134 /* SyntaxKind.AsyncKeyword */:
            case 138 /* SyntaxKind.DeclareKeyword */:
            case 120 /* SyntaxKind.InterfaceKeyword */:
            case 144 /* SyntaxKind.ModuleKeyword */:
            case 145 /* SyntaxKind.NamespaceKeyword */:
            case 156 /* SyntaxKind.TypeKeyword */:
            case 161 /* SyntaxKind.GlobalKeyword */:
                // When these don't start a declaration, they're an identifier in an expression statement
                return true;
            case 129 /* SyntaxKind.AccessorKeyword */:
            case 125 /* SyntaxKind.PublicKeyword */:
            case 123 /* SyntaxKind.PrivateKeyword */:
            case 124 /* SyntaxKind.ProtectedKeyword */:
            case 126 /* SyntaxKind.StaticKeyword */:
            case 148 /* SyntaxKind.ReadonlyKeyword */:
                // When these don't start a declaration, they may be the start of a class member if an identifier
                // immediately follows. Otherwise they're an identifier in an expression statement.
                return isStartOfDeclaration() || !lookAhead(nextTokenIsIdentifierOrKeywordOnSameLine);
            default:
                return isStartOfExpression();
        }
    }
    function nextTokenIsBindingIdentifierOrStartOfDestructuring() {
        nextToken();
        return isBindingIdentifier() || token() === 19 /* SyntaxKind.OpenBraceToken */ || token() === 23 /* SyntaxKind.OpenBracketToken */;
    }
    function isLetDeclaration() {
        // In ES6 'let' always starts a lexical declaration if followed by an identifier or {
        // or [.
        return lookAhead(nextTokenIsBindingIdentifierOrStartOfDestructuring);
    }
    function parseStatement() {
        switch (token()) {
            case 27 /* SyntaxKind.SemicolonToken */:
                return parseEmptyStatement();
            case 19 /* SyntaxKind.OpenBraceToken */:
                return parseBlock(/*ignoreMissingOpenBrace*/ false);
            case 115 /* SyntaxKind.VarKeyword */:
                return parseVariableStatement(getNodePos(), hasPrecedingJSDocComment(), /*modifiers*/ undefined);
            case 121 /* SyntaxKind.LetKeyword */:
                if (isLetDeclaration()) {
                    return parseVariableStatement(getNodePos(), hasPrecedingJSDocComment(), /*modifiers*/ undefined);
                }
                break;
            case 100 /* SyntaxKind.FunctionKeyword */:
                return parseFunctionDeclaration(getNodePos(), hasPrecedingJSDocComment(), /*modifiers*/ undefined);
            case 86 /* SyntaxKind.ClassKeyword */:
                return parseClassDeclaration(getNodePos(), hasPrecedingJSDocComment(), /*modifiers*/ undefined);
            case 101 /* SyntaxKind.IfKeyword */:
                return parseIfStatement();
            case 92 /* SyntaxKind.DoKeyword */:
                return parseDoStatement();
            case 117 /* SyntaxKind.WhileKeyword */:
                return parseWhileStatement();
            case 99 /* SyntaxKind.ForKeyword */:
                return parseForOrForInOrForOfStatement();
            case 88 /* SyntaxKind.ContinueKeyword */:
                return parseBreakOrContinueStatement(250 /* SyntaxKind.ContinueStatement */);
            case 83 /* SyntaxKind.BreakKeyword */:
                return parseBreakOrContinueStatement(251 /* SyntaxKind.BreakStatement */);
            case 107 /* SyntaxKind.ReturnKeyword */:
                return parseReturnStatement();
            case 118 /* SyntaxKind.WithKeyword */:
                return parseWithStatement();
            case 109 /* SyntaxKind.SwitchKeyword */:
                return parseSwitchStatement();
            case 111 /* SyntaxKind.ThrowKeyword */:
                return parseThrowStatement();
            case 113 /* SyntaxKind.TryKeyword */:
            // Include 'catch' and 'finally' for error recovery.
            // falls through
            case 85 /* SyntaxKind.CatchKeyword */:
            case 98 /* SyntaxKind.FinallyKeyword */:
                return parseTryStatement();
            case 89 /* SyntaxKind.DebuggerKeyword */:
                return parseDebuggerStatement();
            case 60 /* SyntaxKind.AtToken */:
                return parseDeclaration();
            case 134 /* SyntaxKind.AsyncKeyword */:
            case 120 /* SyntaxKind.InterfaceKeyword */:
            case 156 /* SyntaxKind.TypeKeyword */:
            case 144 /* SyntaxKind.ModuleKeyword */:
            case 145 /* SyntaxKind.NamespaceKeyword */:
            case 138 /* SyntaxKind.DeclareKeyword */:
            case 87 /* SyntaxKind.ConstKeyword */:
            case 94 /* SyntaxKind.EnumKeyword */:
            case 95 /* SyntaxKind.ExportKeyword */:
            case 102 /* SyntaxKind.ImportKeyword */:
            case 123 /* SyntaxKind.PrivateKeyword */:
            case 124 /* SyntaxKind.ProtectedKeyword */:
            case 125 /* SyntaxKind.PublicKeyword */:
            case 128 /* SyntaxKind.AbstractKeyword */:
            case 129 /* SyntaxKind.AccessorKeyword */:
            case 126 /* SyntaxKind.StaticKeyword */:
            case 148 /* SyntaxKind.ReadonlyKeyword */:
            case 161 /* SyntaxKind.GlobalKeyword */:
                if (isStartOfDeclaration()) {
                    return parseDeclaration();
                }
                break;
        }
        return parseExpressionOrLabeledStatement();
    }
    function isDeclareModifier(modifier) {
        return modifier.kind === 138 /* SyntaxKind.DeclareKeyword */;
    }
    function parseDeclaration() {
        // `parseListElement` attempted to get the reused node at this position,
        // but the ambient context flag was not yet set, so the node appeared
        // not reusable in that context.
        var pos = getNodePos();
        var hasJSDoc = hasPrecedingJSDocComment();
        var modifiers = parseModifiers(/*allowDecorators*/ true);
        var isAmbient = (0, ts_1.some)(modifiers, isDeclareModifier);
        if (isAmbient) {
            var node = tryReuseAmbientDeclaration(pos);
            if (node) {
                return node;
            }
            for (var _i = 0, _a = modifiers; _i < _a.length; _i++) {
                var m = _a[_i];
                m.flags |= 16777216 /* NodeFlags.Ambient */;
            }
            return doInsideOfContext(16777216 /* NodeFlags.Ambient */, function () { return parseDeclarationWorker(pos, hasJSDoc, modifiers); });
        }
        else {
            return parseDeclarationWorker(pos, hasJSDoc, modifiers);
        }
    }
    function tryReuseAmbientDeclaration(pos) {
        return doInsideOfContext(16777216 /* NodeFlags.Ambient */, function () {
            // TODO(jakebailey): this is totally wrong; `parsingContext` is the result of ORing a bunch of `1 << ParsingContext.XYZ`.
            // The enum should really be a bunch of flags.
            var node = currentNode(parsingContext, pos);
            if (node) {
                return consumeNode(node);
            }
        });
    }
    function parseDeclarationWorker(pos, hasJSDoc, modifiersIn) {
        switch (token()) {
            case 115 /* SyntaxKind.VarKeyword */:
            case 121 /* SyntaxKind.LetKeyword */:
            case 87 /* SyntaxKind.ConstKeyword */:
                return parseVariableStatement(pos, hasJSDoc, modifiersIn);
            case 100 /* SyntaxKind.FunctionKeyword */:
                return parseFunctionDeclaration(pos, hasJSDoc, modifiersIn);
            case 86 /* SyntaxKind.ClassKeyword */:
                return parseClassDeclaration(pos, hasJSDoc, modifiersIn);
            case 120 /* SyntaxKind.InterfaceKeyword */:
                return parseInterfaceDeclaration(pos, hasJSDoc, modifiersIn);
            case 156 /* SyntaxKind.TypeKeyword */:
                return parseTypeAliasDeclaration(pos, hasJSDoc, modifiersIn);
            case 94 /* SyntaxKind.EnumKeyword */:
                return parseEnumDeclaration(pos, hasJSDoc, modifiersIn);
            case 161 /* SyntaxKind.GlobalKeyword */:
            case 144 /* SyntaxKind.ModuleKeyword */:
            case 145 /* SyntaxKind.NamespaceKeyword */:
                return parseModuleDeclaration(pos, hasJSDoc, modifiersIn);
            case 102 /* SyntaxKind.ImportKeyword */:
                return parseImportDeclarationOrImportEqualsDeclaration(pos, hasJSDoc, modifiersIn);
            case 95 /* SyntaxKind.ExportKeyword */:
                nextToken();
                switch (token()) {
                    case 90 /* SyntaxKind.DefaultKeyword */:
                    case 64 /* SyntaxKind.EqualsToken */:
                        return parseExportAssignment(pos, hasJSDoc, modifiersIn);
                    case 130 /* SyntaxKind.AsKeyword */:
                        return parseNamespaceExportDeclaration(pos, hasJSDoc, modifiersIn);
                    default:
                        return parseExportDeclaration(pos, hasJSDoc, modifiersIn);
                }
            default:
                if (modifiersIn) {
                    // We reached this point because we encountered decorators and/or modifiers and assumed a declaration
                    // would follow. For recovery and error reporting purposes, return an incomplete declaration.
                    var missing = createMissingNode(281 /* SyntaxKind.MissingDeclaration */, /*reportAtCurrentPosition*/ true, ts_1.Diagnostics.Declaration_expected);
                    (0, ts_1.setTextRangePos)(missing, pos);
                    missing.modifiers = modifiersIn;
                    return missing;
                }
                return undefined; // TODO: GH#18217
        }
    }
    function nextTokenIsIdentifierOrStringLiteralOnSameLine() {
        nextToken();
        return !scanner.hasPrecedingLineBreak() && (isIdentifier() || token() === 11 /* SyntaxKind.StringLiteral */);
    }
    function parseFunctionBlockOrSemicolon(flags, diagnosticMessage) {
        if (token() !== 19 /* SyntaxKind.OpenBraceToken */) {
            if (flags & 4 /* SignatureFlags.Type */) {
                parseTypeMemberSemicolon();
                return;
            }
            if (canParseSemicolon()) {
                parseSemicolon();
                return;
            }
        }
        return parseFunctionBlock(flags, diagnosticMessage);
    }
    // DECLARATIONS
    function parseArrayBindingElement() {
        var pos = getNodePos();
        if (token() === 28 /* SyntaxKind.CommaToken */) {
            return finishNode(factory.createOmittedExpression(), pos);
        }
        var dotDotDotToken = parseOptionalToken(26 /* SyntaxKind.DotDotDotToken */);
        var name = parseIdentifierOrPattern();
        var initializer = parseInitializer();
        return finishNode(factory.createBindingElement(dotDotDotToken, /*propertyName*/ undefined, name, initializer), pos);
    }
    function parseObjectBindingElement() {
        var pos = getNodePos();
        var dotDotDotToken = parseOptionalToken(26 /* SyntaxKind.DotDotDotToken */);
        var tokenIsIdentifier = isBindingIdentifier();
        var propertyName = parsePropertyName();
        var name;
        if (tokenIsIdentifier && token() !== 59 /* SyntaxKind.ColonToken */) {
            name = propertyName;
            propertyName = undefined;
        }
        else {
            parseExpected(59 /* SyntaxKind.ColonToken */);
            name = parseIdentifierOrPattern();
        }
        var initializer = parseInitializer();
        return finishNode(factory.createBindingElement(dotDotDotToken, propertyName, name, initializer), pos);
    }
    function parseObjectBindingPattern() {
        var pos = getNodePos();
        parseExpected(19 /* SyntaxKind.OpenBraceToken */);
        var elements = parseDelimitedList(9 /* ParsingContext.ObjectBindingElements */, parseObjectBindingElement);
        parseExpected(20 /* SyntaxKind.CloseBraceToken */);
        return finishNode(factory.createObjectBindingPattern(elements), pos);
    }
    function parseArrayBindingPattern() {
        var pos = getNodePos();
        parseExpected(23 /* SyntaxKind.OpenBracketToken */);
        var elements = parseDelimitedList(10 /* ParsingContext.ArrayBindingElements */, parseArrayBindingElement);
        parseExpected(24 /* SyntaxKind.CloseBracketToken */);
        return finishNode(factory.createArrayBindingPattern(elements), pos);
    }
    function isBindingIdentifierOrPrivateIdentifierOrPattern() {
        return token() === 19 /* SyntaxKind.OpenBraceToken */
            || token() === 23 /* SyntaxKind.OpenBracketToken */
            || token() === 81 /* SyntaxKind.PrivateIdentifier */
            || isBindingIdentifier();
    }
    function parseIdentifierOrPattern(privateIdentifierDiagnosticMessage) {
        if (token() === 23 /* SyntaxKind.OpenBracketToken */) {
            return parseArrayBindingPattern();
        }
        if (token() === 19 /* SyntaxKind.OpenBraceToken */) {
            return parseObjectBindingPattern();
        }
        return parseBindingIdentifier(privateIdentifierDiagnosticMessage);
    }
    function parseVariableDeclarationAllowExclamation() {
        return parseVariableDeclaration(/*allowExclamation*/ true);
    }
    function parseVariableDeclaration(allowExclamation) {
        var pos = getNodePos();
        var hasJSDoc = hasPrecedingJSDocComment();
        var name = parseIdentifierOrPattern(ts_1.Diagnostics.Private_identifiers_are_not_allowed_in_variable_declarations);
        var exclamationToken;
        if (allowExclamation && name.kind === 80 /* SyntaxKind.Identifier */ &&
            token() === 54 /* SyntaxKind.ExclamationToken */ && !scanner.hasPrecedingLineBreak()) {
            exclamationToken = parseTokenNode();
        }
        var type = parseTypeAnnotation();
        var initializer = isInOrOfKeyword(token()) ? undefined : parseInitializer();
        var node = factoryCreateVariableDeclaration(name, exclamationToken, type, initializer);
        return withJSDoc(finishNode(node, pos), hasJSDoc);
    }
    function parseVariableDeclarationList(inForStatementInitializer) {
        var pos = getNodePos();
        var flags = 0;
        switch (token()) {
            case 115 /* SyntaxKind.VarKeyword */:
                break;
            case 121 /* SyntaxKind.LetKeyword */:
                flags |= 1 /* NodeFlags.Let */;
                break;
            case 87 /* SyntaxKind.ConstKeyword */:
                flags |= 2 /* NodeFlags.Const */;
                break;
            default:
                ts_1.Debug.fail();
        }
        nextToken();
        // The user may have written the following:
        //
        //    for (let of X) { }
        //
        // In this case, we want to parse an empty declaration list, and then parse 'of'
        // as a keyword. The reason this is not automatic is that 'of' is a valid identifier.
        // So we need to look ahead to determine if 'of' should be treated as a keyword in
        // this context.
        // The checker will then give an error that there is an empty declaration list.
        var declarations;
        if (token() === 164 /* SyntaxKind.OfKeyword */ && lookAhead(canFollowContextualOfKeyword)) {
            declarations = createMissingList();
        }
        else {
            var savedDisallowIn = inDisallowInContext();
            setDisallowInContext(inForStatementInitializer);
            declarations = parseDelimitedList(8 /* ParsingContext.VariableDeclarations */, inForStatementInitializer ? parseVariableDeclaration : parseVariableDeclarationAllowExclamation);
            setDisallowInContext(savedDisallowIn);
        }
        return finishNode(factoryCreateVariableDeclarationList(declarations, flags), pos);
    }
    function canFollowContextualOfKeyword() {
        return nextTokenIsIdentifier() && nextToken() === 22 /* SyntaxKind.CloseParenToken */;
    }
    function parseVariableStatement(pos, hasJSDoc, modifiers) {
        var declarationList = parseVariableDeclarationList(/*inForStatementInitializer*/ false);
        parseSemicolon();
        var node = factoryCreateVariableStatement(modifiers, declarationList);
        return withJSDoc(finishNode(node, pos), hasJSDoc);
    }
    function parseFunctionDeclaration(pos, hasJSDoc, modifiers) {
        var savedAwaitContext = inAwaitContext();
        var modifierFlags = (0, ts_1.modifiersToFlags)(modifiers);
        parseExpected(100 /* SyntaxKind.FunctionKeyword */);
        var asteriskToken = parseOptionalToken(42 /* SyntaxKind.AsteriskToken */);
        // We don't parse the name here in await context, instead we will report a grammar error in the checker.
        var name = modifierFlags & 1024 /* ModifierFlags.Default */ ? parseOptionalBindingIdentifier() : parseBindingIdentifier();
        var isGenerator = asteriskToken ? 1 /* SignatureFlags.Yield */ : 0 /* SignatureFlags.None */;
        var isAsync = modifierFlags & 512 /* ModifierFlags.Async */ ? 2 /* SignatureFlags.Await */ : 0 /* SignatureFlags.None */;
        var typeParameters = parseTypeParameters();
        if (modifierFlags & 1 /* ModifierFlags.Export */)
            setAwaitContext(/*value*/ true);
        var parameters = parseParameters(isGenerator | isAsync);
        var type = parseReturnType(59 /* SyntaxKind.ColonToken */, /*isType*/ false);
        var body = parseFunctionBlockOrSemicolon(isGenerator | isAsync, ts_1.Diagnostics.or_expected);
        setAwaitContext(savedAwaitContext);
        var node = factory.createFunctionDeclaration(modifiers, asteriskToken, name, typeParameters, parameters, type, body);
        return withJSDoc(finishNode(node, pos), hasJSDoc);
    }
    function parseConstructorName() {
        if (token() === 137 /* SyntaxKind.ConstructorKeyword */) {
            return parseExpected(137 /* SyntaxKind.ConstructorKeyword */);
        }
        if (token() === 11 /* SyntaxKind.StringLiteral */ && lookAhead(nextToken) === 21 /* SyntaxKind.OpenParenToken */) {
            return tryParse(function () {
                var literalNode = parseLiteralNode();
                return literalNode.text === "constructor" ? literalNode : undefined;
            });
        }
    }
    function tryParseConstructorDeclaration(pos, hasJSDoc, modifiers) {
        return tryParse(function () {
            if (parseConstructorName()) {
                var typeParameters = parseTypeParameters();
                var parameters = parseParameters(0 /* SignatureFlags.None */);
                var type = parseReturnType(59 /* SyntaxKind.ColonToken */, /*isType*/ false);
                var body = parseFunctionBlockOrSemicolon(0 /* SignatureFlags.None */, ts_1.Diagnostics.or_expected);
                var node = factory.createConstructorDeclaration(modifiers, parameters, body);
                // Attach invalid nodes if they exist so that we can report them in the grammar checker.
                node.typeParameters = typeParameters;
                node.type = type;
                return withJSDoc(finishNode(node, pos), hasJSDoc);
            }
        });
    }
    function parseMethodDeclaration(pos, hasJSDoc, modifiers, asteriskToken, name, questionToken, exclamationToken, diagnosticMessage) {
        var isGenerator = asteriskToken ? 1 /* SignatureFlags.Yield */ : 0 /* SignatureFlags.None */;
        var isAsync = (0, ts_1.some)(modifiers, ts_1.isAsyncModifier) ? 2 /* SignatureFlags.Await */ : 0 /* SignatureFlags.None */;
        var typeParameters = parseTypeParameters();
        var parameters = parseParameters(isGenerator | isAsync);
        var type = parseReturnType(59 /* SyntaxKind.ColonToken */, /*isType*/ false);
        var body = parseFunctionBlockOrSemicolon(isGenerator | isAsync, diagnosticMessage);
        var node = factory.createMethodDeclaration(modifiers, asteriskToken, name, questionToken, typeParameters, parameters, type, body);
        // An exclamation token on a method is invalid syntax and will be handled by the grammar checker
        node.exclamationToken = exclamationToken;
        return withJSDoc(finishNode(node, pos), hasJSDoc);
    }
    function parsePropertyDeclaration(pos, hasJSDoc, modifiers, name, questionToken) {
        var exclamationToken = !questionToken && !scanner.hasPrecedingLineBreak() ? parseOptionalToken(54 /* SyntaxKind.ExclamationToken */) : undefined;
        var type = parseTypeAnnotation();
        var initializer = doOutsideOfContext(8192 /* NodeFlags.YieldContext */ | 32768 /* NodeFlags.AwaitContext */ | 4096 /* NodeFlags.DisallowInContext */, parseInitializer);
        parseSemicolonAfterPropertyName(name, type, initializer);
        var node = factory.createPropertyDeclaration(modifiers, name, questionToken || exclamationToken, type, initializer);
        return withJSDoc(finishNode(node, pos), hasJSDoc);
    }
    function parsePropertyOrMethodDeclaration(pos, hasJSDoc, modifiers) {
        var asteriskToken = parseOptionalToken(42 /* SyntaxKind.AsteriskToken */);
        var name = parsePropertyName();
        // Note: this is not legal as per the grammar.  But we allow it in the parser and
        // report an error in the grammar checker.
        var questionToken = parseOptionalToken(58 /* SyntaxKind.QuestionToken */);
        if (asteriskToken || token() === 21 /* SyntaxKind.OpenParenToken */ || token() === 30 /* SyntaxKind.LessThanToken */) {
            return parseMethodDeclaration(pos, hasJSDoc, modifiers, asteriskToken, name, questionToken, /*exclamationToken*/ undefined, ts_1.Diagnostics.or_expected);
        }
        return parsePropertyDeclaration(pos, hasJSDoc, modifiers, name, questionToken);
    }
    function parseAccessorDeclaration(pos, hasJSDoc, modifiers, kind, flags) {
        var name = parsePropertyName();
        var typeParameters = parseTypeParameters();
        var parameters = parseParameters(0 /* SignatureFlags.None */);
        var type = parseReturnType(59 /* SyntaxKind.ColonToken */, /*isType*/ false);
        var body = parseFunctionBlockOrSemicolon(flags);
        var node = kind === 176 /* SyntaxKind.GetAccessor */
            ? factory.createGetAccessorDeclaration(modifiers, name, parameters, type, body)
            : factory.createSetAccessorDeclaration(modifiers, name, parameters, body);
        // Keep track of `typeParameters` (for both) and `type` (for setters) if they were parsed those indicate grammar errors
        node.typeParameters = typeParameters;
        if ((0, ts_1.isSetAccessorDeclaration)(node))
            node.type = type;
        return withJSDoc(finishNode(node, pos), hasJSDoc);
    }
    function isClassMemberStart() {
        var idToken;
        if (token() === 60 /* SyntaxKind.AtToken */) {
            return true;
        }
        // Eat up all modifiers, but hold on to the last one in case it is actually an identifier.
        while ((0, ts_1.isModifierKind)(token())) {
            idToken = token();
            // If the idToken is a class modifier (protected, private, public, and static), it is
            // certain that we are starting to parse class member. This allows better error recovery
            // Example:
            //      public foo() ...     // true
            //      public @dec blah ... // true; we will then report an error later
            //      export public ...    // true; we will then report an error later
            if ((0, ts_1.isClassMemberModifier)(idToken)) {
                return true;
            }
            nextToken();
        }
        if (token() === 42 /* SyntaxKind.AsteriskToken */) {
            return true;
        }
        // Try to get the first property-like token following all modifiers.
        // This can either be an identifier or the 'get' or 'set' keywords.
        if (isLiteralPropertyName()) {
            idToken = token();
            nextToken();
        }
        // Index signatures and computed properties are class members; we can parse.
        if (token() === 23 /* SyntaxKind.OpenBracketToken */) {
            return true;
        }
        // If we were able to get any potential identifier...
        if (idToken !== undefined) {
            // If we have a non-keyword identifier, or if we have an accessor, then it's safe to parse.
            if (!(0, ts_1.isKeyword)(idToken) || idToken === 153 /* SyntaxKind.SetKeyword */ || idToken === 139 /* SyntaxKind.GetKeyword */) {
                return true;
            }
            // If it *is* a keyword, but not an accessor, check a little farther along
            // to see if it should actually be parsed as a class member.
            switch (token()) {
                case 21 /* SyntaxKind.OpenParenToken */: // Method declaration
                case 30 /* SyntaxKind.LessThanToken */: // Generic Method declaration
                case 54 /* SyntaxKind.ExclamationToken */: // Non-null assertion on property name
                case 59 /* SyntaxKind.ColonToken */: // Type Annotation for declaration
                case 64 /* SyntaxKind.EqualsToken */: // Initializer for declaration
                case 58 /* SyntaxKind.QuestionToken */: // Not valid, but permitted so that it gets caught later on.
                    return true;
                default:
                    // Covers
                    //  - Semicolons     (declaration termination)
                    //  - Closing braces (end-of-class, must be declaration)
                    //  - End-of-files   (not valid, but permitted so that it gets caught later on)
                    //  - Line-breaks    (enabling *automatic semicolon insertion*)
                    return canParseSemicolon();
            }
        }
        return false;
    }
    function parseClassStaticBlockDeclaration(pos, hasJSDoc, modifiers) {
        parseExpectedToken(126 /* SyntaxKind.StaticKeyword */);
        var body = parseClassStaticBlockBody();
        var node = withJSDoc(finishNode(factory.createClassStaticBlockDeclaration(body), pos), hasJSDoc);
        node.modifiers = modifiers;
        return node;
    }
    function parseClassStaticBlockBody() {
        var savedYieldContext = inYieldContext();
        var savedAwaitContext = inAwaitContext();
        setYieldContext(false);
        setAwaitContext(true);
        var body = parseBlock(/*ignoreMissingOpenBrace*/ false);
        setYieldContext(savedYieldContext);
        setAwaitContext(savedAwaitContext);
        return body;
    }
    function parseDecoratorExpression() {
        if (inAwaitContext() && token() === 135 /* SyntaxKind.AwaitKeyword */) {
            // `@await` is is disallowed in an [Await] context, but can cause parsing to go off the rails
            // This simply parses the missing identifier and moves on.
            var pos = getNodePos();
            var awaitExpression = parseIdentifier(ts_1.Diagnostics.Expression_expected);
            nextToken();
            var memberExpression = parseMemberExpressionRest(pos, awaitExpression, /*allowOptionalChain*/ true);
            return parseCallExpressionRest(pos, memberExpression);
        }
        return parseLeftHandSideExpressionOrHigher();
    }
    function tryParseDecorator() {
        var pos = getNodePos();
        if (!parseOptional(60 /* SyntaxKind.AtToken */)) {
            return undefined;
        }
        var expression = doInDecoratorContext(parseDecoratorExpression);
        return finishNode(factory.createDecorator(expression), pos);
    }
    function tryParseModifier(hasSeenStaticModifier, permitConstAsModifier, stopOnStartOfClassStaticBlock) {
        var pos = getNodePos();
        var kind = token();
        if (token() === 87 /* SyntaxKind.ConstKeyword */ && permitConstAsModifier) {
            // We need to ensure that any subsequent modifiers appear on the same line
            // so that when 'const' is a standalone declaration, we don't issue an error.
            if (!tryParse(nextTokenIsOnSameLineAndCanFollowModifier)) {
                return undefined;
            }
        }
        else if (stopOnStartOfClassStaticBlock && token() === 126 /* SyntaxKind.StaticKeyword */ && lookAhead(nextTokenIsOpenBrace)) {
            return undefined;
        }
        else if (hasSeenStaticModifier && token() === 126 /* SyntaxKind.StaticKeyword */) {
            return undefined;
        }
        else {
            if (!parseAnyContextualModifier()) {
                return undefined;
            }
        }
        return finishNode(factoryCreateToken(kind), pos);
    }
    function parseModifiers(allowDecorators, permitConstAsModifier, stopOnStartOfClassStaticBlock) {
        var pos = getNodePos();
        var list;
        var decorator, modifier, hasSeenStaticModifier = false, hasLeadingModifier = false, hasTrailingDecorator = false;
        // Decorators should be contiguous in a list of modifiers but can potentially appear in two places (i.e., `[...leadingDecorators, ...leadingModifiers, ...trailingDecorators, ...trailingModifiers]`).
        // The leading modifiers *should* only contain `export` and `default` when trailingDecorators are present, but we'll handle errors for any other leading modifiers in the checker.
        // It is illegal to have both leadingDecorators and trailingDecorators, but we will report that as a grammar check in the checker.
        // parse leading decorators
        if (allowDecorators && token() === 60 /* SyntaxKind.AtToken */) {
            while (decorator = tryParseDecorator()) {
                list = (0, ts_1.append)(list, decorator);
            }
        }
        // parse leading modifiers
        while (modifier = tryParseModifier(hasSeenStaticModifier, permitConstAsModifier, stopOnStartOfClassStaticBlock)) {
            if (modifier.kind === 126 /* SyntaxKind.StaticKeyword */)
                hasSeenStaticModifier = true;
            list = (0, ts_1.append)(list, modifier);
            hasLeadingModifier = true;
        }
        // parse trailing decorators, but only if we parsed any leading modifiers
        if (hasLeadingModifier && allowDecorators && token() === 60 /* SyntaxKind.AtToken */) {
            while (decorator = tryParseDecorator()) {
                list = (0, ts_1.append)(list, decorator);
                hasTrailingDecorator = true;
            }
        }
        // parse trailing modifiers, but only if we parsed any trailing decorators
        if (hasTrailingDecorator) {
            while (modifier = tryParseModifier(hasSeenStaticModifier, permitConstAsModifier, stopOnStartOfClassStaticBlock)) {
                if (modifier.kind === 126 /* SyntaxKind.StaticKeyword */)
                    hasSeenStaticModifier = true;
                list = (0, ts_1.append)(list, modifier);
            }
        }
        return list && createNodeArray(list, pos);
    }
    function parseModifiersForArrowFunction() {
        var modifiers;
        if (token() === 134 /* SyntaxKind.AsyncKeyword */) {
            var pos = getNodePos();
            nextToken();
            var modifier = finishNode(factoryCreateToken(134 /* SyntaxKind.AsyncKeyword */), pos);
            modifiers = createNodeArray([modifier], pos);
        }
        return modifiers;
    }
    function parseClassElement() {
        var pos = getNodePos();
        var hasJSDoc = hasPrecedingJSDocComment();
        if (token() === 27 /* SyntaxKind.SemicolonToken */) {
            nextToken();
            return withJSDoc(finishNode(factory.createSemicolonClassElement(), pos), hasJSDoc);
        }
        var modifiers = parseModifiers(/*allowDecorators*/ true, /*permitConstAsModifier*/ true, /*stopOnStartOfClassStaticBlock*/ true);
        if (token() === 126 /* SyntaxKind.StaticKeyword */ && lookAhead(nextTokenIsOpenBrace)) {
            return parseClassStaticBlockDeclaration(pos, hasJSDoc, modifiers);
        }
        if (parseContextualModifier(139 /* SyntaxKind.GetKeyword */)) {
            return parseAccessorDeclaration(pos, hasJSDoc, modifiers, 176 /* SyntaxKind.GetAccessor */, 0 /* SignatureFlags.None */);
        }
        if (parseContextualModifier(153 /* SyntaxKind.SetKeyword */)) {
            return parseAccessorDeclaration(pos, hasJSDoc, modifiers, 177 /* SyntaxKind.SetAccessor */, 0 /* SignatureFlags.None */);
        }
        if (token() === 137 /* SyntaxKind.ConstructorKeyword */ || token() === 11 /* SyntaxKind.StringLiteral */) {
            var constructorDeclaration = tryParseConstructorDeclaration(pos, hasJSDoc, modifiers);
            if (constructorDeclaration) {
                return constructorDeclaration;
            }
        }
        if (isIndexSignature()) {
            return parseIndexSignatureDeclaration(pos, hasJSDoc, modifiers);
        }
        // It is very important that we check this *after* checking indexers because
        // the [ token can start an index signature or a computed property name
        if ((0, ts_1.tokenIsIdentifierOrKeyword)(token()) ||
            token() === 11 /* SyntaxKind.StringLiteral */ ||
            token() === 9 /* SyntaxKind.NumericLiteral */ ||
            token() === 42 /* SyntaxKind.AsteriskToken */ ||
            token() === 23 /* SyntaxKind.OpenBracketToken */) {
            var isAmbient = (0, ts_1.some)(modifiers, isDeclareModifier);
            if (isAmbient) {
                for (var _i = 0, _a = modifiers; _i < _a.length; _i++) {
                    var m = _a[_i];
                    m.flags |= 16777216 /* NodeFlags.Ambient */;
                }
                return doInsideOfContext(16777216 /* NodeFlags.Ambient */, function () { return parsePropertyOrMethodDeclaration(pos, hasJSDoc, modifiers); });
            }
            else {
                return parsePropertyOrMethodDeclaration(pos, hasJSDoc, modifiers);
            }
        }
        if (modifiers) {
            // treat this as a property declaration with a missing name.
            var name_4 = createMissingNode(80 /* SyntaxKind.Identifier */, /*reportAtCurrentPosition*/ true, ts_1.Diagnostics.Declaration_expected);
            return parsePropertyDeclaration(pos, hasJSDoc, modifiers, name_4, /*questionToken*/ undefined);
        }
        // 'isClassMemberStart' should have hinted not to attempt parsing.
        return ts_1.Debug.fail("Should not have attempted to parse class member declaration.");
    }
    function parseDecoratedExpression() {
        var pos = getNodePos();
        var hasJSDoc = hasPrecedingJSDocComment();
        var modifiers = parseModifiers(/*allowDecorators*/ true);
        if (token() === 86 /* SyntaxKind.ClassKeyword */) {
            return parseClassDeclarationOrExpression(pos, hasJSDoc, modifiers, 230 /* SyntaxKind.ClassExpression */);
        }
        var missing = createMissingNode(281 /* SyntaxKind.MissingDeclaration */, /*reportAtCurrentPosition*/ true, ts_1.Diagnostics.Expression_expected);
        (0, ts_1.setTextRangePos)(missing, pos);
        missing.modifiers = modifiers;
        return missing;
    }
    function parseClassExpression() {
        return parseClassDeclarationOrExpression(getNodePos(), hasPrecedingJSDocComment(), /*modifiers*/ undefined, 230 /* SyntaxKind.ClassExpression */);
    }
    function parseClassDeclaration(pos, hasJSDoc, modifiers) {
        return parseClassDeclarationOrExpression(pos, hasJSDoc, modifiers, 262 /* SyntaxKind.ClassDeclaration */);
    }
    function parseClassDeclarationOrExpression(pos, hasJSDoc, modifiers, kind) {
        var savedAwaitContext = inAwaitContext();
        parseExpected(86 /* SyntaxKind.ClassKeyword */);
        // We don't parse the name here in await context, instead we will report a grammar error in the checker.
        var name = parseNameOfClassDeclarationOrExpression();
        var typeParameters = parseTypeParameters();
        if ((0, ts_1.some)(modifiers, ts_1.isExportModifier))
            setAwaitContext(/*value*/ true);
        var heritageClauses = parseHeritageClauses();
        var members;
        if (parseExpected(19 /* SyntaxKind.OpenBraceToken */)) {
            // ClassTail[Yield,Await] : (Modified) See 14.5
            //      ClassHeritage[?Yield,?Await]opt { ClassBody[?Yield,?Await]opt }
            members = parseClassMembers();
            parseExpected(20 /* SyntaxKind.CloseBraceToken */);
        }
        else {
            members = createMissingList();
        }
        setAwaitContext(savedAwaitContext);
        var node = kind === 262 /* SyntaxKind.ClassDeclaration */
            ? factory.createClassDeclaration(modifiers, name, typeParameters, heritageClauses, members)
            : factory.createClassExpression(modifiers, name, typeParameters, heritageClauses, members);
        return withJSDoc(finishNode(node, pos), hasJSDoc);
    }
    function parseNameOfClassDeclarationOrExpression() {
        // implements is a future reserved word so
        // 'class implements' might mean either
        // - class expression with omitted name, 'implements' starts heritage clause
        // - class with name 'implements'
        // 'isImplementsClause' helps to disambiguate between these two cases
        return isBindingIdentifier() && !isImplementsClause()
            ? createIdentifier(isBindingIdentifier())
            : undefined;
    }
    function isImplementsClause() {
        return token() === 119 /* SyntaxKind.ImplementsKeyword */ && lookAhead(nextTokenIsIdentifierOrKeyword);
    }
    function parseHeritageClauses() {
        // ClassTail[Yield,Await] : (Modified) See 14.5
        //      ClassHeritage[?Yield,?Await]opt { ClassBody[?Yield,?Await]opt }
        if (isHeritageClause()) {
            return parseList(22 /* ParsingContext.HeritageClauses */, parseHeritageClause);
        }
        return undefined;
    }
    function parseHeritageClause() {
        var pos = getNodePos();
        var tok = token();
        ts_1.Debug.assert(tok === 96 /* SyntaxKind.ExtendsKeyword */ || tok === 119 /* SyntaxKind.ImplementsKeyword */); // isListElement() should ensure this.
        nextToken();
        var types = parseDelimitedList(7 /* ParsingContext.HeritageClauseElement */, parseExpressionWithTypeArguments);
        return finishNode(factory.createHeritageClause(tok, types), pos);
    }
    function parseExpressionWithTypeArguments() {
        var pos = getNodePos();
        var expression = parseLeftHandSideExpressionOrHigher();
        if (expression.kind === 232 /* SyntaxKind.ExpressionWithTypeArguments */) {
            return expression;
        }
        var typeArguments = tryParseTypeArguments();
        return finishNode(factory.createExpressionWithTypeArguments(expression, typeArguments), pos);
    }
    function tryParseTypeArguments() {
        return token() === 30 /* SyntaxKind.LessThanToken */ ?
            parseBracketedList(20 /* ParsingContext.TypeArguments */, parseType, 30 /* SyntaxKind.LessThanToken */, 32 /* SyntaxKind.GreaterThanToken */) : undefined;
    }
    function isHeritageClause() {
        return token() === 96 /* SyntaxKind.ExtendsKeyword */ || token() === 119 /* SyntaxKind.ImplementsKeyword */;
    }
    function parseClassMembers() {
        return parseList(5 /* ParsingContext.ClassMembers */, parseClassElement);
    }
    function parseInterfaceDeclaration(pos, hasJSDoc, modifiers) {
        parseExpected(120 /* SyntaxKind.InterfaceKeyword */);
        var name = parseIdentifier();
        var typeParameters = parseTypeParameters();
        var heritageClauses = parseHeritageClauses();
        var members = parseObjectTypeMembers();
        var node = factory.createInterfaceDeclaration(modifiers, name, typeParameters, heritageClauses, members);
        return withJSDoc(finishNode(node, pos), hasJSDoc);
    }
    function parseTypeAliasDeclaration(pos, hasJSDoc, modifiers) {
        parseExpected(156 /* SyntaxKind.TypeKeyword */);
        var name = parseIdentifier();
        var typeParameters = parseTypeParameters();
        parseExpected(64 /* SyntaxKind.EqualsToken */);
        var type = token() === 141 /* SyntaxKind.IntrinsicKeyword */ && tryParse(parseKeywordAndNoDot) || parseType();
        parseSemicolon();
        var node = factory.createTypeAliasDeclaration(modifiers, name, typeParameters, type);
        return withJSDoc(finishNode(node, pos), hasJSDoc);
    }
    // In an ambient declaration, the grammar only allows integer literals as initializers.
    // In a non-ambient declaration, the grammar allows uninitialized members only in a
    // ConstantEnumMemberSection, which starts at the beginning of an enum declaration
    // or any time an integer literal initializer is encountered.
    function parseEnumMember() {
        var pos = getNodePos();
        var hasJSDoc = hasPrecedingJSDocComment();
        var name = parsePropertyName();
        var initializer = allowInAnd(parseInitializer);
        return withJSDoc(finishNode(factory.createEnumMember(name, initializer), pos), hasJSDoc);
    }
    function parseEnumDeclaration(pos, hasJSDoc, modifiers) {
        parseExpected(94 /* SyntaxKind.EnumKeyword */);
        var name = parseIdentifier();
        var members;
        if (parseExpected(19 /* SyntaxKind.OpenBraceToken */)) {
            members = doOutsideOfYieldAndAwaitContext(function () { return parseDelimitedList(6 /* ParsingContext.EnumMembers */, parseEnumMember); });
            parseExpected(20 /* SyntaxKind.CloseBraceToken */);
        }
        else {
            members = createMissingList();
        }
        var node = factory.createEnumDeclaration(modifiers, name, members);
        return withJSDoc(finishNode(node, pos), hasJSDoc);
    }
    function parseModuleBlock() {
        var pos = getNodePos();
        var statements;
        if (parseExpected(19 /* SyntaxKind.OpenBraceToken */)) {
            statements = parseList(1 /* ParsingContext.BlockStatements */, parseStatement);
            parseExpected(20 /* SyntaxKind.CloseBraceToken */);
        }
        else {
            statements = createMissingList();
        }
        return finishNode(factory.createModuleBlock(statements), pos);
    }
    function parseModuleOrNamespaceDeclaration(pos, hasJSDoc, modifiers, flags) {
        // If we are parsing a dotted namespace name, we want to
        // propagate the 'Namespace' flag across the names if set.
        var namespaceFlag = flags & 16 /* NodeFlags.Namespace */;
        var name = parseIdentifier();
        var body = parseOptional(25 /* SyntaxKind.DotToken */)
            ? parseModuleOrNamespaceDeclaration(getNodePos(), /*hasJSDoc*/ false, /*modifiers*/ undefined, 4 /* NodeFlags.NestedNamespace */ | namespaceFlag)
            : parseModuleBlock();
        var node = factory.createModuleDeclaration(modifiers, name, body, flags);
        return withJSDoc(finishNode(node, pos), hasJSDoc);
    }
    function parseAmbientExternalModuleDeclaration(pos, hasJSDoc, modifiersIn) {
        var flags = 0;
        var name;
        if (token() === 161 /* SyntaxKind.GlobalKeyword */) {
            // parse 'global' as name of global scope augmentation
            name = parseIdentifier();
            flags |= 1024 /* NodeFlags.GlobalAugmentation */;
        }
        else {
            name = parseLiteralNode();
            name.text = internIdentifier(name.text);
        }
        var body;
        if (token() === 19 /* SyntaxKind.OpenBraceToken */) {
            body = parseModuleBlock();
        }
        else {
            parseSemicolon();
        }
        var node = factory.createModuleDeclaration(modifiersIn, name, body, flags);
        return withJSDoc(finishNode(node, pos), hasJSDoc);
    }
    function parseModuleDeclaration(pos, hasJSDoc, modifiersIn) {
        var flags = 0;
        if (token() === 161 /* SyntaxKind.GlobalKeyword */) {
            // global augmentation
            return parseAmbientExternalModuleDeclaration(pos, hasJSDoc, modifiersIn);
        }
        else if (parseOptional(145 /* SyntaxKind.NamespaceKeyword */)) {
            flags |= 16 /* NodeFlags.Namespace */;
        }
        else {
            parseExpected(144 /* SyntaxKind.ModuleKeyword */);
            if (token() === 11 /* SyntaxKind.StringLiteral */) {
                return parseAmbientExternalModuleDeclaration(pos, hasJSDoc, modifiersIn);
            }
        }
        return parseModuleOrNamespaceDeclaration(pos, hasJSDoc, modifiersIn, flags);
    }
    function isExternalModuleReference() {
        return token() === 149 /* SyntaxKind.RequireKeyword */ &&
            lookAhead(nextTokenIsOpenParen);
    }
    function nextTokenIsOpenParen() {
        return nextToken() === 21 /* SyntaxKind.OpenParenToken */;
    }
    function nextTokenIsOpenBrace() {
        return nextToken() === 19 /* SyntaxKind.OpenBraceToken */;
    }
    function nextTokenIsSlash() {
        return nextToken() === 44 /* SyntaxKind.SlashToken */;
    }
    function parseNamespaceExportDeclaration(pos, hasJSDoc, modifiers) {
        parseExpected(130 /* SyntaxKind.AsKeyword */);
        parseExpected(145 /* SyntaxKind.NamespaceKeyword */);
        var name = parseIdentifier();
        parseSemicolon();
        var node = factory.createNamespaceExportDeclaration(name);
        // NamespaceExportDeclaration nodes cannot have decorators or modifiers, so we attach them here so we can report them in the grammar checker
        node.modifiers = modifiers;
        return withJSDoc(finishNode(node, pos), hasJSDoc);
    }
    function parseImportDeclarationOrImportEqualsDeclaration(pos, hasJSDoc, modifiers) {
        parseExpected(102 /* SyntaxKind.ImportKeyword */);
        var afterImportPos = scanner.getTokenFullStart();
        // We don't parse the identifier here in await context, instead we will report a grammar error in the checker.
        var identifier;
        if (isIdentifier()) {
            identifier = parseIdentifier();
        }
        var isTypeOnly = false;
        if (token() !== 160 /* SyntaxKind.FromKeyword */ &&
            (identifier === null || identifier === void 0 ? void 0 : identifier.escapedText) === "type" &&
            (isIdentifier() || tokenAfterImportDefinitelyProducesImportDeclaration())) {
            isTypeOnly = true;
            identifier = isIdentifier() ? parseIdentifier() : undefined;
        }
        if (identifier && !tokenAfterImportedIdentifierDefinitelyProducesImportDeclaration()) {
            return parseImportEqualsDeclaration(pos, hasJSDoc, modifiers, identifier, isTypeOnly);
        }
        // ImportDeclaration:
        //  import ImportClause from ModuleSpecifier ;
        //  import ModuleSpecifier;
        var importClause;
        if (identifier || // import id
            token() === 42 /* SyntaxKind.AsteriskToken */ || // import *
            token() === 19 /* SyntaxKind.OpenBraceToken */ // import {
        ) {
            importClause = parseImportClause(identifier, afterImportPos, isTypeOnly);
            parseExpected(160 /* SyntaxKind.FromKeyword */);
        }
        var moduleSpecifier = parseModuleSpecifier();
        var assertClause;
        if (token() === 132 /* SyntaxKind.AssertKeyword */ && !scanner.hasPrecedingLineBreak()) {
            assertClause = parseAssertClause();
        }
        parseSemicolon();
        var node = factory.createImportDeclaration(modifiers, importClause, moduleSpecifier, assertClause);
        return withJSDoc(finishNode(node, pos), hasJSDoc);
    }
    function parseAssertEntry() {
        var pos = getNodePos();
        var name = (0, ts_1.tokenIsIdentifierOrKeyword)(token()) ? parseIdentifierName() : parseLiteralLikeNode(11 /* SyntaxKind.StringLiteral */);
        parseExpected(59 /* SyntaxKind.ColonToken */);
        var value = parseAssignmentExpressionOrHigher(/*allowReturnTypeInArrowFunction*/ true);
        return finishNode(factory.createAssertEntry(name, value), pos);
    }
    function parseAssertClause(skipAssertKeyword) {
        var pos = getNodePos();
        if (!skipAssertKeyword) {
            parseExpected(132 /* SyntaxKind.AssertKeyword */);
        }
        var openBracePosition = scanner.getTokenStart();
        if (parseExpected(19 /* SyntaxKind.OpenBraceToken */)) {
            var multiLine = scanner.hasPrecedingLineBreak();
            var elements = parseDelimitedList(24 /* ParsingContext.AssertEntries */, parseAssertEntry, /*considerSemicolonAsDelimiter*/ true);
            if (!parseExpected(20 /* SyntaxKind.CloseBraceToken */)) {
                var lastError = (0, ts_1.lastOrUndefined)(parseDiagnostics);
                if (lastError && lastError.code === ts_1.Diagnostics._0_expected.code) {
                    (0, ts_1.addRelatedInfo)(lastError, (0, ts_1.createDetachedDiagnostic)(fileName, openBracePosition, 1, ts_1.Diagnostics.The_parser_expected_to_find_a_1_to_match_the_0_token_here, "{", "}"));
                }
            }
            return finishNode(factory.createAssertClause(elements, multiLine), pos);
        }
        else {
            var elements = createNodeArray([], getNodePos(), /*end*/ undefined, /*hasTrailingComma*/ false);
            return finishNode(factory.createAssertClause(elements, /*multiLine*/ false), pos);
        }
    }
    function tokenAfterImportDefinitelyProducesImportDeclaration() {
        return token() === 42 /* SyntaxKind.AsteriskToken */ || token() === 19 /* SyntaxKind.OpenBraceToken */;
    }
    function tokenAfterImportedIdentifierDefinitelyProducesImportDeclaration() {
        // In `import id ___`, the current token decides whether to produce
        // an ImportDeclaration or ImportEqualsDeclaration.
        return token() === 28 /* SyntaxKind.CommaToken */ || token() === 160 /* SyntaxKind.FromKeyword */;
    }
    function parseImportEqualsDeclaration(pos, hasJSDoc, modifiers, identifier, isTypeOnly) {
        parseExpected(64 /* SyntaxKind.EqualsToken */);
        var moduleReference = parseModuleReference();
        parseSemicolon();
        var node = factory.createImportEqualsDeclaration(modifiers, isTypeOnly, identifier, moduleReference);
        var finished = withJSDoc(finishNode(node, pos), hasJSDoc);
        return finished;
    }
    function parseImportClause(identifier, pos, isTypeOnly) {
        // ImportClause:
        //  ImportedDefaultBinding
        //  NameSpaceImport
        //  NamedImports
        //  ImportedDefaultBinding, NameSpaceImport
        //  ImportedDefaultBinding, NamedImports
        // If there was no default import or if there is comma token after default import
        // parse namespace or named imports
        var namedBindings;
        if (!identifier ||
            parseOptional(28 /* SyntaxKind.CommaToken */)) {
            namedBindings = token() === 42 /* SyntaxKind.AsteriskToken */ ? parseNamespaceImport() : parseNamedImportsOrExports(274 /* SyntaxKind.NamedImports */);
        }
        return finishNode(factory.createImportClause(isTypeOnly, identifier, namedBindings), pos);
    }
    function parseModuleReference() {
        return isExternalModuleReference()
            ? parseExternalModuleReference()
            : parseEntityName(/*allowReservedWords*/ false);
    }
    function parseExternalModuleReference() {
        var pos = getNodePos();
        parseExpected(149 /* SyntaxKind.RequireKeyword */);
        parseExpected(21 /* SyntaxKind.OpenParenToken */);
        var expression = parseModuleSpecifier();
        parseExpected(22 /* SyntaxKind.CloseParenToken */);
        return finishNode(factory.createExternalModuleReference(expression), pos);
    }
    function parseModuleSpecifier() {
        if (token() === 11 /* SyntaxKind.StringLiteral */) {
            var result = parseLiteralNode();
            result.text = internIdentifier(result.text);
            return result;
        }
        else {
            // We allow arbitrary expressions here, even though the grammar only allows string
            // literals.  We check to ensure that it is only a string literal later in the grammar
            // check pass.
            return parseExpression();
        }
    }
    function parseNamespaceImport() {
        // NameSpaceImport:
        //  * as ImportedBinding
        var pos = getNodePos();
        parseExpected(42 /* SyntaxKind.AsteriskToken */);
        parseExpected(130 /* SyntaxKind.AsKeyword */);
        var name = parseIdentifier();
        return finishNode(factory.createNamespaceImport(name), pos);
    }
    function parseNamedImportsOrExports(kind) {
        var pos = getNodePos();
        // NamedImports:
        //  { }
        //  { ImportsList }
        //  { ImportsList, }
        // ImportsList:
        //  ImportSpecifier
        //  ImportsList, ImportSpecifier
        var node = kind === 274 /* SyntaxKind.NamedImports */
            ? factory.createNamedImports(parseBracketedList(23 /* ParsingContext.ImportOrExportSpecifiers */, parseImportSpecifier, 19 /* SyntaxKind.OpenBraceToken */, 20 /* SyntaxKind.CloseBraceToken */))
            : factory.createNamedExports(parseBracketedList(23 /* ParsingContext.ImportOrExportSpecifiers */, parseExportSpecifier, 19 /* SyntaxKind.OpenBraceToken */, 20 /* SyntaxKind.CloseBraceToken */));
        return finishNode(node, pos);
    }
    function parseExportSpecifier() {
        var hasJSDoc = hasPrecedingJSDocComment();
        return withJSDoc(parseImportOrExportSpecifier(280 /* SyntaxKind.ExportSpecifier */), hasJSDoc);
    }
    function parseImportSpecifier() {
        return parseImportOrExportSpecifier(275 /* SyntaxKind.ImportSpecifier */);
    }
    function parseImportOrExportSpecifier(kind) {
        var pos = getNodePos();
        // ImportSpecifier:
        //   BindingIdentifier
        //   IdentifierName as BindingIdentifier
        // ExportSpecifier:
        //   IdentifierName
        //   IdentifierName as IdentifierName
        var checkIdentifierIsKeyword = (0, ts_1.isKeyword)(token()) && !isIdentifier();
        var checkIdentifierStart = scanner.getTokenStart();
        var checkIdentifierEnd = scanner.getTokenEnd();
        var isTypeOnly = false;
        var propertyName;
        var canParseAsKeyword = true;
        var name = parseIdentifierName();
        if (name.escapedText === "type") {
            // If the first token of an import specifier is 'type', there are a lot of possibilities,
            // especially if we see 'as' afterwards:
            //
            // import { type } from "mod";          - isTypeOnly: false,   name: type
            // import { type as } from "mod";       - isTypeOnly: true,    name: as
            // import { type as as } from "mod";    - isTypeOnly: false,   name: as,    propertyName: type
            // import { type as as as } from "mod"; - isTypeOnly: true,    name: as,    propertyName: as
            if (token() === 130 /* SyntaxKind.AsKeyword */) {
                // { type as ...? }
                var firstAs = parseIdentifierName();
                if (token() === 130 /* SyntaxKind.AsKeyword */) {
                    // { type as as ...? }
                    var secondAs = parseIdentifierName();
                    if ((0, ts_1.tokenIsIdentifierOrKeyword)(token())) {
                        // { type as as something }
                        isTypeOnly = true;
                        propertyName = firstAs;
                        name = parseNameWithKeywordCheck();
                        canParseAsKeyword = false;
                    }
                    else {
                        // { type as as }
                        propertyName = name;
                        name = secondAs;
                        canParseAsKeyword = false;
                    }
                }
                else if ((0, ts_1.tokenIsIdentifierOrKeyword)(token())) {
                    // { type as something }
                    propertyName = name;
                    canParseAsKeyword = false;
                    name = parseNameWithKeywordCheck();
                }
                else {
                    // { type as }
                    isTypeOnly = true;
                    name = firstAs;
                }
            }
            else if ((0, ts_1.tokenIsIdentifierOrKeyword)(token())) {
                // { type something ...? }
                isTypeOnly = true;
                name = parseNameWithKeywordCheck();
            }
        }
        if (canParseAsKeyword && token() === 130 /* SyntaxKind.AsKeyword */) {
            propertyName = name;
            parseExpected(130 /* SyntaxKind.AsKeyword */);
            name = parseNameWithKeywordCheck();
        }
        if (kind === 275 /* SyntaxKind.ImportSpecifier */ && checkIdentifierIsKeyword) {
            parseErrorAt(checkIdentifierStart, checkIdentifierEnd, ts_1.Diagnostics.Identifier_expected);
        }
        var node = kind === 275 /* SyntaxKind.ImportSpecifier */
            ? factory.createImportSpecifier(isTypeOnly, propertyName, name)
            : factory.createExportSpecifier(isTypeOnly, propertyName, name);
        return finishNode(node, pos);
        function parseNameWithKeywordCheck() {
            checkIdentifierIsKeyword = (0, ts_1.isKeyword)(token()) && !isIdentifier();
            checkIdentifierStart = scanner.getTokenStart();
            checkIdentifierEnd = scanner.getTokenEnd();
            return parseIdentifierName();
        }
    }
    function parseNamespaceExport(pos) {
        return finishNode(factory.createNamespaceExport(parseIdentifierName()), pos);
    }
    function parseExportDeclaration(pos, hasJSDoc, modifiers) {
        var savedAwaitContext = inAwaitContext();
        setAwaitContext(/*value*/ true);
        var exportClause;
        var moduleSpecifier;
        var assertClause;
        var isTypeOnly = parseOptional(156 /* SyntaxKind.TypeKeyword */);
        var namespaceExportPos = getNodePos();
        if (parseOptional(42 /* SyntaxKind.AsteriskToken */)) {
            if (parseOptional(130 /* SyntaxKind.AsKeyword */)) {
                exportClause = parseNamespaceExport(namespaceExportPos);
            }
            parseExpected(160 /* SyntaxKind.FromKeyword */);
            moduleSpecifier = parseModuleSpecifier();
        }
        else {
            exportClause = parseNamedImportsOrExports(278 /* SyntaxKind.NamedExports */);
            // It is not uncommon to accidentally omit the 'from' keyword. Additionally, in editing scenarios,
            // the 'from' keyword can be parsed as a named export when the export clause is unterminated (i.e. `export { from "moduleName";`)
            // If we don't have a 'from' keyword, see if we have a string literal such that ASI won't take effect.
            if (token() === 160 /* SyntaxKind.FromKeyword */ || (token() === 11 /* SyntaxKind.StringLiteral */ && !scanner.hasPrecedingLineBreak())) {
                parseExpected(160 /* SyntaxKind.FromKeyword */);
                moduleSpecifier = parseModuleSpecifier();
            }
        }
        if (moduleSpecifier && token() === 132 /* SyntaxKind.AssertKeyword */ && !scanner.hasPrecedingLineBreak()) {
            assertClause = parseAssertClause();
        }
        parseSemicolon();
        setAwaitContext(savedAwaitContext);
        var node = factory.createExportDeclaration(modifiers, isTypeOnly, exportClause, moduleSpecifier, assertClause);
        return withJSDoc(finishNode(node, pos), hasJSDoc);
    }
    function parseExportAssignment(pos, hasJSDoc, modifiers) {
        var savedAwaitContext = inAwaitContext();
        setAwaitContext(/*value*/ true);
        var isExportEquals;
        if (parseOptional(64 /* SyntaxKind.EqualsToken */)) {
            isExportEquals = true;
        }
        else {
            parseExpected(90 /* SyntaxKind.DefaultKeyword */);
        }
        var expression = parseAssignmentExpressionOrHigher(/*allowReturnTypeInArrowFunction*/ true);
        parseSemicolon();
        setAwaitContext(savedAwaitContext);
        var node = factory.createExportAssignment(modifiers, isExportEquals, expression);
        return withJSDoc(finishNode(node, pos), hasJSDoc);
    }
    var JSDocParser;
    (function (JSDocParser) {
        function parseJSDocTypeExpressionForTests(content, start, length) {
            initializeState("file.js", content, 99 /* ScriptTarget.Latest */, /*syntaxCursor*/ undefined, 1 /* ScriptKind.JS */);
            scanner.setText(content, start, length);
            currentToken = scanner.scan();
            var jsDocTypeExpression = parseJSDocTypeExpression();
            var sourceFile = createSourceFile("file.js", 99 /* ScriptTarget.Latest */, 1 /* ScriptKind.JS */, /*isDeclarationFile*/ false, [], factoryCreateToken(1 /* SyntaxKind.EndOfFileToken */), 0 /* NodeFlags.None */, ts_1.noop);
            var diagnostics = (0, ts_1.attachFileToDiagnostics)(parseDiagnostics, sourceFile);
            if (jsDocDiagnostics) {
                sourceFile.jsDocDiagnostics = (0, ts_1.attachFileToDiagnostics)(jsDocDiagnostics, sourceFile);
            }
            clearState();
            return jsDocTypeExpression ? { jsDocTypeExpression: jsDocTypeExpression, diagnostics: diagnostics } : undefined;
        }
        JSDocParser.parseJSDocTypeExpressionForTests = parseJSDocTypeExpressionForTests;
        // Parses out a JSDoc type expression.
        function parseJSDocTypeExpression(mayOmitBraces) {
            var pos = getNodePos();
            var hasBrace = (mayOmitBraces ? parseOptional : parseExpected)(19 /* SyntaxKind.OpenBraceToken */);
            var type = doInsideOfContext(8388608 /* NodeFlags.JSDoc */, parseJSDocType);
            if (!mayOmitBraces || hasBrace) {
                parseExpectedJSDoc(20 /* SyntaxKind.CloseBraceToken */);
            }
            var result = factory.createJSDocTypeExpression(type);
            fixupParentReferences(result);
            return finishNode(result, pos);
        }
        JSDocParser.parseJSDocTypeExpression = parseJSDocTypeExpression;
        function parseJSDocNameReference() {
            var pos = getNodePos();
            var hasBrace = parseOptional(19 /* SyntaxKind.OpenBraceToken */);
            var p2 = getNodePos();
            var entityName = parseEntityName(/*allowReservedWords*/ false);
            while (token() === 81 /* SyntaxKind.PrivateIdentifier */) {
                reScanHashToken(); // rescan #id as # id
                nextTokenJSDoc(); // then skip the #
                entityName = finishNode(factory.createJSDocMemberName(entityName, parseIdentifier()), p2);
            }
            if (hasBrace) {
                parseExpectedJSDoc(20 /* SyntaxKind.CloseBraceToken */);
            }
            var result = factory.createJSDocNameReference(entityName);
            fixupParentReferences(result);
            return finishNode(result, pos);
        }
        JSDocParser.parseJSDocNameReference = parseJSDocNameReference;
        function parseIsolatedJSDocComment(content, start, length) {
            initializeState("", content, 99 /* ScriptTarget.Latest */, /*syntaxCursor*/ undefined, 1 /* ScriptKind.JS */);
            var jsDoc = doInsideOfContext(8388608 /* NodeFlags.JSDoc */, function () { return parseJSDocCommentWorker(start, length); });
            var sourceFile = { languageVariant: 0 /* LanguageVariant.Standard */, text: content };
            var diagnostics = (0, ts_1.attachFileToDiagnostics)(parseDiagnostics, sourceFile);
            clearState();
            return jsDoc ? { jsDoc: jsDoc, diagnostics: diagnostics } : undefined;
        }
        JSDocParser.parseIsolatedJSDocComment = parseIsolatedJSDocComment;
        function parseJSDocComment(parent, start, length) {
            var saveToken = currentToken;
            var saveParseDiagnosticsLength = parseDiagnostics.length;
            var saveParseErrorBeforeNextFinishedNode = parseErrorBeforeNextFinishedNode;
            var comment = doInsideOfContext(8388608 /* NodeFlags.JSDoc */, function () { return parseJSDocCommentWorker(start, length); });
            (0, ts_1.setParent)(comment, parent);
            if (contextFlags & 262144 /* NodeFlags.JavaScriptFile */) {
                if (!jsDocDiagnostics) {
                    jsDocDiagnostics = [];
                }
                jsDocDiagnostics.push.apply(jsDocDiagnostics, parseDiagnostics);
            }
            currentToken = saveToken;
            parseDiagnostics.length = saveParseDiagnosticsLength;
            parseErrorBeforeNextFinishedNode = saveParseErrorBeforeNextFinishedNode;
            return comment;
        }
        JSDocParser.parseJSDocComment = parseJSDocComment;
        function parseJSDocCommentWorker(start, length) {
            if (start === void 0) { start = 0; }
            var saveParsingContext = parsingContext;
            parsingContext |= 1 << 25 /* ParsingContext.JSDocComment */;
            var content = sourceText;
            var end = length === undefined ? content.length : start + length;
            length = end - start;
            ts_1.Debug.assert(start >= 0);
            ts_1.Debug.assert(start <= end);
            ts_1.Debug.assert(end <= content.length);
            // Check for /** (JSDoc opening part)
            if (!isJSDocLikeText(content, start)) {
                return undefined;
            }
            var tags;
            var tagsPos;
            var tagsEnd;
            var linkEnd;
            var commentsPos;
            var comments = [];
            var parts = [];
            // + 3 for leading /**, - 5 in total for /** */
            var result = scanner.scanRange(start + 3, length - 5, doJSDocScan);
            parsingContext = saveParsingContext;
            return result;
            function doJSDocScan() {
                // Initially we can parse out a tag.  We also have seen a starting asterisk.
                // This is so that /** * @type */ doesn't parse.
                var state = 1 /* JSDocState.SawAsterisk */;
                var margin;
                // + 4 for leading '/** '
                // + 1 because the last index of \n is always one index before the first character in the line and coincidentally, if there is no \n before start, it is -1, which is also one index before the first character
                var indent = start - (content.lastIndexOf("\n", start) + 1) + 4;
                function pushComment(text) {
                    if (!margin) {
                        margin = indent;
                    }
                    comments.push(text);
                    indent += text.length;
                }
                nextTokenJSDoc();
                while (parseOptionalJsdoc(5 /* SyntaxKind.WhitespaceTrivia */))
                    ;
                if (parseOptionalJsdoc(4 /* SyntaxKind.NewLineTrivia */)) {
                    state = 0 /* JSDocState.BeginningOfLine */;
                    indent = 0;
                }
                loop: while (true) {
                    switch (token()) {
                        case 60 /* SyntaxKind.AtToken */:
                            removeTrailingWhitespace(comments);
                            if (!commentsPos)
                                commentsPos = getNodePos();
                            addTag(parseTag(indent));
                            // NOTE: According to usejsdoc.org, a tag goes to end of line, except the last tag.
                            // Real-world comments may break this rule, so "BeginningOfLine" will not be a real line beginning
                            // for malformed examples like `/** @param {string} x @returns {number} the length */`
                            state = 0 /* JSDocState.BeginningOfLine */;
                            margin = undefined;
                            break;
                        case 4 /* SyntaxKind.NewLineTrivia */:
                            comments.push(scanner.getTokenText());
                            state = 0 /* JSDocState.BeginningOfLine */;
                            indent = 0;
                            break;
                        case 42 /* SyntaxKind.AsteriskToken */:
                            var asterisk = scanner.getTokenText();
                            if (state === 1 /* JSDocState.SawAsterisk */) {
                                // If we've already seen an asterisk, then we can no longer parse a tag on this line
                                state = 2 /* JSDocState.SavingComments */;
                                pushComment(asterisk);
                            }
                            else {
                                ts_1.Debug.assert(state === 0 /* JSDocState.BeginningOfLine */);
                                // Ignore the first asterisk on a line
                                state = 1 /* JSDocState.SawAsterisk */;
                                indent += asterisk.length;
                            }
                            break;
                        case 5 /* SyntaxKind.WhitespaceTrivia */:
                            ts_1.Debug.assert(state !== 2 /* JSDocState.SavingComments */, "whitespace shouldn't come from the scanner while saving top-level comment text");
                            // only collect whitespace if we're already saving comments or have just crossed the comment indent margin
                            var whitespace = scanner.getTokenText();
                            if (margin !== undefined && indent + whitespace.length > margin) {
                                comments.push(whitespace.slice(margin - indent));
                            }
                            indent += whitespace.length;
                            break;
                        case 1 /* SyntaxKind.EndOfFileToken */:
                            break loop;
                        case 82 /* SyntaxKind.JSDocCommentTextToken */:
                            state = 2 /* JSDocState.SavingComments */;
                            pushComment(scanner.getTokenValue());
                            break;
                        case 19 /* SyntaxKind.OpenBraceToken */:
                            state = 2 /* JSDocState.SavingComments */;
                            var commentEnd = scanner.getTokenFullStart();
                            var linkStart = scanner.getTokenEnd() - 1;
                            var link = parseJSDocLink(linkStart);
                            if (link) {
                                if (!linkEnd) {
                                    removeLeadingNewlines(comments);
                                }
                                parts.push(finishNode(factory.createJSDocText(comments.join("")), linkEnd !== null && linkEnd !== void 0 ? linkEnd : start, commentEnd));
                                parts.push(link);
                                comments = [];
                                linkEnd = scanner.getTokenEnd();
                                break;
                            }
                        // fallthrough if it's not a {@link sequence
                        default:
                            // Anything else is doc comment text. We just save it. Because it
                            // wasn't a tag, we can no longer parse a tag on this line until we hit the next
                            // line break.
                            state = 2 /* JSDocState.SavingComments */;
                            pushComment(scanner.getTokenText());
                            break;
                    }
                    if (state === 2 /* JSDocState.SavingComments */) {
                        nextJSDocCommentTextToken(/*inBackticks*/ false);
                    }
                    else {
                        nextTokenJSDoc();
                    }
                }
                var trimmedComments = (0, ts_1.trimStringEnd)(comments.join(""));
                if (parts.length && trimmedComments.length) {
                    parts.push(finishNode(factory.createJSDocText(trimmedComments), linkEnd !== null && linkEnd !== void 0 ? linkEnd : start, commentsPos));
                }
                if (parts.length && tags)
                    ts_1.Debug.assertIsDefined(commentsPos, "having parsed tags implies that the end of the comment span should be set");
                var tagsArray = tags && createNodeArray(tags, tagsPos, tagsEnd);
                return finishNode(factory.createJSDocComment(parts.length ? createNodeArray(parts, start, commentsPos) : trimmedComments.length ? trimmedComments : undefined, tagsArray), start, end);
            }
            function removeLeadingNewlines(comments) {
                while (comments.length && (comments[0] === "\n" || comments[0] === "\r")) {
                    comments.shift();
                }
            }
            function removeTrailingWhitespace(comments) {
                while (comments.length) {
                    var trimmed = (0, ts_1.trimStringEnd)(comments[comments.length - 1]);
                    if (trimmed === "") {
                        comments.pop();
                    }
                    else if (trimmed.length < comments[comments.length - 1].length) {
                        comments[comments.length - 1] = trimmed;
                        break;
                    }
                    else {
                        break;
                    }
                }
            }
            function isNextNonwhitespaceTokenEndOfFile() {
                // We must use infinite lookahead, as there could be any number of newlines :(
                while (true) {
                    nextTokenJSDoc();
                    if (token() === 1 /* SyntaxKind.EndOfFileToken */) {
                        return true;
                    }
                    if (!(token() === 5 /* SyntaxKind.WhitespaceTrivia */ || token() === 4 /* SyntaxKind.NewLineTrivia */)) {
                        return false;
                    }
                }
            }
            function skipWhitespace() {
                if (token() === 5 /* SyntaxKind.WhitespaceTrivia */ || token() === 4 /* SyntaxKind.NewLineTrivia */) {
                    if (lookAhead(isNextNonwhitespaceTokenEndOfFile)) {
                        return; // Don't skip whitespace prior to EoF (or end of comment) - that shouldn't be included in any node's range
                    }
                }
                while (token() === 5 /* SyntaxKind.WhitespaceTrivia */ || token() === 4 /* SyntaxKind.NewLineTrivia */) {
                    nextTokenJSDoc();
                }
            }
            function skipWhitespaceOrAsterisk() {
                if (token() === 5 /* SyntaxKind.WhitespaceTrivia */ || token() === 4 /* SyntaxKind.NewLineTrivia */) {
                    if (lookAhead(isNextNonwhitespaceTokenEndOfFile)) {
                        return ""; // Don't skip whitespace prior to EoF (or end of comment) - that shouldn't be included in any node's range
                    }
                }
                var precedingLineBreak = scanner.hasPrecedingLineBreak();
                var seenLineBreak = false;
                var indentText = "";
                while ((precedingLineBreak && token() === 42 /* SyntaxKind.AsteriskToken */) || token() === 5 /* SyntaxKind.WhitespaceTrivia */ || token() === 4 /* SyntaxKind.NewLineTrivia */) {
                    indentText += scanner.getTokenText();
                    if (token() === 4 /* SyntaxKind.NewLineTrivia */) {
                        precedingLineBreak = true;
                        seenLineBreak = true;
                        indentText = "";
                    }
                    else if (token() === 42 /* SyntaxKind.AsteriskToken */) {
                        precedingLineBreak = false;
                    }
                    nextTokenJSDoc();
                }
                return seenLineBreak ? indentText : "";
            }
            function parseTag(margin) {
                ts_1.Debug.assert(token() === 60 /* SyntaxKind.AtToken */);
                var start = scanner.getTokenStart();
                nextTokenJSDoc();
                var tagName = parseJSDocIdentifierName(/*message*/ undefined);
                var indentText = skipWhitespaceOrAsterisk();
                var tag;
                switch (tagName.escapedText) {
                    case "author":
                        tag = parseAuthorTag(start, tagName, margin, indentText);
                        break;
                    case "implements":
                        tag = parseImplementsTag(start, tagName, margin, indentText);
                        break;
                    case "augments":
                    case "extends":
                        tag = parseAugmentsTag(start, tagName, margin, indentText);
                        break;
                    case "class":
                    case "constructor":
                        tag = parseSimpleTag(start, factory.createJSDocClassTag, tagName, margin, indentText);
                        break;
                    case "public":
                        tag = parseSimpleTag(start, factory.createJSDocPublicTag, tagName, margin, indentText);
                        break;
                    case "private":
                        tag = parseSimpleTag(start, factory.createJSDocPrivateTag, tagName, margin, indentText);
                        break;
                    case "protected":
                        tag = parseSimpleTag(start, factory.createJSDocProtectedTag, tagName, margin, indentText);
                        break;
                    case "readonly":
                        tag = parseSimpleTag(start, factory.createJSDocReadonlyTag, tagName, margin, indentText);
                        break;
                    case "override":
                        tag = parseSimpleTag(start, factory.createJSDocOverrideTag, tagName, margin, indentText);
                        break;
                    case "deprecated":
                        hasDeprecatedTag = true;
                        tag = parseSimpleTag(start, factory.createJSDocDeprecatedTag, tagName, margin, indentText);
                        break;
                    case "this":
                        tag = parseThisTag(start, tagName, margin, indentText);
                        break;
                    case "enum":
                        tag = parseEnumTag(start, tagName, margin, indentText);
                        break;
                    case "arg":
                    case "argument":
                    case "param":
                        return parseParameterOrPropertyTag(start, tagName, 2 /* PropertyLikeParse.Parameter */, margin);
                    case "return":
                    case "returns":
                        tag = parseReturnTag(start, tagName, margin, indentText);
                        break;
                    case "template":
                        tag = parseTemplateTag(start, tagName, margin, indentText);
                        break;
                    case "type":
                        tag = parseTypeTag(start, tagName, margin, indentText);
                        break;
                    case "typedef":
                        tag = parseTypedefTag(start, tagName, margin, indentText);
                        break;
                    case "callback":
                        tag = parseCallbackTag(start, tagName, margin, indentText);
                        break;
                    case "overload":
                        tag = parseOverloadTag(start, tagName, margin, indentText);
                        break;
                    case "satisfies":
                        tag = parseSatisfiesTag(start, tagName, margin, indentText);
                        break;
                    case "see":
                        tag = parseSeeTag(start, tagName, margin, indentText);
                        break;
                    case "exception":
                    case "throws":
                        tag = parseThrowsTag(start, tagName, margin, indentText);
                        break;
                    default:
                        tag = parseUnknownTag(start, tagName, margin, indentText);
                        break;
                }
                return tag;
            }
            function parseTrailingTagComments(pos, end, margin, indentText) {
                // some tags, like typedef and callback, have already parsed their comments earlier
                if (!indentText) {
                    margin += end - pos;
                }
                return parseTagComments(margin, indentText.slice(margin));
            }
            function parseTagComments(indent, initialMargin) {
                var commentsPos = getNodePos();
                var comments = [];
                var parts = [];
                var linkEnd;
                var state = 0 /* JSDocState.BeginningOfLine */;
                var margin;
                function pushComment(text) {
                    if (!margin) {
                        margin = indent;
                    }
                    comments.push(text);
                    indent += text.length;
                }
                if (initialMargin !== undefined) {
                    // jump straight to saving comments if there is some initial indentation
                    if (initialMargin !== "") {
                        pushComment(initialMargin);
                    }
                    state = 1 /* JSDocState.SawAsterisk */;
                }
                var tok = token();
                loop: while (true) {
                    switch (tok) {
                        case 4 /* SyntaxKind.NewLineTrivia */:
                            state = 0 /* JSDocState.BeginningOfLine */;
                            // don't use pushComment here because we want to keep the margin unchanged
                            comments.push(scanner.getTokenText());
                            indent = 0;
                            break;
                        case 60 /* SyntaxKind.AtToken */:
                            scanner.resetTokenState(scanner.getTokenEnd() - 1);
                            break loop;
                        case 1 /* SyntaxKind.EndOfFileToken */:
                            // Done
                            break loop;
                        case 5 /* SyntaxKind.WhitespaceTrivia */:
                            ts_1.Debug.assert(state !== 2 /* JSDocState.SavingComments */ && state !== 3 /* JSDocState.SavingBackticks */, "whitespace shouldn't come from the scanner while saving comment text");
                            var whitespace = scanner.getTokenText();
                            // if the whitespace crosses the margin, take only the whitespace that passes the margin
                            if (margin !== undefined && indent + whitespace.length > margin) {
                                comments.push(whitespace.slice(margin - indent));
                                state = 2 /* JSDocState.SavingComments */;
                            }
                            indent += whitespace.length;
                            break;
                        case 19 /* SyntaxKind.OpenBraceToken */:
                            state = 2 /* JSDocState.SavingComments */;
                            var commentEnd = scanner.getTokenFullStart();
                            var linkStart = scanner.getTokenEnd() - 1;
                            var link = parseJSDocLink(linkStart);
                            if (link) {
                                parts.push(finishNode(factory.createJSDocText(comments.join("")), linkEnd !== null && linkEnd !== void 0 ? linkEnd : commentsPos, commentEnd));
                                parts.push(link);
                                comments = [];
                                linkEnd = scanner.getTokenEnd();
                            }
                            else {
                                pushComment(scanner.getTokenText());
                            }
                            break;
                        case 62 /* SyntaxKind.BacktickToken */:
                            if (state === 3 /* JSDocState.SavingBackticks */) {
                                state = 2 /* JSDocState.SavingComments */;
                            }
                            else {
                                state = 3 /* JSDocState.SavingBackticks */;
                            }
                            pushComment(scanner.getTokenText());
                            break;
                        case 82 /* SyntaxKind.JSDocCommentTextToken */:
                            if (state !== 3 /* JSDocState.SavingBackticks */) {
                                state = 2 /* JSDocState.SavingComments */; // leading identifiers start recording as well
                            }
                            pushComment(scanner.getTokenValue());
                            break;
                        case 42 /* SyntaxKind.AsteriskToken */:
                            if (state === 0 /* JSDocState.BeginningOfLine */) {
                                // leading asterisks start recording on the *next* (non-whitespace) token
                                state = 1 /* JSDocState.SawAsterisk */;
                                indent += 1;
                                break;
                            }
                        // record the * as a comment
                        // falls through
                        default:
                            if (state !== 3 /* JSDocState.SavingBackticks */) {
                                state = 2 /* JSDocState.SavingComments */; // leading identifiers start recording as well
                            }
                            pushComment(scanner.getTokenText());
                            break;
                    }
                    if (state === 2 /* JSDocState.SavingComments */ || state === 3 /* JSDocState.SavingBackticks */) {
                        tok = nextJSDocCommentTextToken(state === 3 /* JSDocState.SavingBackticks */);
                    }
                    else {
                        tok = nextTokenJSDoc();
                    }
                }
                removeLeadingNewlines(comments);
                var trimmedComments = (0, ts_1.trimStringEnd)(comments.join(""));
                if (parts.length) {
                    if (trimmedComments.length) {
                        parts.push(finishNode(factory.createJSDocText(trimmedComments), linkEnd !== null && linkEnd !== void 0 ? linkEnd : commentsPos));
                    }
                    return createNodeArray(parts, commentsPos, scanner.getTokenEnd());
                }
                else if (trimmedComments.length) {
                    return trimmedComments;
                }
            }
            function parseJSDocLink(start) {
                var linkType = tryParse(parseJSDocLinkPrefix);
                if (!linkType) {
                    return undefined;
                }
                nextTokenJSDoc(); // start at token after link, then skip any whitespace
                skipWhitespace();
                // parseEntityName logs an error for non-identifier, so create a MissingNode ourselves to avoid the error
                var p2 = getNodePos();
                var name = (0, ts_1.tokenIsIdentifierOrKeyword)(token())
                    ? parseEntityName(/*allowReservedWords*/ true)
                    : undefined;
                if (name) {
                    while (token() === 81 /* SyntaxKind.PrivateIdentifier */) {
                        reScanHashToken(); // rescan #id as # id
                        nextTokenJSDoc(); // then skip the #
                        name = finishNode(factory.createJSDocMemberName(name, parseIdentifier()), p2);
                    }
                }
                var text = [];
                while (token() !== 20 /* SyntaxKind.CloseBraceToken */ && token() !== 4 /* SyntaxKind.NewLineTrivia */ && token() !== 1 /* SyntaxKind.EndOfFileToken */) {
                    text.push(scanner.getTokenText());
                    nextTokenJSDoc();
                }
                var create = linkType === "link" ? factory.createJSDocLink
                    : linkType === "linkcode" ? factory.createJSDocLinkCode
                        : factory.createJSDocLinkPlain;
                return finishNode(create(name, text.join("")), start, scanner.getTokenEnd());
            }
            function parseJSDocLinkPrefix() {
                skipWhitespaceOrAsterisk();
                if (token() === 19 /* SyntaxKind.OpenBraceToken */
                    && nextTokenJSDoc() === 60 /* SyntaxKind.AtToken */
                    && (0, ts_1.tokenIsIdentifierOrKeyword)(nextTokenJSDoc())) {
                    var kind = scanner.getTokenValue();
                    if (isJSDocLinkTag(kind))
                        return kind;
                }
            }
            function isJSDocLinkTag(kind) {
                return kind === "link" || kind === "linkcode" || kind === "linkplain";
            }
            function parseUnknownTag(start, tagName, indent, indentText) {
                return finishNode(factory.createJSDocUnknownTag(tagName, parseTrailingTagComments(start, getNodePos(), indent, indentText)), start);
            }
            function addTag(tag) {
                if (!tag) {
                    return;
                }
                if (!tags) {
                    tags = [tag];
                    tagsPos = tag.pos;
                }
                else {
                    tags.push(tag);
                }
                tagsEnd = tag.end;
            }
            function tryParseTypeExpression() {
                skipWhitespaceOrAsterisk();
                return token() === 19 /* SyntaxKind.OpenBraceToken */ ? parseJSDocTypeExpression() : undefined;
            }
            function parseBracketNameInPropertyAndParamTag() {
                // Looking for something like '[foo]', 'foo', '[foo.bar]' or 'foo.bar'
                var isBracketed = parseOptionalJsdoc(23 /* SyntaxKind.OpenBracketToken */);
                if (isBracketed) {
                    skipWhitespace();
                }
                // a markdown-quoted name: `arg` is not legal jsdoc, but occurs in the wild
                var isBackquoted = parseOptionalJsdoc(62 /* SyntaxKind.BacktickToken */);
                var name = parseJSDocEntityName();
                if (isBackquoted) {
                    parseExpectedTokenJSDoc(62 /* SyntaxKind.BacktickToken */);
                }
                if (isBracketed) {
                    skipWhitespace();
                    // May have an optional default, e.g. '[foo = 42]'
                    if (parseOptionalToken(64 /* SyntaxKind.EqualsToken */)) {
                        parseExpression();
                    }
                    parseExpected(24 /* SyntaxKind.CloseBracketToken */);
                }
                return { name: name, isBracketed: isBracketed };
            }
            function isObjectOrObjectArrayTypeReference(node) {
                switch (node.kind) {
                    case 151 /* SyntaxKind.ObjectKeyword */:
                        return true;
                    case 187 /* SyntaxKind.ArrayType */:
                        return isObjectOrObjectArrayTypeReference(node.elementType);
                    default:
                        return (0, ts_1.isTypeReferenceNode)(node) && (0, ts_1.isIdentifier)(node.typeName) && node.typeName.escapedText === "Object" && !node.typeArguments;
                }
            }
            function parseParameterOrPropertyTag(start, tagName, target, indent) {
                var typeExpression = tryParseTypeExpression();
                var isNameFirst = !typeExpression;
                skipWhitespaceOrAsterisk();
                var _a = parseBracketNameInPropertyAndParamTag(), name = _a.name, isBracketed = _a.isBracketed;
                var indentText = skipWhitespaceOrAsterisk();
                if (isNameFirst && !lookAhead(parseJSDocLinkPrefix)) {
                    typeExpression = tryParseTypeExpression();
                }
                var comment = parseTrailingTagComments(start, getNodePos(), indent, indentText);
                var nestedTypeLiteral = target !== 4 /* PropertyLikeParse.CallbackParameter */ && parseNestedTypeLiteral(typeExpression, name, target, indent);
                if (nestedTypeLiteral) {
                    typeExpression = nestedTypeLiteral;
                    isNameFirst = true;
                }
                var result = target === 1 /* PropertyLikeParse.Property */
                    ? factory.createJSDocPropertyTag(tagName, name, isBracketed, typeExpression, isNameFirst, comment)
                    : factory.createJSDocParameterTag(tagName, name, isBracketed, typeExpression, isNameFirst, comment);
                return finishNode(result, start);
            }
            function parseNestedTypeLiteral(typeExpression, name, target, indent) {
                if (typeExpression && isObjectOrObjectArrayTypeReference(typeExpression.type)) {
                    var pos = getNodePos();
                    var child = void 0;
                    var children = void 0;
                    while (child = tryParse(function () { return parseChildParameterOrPropertyTag(target, indent, name); })) {
                        if (child.kind === 347 /* SyntaxKind.JSDocParameterTag */ || child.kind === 354 /* SyntaxKind.JSDocPropertyTag */) {
                            children = (0, ts_1.append)(children, child);
                        }
                        else if (child.kind === 351 /* SyntaxKind.JSDocTemplateTag */) {
                            parseErrorAtRange(child.tagName, ts_1.Diagnostics.A_JSDoc_template_tag_may_not_follow_a_typedef_callback_or_overload_tag);
                        }
                    }
                    if (children) {
                        var literal = finishNode(factory.createJSDocTypeLiteral(children, typeExpression.type.kind === 187 /* SyntaxKind.ArrayType */), pos);
                        return finishNode(factory.createJSDocTypeExpression(literal), pos);
                    }
                }
            }
            function parseReturnTag(start, tagName, indent, indentText) {
                if ((0, ts_1.some)(tags, ts_1.isJSDocReturnTag)) {
                    parseErrorAt(tagName.pos, scanner.getTokenStart(), ts_1.Diagnostics._0_tag_already_specified, (0, ts_1.unescapeLeadingUnderscores)(tagName.escapedText));
                }
                var typeExpression = tryParseTypeExpression();
                return finishNode(factory.createJSDocReturnTag(tagName, typeExpression, parseTrailingTagComments(start, getNodePos(), indent, indentText)), start);
            }
            function parseTypeTag(start, tagName, indent, indentText) {
                if ((0, ts_1.some)(tags, ts_1.isJSDocTypeTag)) {
                    parseErrorAt(tagName.pos, scanner.getTokenStart(), ts_1.Diagnostics._0_tag_already_specified, (0, ts_1.unescapeLeadingUnderscores)(tagName.escapedText));
                }
                var typeExpression = parseJSDocTypeExpression(/*mayOmitBraces*/ true);
                var comments = indent !== undefined && indentText !== undefined ? parseTrailingTagComments(start, getNodePos(), indent, indentText) : undefined;
                return finishNode(factory.createJSDocTypeTag(tagName, typeExpression, comments), start);
            }
            function parseSeeTag(start, tagName, indent, indentText) {
                var isMarkdownOrJSDocLink = token() === 23 /* SyntaxKind.OpenBracketToken */
                    || lookAhead(function () { return nextTokenJSDoc() === 60 /* SyntaxKind.AtToken */ && (0, ts_1.tokenIsIdentifierOrKeyword)(nextTokenJSDoc()) && isJSDocLinkTag(scanner.getTokenValue()); });
                var nameExpression = isMarkdownOrJSDocLink ? undefined : parseJSDocNameReference();
                var comments = indent !== undefined && indentText !== undefined ? parseTrailingTagComments(start, getNodePos(), indent, indentText) : undefined;
                return finishNode(factory.createJSDocSeeTag(tagName, nameExpression, comments), start);
            }
            function parseThrowsTag(start, tagName, indent, indentText) {
                var typeExpression = tryParseTypeExpression();
                var comment = parseTrailingTagComments(start, getNodePos(), indent, indentText);
                return finishNode(factory.createJSDocThrowsTag(tagName, typeExpression, comment), start);
            }
            function parseAuthorTag(start, tagName, indent, indentText) {
                var commentStart = getNodePos();
                var textOnly = parseAuthorNameAndEmail();
                var commentEnd = scanner.getTokenFullStart();
                var comments = parseTrailingTagComments(start, commentEnd, indent, indentText);
                if (!comments) {
                    commentEnd = scanner.getTokenFullStart();
                }
                var allParts = typeof comments !== "string"
                    ? createNodeArray((0, ts_1.concatenate)([finishNode(textOnly, commentStart, commentEnd)], comments), commentStart) // cast away readonly
                    : textOnly.text + comments;
                return finishNode(factory.createJSDocAuthorTag(tagName, allParts), start);
            }
            function parseAuthorNameAndEmail() {
                var comments = [];
                var inEmail = false;
                var token = scanner.getToken();
                while (token !== 1 /* SyntaxKind.EndOfFileToken */ && token !== 4 /* SyntaxKind.NewLineTrivia */) {
                    if (token === 30 /* SyntaxKind.LessThanToken */) {
                        inEmail = true;
                    }
                    else if (token === 60 /* SyntaxKind.AtToken */ && !inEmail) {
                        break;
                    }
                    else if (token === 32 /* SyntaxKind.GreaterThanToken */ && inEmail) {
                        comments.push(scanner.getTokenText());
                        scanner.resetTokenState(scanner.getTokenEnd());
                        break;
                    }
                    comments.push(scanner.getTokenText());
                    token = nextTokenJSDoc();
                }
                return factory.createJSDocText(comments.join(""));
            }
            function parseImplementsTag(start, tagName, margin, indentText) {
                var className = parseExpressionWithTypeArgumentsForAugments();
                return finishNode(factory.createJSDocImplementsTag(tagName, className, parseTrailingTagComments(start, getNodePos(), margin, indentText)), start);
            }
            function parseAugmentsTag(start, tagName, margin, indentText) {
                var className = parseExpressionWithTypeArgumentsForAugments();
                return finishNode(factory.createJSDocAugmentsTag(tagName, className, parseTrailingTagComments(start, getNodePos(), margin, indentText)), start);
            }
            function parseSatisfiesTag(start, tagName, margin, indentText) {
                var typeExpression = parseJSDocTypeExpression(/*mayOmitBraces*/ false);
                var comments = margin !== undefined && indentText !== undefined ? parseTrailingTagComments(start, getNodePos(), margin, indentText) : undefined;
                return finishNode(factory.createJSDocSatisfiesTag(tagName, typeExpression, comments), start);
            }
            function parseExpressionWithTypeArgumentsForAugments() {
                var usedBrace = parseOptional(19 /* SyntaxKind.OpenBraceToken */);
                var pos = getNodePos();
                var expression = parsePropertyAccessEntityNameExpression();
                scanner.setInJSDocType(true);
                var typeArguments = tryParseTypeArguments();
                scanner.setInJSDocType(false);
                var node = factory.createExpressionWithTypeArguments(expression, typeArguments);
                var res = finishNode(node, pos);
                if (usedBrace) {
                    parseExpected(20 /* SyntaxKind.CloseBraceToken */);
                }
                return res;
            }
            function parsePropertyAccessEntityNameExpression() {
                var pos = getNodePos();
                var node = parseJSDocIdentifierName();
                while (parseOptional(25 /* SyntaxKind.DotToken */)) {
                    var name_5 = parseJSDocIdentifierName();
                    node = finishNode(factoryCreatePropertyAccessExpression(node, name_5), pos);
                }
                return node;
            }
            function parseSimpleTag(start, createTag, tagName, margin, indentText) {
                return finishNode(createTag(tagName, parseTrailingTagComments(start, getNodePos(), margin, indentText)), start);
            }
            function parseThisTag(start, tagName, margin, indentText) {
                var typeExpression = parseJSDocTypeExpression(/*mayOmitBraces*/ true);
                skipWhitespace();
                return finishNode(factory.createJSDocThisTag(tagName, typeExpression, parseTrailingTagComments(start, getNodePos(), margin, indentText)), start);
            }
            function parseEnumTag(start, tagName, margin, indentText) {
                var typeExpression = parseJSDocTypeExpression(/*mayOmitBraces*/ true);
                skipWhitespace();
                return finishNode(factory.createJSDocEnumTag(tagName, typeExpression, parseTrailingTagComments(start, getNodePos(), margin, indentText)), start);
            }
            function parseTypedefTag(start, tagName, indent, indentText) {
                var _a;
                var typeExpression = tryParseTypeExpression();
                skipWhitespaceOrAsterisk();
                var fullName = parseJSDocTypeNameWithNamespace();
                skipWhitespace();
                var comment = parseTagComments(indent);
                var end;
                if (!typeExpression || isObjectOrObjectArrayTypeReference(typeExpression.type)) {
                    var child = void 0;
                    var childTypeTag = void 0;
                    var jsDocPropertyTags = void 0;
                    var hasChildren = false;
                    while (child = tryParse(function () { return parseChildPropertyTag(indent); })) {
                        if (child.kind === 351 /* SyntaxKind.JSDocTemplateTag */) {
                            break;
                        }
                        hasChildren = true;
                        if (child.kind === 350 /* SyntaxKind.JSDocTypeTag */) {
                            if (childTypeTag) {
                                var lastError = parseErrorAtCurrentToken(ts_1.Diagnostics.A_JSDoc_typedef_comment_may_not_contain_multiple_type_tags);
                                if (lastError) {
                                    (0, ts_1.addRelatedInfo)(lastError, (0, ts_1.createDetachedDiagnostic)(fileName, 0, 0, ts_1.Diagnostics.The_tag_was_first_specified_here));
                                }
                                break;
                            }
                            else {
                                childTypeTag = child;
                            }
                        }
                        else {
                            jsDocPropertyTags = (0, ts_1.append)(jsDocPropertyTags, child);
                        }
                    }
                    if (hasChildren) {
                        var isArrayType = typeExpression && typeExpression.type.kind === 187 /* SyntaxKind.ArrayType */;
                        var jsdocTypeLiteral = factory.createJSDocTypeLiteral(jsDocPropertyTags, isArrayType);
                        typeExpression = childTypeTag && childTypeTag.typeExpression && !isObjectOrObjectArrayTypeReference(childTypeTag.typeExpression.type) ?
                            childTypeTag.typeExpression :
                            finishNode(jsdocTypeLiteral, start);
                        end = typeExpression.end;
                    }
                }
                // Only include the characters between the name end and the next token if a comment was actually parsed out - otherwise it's just whitespace
                end = end || comment !== undefined ?
                    getNodePos() :
                    ((_a = fullName !== null && fullName !== void 0 ? fullName : typeExpression) !== null && _a !== void 0 ? _a : tagName).end;
                if (!comment) {
                    comment = parseTrailingTagComments(start, end, indent, indentText);
                }
                var typedefTag = factory.createJSDocTypedefTag(tagName, typeExpression, fullName, comment);
                return finishNode(typedefTag, start, end);
            }
            function parseJSDocTypeNameWithNamespace(nested) {
                var start = scanner.getTokenStart();
                if (!(0, ts_1.tokenIsIdentifierOrKeyword)(token())) {
                    return undefined;
                }
                var typeNameOrNamespaceName = parseJSDocIdentifierName();
                if (parseOptional(25 /* SyntaxKind.DotToken */)) {
                    var body = parseJSDocTypeNameWithNamespace(/*nested*/ true);
                    var jsDocNamespaceNode = factory.createModuleDeclaration(
                    /*modifiers*/ undefined, typeNameOrNamespaceName, body, nested ? 4 /* NodeFlags.NestedNamespace */ : undefined);
                    return finishNode(jsDocNamespaceNode, start);
                }
                if (nested) {
                    typeNameOrNamespaceName.flags |= 2048 /* NodeFlags.IdentifierIsInJSDocNamespace */;
                }
                return typeNameOrNamespaceName;
            }
            function parseCallbackTagParameters(indent) {
                var pos = getNodePos();
                var child;
                var parameters;
                while (child = tryParse(function () { return parseChildParameterOrPropertyTag(4 /* PropertyLikeParse.CallbackParameter */, indent); })) {
                    if (child.kind === 351 /* SyntaxKind.JSDocTemplateTag */) {
                        parseErrorAtRange(child.tagName, ts_1.Diagnostics.A_JSDoc_template_tag_may_not_follow_a_typedef_callback_or_overload_tag);
                        break;
                    }
                    parameters = (0, ts_1.append)(parameters, child);
                }
                return createNodeArray(parameters || [], pos);
            }
            function parseJSDocSignature(start, indent) {
                var parameters = parseCallbackTagParameters(indent);
                var returnTag = tryParse(function () {
                    if (parseOptionalJsdoc(60 /* SyntaxKind.AtToken */)) {
                        var tag = parseTag(indent);
                        if (tag && tag.kind === 348 /* SyntaxKind.JSDocReturnTag */) {
                            return tag;
                        }
                    }
                });
                return finishNode(factory.createJSDocSignature(/*typeParameters*/ undefined, parameters, returnTag), start);
            }
            function parseCallbackTag(start, tagName, indent, indentText) {
                var fullName = parseJSDocTypeNameWithNamespace();
                skipWhitespace();
                var comment = parseTagComments(indent);
                var typeExpression = parseJSDocSignature(start, indent);
                if (!comment) {
                    comment = parseTrailingTagComments(start, getNodePos(), indent, indentText);
                }
                var end = comment !== undefined ? getNodePos() : typeExpression.end;
                return finishNode(factory.createJSDocCallbackTag(tagName, typeExpression, fullName, comment), start, end);
            }
            function parseOverloadTag(start, tagName, indent, indentText) {
                skipWhitespace();
                var comment = parseTagComments(indent);
                var typeExpression = parseJSDocSignature(start, indent);
                if (!comment) {
                    comment = parseTrailingTagComments(start, getNodePos(), indent, indentText);
                }
                var end = comment !== undefined ? getNodePos() : typeExpression.end;
                return finishNode(factory.createJSDocOverloadTag(tagName, typeExpression, comment), start, end);
            }
            function escapedTextsEqual(a, b) {
                while (!(0, ts_1.isIdentifier)(a) || !(0, ts_1.isIdentifier)(b)) {
                    if (!(0, ts_1.isIdentifier)(a) && !(0, ts_1.isIdentifier)(b) && a.right.escapedText === b.right.escapedText) {
                        a = a.left;
                        b = b.left;
                    }
                    else {
                        return false;
                    }
                }
                return a.escapedText === b.escapedText;
            }
            function parseChildPropertyTag(indent) {
                return parseChildParameterOrPropertyTag(1 /* PropertyLikeParse.Property */, indent);
            }
            function parseChildParameterOrPropertyTag(target, indent, name) {
                var canParseTag = true;
                var seenAsterisk = false;
                while (true) {
                    switch (nextTokenJSDoc()) {
                        case 60 /* SyntaxKind.AtToken */:
                            if (canParseTag) {
                                var child = tryParseChildTag(target, indent);
                                if (child && (child.kind === 347 /* SyntaxKind.JSDocParameterTag */ || child.kind === 354 /* SyntaxKind.JSDocPropertyTag */) &&
                                    target !== 4 /* PropertyLikeParse.CallbackParameter */ &&
                                    name && ((0, ts_1.isIdentifier)(child.name) || !escapedTextsEqual(name, child.name.left))) {
                                    return false;
                                }
                                return child;
                            }
                            seenAsterisk = false;
                            break;
                        case 4 /* SyntaxKind.NewLineTrivia */:
                            canParseTag = true;
                            seenAsterisk = false;
                            break;
                        case 42 /* SyntaxKind.AsteriskToken */:
                            if (seenAsterisk) {
                                canParseTag = false;
                            }
                            seenAsterisk = true;
                            break;
                        case 80 /* SyntaxKind.Identifier */:
                            canParseTag = false;
                            break;
                        case 1 /* SyntaxKind.EndOfFileToken */:
                            return false;
                    }
                }
            }
            function tryParseChildTag(target, indent) {
                ts_1.Debug.assert(token() === 60 /* SyntaxKind.AtToken */);
                var start = scanner.getTokenFullStart();
                nextTokenJSDoc();
                var tagName = parseJSDocIdentifierName();
                var indentText = skipWhitespaceOrAsterisk();
                var t;
                switch (tagName.escapedText) {
                    case "type":
                        return target === 1 /* PropertyLikeParse.Property */ && parseTypeTag(start, tagName);
                    case "prop":
                    case "property":
                        t = 1 /* PropertyLikeParse.Property */;
                        break;
                    case "arg":
                    case "argument":
                    case "param":
                        t = 2 /* PropertyLikeParse.Parameter */ | 4 /* PropertyLikeParse.CallbackParameter */;
                        break;
                    case "template":
                        return parseTemplateTag(start, tagName, indent, indentText);
                    default:
                        return false;
                }
                if (!(target & t)) {
                    return false;
                }
                return parseParameterOrPropertyTag(start, tagName, target, indent);
            }
            function parseTemplateTagTypeParameter() {
                var typeParameterPos = getNodePos();
                var isBracketed = parseOptionalJsdoc(23 /* SyntaxKind.OpenBracketToken */);
                if (isBracketed) {
                    skipWhitespace();
                }
                var name = parseJSDocIdentifierName(ts_1.Diagnostics.Unexpected_token_A_type_parameter_name_was_expected_without_curly_braces);
                var defaultType;
                if (isBracketed) {
                    skipWhitespace();
                    parseExpected(64 /* SyntaxKind.EqualsToken */);
                    defaultType = doInsideOfContext(8388608 /* NodeFlags.JSDoc */, parseJSDocType);
                    parseExpected(24 /* SyntaxKind.CloseBracketToken */);
                }
                if ((0, ts_1.nodeIsMissing)(name)) {
                    return undefined;
                }
                return finishNode(factory.createTypeParameterDeclaration(/*modifiers*/ undefined, name, /*constraint*/ undefined, defaultType), typeParameterPos);
            }
            function parseTemplateTagTypeParameters() {
                var pos = getNodePos();
                var typeParameters = [];
                do {
                    skipWhitespace();
                    var node = parseTemplateTagTypeParameter();
                    if (node !== undefined) {
                        typeParameters.push(node);
                    }
                    skipWhitespaceOrAsterisk();
                } while (parseOptionalJsdoc(28 /* SyntaxKind.CommaToken */));
                return createNodeArray(typeParameters, pos);
            }
            function parseTemplateTag(start, tagName, indent, indentText) {
                // The template tag looks like one of the following:
                //   @template T,U,V
                //   @template {Constraint} T
                //
                // According to the [closure docs](https://github.com/google/closure-compiler/wiki/Generic-Types#multiple-bounded-template-types):
                //   > Multiple bounded generics cannot be declared on the same line. For the sake of clarity, if multiple templates share the same
                //   > type bound they must be declared on separate lines.
                //
                // TODO: Determine whether we should enforce this in the checker.
                // TODO: Consider moving the `constraint` to the first type parameter as we could then remove `getEffectiveConstraintOfTypeParameter`.
                // TODO: Consider only parsing a single type parameter if there is a constraint.
                var constraint = token() === 19 /* SyntaxKind.OpenBraceToken */ ? parseJSDocTypeExpression() : undefined;
                var typeParameters = parseTemplateTagTypeParameters();
                return finishNode(factory.createJSDocTemplateTag(tagName, constraint, typeParameters, parseTrailingTagComments(start, getNodePos(), indent, indentText)), start);
            }
            function parseOptionalJsdoc(t) {
                if (token() === t) {
                    nextTokenJSDoc();
                    return true;
                }
                return false;
            }
            function parseJSDocEntityName() {
                var entity = parseJSDocIdentifierName();
                if (parseOptional(23 /* SyntaxKind.OpenBracketToken */)) {
                    parseExpected(24 /* SyntaxKind.CloseBracketToken */);
                    // Note that y[] is accepted as an entity name, but the postfix brackets are not saved for checking.
                    // Technically usejsdoc.org requires them for specifying a property of a type equivalent to Array<{ x: ...}>
                    // but it's not worth it to enforce that restriction.
                }
                while (parseOptional(25 /* SyntaxKind.DotToken */)) {
                    var name_6 = parseJSDocIdentifierName();
                    if (parseOptional(23 /* SyntaxKind.OpenBracketToken */)) {
                        parseExpected(24 /* SyntaxKind.CloseBracketToken */);
                    }
                    entity = createQualifiedName(entity, name_6);
                }
                return entity;
            }
            function parseJSDocIdentifierName(message) {
                if (!(0, ts_1.tokenIsIdentifierOrKeyword)(token())) {
                    return createMissingNode(80 /* SyntaxKind.Identifier */, /*reportAtCurrentPosition*/ !message, message || ts_1.Diagnostics.Identifier_expected);
                }
                identifierCount++;
                var start = scanner.getTokenStart();
                var end = scanner.getTokenEnd();
                var originalKeywordKind = token();
                var text = internIdentifier(scanner.getTokenValue());
                var result = finishNode(factoryCreateIdentifier(text, originalKeywordKind), start, end);
                nextTokenJSDoc();
                return result;
            }
        }
    })(JSDocParser = Parser.JSDocParser || (Parser.JSDocParser = {}));
})(Parser || (Parser = {}));
var IncrementalParser;
(function (IncrementalParser) {
    function updateSourceFile(sourceFile, newText, textChangeRange, aggressiveChecks) {
        aggressiveChecks = aggressiveChecks || ts_1.Debug.shouldAssert(2 /* AssertionLevel.Aggressive */);
        checkChangeRange(sourceFile, newText, textChangeRange, aggressiveChecks);
        if ((0, ts_1.textChangeRangeIsUnchanged)(textChangeRange)) {
            // if the text didn't change, then we can just return our current source file as-is.
            return sourceFile;
        }
        if (sourceFile.statements.length === 0) {
            // If we don't have any statements in the current source file, then there's no real
            // way to incrementally parse.  So just do a full parse instead.
            return Parser.parseSourceFile(sourceFile.fileName, newText, sourceFile.languageVersion, /*syntaxCursor*/ undefined, /*setParentNodes*/ true, sourceFile.scriptKind, sourceFile.setExternalModuleIndicator);
        }
        // Make sure we're not trying to incrementally update a source file more than once.  Once
        // we do an update the original source file is considered unusable from that point onwards.
        //
        // This is because we do incremental parsing in-place.  i.e. we take nodes from the old
        // tree and give them new positions and parents.  From that point on, trusting the old
        // tree at all is not possible as far too much of it may violate invariants.
        var incrementalSourceFile = sourceFile;
        ts_1.Debug.assert(!incrementalSourceFile.hasBeenIncrementallyParsed);
        incrementalSourceFile.hasBeenIncrementallyParsed = true;
        Parser.fixupParentReferences(incrementalSourceFile);
        var oldText = sourceFile.text;
        var syntaxCursor = createSyntaxCursor(sourceFile);
        // Make the actual change larger so that we know to reparse anything whose lookahead
        // might have intersected the change.
        var changeRange = extendToAffectedRange(sourceFile, textChangeRange);
        checkChangeRange(sourceFile, newText, changeRange, aggressiveChecks);
        // Ensure that extending the affected range only moved the start of the change range
        // earlier in the file.
        ts_1.Debug.assert(changeRange.span.start <= textChangeRange.span.start);
        ts_1.Debug.assert((0, ts_1.textSpanEnd)(changeRange.span) === (0, ts_1.textSpanEnd)(textChangeRange.span));
        ts_1.Debug.assert((0, ts_1.textSpanEnd)((0, ts_1.textChangeRangeNewSpan)(changeRange)) === (0, ts_1.textSpanEnd)((0, ts_1.textChangeRangeNewSpan)(textChangeRange)));
        // The is the amount the nodes after the edit range need to be adjusted.  It can be
        // positive (if the edit added characters), negative (if the edit deleted characters)
        // or zero (if this was a pure overwrite with nothing added/removed).
        var delta = (0, ts_1.textChangeRangeNewSpan)(changeRange).length - changeRange.span.length;
        // If we added or removed characters during the edit, then we need to go and adjust all
        // the nodes after the edit.  Those nodes may move forward (if we inserted chars) or they
        // may move backward (if we deleted chars).
        //
        // Doing this helps us out in two ways.  First, it means that any nodes/tokens we want
        // to reuse are already at the appropriate position in the new text.  That way when we
        // reuse them, we don't have to figure out if they need to be adjusted.  Second, it makes
        // it very easy to determine if we can reuse a node.  If the node's position is at where
        // we are in the text, then we can reuse it.  Otherwise we can't.  If the node's position
        // is ahead of us, then we'll need to rescan tokens.  If the node's position is behind
        // us, then we'll need to skip it or crumble it as appropriate
        //
        // We will also adjust the positions of nodes that intersect the change range as well.
        // By doing this, we ensure that all the positions in the old tree are consistent, not
        // just the positions of nodes entirely before/after the change range.  By being
        // consistent, we can then easily map from positions to nodes in the old tree easily.
        //
        // Also, mark any syntax elements that intersect the changed span.  We know, up front,
        // that we cannot reuse these elements.
        updateTokenPositionsAndMarkElements(incrementalSourceFile, changeRange.span.start, (0, ts_1.textSpanEnd)(changeRange.span), (0, ts_1.textSpanEnd)((0, ts_1.textChangeRangeNewSpan)(changeRange)), delta, oldText, newText, aggressiveChecks);
        // Now that we've set up our internal incremental state just proceed and parse the
        // source file in the normal fashion.  When possible the parser will retrieve and
        // reuse nodes from the old tree.
        //
        // Note: passing in 'true' for setNodeParents is very important.  When incrementally
        // parsing, we will be reusing nodes from the old tree, and placing it into new
        // parents.  If we don't set the parents now, we'll end up with an observably
        // inconsistent tree.  Setting the parents on the new tree should be very fast.  We
        // will immediately bail out of walking any subtrees when we can see that their parents
        // are already correct.
        var result = Parser.parseSourceFile(sourceFile.fileName, newText, sourceFile.languageVersion, syntaxCursor, /*setParentNodes*/ true, sourceFile.scriptKind, sourceFile.setExternalModuleIndicator);
        result.commentDirectives = getNewCommentDirectives(sourceFile.commentDirectives, result.commentDirectives, changeRange.span.start, (0, ts_1.textSpanEnd)(changeRange.span), delta, oldText, newText, aggressiveChecks);
        result.impliedNodeFormat = sourceFile.impliedNodeFormat;
        return result;
    }
    IncrementalParser.updateSourceFile = updateSourceFile;
    function getNewCommentDirectives(oldDirectives, newDirectives, changeStart, changeRangeOldEnd, delta, oldText, newText, aggressiveChecks) {
        if (!oldDirectives)
            return newDirectives;
        var commentDirectives;
        var addedNewlyScannedDirectives = false;
        for (var _i = 0, oldDirectives_1 = oldDirectives; _i < oldDirectives_1.length; _i++) {
            var directive = oldDirectives_1[_i];
            var range = directive.range, type = directive.type;
            // Range before the change
            if (range.end < changeStart) {
                commentDirectives = (0, ts_1.append)(commentDirectives, directive);
            }
            else if (range.pos > changeRangeOldEnd) {
                addNewlyScannedDirectives();
                // Node is entirely past the change range.  We need to move both its pos and
                // end, forward or backward appropriately.
                var updatedDirective = {
                    range: { pos: range.pos + delta, end: range.end + delta },
                    type: type
                };
                commentDirectives = (0, ts_1.append)(commentDirectives, updatedDirective);
                if (aggressiveChecks) {
                    ts_1.Debug.assert(oldText.substring(range.pos, range.end) === newText.substring(updatedDirective.range.pos, updatedDirective.range.end));
                }
            }
            // Ignore ranges that fall in change range
        }
        addNewlyScannedDirectives();
        return commentDirectives;
        function addNewlyScannedDirectives() {
            if (addedNewlyScannedDirectives)
                return;
            addedNewlyScannedDirectives = true;
            if (!commentDirectives) {
                commentDirectives = newDirectives;
            }
            else if (newDirectives) {
                commentDirectives.push.apply(commentDirectives, newDirectives);
            }
        }
    }
    function moveElementEntirelyPastChangeRange(element, isArray, delta, oldText, newText, aggressiveChecks) {
        if (isArray) {
            visitArray(element);
        }
        else {
            visitNode(element);
        }
        return;
        function visitNode(node) {
            var text = "";
            if (aggressiveChecks && shouldCheckNode(node)) {
                text = oldText.substring(node.pos, node.end);
            }
            // Ditch any existing LS children we may have created.  This way we can avoid
            // moving them forward.
            if (node._children) {
                node._children = undefined;
            }
            (0, ts_1.setTextRangePosEnd)(node, node.pos + delta, node.end + delta);
            if (aggressiveChecks && shouldCheckNode(node)) {
                ts_1.Debug.assert(text === newText.substring(node.pos, node.end));
            }
            forEachChild(node, visitNode, visitArray);
            if ((0, ts_1.hasJSDocNodes)(node)) {
                for (var _i = 0, _a = node.jsDoc; _i < _a.length; _i++) {
                    var jsDocComment = _a[_i];
                    visitNode(jsDocComment);
                }
            }
            checkNodePositions(node, aggressiveChecks);
        }
        function visitArray(array) {
            array._children = undefined;
            (0, ts_1.setTextRangePosEnd)(array, array.pos + delta, array.end + delta);
            for (var _i = 0, array_1 = array; _i < array_1.length; _i++) {
                var node = array_1[_i];
                visitNode(node);
            }
        }
    }
    function shouldCheckNode(node) {
        switch (node.kind) {
            case 11 /* SyntaxKind.StringLiteral */:
            case 9 /* SyntaxKind.NumericLiteral */:
            case 80 /* SyntaxKind.Identifier */:
                return true;
        }
        return false;
    }
    function adjustIntersectingElement(element, changeStart, changeRangeOldEnd, changeRangeNewEnd, delta) {
        ts_1.Debug.assert(element.end >= changeStart, "Adjusting an element that was entirely before the change range");
        ts_1.Debug.assert(element.pos <= changeRangeOldEnd, "Adjusting an element that was entirely after the change range");
        ts_1.Debug.assert(element.pos <= element.end);
        // We have an element that intersects the change range in some way.  It may have its
        // start, or its end (or both) in the changed range.  We want to adjust any part
        // that intersects such that the final tree is in a consistent state.  i.e. all
        // children have spans within the span of their parent, and all siblings are ordered
        // properly.
        // We may need to update both the 'pos' and the 'end' of the element.
        // If the 'pos' is before the start of the change, then we don't need to touch it.
        // If it isn't, then the 'pos' must be inside the change.  How we update it will
        // depend if delta is positive or negative. If delta is positive then we have
        // something like:
        //
        //  -------------------AAA-----------------
        //  -------------------BBBCCCCCCC-----------------
        //
        // In this case, we consider any node that started in the change range to still be
        // starting at the same position.
        //
        // however, if the delta is negative, then we instead have something like this:
        //
        //  -------------------XXXYYYYYYY-----------------
        //  -------------------ZZZ-----------------
        //
        // In this case, any element that started in the 'X' range will keep its position.
        // However any element that started after that will have their pos adjusted to be
        // at the end of the new range.  i.e. any node that started in the 'Y' range will
        // be adjusted to have their start at the end of the 'Z' range.
        //
        // The element will keep its position if possible.  Or Move backward to the new-end
        // if it's in the 'Y' range.
        var pos = Math.min(element.pos, changeRangeNewEnd);
        // If the 'end' is after the change range, then we always adjust it by the delta
        // amount.  However, if the end is in the change range, then how we adjust it
        // will depend on if delta is positive or negative.  If delta is positive then we
        // have something like:
        //
        //  -------------------AAA-----------------
        //  -------------------BBBCCCCCCC-----------------
        //
        // In this case, we consider any node that ended inside the change range to keep its
        // end position.
        //
        // however, if the delta is negative, then we instead have something like this:
        //
        //  -------------------XXXYYYYYYY-----------------
        //  -------------------ZZZ-----------------
        //
        // In this case, any element that ended in the 'X' range will keep its position.
        // However any element that ended after that will have their pos adjusted to be
        // at the end of the new range.  i.e. any node that ended in the 'Y' range will
        // be adjusted to have their end at the end of the 'Z' range.
        var end = element.end >= changeRangeOldEnd ?
            // Element ends after the change range.  Always adjust the end pos.
            element.end + delta :
            // Element ends in the change range.  The element will keep its position if
            // possible. Or Move backward to the new-end if it's in the 'Y' range.
            Math.min(element.end, changeRangeNewEnd);
        ts_1.Debug.assert(pos <= end);
        if (element.parent) {
            ts_1.Debug.assertGreaterThanOrEqual(pos, element.parent.pos);
            ts_1.Debug.assertLessThanOrEqual(end, element.parent.end);
        }
        (0, ts_1.setTextRangePosEnd)(element, pos, end);
    }
    function checkNodePositions(node, aggressiveChecks) {
        if (aggressiveChecks) {
            var pos_2 = node.pos;
            var visitNode_1 = function (child) {
                ts_1.Debug.assert(child.pos >= pos_2);
                pos_2 = child.end;
            };
            if ((0, ts_1.hasJSDocNodes)(node)) {
                for (var _i = 0, _a = node.jsDoc; _i < _a.length; _i++) {
                    var jsDocComment = _a[_i];
                    visitNode_1(jsDocComment);
                }
            }
            forEachChild(node, visitNode_1);
            ts_1.Debug.assert(pos_2 <= node.end);
        }
    }
    function updateTokenPositionsAndMarkElements(sourceFile, changeStart, changeRangeOldEnd, changeRangeNewEnd, delta, oldText, newText, aggressiveChecks) {
        visitNode(sourceFile);
        return;
        function visitNode(child) {
            ts_1.Debug.assert(child.pos <= child.end);
            if (child.pos > changeRangeOldEnd) {
                // Node is entirely past the change range.  We need to move both its pos and
                // end, forward or backward appropriately.
                moveElementEntirelyPastChangeRange(child, /*isArray*/ false, delta, oldText, newText, aggressiveChecks);
                return;
            }
            // Check if the element intersects the change range.  If it does, then it is not
            // reusable.  Also, we'll need to recurse to see what constituent portions we may
            // be able to use.
            var fullEnd = child.end;
            if (fullEnd >= changeStart) {
                child.intersectsChange = true;
                child._children = undefined;
                // Adjust the pos or end (or both) of the intersecting element accordingly.
                adjustIntersectingElement(child, changeStart, changeRangeOldEnd, changeRangeNewEnd, delta);
                forEachChild(child, visitNode, visitArray);
                if ((0, ts_1.hasJSDocNodes)(child)) {
                    for (var _i = 0, _a = child.jsDoc; _i < _a.length; _i++) {
                        var jsDocComment = _a[_i];
                        visitNode(jsDocComment);
                    }
                }
                checkNodePositions(child, aggressiveChecks);
                return;
            }
            // Otherwise, the node is entirely before the change range.  No need to do anything with it.
            ts_1.Debug.assert(fullEnd < changeStart);
        }
        function visitArray(array) {
            ts_1.Debug.assert(array.pos <= array.end);
            if (array.pos > changeRangeOldEnd) {
                // Array is entirely after the change range.  We need to move it, and move any of
                // its children.
                moveElementEntirelyPastChangeRange(array, /*isArray*/ true, delta, oldText, newText, aggressiveChecks);
                return;
            }
            // Check if the element intersects the change range.  If it does, then it is not
            // reusable.  Also, we'll need to recurse to see what constituent portions we may
            // be able to use.
            var fullEnd = array.end;
            if (fullEnd >= changeStart) {
                array.intersectsChange = true;
                array._children = undefined;
                // Adjust the pos or end (or both) of the intersecting array accordingly.
                adjustIntersectingElement(array, changeStart, changeRangeOldEnd, changeRangeNewEnd, delta);
                for (var _i = 0, array_2 = array; _i < array_2.length; _i++) {
                    var node = array_2[_i];
                    visitNode(node);
                }
                return;
            }
            // Otherwise, the array is entirely before the change range.  No need to do anything with it.
            ts_1.Debug.assert(fullEnd < changeStart);
        }
    }
    function extendToAffectedRange(sourceFile, changeRange) {
        // Consider the following code:
        //      void foo() { /; }
        //
        // If the text changes with an insertion of / just before the semicolon then we end up with:
        //      void foo() { //; }
        //
        // If we were to just use the changeRange a is, then we would not rescan the { token
        // (as it does not intersect the actual original change range).  Because an edit may
        // change the token touching it, we actually need to look back *at least* one token so
        // that the prior token sees that change.
        var maxLookahead = 1;
        var start = changeRange.span.start;
        // the first iteration aligns us with the change start. subsequent iteration move us to
        // the left by maxLookahead tokens.  We only need to do this as long as we're not at the
        // start of the tree.
        for (var i = 0; start > 0 && i <= maxLookahead; i++) {
            var nearestNode = findNearestNodeStartingBeforeOrAtPosition(sourceFile, start);
            ts_1.Debug.assert(nearestNode.pos <= start);
            var position = nearestNode.pos;
            start = Math.max(0, position - 1);
        }
        var finalSpan = (0, ts_1.createTextSpanFromBounds)(start, (0, ts_1.textSpanEnd)(changeRange.span));
        var finalLength = changeRange.newLength + (changeRange.span.start - start);
        return (0, ts_1.createTextChangeRange)(finalSpan, finalLength);
    }
    function findNearestNodeStartingBeforeOrAtPosition(sourceFile, position) {
        var bestResult = sourceFile;
        var lastNodeEntirelyBeforePosition;
        forEachChild(sourceFile, visit);
        if (lastNodeEntirelyBeforePosition) {
            var lastChildOfLastEntireNodeBeforePosition = getLastDescendant(lastNodeEntirelyBeforePosition);
            if (lastChildOfLastEntireNodeBeforePosition.pos > bestResult.pos) {
                bestResult = lastChildOfLastEntireNodeBeforePosition;
            }
        }
        return bestResult;
        function getLastDescendant(node) {
            while (true) {
                var lastChild = (0, ts_1.getLastChild)(node);
                if (lastChild) {
                    node = lastChild;
                }
                else {
                    return node;
                }
            }
        }
        function visit(child) {
            if ((0, ts_1.nodeIsMissing)(child)) {
                // Missing nodes are effectively invisible to us.  We never even consider them
                // When trying to find the nearest node before us.
                return;
            }
            // If the child intersects this position, then this node is currently the nearest
            // node that starts before the position.
            if (child.pos <= position) {
                if (child.pos >= bestResult.pos) {
                    // This node starts before the position, and is closer to the position than
                    // the previous best node we found.  It is now the new best node.
                    bestResult = child;
                }
                // Now, the node may overlap the position, or it may end entirely before the
                // position.  If it overlaps with the position, then either it, or one of its
                // children must be the nearest node before the position.  So we can just
                // recurse into this child to see if we can find something better.
                if (position < child.end) {
                    // The nearest node is either this child, or one of the children inside
                    // of it.  We've already marked this child as the best so far.  Recurse
                    // in case one of the children is better.
                    forEachChild(child, visit);
                    // Once we look at the children of this node, then there's no need to
                    // continue any further.
                    return true;
                }
                else {
                    ts_1.Debug.assert(child.end <= position);
                    // The child ends entirely before this position.  Say you have the following
                    // (where $ is the position)
                    //
                    //      <complex expr 1> ? <complex expr 2> $ : <...> <...>
                    //
                    // We would want to find the nearest preceding node in "complex expr 2".
                    // To support that, we keep track of this node, and once we're done searching
                    // for a best node, we recurse down this node to see if we can find a good
                    // result in it.
                    //
                    // This approach allows us to quickly skip over nodes that are entirely
                    // before the position, while still allowing us to find any nodes in the
                    // last one that might be what we want.
                    lastNodeEntirelyBeforePosition = child;
                }
            }
            else {
                ts_1.Debug.assert(child.pos > position);
                // We're now at a node that is entirely past the position we're searching for.
                // This node (and all following nodes) could never contribute to the result,
                // so just skip them by returning 'true' here.
                return true;
            }
        }
    }
    function checkChangeRange(sourceFile, newText, textChangeRange, aggressiveChecks) {
        var oldText = sourceFile.text;
        if (textChangeRange) {
            ts_1.Debug.assert((oldText.length - textChangeRange.span.length + textChangeRange.newLength) === newText.length);
            if (aggressiveChecks || ts_1.Debug.shouldAssert(3 /* AssertionLevel.VeryAggressive */)) {
                var oldTextPrefix = oldText.substr(0, textChangeRange.span.start);
                var newTextPrefix = newText.substr(0, textChangeRange.span.start);
                ts_1.Debug.assert(oldTextPrefix === newTextPrefix);
                var oldTextSuffix = oldText.substring((0, ts_1.textSpanEnd)(textChangeRange.span), oldText.length);
                var newTextSuffix = newText.substring((0, ts_1.textSpanEnd)((0, ts_1.textChangeRangeNewSpan)(textChangeRange)), newText.length);
                ts_1.Debug.assert(oldTextSuffix === newTextSuffix);
            }
        }
    }
    function createSyntaxCursor(sourceFile) {
        var currentArray = sourceFile.statements;
        var currentArrayIndex = 0;
        ts_1.Debug.assert(currentArrayIndex < currentArray.length);
        var current = currentArray[currentArrayIndex];
        var lastQueriedPosition = -1 /* InvalidPosition.Value */;
        return {
            currentNode: function (position) {
                // Only compute the current node if the position is different than the last time
                // we were asked.  The parser commonly asks for the node at the same position
                // twice.  Once to know if can read an appropriate list element at a certain point,
                // and then to actually read and consume the node.
                if (position !== lastQueriedPosition) {
                    // Much of the time the parser will need the very next node in the array that
                    // we just returned a node from.So just simply check for that case and move
                    // forward in the array instead of searching for the node again.
                    if (current && current.end === position && currentArrayIndex < (currentArray.length - 1)) {
                        currentArrayIndex++;
                        current = currentArray[currentArrayIndex];
                    }
                    // If we don't have a node, or the node we have isn't in the right position,
                    // then try to find a viable node at the position requested.
                    if (!current || current.pos !== position) {
                        findHighestListElementThatStartsAtPosition(position);
                    }
                }
                // Cache this query so that we don't do any extra work if the parser calls back
                // into us.  Note: this is very common as the parser will make pairs of calls like
                // 'isListElement -> parseListElement'.  If we were unable to find a node when
                // called with 'isListElement', we don't want to redo the work when parseListElement
                // is called immediately after.
                lastQueriedPosition = position;
                // Either we don'd have a node, or we have a node at the position being asked for.
                ts_1.Debug.assert(!current || current.pos === position);
                return current;
            }
        };
        // Finds the highest element in the tree we can find that starts at the provided position.
        // The element must be a direct child of some node list in the tree.  This way after we
        // return it, we can easily return its next sibling in the list.
        function findHighestListElementThatStartsAtPosition(position) {
            // Clear out any cached state about the last node we found.
            currentArray = undefined;
            currentArrayIndex = -1 /* InvalidPosition.Value */;
            current = undefined;
            // Recurse into the source file to find the highest node at this position.
            forEachChild(sourceFile, visitNode, visitArray);
            return;
            function visitNode(node) {
                if (position >= node.pos && position < node.end) {
                    // Position was within this node.  Keep searching deeper to find the node.
                    forEachChild(node, visitNode, visitArray);
                    // don't proceed any further in the search.
                    return true;
                }
                // position wasn't in this node, have to keep searching.
                return false;
            }
            function visitArray(array) {
                if (position >= array.pos && position < array.end) {
                    // position was in this array.  Search through this array to see if we find a
                    // viable element.
                    for (var i = 0; i < array.length; i++) {
                        var child = array[i];
                        if (child) {
                            if (child.pos === position) {
                                // Found the right node.  We're done.
                                currentArray = array;
                                currentArrayIndex = i;
                                current = child;
                                return true;
                            }
                            else {
                                if (child.pos < position && position < child.end) {
                                    // Position in somewhere within this child.  Search in it and
                                    // stop searching in this array.
                                    forEachChild(child, visitNode, visitArray);
                                    return true;
                                }
                            }
                        }
                    }
                }
                // position wasn't in this array, have to keep searching.
                return false;
            }
        }
    }
    IncrementalParser.createSyntaxCursor = createSyntaxCursor;
})(IncrementalParser || (IncrementalParser = {}));
/** @internal */
function isDeclarationFileName(fileName) {
    return (0, ts_1.fileExtensionIsOneOf)(fileName, ts_1.supportedDeclarationExtensions) || ((0, ts_1.fileExtensionIs)(fileName, ".ts" /* Extension.Ts */) && (0, ts_1.stringContains)((0, ts_1.getBaseFileName)(fileName), ".d."));
}
exports.isDeclarationFileName = isDeclarationFileName;
function parseResolutionMode(mode, pos, end, reportDiagnostic) {
    if (!mode) {
        return undefined;
    }
    if (mode === "import") {
        return ts_1.ModuleKind.ESNext;
    }
    if (mode === "require") {
        return ts_1.ModuleKind.CommonJS;
    }
    reportDiagnostic(pos, end - pos, ts_1.Diagnostics.resolution_mode_should_be_either_require_or_import);
    return undefined;
}
/** @internal */
function processCommentPragmas(context, sourceText) {
    var pragmas = [];
    for (var _i = 0, _a = (0, ts_1.getLeadingCommentRanges)(sourceText, 0) || ts_1.emptyArray; _i < _a.length; _i++) {
        var range = _a[_i];
        var comment = sourceText.substring(range.pos, range.end);
        extractPragmas(pragmas, range, comment);
    }
    context.pragmas = new Map();
    for (var _b = 0, pragmas_1 = pragmas; _b < pragmas_1.length; _b++) {
        var pragma = pragmas_1[_b];
        if (context.pragmas.has(pragma.name)) {
            var currentValue = context.pragmas.get(pragma.name);
            if (currentValue instanceof Array) {
                currentValue.push(pragma.args);
            }
            else {
                context.pragmas.set(pragma.name, [currentValue, pragma.args]);
            }
            continue;
        }
        context.pragmas.set(pragma.name, pragma.args);
    }
}
exports.processCommentPragmas = processCommentPragmas;
/** @internal */
function processPragmasIntoFields(context, reportDiagnostic) {
    context.checkJsDirective = undefined;
    context.referencedFiles = [];
    context.typeReferenceDirectives = [];
    context.libReferenceDirectives = [];
    context.amdDependencies = [];
    context.hasNoDefaultLib = false;
    context.pragmas.forEach(function (entryOrList, key) {
        // TODO: The below should be strongly type-guarded and not need casts/explicit annotations, since entryOrList is related to
        // key and key is constrained to a union; but it's not (see GH#21483 for at least partial fix) :(
        switch (key) {
            case "reference": {
                var referencedFiles_1 = context.referencedFiles;
                var typeReferenceDirectives_1 = context.typeReferenceDirectives;
                var libReferenceDirectives_1 = context.libReferenceDirectives;
                (0, ts_1.forEach)((0, ts_1.toArray)(entryOrList), function (arg) {
                    var _a = arg.arguments, types = _a.types, lib = _a.lib, path = _a.path, res = _a["resolution-mode"];
                    if (arg.arguments["no-default-lib"]) {
                        context.hasNoDefaultLib = true;
                    }
                    else if (types) {
                        var parsed = parseResolutionMode(res, types.pos, types.end, reportDiagnostic);
                        typeReferenceDirectives_1.push(__assign({ pos: types.pos, end: types.end, fileName: types.value }, (parsed ? { resolutionMode: parsed } : {})));
                    }
                    else if (lib) {
                        libReferenceDirectives_1.push({ pos: lib.pos, end: lib.end, fileName: lib.value });
                    }
                    else if (path) {
                        referencedFiles_1.push({ pos: path.pos, end: path.end, fileName: path.value });
                    }
                    else {
                        reportDiagnostic(arg.range.pos, arg.range.end - arg.range.pos, ts_1.Diagnostics.Invalid_reference_directive_syntax);
                    }
                });
                break;
            }
            case "amd-dependency": {
                context.amdDependencies = (0, ts_1.map)((0, ts_1.toArray)(entryOrList), function (x) { return ({ name: x.arguments.name, path: x.arguments.path }); });
                break;
            }
            case "amd-module": {
                if (entryOrList instanceof Array) {
                    for (var _i = 0, entryOrList_1 = entryOrList; _i < entryOrList_1.length; _i++) {
                        var entry = entryOrList_1[_i];
                        if (context.moduleName) {
                            // TODO: It's probably fine to issue this diagnostic on all instances of the pragma
                            reportDiagnostic(entry.range.pos, entry.range.end - entry.range.pos, ts_1.Diagnostics.An_AMD_module_cannot_have_multiple_name_assignments);
                        }
                        context.moduleName = entry.arguments.name;
                    }
                }
                else {
                    context.moduleName = entryOrList.arguments.name;
                }
                break;
            }
            case "ts-nocheck":
            case "ts-check": {
                // _last_ of either nocheck or check in a file is the "winner"
                (0, ts_1.forEach)((0, ts_1.toArray)(entryOrList), function (entry) {
                    if (!context.checkJsDirective || entry.range.pos > context.checkJsDirective.pos) {
                        context.checkJsDirective = {
                            enabled: key === "ts-check",
                            end: entry.range.end,
                            pos: entry.range.pos
                        };
                    }
                });
                break;
            }
            case "jsx":
            case "jsxfrag":
            case "jsximportsource":
            case "jsxruntime":
                return; // Accessed directly
            default: ts_1.Debug.fail("Unhandled pragma kind"); // Can this be made into an assertNever in the future?
        }
    });
}
exports.processPragmasIntoFields = processPragmasIntoFields;
var namedArgRegExCache = new Map();
function getNamedArgRegEx(name) {
    if (namedArgRegExCache.has(name)) {
        return namedArgRegExCache.get(name);
    }
    var result = new RegExp("(\\s".concat(name, "\\s*=\\s*)(?:(?:'([^']*)')|(?:\"([^\"]*)\"))"), "im");
    namedArgRegExCache.set(name, result);
    return result;
}
var tripleSlashXMLCommentStartRegEx = /^\/\/\/\s*<(\S+)\s.*?\/>/im;
var singleLinePragmaRegEx = /^\/\/\/?\s*@(\S+)\s*(.*)\s*$/im;
function extractPragmas(pragmas, range, text) {
    var tripleSlash = range.kind === 2 /* SyntaxKind.SingleLineCommentTrivia */ && tripleSlashXMLCommentStartRegEx.exec(text);
    if (tripleSlash) {
        var name_7 = tripleSlash[1].toLowerCase(); // Technically unsafe cast, but we do it so the below check to make it safe typechecks
        var pragma = ts_1.commentPragmas[name_7];
        if (!pragma || !(pragma.kind & 1 /* PragmaKindFlags.TripleSlashXML */)) {
            return;
        }
        if (pragma.args) {
            var argument = {};
            for (var _i = 0, _a = pragma.args; _i < _a.length; _i++) {
                var arg = _a[_i];
                var matcher = getNamedArgRegEx(arg.name);
                var matchResult = matcher.exec(text);
                if (!matchResult && !arg.optional) {
                    return; // Missing required argument, don't parse
                }
                else if (matchResult) {
                    var value = matchResult[2] || matchResult[3];
                    if (arg.captureSpan) {
                        var startPos = range.pos + matchResult.index + matchResult[1].length + 1;
                        argument[arg.name] = {
                            value: value,
                            pos: startPos,
                            end: startPos + value.length
                        };
                    }
                    else {
                        argument[arg.name] = value;
                    }
                }
            }
            pragmas.push({ name: name_7, args: { arguments: argument, range: range } });
        }
        else {
            pragmas.push({ name: name_7, args: { arguments: {}, range: range } });
        }
        return;
    }
    var singleLine = range.kind === 2 /* SyntaxKind.SingleLineCommentTrivia */ && singleLinePragmaRegEx.exec(text);
    if (singleLine) {
        return addPragmaForMatch(pragmas, range, 2 /* PragmaKindFlags.SingleLine */, singleLine);
    }
    if (range.kind === 3 /* SyntaxKind.MultiLineCommentTrivia */) {
        var multiLinePragmaRegEx = /@(\S+)(\s+.*)?$/gim; // Defined inline since it uses the "g" flag, which keeps a persistent index (for iterating)
        var multiLineMatch = void 0;
        while (multiLineMatch = multiLinePragmaRegEx.exec(text)) {
            addPragmaForMatch(pragmas, range, 4 /* PragmaKindFlags.MultiLine */, multiLineMatch);
        }
    }
}
function addPragmaForMatch(pragmas, range, kind, match) {
    if (!match)
        return;
    var name = match[1].toLowerCase(); // Technically unsafe cast, but we do it so they below check to make it safe typechecks
    var pragma = ts_1.commentPragmas[name];
    if (!pragma || !(pragma.kind & kind)) {
        return;
    }
    var args = match[2]; // Split on spaces and match up positionally with definition
    var argument = getNamedPragmaArguments(pragma, args);
    if (argument === "fail")
        return; // Missing required argument, fail to parse it
    pragmas.push({ name: name, args: { arguments: argument, range: range } });
    return;
}
function getNamedPragmaArguments(pragma, text) {
    if (!text)
        return {};
    if (!pragma.args)
        return {};
    var args = (0, ts_1.trimString)(text).split(/\s+/);
    var argMap = {};
    for (var i = 0; i < pragma.args.length; i++) {
        var argument = pragma.args[i];
        if (!args[i] && !argument.optional) {
            return "fail";
        }
        if (argument.captureSpan) {
            return ts_1.Debug.fail("Capture spans not yet implemented for non-xml pragmas");
        }
        argMap[argument.name] = args[i];
    }
    return argMap;
}
/** @internal */
function tagNamesAreEquivalent(lhs, rhs) {
    if (lhs.kind !== rhs.kind) {
        return false;
    }
    if (lhs.kind === 80 /* SyntaxKind.Identifier */) {
        return lhs.escapedText === rhs.escapedText;
    }
    if (lhs.kind === 110 /* SyntaxKind.ThisKeyword */) {
        return true;
    }
    if (lhs.kind === 294 /* SyntaxKind.JsxNamespacedName */) {
        return lhs.namespace.escapedText === rhs.namespace.escapedText &&
            lhs.name.escapedText === rhs.name.escapedText;
    }
    // If we are at this statement then we must have PropertyAccessExpression and because tag name in Jsx element can only
    // take forms of JsxTagNameExpression which includes an identifier, "this" expression, or another propertyAccessExpression
    // it is safe to case the expression property as such. See parseJsxElementName for how we parse tag name in Jsx element
    return lhs.name.escapedText === rhs.name.escapedText &&
        tagNamesAreEquivalent(lhs.expression, rhs.expression);
}
exports.tagNamesAreEquivalent = tagNamesAreEquivalent;
