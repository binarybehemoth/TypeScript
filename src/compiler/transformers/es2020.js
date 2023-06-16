"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.transformES2020 = void 0;
var ts_1 = require("../_namespaces/ts");
/** @internal */
function transformES2020(context) {
    var factory = context.factory, hoistVariableDeclaration = context.hoistVariableDeclaration;
    return (0, ts_1.chainBundle)(context, transformSourceFile);
    function transformSourceFile(node) {
        if (node.isDeclarationFile) {
            return node;
        }
        return (0, ts_1.visitEachChild)(node, visitor, context);
    }
    function visitor(node) {
        if ((node.transformFlags & 32 /* TransformFlags.ContainsES2020 */) === 0) {
            return node;
        }
        switch (node.kind) {
            case 212 /* SyntaxKind.CallExpression */: {
                var updated = visitNonOptionalCallExpression(node, /*captureThisArg*/ false);
                ts_1.Debug.assertNotNode(updated, ts_1.isSyntheticReference);
                return updated;
            }
            case 210 /* SyntaxKind.PropertyAccessExpression */:
            case 211 /* SyntaxKind.ElementAccessExpression */:
                if ((0, ts_1.isOptionalChain)(node)) {
                    var updated = visitOptionalExpression(node, /*captureThisArg*/ false, /*isDelete*/ false);
                    ts_1.Debug.assertNotNode(updated, ts_1.isSyntheticReference);
                    return updated;
                }
                return (0, ts_1.visitEachChild)(node, visitor, context);
            case 225 /* SyntaxKind.BinaryExpression */:
                if (node.operatorToken.kind === 61 /* SyntaxKind.QuestionQuestionToken */) {
                    return transformNullishCoalescingExpression(node);
                }
                return (0, ts_1.visitEachChild)(node, visitor, context);
            case 219 /* SyntaxKind.DeleteExpression */:
                return visitDeleteExpression(node);
            default:
                return (0, ts_1.visitEachChild)(node, visitor, context);
        }
    }
    function flattenChain(chain) {
        ts_1.Debug.assertNotNode(chain, ts_1.isNonNullChain);
        var links = [chain];
        while (!chain.questionDotToken && !(0, ts_1.isTaggedTemplateExpression)(chain)) {
            chain = (0, ts_1.cast)((0, ts_1.skipPartiallyEmittedExpressions)(chain.expression), ts_1.isOptionalChain);
            ts_1.Debug.assertNotNode(chain, ts_1.isNonNullChain);
            links.unshift(chain);
        }
        return { expression: chain.expression, chain: links };
    }
    function visitNonOptionalParenthesizedExpression(node, captureThisArg, isDelete) {
        var expression = visitNonOptionalExpression(node.expression, captureThisArg, isDelete);
        if ((0, ts_1.isSyntheticReference)(expression)) {
            // `(a.b)` -> { expression `((_a = a).b)`, thisArg: `_a` }
            // `(a[b])` -> { expression `((_a = a)[b])`, thisArg: `_a` }
            return factory.createSyntheticReferenceExpression(factory.updateParenthesizedExpression(node, expression.expression), expression.thisArg);
        }
        return factory.updateParenthesizedExpression(node, expression);
    }
    function visitNonOptionalPropertyOrElementAccessExpression(node, captureThisArg, isDelete) {
        if ((0, ts_1.isOptionalChain)(node)) {
            // If `node` is an optional chain, then it is the outermost chain of an optional expression.
            return visitOptionalExpression(node, captureThisArg, isDelete);
        }
        var expression = (0, ts_1.visitNode)(node.expression, visitor, ts_1.isExpression);
        ts_1.Debug.assertNotNode(expression, ts_1.isSyntheticReference);
        var thisArg;
        if (captureThisArg) {
            if (!(0, ts_1.isSimpleCopiableExpression)(expression)) {
                thisArg = factory.createTempVariable(hoistVariableDeclaration);
                expression = factory.createAssignment(thisArg, expression);
            }
            else {
                thisArg = expression;
            }
        }
        expression = node.kind === 210 /* SyntaxKind.PropertyAccessExpression */
            ? factory.updatePropertyAccessExpression(node, expression, (0, ts_1.visitNode)(node.name, visitor, ts_1.isIdentifier))
            : factory.updateElementAccessExpression(node, expression, (0, ts_1.visitNode)(node.argumentExpression, visitor, ts_1.isExpression));
        return thisArg ? factory.createSyntheticReferenceExpression(expression, thisArg) : expression;
    }
    function visitNonOptionalCallExpression(node, captureThisArg) {
        if ((0, ts_1.isOptionalChain)(node)) {
            // If `node` is an optional chain, then it is the outermost chain of an optional expression.
            return visitOptionalExpression(node, captureThisArg, /*isDelete*/ false);
        }
        if ((0, ts_1.isParenthesizedExpression)(node.expression) && (0, ts_1.isOptionalChain)((0, ts_1.skipParentheses)(node.expression))) {
            // capture thisArg for calls of parenthesized optional chains like `(foo?.bar)()`
            var expression = visitNonOptionalParenthesizedExpression(node.expression, /*captureThisArg*/ true, /*isDelete*/ false);
            var args = (0, ts_1.visitNodes)(node.arguments, visitor, ts_1.isExpression);
            if ((0, ts_1.isSyntheticReference)(expression)) {
                return (0, ts_1.setTextRange)(factory.createFunctionCallCall(expression.expression, expression.thisArg, args), node);
            }
            return factory.updateCallExpression(node, expression, /*typeArguments*/ undefined, args);
        }
        return (0, ts_1.visitEachChild)(node, visitor, context);
    }
    function visitNonOptionalExpression(node, captureThisArg, isDelete) {
        switch (node.kind) {
            case 216 /* SyntaxKind.ParenthesizedExpression */: return visitNonOptionalParenthesizedExpression(node, captureThisArg, isDelete);
            case 210 /* SyntaxKind.PropertyAccessExpression */:
            case 211 /* SyntaxKind.ElementAccessExpression */: return visitNonOptionalPropertyOrElementAccessExpression(node, captureThisArg, isDelete);
            case 212 /* SyntaxKind.CallExpression */: return visitNonOptionalCallExpression(node, captureThisArg);
            default: return (0, ts_1.visitNode)(node, visitor, ts_1.isExpression);
        }
    }
    function visitOptionalExpression(node, captureThisArg, isDelete) {
        var _a = flattenChain(node), expression = _a.expression, chain = _a.chain;
        var left = visitNonOptionalExpression((0, ts_1.skipPartiallyEmittedExpressions)(expression), (0, ts_1.isCallChain)(chain[0]), /*isDelete*/ false);
        var leftThisArg = (0, ts_1.isSyntheticReference)(left) ? left.thisArg : undefined;
        var capturedLeft = (0, ts_1.isSyntheticReference)(left) ? left.expression : left;
        var leftExpression = factory.restoreOuterExpressions(expression, capturedLeft, 8 /* OuterExpressionKinds.PartiallyEmittedExpressions */);
        if (!(0, ts_1.isSimpleCopiableExpression)(capturedLeft)) {
            capturedLeft = factory.createTempVariable(hoistVariableDeclaration);
            leftExpression = factory.createAssignment(capturedLeft, leftExpression);
        }
        var rightExpression = capturedLeft;
        var thisArg;
        for (var i = 0; i < chain.length; i++) {
            var segment = chain[i];
            switch (segment.kind) {
                case 210 /* SyntaxKind.PropertyAccessExpression */:
                case 211 /* SyntaxKind.ElementAccessExpression */:
                    if (i === chain.length - 1 && captureThisArg) {
                        if (!(0, ts_1.isSimpleCopiableExpression)(rightExpression)) {
                            thisArg = factory.createTempVariable(hoistVariableDeclaration);
                            rightExpression = factory.createAssignment(thisArg, rightExpression);
                        }
                        else {
                            thisArg = rightExpression;
                        }
                    }
                    rightExpression = segment.kind === 210 /* SyntaxKind.PropertyAccessExpression */
                        ? factory.createPropertyAccessExpression(rightExpression, (0, ts_1.visitNode)(segment.name, visitor, ts_1.isIdentifier))
                        : factory.createElementAccessExpression(rightExpression, (0, ts_1.visitNode)(segment.argumentExpression, visitor, ts_1.isExpression));
                    break;
                case 212 /* SyntaxKind.CallExpression */:
                    if (i === 0 && leftThisArg) {
                        if (!(0, ts_1.isGeneratedIdentifier)(leftThisArg)) {
                            leftThisArg = factory.cloneNode(leftThisArg);
                            (0, ts_1.addEmitFlags)(leftThisArg, 3072 /* EmitFlags.NoComments */);
                        }
                        rightExpression = factory.createFunctionCallCall(rightExpression, leftThisArg.kind === 108 /* SyntaxKind.SuperKeyword */ ? factory.createThis() : leftThisArg, (0, ts_1.visitNodes)(segment.arguments, visitor, ts_1.isExpression));
                    }
                    else {
                        rightExpression = factory.createCallExpression(rightExpression, 
                        /*typeArguments*/ undefined, (0, ts_1.visitNodes)(segment.arguments, visitor, ts_1.isExpression));
                    }
                    break;
            }
            (0, ts_1.setOriginalNode)(rightExpression, segment);
        }
        var target = isDelete
            ? factory.createConditionalExpression(createNotNullCondition(leftExpression, capturedLeft, /*invert*/ true), /*questionToken*/ undefined, factory.createTrue(), /*colonToken*/ undefined, factory.createDeleteExpression(rightExpression))
            : factory.createConditionalExpression(createNotNullCondition(leftExpression, capturedLeft, /*invert*/ true), /*questionToken*/ undefined, factory.createVoidZero(), /*colonToken*/ undefined, rightExpression);
        (0, ts_1.setTextRange)(target, node);
        return thisArg ? factory.createSyntheticReferenceExpression(target, thisArg) : target;
    }
    function createNotNullCondition(left, right, invert) {
        return factory.createBinaryExpression(factory.createBinaryExpression(left, factory.createToken(invert ? 37 /* SyntaxKind.EqualsEqualsEqualsToken */ : 38 /* SyntaxKind.ExclamationEqualsEqualsToken */), factory.createNull()), factory.createToken(invert ? 57 /* SyntaxKind.BarBarToken */ : 56 /* SyntaxKind.AmpersandAmpersandToken */), factory.createBinaryExpression(right, factory.createToken(invert ? 37 /* SyntaxKind.EqualsEqualsEqualsToken */ : 38 /* SyntaxKind.ExclamationEqualsEqualsToken */), factory.createVoidZero()));
    }
    function transformNullishCoalescingExpression(node) {
        var left = (0, ts_1.visitNode)(node.left, visitor, ts_1.isExpression);
        var right = left;
        if (!(0, ts_1.isSimpleCopiableExpression)(left)) {
            right = factory.createTempVariable(hoistVariableDeclaration);
            left = factory.createAssignment(right, left);
        }
        return (0, ts_1.setTextRange)(factory.createConditionalExpression(createNotNullCondition(left, right), 
        /*questionToken*/ undefined, right, 
        /*colonToken*/ undefined, (0, ts_1.visitNode)(node.right, visitor, ts_1.isExpression)), node);
    }
    function visitDeleteExpression(node) {
        return (0, ts_1.isOptionalChain)((0, ts_1.skipParentheses)(node.expression))
            ? (0, ts_1.setOriginalNode)(visitNonOptionalExpression(node.expression, /*captureThisArg*/ false, /*isDelete*/ true), node)
            : factory.updateDeleteExpression(node, (0, ts_1.visitNode)(node.expression, visitor, ts_1.isExpression));
    }
}
exports.transformES2020 = transformES2020;
