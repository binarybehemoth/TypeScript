"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.nullParenthesizerRules = exports.createParenthesizerRules = void 0;
var ts_1 = require("../_namespaces/ts");
/** @internal */
function createParenthesizerRules(factory) {
    var binaryLeftOperandParenthesizerCache;
    var binaryRightOperandParenthesizerCache;
    return {
        getParenthesizeLeftSideOfBinaryForOperator: getParenthesizeLeftSideOfBinaryForOperator,
        getParenthesizeRightSideOfBinaryForOperator: getParenthesizeRightSideOfBinaryForOperator,
        parenthesizeLeftSideOfBinary: parenthesizeLeftSideOfBinary,
        parenthesizeRightSideOfBinary: parenthesizeRightSideOfBinary,
        parenthesizeExpressionOfComputedPropertyName: parenthesizeExpressionOfComputedPropertyName,
        parenthesizeConditionOfConditionalExpression: parenthesizeConditionOfConditionalExpression,
        parenthesizeBranchOfConditionalExpression: parenthesizeBranchOfConditionalExpression,
        parenthesizeExpressionOfExportDefault: parenthesizeExpressionOfExportDefault,
        parenthesizeExpressionOfNew: parenthesizeExpressionOfNew,
        parenthesizeLeftSideOfAccess: parenthesizeLeftSideOfAccess,
        parenthesizeOperandOfPostfixUnary: parenthesizeOperandOfPostfixUnary,
        parenthesizeOperandOfPrefixUnary: parenthesizeOperandOfPrefixUnary,
        parenthesizeExpressionsOfCommaDelimitedList: parenthesizeExpressionsOfCommaDelimitedList,
        parenthesizeExpressionForDisallowedComma: parenthesizeExpressionForDisallowedComma,
        parenthesizeExpressionOfExpressionStatement: parenthesizeExpressionOfExpressionStatement,
        parenthesizeConciseBodyOfArrowFunction: parenthesizeConciseBodyOfArrowFunction,
        parenthesizeCheckTypeOfConditionalType: parenthesizeCheckTypeOfConditionalType,
        parenthesizeExtendsTypeOfConditionalType: parenthesizeExtendsTypeOfConditionalType,
        parenthesizeConstituentTypesOfUnionType: parenthesizeConstituentTypesOfUnionType,
        parenthesizeConstituentTypeOfUnionType: parenthesizeConstituentTypeOfUnionType,
        parenthesizeConstituentTypesOfIntersectionType: parenthesizeConstituentTypesOfIntersectionType,
        parenthesizeConstituentTypeOfIntersectionType: parenthesizeConstituentTypeOfIntersectionType,
        parenthesizeOperandOfTypeOperator: parenthesizeOperandOfTypeOperator,
        parenthesizeOperandOfReadonlyTypeOperator: parenthesizeOperandOfReadonlyTypeOperator,
        parenthesizeNonArrayTypeOfPostfixType: parenthesizeNonArrayTypeOfPostfixType,
        parenthesizeElementTypesOfTupleType: parenthesizeElementTypesOfTupleType,
        parenthesizeElementTypeOfTupleType: parenthesizeElementTypeOfTupleType,
        parenthesizeTypeOfOptionalType: parenthesizeTypeOfOptionalType,
        parenthesizeTypeArguments: parenthesizeTypeArguments,
        parenthesizeLeadingTypeArgument: parenthesizeLeadingTypeArgument,
    };
    function getParenthesizeLeftSideOfBinaryForOperator(operatorKind) {
        binaryLeftOperandParenthesizerCache || (binaryLeftOperandParenthesizerCache = new Map());
        var parenthesizerRule = binaryLeftOperandParenthesizerCache.get(operatorKind);
        if (!parenthesizerRule) {
            parenthesizerRule = function (node) { return parenthesizeLeftSideOfBinary(operatorKind, node); };
            binaryLeftOperandParenthesizerCache.set(operatorKind, parenthesizerRule);
        }
        return parenthesizerRule;
    }
    function getParenthesizeRightSideOfBinaryForOperator(operatorKind) {
        binaryRightOperandParenthesizerCache || (binaryRightOperandParenthesizerCache = new Map());
        var parenthesizerRule = binaryRightOperandParenthesizerCache.get(operatorKind);
        if (!parenthesizerRule) {
            parenthesizerRule = function (node) { return parenthesizeRightSideOfBinary(operatorKind, /*leftSide*/ undefined, node); };
            binaryRightOperandParenthesizerCache.set(operatorKind, parenthesizerRule);
        }
        return parenthesizerRule;
    }
    /**
     * Determines whether the operand to a BinaryExpression needs to be parenthesized.
     *
     * @param binaryOperator The operator for the BinaryExpression.
     * @param operand The operand for the BinaryExpression.
     * @param isLeftSideOfBinary A value indicating whether the operand is the left side of the
     *                           BinaryExpression.
     */
    function binaryOperandNeedsParentheses(binaryOperator, operand, isLeftSideOfBinary, leftOperand) {
        // If the operand has lower precedence, then it needs to be parenthesized to preserve the
        // intent of the expression. For example, if the operand is `a + b` and the operator is
        // `*`, then we need to parenthesize the operand to preserve the intended order of
        // operations: `(a + b) * x`.
        //
        // If the operand has higher precedence, then it does not need to be parenthesized. For
        // example, if the operand is `a * b` and the operator is `+`, then we do not need to
        // parenthesize to preserve the intended order of operations: `a * b + x`.
        //
        // If the operand has the same precedence, then we need to check the associativity of
        // the operator based on whether this is the left or right operand of the expression.
        //
        // For example, if `a / d` is on the right of operator `*`, we need to parenthesize
        // to preserve the intended order of operations: `x * (a / d)`
        //
        // If `a ** d` is on the left of operator `**`, we need to parenthesize to preserve
        // the intended order of operations: `(a ** b) ** c`
        var binaryOperatorPrecedence = (0, ts_1.getOperatorPrecedence)(225 /* SyntaxKind.BinaryExpression */, binaryOperator);
        var binaryOperatorAssociativity = (0, ts_1.getOperatorAssociativity)(225 /* SyntaxKind.BinaryExpression */, binaryOperator);
        var emittedOperand = (0, ts_1.skipPartiallyEmittedExpressions)(operand);
        if (!isLeftSideOfBinary && operand.kind === 218 /* SyntaxKind.ArrowFunction */ && binaryOperatorPrecedence > 3 /* OperatorPrecedence.Assignment */) {
            // We need to parenthesize arrow functions on the right side to avoid it being
            // parsed as parenthesized expression: `a && (() => {})`
            return true;
        }
        var operandPrecedence = (0, ts_1.getExpressionPrecedence)(emittedOperand);
        switch ((0, ts_1.compareValues)(operandPrecedence, binaryOperatorPrecedence)) {
            case -1 /* Comparison.LessThan */:
                // If the operand is the right side of a right-associative binary operation
                // and is a yield expression, then we do not need parentheses.
                if (!isLeftSideOfBinary
                    && binaryOperatorAssociativity === 1 /* Associativity.Right */
                    && operand.kind === 228 /* SyntaxKind.YieldExpression */) {
                    return false;
                }
                return true;
            case 1 /* Comparison.GreaterThan */:
                return false;
            case 0 /* Comparison.EqualTo */:
                if (isLeftSideOfBinary) {
                    // No need to parenthesize the left operand when the binary operator is
                    // left associative:
                    //  (a*b)/x    -> a*b/x
                    //  (a**b)/x   -> a**b/x
                    //
                    // Parentheses are needed for the left operand when the binary operator is
                    // right associative:
                    //  (a/b)**x   -> (a/b)**x
                    //  (a**b)**x  -> (a**b)**x
                    return binaryOperatorAssociativity === 1 /* Associativity.Right */;
                }
                else {
                    if ((0, ts_1.isBinaryExpression)(emittedOperand)
                        && emittedOperand.operatorToken.kind === binaryOperator) {
                        // No need to parenthesize the right operand when the binary operator and
                        // operand are the same and one of the following:
                        //  x*(a*b)     => x*a*b
                        //  x|(a|b)     => x|a|b
                        //  x&(a&b)     => x&a&b
                        //  x^(a^b)     => x^a^b
                        if (operatorHasAssociativeProperty(binaryOperator)) {
                            return false;
                        }
                        // No need to parenthesize the right operand when the binary operator
                        // is plus (+) if both the left and right operands consist solely of either
                        // literals of the same kind or binary plus (+) expressions for literals of
                        // the same kind (recursively).
                        //  "a"+(1+2)       => "a"+(1+2)
                        //  "a"+("b"+"c")   => "a"+"b"+"c"
                        if (binaryOperator === 40 /* SyntaxKind.PlusToken */) {
                            var leftKind = leftOperand ? getLiteralKindOfBinaryPlusOperand(leftOperand) : 0 /* SyntaxKind.Unknown */;
                            if ((0, ts_1.isLiteralKind)(leftKind) && leftKind === getLiteralKindOfBinaryPlusOperand(emittedOperand)) {
                                return false;
                            }
                        }
                    }
                    // No need to parenthesize the right operand when the operand is right
                    // associative:
                    //  x/(a**b)    -> x/a**b
                    //  x**(a**b)   -> x**a**b
                    //
                    // Parentheses are needed for the right operand when the operand is left
                    // associative:
                    //  x/(a*b)     -> x/(a*b)
                    //  x**(a/b)    -> x**(a/b)
                    var operandAssociativity = (0, ts_1.getExpressionAssociativity)(emittedOperand);
                    return operandAssociativity === 0 /* Associativity.Left */;
                }
        }
    }
    /**
     * Determines whether a binary operator is mathematically associative.
     *
     * @param binaryOperator The binary operator.
     */
    function operatorHasAssociativeProperty(binaryOperator) {
        // The following operators are associative in JavaScript:
        //  (a*b)*c     -> a*(b*c)  -> a*b*c
        //  (a|b)|c     -> a|(b|c)  -> a|b|c
        //  (a&b)&c     -> a&(b&c)  -> a&b&c
        //  (a^b)^c     -> a^(b^c)  -> a^b^c
        //  (a,b),c     -> a,(b,c)  -> a,b,c
        //
        // While addition is associative in mathematics, JavaScript's `+` is not
        // guaranteed to be associative as it is overloaded with string concatenation.
        return binaryOperator === 42 /* SyntaxKind.AsteriskToken */
            || binaryOperator === 52 /* SyntaxKind.BarToken */
            || binaryOperator === 51 /* SyntaxKind.AmpersandToken */
            || binaryOperator === 53 /* SyntaxKind.CaretToken */
            || binaryOperator === 28 /* SyntaxKind.CommaToken */;
    }
    /**
     * This function determines whether an expression consists of a homogeneous set of
     * literal expressions or binary plus expressions that all share the same literal kind.
     * It is used to determine whether the right-hand operand of a binary plus expression can be
     * emitted without parentheses.
     */
    function getLiteralKindOfBinaryPlusOperand(node) {
        node = (0, ts_1.skipPartiallyEmittedExpressions)(node);
        if ((0, ts_1.isLiteralKind)(node.kind)) {
            return node.kind;
        }
        if (node.kind === 225 /* SyntaxKind.BinaryExpression */ && node.operatorToken.kind === 40 /* SyntaxKind.PlusToken */) {
            if (node.cachedLiteralKind !== undefined) {
                return node.cachedLiteralKind;
            }
            var leftKind = getLiteralKindOfBinaryPlusOperand(node.left);
            var literalKind = (0, ts_1.isLiteralKind)(leftKind)
                && leftKind === getLiteralKindOfBinaryPlusOperand(node.right)
                ? leftKind
                : 0 /* SyntaxKind.Unknown */;
            node.cachedLiteralKind = literalKind;
            return literalKind;
        }
        return 0 /* SyntaxKind.Unknown */;
    }
    /**
     * Wraps the operand to a BinaryExpression in parentheses if they are needed to preserve the intended
     * order of operations.
     *
     * @param binaryOperator The operator for the BinaryExpression.
     * @param operand The operand for the BinaryExpression.
     * @param isLeftSideOfBinary A value indicating whether the operand is the left side of the
     *                           BinaryExpression.
     */
    function parenthesizeBinaryOperand(binaryOperator, operand, isLeftSideOfBinary, leftOperand) {
        var skipped = (0, ts_1.skipPartiallyEmittedExpressions)(operand);
        // If the resulting expression is already parenthesized, we do not need to do any further processing.
        if (skipped.kind === 216 /* SyntaxKind.ParenthesizedExpression */) {
            return operand;
        }
        return binaryOperandNeedsParentheses(binaryOperator, operand, isLeftSideOfBinary, leftOperand)
            ? factory.createParenthesizedExpression(operand)
            : operand;
    }
    function parenthesizeLeftSideOfBinary(binaryOperator, leftSide) {
        return parenthesizeBinaryOperand(binaryOperator, leftSide, /*isLeftSideOfBinary*/ true);
    }
    function parenthesizeRightSideOfBinary(binaryOperator, leftSide, rightSide) {
        return parenthesizeBinaryOperand(binaryOperator, rightSide, /*isLeftSideOfBinary*/ false, leftSide);
    }
    function parenthesizeExpressionOfComputedPropertyName(expression) {
        return (0, ts_1.isCommaSequence)(expression) ? factory.createParenthesizedExpression(expression) : expression;
    }
    function parenthesizeConditionOfConditionalExpression(condition) {
        var conditionalPrecedence = (0, ts_1.getOperatorPrecedence)(226 /* SyntaxKind.ConditionalExpression */, 58 /* SyntaxKind.QuestionToken */);
        var emittedCondition = (0, ts_1.skipPartiallyEmittedExpressions)(condition);
        var conditionPrecedence = (0, ts_1.getExpressionPrecedence)(emittedCondition);
        if ((0, ts_1.compareValues)(conditionPrecedence, conditionalPrecedence) !== 1 /* Comparison.GreaterThan */) {
            return factory.createParenthesizedExpression(condition);
        }
        return condition;
    }
    function parenthesizeBranchOfConditionalExpression(branch) {
        // per ES grammar both 'whenTrue' and 'whenFalse' parts of conditional expression are assignment expressions
        // so in case when comma expression is introduced as a part of previous transformations
        // if should be wrapped in parens since comma operator has the lowest precedence
        var emittedExpression = (0, ts_1.skipPartiallyEmittedExpressions)(branch);
        return (0, ts_1.isCommaSequence)(emittedExpression)
            ? factory.createParenthesizedExpression(branch)
            : branch;
    }
    /**
     *  [Per the spec](https://tc39.github.io/ecma262/#prod-ExportDeclaration), `export default` accepts _AssigmentExpression_ but
     *  has a lookahead restriction for `function`, `async function`, and `class`.
     *
     * Basically, that means we need to parenthesize in the following cases:
     *
     * - BinaryExpression of CommaToken
     * - CommaList (synthetic list of multiple comma expressions)
     * - FunctionExpression
     * - ClassExpression
     */
    function parenthesizeExpressionOfExportDefault(expression) {
        var check = (0, ts_1.skipPartiallyEmittedExpressions)(expression);
        var needsParens = (0, ts_1.isCommaSequence)(check);
        if (!needsParens) {
            switch ((0, ts_1.getLeftmostExpression)(check, /*stopAtCallExpressions*/ false).kind) {
                case 230 /* SyntaxKind.ClassExpression */:
                case 217 /* SyntaxKind.FunctionExpression */:
                    needsParens = true;
            }
        }
        return needsParens ? factory.createParenthesizedExpression(expression) : expression;
    }
    /**
     * Wraps an expression in parentheses if it is needed in order to use the expression
     * as the expression of a `NewExpression` node.
     */
    function parenthesizeExpressionOfNew(expression) {
        var leftmostExpr = (0, ts_1.getLeftmostExpression)(expression, /*stopAtCallExpressions*/ true);
        switch (leftmostExpr.kind) {
            case 212 /* SyntaxKind.CallExpression */:
                return factory.createParenthesizedExpression(expression);
            case 213 /* SyntaxKind.NewExpression */:
                return !leftmostExpr.arguments
                    ? factory.createParenthesizedExpression(expression)
                    : expression; // TODO(rbuckton): Verify this assertion holds
        }
        return parenthesizeLeftSideOfAccess(expression);
    }
    /**
     * Wraps an expression in parentheses if it is needed in order to use the expression for
     * property or element access.
     */
    function parenthesizeLeftSideOfAccess(expression, optionalChain) {
        // isLeftHandSideExpression is almost the correct criterion for when it is not necessary
        // to parenthesize the expression before a dot. The known exception is:
        //
        //    NewExpression:
        //       new C.x        -> not the same as (new C).x
        //
        var emittedExpression = (0, ts_1.skipPartiallyEmittedExpressions)(expression);
        if ((0, ts_1.isLeftHandSideExpression)(emittedExpression)
            && (emittedExpression.kind !== 213 /* SyntaxKind.NewExpression */ || emittedExpression.arguments)
            && (optionalChain || !(0, ts_1.isOptionalChain)(emittedExpression))) {
            // TODO(rbuckton): Verify whether this assertion holds.
            return expression;
        }
        // TODO(rbuckton): Verifiy whether `setTextRange` is needed.
        return (0, ts_1.setTextRange)(factory.createParenthesizedExpression(expression), expression);
    }
    function parenthesizeOperandOfPostfixUnary(operand) {
        // TODO(rbuckton): Verifiy whether `setTextRange` is needed.
        return (0, ts_1.isLeftHandSideExpression)(operand) ? operand : (0, ts_1.setTextRange)(factory.createParenthesizedExpression(operand), operand);
    }
    function parenthesizeOperandOfPrefixUnary(operand) {
        // TODO(rbuckton): Verifiy whether `setTextRange` is needed.
        return (0, ts_1.isUnaryExpression)(operand) ? operand : (0, ts_1.setTextRange)(factory.createParenthesizedExpression(operand), operand);
    }
    function parenthesizeExpressionsOfCommaDelimitedList(elements) {
        var result = (0, ts_1.sameMap)(elements, parenthesizeExpressionForDisallowedComma);
        return (0, ts_1.setTextRange)(factory.createNodeArray(result, elements.hasTrailingComma), elements);
    }
    function parenthesizeExpressionForDisallowedComma(expression) {
        var emittedExpression = (0, ts_1.skipPartiallyEmittedExpressions)(expression);
        var expressionPrecedence = (0, ts_1.getExpressionPrecedence)(emittedExpression);
        var commaPrecedence = (0, ts_1.getOperatorPrecedence)(225 /* SyntaxKind.BinaryExpression */, 28 /* SyntaxKind.CommaToken */);
        // TODO(rbuckton): Verifiy whether `setTextRange` is needed.
        return expressionPrecedence > commaPrecedence ? expression : (0, ts_1.setTextRange)(factory.createParenthesizedExpression(expression), expression);
    }
    function parenthesizeExpressionOfExpressionStatement(expression) {
        var emittedExpression = (0, ts_1.skipPartiallyEmittedExpressions)(expression);
        if ((0, ts_1.isCallExpression)(emittedExpression)) {
            var callee = emittedExpression.expression;
            var kind = (0, ts_1.skipPartiallyEmittedExpressions)(callee).kind;
            if (kind === 217 /* SyntaxKind.FunctionExpression */ || kind === 218 /* SyntaxKind.ArrowFunction */) {
                // TODO(rbuckton): Verifiy whether `setTextRange` is needed.
                var updated = factory.updateCallExpression(emittedExpression, (0, ts_1.setTextRange)(factory.createParenthesizedExpression(callee), callee), emittedExpression.typeArguments, emittedExpression.arguments);
                return factory.restoreOuterExpressions(expression, updated, 8 /* OuterExpressionKinds.PartiallyEmittedExpressions */);
            }
        }
        var leftmostExpressionKind = (0, ts_1.getLeftmostExpression)(emittedExpression, /*stopAtCallExpressions*/ false).kind;
        if (leftmostExpressionKind === 209 /* SyntaxKind.ObjectLiteralExpression */ || leftmostExpressionKind === 217 /* SyntaxKind.FunctionExpression */) {
            // TODO(rbuckton): Verifiy whether `setTextRange` is needed.
            return (0, ts_1.setTextRange)(factory.createParenthesizedExpression(expression), expression);
        }
        return expression;
    }
    function parenthesizeConciseBodyOfArrowFunction(body) {
        if (!(0, ts_1.isBlock)(body) && ((0, ts_1.isCommaSequence)(body) || (0, ts_1.getLeftmostExpression)(body, /*stopAtCallExpressions*/ false).kind === 209 /* SyntaxKind.ObjectLiteralExpression */)) {
            // TODO(rbuckton): Verifiy whether `setTextRange` is needed.
            return (0, ts_1.setTextRange)(factory.createParenthesizedExpression(body), body);
        }
        return body;
    }
    // Type[Extends] :
    //     FunctionOrConstructorType
    //     ConditionalType[?Extends]
    // ConditionalType[Extends] :
    //     UnionType[?Extends]
    //     [~Extends] UnionType[~Extends] `extends` Type[+Extends] `?` Type[~Extends] `:` Type[~Extends]
    //
    // - The check type (the `UnionType`, above) does not allow function, constructor, or conditional types (they must be parenthesized)
    // - The extends type (the first `Type`, above) does not allow conditional types (they must be parenthesized). Function and constructor types are fine.
    // - The true and false branch types (the second and third `Type` non-terminals, above) allow any type
    function parenthesizeCheckTypeOfConditionalType(checkType) {
        switch (checkType.kind) {
            case 183 /* SyntaxKind.FunctionType */:
            case 184 /* SyntaxKind.ConstructorType */:
            case 193 /* SyntaxKind.ConditionalType */:
                return factory.createParenthesizedType(checkType);
        }
        return checkType;
    }
    function parenthesizeExtendsTypeOfConditionalType(extendsType) {
        switch (extendsType.kind) {
            case 193 /* SyntaxKind.ConditionalType */:
                return factory.createParenthesizedType(extendsType);
        }
        return extendsType;
    }
    // UnionType[Extends] :
    //     `|`? IntersectionType[?Extends]
    //     UnionType[?Extends] `|` IntersectionType[?Extends]
    //
    // - A union type constituent has the same precedence as the check type of a conditional type
    function parenthesizeConstituentTypeOfUnionType(type) {
        switch (type.kind) {
            case 191 /* SyntaxKind.UnionType */: // Not strictly necessary, but a union containing a union should have been flattened
            case 192 /* SyntaxKind.IntersectionType */: // Not strictly necessary, but makes generated output more readable and avoids breaks in DT tests
                return factory.createParenthesizedType(type);
        }
        return parenthesizeCheckTypeOfConditionalType(type);
    }
    function parenthesizeConstituentTypesOfUnionType(members) {
        return factory.createNodeArray((0, ts_1.sameMap)(members, parenthesizeConstituentTypeOfUnionType));
    }
    // IntersectionType[Extends] :
    //     `&`? TypeOperator[?Extends]
    //     IntersectionType[?Extends] `&` TypeOperator[?Extends]
    //
    // - An intersection type constituent does not allow function, constructor, conditional, or union types (they must be parenthesized)
    function parenthesizeConstituentTypeOfIntersectionType(type) {
        switch (type.kind) {
            case 191 /* SyntaxKind.UnionType */:
            case 192 /* SyntaxKind.IntersectionType */: // Not strictly necessary, but an intersection containing an intersection should have been flattened
                return factory.createParenthesizedType(type);
        }
        return parenthesizeConstituentTypeOfUnionType(type);
    }
    function parenthesizeConstituentTypesOfIntersectionType(members) {
        return factory.createNodeArray((0, ts_1.sameMap)(members, parenthesizeConstituentTypeOfIntersectionType));
    }
    // TypeOperator[Extends] :
    //     PostfixType
    //     InferType[?Extends]
    //     `keyof` TypeOperator[?Extends]
    //     `unique` TypeOperator[?Extends]
    //     `readonly` TypeOperator[?Extends]
    //
    function parenthesizeOperandOfTypeOperator(type) {
        switch (type.kind) {
            case 192 /* SyntaxKind.IntersectionType */:
                return factory.createParenthesizedType(type);
        }
        return parenthesizeConstituentTypeOfIntersectionType(type);
    }
    function parenthesizeOperandOfReadonlyTypeOperator(type) {
        switch (type.kind) {
            case 197 /* SyntaxKind.TypeOperator */:
                return factory.createParenthesizedType(type);
        }
        return parenthesizeOperandOfTypeOperator(type);
    }
    // PostfixType :
    //     NonArrayType
    //     NonArrayType [no LineTerminator here] `!` // JSDoc
    //     NonArrayType [no LineTerminator here] `?` // JSDoc
    //     IndexedAccessType
    //     ArrayType
    //
    // IndexedAccessType :
    //     NonArrayType `[` Type[~Extends] `]`
    //
    // ArrayType :
    //     NonArrayType `[` `]`
    //
    function parenthesizeNonArrayTypeOfPostfixType(type) {
        switch (type.kind) {
            case 194 /* SyntaxKind.InferType */:
            case 197 /* SyntaxKind.TypeOperator */:
            case 185 /* SyntaxKind.TypeQuery */: // Not strictly necessary, but makes generated output more readable and avoids breaks in DT tests
                return factory.createParenthesizedType(type);
        }
        return parenthesizeOperandOfTypeOperator(type);
    }
    // TupleType :
    //     `[` Elision? `]`
    //     `[` NamedTupleElementTypes `]`
    //     `[` NamedTupleElementTypes `,` Elision? `]`
    //     `[` TupleElementTypes `]`
    //     `[` TupleElementTypes `,` Elision? `]`
    //
    // NamedTupleElementTypes :
    //     Elision? NamedTupleMember
    //     NamedTupleElementTypes `,` Elision? NamedTupleMember
    //
    // NamedTupleMember :
    //     Identifier `?`? `:` Type[~Extends]
    //     `...` Identifier `:` Type[~Extends]
    //
    // TupleElementTypes :
    //     Elision? TupleElementType
    //     TupleElementTypes `,` Elision? TupleElementType
    //
    // TupleElementType :
    //     Type[~Extends] // NOTE: Needs cover grammar to disallow JSDoc postfix-optional
    //     OptionalType
    //     RestType
    //
    // OptionalType :
    //     Type[~Extends] `?` // NOTE: Needs cover grammar to disallow JSDoc postfix-optional
    //
    // RestType :
    //     `...` Type[~Extends]
    //
    function parenthesizeElementTypesOfTupleType(types) {
        return factory.createNodeArray((0, ts_1.sameMap)(types, parenthesizeElementTypeOfTupleType));
    }
    function parenthesizeElementTypeOfTupleType(type) {
        if (hasJSDocPostfixQuestion(type))
            return factory.createParenthesizedType(type);
        return type;
    }
    function hasJSDocPostfixQuestion(type) {
        if ((0, ts_1.isJSDocNullableType)(type))
            return type.postfix;
        if ((0, ts_1.isNamedTupleMember)(type))
            return hasJSDocPostfixQuestion(type.type);
        if ((0, ts_1.isFunctionTypeNode)(type) || (0, ts_1.isConstructorTypeNode)(type) || (0, ts_1.isTypeOperatorNode)(type))
            return hasJSDocPostfixQuestion(type.type);
        if ((0, ts_1.isConditionalTypeNode)(type))
            return hasJSDocPostfixQuestion(type.falseType);
        if ((0, ts_1.isUnionTypeNode)(type))
            return hasJSDocPostfixQuestion((0, ts_1.last)(type.types));
        if ((0, ts_1.isIntersectionTypeNode)(type))
            return hasJSDocPostfixQuestion((0, ts_1.last)(type.types));
        if ((0, ts_1.isInferTypeNode)(type))
            return !!type.typeParameter.constraint && hasJSDocPostfixQuestion(type.typeParameter.constraint);
        return false;
    }
    function parenthesizeTypeOfOptionalType(type) {
        if (hasJSDocPostfixQuestion(type))
            return factory.createParenthesizedType(type);
        return parenthesizeNonArrayTypeOfPostfixType(type);
    }
    // function parenthesizeMemberOfElementType(member: TypeNode): TypeNode {
    //     switch (member.kind) {
    //         case SyntaxKind.UnionType:
    //         case SyntaxKind.IntersectionType:
    //         case SyntaxKind.FunctionType:
    //         case SyntaxKind.ConstructorType:
    //             return factory.createParenthesizedType(member);
    //     }
    //     return parenthesizeMemberOfConditionalType(member);
    // }
    // function parenthesizeElementTypeOfArrayType(member: TypeNode): TypeNode {
    //     switch (member.kind) {
    //         case SyntaxKind.TypeQuery:
    //         case SyntaxKind.TypeOperator:
    //         case SyntaxKind.InferType:
    //             return factory.createParenthesizedType(member);
    //     }
    //     return parenthesizeMemberOfElementType(member);
    // }
    function parenthesizeLeadingTypeArgument(node) {
        return (0, ts_1.isFunctionOrConstructorTypeNode)(node) && node.typeParameters ? factory.createParenthesizedType(node) : node;
    }
    function parenthesizeOrdinalTypeArgument(node, i) {
        return i === 0 ? parenthesizeLeadingTypeArgument(node) : node;
    }
    function parenthesizeTypeArguments(typeArguments) {
        if ((0, ts_1.some)(typeArguments)) {
            return factory.createNodeArray((0, ts_1.sameMap)(typeArguments, parenthesizeOrdinalTypeArgument));
        }
    }
}
exports.createParenthesizerRules = createParenthesizerRules;
/** @internal */
exports.nullParenthesizerRules = {
    getParenthesizeLeftSideOfBinaryForOperator: function (_) { return ts_1.identity; },
    getParenthesizeRightSideOfBinaryForOperator: function (_) { return ts_1.identity; },
    parenthesizeLeftSideOfBinary: function (_binaryOperator, leftSide) { return leftSide; },
    parenthesizeRightSideOfBinary: function (_binaryOperator, _leftSide, rightSide) { return rightSide; },
    parenthesizeExpressionOfComputedPropertyName: ts_1.identity,
    parenthesizeConditionOfConditionalExpression: ts_1.identity,
    parenthesizeBranchOfConditionalExpression: ts_1.identity,
    parenthesizeExpressionOfExportDefault: ts_1.identity,
    parenthesizeExpressionOfNew: function (expression) { return (0, ts_1.cast)(expression, ts_1.isLeftHandSideExpression); },
    parenthesizeLeftSideOfAccess: function (expression) { return (0, ts_1.cast)(expression, ts_1.isLeftHandSideExpression); },
    parenthesizeOperandOfPostfixUnary: function (operand) { return (0, ts_1.cast)(operand, ts_1.isLeftHandSideExpression); },
    parenthesizeOperandOfPrefixUnary: function (operand) { return (0, ts_1.cast)(operand, ts_1.isUnaryExpression); },
    parenthesizeExpressionsOfCommaDelimitedList: function (nodes) { return (0, ts_1.cast)(nodes, ts_1.isNodeArray); },
    parenthesizeExpressionForDisallowedComma: ts_1.identity,
    parenthesizeExpressionOfExpressionStatement: ts_1.identity,
    parenthesizeConciseBodyOfArrowFunction: ts_1.identity,
    parenthesizeCheckTypeOfConditionalType: ts_1.identity,
    parenthesizeExtendsTypeOfConditionalType: ts_1.identity,
    parenthesizeConstituentTypesOfUnionType: function (nodes) { return (0, ts_1.cast)(nodes, ts_1.isNodeArray); },
    parenthesizeConstituentTypeOfUnionType: ts_1.identity,
    parenthesizeConstituentTypesOfIntersectionType: function (nodes) { return (0, ts_1.cast)(nodes, ts_1.isNodeArray); },
    parenthesizeConstituentTypeOfIntersectionType: ts_1.identity,
    parenthesizeOperandOfTypeOperator: ts_1.identity,
    parenthesizeOperandOfReadonlyTypeOperator: ts_1.identity,
    parenthesizeNonArrayTypeOfPostfixType: ts_1.identity,
    parenthesizeElementTypesOfTupleType: function (nodes) { return (0, ts_1.cast)(nodes, ts_1.isNodeArray); },
    parenthesizeElementTypeOfTupleType: ts_1.identity,
    parenthesizeTypeOfOptionalType: ts_1.identity,
    parenthesizeTypeArguments: function (nodes) { return nodes && (0, ts_1.cast)(nodes, ts_1.isNodeArray); },
    parenthesizeLeadingTypeArgument: ts_1.identity,
};
