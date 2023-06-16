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
exports.transformClassFields = void 0;
var ts_1 = require("../_namespaces/ts");
/**
 * Transforms ECMAScript Class Syntax.
 * TypeScript parameter property syntax is transformed in the TypeScript transformer.
 * For now, this transforms public field declarations using TypeScript class semantics,
 * where declarations are elided and initializers are transformed as assignments in the constructor.
 * When --useDefineForClassFields is on, this transforms to ECMAScript semantics, with Object.defineProperty.
 *
 * @internal
 */
function transformClassFields(context) {
    var factory = context.factory, emitHelpers = context.getEmitHelperFactory, hoistVariableDeclaration = context.hoistVariableDeclaration, endLexicalEnvironment = context.endLexicalEnvironment, startLexicalEnvironment = context.startLexicalEnvironment, resumeLexicalEnvironment = context.resumeLexicalEnvironment, addBlockScopedVariable = context.addBlockScopedVariable;
    var resolver = context.getEmitResolver();
    var compilerOptions = context.getCompilerOptions();
    var languageVersion = (0, ts_1.getEmitScriptTarget)(compilerOptions);
    var useDefineForClassFields = (0, ts_1.getUseDefineForClassFields)(compilerOptions);
    var legacyDecorators = !!compilerOptions.experimentalDecorators;
    // Always transform field initializers using Set semantics when `useDefineForClassFields: false`.
    var shouldTransformInitializersUsingSet = !useDefineForClassFields;
    // Transform field initializers using Define semantics when `useDefineForClassFields: true` and target < ES2022.
    var shouldTransformInitializersUsingDefine = useDefineForClassFields && languageVersion < 9 /* ScriptTarget.ES2022 */;
    var shouldTransformInitializers = shouldTransformInitializersUsingSet || shouldTransformInitializersUsingDefine;
    // We need to transform private members and class static blocks when target < ES2022.
    var shouldTransformPrivateElementsOrClassStaticBlocks = languageVersion < 9 /* ScriptTarget.ES2022 */;
    // We need to transform `accessor` fields when target < ESNext.
    // We may need to transform `accessor` fields when `useDefineForClassFields: false`
    var shouldTransformAutoAccessors = languageVersion < 99 /* ScriptTarget.ESNext */ ? -1 /* Ternary.True */ :
        !useDefineForClassFields ? 3 /* Ternary.Maybe */ :
            0 /* Ternary.False */;
    // We need to transform `this` in a static initializer into a reference to the class
    // when target < ES2022 since the assignment will be moved outside of the class body.
    var shouldTransformThisInStaticInitializers = languageVersion < 9 /* ScriptTarget.ES2022 */;
    // We don't need to transform `super` property access when target <= ES5 because
    // the es2015 transformation handles those.
    var shouldTransformSuperInStaticInitializers = shouldTransformThisInStaticInitializers && languageVersion >= 2 /* ScriptTarget.ES2015 */;
    var shouldTransformAnything = shouldTransformInitializers ||
        shouldTransformPrivateElementsOrClassStaticBlocks ||
        shouldTransformAutoAccessors === -1 /* Ternary.True */;
    var previousOnSubstituteNode = context.onSubstituteNode;
    context.onSubstituteNode = onSubstituteNode;
    var previousOnEmitNode = context.onEmitNode;
    context.onEmitNode = onEmitNode;
    var shouldTransformPrivateStaticElementsInFile = false;
    var enabledSubstitutions;
    var classAliases;
    /**
     * Tracks what computed name expressions originating from elided names must be inlined
     * at the next execution site, in document order
     */
    var pendingExpressions;
    /**
     * Tracks what computed name expression statements and static property initializers must be
     * emitted at the next execution site, in document order (for decorated classes).
     */
    var pendingStatements;
    var lexicalEnvironment;
    var lexicalEnvironmentMap = new Map();
    // Nodes that should not be replaced during emit substitution.
    var noSubstitution = new Set();
    var currentClassContainer;
    var currentClassElement;
    var shouldSubstituteThisWithClassThis = false;
    var previousShouldSubstituteThisWithClassThis = false;
    return (0, ts_1.chainBundle)(context, transformSourceFile);
    function transformSourceFile(node) {
        if (node.isDeclarationFile) {
            return node;
        }
        lexicalEnvironment = undefined;
        shouldTransformPrivateStaticElementsInFile = !!((0, ts_1.getInternalEmitFlags)(node) & 32 /* InternalEmitFlags.TransformPrivateStaticElements */);
        if (!shouldTransformAnything && !shouldTransformPrivateStaticElementsInFile) {
            return node;
        }
        var visited = (0, ts_1.visitEachChild)(node, visitor, context);
        (0, ts_1.addEmitHelpers)(visited, context.readEmitHelpers());
        return visited;
    }
    function modifierVisitor(node) {
        switch (node.kind) {
            case 129 /* SyntaxKind.AccessorKeyword */:
                return shouldTransformAutoAccessorsInCurrentClass() ? undefined : node;
            default:
                return (0, ts_1.tryCast)(node, ts_1.isModifier);
        }
    }
    function visitor(node) {
        if (!(node.transformFlags & 16777216 /* TransformFlags.ContainsClassFields */) &&
            !(node.transformFlags & 134234112 /* TransformFlags.ContainsLexicalThisOrSuper */)) {
            return node;
        }
        switch (node.kind) {
            case 129 /* SyntaxKind.AccessorKeyword */:
                return ts_1.Debug.fail("Use `modifierVisitor` instead.");
            case 262 /* SyntaxKind.ClassDeclaration */:
                return visitClassDeclaration(node);
            case 230 /* SyntaxKind.ClassExpression */:
                return visitClassExpression(node, /*referencedName*/ undefined);
            case 174 /* SyntaxKind.ClassStaticBlockDeclaration */:
            case 171 /* SyntaxKind.PropertyDeclaration */:
                return ts_1.Debug.fail("Use `classElementVisitor` instead.");
            case 302 /* SyntaxKind.PropertyAssignment */:
                return visitPropertyAssignment(node);
            case 242 /* SyntaxKind.VariableStatement */:
                return visitVariableStatement(node);
            case 259 /* SyntaxKind.VariableDeclaration */:
                return visitVariableDeclaration(node);
            case 168 /* SyntaxKind.Parameter */:
                return visitParameterDeclaration(node);
            case 207 /* SyntaxKind.BindingElement */:
                return visitBindingElement(node);
            case 276 /* SyntaxKind.ExportAssignment */:
                return visitExportAssignment(node);
            case 81 /* SyntaxKind.PrivateIdentifier */:
                return visitPrivateIdentifier(node);
            case 210 /* SyntaxKind.PropertyAccessExpression */:
                return visitPropertyAccessExpression(node);
            case 211 /* SyntaxKind.ElementAccessExpression */:
                return visitElementAccessExpression(node);
            case 223 /* SyntaxKind.PrefixUnaryExpression */:
            case 224 /* SyntaxKind.PostfixUnaryExpression */:
                return visitPreOrPostfixUnaryExpression(node, /*discarded*/ false);
            case 225 /* SyntaxKind.BinaryExpression */:
                return visitBinaryExpression(node, /*discarded*/ false);
            case 216 /* SyntaxKind.ParenthesizedExpression */:
                return visitParenthesizedExpression(node, /*discarded*/ false, /*referencedName*/ undefined);
            case 212 /* SyntaxKind.CallExpression */:
                return visitCallExpression(node);
            case 243 /* SyntaxKind.ExpressionStatement */:
                return visitExpressionStatement(node);
            case 214 /* SyntaxKind.TaggedTemplateExpression */:
                return visitTaggedTemplateExpression(node);
            case 247 /* SyntaxKind.ForStatement */:
                return visitForStatement(node);
            case 261 /* SyntaxKind.FunctionDeclaration */:
            case 217 /* SyntaxKind.FunctionExpression */:
                // If we are descending into a new scope, clear the current class element
                return setCurrentClassElementAnd(
                /*classElement*/ undefined, fallbackVisitor, node);
            case 175 /* SyntaxKind.Constructor */:
            case 173 /* SyntaxKind.MethodDeclaration */:
            case 176 /* SyntaxKind.GetAccessor */:
            case 177 /* SyntaxKind.SetAccessor */: {
                // If we are descending into a class element, set the class element
                return setCurrentClassElementAnd(node, fallbackVisitor, node);
            }
            default:
                return fallbackVisitor(node);
        }
    }
    function fallbackVisitor(node) {
        return (0, ts_1.visitEachChild)(node, visitor, context);
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
    /**
     * Visits a node in an expression whose result is discarded.
     */
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
    /**
     * Visits a node in a {@link HeritageClause}.
     */
    function heritageClauseVisitor(node) {
        switch (node.kind) {
            case 297 /* SyntaxKind.HeritageClause */:
                return (0, ts_1.visitEachChild)(node, heritageClauseVisitor, context);
            case 232 /* SyntaxKind.ExpressionWithTypeArguments */:
                return visitExpressionWithTypeArgumentsInHeritageClause(node);
            default:
                return visitor(node);
        }
    }
    /**
     * Visits the assignment target of a destructuring assignment.
     */
    function assignmentTargetVisitor(node) {
        switch (node.kind) {
            case 209 /* SyntaxKind.ObjectLiteralExpression */:
            case 208 /* SyntaxKind.ArrayLiteralExpression */:
                return visitAssignmentPattern(node);
            default:
                return visitor(node);
        }
    }
    /**
     * Visits a member of a class.
     */
    function classElementVisitor(node) {
        switch (node.kind) {
            case 175 /* SyntaxKind.Constructor */:
                return setCurrentClassElementAnd(node, visitConstructorDeclaration, node);
            case 176 /* SyntaxKind.GetAccessor */:
            case 177 /* SyntaxKind.SetAccessor */:
            case 173 /* SyntaxKind.MethodDeclaration */:
                return setCurrentClassElementAnd(node, visitMethodOrAccessorDeclaration, node);
            case 171 /* SyntaxKind.PropertyDeclaration */:
                return setCurrentClassElementAnd(node, visitPropertyDeclaration, node);
            case 174 /* SyntaxKind.ClassStaticBlockDeclaration */:
                return setCurrentClassElementAnd(node, visitClassStaticBlockDeclaration, node);
            case 166 /* SyntaxKind.ComputedPropertyName */:
                return visitComputedPropertyName(node);
            case 239 /* SyntaxKind.SemicolonClassElement */:
                return node;
            default:
                return (0, ts_1.isModifierLike)(node) ? modifierVisitor(node) : visitor(node);
        }
    }
    /**
     * Visits a property name of a class member.
     */
    function propertyNameVisitor(node) {
        switch (node.kind) {
            case 166 /* SyntaxKind.ComputedPropertyName */:
                return visitComputedPropertyName(node);
            default:
                return visitor(node);
        }
    }
    /**
     * Visits the results of an auto-accessor field transformation in a second pass.
     */
    function accessorFieldResultVisitor(node) {
        switch (node.kind) {
            case 171 /* SyntaxKind.PropertyDeclaration */:
                return transformFieldInitializer(node);
            case 176 /* SyntaxKind.GetAccessor */:
            case 177 /* SyntaxKind.SetAccessor */:
                return classElementVisitor(node);
            default:
                ts_1.Debug.assertMissingNode(node, "Expected node to either be a PropertyDeclaration, GetAccessorDeclaration, or SetAccessorDeclaration");
                break;
        }
    }
    /**
     * If we visit a private name, this means it is an undeclared private name.
     * Replace it with an empty identifier to indicate a problem with the code,
     * unless we are in a statement position - otherwise this will not trigger
     * a SyntaxError.
     */
    function visitPrivateIdentifier(node) {
        if (!shouldTransformPrivateElementsOrClassStaticBlocks) {
            return node;
        }
        if ((0, ts_1.isStatement)(node.parent)) {
            return node;
        }
        return (0, ts_1.setOriginalNode)(factory.createIdentifier(""), node);
    }
    /**
     * Visits `#id in expr`
     */
    function transformPrivateIdentifierInInExpression(node) {
        var info = accessPrivateIdentifier(node.left);
        if (info) {
            var receiver = (0, ts_1.visitNode)(node.right, visitor, ts_1.isExpression);
            return (0, ts_1.setOriginalNode)(emitHelpers().createClassPrivateFieldInHelper(info.brandCheckIdentifier, receiver), node);
        }
        // Private name has not been declared. Subsequent transformers will handle this error
        return (0, ts_1.visitEachChild)(node, visitor, context);
    }
    function visitPropertyAssignment(node) {
        // 13.2.5.5 RS: PropertyDefinitionEvaluation
        //   PropertyAssignment : PropertyName `:` AssignmentExpression
        //     ...
        //     5. If IsAnonymousFunctionDefinition(|AssignmentExpression|) is *true* and _isProtoSetter_ is *false*, then
        //        a. Let _popValue_ be ? NamedEvaluation of |AssignmentExpression| with argument _propKey_.
        //     ...
        if ((0, ts_1.isNamedEvaluation)(node, isAnonymousClassNeedingAssignedName)) {
            var _a = visitReferencedPropertyName(node.name), referencedName_1 = _a.referencedName, name_1 = _a.name;
            var initializer = (0, ts_1.visitNode)(node.initializer, function (node) { return namedEvaluationVisitor(node, referencedName_1); }, ts_1.isExpression);
            return factory.updatePropertyAssignment(node, name_1, initializer);
        }
        return (0, ts_1.visitEachChild)(node, visitor, context);
    }
    function visitVariableStatement(node) {
        var savedPendingStatements = pendingStatements;
        pendingStatements = [];
        var visitedNode = (0, ts_1.visitEachChild)(node, visitor, context);
        var statement = (0, ts_1.some)(pendingStatements) ? __spreadArray([visitedNode], pendingStatements, true) :
            visitedNode;
        pendingStatements = savedPendingStatements;
        return statement;
    }
    function getAssignedNameOfIdentifier(name, initializer) {
        var originalClass = (0, ts_1.getOriginalNode)(initializer, ts_1.isClassLike);
        return originalClass && !originalClass.name && (0, ts_1.hasSyntacticModifier)(originalClass, 1024 /* ModifierFlags.Default */) ?
            factory.createStringLiteral("default") :
            factory.createStringLiteralFromNode(name);
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
            var assignedName_1 = getAssignedNameOfIdentifier(node.name, node.initializer);
            var name_2 = (0, ts_1.visitNode)(node.name, visitor, ts_1.isBindingName);
            var initializer = (0, ts_1.visitNode)(node.initializer, function (node) { return namedEvaluationVisitor(node, assignedName_1); }, ts_1.isExpression);
            return factory.updateVariableDeclaration(node, name_2, /*exclamationToken*/ undefined, /*type*/ undefined, initializer);
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
        if ((0, ts_1.isNamedEvaluation)(node, isAnonymousClassNeedingAssignedName)) {
            var assignedName_2 = getAssignedNameOfIdentifier(node.name, node.initializer);
            var name_3 = (0, ts_1.visitNode)(node.name, visitor, ts_1.isBindingName);
            var initializer = (0, ts_1.visitNode)(node.initializer, function (node) { return namedEvaluationVisitor(node, assignedName_2); }, ts_1.isExpression);
            return factory.updateParameterDeclaration(node, 
            /*modifiers*/ undefined, 
            /*dotDotDotToken*/ undefined, name_3, 
            /*questionToken*/ undefined, 
            /*type*/ undefined, initializer);
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
            var assignedName_3 = getAssignedNameOfIdentifier(node.name, node.initializer);
            var propertyName = (0, ts_1.visitNode)(node.propertyName, visitor, ts_1.isPropertyName);
            var name_4 = (0, ts_1.visitNode)(node.name, visitor, ts_1.isBindingName);
            var initializer = (0, ts_1.visitNode)(node.initializer, function (node) { return namedEvaluationVisitor(node, assignedName_3); }, ts_1.isExpression);
            return factory.updateBindingElement(node, /*dotDotDotToken*/ undefined, propertyName, name_4, initializer);
        }
        return (0, ts_1.visitEachChild)(node, visitor, context);
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
            var assignedName_4 = factory.createStringLiteral(node.isExportEquals ? "" : "default");
            var modifiers = (0, ts_1.visitNodes)(node.modifiers, modifierVisitor, ts_1.isModifier);
            var expression = (0, ts_1.visitNode)(node.expression, function (node) { return namedEvaluationVisitor(node, assignedName_4); }, ts_1.isExpression);
            return factory.updateExportAssignment(node, modifiers, expression);
        }
        return (0, ts_1.visitEachChild)(node, visitor, context);
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
    function visitComputedPropertyName(node) {
        var expression = (0, ts_1.visitNode)(node.expression, visitor, ts_1.isExpression);
        return factory.updateComputedPropertyName(node, injectPendingExpressions(expression));
    }
    function visitConstructorDeclaration(node) {
        if (currentClassContainer) {
            return transformConstructor(node, currentClassContainer);
        }
        return fallbackVisitor(node);
    }
    function shouldTransformClassElementToWeakMap(node) {
        if (shouldTransformPrivateElementsOrClassStaticBlocks)
            return true;
        if ((0, ts_1.hasStaticModifier)(node) && (0, ts_1.getInternalEmitFlags)(node) & 32 /* InternalEmitFlags.TransformPrivateStaticElements */)
            return true;
        return false;
    }
    function visitMethodOrAccessorDeclaration(node) {
        ts_1.Debug.assert(!(0, ts_1.hasDecorators)(node));
        if (!(0, ts_1.isPrivateIdentifierClassElementDeclaration)(node) || !shouldTransformClassElementToWeakMap(node)) {
            return (0, ts_1.visitEachChild)(node, classElementVisitor, context);
        }
        // leave invalid code untransformed
        var info = accessPrivateIdentifier(node.name);
        ts_1.Debug.assert(info, "Undeclared private name for property declaration.");
        if (!info.isValid) {
            return node;
        }
        var functionName = getHoistedFunctionName(node);
        if (functionName) {
            getPendingExpressions().push(factory.createAssignment(functionName, factory.createFunctionExpression((0, ts_1.filter)(node.modifiers, function (m) { return (0, ts_1.isModifier)(m) && !(0, ts_1.isStaticModifier)(m) && !(0, ts_1.isAccessorModifier)(m); }), node.asteriskToken, functionName, 
            /*typeParameters*/ undefined, (0, ts_1.visitParameterList)(node.parameters, visitor, context), 
            /*type*/ undefined, (0, ts_1.visitFunctionBody)(node.body, visitor, context))));
        }
        // remove method declaration from class
        return undefined;
    }
    function setCurrentClassElementAnd(classElement, visitor, arg) {
        if (classElement !== currentClassElement) {
            var savedCurrentClassElement = currentClassElement;
            currentClassElement = classElement;
            var result = visitor(arg);
            currentClassElement = savedCurrentClassElement;
            return result;
        }
        return visitor(arg);
    }
    function getHoistedFunctionName(node) {
        ts_1.Debug.assert((0, ts_1.isPrivateIdentifier)(node.name));
        var info = accessPrivateIdentifier(node.name);
        ts_1.Debug.assert(info, "Undeclared private name for property declaration.");
        if (info.kind === "m" /* PrivateIdentifierKind.Method */) {
            return info.methodName;
        }
        if (info.kind === "a" /* PrivateIdentifierKind.Accessor */) {
            if ((0, ts_1.isGetAccessor)(node)) {
                return info.getterName;
            }
            if ((0, ts_1.isSetAccessor)(node)) {
                return info.setterName;
            }
        }
    }
    function transformAutoAccessor(node) {
        // transforms:
        //      accessor x = 1;
        // into:
        //      #x = 1;
        //      get x() { return this.#x; }
        //      set x(value) { this.#x = value; }
        var commentRange = (0, ts_1.getCommentRange)(node);
        var sourceMapRange = (0, ts_1.getSourceMapRange)(node);
        // Since we're creating two declarations where there was previously one, cache
        // the expression for any computed property names.
        var name = node.name;
        var getterName = name;
        var setterName = name;
        if ((0, ts_1.isComputedPropertyName)(name) && !(0, ts_1.isSimpleInlineableExpression)(name.expression)) {
            var cacheAssignment = (0, ts_1.findComputedPropertyNameCacheAssignment)(name);
            if (cacheAssignment) {
                getterName = factory.updateComputedPropertyName(name, (0, ts_1.visitNode)(name.expression, visitor, ts_1.isExpression));
                setterName = factory.updateComputedPropertyName(name, cacheAssignment.left);
            }
            else {
                var temp = factory.createTempVariable(hoistVariableDeclaration);
                (0, ts_1.setSourceMapRange)(temp, name.expression);
                var expression = (0, ts_1.visitNode)(name.expression, visitor, ts_1.isExpression);
                var assignment = factory.createAssignment(temp, expression);
                (0, ts_1.setSourceMapRange)(assignment, name.expression);
                getterName = factory.updateComputedPropertyName(name, assignment);
                setterName = factory.updateComputedPropertyName(name, temp);
            }
        }
        var modifiers = (0, ts_1.visitNodes)(node.modifiers, modifierVisitor, ts_1.isModifier);
        var backingField = (0, ts_1.createAccessorPropertyBackingField)(factory, node, modifiers, node.initializer);
        (0, ts_1.setOriginalNode)(backingField, node);
        (0, ts_1.setEmitFlags)(backingField, 3072 /* EmitFlags.NoComments */);
        (0, ts_1.setSourceMapRange)(backingField, sourceMapRange);
        var getter = (0, ts_1.createAccessorPropertyGetRedirector)(factory, node, modifiers, getterName);
        (0, ts_1.setOriginalNode)(getter, node);
        (0, ts_1.setCommentRange)(getter, commentRange);
        (0, ts_1.setSourceMapRange)(getter, sourceMapRange);
        var setter = (0, ts_1.createAccessorPropertySetRedirector)(factory, node, modifiers, setterName);
        (0, ts_1.setOriginalNode)(setter, node);
        (0, ts_1.setEmitFlags)(setter, 3072 /* EmitFlags.NoComments */);
        (0, ts_1.setSourceMapRange)(setter, sourceMapRange);
        return (0, ts_1.visitArray)([backingField, getter, setter], accessorFieldResultVisitor, ts_1.isClassElement);
    }
    function transformPrivateFieldInitializer(node) {
        if (shouldTransformClassElementToWeakMap(node)) {
            // If we are transforming private elements into WeakMap/WeakSet, we should elide the node.
            var info = accessPrivateIdentifier(node.name);
            ts_1.Debug.assert(info, "Undeclared private name for property declaration.");
            // Leave invalid code untransformed
            if (!info.isValid) {
                return node;
            }
            // If we encounter a valid private static field and we're not transforming
            // class static blocks, initialize it
            if (info.isStatic && !shouldTransformPrivateElementsOrClassStaticBlocks) {
                // TODO: fix
                var statement = transformPropertyOrClassStaticBlock(node, factory.createThis());
                if (statement) {
                    return factory.createClassStaticBlockDeclaration(factory.createBlock([statement], /*multiLine*/ true));
                }
            }
            return undefined;
        }
        if (shouldTransformInitializersUsingSet && !(0, ts_1.isStatic)(node) && (lexicalEnvironment === null || lexicalEnvironment === void 0 ? void 0 : lexicalEnvironment.data) && lexicalEnvironment.data.facts & 16 /* ClassFacts.WillHoistInitializersToConstructor */) {
            // If we are transforming initializers using Set semantics we will elide the initializer as it will
            // be moved to the constructor to preserve evaluation order next to public instance fields. We don't
            // need to do this transformation for private static fields since public static fields can be
            // transformed into `static {}` blocks.
            return factory.updatePropertyDeclaration(node, (0, ts_1.visitNodes)(node.modifiers, visitor, ts_1.isModifierLike), node.name, 
            /*questionOrExclamationToken*/ undefined, 
            /*type*/ undefined, 
            /*initializer*/ undefined);
        }
        if ((0, ts_1.isNamedEvaluation)(node, isAnonymousClassNeedingAssignedName)) {
            var _a = visitReferencedPropertyName(node.name), referencedName_2 = _a.referencedName, name_5 = _a.name;
            return factory.updatePropertyDeclaration(node, (0, ts_1.visitNodes)(node.modifiers, modifierVisitor, ts_1.isModifier), name_5, 
            /*questionOrExclamationToken*/ undefined, 
            /*type*/ undefined, (0, ts_1.visitNode)(node.initializer, function (child) { return namedEvaluationVisitor(child, referencedName_2); }, ts_1.isExpression));
        }
        return factory.updatePropertyDeclaration(node, (0, ts_1.visitNodes)(node.modifiers, modifierVisitor, ts_1.isModifier), (0, ts_1.visitNode)(node.name, propertyNameVisitor, ts_1.isPropertyName), 
        /*questionOrExclamationToken*/ undefined, 
        /*type*/ undefined, (0, ts_1.visitNode)(node.initializer, visitor, ts_1.isExpression));
    }
    function transformPublicFieldInitializer(node) {
        var _a;
        if (shouldTransformInitializers && !(0, ts_1.isAutoAccessorPropertyDeclaration)(node)) {
            // Create a temporary variable to store a computed property name (if necessary).
            // If it's not inlineable, then we emit an expression after the class which assigns
            // the property name to the temporary variable.
            var expr = getPropertyNameExpressionIfNeeded(node.name, 
            /*shouldHoist*/ !!node.initializer || useDefineForClassFields, 
            /*captureReferencedName*/ (0, ts_1.isNamedEvaluation)(node, isAnonymousClassNeedingAssignedName));
            if (expr) {
                (_a = getPendingExpressions()).push.apply(_a, (0, ts_1.flattenCommaList)(expr));
            }
            if ((0, ts_1.isStatic)(node) && !shouldTransformPrivateElementsOrClassStaticBlocks) {
                var initializerStatement = transformPropertyOrClassStaticBlock(node, factory.createThis());
                if (initializerStatement) {
                    var staticBlock = factory.createClassStaticBlockDeclaration(factory.createBlock([initializerStatement]));
                    (0, ts_1.setOriginalNode)(staticBlock, node);
                    (0, ts_1.setCommentRange)(staticBlock, node);
                    // Set the comment range for the statement to an empty synthetic range
                    // and drop synthetic comments from the statement to avoid printing them twice.
                    (0, ts_1.setCommentRange)(initializerStatement, { pos: -1, end: -1 });
                    (0, ts_1.setSyntheticLeadingComments)(initializerStatement, undefined);
                    (0, ts_1.setSyntheticTrailingComments)(initializerStatement, undefined);
                    return staticBlock;
                }
            }
            return undefined;
        }
        return factory.updatePropertyDeclaration(node, (0, ts_1.visitNodes)(node.modifiers, modifierVisitor, ts_1.isModifier), (0, ts_1.visitNode)(node.name, propertyNameVisitor, ts_1.isPropertyName), 
        /*questionOrExclamationToken*/ undefined, 
        /*type*/ undefined, (0, ts_1.visitNode)(node.initializer, visitor, ts_1.isExpression));
    }
    function transformFieldInitializer(node) {
        ts_1.Debug.assert(!(0, ts_1.hasDecorators)(node), "Decorators should already have been transformed and elided.");
        return (0, ts_1.isPrivateIdentifierClassElementDeclaration)(node) ?
            transformPrivateFieldInitializer(node) :
            transformPublicFieldInitializer(node);
    }
    function shouldTransformAutoAccessorsInCurrentClass() {
        return shouldTransformAutoAccessors === -1 /* Ternary.True */ ||
            shouldTransformAutoAccessors === 3 /* Ternary.Maybe */ &&
                !!(lexicalEnvironment === null || lexicalEnvironment === void 0 ? void 0 : lexicalEnvironment.data) && !!(lexicalEnvironment.data.facts & 16 /* ClassFacts.WillHoistInitializersToConstructor */);
    }
    function visitPropertyDeclaration(node) {
        // If this is an auto-accessor, we defer to `transformAutoAccessor`. That function
        // will in turn call `transformFieldInitializer` as needed.
        if ((0, ts_1.isAutoAccessorPropertyDeclaration)(node) && (shouldTransformAutoAccessorsInCurrentClass() ||
            (0, ts_1.hasStaticModifier)(node) && (0, ts_1.getInternalEmitFlags)(node) & 32 /* InternalEmitFlags.TransformPrivateStaticElements */)) {
            return transformAutoAccessor(node);
        }
        return transformFieldInitializer(node);
    }
    function shouldForceDynamicThis() {
        return !!currentClassElement &&
            (0, ts_1.hasStaticModifier)(currentClassElement) &&
            (0, ts_1.isAccessor)(currentClassElement) &&
            (0, ts_1.isAutoAccessorPropertyDeclaration)((0, ts_1.getOriginalNode)(currentClassElement));
    }
    /**
     * Prevent substitution of `this` to `_classThis` in static getters and setters that wrap `accessor` fields.
     */
    function ensureDynamicThisIfNeeded(node) {
        if (shouldForceDynamicThis()) {
            // do not substitute `this` with `_classThis` when `this`
            // should be bound dynamically.
            var innerExpression = (0, ts_1.skipOuterExpressions)(node);
            if (innerExpression.kind === 110 /* SyntaxKind.ThisKeyword */) {
                noSubstitution.add(innerExpression);
            }
        }
    }
    function createPrivateIdentifierAccess(info, receiver) {
        receiver = (0, ts_1.visitNode)(receiver, visitor, ts_1.isExpression);
        ensureDynamicThisIfNeeded(receiver);
        return createPrivateIdentifierAccessHelper(info, receiver);
    }
    function createPrivateIdentifierAccessHelper(info, receiver) {
        (0, ts_1.setCommentRange)(receiver, (0, ts_1.moveRangePos)(receiver, -1));
        switch (info.kind) {
            case "a" /* PrivateIdentifierKind.Accessor */:
                return emitHelpers().createClassPrivateFieldGetHelper(receiver, info.brandCheckIdentifier, info.kind, info.getterName);
            case "m" /* PrivateIdentifierKind.Method */:
                return emitHelpers().createClassPrivateFieldGetHelper(receiver, info.brandCheckIdentifier, info.kind, info.methodName);
            case "f" /* PrivateIdentifierKind.Field */:
                return emitHelpers().createClassPrivateFieldGetHelper(receiver, info.brandCheckIdentifier, info.kind, info.isStatic ? info.variableName : undefined);
            case "untransformed":
                return ts_1.Debug.fail("Access helpers should not be created for untransformed private elements");
            default:
                ts_1.Debug.assertNever(info, "Unknown private element type");
        }
    }
    function visitPropertyAccessExpression(node) {
        if ((0, ts_1.isPrivateIdentifier)(node.name)) {
            var privateIdentifierInfo = accessPrivateIdentifier(node.name);
            if (privateIdentifierInfo) {
                return (0, ts_1.setTextRange)((0, ts_1.setOriginalNode)(createPrivateIdentifierAccess(privateIdentifierInfo, node.expression), node), node);
            }
        }
        if (shouldTransformSuperInStaticInitializers &&
            currentClassElement &&
            (0, ts_1.isSuperProperty)(node) &&
            (0, ts_1.isIdentifier)(node.name) &&
            isStaticPropertyDeclarationOrClassStaticBlock(currentClassElement) &&
            (lexicalEnvironment === null || lexicalEnvironment === void 0 ? void 0 : lexicalEnvironment.data)) {
            var _a = lexicalEnvironment.data, classConstructor = _a.classConstructor, superClassReference = _a.superClassReference, facts = _a.facts;
            if (facts & 1 /* ClassFacts.ClassWasDecorated */) {
                return visitInvalidSuperProperty(node);
            }
            if (classConstructor && superClassReference) {
                // converts `super.x` into `Reflect.get(_baseTemp, "x", _classTemp)`
                var superProperty = factory.createReflectGetCall(superClassReference, factory.createStringLiteralFromNode(node.name), classConstructor);
                (0, ts_1.setOriginalNode)(superProperty, node.expression);
                (0, ts_1.setTextRange)(superProperty, node.expression);
                return superProperty;
            }
        }
        return (0, ts_1.visitEachChild)(node, visitor, context);
    }
    function visitElementAccessExpression(node) {
        if (shouldTransformSuperInStaticInitializers &&
            currentClassElement &&
            (0, ts_1.isSuperProperty)(node) &&
            isStaticPropertyDeclarationOrClassStaticBlock(currentClassElement) &&
            (lexicalEnvironment === null || lexicalEnvironment === void 0 ? void 0 : lexicalEnvironment.data)) {
            var _a = lexicalEnvironment.data, classConstructor = _a.classConstructor, superClassReference = _a.superClassReference, facts = _a.facts;
            if (facts & 1 /* ClassFacts.ClassWasDecorated */) {
                return visitInvalidSuperProperty(node);
            }
            if (classConstructor && superClassReference) {
                // converts `super[x]` into `Reflect.get(_baseTemp, x, _classTemp)`
                var superProperty = factory.createReflectGetCall(superClassReference, (0, ts_1.visitNode)(node.argumentExpression, visitor, ts_1.isExpression), classConstructor);
                (0, ts_1.setOriginalNode)(superProperty, node.expression);
                (0, ts_1.setTextRange)(superProperty, node.expression);
                return superProperty;
            }
        }
        return (0, ts_1.visitEachChild)(node, visitor, context);
    }
    function visitPreOrPostfixUnaryExpression(node, discarded) {
        if (node.operator === 46 /* SyntaxKind.PlusPlusToken */ ||
            node.operator === 47 /* SyntaxKind.MinusMinusToken */) {
            var operand = (0, ts_1.skipParentheses)(node.operand);
            if ((0, ts_1.isPrivateIdentifierPropertyAccessExpression)(operand)) {
                var info = void 0;
                if (info = accessPrivateIdentifier(operand.name)) {
                    var receiver = (0, ts_1.visitNode)(operand.expression, visitor, ts_1.isExpression);
                    ensureDynamicThisIfNeeded(receiver);
                    var _a = createCopiableReceiverExpr(receiver), readExpression = _a.readExpression, initializeExpression = _a.initializeExpression;
                    var expression = createPrivateIdentifierAccess(info, readExpression);
                    var temp = (0, ts_1.isPrefixUnaryExpression)(node) || discarded ? undefined : factory.createTempVariable(hoistVariableDeclaration);
                    expression = (0, ts_1.expandPreOrPostfixIncrementOrDecrementExpression)(factory, node, expression, hoistVariableDeclaration, temp);
                    expression = createPrivateIdentifierAssignment(info, initializeExpression || readExpression, expression, 64 /* SyntaxKind.EqualsToken */);
                    (0, ts_1.setOriginalNode)(expression, node);
                    (0, ts_1.setTextRange)(expression, node);
                    if (temp) {
                        expression = factory.createComma(expression, temp);
                        (0, ts_1.setTextRange)(expression, node);
                    }
                    return expression;
                }
            }
            else if (shouldTransformSuperInStaticInitializers &&
                currentClassElement &&
                (0, ts_1.isSuperProperty)(operand) &&
                isStaticPropertyDeclarationOrClassStaticBlock(currentClassElement) &&
                (lexicalEnvironment === null || lexicalEnvironment === void 0 ? void 0 : lexicalEnvironment.data)) {
                // converts `++super.a` into `(Reflect.set(_baseTemp, "a", (_a = Reflect.get(_baseTemp, "a", _classTemp), _b = ++_a), _classTemp), _b)`
                // converts `++super[f()]` into `(Reflect.set(_baseTemp, _a = f(), (_b = Reflect.get(_baseTemp, _a, _classTemp), _c = ++_b), _classTemp), _c)`
                // converts `--super.a` into `(Reflect.set(_baseTemp, "a", (_a = Reflect.get(_baseTemp, "a", _classTemp), _b = --_a), _classTemp), _b)`
                // converts `--super[f()]` into `(Reflect.set(_baseTemp, _a = f(), (_b = Reflect.get(_baseTemp, _a, _classTemp), _c = --_b), _classTemp), _c)`
                // converts `super.a++` into `(Reflect.set(_baseTemp, "a", (_a = Reflect.get(_baseTemp, "a", _classTemp), _b = _a++), _classTemp), _b)`
                // converts `super[f()]++` into `(Reflect.set(_baseTemp, _a = f(), (_b = Reflect.get(_baseTemp, _a, _classTemp), _c = _b++), _classTemp), _c)`
                // converts `super.a--` into `(Reflect.set(_baseTemp, "a", (_a = Reflect.get(_baseTemp, "a", _classTemp), _b = _a--), _classTemp), _b)`
                // converts `super[f()]--` into `(Reflect.set(_baseTemp, _a = f(), (_b = Reflect.get(_baseTemp, _a, _classTemp), _c = _b--), _classTemp), _c)`
                var _b = lexicalEnvironment.data, classConstructor = _b.classConstructor, superClassReference = _b.superClassReference, facts = _b.facts;
                if (facts & 1 /* ClassFacts.ClassWasDecorated */) {
                    var expression = visitInvalidSuperProperty(operand);
                    return (0, ts_1.isPrefixUnaryExpression)(node) ?
                        factory.updatePrefixUnaryExpression(node, expression) :
                        factory.updatePostfixUnaryExpression(node, expression);
                }
                if (classConstructor && superClassReference) {
                    var setterName = void 0;
                    var getterName = void 0;
                    if ((0, ts_1.isPropertyAccessExpression)(operand)) {
                        if ((0, ts_1.isIdentifier)(operand.name)) {
                            getterName = setterName = factory.createStringLiteralFromNode(operand.name);
                        }
                    }
                    else {
                        if ((0, ts_1.isSimpleInlineableExpression)(operand.argumentExpression)) {
                            getterName = setterName = operand.argumentExpression;
                        }
                        else {
                            getterName = factory.createTempVariable(hoistVariableDeclaration);
                            setterName = factory.createAssignment(getterName, (0, ts_1.visitNode)(operand.argumentExpression, visitor, ts_1.isExpression));
                        }
                    }
                    if (setterName && getterName) {
                        var expression = factory.createReflectGetCall(superClassReference, getterName, classConstructor);
                        (0, ts_1.setTextRange)(expression, operand);
                        var temp = discarded ? undefined : factory.createTempVariable(hoistVariableDeclaration);
                        expression = (0, ts_1.expandPreOrPostfixIncrementOrDecrementExpression)(factory, node, expression, hoistVariableDeclaration, temp);
                        expression = factory.createReflectSetCall(superClassReference, setterName, expression, classConstructor);
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
        }
        return (0, ts_1.visitEachChild)(node, visitor, context);
    }
    function visitForStatement(node) {
        return factory.updateForStatement(node, (0, ts_1.visitNode)(node.initializer, discardedValueVisitor, ts_1.isForInitializer), (0, ts_1.visitNode)(node.condition, visitor, ts_1.isExpression), (0, ts_1.visitNode)(node.incrementor, discardedValueVisitor, ts_1.isExpression), (0, ts_1.visitIterationBody)(node.statement, visitor, context));
    }
    function visitExpressionStatement(node) {
        return factory.updateExpressionStatement(node, (0, ts_1.visitNode)(node.expression, discardedValueVisitor, ts_1.isExpression));
    }
    function createCopiableReceiverExpr(receiver) {
        var clone = (0, ts_1.nodeIsSynthesized)(receiver) ? receiver : factory.cloneNode(receiver);
        if (receiver.kind === 110 /* SyntaxKind.ThisKeyword */ && noSubstitution.has(receiver)) {
            noSubstitution.add(clone);
        }
        if ((0, ts_1.isSimpleInlineableExpression)(receiver)) {
            return { readExpression: clone, initializeExpression: undefined };
        }
        var readExpression = factory.createTempVariable(hoistVariableDeclaration);
        var initializeExpression = factory.createAssignment(readExpression, clone);
        return { readExpression: readExpression, initializeExpression: initializeExpression };
    }
    function visitCallExpression(node) {
        var _a;
        if ((0, ts_1.isPrivateIdentifierPropertyAccessExpression)(node.expression) &&
            accessPrivateIdentifier(node.expression.name)) {
            // obj.#x()
            // Transform call expressions of private names to properly bind the `this` parameter.
            var _b = factory.createCallBinding(node.expression, hoistVariableDeclaration, languageVersion), thisArg = _b.thisArg, target = _b.target;
            if ((0, ts_1.isCallChain)(node)) {
                return factory.updateCallChain(node, factory.createPropertyAccessChain((0, ts_1.visitNode)(target, visitor, ts_1.isExpression), node.questionDotToken, "call"), 
                /*questionDotToken*/ undefined, 
                /*typeArguments*/ undefined, __spreadArray([(0, ts_1.visitNode)(thisArg, visitor, ts_1.isExpression)], (0, ts_1.visitNodes)(node.arguments, visitor, ts_1.isExpression), true));
            }
            return factory.updateCallExpression(node, factory.createPropertyAccessExpression((0, ts_1.visitNode)(target, visitor, ts_1.isExpression), "call"), 
            /*typeArguments*/ undefined, __spreadArray([(0, ts_1.visitNode)(thisArg, visitor, ts_1.isExpression)], (0, ts_1.visitNodes)(node.arguments, visitor, ts_1.isExpression), true));
        }
        if (shouldTransformSuperInStaticInitializers &&
            currentClassElement &&
            (0, ts_1.isSuperProperty)(node.expression) &&
            isStaticPropertyDeclarationOrClassStaticBlock(currentClassElement) &&
            ((_a = lexicalEnvironment === null || lexicalEnvironment === void 0 ? void 0 : lexicalEnvironment.data) === null || _a === void 0 ? void 0 : _a.classConstructor)) {
            // super.x()
            // super[x]()
            // converts `super.f(...)` into `Reflect.get(_baseTemp, "f", _classTemp).call(_classTemp, ...)`
            var invocation = factory.createFunctionCallCall((0, ts_1.visitNode)(node.expression, visitor, ts_1.isExpression), lexicalEnvironment.data.classConstructor, (0, ts_1.visitNodes)(node.arguments, visitor, ts_1.isExpression));
            (0, ts_1.setOriginalNode)(invocation, node);
            (0, ts_1.setTextRange)(invocation, node);
            return invocation;
        }
        return (0, ts_1.visitEachChild)(node, visitor, context);
    }
    function visitTaggedTemplateExpression(node) {
        var _a;
        if ((0, ts_1.isPrivateIdentifierPropertyAccessExpression)(node.tag) &&
            accessPrivateIdentifier(node.tag.name)) {
            // Bind the `this` correctly for tagged template literals when the tag is a private identifier property access.
            var _b = factory.createCallBinding(node.tag, hoistVariableDeclaration, languageVersion), thisArg = _b.thisArg, target = _b.target;
            return factory.updateTaggedTemplateExpression(node, factory.createCallExpression(factory.createPropertyAccessExpression((0, ts_1.visitNode)(target, visitor, ts_1.isExpression), "bind"), 
            /*typeArguments*/ undefined, [(0, ts_1.visitNode)(thisArg, visitor, ts_1.isExpression)]), 
            /*typeArguments*/ undefined, (0, ts_1.visitNode)(node.template, visitor, ts_1.isTemplateLiteral));
        }
        if (shouldTransformSuperInStaticInitializers &&
            currentClassElement &&
            (0, ts_1.isSuperProperty)(node.tag) &&
            isStaticPropertyDeclarationOrClassStaticBlock(currentClassElement) &&
            ((_a = lexicalEnvironment === null || lexicalEnvironment === void 0 ? void 0 : lexicalEnvironment.data) === null || _a === void 0 ? void 0 : _a.classConstructor)) {
            // converts `` super.f`x` `` into `` Reflect.get(_baseTemp, "f", _classTemp).bind(_classTemp)`x` ``
            var invocation = factory.createFunctionBindCall((0, ts_1.visitNode)(node.tag, visitor, ts_1.isExpression), lexicalEnvironment.data.classConstructor, []);
            (0, ts_1.setOriginalNode)(invocation, node);
            (0, ts_1.setTextRange)(invocation, node);
            return factory.updateTaggedTemplateExpression(node, invocation, 
            /*typeArguments*/ undefined, (0, ts_1.visitNode)(node.template, visitor, ts_1.isTemplateLiteral));
        }
        return (0, ts_1.visitEachChild)(node, visitor, context);
    }
    function transformClassStaticBlockDeclaration(node) {
        if (lexicalEnvironment) {
            lexicalEnvironmentMap.set((0, ts_1.getOriginalNode)(node), lexicalEnvironment);
        }
        if (shouldTransformPrivateElementsOrClassStaticBlocks) {
            startLexicalEnvironment();
            var statements = setCurrentClassElementAnd(node, function (statements) { return (0, ts_1.visitNodes)(statements, visitor, ts_1.isStatement); }, node.body.statements);
            statements = factory.mergeLexicalEnvironment(statements, endLexicalEnvironment());
            var iife = factory.createImmediatelyInvokedArrowFunction(statements);
            (0, ts_1.setOriginalNode)(iife, node);
            (0, ts_1.setTextRange)(iife, node);
            (0, ts_1.addEmitFlags)(iife, 4 /* EmitFlags.AdviseOnEmitNode */);
            return iife;
        }
    }
    function isAnonymousClassNeedingAssignedName(node) {
        if ((0, ts_1.isClassExpression)(node) && !node.name) {
            var staticPropertiesOrClassStaticBlocks = (0, ts_1.getStaticPropertiesAndClassStaticBlock)(node);
            var classStaticBlock = (0, ts_1.find)(staticPropertiesOrClassStaticBlocks, ts_1.isClassStaticBlockDeclaration);
            if (classStaticBlock) {
                for (var _i = 0, _a = classStaticBlock.body.statements; _i < _a.length; _i++) {
                    var statement = _a[_i];
                    if ((0, ts_1.isExpressionStatement)(statement) &&
                        (0, ts_1.isCallToHelper)(statement.expression, "___setFunctionName")) {
                        return false;
                    }
                }
            }
            var hasTransformableStatics = (shouldTransformPrivateElementsOrClassStaticBlocks ||
                !!((0, ts_1.getInternalEmitFlags)(node) && 32 /* InternalEmitFlags.TransformPrivateStaticElements */)) &&
                (0, ts_1.some)(staticPropertiesOrClassStaticBlocks, function (node) {
                    return (0, ts_1.isClassStaticBlockDeclaration)(node) ||
                        (0, ts_1.isPrivateIdentifierClassElementDeclaration)(node) ||
                        shouldTransformInitializers && (0, ts_1.isInitializedProperty)(node);
                });
            return hasTransformableStatics;
        }
        return false;
    }
    function visitBinaryExpression(node, discarded) {
        if ((0, ts_1.isDestructuringAssignment)(node)) {
            // ({ x: obj.#x } = ...)
            // ({ x: super.x } = ...)
            // ({ x: super[x] } = ...)
            var savedPendingExpressions = pendingExpressions;
            pendingExpressions = undefined;
            node = factory.updateBinaryExpression(node, (0, ts_1.visitNode)(node.left, assignmentTargetVisitor, ts_1.isExpression), node.operatorToken, (0, ts_1.visitNode)(node.right, visitor, ts_1.isExpression));
            var expr = (0, ts_1.some)(pendingExpressions) ?
                factory.inlineExpressions((0, ts_1.compact)(__spreadArray(__spreadArray([], pendingExpressions, true), [node], false))) :
                node;
            pendingExpressions = savedPendingExpressions;
            return expr;
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
                var assignedName_5 = getAssignedNameOfIdentifier(node.left, node.right);
                var left_1 = (0, ts_1.visitNode)(node.left, visitor, ts_1.isExpression);
                var right = (0, ts_1.visitNode)(node.right, function (node) { return namedEvaluationVisitor(node, assignedName_5); }, ts_1.isExpression);
                return factory.updateBinaryExpression(node, left_1, node.operatorToken, right);
            }
            var left = (0, ts_1.skipOuterExpressions)(node.left, 8 /* OuterExpressionKinds.PartiallyEmittedExpressions */ | 1 /* OuterExpressionKinds.Parentheses */);
            if ((0, ts_1.isPrivateIdentifierPropertyAccessExpression)(left)) {
                // obj.#x = ...
                var info = accessPrivateIdentifier(left.name);
                if (info) {
                    return (0, ts_1.setTextRange)((0, ts_1.setOriginalNode)(createPrivateIdentifierAssignment(info, left.expression, node.right, node.operatorToken.kind), node), node);
                }
            }
            else if (shouldTransformSuperInStaticInitializers &&
                currentClassElement &&
                (0, ts_1.isSuperProperty)(node.left) &&
                isStaticPropertyDeclarationOrClassStaticBlock(currentClassElement) &&
                (lexicalEnvironment === null || lexicalEnvironment === void 0 ? void 0 : lexicalEnvironment.data)) {
                // super.x = ...
                // super[x] = ...
                // super.x += ...
                // super.x -= ...
                var _a = lexicalEnvironment.data, classConstructor = _a.classConstructor, superClassReference = _a.superClassReference, facts = _a.facts;
                if (facts & 1 /* ClassFacts.ClassWasDecorated */) {
                    return factory.updateBinaryExpression(node, visitInvalidSuperProperty(node.left), node.operatorToken, (0, ts_1.visitNode)(node.right, visitor, ts_1.isExpression));
                }
                if (classConstructor && superClassReference) {
                    var setterName = (0, ts_1.isElementAccessExpression)(node.left) ? (0, ts_1.visitNode)(node.left.argumentExpression, visitor, ts_1.isExpression) :
                        (0, ts_1.isIdentifier)(node.left.name) ? factory.createStringLiteralFromNode(node.left.name) :
                            undefined;
                    if (setterName) {
                        // converts `super.x = 1` into `(Reflect.set(_baseTemp, "x", _a = 1, _classTemp), _a)`
                        // converts `super[f()] = 1` into `(Reflect.set(_baseTemp, f(), _a = 1, _classTemp), _a)`
                        // converts `super.x += 1` into `(Reflect.set(_baseTemp, "x", _a = Reflect.get(_baseTemp, "x", _classtemp) + 1, _classTemp), _a)`
                        // converts `super[f()] += 1` into `(Reflect.set(_baseTemp, _a = f(), _b = Reflect.get(_baseTemp, _a, _classtemp) + 1, _classTemp), _b)`
                        var expression = (0, ts_1.visitNode)(node.right, visitor, ts_1.isExpression);
                        if ((0, ts_1.isCompoundAssignment)(node.operatorToken.kind)) {
                            var getterName = setterName;
                            if (!(0, ts_1.isSimpleInlineableExpression)(setterName)) {
                                getterName = factory.createTempVariable(hoistVariableDeclaration);
                                setterName = factory.createAssignment(getterName, setterName);
                            }
                            var superPropertyGet = factory.createReflectGetCall(superClassReference, getterName, classConstructor);
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
                        expression = factory.createReflectSetCall(superClassReference, setterName, expression, classConstructor);
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
        }
        if (isPrivateIdentifierInExpression(node)) {
            // #x in obj
            return transformPrivateIdentifierInInExpression(node);
        }
        return (0, ts_1.visitEachChild)(node, visitor, context);
    }
    function visitCommaListExpression(node, discarded) {
        var elements = discarded ?
            (0, ts_1.visitCommaListElements)(node.elements, discardedValueVisitor) :
            (0, ts_1.visitCommaListElements)(node.elements, visitor, discardedValueVisitor);
        return factory.updateCommaListExpression(node, elements);
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
    function visitReferencedPropertyName(node) {
        if ((0, ts_1.isPropertyNameLiteral)(node) || (0, ts_1.isPrivateIdentifier)(node)) {
            var referencedName_3 = factory.createStringLiteralFromNode(node);
            var name_6 = (0, ts_1.visitNode)(node, visitor, ts_1.isPropertyName);
            return { referencedName: referencedName_3, name: name_6 };
        }
        if ((0, ts_1.isPropertyNameLiteral)(node.expression) && !(0, ts_1.isIdentifier)(node.expression)) {
            var referencedName_4 = factory.createStringLiteralFromNode(node.expression);
            var name_7 = (0, ts_1.visitNode)(node, visitor, ts_1.isPropertyName);
            return { referencedName: referencedName_4, name: name_7 };
        }
        var referencedName = factory.createTempVariable(hoistVariableDeclaration);
        var key = emitHelpers().createPropKeyHelper((0, ts_1.visitNode)(node.expression, visitor, ts_1.isExpression));
        var assignment = factory.createAssignment(referencedName, key);
        var name = factory.updateComputedPropertyName(node, injectPendingExpressions(assignment));
        return { referencedName: referencedName, name: name };
    }
    function createPrivateIdentifierAssignment(info, receiver, right, operator) {
        receiver = (0, ts_1.visitNode)(receiver, visitor, ts_1.isExpression);
        right = (0, ts_1.visitNode)(right, visitor, ts_1.isExpression);
        ensureDynamicThisIfNeeded(receiver);
        if ((0, ts_1.isCompoundAssignment)(operator)) {
            var _a = createCopiableReceiverExpr(receiver), readExpression = _a.readExpression, initializeExpression = _a.initializeExpression;
            receiver = initializeExpression || readExpression;
            right = factory.createBinaryExpression(createPrivateIdentifierAccessHelper(info, readExpression), (0, ts_1.getNonAssignmentOperatorForCompoundAssignment)(operator), right);
        }
        (0, ts_1.setCommentRange)(receiver, (0, ts_1.moveRangePos)(receiver, -1));
        switch (info.kind) {
            case "a" /* PrivateIdentifierKind.Accessor */:
                return emitHelpers().createClassPrivateFieldSetHelper(receiver, info.brandCheckIdentifier, right, info.kind, info.setterName);
            case "m" /* PrivateIdentifierKind.Method */:
                return emitHelpers().createClassPrivateFieldSetHelper(receiver, info.brandCheckIdentifier, right, info.kind, 
                /*f*/ undefined);
            case "f" /* PrivateIdentifierKind.Field */:
                return emitHelpers().createClassPrivateFieldSetHelper(receiver, info.brandCheckIdentifier, right, info.kind, info.isStatic ? info.variableName : undefined);
            case "untransformed":
                return ts_1.Debug.fail("Access helpers should not be created for untransformed private elements");
            default:
                ts_1.Debug.assertNever(info, "Unknown private element type");
        }
    }
    function getPrivateInstanceMethodsAndAccessors(node) {
        return (0, ts_1.filter)(node.members, ts_1.isNonStaticMethodOrAccessorWithPrivateName);
    }
    function getClassFacts(node) {
        var facts = 0 /* ClassFacts.None */;
        var original = (0, ts_1.getOriginalNode)(node);
        if ((0, ts_1.isClassDeclaration)(original) && (0, ts_1.classOrConstructorParameterIsDecorated)(legacyDecorators, original)) {
            facts |= 1 /* ClassFacts.ClassWasDecorated */;
        }
        var containsPublicInstanceFields = false;
        var containsInitializedPublicInstanceFields = false;
        var containsInstancePrivateElements = false;
        var containsInstanceAutoAccessors = false;
        for (var _i = 0, _a = node.members; _i < _a.length; _i++) {
            var member = _a[_i];
            if ((0, ts_1.isStatic)(member)) {
                if (member.name &&
                    ((0, ts_1.isPrivateIdentifier)(member.name) || (0, ts_1.isAutoAccessorPropertyDeclaration)(member)) &&
                    shouldTransformPrivateElementsOrClassStaticBlocks) {
                    facts |= 2 /* ClassFacts.NeedsClassConstructorReference */;
                }
                if ((0, ts_1.isPropertyDeclaration)(member) || (0, ts_1.isClassStaticBlockDeclaration)(member)) {
                    if (shouldTransformThisInStaticInitializers && member.transformFlags & 16384 /* TransformFlags.ContainsLexicalThis */) {
                        facts |= 8 /* ClassFacts.NeedsSubstitutionForThisInClassStaticField */;
                        if (!(facts & 1 /* ClassFacts.ClassWasDecorated */)) {
                            facts |= 2 /* ClassFacts.NeedsClassConstructorReference */;
                        }
                    }
                    if (shouldTransformSuperInStaticInitializers && member.transformFlags & 134217728 /* TransformFlags.ContainsLexicalSuper */) {
                        if (!(facts & 1 /* ClassFacts.ClassWasDecorated */)) {
                            facts |= 2 /* ClassFacts.NeedsClassConstructorReference */ | 4 /* ClassFacts.NeedsClassSuperReference */;
                        }
                    }
                }
            }
            else if (!(0, ts_1.hasAbstractModifier)((0, ts_1.getOriginalNode)(member))) {
                if ((0, ts_1.isAutoAccessorPropertyDeclaration)(member)) {
                    containsInstanceAutoAccessors = true;
                    containsInstancePrivateElements || (containsInstancePrivateElements = (0, ts_1.isPrivateIdentifierClassElementDeclaration)(member));
                }
                else if ((0, ts_1.isPrivateIdentifierClassElementDeclaration)(member)) {
                    containsInstancePrivateElements = true;
                }
                else if ((0, ts_1.isPropertyDeclaration)(member)) {
                    containsPublicInstanceFields = true;
                    containsInitializedPublicInstanceFields || (containsInitializedPublicInstanceFields = !!member.initializer);
                }
            }
        }
        var willHoistInitializersToConstructor = shouldTransformInitializersUsingDefine && containsPublicInstanceFields ||
            shouldTransformInitializersUsingSet && containsInitializedPublicInstanceFields ||
            shouldTransformPrivateElementsOrClassStaticBlocks && containsInstancePrivateElements ||
            shouldTransformPrivateElementsOrClassStaticBlocks && containsInstanceAutoAccessors && shouldTransformAutoAccessors === -1 /* Ternary.True */;
        if (willHoistInitializersToConstructor) {
            facts |= 16 /* ClassFacts.WillHoistInitializersToConstructor */;
        }
        return facts;
    }
    function visitExpressionWithTypeArgumentsInHeritageClause(node) {
        var _a;
        var facts = ((_a = lexicalEnvironment === null || lexicalEnvironment === void 0 ? void 0 : lexicalEnvironment.data) === null || _a === void 0 ? void 0 : _a.facts) || 0 /* ClassFacts.None */;
        if (facts & 4 /* ClassFacts.NeedsClassSuperReference */) {
            var temp = factory.createTempVariable(hoistVariableDeclaration, /*reservedInNestedScopes*/ true);
            getClassLexicalEnvironment().superClassReference = temp;
            return factory.updateExpressionWithTypeArguments(node, factory.createAssignment(temp, (0, ts_1.visitNode)(node.expression, visitor, ts_1.isExpression)), 
            /*typeArguments*/ undefined);
        }
        return (0, ts_1.visitEachChild)(node, visitor, context);
    }
    function visitInNewClassLexicalEnvironment(node, referencedName, visitor) {
        var savedCurrentClassContainer = currentClassContainer;
        var savedPendingExpressions = pendingExpressions;
        var savedLexicalEnvironment = lexicalEnvironment;
        currentClassContainer = node;
        pendingExpressions = undefined;
        startClassLexicalEnvironment();
        var shouldAlwaysTransformPrivateStaticElements = (0, ts_1.getInternalEmitFlags)(node) & 32 /* InternalEmitFlags.TransformPrivateStaticElements */;
        if (shouldTransformPrivateElementsOrClassStaticBlocks || shouldAlwaysTransformPrivateStaticElements) {
            var name_8 = (0, ts_1.getNameOfDeclaration)(node);
            if (name_8 && (0, ts_1.isIdentifier)(name_8)) {
                getPrivateIdentifierEnvironment().data.className = name_8;
            }
        }
        if (shouldTransformPrivateElementsOrClassStaticBlocks) {
            var privateInstanceMethodsAndAccessors = getPrivateInstanceMethodsAndAccessors(node);
            if ((0, ts_1.some)(privateInstanceMethodsAndAccessors)) {
                getPrivateIdentifierEnvironment().data.weakSetName = createHoistedVariableForClass("instances", privateInstanceMethodsAndAccessors[0].name);
            }
        }
        var facts = getClassFacts(node);
        if (facts) {
            getClassLexicalEnvironment().facts = facts;
        }
        if (facts & 8 /* ClassFacts.NeedsSubstitutionForThisInClassStaticField */) {
            enableSubstitutionForClassStaticThisOrSuperReference();
        }
        var result = visitor(node, facts, referencedName);
        endClassLexicalEnvironment();
        ts_1.Debug.assert(lexicalEnvironment === savedLexicalEnvironment);
        currentClassContainer = savedCurrentClassContainer;
        pendingExpressions = savedPendingExpressions;
        return result;
    }
    function visitClassDeclaration(node) {
        return visitInNewClassLexicalEnvironment(node, /*referencedName*/ undefined, visitClassDeclarationInNewClassLexicalEnvironment);
    }
    function visitClassDeclarationInNewClassLexicalEnvironment(node, facts) {
        var _a, _b;
        // If a class has private static fields, or a static field has a `this` or `super` reference,
        // then we need to allocate a temp variable to hold on to that reference.
        var pendingClassReferenceAssignment;
        if (facts & 2 /* ClassFacts.NeedsClassConstructorReference */) {
            // If we aren't transforming class static blocks, then we can't reuse `_classThis` since in
            // `class C { ... static { _classThis = ... } }; _classThis = C` the outer assignment would occur *after*
            // class static blocks evaluate and would overwrite the replacement constructor produced by class
            // decorators.
            // If we are transforming class static blocks, then we can reuse `_classThis` since the assignment
            // will be evaluated *before* the transformed static blocks are evaluated and thus won't overwrite
            // the replacement constructor.
            if (shouldTransformPrivateElementsOrClassStaticBlocks && ((_a = node.emitNode) === null || _a === void 0 ? void 0 : _a.classThis)) {
                getClassLexicalEnvironment().classConstructor = node.emitNode.classThis;
                pendingClassReferenceAssignment = factory.createAssignment(node.emitNode.classThis, factory.getInternalName(node));
            }
            else {
                var temp = factory.createTempVariable(hoistVariableDeclaration, /*reservedInNestedScopes*/ true);
                getClassLexicalEnvironment().classConstructor = factory.cloneNode(temp);
                pendingClassReferenceAssignment = factory.createAssignment(temp, factory.getInternalName(node));
            }
            if ((_b = node.emitNode) === null || _b === void 0 ? void 0 : _b.classThis) {
                getClassLexicalEnvironment().classThis = node.emitNode.classThis;
            }
        }
        var isExport = (0, ts_1.hasSyntacticModifier)(node, 1 /* ModifierFlags.Export */);
        var isDefault = (0, ts_1.hasSyntacticModifier)(node, 1024 /* ModifierFlags.Default */);
        var modifiers = (0, ts_1.visitNodes)(node.modifiers, modifierVisitor, ts_1.isModifier);
        var heritageClauses = (0, ts_1.visitNodes)(node.heritageClauses, heritageClauseVisitor, ts_1.isHeritageClause);
        var _c = transformClassMembers(node), members = _c.members, prologue = _c.prologue;
        var statements = [];
        if (pendingClassReferenceAssignment) {
            getPendingExpressions().unshift(pendingClassReferenceAssignment);
        }
        // Write any pending expressions from elided or moved computed property names
        if ((0, ts_1.some)(pendingExpressions)) {
            statements.push(factory.createExpressionStatement(factory.inlineExpressions(pendingExpressions)));
        }
        if (shouldTransformInitializersUsingSet || shouldTransformPrivateElementsOrClassStaticBlocks || (0, ts_1.getInternalEmitFlags)(node) & 32 /* InternalEmitFlags.TransformPrivateStaticElements */) {
            // Emit static property assignment. Because classDeclaration is lexically evaluated,
            // it is safe to emit static property assignment after classDeclaration
            // From ES6 specification:
            //      HasLexicalDeclaration (N) : Determines if the argument identifier has a binding in this environment record that was created using
            //                                  a lexical declaration such as a LexicalDeclaration or a ClassDeclaration.
            var staticProperties = (0, ts_1.getStaticPropertiesAndClassStaticBlock)(node);
            if ((0, ts_1.some)(staticProperties)) {
                addPropertyOrClassStaticBlockStatements(statements, staticProperties, factory.getInternalName(node));
            }
        }
        if (statements.length > 0 && isExport && isDefault) {
            modifiers = (0, ts_1.visitNodes)(modifiers, function (node) { return (0, ts_1.isExportOrDefaultModifier)(node) ? undefined : node; }, ts_1.isModifier);
            statements.push(factory.createExportAssignment(
            /*modifiers*/ undefined, 
            /*isExportEquals*/ false, factory.getLocalName(node, /*allowComments*/ false, /*allowSourceMaps*/ true)));
        }
        var classDecl = factory.updateClassDeclaration(node, modifiers, node.name, 
        /*typeParameters*/ undefined, heritageClauses, members);
        statements.unshift(classDecl);
        if (prologue) {
            statements.unshift(factory.createExpressionStatement(prologue));
        }
        return statements;
    }
    function visitClassExpression(node, referencedName) {
        return visitInNewClassLexicalEnvironment(node, referencedName, visitClassExpressionInNewClassLexicalEnvironment);
    }
    function visitClassExpressionInNewClassLexicalEnvironment(node, facts, referencedName) {
        var _a, _b, _c, _d, _e, _f;
        // If this class expression is a transformation of a decorated class declaration,
        // then we want to output the pendingExpressions as statements, not as inlined
        // expressions with the class statement.
        //
        // In this case, we use pendingStatements to produce the same output as the
        // class declaration transformation. The VariableStatement visitor will insert
        // these statements after the class expression variable statement.
        var isDecoratedClassDeclaration = !!(facts & 1 /* ClassFacts.ClassWasDecorated */);
        var staticPropertiesOrClassStaticBlocks = (0, ts_1.getStaticPropertiesAndClassStaticBlock)(node);
        var isClassWithConstructorReference = resolver.getNodeCheckFlags(node) & 1048576 /* NodeCheckFlags.ClassWithConstructorReference */;
        var temp;
        function createClassTempVar() {
            // If we aren't transforming class static blocks, then we can't reuse `_classThis` since in
            // `_classThis = class { ... static { _classThis = ... } }` the outer assignment would occur *after*
            // class static blocks evaluate and would overwrite the replacement constructor produced by class
            // decorators.
            var _a;
            // If we are transforming class static blocks, then we can reuse `_classThis` since the assignment
            // will be evaluated *before* the transformed static blocks are evaluated and thus won't overwrite
            // the replacement constructor.
            if (shouldTransformPrivateElementsOrClassStaticBlocks && ((_a = node.emitNode) === null || _a === void 0 ? void 0 : _a.classThis)) {
                return getClassLexicalEnvironment().classConstructor = node.emitNode.classThis;
            }
            var classCheckFlags = resolver.getNodeCheckFlags(node);
            var isClassWithConstructorReference = classCheckFlags & 1048576 /* NodeCheckFlags.ClassWithConstructorReference */;
            var requiresBlockScopedVar = classCheckFlags & 32768 /* NodeCheckFlags.BlockScopedBindingInLoop */;
            var temp = factory.createTempVariable(requiresBlockScopedVar ? addBlockScopedVariable : hoistVariableDeclaration, !!isClassWithConstructorReference);
            getClassLexicalEnvironment().classConstructor = factory.cloneNode(temp);
            return temp;
        }
        if ((_a = node.emitNode) === null || _a === void 0 ? void 0 : _a.classThis) {
            getClassLexicalEnvironment().classThis = node.emitNode.classThis;
        }
        if (facts & 2 /* ClassFacts.NeedsClassConstructorReference */) {
            temp !== null && temp !== void 0 ? temp : (temp = createClassTempVar());
        }
        var modifiers = (0, ts_1.visitNodes)(node.modifiers, modifierVisitor, ts_1.isModifier);
        var heritageClauses = (0, ts_1.visitNodes)(node.heritageClauses, heritageClauseVisitor, ts_1.isHeritageClause);
        var _g = transformClassMembers(node), members = _g.members, prologue = _g.prologue;
        var classExpression = factory.updateClassExpression(node, modifiers, node.name, 
        /*typeParameters*/ undefined, heritageClauses, members);
        var expressions = [];
        if (prologue) {
            expressions.push(prologue);
        }
        // Static initializers are transformed to `static {}` blocks when `useDefineForClassFields: false`
        // and not also transforming static blocks.
        var hasTransformableStatics = (shouldTransformPrivateElementsOrClassStaticBlocks || (0, ts_1.getInternalEmitFlags)(node) & 32 /* InternalEmitFlags.TransformPrivateStaticElements */) &&
            (0, ts_1.some)(staticPropertiesOrClassStaticBlocks, function (node) {
                return (0, ts_1.isClassStaticBlockDeclaration)(node) ||
                    (0, ts_1.isPrivateIdentifierClassElementDeclaration)(node) ||
                    shouldTransformInitializers && (0, ts_1.isInitializedProperty)(node);
            });
        if (hasTransformableStatics || (0, ts_1.some)(pendingExpressions) || referencedName) {
            if (isDecoratedClassDeclaration) {
                ts_1.Debug.assertIsDefined(pendingStatements, "Decorated classes transformed by TypeScript are expected to be within a variable declaration.");
                // Write any pending expressions from elided or moved computed property names
                if ((0, ts_1.some)(pendingExpressions)) {
                    (0, ts_1.addRange)(pendingStatements, (0, ts_1.map)(pendingExpressions, factory.createExpressionStatement));
                }
                if (referencedName) {
                    if (shouldTransformPrivateElementsOrClassStaticBlocks) {
                        var setNameExpression = emitHelpers().createSetFunctionNameHelper((_c = temp !== null && temp !== void 0 ? temp : (_b = node.emitNode) === null || _b === void 0 ? void 0 : _b.classThis) !== null && _c !== void 0 ? _c : factory.getInternalName(node), referencedName);
                        pendingStatements.push(factory.createExpressionStatement(setNameExpression));
                    }
                    else {
                        var setNameExpression = emitHelpers().createSetFunctionNameHelper(factory.createThis(), referencedName);
                        classExpression = factory.updateClassExpression(classExpression, classExpression.modifiers, classExpression.name, classExpression.typeParameters, classExpression.heritageClauses, __spreadArray([
                            factory.createClassStaticBlockDeclaration(factory.createBlock([
                                factory.createExpressionStatement(setNameExpression)
                            ]))
                        ], classExpression.members, true));
                    }
                }
                if ((0, ts_1.some)(staticPropertiesOrClassStaticBlocks)) {
                    addPropertyOrClassStaticBlockStatements(pendingStatements, staticPropertiesOrClassStaticBlocks, (_e = (_d = node.emitNode) === null || _d === void 0 ? void 0 : _d.classThis) !== null && _e !== void 0 ? _e : factory.getInternalName(node));
                }
                if (temp) {
                    expressions.push(factory.createAssignment(temp, classExpression));
                }
                else if (shouldTransformPrivateElementsOrClassStaticBlocks && ((_f = node.emitNode) === null || _f === void 0 ? void 0 : _f.classThis)) {
                    expressions.push(factory.createAssignment(node.emitNode.classThis, classExpression));
                }
                else {
                    expressions.push(classExpression);
                }
            }
            else {
                temp !== null && temp !== void 0 ? temp : (temp = createClassTempVar());
                if (isClassWithConstructorReference) {
                    // record an alias as the class name is not in scope for statics.
                    enableSubstitutionForClassAliases();
                    var alias = factory.cloneNode(temp);
                    alias.emitNode.autoGenerate.flags &= ~8 /* GeneratedIdentifierFlags.ReservedInNestedScopes */;
                    classAliases[(0, ts_1.getOriginalNodeId)(node)] = alias;
                }
                expressions.push(factory.createAssignment(temp, classExpression));
                // Add any pending expressions leftover from elided or relocated computed property names
                (0, ts_1.addRange)(expressions, pendingExpressions);
                if (referencedName) {
                    expressions.push(emitHelpers().createSetFunctionNameHelper(temp, referencedName));
                }
                (0, ts_1.addRange)(expressions, generateInitializedPropertyExpressionsOrClassStaticBlock(staticPropertiesOrClassStaticBlocks, temp));
                expressions.push(factory.cloneNode(temp));
            }
        }
        else {
            expressions.push(classExpression);
        }
        if (expressions.length > 1) {
            // To preserve the behavior of the old emitter, we explicitly indent
            // the body of a class with static initializers.
            (0, ts_1.addEmitFlags)(classExpression, 131072 /* EmitFlags.Indented */);
            expressions.forEach(ts_1.startOnNewLine);
        }
        return factory.inlineExpressions(expressions);
    }
    function visitClassStaticBlockDeclaration(node) {
        if (!shouldTransformPrivateElementsOrClassStaticBlocks) {
            return (0, ts_1.visitEachChild)(node, visitor, context);
        }
        // ClassStaticBlockDeclaration for classes are transformed in `visitClassDeclaration` or `visitClassExpression`.
        return undefined;
    }
    function transformClassMembers(node) {
        var shouldTransformPrivateStaticElementsInClass = !!((0, ts_1.getInternalEmitFlags)(node) & 32 /* InternalEmitFlags.TransformPrivateStaticElements */);
        // Declare private names
        if (shouldTransformPrivateElementsOrClassStaticBlocks || shouldTransformPrivateStaticElementsInFile) {
            for (var _i = 0, _a = node.members; _i < _a.length; _i++) {
                var member = _a[_i];
                if ((0, ts_1.isPrivateIdentifierClassElementDeclaration)(member)) {
                    if (shouldTransformClassElementToWeakMap(member)) {
                        addPrivateIdentifierToEnvironment(member, member.name, addPrivateIdentifierClassElementToEnvironment);
                    }
                    else {
                        var privateEnv = getPrivateIdentifierEnvironment();
                        (0, ts_1.setPrivateIdentifier)(privateEnv, member.name, { kind: "untransformed" });
                    }
                }
            }
            if (shouldTransformPrivateElementsOrClassStaticBlocks) {
                if ((0, ts_1.some)(getPrivateInstanceMethodsAndAccessors(node))) {
                    createBrandCheckWeakSetForPrivateMethods();
                }
            }
            if (shouldTransformAutoAccessorsInCurrentClass()) {
                for (var _b = 0, _c = node.members; _b < _c.length; _b++) {
                    var member = _c[_b];
                    if ((0, ts_1.isAutoAccessorPropertyDeclaration)(member)) {
                        var storageName = factory.getGeneratedPrivateNameForNode(member.name, /*prefix*/ undefined, "_accessor_storage");
                        if (shouldTransformPrivateElementsOrClassStaticBlocks ||
                            shouldTransformPrivateStaticElementsInClass && (0, ts_1.hasStaticModifier)(member)) {
                            addPrivateIdentifierToEnvironment(member, storageName, addPrivateIdentifierPropertyDeclarationToEnvironment);
                        }
                        else {
                            var privateEnv = getPrivateIdentifierEnvironment();
                            (0, ts_1.setPrivateIdentifier)(privateEnv, storageName, { kind: "untransformed" });
                        }
                    }
                }
            }
        }
        var members = (0, ts_1.visitNodes)(node.members, classElementVisitor, ts_1.isClassElement);
        // Create a synthetic constructor if necessary
        var syntheticConstructor;
        if (!(0, ts_1.some)(members, ts_1.isConstructorDeclaration)) {
            syntheticConstructor = transformConstructor(/*constructor*/ undefined, node);
        }
        var prologue;
        // If there are pending expressions create a class static block in which to evaluate them, but only if
        // class static blocks are not also being transformed. This block will be injected at the top of the class
        // to ensure that expressions from computed property names are evaluated before any other static
        // initializers.
        var syntheticStaticBlock;
        if (!shouldTransformPrivateElementsOrClassStaticBlocks && (0, ts_1.some)(pendingExpressions)) {
            var statement = factory.createExpressionStatement(factory.inlineExpressions(pendingExpressions));
            if (statement.transformFlags & 134234112 /* TransformFlags.ContainsLexicalThisOrSuper */) {
                // If there are `this` or `super` references from computed property names, shift the expression
                // into an arrow function to be evaluated in the outer scope so that `this` and `super` are
                // properly captured.
                var temp = factory.createTempVariable(hoistVariableDeclaration);
                var arrow = factory.createArrowFunction(
                /*modifiers*/ undefined, 
                /*typeParameters*/ undefined, 
                /*parameters*/ [], 
                /*type*/ undefined, 
                /*equalsGreaterThanToken*/ undefined, factory.createBlock([statement]));
                prologue = factory.createAssignment(temp, arrow);
                statement = factory.createExpressionStatement(factory.createCallExpression(temp, /*typeArguments*/ undefined, []));
            }
            var block = factory.createBlock([statement]);
            syntheticStaticBlock = factory.createClassStaticBlockDeclaration(block);
            pendingExpressions = undefined;
        }
        // If we created a synthetic constructor or class static block, add them to the visited members
        // and return a new array.
        if (syntheticConstructor || syntheticStaticBlock) {
            var membersArray = void 0;
            membersArray = (0, ts_1.append)(membersArray, syntheticConstructor);
            membersArray = (0, ts_1.append)(membersArray, syntheticStaticBlock);
            membersArray = (0, ts_1.addRange)(membersArray, members);
            members = (0, ts_1.setTextRange)(factory.createNodeArray(membersArray), /*location*/ node.members);
        }
        return { members: members, prologue: prologue };
    }
    function createBrandCheckWeakSetForPrivateMethods() {
        var weakSetName = getPrivateIdentifierEnvironment().data.weakSetName;
        ts_1.Debug.assert(weakSetName, "weakSetName should be set in private identifier environment");
        getPendingExpressions().push(factory.createAssignment(weakSetName, factory.createNewExpression(factory.createIdentifier("WeakSet"), 
        /*typeArguments*/ undefined, [])));
    }
    function transformConstructor(constructor, container) {
        constructor = (0, ts_1.visitNode)(constructor, visitor, ts_1.isConstructorDeclaration);
        if (!(lexicalEnvironment === null || lexicalEnvironment === void 0 ? void 0 : lexicalEnvironment.data) || !(lexicalEnvironment.data.facts & 16 /* ClassFacts.WillHoistInitializersToConstructor */)) {
            return constructor;
        }
        var extendsClauseElement = (0, ts_1.getEffectiveBaseTypeNode)(container);
        var isDerivedClass = !!(extendsClauseElement && (0, ts_1.skipOuterExpressions)(extendsClauseElement.expression).kind !== 106 /* SyntaxKind.NullKeyword */);
        var parameters = (0, ts_1.visitParameterList)(constructor ? constructor.parameters : undefined, visitor, context);
        var body = transformConstructorBody(container, constructor, isDerivedClass);
        if (!body) {
            return constructor;
        }
        if (constructor) {
            ts_1.Debug.assert(parameters);
            return factory.updateConstructorDeclaration(constructor, /*modifiers*/ undefined, parameters, body);
        }
        return (0, ts_1.startOnNewLine)((0, ts_1.setOriginalNode)((0, ts_1.setTextRange)(factory.createConstructorDeclaration(
        /*modifiers*/ undefined, parameters !== null && parameters !== void 0 ? parameters : [], body), constructor || container), constructor));
    }
    function transformConstructorBody(node, constructor, isDerivedClass) {
        var _a, _b;
        var instanceProperties = (0, ts_1.getProperties)(node, /*requireInitializer*/ false, /*isStatic*/ false);
        var properties = instanceProperties;
        if (!useDefineForClassFields) {
            properties = (0, ts_1.filter)(properties, function (property) { return !!property.initializer || (0, ts_1.isPrivateIdentifier)(property.name) || (0, ts_1.hasAccessorModifier)(property); });
        }
        var privateMethodsAndAccessors = getPrivateInstanceMethodsAndAccessors(node);
        var needsConstructorBody = (0, ts_1.some)(properties) || (0, ts_1.some)(privateMethodsAndAccessors);
        // Only generate synthetic constructor when there are property initializers to move.
        if (!constructor && !needsConstructorBody) {
            return (0, ts_1.visitFunctionBody)(/*node*/ undefined, visitor, context);
        }
        resumeLexicalEnvironment();
        var needsSyntheticConstructor = !constructor && isDerivedClass;
        var indexOfFirstStatementAfterSuperAndPrologue = 0;
        var prologueStatementCount = 0;
        var superStatementIndex = -1;
        var statements = [];
        if ((_a = constructor === null || constructor === void 0 ? void 0 : constructor.body) === null || _a === void 0 ? void 0 : _a.statements) {
            prologueStatementCount = factory.copyPrologue(constructor.body.statements, statements, /*ensureUseStrict*/ false, visitor);
            superStatementIndex = (0, ts_1.findSuperStatementIndex)(constructor.body.statements, prologueStatementCount);
            // If there was a super call, visit existing statements up to and including it
            if (superStatementIndex >= 0) {
                indexOfFirstStatementAfterSuperAndPrologue = superStatementIndex + 1;
                statements = __spreadArray(__spreadArray(__spreadArray([], statements.slice(0, prologueStatementCount), true), (0, ts_1.visitNodes)(constructor.body.statements, visitor, ts_1.isStatement, prologueStatementCount, indexOfFirstStatementAfterSuperAndPrologue - prologueStatementCount), true), statements.slice(prologueStatementCount), true);
            }
            else if (prologueStatementCount >= 0) {
                indexOfFirstStatementAfterSuperAndPrologue = prologueStatementCount;
            }
        }
        if (needsSyntheticConstructor) {
            // Add a synthetic `super` call:
            //
            //  super(...arguments);
            //
            statements.push(factory.createExpressionStatement(factory.createCallExpression(factory.createSuper(), 
            /*typeArguments*/ undefined, [factory.createSpreadElement(factory.createIdentifier("arguments"))])));
        }
        // Add the property initializers. Transforms this:
        //
        //  public x = 1;
        //
        // Into this:
        //
        //  constructor() {
        //      this.x = 1;
        //  }
        //
        // If we do useDefineForClassFields, they'll be converted elsewhere.
        // We instead *remove* them from the transformed output at this stage.
        var parameterPropertyDeclarationCount = 0;
        if (constructor === null || constructor === void 0 ? void 0 : constructor.body) {
            // parameter-property assignments should occur immediately after the prologue and `super()`,
            // so only count the statements that immediately follow.
            for (var i = indexOfFirstStatementAfterSuperAndPrologue; i < constructor.body.statements.length; i++) {
                var statement = constructor.body.statements[i];
                if ((0, ts_1.isParameterPropertyDeclaration)((0, ts_1.getOriginalNode)(statement), constructor)) {
                    parameterPropertyDeclarationCount++;
                }
                else {
                    break;
                }
            }
            if (parameterPropertyDeclarationCount > 0) {
                indexOfFirstStatementAfterSuperAndPrologue += parameterPropertyDeclarationCount;
            }
        }
        var receiver = factory.createThis();
        // private methods can be called in property initializers, they should execute first.
        addInstanceMethodStatements(statements, privateMethodsAndAccessors, receiver);
        if (constructor) {
            var parameterProperties = (0, ts_1.filter)(instanceProperties, function (prop) { return (0, ts_1.isParameterPropertyDeclaration)((0, ts_1.getOriginalNode)(prop), constructor); });
            var nonParameterProperties = (0, ts_1.filter)(properties, function (prop) { return !(0, ts_1.isParameterPropertyDeclaration)((0, ts_1.getOriginalNode)(prop), constructor); });
            addPropertyOrClassStaticBlockStatements(statements, parameterProperties, receiver);
            addPropertyOrClassStaticBlockStatements(statements, nonParameterProperties, receiver);
        }
        else {
            addPropertyOrClassStaticBlockStatements(statements, properties, receiver);
        }
        // Add existing statements after the initial prologues and super call
        if (constructor) {
            (0, ts_1.addRange)(statements, (0, ts_1.visitNodes)(constructor.body.statements, visitor, ts_1.isStatement, indexOfFirstStatementAfterSuperAndPrologue));
        }
        statements = factory.mergeLexicalEnvironment(statements, endLexicalEnvironment());
        if (statements.length === 0 && !constructor) {
            return undefined;
        }
        var multiLine = (constructor === null || constructor === void 0 ? void 0 : constructor.body) && constructor.body.statements.length >= statements.length ?
            (_b = constructor.body.multiLine) !== null && _b !== void 0 ? _b : statements.length > 0 :
            statements.length > 0;
        return (0, ts_1.setTextRange)(factory.createBlock((0, ts_1.setTextRange)(factory.createNodeArray(statements), 
        /*location*/ constructor ? constructor.body.statements : node.members), multiLine), 
        /*location*/ constructor ? constructor.body : undefined);
    }
    /**
     * Generates assignment statements for property initializers.
     *
     * @param properties An array of property declarations to transform.
     * @param receiver The receiver on which each property should be assigned.
     */
    function addPropertyOrClassStaticBlockStatements(statements, properties, receiver) {
        for (var _i = 0, properties_1 = properties; _i < properties_1.length; _i++) {
            var property = properties_1[_i];
            if ((0, ts_1.isStatic)(property) && !shouldTransformPrivateElementsOrClassStaticBlocks) {
                continue;
            }
            var statement = transformPropertyOrClassStaticBlock(property, receiver);
            if (!statement) {
                continue;
            }
            statements.push(statement);
        }
    }
    function transformPropertyOrClassStaticBlock(property, receiver) {
        var expression = (0, ts_1.isClassStaticBlockDeclaration)(property) ?
            transformClassStaticBlockDeclaration(property) :
            transformProperty(property, receiver);
        if (!expression) {
            return undefined;
        }
        var statement = factory.createExpressionStatement(expression);
        (0, ts_1.setOriginalNode)(statement, property);
        (0, ts_1.addEmitFlags)(statement, (0, ts_1.getEmitFlags)(property) & 3072 /* EmitFlags.NoComments */);
        (0, ts_1.setCommentRange)(statement, property);
        var propertyOriginalNode = (0, ts_1.getOriginalNode)(property);
        if ((0, ts_1.isParameter)(propertyOriginalNode)) {
            // replicate comment and source map behavior from the ts transform for parameter properties.
            (0, ts_1.setSourceMapRange)(statement, propertyOriginalNode);
            (0, ts_1.removeAllComments)(statement);
        }
        else {
            (0, ts_1.setSourceMapRange)(statement, (0, ts_1.moveRangePastModifiers)(property));
        }
        // `setOriginalNode` *copies* the `emitNode` from `property`, so now both
        // `statement` and `expression` have a copy of the synthesized comments.
        // Drop the comments from expression to avoid printing them twice.
        (0, ts_1.setSyntheticLeadingComments)(expression, undefined);
        (0, ts_1.setSyntheticTrailingComments)(expression, undefined);
        // If the property was originally an auto-accessor, don't emit comments here since they will be attached to
        // the synthezized getter.
        if ((0, ts_1.hasAccessorModifier)(propertyOriginalNode)) {
            (0, ts_1.addEmitFlags)(statement, 3072 /* EmitFlags.NoComments */);
        }
        return statement;
    }
    /**
     * Generates assignment expressions for property initializers.
     *
     * @param propertiesOrClassStaticBlocks An array of property declarations to transform.
     * @param receiver The receiver on which each property should be assigned.
     */
    function generateInitializedPropertyExpressionsOrClassStaticBlock(propertiesOrClassStaticBlocks, receiver) {
        var expressions = [];
        for (var _i = 0, propertiesOrClassStaticBlocks_1 = propertiesOrClassStaticBlocks; _i < propertiesOrClassStaticBlocks_1.length; _i++) {
            var property = propertiesOrClassStaticBlocks_1[_i];
            var expression = (0, ts_1.isClassStaticBlockDeclaration)(property) ? transformClassStaticBlockDeclaration(property) : transformProperty(property, receiver);
            if (!expression) {
                continue;
            }
            (0, ts_1.startOnNewLine)(expression);
            (0, ts_1.setOriginalNode)(expression, property);
            (0, ts_1.addEmitFlags)(expression, (0, ts_1.getEmitFlags)(property) & 3072 /* EmitFlags.NoComments */);
            (0, ts_1.setSourceMapRange)(expression, (0, ts_1.moveRangePastModifiers)(property));
            (0, ts_1.setCommentRange)(expression, property);
            expressions.push(expression);
        }
        return expressions;
    }
    /**
     * Transforms a property initializer into an assignment statement.
     *
     * @param property The property declaration.
     * @param receiver The object receiving the property assignment.
     */
    function transformProperty(property, receiver) {
        var _a;
        var savedCurrentClassElement = currentClassElement;
        var transformed = transformPropertyWorker(property, receiver);
        if (transformed && (0, ts_1.hasStaticModifier)(property) && ((_a = lexicalEnvironment === null || lexicalEnvironment === void 0 ? void 0 : lexicalEnvironment.data) === null || _a === void 0 ? void 0 : _a.facts)) {
            // capture the lexical environment for the member
            (0, ts_1.setOriginalNode)(transformed, property);
            (0, ts_1.addEmitFlags)(transformed, 4 /* EmitFlags.AdviseOnEmitNode */);
            (0, ts_1.setSourceMapRange)(transformed, (0, ts_1.getSourceMapRange)(property.name));
            lexicalEnvironmentMap.set((0, ts_1.getOriginalNode)(property), lexicalEnvironment);
        }
        currentClassElement = savedCurrentClassElement;
        return transformed;
    }
    function transformPropertyWorker(property, receiver) {
        // We generate a name here in order to reuse the value cached by the relocated computed name expression (which uses the same generated name)
        var emitAssignment = !useDefineForClassFields;
        var referencedName;
        if ((0, ts_1.isNamedEvaluation)(property, isAnonymousClassNeedingAssignedName)) {
            if ((0, ts_1.isPropertyNameLiteral)(property.name) || (0, ts_1.isPrivateIdentifier)(property.name)) {
                referencedName = factory.createStringLiteralFromNode(property.name);
            }
            else if ((0, ts_1.isPropertyNameLiteral)(property.name.expression) && !(0, ts_1.isIdentifier)(property.name.expression)) {
                referencedName = factory.createStringLiteralFromNode(property.name.expression);
            }
            else {
                referencedName = factory.getGeneratedNameForNode(property.name);
            }
        }
        var propertyName = (0, ts_1.hasAccessorModifier)(property) ?
            factory.getGeneratedPrivateNameForNode(property.name) :
            (0, ts_1.isComputedPropertyName)(property.name) && !(0, ts_1.isSimpleInlineableExpression)(property.name.expression) ?
                factory.updateComputedPropertyName(property.name, factory.getGeneratedNameForNode(property.name)) :
                property.name;
        if ((0, ts_1.hasStaticModifier)(property)) {
            currentClassElement = property;
        }
        var initializerVisitor = referencedName ? function (child) { return namedEvaluationVisitor(child, referencedName); } :
            visitor;
        if ((0, ts_1.isPrivateIdentifier)(propertyName) && shouldTransformClassElementToWeakMap(property)) {
            var privateIdentifierInfo = accessPrivateIdentifier(propertyName);
            if (privateIdentifierInfo) {
                if (privateIdentifierInfo.kind === "f" /* PrivateIdentifierKind.Field */) {
                    if (!privateIdentifierInfo.isStatic) {
                        return createPrivateInstanceFieldInitializer(factory, receiver, (0, ts_1.visitNode)(property.initializer, initializerVisitor, ts_1.isExpression), privateIdentifierInfo.brandCheckIdentifier);
                    }
                    else {
                        return createPrivateStaticFieldInitializer(factory, privateIdentifierInfo.variableName, (0, ts_1.visitNode)(property.initializer, initializerVisitor, ts_1.isExpression));
                    }
                }
                else {
                    return undefined;
                }
            }
            else {
                ts_1.Debug.fail("Undeclared private name for property declaration.");
            }
        }
        if (((0, ts_1.isPrivateIdentifier)(propertyName) || (0, ts_1.hasStaticModifier)(property)) && !property.initializer) {
            return undefined;
        }
        var propertyOriginalNode = (0, ts_1.getOriginalNode)(property);
        if ((0, ts_1.hasSyntacticModifier)(propertyOriginalNode, 256 /* ModifierFlags.Abstract */)) {
            return undefined;
        }
        var initializer = (0, ts_1.visitNode)(property.initializer, initializerVisitor, ts_1.isExpression);
        if ((0, ts_1.isParameterPropertyDeclaration)(propertyOriginalNode, propertyOriginalNode.parent) && (0, ts_1.isIdentifier)(propertyName)) {
            // A parameter-property declaration always overrides the initializer. The only time a parameter-property
            // declaration *should* have an initializer is when decorators have added initializers that need to run before
            // any other initializer
            var localName = factory.cloneNode(propertyName);
            if (initializer) {
                // unwrap `(__runInitializers(this, _instanceExtraInitializers), void 0)`
                if ((0, ts_1.isParenthesizedExpression)(initializer) &&
                    (0, ts_1.isCommaExpression)(initializer.expression) &&
                    (0, ts_1.isCallToHelper)(initializer.expression.left, "___runInitializers") &&
                    (0, ts_1.isVoidExpression)(initializer.expression.right) &&
                    (0, ts_1.isNumericLiteral)(initializer.expression.right.expression)) {
                    initializer = initializer.expression.left;
                }
                initializer = factory.inlineExpressions([initializer, localName]);
            }
            else {
                initializer = localName;
            }
            (0, ts_1.setEmitFlags)(propertyName, 3072 /* EmitFlags.NoComments */ | 96 /* EmitFlags.NoSourceMap */);
            (0, ts_1.setSourceMapRange)(localName, propertyOriginalNode.name);
            (0, ts_1.setEmitFlags)(localName, 3072 /* EmitFlags.NoComments */);
        }
        else {
            initializer !== null && initializer !== void 0 ? initializer : (initializer = factory.createVoidZero());
        }
        if (emitAssignment || (0, ts_1.isPrivateIdentifier)(propertyName)) {
            var memberAccess = (0, ts_1.createMemberAccessForPropertyName)(factory, receiver, propertyName, /*location*/ propertyName);
            (0, ts_1.addEmitFlags)(memberAccess, 1024 /* EmitFlags.NoLeadingComments */);
            var expression = factory.createAssignment(memberAccess, initializer);
            return expression;
        }
        else {
            var name_9 = (0, ts_1.isComputedPropertyName)(propertyName) ? propertyName.expression
                : (0, ts_1.isIdentifier)(propertyName) ? factory.createStringLiteral((0, ts_1.unescapeLeadingUnderscores)(propertyName.escapedText))
                    : propertyName;
            var descriptor = factory.createPropertyDescriptor({ value: initializer, configurable: true, writable: true, enumerable: true });
            return factory.createObjectDefinePropertyCall(receiver, name_9, descriptor);
        }
    }
    function enableSubstitutionForClassAliases() {
        if ((enabledSubstitutions & 1 /* ClassPropertySubstitutionFlags.ClassAliases */) === 0) {
            enabledSubstitutions |= 1 /* ClassPropertySubstitutionFlags.ClassAliases */;
            // We need to enable substitutions for identifiers. This allows us to
            // substitute class names inside of a class declaration.
            context.enableSubstitution(80 /* SyntaxKind.Identifier */);
            // Keep track of class aliases.
            classAliases = [];
        }
    }
    function enableSubstitutionForClassStaticThisOrSuperReference() {
        if ((enabledSubstitutions & 2 /* ClassPropertySubstitutionFlags.ClassStaticThisOrSuperReference */) === 0) {
            enabledSubstitutions |= 2 /* ClassPropertySubstitutionFlags.ClassStaticThisOrSuperReference */;
            // substitute `this` in a static field initializer
            context.enableSubstitution(110 /* SyntaxKind.ThisKeyword */);
            context.enableEmitNotification(261 /* SyntaxKind.FunctionDeclaration */);
            context.enableEmitNotification(217 /* SyntaxKind.FunctionExpression */);
            context.enableEmitNotification(175 /* SyntaxKind.Constructor */);
            context.enableEmitNotification(176 /* SyntaxKind.GetAccessor */);
            context.enableEmitNotification(177 /* SyntaxKind.SetAccessor */);
            context.enableEmitNotification(173 /* SyntaxKind.MethodDeclaration */);
            context.enableEmitNotification(171 /* SyntaxKind.PropertyDeclaration */);
            context.enableEmitNotification(166 /* SyntaxKind.ComputedPropertyName */);
        }
    }
    /**
     * Generates brand-check initializer for private methods.
     *
     * @param statements Statement list that should be used to append new statements.
     * @param methods An array of method declarations.
     * @param receiver The receiver on which each method should be assigned.
     */
    function addInstanceMethodStatements(statements, methods, receiver) {
        if (!shouldTransformPrivateElementsOrClassStaticBlocks || !(0, ts_1.some)(methods)) {
            return;
        }
        var weakSetName = getPrivateIdentifierEnvironment().data.weakSetName;
        ts_1.Debug.assert(weakSetName, "weakSetName should be set in private identifier environment");
        statements.push(factory.createExpressionStatement(createPrivateInstanceMethodInitializer(factory, receiver, weakSetName)));
    }
    function visitInvalidSuperProperty(node) {
        return (0, ts_1.isPropertyAccessExpression)(node) ?
            factory.updatePropertyAccessExpression(node, factory.createVoidZero(), node.name) :
            factory.updateElementAccessExpression(node, factory.createVoidZero(), (0, ts_1.visitNode)(node.argumentExpression, visitor, ts_1.isExpression));
    }
    /**
     * If the name is a computed property, this function transforms it, then either returns an expression which caches the
     * value of the result or the expression itself if the value is either unused or safe to inline into multiple locations
     * @param shouldHoist Does the expression need to be reused? (ie, for an initializer or a decorator)
     */
    function getPropertyNameExpressionIfNeeded(name, shouldHoist, captureReferencedName) {
        if ((0, ts_1.isComputedPropertyName)(name)) {
            var cacheAssignment = (0, ts_1.findComputedPropertyNameCacheAssignment)(name);
            var expression = (0, ts_1.visitNode)(name.expression, visitor, ts_1.isExpression);
            var innerExpression = (0, ts_1.skipPartiallyEmittedExpressions)(expression);
            var inlinable = (0, ts_1.isSimpleInlineableExpression)(innerExpression);
            var alreadyTransformed = !!cacheAssignment || (0, ts_1.isAssignmentExpression)(innerExpression) && (0, ts_1.isGeneratedIdentifier)(innerExpression.left);
            if (!alreadyTransformed && !inlinable && shouldHoist) {
                var generatedName = factory.getGeneratedNameForNode(name);
                if (resolver.getNodeCheckFlags(name) & 32768 /* NodeCheckFlags.BlockScopedBindingInLoop */) {
                    addBlockScopedVariable(generatedName);
                }
                else {
                    hoistVariableDeclaration(generatedName);
                }
                if (captureReferencedName) {
                    expression = emitHelpers().createPropKeyHelper(expression);
                }
                return factory.createAssignment(generatedName, expression);
            }
            return (inlinable || (0, ts_1.isIdentifier)(innerExpression)) ? undefined : expression;
        }
    }
    function startClassLexicalEnvironment() {
        lexicalEnvironment = { previous: lexicalEnvironment, data: undefined };
    }
    function endClassLexicalEnvironment() {
        lexicalEnvironment = lexicalEnvironment === null || lexicalEnvironment === void 0 ? void 0 : lexicalEnvironment.previous;
    }
    function getClassLexicalEnvironment() {
        var _a;
        ts_1.Debug.assert(lexicalEnvironment);
        return (_a = lexicalEnvironment.data) !== null && _a !== void 0 ? _a : (lexicalEnvironment.data = {
            facts: 0 /* ClassFacts.None */,
            classConstructor: undefined,
            classThis: undefined,
            superClassReference: undefined,
            // privateIdentifierEnvironment: undefined,
        });
    }
    function getPrivateIdentifierEnvironment() {
        var _a;
        ts_1.Debug.assert(lexicalEnvironment);
        return (_a = lexicalEnvironment.privateEnv) !== null && _a !== void 0 ? _a : (lexicalEnvironment.privateEnv = (0, ts_1.newPrivateEnvironment)({
            className: undefined,
            weakSetName: undefined,
        }));
    }
    function getPendingExpressions() {
        return pendingExpressions !== null && pendingExpressions !== void 0 ? pendingExpressions : (pendingExpressions = []);
    }
    function addPrivateIdentifierClassElementToEnvironment(node, name, lex, privateEnv, isStatic, isValid, previousInfo) {
        if ((0, ts_1.isAutoAccessorPropertyDeclaration)(node)) {
            addPrivateIdentifierAutoAccessorPropertyDeclarationToEnvironment(node, name, lex, privateEnv, isStatic, isValid, previousInfo);
        }
        else if ((0, ts_1.isPropertyDeclaration)(node)) {
            addPrivateIdentifierPropertyDeclarationToEnvironment(node, name, lex, privateEnv, isStatic, isValid, previousInfo);
        }
        else if ((0, ts_1.isMethodDeclaration)(node)) {
            addPrivateIdentifierMethodDeclarationToEnvironment(node, name, lex, privateEnv, isStatic, isValid, previousInfo);
        }
        else if ((0, ts_1.isGetAccessorDeclaration)(node)) {
            addPrivateIdentifierGetAccessorDeclarationToEnvironment(node, name, lex, privateEnv, isStatic, isValid, previousInfo);
        }
        else if ((0, ts_1.isSetAccessorDeclaration)(node)) {
            addPrivateIdentifierSetAccessorDeclarationToEnvironment(node, name, lex, privateEnv, isStatic, isValid, previousInfo);
        }
    }
    function addPrivateIdentifierPropertyDeclarationToEnvironment(_node, name, lex, privateEnv, isStatic, isValid, _previousInfo) {
        var _a;
        if (isStatic) {
            var brandCheckIdentifier = ts_1.Debug.checkDefined((_a = lex.classThis) !== null && _a !== void 0 ? _a : lex.classConstructor, "classConstructor should be set in private identifier environment");
            var variableName = createHoistedVariableForPrivateName(name);
            (0, ts_1.setPrivateIdentifier)(privateEnv, name, {
                kind: "f" /* PrivateIdentifierKind.Field */,
                isStatic: true,
                brandCheckIdentifier: brandCheckIdentifier,
                variableName: variableName,
                isValid: isValid,
            });
        }
        else {
            var weakMapName = createHoistedVariableForPrivateName(name);
            (0, ts_1.setPrivateIdentifier)(privateEnv, name, {
                kind: "f" /* PrivateIdentifierKind.Field */,
                isStatic: false,
                brandCheckIdentifier: weakMapName,
                isValid: isValid,
            });
            getPendingExpressions().push(factory.createAssignment(weakMapName, factory.createNewExpression(factory.createIdentifier("WeakMap"), 
            /*typeArguments*/ undefined, [])));
        }
    }
    function addPrivateIdentifierMethodDeclarationToEnvironment(_node, name, lex, privateEnv, isStatic, isValid, _previousInfo) {
        var _a;
        var methodName = createHoistedVariableForPrivateName(name);
        var brandCheckIdentifier = isStatic ?
            ts_1.Debug.checkDefined((_a = lex.classThis) !== null && _a !== void 0 ? _a : lex.classConstructor, "classConstructor should be set in private identifier environment") :
            ts_1.Debug.checkDefined(privateEnv.data.weakSetName, "weakSetName should be set in private identifier environment");
        (0, ts_1.setPrivateIdentifier)(privateEnv, name, {
            kind: "m" /* PrivateIdentifierKind.Method */,
            methodName: methodName,
            brandCheckIdentifier: brandCheckIdentifier,
            isStatic: isStatic,
            isValid: isValid,
        });
    }
    function addPrivateIdentifierGetAccessorDeclarationToEnvironment(_node, name, lex, privateEnv, isStatic, isValid, previousInfo) {
        var _a;
        var getterName = createHoistedVariableForPrivateName(name, "_get");
        var brandCheckIdentifier = isStatic ?
            ts_1.Debug.checkDefined((_a = lex.classThis) !== null && _a !== void 0 ? _a : lex.classConstructor, "classConstructor should be set in private identifier environment") :
            ts_1.Debug.checkDefined(privateEnv.data.weakSetName, "weakSetName should be set in private identifier environment");
        if ((previousInfo === null || previousInfo === void 0 ? void 0 : previousInfo.kind) === "a" /* PrivateIdentifierKind.Accessor */ && previousInfo.isStatic === isStatic && !previousInfo.getterName) {
            previousInfo.getterName = getterName;
        }
        else {
            (0, ts_1.setPrivateIdentifier)(privateEnv, name, {
                kind: "a" /* PrivateIdentifierKind.Accessor */,
                getterName: getterName,
                setterName: undefined,
                brandCheckIdentifier: brandCheckIdentifier,
                isStatic: isStatic,
                isValid: isValid,
            });
        }
    }
    function addPrivateIdentifierSetAccessorDeclarationToEnvironment(_node, name, lex, privateEnv, isStatic, isValid, previousInfo) {
        var _a;
        var setterName = createHoistedVariableForPrivateName(name, "_set");
        var brandCheckIdentifier = isStatic ?
            ts_1.Debug.checkDefined((_a = lex.classThis) !== null && _a !== void 0 ? _a : lex.classConstructor, "classConstructor should be set in private identifier environment") :
            ts_1.Debug.checkDefined(privateEnv.data.weakSetName, "weakSetName should be set in private identifier environment");
        if ((previousInfo === null || previousInfo === void 0 ? void 0 : previousInfo.kind) === "a" /* PrivateIdentifierKind.Accessor */ &&
            previousInfo.isStatic === isStatic && !previousInfo.setterName) {
            previousInfo.setterName = setterName;
        }
        else {
            (0, ts_1.setPrivateIdentifier)(privateEnv, name, {
                kind: "a" /* PrivateIdentifierKind.Accessor */,
                getterName: undefined,
                setterName: setterName,
                brandCheckIdentifier: brandCheckIdentifier,
                isStatic: isStatic,
                isValid: isValid,
            });
        }
    }
    function addPrivateIdentifierAutoAccessorPropertyDeclarationToEnvironment(_node, name, lex, privateEnv, isStatic, isValid, _previousInfo) {
        var _a;
        var getterName = createHoistedVariableForPrivateName(name, "_get");
        var setterName = createHoistedVariableForPrivateName(name, "_set");
        var brandCheckIdentifier = isStatic ?
            ts_1.Debug.checkDefined((_a = lex.classThis) !== null && _a !== void 0 ? _a : lex.classConstructor, "classConstructor should be set in private identifier environment") :
            ts_1.Debug.checkDefined(privateEnv.data.weakSetName, "weakSetName should be set in private identifier environment");
        (0, ts_1.setPrivateIdentifier)(privateEnv, name, {
            kind: "a" /* PrivateIdentifierKind.Accessor */,
            getterName: getterName,
            setterName: setterName,
            brandCheckIdentifier: brandCheckIdentifier,
            isStatic: isStatic,
            isValid: isValid,
        });
    }
    function addPrivateIdentifierToEnvironment(node, name, addDeclaration) {
        var lex = getClassLexicalEnvironment();
        var privateEnv = getPrivateIdentifierEnvironment();
        var previousInfo = (0, ts_1.getPrivateIdentifier)(privateEnv, name);
        var isStatic = (0, ts_1.hasStaticModifier)(node);
        var isValid = !isReservedPrivateName(name) && previousInfo === undefined;
        addDeclaration(node, name, lex, privateEnv, isStatic, isValid, previousInfo);
    }
    function createHoistedVariableForClass(name, node, suffix) {
        var className = getPrivateIdentifierEnvironment().data.className;
        var prefix = className ? { prefix: "_", node: className, suffix: "_" } : "_";
        var identifier = typeof name === "object" ? factory.getGeneratedNameForNode(name, 16 /* GeneratedIdentifierFlags.Optimistic */ | 8 /* GeneratedIdentifierFlags.ReservedInNestedScopes */, prefix, suffix) :
            typeof name === "string" ? factory.createUniqueName(name, 16 /* GeneratedIdentifierFlags.Optimistic */, prefix, suffix) :
                factory.createTempVariable(/*recordTempVariable*/ undefined, /*reservedInNestedScopes*/ true, prefix, suffix);
        if (resolver.getNodeCheckFlags(node) & 32768 /* NodeCheckFlags.BlockScopedBindingInLoop */) {
            addBlockScopedVariable(identifier);
        }
        else {
            hoistVariableDeclaration(identifier);
        }
        return identifier;
    }
    function createHoistedVariableForPrivateName(name, suffix) {
        var _a;
        var text = (0, ts_1.tryGetTextOfPropertyName)(name);
        return createHoistedVariableForClass((_a = text === null || text === void 0 ? void 0 : text.substring(1)) !== null && _a !== void 0 ? _a : name, name, suffix);
    }
    /**
     * Access an already defined {@link PrivateIdentifier} in the current {@link PrivateIdentifierEnvironment}.
     *
     * @seealso {@link addPrivateIdentifierToEnvironment}
     */
    function accessPrivateIdentifier(name) {
        var info = (0, ts_1.accessPrivateIdentifier)(lexicalEnvironment, name);
        return (info === null || info === void 0 ? void 0 : info.kind) === "untransformed" ? undefined : info;
    }
    function wrapPrivateIdentifierForDestructuringTarget(node) {
        var parameter = factory.getGeneratedNameForNode(node);
        var info = accessPrivateIdentifier(node.name);
        if (!info) {
            return (0, ts_1.visitEachChild)(node, visitor, context);
        }
        var receiver = node.expression;
        // We cannot copy `this` or `super` into the function because they will be bound
        // differently inside the function.
        if ((0, ts_1.isThisProperty)(node) || (0, ts_1.isSuperProperty)(node) || !(0, ts_1.isSimpleCopiableExpression)(node.expression)) {
            receiver = factory.createTempVariable(hoistVariableDeclaration, /*reservedInNestedScopes*/ true);
            getPendingExpressions().push(factory.createBinaryExpression(receiver, 64 /* SyntaxKind.EqualsToken */, (0, ts_1.visitNode)(node.expression, visitor, ts_1.isExpression)));
        }
        return factory.createAssignmentTargetWrapper(parameter, createPrivateIdentifierAssignment(info, receiver, parameter, 64 /* SyntaxKind.EqualsToken */));
    }
    function visitDestructuringAssignmentTarget(node) {
        if ((0, ts_1.isObjectLiteralExpression)(node) || (0, ts_1.isArrayLiteralExpression)(node)) {
            return visitAssignmentPattern(node);
        }
        if ((0, ts_1.isPrivateIdentifierPropertyAccessExpression)(node)) {
            return wrapPrivateIdentifierForDestructuringTarget(node);
        }
        else if (shouldTransformSuperInStaticInitializers &&
            currentClassElement &&
            (0, ts_1.isSuperProperty)(node) &&
            isStaticPropertyDeclarationOrClassStaticBlock(currentClassElement) &&
            (lexicalEnvironment === null || lexicalEnvironment === void 0 ? void 0 : lexicalEnvironment.data)) {
            var _a = lexicalEnvironment.data, classConstructor = _a.classConstructor, superClassReference = _a.superClassReference, facts = _a.facts;
            if (facts & 1 /* ClassFacts.ClassWasDecorated */) {
                return visitInvalidSuperProperty(node);
            }
            else if (classConstructor && superClassReference) {
                var name_10 = (0, ts_1.isElementAccessExpression)(node) ? (0, ts_1.visitNode)(node.argumentExpression, visitor, ts_1.isExpression) :
                    (0, ts_1.isIdentifier)(node.name) ? factory.createStringLiteralFromNode(node.name) :
                        undefined;
                if (name_10) {
                    var temp = factory.createTempVariable(/*recordTempVariable*/ undefined);
                    return factory.createAssignmentTargetWrapper(temp, factory.createReflectSetCall(superClassReference, name_10, temp, classConstructor));
                }
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
        if ((0, ts_1.isNamedEvaluation)(node, isAnonymousClassNeedingAssignedName)) {
            var left = visitDestructuringAssignmentTarget(node.left);
            var assignedName_6 = getAssignedNameOfIdentifier(node.left, node.right);
            var right = (0, ts_1.visitNode)(node.right, function (node) { return namedEvaluationVisitor(node, assignedName_6); }, ts_1.isExpression);
            return factory.updateBinaryExpression(node, left, node.operatorToken, right);
        }
        if ((0, ts_1.isAssignmentExpression)(node, /*excludeCompoundAssignment*/ true)) {
            var left = visitDestructuringAssignmentTarget(node.left);
            var right = (0, ts_1.visitNode)(node.right, visitor, ts_1.isExpression);
            return factory.updateBinaryExpression(node, left, node.operatorToken, right);
        }
        return visitDestructuringAssignmentTarget(node);
    }
    function visitAssignmentRestElement(node) {
        if ((0, ts_1.isLeftHandSideExpression)(node.expression)) {
            var expression = visitDestructuringAssignmentTarget(node.expression);
            return factory.updateSpreadElement(node, expression);
        }
        return (0, ts_1.visitEachChild)(node, visitor, context);
    }
    function visitArrayAssignmentElement(node) {
        if ((0, ts_1.isArrayBindingOrAssignmentElement)(node)) {
            if ((0, ts_1.isSpreadElement)(node))
                return visitAssignmentRestElement(node);
            if (!(0, ts_1.isOmittedExpression)(node))
                return visitAssignmentElement(node);
        }
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
            var assignedName_7 = getAssignedNameOfIdentifier(node.name, node.objectAssignmentInitializer);
            var objectAssignmentInitializer = (0, ts_1.visitNode)(node.objectAssignmentInitializer, function (node) { return namedEvaluationVisitor(node, assignedName_7); }, ts_1.isExpression);
            return factory.updateShorthandPropertyAssignment(node, node.name, objectAssignmentInitializer);
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
            // Transforms private names in destructuring assignment array bindings.
            // Transforms SuperProperty assignments in destructuring assignment array bindings in static initializers.
            //
            // Source:
            // ([ this.#myProp ] = [ "hello" ]);
            //
            // Transformation:
            // [ { set value(x) { this.#myProp = x; } }.value ] = [ "hello" ];
            return factory.updateArrayLiteralExpression(node, (0, ts_1.visitNodes)(node.elements, visitArrayAssignmentElement, ts_1.isExpression));
        }
        else {
            // Transforms private names in destructuring assignment object bindings.
            // Transforms SuperProperty assignments in destructuring assignment object bindings in static initializers.
            //
            // Source:
            // ({ stringProperty: this.#myProp } = { stringProperty: "hello" });
            //
            // Transformation:
            // ({ stringProperty: { set value(x) { this.#myProp = x; } }.value }) = { stringProperty: "hello" };
            return factory.updateObjectLiteralExpression(node, (0, ts_1.visitNodes)(node.properties, visitObjectAssignmentElement, ts_1.isObjectLiteralElementLike));
        }
    }
    function onEmitNode(hint, node, emitCallback) {
        var original = (0, ts_1.getOriginalNode)(node);
        var lex = lexicalEnvironmentMap.get(original);
        if (lex) {
            // If we've associated a lexical environment with the original node for this node, use it explicitly.
            var savedLexicalEnvironment = lexicalEnvironment;
            var savedPreviousShouldSubstituteThisWithClassThis = previousShouldSubstituteThisWithClassThis;
            lexicalEnvironment = lex;
            previousShouldSubstituteThisWithClassThis = shouldSubstituteThisWithClassThis;
            shouldSubstituteThisWithClassThis = !(0, ts_1.isClassStaticBlockDeclaration)(original) || !((0, ts_1.getInternalEmitFlags)(original) & 32 /* InternalEmitFlags.TransformPrivateStaticElements */);
            previousOnEmitNode(hint, node, emitCallback);
            shouldSubstituteThisWithClassThis = previousShouldSubstituteThisWithClassThis;
            previousShouldSubstituteThisWithClassThis = savedPreviousShouldSubstituteThisWithClassThis;
            lexicalEnvironment = savedLexicalEnvironment;
            return;
        }
        switch (node.kind) {
            case 217 /* SyntaxKind.FunctionExpression */:
                if ((0, ts_1.isArrowFunction)(original) || (0, ts_1.getEmitFlags)(node) & 524288 /* EmitFlags.AsyncFunctionBody */) {
                    // Arrow functions and functions that serve as the transformed body of an async function should
                    // preserve the outer lexical environment.
                    break;
                }
            // falls through
            case 261 /* SyntaxKind.FunctionDeclaration */:
            case 175 /* SyntaxKind.Constructor */:
            case 176 /* SyntaxKind.GetAccessor */:
            case 177 /* SyntaxKind.SetAccessor */:
            case 173 /* SyntaxKind.MethodDeclaration */:
            case 171 /* SyntaxKind.PropertyDeclaration */: {
                // Other function bodies and property declarations should clear the lexical environment.
                // Note that this won't happen if a lexical environment was bound to the original node as that
                // was handled above.
                var savedLexicalEnvironment = lexicalEnvironment;
                var savedPreviousShouldSubstituteThisWithClassThis = previousShouldSubstituteThisWithClassThis;
                lexicalEnvironment = undefined;
                previousShouldSubstituteThisWithClassThis = shouldSubstituteThisWithClassThis;
                shouldSubstituteThisWithClassThis = false;
                previousOnEmitNode(hint, node, emitCallback);
                shouldSubstituteThisWithClassThis = previousShouldSubstituteThisWithClassThis;
                previousShouldSubstituteThisWithClassThis = savedPreviousShouldSubstituteThisWithClassThis;
                lexicalEnvironment = savedLexicalEnvironment;
                return;
            }
            case 166 /* SyntaxKind.ComputedPropertyName */: {
                // Computed property names should use the outer lexical environment.
                var savedLexicalEnvironment = lexicalEnvironment;
                var savedShouldSubstituteThisWithClassThis = shouldSubstituteThisWithClassThis;
                lexicalEnvironment = lexicalEnvironment === null || lexicalEnvironment === void 0 ? void 0 : lexicalEnvironment.previous;
                shouldSubstituteThisWithClassThis = previousShouldSubstituteThisWithClassThis;
                previousOnEmitNode(hint, node, emitCallback);
                shouldSubstituteThisWithClassThis = savedShouldSubstituteThisWithClassThis;
                lexicalEnvironment = savedLexicalEnvironment;
                return;
            }
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
        if (hint === 1 /* EmitHint.Expression */) {
            return substituteExpression(node);
        }
        return node;
    }
    function substituteExpression(node) {
        switch (node.kind) {
            case 80 /* SyntaxKind.Identifier */:
                return substituteExpressionIdentifier(node);
            case 110 /* SyntaxKind.ThisKeyword */:
                return substituteThisExpression(node);
        }
        return node;
    }
    function substituteThisExpression(node) {
        if (enabledSubstitutions & 2 /* ClassPropertySubstitutionFlags.ClassStaticThisOrSuperReference */ &&
            (lexicalEnvironment === null || lexicalEnvironment === void 0 ? void 0 : lexicalEnvironment.data) &&
            !noSubstitution.has(node)) {
            var _a = lexicalEnvironment.data, facts = _a.facts, classConstructor = _a.classConstructor, classThis = _a.classThis;
            if (facts & 1 /* ClassFacts.ClassWasDecorated */ && legacyDecorators) {
                return factory.createParenthesizedExpression(factory.createVoidZero());
            }
            var substituteThis = shouldSubstituteThisWithClassThis ? classThis !== null && classThis !== void 0 ? classThis : classConstructor : classConstructor;
            if (substituteThis) {
                return (0, ts_1.setTextRange)((0, ts_1.setOriginalNode)(factory.cloneNode(substituteThis), node), node);
            }
        }
        return node;
    }
    function substituteExpressionIdentifier(node) {
        return trySubstituteClassAlias(node) || node;
    }
    function trySubstituteClassAlias(node) {
        if (enabledSubstitutions & 1 /* ClassPropertySubstitutionFlags.ClassAliases */) {
            if (resolver.getNodeCheckFlags(node) & 2097152 /* NodeCheckFlags.ConstructorReferenceInClass */) {
                // Due to the emit for class decorators, any reference to the class from inside of the class body
                // must instead be rewritten to point to a temporary variable to avoid issues with the double-bind
                // behavior of class names in ES6.
                // Also, when emitting statics for class expressions, we must substitute a class alias for
                // constructor references in static property initializers.
                var declaration = resolver.getReferencedValueDeclaration(node);
                if (declaration) {
                    var classAlias = classAliases[declaration.id]; // TODO: GH#18217
                    if (classAlias) {
                        var clone = factory.cloneNode(classAlias);
                        (0, ts_1.setSourceMapRange)(clone, node);
                        (0, ts_1.setCommentRange)(clone, node);
                        return clone;
                    }
                }
            }
        }
        return undefined;
    }
}
exports.transformClassFields = transformClassFields;
function createPrivateStaticFieldInitializer(factory, variableName, initializer) {
    return factory.createAssignment(variableName, factory.createObjectLiteralExpression([
        factory.createPropertyAssignment("value", initializer || factory.createVoidZero())
    ]));
}
function createPrivateInstanceFieldInitializer(factory, receiver, initializer, weakMapName) {
    return factory.createCallExpression(factory.createPropertyAccessExpression(weakMapName, "set"), 
    /*typeArguments*/ undefined, [receiver, initializer || factory.createVoidZero()]);
}
function createPrivateInstanceMethodInitializer(factory, receiver, weakSetName) {
    return factory.createCallExpression(factory.createPropertyAccessExpression(weakSetName, "add"), 
    /*typeArguments*/ undefined, [receiver]);
}
function isReservedPrivateName(node) {
    return !(0, ts_1.isGeneratedPrivateIdentifier)(node) && node.escapedText === "#constructor";
}
function isPrivateIdentifierInExpression(node) {
    return (0, ts_1.isPrivateIdentifier)(node.left)
        && node.operatorToken.kind === 103 /* SyntaxKind.InKeyword */;
}
function isStaticPropertyDeclaration(node) {
    return (0, ts_1.isPropertyDeclaration)(node) && (0, ts_1.hasStaticModifier)(node);
}
function isStaticPropertyDeclarationOrClassStaticBlock(node) {
    return (0, ts_1.isClassStaticBlockDeclaration)(node) || isStaticPropertyDeclaration(node);
}
