"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.visitEachChild = exports.visitCommaListElements = exports.visitIterationBody = exports.visitFunctionBody = exports.visitParameterList = exports.visitLexicalEnvironment = exports.visitArray = exports.visitNodes = exports.visitNode = void 0;
var ts_1 = require("./_namespaces/ts");
function visitNode(node, visitor, test, lift) {
    if (node === undefined) {
        // If the input type is undefined, then the output type can be undefined.
        return node;
    }
    var visited = visitor(node);
    var visitedNode;
    if (visited === undefined) {
        // If the visited node is undefined, then the visitor must have returned undefined,
        // so the visitor must have been declared as able to return undefined, so TOut must be
        // potentially undefined.
        return undefined;
    }
    else if ((0, ts_1.isArray)(visited)) {
        visitedNode = (lift || extractSingleNode)(visited);
    }
    else {
        visitedNode = visited;
    }
    ts_1.Debug.assertNode(visitedNode, test);
    return visitedNode;
}
exports.visitNode = visitNode;
function visitNodes(nodes, visitor, test, start, count) {
    if (nodes === undefined) {
        // If the input type is undefined, then the output type can be undefined.
        return nodes;
    }
    // Ensure start and count have valid values
    var length = nodes.length;
    if (start === undefined || start < 0) {
        start = 0;
    }
    if (count === undefined || count > length - start) {
        count = length - start;
    }
    var hasTrailingComma;
    var pos = -1;
    var end = -1;
    if (start > 0 || count < length) {
        // Since this is a fragment of a node array, we do not copy over the previous location
        // and will only copy over `hasTrailingComma` if we are including the last element.
        hasTrailingComma = nodes.hasTrailingComma && start + count === length;
    }
    else {
        pos = nodes.pos;
        end = nodes.end;
        hasTrailingComma = nodes.hasTrailingComma;
    }
    var updated = visitArrayWorker(nodes, visitor, test, start, count);
    if (updated !== nodes) {
        // TODO(rbuckton): Remove dependency on `ts.factory` in favor of a provided factory.
        var updatedArray = ts_1.factory.createNodeArray(updated, hasTrailingComma);
        (0, ts_1.setTextRangePosEnd)(updatedArray, pos, end);
        return updatedArray;
    }
    // If we are here, updated === nodes. This means that it's still a NodeArray,
    // and also that its contents passed the tests in visitArrayWorker, so has contents
    // of type TOut.
    return nodes;
}
exports.visitNodes = visitNodes;
function visitArray(nodes, visitor, test, start, count) {
    if (nodes === undefined) {
        // If the input type is undefined, then the output type can be undefined.
        return nodes;
    }
    // Ensure start and count have valid values
    var length = nodes.length;
    if (start === undefined || start < 0) {
        start = 0;
    }
    if (count === undefined || count > length - start) {
        count = length - start;
    }
    return visitArrayWorker(nodes, visitor, test, start, count);
}
exports.visitArray = visitArray;
function visitArrayWorker(nodes, visitor, test, start, count) {
    var updated;
    var length = nodes.length;
    if (start > 0 || count < length) {
        // If we are not visiting all of the original nodes, we must always create a new array.
        updated = [];
    }
    // Visit each original node.
    for (var i = 0; i < count; i++) {
        var node = nodes[i + start];
        var visited = node !== undefined ? (visitor ? visitor(node) : node) : undefined;
        if (updated !== undefined || visited === undefined || visited !== node) {
            if (updated === undefined) {
                // Ensure we have a copy of `nodes`, up to the current index.
                updated = nodes.slice(0, i);
                ts_1.Debug.assertEachNode(updated, test);
            }
            if (visited) {
                if ((0, ts_1.isArray)(visited)) {
                    for (var _i = 0, visited_1 = visited; _i < visited_1.length; _i++) {
                        var visitedNode = visited_1[_i];
                        ts_1.Debug.assertNode(visitedNode, test);
                        updated.push(visitedNode);
                    }
                }
                else {
                    ts_1.Debug.assertNode(visited, test);
                    updated.push(visited);
                }
            }
        }
    }
    if (updated) {
        // If we have an updated array, then all items will have been tested.
        return updated;
    }
    // If we are going to return the original array, ensure it passes the test.
    ts_1.Debug.assertEachNode(nodes, test);
    return nodes;
}
/**
 * Starts a new lexical environment and visits a statement list, ending the lexical environment
 * and merging hoisted declarations upon completion.
 */
function visitLexicalEnvironment(statements, visitor, context, start, ensureUseStrict, nodesVisitor) {
    if (nodesVisitor === void 0) { nodesVisitor = visitNodes; }
    context.startLexicalEnvironment();
    statements = nodesVisitor(statements, visitor, ts_1.isStatement, start);
    if (ensureUseStrict)
        statements = context.factory.ensureUseStrict(statements);
    return ts_1.factory.mergeLexicalEnvironment(statements, context.endLexicalEnvironment());
}
exports.visitLexicalEnvironment = visitLexicalEnvironment;
function visitParameterList(nodes, visitor, context, nodesVisitor) {
    if (nodesVisitor === void 0) { nodesVisitor = visitNodes; }
    var updated;
    context.startLexicalEnvironment();
    if (nodes) {
        context.setLexicalEnvironmentFlags(1 /* LexicalEnvironmentFlags.InParameters */, true);
        updated = nodesVisitor(nodes, visitor, ts_1.isParameter);
        // As of ES2015, any runtime execution of that occurs in for a parameter (such as evaluating an
        // initializer or a binding pattern), occurs in its own lexical scope. As a result, any expression
        // that we might transform that introduces a temporary variable would fail as the temporary variable
        // exists in a different lexical scope. To address this, we move any binding patterns and initializers
        // in a parameter list to the body if we detect a variable being hoisted while visiting a parameter list
        // when the emit target is greater than ES2015.
        if (context.getLexicalEnvironmentFlags() & 2 /* LexicalEnvironmentFlags.VariablesHoistedInParameters */ &&
            (0, ts_1.getEmitScriptTarget)(context.getCompilerOptions()) >= 2 /* ScriptTarget.ES2015 */) {
            updated = addDefaultValueAssignmentsIfNeeded(updated, context);
        }
        context.setLexicalEnvironmentFlags(1 /* LexicalEnvironmentFlags.InParameters */, false);
    }
    context.suspendLexicalEnvironment();
    return updated;
}
exports.visitParameterList = visitParameterList;
function addDefaultValueAssignmentsIfNeeded(parameters, context) {
    var result;
    for (var i = 0; i < parameters.length; i++) {
        var parameter = parameters[i];
        var updated = addDefaultValueAssignmentIfNeeded(parameter, context);
        if (result || updated !== parameter) {
            if (!result)
                result = parameters.slice(0, i);
            result[i] = updated;
        }
    }
    if (result) {
        return (0, ts_1.setTextRange)(context.factory.createNodeArray(result, parameters.hasTrailingComma), parameters);
    }
    return parameters;
}
function addDefaultValueAssignmentIfNeeded(parameter, context) {
    // A rest parameter cannot have a binding pattern or an initializer,
    // so let's just ignore it.
    return parameter.dotDotDotToken ? parameter :
        (0, ts_1.isBindingPattern)(parameter.name) ? addDefaultValueAssignmentForBindingPattern(parameter, context) :
            parameter.initializer ? addDefaultValueAssignmentForInitializer(parameter, parameter.name, parameter.initializer, context) :
                parameter;
}
function addDefaultValueAssignmentForBindingPattern(parameter, context) {
    var factory = context.factory;
    context.addInitializationStatement(factory.createVariableStatement(
    /*modifiers*/ undefined, factory.createVariableDeclarationList([
        factory.createVariableDeclaration(parameter.name, 
        /*exclamationToken*/ undefined, parameter.type, parameter.initializer ?
            factory.createConditionalExpression(factory.createStrictEquality(factory.getGeneratedNameForNode(parameter), factory.createVoidZero()), 
            /*questionToken*/ undefined, parameter.initializer, 
            /*colonToken*/ undefined, factory.getGeneratedNameForNode(parameter)) :
            factory.getGeneratedNameForNode(parameter)),
    ])));
    return factory.updateParameterDeclaration(parameter, parameter.modifiers, parameter.dotDotDotToken, factory.getGeneratedNameForNode(parameter), parameter.questionToken, parameter.type, 
    /*initializer*/ undefined);
}
function addDefaultValueAssignmentForInitializer(parameter, name, initializer, context) {
    var factory = context.factory;
    context.addInitializationStatement(factory.createIfStatement(factory.createTypeCheck(factory.cloneNode(name), "undefined"), (0, ts_1.setEmitFlags)((0, ts_1.setTextRange)(factory.createBlock([
        factory.createExpressionStatement((0, ts_1.setEmitFlags)((0, ts_1.setTextRange)(factory.createAssignment((0, ts_1.setEmitFlags)(factory.cloneNode(name), 96 /* EmitFlags.NoSourceMap */), (0, ts_1.setEmitFlags)(initializer, 96 /* EmitFlags.NoSourceMap */ | (0, ts_1.getEmitFlags)(initializer) | 3072 /* EmitFlags.NoComments */)), parameter), 3072 /* EmitFlags.NoComments */))
    ]), parameter), 1 /* EmitFlags.SingleLine */ | 64 /* EmitFlags.NoTrailingSourceMap */ | 768 /* EmitFlags.NoTokenSourceMaps */ | 3072 /* EmitFlags.NoComments */)));
    return factory.updateParameterDeclaration(parameter, parameter.modifiers, parameter.dotDotDotToken, parameter.name, parameter.questionToken, parameter.type, 
    /*initializer*/ undefined);
}
function visitFunctionBody(node, visitor, context, nodeVisitor) {
    if (nodeVisitor === void 0) { nodeVisitor = visitNode; }
    context.resumeLexicalEnvironment();
    var updated = nodeVisitor(node, visitor, ts_1.isConciseBody);
    var declarations = context.endLexicalEnvironment();
    if ((0, ts_1.some)(declarations)) {
        if (!updated) {
            return context.factory.createBlock(declarations);
        }
        var block = context.factory.converters.convertToFunctionBlock(updated);
        var statements = ts_1.factory.mergeLexicalEnvironment(block.statements, declarations);
        return context.factory.updateBlock(block, statements);
    }
    return updated;
}
exports.visitFunctionBody = visitFunctionBody;
function visitIterationBody(body, visitor, context, nodeVisitor) {
    if (nodeVisitor === void 0) { nodeVisitor = visitNode; }
    context.startBlockScope();
    var updated = nodeVisitor(body, visitor, ts_1.isStatement, context.factory.liftToBlock);
    ts_1.Debug.assert(updated);
    var declarations = context.endBlockScope();
    if ((0, ts_1.some)(declarations)) {
        if ((0, ts_1.isBlock)(updated)) {
            declarations.push.apply(declarations, updated.statements);
            return context.factory.updateBlock(updated, declarations);
        }
        declarations.push(updated);
        return context.factory.createBlock(declarations);
    }
    return updated;
}
exports.visitIterationBody = visitIterationBody;
/**
 * Visits the elements of a {@link CommaListExpression}.
 * @param visitor The visitor to use when visiting expressions whose result will not be discarded at runtime.
 * @param discardVisitor The visitor to use when visiting expressions whose result will be discarded at runtime. Defaults to {@link visitor}.
 */
function visitCommaListElements(elements, visitor, discardVisitor) {
    if (discardVisitor === void 0) { discardVisitor = visitor; }
    if (discardVisitor === visitor || elements.length <= 1) {
        return visitNodes(elements, visitor, ts_1.isExpression);
    }
    var i = 0;
    var length = elements.length;
    return visitNodes(elements, function (node) {
        var discarded = i < length - 1;
        i++;
        return discarded ? discardVisitor(node) : visitor(node);
    }, ts_1.isExpression);
}
exports.visitCommaListElements = visitCommaListElements;
function visitEachChild(node, visitor, context, nodesVisitor, tokenVisitor, nodeVisitor) {
    if (nodesVisitor === void 0) { nodesVisitor = visitNodes; }
    if (nodeVisitor === void 0) { nodeVisitor = visitNode; }
    if (node === undefined) {
        return undefined;
    }
    var fn = visitEachChildTable[node.kind];
    return fn === undefined ? node : fn(node, visitor, context, nodesVisitor, nodeVisitor, tokenVisitor);
}
exports.visitEachChild = visitEachChild;
// NOTE: Before you can add a new method to `visitEachChildTable`, you must first ensure the `Node` subtype you
//       wish to add is defined in the `HasChildren` union in types.ts.
var visitEachChildTable = (_a = {},
    _a[165 /* SyntaxKind.QualifiedName */] = function visitEachChildOfQualifiedName(node, visitor, context, _nodesVisitor, nodeVisitor, _tokenVisitor) {
        return context.factory.updateQualifiedName(node, ts_1.Debug.checkDefined(nodeVisitor(node.left, visitor, ts_1.isEntityName)), ts_1.Debug.checkDefined(nodeVisitor(node.right, visitor, ts_1.isIdentifier)));
    },
    _a[166 /* SyntaxKind.ComputedPropertyName */] = function visitEachChildOfComputedPropertyName(node, visitor, context, _nodesVisitor, nodeVisitor, _tokenVisitor) {
        return context.factory.updateComputedPropertyName(node, ts_1.Debug.checkDefined(nodeVisitor(node.expression, visitor, ts_1.isExpression)));
    },
    // Signature elements
    _a[167 /* SyntaxKind.TypeParameter */] = function visitEachChildOfTypeParameterDeclaration(node, visitor, context, nodesVisitor, nodeVisitor, _tokenVisitor) {
        return context.factory.updateTypeParameterDeclaration(node, nodesVisitor(node.modifiers, visitor, ts_1.isModifier), ts_1.Debug.checkDefined(nodeVisitor(node.name, visitor, ts_1.isIdentifier)), nodeVisitor(node.constraint, visitor, ts_1.isTypeNode), nodeVisitor(node.default, visitor, ts_1.isTypeNode));
    },
    _a[168 /* SyntaxKind.Parameter */] = function visitEachChildOfParameterDeclaration(node, visitor, context, nodesVisitor, nodeVisitor, tokenVisitor) {
        return context.factory.updateParameterDeclaration(node, nodesVisitor(node.modifiers, visitor, ts_1.isModifierLike), tokenVisitor ? nodeVisitor(node.dotDotDotToken, tokenVisitor, ts_1.isDotDotDotToken) : node.dotDotDotToken, ts_1.Debug.checkDefined(nodeVisitor(node.name, visitor, ts_1.isBindingName)), tokenVisitor ? nodeVisitor(node.questionToken, tokenVisitor, ts_1.isQuestionToken) : node.questionToken, nodeVisitor(node.type, visitor, ts_1.isTypeNode), nodeVisitor(node.initializer, visitor, ts_1.isExpression));
    },
    _a[169 /* SyntaxKind.Decorator */] = function visitEachChildOfDecorator(node, visitor, context, _nodesVisitor, nodeVisitor, _tokenVisitor) {
        return context.factory.updateDecorator(node, ts_1.Debug.checkDefined(nodeVisitor(node.expression, visitor, ts_1.isExpression)));
    },
    // Type elements
    _a[170 /* SyntaxKind.PropertySignature */] = function visitEachChildOfPropertySignature(node, visitor, context, nodesVisitor, nodeVisitor, tokenVisitor) {
        return context.factory.updatePropertySignature(node, nodesVisitor(node.modifiers, visitor, ts_1.isModifier), ts_1.Debug.checkDefined(nodeVisitor(node.name, visitor, ts_1.isPropertyName)), tokenVisitor ? nodeVisitor(node.questionToken, tokenVisitor, ts_1.isQuestionToken) : node.questionToken, nodeVisitor(node.type, visitor, ts_1.isTypeNode));
    },
    _a[171 /* SyntaxKind.PropertyDeclaration */] = function visitEachChildOfPropertyDeclaration(node, visitor, context, nodesVisitor, nodeVisitor, tokenVisitor) {
        var _a, _b;
        return context.factory.updatePropertyDeclaration(node, nodesVisitor(node.modifiers, visitor, ts_1.isModifierLike), ts_1.Debug.checkDefined(nodeVisitor(node.name, visitor, ts_1.isPropertyName)), 
        // QuestionToken and ExclamationToken are mutually exclusive in PropertyDeclaration
        tokenVisitor ? nodeVisitor((_a = node.questionToken) !== null && _a !== void 0 ? _a : node.exclamationToken, tokenVisitor, ts_1.isQuestionOrExclamationToken) : (_b = node.questionToken) !== null && _b !== void 0 ? _b : node.exclamationToken, nodeVisitor(node.type, visitor, ts_1.isTypeNode), nodeVisitor(node.initializer, visitor, ts_1.isExpression));
    },
    _a[172 /* SyntaxKind.MethodSignature */] = function visitEachChildOfMethodSignature(node, visitor, context, nodesVisitor, nodeVisitor, tokenVisitor) {
        return context.factory.updateMethodSignature(node, nodesVisitor(node.modifiers, visitor, ts_1.isModifier), ts_1.Debug.checkDefined(nodeVisitor(node.name, visitor, ts_1.isPropertyName)), tokenVisitor ? nodeVisitor(node.questionToken, tokenVisitor, ts_1.isQuestionToken) : node.questionToken, nodesVisitor(node.typeParameters, visitor, ts_1.isTypeParameterDeclaration), nodesVisitor(node.parameters, visitor, ts_1.isParameter), nodeVisitor(node.type, visitor, ts_1.isTypeNode));
    },
    _a[173 /* SyntaxKind.MethodDeclaration */] = function visitEachChildOfMethodDeclaration(node, visitor, context, nodesVisitor, nodeVisitor, tokenVisitor) {
        return context.factory.updateMethodDeclaration(node, nodesVisitor(node.modifiers, visitor, ts_1.isModifierLike), tokenVisitor ? nodeVisitor(node.asteriskToken, tokenVisitor, ts_1.isAsteriskToken) : node.asteriskToken, ts_1.Debug.checkDefined(nodeVisitor(node.name, visitor, ts_1.isPropertyName)), tokenVisitor ? nodeVisitor(node.questionToken, tokenVisitor, ts_1.isQuestionToken) : node.questionToken, nodesVisitor(node.typeParameters, visitor, ts_1.isTypeParameterDeclaration), visitParameterList(node.parameters, visitor, context, nodesVisitor), nodeVisitor(node.type, visitor, ts_1.isTypeNode), visitFunctionBody(node.body, visitor, context, nodeVisitor));
    },
    _a[175 /* SyntaxKind.Constructor */] = function visitEachChildOfConstructorDeclaration(node, visitor, context, nodesVisitor, nodeVisitor, _tokenVisitor) {
        return context.factory.updateConstructorDeclaration(node, nodesVisitor(node.modifiers, visitor, ts_1.isModifierLike), visitParameterList(node.parameters, visitor, context, nodesVisitor), visitFunctionBody(node.body, visitor, context, nodeVisitor));
    },
    _a[176 /* SyntaxKind.GetAccessor */] = function visitEachChildOfGetAccessorDeclaration(node, visitor, context, nodesVisitor, nodeVisitor, _tokenVisitor) {
        return context.factory.updateGetAccessorDeclaration(node, nodesVisitor(node.modifiers, visitor, ts_1.isModifierLike), ts_1.Debug.checkDefined(nodeVisitor(node.name, visitor, ts_1.isPropertyName)), visitParameterList(node.parameters, visitor, context, nodesVisitor), nodeVisitor(node.type, visitor, ts_1.isTypeNode), visitFunctionBody(node.body, visitor, context, nodeVisitor));
    },
    _a[177 /* SyntaxKind.SetAccessor */] = function visitEachChildOfSetAccessorDeclaration(node, visitor, context, nodesVisitor, nodeVisitor, _tokenVisitor) {
        return context.factory.updateSetAccessorDeclaration(node, nodesVisitor(node.modifiers, visitor, ts_1.isModifierLike), ts_1.Debug.checkDefined(nodeVisitor(node.name, visitor, ts_1.isPropertyName)), visitParameterList(node.parameters, visitor, context, nodesVisitor), visitFunctionBody(node.body, visitor, context, nodeVisitor));
    },
    _a[174 /* SyntaxKind.ClassStaticBlockDeclaration */] = function visitEachChildOfClassStaticBlockDeclaration(node, visitor, context, _nodesVisitor, nodeVisitor, _tokenVisitor) {
        context.startLexicalEnvironment();
        context.suspendLexicalEnvironment();
        return context.factory.updateClassStaticBlockDeclaration(node, visitFunctionBody(node.body, visitor, context, nodeVisitor));
    },
    _a[178 /* SyntaxKind.CallSignature */] = function visitEachChildOfCallSignatureDeclaration(node, visitor, context, nodesVisitor, nodeVisitor, _tokenVisitor) {
        return context.factory.updateCallSignature(node, nodesVisitor(node.typeParameters, visitor, ts_1.isTypeParameterDeclaration), nodesVisitor(node.parameters, visitor, ts_1.isParameter), nodeVisitor(node.type, visitor, ts_1.isTypeNode));
    },
    _a[179 /* SyntaxKind.ConstructSignature */] = function visitEachChildOfConstructSignatureDeclaration(node, visitor, context, nodesVisitor, nodeVisitor, _tokenVisitor) {
        return context.factory.updateConstructSignature(node, nodesVisitor(node.typeParameters, visitor, ts_1.isTypeParameterDeclaration), nodesVisitor(node.parameters, visitor, ts_1.isParameter), nodeVisitor(node.type, visitor, ts_1.isTypeNode));
    },
    _a[180 /* SyntaxKind.IndexSignature */] = function visitEachChildOfIndexSignatureDeclaration(node, visitor, context, nodesVisitor, nodeVisitor, _tokenVisitor) {
        return context.factory.updateIndexSignature(node, nodesVisitor(node.modifiers, visitor, ts_1.isModifierLike), nodesVisitor(node.parameters, visitor, ts_1.isParameter), ts_1.Debug.checkDefined(nodeVisitor(node.type, visitor, ts_1.isTypeNode)));
    },
    // Types
    _a[181 /* SyntaxKind.TypePredicate */] = function visitEachChildOfTypePredicateNode(node, visitor, context, _nodesVisitor, nodeVisitor, _tokenVisitor) {
        return context.factory.updateTypePredicateNode(node, nodeVisitor(node.assertsModifier, visitor, ts_1.isAssertsKeyword), ts_1.Debug.checkDefined(nodeVisitor(node.parameterName, visitor, ts_1.isIdentifierOrThisTypeNode)), nodeVisitor(node.type, visitor, ts_1.isTypeNode));
    },
    _a[182 /* SyntaxKind.TypeReference */] = function visitEachChildOfTypeReferenceNode(node, visitor, context, nodesVisitor, nodeVisitor, _tokenVisitor) {
        return context.factory.updateTypeReferenceNode(node, ts_1.Debug.checkDefined(nodeVisitor(node.typeName, visitor, ts_1.isEntityName)), nodesVisitor(node.typeArguments, visitor, ts_1.isTypeNode));
    },
    _a[183 /* SyntaxKind.FunctionType */] = function visitEachChildOfFunctionTypeNode(node, visitor, context, nodesVisitor, nodeVisitor, _tokenVisitor) {
        return context.factory.updateFunctionTypeNode(node, nodesVisitor(node.typeParameters, visitor, ts_1.isTypeParameterDeclaration), nodesVisitor(node.parameters, visitor, ts_1.isParameter), ts_1.Debug.checkDefined(nodeVisitor(node.type, visitor, ts_1.isTypeNode)));
    },
    _a[184 /* SyntaxKind.ConstructorType */] = function visitEachChildOfConstructorTypeNode(node, visitor, context, nodesVisitor, nodeVisitor, _tokenVisitor) {
        return context.factory.updateConstructorTypeNode(node, nodesVisitor(node.modifiers, visitor, ts_1.isModifier), nodesVisitor(node.typeParameters, visitor, ts_1.isTypeParameterDeclaration), nodesVisitor(node.parameters, visitor, ts_1.isParameter), ts_1.Debug.checkDefined(nodeVisitor(node.type, visitor, ts_1.isTypeNode)));
    },
    _a[185 /* SyntaxKind.TypeQuery */] = function visitEachChildOfTypeQueryNode(node, visitor, context, nodesVisitor, nodeVisitor, _tokenVisitor) {
        return context.factory.updateTypeQueryNode(node, ts_1.Debug.checkDefined(nodeVisitor(node.exprName, visitor, ts_1.isEntityName)), nodesVisitor(node.typeArguments, visitor, ts_1.isTypeNode));
    },
    _a[186 /* SyntaxKind.TypeLiteral */] = function visitEachChildOfTypeLiteralNode(node, visitor, context, nodesVisitor, _nodeVisitor, _tokenVisitor) {
        return context.factory.updateTypeLiteralNode(node, nodesVisitor(node.members, visitor, ts_1.isTypeElement));
    },
    _a[187 /* SyntaxKind.ArrayType */] = function visitEachChildOfArrayTypeNode(node, visitor, context, _nodesVisitor, nodeVisitor, _tokenVisitor) {
        return context.factory.updateArrayTypeNode(node, ts_1.Debug.checkDefined(nodeVisitor(node.elementType, visitor, ts_1.isTypeNode)));
    },
    _a[188 /* SyntaxKind.TupleType */] = function visitEachChildOfTupleTypeNode(node, visitor, context, nodesVisitor, _nodeVisitor, _tokenVisitor) {
        return context.factory.updateTupleTypeNode(node, nodesVisitor(node.elements, visitor, ts_1.isTypeNode));
    },
    _a[189 /* SyntaxKind.OptionalType */] = function visitEachChildOfOptionalTypeNode(node, visitor, context, _nodesVisitor, nodeVisitor, _tokenVisitor) {
        return context.factory.updateOptionalTypeNode(node, ts_1.Debug.checkDefined(nodeVisitor(node.type, visitor, ts_1.isTypeNode)));
    },
    _a[190 /* SyntaxKind.RestType */] = function visitEachChildOfRestTypeNode(node, visitor, context, _nodesVisitor, nodeVisitor, _tokenVisitor) {
        return context.factory.updateRestTypeNode(node, ts_1.Debug.checkDefined(nodeVisitor(node.type, visitor, ts_1.isTypeNode)));
    },
    _a[191 /* SyntaxKind.UnionType */] = function visitEachChildOfUnionTypeNode(node, visitor, context, nodesVisitor, _nodeVisitor, _tokenVisitor) {
        return context.factory.updateUnionTypeNode(node, nodesVisitor(node.types, visitor, ts_1.isTypeNode));
    },
    _a[192 /* SyntaxKind.IntersectionType */] = function visitEachChildOfIntersectionTypeNode(node, visitor, context, nodesVisitor, _nodeVisitor, _tokenVisitor) {
        return context.factory.updateIntersectionTypeNode(node, nodesVisitor(node.types, visitor, ts_1.isTypeNode));
    },
    _a[193 /* SyntaxKind.ConditionalType */] = function visitEachChildOfConditionalTypeNode(node, visitor, context, _nodesVisitor, nodeVisitor, _tokenVisitor) {
        return context.factory.updateConditionalTypeNode(node, ts_1.Debug.checkDefined(nodeVisitor(node.checkType, visitor, ts_1.isTypeNode)), ts_1.Debug.checkDefined(nodeVisitor(node.extendsType, visitor, ts_1.isTypeNode)), ts_1.Debug.checkDefined(nodeVisitor(node.trueType, visitor, ts_1.isTypeNode)), ts_1.Debug.checkDefined(nodeVisitor(node.falseType, visitor, ts_1.isTypeNode)));
    },
    _a[194 /* SyntaxKind.InferType */] = function visitEachChildOfInferTypeNode(node, visitor, context, _nodesVisitor, nodeVisitor, _tokenVisitor) {
        return context.factory.updateInferTypeNode(node, ts_1.Debug.checkDefined(nodeVisitor(node.typeParameter, visitor, ts_1.isTypeParameterDeclaration)));
    },
    _a[204 /* SyntaxKind.ImportType */] = function visitEachChildOfImportTypeNode(node, visitor, context, nodesVisitor, nodeVisitor, _tokenVisitor) {
        return context.factory.updateImportTypeNode(node, ts_1.Debug.checkDefined(nodeVisitor(node.argument, visitor, ts_1.isTypeNode)), nodeVisitor(node.assertions, visitor, ts_1.isImportTypeAssertionContainer), nodeVisitor(node.qualifier, visitor, ts_1.isEntityName), nodesVisitor(node.typeArguments, visitor, ts_1.isTypeNode), node.isTypeOf);
    },
    _a[301 /* SyntaxKind.ImportTypeAssertionContainer */] = function visitEachChildOfImportTypeAssertionContainer(node, visitor, context, _nodesVisitor, nodeVisitor, _tokenVisitor) {
        return context.factory.updateImportTypeAssertionContainer(node, ts_1.Debug.checkDefined(nodeVisitor(node.assertClause, visitor, ts_1.isAssertClause)), node.multiLine);
    },
    _a[201 /* SyntaxKind.NamedTupleMember */] = function visitEachChildOfNamedTupleMember(node, visitor, context, _nodesVisitor, nodeVisitor, tokenVisitor) {
        return context.factory.updateNamedTupleMember(node, tokenVisitor ? nodeVisitor(node.dotDotDotToken, tokenVisitor, ts_1.isDotDotDotToken) : node.dotDotDotToken, ts_1.Debug.checkDefined(nodeVisitor(node.name, visitor, ts_1.isIdentifier)), tokenVisitor ? nodeVisitor(node.questionToken, tokenVisitor, ts_1.isQuestionToken) : node.questionToken, ts_1.Debug.checkDefined(nodeVisitor(node.type, visitor, ts_1.isTypeNode)));
    },
    _a[195 /* SyntaxKind.ParenthesizedType */] = function visitEachChildOfParenthesizedType(node, visitor, context, _nodesVisitor, nodeVisitor, _tokenVisitor) {
        return context.factory.updateParenthesizedType(node, ts_1.Debug.checkDefined(nodeVisitor(node.type, visitor, ts_1.isTypeNode)));
    },
    _a[197 /* SyntaxKind.TypeOperator */] = function visitEachChildOfTypeOperatorNode(node, visitor, context, _nodesVisitor, nodeVisitor, _tokenVisitor) {
        return context.factory.updateTypeOperatorNode(node, ts_1.Debug.checkDefined(nodeVisitor(node.type, visitor, ts_1.isTypeNode)));
    },
    _a[198 /* SyntaxKind.IndexedAccessType */] = function visitEachChildOfIndexedAccessType(node, visitor, context, _nodesVisitor, nodeVisitor, _tokenVisitor) {
        return context.factory.updateIndexedAccessTypeNode(node, ts_1.Debug.checkDefined(nodeVisitor(node.objectType, visitor, ts_1.isTypeNode)), ts_1.Debug.checkDefined(nodeVisitor(node.indexType, visitor, ts_1.isTypeNode)));
    },
    _a[199 /* SyntaxKind.MappedType */] = function visitEachChildOfMappedType(node, visitor, context, nodesVisitor, nodeVisitor, tokenVisitor) {
        return context.factory.updateMappedTypeNode(node, tokenVisitor ? nodeVisitor(node.readonlyToken, tokenVisitor, ts_1.isReadonlyKeywordOrPlusOrMinusToken) : node.readonlyToken, ts_1.Debug.checkDefined(nodeVisitor(node.typeParameter, visitor, ts_1.isTypeParameterDeclaration)), nodeVisitor(node.nameType, visitor, ts_1.isTypeNode), tokenVisitor ? nodeVisitor(node.questionToken, tokenVisitor, ts_1.isQuestionOrPlusOrMinusToken) : node.questionToken, nodeVisitor(node.type, visitor, ts_1.isTypeNode), nodesVisitor(node.members, visitor, ts_1.isTypeElement));
    },
    _a[200 /* SyntaxKind.LiteralType */] = function visitEachChildOfLiteralTypeNode(node, visitor, context, _nodesVisitor, nodeVisitor, _tokenVisitor) {
        return context.factory.updateLiteralTypeNode(node, ts_1.Debug.checkDefined(nodeVisitor(node.literal, visitor, ts_1.isLiteralTypeLiteral)));
    },
    _a[202 /* SyntaxKind.TemplateLiteralType */] = function visitEachChildOfTemplateLiteralType(node, visitor, context, nodesVisitor, nodeVisitor, _tokenVisitor) {
        return context.factory.updateTemplateLiteralType(node, ts_1.Debug.checkDefined(nodeVisitor(node.head, visitor, ts_1.isTemplateHead)), nodesVisitor(node.templateSpans, visitor, ts_1.isTemplateLiteralTypeSpan));
    },
    _a[203 /* SyntaxKind.TemplateLiteralTypeSpan */] = function visitEachChildOfTemplateLiteralTypeSpan(node, visitor, context, _nodesVisitor, nodeVisitor, _tokenVisitor) {
        return context.factory.updateTemplateLiteralTypeSpan(node, ts_1.Debug.checkDefined(nodeVisitor(node.type, visitor, ts_1.isTypeNode)), ts_1.Debug.checkDefined(nodeVisitor(node.literal, visitor, ts_1.isTemplateMiddleOrTemplateTail)));
    },
    // Binding patterns
    _a[205 /* SyntaxKind.ObjectBindingPattern */] = function visitEachChildOfObjectBindingPattern(node, visitor, context, nodesVisitor, _nodeVisitor, _tokenVisitor) {
        return context.factory.updateObjectBindingPattern(node, nodesVisitor(node.elements, visitor, ts_1.isBindingElement));
    },
    _a[206 /* SyntaxKind.ArrayBindingPattern */] = function visitEachChildOfArrayBindingPattern(node, visitor, context, nodesVisitor, _nodeVisitor, _tokenVisitor) {
        return context.factory.updateArrayBindingPattern(node, nodesVisitor(node.elements, visitor, ts_1.isArrayBindingElement));
    },
    _a[207 /* SyntaxKind.BindingElement */] = function visitEachChildOfBindingElement(node, visitor, context, _nodesVisitor, nodeVisitor, tokenVisitor) {
        return context.factory.updateBindingElement(node, tokenVisitor ? nodeVisitor(node.dotDotDotToken, tokenVisitor, ts_1.isDotDotDotToken) : node.dotDotDotToken, nodeVisitor(node.propertyName, visitor, ts_1.isPropertyName), ts_1.Debug.checkDefined(nodeVisitor(node.name, visitor, ts_1.isBindingName)), nodeVisitor(node.initializer, visitor, ts_1.isExpression));
    },
    // Expression
    _a[208 /* SyntaxKind.ArrayLiteralExpression */] = function visitEachChildOfArrayLiteralExpression(node, visitor, context, nodesVisitor, _nodeVisitor, _tokenVisitor) {
        return context.factory.updateArrayLiteralExpression(node, nodesVisitor(node.elements, visitor, ts_1.isExpression));
    },
    _a[209 /* SyntaxKind.ObjectLiteralExpression */] = function visitEachChildOfObjectLiteralExpression(node, visitor, context, nodesVisitor, _nodeVisitor, _tokenVisitor) {
        return context.factory.updateObjectLiteralExpression(node, nodesVisitor(node.properties, visitor, ts_1.isObjectLiteralElementLike));
    },
    _a[210 /* SyntaxKind.PropertyAccessExpression */] = function visitEachChildOfPropertyAccessExpression(node, visitor, context, _nodesVisitor, nodeVisitor, tokenVisitor) {
        return (0, ts_1.isPropertyAccessChain)(node) ?
            context.factory.updatePropertyAccessChain(node, ts_1.Debug.checkDefined(nodeVisitor(node.expression, visitor, ts_1.isExpression)), tokenVisitor ? nodeVisitor(node.questionDotToken, tokenVisitor, ts_1.isQuestionDotToken) : node.questionDotToken, ts_1.Debug.checkDefined(nodeVisitor(node.name, visitor, ts_1.isMemberName))) :
            context.factory.updatePropertyAccessExpression(node, ts_1.Debug.checkDefined(nodeVisitor(node.expression, visitor, ts_1.isExpression)), ts_1.Debug.checkDefined(nodeVisitor(node.name, visitor, ts_1.isMemberName)));
    },
    _a[211 /* SyntaxKind.ElementAccessExpression */] = function visitEachChildOfElementAccessExpression(node, visitor, context, _nodesVisitor, nodeVisitor, tokenVisitor) {
        return (0, ts_1.isElementAccessChain)(node) ?
            context.factory.updateElementAccessChain(node, ts_1.Debug.checkDefined(nodeVisitor(node.expression, visitor, ts_1.isExpression)), tokenVisitor ? nodeVisitor(node.questionDotToken, tokenVisitor, ts_1.isQuestionDotToken) : node.questionDotToken, ts_1.Debug.checkDefined(nodeVisitor(node.argumentExpression, visitor, ts_1.isExpression))) :
            context.factory.updateElementAccessExpression(node, ts_1.Debug.checkDefined(nodeVisitor(node.expression, visitor, ts_1.isExpression)), ts_1.Debug.checkDefined(nodeVisitor(node.argumentExpression, visitor, ts_1.isExpression)));
    },
    _a[212 /* SyntaxKind.CallExpression */] = function visitEachChildOfCallExpression(node, visitor, context, nodesVisitor, nodeVisitor, tokenVisitor) {
        return (0, ts_1.isCallChain)(node) ?
            context.factory.updateCallChain(node, ts_1.Debug.checkDefined(nodeVisitor(node.expression, visitor, ts_1.isExpression)), tokenVisitor ? nodeVisitor(node.questionDotToken, tokenVisitor, ts_1.isQuestionDotToken) : node.questionDotToken, nodesVisitor(node.typeArguments, visitor, ts_1.isTypeNode), nodesVisitor(node.arguments, visitor, ts_1.isExpression)) :
            context.factory.updateCallExpression(node, ts_1.Debug.checkDefined(nodeVisitor(node.expression, visitor, ts_1.isExpression)), nodesVisitor(node.typeArguments, visitor, ts_1.isTypeNode), nodesVisitor(node.arguments, visitor, ts_1.isExpression));
    },
    _a[213 /* SyntaxKind.NewExpression */] = function visitEachChildOfNewExpression(node, visitor, context, nodesVisitor, nodeVisitor, _tokenVisitor) {
        return context.factory.updateNewExpression(node, ts_1.Debug.checkDefined(nodeVisitor(node.expression, visitor, ts_1.isExpression)), nodesVisitor(node.typeArguments, visitor, ts_1.isTypeNode), nodesVisitor(node.arguments, visitor, ts_1.isExpression));
    },
    _a[214 /* SyntaxKind.TaggedTemplateExpression */] = function visitEachChildOfTaggedTemplateExpression(node, visitor, context, nodesVisitor, nodeVisitor, _tokenVisitor) {
        return context.factory.updateTaggedTemplateExpression(node, ts_1.Debug.checkDefined(nodeVisitor(node.tag, visitor, ts_1.isExpression)), nodesVisitor(node.typeArguments, visitor, ts_1.isTypeNode), ts_1.Debug.checkDefined(nodeVisitor(node.template, visitor, ts_1.isTemplateLiteral)));
    },
    _a[215 /* SyntaxKind.TypeAssertionExpression */] = function visitEachChildOfTypeAssertionExpression(node, visitor, context, _nodesVisitor, nodeVisitor, _tokenVisitor) {
        return context.factory.updateTypeAssertion(node, ts_1.Debug.checkDefined(nodeVisitor(node.type, visitor, ts_1.isTypeNode)), ts_1.Debug.checkDefined(nodeVisitor(node.expression, visitor, ts_1.isExpression)));
    },
    _a[216 /* SyntaxKind.ParenthesizedExpression */] = function visitEachChildOfParenthesizedExpression(node, visitor, context, _nodesVisitor, nodeVisitor, _tokenVisitor) {
        return context.factory.updateParenthesizedExpression(node, ts_1.Debug.checkDefined(nodeVisitor(node.expression, visitor, ts_1.isExpression)));
    },
    _a[217 /* SyntaxKind.FunctionExpression */] = function visitEachChildOfFunctionExpression(node, visitor, context, nodesVisitor, nodeVisitor, tokenVisitor) {
        return context.factory.updateFunctionExpression(node, nodesVisitor(node.modifiers, visitor, ts_1.isModifier), tokenVisitor ? nodeVisitor(node.asteriskToken, tokenVisitor, ts_1.isAsteriskToken) : node.asteriskToken, nodeVisitor(node.name, visitor, ts_1.isIdentifier), nodesVisitor(node.typeParameters, visitor, ts_1.isTypeParameterDeclaration), visitParameterList(node.parameters, visitor, context, nodesVisitor), nodeVisitor(node.type, visitor, ts_1.isTypeNode), visitFunctionBody(node.body, visitor, context, nodeVisitor));
    },
    _a[218 /* SyntaxKind.ArrowFunction */] = function visitEachChildOfArrowFunction(node, visitor, context, nodesVisitor, nodeVisitor, tokenVisitor) {
        return context.factory.updateArrowFunction(node, nodesVisitor(node.modifiers, visitor, ts_1.isModifier), nodesVisitor(node.typeParameters, visitor, ts_1.isTypeParameterDeclaration), visitParameterList(node.parameters, visitor, context, nodesVisitor), nodeVisitor(node.type, visitor, ts_1.isTypeNode), tokenVisitor ? ts_1.Debug.checkDefined(nodeVisitor(node.equalsGreaterThanToken, tokenVisitor, ts_1.isEqualsGreaterThanToken)) : node.equalsGreaterThanToken, visitFunctionBody(node.body, visitor, context, nodeVisitor));
    },
    _a[219 /* SyntaxKind.DeleteExpression */] = function visitEachChildOfDeleteExpression(node, visitor, context, _nodesVisitor, nodeVisitor, _tokenVisitor) {
        return context.factory.updateDeleteExpression(node, ts_1.Debug.checkDefined(nodeVisitor(node.expression, visitor, ts_1.isExpression)));
    },
    _a[220 /* SyntaxKind.TypeOfExpression */] = function visitEachChildOfTypeOfExpression(node, visitor, context, _nodesVisitor, nodeVisitor, _tokenVisitor) {
        return context.factory.updateTypeOfExpression(node, ts_1.Debug.checkDefined(nodeVisitor(node.expression, visitor, ts_1.isExpression)));
    },
    _a[221 /* SyntaxKind.VoidExpression */] = function visitEachChildOfVoidExpression(node, visitor, context, _nodesVisitor, nodeVisitor, _tokenVisitor) {
        return context.factory.updateVoidExpression(node, ts_1.Debug.checkDefined(nodeVisitor(node.expression, visitor, ts_1.isExpression)));
    },
    _a[222 /* SyntaxKind.AwaitExpression */] = function visitEachChildOfAwaitExpression(node, visitor, context, _nodesVisitor, nodeVisitor, _tokenVisitor) {
        return context.factory.updateAwaitExpression(node, ts_1.Debug.checkDefined(nodeVisitor(node.expression, visitor, ts_1.isExpression)));
    },
    _a[223 /* SyntaxKind.PrefixUnaryExpression */] = function visitEachChildOfPrefixUnaryExpression(node, visitor, context, _nodesVisitor, nodeVisitor, _tokenVisitor) {
        return context.factory.updatePrefixUnaryExpression(node, ts_1.Debug.checkDefined(nodeVisitor(node.operand, visitor, ts_1.isExpression)));
    },
    _a[224 /* SyntaxKind.PostfixUnaryExpression */] = function visitEachChildOfPostfixUnaryExpression(node, visitor, context, _nodesVisitor, nodeVisitor, _tokenVisitor) {
        return context.factory.updatePostfixUnaryExpression(node, ts_1.Debug.checkDefined(nodeVisitor(node.operand, visitor, ts_1.isExpression)));
    },
    _a[225 /* SyntaxKind.BinaryExpression */] = function visitEachChildOfBinaryExpression(node, visitor, context, _nodesVisitor, nodeVisitor, tokenVisitor) {
        return context.factory.updateBinaryExpression(node, ts_1.Debug.checkDefined(nodeVisitor(node.left, visitor, ts_1.isExpression)), tokenVisitor ? ts_1.Debug.checkDefined(nodeVisitor(node.operatorToken, tokenVisitor, ts_1.isBinaryOperatorToken)) : node.operatorToken, ts_1.Debug.checkDefined(nodeVisitor(node.right, visitor, ts_1.isExpression)));
    },
    _a[226 /* SyntaxKind.ConditionalExpression */] = function visitEachChildOfConditionalExpression(node, visitor, context, _nodesVisitor, nodeVisitor, tokenVisitor) {
        return context.factory.updateConditionalExpression(node, ts_1.Debug.checkDefined(nodeVisitor(node.condition, visitor, ts_1.isExpression)), tokenVisitor ? ts_1.Debug.checkDefined(nodeVisitor(node.questionToken, tokenVisitor, ts_1.isQuestionToken)) : node.questionToken, ts_1.Debug.checkDefined(nodeVisitor(node.whenTrue, visitor, ts_1.isExpression)), tokenVisitor ? ts_1.Debug.checkDefined(nodeVisitor(node.colonToken, tokenVisitor, ts_1.isColonToken)) : node.colonToken, ts_1.Debug.checkDefined(nodeVisitor(node.whenFalse, visitor, ts_1.isExpression)));
    },
    _a[227 /* SyntaxKind.TemplateExpression */] = function visitEachChildOfTemplateExpression(node, visitor, context, nodesVisitor, nodeVisitor, _tokenVisitor) {
        return context.factory.updateTemplateExpression(node, ts_1.Debug.checkDefined(nodeVisitor(node.head, visitor, ts_1.isTemplateHead)), nodesVisitor(node.templateSpans, visitor, ts_1.isTemplateSpan));
    },
    _a[228 /* SyntaxKind.YieldExpression */] = function visitEachChildOfYieldExpression(node, visitor, context, _nodesVisitor, nodeVisitor, tokenVisitor) {
        return context.factory.updateYieldExpression(node, tokenVisitor ? nodeVisitor(node.asteriskToken, tokenVisitor, ts_1.isAsteriskToken) : node.asteriskToken, nodeVisitor(node.expression, visitor, ts_1.isExpression));
    },
    _a[229 /* SyntaxKind.SpreadElement */] = function visitEachChildOfSpreadElement(node, visitor, context, _nodesVisitor, nodeVisitor, _tokenVisitor) {
        return context.factory.updateSpreadElement(node, ts_1.Debug.checkDefined(nodeVisitor(node.expression, visitor, ts_1.isExpression)));
    },
    _a[230 /* SyntaxKind.ClassExpression */] = function visitEachChildOfClassExpression(node, visitor, context, nodesVisitor, nodeVisitor, _tokenVisitor) {
        return context.factory.updateClassExpression(node, nodesVisitor(node.modifiers, visitor, ts_1.isModifierLike), nodeVisitor(node.name, visitor, ts_1.isIdentifier), nodesVisitor(node.typeParameters, visitor, ts_1.isTypeParameterDeclaration), nodesVisitor(node.heritageClauses, visitor, ts_1.isHeritageClause), nodesVisitor(node.members, visitor, ts_1.isClassElement));
    },
    _a[232 /* SyntaxKind.ExpressionWithTypeArguments */] = function visitEachChildOfExpressionWithTypeArguments(node, visitor, context, nodesVisitor, nodeVisitor, _tokenVisitor) {
        return context.factory.updateExpressionWithTypeArguments(node, ts_1.Debug.checkDefined(nodeVisitor(node.expression, visitor, ts_1.isExpression)), nodesVisitor(node.typeArguments, visitor, ts_1.isTypeNode));
    },
    _a[233 /* SyntaxKind.AsExpression */] = function visitEachChildOfAsExpression(node, visitor, context, _nodesVisitor, nodeVisitor, _tokenVisitor) {
        return context.factory.updateAsExpression(node, ts_1.Debug.checkDefined(nodeVisitor(node.expression, visitor, ts_1.isExpression)), ts_1.Debug.checkDefined(nodeVisitor(node.type, visitor, ts_1.isTypeNode)));
    },
    _a[237 /* SyntaxKind.SatisfiesExpression */] = function visitEachChildOfSatisfiesExpression(node, visitor, context, _nodesVisitor, nodeVisitor, _tokenVisitor) {
        return context.factory.updateSatisfiesExpression(node, ts_1.Debug.checkDefined(nodeVisitor(node.expression, visitor, ts_1.isExpression)), ts_1.Debug.checkDefined(nodeVisitor(node.type, visitor, ts_1.isTypeNode)));
    },
    _a[234 /* SyntaxKind.NonNullExpression */] = function visitEachChildOfNonNullExpression(node, visitor, context, _nodesVisitor, nodeVisitor, _tokenVisitor) {
        return (0, ts_1.isOptionalChain)(node) ?
            context.factory.updateNonNullChain(node, ts_1.Debug.checkDefined(nodeVisitor(node.expression, visitor, ts_1.isExpression))) :
            context.factory.updateNonNullExpression(node, ts_1.Debug.checkDefined(nodeVisitor(node.expression, visitor, ts_1.isExpression)));
    },
    _a[235 /* SyntaxKind.MetaProperty */] = function visitEachChildOfMetaProperty(node, visitor, context, _nodesVisitor, nodeVisitor, _tokenVisitor) {
        return context.factory.updateMetaProperty(node, ts_1.Debug.checkDefined(nodeVisitor(node.name, visitor, ts_1.isIdentifier)));
    },
    // Misc
    _a[238 /* SyntaxKind.TemplateSpan */] = function visitEachChildOfTemplateSpan(node, visitor, context, _nodesVisitor, nodeVisitor, _tokenVisitor) {
        return context.factory.updateTemplateSpan(node, ts_1.Debug.checkDefined(nodeVisitor(node.expression, visitor, ts_1.isExpression)), ts_1.Debug.checkDefined(nodeVisitor(node.literal, visitor, ts_1.isTemplateMiddleOrTemplateTail)));
    },
    // Element
    _a[240 /* SyntaxKind.Block */] = function visitEachChildOfBlock(node, visitor, context, nodesVisitor, _nodeVisitor, _tokenVisitor) {
        return context.factory.updateBlock(node, nodesVisitor(node.statements, visitor, ts_1.isStatement));
    },
    _a[242 /* SyntaxKind.VariableStatement */] = function visitEachChildOfVariableStatement(node, visitor, context, nodesVisitor, nodeVisitor, _tokenVisitor) {
        return context.factory.updateVariableStatement(node, nodesVisitor(node.modifiers, visitor, ts_1.isModifierLike), ts_1.Debug.checkDefined(nodeVisitor(node.declarationList, visitor, ts_1.isVariableDeclarationList)));
    },
    _a[243 /* SyntaxKind.ExpressionStatement */] = function visitEachChildOfExpressionStatement(node, visitor, context, _nodesVisitor, nodeVisitor, _tokenVisitor) {
        return context.factory.updateExpressionStatement(node, ts_1.Debug.checkDefined(nodeVisitor(node.expression, visitor, ts_1.isExpression)));
    },
    _a[244 /* SyntaxKind.IfStatement */] = function visitEachChildOfIfStatement(node, visitor, context, _nodesVisitor, nodeVisitor, _tokenVisitor) {
        return context.factory.updateIfStatement(node, ts_1.Debug.checkDefined(nodeVisitor(node.expression, visitor, ts_1.isExpression)), ts_1.Debug.checkDefined(nodeVisitor(node.thenStatement, visitor, ts_1.isStatement, context.factory.liftToBlock)), nodeVisitor(node.elseStatement, visitor, ts_1.isStatement, context.factory.liftToBlock));
    },
    _a[245 /* SyntaxKind.DoStatement */] = function visitEachChildOfDoStatement(node, visitor, context, _nodesVisitor, nodeVisitor, _tokenVisitor) {
        return context.factory.updateDoStatement(node, visitIterationBody(node.statement, visitor, context, nodeVisitor), ts_1.Debug.checkDefined(nodeVisitor(node.expression, visitor, ts_1.isExpression)));
    },
    _a[246 /* SyntaxKind.WhileStatement */] = function visitEachChildOfWhileStatement(node, visitor, context, _nodesVisitor, nodeVisitor, _tokenVisitor) {
        return context.factory.updateWhileStatement(node, ts_1.Debug.checkDefined(nodeVisitor(node.expression, visitor, ts_1.isExpression)), visitIterationBody(node.statement, visitor, context, nodeVisitor));
    },
    _a[247 /* SyntaxKind.ForStatement */] = function visitEachChildOfForStatement(node, visitor, context, _nodesVisitor, nodeVisitor, _tokenVisitor) {
        return context.factory.updateForStatement(node, nodeVisitor(node.initializer, visitor, ts_1.isForInitializer), nodeVisitor(node.condition, visitor, ts_1.isExpression), nodeVisitor(node.incrementor, visitor, ts_1.isExpression), visitIterationBody(node.statement, visitor, context, nodeVisitor));
    },
    _a[248 /* SyntaxKind.ForInStatement */] = function visitEachChildOfForInStatement(node, visitor, context, _nodesVisitor, nodeVisitor, _tokenVisitor) {
        return context.factory.updateForInStatement(node, ts_1.Debug.checkDefined(nodeVisitor(node.initializer, visitor, ts_1.isForInitializer)), ts_1.Debug.checkDefined(nodeVisitor(node.expression, visitor, ts_1.isExpression)), visitIterationBody(node.statement, visitor, context, nodeVisitor));
    },
    _a[249 /* SyntaxKind.ForOfStatement */] = function visitEachChildOfForOfStatement(node, visitor, context, _nodesVisitor, nodeVisitor, tokenVisitor) {
        return context.factory.updateForOfStatement(node, tokenVisitor ? nodeVisitor(node.awaitModifier, tokenVisitor, ts_1.isAwaitKeyword) : node.awaitModifier, ts_1.Debug.checkDefined(nodeVisitor(node.initializer, visitor, ts_1.isForInitializer)), ts_1.Debug.checkDefined(nodeVisitor(node.expression, visitor, ts_1.isExpression)), visitIterationBody(node.statement, visitor, context, nodeVisitor));
    },
    _a[250 /* SyntaxKind.ContinueStatement */] = function visitEachChildOfContinueStatement(node, visitor, context, _nodesVisitor, nodeVisitor, _tokenVisitor) {
        return context.factory.updateContinueStatement(node, nodeVisitor(node.label, visitor, ts_1.isIdentifier));
    },
    _a[251 /* SyntaxKind.BreakStatement */] = function visitEachChildOfBreakStatement(node, visitor, context, _nodesVisitor, nodeVisitor, _tokenVisitor) {
        return context.factory.updateBreakStatement(node, nodeVisitor(node.label, visitor, ts_1.isIdentifier));
    },
    _a[252 /* SyntaxKind.ReturnStatement */] = function visitEachChildOfReturnStatement(node, visitor, context, _nodesVisitor, nodeVisitor, _tokenVisitor) {
        return context.factory.updateReturnStatement(node, nodeVisitor(node.expression, visitor, ts_1.isExpression));
    },
    _a[253 /* SyntaxKind.WithStatement */] = function visitEachChildOfWithStatement(node, visitor, context, _nodesVisitor, nodeVisitor, _tokenVisitor) {
        return context.factory.updateWithStatement(node, ts_1.Debug.checkDefined(nodeVisitor(node.expression, visitor, ts_1.isExpression)), ts_1.Debug.checkDefined(nodeVisitor(node.statement, visitor, ts_1.isStatement, context.factory.liftToBlock)));
    },
    _a[254 /* SyntaxKind.SwitchStatement */] = function visitEachChildOfSwitchStatement(node, visitor, context, _nodesVisitor, nodeVisitor, _tokenVisitor) {
        return context.factory.updateSwitchStatement(node, ts_1.Debug.checkDefined(nodeVisitor(node.expression, visitor, ts_1.isExpression)), ts_1.Debug.checkDefined(nodeVisitor(node.caseBlock, visitor, ts_1.isCaseBlock)));
    },
    _a[255 /* SyntaxKind.LabeledStatement */] = function visitEachChildOfLabeledStatement(node, visitor, context, _nodesVisitor, nodeVisitor, _tokenVisitor) {
        return context.factory.updateLabeledStatement(node, ts_1.Debug.checkDefined(nodeVisitor(node.label, visitor, ts_1.isIdentifier)), ts_1.Debug.checkDefined(nodeVisitor(node.statement, visitor, ts_1.isStatement, context.factory.liftToBlock)));
    },
    _a[256 /* SyntaxKind.ThrowStatement */] = function visitEachChildOfThrowStatement(node, visitor, context, _nodesVisitor, nodeVisitor, _tokenVisitor) {
        return context.factory.updateThrowStatement(node, ts_1.Debug.checkDefined(nodeVisitor(node.expression, visitor, ts_1.isExpression)));
    },
    _a[257 /* SyntaxKind.TryStatement */] = function visitEachChildOfTryStatement(node, visitor, context, _nodesVisitor, nodeVisitor, _tokenVisitor) {
        return context.factory.updateTryStatement(node, ts_1.Debug.checkDefined(nodeVisitor(node.tryBlock, visitor, ts_1.isBlock)), nodeVisitor(node.catchClause, visitor, ts_1.isCatchClause), nodeVisitor(node.finallyBlock, visitor, ts_1.isBlock));
    },
    _a[259 /* SyntaxKind.VariableDeclaration */] = function visitEachChildOfVariableDeclaration(node, visitor, context, _nodesVisitor, nodeVisitor, tokenVisitor) {
        return context.factory.updateVariableDeclaration(node, ts_1.Debug.checkDefined(nodeVisitor(node.name, visitor, ts_1.isBindingName)), tokenVisitor ? nodeVisitor(node.exclamationToken, tokenVisitor, ts_1.isExclamationToken) : node.exclamationToken, nodeVisitor(node.type, visitor, ts_1.isTypeNode), nodeVisitor(node.initializer, visitor, ts_1.isExpression));
    },
    _a[260 /* SyntaxKind.VariableDeclarationList */] = function visitEachChildOfVariableDeclarationList(node, visitor, context, nodesVisitor, _nodeVisitor, _tokenVisitor) {
        return context.factory.updateVariableDeclarationList(node, nodesVisitor(node.declarations, visitor, ts_1.isVariableDeclaration));
    },
    _a[261 /* SyntaxKind.FunctionDeclaration */] = function visitEachChildOfFunctionDeclaration(node, visitor, context, nodesVisitor, nodeVisitor, tokenVisitor) {
        return context.factory.updateFunctionDeclaration(node, nodesVisitor(node.modifiers, visitor, ts_1.isModifier), tokenVisitor ? nodeVisitor(node.asteriskToken, tokenVisitor, ts_1.isAsteriskToken) : node.asteriskToken, nodeVisitor(node.name, visitor, ts_1.isIdentifier), nodesVisitor(node.typeParameters, visitor, ts_1.isTypeParameterDeclaration), visitParameterList(node.parameters, visitor, context, nodesVisitor), nodeVisitor(node.type, visitor, ts_1.isTypeNode), visitFunctionBody(node.body, visitor, context, nodeVisitor));
    },
    _a[262 /* SyntaxKind.ClassDeclaration */] = function visitEachChildOfClassDeclaration(node, visitor, context, nodesVisitor, nodeVisitor, _tokenVisitor) {
        return context.factory.updateClassDeclaration(node, nodesVisitor(node.modifiers, visitor, ts_1.isModifierLike), nodeVisitor(node.name, visitor, ts_1.isIdentifier), nodesVisitor(node.typeParameters, visitor, ts_1.isTypeParameterDeclaration), nodesVisitor(node.heritageClauses, visitor, ts_1.isHeritageClause), nodesVisitor(node.members, visitor, ts_1.isClassElement));
    },
    _a[263 /* SyntaxKind.InterfaceDeclaration */] = function visitEachChildOfInterfaceDeclaration(node, visitor, context, nodesVisitor, nodeVisitor, _tokenVisitor) {
        return context.factory.updateInterfaceDeclaration(node, nodesVisitor(node.modifiers, visitor, ts_1.isModifierLike), ts_1.Debug.checkDefined(nodeVisitor(node.name, visitor, ts_1.isIdentifier)), nodesVisitor(node.typeParameters, visitor, ts_1.isTypeParameterDeclaration), nodesVisitor(node.heritageClauses, visitor, ts_1.isHeritageClause), nodesVisitor(node.members, visitor, ts_1.isTypeElement));
    },
    _a[264 /* SyntaxKind.TypeAliasDeclaration */] = function visitEachChildOfTypeAliasDeclaration(node, visitor, context, nodesVisitor, nodeVisitor, _tokenVisitor) {
        return context.factory.updateTypeAliasDeclaration(node, nodesVisitor(node.modifiers, visitor, ts_1.isModifierLike), ts_1.Debug.checkDefined(nodeVisitor(node.name, visitor, ts_1.isIdentifier)), nodesVisitor(node.typeParameters, visitor, ts_1.isTypeParameterDeclaration), ts_1.Debug.checkDefined(nodeVisitor(node.type, visitor, ts_1.isTypeNode)));
    },
    _a[265 /* SyntaxKind.EnumDeclaration */] = function visitEachChildOfEnumDeclaration(node, visitor, context, nodesVisitor, nodeVisitor, _tokenVisitor) {
        return context.factory.updateEnumDeclaration(node, nodesVisitor(node.modifiers, visitor, ts_1.isModifierLike), ts_1.Debug.checkDefined(nodeVisitor(node.name, visitor, ts_1.isIdentifier)), nodesVisitor(node.members, visitor, ts_1.isEnumMember));
    },
    _a[266 /* SyntaxKind.ModuleDeclaration */] = function visitEachChildOfModuleDeclaration(node, visitor, context, nodesVisitor, nodeVisitor, _tokenVisitor) {
        return context.factory.updateModuleDeclaration(node, nodesVisitor(node.modifiers, visitor, ts_1.isModifierLike), ts_1.Debug.checkDefined(nodeVisitor(node.name, visitor, ts_1.isModuleName)), nodeVisitor(node.body, visitor, ts_1.isModuleBody));
    },
    _a[267 /* SyntaxKind.ModuleBlock */] = function visitEachChildOfModuleBlock(node, visitor, context, nodesVisitor, _nodeVisitor, _tokenVisitor) {
        return context.factory.updateModuleBlock(node, nodesVisitor(node.statements, visitor, ts_1.isStatement));
    },
    _a[268 /* SyntaxKind.CaseBlock */] = function visitEachChildOfCaseBlock(node, visitor, context, nodesVisitor, _nodeVisitor, _tokenVisitor) {
        return context.factory.updateCaseBlock(node, nodesVisitor(node.clauses, visitor, ts_1.isCaseOrDefaultClause));
    },
    _a[269 /* SyntaxKind.NamespaceExportDeclaration */] = function visitEachChildOfNamespaceExportDeclaration(node, visitor, context, _nodesVisitor, nodeVisitor, _tokenVisitor) {
        return context.factory.updateNamespaceExportDeclaration(node, ts_1.Debug.checkDefined(nodeVisitor(node.name, visitor, ts_1.isIdentifier)));
    },
    _a[270 /* SyntaxKind.ImportEqualsDeclaration */] = function visitEachChildOfImportEqualsDeclaration(node, visitor, context, nodesVisitor, nodeVisitor, _tokenVisitor) {
        return context.factory.updateImportEqualsDeclaration(node, nodesVisitor(node.modifiers, visitor, ts_1.isModifierLike), node.isTypeOnly, ts_1.Debug.checkDefined(nodeVisitor(node.name, visitor, ts_1.isIdentifier)), ts_1.Debug.checkDefined(nodeVisitor(node.moduleReference, visitor, ts_1.isModuleReference)));
    },
    _a[271 /* SyntaxKind.ImportDeclaration */] = function visitEachChildOfImportDeclaration(node, visitor, context, nodesVisitor, nodeVisitor, _tokenVisitor) {
        return context.factory.updateImportDeclaration(node, nodesVisitor(node.modifiers, visitor, ts_1.isModifierLike), nodeVisitor(node.importClause, visitor, ts_1.isImportClause), ts_1.Debug.checkDefined(nodeVisitor(node.moduleSpecifier, visitor, ts_1.isExpression)), nodeVisitor(node.assertClause, visitor, ts_1.isAssertClause));
    },
    _a[299 /* SyntaxKind.AssertClause */] = function visitEachChildOfAssertClause(node, visitor, context, nodesVisitor, _nodeVisitor, _tokenVisitor) {
        return context.factory.updateAssertClause(node, nodesVisitor(node.elements, visitor, ts_1.isAssertEntry), node.multiLine);
    },
    _a[300 /* SyntaxKind.AssertEntry */] = function visitEachChildOfAssertEntry(node, visitor, context, _nodesVisitor, nodeVisitor, _tokenVisitor) {
        return context.factory.updateAssertEntry(node, ts_1.Debug.checkDefined(nodeVisitor(node.name, visitor, ts_1.isAssertionKey)), ts_1.Debug.checkDefined(nodeVisitor(node.value, visitor, ts_1.isExpression)));
    },
    _a[272 /* SyntaxKind.ImportClause */] = function visitEachChildOfImportClause(node, visitor, context, _nodesVisitor, nodeVisitor, _tokenVisitor) {
        return context.factory.updateImportClause(node, node.isTypeOnly, nodeVisitor(node.name, visitor, ts_1.isIdentifier), nodeVisitor(node.namedBindings, visitor, ts_1.isNamedImportBindings));
    },
    _a[273 /* SyntaxKind.NamespaceImport */] = function visitEachChildOfNamespaceImport(node, visitor, context, _nodesVisitor, nodeVisitor, _tokenVisitor) {
        return context.factory.updateNamespaceImport(node, ts_1.Debug.checkDefined(nodeVisitor(node.name, visitor, ts_1.isIdentifier)));
    },
    _a[279 /* SyntaxKind.NamespaceExport */] = function visitEachChildOfNamespaceExport(node, visitor, context, _nodesVisitor, nodeVisitor, _tokenVisitor) {
        return context.factory.updateNamespaceExport(node, ts_1.Debug.checkDefined(nodeVisitor(node.name, visitor, ts_1.isIdentifier)));
    },
    _a[274 /* SyntaxKind.NamedImports */] = function visitEachChildOfNamedImports(node, visitor, context, nodesVisitor, _nodeVisitor, _tokenVisitor) {
        return context.factory.updateNamedImports(node, nodesVisitor(node.elements, visitor, ts_1.isImportSpecifier));
    },
    _a[275 /* SyntaxKind.ImportSpecifier */] = function visitEachChildOfImportSpecifier(node, visitor, context, _nodesVisitor, nodeVisitor, _tokenVisitor) {
        return context.factory.updateImportSpecifier(node, node.isTypeOnly, nodeVisitor(node.propertyName, visitor, ts_1.isIdentifier), ts_1.Debug.checkDefined(nodeVisitor(node.name, visitor, ts_1.isIdentifier)));
    },
    _a[276 /* SyntaxKind.ExportAssignment */] = function visitEachChildOfExportAssignment(node, visitor, context, nodesVisitor, nodeVisitor, _tokenVisitor) {
        return context.factory.updateExportAssignment(node, nodesVisitor(node.modifiers, visitor, ts_1.isModifierLike), ts_1.Debug.checkDefined(nodeVisitor(node.expression, visitor, ts_1.isExpression)));
    },
    _a[277 /* SyntaxKind.ExportDeclaration */] = function visitEachChildOfExportDeclaration(node, visitor, context, nodesVisitor, nodeVisitor, _tokenVisitor) {
        return context.factory.updateExportDeclaration(node, nodesVisitor(node.modifiers, visitor, ts_1.isModifierLike), node.isTypeOnly, nodeVisitor(node.exportClause, visitor, ts_1.isNamedExportBindings), nodeVisitor(node.moduleSpecifier, visitor, ts_1.isExpression), nodeVisitor(node.assertClause, visitor, ts_1.isAssertClause));
    },
    _a[278 /* SyntaxKind.NamedExports */] = function visitEachChildOfNamedExports(node, visitor, context, nodesVisitor, _nodeVisitor, _tokenVisitor) {
        return context.factory.updateNamedExports(node, nodesVisitor(node.elements, visitor, ts_1.isExportSpecifier));
    },
    _a[280 /* SyntaxKind.ExportSpecifier */] = function visitEachChildOfExportSpecifier(node, visitor, context, _nodesVisitor, nodeVisitor, _tokenVisitor) {
        return context.factory.updateExportSpecifier(node, node.isTypeOnly, nodeVisitor(node.propertyName, visitor, ts_1.isIdentifier), ts_1.Debug.checkDefined(nodeVisitor(node.name, visitor, ts_1.isIdentifier)));
    },
    // Module references
    _a[282 /* SyntaxKind.ExternalModuleReference */] = function visitEachChildOfExternalModuleReference(node, visitor, context, _nodesVisitor, nodeVisitor, _tokenVisitor) {
        return context.factory.updateExternalModuleReference(node, ts_1.Debug.checkDefined(nodeVisitor(node.expression, visitor, ts_1.isExpression)));
    },
    // JSX
    _a[283 /* SyntaxKind.JsxElement */] = function visitEachChildOfJsxElement(node, visitor, context, nodesVisitor, nodeVisitor, _tokenVisitor) {
        return context.factory.updateJsxElement(node, ts_1.Debug.checkDefined(nodeVisitor(node.openingElement, visitor, ts_1.isJsxOpeningElement)), nodesVisitor(node.children, visitor, ts_1.isJsxChild), ts_1.Debug.checkDefined(nodeVisitor(node.closingElement, visitor, ts_1.isJsxClosingElement)));
    },
    _a[284 /* SyntaxKind.JsxSelfClosingElement */] = function visitEachChildOfJsxSelfClosingElement(node, visitor, context, nodesVisitor, nodeVisitor, _tokenVisitor) {
        return context.factory.updateJsxSelfClosingElement(node, ts_1.Debug.checkDefined(nodeVisitor(node.tagName, visitor, ts_1.isJsxTagNameExpression)), nodesVisitor(node.typeArguments, visitor, ts_1.isTypeNode), ts_1.Debug.checkDefined(nodeVisitor(node.attributes, visitor, ts_1.isJsxAttributes)));
    },
    _a[285 /* SyntaxKind.JsxOpeningElement */] = function visitEachChildOfJsxOpeningElement(node, visitor, context, nodesVisitor, nodeVisitor, _tokenVisitor) {
        return context.factory.updateJsxOpeningElement(node, ts_1.Debug.checkDefined(nodeVisitor(node.tagName, visitor, ts_1.isJsxTagNameExpression)), nodesVisitor(node.typeArguments, visitor, ts_1.isTypeNode), ts_1.Debug.checkDefined(nodeVisitor(node.attributes, visitor, ts_1.isJsxAttributes)));
    },
    _a[286 /* SyntaxKind.JsxClosingElement */] = function visitEachChildOfJsxClosingElement(node, visitor, context, _nodesVisitor, nodeVisitor, _tokenVisitor) {
        return context.factory.updateJsxClosingElement(node, ts_1.Debug.checkDefined(nodeVisitor(node.tagName, visitor, ts_1.isJsxTagNameExpression)));
    },
    _a[294 /* SyntaxKind.JsxNamespacedName */] = function forEachChildInJsxNamespacedName(node, visitor, context, _nodesVisitor, nodeVisitor, _tokenVisitor) {
        return context.factory.updateJsxNamespacedName(node, ts_1.Debug.checkDefined(nodeVisitor(node.namespace, visitor, ts_1.isIdentifier)), ts_1.Debug.checkDefined(nodeVisitor(node.name, visitor, ts_1.isIdentifier)));
    },
    _a[287 /* SyntaxKind.JsxFragment */] = function visitEachChildOfJsxFragment(node, visitor, context, nodesVisitor, nodeVisitor, _tokenVisitor) {
        return context.factory.updateJsxFragment(node, ts_1.Debug.checkDefined(nodeVisitor(node.openingFragment, visitor, ts_1.isJsxOpeningFragment)), nodesVisitor(node.children, visitor, ts_1.isJsxChild), ts_1.Debug.checkDefined(nodeVisitor(node.closingFragment, visitor, ts_1.isJsxClosingFragment)));
    },
    _a[290 /* SyntaxKind.JsxAttribute */] = function visitEachChildOfJsxAttribute(node, visitor, context, _nodesVisitor, nodeVisitor, _tokenVisitor) {
        return context.factory.updateJsxAttribute(node, ts_1.Debug.checkDefined(nodeVisitor(node.name, visitor, ts_1.isJsxAttributeName)), nodeVisitor(node.initializer, visitor, ts_1.isStringLiteralOrJsxExpression));
    },
    _a[291 /* SyntaxKind.JsxAttributes */] = function visitEachChildOfJsxAttributes(node, visitor, context, nodesVisitor, _nodeVisitor, _tokenVisitor) {
        return context.factory.updateJsxAttributes(node, nodesVisitor(node.properties, visitor, ts_1.isJsxAttributeLike));
    },
    _a[292 /* SyntaxKind.JsxSpreadAttribute */] = function visitEachChildOfJsxSpreadAttribute(node, visitor, context, _nodesVisitor, nodeVisitor, _tokenVisitor) {
        return context.factory.updateJsxSpreadAttribute(node, ts_1.Debug.checkDefined(nodeVisitor(node.expression, visitor, ts_1.isExpression)));
    },
    _a[293 /* SyntaxKind.JsxExpression */] = function visitEachChildOfJsxExpression(node, visitor, context, _nodesVisitor, nodeVisitor, _tokenVisitor) {
        return context.factory.updateJsxExpression(node, nodeVisitor(node.expression, visitor, ts_1.isExpression));
    },
    // Clauses
    _a[295 /* SyntaxKind.CaseClause */] = function visitEachChildOfCaseClause(node, visitor, context, nodesVisitor, nodeVisitor, _tokenVisitor) {
        return context.factory.updateCaseClause(node, ts_1.Debug.checkDefined(nodeVisitor(node.expression, visitor, ts_1.isExpression)), nodesVisitor(node.statements, visitor, ts_1.isStatement));
    },
    _a[296 /* SyntaxKind.DefaultClause */] = function visitEachChildOfDefaultClause(node, visitor, context, nodesVisitor, _nodeVisitor, _tokenVisitor) {
        return context.factory.updateDefaultClause(node, nodesVisitor(node.statements, visitor, ts_1.isStatement));
    },
    _a[297 /* SyntaxKind.HeritageClause */] = function visitEachChildOfHeritageClause(node, visitor, context, nodesVisitor, _nodeVisitor, _tokenVisitor) {
        return context.factory.updateHeritageClause(node, nodesVisitor(node.types, visitor, ts_1.isExpressionWithTypeArguments));
    },
    _a[298 /* SyntaxKind.CatchClause */] = function visitEachChildOfCatchClause(node, visitor, context, _nodesVisitor, nodeVisitor, _tokenVisitor) {
        return context.factory.updateCatchClause(node, nodeVisitor(node.variableDeclaration, visitor, ts_1.isVariableDeclaration), ts_1.Debug.checkDefined(nodeVisitor(node.block, visitor, ts_1.isBlock)));
    },
    // Property assignments
    _a[302 /* SyntaxKind.PropertyAssignment */] = function visitEachChildOfPropertyAssignment(node, visitor, context, _nodesVisitor, nodeVisitor, _tokenVisitor) {
        return context.factory.updatePropertyAssignment(node, ts_1.Debug.checkDefined(nodeVisitor(node.name, visitor, ts_1.isPropertyName)), ts_1.Debug.checkDefined(nodeVisitor(node.initializer, visitor, ts_1.isExpression)));
    },
    _a[303 /* SyntaxKind.ShorthandPropertyAssignment */] = function visitEachChildOfShorthandPropertyAssignment(node, visitor, context, _nodesVisitor, nodeVisitor, _tokenVisitor) {
        return context.factory.updateShorthandPropertyAssignment(node, ts_1.Debug.checkDefined(nodeVisitor(node.name, visitor, ts_1.isIdentifier)), nodeVisitor(node.objectAssignmentInitializer, visitor, ts_1.isExpression));
    },
    _a[304 /* SyntaxKind.SpreadAssignment */] = function visitEachChildOfSpreadAssignment(node, visitor, context, _nodesVisitor, nodeVisitor, _tokenVisitor) {
        return context.factory.updateSpreadAssignment(node, ts_1.Debug.checkDefined(nodeVisitor(node.expression, visitor, ts_1.isExpression)));
    },
    // Enum
    _a[305 /* SyntaxKind.EnumMember */] = function visitEachChildOfEnumMember(node, visitor, context, _nodesVisitor, nodeVisitor, _tokenVisitor) {
        return context.factory.updateEnumMember(node, ts_1.Debug.checkDefined(nodeVisitor(node.name, visitor, ts_1.isPropertyName)), nodeVisitor(node.initializer, visitor, ts_1.isExpression));
    },
    // Top-level nodes
    _a[311 /* SyntaxKind.SourceFile */] = function visitEachChildOfSourceFile(node, visitor, context, _nodesVisitor, _nodeVisitor, _tokenVisitor) {
        return context.factory.updateSourceFile(node, visitLexicalEnvironment(node.statements, visitor, context));
    },
    // Transformation nodes
    _a[359 /* SyntaxKind.PartiallyEmittedExpression */] = function visitEachChildOfPartiallyEmittedExpression(node, visitor, context, _nodesVisitor, nodeVisitor, _tokenVisitor) {
        return context.factory.updatePartiallyEmittedExpression(node, ts_1.Debug.checkDefined(nodeVisitor(node.expression, visitor, ts_1.isExpression)));
    },
    _a[360 /* SyntaxKind.CommaListExpression */] = function visitEachChildOfCommaListExpression(node, visitor, context, nodesVisitor, _nodeVisitor, _tokenVisitor) {
        return context.factory.updateCommaListExpression(node, nodesVisitor(node.elements, visitor, ts_1.isExpression));
    },
    _a);
/**
 * Extracts the single node from a NodeArray.
 *
 * @param nodes The NodeArray.
 */
function extractSingleNode(nodes) {
    ts_1.Debug.assert(nodes.length <= 1, "Too many nodes written to output.");
    return (0, ts_1.singleOrUndefined)(nodes);
}
