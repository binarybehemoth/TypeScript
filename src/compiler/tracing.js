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
Object.defineProperty(exports, "__esModule", { value: true });
exports.dumpTracingLegend = exports.startTracing = exports.tracingEnabled = exports.tracing = void 0;
var ts_1 = require("./_namespaces/ts");
var performance = require("./_namespaces/ts.performance");
// enable the above using startTracing()
/**
 * Do not use this directly; instead @see {tracing}.
 * @internal
 */
var tracingEnabled;
(function (tracingEnabled) {
    var fs;
    var traceCount = 0;
    var traceFd = 0;
    var mode;
    var typeCatalog = []; // NB: id is index + 1
    var legendPath;
    var legend = [];
    /** Starts tracing for the given project. */
    function startTracing(tracingMode, traceDir, configFilePath) {
        ts_1.Debug.assert(!exports.tracing, "Tracing already started");
        if (fs === undefined) {
            try {
                fs = require("fs");
            }
            catch (e) {
                throw new Error("tracing requires having fs\n(original error: ".concat(e.message || e, ")"));
            }
        }
        mode = tracingMode;
        typeCatalog.length = 0;
        if (legendPath === undefined) {
            legendPath = (0, ts_1.combinePaths)(traceDir, "legend.json");
        }
        // Note that writing will fail later on if it exists and is not a directory
        if (!fs.existsSync(traceDir)) {
            fs.mkdirSync(traceDir, { recursive: true });
        }
        var countPart = mode === "build" ? ".".concat(process.pid, "-").concat(++traceCount)
            : mode === "server" ? ".".concat(process.pid)
                : "";
        var tracePath = (0, ts_1.combinePaths)(traceDir, "trace".concat(countPart, ".json"));
        var typesPath = (0, ts_1.combinePaths)(traceDir, "types".concat(countPart, ".json"));
        legend.push({
            configFilePath: configFilePath,
            tracePath: tracePath,
            typesPath: typesPath,
        });
        traceFd = fs.openSync(tracePath, "w");
        exports.tracing = tracingEnabled; // only when traceFd is properly set
        // Start with a prefix that contains some metadata that the devtools profiler expects (also avoids a warning on import)
        var meta = { cat: "__metadata", ph: "M", ts: 1000 * (0, ts_1.timestamp)(), pid: 1, tid: 1 };
        fs.writeSync(traceFd, "[\n"
            + [__assign({ name: "process_name", args: { name: "tsc" } }, meta), __assign({ name: "thread_name", args: { name: "Main" } }, meta), __assign(__assign({ name: "TracingStartedInBrowser" }, meta), { cat: "disabled-by-default-devtools.timeline" })]
                .map(function (v) { return JSON.stringify(v); }).join(",\n"));
    }
    tracingEnabled.startTracing = startTracing;
    /** Stops tracing for the in-progress project and dumps the type catalog. */
    function stopTracing() {
        ts_1.Debug.assert(exports.tracing, "Tracing is not in progress");
        ts_1.Debug.assert(!!typeCatalog.length === (mode !== "server")); // Have a type catalog iff not in server mode
        fs.writeSync(traceFd, "\n]\n");
        fs.closeSync(traceFd);
        exports.tracing = undefined;
        if (typeCatalog.length) {
            dumpTypes(typeCatalog);
        }
        else {
            // We pre-computed this path for convenience, but clear it
            // now that the file won't be created.
            legend[legend.length - 1].typesPath = undefined;
        }
    }
    tracingEnabled.stopTracing = stopTracing;
    function recordType(type) {
        if (mode !== "server") {
            typeCatalog.push(type);
        }
    }
    tracingEnabled.recordType = recordType;
    function instant(phase, name, args) {
        writeEvent("I", phase, name, args, "\"s\":\"g\"");
    }
    tracingEnabled.instant = instant;
    var eventStack = [];
    /**
     * @param separateBeginAndEnd - used for special cases where we need the trace point even if the event
     * never terminates (typically for reducing a scenario too big to trace to one that can be completed).
     * In the future we might implement an exit handler to dump unfinished events which would deprecate
     * these operations.
     */
    function push(phase, name, args, separateBeginAndEnd) {
        if (separateBeginAndEnd === void 0) { separateBeginAndEnd = false; }
        if (separateBeginAndEnd) {
            writeEvent("B", phase, name, args);
        }
        eventStack.push({ phase: phase, name: name, args: args, time: 1000 * (0, ts_1.timestamp)(), separateBeginAndEnd: separateBeginAndEnd });
    }
    tracingEnabled.push = push;
    function pop(results) {
        ts_1.Debug.assert(eventStack.length > 0);
        writeStackEvent(eventStack.length - 1, 1000 * (0, ts_1.timestamp)(), results);
        eventStack.length--;
    }
    tracingEnabled.pop = pop;
    function popAll() {
        var endTime = 1000 * (0, ts_1.timestamp)();
        for (var i = eventStack.length - 1; i >= 0; i--) {
            writeStackEvent(i, endTime);
        }
        eventStack.length = 0;
    }
    tracingEnabled.popAll = popAll;
    // sample every 10ms
    var sampleInterval = 1000 * 10;
    function writeStackEvent(index, endTime, results) {
        var _a = eventStack[index], phase = _a.phase, name = _a.name, args = _a.args, time = _a.time, separateBeginAndEnd = _a.separateBeginAndEnd;
        if (separateBeginAndEnd) {
            ts_1.Debug.assert(!results, "`results` are not supported for events with `separateBeginAndEnd`");
            writeEvent("E", phase, name, args, /*extras*/ undefined, endTime);
        }
        // test if [time,endTime) straddles a sampling point
        else if (sampleInterval - (time % sampleInterval) <= endTime - time) {
            writeEvent("X", phase, name, __assign(__assign({}, args), { results: results }), "\"dur\":".concat(endTime - time), time);
        }
    }
    function writeEvent(eventType, phase, name, args, extras, time) {
        if (time === void 0) { time = 1000 * (0, ts_1.timestamp)(); }
        // In server mode, there's no easy way to dump type information, so we drop events that would require it.
        if (mode === "server" && phase === "checkTypes" /* Phase.CheckTypes */)
            return;
        performance.mark("beginTracing");
        fs.writeSync(traceFd, ",\n{\"pid\":1,\"tid\":1,\"ph\":\"".concat(eventType, "\",\"cat\":\"").concat(phase, "\",\"ts\":").concat(time, ",\"name\":\"").concat(name, "\""));
        if (extras)
            fs.writeSync(traceFd, ",".concat(extras));
        if (args)
            fs.writeSync(traceFd, ",\"args\":".concat(JSON.stringify(args)));
        fs.writeSync(traceFd, "}");
        performance.mark("endTracing");
        performance.measure("Tracing", "beginTracing", "endTracing");
    }
    function getLocation(node) {
        var file = (0, ts_1.getSourceFileOfNode)(node);
        return !file
            ? undefined
            : {
                path: file.path,
                start: indexFromOne((0, ts_1.getLineAndCharacterOfPosition)(file, node.pos)),
                end: indexFromOne((0, ts_1.getLineAndCharacterOfPosition)(file, node.end)),
            };
        function indexFromOne(lc) {
            return {
                line: lc.line + 1,
                character: lc.character + 1,
            };
        }
    }
    function dumpTypes(types) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x;
        performance.mark("beginDumpTypes");
        var typesPath = legend[legend.length - 1].typesPath;
        var typesFd = fs.openSync(typesPath, "w");
        var recursionIdentityMap = new Map();
        // Cleverness: no line break here so that the type ID will match the line number
        fs.writeSync(typesFd, "[");
        var numTypes = types.length;
        for (var i = 0; i < numTypes; i++) {
            var type = types[i];
            var objectFlags = type.objectFlags;
            var symbol = (_a = type.aliasSymbol) !== null && _a !== void 0 ? _a : type.symbol;
            // It's slow to compute the display text, so skip it unless it's really valuable (or cheap)
            var display = void 0;
            if ((objectFlags & 16 /* ObjectFlags.Anonymous */) | (type.flags & 2944 /* TypeFlags.Literal */)) {
                try {
                    display = (_b = type.checker) === null || _b === void 0 ? void 0 : _b.typeToString(type);
                }
                catch (_y) {
                    display = undefined;
                }
            }
            var indexedAccessProperties = {};
            if (type.flags & 8388608 /* TypeFlags.IndexedAccess */) {
                var indexedAccessType = type;
                indexedAccessProperties = {
                    indexedAccessObjectType: (_c = indexedAccessType.objectType) === null || _c === void 0 ? void 0 : _c.id,
                    indexedAccessIndexType: (_d = indexedAccessType.indexType) === null || _d === void 0 ? void 0 : _d.id,
                };
            }
            var referenceProperties = {};
            if (objectFlags & 4 /* ObjectFlags.Reference */) {
                var referenceType = type;
                referenceProperties = {
                    instantiatedType: (_e = referenceType.target) === null || _e === void 0 ? void 0 : _e.id,
                    typeArguments: (_f = referenceType.resolvedTypeArguments) === null || _f === void 0 ? void 0 : _f.map(function (t) { return t.id; }),
                    referenceLocation: getLocation(referenceType.node),
                };
            }
            var conditionalProperties = {};
            if (type.flags & 16777216 /* TypeFlags.Conditional */) {
                var conditionalType = type;
                conditionalProperties = {
                    conditionalCheckType: (_g = conditionalType.checkType) === null || _g === void 0 ? void 0 : _g.id,
                    conditionalExtendsType: (_h = conditionalType.extendsType) === null || _h === void 0 ? void 0 : _h.id,
                    conditionalTrueType: (_k = (_j = conditionalType.resolvedTrueType) === null || _j === void 0 ? void 0 : _j.id) !== null && _k !== void 0 ? _k : -1,
                    conditionalFalseType: (_m = (_l = conditionalType.resolvedFalseType) === null || _l === void 0 ? void 0 : _l.id) !== null && _m !== void 0 ? _m : -1,
                };
            }
            var substitutionProperties = {};
            if (type.flags & 33554432 /* TypeFlags.Substitution */) {
                var substitutionType = type;
                substitutionProperties = {
                    substitutionBaseType: (_o = substitutionType.baseType) === null || _o === void 0 ? void 0 : _o.id,
                    constraintType: (_p = substitutionType.constraint) === null || _p === void 0 ? void 0 : _p.id,
                };
            }
            var reverseMappedProperties = {};
            if (objectFlags & 1024 /* ObjectFlags.ReverseMapped */) {
                var reverseMappedType = type;
                reverseMappedProperties = {
                    reverseMappedSourceType: (_q = reverseMappedType.source) === null || _q === void 0 ? void 0 : _q.id,
                    reverseMappedMappedType: (_r = reverseMappedType.mappedType) === null || _r === void 0 ? void 0 : _r.id,
                    reverseMappedConstraintType: (_s = reverseMappedType.constraintType) === null || _s === void 0 ? void 0 : _s.id,
                };
            }
            var evolvingArrayProperties = {};
            if (objectFlags & 256 /* ObjectFlags.EvolvingArray */) {
                var evolvingArrayType = type;
                evolvingArrayProperties = {
                    evolvingArrayElementType: evolvingArrayType.elementType.id,
                    evolvingArrayFinalType: (_t = evolvingArrayType.finalArrayType) === null || _t === void 0 ? void 0 : _t.id,
                };
            }
            // We can't print out an arbitrary object, so just assign each one a unique number.
            // Don't call it an "id" so people don't treat it as a type id.
            var recursionToken = void 0;
            var recursionIdentity = type.checker.getRecursionIdentity(type);
            if (recursionIdentity) {
                recursionToken = recursionIdentityMap.get(recursionIdentity);
                if (!recursionToken) {
                    recursionToken = recursionIdentityMap.size;
                    recursionIdentityMap.set(recursionIdentity, recursionToken);
                }
            }
            var descriptor = __assign(__assign(__assign(__assign(__assign(__assign(__assign({ id: type.id, intrinsicName: type.intrinsicName, symbolName: (symbol === null || symbol === void 0 ? void 0 : symbol.escapedName) && (0, ts_1.unescapeLeadingUnderscores)(symbol.escapedName), recursionId: recursionToken, isTuple: objectFlags & 8 /* ObjectFlags.Tuple */ ? true : undefined, unionTypes: (type.flags & 1048576 /* TypeFlags.Union */) ? (_u = type.types) === null || _u === void 0 ? void 0 : _u.map(function (t) { return t.id; }) : undefined, intersectionTypes: (type.flags & 2097152 /* TypeFlags.Intersection */) ? type.types.map(function (t) { return t.id; }) : undefined, aliasTypeArguments: (_v = type.aliasTypeArguments) === null || _v === void 0 ? void 0 : _v.map(function (t) { return t.id; }), keyofType: (type.flags & 4194304 /* TypeFlags.Index */) ? (_w = type.type) === null || _w === void 0 ? void 0 : _w.id : undefined }, indexedAccessProperties), referenceProperties), conditionalProperties), substitutionProperties), reverseMappedProperties), evolvingArrayProperties), { destructuringPattern: getLocation(type.pattern), firstDeclaration: getLocation((_x = symbol === null || symbol === void 0 ? void 0 : symbol.declarations) === null || _x === void 0 ? void 0 : _x[0]), flags: ts_1.Debug.formatTypeFlags(type.flags).split("|"), display: display });
            fs.writeSync(typesFd, JSON.stringify(descriptor));
            if (i < numTypes - 1) {
                fs.writeSync(typesFd, ",\n");
            }
        }
        fs.writeSync(typesFd, "]\n");
        fs.closeSync(typesFd);
        performance.mark("endDumpTypes");
        performance.measure("Dump types", "beginDumpTypes", "endDumpTypes");
    }
    function dumpLegend() {
        if (!legendPath) {
            return;
        }
        fs.writeFileSync(legendPath, JSON.stringify(legend));
    }
    tracingEnabled.dumpLegend = dumpLegend;
})(tracingEnabled || (exports.tracingEnabled = tracingEnabled = {}));
// define after tracingEnabled is initialized
/** @internal */
exports.startTracing = tracingEnabled.startTracing;
/** @internal */
exports.dumpTracingLegend = tracingEnabled.dumpLegend;
