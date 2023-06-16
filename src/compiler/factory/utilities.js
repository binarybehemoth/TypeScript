"use strict";
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
exports.isBinaryOperatorToken = exports.isLiteralTypeLikeExpression = exports.isModuleName = exports.isQuestionOrPlusOrMinusToken = exports.isReadonlyKeywordOrPlusOrMinusToken = exports.isIdentifierOrThisTypeNode = exports.isQuestionOrExclamationToken = exports.canHaveIllegalModifiers = exports.canHaveIllegalDecorators = exports.canHaveIllegalTypeParameters = exports.canHaveIllegalType = exports.getJSDocTypeAliasName = exports.getElementsOfBindingOrAssignmentPattern = exports.tryGetPropertyNameOfBindingOrAssignmentElement = exports.getPropertyNameOfBindingOrAssignmentElement = exports.getRestIndicatorOfBindingOrAssignmentElement = exports.getTargetOfBindingOrAssignmentElement = exports.getInitializerOfBindingOrAssignmentElement = exports.tryGetModuleNameFromFile = exports.getExternalModuleNameLiteral = exports.getLocalNameForExternalImport = exports.getOrCreateExternalHelpersModuleNameIfNeeded = exports.createExternalHelpersImportDeclarationIfNeeded = exports.hasRecordedExternalHelpers = exports.getExternalHelpersModuleName = exports.startOnNewLine = exports.skipAssertions = exports.walkUpOuterExpressions = exports.skipOuterExpressions = exports.isOuterExpression = exports.getJSDocTypeAssertionType = exports.isJSDocTypeAssertion = exports.isCommaSequence = exports.isCommaExpression = exports.startsWithUseStrict = exports.findUseStrictPrologue = exports.isExportName = exports.isLocalName = exports.isInternalName = exports.expandPreOrPostfixIncrementOrDecrementExpression = exports.createExpressionForObjectLiteralElementLike = exports.createExpressionForPropertyName = exports.createExpressionFromEntityName = exports.insertLeadingStatement = exports.createForOfBindingStatement = exports.createExpressionForJsxFragment = exports.createExpressionForJsxElement = exports.createJsxFactoryExpression = exports.createMemberAccessForPropertyName = exports.createEmptyExports = void 0;
exports.containsObjectRestOrSpread = exports.flattenCommaList = exports.findComputedPropertyNameCacheAssignment = exports.createAccessorPropertySetRedirector = exports.createAccessorPropertyGetRedirector = exports.createAccessorPropertyBackingField = exports.formatGeneratedName = exports.formatGeneratedNamePart = exports.getNodeForGeneratedName = exports.elideNodes = exports.isNonExportDefaultModifier = exports.isExportOrDefaultModifier = exports.createBinaryExpressionTrampoline = void 0;
var ts_1 = require("../_namespaces/ts");
// Compound nodes
/** @internal */
function createEmptyExports(factory) {
    return factory.createExportDeclaration(/*modifiers*/ undefined, /*isTypeOnly*/ false, factory.createNamedExports([]), /*moduleSpecifier*/ undefined);
}
exports.createEmptyExports = createEmptyExports;
/** @internal */
function createMemberAccessForPropertyName(factory, target, memberName, location) {
    if ((0, ts_1.isComputedPropertyName)(memberName)) {
        return (0, ts_1.setTextRange)(factory.createElementAccessExpression(target, memberName.expression), location);
    }
    else {
        var expression = (0, ts_1.setTextRange)((0, ts_1.isMemberName)(memberName)
            ? factory.createPropertyAccessExpression(target, memberName)
            : factory.createElementAccessExpression(target, memberName), memberName);
        (0, ts_1.addEmitFlags)(expression, 128 /* EmitFlags.NoNestedSourceMaps */);
        return expression;
    }
}
exports.createMemberAccessForPropertyName = createMemberAccessForPropertyName;
function createReactNamespace(reactNamespace, parent) {
    // To ensure the emit resolver can properly resolve the namespace, we need to
    // treat this identifier as if it were a source tree node by clearing the `Synthesized`
    // flag and setting a parent node.
    var react = ts_1.parseNodeFactory.createIdentifier(reactNamespace || "React");
    // Set the parent that is in parse tree
    // this makes sure that parent chain is intact for checker to traverse complete scope tree
    (0, ts_1.setParent)(react, (0, ts_1.getParseTreeNode)(parent));
    return react;
}
function createJsxFactoryExpressionFromEntityName(factory, jsxFactory, parent) {
    if ((0, ts_1.isQualifiedName)(jsxFactory)) {
        var left = createJsxFactoryExpressionFromEntityName(factory, jsxFactory.left, parent);
        var right = factory.createIdentifier((0, ts_1.idText)(jsxFactory.right));
        right.escapedText = jsxFactory.right.escapedText;
        return factory.createPropertyAccessExpression(left, right);
    }
    else {
        return createReactNamespace((0, ts_1.idText)(jsxFactory), parent);
    }
}
/** @internal */
function createJsxFactoryExpression(factory, jsxFactoryEntity, reactNamespace, parent) {
    return jsxFactoryEntity ?
        createJsxFactoryExpressionFromEntityName(factory, jsxFactoryEntity, parent) :
        factory.createPropertyAccessExpression(createReactNamespace(reactNamespace, parent), "createElement");
}
exports.createJsxFactoryExpression = createJsxFactoryExpression;
function createJsxFragmentFactoryExpression(factory, jsxFragmentFactoryEntity, reactNamespace, parent) {
    return jsxFragmentFactoryEntity ?
        createJsxFactoryExpressionFromEntityName(factory, jsxFragmentFactoryEntity, parent) :
        factory.createPropertyAccessExpression(createReactNamespace(reactNamespace, parent), "Fragment");
}
/** @internal */
function createExpressionForJsxElement(factory, callee, tagName, props, children, location) {
    var argumentsList = [tagName];
    if (props) {
        argumentsList.push(props);
    }
    if (children && children.length > 0) {
        if (!props) {
            argumentsList.push(factory.createNull());
        }
        if (children.length > 1) {
            for (var _i = 0, children_1 = children; _i < children_1.length; _i++) {
                var child = children_1[_i];
                startOnNewLine(child);
                argumentsList.push(child);
            }
        }
        else {
            argumentsList.push(children[0]);
        }
    }
    return (0, ts_1.setTextRange)(factory.createCallExpression(callee, 
    /*typeArguments*/ undefined, argumentsList), location);
}
exports.createExpressionForJsxElement = createExpressionForJsxElement;
/** @internal */
function createExpressionForJsxFragment(factory, jsxFactoryEntity, jsxFragmentFactoryEntity, reactNamespace, children, parentElement, location) {
    var tagName = createJsxFragmentFactoryExpression(factory, jsxFragmentFactoryEntity, reactNamespace, parentElement);
    var argumentsList = [tagName, factory.createNull()];
    if (children && children.length > 0) {
        if (children.length > 1) {
            for (var _i = 0, children_2 = children; _i < children_2.length; _i++) {
                var child = children_2[_i];
                startOnNewLine(child);
                argumentsList.push(child);
            }
        }
        else {
            argumentsList.push(children[0]);
        }
    }
    return (0, ts_1.setTextRange)(factory.createCallExpression(createJsxFactoryExpression(factory, jsxFactoryEntity, reactNamespace, parentElement), 
    /*typeArguments*/ undefined, argumentsList), location);
}
exports.createExpressionForJsxFragment = createExpressionForJsxFragment;
// Utilities
/** @internal */
function createForOfBindingStatement(factory, node, boundValue) {
    if ((0, ts_1.isVariableDeclarationList)(node)) {
        var firstDeclaration = (0, ts_1.first)(node.declarations);
        var updatedDeclaration = factory.updateVariableDeclaration(firstDeclaration, firstDeclaration.name, 
        /*exclamationToken*/ undefined, 
        /*type*/ undefined, boundValue);
        return (0, ts_1.setTextRange)(factory.createVariableStatement(
        /*modifiers*/ undefined, factory.updateVariableDeclarationList(node, [updatedDeclaration])), 
        /*location*/ node);
    }
    else {
        var updatedExpression = (0, ts_1.setTextRange)(factory.createAssignment(node, boundValue), /*location*/ node);
        return (0, ts_1.setTextRange)(factory.createExpressionStatement(updatedExpression), /*location*/ node);
    }
}
exports.createForOfBindingStatement = createForOfBindingStatement;
/** @internal */
function insertLeadingStatement(factory, dest, source) {
    if ((0, ts_1.isBlock)(dest)) {
        return factory.updateBlock(dest, (0, ts_1.setTextRange)(factory.createNodeArray(__spreadArray([source], dest.statements, true)), dest.statements));
    }
    else {
        return factory.createBlock(factory.createNodeArray([dest, source]), /*multiLine*/ true);
    }
}
exports.insertLeadingStatement = insertLeadingStatement;
/** @internal */
function createExpressionFromEntityName(factory, node) {
    if ((0, ts_1.isQualifiedName)(node)) {
        var left = createExpressionFromEntityName(factory, node.left);
        // TODO(rbuckton): Does this need to be parented?
        var right = (0, ts_1.setParent)((0, ts_1.setTextRange)(factory.cloneNode(node.right), node.right), node.right.parent);
        return (0, ts_1.setTextRange)(factory.createPropertyAccessExpression(left, right), node);
    }
    else {
        // TODO(rbuckton): Does this need to be parented?
        return (0, ts_1.setParent)((0, ts_1.setTextRange)(factory.cloneNode(node), node), node.parent);
    }
}
exports.createExpressionFromEntityName = createExpressionFromEntityName;
/** @internal */
function createExpressionForPropertyName(factory, memberName) {
    if ((0, ts_1.isIdentifier)(memberName)) {
        return factory.createStringLiteralFromNode(memberName);
    }
    else if ((0, ts_1.isComputedPropertyName)(memberName)) {
        // TODO(rbuckton): Does this need to be parented?
        return (0, ts_1.setParent)((0, ts_1.setTextRange)(factory.cloneNode(memberName.expression), memberName.expression), memberName.expression.parent);
    }
    else {
        // TODO(rbuckton): Does this need to be parented?
        return (0, ts_1.setParent)((0, ts_1.setTextRange)(factory.cloneNode(memberName), memberName), memberName.parent);
    }
}
exports.createExpressionForPropertyName = createExpressionForPropertyName;
function createExpressionForAccessorDeclaration(factory, properties, property, receiver, multiLine) {
    var _a = (0, ts_1.getAllAccessorDeclarations)(properties, property), firstAccessor = _a.firstAccessor, getAccessor = _a.getAccessor, setAccessor = _a.setAccessor;
    if (property === firstAccessor) {
        return (0, ts_1.setTextRange)(factory.createObjectDefinePropertyCall(receiver, createExpressionForPropertyName(factory, property.name), factory.createPropertyDescriptor({
            enumerable: factory.createFalse(),
            configurable: true,
            get: getAccessor && (0, ts_1.setTextRange)((0, ts_1.setOriginalNode)(factory.createFunctionExpression((0, ts_1.getModifiers)(getAccessor), 
            /*asteriskToken*/ undefined, 
            /*name*/ undefined, 
            /*typeParameters*/ undefined, getAccessor.parameters, 
            /*type*/ undefined, getAccessor.body // TODO: GH#18217
            ), getAccessor), getAccessor),
            set: setAccessor && (0, ts_1.setTextRange)((0, ts_1.setOriginalNode)(factory.createFunctionExpression((0, ts_1.getModifiers)(setAccessor), 
            /*asteriskToken*/ undefined, 
            /*name*/ undefined, 
            /*typeParameters*/ undefined, setAccessor.parameters, 
            /*type*/ undefined, setAccessor.body // TODO: GH#18217
            ), setAccessor), setAccessor)
        }, !multiLine)), firstAccessor);
    }
    return undefined;
}
function createExpressionForPropertyAssignment(factory, property, receiver) {
    return (0, ts_1.setOriginalNode)((0, ts_1.setTextRange)(factory.createAssignment(createMemberAccessForPropertyName(factory, receiver, property.name, /*location*/ property.name), property.initializer), property), property);
}
function createExpressionForShorthandPropertyAssignment(factory, property, receiver) {
    return (0, ts_1.setOriginalNode)((0, ts_1.setTextRange)(factory.createAssignment(createMemberAccessForPropertyName(factory, receiver, property.name, /*location*/ property.name), factory.cloneNode(property.name)), 
    /*location*/ property), 
    /*original*/ property);
}
function createExpressionForMethodDeclaration(factory, method, receiver) {
    return (0, ts_1.setOriginalNode)((0, ts_1.setTextRange)(factory.createAssignment(createMemberAccessForPropertyName(factory, receiver, method.name, /*location*/ method.name), (0, ts_1.setOriginalNode)((0, ts_1.setTextRange)(factory.createFunctionExpression((0, ts_1.getModifiers)(method), method.asteriskToken, 
    /*name*/ undefined, 
    /*typeParameters*/ undefined, method.parameters, 
    /*type*/ undefined, method.body // TODO: GH#18217
    ), 
    /*location*/ method), 
    /*original*/ method)), 
    /*location*/ method), 
    /*original*/ method);
}
/** @internal */
function createExpressionForObjectLiteralElementLike(factory, node, property, receiver) {
    if (property.name && (0, ts_1.isPrivateIdentifier)(property.name)) {
        ts_1.Debug.failBadSyntaxKind(property.name, "Private identifiers are not allowed in object literals.");
    }
    switch (property.kind) {
        case 176 /* SyntaxKind.GetAccessor */:
        case 177 /* SyntaxKind.SetAccessor */:
            return createExpressionForAccessorDeclaration(factory, node.properties, property, receiver, !!node.multiLine);
        case 302 /* SyntaxKind.PropertyAssignment */:
            return createExpressionForPropertyAssignment(factory, property, receiver);
        case 303 /* SyntaxKind.ShorthandPropertyAssignment */:
            return createExpressionForShorthandPropertyAssignment(factory, property, receiver);
        case 173 /* SyntaxKind.MethodDeclaration */:
            return createExpressionForMethodDeclaration(factory, property, receiver);
    }
}
exports.createExpressionForObjectLiteralElementLike = createExpressionForObjectLiteralElementLike;
/**
 * Expand the read and increment/decrement operations a pre- or post-increment or pre- or post-decrement expression.
 *
 * ```ts
 * // input
 * <expression>++
 * // output (if result is not discarded)
 * var <temp>;
 * (<temp> = <expression>, <resultVariable> = <temp>++, <temp>)
 * // output (if result is discarded)
 * var <temp>;
 * (<temp> = <expression>, <temp>++, <temp>)
 *
 * // input
 * ++<expression>
 * // output (if result is not discarded)
 * var <temp>;
 * (<temp> = <expression>, <resultVariable> = ++<temp>)
 * // output (if result is discarded)
 * var <temp>;
 * (<temp> = <expression>, ++<temp>)
 * ```
 *
 * It is up to the caller to supply a temporary variable for `<resultVariable>` if one is needed.
 * The temporary variable `<temp>` is injected so that `++` and `--` work uniformly with `number` and `bigint`.
 * The result of the expression is always the final result of incrementing or decrementing the expression, so that it can be used for storage.
 *
 * @param factory {@link NodeFactory} used to create the expanded representation.
 * @param node The original prefix or postfix unary node.
 * @param expression The expression to use as the value to increment or decrement
 * @param resultVariable A temporary variable in which to store the result. Pass `undefined` if the result is discarded, or if the value of `<temp>` is the expected result.
 *
 * @internal
 */
function expandPreOrPostfixIncrementOrDecrementExpression(factory, node, expression, recordTempVariable, resultVariable) {
    var operator = node.operator;
    ts_1.Debug.assert(operator === 46 /* SyntaxKind.PlusPlusToken */ || operator === 47 /* SyntaxKind.MinusMinusToken */, "Expected 'node' to be a pre- or post-increment or pre- or post-decrement expression");
    var temp = factory.createTempVariable(recordTempVariable);
    expression = factory.createAssignment(temp, expression);
    (0, ts_1.setTextRange)(expression, node.operand);
    var operation = (0, ts_1.isPrefixUnaryExpression)(node) ?
        factory.createPrefixUnaryExpression(operator, temp) :
        factory.createPostfixUnaryExpression(temp, operator);
    (0, ts_1.setTextRange)(operation, node);
    if (resultVariable) {
        operation = factory.createAssignment(resultVariable, operation);
        (0, ts_1.setTextRange)(operation, node);
    }
    expression = factory.createComma(expression, operation);
    (0, ts_1.setTextRange)(expression, node);
    if ((0, ts_1.isPostfixUnaryExpression)(node)) {
        expression = factory.createComma(expression, temp);
        (0, ts_1.setTextRange)(expression, node);
    }
    return expression;
}
exports.expandPreOrPostfixIncrementOrDecrementExpression = expandPreOrPostfixIncrementOrDecrementExpression;
/**
 * Gets whether an identifier should only be referred to by its internal name.
 *
 * @internal
 */
function isInternalName(node) {
    return ((0, ts_1.getEmitFlags)(node) & 65536 /* EmitFlags.InternalName */) !== 0;
}
exports.isInternalName = isInternalName;
/**
 * Gets whether an identifier should only be referred to by its local name.
 *
 * @internal
 */
function isLocalName(node) {
    return ((0, ts_1.getEmitFlags)(node) & 32768 /* EmitFlags.LocalName */) !== 0;
}
exports.isLocalName = isLocalName;
/**
 * Gets whether an identifier should only be referred to by its export representation if the
 * name points to an exported symbol.
 *
 * @internal
 */
function isExportName(node) {
    return ((0, ts_1.getEmitFlags)(node) & 16384 /* EmitFlags.ExportName */) !== 0;
}
exports.isExportName = isExportName;
function isUseStrictPrologue(node) {
    return (0, ts_1.isStringLiteral)(node.expression) && node.expression.text === "use strict";
}
/** @internal */
function findUseStrictPrologue(statements) {
    for (var _i = 0, statements_1 = statements; _i < statements_1.length; _i++) {
        var statement = statements_1[_i];
        if ((0, ts_1.isPrologueDirective)(statement)) {
            if (isUseStrictPrologue(statement)) {
                return statement;
            }
        }
        else {
            break;
        }
    }
    return undefined;
}
exports.findUseStrictPrologue = findUseStrictPrologue;
/** @internal */
function startsWithUseStrict(statements) {
    var firstStatement = (0, ts_1.firstOrUndefined)(statements);
    return firstStatement !== undefined
        && (0, ts_1.isPrologueDirective)(firstStatement)
        && isUseStrictPrologue(firstStatement);
}
exports.startsWithUseStrict = startsWithUseStrict;
/** @internal */
function isCommaExpression(node) {
    return node.kind === 225 /* SyntaxKind.BinaryExpression */ && node.operatorToken.kind === 28 /* SyntaxKind.CommaToken */;
}
exports.isCommaExpression = isCommaExpression;
/** @internal */
function isCommaSequence(node) {
    return isCommaExpression(node) || (0, ts_1.isCommaListExpression)(node);
}
exports.isCommaSequence = isCommaSequence;
/** @internal */
function isJSDocTypeAssertion(node) {
    return (0, ts_1.isParenthesizedExpression)(node)
        && (0, ts_1.isInJSFile)(node)
        && !!(0, ts_1.getJSDocTypeTag)(node);
}
exports.isJSDocTypeAssertion = isJSDocTypeAssertion;
/** @internal */
function getJSDocTypeAssertionType(node) {
    var type = (0, ts_1.getJSDocType)(node);
    ts_1.Debug.assertIsDefined(type);
    return type;
}
exports.getJSDocTypeAssertionType = getJSDocTypeAssertionType;
/** @internal */
function isOuterExpression(node, kinds) {
    if (kinds === void 0) { kinds = 15 /* OuterExpressionKinds.All */; }
    switch (node.kind) {
        case 216 /* SyntaxKind.ParenthesizedExpression */:
            if (kinds & 16 /* OuterExpressionKinds.ExcludeJSDocTypeAssertion */ && isJSDocTypeAssertion(node)) {
                return false;
            }
            return (kinds & 1 /* OuterExpressionKinds.Parentheses */) !== 0;
        case 215 /* SyntaxKind.TypeAssertionExpression */:
        case 233 /* SyntaxKind.AsExpression */:
        case 232 /* SyntaxKind.ExpressionWithTypeArguments */:
        case 237 /* SyntaxKind.SatisfiesExpression */:
            return (kinds & 2 /* OuterExpressionKinds.TypeAssertions */) !== 0;
        case 234 /* SyntaxKind.NonNullExpression */:
            return (kinds & 4 /* OuterExpressionKinds.NonNullAssertions */) !== 0;
        case 359 /* SyntaxKind.PartiallyEmittedExpression */:
            return (kinds & 8 /* OuterExpressionKinds.PartiallyEmittedExpressions */) !== 0;
    }
    return false;
}
exports.isOuterExpression = isOuterExpression;
/** @internal */
function skipOuterExpressions(node, kinds) {
    if (kinds === void 0) { kinds = 15 /* OuterExpressionKinds.All */; }
    while (isOuterExpression(node, kinds)) {
        node = node.expression;
    }
    return node;
}
exports.skipOuterExpressions = skipOuterExpressions;
/** @internal */
function walkUpOuterExpressions(node, kinds) {
    if (kinds === void 0) { kinds = 15 /* OuterExpressionKinds.All */; }
    var parent = node.parent;
    while (isOuterExpression(parent, kinds)) {
        parent = parent.parent;
        ts_1.Debug.assert(parent);
    }
    return parent;
}
exports.walkUpOuterExpressions = walkUpOuterExpressions;
/** @internal */
function skipAssertions(node) {
    return skipOuterExpressions(node, 6 /* OuterExpressionKinds.Assertions */);
}
exports.skipAssertions = skipAssertions;
/** @internal */
function startOnNewLine(node) {
    return (0, ts_1.setStartsOnNewLine)(node, /*newLine*/ true);
}
exports.startOnNewLine = startOnNewLine;
/** @internal */
function getExternalHelpersModuleName(node) {
    var parseNode = (0, ts_1.getOriginalNode)(node, ts_1.isSourceFile);
    var emitNode = parseNode && parseNode.emitNode;
    return emitNode && emitNode.externalHelpersModuleName;
}
exports.getExternalHelpersModuleName = getExternalHelpersModuleName;
/** @internal */
function hasRecordedExternalHelpers(sourceFile) {
    var parseNode = (0, ts_1.getOriginalNode)(sourceFile, ts_1.isSourceFile);
    var emitNode = parseNode && parseNode.emitNode;
    return !!emitNode && (!!emitNode.externalHelpersModuleName || !!emitNode.externalHelpers);
}
exports.hasRecordedExternalHelpers = hasRecordedExternalHelpers;
/** @internal */
function createExternalHelpersImportDeclarationIfNeeded(nodeFactory, helperFactory, sourceFile, compilerOptions, hasExportStarsToExportValues, hasImportStar, hasImportDefault) {
    if (compilerOptions.importHelpers && (0, ts_1.isEffectiveExternalModule)(sourceFile, compilerOptions)) {
        var namedBindings = void 0;
        var moduleKind = (0, ts_1.getEmitModuleKind)(compilerOptions);
        if ((moduleKind >= ts_1.ModuleKind.ES2015 && moduleKind <= ts_1.ModuleKind.ESNext) || sourceFile.impliedNodeFormat === ts_1.ModuleKind.ESNext) {
            // use named imports
            var helpers = (0, ts_1.getEmitHelpers)(sourceFile);
            if (helpers) {
                var helperNames = [];
                for (var _i = 0, helpers_1 = helpers; _i < helpers_1.length; _i++) {
                    var helper = helpers_1[_i];
                    if (!helper.scoped) {
                        var importName = helper.importName;
                        if (importName) {
                            (0, ts_1.pushIfUnique)(helperNames, importName);
                        }
                    }
                }
                if ((0, ts_1.some)(helperNames)) {
                    helperNames.sort(ts_1.compareStringsCaseSensitive);
                    // Alias the imports if the names are used somewhere in the file.
                    // NOTE: We don't need to care about global import collisions as this is a module.
                    namedBindings = nodeFactory.createNamedImports((0, ts_1.map)(helperNames, function (name) { return (0, ts_1.isFileLevelUniqueName)(sourceFile, name)
                        ? nodeFactory.createImportSpecifier(/*isTypeOnly*/ false, /*propertyName*/ undefined, nodeFactory.createIdentifier(name))
                        : nodeFactory.createImportSpecifier(/*isTypeOnly*/ false, nodeFactory.createIdentifier(name), helperFactory.getUnscopedHelperName(name)); }));
                    var parseNode = (0, ts_1.getOriginalNode)(sourceFile, ts_1.isSourceFile);
                    var emitNode = (0, ts_1.getOrCreateEmitNode)(parseNode);
                    emitNode.externalHelpers = true;
                }
            }
        }
        else {
            // use a namespace import
            var externalHelpersModuleName = getOrCreateExternalHelpersModuleNameIfNeeded(nodeFactory, sourceFile, compilerOptions, hasExportStarsToExportValues, hasImportStar || hasImportDefault);
            if (externalHelpersModuleName) {
                namedBindings = nodeFactory.createNamespaceImport(externalHelpersModuleName);
            }
        }
        if (namedBindings) {
            var externalHelpersImportDeclaration = nodeFactory.createImportDeclaration(
            /*modifiers*/ undefined, nodeFactory.createImportClause(/*isTypeOnly*/ false, /*name*/ undefined, namedBindings), nodeFactory.createStringLiteral(ts_1.externalHelpersModuleNameText), 
            /*assertClause*/ undefined);
            (0, ts_1.addInternalEmitFlags)(externalHelpersImportDeclaration, 2 /* InternalEmitFlags.NeverApplyImportHelper */);
            return externalHelpersImportDeclaration;
        }
    }
}
exports.createExternalHelpersImportDeclarationIfNeeded = createExternalHelpersImportDeclarationIfNeeded;
/** @internal */
function getOrCreateExternalHelpersModuleNameIfNeeded(factory, node, compilerOptions, hasExportStarsToExportValues, hasImportStarOrImportDefault) {
    if (compilerOptions.importHelpers && (0, ts_1.isEffectiveExternalModule)(node, compilerOptions)) {
        var externalHelpersModuleName = getExternalHelpersModuleName(node);
        if (externalHelpersModuleName) {
            return externalHelpersModuleName;
        }
        var moduleKind = (0, ts_1.getEmitModuleKind)(compilerOptions);
        var create = (hasExportStarsToExportValues || ((0, ts_1.getESModuleInterop)(compilerOptions) && hasImportStarOrImportDefault))
            && moduleKind !== ts_1.ModuleKind.System
            && (moduleKind < ts_1.ModuleKind.ES2015 || node.impliedNodeFormat === ts_1.ModuleKind.CommonJS);
        if (!create) {
            var helpers = (0, ts_1.getEmitHelpers)(node);
            if (helpers) {
                for (var _i = 0, helpers_2 = helpers; _i < helpers_2.length; _i++) {
                    var helper = helpers_2[_i];
                    if (!helper.scoped) {
                        create = true;
                        break;
                    }
                }
            }
        }
        if (create) {
            var parseNode = (0, ts_1.getOriginalNode)(node, ts_1.isSourceFile);
            var emitNode = (0, ts_1.getOrCreateEmitNode)(parseNode);
            return emitNode.externalHelpersModuleName || (emitNode.externalHelpersModuleName = factory.createUniqueName(ts_1.externalHelpersModuleNameText));
        }
    }
}
exports.getOrCreateExternalHelpersModuleNameIfNeeded = getOrCreateExternalHelpersModuleNameIfNeeded;
/**
 * Get the name of that target module from an import or export declaration
 *
 * @internal
 */
function getLocalNameForExternalImport(factory, node, sourceFile) {
    var namespaceDeclaration = (0, ts_1.getNamespaceDeclarationNode)(node);
    if (namespaceDeclaration && !(0, ts_1.isDefaultImport)(node) && !(0, ts_1.isExportNamespaceAsDefaultDeclaration)(node)) {
        var name_1 = namespaceDeclaration.name;
        return (0, ts_1.isGeneratedIdentifier)(name_1) ? name_1 : factory.createIdentifier((0, ts_1.getSourceTextOfNodeFromSourceFile)(sourceFile, name_1) || (0, ts_1.idText)(name_1));
    }
    if (node.kind === 271 /* SyntaxKind.ImportDeclaration */ && node.importClause) {
        return factory.getGeneratedNameForNode(node);
    }
    if (node.kind === 277 /* SyntaxKind.ExportDeclaration */ && node.moduleSpecifier) {
        return factory.getGeneratedNameForNode(node);
    }
    return undefined;
}
exports.getLocalNameForExternalImport = getLocalNameForExternalImport;
/**
 * Get the name of a target module from an import/export declaration as should be written in the emitted output.
 * The emitted output name can be different from the input if:
 *  1. The module has a /// <amd-module name="<new name>" />
 *  2. --out or --outFile is used, making the name relative to the rootDir
 *  3- The containing SourceFile has an entry in renamedDependencies for the import as requested by some module loaders (e.g. System).
 * Otherwise, a new StringLiteral node representing the module name will be returned.
 *
 * @internal
 */
function getExternalModuleNameLiteral(factory, importNode, sourceFile, host, resolver, compilerOptions) {
    var moduleName = (0, ts_1.getExternalModuleName)(importNode);
    if (moduleName && (0, ts_1.isStringLiteral)(moduleName)) {
        return tryGetModuleNameFromDeclaration(importNode, host, factory, resolver, compilerOptions)
            || tryRenameExternalModule(factory, moduleName, sourceFile)
            || factory.cloneNode(moduleName);
    }
    return undefined;
}
exports.getExternalModuleNameLiteral = getExternalModuleNameLiteral;
/**
 * Some bundlers (SystemJS builder) sometimes want to rename dependencies.
 * Here we check if alternative name was provided for a given moduleName and return it if possible.
 */
function tryRenameExternalModule(factory, moduleName, sourceFile) {
    var rename = sourceFile.renamedDependencies && sourceFile.renamedDependencies.get(moduleName.text);
    return rename ? factory.createStringLiteral(rename) : undefined;
}
/**
 * Get the name of a module as should be written in the emitted output.
 * The emitted output name can be different from the input if:
 *  1. The module has a /// <amd-module name="<new name>" />
 *  2. --out or --outFile is used, making the name relative to the rootDir
 * Otherwise, a new StringLiteral node representing the module name will be returned.
 *
 * @internal
 */
function tryGetModuleNameFromFile(factory, file, host, options) {
    if (!file) {
        return undefined;
    }
    if (file.moduleName) {
        return factory.createStringLiteral(file.moduleName);
    }
    if (!file.isDeclarationFile && (0, ts_1.outFile)(options)) {
        return factory.createStringLiteral((0, ts_1.getExternalModuleNameFromPath)(host, file.fileName));
    }
    return undefined;
}
exports.tryGetModuleNameFromFile = tryGetModuleNameFromFile;
function tryGetModuleNameFromDeclaration(declaration, host, factory, resolver, compilerOptions) {
    return tryGetModuleNameFromFile(factory, resolver.getExternalModuleFileFromDeclaration(declaration), host, compilerOptions);
}
/**
 * Gets the initializer of an BindingOrAssignmentElement.
 *
 * @internal
 */
function getInitializerOfBindingOrAssignmentElement(bindingElement) {
    if ((0, ts_1.isDeclarationBindingElement)(bindingElement)) {
        // `1` in `let { a = 1 } = ...`
        // `1` in `let { a: b = 1 } = ...`
        // `1` in `let { a: {b} = 1 } = ...`
        // `1` in `let { a: [b] = 1 } = ...`
        // `1` in `let [a = 1] = ...`
        // `1` in `let [{a} = 1] = ...`
        // `1` in `let [[a] = 1] = ...`
        return bindingElement.initializer;
    }
    if ((0, ts_1.isPropertyAssignment)(bindingElement)) {
        // `1` in `({ a: b = 1 } = ...)`
        // `1` in `({ a: {b} = 1 } = ...)`
        // `1` in `({ a: [b] = 1 } = ...)`
        var initializer = bindingElement.initializer;
        return (0, ts_1.isAssignmentExpression)(initializer, /*excludeCompoundAssignment*/ true)
            ? initializer.right
            : undefined;
    }
    if ((0, ts_1.isShorthandPropertyAssignment)(bindingElement)) {
        // `1` in `({ a = 1 } = ...)`
        return bindingElement.objectAssignmentInitializer;
    }
    if ((0, ts_1.isAssignmentExpression)(bindingElement, /*excludeCompoundAssignment*/ true)) {
        // `1` in `[a = 1] = ...`
        // `1` in `[{a} = 1] = ...`
        // `1` in `[[a] = 1] = ...`
        return bindingElement.right;
    }
    if ((0, ts_1.isSpreadElement)(bindingElement)) {
        // Recovery consistent with existing emit.
        return getInitializerOfBindingOrAssignmentElement(bindingElement.expression);
    }
}
exports.getInitializerOfBindingOrAssignmentElement = getInitializerOfBindingOrAssignmentElement;
/**
 * Gets the name of an BindingOrAssignmentElement.
 *
 * @internal
 */
function getTargetOfBindingOrAssignmentElement(bindingElement) {
    if ((0, ts_1.isDeclarationBindingElement)(bindingElement)) {
        // `a` in `let { a } = ...`
        // `a` in `let { a = 1 } = ...`
        // `b` in `let { a: b } = ...`
        // `b` in `let { a: b = 1 } = ...`
        // `a` in `let { ...a } = ...`
        // `{b}` in `let { a: {b} } = ...`
        // `{b}` in `let { a: {b} = 1 } = ...`
        // `[b]` in `let { a: [b] } = ...`
        // `[b]` in `let { a: [b] = 1 } = ...`
        // `a` in `let [a] = ...`
        // `a` in `let [a = 1] = ...`
        // `a` in `let [...a] = ...`
        // `{a}` in `let [{a}] = ...`
        // `{a}` in `let [{a} = 1] = ...`
        // `[a]` in `let [[a]] = ...`
        // `[a]` in `let [[a] = 1] = ...`
        return bindingElement.name;
    }
    if ((0, ts_1.isObjectLiteralElementLike)(bindingElement)) {
        switch (bindingElement.kind) {
            case 302 /* SyntaxKind.PropertyAssignment */:
                // `b` in `({ a: b } = ...)`
                // `b` in `({ a: b = 1 } = ...)`
                // `{b}` in `({ a: {b} } = ...)`
                // `{b}` in `({ a: {b} = 1 } = ...)`
                // `[b]` in `({ a: [b] } = ...)`
                // `[b]` in `({ a: [b] = 1 } = ...)`
                // `b.c` in `({ a: b.c } = ...)`
                // `b.c` in `({ a: b.c = 1 } = ...)`
                // `b[0]` in `({ a: b[0] } = ...)`
                // `b[0]` in `({ a: b[0] = 1 } = ...)`
                return getTargetOfBindingOrAssignmentElement(bindingElement.initializer);
            case 303 /* SyntaxKind.ShorthandPropertyAssignment */:
                // `a` in `({ a } = ...)`
                // `a` in `({ a = 1 } = ...)`
                return bindingElement.name;
            case 304 /* SyntaxKind.SpreadAssignment */:
                // `a` in `({ ...a } = ...)`
                return getTargetOfBindingOrAssignmentElement(bindingElement.expression);
        }
        // no target
        return undefined;
    }
    if ((0, ts_1.isAssignmentExpression)(bindingElement, /*excludeCompoundAssignment*/ true)) {
        // `a` in `[a = 1] = ...`
        // `{a}` in `[{a} = 1] = ...`
        // `[a]` in `[[a] = 1] = ...`
        // `a.b` in `[a.b = 1] = ...`
        // `a[0]` in `[a[0] = 1] = ...`
        return getTargetOfBindingOrAssignmentElement(bindingElement.left);
    }
    if ((0, ts_1.isSpreadElement)(bindingElement)) {
        // `a` in `[...a] = ...`
        return getTargetOfBindingOrAssignmentElement(bindingElement.expression);
    }
    // `a` in `[a] = ...`
    // `{a}` in `[{a}] = ...`
    // `[a]` in `[[a]] = ...`
    // `a.b` in `[a.b] = ...`
    // `a[0]` in `[a[0]] = ...`
    return bindingElement;
}
exports.getTargetOfBindingOrAssignmentElement = getTargetOfBindingOrAssignmentElement;
/**
 * Determines whether an BindingOrAssignmentElement is a rest element.
 *
 * @internal
 */
function getRestIndicatorOfBindingOrAssignmentElement(bindingElement) {
    switch (bindingElement.kind) {
        case 168 /* SyntaxKind.Parameter */:
        case 207 /* SyntaxKind.BindingElement */:
            // `...` in `let [...a] = ...`
            return bindingElement.dotDotDotToken;
        case 229 /* SyntaxKind.SpreadElement */:
        case 304 /* SyntaxKind.SpreadAssignment */:
            // `...` in `[...a] = ...`
            return bindingElement;
    }
    return undefined;
}
exports.getRestIndicatorOfBindingOrAssignmentElement = getRestIndicatorOfBindingOrAssignmentElement;
/**
 * Gets the property name of a BindingOrAssignmentElement
 *
 * @internal
 */
function getPropertyNameOfBindingOrAssignmentElement(bindingElement) {
    var propertyName = tryGetPropertyNameOfBindingOrAssignmentElement(bindingElement);
    ts_1.Debug.assert(!!propertyName || (0, ts_1.isSpreadAssignment)(bindingElement), "Invalid property name for binding element.");
    return propertyName;
}
exports.getPropertyNameOfBindingOrAssignmentElement = getPropertyNameOfBindingOrAssignmentElement;
/** @internal */
function tryGetPropertyNameOfBindingOrAssignmentElement(bindingElement) {
    switch (bindingElement.kind) {
        case 207 /* SyntaxKind.BindingElement */:
            // `a` in `let { a: b } = ...`
            // `[a]` in `let { [a]: b } = ...`
            // `"a"` in `let { "a": b } = ...`
            // `1` in `let { 1: b } = ...`
            if (bindingElement.propertyName) {
                var propertyName = bindingElement.propertyName;
                if ((0, ts_1.isPrivateIdentifier)(propertyName)) {
                    return ts_1.Debug.failBadSyntaxKind(propertyName);
                }
                return (0, ts_1.isComputedPropertyName)(propertyName) && isStringOrNumericLiteral(propertyName.expression)
                    ? propertyName.expression
                    : propertyName;
            }
            break;
        case 302 /* SyntaxKind.PropertyAssignment */:
            // `a` in `({ a: b } = ...)`
            // `[a]` in `({ [a]: b } = ...)`
            // `"a"` in `({ "a": b } = ...)`
            // `1` in `({ 1: b } = ...)`
            if (bindingElement.name) {
                var propertyName = bindingElement.name;
                if ((0, ts_1.isPrivateIdentifier)(propertyName)) {
                    return ts_1.Debug.failBadSyntaxKind(propertyName);
                }
                return (0, ts_1.isComputedPropertyName)(propertyName) && isStringOrNumericLiteral(propertyName.expression)
                    ? propertyName.expression
                    : propertyName;
            }
            break;
        case 304 /* SyntaxKind.SpreadAssignment */:
            // `a` in `({ ...a } = ...)`
            if (bindingElement.name && (0, ts_1.isPrivateIdentifier)(bindingElement.name)) {
                return ts_1.Debug.failBadSyntaxKind(bindingElement.name);
            }
            return bindingElement.name;
    }
    var target = getTargetOfBindingOrAssignmentElement(bindingElement);
    if (target && (0, ts_1.isPropertyName)(target)) {
        return target;
    }
}
exports.tryGetPropertyNameOfBindingOrAssignmentElement = tryGetPropertyNameOfBindingOrAssignmentElement;
function isStringOrNumericLiteral(node) {
    var kind = node.kind;
    return kind === 11 /* SyntaxKind.StringLiteral */
        || kind === 9 /* SyntaxKind.NumericLiteral */;
}
/**
 * Gets the elements of a BindingOrAssignmentPattern
 *
 * @internal
 */
function getElementsOfBindingOrAssignmentPattern(name) {
    switch (name.kind) {
        case 205 /* SyntaxKind.ObjectBindingPattern */:
        case 206 /* SyntaxKind.ArrayBindingPattern */:
        case 208 /* SyntaxKind.ArrayLiteralExpression */:
            // `a` in `{a}`
            // `a` in `[a]`
            return name.elements;
        case 209 /* SyntaxKind.ObjectLiteralExpression */:
            // `a` in `{a}`
            return name.properties;
    }
}
exports.getElementsOfBindingOrAssignmentPattern = getElementsOfBindingOrAssignmentPattern;
/** @internal */
function getJSDocTypeAliasName(fullName) {
    if (fullName) {
        var rightNode = fullName;
        while (true) {
            if ((0, ts_1.isIdentifier)(rightNode) || !rightNode.body) {
                return (0, ts_1.isIdentifier)(rightNode) ? rightNode : rightNode.name;
            }
            rightNode = rightNode.body;
        }
    }
}
exports.getJSDocTypeAliasName = getJSDocTypeAliasName;
/** @internal */
function canHaveIllegalType(node) {
    var kind = node.kind;
    return kind === 175 /* SyntaxKind.Constructor */
        || kind === 177 /* SyntaxKind.SetAccessor */;
}
exports.canHaveIllegalType = canHaveIllegalType;
/** @internal */
function canHaveIllegalTypeParameters(node) {
    var kind = node.kind;
    return kind === 175 /* SyntaxKind.Constructor */
        || kind === 176 /* SyntaxKind.GetAccessor */
        || kind === 177 /* SyntaxKind.SetAccessor */;
}
exports.canHaveIllegalTypeParameters = canHaveIllegalTypeParameters;
/** @internal */
function canHaveIllegalDecorators(node) {
    var kind = node.kind;
    return kind === 302 /* SyntaxKind.PropertyAssignment */
        || kind === 303 /* SyntaxKind.ShorthandPropertyAssignment */
        || kind === 261 /* SyntaxKind.FunctionDeclaration */
        || kind === 175 /* SyntaxKind.Constructor */
        || kind === 180 /* SyntaxKind.IndexSignature */
        || kind === 174 /* SyntaxKind.ClassStaticBlockDeclaration */
        || kind === 281 /* SyntaxKind.MissingDeclaration */
        || kind === 242 /* SyntaxKind.VariableStatement */
        || kind === 263 /* SyntaxKind.InterfaceDeclaration */
        || kind === 264 /* SyntaxKind.TypeAliasDeclaration */
        || kind === 265 /* SyntaxKind.EnumDeclaration */
        || kind === 266 /* SyntaxKind.ModuleDeclaration */
        || kind === 270 /* SyntaxKind.ImportEqualsDeclaration */
        || kind === 271 /* SyntaxKind.ImportDeclaration */
        || kind === 269 /* SyntaxKind.NamespaceExportDeclaration */
        || kind === 277 /* SyntaxKind.ExportDeclaration */
        || kind === 276 /* SyntaxKind.ExportAssignment */;
}
exports.canHaveIllegalDecorators = canHaveIllegalDecorators;
/** @internal */
function canHaveIllegalModifiers(node) {
    var kind = node.kind;
    return kind === 174 /* SyntaxKind.ClassStaticBlockDeclaration */
        || kind === 302 /* SyntaxKind.PropertyAssignment */
        || kind === 303 /* SyntaxKind.ShorthandPropertyAssignment */
        || kind === 281 /* SyntaxKind.MissingDeclaration */
        || kind === 269 /* SyntaxKind.NamespaceExportDeclaration */;
}
exports.canHaveIllegalModifiers = canHaveIllegalModifiers;
function isQuestionOrExclamationToken(node) {
    return (0, ts_1.isQuestionToken)(node) || (0, ts_1.isExclamationToken)(node);
}
exports.isQuestionOrExclamationToken = isQuestionOrExclamationToken;
function isIdentifierOrThisTypeNode(node) {
    return (0, ts_1.isIdentifier)(node) || (0, ts_1.isThisTypeNode)(node);
}
exports.isIdentifierOrThisTypeNode = isIdentifierOrThisTypeNode;
function isReadonlyKeywordOrPlusOrMinusToken(node) {
    return (0, ts_1.isReadonlyKeyword)(node) || (0, ts_1.isPlusToken)(node) || (0, ts_1.isMinusToken)(node);
}
exports.isReadonlyKeywordOrPlusOrMinusToken = isReadonlyKeywordOrPlusOrMinusToken;
function isQuestionOrPlusOrMinusToken(node) {
    return (0, ts_1.isQuestionToken)(node) || (0, ts_1.isPlusToken)(node) || (0, ts_1.isMinusToken)(node);
}
exports.isQuestionOrPlusOrMinusToken = isQuestionOrPlusOrMinusToken;
function isModuleName(node) {
    return (0, ts_1.isIdentifier)(node) || (0, ts_1.isStringLiteral)(node);
}
exports.isModuleName = isModuleName;
/** @internal */
function isLiteralTypeLikeExpression(node) {
    var kind = node.kind;
    return kind === 106 /* SyntaxKind.NullKeyword */
        || kind === 112 /* SyntaxKind.TrueKeyword */
        || kind === 97 /* SyntaxKind.FalseKeyword */
        || (0, ts_1.isLiteralExpression)(node)
        || (0, ts_1.isPrefixUnaryExpression)(node);
}
exports.isLiteralTypeLikeExpression = isLiteralTypeLikeExpression;
function isExponentiationOperator(kind) {
    return kind === 43 /* SyntaxKind.AsteriskAsteriskToken */;
}
function isMultiplicativeOperator(kind) {
    return kind === 42 /* SyntaxKind.AsteriskToken */
        || kind === 44 /* SyntaxKind.SlashToken */
        || kind === 45 /* SyntaxKind.PercentToken */;
}
function isMultiplicativeOperatorOrHigher(kind) {
    return isExponentiationOperator(kind)
        || isMultiplicativeOperator(kind);
}
function isAdditiveOperator(kind) {
    return kind === 40 /* SyntaxKind.PlusToken */
        || kind === 41 /* SyntaxKind.MinusToken */;
}
function isAdditiveOperatorOrHigher(kind) {
    return isAdditiveOperator(kind)
        || isMultiplicativeOperatorOrHigher(kind);
}
function isShiftOperator(kind) {
    return kind === 48 /* SyntaxKind.LessThanLessThanToken */
        || kind === 49 /* SyntaxKind.GreaterThanGreaterThanToken */
        || kind === 50 /* SyntaxKind.GreaterThanGreaterThanGreaterThanToken */;
}
function isShiftOperatorOrHigher(kind) {
    return isShiftOperator(kind)
        || isAdditiveOperatorOrHigher(kind);
}
function isRelationalOperator(kind) {
    return kind === 30 /* SyntaxKind.LessThanToken */
        || kind === 33 /* SyntaxKind.LessThanEqualsToken */
        || kind === 32 /* SyntaxKind.GreaterThanToken */
        || kind === 34 /* SyntaxKind.GreaterThanEqualsToken */
        || kind === 104 /* SyntaxKind.InstanceOfKeyword */
        || kind === 103 /* SyntaxKind.InKeyword */;
}
function isRelationalOperatorOrHigher(kind) {
    return isRelationalOperator(kind)
        || isShiftOperatorOrHigher(kind);
}
function isEqualityOperator(kind) {
    return kind === 35 /* SyntaxKind.EqualsEqualsToken */
        || kind === 37 /* SyntaxKind.EqualsEqualsEqualsToken */
        || kind === 36 /* SyntaxKind.ExclamationEqualsToken */
        || kind === 38 /* SyntaxKind.ExclamationEqualsEqualsToken */;
}
function isEqualityOperatorOrHigher(kind) {
    return isEqualityOperator(kind)
        || isRelationalOperatorOrHigher(kind);
}
function isBitwiseOperator(kind) {
    return kind === 51 /* SyntaxKind.AmpersandToken */
        || kind === 52 /* SyntaxKind.BarToken */
        || kind === 53 /* SyntaxKind.CaretToken */;
}
function isBitwiseOperatorOrHigher(kind) {
    return isBitwiseOperator(kind)
        || isEqualityOperatorOrHigher(kind);
}
// NOTE: The version in utilities includes ExclamationToken, which is not a binary operator.
function isLogicalOperator(kind) {
    return kind === 56 /* SyntaxKind.AmpersandAmpersandToken */
        || kind === 57 /* SyntaxKind.BarBarToken */;
}
function isLogicalOperatorOrHigher(kind) {
    return isLogicalOperator(kind)
        || isBitwiseOperatorOrHigher(kind);
}
function isAssignmentOperatorOrHigher(kind) {
    return kind === 61 /* SyntaxKind.QuestionQuestionToken */
        || isLogicalOperatorOrHigher(kind)
        || (0, ts_1.isAssignmentOperator)(kind);
}
function isBinaryOperator(kind) {
    return isAssignmentOperatorOrHigher(kind)
        || kind === 28 /* SyntaxKind.CommaToken */;
}
function isBinaryOperatorToken(node) {
    return isBinaryOperator(node.kind);
}
exports.isBinaryOperatorToken = isBinaryOperatorToken;
var BinaryExpressionState;
(function (BinaryExpressionState) {
    /**
     * Handles walking into a `BinaryExpression`.
     * @param machine State machine handler functions
     * @param frame The current frame
     * @returns The new frame
     */
    function enter(machine, stackIndex, stateStack, nodeStack, userStateStack, _resultHolder, outerState) {
        var prevUserState = stackIndex > 0 ? userStateStack[stackIndex - 1] : undefined;
        ts_1.Debug.assertEqual(stateStack[stackIndex], enter);
        userStateStack[stackIndex] = machine.onEnter(nodeStack[stackIndex], prevUserState, outerState);
        stateStack[stackIndex] = nextState(machine, enter);
        return stackIndex;
    }
    BinaryExpressionState.enter = enter;
    /**
     * Handles walking the `left` side of a `BinaryExpression`.
     * @param machine State machine handler functions
     * @param frame The current frame
     * @returns The new frame
     */
    function left(machine, stackIndex, stateStack, nodeStack, userStateStack, _resultHolder, _outerState) {
        ts_1.Debug.assertEqual(stateStack[stackIndex], left);
        ts_1.Debug.assertIsDefined(machine.onLeft);
        stateStack[stackIndex] = nextState(machine, left);
        var nextNode = machine.onLeft(nodeStack[stackIndex].left, userStateStack[stackIndex], nodeStack[stackIndex]);
        if (nextNode) {
            checkCircularity(stackIndex, nodeStack, nextNode);
            return pushStack(stackIndex, stateStack, nodeStack, userStateStack, nextNode);
        }
        return stackIndex;
    }
    BinaryExpressionState.left = left;
    /**
     * Handles walking the `operatorToken` of a `BinaryExpression`.
     * @param machine State machine handler functions
     * @param frame The current frame
     * @returns The new frame
     */
    function operator(machine, stackIndex, stateStack, nodeStack, userStateStack, _resultHolder, _outerState) {
        ts_1.Debug.assertEqual(stateStack[stackIndex], operator);
        ts_1.Debug.assertIsDefined(machine.onOperator);
        stateStack[stackIndex] = nextState(machine, operator);
        machine.onOperator(nodeStack[stackIndex].operatorToken, userStateStack[stackIndex], nodeStack[stackIndex]);
        return stackIndex;
    }
    BinaryExpressionState.operator = operator;
    /**
     * Handles walking the `right` side of a `BinaryExpression`.
     * @param machine State machine handler functions
     * @param frame The current frame
     * @returns The new frame
     */
    function right(machine, stackIndex, stateStack, nodeStack, userStateStack, _resultHolder, _outerState) {
        ts_1.Debug.assertEqual(stateStack[stackIndex], right);
        ts_1.Debug.assertIsDefined(machine.onRight);
        stateStack[stackIndex] = nextState(machine, right);
        var nextNode = machine.onRight(nodeStack[stackIndex].right, userStateStack[stackIndex], nodeStack[stackIndex]);
        if (nextNode) {
            checkCircularity(stackIndex, nodeStack, nextNode);
            return pushStack(stackIndex, stateStack, nodeStack, userStateStack, nextNode);
        }
        return stackIndex;
    }
    BinaryExpressionState.right = right;
    /**
     * Handles walking out of a `BinaryExpression`.
     * @param machine State machine handler functions
     * @param frame The current frame
     * @returns The new frame
     */
    function exit(machine, stackIndex, stateStack, nodeStack, userStateStack, resultHolder, _outerState) {
        ts_1.Debug.assertEqual(stateStack[stackIndex], exit);
        stateStack[stackIndex] = nextState(machine, exit);
        var result = machine.onExit(nodeStack[stackIndex], userStateStack[stackIndex]);
        if (stackIndex > 0) {
            stackIndex--;
            if (machine.foldState) {
                var side = stateStack[stackIndex] === exit ? "right" : "left";
                userStateStack[stackIndex] = machine.foldState(userStateStack[stackIndex], result, side);
            }
        }
        else {
            resultHolder.value = result;
        }
        return stackIndex;
    }
    BinaryExpressionState.exit = exit;
    /**
     * Handles a frame that is already done.
     * @returns The `done` state.
     */
    function done(_machine, stackIndex, stateStack, _nodeStack, _userStateStack, _resultHolder, _outerState) {
        ts_1.Debug.assertEqual(stateStack[stackIndex], done);
        return stackIndex;
    }
    BinaryExpressionState.done = done;
    function nextState(machine, currentState) {
        switch (currentState) {
            case enter:
                if (machine.onLeft)
                    return left;
            // falls through
            case left:
                if (machine.onOperator)
                    return operator;
            // falls through
            case operator:
                if (machine.onRight)
                    return right;
            // falls through
            case right: return exit;
            case exit: return done;
            case done: return done;
            default: ts_1.Debug.fail("Invalid state");
        }
    }
    BinaryExpressionState.nextState = nextState;
    function pushStack(stackIndex, stateStack, nodeStack, userStateStack, node) {
        stackIndex++;
        stateStack[stackIndex] = enter;
        nodeStack[stackIndex] = node;
        userStateStack[stackIndex] = undefined;
        return stackIndex;
    }
    function checkCircularity(stackIndex, nodeStack, node) {
        if (ts_1.Debug.shouldAssert(2 /* AssertionLevel.Aggressive */)) {
            while (stackIndex >= 0) {
                ts_1.Debug.assert(nodeStack[stackIndex] !== node, "Circular traversal detected.");
                stackIndex--;
            }
        }
    }
})(BinaryExpressionState || (BinaryExpressionState = {}));
/**
 * Holds state machine handler functions
 */
var BinaryExpressionStateMachine = /** @class */ (function () {
    function BinaryExpressionStateMachine(onEnter, onLeft, onOperator, onRight, onExit, foldState) {
        this.onEnter = onEnter;
        this.onLeft = onLeft;
        this.onOperator = onOperator;
        this.onRight = onRight;
        this.onExit = onExit;
        this.foldState = foldState;
    }
    return BinaryExpressionStateMachine;
}());
/** @internal */
function createBinaryExpressionTrampoline(onEnter, onLeft, onOperator, onRight, onExit, foldState) {
    var machine = new BinaryExpressionStateMachine(onEnter, onLeft, onOperator, onRight, onExit, foldState);
    return trampoline;
    function trampoline(node, outerState) {
        var resultHolder = { value: undefined };
        var stateStack = [BinaryExpressionState.enter];
        var nodeStack = [node];
        var userStateStack = [undefined];
        var stackIndex = 0;
        while (stateStack[stackIndex] !== BinaryExpressionState.done) {
            stackIndex = stateStack[stackIndex](machine, stackIndex, stateStack, nodeStack, userStateStack, resultHolder, outerState);
        }
        ts_1.Debug.assertEqual(stackIndex, 0);
        return resultHolder.value;
    }
}
exports.createBinaryExpressionTrampoline = createBinaryExpressionTrampoline;
function isExportOrDefaultKeywordKind(kind) {
    return kind === 95 /* SyntaxKind.ExportKeyword */ || kind === 90 /* SyntaxKind.DefaultKeyword */;
}
/** @internal */
function isExportOrDefaultModifier(node) {
    var kind = node.kind;
    return isExportOrDefaultKeywordKind(kind);
}
exports.isExportOrDefaultModifier = isExportOrDefaultModifier;
/** @internal */
function isNonExportDefaultModifier(node) {
    var kind = node.kind;
    return (0, ts_1.isModifierKind)(kind) && !isExportOrDefaultKeywordKind(kind);
}
exports.isNonExportDefaultModifier = isNonExportDefaultModifier;
/** @internal */
function elideNodes(factory, nodes) {
    if (nodes === undefined)
        return undefined;
    if (nodes.length === 0)
        return nodes;
    return (0, ts_1.setTextRange)(factory.createNodeArray([], nodes.hasTrailingComma), nodes);
}
exports.elideNodes = elideNodes;
/**
 * Gets the node from which a name should be generated.
 *
 * @internal
 */
function getNodeForGeneratedName(name) {
    var _a;
    var autoGenerate = name.emitNode.autoGenerate;
    if (autoGenerate.flags & 4 /* GeneratedIdentifierFlags.Node */) {
        var autoGenerateId = autoGenerate.id;
        var node = name;
        var original = node.original;
        while (original) {
            node = original;
            var autoGenerate_1 = (_a = node.emitNode) === null || _a === void 0 ? void 0 : _a.autoGenerate;
            // if "node" is a different generated name (having a different "autoGenerateId"), use it and stop traversing.
            if ((0, ts_1.isMemberName)(node) && (autoGenerate_1 === undefined ||
                !!(autoGenerate_1.flags & 4 /* GeneratedIdentifierFlags.Node */) &&
                    autoGenerate_1.id !== autoGenerateId)) {
                break;
            }
            original = node.original;
        }
        // otherwise, return the original node for the source
        return node;
    }
    return name;
}
exports.getNodeForGeneratedName = getNodeForGeneratedName;
/** @internal */
function formatGeneratedNamePart(part, generateName) {
    return typeof part === "object" ? formatGeneratedName(/*privateName*/ false, part.prefix, part.node, part.suffix, generateName) :
        typeof part === "string" ? part.length > 0 && part.charCodeAt(0) === 35 /* CharacterCodes.hash */ ? part.slice(1) : part :
            "";
}
exports.formatGeneratedNamePart = formatGeneratedNamePart;
function formatIdentifier(name, generateName) {
    return typeof name === "string" ? name :
        formatIdentifierWorker(name, ts_1.Debug.checkDefined(generateName));
}
function formatIdentifierWorker(node, generateName) {
    return (0, ts_1.isGeneratedPrivateIdentifier)(node) ? generateName(node).slice(1) :
        (0, ts_1.isGeneratedIdentifier)(node) ? generateName(node) :
            (0, ts_1.isPrivateIdentifier)(node) ? node.escapedText.slice(1) :
                (0, ts_1.idText)(node);
}
/** @internal */
function formatGeneratedName(privateName, prefix, baseName, suffix, generateName) {
    prefix = formatGeneratedNamePart(prefix, generateName);
    suffix = formatGeneratedNamePart(suffix, generateName);
    baseName = formatIdentifier(baseName, generateName);
    return "".concat(privateName ? "#" : "").concat(prefix).concat(baseName).concat(suffix);
}
exports.formatGeneratedName = formatGeneratedName;
/**
 * Creates a private backing field for an `accessor` {@link PropertyDeclaration}.
 *
 * @internal
 */
function createAccessorPropertyBackingField(factory, node, modifiers, initializer) {
    return factory.updatePropertyDeclaration(node, modifiers, factory.getGeneratedPrivateNameForNode(node.name, /*prefix*/ undefined, "_accessor_storage"), 
    /*questionOrExclamationToken*/ undefined, 
    /*type*/ undefined, initializer);
}
exports.createAccessorPropertyBackingField = createAccessorPropertyBackingField;
/**
 * Creates a {@link GetAccessorDeclaration} that reads from a private backing field.
 *
 * @internal
 */
function createAccessorPropertyGetRedirector(factory, node, modifiers, name) {
    return factory.createGetAccessorDeclaration(modifiers, name, [], 
    /*type*/ undefined, factory.createBlock([
        factory.createReturnStatement(factory.createPropertyAccessExpression(factory.createThis(), factory.getGeneratedPrivateNameForNode(node.name, /*prefix*/ undefined, "_accessor_storage")))
    ]));
}
exports.createAccessorPropertyGetRedirector = createAccessorPropertyGetRedirector;
/**
 * Creates a {@link SetAccessorDeclaration} that writes to a private backing field.
 *
 * @internal
 */
function createAccessorPropertySetRedirector(factory, node, modifiers, name) {
    return factory.createSetAccessorDeclaration(modifiers, name, [factory.createParameterDeclaration(
        /*modifiers*/ undefined, 
        /*dotDotDotToken*/ undefined, "value")], factory.createBlock([
        factory.createExpressionStatement(factory.createAssignment(factory.createPropertyAccessExpression(factory.createThis(), factory.getGeneratedPrivateNameForNode(node.name, /*prefix*/ undefined, "_accessor_storage")), factory.createIdentifier("value")))
    ]));
}
exports.createAccessorPropertySetRedirector = createAccessorPropertySetRedirector;
/** @internal */
function findComputedPropertyNameCacheAssignment(name) {
    var node = name.expression;
    while (true) {
        node = skipOuterExpressions(node);
        if ((0, ts_1.isCommaListExpression)(node)) {
            node = (0, ts_1.last)(node.elements);
            continue;
        }
        if (isCommaExpression(node)) {
            node = node.right;
            continue;
        }
        if ((0, ts_1.isAssignmentExpression)(node, /*excludeCompoundAssignment*/ true) && (0, ts_1.isGeneratedIdentifier)(node.left)) {
            return node;
        }
        break;
    }
}
exports.findComputedPropertyNameCacheAssignment = findComputedPropertyNameCacheAssignment;
function isSyntheticParenthesizedExpression(node) {
    return (0, ts_1.isParenthesizedExpression)(node)
        && (0, ts_1.nodeIsSynthesized)(node)
        && !node.emitNode;
}
function flattenCommaListWorker(node, expressions) {
    if (isSyntheticParenthesizedExpression(node)) {
        flattenCommaListWorker(node.expression, expressions);
    }
    else if (isCommaExpression(node)) {
        flattenCommaListWorker(node.left, expressions);
        flattenCommaListWorker(node.right, expressions);
    }
    else if ((0, ts_1.isCommaListExpression)(node)) {
        for (var _i = 0, _a = node.elements; _i < _a.length; _i++) {
            var child = _a[_i];
            flattenCommaListWorker(child, expressions);
        }
    }
    else {
        expressions.push(node);
    }
}
/**
 * Flatten a CommaExpression or CommaListExpression into an array of one or more expressions, unwrapping any nested
 * comma expressions and synthetic parens.
 *
 * @internal
 */
function flattenCommaList(node) {
    var expressions = [];
    flattenCommaListWorker(node, expressions);
    return expressions;
}
exports.flattenCommaList = flattenCommaList;
/**
 * Walk an AssignmentPattern to determine if it contains object rest (`...`) syntax. We cannot rely on
 * propagation of `TransformFlags.ContainsObjectRestOrSpread` since it isn't propagated by default in
 * ObjectLiteralExpression and ArrayLiteralExpression since we do not know whether they belong to an
 * AssignmentPattern at the time the nodes are parsed.
 *
 * @internal
 */
function containsObjectRestOrSpread(node) {
    if (node.transformFlags & 65536 /* TransformFlags.ContainsObjectRestOrSpread */)
        return true;
    if (node.transformFlags & 128 /* TransformFlags.ContainsES2018 */) {
        // check for nested spread assignments, otherwise '{ x: { a, ...b } = foo } = c'
        // will not be correctly interpreted by the ES2018 transformer
        for (var _i = 0, _a = getElementsOfBindingOrAssignmentPattern(node); _i < _a.length; _i++) {
            var element = _a[_i];
            var target = getTargetOfBindingOrAssignmentElement(element);
            if (target && (0, ts_1.isAssignmentPattern)(target)) {
                if (target.transformFlags & 65536 /* TransformFlags.ContainsObjectRestOrSpread */) {
                    return true;
                }
                if (target.transformFlags & 128 /* TransformFlags.ContainsES2018 */) {
                    if (containsObjectRestOrSpread(target))
                        return true;
                }
            }
        }
    }
    return false;
}
exports.containsObjectRestOrSpread = containsObjectRestOrSpread;
