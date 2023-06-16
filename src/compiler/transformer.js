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
exports.nullTransformationContext = exports.transformNodes = exports.noEmitNotification = exports.noEmitSubstitution = exports.getTransformers = exports.noTransformers = void 0;
var ts_1 = require("./_namespaces/ts");
var performance = require("./_namespaces/ts.performance");
function getModuleTransformer(moduleKind) {
    switch (moduleKind) {
        case ts_1.ModuleKind.ESNext:
        case ts_1.ModuleKind.ES2022:
        case ts_1.ModuleKind.ES2020:
        case ts_1.ModuleKind.ES2015:
            return ts_1.transformECMAScriptModule;
        case ts_1.ModuleKind.System:
            return ts_1.transformSystemModule;
        case ts_1.ModuleKind.Node16:
        case ts_1.ModuleKind.NodeNext:
            return ts_1.transformNodeModule;
        default:
            return ts_1.transformModule;
    }
}
/** @internal */
exports.noTransformers = { scriptTransformers: ts_1.emptyArray, declarationTransformers: ts_1.emptyArray };
/** @internal */
function getTransformers(compilerOptions, customTransformers, emitOnly) {
    return {
        scriptTransformers: getScriptTransformers(compilerOptions, customTransformers, emitOnly),
        declarationTransformers: getDeclarationTransformers(customTransformers),
    };
}
exports.getTransformers = getTransformers;
function getScriptTransformers(compilerOptions, customTransformers, emitOnly) {
    if (emitOnly)
        return ts_1.emptyArray;
    var languageVersion = (0, ts_1.getEmitScriptTarget)(compilerOptions);
    var moduleKind = (0, ts_1.getEmitModuleKind)(compilerOptions);
    var useDefineForClassFields = (0, ts_1.getUseDefineForClassFields)(compilerOptions);
    var transformers = [];
    (0, ts_1.addRange)(transformers, customTransformers && (0, ts_1.map)(customTransformers.before, wrapScriptTransformerFactory));
    transformers.push(ts_1.transformTypeScript);
    if (compilerOptions.experimentalDecorators) {
        transformers.push(ts_1.transformLegacyDecorators);
    }
    else if (languageVersion < 99 /* ScriptTarget.ESNext */ || !useDefineForClassFields) {
        transformers.push(ts_1.transformESDecorators);
    }
    transformers.push(ts_1.transformClassFields);
    if ((0, ts_1.getJSXTransformEnabled)(compilerOptions)) {
        transformers.push(ts_1.transformJsx);
    }
    if (languageVersion < 99 /* ScriptTarget.ESNext */) {
        transformers.push(ts_1.transformESNext);
    }
    if (languageVersion < 8 /* ScriptTarget.ES2021 */) {
        transformers.push(ts_1.transformES2021);
    }
    if (languageVersion < 7 /* ScriptTarget.ES2020 */) {
        transformers.push(ts_1.transformES2020);
    }
    if (languageVersion < 6 /* ScriptTarget.ES2019 */) {
        transformers.push(ts_1.transformES2019);
    }
    if (languageVersion < 5 /* ScriptTarget.ES2018 */) {
        transformers.push(ts_1.transformES2018);
    }
    if (languageVersion < 4 /* ScriptTarget.ES2017 */) {
        transformers.push(ts_1.transformES2017);
    }
    if (languageVersion < 3 /* ScriptTarget.ES2016 */) {
        transformers.push(ts_1.transformES2016);
    }
    if (languageVersion < 2 /* ScriptTarget.ES2015 */) {
        transformers.push(ts_1.transformES2015);
        transformers.push(ts_1.transformGenerators);
    }
    transformers.push(getModuleTransformer(moduleKind));
    // The ES5 transformer is last so that it can substitute expressions like `exports.default`
    // for ES3.
    if (languageVersion < 1 /* ScriptTarget.ES5 */) {
        transformers.push(ts_1.transformES5);
    }
    (0, ts_1.addRange)(transformers, customTransformers && (0, ts_1.map)(customTransformers.after, wrapScriptTransformerFactory));
    return transformers;
}
function getDeclarationTransformers(customTransformers) {
    var transformers = [];
    transformers.push(ts_1.transformDeclarations);
    (0, ts_1.addRange)(transformers, customTransformers && (0, ts_1.map)(customTransformers.afterDeclarations, wrapDeclarationTransformerFactory));
    return transformers;
}
/**
 * Wrap a custom script or declaration transformer object in a `Transformer` callback with fallback support for transforming bundles.
 */
function wrapCustomTransformer(transformer) {
    return function (node) { return (0, ts_1.isBundle)(node) ? transformer.transformBundle(node) : transformer.transformSourceFile(node); };
}
/**
 * Wrap a transformer factory that may return a custom script or declaration transformer object.
 */
function wrapCustomTransformerFactory(transformer, handleDefault) {
    return function (context) {
        var customTransformer = transformer(context);
        return typeof customTransformer === "function"
            ? handleDefault(context, customTransformer)
            : wrapCustomTransformer(customTransformer);
    };
}
function wrapScriptTransformerFactory(transformer) {
    return wrapCustomTransformerFactory(transformer, ts_1.chainBundle);
}
function wrapDeclarationTransformerFactory(transformer) {
    return wrapCustomTransformerFactory(transformer, function (_, node) { return node; });
}
/** @internal */
function noEmitSubstitution(_hint, node) {
    return node;
}
exports.noEmitSubstitution = noEmitSubstitution;
/** @internal */
function noEmitNotification(hint, node, callback) {
    callback(hint, node);
}
exports.noEmitNotification = noEmitNotification;
/**
 * Transforms an array of SourceFiles by passing them through each transformer.
 *
 * @param resolver The emit resolver provided by the checker.
 * @param host The emit host object used to interact with the file system.
 * @param options Compiler options to surface in the `TransformationContext`.
 * @param nodes An array of nodes to transform.
 * @param transforms An array of `TransformerFactory` callbacks.
 * @param allowDtsFiles A value indicating whether to allow the transformation of .d.ts files.
 *
 * @internal
 */
function transformNodes(resolver, host, factory, options, nodes, transformers, allowDtsFiles) {
    var enabledSyntaxKindFeatures = new Array(362 /* SyntaxKind.Count */);
    var lexicalEnvironmentVariableDeclarations;
    var lexicalEnvironmentFunctionDeclarations;
    var lexicalEnvironmentStatements;
    var lexicalEnvironmentFlags = 0 /* LexicalEnvironmentFlags.None */;
    var lexicalEnvironmentVariableDeclarationsStack = [];
    var lexicalEnvironmentFunctionDeclarationsStack = [];
    var lexicalEnvironmentStatementsStack = [];
    var lexicalEnvironmentFlagsStack = [];
    var lexicalEnvironmentStackOffset = 0;
    var lexicalEnvironmentSuspended = false;
    var blockScopedVariableDeclarationsStack = [];
    var blockScopeStackOffset = 0;
    var blockScopedVariableDeclarations;
    var emitHelpers;
    var onSubstituteNode = noEmitSubstitution;
    var onEmitNode = noEmitNotification;
    var state = 0 /* TransformationState.Uninitialized */;
    var diagnostics = [];
    // The transformation context is provided to each transformer as part of transformer
    // initialization.
    var context = {
        factory: factory,
        getCompilerOptions: function () { return options; },
        getEmitResolver: function () { return resolver; },
        getEmitHost: function () { return host; },
        getEmitHelperFactory: (0, ts_1.memoize)(function () { return (0, ts_1.createEmitHelperFactory)(context); }),
        startLexicalEnvironment: startLexicalEnvironment,
        suspendLexicalEnvironment: suspendLexicalEnvironment,
        resumeLexicalEnvironment: resumeLexicalEnvironment,
        endLexicalEnvironment: endLexicalEnvironment,
        setLexicalEnvironmentFlags: setLexicalEnvironmentFlags,
        getLexicalEnvironmentFlags: getLexicalEnvironmentFlags,
        hoistVariableDeclaration: hoistVariableDeclaration,
        hoistFunctionDeclaration: hoistFunctionDeclaration,
        addInitializationStatement: addInitializationStatement,
        startBlockScope: startBlockScope,
        endBlockScope: endBlockScope,
        addBlockScopedVariable: addBlockScopedVariable,
        requestEmitHelper: requestEmitHelper,
        readEmitHelpers: readEmitHelpers,
        enableSubstitution: enableSubstitution,
        enableEmitNotification: enableEmitNotification,
        isSubstitutionEnabled: isSubstitutionEnabled,
        isEmitNotificationEnabled: isEmitNotificationEnabled,
        get onSubstituteNode() { return onSubstituteNode; },
        set onSubstituteNode(value) {
            ts_1.Debug.assert(state < 1 /* TransformationState.Initialized */, "Cannot modify transformation hooks after initialization has completed.");
            ts_1.Debug.assert(value !== undefined, "Value must not be 'undefined'");
            onSubstituteNode = value;
        },
        get onEmitNode() { return onEmitNode; },
        set onEmitNode(value) {
            ts_1.Debug.assert(state < 1 /* TransformationState.Initialized */, "Cannot modify transformation hooks after initialization has completed.");
            ts_1.Debug.assert(value !== undefined, "Value must not be 'undefined'");
            onEmitNode = value;
        },
        addDiagnostic: function (diag) {
            diagnostics.push(diag);
        }
    };
    // Ensure the parse tree is clean before applying transformations
    for (var _i = 0, nodes_1 = nodes; _i < nodes_1.length; _i++) {
        var node = nodes_1[_i];
        (0, ts_1.disposeEmitNodes)((0, ts_1.getSourceFileOfNode)((0, ts_1.getParseTreeNode)(node)));
    }
    performance.mark("beforeTransform");
    // Chain together and initialize each transformer.
    var transformersWithContext = transformers.map(function (t) { return t(context); });
    var transformation = function (node) {
        for (var _i = 0, transformersWithContext_1 = transformersWithContext; _i < transformersWithContext_1.length; _i++) {
            var transform = transformersWithContext_1[_i];
            node = transform(node);
        }
        return node;
    };
    // prevent modification of transformation hooks.
    state = 1 /* TransformationState.Initialized */;
    // Transform each node.
    var transformed = [];
    for (var _a = 0, nodes_2 = nodes; _a < nodes_2.length; _a++) {
        var node = nodes_2[_a];
        ts_1.tracing === null || ts_1.tracing === void 0 ? void 0 : ts_1.tracing.push("emit" /* tracing.Phase.Emit */, "transformNodes", node.kind === 311 /* SyntaxKind.SourceFile */ ? { path: node.path } : { kind: node.kind, pos: node.pos, end: node.end });
        transformed.push((allowDtsFiles ? transformation : transformRoot)(node));
        ts_1.tracing === null || ts_1.tracing === void 0 ? void 0 : ts_1.tracing.pop();
    }
    // prevent modification of the lexical environment.
    state = 2 /* TransformationState.Completed */;
    performance.mark("afterTransform");
    performance.measure("transformTime", "beforeTransform", "afterTransform");
    return {
        transformed: transformed,
        substituteNode: substituteNode,
        emitNodeWithNotification: emitNodeWithNotification,
        isEmitNotificationEnabled: isEmitNotificationEnabled,
        dispose: dispose,
        diagnostics: diagnostics
    };
    function transformRoot(node) {
        return node && (!(0, ts_1.isSourceFile)(node) || !node.isDeclarationFile) ? transformation(node) : node;
    }
    /**
     * Enables expression substitutions in the pretty printer for the provided SyntaxKind.
     */
    function enableSubstitution(kind) {
        ts_1.Debug.assert(state < 2 /* TransformationState.Completed */, "Cannot modify the transformation context after transformation has completed.");
        enabledSyntaxKindFeatures[kind] |= 1 /* SyntaxKindFeatureFlags.Substitution */;
    }
    /**
     * Determines whether expression substitutions are enabled for the provided node.
     */
    function isSubstitutionEnabled(node) {
        return (enabledSyntaxKindFeatures[node.kind] & 1 /* SyntaxKindFeatureFlags.Substitution */) !== 0
            && ((0, ts_1.getEmitFlags)(node) & 8 /* EmitFlags.NoSubstitution */) === 0;
    }
    /**
     * Emits a node with possible substitution.
     *
     * @param hint A hint as to the intended usage of the node.
     * @param node The node to emit.
     * @param emitCallback The callback used to emit the node or its substitute.
     */
    function substituteNode(hint, node) {
        ts_1.Debug.assert(state < 3 /* TransformationState.Disposed */, "Cannot substitute a node after the result is disposed.");
        return node && isSubstitutionEnabled(node) && onSubstituteNode(hint, node) || node;
    }
    /**
     * Enables before/after emit notifications in the pretty printer for the provided SyntaxKind.
     */
    function enableEmitNotification(kind) {
        ts_1.Debug.assert(state < 2 /* TransformationState.Completed */, "Cannot modify the transformation context after transformation has completed.");
        enabledSyntaxKindFeatures[kind] |= 2 /* SyntaxKindFeatureFlags.EmitNotifications */;
    }
    /**
     * Determines whether before/after emit notifications should be raised in the pretty
     * printer when it emits a node.
     */
    function isEmitNotificationEnabled(node) {
        return (enabledSyntaxKindFeatures[node.kind] & 2 /* SyntaxKindFeatureFlags.EmitNotifications */) !== 0
            || ((0, ts_1.getEmitFlags)(node) & 4 /* EmitFlags.AdviseOnEmitNode */) !== 0;
    }
    /**
     * Emits a node with possible emit notification.
     *
     * @param hint A hint as to the intended usage of the node.
     * @param node The node to emit.
     * @param emitCallback The callback used to emit the node.
     */
    function emitNodeWithNotification(hint, node, emitCallback) {
        ts_1.Debug.assert(state < 3 /* TransformationState.Disposed */, "Cannot invoke TransformationResult callbacks after the result is disposed.");
        if (node) {
            // TODO: Remove check and unconditionally use onEmitNode when API is breakingly changed
            // (see https://github.com/microsoft/TypeScript/pull/36248/files/5062623f39120171b98870c71344b3242eb03d23#r369766739)
            if (isEmitNotificationEnabled(node)) {
                onEmitNode(hint, node, emitCallback);
            }
            else {
                emitCallback(hint, node);
            }
        }
    }
    /**
     * Records a hoisted variable declaration for the provided name within a lexical environment.
     */
    function hoistVariableDeclaration(name) {
        ts_1.Debug.assert(state > 0 /* TransformationState.Uninitialized */, "Cannot modify the lexical environment during initialization.");
        ts_1.Debug.assert(state < 2 /* TransformationState.Completed */, "Cannot modify the lexical environment after transformation has completed.");
        var decl = (0, ts_1.setEmitFlags)(factory.createVariableDeclaration(name), 128 /* EmitFlags.NoNestedSourceMaps */);
        if (!lexicalEnvironmentVariableDeclarations) {
            lexicalEnvironmentVariableDeclarations = [decl];
        }
        else {
            lexicalEnvironmentVariableDeclarations.push(decl);
        }
        if (lexicalEnvironmentFlags & 1 /* LexicalEnvironmentFlags.InParameters */) {
            lexicalEnvironmentFlags |= 2 /* LexicalEnvironmentFlags.VariablesHoistedInParameters */;
        }
    }
    /**
     * Records a hoisted function declaration within a lexical environment.
     */
    function hoistFunctionDeclaration(func) {
        ts_1.Debug.assert(state > 0 /* TransformationState.Uninitialized */, "Cannot modify the lexical environment during initialization.");
        ts_1.Debug.assert(state < 2 /* TransformationState.Completed */, "Cannot modify the lexical environment after transformation has completed.");
        (0, ts_1.setEmitFlags)(func, 2097152 /* EmitFlags.CustomPrologue */);
        if (!lexicalEnvironmentFunctionDeclarations) {
            lexicalEnvironmentFunctionDeclarations = [func];
        }
        else {
            lexicalEnvironmentFunctionDeclarations.push(func);
        }
    }
    /**
     * Adds an initialization statement to the top of the lexical environment.
     */
    function addInitializationStatement(node) {
        ts_1.Debug.assert(state > 0 /* TransformationState.Uninitialized */, "Cannot modify the lexical environment during initialization.");
        ts_1.Debug.assert(state < 2 /* TransformationState.Completed */, "Cannot modify the lexical environment after transformation has completed.");
        (0, ts_1.setEmitFlags)(node, 2097152 /* EmitFlags.CustomPrologue */);
        if (!lexicalEnvironmentStatements) {
            lexicalEnvironmentStatements = [node];
        }
        else {
            lexicalEnvironmentStatements.push(node);
        }
    }
    /**
     * Starts a new lexical environment. Any existing hoisted variable or function declarations
     * are pushed onto a stack, and the related storage variables are reset.
     */
    function startLexicalEnvironment() {
        ts_1.Debug.assert(state > 0 /* TransformationState.Uninitialized */, "Cannot modify the lexical environment during initialization.");
        ts_1.Debug.assert(state < 2 /* TransformationState.Completed */, "Cannot modify the lexical environment after transformation has completed.");
        ts_1.Debug.assert(!lexicalEnvironmentSuspended, "Lexical environment is suspended.");
        // Save the current lexical environment. Rather than resizing the array we adjust the
        // stack size variable. This allows us to reuse existing array slots we've
        // already allocated between transformations to avoid allocation and GC overhead during
        // transformation.
        lexicalEnvironmentVariableDeclarationsStack[lexicalEnvironmentStackOffset] = lexicalEnvironmentVariableDeclarations;
        lexicalEnvironmentFunctionDeclarationsStack[lexicalEnvironmentStackOffset] = lexicalEnvironmentFunctionDeclarations;
        lexicalEnvironmentStatementsStack[lexicalEnvironmentStackOffset] = lexicalEnvironmentStatements;
        lexicalEnvironmentFlagsStack[lexicalEnvironmentStackOffset] = lexicalEnvironmentFlags;
        lexicalEnvironmentStackOffset++;
        lexicalEnvironmentVariableDeclarations = undefined;
        lexicalEnvironmentFunctionDeclarations = undefined;
        lexicalEnvironmentStatements = undefined;
        lexicalEnvironmentFlags = 0 /* LexicalEnvironmentFlags.None */;
    }
    /** Suspends the current lexical environment, usually after visiting a parameter list. */
    function suspendLexicalEnvironment() {
        ts_1.Debug.assert(state > 0 /* TransformationState.Uninitialized */, "Cannot modify the lexical environment during initialization.");
        ts_1.Debug.assert(state < 2 /* TransformationState.Completed */, "Cannot modify the lexical environment after transformation has completed.");
        ts_1.Debug.assert(!lexicalEnvironmentSuspended, "Lexical environment is already suspended.");
        lexicalEnvironmentSuspended = true;
    }
    /** Resumes a suspended lexical environment, usually before visiting a function body. */
    function resumeLexicalEnvironment() {
        ts_1.Debug.assert(state > 0 /* TransformationState.Uninitialized */, "Cannot modify the lexical environment during initialization.");
        ts_1.Debug.assert(state < 2 /* TransformationState.Completed */, "Cannot modify the lexical environment after transformation has completed.");
        ts_1.Debug.assert(lexicalEnvironmentSuspended, "Lexical environment is not suspended.");
        lexicalEnvironmentSuspended = false;
    }
    /**
     * Ends a lexical environment. The previous set of hoisted declarations are restored and
     * any hoisted declarations added in this environment are returned.
     */
    function endLexicalEnvironment() {
        ts_1.Debug.assert(state > 0 /* TransformationState.Uninitialized */, "Cannot modify the lexical environment during initialization.");
        ts_1.Debug.assert(state < 2 /* TransformationState.Completed */, "Cannot modify the lexical environment after transformation has completed.");
        ts_1.Debug.assert(!lexicalEnvironmentSuspended, "Lexical environment is suspended.");
        var statements;
        if (lexicalEnvironmentVariableDeclarations ||
            lexicalEnvironmentFunctionDeclarations ||
            lexicalEnvironmentStatements) {
            if (lexicalEnvironmentFunctionDeclarations) {
                statements = __spreadArray([], lexicalEnvironmentFunctionDeclarations, true);
            }
            if (lexicalEnvironmentVariableDeclarations) {
                var statement = factory.createVariableStatement(
                /*modifiers*/ undefined, factory.createVariableDeclarationList(lexicalEnvironmentVariableDeclarations));
                (0, ts_1.setEmitFlags)(statement, 2097152 /* EmitFlags.CustomPrologue */);
                if (!statements) {
                    statements = [statement];
                }
                else {
                    statements.push(statement);
                }
            }
            if (lexicalEnvironmentStatements) {
                if (!statements) {
                    statements = __spreadArray([], lexicalEnvironmentStatements, true);
                }
                else {
                    statements = __spreadArray(__spreadArray([], statements, true), lexicalEnvironmentStatements, true);
                }
            }
        }
        // Restore the previous lexical environment.
        lexicalEnvironmentStackOffset--;
        lexicalEnvironmentVariableDeclarations = lexicalEnvironmentVariableDeclarationsStack[lexicalEnvironmentStackOffset];
        lexicalEnvironmentFunctionDeclarations = lexicalEnvironmentFunctionDeclarationsStack[lexicalEnvironmentStackOffset];
        lexicalEnvironmentStatements = lexicalEnvironmentStatementsStack[lexicalEnvironmentStackOffset];
        lexicalEnvironmentFlags = lexicalEnvironmentFlagsStack[lexicalEnvironmentStackOffset];
        if (lexicalEnvironmentStackOffset === 0) {
            lexicalEnvironmentVariableDeclarationsStack = [];
            lexicalEnvironmentFunctionDeclarationsStack = [];
            lexicalEnvironmentStatementsStack = [];
            lexicalEnvironmentFlagsStack = [];
        }
        return statements;
    }
    function setLexicalEnvironmentFlags(flags, value) {
        lexicalEnvironmentFlags = value ?
            lexicalEnvironmentFlags | flags :
            lexicalEnvironmentFlags & ~flags;
    }
    function getLexicalEnvironmentFlags() {
        return lexicalEnvironmentFlags;
    }
    /**
     * Starts a block scope. Any existing block hoisted variables are pushed onto the stack and the related storage variables are reset.
     */
    function startBlockScope() {
        ts_1.Debug.assert(state > 0 /* TransformationState.Uninitialized */, "Cannot start a block scope during initialization.");
        ts_1.Debug.assert(state < 2 /* TransformationState.Completed */, "Cannot start a block scope after transformation has completed.");
        blockScopedVariableDeclarationsStack[blockScopeStackOffset] = blockScopedVariableDeclarations;
        blockScopeStackOffset++;
        blockScopedVariableDeclarations = undefined;
    }
    /**
     * Ends a block scope. The previous set of block hoisted variables are restored. Any hoisted declarations are returned.
     */
    function endBlockScope() {
        ts_1.Debug.assert(state > 0 /* TransformationState.Uninitialized */, "Cannot end a block scope during initialization.");
        ts_1.Debug.assert(state < 2 /* TransformationState.Completed */, "Cannot end a block scope after transformation has completed.");
        var statements = (0, ts_1.some)(blockScopedVariableDeclarations) ?
            [
                factory.createVariableStatement(
                /*modifiers*/ undefined, factory.createVariableDeclarationList(blockScopedVariableDeclarations.map(function (identifier) { return factory.createVariableDeclaration(identifier); }), 1 /* NodeFlags.Let */))
            ] : undefined;
        blockScopeStackOffset--;
        blockScopedVariableDeclarations = blockScopedVariableDeclarationsStack[blockScopeStackOffset];
        if (blockScopeStackOffset === 0) {
            blockScopedVariableDeclarationsStack = [];
        }
        return statements;
    }
    function addBlockScopedVariable(name) {
        ts_1.Debug.assert(blockScopeStackOffset > 0, "Cannot add a block scoped variable outside of an iteration body.");
        (blockScopedVariableDeclarations || (blockScopedVariableDeclarations = [])).push(name);
    }
    function requestEmitHelper(helper) {
        ts_1.Debug.assert(state > 0 /* TransformationState.Uninitialized */, "Cannot modify the transformation context during initialization.");
        ts_1.Debug.assert(state < 2 /* TransformationState.Completed */, "Cannot modify the transformation context after transformation has completed.");
        ts_1.Debug.assert(!helper.scoped, "Cannot request a scoped emit helper.");
        if (helper.dependencies) {
            for (var _i = 0, _a = helper.dependencies; _i < _a.length; _i++) {
                var h = _a[_i];
                requestEmitHelper(h);
            }
        }
        emitHelpers = (0, ts_1.append)(emitHelpers, helper);
    }
    function readEmitHelpers() {
        ts_1.Debug.assert(state > 0 /* TransformationState.Uninitialized */, "Cannot modify the transformation context during initialization.");
        ts_1.Debug.assert(state < 2 /* TransformationState.Completed */, "Cannot modify the transformation context after transformation has completed.");
        var helpers = emitHelpers;
        emitHelpers = undefined;
        return helpers;
    }
    function dispose() {
        if (state < 3 /* TransformationState.Disposed */) {
            // Clean up emit nodes on parse tree
            for (var _i = 0, nodes_3 = nodes; _i < nodes_3.length; _i++) {
                var node = nodes_3[_i];
                (0, ts_1.disposeEmitNodes)((0, ts_1.getSourceFileOfNode)((0, ts_1.getParseTreeNode)(node)));
            }
            // Release references to external entries for GC purposes.
            lexicalEnvironmentVariableDeclarations = undefined;
            lexicalEnvironmentVariableDeclarationsStack = undefined;
            lexicalEnvironmentFunctionDeclarations = undefined;
            lexicalEnvironmentFunctionDeclarationsStack = undefined;
            onSubstituteNode = undefined;
            onEmitNode = undefined;
            emitHelpers = undefined;
            // Prevent further use of the transformation result.
            state = 3 /* TransformationState.Disposed */;
        }
    }
}
exports.transformNodes = transformNodes;
/** @internal */
exports.nullTransformationContext = {
    factory: ts_1.factory,
    getCompilerOptions: function () { return ({}); },
    getEmitResolver: ts_1.notImplemented,
    getEmitHost: ts_1.notImplemented,
    getEmitHelperFactory: ts_1.notImplemented,
    startLexicalEnvironment: ts_1.noop,
    resumeLexicalEnvironment: ts_1.noop,
    suspendLexicalEnvironment: ts_1.noop,
    endLexicalEnvironment: ts_1.returnUndefined,
    setLexicalEnvironmentFlags: ts_1.noop,
    getLexicalEnvironmentFlags: function () { return 0; },
    hoistVariableDeclaration: ts_1.noop,
    hoistFunctionDeclaration: ts_1.noop,
    addInitializationStatement: ts_1.noop,
    startBlockScope: ts_1.noop,
    endBlockScope: ts_1.returnUndefined,
    addBlockScopedVariable: ts_1.noop,
    requestEmitHelper: ts_1.noop,
    readEmitHelpers: ts_1.notImplemented,
    enableSubstitution: ts_1.noop,
    enableEmitNotification: ts_1.noop,
    isSubstitutionEnabled: ts_1.notImplemented,
    isEmitNotificationEnabled: ts_1.notImplemented,
    onSubstituteNode: noEmitSubstitution,
    onEmitNode: noEmitNotification,
    addDiagnostic: ts_1.noop,
};
