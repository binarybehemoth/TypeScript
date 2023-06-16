"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Debug = exports.LogLevel = void 0;
var ts = require("./_namespaces/ts");
var ts_1 = require("./_namespaces/ts");
/** @internal */
var LogLevel;
(function (LogLevel) {
    LogLevel[LogLevel["Off"] = 0] = "Off";
    LogLevel[LogLevel["Error"] = 1] = "Error";
    LogLevel[LogLevel["Warning"] = 2] = "Warning";
    LogLevel[LogLevel["Info"] = 3] = "Info";
    LogLevel[LogLevel["Verbose"] = 4] = "Verbose";
})(LogLevel || (exports.LogLevel = LogLevel = {}));
/** @internal */
var Debug;
(function (Debug) {
    /* eslint-disable prefer-const */
    var currentAssertionLevel = 0 /* AssertionLevel.None */;
    Debug.currentLogLevel = LogLevel.Warning;
    Debug.isDebugging = false;
    function shouldLog(level) {
        return Debug.currentLogLevel <= level;
    }
    Debug.shouldLog = shouldLog;
    function logMessage(level, s) {
        if (Debug.loggingHost && shouldLog(level)) {
            Debug.loggingHost.log(level, s);
        }
    }
    function log(s) {
        logMessage(LogLevel.Info, s);
    }
    Debug.log = log;
    (function (log_1) {
        function error(s) {
            logMessage(LogLevel.Error, s);
        }
        log_1.error = error;
        function warn(s) {
            logMessage(LogLevel.Warning, s);
        }
        log_1.warn = warn;
        function log(s) {
            logMessage(LogLevel.Info, s);
        }
        log_1.log = log;
        function trace(s) {
            logMessage(LogLevel.Verbose, s);
        }
        log_1.trace = trace;
    })(log = Debug.log || (Debug.log = {}));
    var assertionCache = {};
    function getAssertionLevel() {
        return currentAssertionLevel;
    }
    Debug.getAssertionLevel = getAssertionLevel;
    function setAssertionLevel(level) {
        var prevAssertionLevel = currentAssertionLevel;
        currentAssertionLevel = level;
        if (level > prevAssertionLevel) {
            // restore assertion functions for the current assertion level (see `shouldAssertFunction`).
            for (var _i = 0, _a = (0, ts_1.getOwnKeys)(assertionCache); _i < _a.length; _i++) {
                var key = _a[_i];
                var cachedFunc = assertionCache[key];
                if (cachedFunc !== undefined && Debug[key] !== cachedFunc.assertion && level >= cachedFunc.level) {
                    Debug[key] = cachedFunc;
                    assertionCache[key] = undefined;
                }
            }
        }
    }
    Debug.setAssertionLevel = setAssertionLevel;
    function shouldAssert(level) {
        return currentAssertionLevel >= level;
    }
    Debug.shouldAssert = shouldAssert;
    /**
     * Tests whether an assertion function should be executed. If it shouldn't, it is cached and replaced with `ts.noop`.
     * Replaced assertion functions are restored when `Debug.setAssertionLevel` is set to a high enough level.
     * @param level The minimum assertion level required.
     * @param name The name of the current assertion function.
     */
    function shouldAssertFunction(level, name) {
        if (!shouldAssert(level)) {
            assertionCache[name] = { level: level, assertion: Debug[name] };
            Debug[name] = ts_1.noop;
            return false;
        }
        return true;
    }
    function fail(message, stackCrawlMark) {
        debugger;
        var e = new Error(message ? "Debug Failure. ".concat(message) : "Debug Failure.");
        if (Error.captureStackTrace) {
            Error.captureStackTrace(e, stackCrawlMark || fail);
        }
        throw e;
    }
    Debug.fail = fail;
    function failBadSyntaxKind(node, message, stackCrawlMark) {
        return fail("".concat(message || "Unexpected node.", "\r\nNode ").concat(formatSyntaxKind(node.kind), " was unexpected."), stackCrawlMark || failBadSyntaxKind);
    }
    Debug.failBadSyntaxKind = failBadSyntaxKind;
    function assert(expression, message, verboseDebugInfo, stackCrawlMark) {
        if (!expression) {
            message = message ? "False expression: ".concat(message) : "False expression.";
            if (verboseDebugInfo) {
                message += "\r\nVerbose Debug Information: " + (typeof verboseDebugInfo === "string" ? verboseDebugInfo : verboseDebugInfo());
            }
            fail(message, stackCrawlMark || assert);
        }
    }
    Debug.assert = assert;
    function assertEqual(a, b, msg, msg2, stackCrawlMark) {
        if (a !== b) {
            var message = msg ? msg2 ? "".concat(msg, " ").concat(msg2) : msg : "";
            fail("Expected ".concat(a, " === ").concat(b, ". ").concat(message), stackCrawlMark || assertEqual);
        }
    }
    Debug.assertEqual = assertEqual;
    function assertLessThan(a, b, msg, stackCrawlMark) {
        if (a >= b) {
            fail("Expected ".concat(a, " < ").concat(b, ". ").concat(msg || ""), stackCrawlMark || assertLessThan);
        }
    }
    Debug.assertLessThan = assertLessThan;
    function assertLessThanOrEqual(a, b, stackCrawlMark) {
        if (a > b) {
            fail("Expected ".concat(a, " <= ").concat(b), stackCrawlMark || assertLessThanOrEqual);
        }
    }
    Debug.assertLessThanOrEqual = assertLessThanOrEqual;
    function assertGreaterThanOrEqual(a, b, stackCrawlMark) {
        if (a < b) {
            fail("Expected ".concat(a, " >= ").concat(b), stackCrawlMark || assertGreaterThanOrEqual);
        }
    }
    Debug.assertGreaterThanOrEqual = assertGreaterThanOrEqual;
    function assertIsDefined(value, message, stackCrawlMark) {
        // eslint-disable-next-line no-null/no-null
        if (value === undefined || value === null) {
            fail(message, stackCrawlMark || assertIsDefined);
        }
    }
    Debug.assertIsDefined = assertIsDefined;
    function checkDefined(value, message, stackCrawlMark) {
        assertIsDefined(value, message, stackCrawlMark || checkDefined);
        return value;
    }
    Debug.checkDefined = checkDefined;
    function assertEachIsDefined(value, message, stackCrawlMark) {
        for (var _i = 0, value_1 = value; _i < value_1.length; _i++) {
            var v = value_1[_i];
            assertIsDefined(v, message, stackCrawlMark || assertEachIsDefined);
        }
    }
    Debug.assertEachIsDefined = assertEachIsDefined;
    function checkEachDefined(value, message, stackCrawlMark) {
        assertEachIsDefined(value, message, stackCrawlMark || checkEachDefined);
        return value;
    }
    Debug.checkEachDefined = checkEachDefined;
    function assertNever(member, message, stackCrawlMark) {
        if (message === void 0) { message = "Illegal value:"; }
        var detail = typeof member === "object" && (0, ts_1.hasProperty)(member, "kind") && (0, ts_1.hasProperty)(member, "pos") ? "SyntaxKind: " + formatSyntaxKind(member.kind) : JSON.stringify(member);
        return fail("".concat(message, " ").concat(detail), stackCrawlMark || assertNever);
    }
    Debug.assertNever = assertNever;
    function assertEachNode(nodes, test, message, stackCrawlMark) {
        if (shouldAssertFunction(1 /* AssertionLevel.Normal */, "assertEachNode")) {
            assert(test === undefined || (0, ts_1.every)(nodes, test), message || "Unexpected node.", function () { return "Node array did not pass test '".concat(getFunctionName(test), "'."); }, stackCrawlMark || assertEachNode);
        }
    }
    Debug.assertEachNode = assertEachNode;
    function assertNode(node, test, message, stackCrawlMark) {
        if (shouldAssertFunction(1 /* AssertionLevel.Normal */, "assertNode")) {
            assert(node !== undefined && (test === undefined || test(node)), message || "Unexpected node.", function () { return "Node ".concat(formatSyntaxKind(node === null || node === void 0 ? void 0 : node.kind), " did not pass test '").concat(getFunctionName(test), "'."); }, stackCrawlMark || assertNode);
        }
    }
    Debug.assertNode = assertNode;
    function assertNotNode(node, test, message, stackCrawlMark) {
        if (shouldAssertFunction(1 /* AssertionLevel.Normal */, "assertNotNode")) {
            assert(node === undefined || test === undefined || !test(node), message || "Unexpected node.", function () { return "Node ".concat(formatSyntaxKind(node.kind), " should not have passed test '").concat(getFunctionName(test), "'."); }, stackCrawlMark || assertNotNode);
        }
    }
    Debug.assertNotNode = assertNotNode;
    function assertOptionalNode(node, test, message, stackCrawlMark) {
        if (shouldAssertFunction(1 /* AssertionLevel.Normal */, "assertOptionalNode")) {
            assert(test === undefined || node === undefined || test(node), message || "Unexpected node.", function () { return "Node ".concat(formatSyntaxKind(node === null || node === void 0 ? void 0 : node.kind), " did not pass test '").concat(getFunctionName(test), "'."); }, stackCrawlMark || assertOptionalNode);
        }
    }
    Debug.assertOptionalNode = assertOptionalNode;
    function assertOptionalToken(node, kind, message, stackCrawlMark) {
        if (shouldAssertFunction(1 /* AssertionLevel.Normal */, "assertOptionalToken")) {
            assert(kind === undefined || node === undefined || node.kind === kind, message || "Unexpected node.", function () { return "Node ".concat(formatSyntaxKind(node === null || node === void 0 ? void 0 : node.kind), " was not a '").concat(formatSyntaxKind(kind), "' token."); }, stackCrawlMark || assertOptionalToken);
        }
    }
    Debug.assertOptionalToken = assertOptionalToken;
    function assertMissingNode(node, message, stackCrawlMark) {
        if (shouldAssertFunction(1 /* AssertionLevel.Normal */, "assertMissingNode")) {
            assert(node === undefined, message || "Unexpected node.", function () { return "Node ".concat(formatSyntaxKind(node.kind), " was unexpected'."); }, stackCrawlMark || assertMissingNode);
        }
    }
    Debug.assertMissingNode = assertMissingNode;
    function type(_value) { }
    Debug.type = type;
    function getFunctionName(func) {
        if (typeof func !== "function") {
            return "";
        }
        else if ((0, ts_1.hasProperty)(func, "name")) {
            return func.name;
        }
        else {
            var text = Function.prototype.toString.call(func);
            var match = /^function\s+([\w\$]+)\s*\(/.exec(text);
            return match ? match[1] : "";
        }
    }
    Debug.getFunctionName = getFunctionName;
    function formatSymbol(symbol) {
        return "{ name: ".concat((0, ts_1.unescapeLeadingUnderscores)(symbol.escapedName), "; flags: ").concat(formatSymbolFlags(symbol.flags), "; declarations: ").concat((0, ts_1.map)(symbol.declarations, function (node) { return formatSyntaxKind(node.kind); }), " }");
    }
    Debug.formatSymbol = formatSymbol;
    /**
     * Formats an enum value as a string for debugging and debug assertions.
     */
    function formatEnum(value, enumObject, isFlags) {
        if (value === void 0) { value = 0; }
        var members = getEnumMembers(enumObject);
        if (value === 0) {
            return members.length > 0 && members[0][0] === 0 ? members[0][1] : "0";
        }
        if (isFlags) {
            var result = [];
            var remainingFlags = value;
            for (var _i = 0, members_1 = members; _i < members_1.length; _i++) {
                var _a = members_1[_i], enumValue = _a[0], enumName = _a[1];
                if (enumValue > value) {
                    break;
                }
                if (enumValue !== 0 && enumValue & value) {
                    result.push(enumName);
                    remainingFlags &= ~enumValue;
                }
            }
            if (remainingFlags === 0) {
                return result.join("|");
            }
        }
        else {
            for (var _b = 0, members_2 = members; _b < members_2.length; _b++) {
                var _c = members_2[_b], enumValue = _c[0], enumName = _c[1];
                if (enumValue === value) {
                    return enumName;
                }
            }
        }
        return value.toString();
    }
    Debug.formatEnum = formatEnum;
    var enumMemberCache = new Map();
    function getEnumMembers(enumObject) {
        // Assuming enum objects do not change at runtime, we can cache the enum members list
        // to reuse later. This saves us from reconstructing this each and every time we call
        // a formatting function (which can be expensive for large enums like SyntaxKind).
        var existing = enumMemberCache.get(enumObject);
        if (existing) {
            return existing;
        }
        var result = [];
        for (var name_1 in enumObject) {
            var value = enumObject[name_1];
            if (typeof value === "number") {
                result.push([value, name_1]);
            }
        }
        var sorted = (0, ts_1.stableSort)(result, function (x, y) { return (0, ts_1.compareValues)(x[0], y[0]); });
        enumMemberCache.set(enumObject, sorted);
        return sorted;
    }
    function formatSyntaxKind(kind) {
        return formatEnum(kind, ts.SyntaxKind, /*isFlags*/ false);
    }
    Debug.formatSyntaxKind = formatSyntaxKind;
    function formatSnippetKind(kind) {
        return formatEnum(kind, ts.SnippetKind, /*isFlags*/ false);
    }
    Debug.formatSnippetKind = formatSnippetKind;
    function formatScriptKind(kind) {
        return formatEnum(kind, ts.ScriptKind, /*isFlags*/ false);
    }
    Debug.formatScriptKind = formatScriptKind;
    function formatNodeFlags(flags) {
        return formatEnum(flags, ts.NodeFlags, /*isFlags*/ true);
    }
    Debug.formatNodeFlags = formatNodeFlags;
    function formatModifierFlags(flags) {
        return formatEnum(flags, ts.ModifierFlags, /*isFlags*/ true);
    }
    Debug.formatModifierFlags = formatModifierFlags;
    function formatTransformFlags(flags) {
        return formatEnum(flags, ts.TransformFlags, /*isFlags*/ true);
    }
    Debug.formatTransformFlags = formatTransformFlags;
    function formatEmitFlags(flags) {
        return formatEnum(flags, ts.EmitFlags, /*isFlags*/ true);
    }
    Debug.formatEmitFlags = formatEmitFlags;
    function formatSymbolFlags(flags) {
        return formatEnum(flags, ts.SymbolFlags, /*isFlags*/ true);
    }
    Debug.formatSymbolFlags = formatSymbolFlags;
    function formatTypeFlags(flags) {
        return formatEnum(flags, ts.TypeFlags, /*isFlags*/ true);
    }
    Debug.formatTypeFlags = formatTypeFlags;
    function formatSignatureFlags(flags) {
        return formatEnum(flags, ts.SignatureFlags, /*isFlags*/ true);
    }
    Debug.formatSignatureFlags = formatSignatureFlags;
    function formatObjectFlags(flags) {
        return formatEnum(flags, ts.ObjectFlags, /*isFlags*/ true);
    }
    Debug.formatObjectFlags = formatObjectFlags;
    function formatFlowFlags(flags) {
        return formatEnum(flags, ts.FlowFlags, /*isFlags*/ true);
    }
    Debug.formatFlowFlags = formatFlowFlags;
    function formatRelationComparisonResult(result) {
        return formatEnum(result, ts.RelationComparisonResult, /*isFlags*/ true);
    }
    Debug.formatRelationComparisonResult = formatRelationComparisonResult;
    function formatCheckMode(mode) {
        return formatEnum(mode, ts.CheckMode, /*isFlags*/ true);
    }
    Debug.formatCheckMode = formatCheckMode;
    function formatSignatureCheckMode(mode) {
        return formatEnum(mode, ts.SignatureCheckMode, /*isFlags*/ true);
    }
    Debug.formatSignatureCheckMode = formatSignatureCheckMode;
    function formatTypeFacts(facts) {
        return formatEnum(facts, ts.TypeFacts, /*isFlags*/ true);
    }
    Debug.formatTypeFacts = formatTypeFacts;
    var isDebugInfoEnabled = false;
    var flowNodeProto;
    function attachFlowNodeDebugInfoWorker(flowNode) {
        if (!("__debugFlowFlags" in flowNode)) { // eslint-disable-line local/no-in-operator
            Object.defineProperties(flowNode, {
                // for use with vscode-js-debug's new customDescriptionGenerator in launch.json
                __tsDebuggerDisplay: {
                    value: function () {
                        var flowHeader = this.flags & 2 /* FlowFlags.Start */ ? "FlowStart" :
                            this.flags & 4 /* FlowFlags.BranchLabel */ ? "FlowBranchLabel" :
                                this.flags & 8 /* FlowFlags.LoopLabel */ ? "FlowLoopLabel" :
                                    this.flags & 16 /* FlowFlags.Assignment */ ? "FlowAssignment" :
                                        this.flags & 32 /* FlowFlags.TrueCondition */ ? "FlowTrueCondition" :
                                            this.flags & 64 /* FlowFlags.FalseCondition */ ? "FlowFalseCondition" :
                                                this.flags & 128 /* FlowFlags.SwitchClause */ ? "FlowSwitchClause" :
                                                    this.flags & 256 /* FlowFlags.ArrayMutation */ ? "FlowArrayMutation" :
                                                        this.flags & 512 /* FlowFlags.Call */ ? "FlowCall" :
                                                            this.flags & 1024 /* FlowFlags.ReduceLabel */ ? "FlowReduceLabel" :
                                                                this.flags & 1 /* FlowFlags.Unreachable */ ? "FlowUnreachable" :
                                                                    "UnknownFlow";
                        var remainingFlags = this.flags & ~(2048 /* FlowFlags.Referenced */ - 1);
                        return "".concat(flowHeader).concat(remainingFlags ? " (".concat(formatFlowFlags(remainingFlags), ")") : "");
                    }
                },
                __debugFlowFlags: { get: function () { return formatEnum(this.flags, ts.FlowFlags, /*isFlags*/ true); } },
                __debugToString: { value: function () { return formatControlFlowGraph(this); } }
            });
        }
    }
    function attachFlowNodeDebugInfo(flowNode) {
        if (isDebugInfoEnabled) {
            if (typeof Object.setPrototypeOf === "function") {
                // if we're in es2015, attach the method to a shared prototype for `FlowNode`
                // so the method doesn't show up in the watch window.
                if (!flowNodeProto) {
                    flowNodeProto = Object.create(Object.prototype);
                    attachFlowNodeDebugInfoWorker(flowNodeProto);
                }
                Object.setPrototypeOf(flowNode, flowNodeProto);
            }
            else {
                // not running in an es2015 environment, attach the method directly.
                attachFlowNodeDebugInfoWorker(flowNode);
            }
        }
    }
    Debug.attachFlowNodeDebugInfo = attachFlowNodeDebugInfo;
    var nodeArrayProto;
    function attachNodeArrayDebugInfoWorker(array) {
        if (!("__tsDebuggerDisplay" in array)) { // eslint-disable-line local/no-in-operator
            Object.defineProperties(array, {
                __tsDebuggerDisplay: {
                    value: function (defaultValue) {
                        // An `Array` with extra properties is rendered as `[A, B, prop1: 1, prop2: 2]`. Most of
                        // these aren't immediately useful so we trim off the `prop1: ..., prop2: ...` part from the
                        // formatted string.
                        // This regex can trigger slow backtracking because of overlapping potential captures.
                        // We don't care, this is debug code that's only enabled with a debugger attached -
                        // we're just taking note of it for anyone checking regex performance in the future.
                        defaultValue = String(defaultValue).replace(/(?:,[\s\w\d_]+:[^,]+)+\]$/, "]");
                        return "NodeArray ".concat(defaultValue);
                    }
                }
            });
        }
    }
    function attachNodeArrayDebugInfo(array) {
        if (isDebugInfoEnabled) {
            if (typeof Object.setPrototypeOf === "function") {
                // if we're in es2015, attach the method to a shared prototype for `NodeArray`
                // so the method doesn't show up in the watch window.
                if (!nodeArrayProto) {
                    nodeArrayProto = Object.create(Array.prototype);
                    attachNodeArrayDebugInfoWorker(nodeArrayProto);
                }
                Object.setPrototypeOf(array, nodeArrayProto);
            }
            else {
                // not running in an es2015 environment, attach the method directly.
                attachNodeArrayDebugInfoWorker(array);
            }
        }
    }
    Debug.attachNodeArrayDebugInfo = attachNodeArrayDebugInfo;
    /**
     * Injects debug information into frequently used types.
     */
    function enableDebugInfo() {
        if (isDebugInfoEnabled)
            return;
        // avoid recomputing
        var weakTypeTextMap = new WeakMap();
        var weakNodeTextMap = new WeakMap();
        // Add additional properties in debug mode to assist with debugging.
        Object.defineProperties(ts_1.objectAllocator.getSymbolConstructor().prototype, {
            // for use with vscode-js-debug's new customDescriptionGenerator in launch.json
            __tsDebuggerDisplay: {
                value: function () {
                    var symbolHeader = this.flags & 33554432 /* SymbolFlags.Transient */ ? "TransientSymbol" :
                        "Symbol";
                    var remainingSymbolFlags = this.flags & ~33554432 /* SymbolFlags.Transient */;
                    return "".concat(symbolHeader, " '").concat((0, ts_1.symbolName)(this), "'").concat(remainingSymbolFlags ? " (".concat(formatSymbolFlags(remainingSymbolFlags), ")") : "");
                }
            },
            __debugFlags: { get: function () { return formatSymbolFlags(this.flags); } }
        });
        Object.defineProperties(ts_1.objectAllocator.getTypeConstructor().prototype, {
            // for use with vscode-js-debug's new customDescriptionGenerator in launch.json
            __tsDebuggerDisplay: {
                value: function () {
                    var typeHeader = this.flags & 98304 /* TypeFlags.Nullable */ ? "NullableType" :
                        this.flags & 384 /* TypeFlags.StringOrNumberLiteral */ ? "LiteralType ".concat(JSON.stringify(this.value)) :
                            this.flags & 2048 /* TypeFlags.BigIntLiteral */ ? "LiteralType ".concat(this.value.negative ? "-" : "").concat(this.value.base10Value, "n") :
                                this.flags & 8192 /* TypeFlags.UniqueESSymbol */ ? "UniqueESSymbolType" :
                                    this.flags & 32 /* TypeFlags.Enum */ ? "EnumType" :
                                        this.flags & 67359327 /* TypeFlags.Intrinsic */ ? "IntrinsicType ".concat(this.intrinsicName) :
                                            this.flags & 1048576 /* TypeFlags.Union */ ? "UnionType" :
                                                this.flags & 2097152 /* TypeFlags.Intersection */ ? "IntersectionType" :
                                                    this.flags & 4194304 /* TypeFlags.Index */ ? "IndexType" :
                                                        this.flags & 8388608 /* TypeFlags.IndexedAccess */ ? "IndexedAccessType" :
                                                            this.flags & 16777216 /* TypeFlags.Conditional */ ? "ConditionalType" :
                                                                this.flags & 33554432 /* TypeFlags.Substitution */ ? "SubstitutionType" :
                                                                    this.flags & 262144 /* TypeFlags.TypeParameter */ ? "TypeParameter" :
                                                                        this.flags & 524288 /* TypeFlags.Object */ ?
                                                                            this.objectFlags & 3 /* ObjectFlags.ClassOrInterface */ ? "InterfaceType" :
                                                                                this.objectFlags & 4 /* ObjectFlags.Reference */ ? "TypeReference" :
                                                                                    this.objectFlags & 8 /* ObjectFlags.Tuple */ ? "TupleType" :
                                                                                        this.objectFlags & 16 /* ObjectFlags.Anonymous */ ? "AnonymousType" :
                                                                                            this.objectFlags & 32 /* ObjectFlags.Mapped */ ? "MappedType" :
                                                                                                this.objectFlags & 1024 /* ObjectFlags.ReverseMapped */ ? "ReverseMappedType" :
                                                                                                    this.objectFlags & 256 /* ObjectFlags.EvolvingArray */ ? "EvolvingArrayType" :
                                                                                                        "ObjectType" :
                                                                            "Type";
                    var remainingObjectFlags = this.flags & 524288 /* TypeFlags.Object */ ? this.objectFlags & ~1343 /* ObjectFlags.ObjectTypeKindMask */ : 0;
                    return "".concat(typeHeader).concat(this.symbol ? " '".concat((0, ts_1.symbolName)(this.symbol), "'") : "").concat(remainingObjectFlags ? " (".concat(formatObjectFlags(remainingObjectFlags), ")") : "");
                }
            },
            __debugFlags: { get: function () { return formatTypeFlags(this.flags); } },
            __debugObjectFlags: { get: function () { return this.flags & 524288 /* TypeFlags.Object */ ? formatObjectFlags(this.objectFlags) : ""; } },
            __debugTypeToString: {
                value: function () {
                    // avoid recomputing
                    var text = weakTypeTextMap.get(this);
                    if (text === undefined) {
                        text = this.checker.typeToString(this);
                        weakTypeTextMap.set(this, text);
                    }
                    return text;
                }
            },
        });
        Object.defineProperties(ts_1.objectAllocator.getSignatureConstructor().prototype, {
            __debugFlags: { get: function () { return formatSignatureFlags(this.flags); } },
            __debugSignatureToString: { value: function () { var _a; return (_a = this.checker) === null || _a === void 0 ? void 0 : _a.signatureToString(this); } }
        });
        var nodeConstructors = [
            ts_1.objectAllocator.getNodeConstructor(),
            ts_1.objectAllocator.getIdentifierConstructor(),
            ts_1.objectAllocator.getTokenConstructor(),
            ts_1.objectAllocator.getSourceFileConstructor()
        ];
        for (var _i = 0, nodeConstructors_1 = nodeConstructors; _i < nodeConstructors_1.length; _i++) {
            var ctor = nodeConstructors_1[_i];
            if (!(0, ts_1.hasProperty)(ctor.prototype, "__debugKind")) {
                Object.defineProperties(ctor.prototype, {
                    // for use with vscode-js-debug's new customDescriptionGenerator in launch.json
                    __tsDebuggerDisplay: {
                        value: function () {
                            var nodeHeader = (0, ts_1.isGeneratedIdentifier)(this) ? "GeneratedIdentifier" :
                                (0, ts_1.isIdentifier)(this) ? "Identifier '".concat((0, ts_1.idText)(this), "'") :
                                    (0, ts_1.isPrivateIdentifier)(this) ? "PrivateIdentifier '".concat((0, ts_1.idText)(this), "'") :
                                        (0, ts_1.isStringLiteral)(this) ? "StringLiteral ".concat(JSON.stringify(this.text.length < 10 ? this.text : this.text.slice(10) + "...")) :
                                            (0, ts_1.isNumericLiteral)(this) ? "NumericLiteral ".concat(this.text) :
                                                (0, ts_1.isBigIntLiteral)(this) ? "BigIntLiteral ".concat(this.text, "n") :
                                                    (0, ts_1.isTypeParameterDeclaration)(this) ? "TypeParameterDeclaration" :
                                                        (0, ts_1.isParameter)(this) ? "ParameterDeclaration" :
                                                            (0, ts_1.isConstructorDeclaration)(this) ? "ConstructorDeclaration" :
                                                                (0, ts_1.isGetAccessorDeclaration)(this) ? "GetAccessorDeclaration" :
                                                                    (0, ts_1.isSetAccessorDeclaration)(this) ? "SetAccessorDeclaration" :
                                                                        (0, ts_1.isCallSignatureDeclaration)(this) ? "CallSignatureDeclaration" :
                                                                            (0, ts_1.isConstructSignatureDeclaration)(this) ? "ConstructSignatureDeclaration" :
                                                                                (0, ts_1.isIndexSignatureDeclaration)(this) ? "IndexSignatureDeclaration" :
                                                                                    (0, ts_1.isTypePredicateNode)(this) ? "TypePredicateNode" :
                                                                                        (0, ts_1.isTypeReferenceNode)(this) ? "TypeReferenceNode" :
                                                                                            (0, ts_1.isFunctionTypeNode)(this) ? "FunctionTypeNode" :
                                                                                                (0, ts_1.isConstructorTypeNode)(this) ? "ConstructorTypeNode" :
                                                                                                    (0, ts_1.isTypeQueryNode)(this) ? "TypeQueryNode" :
                                                                                                        (0, ts_1.isTypeLiteralNode)(this) ? "TypeLiteralNode" :
                                                                                                            (0, ts_1.isArrayTypeNode)(this) ? "ArrayTypeNode" :
                                                                                                                (0, ts_1.isTupleTypeNode)(this) ? "TupleTypeNode" :
                                                                                                                    (0, ts_1.isOptionalTypeNode)(this) ? "OptionalTypeNode" :
                                                                                                                        (0, ts_1.isRestTypeNode)(this) ? "RestTypeNode" :
                                                                                                                            (0, ts_1.isUnionTypeNode)(this) ? "UnionTypeNode" :
                                                                                                                                (0, ts_1.isIntersectionTypeNode)(this) ? "IntersectionTypeNode" :
                                                                                                                                    (0, ts_1.isConditionalTypeNode)(this) ? "ConditionalTypeNode" :
                                                                                                                                        (0, ts_1.isInferTypeNode)(this) ? "InferTypeNode" :
                                                                                                                                            (0, ts_1.isParenthesizedTypeNode)(this) ? "ParenthesizedTypeNode" :
                                                                                                                                                (0, ts_1.isThisTypeNode)(this) ? "ThisTypeNode" :
                                                                                                                                                    (0, ts_1.isTypeOperatorNode)(this) ? "TypeOperatorNode" :
                                                                                                                                                        (0, ts_1.isIndexedAccessTypeNode)(this) ? "IndexedAccessTypeNode" :
                                                                                                                                                            (0, ts_1.isMappedTypeNode)(this) ? "MappedTypeNode" :
                                                                                                                                                                (0, ts_1.isLiteralTypeNode)(this) ? "LiteralTypeNode" :
                                                                                                                                                                    (0, ts_1.isNamedTupleMember)(this) ? "NamedTupleMember" :
                                                                                                                                                                        (0, ts_1.isImportTypeNode)(this) ? "ImportTypeNode" :
                                                                                                                                                                            formatSyntaxKind(this.kind);
                            return "".concat(nodeHeader).concat(this.flags ? " (".concat(formatNodeFlags(this.flags), ")") : "");
                        }
                    },
                    __debugKind: { get: function () { return formatSyntaxKind(this.kind); } },
                    __debugNodeFlags: { get: function () { return formatNodeFlags(this.flags); } },
                    __debugModifierFlags: { get: function () { return formatModifierFlags((0, ts_1.getEffectiveModifierFlagsNoCache)(this)); } },
                    __debugTransformFlags: { get: function () { return formatTransformFlags(this.transformFlags); } },
                    __debugIsParseTreeNode: { get: function () { return (0, ts_1.isParseTreeNode)(this); } },
                    __debugEmitFlags: { get: function () { return formatEmitFlags((0, ts_1.getEmitFlags)(this)); } },
                    __debugGetText: {
                        value: function (includeTrivia) {
                            if ((0, ts_1.nodeIsSynthesized)(this))
                                return "";
                            // avoid recomputing
                            var text = weakNodeTextMap.get(this);
                            if (text === undefined) {
                                var parseNode = (0, ts_1.getParseTreeNode)(this);
                                var sourceFile = parseNode && (0, ts_1.getSourceFileOfNode)(parseNode);
                                text = sourceFile ? (0, ts_1.getSourceTextOfNodeFromSourceFile)(sourceFile, parseNode, includeTrivia) : "";
                                weakNodeTextMap.set(this, text);
                            }
                            return text;
                        }
                    }
                });
            }
        }
        isDebugInfoEnabled = true;
    }
    Debug.enableDebugInfo = enableDebugInfo;
    function formatVariance(varianceFlags) {
        var variance = varianceFlags & 7 /* VarianceFlags.VarianceMask */;
        var result = variance === 0 /* VarianceFlags.Invariant */ ? "in out" :
            variance === 3 /* VarianceFlags.Bivariant */ ? "[bivariant]" :
                variance === 2 /* VarianceFlags.Contravariant */ ? "in" :
                    variance === 1 /* VarianceFlags.Covariant */ ? "out" :
                        variance === 4 /* VarianceFlags.Independent */ ? "[independent]" : "";
        if (varianceFlags & 8 /* VarianceFlags.Unmeasurable */) {
            result += " (unmeasurable)";
        }
        else if (varianceFlags & 16 /* VarianceFlags.Unreliable */) {
            result += " (unreliable)";
        }
        return result;
    }
    Debug.formatVariance = formatVariance;
    var DebugTypeMapper = /** @class */ (function () {
        function DebugTypeMapper() {
        }
        DebugTypeMapper.prototype.__debugToString = function () {
            var _a;
            type(this);
            switch (this.kind) {
                case 3 /* TypeMapKind.Function */: return ((_a = this.debugInfo) === null || _a === void 0 ? void 0 : _a.call(this)) || "(function mapper)";
                case 0 /* TypeMapKind.Simple */: return "".concat(this.source.__debugTypeToString(), " -> ").concat(this.target.__debugTypeToString());
                case 1 /* TypeMapKind.Array */: return (0, ts_1.zipWith)(this.sources, this.targets || (0, ts_1.map)(this.sources, function () { return "any"; }), function (s, t) { return "".concat(s.__debugTypeToString(), " -> ").concat(typeof t === "string" ? t : t.__debugTypeToString()); }).join(", ");
                case 2 /* TypeMapKind.Deferred */: return (0, ts_1.zipWith)(this.sources, this.targets, function (s, t) { return "".concat(s.__debugTypeToString(), " -> ").concat(t().__debugTypeToString()); }).join(", ");
                case 5 /* TypeMapKind.Merged */:
                case 4 /* TypeMapKind.Composite */: return "m1: ".concat(this.mapper1.__debugToString().split("\n").join("\n    "), "\nm2: ").concat(this.mapper2.__debugToString().split("\n").join("\n    "));
                default: return assertNever(this);
            }
        };
        return DebugTypeMapper;
    }());
    Debug.DebugTypeMapper = DebugTypeMapper;
    function attachDebugPrototypeIfDebug(mapper) {
        if (Debug.isDebugging) {
            return Object.setPrototypeOf(mapper, DebugTypeMapper.prototype);
        }
        return mapper;
    }
    Debug.attachDebugPrototypeIfDebug = attachDebugPrototypeIfDebug;
    function printControlFlowGraph(flowNode) {
        return console.log(formatControlFlowGraph(flowNode));
    }
    Debug.printControlFlowGraph = printControlFlowGraph;
    function formatControlFlowGraph(flowNode) {
        var nextDebugFlowId = -1;
        function getDebugFlowNodeId(f) {
            if (!f.id) {
                f.id = nextDebugFlowId;
                nextDebugFlowId--;
            }
            return f.id;
        }
        var hasAntecedentFlags = 16 /* FlowFlags.Assignment */ |
            96 /* FlowFlags.Condition */ |
            128 /* FlowFlags.SwitchClause */ |
            256 /* FlowFlags.ArrayMutation */ |
            512 /* FlowFlags.Call */ |
            1024 /* FlowFlags.ReduceLabel */;
        var hasNodeFlags = 2 /* FlowFlags.Start */ |
            16 /* FlowFlags.Assignment */ |
            512 /* FlowFlags.Call */ |
            96 /* FlowFlags.Condition */ |
            256 /* FlowFlags.ArrayMutation */;
        var links = Object.create(/*o*/ null); // eslint-disable-line no-null/no-null
        var nodes = [];
        var edges = [];
        var root = buildGraphNode(flowNode, new Set());
        for (var _i = 0, nodes_1 = nodes; _i < nodes_1.length; _i++) {
            var node = nodes_1[_i];
            node.text = renderFlowNode(node.flowNode, node.circular);
            computeLevel(node);
        }
        var height = computeHeight(root);
        var columnWidths = computeColumnWidths(height);
        computeLanes(root, 0);
        return renderGraph();
        function isFlowSwitchClause(f) {
            return !!(f.flags & 128 /* FlowFlags.SwitchClause */);
        }
        function hasAntecedents(f) {
            return !!(f.flags & 12 /* FlowFlags.Label */) && !!f.antecedents;
        }
        function hasAntecedent(f) {
            return !!(f.flags & hasAntecedentFlags);
        }
        function hasNode(f) {
            return !!(f.flags & hasNodeFlags);
        }
        function getChildren(node) {
            var children = [];
            for (var _i = 0, _a = node.edges; _i < _a.length; _i++) {
                var edge = _a[_i];
                if (edge.source === node) {
                    children.push(edge.target);
                }
            }
            return children;
        }
        function getParents(node) {
            var parents = [];
            for (var _i = 0, _a = node.edges; _i < _a.length; _i++) {
                var edge = _a[_i];
                if (edge.target === node) {
                    parents.push(edge.source);
                }
            }
            return parents;
        }
        function buildGraphNode(flowNode, seen) {
            var id = getDebugFlowNodeId(flowNode);
            var graphNode = links[id];
            if (graphNode && seen.has(flowNode)) {
                graphNode.circular = true;
                graphNode = {
                    id: -1,
                    flowNode: flowNode,
                    edges: [],
                    text: "",
                    lane: -1,
                    endLane: -1,
                    level: -1,
                    circular: "circularity"
                };
                nodes.push(graphNode);
                return graphNode;
            }
            seen.add(flowNode);
            if (!graphNode) {
                links[id] = graphNode = { id: id, flowNode: flowNode, edges: [], text: "", lane: -1, endLane: -1, level: -1, circular: false };
                nodes.push(graphNode);
                if (hasAntecedents(flowNode)) {
                    for (var _i = 0, _a = flowNode.antecedents; _i < _a.length; _i++) {
                        var antecedent = _a[_i];
                        buildGraphEdge(graphNode, antecedent, seen);
                    }
                }
                else if (hasAntecedent(flowNode)) {
                    buildGraphEdge(graphNode, flowNode.antecedent, seen);
                }
            }
            seen.delete(flowNode);
            return graphNode;
        }
        function buildGraphEdge(source, antecedent, seen) {
            var target = buildGraphNode(antecedent, seen);
            var edge = { source: source, target: target };
            edges.push(edge);
            source.edges.push(edge);
            target.edges.push(edge);
        }
        function computeLevel(node) {
            if (node.level !== -1) {
                return node.level;
            }
            var level = 0;
            for (var _i = 0, _a = getParents(node); _i < _a.length; _i++) {
                var parent_1 = _a[_i];
                level = Math.max(level, computeLevel(parent_1) + 1);
            }
            return node.level = level;
        }
        function computeHeight(node) {
            var height = 0;
            for (var _i = 0, _a = getChildren(node); _i < _a.length; _i++) {
                var child = _a[_i];
                height = Math.max(height, computeHeight(child));
            }
            return height + 1;
        }
        function computeColumnWidths(height) {
            var columns = fill(Array(height), 0);
            for (var _i = 0, nodes_2 = nodes; _i < nodes_2.length; _i++) {
                var node = nodes_2[_i];
                columns[node.level] = Math.max(columns[node.level], node.text.length);
            }
            return columns;
        }
        function computeLanes(node, lane) {
            if (node.lane === -1) {
                node.lane = lane;
                node.endLane = lane;
                var children = getChildren(node);
                for (var i = 0; i < children.length; i++) {
                    if (i > 0)
                        lane++;
                    var child = children[i];
                    computeLanes(child, lane);
                    if (child.endLane > node.endLane) {
                        lane = child.endLane;
                    }
                }
                node.endLane = lane;
            }
        }
        function getHeader(flags) {
            if (flags & 2 /* FlowFlags.Start */)
                return "Start";
            if (flags & 4 /* FlowFlags.BranchLabel */)
                return "Branch";
            if (flags & 8 /* FlowFlags.LoopLabel */)
                return "Loop";
            if (flags & 16 /* FlowFlags.Assignment */)
                return "Assignment";
            if (flags & 32 /* FlowFlags.TrueCondition */)
                return "True";
            if (flags & 64 /* FlowFlags.FalseCondition */)
                return "False";
            if (flags & 128 /* FlowFlags.SwitchClause */)
                return "SwitchClause";
            if (flags & 256 /* FlowFlags.ArrayMutation */)
                return "ArrayMutation";
            if (flags & 512 /* FlowFlags.Call */)
                return "Call";
            if (flags & 1024 /* FlowFlags.ReduceLabel */)
                return "ReduceLabel";
            if (flags & 1 /* FlowFlags.Unreachable */)
                return "Unreachable";
            throw new Error();
        }
        function getNodeText(node) {
            var sourceFile = (0, ts_1.getSourceFileOfNode)(node);
            return (0, ts_1.getSourceTextOfNodeFromSourceFile)(sourceFile, node, /*includeTrivia*/ false);
        }
        function renderFlowNode(flowNode, circular) {
            var text = getHeader(flowNode.flags);
            if (circular) {
                text = "".concat(text, "#").concat(getDebugFlowNodeId(flowNode));
            }
            if (hasNode(flowNode)) {
                if (flowNode.node) {
                    text += " (".concat(getNodeText(flowNode.node), ")");
                }
            }
            else if (isFlowSwitchClause(flowNode)) {
                var clauses = [];
                for (var i = flowNode.clauseStart; i < flowNode.clauseEnd; i++) {
                    var clause = flowNode.switchStatement.caseBlock.clauses[i];
                    if ((0, ts_1.isDefaultClause)(clause)) {
                        clauses.push("default");
                    }
                    else {
                        clauses.push(getNodeText(clause.expression));
                    }
                }
                text += " (".concat(clauses.join(", "), ")");
            }
            return circular === "circularity" ? "Circular(".concat(text, ")") : text;
        }
        function renderGraph() {
            var columnCount = columnWidths.length;
            var laneCount = nodes.reduce(function (x, n) { return Math.max(x, n.lane); }, 0) + 1;
            var lanes = fill(Array(laneCount), "");
            var grid = columnWidths.map(function () { return Array(laneCount); });
            var connectors = columnWidths.map(function () { return fill(Array(laneCount), 0); });
            // build connectors
            for (var _i = 0, nodes_3 = nodes; _i < nodes_3.length; _i++) {
                var node = nodes_3[_i];
                grid[node.level][node.lane] = node;
                var children = getChildren(node);
                for (var i = 0; i < children.length; i++) {
                    var child = children[i];
                    var connector = 8 /* Connection.Right */;
                    if (child.lane === node.lane)
                        connector |= 4 /* Connection.Left */;
                    if (i > 0)
                        connector |= 1 /* Connection.Up */;
                    if (i < children.length - 1)
                        connector |= 2 /* Connection.Down */;
                    connectors[node.level][child.lane] |= connector;
                }
                if (children.length === 0) {
                    connectors[node.level][node.lane] |= 16 /* Connection.NoChildren */;
                }
                var parents = getParents(node);
                for (var i = 0; i < parents.length; i++) {
                    var parent_2 = parents[i];
                    var connector = 4 /* Connection.Left */;
                    if (i > 0)
                        connector |= 1 /* Connection.Up */;
                    if (i < parents.length - 1)
                        connector |= 2 /* Connection.Down */;
                    connectors[node.level - 1][parent_2.lane] |= connector;
                }
            }
            // fill in missing connectors
            for (var column = 0; column < columnCount; column++) {
                for (var lane = 0; lane < laneCount; lane++) {
                    var left = column > 0 ? connectors[column - 1][lane] : 0;
                    var above = lane > 0 ? connectors[column][lane - 1] : 0;
                    var connector = connectors[column][lane];
                    if (!connector) {
                        if (left & 8 /* Connection.Right */)
                            connector |= 12 /* Connection.LeftRight */;
                        if (above & 2 /* Connection.Down */)
                            connector |= 3 /* Connection.UpDown */;
                        connectors[column][lane] = connector;
                    }
                }
            }
            for (var column = 0; column < columnCount; column++) {
                for (var lane = 0; lane < lanes.length; lane++) {
                    var connector = connectors[column][lane];
                    var fill_1 = connector & 4 /* Connection.Left */ ? "\u2500" /* BoxCharacter.lr */ : " ";
                    var node = grid[column][lane];
                    if (!node) {
                        if (column < columnCount - 1) {
                            writeLane(lane, repeat(fill_1, columnWidths[column] + 1));
                        }
                    }
                    else {
                        writeLane(lane, node.text);
                        if (column < columnCount - 1) {
                            writeLane(lane, " ");
                            writeLane(lane, repeat(fill_1, columnWidths[column] - node.text.length));
                        }
                    }
                    writeLane(lane, getBoxCharacter(connector));
                    writeLane(lane, connector & 8 /* Connection.Right */ && column < columnCount - 1 && !grid[column + 1][lane] ? "\u2500" /* BoxCharacter.lr */ : " ");
                }
            }
            return "\n".concat(lanes.join("\n"), "\n");
            function writeLane(lane, text) {
                lanes[lane] += text;
            }
        }
        function getBoxCharacter(connector) {
            switch (connector) {
                case 3 /* Connection.UpDown */: return "\u2502" /* BoxCharacter.ud */;
                case 12 /* Connection.LeftRight */: return "\u2500" /* BoxCharacter.lr */;
                case 5 /* Connection.UpLeft */: return "\u256F" /* BoxCharacter.ul */;
                case 9 /* Connection.UpRight */: return "\u2570" /* BoxCharacter.ur */;
                case 6 /* Connection.DownLeft */: return "\u256E" /* BoxCharacter.dl */;
                case 10 /* Connection.DownRight */: return "\u256D" /* BoxCharacter.dr */;
                case 7 /* Connection.UpDownLeft */: return "\u2524" /* BoxCharacter.udl */;
                case 11 /* Connection.UpDownRight */: return "\u251C" /* BoxCharacter.udr */;
                case 13 /* Connection.UpLeftRight */: return "\u2534" /* BoxCharacter.ulr */;
                case 14 /* Connection.DownLeftRight */: return "\u252C" /* BoxCharacter.dlr */;
                case 15 /* Connection.UpDownLeftRight */: return "\u256B" /* BoxCharacter.udlr */;
            }
            return " ";
        }
        function fill(array, value) {
            if (array.fill) {
                array.fill(value);
            }
            else {
                for (var i = 0; i < array.length; i++) {
                    array[i] = value;
                }
            }
            return array;
        }
        function repeat(ch, length) {
            if (ch.repeat) {
                return length > 0 ? ch.repeat(length) : "";
            }
            var s = "";
            while (s.length < length) {
                s += ch;
            }
            return s;
        }
    }
    Debug.formatControlFlowGraph = formatControlFlowGraph;
})(Debug || (exports.Debug = Debug = {}));
