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
exports.transformES2015 = void 0;
var ts_1 = require("../_namespaces/ts");
function createSpreadSegment(kind, expression) {
    return { kind: kind, expression: expression };
}
/** @internal */
function transformES2015(context) {
    var factory = context.factory, emitHelpers = context.getEmitHelperFactory, startLexicalEnvironment = context.startLexicalEnvironment, resumeLexicalEnvironment = context.resumeLexicalEnvironment, endLexicalEnvironment = context.endLexicalEnvironment, hoistVariableDeclaration = context.hoistVariableDeclaration;
    var compilerOptions = context.getCompilerOptions();
    var resolver = context.getEmitResolver();
    var previousOnSubstituteNode = context.onSubstituteNode;
    var previousOnEmitNode = context.onEmitNode;
    context.onEmitNode = onEmitNode;
    context.onSubstituteNode = onSubstituteNode;
    var currentSourceFile;
    var currentText;
    var hierarchyFacts;
    var taggedTemplateStringDeclarations;
    function recordTaggedTemplateString(temp) {
        taggedTemplateStringDeclarations = (0, ts_1.append)(taggedTemplateStringDeclarations, factory.createVariableDeclaration(temp));
    }
    /**
     * Used to track if we are emitting body of the converted loop
     */
    var convertedLoopState;
    /**
     * Keeps track of whether substitutions have been enabled for specific cases.
     * They are persisted between each SourceFile transformation and should not
     * be reset.
     */
    var enabledSubstitutions;
    return (0, ts_1.chainBundle)(context, transformSourceFile);
    function transformSourceFile(node) {
        if (node.isDeclarationFile) {
            return node;
        }
        currentSourceFile = node;
        currentText = node.text;
        var visited = visitSourceFile(node);
        (0, ts_1.addEmitHelpers)(visited, context.readEmitHelpers());
        currentSourceFile = undefined;
        currentText = undefined;
        taggedTemplateStringDeclarations = undefined;
        hierarchyFacts = 0 /* HierarchyFacts.None */;
        return visited;
    }
    /**
     * Sets the `HierarchyFacts` for this node prior to visiting this node's subtree, returning the facts set prior to modification.
     * @param excludeFacts The existing `HierarchyFacts` to reset before visiting the subtree.
     * @param includeFacts The new `HierarchyFacts` to set before visiting the subtree.
     */
    function enterSubtree(excludeFacts, includeFacts) {
        var ancestorFacts = hierarchyFacts;
        hierarchyFacts = (hierarchyFacts & ~excludeFacts | includeFacts) & 32767 /* HierarchyFacts.AncestorFactsMask */;
        return ancestorFacts;
    }
    /**
     * Restores the `HierarchyFacts` for this node's ancestor after visiting this node's
     * subtree, propagating specific facts from the subtree.
     * @param ancestorFacts The `HierarchyFacts` of the ancestor to restore after visiting the subtree.
     * @param excludeFacts The existing `HierarchyFacts` of the subtree that should not be propagated.
     * @param includeFacts The new `HierarchyFacts` of the subtree that should be propagated.
     */
    function exitSubtree(ancestorFacts, excludeFacts, includeFacts) {
        hierarchyFacts = (hierarchyFacts & ~excludeFacts | includeFacts) & -32768 /* HierarchyFacts.SubtreeFactsMask */ | ancestorFacts;
    }
    function isReturnVoidStatementInConstructorWithCapturedSuper(node) {
        return (hierarchyFacts & 8192 /* HierarchyFacts.ConstructorWithCapturedSuper */) !== 0
            && node.kind === 252 /* SyntaxKind.ReturnStatement */
            && !node.expression;
    }
    function isOrMayContainReturnCompletion(node) {
        return node.transformFlags & 4194304 /* TransformFlags.ContainsHoistedDeclarationOrCompletion */
            && ((0, ts_1.isReturnStatement)(node)
                || (0, ts_1.isIfStatement)(node)
                || (0, ts_1.isWithStatement)(node)
                || (0, ts_1.isSwitchStatement)(node)
                || (0, ts_1.isCaseBlock)(node)
                || (0, ts_1.isCaseClause)(node)
                || (0, ts_1.isDefaultClause)(node)
                || (0, ts_1.isTryStatement)(node)
                || (0, ts_1.isCatchClause)(node)
                || (0, ts_1.isLabeledStatement)(node)
                || (0, ts_1.isIterationStatement)(node, /*lookInLabeledStatements*/ false)
                || (0, ts_1.isBlock)(node));
    }
    function shouldVisitNode(node) {
        return (node.transformFlags & 1024 /* TransformFlags.ContainsES2015 */) !== 0
            || convertedLoopState !== undefined
            || (hierarchyFacts & 8192 /* HierarchyFacts.ConstructorWithCapturedSuper */ && isOrMayContainReturnCompletion(node))
            || ((0, ts_1.isIterationStatement)(node, /*lookInLabeledStatements*/ false) && shouldConvertIterationStatement(node))
            || ((0, ts_1.getInternalEmitFlags)(node) & 1 /* InternalEmitFlags.TypeScriptClassWrapper */) !== 0;
    }
    function visitor(node) {
        return shouldVisitNode(node) ? visitorWorker(node, /*expressionResultIsUnused*/ false) : node;
    }
    function visitorWithUnusedExpressionResult(node) {
        return shouldVisitNode(node) ? visitorWorker(node, /*expressionResultIsUnused*/ true) : node;
    }
    function classWrapperStatementVisitor(node) {
        if (shouldVisitNode(node)) {
            var original = (0, ts_1.getOriginalNode)(node);
            if ((0, ts_1.isPropertyDeclaration)(original) && (0, ts_1.hasStaticModifier)(original)) {
                var ancestorFacts = enterSubtree(32670 /* HierarchyFacts.StaticInitializerExcludes */, 16449 /* HierarchyFacts.StaticInitializerIncludes */);
                var result = visitorWorker(node, /*expressionResultIsUnused*/ false);
                exitSubtree(ancestorFacts, 98304 /* HierarchyFacts.FunctionSubtreeExcludes */, 0 /* HierarchyFacts.None */);
                return result;
            }
            return visitorWorker(node, /*expressionResultIsUnused*/ false);
        }
        return node;
    }
    function callExpressionVisitor(node) {
        if (node.kind === 108 /* SyntaxKind.SuperKeyword */) {
            return visitSuperKeyword(/*isExpressionOfCall*/ true);
        }
        return visitor(node);
    }
    function visitorWorker(node, expressionResultIsUnused) {
        switch (node.kind) {
            case 126 /* SyntaxKind.StaticKeyword */:
                return undefined; // elide static keyword
            case 262 /* SyntaxKind.ClassDeclaration */:
                return visitClassDeclaration(node);
            case 230 /* SyntaxKind.ClassExpression */:
                return visitClassExpression(node);
            case 168 /* SyntaxKind.Parameter */:
                return visitParameter(node);
            case 261 /* SyntaxKind.FunctionDeclaration */:
                return visitFunctionDeclaration(node);
            case 218 /* SyntaxKind.ArrowFunction */:
                return visitArrowFunction(node);
            case 217 /* SyntaxKind.FunctionExpression */:
                return visitFunctionExpression(node);
            case 259 /* SyntaxKind.VariableDeclaration */:
                return visitVariableDeclaration(node);
            case 80 /* SyntaxKind.Identifier */:
                return visitIdentifier(node);
            case 260 /* SyntaxKind.VariableDeclarationList */:
                return visitVariableDeclarationList(node);
            case 254 /* SyntaxKind.SwitchStatement */:
                return visitSwitchStatement(node);
            case 268 /* SyntaxKind.CaseBlock */:
                return visitCaseBlock(node);
            case 240 /* SyntaxKind.Block */:
                return visitBlock(node, /*isFunctionBody*/ false);
            case 251 /* SyntaxKind.BreakStatement */:
            case 250 /* SyntaxKind.ContinueStatement */:
                return visitBreakOrContinueStatement(node);
            case 255 /* SyntaxKind.LabeledStatement */:
                return visitLabeledStatement(node);
            case 245 /* SyntaxKind.DoStatement */:
            case 246 /* SyntaxKind.WhileStatement */:
                return visitDoOrWhileStatement(node, /*outermostLabeledStatement*/ undefined);
            case 247 /* SyntaxKind.ForStatement */:
                return visitForStatement(node, /*outermostLabeledStatement*/ undefined);
            case 248 /* SyntaxKind.ForInStatement */:
                return visitForInStatement(node, /*outermostLabeledStatement*/ undefined);
            case 249 /* SyntaxKind.ForOfStatement */:
                return visitForOfStatement(node, /*outermostLabeledStatement*/ undefined);
            case 243 /* SyntaxKind.ExpressionStatement */:
                return visitExpressionStatement(node);
            case 209 /* SyntaxKind.ObjectLiteralExpression */:
                return visitObjectLiteralExpression(node);
            case 298 /* SyntaxKind.CatchClause */:
                return visitCatchClause(node);
            case 303 /* SyntaxKind.ShorthandPropertyAssignment */:
                return visitShorthandPropertyAssignment(node);
            case 166 /* SyntaxKind.ComputedPropertyName */:
                return visitComputedPropertyName(node);
            case 208 /* SyntaxKind.ArrayLiteralExpression */:
                return visitArrayLiteralExpression(node);
            case 212 /* SyntaxKind.CallExpression */:
                return visitCallExpression(node);
            case 213 /* SyntaxKind.NewExpression */:
                return visitNewExpression(node);
            case 216 /* SyntaxKind.ParenthesizedExpression */:
                return visitParenthesizedExpression(node, expressionResultIsUnused);
            case 225 /* SyntaxKind.BinaryExpression */:
                return visitBinaryExpression(node, expressionResultIsUnused);
            case 360 /* SyntaxKind.CommaListExpression */:
                return visitCommaListExpression(node, expressionResultIsUnused);
            case 15 /* SyntaxKind.NoSubstitutionTemplateLiteral */:
            case 16 /* SyntaxKind.TemplateHead */:
            case 17 /* SyntaxKind.TemplateMiddle */:
            case 18 /* SyntaxKind.TemplateTail */:
                return visitTemplateLiteral(node);
            case 11 /* SyntaxKind.StringLiteral */:
                return visitStringLiteral(node);
            case 9 /* SyntaxKind.NumericLiteral */:
                return visitNumericLiteral(node);
            case 214 /* SyntaxKind.TaggedTemplateExpression */:
                return visitTaggedTemplateExpression(node);
            case 227 /* SyntaxKind.TemplateExpression */:
                return visitTemplateExpression(node);
            case 228 /* SyntaxKind.YieldExpression */:
                return visitYieldExpression(node);
            case 229 /* SyntaxKind.SpreadElement */:
                return visitSpreadElement(node);
            case 108 /* SyntaxKind.SuperKeyword */:
                return visitSuperKeyword(/*isExpressionOfCall*/ false);
            case 110 /* SyntaxKind.ThisKeyword */:
                return visitThisKeyword(node);
            case 235 /* SyntaxKind.MetaProperty */:
                return visitMetaProperty(node);
            case 173 /* SyntaxKind.MethodDeclaration */:
                return visitMethodDeclaration(node);
            case 176 /* SyntaxKind.GetAccessor */:
            case 177 /* SyntaxKind.SetAccessor */:
                return visitAccessorDeclaration(node);
            case 242 /* SyntaxKind.VariableStatement */:
                return visitVariableStatement(node);
            case 252 /* SyntaxKind.ReturnStatement */:
                return visitReturnStatement(node);
            case 221 /* SyntaxKind.VoidExpression */:
                return visitVoidExpression(node);
            default:
                return (0, ts_1.visitEachChild)(node, visitor, context);
        }
    }
    function visitSourceFile(node) {
        var ancestorFacts = enterSubtree(8064 /* HierarchyFacts.SourceFileExcludes */, 64 /* HierarchyFacts.SourceFileIncludes */);
        var prologue = [];
        var statements = [];
        startLexicalEnvironment();
        var statementOffset = factory.copyPrologue(node.statements, prologue, /*ensureUseStrict*/ false, visitor);
        (0, ts_1.addRange)(statements, (0, ts_1.visitNodes)(node.statements, visitor, ts_1.isStatement, statementOffset));
        if (taggedTemplateStringDeclarations) {
            statements.push(factory.createVariableStatement(/*modifiers*/ undefined, factory.createVariableDeclarationList(taggedTemplateStringDeclarations)));
        }
        factory.mergeLexicalEnvironment(prologue, endLexicalEnvironment());
        insertCaptureThisForNodeIfNeeded(prologue, node);
        exitSubtree(ancestorFacts, 0 /* HierarchyFacts.None */, 0 /* HierarchyFacts.None */);
        return factory.updateSourceFile(node, (0, ts_1.setTextRange)(factory.createNodeArray((0, ts_1.concatenate)(prologue, statements)), node.statements));
    }
    function visitSwitchStatement(node) {
        if (convertedLoopState !== undefined) {
            var savedAllowedNonLabeledJumps = convertedLoopState.allowedNonLabeledJumps;
            // for switch statement allow only non-labeled break
            convertedLoopState.allowedNonLabeledJumps |= 2 /* Jump.Break */;
            var result = (0, ts_1.visitEachChild)(node, visitor, context);
            convertedLoopState.allowedNonLabeledJumps = savedAllowedNonLabeledJumps;
            return result;
        }
        return (0, ts_1.visitEachChild)(node, visitor, context);
    }
    function visitCaseBlock(node) {
        var ancestorFacts = enterSubtree(7104 /* HierarchyFacts.BlockScopeExcludes */, 0 /* HierarchyFacts.BlockScopeIncludes */);
        var updated = (0, ts_1.visitEachChild)(node, visitor, context);
        exitSubtree(ancestorFacts, 0 /* HierarchyFacts.None */, 0 /* HierarchyFacts.None */);
        return updated;
    }
    function returnCapturedThis(node) {
        return (0, ts_1.setOriginalNode)(factory.createReturnStatement(factory.createUniqueName("_this", 16 /* GeneratedIdentifierFlags.Optimistic */ | 32 /* GeneratedIdentifierFlags.FileLevel */)), node);
    }
    function visitReturnStatement(node) {
        if (convertedLoopState) {
            convertedLoopState.nonLocalJumps |= 8 /* Jump.Return */;
            if (isReturnVoidStatementInConstructorWithCapturedSuper(node)) {
                node = returnCapturedThis(node);
            }
            return factory.createReturnStatement(factory.createObjectLiteralExpression([
                factory.createPropertyAssignment(factory.createIdentifier("value"), node.expression
                    ? ts_1.Debug.checkDefined((0, ts_1.visitNode)(node.expression, visitor, ts_1.isExpression))
                    : factory.createVoidZero())
            ]));
        }
        else if (isReturnVoidStatementInConstructorWithCapturedSuper(node)) {
            return returnCapturedThis(node);
        }
        return (0, ts_1.visitEachChild)(node, visitor, context);
    }
    function visitThisKeyword(node) {
        if (hierarchyFacts & 2 /* HierarchyFacts.ArrowFunction */ && !(hierarchyFacts & 16384 /* HierarchyFacts.StaticInitializer */)) {
            hierarchyFacts |= 65536 /* HierarchyFacts.CapturedLexicalThis */;
        }
        if (convertedLoopState) {
            if (hierarchyFacts & 2 /* HierarchyFacts.ArrowFunction */) {
                // if the enclosing function is an ArrowFunction then we use the captured 'this' keyword.
                convertedLoopState.containsLexicalThis = true;
                return node;
            }
            return convertedLoopState.thisName || (convertedLoopState.thisName = factory.createUniqueName("this"));
        }
        return node;
    }
    function visitVoidExpression(node) {
        return (0, ts_1.visitEachChild)(node, visitorWithUnusedExpressionResult, context);
    }
    function visitIdentifier(node) {
        if (convertedLoopState) {
            if (resolver.isArgumentsLocalBinding(node)) {
                return convertedLoopState.argumentsName || (convertedLoopState.argumentsName = factory.createUniqueName("arguments"));
            }
        }
        if (node.flags & 128 /* NodeFlags.IdentifierHasExtendedUnicodeEscape */) {
            return (0, ts_1.setOriginalNode)((0, ts_1.setTextRange)(factory.createIdentifier((0, ts_1.unescapeLeadingUnderscores)(node.escapedText)), node), node);
        }
        return node;
    }
    function visitBreakOrContinueStatement(node) {
        if (convertedLoopState) {
            // check if we can emit break/continue as is
            // it is possible if either
            //   - break/continue is labeled and label is located inside the converted loop
            //   - break/continue is non-labeled and located in non-converted loop/switch statement
            var jump = node.kind === 251 /* SyntaxKind.BreakStatement */ ? 2 /* Jump.Break */ : 4 /* Jump.Continue */;
            var canUseBreakOrContinue = (node.label && convertedLoopState.labels && convertedLoopState.labels.get((0, ts_1.idText)(node.label))) ||
                (!node.label && (convertedLoopState.allowedNonLabeledJumps & jump));
            if (!canUseBreakOrContinue) {
                var labelMarker = void 0;
                var label = node.label;
                if (!label) {
                    if (node.kind === 251 /* SyntaxKind.BreakStatement */) {
                        convertedLoopState.nonLocalJumps |= 2 /* Jump.Break */;
                        labelMarker = "break";
                    }
                    else {
                        convertedLoopState.nonLocalJumps |= 4 /* Jump.Continue */;
                        // note: return value is emitted only to simplify debugging, call to converted loop body does not do any dispatching on it.
                        labelMarker = "continue";
                    }
                }
                else {
                    if (node.kind === 251 /* SyntaxKind.BreakStatement */) {
                        labelMarker = "break-".concat(label.escapedText);
                        setLabeledJump(convertedLoopState, /*isBreak*/ true, (0, ts_1.idText)(label), labelMarker);
                    }
                    else {
                        labelMarker = "continue-".concat(label.escapedText);
                        setLabeledJump(convertedLoopState, /*isBreak*/ false, (0, ts_1.idText)(label), labelMarker);
                    }
                }
                var returnExpression = factory.createStringLiteral(labelMarker);
                if (convertedLoopState.loopOutParameters.length) {
                    var outParams = convertedLoopState.loopOutParameters;
                    var expr = void 0;
                    for (var i = 0; i < outParams.length; i++) {
                        var copyExpr = copyOutParameter(outParams[i], 1 /* CopyDirection.ToOutParameter */);
                        if (i === 0) {
                            expr = copyExpr;
                        }
                        else {
                            expr = factory.createBinaryExpression(expr, 28 /* SyntaxKind.CommaToken */, copyExpr);
                        }
                    }
                    returnExpression = factory.createBinaryExpression(expr, 28 /* SyntaxKind.CommaToken */, returnExpression);
                }
                return factory.createReturnStatement(returnExpression);
            }
        }
        return (0, ts_1.visitEachChild)(node, visitor, context);
    }
    /**
     * Visits a ClassDeclaration and transforms it into a variable statement.
     *
     * @param node A ClassDeclaration node.
     */
    function visitClassDeclaration(node) {
        // [source]
        //      class C { }
        //
        // [output]
        //      var C = (function () {
        //          function C() {
        //          }
        //          return C;
        //      }());
        var variable = factory.createVariableDeclaration(factory.getLocalName(node, /*allowComments*/ true), 
        /*exclamationToken*/ undefined, 
        /*type*/ undefined, transformClassLikeDeclarationToExpression(node));
        (0, ts_1.setOriginalNode)(variable, node);
        var statements = [];
        var statement = factory.createVariableStatement(/*modifiers*/ undefined, factory.createVariableDeclarationList([variable]));
        (0, ts_1.setOriginalNode)(statement, node);
        (0, ts_1.setTextRange)(statement, node);
        (0, ts_1.startOnNewLine)(statement);
        statements.push(statement);
        // Add an `export default` statement for default exports (for `--target es5 --module es6`)
        if ((0, ts_1.hasSyntacticModifier)(node, 1 /* ModifierFlags.Export */)) {
            var exportStatement = (0, ts_1.hasSyntacticModifier)(node, 1024 /* ModifierFlags.Default */)
                ? factory.createExportDefault(factory.getLocalName(node))
                : factory.createExternalModuleExport(factory.getLocalName(node));
            (0, ts_1.setOriginalNode)(exportStatement, statement);
            statements.push(exportStatement);
        }
        return (0, ts_1.singleOrMany)(statements);
    }
    /**
     * Visits a ClassExpression and transforms it into an expression.
     *
     * @param node A ClassExpression node.
     */
    function visitClassExpression(node) {
        // [source]
        //      C = class { }
        //
        // [output]
        //      C = (function () {
        //          function class_1() {
        //          }
        //          return class_1;
        //      }())
        return transformClassLikeDeclarationToExpression(node);
    }
    /**
     * Transforms a ClassExpression or ClassDeclaration into an expression.
     *
     * @param node A ClassExpression or ClassDeclaration node.
     */
    function transformClassLikeDeclarationToExpression(node) {
        // [source]
        //      class C extends D {
        //          constructor() {}
        //          method() {}
        //          get prop() {}
        //          set prop(v) {}
        //      }
        //
        // [output]
        //      (function (_super) {
        //          __extends(C, _super);
        //          function C() {
        //          }
        //          C.prototype.method = function () {}
        //          Object.defineProperty(C.prototype, "prop", {
        //              get: function() {},
        //              set: function() {},
        //              enumerable: true,
        //              configurable: true
        //          });
        //          return C;
        //      }(D))
        if (node.name) {
            enableSubstitutionsForBlockScopedBindings();
        }
        var extendsClauseElement = (0, ts_1.getClassExtendsHeritageElement)(node);
        var classFunction = factory.createFunctionExpression(
        /*modifiers*/ undefined, 
        /*asteriskToken*/ undefined, 
        /*name*/ undefined, 
        /*typeParameters*/ undefined, extendsClauseElement ? [factory.createParameterDeclaration(/*modifiers*/ undefined, /*dotDotDotToken*/ undefined, factory.createUniqueName("_super", 16 /* GeneratedIdentifierFlags.Optimistic */ | 32 /* GeneratedIdentifierFlags.FileLevel */))] : [], 
        /*type*/ undefined, transformClassBody(node, extendsClauseElement));
        // To preserve the behavior of the old emitter, we explicitly indent
        // the body of the function here if it was requested in an earlier
        // transformation.
        (0, ts_1.setEmitFlags)(classFunction, ((0, ts_1.getEmitFlags)(node) & 131072 /* EmitFlags.Indented */) | 1048576 /* EmitFlags.ReuseTempVariableScope */);
        // "inner" and "outer" below are added purely to preserve source map locations from
        // the old emitter
        var inner = factory.createPartiallyEmittedExpression(classFunction);
        (0, ts_1.setTextRangeEnd)(inner, node.end);
        (0, ts_1.setEmitFlags)(inner, 3072 /* EmitFlags.NoComments */);
        var outer = factory.createPartiallyEmittedExpression(inner);
        (0, ts_1.setTextRangeEnd)(outer, (0, ts_1.skipTrivia)(currentText, node.pos));
        (0, ts_1.setEmitFlags)(outer, 3072 /* EmitFlags.NoComments */);
        var result = factory.createParenthesizedExpression(factory.createCallExpression(outer, 
        /*typeArguments*/ undefined, extendsClauseElement
            ? [ts_1.Debug.checkDefined((0, ts_1.visitNode)(extendsClauseElement.expression, visitor, ts_1.isExpression))]
            : []));
        (0, ts_1.addSyntheticLeadingComment)(result, 3 /* SyntaxKind.MultiLineCommentTrivia */, "* @class ");
        return result;
    }
    /**
     * Transforms a ClassExpression or ClassDeclaration into a function body.
     *
     * @param node A ClassExpression or ClassDeclaration node.
     * @param extendsClauseElement The expression for the class `extends` clause.
     */
    function transformClassBody(node, extendsClauseElement) {
        var statements = [];
        var name = factory.getInternalName(node);
        var constructorLikeName = (0, ts_1.isIdentifierANonContextualKeyword)(name) ? factory.getGeneratedNameForNode(name) : name;
        startLexicalEnvironment();
        addExtendsHelperIfNeeded(statements, node, extendsClauseElement);
        addConstructor(statements, node, constructorLikeName, extendsClauseElement);
        addClassMembers(statements, node);
        // Create a synthetic text range for the return statement.
        var closingBraceLocation = (0, ts_1.createTokenRange)((0, ts_1.skipTrivia)(currentText, node.members.end), 20 /* SyntaxKind.CloseBraceToken */);
        // The following partially-emitted expression exists purely to align our sourcemap
        // emit with the original emitter.
        var outer = factory.createPartiallyEmittedExpression(constructorLikeName);
        (0, ts_1.setTextRangeEnd)(outer, closingBraceLocation.end);
        (0, ts_1.setEmitFlags)(outer, 3072 /* EmitFlags.NoComments */);
        var statement = factory.createReturnStatement(outer);
        (0, ts_1.setTextRangePos)(statement, closingBraceLocation.pos);
        (0, ts_1.setEmitFlags)(statement, 3072 /* EmitFlags.NoComments */ | 768 /* EmitFlags.NoTokenSourceMaps */);
        statements.push(statement);
        (0, ts_1.insertStatementsAfterStandardPrologue)(statements, endLexicalEnvironment());
        var block = factory.createBlock((0, ts_1.setTextRange)(factory.createNodeArray(statements), /*location*/ node.members), /*multiLine*/ true);
        (0, ts_1.setEmitFlags)(block, 3072 /* EmitFlags.NoComments */);
        return block;
    }
    /**
     * Adds a call to the `__extends` helper if needed for a class.
     *
     * @param statements The statements of the class body function.
     * @param node The ClassExpression or ClassDeclaration node.
     * @param extendsClauseElement The expression for the class `extends` clause.
     */
    function addExtendsHelperIfNeeded(statements, node, extendsClauseElement) {
        if (extendsClauseElement) {
            statements.push((0, ts_1.setTextRange)(factory.createExpressionStatement(emitHelpers().createExtendsHelper(factory.getInternalName(node))), 
            /*location*/ extendsClauseElement));
        }
    }
    /**
     * Adds the constructor of the class to a class body function.
     *
     * @param statements The statements of the class body function.
     * @param node The ClassExpression or ClassDeclaration node.
     * @param extendsClauseElement The expression for the class `extends` clause.
     */
    function addConstructor(statements, node, name, extendsClauseElement) {
        var savedConvertedLoopState = convertedLoopState;
        convertedLoopState = undefined;
        var ancestorFacts = enterSubtree(32662 /* HierarchyFacts.ConstructorExcludes */, 73 /* HierarchyFacts.ConstructorIncludes */);
        var constructor = (0, ts_1.getFirstConstructorWithBody)(node);
        var hasSynthesizedSuper = hasSynthesizedDefaultSuperCall(constructor, extendsClauseElement !== undefined);
        var constructorFunction = factory.createFunctionDeclaration(
        /*modifiers*/ undefined, 
        /*asteriskToken*/ undefined, name, 
        /*typeParameters*/ undefined, transformConstructorParameters(constructor, hasSynthesizedSuper), 
        /*type*/ undefined, transformConstructorBody(constructor, node, extendsClauseElement, hasSynthesizedSuper));
        (0, ts_1.setTextRange)(constructorFunction, constructor || node);
        if (extendsClauseElement) {
            (0, ts_1.setEmitFlags)(constructorFunction, 16 /* EmitFlags.CapturesThis */);
        }
        statements.push(constructorFunction);
        exitSubtree(ancestorFacts, 98304 /* HierarchyFacts.FunctionSubtreeExcludes */, 0 /* HierarchyFacts.None */);
        convertedLoopState = savedConvertedLoopState;
    }
    /**
     * Transforms the parameters of the constructor declaration of a class.
     *
     * @param constructor The constructor for the class.
     * @param hasSynthesizedSuper A value indicating whether the constructor starts with a
     *                            synthesized `super` call.
     */
    function transformConstructorParameters(constructor, hasSynthesizedSuper) {
        // If the TypeScript transformer needed to synthesize a constructor for property
        // initializers, it would have also added a synthetic `...args` parameter and
        // `super` call.
        // If this is the case, we do not include the synthetic `...args` parameter and
        // will instead use the `arguments` object in ES5/3.
        return (0, ts_1.visitParameterList)(constructor && !hasSynthesizedSuper ? constructor.parameters : undefined, visitor, context)
            || [];
    }
    function createDefaultConstructorBody(node, isDerivedClass) {
        // We must be here because the user didn't write a constructor
        // but we needed to call 'super(...args)' anyway as per 14.5.14 of the ES2016 spec.
        // If that's the case we can just immediately return the result of a 'super()' call.
        var statements = [];
        resumeLexicalEnvironment();
        factory.mergeLexicalEnvironment(statements, endLexicalEnvironment());
        if (isDerivedClass) {
            // return _super !== null && _super.apply(this, arguments) || this;
            statements.push(factory.createReturnStatement(createDefaultSuperCallOrThis()));
        }
        var statementsArray = factory.createNodeArray(statements);
        (0, ts_1.setTextRange)(statementsArray, node.members);
        var block = factory.createBlock(statementsArray, /*multiLine*/ true);
        (0, ts_1.setTextRange)(block, node);
        (0, ts_1.setEmitFlags)(block, 3072 /* EmitFlags.NoComments */);
        return block;
    }
    /**
     * Transforms the body of a constructor declaration of a class.
     *
     * @param constructor The constructor for the class.
     * @param node The node which contains the constructor.
     * @param extendsClauseElement The expression for the class `extends` clause.
     * @param hasSynthesizedSuper A value indicating whether the constructor starts with a
     *                            synthesized `super` call.
     */
    function transformConstructorBody(constructor, node, extendsClauseElement, hasSynthesizedSuper) {
        // determine whether the class is known syntactically to be a derived class (e.g. a
        // class that extends a value that is not syntactically known to be `null`).
        var isDerivedClass = !!extendsClauseElement && (0, ts_1.skipOuterExpressions)(extendsClauseElement.expression).kind !== 106 /* SyntaxKind.NullKeyword */;
        // When the subclass does not have a constructor, we synthesize a *default* constructor using the following
        // representation:
        //
        // ```
        // // es2015 (source)
        // class C extends Base { }
        //
        // // es5 (transformed)
        // var C = (function (_super) {
        //     function C() {
        //         return _super.apply(this, arguments) || this;
        //     }
        //     return C;
        // })(Base);
        // ```
        if (!constructor)
            return createDefaultConstructorBody(node, isDerivedClass);
        // The prologue will contain all leading standard and custom prologue statements added by this transform
        var prologue = [];
        var statements = [];
        resumeLexicalEnvironment();
        // In derived classes, there may be code before the necessary super() call
        // We'll remove pre-super statements to be tacked on after the rest of the body
        var existingPrologue = (0, ts_1.takeWhile)(constructor.body.statements, ts_1.isPrologueDirective);
        var _a = findSuperCallAndStatementIndex(constructor.body.statements, existingPrologue), superCall = _a.superCall, superStatementIndex = _a.superStatementIndex;
        var postSuperStatementsStart = superStatementIndex === -1 ? existingPrologue.length : superStatementIndex + 1;
        // If a super call has already been synthesized,
        // we're going to assume that we should just transform everything after that.
        // The assumption is that no prior step in the pipeline has added any prologue directives.
        var statementOffset = postSuperStatementsStart;
        if (!hasSynthesizedSuper)
            statementOffset = factory.copyStandardPrologue(constructor.body.statements, prologue, statementOffset, /*ensureUseStrict*/ false);
        if (!hasSynthesizedSuper)
            statementOffset = factory.copyCustomPrologue(constructor.body.statements, statements, statementOffset, visitor, /*filter*/ undefined);
        // If there already exists a call to `super()`, visit the statement directly
        var superCallExpression;
        if (hasSynthesizedSuper) {
            superCallExpression = createDefaultSuperCallOrThis();
        }
        else if (superCall) {
            superCallExpression = visitSuperCallInBody(superCall);
        }
        if (superCallExpression) {
            hierarchyFacts |= 8192 /* HierarchyFacts.ConstructorWithCapturedSuper */;
        }
        // Add parameter defaults at the beginning of the output, with prologue statements
        addDefaultValueAssignmentsIfNeeded(prologue, constructor);
        addRestParameterIfNeeded(prologue, constructor, hasSynthesizedSuper);
        // visit the remaining statements
        (0, ts_1.addRange)(statements, (0, ts_1.visitNodes)(constructor.body.statements, visitor, ts_1.isStatement, /*start*/ statementOffset));
        factory.mergeLexicalEnvironment(prologue, endLexicalEnvironment());
        insertCaptureNewTargetIfNeeded(prologue, constructor, /*copyOnWrite*/ false);
        if (isDerivedClass || superCallExpression) {
            if (superCallExpression && postSuperStatementsStart === constructor.body.statements.length && !(constructor.body.transformFlags & 16384 /* TransformFlags.ContainsLexicalThis */)) {
                // If the subclass constructor does *not* contain `this` and *ends* with a `super()` call, we will use the
                // following representation:
                //
                // ```
                // // es2015 (source)
                // class C extends Base {
                //     constructor() {
                //         super("foo");
                //     }
                // }
                //
                // // es5 (transformed)
                // var C = (function (_super) {
                //     function C() {
                //         return _super.call(this, "foo") || this;
                //     }
                //     return C;
                // })(Base);
                // ```
                var superCall_1 = (0, ts_1.cast)((0, ts_1.cast)(superCallExpression, ts_1.isBinaryExpression).left, ts_1.isCallExpression);
                var returnStatement = factory.createReturnStatement(superCallExpression);
                (0, ts_1.setCommentRange)(returnStatement, (0, ts_1.getCommentRange)(superCall_1));
                (0, ts_1.setEmitFlags)(superCall_1, 3072 /* EmitFlags.NoComments */);
                statements.push(returnStatement);
            }
            else {
                // Otherwise, we will use the following transformed representation for calls to `super()` in a constructor:
                //
                // ```
                // // es2015 (source)
                // class C extends Base {
                //     constructor() {
                //         super("foo");
                //         this.x = 1;
                //     }
                // }
                //
                // // es5 (transformed)
                // var C = (function (_super) {
                //     function C() {
                //         var _this = _super.call(this, "foo") || this;
                //         _this.x = 1;
                //         return _this;
                //     }
                //     return C;
                // })(Base);
                // ```
                // If the super() call is the first statement, we can directly create and assign its result to `_this`
                if (superStatementIndex <= existingPrologue.length) {
                    insertCaptureThisForNode(statements, constructor, superCallExpression || createActualThis());
                }
                // Since the `super()` call isn't the first statement, it's split across 1-2 statements:
                // * A prologue `var _this = this;`, in case the constructor accesses this before super()
                // * If it exists, a reassignment to that `_this` of the super() call
                else {
                    insertCaptureThisForNode(prologue, constructor, createActualThis());
                    if (superCallExpression) {
                        insertSuperThisCaptureThisForNode(statements, superCallExpression);
                    }
                }
                if (!isSufficientlyCoveredByReturnStatements(constructor.body)) {
                    statements.push(factory.createReturnStatement(factory.createUniqueName("_this", 16 /* GeneratedIdentifierFlags.Optimistic */ | 32 /* GeneratedIdentifierFlags.FileLevel */)));
                }
            }
        }
        else {
            // If a class is not derived from a base class or does not have a call to `super()`, `this` is only
            // captured when necessitated by an arrow function capturing the lexical `this`:
            //
            // ```
            // // es2015
            // class C {}
            //
            // // es5
            // var C = (function () {
            //     function C() {
            //     }
            //     return C;
            // })();
            // ```
            insertCaptureThisForNodeIfNeeded(prologue, constructor);
        }
        var body = factory.createBlock((0, ts_1.setTextRange)(factory.createNodeArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray([], existingPrologue, true), prologue, true), (superStatementIndex <= existingPrologue.length ? ts_1.emptyArray : (0, ts_1.visitNodes)(constructor.body.statements, visitor, ts_1.isStatement, existingPrologue.length, superStatementIndex - existingPrologue.length)), true), statements, true)), 
        /*location*/ constructor.body.statements), 
        /*multiLine*/ true);
        (0, ts_1.setTextRange)(body, constructor.body);
        return body;
    }
    function findSuperCallAndStatementIndex(originalBodyStatements, existingPrologue) {
        for (var i = existingPrologue.length; i < originalBodyStatements.length; i += 1) {
            var superCall = (0, ts_1.getSuperCallFromStatement)(originalBodyStatements[i]);
            if (superCall) {
                // With a super() call, split the statements into pre-super() and 'body' (post-super())
                return {
                    superCall: superCall,
                    superStatementIndex: i,
                };
            }
        }
        // Since there was no super() call found, consider all statements to be in the main 'body' (post-super())
        return {
            superStatementIndex: -1,
        };
    }
    /**
     * We want to try to avoid emitting a return statement in certain cases if a user already returned something.
     * It would generate obviously dead code, so we'll try to make things a little bit prettier
     * by doing a minimal check on whether some common patterns always explicitly return.
     */
    function isSufficientlyCoveredByReturnStatements(statement) {
        // A return statement is considered covered.
        if (statement.kind === 252 /* SyntaxKind.ReturnStatement */) {
            return true;
        }
        // An if-statement with two covered branches is covered.
        else if (statement.kind === 244 /* SyntaxKind.IfStatement */) {
            var ifStatement = statement;
            if (ifStatement.elseStatement) {
                return isSufficientlyCoveredByReturnStatements(ifStatement.thenStatement) &&
                    isSufficientlyCoveredByReturnStatements(ifStatement.elseStatement);
            }
        }
        // A block is covered if it has a last statement which is covered.
        else if (statement.kind === 240 /* SyntaxKind.Block */) {
            var lastStatement = (0, ts_1.lastOrUndefined)(statement.statements);
            if (lastStatement && isSufficientlyCoveredByReturnStatements(lastStatement)) {
                return true;
            }
        }
        return false;
    }
    function createActualThis() {
        return (0, ts_1.setEmitFlags)(factory.createThis(), 8 /* EmitFlags.NoSubstitution */);
    }
    function createDefaultSuperCallOrThis() {
        return factory.createLogicalOr(factory.createLogicalAnd(factory.createStrictInequality(factory.createUniqueName("_super", 16 /* GeneratedIdentifierFlags.Optimistic */ | 32 /* GeneratedIdentifierFlags.FileLevel */), factory.createNull()), factory.createFunctionApplyCall(factory.createUniqueName("_super", 16 /* GeneratedIdentifierFlags.Optimistic */ | 32 /* GeneratedIdentifierFlags.FileLevel */), createActualThis(), factory.createIdentifier("arguments"))), createActualThis());
    }
    /**
     * Visits a parameter declaration.
     *
     * @param node A ParameterDeclaration node.
     */
    function visitParameter(node) {
        if (node.dotDotDotToken) {
            // rest parameters are elided
            return undefined;
        }
        else if ((0, ts_1.isBindingPattern)(node.name)) {
            // Binding patterns are converted into a generated name and are
            // evaluated inside the function body.
            return (0, ts_1.setOriginalNode)((0, ts_1.setTextRange)(factory.createParameterDeclaration(
            /*modifiers*/ undefined, 
            /*dotDotDotToken*/ undefined, factory.getGeneratedNameForNode(node), 
            /*questionToken*/ undefined, 
            /*type*/ undefined, 
            /*initializer*/ undefined), 
            /*location*/ node), 
            /*original*/ node);
        }
        else if (node.initializer) {
            // Initializers are elided
            return (0, ts_1.setOriginalNode)((0, ts_1.setTextRange)(factory.createParameterDeclaration(
            /*modifiers*/ undefined, 
            /*dotDotDotToken*/ undefined, node.name, 
            /*questionToken*/ undefined, 
            /*type*/ undefined, 
            /*initializer*/ undefined), 
            /*location*/ node), 
            /*original*/ node);
        }
        else {
            return node;
        }
    }
    function hasDefaultValueOrBindingPattern(node) {
        return node.initializer !== undefined
            || (0, ts_1.isBindingPattern)(node.name);
    }
    /**
     * Adds statements to the body of a function-like node if it contains parameters with
     * binding patterns or initializers.
     *
     * @param statements The statements for the new function body.
     * @param node A function-like node.
     */
    function addDefaultValueAssignmentsIfNeeded(statements, node) {
        if (!(0, ts_1.some)(node.parameters, hasDefaultValueOrBindingPattern)) {
            return false;
        }
        var added = false;
        for (var _i = 0, _a = node.parameters; _i < _a.length; _i++) {
            var parameter = _a[_i];
            var name_1 = parameter.name, initializer = parameter.initializer, dotDotDotToken = parameter.dotDotDotToken;
            // A rest parameter cannot have a binding pattern or an initializer,
            // so let's just ignore it.
            if (dotDotDotToken) {
                continue;
            }
            if ((0, ts_1.isBindingPattern)(name_1)) {
                added = insertDefaultValueAssignmentForBindingPattern(statements, parameter, name_1, initializer) || added;
            }
            else if (initializer) {
                insertDefaultValueAssignmentForInitializer(statements, parameter, name_1, initializer);
                added = true;
            }
        }
        return added;
    }
    /**
     * Adds statements to the body of a function-like node for parameters with binding patterns
     *
     * @param statements The statements for the new function body.
     * @param parameter The parameter for the function.
     * @param name The name of the parameter.
     * @param initializer The initializer for the parameter.
     */
    function insertDefaultValueAssignmentForBindingPattern(statements, parameter, name, initializer) {
        // In cases where a binding pattern is simply '[]' or '{}',
        // we usually don't want to emit a var declaration; however, in the presence
        // of an initializer, we must emit that expression to preserve side effects.
        if (name.elements.length > 0) {
            (0, ts_1.insertStatementAfterCustomPrologue)(statements, (0, ts_1.setEmitFlags)(factory.createVariableStatement(
            /*modifiers*/ undefined, factory.createVariableDeclarationList((0, ts_1.flattenDestructuringBinding)(parameter, visitor, context, 0 /* FlattenLevel.All */, factory.getGeneratedNameForNode(parameter)))), 2097152 /* EmitFlags.CustomPrologue */));
            return true;
        }
        else if (initializer) {
            (0, ts_1.insertStatementAfterCustomPrologue)(statements, (0, ts_1.setEmitFlags)(factory.createExpressionStatement(factory.createAssignment(factory.getGeneratedNameForNode(parameter), ts_1.Debug.checkDefined((0, ts_1.visitNode)(initializer, visitor, ts_1.isExpression)))), 2097152 /* EmitFlags.CustomPrologue */));
            return true;
        }
        return false;
    }
    /**
     * Adds statements to the body of a function-like node for parameters with initializers.
     *
     * @param statements The statements for the new function body.
     * @param parameter The parameter for the function.
     * @param name The name of the parameter.
     * @param initializer The initializer for the parameter.
     */
    function insertDefaultValueAssignmentForInitializer(statements, parameter, name, initializer) {
        initializer = ts_1.Debug.checkDefined((0, ts_1.visitNode)(initializer, visitor, ts_1.isExpression));
        var statement = factory.createIfStatement(factory.createTypeCheck(factory.cloneNode(name), "undefined"), (0, ts_1.setEmitFlags)((0, ts_1.setTextRange)(factory.createBlock([
            factory.createExpressionStatement((0, ts_1.setEmitFlags)((0, ts_1.setTextRange)(factory.createAssignment(
            // TODO(rbuckton): Does this need to be parented?
            (0, ts_1.setEmitFlags)((0, ts_1.setParent)((0, ts_1.setTextRange)(factory.cloneNode(name), name), name.parent), 96 /* EmitFlags.NoSourceMap */), (0, ts_1.setEmitFlags)(initializer, 96 /* EmitFlags.NoSourceMap */ | (0, ts_1.getEmitFlags)(initializer) | 3072 /* EmitFlags.NoComments */)), parameter), 3072 /* EmitFlags.NoComments */))
        ]), parameter), 1 /* EmitFlags.SingleLine */ | 64 /* EmitFlags.NoTrailingSourceMap */ | 768 /* EmitFlags.NoTokenSourceMaps */ | 3072 /* EmitFlags.NoComments */));
        (0, ts_1.startOnNewLine)(statement);
        (0, ts_1.setTextRange)(statement, parameter);
        (0, ts_1.setEmitFlags)(statement, 768 /* EmitFlags.NoTokenSourceMaps */ | 64 /* EmitFlags.NoTrailingSourceMap */ | 2097152 /* EmitFlags.CustomPrologue */ | 3072 /* EmitFlags.NoComments */);
        (0, ts_1.insertStatementAfterCustomPrologue)(statements, statement);
    }
    /**
     * Gets a value indicating whether we need to add statements to handle a rest parameter.
     *
     * @param node A ParameterDeclaration node.
     * @param inConstructorWithSynthesizedSuper A value indicating whether the parameter is
     *                                          part of a constructor declaration with a
     *                                          synthesized call to `super`
     */
    function shouldAddRestParameter(node, inConstructorWithSynthesizedSuper) {
        return !!(node && node.dotDotDotToken && !inConstructorWithSynthesizedSuper);
    }
    /**
     * Adds statements to the body of a function-like node if it contains a rest parameter.
     *
     * @param statements The statements for the new function body.
     * @param node A function-like node.
     * @param inConstructorWithSynthesizedSuper A value indicating whether the parameter is
     *                                          part of a constructor declaration with a
     *                                          synthesized call to `super`
     */
    function addRestParameterIfNeeded(statements, node, inConstructorWithSynthesizedSuper) {
        var prologueStatements = [];
        var parameter = (0, ts_1.lastOrUndefined)(node.parameters);
        if (!shouldAddRestParameter(parameter, inConstructorWithSynthesizedSuper)) {
            return false;
        }
        // `declarationName` is the name of the local declaration for the parameter.
        // TODO(rbuckton): Does this need to be parented?
        var declarationName = parameter.name.kind === 80 /* SyntaxKind.Identifier */ ? (0, ts_1.setParent)((0, ts_1.setTextRange)(factory.cloneNode(parameter.name), parameter.name), parameter.name.parent) : factory.createTempVariable(/*recordTempVariable*/ undefined);
        (0, ts_1.setEmitFlags)(declarationName, 96 /* EmitFlags.NoSourceMap */);
        // `expressionName` is the name of the parameter used in expressions.
        var expressionName = parameter.name.kind === 80 /* SyntaxKind.Identifier */ ? factory.cloneNode(parameter.name) : declarationName;
        var restIndex = node.parameters.length - 1;
        var temp = factory.createLoopVariable();
        // var param = [];
        prologueStatements.push((0, ts_1.setEmitFlags)((0, ts_1.setTextRange)(factory.createVariableStatement(
        /*modifiers*/ undefined, factory.createVariableDeclarationList([
            factory.createVariableDeclaration(declarationName, 
            /*exclamationToken*/ undefined, 
            /*type*/ undefined, factory.createArrayLiteralExpression([]))
        ])), 
        /*location*/ parameter), 2097152 /* EmitFlags.CustomPrologue */));
        // for (var _i = restIndex; _i < arguments.length; _i++) {
        //   param[_i - restIndex] = arguments[_i];
        // }
        var forStatement = factory.createForStatement((0, ts_1.setTextRange)(factory.createVariableDeclarationList([
            factory.createVariableDeclaration(temp, /*exclamationToken*/ undefined, /*type*/ undefined, factory.createNumericLiteral(restIndex))
        ]), parameter), (0, ts_1.setTextRange)(factory.createLessThan(temp, factory.createPropertyAccessExpression(factory.createIdentifier("arguments"), "length")), parameter), (0, ts_1.setTextRange)(factory.createPostfixIncrement(temp), parameter), factory.createBlock([
            (0, ts_1.startOnNewLine)((0, ts_1.setTextRange)(factory.createExpressionStatement(factory.createAssignment(factory.createElementAccessExpression(expressionName, restIndex === 0
                ? temp
                : factory.createSubtract(temp, factory.createNumericLiteral(restIndex))), factory.createElementAccessExpression(factory.createIdentifier("arguments"), temp))), 
            /*location*/ parameter))
        ]));
        (0, ts_1.setEmitFlags)(forStatement, 2097152 /* EmitFlags.CustomPrologue */);
        (0, ts_1.startOnNewLine)(forStatement);
        prologueStatements.push(forStatement);
        if (parameter.name.kind !== 80 /* SyntaxKind.Identifier */) {
            // do the actual destructuring of the rest parameter if necessary
            prologueStatements.push((0, ts_1.setEmitFlags)((0, ts_1.setTextRange)(factory.createVariableStatement(
            /*modifiers*/ undefined, factory.createVariableDeclarationList((0, ts_1.flattenDestructuringBinding)(parameter, visitor, context, 0 /* FlattenLevel.All */, expressionName))), parameter), 2097152 /* EmitFlags.CustomPrologue */));
        }
        (0, ts_1.insertStatementsAfterCustomPrologue)(statements, prologueStatements);
        return true;
    }
    /**
     * Adds a statement to capture the `this` of a function declaration if it is needed.
     * NOTE: This must be executed *after* the subtree has been visited.
     *
     * @param statements The statements for the new function body.
     * @param node A node.
     */
    function insertCaptureThisForNodeIfNeeded(statements, node) {
        if (hierarchyFacts & 65536 /* HierarchyFacts.CapturedLexicalThis */ && node.kind !== 218 /* SyntaxKind.ArrowFunction */) {
            insertCaptureThisForNode(statements, node, factory.createThis());
            return true;
        }
        return false;
    }
    /**
     * Assigns the `this` in a constructor to the result of its `super()` call.
     *
     * @param statements Statements in the constructor body.
     * @param superExpression Existing `super()` call for the constructor.
     */
    function insertSuperThisCaptureThisForNode(statements, superExpression) {
        enableSubstitutionsForCapturedThis();
        var assignSuperExpression = factory.createExpressionStatement(factory.createBinaryExpression(factory.createThis(), 64 /* SyntaxKind.EqualsToken */, superExpression));
        (0, ts_1.insertStatementAfterCustomPrologue)(statements, assignSuperExpression);
        (0, ts_1.setCommentRange)(assignSuperExpression, (0, ts_1.getOriginalNode)(superExpression).parent);
    }
    function insertCaptureThisForNode(statements, node, initializer) {
        enableSubstitutionsForCapturedThis();
        var captureThisStatement = factory.createVariableStatement(
        /*modifiers*/ undefined, factory.createVariableDeclarationList([
            factory.createVariableDeclaration(factory.createUniqueName("_this", 16 /* GeneratedIdentifierFlags.Optimistic */ | 32 /* GeneratedIdentifierFlags.FileLevel */), 
            /*exclamationToken*/ undefined, 
            /*type*/ undefined, initializer)
        ]));
        (0, ts_1.setEmitFlags)(captureThisStatement, 3072 /* EmitFlags.NoComments */ | 2097152 /* EmitFlags.CustomPrologue */);
        (0, ts_1.setSourceMapRange)(captureThisStatement, node);
        (0, ts_1.insertStatementAfterCustomPrologue)(statements, captureThisStatement);
    }
    function insertCaptureNewTargetIfNeeded(statements, node, copyOnWrite) {
        if (hierarchyFacts & 32768 /* HierarchyFacts.NewTarget */) {
            var newTarget = void 0;
            switch (node.kind) {
                case 218 /* SyntaxKind.ArrowFunction */:
                    return statements;
                case 173 /* SyntaxKind.MethodDeclaration */:
                case 176 /* SyntaxKind.GetAccessor */:
                case 177 /* SyntaxKind.SetAccessor */:
                    // Methods and accessors cannot be constructors, so 'new.target' will
                    // always return 'undefined'.
                    newTarget = factory.createVoidZero();
                    break;
                case 175 /* SyntaxKind.Constructor */:
                    // Class constructors can only be called with `new`, so `this.constructor`
                    // should be relatively safe to use.
                    newTarget = factory.createPropertyAccessExpression((0, ts_1.setEmitFlags)(factory.createThis(), 8 /* EmitFlags.NoSubstitution */), "constructor");
                    break;
                case 261 /* SyntaxKind.FunctionDeclaration */:
                case 217 /* SyntaxKind.FunctionExpression */:
                    // Functions can be called or constructed, and may have a `this` due to
                    // being a member or when calling an imported function via `other_1.f()`.
                    newTarget = factory.createConditionalExpression(factory.createLogicalAnd((0, ts_1.setEmitFlags)(factory.createThis(), 8 /* EmitFlags.NoSubstitution */), factory.createBinaryExpression((0, ts_1.setEmitFlags)(factory.createThis(), 8 /* EmitFlags.NoSubstitution */), 104 /* SyntaxKind.InstanceOfKeyword */, factory.getLocalName(node))), 
                    /*questionToken*/ undefined, factory.createPropertyAccessExpression((0, ts_1.setEmitFlags)(factory.createThis(), 8 /* EmitFlags.NoSubstitution */), "constructor"), 
                    /*colonToken*/ undefined, factory.createVoidZero());
                    break;
                default:
                    return ts_1.Debug.failBadSyntaxKind(node);
            }
            var captureNewTargetStatement = factory.createVariableStatement(
            /*modifiers*/ undefined, factory.createVariableDeclarationList([
                factory.createVariableDeclaration(factory.createUniqueName("_newTarget", 16 /* GeneratedIdentifierFlags.Optimistic */ | 32 /* GeneratedIdentifierFlags.FileLevel */), 
                /*exclamationToken*/ undefined, 
                /*type*/ undefined, newTarget)
            ]));
            (0, ts_1.setEmitFlags)(captureNewTargetStatement, 3072 /* EmitFlags.NoComments */ | 2097152 /* EmitFlags.CustomPrologue */);
            if (copyOnWrite) {
                statements = statements.slice();
            }
            (0, ts_1.insertStatementAfterCustomPrologue)(statements, captureNewTargetStatement);
        }
        return statements;
    }
    /**
     * Adds statements to the class body function for a class to define the members of the
     * class.
     *
     * @param statements The statements for the class body function.
     * @param node The ClassExpression or ClassDeclaration node.
     */
    function addClassMembers(statements, node) {
        for (var _i = 0, _a = node.members; _i < _a.length; _i++) {
            var member = _a[_i];
            switch (member.kind) {
                case 239 /* SyntaxKind.SemicolonClassElement */:
                    statements.push(transformSemicolonClassElementToStatement(member));
                    break;
                case 173 /* SyntaxKind.MethodDeclaration */:
                    statements.push(transformClassMethodDeclarationToStatement(getClassMemberPrefix(node, member), member, node));
                    break;
                case 176 /* SyntaxKind.GetAccessor */:
                case 177 /* SyntaxKind.SetAccessor */:
                    var accessors = (0, ts_1.getAllAccessorDeclarations)(node.members, member);
                    if (member === accessors.firstAccessor) {
                        statements.push(transformAccessorsToStatement(getClassMemberPrefix(node, member), accessors, node));
                    }
                    break;
                case 175 /* SyntaxKind.Constructor */:
                case 174 /* SyntaxKind.ClassStaticBlockDeclaration */:
                    // Constructors are handled in visitClassExpression/visitClassDeclaration
                    break;
                default:
                    ts_1.Debug.failBadSyntaxKind(member, currentSourceFile && currentSourceFile.fileName);
                    break;
            }
        }
    }
    /**
     * Transforms a SemicolonClassElement into a statement for a class body function.
     *
     * @param member The SemicolonClassElement node.
     */
    function transformSemicolonClassElementToStatement(member) {
        return (0, ts_1.setTextRange)(factory.createEmptyStatement(), member);
    }
    /**
     * Transforms a MethodDeclaration into a statement for a class body function.
     *
     * @param receiver The receiver for the member.
     * @param member The MethodDeclaration node.
     */
    function transformClassMethodDeclarationToStatement(receiver, member, container) {
        var commentRange = (0, ts_1.getCommentRange)(member);
        var sourceMapRange = (0, ts_1.getSourceMapRange)(member);
        var memberFunction = transformFunctionLikeToExpression(member, /*location*/ member, /*name*/ undefined, container);
        var propertyName = (0, ts_1.visitNode)(member.name, visitor, ts_1.isPropertyName);
        ts_1.Debug.assert(propertyName);
        var e;
        if (!(0, ts_1.isPrivateIdentifier)(propertyName) && (0, ts_1.getUseDefineForClassFields)(context.getCompilerOptions())) {
            var name_2 = (0, ts_1.isComputedPropertyName)(propertyName) ? propertyName.expression
                : (0, ts_1.isIdentifier)(propertyName) ? factory.createStringLiteral((0, ts_1.unescapeLeadingUnderscores)(propertyName.escapedText))
                    : propertyName;
            e = factory.createObjectDefinePropertyCall(receiver, name_2, factory.createPropertyDescriptor({ value: memberFunction, enumerable: false, writable: true, configurable: true }));
        }
        else {
            var memberName = (0, ts_1.createMemberAccessForPropertyName)(factory, receiver, propertyName, /*location*/ member.name);
            e = factory.createAssignment(memberName, memberFunction);
        }
        (0, ts_1.setEmitFlags)(memberFunction, 3072 /* EmitFlags.NoComments */);
        (0, ts_1.setSourceMapRange)(memberFunction, sourceMapRange);
        var statement = (0, ts_1.setTextRange)(factory.createExpressionStatement(e), /*location*/ member);
        (0, ts_1.setOriginalNode)(statement, member);
        (0, ts_1.setCommentRange)(statement, commentRange);
        // The location for the statement is used to emit comments only.
        // No source map should be emitted for this statement to align with the
        // old emitter.
        (0, ts_1.setEmitFlags)(statement, 96 /* EmitFlags.NoSourceMap */);
        return statement;
    }
    /**
     * Transforms a set of related of get/set accessors into a statement for a class body function.
     *
     * @param receiver The receiver for the member.
     * @param accessors The set of related get/set accessors.
     */
    function transformAccessorsToStatement(receiver, accessors, container) {
        var statement = factory.createExpressionStatement(transformAccessorsToExpression(receiver, accessors, container, /*startsOnNewLine*/ false));
        // The location for the statement is used to emit source maps only.
        // No comments should be emitted for this statement to align with the
        // old emitter.
        (0, ts_1.setEmitFlags)(statement, 3072 /* EmitFlags.NoComments */);
        (0, ts_1.setSourceMapRange)(statement, (0, ts_1.getSourceMapRange)(accessors.firstAccessor));
        return statement;
    }
    /**
     * Transforms a set of related get/set accessors into an expression for either a class
     * body function or an ObjectLiteralExpression with computed properties.
     *
     * @param receiver The receiver for the member.
     */
    function transformAccessorsToExpression(receiver, _a, container, startsOnNewLine) {
        var firstAccessor = _a.firstAccessor, getAccessor = _a.getAccessor, setAccessor = _a.setAccessor;
        // To align with source maps in the old emitter, the receiver and property name
        // arguments are both mapped contiguously to the accessor name.
        // TODO(rbuckton): Does this need to be parented?
        var target = (0, ts_1.setParent)((0, ts_1.setTextRange)(factory.cloneNode(receiver), receiver), receiver.parent);
        (0, ts_1.setEmitFlags)(target, 3072 /* EmitFlags.NoComments */ | 64 /* EmitFlags.NoTrailingSourceMap */);
        (0, ts_1.setSourceMapRange)(target, firstAccessor.name);
        var visitedAccessorName = (0, ts_1.visitNode)(firstAccessor.name, visitor, ts_1.isPropertyName);
        ts_1.Debug.assert(visitedAccessorName);
        if ((0, ts_1.isPrivateIdentifier)(visitedAccessorName)) {
            return ts_1.Debug.failBadSyntaxKind(visitedAccessorName, "Encountered unhandled private identifier while transforming ES2015.");
        }
        var propertyName = (0, ts_1.createExpressionForPropertyName)(factory, visitedAccessorName);
        (0, ts_1.setEmitFlags)(propertyName, 3072 /* EmitFlags.NoComments */ | 32 /* EmitFlags.NoLeadingSourceMap */);
        (0, ts_1.setSourceMapRange)(propertyName, firstAccessor.name);
        var properties = [];
        if (getAccessor) {
            var getterFunction = transformFunctionLikeToExpression(getAccessor, /*location*/ undefined, /*name*/ undefined, container);
            (0, ts_1.setSourceMapRange)(getterFunction, (0, ts_1.getSourceMapRange)(getAccessor));
            (0, ts_1.setEmitFlags)(getterFunction, 1024 /* EmitFlags.NoLeadingComments */);
            var getter = factory.createPropertyAssignment("get", getterFunction);
            (0, ts_1.setCommentRange)(getter, (0, ts_1.getCommentRange)(getAccessor));
            properties.push(getter);
        }
        if (setAccessor) {
            var setterFunction = transformFunctionLikeToExpression(setAccessor, /*location*/ undefined, /*name*/ undefined, container);
            (0, ts_1.setSourceMapRange)(setterFunction, (0, ts_1.getSourceMapRange)(setAccessor));
            (0, ts_1.setEmitFlags)(setterFunction, 1024 /* EmitFlags.NoLeadingComments */);
            var setter = factory.createPropertyAssignment("set", setterFunction);
            (0, ts_1.setCommentRange)(setter, (0, ts_1.getCommentRange)(setAccessor));
            properties.push(setter);
        }
        properties.push(factory.createPropertyAssignment("enumerable", getAccessor || setAccessor ? factory.createFalse() : factory.createTrue()), factory.createPropertyAssignment("configurable", factory.createTrue()));
        var call = factory.createCallExpression(factory.createPropertyAccessExpression(factory.createIdentifier("Object"), "defineProperty"), 
        /*typeArguments*/ undefined, [
            target,
            propertyName,
            factory.createObjectLiteralExpression(properties, /*multiLine*/ true)
        ]);
        if (startsOnNewLine) {
            (0, ts_1.startOnNewLine)(call);
        }
        return call;
    }
    /**
     * Visits an ArrowFunction and transforms it into a FunctionExpression.
     *
     * @param node An ArrowFunction node.
     */
    function visitArrowFunction(node) {
        if (node.transformFlags & 16384 /* TransformFlags.ContainsLexicalThis */ && !(hierarchyFacts & 16384 /* HierarchyFacts.StaticInitializer */)) {
            hierarchyFacts |= 65536 /* HierarchyFacts.CapturedLexicalThis */;
        }
        var savedConvertedLoopState = convertedLoopState;
        convertedLoopState = undefined;
        var ancestorFacts = enterSubtree(15232 /* HierarchyFacts.ArrowFunctionExcludes */, 66 /* HierarchyFacts.ArrowFunctionIncludes */);
        var func = factory.createFunctionExpression(
        /*modifiers*/ undefined, 
        /*asteriskToken*/ undefined, 
        /*name*/ undefined, 
        /*typeParameters*/ undefined, (0, ts_1.visitParameterList)(node.parameters, visitor, context), 
        /*type*/ undefined, transformFunctionBody(node));
        (0, ts_1.setTextRange)(func, node);
        (0, ts_1.setOriginalNode)(func, node);
        (0, ts_1.setEmitFlags)(func, 16 /* EmitFlags.CapturesThis */);
        // If an arrow function contains
        exitSubtree(ancestorFacts, 0 /* HierarchyFacts.ArrowFunctionSubtreeExcludes */, 0 /* HierarchyFacts.None */);
        convertedLoopState = savedConvertedLoopState;
        return func;
    }
    /**
     * Visits a FunctionExpression node.
     *
     * @param node a FunctionExpression node.
     */
    function visitFunctionExpression(node) {
        var ancestorFacts = (0, ts_1.getEmitFlags)(node) & 524288 /* EmitFlags.AsyncFunctionBody */
            ? enterSubtree(32662 /* HierarchyFacts.AsyncFunctionBodyExcludes */, 69 /* HierarchyFacts.AsyncFunctionBodyIncludes */)
            : enterSubtree(32670 /* HierarchyFacts.FunctionExcludes */, 65 /* HierarchyFacts.FunctionIncludes */);
        var savedConvertedLoopState = convertedLoopState;
        convertedLoopState = undefined;
        var parameters = (0, ts_1.visitParameterList)(node.parameters, visitor, context);
        var body = transformFunctionBody(node);
        var name = hierarchyFacts & 32768 /* HierarchyFacts.NewTarget */
            ? factory.getLocalName(node)
            : node.name;
        exitSubtree(ancestorFacts, 98304 /* HierarchyFacts.FunctionSubtreeExcludes */, 0 /* HierarchyFacts.None */);
        convertedLoopState = savedConvertedLoopState;
        return factory.updateFunctionExpression(node, 
        /*modifiers*/ undefined, node.asteriskToken, name, 
        /*typeParameters*/ undefined, parameters, 
        /*type*/ undefined, body);
    }
    /**
     * Visits a FunctionDeclaration node.
     *
     * @param node a FunctionDeclaration node.
     */
    function visitFunctionDeclaration(node) {
        var savedConvertedLoopState = convertedLoopState;
        convertedLoopState = undefined;
        var ancestorFacts = enterSubtree(32670 /* HierarchyFacts.FunctionExcludes */, 65 /* HierarchyFacts.FunctionIncludes */);
        var parameters = (0, ts_1.visitParameterList)(node.parameters, visitor, context);
        var body = transformFunctionBody(node);
        var name = hierarchyFacts & 32768 /* HierarchyFacts.NewTarget */
            ? factory.getLocalName(node)
            : node.name;
        exitSubtree(ancestorFacts, 98304 /* HierarchyFacts.FunctionSubtreeExcludes */, 0 /* HierarchyFacts.None */);
        convertedLoopState = savedConvertedLoopState;
        return factory.updateFunctionDeclaration(node, (0, ts_1.visitNodes)(node.modifiers, visitor, ts_1.isModifier), node.asteriskToken, name, 
        /*typeParameters*/ undefined, parameters, 
        /*type*/ undefined, body);
    }
    /**
     * Transforms a function-like node into a FunctionExpression.
     *
     * @param node The function-like node to transform.
     * @param location The source-map location for the new FunctionExpression.
     * @param name The name of the new FunctionExpression.
     */
    function transformFunctionLikeToExpression(node, location, name, container) {
        var savedConvertedLoopState = convertedLoopState;
        convertedLoopState = undefined;
        var ancestorFacts = container && (0, ts_1.isClassLike)(container) && !(0, ts_1.isStatic)(node)
            ? enterSubtree(32670 /* HierarchyFacts.FunctionExcludes */, 65 /* HierarchyFacts.FunctionIncludes */ | 8 /* HierarchyFacts.NonStaticClassElement */)
            : enterSubtree(32670 /* HierarchyFacts.FunctionExcludes */, 65 /* HierarchyFacts.FunctionIncludes */);
        var parameters = (0, ts_1.visitParameterList)(node.parameters, visitor, context);
        var body = transformFunctionBody(node);
        if (hierarchyFacts & 32768 /* HierarchyFacts.NewTarget */ && !name && (node.kind === 261 /* SyntaxKind.FunctionDeclaration */ || node.kind === 217 /* SyntaxKind.FunctionExpression */)) {
            name = factory.getGeneratedNameForNode(node);
        }
        exitSubtree(ancestorFacts, 98304 /* HierarchyFacts.FunctionSubtreeExcludes */, 0 /* HierarchyFacts.None */);
        convertedLoopState = savedConvertedLoopState;
        return (0, ts_1.setOriginalNode)((0, ts_1.setTextRange)(factory.createFunctionExpression(
        /*modifiers*/ undefined, node.asteriskToken, name, 
        /*typeParameters*/ undefined, parameters, 
        /*type*/ undefined, body), location), 
        /*original*/ node);
    }
    /**
     * Transforms the body of a function-like node.
     *
     * @param node A function-like node.
     */
    function transformFunctionBody(node) {
        var multiLine = false; // indicates whether the block *must* be emitted as multiple lines
        var singleLine = false; // indicates whether the block *may* be emitted as a single line
        var statementsLocation;
        var closeBraceLocation;
        var prologue = [];
        var statements = [];
        var body = node.body;
        var statementOffset;
        resumeLexicalEnvironment();
        if ((0, ts_1.isBlock)(body)) {
            // ensureUseStrict is false because no new prologue-directive should be added.
            // addStandardPrologue will put already-existing directives at the beginning of the target statement-array
            statementOffset = factory.copyStandardPrologue(body.statements, prologue, 0, /*ensureUseStrict*/ false);
            statementOffset = factory.copyCustomPrologue(body.statements, statements, statementOffset, visitor, ts_1.isHoistedFunction);
            statementOffset = factory.copyCustomPrologue(body.statements, statements, statementOffset, visitor, ts_1.isHoistedVariableStatement);
        }
        multiLine = addDefaultValueAssignmentsIfNeeded(statements, node) || multiLine;
        multiLine = addRestParameterIfNeeded(statements, node, /*inConstructorWithSynthesizedSuper*/ false) || multiLine;
        if ((0, ts_1.isBlock)(body)) {
            // addCustomPrologue puts already-existing directives at the beginning of the target statement-array
            statementOffset = factory.copyCustomPrologue(body.statements, statements, statementOffset, visitor);
            statementsLocation = body.statements;
            (0, ts_1.addRange)(statements, (0, ts_1.visitNodes)(body.statements, visitor, ts_1.isStatement, statementOffset));
            // If the original body was a multi-line block, this must be a multi-line block.
            if (!multiLine && body.multiLine) {
                multiLine = true;
            }
        }
        else {
            ts_1.Debug.assert(node.kind === 218 /* SyntaxKind.ArrowFunction */);
            // To align with the old emitter, we use a synthetic end position on the location
            // for the statement list we synthesize when we down-level an arrow function with
            // an expression function body. This prevents both comments and source maps from
            // being emitted for the end position only.
            statementsLocation = (0, ts_1.moveRangeEnd)(body, -1);
            var equalsGreaterThanToken = node.equalsGreaterThanToken;
            if (!(0, ts_1.nodeIsSynthesized)(equalsGreaterThanToken) && !(0, ts_1.nodeIsSynthesized)(body)) {
                if ((0, ts_1.rangeEndIsOnSameLineAsRangeStart)(equalsGreaterThanToken, body, currentSourceFile)) {
                    singleLine = true;
                }
                else {
                    multiLine = true;
                }
            }
            var expression = (0, ts_1.visitNode)(body, visitor, ts_1.isExpression);
            var returnStatement = factory.createReturnStatement(expression);
            (0, ts_1.setTextRange)(returnStatement, body);
            (0, ts_1.moveSyntheticComments)(returnStatement, body);
            (0, ts_1.setEmitFlags)(returnStatement, 768 /* EmitFlags.NoTokenSourceMaps */ | 64 /* EmitFlags.NoTrailingSourceMap */ | 2048 /* EmitFlags.NoTrailingComments */);
            statements.push(returnStatement);
            // To align with the source map emit for the old emitter, we set a custom
            // source map location for the close brace.
            closeBraceLocation = body;
        }
        factory.mergeLexicalEnvironment(prologue, endLexicalEnvironment());
        insertCaptureNewTargetIfNeeded(prologue, node, /*copyOnWrite*/ false);
        insertCaptureThisForNodeIfNeeded(prologue, node);
        // If we added any final generated statements, this must be a multi-line block
        if ((0, ts_1.some)(prologue)) {
            multiLine = true;
        }
        statements.unshift.apply(statements, prologue);
        if ((0, ts_1.isBlock)(body) && (0, ts_1.arrayIsEqualTo)(statements, body.statements)) {
            // no changes were made, preserve the tree
            return body;
        }
        var block = factory.createBlock((0, ts_1.setTextRange)(factory.createNodeArray(statements), statementsLocation), multiLine);
        (0, ts_1.setTextRange)(block, node.body);
        if (!multiLine && singleLine) {
            (0, ts_1.setEmitFlags)(block, 1 /* EmitFlags.SingleLine */);
        }
        if (closeBraceLocation) {
            (0, ts_1.setTokenSourceMapRange)(block, 20 /* SyntaxKind.CloseBraceToken */, closeBraceLocation);
        }
        (0, ts_1.setOriginalNode)(block, node.body);
        return block;
    }
    function visitBlock(node, isFunctionBody) {
        if (isFunctionBody) {
            // A function body is not a block scope.
            return (0, ts_1.visitEachChild)(node, visitor, context);
        }
        var ancestorFacts = hierarchyFacts & 256 /* HierarchyFacts.IterationStatement */
            ? enterSubtree(7104 /* HierarchyFacts.IterationStatementBlockExcludes */, 512 /* HierarchyFacts.IterationStatementBlockIncludes */)
            : enterSubtree(6976 /* HierarchyFacts.BlockExcludes */, 128 /* HierarchyFacts.BlockIncludes */);
        var updated = (0, ts_1.visitEachChild)(node, visitor, context);
        exitSubtree(ancestorFacts, 0 /* HierarchyFacts.None */, 0 /* HierarchyFacts.None */);
        return updated;
    }
    /**
     * Visits an ExpressionStatement that contains a destructuring assignment.
     *
     * @param node An ExpressionStatement node.
     */
    function visitExpressionStatement(node) {
        return (0, ts_1.visitEachChild)(node, visitorWithUnusedExpressionResult, context);
    }
    /**
     * Visits a ParenthesizedExpression that may contain a destructuring assignment.
     *
     * @param node A ParenthesizedExpression node.
     * @param expressionResultIsUnused Indicates the result of an expression is unused by the parent node (i.e., the left side of a comma or the
     * expression of an `ExpressionStatement`).
     */
    function visitParenthesizedExpression(node, expressionResultIsUnused) {
        return (0, ts_1.visitEachChild)(node, expressionResultIsUnused ? visitorWithUnusedExpressionResult : visitor, context);
    }
    /**
     * Visits a BinaryExpression that contains a destructuring assignment.
     *
     * @param node A BinaryExpression node.
     * @param expressionResultIsUnused Indicates the result of an expression is unused by the parent node (i.e., the left side of a comma or the
     * expression of an `ExpressionStatement`).
     */
    function visitBinaryExpression(node, expressionResultIsUnused) {
        // If we are here it is because this is a destructuring assignment.
        if ((0, ts_1.isDestructuringAssignment)(node)) {
            return (0, ts_1.flattenDestructuringAssignment)(node, visitor, context, 0 /* FlattenLevel.All */, !expressionResultIsUnused);
        }
        if (node.operatorToken.kind === 28 /* SyntaxKind.CommaToken */) {
            return factory.updateBinaryExpression(node, ts_1.Debug.checkDefined((0, ts_1.visitNode)(node.left, visitorWithUnusedExpressionResult, ts_1.isExpression)), node.operatorToken, ts_1.Debug.checkDefined((0, ts_1.visitNode)(node.right, expressionResultIsUnused ? visitorWithUnusedExpressionResult : visitor, ts_1.isExpression)));
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
                ts_1.Debug.assert(visited);
                result.push(visited);
            }
        }
        var elements = result ? (0, ts_1.setTextRange)(factory.createNodeArray(result), node.elements) : node.elements;
        return factory.updateCommaListExpression(node, elements);
    }
    function isVariableStatementOfTypeScriptClassWrapper(node) {
        return node.declarationList.declarations.length === 1
            && !!node.declarationList.declarations[0].initializer
            && !!((0, ts_1.getInternalEmitFlags)(node.declarationList.declarations[0].initializer) & 1 /* InternalEmitFlags.TypeScriptClassWrapper */);
    }
    function visitVariableStatement(node) {
        var ancestorFacts = enterSubtree(0 /* HierarchyFacts.None */, (0, ts_1.hasSyntacticModifier)(node, 1 /* ModifierFlags.Export */) ? 32 /* HierarchyFacts.ExportedVariableStatement */ : 0 /* HierarchyFacts.None */);
        var updated;
        if (convertedLoopState && (node.declarationList.flags & 3 /* NodeFlags.BlockScoped */) === 0 && !isVariableStatementOfTypeScriptClassWrapper(node)) {
            // we are inside a converted loop - hoist variable declarations
            var assignments = void 0;
            for (var _i = 0, _a = node.declarationList.declarations; _i < _a.length; _i++) {
                var decl = _a[_i];
                hoistVariableDeclarationDeclaredInConvertedLoop(convertedLoopState, decl);
                if (decl.initializer) {
                    var assignment = void 0;
                    if ((0, ts_1.isBindingPattern)(decl.name)) {
                        assignment = (0, ts_1.flattenDestructuringAssignment)(decl, visitor, context, 0 /* FlattenLevel.All */);
                    }
                    else {
                        assignment = factory.createBinaryExpression(decl.name, 64 /* SyntaxKind.EqualsToken */, ts_1.Debug.checkDefined((0, ts_1.visitNode)(decl.initializer, visitor, ts_1.isExpression)));
                        (0, ts_1.setTextRange)(assignment, decl);
                    }
                    assignments = (0, ts_1.append)(assignments, assignment);
                }
            }
            if (assignments) {
                updated = (0, ts_1.setTextRange)(factory.createExpressionStatement(factory.inlineExpressions(assignments)), node);
            }
            else {
                // none of declarations has initializer - the entire variable statement can be deleted
                updated = undefined;
            }
        }
        else {
            updated = (0, ts_1.visitEachChild)(node, visitor, context);
        }
        exitSubtree(ancestorFacts, 0 /* HierarchyFacts.None */, 0 /* HierarchyFacts.None */);
        return updated;
    }
    /**
     * Visits a VariableDeclarationList that is block scoped (e.g. `let` or `const`).
     *
     * @param node A VariableDeclarationList node.
     */
    function visitVariableDeclarationList(node) {
        if (node.flags & 3 /* NodeFlags.BlockScoped */ || node.transformFlags & 524288 /* TransformFlags.ContainsBindingPattern */) {
            if (node.flags & 3 /* NodeFlags.BlockScoped */) {
                enableSubstitutionsForBlockScopedBindings();
            }
            var declarations = (0, ts_1.visitNodes)(node.declarations, node.flags & 1 /* NodeFlags.Let */
                ? visitVariableDeclarationInLetDeclarationList
                : visitVariableDeclaration, ts_1.isVariableDeclaration);
            var declarationList = factory.createVariableDeclarationList(declarations);
            (0, ts_1.setOriginalNode)(declarationList, node);
            (0, ts_1.setTextRange)(declarationList, node);
            (0, ts_1.setCommentRange)(declarationList, node);
            // If the first or last declaration is a binding pattern, we need to modify
            // the source map range for the declaration list.
            if (node.transformFlags & 524288 /* TransformFlags.ContainsBindingPattern */
                && ((0, ts_1.isBindingPattern)(node.declarations[0].name) || (0, ts_1.isBindingPattern)((0, ts_1.last)(node.declarations).name))) {
                (0, ts_1.setSourceMapRange)(declarationList, getRangeUnion(declarations));
            }
            return declarationList;
        }
        return (0, ts_1.visitEachChild)(node, visitor, context);
    }
    function getRangeUnion(declarations) {
        // declarations may not be sorted by position.
        // pos should be the minimum* position over all nodes (that's not -1), end should be the maximum end over all nodes.
        var pos = -1, end = -1;
        for (var _i = 0, declarations_1 = declarations; _i < declarations_1.length; _i++) {
            var node = declarations_1[_i];
            pos = pos === -1 ? node.pos : node.pos === -1 ? pos : Math.min(pos, node.pos);
            end = Math.max(end, node.end);
        }
        return (0, ts_1.createRange)(pos, end);
    }
    /**
     * Gets a value indicating whether we should emit an explicit initializer for a variable
     * declaration in a `let` declaration list.
     *
     * @param node A VariableDeclaration node.
     */
    function shouldEmitExplicitInitializerForLetDeclaration(node) {
        // Nested let bindings might need to be initialized explicitly to preserve
        // ES6 semantic:
        //
        //  { let x = 1; }
        //  { let x; } // x here should be undefined. not 1
        //
        // Top level bindings never collide with anything and thus don't require
        // explicit initialization. As for nested let bindings there are two cases:
        //
        // - Nested let bindings that were not renamed definitely should be
        //   initialized explicitly:
        //
        //    { let x = 1; }
        //    { let x; if (some-condition) { x = 1}; if (x) { /*1*/ } }
        //
        //   Without explicit initialization code in /*1*/ can be executed even if
        //   some-condition is evaluated to false.
        //
        // - Renaming introduces fresh name that should not collide with any
        //   existing names, however renamed bindings sometimes also should be
        //   explicitly initialized. One particular case: non-captured binding
        //   declared inside loop body (but not in loop initializer):
        //
        //    let x;
        //    for (;;) {
        //        let x;
        //    }
        //
        //   In downlevel codegen inner 'x' will be renamed so it won't collide
        //   with outer 'x' however it will should be reset on every iteration as
        //   if it was declared anew.
        //
        //   * Why non-captured binding?
        //     - Because if loop contains block scoped binding captured in some
        //       function then loop body will be rewritten to have a fresh scope
        //       on every iteration so everything will just work.
        //
        //   * Why loop initializer is excluded?
        //     - Since we've introduced a fresh name it already will be undefined.
        var flags = resolver.getNodeCheckFlags(node);
        var isCapturedInFunction = flags & 16384 /* NodeCheckFlags.CapturedBlockScopedBinding */;
        var isDeclaredInLoop = flags & 32768 /* NodeCheckFlags.BlockScopedBindingInLoop */;
        var emittedAsTopLevel = (hierarchyFacts & 64 /* HierarchyFacts.TopLevel */) !== 0
            || (isCapturedInFunction
                && isDeclaredInLoop
                && (hierarchyFacts & 512 /* HierarchyFacts.IterationStatementBlock */) !== 0);
        var emitExplicitInitializer = !emittedAsTopLevel
            && (hierarchyFacts & 4096 /* HierarchyFacts.ForInOrForOfStatement */) === 0
            && (!resolver.isDeclarationWithCollidingName(node)
                || (isDeclaredInLoop
                    && !isCapturedInFunction
                    && (hierarchyFacts & (2048 /* HierarchyFacts.ForStatement */ | 4096 /* HierarchyFacts.ForInOrForOfStatement */)) === 0));
        return emitExplicitInitializer;
    }
    /**
     * Visits a VariableDeclaration in a `let` declaration list.
     *
     * @param node A VariableDeclaration node.
     */
    function visitVariableDeclarationInLetDeclarationList(node) {
        // For binding pattern names that lack initializers there is no point to emit
        // explicit initializer since downlevel codegen for destructuring will fail
        // in the absence of initializer so all binding elements will say uninitialized
        var name = node.name;
        if ((0, ts_1.isBindingPattern)(name)) {
            return visitVariableDeclaration(node);
        }
        if (!node.initializer && shouldEmitExplicitInitializerForLetDeclaration(node)) {
            return factory.updateVariableDeclaration(node, node.name, /*exclamationToken*/ undefined, /*type*/ undefined, factory.createVoidZero());
        }
        return (0, ts_1.visitEachChild)(node, visitor, context);
    }
    /**
     * Visits a VariableDeclaration node with a binding pattern.
     *
     * @param node A VariableDeclaration node.
     */
    function visitVariableDeclaration(node) {
        var ancestorFacts = enterSubtree(32 /* HierarchyFacts.ExportedVariableStatement */, 0 /* HierarchyFacts.None */);
        var updated;
        if ((0, ts_1.isBindingPattern)(node.name)) {
            updated = (0, ts_1.flattenDestructuringBinding)(node, visitor, context, 0 /* FlattenLevel.All */, 
            /*rval*/ undefined, (ancestorFacts & 32 /* HierarchyFacts.ExportedVariableStatement */) !== 0);
        }
        else {
            updated = (0, ts_1.visitEachChild)(node, visitor, context);
        }
        exitSubtree(ancestorFacts, 0 /* HierarchyFacts.None */, 0 /* HierarchyFacts.None */);
        return updated;
    }
    function recordLabel(node) {
        convertedLoopState.labels.set((0, ts_1.idText)(node.label), true);
    }
    function resetLabel(node) {
        convertedLoopState.labels.set((0, ts_1.idText)(node.label), false);
    }
    function visitLabeledStatement(node) {
        if (convertedLoopState && !convertedLoopState.labels) {
            convertedLoopState.labels = new Map();
        }
        var statement = (0, ts_1.unwrapInnermostStatementOfLabel)(node, convertedLoopState && recordLabel);
        return (0, ts_1.isIterationStatement)(statement, /*lookInLabeledStatements*/ false)
            ? visitIterationStatement(statement, /*outermostLabeledStatement*/ node)
            : factory.restoreEnclosingLabel(ts_1.Debug.checkDefined((0, ts_1.visitNode)(statement, visitor, ts_1.isStatement, factory.liftToBlock)), node, convertedLoopState && resetLabel);
    }
    function visitIterationStatement(node, outermostLabeledStatement) {
        switch (node.kind) {
            case 245 /* SyntaxKind.DoStatement */:
            case 246 /* SyntaxKind.WhileStatement */:
                return visitDoOrWhileStatement(node, outermostLabeledStatement);
            case 247 /* SyntaxKind.ForStatement */:
                return visitForStatement(node, outermostLabeledStatement);
            case 248 /* SyntaxKind.ForInStatement */:
                return visitForInStatement(node, outermostLabeledStatement);
            case 249 /* SyntaxKind.ForOfStatement */:
                return visitForOfStatement(node, outermostLabeledStatement);
        }
    }
    function visitIterationStatementWithFacts(excludeFacts, includeFacts, node, outermostLabeledStatement, convert) {
        var ancestorFacts = enterSubtree(excludeFacts, includeFacts);
        var updated = convertIterationStatementBodyIfNecessary(node, outermostLabeledStatement, ancestorFacts, convert);
        exitSubtree(ancestorFacts, 0 /* HierarchyFacts.None */, 0 /* HierarchyFacts.None */);
        return updated;
    }
    function visitDoOrWhileStatement(node, outermostLabeledStatement) {
        return visitIterationStatementWithFacts(0 /* HierarchyFacts.DoOrWhileStatementExcludes */, 1280 /* HierarchyFacts.DoOrWhileStatementIncludes */, node, outermostLabeledStatement);
    }
    function visitForStatement(node, outermostLabeledStatement) {
        return visitIterationStatementWithFacts(5056 /* HierarchyFacts.ForStatementExcludes */, 3328 /* HierarchyFacts.ForStatementIncludes */, node, outermostLabeledStatement);
    }
    function visitEachChildOfForStatement(node) {
        return factory.updateForStatement(node, (0, ts_1.visitNode)(node.initializer, visitorWithUnusedExpressionResult, ts_1.isForInitializer), (0, ts_1.visitNode)(node.condition, visitor, ts_1.isExpression), (0, ts_1.visitNode)(node.incrementor, visitorWithUnusedExpressionResult, ts_1.isExpression), ts_1.Debug.checkDefined((0, ts_1.visitNode)(node.statement, visitor, ts_1.isStatement, factory.liftToBlock)));
    }
    function visitForInStatement(node, outermostLabeledStatement) {
        return visitIterationStatementWithFacts(3008 /* HierarchyFacts.ForInOrForOfStatementExcludes */, 5376 /* HierarchyFacts.ForInOrForOfStatementIncludes */, node, outermostLabeledStatement);
    }
    function visitForOfStatement(node, outermostLabeledStatement) {
        return visitIterationStatementWithFacts(3008 /* HierarchyFacts.ForInOrForOfStatementExcludes */, 5376 /* HierarchyFacts.ForInOrForOfStatementIncludes */, node, outermostLabeledStatement, compilerOptions.downlevelIteration ? convertForOfStatementForIterable : convertForOfStatementForArray);
    }
    function convertForOfStatementHead(node, boundValue, convertedLoopBodyStatements) {
        var statements = [];
        var initializer = node.initializer;
        if ((0, ts_1.isVariableDeclarationList)(initializer)) {
            if (node.initializer.flags & 3 /* NodeFlags.BlockScoped */) {
                enableSubstitutionsForBlockScopedBindings();
            }
            var firstOriginalDeclaration = (0, ts_1.firstOrUndefined)(initializer.declarations);
            if (firstOriginalDeclaration && (0, ts_1.isBindingPattern)(firstOriginalDeclaration.name)) {
                // This works whether the declaration is a var, let, or const.
                // It will use rhsIterationValue _a[_i] as the initializer.
                var declarations = (0, ts_1.flattenDestructuringBinding)(firstOriginalDeclaration, visitor, context, 0 /* FlattenLevel.All */, boundValue);
                var declarationList = (0, ts_1.setTextRange)(factory.createVariableDeclarationList(declarations), node.initializer);
                (0, ts_1.setOriginalNode)(declarationList, node.initializer);
                // Adjust the source map range for the first declaration to align with the old
                // emitter.
                (0, ts_1.setSourceMapRange)(declarationList, (0, ts_1.createRange)(declarations[0].pos, (0, ts_1.last)(declarations).end));
                statements.push(factory.createVariableStatement(
                /*modifiers*/ undefined, declarationList));
            }
            else {
                // The following call does not include the initializer, so we have
                // to emit it separately.
                statements.push((0, ts_1.setTextRange)(factory.createVariableStatement(
                /*modifiers*/ undefined, (0, ts_1.setOriginalNode)((0, ts_1.setTextRange)(factory.createVariableDeclarationList([
                    factory.createVariableDeclaration(firstOriginalDeclaration ? firstOriginalDeclaration.name : factory.createTempVariable(/*recordTempVariable*/ undefined), 
                    /*exclamationToken*/ undefined, 
                    /*type*/ undefined, boundValue)
                ]), (0, ts_1.moveRangePos)(initializer, -1)), initializer)), (0, ts_1.moveRangeEnd)(initializer, -1)));
            }
        }
        else {
            // Initializer is an expression. Emit the expression in the body, so that it's
            // evaluated on every iteration.
            var assignment = factory.createAssignment(initializer, boundValue);
            if ((0, ts_1.isDestructuringAssignment)(assignment)) {
                statements.push(factory.createExpressionStatement(visitBinaryExpression(assignment, /*expressionResultIsUnused*/ true)));
            }
            else {
                (0, ts_1.setTextRangeEnd)(assignment, initializer.end);
                statements.push((0, ts_1.setTextRange)(factory.createExpressionStatement(ts_1.Debug.checkDefined((0, ts_1.visitNode)(assignment, visitor, ts_1.isExpression))), (0, ts_1.moveRangeEnd)(initializer, -1)));
            }
        }
        if (convertedLoopBodyStatements) {
            return createSyntheticBlockForConvertedStatements((0, ts_1.addRange)(statements, convertedLoopBodyStatements));
        }
        else {
            var statement = (0, ts_1.visitNode)(node.statement, visitor, ts_1.isStatement, factory.liftToBlock);
            ts_1.Debug.assert(statement);
            if ((0, ts_1.isBlock)(statement)) {
                return factory.updateBlock(statement, (0, ts_1.setTextRange)(factory.createNodeArray((0, ts_1.concatenate)(statements, statement.statements)), statement.statements));
            }
            else {
                statements.push(statement);
                return createSyntheticBlockForConvertedStatements(statements);
            }
        }
    }
    function createSyntheticBlockForConvertedStatements(statements) {
        return (0, ts_1.setEmitFlags)(factory.createBlock(factory.createNodeArray(statements), 
        /*multiLine*/ true), 96 /* EmitFlags.NoSourceMap */ | 768 /* EmitFlags.NoTokenSourceMaps */);
    }
    function convertForOfStatementForArray(node, outermostLabeledStatement, convertedLoopBodyStatements) {
        // The following ES6 code:
        //
        //    for (let v of expr) { }
        //
        // should be emitted as
        //
        //    for (var _i = 0, _a = expr; _i < _a.length; _i++) {
        //        var v = _a[_i];
        //    }
        //
        // where _a and _i are temps emitted to capture the RHS and the counter,
        // respectively.
        // When the left hand side is an expression instead of a let declaration,
        // the "let v" is not emitted.
        // When the left hand side is a let/const, the v is renamed if there is
        // another v in scope.
        // Note that all assignments to the LHS are emitted in the body, including
        // all destructuring.
        // Note also that because an extra statement is needed to assign to the LHS,
        // for-of bodies are always emitted as blocks.
        var expression = (0, ts_1.visitNode)(node.expression, visitor, ts_1.isExpression);
        ts_1.Debug.assert(expression);
        // In the case where the user wrote an identifier as the RHS, like this:
        //
        //     for (let v of arr) { }
        //
        // we don't want to emit a temporary variable for the RHS, just use it directly.
        var counter = factory.createLoopVariable();
        var rhsReference = (0, ts_1.isIdentifier)(expression) ? factory.getGeneratedNameForNode(expression) : factory.createTempVariable(/*recordTempVariable*/ undefined);
        // The old emitter does not emit source maps for the expression
        (0, ts_1.setEmitFlags)(expression, 96 /* EmitFlags.NoSourceMap */ | (0, ts_1.getEmitFlags)(expression));
        var forStatement = (0, ts_1.setTextRange)(factory.createForStatement(
        /*initializer*/ (0, ts_1.setEmitFlags)((0, ts_1.setTextRange)(factory.createVariableDeclarationList([
            (0, ts_1.setTextRange)(factory.createVariableDeclaration(counter, /*exclamationToken*/ undefined, /*type*/ undefined, factory.createNumericLiteral(0)), (0, ts_1.moveRangePos)(node.expression, -1)),
            (0, ts_1.setTextRange)(factory.createVariableDeclaration(rhsReference, /*exclamationToken*/ undefined, /*type*/ undefined, expression), node.expression)
        ]), node.expression), 4194304 /* EmitFlags.NoHoisting */), 
        /*condition*/ (0, ts_1.setTextRange)(factory.createLessThan(counter, factory.createPropertyAccessExpression(rhsReference, "length")), node.expression), 
        /*incrementor*/ (0, ts_1.setTextRange)(factory.createPostfixIncrement(counter), node.expression), 
        /*statement*/ convertForOfStatementHead(node, factory.createElementAccessExpression(rhsReference, counter), convertedLoopBodyStatements)), 
        /*location*/ node);
        // Disable trailing source maps for the OpenParenToken to align source map emit with the old emitter.
        (0, ts_1.setEmitFlags)(forStatement, 512 /* EmitFlags.NoTokenTrailingSourceMaps */);
        (0, ts_1.setTextRange)(forStatement, node);
        return factory.restoreEnclosingLabel(forStatement, outermostLabeledStatement, convertedLoopState && resetLabel);
    }
    function convertForOfStatementForIterable(node, outermostLabeledStatement, convertedLoopBodyStatements, ancestorFacts) {
        var expression = (0, ts_1.visitNode)(node.expression, visitor, ts_1.isExpression);
        ts_1.Debug.assert(expression);
        var iterator = (0, ts_1.isIdentifier)(expression) ? factory.getGeneratedNameForNode(expression) : factory.createTempVariable(/*recordTempVariable*/ undefined);
        var result = (0, ts_1.isIdentifier)(expression) ? factory.getGeneratedNameForNode(iterator) : factory.createTempVariable(/*recordTempVariable*/ undefined);
        var errorRecord = factory.createUniqueName("e");
        var catchVariable = factory.getGeneratedNameForNode(errorRecord);
        var returnMethod = factory.createTempVariable(/*recordTempVariable*/ undefined);
        var values = (0, ts_1.setTextRange)(emitHelpers().createValuesHelper(expression), node.expression);
        var next = factory.createCallExpression(factory.createPropertyAccessExpression(iterator, "next"), /*typeArguments*/ undefined, []);
        hoistVariableDeclaration(errorRecord);
        hoistVariableDeclaration(returnMethod);
        // if we are enclosed in an outer loop ensure we reset 'errorRecord' per each iteration
        var initializer = ancestorFacts & 1024 /* HierarchyFacts.IterationContainer */
            ? factory.inlineExpressions([factory.createAssignment(errorRecord, factory.createVoidZero()), values])
            : values;
        var forStatement = (0, ts_1.setEmitFlags)((0, ts_1.setTextRange)(factory.createForStatement(
        /*initializer*/ (0, ts_1.setEmitFlags)((0, ts_1.setTextRange)(factory.createVariableDeclarationList([
            (0, ts_1.setTextRange)(factory.createVariableDeclaration(iterator, /*exclamationToken*/ undefined, /*type*/ undefined, initializer), node.expression),
            factory.createVariableDeclaration(result, /*exclamationToken*/ undefined, /*type*/ undefined, next)
        ]), node.expression), 4194304 /* EmitFlags.NoHoisting */), 
        /*condition*/ factory.createLogicalNot(factory.createPropertyAccessExpression(result, "done")), 
        /*incrementor*/ factory.createAssignment(result, next), 
        /*statement*/ convertForOfStatementHead(node, factory.createPropertyAccessExpression(result, "value"), convertedLoopBodyStatements)), 
        /*location*/ node), 512 /* EmitFlags.NoTokenTrailingSourceMaps */);
        return factory.createTryStatement(factory.createBlock([
            factory.restoreEnclosingLabel(forStatement, outermostLabeledStatement, convertedLoopState && resetLabel)
        ]), factory.createCatchClause(factory.createVariableDeclaration(catchVariable), (0, ts_1.setEmitFlags)(factory.createBlock([
            factory.createExpressionStatement(factory.createAssignment(errorRecord, factory.createObjectLiteralExpression([
                factory.createPropertyAssignment("error", catchVariable)
            ])))
        ]), 1 /* EmitFlags.SingleLine */)), factory.createBlock([
            factory.createTryStatement(
            /*tryBlock*/ factory.createBlock([
                (0, ts_1.setEmitFlags)(factory.createIfStatement(factory.createLogicalAnd(factory.createLogicalAnd(result, factory.createLogicalNot(factory.createPropertyAccessExpression(result, "done"))), factory.createAssignment(returnMethod, factory.createPropertyAccessExpression(iterator, "return"))), factory.createExpressionStatement(factory.createFunctionCallCall(returnMethod, iterator, []))), 1 /* EmitFlags.SingleLine */),
            ]), 
            /*catchClause*/ undefined, 
            /*finallyBlock*/ (0, ts_1.setEmitFlags)(factory.createBlock([
                (0, ts_1.setEmitFlags)(factory.createIfStatement(errorRecord, factory.createThrowStatement(factory.createPropertyAccessExpression(errorRecord, "error"))), 1 /* EmitFlags.SingleLine */)
            ]), 1 /* EmitFlags.SingleLine */))
        ]));
    }
    /**
     * Visits an ObjectLiteralExpression with computed property names.
     *
     * @param node An ObjectLiteralExpression node.
     */
    function visitObjectLiteralExpression(node) {
        var properties = node.properties;
        // Find the first computed property.
        // Everything until that point can be emitted as part of the initial object literal.
        var numInitialProperties = -1, hasComputed = false;
        for (var i = 0; i < properties.length; i++) {
            var property = properties[i];
            if ((property.transformFlags & 1048576 /* TransformFlags.ContainsYield */ &&
                hierarchyFacts & 4 /* HierarchyFacts.AsyncFunctionBody */)
                || (hasComputed = ts_1.Debug.checkDefined(property.name).kind === 166 /* SyntaxKind.ComputedPropertyName */)) {
                numInitialProperties = i;
                break;
            }
        }
        if (numInitialProperties < 0) {
            return (0, ts_1.visitEachChild)(node, visitor, context);
        }
        // For computed properties, we need to create a unique handle to the object
        // literal so we can modify it without risking internal assignments tainting the object.
        var temp = factory.createTempVariable(hoistVariableDeclaration);
        // Write out the first non-computed properties, then emit the rest through indexing on the temp variable.
        var expressions = [];
        var assignment = factory.createAssignment(temp, (0, ts_1.setEmitFlags)(factory.createObjectLiteralExpression((0, ts_1.visitNodes)(properties, visitor, ts_1.isObjectLiteralElementLike, 0, numInitialProperties), node.multiLine), hasComputed ? 131072 /* EmitFlags.Indented */ : 0));
        if (node.multiLine) {
            (0, ts_1.startOnNewLine)(assignment);
        }
        expressions.push(assignment);
        addObjectLiteralMembers(expressions, node, temp, numInitialProperties);
        // We need to clone the temporary identifier so that we can write it on a
        // new line
        expressions.push(node.multiLine ? (0, ts_1.startOnNewLine)((0, ts_1.setParent)((0, ts_1.setTextRange)(factory.cloneNode(temp), temp), temp.parent)) : temp);
        return factory.inlineExpressions(expressions);
    }
    function shouldConvertPartOfIterationStatement(node) {
        return (resolver.getNodeCheckFlags(node) & 8192 /* NodeCheckFlags.ContainsCapturedBlockScopeBinding */) !== 0;
    }
    function shouldConvertInitializerOfForStatement(node) {
        return (0, ts_1.isForStatement)(node) && !!node.initializer && shouldConvertPartOfIterationStatement(node.initializer);
    }
    function shouldConvertConditionOfForStatement(node) {
        return (0, ts_1.isForStatement)(node) && !!node.condition && shouldConvertPartOfIterationStatement(node.condition);
    }
    function shouldConvertIncrementorOfForStatement(node) {
        return (0, ts_1.isForStatement)(node) && !!node.incrementor && shouldConvertPartOfIterationStatement(node.incrementor);
    }
    function shouldConvertIterationStatement(node) {
        return shouldConvertBodyOfIterationStatement(node)
            || shouldConvertInitializerOfForStatement(node);
    }
    function shouldConvertBodyOfIterationStatement(node) {
        return (resolver.getNodeCheckFlags(node) & 4096 /* NodeCheckFlags.LoopWithCapturedBlockScopedBinding */) !== 0;
    }
    /**
     * Records constituents of name for the given variable to be hoisted in the outer scope.
     */
    function hoistVariableDeclarationDeclaredInConvertedLoop(state, node) {
        if (!state.hoistedLocalVariables) {
            state.hoistedLocalVariables = [];
        }
        visit(node.name);
        function visit(node) {
            if (node.kind === 80 /* SyntaxKind.Identifier */) {
                state.hoistedLocalVariables.push(node);
            }
            else {
                for (var _i = 0, _a = node.elements; _i < _a.length; _i++) {
                    var element = _a[_i];
                    if (!(0, ts_1.isOmittedExpression)(element)) {
                        visit(element.name);
                    }
                }
            }
        }
    }
    function convertIterationStatementBodyIfNecessary(node, outermostLabeledStatement, ancestorFacts, convert) {
        if (!shouldConvertIterationStatement(node)) {
            var saveAllowedNonLabeledJumps = void 0;
            if (convertedLoopState) {
                // we get here if we are trying to emit normal loop loop inside converted loop
                // set allowedNonLabeledJumps to Break | Continue to mark that break\continue inside the loop should be emitted as is
                saveAllowedNonLabeledJumps = convertedLoopState.allowedNonLabeledJumps;
                convertedLoopState.allowedNonLabeledJumps = 2 /* Jump.Break */ | 4 /* Jump.Continue */;
            }
            var result = convert
                ? convert(node, outermostLabeledStatement, /*convertedLoopBodyStatements*/ undefined, ancestorFacts)
                : factory.restoreEnclosingLabel((0, ts_1.isForStatement)(node) ? visitEachChildOfForStatement(node) : (0, ts_1.visitEachChild)(node, visitor, context), outermostLabeledStatement, convertedLoopState && resetLabel);
            if (convertedLoopState) {
                convertedLoopState.allowedNonLabeledJumps = saveAllowedNonLabeledJumps;
            }
            return result;
        }
        var currentState = createConvertedLoopState(node);
        var statements = [];
        var outerConvertedLoopState = convertedLoopState;
        convertedLoopState = currentState;
        var initializerFunction = shouldConvertInitializerOfForStatement(node) ? createFunctionForInitializerOfForStatement(node, currentState) : undefined;
        var bodyFunction = shouldConvertBodyOfIterationStatement(node) ? createFunctionForBodyOfIterationStatement(node, currentState, outerConvertedLoopState) : undefined;
        convertedLoopState = outerConvertedLoopState;
        if (initializerFunction)
            statements.push(initializerFunction.functionDeclaration);
        if (bodyFunction)
            statements.push(bodyFunction.functionDeclaration);
        addExtraDeclarationsForConvertedLoop(statements, currentState, outerConvertedLoopState);
        if (initializerFunction) {
            statements.push(generateCallToConvertedLoopInitializer(initializerFunction.functionName, initializerFunction.containsYield));
        }
        var loop;
        if (bodyFunction) {
            if (convert) {
                loop = convert(node, outermostLabeledStatement, bodyFunction.part, ancestorFacts);
            }
            else {
                var clone = convertIterationStatementCore(node, initializerFunction, factory.createBlock(bodyFunction.part, /*multiLine*/ true));
                loop = factory.restoreEnclosingLabel(clone, outermostLabeledStatement, convertedLoopState && resetLabel);
            }
        }
        else {
            var clone = convertIterationStatementCore(node, initializerFunction, ts_1.Debug.checkDefined((0, ts_1.visitNode)(node.statement, visitor, ts_1.isStatement, factory.liftToBlock)));
            loop = factory.restoreEnclosingLabel(clone, outermostLabeledStatement, convertedLoopState && resetLabel);
        }
        statements.push(loop);
        return statements;
    }
    function convertIterationStatementCore(node, initializerFunction, convertedLoopBody) {
        switch (node.kind) {
            case 247 /* SyntaxKind.ForStatement */: return convertForStatement(node, initializerFunction, convertedLoopBody);
            case 248 /* SyntaxKind.ForInStatement */: return convertForInStatement(node, convertedLoopBody);
            case 249 /* SyntaxKind.ForOfStatement */: return convertForOfStatement(node, convertedLoopBody);
            case 245 /* SyntaxKind.DoStatement */: return convertDoStatement(node, convertedLoopBody);
            case 246 /* SyntaxKind.WhileStatement */: return convertWhileStatement(node, convertedLoopBody);
            default: return ts_1.Debug.failBadSyntaxKind(node, "IterationStatement expected");
        }
    }
    function convertForStatement(node, initializerFunction, convertedLoopBody) {
        var shouldConvertCondition = node.condition && shouldConvertPartOfIterationStatement(node.condition);
        var shouldConvertIncrementor = shouldConvertCondition || node.incrementor && shouldConvertPartOfIterationStatement(node.incrementor);
        return factory.updateForStatement(node, (0, ts_1.visitNode)(initializerFunction ? initializerFunction.part : node.initializer, visitorWithUnusedExpressionResult, ts_1.isForInitializer), (0, ts_1.visitNode)(shouldConvertCondition ? undefined : node.condition, visitor, ts_1.isExpression), (0, ts_1.visitNode)(shouldConvertIncrementor ? undefined : node.incrementor, visitorWithUnusedExpressionResult, ts_1.isExpression), convertedLoopBody);
    }
    function convertForOfStatement(node, convertedLoopBody) {
        return factory.updateForOfStatement(node, 
        /*awaitModifier*/ undefined, ts_1.Debug.checkDefined((0, ts_1.visitNode)(node.initializer, visitor, ts_1.isForInitializer)), ts_1.Debug.checkDefined((0, ts_1.visitNode)(node.expression, visitor, ts_1.isExpression)), convertedLoopBody);
    }
    function convertForInStatement(node, convertedLoopBody) {
        return factory.updateForInStatement(node, ts_1.Debug.checkDefined((0, ts_1.visitNode)(node.initializer, visitor, ts_1.isForInitializer)), ts_1.Debug.checkDefined((0, ts_1.visitNode)(node.expression, visitor, ts_1.isExpression)), convertedLoopBody);
    }
    function convertDoStatement(node, convertedLoopBody) {
        return factory.updateDoStatement(node, convertedLoopBody, ts_1.Debug.checkDefined((0, ts_1.visitNode)(node.expression, visitor, ts_1.isExpression)));
    }
    function convertWhileStatement(node, convertedLoopBody) {
        return factory.updateWhileStatement(node, ts_1.Debug.checkDefined((0, ts_1.visitNode)(node.expression, visitor, ts_1.isExpression)), convertedLoopBody);
    }
    function createConvertedLoopState(node) {
        var loopInitializer;
        switch (node.kind) {
            case 247 /* SyntaxKind.ForStatement */:
            case 248 /* SyntaxKind.ForInStatement */:
            case 249 /* SyntaxKind.ForOfStatement */:
                var initializer = node.initializer;
                if (initializer && initializer.kind === 260 /* SyntaxKind.VariableDeclarationList */) {
                    loopInitializer = initializer;
                }
                break;
        }
        // variables that will be passed to the loop as parameters
        var loopParameters = [];
        // variables declared in the loop initializer that will be changed inside the loop
        var loopOutParameters = [];
        if (loopInitializer && ((0, ts_1.getCombinedNodeFlags)(loopInitializer) & 3 /* NodeFlags.BlockScoped */)) {
            var hasCapturedBindingsInForHead = shouldConvertInitializerOfForStatement(node) ||
                shouldConvertConditionOfForStatement(node) ||
                shouldConvertIncrementorOfForStatement(node);
            for (var _i = 0, _a = loopInitializer.declarations; _i < _a.length; _i++) {
                var decl = _a[_i];
                processLoopVariableDeclaration(node, decl, loopParameters, loopOutParameters, hasCapturedBindingsInForHead);
            }
        }
        var currentState = { loopParameters: loopParameters, loopOutParameters: loopOutParameters };
        if (convertedLoopState) {
            // convertedOuterLoopState !== undefined means that this converted loop is nested in another converted loop.
            // if outer converted loop has already accumulated some state - pass it through
            if (convertedLoopState.argumentsName) {
                // outer loop has already used 'arguments' so we've already have some name to alias it
                // use the same name in all nested loops
                currentState.argumentsName = convertedLoopState.argumentsName;
            }
            if (convertedLoopState.thisName) {
                // outer loop has already used 'this' so we've already have some name to alias it
                // use the same name in all nested loops
                currentState.thisName = convertedLoopState.thisName;
            }
            if (convertedLoopState.hoistedLocalVariables) {
                // we've already collected some non-block scoped variable declarations in enclosing loop
                // use the same storage in nested loop
                currentState.hoistedLocalVariables = convertedLoopState.hoistedLocalVariables;
            }
        }
        return currentState;
    }
    function addExtraDeclarationsForConvertedLoop(statements, state, outerState) {
        var extraVariableDeclarations;
        // propagate state from the inner loop to the outer loop if necessary
        if (state.argumentsName) {
            // if alias for arguments is set
            if (outerState) {
                // pass it to outer converted loop
                outerState.argumentsName = state.argumentsName;
            }
            else {
                // this is top level converted loop and we need to create an alias for 'arguments' object
                (extraVariableDeclarations || (extraVariableDeclarations = [])).push(factory.createVariableDeclaration(state.argumentsName, 
                /*exclamationToken*/ undefined, 
                /*type*/ undefined, factory.createIdentifier("arguments")));
            }
        }
        if (state.thisName) {
            // if alias for this is set
            if (outerState) {
                // pass it to outer converted loop
                outerState.thisName = state.thisName;
            }
            else {
                // this is top level converted loop so we need to create an alias for 'this' here
                // NOTE:
                // if converted loops were all nested in arrow function then we'll always emit '_this' so convertedLoopState.thisName will not be set.
                // If it is set this means that all nested loops are not nested in arrow function and it is safe to capture 'this'.
                (extraVariableDeclarations || (extraVariableDeclarations = [])).push(factory.createVariableDeclaration(state.thisName, 
                /*exclamationToken*/ undefined, 
                /*type*/ undefined, factory.createIdentifier("this")));
            }
        }
        if (state.hoistedLocalVariables) {
            // if hoistedLocalVariables !== undefined this means that we've possibly collected some variable declarations to be hoisted later
            if (outerState) {
                // pass them to outer converted loop
                outerState.hoistedLocalVariables = state.hoistedLocalVariables;
            }
            else {
                if (!extraVariableDeclarations) {
                    extraVariableDeclarations = [];
                }
                // hoist collected variable declarations
                for (var _i = 0, _a = state.hoistedLocalVariables; _i < _a.length; _i++) {
                    var identifier = _a[_i];
                    extraVariableDeclarations.push(factory.createVariableDeclaration(identifier));
                }
            }
        }
        // add extra variables to hold out parameters if necessary
        if (state.loopOutParameters.length) {
            if (!extraVariableDeclarations) {
                extraVariableDeclarations = [];
            }
            for (var _b = 0, _c = state.loopOutParameters; _b < _c.length; _b++) {
                var outParam = _c[_b];
                extraVariableDeclarations.push(factory.createVariableDeclaration(outParam.outParamName));
            }
        }
        if (state.conditionVariable) {
            if (!extraVariableDeclarations) {
                extraVariableDeclarations = [];
            }
            extraVariableDeclarations.push(factory.createVariableDeclaration(state.conditionVariable, /*exclamationToken*/ undefined, /*type*/ undefined, factory.createFalse()));
        }
        // create variable statement to hold all introduced variable declarations
        if (extraVariableDeclarations) {
            statements.push(factory.createVariableStatement(
            /*modifiers*/ undefined, factory.createVariableDeclarationList(extraVariableDeclarations)));
        }
    }
    function createOutVariable(p) {
        return factory.createVariableDeclaration(p.originalName, /*exclamationToken*/ undefined, /*type*/ undefined, p.outParamName);
    }
    /**
     * Creates a `_loop_init` function for a `ForStatement` with a block-scoped initializer
     * that is captured in a closure inside of the initializer. The `_loop_init` function is
     * used to preserve the per-iteration environment semantics of
     * [13.7.4.8 RS: ForBodyEvaluation](https://tc39.github.io/ecma262/#sec-forbodyevaluation).
     */
    function createFunctionForInitializerOfForStatement(node, currentState) {
        var functionName = factory.createUniqueName("_loop_init");
        var containsYield = (node.initializer.transformFlags & 1048576 /* TransformFlags.ContainsYield */) !== 0;
        var emitFlags = 0 /* EmitFlags.None */;
        if (currentState.containsLexicalThis)
            emitFlags |= 16 /* EmitFlags.CapturesThis */;
        if (containsYield && hierarchyFacts & 4 /* HierarchyFacts.AsyncFunctionBody */)
            emitFlags |= 524288 /* EmitFlags.AsyncFunctionBody */;
        var statements = [];
        statements.push(factory.createVariableStatement(/*modifiers*/ undefined, node.initializer));
        copyOutParameters(currentState.loopOutParameters, 2 /* LoopOutParameterFlags.Initializer */, 1 /* CopyDirection.ToOutParameter */, statements);
        // This transforms the following ES2015 syntax:
        //
        //  for (let i = (setImmediate(() => console.log(i)), 0); i < 2; i++) {
        //      // loop body
        //  }
        //
        // Into the following ES5 syntax:
        //
        //  var _loop_init_1 = function () {
        //      var i = (setImmediate(() => console.log(i)), 0);
        //      out_i_1 = i;
        //  };
        //  var out_i_1;
        //  _loop_init_1();
        //  for (var i = out_i_1; i < 2; i++) {
        //      // loop body
        //  }
        //
        // Which prevents mutations to `i` in the per-iteration environment of the body
        // from affecting the initial value for `i` outside of the per-iteration environment.
        var functionDeclaration = factory.createVariableStatement(
        /*modifiers*/ undefined, (0, ts_1.setEmitFlags)(factory.createVariableDeclarationList([
            factory.createVariableDeclaration(functionName, 
            /*exclamationToken*/ undefined, 
            /*type*/ undefined, (0, ts_1.setEmitFlags)(factory.createFunctionExpression(
            /*modifiers*/ undefined, containsYield ? factory.createToken(42 /* SyntaxKind.AsteriskToken */) : undefined, 
            /*name*/ undefined, 
            /*typeParameters*/ undefined, 
            /*parameters*/ undefined, 
            /*type*/ undefined, ts_1.Debug.checkDefined((0, ts_1.visitNode)(factory.createBlock(statements, /*multiLine*/ true), visitor, ts_1.isBlock))), emitFlags))
        ]), 4194304 /* EmitFlags.NoHoisting */));
        var part = factory.createVariableDeclarationList((0, ts_1.map)(currentState.loopOutParameters, createOutVariable));
        return { functionName: functionName, containsYield: containsYield, functionDeclaration: functionDeclaration, part: part };
    }
    /**
     * Creates a `_loop` function for an `IterationStatement` with a block-scoped initializer
     * that is captured in a closure inside of the loop body. The `_loop` function is used to
     * preserve the per-iteration environment semantics of
     * [13.7.4.8 RS: ForBodyEvaluation](https://tc39.github.io/ecma262/#sec-forbodyevaluation).
     */
    function createFunctionForBodyOfIterationStatement(node, currentState, outerState) {
        var functionName = factory.createUniqueName("_loop");
        startLexicalEnvironment();
        var statement = (0, ts_1.visitNode)(node.statement, visitor, ts_1.isStatement, factory.liftToBlock);
        var lexicalEnvironment = endLexicalEnvironment();
        var statements = [];
        if (shouldConvertConditionOfForStatement(node) || shouldConvertIncrementorOfForStatement(node)) {
            // If a block-scoped variable declared in the initializer of `node` is captured in
            // the condition or incrementor, we must move the condition and incrementor into
            // the body of the for loop.
            //
            // This transforms the following ES2015 syntax:
            //
            //  for (let i = 0; setImmediate(() => console.log(i)), i < 2; setImmediate(() => console.log(i)), i++) {
            //      // loop body
            //  }
            //
            // Into the following ES5 syntax:
            //
            //  var _loop_1 = function (i) {
            //      if (inc_1)
            //          setImmediate(() => console.log(i)), i++;
            //      else
            //          inc_1 = true;
            //      if (!(setImmediate(() => console.log(i)), i < 2))
            //          return out_i_1 = i, "break";
            //      // loop body
            //      out_i_1 = i;
            //  }
            //  var out_i_1, inc_1 = false;
            //  for (var i = 0;;) {
            //      var state_1 = _loop_1(i);
            //      i = out_i_1;
            //      if (state_1 === "break")
            //          break;
            //  }
            //
            // Which prevents mutations to `i` in the per-iteration environment of the body
            // from affecting the value of `i` in the previous per-iteration environment.
            //
            // Note that the incrementor of a `for` loop is evaluated in a *new* per-iteration
            // environment that is carried over to the next iteration of the loop. As a result,
            // we must indicate whether this is the first evaluation of the loop body so that
            // we only evaluate the incrementor on subsequent evaluations.
            currentState.conditionVariable = factory.createUniqueName("inc");
            if (node.incrementor) {
                statements.push(factory.createIfStatement(currentState.conditionVariable, factory.createExpressionStatement(ts_1.Debug.checkDefined((0, ts_1.visitNode)(node.incrementor, visitor, ts_1.isExpression))), factory.createExpressionStatement(factory.createAssignment(currentState.conditionVariable, factory.createTrue()))));
            }
            else {
                statements.push(factory.createIfStatement(factory.createLogicalNot(currentState.conditionVariable), factory.createExpressionStatement(factory.createAssignment(currentState.conditionVariable, factory.createTrue()))));
            }
            if (shouldConvertConditionOfForStatement(node)) {
                statements.push(factory.createIfStatement(factory.createPrefixUnaryExpression(54 /* SyntaxKind.ExclamationToken */, ts_1.Debug.checkDefined((0, ts_1.visitNode)(node.condition, visitor, ts_1.isExpression))), ts_1.Debug.checkDefined((0, ts_1.visitNode)(factory.createBreakStatement(), visitor, ts_1.isStatement))));
            }
        }
        ts_1.Debug.assert(statement);
        if ((0, ts_1.isBlock)(statement)) {
            (0, ts_1.addRange)(statements, statement.statements);
        }
        else {
            statements.push(statement);
        }
        copyOutParameters(currentState.loopOutParameters, 1 /* LoopOutParameterFlags.Body */, 1 /* CopyDirection.ToOutParameter */, statements);
        (0, ts_1.insertStatementsAfterStandardPrologue)(statements, lexicalEnvironment);
        var loopBody = factory.createBlock(statements, /*multiLine*/ true);
        if ((0, ts_1.isBlock)(statement))
            (0, ts_1.setOriginalNode)(loopBody, statement);
        var containsYield = (node.statement.transformFlags & 1048576 /* TransformFlags.ContainsYield */) !== 0;
        var emitFlags = 1048576 /* EmitFlags.ReuseTempVariableScope */;
        if (currentState.containsLexicalThis)
            emitFlags |= 16 /* EmitFlags.CapturesThis */;
        if (containsYield && (hierarchyFacts & 4 /* HierarchyFacts.AsyncFunctionBody */) !== 0)
            emitFlags |= 524288 /* EmitFlags.AsyncFunctionBody */;
        // This transforms the following ES2015 syntax (in addition to other variations):
        //
        //  for (let i = 0; i < 2; i++) {
        //      setImmediate(() => console.log(i));
        //  }
        //
        // Into the following ES5 syntax:
        //
        //  var _loop_1 = function (i) {
        //      setImmediate(() => console.log(i));
        //  };
        //  for (var i = 0; i < 2; i++) {
        //      _loop_1(i);
        //  }
        var functionDeclaration = factory.createVariableStatement(
        /*modifiers*/ undefined, (0, ts_1.setEmitFlags)(factory.createVariableDeclarationList([
            factory.createVariableDeclaration(functionName, 
            /*exclamationToken*/ undefined, 
            /*type*/ undefined, (0, ts_1.setEmitFlags)(factory.createFunctionExpression(
            /*modifiers*/ undefined, containsYield ? factory.createToken(42 /* SyntaxKind.AsteriskToken */) : undefined, 
            /*name*/ undefined, 
            /*typeParameters*/ undefined, currentState.loopParameters, 
            /*type*/ undefined, loopBody), emitFlags))
        ]), 4194304 /* EmitFlags.NoHoisting */));
        var part = generateCallToConvertedLoop(functionName, currentState, outerState, containsYield);
        return { functionName: functionName, containsYield: containsYield, functionDeclaration: functionDeclaration, part: part };
    }
    function copyOutParameter(outParam, copyDirection) {
        var source = copyDirection === 0 /* CopyDirection.ToOriginal */ ? outParam.outParamName : outParam.originalName;
        var target = copyDirection === 0 /* CopyDirection.ToOriginal */ ? outParam.originalName : outParam.outParamName;
        return factory.createBinaryExpression(target, 64 /* SyntaxKind.EqualsToken */, source);
    }
    function copyOutParameters(outParams, partFlags, copyDirection, statements) {
        for (var _i = 0, outParams_1 = outParams; _i < outParams_1.length; _i++) {
            var outParam = outParams_1[_i];
            if (outParam.flags & partFlags) {
                statements.push(factory.createExpressionStatement(copyOutParameter(outParam, copyDirection)));
            }
        }
    }
    function generateCallToConvertedLoopInitializer(initFunctionExpressionName, containsYield) {
        var call = factory.createCallExpression(initFunctionExpressionName, /*typeArguments*/ undefined, []);
        var callResult = containsYield
            ? factory.createYieldExpression(factory.createToken(42 /* SyntaxKind.AsteriskToken */), (0, ts_1.setEmitFlags)(call, 8388608 /* EmitFlags.Iterator */))
            : call;
        return factory.createExpressionStatement(callResult);
    }
    function generateCallToConvertedLoop(loopFunctionExpressionName, state, outerState, containsYield) {
        var statements = [];
        // loop is considered simple if it does not have any return statements or break\continue that transfer control outside of the loop
        // simple loops are emitted as just 'loop()';
        // NOTE: if loop uses only 'continue' it still will be emitted as simple loop
        var isSimpleLoop = !(state.nonLocalJumps & ~4 /* Jump.Continue */) &&
            !state.labeledNonLocalBreaks &&
            !state.labeledNonLocalContinues;
        var call = factory.createCallExpression(loopFunctionExpressionName, /*typeArguments*/ undefined, (0, ts_1.map)(state.loopParameters, function (p) { return p.name; }));
        var callResult = containsYield
            ? factory.createYieldExpression(factory.createToken(42 /* SyntaxKind.AsteriskToken */), (0, ts_1.setEmitFlags)(call, 8388608 /* EmitFlags.Iterator */))
            : call;
        if (isSimpleLoop) {
            statements.push(factory.createExpressionStatement(callResult));
            copyOutParameters(state.loopOutParameters, 1 /* LoopOutParameterFlags.Body */, 0 /* CopyDirection.ToOriginal */, statements);
        }
        else {
            var loopResultName = factory.createUniqueName("state");
            var stateVariable = factory.createVariableStatement(
            /*modifiers*/ undefined, factory.createVariableDeclarationList([factory.createVariableDeclaration(loopResultName, /*exclamationToken*/ undefined, /*type*/ undefined, callResult)]));
            statements.push(stateVariable);
            copyOutParameters(state.loopOutParameters, 1 /* LoopOutParameterFlags.Body */, 0 /* CopyDirection.ToOriginal */, statements);
            if (state.nonLocalJumps & 8 /* Jump.Return */) {
                var returnStatement = void 0;
                if (outerState) {
                    outerState.nonLocalJumps |= 8 /* Jump.Return */;
                    returnStatement = factory.createReturnStatement(loopResultName);
                }
                else {
                    returnStatement = factory.createReturnStatement(factory.createPropertyAccessExpression(loopResultName, "value"));
                }
                statements.push(factory.createIfStatement(factory.createTypeCheck(loopResultName, "object"), returnStatement));
            }
            if (state.nonLocalJumps & 2 /* Jump.Break */) {
                statements.push(factory.createIfStatement(factory.createStrictEquality(loopResultName, factory.createStringLiteral("break")), factory.createBreakStatement()));
            }
            if (state.labeledNonLocalBreaks || state.labeledNonLocalContinues) {
                var caseClauses = [];
                processLabeledJumps(state.labeledNonLocalBreaks, /*isBreak*/ true, loopResultName, outerState, caseClauses);
                processLabeledJumps(state.labeledNonLocalContinues, /*isBreak*/ false, loopResultName, outerState, caseClauses);
                statements.push(factory.createSwitchStatement(loopResultName, factory.createCaseBlock(caseClauses)));
            }
        }
        return statements;
    }
    function setLabeledJump(state, isBreak, labelText, labelMarker) {
        if (isBreak) {
            if (!state.labeledNonLocalBreaks) {
                state.labeledNonLocalBreaks = new Map();
            }
            state.labeledNonLocalBreaks.set(labelText, labelMarker);
        }
        else {
            if (!state.labeledNonLocalContinues) {
                state.labeledNonLocalContinues = new Map();
            }
            state.labeledNonLocalContinues.set(labelText, labelMarker);
        }
    }
    function processLabeledJumps(table, isBreak, loopResultName, outerLoop, caseClauses) {
        if (!table) {
            return;
        }
        table.forEach(function (labelMarker, labelText) {
            var statements = [];
            // if there are no outer converted loop or outer label in question is located inside outer converted loop
            // then emit labeled break\continue
            // otherwise propagate pair 'label -> marker' to outer converted loop and emit 'return labelMarker' so outer loop can later decide what to do
            if (!outerLoop || (outerLoop.labels && outerLoop.labels.get(labelText))) {
                var label = factory.createIdentifier(labelText);
                statements.push(isBreak ? factory.createBreakStatement(label) : factory.createContinueStatement(label));
            }
            else {
                setLabeledJump(outerLoop, isBreak, labelText, labelMarker);
                statements.push(factory.createReturnStatement(loopResultName));
            }
            caseClauses.push(factory.createCaseClause(factory.createStringLiteral(labelMarker), statements));
        });
    }
    function processLoopVariableDeclaration(container, decl, loopParameters, loopOutParameters, hasCapturedBindingsInForHead) {
        var name = decl.name;
        if ((0, ts_1.isBindingPattern)(name)) {
            for (var _i = 0, _a = name.elements; _i < _a.length; _i++) {
                var element = _a[_i];
                if (!(0, ts_1.isOmittedExpression)(element)) {
                    processLoopVariableDeclaration(container, element, loopParameters, loopOutParameters, hasCapturedBindingsInForHead);
                }
            }
        }
        else {
            loopParameters.push(factory.createParameterDeclaration(/*modifiers*/ undefined, /*dotDotDotToken*/ undefined, name));
            var checkFlags = resolver.getNodeCheckFlags(decl);
            if (checkFlags & 262144 /* NodeCheckFlags.NeedsLoopOutParameter */ || hasCapturedBindingsInForHead) {
                var outParamName = factory.createUniqueName("out_" + (0, ts_1.idText)(name));
                var flags = 0 /* LoopOutParameterFlags.None */;
                if (checkFlags & 262144 /* NodeCheckFlags.NeedsLoopOutParameter */) {
                    flags |= 1 /* LoopOutParameterFlags.Body */;
                }
                if ((0, ts_1.isForStatement)(container)) {
                    if (container.initializer && resolver.isBindingCapturedByNode(container.initializer, decl)) {
                        flags |= 2 /* LoopOutParameterFlags.Initializer */;
                    }
                    if (container.condition && resolver.isBindingCapturedByNode(container.condition, decl) ||
                        container.incrementor && resolver.isBindingCapturedByNode(container.incrementor, decl)) {
                        flags |= 1 /* LoopOutParameterFlags.Body */;
                    }
                }
                loopOutParameters.push({ flags: flags, originalName: name, outParamName: outParamName });
            }
        }
    }
    /**
     * Adds the members of an object literal to an array of expressions.
     *
     * @param expressions An array of expressions.
     * @param node An ObjectLiteralExpression node.
     * @param receiver The receiver for members of the ObjectLiteralExpression.
     * @param numInitialNonComputedProperties The number of initial properties without
     *                                        computed property names.
     */
    function addObjectLiteralMembers(expressions, node, receiver, start) {
        var properties = node.properties;
        var numProperties = properties.length;
        for (var i = start; i < numProperties; i++) {
            var property = properties[i];
            switch (property.kind) {
                case 176 /* SyntaxKind.GetAccessor */:
                case 177 /* SyntaxKind.SetAccessor */:
                    var accessors = (0, ts_1.getAllAccessorDeclarations)(node.properties, property);
                    if (property === accessors.firstAccessor) {
                        expressions.push(transformAccessorsToExpression(receiver, accessors, node, !!node.multiLine));
                    }
                    break;
                case 173 /* SyntaxKind.MethodDeclaration */:
                    expressions.push(transformObjectLiteralMethodDeclarationToExpression(property, receiver, node, node.multiLine));
                    break;
                case 302 /* SyntaxKind.PropertyAssignment */:
                    expressions.push(transformPropertyAssignmentToExpression(property, receiver, node.multiLine));
                    break;
                case 303 /* SyntaxKind.ShorthandPropertyAssignment */:
                    expressions.push(transformShorthandPropertyAssignmentToExpression(property, receiver, node.multiLine));
                    break;
                default:
                    ts_1.Debug.failBadSyntaxKind(node);
                    break;
            }
        }
    }
    /**
     * Transforms a PropertyAssignment node into an expression.
     *
     * @param node The ObjectLiteralExpression that contains the PropertyAssignment.
     * @param property The PropertyAssignment node.
     * @param receiver The receiver for the assignment.
     */
    function transformPropertyAssignmentToExpression(property, receiver, startsOnNewLine) {
        var expression = factory.createAssignment((0, ts_1.createMemberAccessForPropertyName)(factory, receiver, ts_1.Debug.checkDefined((0, ts_1.visitNode)(property.name, visitor, ts_1.isPropertyName))), ts_1.Debug.checkDefined((0, ts_1.visitNode)(property.initializer, visitor, ts_1.isExpression)));
        (0, ts_1.setTextRange)(expression, property);
        if (startsOnNewLine) {
            (0, ts_1.startOnNewLine)(expression);
        }
        return expression;
    }
    /**
     * Transforms a ShorthandPropertyAssignment node into an expression.
     *
     * @param node The ObjectLiteralExpression that contains the ShorthandPropertyAssignment.
     * @param property The ShorthandPropertyAssignment node.
     * @param receiver The receiver for the assignment.
     */
    function transformShorthandPropertyAssignmentToExpression(property, receiver, startsOnNewLine) {
        var expression = factory.createAssignment((0, ts_1.createMemberAccessForPropertyName)(factory, receiver, ts_1.Debug.checkDefined((0, ts_1.visitNode)(property.name, visitor, ts_1.isPropertyName))), factory.cloneNode(property.name));
        (0, ts_1.setTextRange)(expression, property);
        if (startsOnNewLine) {
            (0, ts_1.startOnNewLine)(expression);
        }
        return expression;
    }
    /**
     * Transforms a MethodDeclaration of an ObjectLiteralExpression into an expression.
     *
     * @param node The ObjectLiteralExpression that contains the MethodDeclaration.
     * @param method The MethodDeclaration node.
     * @param receiver The receiver for the assignment.
     */
    function transformObjectLiteralMethodDeclarationToExpression(method, receiver, container, startsOnNewLine) {
        var expression = factory.createAssignment((0, ts_1.createMemberAccessForPropertyName)(factory, receiver, ts_1.Debug.checkDefined((0, ts_1.visitNode)(method.name, visitor, ts_1.isPropertyName))), transformFunctionLikeToExpression(method, /*location*/ method, /*name*/ undefined, container));
        (0, ts_1.setTextRange)(expression, method);
        if (startsOnNewLine) {
            (0, ts_1.startOnNewLine)(expression);
        }
        return expression;
    }
    function visitCatchClause(node) {
        var ancestorFacts = enterSubtree(7104 /* HierarchyFacts.BlockScopeExcludes */, 0 /* HierarchyFacts.BlockScopeIncludes */);
        var updated;
        ts_1.Debug.assert(!!node.variableDeclaration, "Catch clause variable should always be present when downleveling ES2015.");
        if ((0, ts_1.isBindingPattern)(node.variableDeclaration.name)) {
            var temp = factory.createTempVariable(/*recordTempVariable*/ undefined);
            var newVariableDeclaration = factory.createVariableDeclaration(temp);
            (0, ts_1.setTextRange)(newVariableDeclaration, node.variableDeclaration);
            var vars = (0, ts_1.flattenDestructuringBinding)(node.variableDeclaration, visitor, context, 0 /* FlattenLevel.All */, temp);
            var list = factory.createVariableDeclarationList(vars);
            (0, ts_1.setTextRange)(list, node.variableDeclaration);
            var destructure = factory.createVariableStatement(/*modifiers*/ undefined, list);
            updated = factory.updateCatchClause(node, newVariableDeclaration, addStatementToStartOfBlock(node.block, destructure));
        }
        else {
            updated = (0, ts_1.visitEachChild)(node, visitor, context);
        }
        exitSubtree(ancestorFacts, 0 /* HierarchyFacts.None */, 0 /* HierarchyFacts.None */);
        return updated;
    }
    function addStatementToStartOfBlock(block, statement) {
        var transformedStatements = (0, ts_1.visitNodes)(block.statements, visitor, ts_1.isStatement);
        return factory.updateBlock(block, __spreadArray([statement], transformedStatements, true));
    }
    /**
     * Visits a MethodDeclaration of an ObjectLiteralExpression and transforms it into a
     * PropertyAssignment.
     *
     * @param node A MethodDeclaration node.
     */
    function visitMethodDeclaration(node) {
        // We should only get here for methods on an object literal with regular identifier names.
        // Methods on classes are handled in visitClassDeclaration/visitClassExpression.
        // Methods with computed property names are handled in visitObjectLiteralExpression.
        ts_1.Debug.assert(!(0, ts_1.isComputedPropertyName)(node.name));
        var functionExpression = transformFunctionLikeToExpression(node, /*location*/ (0, ts_1.moveRangePos)(node, -1), /*name*/ undefined, /*container*/ undefined);
        (0, ts_1.setEmitFlags)(functionExpression, 1024 /* EmitFlags.NoLeadingComments */ | (0, ts_1.getEmitFlags)(functionExpression));
        return (0, ts_1.setTextRange)(factory.createPropertyAssignment(node.name, functionExpression), 
        /*location*/ node);
    }
    /**
     * Visits an AccessorDeclaration of an ObjectLiteralExpression.
     *
     * @param node An AccessorDeclaration node.
     */
    function visitAccessorDeclaration(node) {
        ts_1.Debug.assert(!(0, ts_1.isComputedPropertyName)(node.name));
        var savedConvertedLoopState = convertedLoopState;
        convertedLoopState = undefined;
        var ancestorFacts = enterSubtree(32670 /* HierarchyFacts.FunctionExcludes */, 65 /* HierarchyFacts.FunctionIncludes */);
        var updated;
        var parameters = (0, ts_1.visitParameterList)(node.parameters, visitor, context);
        var body = transformFunctionBody(node);
        if (node.kind === 176 /* SyntaxKind.GetAccessor */) {
            updated = factory.updateGetAccessorDeclaration(node, node.modifiers, node.name, parameters, node.type, body);
        }
        else {
            updated = factory.updateSetAccessorDeclaration(node, node.modifiers, node.name, parameters, body);
        }
        exitSubtree(ancestorFacts, 98304 /* HierarchyFacts.FunctionSubtreeExcludes */, 0 /* HierarchyFacts.None */);
        convertedLoopState = savedConvertedLoopState;
        return updated;
    }
    /**
     * Visits a ShorthandPropertyAssignment and transforms it into a PropertyAssignment.
     *
     * @param node A ShorthandPropertyAssignment node.
     */
    function visitShorthandPropertyAssignment(node) {
        return (0, ts_1.setTextRange)(factory.createPropertyAssignment(node.name, visitIdentifier(factory.cloneNode(node.name))), 
        /*location*/ node);
    }
    function visitComputedPropertyName(node) {
        return (0, ts_1.visitEachChild)(node, visitor, context);
    }
    /**
     * Visits a YieldExpression node.
     *
     * @param node A YieldExpression node.
     */
    function visitYieldExpression(node) {
        // `yield` expressions are transformed using the generators transformer.
        return (0, ts_1.visitEachChild)(node, visitor, context);
    }
    /**
     * Visits an ArrayLiteralExpression that contains a spread element.
     *
     * @param node An ArrayLiteralExpression node.
     */
    function visitArrayLiteralExpression(node) {
        if ((0, ts_1.some)(node.elements, ts_1.isSpreadElement)) {
            // We are here because we contain a SpreadElementExpression.
            return transformAndSpreadElements(node.elements, /*isArgumentList*/ false, !!node.multiLine, /*hasTrailingComma*/ !!node.elements.hasTrailingComma);
        }
        return (0, ts_1.visitEachChild)(node, visitor, context);
    }
    /**
     * Visits a CallExpression that contains either a spread element or `super`.
     *
     * @param node a CallExpression.
     */
    function visitCallExpression(node) {
        if ((0, ts_1.getInternalEmitFlags)(node) & 1 /* InternalEmitFlags.TypeScriptClassWrapper */) {
            return visitTypeScriptClassWrapper(node);
        }
        var expression = (0, ts_1.skipOuterExpressions)(node.expression);
        if (expression.kind === 108 /* SyntaxKind.SuperKeyword */ ||
            (0, ts_1.isSuperProperty)(expression) ||
            (0, ts_1.some)(node.arguments, ts_1.isSpreadElement)) {
            return visitCallExpressionWithPotentialCapturedThisAssignment(node, /*assignToCapturedThis*/ true);
        }
        return factory.updateCallExpression(node, ts_1.Debug.checkDefined((0, ts_1.visitNode)(node.expression, callExpressionVisitor, ts_1.isExpression)), 
        /*typeArguments*/ undefined, (0, ts_1.visitNodes)(node.arguments, visitor, ts_1.isExpression));
    }
    function visitTypeScriptClassWrapper(node) {
        // This is a call to a class wrapper function (an IIFE) created by the 'ts' transformer.
        // The wrapper has a form similar to:
        //
        //  (function() {
        //      class C { // 1
        //      }
        //      C.x = 1; // 2
        //      return C;
        //  }())
        //
        // When we transform the class, we end up with something like this:
        //
        //  (function () {
        //      var C = (function () { // 3
        //          function C() {
        //          }
        //          return C; // 4
        //      }());
        //      C.x = 1;
        //      return C;
        //  }())
        //
        // We want to simplify the two nested IIFEs to end up with something like this:
        //
        //  (function () {
        //      function C() {
        //      }
        //      C.x = 1;
        //      return C;
        //  }())
        // We skip any outer expressions in a number of places to get to the innermost
        // expression, but we will restore them later to preserve comments and source maps.
        var body = (0, ts_1.cast)((0, ts_1.cast)((0, ts_1.skipOuterExpressions)(node.expression), ts_1.isArrowFunction).body, ts_1.isBlock);
        // The class statements are the statements generated by visiting the first statement with initializer of the
        // body (1), while all other statements are added to remainingStatements (2)
        var isVariableStatementWithInitializer = function (stmt) { return (0, ts_1.isVariableStatement)(stmt) && !!(0, ts_1.first)(stmt.declarationList.declarations).initializer; };
        // visit the class body statements outside of any converted loop body.
        var savedConvertedLoopState = convertedLoopState;
        convertedLoopState = undefined;
        var bodyStatements = (0, ts_1.visitNodes)(body.statements, classWrapperStatementVisitor, ts_1.isStatement);
        convertedLoopState = savedConvertedLoopState;
        var classStatements = (0, ts_1.filter)(bodyStatements, isVariableStatementWithInitializer);
        var remainingStatements = (0, ts_1.filter)(bodyStatements, function (stmt) { return !isVariableStatementWithInitializer(stmt); });
        var varStatement = (0, ts_1.cast)((0, ts_1.first)(classStatements), ts_1.isVariableStatement);
        // We know there is only one variable declaration here as we verified this in an
        // earlier call to isTypeScriptClassWrapper
        var variable = varStatement.declarationList.declarations[0];
        var initializer = (0, ts_1.skipOuterExpressions)(variable.initializer);
        // Under certain conditions, the 'ts' transformer may introduce a class alias, which
        // we see as an assignment, for example:
        //
        //  (function () {
        //      var C_1;
        //      var C = C_1 = (function () {
        //          function C() {
        //          }
        //          C.x = function () { return C_1; }
        //          return C;
        //      }());
        //      C = C_1 = __decorate([dec], C);
        //      return C;
        //  }())
        //
        var aliasAssignment = (0, ts_1.tryCast)(initializer, ts_1.isAssignmentExpression);
        if (!aliasAssignment && (0, ts_1.isBinaryExpression)(initializer) && initializer.operatorToken.kind === 28 /* SyntaxKind.CommaToken */) {
            aliasAssignment = (0, ts_1.tryCast)(initializer.left, ts_1.isAssignmentExpression);
        }
        // The underlying call (3) is another IIFE that may contain a '_super' argument.
        var call = (0, ts_1.cast)(aliasAssignment ? (0, ts_1.skipOuterExpressions)(aliasAssignment.right) : initializer, ts_1.isCallExpression);
        var func = (0, ts_1.cast)((0, ts_1.skipOuterExpressions)(call.expression), ts_1.isFunctionExpression);
        var funcStatements = func.body.statements;
        var classBodyStart = 0;
        var classBodyEnd = -1;
        var statements = [];
        if (aliasAssignment) {
            // If we have a class alias assignment, we need to move it to the down-level constructor
            // function we generated for the class.
            var extendsCall = (0, ts_1.tryCast)(funcStatements[classBodyStart], ts_1.isExpressionStatement);
            if (extendsCall) {
                statements.push(extendsCall);
                classBodyStart++;
            }
            // The next statement is the function declaration.
            statements.push(funcStatements[classBodyStart]);
            classBodyStart++;
            // Add the class alias following the declaration.
            statements.push(factory.createExpressionStatement(factory.createAssignment(aliasAssignment.left, (0, ts_1.cast)(variable.name, ts_1.isIdentifier))));
        }
        // Find the trailing 'return' statement (4)
        while (!(0, ts_1.isReturnStatement)((0, ts_1.elementAt)(funcStatements, classBodyEnd))) {
            classBodyEnd--;
        }
        // When we extract the statements of the inner IIFE, we exclude the 'return' statement (4)
        // as we already have one that has been introduced by the 'ts' transformer.
        (0, ts_1.addRange)(statements, funcStatements, classBodyStart, classBodyEnd);
        if (classBodyEnd < -1) {
            // If there were any hoisted declarations following the return statement, we should
            // append them.
            (0, ts_1.addRange)(statements, funcStatements, classBodyEnd + 1);
        }
        // TODO(rbuckton): We should consider either improving the inlining here, or remove it entirely, since
        //                 the new esDecorators emit doesn't inline.
        // Add the remaining statements of the outer wrapper. Use the 'return' statement
        // of the inner wrapper if its expression is not trivially an Identifier.
        var returnStatement = (0, ts_1.tryCast)((0, ts_1.elementAt)(funcStatements, classBodyEnd), ts_1.isReturnStatement);
        for (var _i = 0, remainingStatements_1 = remainingStatements; _i < remainingStatements_1.length; _i++) {
            var statement = remainingStatements_1[_i];
            if ((0, ts_1.isReturnStatement)(statement) && (returnStatement === null || returnStatement === void 0 ? void 0 : returnStatement.expression) &&
                !(0, ts_1.isIdentifier)(returnStatement.expression)) {
                statements.push(returnStatement);
            }
            else {
                statements.push(statement);
            }
        }
        // The 'es2015' class transform may add an end-of-declaration marker. If so we will add it
        // after the remaining statements from the 'ts' transformer.
        (0, ts_1.addRange)(statements, classStatements, /*start*/ 1);
        // Recreate any outer parentheses or partially-emitted expressions to preserve source map
        // and comment locations.
        return factory.restoreOuterExpressions(node.expression, factory.restoreOuterExpressions(variable.initializer, factory.restoreOuterExpressions(aliasAssignment && aliasAssignment.right, factory.updateCallExpression(call, factory.restoreOuterExpressions(call.expression, factory.updateFunctionExpression(func, 
        /*modifiers*/ undefined, 
        /*asteriskToken*/ undefined, 
        /*name*/ undefined, 
        /*typeParameters*/ undefined, func.parameters, 
        /*type*/ undefined, factory.updateBlock(func.body, statements))), 
        /*typeArguments*/ undefined, call.arguments))));
    }
    function visitSuperCallInBody(node) {
        return visitCallExpressionWithPotentialCapturedThisAssignment(node, /*assignToCapturedThis*/ false);
    }
    function visitCallExpressionWithPotentialCapturedThisAssignment(node, assignToCapturedThis) {
        // We are here either because SuperKeyword was used somewhere in the expression, or
        // because we contain a SpreadElementExpression.
        if (node.transformFlags & 32768 /* TransformFlags.ContainsRestOrSpread */ ||
            node.expression.kind === 108 /* SyntaxKind.SuperKeyword */ ||
            (0, ts_1.isSuperProperty)((0, ts_1.skipOuterExpressions)(node.expression))) {
            var _a = factory.createCallBinding(node.expression, hoistVariableDeclaration), target = _a.target, thisArg = _a.thisArg;
            if (node.expression.kind === 108 /* SyntaxKind.SuperKeyword */) {
                (0, ts_1.setEmitFlags)(thisArg, 8 /* EmitFlags.NoSubstitution */);
            }
            var resultingCall = void 0;
            if (node.transformFlags & 32768 /* TransformFlags.ContainsRestOrSpread */) {
                // [source]
                //      f(...a, b)
                //      x.m(...a, b)
                //      super(...a, b)
                //      super.m(...a, b) // in static
                //      super.m(...a, b) // in instance
                //
                // [output]
                //      f.apply(void 0, a.concat([b]))
                //      (_a = x).m.apply(_a, a.concat([b]))
                //      _super.apply(this, a.concat([b]))
                //      _super.m.apply(this, a.concat([b]))
                //      _super.prototype.m.apply(this, a.concat([b]))
                resultingCall = factory.createFunctionApplyCall(ts_1.Debug.checkDefined((0, ts_1.visitNode)(target, callExpressionVisitor, ts_1.isExpression)), node.expression.kind === 108 /* SyntaxKind.SuperKeyword */ ? thisArg : ts_1.Debug.checkDefined((0, ts_1.visitNode)(thisArg, visitor, ts_1.isExpression)), transformAndSpreadElements(node.arguments, /*isArgumentList*/ true, /*multiLine*/ false, /*hasTrailingComma*/ false));
            }
            else {
                // [source]
                //      super(a)
                //      super.m(a) // in static
                //      super.m(a) // in instance
                //
                // [output]
                //      _super.call(this, a)
                //      _super.m.call(this, a)
                //      _super.prototype.m.call(this, a)
                resultingCall = (0, ts_1.setTextRange)(factory.createFunctionCallCall(ts_1.Debug.checkDefined((0, ts_1.visitNode)(target, callExpressionVisitor, ts_1.isExpression)), node.expression.kind === 108 /* SyntaxKind.SuperKeyword */ ? thisArg : ts_1.Debug.checkDefined((0, ts_1.visitNode)(thisArg, visitor, ts_1.isExpression)), (0, ts_1.visitNodes)(node.arguments, visitor, ts_1.isExpression)), node);
            }
            if (node.expression.kind === 108 /* SyntaxKind.SuperKeyword */) {
                var initializer = factory.createLogicalOr(resultingCall, createActualThis());
                resultingCall = assignToCapturedThis
                    ? factory.createAssignment(factory.createUniqueName("_this", 16 /* GeneratedIdentifierFlags.Optimistic */ | 32 /* GeneratedIdentifierFlags.FileLevel */), initializer)
                    : initializer;
            }
            return (0, ts_1.setOriginalNode)(resultingCall, node);
        }
        return (0, ts_1.visitEachChild)(node, visitor, context);
    }
    /**
     * Visits a NewExpression that contains a spread element.
     *
     * @param node A NewExpression node.
     */
    function visitNewExpression(node) {
        if ((0, ts_1.some)(node.arguments, ts_1.isSpreadElement)) {
            // We are here because we contain a SpreadElementExpression.
            // [source]
            //      new C(...a)
            //
            // [output]
            //      new ((_a = C).bind.apply(_a, [void 0].concat(a)))()
            var _a = factory.createCallBinding(factory.createPropertyAccessExpression(node.expression, "bind"), hoistVariableDeclaration), target = _a.target, thisArg = _a.thisArg;
            return factory.createNewExpression(factory.createFunctionApplyCall(ts_1.Debug.checkDefined((0, ts_1.visitNode)(target, visitor, ts_1.isExpression)), thisArg, transformAndSpreadElements(factory.createNodeArray(__spreadArray([factory.createVoidZero()], node.arguments, true)), /*isArgumentList*/ true, /*multiLine*/ false, /*hasTrailingComma*/ false)), 
            /*typeArguments*/ undefined, []);
        }
        return (0, ts_1.visitEachChild)(node, visitor, context);
    }
    /**
     * Transforms an array of Expression nodes that contains a SpreadExpression.
     *
     * @param elements The array of Expression nodes.
     * @param isArgumentList A value indicating whether to ensure that the result is a fresh array.
     * This should be `false` when spreading into an `ArrayLiteral`, and `true` when spreading into an
     * argument list.
     * @param multiLine A value indicating whether the result should be emitted on multiple lines.
     */
    function transformAndSpreadElements(elements, isArgumentList, multiLine, hasTrailingComma) {
        // When there is no leading SpreadElement:
        //
        // [source]
        //      [a, ...b, c]
        //
        // [output (downlevelIteration)]
        //      __spreadArray(__spreadArray([a], __read(b)), [c])
        //
        // [output]
        //      __spreadArray(__spreadArray([a], b), [c])
        //
        // When there *is* a leading SpreadElement:
        //
        // [source]
        //      [...a, b]
        //
        // [output (downlevelIteration)]
        //      __spreadArray(__spreadArray([], __read(a)), [b])
        //
        // [output]
        //      __spreadArray(__spreadArray([], a), [b])
        //
        // NOTE: We use `isPackedArrayLiteral` below rather than just `isArrayLiteral`
        // because ES2015 spread will replace _missing_ array elements with `undefined`,
        // so we cannot just use an array as is. For example:
        //
        // `[1, ...[2, , 3]]` becomes `[1, 2, undefined, 3]`
        //
        // However, for packed array literals (i.e., an array literal with no OmittedExpression
        // elements), we can use the array as-is.
        // Map spans of spread expressions into their expressions and spans of other
        // expressions into an array literal.
        var numElements = elements.length;
        var segments = (0, ts_1.flatten)(
        // As we visit each element, we return one of two functions to use as the "key":
        // - `visitSpanOfSpreads` for one or more contiguous `...` spread expressions, i.e. `...a, ...b` in `[1, 2, ...a, ...b]`
        // - `visitSpanOfNonSpreads` for one or more contiguous non-spread elements, i.e. `1, 2`, in `[1, 2, ...a, ...b]`
        (0, ts_1.spanMap)(elements, partitionSpread, function (partition, visitPartition, _start, end) {
            return visitPartition(partition, multiLine, hasTrailingComma && end === numElements);
        }));
        if (segments.length === 1) {
            var firstSegment = segments[0];
            // If we don't need a unique copy, then we are spreading into an argument list for
            // a CallExpression or NewExpression. When using `--downlevelIteration`, we need
            // to coerce this into an array for use with `apply`, so we will use the code path
            // that follows instead.
            if (isArgumentList && !compilerOptions.downlevelIteration
                || (0, ts_1.isPackedArrayLiteral)(firstSegment.expression) // see NOTE (above)
                || (0, ts_1.isCallToHelper)(firstSegment.expression, "___spreadArray")) {
                return firstSegment.expression;
            }
        }
        var helpers = emitHelpers();
        var startsWithSpread = segments[0].kind !== 0 /* SpreadSegmentKind.None */;
        var expression = startsWithSpread ? factory.createArrayLiteralExpression() :
            segments[0].expression;
        for (var i = startsWithSpread ? 0 : 1; i < segments.length; i++) {
            var segment = segments[i];
            // If this is for an argument list, it doesn't matter if the array is packed or sparse
            expression = helpers.createSpreadArrayHelper(expression, segment.expression, segment.kind === 1 /* SpreadSegmentKind.UnpackedSpread */ && !isArgumentList);
        }
        return expression;
    }
    function partitionSpread(node) {
        return (0, ts_1.isSpreadElement)(node)
            ? visitSpanOfSpreads
            : visitSpanOfNonSpreads;
    }
    function visitSpanOfSpreads(chunk) {
        return (0, ts_1.map)(chunk, visitExpressionOfSpread);
    }
    function visitExpressionOfSpread(node) {
        ts_1.Debug.assertNode(node, ts_1.isSpreadElement);
        var expression = (0, ts_1.visitNode)(node.expression, visitor, ts_1.isExpression);
        ts_1.Debug.assert(expression);
        // We don't need to pack already packed array literals, or existing calls to the `__read` helper.
        var isCallToReadHelper = (0, ts_1.isCallToHelper)(expression, "___read");
        var kind = isCallToReadHelper || (0, ts_1.isPackedArrayLiteral)(expression) ? 2 /* SpreadSegmentKind.PackedSpread */ : 1 /* SpreadSegmentKind.UnpackedSpread */;
        // We don't need the `__read` helper for array literals. Array packing will be performed by `__spreadArray`.
        if (compilerOptions.downlevelIteration && kind === 1 /* SpreadSegmentKind.UnpackedSpread */ && !(0, ts_1.isArrayLiteralExpression)(expression) && !isCallToReadHelper) {
            expression = emitHelpers().createReadHelper(expression, /*count*/ undefined);
            // the `__read` helper returns a packed array, so we don't need to ensure a packed array
            kind = 2 /* SpreadSegmentKind.PackedSpread */;
        }
        return createSpreadSegment(kind, expression);
    }
    function visitSpanOfNonSpreads(chunk, multiLine, hasTrailingComma) {
        var expression = factory.createArrayLiteralExpression((0, ts_1.visitNodes)(factory.createNodeArray(chunk, hasTrailingComma), visitor, ts_1.isExpression), multiLine);
        // We do not pack non-spread segments, this is so that `[1, , ...[2, , 3], , 4]` is properly downleveled to
        // `[1, , 2, undefined, 3, , 4]`. See the NOTE in `transformAndSpreadElements`
        return createSpreadSegment(0 /* SpreadSegmentKind.None */, expression);
    }
    function visitSpreadElement(node) {
        return (0, ts_1.visitNode)(node.expression, visitor, ts_1.isExpression);
    }
    /**
     * Visits a template literal.
     *
     * @param node A template literal.
     */
    function visitTemplateLiteral(node) {
        return (0, ts_1.setTextRange)(factory.createStringLiteral(node.text), node);
    }
    /**
     * Visits a string literal with an extended unicode escape.
     *
     * @param node A string literal.
     */
    function visitStringLiteral(node) {
        if (node.hasExtendedUnicodeEscape) {
            return (0, ts_1.setTextRange)(factory.createStringLiteral(node.text), node);
        }
        return node;
    }
    /**
     * Visits a binary or octal (ES6) numeric literal.
     *
     * @param node A string literal.
     */
    function visitNumericLiteral(node) {
        if (node.numericLiteralFlags & 384 /* TokenFlags.BinaryOrOctalSpecifier */) {
            return (0, ts_1.setTextRange)(factory.createNumericLiteral(node.text), node);
        }
        return node;
    }
    /**
     * Visits a TaggedTemplateExpression node.
     *
     * @param node A TaggedTemplateExpression node.
     */
    function visitTaggedTemplateExpression(node) {
        return (0, ts_1.processTaggedTemplateExpression)(context, node, visitor, currentSourceFile, recordTaggedTemplateString, ts_1.ProcessLevel.All);
    }
    /**
     * Visits a TemplateExpression node.
     *
     * @param node A TemplateExpression node.
     */
    function visitTemplateExpression(node) {
        var expression = factory.createStringLiteral(node.head.text);
        for (var _i = 0, _a = node.templateSpans; _i < _a.length; _i++) {
            var span = _a[_i];
            var args = [ts_1.Debug.checkDefined((0, ts_1.visitNode)(span.expression, visitor, ts_1.isExpression))];
            if (span.literal.text.length > 0) {
                args.push(factory.createStringLiteral(span.literal.text));
            }
            expression = factory.createCallExpression(factory.createPropertyAccessExpression(expression, "concat"), 
            /*typeArguments*/ undefined, args);
        }
        return (0, ts_1.setTextRange)(expression, node);
    }
    /**
     * Visits the `super` keyword
     */
    function visitSuperKeyword(isExpressionOfCall) {
        return hierarchyFacts & 8 /* HierarchyFacts.NonStaticClassElement */
            && !isExpressionOfCall
            ? factory.createPropertyAccessExpression(factory.createUniqueName("_super", 16 /* GeneratedIdentifierFlags.Optimistic */ | 32 /* GeneratedIdentifierFlags.FileLevel */), "prototype")
            : factory.createUniqueName("_super", 16 /* GeneratedIdentifierFlags.Optimistic */ | 32 /* GeneratedIdentifierFlags.FileLevel */);
    }
    function visitMetaProperty(node) {
        if (node.keywordToken === 105 /* SyntaxKind.NewKeyword */ && node.name.escapedText === "target") {
            hierarchyFacts |= 32768 /* HierarchyFacts.NewTarget */;
            return factory.createUniqueName("_newTarget", 16 /* GeneratedIdentifierFlags.Optimistic */ | 32 /* GeneratedIdentifierFlags.FileLevel */);
        }
        return node;
    }
    /**
     * Called by the printer just before a node is printed.
     *
     * @param hint A hint as to the intended usage of the node.
     * @param node The node to be printed.
     * @param emitCallback The callback used to emit the node.
     */
    function onEmitNode(hint, node, emitCallback) {
        if (enabledSubstitutions & 1 /* ES2015SubstitutionFlags.CapturedThis */ && (0, ts_1.isFunctionLike)(node)) {
            // If we are tracking a captured `this`, keep track of the enclosing function.
            var ancestorFacts = enterSubtree(32670 /* HierarchyFacts.FunctionExcludes */, (0, ts_1.getEmitFlags)(node) & 16 /* EmitFlags.CapturesThis */
                ? 65 /* HierarchyFacts.FunctionIncludes */ | 16 /* HierarchyFacts.CapturesThis */
                : 65 /* HierarchyFacts.FunctionIncludes */);
            previousOnEmitNode(hint, node, emitCallback);
            exitSubtree(ancestorFacts, 0 /* HierarchyFacts.None */, 0 /* HierarchyFacts.None */);
            return;
        }
        previousOnEmitNode(hint, node, emitCallback);
    }
    /**
     * Enables a more costly code path for substitutions when we determine a source file
     * contains block-scoped bindings (e.g. `let` or `const`).
     */
    function enableSubstitutionsForBlockScopedBindings() {
        if ((enabledSubstitutions & 2 /* ES2015SubstitutionFlags.BlockScopedBindings */) === 0) {
            enabledSubstitutions |= 2 /* ES2015SubstitutionFlags.BlockScopedBindings */;
            context.enableSubstitution(80 /* SyntaxKind.Identifier */);
        }
    }
    /**
     * Enables a more costly code path for substitutions when we determine a source file
     * contains a captured `this`.
     */
    function enableSubstitutionsForCapturedThis() {
        if ((enabledSubstitutions & 1 /* ES2015SubstitutionFlags.CapturedThis */) === 0) {
            enabledSubstitutions |= 1 /* ES2015SubstitutionFlags.CapturedThis */;
            context.enableSubstitution(110 /* SyntaxKind.ThisKeyword */);
            context.enableEmitNotification(175 /* SyntaxKind.Constructor */);
            context.enableEmitNotification(173 /* SyntaxKind.MethodDeclaration */);
            context.enableEmitNotification(176 /* SyntaxKind.GetAccessor */);
            context.enableEmitNotification(177 /* SyntaxKind.SetAccessor */);
            context.enableEmitNotification(218 /* SyntaxKind.ArrowFunction */);
            context.enableEmitNotification(217 /* SyntaxKind.FunctionExpression */);
            context.enableEmitNotification(261 /* SyntaxKind.FunctionDeclaration */);
        }
    }
    /**
     * Hooks node substitutions.
     *
     * @param hint The context for the emitter.
     * @param node The node to substitute.
     */
    function onSubstituteNode(hint, node) {
        node = previousOnSubstituteNode(hint, node);
        if (hint === 1 /* EmitHint.Expression */) {
            return substituteExpression(node);
        }
        if ((0, ts_1.isIdentifier)(node)) {
            return substituteIdentifier(node);
        }
        return node;
    }
    /**
     * Hooks substitutions for non-expression identifiers.
     */
    function substituteIdentifier(node) {
        // Only substitute the identifier if we have enabled substitutions for block-scoped
        // bindings.
        if (enabledSubstitutions & 2 /* ES2015SubstitutionFlags.BlockScopedBindings */ && !(0, ts_1.isInternalName)(node)) {
            var original = (0, ts_1.getParseTreeNode)(node, ts_1.isIdentifier);
            if (original && isNameOfDeclarationWithCollidingName(original)) {
                return (0, ts_1.setTextRange)(factory.getGeneratedNameForNode(original), node);
            }
        }
        return node;
    }
    /**
     * Determines whether a name is the name of a declaration with a colliding name.
     * NOTE: This function expects to be called with an original source tree node.
     *
     * @param node An original source tree node.
     */
    function isNameOfDeclarationWithCollidingName(node) {
        switch (node.parent.kind) {
            case 207 /* SyntaxKind.BindingElement */:
            case 262 /* SyntaxKind.ClassDeclaration */:
            case 265 /* SyntaxKind.EnumDeclaration */:
            case 259 /* SyntaxKind.VariableDeclaration */:
                return node.parent.name === node
                    && resolver.isDeclarationWithCollidingName(node.parent);
        }
        return false;
    }
    /**
     * Substitutes an expression.
     *
     * @param node An Expression node.
     */
    function substituteExpression(node) {
        switch (node.kind) {
            case 80 /* SyntaxKind.Identifier */:
                return substituteExpressionIdentifier(node);
            case 110 /* SyntaxKind.ThisKeyword */:
                return substituteThisKeyword(node);
        }
        return node;
    }
    /**
     * Substitutes an expression identifier.
     *
     * @param node An Identifier node.
     */
    function substituteExpressionIdentifier(node) {
        if (enabledSubstitutions & 2 /* ES2015SubstitutionFlags.BlockScopedBindings */ && !(0, ts_1.isInternalName)(node)) {
            var declaration = resolver.getReferencedDeclarationWithCollidingName(node);
            if (declaration && !((0, ts_1.isClassLike)(declaration) && isPartOfClassBody(declaration, node))) {
                return (0, ts_1.setTextRange)(factory.getGeneratedNameForNode((0, ts_1.getNameOfDeclaration)(declaration)), node);
            }
        }
        return node;
    }
    function isPartOfClassBody(declaration, node) {
        var currentNode = (0, ts_1.getParseTreeNode)(node);
        if (!currentNode || currentNode === declaration || currentNode.end <= declaration.pos || currentNode.pos >= declaration.end) {
            // if the node has no correlation to a parse tree node, its definitely not
            // part of the body.
            // if the node is outside of the document range of the declaration, its
            // definitely not part of the body.
            return false;
        }
        var blockScope = (0, ts_1.getEnclosingBlockScopeContainer)(declaration);
        while (currentNode) {
            if (currentNode === blockScope || currentNode === declaration) {
                // if we are in the enclosing block scope of the declaration, we are definitely
                // not inside the class body.
                return false;
            }
            if ((0, ts_1.isClassElement)(currentNode) && currentNode.parent === declaration) {
                return true;
            }
            currentNode = currentNode.parent;
        }
        return false;
    }
    /**
     * Substitutes `this` when contained within an arrow function.
     *
     * @param node The ThisKeyword node.
     */
    function substituteThisKeyword(node) {
        if (enabledSubstitutions & 1 /* ES2015SubstitutionFlags.CapturedThis */
            && hierarchyFacts & 16 /* HierarchyFacts.CapturesThis */) {
            return (0, ts_1.setTextRange)(factory.createUniqueName("_this", 16 /* GeneratedIdentifierFlags.Optimistic */ | 32 /* GeneratedIdentifierFlags.FileLevel */), node);
        }
        return node;
    }
    function getClassMemberPrefix(node, member) {
        return (0, ts_1.isStatic)(member)
            ? factory.getInternalName(node)
            : factory.createPropertyAccessExpression(factory.getInternalName(node), "prototype");
    }
    function hasSynthesizedDefaultSuperCall(constructor, hasExtendsClause) {
        if (!constructor || !hasExtendsClause) {
            return false;
        }
        if ((0, ts_1.some)(constructor.parameters)) {
            return false;
        }
        var statement = (0, ts_1.firstOrUndefined)(constructor.body.statements);
        if (!statement || !(0, ts_1.nodeIsSynthesized)(statement) || statement.kind !== 243 /* SyntaxKind.ExpressionStatement */) {
            return false;
        }
        var statementExpression = statement.expression;
        if (!(0, ts_1.nodeIsSynthesized)(statementExpression) || statementExpression.kind !== 212 /* SyntaxKind.CallExpression */) {
            return false;
        }
        var callTarget = statementExpression.expression;
        if (!(0, ts_1.nodeIsSynthesized)(callTarget) || callTarget.kind !== 108 /* SyntaxKind.SuperKeyword */) {
            return false;
        }
        var callArgument = (0, ts_1.singleOrUndefined)(statementExpression.arguments);
        if (!callArgument || !(0, ts_1.nodeIsSynthesized)(callArgument) || callArgument.kind !== 229 /* SyntaxKind.SpreadElement */) {
            return false;
        }
        var expression = callArgument.expression;
        return (0, ts_1.isIdentifier)(expression) && expression.escapedText === "arguments";
    }
}
exports.transformES2015 = transformES2015;
