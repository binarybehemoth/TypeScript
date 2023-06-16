"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.commentPragmas = exports.ModuleKind = exports.PollingWatchKind = exports.WatchDirectoryKind = exports.WatchFileKind = exports.ModuleDetectionKind = exports.ModuleResolutionKind = exports.diagnosticCategoryName = exports.DiagnosticCategory = exports.TypeReferenceSerializationKind = exports.ExitStatus = exports.FileIncludeKind = exports.OperationCanceledException = void 0;
var OperationCanceledException = /** @class */ (function () {
    function OperationCanceledException() {
    }
    return OperationCanceledException;
}());
exports.OperationCanceledException = OperationCanceledException;
/** @internal */
var FileIncludeKind;
(function (FileIncludeKind) {
    FileIncludeKind[FileIncludeKind["RootFile"] = 0] = "RootFile";
    FileIncludeKind[FileIncludeKind["SourceFromProjectReference"] = 1] = "SourceFromProjectReference";
    FileIncludeKind[FileIncludeKind["OutputFromProjectReference"] = 2] = "OutputFromProjectReference";
    FileIncludeKind[FileIncludeKind["Import"] = 3] = "Import";
    FileIncludeKind[FileIncludeKind["ReferenceFile"] = 4] = "ReferenceFile";
    FileIncludeKind[FileIncludeKind["TypeReferenceDirective"] = 5] = "TypeReferenceDirective";
    FileIncludeKind[FileIncludeKind["LibFile"] = 6] = "LibFile";
    FileIncludeKind[FileIncludeKind["LibReferenceDirective"] = 7] = "LibReferenceDirective";
    FileIncludeKind[FileIncludeKind["AutomaticTypeDirectiveFile"] = 8] = "AutomaticTypeDirectiveFile";
})(FileIncludeKind || (exports.FileIncludeKind = FileIncludeKind = {}));
/** Return code used by getEmitOutput function to indicate status of the function */
var ExitStatus;
(function (ExitStatus) {
    // Compiler ran successfully.  Either this was a simple do-nothing compilation (for example,
    // when -version or -help was provided, or this was a normal compilation, no diagnostics
    // were produced, and all outputs were generated successfully.
    ExitStatus[ExitStatus["Success"] = 0] = "Success";
    // Diagnostics were produced and because of them no code was generated.
    ExitStatus[ExitStatus["DiagnosticsPresent_OutputsSkipped"] = 1] = "DiagnosticsPresent_OutputsSkipped";
    // Diagnostics were produced and outputs were generated in spite of them.
    ExitStatus[ExitStatus["DiagnosticsPresent_OutputsGenerated"] = 2] = "DiagnosticsPresent_OutputsGenerated";
    // When build skipped because passed in project is invalid
    ExitStatus[ExitStatus["InvalidProject_OutputsSkipped"] = 3] = "InvalidProject_OutputsSkipped";
    // When build is skipped because project references form cycle
    ExitStatus[ExitStatus["ProjectReferenceCycle_OutputsSkipped"] = 4] = "ProjectReferenceCycle_OutputsSkipped";
})(ExitStatus || (exports.ExitStatus = ExitStatus = {}));
/**
 * Indicates how to serialize the name for a TypeReferenceNode when emitting decorator metadata
 *
 * @internal
 */
var TypeReferenceSerializationKind;
(function (TypeReferenceSerializationKind) {
    // The TypeReferenceNode could not be resolved.
    // The type name should be emitted using a safe fallback.
    TypeReferenceSerializationKind[TypeReferenceSerializationKind["Unknown"] = 0] = "Unknown";
    // The TypeReferenceNode resolves to a type with a constructor
    // function that can be reached at runtime (e.g. a `class`
    // declaration or a `var` declaration for the static side
    // of a type, such as the global `Promise` type in lib.d.ts).
    TypeReferenceSerializationKind[TypeReferenceSerializationKind["TypeWithConstructSignatureAndValue"] = 1] = "TypeWithConstructSignatureAndValue";
    // The TypeReferenceNode resolves to a Void-like, Nullable, or Never type.
    TypeReferenceSerializationKind[TypeReferenceSerializationKind["VoidNullableOrNeverType"] = 2] = "VoidNullableOrNeverType";
    // The TypeReferenceNode resolves to a Number-like type.
    TypeReferenceSerializationKind[TypeReferenceSerializationKind["NumberLikeType"] = 3] = "NumberLikeType";
    // The TypeReferenceNode resolves to a BigInt-like type.
    TypeReferenceSerializationKind[TypeReferenceSerializationKind["BigIntLikeType"] = 4] = "BigIntLikeType";
    // The TypeReferenceNode resolves to a String-like type.
    TypeReferenceSerializationKind[TypeReferenceSerializationKind["StringLikeType"] = 5] = "StringLikeType";
    // The TypeReferenceNode resolves to a Boolean-like type.
    TypeReferenceSerializationKind[TypeReferenceSerializationKind["BooleanType"] = 6] = "BooleanType";
    // The TypeReferenceNode resolves to an Array-like type.
    TypeReferenceSerializationKind[TypeReferenceSerializationKind["ArrayLikeType"] = 7] = "ArrayLikeType";
    // The TypeReferenceNode resolves to the ESSymbol type.
    TypeReferenceSerializationKind[TypeReferenceSerializationKind["ESSymbolType"] = 8] = "ESSymbolType";
    // The TypeReferenceNode resolved to the global Promise constructor symbol.
    TypeReferenceSerializationKind[TypeReferenceSerializationKind["Promise"] = 9] = "Promise";
    // The TypeReferenceNode resolves to a Function type or a type with call signatures.
    TypeReferenceSerializationKind[TypeReferenceSerializationKind["TypeWithCallSignature"] = 10] = "TypeWithCallSignature";
    // The TypeReferenceNode resolves to any other type.
    TypeReferenceSerializationKind[TypeReferenceSerializationKind["ObjectType"] = 11] = "ObjectType";
})(TypeReferenceSerializationKind || (exports.TypeReferenceSerializationKind = TypeReferenceSerializationKind = {}));
var DiagnosticCategory;
(function (DiagnosticCategory) {
    DiagnosticCategory[DiagnosticCategory["Warning"] = 0] = "Warning";
    DiagnosticCategory[DiagnosticCategory["Error"] = 1] = "Error";
    DiagnosticCategory[DiagnosticCategory["Suggestion"] = 2] = "Suggestion";
    DiagnosticCategory[DiagnosticCategory["Message"] = 3] = "Message";
})(DiagnosticCategory || (exports.DiagnosticCategory = DiagnosticCategory = {}));
/** @internal */
function diagnosticCategoryName(d, lowerCase) {
    if (lowerCase === void 0) { lowerCase = true; }
    var name = DiagnosticCategory[d.category];
    return lowerCase ? name.toLowerCase() : name;
}
exports.diagnosticCategoryName = diagnosticCategoryName;
var ModuleResolutionKind;
(function (ModuleResolutionKind) {
    ModuleResolutionKind[ModuleResolutionKind["Classic"] = 1] = "Classic";
    /**
     * @deprecated
     * `NodeJs` was renamed to `Node10` to better reflect the version of Node that it targets.
     * Use the new name or consider switching to a modern module resolution target.
     */
    ModuleResolutionKind[ModuleResolutionKind["NodeJs"] = 2] = "NodeJs";
    ModuleResolutionKind[ModuleResolutionKind["Node10"] = 2] = "Node10";
    // Starting with node12, node's module resolver has significant departures from traditional cjs resolution
    // to better support ecmascript modules and their use within node - however more features are still being added.
    // TypeScript's Node ESM support was introduced after Node 12 went end-of-life, and Node 14 is the earliest stable
    // version that supports both pattern trailers - *but*, Node 16 is the first version that also supports ECMASCript 2022.
    // In turn, we offer both a `NodeNext` moving resolution target, and a `Node16` version-anchored resolution target
    ModuleResolutionKind[ModuleResolutionKind["Node16"] = 3] = "Node16";
    ModuleResolutionKind[ModuleResolutionKind["NodeNext"] = 99] = "NodeNext";
    ModuleResolutionKind[ModuleResolutionKind["Bundler"] = 100] = "Bundler";
})(ModuleResolutionKind || (exports.ModuleResolutionKind = ModuleResolutionKind = {}));
var ModuleDetectionKind;
(function (ModuleDetectionKind) {
    /**
     * Files with imports, exports and/or import.meta are considered modules
     */
    ModuleDetectionKind[ModuleDetectionKind["Legacy"] = 1] = "Legacy";
    /**
     * Legacy, but also files with jsx under react-jsx or react-jsxdev and esm mode files under moduleResolution: node16+
     */
    ModuleDetectionKind[ModuleDetectionKind["Auto"] = 2] = "Auto";
    /**
     * Consider all non-declaration files modules, regardless of present syntax
     */
    ModuleDetectionKind[ModuleDetectionKind["Force"] = 3] = "Force";
})(ModuleDetectionKind || (exports.ModuleDetectionKind = ModuleDetectionKind = {}));
var WatchFileKind;
(function (WatchFileKind) {
    WatchFileKind[WatchFileKind["FixedPollingInterval"] = 0] = "FixedPollingInterval";
    WatchFileKind[WatchFileKind["PriorityPollingInterval"] = 1] = "PriorityPollingInterval";
    WatchFileKind[WatchFileKind["DynamicPriorityPolling"] = 2] = "DynamicPriorityPolling";
    WatchFileKind[WatchFileKind["FixedChunkSizePolling"] = 3] = "FixedChunkSizePolling";
    WatchFileKind[WatchFileKind["UseFsEvents"] = 4] = "UseFsEvents";
    WatchFileKind[WatchFileKind["UseFsEventsOnParentDirectory"] = 5] = "UseFsEventsOnParentDirectory";
})(WatchFileKind || (exports.WatchFileKind = WatchFileKind = {}));
var WatchDirectoryKind;
(function (WatchDirectoryKind) {
    WatchDirectoryKind[WatchDirectoryKind["UseFsEvents"] = 0] = "UseFsEvents";
    WatchDirectoryKind[WatchDirectoryKind["FixedPollingInterval"] = 1] = "FixedPollingInterval";
    WatchDirectoryKind[WatchDirectoryKind["DynamicPriorityPolling"] = 2] = "DynamicPriorityPolling";
    WatchDirectoryKind[WatchDirectoryKind["FixedChunkSizePolling"] = 3] = "FixedChunkSizePolling";
})(WatchDirectoryKind || (exports.WatchDirectoryKind = WatchDirectoryKind = {}));
var PollingWatchKind;
(function (PollingWatchKind) {
    PollingWatchKind[PollingWatchKind["FixedInterval"] = 0] = "FixedInterval";
    PollingWatchKind[PollingWatchKind["PriorityInterval"] = 1] = "PriorityInterval";
    PollingWatchKind[PollingWatchKind["DynamicPriority"] = 2] = "DynamicPriority";
    PollingWatchKind[PollingWatchKind["FixedChunkSize"] = 3] = "FixedChunkSize";
})(PollingWatchKind || (exports.PollingWatchKind = PollingWatchKind = {}));
var ModuleKind;
(function (ModuleKind) {
    ModuleKind[ModuleKind["None"] = 0] = "None";
    ModuleKind[ModuleKind["CommonJS"] = 1] = "CommonJS";
    ModuleKind[ModuleKind["AMD"] = 2] = "AMD";
    ModuleKind[ModuleKind["UMD"] = 3] = "UMD";
    ModuleKind[ModuleKind["System"] = 4] = "System";
    // NOTE: ES module kinds should be contiguous to more easily check whether a module kind is *any* ES module kind.
    //       Non-ES module kinds should not come between ES2015 (the earliest ES module kind) and ESNext (the last ES
    //       module kind).
    ModuleKind[ModuleKind["ES2015"] = 5] = "ES2015";
    ModuleKind[ModuleKind["ES2020"] = 6] = "ES2020";
    ModuleKind[ModuleKind["ES2022"] = 7] = "ES2022";
    ModuleKind[ModuleKind["ESNext"] = 99] = "ESNext";
    // Node16+ is an amalgam of commonjs (albeit updated) and es2022+, and represents a distinct module system from es2020/esnext
    ModuleKind[ModuleKind["Node16"] = 100] = "Node16";
    ModuleKind[ModuleKind["NodeNext"] = 199] = "NodeNext";
})(ModuleKind || (exports.ModuleKind = ModuleKind = {}));
// While not strictly a type, this is here because `PragmaMap` needs to be here to be used with `SourceFile`, and we don't
//  fancy effectively defining it twice, once in value-space and once in type-space
/** @internal */
exports.commentPragmas = {
    "reference": {
        args: [
            { name: "types", optional: true, captureSpan: true },
            { name: "lib", optional: true, captureSpan: true },
            { name: "path", optional: true, captureSpan: true },
            { name: "no-default-lib", optional: true },
            { name: "resolution-mode", optional: true }
        ],
        kind: 1 /* PragmaKindFlags.TripleSlashXML */
    },
    "amd-dependency": {
        args: [{ name: "path" }, { name: "name", optional: true }],
        kind: 1 /* PragmaKindFlags.TripleSlashXML */
    },
    "amd-module": {
        args: [{ name: "name" }],
        kind: 1 /* PragmaKindFlags.TripleSlashXML */
    },
    "ts-check": {
        kind: 2 /* PragmaKindFlags.SingleLine */
    },
    "ts-nocheck": {
        kind: 2 /* PragmaKindFlags.SingleLine */
    },
    "jsx": {
        args: [{ name: "factory" }],
        kind: 4 /* PragmaKindFlags.MultiLine */
    },
    "jsxfrag": {
        args: [{ name: "factory" }],
        kind: 4 /* PragmaKindFlags.MultiLine */
    },
    "jsximportsource": {
        args: [{ name: "factory" }],
        kind: 4 /* PragmaKindFlags.MultiLine */
    },
    "jsxruntime": {
        args: [{ name: "factory" }],
        kind: 4 /* PragmaKindFlags.MultiLine */
    },
};
