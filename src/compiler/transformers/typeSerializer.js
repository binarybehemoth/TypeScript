"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRuntimeTypeSerializer = void 0;
var ts_1 = require("../_namespaces/ts");
/** @internal */
function createRuntimeTypeSerializer(context) {
    var factory = context.factory, hoistVariableDeclaration = context.hoistVariableDeclaration;
    var resolver = context.getEmitResolver();
    var compilerOptions = context.getCompilerOptions();
    var languageVersion = (0, ts_1.getEmitScriptTarget)(compilerOptions);
    var strictNullChecks = (0, ts_1.getStrictOptionValue)(compilerOptions, "strictNullChecks");
    var currentLexicalScope;
    var currentNameScope;
    return {
        serializeTypeNode: function (serializerContext, node) { return setSerializerContextAnd(serializerContext, serializeTypeNode, node); },
        serializeTypeOfNode: function (serializerContext, node) { return setSerializerContextAnd(serializerContext, serializeTypeOfNode, node); },
        serializeParameterTypesOfNode: function (serializerContext, node, container) { return setSerializerContextAnd(serializerContext, serializeParameterTypesOfNode, node, container); },
        serializeReturnTypeOfNode: function (serializerContext, node) { return setSerializerContextAnd(serializerContext, serializeReturnTypeOfNode, node); },
    };
    function setSerializerContextAnd(serializerContext, cb, node, arg) {
        var savedCurrentLexicalScope = currentLexicalScope;
        var savedCurrentNameScope = currentNameScope;
        currentLexicalScope = serializerContext.currentLexicalScope;
        currentNameScope = serializerContext.currentNameScope;
        var result = arg === undefined ? cb(node) : cb(node, arg);
        currentLexicalScope = savedCurrentLexicalScope;
        currentNameScope = savedCurrentNameScope;
        return result;
    }
    function getAccessorTypeNode(node) {
        var accessors = resolver.getAllAccessorDeclarations(node);
        return accessors.setAccessor && (0, ts_1.getSetAccessorTypeAnnotationNode)(accessors.setAccessor)
            || accessors.getAccessor && (0, ts_1.getEffectiveReturnTypeNode)(accessors.getAccessor);
    }
    /**
     * Serializes the type of a node for use with decorator type metadata.
     * @param node The node that should have its type serialized.
     */
    function serializeTypeOfNode(node) {
        switch (node.kind) {
            case 171 /* SyntaxKind.PropertyDeclaration */:
            case 168 /* SyntaxKind.Parameter */:
                return serializeTypeNode(node.type);
            case 177 /* SyntaxKind.SetAccessor */:
            case 176 /* SyntaxKind.GetAccessor */:
                return serializeTypeNode(getAccessorTypeNode(node));
            case 262 /* SyntaxKind.ClassDeclaration */:
            case 230 /* SyntaxKind.ClassExpression */:
            case 173 /* SyntaxKind.MethodDeclaration */:
                return factory.createIdentifier("Function");
            default:
                return factory.createVoidZero();
        }
    }
    /**
     * Serializes the type of a node for use with decorator type metadata.
     * @param node The node that should have its type serialized.
     */
    function serializeParameterTypesOfNode(node, container) {
        var valueDeclaration = (0, ts_1.isClassLike)(node)
            ? (0, ts_1.getFirstConstructorWithBody)(node)
            : (0, ts_1.isFunctionLike)(node) && (0, ts_1.nodeIsPresent)(node.body)
                ? node
                : undefined;
        var expressions = [];
        if (valueDeclaration) {
            var parameters = getParametersOfDecoratedDeclaration(valueDeclaration, container);
            var numParameters = parameters.length;
            for (var i = 0; i < numParameters; i++) {
                var parameter = parameters[i];
                if (i === 0 && (0, ts_1.isIdentifier)(parameter.name) && parameter.name.escapedText === "this") {
                    continue;
                }
                if (parameter.dotDotDotToken) {
                    expressions.push(serializeTypeNode((0, ts_1.getRestParameterElementType)(parameter.type)));
                }
                else {
                    expressions.push(serializeTypeOfNode(parameter));
                }
            }
        }
        return factory.createArrayLiteralExpression(expressions);
    }
    function getParametersOfDecoratedDeclaration(node, container) {
        if (container && node.kind === 176 /* SyntaxKind.GetAccessor */) {
            var setAccessor = (0, ts_1.getAllAccessorDeclarations)(container.members, node).setAccessor;
            if (setAccessor) {
                return setAccessor.parameters;
            }
        }
        return node.parameters;
    }
    /**
     * Serializes the return type of a node for use with decorator type metadata.
     * @param node The node that should have its return type serialized.
     */
    function serializeReturnTypeOfNode(node) {
        if ((0, ts_1.isFunctionLike)(node) && node.type) {
            return serializeTypeNode(node.type);
        }
        else if ((0, ts_1.isAsyncFunction)(node)) {
            return factory.createIdentifier("Promise");
        }
        return factory.createVoidZero();
    }
    /**
     * Serializes a type node for use with decorator type metadata.
     *
     * Types are serialized in the following fashion:
     * - Void types point to "undefined" (e.g. "void 0")
     * - Function and Constructor types point to the global "Function" constructor.
     * - Interface types with a call or construct signature types point to the global
     *   "Function" constructor.
     * - Array and Tuple types point to the global "Array" constructor.
     * - Type predicates and booleans point to the global "Boolean" constructor.
     * - String literal types and strings point to the global "String" constructor.
     * - Enum and number types point to the global "Number" constructor.
     * - Symbol types point to the global "Symbol" constructor.
     * - Type references to classes (or class-like variables) point to the constructor for the class.
     * - Anything else points to the global "Object" constructor.
     *
     * @param node The type node to serialize.
     */
    function serializeTypeNode(node) {
        if (node === undefined) {
            return factory.createIdentifier("Object");
        }
        node = (0, ts_1.skipTypeParentheses)(node);
        switch (node.kind) {
            case 116 /* SyntaxKind.VoidKeyword */:
            case 157 /* SyntaxKind.UndefinedKeyword */:
            case 146 /* SyntaxKind.NeverKeyword */:
                return factory.createVoidZero();
            case 183 /* SyntaxKind.FunctionType */:
            case 184 /* SyntaxKind.ConstructorType */:
                return factory.createIdentifier("Function");
            case 187 /* SyntaxKind.ArrayType */:
            case 188 /* SyntaxKind.TupleType */:
                return factory.createIdentifier("Array");
            case 181 /* SyntaxKind.TypePredicate */:
                return node.assertsModifier ?
                    factory.createVoidZero() :
                    factory.createIdentifier("Boolean");
            case 136 /* SyntaxKind.BooleanKeyword */:
                return factory.createIdentifier("Boolean");
            case 202 /* SyntaxKind.TemplateLiteralType */:
            case 154 /* SyntaxKind.StringKeyword */:
                return factory.createIdentifier("String");
            case 151 /* SyntaxKind.ObjectKeyword */:
                return factory.createIdentifier("Object");
            case 200 /* SyntaxKind.LiteralType */:
                return serializeLiteralOfLiteralTypeNode(node.literal);
            case 150 /* SyntaxKind.NumberKeyword */:
                return factory.createIdentifier("Number");
            case 162 /* SyntaxKind.BigIntKeyword */:
                return getGlobalConstructor("BigInt", 7 /* ScriptTarget.ES2020 */);
            case 155 /* SyntaxKind.SymbolKeyword */:
                return getGlobalConstructor("Symbol", 2 /* ScriptTarget.ES2015 */);
            case 182 /* SyntaxKind.TypeReference */:
                return serializeTypeReferenceNode(node);
            case 192 /* SyntaxKind.IntersectionType */:
                return serializeUnionOrIntersectionConstituents(node.types, /*isIntersection*/ true);
            case 191 /* SyntaxKind.UnionType */:
                return serializeUnionOrIntersectionConstituents(node.types, /*isIntersection*/ false);
            case 193 /* SyntaxKind.ConditionalType */:
                return serializeUnionOrIntersectionConstituents([node.trueType, node.falseType], /*isIntersection*/ false);
            case 197 /* SyntaxKind.TypeOperator */:
                if (node.operator === 148 /* SyntaxKind.ReadonlyKeyword */) {
                    return serializeTypeNode(node.type);
                }
                break;
            case 185 /* SyntaxKind.TypeQuery */:
            case 198 /* SyntaxKind.IndexedAccessType */:
            case 199 /* SyntaxKind.MappedType */:
            case 186 /* SyntaxKind.TypeLiteral */:
            case 133 /* SyntaxKind.AnyKeyword */:
            case 159 /* SyntaxKind.UnknownKeyword */:
            case 196 /* SyntaxKind.ThisType */:
            case 204 /* SyntaxKind.ImportType */:
                break;
            // handle JSDoc types from an invalid parse
            case 318 /* SyntaxKind.JSDocAllType */:
            case 319 /* SyntaxKind.JSDocUnknownType */:
            case 323 /* SyntaxKind.JSDocFunctionType */:
            case 324 /* SyntaxKind.JSDocVariadicType */:
            case 325 /* SyntaxKind.JSDocNamepathType */:
                break;
            case 320 /* SyntaxKind.JSDocNullableType */:
            case 321 /* SyntaxKind.JSDocNonNullableType */:
            case 322 /* SyntaxKind.JSDocOptionalType */:
                return serializeTypeNode(node.type);
            default:
                return ts_1.Debug.failBadSyntaxKind(node);
        }
        return factory.createIdentifier("Object");
    }
    function serializeLiteralOfLiteralTypeNode(node) {
        switch (node.kind) {
            case 11 /* SyntaxKind.StringLiteral */:
            case 15 /* SyntaxKind.NoSubstitutionTemplateLiteral */:
                return factory.createIdentifier("String");
            case 223 /* SyntaxKind.PrefixUnaryExpression */: {
                var operand = node.operand;
                switch (operand.kind) {
                    case 9 /* SyntaxKind.NumericLiteral */:
                    case 10 /* SyntaxKind.BigIntLiteral */:
                        return serializeLiteralOfLiteralTypeNode(operand);
                    default:
                        return ts_1.Debug.failBadSyntaxKind(operand);
                }
            }
            case 9 /* SyntaxKind.NumericLiteral */:
                return factory.createIdentifier("Number");
            case 10 /* SyntaxKind.BigIntLiteral */:
                return getGlobalConstructor("BigInt", 7 /* ScriptTarget.ES2020 */);
            case 112 /* SyntaxKind.TrueKeyword */:
            case 97 /* SyntaxKind.FalseKeyword */:
                return factory.createIdentifier("Boolean");
            case 106 /* SyntaxKind.NullKeyword */:
                return factory.createVoidZero();
            default:
                return ts_1.Debug.failBadSyntaxKind(node);
        }
    }
    function serializeUnionOrIntersectionConstituents(types, isIntersection) {
        // Note when updating logic here also update `getEntityNameForDecoratorMetadata` in checker.ts so that aliases can be marked as referenced
        var serializedType;
        for (var _i = 0, types_1 = types; _i < types_1.length; _i++) {
            var typeNode = types_1[_i];
            typeNode = (0, ts_1.skipTypeParentheses)(typeNode);
            if (typeNode.kind === 146 /* SyntaxKind.NeverKeyword */) {
                if (isIntersection)
                    return factory.createVoidZero(); // Reduce to `never` in an intersection
                continue; // Elide `never` in a union
            }
            if (typeNode.kind === 159 /* SyntaxKind.UnknownKeyword */) {
                if (!isIntersection)
                    return factory.createIdentifier("Object"); // Reduce to `unknown` in a union
                continue; // Elide `unknown` in an intersection
            }
            if (typeNode.kind === 133 /* SyntaxKind.AnyKeyword */) {
                return factory.createIdentifier("Object"); // Reduce to `any` in a union or intersection
            }
            if (!strictNullChecks && (((0, ts_1.isLiteralTypeNode)(typeNode) && typeNode.literal.kind === 106 /* SyntaxKind.NullKeyword */) || typeNode.kind === 157 /* SyntaxKind.UndefinedKeyword */)) {
                continue; // Elide null and undefined from unions for metadata, just like what we did prior to the implementation of strict null checks
            }
            var serializedConstituent = serializeTypeNode(typeNode);
            if ((0, ts_1.isIdentifier)(serializedConstituent) && serializedConstituent.escapedText === "Object") {
                // One of the individual is global object, return immediately
                return serializedConstituent;
            }
            // If there exists union that is not `void 0` expression, check if the the common type is identifier.
            // anything more complex and we will just default to Object
            if (serializedType) {
                // Different types
                if (!equateSerializedTypeNodes(serializedType, serializedConstituent)) {
                    return factory.createIdentifier("Object");
                }
            }
            else {
                // Initialize the union type
                serializedType = serializedConstituent;
            }
        }
        // If we were able to find common type, use it
        return serializedType !== null && serializedType !== void 0 ? serializedType : (factory.createVoidZero()); // Fallback is only hit if all union constituents are null/undefined/never
    }
    function equateSerializedTypeNodes(left, right) {
        return (
        // temp vars used in fallback
        (0, ts_1.isGeneratedIdentifier)(left) ? (0, ts_1.isGeneratedIdentifier)(right) :
            // entity names
            (0, ts_1.isIdentifier)(left) ? (0, ts_1.isIdentifier)(right)
                && left.escapedText === right.escapedText :
                (0, ts_1.isPropertyAccessExpression)(left) ? (0, ts_1.isPropertyAccessExpression)(right)
                    && equateSerializedTypeNodes(left.expression, right.expression)
                    && equateSerializedTypeNodes(left.name, right.name) :
                    // `void 0`
                    (0, ts_1.isVoidExpression)(left) ? (0, ts_1.isVoidExpression)(right)
                        && (0, ts_1.isNumericLiteral)(left.expression) && left.expression.text === "0"
                        && (0, ts_1.isNumericLiteral)(right.expression) && right.expression.text === "0" :
                        // `"undefined"` or `"function"` in `typeof` checks
                        (0, ts_1.isStringLiteral)(left) ? (0, ts_1.isStringLiteral)(right)
                            && left.text === right.text :
                            // used in `typeof` checks for fallback
                            (0, ts_1.isTypeOfExpression)(left) ? (0, ts_1.isTypeOfExpression)(right)
                                && equateSerializedTypeNodes(left.expression, right.expression) :
                                // parens in `typeof` checks with temps
                                (0, ts_1.isParenthesizedExpression)(left) ? (0, ts_1.isParenthesizedExpression)(right)
                                    && equateSerializedTypeNodes(left.expression, right.expression) :
                                    // conditionals used in fallback
                                    (0, ts_1.isConditionalExpression)(left) ? (0, ts_1.isConditionalExpression)(right)
                                        && equateSerializedTypeNodes(left.condition, right.condition)
                                        && equateSerializedTypeNodes(left.whenTrue, right.whenTrue)
                                        && equateSerializedTypeNodes(left.whenFalse, right.whenFalse) :
                                        // logical binary and assignments used in fallback
                                        (0, ts_1.isBinaryExpression)(left) ? (0, ts_1.isBinaryExpression)(right)
                                            && left.operatorToken.kind === right.operatorToken.kind
                                            && equateSerializedTypeNodes(left.left, right.left)
                                            && equateSerializedTypeNodes(left.right, right.right) :
                                            false);
    }
    /**
     * Serializes a TypeReferenceNode to an appropriate JS constructor value for use with decorator type metadata.
     * @param node The type reference node.
     */
    function serializeTypeReferenceNode(node) {
        var kind = resolver.getTypeReferenceSerializationKind(node.typeName, currentNameScope !== null && currentNameScope !== void 0 ? currentNameScope : currentLexicalScope);
        switch (kind) {
            case ts_1.TypeReferenceSerializationKind.Unknown:
                // From conditional type type reference that cannot be resolved is Similar to any or unknown
                if ((0, ts_1.findAncestor)(node, function (n) { return n.parent && (0, ts_1.isConditionalTypeNode)(n.parent) && (n.parent.trueType === n || n.parent.falseType === n); })) {
                    return factory.createIdentifier("Object");
                }
                var serialized = serializeEntityNameAsExpressionFallback(node.typeName);
                var temp = factory.createTempVariable(hoistVariableDeclaration);
                return factory.createConditionalExpression(factory.createTypeCheck(factory.createAssignment(temp, serialized), "function"), 
                /*questionToken*/ undefined, temp, 
                /*colonToken*/ undefined, factory.createIdentifier("Object"));
            case ts_1.TypeReferenceSerializationKind.TypeWithConstructSignatureAndValue:
                return serializeEntityNameAsExpression(node.typeName);
            case ts_1.TypeReferenceSerializationKind.VoidNullableOrNeverType:
                return factory.createVoidZero();
            case ts_1.TypeReferenceSerializationKind.BigIntLikeType:
                return getGlobalConstructor("BigInt", 7 /* ScriptTarget.ES2020 */);
            case ts_1.TypeReferenceSerializationKind.BooleanType:
                return factory.createIdentifier("Boolean");
            case ts_1.TypeReferenceSerializationKind.NumberLikeType:
                return factory.createIdentifier("Number");
            case ts_1.TypeReferenceSerializationKind.StringLikeType:
                return factory.createIdentifier("String");
            case ts_1.TypeReferenceSerializationKind.ArrayLikeType:
                return factory.createIdentifier("Array");
            case ts_1.TypeReferenceSerializationKind.ESSymbolType:
                return getGlobalConstructor("Symbol", 2 /* ScriptTarget.ES2015 */);
            case ts_1.TypeReferenceSerializationKind.TypeWithCallSignature:
                return factory.createIdentifier("Function");
            case ts_1.TypeReferenceSerializationKind.Promise:
                return factory.createIdentifier("Promise");
            case ts_1.TypeReferenceSerializationKind.ObjectType:
                return factory.createIdentifier("Object");
            default:
                return ts_1.Debug.assertNever(kind);
        }
    }
    /**
     * Produces an expression that results in `right` if `left` is not undefined at runtime:
     *
     * ```
     * typeof left !== "undefined" && right
     * ```
     *
     * We use `typeof L !== "undefined"` (rather than `L !== undefined`) since `L` may not be declared.
     * It's acceptable for this expression to result in `false` at runtime, as the result is intended to be
     * further checked by any containing expression.
     */
    function createCheckedValue(left, right) {
        return factory.createLogicalAnd(factory.createStrictInequality(factory.createTypeOfExpression(left), factory.createStringLiteral("undefined")), right);
    }
    /**
     * Serializes an entity name which may not exist at runtime, but whose access shouldn't throw
     * @param node The entity name to serialize.
     */
    function serializeEntityNameAsExpressionFallback(node) {
        if (node.kind === 80 /* SyntaxKind.Identifier */) {
            // A -> typeof A !== "undefined" && A
            var copied = serializeEntityNameAsExpression(node);
            return createCheckedValue(copied, copied);
        }
        if (node.left.kind === 80 /* SyntaxKind.Identifier */) {
            // A.B -> typeof A !== "undefined" && A.B
            return createCheckedValue(serializeEntityNameAsExpression(node.left), serializeEntityNameAsExpression(node));
        }
        // A.B.C -> typeof A !== "undefined" && (_a = A.B) !== void 0 && _a.C
        var left = serializeEntityNameAsExpressionFallback(node.left);
        var temp = factory.createTempVariable(hoistVariableDeclaration);
        return factory.createLogicalAnd(factory.createLogicalAnd(left.left, factory.createStrictInequality(factory.createAssignment(temp, left.right), factory.createVoidZero())), factory.createPropertyAccessExpression(temp, node.right));
    }
    /**
     * Serializes an entity name as an expression for decorator type metadata.
     * @param node The entity name to serialize.
     */
    function serializeEntityNameAsExpression(node) {
        switch (node.kind) {
            case 80 /* SyntaxKind.Identifier */:
                // Create a clone of the name with a new parent, and treat it as if it were
                // a source tree node for the purposes of the checker.
                var name_1 = (0, ts_1.setParent)((0, ts_1.setTextRange)(ts_1.parseNodeFactory.cloneNode(node), node), node.parent);
                name_1.original = undefined;
                (0, ts_1.setParent)(name_1, (0, ts_1.getParseTreeNode)(currentLexicalScope)); // ensure the parent is set to a parse tree node.
                return name_1;
            case 165 /* SyntaxKind.QualifiedName */:
                return serializeQualifiedNameAsExpression(node);
        }
    }
    /**
     * Serializes an qualified name as an expression for decorator type metadata.
     * @param node The qualified name to serialize.
     */
    function serializeQualifiedNameAsExpression(node) {
        return factory.createPropertyAccessExpression(serializeEntityNameAsExpression(node.left), node.right);
    }
    function getGlobalConstructorWithFallback(name) {
        return factory.createConditionalExpression(factory.createTypeCheck(factory.createIdentifier(name), "function"), 
        /*questionToken*/ undefined, factory.createIdentifier(name), 
        /*colonToken*/ undefined, factory.createIdentifier("Object"));
    }
    function getGlobalConstructor(name, minLanguageVersion) {
        return languageVersion < minLanguageVersion ?
            getGlobalConstructorWithFallback(name) :
            factory.createIdentifier(name);
    }
}
exports.createRuntimeTypeSerializer = createRuntimeTypeSerializer;
