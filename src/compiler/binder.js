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
exports.isExportsOrModuleExportsOrAlias = exports.bindSourceFile = exports.getModuleInstanceState = void 0;
var ts_1 = require("./_namespaces/ts");
var performance = require("./_namespaces/ts.performance");
/** @internal */
function getModuleInstanceState(node, visited) {
    if (node.body && !node.body.parent) {
        // getModuleInstanceStateForAliasTarget needs to walk up the parent chain, so parent pointers must be set on this tree already
        (0, ts_1.setParent)(node.body, node);
        (0, ts_1.setParentRecursive)(node.body, /*incremental*/ false);
    }
    return node.body ? getModuleInstanceStateCached(node.body, visited) : 1 /* ModuleInstanceState.Instantiated */;
}
exports.getModuleInstanceState = getModuleInstanceState;
function getModuleInstanceStateCached(node, visited) {
    if (visited === void 0) { visited = new Map(); }
    var nodeId = (0, ts_1.getNodeId)(node);
    if (visited.has(nodeId)) {
        return visited.get(nodeId) || 0 /* ModuleInstanceState.NonInstantiated */;
    }
    visited.set(nodeId, undefined);
    var result = getModuleInstanceStateWorker(node, visited);
    visited.set(nodeId, result);
    return result;
}
function getModuleInstanceStateWorker(node, visited) {
    // A module is uninstantiated if it contains only
    switch (node.kind) {
        // 1. interface declarations, type alias declarations
        case 263 /* SyntaxKind.InterfaceDeclaration */:
        case 264 /* SyntaxKind.TypeAliasDeclaration */:
            return 0 /* ModuleInstanceState.NonInstantiated */;
        // 2. const enum declarations
        case 265 /* SyntaxKind.EnumDeclaration */:
            if ((0, ts_1.isEnumConst)(node)) {
                return 2 /* ModuleInstanceState.ConstEnumOnly */;
            }
            break;
        // 3. non-exported import declarations
        case 271 /* SyntaxKind.ImportDeclaration */:
        case 270 /* SyntaxKind.ImportEqualsDeclaration */:
            if (!((0, ts_1.hasSyntacticModifier)(node, 1 /* ModifierFlags.Export */))) {
                return 0 /* ModuleInstanceState.NonInstantiated */;
            }
            break;
        // 4. Export alias declarations pointing at only uninstantiated modules or things uninstantiated modules contain
        case 277 /* SyntaxKind.ExportDeclaration */:
            var exportDeclaration = node;
            if (!exportDeclaration.moduleSpecifier && exportDeclaration.exportClause && exportDeclaration.exportClause.kind === 278 /* SyntaxKind.NamedExports */) {
                var state = 0 /* ModuleInstanceState.NonInstantiated */;
                for (var _i = 0, _a = exportDeclaration.exportClause.elements; _i < _a.length; _i++) {
                    var specifier = _a[_i];
                    var specifierState = getModuleInstanceStateForAliasTarget(specifier, visited);
                    if (specifierState > state) {
                        state = specifierState;
                    }
                    if (state === 1 /* ModuleInstanceState.Instantiated */) {
                        return state;
                    }
                }
                return state;
            }
            break;
        // 5. other uninstantiated module declarations.
        case 267 /* SyntaxKind.ModuleBlock */: {
            var state_1 = 0 /* ModuleInstanceState.NonInstantiated */;
            (0, ts_1.forEachChild)(node, function (n) {
                var childState = getModuleInstanceStateCached(n, visited);
                switch (childState) {
                    case 0 /* ModuleInstanceState.NonInstantiated */:
                        // child is non-instantiated - continue searching
                        return;
                    case 2 /* ModuleInstanceState.ConstEnumOnly */:
                        // child is const enum only - record state and continue searching
                        state_1 = 2 /* ModuleInstanceState.ConstEnumOnly */;
                        return;
                    case 1 /* ModuleInstanceState.Instantiated */:
                        // child is instantiated - record state and stop
                        state_1 = 1 /* ModuleInstanceState.Instantiated */;
                        return true;
                    default:
                        ts_1.Debug.assertNever(childState);
                }
            });
            return state_1;
        }
        case 266 /* SyntaxKind.ModuleDeclaration */:
            return getModuleInstanceState(node, visited);
        case 80 /* SyntaxKind.Identifier */:
            // Only jsdoc typedef definition can exist in jsdoc namespace, and it should
            // be considered the same as type alias
            if (node.flags & 2048 /* NodeFlags.IdentifierIsInJSDocNamespace */) {
                return 0 /* ModuleInstanceState.NonInstantiated */;
            }
    }
    return 1 /* ModuleInstanceState.Instantiated */;
}
function getModuleInstanceStateForAliasTarget(specifier, visited) {
    var name = specifier.propertyName || specifier.name;
    var p = specifier.parent;
    while (p) {
        if ((0, ts_1.isBlock)(p) || (0, ts_1.isModuleBlock)(p) || (0, ts_1.isSourceFile)(p)) {
            var statements = p.statements;
            var found = void 0;
            for (var _i = 0, statements_1 = statements; _i < statements_1.length; _i++) {
                var statement = statements_1[_i];
                if ((0, ts_1.nodeHasName)(statement, name)) {
                    if (!statement.parent) {
                        (0, ts_1.setParent)(statement, p);
                        (0, ts_1.setParentRecursive)(statement, /*incremental*/ false);
                    }
                    var state = getModuleInstanceStateCached(statement, visited);
                    if (found === undefined || state > found) {
                        found = state;
                    }
                    if (found === 1 /* ModuleInstanceState.Instantiated */) {
                        return found;
                    }
                }
            }
            if (found !== undefined) {
                return found;
            }
        }
        p = p.parent;
    }
    return 1 /* ModuleInstanceState.Instantiated */; // Couldn't locate, assume could refer to a value
}
function initFlowNode(node) {
    ts_1.Debug.attachFlowNodeDebugInfo(node);
    return node;
}
var binder = /* @__PURE__ */ createBinder();
/** @internal */
function bindSourceFile(file, options) {
    performance.mark("beforeBind");
    ts_1.perfLogger === null || ts_1.perfLogger === void 0 ? void 0 : ts_1.perfLogger.logStartBindFile("" + file.fileName);
    binder(file, options);
    ts_1.perfLogger === null || ts_1.perfLogger === void 0 ? void 0 : ts_1.perfLogger.logStopBindFile();
    performance.mark("afterBind");
    performance.measure("Bind", "beforeBind", "afterBind");
}
exports.bindSourceFile = bindSourceFile;
function createBinder() {
    // Why var? It avoids TDZ checks in the runtime which can be costly.
    // See: https://github.com/microsoft/TypeScript/issues/52924
    /* eslint-disable no-var */
    var file;
    var options;
    var languageVersion;
    var parent;
    var container;
    var thisParentContainer; // Container one level up
    var blockScopeContainer;
    var lastContainer;
    var delayedTypeAliases;
    var seenThisKeyword;
    // state used by control flow analysis
    var currentFlow;
    var currentBreakTarget;
    var currentContinueTarget;
    var currentReturnTarget;
    var currentTrueTarget;
    var currentFalseTarget;
    var currentExceptionTarget;
    var preSwitchCaseFlow;
    var activeLabelList;
    var hasExplicitReturn;
    // state used for emit helpers
    var emitFlags;
    // If this file is an external module, then it is automatically in strict-mode according to
    // ES6.  If it is not an external module, then we'll determine if it is in strict mode or
    // not depending on if we see "use strict" in certain places or if we hit a class/namespace
    // or if compiler options contain alwaysStrict.
    var inStrictMode;
    // If we are binding an assignment pattern, we will bind certain expressions differently.
    var inAssignmentPattern = false;
    var symbolCount = 0;
    var Symbol;
    var classifiableNames;
    var unreachableFlow = { flags: 1 /* FlowFlags.Unreachable */ };
    var reportedUnreachableFlow = { flags: 1 /* FlowFlags.Unreachable */ };
    var bindBinaryExpressionFlow = createBindBinaryExpressionFlow();
    /* eslint-enable no-var */
    return bindSourceFile;
    /**
     * Inside the binder, we may create a diagnostic for an as-yet unbound node (with potentially no parent pointers, implying no accessible source file)
     * If so, the node _must_ be in the current file (as that's the only way anything could have traversed to it to yield it as the error node)
     * This version of `createDiagnosticForNode` uses the binder's context to account for this, and always yields correct diagnostics even in these situations.
     */
    function createDiagnosticForNode(node, message) {
        var args = [];
        for (var _i = 2; _i < arguments.length; _i++) {
            args[_i - 2] = arguments[_i];
        }
        return ts_1.createDiagnosticForNodeInSourceFile.apply(void 0, __spreadArray([(0, ts_1.getSourceFileOfNode)(node) || file, node, message], args, false));
    }
    function bindSourceFile(f, opts) {
        file = f;
        options = opts;
        languageVersion = (0, ts_1.getEmitScriptTarget)(options);
        inStrictMode = bindInStrictMode(file, opts);
        classifiableNames = new Set();
        symbolCount = 0;
        Symbol = ts_1.objectAllocator.getSymbolConstructor();
        // Attach debugging information if necessary
        ts_1.Debug.attachFlowNodeDebugInfo(unreachableFlow);
        ts_1.Debug.attachFlowNodeDebugInfo(reportedUnreachableFlow);
        if (!file.locals) {
            ts_1.tracing === null || ts_1.tracing === void 0 ? void 0 : ts_1.tracing.push("bind" /* tracing.Phase.Bind */, "bindSourceFile", { path: file.path }, /*separateBeginAndEnd*/ true);
            bind(file);
            ts_1.tracing === null || ts_1.tracing === void 0 ? void 0 : ts_1.tracing.pop();
            file.symbolCount = symbolCount;
            file.classifiableNames = classifiableNames;
            delayedBindJSDocTypedefTag();
        }
        file = undefined;
        options = undefined;
        languageVersion = undefined;
        parent = undefined;
        container = undefined;
        thisParentContainer = undefined;
        blockScopeContainer = undefined;
        lastContainer = undefined;
        delayedTypeAliases = undefined;
        seenThisKeyword = false;
        currentFlow = undefined;
        currentBreakTarget = undefined;
        currentContinueTarget = undefined;
        currentReturnTarget = undefined;
        currentTrueTarget = undefined;
        currentFalseTarget = undefined;
        currentExceptionTarget = undefined;
        activeLabelList = undefined;
        hasExplicitReturn = false;
        inAssignmentPattern = false;
        emitFlags = 0 /* NodeFlags.None */;
    }
    function bindInStrictMode(file, opts) {
        if ((0, ts_1.getStrictOptionValue)(opts, "alwaysStrict") && !file.isDeclarationFile) {
            // bind in strict mode source files with alwaysStrict option
            return true;
        }
        else {
            return !!file.externalModuleIndicator;
        }
    }
    function createSymbol(flags, name) {
        symbolCount++;
        return new Symbol(flags, name);
    }
    function addDeclarationToSymbol(symbol, node, symbolFlags) {
        symbol.flags |= symbolFlags;
        node.symbol = symbol;
        symbol.declarations = (0, ts_1.appendIfUnique)(symbol.declarations, node);
        if (symbolFlags & (32 /* SymbolFlags.Class */ | 384 /* SymbolFlags.Enum */ | 1536 /* SymbolFlags.Module */ | 3 /* SymbolFlags.Variable */) && !symbol.exports) {
            symbol.exports = (0, ts_1.createSymbolTable)();
        }
        if (symbolFlags & (32 /* SymbolFlags.Class */ | 64 /* SymbolFlags.Interface */ | 2048 /* SymbolFlags.TypeLiteral */ | 4096 /* SymbolFlags.ObjectLiteral */) && !symbol.members) {
            symbol.members = (0, ts_1.createSymbolTable)();
        }
        // On merge of const enum module with class or function, reset const enum only flag (namespaces will already recalculate)
        if (symbol.constEnumOnlyModule && (symbol.flags & (16 /* SymbolFlags.Function */ | 32 /* SymbolFlags.Class */ | 256 /* SymbolFlags.RegularEnum */))) {
            symbol.constEnumOnlyModule = false;
        }
        if (symbolFlags & 111551 /* SymbolFlags.Value */) {
            (0, ts_1.setValueDeclaration)(symbol, node);
        }
    }
    // Should not be called on a declaration with a computed property name,
    // unless it is a well known Symbol.
    function getDeclarationName(node) {
        if (node.kind === 276 /* SyntaxKind.ExportAssignment */) {
            return node.isExportEquals ? "export=" /* InternalSymbolName.ExportEquals */ : "default" /* InternalSymbolName.Default */;
        }
        var name = (0, ts_1.getNameOfDeclaration)(node);
        if (name) {
            if ((0, ts_1.isAmbientModule)(node)) {
                var moduleName = (0, ts_1.getTextOfIdentifierOrLiteral)(name);
                return ((0, ts_1.isGlobalScopeAugmentation)(node) ? "__global" : "\"".concat(moduleName, "\""));
            }
            if (name.kind === 166 /* SyntaxKind.ComputedPropertyName */) {
                var nameExpression = name.expression;
                // treat computed property names where expression is string/numeric literal as just string/numeric literal
                if ((0, ts_1.isStringOrNumericLiteralLike)(nameExpression)) {
                    return (0, ts_1.escapeLeadingUnderscores)(nameExpression.text);
                }
                if ((0, ts_1.isSignedNumericLiteral)(nameExpression)) {
                    return (0, ts_1.tokenToString)(nameExpression.operator) + nameExpression.operand.text;
                }
                else {
                    ts_1.Debug.fail("Only computed properties with literal names have declaration names");
                }
            }
            if ((0, ts_1.isPrivateIdentifier)(name)) {
                // containingClass exists because private names only allowed inside classes
                var containingClass = (0, ts_1.getContainingClass)(node);
                if (!containingClass) {
                    // we can get here in cases where there is already a parse error.
                    return undefined;
                }
                var containingClassSymbol = containingClass.symbol;
                return (0, ts_1.getSymbolNameForPrivateIdentifier)(containingClassSymbol, name.escapedText);
            }
            if ((0, ts_1.isJsxNamespacedName)(name)) {
                return (0, ts_1.getEscapedTextOfJsxNamespacedName)(name);
            }
            return (0, ts_1.isPropertyNameLiteral)(name) ? (0, ts_1.getEscapedTextOfIdentifierOrLiteral)(name) : undefined;
        }
        switch (node.kind) {
            case 175 /* SyntaxKind.Constructor */:
                return "__constructor" /* InternalSymbolName.Constructor */;
            case 183 /* SyntaxKind.FunctionType */:
            case 178 /* SyntaxKind.CallSignature */:
            case 329 /* SyntaxKind.JSDocSignature */:
                return "__call" /* InternalSymbolName.Call */;
            case 184 /* SyntaxKind.ConstructorType */:
            case 179 /* SyntaxKind.ConstructSignature */:
                return "__new" /* InternalSymbolName.New */;
            case 180 /* SyntaxKind.IndexSignature */:
                return "__index" /* InternalSymbolName.Index */;
            case 277 /* SyntaxKind.ExportDeclaration */:
                return "__export" /* InternalSymbolName.ExportStar */;
            case 311 /* SyntaxKind.SourceFile */:
                // json file should behave as
                // module.exports = ...
                return "export=" /* InternalSymbolName.ExportEquals */;
            case 225 /* SyntaxKind.BinaryExpression */:
                if ((0, ts_1.getAssignmentDeclarationKind)(node) === 2 /* AssignmentDeclarationKind.ModuleExports */) {
                    // module.exports = ...
                    return "export=" /* InternalSymbolName.ExportEquals */;
                }
                ts_1.Debug.fail("Unknown binary declaration kind");
                break;
            case 323 /* SyntaxKind.JSDocFunctionType */:
                return ((0, ts_1.isJSDocConstructSignature)(node) ? "__new" /* InternalSymbolName.New */ : "__call" /* InternalSymbolName.Call */);
            case 168 /* SyntaxKind.Parameter */:
                // Parameters with names are handled at the top of this function.  Parameters
                // without names can only come from JSDocFunctionTypes.
                ts_1.Debug.assert(node.parent.kind === 323 /* SyntaxKind.JSDocFunctionType */, "Impossible parameter parent kind", function () { return "parent is: ".concat(ts_1.Debug.formatSyntaxKind(node.parent.kind), ", expected JSDocFunctionType"); });
                var functionType = node.parent;
                var index = functionType.parameters.indexOf(node);
                return "arg" + index;
        }
    }
    function getDisplayName(node) {
        return (0, ts_1.isNamedDeclaration)(node) ? (0, ts_1.declarationNameToString)(node.name) : (0, ts_1.unescapeLeadingUnderscores)(ts_1.Debug.checkDefined(getDeclarationName(node)));
    }
    /**
     * Declares a Symbol for the node and adds it to symbols. Reports errors for conflicting identifier names.
     * @param symbolTable - The symbol table which node will be added to.
     * @param parent - node's parent declaration.
     * @param node - The declaration to be added to the symbol table
     * @param includes - The SymbolFlags that node has in addition to its declaration type (eg: export, ambient, etc.)
     * @param excludes - The flags which node cannot be declared alongside in a symbol table. Used to report forbidden declarations.
     */
    function declareSymbol(symbolTable, parent, node, includes, excludes, isReplaceableByMethod, isComputedName) {
        ts_1.Debug.assert(isComputedName || !(0, ts_1.hasDynamicName)(node));
        var isDefaultExport = (0, ts_1.hasSyntacticModifier)(node, 1024 /* ModifierFlags.Default */) || (0, ts_1.isExportSpecifier)(node) && node.name.escapedText === "default";
        // The exported symbol for an export default function/class node is always named "default"
        var name = isComputedName ? "__computed" /* InternalSymbolName.Computed */
            : isDefaultExport && parent ? "default" /* InternalSymbolName.Default */
                : getDeclarationName(node);
        var symbol;
        if (name === undefined) {
            symbol = createSymbol(0 /* SymbolFlags.None */, "__missing" /* InternalSymbolName.Missing */);
        }
        else {
            // Check and see if the symbol table already has a symbol with this name.  If not,
            // create a new symbol with this name and add it to the table.  Note that we don't
            // give the new symbol any flags *yet*.  This ensures that it will not conflict
            // with the 'excludes' flags we pass in.
            //
            // If we do get an existing symbol, see if it conflicts with the new symbol we're
            // creating.  For example, a 'var' symbol and a 'class' symbol will conflict within
            // the same symbol table.  If we have a conflict, report the issue on each
            // declaration we have for this symbol, and then create a new symbol for this
            // declaration.
            //
            // Note that when properties declared in Javascript constructors
            // (marked by isReplaceableByMethod) conflict with another symbol, the property loses.
            // Always. This allows the common Javascript pattern of overwriting a prototype method
            // with an bound instance method of the same type: `this.method = this.method.bind(this)`
            //
            // If we created a new symbol, either because we didn't have a symbol with this name
            // in the symbol table, or we conflicted with an existing symbol, then just add this
            // node as the sole declaration of the new symbol.
            //
            // Otherwise, we'll be merging into a compatible existing symbol (for example when
            // you have multiple 'vars' with the same name in the same container).  In this case
            // just add this node into the declarations list of the symbol.
            symbol = symbolTable.get(name);
            if (includes & 2885600 /* SymbolFlags.Classifiable */) {
                classifiableNames.add(name);
            }
            if (!symbol) {
                symbolTable.set(name, symbol = createSymbol(0 /* SymbolFlags.None */, name));
                if (isReplaceableByMethod)
                    symbol.isReplaceableByMethod = true;
            }
            else if (isReplaceableByMethod && !symbol.isReplaceableByMethod) {
                // A symbol already exists, so don't add this as a declaration.
                return symbol;
            }
            else if (symbol.flags & excludes) {
                if (symbol.isReplaceableByMethod) {
                    // Javascript constructor-declared symbols can be discarded in favor of
                    // prototype symbols like methods.
                    symbolTable.set(name, symbol = createSymbol(0 /* SymbolFlags.None */, name));
                }
                else if (!(includes & 3 /* SymbolFlags.Variable */ && symbol.flags & 67108864 /* SymbolFlags.Assignment */)) {
                    // Assignment declarations are allowed to merge with variables, no matter what other flags they have.
                    if ((0, ts_1.isNamedDeclaration)(node)) {
                        (0, ts_1.setParent)(node.name, node);
                    }
                    // Report errors every position with duplicate declaration
                    // Report errors on previous encountered declarations
                    var message_1 = symbol.flags & 2 /* SymbolFlags.BlockScopedVariable */
                        ? ts_1.Diagnostics.Cannot_redeclare_block_scoped_variable_0
                        : ts_1.Diagnostics.Duplicate_identifier_0;
                    var messageNeedsName_1 = true;
                    if (symbol.flags & 384 /* SymbolFlags.Enum */ || includes & 384 /* SymbolFlags.Enum */) {
                        message_1 = ts_1.Diagnostics.Enum_declarations_can_only_merge_with_namespace_or_other_enum_declarations;
                        messageNeedsName_1 = false;
                    }
                    var multipleDefaultExports_1 = false;
                    if ((0, ts_1.length)(symbol.declarations)) {
                        // If the current node is a default export of some sort, then check if
                        // there are any other default exports that we need to error on.
                        // We'll know whether we have other default exports depending on if `symbol` already has a declaration list set.
                        if (isDefaultExport) {
                            message_1 = ts_1.Diagnostics.A_module_cannot_have_multiple_default_exports;
                            messageNeedsName_1 = false;
                            multipleDefaultExports_1 = true;
                        }
                        else {
                            // This is to properly report an error in the case "export default { }" is after export default of class declaration or function declaration.
                            // Error on multiple export default in the following case:
                            // 1. multiple export default of class declaration or function declaration by checking NodeFlags.Default
                            // 2. multiple export default of export assignment. This one doesn't have NodeFlags.Default on (as export default doesn't considered as modifiers)
                            if (symbol.declarations && symbol.declarations.length &&
                                (node.kind === 276 /* SyntaxKind.ExportAssignment */ && !node.isExportEquals)) {
                                message_1 = ts_1.Diagnostics.A_module_cannot_have_multiple_default_exports;
                                messageNeedsName_1 = false;
                                multipleDefaultExports_1 = true;
                            }
                        }
                    }
                    var relatedInformation_1 = [];
                    if ((0, ts_1.isTypeAliasDeclaration)(node) && (0, ts_1.nodeIsMissing)(node.type) && (0, ts_1.hasSyntacticModifier)(node, 1 /* ModifierFlags.Export */) && symbol.flags & (2097152 /* SymbolFlags.Alias */ | 788968 /* SymbolFlags.Type */ | 1920 /* SymbolFlags.Namespace */)) {
                        // export type T; - may have meant export type { T }?
                        relatedInformation_1.push(createDiagnosticForNode(node, ts_1.Diagnostics.Did_you_mean_0, "export type { ".concat((0, ts_1.unescapeLeadingUnderscores)(node.name.escapedText), " }")));
                    }
                    var declarationName_1 = (0, ts_1.getNameOfDeclaration)(node) || node;
                    (0, ts_1.forEach)(symbol.declarations, function (declaration, index) {
                        var decl = (0, ts_1.getNameOfDeclaration)(declaration) || declaration;
                        var diag = messageNeedsName_1 ? createDiagnosticForNode(decl, message_1, getDisplayName(declaration)) : createDiagnosticForNode(decl, message_1);
                        file.bindDiagnostics.push(multipleDefaultExports_1 ? (0, ts_1.addRelatedInfo)(diag, createDiagnosticForNode(declarationName_1, index === 0 ? ts_1.Diagnostics.Another_export_default_is_here : ts_1.Diagnostics.and_here)) : diag);
                        if (multipleDefaultExports_1) {
                            relatedInformation_1.push(createDiagnosticForNode(decl, ts_1.Diagnostics.The_first_export_default_is_here));
                        }
                    });
                    var diag = messageNeedsName_1 ? createDiagnosticForNode(declarationName_1, message_1, getDisplayName(node)) : createDiagnosticForNode(declarationName_1, message_1);
                    file.bindDiagnostics.push(ts_1.addRelatedInfo.apply(void 0, __spreadArray([diag], relatedInformation_1, false)));
                    symbol = createSymbol(0 /* SymbolFlags.None */, name);
                }
            }
        }
        addDeclarationToSymbol(symbol, node, includes);
        if (symbol.parent) {
            ts_1.Debug.assert(symbol.parent === parent, "Existing symbol parent should match new one");
        }
        else {
            symbol.parent = parent;
        }
        return symbol;
    }
    function declareModuleMember(node, symbolFlags, symbolExcludes) {
        var hasExportModifier = !!((0, ts_1.getCombinedModifierFlags)(node) & 1 /* ModifierFlags.Export */) || jsdocTreatAsExported(node);
        if (symbolFlags & 2097152 /* SymbolFlags.Alias */) {
            if (node.kind === 280 /* SyntaxKind.ExportSpecifier */ || (node.kind === 270 /* SyntaxKind.ImportEqualsDeclaration */ && hasExportModifier)) {
                return declareSymbol(container.symbol.exports, container.symbol, node, symbolFlags, symbolExcludes);
            }
            else {
                ts_1.Debug.assertNode(container, ts_1.canHaveLocals);
                return declareSymbol(container.locals, /*parent*/ undefined, node, symbolFlags, symbolExcludes);
            }
        }
        else {
            // Exported module members are given 2 symbols: A local symbol that is classified with an ExportValue flag,
            // and an associated export symbol with all the correct flags set on it. There are 2 main reasons:
            //
            //   1. We treat locals and exports of the same name as mutually exclusive within a container.
            //      That means the binder will issue a Duplicate Identifier error if you mix locals and exports
            //      with the same name in the same container.
            //      TODO: Make this a more specific error and decouple it from the exclusion logic.
            //   2. When we checkIdentifier in the checker, we set its resolved symbol to the local symbol,
            //      but return the export symbol (by calling getExportSymbolOfValueSymbolIfExported). That way
            //      when the emitter comes back to it, it knows not to qualify the name if it was found in a containing scope.
            // NOTE: Nested ambient modules always should go to to 'locals' table to prevent their automatic merge
            //       during global merging in the checker. Why? The only case when ambient module is permitted inside another module is module augmentation
            //       and this case is specially handled. Module augmentations should only be merged with original module definition
            //       and should never be merged directly with other augmentation, and the latter case would be possible if automatic merge is allowed.
            if ((0, ts_1.isJSDocTypeAlias)(node))
                ts_1.Debug.assert((0, ts_1.isInJSFile)(node)); // We shouldn't add symbols for JSDoc nodes if not in a JS file.
            if (!(0, ts_1.isAmbientModule)(node) && (hasExportModifier || container.flags & 64 /* NodeFlags.ExportContext */)) {
                if (!(0, ts_1.canHaveLocals)(container) || !container.locals || ((0, ts_1.hasSyntacticModifier)(node, 1024 /* ModifierFlags.Default */) && !getDeclarationName(node))) {
                    return declareSymbol(container.symbol.exports, container.symbol, node, symbolFlags, symbolExcludes); // No local symbol for an unnamed default!
                }
                var exportKind = symbolFlags & 111551 /* SymbolFlags.Value */ ? 1048576 /* SymbolFlags.ExportValue */ : 0;
                var local = declareSymbol(container.locals, /*parent*/ undefined, node, exportKind, symbolExcludes);
                local.exportSymbol = declareSymbol(container.symbol.exports, container.symbol, node, symbolFlags, symbolExcludes);
                node.localSymbol = local;
                return local;
            }
            else {
                ts_1.Debug.assertNode(container, ts_1.canHaveLocals);
                return declareSymbol(container.locals, /*parent*/ undefined, node, symbolFlags, symbolExcludes);
            }
        }
    }
    function jsdocTreatAsExported(node) {
        if (node.parent && (0, ts_1.isModuleDeclaration)(node)) {
            node = node.parent;
        }
        if (!(0, ts_1.isJSDocTypeAlias)(node))
            return false;
        // jsdoc typedef handling is a bit of a doozy, but to summarize, treat the typedef as exported if:
        // 1. It has an explicit name (since by default typedefs are always directly exported, either at the top level or in a container), or
        if (!(0, ts_1.isJSDocEnumTag)(node) && !!node.fullName)
            return true;
        // 2. The thing a nameless typedef pulls its name from is implicitly a direct export (either by assignment or actual export flag).
        var declName = (0, ts_1.getNameOfDeclaration)(node);
        if (!declName)
            return false;
        if ((0, ts_1.isPropertyAccessEntityNameExpression)(declName.parent) && isTopLevelNamespaceAssignment(declName.parent))
            return true;
        if ((0, ts_1.isDeclaration)(declName.parent) && (0, ts_1.getCombinedModifierFlags)(declName.parent) & 1 /* ModifierFlags.Export */)
            return true;
        // This could potentially be simplified by having `delayedBindJSDocTypedefTag` pass in an override for `hasExportModifier`, since it should
        // already have calculated and branched on most of this.
        return false;
    }
    // All container nodes are kept on a linked list in declaration order. This list is used by
    // the getLocalNameOfContainer function in the type checker to validate that the local name
    // used for a container is unique.
    function bindContainer(node, containerFlags) {
        // Before we recurse into a node's children, we first save the existing parent, container
        // and block-container.  Then after we pop out of processing the children, we restore
        // these saved values.
        var saveContainer = container;
        var saveThisParentContainer = thisParentContainer;
        var savedBlockScopeContainer = blockScopeContainer;
        // Depending on what kind of node this is, we may have to adjust the current container
        // and block-container.   If the current node is a container, then it is automatically
        // considered the current block-container as well.  Also, for containers that we know
        // may contain locals, we eagerly initialize the .locals field. We do this because
        // it's highly likely that the .locals will be needed to place some child in (for example,
        // a parameter, or variable declaration).
        //
        // However, we do not proactively create the .locals for block-containers because it's
        // totally normal and common for block-containers to never actually have a block-scoped
        // variable in them.  We don't want to end up allocating an object for every 'block' we
        // run into when most of them won't be necessary.
        //
        // Finally, if this is a block-container, then we clear out any existing .locals object
        // it may contain within it.  This happens in incremental scenarios.  Because we can be
        // reusing a node from a previous compilation, that node may have had 'locals' created
        // for it.  We must clear this so we don't accidentally move any stale data forward from
        // a previous compilation.
        if (containerFlags & 1 /* ContainerFlags.IsContainer */) {
            if (node.kind !== 218 /* SyntaxKind.ArrowFunction */) {
                thisParentContainer = container;
            }
            container = blockScopeContainer = node;
            if (containerFlags & 32 /* ContainerFlags.HasLocals */) {
                container.locals = (0, ts_1.createSymbolTable)();
                addToContainerChain(container);
            }
        }
        else if (containerFlags & 2 /* ContainerFlags.IsBlockScopedContainer */) {
            blockScopeContainer = node;
            if (containerFlags & 32 /* ContainerFlags.HasLocals */) {
                blockScopeContainer.locals = undefined;
            }
        }
        if (containerFlags & 4 /* ContainerFlags.IsControlFlowContainer */) {
            var saveCurrentFlow = currentFlow;
            var saveBreakTarget = currentBreakTarget;
            var saveContinueTarget = currentContinueTarget;
            var saveReturnTarget = currentReturnTarget;
            var saveExceptionTarget = currentExceptionTarget;
            var saveActiveLabelList = activeLabelList;
            var saveHasExplicitReturn = hasExplicitReturn;
            var isImmediatelyInvoked = (containerFlags & 16 /* ContainerFlags.IsFunctionExpression */ &&
                !(0, ts_1.hasSyntacticModifier)(node, 512 /* ModifierFlags.Async */) &&
                !node.asteriskToken &&
                !!(0, ts_1.getImmediatelyInvokedFunctionExpression)(node)) ||
                node.kind === 174 /* SyntaxKind.ClassStaticBlockDeclaration */;
            // A non-async, non-generator IIFE is considered part of the containing control flow. Return statements behave
            // similarly to break statements that exit to a label just past the statement body.
            if (!isImmediatelyInvoked) {
                currentFlow = initFlowNode({ flags: 2 /* FlowFlags.Start */ });
                if (containerFlags & (16 /* ContainerFlags.IsFunctionExpression */ | 128 /* ContainerFlags.IsObjectLiteralOrClassExpressionMethodOrAccessor */)) {
                    currentFlow.node = node;
                }
            }
            // We create a return control flow graph for IIFEs and constructors. For constructors
            // we use the return control flow graph in strict property initialization checks.
            currentReturnTarget = isImmediatelyInvoked || node.kind === 175 /* SyntaxKind.Constructor */ || ((0, ts_1.isInJSFile)(node) && (node.kind === 261 /* SyntaxKind.FunctionDeclaration */ || node.kind === 217 /* SyntaxKind.FunctionExpression */)) ? createBranchLabel() : undefined;
            currentExceptionTarget = undefined;
            currentBreakTarget = undefined;
            currentContinueTarget = undefined;
            activeLabelList = undefined;
            hasExplicitReturn = false;
            bindChildren(node);
            // Reset all reachability check related flags on node (for incremental scenarios)
            node.flags &= ~2816 /* NodeFlags.ReachabilityAndEmitFlags */;
            if (!(currentFlow.flags & 1 /* FlowFlags.Unreachable */) && containerFlags & 8 /* ContainerFlags.IsFunctionLike */ && (0, ts_1.nodeIsPresent)(node.body)) {
                node.flags |= 256 /* NodeFlags.HasImplicitReturn */;
                if (hasExplicitReturn)
                    node.flags |= 512 /* NodeFlags.HasExplicitReturn */;
                node.endFlowNode = currentFlow;
            }
            if (node.kind === 311 /* SyntaxKind.SourceFile */) {
                node.flags |= emitFlags;
                node.endFlowNode = currentFlow;
            }
            if (currentReturnTarget) {
                addAntecedent(currentReturnTarget, currentFlow);
                currentFlow = finishFlowLabel(currentReturnTarget);
                if (node.kind === 175 /* SyntaxKind.Constructor */ || node.kind === 174 /* SyntaxKind.ClassStaticBlockDeclaration */ || ((0, ts_1.isInJSFile)(node) && (node.kind === 261 /* SyntaxKind.FunctionDeclaration */ || node.kind === 217 /* SyntaxKind.FunctionExpression */))) {
                    node.returnFlowNode = currentFlow;
                }
            }
            if (!isImmediatelyInvoked) {
                currentFlow = saveCurrentFlow;
            }
            currentBreakTarget = saveBreakTarget;
            currentContinueTarget = saveContinueTarget;
            currentReturnTarget = saveReturnTarget;
            currentExceptionTarget = saveExceptionTarget;
            activeLabelList = saveActiveLabelList;
            hasExplicitReturn = saveHasExplicitReturn;
        }
        else if (containerFlags & 64 /* ContainerFlags.IsInterface */) {
            seenThisKeyword = false;
            bindChildren(node);
            ts_1.Debug.assertNotNode(node, ts_1.isIdentifier); // ContainsThis cannot overlap with HasExtendedUnicodeEscape on Identifier
            node.flags = seenThisKeyword ? node.flags | 128 /* NodeFlags.ContainsThis */ : node.flags & ~128 /* NodeFlags.ContainsThis */;
        }
        else {
            bindChildren(node);
        }
        container = saveContainer;
        thisParentContainer = saveThisParentContainer;
        blockScopeContainer = savedBlockScopeContainer;
    }
    function bindEachFunctionsFirst(nodes) {
        bindEach(nodes, function (n) { return n.kind === 261 /* SyntaxKind.FunctionDeclaration */ ? bind(n) : undefined; });
        bindEach(nodes, function (n) { return n.kind !== 261 /* SyntaxKind.FunctionDeclaration */ ? bind(n) : undefined; });
    }
    function bindEach(nodes, bindFunction) {
        if (bindFunction === void 0) { bindFunction = bind; }
        if (nodes === undefined) {
            return;
        }
        (0, ts_1.forEach)(nodes, bindFunction);
    }
    function bindEachChild(node) {
        (0, ts_1.forEachChild)(node, bind, bindEach);
    }
    function bindChildren(node) {
        var saveInAssignmentPattern = inAssignmentPattern;
        // Most nodes aren't valid in an assignment pattern, so we clear the value here
        // and set it before we descend into nodes that could actually be part of an assignment pattern.
        inAssignmentPattern = false;
        if (checkUnreachable(node)) {
            bindEachChild(node);
            bindJSDoc(node);
            inAssignmentPattern = saveInAssignmentPattern;
            return;
        }
        if (node.kind >= 242 /* SyntaxKind.FirstStatement */ && node.kind <= 258 /* SyntaxKind.LastStatement */ && !options.allowUnreachableCode) {
            node.flowNode = currentFlow;
        }
        switch (node.kind) {
            case 246 /* SyntaxKind.WhileStatement */:
                bindWhileStatement(node);
                break;
            case 245 /* SyntaxKind.DoStatement */:
                bindDoStatement(node);
                break;
            case 247 /* SyntaxKind.ForStatement */:
                bindForStatement(node);
                break;
            case 248 /* SyntaxKind.ForInStatement */:
            case 249 /* SyntaxKind.ForOfStatement */:
                bindForInOrForOfStatement(node);
                break;
            case 244 /* SyntaxKind.IfStatement */:
                bindIfStatement(node);
                break;
            case 252 /* SyntaxKind.ReturnStatement */:
            case 256 /* SyntaxKind.ThrowStatement */:
                bindReturnOrThrow(node);
                break;
            case 251 /* SyntaxKind.BreakStatement */:
            case 250 /* SyntaxKind.ContinueStatement */:
                bindBreakOrContinueStatement(node);
                break;
            case 257 /* SyntaxKind.TryStatement */:
                bindTryStatement(node);
                break;
            case 254 /* SyntaxKind.SwitchStatement */:
                bindSwitchStatement(node);
                break;
            case 268 /* SyntaxKind.CaseBlock */:
                bindCaseBlock(node);
                break;
            case 295 /* SyntaxKind.CaseClause */:
                bindCaseClause(node);
                break;
            case 243 /* SyntaxKind.ExpressionStatement */:
                bindExpressionStatement(node);
                break;
            case 255 /* SyntaxKind.LabeledStatement */:
                bindLabeledStatement(node);
                break;
            case 223 /* SyntaxKind.PrefixUnaryExpression */:
                bindPrefixUnaryExpressionFlow(node);
                break;
            case 224 /* SyntaxKind.PostfixUnaryExpression */:
                bindPostfixUnaryExpressionFlow(node);
                break;
            case 225 /* SyntaxKind.BinaryExpression */:
                if ((0, ts_1.isDestructuringAssignment)(node)) {
                    // Carry over whether we are in an assignment pattern to
                    // binary expressions that could actually be an initializer
                    inAssignmentPattern = saveInAssignmentPattern;
                    bindDestructuringAssignmentFlow(node);
                    return;
                }
                bindBinaryExpressionFlow(node);
                break;
            case 219 /* SyntaxKind.DeleteExpression */:
                bindDeleteExpressionFlow(node);
                break;
            case 226 /* SyntaxKind.ConditionalExpression */:
                bindConditionalExpressionFlow(node);
                break;
            case 259 /* SyntaxKind.VariableDeclaration */:
                bindVariableDeclarationFlow(node);
                break;
            case 210 /* SyntaxKind.PropertyAccessExpression */:
            case 211 /* SyntaxKind.ElementAccessExpression */:
                bindAccessExpressionFlow(node);
                break;
            case 212 /* SyntaxKind.CallExpression */:
                bindCallExpressionFlow(node);
                break;
            case 234 /* SyntaxKind.NonNullExpression */:
                bindNonNullExpressionFlow(node);
                break;
            case 352 /* SyntaxKind.JSDocTypedefTag */:
            case 344 /* SyntaxKind.JSDocCallbackTag */:
            case 346 /* SyntaxKind.JSDocEnumTag */:
                bindJSDocTypeAlias(node);
                break;
            // In source files and blocks, bind functions first to match hoisting that occurs at runtime
            case 311 /* SyntaxKind.SourceFile */: {
                bindEachFunctionsFirst(node.statements);
                bind(node.endOfFileToken);
                break;
            }
            case 240 /* SyntaxKind.Block */:
            case 267 /* SyntaxKind.ModuleBlock */:
                bindEachFunctionsFirst(node.statements);
                break;
            case 207 /* SyntaxKind.BindingElement */:
                bindBindingElementFlow(node);
                break;
            case 168 /* SyntaxKind.Parameter */:
                bindParameterFlow(node);
                break;
            case 209 /* SyntaxKind.ObjectLiteralExpression */:
            case 208 /* SyntaxKind.ArrayLiteralExpression */:
            case 302 /* SyntaxKind.PropertyAssignment */:
            case 229 /* SyntaxKind.SpreadElement */:
                // Carry over whether we are in an assignment pattern of Object and Array literals
                // as well as their children that are valid assignment targets.
                inAssignmentPattern = saveInAssignmentPattern;
            // falls through
            default:
                bindEachChild(node);
                break;
        }
        bindJSDoc(node);
        inAssignmentPattern = saveInAssignmentPattern;
    }
    function isNarrowingExpression(expr) {
        switch (expr.kind) {
            case 80 /* SyntaxKind.Identifier */:
            case 81 /* SyntaxKind.PrivateIdentifier */:
            case 110 /* SyntaxKind.ThisKeyword */:
            case 210 /* SyntaxKind.PropertyAccessExpression */:
            case 211 /* SyntaxKind.ElementAccessExpression */:
                return containsNarrowableReference(expr);
            case 212 /* SyntaxKind.CallExpression */:
                return hasNarrowableArgument(expr);
            case 216 /* SyntaxKind.ParenthesizedExpression */:
            case 234 /* SyntaxKind.NonNullExpression */:
                return isNarrowingExpression(expr.expression);
            case 225 /* SyntaxKind.BinaryExpression */:
                return isNarrowingBinaryExpression(expr);
            case 223 /* SyntaxKind.PrefixUnaryExpression */:
                return expr.operator === 54 /* SyntaxKind.ExclamationToken */ && isNarrowingExpression(expr.operand);
            case 220 /* SyntaxKind.TypeOfExpression */:
                return isNarrowingExpression(expr.expression);
        }
        return false;
    }
    function isNarrowableReference(expr) {
        return (0, ts_1.isDottedName)(expr)
            || ((0, ts_1.isPropertyAccessExpression)(expr) || (0, ts_1.isNonNullExpression)(expr) || (0, ts_1.isParenthesizedExpression)(expr)) && isNarrowableReference(expr.expression)
            || (0, ts_1.isBinaryExpression)(expr) && expr.operatorToken.kind === 28 /* SyntaxKind.CommaToken */ && isNarrowableReference(expr.right)
            || (0, ts_1.isElementAccessExpression)(expr) && ((0, ts_1.isStringOrNumericLiteralLike)(expr.argumentExpression) || (0, ts_1.isEntityNameExpression)(expr.argumentExpression)) && isNarrowableReference(expr.expression)
            || (0, ts_1.isAssignmentExpression)(expr) && isNarrowableReference(expr.left);
    }
    function containsNarrowableReference(expr) {
        return isNarrowableReference(expr) || (0, ts_1.isOptionalChain)(expr) && containsNarrowableReference(expr.expression);
    }
    function hasNarrowableArgument(expr) {
        if (expr.arguments) {
            for (var _i = 0, _a = expr.arguments; _i < _a.length; _i++) {
                var argument = _a[_i];
                if (containsNarrowableReference(argument)) {
                    return true;
                }
            }
        }
        if (expr.expression.kind === 210 /* SyntaxKind.PropertyAccessExpression */ &&
            containsNarrowableReference(expr.expression.expression)) {
            return true;
        }
        return false;
    }
    function isNarrowingTypeofOperands(expr1, expr2) {
        return (0, ts_1.isTypeOfExpression)(expr1) && isNarrowableOperand(expr1.expression) && (0, ts_1.isStringLiteralLike)(expr2);
    }
    function isNarrowingBinaryExpression(expr) {
        switch (expr.operatorToken.kind) {
            case 64 /* SyntaxKind.EqualsToken */:
            case 76 /* SyntaxKind.BarBarEqualsToken */:
            case 77 /* SyntaxKind.AmpersandAmpersandEqualsToken */:
            case 78 /* SyntaxKind.QuestionQuestionEqualsToken */:
                return containsNarrowableReference(expr.left);
            case 35 /* SyntaxKind.EqualsEqualsToken */:
            case 36 /* SyntaxKind.ExclamationEqualsToken */:
            case 37 /* SyntaxKind.EqualsEqualsEqualsToken */:
            case 38 /* SyntaxKind.ExclamationEqualsEqualsToken */:
                return isNarrowableOperand(expr.left) || isNarrowableOperand(expr.right) ||
                    isNarrowingTypeofOperands(expr.right, expr.left) || isNarrowingTypeofOperands(expr.left, expr.right);
            case 104 /* SyntaxKind.InstanceOfKeyword */:
                return isNarrowableOperand(expr.left);
            case 103 /* SyntaxKind.InKeyword */:
                return isNarrowingExpression(expr.right);
            case 28 /* SyntaxKind.CommaToken */:
                return isNarrowingExpression(expr.right);
        }
        return false;
    }
    function isNarrowableOperand(expr) {
        switch (expr.kind) {
            case 216 /* SyntaxKind.ParenthesizedExpression */:
                return isNarrowableOperand(expr.expression);
            case 225 /* SyntaxKind.BinaryExpression */:
                switch (expr.operatorToken.kind) {
                    case 64 /* SyntaxKind.EqualsToken */:
                        return isNarrowableOperand(expr.left);
                    case 28 /* SyntaxKind.CommaToken */:
                        return isNarrowableOperand(expr.right);
                }
        }
        return containsNarrowableReference(expr);
    }
    function createBranchLabel() {
        return initFlowNode({ flags: 4 /* FlowFlags.BranchLabel */, antecedents: undefined });
    }
    function createLoopLabel() {
        return initFlowNode({ flags: 8 /* FlowFlags.LoopLabel */, antecedents: undefined });
    }
    function createReduceLabel(target, antecedents, antecedent) {
        return initFlowNode({ flags: 1024 /* FlowFlags.ReduceLabel */, target: target, antecedents: antecedents, antecedent: antecedent });
    }
    function setFlowNodeReferenced(flow) {
        // On first reference we set the Referenced flag, thereafter we set the Shared flag
        flow.flags |= flow.flags & 2048 /* FlowFlags.Referenced */ ? 4096 /* FlowFlags.Shared */ : 2048 /* FlowFlags.Referenced */;
    }
    function addAntecedent(label, antecedent) {
        if (!(antecedent.flags & 1 /* FlowFlags.Unreachable */) && !(0, ts_1.contains)(label.antecedents, antecedent)) {
            (label.antecedents || (label.antecedents = [])).push(antecedent);
            setFlowNodeReferenced(antecedent);
        }
    }
    function createFlowCondition(flags, antecedent, expression) {
        if (antecedent.flags & 1 /* FlowFlags.Unreachable */) {
            return antecedent;
        }
        if (!expression) {
            return flags & 32 /* FlowFlags.TrueCondition */ ? antecedent : unreachableFlow;
        }
        if ((expression.kind === 112 /* SyntaxKind.TrueKeyword */ && flags & 64 /* FlowFlags.FalseCondition */ ||
            expression.kind === 97 /* SyntaxKind.FalseKeyword */ && flags & 32 /* FlowFlags.TrueCondition */) &&
            !(0, ts_1.isExpressionOfOptionalChainRoot)(expression) && !(0, ts_1.isNullishCoalesce)(expression.parent)) {
            return unreachableFlow;
        }
        if (!isNarrowingExpression(expression)) {
            return antecedent;
        }
        setFlowNodeReferenced(antecedent);
        return initFlowNode({ flags: flags, antecedent: antecedent, node: expression });
    }
    function createFlowSwitchClause(antecedent, switchStatement, clauseStart, clauseEnd) {
        setFlowNodeReferenced(antecedent);
        return initFlowNode({ flags: 128 /* FlowFlags.SwitchClause */, antecedent: antecedent, switchStatement: switchStatement, clauseStart: clauseStart, clauseEnd: clauseEnd });
    }
    function createFlowMutation(flags, antecedent, node) {
        setFlowNodeReferenced(antecedent);
        var result = initFlowNode({ flags: flags, antecedent: antecedent, node: node });
        if (currentExceptionTarget) {
            addAntecedent(currentExceptionTarget, result);
        }
        return result;
    }
    function createFlowCall(antecedent, node) {
        setFlowNodeReferenced(antecedent);
        return initFlowNode({ flags: 512 /* FlowFlags.Call */, antecedent: antecedent, node: node });
    }
    function finishFlowLabel(flow) {
        var antecedents = flow.antecedents;
        if (!antecedents) {
            return unreachableFlow;
        }
        if (antecedents.length === 1) {
            return antecedents[0];
        }
        return flow;
    }
    function isStatementCondition(node) {
        var parent = node.parent;
        switch (parent.kind) {
            case 244 /* SyntaxKind.IfStatement */:
            case 246 /* SyntaxKind.WhileStatement */:
            case 245 /* SyntaxKind.DoStatement */:
                return parent.expression === node;
            case 247 /* SyntaxKind.ForStatement */:
            case 226 /* SyntaxKind.ConditionalExpression */:
                return parent.condition === node;
        }
        return false;
    }
    function isLogicalExpression(node) {
        while (true) {
            if (node.kind === 216 /* SyntaxKind.ParenthesizedExpression */) {
                node = node.expression;
            }
            else if (node.kind === 223 /* SyntaxKind.PrefixUnaryExpression */ && node.operator === 54 /* SyntaxKind.ExclamationToken */) {
                node = node.operand;
            }
            else {
                return (0, ts_1.isLogicalOrCoalescingBinaryExpression)(node);
            }
        }
    }
    function isLogicalAssignmentExpression(node) {
        return (0, ts_1.isLogicalOrCoalescingAssignmentExpression)((0, ts_1.skipParentheses)(node));
    }
    function isTopLevelLogicalExpression(node) {
        while ((0, ts_1.isParenthesizedExpression)(node.parent) ||
            (0, ts_1.isPrefixUnaryExpression)(node.parent) && node.parent.operator === 54 /* SyntaxKind.ExclamationToken */) {
            node = node.parent;
        }
        return !isStatementCondition(node) &&
            !isLogicalExpression(node.parent) &&
            !((0, ts_1.isOptionalChain)(node.parent) && node.parent.expression === node);
    }
    function doWithConditionalBranches(action, value, trueTarget, falseTarget) {
        var savedTrueTarget = currentTrueTarget;
        var savedFalseTarget = currentFalseTarget;
        currentTrueTarget = trueTarget;
        currentFalseTarget = falseTarget;
        action(value);
        currentTrueTarget = savedTrueTarget;
        currentFalseTarget = savedFalseTarget;
    }
    function bindCondition(node, trueTarget, falseTarget) {
        doWithConditionalBranches(bind, node, trueTarget, falseTarget);
        if (!node || !isLogicalAssignmentExpression(node) && !isLogicalExpression(node) && !((0, ts_1.isOptionalChain)(node) && (0, ts_1.isOutermostOptionalChain)(node))) {
            addAntecedent(trueTarget, createFlowCondition(32 /* FlowFlags.TrueCondition */, currentFlow, node));
            addAntecedent(falseTarget, createFlowCondition(64 /* FlowFlags.FalseCondition */, currentFlow, node));
        }
    }
    function bindIterativeStatement(node, breakTarget, continueTarget) {
        var saveBreakTarget = currentBreakTarget;
        var saveContinueTarget = currentContinueTarget;
        currentBreakTarget = breakTarget;
        currentContinueTarget = continueTarget;
        bind(node);
        currentBreakTarget = saveBreakTarget;
        currentContinueTarget = saveContinueTarget;
    }
    function setContinueTarget(node, target) {
        var label = activeLabelList;
        while (label && node.parent.kind === 255 /* SyntaxKind.LabeledStatement */) {
            label.continueTarget = target;
            label = label.next;
            node = node.parent;
        }
        return target;
    }
    function bindWhileStatement(node) {
        var preWhileLabel = setContinueTarget(node, createLoopLabel());
        var preBodyLabel = createBranchLabel();
        var postWhileLabel = createBranchLabel();
        addAntecedent(preWhileLabel, currentFlow);
        currentFlow = preWhileLabel;
        bindCondition(node.expression, preBodyLabel, postWhileLabel);
        currentFlow = finishFlowLabel(preBodyLabel);
        bindIterativeStatement(node.statement, postWhileLabel, preWhileLabel);
        addAntecedent(preWhileLabel, currentFlow);
        currentFlow = finishFlowLabel(postWhileLabel);
    }
    function bindDoStatement(node) {
        var preDoLabel = createLoopLabel();
        var preConditionLabel = setContinueTarget(node, createBranchLabel());
        var postDoLabel = createBranchLabel();
        addAntecedent(preDoLabel, currentFlow);
        currentFlow = preDoLabel;
        bindIterativeStatement(node.statement, postDoLabel, preConditionLabel);
        addAntecedent(preConditionLabel, currentFlow);
        currentFlow = finishFlowLabel(preConditionLabel);
        bindCondition(node.expression, preDoLabel, postDoLabel);
        currentFlow = finishFlowLabel(postDoLabel);
    }
    function bindForStatement(node) {
        var preLoopLabel = setContinueTarget(node, createLoopLabel());
        var preBodyLabel = createBranchLabel();
        var postLoopLabel = createBranchLabel();
        bind(node.initializer);
        addAntecedent(preLoopLabel, currentFlow);
        currentFlow = preLoopLabel;
        bindCondition(node.condition, preBodyLabel, postLoopLabel);
        currentFlow = finishFlowLabel(preBodyLabel);
        bindIterativeStatement(node.statement, postLoopLabel, preLoopLabel);
        bind(node.incrementor);
        addAntecedent(preLoopLabel, currentFlow);
        currentFlow = finishFlowLabel(postLoopLabel);
    }
    function bindForInOrForOfStatement(node) {
        var preLoopLabel = setContinueTarget(node, createLoopLabel());
        var postLoopLabel = createBranchLabel();
        bind(node.expression);
        addAntecedent(preLoopLabel, currentFlow);
        currentFlow = preLoopLabel;
        if (node.kind === 249 /* SyntaxKind.ForOfStatement */) {
            bind(node.awaitModifier);
        }
        addAntecedent(postLoopLabel, currentFlow);
        bind(node.initializer);
        if (node.initializer.kind !== 260 /* SyntaxKind.VariableDeclarationList */) {
            bindAssignmentTargetFlow(node.initializer);
        }
        bindIterativeStatement(node.statement, postLoopLabel, preLoopLabel);
        addAntecedent(preLoopLabel, currentFlow);
        currentFlow = finishFlowLabel(postLoopLabel);
    }
    function bindIfStatement(node) {
        var thenLabel = createBranchLabel();
        var elseLabel = createBranchLabel();
        var postIfLabel = createBranchLabel();
        bindCondition(node.expression, thenLabel, elseLabel);
        currentFlow = finishFlowLabel(thenLabel);
        bind(node.thenStatement);
        addAntecedent(postIfLabel, currentFlow);
        currentFlow = finishFlowLabel(elseLabel);
        bind(node.elseStatement);
        addAntecedent(postIfLabel, currentFlow);
        currentFlow = finishFlowLabel(postIfLabel);
    }
    function bindReturnOrThrow(node) {
        bind(node.expression);
        if (node.kind === 252 /* SyntaxKind.ReturnStatement */) {
            hasExplicitReturn = true;
            if (currentReturnTarget) {
                addAntecedent(currentReturnTarget, currentFlow);
            }
        }
        currentFlow = unreachableFlow;
    }
    function findActiveLabel(name) {
        for (var label = activeLabelList; label; label = label.next) {
            if (label.name === name) {
                return label;
            }
        }
        return undefined;
    }
    function bindBreakOrContinueFlow(node, breakTarget, continueTarget) {
        var flowLabel = node.kind === 251 /* SyntaxKind.BreakStatement */ ? breakTarget : continueTarget;
        if (flowLabel) {
            addAntecedent(flowLabel, currentFlow);
            currentFlow = unreachableFlow;
        }
    }
    function bindBreakOrContinueStatement(node) {
        bind(node.label);
        if (node.label) {
            var activeLabel = findActiveLabel(node.label.escapedText);
            if (activeLabel) {
                activeLabel.referenced = true;
                bindBreakOrContinueFlow(node, activeLabel.breakTarget, activeLabel.continueTarget);
            }
        }
        else {
            bindBreakOrContinueFlow(node, currentBreakTarget, currentContinueTarget);
        }
    }
    function bindTryStatement(node) {
        // We conservatively assume that *any* code in the try block can cause an exception, but we only need
        // to track code that causes mutations (because only mutations widen the possible control flow type of
        // a variable). The exceptionLabel is the target label for control flows that result from exceptions.
        // We add all mutation flow nodes as antecedents of this label such that we can analyze them as possible
        // antecedents of the start of catch or finally blocks. Furthermore, we add the current control flow to
        // represent exceptions that occur before any mutations.
        var saveReturnTarget = currentReturnTarget;
        var saveExceptionTarget = currentExceptionTarget;
        var normalExitLabel = createBranchLabel();
        var returnLabel = createBranchLabel();
        var exceptionLabel = createBranchLabel();
        if (node.finallyBlock) {
            currentReturnTarget = returnLabel;
        }
        addAntecedent(exceptionLabel, currentFlow);
        currentExceptionTarget = exceptionLabel;
        bind(node.tryBlock);
        addAntecedent(normalExitLabel, currentFlow);
        if (node.catchClause) {
            // Start of catch clause is the target of exceptions from try block.
            currentFlow = finishFlowLabel(exceptionLabel);
            // The currentExceptionTarget now represents control flows from exceptions in the catch clause.
            // Effectively, in a try-catch-finally, if an exception occurs in the try block, the catch block
            // acts like a second try block.
            exceptionLabel = createBranchLabel();
            addAntecedent(exceptionLabel, currentFlow);
            currentExceptionTarget = exceptionLabel;
            bind(node.catchClause);
            addAntecedent(normalExitLabel, currentFlow);
        }
        currentReturnTarget = saveReturnTarget;
        currentExceptionTarget = saveExceptionTarget;
        if (node.finallyBlock) {
            // Possible ways control can reach the finally block:
            // 1) Normal completion of try block of a try-finally or try-catch-finally
            // 2) Normal completion of catch block (following exception in try block) of a try-catch-finally
            // 3) Return in try or catch block of a try-finally or try-catch-finally
            // 4) Exception in try block of a try-finally
            // 5) Exception in catch block of a try-catch-finally
            // When analyzing a control flow graph that starts inside a finally block we want to consider all
            // five possibilities above. However, when analyzing a control flow graph that starts outside (past)
            // the finally block, we only want to consider the first two (if we're past a finally block then it
            // must have completed normally). Likewise, when analyzing a control flow graph from return statements
            // in try or catch blocks in an IIFE, we only want to consider the third. To make this possible, we
            // inject a ReduceLabel node into the control flow graph. This node contains an alternate reduced
            // set of antecedents for the pre-finally label. As control flow analysis passes by a ReduceLabel
            // node, the pre-finally label is temporarily switched to the reduced antecedent set.
            var finallyLabel = createBranchLabel();
            finallyLabel.antecedents = (0, ts_1.concatenate)((0, ts_1.concatenate)(normalExitLabel.antecedents, exceptionLabel.antecedents), returnLabel.antecedents);
            currentFlow = finallyLabel;
            bind(node.finallyBlock);
            if (currentFlow.flags & 1 /* FlowFlags.Unreachable */) {
                // If the end of the finally block is unreachable, the end of the entire try statement is unreachable.
                currentFlow = unreachableFlow;
            }
            else {
                // If we have an IIFE return target and return statements in the try or catch blocks, add a control
                // flow that goes back through the finally block and back through only the return statements.
                if (currentReturnTarget && returnLabel.antecedents) {
                    addAntecedent(currentReturnTarget, createReduceLabel(finallyLabel, returnLabel.antecedents, currentFlow));
                }
                // If we have an outer exception target (i.e. a containing try-finally or try-catch-finally), add a
                // control flow that goes back through the finally blok and back through each possible exception source.
                if (currentExceptionTarget && exceptionLabel.antecedents) {
                    addAntecedent(currentExceptionTarget, createReduceLabel(finallyLabel, exceptionLabel.antecedents, currentFlow));
                }
                // If the end of the finally block is reachable, but the end of the try and catch blocks are not,
                // convert the current flow to unreachable. For example, 'try { return 1; } finally { ... }' should
                // result in an unreachable current control flow.
                currentFlow = normalExitLabel.antecedents ? createReduceLabel(finallyLabel, normalExitLabel.antecedents, currentFlow) : unreachableFlow;
            }
        }
        else {
            currentFlow = finishFlowLabel(normalExitLabel);
        }
    }
    function bindSwitchStatement(node) {
        var postSwitchLabel = createBranchLabel();
        bind(node.expression);
        var saveBreakTarget = currentBreakTarget;
        var savePreSwitchCaseFlow = preSwitchCaseFlow;
        currentBreakTarget = postSwitchLabel;
        preSwitchCaseFlow = currentFlow;
        bind(node.caseBlock);
        addAntecedent(postSwitchLabel, currentFlow);
        var hasDefault = (0, ts_1.forEach)(node.caseBlock.clauses, function (c) { return c.kind === 296 /* SyntaxKind.DefaultClause */; });
        // We mark a switch statement as possibly exhaustive if it has no default clause and if all
        // case clauses have unreachable end points (e.g. they all return). Note, we no longer need
        // this property in control flow analysis, it's there only for backwards compatibility.
        node.possiblyExhaustive = !hasDefault && !postSwitchLabel.antecedents;
        if (!hasDefault) {
            addAntecedent(postSwitchLabel, createFlowSwitchClause(preSwitchCaseFlow, node, 0, 0));
        }
        currentBreakTarget = saveBreakTarget;
        preSwitchCaseFlow = savePreSwitchCaseFlow;
        currentFlow = finishFlowLabel(postSwitchLabel);
    }
    function bindCaseBlock(node) {
        var clauses = node.clauses;
        var isNarrowingSwitch = isNarrowingExpression(node.parent.expression);
        var fallthroughFlow = unreachableFlow;
        for (var i = 0; i < clauses.length; i++) {
            var clauseStart = i;
            while (!clauses[i].statements.length && i + 1 < clauses.length) {
                bind(clauses[i]);
                i++;
            }
            var preCaseLabel = createBranchLabel();
            addAntecedent(preCaseLabel, isNarrowingSwitch ? createFlowSwitchClause(preSwitchCaseFlow, node.parent, clauseStart, i + 1) : preSwitchCaseFlow);
            addAntecedent(preCaseLabel, fallthroughFlow);
            currentFlow = finishFlowLabel(preCaseLabel);
            var clause = clauses[i];
            bind(clause);
            fallthroughFlow = currentFlow;
            if (!(currentFlow.flags & 1 /* FlowFlags.Unreachable */) && i !== clauses.length - 1 && options.noFallthroughCasesInSwitch) {
                clause.fallthroughFlowNode = currentFlow;
            }
        }
    }
    function bindCaseClause(node) {
        var saveCurrentFlow = currentFlow;
        currentFlow = preSwitchCaseFlow;
        bind(node.expression);
        currentFlow = saveCurrentFlow;
        bindEach(node.statements);
    }
    function bindExpressionStatement(node) {
        bind(node.expression);
        maybeBindExpressionFlowIfCall(node.expression);
    }
    function maybeBindExpressionFlowIfCall(node) {
        // A top level or comma expression call expression with a dotted function name and at least one argument
        // is potentially an assertion and is therefore included in the control flow.
        if (node.kind === 212 /* SyntaxKind.CallExpression */) {
            var call = node;
            if (call.expression.kind !== 108 /* SyntaxKind.SuperKeyword */ && (0, ts_1.isDottedName)(call.expression)) {
                currentFlow = createFlowCall(currentFlow, call);
            }
        }
    }
    function bindLabeledStatement(node) {
        var postStatementLabel = createBranchLabel();
        activeLabelList = {
            next: activeLabelList,
            name: node.label.escapedText,
            breakTarget: postStatementLabel,
            continueTarget: undefined,
            referenced: false
        };
        bind(node.label);
        bind(node.statement);
        if (!activeLabelList.referenced && !options.allowUnusedLabels) {
            errorOrSuggestionOnNode((0, ts_1.unusedLabelIsError)(options), node.label, ts_1.Diagnostics.Unused_label);
        }
        activeLabelList = activeLabelList.next;
        addAntecedent(postStatementLabel, currentFlow);
        currentFlow = finishFlowLabel(postStatementLabel);
    }
    function bindDestructuringTargetFlow(node) {
        if (node.kind === 225 /* SyntaxKind.BinaryExpression */ && node.operatorToken.kind === 64 /* SyntaxKind.EqualsToken */) {
            bindAssignmentTargetFlow(node.left);
        }
        else {
            bindAssignmentTargetFlow(node);
        }
    }
    function bindAssignmentTargetFlow(node) {
        if (isNarrowableReference(node)) {
            currentFlow = createFlowMutation(16 /* FlowFlags.Assignment */, currentFlow, node);
        }
        else if (node.kind === 208 /* SyntaxKind.ArrayLiteralExpression */) {
            for (var _i = 0, _a = node.elements; _i < _a.length; _i++) {
                var e = _a[_i];
                if (e.kind === 229 /* SyntaxKind.SpreadElement */) {
                    bindAssignmentTargetFlow(e.expression);
                }
                else {
                    bindDestructuringTargetFlow(e);
                }
            }
        }
        else if (node.kind === 209 /* SyntaxKind.ObjectLiteralExpression */) {
            for (var _b = 0, _c = node.properties; _b < _c.length; _b++) {
                var p = _c[_b];
                if (p.kind === 302 /* SyntaxKind.PropertyAssignment */) {
                    bindDestructuringTargetFlow(p.initializer);
                }
                else if (p.kind === 303 /* SyntaxKind.ShorthandPropertyAssignment */) {
                    bindAssignmentTargetFlow(p.name);
                }
                else if (p.kind === 304 /* SyntaxKind.SpreadAssignment */) {
                    bindAssignmentTargetFlow(p.expression);
                }
            }
        }
    }
    function bindLogicalLikeExpression(node, trueTarget, falseTarget) {
        var preRightLabel = createBranchLabel();
        if (node.operatorToken.kind === 56 /* SyntaxKind.AmpersandAmpersandToken */ || node.operatorToken.kind === 77 /* SyntaxKind.AmpersandAmpersandEqualsToken */) {
            bindCondition(node.left, preRightLabel, falseTarget);
        }
        else {
            bindCondition(node.left, trueTarget, preRightLabel);
        }
        currentFlow = finishFlowLabel(preRightLabel);
        bind(node.operatorToken);
        if ((0, ts_1.isLogicalOrCoalescingAssignmentOperator)(node.operatorToken.kind)) {
            doWithConditionalBranches(bind, node.right, trueTarget, falseTarget);
            bindAssignmentTargetFlow(node.left);
            addAntecedent(trueTarget, createFlowCondition(32 /* FlowFlags.TrueCondition */, currentFlow, node));
            addAntecedent(falseTarget, createFlowCondition(64 /* FlowFlags.FalseCondition */, currentFlow, node));
        }
        else {
            bindCondition(node.right, trueTarget, falseTarget);
        }
    }
    function bindPrefixUnaryExpressionFlow(node) {
        if (node.operator === 54 /* SyntaxKind.ExclamationToken */) {
            var saveTrueTarget = currentTrueTarget;
            currentTrueTarget = currentFalseTarget;
            currentFalseTarget = saveTrueTarget;
            bindEachChild(node);
            currentFalseTarget = currentTrueTarget;
            currentTrueTarget = saveTrueTarget;
        }
        else {
            bindEachChild(node);
            if (node.operator === 46 /* SyntaxKind.PlusPlusToken */ || node.operator === 47 /* SyntaxKind.MinusMinusToken */) {
                bindAssignmentTargetFlow(node.operand);
            }
        }
    }
    function bindPostfixUnaryExpressionFlow(node) {
        bindEachChild(node);
        if (node.operator === 46 /* SyntaxKind.PlusPlusToken */ || node.operator === 47 /* SyntaxKind.MinusMinusToken */) {
            bindAssignmentTargetFlow(node.operand);
        }
    }
    function bindDestructuringAssignmentFlow(node) {
        if (inAssignmentPattern) {
            inAssignmentPattern = false;
            bind(node.operatorToken);
            bind(node.right);
            inAssignmentPattern = true;
            bind(node.left);
        }
        else {
            inAssignmentPattern = true;
            bind(node.left);
            inAssignmentPattern = false;
            bind(node.operatorToken);
            bind(node.right);
        }
        bindAssignmentTargetFlow(node.left);
    }
    function createBindBinaryExpressionFlow() {
        return (0, ts_1.createBinaryExpressionTrampoline)(onEnter, onLeft, onOperator, onRight, onExit, /*foldState*/ undefined);
        function onEnter(node, state) {
            if (state) {
                state.stackIndex++;
                // Emulate the work that `bind` does before reaching `bindChildren`. A normal call to
                // `bindBinaryExpressionFlow` will already have done this work.
                (0, ts_1.setParent)(node, parent);
                var saveInStrictMode = inStrictMode;
                bindWorker(node);
                var saveParent = parent;
                parent = node;
                state.skip = false;
                state.inStrictModeStack[state.stackIndex] = saveInStrictMode;
                state.parentStack[state.stackIndex] = saveParent;
            }
            else {
                state = {
                    stackIndex: 0,
                    skip: false,
                    inStrictModeStack: [undefined],
                    parentStack: [undefined]
                };
            }
            // TODO: bindLogicalExpression is recursive - if we want to handle deeply nested `&&` expressions
            // we'll need to handle the `bindLogicalExpression` scenarios in this state machine, too
            // For now, though, since the common cases are chained `+`, leaving it recursive is fine
            var operator = node.operatorToken.kind;
            if ((0, ts_1.isLogicalOrCoalescingBinaryOperator)(operator) || (0, ts_1.isLogicalOrCoalescingAssignmentOperator)(operator)) {
                if (isTopLevelLogicalExpression(node)) {
                    var postExpressionLabel = createBranchLabel();
                    bindLogicalLikeExpression(node, postExpressionLabel, postExpressionLabel);
                    currentFlow = finishFlowLabel(postExpressionLabel);
                }
                else {
                    bindLogicalLikeExpression(node, currentTrueTarget, currentFalseTarget);
                }
                state.skip = true;
            }
            return state;
        }
        function onLeft(left, state, node) {
            if (!state.skip) {
                var maybeBound = maybeBind(left);
                if (node.operatorToken.kind === 28 /* SyntaxKind.CommaToken */) {
                    maybeBindExpressionFlowIfCall(left);
                }
                return maybeBound;
            }
        }
        function onOperator(operatorToken, state, _node) {
            if (!state.skip) {
                bind(operatorToken);
            }
        }
        function onRight(right, state, node) {
            if (!state.skip) {
                var maybeBound = maybeBind(right);
                if (node.operatorToken.kind === 28 /* SyntaxKind.CommaToken */) {
                    maybeBindExpressionFlowIfCall(right);
                }
                return maybeBound;
            }
        }
        function onExit(node, state) {
            if (!state.skip) {
                var operator = node.operatorToken.kind;
                if ((0, ts_1.isAssignmentOperator)(operator) && !(0, ts_1.isAssignmentTarget)(node)) {
                    bindAssignmentTargetFlow(node.left);
                    if (operator === 64 /* SyntaxKind.EqualsToken */ && node.left.kind === 211 /* SyntaxKind.ElementAccessExpression */) {
                        var elementAccess = node.left;
                        if (isNarrowableOperand(elementAccess.expression)) {
                            currentFlow = createFlowMutation(256 /* FlowFlags.ArrayMutation */, currentFlow, node);
                        }
                    }
                }
            }
            var savedInStrictMode = state.inStrictModeStack[state.stackIndex];
            var savedParent = state.parentStack[state.stackIndex];
            if (savedInStrictMode !== undefined) {
                inStrictMode = savedInStrictMode;
            }
            if (savedParent !== undefined) {
                parent = savedParent;
            }
            state.skip = false;
            state.stackIndex--;
        }
        function maybeBind(node) {
            if (node && (0, ts_1.isBinaryExpression)(node) && !(0, ts_1.isDestructuringAssignment)(node)) {
                return node;
            }
            bind(node);
        }
    }
    function bindDeleteExpressionFlow(node) {
        bindEachChild(node);
        if (node.expression.kind === 210 /* SyntaxKind.PropertyAccessExpression */) {
            bindAssignmentTargetFlow(node.expression);
        }
    }
    function bindConditionalExpressionFlow(node) {
        var trueLabel = createBranchLabel();
        var falseLabel = createBranchLabel();
        var postExpressionLabel = createBranchLabel();
        bindCondition(node.condition, trueLabel, falseLabel);
        currentFlow = finishFlowLabel(trueLabel);
        bind(node.questionToken);
        bind(node.whenTrue);
        addAntecedent(postExpressionLabel, currentFlow);
        currentFlow = finishFlowLabel(falseLabel);
        bind(node.colonToken);
        bind(node.whenFalse);
        addAntecedent(postExpressionLabel, currentFlow);
        currentFlow = finishFlowLabel(postExpressionLabel);
    }
    function bindInitializedVariableFlow(node) {
        var name = !(0, ts_1.isOmittedExpression)(node) ? node.name : undefined;
        if ((0, ts_1.isBindingPattern)(name)) {
            for (var _i = 0, _a = name.elements; _i < _a.length; _i++) {
                var child = _a[_i];
                bindInitializedVariableFlow(child);
            }
        }
        else {
            currentFlow = createFlowMutation(16 /* FlowFlags.Assignment */, currentFlow, node);
        }
    }
    function bindVariableDeclarationFlow(node) {
        bindEachChild(node);
        if (node.initializer || (0, ts_1.isForInOrOfStatement)(node.parent.parent)) {
            bindInitializedVariableFlow(node);
        }
    }
    function bindBindingElementFlow(node) {
        // When evaluating a binding pattern, the initializer is evaluated before the binding pattern, per:
        // - https://tc39.es/ecma262/#sec-destructuring-binding-patterns-runtime-semantics-iteratorbindinginitialization
        //   - `BindingElement: BindingPattern Initializer?`
        // - https://tc39.es/ecma262/#sec-runtime-semantics-keyedbindinginitialization
        //   - `BindingElement: BindingPattern Initializer?`
        bind(node.dotDotDotToken);
        bind(node.propertyName);
        bindInitializer(node.initializer);
        bind(node.name);
    }
    function bindParameterFlow(node) {
        bindEach(node.modifiers);
        bind(node.dotDotDotToken);
        bind(node.questionToken);
        bind(node.type);
        bindInitializer(node.initializer);
        bind(node.name);
    }
    // a BindingElement/Parameter does not have side effects if initializers are not evaluated and used. (see GH#49759)
    function bindInitializer(node) {
        if (!node) {
            return;
        }
        var entryFlow = currentFlow;
        bind(node);
        if (entryFlow === unreachableFlow || entryFlow === currentFlow) {
            return;
        }
        var exitFlow = createBranchLabel();
        addAntecedent(exitFlow, entryFlow);
        addAntecedent(exitFlow, currentFlow);
        currentFlow = finishFlowLabel(exitFlow);
    }
    function bindJSDocTypeAlias(node) {
        bind(node.tagName);
        if (node.kind !== 346 /* SyntaxKind.JSDocEnumTag */ && node.fullName) {
            // don't bind the type name yet; that's delayed until delayedBindJSDocTypedefTag
            (0, ts_1.setParent)(node.fullName, node);
            (0, ts_1.setParentRecursive)(node.fullName, /*incremental*/ false);
        }
        if (typeof node.comment !== "string") {
            bindEach(node.comment);
        }
    }
    function bindJSDocClassTag(node) {
        bindEachChild(node);
        var host = (0, ts_1.getHostSignatureFromJSDoc)(node);
        if (host && host.kind !== 173 /* SyntaxKind.MethodDeclaration */) {
            addDeclarationToSymbol(host.symbol, host, 32 /* SymbolFlags.Class */);
        }
    }
    function bindOptionalExpression(node, trueTarget, falseTarget) {
        doWithConditionalBranches(bind, node, trueTarget, falseTarget);
        if (!(0, ts_1.isOptionalChain)(node) || (0, ts_1.isOutermostOptionalChain)(node)) {
            addAntecedent(trueTarget, createFlowCondition(32 /* FlowFlags.TrueCondition */, currentFlow, node));
            addAntecedent(falseTarget, createFlowCondition(64 /* FlowFlags.FalseCondition */, currentFlow, node));
        }
    }
    function bindOptionalChainRest(node) {
        switch (node.kind) {
            case 210 /* SyntaxKind.PropertyAccessExpression */:
                bind(node.questionDotToken);
                bind(node.name);
                break;
            case 211 /* SyntaxKind.ElementAccessExpression */:
                bind(node.questionDotToken);
                bind(node.argumentExpression);
                break;
            case 212 /* SyntaxKind.CallExpression */:
                bind(node.questionDotToken);
                bindEach(node.typeArguments);
                bindEach(node.arguments);
                break;
        }
    }
    function bindOptionalChain(node, trueTarget, falseTarget) {
        // For an optional chain, we emulate the behavior of a logical expression:
        //
        // a?.b         -> a && a.b
        // a?.b.c       -> a && a.b.c
        // a?.b?.c      -> a && a.b && a.b.c
        // a?.[x = 1]   -> a && a[x = 1]
        //
        // To do this we descend through the chain until we reach the root of a chain (the expression with a `?.`)
        // and build it's CFA graph as if it were the first condition (`a && ...`). Then we bind the rest
        // of the node as part of the "true" branch, and continue to do so as we ascend back up to the outermost
        // chain node. We then treat the entire node as the right side of the expression.
        var preChainLabel = (0, ts_1.isOptionalChainRoot)(node) ? createBranchLabel() : undefined;
        bindOptionalExpression(node.expression, preChainLabel || trueTarget, falseTarget);
        if (preChainLabel) {
            currentFlow = finishFlowLabel(preChainLabel);
        }
        doWithConditionalBranches(bindOptionalChainRest, node, trueTarget, falseTarget);
        if ((0, ts_1.isOutermostOptionalChain)(node)) {
            addAntecedent(trueTarget, createFlowCondition(32 /* FlowFlags.TrueCondition */, currentFlow, node));
            addAntecedent(falseTarget, createFlowCondition(64 /* FlowFlags.FalseCondition */, currentFlow, node));
        }
    }
    function bindOptionalChainFlow(node) {
        if (isTopLevelLogicalExpression(node)) {
            var postExpressionLabel = createBranchLabel();
            bindOptionalChain(node, postExpressionLabel, postExpressionLabel);
            currentFlow = finishFlowLabel(postExpressionLabel);
        }
        else {
            bindOptionalChain(node, currentTrueTarget, currentFalseTarget);
        }
    }
    function bindNonNullExpressionFlow(node) {
        if ((0, ts_1.isOptionalChain)(node)) {
            bindOptionalChainFlow(node);
        }
        else {
            bindEachChild(node);
        }
    }
    function bindAccessExpressionFlow(node) {
        if ((0, ts_1.isOptionalChain)(node)) {
            bindOptionalChainFlow(node);
        }
        else {
            bindEachChild(node);
        }
    }
    function bindCallExpressionFlow(node) {
        if ((0, ts_1.isOptionalChain)(node)) {
            bindOptionalChainFlow(node);
        }
        else {
            // If the target of the call expression is a function expression or arrow function we have
            // an immediately invoked function expression (IIFE). Initialize the flowNode property to
            // the current control flow (which includes evaluation of the IIFE arguments).
            var expr = (0, ts_1.skipParentheses)(node.expression);
            if (expr.kind === 217 /* SyntaxKind.FunctionExpression */ || expr.kind === 218 /* SyntaxKind.ArrowFunction */) {
                bindEach(node.typeArguments);
                bindEach(node.arguments);
                bind(node.expression);
            }
            else {
                bindEachChild(node);
                if (node.expression.kind === 108 /* SyntaxKind.SuperKeyword */) {
                    currentFlow = createFlowCall(currentFlow, node);
                }
            }
        }
        if (node.expression.kind === 210 /* SyntaxKind.PropertyAccessExpression */) {
            var propertyAccess = node.expression;
            if ((0, ts_1.isIdentifier)(propertyAccess.name) && isNarrowableOperand(propertyAccess.expression) && (0, ts_1.isPushOrUnshiftIdentifier)(propertyAccess.name)) {
                currentFlow = createFlowMutation(256 /* FlowFlags.ArrayMutation */, currentFlow, node);
            }
        }
    }
    function addToContainerChain(next) {
        if (lastContainer) {
            lastContainer.nextContainer = next;
        }
        lastContainer = next;
    }
    function declareSymbolAndAddToSymbolTable(node, symbolFlags, symbolExcludes) {
        switch (container.kind) {
            // Modules, source files, and classes need specialized handling for how their
            // members are declared (for example, a member of a class will go into a specific
            // symbol table depending on if it is static or not). We defer to specialized
            // handlers to take care of declaring these child members.
            case 266 /* SyntaxKind.ModuleDeclaration */:
                return declareModuleMember(node, symbolFlags, symbolExcludes);
            case 311 /* SyntaxKind.SourceFile */:
                return declareSourceFileMember(node, symbolFlags, symbolExcludes);
            case 230 /* SyntaxKind.ClassExpression */:
            case 262 /* SyntaxKind.ClassDeclaration */:
                return declareClassMember(node, symbolFlags, symbolExcludes);
            case 265 /* SyntaxKind.EnumDeclaration */:
                return declareSymbol(container.symbol.exports, container.symbol, node, symbolFlags, symbolExcludes);
            case 186 /* SyntaxKind.TypeLiteral */:
            case 328 /* SyntaxKind.JSDocTypeLiteral */:
            case 209 /* SyntaxKind.ObjectLiteralExpression */:
            case 263 /* SyntaxKind.InterfaceDeclaration */:
            case 291 /* SyntaxKind.JsxAttributes */:
                // Interface/Object-types always have their children added to the 'members' of
                // their container. They are only accessible through an instance of their
                // container, and are never in scope otherwise (even inside the body of the
                // object / type / interface declaring them). An exception is type parameters,
                // which are in scope without qualification (similar to 'locals').
                return declareSymbol(container.symbol.members, container.symbol, node, symbolFlags, symbolExcludes);
            case 183 /* SyntaxKind.FunctionType */:
            case 184 /* SyntaxKind.ConstructorType */:
            case 178 /* SyntaxKind.CallSignature */:
            case 179 /* SyntaxKind.ConstructSignature */:
            case 329 /* SyntaxKind.JSDocSignature */:
            case 180 /* SyntaxKind.IndexSignature */:
            case 173 /* SyntaxKind.MethodDeclaration */:
            case 172 /* SyntaxKind.MethodSignature */:
            case 175 /* SyntaxKind.Constructor */:
            case 176 /* SyntaxKind.GetAccessor */:
            case 177 /* SyntaxKind.SetAccessor */:
            case 261 /* SyntaxKind.FunctionDeclaration */:
            case 217 /* SyntaxKind.FunctionExpression */:
            case 218 /* SyntaxKind.ArrowFunction */:
            case 323 /* SyntaxKind.JSDocFunctionType */:
            case 174 /* SyntaxKind.ClassStaticBlockDeclaration */:
            case 264 /* SyntaxKind.TypeAliasDeclaration */:
            case 199 /* SyntaxKind.MappedType */:
                // All the children of these container types are never visible through another
                // symbol (i.e. through another symbol's 'exports' or 'members').  Instead,
                // they're only accessed 'lexically' (i.e. from code that exists underneath
                // their container in the tree). To accomplish this, we simply add their declared
                // symbol to the 'locals' of the container.  These symbols can then be found as
                // the type checker walks up the containers, checking them for matching names.
                if (container.locals)
                    ts_1.Debug.assertNode(container, ts_1.canHaveLocals);
                return declareSymbol(container.locals, /*parent*/ undefined, node, symbolFlags, symbolExcludes);
        }
    }
    function declareClassMember(node, symbolFlags, symbolExcludes) {
        return (0, ts_1.isStatic)(node)
            ? declareSymbol(container.symbol.exports, container.symbol, node, symbolFlags, symbolExcludes)
            : declareSymbol(container.symbol.members, container.symbol, node, symbolFlags, symbolExcludes);
    }
    function declareSourceFileMember(node, symbolFlags, symbolExcludes) {
        return (0, ts_1.isExternalModule)(file)
            ? declareModuleMember(node, symbolFlags, symbolExcludes)
            : declareSymbol(file.locals, /*parent*/ undefined, node, symbolFlags, symbolExcludes);
    }
    function hasExportDeclarations(node) {
        var body = (0, ts_1.isSourceFile)(node) ? node : (0, ts_1.tryCast)(node.body, ts_1.isModuleBlock);
        return !!body && body.statements.some(function (s) { return (0, ts_1.isExportDeclaration)(s) || (0, ts_1.isExportAssignment)(s); });
    }
    function setExportContextFlag(node) {
        // A declaration source file or ambient module declaration that contains no export declarations (but possibly regular
        // declarations with export modifiers) is an export context in which declarations are implicitly exported.
        if (node.flags & 16777216 /* NodeFlags.Ambient */ && !hasExportDeclarations(node)) {
            node.flags |= 64 /* NodeFlags.ExportContext */;
        }
        else {
            node.flags &= ~64 /* NodeFlags.ExportContext */;
        }
    }
    function bindModuleDeclaration(node) {
        setExportContextFlag(node);
        if ((0, ts_1.isAmbientModule)(node)) {
            if ((0, ts_1.hasSyntacticModifier)(node, 1 /* ModifierFlags.Export */)) {
                errorOnFirstToken(node, ts_1.Diagnostics.export_modifier_cannot_be_applied_to_ambient_modules_and_module_augmentations_since_they_are_always_visible);
            }
            if ((0, ts_1.isModuleAugmentationExternal)(node)) {
                declareModuleSymbol(node);
            }
            else {
                var pattern = void 0;
                if (node.name.kind === 11 /* SyntaxKind.StringLiteral */) {
                    var text = node.name.text;
                    pattern = (0, ts_1.tryParsePattern)(text);
                    if (pattern === undefined) {
                        errorOnFirstToken(node.name, ts_1.Diagnostics.Pattern_0_can_have_at_most_one_Asterisk_character, text);
                    }
                }
                var symbol = declareSymbolAndAddToSymbolTable(node, 512 /* SymbolFlags.ValueModule */, 110735 /* SymbolFlags.ValueModuleExcludes */);
                file.patternAmbientModules = (0, ts_1.append)(file.patternAmbientModules, pattern && !(0, ts_1.isString)(pattern) ? { pattern: pattern, symbol: symbol } : undefined);
            }
        }
        else {
            var state = declareModuleSymbol(node);
            if (state !== 0 /* ModuleInstanceState.NonInstantiated */) {
                var symbol = node.symbol;
                // if module was already merged with some function, class or non-const enum, treat it as non-const-enum-only
                symbol.constEnumOnlyModule = (!(symbol.flags & (16 /* SymbolFlags.Function */ | 32 /* SymbolFlags.Class */ | 256 /* SymbolFlags.RegularEnum */)))
                    // Current must be `const enum` only
                    && state === 2 /* ModuleInstanceState.ConstEnumOnly */
                    // Can't have been set to 'false' in a previous merged symbol. ('undefined' OK)
                    && symbol.constEnumOnlyModule !== false;
            }
        }
    }
    function declareModuleSymbol(node) {
        var state = getModuleInstanceState(node);
        var instantiated = state !== 0 /* ModuleInstanceState.NonInstantiated */;
        declareSymbolAndAddToSymbolTable(node, instantiated ? 512 /* SymbolFlags.ValueModule */ : 1024 /* SymbolFlags.NamespaceModule */, instantiated ? 110735 /* SymbolFlags.ValueModuleExcludes */ : 0 /* SymbolFlags.NamespaceModuleExcludes */);
        return state;
    }
    function bindFunctionOrConstructorType(node) {
        // For a given function symbol "<...>(...) => T" we want to generate a symbol identical
        // to the one we would get for: { <...>(...): T }
        //
        // We do that by making an anonymous type literal symbol, and then setting the function
        // symbol as its sole member. To the rest of the system, this symbol will be indistinguishable
        // from an actual type literal symbol you would have gotten had you used the long form.
        var symbol = createSymbol(131072 /* SymbolFlags.Signature */, getDeclarationName(node)); // TODO: GH#18217
        addDeclarationToSymbol(symbol, node, 131072 /* SymbolFlags.Signature */);
        var typeLiteralSymbol = createSymbol(2048 /* SymbolFlags.TypeLiteral */, "__type" /* InternalSymbolName.Type */);
        addDeclarationToSymbol(typeLiteralSymbol, node, 2048 /* SymbolFlags.TypeLiteral */);
        typeLiteralSymbol.members = (0, ts_1.createSymbolTable)();
        typeLiteralSymbol.members.set(symbol.escapedName, symbol);
    }
    function bindObjectLiteralExpression(node) {
        return bindAnonymousDeclaration(node, 4096 /* SymbolFlags.ObjectLiteral */, "__object" /* InternalSymbolName.Object */);
    }
    function bindJsxAttributes(node) {
        return bindAnonymousDeclaration(node, 4096 /* SymbolFlags.ObjectLiteral */, "__jsxAttributes" /* InternalSymbolName.JSXAttributes */);
    }
    function bindJsxAttribute(node, symbolFlags, symbolExcludes) {
        return declareSymbolAndAddToSymbolTable(node, symbolFlags, symbolExcludes);
    }
    function bindAnonymousDeclaration(node, symbolFlags, name) {
        var symbol = createSymbol(symbolFlags, name);
        if (symbolFlags & (8 /* SymbolFlags.EnumMember */ | 106500 /* SymbolFlags.ClassMember */)) {
            symbol.parent = container.symbol;
        }
        addDeclarationToSymbol(symbol, node, symbolFlags);
        return symbol;
    }
    function bindBlockScopedDeclaration(node, symbolFlags, symbolExcludes) {
        switch (blockScopeContainer.kind) {
            case 266 /* SyntaxKind.ModuleDeclaration */:
                declareModuleMember(node, symbolFlags, symbolExcludes);
                break;
            case 311 /* SyntaxKind.SourceFile */:
                if ((0, ts_1.isExternalOrCommonJsModule)(container)) {
                    declareModuleMember(node, symbolFlags, symbolExcludes);
                    break;
                }
            // falls through
            default:
                ts_1.Debug.assertNode(blockScopeContainer, ts_1.canHaveLocals);
                if (!blockScopeContainer.locals) {
                    blockScopeContainer.locals = (0, ts_1.createSymbolTable)();
                    addToContainerChain(blockScopeContainer);
                }
                declareSymbol(blockScopeContainer.locals, /*parent*/ undefined, node, symbolFlags, symbolExcludes);
        }
    }
    function delayedBindJSDocTypedefTag() {
        if (!delayedTypeAliases) {
            return;
        }
        var saveContainer = container;
        var saveLastContainer = lastContainer;
        var saveBlockScopeContainer = blockScopeContainer;
        var saveParent = parent;
        var saveCurrentFlow = currentFlow;
        for (var _i = 0, delayedTypeAliases_1 = delayedTypeAliases; _i < delayedTypeAliases_1.length; _i++) {
            var typeAlias = delayedTypeAliases_1[_i];
            var host = typeAlias.parent.parent;
            container = (0, ts_1.findAncestor)(host.parent, function (n) { return !!(getContainerFlags(n) & 1 /* ContainerFlags.IsContainer */); }) || file;
            blockScopeContainer = (0, ts_1.getEnclosingBlockScopeContainer)(host) || file;
            currentFlow = initFlowNode({ flags: 2 /* FlowFlags.Start */ });
            parent = typeAlias;
            bind(typeAlias.typeExpression);
            var declName = (0, ts_1.getNameOfDeclaration)(typeAlias);
            if (((0, ts_1.isJSDocEnumTag)(typeAlias) || !typeAlias.fullName) && declName && (0, ts_1.isPropertyAccessEntityNameExpression)(declName.parent)) {
                // typedef anchored to an A.B.C assignment - we need to bind into B's namespace under name C
                var isTopLevel = isTopLevelNamespaceAssignment(declName.parent);
                if (isTopLevel) {
                    bindPotentiallyMissingNamespaces(file.symbol, declName.parent, isTopLevel, !!(0, ts_1.findAncestor)(declName, function (d) { return (0, ts_1.isPropertyAccessExpression)(d) && d.name.escapedText === "prototype"; }), /*containerIsClass*/ false);
                    var oldContainer = container;
                    switch ((0, ts_1.getAssignmentDeclarationPropertyAccessKind)(declName.parent)) {
                        case 1 /* AssignmentDeclarationKind.ExportsProperty */:
                        case 2 /* AssignmentDeclarationKind.ModuleExports */:
                            if (!(0, ts_1.isExternalOrCommonJsModule)(file)) {
                                container = undefined;
                            }
                            else {
                                container = file;
                            }
                            break;
                        case 4 /* AssignmentDeclarationKind.ThisProperty */:
                            container = declName.parent.expression;
                            break;
                        case 3 /* AssignmentDeclarationKind.PrototypeProperty */:
                            container = declName.parent.expression.name;
                            break;
                        case 5 /* AssignmentDeclarationKind.Property */:
                            container = isExportsOrModuleExportsOrAlias(file, declName.parent.expression) ? file
                                : (0, ts_1.isPropertyAccessExpression)(declName.parent.expression) ? declName.parent.expression.name
                                    : declName.parent.expression;
                            break;
                        case 0 /* AssignmentDeclarationKind.None */:
                            return ts_1.Debug.fail("Shouldn't have detected typedef or enum on non-assignment declaration");
                    }
                    if (container) {
                        declareModuleMember(typeAlias, 524288 /* SymbolFlags.TypeAlias */, 788968 /* SymbolFlags.TypeAliasExcludes */);
                    }
                    container = oldContainer;
                }
            }
            else if ((0, ts_1.isJSDocEnumTag)(typeAlias) || !typeAlias.fullName || typeAlias.fullName.kind === 80 /* SyntaxKind.Identifier */) {
                parent = typeAlias.parent;
                bindBlockScopedDeclaration(typeAlias, 524288 /* SymbolFlags.TypeAlias */, 788968 /* SymbolFlags.TypeAliasExcludes */);
            }
            else {
                bind(typeAlias.fullName);
            }
        }
        container = saveContainer;
        lastContainer = saveLastContainer;
        blockScopeContainer = saveBlockScopeContainer;
        parent = saveParent;
        currentFlow = saveCurrentFlow;
    }
    // The binder visits every node in the syntax tree so it is a convenient place to perform a single localized
    // check for reserved words used as identifiers in strict mode code, as well as `yield` or `await` in
    // [Yield] or [Await] contexts, respectively.
    function checkContextualIdentifier(node) {
        // Report error only if there are no parse errors in file
        if (!file.parseDiagnostics.length &&
            !(node.flags & 16777216 /* NodeFlags.Ambient */) &&
            !(node.flags & 8388608 /* NodeFlags.JSDoc */) &&
            !(0, ts_1.isIdentifierName)(node)) {
            // strict mode identifiers
            var originalKeywordKind = (0, ts_1.identifierToKeywordKind)(node);
            if (originalKeywordKind === undefined) {
                return;
            }
            if (inStrictMode &&
                originalKeywordKind >= 119 /* SyntaxKind.FirstFutureReservedWord */ &&
                originalKeywordKind <= 127 /* SyntaxKind.LastFutureReservedWord */) {
                file.bindDiagnostics.push(createDiagnosticForNode(node, getStrictModeIdentifierMessage(node), (0, ts_1.declarationNameToString)(node)));
            }
            else if (originalKeywordKind === 135 /* SyntaxKind.AwaitKeyword */) {
                if ((0, ts_1.isExternalModule)(file) && (0, ts_1.isInTopLevelContext)(node)) {
                    file.bindDiagnostics.push(createDiagnosticForNode(node, ts_1.Diagnostics.Identifier_expected_0_is_a_reserved_word_at_the_top_level_of_a_module, (0, ts_1.declarationNameToString)(node)));
                }
                else if (node.flags & 32768 /* NodeFlags.AwaitContext */) {
                    file.bindDiagnostics.push(createDiagnosticForNode(node, ts_1.Diagnostics.Identifier_expected_0_is_a_reserved_word_that_cannot_be_used_here, (0, ts_1.declarationNameToString)(node)));
                }
            }
            else if (originalKeywordKind === 127 /* SyntaxKind.YieldKeyword */ && node.flags & 8192 /* NodeFlags.YieldContext */) {
                file.bindDiagnostics.push(createDiagnosticForNode(node, ts_1.Diagnostics.Identifier_expected_0_is_a_reserved_word_that_cannot_be_used_here, (0, ts_1.declarationNameToString)(node)));
            }
        }
    }
    function getStrictModeIdentifierMessage(node) {
        // Provide specialized messages to help the user understand why we think they're in
        // strict mode.
        if ((0, ts_1.getContainingClass)(node)) {
            return ts_1.Diagnostics.Identifier_expected_0_is_a_reserved_word_in_strict_mode_Class_definitions_are_automatically_in_strict_mode;
        }
        if (file.externalModuleIndicator) {
            return ts_1.Diagnostics.Identifier_expected_0_is_a_reserved_word_in_strict_mode_Modules_are_automatically_in_strict_mode;
        }
        return ts_1.Diagnostics.Identifier_expected_0_is_a_reserved_word_in_strict_mode;
    }
    // The binder visits every node, so this is a good place to check for
    // the reserved private name (there is only one)
    function checkPrivateIdentifier(node) {
        if (node.escapedText === "#constructor") {
            // Report error only if there are no parse errors in file
            if (!file.parseDiagnostics.length) {
                file.bindDiagnostics.push(createDiagnosticForNode(node, ts_1.Diagnostics.constructor_is_a_reserved_word, (0, ts_1.declarationNameToString)(node)));
            }
        }
    }
    function checkStrictModeBinaryExpression(node) {
        if (inStrictMode && (0, ts_1.isLeftHandSideExpression)(node.left) && (0, ts_1.isAssignmentOperator)(node.operatorToken.kind)) {
            // ECMA 262 (Annex C) The identifier eval or arguments may not appear as the LeftHandSideExpression of an
            // Assignment operator(11.13) or of a PostfixExpression(11.3)
            checkStrictModeEvalOrArguments(node, node.left);
        }
    }
    function checkStrictModeCatchClause(node) {
        // It is a SyntaxError if a TryStatement with a Catch occurs within strict code and the Identifier of the
        // Catch production is eval or arguments
        if (inStrictMode && node.variableDeclaration) {
            checkStrictModeEvalOrArguments(node, node.variableDeclaration.name);
        }
    }
    function checkStrictModeDeleteExpression(node) {
        // Grammar checking
        if (inStrictMode && node.expression.kind === 80 /* SyntaxKind.Identifier */) {
            // When a delete operator occurs within strict mode code, a SyntaxError is thrown if its
            // UnaryExpression is a direct reference to a variable, function argument, or function name
            var span = (0, ts_1.getErrorSpanForNode)(file, node.expression);
            file.bindDiagnostics.push((0, ts_1.createFileDiagnostic)(file, span.start, span.length, ts_1.Diagnostics.delete_cannot_be_called_on_an_identifier_in_strict_mode));
        }
    }
    function isEvalOrArgumentsIdentifier(node) {
        return (0, ts_1.isIdentifier)(node) && (node.escapedText === "eval" || node.escapedText === "arguments");
    }
    function checkStrictModeEvalOrArguments(contextNode, name) {
        if (name && name.kind === 80 /* SyntaxKind.Identifier */) {
            var identifier = name;
            if (isEvalOrArgumentsIdentifier(identifier)) {
                // We check first if the name is inside class declaration or class expression; if so give explicit message
                // otherwise report generic error message.
                var span = (0, ts_1.getErrorSpanForNode)(file, name);
                file.bindDiagnostics.push((0, ts_1.createFileDiagnostic)(file, span.start, span.length, getStrictModeEvalOrArgumentsMessage(contextNode), (0, ts_1.idText)(identifier)));
            }
        }
    }
    function getStrictModeEvalOrArgumentsMessage(node) {
        // Provide specialized messages to help the user understand why we think they're in
        // strict mode.
        if ((0, ts_1.getContainingClass)(node)) {
            return ts_1.Diagnostics.Code_contained_in_a_class_is_evaluated_in_JavaScript_s_strict_mode_which_does_not_allow_this_use_of_0_For_more_information_see_https_Colon_Slash_Slashdeveloper_mozilla_org_Slashen_US_Slashdocs_SlashWeb_SlashJavaScript_SlashReference_SlashStrict_mode;
        }
        if (file.externalModuleIndicator) {
            return ts_1.Diagnostics.Invalid_use_of_0_Modules_are_automatically_in_strict_mode;
        }
        return ts_1.Diagnostics.Invalid_use_of_0_in_strict_mode;
    }
    function checkStrictModeFunctionName(node) {
        if (inStrictMode) {
            // It is a SyntaxError if the identifier eval or arguments appears within a FormalParameterList of a strict mode FunctionDeclaration or FunctionExpression (13.1))
            checkStrictModeEvalOrArguments(node, node.name);
        }
    }
    function getStrictModeBlockScopeFunctionDeclarationMessage(node) {
        // Provide specialized messages to help the user understand why we think they're in
        // strict mode.
        if ((0, ts_1.getContainingClass)(node)) {
            return ts_1.Diagnostics.Function_declarations_are_not_allowed_inside_blocks_in_strict_mode_when_targeting_ES3_or_ES5_Class_definitions_are_automatically_in_strict_mode;
        }
        if (file.externalModuleIndicator) {
            return ts_1.Diagnostics.Function_declarations_are_not_allowed_inside_blocks_in_strict_mode_when_targeting_ES3_or_ES5_Modules_are_automatically_in_strict_mode;
        }
        return ts_1.Diagnostics.Function_declarations_are_not_allowed_inside_blocks_in_strict_mode_when_targeting_ES3_or_ES5;
    }
    function checkStrictModeFunctionDeclaration(node) {
        if (languageVersion < 2 /* ScriptTarget.ES2015 */) {
            // Report error if function is not top level function declaration
            if (blockScopeContainer.kind !== 311 /* SyntaxKind.SourceFile */ &&
                blockScopeContainer.kind !== 266 /* SyntaxKind.ModuleDeclaration */ &&
                !(0, ts_1.isFunctionLikeOrClassStaticBlockDeclaration)(blockScopeContainer)) {
                // We check first if the name is inside class declaration or class expression; if so give explicit message
                // otherwise report generic error message.
                var errorSpan = (0, ts_1.getErrorSpanForNode)(file, node);
                file.bindDiagnostics.push((0, ts_1.createFileDiagnostic)(file, errorSpan.start, errorSpan.length, getStrictModeBlockScopeFunctionDeclarationMessage(node)));
            }
        }
    }
    function checkStrictModePostfixUnaryExpression(node) {
        // Grammar checking
        // The identifier eval or arguments may not appear as the LeftHandSideExpression of an
        // Assignment operator(11.13) or of a PostfixExpression(11.3) or as the UnaryExpression
        // operated upon by a Prefix Increment(11.4.4) or a Prefix Decrement(11.4.5) operator.
        if (inStrictMode) {
            checkStrictModeEvalOrArguments(node, node.operand);
        }
    }
    function checkStrictModePrefixUnaryExpression(node) {
        // Grammar checking
        if (inStrictMode) {
            if (node.operator === 46 /* SyntaxKind.PlusPlusToken */ || node.operator === 47 /* SyntaxKind.MinusMinusToken */) {
                checkStrictModeEvalOrArguments(node, node.operand);
            }
        }
    }
    function checkStrictModeWithStatement(node) {
        // Grammar checking for withStatement
        if (inStrictMode) {
            errorOnFirstToken(node, ts_1.Diagnostics.with_statements_are_not_allowed_in_strict_mode);
        }
    }
    function checkStrictModeLabeledStatement(node) {
        // Grammar checking for labeledStatement
        if (inStrictMode && (0, ts_1.getEmitScriptTarget)(options) >= 2 /* ScriptTarget.ES2015 */) {
            if ((0, ts_1.isDeclarationStatement)(node.statement) || (0, ts_1.isVariableStatement)(node.statement)) {
                errorOnFirstToken(node.label, ts_1.Diagnostics.A_label_is_not_allowed_here);
            }
        }
    }
    function errorOnFirstToken(node, message) {
        var args = [];
        for (var _i = 2; _i < arguments.length; _i++) {
            args[_i - 2] = arguments[_i];
        }
        var span = (0, ts_1.getSpanOfTokenAtPosition)(file, node.pos);
        file.bindDiagnostics.push(ts_1.createFileDiagnostic.apply(void 0, __spreadArray([file, span.start, span.length, message], args, false)));
    }
    function errorOrSuggestionOnNode(isError, node, message) {
        errorOrSuggestionOnRange(isError, node, node, message);
    }
    function errorOrSuggestionOnRange(isError, startNode, endNode, message) {
        addErrorOrSuggestionDiagnostic(isError, { pos: (0, ts_1.getTokenPosOfNode)(startNode, file), end: endNode.end }, message);
    }
    function addErrorOrSuggestionDiagnostic(isError, range, message) {
        var diag = (0, ts_1.createFileDiagnostic)(file, range.pos, range.end - range.pos, message);
        if (isError) {
            file.bindDiagnostics.push(diag);
        }
        else {
            file.bindSuggestionDiagnostics = (0, ts_1.append)(file.bindSuggestionDiagnostics, __assign(__assign({}, diag), { category: ts_1.DiagnosticCategory.Suggestion }));
        }
    }
    function bind(node) {
        if (!node) {
            return;
        }
        (0, ts_1.setParent)(node, parent);
        if (ts_1.tracing)
            node.tracingPath = file.path;
        var saveInStrictMode = inStrictMode;
        // Even though in the AST the jsdoc @typedef node belongs to the current node,
        // its symbol might be in the same scope with the current node's symbol. Consider:
        //
        //     /** @typedef {string | number} MyType */
        //     function foo();
        //
        // Here the current node is "foo", which is a container, but the scope of "MyType" should
        // not be inside "foo". Therefore we always bind @typedef before bind the parent node,
        // and skip binding this tag later when binding all the other jsdoc tags.
        // First we bind declaration nodes to a symbol if possible. We'll both create a symbol
        // and then potentially add the symbol to an appropriate symbol table. Possible
        // destination symbol tables are:
        //
        //  1) The 'exports' table of the current container's symbol.
        //  2) The 'members' table of the current container's symbol.
        //  3) The 'locals' table of the current container.
        //
        // However, not all symbols will end up in any of these tables. 'Anonymous' symbols
        // (like TypeLiterals for example) will not be put in any table.
        bindWorker(node);
        // Then we recurse into the children of the node to bind them as well. For certain
        // symbols we do specialized work when we recurse. For example, we'll keep track of
        // the current 'container' node when it changes. This helps us know which symbol table
        // a local should go into for example. Since terminal nodes are known not to have
        // children, as an optimization we don't process those.
        if (node.kind > 164 /* SyntaxKind.LastToken */) {
            var saveParent = parent;
            parent = node;
            var containerFlags = getContainerFlags(node);
            if (containerFlags === 0 /* ContainerFlags.None */) {
                bindChildren(node);
            }
            else {
                bindContainer(node, containerFlags);
            }
            parent = saveParent;
        }
        else {
            var saveParent = parent;
            if (node.kind === 1 /* SyntaxKind.EndOfFileToken */)
                parent = node;
            bindJSDoc(node);
            parent = saveParent;
        }
        inStrictMode = saveInStrictMode;
    }
    function bindJSDoc(node) {
        if ((0, ts_1.hasJSDocNodes)(node)) {
            if ((0, ts_1.isInJSFile)(node)) {
                for (var _i = 0, _a = node.jsDoc; _i < _a.length; _i++) {
                    var j = _a[_i];
                    bind(j);
                }
            }
            else {
                for (var _b = 0, _c = node.jsDoc; _b < _c.length; _b++) {
                    var j = _c[_b];
                    (0, ts_1.setParent)(j, node);
                    (0, ts_1.setParentRecursive)(j, /*incremental*/ false);
                }
            }
        }
    }
    function updateStrictModeStatementList(statements) {
        if (!inStrictMode) {
            for (var _i = 0, statements_2 = statements; _i < statements_2.length; _i++) {
                var statement = statements_2[_i];
                if (!(0, ts_1.isPrologueDirective)(statement)) {
                    return;
                }
                if (isUseStrictPrologueDirective(statement)) {
                    inStrictMode = true;
                    return;
                }
            }
        }
    }
    /// Should be called only on prologue directives (isPrologueDirective(node) should be true)
    function isUseStrictPrologueDirective(node) {
        var nodeText = (0, ts_1.getSourceTextOfNodeFromSourceFile)(file, node.expression);
        // Note: the node text must be exactly "use strict" or 'use strict'.  It is not ok for the
        // string to contain unicode escapes (as per ES5).
        return nodeText === '"use strict"' || nodeText === "'use strict'";
    }
    function bindWorker(node) {
        switch (node.kind) {
            /* Strict mode checks */
            case 80 /* SyntaxKind.Identifier */:
                // for typedef type names with namespaces, bind the new jsdoc type symbol here
                // because it requires all containing namespaces to be in effect, namely the
                // current "blockScopeContainer" needs to be set to its immediate namespace parent.
                if (node.flags & 2048 /* NodeFlags.IdentifierIsInJSDocNamespace */) {
                    var parentNode = node.parent;
                    while (parentNode && !(0, ts_1.isJSDocTypeAlias)(parentNode)) {
                        parentNode = parentNode.parent;
                    }
                    bindBlockScopedDeclaration(parentNode, 524288 /* SymbolFlags.TypeAlias */, 788968 /* SymbolFlags.TypeAliasExcludes */);
                    break;
                }
            // falls through
            case 110 /* SyntaxKind.ThisKeyword */:
                // TODO: Why use `isExpression` here? both Identifier and ThisKeyword are expressions.
                if (currentFlow && ((0, ts_1.isExpression)(node) || parent.kind === 303 /* SyntaxKind.ShorthandPropertyAssignment */)) {
                    node.flowNode = currentFlow;
                }
                // TODO: a `ThisExpression` is not an Identifier, this cast is unsound
                return checkContextualIdentifier(node);
            case 165 /* SyntaxKind.QualifiedName */:
                if (currentFlow && (0, ts_1.isPartOfTypeQuery)(node)) {
                    node.flowNode = currentFlow;
                }
                break;
            case 235 /* SyntaxKind.MetaProperty */:
            case 108 /* SyntaxKind.SuperKeyword */:
                node.flowNode = currentFlow;
                break;
            case 81 /* SyntaxKind.PrivateIdentifier */:
                return checkPrivateIdentifier(node);
            case 210 /* SyntaxKind.PropertyAccessExpression */:
            case 211 /* SyntaxKind.ElementAccessExpression */:
                var expr = node;
                if (currentFlow && isNarrowableReference(expr)) {
                    expr.flowNode = currentFlow;
                }
                if ((0, ts_1.isSpecialPropertyDeclaration)(expr)) {
                    bindSpecialPropertyDeclaration(expr);
                }
                if ((0, ts_1.isInJSFile)(expr) &&
                    file.commonJsModuleIndicator &&
                    (0, ts_1.isModuleExportsAccessExpression)(expr) &&
                    !lookupSymbolForName(blockScopeContainer, "module")) {
                    declareSymbol(file.locals, /*parent*/ undefined, expr.expression, 1 /* SymbolFlags.FunctionScopedVariable */ | 134217728 /* SymbolFlags.ModuleExports */, 111550 /* SymbolFlags.FunctionScopedVariableExcludes */);
                }
                break;
            case 225 /* SyntaxKind.BinaryExpression */:
                var specialKind = (0, ts_1.getAssignmentDeclarationKind)(node);
                switch (specialKind) {
                    case 1 /* AssignmentDeclarationKind.ExportsProperty */:
                        bindExportsPropertyAssignment(node);
                        break;
                    case 2 /* AssignmentDeclarationKind.ModuleExports */:
                        bindModuleExportsAssignment(node);
                        break;
                    case 3 /* AssignmentDeclarationKind.PrototypeProperty */:
                        bindPrototypePropertyAssignment(node.left, node);
                        break;
                    case 6 /* AssignmentDeclarationKind.Prototype */:
                        bindPrototypeAssignment(node);
                        break;
                    case 4 /* AssignmentDeclarationKind.ThisProperty */:
                        bindThisPropertyAssignment(node);
                        break;
                    case 5 /* AssignmentDeclarationKind.Property */:
                        var expression = node.left.expression;
                        if ((0, ts_1.isInJSFile)(node) && (0, ts_1.isIdentifier)(expression)) {
                            var symbol = lookupSymbolForName(blockScopeContainer, expression.escapedText);
                            if ((0, ts_1.isThisInitializedDeclaration)(symbol === null || symbol === void 0 ? void 0 : symbol.valueDeclaration)) {
                                bindThisPropertyAssignment(node);
                                break;
                            }
                        }
                        bindSpecialPropertyAssignment(node);
                        break;
                    case 0 /* AssignmentDeclarationKind.None */:
                        // Nothing to do
                        break;
                    default:
                        ts_1.Debug.fail("Unknown binary expression special property assignment kind");
                }
                return checkStrictModeBinaryExpression(node);
            case 298 /* SyntaxKind.CatchClause */:
                return checkStrictModeCatchClause(node);
            case 219 /* SyntaxKind.DeleteExpression */:
                return checkStrictModeDeleteExpression(node);
            case 224 /* SyntaxKind.PostfixUnaryExpression */:
                return checkStrictModePostfixUnaryExpression(node);
            case 223 /* SyntaxKind.PrefixUnaryExpression */:
                return checkStrictModePrefixUnaryExpression(node);
            case 253 /* SyntaxKind.WithStatement */:
                return checkStrictModeWithStatement(node);
            case 255 /* SyntaxKind.LabeledStatement */:
                return checkStrictModeLabeledStatement(node);
            case 196 /* SyntaxKind.ThisType */:
                seenThisKeyword = true;
                return;
            case 181 /* SyntaxKind.TypePredicate */:
                break; // Binding the children will handle everything
            case 167 /* SyntaxKind.TypeParameter */:
                return bindTypeParameter(node);
            case 168 /* SyntaxKind.Parameter */:
                return bindParameter(node);
            case 259 /* SyntaxKind.VariableDeclaration */:
                return bindVariableDeclarationOrBindingElement(node);
            case 207 /* SyntaxKind.BindingElement */:
                node.flowNode = currentFlow;
                return bindVariableDeclarationOrBindingElement(node);
            case 171 /* SyntaxKind.PropertyDeclaration */:
            case 170 /* SyntaxKind.PropertySignature */:
                return bindPropertyWorker(node);
            case 302 /* SyntaxKind.PropertyAssignment */:
            case 303 /* SyntaxKind.ShorthandPropertyAssignment */:
                return bindPropertyOrMethodOrAccessor(node, 4 /* SymbolFlags.Property */, 0 /* SymbolFlags.PropertyExcludes */);
            case 305 /* SyntaxKind.EnumMember */:
                return bindPropertyOrMethodOrAccessor(node, 8 /* SymbolFlags.EnumMember */, 900095 /* SymbolFlags.EnumMemberExcludes */);
            case 178 /* SyntaxKind.CallSignature */:
            case 179 /* SyntaxKind.ConstructSignature */:
            case 180 /* SyntaxKind.IndexSignature */:
                return declareSymbolAndAddToSymbolTable(node, 131072 /* SymbolFlags.Signature */, 0 /* SymbolFlags.None */);
            case 173 /* SyntaxKind.MethodDeclaration */:
            case 172 /* SyntaxKind.MethodSignature */:
                // If this is an ObjectLiteralExpression method, then it sits in the same space
                // as other properties in the object literal.  So we use SymbolFlags.PropertyExcludes
                // so that it will conflict with any other object literal members with the same
                // name.
                return bindPropertyOrMethodOrAccessor(node, 8192 /* SymbolFlags.Method */ | (node.questionToken ? 16777216 /* SymbolFlags.Optional */ : 0 /* SymbolFlags.None */), (0, ts_1.isObjectLiteralMethod)(node) ? 0 /* SymbolFlags.PropertyExcludes */ : 103359 /* SymbolFlags.MethodExcludes */);
            case 261 /* SyntaxKind.FunctionDeclaration */:
                return bindFunctionDeclaration(node);
            case 175 /* SyntaxKind.Constructor */:
                return declareSymbolAndAddToSymbolTable(node, 16384 /* SymbolFlags.Constructor */, /*symbolExcludes:*/ 0 /* SymbolFlags.None */);
            case 176 /* SyntaxKind.GetAccessor */:
                return bindPropertyOrMethodOrAccessor(node, 32768 /* SymbolFlags.GetAccessor */, 46015 /* SymbolFlags.GetAccessorExcludes */);
            case 177 /* SyntaxKind.SetAccessor */:
                return bindPropertyOrMethodOrAccessor(node, 65536 /* SymbolFlags.SetAccessor */, 78783 /* SymbolFlags.SetAccessorExcludes */);
            case 183 /* SyntaxKind.FunctionType */:
            case 323 /* SyntaxKind.JSDocFunctionType */:
            case 329 /* SyntaxKind.JSDocSignature */:
            case 184 /* SyntaxKind.ConstructorType */:
                return bindFunctionOrConstructorType(node);
            case 186 /* SyntaxKind.TypeLiteral */:
            case 328 /* SyntaxKind.JSDocTypeLiteral */:
            case 199 /* SyntaxKind.MappedType */:
                return bindAnonymousTypeWorker(node);
            case 338 /* SyntaxKind.JSDocClassTag */:
                return bindJSDocClassTag(node);
            case 209 /* SyntaxKind.ObjectLiteralExpression */:
                return bindObjectLiteralExpression(node);
            case 217 /* SyntaxKind.FunctionExpression */:
            case 218 /* SyntaxKind.ArrowFunction */:
                return bindFunctionExpression(node);
            case 212 /* SyntaxKind.CallExpression */:
                var assignmentKind = (0, ts_1.getAssignmentDeclarationKind)(node);
                switch (assignmentKind) {
                    case 7 /* AssignmentDeclarationKind.ObjectDefinePropertyValue */:
                        return bindObjectDefinePropertyAssignment(node);
                    case 8 /* AssignmentDeclarationKind.ObjectDefinePropertyExports */:
                        return bindObjectDefinePropertyExport(node);
                    case 9 /* AssignmentDeclarationKind.ObjectDefinePrototypeProperty */:
                        return bindObjectDefinePrototypeProperty(node);
                    case 0 /* AssignmentDeclarationKind.None */:
                        break; // Nothing to do
                    default:
                        return ts_1.Debug.fail("Unknown call expression assignment declaration kind");
                }
                if ((0, ts_1.isInJSFile)(node)) {
                    bindCallExpression(node);
                }
                break;
            // Members of classes, interfaces, and modules
            case 230 /* SyntaxKind.ClassExpression */:
            case 262 /* SyntaxKind.ClassDeclaration */:
                // All classes are automatically in strict mode in ES6.
                inStrictMode = true;
                return bindClassLikeDeclaration(node);
            case 263 /* SyntaxKind.InterfaceDeclaration */:
                return bindBlockScopedDeclaration(node, 64 /* SymbolFlags.Interface */, 788872 /* SymbolFlags.InterfaceExcludes */);
            case 264 /* SyntaxKind.TypeAliasDeclaration */:
                return bindBlockScopedDeclaration(node, 524288 /* SymbolFlags.TypeAlias */, 788968 /* SymbolFlags.TypeAliasExcludes */);
            case 265 /* SyntaxKind.EnumDeclaration */:
                return bindEnumDeclaration(node);
            case 266 /* SyntaxKind.ModuleDeclaration */:
                return bindModuleDeclaration(node);
            // Jsx-attributes
            case 291 /* SyntaxKind.JsxAttributes */:
                return bindJsxAttributes(node);
            case 290 /* SyntaxKind.JsxAttribute */:
                return bindJsxAttribute(node, 4 /* SymbolFlags.Property */, 0 /* SymbolFlags.PropertyExcludes */);
            // Imports and exports
            case 270 /* SyntaxKind.ImportEqualsDeclaration */:
            case 273 /* SyntaxKind.NamespaceImport */:
            case 275 /* SyntaxKind.ImportSpecifier */:
            case 280 /* SyntaxKind.ExportSpecifier */:
                return declareSymbolAndAddToSymbolTable(node, 2097152 /* SymbolFlags.Alias */, 2097152 /* SymbolFlags.AliasExcludes */);
            case 269 /* SyntaxKind.NamespaceExportDeclaration */:
                return bindNamespaceExportDeclaration(node);
            case 272 /* SyntaxKind.ImportClause */:
                return bindImportClause(node);
            case 277 /* SyntaxKind.ExportDeclaration */:
                return bindExportDeclaration(node);
            case 276 /* SyntaxKind.ExportAssignment */:
                return bindExportAssignment(node);
            case 311 /* SyntaxKind.SourceFile */:
                updateStrictModeStatementList(node.statements);
                return bindSourceFileIfExternalModule();
            case 240 /* SyntaxKind.Block */:
                if (!(0, ts_1.isFunctionLikeOrClassStaticBlockDeclaration)(node.parent)) {
                    return;
                }
            // falls through
            case 267 /* SyntaxKind.ModuleBlock */:
                return updateStrictModeStatementList(node.statements);
            case 347 /* SyntaxKind.JSDocParameterTag */:
                if (node.parent.kind === 329 /* SyntaxKind.JSDocSignature */) {
                    return bindParameter(node);
                }
                if (node.parent.kind !== 328 /* SyntaxKind.JSDocTypeLiteral */) {
                    break;
                }
            // falls through
            case 354 /* SyntaxKind.JSDocPropertyTag */:
                var propTag = node;
                var flags = propTag.isBracketed || propTag.typeExpression && propTag.typeExpression.type.kind === 322 /* SyntaxKind.JSDocOptionalType */ ?
                    4 /* SymbolFlags.Property */ | 16777216 /* SymbolFlags.Optional */ :
                    4 /* SymbolFlags.Property */;
                return declareSymbolAndAddToSymbolTable(propTag, flags, 0 /* SymbolFlags.PropertyExcludes */);
            case 352 /* SyntaxKind.JSDocTypedefTag */:
            case 344 /* SyntaxKind.JSDocCallbackTag */:
            case 346 /* SyntaxKind.JSDocEnumTag */:
                return (delayedTypeAliases || (delayedTypeAliases = [])).push(node);
            case 345 /* SyntaxKind.JSDocOverloadTag */:
                return bind(node.typeExpression);
        }
    }
    function bindPropertyWorker(node) {
        var isAutoAccessor = (0, ts_1.isAutoAccessorPropertyDeclaration)(node);
        var includes = isAutoAccessor ? 98304 /* SymbolFlags.Accessor */ : 4 /* SymbolFlags.Property */;
        var excludes = isAutoAccessor ? 13247 /* SymbolFlags.AccessorExcludes */ : 0 /* SymbolFlags.PropertyExcludes */;
        return bindPropertyOrMethodOrAccessor(node, includes | (node.questionToken ? 16777216 /* SymbolFlags.Optional */ : 0 /* SymbolFlags.None */), excludes);
    }
    function bindAnonymousTypeWorker(node) {
        return bindAnonymousDeclaration(node, 2048 /* SymbolFlags.TypeLiteral */, "__type" /* InternalSymbolName.Type */);
    }
    function bindSourceFileIfExternalModule() {
        setExportContextFlag(file);
        if ((0, ts_1.isExternalModule)(file)) {
            bindSourceFileAsExternalModule();
        }
        else if ((0, ts_1.isJsonSourceFile)(file)) {
            bindSourceFileAsExternalModule();
            // Create symbol equivalent for the module.exports = {}
            var originalSymbol = file.symbol;
            declareSymbol(file.symbol.exports, file.symbol, file, 4 /* SymbolFlags.Property */, 67108863 /* SymbolFlags.All */);
            file.symbol = originalSymbol;
        }
    }
    function bindSourceFileAsExternalModule() {
        bindAnonymousDeclaration(file, 512 /* SymbolFlags.ValueModule */, "\"".concat((0, ts_1.removeFileExtension)(file.fileName), "\""));
    }
    function bindExportAssignment(node) {
        if (!container.symbol || !container.symbol.exports) {
            // Incorrect export assignment in some sort of block construct
            bindAnonymousDeclaration(node, 111551 /* SymbolFlags.Value */, getDeclarationName(node));
        }
        else {
            var flags = (0, ts_1.exportAssignmentIsAlias)(node)
                // An export default clause with an EntityNameExpression or a class expression exports all meanings of that identifier or expression;
                ? 2097152 /* SymbolFlags.Alias */
                // An export default clause with any other expression exports a value
                : 4 /* SymbolFlags.Property */;
            // If there is an `export default x;` alias declaration, can't `export default` anything else.
            // (In contrast, you can still have `export default function f() {}` and `export default interface I {}`.)
            var symbol = declareSymbol(container.symbol.exports, container.symbol, node, flags, 67108863 /* SymbolFlags.All */);
            if (node.isExportEquals) {
                // Will be an error later, since the module already has other exports. Just make sure this has a valueDeclaration set.
                (0, ts_1.setValueDeclaration)(symbol, node);
            }
        }
    }
    function bindNamespaceExportDeclaration(node) {
        if ((0, ts_1.some)(node.modifiers)) {
            file.bindDiagnostics.push(createDiagnosticForNode(node, ts_1.Diagnostics.Modifiers_cannot_appear_here));
        }
        var diag = !(0, ts_1.isSourceFile)(node.parent) ? ts_1.Diagnostics.Global_module_exports_may_only_appear_at_top_level
            : !(0, ts_1.isExternalModule)(node.parent) ? ts_1.Diagnostics.Global_module_exports_may_only_appear_in_module_files
                : !node.parent.isDeclarationFile ? ts_1.Diagnostics.Global_module_exports_may_only_appear_in_declaration_files
                    : undefined;
        if (diag) {
            file.bindDiagnostics.push(createDiagnosticForNode(node, diag));
        }
        else {
            file.symbol.globalExports = file.symbol.globalExports || (0, ts_1.createSymbolTable)();
            declareSymbol(file.symbol.globalExports, file.symbol, node, 2097152 /* SymbolFlags.Alias */, 2097152 /* SymbolFlags.AliasExcludes */);
        }
    }
    function bindExportDeclaration(node) {
        if (!container.symbol || !container.symbol.exports) {
            // Export * in some sort of block construct
            bindAnonymousDeclaration(node, 8388608 /* SymbolFlags.ExportStar */, getDeclarationName(node));
        }
        else if (!node.exportClause) {
            // All export * declarations are collected in an __export symbol
            declareSymbol(container.symbol.exports, container.symbol, node, 8388608 /* SymbolFlags.ExportStar */, 0 /* SymbolFlags.None */);
        }
        else if ((0, ts_1.isNamespaceExport)(node.exportClause)) {
            // declareSymbol walks up parents to find name text, parent _must_ be set
            // but won't be set by the normal binder walk until `bindChildren` later on.
            (0, ts_1.setParent)(node.exportClause, node);
            declareSymbol(container.symbol.exports, container.symbol, node.exportClause, 2097152 /* SymbolFlags.Alias */, 2097152 /* SymbolFlags.AliasExcludes */);
        }
    }
    function bindImportClause(node) {
        if (node.name) {
            declareSymbolAndAddToSymbolTable(node, 2097152 /* SymbolFlags.Alias */, 2097152 /* SymbolFlags.AliasExcludes */);
        }
    }
    function setCommonJsModuleIndicator(node) {
        if (file.externalModuleIndicator && file.externalModuleIndicator !== true) {
            return false;
        }
        if (!file.commonJsModuleIndicator) {
            file.commonJsModuleIndicator = node;
            if (!file.externalModuleIndicator) {
                bindSourceFileAsExternalModule();
            }
        }
        return true;
    }
    function bindObjectDefinePropertyExport(node) {
        if (!setCommonJsModuleIndicator(node)) {
            return;
        }
        var symbol = forEachIdentifierInEntityName(node.arguments[0], /*parent*/ undefined, function (id, symbol) {
            if (symbol) {
                addDeclarationToSymbol(symbol, id, 1536 /* SymbolFlags.Module */ | 67108864 /* SymbolFlags.Assignment */);
            }
            return symbol;
        });
        if (symbol) {
            var flags = 4 /* SymbolFlags.Property */ | 1048576 /* SymbolFlags.ExportValue */;
            declareSymbol(symbol.exports, symbol, node, flags, 0 /* SymbolFlags.None */);
        }
    }
    function bindExportsPropertyAssignment(node) {
        // When we create a property via 'exports.foo = bar', the 'exports.foo' property access
        // expression is the declaration
        if (!setCommonJsModuleIndicator(node)) {
            return;
        }
        var symbol = forEachIdentifierInEntityName(node.left.expression, /*parent*/ undefined, function (id, symbol) {
            if (symbol) {
                addDeclarationToSymbol(symbol, id, 1536 /* SymbolFlags.Module */ | 67108864 /* SymbolFlags.Assignment */);
            }
            return symbol;
        });
        if (symbol) {
            var isAlias = (0, ts_1.isAliasableExpression)(node.right) && ((0, ts_1.isExportsIdentifier)(node.left.expression) || (0, ts_1.isModuleExportsAccessExpression)(node.left.expression));
            var flags = isAlias ? 2097152 /* SymbolFlags.Alias */ : 4 /* SymbolFlags.Property */ | 1048576 /* SymbolFlags.ExportValue */;
            (0, ts_1.setParent)(node.left, node);
            declareSymbol(symbol.exports, symbol, node.left, flags, 0 /* SymbolFlags.None */);
        }
    }
    function bindModuleExportsAssignment(node) {
        // A common practice in node modules is to set 'export = module.exports = {}', this ensures that 'exports'
        // is still pointing to 'module.exports'.
        // We do not want to consider this as 'export=' since a module can have only one of these.
        // Similarly we do not want to treat 'module.exports = exports' as an 'export='.
        if (!setCommonJsModuleIndicator(node)) {
            return;
        }
        var assignedExpression = (0, ts_1.getRightMostAssignedExpression)(node.right);
        if ((0, ts_1.isEmptyObjectLiteral)(assignedExpression) || container === file && isExportsOrModuleExportsOrAlias(file, assignedExpression)) {
            return;
        }
        if ((0, ts_1.isObjectLiteralExpression)(assignedExpression) && (0, ts_1.every)(assignedExpression.properties, ts_1.isShorthandPropertyAssignment)) {
            (0, ts_1.forEach)(assignedExpression.properties, bindExportAssignedObjectMemberAlias);
            return;
        }
        // 'module.exports = expr' assignment
        var flags = (0, ts_1.exportAssignmentIsAlias)(node)
            ? 2097152 /* SymbolFlags.Alias */
            : 4 /* SymbolFlags.Property */ | 1048576 /* SymbolFlags.ExportValue */ | 512 /* SymbolFlags.ValueModule */;
        var symbol = declareSymbol(file.symbol.exports, file.symbol, node, flags | 67108864 /* SymbolFlags.Assignment */, 0 /* SymbolFlags.None */);
        (0, ts_1.setValueDeclaration)(symbol, node);
    }
    function bindExportAssignedObjectMemberAlias(node) {
        declareSymbol(file.symbol.exports, file.symbol, node, 2097152 /* SymbolFlags.Alias */ | 67108864 /* SymbolFlags.Assignment */, 0 /* SymbolFlags.None */);
    }
    function bindThisPropertyAssignment(node) {
        ts_1.Debug.assert((0, ts_1.isInJSFile)(node));
        // private identifiers *must* be declared (even in JS files)
        var hasPrivateIdentifier = ((0, ts_1.isBinaryExpression)(node) && (0, ts_1.isPropertyAccessExpression)(node.left) && (0, ts_1.isPrivateIdentifier)(node.left.name))
            || ((0, ts_1.isPropertyAccessExpression)(node) && (0, ts_1.isPrivateIdentifier)(node.name));
        if (hasPrivateIdentifier) {
            return;
        }
        var thisContainer = (0, ts_1.getThisContainer)(node, /*includeArrowFunctions*/ false, /*includeClassComputedPropertyName*/ false);
        switch (thisContainer.kind) {
            case 261 /* SyntaxKind.FunctionDeclaration */:
            case 217 /* SyntaxKind.FunctionExpression */:
                var constructorSymbol = thisContainer.symbol;
                // For `f.prototype.m = function() { this.x = 0; }`, `this.x = 0` should modify `f`'s members, not the function expression.
                if ((0, ts_1.isBinaryExpression)(thisContainer.parent) && thisContainer.parent.operatorToken.kind === 64 /* SyntaxKind.EqualsToken */) {
                    var l = thisContainer.parent.left;
                    if ((0, ts_1.isBindableStaticAccessExpression)(l) && (0, ts_1.isPrototypeAccess)(l.expression)) {
                        constructorSymbol = lookupSymbolForPropertyAccess(l.expression.expression, thisParentContainer);
                    }
                }
                if (constructorSymbol && constructorSymbol.valueDeclaration) {
                    // Declare a 'member' if the container is an ES5 class or ES6 constructor
                    constructorSymbol.members = constructorSymbol.members || (0, ts_1.createSymbolTable)();
                    // It's acceptable for multiple 'this' assignments of the same identifier to occur
                    if ((0, ts_1.hasDynamicName)(node)) {
                        bindDynamicallyNamedThisPropertyAssignment(node, constructorSymbol, constructorSymbol.members);
                    }
                    else {
                        declareSymbol(constructorSymbol.members, constructorSymbol, node, 4 /* SymbolFlags.Property */ | 67108864 /* SymbolFlags.Assignment */, 0 /* SymbolFlags.PropertyExcludes */ & ~4 /* SymbolFlags.Property */);
                    }
                    addDeclarationToSymbol(constructorSymbol, constructorSymbol.valueDeclaration, 32 /* SymbolFlags.Class */);
                }
                break;
            case 175 /* SyntaxKind.Constructor */:
            case 171 /* SyntaxKind.PropertyDeclaration */:
            case 173 /* SyntaxKind.MethodDeclaration */:
            case 176 /* SyntaxKind.GetAccessor */:
            case 177 /* SyntaxKind.SetAccessor */:
            case 174 /* SyntaxKind.ClassStaticBlockDeclaration */:
                // this.foo assignment in a JavaScript class
                // Bind this property to the containing class
                var containingClass = thisContainer.parent;
                var symbolTable = (0, ts_1.isStatic)(thisContainer) ? containingClass.symbol.exports : containingClass.symbol.members;
                if ((0, ts_1.hasDynamicName)(node)) {
                    bindDynamicallyNamedThisPropertyAssignment(node, containingClass.symbol, symbolTable);
                }
                else {
                    declareSymbol(symbolTable, containingClass.symbol, node, 4 /* SymbolFlags.Property */ | 67108864 /* SymbolFlags.Assignment */, 0 /* SymbolFlags.None */, /*isReplaceableByMethod*/ true);
                }
                break;
            case 311 /* SyntaxKind.SourceFile */:
                // this.property = assignment in a source file -- declare symbol in exports for a module, in locals for a script
                if ((0, ts_1.hasDynamicName)(node)) {
                    break;
                }
                else if (thisContainer.commonJsModuleIndicator) {
                    declareSymbol(thisContainer.symbol.exports, thisContainer.symbol, node, 4 /* SymbolFlags.Property */ | 1048576 /* SymbolFlags.ExportValue */, 0 /* SymbolFlags.None */);
                }
                else {
                    declareSymbolAndAddToSymbolTable(node, 1 /* SymbolFlags.FunctionScopedVariable */, 111550 /* SymbolFlags.FunctionScopedVariableExcludes */);
                }
                break;
            // Namespaces are not allowed in javascript files, so do nothing here
            case 266 /* SyntaxKind.ModuleDeclaration */:
                break;
            default:
                ts_1.Debug.failBadSyntaxKind(thisContainer);
        }
    }
    function bindDynamicallyNamedThisPropertyAssignment(node, symbol, symbolTable) {
        declareSymbol(symbolTable, symbol, node, 4 /* SymbolFlags.Property */, 0 /* SymbolFlags.None */, /*isReplaceableByMethod*/ true, /*isComputedName*/ true);
        addLateBoundAssignmentDeclarationToSymbol(node, symbol);
    }
    function addLateBoundAssignmentDeclarationToSymbol(node, symbol) {
        if (symbol) {
            (symbol.assignmentDeclarationMembers || (symbol.assignmentDeclarationMembers = new Map())).set((0, ts_1.getNodeId)(node), node);
        }
    }
    function bindSpecialPropertyDeclaration(node) {
        if (node.expression.kind === 110 /* SyntaxKind.ThisKeyword */) {
            bindThisPropertyAssignment(node);
        }
        else if ((0, ts_1.isBindableStaticAccessExpression)(node) && node.parent.parent.kind === 311 /* SyntaxKind.SourceFile */) {
            if ((0, ts_1.isPrototypeAccess)(node.expression)) {
                bindPrototypePropertyAssignment(node, node.parent);
            }
            else {
                bindStaticPropertyAssignment(node);
            }
        }
    }
    /** For `x.prototype = { p, ... }`, declare members p,... if `x` is function/class/{}, or not declared. */
    function bindPrototypeAssignment(node) {
        (0, ts_1.setParent)(node.left, node);
        (0, ts_1.setParent)(node.right, node);
        bindPropertyAssignment(node.left.expression, node.left, /*isPrototypeProperty*/ false, /*containerIsClass*/ true);
    }
    function bindObjectDefinePrototypeProperty(node) {
        var namespaceSymbol = lookupSymbolForPropertyAccess(node.arguments[0].expression);
        if (namespaceSymbol && namespaceSymbol.valueDeclaration) {
            // Ensure the namespace symbol becomes class-like
            addDeclarationToSymbol(namespaceSymbol, namespaceSymbol.valueDeclaration, 32 /* SymbolFlags.Class */);
        }
        bindPotentiallyNewExpandoMemberToNamespace(node, namespaceSymbol, /*isPrototypeProperty*/ true);
    }
    /**
     * For `x.prototype.y = z`, declare a member `y` on `x` if `x` is a function or class, or not declared.
     * Note that jsdoc preceding an ExpressionStatement like `x.prototype.y;` is also treated as a declaration.
     */
    function bindPrototypePropertyAssignment(lhs, parent) {
        // Look up the function in the local scope, since prototype assignments should
        // follow the function declaration
        var classPrototype = lhs.expression;
        var constructorFunction = classPrototype.expression;
        // Fix up parent pointers since we're going to use these nodes before we bind into them
        (0, ts_1.setParent)(constructorFunction, classPrototype);
        (0, ts_1.setParent)(classPrototype, lhs);
        (0, ts_1.setParent)(lhs, parent);
        bindPropertyAssignment(constructorFunction, lhs, /*isPrototypeProperty*/ true, /*containerIsClass*/ true);
    }
    function bindObjectDefinePropertyAssignment(node) {
        var namespaceSymbol = lookupSymbolForPropertyAccess(node.arguments[0]);
        var isToplevel = node.parent.parent.kind === 311 /* SyntaxKind.SourceFile */;
        namespaceSymbol = bindPotentiallyMissingNamespaces(namespaceSymbol, node.arguments[0], isToplevel, /*isPrototypeProperty*/ false, /*containerIsClass*/ false);
        bindPotentiallyNewExpandoMemberToNamespace(node, namespaceSymbol, /*isPrototypeProperty*/ false);
    }
    function bindSpecialPropertyAssignment(node) {
        var _a;
        // Class declarations in Typescript do not allow property declarations
        var parentSymbol = lookupSymbolForPropertyAccess(node.left.expression, container) || lookupSymbolForPropertyAccess(node.left.expression, blockScopeContainer);
        if (!(0, ts_1.isInJSFile)(node) && !(0, ts_1.isFunctionSymbol)(parentSymbol)) {
            return;
        }
        var rootExpr = (0, ts_1.getLeftmostAccessExpression)(node.left);
        if ((0, ts_1.isIdentifier)(rootExpr) && ((_a = lookupSymbolForName(container, rootExpr.escapedText)) === null || _a === void 0 ? void 0 : _a.flags) & 2097152 /* SymbolFlags.Alias */) {
            return;
        }
        // Fix up parent pointers since we're going to use these nodes before we bind into them
        (0, ts_1.setParent)(node.left, node);
        (0, ts_1.setParent)(node.right, node);
        if ((0, ts_1.isIdentifier)(node.left.expression) && container === file && isExportsOrModuleExportsOrAlias(file, node.left.expression)) {
            // This can be an alias for the 'exports' or 'module.exports' names, e.g.
            //    var util = module.exports;
            //    util.property = function ...
            bindExportsPropertyAssignment(node);
        }
        else if ((0, ts_1.hasDynamicName)(node)) {
            bindAnonymousDeclaration(node, 4 /* SymbolFlags.Property */ | 67108864 /* SymbolFlags.Assignment */, "__computed" /* InternalSymbolName.Computed */);
            var sym = bindPotentiallyMissingNamespaces(parentSymbol, node.left.expression, isTopLevelNamespaceAssignment(node.left), /*isPrototypeProperty*/ false, /*containerIsClass*/ false);
            addLateBoundAssignmentDeclarationToSymbol(node, sym);
        }
        else {
            bindStaticPropertyAssignment((0, ts_1.cast)(node.left, ts_1.isBindableStaticNameExpression));
        }
    }
    /**
     * For nodes like `x.y = z`, declare a member 'y' on 'x' if x is a function (or IIFE) or class or {}, or not declared.
     * Also works for expression statements preceded by JSDoc, like / ** @type number * / x.y;
     */
    function bindStaticPropertyAssignment(node) {
        ts_1.Debug.assert(!(0, ts_1.isIdentifier)(node));
        (0, ts_1.setParent)(node.expression, node);
        bindPropertyAssignment(node.expression, node, /*isPrototypeProperty*/ false, /*containerIsClass*/ false);
    }
    function bindPotentiallyMissingNamespaces(namespaceSymbol, entityName, isToplevel, isPrototypeProperty, containerIsClass) {
        if ((namespaceSymbol === null || namespaceSymbol === void 0 ? void 0 : namespaceSymbol.flags) & 2097152 /* SymbolFlags.Alias */) {
            return namespaceSymbol;
        }
        if (isToplevel && !isPrototypeProperty) {
            // make symbols or add declarations for intermediate containers
            var flags_1 = 1536 /* SymbolFlags.Module */ | 67108864 /* SymbolFlags.Assignment */;
            var excludeFlags_1 = 110735 /* SymbolFlags.ValueModuleExcludes */ & ~67108864 /* SymbolFlags.Assignment */;
            namespaceSymbol = forEachIdentifierInEntityName(entityName, namespaceSymbol, function (id, symbol, parent) {
                if (symbol) {
                    addDeclarationToSymbol(symbol, id, flags_1);
                    return symbol;
                }
                else {
                    var table = parent ? parent.exports :
                        file.jsGlobalAugmentations || (file.jsGlobalAugmentations = (0, ts_1.createSymbolTable)());
                    return declareSymbol(table, parent, id, flags_1, excludeFlags_1);
                }
            });
        }
        if (containerIsClass && namespaceSymbol && namespaceSymbol.valueDeclaration) {
            addDeclarationToSymbol(namespaceSymbol, namespaceSymbol.valueDeclaration, 32 /* SymbolFlags.Class */);
        }
        return namespaceSymbol;
    }
    function bindPotentiallyNewExpandoMemberToNamespace(declaration, namespaceSymbol, isPrototypeProperty) {
        if (!namespaceSymbol || !isExpandoSymbol(namespaceSymbol)) {
            return;
        }
        // Set up the members collection if it doesn't exist already
        var symbolTable = isPrototypeProperty ?
            (namespaceSymbol.members || (namespaceSymbol.members = (0, ts_1.createSymbolTable)())) :
            (namespaceSymbol.exports || (namespaceSymbol.exports = (0, ts_1.createSymbolTable)()));
        var includes = 0 /* SymbolFlags.None */;
        var excludes = 0 /* SymbolFlags.None */;
        // Method-like
        if ((0, ts_1.isFunctionLikeDeclaration)((0, ts_1.getAssignedExpandoInitializer)(declaration))) {
            includes = 8192 /* SymbolFlags.Method */;
            excludes = 103359 /* SymbolFlags.MethodExcludes */;
        }
        // Maybe accessor-like
        else if ((0, ts_1.isCallExpression)(declaration) && (0, ts_1.isBindableObjectDefinePropertyCall)(declaration)) {
            if ((0, ts_1.some)(declaration.arguments[2].properties, function (p) {
                var id = (0, ts_1.getNameOfDeclaration)(p);
                return !!id && (0, ts_1.isIdentifier)(id) && (0, ts_1.idText)(id) === "set";
            })) {
                // We mix in `SymbolFLags.Property` so in the checker `getTypeOfVariableParameterOrProperty` is used for this
                // symbol, instead of `getTypeOfAccessor` (which will assert as there is no real accessor declaration)
                includes |= 65536 /* SymbolFlags.SetAccessor */ | 4 /* SymbolFlags.Property */;
                excludes |= 78783 /* SymbolFlags.SetAccessorExcludes */;
            }
            if ((0, ts_1.some)(declaration.arguments[2].properties, function (p) {
                var id = (0, ts_1.getNameOfDeclaration)(p);
                return !!id && (0, ts_1.isIdentifier)(id) && (0, ts_1.idText)(id) === "get";
            })) {
                includes |= 32768 /* SymbolFlags.GetAccessor */ | 4 /* SymbolFlags.Property */;
                excludes |= 46015 /* SymbolFlags.GetAccessorExcludes */;
            }
        }
        if (includes === 0 /* SymbolFlags.None */) {
            includes = 4 /* SymbolFlags.Property */;
            excludes = 0 /* SymbolFlags.PropertyExcludes */;
        }
        declareSymbol(symbolTable, namespaceSymbol, declaration, includes | 67108864 /* SymbolFlags.Assignment */, excludes & ~67108864 /* SymbolFlags.Assignment */);
    }
    function isTopLevelNamespaceAssignment(propertyAccess) {
        return (0, ts_1.isBinaryExpression)(propertyAccess.parent)
            ? getParentOfBinaryExpression(propertyAccess.parent).parent.kind === 311 /* SyntaxKind.SourceFile */
            : propertyAccess.parent.parent.kind === 311 /* SyntaxKind.SourceFile */;
    }
    function bindPropertyAssignment(name, propertyAccess, isPrototypeProperty, containerIsClass) {
        var namespaceSymbol = lookupSymbolForPropertyAccess(name, container) || lookupSymbolForPropertyAccess(name, blockScopeContainer);
        var isToplevel = isTopLevelNamespaceAssignment(propertyAccess);
        namespaceSymbol = bindPotentiallyMissingNamespaces(namespaceSymbol, propertyAccess.expression, isToplevel, isPrototypeProperty, containerIsClass);
        bindPotentiallyNewExpandoMemberToNamespace(propertyAccess, namespaceSymbol, isPrototypeProperty);
    }
    /**
     * Javascript expando values are:
     * - Functions
     * - classes
     * - namespaces
     * - variables initialized with function expressions
     * -                       with class expressions
     * -                       with empty object literals
     * -                       with non-empty object literals if assigned to the prototype property
     */
    function isExpandoSymbol(symbol) {
        if (symbol.flags & (16 /* SymbolFlags.Function */ | 32 /* SymbolFlags.Class */ | 1024 /* SymbolFlags.NamespaceModule */)) {
            return true;
        }
        var node = symbol.valueDeclaration;
        if (node && (0, ts_1.isCallExpression)(node)) {
            return !!(0, ts_1.getAssignedExpandoInitializer)(node);
        }
        var init = !node ? undefined :
            (0, ts_1.isVariableDeclaration)(node) ? node.initializer :
                (0, ts_1.isBinaryExpression)(node) ? node.right :
                    (0, ts_1.isPropertyAccessExpression)(node) && (0, ts_1.isBinaryExpression)(node.parent) ? node.parent.right :
                        undefined;
        init = init && (0, ts_1.getRightMostAssignedExpression)(init);
        if (init) {
            var isPrototypeAssignment = (0, ts_1.isPrototypeAccess)((0, ts_1.isVariableDeclaration)(node) ? node.name : (0, ts_1.isBinaryExpression)(node) ? node.left : node);
            return !!(0, ts_1.getExpandoInitializer)((0, ts_1.isBinaryExpression)(init) && (init.operatorToken.kind === 57 /* SyntaxKind.BarBarToken */ || init.operatorToken.kind === 61 /* SyntaxKind.QuestionQuestionToken */) ? init.right : init, isPrototypeAssignment);
        }
        return false;
    }
    function getParentOfBinaryExpression(expr) {
        while ((0, ts_1.isBinaryExpression)(expr.parent)) {
            expr = expr.parent;
        }
        return expr.parent;
    }
    function lookupSymbolForPropertyAccess(node, lookupContainer) {
        if (lookupContainer === void 0) { lookupContainer = container; }
        if ((0, ts_1.isIdentifier)(node)) {
            return lookupSymbolForName(lookupContainer, node.escapedText);
        }
        else {
            var symbol = lookupSymbolForPropertyAccess(node.expression);
            return symbol && symbol.exports && symbol.exports.get((0, ts_1.getElementOrPropertyAccessName)(node));
        }
    }
    function forEachIdentifierInEntityName(e, parent, action) {
        if (isExportsOrModuleExportsOrAlias(file, e)) {
            return file.symbol;
        }
        else if ((0, ts_1.isIdentifier)(e)) {
            return action(e, lookupSymbolForPropertyAccess(e), parent);
        }
        else {
            var s = forEachIdentifierInEntityName(e.expression, parent, action);
            var name_1 = (0, ts_1.getNameOrArgument)(e);
            // unreachable
            if ((0, ts_1.isPrivateIdentifier)(name_1)) {
                ts_1.Debug.fail("unexpected PrivateIdentifier");
            }
            return action(name_1, s && s.exports && s.exports.get((0, ts_1.getElementOrPropertyAccessName)(e)), s);
        }
    }
    function bindCallExpression(node) {
        // We're only inspecting call expressions to detect CommonJS modules, so we can skip
        // this check if we've already seen the module indicator
        if (!file.commonJsModuleIndicator && (0, ts_1.isRequireCall)(node, /*requireStringLiteralLikeArgument*/ false)) {
            setCommonJsModuleIndicator(node);
        }
    }
    function bindClassLikeDeclaration(node) {
        if (node.kind === 262 /* SyntaxKind.ClassDeclaration */) {
            bindBlockScopedDeclaration(node, 32 /* SymbolFlags.Class */, 899503 /* SymbolFlags.ClassExcludes */);
        }
        else {
            var bindingName = node.name ? node.name.escapedText : "__class" /* InternalSymbolName.Class */;
            bindAnonymousDeclaration(node, 32 /* SymbolFlags.Class */, bindingName);
            // Add name of class expression into the map for semantic classifier
            if (node.name) {
                classifiableNames.add(node.name.escapedText);
            }
        }
        var symbol = node.symbol;
        // TypeScript 1.0 spec (April 2014): 8.4
        // Every class automatically contains a static property member named 'prototype', the
        // type of which is an instantiation of the class type with type Any supplied as a type
        // argument for each type parameter. It is an error to explicitly declare a static
        // property member with the name 'prototype'.
        //
        // Note: we check for this here because this class may be merging into a module.  The
        // module might have an exported variable called 'prototype'.  We can't allow that as
        // that would clash with the built-in 'prototype' for the class.
        var prototypeSymbol = createSymbol(4 /* SymbolFlags.Property */ | 4194304 /* SymbolFlags.Prototype */, "prototype");
        var symbolExport = symbol.exports.get(prototypeSymbol.escapedName);
        if (symbolExport) {
            if (node.name) {
                (0, ts_1.setParent)(node.name, node);
            }
            file.bindDiagnostics.push(createDiagnosticForNode(symbolExport.declarations[0], ts_1.Diagnostics.Duplicate_identifier_0, (0, ts_1.symbolName)(prototypeSymbol)));
        }
        symbol.exports.set(prototypeSymbol.escapedName, prototypeSymbol);
        prototypeSymbol.parent = symbol;
    }
    function bindEnumDeclaration(node) {
        return (0, ts_1.isEnumConst)(node)
            ? bindBlockScopedDeclaration(node, 128 /* SymbolFlags.ConstEnum */, 899967 /* SymbolFlags.ConstEnumExcludes */)
            : bindBlockScopedDeclaration(node, 256 /* SymbolFlags.RegularEnum */, 899327 /* SymbolFlags.RegularEnumExcludes */);
    }
    function bindVariableDeclarationOrBindingElement(node) {
        if (inStrictMode) {
            checkStrictModeEvalOrArguments(node, node.name);
        }
        if (!(0, ts_1.isBindingPattern)(node.name)) {
            var possibleVariableDecl = node.kind === 259 /* SyntaxKind.VariableDeclaration */ ? node : node.parent.parent;
            if ((0, ts_1.isInJSFile)(node) &&
                (0, ts_1.shouldResolveJsRequire)(options) &&
                (0, ts_1.isVariableDeclarationInitializedToBareOrAccessedRequire)(possibleVariableDecl) &&
                !(0, ts_1.getJSDocTypeTag)(node) &&
                !((0, ts_1.getCombinedModifierFlags)(node) & 1 /* ModifierFlags.Export */)) {
                declareSymbolAndAddToSymbolTable(node, 2097152 /* SymbolFlags.Alias */, 2097152 /* SymbolFlags.AliasExcludes */);
            }
            else if ((0, ts_1.isBlockOrCatchScoped)(node)) {
                bindBlockScopedDeclaration(node, 2 /* SymbolFlags.BlockScopedVariable */, 111551 /* SymbolFlags.BlockScopedVariableExcludes */);
            }
            else if ((0, ts_1.isParameterDeclaration)(node)) {
                // It is safe to walk up parent chain to find whether the node is a destructuring parameter declaration
                // because its parent chain has already been set up, since parents are set before descending into children.
                //
                // If node is a binding element in parameter declaration, we need to use ParameterExcludes.
                // Using ParameterExcludes flag allows the compiler to report an error on duplicate identifiers in Parameter Declaration
                // For example:
                //      function foo([a,a]) {} // Duplicate Identifier error
                //      function bar(a,a) {}   // Duplicate Identifier error, parameter declaration in this case is handled in bindParameter
                //                             // which correctly set excluded symbols
                declareSymbolAndAddToSymbolTable(node, 1 /* SymbolFlags.FunctionScopedVariable */, 111551 /* SymbolFlags.ParameterExcludes */);
            }
            else {
                declareSymbolAndAddToSymbolTable(node, 1 /* SymbolFlags.FunctionScopedVariable */, 111550 /* SymbolFlags.FunctionScopedVariableExcludes */);
            }
        }
    }
    function bindParameter(node) {
        if (node.kind === 347 /* SyntaxKind.JSDocParameterTag */ && container.kind !== 329 /* SyntaxKind.JSDocSignature */) {
            return;
        }
        if (inStrictMode && !(node.flags & 16777216 /* NodeFlags.Ambient */)) {
            // It is a SyntaxError if the identifier eval or arguments appears within a FormalParameterList of a
            // strict mode FunctionLikeDeclaration or FunctionExpression(13.1)
            checkStrictModeEvalOrArguments(node, node.name);
        }
        if ((0, ts_1.isBindingPattern)(node.name)) {
            bindAnonymousDeclaration(node, 1 /* SymbolFlags.FunctionScopedVariable */, "__" + node.parent.parameters.indexOf(node));
        }
        else {
            declareSymbolAndAddToSymbolTable(node, 1 /* SymbolFlags.FunctionScopedVariable */, 111551 /* SymbolFlags.ParameterExcludes */);
        }
        // If this is a property-parameter, then also declare the property symbol into the
        // containing class.
        if ((0, ts_1.isParameterPropertyDeclaration)(node, node.parent)) {
            var classDeclaration = node.parent.parent;
            declareSymbol(classDeclaration.symbol.members, classDeclaration.symbol, node, 4 /* SymbolFlags.Property */ | (node.questionToken ? 16777216 /* SymbolFlags.Optional */ : 0 /* SymbolFlags.None */), 0 /* SymbolFlags.PropertyExcludes */);
        }
    }
    function bindFunctionDeclaration(node) {
        if (!file.isDeclarationFile && !(node.flags & 16777216 /* NodeFlags.Ambient */)) {
            if ((0, ts_1.isAsyncFunction)(node)) {
                emitFlags |= 2048 /* NodeFlags.HasAsyncFunctions */;
            }
        }
        checkStrictModeFunctionName(node);
        if (inStrictMode) {
            checkStrictModeFunctionDeclaration(node);
            bindBlockScopedDeclaration(node, 16 /* SymbolFlags.Function */, 110991 /* SymbolFlags.FunctionExcludes */);
        }
        else {
            declareSymbolAndAddToSymbolTable(node, 16 /* SymbolFlags.Function */, 110991 /* SymbolFlags.FunctionExcludes */);
        }
    }
    function bindFunctionExpression(node) {
        if (!file.isDeclarationFile && !(node.flags & 16777216 /* NodeFlags.Ambient */)) {
            if ((0, ts_1.isAsyncFunction)(node)) {
                emitFlags |= 2048 /* NodeFlags.HasAsyncFunctions */;
            }
        }
        if (currentFlow) {
            node.flowNode = currentFlow;
        }
        checkStrictModeFunctionName(node);
        var bindingName = node.name ? node.name.escapedText : "__function" /* InternalSymbolName.Function */;
        return bindAnonymousDeclaration(node, 16 /* SymbolFlags.Function */, bindingName);
    }
    function bindPropertyOrMethodOrAccessor(node, symbolFlags, symbolExcludes) {
        if (!file.isDeclarationFile && !(node.flags & 16777216 /* NodeFlags.Ambient */) && (0, ts_1.isAsyncFunction)(node)) {
            emitFlags |= 2048 /* NodeFlags.HasAsyncFunctions */;
        }
        if (currentFlow && (0, ts_1.isObjectLiteralOrClassExpressionMethodOrAccessor)(node)) {
            node.flowNode = currentFlow;
        }
        return (0, ts_1.hasDynamicName)(node)
            ? bindAnonymousDeclaration(node, symbolFlags, "__computed" /* InternalSymbolName.Computed */)
            : declareSymbolAndAddToSymbolTable(node, symbolFlags, symbolExcludes);
    }
    function getInferTypeContainer(node) {
        var extendsType = (0, ts_1.findAncestor)(node, function (n) { return n.parent && (0, ts_1.isConditionalTypeNode)(n.parent) && n.parent.extendsType === n; });
        return extendsType && extendsType.parent;
    }
    function bindTypeParameter(node) {
        var _a, _b;
        if ((0, ts_1.isJSDocTemplateTag)(node.parent)) {
            var container_1 = (0, ts_1.getEffectiveContainerForJSDocTemplateTag)(node.parent);
            if (container_1) {
                ts_1.Debug.assertNode(container_1, ts_1.canHaveLocals);
                (_a = container_1.locals) !== null && _a !== void 0 ? _a : (container_1.locals = (0, ts_1.createSymbolTable)());
                declareSymbol(container_1.locals, /*parent*/ undefined, node, 262144 /* SymbolFlags.TypeParameter */, 526824 /* SymbolFlags.TypeParameterExcludes */);
            }
            else {
                declareSymbolAndAddToSymbolTable(node, 262144 /* SymbolFlags.TypeParameter */, 526824 /* SymbolFlags.TypeParameterExcludes */);
            }
        }
        else if (node.parent.kind === 194 /* SyntaxKind.InferType */) {
            var container_2 = getInferTypeContainer(node.parent);
            if (container_2) {
                ts_1.Debug.assertNode(container_2, ts_1.canHaveLocals);
                (_b = container_2.locals) !== null && _b !== void 0 ? _b : (container_2.locals = (0, ts_1.createSymbolTable)());
                declareSymbol(container_2.locals, /*parent*/ undefined, node, 262144 /* SymbolFlags.TypeParameter */, 526824 /* SymbolFlags.TypeParameterExcludes */);
            }
            else {
                bindAnonymousDeclaration(node, 262144 /* SymbolFlags.TypeParameter */, getDeclarationName(node)); // TODO: GH#18217
            }
        }
        else {
            declareSymbolAndAddToSymbolTable(node, 262144 /* SymbolFlags.TypeParameter */, 526824 /* SymbolFlags.TypeParameterExcludes */);
        }
    }
    // reachability checks
    function shouldReportErrorOnModuleDeclaration(node) {
        var instanceState = getModuleInstanceState(node);
        return instanceState === 1 /* ModuleInstanceState.Instantiated */ || (instanceState === 2 /* ModuleInstanceState.ConstEnumOnly */ && (0, ts_1.shouldPreserveConstEnums)(options));
    }
    function checkUnreachable(node) {
        if (!(currentFlow.flags & 1 /* FlowFlags.Unreachable */)) {
            return false;
        }
        if (currentFlow === unreachableFlow) {
            var reportError_1 = 
            // report error on all statements except empty ones
            ((0, ts_1.isStatementButNotDeclaration)(node) && node.kind !== 241 /* SyntaxKind.EmptyStatement */) ||
                // report error on class declarations
                node.kind === 262 /* SyntaxKind.ClassDeclaration */ ||
                // report error on instantiated modules or const-enums only modules if preserveConstEnums is set
                (node.kind === 266 /* SyntaxKind.ModuleDeclaration */ && shouldReportErrorOnModuleDeclaration(node));
            if (reportError_1) {
                currentFlow = reportedUnreachableFlow;
                if (!options.allowUnreachableCode) {
                    // unreachable code is reported if
                    // - user has explicitly asked about it AND
                    // - statement is in not ambient context (statements in ambient context is already an error
                    //   so we should not report extras) AND
                    //   - node is not variable statement OR
                    //   - node is block scoped variable statement OR
                    //   - node is not block scoped variable statement and at least one variable declaration has initializer
                    //   Rationale: we don't want to report errors on non-initialized var's since they are hoisted
                    //   On the other side we do want to report errors on non-initialized 'lets' because of TDZ
                    var isError_1 = (0, ts_1.unreachableCodeIsError)(options) &&
                        !(node.flags & 16777216 /* NodeFlags.Ambient */) &&
                        (!(0, ts_1.isVariableStatement)(node) ||
                            !!((0, ts_1.getCombinedNodeFlags)(node.declarationList) & 3 /* NodeFlags.BlockScoped */) ||
                            node.declarationList.declarations.some(function (d) { return !!d.initializer; }));
                    eachUnreachableRange(node, function (start, end) { return errorOrSuggestionOnRange(isError_1, start, end, ts_1.Diagnostics.Unreachable_code_detected); });
                }
            }
        }
        return true;
    }
}
function eachUnreachableRange(node, cb) {
    if ((0, ts_1.isStatement)(node) && isExecutableStatement(node) && (0, ts_1.isBlock)(node.parent)) {
        var statements = node.parent.statements;
        var slice_1 = (0, ts_1.sliceAfter)(statements, node);
        (0, ts_1.getRangesWhere)(slice_1, isExecutableStatement, function (start, afterEnd) { return cb(slice_1[start], slice_1[afterEnd - 1]); });
    }
    else {
        cb(node, node);
    }
}
// As opposed to a pure declaration like an `interface`
function isExecutableStatement(s) {
    // Don't remove statements that can validly be used before they appear.
    return !(0, ts_1.isFunctionDeclaration)(s) && !isPurelyTypeDeclaration(s) && !(0, ts_1.isEnumDeclaration)(s) &&
        // `var x;` may declare a variable used above
        !((0, ts_1.isVariableStatement)(s) && !((0, ts_1.getCombinedNodeFlags)(s) & (1 /* NodeFlags.Let */ | 2 /* NodeFlags.Const */)) && s.declarationList.declarations.some(function (d) { return !d.initializer; }));
}
function isPurelyTypeDeclaration(s) {
    switch (s.kind) {
        case 263 /* SyntaxKind.InterfaceDeclaration */:
        case 264 /* SyntaxKind.TypeAliasDeclaration */:
            return true;
        case 266 /* SyntaxKind.ModuleDeclaration */:
            return getModuleInstanceState(s) !== 1 /* ModuleInstanceState.Instantiated */;
        case 265 /* SyntaxKind.EnumDeclaration */:
            return (0, ts_1.hasSyntacticModifier)(s, 2048 /* ModifierFlags.Const */);
        default:
            return false;
    }
}
/** @internal */
function isExportsOrModuleExportsOrAlias(sourceFile, node) {
    var i = 0;
    var q = (0, ts_1.createQueue)();
    q.enqueue(node);
    while (!q.isEmpty() && i < 100) {
        i++;
        node = q.dequeue();
        if ((0, ts_1.isExportsIdentifier)(node) || (0, ts_1.isModuleExportsAccessExpression)(node)) {
            return true;
        }
        else if ((0, ts_1.isIdentifier)(node)) {
            var symbol = lookupSymbolForName(sourceFile, node.escapedText);
            if (!!symbol && !!symbol.valueDeclaration && (0, ts_1.isVariableDeclaration)(symbol.valueDeclaration) && !!symbol.valueDeclaration.initializer) {
                var init = symbol.valueDeclaration.initializer;
                q.enqueue(init);
                if ((0, ts_1.isAssignmentExpression)(init, /*excludeCompoundAssignment*/ true)) {
                    q.enqueue(init.left);
                    q.enqueue(init.right);
                }
            }
        }
    }
    return false;
}
exports.isExportsOrModuleExportsOrAlias = isExportsOrModuleExportsOrAlias;
function getContainerFlags(node) {
    switch (node.kind) {
        case 230 /* SyntaxKind.ClassExpression */:
        case 262 /* SyntaxKind.ClassDeclaration */:
        case 265 /* SyntaxKind.EnumDeclaration */:
        case 209 /* SyntaxKind.ObjectLiteralExpression */:
        case 186 /* SyntaxKind.TypeLiteral */:
        case 328 /* SyntaxKind.JSDocTypeLiteral */:
        case 291 /* SyntaxKind.JsxAttributes */:
            return 1 /* ContainerFlags.IsContainer */;
        case 263 /* SyntaxKind.InterfaceDeclaration */:
            return 1 /* ContainerFlags.IsContainer */ | 64 /* ContainerFlags.IsInterface */;
        case 266 /* SyntaxKind.ModuleDeclaration */:
        case 264 /* SyntaxKind.TypeAliasDeclaration */:
        case 199 /* SyntaxKind.MappedType */:
        case 180 /* SyntaxKind.IndexSignature */:
            return 1 /* ContainerFlags.IsContainer */ | 32 /* ContainerFlags.HasLocals */;
        case 311 /* SyntaxKind.SourceFile */:
            return 1 /* ContainerFlags.IsContainer */ | 4 /* ContainerFlags.IsControlFlowContainer */ | 32 /* ContainerFlags.HasLocals */;
        case 176 /* SyntaxKind.GetAccessor */:
        case 177 /* SyntaxKind.SetAccessor */:
        case 173 /* SyntaxKind.MethodDeclaration */:
            if ((0, ts_1.isObjectLiteralOrClassExpressionMethodOrAccessor)(node)) {
                return 1 /* ContainerFlags.IsContainer */ | 4 /* ContainerFlags.IsControlFlowContainer */ | 32 /* ContainerFlags.HasLocals */ | 8 /* ContainerFlags.IsFunctionLike */ | 128 /* ContainerFlags.IsObjectLiteralOrClassExpressionMethodOrAccessor */;
            }
        // falls through
        case 175 /* SyntaxKind.Constructor */:
        case 261 /* SyntaxKind.FunctionDeclaration */:
        case 172 /* SyntaxKind.MethodSignature */:
        case 178 /* SyntaxKind.CallSignature */:
        case 329 /* SyntaxKind.JSDocSignature */:
        case 323 /* SyntaxKind.JSDocFunctionType */:
        case 183 /* SyntaxKind.FunctionType */:
        case 179 /* SyntaxKind.ConstructSignature */:
        case 184 /* SyntaxKind.ConstructorType */:
        case 174 /* SyntaxKind.ClassStaticBlockDeclaration */:
            return 1 /* ContainerFlags.IsContainer */ | 4 /* ContainerFlags.IsControlFlowContainer */ | 32 /* ContainerFlags.HasLocals */ | 8 /* ContainerFlags.IsFunctionLike */;
        case 217 /* SyntaxKind.FunctionExpression */:
        case 218 /* SyntaxKind.ArrowFunction */:
            return 1 /* ContainerFlags.IsContainer */ | 4 /* ContainerFlags.IsControlFlowContainer */ | 32 /* ContainerFlags.HasLocals */ | 8 /* ContainerFlags.IsFunctionLike */ | 16 /* ContainerFlags.IsFunctionExpression */;
        case 267 /* SyntaxKind.ModuleBlock */:
            return 4 /* ContainerFlags.IsControlFlowContainer */;
        case 171 /* SyntaxKind.PropertyDeclaration */:
            return node.initializer ? 4 /* ContainerFlags.IsControlFlowContainer */ : 0;
        case 298 /* SyntaxKind.CatchClause */:
        case 247 /* SyntaxKind.ForStatement */:
        case 248 /* SyntaxKind.ForInStatement */:
        case 249 /* SyntaxKind.ForOfStatement */:
        case 268 /* SyntaxKind.CaseBlock */:
            return 2 /* ContainerFlags.IsBlockScopedContainer */ | 32 /* ContainerFlags.HasLocals */;
        case 240 /* SyntaxKind.Block */:
            // do not treat blocks directly inside a function as a block-scoped-container.
            // Locals that reside in this block should go to the function locals. Otherwise 'x'
            // would not appear to be a redeclaration of a block scoped local in the following
            // example:
            //
            //      function foo() {
            //          var x;
            //          let x;
            //      }
            //
            // If we placed 'var x' into the function locals and 'let x' into the locals of
            // the block, then there would be no collision.
            //
            // By not creating a new block-scoped-container here, we ensure that both 'var x'
            // and 'let x' go into the Function-container's locals, and we do get a collision
            // conflict.
            return (0, ts_1.isFunctionLike)(node.parent) || (0, ts_1.isClassStaticBlockDeclaration)(node.parent) ? 0 /* ContainerFlags.None */ : 2 /* ContainerFlags.IsBlockScopedContainer */ | 32 /* ContainerFlags.HasLocals */;
    }
    return 0 /* ContainerFlags.None */;
}
function lookupSymbolForName(container, name) {
    var _a, _b, _c, _d, _e;
    var local = (_b = (_a = (0, ts_1.tryCast)(container, ts_1.canHaveLocals)) === null || _a === void 0 ? void 0 : _a.locals) === null || _b === void 0 ? void 0 : _b.get(name);
    if (local) {
        return (_c = local.exportSymbol) !== null && _c !== void 0 ? _c : local;
    }
    if ((0, ts_1.isSourceFile)(container) && container.jsGlobalAugmentations && container.jsGlobalAugmentations.has(name)) {
        return container.jsGlobalAugmentations.get(name);
    }
    if ((0, ts_1.canHaveSymbol)(container)) {
        return (_e = (_d = container.symbol) === null || _d === void 0 ? void 0 : _d.exports) === null || _e === void 0 ? void 0 : _e.get(name);
    }
}
