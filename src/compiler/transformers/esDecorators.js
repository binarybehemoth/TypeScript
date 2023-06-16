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
exports.transformESDecorators = void 0;
var ts_1 = require("../_namespaces/ts");
/** @internal */
function transformESDecorators(context) {
    var factory = context.factory, emitHelpers = context.getEmitHelperFactory, startLexicalEnvironment = context.startLexicalEnvironment, endLexicalEnvironment = context.endLexicalEnvironment, hoistVariableDeclaration = context.hoistVariableDeclaration;
    var compilerOptions = context.getCompilerOptions();
    var languageVersion = (0, ts_1.getEmitScriptTarget)(compilerOptions);
    var top;
    var classInfo;
    var classThis;
    var classSuper;
    var pendingExpressions;
    var shouldTransformPrivateStaticElementsInFile;
    return (0, ts_1.chainBundle)(context, transformSourceFile);
    function transformSourceFile(node) {
        top = undefined;
        shouldTransformPrivateStaticElementsInFile = false;
        var visited = (0, ts_1.visitEachChild)(node, visitor, context);
        (0, ts_1.addEmitHelpers)(visited, context.readEmitHelpers());
        if (shouldTransformPrivateStaticElementsInFile) {
            (0, ts_1.addInternalEmitFlags)(visited, 32 /* InternalEmitFlags.TransformPrivateStaticElements */);
            shouldTransformPrivateStaticElementsInFile = false;
        }
        return visited;
    }
    function updateState() {
        classInfo = undefined;
        classThis = undefined;
        classSuper = undefined;
        switch (top === null || top === void 0 ? void 0 : top.kind) {
            case "class":
                classInfo = top.classInfo;
                break;
            case "class-element":
                classInfo = top.next.classInfo;
                classThis = top.classThis;
                classSuper = top.classSuper;
                break;
            case "name":
                var grandparent = top.next.next.next;
                if ((grandparent === null || grandparent === void 0 ? void 0 : grandparent.kind) === "class-element") {
                    classInfo = grandparent.next.classInfo;
                    classThis = grandparent.classThis;
                    classSuper = grandparent.classSuper;
                }
                break;
        }
    }
    function enterClass(classInfo) {
        top = { kind: "class", next: top, classInfo: classInfo, savedPendingExpressions: pendingExpressions };
        pendingExpressions = undefined;
        updateState();
    }
    function exitClass() {
        ts_1.Debug.assert((top === null || top === void 0 ? void 0 : top.kind) === "class", "Incorrect value for top.kind.", function () { return "Expected top.kind to be 'class' but got '".concat(top === null || top === void 0 ? void 0 : top.kind, "' instead."); });
        pendingExpressions = top.savedPendingExpressions;
        top = top.next;
        updateState();
    }
    function enterClassElement(node) {
        var _a, _b;
        ts_1.Debug.assert((top === null || top === void 0 ? void 0 : top.kind) === "class", "Incorrect value for top.kind.", function () { return "Expected top.kind to be 'class' but got '".concat(top === null || top === void 0 ? void 0 : top.kind, "' instead."); });
        top = { kind: "class-element", next: top };
        if ((0, ts_1.isClassStaticBlockDeclaration)(node) || (0, ts_1.isPropertyDeclaration)(node) && (0, ts_1.hasStaticModifier)(node)) {
            top.classThis = (_a = top.next.classInfo) === null || _a === void 0 ? void 0 : _a.classThis;
            top.classSuper = (_b = top.next.classInfo) === null || _b === void 0 ? void 0 : _b.classSuper;
        }
        updateState();
    }
    function exitClassElement() {
        var _a;
        ts_1.Debug.assert((top === null || top === void 0 ? void 0 : top.kind) === "class-element", "Incorrect value for top.kind.", function () { return "Expected top.kind to be 'class-element' but got '".concat(top === null || top === void 0 ? void 0 : top.kind, "' instead."); });
        ts_1.Debug.assert(((_a = top.next) === null || _a === void 0 ? void 0 : _a.kind) === "class", "Incorrect value for top.next.kind.", function () { var _a; return "Expected top.next.kind to be 'class' but got '".concat((_a = top.next) === null || _a === void 0 ? void 0 : _a.kind, "' instead."); });
        top = top.next;
        updateState();
    }
    function enterName() {
        ts_1.Debug.assert((top === null || top === void 0 ? void 0 : top.kind) === "class-element", "Incorrect value for top.kind.", function () { return "Expected top.kind to be 'class-element' but got '".concat(top === null || top === void 0 ? void 0 : top.kind, "' instead."); });
        top = { kind: "name", next: top };
        updateState();
    }
    function exitName() {
        ts_1.Debug.assert((top === null || top === void 0 ? void 0 : top.kind) === "name", "Incorrect value for top.kind.", function () { return "Expected top.kind to be 'name' but got '".concat(top === null || top === void 0 ? void 0 : top.kind, "' instead."); });
        top = top.next;
        updateState();
    }
    function enterOther() {
        if ((top === null || top === void 0 ? void 0 : top.kind) === "other") {
            ts_1.Debug.assert(!pendingExpressions);
            top.depth++;
        }
        else {
            top = { kind: "other", next: top, depth: 0, savedPendingExpressions: pendingExpressions };
            pendingExpressions = undefined;
            updateState();
        }
    }
    function exitOther() {
        ts_1.Debug.assert((top === null || top === void 0 ? void 0 : top.kind) === "other", "Incorrect value for top.kind.", function () { return "Expected top.kind to be 'other' but got '".concat(top === null || top === void 0 ? void 0 : top.kind, "' instead."); });
        if (top.depth > 0) {
            ts_1.Debug.assert(!pendingExpressions);
            top.depth--;
        }
        else {
            pendingExpressions = top.savedPendingExpressions;
            top = top.next;
            updateState();
        }
    }
    function shouldVisitNode(node) {
        return !!(node.transformFlags & 33554432 /* TransformFlags.ContainsDecorators */)
            || !!classThis && !!(node.transformFlags & 16384 /* TransformFlags.ContainsLexicalThis */)
            || !!classThis && !!classSuper && !!(node.transformFlags & 134217728 /* TransformFlags.ContainsLexicalSuper */);
    }
    function visitor(node) {
        if (!shouldVisitNode(node)) {
            return node;
        }
        switch (node.kind) {
            case 169 /* SyntaxKind.Decorator */: // elided, will be emitted as part of `visitClassDeclaration`
                return ts_1.Debug.fail("Use `modifierVisitor` instead.");
            case 262 /* SyntaxKind.ClassDeclaration */:
                return visitClassDeclaration(node);
            case 230 /* SyntaxKind.ClassExpression */:
                return visitClassExpression(node, /*referencedName*/ undefined);
            case 175 /* SyntaxKind.Constructor */:
            case 171 /* SyntaxKind.PropertyDeclaration */:
            case 174 /* SyntaxKind.ClassStaticBlockDeclaration */:
                return ts_1.Debug.fail("Not supported outside of a class. Use 'classElementVisitor' instead.");
            case 168 /* SyntaxKind.Parameter */:
                return visitParameterDeclaration(node);
            // Support NamedEvaluation to ensure the correct class name for class expressions.
            case 225 /* SyntaxKind.BinaryExpression */:
                return visitBinaryExpression(node, /*discarded*/ false);
            case 302 /* SyntaxKind.PropertyAssignment */:
                return visitPropertyAssignment(node);
            case 259 /* SyntaxKind.VariableDeclaration */:
                return visitVariableDeclaration(node);
            case 207 /* SyntaxKind.BindingElement */:
                return visitBindingElement(node);
            case 276 /* SyntaxKind.ExportAssignment */:
                return visitExportAssignment(node);
            case 110 /* SyntaxKind.ThisKeyword */:
                return visitThisExpression(node);
            case 247 /* SyntaxKind.ForStatement */:
                return visitForStatement(node);
            case 243 /* SyntaxKind.ExpressionStatement */:
                return visitExpressionStatement(node);
            case 360 /* SyntaxKind.CommaListExpression */:
                return visitCommaListExpression(node, /*discarded*/ false);
            case 216 /* SyntaxKind.ParenthesizedExpression */:
                return visitParenthesizedExpression(node, /*discarded*/ false, /*referencedName*/ undefined);
            case 359 /* SyntaxKind.PartiallyEmittedExpression */:
                return visitPartiallyEmittedExpression(node, /*discarded*/ false, /*referencedName*/ undefined);
            case 212 /* SyntaxKind.CallExpression */:
                return visitCallExpression(node);
            case 214 /* SyntaxKind.TaggedTemplateExpression */:
                return visitTaggedTemplateExpression(node);
            case 223 /* SyntaxKind.PrefixUnaryExpression */:
            case 224 /* SyntaxKind.PostfixUnaryExpression */:
                return visitPreOrPostfixUnaryExpression(node, /*discarded*/ false);
            case 210 /* SyntaxKind.PropertyAccessExpression */:
                return visitPropertyAccessExpression(node);
            case 211 /* SyntaxKind.ElementAccessExpression */:
                return visitElementAccessExpression(node);
            case 166 /* SyntaxKind.ComputedPropertyName */:
                return visitComputedPropertyName(node);
            case 173 /* SyntaxKind.MethodDeclaration */: // object literal methods and accessors
            case 177 /* SyntaxKind.SetAccessor */:
            case 176 /* SyntaxKind.GetAccessor */:
            case 217 /* SyntaxKind.FunctionExpression */:
            case 261 /* SyntaxKind.FunctionDeclaration */: {
                enterOther();
                var result = (0, ts_1.visitEachChild)(node, fallbackVisitor, context);
                exitOther();
                return result;
            }
            default:
                return (0, ts_1.visitEachChild)(node, fallbackVisitor, context);
        }
    }
    function fallbackVisitor(node) {
        switch (node.kind) {
            case 169 /* SyntaxKind.Decorator */:
                return undefined;
            default:
                return visitor(node);
        }
    }
    function modifierVisitor(node) {
        switch (node.kind) {
            case 169 /* SyntaxKind.Decorator */: // elided, will be emitted as part of `visitClassDeclaration`
                return undefined;
            default:
                return node;
        }
    }
    function classElementVisitor(node) {
        switch (node.kind) {
            case 175 /* SyntaxKind.Constructor */:
                return visitConstructorDeclaration(node);
            case 173 /* SyntaxKind.MethodDeclaration */:
                return visitMethodDeclaration(node);
            case 176 /* SyntaxKind.GetAccessor */:
                return visitGetAccessorDeclaration(node);
            case 177 /* SyntaxKind.SetAccessor */:
                return visitSetAccessorDeclaration(node);
            case 171 /* SyntaxKind.PropertyDeclaration */:
                return visitPropertyDeclaration(node);
            case 174 /* SyntaxKind.ClassStaticBlockDeclaration */:
                return visitClassStaticBlockDeclaration(node);
            default:
                return visitor(node);
        }
    }
    function namedEvaluationVisitor(node, referencedName) {
        switch (node.kind) {
            case 359 /* SyntaxKind.PartiallyEmittedExpression */:
                return visitPartiallyEmittedExpression(node, /*discarded*/ false, referencedName);
            case 216 /* SyntaxKind.ParenthesizedExpression */:
                return visitParenthesizedExpression(node, /*discarded*/ false, referencedName);
            case 230 /* SyntaxKind.ClassExpression */:
                return visitClassExpression(node, referencedName);
            default:
                return visitor(node);
        }
    }
    function discardedValueVisitor(node) {
        switch (node.kind) {
            case 223 /* SyntaxKind.PrefixUnaryExpression */:
            case 224 /* SyntaxKind.PostfixUnaryExpression */:
                return visitPreOrPostfixUnaryExpression(node, /*discarded*/ true);
            case 225 /* SyntaxKind.BinaryExpression */:
                return visitBinaryExpression(node, /*discarded*/ true);
            case 360 /* SyntaxKind.CommaListExpression */:
                return visitCommaListExpression(node, /*discarded*/ true);
            case 216 /* SyntaxKind.ParenthesizedExpression */:
                return visitParenthesizedExpression(node, /*discarded*/ true, /*referencedName*/ undefined);
            default:
                return visitor(node);
        }
    }
    function getHelperVariableName(node) {
        var declarationName = node.name && (0, ts_1.isIdentifier)(node.name) && !(0, ts_1.isGeneratedIdentifier)(node.name) ? (0, ts_1.idText)(node.name) :
            node.name && (0, ts_1.isPrivateIdentifier)(node.name) && !(0, ts_1.isGeneratedIdentifier)(node.name) ? (0, ts_1.idText)(node.name).slice(1) :
                node.name && (0, ts_1.isStringLiteral)(node.name) && (0, ts_1.isIdentifierText)(node.name.text, 99 /* ScriptTarget.ESNext */) ? node.name.text :
                    (0, ts_1.isClassLike)(node) ? "class" : "member";
        if ((0, ts_1.isGetAccessor)(node))
            declarationName = "get_".concat(declarationName);
        if ((0, ts_1.isSetAccessor)(node))
            declarationName = "set_".concat(declarationName);
        if (node.name && (0, ts_1.isPrivateIdentifier)(node.name))
            declarationName = "private_".concat(declarationName);
        if ((0, ts_1.isStatic)(node))
            declarationName = "static_".concat(declarationName);
        return "_" + declarationName;
    }
    function createHelperVariable(node, suffix) {
        return factory.createUniqueName("".concat(getHelperVariableName(node), "_").concat(suffix), 16 /* GeneratedIdentifierFlags.Optimistic */ | 8 /* GeneratedIdentifierFlags.ReservedInNestedScopes */);
    }
    function createLet(name, initializer) {
        return factory.createVariableStatement(
        /*modifiers*/ undefined, factory.createVariableDeclarationList([
            factory.createVariableDeclaration(name, 
            /*exclamationToken*/ undefined, 
            /*type*/ undefined, initializer),
        ], 1 /* NodeFlags.Let */));
    }
    function createClassInfo(node) {
        var instanceExtraInitializersName;
        var staticExtraInitializersName;
        var hasStaticInitializers = false;
        var hasNonAmbientInstanceFields = false;
        var hasStaticPrivateClassElements = false;
        // Before visiting we perform a first pass to collect information we'll need
        // as we descend.
        for (var _i = 0, _a = node.members; _i < _a.length; _i++) {
            var member = _a[_i];
            if ((0, ts_1.isNamedClassElement)(member) && (0, ts_1.nodeOrChildIsDecorated)(/*useLegacyDecorators*/ false, member, node)) {
                if ((0, ts_1.hasStaticModifier)(member)) {
                    staticExtraInitializersName !== null && staticExtraInitializersName !== void 0 ? staticExtraInitializersName : (staticExtraInitializersName = factory.createUniqueName("_staticExtraInitializers", 16 /* GeneratedIdentifierFlags.Optimistic */));
                }
                else {
                    instanceExtraInitializersName !== null && instanceExtraInitializersName !== void 0 ? instanceExtraInitializersName : (instanceExtraInitializersName = factory.createUniqueName("_instanceExtraInitializers", 16 /* GeneratedIdentifierFlags.Optimistic */));
                }
            }
            if ((0, ts_1.isClassStaticBlockDeclaration)(member)) {
                hasStaticInitializers = true;
            }
            else if ((0, ts_1.isPropertyDeclaration)(member)) {
                if ((0, ts_1.hasStaticModifier)(member)) {
                    hasStaticInitializers || (hasStaticInitializers = !!member.initializer || (0, ts_1.hasDecorators)(member));
                }
                else {
                    hasNonAmbientInstanceFields || (hasNonAmbientInstanceFields = !(0, ts_1.isAmbientPropertyDeclaration)(member));
                }
            }
            if (((0, ts_1.isPrivateIdentifierClassElementDeclaration)(member) || (0, ts_1.isAutoAccessorPropertyDeclaration)(member)) && (0, ts_1.hasStaticModifier)(member)) {
                hasStaticPrivateClassElements = true;
            }
            // exit early if possible
            if (staticExtraInitializersName &&
                instanceExtraInitializersName &&
                hasStaticInitializers &&
                hasNonAmbientInstanceFields &&
                hasStaticPrivateClassElements) {
                break;
            }
        }
        return {
            class: node,
            instanceExtraInitializersName: instanceExtraInitializersName,
            staticExtraInitializersName: staticExtraInitializersName,
            hasStaticInitializers: hasStaticInitializers,
            hasNonAmbientInstanceFields: hasNonAmbientInstanceFields,
            hasStaticPrivateClassElements: hasStaticPrivateClassElements,
        };
    }
    function containsLexicalSuperInStaticInitializer(node) {
        for (var _i = 0, _a = node.members; _i < _a.length; _i++) {
            var member = _a[_i];
            if ((0, ts_1.isClassStaticBlockDeclaration)(member) ||
                (0, ts_1.isPropertyDeclaration)(member) && (0, ts_1.hasStaticModifier)(member)) {
                if (member.transformFlags & 134217728 /* TransformFlags.ContainsLexicalSuper */) {
                    return true;
                }
            }
        }
        return false;
    }
    function transformClassLike(node, className) {
        var _a, _b, _c, _d;
        startLexicalEnvironment();
        var classReference = factory.getLocalName(node, /*allowComments*/ false, /*allowSourceMaps*/ false, /*ignoreAssignedName*/ true);
        var classInfo = createClassInfo(node);
        var classDefinitionStatements = [];
        var leadingBlockStatements;
        var trailingBlockStatements;
        var syntheticConstructor;
        var heritageClauses;
        var shouldTransformPrivateStaticElementsInClass = false;
        // 1. Class decorators are evaluated outside of the private name scope of the class.
        var classDecorators = transformAllDecoratorsOfDeclaration((0, ts_1.getAllDecoratorsOfClass)(node));
        if (classDecorators) {
            // - Since class decorators don't have privileged access to private names defined inside the class,
            //   they must be evaluated outside of the class body.
            // - Since a class decorator can replace the class constructor, we must define a variable to keep track
            //   of the mutated class.
            // - Since a class decorator can add extra initializers, we must define a variable to keep track of
            //   extra initializers.
            classInfo.classDecoratorsName = factory.createUniqueName("_classDecorators", 16 /* GeneratedIdentifierFlags.Optimistic */);
            classInfo.classDescriptorName = factory.createUniqueName("_classDescriptor", 16 /* GeneratedIdentifierFlags.Optimistic */);
            classInfo.classExtraInitializersName = factory.createUniqueName("_classExtraInitializers", 16 /* GeneratedIdentifierFlags.Optimistic */);
            classInfo.classThis = factory.createUniqueName("_classThis", 16 /* GeneratedIdentifierFlags.Optimistic */);
            classDefinitionStatements.push(createLet(classInfo.classDecoratorsName, factory.createArrayLiteralExpression(classDecorators)), createLet(classInfo.classDescriptorName), createLet(classInfo.classExtraInitializersName, factory.createArrayLiteralExpression()), createLet(classInfo.classThis));
            if (classInfo.hasStaticPrivateClassElements) {
                shouldTransformPrivateStaticElementsInClass = true;
                shouldTransformPrivateStaticElementsInFile = true;
            }
        }
        // Rewrite `super` in static initializers so that we can use the correct `this`.
        if (classDecorators && containsLexicalSuperInStaticInitializer(node)) {
            var extendsClause = (0, ts_1.getHeritageClause)(node.heritageClauses, 96 /* SyntaxKind.ExtendsKeyword */);
            var extendsElement = extendsClause && (0, ts_1.firstOrUndefined)(extendsClause.types);
            var extendsExpression = extendsElement && (0, ts_1.visitNode)(extendsElement.expression, visitor, ts_1.isExpression);
            if (extendsExpression) {
                classInfo.classSuper = factory.createUniqueName("_classSuper", 16 /* GeneratedIdentifierFlags.Optimistic */);
                // Ensure we do not give the class or function an assigned name due to the variable by prefixing it
                // with `0, `.
                var unwrapped = (0, ts_1.skipOuterExpressions)(extendsExpression);
                var safeExtendsExpression = (0, ts_1.isClassExpression)(unwrapped) && !unwrapped.name ||
                    (0, ts_1.isFunctionExpression)(unwrapped) && !unwrapped.name ||
                    (0, ts_1.isArrowFunction)(unwrapped) ?
                    factory.createComma(factory.createNumericLiteral(0), extendsExpression) :
                    extendsExpression;
                classDefinitionStatements.push(createLet(classInfo.classSuper, safeExtendsExpression));
                var updatedExtendsElement = factory.updateExpressionWithTypeArguments(extendsElement, classInfo.classSuper, /*typeArguments*/ undefined);
                var updatedExtendsClause = factory.updateHeritageClause(extendsClause, [updatedExtendsElement]);
                heritageClauses = factory.createNodeArray([updatedExtendsClause]);
            }
        }
        else {
            // 2. ClassHeritage clause is evaluated outside of the private name scope of the class.
            heritageClauses = (0, ts_1.visitNodes)(node.heritageClauses, visitor, ts_1.isHeritageClause);
        }
        var renamedClassThis = (_a = classInfo.classThis) !== null && _a !== void 0 ? _a : factory.createThis();
        // 3. The name of the class is assigned.
        //
        // If the class did not have a name, set the assigned name as if from NamedEvaluation.
        // We don't need to use the assigned name if it consists of the empty string and the transformed class
        // expression won't get its name from any other source (such as the variable we create to handle
        // class decorators)
        var needsSetNameHelper = !((_b = (0, ts_1.getOriginalNode)(node, ts_1.isClassLike)) === null || _b === void 0 ? void 0 : _b.name) && (classDecorators || !(0, ts_1.isStringLiteral)(className) || !(0, ts_1.isEmptyStringLiteral)(className));
        if (needsSetNameHelper) {
            var setNameExpr = emitHelpers().createSetFunctionNameHelper(factory.createThis(), className);
            leadingBlockStatements = (0, ts_1.append)(leadingBlockStatements, factory.createExpressionStatement(setNameExpr));
        }
        // 4. For each member:
        //    a. Member Decorators are evaluated
        //    b. Computed Property Name is evaluated, if present
        // We visit members in two passes:
        // - The first pass visits methods, accessors, and fields to collect decorators and computed property names.
        // - The second pass visits the constructor to add instance initializers.
        //
        // NOTE: If there are no constructors, but there are instance initializers, a synthetic constructor is added.
        enterClass(classInfo);
        var members = (0, ts_1.visitNodes)(node.members, classElementVisitor, ts_1.isClassElement);
        if (pendingExpressions) {
            var outerThis_1;
            for (var _i = 0, pendingExpressions_1 = pendingExpressions; _i < pendingExpressions_1.length; _i++) {
                var expression = pendingExpressions_1[_i];
                // If a pending expression contains a lexical `this`, we'll need to capture the lexical `this` of the
                // container and transform it in the expression. This ensures we use the correct `this` in the resulting
                // class `static` block. We don't use substitution here because the size of the tree we are visiting
                // is likely to be small and doesn't justify the complexity of introducing substitution.
                expression = (0, ts_1.visitNode)(expression, function thisVisitor(node) {
                    if (!(node.transformFlags & 16384 /* TransformFlags.ContainsLexicalThis */)) {
                        return node;
                    }
                    switch (node.kind) {
                        case 110 /* SyntaxKind.ThisKeyword */:
                            if (!outerThis_1) {
                                outerThis_1 = factory.createUniqueName("_outerThis", 16 /* GeneratedIdentifierFlags.Optimistic */);
                                classDefinitionStatements.unshift(createLet(outerThis_1, factory.createThis()));
                            }
                            return outerThis_1;
                        default:
                            return (0, ts_1.visitEachChild)(node, thisVisitor, context);
                    }
                }, ts_1.isExpression);
                var statement = factory.createExpressionStatement(expression);
                leadingBlockStatements = (0, ts_1.append)(leadingBlockStatements, statement);
            }
            pendingExpressions = undefined;
        }
        exitClass();
        if (classInfo.instanceExtraInitializersName && !(0, ts_1.getFirstConstructorWithBody)(node)) {
            var initializerStatements = prepareConstructor(node, classInfo);
            if (initializerStatements) {
                var extendsClauseElement = (0, ts_1.getEffectiveBaseTypeNode)(node);
                var isDerivedClass = !!(extendsClauseElement && (0, ts_1.skipOuterExpressions)(extendsClauseElement.expression).kind !== 106 /* SyntaxKind.NullKeyword */);
                var constructorStatements = [];
                if (isDerivedClass) {
                    var spreadArguments = factory.createSpreadElement(factory.createIdentifier("arguments"));
                    var superCall = factory.createCallExpression(factory.createSuper(), /*typeArguments*/ undefined, [spreadArguments]);
                    constructorStatements.push(factory.createExpressionStatement(superCall));
                }
                (0, ts_1.addRange)(constructorStatements, initializerStatements);
                var constructorBody = factory.createBlock(constructorStatements, /*multiLine*/ true);
                syntheticConstructor = factory.createConstructorDeclaration(/*modifiers*/ undefined, [], constructorBody);
            }
        }
        // Used in steps 5, 7, and 11
        if (classInfo.staticExtraInitializersName) {
            classDefinitionStatements.push(createLet(classInfo.staticExtraInitializersName, factory.createArrayLiteralExpression()));
        }
        // Used in steps 6, 8, and during construction
        if (classInfo.instanceExtraInitializersName) {
            classDefinitionStatements.push(createLet(classInfo.instanceExtraInitializersName, factory.createArrayLiteralExpression()));
        }
        // Used in steps 7, 8, 12, and construction
        if (classInfo.memberInfos) {
            (0, ts_1.forEachEntry)(classInfo.memberInfos, function (memberInfo, member) {
                if ((0, ts_1.isStatic)(member)) {
                    classDefinitionStatements.push(createLet(memberInfo.memberDecoratorsName));
                    if (memberInfo.memberInitializersName) {
                        classDefinitionStatements.push(createLet(memberInfo.memberInitializersName, factory.createArrayLiteralExpression()));
                    }
                    if (memberInfo.memberDescriptorName) {
                        classDefinitionStatements.push(createLet(memberInfo.memberDescriptorName));
                    }
                }
            });
        }
        // Used in steps 7, 8, 12, and construction
        if (classInfo.memberInfos) {
            (0, ts_1.forEachEntry)(classInfo.memberInfos, function (memberInfo, member) {
                if (!(0, ts_1.isStatic)(member)) {
                    classDefinitionStatements.push(createLet(memberInfo.memberDecoratorsName));
                    if (memberInfo.memberInitializersName) {
                        classDefinitionStatements.push(createLet(memberInfo.memberInitializersName, factory.createArrayLiteralExpression()));
                    }
                    if (memberInfo.memberDescriptorName) {
                        classDefinitionStatements.push(createLet(memberInfo.memberDescriptorName));
                    }
                }
            });
        }
        // 5. Static non-field element decorators are applied
        leadingBlockStatements = (0, ts_1.addRange)(leadingBlockStatements, classInfo.staticNonFieldDecorationStatements);
        // 6. Non-static non-field element decorators are applied
        leadingBlockStatements = (0, ts_1.addRange)(leadingBlockStatements, classInfo.nonStaticNonFieldDecorationStatements);
        // 7. Static field element decorators are applied
        leadingBlockStatements = (0, ts_1.addRange)(leadingBlockStatements, classInfo.staticFieldDecorationStatements);
        // 8. Non-static field element decorators are applied
        leadingBlockStatements = (0, ts_1.addRange)(leadingBlockStatements, classInfo.nonStaticFieldDecorationStatements);
        // 9. Class decorators are applied
        // 10. Class binding is initialized
        if (classInfo.classDescriptorName && classInfo.classDecoratorsName && classInfo.classExtraInitializersName && classInfo.classThis) {
            leadingBlockStatements !== null && leadingBlockStatements !== void 0 ? leadingBlockStatements : (leadingBlockStatements = []);
            //  __esDecorate(null, _classDescriptor = { value: this }, _classDecorators, { kind: "class", name: this.name }, _classExtraInitializers);
            var valueProperty = factory.createPropertyAssignment("value", factory.createThis());
            var classDescriptor = factory.createObjectLiteralExpression([valueProperty]);
            var classDescriptorAssignment = factory.createAssignment(classInfo.classDescriptorName, classDescriptor);
            var classNameReference = factory.createPropertyAccessExpression(factory.createThis(), "name");
            var esDecorateHelper = emitHelpers().createESDecorateHelper(factory.createNull(), classDescriptorAssignment, classInfo.classDecoratorsName, { kind: "class", name: classNameReference }, factory.createNull(), classInfo.classExtraInitializersName);
            var esDecorateStatement = factory.createExpressionStatement(esDecorateHelper);
            (0, ts_1.setSourceMapRange)(esDecorateStatement, (0, ts_1.moveRangePastDecorators)(node));
            leadingBlockStatements.push(esDecorateStatement);
            //  C = _classThis = _classDescriptor.value;
            var classDescriptorValueReference = factory.createPropertyAccessExpression(classInfo.classDescriptorName, "value");
            var classThisAssignment = factory.createAssignment(classInfo.classThis, classDescriptorValueReference);
            var classReferenceAssignment = factory.createAssignment(classReference, classThisAssignment);
            leadingBlockStatements.push(factory.createExpressionStatement(classReferenceAssignment));
        }
        // 11. Static extra initializers are evaluated
        if (classInfo.staticExtraInitializersName) {
            var runStaticInitializersHelper = emitHelpers().createRunInitializersHelper(renamedClassThis, classInfo.staticExtraInitializersName);
            var runStaticInitializersStatement = factory.createExpressionStatement(runStaticInitializersHelper);
            (0, ts_1.setSourceMapRange)(runStaticInitializersStatement, (_c = node.name) !== null && _c !== void 0 ? _c : (0, ts_1.moveRangePastDecorators)(node));
            leadingBlockStatements = (0, ts_1.append)(leadingBlockStatements, runStaticInitializersStatement);
        }
        // 12. Static fields are initialized and static blocks are evaluated
        // 13. Class extra initializers are evaluated
        if (classInfo.classExtraInitializersName) {
            var runClassInitializersHelper = emitHelpers().createRunInitializersHelper(renamedClassThis, classInfo.classExtraInitializersName);
            var runClassInitializersStatement = factory.createExpressionStatement(runClassInitializersHelper);
            (0, ts_1.setSourceMapRange)(runClassInitializersStatement, (_d = node.name) !== null && _d !== void 0 ? _d : (0, ts_1.moveRangePastDecorators)(node));
            trailingBlockStatements = (0, ts_1.append)(trailingBlockStatements, runClassInitializersStatement);
        }
        // If there are no other static initializers to run, combine the leading and trailing block statements
        if (leadingBlockStatements && trailingBlockStatements && !classInfo.hasStaticInitializers) {
            (0, ts_1.addRange)(leadingBlockStatements, trailingBlockStatements);
            trailingBlockStatements = undefined;
        }
        var newMembers = members;
        // insert a leading `static {}` block, if necessary
        if (leadingBlockStatements) {
            //  class C {
            //      static { ... }
            //      ...
            //  }
            var leadingStaticBlockBody = factory.createBlock(leadingBlockStatements, /*multiLine*/ true);
            var leadingStaticBlock = factory.createClassStaticBlockDeclaration(leadingStaticBlockBody);
            if (shouldTransformPrivateStaticElementsInClass) {
                // We use `InternalEmitFlags.TransformPrivateStaticElements` as a marker on a class static block
                // to inform the classFields transform that it shouldn't rename `this` to `_classThis` in the
                // transformed class static block.
                (0, ts_1.setInternalEmitFlags)(leadingStaticBlock, 32 /* InternalEmitFlags.TransformPrivateStaticElements */);
            }
            newMembers = __spreadArray([leadingStaticBlock], newMembers, true);
        }
        // append the synthetic constructor, if necessary
        if (syntheticConstructor) {
            newMembers = __spreadArray(__spreadArray([], newMembers, true), [syntheticConstructor], false);
        }
        // append a trailing `static {}` block, if necessary
        if (trailingBlockStatements) {
            //  class C {
            //      ...
            //      static { ... }
            //  }
            var trailingStaticBlockBody = factory.createBlock(trailingBlockStatements, /*multiLine*/ true);
            var trailingStaticBlock = factory.createClassStaticBlockDeclaration(trailingStaticBlockBody);
            newMembers = __spreadArray(__spreadArray([], newMembers, true), [trailingStaticBlock], false);
        }
        // Update members with newly added members.
        if (newMembers !== members) {
            members = (0, ts_1.setTextRange)(factory.createNodeArray(newMembers), members);
        }
        var lexicalEnvironment = endLexicalEnvironment();
        var classExpression;
        if (classDecorators) {
            // We use `var` instead of `let` so we can leverage NamedEvaluation to define the class name
            // and still be able to ensure it is initialized prior to any use in `static {}`.
            //  (() => {
            //      let _classDecorators = [...];
            //      let _classDescriptor;
            //      let _classExtraInitializers = [];
            //      let _classThis;
            //      ...
            //      var C = class {
            //          static {
            //              __esDecorate(null, _classDescriptor = { value: this }, _classDecorators, ...);
            //              // `C` is initialized here
            //              C = _classThis = _classDescriptor.value;
            //          }
            //          static x = 1;
            //          static y = C.x; // `C` will already be defined here.
            //          static { ... }
            //      };
            //      return C;
            //  })();
            classExpression = factory.createClassExpression(/*modifiers*/ undefined, /*name*/ undefined, /*typeParameters*/ undefined, heritageClauses, members);
            var classReferenceDeclaration = factory.createVariableDeclaration(classReference, /*exclamationToken*/ undefined, /*type*/ undefined, classExpression);
            var classReferenceVarDeclList = factory.createVariableDeclarationList([classReferenceDeclaration]);
            var returnExpr = classInfo.classThis ? factory.createAssignment(classReference, classInfo.classThis) : classReference;
            classDefinitionStatements.push(factory.createVariableStatement(/*modifiers*/ undefined, classReferenceVarDeclList), factory.createReturnStatement(returnExpr));
        }
        else {
            //  return <classExpression>;
            classExpression = factory.createClassExpression(/*modifiers*/ undefined, node.name, /*typeParameters*/ undefined, heritageClauses, members);
            classDefinitionStatements.push(factory.createReturnStatement(classExpression));
        }
        if (shouldTransformPrivateStaticElementsInClass) {
            (0, ts_1.addInternalEmitFlags)(classExpression, 32 /* InternalEmitFlags.TransformPrivateStaticElements */);
            for (var _e = 0, _f = classExpression.members; _e < _f.length; _e++) {
                var member = _f[_e];
                if (((0, ts_1.isPrivateIdentifierClassElementDeclaration)(member) || (0, ts_1.isAutoAccessorPropertyDeclaration)(member)) && (0, ts_1.hasStaticModifier)(member)) {
                    (0, ts_1.addInternalEmitFlags)(member, 32 /* InternalEmitFlags.TransformPrivateStaticElements */);
                }
            }
        }
        (0, ts_1.setOriginalNode)(classExpression, node);
        (0, ts_1.getOrCreateEmitNode)(classExpression).classThis = classInfo.classThis;
        return factory.createImmediatelyInvokedArrowFunction(factory.mergeLexicalEnvironment(classDefinitionStatements, lexicalEnvironment));
    }
    function isDecoratedClassLike(node) {
        return (0, ts_1.classOrConstructorParameterIsDecorated)(/*useLegacyDecorators*/ false, node) ||
            (0, ts_1.childIsDecorated)(/*useLegacyDecorators*/ false, node);
    }
    function visitClassDeclaration(node) {
        var _a;
        if (isDecoratedClassLike(node)) {
            if ((0, ts_1.hasSyntacticModifier)(node, 1 /* ModifierFlags.Export */) &&
                (0, ts_1.hasSyntacticModifier)(node, 1024 /* ModifierFlags.Default */)) {
                //  export default (() => { ... })();
                var originalClass = (_a = (0, ts_1.getOriginalNode)(node, ts_1.isClassLike)) !== null && _a !== void 0 ? _a : node;
                var className = originalClass.name ? factory.createStringLiteralFromNode(originalClass.name) : factory.createStringLiteral("default");
                var iife = transformClassLike(node, className);
                var statement = factory.createExportDefault(iife);
                (0, ts_1.setOriginalNode)(statement, node);
                (0, ts_1.setCommentRange)(statement, (0, ts_1.getCommentRange)(node));
                (0, ts_1.setSourceMapRange)(statement, (0, ts_1.moveRangePastDecorators)(node));
                return statement;
            }
            else {
                //  let C = (() => { ... })();
                ts_1.Debug.assertIsDefined(node.name, "A class declaration that is not a default export must have a name.");
                var iife = transformClassLike(node, factory.createStringLiteralFromNode(node.name));
                var modifiers = (0, ts_1.visitNodes)(node.modifiers, modifierVisitor, ts_1.isModifier);
                // When we transform to ES5/3 this will be moved inside an IIFE and should reference the name
                // without any block-scoped variable collision handling
                var declName = languageVersion <= 2 /* ScriptTarget.ES2015 */ ?
                    factory.getInternalName(node, /*allowComments*/ false, /*allowSourceMaps*/ true) :
                    factory.getLocalName(node, /*allowComments*/ false, /*allowSourceMaps*/ true);
                var varDecl = factory.createVariableDeclaration(declName, /*exclamationToken*/ undefined, /*type*/ undefined, iife);
                (0, ts_1.setOriginalNode)(varDecl, node);
                var varDecls = factory.createVariableDeclarationList([varDecl], 1 /* NodeFlags.Let */);
                var statement = factory.createVariableStatement(modifiers, varDecls);
                (0, ts_1.setOriginalNode)(statement, node);
                (0, ts_1.setCommentRange)(statement, (0, ts_1.getCommentRange)(node));
                return statement;
            }
        }
        else {
            var modifiers = (0, ts_1.visitNodes)(node.modifiers, modifierVisitor, ts_1.isModifier);
            var heritageClauses = (0, ts_1.visitNodes)(node.heritageClauses, visitor, ts_1.isHeritageClause);
            enterClass(/*classInfo*/ undefined);
            var members = (0, ts_1.visitNodes)(node.members, classElementVisitor, ts_1.isClassElement);
            exitClass();
            return factory.updateClassDeclaration(node, modifiers, node.name, /*typeParameters*/ undefined, heritageClauses, members);
        }
    }
    function visitClassExpression(node, referencedName) {
        if (isDecoratedClassLike(node)) {
            var className = node.name ? factory.createStringLiteralFromNode(node.name) : referencedName !== null && referencedName !== void 0 ? referencedName : factory.createStringLiteral("");
            var iife = transformClassLike(node, className);
            (0, ts_1.setOriginalNode)(iife, node);
            return iife;
        }
        else {
            var modifiers = (0, ts_1.visitNodes)(node.modifiers, modifierVisitor, ts_1.isModifier);
            var heritageClauses = (0, ts_1.visitNodes)(node.heritageClauses, visitor, ts_1.isHeritageClause);
            enterClass(/*classInfo*/ undefined);
            var members = (0, ts_1.visitNodes)(node.members, classElementVisitor, ts_1.isClassElement);
            exitClass();
            return factory.updateClassExpression(node, modifiers, node.name, /*typeParameters*/ undefined, heritageClauses, members);
        }
    }
    function prepareConstructor(_parent, classInfo) {
        // Decorated instance members can add "extra" initializers to the instance. If a class contains any instance
        // fields, we'll inject the `__runInitializers()` call for these extra initializers into the initializer of
        // the first class member that will be initialized. However, if the class does not contain any fields that
        // we can piggyback on, we need to synthesize a `__runInitializers()` call in the constructor instead.
        if (classInfo.instanceExtraInitializersName && !classInfo.hasNonAmbientInstanceFields) {
            // If there are instance extra initializers we need to add them to the body along with any
            // field initializers
            var statements = [];
            statements.push(factory.createExpressionStatement(emitHelpers().createRunInitializersHelper(factory.createThis(), classInfo.instanceExtraInitializersName)));
            return statements;
        }
    }
    function visitConstructorDeclaration(node) {
        enterClassElement(node);
        var modifiers = (0, ts_1.visitNodes)(node.modifiers, modifierVisitor, ts_1.isModifier);
        var parameters = (0, ts_1.visitNodes)(node.parameters, visitor, ts_1.isParameter);
        var body;
        if (node.body && classInfo) {
            // If there are instance extra initializers we need to add them to the body along with any
            // field initializers
            var initializerStatements = prepareConstructor(classInfo.class, classInfo);
            if (initializerStatements) {
                var statements = [];
                var nonPrologueStart = factory.copyPrologue(node.body.statements, statements, /*ensureUseStrict*/ false, visitor);
                var superStatementIndex = (0, ts_1.findSuperStatementIndex)(node.body.statements, nonPrologueStart);
                if (superStatementIndex >= 0) {
                    (0, ts_1.addRange)(statements, (0, ts_1.visitNodes)(node.body.statements, visitor, ts_1.isStatement, nonPrologueStart, superStatementIndex + 1 - nonPrologueStart));
                    (0, ts_1.addRange)(statements, initializerStatements);
                    (0, ts_1.addRange)(statements, (0, ts_1.visitNodes)(node.body.statements, visitor, ts_1.isStatement, superStatementIndex + 1));
                }
                else {
                    (0, ts_1.addRange)(statements, initializerStatements);
                    (0, ts_1.addRange)(statements, (0, ts_1.visitNodes)(node.body.statements, visitor, ts_1.isStatement));
                }
                body = factory.createBlock(statements, /*multiLine*/ true);
                (0, ts_1.setOriginalNode)(body, node.body);
                (0, ts_1.setTextRange)(body, node.body);
            }
        }
        body !== null && body !== void 0 ? body : (body = (0, ts_1.visitNode)(node.body, visitor, ts_1.isBlock));
        exitClassElement();
        return factory.updateConstructorDeclaration(node, modifiers, parameters, body);
    }
    function finishClassElement(updated, original) {
        if (updated !== original) {
            // While we emit the source map for the node after skipping decorators and modifiers,
            // we need to emit the comments for the original range.
            (0, ts_1.setCommentRange)(updated, original);
            (0, ts_1.setSourceMapRange)(updated, (0, ts_1.moveRangePastDecorators)(original));
        }
        return updated;
    }
    function partialTransformClassElement(member, useNamedEvaluation, classInfo, createDescriptor) {
        var _a, _b, _c;
        var _d, _e, _f, _g, _h, _j, _k, _l;
        var referencedName;
        var name;
        var initializersName;
        var thisArg;
        var descriptorName;
        if (!classInfo) {
            var modifiers_1 = (0, ts_1.visitNodes)(member.modifiers, modifierVisitor, ts_1.isModifier);
            enterName();
            if (useNamedEvaluation) {
                (_a = visitReferencedPropertyName(member.name), referencedName = _a.referencedName, name = _a.name);
            }
            else {
                name = visitPropertyName(member.name);
            }
            exitName();
            return { modifiers: modifiers_1, referencedName: referencedName, name: name, initializersName: initializersName, descriptorName: descriptorName, thisArg: thisArg };
        }
        // Member decorators require privileged access to private names. However, computed property
        // evaluation occurs interspersed with decorator evaluation. This means that if we encounter
        // a computed property name we must inline decorator evaluation.
        var memberDecorators = transformAllDecoratorsOfDeclaration((0, ts_1.getAllDecoratorsOfClassElement)(member, classInfo.class, /*useLegacyDecorators*/ false));
        var modifiers = (0, ts_1.visitNodes)(member.modifiers, modifierVisitor, ts_1.isModifier);
        if (memberDecorators) {
            var memberDecoratorsName = createHelperVariable(member, "decorators");
            var memberDecoratorsArray = factory.createArrayLiteralExpression(memberDecorators);
            var memberDecoratorsAssignment = factory.createAssignment(memberDecoratorsName, memberDecoratorsArray);
            var memberInfo = { memberDecoratorsName: memberDecoratorsName };
            (_d = classInfo.memberInfos) !== null && _d !== void 0 ? _d : (classInfo.memberInfos = new Map());
            classInfo.memberInfos.set(member, memberInfo);
            pendingExpressions !== null && pendingExpressions !== void 0 ? pendingExpressions : (pendingExpressions = []);
            pendingExpressions.push(memberDecoratorsAssignment);
            // 5. Static non-field (method/getter/setter/auto-accessor) element decorators are applied
            // 6. Non-static non-field (method/getter/setter/auto-accessor) element decorators are applied
            // 7. Static field (excl. auto-accessor) element decorators are applied
            // 8. Non-static field (excl. auto-accessor) element decorators are applied
            var statements = (0, ts_1.isMethodOrAccessor)(member) || (0, ts_1.isAutoAccessorPropertyDeclaration)(member) ?
                (0, ts_1.isStatic)(member) ? (_e = classInfo.staticNonFieldDecorationStatements) !== null && _e !== void 0 ? _e : (classInfo.staticNonFieldDecorationStatements = []) : (_f = classInfo.nonStaticNonFieldDecorationStatements) !== null && _f !== void 0 ? _f : (classInfo.nonStaticNonFieldDecorationStatements = []) :
                (0, ts_1.isPropertyDeclaration)(member) && !(0, ts_1.isAutoAccessorPropertyDeclaration)(member) ?
                    (0, ts_1.isStatic)(member) ? (_g = classInfo.staticFieldDecorationStatements) !== null && _g !== void 0 ? _g : (classInfo.staticFieldDecorationStatements = []) : (_h = classInfo.nonStaticFieldDecorationStatements) !== null && _h !== void 0 ? _h : (classInfo.nonStaticFieldDecorationStatements = []) :
                    ts_1.Debug.fail();
            var kind = (0, ts_1.isGetAccessorDeclaration)(member) ? "getter" :
                (0, ts_1.isSetAccessorDeclaration)(member) ? "setter" :
                    (0, ts_1.isMethodDeclaration)(member) ? "method" :
                        (0, ts_1.isAutoAccessorPropertyDeclaration)(member) ? "accessor" :
                            (0, ts_1.isPropertyDeclaration)(member) ? "field" :
                                ts_1.Debug.fail();
            var propertyName = void 0;
            if ((0, ts_1.isIdentifier)(member.name) || (0, ts_1.isPrivateIdentifier)(member.name)) {
                propertyName = { computed: false, name: member.name };
            }
            else if ((0, ts_1.isPropertyNameLiteral)(member.name)) {
                propertyName = { computed: true, name: factory.createStringLiteralFromNode(member.name) };
            }
            else {
                var expression = member.name.expression;
                if ((0, ts_1.isPropertyNameLiteral)(expression) && !(0, ts_1.isIdentifier)(expression)) {
                    propertyName = { computed: true, name: factory.createStringLiteralFromNode(expression) };
                }
                else {
                    enterName();
                    (_b = visitReferencedPropertyName(member.name), referencedName = _b.referencedName, name = _b.name);
                    propertyName = { computed: true, name: referencedName };
                    exitName();
                }
            }
            var context_1 = {
                kind: kind,
                name: propertyName,
                static: (0, ts_1.isStatic)(member),
                private: (0, ts_1.isPrivateIdentifier)(member.name),
                access: {
                    // 15.7.3 CreateDecoratorAccessObject (kind, name)
                    // 2. If _kind_ is ~field~, ~method~, ~accessor~, or ~getter~, then ...
                    get: (0, ts_1.isPropertyDeclaration)(member) || (0, ts_1.isGetAccessorDeclaration)(member) || (0, ts_1.isMethodDeclaration)(member),
                    // 3. If _kind_ is ~field~, ~accessor~, or ~setter~, then ...
                    set: (0, ts_1.isPropertyDeclaration)(member) || (0, ts_1.isSetAccessorDeclaration)(member)
                },
            };
            var extraInitializers = (0, ts_1.isStatic)(member) ? (_j = classInfo.staticExtraInitializersName) !== null && _j !== void 0 ? _j : (classInfo.staticExtraInitializersName = factory.createUniqueName("_staticExtraInitializers", 16 /* GeneratedIdentifierFlags.Optimistic */)) : (_k = classInfo.instanceExtraInitializersName) !== null && _k !== void 0 ? _k : (classInfo.instanceExtraInitializersName = factory.createUniqueName("_instanceExtraInitializers", 16 /* GeneratedIdentifierFlags.Optimistic */));
            if ((0, ts_1.isMethodOrAccessor)(member)) {
                // __esDecorate(this, null, _static_member_decorators, { kind: "method", name: "...", static: true, private: false, access: { ... } }, _staticExtraInitializers);
                // __esDecorate(this, null, _member_decorators, { kind: "method", name: "...", static: false, private: false, access: { ... } }, _instanceExtraInitializers);
                // __esDecorate(this, null, _static_member_decorators, { kind: "getter", name: "...", static: true, private: false, access: { ... } }, _staticExtraInitializers);
                // __esDecorate(this, null, _member_decorators, { kind: "getter", name: "...", static: false, private: false, access: { ... } }, _instanceExtraInitializers);
                // __esDecorate(this, null, _static_member_decorators, { kind: "setter", name: "...", static: true, private: false, access: { ... } }, _staticExtraInitializers);
                // __esDecorate(this, null, _member_decorators, { kind: "setter", name: "...", static: false, private: false, access: { ... } }, _instanceExtraInitializers);
                // __esDecorate(this, _static_member_descriptor = { value() { ... } }, _static_member_decorators, { kind: "method", name: "...", static: true, private: true, access: { ... } }, _staticExtraInitializers);
                // __esDecorate(this, _member_descriptor = { value() { ... } }, _member_decorators, { kind: "method", name: "...", static: false, private: true, access: { ... } }, _instanceExtraInitializers);
                // __esDecorate(this, _static_member_descriptor = { get() { ... } }, _static_member_decorators, { kind: "getter", name: "...", static: true, private: true, access: { ... } }, _staticExtraInitializers);
                // __esDecorate(this, _member_descriptor = { get() { ... } }, _member_decorators, { kind: "getter", name: "...", static: false, private: true, access: { ... } }, _instanceExtraInitializers);
                // __esDecorate(this, _static_member_descriptor = { set() { ... } }, _static_member_decorators, { kind: "setter", name: "...", static: true, private: true, access: { ... } }, _staticExtraInitializers);
                // __esDecorate(this, _member_descriptor = { set() { ... } }, _member_decorators, { kind: "setter", name: "...", static: false, private: true, access: { ... } }, _instanceExtraInitializers);
                var descriptor = void 0;
                if ((0, ts_1.isPrivateIdentifierClassElementDeclaration)(member) && createDescriptor) {
                    descriptor = createDescriptor(member, (0, ts_1.visitNodes)(modifiers, function (node) { return (0, ts_1.tryCast)(node, ts_1.isAsyncModifier); }, ts_1.isModifier));
                    memberInfo.memberDescriptorName = descriptorName = createHelperVariable(member, "descriptor");
                    descriptor = factory.createAssignment(descriptorName, descriptor);
                }
                var esDecorateExpression = emitHelpers().createESDecorateHelper(factory.createThis(), descriptor !== null && descriptor !== void 0 ? descriptor : factory.createNull(), memberDecoratorsName, context_1, factory.createNull(), extraInitializers);
                var esDecorateStatement = factory.createExpressionStatement(esDecorateExpression);
                (0, ts_1.setSourceMapRange)(esDecorateStatement, (0, ts_1.moveRangePastDecorators)(member));
                statements.push(esDecorateStatement);
            }
            else if ((0, ts_1.isPropertyDeclaration)(member)) {
                initializersName = (_l = memberInfo.memberInitializersName) !== null && _l !== void 0 ? _l : (memberInfo.memberInitializersName = createHelperVariable(member, "initializers"));
                if ((0, ts_1.isStatic)(member)) {
                    thisArg = classInfo.classThis;
                }
                var descriptor = void 0;
                if ((0, ts_1.isPrivateIdentifierClassElementDeclaration)(member) && (0, ts_1.hasAccessorModifier)(member) && createDescriptor) {
                    descriptor = createDescriptor(member, /*modifiers*/ undefined);
                    memberInfo.memberDescriptorName = descriptorName = createHelperVariable(member, "descriptor");
                    descriptor = factory.createAssignment(descriptorName, descriptor);
                }
                // _static_field_initializers = __esDecorate(null, null, _static_member_decorators, { kind: "field", name: "...", static: true, private: ..., access: { ... } }, _staticExtraInitializers);
                // _field_initializers = __esDecorate(null, null, _member_decorators, { kind: "field", name: "...", static: false, private: ..., access: { ... } }, _instanceExtraInitializers);
                var esDecorateExpression = emitHelpers().createESDecorateHelper((0, ts_1.isAutoAccessorPropertyDeclaration)(member) ?
                    factory.createThis() :
                    factory.createNull(), descriptor !== null && descriptor !== void 0 ? descriptor : factory.createNull(), memberDecoratorsName, context_1, initializersName, extraInitializers);
                var esDecorateStatement = factory.createExpressionStatement(esDecorateExpression);
                (0, ts_1.setSourceMapRange)(esDecorateStatement, (0, ts_1.moveRangePastDecorators)(member));
                statements.push(esDecorateStatement);
            }
        }
        if (name === undefined) {
            enterName();
            if (useNamedEvaluation) {
                (_c = visitReferencedPropertyName(member.name), referencedName = _c.referencedName, name = _c.name);
            }
            else {
                name = visitPropertyName(member.name);
            }
            exitName();
        }
        if (!(0, ts_1.some)(modifiers) && ((0, ts_1.isMethodDeclaration)(member) || (0, ts_1.isPropertyDeclaration)(member))) {
            // Don't emit leading comments on the name for methods and properties without modifiers, otherwise we
            // will end up printing duplicate comments.
            (0, ts_1.setEmitFlags)(name, 1024 /* EmitFlags.NoLeadingComments */);
        }
        return { modifiers: modifiers, referencedName: referencedName, name: name, initializersName: initializersName, descriptorName: descriptorName, thisArg: thisArg };
    }
    function visitMethodDeclaration(node) {
        enterClassElement(node);
        var _a = partialTransformClassElement(node, /*useNamedEvaluation*/ false, classInfo, createMethodDescriptorObject), modifiers = _a.modifiers, name = _a.name, descriptorName = _a.descriptorName;
        if (descriptorName) {
            exitClassElement();
            return finishClassElement(createMethodDescriptorForwarder(modifiers, name, descriptorName), node);
        }
        else {
            var parameters = (0, ts_1.visitNodes)(node.parameters, visitor, ts_1.isParameter);
            var body = (0, ts_1.visitNode)(node.body, visitor, ts_1.isBlock);
            exitClassElement();
            return finishClassElement(factory.updateMethodDeclaration(node, modifiers, node.asteriskToken, name, /*questionToken*/ undefined, /*typeParameters*/ undefined, parameters, /*type*/ undefined, body), node);
        }
    }
    function visitGetAccessorDeclaration(node) {
        enterClassElement(node);
        var _a = partialTransformClassElement(node, /*useNamedEvaluation*/ false, classInfo, createGetAccessorDescriptorObject), modifiers = _a.modifiers, name = _a.name, descriptorName = _a.descriptorName;
        if (descriptorName) {
            exitClassElement();
            return finishClassElement(createGetAccessorDescriptorForwarder(modifiers, name, descriptorName), node);
        }
        else {
            var parameters = (0, ts_1.visitNodes)(node.parameters, visitor, ts_1.isParameter);
            var body = (0, ts_1.visitNode)(node.body, visitor, ts_1.isBlock);
            exitClassElement();
            return finishClassElement(factory.updateGetAccessorDeclaration(node, modifiers, name, parameters, /*type*/ undefined, body), node);
        }
    }
    function visitSetAccessorDeclaration(node) {
        enterClassElement(node);
        var _a = partialTransformClassElement(node, /*useNamedEvaluation*/ false, classInfo, createSetAccessorDescriptorObject), modifiers = _a.modifiers, name = _a.name, descriptorName = _a.descriptorName;
        if (descriptorName) {
            exitClassElement();
            return finishClassElement(createSetAccessorDescriptorForwarder(modifiers, name, descriptorName), node);
        }
        else {
            var parameters = (0, ts_1.visitNodes)(node.parameters, visitor, ts_1.isParameter);
            var body = (0, ts_1.visitNode)(node.body, visitor, ts_1.isBlock);
            exitClassElement();
            return finishClassElement(factory.updateSetAccessorDeclaration(node, modifiers, name, parameters, body), node);
        }
    }
    function visitClassStaticBlockDeclaration(node) {
        enterClassElement(node);
        if (classInfo)
            classInfo.hasStaticInitializers = true;
        var result = (0, ts_1.visitEachChild)(node, visitor, context);
        exitClassElement();
        return result;
    }
    function visitPropertyDeclaration(node) {
        enterClassElement(node);
        // TODO(rbuckton): We support decorating `declare x` fields with legacyDecorators, but we currently don't
        //                 support them with esDecorators. We need to consider whether we will support them in the
        //                 future, and how. For now, these should be elided by the `ts` transform.
        ts_1.Debug.assert(!(0, ts_1.isAmbientPropertyDeclaration)(node), "Not yet implemented.");
        // 10.2.1.3 RS: EvaluateBody
        //   Initializer : `=` AssignmentExpression
        //     ...
        //     3. If IsAnonymousFunctionDefinition(|AssignmentExpression|) is *true*, then
        //        a. Let _value_ be ? NamedEvaluation of |Initializer| with argument _functionObject_.[[ClassFieldInitializerName]].
        //     ...
        var useNamedEvaluation = (0, ts_1.isNamedEvaluation)(node, isAnonymousClassNeedingAssignedName);
        var _a = partialTransformClassElement(node, useNamedEvaluation, classInfo, (0, ts_1.hasAccessorModifier)(node) ? createAccessorPropertyDescriptorObject : undefined), modifiers = _a.modifiers, name = _a.name, referencedName = _a.referencedName, initializersName = _a.initializersName, descriptorName = _a.descriptorName, thisArg = _a.thisArg;
        startLexicalEnvironment();
        var initializer = referencedName ?
            (0, ts_1.visitNode)(node.initializer, function (node) { return namedEvaluationVisitor(node, referencedName); }, ts_1.isExpression) :
            (0, ts_1.visitNode)(node.initializer, visitor, ts_1.isExpression);
        if (initializersName) {
            initializer = emitHelpers().createRunInitializersHelper(thisArg !== null && thisArg !== void 0 ? thisArg : factory.createThis(), initializersName, initializer !== null && initializer !== void 0 ? initializer : factory.createVoidZero());
        }
        if (!(0, ts_1.isStatic)(node) && (classInfo === null || classInfo === void 0 ? void 0 : classInfo.instanceExtraInitializersName) && !(classInfo === null || classInfo === void 0 ? void 0 : classInfo.hasInjectedInstanceInitializers)) {
            // for the first non-static field initializer, inject a call to `__runInitializers`.
            classInfo.hasInjectedInstanceInitializers = true;
            initializer !== null && initializer !== void 0 ? initializer : (initializer = factory.createVoidZero());
            initializer = factory.createParenthesizedExpression(factory.createComma(emitHelpers().createRunInitializersHelper(factory.createThis(), classInfo.instanceExtraInitializersName), initializer));
        }
        if ((0, ts_1.isStatic)(node) && classInfo && initializer) {
            classInfo.hasStaticInitializers = true;
        }
        var declarations = endLexicalEnvironment();
        if ((0, ts_1.some)(declarations)) {
            initializer = factory.createImmediatelyInvokedArrowFunction(__spreadArray(__spreadArray([], declarations, true), [
                factory.createReturnStatement(initializer)
            ], false));
        }
        exitClassElement();
        if ((0, ts_1.hasAccessorModifier)(node) && descriptorName) {
            // given:
            //  accessor #x = 1;
            //
            // emits:
            //  static {
            //      _esDecorate(null, _private_x_descriptor = { get() { return this.#x_1; }, set(value) { this.#x_1 = value; } }, ...)
            //  }
            //  ...
            //  #x_1 = 1;
            //  get #x() { return _private_x_descriptor.get.call(this); }
            //  set #x(value) { _private_x_descriptor.set.call(this, value); }
            var commentRange = (0, ts_1.getCommentRange)(node);
            var sourceMapRange = (0, ts_1.getSourceMapRange)(node);
            // Since we're creating two declarations where there was previously one, cache
            // the expression for any computed property names.
            var name_1 = node.name;
            var getterName = name_1;
            var setterName = name_1;
            if ((0, ts_1.isComputedPropertyName)(name_1) && !(0, ts_1.isSimpleInlineableExpression)(name_1.expression)) {
                var cacheAssignment = (0, ts_1.findComputedPropertyNameCacheAssignment)(name_1);
                if (cacheAssignment) {
                    getterName = factory.updateComputedPropertyName(name_1, (0, ts_1.visitNode)(name_1.expression, visitor, ts_1.isExpression));
                    setterName = factory.updateComputedPropertyName(name_1, cacheAssignment.left);
                }
                else {
                    var temp = factory.createTempVariable(hoistVariableDeclaration);
                    (0, ts_1.setSourceMapRange)(temp, name_1.expression);
                    var expression = (0, ts_1.visitNode)(name_1.expression, visitor, ts_1.isExpression);
                    var assignment = factory.createAssignment(temp, expression);
                    (0, ts_1.setSourceMapRange)(assignment, name_1.expression);
                    getterName = factory.updateComputedPropertyName(name_1, assignment);
                    setterName = factory.updateComputedPropertyName(name_1, temp);
                }
            }
            var modifiersWithoutAccessor = (0, ts_1.visitNodes)(modifiers, function (node) { return node.kind !== 129 /* SyntaxKind.AccessorKeyword */ ? node : undefined; }, ts_1.isModifier);
            var backingField = (0, ts_1.createAccessorPropertyBackingField)(factory, node, modifiersWithoutAccessor, initializer);
            (0, ts_1.setOriginalNode)(backingField, node);
            (0, ts_1.setEmitFlags)(backingField, 3072 /* EmitFlags.NoComments */);
            (0, ts_1.setSourceMapRange)(backingField, sourceMapRange);
            (0, ts_1.setSourceMapRange)(backingField.name, node.name);
            var getter = createGetAccessorDescriptorForwarder(modifiersWithoutAccessor, getterName, descriptorName);
            (0, ts_1.setOriginalNode)(getter, node);
            (0, ts_1.setCommentRange)(getter, commentRange);
            (0, ts_1.setSourceMapRange)(getter, sourceMapRange);
            var setter = createSetAccessorDescriptorForwarder(modifiersWithoutAccessor, setterName, descriptorName);
            (0, ts_1.setOriginalNode)(setter, node);
            (0, ts_1.setEmitFlags)(setter, 3072 /* EmitFlags.NoComments */);
            (0, ts_1.setSourceMapRange)(setter, sourceMapRange);
            return [backingField, getter, setter];
        }
        return finishClassElement(factory.updatePropertyDeclaration(node, modifiers, name, /*questionOrExclamationToken*/ undefined, /*type*/ undefined, initializer), node);
    }
    function visitThisExpression(node) {
        return classThis !== null && classThis !== void 0 ? classThis : node;
    }
    function visitCallExpression(node) {
        if ((0, ts_1.isSuperProperty)(node.expression) && classThis) {
            var expression = (0, ts_1.visitNode)(node.expression, visitor, ts_1.isExpression);
            var argumentsList = (0, ts_1.visitNodes)(node.arguments, visitor, ts_1.isExpression);
            var invocation = factory.createFunctionCallCall(expression, classThis, argumentsList);
            (0, ts_1.setOriginalNode)(invocation, node);
            (0, ts_1.setTextRange)(invocation, node);
            return invocation;
        }
        return (0, ts_1.visitEachChild)(node, visitor, context);
    }
    function visitTaggedTemplateExpression(node) {
        if ((0, ts_1.isSuperProperty)(node.tag) && classThis) {
            var tag = (0, ts_1.visitNode)(node.tag, visitor, ts_1.isExpression);
            var boundTag = factory.createFunctionBindCall(tag, classThis, []);
            (0, ts_1.setOriginalNode)(boundTag, node);
            (0, ts_1.setTextRange)(boundTag, node);
            var template = (0, ts_1.visitNode)(node.template, visitor, ts_1.isTemplateLiteral);
            return factory.updateTaggedTemplateExpression(node, boundTag, /*typeArguments*/ undefined, template);
        }
        return (0, ts_1.visitEachChild)(node, visitor, context);
    }
    function visitPropertyAccessExpression(node) {
        if ((0, ts_1.isSuperProperty)(node) && (0, ts_1.isIdentifier)(node.name) && classThis && classSuper) {
            var propertyName = factory.createStringLiteralFromNode(node.name);
            var superProperty = factory.createReflectGetCall(classSuper, propertyName, classThis);
            (0, ts_1.setOriginalNode)(superProperty, node.expression);
            (0, ts_1.setTextRange)(superProperty, node.expression);
            return superProperty;
        }
        return (0, ts_1.visitEachChild)(node, visitor, context);
    }
    function visitElementAccessExpression(node) {
        if ((0, ts_1.isSuperProperty)(node) && classThis && classSuper) {
            var propertyName = (0, ts_1.visitNode)(node.argumentExpression, visitor, ts_1.isExpression);
            var superProperty = factory.createReflectGetCall(classSuper, propertyName, classThis);
            (0, ts_1.setOriginalNode)(superProperty, node.expression);
            (0, ts_1.setTextRange)(superProperty, node.expression);
            return superProperty;
        }
        return (0, ts_1.visitEachChild)(node, visitor, context);
    }
    function visitParameterDeclaration(node) {
        // 8.6.3 RS: IteratorBindingInitialization
        //   SingleNameBinding : BindingIdentifier Initializer?
        //     ...
        //     5. If |Initializer| is present and _v_ is *undefined*, then
        //        a. If IsAnonymousFunctionDefinition(|Initializer|) is *true*, then
        //           i. Set _v_ to ? NamedEvaluation of |Initializer| with argument _bindingId_.
        //     ...
        //
        // 14.3.3.3 RS: KeyedBindingInitialization
        //   SingleNameBinding : BindingIdentifier Initializer?
        //     ...
        //     4. If |Initializer| is present and _v_ is *undefined*, then
        //        a. If IsAnonymousFunctionDefinition(|Initializer|) is *true*, then
        //           i. Set _v_ to ? NamedEvaluation of |Initializer| with argument _bindingId_.
        //     ...
        var updated;
        if ((0, ts_1.isNamedEvaluation)(node, isAnonymousClassNeedingAssignedName)) {
            var assignedName_1 = getAssignedNameOfIdentifier(node.name, node.initializer);
            var name_2 = (0, ts_1.visitNode)(node.name, visitor, ts_1.isBindingName);
            var initializer = (0, ts_1.visitNode)(node.initializer, function (node) { return namedEvaluationVisitor(node, assignedName_1); }, ts_1.isExpression);
            updated = factory.updateParameterDeclaration(node, 
            /*modifiers*/ undefined, 
            /*dotDotDotToken*/ undefined, name_2, 
            /*questionToken*/ undefined, 
            /*type*/ undefined, initializer);
        }
        else {
            updated = factory.updateParameterDeclaration(node, 
            /*modifiers*/ undefined, node.dotDotDotToken, (0, ts_1.visitNode)(node.name, visitor, ts_1.isBindingName), 
            /*questionToken*/ undefined, 
            /*type*/ undefined, (0, ts_1.visitNode)(node.initializer, visitor, ts_1.isExpression));
        }
        if (updated !== node) {
            // While we emit the source map for the node after skipping decorators and modifiers,
            // we need to emit the comments for the original range.
            (0, ts_1.setCommentRange)(updated, node);
            (0, ts_1.setTextRange)(updated, (0, ts_1.moveRangePastModifiers)(node));
            (0, ts_1.setSourceMapRange)(updated, (0, ts_1.moveRangePastModifiers)(node));
            (0, ts_1.setEmitFlags)(updated.name, 64 /* EmitFlags.NoTrailingSourceMap */);
        }
        return updated;
    }
    function isAnonymousClassNeedingAssignedName(node) {
        return (0, ts_1.isClassExpression)(node) && !node.name && isDecoratedClassLike(node);
    }
    function visitForStatement(node) {
        return factory.updateForStatement(node, (0, ts_1.visitNode)(node.initializer, discardedValueVisitor, ts_1.isForInitializer), (0, ts_1.visitNode)(node.condition, visitor, ts_1.isExpression), (0, ts_1.visitNode)(node.incrementor, discardedValueVisitor, ts_1.isExpression), (0, ts_1.visitIterationBody)(node.statement, visitor, context));
    }
    function visitExpressionStatement(node) {
        return (0, ts_1.visitEachChild)(node, discardedValueVisitor, context);
    }
    function visitBinaryExpression(node, discarded) {
        if ((0, ts_1.isDestructuringAssignment)(node)) {
            var left = visitAssignmentPattern(node.left);
            var right = (0, ts_1.visitNode)(node.right, visitor, ts_1.isExpression);
            return factory.updateBinaryExpression(node, left, node.operatorToken, right);
        }
        if ((0, ts_1.isAssignmentExpression)(node)) {
            // 13.15.2 RS: Evaluation
            //   AssignmentExpression : LeftHandSideExpression `=` AssignmentExpression
            //     1. If |LeftHandSideExpression| is neither an |ObjectLiteral| nor an |ArrayLiteral|, then
            //        a. Let _lref_ be ? Evaluation of |LeftHandSideExpression|.
            //        b. If IsAnonymousFunctionDefinition(|AssignmentExpression|) and IsIdentifierRef of |LeftHandSideExpression| are both *true*, then
            //           i. Let _rval_ be ? NamedEvaluation of |AssignmentExpression| with argument _lref_.[[ReferencedName]].
            //     ...
            //
            //   AssignmentExpression : LeftHandSideExpression `&&=` AssignmentExpression
            //     ...
            //     5. If IsAnonymousFunctionDefinition(|AssignmentExpression|) is *true* and IsIdentifierRef of |LeftHandSideExpression| is *true*, then
            //        a. Let _rval_ be ? NamedEvaluation of |AssignmentExpression| with argument _lref_.[[ReferencedName]].
            //     ...
            //
            //   AssignmentExpression : LeftHandSideExpression `||=` AssignmentExpression
            //     ...
            //     5. If IsAnonymousFunctionDefinition(|AssignmentExpression|) is *true* and IsIdentifierRef of |LeftHandSideExpression| is *true*, then
            //        a. Let _rval_ be ? NamedEvaluation of |AssignmentExpression| with argument _lref_.[[ReferencedName]].
            //     ...
            //
            //   AssignmentExpression : LeftHandSideExpression `??=` AssignmentExpression
            //     ...
            //     4. If IsAnonymousFunctionDefinition(|AssignmentExpression|) is *true* and IsIdentifierRef of |LeftHandSideExpression| is *true*, then
            //        a. Let _rval_ be ? NamedEvaluation of |AssignmentExpression| with argument _lref_.[[ReferencedName]].
            //     ...
            if ((0, ts_1.isNamedEvaluation)(node, isAnonymousClassNeedingAssignedName)) {
                var assignedName_2 = getAssignedNameOfIdentifier(node.left, node.right);
                var left = (0, ts_1.visitNode)(node.left, visitor, ts_1.isExpression);
                var right = (0, ts_1.visitNode)(node.right, function (node) { return namedEvaluationVisitor(node, assignedName_2); }, ts_1.isExpression);
                return factory.updateBinaryExpression(node, left, node.operatorToken, right);
            }
            if ((0, ts_1.isSuperProperty)(node.left) && classThis && classSuper) {
                var setterName = (0, ts_1.isElementAccessExpression)(node.left) ? (0, ts_1.visitNode)(node.left.argumentExpression, visitor, ts_1.isExpression) :
                    (0, ts_1.isIdentifier)(node.left.name) ? factory.createStringLiteralFromNode(node.left.name) :
                        undefined;
                if (setterName) {
                    // super.x = ...
                    // super.x += ...
                    // super[x] = ...
                    // super[x] += ...
                    var expression = (0, ts_1.visitNode)(node.right, visitor, ts_1.isExpression);
                    if ((0, ts_1.isCompoundAssignment)(node.operatorToken.kind)) {
                        var getterName = setterName;
                        if (!(0, ts_1.isSimpleInlineableExpression)(setterName)) {
                            getterName = factory.createTempVariable(hoistVariableDeclaration);
                            setterName = factory.createAssignment(getterName, setterName);
                        }
                        var superPropertyGet = factory.createReflectGetCall(classSuper, getterName, classThis);
                        (0, ts_1.setOriginalNode)(superPropertyGet, node.left);
                        (0, ts_1.setTextRange)(superPropertyGet, node.left);
                        expression = factory.createBinaryExpression(superPropertyGet, (0, ts_1.getNonAssignmentOperatorForCompoundAssignment)(node.operatorToken.kind), expression);
                        (0, ts_1.setTextRange)(expression, node);
                    }
                    var temp = discarded ? undefined : factory.createTempVariable(hoistVariableDeclaration);
                    if (temp) {
                        expression = factory.createAssignment(temp, expression);
                        (0, ts_1.setTextRange)(temp, node);
                    }
                    expression = factory.createReflectSetCall(classSuper, setterName, expression, classThis);
                    (0, ts_1.setOriginalNode)(expression, node);
                    (0, ts_1.setTextRange)(expression, node);
                    if (temp) {
                        expression = factory.createComma(expression, temp);
                        (0, ts_1.setTextRange)(expression, node);
                    }
                    return expression;
                }
            }
        }
        if (node.operatorToken.kind === 28 /* SyntaxKind.CommaToken */) {
            var left = (0, ts_1.visitNode)(node.left, discardedValueVisitor, ts_1.isExpression);
            var right = (0, ts_1.visitNode)(node.right, discarded ? discardedValueVisitor : visitor, ts_1.isExpression);
            return factory.updateBinaryExpression(node, left, node.operatorToken, right);
        }
        return (0, ts_1.visitEachChild)(node, visitor, context);
    }
    function visitPreOrPostfixUnaryExpression(node, discarded) {
        if (node.operator === 46 /* SyntaxKind.PlusPlusToken */ ||
            node.operator === 47 /* SyntaxKind.MinusMinusToken */) {
            var operand = (0, ts_1.skipParentheses)(node.operand);
            if ((0, ts_1.isSuperProperty)(operand) && classThis && classSuper) {
                var setterName = (0, ts_1.isElementAccessExpression)(operand) ? (0, ts_1.visitNode)(operand.argumentExpression, visitor, ts_1.isExpression) :
                    (0, ts_1.isIdentifier)(operand.name) ? factory.createStringLiteralFromNode(operand.name) :
                        undefined;
                if (setterName) {
                    var getterName = setterName;
                    if (!(0, ts_1.isSimpleInlineableExpression)(setterName)) {
                        getterName = factory.createTempVariable(hoistVariableDeclaration);
                        setterName = factory.createAssignment(getterName, setterName);
                    }
                    var expression = factory.createReflectGetCall(classSuper, getterName, classThis);
                    (0, ts_1.setOriginalNode)(expression, node);
                    (0, ts_1.setTextRange)(expression, node);
                    // If the result of this expression is discarded (i.e., it's in a position where the result
                    // will be otherwise unused, such as in an expression statement or the left side of a comma), we
                    // don't need to create an extra temp variable to hold the result:
                    //
                    //  source (discarded):
                    //    super.x++;
                    //  generated:
                    //    _a = Reflect.get(_super, "x"), _a++, Reflect.set(_super, "x", _a);
                    //
                    // Above, the temp variable `_a` is used to perform the correct coercion (i.e., number or
                    // bigint). Since the result of the postfix unary is discarded, we don't need to capture the
                    // result of the expression.
                    //
                    //  source (not discarded):
                    //    y = super.x++;
                    //  generated:
                    //    y = (_a = Reflect.get(_super, "x"), _b = _a++, Reflect.set(_super, "x", _a), _b);
                    //
                    // When the result isn't discarded, we introduce a new temp variable (`_b`) to capture the
                    // result of the operation so that we can provide it to `y` when the assignment is complete.
                    var temp = discarded ? undefined : factory.createTempVariable(hoistVariableDeclaration);
                    expression = (0, ts_1.expandPreOrPostfixIncrementOrDecrementExpression)(factory, node, expression, hoistVariableDeclaration, temp);
                    expression = factory.createReflectSetCall(classSuper, setterName, expression, classThis);
                    (0, ts_1.setOriginalNode)(expression, node);
                    (0, ts_1.setTextRange)(expression, node);
                    if (temp) {
                        expression = factory.createComma(expression, temp);
                        (0, ts_1.setTextRange)(expression, node);
                    }
                    return expression;
                }
            }
        }
        return (0, ts_1.visitEachChild)(node, visitor, context);
    }
    function visitCommaListExpression(node, discarded) {
        var elements = discarded ?
            (0, ts_1.visitCommaListElements)(node.elements, discardedValueVisitor) :
            (0, ts_1.visitCommaListElements)(node.elements, visitor, discardedValueVisitor);
        return factory.updateCommaListExpression(node, elements);
    }
    function visitReferencedPropertyName(node) {
        if ((0, ts_1.isPropertyNameLiteral)(node) || (0, ts_1.isPrivateIdentifier)(node)) {
            var referencedName_1 = factory.createStringLiteralFromNode(node);
            var name_3 = (0, ts_1.visitNode)(node, visitor, ts_1.isPropertyName);
            return { referencedName: referencedName_1, name: name_3 };
        }
        if ((0, ts_1.isPropertyNameLiteral)(node.expression) && !(0, ts_1.isIdentifier)(node.expression)) {
            var referencedName_2 = factory.createStringLiteralFromNode(node.expression);
            var name_4 = (0, ts_1.visitNode)(node, visitor, ts_1.isPropertyName);
            return { referencedName: referencedName_2, name: name_4 };
        }
        var referencedName = factory.getGeneratedNameForNode(node);
        hoistVariableDeclaration(referencedName);
        var key = emitHelpers().createPropKeyHelper((0, ts_1.visitNode)(node.expression, visitor, ts_1.isExpression));
        var assignment = factory.createAssignment(referencedName, key);
        var name = factory.updateComputedPropertyName(node, injectPendingExpressions(assignment));
        return { referencedName: referencedName, name: name };
    }
    function visitPropertyName(node) {
        if ((0, ts_1.isComputedPropertyName)(node)) {
            return visitComputedPropertyName(node);
        }
        return (0, ts_1.visitNode)(node, visitor, ts_1.isPropertyName);
    }
    function visitComputedPropertyName(node) {
        var expression = (0, ts_1.visitNode)(node.expression, visitor, ts_1.isExpression);
        if (!(0, ts_1.isSimpleInlineableExpression)(expression)) {
            expression = injectPendingExpressions(expression);
        }
        return factory.updateComputedPropertyName(node, expression);
    }
    function visitPropertyAssignment(node) {
        // 13.2.5.5 RS: PropertyDefinitionEvaluation
        //   PropertyAssignment : PropertyName `:` AssignmentExpression
        //     ...
        //     5. If IsAnonymousFunctionDefinition(|AssignmentExpression|) is *true* and _isProtoSetter_ is *false*, then
        //        a. Let _popValue_ be ? NamedEvaluation of |AssignmentExpression| with argument _propKey_.
        //     ...
        if ((0, ts_1.isNamedEvaluation)(node, isAnonymousClassNeedingAssignedName)) {
            var _a = visitReferencedPropertyName(node.name), referencedName_3 = _a.referencedName, name_5 = _a.name;
            var initializer = (0, ts_1.visitNode)(node.initializer, function (node) { return namedEvaluationVisitor(node, referencedName_3); }, ts_1.isExpression);
            return factory.updatePropertyAssignment(node, name_5, initializer);
        }
        return (0, ts_1.visitEachChild)(node, visitor, context);
    }
    function visitVariableDeclaration(node) {
        // 14.3.1.2 RS: Evaluation
        //   LexicalBinding : BindingIdentifier Initializer
        //     ...
        //     3. If IsAnonymousFunctionDefinition(|Initializer|) is *true*, then
        //        a. Let _value_ be ? NamedEvaluation of |Initializer| with argument _bindingId_.
        //     ...
        //
        // 14.3.2.1 RS: Evaluation
        //   VariableDeclaration : BindingIdentifier Initializer
        //     ...
        //     3. If IsAnonymousFunctionDefinition(|Initializer|) is *true*, then
        //        a. Let _value_ be ? NamedEvaluation of |Initializer| with argument _bindingId_.
        //     ...
        if ((0, ts_1.isNamedEvaluation)(node, isAnonymousClassNeedingAssignedName)) {
            var assignedName_3 = getAssignedNameOfIdentifier(node.name, node.initializer);
            var name_6 = (0, ts_1.visitNode)(node.name, visitor, ts_1.isBindingName);
            var initializer = (0, ts_1.visitNode)(node.initializer, function (node) { return namedEvaluationVisitor(node, assignedName_3); }, ts_1.isExpression);
            return factory.updateVariableDeclaration(node, name_6, /*exclamationToken*/ undefined, /*type*/ undefined, initializer);
        }
        return (0, ts_1.visitEachChild)(node, visitor, context);
    }
    function visitBindingElement(node) {
        // 8.6.3 RS: IteratorBindingInitialization
        //   SingleNameBinding : BindingIdentifier Initializer?
        //     ...
        //     5. If |Initializer| is present and _v_ is *undefined*, then
        //        a. If IsAnonymousFunctionDefinition(|Initializer|) is *true*, then
        //           i. Set _v_ to ? NamedEvaluation of |Initializer| with argument _bindingId_.
        //     ...
        //
        // 14.3.3.3 RS: KeyedBindingInitialization
        //   SingleNameBinding : BindingIdentifier Initializer?
        //     ...
        //     4. If |Initializer| is present and _v_ is *undefined*, then
        //        a. If IsAnonymousFunctionDefinition(|Initializer|) is *true*, then
        //           i. Set _v_ to ? NamedEvaluation of |Initializer| with argument _bindingId_.
        //     ...
        if ((0, ts_1.isNamedEvaluation)(node, isAnonymousClassNeedingAssignedName)) {
            var assignedName_4 = getAssignedNameOfIdentifier(node.name, node.initializer);
            var propertyName = (0, ts_1.visitNode)(node.propertyName, visitor, ts_1.isPropertyName);
            var name_7 = (0, ts_1.visitNode)(node.name, visitor, ts_1.isBindingName);
            var initializer = (0, ts_1.visitNode)(node.initializer, function (node) { return namedEvaluationVisitor(node, assignedName_4); }, ts_1.isExpression);
            return factory.updateBindingElement(node, /*dotDotDotToken*/ undefined, propertyName, name_7, initializer);
        }
        return (0, ts_1.visitEachChild)(node, visitor, context);
    }
    function visitDestructuringAssignmentTarget(node) {
        if ((0, ts_1.isObjectLiteralExpression)(node) || (0, ts_1.isArrayLiteralExpression)(node)) {
            return visitAssignmentPattern(node);
        }
        if ((0, ts_1.isSuperProperty)(node) && classThis && classSuper) {
            var propertyName = (0, ts_1.isElementAccessExpression)(node) ? (0, ts_1.visitNode)(node.argumentExpression, visitor, ts_1.isExpression) :
                (0, ts_1.isIdentifier)(node.name) ? factory.createStringLiteralFromNode(node.name) :
                    undefined;
            if (propertyName) {
                var paramName = factory.createTempVariable(/*recordTempVariable*/ undefined);
                var expression = factory.createAssignmentTargetWrapper(paramName, factory.createReflectSetCall(classSuper, propertyName, paramName, classThis));
                (0, ts_1.setOriginalNode)(expression, node);
                (0, ts_1.setTextRange)(expression, node);
                return expression;
            }
        }
        return (0, ts_1.visitEachChild)(node, visitor, context);
    }
    function visitAssignmentElement(node) {
        // 13.15.5.5 RS: IteratorDestructuringAssignmentEvaluation
        //   AssignmentElement : DestructuringAssignmentTarget Initializer?
        //     ...
        //     4. If |Initializer| is present and _value_ is *undefined*, then
        //        a. If IsAnonymousFunctionDefinition(|Initializer|) and IsIdentifierRef of |DestructuringAssignmentTarget| are both *true*, then
        //           i. Let _v_ be ? NamedEvaluation of |Initializer| with argument _lref_.[[ReferencedName]].
        //     ...
        if ((0, ts_1.isAssignmentExpression)(node, /*excludeCompoundAssignment*/ true)) {
            var assignmentTarget = visitDestructuringAssignmentTarget(node.left);
            var initializer = void 0;
            if ((0, ts_1.isNamedEvaluation)(node, isAnonymousClassNeedingAssignedName)) {
                var assignedName_5 = getAssignedNameOfIdentifier(node.left, node.right);
                initializer = (0, ts_1.visitNode)(node.right, function (node) { return namedEvaluationVisitor(node, assignedName_5); }, ts_1.isExpression);
            }
            else {
                initializer = (0, ts_1.visitNode)(node.right, visitor, ts_1.isExpression);
            }
            return factory.updateBinaryExpression(node, assignmentTarget, node.operatorToken, initializer);
        }
        else {
            return visitDestructuringAssignmentTarget(node);
        }
    }
    function visitAssignmentRestElement(node) {
        if ((0, ts_1.isLeftHandSideExpression)(node.expression)) {
            var expression = visitDestructuringAssignmentTarget(node.expression);
            return factory.updateSpreadElement(node, expression);
        }
        return (0, ts_1.visitEachChild)(node, visitor, context);
    }
    function visitArrayAssignmentElement(node) {
        ts_1.Debug.assertNode(node, ts_1.isArrayBindingOrAssignmentElement);
        if ((0, ts_1.isSpreadElement)(node))
            return visitAssignmentRestElement(node);
        if (!(0, ts_1.isOmittedExpression)(node))
            return visitAssignmentElement(node);
        return (0, ts_1.visitEachChild)(node, visitor, context);
    }
    function visitAssignmentProperty(node) {
        // AssignmentProperty : PropertyName `:` AssignmentElement
        // AssignmentElement : DestructuringAssignmentTarget Initializer?
        // 13.15.5.6 RS: KeyedDestructuringAssignmentEvaluation
        //   AssignmentElement : DestructuringAssignmentTarget Initializer?
        //     ...
        //     3. If |Initializer| is present and _v_ is *undefined*, then
        //        a. If IsAnonymousfunctionDefinition(|Initializer|) and IsIdentifierRef of |DestructuringAssignmentTarget| are both *true*, then
        //           i. Let _rhsValue_ be ? NamedEvaluation of |Initializer| with argument _lref_.[[ReferencedName]].
        //     ...
        var name = (0, ts_1.visitNode)(node.name, visitor, ts_1.isPropertyName);
        if ((0, ts_1.isAssignmentExpression)(node.initializer, /*excludeCompoundAssignment*/ true)) {
            var assignmentElement = visitAssignmentElement(node.initializer);
            return factory.updatePropertyAssignment(node, name, assignmentElement);
        }
        if ((0, ts_1.isLeftHandSideExpression)(node.initializer)) {
            var assignmentElement = visitDestructuringAssignmentTarget(node.initializer);
            return factory.updatePropertyAssignment(node, name, assignmentElement);
        }
        return (0, ts_1.visitEachChild)(node, visitor, context);
    }
    function visitShorthandAssignmentProperty(node) {
        // AssignmentProperty : IdentifierReference Initializer?
        // 13.15.5.3 RS: PropertyDestructuringAssignmentEvaluation
        //   AssignmentProperty : IdentifierReference Initializer?
        //     ...
        //     4. If |Initializer?| is present and _v_ is *undefined*, then
        //        a. If IsAnonymousFunctionDefinition(|Initializer|) is *true*, then
        //           i. Set _v_ to ? NamedEvaluation of |Initializer| with argument _P_.
        //     ...
        if ((0, ts_1.isNamedEvaluation)(node, isAnonymousClassNeedingAssignedName)) {
            var assignedName_6 = getAssignedNameOfIdentifier(node.name, node.objectAssignmentInitializer);
            var name_8 = (0, ts_1.visitNode)(node.name, visitor, ts_1.isIdentifier);
            var objectAssignmentInitializer = (0, ts_1.visitNode)(node.objectAssignmentInitializer, function (node) { return namedEvaluationVisitor(node, assignedName_6); }, ts_1.isExpression);
            return factory.updateShorthandPropertyAssignment(node, name_8, objectAssignmentInitializer);
        }
        return (0, ts_1.visitEachChild)(node, visitor, context);
    }
    function visitAssignmentRestProperty(node) {
        if ((0, ts_1.isLeftHandSideExpression)(node.expression)) {
            var expression = visitDestructuringAssignmentTarget(node.expression);
            return factory.updateSpreadAssignment(node, expression);
        }
        return (0, ts_1.visitEachChild)(node, visitor, context);
    }
    function visitObjectAssignmentElement(node) {
        ts_1.Debug.assertNode(node, ts_1.isObjectBindingOrAssignmentElement);
        if ((0, ts_1.isSpreadAssignment)(node))
            return visitAssignmentRestProperty(node);
        if ((0, ts_1.isShorthandPropertyAssignment)(node))
            return visitShorthandAssignmentProperty(node);
        if ((0, ts_1.isPropertyAssignment)(node))
            return visitAssignmentProperty(node);
        return (0, ts_1.visitEachChild)(node, visitor, context);
    }
    function visitAssignmentPattern(node) {
        if ((0, ts_1.isArrayLiteralExpression)(node)) {
            var elements = (0, ts_1.visitNodes)(node.elements, visitArrayAssignmentElement, ts_1.isExpression);
            return factory.updateArrayLiteralExpression(node, elements);
        }
        else {
            var properties = (0, ts_1.visitNodes)(node.properties, visitObjectAssignmentElement, ts_1.isObjectLiteralElementLike);
            return factory.updateObjectLiteralExpression(node, properties);
        }
    }
    function visitExportAssignment(node) {
        // 16.2.3.7 RS: Evaluation
        //   ExportDeclaration : `export` `default` AssignmentExpression `;`
        //     1. If IsAnonymousFunctionDefinition(|AssignmentExpression|) is *true*, then
        //        a. Let _value_ be ? NamedEvaluation of |AssignmentExpression| with argument `"default"`.
        //     ...
        // NOTE: Since emit for `export =` translates to `module.exports = ...`, the assigned nameof the class
        // is `""`.
        if ((0, ts_1.isNamedEvaluation)(node, isAnonymousClassNeedingAssignedName)) {
            var referencedName_4 = factory.createStringLiteral(node.isExportEquals ? "" : "default");
            var modifiers = (0, ts_1.visitNodes)(node.modifiers, modifierVisitor, ts_1.isModifier);
            var expression = (0, ts_1.visitNode)(node.expression, function (node) { return namedEvaluationVisitor(node, referencedName_4); }, ts_1.isExpression);
            return factory.updateExportAssignment(node, modifiers, expression);
        }
        return (0, ts_1.visitEachChild)(node, visitor, context);
    }
    function visitParenthesizedExpression(node, discarded, referencedName) {
        // 8.4.5 RS: NamedEvaluation
        //   ParenthesizedExpression : `(` Expression `)`
        //     ...
        //     2. Return ? NamedEvaluation of |Expression| with argument _name_.
        var visitorFunc = discarded ? discardedValueVisitor :
            referencedName ? function (node) { return namedEvaluationVisitor(node, referencedName); } :
                visitor;
        var expression = (0, ts_1.visitNode)(node.expression, visitorFunc, ts_1.isExpression);
        return factory.updateParenthesizedExpression(node, expression);
    }
    function visitPartiallyEmittedExpression(node, discarded, referencedName) {
        // Emulates 8.4.5 RS: NamedEvaluation
        var visitorFunc = discarded ? discardedValueVisitor :
            referencedName ? function (node) { return namedEvaluationVisitor(node, referencedName); } :
                visitor;
        var expression = (0, ts_1.visitNode)(node.expression, visitorFunc, ts_1.isExpression);
        return factory.updatePartiallyEmittedExpression(node, expression);
    }
    function injectPendingExpressions(expression) {
        if ((0, ts_1.some)(pendingExpressions)) {
            if ((0, ts_1.isParenthesizedExpression)(expression)) {
                pendingExpressions.push(expression.expression);
                expression = factory.updateParenthesizedExpression(expression, factory.inlineExpressions(pendingExpressions));
            }
            else {
                pendingExpressions.push(expression);
                expression = factory.inlineExpressions(pendingExpressions);
            }
            pendingExpressions = undefined;
        }
        return expression;
    }
    /**
     * Transforms all of the decorators for a declaration into an array of expressions.
     *
     * @param allDecorators An object containing all of the decorators for the declaration.
     */
    function transformAllDecoratorsOfDeclaration(allDecorators) {
        if (!allDecorators) {
            return undefined;
        }
        var decoratorExpressions = [];
        (0, ts_1.addRange)(decoratorExpressions, (0, ts_1.map)(allDecorators.decorators, transformDecorator));
        return decoratorExpressions;
    }
    /**
     * Transforms a decorator into an expression.
     *
     * @param decorator The decorator node.
     */
    function transformDecorator(decorator) {
        var expression = (0, ts_1.visitNode)(decorator.expression, visitor, ts_1.isExpression);
        (0, ts_1.setEmitFlags)(expression, 3072 /* EmitFlags.NoComments */);
        return expression;
    }
    /**
     * Creates a `value`, `get`, or `set` method for a pseudo-{@link PropertyDescriptor} object created for a private element.
     */
    function createDescriptorMethod(original, name, modifiers, asteriskToken, kind, parameters, body) {
        var func = factory.createFunctionExpression(modifiers, asteriskToken, 
        /*name*/ undefined, 
        /*typeParameters*/ undefined, parameters, 
        /*type*/ undefined, body !== null && body !== void 0 ? body : factory.createBlock([]));
        (0, ts_1.setOriginalNode)(func, original);
        (0, ts_1.setSourceMapRange)(func, (0, ts_1.moveRangePastDecorators)(original));
        (0, ts_1.setEmitFlags)(func, 3072 /* EmitFlags.NoComments */);
        var prefix = kind === "get" || kind === "set" ? kind : undefined;
        var functionName = factory.createStringLiteralFromNode(name, /*isSingleQuote*/ undefined);
        var namedFunction = emitHelpers().createSetFunctionNameHelper(func, functionName, prefix);
        var method = factory.createPropertyAssignment(factory.createIdentifier(kind), namedFunction);
        (0, ts_1.setOriginalNode)(method, original);
        (0, ts_1.setSourceMapRange)(method, (0, ts_1.moveRangePastDecorators)(original));
        (0, ts_1.setEmitFlags)(method, 3072 /* EmitFlags.NoComments */);
        return method;
    }
    /**
     * Creates a pseudo-{@link PropertyDescriptor} object used when decorating a private {@link MethodDeclaration}.
     */
    function createMethodDescriptorObject(node, modifiers) {
        return factory.createObjectLiteralExpression([
            createDescriptorMethod(node, node.name, modifiers, node.asteriskToken, "value", (0, ts_1.visitNodes)(node.parameters, visitor, ts_1.isParameter), (0, ts_1.visitNode)(node.body, visitor, ts_1.isBlock))
        ]);
    }
    /**
     * Creates a pseudo-{@link PropertyDescriptor} object used when decorating a private {@link GetAccessorDeclaration}.
     */
    function createGetAccessorDescriptorObject(node, modifiers) {
        return factory.createObjectLiteralExpression([
            createDescriptorMethod(node, node.name, modifiers, 
            /*asteriskToken*/ undefined, "get", [], (0, ts_1.visitNode)(node.body, visitor, ts_1.isBlock))
        ]);
    }
    /**
     * Creates a pseudo-{@link PropertyDescriptor} object used when decorating a private {@link SetAccessorDeclaration}.
     */
    function createSetAccessorDescriptorObject(node, modifiers) {
        return factory.createObjectLiteralExpression([
            createDescriptorMethod(node, node.name, modifiers, 
            /*asteriskToken*/ undefined, "set", (0, ts_1.visitNodes)(node.parameters, visitor, ts_1.isParameter), (0, ts_1.visitNode)(node.body, visitor, ts_1.isBlock))
        ]);
    }
    /**
     * Creates a pseudo-{@link PropertyDescriptor} object used when decorating an `accessor` {@link PropertyDeclaration} with a private name.
     */
    function createAccessorPropertyDescriptorObject(node, modifiers) {
        //  {
        //      get() { return this.${privateName}; },
        //      set(value) { this.${privateName} = value; },
        //  }
        return factory.createObjectLiteralExpression([
            createDescriptorMethod(node, node.name, modifiers, 
            /*asteriskToken*/ undefined, "get", [], factory.createBlock([
                factory.createReturnStatement(factory.createPropertyAccessExpression(factory.createThis(), factory.getGeneratedPrivateNameForNode(node.name)))
            ])),
            createDescriptorMethod(node, node.name, modifiers, 
            /*asteriskToken*/ undefined, "set", [factory.createParameterDeclaration(
                /*modifiers*/ undefined, 
                /*dotDotDotToken*/ undefined, "value")], factory.createBlock([
                factory.createExpressionStatement(factory.createAssignment(factory.createPropertyAccessExpression(factory.createThis(), factory.getGeneratedPrivateNameForNode(node.name)), factory.createIdentifier("value")))
            ]))
        ]);
    }
    /**
     * Creates a {@link MethodDeclaration} that forwards its invocation to a {@link PropertyDescriptor} object.
     * @param modifiers The modifiers for the resulting declaration.
     * @param name The name for the resulting declaration.
     * @param descriptorName The name of the descriptor variable.
     */
    function createMethodDescriptorForwarder(modifiers, name, descriptorName) {
        // strip off all but the `static` modifier
        modifiers = (0, ts_1.visitNodes)(modifiers, function (node) { return (0, ts_1.isStaticModifier)(node) ? node : undefined; }, ts_1.isModifier);
        return factory.createGetAccessorDeclaration(modifiers, name, [], 
        /*type*/ undefined, factory.createBlock([
            factory.createReturnStatement(factory.createPropertyAccessExpression(descriptorName, factory.createIdentifier("value")))
        ]));
    }
    /**
     * Creates a {@link GetAccessorDeclaration} that forwards its invocation to a {@link PropertyDescriptor} object.
     * @param modifiers The modifiers for the resulting declaration.
     * @param name The name for the resulting declaration.
     * @param descriptorName The name of the descriptor variable.
     */
    function createGetAccessorDescriptorForwarder(modifiers, name, descriptorName) {
        // strip off all but the `static` modifier
        modifiers = (0, ts_1.visitNodes)(modifiers, function (node) { return (0, ts_1.isStaticModifier)(node) ? node : undefined; }, ts_1.isModifier);
        return factory.createGetAccessorDeclaration(modifiers, name, [], 
        /*type*/ undefined, factory.createBlock([
            factory.createReturnStatement(factory.createFunctionCallCall(factory.createPropertyAccessExpression(descriptorName, factory.createIdentifier("get")), factory.createThis(), []))
        ]));
    }
    /**
     * Creates a {@link SetAccessorDeclaration} that forwards its invocation to a {@link PropertyDescriptor} object.
     * @param modifiers The modifiers for the resulting declaration.
     * @param name The name for the resulting declaration.
     * @param descriptorName The name of the descriptor variable.
     */
    function createSetAccessorDescriptorForwarder(modifiers, name, descriptorName) {
        // strip off all but the `static` modifier
        modifiers = (0, ts_1.visitNodes)(modifiers, function (node) { return (0, ts_1.isStaticModifier)(node) ? node : undefined; }, ts_1.isModifier);
        return factory.createSetAccessorDeclaration(modifiers, name, [factory.createParameterDeclaration(
            /*modifiers*/ undefined, 
            /*dotDotDotToken*/ undefined, "value")], factory.createBlock([
            factory.createReturnStatement(factory.createFunctionCallCall(factory.createPropertyAccessExpression(descriptorName, factory.createIdentifier("set")), factory.createThis(), [factory.createIdentifier("value")]))
        ]));
    }
    function getAssignedNameOfIdentifier(name, initializer) {
        var originalClass = (0, ts_1.getOriginalNode)(initializer, ts_1.isClassLike);
        return originalClass && !originalClass.name && (0, ts_1.hasSyntacticModifier)(originalClass, 1024 /* ModifierFlags.Default */) ?
            factory.createStringLiteral("default") :
            factory.createStringLiteralFromNode(name);
    }
}
exports.transformESDecorators = transformESDecorators;
