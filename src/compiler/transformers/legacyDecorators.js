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
exports.transformLegacyDecorators = void 0;
var ts_1 = require("../_namespaces/ts");
/** @internal */
function transformLegacyDecorators(context) {
    var factory = context.factory, emitHelpers = context.getEmitHelperFactory, hoistVariableDeclaration = context.hoistVariableDeclaration;
    var resolver = context.getEmitResolver();
    var compilerOptions = context.getCompilerOptions();
    var languageVersion = (0, ts_1.getEmitScriptTarget)(compilerOptions);
    // Save the previous transformation hooks.
    var previousOnSubstituteNode = context.onSubstituteNode;
    // Set new transformation hooks.
    context.onSubstituteNode = onSubstituteNode;
    /**
     * A map that keeps track of aliases created for classes with decorators to avoid issues
     * with the double-binding behavior of classes.
     */
    var classAliases;
    return (0, ts_1.chainBundle)(context, transformSourceFile);
    function transformSourceFile(node) {
        var visited = (0, ts_1.visitEachChild)(node, visitor, context);
        (0, ts_1.addEmitHelpers)(visited, context.readEmitHelpers());
        return visited;
    }
    function modifierVisitor(node) {
        return (0, ts_1.isDecorator)(node) ? undefined : node;
    }
    function visitor(node) {
        if (!(node.transformFlags & 33554432 /* TransformFlags.ContainsDecorators */)) {
            return node;
        }
        switch (node.kind) {
            case 169 /* SyntaxKind.Decorator */:
                // Decorators are elided. They will be emitted as part of `visitClassDeclaration`.
                return undefined;
            case 262 /* SyntaxKind.ClassDeclaration */:
                return visitClassDeclaration(node);
            case 230 /* SyntaxKind.ClassExpression */:
                return visitClassExpression(node);
            case 175 /* SyntaxKind.Constructor */:
                return visitConstructorDeclaration(node);
            case 173 /* SyntaxKind.MethodDeclaration */:
                return visitMethodDeclaration(node);
            case 177 /* SyntaxKind.SetAccessor */:
                return visitSetAccessorDeclaration(node);
            case 176 /* SyntaxKind.GetAccessor */:
                return visitGetAccessorDeclaration(node);
            case 171 /* SyntaxKind.PropertyDeclaration */:
                return visitPropertyDeclaration(node);
            case 168 /* SyntaxKind.Parameter */:
                return visitParameterDeclaration(node);
            default:
                return (0, ts_1.visitEachChild)(node, visitor, context);
        }
    }
    function visitClassDeclaration(node) {
        if (!((0, ts_1.classOrConstructorParameterIsDecorated)(/*useLegacyDecorators*/ true, node) || (0, ts_1.childIsDecorated)(/*useLegacyDecorators*/ true, node))) {
            return (0, ts_1.visitEachChild)(node, visitor, context);
        }
        var statements = (0, ts_1.classOrConstructorParameterIsDecorated)(/*useLegacyDecorators*/ true, node) ?
            transformClassDeclarationWithClassDecorators(node, node.name) :
            transformClassDeclarationWithoutClassDecorators(node, node.name);
        return (0, ts_1.singleOrMany)(statements);
    }
    function decoratorContainsPrivateIdentifierInExpression(decorator) {
        return !!(decorator.transformFlags & 536870912 /* TransformFlags.ContainsPrivateIdentifierInExpression */);
    }
    function parameterDecoratorsContainPrivateIdentifierInExpression(parameterDecorators) {
        return (0, ts_1.some)(parameterDecorators, decoratorContainsPrivateIdentifierInExpression);
    }
    function hasClassElementWithDecoratorContainingPrivateIdentifierInExpression(node) {
        for (var _i = 0, _a = node.members; _i < _a.length; _i++) {
            var member = _a[_i];
            if (!(0, ts_1.canHaveDecorators)(member))
                continue;
            var allDecorators = (0, ts_1.getAllDecoratorsOfClassElement)(member, node, /*useLegacyDecorators*/ true);
            if ((0, ts_1.some)(allDecorators === null || allDecorators === void 0 ? void 0 : allDecorators.decorators, decoratorContainsPrivateIdentifierInExpression))
                return true;
            if ((0, ts_1.some)(allDecorators === null || allDecorators === void 0 ? void 0 : allDecorators.parameters, parameterDecoratorsContainPrivateIdentifierInExpression))
                return true;
        }
        return false;
    }
    function transformDecoratorsOfClassElements(node, members) {
        var decorationStatements = [];
        addClassElementDecorationStatements(decorationStatements, node, /*isStatic*/ false);
        addClassElementDecorationStatements(decorationStatements, node, /*isStatic*/ true);
        if (hasClassElementWithDecoratorContainingPrivateIdentifierInExpression(node)) {
            members = (0, ts_1.setTextRange)(factory.createNodeArray(__spreadArray(__spreadArray([], members, true), [
                factory.createClassStaticBlockDeclaration(factory.createBlock(decorationStatements, /*multiLine*/ true))
            ], false)), members);
            decorationStatements = undefined;
        }
        return { decorationStatements: decorationStatements, members: members };
    }
    /**
     * Transforms a non-decorated class declaration.
     *
     * @param node A ClassDeclaration node.
     * @param name The name of the class.
     */
    function transformClassDeclarationWithoutClassDecorators(node, name) {
        //  ${modifiers} class ${name} ${heritageClauses} {
        //      ${members}
        //  }
        var _a;
        var modifiers = (0, ts_1.visitNodes)(node.modifiers, modifierVisitor, ts_1.isModifier);
        var heritageClauses = (0, ts_1.visitNodes)(node.heritageClauses, visitor, ts_1.isHeritageClause);
        var members = (0, ts_1.visitNodes)(node.members, visitor, ts_1.isClassElement);
        var decorationStatements = [];
        (_a = transformDecoratorsOfClassElements(node, members), members = _a.members, decorationStatements = _a.decorationStatements);
        var updated = factory.updateClassDeclaration(node, modifiers, name, 
        /*typeParameters*/ undefined, heritageClauses, members);
        return (0, ts_1.addRange)([updated], decorationStatements);
    }
    /**
     * Transforms a decorated class declaration and appends the resulting statements. If
     * the class requires an alias to avoid issues with double-binding, the alias is returned.
     */
    function transformClassDeclarationWithClassDecorators(node, name) {
        // When we emit an ES6 class that has a class decorator, we must tailor the
        // emit to certain specific cases.
        //
        // In the simplest case, we emit the class declaration as a let declaration, and
        // evaluate decorators after the close of the class body:
        //
        //  [Example 1]
        //  ---------------------------------------------------------------------
        //  TypeScript                      | Javascript
        //  ---------------------------------------------------------------------
        //  @dec                            | let C = class C {
        //  class C {                       | }
        //  }                               | C = __decorate([dec], C);
        //  ---------------------------------------------------------------------
        //  @dec                            | let C = class C {
        //  export class C {                | }
        //  }                               | C = __decorate([dec], C);
        //                                  | export { C };
        //  ---------------------------------------------------------------------
        //
        // If a class declaration contains a reference to itself *inside* of the class body,
        // this introduces two bindings to the class: One outside of the class body, and one
        // inside of the class body. If we apply decorators as in [Example 1] above, there
        // is the possibility that the decorator `dec` will return a new value for the
        // constructor, which would result in the binding inside of the class no longer
        // pointing to the same reference as the binding outside of the class.
        //
        // As a result, we must instead rewrite all references to the class *inside* of the
        // class body to instead point to a local temporary alias for the class:
        //
        //  [Example 2]
        //  ---------------------------------------------------------------------
        //  TypeScript                      | Javascript
        //  ---------------------------------------------------------------------
        //  @dec                            | let C = C_1 = class C {
        //  class C {                       |   static x() { return C_1.y; }
        //    static x() { return C.y; }    | }
        //    static y = 1;                 | C.y = 1;
        //  }                               | C = C_1 = __decorate([dec], C);
        //                                  | var C_1;
        //  ---------------------------------------------------------------------
        //  @dec                            | let C = class C {
        //  export class C {                |   static x() { return C_1.y; }
        //    static x() { return C.y; }    | }
        //    static y = 1;                 | C.y = 1;
        //  }                               | C = C_1 = __decorate([dec], C);
        //                                  | export { C };
        //                                  | var C_1;
        //  ---------------------------------------------------------------------
        //
        // If a class declaration is the default export of a module, we instead emit
        // the export after the decorated declaration:
        //
        //  [Example 3]
        //  ---------------------------------------------------------------------
        //  TypeScript                      | Javascript
        //  ---------------------------------------------------------------------
        //  @dec                            | let default_1 = class {
        //  export default class {          | }
        //  }                               | default_1 = __decorate([dec], default_1);
        //                                  | export default default_1;
        //  ---------------------------------------------------------------------
        //  @dec                            | let C = class C {
        //  export default class C {        | }
        //  }                               | C = __decorate([dec], C);
        //                                  | export default C;
        //  ---------------------------------------------------------------------
        //
        // If the class declaration is the default export and a reference to itself
        // inside of the class body, we must emit both an alias for the class *and*
        // move the export after the declaration:
        //
        //  [Example 4]
        //  ---------------------------------------------------------------------
        //  TypeScript                      | Javascript
        //  ---------------------------------------------------------------------
        //  @dec                            | let C = class C {
        //  export default class C {        |   static x() { return C_1.y; }
        //    static x() { return C.y; }    | }
        //    static y = 1;                 | C.y = 1;
        //  }                               | C = C_1 = __decorate([dec], C);
        //                                  | export default C;
        //                                  | var C_1;
        //  ---------------------------------------------------------------------
        //
        var _a;
        var isExport = (0, ts_1.hasSyntacticModifier)(node, 1 /* ModifierFlags.Export */);
        var isDefault = (0, ts_1.hasSyntacticModifier)(node, 1024 /* ModifierFlags.Default */);
        var modifiers = (0, ts_1.visitNodes)(node.modifiers, function (node) { return (0, ts_1.isExportOrDefaultModifier)(node) || (0, ts_1.isDecorator)(node) ? undefined : node; }, ts_1.isModifierLike);
        var location = (0, ts_1.moveRangePastModifiers)(node);
        var classAlias = getClassAliasIfNeeded(node);
        // When we transform to ES5/3 this will be moved inside an IIFE and should reference the name
        // without any block-scoped variable collision handling
        var declName = languageVersion < 2 /* ScriptTarget.ES2015 */ ?
            factory.getInternalName(node, /*allowComments*/ false, /*allowSourceMaps*/ true) :
            factory.getLocalName(node, /*allowComments*/ false, /*allowSourceMaps*/ true);
        //  ... = class ${name} ${heritageClauses} {
        //      ${members}
        //  }
        var heritageClauses = (0, ts_1.visitNodes)(node.heritageClauses, visitor, ts_1.isHeritageClause);
        var members = (0, ts_1.visitNodes)(node.members, visitor, ts_1.isClassElement);
        var decorationStatements = [];
        (_a = transformDecoratorsOfClassElements(node, members), members = _a.members, decorationStatements = _a.decorationStatements);
        // If we're emitting to ES2022 or later then we need to reassign the class alias before
        // static initializers are evaluated.
        var assignClassAliasInStaticBlock = languageVersion >= 9 /* ScriptTarget.ES2022 */ &&
            !!classAlias &&
            (0, ts_1.some)(members, function (member) {
                return (0, ts_1.isPropertyDeclaration)(member) && (0, ts_1.hasSyntacticModifier)(member, 32 /* ModifierFlags.Static */) ||
                    (0, ts_1.isClassStaticBlockDeclaration)(member);
            });
        if (assignClassAliasInStaticBlock) {
            members = (0, ts_1.setTextRange)(factory.createNodeArray(__spreadArray([
                factory.createClassStaticBlockDeclaration(factory.createBlock([
                    factory.createExpressionStatement(factory.createAssignment(classAlias, factory.createThis()))
                ]))
            ], members, true)), members);
        }
        var classExpression = factory.createClassExpression(modifiers, name && (0, ts_1.isGeneratedIdentifier)(name) ? undefined : name, 
        /*typeParameters*/ undefined, heritageClauses, members);
        (0, ts_1.setOriginalNode)(classExpression, node);
        (0, ts_1.setTextRange)(classExpression, location);
        //  let ${name} = ${classExpression} where name is either declaredName if the class doesn't contain self-reference
        //                                         or decoratedClassAlias if the class contain self-reference.
        var varDecl = factory.createVariableDeclaration(declName, 
        /*exclamationToken*/ undefined, 
        /*type*/ undefined, classAlias && !assignClassAliasInStaticBlock ? factory.createAssignment(classAlias, classExpression) : classExpression);
        (0, ts_1.setOriginalNode)(varDecl, node);
        var varModifiers;
        if (isExport && !isDefault) {
            varModifiers = factory.createModifiersFromModifierFlags(1 /* ModifierFlags.Export */);
        }
        var statement = factory.createVariableStatement(varModifiers, factory.createVariableDeclarationList([
            varDecl
        ], 1 /* NodeFlags.Let */));
        (0, ts_1.setOriginalNode)(statement, node);
        (0, ts_1.setTextRange)(statement, location);
        (0, ts_1.setCommentRange)(statement, node);
        var statements = [statement];
        (0, ts_1.addRange)(statements, decorationStatements);
        addConstructorDecorationStatement(statements, node);
        if (isExport && isDefault) {
            statements.push(factory.createExportAssignment(
            /*modifiers*/ undefined, 
            /*isExportEquals*/ false, declName));
        }
        return statements;
    }
    function visitClassExpression(node) {
        // Legacy decorators were not supported on class expressions
        return factory.updateClassExpression(node, (0, ts_1.visitNodes)(node.modifiers, modifierVisitor, ts_1.isModifier), node.name, 
        /*typeParameters*/ undefined, (0, ts_1.visitNodes)(node.heritageClauses, visitor, ts_1.isHeritageClause), (0, ts_1.visitNodes)(node.members, visitor, ts_1.isClassElement));
    }
    function visitConstructorDeclaration(node) {
        return factory.updateConstructorDeclaration(node, (0, ts_1.visitNodes)(node.modifiers, modifierVisitor, ts_1.isModifier), (0, ts_1.visitNodes)(node.parameters, visitor, ts_1.isParameter), (0, ts_1.visitNode)(node.body, visitor, ts_1.isBlock));
    }
    function finishClassElement(updated, original) {
        if (updated !== original) {
            // While we emit the source map for the node after skipping decorators and modifiers,
            // we need to emit the comments for the original range.
            (0, ts_1.setCommentRange)(updated, original);
            (0, ts_1.setSourceMapRange)(updated, (0, ts_1.moveRangePastModifiers)(original));
        }
        return updated;
    }
    function visitMethodDeclaration(node) {
        return finishClassElement(factory.updateMethodDeclaration(node, (0, ts_1.visitNodes)(node.modifiers, modifierVisitor, ts_1.isModifier), node.asteriskToken, ts_1.Debug.checkDefined((0, ts_1.visitNode)(node.name, visitor, ts_1.isPropertyName)), 
        /*questionToken*/ undefined, 
        /*typeParameters*/ undefined, (0, ts_1.visitNodes)(node.parameters, visitor, ts_1.isParameter), 
        /*type*/ undefined, (0, ts_1.visitNode)(node.body, visitor, ts_1.isBlock)), node);
    }
    function visitGetAccessorDeclaration(node) {
        return finishClassElement(factory.updateGetAccessorDeclaration(node, (0, ts_1.visitNodes)(node.modifiers, modifierVisitor, ts_1.isModifier), ts_1.Debug.checkDefined((0, ts_1.visitNode)(node.name, visitor, ts_1.isPropertyName)), (0, ts_1.visitNodes)(node.parameters, visitor, ts_1.isParameter), 
        /*type*/ undefined, (0, ts_1.visitNode)(node.body, visitor, ts_1.isBlock)), node);
    }
    function visitSetAccessorDeclaration(node) {
        return finishClassElement(factory.updateSetAccessorDeclaration(node, (0, ts_1.visitNodes)(node.modifiers, modifierVisitor, ts_1.isModifier), ts_1.Debug.checkDefined((0, ts_1.visitNode)(node.name, visitor, ts_1.isPropertyName)), (0, ts_1.visitNodes)(node.parameters, visitor, ts_1.isParameter), (0, ts_1.visitNode)(node.body, visitor, ts_1.isBlock)), node);
    }
    function visitPropertyDeclaration(node) {
        if (node.flags & 16777216 /* NodeFlags.Ambient */ || (0, ts_1.hasSyntacticModifier)(node, 2 /* ModifierFlags.Ambient */)) {
            return undefined;
        }
        return finishClassElement(factory.updatePropertyDeclaration(node, (0, ts_1.visitNodes)(node.modifiers, modifierVisitor, ts_1.isModifier), ts_1.Debug.checkDefined((0, ts_1.visitNode)(node.name, visitor, ts_1.isPropertyName)), 
        /*questionOrExclamationToken*/ undefined, 
        /*type*/ undefined, (0, ts_1.visitNode)(node.initializer, visitor, ts_1.isExpression)), node);
    }
    function visitParameterDeclaration(node) {
        var updated = factory.updateParameterDeclaration(node, (0, ts_1.elideNodes)(factory, node.modifiers), node.dotDotDotToken, ts_1.Debug.checkDefined((0, ts_1.visitNode)(node.name, visitor, ts_1.isBindingName)), 
        /*questionToken*/ undefined, 
        /*type*/ undefined, (0, ts_1.visitNode)(node.initializer, visitor, ts_1.isExpression));
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
    function isSyntheticMetadataDecorator(node) {
        return (0, ts_1.isCallToHelper)(node.expression, "___metadata");
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
        // ensure that metadata decorators are last
        var _a = (0, ts_1.groupBy)(allDecorators.decorators, isSyntheticMetadataDecorator), decorators = _a.false, metadata = _a.true;
        var decoratorExpressions = [];
        (0, ts_1.addRange)(decoratorExpressions, (0, ts_1.map)(decorators, transformDecorator));
        (0, ts_1.addRange)(decoratorExpressions, (0, ts_1.flatMap)(allDecorators.parameters, transformDecoratorsOfParameter));
        (0, ts_1.addRange)(decoratorExpressions, (0, ts_1.map)(metadata, transformDecorator));
        return decoratorExpressions;
    }
    /**
     * Generates statements used to apply decorators to either the static or instance members
     * of a class.
     *
     * @param node The class node.
     * @param isStatic A value indicating whether to generate statements for static or
     *                 instance members.
     */
    function addClassElementDecorationStatements(statements, node, isStatic) {
        (0, ts_1.addRange)(statements, (0, ts_1.map)(generateClassElementDecorationExpressions(node, isStatic), function (expr) { return factory.createExpressionStatement(expr); }));
    }
    /**
     * Determines whether a class member is either a static or an instance member of a class
     * that is decorated, or has parameters that are decorated.
     *
     * @param member The class member.
     */
    function isDecoratedClassElement(member, isStaticElement, parent) {
        return (0, ts_1.nodeOrChildIsDecorated)(/*useLegacyDecorators*/ true, member, parent)
            && isStaticElement === (0, ts_1.isStatic)(member);
    }
    /**
     * Gets either the static or instance members of a class that are decorated, or have
     * parameters that are decorated.
     *
     * @param node The class containing the member.
     * @param isStatic A value indicating whether to retrieve static or instance members of
     *                 the class.
     */
    function getDecoratedClassElements(node, isStatic) {
        return (0, ts_1.filter)(node.members, function (m) { return isDecoratedClassElement(m, isStatic, node); });
    }
    /**
     * Generates expressions used to apply decorators to either the static or instance members
     * of a class.
     *
     * @param node The class node.
     * @param isStatic A value indicating whether to generate expressions for static or
     *                 instance members.
     */
    function generateClassElementDecorationExpressions(node, isStatic) {
        var members = getDecoratedClassElements(node, isStatic);
        var expressions;
        for (var _i = 0, members_1 = members; _i < members_1.length; _i++) {
            var member = members_1[_i];
            expressions = (0, ts_1.append)(expressions, generateClassElementDecorationExpression(node, member));
        }
        return expressions;
    }
    /**
     * Generates an expression used to evaluate class element decorators at runtime.
     *
     * @param node The class node that contains the member.
     * @param member The class member.
     */
    function generateClassElementDecorationExpression(node, member) {
        var allDecorators = (0, ts_1.getAllDecoratorsOfClassElement)(member, node, /*useLegacyDecorators*/ true);
        var decoratorExpressions = transformAllDecoratorsOfDeclaration(allDecorators);
        if (!decoratorExpressions) {
            return undefined;
        }
        // Emit the call to __decorate. Given the following:
        //
        //   class C {
        //     @dec method(@dec2 x) {}
        //     @dec get accessor() {}
        //     @dec prop;
        //   }
        //
        // The emit for a method is:
        //
        //   __decorate([
        //       dec,
        //       __param(0, dec2),
        //       __metadata("design:type", Function),
        //       __metadata("design:paramtypes", [Object]),
        //       __metadata("design:returntype", void 0)
        //   ], C.prototype, "method", null);
        //
        // The emit for an accessor is:
        //
        //   __decorate([
        //       dec
        //   ], C.prototype, "accessor", null);
        //
        // The emit for a property is:
        //
        //   __decorate([
        //       dec
        //   ], C.prototype, "prop");
        //
        var prefix = getClassMemberPrefix(node, member);
        var memberName = getExpressionForPropertyName(member, /*generateNameForComputedPropertyName*/ !(0, ts_1.hasSyntacticModifier)(member, 2 /* ModifierFlags.Ambient */));
        var descriptor = languageVersion > 0 /* ScriptTarget.ES3 */
            ? (0, ts_1.isPropertyDeclaration)(member) && !(0, ts_1.hasAccessorModifier)(member)
                // We emit `void 0` here to indicate to `__decorate` that it can invoke `Object.defineProperty` directly, but that it
                // should not invoke `Object.getOwnPropertyDescriptor`.
                ? factory.createVoidZero()
                // We emit `null` here to indicate to `__decorate` that it can invoke `Object.getOwnPropertyDescriptor` directly.
                // We have this extra argument here so that we can inject an explicit property descriptor at a later date.
                : factory.createNull()
            : undefined;
        var helper = emitHelpers().createDecorateHelper(decoratorExpressions, prefix, memberName, descriptor);
        (0, ts_1.setEmitFlags)(helper, 3072 /* EmitFlags.NoComments */);
        (0, ts_1.setSourceMapRange)(helper, (0, ts_1.moveRangePastModifiers)(member));
        return helper;
    }
    /**
     * Generates a __decorate helper call for a class constructor.
     *
     * @param node The class node.
     */
    function addConstructorDecorationStatement(statements, node) {
        var expression = generateConstructorDecorationExpression(node);
        if (expression) {
            statements.push((0, ts_1.setOriginalNode)(factory.createExpressionStatement(expression), node));
        }
    }
    /**
     * Generates a __decorate helper call for a class constructor.
     *
     * @param node The class node.
     */
    function generateConstructorDecorationExpression(node) {
        var allDecorators = (0, ts_1.getAllDecoratorsOfClass)(node);
        var decoratorExpressions = transformAllDecoratorsOfDeclaration(allDecorators);
        if (!decoratorExpressions) {
            return undefined;
        }
        var classAlias = classAliases && classAliases[(0, ts_1.getOriginalNodeId)(node)];
        // When we transform to ES5/3 this will be moved inside an IIFE and should reference the name
        // without any block-scoped variable collision handling
        var localName = languageVersion < 2 /* ScriptTarget.ES2015 */ ?
            factory.getInternalName(node, /*allowComments*/ false, /*allowSourceMaps*/ true) :
            factory.getDeclarationName(node, /*allowComments*/ false, /*allowSourceMaps*/ true);
        var decorate = emitHelpers().createDecorateHelper(decoratorExpressions, localName);
        var expression = factory.createAssignment(localName, classAlias ? factory.createAssignment(classAlias, decorate) : decorate);
        (0, ts_1.setEmitFlags)(expression, 3072 /* EmitFlags.NoComments */);
        (0, ts_1.setSourceMapRange)(expression, (0, ts_1.moveRangePastModifiers)(node));
        return expression;
    }
    /**
     * Transforms a decorator into an expression.
     *
     * @param decorator The decorator node.
     */
    function transformDecorator(decorator) {
        return ts_1.Debug.checkDefined((0, ts_1.visitNode)(decorator.expression, visitor, ts_1.isExpression));
    }
    /**
     * Transforms the decorators of a parameter.
     *
     * @param decorators The decorators for the parameter at the provided offset.
     * @param parameterOffset The offset of the parameter.
     */
    function transformDecoratorsOfParameter(decorators, parameterOffset) {
        var expressions;
        if (decorators) {
            expressions = [];
            for (var _i = 0, decorators_1 = decorators; _i < decorators_1.length; _i++) {
                var decorator = decorators_1[_i];
                var helper = emitHelpers().createParamHelper(transformDecorator(decorator), parameterOffset);
                (0, ts_1.setTextRange)(helper, decorator.expression);
                (0, ts_1.setEmitFlags)(helper, 3072 /* EmitFlags.NoComments */);
                expressions.push(helper);
            }
        }
        return expressions;
    }
    /**
     * Gets an expression that represents a property name (for decorated properties or enums).
     * For a computed property, a name is generated for the node.
     *
     * @param member The member whose name should be converted into an expression.
     */
    function getExpressionForPropertyName(member, generateNameForComputedPropertyName) {
        var name = member.name;
        if ((0, ts_1.isPrivateIdentifier)(name)) {
            return factory.createIdentifier("");
        }
        else if ((0, ts_1.isComputedPropertyName)(name)) {
            return generateNameForComputedPropertyName && !(0, ts_1.isSimpleInlineableExpression)(name.expression)
                ? factory.getGeneratedNameForNode(name)
                : name.expression;
        }
        else if ((0, ts_1.isIdentifier)(name)) {
            return factory.createStringLiteral((0, ts_1.idText)(name));
        }
        else {
            return factory.cloneNode(name);
        }
    }
    function enableSubstitutionForClassAliases() {
        if (!classAliases) {
            // We need to enable substitutions for identifiers. This allows us to
            // substitute class names inside of a class declaration.
            context.enableSubstitution(80 /* SyntaxKind.Identifier */);
            // Keep track of class aliases.
            classAliases = [];
        }
    }
    /**
     * Gets a local alias for a class declaration if it is a decorated class with an internal
     * reference to the static side of the class. This is necessary to avoid issues with
     * double-binding semantics for the class name.
     */
    function getClassAliasIfNeeded(node) {
        if (resolver.getNodeCheckFlags(node) & 1048576 /* NodeCheckFlags.ClassWithConstructorReference */) {
            enableSubstitutionForClassAliases();
            var classAlias = factory.createUniqueName(node.name && !(0, ts_1.isGeneratedIdentifier)(node.name) ? (0, ts_1.idText)(node.name) : "default");
            classAliases[(0, ts_1.getOriginalNodeId)(node)] = classAlias;
            hoistVariableDeclaration(classAlias);
            return classAlias;
        }
    }
    function getClassPrototype(node) {
        return factory.createPropertyAccessExpression(factory.getDeclarationName(node), "prototype");
    }
    function getClassMemberPrefix(node, member) {
        return (0, ts_1.isStatic)(member)
            ? factory.getDeclarationName(node)
            : getClassPrototype(node);
    }
    /**
     * Hooks node substitutions.
     *
     * @param hint A hint as to the intended usage of the node.
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
        }
        return node;
    }
    function substituteExpressionIdentifier(node) {
        var _a;
        return (_a = trySubstituteClassAlias(node)) !== null && _a !== void 0 ? _a : node;
    }
    function trySubstituteClassAlias(node) {
        if (classAliases) {
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
exports.transformLegacyDecorators = transformLegacyDecorators;
