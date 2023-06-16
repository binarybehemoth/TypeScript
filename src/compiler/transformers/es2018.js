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
exports.transformES2018 = void 0;
var ts_1 = require("../_namespaces/ts");
/** @internal */
function transformES2018(context) {
    var factory = context.factory, emitHelpers = context.getEmitHelperFactory, resumeLexicalEnvironment = context.resumeLexicalEnvironment, endLexicalEnvironment = context.endLexicalEnvironment, hoistVariableDeclaration = context.hoistVariableDeclaration;
    var resolver = context.getEmitResolver();
    var compilerOptions = context.getCompilerOptions();
    var languageVersion = (0, ts_1.getEmitScriptTarget)(compilerOptions);
    var previousOnEmitNode = context.onEmitNode;
    context.onEmitNode = onEmitNode;
    var previousOnSubstituteNode = context.onSubstituteNode;
    context.onSubstituteNode = onSubstituteNode;
    var exportedVariableStatement = false;
    var enabledSubstitutions;
    var enclosingFunctionFlags;
    var parametersWithPrecedingObjectRestOrSpread;
    var enclosingSuperContainerFlags = 0;
    var hierarchyFacts = 0;
    var currentSourceFile;
    var taggedTemplateStringDeclarations;
    /** Keeps track of property names accessed on super (`super.x`) within async functions. */
    var capturedSuperProperties;
    /** Whether the async function contains an element access on super (`super[x]`). */
    var hasSuperElementAccess;
    /** A set of node IDs for generated super accessors. */
    var substitutedSuperAccessors = [];
    return (0, ts_1.chainBundle)(context, transformSourceFile);
    function affectsSubtree(excludeFacts, includeFacts) {
        return hierarchyFacts !== (hierarchyFacts & ~excludeFacts | includeFacts);
    }
    /**
     * Sets the `HierarchyFacts` for this node prior to visiting this node's subtree, returning the facts set prior to modification.
     * @param excludeFacts The existing `HierarchyFacts` to reset before visiting the subtree.
     * @param includeFacts The new `HierarchyFacts` to set before visiting the subtree.
     */
    function enterSubtree(excludeFacts, includeFacts) {
        var ancestorFacts = hierarchyFacts;
        hierarchyFacts = (hierarchyFacts & ~excludeFacts | includeFacts) & 3 /* HierarchyFacts.AncestorFactsMask */;
        return ancestorFacts;
    }
    /**
     * Restores the `HierarchyFacts` for this node's ancestor after visiting this node's
     * subtree.
     * @param ancestorFacts The `HierarchyFacts` of the ancestor to restore after visiting the subtree.
     */
    function exitSubtree(ancestorFacts) {
        hierarchyFacts = ancestorFacts;
    }
    function recordTaggedTemplateString(temp) {
        taggedTemplateStringDeclarations = (0, ts_1.append)(taggedTemplateStringDeclarations, factory.createVariableDeclaration(temp));
    }
    function transformSourceFile(node) {
        if (node.isDeclarationFile) {
            return node;
        }
        currentSourceFile = node;
        var visited = visitSourceFile(node);
        (0, ts_1.addEmitHelpers)(visited, context.readEmitHelpers());
        currentSourceFile = undefined;
        taggedTemplateStringDeclarations = undefined;
        return visited;
    }
    function visitor(node) {
        return visitorWorker(node, /*expressionResultIsUnused*/ false);
    }
    function visitorWithUnusedExpressionResult(node) {
        return visitorWorker(node, /*expressionResultIsUnused*/ true);
    }
    function visitorNoAsyncModifier(node) {
        if (node.kind === 134 /* SyntaxKind.AsyncKeyword */) {
            return undefined;
        }
        return node;
    }
    function doWithHierarchyFacts(cb, value, excludeFacts, includeFacts) {
        if (affectsSubtree(excludeFacts, includeFacts)) {
            var ancestorFacts = enterSubtree(excludeFacts, includeFacts);
            var result = cb(value);
            exitSubtree(ancestorFacts);
            return result;
        }
        return cb(value);
    }
    function visitDefault(node) {
        return (0, ts_1.visitEachChild)(node, visitor, context);
    }
    /**
     * @param expressionResultIsUnused Indicates the result of an expression is unused by the parent node (i.e., the left side of a comma or the
     * expression of an `ExpressionStatement`).
     */
    function visitorWorker(node, expressionResultIsUnused) {
        if ((node.transformFlags & 128 /* TransformFlags.ContainsES2018 */) === 0) {
            return node;
        }
        switch (node.kind) {
            case 222 /* SyntaxKind.AwaitExpression */:
                return visitAwaitExpression(node);
            case 228 /* SyntaxKind.YieldExpression */:
                return visitYieldExpression(node);
            case 252 /* SyntaxKind.ReturnStatement */:
                return visitReturnStatement(node);
            case 255 /* SyntaxKind.LabeledStatement */:
                return visitLabeledStatement(node);
            case 209 /* SyntaxKind.ObjectLiteralExpression */:
                return visitObjectLiteralExpression(node);
            case 225 /* SyntaxKind.BinaryExpression */:
                return visitBinaryExpression(node, expressionResultIsUnused);
            case 360 /* SyntaxKind.CommaListExpression */:
                return visitCommaListExpression(node, expressionResultIsUnused);
            case 298 /* SyntaxKind.CatchClause */:
                return visitCatchClause(node);
            case 242 /* SyntaxKind.VariableStatement */:
                return visitVariableStatement(node);
            case 259 /* SyntaxKind.VariableDeclaration */:
                return visitVariableDeclaration(node);
            case 245 /* SyntaxKind.DoStatement */:
            case 246 /* SyntaxKind.WhileStatement */:
            case 248 /* SyntaxKind.ForInStatement */:
                return doWithHierarchyFacts(visitDefault, node, 0 /* HierarchyFacts.IterationStatementExcludes */, 2 /* HierarchyFacts.IterationStatementIncludes */);
            case 249 /* SyntaxKind.ForOfStatement */:
                return visitForOfStatement(node, /*outermostLabeledStatement*/ undefined);
            case 247 /* SyntaxKind.ForStatement */:
                return doWithHierarchyFacts(visitForStatement, node, 0 /* HierarchyFacts.IterationStatementExcludes */, 2 /* HierarchyFacts.IterationStatementIncludes */);
            case 221 /* SyntaxKind.VoidExpression */:
                return visitVoidExpression(node);
            case 175 /* SyntaxKind.Constructor */:
                return doWithHierarchyFacts(visitConstructorDeclaration, node, 2 /* HierarchyFacts.ClassOrFunctionExcludes */, 1 /* HierarchyFacts.ClassOrFunctionIncludes */);
            case 173 /* SyntaxKind.MethodDeclaration */:
                return doWithHierarchyFacts(visitMethodDeclaration, node, 2 /* HierarchyFacts.ClassOrFunctionExcludes */, 1 /* HierarchyFacts.ClassOrFunctionIncludes */);
            case 176 /* SyntaxKind.GetAccessor */:
                return doWithHierarchyFacts(visitGetAccessorDeclaration, node, 2 /* HierarchyFacts.ClassOrFunctionExcludes */, 1 /* HierarchyFacts.ClassOrFunctionIncludes */);
            case 177 /* SyntaxKind.SetAccessor */:
                return doWithHierarchyFacts(visitSetAccessorDeclaration, node, 2 /* HierarchyFacts.ClassOrFunctionExcludes */, 1 /* HierarchyFacts.ClassOrFunctionIncludes */);
            case 261 /* SyntaxKind.FunctionDeclaration */:
                return doWithHierarchyFacts(visitFunctionDeclaration, node, 2 /* HierarchyFacts.ClassOrFunctionExcludes */, 1 /* HierarchyFacts.ClassOrFunctionIncludes */);
            case 217 /* SyntaxKind.FunctionExpression */:
                return doWithHierarchyFacts(visitFunctionExpression, node, 2 /* HierarchyFacts.ClassOrFunctionExcludes */, 1 /* HierarchyFacts.ClassOrFunctionIncludes */);
            case 218 /* SyntaxKind.ArrowFunction */:
                return doWithHierarchyFacts(visitArrowFunction, node, 2 /* HierarchyFacts.ArrowFunctionExcludes */, 0 /* HierarchyFacts.ArrowFunctionIncludes */);
            case 168 /* SyntaxKind.Parameter */:
                return visitParameter(node);
            case 243 /* SyntaxKind.ExpressionStatement */:
                return visitExpressionStatement(node);
            case 216 /* SyntaxKind.ParenthesizedExpression */:
                return visitParenthesizedExpression(node, expressionResultIsUnused);
            case 214 /* SyntaxKind.TaggedTemplateExpression */:
                return visitTaggedTemplateExpression(node);
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
            case 262 /* SyntaxKind.ClassDeclaration */:
            case 230 /* SyntaxKind.ClassExpression */:
                return doWithHierarchyFacts(visitDefault, node, 2 /* HierarchyFacts.ClassOrFunctionExcludes */, 1 /* HierarchyFacts.ClassOrFunctionIncludes */);
            default:
                return (0, ts_1.visitEachChild)(node, visitor, context);
        }
    }
    function visitAwaitExpression(node) {
        if (enclosingFunctionFlags & 2 /* FunctionFlags.Async */ && enclosingFunctionFlags & 1 /* FunctionFlags.Generator */) {
            return (0, ts_1.setOriginalNode)((0, ts_1.setTextRange)(factory.createYieldExpression(/*asteriskToken*/ undefined, emitHelpers().createAwaitHelper((0, ts_1.visitNode)(node.expression, visitor, ts_1.isExpression))), 
            /*location*/ node), node);
        }
        return (0, ts_1.visitEachChild)(node, visitor, context);
    }
    function visitYieldExpression(node) {
        if (enclosingFunctionFlags & 2 /* FunctionFlags.Async */ && enclosingFunctionFlags & 1 /* FunctionFlags.Generator */) {
            if (node.asteriskToken) {
                var expression = (0, ts_1.visitNode)(ts_1.Debug.checkDefined(node.expression), visitor, ts_1.isExpression);
                return (0, ts_1.setOriginalNode)((0, ts_1.setTextRange)(factory.createYieldExpression(
                /*asteriskToken*/ undefined, emitHelpers().createAwaitHelper(factory.updateYieldExpression(node, node.asteriskToken, (0, ts_1.setTextRange)(emitHelpers().createAsyncDelegatorHelper((0, ts_1.setTextRange)(emitHelpers().createAsyncValuesHelper(expression), expression)), expression)))), node), node);
            }
            return (0, ts_1.setOriginalNode)((0, ts_1.setTextRange)(factory.createYieldExpression(
            /*asteriskToken*/ undefined, createDownlevelAwait(node.expression
                ? (0, ts_1.visitNode)(node.expression, visitor, ts_1.isExpression)
                : factory.createVoidZero())), node), node);
        }
        return (0, ts_1.visitEachChild)(node, visitor, context);
    }
    function visitReturnStatement(node) {
        if (enclosingFunctionFlags & 2 /* FunctionFlags.Async */ && enclosingFunctionFlags & 1 /* FunctionFlags.Generator */) {
            return factory.updateReturnStatement(node, createDownlevelAwait(node.expression ? (0, ts_1.visitNode)(node.expression, visitor, ts_1.isExpression) : factory.createVoidZero()));
        }
        return (0, ts_1.visitEachChild)(node, visitor, context);
    }
    function visitLabeledStatement(node) {
        if (enclosingFunctionFlags & 2 /* FunctionFlags.Async */) {
            var statement = (0, ts_1.unwrapInnermostStatementOfLabel)(node);
            if (statement.kind === 249 /* SyntaxKind.ForOfStatement */ && statement.awaitModifier) {
                return visitForOfStatement(statement, node);
            }
            return factory.restoreEnclosingLabel((0, ts_1.visitNode)(statement, visitor, ts_1.isStatement, factory.liftToBlock), node);
        }
        return (0, ts_1.visitEachChild)(node, visitor, context);
    }
    function chunkObjectLiteralElements(elements) {
        var chunkObject;
        var objects = [];
        for (var _i = 0, elements_1 = elements; _i < elements_1.length; _i++) {
            var e = elements_1[_i];
            if (e.kind === 304 /* SyntaxKind.SpreadAssignment */) {
                if (chunkObject) {
                    objects.push(factory.createObjectLiteralExpression(chunkObject));
                    chunkObject = undefined;
                }
                var target = e.expression;
                objects.push((0, ts_1.visitNode)(target, visitor, ts_1.isExpression));
            }
            else {
                chunkObject = (0, ts_1.append)(chunkObject, e.kind === 302 /* SyntaxKind.PropertyAssignment */
                    ? factory.createPropertyAssignment(e.name, (0, ts_1.visitNode)(e.initializer, visitor, ts_1.isExpression))
                    : (0, ts_1.visitNode)(e, visitor, ts_1.isObjectLiteralElementLike));
            }
        }
        if (chunkObject) {
            objects.push(factory.createObjectLiteralExpression(chunkObject));
        }
        return objects;
    }
    function visitObjectLiteralExpression(node) {
        if (node.transformFlags & 65536 /* TransformFlags.ContainsObjectRestOrSpread */) {
            // spread elements emit like so:
            // non-spread elements are chunked together into object literals, and then all are passed to __assign:
            //     { a, ...o, b } => __assign(__assign({a}, o), {b});
            // If the first element is a spread element, then the first argument to __assign is {}:
            //     { ...o, a, b, ...o2 } => __assign(__assign(__assign({}, o), {a, b}), o2)
            //
            // We cannot call __assign with more than two elements, since any element could cause side effects. For
            // example:
            //      var k = { a: 1, b: 2 };
            //      var o = { a: 3, ...k, b: k.a++ };
            //      // expected: { a: 1, b: 1 }
            // If we translate the above to `__assign({ a: 3 }, k, { b: k.a++ })`, the `k.a++` will evaluate before
            // `k` is spread and we end up with `{ a: 2, b: 1 }`.
            //
            // This also occurs for spread elements, not just property assignments:
            //      var k = { a: 1, get b() { l = { z: 9 }; return 2; } };
            //      var l = { c: 3 };
            //      var o = { ...k, ...l };
            //      // expected: { a: 1, b: 2, z: 9 }
            // If we translate the above to `__assign({}, k, l)`, the `l` will evaluate before `k` is spread and we
            // end up with `{ a: 1, b: 2, c: 3 }`
            var objects = chunkObjectLiteralElements(node.properties);
            if (objects.length && objects[0].kind !== 209 /* SyntaxKind.ObjectLiteralExpression */) {
                objects.unshift(factory.createObjectLiteralExpression());
            }
            var expression = objects[0];
            if (objects.length > 1) {
                for (var i = 1; i < objects.length; i++) {
                    expression = emitHelpers().createAssignHelper([expression, objects[i]]);
                }
                return expression;
            }
            else {
                return emitHelpers().createAssignHelper(objects);
            }
        }
        return (0, ts_1.visitEachChild)(node, visitor, context);
    }
    function visitExpressionStatement(node) {
        return (0, ts_1.visitEachChild)(node, visitorWithUnusedExpressionResult, context);
    }
    /**
     * @param expressionResultIsUnused Indicates the result of an expression is unused by the parent node (i.e., the left side of a comma or the
     * expression of an `ExpressionStatement`).
     */
    function visitParenthesizedExpression(node, expressionResultIsUnused) {
        return (0, ts_1.visitEachChild)(node, expressionResultIsUnused ? visitorWithUnusedExpressionResult : visitor, context);
    }
    function visitSourceFile(node) {
        var ancestorFacts = enterSubtree(2 /* HierarchyFacts.SourceFileExcludes */, (0, ts_1.isEffectiveStrictModeSourceFile)(node, compilerOptions) ?
            0 /* HierarchyFacts.StrictModeSourceFileIncludes */ :
            1 /* HierarchyFacts.SourceFileIncludes */);
        exportedVariableStatement = false;
        var visited = (0, ts_1.visitEachChild)(node, visitor, context);
        var statement = (0, ts_1.concatenate)(visited.statements, taggedTemplateStringDeclarations && [
            factory.createVariableStatement(/*modifiers*/ undefined, factory.createVariableDeclarationList(taggedTemplateStringDeclarations))
        ]);
        var result = factory.updateSourceFile(visited, (0, ts_1.setTextRange)(factory.createNodeArray(statement), node.statements));
        exitSubtree(ancestorFacts);
        return result;
    }
    function visitTaggedTemplateExpression(node) {
        return (0, ts_1.processTaggedTemplateExpression)(context, node, visitor, currentSourceFile, recordTaggedTemplateString, ts_1.ProcessLevel.LiftRestriction);
    }
    /**
     * Visits a BinaryExpression that contains a destructuring assignment.
     *
     * @param node A BinaryExpression node.
     * @param expressionResultIsUnused Indicates the result of an expression is unused by the parent node (i.e., the left side of a comma or the
     * expression of an `ExpressionStatement`).
     */
    function visitBinaryExpression(node, expressionResultIsUnused) {
        if ((0, ts_1.isDestructuringAssignment)(node) && (0, ts_1.containsObjectRestOrSpread)(node.left)) {
            return (0, ts_1.flattenDestructuringAssignment)(node, visitor, context, 1 /* FlattenLevel.ObjectRest */, !expressionResultIsUnused);
        }
        if (node.operatorToken.kind === 28 /* SyntaxKind.CommaToken */) {
            return factory.updateBinaryExpression(node, (0, ts_1.visitNode)(node.left, visitorWithUnusedExpressionResult, ts_1.isExpression), node.operatorToken, (0, ts_1.visitNode)(node.right, expressionResultIsUnused ? visitorWithUnusedExpressionResult : visitor, ts_1.isExpression));
        }
        return (0, ts_1.visitEachChild)(node, visitor, context);
    }
    /**
     * @param expressionResultIsUnused Indicates the result of an expression is unused by the parent node (i.e., the left side of a comma or the
     * expression of an `ExpressionStatement`).
     */
    function visitCommaListExpression(node, expressionResultIsUnused) {
        if (expressionResultIsUnused) {
            return (0, ts_1.visitEachChild)(node, visitorWithUnusedExpressionResult, context);
        }
        var result;
        for (var i = 0; i < node.elements.length; i++) {
            var element = node.elements[i];
            var visited = (0, ts_1.visitNode)(element, i < node.elements.length - 1 ? visitorWithUnusedExpressionResult : visitor, ts_1.isExpression);
            if (result || visited !== element) {
                result || (result = node.elements.slice(0, i));
                result.push(visited);
            }
        }
        var elements = result ? (0, ts_1.setTextRange)(factory.createNodeArray(result), node.elements) : node.elements;
        return factory.updateCommaListExpression(node, elements);
    }
    function visitCatchClause(node) {
        if (node.variableDeclaration &&
            (0, ts_1.isBindingPattern)(node.variableDeclaration.name) &&
            node.variableDeclaration.name.transformFlags & 65536 /* TransformFlags.ContainsObjectRestOrSpread */) {
            var name_1 = factory.getGeneratedNameForNode(node.variableDeclaration.name);
            var updatedDecl = factory.updateVariableDeclaration(node.variableDeclaration, node.variableDeclaration.name, /*exclamationToken*/ undefined, /*type*/ undefined, name_1);
            var visitedBindings = (0, ts_1.flattenDestructuringBinding)(updatedDecl, visitor, context, 1 /* FlattenLevel.ObjectRest */);
            var block = (0, ts_1.visitNode)(node.block, visitor, ts_1.isBlock);
            if ((0, ts_1.some)(visitedBindings)) {
                block = factory.updateBlock(block, __spreadArray([
                    factory.createVariableStatement(/*modifiers*/ undefined, visitedBindings)
                ], block.statements, true));
            }
            return factory.updateCatchClause(node, factory.updateVariableDeclaration(node.variableDeclaration, name_1, /*exclamationToken*/ undefined, /*type*/ undefined, /*initializer*/ undefined), block);
        }
        return (0, ts_1.visitEachChild)(node, visitor, context);
    }
    function visitVariableStatement(node) {
        if ((0, ts_1.hasSyntacticModifier)(node, 1 /* ModifierFlags.Export */)) {
            var savedExportedVariableStatement = exportedVariableStatement;
            exportedVariableStatement = true;
            var visited = (0, ts_1.visitEachChild)(node, visitor, context);
            exportedVariableStatement = savedExportedVariableStatement;
            return visited;
        }
        return (0, ts_1.visitEachChild)(node, visitor, context);
    }
    /**
     * Visits a VariableDeclaration node with a binding pattern.
     *
     * @param node A VariableDeclaration node.
     */
    function visitVariableDeclaration(node) {
        if (exportedVariableStatement) {
            var savedExportedVariableStatement = exportedVariableStatement;
            exportedVariableStatement = false;
            var visited = visitVariableDeclarationWorker(node, /*exportedVariableStatement*/ true);
            exportedVariableStatement = savedExportedVariableStatement;
            return visited;
        }
        return visitVariableDeclarationWorker(node, /*exportedVariableStatement*/ false);
    }
    function visitVariableDeclarationWorker(node, exportedVariableStatement) {
        // If we are here it is because the name contains a binding pattern with a rest somewhere in it.
        if ((0, ts_1.isBindingPattern)(node.name) && node.name.transformFlags & 65536 /* TransformFlags.ContainsObjectRestOrSpread */) {
            return (0, ts_1.flattenDestructuringBinding)(node, visitor, context, 1 /* FlattenLevel.ObjectRest */, 
            /*rval*/ undefined, exportedVariableStatement);
        }
        return (0, ts_1.visitEachChild)(node, visitor, context);
    }
    function visitForStatement(node) {
        return factory.updateForStatement(node, (0, ts_1.visitNode)(node.initializer, visitorWithUnusedExpressionResult, ts_1.isForInitializer), (0, ts_1.visitNode)(node.condition, visitor, ts_1.isExpression), (0, ts_1.visitNode)(node.incrementor, visitorWithUnusedExpressionResult, ts_1.isExpression), (0, ts_1.visitIterationBody)(node.statement, visitor, context));
    }
    function visitVoidExpression(node) {
        return (0, ts_1.visitEachChild)(node, visitorWithUnusedExpressionResult, context);
    }
    /**
     * Visits a ForOfStatement and converts it into a ES2015-compatible ForOfStatement.
     *
     * @param node A ForOfStatement.
     */
    function visitForOfStatement(node, outermostLabeledStatement) {
        var ancestorFacts = enterSubtree(0 /* HierarchyFacts.IterationStatementExcludes */, 2 /* HierarchyFacts.IterationStatementIncludes */);
        if (node.initializer.transformFlags & 65536 /* TransformFlags.ContainsObjectRestOrSpread */ ||
            (0, ts_1.isAssignmentPattern)(node.initializer) && (0, ts_1.containsObjectRestOrSpread)(node.initializer)) {
            node = transformForOfStatementWithObjectRest(node);
        }
        var result = node.awaitModifier ?
            transformForAwaitOfStatement(node, outermostLabeledStatement, ancestorFacts) :
            factory.restoreEnclosingLabel((0, ts_1.visitEachChild)(node, visitor, context), outermostLabeledStatement);
        exitSubtree(ancestorFacts);
        return result;
    }
    function transformForOfStatementWithObjectRest(node) {
        var initializerWithoutParens = (0, ts_1.skipParentheses)(node.initializer);
        if ((0, ts_1.isVariableDeclarationList)(initializerWithoutParens) || (0, ts_1.isAssignmentPattern)(initializerWithoutParens)) {
            var bodyLocation = void 0;
            var statementsLocation = void 0;
            var temp = factory.createTempVariable(/*recordTempVariable*/ undefined);
            var statements = [(0, ts_1.createForOfBindingStatement)(factory, initializerWithoutParens, temp)];
            if ((0, ts_1.isBlock)(node.statement)) {
                (0, ts_1.addRange)(statements, node.statement.statements);
                bodyLocation = node.statement;
                statementsLocation = node.statement.statements;
            }
            else if (node.statement) {
                (0, ts_1.append)(statements, node.statement);
                bodyLocation = node.statement;
                statementsLocation = node.statement;
            }
            return factory.updateForOfStatement(node, node.awaitModifier, (0, ts_1.setTextRange)(factory.createVariableDeclarationList([
                (0, ts_1.setTextRange)(factory.createVariableDeclaration(temp), node.initializer)
            ], 1 /* NodeFlags.Let */), node.initializer), node.expression, (0, ts_1.setTextRange)(factory.createBlock((0, ts_1.setTextRange)(factory.createNodeArray(statements), statementsLocation), 
            /*multiLine*/ true), bodyLocation));
        }
        return node;
    }
    function convertForOfStatementHead(node, boundValue, nonUserCode) {
        var value = factory.createTempVariable(hoistVariableDeclaration);
        var iteratorValueExpression = factory.createAssignment(value, boundValue);
        var iteratorValueStatement = factory.createExpressionStatement(iteratorValueExpression);
        (0, ts_1.setSourceMapRange)(iteratorValueStatement, node.expression);
        var exitNonUserCodeExpression = factory.createAssignment(nonUserCode, factory.createFalse());
        var exitNonUserCodeStatement = factory.createExpressionStatement(exitNonUserCodeExpression);
        (0, ts_1.setSourceMapRange)(exitNonUserCodeStatement, node.expression);
        var statements = [iteratorValueStatement, exitNonUserCodeStatement];
        var binding = (0, ts_1.createForOfBindingStatement)(factory, node.initializer, value);
        statements.push((0, ts_1.visitNode)(binding, visitor, ts_1.isStatement));
        var bodyLocation;
        var statementsLocation;
        var statement = (0, ts_1.visitIterationBody)(node.statement, visitor, context);
        if ((0, ts_1.isBlock)(statement)) {
            (0, ts_1.addRange)(statements, statement.statements);
            bodyLocation = statement;
            statementsLocation = statement.statements;
        }
        else {
            statements.push(statement);
        }
        return (0, ts_1.setTextRange)(factory.createBlock((0, ts_1.setTextRange)(factory.createNodeArray(statements), statementsLocation), 
        /*multiLine*/ true), bodyLocation);
    }
    function createDownlevelAwait(expression) {
        return enclosingFunctionFlags & 1 /* FunctionFlags.Generator */
            ? factory.createYieldExpression(/*asteriskToken*/ undefined, emitHelpers().createAwaitHelper(expression))
            : factory.createAwaitExpression(expression);
    }
    function transformForAwaitOfStatement(node, outermostLabeledStatement, ancestorFacts) {
        var expression = (0, ts_1.visitNode)(node.expression, visitor, ts_1.isExpression);
        var iterator = (0, ts_1.isIdentifier)(expression) ? factory.getGeneratedNameForNode(expression) : factory.createTempVariable(/*recordTempVariable*/ undefined);
        var result = (0, ts_1.isIdentifier)(expression) ? factory.getGeneratedNameForNode(iterator) : factory.createTempVariable(/*recordTempVariable*/ undefined);
        var nonUserCode = factory.createTempVariable(/*recordTempVariable*/ undefined);
        var done = factory.createTempVariable(hoistVariableDeclaration);
        var errorRecord = factory.createUniqueName("e");
        var catchVariable = factory.getGeneratedNameForNode(errorRecord);
        var returnMethod = factory.createTempVariable(/*recordTempVariable*/ undefined);
        var callValues = (0, ts_1.setTextRange)(emitHelpers().createAsyncValuesHelper(expression), node.expression);
        var callNext = factory.createCallExpression(factory.createPropertyAccessExpression(iterator, "next"), /*typeArguments*/ undefined, []);
        var getDone = factory.createPropertyAccessExpression(result, "done");
        var getValue = factory.createPropertyAccessExpression(result, "value");
        var callReturn = factory.createFunctionCallCall(returnMethod, iterator, []);
        hoistVariableDeclaration(errorRecord);
        hoistVariableDeclaration(returnMethod);
        // if we are enclosed in an outer loop ensure we reset 'errorRecord' per each iteration
        var initializer = ancestorFacts & 2 /* HierarchyFacts.IterationContainer */ ?
            factory.inlineExpressions([factory.createAssignment(errorRecord, factory.createVoidZero()), callValues]) :
            callValues;
        var forStatement = (0, ts_1.setEmitFlags)((0, ts_1.setTextRange)(factory.createForStatement(
        /*initializer*/ (0, ts_1.setEmitFlags)((0, ts_1.setTextRange)(factory.createVariableDeclarationList([
            factory.createVariableDeclaration(nonUserCode, /*exclamationToken*/ undefined, /*type*/ undefined, factory.createTrue()),
            (0, ts_1.setTextRange)(factory.createVariableDeclaration(iterator, /*exclamationToken*/ undefined, /*type*/ undefined, initializer), node.expression),
            factory.createVariableDeclaration(result)
        ]), node.expression), 4194304 /* EmitFlags.NoHoisting */), 
        /*condition*/ factory.inlineExpressions([
            factory.createAssignment(result, createDownlevelAwait(callNext)),
            factory.createAssignment(done, getDone),
            factory.createLogicalNot(done)
        ]), 
        /*incrementor*/ factory.createAssignment(nonUserCode, factory.createTrue()), 
        /*statement*/ convertForOfStatementHead(node, getValue, nonUserCode)), 
        /*location*/ node), 512 /* EmitFlags.NoTokenTrailingSourceMaps */);
        (0, ts_1.setOriginalNode)(forStatement, node);
        return factory.createTryStatement(factory.createBlock([
            factory.restoreEnclosingLabel(forStatement, outermostLabeledStatement)
        ]), factory.createCatchClause(factory.createVariableDeclaration(catchVariable), (0, ts_1.setEmitFlags)(factory.createBlock([
            factory.createExpressionStatement(factory.createAssignment(errorRecord, factory.createObjectLiteralExpression([
                factory.createPropertyAssignment("error", catchVariable)
            ])))
        ]), 1 /* EmitFlags.SingleLine */)), factory.createBlock([
            factory.createTryStatement(
            /*tryBlock*/ factory.createBlock([
                (0, ts_1.setEmitFlags)(factory.createIfStatement(factory.createLogicalAnd(factory.createLogicalAnd(factory.createLogicalNot(nonUserCode), factory.createLogicalNot(done)), factory.createAssignment(returnMethod, factory.createPropertyAccessExpression(iterator, "return"))), factory.createExpressionStatement(createDownlevelAwait(callReturn))), 1 /* EmitFlags.SingleLine */)
            ]), 
            /*catchClause*/ undefined, 
            /*finallyBlock*/ (0, ts_1.setEmitFlags)(factory.createBlock([
                (0, ts_1.setEmitFlags)(factory.createIfStatement(errorRecord, factory.createThrowStatement(factory.createPropertyAccessExpression(errorRecord, "error"))), 1 /* EmitFlags.SingleLine */)
            ]), 1 /* EmitFlags.SingleLine */))
        ]));
    }
    function parameterVisitor(node) {
        ts_1.Debug.assertNode(node, ts_1.isParameter);
        return visitParameter(node);
    }
    function visitParameter(node) {
        if (parametersWithPrecedingObjectRestOrSpread === null || parametersWithPrecedingObjectRestOrSpread === void 0 ? void 0 : parametersWithPrecedingObjectRestOrSpread.has(node)) {
            return factory.updateParameterDeclaration(node, 
            /*modifiers*/ undefined, node.dotDotDotToken, (0, ts_1.isBindingPattern)(node.name) ? factory.getGeneratedNameForNode(node) : node.name, 
            /*questionToken*/ undefined, 
            /*type*/ undefined, 
            /*initializer*/ undefined);
        }
        if (node.transformFlags & 65536 /* TransformFlags.ContainsObjectRestOrSpread */) {
            // Binding patterns are converted into a generated name and are
            // evaluated inside the function body.
            return factory.updateParameterDeclaration(node, 
            /*modifiers*/ undefined, node.dotDotDotToken, factory.getGeneratedNameForNode(node), 
            /*questionToken*/ undefined, 
            /*type*/ undefined, (0, ts_1.visitNode)(node.initializer, visitor, ts_1.isExpression));
        }
        return (0, ts_1.visitEachChild)(node, visitor, context);
    }
    function collectParametersWithPrecedingObjectRestOrSpread(node) {
        var parameters;
        for (var _i = 0, _a = node.parameters; _i < _a.length; _i++) {
            var parameter = _a[_i];
            if (parameters) {
                parameters.add(parameter);
            }
            else if (parameter.transformFlags & 65536 /* TransformFlags.ContainsObjectRestOrSpread */) {
                parameters = new Set();
            }
        }
        return parameters;
    }
    function visitConstructorDeclaration(node) {
        var savedEnclosingFunctionFlags = enclosingFunctionFlags;
        var savedParametersWithPrecedingObjectRestOrSpread = parametersWithPrecedingObjectRestOrSpread;
        enclosingFunctionFlags = (0, ts_1.getFunctionFlags)(node);
        parametersWithPrecedingObjectRestOrSpread = collectParametersWithPrecedingObjectRestOrSpread(node);
        var updated = factory.updateConstructorDeclaration(node, node.modifiers, (0, ts_1.visitParameterList)(node.parameters, parameterVisitor, context), transformFunctionBody(node));
        enclosingFunctionFlags = savedEnclosingFunctionFlags;
        parametersWithPrecedingObjectRestOrSpread = savedParametersWithPrecedingObjectRestOrSpread;
        return updated;
    }
    function visitGetAccessorDeclaration(node) {
        var savedEnclosingFunctionFlags = enclosingFunctionFlags;
        var savedParametersWithPrecedingObjectRestOrSpread = parametersWithPrecedingObjectRestOrSpread;
        enclosingFunctionFlags = (0, ts_1.getFunctionFlags)(node);
        parametersWithPrecedingObjectRestOrSpread = collectParametersWithPrecedingObjectRestOrSpread(node);
        var updated = factory.updateGetAccessorDeclaration(node, node.modifiers, (0, ts_1.visitNode)(node.name, visitor, ts_1.isPropertyName), (0, ts_1.visitParameterList)(node.parameters, parameterVisitor, context), 
        /*type*/ undefined, transformFunctionBody(node));
        enclosingFunctionFlags = savedEnclosingFunctionFlags;
        parametersWithPrecedingObjectRestOrSpread = savedParametersWithPrecedingObjectRestOrSpread;
        return updated;
    }
    function visitSetAccessorDeclaration(node) {
        var savedEnclosingFunctionFlags = enclosingFunctionFlags;
        var savedParametersWithPrecedingObjectRestOrSpread = parametersWithPrecedingObjectRestOrSpread;
        enclosingFunctionFlags = (0, ts_1.getFunctionFlags)(node);
        parametersWithPrecedingObjectRestOrSpread = collectParametersWithPrecedingObjectRestOrSpread(node);
        var updated = factory.updateSetAccessorDeclaration(node, node.modifiers, (0, ts_1.visitNode)(node.name, visitor, ts_1.isPropertyName), (0, ts_1.visitParameterList)(node.parameters, parameterVisitor, context), transformFunctionBody(node));
        enclosingFunctionFlags = savedEnclosingFunctionFlags;
        parametersWithPrecedingObjectRestOrSpread = savedParametersWithPrecedingObjectRestOrSpread;
        return updated;
    }
    function visitMethodDeclaration(node) {
        var savedEnclosingFunctionFlags = enclosingFunctionFlags;
        var savedParametersWithPrecedingObjectRestOrSpread = parametersWithPrecedingObjectRestOrSpread;
        enclosingFunctionFlags = (0, ts_1.getFunctionFlags)(node);
        parametersWithPrecedingObjectRestOrSpread = collectParametersWithPrecedingObjectRestOrSpread(node);
        var updated = factory.updateMethodDeclaration(node, enclosingFunctionFlags & 1 /* FunctionFlags.Generator */
            ? (0, ts_1.visitNodes)(node.modifiers, visitorNoAsyncModifier, ts_1.isModifierLike)
            : node.modifiers, enclosingFunctionFlags & 2 /* FunctionFlags.Async */
            ? undefined
            : node.asteriskToken, (0, ts_1.visitNode)(node.name, visitor, ts_1.isPropertyName), (0, ts_1.visitNode)(/*node*/ undefined, visitor, ts_1.isQuestionToken), 
        /*typeParameters*/ undefined, (0, ts_1.visitParameterList)(node.parameters, parameterVisitor, context), 
        /*type*/ undefined, enclosingFunctionFlags & 2 /* FunctionFlags.Async */ && enclosingFunctionFlags & 1 /* FunctionFlags.Generator */
            ? transformAsyncGeneratorFunctionBody(node)
            : transformFunctionBody(node));
        enclosingFunctionFlags = savedEnclosingFunctionFlags;
        parametersWithPrecedingObjectRestOrSpread = savedParametersWithPrecedingObjectRestOrSpread;
        return updated;
    }
    function visitFunctionDeclaration(node) {
        var savedEnclosingFunctionFlags = enclosingFunctionFlags;
        var savedParametersWithPrecedingObjectRestOrSpread = parametersWithPrecedingObjectRestOrSpread;
        enclosingFunctionFlags = (0, ts_1.getFunctionFlags)(node);
        parametersWithPrecedingObjectRestOrSpread = collectParametersWithPrecedingObjectRestOrSpread(node);
        var updated = factory.updateFunctionDeclaration(node, enclosingFunctionFlags & 1 /* FunctionFlags.Generator */
            ? (0, ts_1.visitNodes)(node.modifiers, visitorNoAsyncModifier, ts_1.isModifier)
            : node.modifiers, enclosingFunctionFlags & 2 /* FunctionFlags.Async */
            ? undefined
            : node.asteriskToken, node.name, 
        /*typeParameters*/ undefined, (0, ts_1.visitParameterList)(node.parameters, parameterVisitor, context), 
        /*type*/ undefined, enclosingFunctionFlags & 2 /* FunctionFlags.Async */ && enclosingFunctionFlags & 1 /* FunctionFlags.Generator */
            ? transformAsyncGeneratorFunctionBody(node)
            : transformFunctionBody(node));
        enclosingFunctionFlags = savedEnclosingFunctionFlags;
        parametersWithPrecedingObjectRestOrSpread = savedParametersWithPrecedingObjectRestOrSpread;
        return updated;
    }
    function visitArrowFunction(node) {
        var savedEnclosingFunctionFlags = enclosingFunctionFlags;
        var savedParametersWithPrecedingObjectRestOrSpread = parametersWithPrecedingObjectRestOrSpread;
        enclosingFunctionFlags = (0, ts_1.getFunctionFlags)(node);
        parametersWithPrecedingObjectRestOrSpread = collectParametersWithPrecedingObjectRestOrSpread(node);
        var updated = factory.updateArrowFunction(node, node.modifiers, 
        /*typeParameters*/ undefined, (0, ts_1.visitParameterList)(node.parameters, parameterVisitor, context), 
        /*type*/ undefined, node.equalsGreaterThanToken, transformFunctionBody(node));
        enclosingFunctionFlags = savedEnclosingFunctionFlags;
        parametersWithPrecedingObjectRestOrSpread = savedParametersWithPrecedingObjectRestOrSpread;
        return updated;
    }
    function visitFunctionExpression(node) {
        var savedEnclosingFunctionFlags = enclosingFunctionFlags;
        var savedParametersWithPrecedingObjectRestOrSpread = parametersWithPrecedingObjectRestOrSpread;
        enclosingFunctionFlags = (0, ts_1.getFunctionFlags)(node);
        parametersWithPrecedingObjectRestOrSpread = collectParametersWithPrecedingObjectRestOrSpread(node);
        var updated = factory.updateFunctionExpression(node, enclosingFunctionFlags & 1 /* FunctionFlags.Generator */
            ? (0, ts_1.visitNodes)(node.modifiers, visitorNoAsyncModifier, ts_1.isModifier)
            : node.modifiers, enclosingFunctionFlags & 2 /* FunctionFlags.Async */
            ? undefined
            : node.asteriskToken, node.name, 
        /*typeParameters*/ undefined, (0, ts_1.visitParameterList)(node.parameters, parameterVisitor, context), 
        /*type*/ undefined, enclosingFunctionFlags & 2 /* FunctionFlags.Async */ && enclosingFunctionFlags & 1 /* FunctionFlags.Generator */
            ? transformAsyncGeneratorFunctionBody(node)
            : transformFunctionBody(node));
        enclosingFunctionFlags = savedEnclosingFunctionFlags;
        parametersWithPrecedingObjectRestOrSpread = savedParametersWithPrecedingObjectRestOrSpread;
        return updated;
    }
    function transformAsyncGeneratorFunctionBody(node) {
        resumeLexicalEnvironment();
        var statements = [];
        var statementOffset = factory.copyPrologue(node.body.statements, statements, /*ensureUseStrict*/ false, visitor);
        appendObjectRestAssignmentsIfNeeded(statements, node);
        var savedCapturedSuperProperties = capturedSuperProperties;
        var savedHasSuperElementAccess = hasSuperElementAccess;
        capturedSuperProperties = new Set();
        hasSuperElementAccess = false;
        var returnStatement = factory.createReturnStatement(emitHelpers().createAsyncGeneratorHelper(factory.createFunctionExpression(
        /*modifiers*/ undefined, factory.createToken(42 /* SyntaxKind.AsteriskToken */), node.name && factory.getGeneratedNameForNode(node.name), 
        /*typeParameters*/ undefined, 
        /*parameters*/ [], 
        /*type*/ undefined, factory.updateBlock(node.body, (0, ts_1.visitLexicalEnvironment)(node.body.statements, visitor, context, statementOffset))), !!(hierarchyFacts & 1 /* HierarchyFacts.HasLexicalThis */)));
        // Minor optimization, emit `_super` helper to capture `super` access in an arrow.
        // This step isn't needed if we eventually transform this to ES5.
        var emitSuperHelpers = languageVersion >= 2 /* ScriptTarget.ES2015 */ && resolver.getNodeCheckFlags(node) & (256 /* NodeCheckFlags.MethodWithSuperPropertyAssignmentInAsync */ | 128 /* NodeCheckFlags.MethodWithSuperPropertyAccessInAsync */);
        if (emitSuperHelpers) {
            enableSubstitutionForAsyncMethodsWithSuper();
            var variableStatement = (0, ts_1.createSuperAccessVariableStatement)(factory, resolver, node, capturedSuperProperties);
            substitutedSuperAccessors[(0, ts_1.getNodeId)(variableStatement)] = true;
            (0, ts_1.insertStatementsAfterStandardPrologue)(statements, [variableStatement]);
        }
        statements.push(returnStatement);
        (0, ts_1.insertStatementsAfterStandardPrologue)(statements, endLexicalEnvironment());
        var block = factory.updateBlock(node.body, statements);
        if (emitSuperHelpers && hasSuperElementAccess) {
            if (resolver.getNodeCheckFlags(node) & 256 /* NodeCheckFlags.MethodWithSuperPropertyAssignmentInAsync */) {
                (0, ts_1.addEmitHelper)(block, ts_1.advancedAsyncSuperHelper);
            }
            else if (resolver.getNodeCheckFlags(node) & 128 /* NodeCheckFlags.MethodWithSuperPropertyAccessInAsync */) {
                (0, ts_1.addEmitHelper)(block, ts_1.asyncSuperHelper);
            }
        }
        capturedSuperProperties = savedCapturedSuperProperties;
        hasSuperElementAccess = savedHasSuperElementAccess;
        return block;
    }
    function transformFunctionBody(node) {
        var _a;
        resumeLexicalEnvironment();
        var statementOffset = 0;
        var statements = [];
        var body = (_a = (0, ts_1.visitNode)(node.body, visitor, ts_1.isConciseBody)) !== null && _a !== void 0 ? _a : factory.createBlock([]);
        if ((0, ts_1.isBlock)(body)) {
            statementOffset = factory.copyPrologue(body.statements, statements, /*ensureUseStrict*/ false, visitor);
        }
        (0, ts_1.addRange)(statements, appendObjectRestAssignmentsIfNeeded(/*statements*/ undefined, node));
        var leadingStatements = endLexicalEnvironment();
        if (statementOffset > 0 || (0, ts_1.some)(statements) || (0, ts_1.some)(leadingStatements)) {
            var block = factory.converters.convertToFunctionBlock(body, /*multiLine*/ true);
            (0, ts_1.insertStatementsAfterStandardPrologue)(statements, leadingStatements);
            (0, ts_1.addRange)(statements, block.statements.slice(statementOffset));
            return factory.updateBlock(block, (0, ts_1.setTextRange)(factory.createNodeArray(statements), block.statements));
        }
        return body;
    }
    function appendObjectRestAssignmentsIfNeeded(statements, node) {
        var containsPrecedingObjectRestOrSpread = false;
        for (var _i = 0, _a = node.parameters; _i < _a.length; _i++) {
            var parameter = _a[_i];
            if (containsPrecedingObjectRestOrSpread) {
                if ((0, ts_1.isBindingPattern)(parameter.name)) {
                    // In cases where a binding pattern is simply '[]' or '{}',
                    // we usually don't want to emit a var declaration; however, in the presence
                    // of an initializer, we must emit that expression to preserve side effects.
                    //
                    // NOTE: see `insertDefaultValueAssignmentForBindingPattern` in es2015.ts
                    if (parameter.name.elements.length > 0) {
                        var declarations = (0, ts_1.flattenDestructuringBinding)(parameter, visitor, context, 0 /* FlattenLevel.All */, factory.getGeneratedNameForNode(parameter));
                        if ((0, ts_1.some)(declarations)) {
                            var declarationList = factory.createVariableDeclarationList(declarations);
                            var statement = factory.createVariableStatement(/*modifiers*/ undefined, declarationList);
                            (0, ts_1.setEmitFlags)(statement, 2097152 /* EmitFlags.CustomPrologue */);
                            statements = (0, ts_1.append)(statements, statement);
                        }
                    }
                    else if (parameter.initializer) {
                        var name_2 = factory.getGeneratedNameForNode(parameter);
                        var initializer = (0, ts_1.visitNode)(parameter.initializer, visitor, ts_1.isExpression);
                        var assignment = factory.createAssignment(name_2, initializer);
                        var statement = factory.createExpressionStatement(assignment);
                        (0, ts_1.setEmitFlags)(statement, 2097152 /* EmitFlags.CustomPrologue */);
                        statements = (0, ts_1.append)(statements, statement);
                    }
                }
                else if (parameter.initializer) {
                    // Converts a parameter initializer into a function body statement, i.e.:
                    //
                    //  function f(x = 1) { }
                    //
                    // becomes
                    //
                    //  function f(x) {
                    //    if (typeof x === "undefined") { x = 1; }
                    //  }
                    var name_3 = factory.cloneNode(parameter.name);
                    (0, ts_1.setTextRange)(name_3, parameter.name);
                    (0, ts_1.setEmitFlags)(name_3, 96 /* EmitFlags.NoSourceMap */);
                    var initializer = (0, ts_1.visitNode)(parameter.initializer, visitor, ts_1.isExpression);
                    (0, ts_1.addEmitFlags)(initializer, 96 /* EmitFlags.NoSourceMap */ | 3072 /* EmitFlags.NoComments */);
                    var assignment = factory.createAssignment(name_3, initializer);
                    (0, ts_1.setTextRange)(assignment, parameter);
                    (0, ts_1.setEmitFlags)(assignment, 3072 /* EmitFlags.NoComments */);
                    var block = factory.createBlock([factory.createExpressionStatement(assignment)]);
                    (0, ts_1.setTextRange)(block, parameter);
                    (0, ts_1.setEmitFlags)(block, 1 /* EmitFlags.SingleLine */ | 64 /* EmitFlags.NoTrailingSourceMap */ | 768 /* EmitFlags.NoTokenSourceMaps */ | 3072 /* EmitFlags.NoComments */);
                    var typeCheck = factory.createTypeCheck(factory.cloneNode(parameter.name), "undefined");
                    var statement = factory.createIfStatement(typeCheck, block);
                    (0, ts_1.startOnNewLine)(statement);
                    (0, ts_1.setTextRange)(statement, parameter);
                    (0, ts_1.setEmitFlags)(statement, 768 /* EmitFlags.NoTokenSourceMaps */ | 64 /* EmitFlags.NoTrailingSourceMap */ | 2097152 /* EmitFlags.CustomPrologue */ | 3072 /* EmitFlags.NoComments */);
                    statements = (0, ts_1.append)(statements, statement);
                }
            }
            else if (parameter.transformFlags & 65536 /* TransformFlags.ContainsObjectRestOrSpread */) {
                containsPrecedingObjectRestOrSpread = true;
                var declarations = (0, ts_1.flattenDestructuringBinding)(parameter, visitor, context, 1 /* FlattenLevel.ObjectRest */, factory.getGeneratedNameForNode(parameter), 
                /*hoistTempVariables*/ false, 
                /*skipInitializer*/ true);
                if ((0, ts_1.some)(declarations)) {
                    var declarationList = factory.createVariableDeclarationList(declarations);
                    var statement = factory.createVariableStatement(/*modifiers*/ undefined, declarationList);
                    (0, ts_1.setEmitFlags)(statement, 2097152 /* EmitFlags.CustomPrologue */);
                    statements = (0, ts_1.append)(statements, statement);
                }
            }
        }
        return statements;
    }
    function enableSubstitutionForAsyncMethodsWithSuper() {
        if ((enabledSubstitutions & 1 /* ESNextSubstitutionFlags.AsyncMethodsWithSuper */) === 0) {
            enabledSubstitutions |= 1 /* ESNextSubstitutionFlags.AsyncMethodsWithSuper */;
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
     * Called by the printer just before a node is printed.
     *
     * @param hint A hint as to the intended usage of the node.
     * @param node The node to be printed.
     * @param emitCallback The callback used to emit the node.
     */
    function onEmitNode(hint, node, emitCallback) {
        // If we need to support substitutions for `super` in an async method,
        // we should track it here.
        if (enabledSubstitutions & 1 /* ESNextSubstitutionFlags.AsyncMethodsWithSuper */ && isSuperContainer(node)) {
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
     * @param hint The context for the emitter.
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
            return (0, ts_1.setTextRange)(factory.createPropertyAccessExpression(factory.createCallExpression(factory.createIdentifier("_superIndex"), 
            /*typeArguments*/ undefined, [argumentExpression]), "value"), location);
        }
        else {
            return (0, ts_1.setTextRange)(factory.createCallExpression(factory.createIdentifier("_superIndex"), 
            /*typeArguments*/ undefined, [argumentExpression]), location);
        }
    }
}
exports.transformES2018 = transformES2018;
