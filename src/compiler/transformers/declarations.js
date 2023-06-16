"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
exports.transformDeclarations = exports.isInternalDeclaration = exports.getDeclarationDiagnostics = void 0;
var ts_1 = require("../_namespaces/ts");
var moduleSpecifiers = require("../_namespaces/ts.moduleSpecifiers");
/** @internal */
function getDeclarationDiagnostics(host, resolver, file) {
    var compilerOptions = host.getCompilerOptions();
    var result = (0, ts_1.transformNodes)(resolver, host, ts_1.factory, compilerOptions, file ? [file] : (0, ts_1.filter)(host.getSourceFiles(), ts_1.isSourceFileNotJson), [transformDeclarations], /*allowDtsFiles*/ false);
    return result.diagnostics;
}
exports.getDeclarationDiagnostics = getDeclarationDiagnostics;
function hasInternalAnnotation(range, currentSourceFile) {
    var comment = currentSourceFile.text.substring(range.pos, range.end);
    return (0, ts_1.stringContains)(comment, "@internal");
}
/** @internal */
function isInternalDeclaration(node, currentSourceFile) {
    var parseTreeNode = (0, ts_1.getParseTreeNode)(node);
    if (parseTreeNode && parseTreeNode.kind === 168 /* SyntaxKind.Parameter */) {
        var paramIdx = parseTreeNode.parent.parameters.indexOf(parseTreeNode);
        var previousSibling = paramIdx > 0 ? parseTreeNode.parent.parameters[paramIdx - 1] : undefined;
        var text = currentSourceFile.text;
        var commentRanges = previousSibling
            ? (0, ts_1.concatenate)(
            // to handle
            // ... parameters, /** @internal */
            // public param: string
            (0, ts_1.getTrailingCommentRanges)(text, (0, ts_1.skipTrivia)(text, previousSibling.end + 1, /*stopAfterLineBreak*/ false, /*stopAtComments*/ true)), (0, ts_1.getLeadingCommentRanges)(text, node.pos))
            : (0, ts_1.getTrailingCommentRanges)(text, (0, ts_1.skipTrivia)(text, node.pos, /*stopAfterLineBreak*/ false, /*stopAtComments*/ true));
        return commentRanges && commentRanges.length && hasInternalAnnotation((0, ts_1.last)(commentRanges), currentSourceFile);
    }
    var leadingCommentRanges = parseTreeNode && (0, ts_1.getLeadingCommentRangesOfNode)(parseTreeNode, currentSourceFile);
    return !!(0, ts_1.forEach)(leadingCommentRanges, function (range) {
        return hasInternalAnnotation(range, currentSourceFile);
    });
}
exports.isInternalDeclaration = isInternalDeclaration;
var declarationEmitNodeBuilderFlags = 1024 /* NodeBuilderFlags.MultilineObjectLiterals */ |
    2048 /* NodeBuilderFlags.WriteClassExpressionAsTypeLiteral */ |
    4096 /* NodeBuilderFlags.UseTypeOfFunction */ |
    8 /* NodeBuilderFlags.UseStructuralFallback */ |
    524288 /* NodeBuilderFlags.AllowEmptyTuple */ |
    4 /* NodeBuilderFlags.GenerateNamesForShadowedTypeParams */ |
    1 /* NodeBuilderFlags.NoTruncation */;
/**
 * Transforms a ts file into a .d.ts file
 * This process requires type information, which is retrieved through the emit resolver. Because of this,
 * in many places this transformer assumes it will be operating on parse tree nodes directly.
 * This means that _no transforms should be allowed to occur before this one_.
 *
 * @internal
 */
function transformDeclarations(context) {
    var throwDiagnostic = function () { return ts_1.Debug.fail("Diagnostic emitted without context"); };
    var getSymbolAccessibilityDiagnostic = throwDiagnostic;
    var needsDeclare = true;
    var isBundledEmit = false;
    var resultHasExternalModuleIndicator = false;
    var needsScopeFixMarker = false;
    var resultHasScopeMarker = false;
    var enclosingDeclaration;
    var necessaryTypeReferences;
    var lateMarkedStatements;
    var lateStatementReplacementMap;
    var suppressNewDiagnosticContexts;
    var exportedModulesFromDeclarationEmit;
    var factory = context.factory;
    var host = context.getEmitHost();
    var symbolTracker = {
        trackSymbol: trackSymbol,
        reportInaccessibleThisError: reportInaccessibleThisError,
        reportInaccessibleUniqueSymbolError: reportInaccessibleUniqueSymbolError,
        reportCyclicStructureError: reportCyclicStructureError,
        reportPrivateInBaseOfClassExpression: reportPrivateInBaseOfClassExpression,
        reportLikelyUnsafeImportRequiredError: reportLikelyUnsafeImportRequiredError,
        reportTruncationError: reportTruncationError,
        moduleResolverHost: host,
        trackReferencedAmbientModule: trackReferencedAmbientModule,
        trackExternalModuleSymbolOfImportTypeNode: trackExternalModuleSymbolOfImportTypeNode,
        reportNonlocalAugmentation: reportNonlocalAugmentation,
        reportNonSerializableProperty: reportNonSerializableProperty,
        reportImportTypeNodeResolutionModeOverride: reportImportTypeNodeResolutionModeOverride,
    };
    var errorNameNode;
    var errorFallbackNode;
    var currentSourceFile;
    var refs;
    var libs;
    var emittedImports; // must be declared in container so it can be `undefined` while transformer's first pass
    var resolver = context.getEmitResolver();
    var options = context.getCompilerOptions();
    var noResolve = options.noResolve, stripInternal = options.stripInternal;
    return transformRoot;
    function recordTypeReferenceDirectivesIfNecessary(typeReferenceDirectives) {
        if (!typeReferenceDirectives) {
            return;
        }
        necessaryTypeReferences = necessaryTypeReferences || new Set();
        for (var _i = 0, typeReferenceDirectives_1 = typeReferenceDirectives; _i < typeReferenceDirectives_1.length; _i++) {
            var ref = typeReferenceDirectives_1[_i];
            necessaryTypeReferences.add(ref);
        }
    }
    function trackReferencedAmbientModule(node, symbol) {
        // If it is visible via `// <reference types="..."/>`, then we should just use that
        var directives = resolver.getTypeReferenceDirectivesForSymbol(symbol, 67108863 /* SymbolFlags.All */);
        if ((0, ts_1.length)(directives)) {
            return recordTypeReferenceDirectivesIfNecessary(directives);
        }
        // Otherwise we should emit a path-based reference
        var container = (0, ts_1.getSourceFileOfNode)(node);
        refs.set((0, ts_1.getOriginalNodeId)(container), container);
    }
    function handleSymbolAccessibilityError(symbolAccessibilityResult) {
        if (symbolAccessibilityResult.accessibility === 0 /* SymbolAccessibility.Accessible */) {
            // Add aliases back onto the possible imports list if they're not there so we can try them again with updated visibility info
            if (symbolAccessibilityResult && symbolAccessibilityResult.aliasesToMakeVisible) {
                if (!lateMarkedStatements) {
                    lateMarkedStatements = symbolAccessibilityResult.aliasesToMakeVisible;
                }
                else {
                    for (var _i = 0, _a = symbolAccessibilityResult.aliasesToMakeVisible; _i < _a.length; _i++) {
                        var ref = _a[_i];
                        (0, ts_1.pushIfUnique)(lateMarkedStatements, ref);
                    }
                }
            }
            // TODO: Do all these accessibility checks inside/after the first pass in the checker when declarations are enabled, if possible
        }
        else {
            // Report error
            var errorInfo = getSymbolAccessibilityDiagnostic(symbolAccessibilityResult);
            if (errorInfo) {
                if (errorInfo.typeName) {
                    context.addDiagnostic((0, ts_1.createDiagnosticForNode)(symbolAccessibilityResult.errorNode || errorInfo.errorNode, errorInfo.diagnosticMessage, (0, ts_1.getTextOfNode)(errorInfo.typeName), symbolAccessibilityResult.errorSymbolName, symbolAccessibilityResult.errorModuleName));
                }
                else {
                    context.addDiagnostic((0, ts_1.createDiagnosticForNode)(symbolAccessibilityResult.errorNode || errorInfo.errorNode, errorInfo.diagnosticMessage, symbolAccessibilityResult.errorSymbolName, symbolAccessibilityResult.errorModuleName));
                }
                return true;
            }
        }
        return false;
    }
    function trackExternalModuleSymbolOfImportTypeNode(symbol) {
        if (!isBundledEmit) {
            (exportedModulesFromDeclarationEmit || (exportedModulesFromDeclarationEmit = [])).push(symbol);
        }
    }
    function trackSymbol(symbol, enclosingDeclaration, meaning) {
        if (symbol.flags & 262144 /* SymbolFlags.TypeParameter */)
            return false;
        var issuedDiagnostic = handleSymbolAccessibilityError(resolver.isSymbolAccessible(symbol, enclosingDeclaration, meaning, /*shouldComputeAliasToMarkVisible*/ true));
        recordTypeReferenceDirectivesIfNecessary(resolver.getTypeReferenceDirectivesForSymbol(symbol, meaning));
        return issuedDiagnostic;
    }
    function reportPrivateInBaseOfClassExpression(propertyName) {
        if (errorNameNode || errorFallbackNode) {
            context.addDiagnostic((0, ts_1.createDiagnosticForNode)((errorNameNode || errorFallbackNode), ts_1.Diagnostics.Property_0_of_exported_class_expression_may_not_be_private_or_protected, propertyName));
        }
    }
    function errorDeclarationNameWithFallback() {
        return errorNameNode ? (0, ts_1.declarationNameToString)(errorNameNode) :
            errorFallbackNode && (0, ts_1.getNameOfDeclaration)(errorFallbackNode) ? (0, ts_1.declarationNameToString)((0, ts_1.getNameOfDeclaration)(errorFallbackNode)) :
                errorFallbackNode && (0, ts_1.isExportAssignment)(errorFallbackNode) ? errorFallbackNode.isExportEquals ? "export=" : "default" :
                    "(Missing)"; // same fallback declarationNameToString uses when node is zero-width (ie, nameless)
    }
    function reportInaccessibleUniqueSymbolError() {
        if (errorNameNode || errorFallbackNode) {
            context.addDiagnostic((0, ts_1.createDiagnosticForNode)((errorNameNode || errorFallbackNode), ts_1.Diagnostics.The_inferred_type_of_0_references_an_inaccessible_1_type_A_type_annotation_is_necessary, errorDeclarationNameWithFallback(), "unique symbol"));
        }
    }
    function reportCyclicStructureError() {
        if (errorNameNode || errorFallbackNode) {
            context.addDiagnostic((0, ts_1.createDiagnosticForNode)((errorNameNode || errorFallbackNode), ts_1.Diagnostics.The_inferred_type_of_0_references_a_type_with_a_cyclic_structure_which_cannot_be_trivially_serialized_A_type_annotation_is_necessary, errorDeclarationNameWithFallback()));
        }
    }
    function reportInaccessibleThisError() {
        if (errorNameNode || errorFallbackNode) {
            context.addDiagnostic((0, ts_1.createDiagnosticForNode)((errorNameNode || errorFallbackNode), ts_1.Diagnostics.The_inferred_type_of_0_references_an_inaccessible_1_type_A_type_annotation_is_necessary, errorDeclarationNameWithFallback(), "this"));
        }
    }
    function reportLikelyUnsafeImportRequiredError(specifier) {
        if (errorNameNode || errorFallbackNode) {
            context.addDiagnostic((0, ts_1.createDiagnosticForNode)((errorNameNode || errorFallbackNode), ts_1.Diagnostics.The_inferred_type_of_0_cannot_be_named_without_a_reference_to_1_This_is_likely_not_portable_A_type_annotation_is_necessary, errorDeclarationNameWithFallback(), specifier));
        }
    }
    function reportTruncationError() {
        if (errorNameNode || errorFallbackNode) {
            context.addDiagnostic((0, ts_1.createDiagnosticForNode)((errorNameNode || errorFallbackNode), ts_1.Diagnostics.The_inferred_type_of_this_node_exceeds_the_maximum_length_the_compiler_will_serialize_An_explicit_type_annotation_is_needed));
        }
    }
    function reportNonlocalAugmentation(containingFile, parentSymbol, symbol) {
        var _a;
        var primaryDeclaration = (_a = parentSymbol.declarations) === null || _a === void 0 ? void 0 : _a.find(function (d) { return (0, ts_1.getSourceFileOfNode)(d) === containingFile; });
        var augmentingDeclarations = (0, ts_1.filter)(symbol.declarations, function (d) { return (0, ts_1.getSourceFileOfNode)(d) !== containingFile; });
        if (primaryDeclaration && augmentingDeclarations) {
            for (var _i = 0, augmentingDeclarations_1 = augmentingDeclarations; _i < augmentingDeclarations_1.length; _i++) {
                var augmentations = augmentingDeclarations_1[_i];
                context.addDiagnostic((0, ts_1.addRelatedInfo)((0, ts_1.createDiagnosticForNode)(augmentations, ts_1.Diagnostics.Declaration_augments_declaration_in_another_file_This_cannot_be_serialized), (0, ts_1.createDiagnosticForNode)(primaryDeclaration, ts_1.Diagnostics.This_is_the_declaration_being_augmented_Consider_moving_the_augmenting_declaration_into_the_same_file)));
            }
        }
    }
    function reportNonSerializableProperty(propertyName) {
        if (errorNameNode || errorFallbackNode) {
            context.addDiagnostic((0, ts_1.createDiagnosticForNode)((errorNameNode || errorFallbackNode), ts_1.Diagnostics.The_type_of_this_node_cannot_be_serialized_because_its_property_0_cannot_be_serialized, propertyName));
        }
    }
    function reportImportTypeNodeResolutionModeOverride() {
        if (!(0, ts_1.isNightly)() && (errorNameNode || errorFallbackNode)) {
            context.addDiagnostic((0, ts_1.createDiagnosticForNode)((errorNameNode || errorFallbackNode), ts_1.Diagnostics.The_type_of_this_expression_cannot_be_named_without_a_resolution_mode_assertion_which_is_an_unstable_feature_Use_nightly_TypeScript_to_silence_this_error_Try_updating_with_npm_install_D_typescript_next));
        }
    }
    function transformDeclarationsForJS(sourceFile, bundled) {
        var oldDiag = getSymbolAccessibilityDiagnostic;
        getSymbolAccessibilityDiagnostic = function (s) { return (s.errorNode && (0, ts_1.canProduceDiagnostics)(s.errorNode) ? (0, ts_1.createGetSymbolAccessibilityDiagnosticForNode)(s.errorNode)(s) : ({
            diagnosticMessage: s.errorModuleName
                ? ts_1.Diagnostics.Declaration_emit_for_this_file_requires_using_private_name_0_from_module_1_An_explicit_type_annotation_may_unblock_declaration_emit
                : ts_1.Diagnostics.Declaration_emit_for_this_file_requires_using_private_name_0_An_explicit_type_annotation_may_unblock_declaration_emit,
            errorNode: s.errorNode || sourceFile
        })); };
        var result = resolver.getDeclarationStatementsForSourceFile(sourceFile, declarationEmitNodeBuilderFlags, symbolTracker, bundled);
        getSymbolAccessibilityDiagnostic = oldDiag;
        return result;
    }
    function transformRoot(node) {
        if (node.kind === 311 /* SyntaxKind.SourceFile */ && node.isDeclarationFile) {
            return node;
        }
        if (node.kind === 312 /* SyntaxKind.Bundle */) {
            isBundledEmit = true;
            refs = new Map();
            libs = new Map();
            var hasNoDefaultLib_1 = false;
            var bundle = factory.createBundle((0, ts_1.map)(node.sourceFiles, function (sourceFile) {
                if (sourceFile.isDeclarationFile)
                    return undefined; // Omit declaration files from bundle results, too // TODO: GH#18217
                hasNoDefaultLib_1 = hasNoDefaultLib_1 || sourceFile.hasNoDefaultLib;
                currentSourceFile = sourceFile;
                enclosingDeclaration = sourceFile;
                lateMarkedStatements = undefined;
                suppressNewDiagnosticContexts = false;
                lateStatementReplacementMap = new Map();
                getSymbolAccessibilityDiagnostic = throwDiagnostic;
                needsScopeFixMarker = false;
                resultHasScopeMarker = false;
                collectReferences(sourceFile, refs);
                collectLibs(sourceFile, libs);
                if ((0, ts_1.isExternalOrCommonJsModule)(sourceFile) || (0, ts_1.isJsonSourceFile)(sourceFile)) {
                    resultHasExternalModuleIndicator = false; // unused in external module bundle emit (all external modules are within module blocks, therefore are known to be modules)
                    needsDeclare = false;
                    var statements = (0, ts_1.isSourceFileJS)(sourceFile) ? factory.createNodeArray(transformDeclarationsForJS(sourceFile, /*bundled*/ true)) : (0, ts_1.visitNodes)(sourceFile.statements, visitDeclarationStatements, ts_1.isStatement);
                    var newFile = factory.updateSourceFile(sourceFile, [factory.createModuleDeclaration([factory.createModifier(138 /* SyntaxKind.DeclareKeyword */)], factory.createStringLiteral((0, ts_1.getResolvedExternalModuleName)(context.getEmitHost(), sourceFile)), factory.createModuleBlock((0, ts_1.setTextRange)(factory.createNodeArray(transformAndReplaceLatePaintedStatements(statements)), sourceFile.statements)))], /*isDeclarationFile*/ true, /*referencedFiles*/ [], /*typeReferences*/ [], /*hasNoDefaultLib*/ false, /*libReferences*/ []);
                    return newFile;
                }
                needsDeclare = true;
                var updated = (0, ts_1.isSourceFileJS)(sourceFile) ? factory.createNodeArray(transformDeclarationsForJS(sourceFile)) : (0, ts_1.visitNodes)(sourceFile.statements, visitDeclarationStatements, ts_1.isStatement);
                return factory.updateSourceFile(sourceFile, transformAndReplaceLatePaintedStatements(updated), /*isDeclarationFile*/ true, /*referencedFiles*/ [], /*typeReferences*/ [], /*hasNoDefaultLib*/ false, /*libReferences*/ []);
            }), (0, ts_1.mapDefined)(node.prepends, function (prepend) {
                if (prepend.kind === 314 /* SyntaxKind.InputFiles */) {
                    var sourceFile = (0, ts_1.createUnparsedSourceFile)(prepend, "dts", stripInternal);
                    hasNoDefaultLib_1 = hasNoDefaultLib_1 || !!sourceFile.hasNoDefaultLib;
                    collectReferences(sourceFile, refs);
                    recordTypeReferenceDirectivesIfNecessary((0, ts_1.map)(sourceFile.typeReferenceDirectives, function (ref) { return [ref.fileName, ref.resolutionMode]; }));
                    collectLibs(sourceFile, libs);
                    return sourceFile;
                }
                return prepend;
            }));
            bundle.syntheticFileReferences = [];
            bundle.syntheticTypeReferences = getFileReferencesForUsedTypeReferences();
            bundle.syntheticLibReferences = getLibReferences();
            bundle.hasNoDefaultLib = hasNoDefaultLib_1;
            var outputFilePath_1 = (0, ts_1.getDirectoryPath)((0, ts_1.normalizeSlashes)((0, ts_1.getOutputPathsFor)(node, host, /*forceDtsPaths*/ true).declarationFilePath));
            var referenceVisitor_1 = mapReferencesIntoArray(bundle.syntheticFileReferences, outputFilePath_1);
            refs.forEach(referenceVisitor_1);
            return bundle;
        }
        // Single source file
        needsDeclare = true;
        needsScopeFixMarker = false;
        resultHasScopeMarker = false;
        enclosingDeclaration = node;
        currentSourceFile = node;
        getSymbolAccessibilityDiagnostic = throwDiagnostic;
        isBundledEmit = false;
        resultHasExternalModuleIndicator = false;
        suppressNewDiagnosticContexts = false;
        lateMarkedStatements = undefined;
        lateStatementReplacementMap = new Map();
        necessaryTypeReferences = undefined;
        refs = collectReferences(currentSourceFile, new Map());
        libs = collectLibs(currentSourceFile, new Map());
        var references = [];
        var outputFilePath = (0, ts_1.getDirectoryPath)((0, ts_1.normalizeSlashes)((0, ts_1.getOutputPathsFor)(node, host, /*forceDtsPaths*/ true).declarationFilePath));
        var referenceVisitor = mapReferencesIntoArray(references, outputFilePath);
        var combinedStatements;
        if ((0, ts_1.isSourceFileJS)(currentSourceFile)) {
            combinedStatements = factory.createNodeArray(transformDeclarationsForJS(node));
            refs.forEach(referenceVisitor);
            emittedImports = (0, ts_1.filter)(combinedStatements, ts_1.isAnyImportSyntax);
        }
        else {
            var statements = (0, ts_1.visitNodes)(node.statements, visitDeclarationStatements, ts_1.isStatement);
            combinedStatements = (0, ts_1.setTextRange)(factory.createNodeArray(transformAndReplaceLatePaintedStatements(statements)), node.statements);
            refs.forEach(referenceVisitor);
            emittedImports = (0, ts_1.filter)(combinedStatements, ts_1.isAnyImportSyntax);
            if ((0, ts_1.isExternalModule)(node) && (!resultHasExternalModuleIndicator || (needsScopeFixMarker && !resultHasScopeMarker))) {
                combinedStatements = (0, ts_1.setTextRange)(factory.createNodeArray(__spreadArray(__spreadArray([], combinedStatements, true), [(0, ts_1.createEmptyExports)(factory)], false)), combinedStatements);
            }
        }
        var updated = factory.updateSourceFile(node, combinedStatements, /*isDeclarationFile*/ true, references, getFileReferencesForUsedTypeReferences(), node.hasNoDefaultLib, getLibReferences());
        updated.exportedModulesFromDeclarationEmit = exportedModulesFromDeclarationEmit;
        return updated;
        function getLibReferences() {
            return (0, ts_1.arrayFrom)(libs.keys(), function (lib) { return ({ fileName: lib, pos: -1, end: -1 }); });
        }
        function getFileReferencesForUsedTypeReferences() {
            return necessaryTypeReferences ? (0, ts_1.mapDefined)((0, ts_1.arrayFrom)(necessaryTypeReferences.keys()), getFileReferenceForSpecifierModeTuple) : [];
        }
        function getFileReferenceForSpecifierModeTuple(_a) {
            var typeName = _a[0], mode = _a[1];
            // Elide type references for which we have imports
            if (emittedImports) {
                for (var _i = 0, emittedImports_1 = emittedImports; _i < emittedImports_1.length; _i++) {
                    var importStatement = emittedImports_1[_i];
                    if ((0, ts_1.isImportEqualsDeclaration)(importStatement) && (0, ts_1.isExternalModuleReference)(importStatement.moduleReference)) {
                        var expr = importStatement.moduleReference.expression;
                        if ((0, ts_1.isStringLiteralLike)(expr) && expr.text === typeName) {
                            return undefined;
                        }
                    }
                    else if ((0, ts_1.isImportDeclaration)(importStatement) && (0, ts_1.isStringLiteral)(importStatement.moduleSpecifier) && importStatement.moduleSpecifier.text === typeName) {
                        return undefined;
                    }
                }
            }
            return __assign({ fileName: typeName, pos: -1, end: -1 }, (mode ? { resolutionMode: mode } : undefined));
        }
        function mapReferencesIntoArray(references, outputFilePath) {
            return function (file) {
                var declFileName;
                if (file.isDeclarationFile) { // Neither decl files or js should have their refs changed
                    declFileName = file.fileName;
                }
                else {
                    if (isBundledEmit && (0, ts_1.contains)(node.sourceFiles, file))
                        return; // Omit references to files which are being merged
                    var paths = (0, ts_1.getOutputPathsFor)(file, host, /*forceDtsPaths*/ true);
                    declFileName = paths.declarationFilePath || paths.jsFilePath || file.fileName;
                }
                if (declFileName) {
                    var specifier = moduleSpecifiers.getModuleSpecifier(options, currentSourceFile, (0, ts_1.toPath)(outputFilePath, host.getCurrentDirectory(), host.getCanonicalFileName), (0, ts_1.toPath)(declFileName, host.getCurrentDirectory(), host.getCanonicalFileName), host);
                    if (!(0, ts_1.pathIsRelative)(specifier)) {
                        // If some compiler option/symlink/whatever allows access to the file containing the ambient module declaration
                        // via a non-relative name, emit a type reference directive to that non-relative name, rather than
                        // a relative path to the declaration file
                        recordTypeReferenceDirectivesIfNecessary([[specifier, /*mode*/ undefined]]);
                        return;
                    }
                    var fileName = (0, ts_1.getRelativePathToDirectoryOrUrl)(outputFilePath, declFileName, host.getCurrentDirectory(), host.getCanonicalFileName, 
                    /*isAbsolutePathAnUrl*/ false);
                    if ((0, ts_1.startsWith)(fileName, "./") && (0, ts_1.hasExtension)(fileName)) {
                        fileName = fileName.substring(2);
                    }
                    // omit references to files from node_modules (npm may disambiguate module
                    // references when installing this package, making the path is unreliable).
                    if ((0, ts_1.startsWith)(fileName, "node_modules/") || (0, ts_1.pathContainsNodeModules)(fileName)) {
                        return;
                    }
                    references.push({ pos: -1, end: -1, fileName: fileName });
                }
            };
        }
    }
    function collectReferences(sourceFile, ret) {
        if (noResolve || (!(0, ts_1.isUnparsedSource)(sourceFile) && (0, ts_1.isSourceFileJS)(sourceFile)))
            return ret;
        (0, ts_1.forEach)(sourceFile.referencedFiles, function (f) {
            var elem = host.getSourceFileFromReference(sourceFile, f);
            if (elem) {
                ret.set((0, ts_1.getOriginalNodeId)(elem), elem);
            }
        });
        return ret;
    }
    function collectLibs(sourceFile, ret) {
        (0, ts_1.forEach)(sourceFile.libReferenceDirectives, function (ref) {
            var lib = host.getLibFileFromReference(ref);
            if (lib) {
                ret.set((0, ts_1.toFileNameLowerCase)(ref.fileName), true);
            }
        });
        return ret;
    }
    function filterBindingPatternInitializersAndRenamings(name) {
        if (name.kind === 80 /* SyntaxKind.Identifier */) {
            return name;
        }
        else {
            if (name.kind === 206 /* SyntaxKind.ArrayBindingPattern */) {
                return factory.updateArrayBindingPattern(name, (0, ts_1.visitNodes)(name.elements, visitBindingElement, ts_1.isArrayBindingElement));
            }
            else {
                return factory.updateObjectBindingPattern(name, (0, ts_1.visitNodes)(name.elements, visitBindingElement, ts_1.isBindingElement));
            }
        }
        function visitBindingElement(elem) {
            if (elem.kind === 231 /* SyntaxKind.OmittedExpression */) {
                return elem;
            }
            if (elem.propertyName && (0, ts_1.isIdentifier)(elem.propertyName) && (0, ts_1.isIdentifier)(elem.name) && !elem.symbol.isReferenced && !(0, ts_1.isIdentifierANonContextualKeyword)(elem.propertyName)) {
                // Unnecessary property renaming is forbidden in types, so remove renaming
                return factory.updateBindingElement(elem, elem.dotDotDotToken, 
                /*propertyName*/ undefined, elem.propertyName, shouldPrintWithInitializer(elem) ? elem.initializer : undefined);
            }
            return factory.updateBindingElement(elem, elem.dotDotDotToken, elem.propertyName, filterBindingPatternInitializersAndRenamings(elem.name), shouldPrintWithInitializer(elem) ? elem.initializer : undefined);
        }
    }
    function ensureParameter(p, modifierMask, type) {
        var oldDiag;
        if (!suppressNewDiagnosticContexts) {
            oldDiag = getSymbolAccessibilityDiagnostic;
            getSymbolAccessibilityDiagnostic = (0, ts_1.createGetSymbolAccessibilityDiagnosticForNode)(p);
        }
        var newParam = factory.updateParameterDeclaration(p, maskModifiers(factory, p, modifierMask), p.dotDotDotToken, filterBindingPatternInitializersAndRenamings(p.name), resolver.isOptionalParameter(p) ? (p.questionToken || factory.createToken(58 /* SyntaxKind.QuestionToken */)) : undefined, ensureType(p, type || p.type, /*ignorePrivate*/ true), // Ignore private param props, since this type is going straight back into a param
        ensureNoInitializer(p));
        if (!suppressNewDiagnosticContexts) {
            getSymbolAccessibilityDiagnostic = oldDiag;
        }
        return newParam;
    }
    function shouldPrintWithInitializer(node) {
        return canHaveLiteralInitializer(node) && resolver.isLiteralConstDeclaration((0, ts_1.getParseTreeNode)(node)); // TODO: Make safe
    }
    function ensureNoInitializer(node) {
        if (shouldPrintWithInitializer(node)) {
            return resolver.createLiteralConstValue((0, ts_1.getParseTreeNode)(node), symbolTracker); // TODO: Make safe
        }
        return undefined;
    }
    function ensureType(node, type, ignorePrivate) {
        if (!ignorePrivate && (0, ts_1.hasEffectiveModifier)(node, 8 /* ModifierFlags.Private */)) {
            // Private nodes emit no types (except private parameter properties, whose parameter types are actually visible)
            return;
        }
        if (shouldPrintWithInitializer(node)) {
            // Literal const declarations will have an initializer ensured rather than a type
            return;
        }
        var shouldUseResolverType = node.kind === 168 /* SyntaxKind.Parameter */ &&
            (resolver.isRequiredInitializedParameter(node) ||
                resolver.isOptionalUninitializedParameterProperty(node));
        if (type && !shouldUseResolverType) {
            return (0, ts_1.visitNode)(type, visitDeclarationSubtree, ts_1.isTypeNode);
        }
        if (!(0, ts_1.getParseTreeNode)(node)) {
            return type ? (0, ts_1.visitNode)(type, visitDeclarationSubtree, ts_1.isTypeNode) : factory.createKeywordTypeNode(133 /* SyntaxKind.AnyKeyword */);
        }
        if (node.kind === 177 /* SyntaxKind.SetAccessor */) {
            // Set accessors with no associated type node (from it's param or get accessor return) are `any` since they are never contextually typed right now
            // (The inferred type here will be void, but the old declaration emitter printed `any`, so this replicates that)
            return factory.createKeywordTypeNode(133 /* SyntaxKind.AnyKeyword */);
        }
        errorNameNode = node.name;
        var oldDiag;
        if (!suppressNewDiagnosticContexts) {
            oldDiag = getSymbolAccessibilityDiagnostic;
            getSymbolAccessibilityDiagnostic = (0, ts_1.createGetSymbolAccessibilityDiagnosticForNode)(node);
        }
        if (node.kind === 259 /* SyntaxKind.VariableDeclaration */ || node.kind === 207 /* SyntaxKind.BindingElement */) {
            return cleanup(resolver.createTypeOfDeclaration(node, enclosingDeclaration, declarationEmitNodeBuilderFlags, symbolTracker));
        }
        if (node.kind === 168 /* SyntaxKind.Parameter */
            || node.kind === 171 /* SyntaxKind.PropertyDeclaration */
            || node.kind === 170 /* SyntaxKind.PropertySignature */) {
            if ((0, ts_1.isPropertySignature)(node) || !node.initializer)
                return cleanup(resolver.createTypeOfDeclaration(node, enclosingDeclaration, declarationEmitNodeBuilderFlags, symbolTracker, shouldUseResolverType));
            return cleanup(resolver.createTypeOfDeclaration(node, enclosingDeclaration, declarationEmitNodeBuilderFlags, symbolTracker, shouldUseResolverType) || resolver.createTypeOfExpression(node.initializer, enclosingDeclaration, declarationEmitNodeBuilderFlags, symbolTracker));
        }
        return cleanup(resolver.createReturnTypeOfSignatureDeclaration(node, enclosingDeclaration, declarationEmitNodeBuilderFlags, symbolTracker));
        function cleanup(returnValue) {
            errorNameNode = undefined;
            if (!suppressNewDiagnosticContexts) {
                getSymbolAccessibilityDiagnostic = oldDiag;
            }
            return returnValue || factory.createKeywordTypeNode(133 /* SyntaxKind.AnyKeyword */);
        }
    }
    function isDeclarationAndNotVisible(node) {
        node = (0, ts_1.getParseTreeNode)(node);
        switch (node.kind) {
            case 261 /* SyntaxKind.FunctionDeclaration */:
            case 266 /* SyntaxKind.ModuleDeclaration */:
            case 263 /* SyntaxKind.InterfaceDeclaration */:
            case 262 /* SyntaxKind.ClassDeclaration */:
            case 264 /* SyntaxKind.TypeAliasDeclaration */:
            case 265 /* SyntaxKind.EnumDeclaration */:
                return !resolver.isDeclarationVisible(node);
            // The following should be doing their own visibility checks based on filtering their members
            case 259 /* SyntaxKind.VariableDeclaration */:
                return !getBindingNameVisible(node);
            case 270 /* SyntaxKind.ImportEqualsDeclaration */:
            case 271 /* SyntaxKind.ImportDeclaration */:
            case 277 /* SyntaxKind.ExportDeclaration */:
            case 276 /* SyntaxKind.ExportAssignment */:
                return false;
            case 174 /* SyntaxKind.ClassStaticBlockDeclaration */:
                return true;
        }
        return false;
    }
    // If the ExpandoFunctionDeclaration have multiple overloads, then we only need to emit properties for the last one.
    function shouldEmitFunctionProperties(input) {
        var _a;
        if (input.body) {
            return true;
        }
        var overloadSignatures = (_a = input.symbol.declarations) === null || _a === void 0 ? void 0 : _a.filter(function (decl) { return (0, ts_1.isFunctionDeclaration)(decl) && !decl.body; });
        return !overloadSignatures || overloadSignatures.indexOf(input) === overloadSignatures.length - 1;
    }
    function getBindingNameVisible(elem) {
        if ((0, ts_1.isOmittedExpression)(elem)) {
            return false;
        }
        if ((0, ts_1.isBindingPattern)(elem.name)) {
            // If any child binding pattern element has been marked visible (usually by collect linked aliases), then this is visible
            return (0, ts_1.some)(elem.name.elements, getBindingNameVisible);
        }
        else {
            return resolver.isDeclarationVisible(elem);
        }
    }
    function updateParamsList(node, params, modifierMask) {
        if ((0, ts_1.hasEffectiveModifier)(node, 8 /* ModifierFlags.Private */)) {
            return factory.createNodeArray();
        }
        var newParams = (0, ts_1.map)(params, function (p) { return ensureParameter(p, modifierMask); });
        if (!newParams) {
            return factory.createNodeArray();
        }
        return factory.createNodeArray(newParams, params.hasTrailingComma);
    }
    function updateAccessorParamsList(input, isPrivate) {
        var newParams;
        if (!isPrivate) {
            var thisParameter = (0, ts_1.getThisParameter)(input);
            if (thisParameter) {
                newParams = [ensureParameter(thisParameter)];
            }
        }
        if ((0, ts_1.isSetAccessorDeclaration)(input)) {
            var newValueParameter = void 0;
            if (!isPrivate) {
                var valueParameter = (0, ts_1.getSetAccessorValueParameter)(input);
                if (valueParameter) {
                    var accessorType = getTypeAnnotationFromAllAccessorDeclarations(input, resolver.getAllAccessorDeclarations(input));
                    newValueParameter = ensureParameter(valueParameter, /*modifierMask*/ undefined, accessorType);
                }
            }
            if (!newValueParameter) {
                newValueParameter = factory.createParameterDeclaration(
                /*modifiers*/ undefined, 
                /*dotDotDotToken*/ undefined, "value");
            }
            newParams = (0, ts_1.append)(newParams, newValueParameter);
        }
        return factory.createNodeArray(newParams || ts_1.emptyArray);
    }
    function ensureTypeParams(node, params) {
        return (0, ts_1.hasEffectiveModifier)(node, 8 /* ModifierFlags.Private */) ? undefined : (0, ts_1.visitNodes)(params, visitDeclarationSubtree, ts_1.isTypeParameterDeclaration);
    }
    function isEnclosingDeclaration(node) {
        return (0, ts_1.isSourceFile)(node)
            || (0, ts_1.isTypeAliasDeclaration)(node)
            || (0, ts_1.isModuleDeclaration)(node)
            || (0, ts_1.isClassDeclaration)(node)
            || (0, ts_1.isInterfaceDeclaration)(node)
            || (0, ts_1.isFunctionLike)(node)
            || (0, ts_1.isIndexSignatureDeclaration)(node)
            || (0, ts_1.isMappedTypeNode)(node);
    }
    function checkEntityNameVisibility(entityName, enclosingDeclaration) {
        var visibilityResult = resolver.isEntityNameVisible(entityName, enclosingDeclaration);
        handleSymbolAccessibilityError(visibilityResult);
        recordTypeReferenceDirectivesIfNecessary(resolver.getTypeReferenceDirectivesForEntityName(entityName));
    }
    function preserveJsDoc(updated, original) {
        if ((0, ts_1.hasJSDocNodes)(updated) && (0, ts_1.hasJSDocNodes)(original)) {
            updated.jsDoc = original.jsDoc;
        }
        return (0, ts_1.setCommentRange)(updated, (0, ts_1.getCommentRange)(original));
    }
    function rewriteModuleSpecifier(parent, input) {
        if (!input)
            return undefined; // TODO: GH#18217
        resultHasExternalModuleIndicator = resultHasExternalModuleIndicator || (parent.kind !== 266 /* SyntaxKind.ModuleDeclaration */ && parent.kind !== 204 /* SyntaxKind.ImportType */);
        if ((0, ts_1.isStringLiteralLike)(input)) {
            if (isBundledEmit) {
                var newName = (0, ts_1.getExternalModuleNameFromDeclaration)(context.getEmitHost(), resolver, parent);
                if (newName) {
                    return factory.createStringLiteral(newName);
                }
            }
            else {
                var symbol = resolver.getSymbolOfExternalModuleSpecifier(input);
                if (symbol) {
                    (exportedModulesFromDeclarationEmit || (exportedModulesFromDeclarationEmit = [])).push(symbol);
                }
            }
        }
        return input;
    }
    function transformImportEqualsDeclaration(decl) {
        if (!resolver.isDeclarationVisible(decl))
            return;
        if (decl.moduleReference.kind === 282 /* SyntaxKind.ExternalModuleReference */) {
            // Rewrite external module names if necessary
            var specifier = (0, ts_1.getExternalModuleImportEqualsDeclarationExpression)(decl);
            return factory.updateImportEqualsDeclaration(decl, decl.modifiers, decl.isTypeOnly, decl.name, factory.updateExternalModuleReference(decl.moduleReference, rewriteModuleSpecifier(decl, specifier)));
        }
        else {
            var oldDiag = getSymbolAccessibilityDiagnostic;
            getSymbolAccessibilityDiagnostic = (0, ts_1.createGetSymbolAccessibilityDiagnosticForNode)(decl);
            checkEntityNameVisibility(decl.moduleReference, enclosingDeclaration);
            getSymbolAccessibilityDiagnostic = oldDiag;
            return decl;
        }
    }
    function transformImportDeclaration(decl) {
        if (!decl.importClause) {
            // import "mod" - possibly needed for side effects? (global interface patches, module augmentations, etc)
            return factory.updateImportDeclaration(decl, decl.modifiers, decl.importClause, rewriteModuleSpecifier(decl, decl.moduleSpecifier), getResolutionModeOverrideForClauseInNightly(decl.assertClause));
        }
        // The `importClause` visibility corresponds to the default's visibility.
        var visibleDefaultBinding = decl.importClause && decl.importClause.name && resolver.isDeclarationVisible(decl.importClause) ? decl.importClause.name : undefined;
        if (!decl.importClause.namedBindings) {
            // No named bindings (either namespace or list), meaning the import is just default or should be elided
            return visibleDefaultBinding && factory.updateImportDeclaration(decl, decl.modifiers, factory.updateImportClause(decl.importClause, decl.importClause.isTypeOnly, visibleDefaultBinding, 
            /*namedBindings*/ undefined), rewriteModuleSpecifier(decl, decl.moduleSpecifier), getResolutionModeOverrideForClauseInNightly(decl.assertClause));
        }
        if (decl.importClause.namedBindings.kind === 273 /* SyntaxKind.NamespaceImport */) {
            // Namespace import (optionally with visible default)
            var namedBindings = resolver.isDeclarationVisible(decl.importClause.namedBindings) ? decl.importClause.namedBindings : /*namedBindings*/ undefined;
            return visibleDefaultBinding || namedBindings ? factory.updateImportDeclaration(decl, decl.modifiers, factory.updateImportClause(decl.importClause, decl.importClause.isTypeOnly, visibleDefaultBinding, namedBindings), rewriteModuleSpecifier(decl, decl.moduleSpecifier), getResolutionModeOverrideForClauseInNightly(decl.assertClause)) : undefined;
        }
        // Named imports (optionally with visible default)
        var bindingList = (0, ts_1.mapDefined)(decl.importClause.namedBindings.elements, function (b) { return resolver.isDeclarationVisible(b) ? b : undefined; });
        if ((bindingList && bindingList.length) || visibleDefaultBinding) {
            return factory.updateImportDeclaration(decl, decl.modifiers, factory.updateImportClause(decl.importClause, decl.importClause.isTypeOnly, visibleDefaultBinding, bindingList && bindingList.length ? factory.updateNamedImports(decl.importClause.namedBindings, bindingList) : undefined), rewriteModuleSpecifier(decl, decl.moduleSpecifier), getResolutionModeOverrideForClauseInNightly(decl.assertClause));
        }
        // Augmentation of export depends on import
        if (resolver.isImportRequiredByAugmentation(decl)) {
            return factory.updateImportDeclaration(decl, decl.modifiers, 
            /*importClause*/ undefined, rewriteModuleSpecifier(decl, decl.moduleSpecifier), getResolutionModeOverrideForClauseInNightly(decl.assertClause));
        }
        // Nothing visible
    }
    function getResolutionModeOverrideForClauseInNightly(assertClause) {
        var mode = (0, ts_1.getResolutionModeOverrideForClause)(assertClause);
        if (mode !== undefined) {
            if (!(0, ts_1.isNightly)()) {
                context.addDiagnostic((0, ts_1.createDiagnosticForNode)(assertClause, ts_1.Diagnostics.resolution_mode_assertions_are_unstable_Use_nightly_TypeScript_to_silence_this_error_Try_updating_with_npm_install_D_typescript_next));
            }
            return assertClause;
        }
        return undefined;
    }
    function transformAndReplaceLatePaintedStatements(statements) {
        // This is a `while` loop because `handleSymbolAccessibilityError` can see additional import aliases marked as visible during
        // error handling which must now be included in the output and themselves checked for errors.
        // For example:
        // ```
        // module A {
        //   export module Q {}
        //   import B = Q;
        //   import C = B;
        //   export import D = C;
        // }
        // ```
        // In such a scenario, only Q and D are initially visible, but we don't consider imports as private names - instead we say they if they are referenced they must
        // be recorded. So while checking D's visibility we mark C as visible, then we must check C which in turn marks B, completing the chain of
        // dependent imports and allowing a valid declaration file output. Today, this dependent alias marking only happens for internal import aliases.
        while ((0, ts_1.length)(lateMarkedStatements)) {
            var i = lateMarkedStatements.shift();
            if (!(0, ts_1.isLateVisibilityPaintedStatement)(i)) {
                return ts_1.Debug.fail("Late replaced statement was found which is not handled by the declaration transformer!: ".concat(ts_1.Debug.formatSyntaxKind(i.kind)));
            }
            var priorNeedsDeclare = needsDeclare;
            needsDeclare = i.parent && (0, ts_1.isSourceFile)(i.parent) && !((0, ts_1.isExternalModule)(i.parent) && isBundledEmit);
            var result = transformTopLevelDeclaration(i);
            needsDeclare = priorNeedsDeclare;
            lateStatementReplacementMap.set((0, ts_1.getOriginalNodeId)(i), result);
        }
        // And lastly, we need to get the final form of all those indetermine import declarations from before and add them to the output list
        // (and remove them from the set to examine for outter declarations)
        return (0, ts_1.visitNodes)(statements, visitLateVisibilityMarkedStatements, ts_1.isStatement);
        function visitLateVisibilityMarkedStatements(statement) {
            if ((0, ts_1.isLateVisibilityPaintedStatement)(statement)) {
                var key = (0, ts_1.getOriginalNodeId)(statement);
                if (lateStatementReplacementMap.has(key)) {
                    var result = lateStatementReplacementMap.get(key);
                    lateStatementReplacementMap.delete(key);
                    if (result) {
                        if ((0, ts_1.isArray)(result) ? (0, ts_1.some)(result, ts_1.needsScopeMarker) : (0, ts_1.needsScopeMarker)(result)) {
                            // Top-level declarations in .d.ts files are always considered exported even without a modifier unless there's an export assignment or specifier
                            needsScopeFixMarker = true;
                        }
                        if ((0, ts_1.isSourceFile)(statement.parent) && ((0, ts_1.isArray)(result) ? (0, ts_1.some)(result, ts_1.isExternalModuleIndicator) : (0, ts_1.isExternalModuleIndicator)(result))) {
                            resultHasExternalModuleIndicator = true;
                        }
                    }
                    return result;
                }
            }
            return statement;
        }
    }
    function visitDeclarationSubtree(input) {
        if (shouldStripInternal(input))
            return;
        if ((0, ts_1.isDeclaration)(input)) {
            if (isDeclarationAndNotVisible(input))
                return;
            if ((0, ts_1.hasDynamicName)(input) && !resolver.isLateBound((0, ts_1.getParseTreeNode)(input))) {
                return;
            }
        }
        // Elide implementation signatures from overload sets
        if ((0, ts_1.isFunctionLike)(input) && resolver.isImplementationOfOverload(input))
            return;
        // Elide semicolon class statements
        if ((0, ts_1.isSemicolonClassElement)(input))
            return;
        var previousEnclosingDeclaration;
        if (isEnclosingDeclaration(input)) {
            previousEnclosingDeclaration = enclosingDeclaration;
            enclosingDeclaration = input;
        }
        var oldDiag = getSymbolAccessibilityDiagnostic;
        // Setup diagnostic-related flags before first potential `cleanup` call, otherwise
        // We'd see a TDZ violation at runtime
        var canProduceDiagnostic = (0, ts_1.canProduceDiagnostics)(input);
        var oldWithinObjectLiteralType = suppressNewDiagnosticContexts;
        var shouldEnterSuppressNewDiagnosticsContextContext = ((input.kind === 186 /* SyntaxKind.TypeLiteral */ || input.kind === 199 /* SyntaxKind.MappedType */) && input.parent.kind !== 264 /* SyntaxKind.TypeAliasDeclaration */);
        // Emit methods which are private as properties with no type information
        if ((0, ts_1.isMethodDeclaration)(input) || (0, ts_1.isMethodSignature)(input)) {
            if ((0, ts_1.hasEffectiveModifier)(input, 8 /* ModifierFlags.Private */)) {
                if (input.symbol && input.symbol.declarations && input.symbol.declarations[0] !== input)
                    return; // Elide all but the first overload
                return cleanup(factory.createPropertyDeclaration(ensureModifiers(input), input.name, /*questionOrExclamationToken*/ undefined, /*type*/ undefined, /*initializer*/ undefined));
            }
        }
        if (canProduceDiagnostic && !suppressNewDiagnosticContexts) {
            getSymbolAccessibilityDiagnostic = (0, ts_1.createGetSymbolAccessibilityDiagnosticForNode)(input);
        }
        if ((0, ts_1.isTypeQueryNode)(input)) {
            checkEntityNameVisibility(input.exprName, enclosingDeclaration);
        }
        if (shouldEnterSuppressNewDiagnosticsContextContext) {
            // We stop making new diagnostic contexts within object literal types. Unless it's an object type on the RHS of a type alias declaration. Then we do.
            suppressNewDiagnosticContexts = true;
        }
        if (isProcessedComponent(input)) {
            switch (input.kind) {
                case 232 /* SyntaxKind.ExpressionWithTypeArguments */: {
                    if (((0, ts_1.isEntityName)(input.expression) || (0, ts_1.isEntityNameExpression)(input.expression))) {
                        checkEntityNameVisibility(input.expression, enclosingDeclaration);
                    }
                    var node = (0, ts_1.visitEachChild)(input, visitDeclarationSubtree, context);
                    return cleanup(factory.updateExpressionWithTypeArguments(node, node.expression, node.typeArguments));
                }
                case 182 /* SyntaxKind.TypeReference */: {
                    checkEntityNameVisibility(input.typeName, enclosingDeclaration);
                    var node = (0, ts_1.visitEachChild)(input, visitDeclarationSubtree, context);
                    return cleanup(factory.updateTypeReferenceNode(node, node.typeName, node.typeArguments));
                }
                case 179 /* SyntaxKind.ConstructSignature */:
                    return cleanup(factory.updateConstructSignature(input, ensureTypeParams(input, input.typeParameters), updateParamsList(input, input.parameters), ensureType(input, input.type)));
                case 175 /* SyntaxKind.Constructor */: {
                    // A constructor declaration may not have a type annotation
                    var ctor = factory.createConstructorDeclaration(
                    /*modifiers*/ ensureModifiers(input), updateParamsList(input, input.parameters, 0 /* ModifierFlags.None */), 
                    /*body*/ undefined);
                    return cleanup(ctor);
                }
                case 173 /* SyntaxKind.MethodDeclaration */: {
                    if ((0, ts_1.isPrivateIdentifier)(input.name)) {
                        return cleanup(/*returnValue*/ undefined);
                    }
                    var sig = factory.createMethodDeclaration(ensureModifiers(input), 
                    /*asteriskToken*/ undefined, input.name, input.questionToken, ensureTypeParams(input, input.typeParameters), updateParamsList(input, input.parameters), ensureType(input, input.type), 
                    /*body*/ undefined);
                    return cleanup(sig);
                }
                case 176 /* SyntaxKind.GetAccessor */: {
                    if ((0, ts_1.isPrivateIdentifier)(input.name)) {
                        return cleanup(/*returnValue*/ undefined);
                    }
                    var accessorType = getTypeAnnotationFromAllAccessorDeclarations(input, resolver.getAllAccessorDeclarations(input));
                    return cleanup(factory.updateGetAccessorDeclaration(input, ensureModifiers(input), input.name, updateAccessorParamsList(input, (0, ts_1.hasEffectiveModifier)(input, 8 /* ModifierFlags.Private */)), ensureType(input, accessorType), 
                    /*body*/ undefined));
                }
                case 177 /* SyntaxKind.SetAccessor */: {
                    if ((0, ts_1.isPrivateIdentifier)(input.name)) {
                        return cleanup(/*returnValue*/ undefined);
                    }
                    return cleanup(factory.updateSetAccessorDeclaration(input, ensureModifiers(input), input.name, updateAccessorParamsList(input, (0, ts_1.hasEffectiveModifier)(input, 8 /* ModifierFlags.Private */)), 
                    /*body*/ undefined));
                }
                case 171 /* SyntaxKind.PropertyDeclaration */:
                    if ((0, ts_1.isPrivateIdentifier)(input.name)) {
                        return cleanup(/*returnValue*/ undefined);
                    }
                    return cleanup(factory.updatePropertyDeclaration(input, ensureModifiers(input), input.name, input.questionToken, ensureType(input, input.type), ensureNoInitializer(input)));
                case 170 /* SyntaxKind.PropertySignature */:
                    if ((0, ts_1.isPrivateIdentifier)(input.name)) {
                        return cleanup(/*returnValue*/ undefined);
                    }
                    return cleanup(factory.updatePropertySignature(input, ensureModifiers(input), input.name, input.questionToken, ensureType(input, input.type)));
                case 172 /* SyntaxKind.MethodSignature */: {
                    if ((0, ts_1.isPrivateIdentifier)(input.name)) {
                        return cleanup(/*returnValue*/ undefined);
                    }
                    return cleanup(factory.updateMethodSignature(input, ensureModifiers(input), input.name, input.questionToken, ensureTypeParams(input, input.typeParameters), updateParamsList(input, input.parameters), ensureType(input, input.type)));
                }
                case 178 /* SyntaxKind.CallSignature */: {
                    return cleanup(factory.updateCallSignature(input, ensureTypeParams(input, input.typeParameters), updateParamsList(input, input.parameters), ensureType(input, input.type)));
                }
                case 180 /* SyntaxKind.IndexSignature */: {
                    return cleanup(factory.updateIndexSignature(input, ensureModifiers(input), updateParamsList(input, input.parameters), (0, ts_1.visitNode)(input.type, visitDeclarationSubtree, ts_1.isTypeNode) || factory.createKeywordTypeNode(133 /* SyntaxKind.AnyKeyword */)));
                }
                case 259 /* SyntaxKind.VariableDeclaration */: {
                    if ((0, ts_1.isBindingPattern)(input.name)) {
                        return recreateBindingPattern(input.name);
                    }
                    shouldEnterSuppressNewDiagnosticsContextContext = true;
                    suppressNewDiagnosticContexts = true; // Variable declaration types also suppress new diagnostic contexts, provided the contexts wouldn't be made for binding pattern types
                    return cleanup(factory.updateVariableDeclaration(input, input.name, /*exclamationToken*/ undefined, ensureType(input, input.type), ensureNoInitializer(input)));
                }
                case 167 /* SyntaxKind.TypeParameter */: {
                    if (isPrivateMethodTypeParameter(input) && (input.default || input.constraint)) {
                        return cleanup(factory.updateTypeParameterDeclaration(input, input.modifiers, input.name, /*constraint*/ undefined, /*defaultType*/ undefined));
                    }
                    return cleanup((0, ts_1.visitEachChild)(input, visitDeclarationSubtree, context));
                }
                case 193 /* SyntaxKind.ConditionalType */: {
                    // We have to process conditional types in a special way because for visibility purposes we need to push a new enclosingDeclaration
                    // just for the `infer` types in the true branch. It's an implicit declaration scope that only applies to _part_ of the type.
                    var checkType = (0, ts_1.visitNode)(input.checkType, visitDeclarationSubtree, ts_1.isTypeNode);
                    var extendsType = (0, ts_1.visitNode)(input.extendsType, visitDeclarationSubtree, ts_1.isTypeNode);
                    var oldEnclosingDecl = enclosingDeclaration;
                    enclosingDeclaration = input.trueType;
                    var trueType = (0, ts_1.visitNode)(input.trueType, visitDeclarationSubtree, ts_1.isTypeNode);
                    enclosingDeclaration = oldEnclosingDecl;
                    var falseType = (0, ts_1.visitNode)(input.falseType, visitDeclarationSubtree, ts_1.isTypeNode);
                    ts_1.Debug.assert(checkType);
                    ts_1.Debug.assert(extendsType);
                    ts_1.Debug.assert(trueType);
                    ts_1.Debug.assert(falseType);
                    return cleanup(factory.updateConditionalTypeNode(input, checkType, extendsType, trueType, falseType));
                }
                case 183 /* SyntaxKind.FunctionType */: {
                    return cleanup(factory.updateFunctionTypeNode(input, (0, ts_1.visitNodes)(input.typeParameters, visitDeclarationSubtree, ts_1.isTypeParameterDeclaration), updateParamsList(input, input.parameters), ts_1.Debug.checkDefined((0, ts_1.visitNode)(input.type, visitDeclarationSubtree, ts_1.isTypeNode))));
                }
                case 184 /* SyntaxKind.ConstructorType */: {
                    return cleanup(factory.updateConstructorTypeNode(input, ensureModifiers(input), (0, ts_1.visitNodes)(input.typeParameters, visitDeclarationSubtree, ts_1.isTypeParameterDeclaration), updateParamsList(input, input.parameters), ts_1.Debug.checkDefined((0, ts_1.visitNode)(input.type, visitDeclarationSubtree, ts_1.isTypeNode))));
                }
                case 204 /* SyntaxKind.ImportType */: {
                    if (!(0, ts_1.isLiteralImportTypeNode)(input))
                        return cleanup(input);
                    return cleanup(factory.updateImportTypeNode(input, factory.updateLiteralTypeNode(input.argument, rewriteModuleSpecifier(input, input.argument.literal)), input.assertions, input.qualifier, (0, ts_1.visitNodes)(input.typeArguments, visitDeclarationSubtree, ts_1.isTypeNode), input.isTypeOf));
                }
                default: ts_1.Debug.assertNever(input, "Attempted to process unhandled node kind: ".concat(ts_1.Debug.formatSyntaxKind(input.kind)));
            }
        }
        if ((0, ts_1.isTupleTypeNode)(input) && ((0, ts_1.getLineAndCharacterOfPosition)(currentSourceFile, input.pos).line === (0, ts_1.getLineAndCharacterOfPosition)(currentSourceFile, input.end).line)) {
            (0, ts_1.setEmitFlags)(input, 1 /* EmitFlags.SingleLine */);
        }
        return cleanup((0, ts_1.visitEachChild)(input, visitDeclarationSubtree, context));
        function cleanup(returnValue) {
            if (returnValue && canProduceDiagnostic && (0, ts_1.hasDynamicName)(input)) {
                checkName(input);
            }
            if (isEnclosingDeclaration(input)) {
                enclosingDeclaration = previousEnclosingDeclaration;
            }
            if (canProduceDiagnostic && !suppressNewDiagnosticContexts) {
                getSymbolAccessibilityDiagnostic = oldDiag;
            }
            if (shouldEnterSuppressNewDiagnosticsContextContext) {
                suppressNewDiagnosticContexts = oldWithinObjectLiteralType;
            }
            if (returnValue === input) {
                return returnValue;
            }
            return returnValue && (0, ts_1.setOriginalNode)(preserveJsDoc(returnValue, input), input);
        }
    }
    function isPrivateMethodTypeParameter(node) {
        return node.parent.kind === 173 /* SyntaxKind.MethodDeclaration */ && (0, ts_1.hasEffectiveModifier)(node.parent, 8 /* ModifierFlags.Private */);
    }
    function visitDeclarationStatements(input) {
        if (!isPreservedDeclarationStatement(input)) {
            // return undefined for unmatched kinds to omit them from the tree
            return;
        }
        if (shouldStripInternal(input))
            return;
        switch (input.kind) {
            case 277 /* SyntaxKind.ExportDeclaration */: {
                if ((0, ts_1.isSourceFile)(input.parent)) {
                    resultHasExternalModuleIndicator = true;
                }
                resultHasScopeMarker = true;
                // Always visible if the parent node isn't dropped for being not visible
                // Rewrite external module names if necessary
                return factory.updateExportDeclaration(input, input.modifiers, input.isTypeOnly, input.exportClause, rewriteModuleSpecifier(input, input.moduleSpecifier), (0, ts_1.getResolutionModeOverrideForClause)(input.assertClause) ? input.assertClause : undefined);
            }
            case 276 /* SyntaxKind.ExportAssignment */: {
                // Always visible if the parent node isn't dropped for being not visible
                if ((0, ts_1.isSourceFile)(input.parent)) {
                    resultHasExternalModuleIndicator = true;
                }
                resultHasScopeMarker = true;
                if (input.expression.kind === 80 /* SyntaxKind.Identifier */) {
                    return input;
                }
                else {
                    var newId = factory.createUniqueName("_default", 16 /* GeneratedIdentifierFlags.Optimistic */);
                    getSymbolAccessibilityDiagnostic = function () { return ({
                        diagnosticMessage: ts_1.Diagnostics.Default_export_of_the_module_has_or_is_using_private_name_0,
                        errorNode: input
                    }); };
                    errorFallbackNode = input;
                    var varDecl = factory.createVariableDeclaration(newId, /*exclamationToken*/ undefined, resolver.createTypeOfExpression(input.expression, input, declarationEmitNodeBuilderFlags, symbolTracker), /*initializer*/ undefined);
                    errorFallbackNode = undefined;
                    var statement = factory.createVariableStatement(needsDeclare ? [factory.createModifier(138 /* SyntaxKind.DeclareKeyword */)] : [], factory.createVariableDeclarationList([varDecl], 2 /* NodeFlags.Const */));
                    preserveJsDoc(statement, input);
                    (0, ts_1.removeAllComments)(input);
                    return [statement, factory.updateExportAssignment(input, input.modifiers, newId)];
                }
            }
        }
        var result = transformTopLevelDeclaration(input);
        // Don't actually transform yet; just leave as original node - will be elided/swapped by late pass
        lateStatementReplacementMap.set((0, ts_1.getOriginalNodeId)(input), result);
        return input;
    }
    function stripExportModifiers(statement) {
        if ((0, ts_1.isImportEqualsDeclaration)(statement) || (0, ts_1.hasEffectiveModifier)(statement, 1024 /* ModifierFlags.Default */) || !(0, ts_1.canHaveModifiers)(statement)) {
            // `export import` statements should remain as-is, as imports are _not_ implicitly exported in an ambient namespace
            // Likewise, `export default` classes and the like and just be `default`, so we preserve their `export` modifiers, too
            return statement;
        }
        var modifiers = factory.createModifiersFromModifierFlags((0, ts_1.getEffectiveModifierFlags)(statement) & (258047 /* ModifierFlags.All */ ^ 1 /* ModifierFlags.Export */));
        return factory.updateModifiers(statement, modifiers);
    }
    function transformTopLevelDeclaration(input) {
        if (lateMarkedStatements) {
            while ((0, ts_1.orderedRemoveItem)(lateMarkedStatements, input))
                ;
        }
        if (shouldStripInternal(input))
            return;
        switch (input.kind) {
            case 270 /* SyntaxKind.ImportEqualsDeclaration */: {
                return transformImportEqualsDeclaration(input);
            }
            case 271 /* SyntaxKind.ImportDeclaration */: {
                return transformImportDeclaration(input);
            }
        }
        if ((0, ts_1.isDeclaration)(input) && isDeclarationAndNotVisible(input))
            return;
        // Elide implementation signatures from overload sets
        if ((0, ts_1.isFunctionLike)(input) && resolver.isImplementationOfOverload(input))
            return;
        var previousEnclosingDeclaration;
        if (isEnclosingDeclaration(input)) {
            previousEnclosingDeclaration = enclosingDeclaration;
            enclosingDeclaration = input;
        }
        var canProdiceDiagnostic = (0, ts_1.canProduceDiagnostics)(input);
        var oldDiag = getSymbolAccessibilityDiagnostic;
        if (canProdiceDiagnostic) {
            getSymbolAccessibilityDiagnostic = (0, ts_1.createGetSymbolAccessibilityDiagnosticForNode)(input);
        }
        var previousNeedsDeclare = needsDeclare;
        switch (input.kind) {
            case 264 /* SyntaxKind.TypeAliasDeclaration */: {
                needsDeclare = false;
                var clean = cleanup(factory.updateTypeAliasDeclaration(input, ensureModifiers(input), input.name, (0, ts_1.visitNodes)(input.typeParameters, visitDeclarationSubtree, ts_1.isTypeParameterDeclaration), ts_1.Debug.checkDefined((0, ts_1.visitNode)(input.type, visitDeclarationSubtree, ts_1.isTypeNode))));
                needsDeclare = previousNeedsDeclare;
                return clean;
            }
            case 263 /* SyntaxKind.InterfaceDeclaration */: {
                return cleanup(factory.updateInterfaceDeclaration(input, ensureModifiers(input), input.name, ensureTypeParams(input, input.typeParameters), transformHeritageClauses(input.heritageClauses), (0, ts_1.visitNodes)(input.members, visitDeclarationSubtree, ts_1.isTypeElement)));
            }
            case 261 /* SyntaxKind.FunctionDeclaration */: {
                // Generators lose their generator-ness, excepting their return type
                var clean = cleanup(factory.updateFunctionDeclaration(input, ensureModifiers(input), 
                /*asteriskToken*/ undefined, input.name, ensureTypeParams(input, input.typeParameters), updateParamsList(input, input.parameters), ensureType(input, input.type), 
                /*body*/ undefined));
                if (clean && resolver.isExpandoFunctionDeclaration(input) && shouldEmitFunctionProperties(input)) {
                    var props = resolver.getPropertiesOfContainerFunction(input);
                    // Use parseNodeFactory so it is usable as an enclosing declaration
                    var fakespace_1 = ts_1.parseNodeFactory.createModuleDeclaration(/*modifiers*/ undefined, clean.name || factory.createIdentifier("_default"), factory.createModuleBlock([]), 16 /* NodeFlags.Namespace */);
                    (0, ts_1.setParent)(fakespace_1, enclosingDeclaration);
                    fakespace_1.locals = (0, ts_1.createSymbolTable)(props);
                    fakespace_1.symbol = props[0].parent;
                    var exportMappings_1 = [];
                    var declarations = (0, ts_1.mapDefined)(props, function (p) {
                        if (!p.valueDeclaration || !((0, ts_1.isPropertyAccessExpression)(p.valueDeclaration) || (0, ts_1.isElementAccessExpression)(p.valueDeclaration) || (0, ts_1.isBinaryExpression)(p.valueDeclaration))) {
                            return undefined;
                        }
                        var nameStr = (0, ts_1.unescapeLeadingUnderscores)(p.escapedName);
                        if (!(0, ts_1.isIdentifierText)(nameStr, 99 /* ScriptTarget.ESNext */)) {
                            return undefined; // unique symbol or non-identifier name - omit, since there's no syntax that can preserve it
                        }
                        getSymbolAccessibilityDiagnostic = (0, ts_1.createGetSymbolAccessibilityDiagnosticForNode)(p.valueDeclaration);
                        var type = resolver.createTypeOfDeclaration(p.valueDeclaration, fakespace_1, declarationEmitNodeBuilderFlags, symbolTracker);
                        getSymbolAccessibilityDiagnostic = oldDiag;
                        var isNonContextualKeywordName = (0, ts_1.isStringANonContextualKeyword)(nameStr);
                        var name = isNonContextualKeywordName ? factory.getGeneratedNameForNode(p.valueDeclaration) : factory.createIdentifier(nameStr);
                        if (isNonContextualKeywordName) {
                            exportMappings_1.push([name, nameStr]);
                        }
                        var varDecl = factory.createVariableDeclaration(name, /*exclamationToken*/ undefined, type, /*initializer*/ undefined);
                        return factory.createVariableStatement(isNonContextualKeywordName ? undefined : [factory.createToken(95 /* SyntaxKind.ExportKeyword */)], factory.createVariableDeclarationList([varDecl]));
                    });
                    if (!exportMappings_1.length) {
                        declarations = (0, ts_1.mapDefined)(declarations, function (declaration) { return factory.updateModifiers(declaration, 0 /* ModifierFlags.None */); });
                    }
                    else {
                        declarations.push(factory.createExportDeclaration(
                        /*modifiers*/ undefined, 
                        /*isTypeOnly*/ false, factory.createNamedExports((0, ts_1.map)(exportMappings_1, function (_a) {
                            var gen = _a[0], exp = _a[1];
                            return factory.createExportSpecifier(/*isTypeOnly*/ false, gen, exp);
                        }))));
                    }
                    var namespaceDecl = factory.createModuleDeclaration(ensureModifiers(input), input.name, factory.createModuleBlock(declarations), 16 /* NodeFlags.Namespace */);
                    if (!(0, ts_1.hasEffectiveModifier)(clean, 1024 /* ModifierFlags.Default */)) {
                        return [clean, namespaceDecl];
                    }
                    var modifiers = factory.createModifiersFromModifierFlags(((0, ts_1.getEffectiveModifierFlags)(clean) & ~1025 /* ModifierFlags.ExportDefault */) | 2 /* ModifierFlags.Ambient */);
                    var cleanDeclaration = factory.updateFunctionDeclaration(clean, modifiers, 
                    /*asteriskToken*/ undefined, clean.name, clean.typeParameters, clean.parameters, clean.type, 
                    /*body*/ undefined);
                    var namespaceDeclaration = factory.updateModuleDeclaration(namespaceDecl, modifiers, namespaceDecl.name, namespaceDecl.body);
                    var exportDefaultDeclaration = factory.createExportAssignment(
                    /*modifiers*/ undefined, 
                    /*isExportEquals*/ false, namespaceDecl.name);
                    if ((0, ts_1.isSourceFile)(input.parent)) {
                        resultHasExternalModuleIndicator = true;
                    }
                    resultHasScopeMarker = true;
                    return [cleanDeclaration, namespaceDeclaration, exportDefaultDeclaration];
                }
                else {
                    return clean;
                }
            }
            case 266 /* SyntaxKind.ModuleDeclaration */: {
                needsDeclare = false;
                var inner = input.body;
                if (inner && inner.kind === 267 /* SyntaxKind.ModuleBlock */) {
                    var oldNeedsScopeFix = needsScopeFixMarker;
                    var oldHasScopeFix = resultHasScopeMarker;
                    resultHasScopeMarker = false;
                    needsScopeFixMarker = false;
                    var statements = (0, ts_1.visitNodes)(inner.statements, visitDeclarationStatements, ts_1.isStatement);
                    var lateStatements = transformAndReplaceLatePaintedStatements(statements);
                    if (input.flags & 16777216 /* NodeFlags.Ambient */) {
                        needsScopeFixMarker = false; // If it was `declare`'d everything is implicitly exported already, ignore late printed "privates"
                    }
                    // With the final list of statements, there are 3 possibilities:
                    // 1. There's an export assignment or export declaration in the namespace - do nothing
                    // 2. Everything is exported and there are no export assignments or export declarations - strip all export modifiers
                    // 3. Some things are exported, some are not, and there's no marker - add an empty marker
                    if (!(0, ts_1.isGlobalScopeAugmentation)(input) && !hasScopeMarker(lateStatements) && !resultHasScopeMarker) {
                        if (needsScopeFixMarker) {
                            lateStatements = factory.createNodeArray(__spreadArray(__spreadArray([], lateStatements, true), [(0, ts_1.createEmptyExports)(factory)], false));
                        }
                        else {
                            lateStatements = (0, ts_1.visitNodes)(lateStatements, stripExportModifiers, ts_1.isStatement);
                        }
                    }
                    var body = factory.updateModuleBlock(inner, lateStatements);
                    needsDeclare = previousNeedsDeclare;
                    needsScopeFixMarker = oldNeedsScopeFix;
                    resultHasScopeMarker = oldHasScopeFix;
                    var mods = ensureModifiers(input);
                    return cleanup(factory.updateModuleDeclaration(input, mods, (0, ts_1.isExternalModuleAugmentation)(input) ? rewriteModuleSpecifier(input, input.name) : input.name, body));
                }
                else {
                    needsDeclare = previousNeedsDeclare;
                    var mods = ensureModifiers(input);
                    needsDeclare = false;
                    (0, ts_1.visitNode)(inner, visitDeclarationStatements);
                    // eagerly transform nested namespaces (the nesting doesn't need any elision or painting done)
                    var id = (0, ts_1.getOriginalNodeId)(inner); // TODO: GH#18217
                    var body = lateStatementReplacementMap.get(id);
                    lateStatementReplacementMap.delete(id);
                    return cleanup(factory.updateModuleDeclaration(input, mods, input.name, body));
                }
            }
            case 262 /* SyntaxKind.ClassDeclaration */: {
                errorNameNode = input.name;
                errorFallbackNode = input;
                var modifiers = factory.createNodeArray(ensureModifiers(input));
                var typeParameters = ensureTypeParams(input, input.typeParameters);
                var ctor = (0, ts_1.getFirstConstructorWithBody)(input);
                var parameterProperties = void 0;
                if (ctor) {
                    var oldDiag_1 = getSymbolAccessibilityDiagnostic;
                    parameterProperties = (0, ts_1.compact)((0, ts_1.flatMap)(ctor.parameters, function (param) {
                        if (!(0, ts_1.hasSyntacticModifier)(param, 16476 /* ModifierFlags.ParameterPropertyModifier */) || shouldStripInternal(param))
                            return;
                        getSymbolAccessibilityDiagnostic = (0, ts_1.createGetSymbolAccessibilityDiagnosticForNode)(param);
                        if (param.name.kind === 80 /* SyntaxKind.Identifier */) {
                            return preserveJsDoc(factory.createPropertyDeclaration(ensureModifiers(param), param.name, param.questionToken, ensureType(param, param.type), ensureNoInitializer(param)), param);
                        }
                        else {
                            // Pattern - this is currently an error, but we emit declarations for it somewhat correctly
                            return walkBindingPattern(param.name);
                        }
                        function walkBindingPattern(pattern) {
                            var elems;
                            for (var _i = 0, _a = pattern.elements; _i < _a.length; _i++) {
                                var elem = _a[_i];
                                if ((0, ts_1.isOmittedExpression)(elem))
                                    continue;
                                if ((0, ts_1.isBindingPattern)(elem.name)) {
                                    elems = (0, ts_1.concatenate)(elems, walkBindingPattern(elem.name));
                                }
                                elems = elems || [];
                                elems.push(factory.createPropertyDeclaration(ensureModifiers(param), elem.name, 
                                /*questionOrExclamationToken*/ undefined, ensureType(elem, /*type*/ undefined), 
                                /*initializer*/ undefined));
                            }
                            return elems;
                        }
                    }));
                    getSymbolAccessibilityDiagnostic = oldDiag_1;
                }
                var hasPrivateIdentifier = (0, ts_1.some)(input.members, function (member) { return !!member.name && (0, ts_1.isPrivateIdentifier)(member.name); });
                // When the class has at least one private identifier, create a unique constant identifier to retain the nominal typing behavior
                // Prevents other classes with the same public members from being used in place of the current class
                var privateIdentifier = hasPrivateIdentifier ? [
                    factory.createPropertyDeclaration(
                    /*modifiers*/ undefined, factory.createPrivateIdentifier("#private"), 
                    /*questionOrExclamationToken*/ undefined, 
                    /*type*/ undefined, 
                    /*initializer*/ undefined)
                ] : undefined;
                var memberNodes = (0, ts_1.concatenate)((0, ts_1.concatenate)(privateIdentifier, parameterProperties), (0, ts_1.visitNodes)(input.members, visitDeclarationSubtree, ts_1.isClassElement));
                var members = factory.createNodeArray(memberNodes);
                var extendsClause_1 = (0, ts_1.getEffectiveBaseTypeNode)(input);
                if (extendsClause_1 && !(0, ts_1.isEntityNameExpression)(extendsClause_1.expression) && extendsClause_1.expression.kind !== 106 /* SyntaxKind.NullKeyword */) {
                    // We must add a temporary declaration for the extends clause expression
                    var oldId = input.name ? (0, ts_1.unescapeLeadingUnderscores)(input.name.escapedText) : "default";
                    var newId_1 = factory.createUniqueName("".concat(oldId, "_base"), 16 /* GeneratedIdentifierFlags.Optimistic */);
                    getSymbolAccessibilityDiagnostic = function () { return ({
                        diagnosticMessage: ts_1.Diagnostics.extends_clause_of_exported_class_0_has_or_is_using_private_name_1,
                        errorNode: extendsClause_1,
                        typeName: input.name
                    }); };
                    var varDecl = factory.createVariableDeclaration(newId_1, /*exclamationToken*/ undefined, resolver.createTypeOfExpression(extendsClause_1.expression, input, declarationEmitNodeBuilderFlags, symbolTracker), /*initializer*/ undefined);
                    var statement = factory.createVariableStatement(needsDeclare ? [factory.createModifier(138 /* SyntaxKind.DeclareKeyword */)] : [], factory.createVariableDeclarationList([varDecl], 2 /* NodeFlags.Const */));
                    var heritageClauses = factory.createNodeArray((0, ts_1.map)(input.heritageClauses, function (clause) {
                        if (clause.token === 96 /* SyntaxKind.ExtendsKeyword */) {
                            var oldDiag_2 = getSymbolAccessibilityDiagnostic;
                            getSymbolAccessibilityDiagnostic = (0, ts_1.createGetSymbolAccessibilityDiagnosticForNode)(clause.types[0]);
                            var newClause = factory.updateHeritageClause(clause, (0, ts_1.map)(clause.types, function (t) { return factory.updateExpressionWithTypeArguments(t, newId_1, (0, ts_1.visitNodes)(t.typeArguments, visitDeclarationSubtree, ts_1.isTypeNode)); }));
                            getSymbolAccessibilityDiagnostic = oldDiag_2;
                            return newClause;
                        }
                        return factory.updateHeritageClause(clause, (0, ts_1.visitNodes)(factory.createNodeArray((0, ts_1.filter)(clause.types, function (t) { return (0, ts_1.isEntityNameExpression)(t.expression) || t.expression.kind === 106 /* SyntaxKind.NullKeyword */; })), visitDeclarationSubtree, ts_1.isExpressionWithTypeArguments));
                    }));
                    return [statement, cleanup(factory.updateClassDeclaration(input, modifiers, input.name, typeParameters, heritageClauses, members))]; // TODO: GH#18217
                }
                else {
                    var heritageClauses = transformHeritageClauses(input.heritageClauses);
                    return cleanup(factory.updateClassDeclaration(input, modifiers, input.name, typeParameters, heritageClauses, members));
                }
            }
            case 242 /* SyntaxKind.VariableStatement */: {
                return cleanup(transformVariableStatement(input));
            }
            case 265 /* SyntaxKind.EnumDeclaration */: {
                return cleanup(factory.updateEnumDeclaration(input, factory.createNodeArray(ensureModifiers(input)), input.name, factory.createNodeArray((0, ts_1.mapDefined)(input.members, function (m) {
                    if (shouldStripInternal(m))
                        return;
                    // Rewrite enum values to their constants, if available
                    var constValue = resolver.getConstantValue(m);
                    return preserveJsDoc(factory.updateEnumMember(m, m.name, constValue !== undefined ? typeof constValue === "string" ? factory.createStringLiteral(constValue) : factory.createNumericLiteral(constValue) : undefined), m);
                }))));
            }
        }
        // Anything left unhandled is an error, so this should be unreachable
        return ts_1.Debug.assertNever(input, "Unhandled top-level node in declaration emit: ".concat(ts_1.Debug.formatSyntaxKind(input.kind)));
        function cleanup(node) {
            if (isEnclosingDeclaration(input)) {
                enclosingDeclaration = previousEnclosingDeclaration;
            }
            if (canProdiceDiagnostic) {
                getSymbolAccessibilityDiagnostic = oldDiag;
            }
            if (input.kind === 266 /* SyntaxKind.ModuleDeclaration */) {
                needsDeclare = previousNeedsDeclare;
            }
            if (node === input) {
                return node;
            }
            errorFallbackNode = undefined;
            errorNameNode = undefined;
            return node && (0, ts_1.setOriginalNode)(preserveJsDoc(node, input), input);
        }
    }
    function transformVariableStatement(input) {
        if (!(0, ts_1.forEach)(input.declarationList.declarations, getBindingNameVisible))
            return;
        var nodes = (0, ts_1.visitNodes)(input.declarationList.declarations, visitDeclarationSubtree, ts_1.isVariableDeclaration);
        if (!(0, ts_1.length)(nodes))
            return;
        return factory.updateVariableStatement(input, factory.createNodeArray(ensureModifiers(input)), factory.updateVariableDeclarationList(input.declarationList, nodes));
    }
    function recreateBindingPattern(d) {
        return (0, ts_1.flatten)((0, ts_1.mapDefined)(d.elements, function (e) { return recreateBindingElement(e); }));
    }
    function recreateBindingElement(e) {
        if (e.kind === 231 /* SyntaxKind.OmittedExpression */) {
            return;
        }
        if (e.name) {
            if (!getBindingNameVisible(e))
                return;
            if ((0, ts_1.isBindingPattern)(e.name)) {
                return recreateBindingPattern(e.name);
            }
            else {
                return factory.createVariableDeclaration(e.name, /*exclamationToken*/ undefined, ensureType(e, /*type*/ undefined), /*initializer*/ undefined);
            }
        }
    }
    function checkName(node) {
        var oldDiag;
        if (!suppressNewDiagnosticContexts) {
            oldDiag = getSymbolAccessibilityDiagnostic;
            getSymbolAccessibilityDiagnostic = (0, ts_1.createGetSymbolAccessibilityDiagnosticForNodeName)(node);
        }
        errorNameNode = node.name;
        ts_1.Debug.assert(resolver.isLateBound((0, ts_1.getParseTreeNode)(node))); // Should only be called with dynamic names
        var decl = node;
        var entityName = decl.name.expression;
        checkEntityNameVisibility(entityName, enclosingDeclaration);
        if (!suppressNewDiagnosticContexts) {
            getSymbolAccessibilityDiagnostic = oldDiag;
        }
        errorNameNode = undefined;
    }
    function shouldStripInternal(node) {
        return !!stripInternal && !!node && isInternalDeclaration(node, currentSourceFile);
    }
    function isScopeMarker(node) {
        return (0, ts_1.isExportAssignment)(node) || (0, ts_1.isExportDeclaration)(node);
    }
    function hasScopeMarker(statements) {
        return (0, ts_1.some)(statements, isScopeMarker);
    }
    function ensureModifiers(node) {
        var currentFlags = (0, ts_1.getEffectiveModifierFlags)(node);
        var newFlags = ensureModifierFlags(node);
        if (currentFlags === newFlags) {
            return (0, ts_1.visitArray)(node.modifiers, function (n) { return (0, ts_1.tryCast)(n, ts_1.isModifier); }, ts_1.isModifier);
        }
        return factory.createModifiersFromModifierFlags(newFlags);
    }
    function ensureModifierFlags(node) {
        var mask = 258047 /* ModifierFlags.All */ ^ (4 /* ModifierFlags.Public */ | 512 /* ModifierFlags.Async */ | 16384 /* ModifierFlags.Override */); // No async and override modifiers in declaration files
        var additions = (needsDeclare && !isAlwaysType(node)) ? 2 /* ModifierFlags.Ambient */ : 0 /* ModifierFlags.None */;
        var parentIsFile = node.parent.kind === 311 /* SyntaxKind.SourceFile */;
        if (!parentIsFile || (isBundledEmit && parentIsFile && (0, ts_1.isExternalModule)(node.parent))) {
            mask ^= 2 /* ModifierFlags.Ambient */;
            additions = 0 /* ModifierFlags.None */;
        }
        return maskModifierFlags(node, mask, additions);
    }
    function getTypeAnnotationFromAllAccessorDeclarations(node, accessors) {
        var accessorType = getTypeAnnotationFromAccessor(node);
        if (!accessorType && node !== accessors.firstAccessor) {
            accessorType = getTypeAnnotationFromAccessor(accessors.firstAccessor);
            // If we end up pulling the type from the second accessor, we also need to change the diagnostic context to get the expected error message
            getSymbolAccessibilityDiagnostic = (0, ts_1.createGetSymbolAccessibilityDiagnosticForNode)(accessors.firstAccessor);
        }
        if (!accessorType && accessors.secondAccessor && node !== accessors.secondAccessor) {
            accessorType = getTypeAnnotationFromAccessor(accessors.secondAccessor);
            // If we end up pulling the type from the second accessor, we also need to change the diagnostic context to get the expected error message
            getSymbolAccessibilityDiagnostic = (0, ts_1.createGetSymbolAccessibilityDiagnosticForNode)(accessors.secondAccessor);
        }
        return accessorType;
    }
    function transformHeritageClauses(nodes) {
        return factory.createNodeArray((0, ts_1.filter)((0, ts_1.map)(nodes, function (clause) { return factory.updateHeritageClause(clause, (0, ts_1.visitNodes)(factory.createNodeArray((0, ts_1.filter)(clause.types, function (t) {
            return (0, ts_1.isEntityNameExpression)(t.expression) || (clause.token === 96 /* SyntaxKind.ExtendsKeyword */ && t.expression.kind === 106 /* SyntaxKind.NullKeyword */);
        })), visitDeclarationSubtree, ts_1.isExpressionWithTypeArguments)); }), function (clause) { return clause.types && !!clause.types.length; }));
    }
}
exports.transformDeclarations = transformDeclarations;
function isAlwaysType(node) {
    if (node.kind === 263 /* SyntaxKind.InterfaceDeclaration */) {
        return true;
    }
    return false;
}
// Elide "public" modifier, as it is the default
function maskModifiers(factory, node, modifierMask, modifierAdditions) {
    return factory.createModifiersFromModifierFlags(maskModifierFlags(node, modifierMask, modifierAdditions));
}
function maskModifierFlags(node, modifierMask, modifierAdditions) {
    if (modifierMask === void 0) { modifierMask = 258047 /* ModifierFlags.All */ ^ 4 /* ModifierFlags.Public */; }
    if (modifierAdditions === void 0) { modifierAdditions = 0 /* ModifierFlags.None */; }
    var flags = ((0, ts_1.getEffectiveModifierFlags)(node) & modifierMask) | modifierAdditions;
    if (flags & 1024 /* ModifierFlags.Default */ && !(flags & 1 /* ModifierFlags.Export */)) {
        // A non-exported default is a nonsequitor - we usually try to remove all export modifiers
        // from statements in ambient declarations; but a default export must retain its export modifier to be syntactically valid
        flags ^= 1 /* ModifierFlags.Export */;
    }
    if (flags & 1024 /* ModifierFlags.Default */ && flags & 2 /* ModifierFlags.Ambient */) {
        flags ^= 2 /* ModifierFlags.Ambient */; // `declare` is never required alongside `default` (and would be an error if printed)
    }
    return flags;
}
function getTypeAnnotationFromAccessor(accessor) {
    if (accessor) {
        return accessor.kind === 176 /* SyntaxKind.GetAccessor */
            ? accessor.type // Getter - return type
            : accessor.parameters.length > 0
                ? accessor.parameters[0].type // Setter parameter type
                : undefined;
    }
}
function canHaveLiteralInitializer(node) {
    switch (node.kind) {
        case 171 /* SyntaxKind.PropertyDeclaration */:
        case 170 /* SyntaxKind.PropertySignature */:
            return !(0, ts_1.hasEffectiveModifier)(node, 8 /* ModifierFlags.Private */);
        case 168 /* SyntaxKind.Parameter */:
        case 259 /* SyntaxKind.VariableDeclaration */:
            return true;
    }
    return false;
}
function isPreservedDeclarationStatement(node) {
    switch (node.kind) {
        case 261 /* SyntaxKind.FunctionDeclaration */:
        case 266 /* SyntaxKind.ModuleDeclaration */:
        case 270 /* SyntaxKind.ImportEqualsDeclaration */:
        case 263 /* SyntaxKind.InterfaceDeclaration */:
        case 262 /* SyntaxKind.ClassDeclaration */:
        case 264 /* SyntaxKind.TypeAliasDeclaration */:
        case 265 /* SyntaxKind.EnumDeclaration */:
        case 242 /* SyntaxKind.VariableStatement */:
        case 271 /* SyntaxKind.ImportDeclaration */:
        case 277 /* SyntaxKind.ExportDeclaration */:
        case 276 /* SyntaxKind.ExportAssignment */:
            return true;
    }
    return false;
}
function isProcessedComponent(node) {
    switch (node.kind) {
        case 179 /* SyntaxKind.ConstructSignature */:
        case 175 /* SyntaxKind.Constructor */:
        case 173 /* SyntaxKind.MethodDeclaration */:
        case 176 /* SyntaxKind.GetAccessor */:
        case 177 /* SyntaxKind.SetAccessor */:
        case 171 /* SyntaxKind.PropertyDeclaration */:
        case 170 /* SyntaxKind.PropertySignature */:
        case 172 /* SyntaxKind.MethodSignature */:
        case 178 /* SyntaxKind.CallSignature */:
        case 180 /* SyntaxKind.IndexSignature */:
        case 259 /* SyntaxKind.VariableDeclaration */:
        case 167 /* SyntaxKind.TypeParameter */:
        case 232 /* SyntaxKind.ExpressionWithTypeArguments */:
        case 182 /* SyntaxKind.TypeReference */:
        case 193 /* SyntaxKind.ConditionalType */:
        case 183 /* SyntaxKind.FunctionType */:
        case 184 /* SyntaxKind.ConstructorType */:
        case 204 /* SyntaxKind.ImportType */:
            return true;
    }
    return false;
}
