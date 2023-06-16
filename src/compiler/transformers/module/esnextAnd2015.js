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
exports.transformECMAScriptModule = void 0;
var ts_1 = require("../../_namespaces/ts");
/** @internal */
function transformECMAScriptModule(context) {
    var factory = context.factory, emitHelpers = context.getEmitHelperFactory;
    var host = context.getEmitHost();
    var resolver = context.getEmitResolver();
    var compilerOptions = context.getCompilerOptions();
    var languageVersion = (0, ts_1.getEmitScriptTarget)(compilerOptions);
    var previousOnEmitNode = context.onEmitNode;
    var previousOnSubstituteNode = context.onSubstituteNode;
    context.onEmitNode = onEmitNode;
    context.onSubstituteNode = onSubstituteNode;
    context.enableEmitNotification(311 /* SyntaxKind.SourceFile */);
    context.enableSubstitution(80 /* SyntaxKind.Identifier */);
    var helperNameSubstitutions;
    var currentSourceFile;
    var importRequireStatements;
    return (0, ts_1.chainBundle)(context, transformSourceFile);
    function transformSourceFile(node) {
        if (node.isDeclarationFile) {
            return node;
        }
        if ((0, ts_1.isExternalModule)(node) || (0, ts_1.getIsolatedModules)(compilerOptions)) {
            currentSourceFile = node;
            importRequireStatements = undefined;
            var result = updateExternalModule(node);
            currentSourceFile = undefined;
            if (importRequireStatements) {
                result = factory.updateSourceFile(result, (0, ts_1.setTextRange)(factory.createNodeArray((0, ts_1.insertStatementsAfterCustomPrologue)(result.statements.slice(), importRequireStatements)), result.statements));
            }
            if (!(0, ts_1.isExternalModule)(node) || (0, ts_1.some)(result.statements, ts_1.isExternalModuleIndicator)) {
                return result;
            }
            return factory.updateSourceFile(result, (0, ts_1.setTextRange)(factory.createNodeArray(__spreadArray(__spreadArray([], result.statements, true), [(0, ts_1.createEmptyExports)(factory)], false)), result.statements));
        }
        return node;
    }
    function updateExternalModule(node) {
        var externalHelpersImportDeclaration = (0, ts_1.createExternalHelpersImportDeclarationIfNeeded)(factory, emitHelpers(), node, compilerOptions);
        if (externalHelpersImportDeclaration) {
            var statements = [];
            var statementOffset = factory.copyPrologue(node.statements, statements);
            (0, ts_1.append)(statements, externalHelpersImportDeclaration);
            (0, ts_1.addRange)(statements, (0, ts_1.visitNodes)(node.statements, visitor, ts_1.isStatement, statementOffset));
            return factory.updateSourceFile(node, (0, ts_1.setTextRange)(factory.createNodeArray(statements), node.statements));
        }
        else {
            return (0, ts_1.visitEachChild)(node, visitor, context);
        }
    }
    function visitor(node) {
        switch (node.kind) {
            case 270 /* SyntaxKind.ImportEqualsDeclaration */:
                // Though an error in es2020 modules, in node-flavor es2020 modules, we can helpfully transform this to a synthetic `require` call
                // To give easy access to a synchronous `require` in node-flavor esm. We do the transform even in scenarios where we error, but `import.meta.url`
                // is available, just because the output is reasonable for a node-like runtime.
                return (0, ts_1.getEmitModuleKind)(compilerOptions) >= ts_1.ModuleKind.Node16 ? visitImportEqualsDeclaration(node) : undefined;
            case 276 /* SyntaxKind.ExportAssignment */:
                return visitExportAssignment(node);
            case 277 /* SyntaxKind.ExportDeclaration */:
                var exportDecl = node;
                return visitExportDeclaration(exportDecl);
        }
        return node;
    }
    /**
     * Creates a `require()` call to import an external module.
     *
     * @param importNode The declaration to import.
     */
    function createRequireCall(importNode) {
        var moduleName = (0, ts_1.getExternalModuleNameLiteral)(factory, importNode, ts_1.Debug.checkDefined(currentSourceFile), host, resolver, compilerOptions);
        var args = [];
        if (moduleName) {
            args.push(moduleName);
        }
        if (!importRequireStatements) {
            var createRequireName = factory.createUniqueName("_createRequire", 16 /* GeneratedIdentifierFlags.Optimistic */ | 32 /* GeneratedIdentifierFlags.FileLevel */);
            var importStatement = factory.createImportDeclaration(
            /*modifiers*/ undefined, factory.createImportClause(
            /*isTypeOnly*/ false, 
            /*name*/ undefined, factory.createNamedImports([
                factory.createImportSpecifier(/*isTypeOnly*/ false, factory.createIdentifier("createRequire"), createRequireName)
            ])), factory.createStringLiteral("module"));
            var requireHelperName = factory.createUniqueName("__require", 16 /* GeneratedIdentifierFlags.Optimistic */ | 32 /* GeneratedIdentifierFlags.FileLevel */);
            var requireStatement = factory.createVariableStatement(
            /*modifiers*/ undefined, factory.createVariableDeclarationList([
                factory.createVariableDeclaration(requireHelperName, 
                /*exclamationToken*/ undefined, 
                /*type*/ undefined, factory.createCallExpression(factory.cloneNode(createRequireName), /*typeArguments*/ undefined, [
                    factory.createPropertyAccessExpression(factory.createMetaProperty(102 /* SyntaxKind.ImportKeyword */, factory.createIdentifier("meta")), factory.createIdentifier("url"))
                ]))
            ], 
            /*flags*/ languageVersion >= 2 /* ScriptTarget.ES2015 */ ? 2 /* NodeFlags.Const */ : 0 /* NodeFlags.None */));
            importRequireStatements = [importStatement, requireStatement];
        }
        var name = importRequireStatements[1].declarationList.declarations[0].name;
        ts_1.Debug.assertNode(name, ts_1.isIdentifier);
        return factory.createCallExpression(factory.cloneNode(name), /*typeArguments*/ undefined, args);
    }
    /**
     * Visits an ImportEqualsDeclaration node.
     *
     * @param node The node to visit.
     */
    function visitImportEqualsDeclaration(node) {
        ts_1.Debug.assert((0, ts_1.isExternalModuleImportEqualsDeclaration)(node), "import= for internal module references should be handled in an earlier transformer.");
        var statements;
        statements = (0, ts_1.append)(statements, (0, ts_1.setOriginalNode)((0, ts_1.setTextRange)(factory.createVariableStatement(
        /*modifiers*/ undefined, factory.createVariableDeclarationList([
            factory.createVariableDeclaration(factory.cloneNode(node.name), 
            /*exclamationToken*/ undefined, 
            /*type*/ undefined, createRequireCall(node))
        ], 
        /*flags*/ languageVersion >= 2 /* ScriptTarget.ES2015 */ ? 2 /* NodeFlags.Const */ : 0 /* NodeFlags.None */)), node), node));
        statements = appendExportsOfImportEqualsDeclaration(statements, node);
        return (0, ts_1.singleOrMany)(statements);
    }
    function appendExportsOfImportEqualsDeclaration(statements, node) {
        if ((0, ts_1.hasSyntacticModifier)(node, 1 /* ModifierFlags.Export */)) {
            statements = (0, ts_1.append)(statements, factory.createExportDeclaration(
            /*modifiers*/ undefined, node.isTypeOnly, factory.createNamedExports([factory.createExportSpecifier(/*isTypeOnly*/ false, /*propertyName*/ undefined, (0, ts_1.idText)(node.name))])));
        }
        return statements;
    }
    function visitExportAssignment(node) {
        // Elide `export=` as it is not legal with --module ES6
        return node.isExportEquals ? undefined : node;
    }
    function visitExportDeclaration(node) {
        // `export * as ns` only needs to be transformed in ES2015
        if (compilerOptions.module !== undefined && compilerOptions.module > ts_1.ModuleKind.ES2015) {
            return node;
        }
        // Either ill-formed or don't need to be tranformed.
        if (!node.exportClause || !(0, ts_1.isNamespaceExport)(node.exportClause) || !node.moduleSpecifier) {
            return node;
        }
        var oldIdentifier = node.exportClause.name;
        var synthName = factory.getGeneratedNameForNode(oldIdentifier);
        var importDecl = factory.createImportDeclaration(
        /*modifiers*/ undefined, factory.createImportClause(
        /*isTypeOnly*/ false, 
        /*name*/ undefined, factory.createNamespaceImport(synthName)), node.moduleSpecifier, node.assertClause);
        (0, ts_1.setOriginalNode)(importDecl, node.exportClause);
        var exportDecl = (0, ts_1.isExportNamespaceAsDefaultDeclaration)(node) ? factory.createExportDefault(synthName) : factory.createExportDeclaration(
        /*modifiers*/ undefined, 
        /*isTypeOnly*/ false, factory.createNamedExports([factory.createExportSpecifier(/*isTypeOnly*/ false, synthName, oldIdentifier)]));
        (0, ts_1.setOriginalNode)(exportDecl, node);
        return [importDecl, exportDecl];
    }
    //
    // Emit Notification
    //
    /**
     * Hook for node emit.
     *
     * @param hint A hint as to the intended usage of the node.
     * @param node The node to emit.
     * @param emit A callback used to emit the node in the printer.
     */
    function onEmitNode(hint, node, emitCallback) {
        if ((0, ts_1.isSourceFile)(node)) {
            if (((0, ts_1.isExternalModule)(node) || (0, ts_1.getIsolatedModules)(compilerOptions)) && compilerOptions.importHelpers) {
                helperNameSubstitutions = new Map();
            }
            previousOnEmitNode(hint, node, emitCallback);
            helperNameSubstitutions = undefined;
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
        if (helperNameSubstitutions && (0, ts_1.isIdentifier)(node) && (0, ts_1.getEmitFlags)(node) & 8192 /* EmitFlags.HelperName */) {
            return substituteHelperName(node);
        }
        return node;
    }
    function substituteHelperName(node) {
        var name = (0, ts_1.idText)(node);
        var substitution = helperNameSubstitutions.get(name);
        if (!substitution) {
            helperNameSubstitutions.set(name, substitution = factory.createUniqueName(name, 16 /* GeneratedIdentifierFlags.Optimistic */ | 32 /* GeneratedIdentifierFlags.FileLevel */));
        }
        return substitution;
    }
}
exports.transformECMAScriptModule = transformECMAScriptModule;
