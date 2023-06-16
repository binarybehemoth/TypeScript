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
exports.transformModule = void 0;
var ts_1 = require("../../_namespaces/ts");
/** @internal */
function transformModule(context) {
    function getTransformModuleDelegate(moduleKind) {
        switch (moduleKind) {
            case ts_1.ModuleKind.AMD: return transformAMDModule;
            case ts_1.ModuleKind.UMD: return transformUMDModule;
            default: return transformCommonJSModule;
        }
    }
    var factory = context.factory, emitHelpers = context.getEmitHelperFactory, startLexicalEnvironment = context.startLexicalEnvironment, endLexicalEnvironment = context.endLexicalEnvironment, hoistVariableDeclaration = context.hoistVariableDeclaration;
    var compilerOptions = context.getCompilerOptions();
    var resolver = context.getEmitResolver();
    var host = context.getEmitHost();
    var languageVersion = (0, ts_1.getEmitScriptTarget)(compilerOptions);
    var moduleKind = (0, ts_1.getEmitModuleKind)(compilerOptions);
    var previousOnSubstituteNode = context.onSubstituteNode;
    var previousOnEmitNode = context.onEmitNode;
    context.onSubstituteNode = onSubstituteNode;
    context.onEmitNode = onEmitNode;
    context.enableSubstitution(212 /* SyntaxKind.CallExpression */); // Substitute calls to imported/exported symbols to avoid incorrect `this`.
    context.enableSubstitution(214 /* SyntaxKind.TaggedTemplateExpression */); // Substitute calls to imported/exported symbols to avoid incorrect `this`.
    context.enableSubstitution(80 /* SyntaxKind.Identifier */); // Substitutes expression identifiers with imported/exported symbols.
    context.enableSubstitution(225 /* SyntaxKind.BinaryExpression */); // Substitutes assignments to exported symbols.
    context.enableSubstitution(303 /* SyntaxKind.ShorthandPropertyAssignment */); // Substitutes shorthand property assignments for imported/exported symbols.
    context.enableEmitNotification(311 /* SyntaxKind.SourceFile */); // Restore state when substituting nodes in a file.
    var moduleInfoMap = []; // The ExternalModuleInfo for each file.
    var currentSourceFile; // The current file.
    var currentModuleInfo; // The ExternalModuleInfo for the current file.
    var noSubstitution = []; // Set of nodes for which substitution rules should be ignored.
    var needUMDDynamicImportHelper;
    return (0, ts_1.chainBundle)(context, transformSourceFile);
    /**
     * Transforms the module aspects of a SourceFile.
     *
     * @param node The SourceFile node.
     */
    function transformSourceFile(node) {
        if (node.isDeclarationFile ||
            !((0, ts_1.isEffectiveExternalModule)(node, compilerOptions) ||
                node.transformFlags & 8388608 /* TransformFlags.ContainsDynamicImport */ ||
                ((0, ts_1.isJsonSourceFile)(node) && (0, ts_1.hasJsonModuleEmitEnabled)(compilerOptions) && (0, ts_1.outFile)(compilerOptions)))) {
            return node;
        }
        currentSourceFile = node;
        currentModuleInfo = (0, ts_1.collectExternalModuleInfo)(context, node, resolver, compilerOptions);
        moduleInfoMap[(0, ts_1.getOriginalNodeId)(node)] = currentModuleInfo;
        // Perform the transformation.
        var transformModule = getTransformModuleDelegate(moduleKind);
        var updated = transformModule(node);
        currentSourceFile = undefined;
        currentModuleInfo = undefined;
        needUMDDynamicImportHelper = false;
        return updated;
    }
    function shouldEmitUnderscoreUnderscoreESModule() {
        if (!currentModuleInfo.exportEquals && (0, ts_1.isExternalModule)(currentSourceFile)) {
            return true;
        }
        return false;
    }
    /**
     * Transforms a SourceFile into a CommonJS module.
     *
     * @param node The SourceFile node.
     */
    function transformCommonJSModule(node) {
        startLexicalEnvironment();
        var statements = [];
        var ensureUseStrict = (0, ts_1.getStrictOptionValue)(compilerOptions, "alwaysStrict") || (!compilerOptions.noImplicitUseStrict && (0, ts_1.isExternalModule)(currentSourceFile));
        var statementOffset = factory.copyPrologue(node.statements, statements, ensureUseStrict && !(0, ts_1.isJsonSourceFile)(node), topLevelVisitor);
        if (shouldEmitUnderscoreUnderscoreESModule()) {
            (0, ts_1.append)(statements, createUnderscoreUnderscoreESModule());
        }
        if ((0, ts_1.length)(currentModuleInfo.exportedNames)) {
            var chunkSize = 50;
            for (var i = 0; i < currentModuleInfo.exportedNames.length; i += chunkSize) {
                (0, ts_1.append)(statements, factory.createExpressionStatement((0, ts_1.reduceLeft)(currentModuleInfo.exportedNames.slice(i, i + chunkSize), function (prev, nextId) { return factory.createAssignment(factory.createPropertyAccessExpression(factory.createIdentifier("exports"), factory.createIdentifier((0, ts_1.idText)(nextId))), prev); }, factory.createVoidZero())));
            }
        }
        (0, ts_1.append)(statements, (0, ts_1.visitNode)(currentModuleInfo.externalHelpersImportDeclaration, topLevelVisitor, ts_1.isStatement));
        (0, ts_1.addRange)(statements, (0, ts_1.visitNodes)(node.statements, topLevelVisitor, ts_1.isStatement, statementOffset));
        addExportEqualsIfNeeded(statements, /*emitAsReturn*/ false);
        (0, ts_1.insertStatementsAfterStandardPrologue)(statements, endLexicalEnvironment());
        var updated = factory.updateSourceFile(node, (0, ts_1.setTextRange)(factory.createNodeArray(statements), node.statements));
        (0, ts_1.addEmitHelpers)(updated, context.readEmitHelpers());
        return updated;
    }
    /**
     * Transforms a SourceFile into an AMD module.
     *
     * @param node The SourceFile node.
     */
    function transformAMDModule(node) {
        var define = factory.createIdentifier("define");
        var moduleName = (0, ts_1.tryGetModuleNameFromFile)(factory, node, host, compilerOptions);
        var jsonSourceFile = (0, ts_1.isJsonSourceFile)(node) && node;
        // An AMD define function has the following shape:
        //
        //     define(id?, dependencies?, factory);
        //
        // This has the shape of the following:
        //
        //     define(name, ["module1", "module2"], function (module1Alias) { ... }
        //
        // The location of the alias in the parameter list in the factory function needs to
        // match the position of the module name in the dependency list.
        //
        // To ensure this is true in cases of modules with no aliases, e.g.:
        //
        //     import "module"
        //
        // or
        //
        //     /// <amd-dependency path= "a.css" />
        //
        // we need to add modules without alias names to the end of the dependencies list
        var _a = collectAsynchronousDependencies(node, /*includeNonAmdDependencies*/ true), aliasedModuleNames = _a.aliasedModuleNames, unaliasedModuleNames = _a.unaliasedModuleNames, importAliasNames = _a.importAliasNames;
        // Create an updated SourceFile:
        //
        //     define(mofactory.updateSourceFile", "module2"], function ...
        var updated = factory.updateSourceFile(node, (0, ts_1.setTextRange)(factory.createNodeArray([
            factory.createExpressionStatement(factory.createCallExpression(define, 
            /*typeArguments*/ undefined, __spreadArray(__spreadArray([], (moduleName ? [moduleName] : []), true), [
                // Add the dependency array argument:
                //
                //     ["require", "exports", module1", "module2", ...]
                factory.createArrayLiteralExpression(jsonSourceFile ? ts_1.emptyArray : __spreadArray(__spreadArray([
                    factory.createStringLiteral("require"),
                    factory.createStringLiteral("exports")
                ], aliasedModuleNames, true), unaliasedModuleNames, true)),
                // Add the module body function argument:
                //
                //     function (require, exports, module1, module2) ...
                jsonSourceFile ?
                    jsonSourceFile.statements.length ? jsonSourceFile.statements[0].expression : factory.createObjectLiteralExpression() :
                    factory.createFunctionExpression(
                    /*modifiers*/ undefined, 
                    /*asteriskToken*/ undefined, 
                    /*name*/ undefined, 
                    /*typeParameters*/ undefined, __spreadArray([
                        factory.createParameterDeclaration(/*modifiers*/ undefined, /*dotDotDotToken*/ undefined, "require"),
                        factory.createParameterDeclaration(/*modifiers*/ undefined, /*dotDotDotToken*/ undefined, "exports")
                    ], importAliasNames, true), 
                    /*type*/ undefined, transformAsynchronousModuleBody(node))
            ], false)))
        ]), 
        /*location*/ node.statements));
        (0, ts_1.addEmitHelpers)(updated, context.readEmitHelpers());
        return updated;
    }
    /**
     * Transforms a SourceFile into a UMD module.
     *
     * @param node The SourceFile node.
     */
    function transformUMDModule(node) {
        var _a = collectAsynchronousDependencies(node, /*includeNonAmdDependencies*/ false), aliasedModuleNames = _a.aliasedModuleNames, unaliasedModuleNames = _a.unaliasedModuleNames, importAliasNames = _a.importAliasNames;
        var moduleName = (0, ts_1.tryGetModuleNameFromFile)(factory, node, host, compilerOptions);
        var umdHeader = factory.createFunctionExpression(
        /*modifiers*/ undefined, 
        /*asteriskToken*/ undefined, 
        /*name*/ undefined, 
        /*typeParameters*/ undefined, [factory.createParameterDeclaration(/*modifiers*/ undefined, /*dotDotDotToken*/ undefined, "factory")], 
        /*type*/ undefined, (0, ts_1.setTextRange)(factory.createBlock([
            factory.createIfStatement(factory.createLogicalAnd(factory.createTypeCheck(factory.createIdentifier("module"), "object"), factory.createTypeCheck(factory.createPropertyAccessExpression(factory.createIdentifier("module"), "exports"), "object")), factory.createBlock([
                factory.createVariableStatement(
                /*modifiers*/ undefined, [
                    factory.createVariableDeclaration("v", 
                    /*exclamationToken*/ undefined, 
                    /*type*/ undefined, factory.createCallExpression(factory.createIdentifier("factory"), 
                    /*typeArguments*/ undefined, [
                        factory.createIdentifier("require"),
                        factory.createIdentifier("exports")
                    ]))
                ]),
                (0, ts_1.setEmitFlags)(factory.createIfStatement(factory.createStrictInequality(factory.createIdentifier("v"), factory.createIdentifier("undefined")), factory.createExpressionStatement(factory.createAssignment(factory.createPropertyAccessExpression(factory.createIdentifier("module"), "exports"), factory.createIdentifier("v")))), 1 /* EmitFlags.SingleLine */)
            ]), factory.createIfStatement(factory.createLogicalAnd(factory.createTypeCheck(factory.createIdentifier("define"), "function"), factory.createPropertyAccessExpression(factory.createIdentifier("define"), "amd")), factory.createBlock([
                factory.createExpressionStatement(factory.createCallExpression(factory.createIdentifier("define"), 
                /*typeArguments*/ undefined, __spreadArray(__spreadArray([], (moduleName ? [moduleName] : []), true), [
                    factory.createArrayLiteralExpression(__spreadArray(__spreadArray([
                        factory.createStringLiteral("require"),
                        factory.createStringLiteral("exports")
                    ], aliasedModuleNames, true), unaliasedModuleNames, true)),
                    factory.createIdentifier("factory")
                ], false)))
            ])))
        ], 
        /*multiLine*/ true), 
        /*location*/ undefined));
        // Create an updated SourceFile:
        //
        //  (function (factory) {
        //      if (typeof module === "object" && typeof module.exports === "object") {
        //          var v = factory(require, exports);
        //          if (v !== undefined) module.exports = v;
        //      }
        //      else if (typeof define === 'function' && define.amd) {
        //          define(["require", "exports"], factory);
        //      }
        //  })(function ...)
        var updated = factory.updateSourceFile(node, (0, ts_1.setTextRange)(factory.createNodeArray([
            factory.createExpressionStatement(factory.createCallExpression(umdHeader, 
            /*typeArguments*/ undefined, [
                // Add the module body function argument:
                //
                //     function (require, exports) ...
                factory.createFunctionExpression(
                /*modifiers*/ undefined, 
                /*asteriskToken*/ undefined, 
                /*name*/ undefined, 
                /*typeParameters*/ undefined, __spreadArray([
                    factory.createParameterDeclaration(/*modifiers*/ undefined, /*dotDotDotToken*/ undefined, "require"),
                    factory.createParameterDeclaration(/*modifiers*/ undefined, /*dotDotDotToken*/ undefined, "exports")
                ], importAliasNames, true), 
                /*type*/ undefined, transformAsynchronousModuleBody(node))
            ]))
        ]), 
        /*location*/ node.statements));
        (0, ts_1.addEmitHelpers)(updated, context.readEmitHelpers());
        return updated;
    }
    /**
     * Collect the additional asynchronous dependencies for the module.
     *
     * @param node The source file.
     * @param includeNonAmdDependencies A value indicating whether to include non-AMD dependencies.
     */
    function collectAsynchronousDependencies(node, includeNonAmdDependencies) {
        // names of modules with corresponding parameter in the factory function
        var aliasedModuleNames = [];
        // names of modules with no corresponding parameters in factory function
        var unaliasedModuleNames = [];
        // names of the parameters in the factory function; these
        // parameters need to match the indexes of the corresponding
        // module names in aliasedModuleNames.
        var importAliasNames = [];
        // Fill in amd-dependency tags
        for (var _i = 0, _a = node.amdDependencies; _i < _a.length; _i++) {
            var amdDependency = _a[_i];
            if (amdDependency.name) {
                aliasedModuleNames.push(factory.createStringLiteral(amdDependency.path));
                importAliasNames.push(factory.createParameterDeclaration(/*modifiers*/ undefined, /*dotDotDotToken*/ undefined, amdDependency.name));
            }
            else {
                unaliasedModuleNames.push(factory.createStringLiteral(amdDependency.path));
            }
        }
        for (var _b = 0, _c = currentModuleInfo.externalImports; _b < _c.length; _b++) {
            var importNode = _c[_b];
            // Find the name of the external module
            var externalModuleName = (0, ts_1.getExternalModuleNameLiteral)(factory, importNode, currentSourceFile, host, resolver, compilerOptions);
            // Find the name of the module alias, if there is one
            var importAliasName = (0, ts_1.getLocalNameForExternalImport)(factory, importNode, currentSourceFile);
            // It is possible that externalModuleName is undefined if it is not string literal.
            // This can happen in the invalid import syntax.
            // E.g : "import * from alias from 'someLib';"
            if (externalModuleName) {
                if (includeNonAmdDependencies && importAliasName) {
                    // Set emitFlags on the name of the classDeclaration
                    // This is so that when printer will not substitute the identifier
                    (0, ts_1.setEmitFlags)(importAliasName, 8 /* EmitFlags.NoSubstitution */);
                    aliasedModuleNames.push(externalModuleName);
                    importAliasNames.push(factory.createParameterDeclaration(/*modifiers*/ undefined, /*dotDotDotToken*/ undefined, importAliasName));
                }
                else {
                    unaliasedModuleNames.push(externalModuleName);
                }
            }
        }
        return { aliasedModuleNames: aliasedModuleNames, unaliasedModuleNames: unaliasedModuleNames, importAliasNames: importAliasNames };
    }
    function getAMDImportExpressionForImport(node) {
        if ((0, ts_1.isImportEqualsDeclaration)(node) || (0, ts_1.isExportDeclaration)(node) || !(0, ts_1.getExternalModuleNameLiteral)(factory, node, currentSourceFile, host, resolver, compilerOptions)) {
            return undefined;
        }
        var name = (0, ts_1.getLocalNameForExternalImport)(factory, node, currentSourceFile); // TODO: GH#18217
        var expr = getHelperExpressionForImport(node, name);
        if (expr === name) {
            return undefined;
        }
        return factory.createExpressionStatement(factory.createAssignment(name, expr));
    }
    /**
     * Transforms a SourceFile into an AMD or UMD module body.
     *
     * @param node The SourceFile node.
     */
    function transformAsynchronousModuleBody(node) {
        startLexicalEnvironment();
        var statements = [];
        var statementOffset = factory.copyPrologue(node.statements, statements, /*ensureUseStrict*/ !compilerOptions.noImplicitUseStrict, topLevelVisitor);
        if (shouldEmitUnderscoreUnderscoreESModule()) {
            (0, ts_1.append)(statements, createUnderscoreUnderscoreESModule());
        }
        if ((0, ts_1.length)(currentModuleInfo.exportedNames)) {
            (0, ts_1.append)(statements, factory.createExpressionStatement((0, ts_1.reduceLeft)(currentModuleInfo.exportedNames, function (prev, nextId) { return factory.createAssignment(factory.createPropertyAccessExpression(factory.createIdentifier("exports"), factory.createIdentifier((0, ts_1.idText)(nextId))), prev); }, factory.createVoidZero())));
        }
        // Visit each statement of the module body.
        (0, ts_1.append)(statements, (0, ts_1.visitNode)(currentModuleInfo.externalHelpersImportDeclaration, topLevelVisitor, ts_1.isStatement));
        if (moduleKind === ts_1.ModuleKind.AMD) {
            (0, ts_1.addRange)(statements, (0, ts_1.mapDefined)(currentModuleInfo.externalImports, getAMDImportExpressionForImport));
        }
        (0, ts_1.addRange)(statements, (0, ts_1.visitNodes)(node.statements, topLevelVisitor, ts_1.isStatement, statementOffset));
        // Append the 'export =' statement if provided.
        addExportEqualsIfNeeded(statements, /*emitAsReturn*/ true);
        // End the lexical environment for the module body
        // and merge any new lexical declarations.
        (0, ts_1.insertStatementsAfterStandardPrologue)(statements, endLexicalEnvironment());
        var body = factory.createBlock(statements, /*multiLine*/ true);
        if (needUMDDynamicImportHelper) {
            (0, ts_1.addEmitHelper)(body, dynamicImportUMDHelper);
        }
        return body;
    }
    /**
     * Adds the down-level representation of `export=` to the statement list if one exists
     * in the source file.
     *
     * @param statements The Statement list to modify.
     * @param emitAsReturn A value indicating whether to emit the `export=` statement as a
     * return statement.
     */
    function addExportEqualsIfNeeded(statements, emitAsReturn) {
        if (currentModuleInfo.exportEquals) {
            var expressionResult = (0, ts_1.visitNode)(currentModuleInfo.exportEquals.expression, visitor, ts_1.isExpression);
            if (expressionResult) {
                if (emitAsReturn) {
                    var statement = factory.createReturnStatement(expressionResult);
                    (0, ts_1.setTextRange)(statement, currentModuleInfo.exportEquals);
                    (0, ts_1.setEmitFlags)(statement, 768 /* EmitFlags.NoTokenSourceMaps */ | 3072 /* EmitFlags.NoComments */);
                    statements.push(statement);
                }
                else {
                    var statement = factory.createExpressionStatement(factory.createAssignment(factory.createPropertyAccessExpression(factory.createIdentifier("module"), "exports"), expressionResult));
                    (0, ts_1.setTextRange)(statement, currentModuleInfo.exportEquals);
                    (0, ts_1.setEmitFlags)(statement, 3072 /* EmitFlags.NoComments */);
                    statements.push(statement);
                }
            }
        }
    }
    //
    // Top-Level Source Element Visitors
    //
    /**
     * Visits a node at the top level of the source file.
     *
     * @param node The node to visit.
     */
    function topLevelVisitor(node) {
        switch (node.kind) {
            case 271 /* SyntaxKind.ImportDeclaration */:
                return visitImportDeclaration(node);
            case 270 /* SyntaxKind.ImportEqualsDeclaration */:
                return visitImportEqualsDeclaration(node);
            case 277 /* SyntaxKind.ExportDeclaration */:
                return visitExportDeclaration(node);
            case 276 /* SyntaxKind.ExportAssignment */:
                return visitExportAssignment(node);
            case 261 /* SyntaxKind.FunctionDeclaration */:
                return visitFunctionDeclaration(node);
            case 262 /* SyntaxKind.ClassDeclaration */:
                return visitClassDeclaration(node);
            default:
                return topLevelNestedVisitor(node);
        }
    }
    /**
     * Visit nested elements at the top-level of a module.
     *
     * @param node The node to visit.
     */
    function topLevelNestedVisitor(node) {
        switch (node.kind) {
            case 242 /* SyntaxKind.VariableStatement */:
                return visitVariableStatement(node);
            case 261 /* SyntaxKind.FunctionDeclaration */:
                return visitFunctionDeclaration(node);
            case 262 /* SyntaxKind.ClassDeclaration */:
                return visitClassDeclaration(node);
            case 247 /* SyntaxKind.ForStatement */:
                return visitForStatement(node, /*isTopLevel*/ true);
            case 248 /* SyntaxKind.ForInStatement */:
                return visitForInStatement(node);
            case 249 /* SyntaxKind.ForOfStatement */:
                return visitForOfStatement(node);
            case 245 /* SyntaxKind.DoStatement */:
                return visitDoStatement(node);
            case 246 /* SyntaxKind.WhileStatement */:
                return visitWhileStatement(node);
            case 255 /* SyntaxKind.LabeledStatement */:
                return visitLabeledStatement(node);
            case 253 /* SyntaxKind.WithStatement */:
                return visitWithStatement(node);
            case 244 /* SyntaxKind.IfStatement */:
                return visitIfStatement(node);
            case 254 /* SyntaxKind.SwitchStatement */:
                return visitSwitchStatement(node);
            case 268 /* SyntaxKind.CaseBlock */:
                return visitCaseBlock(node);
            case 295 /* SyntaxKind.CaseClause */:
                return visitCaseClause(node);
            case 296 /* SyntaxKind.DefaultClause */:
                return visitDefaultClause(node);
            case 257 /* SyntaxKind.TryStatement */:
                return visitTryStatement(node);
            case 298 /* SyntaxKind.CatchClause */:
                return visitCatchClause(node);
            case 240 /* SyntaxKind.Block */:
                return visitBlock(node);
            default:
                return visitor(node);
        }
    }
    function visitorWorker(node, valueIsDiscarded) {
        // This visitor does not need to descend into the tree if there is no dynamic import, destructuring assignment, or update expression
        // as export/import statements are only transformed at the top level of a file.
        if (!(node.transformFlags & (8388608 /* TransformFlags.ContainsDynamicImport */ | 4096 /* TransformFlags.ContainsDestructuringAssignment */ | 268435456 /* TransformFlags.ContainsUpdateExpressionForIdentifier */))) {
            return node;
        }
        switch (node.kind) {
            case 247 /* SyntaxKind.ForStatement */:
                return visitForStatement(node, /*isTopLevel*/ false);
            case 243 /* SyntaxKind.ExpressionStatement */:
                return visitExpressionStatement(node);
            case 216 /* SyntaxKind.ParenthesizedExpression */:
                return visitParenthesizedExpression(node, valueIsDiscarded);
            case 359 /* SyntaxKind.PartiallyEmittedExpression */:
                return visitPartiallyEmittedExpression(node, valueIsDiscarded);
            case 212 /* SyntaxKind.CallExpression */:
                if ((0, ts_1.isImportCall)(node) && currentSourceFile.impliedNodeFormat === undefined) {
                    return visitImportCallExpression(node);
                }
                break;
            case 225 /* SyntaxKind.BinaryExpression */:
                if ((0, ts_1.isDestructuringAssignment)(node)) {
                    return visitDestructuringAssignment(node, valueIsDiscarded);
                }
                break;
            case 223 /* SyntaxKind.PrefixUnaryExpression */:
            case 224 /* SyntaxKind.PostfixUnaryExpression */:
                return visitPreOrPostfixUnaryExpression(node, valueIsDiscarded);
        }
        return (0, ts_1.visitEachChild)(node, visitor, context);
    }
    function visitor(node) {
        return visitorWorker(node, /*valueIsDiscarded*/ false);
    }
    function discardedValueVisitor(node) {
        return visitorWorker(node, /*valueIsDiscarded*/ true);
    }
    function destructuringNeedsFlattening(node) {
        if ((0, ts_1.isObjectLiteralExpression)(node)) {
            for (var _i = 0, _a = node.properties; _i < _a.length; _i++) {
                var elem = _a[_i];
                switch (elem.kind) {
                    case 302 /* SyntaxKind.PropertyAssignment */:
                        if (destructuringNeedsFlattening(elem.initializer)) {
                            return true;
                        }
                        break;
                    case 303 /* SyntaxKind.ShorthandPropertyAssignment */:
                        if (destructuringNeedsFlattening(elem.name)) {
                            return true;
                        }
                        break;
                    case 304 /* SyntaxKind.SpreadAssignment */:
                        if (destructuringNeedsFlattening(elem.expression)) {
                            return true;
                        }
                        break;
                    case 173 /* SyntaxKind.MethodDeclaration */:
                    case 176 /* SyntaxKind.GetAccessor */:
                    case 177 /* SyntaxKind.SetAccessor */:
                        return false;
                    default: ts_1.Debug.assertNever(elem, "Unhandled object member kind");
                }
            }
        }
        else if ((0, ts_1.isArrayLiteralExpression)(node)) {
            for (var _b = 0, _c = node.elements; _b < _c.length; _b++) {
                var elem = _c[_b];
                if ((0, ts_1.isSpreadElement)(elem)) {
                    if (destructuringNeedsFlattening(elem.expression)) {
                        return true;
                    }
                }
                else if (destructuringNeedsFlattening(elem)) {
                    return true;
                }
            }
        }
        else if ((0, ts_1.isIdentifier)(node)) {
            return (0, ts_1.length)(getExports(node)) > ((0, ts_1.isExportName)(node) ? 1 : 0);
        }
        return false;
    }
    function visitDestructuringAssignment(node, valueIsDiscarded) {
        if (destructuringNeedsFlattening(node.left)) {
            return (0, ts_1.flattenDestructuringAssignment)(node, visitor, context, 0 /* FlattenLevel.All */, !valueIsDiscarded, createAllExportExpressions);
        }
        return (0, ts_1.visitEachChild)(node, visitor, context);
    }
    function visitForStatement(node, isTopLevel) {
        if (isTopLevel && node.initializer &&
            (0, ts_1.isVariableDeclarationList)(node.initializer) &&
            !(node.initializer.flags & 3 /* NodeFlags.BlockScoped */)) {
            var exportStatements = appendExportsOfVariableDeclarationList(/*statements*/ undefined, node.initializer, /*isForInOrOfInitializer*/ false);
            if (exportStatements) {
                var statements = [];
                var varDeclList = (0, ts_1.visitNode)(node.initializer, discardedValueVisitor, ts_1.isVariableDeclarationList);
                var varStatement = factory.createVariableStatement(/*modifiers*/ undefined, varDeclList);
                statements.push(varStatement);
                (0, ts_1.addRange)(statements, exportStatements);
                var condition = (0, ts_1.visitNode)(node.condition, visitor, ts_1.isExpression);
                var incrementor = (0, ts_1.visitNode)(node.incrementor, discardedValueVisitor, ts_1.isExpression);
                var body = (0, ts_1.visitIterationBody)(node.statement, isTopLevel ? topLevelNestedVisitor : visitor, context);
                statements.push(factory.updateForStatement(node, /*initializer*/ undefined, condition, incrementor, body));
                return statements;
            }
        }
        return factory.updateForStatement(node, (0, ts_1.visitNode)(node.initializer, discardedValueVisitor, ts_1.isForInitializer), (0, ts_1.visitNode)(node.condition, visitor, ts_1.isExpression), (0, ts_1.visitNode)(node.incrementor, discardedValueVisitor, ts_1.isExpression), (0, ts_1.visitIterationBody)(node.statement, isTopLevel ? topLevelNestedVisitor : visitor, context));
    }
    /**
     * Visits the body of a ForInStatement to hoist declarations.
     *
     * @param node The node to visit.
     */
    function visitForInStatement(node) {
        if ((0, ts_1.isVariableDeclarationList)(node.initializer) && !(node.initializer.flags & 3 /* NodeFlags.BlockScoped */)) {
            var exportStatements = appendExportsOfVariableDeclarationList(/*statements*/ undefined, node.initializer, /*isForInOrOfInitializer*/ true);
            if ((0, ts_1.some)(exportStatements)) {
                var initializer = (0, ts_1.visitNode)(node.initializer, discardedValueVisitor, ts_1.isForInitializer);
                var expression = (0, ts_1.visitNode)(node.expression, visitor, ts_1.isExpression);
                var body = (0, ts_1.visitIterationBody)(node.statement, topLevelNestedVisitor, context);
                var mergedBody = (0, ts_1.isBlock)(body) ?
                    factory.updateBlock(body, __spreadArray(__spreadArray([], exportStatements, true), body.statements, true)) :
                    factory.createBlock(__spreadArray(__spreadArray([], exportStatements, true), [body], false), /*multiLine*/ true);
                return factory.updateForInStatement(node, initializer, expression, mergedBody);
            }
        }
        return factory.updateForInStatement(node, (0, ts_1.visitNode)(node.initializer, discardedValueVisitor, ts_1.isForInitializer), (0, ts_1.visitNode)(node.expression, visitor, ts_1.isExpression), (0, ts_1.visitIterationBody)(node.statement, topLevelNestedVisitor, context));
    }
    /**
     * Visits the body of a ForOfStatement to hoist declarations.
     *
     * @param node The node to visit.
     */
    function visitForOfStatement(node) {
        if ((0, ts_1.isVariableDeclarationList)(node.initializer) && !(node.initializer.flags & 3 /* NodeFlags.BlockScoped */)) {
            var exportStatements = appendExportsOfVariableDeclarationList(/*statements*/ undefined, node.initializer, /*isForInOrOfInitializer*/ true);
            var initializer = (0, ts_1.visitNode)(node.initializer, discardedValueVisitor, ts_1.isForInitializer);
            var expression = (0, ts_1.visitNode)(node.expression, visitor, ts_1.isExpression);
            var body = (0, ts_1.visitIterationBody)(node.statement, topLevelNestedVisitor, context);
            if ((0, ts_1.some)(exportStatements)) {
                body = (0, ts_1.isBlock)(body) ?
                    factory.updateBlock(body, __spreadArray(__spreadArray([], exportStatements, true), body.statements, true)) :
                    factory.createBlock(__spreadArray(__spreadArray([], exportStatements, true), [body], false), /*multiLine*/ true);
            }
            return factory.updateForOfStatement(node, node.awaitModifier, initializer, expression, body);
        }
        return factory.updateForOfStatement(node, node.awaitModifier, (0, ts_1.visitNode)(node.initializer, discardedValueVisitor, ts_1.isForInitializer), (0, ts_1.visitNode)(node.expression, visitor, ts_1.isExpression), (0, ts_1.visitIterationBody)(node.statement, topLevelNestedVisitor, context));
    }
    /**
     * Visits the body of a DoStatement to hoist declarations.
     *
     * @param node The node to visit.
     */
    function visitDoStatement(node) {
        return factory.updateDoStatement(node, (0, ts_1.visitIterationBody)(node.statement, topLevelNestedVisitor, context), (0, ts_1.visitNode)(node.expression, visitor, ts_1.isExpression));
    }
    /**
     * Visits the body of a WhileStatement to hoist declarations.
     *
     * @param node The node to visit.
     */
    function visitWhileStatement(node) {
        return factory.updateWhileStatement(node, (0, ts_1.visitNode)(node.expression, visitor, ts_1.isExpression), (0, ts_1.visitIterationBody)(node.statement, topLevelNestedVisitor, context));
    }
    /**
     * Visits the body of a LabeledStatement to hoist declarations.
     *
     * @param node The node to visit.
     */
    function visitLabeledStatement(node) {
        return factory.updateLabeledStatement(node, node.label, ts_1.Debug.checkDefined((0, ts_1.visitNode)(node.statement, topLevelNestedVisitor, ts_1.isStatement, factory.liftToBlock)));
    }
    /**
     * Visits the body of a WithStatement to hoist declarations.
     *
     * @param node The node to visit.
     */
    function visitWithStatement(node) {
        return factory.updateWithStatement(node, (0, ts_1.visitNode)(node.expression, visitor, ts_1.isExpression), ts_1.Debug.checkDefined((0, ts_1.visitNode)(node.statement, topLevelNestedVisitor, ts_1.isStatement, factory.liftToBlock)));
    }
    /**
     * Visits the body of a IfStatement to hoist declarations.
     *
     * @param node The node to visit.
     */
    function visitIfStatement(node) {
        return factory.updateIfStatement(node, (0, ts_1.visitNode)(node.expression, visitor, ts_1.isExpression), ts_1.Debug.checkDefined((0, ts_1.visitNode)(node.thenStatement, topLevelNestedVisitor, ts_1.isStatement, factory.liftToBlock)), (0, ts_1.visitNode)(node.elseStatement, topLevelNestedVisitor, ts_1.isStatement, factory.liftToBlock));
    }
    /**
     * Visits the body of a SwitchStatement to hoist declarations.
     *
     * @param node The node to visit.
     */
    function visitSwitchStatement(node) {
        return factory.updateSwitchStatement(node, (0, ts_1.visitNode)(node.expression, visitor, ts_1.isExpression), ts_1.Debug.checkDefined((0, ts_1.visitNode)(node.caseBlock, topLevelNestedVisitor, ts_1.isCaseBlock)));
    }
    /**
     * Visits the body of a CaseBlock to hoist declarations.
     *
     * @param node The node to visit.
     */
    function visitCaseBlock(node) {
        return factory.updateCaseBlock(node, (0, ts_1.visitNodes)(node.clauses, topLevelNestedVisitor, ts_1.isCaseOrDefaultClause));
    }
    /**
     * Visits the body of a CaseClause to hoist declarations.
     *
     * @param node The node to visit.
     */
    function visitCaseClause(node) {
        return factory.updateCaseClause(node, (0, ts_1.visitNode)(node.expression, visitor, ts_1.isExpression), (0, ts_1.visitNodes)(node.statements, topLevelNestedVisitor, ts_1.isStatement));
    }
    /**
     * Visits the body of a DefaultClause to hoist declarations.
     *
     * @param node The node to visit.
     */
    function visitDefaultClause(node) {
        return (0, ts_1.visitEachChild)(node, topLevelNestedVisitor, context);
    }
    /**
     * Visits the body of a TryStatement to hoist declarations.
     *
     * @param node The node to visit.
     */
    function visitTryStatement(node) {
        return (0, ts_1.visitEachChild)(node, topLevelNestedVisitor, context);
    }
    /**
     * Visits the body of a CatchClause to hoist declarations.
     *
     * @param node The node to visit.
     */
    function visitCatchClause(node) {
        return factory.updateCatchClause(node, node.variableDeclaration, ts_1.Debug.checkDefined((0, ts_1.visitNode)(node.block, topLevelNestedVisitor, ts_1.isBlock)));
    }
    /**
     * Visits the body of a Block to hoist declarations.
     *
     * @param node The node to visit.
     */
    function visitBlock(node) {
        node = (0, ts_1.visitEachChild)(node, topLevelNestedVisitor, context);
        return node;
    }
    function visitExpressionStatement(node) {
        return factory.updateExpressionStatement(node, (0, ts_1.visitNode)(node.expression, discardedValueVisitor, ts_1.isExpression));
    }
    function visitParenthesizedExpression(node, valueIsDiscarded) {
        return factory.updateParenthesizedExpression(node, (0, ts_1.visitNode)(node.expression, valueIsDiscarded ? discardedValueVisitor : visitor, ts_1.isExpression));
    }
    function visitPartiallyEmittedExpression(node, valueIsDiscarded) {
        return factory.updatePartiallyEmittedExpression(node, (0, ts_1.visitNode)(node.expression, valueIsDiscarded ? discardedValueVisitor : visitor, ts_1.isExpression));
    }
    function visitPreOrPostfixUnaryExpression(node, valueIsDiscarded) {
        // When we see a prefix or postfix increment expression whose operand is an exported
        // symbol, we should ensure all exports of that symbol are updated with the correct
        // value.
        //
        // - We do not transform generated identifiers for any reason.
        // - We do not transform identifiers tagged with the LocalName flag.
        // - We do not transform identifiers that were originally the name of an enum or
        //   namespace due to how they are transformed in TypeScript.
        // - We only transform identifiers that are exported at the top level.
        if ((node.operator === 46 /* SyntaxKind.PlusPlusToken */ || node.operator === 47 /* SyntaxKind.MinusMinusToken */)
            && (0, ts_1.isIdentifier)(node.operand)
            && !(0, ts_1.isGeneratedIdentifier)(node.operand)
            && !(0, ts_1.isLocalName)(node.operand)
            && !(0, ts_1.isDeclarationNameOfEnumOrNamespace)(node.operand)) {
            var exportedNames = getExports(node.operand);
            if (exportedNames) {
                var temp = void 0;
                var expression = (0, ts_1.visitNode)(node.operand, visitor, ts_1.isExpression);
                if ((0, ts_1.isPrefixUnaryExpression)(node)) {
                    expression = factory.updatePrefixUnaryExpression(node, expression);
                }
                else {
                    expression = factory.updatePostfixUnaryExpression(node, expression);
                    if (!valueIsDiscarded) {
                        temp = factory.createTempVariable(hoistVariableDeclaration);
                        expression = factory.createAssignment(temp, expression);
                        (0, ts_1.setTextRange)(expression, node);
                    }
                    expression = factory.createComma(expression, factory.cloneNode(node.operand));
                    (0, ts_1.setTextRange)(expression, node);
                }
                for (var _i = 0, exportedNames_1 = exportedNames; _i < exportedNames_1.length; _i++) {
                    var exportName = exportedNames_1[_i];
                    noSubstitution[(0, ts_1.getNodeId)(expression)] = true;
                    expression = createExportExpression(exportName, expression);
                    (0, ts_1.setTextRange)(expression, node);
                }
                if (temp) {
                    noSubstitution[(0, ts_1.getNodeId)(expression)] = true;
                    expression = factory.createComma(expression, temp);
                    (0, ts_1.setTextRange)(expression, node);
                }
                return expression;
            }
        }
        return (0, ts_1.visitEachChild)(node, visitor, context);
    }
    function visitImportCallExpression(node) {
        if (moduleKind === ts_1.ModuleKind.None && languageVersion >= 7 /* ScriptTarget.ES2020 */) {
            return (0, ts_1.visitEachChild)(node, visitor, context);
        }
        var externalModuleName = (0, ts_1.getExternalModuleNameLiteral)(factory, node, currentSourceFile, host, resolver, compilerOptions);
        var firstArgument = (0, ts_1.visitNode)((0, ts_1.firstOrUndefined)(node.arguments), visitor, ts_1.isExpression);
        // Only use the external module name if it differs from the first argument. This allows us to preserve the quote style of the argument on output.
        var argument = externalModuleName && (!firstArgument || !(0, ts_1.isStringLiteral)(firstArgument) || firstArgument.text !== externalModuleName.text) ? externalModuleName : firstArgument;
        var containsLexicalThis = !!(node.transformFlags & 16384 /* TransformFlags.ContainsLexicalThis */);
        switch (compilerOptions.module) {
            case ts_1.ModuleKind.AMD:
                return createImportCallExpressionAMD(argument, containsLexicalThis);
            case ts_1.ModuleKind.UMD:
                return createImportCallExpressionUMD(argument !== null && argument !== void 0 ? argument : factory.createVoidZero(), containsLexicalThis);
            case ts_1.ModuleKind.CommonJS:
            default:
                return createImportCallExpressionCommonJS(argument);
        }
    }
    function createImportCallExpressionUMD(arg, containsLexicalThis) {
        // (function (factory) {
        //      ... (regular UMD)
        // }
        // })(function (require, exports, useSyncRequire) {
        //      "use strict";
        //      Object.defineProperty(exports, "__esModule", { value: true });
        //      var __syncRequire = typeof module === "object" && typeof module.exports === "object";
        //      var __resolved = new Promise(function (resolve) { resolve(); });
        //      .....
        //      __syncRequire
        //          ? __resolved.then(function () { return require(x); }) /*CommonJs Require*/
        //          : new Promise(function (_a, _b) { require([x], _a, _b); }); /*Amd Require*/
        // });
        needUMDDynamicImportHelper = true;
        if ((0, ts_1.isSimpleCopiableExpression)(arg)) {
            var argClone = (0, ts_1.isGeneratedIdentifier)(arg) ? arg : (0, ts_1.isStringLiteral)(arg) ? factory.createStringLiteralFromNode(arg) : (0, ts_1.setEmitFlags)((0, ts_1.setTextRange)(factory.cloneNode(arg), arg), 3072 /* EmitFlags.NoComments */);
            return factory.createConditionalExpression(
            /*condition*/ factory.createIdentifier("__syncRequire"), 
            /*questionToken*/ undefined, 
            /*whenTrue*/ createImportCallExpressionCommonJS(arg), 
            /*colonToken*/ undefined, 
            /*whenFalse*/ createImportCallExpressionAMD(argClone, containsLexicalThis));
        }
        else {
            var temp = factory.createTempVariable(hoistVariableDeclaration);
            return factory.createComma(factory.createAssignment(temp, arg), factory.createConditionalExpression(
            /*condition*/ factory.createIdentifier("__syncRequire"), 
            /*questionToken*/ undefined, 
            /*whenTrue*/ createImportCallExpressionCommonJS(temp, /*isInlineable*/ true), 
            /*colonToken*/ undefined, 
            /*whenFalse*/ createImportCallExpressionAMD(temp, containsLexicalThis)));
        }
    }
    function createImportCallExpressionAMD(arg, containsLexicalThis) {
        // improt("./blah")
        // emit as
        // define(["require", "exports", "blah"], function (require, exports) {
        //     ...
        //     new Promise(function (_a, _b) { require([x], _a, _b); }); /*Amd Require*/
        // });
        var resolve = factory.createUniqueName("resolve");
        var reject = factory.createUniqueName("reject");
        var parameters = [
            factory.createParameterDeclaration(/*modifiers*/ undefined, /*dotDotDotToken*/ undefined, /*name*/ resolve),
            factory.createParameterDeclaration(/*modifiers*/ undefined, /*dotDotDotToken*/ undefined, /*name*/ reject)
        ];
        var body = factory.createBlock([
            factory.createExpressionStatement(factory.createCallExpression(factory.createIdentifier("require"), 
            /*typeArguments*/ undefined, [factory.createArrayLiteralExpression([arg || factory.createOmittedExpression()]), resolve, reject]))
        ]);
        var func;
        if (languageVersion >= 2 /* ScriptTarget.ES2015 */) {
            func = factory.createArrowFunction(
            /*modifiers*/ undefined, 
            /*typeParameters*/ undefined, parameters, 
            /*type*/ undefined, 
            /*equalsGreaterThanToken*/ undefined, body);
        }
        else {
            func = factory.createFunctionExpression(
            /*modifiers*/ undefined, 
            /*asteriskToken*/ undefined, 
            /*name*/ undefined, 
            /*typeParameters*/ undefined, parameters, 
            /*type*/ undefined, body);
            // if there is a lexical 'this' in the import call arguments, ensure we indicate
            // that this new function expression indicates it captures 'this' so that the
            // es2015 transformer will properly substitute 'this' with '_this'.
            if (containsLexicalThis) {
                (0, ts_1.setEmitFlags)(func, 16 /* EmitFlags.CapturesThis */);
            }
        }
        var promise = factory.createNewExpression(factory.createIdentifier("Promise"), /*typeArguments*/ undefined, [func]);
        if ((0, ts_1.getESModuleInterop)(compilerOptions)) {
            return factory.createCallExpression(factory.createPropertyAccessExpression(promise, factory.createIdentifier("then")), /*typeArguments*/ undefined, [emitHelpers().createImportStarCallbackHelper()]);
        }
        return promise;
    }
    function createImportCallExpressionCommonJS(arg, isInlineable) {
        // import(x)
        // emit as
        // Promise.resolve(`${x}`).then((s) => require(s)) /*CommonJs Require*/
        // We have to wrap require in then callback so that require is done in asynchronously
        // if we simply do require in resolve callback in Promise constructor. We will execute the loading immediately
        // If the arg is not inlineable, we have to evaluate and ToString() it in the current scope
        // Otherwise, we inline it in require() so that it's statically analyzable
        var needSyncEval = arg && !(0, ts_1.isSimpleInlineableExpression)(arg) && !isInlineable;
        var promiseResolveCall = factory.createCallExpression(factory.createPropertyAccessExpression(factory.createIdentifier("Promise"), "resolve"), 
        /*typeArguments*/ undefined, 
        /*argumentsArray*/ needSyncEval
            ? languageVersion >= 2 /* ScriptTarget.ES2015 */
                ? [
                    factory.createTemplateExpression(factory.createTemplateHead(""), [
                        factory.createTemplateSpan(arg, factory.createTemplateTail("")),
                    ]),
                ]
                : [
                    factory.createCallExpression(factory.createPropertyAccessExpression(factory.createStringLiteral(""), "concat"), 
                    /*typeArguments*/ undefined, [arg]),
                ]
            : []);
        var requireCall = factory.createCallExpression(factory.createIdentifier("require"), 
        /*typeArguments*/ undefined, needSyncEval ? [factory.createIdentifier("s")] : arg ? [arg] : []);
        if ((0, ts_1.getESModuleInterop)(compilerOptions)) {
            requireCall = emitHelpers().createImportStarHelper(requireCall);
        }
        var parameters = needSyncEval
            ? [
                factory.createParameterDeclaration(
                /*modifiers*/ undefined, 
                /*dotDotDotToken*/ undefined, 
                /*name*/ "s"),
            ]
            : [];
        var func;
        if (languageVersion >= 2 /* ScriptTarget.ES2015 */) {
            func = factory.createArrowFunction(
            /*modifiers*/ undefined, 
            /*typeParameters*/ undefined, 
            /*parameters*/ parameters, 
            /*type*/ undefined, 
            /*equalsGreaterThanToken*/ undefined, requireCall);
        }
        else {
            func = factory.createFunctionExpression(
            /*modifiers*/ undefined, 
            /*asteriskToken*/ undefined, 
            /*name*/ undefined, 
            /*typeParameters*/ undefined, 
            /*parameters*/ parameters, 
            /*type*/ undefined, factory.createBlock([factory.createReturnStatement(requireCall)]));
        }
        var downleveledImport = factory.createCallExpression(factory.createPropertyAccessExpression(promiseResolveCall, "then"), /*typeArguments*/ undefined, [func]);
        return downleveledImport;
    }
    function getHelperExpressionForExport(node, innerExpr) {
        if (!(0, ts_1.getESModuleInterop)(compilerOptions) || (0, ts_1.getInternalEmitFlags)(node) & 2 /* InternalEmitFlags.NeverApplyImportHelper */) {
            return innerExpr;
        }
        if ((0, ts_1.getExportNeedsImportStarHelper)(node)) {
            return emitHelpers().createImportStarHelper(innerExpr);
        }
        return innerExpr;
    }
    function getHelperExpressionForImport(node, innerExpr) {
        if (!(0, ts_1.getESModuleInterop)(compilerOptions) || (0, ts_1.getInternalEmitFlags)(node) & 2 /* InternalEmitFlags.NeverApplyImportHelper */) {
            return innerExpr;
        }
        if ((0, ts_1.getImportNeedsImportStarHelper)(node)) {
            return emitHelpers().createImportStarHelper(innerExpr);
        }
        if ((0, ts_1.getImportNeedsImportDefaultHelper)(node)) {
            return emitHelpers().createImportDefaultHelper(innerExpr);
        }
        return innerExpr;
    }
    /**
     * Visits an ImportDeclaration node.
     *
     * @param node The node to visit.
     */
    function visitImportDeclaration(node) {
        var statements;
        var namespaceDeclaration = (0, ts_1.getNamespaceDeclarationNode)(node);
        if (moduleKind !== ts_1.ModuleKind.AMD) {
            if (!node.importClause) {
                // import "mod";
                return (0, ts_1.setOriginalNode)((0, ts_1.setTextRange)(factory.createExpressionStatement(createRequireCall(node)), node), node);
            }
            else {
                var variables = [];
                if (namespaceDeclaration && !(0, ts_1.isDefaultImport)(node)) {
                    // import * as n from "mod";
                    variables.push(factory.createVariableDeclaration(factory.cloneNode(namespaceDeclaration.name), 
                    /*exclamationToken*/ undefined, 
                    /*type*/ undefined, getHelperExpressionForImport(node, createRequireCall(node))));
                }
                else {
                    // import d from "mod";
                    // import { x, y } from "mod";
                    // import d, { x, y } from "mod";
                    // import d, * as n from "mod";
                    variables.push(factory.createVariableDeclaration(factory.getGeneratedNameForNode(node), 
                    /*exclamationToken*/ undefined, 
                    /*type*/ undefined, getHelperExpressionForImport(node, createRequireCall(node))));
                    if (namespaceDeclaration && (0, ts_1.isDefaultImport)(node)) {
                        variables.push(factory.createVariableDeclaration(factory.cloneNode(namespaceDeclaration.name), 
                        /*exclamationToken*/ undefined, 
                        /*type*/ undefined, factory.getGeneratedNameForNode(node)));
                    }
                }
                statements = (0, ts_1.append)(statements, (0, ts_1.setOriginalNode)((0, ts_1.setTextRange)(factory.createVariableStatement(
                /*modifiers*/ undefined, factory.createVariableDeclarationList(variables, languageVersion >= 2 /* ScriptTarget.ES2015 */ ? 2 /* NodeFlags.Const */ : 0 /* NodeFlags.None */)), 
                /*location*/ node), 
                /*original*/ node));
            }
        }
        else if (namespaceDeclaration && (0, ts_1.isDefaultImport)(node)) {
            // import d, * as n from "mod";
            statements = (0, ts_1.append)(statements, factory.createVariableStatement(
            /*modifiers*/ undefined, factory.createVariableDeclarationList([
                (0, ts_1.setOriginalNode)((0, ts_1.setTextRange)(factory.createVariableDeclaration(factory.cloneNode(namespaceDeclaration.name), 
                /*exclamationToken*/ undefined, 
                /*type*/ undefined, factory.getGeneratedNameForNode(node)), 
                /*location*/ node), 
                /*original*/ node)
            ], languageVersion >= 2 /* ScriptTarget.ES2015 */ ? 2 /* NodeFlags.Const */ : 0 /* NodeFlags.None */)));
        }
        statements = appendExportsOfImportDeclaration(statements, node);
        return (0, ts_1.singleOrMany)(statements);
    }
    /**
     * Creates a `require()` call to import an external module.
     *
     * @param importNode The declararation to import.
     */
    function createRequireCall(importNode) {
        var moduleName = (0, ts_1.getExternalModuleNameLiteral)(factory, importNode, currentSourceFile, host, resolver, compilerOptions);
        var args = [];
        if (moduleName) {
            args.push(moduleName);
        }
        return factory.createCallExpression(factory.createIdentifier("require"), /*typeArguments*/ undefined, args);
    }
    /**
     * Visits an ImportEqualsDeclaration node.
     *
     * @param node The node to visit.
     */
    function visitImportEqualsDeclaration(node) {
        ts_1.Debug.assert((0, ts_1.isExternalModuleImportEqualsDeclaration)(node), "import= for internal module references should be handled in an earlier transformer.");
        var statements;
        if (moduleKind !== ts_1.ModuleKind.AMD) {
            if ((0, ts_1.hasSyntacticModifier)(node, 1 /* ModifierFlags.Export */)) {
                statements = (0, ts_1.append)(statements, (0, ts_1.setOriginalNode)((0, ts_1.setTextRange)(factory.createExpressionStatement(createExportExpression(node.name, createRequireCall(node))), node), node));
            }
            else {
                statements = (0, ts_1.append)(statements, (0, ts_1.setOriginalNode)((0, ts_1.setTextRange)(factory.createVariableStatement(
                /*modifiers*/ undefined, factory.createVariableDeclarationList([
                    factory.createVariableDeclaration(factory.cloneNode(node.name), 
                    /*exclamationToken*/ undefined, 
                    /*type*/ undefined, createRequireCall(node))
                ], 
                /*flags*/ languageVersion >= 2 /* ScriptTarget.ES2015 */ ? 2 /* NodeFlags.Const */ : 0 /* NodeFlags.None */)), node), node));
            }
        }
        else {
            if ((0, ts_1.hasSyntacticModifier)(node, 1 /* ModifierFlags.Export */)) {
                statements = (0, ts_1.append)(statements, (0, ts_1.setOriginalNode)((0, ts_1.setTextRange)(factory.createExpressionStatement(createExportExpression(factory.getExportName(node), factory.getLocalName(node))), node), node));
            }
        }
        statements = appendExportsOfImportEqualsDeclaration(statements, node);
        return (0, ts_1.singleOrMany)(statements);
    }
    /**
     * Visits an ExportDeclaration node.
     *
     * @param The node to visit.
     */
    function visitExportDeclaration(node) {
        if (!node.moduleSpecifier) {
            // Elide export declarations with no module specifier as they are handled
            // elsewhere.
            return undefined;
        }
        var generatedName = factory.getGeneratedNameForNode(node);
        if (node.exportClause && (0, ts_1.isNamedExports)(node.exportClause)) {
            var statements = [];
            // export { x, y } from "mod";
            if (moduleKind !== ts_1.ModuleKind.AMD) {
                statements.push((0, ts_1.setOriginalNode)((0, ts_1.setTextRange)(factory.createVariableStatement(
                /*modifiers*/ undefined, factory.createVariableDeclarationList([
                    factory.createVariableDeclaration(generatedName, 
                    /*exclamationToken*/ undefined, 
                    /*type*/ undefined, createRequireCall(node))
                ])), 
                /*location*/ node), 
                /* original */ node));
            }
            for (var _i = 0, _a = node.exportClause.elements; _i < _a.length; _i++) {
                var specifier = _a[_i];
                if (languageVersion === 0 /* ScriptTarget.ES3 */) {
                    statements.push((0, ts_1.setOriginalNode)((0, ts_1.setTextRange)(factory.createExpressionStatement(emitHelpers().createCreateBindingHelper(generatedName, factory.createStringLiteralFromNode(specifier.propertyName || specifier.name), specifier.propertyName ? factory.createStringLiteralFromNode(specifier.name) : undefined)), specifier), specifier));
                }
                else {
                    var exportNeedsImportDefault = !!(0, ts_1.getESModuleInterop)(compilerOptions) &&
                        !((0, ts_1.getInternalEmitFlags)(node) & 2 /* InternalEmitFlags.NeverApplyImportHelper */) &&
                        (0, ts_1.idText)(specifier.propertyName || specifier.name) === "default";
                    var exportedValue = factory.createPropertyAccessExpression(exportNeedsImportDefault ? emitHelpers().createImportDefaultHelper(generatedName) : generatedName, specifier.propertyName || specifier.name);
                    statements.push((0, ts_1.setOriginalNode)((0, ts_1.setTextRange)(factory.createExpressionStatement(createExportExpression(factory.getExportName(specifier), exportedValue, /*location*/ undefined, /*liveBinding*/ true)), specifier), specifier));
                }
            }
            return (0, ts_1.singleOrMany)(statements);
        }
        else if (node.exportClause) {
            var statements = [];
            // export * as ns from "mod";
            // export * as default from "mod";
            statements.push((0, ts_1.setOriginalNode)((0, ts_1.setTextRange)(factory.createExpressionStatement(createExportExpression(factory.cloneNode(node.exportClause.name), getHelperExpressionForExport(node, moduleKind !== ts_1.ModuleKind.AMD ?
                createRequireCall(node) :
                (0, ts_1.isExportNamespaceAsDefaultDeclaration)(node) ? generatedName :
                    factory.createIdentifier((0, ts_1.idText)(node.exportClause.name))))), node), node));
            return (0, ts_1.singleOrMany)(statements);
        }
        else {
            // export * from "mod";
            return (0, ts_1.setOriginalNode)((0, ts_1.setTextRange)(factory.createExpressionStatement(emitHelpers().createExportStarHelper(moduleKind !== ts_1.ModuleKind.AMD ? createRequireCall(node) : generatedName)), node), node);
        }
    }
    /**
     * Visits an ExportAssignment node.
     *
     * @param node The node to visit.
     */
    function visitExportAssignment(node) {
        if (node.isExportEquals) {
            return undefined;
        }
        return createExportStatement(factory.createIdentifier("default"), (0, ts_1.visitNode)(node.expression, visitor, ts_1.isExpression), /*location*/ node, /*allowComments*/ true);
    }
    /**
     * Visits a FunctionDeclaration node.
     *
     * @param node The node to visit.
     */
    function visitFunctionDeclaration(node) {
        var statements;
        if ((0, ts_1.hasSyntacticModifier)(node, 1 /* ModifierFlags.Export */)) {
            statements = (0, ts_1.append)(statements, (0, ts_1.setOriginalNode)((0, ts_1.setTextRange)(factory.createFunctionDeclaration((0, ts_1.visitNodes)(node.modifiers, modifierVisitor, ts_1.isModifier), node.asteriskToken, factory.getDeclarationName(node, /*allowComments*/ true, /*allowSourceMaps*/ true), 
            /*typeParameters*/ undefined, (0, ts_1.visitNodes)(node.parameters, visitor, ts_1.isParameter), 
            /*type*/ undefined, (0, ts_1.visitEachChild)(node.body, visitor, context)), 
            /*location*/ node), 
            /*original*/ node));
        }
        else {
            statements = (0, ts_1.append)(statements, (0, ts_1.visitEachChild)(node, visitor, context));
        }
        statements = appendExportsOfHoistedDeclaration(statements, node);
        return (0, ts_1.singleOrMany)(statements);
    }
    /**
     * Visits a ClassDeclaration node.
     *
     * @param node The node to visit.
     */
    function visitClassDeclaration(node) {
        var statements;
        if ((0, ts_1.hasSyntacticModifier)(node, 1 /* ModifierFlags.Export */)) {
            statements = (0, ts_1.append)(statements, (0, ts_1.setOriginalNode)((0, ts_1.setTextRange)(factory.createClassDeclaration((0, ts_1.visitNodes)(node.modifiers, modifierVisitor, ts_1.isModifierLike), factory.getDeclarationName(node, /*allowComments*/ true, /*allowSourceMaps*/ true), 
            /*typeParameters*/ undefined, (0, ts_1.visitNodes)(node.heritageClauses, visitor, ts_1.isHeritageClause), (0, ts_1.visitNodes)(node.members, visitor, ts_1.isClassElement)), node), node));
        }
        else {
            statements = (0, ts_1.append)(statements, (0, ts_1.visitEachChild)(node, visitor, context));
        }
        statements = appendExportsOfHoistedDeclaration(statements, node);
        return (0, ts_1.singleOrMany)(statements);
    }
    /**
     * Visits a VariableStatement node.
     *
     * @param node The node to visit.
     */
    function visitVariableStatement(node) {
        var statements;
        var variables;
        var expressions;
        if ((0, ts_1.hasSyntacticModifier)(node, 1 /* ModifierFlags.Export */)) {
            var modifiers = void 0;
            var removeCommentsOnExpressions = false;
            // If we're exporting these variables, then these just become assignments to 'exports.x'.
            for (var _i = 0, _a = node.declarationList.declarations; _i < _a.length; _i++) {
                var variable = _a[_i];
                if ((0, ts_1.isIdentifier)(variable.name) && (0, ts_1.isLocalName)(variable.name)) {
                    // A "local name" generally means a variable declaration that *shouldn't* be
                    // converted to `exports.x = ...`, even if the declaration is exported. This
                    // usually indicates a class or function declaration that was converted into
                    // a variable declaration, as most references to the declaration will remain
                    // untransformed (i.e., `new C` rather than `new exports.C`). In these cases,
                    // an `export { x }` declaration will follow.
                    if (!modifiers) {
                        modifiers = (0, ts_1.visitNodes)(node.modifiers, modifierVisitor, ts_1.isModifier);
                    }
                    if (variable.initializer) {
                        var updatedVariable = factory.updateVariableDeclaration(variable, variable.name, 
                        /*exclamationToken*/ undefined, 
                        /*type*/ undefined, createExportExpression(variable.name, (0, ts_1.visitNode)(variable.initializer, visitor, ts_1.isExpression)));
                        variables = (0, ts_1.append)(variables, updatedVariable);
                    }
                    else {
                        variables = (0, ts_1.append)(variables, variable);
                    }
                }
                else if (variable.initializer) {
                    if (!(0, ts_1.isBindingPattern)(variable.name) && ((0, ts_1.isArrowFunction)(variable.initializer) || (0, ts_1.isFunctionExpression)(variable.initializer) || (0, ts_1.isClassExpression)(variable.initializer))) {
                        var expression = factory.createAssignment((0, ts_1.setTextRange)(factory.createPropertyAccessExpression(factory.createIdentifier("exports"), variable.name), 
                        /*location*/ variable.name), factory.createIdentifier((0, ts_1.getTextOfIdentifierOrLiteral)(variable.name)));
                        var updatedVariable = factory.createVariableDeclaration(variable.name, variable.exclamationToken, variable.type, (0, ts_1.visitNode)(variable.initializer, visitor, ts_1.isExpression));
                        variables = (0, ts_1.append)(variables, updatedVariable);
                        expressions = (0, ts_1.append)(expressions, expression);
                        removeCommentsOnExpressions = true;
                    }
                    else {
                        expressions = (0, ts_1.append)(expressions, transformInitializedVariable(variable));
                    }
                }
            }
            if (variables) {
                statements = (0, ts_1.append)(statements, factory.updateVariableStatement(node, modifiers, factory.updateVariableDeclarationList(node.declarationList, variables)));
            }
            if (expressions) {
                var statement = (0, ts_1.setOriginalNode)((0, ts_1.setTextRange)(factory.createExpressionStatement(factory.inlineExpressions(expressions)), node), node);
                if (removeCommentsOnExpressions) {
                    (0, ts_1.removeAllComments)(statement);
                }
                statements = (0, ts_1.append)(statements, statement);
            }
        }
        else {
            statements = (0, ts_1.append)(statements, (0, ts_1.visitEachChild)(node, visitor, context));
        }
        statements = appendExportsOfVariableStatement(statements, node);
        return (0, ts_1.singleOrMany)(statements);
    }
    function createAllExportExpressions(name, value, location) {
        var exportedNames = getExports(name);
        if (exportedNames) {
            // For each additional export of the declaration, apply an export assignment.
            var expression = (0, ts_1.isExportName)(name) ? value : factory.createAssignment(name, value);
            for (var _i = 0, exportedNames_2 = exportedNames; _i < exportedNames_2.length; _i++) {
                var exportName = exportedNames_2[_i];
                // Mark the node to prevent triggering substitution.
                (0, ts_1.setEmitFlags)(expression, 8 /* EmitFlags.NoSubstitution */);
                expression = createExportExpression(exportName, expression, /*location*/ location);
            }
            return expression;
        }
        return factory.createAssignment(name, value);
    }
    /**
     * Transforms an exported variable with an initializer into an expression.
     *
     * @param node The node to transform.
     */
    function transformInitializedVariable(node) {
        if ((0, ts_1.isBindingPattern)(node.name)) {
            return (0, ts_1.flattenDestructuringAssignment)((0, ts_1.visitNode)(node, visitor, ts_1.isInitializedVariable), visitor, context, 0 /* FlattenLevel.All */, 
            /*needsValue*/ false, createAllExportExpressions);
        }
        else {
            return factory.createAssignment((0, ts_1.setTextRange)(factory.createPropertyAccessExpression(factory.createIdentifier("exports"), node.name), 
            /*location*/ node.name), node.initializer ? (0, ts_1.visitNode)(node.initializer, visitor, ts_1.isExpression) : factory.createVoidZero());
        }
    }
    /**
     * Appends the exports of an ImportDeclaration to a statement list, returning the
     * statement list.
     *
     * @param statements A statement list to which the down-level export statements are to be
     * appended. If `statements` is `undefined`, a new array is allocated if statements are
     * appended.
     * @param decl The declaration whose exports are to be recorded.
     */
    function appendExportsOfImportDeclaration(statements, decl) {
        if (currentModuleInfo.exportEquals) {
            return statements;
        }
        var importClause = decl.importClause;
        if (!importClause) {
            return statements;
        }
        if (importClause.name) {
            statements = appendExportsOfDeclaration(statements, importClause);
        }
        var namedBindings = importClause.namedBindings;
        if (namedBindings) {
            switch (namedBindings.kind) {
                case 273 /* SyntaxKind.NamespaceImport */:
                    statements = appendExportsOfDeclaration(statements, namedBindings);
                    break;
                case 274 /* SyntaxKind.NamedImports */:
                    for (var _i = 0, _a = namedBindings.elements; _i < _a.length; _i++) {
                        var importBinding = _a[_i];
                        statements = appendExportsOfDeclaration(statements, importBinding, /*liveBinding*/ true);
                    }
                    break;
            }
        }
        return statements;
    }
    /**
     * Appends the exports of an ImportEqualsDeclaration to a statement list, returning the
     * statement list.
     *
     * @param statements A statement list to which the down-level export statements are to be
     * appended. If `statements` is `undefined`, a new array is allocated if statements are
     * appended.
     * @param decl The declaration whose exports are to be recorded.
     */
    function appendExportsOfImportEqualsDeclaration(statements, decl) {
        if (currentModuleInfo.exportEquals) {
            return statements;
        }
        return appendExportsOfDeclaration(statements, decl);
    }
    /**
     * Appends the exports of a VariableStatement to a statement list, returning the statement
     * list.
     *
     * @param statements A statement list to which the down-level export statements are to be
     * appended. If `statements` is `undefined`, a new array is allocated if statements are
     * appended.
     * @param node The VariableStatement whose exports are to be recorded.
     */
    function appendExportsOfVariableStatement(statements, node) {
        return appendExportsOfVariableDeclarationList(statements, node.declarationList, /*isForInOrOfInitializer*/ false);
    }
    /**
     * Appends the exports of a VariableDeclarationList to a statement list, returning the statement
     * list.
     *
     * @param statements A statement list to which the down-level export statements are to be
     * appended. If `statements` is `undefined`, a new array is allocated if statements are
     * appended.
     * @param node The VariableDeclarationList whose exports are to be recorded.
     */
    function appendExportsOfVariableDeclarationList(statements, node, isForInOrOfInitializer) {
        if (currentModuleInfo.exportEquals) {
            return statements;
        }
        for (var _i = 0, _a = node.declarations; _i < _a.length; _i++) {
            var decl = _a[_i];
            statements = appendExportsOfBindingElement(statements, decl, isForInOrOfInitializer);
        }
        return statements;
    }
    /**
     * Appends the exports of a VariableDeclaration or BindingElement to a statement list,
     * returning the statement list.
     *
     * @param statements A statement list to which the down-level export statements are to be
     * appended. If `statements` is `undefined`, a new array is allocated if statements are
     * appended.
     * @param decl The declaration whose exports are to be recorded.
     */
    function appendExportsOfBindingElement(statements, decl, isForInOrOfInitializer) {
        if (currentModuleInfo.exportEquals) {
            return statements;
        }
        if ((0, ts_1.isBindingPattern)(decl.name)) {
            for (var _i = 0, _a = decl.name.elements; _i < _a.length; _i++) {
                var element = _a[_i];
                if (!(0, ts_1.isOmittedExpression)(element)) {
                    statements = appendExportsOfBindingElement(statements, element, isForInOrOfInitializer);
                }
            }
        }
        else if (!(0, ts_1.isGeneratedIdentifier)(decl.name) && (!(0, ts_1.isVariableDeclaration)(decl) || decl.initializer || isForInOrOfInitializer)) {
            statements = appendExportsOfDeclaration(statements, decl);
        }
        return statements;
    }
    /**
     * Appends the exports of a ClassDeclaration or FunctionDeclaration to a statement list,
     * returning the statement list.
     *
     * @param statements A statement list to which the down-level export statements are to be
     * appended. If `statements` is `undefined`, a new array is allocated if statements are
     * appended.
     * @param decl The declaration whose exports are to be recorded.
     */
    function appendExportsOfHoistedDeclaration(statements, decl) {
        if (currentModuleInfo.exportEquals) {
            return statements;
        }
        if ((0, ts_1.hasSyntacticModifier)(decl, 1 /* ModifierFlags.Export */)) {
            var exportName = (0, ts_1.hasSyntacticModifier)(decl, 1024 /* ModifierFlags.Default */) ? factory.createIdentifier("default") : factory.getDeclarationName(decl);
            statements = appendExportStatement(statements, exportName, factory.getLocalName(decl), /*location*/ decl);
        }
        if (decl.name) {
            statements = appendExportsOfDeclaration(statements, decl);
        }
        return statements;
    }
    /**
     * Appends the exports of a declaration to a statement list, returning the statement list.
     *
     * @param statements A statement list to which the down-level export statements are to be
     * appended. If `statements` is `undefined`, a new array is allocated if statements are
     * appended.
     * @param decl The declaration to export.
     */
    function appendExportsOfDeclaration(statements, decl, liveBinding) {
        var name = factory.getDeclarationName(decl);
        var exportSpecifiers = currentModuleInfo.exportSpecifiers.get((0, ts_1.idText)(name));
        if (exportSpecifiers) {
            for (var _i = 0, exportSpecifiers_1 = exportSpecifiers; _i < exportSpecifiers_1.length; _i++) {
                var exportSpecifier = exportSpecifiers_1[_i];
                statements = appendExportStatement(statements, exportSpecifier.name, name, /*location*/ exportSpecifier.name, /*allowComments*/ undefined, liveBinding);
            }
        }
        return statements;
    }
    /**
     * Appends the down-level representation of an export to a statement list, returning the
     * statement list.
     *
     * @param statements A statement list to which the down-level export statements are to be
     * appended. If `statements` is `undefined`, a new array is allocated if statements are
     * appended.
     * @param exportName The name of the export.
     * @param expression The expression to export.
     * @param location The location to use for source maps and comments for the export.
     * @param allowComments Whether to allow comments on the export.
     */
    function appendExportStatement(statements, exportName, expression, location, allowComments, liveBinding) {
        statements = (0, ts_1.append)(statements, createExportStatement(exportName, expression, location, allowComments, liveBinding));
        return statements;
    }
    function createUnderscoreUnderscoreESModule() {
        var statement;
        if (languageVersion === 0 /* ScriptTarget.ES3 */) {
            statement = factory.createExpressionStatement(createExportExpression(factory.createIdentifier("__esModule"), factory.createTrue()));
        }
        else {
            statement = factory.createExpressionStatement(factory.createCallExpression(factory.createPropertyAccessExpression(factory.createIdentifier("Object"), "defineProperty"), 
            /*typeArguments*/ undefined, [
                factory.createIdentifier("exports"),
                factory.createStringLiteral("__esModule"),
                factory.createObjectLiteralExpression([
                    factory.createPropertyAssignment("value", factory.createTrue())
                ])
            ]));
        }
        (0, ts_1.setEmitFlags)(statement, 2097152 /* EmitFlags.CustomPrologue */);
        return statement;
    }
    /**
     * Creates a call to the current file's export function to export a value.
     *
     * @param name The bound name of the export.
     * @param value The exported value.
     * @param location The location to use for source maps and comments for the export.
     * @param allowComments An optional value indicating whether to emit comments for the statement.
     */
    function createExportStatement(name, value, location, allowComments, liveBinding) {
        var statement = (0, ts_1.setTextRange)(factory.createExpressionStatement(createExportExpression(name, value, /*location*/ undefined, liveBinding)), location);
        (0, ts_1.startOnNewLine)(statement);
        if (!allowComments) {
            (0, ts_1.setEmitFlags)(statement, 3072 /* EmitFlags.NoComments */);
        }
        return statement;
    }
    /**
     * Creates a call to the current file's export function to export a value.
     *
     * @param name The bound name of the export.
     * @param value The exported value.
     * @param location The location to use for source maps and comments for the export.
     */
    function createExportExpression(name, value, location, liveBinding) {
        return (0, ts_1.setTextRange)(liveBinding && languageVersion !== 0 /* ScriptTarget.ES3 */ ? factory.createCallExpression(factory.createPropertyAccessExpression(factory.createIdentifier("Object"), "defineProperty"), 
        /*typeArguments*/ undefined, [
            factory.createIdentifier("exports"),
            factory.createStringLiteralFromNode(name),
            factory.createObjectLiteralExpression([
                factory.createPropertyAssignment("enumerable", factory.createTrue()),
                factory.createPropertyAssignment("get", factory.createFunctionExpression(
                /*modifiers*/ undefined, 
                /*asteriskToken*/ undefined, 
                /*name*/ undefined, 
                /*typeParameters*/ undefined, 
                /*parameters*/ [], 
                /*type*/ undefined, factory.createBlock([factory.createReturnStatement(value)])))
            ])
        ]) : factory.createAssignment(factory.createPropertyAccessExpression(factory.createIdentifier("exports"), factory.cloneNode(name)), value), location);
    }
    //
    // Modifier Visitors
    //
    /**
     * Visit nodes to elide module-specific modifiers.
     *
     * @param node The node to visit.
     */
    function modifierVisitor(node) {
        // Elide module-specific modifiers.
        switch (node.kind) {
            case 95 /* SyntaxKind.ExportKeyword */:
            case 90 /* SyntaxKind.DefaultKeyword */:
                return undefined;
        }
        return node;
    }
    //
    // Emit Notification
    //
    /**
     * Hook for node emit notifications.
     *
     * @param hint A hint as to the intended usage of the node.
     * @param node The node to emit.
     * @param emit A callback used to emit the node in the printer.
     */
    function onEmitNode(hint, node, emitCallback) {
        if (node.kind === 311 /* SyntaxKind.SourceFile */) {
            currentSourceFile = node;
            currentModuleInfo = moduleInfoMap[(0, ts_1.getOriginalNodeId)(currentSourceFile)];
            previousOnEmitNode(hint, node, emitCallback);
            currentSourceFile = undefined;
            currentModuleInfo = undefined;
        }
        else {
            previousOnEmitNode(hint, node, emitCallback);
        }
    }
    //
    // Substitutions
    //
    /**
     * Hooks node substitutions.
     *
     * @param hint A hint as to the intended usage of the node.
     * @param node The node to substitute.
     */
    function onSubstituteNode(hint, node) {
        node = previousOnSubstituteNode(hint, node);
        if (node.id && noSubstitution[node.id]) {
            return node;
        }
        if (hint === 1 /* EmitHint.Expression */) {
            return substituteExpression(node);
        }
        else if ((0, ts_1.isShorthandPropertyAssignment)(node)) {
            return substituteShorthandPropertyAssignment(node);
        }
        return node;
    }
    /**
     * Substitution for a ShorthandPropertyAssignment whose declaration name is an imported
     * or exported symbol.
     *
     * @param node The node to substitute.
     */
    function substituteShorthandPropertyAssignment(node) {
        var name = node.name;
        var exportedOrImportedName = substituteExpressionIdentifier(name);
        if (exportedOrImportedName !== name) {
            // A shorthand property with an assignment initializer is probably part of a
            // destructuring assignment
            if (node.objectAssignmentInitializer) {
                var initializer = factory.createAssignment(exportedOrImportedName, node.objectAssignmentInitializer);
                return (0, ts_1.setTextRange)(factory.createPropertyAssignment(name, initializer), node);
            }
            return (0, ts_1.setTextRange)(factory.createPropertyAssignment(name, exportedOrImportedName), node);
        }
        return node;
    }
    /**
     * Substitution for an Expression that may contain an imported or exported symbol.
     *
     * @param node The node to substitute.
     */
    function substituteExpression(node) {
        switch (node.kind) {
            case 80 /* SyntaxKind.Identifier */:
                return substituteExpressionIdentifier(node);
            case 212 /* SyntaxKind.CallExpression */:
                return substituteCallExpression(node);
            case 214 /* SyntaxKind.TaggedTemplateExpression */:
                return substituteTaggedTemplateExpression(node);
            case 225 /* SyntaxKind.BinaryExpression */:
                return substituteBinaryExpression(node);
        }
        return node;
    }
    function substituteCallExpression(node) {
        if ((0, ts_1.isIdentifier)(node.expression)) {
            var expression = substituteExpressionIdentifier(node.expression);
            noSubstitution[(0, ts_1.getNodeId)(expression)] = true;
            if (!(0, ts_1.isIdentifier)(expression) && !((0, ts_1.getEmitFlags)(node.expression) & 8192 /* EmitFlags.HelperName */)) {
                return (0, ts_1.addInternalEmitFlags)(factory.updateCallExpression(node, expression, 
                /*typeArguments*/ undefined, node.arguments), 16 /* InternalEmitFlags.IndirectCall */);
            }
        }
        return node;
    }
    function substituteTaggedTemplateExpression(node) {
        if ((0, ts_1.isIdentifier)(node.tag)) {
            var tag = substituteExpressionIdentifier(node.tag);
            noSubstitution[(0, ts_1.getNodeId)(tag)] = true;
            if (!(0, ts_1.isIdentifier)(tag) && !((0, ts_1.getEmitFlags)(node.tag) & 8192 /* EmitFlags.HelperName */)) {
                return (0, ts_1.addInternalEmitFlags)(factory.updateTaggedTemplateExpression(node, tag, 
                /*typeArguments*/ undefined, node.template), 16 /* InternalEmitFlags.IndirectCall */);
            }
        }
        return node;
    }
    /**
     * Substitution for an Identifier expression that may contain an imported or exported
     * symbol.
     *
     * @param node The node to substitute.
     */
    function substituteExpressionIdentifier(node) {
        var _a, _b;
        if ((0, ts_1.getEmitFlags)(node) & 8192 /* EmitFlags.HelperName */) {
            var externalHelpersModuleName = (0, ts_1.getExternalHelpersModuleName)(currentSourceFile);
            if (externalHelpersModuleName) {
                return factory.createPropertyAccessExpression(externalHelpersModuleName, node);
            }
            return node;
        }
        else if (!((0, ts_1.isGeneratedIdentifier)(node) && !(node.emitNode.autoGenerate.flags & 64 /* GeneratedIdentifierFlags.AllowNameSubstitution */)) && !(0, ts_1.isLocalName)(node)) {
            var exportContainer = resolver.getReferencedExportContainer(node, (0, ts_1.isExportName)(node));
            if (exportContainer && exportContainer.kind === 311 /* SyntaxKind.SourceFile */) {
                return (0, ts_1.setTextRange)(factory.createPropertyAccessExpression(factory.createIdentifier("exports"), factory.cloneNode(node)), 
                /*location*/ node);
            }
            var importDeclaration = resolver.getReferencedImportDeclaration(node);
            if (importDeclaration) {
                if ((0, ts_1.isImportClause)(importDeclaration)) {
                    return (0, ts_1.setTextRange)(factory.createPropertyAccessExpression(factory.getGeneratedNameForNode(importDeclaration.parent), factory.createIdentifier("default")), 
                    /*location*/ node);
                }
                else if ((0, ts_1.isImportSpecifier)(importDeclaration)) {
                    var name_1 = importDeclaration.propertyName || importDeclaration.name;
                    return (0, ts_1.setTextRange)(factory.createPropertyAccessExpression(factory.getGeneratedNameForNode(((_b = (_a = importDeclaration.parent) === null || _a === void 0 ? void 0 : _a.parent) === null || _b === void 0 ? void 0 : _b.parent) || importDeclaration), factory.cloneNode(name_1)), 
                    /*location*/ node);
                }
            }
        }
        return node;
    }
    /**
     * Substitution for a BinaryExpression that may contain an imported or exported symbol.
     *
     * @param node The node to substitute.
     */
    function substituteBinaryExpression(node) {
        // When we see an assignment expression whose left-hand side is an exported symbol,
        // we should ensure all exports of that symbol are updated with the correct value.
        //
        // - We do not substitute generated identifiers for any reason.
        // - We do not substitute identifiers tagged with the LocalName flag.
        // - We only substitute identifiers that are exported at the top level.
        if ((0, ts_1.isAssignmentOperator)(node.operatorToken.kind)
            && (0, ts_1.isIdentifier)(node.left)
            && !(0, ts_1.isGeneratedIdentifier)(node.left)
            && !(0, ts_1.isLocalName)(node.left)) {
            var exportedNames = getExports(node.left);
            if (exportedNames) {
                // For each additional export of the declaration, apply an export assignment.
                var expression = node;
                for (var _i = 0, exportedNames_3 = exportedNames; _i < exportedNames_3.length; _i++) {
                    var exportName = exportedNames_3[_i];
                    // Mark the node to prevent triggering this rule again.
                    noSubstitution[(0, ts_1.getNodeId)(expression)] = true;
                    expression = createExportExpression(exportName, expression, /*location*/ node);
                }
                return expression;
            }
        }
        return node;
    }
    /**
     * Gets the additional exports of a name.
     *
     * @param name The name.
     */
    function getExports(name) {
        if (!(0, ts_1.isGeneratedIdentifier)(name)) {
            var importDeclaration = resolver.getReferencedImportDeclaration(name);
            if (importDeclaration) {
                return currentModuleInfo === null || currentModuleInfo === void 0 ? void 0 : currentModuleInfo.exportedBindings[(0, ts_1.getOriginalNodeId)(importDeclaration)];
            }
            // An exported namespace or enum may merge with an ambient declaration, which won't show up in .js emit, so
            // we analyze all value exports of a symbol.
            var bindingsSet = new Set();
            var declarations = resolver.getReferencedValueDeclarations(name);
            if (declarations) {
                for (var _i = 0, declarations_1 = declarations; _i < declarations_1.length; _i++) {
                    var declaration = declarations_1[_i];
                    var bindings = currentModuleInfo === null || currentModuleInfo === void 0 ? void 0 : currentModuleInfo.exportedBindings[(0, ts_1.getOriginalNodeId)(declaration)];
                    if (bindings) {
                        for (var _a = 0, bindings_1 = bindings; _a < bindings_1.length; _a++) {
                            var binding = bindings_1[_a];
                            bindingsSet.add(binding);
                        }
                    }
                }
                if (bindingsSet.size) {
                    return (0, ts_1.arrayFrom)(bindingsSet);
                }
            }
        }
    }
}
exports.transformModule = transformModule;
// emit helper for dynamic import
var dynamicImportUMDHelper = {
    name: "typescript:dynamicimport-sync-require",
    scoped: true,
    text: "\n            var __syncRequire = typeof module === \"object\" && typeof module.exports === \"object\";"
};
