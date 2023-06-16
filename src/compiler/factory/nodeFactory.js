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
Object.defineProperty(exports, "__esModule", { value: true });
exports.setOriginalNode = exports.createSourceMapSource = exports.createInputFilesWithFileTexts = exports.createInputFilesWithFilePaths = exports.createInputFiles = exports.createUnparsedSourceFile = exports.factory = exports.getTransformFlagsSubtreeExclusions = exports.createNodeFactory = exports.addNodeFactoryPatcher = void 0;
var ts_1 = require("../_namespaces/ts");
var nextAutoGenerateId = 0;
var nodeFactoryPatchers = [];
/** @internal */
function addNodeFactoryPatcher(fn) {
    nodeFactoryPatchers.push(fn);
}
exports.addNodeFactoryPatcher = addNodeFactoryPatcher;
/**
 * Creates a `NodeFactory` that can be used to create and update a syntax tree.
 * @param flags Flags that control factory behavior.
 * @param baseFactory A `BaseNodeFactory` used to create the base `Node` objects.
 *
 * @internal
 */
function createNodeFactory(flags, baseFactory) {
    var update = flags & 8 /* NodeFactoryFlags.NoOriginalNode */ ? updateWithoutOriginal : updateWithOriginal;
    // Lazily load the parenthesizer, node converters, and some factory methods until they are used.
    var parenthesizerRules = (0, ts_1.memoize)(function () { return flags & 1 /* NodeFactoryFlags.NoParenthesizerRules */ ? ts_1.nullParenthesizerRules : (0, ts_1.createParenthesizerRules)(factory); });
    var converters = (0, ts_1.memoize)(function () { return flags & 2 /* NodeFactoryFlags.NoNodeConverters */ ? ts_1.nullNodeConverters : (0, ts_1.createNodeConverters)(factory); });
    // lazy initializaton of common operator factories
    var getBinaryCreateFunction = (0, ts_1.memoizeOne)(function (operator) { return function (left, right) { return createBinaryExpression(left, operator, right); }; });
    var getPrefixUnaryCreateFunction = (0, ts_1.memoizeOne)(function (operator) { return function (operand) { return createPrefixUnaryExpression(operator, operand); }; });
    var getPostfixUnaryCreateFunction = (0, ts_1.memoizeOne)(function (operator) { return function (operand) { return createPostfixUnaryExpression(operand, operator); }; });
    var getJSDocPrimaryTypeCreateFunction = (0, ts_1.memoizeOne)(function (kind) { return function () { return createJSDocPrimaryTypeWorker(kind); }; });
    var getJSDocUnaryTypeCreateFunction = (0, ts_1.memoizeOne)(function (kind) { return function (type) { return createJSDocUnaryTypeWorker(kind, type); }; });
    var getJSDocUnaryTypeUpdateFunction = (0, ts_1.memoizeOne)(function (kind) { return function (node, type) { return updateJSDocUnaryTypeWorker(kind, node, type); }; });
    var getJSDocPrePostfixUnaryTypeCreateFunction = (0, ts_1.memoizeOne)(function (kind) { return function (type, postfix) { return createJSDocPrePostfixUnaryTypeWorker(kind, type, postfix); }; });
    var getJSDocPrePostfixUnaryTypeUpdateFunction = (0, ts_1.memoizeOne)(function (kind) { return function (node, type) { return updateJSDocPrePostfixUnaryTypeWorker(kind, node, type); }; });
    var getJSDocSimpleTagCreateFunction = (0, ts_1.memoizeOne)(function (kind) { return function (tagName, comment) { return createJSDocSimpleTagWorker(kind, tagName, comment); }; });
    var getJSDocSimpleTagUpdateFunction = (0, ts_1.memoizeOne)(function (kind) { return function (node, tagName, comment) { return updateJSDocSimpleTagWorker(kind, node, tagName, comment); }; });
    var getJSDocTypeLikeTagCreateFunction = (0, ts_1.memoizeOne)(function (kind) { return function (tagName, typeExpression, comment) { return createJSDocTypeLikeTagWorker(kind, tagName, typeExpression, comment); }; });
    var getJSDocTypeLikeTagUpdateFunction = (0, ts_1.memoizeOne)(function (kind) { return function (node, tagName, typeExpression, comment) { return updateJSDocTypeLikeTagWorker(kind, node, tagName, typeExpression, comment); }; });
    var factory = {
        get parenthesizer() { return parenthesizerRules(); },
        get converters() { return converters(); },
        baseFactory: baseFactory,
        flags: flags,
        createNodeArray: createNodeArray,
        createNumericLiteral: createNumericLiteral,
        createBigIntLiteral: createBigIntLiteral,
        createStringLiteral: createStringLiteral,
        createStringLiteralFromNode: createStringLiteralFromNode,
        createRegularExpressionLiteral: createRegularExpressionLiteral,
        createLiteralLikeNode: createLiteralLikeNode,
        createIdentifier: createIdentifier,
        createTempVariable: createTempVariable,
        createLoopVariable: createLoopVariable,
        createUniqueName: createUniqueName,
        getGeneratedNameForNode: getGeneratedNameForNode,
        createPrivateIdentifier: createPrivateIdentifier,
        createUniquePrivateName: createUniquePrivateName,
        getGeneratedPrivateNameForNode: getGeneratedPrivateNameForNode,
        createToken: createToken,
        createSuper: createSuper,
        createThis: createThis,
        createNull: createNull,
        createTrue: createTrue,
        createFalse: createFalse,
        createModifier: createModifier,
        createModifiersFromModifierFlags: createModifiersFromModifierFlags,
        createQualifiedName: createQualifiedName,
        updateQualifiedName: updateQualifiedName,
        createComputedPropertyName: createComputedPropertyName,
        updateComputedPropertyName: updateComputedPropertyName,
        createTypeParameterDeclaration: createTypeParameterDeclaration,
        updateTypeParameterDeclaration: updateTypeParameterDeclaration,
        createParameterDeclaration: createParameterDeclaration,
        updateParameterDeclaration: updateParameterDeclaration,
        createDecorator: createDecorator,
        updateDecorator: updateDecorator,
        createPropertySignature: createPropertySignature,
        updatePropertySignature: updatePropertySignature,
        createPropertyDeclaration: createPropertyDeclaration,
        updatePropertyDeclaration: updatePropertyDeclaration,
        createMethodSignature: createMethodSignature,
        updateMethodSignature: updateMethodSignature,
        createMethodDeclaration: createMethodDeclaration,
        updateMethodDeclaration: updateMethodDeclaration,
        createConstructorDeclaration: createConstructorDeclaration,
        updateConstructorDeclaration: updateConstructorDeclaration,
        createGetAccessorDeclaration: createGetAccessorDeclaration,
        updateGetAccessorDeclaration: updateGetAccessorDeclaration,
        createSetAccessorDeclaration: createSetAccessorDeclaration,
        updateSetAccessorDeclaration: updateSetAccessorDeclaration,
        createCallSignature: createCallSignature,
        updateCallSignature: updateCallSignature,
        createConstructSignature: createConstructSignature,
        updateConstructSignature: updateConstructSignature,
        createIndexSignature: createIndexSignature,
        updateIndexSignature: updateIndexSignature,
        createClassStaticBlockDeclaration: createClassStaticBlockDeclaration,
        updateClassStaticBlockDeclaration: updateClassStaticBlockDeclaration,
        createTemplateLiteralTypeSpan: createTemplateLiteralTypeSpan,
        updateTemplateLiteralTypeSpan: updateTemplateLiteralTypeSpan,
        createKeywordTypeNode: createKeywordTypeNode,
        createTypePredicateNode: createTypePredicateNode,
        updateTypePredicateNode: updateTypePredicateNode,
        createTypeReferenceNode: createTypeReferenceNode,
        updateTypeReferenceNode: updateTypeReferenceNode,
        createFunctionTypeNode: createFunctionTypeNode,
        updateFunctionTypeNode: updateFunctionTypeNode,
        createConstructorTypeNode: createConstructorTypeNode,
        updateConstructorTypeNode: updateConstructorTypeNode,
        createTypeQueryNode: createTypeQueryNode,
        updateTypeQueryNode: updateTypeQueryNode,
        createTypeLiteralNode: createTypeLiteralNode,
        updateTypeLiteralNode: updateTypeLiteralNode,
        createArrayTypeNode: createArrayTypeNode,
        updateArrayTypeNode: updateArrayTypeNode,
        createTupleTypeNode: createTupleTypeNode,
        updateTupleTypeNode: updateTupleTypeNode,
        createNamedTupleMember: createNamedTupleMember,
        updateNamedTupleMember: updateNamedTupleMember,
        createOptionalTypeNode: createOptionalTypeNode,
        updateOptionalTypeNode: updateOptionalTypeNode,
        createRestTypeNode: createRestTypeNode,
        updateRestTypeNode: updateRestTypeNode,
        createUnionTypeNode: createUnionTypeNode,
        updateUnionTypeNode: updateUnionTypeNode,
        createIntersectionTypeNode: createIntersectionTypeNode,
        updateIntersectionTypeNode: updateIntersectionTypeNode,
        createConditionalTypeNode: createConditionalTypeNode,
        updateConditionalTypeNode: updateConditionalTypeNode,
        createInferTypeNode: createInferTypeNode,
        updateInferTypeNode: updateInferTypeNode,
        createImportTypeNode: createImportTypeNode,
        updateImportTypeNode: updateImportTypeNode,
        createParenthesizedType: createParenthesizedType,
        updateParenthesizedType: updateParenthesizedType,
        createThisTypeNode: createThisTypeNode,
        createTypeOperatorNode: createTypeOperatorNode,
        updateTypeOperatorNode: updateTypeOperatorNode,
        createIndexedAccessTypeNode: createIndexedAccessTypeNode,
        updateIndexedAccessTypeNode: updateIndexedAccessTypeNode,
        createMappedTypeNode: createMappedTypeNode,
        updateMappedTypeNode: updateMappedTypeNode,
        createLiteralTypeNode: createLiteralTypeNode,
        updateLiteralTypeNode: updateLiteralTypeNode,
        createTemplateLiteralType: createTemplateLiteralType,
        updateTemplateLiteralType: updateTemplateLiteralType,
        createObjectBindingPattern: createObjectBindingPattern,
        updateObjectBindingPattern: updateObjectBindingPattern,
        createArrayBindingPattern: createArrayBindingPattern,
        updateArrayBindingPattern: updateArrayBindingPattern,
        createBindingElement: createBindingElement,
        updateBindingElement: updateBindingElement,
        createArrayLiteralExpression: createArrayLiteralExpression,
        updateArrayLiteralExpression: updateArrayLiteralExpression,
        createObjectLiteralExpression: createObjectLiteralExpression,
        updateObjectLiteralExpression: updateObjectLiteralExpression,
        createPropertyAccessExpression: flags & 4 /* NodeFactoryFlags.NoIndentationOnFreshPropertyAccess */ ?
            function (expression, name) { return (0, ts_1.setEmitFlags)(createPropertyAccessExpression(expression, name), 262144 /* EmitFlags.NoIndentation */); } :
            createPropertyAccessExpression,
        updatePropertyAccessExpression: updatePropertyAccessExpression,
        createPropertyAccessChain: flags & 4 /* NodeFactoryFlags.NoIndentationOnFreshPropertyAccess */ ?
            function (expression, questionDotToken, name) { return (0, ts_1.setEmitFlags)(createPropertyAccessChain(expression, questionDotToken, name), 262144 /* EmitFlags.NoIndentation */); } :
            createPropertyAccessChain,
        updatePropertyAccessChain: updatePropertyAccessChain,
        createElementAccessExpression: createElementAccessExpression,
        updateElementAccessExpression: updateElementAccessExpression,
        createElementAccessChain: createElementAccessChain,
        updateElementAccessChain: updateElementAccessChain,
        createCallExpression: createCallExpression,
        updateCallExpression: updateCallExpression,
        createCallChain: createCallChain,
        updateCallChain: updateCallChain,
        createNewExpression: createNewExpression,
        updateNewExpression: updateNewExpression,
        createTaggedTemplateExpression: createTaggedTemplateExpression,
        updateTaggedTemplateExpression: updateTaggedTemplateExpression,
        createTypeAssertion: createTypeAssertion,
        updateTypeAssertion: updateTypeAssertion,
        createParenthesizedExpression: createParenthesizedExpression,
        updateParenthesizedExpression: updateParenthesizedExpression,
        createFunctionExpression: createFunctionExpression,
        updateFunctionExpression: updateFunctionExpression,
        createArrowFunction: createArrowFunction,
        updateArrowFunction: updateArrowFunction,
        createDeleteExpression: createDeleteExpression,
        updateDeleteExpression: updateDeleteExpression,
        createTypeOfExpression: createTypeOfExpression,
        updateTypeOfExpression: updateTypeOfExpression,
        createVoidExpression: createVoidExpression,
        updateVoidExpression: updateVoidExpression,
        createAwaitExpression: createAwaitExpression,
        updateAwaitExpression: updateAwaitExpression,
        createPrefixUnaryExpression: createPrefixUnaryExpression,
        updatePrefixUnaryExpression: updatePrefixUnaryExpression,
        createPostfixUnaryExpression: createPostfixUnaryExpression,
        updatePostfixUnaryExpression: updatePostfixUnaryExpression,
        createBinaryExpression: createBinaryExpression,
        updateBinaryExpression: updateBinaryExpression,
        createConditionalExpression: createConditionalExpression,
        updateConditionalExpression: updateConditionalExpression,
        createTemplateExpression: createTemplateExpression,
        updateTemplateExpression: updateTemplateExpression,
        createTemplateHead: createTemplateHead,
        createTemplateMiddle: createTemplateMiddle,
        createTemplateTail: createTemplateTail,
        createNoSubstitutionTemplateLiteral: createNoSubstitutionTemplateLiteral,
        createTemplateLiteralLikeNode: createTemplateLiteralLikeNode,
        createYieldExpression: createYieldExpression,
        updateYieldExpression: updateYieldExpression,
        createSpreadElement: createSpreadElement,
        updateSpreadElement: updateSpreadElement,
        createClassExpression: createClassExpression,
        updateClassExpression: updateClassExpression,
        createOmittedExpression: createOmittedExpression,
        createExpressionWithTypeArguments: createExpressionWithTypeArguments,
        updateExpressionWithTypeArguments: updateExpressionWithTypeArguments,
        createAsExpression: createAsExpression,
        updateAsExpression: updateAsExpression,
        createNonNullExpression: createNonNullExpression,
        updateNonNullExpression: updateNonNullExpression,
        createSatisfiesExpression: createSatisfiesExpression,
        updateSatisfiesExpression: updateSatisfiesExpression,
        createNonNullChain: createNonNullChain,
        updateNonNullChain: updateNonNullChain,
        createMetaProperty: createMetaProperty,
        updateMetaProperty: updateMetaProperty,
        createTemplateSpan: createTemplateSpan,
        updateTemplateSpan: updateTemplateSpan,
        createSemicolonClassElement: createSemicolonClassElement,
        createBlock: createBlock,
        updateBlock: updateBlock,
        createVariableStatement: createVariableStatement,
        updateVariableStatement: updateVariableStatement,
        createEmptyStatement: createEmptyStatement,
        createExpressionStatement: createExpressionStatement,
        updateExpressionStatement: updateExpressionStatement,
        createIfStatement: createIfStatement,
        updateIfStatement: updateIfStatement,
        createDoStatement: createDoStatement,
        updateDoStatement: updateDoStatement,
        createWhileStatement: createWhileStatement,
        updateWhileStatement: updateWhileStatement,
        createForStatement: createForStatement,
        updateForStatement: updateForStatement,
        createForInStatement: createForInStatement,
        updateForInStatement: updateForInStatement,
        createForOfStatement: createForOfStatement,
        updateForOfStatement: updateForOfStatement,
        createContinueStatement: createContinueStatement,
        updateContinueStatement: updateContinueStatement,
        createBreakStatement: createBreakStatement,
        updateBreakStatement: updateBreakStatement,
        createReturnStatement: createReturnStatement,
        updateReturnStatement: updateReturnStatement,
        createWithStatement: createWithStatement,
        updateWithStatement: updateWithStatement,
        createSwitchStatement: createSwitchStatement,
        updateSwitchStatement: updateSwitchStatement,
        createLabeledStatement: createLabeledStatement,
        updateLabeledStatement: updateLabeledStatement,
        createThrowStatement: createThrowStatement,
        updateThrowStatement: updateThrowStatement,
        createTryStatement: createTryStatement,
        updateTryStatement: updateTryStatement,
        createDebuggerStatement: createDebuggerStatement,
        createVariableDeclaration: createVariableDeclaration,
        updateVariableDeclaration: updateVariableDeclaration,
        createVariableDeclarationList: createVariableDeclarationList,
        updateVariableDeclarationList: updateVariableDeclarationList,
        createFunctionDeclaration: createFunctionDeclaration,
        updateFunctionDeclaration: updateFunctionDeclaration,
        createClassDeclaration: createClassDeclaration,
        updateClassDeclaration: updateClassDeclaration,
        createInterfaceDeclaration: createInterfaceDeclaration,
        updateInterfaceDeclaration: updateInterfaceDeclaration,
        createTypeAliasDeclaration: createTypeAliasDeclaration,
        updateTypeAliasDeclaration: updateTypeAliasDeclaration,
        createEnumDeclaration: createEnumDeclaration,
        updateEnumDeclaration: updateEnumDeclaration,
        createModuleDeclaration: createModuleDeclaration,
        updateModuleDeclaration: updateModuleDeclaration,
        createModuleBlock: createModuleBlock,
        updateModuleBlock: updateModuleBlock,
        createCaseBlock: createCaseBlock,
        updateCaseBlock: updateCaseBlock,
        createNamespaceExportDeclaration: createNamespaceExportDeclaration,
        updateNamespaceExportDeclaration: updateNamespaceExportDeclaration,
        createImportEqualsDeclaration: createImportEqualsDeclaration,
        updateImportEqualsDeclaration: updateImportEqualsDeclaration,
        createImportDeclaration: createImportDeclaration,
        updateImportDeclaration: updateImportDeclaration,
        createImportClause: createImportClause,
        updateImportClause: updateImportClause,
        createAssertClause: createAssertClause,
        updateAssertClause: updateAssertClause,
        createAssertEntry: createAssertEntry,
        updateAssertEntry: updateAssertEntry,
        createImportTypeAssertionContainer: createImportTypeAssertionContainer,
        updateImportTypeAssertionContainer: updateImportTypeAssertionContainer,
        createNamespaceImport: createNamespaceImport,
        updateNamespaceImport: updateNamespaceImport,
        createNamespaceExport: createNamespaceExport,
        updateNamespaceExport: updateNamespaceExport,
        createNamedImports: createNamedImports,
        updateNamedImports: updateNamedImports,
        createImportSpecifier: createImportSpecifier,
        updateImportSpecifier: updateImportSpecifier,
        createExportAssignment: createExportAssignment,
        updateExportAssignment: updateExportAssignment,
        createExportDeclaration: createExportDeclaration,
        updateExportDeclaration: updateExportDeclaration,
        createNamedExports: createNamedExports,
        updateNamedExports: updateNamedExports,
        createExportSpecifier: createExportSpecifier,
        updateExportSpecifier: updateExportSpecifier,
        createMissingDeclaration: createMissingDeclaration,
        createExternalModuleReference: createExternalModuleReference,
        updateExternalModuleReference: updateExternalModuleReference,
        // lazily load factory members for JSDoc types with similar structure
        get createJSDocAllType() { return getJSDocPrimaryTypeCreateFunction(318 /* SyntaxKind.JSDocAllType */); },
        get createJSDocUnknownType() { return getJSDocPrimaryTypeCreateFunction(319 /* SyntaxKind.JSDocUnknownType */); },
        get createJSDocNonNullableType() { return getJSDocPrePostfixUnaryTypeCreateFunction(321 /* SyntaxKind.JSDocNonNullableType */); },
        get updateJSDocNonNullableType() { return getJSDocPrePostfixUnaryTypeUpdateFunction(321 /* SyntaxKind.JSDocNonNullableType */); },
        get createJSDocNullableType() { return getJSDocPrePostfixUnaryTypeCreateFunction(320 /* SyntaxKind.JSDocNullableType */); },
        get updateJSDocNullableType() { return getJSDocPrePostfixUnaryTypeUpdateFunction(320 /* SyntaxKind.JSDocNullableType */); },
        get createJSDocOptionalType() { return getJSDocUnaryTypeCreateFunction(322 /* SyntaxKind.JSDocOptionalType */); },
        get updateJSDocOptionalType() { return getJSDocUnaryTypeUpdateFunction(322 /* SyntaxKind.JSDocOptionalType */); },
        get createJSDocVariadicType() { return getJSDocUnaryTypeCreateFunction(324 /* SyntaxKind.JSDocVariadicType */); },
        get updateJSDocVariadicType() { return getJSDocUnaryTypeUpdateFunction(324 /* SyntaxKind.JSDocVariadicType */); },
        get createJSDocNamepathType() { return getJSDocUnaryTypeCreateFunction(325 /* SyntaxKind.JSDocNamepathType */); },
        get updateJSDocNamepathType() { return getJSDocUnaryTypeUpdateFunction(325 /* SyntaxKind.JSDocNamepathType */); },
        createJSDocFunctionType: createJSDocFunctionType,
        updateJSDocFunctionType: updateJSDocFunctionType,
        createJSDocTypeLiteral: createJSDocTypeLiteral,
        updateJSDocTypeLiteral: updateJSDocTypeLiteral,
        createJSDocTypeExpression: createJSDocTypeExpression,
        updateJSDocTypeExpression: updateJSDocTypeExpression,
        createJSDocSignature: createJSDocSignature,
        updateJSDocSignature: updateJSDocSignature,
        createJSDocTemplateTag: createJSDocTemplateTag,
        updateJSDocTemplateTag: updateJSDocTemplateTag,
        createJSDocTypedefTag: createJSDocTypedefTag,
        updateJSDocTypedefTag: updateJSDocTypedefTag,
        createJSDocParameterTag: createJSDocParameterTag,
        updateJSDocParameterTag: updateJSDocParameterTag,
        createJSDocPropertyTag: createJSDocPropertyTag,
        updateJSDocPropertyTag: updateJSDocPropertyTag,
        createJSDocCallbackTag: createJSDocCallbackTag,
        updateJSDocCallbackTag: updateJSDocCallbackTag,
        createJSDocOverloadTag: createJSDocOverloadTag,
        updateJSDocOverloadTag: updateJSDocOverloadTag,
        createJSDocAugmentsTag: createJSDocAugmentsTag,
        updateJSDocAugmentsTag: updateJSDocAugmentsTag,
        createJSDocImplementsTag: createJSDocImplementsTag,
        updateJSDocImplementsTag: updateJSDocImplementsTag,
        createJSDocSeeTag: createJSDocSeeTag,
        updateJSDocSeeTag: updateJSDocSeeTag,
        createJSDocNameReference: createJSDocNameReference,
        updateJSDocNameReference: updateJSDocNameReference,
        createJSDocMemberName: createJSDocMemberName,
        updateJSDocMemberName: updateJSDocMemberName,
        createJSDocLink: createJSDocLink,
        updateJSDocLink: updateJSDocLink,
        createJSDocLinkCode: createJSDocLinkCode,
        updateJSDocLinkCode: updateJSDocLinkCode,
        createJSDocLinkPlain: createJSDocLinkPlain,
        updateJSDocLinkPlain: updateJSDocLinkPlain,
        // lazily load factory members for JSDoc tags with similar structure
        get createJSDocTypeTag() { return getJSDocTypeLikeTagCreateFunction(350 /* SyntaxKind.JSDocTypeTag */); },
        get updateJSDocTypeTag() { return getJSDocTypeLikeTagUpdateFunction(350 /* SyntaxKind.JSDocTypeTag */); },
        get createJSDocReturnTag() { return getJSDocTypeLikeTagCreateFunction(348 /* SyntaxKind.JSDocReturnTag */); },
        get updateJSDocReturnTag() { return getJSDocTypeLikeTagUpdateFunction(348 /* SyntaxKind.JSDocReturnTag */); },
        get createJSDocThisTag() { return getJSDocTypeLikeTagCreateFunction(349 /* SyntaxKind.JSDocThisTag */); },
        get updateJSDocThisTag() { return getJSDocTypeLikeTagUpdateFunction(349 /* SyntaxKind.JSDocThisTag */); },
        get createJSDocAuthorTag() { return getJSDocSimpleTagCreateFunction(336 /* SyntaxKind.JSDocAuthorTag */); },
        get updateJSDocAuthorTag() { return getJSDocSimpleTagUpdateFunction(336 /* SyntaxKind.JSDocAuthorTag */); },
        get createJSDocClassTag() { return getJSDocSimpleTagCreateFunction(338 /* SyntaxKind.JSDocClassTag */); },
        get updateJSDocClassTag() { return getJSDocSimpleTagUpdateFunction(338 /* SyntaxKind.JSDocClassTag */); },
        get createJSDocPublicTag() { return getJSDocSimpleTagCreateFunction(339 /* SyntaxKind.JSDocPublicTag */); },
        get updateJSDocPublicTag() { return getJSDocSimpleTagUpdateFunction(339 /* SyntaxKind.JSDocPublicTag */); },
        get createJSDocPrivateTag() { return getJSDocSimpleTagCreateFunction(340 /* SyntaxKind.JSDocPrivateTag */); },
        get updateJSDocPrivateTag() { return getJSDocSimpleTagUpdateFunction(340 /* SyntaxKind.JSDocPrivateTag */); },
        get createJSDocProtectedTag() { return getJSDocSimpleTagCreateFunction(341 /* SyntaxKind.JSDocProtectedTag */); },
        get updateJSDocProtectedTag() { return getJSDocSimpleTagUpdateFunction(341 /* SyntaxKind.JSDocProtectedTag */); },
        get createJSDocReadonlyTag() { return getJSDocSimpleTagCreateFunction(342 /* SyntaxKind.JSDocReadonlyTag */); },
        get updateJSDocReadonlyTag() { return getJSDocSimpleTagUpdateFunction(342 /* SyntaxKind.JSDocReadonlyTag */); },
        get createJSDocOverrideTag() { return getJSDocSimpleTagCreateFunction(343 /* SyntaxKind.JSDocOverrideTag */); },
        get updateJSDocOverrideTag() { return getJSDocSimpleTagUpdateFunction(343 /* SyntaxKind.JSDocOverrideTag */); },
        get createJSDocDeprecatedTag() { return getJSDocSimpleTagCreateFunction(337 /* SyntaxKind.JSDocDeprecatedTag */); },
        get updateJSDocDeprecatedTag() { return getJSDocSimpleTagUpdateFunction(337 /* SyntaxKind.JSDocDeprecatedTag */); },
        get createJSDocThrowsTag() { return getJSDocTypeLikeTagCreateFunction(355 /* SyntaxKind.JSDocThrowsTag */); },
        get updateJSDocThrowsTag() { return getJSDocTypeLikeTagUpdateFunction(355 /* SyntaxKind.JSDocThrowsTag */); },
        get createJSDocSatisfiesTag() { return getJSDocTypeLikeTagCreateFunction(356 /* SyntaxKind.JSDocSatisfiesTag */); },
        get updateJSDocSatisfiesTag() { return getJSDocTypeLikeTagUpdateFunction(356 /* SyntaxKind.JSDocSatisfiesTag */); },
        createJSDocEnumTag: createJSDocEnumTag,
        updateJSDocEnumTag: updateJSDocEnumTag,
        createJSDocUnknownTag: createJSDocUnknownTag,
        updateJSDocUnknownTag: updateJSDocUnknownTag,
        createJSDocText: createJSDocText,
        updateJSDocText: updateJSDocText,
        createJSDocComment: createJSDocComment,
        updateJSDocComment: updateJSDocComment,
        createJsxElement: createJsxElement,
        updateJsxElement: updateJsxElement,
        createJsxSelfClosingElement: createJsxSelfClosingElement,
        updateJsxSelfClosingElement: updateJsxSelfClosingElement,
        createJsxOpeningElement: createJsxOpeningElement,
        updateJsxOpeningElement: updateJsxOpeningElement,
        createJsxClosingElement: createJsxClosingElement,
        updateJsxClosingElement: updateJsxClosingElement,
        createJsxFragment: createJsxFragment,
        createJsxText: createJsxText,
        updateJsxText: updateJsxText,
        createJsxOpeningFragment: createJsxOpeningFragment,
        createJsxJsxClosingFragment: createJsxJsxClosingFragment,
        updateJsxFragment: updateJsxFragment,
        createJsxAttribute: createJsxAttribute,
        updateJsxAttribute: updateJsxAttribute,
        createJsxAttributes: createJsxAttributes,
        updateJsxAttributes: updateJsxAttributes,
        createJsxSpreadAttribute: createJsxSpreadAttribute,
        updateJsxSpreadAttribute: updateJsxSpreadAttribute,
        createJsxExpression: createJsxExpression,
        updateJsxExpression: updateJsxExpression,
        createJsxNamespacedName: createJsxNamespacedName,
        updateJsxNamespacedName: updateJsxNamespacedName,
        createCaseClause: createCaseClause,
        updateCaseClause: updateCaseClause,
        createDefaultClause: createDefaultClause,
        updateDefaultClause: updateDefaultClause,
        createHeritageClause: createHeritageClause,
        updateHeritageClause: updateHeritageClause,
        createCatchClause: createCatchClause,
        updateCatchClause: updateCatchClause,
        createPropertyAssignment: createPropertyAssignment,
        updatePropertyAssignment: updatePropertyAssignment,
        createShorthandPropertyAssignment: createShorthandPropertyAssignment,
        updateShorthandPropertyAssignment: updateShorthandPropertyAssignment,
        createSpreadAssignment: createSpreadAssignment,
        updateSpreadAssignment: updateSpreadAssignment,
        createEnumMember: createEnumMember,
        updateEnumMember: updateEnumMember,
        createSourceFile: createSourceFile,
        updateSourceFile: updateSourceFile,
        createRedirectedSourceFile: createRedirectedSourceFile,
        createBundle: createBundle,
        updateBundle: updateBundle,
        createUnparsedSource: createUnparsedSource,
        createUnparsedPrologue: createUnparsedPrologue,
        createUnparsedPrepend: createUnparsedPrepend,
        createUnparsedTextLike: createUnparsedTextLike,
        createUnparsedSyntheticReference: createUnparsedSyntheticReference,
        createInputFiles: createInputFiles,
        createSyntheticExpression: createSyntheticExpression,
        createSyntaxList: createSyntaxList,
        createNotEmittedStatement: createNotEmittedStatement,
        createPartiallyEmittedExpression: createPartiallyEmittedExpression,
        updatePartiallyEmittedExpression: updatePartiallyEmittedExpression,
        createCommaListExpression: createCommaListExpression,
        updateCommaListExpression: updateCommaListExpression,
        createSyntheticReferenceExpression: createSyntheticReferenceExpression,
        updateSyntheticReferenceExpression: updateSyntheticReferenceExpression,
        cloneNode: cloneNode,
        // Lazily load factory methods for common operator factories and utilities
        get createComma() { return getBinaryCreateFunction(28 /* SyntaxKind.CommaToken */); },
        get createAssignment() { return getBinaryCreateFunction(64 /* SyntaxKind.EqualsToken */); },
        get createLogicalOr() { return getBinaryCreateFunction(57 /* SyntaxKind.BarBarToken */); },
        get createLogicalAnd() { return getBinaryCreateFunction(56 /* SyntaxKind.AmpersandAmpersandToken */); },
        get createBitwiseOr() { return getBinaryCreateFunction(52 /* SyntaxKind.BarToken */); },
        get createBitwiseXor() { return getBinaryCreateFunction(53 /* SyntaxKind.CaretToken */); },
        get createBitwiseAnd() { return getBinaryCreateFunction(51 /* SyntaxKind.AmpersandToken */); },
        get createStrictEquality() { return getBinaryCreateFunction(37 /* SyntaxKind.EqualsEqualsEqualsToken */); },
        get createStrictInequality() { return getBinaryCreateFunction(38 /* SyntaxKind.ExclamationEqualsEqualsToken */); },
        get createEquality() { return getBinaryCreateFunction(35 /* SyntaxKind.EqualsEqualsToken */); },
        get createInequality() { return getBinaryCreateFunction(36 /* SyntaxKind.ExclamationEqualsToken */); },
        get createLessThan() { return getBinaryCreateFunction(30 /* SyntaxKind.LessThanToken */); },
        get createLessThanEquals() { return getBinaryCreateFunction(33 /* SyntaxKind.LessThanEqualsToken */); },
        get createGreaterThan() { return getBinaryCreateFunction(32 /* SyntaxKind.GreaterThanToken */); },
        get createGreaterThanEquals() { return getBinaryCreateFunction(34 /* SyntaxKind.GreaterThanEqualsToken */); },
        get createLeftShift() { return getBinaryCreateFunction(48 /* SyntaxKind.LessThanLessThanToken */); },
        get createRightShift() { return getBinaryCreateFunction(49 /* SyntaxKind.GreaterThanGreaterThanToken */); },
        get createUnsignedRightShift() { return getBinaryCreateFunction(50 /* SyntaxKind.GreaterThanGreaterThanGreaterThanToken */); },
        get createAdd() { return getBinaryCreateFunction(40 /* SyntaxKind.PlusToken */); },
        get createSubtract() { return getBinaryCreateFunction(41 /* SyntaxKind.MinusToken */); },
        get createMultiply() { return getBinaryCreateFunction(42 /* SyntaxKind.AsteriskToken */); },
        get createDivide() { return getBinaryCreateFunction(44 /* SyntaxKind.SlashToken */); },
        get createModulo() { return getBinaryCreateFunction(45 /* SyntaxKind.PercentToken */); },
        get createExponent() { return getBinaryCreateFunction(43 /* SyntaxKind.AsteriskAsteriskToken */); },
        get createPrefixPlus() { return getPrefixUnaryCreateFunction(40 /* SyntaxKind.PlusToken */); },
        get createPrefixMinus() { return getPrefixUnaryCreateFunction(41 /* SyntaxKind.MinusToken */); },
        get createPrefixIncrement() { return getPrefixUnaryCreateFunction(46 /* SyntaxKind.PlusPlusToken */); },
        get createPrefixDecrement() { return getPrefixUnaryCreateFunction(47 /* SyntaxKind.MinusMinusToken */); },
        get createBitwiseNot() { return getPrefixUnaryCreateFunction(55 /* SyntaxKind.TildeToken */); },
        get createLogicalNot() { return getPrefixUnaryCreateFunction(54 /* SyntaxKind.ExclamationToken */); },
        get createPostfixIncrement() { return getPostfixUnaryCreateFunction(46 /* SyntaxKind.PlusPlusToken */); },
        get createPostfixDecrement() { return getPostfixUnaryCreateFunction(47 /* SyntaxKind.MinusMinusToken */); },
        // Compound nodes
        createImmediatelyInvokedFunctionExpression: createImmediatelyInvokedFunctionExpression,
        createImmediatelyInvokedArrowFunction: createImmediatelyInvokedArrowFunction,
        createVoidZero: createVoidZero,
        createExportDefault: createExportDefault,
        createExternalModuleExport: createExternalModuleExport,
        createTypeCheck: createTypeCheck,
        createMethodCall: createMethodCall,
        createGlobalMethodCall: createGlobalMethodCall,
        createFunctionBindCall: createFunctionBindCall,
        createFunctionCallCall: createFunctionCallCall,
        createFunctionApplyCall: createFunctionApplyCall,
        createArraySliceCall: createArraySliceCall,
        createArrayConcatCall: createArrayConcatCall,
        createObjectDefinePropertyCall: createObjectDefinePropertyCall,
        createObjectGetOwnPropertyDescriptorCall: createObjectGetOwnPropertyDescriptorCall,
        createReflectGetCall: createReflectGetCall,
        createReflectSetCall: createReflectSetCall,
        createPropertyDescriptor: createPropertyDescriptor,
        createCallBinding: createCallBinding,
        createAssignmentTargetWrapper: createAssignmentTargetWrapper,
        // Utilities
        inlineExpressions: inlineExpressions,
        getInternalName: getInternalName,
        getLocalName: getLocalName,
        getExportName: getExportName,
        getDeclarationName: getDeclarationName,
        getNamespaceMemberName: getNamespaceMemberName,
        getExternalModuleOrNamespaceExportName: getExternalModuleOrNamespaceExportName,
        restoreOuterExpressions: restoreOuterExpressions,
        restoreEnclosingLabel: restoreEnclosingLabel,
        createUseStrictPrologue: createUseStrictPrologue,
        copyPrologue: copyPrologue,
        copyStandardPrologue: copyStandardPrologue,
        copyCustomPrologue: copyCustomPrologue,
        ensureUseStrict: ensureUseStrict,
        liftToBlock: liftToBlock,
        mergeLexicalEnvironment: mergeLexicalEnvironment,
        updateModifiers: updateModifiers,
        updateModifierLike: updateModifierLike,
    };
    (0, ts_1.forEach)(nodeFactoryPatchers, function (fn) { return fn(factory); });
    return factory;
    // @api
    function createNodeArray(elements, hasTrailingComma) {
        if (elements === undefined || elements === ts_1.emptyArray) {
            elements = [];
        }
        else if ((0, ts_1.isNodeArray)(elements)) {
            if (hasTrailingComma === undefined || elements.hasTrailingComma === hasTrailingComma) {
                // Ensure the transform flags have been aggregated for this NodeArray
                if (elements.transformFlags === undefined) {
                    aggregateChildrenFlags(elements);
                }
                ts_1.Debug.attachNodeArrayDebugInfo(elements);
                return elements;
            }
            // This *was* a `NodeArray`, but the `hasTrailingComma` option differs. Recreate the
            // array with the same elements, text range, and transform flags but with the updated
            // value for `hasTrailingComma`
            var array_1 = elements.slice();
            array_1.pos = elements.pos;
            array_1.end = elements.end;
            array_1.hasTrailingComma = hasTrailingComma;
            array_1.transformFlags = elements.transformFlags;
            ts_1.Debug.attachNodeArrayDebugInfo(array_1);
            return array_1;
        }
        // Since the element list of a node array is typically created by starting with an empty array and
        // repeatedly calling push(), the list may not have the optimal memory layout. We invoke slice() for
        // small arrays (1 to 4 elements) to give the VM a chance to allocate an optimal representation.
        var length = elements.length;
        var array = (length >= 1 && length <= 4 ? elements.slice() : elements);
        array.pos = -1;
        array.end = -1;
        array.hasTrailingComma = !!hasTrailingComma;
        array.transformFlags = 0 /* TransformFlags.None */;
        aggregateChildrenFlags(array);
        ts_1.Debug.attachNodeArrayDebugInfo(array);
        return array;
    }
    function createBaseNode(kind) {
        return baseFactory.createBaseNode(kind);
    }
    function createBaseDeclaration(kind) {
        var node = createBaseNode(kind);
        node.symbol = undefined; // initialized by binder
        node.localSymbol = undefined; // initialized by binder
        return node;
    }
    function finishUpdateBaseSignatureDeclaration(updated, original) {
        if (updated !== original) {
            // copy children used for quick info
            updated.typeArguments = original.typeArguments;
        }
        return update(updated, original);
    }
    //
    // Literals
    //
    // @api
    function createNumericLiteral(value, numericLiteralFlags) {
        if (numericLiteralFlags === void 0) { numericLiteralFlags = 0 /* TokenFlags.None */; }
        var node = createBaseDeclaration(9 /* SyntaxKind.NumericLiteral */);
        node.text = typeof value === "number" ? value + "" : value;
        node.numericLiteralFlags = numericLiteralFlags;
        if (numericLiteralFlags & 384 /* TokenFlags.BinaryOrOctalSpecifier */)
            node.transformFlags |= 1024 /* TransformFlags.ContainsES2015 */;
        return node;
    }
    // @api
    function createBigIntLiteral(value) {
        var node = createBaseToken(10 /* SyntaxKind.BigIntLiteral */);
        node.text = typeof value === "string" ? value : (0, ts_1.pseudoBigIntToString)(value) + "n";
        node.transformFlags |= 32 /* TransformFlags.ContainsES2020 */;
        return node;
    }
    function createBaseStringLiteral(text, isSingleQuote) {
        var node = createBaseDeclaration(11 /* SyntaxKind.StringLiteral */);
        node.text = text;
        node.singleQuote = isSingleQuote;
        return node;
    }
    // @api
    function createStringLiteral(text, isSingleQuote, hasExtendedUnicodeEscape) {
        var node = createBaseStringLiteral(text, isSingleQuote);
        node.hasExtendedUnicodeEscape = hasExtendedUnicodeEscape;
        if (hasExtendedUnicodeEscape)
            node.transformFlags |= 1024 /* TransformFlags.ContainsES2015 */;
        return node;
    }
    // @api
    function createStringLiteralFromNode(sourceNode) {
        var node = createBaseStringLiteral((0, ts_1.getTextOfIdentifierOrLiteral)(sourceNode), /*isSingleQuote*/ undefined);
        node.textSourceNode = sourceNode;
        return node;
    }
    // @api
    function createRegularExpressionLiteral(text) {
        var node = createBaseToken(14 /* SyntaxKind.RegularExpressionLiteral */);
        node.text = text;
        return node;
    }
    // @api
    function createLiteralLikeNode(kind, text) {
        switch (kind) {
            case 9 /* SyntaxKind.NumericLiteral */: return createNumericLiteral(text, /*numericLiteralFlags*/ 0);
            case 10 /* SyntaxKind.BigIntLiteral */: return createBigIntLiteral(text);
            case 11 /* SyntaxKind.StringLiteral */: return createStringLiteral(text, /*isSingleQuote*/ undefined);
            case 12 /* SyntaxKind.JsxText */: return createJsxText(text, /*containsOnlyTriviaWhiteSpaces*/ false);
            case 13 /* SyntaxKind.JsxTextAllWhiteSpaces */: return createJsxText(text, /*containsOnlyTriviaWhiteSpaces*/ true);
            case 14 /* SyntaxKind.RegularExpressionLiteral */: return createRegularExpressionLiteral(text);
            case 15 /* SyntaxKind.NoSubstitutionTemplateLiteral */: return createTemplateLiteralLikeNode(kind, text, /*rawText*/ undefined, /*templateFlags*/ 0);
        }
    }
    //
    // Identifiers
    //
    function createBaseIdentifier(escapedText) {
        var node = baseFactory.createBaseIdentifierNode(80 /* SyntaxKind.Identifier */);
        node.escapedText = escapedText;
        node.jsDoc = undefined; // initialized by parser (JsDocContainer)
        node.flowNode = undefined; // initialized by binder (FlowContainer)
        node.symbol = undefined; // initialized by checker
        return node;
    }
    function createBaseGeneratedIdentifier(text, autoGenerateFlags, prefix, suffix) {
        var node = createBaseIdentifier((0, ts_1.escapeLeadingUnderscores)(text));
        (0, ts_1.setIdentifierAutoGenerate)(node, {
            flags: autoGenerateFlags,
            id: nextAutoGenerateId,
            prefix: prefix,
            suffix: suffix
        });
        nextAutoGenerateId++;
        return node;
    }
    // @api
    function createIdentifier(text, originalKeywordKind, hasExtendedUnicodeEscape) {
        if (originalKeywordKind === undefined && text) {
            originalKeywordKind = (0, ts_1.stringToToken)(text);
        }
        if (originalKeywordKind === 80 /* SyntaxKind.Identifier */) {
            originalKeywordKind = undefined;
        }
        var node = createBaseIdentifier((0, ts_1.escapeLeadingUnderscores)(text));
        if (hasExtendedUnicodeEscape)
            node.flags |= 128 /* NodeFlags.IdentifierHasExtendedUnicodeEscape */;
        // NOTE: we do not include transform flags of typeArguments in an identifier as they do not contribute to transformations
        if (node.escapedText === "await") {
            node.transformFlags |= 67108864 /* TransformFlags.ContainsPossibleTopLevelAwait */;
        }
        if (node.flags & 128 /* NodeFlags.IdentifierHasExtendedUnicodeEscape */) {
            node.transformFlags |= 1024 /* TransformFlags.ContainsES2015 */;
        }
        return node;
    }
    // @api
    function createTempVariable(recordTempVariable, reservedInNestedScopes, prefix, suffix) {
        var flags = 1 /* GeneratedIdentifierFlags.Auto */;
        if (reservedInNestedScopes)
            flags |= 8 /* GeneratedIdentifierFlags.ReservedInNestedScopes */;
        var name = createBaseGeneratedIdentifier("", flags, prefix, suffix);
        if (recordTempVariable) {
            recordTempVariable(name);
        }
        return name;
    }
    /** Create a unique temporary variable for use in a loop. */
    // @api
    function createLoopVariable(reservedInNestedScopes) {
        var flags = 2 /* GeneratedIdentifierFlags.Loop */;
        if (reservedInNestedScopes)
            flags |= 8 /* GeneratedIdentifierFlags.ReservedInNestedScopes */;
        return createBaseGeneratedIdentifier("", flags, /*prefix*/ undefined, /*suffix*/ undefined);
    }
    /** Create a unique name based on the supplied text. */
    // @api
    function createUniqueName(text, flags, prefix, suffix) {
        if (flags === void 0) { flags = 0 /* GeneratedIdentifierFlags.None */; }
        ts_1.Debug.assert(!(flags & 7 /* GeneratedIdentifierFlags.KindMask */), "Argument out of range: flags");
        ts_1.Debug.assert((flags & (16 /* GeneratedIdentifierFlags.Optimistic */ | 32 /* GeneratedIdentifierFlags.FileLevel */)) !== 32 /* GeneratedIdentifierFlags.FileLevel */, "GeneratedIdentifierFlags.FileLevel cannot be set without also setting GeneratedIdentifierFlags.Optimistic");
        return createBaseGeneratedIdentifier(text, 3 /* GeneratedIdentifierFlags.Unique */ | flags, prefix, suffix);
    }
    /** Create a unique name generated for a node. */
    // @api
    function getGeneratedNameForNode(node, flags, prefix, suffix) {
        if (flags === void 0) { flags = 0; }
        ts_1.Debug.assert(!(flags & 7 /* GeneratedIdentifierFlags.KindMask */), "Argument out of range: flags");
        var text = !node ? "" :
            (0, ts_1.isMemberName)(node) ? (0, ts_1.formatGeneratedName)(/*privateName*/ false, prefix, node, suffix, ts_1.idText) :
                "generated@".concat((0, ts_1.getNodeId)(node));
        if (prefix || suffix)
            flags |= 16 /* GeneratedIdentifierFlags.Optimistic */;
        var name = createBaseGeneratedIdentifier(text, 4 /* GeneratedIdentifierFlags.Node */ | flags, prefix, suffix);
        name.original = node;
        return name;
    }
    function createBasePrivateIdentifier(escapedText) {
        var node = baseFactory.createBasePrivateIdentifierNode(81 /* SyntaxKind.PrivateIdentifier */);
        node.escapedText = escapedText;
        node.transformFlags |= 16777216 /* TransformFlags.ContainsClassFields */;
        return node;
    }
    // @api
    function createPrivateIdentifier(text) {
        if (!(0, ts_1.startsWith)(text, "#"))
            ts_1.Debug.fail("First character of private identifier must be #: " + text);
        return createBasePrivateIdentifier((0, ts_1.escapeLeadingUnderscores)(text));
    }
    function createBaseGeneratedPrivateIdentifier(text, autoGenerateFlags, prefix, suffix) {
        var node = createBasePrivateIdentifier((0, ts_1.escapeLeadingUnderscores)(text));
        (0, ts_1.setIdentifierAutoGenerate)(node, {
            flags: autoGenerateFlags,
            id: nextAutoGenerateId,
            prefix: prefix,
            suffix: suffix,
        });
        nextAutoGenerateId++;
        return node;
    }
    /** Create a unique name based on the supplied text. */
    // @api
    function createUniquePrivateName(text, prefix, suffix) {
        if (text && !(0, ts_1.startsWith)(text, "#"))
            ts_1.Debug.fail("First character of private identifier must be #: " + text);
        var autoGenerateFlags = 8 /* GeneratedIdentifierFlags.ReservedInNestedScopes */ |
            (text ? 3 /* GeneratedIdentifierFlags.Unique */ : 1 /* GeneratedIdentifierFlags.Auto */);
        return createBaseGeneratedPrivateIdentifier(text !== null && text !== void 0 ? text : "", autoGenerateFlags, prefix, suffix);
    }
    // @api
    function getGeneratedPrivateNameForNode(node, prefix, suffix) {
        var text = (0, ts_1.isMemberName)(node) ? (0, ts_1.formatGeneratedName)(/*privateName*/ true, prefix, node, suffix, ts_1.idText) :
            "#generated@".concat((0, ts_1.getNodeId)(node));
        var flags = prefix || suffix ? 16 /* GeneratedIdentifierFlags.Optimistic */ : 0 /* GeneratedIdentifierFlags.None */;
        var name = createBaseGeneratedPrivateIdentifier(text, 4 /* GeneratedIdentifierFlags.Node */ | flags, prefix, suffix);
        name.original = node;
        return name;
    }
    //
    // Punctuation
    //
    function createBaseToken(kind) {
        return baseFactory.createBaseTokenNode(kind);
    }
    function createToken(token) {
        ts_1.Debug.assert(token >= 0 /* SyntaxKind.FirstToken */ && token <= 164 /* SyntaxKind.LastToken */, "Invalid token");
        ts_1.Debug.assert(token <= 15 /* SyntaxKind.FirstTemplateToken */ || token >= 18 /* SyntaxKind.LastTemplateToken */, "Invalid token. Use 'createTemplateLiteralLikeNode' to create template literals.");
        ts_1.Debug.assert(token <= 9 /* SyntaxKind.FirstLiteralToken */ || token >= 15 /* SyntaxKind.LastLiteralToken */, "Invalid token. Use 'createLiteralLikeNode' to create literals.");
        ts_1.Debug.assert(token !== 80 /* SyntaxKind.Identifier */, "Invalid token. Use 'createIdentifier' to create identifiers");
        var node = createBaseToken(token);
        var transformFlags = 0 /* TransformFlags.None */;
        switch (token) {
            case 134 /* SyntaxKind.AsyncKeyword */:
                // 'async' modifier is ES2017 (async functions) or ES2018 (async generators)
                transformFlags =
                    256 /* TransformFlags.ContainsES2017 */ |
                        128 /* TransformFlags.ContainsES2018 */;
                break;
            case 125 /* SyntaxKind.PublicKeyword */:
            case 123 /* SyntaxKind.PrivateKeyword */:
            case 124 /* SyntaxKind.ProtectedKeyword */:
            case 148 /* SyntaxKind.ReadonlyKeyword */:
            case 128 /* SyntaxKind.AbstractKeyword */:
            case 138 /* SyntaxKind.DeclareKeyword */:
            case 87 /* SyntaxKind.ConstKeyword */:
            case 133 /* SyntaxKind.AnyKeyword */:
            case 150 /* SyntaxKind.NumberKeyword */:
            case 162 /* SyntaxKind.BigIntKeyword */:
            case 146 /* SyntaxKind.NeverKeyword */:
            case 151 /* SyntaxKind.ObjectKeyword */:
            case 103 /* SyntaxKind.InKeyword */:
            case 147 /* SyntaxKind.OutKeyword */:
            case 163 /* SyntaxKind.OverrideKeyword */:
            case 154 /* SyntaxKind.StringKeyword */:
            case 136 /* SyntaxKind.BooleanKeyword */:
            case 155 /* SyntaxKind.SymbolKeyword */:
            case 116 /* SyntaxKind.VoidKeyword */:
            case 159 /* SyntaxKind.UnknownKeyword */:
            case 157 /* SyntaxKind.UndefinedKeyword */: // `undefined` is an Identifier in the expression case.
                transformFlags = 1 /* TransformFlags.ContainsTypeScript */;
                break;
            case 108 /* SyntaxKind.SuperKeyword */:
                transformFlags = 1024 /* TransformFlags.ContainsES2015 */ | 134217728 /* TransformFlags.ContainsLexicalSuper */;
                node.flowNode = undefined; // initialized by binder (FlowContainer)
                break;
            case 126 /* SyntaxKind.StaticKeyword */:
                transformFlags = 1024 /* TransformFlags.ContainsES2015 */;
                break;
            case 129 /* SyntaxKind.AccessorKeyword */:
                transformFlags = 16777216 /* TransformFlags.ContainsClassFields */;
                break;
            case 110 /* SyntaxKind.ThisKeyword */:
                // 'this' indicates a lexical 'this'
                transformFlags = 16384 /* TransformFlags.ContainsLexicalThis */;
                node.flowNode = undefined; // initialized by binder (FlowContainer)
                break;
        }
        if (transformFlags) {
            node.transformFlags |= transformFlags;
        }
        return node;
    }
    //
    // Reserved words
    //
    // @api
    function createSuper() {
        return createToken(108 /* SyntaxKind.SuperKeyword */);
    }
    // @api
    function createThis() {
        return createToken(110 /* SyntaxKind.ThisKeyword */);
    }
    // @api
    function createNull() {
        return createToken(106 /* SyntaxKind.NullKeyword */);
    }
    // @api
    function createTrue() {
        return createToken(112 /* SyntaxKind.TrueKeyword */);
    }
    // @api
    function createFalse() {
        return createToken(97 /* SyntaxKind.FalseKeyword */);
    }
    //
    // Modifiers
    //
    // @api
    function createModifier(kind) {
        return createToken(kind);
    }
    // @api
    function createModifiersFromModifierFlags(flags) {
        var result = [];
        if (flags & 1 /* ModifierFlags.Export */)
            result.push(createModifier(95 /* SyntaxKind.ExportKeyword */));
        if (flags & 2 /* ModifierFlags.Ambient */)
            result.push(createModifier(138 /* SyntaxKind.DeclareKeyword */));
        if (flags & 1024 /* ModifierFlags.Default */)
            result.push(createModifier(90 /* SyntaxKind.DefaultKeyword */));
        if (flags & 2048 /* ModifierFlags.Const */)
            result.push(createModifier(87 /* SyntaxKind.ConstKeyword */));
        if (flags & 4 /* ModifierFlags.Public */)
            result.push(createModifier(125 /* SyntaxKind.PublicKeyword */));
        if (flags & 8 /* ModifierFlags.Private */)
            result.push(createModifier(123 /* SyntaxKind.PrivateKeyword */));
        if (flags & 16 /* ModifierFlags.Protected */)
            result.push(createModifier(124 /* SyntaxKind.ProtectedKeyword */));
        if (flags & 256 /* ModifierFlags.Abstract */)
            result.push(createModifier(128 /* SyntaxKind.AbstractKeyword */));
        if (flags & 32 /* ModifierFlags.Static */)
            result.push(createModifier(126 /* SyntaxKind.StaticKeyword */));
        if (flags & 16384 /* ModifierFlags.Override */)
            result.push(createModifier(163 /* SyntaxKind.OverrideKeyword */));
        if (flags & 64 /* ModifierFlags.Readonly */)
            result.push(createModifier(148 /* SyntaxKind.ReadonlyKeyword */));
        if (flags & 128 /* ModifierFlags.Accessor */)
            result.push(createModifier(129 /* SyntaxKind.AccessorKeyword */));
        if (flags & 512 /* ModifierFlags.Async */)
            result.push(createModifier(134 /* SyntaxKind.AsyncKeyword */));
        if (flags & 32768 /* ModifierFlags.In */)
            result.push(createModifier(103 /* SyntaxKind.InKeyword */));
        if (flags & 65536 /* ModifierFlags.Out */)
            result.push(createModifier(147 /* SyntaxKind.OutKeyword */));
        return result.length ? result : undefined;
    }
    //
    // Names
    //
    // @api
    function createQualifiedName(left, right) {
        var node = createBaseNode(165 /* SyntaxKind.QualifiedName */);
        node.left = left;
        node.right = asName(right);
        node.transformFlags |=
            propagateChildFlags(node.left) |
                propagateIdentifierNameFlags(node.right);
        node.flowNode = undefined; // initialized by binder (FlowContainer)
        return node;
    }
    // @api
    function updateQualifiedName(node, left, right) {
        return node.left !== left
            || node.right !== right
            ? update(createQualifiedName(left, right), node)
            : node;
    }
    // @api
    function createComputedPropertyName(expression) {
        var node = createBaseNode(166 /* SyntaxKind.ComputedPropertyName */);
        node.expression = parenthesizerRules().parenthesizeExpressionOfComputedPropertyName(expression);
        node.transformFlags |=
            propagateChildFlags(node.expression) |
                1024 /* TransformFlags.ContainsES2015 */ |
                131072 /* TransformFlags.ContainsComputedPropertyName */;
        return node;
    }
    // @api
    function updateComputedPropertyName(node, expression) {
        return node.expression !== expression
            ? update(createComputedPropertyName(expression), node)
            : node;
    }
    //
    // Signature elements
    //
    // @api
    function createTypeParameterDeclaration(modifiers, name, constraint, defaultType) {
        var node = createBaseDeclaration(167 /* SyntaxKind.TypeParameter */);
        node.modifiers = asNodeArray(modifiers);
        node.name = asName(name);
        node.constraint = constraint;
        node.default = defaultType;
        node.transformFlags = 1 /* TransformFlags.ContainsTypeScript */;
        node.expression = undefined; // initialized by parser to report grammar errors
        node.jsDoc = undefined; // initialized by parser (JsDocContainer)
        return node;
    }
    // @api
    function updateTypeParameterDeclaration(node, modifiers, name, constraint, defaultType) {
        return node.modifiers !== modifiers
            || node.name !== name
            || node.constraint !== constraint
            || node.default !== defaultType
            ? update(createTypeParameterDeclaration(modifiers, name, constraint, defaultType), node)
            : node;
    }
    // @api
    function createParameterDeclaration(modifiers, dotDotDotToken, name, questionToken, type, initializer) {
        var _a, _b;
        var node = createBaseDeclaration(168 /* SyntaxKind.Parameter */);
        node.modifiers = asNodeArray(modifiers);
        node.dotDotDotToken = dotDotDotToken;
        node.name = asName(name);
        node.questionToken = questionToken;
        node.type = type;
        node.initializer = asInitializer(initializer);
        if ((0, ts_1.isThisIdentifier)(node.name)) {
            node.transformFlags = 1 /* TransformFlags.ContainsTypeScript */;
        }
        else {
            node.transformFlags =
                propagateChildrenFlags(node.modifiers) |
                    propagateChildFlags(node.dotDotDotToken) |
                    propagateNameFlags(node.name) |
                    propagateChildFlags(node.questionToken) |
                    propagateChildFlags(node.initializer) |
                    (((_a = node.questionToken) !== null && _a !== void 0 ? _a : node.type) ? 1 /* TransformFlags.ContainsTypeScript */ : 0 /* TransformFlags.None */) |
                    (((_b = node.dotDotDotToken) !== null && _b !== void 0 ? _b : node.initializer) ? 1024 /* TransformFlags.ContainsES2015 */ : 0 /* TransformFlags.None */) |
                    ((0, ts_1.modifiersToFlags)(node.modifiers) & 16476 /* ModifierFlags.ParameterPropertyModifier */ ? 8192 /* TransformFlags.ContainsTypeScriptClassSyntax */ : 0 /* TransformFlags.None */);
        }
        node.jsDoc = undefined; // initialized by parser (JsDocContainer)
        return node;
    }
    // @api
    function updateParameterDeclaration(node, modifiers, dotDotDotToken, name, questionToken, type, initializer) {
        return node.modifiers !== modifiers
            || node.dotDotDotToken !== dotDotDotToken
            || node.name !== name
            || node.questionToken !== questionToken
            || node.type !== type
            || node.initializer !== initializer
            ? update(createParameterDeclaration(modifiers, dotDotDotToken, name, questionToken, type, initializer), node)
            : node;
    }
    // @api
    function createDecorator(expression) {
        var node = createBaseNode(169 /* SyntaxKind.Decorator */);
        node.expression = parenthesizerRules().parenthesizeLeftSideOfAccess(expression, /*optionalChain*/ false);
        node.transformFlags |=
            propagateChildFlags(node.expression) |
                1 /* TransformFlags.ContainsTypeScript */ |
                8192 /* TransformFlags.ContainsTypeScriptClassSyntax */ |
                33554432 /* TransformFlags.ContainsDecorators */;
        return node;
    }
    // @api
    function updateDecorator(node, expression) {
        return node.expression !== expression
            ? update(createDecorator(expression), node)
            : node;
    }
    //
    // Type Elements
    //
    // @api
    function createPropertySignature(modifiers, name, questionToken, type) {
        var node = createBaseDeclaration(170 /* SyntaxKind.PropertySignature */);
        node.modifiers = asNodeArray(modifiers);
        node.name = asName(name);
        node.type = type;
        node.questionToken = questionToken;
        node.transformFlags = 1 /* TransformFlags.ContainsTypeScript */;
        node.initializer = undefined; // initialized by parser to report grammar errors
        node.jsDoc = undefined; // initialized by parser (JsDocContainer)
        return node;
    }
    // @api
    function updatePropertySignature(node, modifiers, name, questionToken, type) {
        return node.modifiers !== modifiers
            || node.name !== name
            || node.questionToken !== questionToken
            || node.type !== type
            ? finishUpdatePropertySignature(createPropertySignature(modifiers, name, questionToken, type), node)
            : node;
    }
    function finishUpdatePropertySignature(updated, original) {
        if (updated !== original) {
            // copy children used only for error reporting
            updated.initializer = original.initializer;
        }
        return update(updated, original);
    }
    // @api
    function createPropertyDeclaration(modifiers, name, questionOrExclamationToken, type, initializer) {
        var node = createBaseDeclaration(171 /* SyntaxKind.PropertyDeclaration */);
        node.modifiers = asNodeArray(modifiers);
        node.name = asName(name);
        node.questionToken = questionOrExclamationToken && (0, ts_1.isQuestionToken)(questionOrExclamationToken) ? questionOrExclamationToken : undefined;
        node.exclamationToken = questionOrExclamationToken && (0, ts_1.isExclamationToken)(questionOrExclamationToken) ? questionOrExclamationToken : undefined;
        node.type = type;
        node.initializer = asInitializer(initializer);
        var isAmbient = node.flags & 16777216 /* NodeFlags.Ambient */ || (0, ts_1.modifiersToFlags)(node.modifiers) & 2 /* ModifierFlags.Ambient */;
        node.transformFlags =
            propagateChildrenFlags(node.modifiers) |
                propagateNameFlags(node.name) |
                propagateChildFlags(node.initializer) |
                (isAmbient || node.questionToken || node.exclamationToken || node.type ? 1 /* TransformFlags.ContainsTypeScript */ : 0 /* TransformFlags.None */) |
                ((0, ts_1.isComputedPropertyName)(node.name) || (0, ts_1.modifiersToFlags)(node.modifiers) & 32 /* ModifierFlags.Static */ && node.initializer ? 8192 /* TransformFlags.ContainsTypeScriptClassSyntax */ : 0 /* TransformFlags.None */) |
                16777216 /* TransformFlags.ContainsClassFields */;
        node.jsDoc = undefined; // initialized by parser (JsDocContainer)
        return node;
    }
    // @api
    function updatePropertyDeclaration(node, modifiers, name, questionOrExclamationToken, type, initializer) {
        return node.modifiers !== modifiers
            || node.name !== name
            || node.questionToken !== (questionOrExclamationToken !== undefined && (0, ts_1.isQuestionToken)(questionOrExclamationToken) ? questionOrExclamationToken : undefined)
            || node.exclamationToken !== (questionOrExclamationToken !== undefined && (0, ts_1.isExclamationToken)(questionOrExclamationToken) ? questionOrExclamationToken : undefined)
            || node.type !== type
            || node.initializer !== initializer
            ? update(createPropertyDeclaration(modifiers, name, questionOrExclamationToken, type, initializer), node)
            : node;
    }
    // @api
    function createMethodSignature(modifiers, name, questionToken, typeParameters, parameters, type) {
        var node = createBaseDeclaration(172 /* SyntaxKind.MethodSignature */);
        node.modifiers = asNodeArray(modifiers);
        node.name = asName(name);
        node.questionToken = questionToken;
        node.typeParameters = asNodeArray(typeParameters);
        node.parameters = asNodeArray(parameters);
        node.type = type;
        node.transformFlags = 1 /* TransformFlags.ContainsTypeScript */;
        node.jsDoc = undefined; // initialized by parser (JsDocContainer)
        node.locals = undefined; // initialized by binder (LocalsContainer)
        node.nextContainer = undefined; // initialized by binder (LocalsContainer)
        node.typeArguments = undefined; // used in quick info
        return node;
    }
    // @api
    function updateMethodSignature(node, modifiers, name, questionToken, typeParameters, parameters, type) {
        return node.modifiers !== modifiers
            || node.name !== name
            || node.questionToken !== questionToken
            || node.typeParameters !== typeParameters
            || node.parameters !== parameters
            || node.type !== type
            ? finishUpdateBaseSignatureDeclaration(createMethodSignature(modifiers, name, questionToken, typeParameters, parameters, type), node)
            : node;
    }
    // @api
    function createMethodDeclaration(modifiers, asteriskToken, name, questionToken, typeParameters, parameters, type, body) {
        var node = createBaseDeclaration(173 /* SyntaxKind.MethodDeclaration */);
        node.modifiers = asNodeArray(modifiers);
        node.asteriskToken = asteriskToken;
        node.name = asName(name);
        node.questionToken = questionToken;
        node.exclamationToken = undefined; // initialized by parser for grammar errors
        node.typeParameters = asNodeArray(typeParameters);
        node.parameters = createNodeArray(parameters);
        node.type = type;
        node.body = body;
        if (!node.body) {
            node.transformFlags = 1 /* TransformFlags.ContainsTypeScript */;
        }
        else {
            var isAsync = (0, ts_1.modifiersToFlags)(node.modifiers) & 512 /* ModifierFlags.Async */;
            var isGenerator = !!node.asteriskToken;
            var isAsyncGenerator = isAsync && isGenerator;
            node.transformFlags =
                propagateChildrenFlags(node.modifiers) |
                    propagateChildFlags(node.asteriskToken) |
                    propagateNameFlags(node.name) |
                    propagateChildFlags(node.questionToken) |
                    propagateChildrenFlags(node.typeParameters) |
                    propagateChildrenFlags(node.parameters) |
                    propagateChildFlags(node.type) |
                    (propagateChildFlags(node.body) & ~67108864 /* TransformFlags.ContainsPossibleTopLevelAwait */) |
                    (isAsyncGenerator ? 128 /* TransformFlags.ContainsES2018 */ :
                        isAsync ? 256 /* TransformFlags.ContainsES2017 */ :
                            isGenerator ? 2048 /* TransformFlags.ContainsGenerator */ :
                                0 /* TransformFlags.None */) |
                    (node.questionToken || node.typeParameters || node.type ? 1 /* TransformFlags.ContainsTypeScript */ : 0 /* TransformFlags.None */) |
                    1024 /* TransformFlags.ContainsES2015 */;
        }
        node.typeArguments = undefined; // used in quick info
        node.jsDoc = undefined; // initialized by parser (JsDocContainer)
        node.locals = undefined; // initialized by binder (LocalsContainer)
        node.nextContainer = undefined; // initialized by binder (LocalsContainer)
        node.flowNode = undefined; // initialized by binder (FlowContainer)
        node.endFlowNode = undefined;
        node.returnFlowNode = undefined;
        return node;
    }
    // @api
    function updateMethodDeclaration(node, modifiers, asteriskToken, name, questionToken, typeParameters, parameters, type, body) {
        return node.modifiers !== modifiers
            || node.asteriskToken !== asteriskToken
            || node.name !== name
            || node.questionToken !== questionToken
            || node.typeParameters !== typeParameters
            || node.parameters !== parameters
            || node.type !== type
            || node.body !== body
            ? finishUpdateMethodDeclaration(createMethodDeclaration(modifiers, asteriskToken, name, questionToken, typeParameters, parameters, type, body), node)
            : node;
    }
    function finishUpdateMethodDeclaration(updated, original) {
        if (updated !== original) {
            // copy children used only for error reporting
            updated.exclamationToken = original.exclamationToken;
        }
        return update(updated, original);
    }
    // @api
    function createClassStaticBlockDeclaration(body) {
        var node = createBaseDeclaration(174 /* SyntaxKind.ClassStaticBlockDeclaration */);
        node.body = body;
        node.transformFlags = propagateChildFlags(body) | 16777216 /* TransformFlags.ContainsClassFields */;
        node.modifiers = undefined; // initialized by parser for grammar errors
        node.jsDoc = undefined; // initialized by parser (JsDocContainer)
        node.locals = undefined; // initialized by binder (LocalsContainer)
        node.nextContainer = undefined; // initialized by binder (LocalsContainer)
        node.endFlowNode = undefined;
        node.returnFlowNode = undefined;
        return node;
    }
    // @api
    function updateClassStaticBlockDeclaration(node, body) {
        return node.body !== body
            ? finishUpdateClassStaticBlockDeclaration(createClassStaticBlockDeclaration(body), node)
            : node;
    }
    function finishUpdateClassStaticBlockDeclaration(updated, original) {
        if (updated !== original) {
            // copy children used only for error reporting
            updated.modifiers = original.modifiers;
        }
        return update(updated, original);
    }
    // @api
    function createConstructorDeclaration(modifiers, parameters, body) {
        var node = createBaseDeclaration(175 /* SyntaxKind.Constructor */);
        node.modifiers = asNodeArray(modifiers);
        node.parameters = createNodeArray(parameters);
        node.body = body;
        node.transformFlags =
            propagateChildrenFlags(node.modifiers) |
                propagateChildrenFlags(node.parameters) |
                (propagateChildFlags(node.body) & ~67108864 /* TransformFlags.ContainsPossibleTopLevelAwait */) |
                1024 /* TransformFlags.ContainsES2015 */;
        node.typeParameters = undefined; // initialized by parser for grammar errors
        node.type = undefined; // initialized by parser for grammar errors
        node.typeArguments = undefined; // used in quick info
        node.jsDoc = undefined; // initialized by parser (JsDocContainer)
        node.locals = undefined; // initialized by binder (LocalsContainer)
        node.nextContainer = undefined; // initialized by binder (LocalsContainer)
        node.endFlowNode = undefined;
        node.returnFlowNode = undefined;
        return node;
    }
    // @api
    function updateConstructorDeclaration(node, modifiers, parameters, body) {
        return node.modifiers !== modifiers
            || node.parameters !== parameters
            || node.body !== body
            ? finishUpdateConstructorDeclaration(createConstructorDeclaration(modifiers, parameters, body), node)
            : node;
    }
    function finishUpdateConstructorDeclaration(updated, original) {
        if (updated !== original) {
            updated.typeParameters = original.typeParameters;
            updated.type = original.type;
        }
        return finishUpdateBaseSignatureDeclaration(updated, original);
    }
    // @api
    function createGetAccessorDeclaration(modifiers, name, parameters, type, body) {
        var node = createBaseDeclaration(176 /* SyntaxKind.GetAccessor */);
        node.modifiers = asNodeArray(modifiers);
        node.name = asName(name);
        node.parameters = createNodeArray(parameters);
        node.type = type;
        node.body = body;
        if (!node.body) {
            node.transformFlags = 1 /* TransformFlags.ContainsTypeScript */;
        }
        else {
            node.transformFlags =
                propagateChildrenFlags(node.modifiers) |
                    propagateNameFlags(node.name) |
                    propagateChildrenFlags(node.parameters) |
                    propagateChildFlags(node.type) |
                    (propagateChildFlags(node.body) & ~67108864 /* TransformFlags.ContainsPossibleTopLevelAwait */) |
                    (node.type ? 1 /* TransformFlags.ContainsTypeScript */ : 0 /* TransformFlags.None */);
        }
        node.typeArguments = undefined; // used in quick info
        node.typeParameters = undefined; // initialized by parser for grammar errors
        node.jsDoc = undefined; // initialized by parser (JsDocContainer)
        node.locals = undefined; // initialized by binder (LocalsContainer)
        node.nextContainer = undefined; // initialized by binder (LocalsContainer)
        node.flowNode = undefined; // initialized by binder (FlowContainer)
        node.endFlowNode = undefined;
        node.returnFlowNode = undefined;
        return node;
    }
    // @api
    function updateGetAccessorDeclaration(node, modifiers, name, parameters, type, body) {
        return node.modifiers !== modifiers
            || node.name !== name
            || node.parameters !== parameters
            || node.type !== type
            || node.body !== body
            ? finishUpdateGetAccessorDeclaration(createGetAccessorDeclaration(modifiers, name, parameters, type, body), node)
            : node;
    }
    function finishUpdateGetAccessorDeclaration(updated, original) {
        if (updated !== original) {
            // copy children used only for error reporting
            updated.typeParameters = original.typeParameters;
        }
        return finishUpdateBaseSignatureDeclaration(updated, original);
    }
    // @api
    function createSetAccessorDeclaration(modifiers, name, parameters, body) {
        var node = createBaseDeclaration(177 /* SyntaxKind.SetAccessor */);
        node.modifiers = asNodeArray(modifiers);
        node.name = asName(name);
        node.parameters = createNodeArray(parameters);
        node.body = body;
        if (!node.body) {
            node.transformFlags = 1 /* TransformFlags.ContainsTypeScript */;
        }
        else {
            node.transformFlags =
                propagateChildrenFlags(node.modifiers) |
                    propagateNameFlags(node.name) |
                    propagateChildrenFlags(node.parameters) |
                    (propagateChildFlags(node.body) & ~67108864 /* TransformFlags.ContainsPossibleTopLevelAwait */) |
                    (node.type ? 1 /* TransformFlags.ContainsTypeScript */ : 0 /* TransformFlags.None */);
        }
        node.typeArguments = undefined; // used in quick info
        node.typeParameters = undefined; // initialized by parser for grammar errors
        node.type = undefined; // initialized by parser for grammar errors
        node.jsDoc = undefined; // initialized by parser (JsDocContainer)
        node.locals = undefined; // initialized by binder (LocalsContainer)
        node.nextContainer = undefined; // initialized by binder (LocalsContainer)
        node.flowNode = undefined; // initialized by binder (FlowContainer)
        node.endFlowNode = undefined;
        node.returnFlowNode = undefined;
        return node;
    }
    // @api
    function updateSetAccessorDeclaration(node, modifiers, name, parameters, body) {
        return node.modifiers !== modifiers
            || node.name !== name
            || node.parameters !== parameters
            || node.body !== body
            ? finishUpdateSetAccessorDeclaration(createSetAccessorDeclaration(modifiers, name, parameters, body), node)
            : node;
    }
    function finishUpdateSetAccessorDeclaration(updated, original) {
        if (updated !== original) {
            // copy children used only for error reporting
            updated.typeParameters = original.typeParameters;
            updated.type = original.type;
        }
        return finishUpdateBaseSignatureDeclaration(updated, original);
    }
    // @api
    function createCallSignature(typeParameters, parameters, type) {
        var node = createBaseDeclaration(178 /* SyntaxKind.CallSignature */);
        node.typeParameters = asNodeArray(typeParameters);
        node.parameters = asNodeArray(parameters);
        node.type = type;
        node.transformFlags = 1 /* TransformFlags.ContainsTypeScript */;
        node.jsDoc = undefined; // initialized by parser (JsDocContainer)
        node.locals = undefined; // initialized by binder (LocalsContainer)
        node.nextContainer = undefined; // initialized by binder (LocalsContainer)
        node.typeArguments = undefined; // used in quick info
        return node;
    }
    // @api
    function updateCallSignature(node, typeParameters, parameters, type) {
        return node.typeParameters !== typeParameters
            || node.parameters !== parameters
            || node.type !== type
            ? finishUpdateBaseSignatureDeclaration(createCallSignature(typeParameters, parameters, type), node)
            : node;
    }
    // @api
    function createConstructSignature(typeParameters, parameters, type) {
        var node = createBaseDeclaration(179 /* SyntaxKind.ConstructSignature */);
        node.typeParameters = asNodeArray(typeParameters);
        node.parameters = asNodeArray(parameters);
        node.type = type;
        node.transformFlags = 1 /* TransformFlags.ContainsTypeScript */;
        node.jsDoc = undefined; // initialized by parser (JsDocContainer)
        node.locals = undefined; // initialized by binder (LocalsContainer)
        node.nextContainer = undefined; // initialized by binder (LocalsContainer)
        node.typeArguments = undefined; // used in quick info
        return node;
    }
    // @api
    function updateConstructSignature(node, typeParameters, parameters, type) {
        return node.typeParameters !== typeParameters
            || node.parameters !== parameters
            || node.type !== type
            ? finishUpdateBaseSignatureDeclaration(createConstructSignature(typeParameters, parameters, type), node)
            : node;
    }
    // @api
    function createIndexSignature(modifiers, parameters, type) {
        var node = createBaseDeclaration(180 /* SyntaxKind.IndexSignature */);
        node.modifiers = asNodeArray(modifiers);
        node.parameters = asNodeArray(parameters);
        node.type = type; // TODO(rbuckton): We mark this as required in IndexSignatureDeclaration, but it looks like the parser allows it to be elided.
        node.transformFlags = 1 /* TransformFlags.ContainsTypeScript */;
        node.jsDoc = undefined; // initialized by parser (JsDocContainer)
        node.locals = undefined; // initialized by binder (LocalsContainer)
        node.nextContainer = undefined; // initialized by binder (LocalsContainer)
        node.typeArguments = undefined; // used in quick info
        return node;
    }
    // @api
    function updateIndexSignature(node, modifiers, parameters, type) {
        return node.parameters !== parameters
            || node.type !== type
            || node.modifiers !== modifiers
            ? finishUpdateBaseSignatureDeclaration(createIndexSignature(modifiers, parameters, type), node)
            : node;
    }
    // @api
    function createTemplateLiteralTypeSpan(type, literal) {
        var node = createBaseNode(203 /* SyntaxKind.TemplateLiteralTypeSpan */);
        node.type = type;
        node.literal = literal;
        node.transformFlags = 1 /* TransformFlags.ContainsTypeScript */;
        return node;
    }
    // @api
    function updateTemplateLiteralTypeSpan(node, type, literal) {
        return node.type !== type
            || node.literal !== literal
            ? update(createTemplateLiteralTypeSpan(type, literal), node)
            : node;
    }
    //
    // Types
    //
    // @api
    function createKeywordTypeNode(kind) {
        return createToken(kind);
    }
    // @api
    function createTypePredicateNode(assertsModifier, parameterName, type) {
        var node = createBaseNode(181 /* SyntaxKind.TypePredicate */);
        node.assertsModifier = assertsModifier;
        node.parameterName = asName(parameterName);
        node.type = type;
        node.transformFlags = 1 /* TransformFlags.ContainsTypeScript */;
        return node;
    }
    // @api
    function updateTypePredicateNode(node, assertsModifier, parameterName, type) {
        return node.assertsModifier !== assertsModifier
            || node.parameterName !== parameterName
            || node.type !== type
            ? update(createTypePredicateNode(assertsModifier, parameterName, type), node)
            : node;
    }
    // @api
    function createTypeReferenceNode(typeName, typeArguments) {
        var node = createBaseNode(182 /* SyntaxKind.TypeReference */);
        node.typeName = asName(typeName);
        node.typeArguments = typeArguments && parenthesizerRules().parenthesizeTypeArguments(createNodeArray(typeArguments));
        node.transformFlags = 1 /* TransformFlags.ContainsTypeScript */;
        return node;
    }
    // @api
    function updateTypeReferenceNode(node, typeName, typeArguments) {
        return node.typeName !== typeName
            || node.typeArguments !== typeArguments
            ? update(createTypeReferenceNode(typeName, typeArguments), node)
            : node;
    }
    // @api
    function createFunctionTypeNode(typeParameters, parameters, type) {
        var node = createBaseDeclaration(183 /* SyntaxKind.FunctionType */);
        node.typeParameters = asNodeArray(typeParameters);
        node.parameters = asNodeArray(parameters);
        node.type = type;
        node.transformFlags = 1 /* TransformFlags.ContainsTypeScript */;
        node.modifiers = undefined; // initialized by parser for grammar errors
        node.jsDoc = undefined; // initialized by parser (JsDocContainer)
        node.locals = undefined; // initialized by binder (LocalsContainer)
        node.nextContainer = undefined; // initialized by binder (LocalsContainer)
        node.typeArguments = undefined; // used in quick info
        return node;
    }
    // @api
    function updateFunctionTypeNode(node, typeParameters, parameters, type) {
        return node.typeParameters !== typeParameters
            || node.parameters !== parameters
            || node.type !== type
            ? finishUpdateFunctionTypeNode(createFunctionTypeNode(typeParameters, parameters, type), node)
            : node;
    }
    function finishUpdateFunctionTypeNode(updated, original) {
        if (updated !== original) {
            // copy children used only for error reporting
            updated.modifiers = original.modifiers;
        }
        return finishUpdateBaseSignatureDeclaration(updated, original);
    }
    // @api
    function createConstructorTypeNode() {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        return args.length === 4 ? createConstructorTypeNode1.apply(void 0, args) :
            args.length === 3 ? createConstructorTypeNode2.apply(void 0, args) :
                ts_1.Debug.fail("Incorrect number of arguments specified.");
    }
    function createConstructorTypeNode1(modifiers, typeParameters, parameters, type) {
        var node = createBaseDeclaration(184 /* SyntaxKind.ConstructorType */);
        node.modifiers = asNodeArray(modifiers);
        node.typeParameters = asNodeArray(typeParameters);
        node.parameters = asNodeArray(parameters);
        node.type = type;
        node.transformFlags = 1 /* TransformFlags.ContainsTypeScript */;
        node.jsDoc = undefined; // initialized by parser (JsDocContainer)
        node.locals = undefined; // initialized by binder (LocalsContainer)
        node.nextContainer = undefined; // initialized by binder (LocalsContainer)
        node.typeArguments = undefined; // used in quick info
        return node;
    }
    /** @deprecated */
    function createConstructorTypeNode2(typeParameters, parameters, type) {
        return createConstructorTypeNode1(/*modifiers*/ undefined, typeParameters, parameters, type);
    }
    // @api
    function updateConstructorTypeNode() {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        return args.length === 5 ? updateConstructorTypeNode1.apply(void 0, args) :
            args.length === 4 ? updateConstructorTypeNode2.apply(void 0, args) :
                ts_1.Debug.fail("Incorrect number of arguments specified.");
    }
    function updateConstructorTypeNode1(node, modifiers, typeParameters, parameters, type) {
        return node.modifiers !== modifiers
            || node.typeParameters !== typeParameters
            || node.parameters !== parameters
            || node.type !== type
            ? finishUpdateBaseSignatureDeclaration(createConstructorTypeNode(modifiers, typeParameters, parameters, type), node)
            : node;
    }
    /** @deprecated */
    function updateConstructorTypeNode2(node, typeParameters, parameters, type) {
        return updateConstructorTypeNode1(node, node.modifiers, typeParameters, parameters, type);
    }
    // @api
    function createTypeQueryNode(exprName, typeArguments) {
        var node = createBaseNode(185 /* SyntaxKind.TypeQuery */);
        node.exprName = exprName;
        node.typeArguments = typeArguments && parenthesizerRules().parenthesizeTypeArguments(typeArguments);
        node.transformFlags = 1 /* TransformFlags.ContainsTypeScript */;
        return node;
    }
    // @api
    function updateTypeQueryNode(node, exprName, typeArguments) {
        return node.exprName !== exprName
            || node.typeArguments !== typeArguments
            ? update(createTypeQueryNode(exprName, typeArguments), node)
            : node;
    }
    // @api
    function createTypeLiteralNode(members) {
        var node = createBaseDeclaration(186 /* SyntaxKind.TypeLiteral */);
        node.members = createNodeArray(members);
        node.transformFlags = 1 /* TransformFlags.ContainsTypeScript */;
        return node;
    }
    // @api
    function updateTypeLiteralNode(node, members) {
        return node.members !== members
            ? update(createTypeLiteralNode(members), node)
            : node;
    }
    // @api
    function createArrayTypeNode(elementType) {
        var node = createBaseNode(187 /* SyntaxKind.ArrayType */);
        node.elementType = parenthesizerRules().parenthesizeNonArrayTypeOfPostfixType(elementType);
        node.transformFlags = 1 /* TransformFlags.ContainsTypeScript */;
        return node;
    }
    // @api
    function updateArrayTypeNode(node, elementType) {
        return node.elementType !== elementType
            ? update(createArrayTypeNode(elementType), node)
            : node;
    }
    // @api
    function createTupleTypeNode(elements) {
        var node = createBaseNode(188 /* SyntaxKind.TupleType */);
        node.elements = createNodeArray(parenthesizerRules().parenthesizeElementTypesOfTupleType(elements));
        node.transformFlags = 1 /* TransformFlags.ContainsTypeScript */;
        return node;
    }
    // @api
    function updateTupleTypeNode(node, elements) {
        return node.elements !== elements
            ? update(createTupleTypeNode(elements), node)
            : node;
    }
    // @api
    function createNamedTupleMember(dotDotDotToken, name, questionToken, type) {
        var node = createBaseDeclaration(201 /* SyntaxKind.NamedTupleMember */);
        node.dotDotDotToken = dotDotDotToken;
        node.name = name;
        node.questionToken = questionToken;
        node.type = type;
        node.transformFlags = 1 /* TransformFlags.ContainsTypeScript */;
        node.jsDoc = undefined; // initialized by parser (JsDocContainer)
        return node;
    }
    // @api
    function updateNamedTupleMember(node, dotDotDotToken, name, questionToken, type) {
        return node.dotDotDotToken !== dotDotDotToken
            || node.name !== name
            || node.questionToken !== questionToken
            || node.type !== type
            ? update(createNamedTupleMember(dotDotDotToken, name, questionToken, type), node)
            : node;
    }
    // @api
    function createOptionalTypeNode(type) {
        var node = createBaseNode(189 /* SyntaxKind.OptionalType */);
        node.type = parenthesizerRules().parenthesizeTypeOfOptionalType(type);
        node.transformFlags = 1 /* TransformFlags.ContainsTypeScript */;
        return node;
    }
    // @api
    function updateOptionalTypeNode(node, type) {
        return node.type !== type
            ? update(createOptionalTypeNode(type), node)
            : node;
    }
    // @api
    function createRestTypeNode(type) {
        var node = createBaseNode(190 /* SyntaxKind.RestType */);
        node.type = type;
        node.transformFlags = 1 /* TransformFlags.ContainsTypeScript */;
        return node;
    }
    // @api
    function updateRestTypeNode(node, type) {
        return node.type !== type
            ? update(createRestTypeNode(type), node)
            : node;
    }
    function createUnionOrIntersectionTypeNode(kind, types, parenthesize) {
        var node = createBaseNode(kind);
        node.types = factory.createNodeArray(parenthesize(types));
        node.transformFlags = 1 /* TransformFlags.ContainsTypeScript */;
        return node;
    }
    function updateUnionOrIntersectionTypeNode(node, types, parenthesize) {
        return node.types !== types
            ? update(createUnionOrIntersectionTypeNode(node.kind, types, parenthesize), node)
            : node;
    }
    // @api
    function createUnionTypeNode(types) {
        return createUnionOrIntersectionTypeNode(191 /* SyntaxKind.UnionType */, types, parenthesizerRules().parenthesizeConstituentTypesOfUnionType);
    }
    // @api
    function updateUnionTypeNode(node, types) {
        return updateUnionOrIntersectionTypeNode(node, types, parenthesizerRules().parenthesizeConstituentTypesOfUnionType);
    }
    // @api
    function createIntersectionTypeNode(types) {
        return createUnionOrIntersectionTypeNode(192 /* SyntaxKind.IntersectionType */, types, parenthesizerRules().parenthesizeConstituentTypesOfIntersectionType);
    }
    // @api
    function updateIntersectionTypeNode(node, types) {
        return updateUnionOrIntersectionTypeNode(node, types, parenthesizerRules().parenthesizeConstituentTypesOfIntersectionType);
    }
    // @api
    function createConditionalTypeNode(checkType, extendsType, trueType, falseType) {
        var node = createBaseNode(193 /* SyntaxKind.ConditionalType */);
        node.checkType = parenthesizerRules().parenthesizeCheckTypeOfConditionalType(checkType);
        node.extendsType = parenthesizerRules().parenthesizeExtendsTypeOfConditionalType(extendsType);
        node.trueType = trueType;
        node.falseType = falseType;
        node.transformFlags = 1 /* TransformFlags.ContainsTypeScript */;
        node.locals = undefined; // initialized by binder (LocalsContainer)
        node.nextContainer = undefined; // initialized by binder (LocalsContainer)
        return node;
    }
    // @api
    function updateConditionalTypeNode(node, checkType, extendsType, trueType, falseType) {
        return node.checkType !== checkType
            || node.extendsType !== extendsType
            || node.trueType !== trueType
            || node.falseType !== falseType
            ? update(createConditionalTypeNode(checkType, extendsType, trueType, falseType), node)
            : node;
    }
    // @api
    function createInferTypeNode(typeParameter) {
        var node = createBaseNode(194 /* SyntaxKind.InferType */);
        node.typeParameter = typeParameter;
        node.transformFlags = 1 /* TransformFlags.ContainsTypeScript */;
        return node;
    }
    // @api
    function updateInferTypeNode(node, typeParameter) {
        return node.typeParameter !== typeParameter
            ? update(createInferTypeNode(typeParameter), node)
            : node;
    }
    // @api
    function createTemplateLiteralType(head, templateSpans) {
        var node = createBaseNode(202 /* SyntaxKind.TemplateLiteralType */);
        node.head = head;
        node.templateSpans = createNodeArray(templateSpans);
        node.transformFlags = 1 /* TransformFlags.ContainsTypeScript */;
        return node;
    }
    // @api
    function updateTemplateLiteralType(node, head, templateSpans) {
        return node.head !== head
            || node.templateSpans !== templateSpans
            ? update(createTemplateLiteralType(head, templateSpans), node)
            : node;
    }
    // @api
    function createImportTypeNode(argument, assertions, qualifier, typeArguments, isTypeOf) {
        if (isTypeOf === void 0) { isTypeOf = false; }
        var node = createBaseNode(204 /* SyntaxKind.ImportType */);
        node.argument = argument;
        node.assertions = assertions;
        node.qualifier = qualifier;
        node.typeArguments = typeArguments && parenthesizerRules().parenthesizeTypeArguments(typeArguments);
        node.isTypeOf = isTypeOf;
        node.transformFlags = 1 /* TransformFlags.ContainsTypeScript */;
        return node;
    }
    // @api
    function updateImportTypeNode(node, argument, assertions, qualifier, typeArguments, isTypeOf) {
        if (isTypeOf === void 0) { isTypeOf = node.isTypeOf; }
        return node.argument !== argument
            || node.assertions !== assertions
            || node.qualifier !== qualifier
            || node.typeArguments !== typeArguments
            || node.isTypeOf !== isTypeOf
            ? update(createImportTypeNode(argument, assertions, qualifier, typeArguments, isTypeOf), node)
            : node;
    }
    // @api
    function createParenthesizedType(type) {
        var node = createBaseNode(195 /* SyntaxKind.ParenthesizedType */);
        node.type = type;
        node.transformFlags = 1 /* TransformFlags.ContainsTypeScript */;
        return node;
    }
    // @api
    function updateParenthesizedType(node, type) {
        return node.type !== type
            ? update(createParenthesizedType(type), node)
            : node;
    }
    // @api
    function createThisTypeNode() {
        var node = createBaseNode(196 /* SyntaxKind.ThisType */);
        node.transformFlags = 1 /* TransformFlags.ContainsTypeScript */;
        return node;
    }
    // @api
    function createTypeOperatorNode(operator, type) {
        var node = createBaseNode(197 /* SyntaxKind.TypeOperator */);
        node.operator = operator;
        node.type = operator === 148 /* SyntaxKind.ReadonlyKeyword */ ?
            parenthesizerRules().parenthesizeOperandOfReadonlyTypeOperator(type) :
            parenthesizerRules().parenthesizeOperandOfTypeOperator(type);
        node.transformFlags = 1 /* TransformFlags.ContainsTypeScript */;
        return node;
    }
    // @api
    function updateTypeOperatorNode(node, type) {
        return node.type !== type
            ? update(createTypeOperatorNode(node.operator, type), node)
            : node;
    }
    // @api
    function createIndexedAccessTypeNode(objectType, indexType) {
        var node = createBaseNode(198 /* SyntaxKind.IndexedAccessType */);
        node.objectType = parenthesizerRules().parenthesizeNonArrayTypeOfPostfixType(objectType);
        node.indexType = indexType;
        node.transformFlags = 1 /* TransformFlags.ContainsTypeScript */;
        return node;
    }
    // @api
    function updateIndexedAccessTypeNode(node, objectType, indexType) {
        return node.objectType !== objectType
            || node.indexType !== indexType
            ? update(createIndexedAccessTypeNode(objectType, indexType), node)
            : node;
    }
    // @api
    function createMappedTypeNode(readonlyToken, typeParameter, nameType, questionToken, type, members) {
        var node = createBaseDeclaration(199 /* SyntaxKind.MappedType */);
        node.readonlyToken = readonlyToken;
        node.typeParameter = typeParameter;
        node.nameType = nameType;
        node.questionToken = questionToken;
        node.type = type;
        node.members = members && createNodeArray(members);
        node.transformFlags = 1 /* TransformFlags.ContainsTypeScript */;
        node.locals = undefined; // initialized by binder (LocalsContainer)
        node.nextContainer = undefined; // initialized by binder (LocalsContainer)
        return node;
    }
    // @api
    function updateMappedTypeNode(node, readonlyToken, typeParameter, nameType, questionToken, type, members) {
        return node.readonlyToken !== readonlyToken
            || node.typeParameter !== typeParameter
            || node.nameType !== nameType
            || node.questionToken !== questionToken
            || node.type !== type
            || node.members !== members
            ? update(createMappedTypeNode(readonlyToken, typeParameter, nameType, questionToken, type, members), node)
            : node;
    }
    // @api
    function createLiteralTypeNode(literal) {
        var node = createBaseNode(200 /* SyntaxKind.LiteralType */);
        node.literal = literal;
        node.transformFlags = 1 /* TransformFlags.ContainsTypeScript */;
        return node;
    }
    // @api
    function updateLiteralTypeNode(node, literal) {
        return node.literal !== literal
            ? update(createLiteralTypeNode(literal), node)
            : node;
    }
    //
    // Binding Patterns
    //
    // @api
    function createObjectBindingPattern(elements) {
        var node = createBaseNode(205 /* SyntaxKind.ObjectBindingPattern */);
        node.elements = createNodeArray(elements);
        node.transformFlags |=
            propagateChildrenFlags(node.elements) |
                1024 /* TransformFlags.ContainsES2015 */ |
                524288 /* TransformFlags.ContainsBindingPattern */;
        if (node.transformFlags & 32768 /* TransformFlags.ContainsRestOrSpread */) {
            node.transformFlags |=
                128 /* TransformFlags.ContainsES2018 */ |
                    65536 /* TransformFlags.ContainsObjectRestOrSpread */;
        }
        return node;
    }
    // @api
    function updateObjectBindingPattern(node, elements) {
        return node.elements !== elements
            ? update(createObjectBindingPattern(elements), node)
            : node;
    }
    // @api
    function createArrayBindingPattern(elements) {
        var node = createBaseNode(206 /* SyntaxKind.ArrayBindingPattern */);
        node.elements = createNodeArray(elements);
        node.transformFlags |=
            propagateChildrenFlags(node.elements) |
                1024 /* TransformFlags.ContainsES2015 */ |
                524288 /* TransformFlags.ContainsBindingPattern */;
        return node;
    }
    // @api
    function updateArrayBindingPattern(node, elements) {
        return node.elements !== elements
            ? update(createArrayBindingPattern(elements), node)
            : node;
    }
    // @api
    function createBindingElement(dotDotDotToken, propertyName, name, initializer) {
        var node = createBaseDeclaration(207 /* SyntaxKind.BindingElement */);
        node.dotDotDotToken = dotDotDotToken;
        node.propertyName = asName(propertyName);
        node.name = asName(name);
        node.initializer = asInitializer(initializer);
        node.transformFlags |=
            propagateChildFlags(node.dotDotDotToken) |
                propagateNameFlags(node.propertyName) |
                propagateNameFlags(node.name) |
                propagateChildFlags(node.initializer) |
                (node.dotDotDotToken ? 32768 /* TransformFlags.ContainsRestOrSpread */ : 0 /* TransformFlags.None */) |
                1024 /* TransformFlags.ContainsES2015 */;
        node.flowNode = undefined; // initialized by binder (FlowContainer)
        return node;
    }
    // @api
    function updateBindingElement(node, dotDotDotToken, propertyName, name, initializer) {
        return node.propertyName !== propertyName
            || node.dotDotDotToken !== dotDotDotToken
            || node.name !== name
            || node.initializer !== initializer
            ? update(createBindingElement(dotDotDotToken, propertyName, name, initializer), node)
            : node;
    }
    //
    // Expression
    //
    // @api
    function createArrayLiteralExpression(elements, multiLine) {
        var node = createBaseNode(208 /* SyntaxKind.ArrayLiteralExpression */);
        // Ensure we add a trailing comma for something like `[NumericLiteral(1), NumericLiteral(2), OmittedExpresion]` so that
        // we end up with `[1, 2, ,]` instead of `[1, 2, ]` otherwise the `OmittedExpression` will just end up being treated like
        // a trailing comma.
        var lastElement = elements && (0, ts_1.lastOrUndefined)(elements);
        var elementsArray = createNodeArray(elements, lastElement && (0, ts_1.isOmittedExpression)(lastElement) ? true : undefined);
        node.elements = parenthesizerRules().parenthesizeExpressionsOfCommaDelimitedList(elementsArray);
        node.multiLine = multiLine;
        node.transformFlags |= propagateChildrenFlags(node.elements);
        return node;
    }
    // @api
    function updateArrayLiteralExpression(node, elements) {
        return node.elements !== elements
            ? update(createArrayLiteralExpression(elements, node.multiLine), node)
            : node;
    }
    // @api
    function createObjectLiteralExpression(properties, multiLine) {
        var node = createBaseDeclaration(209 /* SyntaxKind.ObjectLiteralExpression */);
        node.properties = createNodeArray(properties);
        node.multiLine = multiLine;
        node.transformFlags |= propagateChildrenFlags(node.properties);
        node.jsDoc = undefined; // initialized by parser (JsDocContainer)
        return node;
    }
    // @api
    function updateObjectLiteralExpression(node, properties) {
        return node.properties !== properties
            ? update(createObjectLiteralExpression(properties, node.multiLine), node)
            : node;
    }
    function createBasePropertyAccessExpression(expression, questionDotToken, name) {
        var node = createBaseDeclaration(210 /* SyntaxKind.PropertyAccessExpression */);
        node.expression = expression;
        node.questionDotToken = questionDotToken;
        node.name = name;
        node.transformFlags =
            propagateChildFlags(node.expression) |
                propagateChildFlags(node.questionDotToken) |
                ((0, ts_1.isIdentifier)(node.name) ?
                    propagateIdentifierNameFlags(node.name) :
                    propagateChildFlags(node.name) | 536870912 /* TransformFlags.ContainsPrivateIdentifierInExpression */);
        node.jsDoc = undefined; // initialized by parser (JsDocContainer)
        node.flowNode = undefined; // initialized by binder (FlowContainer)
        return node;
    }
    // @api
    function createPropertyAccessExpression(expression, name) {
        var node = createBasePropertyAccessExpression(parenthesizerRules().parenthesizeLeftSideOfAccess(expression, /*optionalChain*/ false), 
        /*questionDotToken*/ undefined, asName(name));
        if ((0, ts_1.isSuperKeyword)(expression)) {
            // super method calls require a lexical 'this'
            // super method calls require 'super' hoisting in ES2017 and ES2018 async functions and async generators
            node.transformFlags |=
                256 /* TransformFlags.ContainsES2017 */ |
                    128 /* TransformFlags.ContainsES2018 */;
        }
        return node;
    }
    // @api
    function updatePropertyAccessExpression(node, expression, name) {
        if ((0, ts_1.isPropertyAccessChain)(node)) {
            return updatePropertyAccessChain(node, expression, node.questionDotToken, (0, ts_1.cast)(name, ts_1.isIdentifier));
        }
        return node.expression !== expression
            || node.name !== name
            ? update(createPropertyAccessExpression(expression, name), node)
            : node;
    }
    // @api
    function createPropertyAccessChain(expression, questionDotToken, name) {
        var node = createBasePropertyAccessExpression(parenthesizerRules().parenthesizeLeftSideOfAccess(expression, /*optionalChain*/ true), questionDotToken, asName(name));
        node.flags |= 32 /* NodeFlags.OptionalChain */;
        node.transformFlags |= 32 /* TransformFlags.ContainsES2020 */;
        return node;
    }
    // @api
    function updatePropertyAccessChain(node, expression, questionDotToken, name) {
        ts_1.Debug.assert(!!(node.flags & 32 /* NodeFlags.OptionalChain */), "Cannot update a PropertyAccessExpression using updatePropertyAccessChain. Use updatePropertyAccess instead.");
        // Because we are updating an existing PropertyAccessChain we want to inherit its emitFlags
        // instead of using the default from createPropertyAccess
        return node.expression !== expression
            || node.questionDotToken !== questionDotToken
            || node.name !== name
            ? update(createPropertyAccessChain(expression, questionDotToken, name), node)
            : node;
    }
    function createBaseElementAccessExpression(expression, questionDotToken, argumentExpression) {
        var node = createBaseDeclaration(211 /* SyntaxKind.ElementAccessExpression */);
        node.expression = expression;
        node.questionDotToken = questionDotToken;
        node.argumentExpression = argumentExpression;
        node.transformFlags |=
            propagateChildFlags(node.expression) |
                propagateChildFlags(node.questionDotToken) |
                propagateChildFlags(node.argumentExpression);
        node.jsDoc = undefined; // initialized by parser (JsDocContainer)
        node.flowNode = undefined; // initialized by binder (FlowContainer)
        return node;
    }
    // @api
    function createElementAccessExpression(expression, index) {
        var node = createBaseElementAccessExpression(parenthesizerRules().parenthesizeLeftSideOfAccess(expression, /*optionalChain*/ false), 
        /*questionDotToken*/ undefined, asExpression(index));
        if ((0, ts_1.isSuperKeyword)(expression)) {
            // super method calls require a lexical 'this'
            // super method calls require 'super' hoisting in ES2017 and ES2018 async functions and async generators
            node.transformFlags |=
                256 /* TransformFlags.ContainsES2017 */ |
                    128 /* TransformFlags.ContainsES2018 */;
        }
        return node;
    }
    // @api
    function updateElementAccessExpression(node, expression, argumentExpression) {
        if ((0, ts_1.isElementAccessChain)(node)) {
            return updateElementAccessChain(node, expression, node.questionDotToken, argumentExpression);
        }
        return node.expression !== expression
            || node.argumentExpression !== argumentExpression
            ? update(createElementAccessExpression(expression, argumentExpression), node)
            : node;
    }
    // @api
    function createElementAccessChain(expression, questionDotToken, index) {
        var node = createBaseElementAccessExpression(parenthesizerRules().parenthesizeLeftSideOfAccess(expression, /*optionalChain*/ true), questionDotToken, asExpression(index));
        node.flags |= 32 /* NodeFlags.OptionalChain */;
        node.transformFlags |= 32 /* TransformFlags.ContainsES2020 */;
        return node;
    }
    // @api
    function updateElementAccessChain(node, expression, questionDotToken, argumentExpression) {
        ts_1.Debug.assert(!!(node.flags & 32 /* NodeFlags.OptionalChain */), "Cannot update a ElementAccessExpression using updateElementAccessChain. Use updateElementAccess instead.");
        // Because we are updating an existing ElementAccessChain we want to inherit its emitFlags
        // instead of using the default from createElementAccess
        return node.expression !== expression
            || node.questionDotToken !== questionDotToken
            || node.argumentExpression !== argumentExpression
            ? update(createElementAccessChain(expression, questionDotToken, argumentExpression), node)
            : node;
    }
    function createBaseCallExpression(expression, questionDotToken, typeArguments, argumentsArray) {
        var node = createBaseDeclaration(212 /* SyntaxKind.CallExpression */);
        node.expression = expression;
        node.questionDotToken = questionDotToken;
        node.typeArguments = typeArguments;
        node.arguments = argumentsArray;
        node.transformFlags |=
            propagateChildFlags(node.expression) |
                propagateChildFlags(node.questionDotToken) |
                propagateChildrenFlags(node.typeArguments) |
                propagateChildrenFlags(node.arguments);
        if (node.typeArguments) {
            node.transformFlags |= 1 /* TransformFlags.ContainsTypeScript */;
        }
        if ((0, ts_1.isSuperProperty)(node.expression)) {
            node.transformFlags |= 16384 /* TransformFlags.ContainsLexicalThis */;
        }
        return node;
    }
    // @api
    function createCallExpression(expression, typeArguments, argumentsArray) {
        var node = createBaseCallExpression(parenthesizerRules().parenthesizeLeftSideOfAccess(expression, /*optionalChain*/ false), 
        /*questionDotToken*/ undefined, asNodeArray(typeArguments), parenthesizerRules().parenthesizeExpressionsOfCommaDelimitedList(createNodeArray(argumentsArray)));
        if ((0, ts_1.isImportKeyword)(node.expression)) {
            node.transformFlags |= 8388608 /* TransformFlags.ContainsDynamicImport */;
        }
        return node;
    }
    // @api
    function updateCallExpression(node, expression, typeArguments, argumentsArray) {
        if ((0, ts_1.isCallChain)(node)) {
            return updateCallChain(node, expression, node.questionDotToken, typeArguments, argumentsArray);
        }
        return node.expression !== expression
            || node.typeArguments !== typeArguments
            || node.arguments !== argumentsArray
            ? update(createCallExpression(expression, typeArguments, argumentsArray), node)
            : node;
    }
    // @api
    function createCallChain(expression, questionDotToken, typeArguments, argumentsArray) {
        var node = createBaseCallExpression(parenthesizerRules().parenthesizeLeftSideOfAccess(expression, /*optionalChain*/ true), questionDotToken, asNodeArray(typeArguments), parenthesizerRules().parenthesizeExpressionsOfCommaDelimitedList(createNodeArray(argumentsArray)));
        node.flags |= 32 /* NodeFlags.OptionalChain */;
        node.transformFlags |= 32 /* TransformFlags.ContainsES2020 */;
        return node;
    }
    // @api
    function updateCallChain(node, expression, questionDotToken, typeArguments, argumentsArray) {
        ts_1.Debug.assert(!!(node.flags & 32 /* NodeFlags.OptionalChain */), "Cannot update a CallExpression using updateCallChain. Use updateCall instead.");
        return node.expression !== expression
            || node.questionDotToken !== questionDotToken
            || node.typeArguments !== typeArguments
            || node.arguments !== argumentsArray
            ? update(createCallChain(expression, questionDotToken, typeArguments, argumentsArray), node)
            : node;
    }
    // @api
    function createNewExpression(expression, typeArguments, argumentsArray) {
        var node = createBaseDeclaration(213 /* SyntaxKind.NewExpression */);
        node.expression = parenthesizerRules().parenthesizeExpressionOfNew(expression);
        node.typeArguments = asNodeArray(typeArguments);
        node.arguments = argumentsArray ? parenthesizerRules().parenthesizeExpressionsOfCommaDelimitedList(argumentsArray) : undefined;
        node.transformFlags |=
            propagateChildFlags(node.expression) |
                propagateChildrenFlags(node.typeArguments) |
                propagateChildrenFlags(node.arguments) |
                32 /* TransformFlags.ContainsES2020 */;
        if (node.typeArguments) {
            node.transformFlags |= 1 /* TransformFlags.ContainsTypeScript */;
        }
        return node;
    }
    // @api
    function updateNewExpression(node, expression, typeArguments, argumentsArray) {
        return node.expression !== expression
            || node.typeArguments !== typeArguments
            || node.arguments !== argumentsArray
            ? update(createNewExpression(expression, typeArguments, argumentsArray), node)
            : node;
    }
    // @api
    function createTaggedTemplateExpression(tag, typeArguments, template) {
        var node = createBaseNode(214 /* SyntaxKind.TaggedTemplateExpression */);
        node.tag = parenthesizerRules().parenthesizeLeftSideOfAccess(tag, /*optionalChain*/ false);
        node.typeArguments = asNodeArray(typeArguments);
        node.template = template;
        node.transformFlags |=
            propagateChildFlags(node.tag) |
                propagateChildrenFlags(node.typeArguments) |
                propagateChildFlags(node.template) |
                1024 /* TransformFlags.ContainsES2015 */;
        if (node.typeArguments) {
            node.transformFlags |= 1 /* TransformFlags.ContainsTypeScript */;
        }
        if ((0, ts_1.hasInvalidEscape)(node.template)) {
            node.transformFlags |= 128 /* TransformFlags.ContainsES2018 */;
        }
        return node;
    }
    // @api
    function updateTaggedTemplateExpression(node, tag, typeArguments, template) {
        return node.tag !== tag
            || node.typeArguments !== typeArguments
            || node.template !== template
            ? update(createTaggedTemplateExpression(tag, typeArguments, template), node)
            : node;
    }
    // @api
    function createTypeAssertion(type, expression) {
        var node = createBaseNode(215 /* SyntaxKind.TypeAssertionExpression */);
        node.expression = parenthesizerRules().parenthesizeOperandOfPrefixUnary(expression);
        node.type = type;
        node.transformFlags |=
            propagateChildFlags(node.expression) |
                propagateChildFlags(node.type) |
                1 /* TransformFlags.ContainsTypeScript */;
        return node;
    }
    // @api
    function updateTypeAssertion(node, type, expression) {
        return node.type !== type
            || node.expression !== expression
            ? update(createTypeAssertion(type, expression), node)
            : node;
    }
    // @api
    function createParenthesizedExpression(expression) {
        var node = createBaseNode(216 /* SyntaxKind.ParenthesizedExpression */);
        node.expression = expression;
        node.transformFlags = propagateChildFlags(node.expression);
        node.jsDoc = undefined; // initialized by parser (JsDocContainer)
        return node;
    }
    // @api
    function updateParenthesizedExpression(node, expression) {
        return node.expression !== expression
            ? update(createParenthesizedExpression(expression), node)
            : node;
    }
    // @api
    function createFunctionExpression(modifiers, asteriskToken, name, typeParameters, parameters, type, body) {
        var node = createBaseDeclaration(217 /* SyntaxKind.FunctionExpression */);
        node.modifiers = asNodeArray(modifiers);
        node.asteriskToken = asteriskToken;
        node.name = asName(name);
        node.typeParameters = asNodeArray(typeParameters);
        node.parameters = createNodeArray(parameters);
        node.type = type;
        node.body = body;
        var isAsync = (0, ts_1.modifiersToFlags)(node.modifiers) & 512 /* ModifierFlags.Async */;
        var isGenerator = !!node.asteriskToken;
        var isAsyncGenerator = isAsync && isGenerator;
        node.transformFlags =
            propagateChildrenFlags(node.modifiers) |
                propagateChildFlags(node.asteriskToken) |
                propagateNameFlags(node.name) |
                propagateChildrenFlags(node.typeParameters) |
                propagateChildrenFlags(node.parameters) |
                propagateChildFlags(node.type) |
                (propagateChildFlags(node.body) & ~67108864 /* TransformFlags.ContainsPossibleTopLevelAwait */) |
                (isAsyncGenerator ? 128 /* TransformFlags.ContainsES2018 */ :
                    isAsync ? 256 /* TransformFlags.ContainsES2017 */ :
                        isGenerator ? 2048 /* TransformFlags.ContainsGenerator */ :
                            0 /* TransformFlags.None */) |
                (node.typeParameters || node.type ? 1 /* TransformFlags.ContainsTypeScript */ : 0 /* TransformFlags.None */) |
                4194304 /* TransformFlags.ContainsHoistedDeclarationOrCompletion */;
        node.typeArguments = undefined; // used in quick info
        node.jsDoc = undefined; // initialized by parser (JsDocContainer)
        node.locals = undefined; // initialized by binder (LocalsContainer)
        node.nextContainer = undefined; // initialized by binder (LocalsContainer)
        node.flowNode = undefined; // initialized by binder (FlowContainer)
        node.endFlowNode = undefined;
        node.returnFlowNode = undefined;
        return node;
    }
    // @api
    function updateFunctionExpression(node, modifiers, asteriskToken, name, typeParameters, parameters, type, body) {
        return node.name !== name
            || node.modifiers !== modifiers
            || node.asteriskToken !== asteriskToken
            || node.typeParameters !== typeParameters
            || node.parameters !== parameters
            || node.type !== type
            || node.body !== body
            ? finishUpdateBaseSignatureDeclaration(createFunctionExpression(modifiers, asteriskToken, name, typeParameters, parameters, type, body), node)
            : node;
    }
    // @api
    function createArrowFunction(modifiers, typeParameters, parameters, type, equalsGreaterThanToken, body) {
        var node = createBaseDeclaration(218 /* SyntaxKind.ArrowFunction */);
        node.modifiers = asNodeArray(modifiers);
        node.typeParameters = asNodeArray(typeParameters);
        node.parameters = createNodeArray(parameters);
        node.type = type;
        node.equalsGreaterThanToken = equalsGreaterThanToken !== null && equalsGreaterThanToken !== void 0 ? equalsGreaterThanToken : createToken(39 /* SyntaxKind.EqualsGreaterThanToken */);
        node.body = parenthesizerRules().parenthesizeConciseBodyOfArrowFunction(body);
        var isAsync = (0, ts_1.modifiersToFlags)(node.modifiers) & 512 /* ModifierFlags.Async */;
        node.transformFlags =
            propagateChildrenFlags(node.modifiers) |
                propagateChildrenFlags(node.typeParameters) |
                propagateChildrenFlags(node.parameters) |
                propagateChildFlags(node.type) |
                propagateChildFlags(node.equalsGreaterThanToken) |
                (propagateChildFlags(node.body) & ~67108864 /* TransformFlags.ContainsPossibleTopLevelAwait */) |
                (node.typeParameters || node.type ? 1 /* TransformFlags.ContainsTypeScript */ : 0 /* TransformFlags.None */) |
                (isAsync ? 256 /* TransformFlags.ContainsES2017 */ | 16384 /* TransformFlags.ContainsLexicalThis */ : 0 /* TransformFlags.None */) |
                1024 /* TransformFlags.ContainsES2015 */;
        node.typeArguments = undefined; // used in quick info
        node.jsDoc = undefined; // initialized by parser (JsDocContainer)
        node.locals = undefined; // initialized by binder (LocalsContainer)
        node.nextContainer = undefined; // initialized by binder (LocalsContainer)
        node.flowNode = undefined; // initialized by binder (FlowContainer)
        node.endFlowNode = undefined;
        node.returnFlowNode = undefined;
        return node;
    }
    // @api
    function updateArrowFunction(node, modifiers, typeParameters, parameters, type, equalsGreaterThanToken, body) {
        return node.modifiers !== modifiers
            || node.typeParameters !== typeParameters
            || node.parameters !== parameters
            || node.type !== type
            || node.equalsGreaterThanToken !== equalsGreaterThanToken
            || node.body !== body
            ? finishUpdateBaseSignatureDeclaration(createArrowFunction(modifiers, typeParameters, parameters, type, equalsGreaterThanToken, body), node)
            : node;
    }
    // @api
    function createDeleteExpression(expression) {
        var node = createBaseNode(219 /* SyntaxKind.DeleteExpression */);
        node.expression = parenthesizerRules().parenthesizeOperandOfPrefixUnary(expression);
        node.transformFlags |= propagateChildFlags(node.expression);
        return node;
    }
    // @api
    function updateDeleteExpression(node, expression) {
        return node.expression !== expression
            ? update(createDeleteExpression(expression), node)
            : node;
    }
    // @api
    function createTypeOfExpression(expression) {
        var node = createBaseNode(220 /* SyntaxKind.TypeOfExpression */);
        node.expression = parenthesizerRules().parenthesizeOperandOfPrefixUnary(expression);
        node.transformFlags |= propagateChildFlags(node.expression);
        return node;
    }
    // @api
    function updateTypeOfExpression(node, expression) {
        return node.expression !== expression
            ? update(createTypeOfExpression(expression), node)
            : node;
    }
    // @api
    function createVoidExpression(expression) {
        var node = createBaseNode(221 /* SyntaxKind.VoidExpression */);
        node.expression = parenthesizerRules().parenthesizeOperandOfPrefixUnary(expression);
        node.transformFlags |= propagateChildFlags(node.expression);
        return node;
    }
    // @api
    function updateVoidExpression(node, expression) {
        return node.expression !== expression
            ? update(createVoidExpression(expression), node)
            : node;
    }
    // @api
    function createAwaitExpression(expression) {
        var node = createBaseNode(222 /* SyntaxKind.AwaitExpression */);
        node.expression = parenthesizerRules().parenthesizeOperandOfPrefixUnary(expression);
        node.transformFlags |=
            propagateChildFlags(node.expression) |
                256 /* TransformFlags.ContainsES2017 */ |
                128 /* TransformFlags.ContainsES2018 */ |
                2097152 /* TransformFlags.ContainsAwait */;
        return node;
    }
    // @api
    function updateAwaitExpression(node, expression) {
        return node.expression !== expression
            ? update(createAwaitExpression(expression), node)
            : node;
    }
    // @api
    function createPrefixUnaryExpression(operator, operand) {
        var node = createBaseNode(223 /* SyntaxKind.PrefixUnaryExpression */);
        node.operator = operator;
        node.operand = parenthesizerRules().parenthesizeOperandOfPrefixUnary(operand);
        node.transformFlags |= propagateChildFlags(node.operand);
        // Only set this flag for non-generated identifiers and non-"local" names. See the
        // comment in `visitPreOrPostfixUnaryExpression` in module.ts
        if ((operator === 46 /* SyntaxKind.PlusPlusToken */ || operator === 47 /* SyntaxKind.MinusMinusToken */) &&
            (0, ts_1.isIdentifier)(node.operand) &&
            !(0, ts_1.isGeneratedIdentifier)(node.operand) &&
            !(0, ts_1.isLocalName)(node.operand)) {
            node.transformFlags |= 268435456 /* TransformFlags.ContainsUpdateExpressionForIdentifier */;
        }
        return node;
    }
    // @api
    function updatePrefixUnaryExpression(node, operand) {
        return node.operand !== operand
            ? update(createPrefixUnaryExpression(node.operator, operand), node)
            : node;
    }
    // @api
    function createPostfixUnaryExpression(operand, operator) {
        var node = createBaseNode(224 /* SyntaxKind.PostfixUnaryExpression */);
        node.operator = operator;
        node.operand = parenthesizerRules().parenthesizeOperandOfPostfixUnary(operand);
        node.transformFlags |= propagateChildFlags(node.operand);
        // Only set this flag for non-generated identifiers and non-"local" names. See the
        // comment in `visitPreOrPostfixUnaryExpression` in module.ts
        if ((0, ts_1.isIdentifier)(node.operand) &&
            !(0, ts_1.isGeneratedIdentifier)(node.operand) &&
            !(0, ts_1.isLocalName)(node.operand)) {
            node.transformFlags |= 268435456 /* TransformFlags.ContainsUpdateExpressionForIdentifier */;
        }
        return node;
    }
    // @api
    function updatePostfixUnaryExpression(node, operand) {
        return node.operand !== operand
            ? update(createPostfixUnaryExpression(operand, node.operator), node)
            : node;
    }
    // @api
    function createBinaryExpression(left, operator, right) {
        var node = createBaseDeclaration(225 /* SyntaxKind.BinaryExpression */);
        var operatorToken = asToken(operator);
        var operatorKind = operatorToken.kind;
        node.left = parenthesizerRules().parenthesizeLeftSideOfBinary(operatorKind, left);
        node.operatorToken = operatorToken;
        node.right = parenthesizerRules().parenthesizeRightSideOfBinary(operatorKind, node.left, right);
        node.transformFlags |=
            propagateChildFlags(node.left) |
                propagateChildFlags(node.operatorToken) |
                propagateChildFlags(node.right);
        if (operatorKind === 61 /* SyntaxKind.QuestionQuestionToken */) {
            node.transformFlags |= 32 /* TransformFlags.ContainsES2020 */;
        }
        else if (operatorKind === 64 /* SyntaxKind.EqualsToken */) {
            if ((0, ts_1.isObjectLiteralExpression)(node.left)) {
                node.transformFlags |=
                    1024 /* TransformFlags.ContainsES2015 */ |
                        128 /* TransformFlags.ContainsES2018 */ |
                        4096 /* TransformFlags.ContainsDestructuringAssignment */ |
                        propagateAssignmentPatternFlags(node.left);
            }
            else if ((0, ts_1.isArrayLiteralExpression)(node.left)) {
                node.transformFlags |=
                    1024 /* TransformFlags.ContainsES2015 */ |
                        4096 /* TransformFlags.ContainsDestructuringAssignment */ |
                        propagateAssignmentPatternFlags(node.left);
            }
        }
        else if (operatorKind === 43 /* SyntaxKind.AsteriskAsteriskToken */ || operatorKind === 68 /* SyntaxKind.AsteriskAsteriskEqualsToken */) {
            node.transformFlags |= 512 /* TransformFlags.ContainsES2016 */;
        }
        else if ((0, ts_1.isLogicalOrCoalescingAssignmentOperator)(operatorKind)) {
            node.transformFlags |= 16 /* TransformFlags.ContainsES2021 */;
        }
        if (operatorKind === 103 /* SyntaxKind.InKeyword */ && (0, ts_1.isPrivateIdentifier)(node.left)) {
            node.transformFlags |= 536870912 /* TransformFlags.ContainsPrivateIdentifierInExpression */;
        }
        node.jsDoc = undefined; // initialized by parser (JsDocContainer)
        return node;
    }
    function propagateAssignmentPatternFlags(node) {
        return (0, ts_1.containsObjectRestOrSpread)(node) ? 65536 /* TransformFlags.ContainsObjectRestOrSpread */ : 0 /* TransformFlags.None */;
    }
    // @api
    function updateBinaryExpression(node, left, operator, right) {
        return node.left !== left
            || node.operatorToken !== operator
            || node.right !== right
            ? update(createBinaryExpression(left, operator, right), node)
            : node;
    }
    // @api
    function createConditionalExpression(condition, questionToken, whenTrue, colonToken, whenFalse) {
        var node = createBaseNode(226 /* SyntaxKind.ConditionalExpression */);
        node.condition = parenthesizerRules().parenthesizeConditionOfConditionalExpression(condition);
        node.questionToken = questionToken !== null && questionToken !== void 0 ? questionToken : createToken(58 /* SyntaxKind.QuestionToken */);
        node.whenTrue = parenthesizerRules().parenthesizeBranchOfConditionalExpression(whenTrue);
        node.colonToken = colonToken !== null && colonToken !== void 0 ? colonToken : createToken(59 /* SyntaxKind.ColonToken */);
        node.whenFalse = parenthesizerRules().parenthesizeBranchOfConditionalExpression(whenFalse);
        node.transformFlags |=
            propagateChildFlags(node.condition) |
                propagateChildFlags(node.questionToken) |
                propagateChildFlags(node.whenTrue) |
                propagateChildFlags(node.colonToken) |
                propagateChildFlags(node.whenFalse);
        return node;
    }
    // @api
    function updateConditionalExpression(node, condition, questionToken, whenTrue, colonToken, whenFalse) {
        return node.condition !== condition
            || node.questionToken !== questionToken
            || node.whenTrue !== whenTrue
            || node.colonToken !== colonToken
            || node.whenFalse !== whenFalse
            ? update(createConditionalExpression(condition, questionToken, whenTrue, colonToken, whenFalse), node)
            : node;
    }
    // @api
    function createTemplateExpression(head, templateSpans) {
        var node = createBaseNode(227 /* SyntaxKind.TemplateExpression */);
        node.head = head;
        node.templateSpans = createNodeArray(templateSpans);
        node.transformFlags |=
            propagateChildFlags(node.head) |
                propagateChildrenFlags(node.templateSpans) |
                1024 /* TransformFlags.ContainsES2015 */;
        return node;
    }
    // @api
    function updateTemplateExpression(node, head, templateSpans) {
        return node.head !== head
            || node.templateSpans !== templateSpans
            ? update(createTemplateExpression(head, templateSpans), node)
            : node;
    }
    function checkTemplateLiteralLikeNode(kind, text, rawText, templateFlags) {
        if (templateFlags === void 0) { templateFlags = 0 /* TokenFlags.None */; }
        ts_1.Debug.assert(!(templateFlags & ~7176 /* TokenFlags.TemplateLiteralLikeFlags */), "Unsupported template flags.");
        // NOTE: without the assignment to `undefined`, we don't narrow the initial type of `cooked`.
        // eslint-disable-next-line no-undef-init
        var cooked = undefined;
        if (rawText !== undefined && rawText !== text) {
            cooked = getCookedText(kind, rawText);
            if (typeof cooked === "object") {
                return ts_1.Debug.fail("Invalid raw text");
            }
        }
        if (text === undefined) {
            if (cooked === undefined) {
                return ts_1.Debug.fail("Arguments 'text' and 'rawText' may not both be undefined.");
            }
            text = cooked;
        }
        else if (cooked !== undefined) {
            ts_1.Debug.assert(text === cooked, "Expected argument 'text' to be the normalized (i.e. 'cooked') version of argument 'rawText'.");
        }
        return text;
    }
    function getTransformFlagsOfTemplateLiteralLike(templateFlags) {
        var transformFlags = 1024 /* TransformFlags.ContainsES2015 */;
        if (templateFlags) {
            transformFlags |= 128 /* TransformFlags.ContainsES2018 */;
        }
        return transformFlags;
    }
    // NOTE: `createTemplateLiteralLikeToken` and `createTemplateLiteralLikeDeclaration` are identical except for
    //       the underlying nodes they create. To avoid polymorphism due to two different node shapes, these
    //       functions are intentionally duplicated.
    function createTemplateLiteralLikeToken(kind, text, rawText, templateFlags) {
        var node = createBaseToken(kind);
        node.text = text;
        node.rawText = rawText;
        node.templateFlags = templateFlags & 7176 /* TokenFlags.TemplateLiteralLikeFlags */;
        node.transformFlags = getTransformFlagsOfTemplateLiteralLike(node.templateFlags);
        return node;
    }
    function createTemplateLiteralLikeDeclaration(kind, text, rawText, templateFlags) {
        var node = createBaseDeclaration(kind);
        node.text = text;
        node.rawText = rawText;
        node.templateFlags = templateFlags & 7176 /* TokenFlags.TemplateLiteralLikeFlags */;
        node.transformFlags = getTransformFlagsOfTemplateLiteralLike(node.templateFlags);
        return node;
    }
    // @api
    function createTemplateLiteralLikeNode(kind, text, rawText, templateFlags) {
        if (kind === 15 /* SyntaxKind.NoSubstitutionTemplateLiteral */) {
            return createTemplateLiteralLikeDeclaration(kind, text, rawText, templateFlags);
        }
        return createTemplateLiteralLikeToken(kind, text, rawText, templateFlags);
    }
    // @api
    function createTemplateHead(text, rawText, templateFlags) {
        text = checkTemplateLiteralLikeNode(16 /* SyntaxKind.TemplateHead */, text, rawText, templateFlags);
        return createTemplateLiteralLikeNode(16 /* SyntaxKind.TemplateHead */, text, rawText, templateFlags);
    }
    // @api
    function createTemplateMiddle(text, rawText, templateFlags) {
        text = checkTemplateLiteralLikeNode(16 /* SyntaxKind.TemplateHead */, text, rawText, templateFlags);
        return createTemplateLiteralLikeNode(17 /* SyntaxKind.TemplateMiddle */, text, rawText, templateFlags);
    }
    // @api
    function createTemplateTail(text, rawText, templateFlags) {
        text = checkTemplateLiteralLikeNode(16 /* SyntaxKind.TemplateHead */, text, rawText, templateFlags);
        return createTemplateLiteralLikeNode(18 /* SyntaxKind.TemplateTail */, text, rawText, templateFlags);
    }
    // @api
    function createNoSubstitutionTemplateLiteral(text, rawText, templateFlags) {
        text = checkTemplateLiteralLikeNode(16 /* SyntaxKind.TemplateHead */, text, rawText, templateFlags);
        return createTemplateLiteralLikeDeclaration(15 /* SyntaxKind.NoSubstitutionTemplateLiteral */, text, rawText, templateFlags);
    }
    // @api
    function createYieldExpression(asteriskToken, expression) {
        ts_1.Debug.assert(!asteriskToken || !!expression, "A `YieldExpression` with an asteriskToken must have an expression.");
        var node = createBaseNode(228 /* SyntaxKind.YieldExpression */);
        node.expression = expression && parenthesizerRules().parenthesizeExpressionForDisallowedComma(expression);
        node.asteriskToken = asteriskToken;
        node.transformFlags |=
            propagateChildFlags(node.expression) |
                propagateChildFlags(node.asteriskToken) |
                1024 /* TransformFlags.ContainsES2015 */ |
                128 /* TransformFlags.ContainsES2018 */ |
                1048576 /* TransformFlags.ContainsYield */;
        return node;
    }
    // @api
    function updateYieldExpression(node, asteriskToken, expression) {
        return node.expression !== expression
            || node.asteriskToken !== asteriskToken
            ? update(createYieldExpression(asteriskToken, expression), node)
            : node;
    }
    // @api
    function createSpreadElement(expression) {
        var node = createBaseNode(229 /* SyntaxKind.SpreadElement */);
        node.expression = parenthesizerRules().parenthesizeExpressionForDisallowedComma(expression);
        node.transformFlags |=
            propagateChildFlags(node.expression) |
                1024 /* TransformFlags.ContainsES2015 */ |
                32768 /* TransformFlags.ContainsRestOrSpread */;
        return node;
    }
    // @api
    function updateSpreadElement(node, expression) {
        return node.expression !== expression
            ? update(createSpreadElement(expression), node)
            : node;
    }
    // @api
    function createClassExpression(modifiers, name, typeParameters, heritageClauses, members) {
        var node = createBaseDeclaration(230 /* SyntaxKind.ClassExpression */);
        node.modifiers = asNodeArray(modifiers);
        node.name = asName(name);
        node.typeParameters = asNodeArray(typeParameters);
        node.heritageClauses = asNodeArray(heritageClauses);
        node.members = createNodeArray(members);
        node.transformFlags |=
            propagateChildrenFlags(node.modifiers) |
                propagateNameFlags(node.name) |
                propagateChildrenFlags(node.typeParameters) |
                propagateChildrenFlags(node.heritageClauses) |
                propagateChildrenFlags(node.members) |
                (node.typeParameters ? 1 /* TransformFlags.ContainsTypeScript */ : 0 /* TransformFlags.None */) |
                1024 /* TransformFlags.ContainsES2015 */;
        node.jsDoc = undefined; // initialized by parser (JsDocContainer)
        return node;
    }
    // @api
    function updateClassExpression(node, modifiers, name, typeParameters, heritageClauses, members) {
        return node.modifiers !== modifiers
            || node.name !== name
            || node.typeParameters !== typeParameters
            || node.heritageClauses !== heritageClauses
            || node.members !== members
            ? update(createClassExpression(modifiers, name, typeParameters, heritageClauses, members), node)
            : node;
    }
    // @api
    function createOmittedExpression() {
        return createBaseNode(231 /* SyntaxKind.OmittedExpression */);
    }
    // @api
    function createExpressionWithTypeArguments(expression, typeArguments) {
        var node = createBaseNode(232 /* SyntaxKind.ExpressionWithTypeArguments */);
        node.expression = parenthesizerRules().parenthesizeLeftSideOfAccess(expression, /*optionalChain*/ false);
        node.typeArguments = typeArguments && parenthesizerRules().parenthesizeTypeArguments(typeArguments);
        node.transformFlags |=
            propagateChildFlags(node.expression) |
                propagateChildrenFlags(node.typeArguments) |
                1024 /* TransformFlags.ContainsES2015 */;
        return node;
    }
    // @api
    function updateExpressionWithTypeArguments(node, expression, typeArguments) {
        return node.expression !== expression
            || node.typeArguments !== typeArguments
            ? update(createExpressionWithTypeArguments(expression, typeArguments), node)
            : node;
    }
    // @api
    function createAsExpression(expression, type) {
        var node = createBaseNode(233 /* SyntaxKind.AsExpression */);
        node.expression = expression;
        node.type = type;
        node.transformFlags |=
            propagateChildFlags(node.expression) |
                propagateChildFlags(node.type) |
                1 /* TransformFlags.ContainsTypeScript */;
        return node;
    }
    // @api
    function updateAsExpression(node, expression, type) {
        return node.expression !== expression
            || node.type !== type
            ? update(createAsExpression(expression, type), node)
            : node;
    }
    // @api
    function createNonNullExpression(expression) {
        var node = createBaseNode(234 /* SyntaxKind.NonNullExpression */);
        node.expression = parenthesizerRules().parenthesizeLeftSideOfAccess(expression, /*optionalChain*/ false);
        node.transformFlags |=
            propagateChildFlags(node.expression) |
                1 /* TransformFlags.ContainsTypeScript */;
        return node;
    }
    // @api
    function updateNonNullExpression(node, expression) {
        if ((0, ts_1.isNonNullChain)(node)) {
            return updateNonNullChain(node, expression);
        }
        return node.expression !== expression
            ? update(createNonNullExpression(expression), node)
            : node;
    }
    // @api
    function createSatisfiesExpression(expression, type) {
        var node = createBaseNode(237 /* SyntaxKind.SatisfiesExpression */);
        node.expression = expression;
        node.type = type;
        node.transformFlags |=
            propagateChildFlags(node.expression) |
                propagateChildFlags(node.type) |
                1 /* TransformFlags.ContainsTypeScript */;
        return node;
    }
    // @api
    function updateSatisfiesExpression(node, expression, type) {
        return node.expression !== expression
            || node.type !== type
            ? update(createSatisfiesExpression(expression, type), node)
            : node;
    }
    // @api
    function createNonNullChain(expression) {
        var node = createBaseNode(234 /* SyntaxKind.NonNullExpression */);
        node.flags |= 32 /* NodeFlags.OptionalChain */;
        node.expression = parenthesizerRules().parenthesizeLeftSideOfAccess(expression, /*optionalChain*/ true);
        node.transformFlags |=
            propagateChildFlags(node.expression) |
                1 /* TransformFlags.ContainsTypeScript */;
        return node;
    }
    // @api
    function updateNonNullChain(node, expression) {
        ts_1.Debug.assert(!!(node.flags & 32 /* NodeFlags.OptionalChain */), "Cannot update a NonNullExpression using updateNonNullChain. Use updateNonNullExpression instead.");
        return node.expression !== expression
            ? update(createNonNullChain(expression), node)
            : node;
    }
    // @api
    function createMetaProperty(keywordToken, name) {
        var node = createBaseNode(235 /* SyntaxKind.MetaProperty */);
        node.keywordToken = keywordToken;
        node.name = name;
        node.transformFlags |= propagateChildFlags(node.name);
        switch (keywordToken) {
            case 105 /* SyntaxKind.NewKeyword */:
                node.transformFlags |= 1024 /* TransformFlags.ContainsES2015 */;
                break;
            case 102 /* SyntaxKind.ImportKeyword */:
                node.transformFlags |= 32 /* TransformFlags.ContainsES2020 */;
                break;
            default:
                return ts_1.Debug.assertNever(keywordToken);
        }
        node.flowNode = undefined; // initialized by binder (FlowContainer)
        return node;
    }
    // @api
    function updateMetaProperty(node, name) {
        return node.name !== name
            ? update(createMetaProperty(node.keywordToken, name), node)
            : node;
    }
    //
    // Misc
    //
    // @api
    function createTemplateSpan(expression, literal) {
        var node = createBaseNode(238 /* SyntaxKind.TemplateSpan */);
        node.expression = expression;
        node.literal = literal;
        node.transformFlags |=
            propagateChildFlags(node.expression) |
                propagateChildFlags(node.literal) |
                1024 /* TransformFlags.ContainsES2015 */;
        return node;
    }
    // @api
    function updateTemplateSpan(node, expression, literal) {
        return node.expression !== expression
            || node.literal !== literal
            ? update(createTemplateSpan(expression, literal), node)
            : node;
    }
    // @api
    function createSemicolonClassElement() {
        var node = createBaseNode(239 /* SyntaxKind.SemicolonClassElement */);
        node.transformFlags |= 1024 /* TransformFlags.ContainsES2015 */;
        return node;
    }
    //
    // Element
    //
    // @api
    function createBlock(statements, multiLine) {
        var node = createBaseNode(240 /* SyntaxKind.Block */);
        node.statements = createNodeArray(statements);
        node.multiLine = multiLine;
        node.transformFlags |= propagateChildrenFlags(node.statements);
        node.jsDoc = undefined; // initialized by parser (JsDocContainer)
        node.locals = undefined; // initialized by binder (LocalsContainer)
        node.nextContainer = undefined; // initialized by binder (LocalsContainer)
        return node;
    }
    // @api
    function updateBlock(node, statements) {
        return node.statements !== statements
            ? update(createBlock(statements, node.multiLine), node)
            : node;
    }
    // @api
    function createVariableStatement(modifiers, declarationList) {
        var node = createBaseNode(242 /* SyntaxKind.VariableStatement */);
        node.modifiers = asNodeArray(modifiers);
        node.declarationList = (0, ts_1.isArray)(declarationList) ? createVariableDeclarationList(declarationList) : declarationList;
        node.transformFlags |=
            propagateChildrenFlags(node.modifiers) |
                propagateChildFlags(node.declarationList);
        if ((0, ts_1.modifiersToFlags)(node.modifiers) & 2 /* ModifierFlags.Ambient */) {
            node.transformFlags = 1 /* TransformFlags.ContainsTypeScript */;
        }
        node.jsDoc = undefined; // initialized by parser (JsDocContainer)
        node.flowNode = undefined; // initialized by binder (FlowContainer)
        return node;
    }
    // @api
    function updateVariableStatement(node, modifiers, declarationList) {
        return node.modifiers !== modifiers
            || node.declarationList !== declarationList
            ? update(createVariableStatement(modifiers, declarationList), node)
            : node;
    }
    // @api
    function createEmptyStatement() {
        var node = createBaseNode(241 /* SyntaxKind.EmptyStatement */);
        node.jsDoc = undefined; // initialized by parser (JsDocContainer)
        return node;
    }
    // @api
    function createExpressionStatement(expression) {
        var node = createBaseNode(243 /* SyntaxKind.ExpressionStatement */);
        node.expression = parenthesizerRules().parenthesizeExpressionOfExpressionStatement(expression);
        node.transformFlags |= propagateChildFlags(node.expression);
        node.jsDoc = undefined; // initialized by parser (JsDocContainer)
        node.flowNode = undefined; // initialized by binder (FlowContainer)
        return node;
    }
    // @api
    function updateExpressionStatement(node, expression) {
        return node.expression !== expression
            ? update(createExpressionStatement(expression), node)
            : node;
    }
    // @api
    function createIfStatement(expression, thenStatement, elseStatement) {
        var node = createBaseNode(244 /* SyntaxKind.IfStatement */);
        node.expression = expression;
        node.thenStatement = asEmbeddedStatement(thenStatement);
        node.elseStatement = asEmbeddedStatement(elseStatement);
        node.transformFlags |=
            propagateChildFlags(node.expression) |
                propagateChildFlags(node.thenStatement) |
                propagateChildFlags(node.elseStatement);
        node.jsDoc = undefined; // initialized by parser (JsDocContainer)
        node.flowNode = undefined; // initialized by binder (FlowContainer)
        return node;
    }
    // @api
    function updateIfStatement(node, expression, thenStatement, elseStatement) {
        return node.expression !== expression
            || node.thenStatement !== thenStatement
            || node.elseStatement !== elseStatement
            ? update(createIfStatement(expression, thenStatement, elseStatement), node)
            : node;
    }
    // @api
    function createDoStatement(statement, expression) {
        var node = createBaseNode(245 /* SyntaxKind.DoStatement */);
        node.statement = asEmbeddedStatement(statement);
        node.expression = expression;
        node.transformFlags |=
            propagateChildFlags(node.statement) |
                propagateChildFlags(node.expression);
        node.jsDoc = undefined; // initialized by parser (JsDocContainer)
        node.flowNode = undefined; // initialized by binder (FlowContainer)
        return node;
    }
    // @api
    function updateDoStatement(node, statement, expression) {
        return node.statement !== statement
            || node.expression !== expression
            ? update(createDoStatement(statement, expression), node)
            : node;
    }
    // @api
    function createWhileStatement(expression, statement) {
        var node = createBaseNode(246 /* SyntaxKind.WhileStatement */);
        node.expression = expression;
        node.statement = asEmbeddedStatement(statement);
        node.transformFlags |=
            propagateChildFlags(node.expression) |
                propagateChildFlags(node.statement);
        node.jsDoc = undefined; // initialized by parser (JsDocContainer)
        node.flowNode = undefined; // initialized by binder (FlowContainer)
        return node;
    }
    // @api
    function updateWhileStatement(node, expression, statement) {
        return node.expression !== expression
            || node.statement !== statement
            ? update(createWhileStatement(expression, statement), node)
            : node;
    }
    // @api
    function createForStatement(initializer, condition, incrementor, statement) {
        var node = createBaseNode(247 /* SyntaxKind.ForStatement */);
        node.initializer = initializer;
        node.condition = condition;
        node.incrementor = incrementor;
        node.statement = asEmbeddedStatement(statement);
        node.transformFlags |=
            propagateChildFlags(node.initializer) |
                propagateChildFlags(node.condition) |
                propagateChildFlags(node.incrementor) |
                propagateChildFlags(node.statement);
        node.jsDoc = undefined; // initialized by parser (JsDocContainer)
        node.locals = undefined; // initialized by binder (LocalsContainer)
        node.nextContainer = undefined; // initialized by binder (LocalsContainer)
        node.flowNode = undefined; // initialized by binder (FlowContainer)
        return node;
    }
    // @api
    function updateForStatement(node, initializer, condition, incrementor, statement) {
        return node.initializer !== initializer
            || node.condition !== condition
            || node.incrementor !== incrementor
            || node.statement !== statement
            ? update(createForStatement(initializer, condition, incrementor, statement), node)
            : node;
    }
    // @api
    function createForInStatement(initializer, expression, statement) {
        var node = createBaseNode(248 /* SyntaxKind.ForInStatement */);
        node.initializer = initializer;
        node.expression = expression;
        node.statement = asEmbeddedStatement(statement);
        node.transformFlags |=
            propagateChildFlags(node.initializer) |
                propagateChildFlags(node.expression) |
                propagateChildFlags(node.statement);
        node.jsDoc = undefined; // initialized by parser (JsDocContainer)
        node.locals = undefined; // initialized by binder (LocalsContainer)
        node.nextContainer = undefined; // initialized by binder (LocalsContainer)
        node.flowNode = undefined; // initialized by binder (FlowContainer)
        return node;
    }
    // @api
    function updateForInStatement(node, initializer, expression, statement) {
        return node.initializer !== initializer
            || node.expression !== expression
            || node.statement !== statement
            ? update(createForInStatement(initializer, expression, statement), node)
            : node;
    }
    // @api
    function createForOfStatement(awaitModifier, initializer, expression, statement) {
        var node = createBaseNode(249 /* SyntaxKind.ForOfStatement */);
        node.awaitModifier = awaitModifier;
        node.initializer = initializer;
        node.expression = parenthesizerRules().parenthesizeExpressionForDisallowedComma(expression);
        node.statement = asEmbeddedStatement(statement);
        node.transformFlags |=
            propagateChildFlags(node.awaitModifier) |
                propagateChildFlags(node.initializer) |
                propagateChildFlags(node.expression) |
                propagateChildFlags(node.statement) |
                1024 /* TransformFlags.ContainsES2015 */;
        if (awaitModifier)
            node.transformFlags |= 128 /* TransformFlags.ContainsES2018 */;
        node.jsDoc = undefined; // initialized by parser (JsDocContainer)
        node.locals = undefined; // initialized by binder (LocalsContainer)
        node.nextContainer = undefined; // initialized by binder (LocalsContainer)
        node.flowNode = undefined; // initialized by binder (FlowContainer)
        return node;
    }
    // @api
    function updateForOfStatement(node, awaitModifier, initializer, expression, statement) {
        return node.awaitModifier !== awaitModifier
            || node.initializer !== initializer
            || node.expression !== expression
            || node.statement !== statement
            ? update(createForOfStatement(awaitModifier, initializer, expression, statement), node)
            : node;
    }
    // @api
    function createContinueStatement(label) {
        var node = createBaseNode(250 /* SyntaxKind.ContinueStatement */);
        node.label = asName(label);
        node.transformFlags |=
            propagateChildFlags(node.label) |
                4194304 /* TransformFlags.ContainsHoistedDeclarationOrCompletion */;
        node.jsDoc = undefined; // initialized by parser (JsDocContainer)
        node.flowNode = undefined; // initialized by binder (FlowContainer)
        return node;
    }
    // @api
    function updateContinueStatement(node, label) {
        return node.label !== label
            ? update(createContinueStatement(label), node)
            : node;
    }
    // @api
    function createBreakStatement(label) {
        var node = createBaseNode(251 /* SyntaxKind.BreakStatement */);
        node.label = asName(label);
        node.transformFlags |=
            propagateChildFlags(node.label) |
                4194304 /* TransformFlags.ContainsHoistedDeclarationOrCompletion */;
        node.jsDoc = undefined; // initialized by parser (JsDocContainer)
        node.flowNode = undefined; // initialized by binder (FlowContainer)
        return node;
    }
    // @api
    function updateBreakStatement(node, label) {
        return node.label !== label
            ? update(createBreakStatement(label), node)
            : node;
    }
    // @api
    function createReturnStatement(expression) {
        var node = createBaseNode(252 /* SyntaxKind.ReturnStatement */);
        node.expression = expression;
        // return in an ES2018 async generator must be awaited
        node.transformFlags |=
            propagateChildFlags(node.expression) |
                128 /* TransformFlags.ContainsES2018 */ |
                4194304 /* TransformFlags.ContainsHoistedDeclarationOrCompletion */;
        node.jsDoc = undefined; // initialized by parser (JsDocContainer)
        node.flowNode = undefined; // initialized by binder (FlowContainer)
        return node;
    }
    // @api
    function updateReturnStatement(node, expression) {
        return node.expression !== expression
            ? update(createReturnStatement(expression), node)
            : node;
    }
    // @api
    function createWithStatement(expression, statement) {
        var node = createBaseNode(253 /* SyntaxKind.WithStatement */);
        node.expression = expression;
        node.statement = asEmbeddedStatement(statement);
        node.transformFlags |=
            propagateChildFlags(node.expression) |
                propagateChildFlags(node.statement);
        node.jsDoc = undefined; // initialized by parser (JsDocContainer)
        node.flowNode = undefined; // initialized by binder (FlowContainer)
        return node;
    }
    // @api
    function updateWithStatement(node, expression, statement) {
        return node.expression !== expression
            || node.statement !== statement
            ? update(createWithStatement(expression, statement), node)
            : node;
    }
    // @api
    function createSwitchStatement(expression, caseBlock) {
        var node = createBaseNode(254 /* SyntaxKind.SwitchStatement */);
        node.expression = parenthesizerRules().parenthesizeExpressionForDisallowedComma(expression);
        node.caseBlock = caseBlock;
        node.transformFlags |=
            propagateChildFlags(node.expression) |
                propagateChildFlags(node.caseBlock);
        node.jsDoc = undefined; // initialized by parser (JsDocContainer)
        node.flowNode = undefined; // initialized by binder (FlowContainer)
        node.possiblyExhaustive = false; // initialized by binder
        return node;
    }
    // @api
    function updateSwitchStatement(node, expression, caseBlock) {
        return node.expression !== expression
            || node.caseBlock !== caseBlock
            ? update(createSwitchStatement(expression, caseBlock), node)
            : node;
    }
    // @api
    function createLabeledStatement(label, statement) {
        var node = createBaseNode(255 /* SyntaxKind.LabeledStatement */);
        node.label = asName(label);
        node.statement = asEmbeddedStatement(statement);
        node.transformFlags |=
            propagateChildFlags(node.label) |
                propagateChildFlags(node.statement);
        node.jsDoc = undefined; // initialized by parser (JsDocContainer)
        node.flowNode = undefined; // initialized by binder (FlowContainer)
        return node;
    }
    // @api
    function updateLabeledStatement(node, label, statement) {
        return node.label !== label
            || node.statement !== statement
            ? update(createLabeledStatement(label, statement), node)
            : node;
    }
    // @api
    function createThrowStatement(expression) {
        var node = createBaseNode(256 /* SyntaxKind.ThrowStatement */);
        node.expression = expression;
        node.transformFlags |= propagateChildFlags(node.expression);
        node.jsDoc = undefined; // initialized by parser (JsDocContainer)
        node.flowNode = undefined; // initialized by binder (FlowContainer)
        return node;
    }
    // @api
    function updateThrowStatement(node, expression) {
        return node.expression !== expression
            ? update(createThrowStatement(expression), node)
            : node;
    }
    // @api
    function createTryStatement(tryBlock, catchClause, finallyBlock) {
        var node = createBaseNode(257 /* SyntaxKind.TryStatement */);
        node.tryBlock = tryBlock;
        node.catchClause = catchClause;
        node.finallyBlock = finallyBlock;
        node.transformFlags |=
            propagateChildFlags(node.tryBlock) |
                propagateChildFlags(node.catchClause) |
                propagateChildFlags(node.finallyBlock);
        node.jsDoc = undefined; // initialized by parser (JsDocContainer)
        node.flowNode = undefined; // initialized by binder (FlowContainer)
        return node;
    }
    // @api
    function updateTryStatement(node, tryBlock, catchClause, finallyBlock) {
        return node.tryBlock !== tryBlock
            || node.catchClause !== catchClause
            || node.finallyBlock !== finallyBlock
            ? update(createTryStatement(tryBlock, catchClause, finallyBlock), node)
            : node;
    }
    // @api
    function createDebuggerStatement() {
        var node = createBaseNode(258 /* SyntaxKind.DebuggerStatement */);
        node.jsDoc = undefined; // initialized by parser (JsDocContainer)
        node.flowNode = undefined; // initialized by binder (FlowContainer)
        return node;
    }
    // @api
    function createVariableDeclaration(name, exclamationToken, type, initializer) {
        var _a;
        var node = createBaseDeclaration(259 /* SyntaxKind.VariableDeclaration */);
        node.name = asName(name);
        node.exclamationToken = exclamationToken;
        node.type = type;
        node.initializer = asInitializer(initializer);
        node.transformFlags |=
            propagateNameFlags(node.name) |
                propagateChildFlags(node.initializer) |
                (((_a = node.exclamationToken) !== null && _a !== void 0 ? _a : node.type) ? 1 /* TransformFlags.ContainsTypeScript */ : 0 /* TransformFlags.None */);
        node.jsDoc = undefined; // initialized by parser (JsDocContainer)
        return node;
    }
    // @api
    function updateVariableDeclaration(node, name, exclamationToken, type, initializer) {
        return node.name !== name
            || node.type !== type
            || node.exclamationToken !== exclamationToken
            || node.initializer !== initializer
            ? update(createVariableDeclaration(name, exclamationToken, type, initializer), node)
            : node;
    }
    // @api
    function createVariableDeclarationList(declarations, flags) {
        if (flags === void 0) { flags = 0 /* NodeFlags.None */; }
        var node = createBaseNode(260 /* SyntaxKind.VariableDeclarationList */);
        node.flags |= flags & 3 /* NodeFlags.BlockScoped */;
        node.declarations = createNodeArray(declarations);
        node.transformFlags |=
            propagateChildrenFlags(node.declarations) |
                4194304 /* TransformFlags.ContainsHoistedDeclarationOrCompletion */;
        if (flags & 3 /* NodeFlags.BlockScoped */) {
            node.transformFlags |=
                1024 /* TransformFlags.ContainsES2015 */ |
                    262144 /* TransformFlags.ContainsBlockScopedBinding */;
        }
        return node;
    }
    // @api
    function updateVariableDeclarationList(node, declarations) {
        return node.declarations !== declarations
            ? update(createVariableDeclarationList(declarations, node.flags), node)
            : node;
    }
    // @api
    function createFunctionDeclaration(modifiers, asteriskToken, name, typeParameters, parameters, type, body) {
        var node = createBaseDeclaration(261 /* SyntaxKind.FunctionDeclaration */);
        node.modifiers = asNodeArray(modifiers);
        node.asteriskToken = asteriskToken;
        node.name = asName(name);
        node.typeParameters = asNodeArray(typeParameters);
        node.parameters = createNodeArray(parameters);
        node.type = type;
        node.body = body;
        if (!node.body || (0, ts_1.modifiersToFlags)(node.modifiers) & 2 /* ModifierFlags.Ambient */) {
            node.transformFlags = 1 /* TransformFlags.ContainsTypeScript */;
        }
        else {
            var isAsync = (0, ts_1.modifiersToFlags)(node.modifiers) & 512 /* ModifierFlags.Async */;
            var isGenerator = !!node.asteriskToken;
            var isAsyncGenerator = isAsync && isGenerator;
            node.transformFlags =
                propagateChildrenFlags(node.modifiers) |
                    propagateChildFlags(node.asteriskToken) |
                    propagateNameFlags(node.name) |
                    propagateChildrenFlags(node.typeParameters) |
                    propagateChildrenFlags(node.parameters) |
                    propagateChildFlags(node.type) |
                    (propagateChildFlags(node.body) & ~67108864 /* TransformFlags.ContainsPossibleTopLevelAwait */) |
                    (isAsyncGenerator ? 128 /* TransformFlags.ContainsES2018 */ :
                        isAsync ? 256 /* TransformFlags.ContainsES2017 */ :
                            isGenerator ? 2048 /* TransformFlags.ContainsGenerator */ :
                                0 /* TransformFlags.None */) |
                    (node.typeParameters || node.type ? 1 /* TransformFlags.ContainsTypeScript */ : 0 /* TransformFlags.None */) |
                    4194304 /* TransformFlags.ContainsHoistedDeclarationOrCompletion */;
        }
        node.typeArguments = undefined; // used in quick info
        node.jsDoc = undefined; // initialized by parser (JsDocContainer)
        node.locals = undefined; // initialized by binder (LocalsContainer)
        node.nextContainer = undefined; // initialized by binder (LocalsContainer)
        node.endFlowNode = undefined;
        node.returnFlowNode = undefined;
        return node;
    }
    // @api
    function updateFunctionDeclaration(node, modifiers, asteriskToken, name, typeParameters, parameters, type, body) {
        return node.modifiers !== modifiers
            || node.asteriskToken !== asteriskToken
            || node.name !== name
            || node.typeParameters !== typeParameters
            || node.parameters !== parameters
            || node.type !== type
            || node.body !== body
            ? finishUpdateFunctionDeclaration(createFunctionDeclaration(modifiers, asteriskToken, name, typeParameters, parameters, type, body), node)
            : node;
    }
    function finishUpdateFunctionDeclaration(updated, original) {
        if (updated !== original) {
            // copy children used only for error reporting
            if (updated.modifiers === original.modifiers) {
                updated.modifiers = original.modifiers;
            }
        }
        return finishUpdateBaseSignatureDeclaration(updated, original);
    }
    // @api
    function createClassDeclaration(modifiers, name, typeParameters, heritageClauses, members) {
        var node = createBaseDeclaration(262 /* SyntaxKind.ClassDeclaration */);
        node.modifiers = asNodeArray(modifiers);
        node.name = asName(name);
        node.typeParameters = asNodeArray(typeParameters);
        node.heritageClauses = asNodeArray(heritageClauses);
        node.members = createNodeArray(members);
        if ((0, ts_1.modifiersToFlags)(node.modifiers) & 2 /* ModifierFlags.Ambient */) {
            node.transformFlags = 1 /* TransformFlags.ContainsTypeScript */;
        }
        else {
            node.transformFlags |=
                propagateChildrenFlags(node.modifiers) |
                    propagateNameFlags(node.name) |
                    propagateChildrenFlags(node.typeParameters) |
                    propagateChildrenFlags(node.heritageClauses) |
                    propagateChildrenFlags(node.members) |
                    (node.typeParameters ? 1 /* TransformFlags.ContainsTypeScript */ : 0 /* TransformFlags.None */) |
                    1024 /* TransformFlags.ContainsES2015 */;
            if (node.transformFlags & 8192 /* TransformFlags.ContainsTypeScriptClassSyntax */) {
                node.transformFlags |= 1 /* TransformFlags.ContainsTypeScript */;
            }
        }
        node.jsDoc = undefined; // initialized by parser (JsDocContainer)
        return node;
    }
    // @api
    function updateClassDeclaration(node, modifiers, name, typeParameters, heritageClauses, members) {
        return node.modifiers !== modifiers
            || node.name !== name
            || node.typeParameters !== typeParameters
            || node.heritageClauses !== heritageClauses
            || node.members !== members
            ? update(createClassDeclaration(modifiers, name, typeParameters, heritageClauses, members), node)
            : node;
    }
    // @api
    function createInterfaceDeclaration(modifiers, name, typeParameters, heritageClauses, members) {
        var node = createBaseDeclaration(263 /* SyntaxKind.InterfaceDeclaration */);
        node.modifiers = asNodeArray(modifiers);
        node.name = asName(name);
        node.typeParameters = asNodeArray(typeParameters);
        node.heritageClauses = asNodeArray(heritageClauses);
        node.members = createNodeArray(members);
        node.transformFlags = 1 /* TransformFlags.ContainsTypeScript */;
        node.jsDoc = undefined; // initialized by parser (JsDocContainer)
        return node;
    }
    // @api
    function updateInterfaceDeclaration(node, modifiers, name, typeParameters, heritageClauses, members) {
        return node.modifiers !== modifiers
            || node.name !== name
            || node.typeParameters !== typeParameters
            || node.heritageClauses !== heritageClauses
            || node.members !== members
            ? update(createInterfaceDeclaration(modifiers, name, typeParameters, heritageClauses, members), node)
            : node;
    }
    // @api
    function createTypeAliasDeclaration(modifiers, name, typeParameters, type) {
        var node = createBaseDeclaration(264 /* SyntaxKind.TypeAliasDeclaration */);
        node.modifiers = asNodeArray(modifiers);
        node.name = asName(name);
        node.typeParameters = asNodeArray(typeParameters);
        node.type = type;
        node.transformFlags = 1 /* TransformFlags.ContainsTypeScript */;
        node.jsDoc = undefined; // initialized by parser (JsDocContainer)
        node.locals = undefined; // initialized by binder (LocalsContainer)
        node.nextContainer = undefined; // initialized by binder (LocalsContainer)
        return node;
    }
    // @api
    function updateTypeAliasDeclaration(node, modifiers, name, typeParameters, type) {
        return node.modifiers !== modifiers
            || node.name !== name
            || node.typeParameters !== typeParameters
            || node.type !== type
            ? update(createTypeAliasDeclaration(modifiers, name, typeParameters, type), node)
            : node;
    }
    // @api
    function createEnumDeclaration(modifiers, name, members) {
        var node = createBaseDeclaration(265 /* SyntaxKind.EnumDeclaration */);
        node.modifiers = asNodeArray(modifiers);
        node.name = asName(name);
        node.members = createNodeArray(members);
        node.transformFlags |=
            propagateChildrenFlags(node.modifiers) |
                propagateChildFlags(node.name) |
                propagateChildrenFlags(node.members) |
                1 /* TransformFlags.ContainsTypeScript */;
        node.transformFlags &= ~67108864 /* TransformFlags.ContainsPossibleTopLevelAwait */; // Enum declarations cannot contain `await`
        node.jsDoc = undefined; // initialized by parser (JsDocContainer)
        return node;
    }
    // @api
    function updateEnumDeclaration(node, modifiers, name, members) {
        return node.modifiers !== modifiers
            || node.name !== name
            || node.members !== members
            ? update(createEnumDeclaration(modifiers, name, members), node)
            : node;
    }
    // @api
    function createModuleDeclaration(modifiers, name, body, flags) {
        if (flags === void 0) { flags = 0 /* NodeFlags.None */; }
        var node = createBaseDeclaration(266 /* SyntaxKind.ModuleDeclaration */);
        node.modifiers = asNodeArray(modifiers);
        node.flags |= flags & (16 /* NodeFlags.Namespace */ | 4 /* NodeFlags.NestedNamespace */ | 1024 /* NodeFlags.GlobalAugmentation */);
        node.name = name;
        node.body = body;
        if ((0, ts_1.modifiersToFlags)(node.modifiers) & 2 /* ModifierFlags.Ambient */) {
            node.transformFlags = 1 /* TransformFlags.ContainsTypeScript */;
        }
        else {
            node.transformFlags |=
                propagateChildrenFlags(node.modifiers) |
                    propagateChildFlags(node.name) |
                    propagateChildFlags(node.body) |
                    1 /* TransformFlags.ContainsTypeScript */;
        }
        node.transformFlags &= ~67108864 /* TransformFlags.ContainsPossibleTopLevelAwait */; // Module declarations cannot contain `await`.
        node.jsDoc = undefined; // initialized by parser (JsDocContainer)
        node.locals = undefined; // initialized by binder (LocalsContainer)
        node.nextContainer = undefined; // initialized by binder (LocalsContainer)
        return node;
    }
    // @api
    function updateModuleDeclaration(node, modifiers, name, body) {
        return node.modifiers !== modifiers
            || node.name !== name
            || node.body !== body
            ? update(createModuleDeclaration(modifiers, name, body, node.flags), node)
            : node;
    }
    // @api
    function createModuleBlock(statements) {
        var node = createBaseNode(267 /* SyntaxKind.ModuleBlock */);
        node.statements = createNodeArray(statements);
        node.transformFlags |= propagateChildrenFlags(node.statements);
        node.jsDoc = undefined; // initialized by parser (JsDocContainer)
        return node;
    }
    // @api
    function updateModuleBlock(node, statements) {
        return node.statements !== statements
            ? update(createModuleBlock(statements), node)
            : node;
    }
    // @api
    function createCaseBlock(clauses) {
        var node = createBaseNode(268 /* SyntaxKind.CaseBlock */);
        node.clauses = createNodeArray(clauses);
        node.transformFlags |= propagateChildrenFlags(node.clauses);
        node.locals = undefined; // initialized by binder (LocalsContainer)
        node.nextContainer = undefined; // initialized by binder (LocalsContainer)
        return node;
    }
    // @api
    function updateCaseBlock(node, clauses) {
        return node.clauses !== clauses
            ? update(createCaseBlock(clauses), node)
            : node;
    }
    // @api
    function createNamespaceExportDeclaration(name) {
        var node = createBaseDeclaration(269 /* SyntaxKind.NamespaceExportDeclaration */);
        node.name = asName(name);
        node.transformFlags |=
            propagateIdentifierNameFlags(node.name) |
                1 /* TransformFlags.ContainsTypeScript */;
        node.modifiers = undefined; // initialized by parser to report grammar errors
        node.jsDoc = undefined; // initialized by parser (JsDocContainer)
        return node;
    }
    // @api
    function updateNamespaceExportDeclaration(node, name) {
        return node.name !== name
            ? finishUpdateNamespaceExportDeclaration(createNamespaceExportDeclaration(name), node)
            : node;
    }
    function finishUpdateNamespaceExportDeclaration(updated, original) {
        if (updated !== original) {
            // copy children used only for error reporting
            updated.modifiers = original.modifiers;
        }
        return update(updated, original);
    }
    // @api
    function createImportEqualsDeclaration(modifiers, isTypeOnly, name, moduleReference) {
        var node = createBaseDeclaration(270 /* SyntaxKind.ImportEqualsDeclaration */);
        node.modifiers = asNodeArray(modifiers);
        node.name = asName(name);
        node.isTypeOnly = isTypeOnly;
        node.moduleReference = moduleReference;
        node.transformFlags |=
            propagateChildrenFlags(node.modifiers) |
                propagateIdentifierNameFlags(node.name) |
                propagateChildFlags(node.moduleReference);
        if (!(0, ts_1.isExternalModuleReference)(node.moduleReference)) {
            node.transformFlags |= 1 /* TransformFlags.ContainsTypeScript */;
        }
        node.transformFlags &= ~67108864 /* TransformFlags.ContainsPossibleTopLevelAwait */; // Import= declaration is always parsed in an Await context
        node.jsDoc = undefined; // initialized by parser (JsDocContainer)
        return node;
    }
    // @api
    function updateImportEqualsDeclaration(node, modifiers, isTypeOnly, name, moduleReference) {
        return node.modifiers !== modifiers
            || node.isTypeOnly !== isTypeOnly
            || node.name !== name
            || node.moduleReference !== moduleReference
            ? update(createImportEqualsDeclaration(modifiers, isTypeOnly, name, moduleReference), node)
            : node;
    }
    // @api
    function createImportDeclaration(modifiers, importClause, moduleSpecifier, assertClause) {
        var node = createBaseNode(271 /* SyntaxKind.ImportDeclaration */);
        node.modifiers = asNodeArray(modifiers);
        node.importClause = importClause;
        node.moduleSpecifier = moduleSpecifier;
        node.assertClause = assertClause;
        node.transformFlags |=
            propagateChildFlags(node.importClause) |
                propagateChildFlags(node.moduleSpecifier);
        node.transformFlags &= ~67108864 /* TransformFlags.ContainsPossibleTopLevelAwait */; // always parsed in an Await context
        node.jsDoc = undefined; // initialized by parser (JsDocContainer)
        return node;
    }
    // @api
    function updateImportDeclaration(node, modifiers, importClause, moduleSpecifier, assertClause) {
        return node.modifiers !== modifiers
            || node.importClause !== importClause
            || node.moduleSpecifier !== moduleSpecifier
            || node.assertClause !== assertClause
            ? update(createImportDeclaration(modifiers, importClause, moduleSpecifier, assertClause), node)
            : node;
    }
    // @api
    function createImportClause(isTypeOnly, name, namedBindings) {
        var node = createBaseDeclaration(272 /* SyntaxKind.ImportClause */);
        node.isTypeOnly = isTypeOnly;
        node.name = name;
        node.namedBindings = namedBindings;
        node.transformFlags |=
            propagateChildFlags(node.name) |
                propagateChildFlags(node.namedBindings);
        if (isTypeOnly) {
            node.transformFlags |= 1 /* TransformFlags.ContainsTypeScript */;
        }
        node.transformFlags &= ~67108864 /* TransformFlags.ContainsPossibleTopLevelAwait */; // always parsed in an Await context
        return node;
    }
    // @api
    function updateImportClause(node, isTypeOnly, name, namedBindings) {
        return node.isTypeOnly !== isTypeOnly
            || node.name !== name
            || node.namedBindings !== namedBindings
            ? update(createImportClause(isTypeOnly, name, namedBindings), node)
            : node;
    }
    // @api
    function createAssertClause(elements, multiLine) {
        var node = createBaseNode(299 /* SyntaxKind.AssertClause */);
        node.elements = createNodeArray(elements);
        node.multiLine = multiLine;
        node.transformFlags |= 4 /* TransformFlags.ContainsESNext */;
        return node;
    }
    // @api
    function updateAssertClause(node, elements, multiLine) {
        return node.elements !== elements
            || node.multiLine !== multiLine
            ? update(createAssertClause(elements, multiLine), node)
            : node;
    }
    // @api
    function createAssertEntry(name, value) {
        var node = createBaseNode(300 /* SyntaxKind.AssertEntry */);
        node.name = name;
        node.value = value;
        node.transformFlags |= 4 /* TransformFlags.ContainsESNext */;
        return node;
    }
    // @api
    function updateAssertEntry(node, name, value) {
        return node.name !== name
            || node.value !== value
            ? update(createAssertEntry(name, value), node)
            : node;
    }
    // @api
    function createImportTypeAssertionContainer(clause, multiLine) {
        var node = createBaseNode(301 /* SyntaxKind.ImportTypeAssertionContainer */);
        node.assertClause = clause;
        node.multiLine = multiLine;
        return node;
    }
    // @api
    function updateImportTypeAssertionContainer(node, clause, multiLine) {
        return node.assertClause !== clause
            || node.multiLine !== multiLine
            ? update(createImportTypeAssertionContainer(clause, multiLine), node)
            : node;
    }
    // @api
    function createNamespaceImport(name) {
        var node = createBaseDeclaration(273 /* SyntaxKind.NamespaceImport */);
        node.name = name;
        node.transformFlags |= propagateChildFlags(node.name);
        node.transformFlags &= ~67108864 /* TransformFlags.ContainsPossibleTopLevelAwait */; // always parsed in an Await context
        return node;
    }
    // @api
    function updateNamespaceImport(node, name) {
        return node.name !== name
            ? update(createNamespaceImport(name), node)
            : node;
    }
    // @api
    function createNamespaceExport(name) {
        var node = createBaseDeclaration(279 /* SyntaxKind.NamespaceExport */);
        node.name = name;
        node.transformFlags |=
            propagateChildFlags(node.name) |
                32 /* TransformFlags.ContainsES2020 */;
        node.transformFlags &= ~67108864 /* TransformFlags.ContainsPossibleTopLevelAwait */; // always parsed in an Await context
        return node;
    }
    // @api
    function updateNamespaceExport(node, name) {
        return node.name !== name
            ? update(createNamespaceExport(name), node)
            : node;
    }
    // @api
    function createNamedImports(elements) {
        var node = createBaseNode(274 /* SyntaxKind.NamedImports */);
        node.elements = createNodeArray(elements);
        node.transformFlags |= propagateChildrenFlags(node.elements);
        node.transformFlags &= ~67108864 /* TransformFlags.ContainsPossibleTopLevelAwait */; // always parsed in an Await context
        return node;
    }
    // @api
    function updateNamedImports(node, elements) {
        return node.elements !== elements
            ? update(createNamedImports(elements), node)
            : node;
    }
    // @api
    function createImportSpecifier(isTypeOnly, propertyName, name) {
        var node = createBaseDeclaration(275 /* SyntaxKind.ImportSpecifier */);
        node.isTypeOnly = isTypeOnly;
        node.propertyName = propertyName;
        node.name = name;
        node.transformFlags |=
            propagateChildFlags(node.propertyName) |
                propagateChildFlags(node.name);
        node.transformFlags &= ~67108864 /* TransformFlags.ContainsPossibleTopLevelAwait */; // always parsed in an Await context
        return node;
    }
    // @api
    function updateImportSpecifier(node, isTypeOnly, propertyName, name) {
        return node.isTypeOnly !== isTypeOnly
            || node.propertyName !== propertyName
            || node.name !== name
            ? update(createImportSpecifier(isTypeOnly, propertyName, name), node)
            : node;
    }
    // @api
    function createExportAssignment(modifiers, isExportEquals, expression) {
        var node = createBaseDeclaration(276 /* SyntaxKind.ExportAssignment */);
        node.modifiers = asNodeArray(modifiers);
        node.isExportEquals = isExportEquals;
        node.expression = isExportEquals
            ? parenthesizerRules().parenthesizeRightSideOfBinary(64 /* SyntaxKind.EqualsToken */, /*leftSide*/ undefined, expression)
            : parenthesizerRules().parenthesizeExpressionOfExportDefault(expression);
        node.transformFlags |= propagateChildrenFlags(node.modifiers) | propagateChildFlags(node.expression);
        node.transformFlags &= ~67108864 /* TransformFlags.ContainsPossibleTopLevelAwait */; // always parsed in an Await context
        node.jsDoc = undefined; // initialized by parser (JsDocContainer)
        return node;
    }
    // @api
    function updateExportAssignment(node, modifiers, expression) {
        return node.modifiers !== modifiers
            || node.expression !== expression
            ? update(createExportAssignment(modifiers, node.isExportEquals, expression), node)
            : node;
    }
    // @api
    function createExportDeclaration(modifiers, isTypeOnly, exportClause, moduleSpecifier, assertClause) {
        var node = createBaseDeclaration(277 /* SyntaxKind.ExportDeclaration */);
        node.modifiers = asNodeArray(modifiers);
        node.isTypeOnly = isTypeOnly;
        node.exportClause = exportClause;
        node.moduleSpecifier = moduleSpecifier;
        node.assertClause = assertClause;
        node.transformFlags |=
            propagateChildrenFlags(node.modifiers) |
                propagateChildFlags(node.exportClause) |
                propagateChildFlags(node.moduleSpecifier);
        node.transformFlags &= ~67108864 /* TransformFlags.ContainsPossibleTopLevelAwait */; // always parsed in an Await context
        node.jsDoc = undefined; // initialized by parser (JsDocContainer)
        return node;
    }
    // @api
    function updateExportDeclaration(node, modifiers, isTypeOnly, exportClause, moduleSpecifier, assertClause) {
        return node.modifiers !== modifiers
            || node.isTypeOnly !== isTypeOnly
            || node.exportClause !== exportClause
            || node.moduleSpecifier !== moduleSpecifier
            || node.assertClause !== assertClause
            ? finishUpdateExportDeclaration(createExportDeclaration(modifiers, isTypeOnly, exportClause, moduleSpecifier, assertClause), node)
            : node;
    }
    function finishUpdateExportDeclaration(updated, original) {
        if (updated !== original) {
            // copy children used only for error reporting
            if (updated.modifiers === original.modifiers) {
                updated.modifiers = original.modifiers;
            }
        }
        return update(updated, original);
    }
    // @api
    function createNamedExports(elements) {
        var node = createBaseNode(278 /* SyntaxKind.NamedExports */);
        node.elements = createNodeArray(elements);
        node.transformFlags |= propagateChildrenFlags(node.elements);
        node.transformFlags &= ~67108864 /* TransformFlags.ContainsPossibleTopLevelAwait */; // always parsed in an Await context
        return node;
    }
    // @api
    function updateNamedExports(node, elements) {
        return node.elements !== elements
            ? update(createNamedExports(elements), node)
            : node;
    }
    // @api
    function createExportSpecifier(isTypeOnly, propertyName, name) {
        var node = createBaseNode(280 /* SyntaxKind.ExportSpecifier */);
        node.isTypeOnly = isTypeOnly;
        node.propertyName = asName(propertyName);
        node.name = asName(name);
        node.transformFlags |=
            propagateChildFlags(node.propertyName) |
                propagateChildFlags(node.name);
        node.transformFlags &= ~67108864 /* TransformFlags.ContainsPossibleTopLevelAwait */; // always parsed in an Await context
        node.jsDoc = undefined; // initialized by parser (JsDocContainer)
        return node;
    }
    // @api
    function updateExportSpecifier(node, isTypeOnly, propertyName, name) {
        return node.isTypeOnly !== isTypeOnly
            || node.propertyName !== propertyName
            || node.name !== name
            ? update(createExportSpecifier(isTypeOnly, propertyName, name), node)
            : node;
    }
    // @api
    function createMissingDeclaration() {
        var node = createBaseDeclaration(281 /* SyntaxKind.MissingDeclaration */);
        node.jsDoc = undefined; // initialized by parser (JsDocContainer)
        return node;
    }
    //
    // Module references
    //
    // @api
    function createExternalModuleReference(expression) {
        var node = createBaseNode(282 /* SyntaxKind.ExternalModuleReference */);
        node.expression = expression;
        node.transformFlags |= propagateChildFlags(node.expression);
        node.transformFlags &= ~67108864 /* TransformFlags.ContainsPossibleTopLevelAwait */; // always parsed in an Await context
        return node;
    }
    // @api
    function updateExternalModuleReference(node, expression) {
        return node.expression !== expression
            ? update(createExternalModuleReference(expression), node)
            : node;
    }
    //
    // JSDoc
    //
    // @api
    // createJSDocAllType
    // createJSDocUnknownType
    function createJSDocPrimaryTypeWorker(kind) {
        return createBaseNode(kind);
    }
    // @api
    // createJSDocNullableType
    // createJSDocNonNullableType
    function createJSDocPrePostfixUnaryTypeWorker(kind, type, postfix) {
        if (postfix === void 0) { postfix = false; }
        var node = createJSDocUnaryTypeWorker(kind, postfix ? type && parenthesizerRules().parenthesizeNonArrayTypeOfPostfixType(type) : type);
        node.postfix = postfix;
        return node;
    }
    // @api
    // createJSDocOptionalType
    // createJSDocVariadicType
    // createJSDocNamepathType
    function createJSDocUnaryTypeWorker(kind, type) {
        var node = createBaseNode(kind);
        node.type = type;
        return node;
    }
    // @api
    // updateJSDocNonNullableType
    // updateJSDocNullableType
    function updateJSDocPrePostfixUnaryTypeWorker(kind, node, type) {
        return node.type !== type
            ? update(createJSDocPrePostfixUnaryTypeWorker(kind, type, node.postfix), node)
            : node;
    }
    // @api
    // updateJSDocOptionalType
    // updateJSDocVariadicType
    // updateJSDocNamepathType
    function updateJSDocUnaryTypeWorker(kind, node, type) {
        return node.type !== type
            ? update(createJSDocUnaryTypeWorker(kind, type), node)
            : node;
    }
    // @api
    function createJSDocFunctionType(parameters, type) {
        var node = createBaseDeclaration(323 /* SyntaxKind.JSDocFunctionType */);
        node.parameters = asNodeArray(parameters);
        node.type = type;
        node.transformFlags =
            propagateChildrenFlags(node.parameters) |
                (node.type ? 1 /* TransformFlags.ContainsTypeScript */ : 0 /* TransformFlags.None */);
        node.jsDoc = undefined; // initialized by parser (JsDocContainer)
        node.locals = undefined; // initialized by binder (LocalsContainer)
        node.nextContainer = undefined; // initialized by binder (LocalsContainer)
        node.typeArguments = undefined; // used in quick info
        return node;
    }
    // @api
    function updateJSDocFunctionType(node, parameters, type) {
        return node.parameters !== parameters
            || node.type !== type
            ? update(createJSDocFunctionType(parameters, type), node)
            : node;
    }
    // @api
    function createJSDocTypeLiteral(propertyTags, isArrayType) {
        if (isArrayType === void 0) { isArrayType = false; }
        var node = createBaseDeclaration(328 /* SyntaxKind.JSDocTypeLiteral */);
        node.jsDocPropertyTags = asNodeArray(propertyTags);
        node.isArrayType = isArrayType;
        return node;
    }
    // @api
    function updateJSDocTypeLiteral(node, propertyTags, isArrayType) {
        return node.jsDocPropertyTags !== propertyTags
            || node.isArrayType !== isArrayType
            ? update(createJSDocTypeLiteral(propertyTags, isArrayType), node)
            : node;
    }
    // @api
    function createJSDocTypeExpression(type) {
        var node = createBaseNode(315 /* SyntaxKind.JSDocTypeExpression */);
        node.type = type;
        return node;
    }
    // @api
    function updateJSDocTypeExpression(node, type) {
        return node.type !== type
            ? update(createJSDocTypeExpression(type), node)
            : node;
    }
    // @api
    function createJSDocSignature(typeParameters, parameters, type) {
        var node = createBaseDeclaration(329 /* SyntaxKind.JSDocSignature */);
        node.typeParameters = asNodeArray(typeParameters);
        node.parameters = createNodeArray(parameters);
        node.type = type;
        node.jsDoc = undefined; // initialized by parser (JsDocContainer)
        node.locals = undefined; // initialized by binder (LocalsContainer)
        node.nextContainer = undefined; // initialized by binder (LocalsContainer)
        return node;
    }
    // @api
    function updateJSDocSignature(node, typeParameters, parameters, type) {
        return node.typeParameters !== typeParameters
            || node.parameters !== parameters
            || node.type !== type
            ? update(createJSDocSignature(typeParameters, parameters, type), node)
            : node;
    }
    function getDefaultTagName(node) {
        var defaultTagName = getDefaultTagNameForKind(node.kind);
        return node.tagName.escapedText === (0, ts_1.escapeLeadingUnderscores)(defaultTagName)
            ? node.tagName
            : createIdentifier(defaultTagName);
    }
    // @api
    function createBaseJSDocTag(kind, tagName, comment) {
        var node = createBaseNode(kind);
        node.tagName = tagName;
        node.comment = comment;
        return node;
    }
    function createBaseJSDocTagDeclaration(kind, tagName, comment) {
        var node = createBaseDeclaration(kind);
        node.tagName = tagName;
        node.comment = comment;
        return node;
    }
    // @api
    function createJSDocTemplateTag(tagName, constraint, typeParameters, comment) {
        var node = createBaseJSDocTag(351 /* SyntaxKind.JSDocTemplateTag */, tagName !== null && tagName !== void 0 ? tagName : createIdentifier("template"), comment);
        node.constraint = constraint;
        node.typeParameters = createNodeArray(typeParameters);
        return node;
    }
    // @api
    function updateJSDocTemplateTag(node, tagName, constraint, typeParameters, comment) {
        if (tagName === void 0) { tagName = getDefaultTagName(node); }
        return node.tagName !== tagName
            || node.constraint !== constraint
            || node.typeParameters !== typeParameters
            || node.comment !== comment
            ? update(createJSDocTemplateTag(tagName, constraint, typeParameters, comment), node)
            : node;
    }
    // @api
    function createJSDocTypedefTag(tagName, typeExpression, fullName, comment) {
        var node = createBaseJSDocTagDeclaration(352 /* SyntaxKind.JSDocTypedefTag */, tagName !== null && tagName !== void 0 ? tagName : createIdentifier("typedef"), comment);
        node.typeExpression = typeExpression;
        node.fullName = fullName;
        node.name = (0, ts_1.getJSDocTypeAliasName)(fullName);
        node.locals = undefined; // initialized by binder (LocalsContainer)
        node.nextContainer = undefined; // initialized by binder (LocalsContainer)
        return node;
    }
    // @api
    function updateJSDocTypedefTag(node, tagName, typeExpression, fullName, comment) {
        if (tagName === void 0) { tagName = getDefaultTagName(node); }
        return node.tagName !== tagName
            || node.typeExpression !== typeExpression
            || node.fullName !== fullName
            || node.comment !== comment
            ? update(createJSDocTypedefTag(tagName, typeExpression, fullName, comment), node)
            : node;
    }
    // @api
    function createJSDocParameterTag(tagName, name, isBracketed, typeExpression, isNameFirst, comment) {
        var node = createBaseJSDocTagDeclaration(347 /* SyntaxKind.JSDocParameterTag */, tagName !== null && tagName !== void 0 ? tagName : createIdentifier("param"), comment);
        node.typeExpression = typeExpression;
        node.name = name;
        node.isNameFirst = !!isNameFirst;
        node.isBracketed = isBracketed;
        return node;
    }
    // @api
    function updateJSDocParameterTag(node, tagName, name, isBracketed, typeExpression, isNameFirst, comment) {
        if (tagName === void 0) { tagName = getDefaultTagName(node); }
        return node.tagName !== tagName
            || node.name !== name
            || node.isBracketed !== isBracketed
            || node.typeExpression !== typeExpression
            || node.isNameFirst !== isNameFirst
            || node.comment !== comment
            ? update(createJSDocParameterTag(tagName, name, isBracketed, typeExpression, isNameFirst, comment), node)
            : node;
    }
    // @api
    function createJSDocPropertyTag(tagName, name, isBracketed, typeExpression, isNameFirst, comment) {
        var node = createBaseJSDocTagDeclaration(354 /* SyntaxKind.JSDocPropertyTag */, tagName !== null && tagName !== void 0 ? tagName : createIdentifier("prop"), comment);
        node.typeExpression = typeExpression;
        node.name = name;
        node.isNameFirst = !!isNameFirst;
        node.isBracketed = isBracketed;
        return node;
    }
    // @api
    function updateJSDocPropertyTag(node, tagName, name, isBracketed, typeExpression, isNameFirst, comment) {
        if (tagName === void 0) { tagName = getDefaultTagName(node); }
        return node.tagName !== tagName
            || node.name !== name
            || node.isBracketed !== isBracketed
            || node.typeExpression !== typeExpression
            || node.isNameFirst !== isNameFirst
            || node.comment !== comment
            ? update(createJSDocPropertyTag(tagName, name, isBracketed, typeExpression, isNameFirst, comment), node)
            : node;
    }
    // @api
    function createJSDocCallbackTag(tagName, typeExpression, fullName, comment) {
        var node = createBaseJSDocTagDeclaration(344 /* SyntaxKind.JSDocCallbackTag */, tagName !== null && tagName !== void 0 ? tagName : createIdentifier("callback"), comment);
        node.typeExpression = typeExpression;
        node.fullName = fullName;
        node.name = (0, ts_1.getJSDocTypeAliasName)(fullName);
        node.locals = undefined; // initialized by binder (LocalsContainer)
        node.nextContainer = undefined; // initialized by binder (LocalsContainer)
        return node;
    }
    // @api
    function updateJSDocCallbackTag(node, tagName, typeExpression, fullName, comment) {
        if (tagName === void 0) { tagName = getDefaultTagName(node); }
        return node.tagName !== tagName
            || node.typeExpression !== typeExpression
            || node.fullName !== fullName
            || node.comment !== comment
            ? update(createJSDocCallbackTag(tagName, typeExpression, fullName, comment), node)
            : node;
    }
    // @api
    function createJSDocOverloadTag(tagName, typeExpression, comment) {
        var node = createBaseJSDocTag(345 /* SyntaxKind.JSDocOverloadTag */, tagName !== null && tagName !== void 0 ? tagName : createIdentifier("overload"), comment);
        node.typeExpression = typeExpression;
        return node;
    }
    // @api
    function updateJSDocOverloadTag(node, tagName, typeExpression, comment) {
        if (tagName === void 0) { tagName = getDefaultTagName(node); }
        return node.tagName !== tagName
            || node.typeExpression !== typeExpression
            || node.comment !== comment
            ? update(createJSDocOverloadTag(tagName, typeExpression, comment), node)
            : node;
    }
    // @api
    function createJSDocAugmentsTag(tagName, className, comment) {
        var node = createBaseJSDocTag(334 /* SyntaxKind.JSDocAugmentsTag */, tagName !== null && tagName !== void 0 ? tagName : createIdentifier("augments"), comment);
        node.class = className;
        return node;
    }
    // @api
    function updateJSDocAugmentsTag(node, tagName, className, comment) {
        if (tagName === void 0) { tagName = getDefaultTagName(node); }
        return node.tagName !== tagName
            || node.class !== className
            || node.comment !== comment
            ? update(createJSDocAugmentsTag(tagName, className, comment), node)
            : node;
    }
    // @api
    function createJSDocImplementsTag(tagName, className, comment) {
        var node = createBaseJSDocTag(335 /* SyntaxKind.JSDocImplementsTag */, tagName !== null && tagName !== void 0 ? tagName : createIdentifier("implements"), comment);
        node.class = className;
        return node;
    }
    // @api
    function createJSDocSeeTag(tagName, name, comment) {
        var node = createBaseJSDocTag(353 /* SyntaxKind.JSDocSeeTag */, tagName !== null && tagName !== void 0 ? tagName : createIdentifier("see"), comment);
        node.name = name;
        return node;
    }
    // @api
    function updateJSDocSeeTag(node, tagName, name, comment) {
        return node.tagName !== tagName
            || node.name !== name
            || node.comment !== comment
            ? update(createJSDocSeeTag(tagName, name, comment), node)
            : node;
    }
    // @api
    function createJSDocNameReference(name) {
        var node = createBaseNode(316 /* SyntaxKind.JSDocNameReference */);
        node.name = name;
        return node;
    }
    // @api
    function updateJSDocNameReference(node, name) {
        return node.name !== name
            ? update(createJSDocNameReference(name), node)
            : node;
    }
    // @api
    function createJSDocMemberName(left, right) {
        var node = createBaseNode(317 /* SyntaxKind.JSDocMemberName */);
        node.left = left;
        node.right = right;
        node.transformFlags |=
            propagateChildFlags(node.left) |
                propagateChildFlags(node.right);
        return node;
    }
    // @api
    function updateJSDocMemberName(node, left, right) {
        return node.left !== left
            || node.right !== right
            ? update(createJSDocMemberName(left, right), node)
            : node;
    }
    // @api
    function createJSDocLink(name, text) {
        var node = createBaseNode(330 /* SyntaxKind.JSDocLink */);
        node.name = name;
        node.text = text;
        return node;
    }
    // @api
    function updateJSDocLink(node, name, text) {
        return node.name !== name
            ? update(createJSDocLink(name, text), node)
            : node;
    }
    // @api
    function createJSDocLinkCode(name, text) {
        var node = createBaseNode(331 /* SyntaxKind.JSDocLinkCode */);
        node.name = name;
        node.text = text;
        return node;
    }
    // @api
    function updateJSDocLinkCode(node, name, text) {
        return node.name !== name
            ? update(createJSDocLinkCode(name, text), node)
            : node;
    }
    // @api
    function createJSDocLinkPlain(name, text) {
        var node = createBaseNode(332 /* SyntaxKind.JSDocLinkPlain */);
        node.name = name;
        node.text = text;
        return node;
    }
    // @api
    function updateJSDocLinkPlain(node, name, text) {
        return node.name !== name
            ? update(createJSDocLinkPlain(name, text), node)
            : node;
    }
    // @api
    function updateJSDocImplementsTag(node, tagName, className, comment) {
        if (tagName === void 0) { tagName = getDefaultTagName(node); }
        return node.tagName !== tagName
            || node.class !== className
            || node.comment !== comment
            ? update(createJSDocImplementsTag(tagName, className, comment), node)
            : node;
    }
    // @api
    // createJSDocAuthorTag
    // createJSDocClassTag
    // createJSDocPublicTag
    // createJSDocPrivateTag
    // createJSDocProtectedTag
    // createJSDocReadonlyTag
    // createJSDocDeprecatedTag
    function createJSDocSimpleTagWorker(kind, tagName, comment) {
        var node = createBaseJSDocTag(kind, tagName !== null && tagName !== void 0 ? tagName : createIdentifier(getDefaultTagNameForKind(kind)), comment);
        return node;
    }
    // @api
    // updateJSDocAuthorTag
    // updateJSDocClassTag
    // updateJSDocPublicTag
    // updateJSDocPrivateTag
    // updateJSDocProtectedTag
    // updateJSDocReadonlyTag
    // updateJSDocDeprecatedTag
    function updateJSDocSimpleTagWorker(kind, node, tagName, comment) {
        if (tagName === void 0) { tagName = getDefaultTagName(node); }
        return node.tagName !== tagName
            || node.comment !== comment
            ? update(createJSDocSimpleTagWorker(kind, tagName, comment), node) :
            node;
    }
    // @api
    // createJSDocTypeTag
    // createJSDocReturnTag
    // createJSDocThisTag
    // createJSDocEnumTag
    // createJSDocSatisfiesTag
    function createJSDocTypeLikeTagWorker(kind, tagName, typeExpression, comment) {
        var node = createBaseJSDocTag(kind, tagName !== null && tagName !== void 0 ? tagName : createIdentifier(getDefaultTagNameForKind(kind)), comment);
        node.typeExpression = typeExpression;
        return node;
    }
    // @api
    // updateJSDocTypeTag
    // updateJSDocReturnTag
    // updateJSDocThisTag
    // updateJSDocEnumTag
    // updateJSDocSatisfiesTag
    function updateJSDocTypeLikeTagWorker(kind, node, tagName, typeExpression, comment) {
        if (tagName === void 0) { tagName = getDefaultTagName(node); }
        return node.tagName !== tagName
            || node.typeExpression !== typeExpression
            || node.comment !== comment
            ? update(createJSDocTypeLikeTagWorker(kind, tagName, typeExpression, comment), node)
            : node;
    }
    // @api
    function createJSDocUnknownTag(tagName, comment) {
        var node = createBaseJSDocTag(333 /* SyntaxKind.JSDocTag */, tagName, comment);
        return node;
    }
    // @api
    function updateJSDocUnknownTag(node, tagName, comment) {
        return node.tagName !== tagName
            || node.comment !== comment
            ? update(createJSDocUnknownTag(tagName, comment), node)
            : node;
    }
    // @api
    function createJSDocEnumTag(tagName, typeExpression, comment) {
        var node = createBaseJSDocTagDeclaration(346 /* SyntaxKind.JSDocEnumTag */, tagName !== null && tagName !== void 0 ? tagName : createIdentifier(getDefaultTagNameForKind(346 /* SyntaxKind.JSDocEnumTag */)), comment);
        node.typeExpression = typeExpression;
        node.locals = undefined; // initialized by binder (LocalsContainer)
        node.nextContainer = undefined; // initialized by binder (LocalsContainer)
        return node;
    }
    // @api
    function updateJSDocEnumTag(node, tagName, typeExpression, comment) {
        if (tagName === void 0) { tagName = getDefaultTagName(node); }
        return node.tagName !== tagName
            || node.typeExpression !== typeExpression
            || node.comment !== comment
            ? update(createJSDocEnumTag(tagName, typeExpression, comment), node)
            : node;
    }
    // @api
    function createJSDocText(text) {
        var node = createBaseNode(327 /* SyntaxKind.JSDocText */);
        node.text = text;
        return node;
    }
    // @api
    function updateJSDocText(node, text) {
        return node.text !== text
            ? update(createJSDocText(text), node)
            : node;
    }
    // @api
    function createJSDocComment(comment, tags) {
        var node = createBaseNode(326 /* SyntaxKind.JSDoc */);
        node.comment = comment;
        node.tags = asNodeArray(tags);
        return node;
    }
    // @api
    function updateJSDocComment(node, comment, tags) {
        return node.comment !== comment
            || node.tags !== tags
            ? update(createJSDocComment(comment, tags), node)
            : node;
    }
    //
    // JSX
    //
    // @api
    function createJsxElement(openingElement, children, closingElement) {
        var node = createBaseNode(283 /* SyntaxKind.JsxElement */);
        node.openingElement = openingElement;
        node.children = createNodeArray(children);
        node.closingElement = closingElement;
        node.transformFlags |=
            propagateChildFlags(node.openingElement) |
                propagateChildrenFlags(node.children) |
                propagateChildFlags(node.closingElement) |
                2 /* TransformFlags.ContainsJsx */;
        return node;
    }
    // @api
    function updateJsxElement(node, openingElement, children, closingElement) {
        return node.openingElement !== openingElement
            || node.children !== children
            || node.closingElement !== closingElement
            ? update(createJsxElement(openingElement, children, closingElement), node)
            : node;
    }
    // @api
    function createJsxSelfClosingElement(tagName, typeArguments, attributes) {
        var node = createBaseNode(284 /* SyntaxKind.JsxSelfClosingElement */);
        node.tagName = tagName;
        node.typeArguments = asNodeArray(typeArguments);
        node.attributes = attributes;
        node.transformFlags |=
            propagateChildFlags(node.tagName) |
                propagateChildrenFlags(node.typeArguments) |
                propagateChildFlags(node.attributes) |
                2 /* TransformFlags.ContainsJsx */;
        if (node.typeArguments) {
            node.transformFlags |= 1 /* TransformFlags.ContainsTypeScript */;
        }
        return node;
    }
    // @api
    function updateJsxSelfClosingElement(node, tagName, typeArguments, attributes) {
        return node.tagName !== tagName
            || node.typeArguments !== typeArguments
            || node.attributes !== attributes
            ? update(createJsxSelfClosingElement(tagName, typeArguments, attributes), node)
            : node;
    }
    // @api
    function createJsxOpeningElement(tagName, typeArguments, attributes) {
        var node = createBaseNode(285 /* SyntaxKind.JsxOpeningElement */);
        node.tagName = tagName;
        node.typeArguments = asNodeArray(typeArguments);
        node.attributes = attributes;
        node.transformFlags |=
            propagateChildFlags(node.tagName) |
                propagateChildrenFlags(node.typeArguments) |
                propagateChildFlags(node.attributes) |
                2 /* TransformFlags.ContainsJsx */;
        if (typeArguments) {
            node.transformFlags |= 1 /* TransformFlags.ContainsTypeScript */;
        }
        return node;
    }
    // @api
    function updateJsxOpeningElement(node, tagName, typeArguments, attributes) {
        return node.tagName !== tagName
            || node.typeArguments !== typeArguments
            || node.attributes !== attributes
            ? update(createJsxOpeningElement(tagName, typeArguments, attributes), node)
            : node;
    }
    // @api
    function createJsxClosingElement(tagName) {
        var node = createBaseNode(286 /* SyntaxKind.JsxClosingElement */);
        node.tagName = tagName;
        node.transformFlags |=
            propagateChildFlags(node.tagName) |
                2 /* TransformFlags.ContainsJsx */;
        return node;
    }
    // @api
    function updateJsxClosingElement(node, tagName) {
        return node.tagName !== tagName
            ? update(createJsxClosingElement(tagName), node)
            : node;
    }
    // @api
    function createJsxFragment(openingFragment, children, closingFragment) {
        var node = createBaseNode(287 /* SyntaxKind.JsxFragment */);
        node.openingFragment = openingFragment;
        node.children = createNodeArray(children);
        node.closingFragment = closingFragment;
        node.transformFlags |=
            propagateChildFlags(node.openingFragment) |
                propagateChildrenFlags(node.children) |
                propagateChildFlags(node.closingFragment) |
                2 /* TransformFlags.ContainsJsx */;
        return node;
    }
    // @api
    function updateJsxFragment(node, openingFragment, children, closingFragment) {
        return node.openingFragment !== openingFragment
            || node.children !== children
            || node.closingFragment !== closingFragment
            ? update(createJsxFragment(openingFragment, children, closingFragment), node)
            : node;
    }
    // @api
    function createJsxText(text, containsOnlyTriviaWhiteSpaces) {
        var node = createBaseNode(12 /* SyntaxKind.JsxText */);
        node.text = text;
        node.containsOnlyTriviaWhiteSpaces = !!containsOnlyTriviaWhiteSpaces;
        node.transformFlags |= 2 /* TransformFlags.ContainsJsx */;
        return node;
    }
    // @api
    function updateJsxText(node, text, containsOnlyTriviaWhiteSpaces) {
        return node.text !== text
            || node.containsOnlyTriviaWhiteSpaces !== containsOnlyTriviaWhiteSpaces
            ? update(createJsxText(text, containsOnlyTriviaWhiteSpaces), node)
            : node;
    }
    // @api
    function createJsxOpeningFragment() {
        var node = createBaseNode(288 /* SyntaxKind.JsxOpeningFragment */);
        node.transformFlags |= 2 /* TransformFlags.ContainsJsx */;
        return node;
    }
    // @api
    function createJsxJsxClosingFragment() {
        var node = createBaseNode(289 /* SyntaxKind.JsxClosingFragment */);
        node.transformFlags |= 2 /* TransformFlags.ContainsJsx */;
        return node;
    }
    // @api
    function createJsxAttribute(name, initializer) {
        var node = createBaseDeclaration(290 /* SyntaxKind.JsxAttribute */);
        node.name = name;
        node.initializer = initializer;
        node.transformFlags |=
            propagateChildFlags(node.name) |
                propagateChildFlags(node.initializer) |
                2 /* TransformFlags.ContainsJsx */;
        return node;
    }
    // @api
    function updateJsxAttribute(node, name, initializer) {
        return node.name !== name
            || node.initializer !== initializer
            ? update(createJsxAttribute(name, initializer), node)
            : node;
    }
    // @api
    function createJsxAttributes(properties) {
        var node = createBaseDeclaration(291 /* SyntaxKind.JsxAttributes */);
        node.properties = createNodeArray(properties);
        node.transformFlags |=
            propagateChildrenFlags(node.properties) |
                2 /* TransformFlags.ContainsJsx */;
        return node;
    }
    // @api
    function updateJsxAttributes(node, properties) {
        return node.properties !== properties
            ? update(createJsxAttributes(properties), node)
            : node;
    }
    // @api
    function createJsxSpreadAttribute(expression) {
        var node = createBaseNode(292 /* SyntaxKind.JsxSpreadAttribute */);
        node.expression = expression;
        node.transformFlags |=
            propagateChildFlags(node.expression) |
                2 /* TransformFlags.ContainsJsx */;
        return node;
    }
    // @api
    function updateJsxSpreadAttribute(node, expression) {
        return node.expression !== expression
            ? update(createJsxSpreadAttribute(expression), node)
            : node;
    }
    // @api
    function createJsxExpression(dotDotDotToken, expression) {
        var node = createBaseNode(293 /* SyntaxKind.JsxExpression */);
        node.dotDotDotToken = dotDotDotToken;
        node.expression = expression;
        node.transformFlags |=
            propagateChildFlags(node.dotDotDotToken) |
                propagateChildFlags(node.expression) |
                2 /* TransformFlags.ContainsJsx */;
        return node;
    }
    // @api
    function updateJsxExpression(node, expression) {
        return node.expression !== expression
            ? update(createJsxExpression(node.dotDotDotToken, expression), node)
            : node;
    }
    // @api
    function createJsxNamespacedName(namespace, name) {
        var node = createBaseNode(294 /* SyntaxKind.JsxNamespacedName */);
        node.namespace = namespace;
        node.name = name;
        node.transformFlags |=
            propagateChildFlags(node.namespace) |
                propagateChildFlags(node.name) |
                2 /* TransformFlags.ContainsJsx */;
        return node;
    }
    // @api
    function updateJsxNamespacedName(node, namespace, name) {
        return node.namespace !== namespace
            || node.name !== name
            ? update(createJsxNamespacedName(namespace, name), node)
            : node;
    }
    //
    // Clauses
    //
    // @api
    function createCaseClause(expression, statements) {
        var node = createBaseNode(295 /* SyntaxKind.CaseClause */);
        node.expression = parenthesizerRules().parenthesizeExpressionForDisallowedComma(expression);
        node.statements = createNodeArray(statements);
        node.transformFlags |=
            propagateChildFlags(node.expression) |
                propagateChildrenFlags(node.statements);
        node.jsDoc = undefined; // initialized by parser (JsDocContainer)
        return node;
    }
    // @api
    function updateCaseClause(node, expression, statements) {
        return node.expression !== expression
            || node.statements !== statements
            ? update(createCaseClause(expression, statements), node)
            : node;
    }
    // @api
    function createDefaultClause(statements) {
        var node = createBaseNode(296 /* SyntaxKind.DefaultClause */);
        node.statements = createNodeArray(statements);
        node.transformFlags = propagateChildrenFlags(node.statements);
        return node;
    }
    // @api
    function updateDefaultClause(node, statements) {
        return node.statements !== statements
            ? update(createDefaultClause(statements), node)
            : node;
    }
    // @api
    function createHeritageClause(token, types) {
        var node = createBaseNode(297 /* SyntaxKind.HeritageClause */);
        node.token = token;
        node.types = createNodeArray(types);
        node.transformFlags |= propagateChildrenFlags(node.types);
        switch (token) {
            case 96 /* SyntaxKind.ExtendsKeyword */:
                node.transformFlags |= 1024 /* TransformFlags.ContainsES2015 */;
                break;
            case 119 /* SyntaxKind.ImplementsKeyword */:
                node.transformFlags |= 1 /* TransformFlags.ContainsTypeScript */;
                break;
            default:
                return ts_1.Debug.assertNever(token);
        }
        return node;
    }
    // @api
    function updateHeritageClause(node, types) {
        return node.types !== types
            ? update(createHeritageClause(node.token, types), node)
            : node;
    }
    // @api
    function createCatchClause(variableDeclaration, block) {
        var node = createBaseNode(298 /* SyntaxKind.CatchClause */);
        node.variableDeclaration = asVariableDeclaration(variableDeclaration);
        node.block = block;
        node.transformFlags |=
            propagateChildFlags(node.variableDeclaration) |
                propagateChildFlags(node.block) |
                (!variableDeclaration ? 64 /* TransformFlags.ContainsES2019 */ : 0 /* TransformFlags.None */);
        node.locals = undefined; // initialized by binder (LocalsContainer)
        node.nextContainer = undefined; // initialized by binder (LocalsContainer)
        return node;
    }
    // @api
    function updateCatchClause(node, variableDeclaration, block) {
        return node.variableDeclaration !== variableDeclaration
            || node.block !== block
            ? update(createCatchClause(variableDeclaration, block), node)
            : node;
    }
    //
    // Property assignments
    //
    // @api
    function createPropertyAssignment(name, initializer) {
        var node = createBaseDeclaration(302 /* SyntaxKind.PropertyAssignment */);
        node.name = asName(name);
        node.initializer = parenthesizerRules().parenthesizeExpressionForDisallowedComma(initializer);
        node.transformFlags |=
            propagateNameFlags(node.name) |
                propagateChildFlags(node.initializer);
        node.modifiers = undefined; // initialized by parser to report grammar errors
        node.questionToken = undefined; // initialized by parser to report grammar errors
        node.exclamationToken = undefined; // initialized by parser to report grammar errors
        node.jsDoc = undefined; // initialized by parser (JsDocContainer)
        return node;
    }
    // @api
    function updatePropertyAssignment(node, name, initializer) {
        return node.name !== name
            || node.initializer !== initializer
            ? finishUpdatePropertyAssignment(createPropertyAssignment(name, initializer), node)
            : node;
    }
    function finishUpdatePropertyAssignment(updated, original) {
        // copy children used only for error reporting
        if (updated !== original) {
            // copy children used only for error reporting
            updated.modifiers = original.modifiers;
            updated.questionToken = original.questionToken;
            updated.exclamationToken = original.exclamationToken;
        }
        return update(updated, original);
    }
    // @api
    function createShorthandPropertyAssignment(name, objectAssignmentInitializer) {
        var node = createBaseDeclaration(303 /* SyntaxKind.ShorthandPropertyAssignment */);
        node.name = asName(name);
        node.objectAssignmentInitializer = objectAssignmentInitializer && parenthesizerRules().parenthesizeExpressionForDisallowedComma(objectAssignmentInitializer);
        node.transformFlags |=
            propagateIdentifierNameFlags(node.name) |
                propagateChildFlags(node.objectAssignmentInitializer) |
                1024 /* TransformFlags.ContainsES2015 */;
        node.equalsToken = undefined; // initialized by parser to report grammar errors
        node.modifiers = undefined; // initialized by parser to report grammar errors
        node.questionToken = undefined; // initialized by parser to report grammar errors
        node.exclamationToken = undefined; // initialized by parser to report grammar errors
        node.jsDoc = undefined; // initialized by parser (JsDocContainer)
        return node;
    }
    // @api
    function updateShorthandPropertyAssignment(node, name, objectAssignmentInitializer) {
        return node.name !== name
            || node.objectAssignmentInitializer !== objectAssignmentInitializer
            ? finishUpdateShorthandPropertyAssignment(createShorthandPropertyAssignment(name, objectAssignmentInitializer), node)
            : node;
    }
    function finishUpdateShorthandPropertyAssignment(updated, original) {
        if (updated !== original) {
            // copy children used only for error reporting
            updated.modifiers = original.modifiers;
            updated.questionToken = original.questionToken;
            updated.exclamationToken = original.exclamationToken;
            updated.equalsToken = original.equalsToken;
        }
        return update(updated, original);
    }
    // @api
    function createSpreadAssignment(expression) {
        var node = createBaseDeclaration(304 /* SyntaxKind.SpreadAssignment */);
        node.expression = parenthesizerRules().parenthesizeExpressionForDisallowedComma(expression);
        node.transformFlags |=
            propagateChildFlags(node.expression) |
                128 /* TransformFlags.ContainsES2018 */ |
                65536 /* TransformFlags.ContainsObjectRestOrSpread */;
        node.jsDoc = undefined; // initialized by parser (JsDocContainer)
        return node;
    }
    // @api
    function updateSpreadAssignment(node, expression) {
        return node.expression !== expression
            ? update(createSpreadAssignment(expression), node)
            : node;
    }
    //
    // Enum
    //
    // @api
    function createEnumMember(name, initializer) {
        var node = createBaseDeclaration(305 /* SyntaxKind.EnumMember */);
        node.name = asName(name);
        node.initializer = initializer && parenthesizerRules().parenthesizeExpressionForDisallowedComma(initializer);
        node.transformFlags |=
            propagateChildFlags(node.name) |
                propagateChildFlags(node.initializer) |
                1 /* TransformFlags.ContainsTypeScript */;
        node.jsDoc = undefined; // initialized by parser (JsDocContainer)
        return node;
    }
    // @api
    function updateEnumMember(node, name, initializer) {
        return node.name !== name
            || node.initializer !== initializer
            ? update(createEnumMember(name, initializer), node)
            : node;
    }
    //
    // Top-level nodes
    //
    // @api
    function createSourceFile(statements, endOfFileToken, flags) {
        var node = baseFactory.createBaseSourceFileNode(311 /* SyntaxKind.SourceFile */);
        node.statements = createNodeArray(statements);
        node.endOfFileToken = endOfFileToken;
        node.flags |= flags;
        node.text = "";
        node.fileName = "";
        node.path = "";
        node.resolvedPath = "";
        node.originalFileName = "";
        node.languageVersion = 0;
        node.languageVariant = 0;
        node.scriptKind = 0;
        node.isDeclarationFile = false;
        node.hasNoDefaultLib = false;
        node.transformFlags |=
            propagateChildrenFlags(node.statements) |
                propagateChildFlags(node.endOfFileToken);
        node.locals = undefined; // initialized by binder (LocalsContainer)
        node.nextContainer = undefined; // initialized by binder (LocalsContainer)
        node.endFlowNode = undefined;
        node.nodeCount = 0;
        node.identifierCount = 0;
        node.symbolCount = 0;
        node.parseDiagnostics = undefined;
        node.bindDiagnostics = undefined;
        node.bindSuggestionDiagnostics = undefined;
        node.lineMap = undefined;
        node.externalModuleIndicator = undefined;
        node.setExternalModuleIndicator = undefined;
        node.pragmas = undefined;
        node.checkJsDirective = undefined;
        node.referencedFiles = undefined;
        node.typeReferenceDirectives = undefined;
        node.libReferenceDirectives = undefined;
        node.amdDependencies = undefined;
        node.commentDirectives = undefined;
        node.identifiers = undefined;
        node.packageJsonLocations = undefined;
        node.packageJsonScope = undefined;
        node.imports = undefined;
        node.moduleAugmentations = undefined;
        node.ambientModuleNames = undefined;
        node.resolvedModules = undefined;
        node.classifiableNames = undefined;
        node.impliedNodeFormat = undefined;
        return node;
    }
    function createRedirectedSourceFile(redirectInfo) {
        var node = Object.create(redirectInfo.redirectTarget);
        Object.defineProperties(node, {
            id: {
                get: function () { return this.redirectInfo.redirectTarget.id; },
                set: function (value) { this.redirectInfo.redirectTarget.id = value; },
            },
            symbol: {
                get: function () { return this.redirectInfo.redirectTarget.symbol; },
                set: function (value) { this.redirectInfo.redirectTarget.symbol = value; },
            },
        });
        node.redirectInfo = redirectInfo;
        return node;
    }
    function cloneRedirectedSourceFile(source) {
        var node = createRedirectedSourceFile(source.redirectInfo);
        node.flags |= source.flags & ~8 /* NodeFlags.Synthesized */;
        node.fileName = source.fileName;
        node.path = source.path;
        node.resolvedPath = source.resolvedPath;
        node.originalFileName = source.originalFileName;
        node.packageJsonLocations = source.packageJsonLocations;
        node.packageJsonScope = source.packageJsonScope;
        node.emitNode = undefined;
        return node;
    }
    function cloneSourceFileWorker(source) {
        // TODO: This mechanism for cloning results in megamorphic property reads and writes. In future perf-related
        //       work, we should consider switching explicit property assignments instead of using `for..in`.
        var node = baseFactory.createBaseSourceFileNode(311 /* SyntaxKind.SourceFile */);
        node.flags |= source.flags & ~8 /* NodeFlags.Synthesized */;
        for (var p in source) {
            if ((0, ts_1.hasProperty)(node, p) || !(0, ts_1.hasProperty)(source, p)) {
                continue;
            }
            if (p === "emitNode") {
                node.emitNode = undefined;
                continue;
            }
            node[p] = source[p];
        }
        return node;
    }
    function cloneSourceFile(source) {
        var node = source.redirectInfo ? cloneRedirectedSourceFile(source) : cloneSourceFileWorker(source);
        setOriginalNode(node, source);
        return node;
    }
    function cloneSourceFileWithChanges(source, statements, isDeclarationFile, referencedFiles, typeReferences, hasNoDefaultLib, libReferences) {
        var node = cloneSourceFile(source);
        node.statements = createNodeArray(statements);
        node.isDeclarationFile = isDeclarationFile;
        node.referencedFiles = referencedFiles;
        node.typeReferenceDirectives = typeReferences;
        node.hasNoDefaultLib = hasNoDefaultLib;
        node.libReferenceDirectives = libReferences;
        node.transformFlags =
            propagateChildrenFlags(node.statements) |
                propagateChildFlags(node.endOfFileToken);
        return node;
    }
    // @api
    function updateSourceFile(node, statements, isDeclarationFile, referencedFiles, typeReferenceDirectives, hasNoDefaultLib, libReferenceDirectives) {
        if (isDeclarationFile === void 0) { isDeclarationFile = node.isDeclarationFile; }
        if (referencedFiles === void 0) { referencedFiles = node.referencedFiles; }
        if (typeReferenceDirectives === void 0) { typeReferenceDirectives = node.typeReferenceDirectives; }
        if (hasNoDefaultLib === void 0) { hasNoDefaultLib = node.hasNoDefaultLib; }
        if (libReferenceDirectives === void 0) { libReferenceDirectives = node.libReferenceDirectives; }
        return node.statements !== statements
            || node.isDeclarationFile !== isDeclarationFile
            || node.referencedFiles !== referencedFiles
            || node.typeReferenceDirectives !== typeReferenceDirectives
            || node.hasNoDefaultLib !== hasNoDefaultLib
            || node.libReferenceDirectives !== libReferenceDirectives
            ? update(cloneSourceFileWithChanges(node, statements, isDeclarationFile, referencedFiles, typeReferenceDirectives, hasNoDefaultLib, libReferenceDirectives), node)
            : node;
    }
    // @api
    function createBundle(sourceFiles, prepends) {
        if (prepends === void 0) { prepends = ts_1.emptyArray; }
        var node = createBaseNode(312 /* SyntaxKind.Bundle */);
        node.prepends = prepends;
        node.sourceFiles = sourceFiles;
        node.syntheticFileReferences = undefined;
        node.syntheticTypeReferences = undefined;
        node.syntheticLibReferences = undefined;
        node.hasNoDefaultLib = undefined;
        return node;
    }
    // @api
    function updateBundle(node, sourceFiles, prepends) {
        if (prepends === void 0) { prepends = ts_1.emptyArray; }
        return node.sourceFiles !== sourceFiles
            || node.prepends !== prepends
            ? update(createBundle(sourceFiles, prepends), node)
            : node;
    }
    // @api
    function createUnparsedSource(prologues, syntheticReferences, texts) {
        var node = createBaseNode(313 /* SyntaxKind.UnparsedSource */);
        node.prologues = prologues;
        node.syntheticReferences = syntheticReferences;
        node.texts = texts;
        node.fileName = "";
        node.text = "";
        node.referencedFiles = ts_1.emptyArray;
        node.libReferenceDirectives = ts_1.emptyArray;
        node.getLineAndCharacterOfPosition = function (pos) { return (0, ts_1.getLineAndCharacterOfPosition)(node, pos); };
        return node;
    }
    function createBaseUnparsedNode(kind, data) {
        var node = createBaseNode(kind);
        node.data = data;
        return node;
    }
    // @api
    function createUnparsedPrologue(data) {
        return createBaseUnparsedNode(306 /* SyntaxKind.UnparsedPrologue */, data);
    }
    // @api
    function createUnparsedPrepend(data, texts) {
        var node = createBaseUnparsedNode(307 /* SyntaxKind.UnparsedPrepend */, data);
        node.texts = texts;
        return node;
    }
    // @api
    function createUnparsedTextLike(data, internal) {
        return createBaseUnparsedNode(internal ? 309 /* SyntaxKind.UnparsedInternalText */ : 308 /* SyntaxKind.UnparsedText */, data);
    }
    // @api
    function createUnparsedSyntheticReference(section) {
        var node = createBaseNode(310 /* SyntaxKind.UnparsedSyntheticReference */);
        node.data = section.data;
        node.section = section;
        return node;
    }
    // @api
    function createInputFiles() {
        var node = createBaseNode(314 /* SyntaxKind.InputFiles */);
        node.javascriptText = "";
        node.declarationText = "";
        return node;
    }
    //
    // Synthetic Nodes (used by checker)
    //
    // @api
    function createSyntheticExpression(type, isSpread, tupleNameSource) {
        if (isSpread === void 0) { isSpread = false; }
        var node = createBaseNode(236 /* SyntaxKind.SyntheticExpression */);
        node.type = type;
        node.isSpread = isSpread;
        node.tupleNameSource = tupleNameSource;
        return node;
    }
    // @api
    function createSyntaxList(children) {
        var node = createBaseNode(357 /* SyntaxKind.SyntaxList */);
        node._children = children;
        return node;
    }
    //
    // Transformation nodes
    //
    /**
     * Creates a synthetic statement to act as a placeholder for a not-emitted statement in
     * order to preserve comments.
     *
     * @param original The original statement.
     */
    // @api
    function createNotEmittedStatement(original) {
        var node = createBaseNode(358 /* SyntaxKind.NotEmittedStatement */);
        node.original = original;
        (0, ts_1.setTextRange)(node, original);
        return node;
    }
    /**
     * Creates a synthetic expression to act as a placeholder for a not-emitted expression in
     * order to preserve comments or sourcemap positions.
     *
     * @param expression The inner expression to emit.
     * @param original The original outer expression.
     */
    // @api
    function createPartiallyEmittedExpression(expression, original) {
        var node = createBaseNode(359 /* SyntaxKind.PartiallyEmittedExpression */);
        node.expression = expression;
        node.original = original;
        node.transformFlags |=
            propagateChildFlags(node.expression) |
                1 /* TransformFlags.ContainsTypeScript */;
        (0, ts_1.setTextRange)(node, original);
        return node;
    }
    // @api
    function updatePartiallyEmittedExpression(node, expression) {
        return node.expression !== expression
            ? update(createPartiallyEmittedExpression(expression, node.original), node)
            : node;
    }
    function flattenCommaElements(node) {
        if ((0, ts_1.nodeIsSynthesized)(node) && !(0, ts_1.isParseTreeNode)(node) && !node.original && !node.emitNode && !node.id) {
            if ((0, ts_1.isCommaListExpression)(node)) {
                return node.elements;
            }
            if ((0, ts_1.isBinaryExpression)(node) && (0, ts_1.isCommaToken)(node.operatorToken)) {
                return [node.left, node.right];
            }
        }
        return node;
    }
    // @api
    function createCommaListExpression(elements) {
        var node = createBaseNode(360 /* SyntaxKind.CommaListExpression */);
        node.elements = createNodeArray((0, ts_1.sameFlatMap)(elements, flattenCommaElements));
        node.transformFlags |= propagateChildrenFlags(node.elements);
        return node;
    }
    // @api
    function updateCommaListExpression(node, elements) {
        return node.elements !== elements
            ? update(createCommaListExpression(elements), node)
            : node;
    }
    // @api
    function createSyntheticReferenceExpression(expression, thisArg) {
        var node = createBaseNode(361 /* SyntaxKind.SyntheticReferenceExpression */);
        node.expression = expression;
        node.thisArg = thisArg;
        node.transformFlags |=
            propagateChildFlags(node.expression) |
                propagateChildFlags(node.thisArg);
        return node;
    }
    // @api
    function updateSyntheticReferenceExpression(node, expression, thisArg) {
        return node.expression !== expression
            || node.thisArg !== thisArg
            ? update(createSyntheticReferenceExpression(expression, thisArg), node)
            : node;
    }
    function cloneGeneratedIdentifier(node) {
        var clone = createBaseIdentifier(node.escapedText);
        clone.flags |= node.flags & ~8 /* NodeFlags.Synthesized */;
        clone.transformFlags = node.transformFlags;
        setOriginalNode(clone, node);
        (0, ts_1.setIdentifierAutoGenerate)(clone, __assign({}, node.emitNode.autoGenerate));
        return clone;
    }
    function cloneIdentifier(node) {
        var clone = createBaseIdentifier(node.escapedText);
        clone.flags |= node.flags & ~8 /* NodeFlags.Synthesized */;
        clone.jsDoc = node.jsDoc;
        clone.flowNode = node.flowNode;
        clone.symbol = node.symbol;
        clone.transformFlags = node.transformFlags;
        setOriginalNode(clone, node);
        // clone type arguments for emitter/typeWriter
        var typeArguments = (0, ts_1.getIdentifierTypeArguments)(node);
        if (typeArguments)
            (0, ts_1.setIdentifierTypeArguments)(clone, typeArguments);
        return clone;
    }
    function cloneGeneratedPrivateIdentifier(node) {
        var clone = createBasePrivateIdentifier(node.escapedText);
        clone.flags |= node.flags & ~8 /* NodeFlags.Synthesized */;
        clone.transformFlags = node.transformFlags;
        setOriginalNode(clone, node);
        (0, ts_1.setIdentifierAutoGenerate)(clone, __assign({}, node.emitNode.autoGenerate));
        return clone;
    }
    function clonePrivateIdentifier(node) {
        var clone = createBasePrivateIdentifier(node.escapedText);
        clone.flags |= node.flags & ~8 /* NodeFlags.Synthesized */;
        clone.transformFlags = node.transformFlags;
        setOriginalNode(clone, node);
        return clone;
    }
    function cloneNode(node) {
        // We don't use "clone" from core.ts here, as we need to preserve the prototype chain of
        // the original node. We also need to exclude specific properties and only include own-
        // properties (to skip members already defined on the shared prototype).
        if (node === undefined) {
            return node;
        }
        if ((0, ts_1.isSourceFile)(node)) {
            return cloneSourceFile(node);
        }
        if ((0, ts_1.isGeneratedIdentifier)(node)) {
            return cloneGeneratedIdentifier(node);
        }
        if ((0, ts_1.isIdentifier)(node)) {
            return cloneIdentifier(node);
        }
        if ((0, ts_1.isGeneratedPrivateIdentifier)(node)) {
            return cloneGeneratedPrivateIdentifier(node);
        }
        if ((0, ts_1.isPrivateIdentifier)(node)) {
            return clonePrivateIdentifier(node);
        }
        var clone = !(0, ts_1.isNodeKind)(node.kind) ? baseFactory.createBaseTokenNode(node.kind) :
            baseFactory.createBaseNode(node.kind);
        clone.flags |= (node.flags & ~8 /* NodeFlags.Synthesized */);
        clone.transformFlags = node.transformFlags;
        setOriginalNode(clone, node);
        for (var key in node) {
            if ((0, ts_1.hasProperty)(clone, key) || !(0, ts_1.hasProperty)(node, key)) {
                continue;
            }
            clone[key] = node[key];
        }
        return clone;
    }
    function createImmediatelyInvokedFunctionExpression(statements, param, paramValue) {
        return createCallExpression(createFunctionExpression(
        /*modifiers*/ undefined, 
        /*asteriskToken*/ undefined, 
        /*name*/ undefined, 
        /*typeParameters*/ undefined, 
        /*parameters*/ param ? [param] : [], 
        /*type*/ undefined, createBlock(statements, /*multiLine*/ true)), 
        /*typeArguments*/ undefined, 
        /*argumentsArray*/ paramValue ? [paramValue] : []);
    }
    function createImmediatelyInvokedArrowFunction(statements, param, paramValue) {
        return createCallExpression(createArrowFunction(
        /*modifiers*/ undefined, 
        /*typeParameters*/ undefined, 
        /*parameters*/ param ? [param] : [], 
        /*type*/ undefined, 
        /*equalsGreaterThanToken*/ undefined, createBlock(statements, /*multiLine*/ true)), 
        /*typeArguments*/ undefined, 
        /*argumentsArray*/ paramValue ? [paramValue] : []);
    }
    function createVoidZero() {
        return createVoidExpression(createNumericLiteral("0"));
    }
    function createExportDefault(expression) {
        return createExportAssignment(
        /*modifiers*/ undefined, 
        /*isExportEquals*/ false, expression);
    }
    function createExternalModuleExport(exportName) {
        return createExportDeclaration(
        /*modifiers*/ undefined, 
        /*isTypeOnly*/ false, createNamedExports([
            createExportSpecifier(/*isTypeOnly*/ false, /*propertyName*/ undefined, exportName)
        ]));
    }
    //
    // Utilities
    //
    function createTypeCheck(value, tag) {
        return tag === "undefined"
            ? factory.createStrictEquality(value, createVoidZero())
            : factory.createStrictEquality(createTypeOfExpression(value), createStringLiteral(tag));
    }
    function createMethodCall(object, methodName, argumentsList) {
        // Preserve the optionality of `object`.
        if ((0, ts_1.isCallChain)(object)) {
            return createCallChain(createPropertyAccessChain(object, /*questionDotToken*/ undefined, methodName), 
            /*questionDotToken*/ undefined, 
            /*typeArguments*/ undefined, argumentsList);
        }
        return createCallExpression(createPropertyAccessExpression(object, methodName), 
        /*typeArguments*/ undefined, argumentsList);
    }
    function createFunctionBindCall(target, thisArg, argumentsList) {
        return createMethodCall(target, "bind", __spreadArray([thisArg], argumentsList, true));
    }
    function createFunctionCallCall(target, thisArg, argumentsList) {
        return createMethodCall(target, "call", __spreadArray([thisArg], argumentsList, true));
    }
    function createFunctionApplyCall(target, thisArg, argumentsExpression) {
        return createMethodCall(target, "apply", [thisArg, argumentsExpression]);
    }
    function createGlobalMethodCall(globalObjectName, methodName, argumentsList) {
        return createMethodCall(createIdentifier(globalObjectName), methodName, argumentsList);
    }
    function createArraySliceCall(array, start) {
        return createMethodCall(array, "slice", start === undefined ? [] : [asExpression(start)]);
    }
    function createArrayConcatCall(array, argumentsList) {
        return createMethodCall(array, "concat", argumentsList);
    }
    function createObjectDefinePropertyCall(target, propertyName, attributes) {
        return createGlobalMethodCall("Object", "defineProperty", [target, asExpression(propertyName), attributes]);
    }
    function createObjectGetOwnPropertyDescriptorCall(target, propertyName) {
        return createGlobalMethodCall("Object", "getOwnPropertyDescriptor", [target, asExpression(propertyName)]);
    }
    function createReflectGetCall(target, propertyKey, receiver) {
        return createGlobalMethodCall("Reflect", "get", receiver ? [target, propertyKey, receiver] : [target, propertyKey]);
    }
    function createReflectSetCall(target, propertyKey, value, receiver) {
        return createGlobalMethodCall("Reflect", "set", receiver ? [target, propertyKey, value, receiver] : [target, propertyKey, value]);
    }
    function tryAddPropertyAssignment(properties, propertyName, expression) {
        if (expression) {
            properties.push(createPropertyAssignment(propertyName, expression));
            return true;
        }
        return false;
    }
    function createPropertyDescriptor(attributes, singleLine) {
        var properties = [];
        tryAddPropertyAssignment(properties, "enumerable", asExpression(attributes.enumerable));
        tryAddPropertyAssignment(properties, "configurable", asExpression(attributes.configurable));
        var isData = tryAddPropertyAssignment(properties, "writable", asExpression(attributes.writable));
        isData = tryAddPropertyAssignment(properties, "value", attributes.value) || isData;
        var isAccessor = tryAddPropertyAssignment(properties, "get", attributes.get);
        isAccessor = tryAddPropertyAssignment(properties, "set", attributes.set) || isAccessor;
        ts_1.Debug.assert(!(isData && isAccessor), "A PropertyDescriptor may not be both an accessor descriptor and a data descriptor.");
        return createObjectLiteralExpression(properties, !singleLine);
    }
    function updateOuterExpression(outerExpression, expression) {
        switch (outerExpression.kind) {
            case 216 /* SyntaxKind.ParenthesizedExpression */: return updateParenthesizedExpression(outerExpression, expression);
            case 215 /* SyntaxKind.TypeAssertionExpression */: return updateTypeAssertion(outerExpression, outerExpression.type, expression);
            case 233 /* SyntaxKind.AsExpression */: return updateAsExpression(outerExpression, expression, outerExpression.type);
            case 237 /* SyntaxKind.SatisfiesExpression */: return updateSatisfiesExpression(outerExpression, expression, outerExpression.type);
            case 234 /* SyntaxKind.NonNullExpression */: return updateNonNullExpression(outerExpression, expression);
            case 359 /* SyntaxKind.PartiallyEmittedExpression */: return updatePartiallyEmittedExpression(outerExpression, expression);
        }
    }
    /**
     * Determines whether a node is a parenthesized expression that can be ignored when recreating outer expressions.
     *
     * A parenthesized expression can be ignored when all of the following are true:
     *
     * - It's `pos` and `end` are not -1
     * - It does not have a custom source map range
     * - It does not have a custom comment range
     * - It does not have synthetic leading or trailing comments
     *
     * If an outermost parenthesized expression is ignored, but the containing expression requires a parentheses around
     * the expression to maintain precedence, a new parenthesized expression should be created automatically when
     * the containing expression is created/updated.
     */
    function isIgnorableParen(node) {
        return (0, ts_1.isParenthesizedExpression)(node)
            && (0, ts_1.nodeIsSynthesized)(node)
            && (0, ts_1.nodeIsSynthesized)((0, ts_1.getSourceMapRange)(node))
            && (0, ts_1.nodeIsSynthesized)((0, ts_1.getCommentRange)(node))
            && !(0, ts_1.some)((0, ts_1.getSyntheticLeadingComments)(node))
            && !(0, ts_1.some)((0, ts_1.getSyntheticTrailingComments)(node));
    }
    function restoreOuterExpressions(outerExpression, innerExpression, kinds) {
        if (kinds === void 0) { kinds = 15 /* OuterExpressionKinds.All */; }
        if (outerExpression && (0, ts_1.isOuterExpression)(outerExpression, kinds) && !isIgnorableParen(outerExpression)) {
            return updateOuterExpression(outerExpression, restoreOuterExpressions(outerExpression.expression, innerExpression));
        }
        return innerExpression;
    }
    function restoreEnclosingLabel(node, outermostLabeledStatement, afterRestoreLabelCallback) {
        if (!outermostLabeledStatement) {
            return node;
        }
        var updated = updateLabeledStatement(outermostLabeledStatement, outermostLabeledStatement.label, (0, ts_1.isLabeledStatement)(outermostLabeledStatement.statement)
            ? restoreEnclosingLabel(node, outermostLabeledStatement.statement)
            : node);
        if (afterRestoreLabelCallback) {
            afterRestoreLabelCallback(outermostLabeledStatement);
        }
        return updated;
    }
    function shouldBeCapturedInTempVariable(node, cacheIdentifiers) {
        var target = (0, ts_1.skipParentheses)(node);
        switch (target.kind) {
            case 80 /* SyntaxKind.Identifier */:
                return cacheIdentifiers;
            case 110 /* SyntaxKind.ThisKeyword */:
            case 9 /* SyntaxKind.NumericLiteral */:
            case 10 /* SyntaxKind.BigIntLiteral */:
            case 11 /* SyntaxKind.StringLiteral */:
                return false;
            case 208 /* SyntaxKind.ArrayLiteralExpression */:
                var elements = target.elements;
                if (elements.length === 0) {
                    return false;
                }
                return true;
            case 209 /* SyntaxKind.ObjectLiteralExpression */:
                return target.properties.length > 0;
            default:
                return true;
        }
    }
    function createCallBinding(expression, recordTempVariable, languageVersion, cacheIdentifiers) {
        if (cacheIdentifiers === void 0) { cacheIdentifiers = false; }
        var callee = (0, ts_1.skipOuterExpressions)(expression, 15 /* OuterExpressionKinds.All */);
        var thisArg;
        var target;
        if ((0, ts_1.isSuperProperty)(callee)) {
            thisArg = createThis();
            target = callee;
        }
        else if ((0, ts_1.isSuperKeyword)(callee)) {
            thisArg = createThis();
            target = languageVersion !== undefined && languageVersion < 2 /* ScriptTarget.ES2015 */
                ? (0, ts_1.setTextRange)(createIdentifier("_super"), callee)
                : callee;
        }
        else if ((0, ts_1.getEmitFlags)(callee) & 8192 /* EmitFlags.HelperName */) {
            thisArg = createVoidZero();
            target = parenthesizerRules().parenthesizeLeftSideOfAccess(callee, /*optionalChain*/ false);
        }
        else if ((0, ts_1.isPropertyAccessExpression)(callee)) {
            if (shouldBeCapturedInTempVariable(callee.expression, cacheIdentifiers)) {
                // for `a.b()` target is `(_a = a).b` and thisArg is `_a`
                thisArg = createTempVariable(recordTempVariable);
                target = createPropertyAccessExpression((0, ts_1.setTextRange)(factory.createAssignment(thisArg, callee.expression), callee.expression), callee.name);
                (0, ts_1.setTextRange)(target, callee);
            }
            else {
                thisArg = callee.expression;
                target = callee;
            }
        }
        else if ((0, ts_1.isElementAccessExpression)(callee)) {
            if (shouldBeCapturedInTempVariable(callee.expression, cacheIdentifiers)) {
                // for `a[b]()` target is `(_a = a)[b]` and thisArg is `_a`
                thisArg = createTempVariable(recordTempVariable);
                target = createElementAccessExpression((0, ts_1.setTextRange)(factory.createAssignment(thisArg, callee.expression), callee.expression), callee.argumentExpression);
                (0, ts_1.setTextRange)(target, callee);
            }
            else {
                thisArg = callee.expression;
                target = callee;
            }
        }
        else {
            // for `a()` target is `a` and thisArg is `void 0`
            thisArg = createVoidZero();
            target = parenthesizerRules().parenthesizeLeftSideOfAccess(expression, /*optionalChain*/ false);
        }
        return { target: target, thisArg: thisArg };
    }
    function createAssignmentTargetWrapper(paramName, expression) {
        return createPropertyAccessExpression(
        // Explicit parens required because of v8 regression (https://bugs.chromium.org/p/v8/issues/detail?id=9560)
        createParenthesizedExpression(createObjectLiteralExpression([
            createSetAccessorDeclaration(
            /*modifiers*/ undefined, "value", [createParameterDeclaration(
                /*modifiers*/ undefined, 
                /*dotDotDotToken*/ undefined, paramName, 
                /*questionToken*/ undefined, 
                /*type*/ undefined, 
                /*initializer*/ undefined)], createBlock([
                createExpressionStatement(expression)
            ]))
        ])), "value");
    }
    function inlineExpressions(expressions) {
        // Avoid deeply nested comma expressions as traversing them during emit can result in "Maximum call
        // stack size exceeded" errors.
        return expressions.length > 10
            ? createCommaListExpression(expressions)
            : (0, ts_1.reduceLeft)(expressions, factory.createComma);
    }
    function getName(node, allowComments, allowSourceMaps, emitFlags, ignoreAssignedName) {
        if (emitFlags === void 0) { emitFlags = 0; }
        var nodeName = ignoreAssignedName ? node && (0, ts_1.getNonAssignedNameOfDeclaration)(node) : (0, ts_1.getNameOfDeclaration)(node);
        if (nodeName && (0, ts_1.isIdentifier)(nodeName) && !(0, ts_1.isGeneratedIdentifier)(nodeName)) {
            // TODO(rbuckton): Does this need to be parented?
            var name_1 = (0, ts_1.setParent)((0, ts_1.setTextRange)(cloneNode(nodeName), nodeName), nodeName.parent);
            emitFlags |= (0, ts_1.getEmitFlags)(nodeName);
            if (!allowSourceMaps)
                emitFlags |= 96 /* EmitFlags.NoSourceMap */;
            if (!allowComments)
                emitFlags |= 3072 /* EmitFlags.NoComments */;
            if (emitFlags)
                (0, ts_1.setEmitFlags)(name_1, emitFlags);
            return name_1;
        }
        return getGeneratedNameForNode(node);
    }
    /**
     * Gets the internal name of a declaration. This is primarily used for declarations that can be
     * referred to by name in the body of an ES5 class function body. An internal name will *never*
     * be prefixed with an module or namespace export modifier like "exports." when emitted as an
     * expression. An internal name will also *never* be renamed due to a collision with a block
     * scoped variable.
     *
     * @param node The declaration.
     * @param allowComments A value indicating whether comments may be emitted for the name.
     * @param allowSourceMaps A value indicating whether source maps may be emitted for the name.
     */
    function getInternalName(node, allowComments, allowSourceMaps) {
        return getName(node, allowComments, allowSourceMaps, 32768 /* EmitFlags.LocalName */ | 65536 /* EmitFlags.InternalName */);
    }
    /**
     * Gets the local name of a declaration. This is primarily used for declarations that can be
     * referred to by name in the declaration's immediate scope (classes, enums, namespaces). A
     * local name will *never* be prefixed with an module or namespace export modifier like
     * "exports." when emitted as an expression.
     *
     * @param node The declaration.
     * @param allowComments A value indicating whether comments may be emitted for the name.
     * @param allowSourceMaps A value indicating whether source maps may be emitted for the name.
     * @param ignoreAssignedName Indicates that the assigned name of a declaration shouldn't be considered.
     */
    function getLocalName(node, allowComments, allowSourceMaps, ignoreAssignedName) {
        return getName(node, allowComments, allowSourceMaps, 32768 /* EmitFlags.LocalName */, ignoreAssignedName);
    }
    /**
     * Gets the export name of a declaration. This is primarily used for declarations that can be
     * referred to by name in the declaration's immediate scope (classes, enums, namespaces). An
     * export name will *always* be prefixed with an module or namespace export modifier like
     * `"exports."` when emitted as an expression if the name points to an exported symbol.
     *
     * @param node The declaration.
     * @param allowComments A value indicating whether comments may be emitted for the name.
     * @param allowSourceMaps A value indicating whether source maps may be emitted for the name.
     */
    function getExportName(node, allowComments, allowSourceMaps) {
        return getName(node, allowComments, allowSourceMaps, 16384 /* EmitFlags.ExportName */);
    }
    /**
     * Gets the name of a declaration for use in declarations.
     *
     * @param node The declaration.
     * @param allowComments A value indicating whether comments may be emitted for the name.
     * @param allowSourceMaps A value indicating whether source maps may be emitted for the name.
     */
    function getDeclarationName(node, allowComments, allowSourceMaps) {
        return getName(node, allowComments, allowSourceMaps);
    }
    /**
     * Gets a namespace-qualified name for use in expressions.
     *
     * @param ns The namespace identifier.
     * @param name The name.
     * @param allowComments A value indicating whether comments may be emitted for the name.
     * @param allowSourceMaps A value indicating whether source maps may be emitted for the name.
     */
    function getNamespaceMemberName(ns, name, allowComments, allowSourceMaps) {
        var qualifiedName = createPropertyAccessExpression(ns, (0, ts_1.nodeIsSynthesized)(name) ? name : cloneNode(name));
        (0, ts_1.setTextRange)(qualifiedName, name);
        var emitFlags = 0;
        if (!allowSourceMaps)
            emitFlags |= 96 /* EmitFlags.NoSourceMap */;
        if (!allowComments)
            emitFlags |= 3072 /* EmitFlags.NoComments */;
        if (emitFlags)
            (0, ts_1.setEmitFlags)(qualifiedName, emitFlags);
        return qualifiedName;
    }
    /**
     * Gets the exported name of a declaration for use in expressions.
     *
     * An exported name will *always* be prefixed with an module or namespace export modifier like
     * "exports." if the name points to an exported symbol.
     *
     * @param ns The namespace identifier.
     * @param node The declaration.
     * @param allowComments A value indicating whether comments may be emitted for the name.
     * @param allowSourceMaps A value indicating whether source maps may be emitted for the name.
     */
    function getExternalModuleOrNamespaceExportName(ns, node, allowComments, allowSourceMaps) {
        if (ns && (0, ts_1.hasSyntacticModifier)(node, 1 /* ModifierFlags.Export */)) {
            return getNamespaceMemberName(ns, getName(node), allowComments, allowSourceMaps);
        }
        return getExportName(node, allowComments, allowSourceMaps);
    }
    /**
     * Copies any necessary standard and custom prologue-directives into target array.
     * @param source origin statements array
     * @param target result statements array
     * @param ensureUseStrict boolean determining whether the function need to add prologue-directives
     * @param visitor Optional callback used to visit any custom prologue directives.
     */
    function copyPrologue(source, target, ensureUseStrict, visitor) {
        var offset = copyStandardPrologue(source, target, 0, ensureUseStrict);
        return copyCustomPrologue(source, target, offset, visitor);
    }
    function isUseStrictPrologue(node) {
        return (0, ts_1.isStringLiteral)(node.expression) && node.expression.text === "use strict";
    }
    function createUseStrictPrologue() {
        return (0, ts_1.startOnNewLine)(createExpressionStatement(createStringLiteral("use strict")));
    }
    /**
     * Copies only the standard (string-expression) prologue-directives into the target statement-array.
     * @param source origin statements array
     * @param target result statements array
     * @param statementOffset The offset at which to begin the copy.
     * @param ensureUseStrict boolean determining whether the function need to add prologue-directives
     * @returns Count of how many directive statements were copied.
     */
    function copyStandardPrologue(source, target, statementOffset, ensureUseStrict) {
        if (statementOffset === void 0) { statementOffset = 0; }
        ts_1.Debug.assert(target.length === 0, "Prologue directives should be at the first statement in the target statements array");
        var foundUseStrict = false;
        var numStatements = source.length;
        while (statementOffset < numStatements) {
            var statement = source[statementOffset];
            if ((0, ts_1.isPrologueDirective)(statement)) {
                if (isUseStrictPrologue(statement)) {
                    foundUseStrict = true;
                }
                target.push(statement);
            }
            else {
                break;
            }
            statementOffset++;
        }
        if (ensureUseStrict && !foundUseStrict) {
            target.push(createUseStrictPrologue());
        }
        return statementOffset;
    }
    function copyCustomPrologue(source, target, statementOffset, visitor, filter) {
        if (filter === void 0) { filter = ts_1.returnTrue; }
        var numStatements = source.length;
        while (statementOffset !== undefined && statementOffset < numStatements) {
            var statement = source[statementOffset];
            if ((0, ts_1.getEmitFlags)(statement) & 2097152 /* EmitFlags.CustomPrologue */ && filter(statement)) {
                (0, ts_1.append)(target, visitor ? (0, ts_1.visitNode)(statement, visitor, ts_1.isStatement) : statement);
            }
            else {
                break;
            }
            statementOffset++;
        }
        return statementOffset;
    }
    /**
     * Ensures "use strict" directive is added
     *
     * @param statements An array of statements
     */
    function ensureUseStrict(statements) {
        var foundUseStrict = (0, ts_1.findUseStrictPrologue)(statements);
        if (!foundUseStrict) {
            return (0, ts_1.setTextRange)(createNodeArray(__spreadArray([createUseStrictPrologue()], statements, true)), statements);
        }
        return statements;
    }
    /**
     * Lifts a NodeArray containing only Statement nodes to a block.
     *
     * @param nodes The NodeArray.
     */
    function liftToBlock(nodes) {
        ts_1.Debug.assert((0, ts_1.every)(nodes, ts_1.isStatementOrBlock), "Cannot lift nodes to a Block.");
        return (0, ts_1.singleOrUndefined)(nodes) || createBlock(nodes);
    }
    function findSpanEnd(array, test, start) {
        var i = start;
        while (i < array.length && test(array[i])) {
            i++;
        }
        return i;
    }
    function mergeLexicalEnvironment(statements, declarations) {
        if (!(0, ts_1.some)(declarations)) {
            return statements;
        }
        // When we merge new lexical statements into an existing statement list, we merge them in the following manner:
        //
        // Given:
        //
        // | Left                               | Right                               |
        // |------------------------------------|-------------------------------------|
        // | [standard prologues (left)]        | [standard prologues (right)]        |
        // | [hoisted functions (left)]         | [hoisted functions (right)]         |
        // | [hoisted variables (left)]         | [hoisted variables (right)]         |
        // | [lexical init statements (left)]   | [lexical init statements (right)]   |
        // | [other statements (left)]          |                                     |
        //
        // The resulting statement list will be:
        //
        // | Result                              |
        // |-------------------------------------|
        // | [standard prologues (right)]        |
        // | [standard prologues (left)]         |
        // | [hoisted functions (right)]         |
        // | [hoisted functions (left)]          |
        // | [hoisted variables (right)]         |
        // | [hoisted variables (left)]          |
        // | [lexical init statements (right)]   |
        // | [lexical init statements (left)]    |
        // | [other statements (left)]           |
        //
        // NOTE: It is expected that new lexical init statements must be evaluated before existing lexical init statements,
        // as the prior transformation may depend on the evaluation of the lexical init statements to be in the correct state.
        // find standard prologues on left in the following order: standard directives, hoisted functions, hoisted variables, other custom
        var leftStandardPrologueEnd = findSpanEnd(statements, ts_1.isPrologueDirective, 0);
        var leftHoistedFunctionsEnd = findSpanEnd(statements, ts_1.isHoistedFunction, leftStandardPrologueEnd);
        var leftHoistedVariablesEnd = findSpanEnd(statements, ts_1.isHoistedVariableStatement, leftHoistedFunctionsEnd);
        // find standard prologues on right in the following order: standard directives, hoisted functions, hoisted variables, other custom
        var rightStandardPrologueEnd = findSpanEnd(declarations, ts_1.isPrologueDirective, 0);
        var rightHoistedFunctionsEnd = findSpanEnd(declarations, ts_1.isHoistedFunction, rightStandardPrologueEnd);
        var rightHoistedVariablesEnd = findSpanEnd(declarations, ts_1.isHoistedVariableStatement, rightHoistedFunctionsEnd);
        var rightCustomPrologueEnd = findSpanEnd(declarations, ts_1.isCustomPrologue, rightHoistedVariablesEnd);
        ts_1.Debug.assert(rightCustomPrologueEnd === declarations.length, "Expected declarations to be valid standard or custom prologues");
        // splice prologues from the right into the left. We do this in reverse order
        // so that we don't need to recompute the index on the left when we insert items.
        var left = (0, ts_1.isNodeArray)(statements) ? statements.slice() : statements;
        // splice other custom prologues from right into left
        if (rightCustomPrologueEnd > rightHoistedVariablesEnd) {
            left.splice.apply(left, __spreadArray([leftHoistedVariablesEnd, 0], declarations.slice(rightHoistedVariablesEnd, rightCustomPrologueEnd), false));
        }
        // splice hoisted variables from right into left
        if (rightHoistedVariablesEnd > rightHoistedFunctionsEnd) {
            left.splice.apply(left, __spreadArray([leftHoistedFunctionsEnd, 0], declarations.slice(rightHoistedFunctionsEnd, rightHoistedVariablesEnd), false));
        }
        // splice hoisted functions from right into left
        if (rightHoistedFunctionsEnd > rightStandardPrologueEnd) {
            left.splice.apply(left, __spreadArray([leftStandardPrologueEnd, 0], declarations.slice(rightStandardPrologueEnd, rightHoistedFunctionsEnd), false));
        }
        // splice standard prologues from right into left (that are not already in left)
        if (rightStandardPrologueEnd > 0) {
            if (leftStandardPrologueEnd === 0) {
                left.splice.apply(left, __spreadArray([0, 0], declarations.slice(0, rightStandardPrologueEnd), false));
            }
            else {
                var leftPrologues = new Map();
                for (var i = 0; i < leftStandardPrologueEnd; i++) {
                    var leftPrologue = statements[i];
                    leftPrologues.set(leftPrologue.expression.text, true);
                }
                for (var i = rightStandardPrologueEnd - 1; i >= 0; i--) {
                    var rightPrologue = declarations[i];
                    if (!leftPrologues.has(rightPrologue.expression.text)) {
                        left.unshift(rightPrologue);
                    }
                }
            }
        }
        if ((0, ts_1.isNodeArray)(statements)) {
            return (0, ts_1.setTextRange)(createNodeArray(left, statements.hasTrailingComma), statements);
        }
        return statements;
    }
    function updateModifiers(node, modifiers) {
        var _a;
        var modifierArray;
        if (typeof modifiers === "number") {
            modifierArray = createModifiersFromModifierFlags(modifiers);
        }
        else {
            modifierArray = modifiers;
        }
        return (0, ts_1.isTypeParameterDeclaration)(node) ? updateTypeParameterDeclaration(node, modifierArray, node.name, node.constraint, node.default) :
            (0, ts_1.isParameter)(node) ? updateParameterDeclaration(node, modifierArray, node.dotDotDotToken, node.name, node.questionToken, node.type, node.initializer) :
                (0, ts_1.isConstructorTypeNode)(node) ? updateConstructorTypeNode1(node, modifierArray, node.typeParameters, node.parameters, node.type) :
                    (0, ts_1.isPropertySignature)(node) ? updatePropertySignature(node, modifierArray, node.name, node.questionToken, node.type) :
                        (0, ts_1.isPropertyDeclaration)(node) ? updatePropertyDeclaration(node, modifierArray, node.name, (_a = node.questionToken) !== null && _a !== void 0 ? _a : node.exclamationToken, node.type, node.initializer) :
                            (0, ts_1.isMethodSignature)(node) ? updateMethodSignature(node, modifierArray, node.name, node.questionToken, node.typeParameters, node.parameters, node.type) :
                                (0, ts_1.isMethodDeclaration)(node) ? updateMethodDeclaration(node, modifierArray, node.asteriskToken, node.name, node.questionToken, node.typeParameters, node.parameters, node.type, node.body) :
                                    (0, ts_1.isConstructorDeclaration)(node) ? updateConstructorDeclaration(node, modifierArray, node.parameters, node.body) :
                                        (0, ts_1.isGetAccessorDeclaration)(node) ? updateGetAccessorDeclaration(node, modifierArray, node.name, node.parameters, node.type, node.body) :
                                            (0, ts_1.isSetAccessorDeclaration)(node) ? updateSetAccessorDeclaration(node, modifierArray, node.name, node.parameters, node.body) :
                                                (0, ts_1.isIndexSignatureDeclaration)(node) ? updateIndexSignature(node, modifierArray, node.parameters, node.type) :
                                                    (0, ts_1.isFunctionExpression)(node) ? updateFunctionExpression(node, modifierArray, node.asteriskToken, node.name, node.typeParameters, node.parameters, node.type, node.body) :
                                                        (0, ts_1.isArrowFunction)(node) ? updateArrowFunction(node, modifierArray, node.typeParameters, node.parameters, node.type, node.equalsGreaterThanToken, node.body) :
                                                            (0, ts_1.isClassExpression)(node) ? updateClassExpression(node, modifierArray, node.name, node.typeParameters, node.heritageClauses, node.members) :
                                                                (0, ts_1.isVariableStatement)(node) ? updateVariableStatement(node, modifierArray, node.declarationList) :
                                                                    (0, ts_1.isFunctionDeclaration)(node) ? updateFunctionDeclaration(node, modifierArray, node.asteriskToken, node.name, node.typeParameters, node.parameters, node.type, node.body) :
                                                                        (0, ts_1.isClassDeclaration)(node) ? updateClassDeclaration(node, modifierArray, node.name, node.typeParameters, node.heritageClauses, node.members) :
                                                                            (0, ts_1.isInterfaceDeclaration)(node) ? updateInterfaceDeclaration(node, modifierArray, node.name, node.typeParameters, node.heritageClauses, node.members) :
                                                                                (0, ts_1.isTypeAliasDeclaration)(node) ? updateTypeAliasDeclaration(node, modifierArray, node.name, node.typeParameters, node.type) :
                                                                                    (0, ts_1.isEnumDeclaration)(node) ? updateEnumDeclaration(node, modifierArray, node.name, node.members) :
                                                                                        (0, ts_1.isModuleDeclaration)(node) ? updateModuleDeclaration(node, modifierArray, node.name, node.body) :
                                                                                            (0, ts_1.isImportEqualsDeclaration)(node) ? updateImportEqualsDeclaration(node, modifierArray, node.isTypeOnly, node.name, node.moduleReference) :
                                                                                                (0, ts_1.isImportDeclaration)(node) ? updateImportDeclaration(node, modifierArray, node.importClause, node.moduleSpecifier, node.assertClause) :
                                                                                                    (0, ts_1.isExportAssignment)(node) ? updateExportAssignment(node, modifierArray, node.expression) :
                                                                                                        (0, ts_1.isExportDeclaration)(node) ? updateExportDeclaration(node, modifierArray, node.isTypeOnly, node.exportClause, node.moduleSpecifier, node.assertClause) :
                                                                                                            ts_1.Debug.assertNever(node);
    }
    function updateModifierLike(node, modifierArray) {
        var _a;
        return (0, ts_1.isParameter)(node) ? updateParameterDeclaration(node, modifierArray, node.dotDotDotToken, node.name, node.questionToken, node.type, node.initializer) :
            (0, ts_1.isPropertyDeclaration)(node) ? updatePropertyDeclaration(node, modifierArray, node.name, (_a = node.questionToken) !== null && _a !== void 0 ? _a : node.exclamationToken, node.type, node.initializer) :
                (0, ts_1.isMethodDeclaration)(node) ? updateMethodDeclaration(node, modifierArray, node.asteriskToken, node.name, node.questionToken, node.typeParameters, node.parameters, node.type, node.body) :
                    (0, ts_1.isGetAccessorDeclaration)(node) ? updateGetAccessorDeclaration(node, modifierArray, node.name, node.parameters, node.type, node.body) :
                        (0, ts_1.isSetAccessorDeclaration)(node) ? updateSetAccessorDeclaration(node, modifierArray, node.name, node.parameters, node.body) :
                            (0, ts_1.isClassExpression)(node) ? updateClassExpression(node, modifierArray, node.name, node.typeParameters, node.heritageClauses, node.members) :
                                (0, ts_1.isClassDeclaration)(node) ? updateClassDeclaration(node, modifierArray, node.name, node.typeParameters, node.heritageClauses, node.members) :
                                    ts_1.Debug.assertNever(node);
    }
    function asNodeArray(array) {
        return array ? createNodeArray(array) : undefined;
    }
    function asName(name) {
        return typeof name === "string" ? createIdentifier(name) :
            name;
    }
    function asExpression(value) {
        return typeof value === "string" ? createStringLiteral(value) :
            typeof value === "number" ? createNumericLiteral(value) :
                typeof value === "boolean" ? value ? createTrue() : createFalse() :
                    value;
    }
    function asInitializer(node) {
        return node && parenthesizerRules().parenthesizeExpressionForDisallowedComma(node);
    }
    function asToken(value) {
        return typeof value === "number" ? createToken(value) : value;
    }
    function asEmbeddedStatement(statement) {
        return statement && (0, ts_1.isNotEmittedStatement)(statement) ? (0, ts_1.setTextRange)(setOriginalNode(createEmptyStatement(), statement), statement) : statement;
    }
    function asVariableDeclaration(variableDeclaration) {
        if (typeof variableDeclaration === "string" || variableDeclaration && !(0, ts_1.isVariableDeclaration)(variableDeclaration)) {
            return createVariableDeclaration(variableDeclaration, 
            /*exclamationToken*/ undefined, 
            /*type*/ undefined, 
            /*initializer*/ undefined);
        }
        return variableDeclaration;
    }
}
exports.createNodeFactory = createNodeFactory;
function updateWithoutOriginal(updated, original) {
    if (updated !== original) {
        (0, ts_1.setTextRange)(updated, original);
    }
    return updated;
}
function updateWithOriginal(updated, original) {
    if (updated !== original) {
        setOriginalNode(updated, original);
        (0, ts_1.setTextRange)(updated, original);
    }
    return updated;
}
function getDefaultTagNameForKind(kind) {
    switch (kind) {
        case 350 /* SyntaxKind.JSDocTypeTag */: return "type";
        case 348 /* SyntaxKind.JSDocReturnTag */: return "returns";
        case 349 /* SyntaxKind.JSDocThisTag */: return "this";
        case 346 /* SyntaxKind.JSDocEnumTag */: return "enum";
        case 336 /* SyntaxKind.JSDocAuthorTag */: return "author";
        case 338 /* SyntaxKind.JSDocClassTag */: return "class";
        case 339 /* SyntaxKind.JSDocPublicTag */: return "public";
        case 340 /* SyntaxKind.JSDocPrivateTag */: return "private";
        case 341 /* SyntaxKind.JSDocProtectedTag */: return "protected";
        case 342 /* SyntaxKind.JSDocReadonlyTag */: return "readonly";
        case 343 /* SyntaxKind.JSDocOverrideTag */: return "override";
        case 351 /* SyntaxKind.JSDocTemplateTag */: return "template";
        case 352 /* SyntaxKind.JSDocTypedefTag */: return "typedef";
        case 347 /* SyntaxKind.JSDocParameterTag */: return "param";
        case 354 /* SyntaxKind.JSDocPropertyTag */: return "prop";
        case 344 /* SyntaxKind.JSDocCallbackTag */: return "callback";
        case 345 /* SyntaxKind.JSDocOverloadTag */: return "overload";
        case 334 /* SyntaxKind.JSDocAugmentsTag */: return "augments";
        case 335 /* SyntaxKind.JSDocImplementsTag */: return "implements";
        default:
            return ts_1.Debug.fail("Unsupported kind: ".concat(ts_1.Debug.formatSyntaxKind(kind)));
    }
}
var rawTextScanner;
var invalidValueSentinel = {};
function getCookedText(kind, rawText) {
    if (!rawTextScanner) {
        rawTextScanner = (0, ts_1.createScanner)(99 /* ScriptTarget.Latest */, /*skipTrivia*/ false, 0 /* LanguageVariant.Standard */);
    }
    switch (kind) {
        case 15 /* SyntaxKind.NoSubstitutionTemplateLiteral */:
            rawTextScanner.setText("`" + rawText + "`");
            break;
        case 16 /* SyntaxKind.TemplateHead */:
            rawTextScanner.setText("`" + rawText + "${");
            break;
        case 17 /* SyntaxKind.TemplateMiddle */:
            rawTextScanner.setText("}" + rawText + "${");
            break;
        case 18 /* SyntaxKind.TemplateTail */:
            rawTextScanner.setText("}" + rawText + "`");
            break;
    }
    var token = rawTextScanner.scan();
    if (token === 20 /* SyntaxKind.CloseBraceToken */) {
        token = rawTextScanner.reScanTemplateToken(/*isTaggedTemplate*/ false);
    }
    if (rawTextScanner.isUnterminated()) {
        rawTextScanner.setText(undefined);
        return invalidValueSentinel;
    }
    var tokenValue;
    switch (token) {
        case 15 /* SyntaxKind.NoSubstitutionTemplateLiteral */:
        case 16 /* SyntaxKind.TemplateHead */:
        case 17 /* SyntaxKind.TemplateMiddle */:
        case 18 /* SyntaxKind.TemplateTail */:
            tokenValue = rawTextScanner.getTokenValue();
            break;
    }
    if (tokenValue === undefined || rawTextScanner.scan() !== 1 /* SyntaxKind.EndOfFileToken */) {
        rawTextScanner.setText(undefined);
        return invalidValueSentinel;
    }
    rawTextScanner.setText(undefined);
    return tokenValue;
}
function propagateNameFlags(node) {
    return node && (0, ts_1.isIdentifier)(node) ? propagateIdentifierNameFlags(node) : propagateChildFlags(node);
}
function propagateIdentifierNameFlags(node) {
    // An IdentifierName is allowed to be `await`
    return propagateChildFlags(node) & ~67108864 /* TransformFlags.ContainsPossibleTopLevelAwait */;
}
function propagatePropertyNameFlagsOfChild(node, transformFlags) {
    return transformFlags | (node.transformFlags & 134234112 /* TransformFlags.PropertyNamePropagatingFlags */);
}
function propagateChildFlags(child) {
    if (!child)
        return 0 /* TransformFlags.None */;
    var childFlags = child.transformFlags & ~getTransformFlagsSubtreeExclusions(child.kind);
    return (0, ts_1.isNamedDeclaration)(child) && (0, ts_1.isPropertyName)(child.name) ? propagatePropertyNameFlagsOfChild(child.name, childFlags) : childFlags;
}
function propagateChildrenFlags(children) {
    return children ? children.transformFlags : 0 /* TransformFlags.None */;
}
function aggregateChildrenFlags(children) {
    var subtreeFlags = 0 /* TransformFlags.None */;
    for (var _i = 0, children_1 = children; _i < children_1.length; _i++) {
        var child = children_1[_i];
        subtreeFlags |= propagateChildFlags(child);
    }
    children.transformFlags = subtreeFlags;
}
/**
 * Gets the transform flags to exclude when unioning the transform flags of a subtree.
 *
 * @internal
 */
function getTransformFlagsSubtreeExclusions(kind) {
    if (kind >= 181 /* SyntaxKind.FirstTypeNode */ && kind <= 204 /* SyntaxKind.LastTypeNode */) {
        return -2 /* TransformFlags.TypeExcludes */;
    }
    switch (kind) {
        case 212 /* SyntaxKind.CallExpression */:
        case 213 /* SyntaxKind.NewExpression */:
        case 208 /* SyntaxKind.ArrayLiteralExpression */:
            return -2147450880 /* TransformFlags.ArrayLiteralOrCallOrNewExcludes */;
        case 266 /* SyntaxKind.ModuleDeclaration */:
            return -1941676032 /* TransformFlags.ModuleExcludes */;
        case 168 /* SyntaxKind.Parameter */:
            return -2147483648 /* TransformFlags.ParameterExcludes */;
        case 218 /* SyntaxKind.ArrowFunction */:
            return -2072174592 /* TransformFlags.ArrowFunctionExcludes */;
        case 217 /* SyntaxKind.FunctionExpression */:
        case 261 /* SyntaxKind.FunctionDeclaration */:
            return -1937940480 /* TransformFlags.FunctionExcludes */;
        case 260 /* SyntaxKind.VariableDeclarationList */:
            return -2146893824 /* TransformFlags.VariableDeclarationListExcludes */;
        case 262 /* SyntaxKind.ClassDeclaration */:
        case 230 /* SyntaxKind.ClassExpression */:
            return -2147344384 /* TransformFlags.ClassExcludes */;
        case 175 /* SyntaxKind.Constructor */:
            return -1937948672 /* TransformFlags.ConstructorExcludes */;
        case 171 /* SyntaxKind.PropertyDeclaration */:
            return -2013249536 /* TransformFlags.PropertyExcludes */;
        case 173 /* SyntaxKind.MethodDeclaration */:
        case 176 /* SyntaxKind.GetAccessor */:
        case 177 /* SyntaxKind.SetAccessor */:
            return -2005057536 /* TransformFlags.MethodOrAccessorExcludes */;
        case 133 /* SyntaxKind.AnyKeyword */:
        case 150 /* SyntaxKind.NumberKeyword */:
        case 162 /* SyntaxKind.BigIntKeyword */:
        case 146 /* SyntaxKind.NeverKeyword */:
        case 154 /* SyntaxKind.StringKeyword */:
        case 151 /* SyntaxKind.ObjectKeyword */:
        case 136 /* SyntaxKind.BooleanKeyword */:
        case 155 /* SyntaxKind.SymbolKeyword */:
        case 116 /* SyntaxKind.VoidKeyword */:
        case 167 /* SyntaxKind.TypeParameter */:
        case 170 /* SyntaxKind.PropertySignature */:
        case 172 /* SyntaxKind.MethodSignature */:
        case 178 /* SyntaxKind.CallSignature */:
        case 179 /* SyntaxKind.ConstructSignature */:
        case 180 /* SyntaxKind.IndexSignature */:
        case 263 /* SyntaxKind.InterfaceDeclaration */:
        case 264 /* SyntaxKind.TypeAliasDeclaration */:
            return -2 /* TransformFlags.TypeExcludes */;
        case 209 /* SyntaxKind.ObjectLiteralExpression */:
            return -2147278848 /* TransformFlags.ObjectLiteralExcludes */;
        case 298 /* SyntaxKind.CatchClause */:
            return -2147418112 /* TransformFlags.CatchClauseExcludes */;
        case 205 /* SyntaxKind.ObjectBindingPattern */:
        case 206 /* SyntaxKind.ArrayBindingPattern */:
            return -2147450880 /* TransformFlags.BindingPatternExcludes */;
        case 215 /* SyntaxKind.TypeAssertionExpression */:
        case 237 /* SyntaxKind.SatisfiesExpression */:
        case 233 /* SyntaxKind.AsExpression */:
        case 359 /* SyntaxKind.PartiallyEmittedExpression */:
        case 216 /* SyntaxKind.ParenthesizedExpression */:
        case 108 /* SyntaxKind.SuperKeyword */:
            return -2147483648 /* TransformFlags.OuterExpressionExcludes */;
        case 210 /* SyntaxKind.PropertyAccessExpression */:
        case 211 /* SyntaxKind.ElementAccessExpression */:
            return -2147483648 /* TransformFlags.PropertyAccessExcludes */;
        default:
            return -2147483648 /* TransformFlags.NodeExcludes */;
    }
}
exports.getTransformFlagsSubtreeExclusions = getTransformFlagsSubtreeExclusions;
var baseFactory = (0, ts_1.createBaseNodeFactory)();
function makeSynthetic(node) {
    node.flags |= 8 /* NodeFlags.Synthesized */;
    return node;
}
var syntheticFactory = {
    createBaseSourceFileNode: function (kind) { return makeSynthetic(baseFactory.createBaseSourceFileNode(kind)); },
    createBaseIdentifierNode: function (kind) { return makeSynthetic(baseFactory.createBaseIdentifierNode(kind)); },
    createBasePrivateIdentifierNode: function (kind) { return makeSynthetic(baseFactory.createBasePrivateIdentifierNode(kind)); },
    createBaseTokenNode: function (kind) { return makeSynthetic(baseFactory.createBaseTokenNode(kind)); },
    createBaseNode: function (kind) { return makeSynthetic(baseFactory.createBaseNode(kind)); },
};
exports.factory = createNodeFactory(4 /* NodeFactoryFlags.NoIndentationOnFreshPropertyAccess */, syntheticFactory);
function createUnparsedSourceFile(textOrInputFiles, mapPathOrType, mapTextOrStripInternal) {
    var stripInternal;
    var bundleFileInfo;
    var fileName;
    var text;
    var length;
    var sourceMapPath;
    var sourceMapText;
    var getText;
    var getSourceMapText;
    var oldFileOfCurrentEmit;
    if (!(0, ts_1.isString)(textOrInputFiles)) {
        ts_1.Debug.assert(mapPathOrType === "js" || mapPathOrType === "dts");
        fileName = (mapPathOrType === "js" ? textOrInputFiles.javascriptPath : textOrInputFiles.declarationPath) || "";
        sourceMapPath = mapPathOrType === "js" ? textOrInputFiles.javascriptMapPath : textOrInputFiles.declarationMapPath;
        getText = function () { return mapPathOrType === "js" ? textOrInputFiles.javascriptText : textOrInputFiles.declarationText; };
        getSourceMapText = function () { return mapPathOrType === "js" ? textOrInputFiles.javascriptMapText : textOrInputFiles.declarationMapText; };
        length = function () { return getText().length; };
        if (textOrInputFiles.buildInfo && textOrInputFiles.buildInfo.bundle) {
            ts_1.Debug.assert(mapTextOrStripInternal === undefined || typeof mapTextOrStripInternal === "boolean");
            stripInternal = mapTextOrStripInternal;
            bundleFileInfo = mapPathOrType === "js" ? textOrInputFiles.buildInfo.bundle.js : textOrInputFiles.buildInfo.bundle.dts;
            oldFileOfCurrentEmit = textOrInputFiles.oldFileOfCurrentEmit;
        }
    }
    else {
        fileName = "";
        text = textOrInputFiles;
        length = textOrInputFiles.length;
        sourceMapPath = mapPathOrType;
        sourceMapText = mapTextOrStripInternal;
    }
    var node = oldFileOfCurrentEmit ?
        parseOldFileOfCurrentEmit(ts_1.Debug.checkDefined(bundleFileInfo)) :
        parseUnparsedSourceFile(bundleFileInfo, stripInternal, length);
    node.fileName = fileName;
    node.sourceMapPath = sourceMapPath;
    node.oldFileOfCurrentEmit = oldFileOfCurrentEmit;
    if (getText && getSourceMapText) {
        Object.defineProperty(node, "text", { get: getText });
        Object.defineProperty(node, "sourceMapText", { get: getSourceMapText });
    }
    else {
        ts_1.Debug.assert(!oldFileOfCurrentEmit);
        node.text = text !== null && text !== void 0 ? text : "";
        node.sourceMapText = sourceMapText;
    }
    return node;
}
exports.createUnparsedSourceFile = createUnparsedSourceFile;
function parseUnparsedSourceFile(bundleFileInfo, stripInternal, length) {
    var prologues;
    var helpers;
    var referencedFiles;
    var typeReferenceDirectives;
    var libReferenceDirectives;
    var prependChildren;
    var texts;
    var hasNoDefaultLib;
    for (var _i = 0, _a = bundleFileInfo ? bundleFileInfo.sections : ts_1.emptyArray; _i < _a.length; _i++) {
        var section = _a[_i];
        switch (section.kind) {
            case "prologue" /* BundleFileSectionKind.Prologue */:
                prologues = (0, ts_1.append)(prologues, (0, ts_1.setTextRange)(exports.factory.createUnparsedPrologue(section.data), section));
                break;
            case "emitHelpers" /* BundleFileSectionKind.EmitHelpers */:
                helpers = (0, ts_1.append)(helpers, (0, ts_1.getAllUnscopedEmitHelpers)().get(section.data));
                break;
            case "no-default-lib" /* BundleFileSectionKind.NoDefaultLib */:
                hasNoDefaultLib = true;
                break;
            case "reference" /* BundleFileSectionKind.Reference */:
                referencedFiles = (0, ts_1.append)(referencedFiles, { pos: -1, end: -1, fileName: section.data });
                break;
            case "type" /* BundleFileSectionKind.Type */:
                typeReferenceDirectives = (0, ts_1.append)(typeReferenceDirectives, { pos: -1, end: -1, fileName: section.data });
                break;
            case "type-import" /* BundleFileSectionKind.TypeResolutionModeImport */:
                typeReferenceDirectives = (0, ts_1.append)(typeReferenceDirectives, { pos: -1, end: -1, fileName: section.data, resolutionMode: ts_1.ModuleKind.ESNext });
                break;
            case "type-require" /* BundleFileSectionKind.TypeResolutionModeRequire */:
                typeReferenceDirectives = (0, ts_1.append)(typeReferenceDirectives, { pos: -1, end: -1, fileName: section.data, resolutionMode: ts_1.ModuleKind.CommonJS });
                break;
            case "lib" /* BundleFileSectionKind.Lib */:
                libReferenceDirectives = (0, ts_1.append)(libReferenceDirectives, { pos: -1, end: -1, fileName: section.data });
                break;
            case "prepend" /* BundleFileSectionKind.Prepend */:
                var prependTexts = void 0;
                for (var _b = 0, _c = section.texts; _b < _c.length; _b++) {
                    var text = _c[_b];
                    if (!stripInternal || text.kind !== "internal" /* BundleFileSectionKind.Internal */) {
                        prependTexts = (0, ts_1.append)(prependTexts, (0, ts_1.setTextRange)(exports.factory.createUnparsedTextLike(text.data, text.kind === "internal" /* BundleFileSectionKind.Internal */), text));
                    }
                }
                prependChildren = (0, ts_1.addRange)(prependChildren, prependTexts);
                texts = (0, ts_1.append)(texts, exports.factory.createUnparsedPrepend(section.data, prependTexts !== null && prependTexts !== void 0 ? prependTexts : ts_1.emptyArray));
                break;
            case "internal" /* BundleFileSectionKind.Internal */:
                if (stripInternal) {
                    if (!texts)
                        texts = [];
                    break;
                }
            // falls through
            case "text" /* BundleFileSectionKind.Text */:
                texts = (0, ts_1.append)(texts, (0, ts_1.setTextRange)(exports.factory.createUnparsedTextLike(section.data, section.kind === "internal" /* BundleFileSectionKind.Internal */), section));
                break;
            default:
                ts_1.Debug.assertNever(section);
        }
    }
    if (!texts) {
        var textNode = exports.factory.createUnparsedTextLike(/*data*/ undefined, /*internal*/ false);
        (0, ts_1.setTextRangePosWidth)(textNode, 0, typeof length === "function" ? length() : length);
        texts = [textNode];
    }
    var node = ts_1.parseNodeFactory.createUnparsedSource(prologues !== null && prologues !== void 0 ? prologues : ts_1.emptyArray, /*syntheticReferences*/ undefined, texts);
    (0, ts_1.setEachParent)(prologues, node);
    (0, ts_1.setEachParent)(texts, node);
    (0, ts_1.setEachParent)(prependChildren, node);
    node.hasNoDefaultLib = hasNoDefaultLib;
    node.helpers = helpers;
    node.referencedFiles = referencedFiles || ts_1.emptyArray;
    node.typeReferenceDirectives = typeReferenceDirectives;
    node.libReferenceDirectives = libReferenceDirectives || ts_1.emptyArray;
    return node;
}
function parseOldFileOfCurrentEmit(bundleFileInfo) {
    var texts;
    var syntheticReferences;
    for (var _i = 0, _a = bundleFileInfo.sections; _i < _a.length; _i++) {
        var section = _a[_i];
        switch (section.kind) {
            case "internal" /* BundleFileSectionKind.Internal */:
            case "text" /* BundleFileSectionKind.Text */:
                texts = (0, ts_1.append)(texts, (0, ts_1.setTextRange)(exports.factory.createUnparsedTextLike(section.data, section.kind === "internal" /* BundleFileSectionKind.Internal */), section));
                break;
            case "no-default-lib" /* BundleFileSectionKind.NoDefaultLib */:
            case "reference" /* BundleFileSectionKind.Reference */:
            case "type" /* BundleFileSectionKind.Type */:
            case "type-import" /* BundleFileSectionKind.TypeResolutionModeImport */:
            case "type-require" /* BundleFileSectionKind.TypeResolutionModeRequire */:
            case "lib" /* BundleFileSectionKind.Lib */:
                syntheticReferences = (0, ts_1.append)(syntheticReferences, (0, ts_1.setTextRange)(exports.factory.createUnparsedSyntheticReference(section), section));
                break;
            // Ignore
            case "prologue" /* BundleFileSectionKind.Prologue */:
            case "emitHelpers" /* BundleFileSectionKind.EmitHelpers */:
            case "prepend" /* BundleFileSectionKind.Prepend */:
                break;
            default:
                ts_1.Debug.assertNever(section);
        }
    }
    var node = exports.factory.createUnparsedSource(ts_1.emptyArray, syntheticReferences, texts !== null && texts !== void 0 ? texts : ts_1.emptyArray);
    (0, ts_1.setEachParent)(syntheticReferences, node);
    (0, ts_1.setEachParent)(texts, node);
    node.helpers = (0, ts_1.map)(bundleFileInfo.sources && bundleFileInfo.sources.helpers, function (name) { return (0, ts_1.getAllUnscopedEmitHelpers)().get(name); });
    return node;
}
function createInputFiles(javascriptTextOrReadFileText, declarationTextOrJavascriptPath, javascriptMapPath, javascriptMapTextOrDeclarationPath, declarationMapPath, declarationMapTextOrBuildInfoPath) {
    return !(0, ts_1.isString)(javascriptTextOrReadFileText) ?
        createInputFilesWithFilePaths(javascriptTextOrReadFileText, declarationTextOrJavascriptPath, javascriptMapPath, javascriptMapTextOrDeclarationPath, declarationMapPath, declarationMapTextOrBuildInfoPath) :
        createInputFilesWithFileTexts(
        /*javascriptPath*/ undefined, javascriptTextOrReadFileText, javascriptMapPath, javascriptMapTextOrDeclarationPath, 
        /*declarationPath*/ undefined, declarationTextOrJavascriptPath, declarationMapPath, declarationMapTextOrBuildInfoPath);
}
exports.createInputFiles = createInputFiles;
/** @deprecated @internal */
function createInputFilesWithFilePaths(readFileText, javascriptPath, javascriptMapPath, declarationPath, declarationMapPath, buildInfoPath, host, options) {
    var node = ts_1.parseNodeFactory.createInputFiles();
    node.javascriptPath = javascriptPath;
    node.javascriptMapPath = javascriptMapPath;
    node.declarationPath = declarationPath;
    node.declarationMapPath = declarationMapPath;
    node.buildInfoPath = buildInfoPath;
    var cache = new Map();
    var textGetter = function (path) {
        if (path === undefined)
            return undefined;
        var value = cache.get(path);
        if (value === undefined) {
            value = readFileText(path);
            cache.set(path, value !== undefined ? value : false);
        }
        return value !== false ? value : undefined;
    };
    var definedTextGetter = function (path) {
        var result = textGetter(path);
        return result !== undefined ? result : "/* Input file ".concat(path, " was missing */\r\n");
    };
    var buildInfo;
    var getAndCacheBuildInfo = function () {
        var _a, _b;
        if (buildInfo === undefined && buildInfoPath) {
            if (host === null || host === void 0 ? void 0 : host.getBuildInfo) {
                buildInfo = (_a = host.getBuildInfo(buildInfoPath, options.configFilePath)) !== null && _a !== void 0 ? _a : false;
            }
            else {
                var result = textGetter(buildInfoPath);
                buildInfo = result !== undefined ? (_b = (0, ts_1.getBuildInfo)(buildInfoPath, result)) !== null && _b !== void 0 ? _b : false : false;
            }
        }
        return buildInfo || undefined;
    };
    Object.defineProperties(node, {
        javascriptText: { get: function () { return definedTextGetter(javascriptPath); } },
        javascriptMapText: { get: function () { return textGetter(javascriptMapPath); } },
        declarationText: { get: function () { return definedTextGetter(ts_1.Debug.checkDefined(declarationPath)); } },
        declarationMapText: { get: function () { return textGetter(declarationMapPath); } },
        buildInfo: { get: getAndCacheBuildInfo },
    });
    return node;
}
exports.createInputFilesWithFilePaths = createInputFilesWithFilePaths;
/** @deprecated @internal */
function createInputFilesWithFileTexts(javascriptPath, javascriptText, javascriptMapPath, javascriptMapText, declarationPath, declarationText, declarationMapPath, declarationMapText, buildInfoPath, buildInfo, oldFileOfCurrentEmit) {
    var node = ts_1.parseNodeFactory.createInputFiles();
    node.javascriptPath = javascriptPath;
    node.javascriptText = javascriptText;
    node.javascriptMapPath = javascriptMapPath;
    node.javascriptMapText = javascriptMapText;
    node.declarationPath = declarationPath;
    node.declarationText = declarationText;
    node.declarationMapPath = declarationMapPath;
    node.declarationMapText = declarationMapText;
    node.buildInfoPath = buildInfoPath;
    node.buildInfo = buildInfo;
    node.oldFileOfCurrentEmit = oldFileOfCurrentEmit;
    return node;
}
exports.createInputFilesWithFileTexts = createInputFilesWithFileTexts;
var SourceMapSource;
/**
 * Create an external source map source file reference
 */
function createSourceMapSource(fileName, text, skipTrivia) {
    return new (SourceMapSource || (SourceMapSource = ts_1.objectAllocator.getSourceMapSourceConstructor()))(fileName, text, skipTrivia);
}
exports.createSourceMapSource = createSourceMapSource;
// Utilities
function setOriginalNode(node, original) {
    node.original = original;
    if (original) {
        var emitNode = original.emitNode;
        if (emitNode)
            node.emitNode = mergeEmitNode(emitNode, node.emitNode);
    }
    return node;
}
exports.setOriginalNode = setOriginalNode;
function mergeEmitNode(sourceEmitNode, destEmitNode) {
    var flags = sourceEmitNode.flags, internalFlags = sourceEmitNode.internalFlags, leadingComments = sourceEmitNode.leadingComments, trailingComments = sourceEmitNode.trailingComments, commentRange = sourceEmitNode.commentRange, sourceMapRange = sourceEmitNode.sourceMapRange, tokenSourceMapRanges = sourceEmitNode.tokenSourceMapRanges, constantValue = sourceEmitNode.constantValue, helpers = sourceEmitNode.helpers, startsOnNewLine = sourceEmitNode.startsOnNewLine, snippetElement = sourceEmitNode.snippetElement;
    if (!destEmitNode)
        destEmitNode = {};
    // We are using `.slice()` here in case `destEmitNode.leadingComments` is pushed to later.
    if (leadingComments)
        destEmitNode.leadingComments = (0, ts_1.addRange)(leadingComments.slice(), destEmitNode.leadingComments);
    if (trailingComments)
        destEmitNode.trailingComments = (0, ts_1.addRange)(trailingComments.slice(), destEmitNode.trailingComments);
    if (flags)
        destEmitNode.flags = flags;
    if (internalFlags)
        destEmitNode.internalFlags = internalFlags & ~8 /* InternalEmitFlags.Immutable */;
    if (commentRange)
        destEmitNode.commentRange = commentRange;
    if (sourceMapRange)
        destEmitNode.sourceMapRange = sourceMapRange;
    if (tokenSourceMapRanges)
        destEmitNode.tokenSourceMapRanges = mergeTokenSourceMapRanges(tokenSourceMapRanges, destEmitNode.tokenSourceMapRanges);
    if (constantValue !== undefined)
        destEmitNode.constantValue = constantValue;
    if (helpers) {
        for (var _i = 0, helpers_1 = helpers; _i < helpers_1.length; _i++) {
            var helper = helpers_1[_i];
            destEmitNode.helpers = (0, ts_1.appendIfUnique)(destEmitNode.helpers, helper);
        }
    }
    if (startsOnNewLine !== undefined)
        destEmitNode.startsOnNewLine = startsOnNewLine;
    if (snippetElement !== undefined)
        destEmitNode.snippetElement = snippetElement;
    return destEmitNode;
}
function mergeTokenSourceMapRanges(sourceRanges, destRanges) {
    if (!destRanges)
        destRanges = [];
    for (var key in sourceRanges) {
        destRanges[key] = sourceRanges[key];
    }
    return destRanges;
}
