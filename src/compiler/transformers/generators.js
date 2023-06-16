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
exports.transformGenerators = void 0;
var ts_1 = require("../_namespaces/ts");
function getInstructionName(instruction) {
    switch (instruction) {
        case 2 /* Instruction.Return */: return "return";
        case 3 /* Instruction.Break */: return "break";
        case 4 /* Instruction.Yield */: return "yield";
        case 5 /* Instruction.YieldStar */: return "yield*";
        case 7 /* Instruction.Endfinally */: return "endfinally";
        default: return undefined; // TODO: GH#18217
    }
}
/** @internal */
function transformGenerators(context) {
    var factory = context.factory, emitHelpers = context.getEmitHelperFactory, resumeLexicalEnvironment = context.resumeLexicalEnvironment, endLexicalEnvironment = context.endLexicalEnvironment, hoistFunctionDeclaration = context.hoistFunctionDeclaration, hoistVariableDeclaration = context.hoistVariableDeclaration;
    var compilerOptions = context.getCompilerOptions();
    var languageVersion = (0, ts_1.getEmitScriptTarget)(compilerOptions);
    var resolver = context.getEmitResolver();
    var previousOnSubstituteNode = context.onSubstituteNode;
    context.onSubstituteNode = onSubstituteNode;
    var renamedCatchVariables;
    var renamedCatchVariableDeclarations;
    var inGeneratorFunctionBody;
    var inStatementContainingYield;
    // The following three arrays store information about generated code blocks.
    // All three arrays are correlated by their index. This approach is used over allocating
    // objects to store the same information to avoid GC overhead.
    //
    var blocks; // Information about the code block
    var blockOffsets; // The operation offset at which a code block begins or ends
    var blockActions; // Whether the code block is opened or closed
    var blockStack; // A stack of currently open code blocks
    // Labels are used to mark locations in the code that can be the target of a Break (jump)
    // operation. These are translated into case clauses in a switch statement.
    // The following two arrays are correlated by their index. This approach is used over
    // allocating objects to store the same information to avoid GC overhead.
    //
    var labelOffsets; // The operation offset at which the label is defined.
    var labelExpressions; // The NumericLiteral nodes bound to each label.
    var nextLabelId = 1; // The next label id to use.
    // Operations store information about generated code for the function body. This
    // Includes things like statements, assignments, breaks (jumps), and yields.
    // The following three arrays are correlated by their index. This approach is used over
    // allocating objects to store the same information to avoid GC overhead.
    //
    var operations; // The operation to perform.
    var operationArguments; // The arguments to the operation.
    var operationLocations; // The source map location for the operation.
    var state; // The name of the state object used by the generator at runtime.
    // The following variables store information used by the `build` function:
    //
    var blockIndex = 0; // The index of the current block.
    var labelNumber = 0; // The current label number.
    var labelNumbers;
    var lastOperationWasAbrupt; // Indicates whether the last operation was abrupt (break/continue).
    var lastOperationWasCompletion; // Indicates whether the last operation was a completion (return/throw).
    var clauses; // The case clauses generated for labels.
    var statements; // The statements for the current label.
    var exceptionBlockStack; // A stack of containing exception blocks.
    var currentExceptionBlock; // The current exception block.
    var withBlockStack; // A stack containing `with` blocks.
    return (0, ts_1.chainBundle)(context, transformSourceFile);
    function transformSourceFile(node) {
        if (node.isDeclarationFile || (node.transformFlags & 2048 /* TransformFlags.ContainsGenerator */) === 0) {
            return node;
        }
        var visited = (0, ts_1.visitEachChild)(node, visitor, context);
        (0, ts_1.addEmitHelpers)(visited, context.readEmitHelpers());
        return visited;
    }
    /**
     * Visits a node.
     *
     * @param node The node to visit.
     */
    function visitor(node) {
        var transformFlags = node.transformFlags;
        if (inStatementContainingYield) {
            return visitJavaScriptInStatementContainingYield(node);
        }
        else if (inGeneratorFunctionBody) {
            return visitJavaScriptInGeneratorFunctionBody(node);
        }
        else if ((0, ts_1.isFunctionLikeDeclaration)(node) && node.asteriskToken) {
            return visitGenerator(node);
        }
        else if (transformFlags & 2048 /* TransformFlags.ContainsGenerator */) {
            return (0, ts_1.visitEachChild)(node, visitor, context);
        }
        else {
            return node;
        }
    }
    /**
     * Visits a node that is contained within a statement that contains yield.
     *
     * @param node The node to visit.
     */
    function visitJavaScriptInStatementContainingYield(node) {
        switch (node.kind) {
            case 245 /* SyntaxKind.DoStatement */:
                return visitDoStatement(node);
            case 246 /* SyntaxKind.WhileStatement */:
                return visitWhileStatement(node);
            case 254 /* SyntaxKind.SwitchStatement */:
                return visitSwitchStatement(node);
            case 255 /* SyntaxKind.LabeledStatement */:
                return visitLabeledStatement(node);
            default:
                return visitJavaScriptInGeneratorFunctionBody(node);
        }
    }
    /**
     * Visits a node that is contained within a generator function.
     *
     * @param node The node to visit.
     */
    function visitJavaScriptInGeneratorFunctionBody(node) {
        switch (node.kind) {
            case 261 /* SyntaxKind.FunctionDeclaration */:
                return visitFunctionDeclaration(node);
            case 217 /* SyntaxKind.FunctionExpression */:
                return visitFunctionExpression(node);
            case 176 /* SyntaxKind.GetAccessor */:
            case 177 /* SyntaxKind.SetAccessor */:
                return visitAccessorDeclaration(node);
            case 242 /* SyntaxKind.VariableStatement */:
                return visitVariableStatement(node);
            case 247 /* SyntaxKind.ForStatement */:
                return visitForStatement(node);
            case 248 /* SyntaxKind.ForInStatement */:
                return visitForInStatement(node);
            case 251 /* SyntaxKind.BreakStatement */:
                return visitBreakStatement(node);
            case 250 /* SyntaxKind.ContinueStatement */:
                return visitContinueStatement(node);
            case 252 /* SyntaxKind.ReturnStatement */:
                return visitReturnStatement(node);
            default:
                if (node.transformFlags & 1048576 /* TransformFlags.ContainsYield */) {
                    return visitJavaScriptContainingYield(node);
                }
                else if (node.transformFlags & (2048 /* TransformFlags.ContainsGenerator */ | 4194304 /* TransformFlags.ContainsHoistedDeclarationOrCompletion */)) {
                    return (0, ts_1.visitEachChild)(node, visitor, context);
                }
                else {
                    return node;
                }
        }
    }
    /**
     * Visits a node that contains a YieldExpression.
     *
     * @param node The node to visit.
     */
    function visitJavaScriptContainingYield(node) {
        switch (node.kind) {
            case 225 /* SyntaxKind.BinaryExpression */:
                return visitBinaryExpression(node);
            case 360 /* SyntaxKind.CommaListExpression */:
                return visitCommaListExpression(node);
            case 226 /* SyntaxKind.ConditionalExpression */:
                return visitConditionalExpression(node);
            case 228 /* SyntaxKind.YieldExpression */:
                return visitYieldExpression(node);
            case 208 /* SyntaxKind.ArrayLiteralExpression */:
                return visitArrayLiteralExpression(node);
            case 209 /* SyntaxKind.ObjectLiteralExpression */:
                return visitObjectLiteralExpression(node);
            case 211 /* SyntaxKind.ElementAccessExpression */:
                return visitElementAccessExpression(node);
            case 212 /* SyntaxKind.CallExpression */:
                return visitCallExpression(node);
            case 213 /* SyntaxKind.NewExpression */:
                return visitNewExpression(node);
            default:
                return (0, ts_1.visitEachChild)(node, visitor, context);
        }
    }
    /**
     * Visits a generator function.
     *
     * @param node The node to visit.
     */
    function visitGenerator(node) {
        switch (node.kind) {
            case 261 /* SyntaxKind.FunctionDeclaration */:
                return visitFunctionDeclaration(node);
            case 217 /* SyntaxKind.FunctionExpression */:
                return visitFunctionExpression(node);
            default:
                return ts_1.Debug.failBadSyntaxKind(node);
        }
    }
    /**
     * Visits a function declaration.
     *
     * This will be called when one of the following conditions are met:
     * - The function declaration is a generator function.
     * - The function declaration is contained within the body of a generator function.
     *
     * @param node The node to visit.
     */
    function visitFunctionDeclaration(node) {
        // Currently, we only support generators that were originally async functions.
        if (node.asteriskToken) {
            node = (0, ts_1.setOriginalNode)((0, ts_1.setTextRange)(factory.createFunctionDeclaration(node.modifiers, 
            /*asteriskToken*/ undefined, node.name, 
            /*typeParameters*/ undefined, (0, ts_1.visitParameterList)(node.parameters, visitor, context), 
            /*type*/ undefined, transformGeneratorFunctionBody(node.body)), 
            /*location*/ node), node);
        }
        else {
            var savedInGeneratorFunctionBody = inGeneratorFunctionBody;
            var savedInStatementContainingYield = inStatementContainingYield;
            inGeneratorFunctionBody = false;
            inStatementContainingYield = false;
            node = (0, ts_1.visitEachChild)(node, visitor, context);
            inGeneratorFunctionBody = savedInGeneratorFunctionBody;
            inStatementContainingYield = savedInStatementContainingYield;
        }
        if (inGeneratorFunctionBody) {
            // Function declarations in a generator function body are hoisted
            // to the top of the lexical scope and elided from the current statement.
            hoistFunctionDeclaration(node);
            return undefined;
        }
        else {
            return node;
        }
    }
    /**
     * Visits a function expression.
     *
     * This will be called when one of the following conditions are met:
     * - The function expression is a generator function.
     * - The function expression is contained within the body of a generator function.
     *
     * @param node The node to visit.
     */
    function visitFunctionExpression(node) {
        // Currently, we only support generators that were originally async functions.
        if (node.asteriskToken) {
            node = (0, ts_1.setOriginalNode)((0, ts_1.setTextRange)(factory.createFunctionExpression(
            /*modifiers*/ undefined, 
            /*asteriskToken*/ undefined, node.name, 
            /*typeParameters*/ undefined, (0, ts_1.visitParameterList)(node.parameters, visitor, context), 
            /*type*/ undefined, transformGeneratorFunctionBody(node.body)), 
            /*location*/ node), node);
        }
        else {
            var savedInGeneratorFunctionBody = inGeneratorFunctionBody;
            var savedInStatementContainingYield = inStatementContainingYield;
            inGeneratorFunctionBody = false;
            inStatementContainingYield = false;
            node = (0, ts_1.visitEachChild)(node, visitor, context);
            inGeneratorFunctionBody = savedInGeneratorFunctionBody;
            inStatementContainingYield = savedInStatementContainingYield;
        }
        return node;
    }
    /**
     * Visits a get or set accessor declaration.
     *
     * This will be called when one of the following conditions are met:
     * - The accessor is contained within the body of a generator function.
     *
     * @param node The node to visit.
     */
    function visitAccessorDeclaration(node) {
        var savedInGeneratorFunctionBody = inGeneratorFunctionBody;
        var savedInStatementContainingYield = inStatementContainingYield;
        inGeneratorFunctionBody = false;
        inStatementContainingYield = false;
        node = (0, ts_1.visitEachChild)(node, visitor, context);
        inGeneratorFunctionBody = savedInGeneratorFunctionBody;
        inStatementContainingYield = savedInStatementContainingYield;
        return node;
    }
    /**
     * Transforms the body of a generator function declaration.
     *
     * @param node The function body to transform.
     */
    function transformGeneratorFunctionBody(body) {
        // Save existing generator state
        var statements = [];
        var savedInGeneratorFunctionBody = inGeneratorFunctionBody;
        var savedInStatementContainingYield = inStatementContainingYield;
        var savedBlocks = blocks;
        var savedBlockOffsets = blockOffsets;
        var savedBlockActions = blockActions;
        var savedBlockStack = blockStack;
        var savedLabelOffsets = labelOffsets;
        var savedLabelExpressions = labelExpressions;
        var savedNextLabelId = nextLabelId;
        var savedOperations = operations;
        var savedOperationArguments = operationArguments;
        var savedOperationLocations = operationLocations;
        var savedState = state;
        // Initialize generator state
        inGeneratorFunctionBody = true;
        inStatementContainingYield = false;
        blocks = undefined;
        blockOffsets = undefined;
        blockActions = undefined;
        blockStack = undefined;
        labelOffsets = undefined;
        labelExpressions = undefined;
        nextLabelId = 1;
        operations = undefined;
        operationArguments = undefined;
        operationLocations = undefined;
        state = factory.createTempVariable(/*recordTempVariable*/ undefined);
        // Build the generator
        resumeLexicalEnvironment();
        var statementOffset = factory.copyPrologue(body.statements, statements, /*ensureUseStrict*/ false, visitor);
        transformAndEmitStatements(body.statements, statementOffset);
        var buildResult = build();
        (0, ts_1.insertStatementsAfterStandardPrologue)(statements, endLexicalEnvironment());
        statements.push(factory.createReturnStatement(buildResult));
        // Restore previous generator state
        inGeneratorFunctionBody = savedInGeneratorFunctionBody;
        inStatementContainingYield = savedInStatementContainingYield;
        blocks = savedBlocks;
        blockOffsets = savedBlockOffsets;
        blockActions = savedBlockActions;
        blockStack = savedBlockStack;
        labelOffsets = savedLabelOffsets;
        labelExpressions = savedLabelExpressions;
        nextLabelId = savedNextLabelId;
        operations = savedOperations;
        operationArguments = savedOperationArguments;
        operationLocations = savedOperationLocations;
        state = savedState;
        return (0, ts_1.setTextRange)(factory.createBlock(statements, body.multiLine), body);
    }
    /**
     * Visits a variable statement.
     *
     * This will be called when one of the following conditions are met:
     * - The variable statement is contained within the body of a generator function.
     *
     * @param node The node to visit.
     */
    function visitVariableStatement(node) {
        if (node.transformFlags & 1048576 /* TransformFlags.ContainsYield */) {
            transformAndEmitVariableDeclarationList(node.declarationList);
            return undefined;
        }
        else {
            // Do not hoist custom prologues.
            if ((0, ts_1.getEmitFlags)(node) & 2097152 /* EmitFlags.CustomPrologue */) {
                return node;
            }
            for (var _i = 0, _a = node.declarationList.declarations; _i < _a.length; _i++) {
                var variable = _a[_i];
                hoistVariableDeclaration(variable.name);
            }
            var variables = (0, ts_1.getInitializedVariables)(node.declarationList);
            if (variables.length === 0) {
                return undefined;
            }
            return (0, ts_1.setSourceMapRange)(factory.createExpressionStatement(factory.inlineExpressions((0, ts_1.map)(variables, transformInitializedVariable))), node);
        }
    }
    /**
     * Visits a binary expression.
     *
     * This will be called when one of the following conditions are met:
     * - The node contains a YieldExpression.
     *
     * @param node The node to visit.
     */
    function visitBinaryExpression(node) {
        var assoc = (0, ts_1.getExpressionAssociativity)(node);
        switch (assoc) {
            case 0 /* Associativity.Left */:
                return visitLeftAssociativeBinaryExpression(node);
            case 1 /* Associativity.Right */:
                return visitRightAssociativeBinaryExpression(node);
            default:
                return ts_1.Debug.assertNever(assoc);
        }
    }
    /**
     * Visits a right-associative binary expression containing `yield`.
     *
     * @param node The node to visit.
     */
    function visitRightAssociativeBinaryExpression(node) {
        var left = node.left, right = node.right;
        if (containsYield(right)) {
            var target = void 0;
            switch (left.kind) {
                case 210 /* SyntaxKind.PropertyAccessExpression */:
                    // [source]
                    //      a.b = yield;
                    //
                    // [intermediate]
                    //  .local _a
                    //      _a = a;
                    //  .yield resumeLabel
                    //  .mark resumeLabel
                    //      _a.b = %sent%;
                    target = factory.updatePropertyAccessExpression(left, cacheExpression(ts_1.Debug.checkDefined((0, ts_1.visitNode)(left.expression, visitor, ts_1.isLeftHandSideExpression))), left.name);
                    break;
                case 211 /* SyntaxKind.ElementAccessExpression */:
                    // [source]
                    //      a[b] = yield;
                    //
                    // [intermediate]
                    //  .local _a, _b
                    //      _a = a;
                    //      _b = b;
                    //  .yield resumeLabel
                    //  .mark resumeLabel
                    //      _a[_b] = %sent%;
                    target = factory.updateElementAccessExpression(left, cacheExpression(ts_1.Debug.checkDefined((0, ts_1.visitNode)(left.expression, visitor, ts_1.isLeftHandSideExpression))), cacheExpression(ts_1.Debug.checkDefined((0, ts_1.visitNode)(left.argumentExpression, visitor, ts_1.isExpression))));
                    break;
                default:
                    target = ts_1.Debug.checkDefined((0, ts_1.visitNode)(left, visitor, ts_1.isExpression));
                    break;
            }
            var operator = node.operatorToken.kind;
            if ((0, ts_1.isCompoundAssignment)(operator)) {
                return (0, ts_1.setTextRange)(factory.createAssignment(target, (0, ts_1.setTextRange)(factory.createBinaryExpression(cacheExpression(target), (0, ts_1.getNonAssignmentOperatorForCompoundAssignment)(operator), ts_1.Debug.checkDefined((0, ts_1.visitNode)(right, visitor, ts_1.isExpression))), node)), node);
            }
            else {
                return factory.updateBinaryExpression(node, target, node.operatorToken, ts_1.Debug.checkDefined((0, ts_1.visitNode)(right, visitor, ts_1.isExpression)));
            }
        }
        return (0, ts_1.visitEachChild)(node, visitor, context);
    }
    function visitLeftAssociativeBinaryExpression(node) {
        if (containsYield(node.right)) {
            if ((0, ts_1.isLogicalOperator)(node.operatorToken.kind)) {
                return visitLogicalBinaryExpression(node);
            }
            else if (node.operatorToken.kind === 28 /* SyntaxKind.CommaToken */) {
                return visitCommaExpression(node);
            }
            // [source]
            //      a() + (yield) + c()
            //
            // [intermediate]
            //  .local _a
            //      _a = a();
            //  .yield resumeLabel
            //      _a + %sent% + c()
            return factory.updateBinaryExpression(node, cacheExpression(ts_1.Debug.checkDefined((0, ts_1.visitNode)(node.left, visitor, ts_1.isExpression))), node.operatorToken, ts_1.Debug.checkDefined((0, ts_1.visitNode)(node.right, visitor, ts_1.isExpression)));
        }
        return (0, ts_1.visitEachChild)(node, visitor, context);
    }
    /**
     * Visits a comma expression containing `yield`.
     *
     * @param node The node to visit.
     */
    function visitCommaExpression(node) {
        // [source]
        //      x = a(), yield, b();
        //
        // [intermediate]
        //      a();
        //  .yield resumeLabel
        //  .mark resumeLabel
        //      x = %sent%, b();
        var pendingExpressions = [];
        visit(node.left);
        visit(node.right);
        return factory.inlineExpressions(pendingExpressions);
        function visit(node) {
            if ((0, ts_1.isBinaryExpression)(node) && node.operatorToken.kind === 28 /* SyntaxKind.CommaToken */) {
                visit(node.left);
                visit(node.right);
            }
            else {
                if (containsYield(node) && pendingExpressions.length > 0) {
                    emitWorker(1 /* OpCode.Statement */, [factory.createExpressionStatement(factory.inlineExpressions(pendingExpressions))]);
                    pendingExpressions = [];
                }
                pendingExpressions.push(ts_1.Debug.checkDefined((0, ts_1.visitNode)(node, visitor, ts_1.isExpression)));
            }
        }
    }
    /**
     * Visits a comma-list expression.
     *
     * @param node The node to visit.
     */
    function visitCommaListExpression(node) {
        // flattened version of `visitCommaExpression`
        var pendingExpressions = [];
        for (var _i = 0, _a = node.elements; _i < _a.length; _i++) {
            var elem = _a[_i];
            if ((0, ts_1.isBinaryExpression)(elem) && elem.operatorToken.kind === 28 /* SyntaxKind.CommaToken */) {
                pendingExpressions.push(visitCommaExpression(elem));
            }
            else {
                if (containsYield(elem) && pendingExpressions.length > 0) {
                    emitWorker(1 /* OpCode.Statement */, [factory.createExpressionStatement(factory.inlineExpressions(pendingExpressions))]);
                    pendingExpressions = [];
                }
                pendingExpressions.push(ts_1.Debug.checkDefined((0, ts_1.visitNode)(elem, visitor, ts_1.isExpression)));
            }
        }
        return factory.inlineExpressions(pendingExpressions);
    }
    /**
     * Visits a logical binary expression containing `yield`.
     *
     * @param node A node to visit.
     */
    function visitLogicalBinaryExpression(node) {
        // Logical binary expressions (`&&` and `||`) are shortcutting expressions and need
        // to be transformed as such:
        //
        // [source]
        //      x = a() && yield;
        //
        // [intermediate]
        //  .local _a
        //      _a = a();
        //  .brfalse resultLabel, (_a)
        //  .yield resumeLabel
        //  .mark resumeLabel
        //      _a = %sent%;
        //  .mark resultLabel
        //      x = _a;
        //
        // [source]
        //      x = a() || yield;
        //
        // [intermediate]
        //  .local _a
        //      _a = a();
        //  .brtrue resultLabel, (_a)
        //  .yield resumeLabel
        //  .mark resumeLabel
        //      _a = %sent%;
        //  .mark resultLabel
        //      x = _a;
        var resultLabel = defineLabel();
        var resultLocal = declareLocal();
        emitAssignment(resultLocal, ts_1.Debug.checkDefined((0, ts_1.visitNode)(node.left, visitor, ts_1.isExpression)), /*location*/ node.left);
        if (node.operatorToken.kind === 56 /* SyntaxKind.AmpersandAmpersandToken */) {
            // Logical `&&` shortcuts when the left-hand operand is falsey.
            emitBreakWhenFalse(resultLabel, resultLocal, /*location*/ node.left);
        }
        else {
            // Logical `||` shortcuts when the left-hand operand is truthy.
            emitBreakWhenTrue(resultLabel, resultLocal, /*location*/ node.left);
        }
        emitAssignment(resultLocal, ts_1.Debug.checkDefined((0, ts_1.visitNode)(node.right, visitor, ts_1.isExpression)), /*location*/ node.right);
        markLabel(resultLabel);
        return resultLocal;
    }
    /**
     * Visits a conditional expression containing `yield`.
     *
     * @param node The node to visit.
     */
    function visitConditionalExpression(node) {
        // [source]
        //      x = a() ? yield : b();
        //
        // [intermediate]
        //  .local _a
        //  .brfalse whenFalseLabel, (a())
        //  .yield resumeLabel
        //  .mark resumeLabel
        //      _a = %sent%;
        //  .br resultLabel
        //  .mark whenFalseLabel
        //      _a = b();
        //  .mark resultLabel
        //      x = _a;
        // We only need to perform a specific transformation if a `yield` expression exists
        // in either the `whenTrue` or `whenFalse` branches.
        // A `yield` in the condition will be handled by the normal visitor.
        if (containsYield(node.whenTrue) || containsYield(node.whenFalse)) {
            var whenFalseLabel = defineLabel();
            var resultLabel = defineLabel();
            var resultLocal = declareLocal();
            emitBreakWhenFalse(whenFalseLabel, ts_1.Debug.checkDefined((0, ts_1.visitNode)(node.condition, visitor, ts_1.isExpression)), /*location*/ node.condition);
            emitAssignment(resultLocal, ts_1.Debug.checkDefined((0, ts_1.visitNode)(node.whenTrue, visitor, ts_1.isExpression)), /*location*/ node.whenTrue);
            emitBreak(resultLabel);
            markLabel(whenFalseLabel);
            emitAssignment(resultLocal, ts_1.Debug.checkDefined((0, ts_1.visitNode)(node.whenFalse, visitor, ts_1.isExpression)), /*location*/ node.whenFalse);
            markLabel(resultLabel);
            return resultLocal;
        }
        return (0, ts_1.visitEachChild)(node, visitor, context);
    }
    /**
     * Visits a `yield` expression.
     *
     * @param node The node to visit.
     */
    function visitYieldExpression(node) {
        // [source]
        //      x = yield a();
        //
        // [intermediate]
        //  .yield resumeLabel, (a())
        //  .mark resumeLabel
        //      x = %sent%;
        var resumeLabel = defineLabel();
        var expression = (0, ts_1.visitNode)(node.expression, visitor, ts_1.isExpression);
        if (node.asteriskToken) {
            // NOTE: `expression` must be defined for `yield*`.
            var iterator = ((0, ts_1.getEmitFlags)(node.expression) & 8388608 /* EmitFlags.Iterator */) === 0
                ? (0, ts_1.setTextRange)(emitHelpers().createValuesHelper(expression), node)
                : expression;
            emitYieldStar(iterator, /*location*/ node);
        }
        else {
            emitYield(expression, /*location*/ node);
        }
        markLabel(resumeLabel);
        return createGeneratorResume(/*location*/ node);
    }
    /**
     * Visits an ArrayLiteralExpression that contains a YieldExpression.
     *
     * @param node The node to visit.
     */
    function visitArrayLiteralExpression(node) {
        return visitElements(node.elements, /*leadingElement*/ undefined, /*location*/ undefined, node.multiLine);
    }
    /**
     * Visits an array of expressions containing one or more YieldExpression nodes
     * and returns an expression for the resulting value.
     *
     * @param elements The elements to visit.
     * @param multiLine Whether array literals created should be emitted on multiple lines.
     */
    function visitElements(elements, leadingElement, location, multiLine) {
        // [source]
        //      ar = [1, yield, 2];
        //
        // [intermediate]
        //  .local _a
        //      _a = [1];
        //  .yield resumeLabel
        //  .mark resumeLabel
        //      ar = _a.concat([%sent%, 2]);
        var numInitialElements = countInitialNodesWithoutYield(elements);
        var temp;
        if (numInitialElements > 0) {
            temp = declareLocal();
            var initialElements = (0, ts_1.visitNodes)(elements, visitor, ts_1.isExpression, 0, numInitialElements);
            emitAssignment(temp, factory.createArrayLiteralExpression(leadingElement
                ? __spreadArray([leadingElement], initialElements, true) : initialElements));
            leadingElement = undefined;
        }
        var expressions = (0, ts_1.reduceLeft)(elements, reduceElement, [], numInitialElements);
        return temp
            ? factory.createArrayConcatCall(temp, [factory.createArrayLiteralExpression(expressions, multiLine)])
            : (0, ts_1.setTextRange)(factory.createArrayLiteralExpression(leadingElement ? __spreadArray([leadingElement], expressions, true) : expressions, multiLine), location);
        function reduceElement(expressions, element) {
            if (containsYield(element) && expressions.length > 0) {
                var hasAssignedTemp = temp !== undefined;
                if (!temp) {
                    temp = declareLocal();
                }
                emitAssignment(temp, hasAssignedTemp
                    ? factory.createArrayConcatCall(temp, [factory.createArrayLiteralExpression(expressions, multiLine)])
                    : factory.createArrayLiteralExpression(leadingElement ? __spreadArray([leadingElement], expressions, true) : expressions, multiLine));
                leadingElement = undefined;
                expressions = [];
            }
            expressions.push(ts_1.Debug.checkDefined((0, ts_1.visitNode)(element, visitor, ts_1.isExpression)));
            return expressions;
        }
    }
    function visitObjectLiteralExpression(node) {
        // [source]
        //      o = {
        //          a: 1,
        //          b: yield,
        //          c: 2
        //      };
        //
        // [intermediate]
        //  .local _a
        //      _a = {
        //          a: 1
        //      };
        //  .yield resumeLabel
        //  .mark resumeLabel
        //      o = (_a.b = %sent%,
        //          _a.c = 2,
        //          _a);
        var properties = node.properties;
        var multiLine = node.multiLine;
        var numInitialProperties = countInitialNodesWithoutYield(properties);
        var temp = declareLocal();
        emitAssignment(temp, factory.createObjectLiteralExpression((0, ts_1.visitNodes)(properties, visitor, ts_1.isObjectLiteralElementLike, 0, numInitialProperties), multiLine));
        var expressions = (0, ts_1.reduceLeft)(properties, reduceProperty, [], numInitialProperties);
        // TODO(rbuckton): Does this need to be parented?
        expressions.push(multiLine ? (0, ts_1.startOnNewLine)((0, ts_1.setParent)((0, ts_1.setTextRange)(factory.cloneNode(temp), temp), temp.parent)) : temp);
        return factory.inlineExpressions(expressions);
        function reduceProperty(expressions, property) {
            if (containsYield(property) && expressions.length > 0) {
                emitStatement(factory.createExpressionStatement(factory.inlineExpressions(expressions)));
                expressions = [];
            }
            var expression = (0, ts_1.createExpressionForObjectLiteralElementLike)(factory, node, property, temp);
            var visited = (0, ts_1.visitNode)(expression, visitor, ts_1.isExpression);
            if (visited) {
                if (multiLine) {
                    (0, ts_1.startOnNewLine)(visited);
                }
                expressions.push(visited);
            }
            return expressions;
        }
    }
    /**
     * Visits an ElementAccessExpression that contains a YieldExpression.
     *
     * @param node The node to visit.
     */
    function visitElementAccessExpression(node) {
        if (containsYield(node.argumentExpression)) {
            // [source]
            //      a = x[yield];
            //
            // [intermediate]
            //  .local _a
            //      _a = x;
            //  .yield resumeLabel
            //  .mark resumeLabel
            //      a = _a[%sent%]
            return factory.updateElementAccessExpression(node, cacheExpression(ts_1.Debug.checkDefined((0, ts_1.visitNode)(node.expression, visitor, ts_1.isLeftHandSideExpression))), ts_1.Debug.checkDefined((0, ts_1.visitNode)(node.argumentExpression, visitor, ts_1.isExpression)));
        }
        return (0, ts_1.visitEachChild)(node, visitor, context);
    }
    function visitCallExpression(node) {
        if (!(0, ts_1.isImportCall)(node) && (0, ts_1.forEach)(node.arguments, containsYield)) {
            // [source]
            //      a.b(1, yield, 2);
            //
            // [intermediate]
            //  .local _a, _b, _c
            //      _b = (_a = a).b;
            //      _c = [1];
            //  .yield resumeLabel
            //  .mark resumeLabel
            //      _b.apply(_a, _c.concat([%sent%, 2]));
            var _a = factory.createCallBinding(node.expression, hoistVariableDeclaration, languageVersion, /*cacheIdentifiers*/ true), target = _a.target, thisArg = _a.thisArg;
            return (0, ts_1.setOriginalNode)((0, ts_1.setTextRange)(factory.createFunctionApplyCall(cacheExpression(ts_1.Debug.checkDefined((0, ts_1.visitNode)(target, visitor, ts_1.isLeftHandSideExpression))), thisArg, visitElements(node.arguments)), node), node);
        }
        return (0, ts_1.visitEachChild)(node, visitor, context);
    }
    function visitNewExpression(node) {
        if ((0, ts_1.forEach)(node.arguments, containsYield)) {
            // [source]
            //      new a.b(1, yield, 2);
            //
            // [intermediate]
            //  .local _a, _b, _c
            //      _b = (_a = a.b).bind;
            //      _c = [1];
            //  .yield resumeLabel
            //  .mark resumeLabel
            //      new (_b.apply(_a, _c.concat([%sent%, 2])));
            var _a = factory.createCallBinding(factory.createPropertyAccessExpression(node.expression, "bind"), hoistVariableDeclaration), target = _a.target, thisArg = _a.thisArg;
            return (0, ts_1.setOriginalNode)((0, ts_1.setTextRange)(factory.createNewExpression(factory.createFunctionApplyCall(cacheExpression(ts_1.Debug.checkDefined((0, ts_1.visitNode)(target, visitor, ts_1.isExpression))), thisArg, visitElements(node.arguments, 
            /*leadingElement*/ factory.createVoidZero())), 
            /*typeArguments*/ undefined, []), node), node);
        }
        return (0, ts_1.visitEachChild)(node, visitor, context);
    }
    function transformAndEmitStatements(statements, start) {
        if (start === void 0) { start = 0; }
        var numStatements = statements.length;
        for (var i = start; i < numStatements; i++) {
            transformAndEmitStatement(statements[i]);
        }
    }
    function transformAndEmitEmbeddedStatement(node) {
        if ((0, ts_1.isBlock)(node)) {
            transformAndEmitStatements(node.statements);
        }
        else {
            transformAndEmitStatement(node);
        }
    }
    function transformAndEmitStatement(node) {
        var savedInStatementContainingYield = inStatementContainingYield;
        if (!inStatementContainingYield) {
            inStatementContainingYield = containsYield(node);
        }
        transformAndEmitStatementWorker(node);
        inStatementContainingYield = savedInStatementContainingYield;
    }
    function transformAndEmitStatementWorker(node) {
        switch (node.kind) {
            case 240 /* SyntaxKind.Block */:
                return transformAndEmitBlock(node);
            case 243 /* SyntaxKind.ExpressionStatement */:
                return transformAndEmitExpressionStatement(node);
            case 244 /* SyntaxKind.IfStatement */:
                return transformAndEmitIfStatement(node);
            case 245 /* SyntaxKind.DoStatement */:
                return transformAndEmitDoStatement(node);
            case 246 /* SyntaxKind.WhileStatement */:
                return transformAndEmitWhileStatement(node);
            case 247 /* SyntaxKind.ForStatement */:
                return transformAndEmitForStatement(node);
            case 248 /* SyntaxKind.ForInStatement */:
                return transformAndEmitForInStatement(node);
            case 250 /* SyntaxKind.ContinueStatement */:
                return transformAndEmitContinueStatement(node);
            case 251 /* SyntaxKind.BreakStatement */:
                return transformAndEmitBreakStatement(node);
            case 252 /* SyntaxKind.ReturnStatement */:
                return transformAndEmitReturnStatement(node);
            case 253 /* SyntaxKind.WithStatement */:
                return transformAndEmitWithStatement(node);
            case 254 /* SyntaxKind.SwitchStatement */:
                return transformAndEmitSwitchStatement(node);
            case 255 /* SyntaxKind.LabeledStatement */:
                return transformAndEmitLabeledStatement(node);
            case 256 /* SyntaxKind.ThrowStatement */:
                return transformAndEmitThrowStatement(node);
            case 257 /* SyntaxKind.TryStatement */:
                return transformAndEmitTryStatement(node);
            default:
                return emitStatement((0, ts_1.visitNode)(node, visitor, ts_1.isStatement));
        }
    }
    function transformAndEmitBlock(node) {
        if (containsYield(node)) {
            transformAndEmitStatements(node.statements);
        }
        else {
            emitStatement((0, ts_1.visitNode)(node, visitor, ts_1.isStatement));
        }
    }
    function transformAndEmitExpressionStatement(node) {
        emitStatement((0, ts_1.visitNode)(node, visitor, ts_1.isStatement));
    }
    function transformAndEmitVariableDeclarationList(node) {
        for (var _i = 0, _a = node.declarations; _i < _a.length; _i++) {
            var variable = _a[_i];
            var name_1 = factory.cloneNode(variable.name);
            (0, ts_1.setCommentRange)(name_1, variable.name);
            hoistVariableDeclaration(name_1);
        }
        var variables = (0, ts_1.getInitializedVariables)(node);
        var numVariables = variables.length;
        var variablesWritten = 0;
        var pendingExpressions = [];
        while (variablesWritten < numVariables) {
            for (var i = variablesWritten; i < numVariables; i++) {
                var variable = variables[i];
                if (containsYield(variable.initializer) && pendingExpressions.length > 0) {
                    break;
                }
                pendingExpressions.push(transformInitializedVariable(variable));
            }
            if (pendingExpressions.length) {
                emitStatement(factory.createExpressionStatement(factory.inlineExpressions(pendingExpressions)));
                variablesWritten += pendingExpressions.length;
                pendingExpressions = [];
            }
        }
        return undefined;
    }
    function transformInitializedVariable(node) {
        return (0, ts_1.setSourceMapRange)(factory.createAssignment((0, ts_1.setSourceMapRange)(factory.cloneNode(node.name), node.name), ts_1.Debug.checkDefined((0, ts_1.visitNode)(node.initializer, visitor, ts_1.isExpression))), node);
    }
    function transformAndEmitIfStatement(node) {
        if (containsYield(node)) {
            // [source]
            //      if (x)
            //          /*thenStatement*/
            //      else
            //          /*elseStatement*/
            //
            // [intermediate]
            //  .brfalse elseLabel, (x)
            //      /*thenStatement*/
            //  .br endLabel
            //  .mark elseLabel
            //      /*elseStatement*/
            //  .mark endLabel
            if (containsYield(node.thenStatement) || containsYield(node.elseStatement)) {
                var endLabel = defineLabel();
                var elseLabel = node.elseStatement ? defineLabel() : undefined;
                emitBreakWhenFalse(node.elseStatement ? elseLabel : endLabel, ts_1.Debug.checkDefined((0, ts_1.visitNode)(node.expression, visitor, ts_1.isExpression)), /*location*/ node.expression);
                transformAndEmitEmbeddedStatement(node.thenStatement);
                if (node.elseStatement) {
                    emitBreak(endLabel);
                    markLabel(elseLabel);
                    transformAndEmitEmbeddedStatement(node.elseStatement);
                }
                markLabel(endLabel);
            }
            else {
                emitStatement((0, ts_1.visitNode)(node, visitor, ts_1.isStatement));
            }
        }
        else {
            emitStatement((0, ts_1.visitNode)(node, visitor, ts_1.isStatement));
        }
    }
    function transformAndEmitDoStatement(node) {
        if (containsYield(node)) {
            // [source]
            //      do {
            //          /*body*/
            //      }
            //      while (i < 10);
            //
            // [intermediate]
            //  .loop conditionLabel, endLabel
            //  .mark loopLabel
            //      /*body*/
            //  .mark conditionLabel
            //  .brtrue loopLabel, (i < 10)
            //  .endloop
            //  .mark endLabel
            var conditionLabel = defineLabel();
            var loopLabel = defineLabel();
            beginLoopBlock(/*continueLabel*/ conditionLabel);
            markLabel(loopLabel);
            transformAndEmitEmbeddedStatement(node.statement);
            markLabel(conditionLabel);
            emitBreakWhenTrue(loopLabel, ts_1.Debug.checkDefined((0, ts_1.visitNode)(node.expression, visitor, ts_1.isExpression)));
            endLoopBlock();
        }
        else {
            emitStatement((0, ts_1.visitNode)(node, visitor, ts_1.isStatement));
        }
    }
    function visitDoStatement(node) {
        if (inStatementContainingYield) {
            beginScriptLoopBlock();
            node = (0, ts_1.visitEachChild)(node, visitor, context);
            endLoopBlock();
            return node;
        }
        else {
            return (0, ts_1.visitEachChild)(node, visitor, context);
        }
    }
    function transformAndEmitWhileStatement(node) {
        if (containsYield(node)) {
            // [source]
            //      while (i < 10) {
            //          /*body*/
            //      }
            //
            // [intermediate]
            //  .loop loopLabel, endLabel
            //  .mark loopLabel
            //  .brfalse endLabel, (i < 10)
            //      /*body*/
            //  .br loopLabel
            //  .endloop
            //  .mark endLabel
            var loopLabel = defineLabel();
            var endLabel = beginLoopBlock(loopLabel);
            markLabel(loopLabel);
            emitBreakWhenFalse(endLabel, ts_1.Debug.checkDefined((0, ts_1.visitNode)(node.expression, visitor, ts_1.isExpression)));
            transformAndEmitEmbeddedStatement(node.statement);
            emitBreak(loopLabel);
            endLoopBlock();
        }
        else {
            emitStatement((0, ts_1.visitNode)(node, visitor, ts_1.isStatement));
        }
    }
    function visitWhileStatement(node) {
        if (inStatementContainingYield) {
            beginScriptLoopBlock();
            node = (0, ts_1.visitEachChild)(node, visitor, context);
            endLoopBlock();
            return node;
        }
        else {
            return (0, ts_1.visitEachChild)(node, visitor, context);
        }
    }
    function transformAndEmitForStatement(node) {
        if (containsYield(node)) {
            // [source]
            //      for (var i = 0; i < 10; i++) {
            //          /*body*/
            //      }
            //
            // [intermediate]
            //  .local i
            //      i = 0;
            //  .loop incrementLabel, endLoopLabel
            //  .mark conditionLabel
            //  .brfalse endLoopLabel, (i < 10)
            //      /*body*/
            //  .mark incrementLabel
            //      i++;
            //  .br conditionLabel
            //  .endloop
            //  .mark endLoopLabel
            var conditionLabel = defineLabel();
            var incrementLabel = defineLabel();
            var endLabel = beginLoopBlock(incrementLabel);
            if (node.initializer) {
                var initializer = node.initializer;
                if ((0, ts_1.isVariableDeclarationList)(initializer)) {
                    transformAndEmitVariableDeclarationList(initializer);
                }
                else {
                    emitStatement((0, ts_1.setTextRange)(factory.createExpressionStatement(ts_1.Debug.checkDefined((0, ts_1.visitNode)(initializer, visitor, ts_1.isExpression))), initializer));
                }
            }
            markLabel(conditionLabel);
            if (node.condition) {
                emitBreakWhenFalse(endLabel, ts_1.Debug.checkDefined((0, ts_1.visitNode)(node.condition, visitor, ts_1.isExpression)));
            }
            transformAndEmitEmbeddedStatement(node.statement);
            markLabel(incrementLabel);
            if (node.incrementor) {
                emitStatement((0, ts_1.setTextRange)(factory.createExpressionStatement(ts_1.Debug.checkDefined((0, ts_1.visitNode)(node.incrementor, visitor, ts_1.isExpression))), node.incrementor));
            }
            emitBreak(conditionLabel);
            endLoopBlock();
        }
        else {
            emitStatement((0, ts_1.visitNode)(node, visitor, ts_1.isStatement));
        }
    }
    function visitForStatement(node) {
        if (inStatementContainingYield) {
            beginScriptLoopBlock();
        }
        var initializer = node.initializer;
        if (initializer && (0, ts_1.isVariableDeclarationList)(initializer)) {
            for (var _i = 0, _a = initializer.declarations; _i < _a.length; _i++) {
                var variable = _a[_i];
                hoistVariableDeclaration(variable.name);
            }
            var variables = (0, ts_1.getInitializedVariables)(initializer);
            node = factory.updateForStatement(node, variables.length > 0
                ? factory.inlineExpressions((0, ts_1.map)(variables, transformInitializedVariable))
                : undefined, (0, ts_1.visitNode)(node.condition, visitor, ts_1.isExpression), (0, ts_1.visitNode)(node.incrementor, visitor, ts_1.isExpression), (0, ts_1.visitIterationBody)(node.statement, visitor, context));
        }
        else {
            node = (0, ts_1.visitEachChild)(node, visitor, context);
        }
        if (inStatementContainingYield) {
            endLoopBlock();
        }
        return node;
    }
    function transformAndEmitForInStatement(node) {
        if (containsYield(node)) {
            // [source]
            //      for (var p in o) {
            //          /*body*/
            //      }
            //
            // [intermediate]
            //  .local _b, _a, _c, _i
            //      _b = [];
            //      _a = o;
            //      for (_c in _a) _b.push(_c);
            //      _i = 0;
            //  .loop incrementLabel, endLoopLabel
            //  .mark conditionLabel
            //  .brfalse endLoopLabel, (_i < _b.length)
            //      _c = _b[_i];
            //  .brfalse incrementLabel, (_c in _a)
            //      p = _c;
            //      /*body*/
            //  .mark incrementLabel
            //      _c++;
            //  .br conditionLabel
            //  .endloop
            //  .mark endLoopLabel
            var obj = declareLocal(); // _a
            var keysArray = declareLocal(); // _b
            var key = declareLocal(); // _c
            var keysIndex = factory.createLoopVariable(); // _i
            var initializer = node.initializer;
            hoistVariableDeclaration(keysIndex);
            emitAssignment(obj, ts_1.Debug.checkDefined((0, ts_1.visitNode)(node.expression, visitor, ts_1.isExpression)));
            emitAssignment(keysArray, factory.createArrayLiteralExpression());
            emitStatement(factory.createForInStatement(key, obj, factory.createExpressionStatement(factory.createCallExpression(factory.createPropertyAccessExpression(keysArray, "push"), 
            /*typeArguments*/ undefined, [key]))));
            emitAssignment(keysIndex, factory.createNumericLiteral(0));
            var conditionLabel = defineLabel();
            var incrementLabel = defineLabel();
            var endLoopLabel = beginLoopBlock(incrementLabel);
            markLabel(conditionLabel);
            emitBreakWhenFalse(endLoopLabel, factory.createLessThan(keysIndex, factory.createPropertyAccessExpression(keysArray, "length")));
            emitAssignment(key, factory.createElementAccessExpression(keysArray, keysIndex));
            emitBreakWhenFalse(incrementLabel, factory.createBinaryExpression(key, 103 /* SyntaxKind.InKeyword */, obj));
            var variable = void 0;
            if ((0, ts_1.isVariableDeclarationList)(initializer)) {
                for (var _i = 0, _a = initializer.declarations; _i < _a.length; _i++) {
                    var variable_1 = _a[_i];
                    hoistVariableDeclaration(variable_1.name);
                }
                variable = factory.cloneNode(initializer.declarations[0].name);
            }
            else {
                variable = ts_1.Debug.checkDefined((0, ts_1.visitNode)(initializer, visitor, ts_1.isExpression));
                ts_1.Debug.assert((0, ts_1.isLeftHandSideExpression)(variable));
            }
            emitAssignment(variable, key);
            transformAndEmitEmbeddedStatement(node.statement);
            markLabel(incrementLabel);
            emitStatement(factory.createExpressionStatement(factory.createPostfixIncrement(keysIndex)));
            emitBreak(conditionLabel);
            endLoopBlock();
        }
        else {
            emitStatement((0, ts_1.visitNode)(node, visitor, ts_1.isStatement));
        }
    }
    function visitForInStatement(node) {
        // [source]
        //      for (var x in a) {
        //          /*body*/
        //      }
        //
        // [intermediate]
        //  .local x
        //  .loop
        //      for (x in a) {
        //          /*body*/
        //      }
        //  .endloop
        if (inStatementContainingYield) {
            beginScriptLoopBlock();
        }
        var initializer = node.initializer;
        if ((0, ts_1.isVariableDeclarationList)(initializer)) {
            for (var _i = 0, _a = initializer.declarations; _i < _a.length; _i++) {
                var variable = _a[_i];
                hoistVariableDeclaration(variable.name);
            }
            node = factory.updateForInStatement(node, initializer.declarations[0].name, ts_1.Debug.checkDefined((0, ts_1.visitNode)(node.expression, visitor, ts_1.isExpression)), ts_1.Debug.checkDefined((0, ts_1.visitNode)(node.statement, visitor, ts_1.isStatement, factory.liftToBlock)));
        }
        else {
            node = (0, ts_1.visitEachChild)(node, visitor, context);
        }
        if (inStatementContainingYield) {
            endLoopBlock();
        }
        return node;
    }
    function transformAndEmitContinueStatement(node) {
        var label = findContinueTarget(node.label ? (0, ts_1.idText)(node.label) : undefined);
        if (label > 0) {
            emitBreak(label, /*location*/ node);
        }
        else {
            // invalid continue without a containing loop. Leave the node as is, per #17875.
            emitStatement(node);
        }
    }
    function visitContinueStatement(node) {
        if (inStatementContainingYield) {
            var label = findContinueTarget(node.label && (0, ts_1.idText)(node.label));
            if (label > 0) {
                return createInlineBreak(label, /*location*/ node);
            }
        }
        return (0, ts_1.visitEachChild)(node, visitor, context);
    }
    function transformAndEmitBreakStatement(node) {
        var label = findBreakTarget(node.label ? (0, ts_1.idText)(node.label) : undefined);
        if (label > 0) {
            emitBreak(label, /*location*/ node);
        }
        else {
            // invalid break without a containing loop, switch, or labeled statement. Leave the node as is, per #17875.
            emitStatement(node);
        }
    }
    function visitBreakStatement(node) {
        if (inStatementContainingYield) {
            var label = findBreakTarget(node.label && (0, ts_1.idText)(node.label));
            if (label > 0) {
                return createInlineBreak(label, /*location*/ node);
            }
        }
        return (0, ts_1.visitEachChild)(node, visitor, context);
    }
    function transformAndEmitReturnStatement(node) {
        emitReturn((0, ts_1.visitNode)(node.expression, visitor, ts_1.isExpression), 
        /*location*/ node);
    }
    function visitReturnStatement(node) {
        return createInlineReturn((0, ts_1.visitNode)(node.expression, visitor, ts_1.isExpression), 
        /*location*/ node);
    }
    function transformAndEmitWithStatement(node) {
        if (containsYield(node)) {
            // [source]
            //      with (x) {
            //          /*body*/
            //      }
            //
            // [intermediate]
            //  .with (x)
            //      /*body*/
            //  .endwith
            beginWithBlock(cacheExpression(ts_1.Debug.checkDefined((0, ts_1.visitNode)(node.expression, visitor, ts_1.isExpression))));
            transformAndEmitEmbeddedStatement(node.statement);
            endWithBlock();
        }
        else {
            emitStatement((0, ts_1.visitNode)(node, visitor, ts_1.isStatement));
        }
    }
    function transformAndEmitSwitchStatement(node) {
        if (containsYield(node.caseBlock)) {
            // [source]
            //      switch (x) {
            //          case a:
            //              /*caseStatements*/
            //          case b:
            //              /*caseStatements*/
            //          default:
            //              /*defaultStatements*/
            //      }
            //
            // [intermediate]
            //  .local _a
            //  .switch endLabel
            //      _a = x;
            //      switch (_a) {
            //          case a:
            //  .br clauseLabels[0]
            //      }
            //      switch (_a) {
            //          case b:
            //  .br clauseLabels[1]
            //      }
            //  .br clauseLabels[2]
            //  .mark clauseLabels[0]
            //      /*caseStatements*/
            //  .mark clauseLabels[1]
            //      /*caseStatements*/
            //  .mark clauseLabels[2]
            //      /*caseStatements*/
            //  .endswitch
            //  .mark endLabel
            var caseBlock = node.caseBlock;
            var numClauses = caseBlock.clauses.length;
            var endLabel = beginSwitchBlock();
            var expression = cacheExpression(ts_1.Debug.checkDefined((0, ts_1.visitNode)(node.expression, visitor, ts_1.isExpression)));
            // Create labels for each clause and find the index of the first default clause.
            var clauseLabels = [];
            var defaultClauseIndex = -1;
            for (var i = 0; i < numClauses; i++) {
                var clause = caseBlock.clauses[i];
                clauseLabels.push(defineLabel());
                if (clause.kind === 296 /* SyntaxKind.DefaultClause */ && defaultClauseIndex === -1) {
                    defaultClauseIndex = i;
                }
            }
            // Emit switch statements for each run of case clauses either from the first case
            // clause or the next case clause with a `yield` in its expression, up to the next
            // case clause with a `yield` in its expression.
            var clausesWritten = 0;
            var pendingClauses = [];
            while (clausesWritten < numClauses) {
                var defaultClausesSkipped = 0;
                for (var i = clausesWritten; i < numClauses; i++) {
                    var clause = caseBlock.clauses[i];
                    if (clause.kind === 295 /* SyntaxKind.CaseClause */) {
                        if (containsYield(clause.expression) && pendingClauses.length > 0) {
                            break;
                        }
                        pendingClauses.push(factory.createCaseClause(ts_1.Debug.checkDefined((0, ts_1.visitNode)(clause.expression, visitor, ts_1.isExpression)), [
                            createInlineBreak(clauseLabels[i], /*location*/ clause.expression)
                        ]));
                    }
                    else {
                        defaultClausesSkipped++;
                    }
                }
                if (pendingClauses.length) {
                    emitStatement(factory.createSwitchStatement(expression, factory.createCaseBlock(pendingClauses)));
                    clausesWritten += pendingClauses.length;
                    pendingClauses = [];
                }
                if (defaultClausesSkipped > 0) {
                    clausesWritten += defaultClausesSkipped;
                    defaultClausesSkipped = 0;
                }
            }
            if (defaultClauseIndex >= 0) {
                emitBreak(clauseLabels[defaultClauseIndex]);
            }
            else {
                emitBreak(endLabel);
            }
            for (var i = 0; i < numClauses; i++) {
                markLabel(clauseLabels[i]);
                transformAndEmitStatements(caseBlock.clauses[i].statements);
            }
            endSwitchBlock();
        }
        else {
            emitStatement((0, ts_1.visitNode)(node, visitor, ts_1.isStatement));
        }
    }
    function visitSwitchStatement(node) {
        if (inStatementContainingYield) {
            beginScriptSwitchBlock();
        }
        node = (0, ts_1.visitEachChild)(node, visitor, context);
        if (inStatementContainingYield) {
            endSwitchBlock();
        }
        return node;
    }
    function transformAndEmitLabeledStatement(node) {
        if (containsYield(node)) {
            // [source]
            //      x: {
            //          /*body*/
            //      }
            //
            // [intermediate]
            //  .labeled "x", endLabel
            //      /*body*/
            //  .endlabeled
            //  .mark endLabel
            beginLabeledBlock((0, ts_1.idText)(node.label));
            transformAndEmitEmbeddedStatement(node.statement);
            endLabeledBlock();
        }
        else {
            emitStatement((0, ts_1.visitNode)(node, visitor, ts_1.isStatement));
        }
    }
    function visitLabeledStatement(node) {
        if (inStatementContainingYield) {
            beginScriptLabeledBlock((0, ts_1.idText)(node.label));
        }
        node = (0, ts_1.visitEachChild)(node, visitor, context);
        if (inStatementContainingYield) {
            endLabeledBlock();
        }
        return node;
    }
    function transformAndEmitThrowStatement(node) {
        var _a;
        // TODO(rbuckton): `expression` should be required on `throw`.
        emitThrow(ts_1.Debug.checkDefined((0, ts_1.visitNode)((_a = node.expression) !== null && _a !== void 0 ? _a : factory.createVoidZero(), visitor, ts_1.isExpression)), 
        /*location*/ node);
    }
    function transformAndEmitTryStatement(node) {
        if (containsYield(node)) {
            // [source]
            //      try {
            //          /*tryBlock*/
            //      }
            //      catch (e) {
            //          /*catchBlock*/
            //      }
            //      finally {
            //          /*finallyBlock*/
            //      }
            //
            // [intermediate]
            //  .local _a
            //  .try tryLabel, catchLabel, finallyLabel, endLabel
            //  .mark tryLabel
            //  .nop
            //      /*tryBlock*/
            //  .br endLabel
            //  .catch
            //  .mark catchLabel
            //      _a = %error%;
            //      /*catchBlock*/
            //  .br endLabel
            //  .finally
            //  .mark finallyLabel
            //      /*finallyBlock*/
            //  .endfinally
            //  .endtry
            //  .mark endLabel
            beginExceptionBlock();
            transformAndEmitEmbeddedStatement(node.tryBlock);
            if (node.catchClause) {
                beginCatchBlock(node.catchClause.variableDeclaration); // TODO: GH#18217
                transformAndEmitEmbeddedStatement(node.catchClause.block);
            }
            if (node.finallyBlock) {
                beginFinallyBlock();
                transformAndEmitEmbeddedStatement(node.finallyBlock);
            }
            endExceptionBlock();
        }
        else {
            emitStatement((0, ts_1.visitEachChild)(node, visitor, context));
        }
    }
    function containsYield(node) {
        return !!node && (node.transformFlags & 1048576 /* TransformFlags.ContainsYield */) !== 0;
    }
    function countInitialNodesWithoutYield(nodes) {
        var numNodes = nodes.length;
        for (var i = 0; i < numNodes; i++) {
            if (containsYield(nodes[i])) {
                return i;
            }
        }
        return -1;
    }
    function onSubstituteNode(hint, node) {
        node = previousOnSubstituteNode(hint, node);
        if (hint === 1 /* EmitHint.Expression */) {
            return substituteExpression(node);
        }
        return node;
    }
    function substituteExpression(node) {
        if ((0, ts_1.isIdentifier)(node)) {
            return substituteExpressionIdentifier(node);
        }
        return node;
    }
    function substituteExpressionIdentifier(node) {
        if (!(0, ts_1.isGeneratedIdentifier)(node) && renamedCatchVariables && renamedCatchVariables.has((0, ts_1.idText)(node))) {
            var original = (0, ts_1.getOriginalNode)(node);
            if ((0, ts_1.isIdentifier)(original) && original.parent) {
                var declaration = resolver.getReferencedValueDeclaration(original);
                if (declaration) {
                    var name_2 = renamedCatchVariableDeclarations[(0, ts_1.getOriginalNodeId)(declaration)];
                    if (name_2) {
                        // TODO(rbuckton): Does this need to be parented?
                        var clone = (0, ts_1.setParent)((0, ts_1.setTextRange)(factory.cloneNode(name_2), name_2), name_2.parent);
                        (0, ts_1.setSourceMapRange)(clone, node);
                        (0, ts_1.setCommentRange)(clone, node);
                        return clone;
                    }
                }
            }
        }
        return node;
    }
    function cacheExpression(node) {
        if ((0, ts_1.isGeneratedIdentifier)(node) || (0, ts_1.getEmitFlags)(node) & 8192 /* EmitFlags.HelperName */) {
            return node;
        }
        var temp = factory.createTempVariable(hoistVariableDeclaration);
        emitAssignment(temp, node, /*location*/ node);
        return temp;
    }
    function declareLocal(name) {
        var temp = name
            ? factory.createUniqueName(name)
            : factory.createTempVariable(/*recordTempVariable*/ undefined);
        hoistVariableDeclaration(temp);
        return temp;
    }
    /**
     * Defines a label, uses as the target of a Break operation.
     */
    function defineLabel() {
        if (!labelOffsets) {
            labelOffsets = [];
        }
        var label = nextLabelId;
        nextLabelId++;
        labelOffsets[label] = -1;
        return label;
    }
    /**
     * Marks the current operation with the specified label.
     */
    function markLabel(label) {
        ts_1.Debug.assert(labelOffsets !== undefined, "No labels were defined.");
        labelOffsets[label] = operations ? operations.length : 0;
    }
    /**
     * Begins a block operation (With, Break/Continue, Try/Catch/Finally)
     *
     * @param block Information about the block.
     */
    function beginBlock(block) {
        if (!blocks) {
            blocks = [];
            blockActions = [];
            blockOffsets = [];
            blockStack = [];
        }
        var index = blockActions.length;
        blockActions[index] = 0 /* BlockAction.Open */;
        blockOffsets[index] = operations ? operations.length : 0;
        blocks[index] = block;
        blockStack.push(block);
        return index;
    }
    /**
     * Ends the current block operation.
     */
    function endBlock() {
        var block = peekBlock();
        if (block === undefined)
            return ts_1.Debug.fail("beginBlock was never called.");
        var index = blockActions.length;
        blockActions[index] = 1 /* BlockAction.Close */;
        blockOffsets[index] = operations ? operations.length : 0;
        blocks[index] = block;
        blockStack.pop();
        return block;
    }
    /**
     * Gets the current open block.
     */
    function peekBlock() {
        return (0, ts_1.lastOrUndefined)(blockStack);
    }
    /**
     * Gets the kind of the current open block.
     */
    function peekBlockKind() {
        var block = peekBlock();
        return block && block.kind;
    }
    /**
     * Begins a code block for a generated `with` statement.
     *
     * @param expression An identifier representing expression for the `with` block.
     */
    function beginWithBlock(expression) {
        var startLabel = defineLabel();
        var endLabel = defineLabel();
        markLabel(startLabel);
        beginBlock({
            kind: 1 /* CodeBlockKind.With */,
            expression: expression,
            startLabel: startLabel,
            endLabel: endLabel
        });
    }
    /**
     * Ends a code block for a generated `with` statement.
     */
    function endWithBlock() {
        ts_1.Debug.assert(peekBlockKind() === 1 /* CodeBlockKind.With */);
        var block = endBlock();
        markLabel(block.endLabel);
    }
    /**
     * Begins a code block for a generated `try` statement.
     */
    function beginExceptionBlock() {
        var startLabel = defineLabel();
        var endLabel = defineLabel();
        markLabel(startLabel);
        beginBlock({
            kind: 0 /* CodeBlockKind.Exception */,
            state: 0 /* ExceptionBlockState.Try */,
            startLabel: startLabel,
            endLabel: endLabel
        });
        emitNop();
        return endLabel;
    }
    /**
     * Enters the `catch` clause of a generated `try` statement.
     *
     * @param variable The catch variable.
     */
    function beginCatchBlock(variable) {
        ts_1.Debug.assert(peekBlockKind() === 0 /* CodeBlockKind.Exception */);
        // generated identifiers should already be unique within a file
        var name;
        if ((0, ts_1.isGeneratedIdentifier)(variable.name)) {
            name = variable.name;
            hoistVariableDeclaration(variable.name);
        }
        else {
            var text = (0, ts_1.idText)(variable.name);
            name = declareLocal(text);
            if (!renamedCatchVariables) {
                renamedCatchVariables = new Map();
                renamedCatchVariableDeclarations = [];
                context.enableSubstitution(80 /* SyntaxKind.Identifier */);
            }
            renamedCatchVariables.set(text, true);
            renamedCatchVariableDeclarations[(0, ts_1.getOriginalNodeId)(variable)] = name;
        }
        var exception = peekBlock();
        ts_1.Debug.assert(exception.state < 1 /* ExceptionBlockState.Catch */);
        var endLabel = exception.endLabel;
        emitBreak(endLabel);
        var catchLabel = defineLabel();
        markLabel(catchLabel);
        exception.state = 1 /* ExceptionBlockState.Catch */;
        exception.catchVariable = name;
        exception.catchLabel = catchLabel;
        emitAssignment(name, factory.createCallExpression(factory.createPropertyAccessExpression(state, "sent"), /*typeArguments*/ undefined, []));
        emitNop();
    }
    /**
     * Enters the `finally` block of a generated `try` statement.
     */
    function beginFinallyBlock() {
        ts_1.Debug.assert(peekBlockKind() === 0 /* CodeBlockKind.Exception */);
        var exception = peekBlock();
        ts_1.Debug.assert(exception.state < 2 /* ExceptionBlockState.Finally */);
        var endLabel = exception.endLabel;
        emitBreak(endLabel);
        var finallyLabel = defineLabel();
        markLabel(finallyLabel);
        exception.state = 2 /* ExceptionBlockState.Finally */;
        exception.finallyLabel = finallyLabel;
    }
    /**
     * Ends the code block for a generated `try` statement.
     */
    function endExceptionBlock() {
        ts_1.Debug.assert(peekBlockKind() === 0 /* CodeBlockKind.Exception */);
        var exception = endBlock();
        var state = exception.state;
        if (state < 2 /* ExceptionBlockState.Finally */) {
            emitBreak(exception.endLabel);
        }
        else {
            emitEndfinally();
        }
        markLabel(exception.endLabel);
        emitNop();
        exception.state = 3 /* ExceptionBlockState.Done */;
    }
    /**
     * Begins a code block that supports `break` or `continue` statements that are defined in
     * the source tree and not from generated code.
     *
     * @param labelText Names from containing labeled statements.
     */
    function beginScriptLoopBlock() {
        beginBlock({
            kind: 3 /* CodeBlockKind.Loop */,
            isScript: true,
            breakLabel: -1,
            continueLabel: -1
        });
    }
    /**
     * Begins a code block that supports `break` or `continue` statements that are defined in
     * generated code. Returns a label used to mark the operation to which to jump when a
     * `break` statement targets this block.
     *
     * @param continueLabel A Label used to mark the operation to which to jump when a
     *                      `continue` statement targets this block.
     */
    function beginLoopBlock(continueLabel) {
        var breakLabel = defineLabel();
        beginBlock({
            kind: 3 /* CodeBlockKind.Loop */,
            isScript: false,
            breakLabel: breakLabel,
            continueLabel: continueLabel,
        });
        return breakLabel;
    }
    /**
     * Ends a code block that supports `break` or `continue` statements that are defined in
     * generated code or in the source tree.
     */
    function endLoopBlock() {
        ts_1.Debug.assert(peekBlockKind() === 3 /* CodeBlockKind.Loop */);
        var block = endBlock();
        var breakLabel = block.breakLabel;
        if (!block.isScript) {
            markLabel(breakLabel);
        }
    }
    /**
     * Begins a code block that supports `break` statements that are defined in the source
     * tree and not from generated code.
     *
     */
    function beginScriptSwitchBlock() {
        beginBlock({
            kind: 2 /* CodeBlockKind.Switch */,
            isScript: true,
            breakLabel: -1
        });
    }
    /**
     * Begins a code block that supports `break` statements that are defined in generated code.
     * Returns a label used to mark the operation to which to jump when a `break` statement
     * targets this block.
     */
    function beginSwitchBlock() {
        var breakLabel = defineLabel();
        beginBlock({
            kind: 2 /* CodeBlockKind.Switch */,
            isScript: false,
            breakLabel: breakLabel,
        });
        return breakLabel;
    }
    /**
     * Ends a code block that supports `break` statements that are defined in generated code.
     */
    function endSwitchBlock() {
        ts_1.Debug.assert(peekBlockKind() === 2 /* CodeBlockKind.Switch */);
        var block = endBlock();
        var breakLabel = block.breakLabel;
        if (!block.isScript) {
            markLabel(breakLabel);
        }
    }
    function beginScriptLabeledBlock(labelText) {
        beginBlock({
            kind: 4 /* CodeBlockKind.Labeled */,
            isScript: true,
            labelText: labelText,
            breakLabel: -1
        });
    }
    function beginLabeledBlock(labelText) {
        var breakLabel = defineLabel();
        beginBlock({
            kind: 4 /* CodeBlockKind.Labeled */,
            isScript: false,
            labelText: labelText,
            breakLabel: breakLabel
        });
    }
    function endLabeledBlock() {
        ts_1.Debug.assert(peekBlockKind() === 4 /* CodeBlockKind.Labeled */);
        var block = endBlock();
        if (!block.isScript) {
            markLabel(block.breakLabel);
        }
    }
    /**
     * Indicates whether the provided block supports `break` statements.
     *
     * @param block A code block.
     */
    function supportsUnlabeledBreak(block) {
        return block.kind === 2 /* CodeBlockKind.Switch */
            || block.kind === 3 /* CodeBlockKind.Loop */;
    }
    /**
     * Indicates whether the provided block supports `break` statements with labels.
     *
     * @param block A code block.
     */
    function supportsLabeledBreakOrContinue(block) {
        return block.kind === 4 /* CodeBlockKind.Labeled */;
    }
    /**
     * Indicates whether the provided block supports `continue` statements.
     *
     * @param block A code block.
     */
    function supportsUnlabeledContinue(block) {
        return block.kind === 3 /* CodeBlockKind.Loop */;
    }
    function hasImmediateContainingLabeledBlock(labelText, start) {
        for (var j = start; j >= 0; j--) {
            var containingBlock = blockStack[j];
            if (supportsLabeledBreakOrContinue(containingBlock)) {
                if (containingBlock.labelText === labelText) {
                    return true;
                }
            }
            else {
                break;
            }
        }
        return false;
    }
    /**
     * Finds the label that is the target for a `break` statement.
     *
     * @param labelText An optional name of a containing labeled statement.
     */
    function findBreakTarget(labelText) {
        if (blockStack) {
            if (labelText) {
                for (var i = blockStack.length - 1; i >= 0; i--) {
                    var block = blockStack[i];
                    if (supportsLabeledBreakOrContinue(block) && block.labelText === labelText) {
                        return block.breakLabel;
                    }
                    else if (supportsUnlabeledBreak(block) && hasImmediateContainingLabeledBlock(labelText, i - 1)) {
                        return block.breakLabel;
                    }
                }
            }
            else {
                for (var i = blockStack.length - 1; i >= 0; i--) {
                    var block = blockStack[i];
                    if (supportsUnlabeledBreak(block)) {
                        return block.breakLabel;
                    }
                }
            }
        }
        return 0;
    }
    /**
     * Finds the label that is the target for a `continue` statement.
     *
     * @param labelText An optional name of a containing labeled statement.
     */
    function findContinueTarget(labelText) {
        if (blockStack) {
            if (labelText) {
                for (var i = blockStack.length - 1; i >= 0; i--) {
                    var block = blockStack[i];
                    if (supportsUnlabeledContinue(block) && hasImmediateContainingLabeledBlock(labelText, i - 1)) {
                        return block.continueLabel;
                    }
                }
            }
            else {
                for (var i = blockStack.length - 1; i >= 0; i--) {
                    var block = blockStack[i];
                    if (supportsUnlabeledContinue(block)) {
                        return block.continueLabel;
                    }
                }
            }
        }
        return 0;
    }
    /**
     * Creates an expression that can be used to indicate the value for a label.
     *
     * @param label A label.
     */
    function createLabel(label) {
        if (label !== undefined && label > 0) {
            if (labelExpressions === undefined) {
                labelExpressions = [];
            }
            var expression = factory.createNumericLiteral(-1);
            if (labelExpressions[label] === undefined) {
                labelExpressions[label] = [expression];
            }
            else {
                labelExpressions[label].push(expression);
            }
            return expression;
        }
        return factory.createOmittedExpression();
    }
    /**
     * Creates a numeric literal for the provided instruction.
     */
    function createInstruction(instruction) {
        var literal = factory.createNumericLiteral(instruction);
        (0, ts_1.addSyntheticTrailingComment)(literal, 3 /* SyntaxKind.MultiLineCommentTrivia */, getInstructionName(instruction));
        return literal;
    }
    /**
     * Creates a statement that can be used indicate a Break operation to the provided label.
     *
     * @param label A label.
     * @param location An optional source map location for the statement.
     */
    function createInlineBreak(label, location) {
        ts_1.Debug.assertLessThan(0, label, "Invalid label");
        return (0, ts_1.setTextRange)(factory.createReturnStatement(factory.createArrayLiteralExpression([
            createInstruction(3 /* Instruction.Break */),
            createLabel(label)
        ])), location);
    }
    /**
     * Creates a statement that can be used indicate a Return operation.
     *
     * @param expression The expression for the return statement.
     * @param location An optional source map location for the statement.
     */
    function createInlineReturn(expression, location) {
        return (0, ts_1.setTextRange)(factory.createReturnStatement(factory.createArrayLiteralExpression(expression
            ? [createInstruction(2 /* Instruction.Return */), expression]
            : [createInstruction(2 /* Instruction.Return */)])), location);
    }
    /**
     * Creates an expression that can be used to resume from a Yield operation.
     */
    function createGeneratorResume(location) {
        return (0, ts_1.setTextRange)(factory.createCallExpression(factory.createPropertyAccessExpression(state, "sent"), 
        /*typeArguments*/ undefined, []), location);
    }
    /**
     * Emits an empty instruction.
     */
    function emitNop() {
        emitWorker(0 /* OpCode.Nop */);
    }
    /**
     * Emits a Statement.
     *
     * @param node A statement.
     */
    function emitStatement(node) {
        if (node) {
            emitWorker(1 /* OpCode.Statement */, [node]);
        }
        else {
            emitNop();
        }
    }
    /**
     * Emits an Assignment operation.
     *
     * @param left The left-hand side of the assignment.
     * @param right The right-hand side of the assignment.
     * @param location An optional source map location for the assignment.
     */
    function emitAssignment(left, right, location) {
        emitWorker(2 /* OpCode.Assign */, [left, right], location);
    }
    /**
     * Emits a Break operation to the specified label.
     *
     * @param label A label.
     * @param location An optional source map location for the assignment.
     */
    function emitBreak(label, location) {
        emitWorker(3 /* OpCode.Break */, [label], location);
    }
    /**
     * Emits a Break operation to the specified label when a condition evaluates to a truthy
     * value at runtime.
     *
     * @param label A label.
     * @param condition The condition.
     * @param location An optional source map location for the assignment.
     */
    function emitBreakWhenTrue(label, condition, location) {
        emitWorker(4 /* OpCode.BreakWhenTrue */, [label, condition], location);
    }
    /**
     * Emits a Break to the specified label when a condition evaluates to a falsey value at
     * runtime.
     *
     * @param label A label.
     * @param condition The condition.
     * @param location An optional source map location for the assignment.
     */
    function emitBreakWhenFalse(label, condition, location) {
        emitWorker(5 /* OpCode.BreakWhenFalse */, [label, condition], location);
    }
    /**
     * Emits a YieldStar operation for the provided expression.
     *
     * @param expression An optional value for the yield operation.
     * @param location An optional source map location for the assignment.
     */
    function emitYieldStar(expression, location) {
        emitWorker(7 /* OpCode.YieldStar */, [expression], location);
    }
    /**
     * Emits a Yield operation for the provided expression.
     *
     * @param expression An optional value for the yield operation.
     * @param location An optional source map location for the assignment.
     */
    function emitYield(expression, location) {
        emitWorker(6 /* OpCode.Yield */, [expression], location);
    }
    /**
     * Emits a Return operation for the provided expression.
     *
     * @param expression An optional value for the operation.
     * @param location An optional source map location for the assignment.
     */
    function emitReturn(expression, location) {
        emitWorker(8 /* OpCode.Return */, [expression], location);
    }
    /**
     * Emits a Throw operation for the provided expression.
     *
     * @param expression A value for the operation.
     * @param location An optional source map location for the assignment.
     */
    function emitThrow(expression, location) {
        emitWorker(9 /* OpCode.Throw */, [expression], location);
    }
    /**
     * Emits an Endfinally operation. This is used to handle `finally` block semantics.
     */
    function emitEndfinally() {
        emitWorker(10 /* OpCode.Endfinally */);
    }
    /**
     * Emits an operation.
     *
     * @param code The OpCode for the operation.
     * @param args The optional arguments for the operation.
     */
    function emitWorker(code, args, location) {
        if (operations === undefined) {
            operations = [];
            operationArguments = [];
            operationLocations = [];
        }
        if (labelOffsets === undefined) {
            // mark entry point
            markLabel(defineLabel());
        }
        var operationIndex = operations.length;
        operations[operationIndex] = code;
        operationArguments[operationIndex] = args;
        operationLocations[operationIndex] = location;
    }
    /**
     * Builds the generator function body.
     */
    function build() {
        blockIndex = 0;
        labelNumber = 0;
        labelNumbers = undefined;
        lastOperationWasAbrupt = false;
        lastOperationWasCompletion = false;
        clauses = undefined;
        statements = undefined;
        exceptionBlockStack = undefined;
        currentExceptionBlock = undefined;
        withBlockStack = undefined;
        var buildResult = buildStatements();
        return emitHelpers().createGeneratorHelper((0, ts_1.setEmitFlags)(factory.createFunctionExpression(
        /*modifiers*/ undefined, 
        /*asteriskToken*/ undefined, 
        /*name*/ undefined, 
        /*typeParameters*/ undefined, [factory.createParameterDeclaration(/*modifiers*/ undefined, /*dotDotDotToken*/ undefined, state)], 
        /*type*/ undefined, factory.createBlock(buildResult, 
        /*multiLine*/ buildResult.length > 0)), 1048576 /* EmitFlags.ReuseTempVariableScope */));
    }
    /**
     * Builds the statements for the generator function body.
     */
    function buildStatements() {
        if (operations) {
            for (var operationIndex = 0; operationIndex < operations.length; operationIndex++) {
                writeOperation(operationIndex);
            }
            flushFinalLabel(operations.length);
        }
        else {
            flushFinalLabel(0);
        }
        if (clauses) {
            var labelExpression = factory.createPropertyAccessExpression(state, "label");
            var switchStatement = factory.createSwitchStatement(labelExpression, factory.createCaseBlock(clauses));
            return [(0, ts_1.startOnNewLine)(switchStatement)];
        }
        if (statements) {
            return statements;
        }
        return [];
    }
    /**
     * Flush the current label and advance to a new label.
     */
    function flushLabel() {
        if (!statements) {
            return;
        }
        appendLabel(/*markLabelEnd*/ !lastOperationWasAbrupt);
        lastOperationWasAbrupt = false;
        lastOperationWasCompletion = false;
        labelNumber++;
    }
    /**
     * Flush the final label of the generator function body.
     */
    function flushFinalLabel(operationIndex) {
        if (isFinalLabelReachable(operationIndex)) {
            tryEnterLabel(operationIndex);
            withBlockStack = undefined;
            writeReturn(/*expression*/ undefined, /*operationLocation*/ undefined);
        }
        if (statements && clauses) {
            appendLabel(/*markLabelEnd*/ false);
        }
        updateLabelExpressions();
    }
    /**
     * Tests whether the final label of the generator function body
     * is reachable by user code.
     */
    function isFinalLabelReachable(operationIndex) {
        // if the last operation was *not* a completion (return/throw) then
        // the final label is reachable.
        if (!lastOperationWasCompletion) {
            return true;
        }
        // if there are no labels defined or referenced, then the final label is
        // not reachable.
        if (!labelOffsets || !labelExpressions) {
            return false;
        }
        // if the label for this offset is referenced, then the final label
        // is reachable.
        for (var label = 0; label < labelOffsets.length; label++) {
            if (labelOffsets[label] === operationIndex && labelExpressions[label]) {
                return true;
            }
        }
        return false;
    }
    /**
     * Appends a case clause for the last label and sets the new label.
     *
     * @param markLabelEnd Indicates that the transition between labels was a fall-through
     *                     from a previous case clause and the change in labels should be
     *                     reflected on the `state` object.
     */
    function appendLabel(markLabelEnd) {
        if (!clauses) {
            clauses = [];
        }
        if (statements) {
            if (withBlockStack) {
                // The previous label was nested inside one or more `with` blocks, so we
                // surround the statements in generated `with` blocks to create the same environment.
                for (var i = withBlockStack.length - 1; i >= 0; i--) {
                    var withBlock = withBlockStack[i];
                    statements = [factory.createWithStatement(withBlock.expression, factory.createBlock(statements))];
                }
            }
            if (currentExceptionBlock) {
                // The previous label was nested inside of an exception block, so we must
                // indicate entry into a protected region by pushing the label numbers
                // for each block in the protected region.
                var startLabel = currentExceptionBlock.startLabel, catchLabel = currentExceptionBlock.catchLabel, finallyLabel = currentExceptionBlock.finallyLabel, endLabel = currentExceptionBlock.endLabel;
                statements.unshift(factory.createExpressionStatement(factory.createCallExpression(factory.createPropertyAccessExpression(factory.createPropertyAccessExpression(state, "trys"), "push"), 
                /*typeArguments*/ undefined, [
                    factory.createArrayLiteralExpression([
                        createLabel(startLabel),
                        createLabel(catchLabel),
                        createLabel(finallyLabel),
                        createLabel(endLabel)
                    ])
                ])));
                currentExceptionBlock = undefined;
            }
            if (markLabelEnd) {
                // The case clause for the last label falls through to this label, so we
                // add an assignment statement to reflect the change in labels.
                statements.push(factory.createExpressionStatement(factory.createAssignment(factory.createPropertyAccessExpression(state, "label"), factory.createNumericLiteral(labelNumber + 1))));
            }
        }
        clauses.push(factory.createCaseClause(factory.createNumericLiteral(labelNumber), statements || []));
        statements = undefined;
    }
    /**
     * Tries to enter into a new label at the current operation index.
     */
    function tryEnterLabel(operationIndex) {
        if (!labelOffsets) {
            return;
        }
        for (var label = 0; label < labelOffsets.length; label++) {
            if (labelOffsets[label] === operationIndex) {
                flushLabel();
                if (labelNumbers === undefined) {
                    labelNumbers = [];
                }
                if (labelNumbers[labelNumber] === undefined) {
                    labelNumbers[labelNumber] = [label];
                }
                else {
                    labelNumbers[labelNumber].push(label);
                }
            }
        }
    }
    /**
     * Updates literal expressions for labels with actual label numbers.
     */
    function updateLabelExpressions() {
        if (labelExpressions !== undefined && labelNumbers !== undefined) {
            for (var labelNumber_1 = 0; labelNumber_1 < labelNumbers.length; labelNumber_1++) {
                var labels = labelNumbers[labelNumber_1];
                if (labels !== undefined) {
                    for (var _i = 0, labels_1 = labels; _i < labels_1.length; _i++) {
                        var label = labels_1[_i];
                        var expressions = labelExpressions[label];
                        if (expressions !== undefined) {
                            for (var _a = 0, expressions_1 = expressions; _a < expressions_1.length; _a++) {
                                var expression = expressions_1[_a];
                                expression.text = String(labelNumber_1);
                            }
                        }
                    }
                }
            }
        }
    }
    /**
     * Tries to enter or leave a code block.
     */
    function tryEnterOrLeaveBlock(operationIndex) {
        if (blocks) {
            for (; blockIndex < blockActions.length && blockOffsets[blockIndex] <= operationIndex; blockIndex++) {
                var block = blocks[blockIndex];
                var blockAction = blockActions[blockIndex];
                switch (block.kind) {
                    case 0 /* CodeBlockKind.Exception */:
                        if (blockAction === 0 /* BlockAction.Open */) {
                            if (!exceptionBlockStack) {
                                exceptionBlockStack = [];
                            }
                            if (!statements) {
                                statements = [];
                            }
                            exceptionBlockStack.push(currentExceptionBlock);
                            currentExceptionBlock = block;
                        }
                        else if (blockAction === 1 /* BlockAction.Close */) {
                            currentExceptionBlock = exceptionBlockStack.pop();
                        }
                        break;
                    case 1 /* CodeBlockKind.With */:
                        if (blockAction === 0 /* BlockAction.Open */) {
                            if (!withBlockStack) {
                                withBlockStack = [];
                            }
                            withBlockStack.push(block);
                        }
                        else if (blockAction === 1 /* BlockAction.Close */) {
                            withBlockStack.pop();
                        }
                        break;
                    // default: do nothing
                }
            }
        }
    }
    /**
     * Writes an operation as a statement to the current label's statement list.
     *
     * @param operation The OpCode of the operation
     */
    function writeOperation(operationIndex) {
        tryEnterLabel(operationIndex);
        tryEnterOrLeaveBlock(operationIndex);
        // early termination, nothing else to process in this label
        if (lastOperationWasAbrupt) {
            return;
        }
        lastOperationWasAbrupt = false;
        lastOperationWasCompletion = false;
        var opcode = operations[operationIndex];
        if (opcode === 0 /* OpCode.Nop */) {
            return;
        }
        else if (opcode === 10 /* OpCode.Endfinally */) {
            return writeEndfinally();
        }
        var args = operationArguments[operationIndex];
        if (opcode === 1 /* OpCode.Statement */) {
            return writeStatement(args[0]);
        }
        var location = operationLocations[operationIndex];
        switch (opcode) {
            case 2 /* OpCode.Assign */:
                return writeAssign(args[0], args[1], location);
            case 3 /* OpCode.Break */:
                return writeBreak(args[0], location);
            case 4 /* OpCode.BreakWhenTrue */:
                return writeBreakWhenTrue(args[0], args[1], location);
            case 5 /* OpCode.BreakWhenFalse */:
                return writeBreakWhenFalse(args[0], args[1], location);
            case 6 /* OpCode.Yield */:
                return writeYield(args[0], location);
            case 7 /* OpCode.YieldStar */:
                return writeYieldStar(args[0], location);
            case 8 /* OpCode.Return */:
                return writeReturn(args[0], location);
            case 9 /* OpCode.Throw */:
                return writeThrow(args[0], location);
        }
    }
    /**
     * Writes a statement to the current label's statement list.
     *
     * @param statement A statement to write.
     */
    function writeStatement(statement) {
        if (statement) {
            if (!statements) {
                statements = [statement];
            }
            else {
                statements.push(statement);
            }
        }
    }
    /**
     * Writes an Assign operation to the current label's statement list.
     *
     * @param left The left-hand side of the assignment.
     * @param right The right-hand side of the assignment.
     * @param operationLocation The source map location for the operation.
     */
    function writeAssign(left, right, operationLocation) {
        writeStatement((0, ts_1.setTextRange)(factory.createExpressionStatement(factory.createAssignment(left, right)), operationLocation));
    }
    /**
     * Writes a Throw operation to the current label's statement list.
     *
     * @param expression The value to throw.
     * @param operationLocation The source map location for the operation.
     */
    function writeThrow(expression, operationLocation) {
        lastOperationWasAbrupt = true;
        lastOperationWasCompletion = true;
        writeStatement((0, ts_1.setTextRange)(factory.createThrowStatement(expression), operationLocation));
    }
    /**
     * Writes a Return operation to the current label's statement list.
     *
     * @param expression The value to return.
     * @param operationLocation The source map location for the operation.
     */
    function writeReturn(expression, operationLocation) {
        lastOperationWasAbrupt = true;
        lastOperationWasCompletion = true;
        writeStatement((0, ts_1.setEmitFlags)((0, ts_1.setTextRange)(factory.createReturnStatement(factory.createArrayLiteralExpression(expression
            ? [createInstruction(2 /* Instruction.Return */), expression]
            : [createInstruction(2 /* Instruction.Return */)])), operationLocation), 768 /* EmitFlags.NoTokenSourceMaps */));
    }
    /**
     * Writes a Break operation to the current label's statement list.
     *
     * @param label The label for the Break.
     * @param operationLocation The source map location for the operation.
     */
    function writeBreak(label, operationLocation) {
        lastOperationWasAbrupt = true;
        writeStatement((0, ts_1.setEmitFlags)((0, ts_1.setTextRange)(factory.createReturnStatement(factory.createArrayLiteralExpression([
            createInstruction(3 /* Instruction.Break */),
            createLabel(label)
        ])), operationLocation), 768 /* EmitFlags.NoTokenSourceMaps */));
    }
    /**
     * Writes a BreakWhenTrue operation to the current label's statement list.
     *
     * @param label The label for the Break.
     * @param condition The condition for the Break.
     * @param operationLocation The source map location for the operation.
     */
    function writeBreakWhenTrue(label, condition, operationLocation) {
        writeStatement((0, ts_1.setEmitFlags)(factory.createIfStatement(condition, (0, ts_1.setEmitFlags)((0, ts_1.setTextRange)(factory.createReturnStatement(factory.createArrayLiteralExpression([
            createInstruction(3 /* Instruction.Break */),
            createLabel(label)
        ])), operationLocation), 768 /* EmitFlags.NoTokenSourceMaps */)), 1 /* EmitFlags.SingleLine */));
    }
    /**
     * Writes a BreakWhenFalse operation to the current label's statement list.
     *
     * @param label The label for the Break.
     * @param condition The condition for the Break.
     * @param operationLocation The source map location for the operation.
     */
    function writeBreakWhenFalse(label, condition, operationLocation) {
        writeStatement((0, ts_1.setEmitFlags)(factory.createIfStatement(factory.createLogicalNot(condition), (0, ts_1.setEmitFlags)((0, ts_1.setTextRange)(factory.createReturnStatement(factory.createArrayLiteralExpression([
            createInstruction(3 /* Instruction.Break */),
            createLabel(label)
        ])), operationLocation), 768 /* EmitFlags.NoTokenSourceMaps */)), 1 /* EmitFlags.SingleLine */));
    }
    /**
     * Writes a Yield operation to the current label's statement list.
     *
     * @param expression The expression to yield.
     * @param operationLocation The source map location for the operation.
     */
    function writeYield(expression, operationLocation) {
        lastOperationWasAbrupt = true;
        writeStatement((0, ts_1.setEmitFlags)((0, ts_1.setTextRange)(factory.createReturnStatement(factory.createArrayLiteralExpression(expression
            ? [createInstruction(4 /* Instruction.Yield */), expression]
            : [createInstruction(4 /* Instruction.Yield */)])), operationLocation), 768 /* EmitFlags.NoTokenSourceMaps */));
    }
    /**
     * Writes a YieldStar instruction to the current label's statement list.
     *
     * @param expression The expression to yield.
     * @param operationLocation The source map location for the operation.
     */
    function writeYieldStar(expression, operationLocation) {
        lastOperationWasAbrupt = true;
        writeStatement((0, ts_1.setEmitFlags)((0, ts_1.setTextRange)(factory.createReturnStatement(factory.createArrayLiteralExpression([
            createInstruction(5 /* Instruction.YieldStar */),
            expression
        ])), operationLocation), 768 /* EmitFlags.NoTokenSourceMaps */));
    }
    /**
     * Writes an Endfinally instruction to the current label's statement list.
     */
    function writeEndfinally() {
        lastOperationWasAbrupt = true;
        writeStatement(factory.createReturnStatement(factory.createArrayLiteralExpression([
            createInstruction(7 /* Instruction.Endfinally */)
        ])));
    }
}
exports.transformGenerators = transformGenerators;
