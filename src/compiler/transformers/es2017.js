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
exports.createSuperAccessVariableStatement = exports.transformES2017 = void 0;
var ts_1 = require("../_namespaces/ts");
/** @internal */
function transformES2017(context) {
    var factory = context.factory, emitHelpers = context.getEmitHelperFactory, resumeLexicalEnvironment = context.resumeLexicalEnvironment, endLexicalEnvironment = context.endLexicalEnvironment, hoistVariableDeclaration = context.hoistVariableDeclaration;
    var resolver = context.getEmitResolver();
    var compilerOptions = context.getCompilerOptions();
    var languageVersion = (0, ts_1.getEmitScriptTarget)(compilerOptions);
    /**
     * Keeps track of whether expression substitution has been enabled for specific edge cases.
     * They are persisted between each SourceFile transformation and should not be reset.
     */
    var enabledSubstitutions;
    /**
     * This keeps track of containers where `super` is valid, for use with
     * just-in-time substitution for `super` expressions inside of async methods.
     */
    var enclosingSuperContainerFlags = 0;
    var enclosingFunctionParameterNames;
    /**
     * Keeps track of property names accessed on super (`super.x`) within async functions.
     */
    var capturedSuperProperties;
    /** Whether the async function contains an element access on super (`super[x]`). */
    var hasSuperElementAccess;
    /** A set of node IDs for generated super accessors (variable statements). */
    var substitutedSuperAccessors = [];
    var contextFlags = 0 /* ContextFlags.None */;
    // Save the previous transformation hooks.
    var previousOnEmitNode = context.onEmitNode;
    var previousOnSubstituteNode = context.onSubstituteNode;
    // Set new transformation hooks.
    context.onEmitNode = onEmitNode;
    context.onSubstituteNode = onSubstituteNode;
    return (0, ts_1.chainBundle)(context, transformSourceFile);
    function transformSourceFile(node) {
        if (node.isDeclarationFile) {
            return node;
        }
        setContextFlag(1 /* ContextFlags.NonTopLevel */, false);
        setContextFlag(2 /* ContextFlags.HasLexicalThis */, !(0, ts_1.isEffectiveStrictModeSourceFile)(node, compilerOptions));
        var visited = (0, ts_1.visitEachChild)(node, visitor, context);
        (0, ts_1.addEmitHelpers)(visited, context.readEmitHelpers());
        return visited;
    }
    function setContextFlag(flag, val) {
        contextFlags = val ? contextFlags | flag : contextFlags & ~flag;
    }
    function inContext(flags) {
        return (contextFlags & flags) !== 0;
    }
    function inTopLevelContext() {
        return !inContext(1 /* ContextFlags.NonTopLevel */);
    }
    function inHasLexicalThisContext() {
        return inContext(2 /* ContextFlags.HasLexicalThis */);
    }
    function doWithContext(flags, cb, value) {
        var contextFlagsToSet = flags & ~contextFlags;
        if (contextFlagsToSet) {
            setContextFlag(contextFlagsToSet, /*val*/ true);
            var result = cb(value);
            setContextFlag(contextFlagsToSet, /*val*/ false);
            return result;
        }
        return cb(value);
    }
    function visitDefault(node) {
        return (0, ts_1.visitEachChild)(node, visitor, context);
    }
    function visitor(node) {
        if ((node.transformFlags & 256 /* TransformFlags.ContainsES2017 */) === 0) {
            return node;
        }
        switch (node.kind) {
            case 134 /* SyntaxKind.AsyncKeyword */:
                // ES2017 async modifier should be elided for targets < ES2017
                return undefined;
            case 222 /* SyntaxKind.AwaitExpression */:
                return visitAwaitExpression(node);
            case 173 /* SyntaxKind.MethodDeclaration */:
                return doWithContext(1 /* ContextFlags.NonTopLevel */ | 2 /* ContextFlags.HasLexicalThis */, visitMethodDeclaration, node);
            case 261 /* SyntaxKind.FunctionDeclaration */:
                return doWithContext(1 /* ContextFlags.NonTopLevel */ | 2 /* ContextFlags.HasLexicalThis */, visitFunctionDeclaration, node);
            case 217 /* SyntaxKind.FunctionExpression */:
                return doWithContext(1 /* ContextFlags.NonTopLevel */ | 2 /* ContextFlags.HasLexicalThis */, visitFunctionExpression, node);
            case 218 /* SyntaxKind.ArrowFunction */:
                return doWithContext(1 /* ContextFlags.NonTopLevel */, visitArrowFunction, node);
            case 210 /* SyntaxKind.PropertyAccessExpression */:
                if (capturedSuperProperties && (0, ts_1.isPropertyAccessExpression)(node) && node.expression.kind === 108 /* SyntaxKind.SuperKeyword */) {
                    capturedSuperProperties.add(node.name.escapedText);
                }
                return (0, ts_1.visitEachChild)(node, visitor, context);
            case 211 /* SyntaxKind.ElementAccessExpression */:
                if (capturedSuperProperties && node.expression.kind === 108 /* SyntaxKind.SuperKeyword */) {
                    hasSuperElementAccess = true;
                }
                return (0, ts_1.visitEachChild)(node, visitor, context);
            case 176 /* SyntaxKind.GetAccessor */:
                return doWithContext(1 /* ContextFlags.NonTopLevel */ | 2 /* ContextFlags.HasLexicalThis */, visitGetAccessorDeclaration, node);
            case 177 /* SyntaxKind.SetAccessor */:
                return doWithContext(1 /* ContextFlags.NonTopLevel */ | 2 /* ContextFlags.HasLexicalThis */, visitSetAccessorDeclaration, node);
            case 175 /* SyntaxKind.Constructor */:
                return doWithContext(1 /* ContextFlags.NonTopLevel */ | 2 /* ContextFlags.HasLexicalThis */, visitConstructorDeclaration, node);
            case 262 /* SyntaxKind.ClassDeclaration */:
            case 230 /* SyntaxKind.ClassExpression */:
                return doWithContext(1 /* ContextFlags.NonTopLevel */ | 2 /* ContextFlags.HasLexicalThis */, visitDefault, node);
            default:
                return (0, ts_1.visitEachChild)(node, visitor, context);
        }
    }
    function asyncBodyVisitor(node) {
        if ((0, ts_1.isNodeWithPossibleHoistedDeclaration)(node)) {
            switch (node.kind) {
                case 242 /* SyntaxKind.VariableStatement */:
                    return visitVariableStatementInAsyncBody(node);
                case 247 /* SyntaxKind.ForStatement */:
                    return visitForStatementInAsyncBody(node);
                case 248 /* SyntaxKind.ForInStatement */:
                    return visitForInStatementInAsyncBody(node);
                case 249 /* SyntaxKind.ForOfStatement */:
                    return visitForOfStatementInAsyncBody(node);
                case 298 /* SyntaxKind.CatchClause */:
                    return visitCatchClauseInAsyncBody(node);
                case 240 /* SyntaxKind.Block */:
                case 254 /* SyntaxKind.SwitchStatement */:
                case 268 /* SyntaxKind.CaseBlock */:
                case 295 /* SyntaxKind.CaseClause */:
                case 296 /* SyntaxKind.DefaultClause */:
                case 257 /* SyntaxKind.TryStatement */:
                case 245 /* SyntaxKind.DoStatement */:
                case 246 /* SyntaxKind.WhileStatement */:
                case 244 /* SyntaxKind.IfStatement */:
                case 253 /* SyntaxKind.WithStatement */:
                case 255 /* SyntaxKind.LabeledStatement */:
                    return (0, ts_1.visitEachChild)(node, asyncBodyVisitor, context);
                default:
                    return ts_1.Debug.assertNever(node, "Unhandled node.");
            }
        }
        return visitor(node);
    }
    function visitCatchClauseInAsyncBody(node) {
        var catchClauseNames = new Set();
        recordDeclarationName(node.variableDeclaration, catchClauseNames); // TODO: GH#18217
        // names declared in a catch variable are block scoped
        var catchClauseUnshadowedNames;
        catchClauseNames.forEach(function (_, escapedName) {
            if (enclosingFunctionParameterNames.has(escapedName)) {
                if (!catchClauseUnshadowedNames) {
                    catchClauseUnshadowedNames = new Set(enclosingFunctionParameterNames);
                }
                catchClauseUnshadowedNames.delete(escapedName);
            }
        });
        if (catchClauseUnshadowedNames) {
            var savedEnclosingFunctionParameterNames = enclosingFunctionParameterNames;
            enclosingFunctionParameterNames = catchClauseUnshadowedNames;
            var result = (0, ts_1.visitEachChild)(node, asyncBodyVisitor, context);
            enclosingFunctionParameterNames = savedEnclosingFunctionParameterNames;
            return result;
        }
        else {
            return (0, ts_1.visitEachChild)(node, asyncBodyVisitor, context);
        }
    }
    function visitVariableStatementInAsyncBody(node) {
        if (isVariableDeclarationListWithCollidingName(node.declarationList)) {
            var expression = visitVariableDeclarationListWithCollidingNames(node.declarationList, /*hasReceiver*/ false);
            return expression ? factory.createExpressionStatement(expression) : undefined;
        }
        return (0, ts_1.visitEachChild)(node, visitor, context);
    }
    function visitForInStatementInAsyncBody(node) {
        return factory.updateForInStatement(node, isVariableDeclarationListWithCollidingName(node.initializer)
            ? visitVariableDeclarationListWithCollidingNames(node.initializer, /*hasReceiver*/ true)
            : ts_1.Debug.checkDefined((0, ts_1.visitNode)(node.initializer, visitor, ts_1.isForInitializer)), ts_1.Debug.checkDefined((0, ts_1.visitNode)(node.expression, visitor, ts_1.isExpression)), (0, ts_1.visitIterationBody)(node.statement, asyncBodyVisitor, context));
    }
    function visitForOfStatementInAsyncBody(node) {
        return factory.updateForOfStatement(node, (0, ts_1.visitNode)(node.awaitModifier, visitor, ts_1.isAwaitKeyword), isVariableDeclarationListWithCollidingName(node.initializer)
            ? visitVariableDeclarationListWithCollidingNames(node.initializer, /*hasReceiver*/ true)
            : ts_1.Debug.checkDefined((0, ts_1.visitNode)(node.initializer, visitor, ts_1.isForInitializer)), ts_1.Debug.checkDefined((0, ts_1.visitNode)(node.expression, visitor, ts_1.isExpression)), (0, ts_1.visitIterationBody)(node.statement, asyncBodyVisitor, context));
    }
    function visitForStatementInAsyncBody(node) {
        var initializer = node.initializer; // TODO: GH#18217
        return factory.updateForStatement(node, isVariableDeclarationListWithCollidingName(initializer)
            ? visitVariableDeclarationListWithCollidingNames(initializer, /*hasReceiver*/ false)
            : (0, ts_1.visitNode)(node.initializer, visitor, ts_1.isForInitializer), (0, ts_1.visitNode)(node.condition, visitor, ts_1.isExpression), (0, ts_1.visitNode)(node.incrementor, visitor, ts_1.isExpression), (0, ts_1.visitIterationBody)(node.statement, asyncBodyVisitor, context));
    }
    /**
     * Visits an AwaitExpression node.
     *
     * This function will be called any time a ES2017 await expression is encountered.
     *
     * @param node The node to visit.
     */
    function visitAwaitExpression(node) {
        // do not downlevel a top-level await as it is module syntax...
        if (inTopLevelContext()) {
            return (0, ts_1.visitEachChild)(node, visitor, context);
        }
        return (0, ts_1.setOriginalNode)((0, ts_1.setTextRange)(factory.createYieldExpression(
        /*asteriskToken*/ undefined, (0, ts_1.visitNode)(node.expression, visitor, ts_1.isExpression)), node), node);
    }
    function visitConstructorDeclaration(node) {
        return factory.updateConstructorDeclaration(node, (0, ts_1.visitNodes)(node.modifiers, visitor, ts_1.isModifier), (0, ts_1.visitParameterList)(node.parameters, visitor, context), transformMethodBody(node));
    }
    /**
     * Visits a MethodDeclaration node.
     *
     * This function will be called when one of the following conditions are met:
     * - The node is marked as async
     *
     * @param node The node to visit.
     */
    function visitMethodDeclaration(node) {
        return factory.updateMethodDeclaration(node, (0, ts_1.visitNodes)(node.modifiers, visitor, ts_1.isModifierLike), node.asteriskToken, node.name, 
        /*questionToken*/ undefined, 
        /*typeParameters*/ undefined, (0, ts_1.visitParameterList)(node.parameters, visitor, context), 
        /*type*/ undefined, (0, ts_1.getFunctionFlags)(node) & 2 /* FunctionFlags.Async */
            ? transformAsyncFunctionBody(node)
            : transformMethodBody(node));
    }
    function visitGetAccessorDeclaration(node) {
        return factory.updateGetAccessorDeclaration(node, (0, ts_1.visitNodes)(node.modifiers, visitor, ts_1.isModifierLike), node.name, (0, ts_1.visitParameterList)(node.parameters, visitor, context), 
        /*type*/ undefined, transformMethodBody(node));
    }
    function visitSetAccessorDeclaration(node) {
        return factory.updateSetAccessorDeclaration(node, (0, ts_1.visitNodes)(node.modifiers, visitor, ts_1.isModifierLike), node.name, (0, ts_1.visitParameterList)(node.parameters, visitor, context), transformMethodBody(node));
    }
    /**
     * Visits a FunctionDeclaration node.
     *
     * This function will be called when one of the following conditions are met:
     * - The node is marked async
     *
     * @param node The node to visit.
     */
    function visitFunctionDeclaration(node) {
        return factory.updateFunctionDeclaration(node, (0, ts_1.visitNodes)(node.modifiers, visitor, ts_1.isModifierLike), node.asteriskToken, node.name, 
        /*typeParameters*/ undefined, (0, ts_1.visitParameterList)(node.parameters, visitor, context), 
        /*type*/ undefined, (0, ts_1.getFunctionFlags)(node) & 2 /* FunctionFlags.Async */
            ? transformAsyncFunctionBody(node)
            : (0, ts_1.visitFunctionBody)(node.body, visitor, context));
    }
    /**
     * Visits a FunctionExpression node.
     *
     * This function will be called when one of the following conditions are met:
     * - The node is marked async
     *
     * @param node The node to visit.
     */
    function visitFunctionExpression(node) {
        return factory.updateFunctionExpression(node, (0, ts_1.visitNodes)(node.modifiers, visitor, ts_1.isModifier), node.asteriskToken, node.name, 
        /*typeParameters*/ undefined, (0, ts_1.visitParameterList)(node.parameters, visitor, context), 
        /*type*/ undefined, (0, ts_1.getFunctionFlags)(node) & 2 /* FunctionFlags.Async */
            ? transformAsyncFunctionBody(node)
            : (0, ts_1.visitFunctionBody)(node.body, visitor, context));
    }
    /**
     * Visits an ArrowFunction.
     *
     * This function will be called when one of the following conditions are met:
     * - The node is marked async
     *
     * @param node The node to visit.
     */
    function visitArrowFunction(node) {
        return factory.updateArrowFunction(node, (0, ts_1.visitNodes)(node.modifiers, visitor, ts_1.isModifier), 
        /*typeParameters*/ undefined, (0, ts_1.visitParameterList)(node.parameters, visitor, context), 
        /*type*/ undefined, node.equalsGreaterThanToken, (0, ts_1.getFunctionFlags)(node) & 2 /* FunctionFlags.Async */
            ? transformAsyncFunctionBody(node)
            : (0, ts_1.visitFunctionBody)(node.body, visitor, context));
    }
    function recordDeclarationName(_a, names) {
        var name = _a.name;
        if ((0, ts_1.isIdentifier)(name)) {
            names.add(name.escapedText);
        }
        else {
            for (var _i = 0, _b = name.elements; _i < _b.length; _i++) {
                var element = _b[_i];
                if (!(0, ts_1.isOmittedExpression)(element)) {
                    recordDeclarationName(element, names);
                }
            }
        }
    }
    function isVariableDeclarationListWithCollidingName(node) {
        return !!node
            && (0, ts_1.isVariableDeclarationList)(node)
            && !(node.flags & 3 /* NodeFlags.BlockScoped */)
            && node.declarations.some(collidesWithParameterName);
    }
    function visitVariableDeclarationListWithCollidingNames(node, hasReceiver) {
        hoistVariableDeclarationList(node);
        var variables = (0, ts_1.getInitializedVariables)(node);
        if (variables.length === 0) {
            if (hasReceiver) {
                return (0, ts_1.visitNode)(factory.converters.convertToAssignmentElementTarget(node.declarations[0].name), visitor, ts_1.isExpression);
            }
            return undefined;
        }
        return factory.inlineExpressions((0, ts_1.map)(variables, transformInitializedVariable));
    }
    function hoistVariableDeclarationList(node) {
        (0, ts_1.forEach)(node.declarations, hoistVariable);
    }
    function hoistVariable(_a) {
        var name = _a.name;
        if ((0, ts_1.isIdentifier)(name)) {
            hoistVariableDeclaration(name);
        }
        else {
            for (var _i = 0, _b = name.elements; _i < _b.length; _i++) {
                var element = _b[_i];
                if (!(0, ts_1.isOmittedExpression)(element)) {
                    hoistVariable(element);
                }
            }
        }
    }
    function transformInitializedVariable(node) {
        var converted = (0, ts_1.setSourceMapRange)(factory.createAssignment(factory.converters.convertToAssignmentElementTarget(node.name), node.initializer), node);
        return ts_1.Debug.checkDefined((0, ts_1.visitNode)(converted, visitor, ts_1.isExpression));
    }
    function collidesWithParameterName(_a) {
        var name = _a.name;
        if ((0, ts_1.isIdentifier)(name)) {
            return enclosingFunctionParameterNames.has(name.escapedText);
        }
        else {
            for (var _i = 0, _b = name.elements; _i < _b.length; _i++) {
                var element = _b[_i];
                if (!(0, ts_1.isOmittedExpression)(element) && collidesWithParameterName(element)) {
                    return true;
                }
            }
        }
        return false;
    }
    function transformMethodBody(node) {
        ts_1.Debug.assertIsDefined(node.body);
        var savedCapturedSuperProperties = capturedSuperProperties;
        var savedHasSuperElementAccess = hasSuperElementAccess;
        capturedSuperProperties = new Set();
        hasSuperElementAccess = false;
        var updated = (0, ts_1.visitFunctionBody)(node.body, visitor, context);
        // Minor optimization, emit `_super` helper to capture `super` access in an arrow.
        // This step isn't needed if we eventually transform this to ES5.
        var originalMethod = (0, ts_1.getOriginalNode)(node, ts_1.isFunctionLikeDeclaration);
        var emitSuperHelpers = languageVersion >= 2 /* ScriptTarget.ES2015 */ &&
            resolver.getNodeCheckFlags(node) & (256 /* NodeCheckFlags.MethodWithSuperPropertyAssignmentInAsync */ | 128 /* NodeCheckFlags.MethodWithSuperPropertyAccessInAsync */) &&
            ((0, ts_1.getFunctionFlags)(originalMethod) & 3 /* FunctionFlags.AsyncGenerator */) !== 3 /* FunctionFlags.AsyncGenerator */;
        if (emitSuperHelpers) {
            enableSubstitutionForAsyncMethodsWithSuper();
            if (capturedSuperProperties.size) {
                var variableStatement = createSuperAccessVariableStatement(factory, resolver, node, capturedSuperProperties);
                substitutedSuperAccessors[(0, ts_1.getNodeId)(variableStatement)] = true;
                var statements = updated.statements.slice();
                (0, ts_1.insertStatementsAfterStandardPrologue)(statements, [variableStatement]);
                updated = factory.updateBlock(updated, statements);
            }
            if (hasSuperElementAccess) {
                // Emit helpers for super element access expressions (`super[x]`).
                if (resolver.getNodeCheckFlags(node) & 256 /* NodeCheckFlags.MethodWithSuperPropertyAssignmentInAsync */) {
                    (0, ts_1.addEmitHelper)(updated, ts_1.advancedAsyncSuperHelper);
                }
                else if (resolver.getNodeCheckFlags(node) & 128 /* NodeCheckFlags.MethodWithSuperPropertyAccessInAsync */) {
                    (0, ts_1.addEmitHelper)(updated, ts_1.asyncSuperHelper);
                }
            }
        }
        capturedSuperProperties = savedCapturedSuperProperties;
        hasSuperElementAccess = savedHasSuperElementAccess;
        return updated;
    }
    function transformAsyncFunctionBody(node) {
        resumeLexicalEnvironment();
        var original = (0, ts_1.getOriginalNode)(node, ts_1.isFunctionLike);
        var nodeType = original.type;
        var promiseConstructor = languageVersion < 2 /* ScriptTarget.ES2015 */ ? getPromiseConstructor(nodeType) : undefined;
        var isArrowFunction = node.kind === 218 /* SyntaxKind.ArrowFunction */;
        var hasLexicalArguments = (resolver.getNodeCheckFlags(node) & 512 /* NodeCheckFlags.CaptureArguments */) !== 0;
        // An async function is emit as an outer function that calls an inner
        // generator function. To preserve lexical bindings, we pass the current
        // `this` and `arguments` objects to `__awaiter`. The generator function
        // passed to `__awaiter` is executed inside of the callback to the
        // promise constructor.
        var savedEnclosingFunctionParameterNames = enclosingFunctionParameterNames;
        enclosingFunctionParameterNames = new Set();
        for (var _i = 0, _a = node.parameters; _i < _a.length; _i++) {
            var parameter = _a[_i];
            recordDeclarationName(parameter, enclosingFunctionParameterNames);
        }
        var savedCapturedSuperProperties = capturedSuperProperties;
        var savedHasSuperElementAccess = hasSuperElementAccess;
        if (!isArrowFunction) {
            capturedSuperProperties = new Set();
            hasSuperElementAccess = false;
        }
        var result;
        if (!isArrowFunction) {
            var statements = [];
            var statementOffset = factory.copyPrologue(node.body.statements, statements, /*ensureUseStrict*/ false, visitor);
            statements.push(factory.createReturnStatement(emitHelpers().createAwaiterHelper(inHasLexicalThisContext(), hasLexicalArguments, promiseConstructor, transformAsyncFunctionBodyWorker(node.body, statementOffset))));
            (0, ts_1.insertStatementsAfterStandardPrologue)(statements, endLexicalEnvironment());
            // Minor optimization, emit `_super` helper to capture `super` access in an arrow.
            // This step isn't needed if we eventually transform this to ES5.
            var emitSuperHelpers = languageVersion >= 2 /* ScriptTarget.ES2015 */ && resolver.getNodeCheckFlags(node) & (256 /* NodeCheckFlags.MethodWithSuperPropertyAssignmentInAsync */ | 128 /* NodeCheckFlags.MethodWithSuperPropertyAccessInAsync */);
            if (emitSuperHelpers) {
                enableSubstitutionForAsyncMethodsWithSuper();
                if (capturedSuperProperties.size) {
                    var variableStatement = createSuperAccessVariableStatement(factory, resolver, node, capturedSuperProperties);
                    substitutedSuperAccessors[(0, ts_1.getNodeId)(variableStatement)] = true;
                    (0, ts_1.insertStatementsAfterStandardPrologue)(statements, [variableStatement]);
                }
            }
            var block = factory.createBlock(statements, /*multiLine*/ true);
            (0, ts_1.setTextRange)(block, node.body);
            if (emitSuperHelpers && hasSuperElementAccess) {
                // Emit helpers for super element access expressions (`super[x]`).
                if (resolver.getNodeCheckFlags(node) & 256 /* NodeCheckFlags.MethodWithSuperPropertyAssignmentInAsync */) {
                    (0, ts_1.addEmitHelper)(block, ts_1.advancedAsyncSuperHelper);
                }
                else if (resolver.getNodeCheckFlags(node) & 128 /* NodeCheckFlags.MethodWithSuperPropertyAccessInAsync */) {
                    (0, ts_1.addEmitHelper)(block, ts_1.asyncSuperHelper);
                }
            }
            result = block;
        }
        else {
            var expression = emitHelpers().createAwaiterHelper(inHasLexicalThisContext(), hasLexicalArguments, promiseConstructor, transformAsyncFunctionBodyWorker(node.body));
            var declarations = endLexicalEnvironment();
            if ((0, ts_1.some)(declarations)) {
                var block = factory.converters.convertToFunctionBlock(expression);
                result = factory.updateBlock(block, (0, ts_1.setTextRange)(factory.createNodeArray((0, ts_1.concatenate)(declarations, block.statements)), block.statements));
            }
            else {
                result = expression;
            }
        }
        enclosingFunctionParameterNames = savedEnclosingFunctionParameterNames;
        if (!isArrowFunction) {
            capturedSuperProperties = savedCapturedSuperProperties;
            hasSuperElementAccess = savedHasSuperElementAccess;
        }
        return result;
    }
    function transformAsyncFunctionBodyWorker(body, start) {
        if ((0, ts_1.isBlock)(body)) {
            return factory.updateBlock(body, (0, ts_1.visitNodes)(body.statements, asyncBodyVisitor, ts_1.isStatement, start));
        }
        else {
            return factory.converters.convertToFunctionBlock(ts_1.Debug.checkDefined((0, ts_1.visitNode)(body, asyncBodyVisitor, ts_1.isConciseBody)));
        }
    }
    function getPromiseConstructor(type) {
        var typeName = type && (0, ts_1.getEntityNameFromTypeNode)(type);
        if (typeName && (0, ts_1.isEntityName)(typeName)) {
            var serializationKind = resolver.getTypeReferenceSerializationKind(typeName);
            if (serializationKind === ts_1.TypeReferenceSerializationKind.TypeWithConstructSignatureAndValue
                || serializationKind === ts_1.TypeReferenceSerializationKind.Unknown) {
                return typeName;
            }
        }
        return undefined;
    }
    function enableSubstitutionForAsyncMethodsWithSuper() {
        if ((enabledSubstitutions & 1 /* ES2017SubstitutionFlags.AsyncMethodsWithSuper */) === 0) {
            enabledSubstitutions |= 1 /* ES2017SubstitutionFlags.AsyncMethodsWithSuper */;
            // We need to enable substitutions for call, property access, and element access
            // if we need to rewrite super calls.
            context.enableSubstitution(212 /* SyntaxKind.CallExpression */);
            context.enableSubstitution(210 /* SyntaxKind.PropertyAccessExpression */);
            context.enableSubstitution(211 /* SyntaxKind.ElementAccessExpression */);
            // We need to be notified when entering and exiting declarations that bind super.
            context.enableEmitNotification(262 /* SyntaxKind.ClassDeclaration */);
            context.enableEmitNotification(173 /* SyntaxKind.MethodDeclaration */);
            context.enableEmitNotification(176 /* SyntaxKind.GetAccessor */);
            context.enableEmitNotification(177 /* SyntaxKind.SetAccessor */);
            context.enableEmitNotification(175 /* SyntaxKind.Constructor */);
            // We need to be notified when entering the generated accessor arrow functions.
            context.enableEmitNotification(242 /* SyntaxKind.VariableStatement */);
        }
    }
    /**
     * Hook for node emit.
     *
     * @param hint A hint as to the intended usage of the node.
     * @param node The node to emit.
     * @param emit A callback used to emit the node in the printer.
     */
    function onEmitNode(hint, node, emitCallback) {
        // If we need to support substitutions for `super` in an async method,
        // we should track it here.
        if (enabledSubstitutions & 1 /* ES2017SubstitutionFlags.AsyncMethodsWithSuper */ && isSuperContainer(node)) {
            var superContainerFlags = resolver.getNodeCheckFlags(node) & (128 /* NodeCheckFlags.MethodWithSuperPropertyAccessInAsync */ | 256 /* NodeCheckFlags.MethodWithSuperPropertyAssignmentInAsync */);
            if (superContainerFlags !== enclosingSuperContainerFlags) {
                var savedEnclosingSuperContainerFlags = enclosingSuperContainerFlags;
                enclosingSuperContainerFlags = superContainerFlags;
                previousOnEmitNode(hint, node, emitCallback);
                enclosingSuperContainerFlags = savedEnclosingSuperContainerFlags;
                return;
            }
        }
        // Disable substitution in the generated super accessor itself.
        else if (enabledSubstitutions && substitutedSuperAccessors[(0, ts_1.getNodeId)(node)]) {
            var savedEnclosingSuperContainerFlags = enclosingSuperContainerFlags;
            enclosingSuperContainerFlags = 0;
            previousOnEmitNode(hint, node, emitCallback);
            enclosingSuperContainerFlags = savedEnclosingSuperContainerFlags;
            return;
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
        node = previousOnSubstituteNode(hint, node);
        if (hint === 1 /* EmitHint.Expression */ && enclosingSuperContainerFlags) {
            return substituteExpression(node);
        }
        return node;
    }
    function substituteExpression(node) {
        switch (node.kind) {
            case 210 /* SyntaxKind.PropertyAccessExpression */:
                return substitutePropertyAccessExpression(node);
            case 211 /* SyntaxKind.ElementAccessExpression */:
                return substituteElementAccessExpression(node);
            case 212 /* SyntaxKind.CallExpression */:
                return substituteCallExpression(node);
        }
        return node;
    }
    function substitutePropertyAccessExpression(node) {
        if (node.expression.kind === 108 /* SyntaxKind.SuperKeyword */) {
            return (0, ts_1.setTextRange)(factory.createPropertyAccessExpression(factory.createUniqueName("_super", 16 /* GeneratedIdentifierFlags.Optimistic */ | 32 /* GeneratedIdentifierFlags.FileLevel */), node.name), node);
        }
        return node;
    }
    function substituteElementAccessExpression(node) {
        if (node.expression.kind === 108 /* SyntaxKind.SuperKeyword */) {
            return createSuperElementAccessInAsyncMethod(node.argumentExpression, node);
        }
        return node;
    }
    function substituteCallExpression(node) {
        var expression = node.expression;
        if ((0, ts_1.isSuperProperty)(expression)) {
            var argumentExpression = (0, ts_1.isPropertyAccessExpression)(expression)
                ? substitutePropertyAccessExpression(expression)
                : substituteElementAccessExpression(expression);
            return factory.createCallExpression(factory.createPropertyAccessExpression(argumentExpression, "call"), 
            /*typeArguments*/ undefined, __spreadArray([
                factory.createThis()
            ], node.arguments, true));
        }
        return node;
    }
    function isSuperContainer(node) {
        var kind = node.kind;
        return kind === 262 /* SyntaxKind.ClassDeclaration */
            || kind === 175 /* SyntaxKind.Constructor */
            || kind === 173 /* SyntaxKind.MethodDeclaration */
            || kind === 176 /* SyntaxKind.GetAccessor */
            || kind === 177 /* SyntaxKind.SetAccessor */;
    }
    function createSuperElementAccessInAsyncMethod(argumentExpression, location) {
        if (enclosingSuperContainerFlags & 256 /* NodeCheckFlags.MethodWithSuperPropertyAssignmentInAsync */) {
            return (0, ts_1.setTextRange)(factory.createPropertyAccessExpression(factory.createCallExpression(factory.createUniqueName("_superIndex", 16 /* GeneratedIdentifierFlags.Optimistic */ | 32 /* GeneratedIdentifierFlags.FileLevel */), 
            /*typeArguments*/ undefined, [argumentExpression]), "value"), location);
        }
        else {
            return (0, ts_1.setTextRange)(factory.createCallExpression(factory.createUniqueName("_superIndex", 16 /* GeneratedIdentifierFlags.Optimistic */ | 32 /* GeneratedIdentifierFlags.FileLevel */), 
            /*typeArguments*/ undefined, [argumentExpression]), location);
        }
    }
}
exports.transformES2017 = transformES2017;
/**
 * Creates a variable named `_super` with accessor properties for the given property names.
 *
 * @internal
 */
function createSuperAccessVariableStatement(factory, resolver, node, names) {
    // Create a variable declaration with a getter/setter (if binding) definition for each name:
    //   const _super = Object.create(null, { x: { get: () => super.x, set: (v) => super.x = v }, ... });
    var hasBinding = (resolver.getNodeCheckFlags(node) & 256 /* NodeCheckFlags.MethodWithSuperPropertyAssignmentInAsync */) !== 0;
    var accessors = [];
    names.forEach(function (_, key) {
        var name = (0, ts_1.unescapeLeadingUnderscores)(key);
        var getterAndSetter = [];
        getterAndSetter.push(factory.createPropertyAssignment("get", factory.createArrowFunction(
        /*modifiers*/ undefined, 
        /*typeParameters*/ undefined, 
        /* parameters */ [], 
        /*type*/ undefined, 
        /*equalsGreaterThanToken*/ undefined, (0, ts_1.setEmitFlags)(factory.createPropertyAccessExpression((0, ts_1.setEmitFlags)(factory.createSuper(), 8 /* EmitFlags.NoSubstitution */), name), 8 /* EmitFlags.NoSubstitution */))));
        if (hasBinding) {
            getterAndSetter.push(factory.createPropertyAssignment("set", factory.createArrowFunction(
            /*modifiers*/ undefined, 
            /*typeParameters*/ undefined, 
            /* parameters */ [
                factory.createParameterDeclaration(
                /*modifiers*/ undefined, 
                /*dotDotDotToken*/ undefined, "v", 
                /*questionToken*/ undefined, 
                /*type*/ undefined, 
                /*initializer*/ undefined)
            ], 
            /*type*/ undefined, 
            /*equalsGreaterThanToken*/ undefined, factory.createAssignment((0, ts_1.setEmitFlags)(factory.createPropertyAccessExpression((0, ts_1.setEmitFlags)(factory.createSuper(), 8 /* EmitFlags.NoSubstitution */), name), 8 /* EmitFlags.NoSubstitution */), factory.createIdentifier("v")))));
        }
        accessors.push(factory.createPropertyAssignment(name, factory.createObjectLiteralExpression(getterAndSetter)));
    });
    return factory.createVariableStatement(
    /*modifiers*/ undefined, factory.createVariableDeclarationList([
        factory.createVariableDeclaration(factory.createUniqueName("_super", 16 /* GeneratedIdentifierFlags.Optimistic */ | 32 /* GeneratedIdentifierFlags.FileLevel */), 
        /*exclamationToken*/ undefined, 
        /*type*/ undefined, factory.createCallExpression(factory.createPropertyAccessExpression(factory.createIdentifier("Object"), "create"), 
        /*typeArguments*/ undefined, [
            factory.createNull(),
            factory.createObjectLiteralExpression(accessors, /*multiLine*/ true)
        ]))
    ], 2 /* NodeFlags.Const */));
}
exports.createSuperAccessVariableStatement = createSuperAccessVariableStatement;
