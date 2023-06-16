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
exports.transformTypeScript = void 0;
var ts_1 = require("../_namespaces/ts");
/**
 * Indicates whether to emit type metadata in the new format.
 */
var USE_NEW_TYPE_METADATA_FORMAT = false;
/** @internal */
function transformTypeScript(context) {
    var factory = context.factory, emitHelpers = context.getEmitHelperFactory, startLexicalEnvironment = context.startLexicalEnvironment, resumeLexicalEnvironment = context.resumeLexicalEnvironment, endLexicalEnvironment = context.endLexicalEnvironment, hoistVariableDeclaration = context.hoistVariableDeclaration;
    var resolver = context.getEmitResolver();
    var compilerOptions = context.getCompilerOptions();
    var languageVersion = (0, ts_1.getEmitScriptTarget)(compilerOptions);
    var moduleKind = (0, ts_1.getEmitModuleKind)(compilerOptions);
    var legacyDecorators = !!compilerOptions.experimentalDecorators;
    var typeSerializer = compilerOptions.emitDecoratorMetadata ? (0, ts_1.createRuntimeTypeSerializer)(context) : undefined;
    // Save the previous transformation hooks.
    var previousOnEmitNode = context.onEmitNode;
    var previousOnSubstituteNode = context.onSubstituteNode;
    // Set new transformation hooks.
    context.onEmitNode = onEmitNode;
    context.onSubstituteNode = onSubstituteNode;
    // Enable substitution for property/element access to emit const enum values.
    context.enableSubstitution(210 /* SyntaxKind.PropertyAccessExpression */);
    context.enableSubstitution(211 /* SyntaxKind.ElementAccessExpression */);
    // These variables contain state that changes as we descend into the tree.
    var currentSourceFile;
    var currentNamespace;
    var currentNamespaceContainerName;
    var currentLexicalScope;
    var currentScopeFirstDeclarationsOfName;
    var currentClassHasParameterProperties;
    /**
     * Keeps track of whether expression substitution has been enabled for specific edge cases.
     * They are persisted between each SourceFile transformation and should not be reset.
     */
    var enabledSubstitutions;
    /**
     * Keeps track of whether we are within any containing namespaces when performing
     * just-in-time substitution while printing an expression identifier.
     */
    var applicableSubstitutions;
    return transformSourceFileOrBundle;
    function transformSourceFileOrBundle(node) {
        if (node.kind === 312 /* SyntaxKind.Bundle */) {
            return transformBundle(node);
        }
        return transformSourceFile(node);
    }
    function transformBundle(node) {
        return factory.createBundle(node.sourceFiles.map(transformSourceFile), (0, ts_1.mapDefined)(node.prepends, function (prepend) {
            if (prepend.kind === 314 /* SyntaxKind.InputFiles */) {
                return (0, ts_1.createUnparsedSourceFile)(prepend, "js");
            }
            return prepend;
        }));
    }
    /**
     * Transform TypeScript-specific syntax in a SourceFile.
     *
     * @param node A SourceFile node.
     */
    function transformSourceFile(node) {
        if (node.isDeclarationFile) {
            return node;
        }
        currentSourceFile = node;
        var visited = saveStateAndInvoke(node, visitSourceFile);
        (0, ts_1.addEmitHelpers)(visited, context.readEmitHelpers());
        currentSourceFile = undefined;
        return visited;
    }
    /**
     * Visits a node, saving and restoring state variables on the stack.
     *
     * @param node The node to visit.
     */
    function saveStateAndInvoke(node, f) {
        // Save state
        var savedCurrentScope = currentLexicalScope;
        var savedCurrentScopeFirstDeclarationsOfName = currentScopeFirstDeclarationsOfName;
        var savedCurrentClassHasParameterProperties = currentClassHasParameterProperties;
        // Handle state changes before visiting a node.
        onBeforeVisitNode(node);
        var visited = f(node);
        // Restore state
        if (currentLexicalScope !== savedCurrentScope) {
            currentScopeFirstDeclarationsOfName = savedCurrentScopeFirstDeclarationsOfName;
        }
        currentLexicalScope = savedCurrentScope;
        currentClassHasParameterProperties = savedCurrentClassHasParameterProperties;
        return visited;
    }
    /**
     * Performs actions that should always occur immediately before visiting a node.
     *
     * @param node The node to visit.
     */
    function onBeforeVisitNode(node) {
        switch (node.kind) {
            case 311 /* SyntaxKind.SourceFile */:
            case 268 /* SyntaxKind.CaseBlock */:
            case 267 /* SyntaxKind.ModuleBlock */:
            case 240 /* SyntaxKind.Block */:
                currentLexicalScope = node;
                currentScopeFirstDeclarationsOfName = undefined;
                break;
            case 262 /* SyntaxKind.ClassDeclaration */:
            case 261 /* SyntaxKind.FunctionDeclaration */:
                if ((0, ts_1.hasSyntacticModifier)(node, 2 /* ModifierFlags.Ambient */)) {
                    break;
                }
                // Record these declarations provided that they have a name.
                if (node.name) {
                    recordEmittedDeclarationInScope(node);
                }
                else {
                    // These nodes should always have names unless they are default-exports;
                    // however, class declaration parsing allows for undefined names, so syntactically invalid
                    // programs may also have an undefined name.
                    ts_1.Debug.assert(node.kind === 262 /* SyntaxKind.ClassDeclaration */ || (0, ts_1.hasSyntacticModifier)(node, 1024 /* ModifierFlags.Default */));
                }
                break;
        }
    }
    /**
     * General-purpose node visitor.
     *
     * @param node The node to visit.
     */
    function visitor(node) {
        return saveStateAndInvoke(node, visitorWorker);
    }
    /**
     * Visits and possibly transforms any node.
     *
     * @param node The node to visit.
     */
    function visitorWorker(node) {
        if (node.transformFlags & 1 /* TransformFlags.ContainsTypeScript */) {
            return visitTypeScript(node);
        }
        return node;
    }
    /**
     * Specialized visitor that visits the immediate children of a SourceFile.
     *
     * @param node The node to visit.
     */
    function sourceElementVisitor(node) {
        return saveStateAndInvoke(node, sourceElementVisitorWorker);
    }
    /**
     * Specialized visitor that visits the immediate children of a SourceFile.
     *
     * @param node The node to visit.
     */
    function sourceElementVisitorWorker(node) {
        switch (node.kind) {
            case 271 /* SyntaxKind.ImportDeclaration */:
            case 270 /* SyntaxKind.ImportEqualsDeclaration */:
            case 276 /* SyntaxKind.ExportAssignment */:
            case 277 /* SyntaxKind.ExportDeclaration */:
                return visitElidableStatement(node);
            default:
                return visitorWorker(node);
        }
    }
    function visitElidableStatement(node) {
        var parsed = (0, ts_1.getParseTreeNode)(node);
        if (parsed !== node) {
            // If the node has been transformed by a `before` transformer, perform no ellision on it
            // As the type information we would attempt to lookup to perform ellision is potentially unavailable for the synthesized nodes
            // We do not reuse `visitorWorker`, as the ellidable statement syntax kinds are technically unrecognized by the switch-case in `visitTypeScript`,
            // and will trigger debug failures when debug verbosity is turned up
            if (node.transformFlags & 1 /* TransformFlags.ContainsTypeScript */) {
                // This node contains TypeScript, so we should visit its children.
                return (0, ts_1.visitEachChild)(node, visitor, context);
            }
            // Otherwise, we can just return the node
            return node;
        }
        switch (node.kind) {
            case 271 /* SyntaxKind.ImportDeclaration */:
                return visitImportDeclaration(node);
            case 270 /* SyntaxKind.ImportEqualsDeclaration */:
                return visitImportEqualsDeclaration(node);
            case 276 /* SyntaxKind.ExportAssignment */:
                return visitExportAssignment(node);
            case 277 /* SyntaxKind.ExportDeclaration */:
                return visitExportDeclaration(node);
            default:
                ts_1.Debug.fail("Unhandled ellided statement");
        }
    }
    /**
     * Specialized visitor that visits the immediate children of a namespace.
     *
     * @param node The node to visit.
     */
    function namespaceElementVisitor(node) {
        return saveStateAndInvoke(node, namespaceElementVisitorWorker);
    }
    /**
     * Specialized visitor that visits the immediate children of a namespace.
     *
     * @param node The node to visit.
     */
    function namespaceElementVisitorWorker(node) {
        if (node.kind === 277 /* SyntaxKind.ExportDeclaration */ ||
            node.kind === 271 /* SyntaxKind.ImportDeclaration */ ||
            node.kind === 272 /* SyntaxKind.ImportClause */ ||
            (node.kind === 270 /* SyntaxKind.ImportEqualsDeclaration */ &&
                node.moduleReference.kind === 282 /* SyntaxKind.ExternalModuleReference */)) {
            // do not emit ES6 imports and exports since they are illegal inside a namespace
            return undefined;
        }
        else if (node.transformFlags & 1 /* TransformFlags.ContainsTypeScript */ || (0, ts_1.hasSyntacticModifier)(node, 1 /* ModifierFlags.Export */)) {
            return visitTypeScript(node);
        }
        return node;
    }
    /**
     * Gets a specialized visitor that visits the immediate children of a class with TypeScript syntax.
     *
     * @param parent The class containing the elements to visit.
     */
    function getClassElementVisitor(parent) {
        return function (node) { return saveStateAndInvoke(node, function (n) { return classElementVisitorWorker(n, parent); }); };
    }
    /**
     * Specialized visitor that visits the immediate children of a class with TypeScript syntax.
     *
     * @param node The node to visit.
     */
    function classElementVisitorWorker(node, parent) {
        switch (node.kind) {
            case 175 /* SyntaxKind.Constructor */:
                return visitConstructor(node);
            case 171 /* SyntaxKind.PropertyDeclaration */:
                // Property declarations are not TypeScript syntax, but they must be visited
                // for the decorator transformation.
                return visitPropertyDeclaration(node, parent);
            case 176 /* SyntaxKind.GetAccessor */:
                // Get Accessors can have TypeScript modifiers, decorators, and type annotations.
                return visitGetAccessor(node, parent);
            case 177 /* SyntaxKind.SetAccessor */:
                // Set Accessors can have TypeScript modifiers and type annotations.
                return visitSetAccessor(node, parent);
            case 173 /* SyntaxKind.MethodDeclaration */:
                // TypeScript method declarations may have decorators, modifiers
                // or type annotations.
                return visitMethodDeclaration(node, parent);
            case 174 /* SyntaxKind.ClassStaticBlockDeclaration */:
                return (0, ts_1.visitEachChild)(node, visitor, context);
            case 239 /* SyntaxKind.SemicolonClassElement */:
                return node;
            case 180 /* SyntaxKind.IndexSignature */:
                // Index signatures are elided
                return;
            default:
                return ts_1.Debug.failBadSyntaxKind(node);
        }
    }
    function getObjectLiteralElementVisitor(parent) {
        return function (node) { return saveStateAndInvoke(node, function (n) { return objectLiteralElementVisitorWorker(n, parent); }); };
    }
    function objectLiteralElementVisitorWorker(node, parent) {
        switch (node.kind) {
            case 302 /* SyntaxKind.PropertyAssignment */:
            case 303 /* SyntaxKind.ShorthandPropertyAssignment */:
            case 304 /* SyntaxKind.SpreadAssignment */:
                return visitor(node);
            case 176 /* SyntaxKind.GetAccessor */:
                // Get Accessors can have TypeScript modifiers, decorators, and type annotations.
                return visitGetAccessor(node, parent);
            case 177 /* SyntaxKind.SetAccessor */:
                // Set Accessors can have TypeScript modifiers and type annotations.
                return visitSetAccessor(node, parent);
            case 173 /* SyntaxKind.MethodDeclaration */:
                // TypeScript method declarations may have decorators, modifiers
                // or type annotations.
                return visitMethodDeclaration(node, parent);
            default:
                return ts_1.Debug.failBadSyntaxKind(node);
        }
    }
    function decoratorElidingVisitor(node) {
        return (0, ts_1.isDecorator)(node) ? undefined : visitor(node);
    }
    function modifierElidingVisitor(node) {
        return (0, ts_1.isModifier)(node) ? undefined : visitor(node);
    }
    function modifierVisitor(node) {
        if ((0, ts_1.isDecorator)(node))
            return undefined;
        if ((0, ts_1.modifierToFlag)(node.kind) & 117086 /* ModifierFlags.TypeScriptModifier */) {
            return undefined;
        }
        else if (currentNamespace && node.kind === 95 /* SyntaxKind.ExportKeyword */) {
            return undefined;
        }
        return node;
    }
    /**
     * Branching visitor, visits a TypeScript syntax node.
     *
     * @param node The node to visit.
     */
    function visitTypeScript(node) {
        if ((0, ts_1.isStatement)(node) && (0, ts_1.hasSyntacticModifier)(node, 2 /* ModifierFlags.Ambient */)) {
            // TypeScript ambient declarations are elided, but some comments may be preserved.
            // See the implementation of `getLeadingComments` in comments.ts for more details.
            return factory.createNotEmittedStatement(node);
        }
        switch (node.kind) {
            case 95 /* SyntaxKind.ExportKeyword */:
            case 90 /* SyntaxKind.DefaultKeyword */:
                // ES6 export and default modifiers are elided when inside a namespace.
                return currentNamespace ? undefined : node;
            case 125 /* SyntaxKind.PublicKeyword */:
            case 123 /* SyntaxKind.PrivateKeyword */:
            case 124 /* SyntaxKind.ProtectedKeyword */:
            case 128 /* SyntaxKind.AbstractKeyword */:
            case 163 /* SyntaxKind.OverrideKeyword */:
            case 87 /* SyntaxKind.ConstKeyword */:
            case 138 /* SyntaxKind.DeclareKeyword */:
            case 148 /* SyntaxKind.ReadonlyKeyword */:
            case 103 /* SyntaxKind.InKeyword */:
            case 147 /* SyntaxKind.OutKeyword */:
            // TypeScript accessibility and readonly modifiers are elided
            // falls through
            case 187 /* SyntaxKind.ArrayType */:
            case 188 /* SyntaxKind.TupleType */:
            case 189 /* SyntaxKind.OptionalType */:
            case 190 /* SyntaxKind.RestType */:
            case 186 /* SyntaxKind.TypeLiteral */:
            case 181 /* SyntaxKind.TypePredicate */:
            case 167 /* SyntaxKind.TypeParameter */:
            case 133 /* SyntaxKind.AnyKeyword */:
            case 159 /* SyntaxKind.UnknownKeyword */:
            case 136 /* SyntaxKind.BooleanKeyword */:
            case 154 /* SyntaxKind.StringKeyword */:
            case 150 /* SyntaxKind.NumberKeyword */:
            case 146 /* SyntaxKind.NeverKeyword */:
            case 116 /* SyntaxKind.VoidKeyword */:
            case 155 /* SyntaxKind.SymbolKeyword */:
            case 184 /* SyntaxKind.ConstructorType */:
            case 183 /* SyntaxKind.FunctionType */:
            case 185 /* SyntaxKind.TypeQuery */:
            case 182 /* SyntaxKind.TypeReference */:
            case 191 /* SyntaxKind.UnionType */:
            case 192 /* SyntaxKind.IntersectionType */:
            case 193 /* SyntaxKind.ConditionalType */:
            case 195 /* SyntaxKind.ParenthesizedType */:
            case 196 /* SyntaxKind.ThisType */:
            case 197 /* SyntaxKind.TypeOperator */:
            case 198 /* SyntaxKind.IndexedAccessType */:
            case 199 /* SyntaxKind.MappedType */:
            case 200 /* SyntaxKind.LiteralType */:
            // TypeScript type nodes are elided.
            // falls through
            case 180 /* SyntaxKind.IndexSignature */:
                // TypeScript index signatures are elided.
                return undefined;
            case 264 /* SyntaxKind.TypeAliasDeclaration */:
                // TypeScript type-only declarations are elided.
                return factory.createNotEmittedStatement(node);
            case 269 /* SyntaxKind.NamespaceExportDeclaration */:
                // TypeScript namespace export declarations are elided.
                return undefined;
            case 263 /* SyntaxKind.InterfaceDeclaration */:
                // TypeScript interfaces are elided, but some comments may be preserved.
                // See the implementation of `getLeadingComments` in comments.ts for more details.
                return factory.createNotEmittedStatement(node);
            case 262 /* SyntaxKind.ClassDeclaration */:
                // This may be a class declaration with TypeScript syntax extensions.
                //
                // TypeScript class syntax extensions include:
                // - decorators
                // - optional `implements` heritage clause
                // - parameter property assignments in the constructor
                // - index signatures
                // - method overload signatures
                return visitClassDeclaration(node);
            case 230 /* SyntaxKind.ClassExpression */:
                // This may be a class expression with TypeScript syntax extensions.
                //
                // TypeScript class syntax extensions include:
                // - decorators
                // - optional `implements` heritage clause
                // - parameter property assignments in the constructor
                // - index signatures
                // - method overload signatures
                return visitClassExpression(node);
            case 297 /* SyntaxKind.HeritageClause */:
                // This may be a heritage clause with TypeScript syntax extensions.
                //
                // TypeScript heritage clause extensions include:
                // - `implements` clause
                return visitHeritageClause(node);
            case 232 /* SyntaxKind.ExpressionWithTypeArguments */:
                // TypeScript supports type arguments on an expression in an `extends` heritage clause.
                return visitExpressionWithTypeArguments(node);
            case 209 /* SyntaxKind.ObjectLiteralExpression */:
                return visitObjectLiteralExpression(node);
            case 175 /* SyntaxKind.Constructor */:
            case 171 /* SyntaxKind.PropertyDeclaration */:
            case 173 /* SyntaxKind.MethodDeclaration */:
            case 176 /* SyntaxKind.GetAccessor */:
            case 177 /* SyntaxKind.SetAccessor */:
            case 174 /* SyntaxKind.ClassStaticBlockDeclaration */:
                return ts_1.Debug.fail("Class and object literal elements must be visited with their respective visitors");
            case 261 /* SyntaxKind.FunctionDeclaration */:
                // Typescript function declarations can have modifiers, decorators, and type annotations.
                return visitFunctionDeclaration(node);
            case 217 /* SyntaxKind.FunctionExpression */:
                // TypeScript function expressions can have modifiers and type annotations.
                return visitFunctionExpression(node);
            case 218 /* SyntaxKind.ArrowFunction */:
                // TypeScript arrow functions can have modifiers and type annotations.
                return visitArrowFunction(node);
            case 168 /* SyntaxKind.Parameter */:
                // This may be a parameter declaration with TypeScript syntax extensions.
                //
                // TypeScript parameter declaration syntax extensions include:
                // - decorators
                // - accessibility modifiers
                // - the question mark (?) token for optional parameters
                // - type annotations
                // - this parameters
                return visitParameter(node);
            case 216 /* SyntaxKind.ParenthesizedExpression */:
                // ParenthesizedExpressions are TypeScript if their expression is a
                // TypeAssertion or AsExpression
                return visitParenthesizedExpression(node);
            case 215 /* SyntaxKind.TypeAssertionExpression */:
            case 233 /* SyntaxKind.AsExpression */:
                // TypeScript type assertions are removed, but their subtrees are preserved.
                return visitAssertionExpression(node);
            case 237 /* SyntaxKind.SatisfiesExpression */:
                return visitSatisfiesExpression(node);
            case 212 /* SyntaxKind.CallExpression */:
                return visitCallExpression(node);
            case 213 /* SyntaxKind.NewExpression */:
                return visitNewExpression(node);
            case 214 /* SyntaxKind.TaggedTemplateExpression */:
                return visitTaggedTemplateExpression(node);
            case 234 /* SyntaxKind.NonNullExpression */:
                // TypeScript non-null expressions are removed, but their subtrees are preserved.
                return visitNonNullExpression(node);
            case 265 /* SyntaxKind.EnumDeclaration */:
                // TypeScript enum declarations do not exist in ES6 and must be rewritten.
                return visitEnumDeclaration(node);
            case 242 /* SyntaxKind.VariableStatement */:
                // TypeScript namespace exports for variable statements must be transformed.
                return visitVariableStatement(node);
            case 259 /* SyntaxKind.VariableDeclaration */:
                return visitVariableDeclaration(node);
            case 266 /* SyntaxKind.ModuleDeclaration */:
                // TypeScript namespace declarations must be transformed.
                return visitModuleDeclaration(node);
            case 270 /* SyntaxKind.ImportEqualsDeclaration */:
                // TypeScript namespace or external module import.
                return visitImportEqualsDeclaration(node);
            case 284 /* SyntaxKind.JsxSelfClosingElement */:
                return visitJsxSelfClosingElement(node);
            case 285 /* SyntaxKind.JsxOpeningElement */:
                return visitJsxJsxOpeningElement(node);
            default:
                // node contains some other TypeScript syntax
                return (0, ts_1.visitEachChild)(node, visitor, context);
        }
    }
    function visitSourceFile(node) {
        var alwaysStrict = (0, ts_1.getStrictOptionValue)(compilerOptions, "alwaysStrict") &&
            !((0, ts_1.isExternalModule)(node) && moduleKind >= ts_1.ModuleKind.ES2015) &&
            !(0, ts_1.isJsonSourceFile)(node);
        return factory.updateSourceFile(node, (0, ts_1.visitLexicalEnvironment)(node.statements, sourceElementVisitor, context, /*start*/ 0, alwaysStrict));
    }
    function visitObjectLiteralExpression(node) {
        return factory.updateObjectLiteralExpression(node, (0, ts_1.visitNodes)(node.properties, getObjectLiteralElementVisitor(node), ts_1.isObjectLiteralElementLike));
    }
    function getClassFacts(node) {
        var facts = 0 /* ClassFacts.None */;
        if ((0, ts_1.some)((0, ts_1.getProperties)(node, /*requireInitializer*/ true, /*isStatic*/ true)))
            facts |= 1 /* ClassFacts.HasStaticInitializedProperties */;
        var extendsClauseElement = (0, ts_1.getEffectiveBaseTypeNode)(node);
        if (extendsClauseElement && (0, ts_1.skipOuterExpressions)(extendsClauseElement.expression).kind !== 106 /* SyntaxKind.NullKeyword */)
            facts |= 64 /* ClassFacts.IsDerivedClass */;
        if ((0, ts_1.classOrConstructorParameterIsDecorated)(legacyDecorators, node))
            facts |= 2 /* ClassFacts.HasClassOrConstructorParameterDecorators */;
        if ((0, ts_1.childIsDecorated)(legacyDecorators, node))
            facts |= 4 /* ClassFacts.HasMemberDecorators */;
        if (isExportOfNamespace(node))
            facts |= 8 /* ClassFacts.IsExportOfNamespace */;
        else if (isDefaultExternalModuleExport(node))
            facts |= 32 /* ClassFacts.IsDefaultExternalExport */;
        else if (isNamedExternalModuleExport(node))
            facts |= 16 /* ClassFacts.IsNamedExternalExport */;
        return facts;
    }
    function hasTypeScriptClassSyntax(node) {
        return !!(node.transformFlags & 8192 /* TransformFlags.ContainsTypeScriptClassSyntax */);
    }
    function isClassLikeDeclarationWithTypeScriptSyntax(node) {
        return (0, ts_1.hasDecorators)(node)
            || (0, ts_1.some)(node.typeParameters)
            || (0, ts_1.some)(node.heritageClauses, hasTypeScriptClassSyntax)
            || (0, ts_1.some)(node.members, hasTypeScriptClassSyntax);
    }
    function visitClassDeclaration(node) {
        var _a;
        var facts = getClassFacts(node);
        var promoteToIIFE = languageVersion <= 1 /* ScriptTarget.ES5 */ &&
            !!(facts & 7 /* ClassFacts.MayNeedImmediatelyInvokedFunctionExpression */);
        if (!isClassLikeDeclarationWithTypeScriptSyntax(node) &&
            !(0, ts_1.classOrConstructorParameterIsDecorated)(legacyDecorators, node) &&
            !isExportOfNamespace(node)) {
            return factory.updateClassDeclaration(node, (0, ts_1.visitNodes)(node.modifiers, modifierVisitor, ts_1.isModifier), node.name, 
            /*typeParameters*/ undefined, (0, ts_1.visitNodes)(node.heritageClauses, visitor, ts_1.isHeritageClause), (0, ts_1.visitNodes)(node.members, getClassElementVisitor(node), ts_1.isClassElement));
        }
        if (promoteToIIFE) {
            context.startLexicalEnvironment();
        }
        var moveModifiers = promoteToIIFE ||
            facts & 8 /* ClassFacts.IsExportOfNamespace */;
        // elide modifiers on the declaration if we are emitting an IIFE or the class is
        // a namespace export
        var modifiers = moveModifiers ?
            (0, ts_1.visitNodes)(node.modifiers, modifierElidingVisitor, ts_1.isModifierLike) :
            (0, ts_1.visitNodes)(node.modifiers, visitor, ts_1.isModifierLike);
        // inject metadata only if the class is decorated
        if (facts & 2 /* ClassFacts.HasClassOrConstructorParameterDecorators */) {
            modifiers = injectClassTypeMetadata(modifiers, node);
        }
        var needsName = moveModifiers && !node.name ||
            facts & 4 /* ClassFacts.HasMemberDecorators */ ||
            facts & 1 /* ClassFacts.HasStaticInitializedProperties */;
        var name = needsName ?
            (_a = node.name) !== null && _a !== void 0 ? _a : factory.getGeneratedNameForNode(node) :
            node.name;
        //  ${modifiers} class ${name} ${heritageClauses} {
        //      ${members}
        //  }
        var classDeclaration = factory.updateClassDeclaration(node, modifiers, name, 
        /*typeParameters*/ undefined, (0, ts_1.visitNodes)(node.heritageClauses, visitor, ts_1.isHeritageClause), transformClassMembers(node));
        // To better align with the old emitter, we should not emit a trailing source map
        // entry if the class has static properties.
        var emitFlags = (0, ts_1.getEmitFlags)(node);
        if (facts & 1 /* ClassFacts.HasStaticInitializedProperties */) {
            emitFlags |= 64 /* EmitFlags.NoTrailingSourceMap */;
        }
        (0, ts_1.setEmitFlags)(classDeclaration, emitFlags);
        var statement;
        if (promoteToIIFE) {
            // When we emit a TypeScript class down to ES5, we must wrap it in an IIFE so that the
            // 'es2015' transformer can properly nest static initializers and decorators. The result
            // looks something like:
            //
            //  var C = function () {
            //      class C {
            //      }
            //      C.static_prop = 1;
            //      return C;
            //  }();
            //
            var statements = [classDeclaration];
            var closingBraceLocation = (0, ts_1.createTokenRange)((0, ts_1.skipTrivia)(currentSourceFile.text, node.members.end), 20 /* SyntaxKind.CloseBraceToken */);
            var localName = factory.getInternalName(node);
            // The following partially-emitted expression exists purely to align our sourcemap
            // emit with the original emitter.
            var outer = factory.createPartiallyEmittedExpression(localName);
            (0, ts_1.setTextRangeEnd)(outer, closingBraceLocation.end);
            (0, ts_1.setEmitFlags)(outer, 3072 /* EmitFlags.NoComments */);
            var returnStatement = factory.createReturnStatement(outer);
            (0, ts_1.setTextRangePos)(returnStatement, closingBraceLocation.pos);
            (0, ts_1.setEmitFlags)(returnStatement, 3072 /* EmitFlags.NoComments */ | 768 /* EmitFlags.NoTokenSourceMaps */);
            statements.push(returnStatement);
            (0, ts_1.insertStatementsAfterStandardPrologue)(statements, context.endLexicalEnvironment());
            var iife = factory.createImmediatelyInvokedArrowFunction(statements);
            (0, ts_1.setInternalEmitFlags)(iife, 1 /* InternalEmitFlags.TypeScriptClassWrapper */);
            //  export let C = (() => { ... })();
            var modifiers_1 = facts & 16 /* ClassFacts.IsNamedExternalExport */ ?
                factory.createModifiersFromModifierFlags(1 /* ModifierFlags.Export */) :
                undefined;
            //  let C = (() => { ... })();
            var varStatement = factory.createVariableStatement(modifiers_1, factory.createVariableDeclarationList([
                factory.createVariableDeclaration(factory.getLocalName(node, /*allowComments*/ false, /*allowSourceMaps*/ false), 
                /*exclamationToken*/ undefined, 
                /*type*/ undefined, iife)
            ], 1 /* NodeFlags.Let */));
            (0, ts_1.setOriginalNode)(varStatement, node);
            (0, ts_1.setCommentRange)(varStatement, node);
            (0, ts_1.setSourceMapRange)(varStatement, (0, ts_1.moveRangePastDecorators)(node));
            (0, ts_1.startOnNewLine)(varStatement);
            statement = varStatement;
        }
        else {
            statement = classDeclaration;
        }
        if (moveModifiers) {
            if (facts & 8 /* ClassFacts.IsExportOfNamespace */) {
                return [
                    statement,
                    createExportMemberAssignmentStatement(node)
                ];
            }
            if (facts & 32 /* ClassFacts.IsDefaultExternalExport */) {
                return [
                    statement,
                    factory.createExportDefault(factory.getLocalName(node, /*allowComments*/ false, /*allowSourceMaps*/ true))
                ];
            }
            if (facts & 16 /* ClassFacts.IsNamedExternalExport */ && !promoteToIIFE) {
                return [
                    statement,
                    factory.createExternalModuleExport(factory.getLocalName(node, /*allowComments*/ false, /*allowSourceMaps*/ true))
                ];
            }
        }
        return statement;
    }
    function visitClassExpression(node) {
        var modifiers = (0, ts_1.visitNodes)(node.modifiers, modifierElidingVisitor, ts_1.isModifierLike);
        if ((0, ts_1.classOrConstructorParameterIsDecorated)(legacyDecorators, node)) {
            modifiers = injectClassTypeMetadata(modifiers, node);
        }
        return factory.updateClassExpression(node, modifiers, node.name, 
        /*typeParameters*/ undefined, (0, ts_1.visitNodes)(node.heritageClauses, visitor, ts_1.isHeritageClause), transformClassMembers(node));
    }
    /**
     * Transforms the members of a class.
     *
     * @param node The current class.
     */
    function transformClassMembers(node) {
        var members = (0, ts_1.visitNodes)(node.members, getClassElementVisitor(node), ts_1.isClassElement);
        var newMembers;
        var constructor = (0, ts_1.getFirstConstructorWithBody)(node);
        var parametersWithPropertyAssignments = constructor &&
            (0, ts_1.filter)(constructor.parameters, function (p) { return (0, ts_1.isParameterPropertyDeclaration)(p, constructor); });
        if (parametersWithPropertyAssignments) {
            for (var _i = 0, parametersWithPropertyAssignments_1 = parametersWithPropertyAssignments; _i < parametersWithPropertyAssignments_1.length; _i++) {
                var parameter = parametersWithPropertyAssignments_1[_i];
                var parameterProperty = factory.createPropertyDeclaration(
                /*modifiers*/ undefined, parameter.name, 
                /*questionOrExclamationToken*/ undefined, 
                /*type*/ undefined, 
                /*initializer*/ undefined);
                (0, ts_1.setOriginalNode)(parameterProperty, parameter);
                newMembers = (0, ts_1.append)(newMembers, parameterProperty);
            }
        }
        if (newMembers) {
            newMembers = (0, ts_1.addRange)(newMembers, members);
            return (0, ts_1.setTextRange)(factory.createNodeArray(newMembers), /*location*/ node.members);
        }
        return members;
    }
    function injectClassTypeMetadata(modifiers, node) {
        var metadata = getTypeMetadata(node, node);
        if ((0, ts_1.some)(metadata)) {
            var modifiersArray = [];
            (0, ts_1.addRange)(modifiersArray, (0, ts_1.takeWhile)(modifiers, ts_1.isExportOrDefaultModifier));
            (0, ts_1.addRange)(modifiersArray, (0, ts_1.filter)(modifiers, ts_1.isDecorator));
            (0, ts_1.addRange)(modifiersArray, metadata);
            (0, ts_1.addRange)(modifiersArray, (0, ts_1.filter)((0, ts_1.skipWhile)(modifiers, ts_1.isExportOrDefaultModifier), ts_1.isModifier));
            modifiers = (0, ts_1.setTextRange)(factory.createNodeArray(modifiersArray), modifiers);
        }
        return modifiers;
    }
    function injectClassElementTypeMetadata(modifiers, node, container) {
        if ((0, ts_1.isClassLike)(container) && (0, ts_1.classElementOrClassElementParameterIsDecorated)(legacyDecorators, node, container)) {
            var metadata = getTypeMetadata(node, container);
            if ((0, ts_1.some)(metadata)) {
                var modifiersArray = [];
                (0, ts_1.addRange)(modifiersArray, (0, ts_1.filter)(modifiers, ts_1.isDecorator));
                (0, ts_1.addRange)(modifiersArray, metadata);
                (0, ts_1.addRange)(modifiersArray, (0, ts_1.filter)(modifiers, ts_1.isModifier));
                modifiers = (0, ts_1.setTextRange)(factory.createNodeArray(modifiersArray), modifiers);
            }
        }
        return modifiers;
    }
    /**
     * Gets optional type metadata for a declaration.
     *
     * @param node The declaration node.
     */
    function getTypeMetadata(node, container) {
        // Decorator metadata is not yet supported for ES decorators.
        if (!legacyDecorators)
            return undefined;
        return USE_NEW_TYPE_METADATA_FORMAT ?
            getNewTypeMetadata(node, container) :
            getOldTypeMetadata(node, container);
    }
    function getOldTypeMetadata(node, container) {
        if (typeSerializer) {
            var decorators = void 0;
            if (shouldAddTypeMetadata(node)) {
                var typeMetadata = emitHelpers().createMetadataHelper("design:type", typeSerializer.serializeTypeOfNode({ currentLexicalScope: currentLexicalScope, currentNameScope: container }, node));
                decorators = (0, ts_1.append)(decorators, factory.createDecorator(typeMetadata));
            }
            if (shouldAddParamTypesMetadata(node)) {
                var paramTypesMetadata = emitHelpers().createMetadataHelper("design:paramtypes", typeSerializer.serializeParameterTypesOfNode({ currentLexicalScope: currentLexicalScope, currentNameScope: container }, node, container));
                decorators = (0, ts_1.append)(decorators, factory.createDecorator(paramTypesMetadata));
            }
            if (shouldAddReturnTypeMetadata(node)) {
                var returnTypeMetadata = emitHelpers().createMetadataHelper("design:returntype", typeSerializer.serializeReturnTypeOfNode({ currentLexicalScope: currentLexicalScope, currentNameScope: container }, node));
                decorators = (0, ts_1.append)(decorators, factory.createDecorator(returnTypeMetadata));
            }
            return decorators;
        }
    }
    function getNewTypeMetadata(node, container) {
        if (typeSerializer) {
            var properties = void 0;
            if (shouldAddTypeMetadata(node)) {
                var typeProperty = factory.createPropertyAssignment("type", factory.createArrowFunction(/*modifiers*/ undefined, /*typeParameters*/ undefined, [], /*type*/ undefined, factory.createToken(39 /* SyntaxKind.EqualsGreaterThanToken */), typeSerializer.serializeTypeOfNode({ currentLexicalScope: currentLexicalScope, currentNameScope: container }, node)));
                properties = (0, ts_1.append)(properties, typeProperty);
            }
            if (shouldAddParamTypesMetadata(node)) {
                var paramTypeProperty = factory.createPropertyAssignment("paramTypes", factory.createArrowFunction(/*modifiers*/ undefined, /*typeParameters*/ undefined, [], /*type*/ undefined, factory.createToken(39 /* SyntaxKind.EqualsGreaterThanToken */), typeSerializer.serializeParameterTypesOfNode({ currentLexicalScope: currentLexicalScope, currentNameScope: container }, node, container)));
                properties = (0, ts_1.append)(properties, paramTypeProperty);
            }
            if (shouldAddReturnTypeMetadata(node)) {
                var returnTypeProperty = factory.createPropertyAssignment("returnType", factory.createArrowFunction(/*modifiers*/ undefined, /*typeParameters*/ undefined, [], /*type*/ undefined, factory.createToken(39 /* SyntaxKind.EqualsGreaterThanToken */), typeSerializer.serializeReturnTypeOfNode({ currentLexicalScope: currentLexicalScope, currentNameScope: container }, node)));
                properties = (0, ts_1.append)(properties, returnTypeProperty);
            }
            if (properties) {
                var typeInfoMetadata = emitHelpers().createMetadataHelper("design:typeinfo", factory.createObjectLiteralExpression(properties, /*multiLine*/ true));
                return [factory.createDecorator(typeInfoMetadata)];
            }
        }
    }
    /**
     * Determines whether to emit the "design:type" metadata based on the node's kind.
     * The caller should have already tested whether the node has decorators and whether the
     * emitDecoratorMetadata compiler option is set.
     *
     * @param node The node to test.
     */
    function shouldAddTypeMetadata(node) {
        var kind = node.kind;
        return kind === 173 /* SyntaxKind.MethodDeclaration */
            || kind === 176 /* SyntaxKind.GetAccessor */
            || kind === 177 /* SyntaxKind.SetAccessor */
            || kind === 171 /* SyntaxKind.PropertyDeclaration */;
    }
    /**
     * Determines whether to emit the "design:returntype" metadata based on the node's kind.
     * The caller should have already tested whether the node has decorators and whether the
     * emitDecoratorMetadata compiler option is set.
     *
     * @param node The node to test.
     */
    function shouldAddReturnTypeMetadata(node) {
        return node.kind === 173 /* SyntaxKind.MethodDeclaration */;
    }
    /**
     * Determines whether to emit the "design:paramtypes" metadata based on the node's kind.
     * The caller should have already tested whether the node has decorators and whether the
     * emitDecoratorMetadata compiler option is set.
     *
     * @param node The node to test.
     */
    function shouldAddParamTypesMetadata(node) {
        switch (node.kind) {
            case 262 /* SyntaxKind.ClassDeclaration */:
            case 230 /* SyntaxKind.ClassExpression */:
                return (0, ts_1.getFirstConstructorWithBody)(node) !== undefined;
            case 173 /* SyntaxKind.MethodDeclaration */:
            case 176 /* SyntaxKind.GetAccessor */:
            case 177 /* SyntaxKind.SetAccessor */:
                return true;
        }
        return false;
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
    /**
     * Visits the property name of a class element, for use when emitting property
     * initializers. For a computed property on a node with decorators, a temporary
     * value is stored for later use.
     *
     * @param member The member whose name should be visited.
     */
    function visitPropertyNameOfClassElement(member) {
        var name = member.name;
        // Computed property names need to be transformed into a hoisted variable when they are used more than once.
        // The names are used more than once when:
        //   - the property is non-static and its initializer is moved to the constructor (when there are parameter property assignments).
        //   - the property has a decorator.
        if ((0, ts_1.isComputedPropertyName)(name) && ((!(0, ts_1.hasStaticModifier)(member) && currentClassHasParameterProperties) || (0, ts_1.hasDecorators)(member) && legacyDecorators)) {
            var expression = (0, ts_1.visitNode)(name.expression, visitor, ts_1.isExpression);
            ts_1.Debug.assert(expression);
            var innerExpression = (0, ts_1.skipPartiallyEmittedExpressions)(expression);
            if (!(0, ts_1.isSimpleInlineableExpression)(innerExpression)) {
                var generatedName = factory.getGeneratedNameForNode(name);
                hoistVariableDeclaration(generatedName);
                return factory.updateComputedPropertyName(name, factory.createAssignment(generatedName, expression));
            }
        }
        return ts_1.Debug.checkDefined((0, ts_1.visitNode)(name, visitor, ts_1.isPropertyName));
    }
    /**
     * Transforms a HeritageClause with TypeScript syntax.
     *
     * This function will only be called when one of the following conditions are met:
     * - The node is a non-`extends` heritage clause that should be elided.
     * - The node is an `extends` heritage clause that should be visited, but only allow a single type.
     *
     * @param node The HeritageClause to transform.
     */
    function visitHeritageClause(node) {
        if (node.token === 119 /* SyntaxKind.ImplementsKeyword */) {
            // implements clauses are elided
            return undefined;
        }
        return (0, ts_1.visitEachChild)(node, visitor, context);
    }
    /**
     * Transforms an ExpressionWithTypeArguments with TypeScript syntax.
     *
     * This function will only be called when one of the following conditions are met:
     * - The node contains type arguments that should be elided.
     *
     * @param node The ExpressionWithTypeArguments to transform.
     */
    function visitExpressionWithTypeArguments(node) {
        return factory.updateExpressionWithTypeArguments(node, ts_1.Debug.checkDefined((0, ts_1.visitNode)(node.expression, visitor, ts_1.isLeftHandSideExpression)), 
        /*typeArguments*/ undefined);
    }
    /**
     * Determines whether to emit a function-like declaration. We should not emit the
     * declaration if it does not have a body.
     *
     * @param node The declaration node.
     */
    function shouldEmitFunctionLikeDeclaration(node) {
        return !(0, ts_1.nodeIsMissing)(node.body);
    }
    function visitPropertyDeclaration(node, parent) {
        var isAmbient = node.flags & 16777216 /* NodeFlags.Ambient */ || (0, ts_1.hasSyntacticModifier)(node, 256 /* ModifierFlags.Abstract */);
        if (isAmbient && !(legacyDecorators && (0, ts_1.hasDecorators)(node))) {
            return undefined;
        }
        var modifiers = (0, ts_1.isClassLike)(parent) ? !isAmbient ?
            (0, ts_1.visitNodes)(node.modifiers, visitor, ts_1.isModifierLike) :
            (0, ts_1.visitNodes)(node.modifiers, modifierElidingVisitor, ts_1.isModifierLike) :
            (0, ts_1.visitNodes)(node.modifiers, decoratorElidingVisitor, ts_1.isModifierLike);
        modifiers = injectClassElementTypeMetadata(modifiers, node, parent);
        // Preserve a `declare x` property with decorators to be handled by the decorators transform
        if (isAmbient) {
            return factory.updatePropertyDeclaration(node, (0, ts_1.concatenate)(modifiers, factory.createModifiersFromModifierFlags(2 /* ModifierFlags.Ambient */)), ts_1.Debug.checkDefined((0, ts_1.visitNode)(node.name, visitor, ts_1.isPropertyName)), 
            /*questionOrExclamationToken*/ undefined, 
            /*type*/ undefined, 
            /*initializer*/ undefined);
        }
        return factory.updatePropertyDeclaration(node, modifiers, visitPropertyNameOfClassElement(node), 
        /*questionOrExclamationToken*/ undefined, 
        /*type*/ undefined, (0, ts_1.visitNode)(node.initializer, visitor, ts_1.isExpression));
    }
    function visitConstructor(node) {
        if (!shouldEmitFunctionLikeDeclaration(node)) {
            return undefined;
        }
        return factory.updateConstructorDeclaration(node, 
        /*modifiers*/ undefined, (0, ts_1.visitParameterList)(node.parameters, visitor, context), transformConstructorBody(node.body, node));
    }
    function transformConstructorBody(body, constructor) {
        var parametersWithPropertyAssignments = constructor &&
            (0, ts_1.filter)(constructor.parameters, function (p) { return (0, ts_1.isParameterPropertyDeclaration)(p, constructor); });
        if (!(0, ts_1.some)(parametersWithPropertyAssignments)) {
            return (0, ts_1.visitFunctionBody)(body, visitor, context);
        }
        var statements = [];
        resumeLexicalEnvironment();
        var prologueStatementCount = factory.copyPrologue(body.statements, statements, /*ensureUseStrict*/ false, visitor);
        var superStatementIndex = (0, ts_1.findSuperStatementIndex)(body.statements, prologueStatementCount);
        // If there was a super call, visit existing statements up to and including it
        if (superStatementIndex >= 0) {
            (0, ts_1.addRange)(statements, (0, ts_1.visitNodes)(body.statements, visitor, ts_1.isStatement, prologueStatementCount, superStatementIndex + 1 - prologueStatementCount));
        }
        // Transform parameters into property assignments. Transforms this:
        //
        //  constructor (public x, public y) {
        //  }
        //
        // Into this:
        //
        //  constructor (x, y) {
        //      this.x = x;
        //      this.y = y;
        //  }
        //
        var parameterPropertyAssignments = (0, ts_1.mapDefined)(parametersWithPropertyAssignments, transformParameterWithPropertyAssignment);
        // If there is a super() call, the parameter properties go immediately after it
        if (superStatementIndex >= 0) {
            (0, ts_1.addRange)(statements, parameterPropertyAssignments);
        }
        // Since there was no super() call, parameter properties are the first statements in the constructor after any prologue statements
        else {
            statements = __spreadArray(__spreadArray(__spreadArray([], statements.slice(0, prologueStatementCount), true), parameterPropertyAssignments, true), statements.slice(prologueStatementCount), true);
        }
        // Add remaining statements from the body, skipping the super() call if it was found and any (already added) prologue statements
        var start = superStatementIndex >= 0 ? superStatementIndex + 1 : prologueStatementCount;
        (0, ts_1.addRange)(statements, (0, ts_1.visitNodes)(body.statements, visitor, ts_1.isStatement, start));
        // End the lexical environment.
        statements = factory.mergeLexicalEnvironment(statements, endLexicalEnvironment());
        var block = factory.createBlock((0, ts_1.setTextRange)(factory.createNodeArray(statements), body.statements), /*multiLine*/ true);
        (0, ts_1.setTextRange)(block, /*location*/ body);
        (0, ts_1.setOriginalNode)(block, body);
        return block;
    }
    /**
     * Transforms a parameter into a property assignment statement.
     *
     * @param node The parameter declaration.
     */
    function transformParameterWithPropertyAssignment(node) {
        var name = node.name;
        if (!(0, ts_1.isIdentifier)(name)) {
            return undefined;
        }
        // TODO(rbuckton): Does this need to be parented?
        var propertyName = (0, ts_1.setParent)((0, ts_1.setTextRange)(factory.cloneNode(name), name), name.parent);
        (0, ts_1.setEmitFlags)(propertyName, 3072 /* EmitFlags.NoComments */ | 96 /* EmitFlags.NoSourceMap */);
        // TODO(rbuckton): Does this need to be parented?
        var localName = (0, ts_1.setParent)((0, ts_1.setTextRange)(factory.cloneNode(name), name), name.parent);
        (0, ts_1.setEmitFlags)(localName, 3072 /* EmitFlags.NoComments */);
        return (0, ts_1.startOnNewLine)((0, ts_1.removeAllComments)((0, ts_1.setTextRange)((0, ts_1.setOriginalNode)(factory.createExpressionStatement(factory.createAssignment((0, ts_1.setTextRange)(factory.createPropertyAccessExpression(factory.createThis(), propertyName), node.name), localName)), node), (0, ts_1.moveRangePos)(node, -1))));
    }
    function visitMethodDeclaration(node, parent) {
        if (!(node.transformFlags & 1 /* TransformFlags.ContainsTypeScript */)) {
            return node;
        }
        if (!shouldEmitFunctionLikeDeclaration(node)) {
            return undefined;
        }
        var modifiers = (0, ts_1.isClassLike)(parent) ?
            (0, ts_1.visitNodes)(node.modifiers, visitor, ts_1.isModifierLike) :
            (0, ts_1.visitNodes)(node.modifiers, decoratorElidingVisitor, ts_1.isModifierLike);
        modifiers = injectClassElementTypeMetadata(modifiers, node, parent);
        return factory.updateMethodDeclaration(node, modifiers, node.asteriskToken, visitPropertyNameOfClassElement(node), 
        /*questionToken*/ undefined, 
        /*typeParameters*/ undefined, (0, ts_1.visitParameterList)(node.parameters, visitor, context), 
        /*type*/ undefined, (0, ts_1.visitFunctionBody)(node.body, visitor, context));
    }
    /**
     * Determines whether to emit an accessor declaration. We should not emit the
     * declaration if it does not have a body and is abstract.
     *
     * @param node The declaration node.
     */
    function shouldEmitAccessorDeclaration(node) {
        return !((0, ts_1.nodeIsMissing)(node.body) && (0, ts_1.hasSyntacticModifier)(node, 256 /* ModifierFlags.Abstract */));
    }
    function visitGetAccessor(node, parent) {
        if (!(node.transformFlags & 1 /* TransformFlags.ContainsTypeScript */)) {
            return node;
        }
        if (!shouldEmitAccessorDeclaration(node)) {
            return undefined;
        }
        var modifiers = (0, ts_1.isClassLike)(parent) ?
            (0, ts_1.visitNodes)(node.modifiers, visitor, ts_1.isModifierLike) :
            (0, ts_1.visitNodes)(node.modifiers, decoratorElidingVisitor, ts_1.isModifierLike);
        modifiers = injectClassElementTypeMetadata(modifiers, node, parent);
        return factory.updateGetAccessorDeclaration(node, modifiers, visitPropertyNameOfClassElement(node), (0, ts_1.visitParameterList)(node.parameters, visitor, context), 
        /*type*/ undefined, (0, ts_1.visitFunctionBody)(node.body, visitor, context) || factory.createBlock([]));
    }
    function visitSetAccessor(node, parent) {
        if (!(node.transformFlags & 1 /* TransformFlags.ContainsTypeScript */)) {
            return node;
        }
        if (!shouldEmitAccessorDeclaration(node)) {
            return undefined;
        }
        var modifiers = (0, ts_1.isClassLike)(parent) ?
            (0, ts_1.visitNodes)(node.modifiers, visitor, ts_1.isModifierLike) :
            (0, ts_1.visitNodes)(node.modifiers, decoratorElidingVisitor, ts_1.isModifierLike);
        modifiers = injectClassElementTypeMetadata(modifiers, node, parent);
        return factory.updateSetAccessorDeclaration(node, modifiers, visitPropertyNameOfClassElement(node), (0, ts_1.visitParameterList)(node.parameters, visitor, context), (0, ts_1.visitFunctionBody)(node.body, visitor, context) || factory.createBlock([]));
    }
    function visitFunctionDeclaration(node) {
        if (!shouldEmitFunctionLikeDeclaration(node)) {
            return factory.createNotEmittedStatement(node);
        }
        var updated = factory.updateFunctionDeclaration(node, (0, ts_1.visitNodes)(node.modifiers, modifierVisitor, ts_1.isModifier), node.asteriskToken, node.name, 
        /*typeParameters*/ undefined, (0, ts_1.visitParameterList)(node.parameters, visitor, context), 
        /*type*/ undefined, (0, ts_1.visitFunctionBody)(node.body, visitor, context) || factory.createBlock([]));
        if (isExportOfNamespace(node)) {
            var statements = [updated];
            addExportMemberAssignment(statements, node);
            return statements;
        }
        return updated;
    }
    function visitFunctionExpression(node) {
        if (!shouldEmitFunctionLikeDeclaration(node)) {
            return factory.createOmittedExpression();
        }
        var updated = factory.updateFunctionExpression(node, (0, ts_1.visitNodes)(node.modifiers, modifierVisitor, ts_1.isModifier), node.asteriskToken, node.name, 
        /*typeParameters*/ undefined, (0, ts_1.visitParameterList)(node.parameters, visitor, context), 
        /*type*/ undefined, (0, ts_1.visitFunctionBody)(node.body, visitor, context) || factory.createBlock([]));
        return updated;
    }
    function visitArrowFunction(node) {
        var updated = factory.updateArrowFunction(node, (0, ts_1.visitNodes)(node.modifiers, modifierVisitor, ts_1.isModifier), 
        /*typeParameters*/ undefined, (0, ts_1.visitParameterList)(node.parameters, visitor, context), 
        /*type*/ undefined, node.equalsGreaterThanToken, (0, ts_1.visitFunctionBody)(node.body, visitor, context));
        return updated;
    }
    function visitParameter(node) {
        if ((0, ts_1.parameterIsThisKeyword)(node)) {
            return undefined;
        }
        var updated = factory.updateParameterDeclaration(node, (0, ts_1.visitNodes)(node.modifiers, function (node) { return (0, ts_1.isDecorator)(node) ? visitor(node) : undefined; }, ts_1.isModifierLike), node.dotDotDotToken, ts_1.Debug.checkDefined((0, ts_1.visitNode)(node.name, visitor, ts_1.isBindingName)), 
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
    function visitVariableStatement(node) {
        if (isExportOfNamespace(node)) {
            var variables = (0, ts_1.getInitializedVariables)(node.declarationList);
            if (variables.length === 0) {
                // elide statement if there are no initialized variables.
                return undefined;
            }
            return (0, ts_1.setTextRange)(factory.createExpressionStatement(factory.inlineExpressions((0, ts_1.map)(variables, transformInitializedVariable))), node);
        }
        else {
            return (0, ts_1.visitEachChild)(node, visitor, context);
        }
    }
    function transformInitializedVariable(node) {
        var name = node.name;
        if ((0, ts_1.isBindingPattern)(name)) {
            return (0, ts_1.flattenDestructuringAssignment)(node, visitor, context, 0 /* FlattenLevel.All */, 
            /*needsValue*/ false, createNamespaceExportExpression);
        }
        else {
            return (0, ts_1.setTextRange)(factory.createAssignment(getNamespaceMemberNameWithSourceMapsAndWithoutComments(name), ts_1.Debug.checkDefined((0, ts_1.visitNode)(node.initializer, visitor, ts_1.isExpression))), 
            /*location*/ node);
        }
    }
    function visitVariableDeclaration(node) {
        var updated = factory.updateVariableDeclaration(node, ts_1.Debug.checkDefined((0, ts_1.visitNode)(node.name, visitor, ts_1.isBindingName)), 
        /*exclamationToken*/ undefined, 
        /*type*/ undefined, (0, ts_1.visitNode)(node.initializer, visitor, ts_1.isExpression));
        if (node.type) {
            (0, ts_1.setTypeNode)(updated.name, node.type);
        }
        return updated;
    }
    function visitParenthesizedExpression(node) {
        var innerExpression = (0, ts_1.skipOuterExpressions)(node.expression, ~6 /* OuterExpressionKinds.Assertions */);
        if ((0, ts_1.isAssertionExpression)(innerExpression)) {
            // Make sure we consider all nested cast expressions, e.g.:
            // (<any><number><any>-A).x;
            var expression = (0, ts_1.visitNode)(node.expression, visitor, ts_1.isExpression);
            ts_1.Debug.assert(expression);
            // We have an expression of the form: (<Type>SubExpr). Emitting this as (SubExpr)
            // is really not desirable. We would like to emit the subexpression as-is. Omitting
            // the parentheses, however, could cause change in the semantics of the generated
            // code if the casted expression has a lower precedence than the rest of the
            // expression.
            //
            // To preserve comments, we return a "PartiallyEmittedExpression" here which will
            // preserve the position information of the original expression.
            //
            // Due to the auto-parenthesization rules used by the visitor and factory functions
            // we can safely elide the parentheses here, as a new synthetic
            // ParenthesizedExpression will be inserted if we remove parentheses too
            // aggressively.
            //
            // If there are leading comments on the expression itself, the emitter will handle ASI
            // for return, throw, and yield by re-introducing parenthesis during emit on an as-need
            // basis.
            return factory.createPartiallyEmittedExpression(expression, node);
        }
        return (0, ts_1.visitEachChild)(node, visitor, context);
    }
    function visitAssertionExpression(node) {
        var expression = (0, ts_1.visitNode)(node.expression, visitor, ts_1.isExpression);
        ts_1.Debug.assert(expression);
        return factory.createPartiallyEmittedExpression(expression, node);
    }
    function visitNonNullExpression(node) {
        var expression = (0, ts_1.visitNode)(node.expression, visitor, ts_1.isLeftHandSideExpression);
        ts_1.Debug.assert(expression);
        return factory.createPartiallyEmittedExpression(expression, node);
    }
    function visitSatisfiesExpression(node) {
        var expression = (0, ts_1.visitNode)(node.expression, visitor, ts_1.isExpression);
        ts_1.Debug.assert(expression);
        return factory.createPartiallyEmittedExpression(expression, node);
    }
    function visitCallExpression(node) {
        return factory.updateCallExpression(node, ts_1.Debug.checkDefined((0, ts_1.visitNode)(node.expression, visitor, ts_1.isExpression)), 
        /*typeArguments*/ undefined, (0, ts_1.visitNodes)(node.arguments, visitor, ts_1.isExpression));
    }
    function visitNewExpression(node) {
        return factory.updateNewExpression(node, ts_1.Debug.checkDefined((0, ts_1.visitNode)(node.expression, visitor, ts_1.isExpression)), 
        /*typeArguments*/ undefined, (0, ts_1.visitNodes)(node.arguments, visitor, ts_1.isExpression));
    }
    function visitTaggedTemplateExpression(node) {
        return factory.updateTaggedTemplateExpression(node, ts_1.Debug.checkDefined((0, ts_1.visitNode)(node.tag, visitor, ts_1.isExpression)), 
        /*typeArguments*/ undefined, ts_1.Debug.checkDefined((0, ts_1.visitNode)(node.template, visitor, ts_1.isTemplateLiteral)));
    }
    function visitJsxSelfClosingElement(node) {
        return factory.updateJsxSelfClosingElement(node, ts_1.Debug.checkDefined((0, ts_1.visitNode)(node.tagName, visitor, ts_1.isJsxTagNameExpression)), 
        /*typeArguments*/ undefined, ts_1.Debug.checkDefined((0, ts_1.visitNode)(node.attributes, visitor, ts_1.isJsxAttributes)));
    }
    function visitJsxJsxOpeningElement(node) {
        return factory.updateJsxOpeningElement(node, ts_1.Debug.checkDefined((0, ts_1.visitNode)(node.tagName, visitor, ts_1.isJsxTagNameExpression)), 
        /*typeArguments*/ undefined, ts_1.Debug.checkDefined((0, ts_1.visitNode)(node.attributes, visitor, ts_1.isJsxAttributes)));
    }
    /**
     * Determines whether to emit an enum declaration.
     *
     * @param node The enum declaration node.
     */
    function shouldEmitEnumDeclaration(node) {
        return !(0, ts_1.isEnumConst)(node)
            || (0, ts_1.shouldPreserveConstEnums)(compilerOptions);
    }
    /**
     * Visits an enum declaration.
     *
     * This function will be called any time a TypeScript enum is encountered.
     *
     * @param node The enum declaration node.
     */
    function visitEnumDeclaration(node) {
        if (!shouldEmitEnumDeclaration(node)) {
            return factory.createNotEmittedStatement(node);
        }
        var statements = [];
        // We request to be advised when the printer is about to print this node. This allows
        // us to set up the correct state for later substitutions.
        var emitFlags = 4 /* EmitFlags.AdviseOnEmitNode */;
        // If needed, we should emit a variable declaration for the enum. If we emit
        // a leading variable declaration, we should not emit leading comments for the
        // enum body.
        var varAdded = addVarForEnumOrModuleDeclaration(statements, node);
        if (varAdded) {
            // We should still emit the comments if we are emitting a system module.
            if (moduleKind !== ts_1.ModuleKind.System || currentLexicalScope !== currentSourceFile) {
                emitFlags |= 1024 /* EmitFlags.NoLeadingComments */;
            }
        }
        // `parameterName` is the declaration name used inside of the enum.
        var parameterName = getNamespaceParameterName(node);
        // `containerName` is the expression used inside of the enum for assignments.
        var containerName = getNamespaceContainerName(node);
        // `exportName` is the expression used within this node's container for any exported references.
        var exportName = isExportOfNamespace(node)
            ? factory.getExternalModuleOrNamespaceExportName(currentNamespaceContainerName, node, /*allowComments*/ false, /*allowSourceMaps*/ true)
            : factory.getDeclarationName(node, /*allowComments*/ false, /*allowSourceMaps*/ true);
        //  x || (x = {})
        //  exports.x || (exports.x = {})
        var moduleArg = factory.createLogicalOr(exportName, factory.createAssignment(exportName, factory.createObjectLiteralExpression()));
        if (isExportOfNamespace(node)) {
            // `localName` is the expression used within this node's containing scope for any local references.
            var localName = factory.getLocalName(node, /*allowComments*/ false, /*allowSourceMaps*/ true);
            //  x = (exports.x || (exports.x = {}))
            moduleArg = factory.createAssignment(localName, moduleArg);
        }
        //  (function (x) {
        //      x[x["y"] = 0] = "y";
        //      ...
        //  })(x || (x = {}));
        var enumStatement = factory.createExpressionStatement(factory.createCallExpression(factory.createFunctionExpression(
        /*modifiers*/ undefined, 
        /*asteriskToken*/ undefined, 
        /*name*/ undefined, 
        /*typeParameters*/ undefined, [factory.createParameterDeclaration(/*modifiers*/ undefined, /*dotDotDotToken*/ undefined, parameterName)], 
        /*type*/ undefined, transformEnumBody(node, containerName)), 
        /*typeArguments*/ undefined, [moduleArg]));
        (0, ts_1.setOriginalNode)(enumStatement, node);
        if (varAdded) {
            // If a variable was added, synthetic comments are emitted on it, not on the moduleStatement.
            (0, ts_1.setSyntheticLeadingComments)(enumStatement, undefined);
            (0, ts_1.setSyntheticTrailingComments)(enumStatement, undefined);
        }
        (0, ts_1.setTextRange)(enumStatement, node);
        (0, ts_1.addEmitFlags)(enumStatement, emitFlags);
        statements.push(enumStatement);
        return statements;
    }
    /**
     * Transforms the body of an enum declaration.
     *
     * @param node The enum declaration node.
     */
    function transformEnumBody(node, localName) {
        var savedCurrentNamespaceLocalName = currentNamespaceContainerName;
        currentNamespaceContainerName = localName;
        var statements = [];
        startLexicalEnvironment();
        var members = (0, ts_1.map)(node.members, transformEnumMember);
        (0, ts_1.insertStatementsAfterStandardPrologue)(statements, endLexicalEnvironment());
        (0, ts_1.addRange)(statements, members);
        currentNamespaceContainerName = savedCurrentNamespaceLocalName;
        return factory.createBlock((0, ts_1.setTextRange)(factory.createNodeArray(statements), /*location*/ node.members), 
        /*multiLine*/ true);
    }
    /**
     * Transforms an enum member into a statement.
     *
     * @param member The enum member node.
     */
    function transformEnumMember(member) {
        // enums don't support computed properties
        // we pass false as 'generateNameForComputedPropertyName' for a backward compatibility purposes
        // old emitter always generate 'expression' part of the name as-is.
        var name = getExpressionForPropertyName(member, /*generateNameForComputedPropertyName*/ false);
        var valueExpression = transformEnumMemberDeclarationValue(member);
        var innerAssignment = factory.createAssignment(factory.createElementAccessExpression(currentNamespaceContainerName, name), valueExpression);
        var outerAssignment = valueExpression.kind === 11 /* SyntaxKind.StringLiteral */ ?
            innerAssignment :
            factory.createAssignment(factory.createElementAccessExpression(currentNamespaceContainerName, innerAssignment), name);
        return (0, ts_1.setTextRange)(factory.createExpressionStatement((0, ts_1.setTextRange)(outerAssignment, member)), member);
    }
    /**
     * Transforms the value of an enum member.
     *
     * @param member The enum member node.
     */
    function transformEnumMemberDeclarationValue(member) {
        var value = resolver.getConstantValue(member);
        if (value !== undefined) {
            return typeof value === "string" ? factory.createStringLiteral(value) : factory.createNumericLiteral(value);
        }
        else {
            enableSubstitutionForNonQualifiedEnumMembers();
            if (member.initializer) {
                return ts_1.Debug.checkDefined((0, ts_1.visitNode)(member.initializer, visitor, ts_1.isExpression));
            }
            else {
                return factory.createVoidZero();
            }
        }
    }
    /**
     * Determines whether to elide a module declaration.
     *
     * @param node The module declaration node.
     */
    function shouldEmitModuleDeclaration(nodeIn) {
        var node = (0, ts_1.getParseTreeNode)(nodeIn, ts_1.isModuleDeclaration);
        if (!node) {
            // If we can't find a parse tree node, assume the node is instantiated.
            return true;
        }
        return (0, ts_1.isInstantiatedModule)(node, (0, ts_1.shouldPreserveConstEnums)(compilerOptions));
    }
    /**
     * Records that a declaration was emitted in the current scope, if it was the first
     * declaration for the provided symbol.
     */
    function recordEmittedDeclarationInScope(node) {
        if (!currentScopeFirstDeclarationsOfName) {
            currentScopeFirstDeclarationsOfName = new Map();
        }
        var name = declaredNameInScope(node);
        if (!currentScopeFirstDeclarationsOfName.has(name)) {
            currentScopeFirstDeclarationsOfName.set(name, node);
        }
    }
    /**
     * Determines whether a declaration is the first declaration with
     * the same name emitted in the current scope.
     */
    function isFirstEmittedDeclarationInScope(node) {
        if (currentScopeFirstDeclarationsOfName) {
            var name_1 = declaredNameInScope(node);
            return currentScopeFirstDeclarationsOfName.get(name_1) === node;
        }
        return true;
    }
    function declaredNameInScope(node) {
        ts_1.Debug.assertNode(node.name, ts_1.isIdentifier);
        return node.name.escapedText;
    }
    /**
     * Adds a leading VariableStatement for a enum or module declaration.
     */
    function addVarForEnumOrModuleDeclaration(statements, node) {
        // Emit a variable statement for the module. We emit top-level enums as a `var`
        // declaration to avoid static errors in global scripts scripts due to redeclaration.
        // enums in any other scope are emitted as a `let` declaration.
        var varDecl = factory.createVariableDeclaration(factory.getLocalName(node, /*allowComments*/ false, /*allowSourceMaps*/ true));
        var varFlags = currentLexicalScope.kind === 311 /* SyntaxKind.SourceFile */ ? 0 /* NodeFlags.None */ : 1 /* NodeFlags.Let */;
        var statement = factory.createVariableStatement((0, ts_1.visitNodes)(node.modifiers, modifierVisitor, ts_1.isModifier), factory.createVariableDeclarationList([varDecl], varFlags));
        (0, ts_1.setOriginalNode)(varDecl, node);
        (0, ts_1.setSyntheticLeadingComments)(varDecl, undefined);
        (0, ts_1.setSyntheticTrailingComments)(varDecl, undefined);
        (0, ts_1.setOriginalNode)(statement, node);
        recordEmittedDeclarationInScope(node);
        if (isFirstEmittedDeclarationInScope(node)) {
            // Adjust the source map emit to match the old emitter.
            if (node.kind === 265 /* SyntaxKind.EnumDeclaration */) {
                (0, ts_1.setSourceMapRange)(statement.declarationList, node);
            }
            else {
                (0, ts_1.setSourceMapRange)(statement, node);
            }
            // Trailing comments for module declaration should be emitted after the function closure
            // instead of the variable statement:
            //
            //     /** Module comment*/
            //     module m1 {
            //         function foo4Export() {
            //         }
            //     } // trailing comment module
            //
            // Should emit:
            //
            //     /** Module comment*/
            //     var m1;
            //     (function (m1) {
            //         function foo4Export() {
            //         }
            //     })(m1 || (m1 = {})); // trailing comment module
            //
            (0, ts_1.setCommentRange)(statement, node);
            (0, ts_1.addEmitFlags)(statement, 2048 /* EmitFlags.NoTrailingComments */);
            statements.push(statement);
            return true;
        }
        // For an EnumDeclaration or ModuleDeclaration that merges with a preceeding
        // declaration we do not emit a leading variable declaration.
        return false;
    }
    /**
     * Visits a module declaration node.
     *
     * This function will be called any time a TypeScript namespace (ModuleDeclaration) is encountered.
     *
     * @param node The module declaration node.
     */
    function visitModuleDeclaration(node) {
        if (!shouldEmitModuleDeclaration(node)) {
            return factory.createNotEmittedStatement(node);
        }
        ts_1.Debug.assertNode(node.name, ts_1.isIdentifier, "A TypeScript namespace should have an Identifier name.");
        enableSubstitutionForNamespaceExports();
        var statements = [];
        // We request to be advised when the printer is about to print this node. This allows
        // us to set up the correct state for later substitutions.
        var emitFlags = 4 /* EmitFlags.AdviseOnEmitNode */;
        // If needed, we should emit a variable declaration for the module. If we emit
        // a leading variable declaration, we should not emit leading comments for the
        // module body.
        var varAdded = addVarForEnumOrModuleDeclaration(statements, node);
        if (varAdded) {
            // We should still emit the comments if we are emitting a system module.
            if (moduleKind !== ts_1.ModuleKind.System || currentLexicalScope !== currentSourceFile) {
                emitFlags |= 1024 /* EmitFlags.NoLeadingComments */;
            }
        }
        // `parameterName` is the declaration name used inside of the namespace.
        var parameterName = getNamespaceParameterName(node);
        // `containerName` is the expression used inside of the namespace for exports.
        var containerName = getNamespaceContainerName(node);
        // `exportName` is the expression used within this node's container for any exported references.
        var exportName = isExportOfNamespace(node)
            ? factory.getExternalModuleOrNamespaceExportName(currentNamespaceContainerName, node, /*allowComments*/ false, /*allowSourceMaps*/ true)
            : factory.getDeclarationName(node, /*allowComments*/ false, /*allowSourceMaps*/ true);
        //  x || (x = {})
        //  exports.x || (exports.x = {})
        var moduleArg = factory.createLogicalOr(exportName, factory.createAssignment(exportName, factory.createObjectLiteralExpression()));
        if (isExportOfNamespace(node)) {
            // `localName` is the expression used within this node's containing scope for any local references.
            var localName = factory.getLocalName(node, /*allowComments*/ false, /*allowSourceMaps*/ true);
            //  x = (exports.x || (exports.x = {}))
            moduleArg = factory.createAssignment(localName, moduleArg);
        }
        //  (function (x_1) {
        //      x_1.y = ...;
        //  })(x || (x = {}));
        var moduleStatement = factory.createExpressionStatement(factory.createCallExpression(factory.createFunctionExpression(
        /*modifiers*/ undefined, 
        /*asteriskToken*/ undefined, 
        /*name*/ undefined, 
        /*typeParameters*/ undefined, [factory.createParameterDeclaration(/*modifiers*/ undefined, /*dotDotDotToken*/ undefined, parameterName)], 
        /*type*/ undefined, transformModuleBody(node, containerName)), 
        /*typeArguments*/ undefined, [moduleArg]));
        (0, ts_1.setOriginalNode)(moduleStatement, node);
        if (varAdded) {
            // If a variable was added, synthetic comments are emitted on it, not on the moduleStatement.
            (0, ts_1.setSyntheticLeadingComments)(moduleStatement, undefined);
            (0, ts_1.setSyntheticTrailingComments)(moduleStatement, undefined);
        }
        (0, ts_1.setTextRange)(moduleStatement, node);
        (0, ts_1.addEmitFlags)(moduleStatement, emitFlags);
        statements.push(moduleStatement);
        return statements;
    }
    /**
     * Transforms the body of a module declaration.
     *
     * @param node The module declaration node.
     */
    function transformModuleBody(node, namespaceLocalName) {
        var savedCurrentNamespaceContainerName = currentNamespaceContainerName;
        var savedCurrentNamespace = currentNamespace;
        var savedCurrentScopeFirstDeclarationsOfName = currentScopeFirstDeclarationsOfName;
        currentNamespaceContainerName = namespaceLocalName;
        currentNamespace = node;
        currentScopeFirstDeclarationsOfName = undefined;
        var statements = [];
        startLexicalEnvironment();
        var statementsLocation;
        var blockLocation;
        if (node.body) {
            if (node.body.kind === 267 /* SyntaxKind.ModuleBlock */) {
                saveStateAndInvoke(node.body, function (body) { return (0, ts_1.addRange)(statements, (0, ts_1.visitNodes)(body.statements, namespaceElementVisitor, ts_1.isStatement)); });
                statementsLocation = node.body.statements;
                blockLocation = node.body;
            }
            else {
                var result = visitModuleDeclaration(node.body);
                if (result) {
                    if ((0, ts_1.isArray)(result)) {
                        (0, ts_1.addRange)(statements, result);
                    }
                    else {
                        statements.push(result);
                    }
                }
                var moduleBlock = getInnerMostModuleDeclarationFromDottedModule(node).body;
                statementsLocation = (0, ts_1.moveRangePos)(moduleBlock.statements, -1);
            }
        }
        (0, ts_1.insertStatementsAfterStandardPrologue)(statements, endLexicalEnvironment());
        currentNamespaceContainerName = savedCurrentNamespaceContainerName;
        currentNamespace = savedCurrentNamespace;
        currentScopeFirstDeclarationsOfName = savedCurrentScopeFirstDeclarationsOfName;
        var block = factory.createBlock((0, ts_1.setTextRange)(factory.createNodeArray(statements), 
        /*location*/ statementsLocation), 
        /*multiLine*/ true);
        (0, ts_1.setTextRange)(block, blockLocation);
        // namespace hello.hi.world {
        //      function foo() {}
        //
        //      // TODO, blah
        // }
        //
        // should be emitted as
        //
        // var hello;
        // (function (hello) {
        //     var hi;
        //     (function (hi) {
        //         var world;
        //         (function (world) {
        //             function foo() { }
        //             // TODO, blah
        //         })(world = hi.world || (hi.world = {}));
        //     })(hi = hello.hi || (hello.hi = {}));
        // })(hello || (hello = {}));
        // We only want to emit comment on the namespace which contains block body itself, not the containing namespaces.
        if (!node.body || node.body.kind !== 267 /* SyntaxKind.ModuleBlock */) {
            (0, ts_1.setEmitFlags)(block, (0, ts_1.getEmitFlags)(block) | 3072 /* EmitFlags.NoComments */);
        }
        return block;
    }
    function getInnerMostModuleDeclarationFromDottedModule(moduleDeclaration) {
        if (moduleDeclaration.body.kind === 266 /* SyntaxKind.ModuleDeclaration */) {
            var recursiveInnerModule = getInnerMostModuleDeclarationFromDottedModule(moduleDeclaration.body);
            return recursiveInnerModule || moduleDeclaration.body;
        }
    }
    /**
     * Visits an import declaration, eliding it if it is type-only or if it has an import clause that may be elided.
     *
     * @param node The import declaration node.
     */
    function visitImportDeclaration(node) {
        if (!node.importClause) {
            // Do not elide a side-effect only import declaration.
            //  import "foo";
            return node;
        }
        if (node.importClause.isTypeOnly) {
            // Always elide type-only imports
            return undefined;
        }
        // Elide the declaration if the import clause was elided.
        var importClause = (0, ts_1.visitNode)(node.importClause, visitImportClause, ts_1.isImportClause);
        return importClause ||
            compilerOptions.importsNotUsedAsValues === 1 /* ImportsNotUsedAsValues.Preserve */ ||
            compilerOptions.importsNotUsedAsValues === 2 /* ImportsNotUsedAsValues.Error */
            ? factory.updateImportDeclaration(node, 
            /*modifiers*/ undefined, importClause, node.moduleSpecifier, node.assertClause)
            : undefined;
    }
    /**
     * Visits an import clause, eliding it if its `name` and `namedBindings` may both be elided.
     *
     * @param node The import clause node.
     */
    function visitImportClause(node) {
        ts_1.Debug.assert(!node.isTypeOnly);
        // Elide the import clause if we elide both its name and its named bindings.
        var name = shouldEmitAliasDeclaration(node) ? node.name : undefined;
        var namedBindings = (0, ts_1.visitNode)(node.namedBindings, visitNamedImportBindings, ts_1.isNamedImportBindings);
        return (name || namedBindings) ? factory.updateImportClause(node, /*isTypeOnly*/ false, name, namedBindings) : undefined;
    }
    /**
     * Visits named import bindings, eliding them if their targets, their references, and the compilation settings allow.
     *
     * @param node The named import bindings node.
     */
    function visitNamedImportBindings(node) {
        if (node.kind === 273 /* SyntaxKind.NamespaceImport */) {
            // Elide a namespace import if it is not referenced.
            return shouldEmitAliasDeclaration(node) ? node : undefined;
        }
        else {
            // Elide named imports if all of its import specifiers are elided and settings allow.
            var allowEmpty = compilerOptions.verbatimModuleSyntax || compilerOptions.preserveValueImports && (compilerOptions.importsNotUsedAsValues === 1 /* ImportsNotUsedAsValues.Preserve */ ||
                compilerOptions.importsNotUsedAsValues === 2 /* ImportsNotUsedAsValues.Error */);
            var elements = (0, ts_1.visitNodes)(node.elements, visitImportSpecifier, ts_1.isImportSpecifier);
            return allowEmpty || (0, ts_1.some)(elements) ? factory.updateNamedImports(node, elements) : undefined;
        }
    }
    /**
     * Visits an import specifier, eliding it if its target, its references, and the compilation settings allow.
     *
     * @param node The import specifier node.
     */
    function visitImportSpecifier(node) {
        return !node.isTypeOnly && shouldEmitAliasDeclaration(node) ? node : undefined;
    }
    /**
     * Visits an export assignment, eliding it if it does not contain a clause that resolves
     * to a value.
     *
     * @param node The export assignment node.
     */
    function visitExportAssignment(node) {
        // Elide the export assignment if it does not reference a value.
        return compilerOptions.verbatimModuleSyntax || resolver.isValueAliasDeclaration(node)
            ? (0, ts_1.visitEachChild)(node, visitor, context)
            : undefined;
    }
    /**
     * Visits an export declaration, eliding it if it does not contain a clause that resolves to a value.
     *
     * @param node The export declaration node.
     */
    function visitExportDeclaration(node) {
        if (node.isTypeOnly) {
            return undefined;
        }
        if (!node.exportClause || (0, ts_1.isNamespaceExport)(node.exportClause)) {
            // never elide `export <whatever> from <whereever>` declarations -
            // they should be kept for sideffects/untyped exports, even when the
            // type checker doesn't know about any exports
            return node;
        }
        // Elide the export declaration if all of its named exports are elided.
        var allowEmpty = compilerOptions.verbatimModuleSyntax || !!node.moduleSpecifier && (compilerOptions.importsNotUsedAsValues === 1 /* ImportsNotUsedAsValues.Preserve */ ||
            compilerOptions.importsNotUsedAsValues === 2 /* ImportsNotUsedAsValues.Error */);
        var exportClause = (0, ts_1.visitNode)(node.exportClause, function (bindings) { return visitNamedExportBindings(bindings, allowEmpty); }, ts_1.isNamedExportBindings);
        return exportClause
            ? factory.updateExportDeclaration(node, 
            /*modifiers*/ undefined, node.isTypeOnly, exportClause, node.moduleSpecifier, node.assertClause)
            : undefined;
    }
    /**
     * Visits named exports, eliding it if it does not contain an export specifier that
     * resolves to a value.
     *
     * @param node The named exports node.
     */
    function visitNamedExports(node, allowEmpty) {
        // Elide the named exports if all of its export specifiers were elided.
        var elements = (0, ts_1.visitNodes)(node.elements, visitExportSpecifier, ts_1.isExportSpecifier);
        return allowEmpty || (0, ts_1.some)(elements) ? factory.updateNamedExports(node, elements) : undefined;
    }
    function visitNamespaceExports(node) {
        return factory.updateNamespaceExport(node, ts_1.Debug.checkDefined((0, ts_1.visitNode)(node.name, visitor, ts_1.isIdentifier)));
    }
    function visitNamedExportBindings(node, allowEmpty) {
        return (0, ts_1.isNamespaceExport)(node) ? visitNamespaceExports(node) : visitNamedExports(node, allowEmpty);
    }
    /**
     * Visits an export specifier, eliding it if it does not resolve to a value.
     *
     * @param node The export specifier node.
     */
    function visitExportSpecifier(node) {
        // Elide an export specifier if it does not reference a value.
        return !node.isTypeOnly && (compilerOptions.verbatimModuleSyntax || resolver.isValueAliasDeclaration(node)) ? node : undefined;
    }
    /**
     * Determines whether to emit an import equals declaration.
     *
     * @param node The import equals declaration node.
     */
    function shouldEmitImportEqualsDeclaration(node) {
        // preserve old compiler's behavior: emit 'var' for import declaration (even if we do not consider them referenced) when
        // - current file is not external module
        // - import declaration is top level and target is value imported by entity name
        return shouldEmitAliasDeclaration(node)
            || (!(0, ts_1.isExternalModule)(currentSourceFile)
                && resolver.isTopLevelValueImportEqualsWithEntityName(node));
    }
    /**
     * Visits an import equals declaration.
     *
     * @param node The import equals declaration node.
     */
    function visitImportEqualsDeclaration(node) {
        // Always elide type-only imports
        if (node.isTypeOnly) {
            return undefined;
        }
        if ((0, ts_1.isExternalModuleImportEqualsDeclaration)(node)) {
            var isReferenced = shouldEmitAliasDeclaration(node);
            // If the alias is unreferenced but we want to keep the import, replace with 'import "mod"'.
            if (!isReferenced && compilerOptions.importsNotUsedAsValues === 1 /* ImportsNotUsedAsValues.Preserve */) {
                return (0, ts_1.setOriginalNode)((0, ts_1.setTextRange)(factory.createImportDeclaration(
                /*modifiers*/ undefined, 
                /*importClause*/ undefined, node.moduleReference.expression, 
                /*assertClause*/ undefined), node), node);
            }
            return isReferenced ? (0, ts_1.visitEachChild)(node, visitor, context) : undefined;
        }
        if (!shouldEmitImportEqualsDeclaration(node)) {
            return undefined;
        }
        var moduleReference = (0, ts_1.createExpressionFromEntityName)(factory, node.moduleReference);
        (0, ts_1.setEmitFlags)(moduleReference, 3072 /* EmitFlags.NoComments */ | 4096 /* EmitFlags.NoNestedComments */);
        if (isNamedExternalModuleExport(node) || !isExportOfNamespace(node)) {
            //  export var ${name} = ${moduleReference};
            //  var ${name} = ${moduleReference};
            return (0, ts_1.setOriginalNode)((0, ts_1.setTextRange)(factory.createVariableStatement((0, ts_1.visitNodes)(node.modifiers, modifierVisitor, ts_1.isModifier), factory.createVariableDeclarationList([
                (0, ts_1.setOriginalNode)(factory.createVariableDeclaration(node.name, 
                /*exclamationToken*/ undefined, 
                /*type*/ undefined, moduleReference), node)
            ])), node), node);
        }
        else {
            // exports.${name} = ${moduleReference};
            return (0, ts_1.setOriginalNode)(createNamespaceExport(node.name, moduleReference, node), node);
        }
    }
    /**
     * Gets a value indicating whether the node is exported from a namespace.
     *
     * @param node The node to test.
     */
    function isExportOfNamespace(node) {
        return currentNamespace !== undefined && (0, ts_1.hasSyntacticModifier)(node, 1 /* ModifierFlags.Export */);
    }
    /**
     * Gets a value indicating whether the node is exported from an external module.
     *
     * @param node The node to test.
     */
    function isExternalModuleExport(node) {
        return currentNamespace === undefined && (0, ts_1.hasSyntacticModifier)(node, 1 /* ModifierFlags.Export */);
    }
    /**
     * Gets a value indicating whether the node is a named export from an external module.
     *
     * @param node The node to test.
     */
    function isNamedExternalModuleExport(node) {
        return isExternalModuleExport(node)
            && !(0, ts_1.hasSyntacticModifier)(node, 1024 /* ModifierFlags.Default */);
    }
    /**
     * Gets a value indicating whether the node is the default export of an external module.
     *
     * @param node The node to test.
     */
    function isDefaultExternalModuleExport(node) {
        return isExternalModuleExport(node)
            && (0, ts_1.hasSyntacticModifier)(node, 1024 /* ModifierFlags.Default */);
    }
    function createExportMemberAssignmentStatement(node) {
        var expression = factory.createAssignment(factory.getExternalModuleOrNamespaceExportName(currentNamespaceContainerName, node, /*allowComments*/ false, /*allowSourceMaps*/ true), factory.getLocalName(node));
        (0, ts_1.setSourceMapRange)(expression, (0, ts_1.createRange)(node.name ? node.name.pos : node.pos, node.end));
        var statement = factory.createExpressionStatement(expression);
        (0, ts_1.setSourceMapRange)(statement, (0, ts_1.createRange)(-1, node.end));
        return statement;
    }
    function addExportMemberAssignment(statements, node) {
        statements.push(createExportMemberAssignmentStatement(node));
    }
    function createNamespaceExport(exportName, exportValue, location) {
        return (0, ts_1.setTextRange)(factory.createExpressionStatement(factory.createAssignment(factory.getNamespaceMemberName(currentNamespaceContainerName, exportName, /*allowComments*/ false, /*allowSourceMaps*/ true), exportValue)), location);
    }
    function createNamespaceExportExpression(exportName, exportValue, location) {
        return (0, ts_1.setTextRange)(factory.createAssignment(getNamespaceMemberNameWithSourceMapsAndWithoutComments(exportName), exportValue), location);
    }
    function getNamespaceMemberNameWithSourceMapsAndWithoutComments(name) {
        return factory.getNamespaceMemberName(currentNamespaceContainerName, name, /*allowComments*/ false, /*allowSourceMaps*/ true);
    }
    /**
     * Gets the declaration name used inside of a namespace or enum.
     */
    function getNamespaceParameterName(node) {
        var name = factory.getGeneratedNameForNode(node);
        (0, ts_1.setSourceMapRange)(name, node.name);
        return name;
    }
    /**
     * Gets the expression used to refer to a namespace or enum within the body
     * of its declaration.
     */
    function getNamespaceContainerName(node) {
        return factory.getGeneratedNameForNode(node);
    }
    function enableSubstitutionForNonQualifiedEnumMembers() {
        if ((enabledSubstitutions & 8 /* TypeScriptSubstitutionFlags.NonQualifiedEnumMembers */) === 0) {
            enabledSubstitutions |= 8 /* TypeScriptSubstitutionFlags.NonQualifiedEnumMembers */;
            context.enableSubstitution(80 /* SyntaxKind.Identifier */);
        }
    }
    function enableSubstitutionForNamespaceExports() {
        if ((enabledSubstitutions & 2 /* TypeScriptSubstitutionFlags.NamespaceExports */) === 0) {
            enabledSubstitutions |= 2 /* TypeScriptSubstitutionFlags.NamespaceExports */;
            // We need to enable substitutions for identifiers and shorthand property assignments. This allows us to
            // substitute the names of exported members of a namespace.
            context.enableSubstitution(80 /* SyntaxKind.Identifier */);
            context.enableSubstitution(303 /* SyntaxKind.ShorthandPropertyAssignment */);
            // We need to be notified when entering and exiting namespaces.
            context.enableEmitNotification(266 /* SyntaxKind.ModuleDeclaration */);
        }
    }
    function isTransformedModuleDeclaration(node) {
        return (0, ts_1.getOriginalNode)(node).kind === 266 /* SyntaxKind.ModuleDeclaration */;
    }
    function isTransformedEnumDeclaration(node) {
        return (0, ts_1.getOriginalNode)(node).kind === 265 /* SyntaxKind.EnumDeclaration */;
    }
    /**
     * Hook for node emit.
     *
     * @param hint A hint as to the intended usage of the node.
     * @param node The node to emit.
     * @param emit A callback used to emit the node in the printer.
     */
    function onEmitNode(hint, node, emitCallback) {
        var savedApplicableSubstitutions = applicableSubstitutions;
        var savedCurrentSourceFile = currentSourceFile;
        if ((0, ts_1.isSourceFile)(node)) {
            currentSourceFile = node;
        }
        if (enabledSubstitutions & 2 /* TypeScriptSubstitutionFlags.NamespaceExports */ && isTransformedModuleDeclaration(node)) {
            applicableSubstitutions |= 2 /* TypeScriptSubstitutionFlags.NamespaceExports */;
        }
        if (enabledSubstitutions & 8 /* TypeScriptSubstitutionFlags.NonQualifiedEnumMembers */ && isTransformedEnumDeclaration(node)) {
            applicableSubstitutions |= 8 /* TypeScriptSubstitutionFlags.NonQualifiedEnumMembers */;
        }
        previousOnEmitNode(hint, node, emitCallback);
        applicableSubstitutions = savedApplicableSubstitutions;
        currentSourceFile = savedCurrentSourceFile;
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
        else if ((0, ts_1.isShorthandPropertyAssignment)(node)) {
            return substituteShorthandPropertyAssignment(node);
        }
        return node;
    }
    function substituteShorthandPropertyAssignment(node) {
        if (enabledSubstitutions & 2 /* TypeScriptSubstitutionFlags.NamespaceExports */) {
            var name_2 = node.name;
            var exportedName = trySubstituteNamespaceExportedName(name_2);
            if (exportedName) {
                // A shorthand property with an assignment initializer is probably part of a
                // destructuring assignment
                if (node.objectAssignmentInitializer) {
                    var initializer = factory.createAssignment(exportedName, node.objectAssignmentInitializer);
                    return (0, ts_1.setTextRange)(factory.createPropertyAssignment(name_2, initializer), node);
                }
                return (0, ts_1.setTextRange)(factory.createPropertyAssignment(name_2, exportedName), node);
            }
        }
        return node;
    }
    function substituteExpression(node) {
        switch (node.kind) {
            case 80 /* SyntaxKind.Identifier */:
                return substituteExpressionIdentifier(node);
            case 210 /* SyntaxKind.PropertyAccessExpression */:
                return substitutePropertyAccessExpression(node);
            case 211 /* SyntaxKind.ElementAccessExpression */:
                return substituteElementAccessExpression(node);
        }
        return node;
    }
    function substituteExpressionIdentifier(node) {
        return trySubstituteNamespaceExportedName(node)
            || node;
    }
    function trySubstituteNamespaceExportedName(node) {
        // If this is explicitly a local name, do not substitute.
        if (enabledSubstitutions & applicableSubstitutions && !(0, ts_1.isGeneratedIdentifier)(node) && !(0, ts_1.isLocalName)(node)) {
            // If we are nested within a namespace declaration, we may need to qualifiy
            // an identifier that is exported from a merged namespace.
            var container = resolver.getReferencedExportContainer(node, /*prefixLocals*/ false);
            if (container && container.kind !== 311 /* SyntaxKind.SourceFile */) {
                var substitute = (applicableSubstitutions & 2 /* TypeScriptSubstitutionFlags.NamespaceExports */ && container.kind === 266 /* SyntaxKind.ModuleDeclaration */) ||
                    (applicableSubstitutions & 8 /* TypeScriptSubstitutionFlags.NonQualifiedEnumMembers */ && container.kind === 265 /* SyntaxKind.EnumDeclaration */);
                if (substitute) {
                    return (0, ts_1.setTextRange)(factory.createPropertyAccessExpression(factory.getGeneratedNameForNode(container), node), 
                    /*location*/ node);
                }
            }
        }
        return undefined;
    }
    function substitutePropertyAccessExpression(node) {
        return substituteConstantValue(node);
    }
    function substituteElementAccessExpression(node) {
        return substituteConstantValue(node);
    }
    function safeMultiLineComment(value) {
        return value.replace(/\*\//g, "*_/");
    }
    function substituteConstantValue(node) {
        var constantValue = tryGetConstEnumValue(node);
        if (constantValue !== undefined) {
            // track the constant value on the node for the printer in needsDotDotForPropertyAccess
            (0, ts_1.setConstantValue)(node, constantValue);
            var substitute = typeof constantValue === "string" ? factory.createStringLiteral(constantValue) : factory.createNumericLiteral(constantValue);
            if (!compilerOptions.removeComments) {
                var originalNode = (0, ts_1.getOriginalNode)(node, ts_1.isAccessExpression);
                (0, ts_1.addSyntheticTrailingComment)(substitute, 3 /* SyntaxKind.MultiLineCommentTrivia */, " ".concat(safeMultiLineComment((0, ts_1.getTextOfNode)(originalNode)), " "));
            }
            return substitute;
        }
        return node;
    }
    function tryGetConstEnumValue(node) {
        if ((0, ts_1.getIsolatedModules)(compilerOptions)) {
            return undefined;
        }
        return (0, ts_1.isPropertyAccessExpression)(node) || (0, ts_1.isElementAccessExpression)(node) ? resolver.getConstantValue(node) : undefined;
    }
    function shouldEmitAliasDeclaration(node) {
        return compilerOptions.verbatimModuleSyntax || (0, ts_1.isInJSFile)(node) ||
            (compilerOptions.preserveValueImports
                ? resolver.isValueAliasDeclaration(node)
                : resolver.isReferencedAliasDeclaration(node));
    }
}
exports.transformTypeScript = transformTypeScript;
